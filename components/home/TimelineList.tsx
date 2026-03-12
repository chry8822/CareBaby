import { useState, useCallback, useRef, useEffect, useMemo, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import type { TimelineItem } from '../../hooks/useHomeData';
import { SwipeableRow } from '../ui/SwipeableRow';
import { TimelineItemCard } from './TimelineItemCard';
import { EditRecordSheet } from './EditRecordSheet';
import { useRecordStore } from '../../stores/recordStore';
import { useBabyStore } from '../../stores/babyStore';
import { useAuthStore } from '../../stores/authStore';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';

interface TimelineListProps {
  timeline: TimelineItem[];
  hasMoreTimeline?: boolean;
  onRefresh?: () => Promise<void>;
  onLoadMore?: () => Promise<void>;
  closeRowsRef?: React.MutableRefObject<(() => void) | null>;
}

// ─── 헬퍼 ──────────────────────────────────────────────────────────────────────

function getDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (isSameDay(date, today)) return '오늘';
  if (isSameDay(date, yesterday)) return '어제';
  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
}

function formatSleepDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}시간 ${m}분`;
  if (h > 0) return `${h}시간`;
  return `${m}분`;
}

interface DayGroup {
  label: string;
  items: TimelineItem[];
  feedingCount: number;
  feedingTotalMl: number;
  diaperCount: number;
  sleepTotalSeconds: number;
  mealCount: number;
}

function groupByDate(timeline: TimelineItem[]): DayGroup[] {
  const map = new Map<string, DayGroup>();
  const order: string[] = [];

  for (const item of timeline) {
    const label = getDateLabel(item.time);
    if (!map.has(label)) {
      map.set(label, {
        label,
        items: [],
        feedingCount: 0,
        feedingTotalMl: 0,
        diaperCount: 0,
        mealCount: 0,
        sleepTotalSeconds: 0,
      });
      order.push(label);
    }
    const group = map.get(label)!;
    group.items.push(item);
    if (item.type === 'feeding') {
      group.feedingCount += 1;
      group.feedingTotalMl += item.data.amount_ml ?? 0;
    } else if (item.type === 'diaper') {
      group.diaperCount += 1;
    } else if (item.type === 'sleep') {
      group.sleepTotalSeconds += item.data.duration_seconds ?? 0;
    } else if (item.type === 'meal') {
      group.mealCount += 1;
    }
  }

  return order.map((label) => map.get(label)!);
}

// ─── 컴포넌트 ──────────────────────────────────────────────────────────────────

const TimelineListInner = ({ timeline, hasMoreTimeline = false, onRefresh, onLoadMore, closeRowsRef }: TimelineListProps) => {
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const { deleteRecord, saveFeeding, saveSleep, saveDiaper, saveMeal } = useRecordStore();
  const { currentBaby } = useBabyStore();
  const { user } = useAuthStore();

  const openRowRef = useRef<{ id: string; close: () => void } | null>(null);

  const closeAll = useCallback(() => {
    openRowRef.current?.close();
    openRowRef.current = null;
  }, []);

  useEffect(() => {
    if (closeRowsRef) closeRowsRef.current = closeAll;
  }, [closeRowsRef, closeAll]);

  const handleWillOpen = useCallback((rowId: string, closeFn: () => void) => {
    if (openRowRef.current && openRowRef.current.id !== rowId) {
      openRowRef.current.close();
    }
    openRowRef.current = { id: rowId, close: closeFn };
  }, []);

  const handleItemPress = useCallback(
    (item: TimelineItem) => {
      closeAll();
      setEditingItem(item);
    },
    [closeAll],
  );

  const handleEditClose = useCallback(() => setEditingItem(null), []);
  const handleEditSave = useCallback(async () => {
    setEditingItem(null);
    await onRefresh?.();
  }, [onRefresh]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !onLoadMore) return;
    setLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, onLoadMore]);

  // ─── 삭제 ─────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(
    (item: TimelineItem) => {
      const label = { feeding: '수유', sleep: '수면', diaper: '기저귀', meal: '이유식' }[item.type];
      Alert.alert('삭제', `${label} 기록을 삭제할까요?`, [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecord(item.type as 'feeding' | 'sleep' | 'diaper' | 'meal', item.data.id);
              await onRefresh?.();
            } catch {
              Alert.alert('오류', '삭제에 실패했습니다.');
            }
          },
        },
      ]);
    },
    [deleteRecord, onRefresh],
  );

  // ─── 복사 ─────────────────────────────────────────────────────────────────
  const handleCopy = useCallback(
    async (item: TimelineItem) => {
      if (!currentBaby || !user) return;
      const now = new Date().toISOString();
      try {
        if (item.type === 'feeding') {
          await saveFeeding({
            baby_id: currentBaby.id,
            recorded_by: user.id,
            feeding_type: item.data.feeding_type,
            started_at: now,
            duration_seconds: item.data.duration_seconds ?? undefined,
            amount_ml: item.data.amount_ml ?? undefined,
            memo_tags: item.data.memo_tags ?? undefined,
            note: item.data.note ?? undefined,
          });
        } else if (item.type === 'sleep') {
          await saveSleep({
            baby_id: currentBaby.id,
            recorded_by: user.id,
            sleep_type: item.data.sleep_type,
            started_at: now,
            duration_seconds: item.data.duration_seconds ?? undefined,
            memo_tags: item.data.memo_tags ?? undefined,
            note: item.data.note ?? undefined,
          });
        } else if (item.type === 'diaper') {
          await saveDiaper({
            baby_id: currentBaby.id,
            recorded_by: user.id,
            diaper_type: item.data.diaper_type,
            occurred_at: now,
            memo_tags: item.data.memo_tags ?? undefined,
            note: item.data.note ?? undefined,
          });
        } else if (item.type === 'meal') {
          await saveMeal({
            baby_id: currentBaby.id,
            recorded_by: user.id,
            meal_type: item.data.meal_type,
            occurred_at: now,
            amount_ml: item.data.amount_ml ?? undefined,
            reaction: item.data.reaction ?? undefined,
            memo_tags: item.data.memo_tags ?? undefined,
            note: item.data.note ?? undefined,
          });
        }
        await onRefresh?.();
      } catch {
        Alert.alert('오류', '복사에 실패했습니다.');
      }
    },
    [currentBaby, user, saveFeeding, saveSleep, saveDiaper, saveMeal, onRefresh],
  );

  // ─── 날짜별 그룹 계산 ─────────────────────────────────────────────────────
  const dayGroups = useMemo(() => groupByDate(timeline), [timeline]);

  if (timeline.length === 0) {
    return (
      <View style={[styles.emptyCard, shadows.card]}>
        <Text style={styles.emptyText}>아직 기록이 없어요</Text>
      </View>
    );
  }

  return (
    <>
      {dayGroups.map((group) => {
        // 통계 칩 목록
        const statParts: string[] = [];
        if (group.feedingCount > 0) {
          const mlText = group.feedingTotalMl > 0 ? ` · ${group.feedingTotalMl}ml` : '';
          statParts.push(`수유 ${group.feedingCount}회${mlText}`);
        }
        if (group.diaperCount > 0) {
          statParts.push(`기저귀 ${group.diaperCount}회`);
        }
        if (group.sleepTotalSeconds > 0) {
          statParts.push(`수면 ${formatSleepDuration(group.sleepTotalSeconds)}`);
        }
        if (group.mealCount > 0) {
          statParts.push(`이유식 ${group.mealCount}회`);
        }
        return (
          <View key={group.label} style={[styles.dayCard, shadows.card]}>
            {/* 날짜 헤더 */}
            <View style={styles.dayHeader}>
              <Text style={styles.dayLabel}>{group.label}</Text>
              {statParts.length > 0 && (
                <View style={styles.statRow}>
                  {statParts.map((part, i) => (
                    <View key={i} style={styles.statChip}>
                      <Text style={styles.statText}>{part}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* 해당 날짜의 기록들 */}
            <View style={styles.itemsContainer}>
              {group.items.map((item, idx) => (
                <SwipeableRow
                  key={`${item.type}-${item.time.getTime()}-${idx}`}
                  onDelete={() => handleDelete(item)}
                  onCopy={() => handleCopy(item)}
                  onWillOpen={handleWillOpen}
                >
                  <TimelineItemCard item={item} onPress={() => handleItemPress(item)} hideBorder={idx === group.items.length - 1} />
                </SwipeableRow>
              ))}
            </View>
          </View>
        );
      })}

      {/* 더 불러오기 */}
      {hasMoreTimeline && (
        <TouchableOpacity style={[styles.loadMoreBtn, shadows.card]} onPress={handleLoadMore} disabled={loadingMore} activeOpacity={0.7}>
          {loadingMore ? <ActivityIndicator size="small" color={colors.accent} /> : <Text style={styles.loadMoreText}>이전 기록 더 불러오기</Text>}
        </TouchableOpacity>
      )}

      <EditRecordSheet item={editingItem} onClose={handleEditClose} onSaveSuccess={handleEditSave} />
    </>
  );
};

export const TimelineList = memo(TimelineListInner);

const styles = StyleSheet.create({
  emptyCard: {
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.card,
    padding: spacing.cardPadding,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    paddingVertical: spacing.lg,
  },

  // 날짜별 카드
  dayCard: {
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.card,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  dayHeader: {
    paddingHorizontal: spacing.cardPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayLabel: {
    ...typography.bodySemiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // gap: ,
  },
  statChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    backgroundColor: colors.bg.primary,
    borderRadius: borderRadius.full,
    // borderWidth: 1,
    // borderColor: colors.border,
  },
  statText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  itemsContainer: {
    paddingHorizontal: spacing.cardPadding,
    paddingBottom: spacing.sm,
  },

  // 더 불러오기 버튼
  loadMoreBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderRadius: borderRadius.card,
    backgroundColor: colors.bg.elevated,
  },
  loadMoreText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
});
