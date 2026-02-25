import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type { TimelineItem } from '../../hooks/useHomeData';
import { AppModal } from '../ui/AppModal';
import { TimelineItemCard } from './TimelineItemCard';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../constants/theme';

interface TimelineListProps {
  timeline: TimelineItem[];
}

const PREVIEW_COUNT = 5;

export const TimelineList = ({ timeline }: TimelineListProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const preview = timeline.slice(0, PREVIEW_COUNT);
  const hasMore = timeline.length > PREVIEW_COUNT;

  return (
    <>
      <View style={styles.card}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>오늘의 기록</Text>
          {hasMore && (
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>전체보기 &gt;</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 프리뷰 아이템 */}
        {preview.length === 0 ? (
          <Text style={styles.emptyText}>오늘 기록이 없어요</Text>
        ) : (
          preview.map((item, idx) => (
            <TimelineItemCard
              key={`${item.type}-${item.time.getTime()}-${idx}`}
              item={item}
            />
          ))
        )}
      </View>

      {/* 전체 타임라인 모달 */}
      <AppModal
        visible={modalVisible}
        variant="bottom-sheet"
        title="오늘의 전체 기록"
        onClose={() => setModalVisible(false)}
        closeOnBackdrop
        secondaryAction={{ label: '닫기', onPress: () => setModalVisible(false) }}
      >
        <ScrollView
          style={styles.modalScroll}
          showsVerticalScrollIndicator={false}
        >
          {timeline.map((item, idx) => (
            <TimelineItemCard
              key={`modal-${item.type}-${item.time.getTime()}-${idx}`}
              item={item}
            />
          ))}
          <View style={styles.modalPadding} />
        </ScrollView>
      </AppModal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.card,
    padding: spacing.cardPadding,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.bodySemiBold,
    color: colors.text.primary,
  },
  viewAllText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  emptyText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  modalScroll: {
    maxHeight: 400,
    marginTop: spacing.sm,
  },
  modalPadding: {
    height: spacing.lg,
  },
});
