import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Droplets, Moon, Cookie, Ruler, Pill, Star, Bath } from 'lucide-react-native';
import { SafeView } from '@/shared/components/SafeView';
import { CountdownTimer } from '@/features/dashboard/components/CountdownTimer';
import {
  useTrackingStore,
  filterTodayFeedings,
  filterTodaySleeps,
  filterTodayDiapers,
} from '@/features/tracking/store';
import { colors, spacing, borderRadius, typography, shadows } from '@/design-system/tokens';
import { useRouter } from 'expo-router';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return '좋은 아침이에요';
  if (h >= 11 && h < 17) return '수고 많아요';
  if (h >= 17 && h < 21) return '오늘도 고생했어요';
  return '편안한 밤 되세요';
}

function getDaysOld(birthDate: Date): number {
  const now = new Date();
  const diff = now.getTime() - birthDate.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}

type QuickActionKey =
  | 'feeding_nursing'
  | 'feeding_formula'
  | 'sleep'
  | 'diaper'
  | 'growth'
  | 'health'
  | 'milestone'
  | 'bath';

const QUICK_ACTIONS: Array<{
  key: QuickActionKey;
  label: string;
  color: string;
  icon: React.ReactNode;
}> = [
  { key: 'feeding_nursing', label: '모유', color: colors.activity.feeding, icon: <Cookie size={18} color="#fff" /> },
  { key: 'feeding_formula', label: '분유', color: colors.activity.feeding, icon: <Cookie size={18} color="#fff" /> },
  { key: 'sleep', label: '수면', color: colors.activity.sleep, icon: <Moon size={18} color="#fff" /> },
  { key: 'diaper', label: '기저귀', color: colors.activity.diaper, icon: <Droplets size={18} color="#fff" /> },
  { key: 'growth', label: '성장', color: colors.activity.growth, icon: <Ruler size={18} color="#fff" /> },
  { key: 'health', label: '건강', color: colors.activity.health, icon: <Pill size={18} color="#fff" /> },
  { key: 'milestone', label: '첫경험', color: colors.activity.milestone, icon: <Star size={18} color="#fff" /> },
  { key: 'bath', label: '목욕', color: colors.activity.bath, icon: <Bath size={18} color="#fff" /> },
];

function QuickActionButton({
  icon,
  label,
  color,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{ width: 70, alignItems: 'center', gap: 6 }}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: borderRadius.full,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <Text style={{ fontSize: 11, color: colors.neutral.textSecondary }}>{label}</Text>
    </TouchableOpacity>
  );
}

function formatClock(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function formatRelative(minutes: number): string {
  if (minutes < 60) return `${minutes}분`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

function formatSleepTotal(
  sleeps: Array<{ startTime: Date; endTime: Date | null }> | undefined | null
): string {
  if (!Array.isArray(sleeps)) return '0분';
  let totalMinutes = 0;
  for (const s of sleeps) {
    if (s?.endTime && s?.startTime) {
      totalMinutes += (s.endTime.getTime() - s.startTime.getTime()) / 60000;
    }
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  if (hours === 0) return `${mins}분`;
  return `${hours}시간 ${mins}분`;
}

export default function HomeScreen() {
  const router = useRouter();
  const loadAll = useTrackingStore((state) => state.loadAll);
  const feedings = useTrackingStore((state) => state.feedings) ?? [];
  const sleeps = useTrackingStore((state) => state.sleeps) ?? [];
  const diapers = useTrackingStore((state) => state.diapers) ?? [];

  const loadedOnce = useRef(false);
  useEffect(() => {
    if (loadedOnce.current) return;
    loadedOnce.current = true;
    loadAll();
  }, [loadAll]);

  const safeTodayFeedings = useMemo(() => filterTodayFeedings(feedings), [feedings]);
  const safeTodaySleeps = useMemo(() => filterTodaySleeps(sleeps), [sleeps]);
  const safeTodayDiapers = useMemo(() => filterTodayDiapers(diapers), [diapers]);

  const totalRecords = safeTodayFeedings.length + safeTodaySleeps.length + safeTodayDiapers.length;
  const hasRecords = totalRecords > 0;

  const babyName = '수호';
  const defaultBirth = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 97);
    return d;
  }, []);
  const daysOld = getDaysOld(defaultBirth);

  const daysWithData = useMemo(() => {
    const allDates = [
      ...feedings.map((f) => f.timestamp),
      ...sleeps.map((s) => s.startTime),
      ...diapers.map((d) => d.timestamp),
    ]
      .filter((d): d is Date => d instanceof Date)
      .map((d) => d.toISOString().slice(0, 10));
    return new Set(allDates).size;
  }, [feedings, sleeps, diapers]);

  const predicted = useMemo(() => {
    const feedingTimes = feedings
      .map((f) => f.timestamp)
      .filter((d): d is Date => d instanceof Date)
      .sort((a, b) => a.getTime() - b.getTime());
    const sleepTimes = sleeps
      .map((s) => s.startTime)
      .filter((d): d is Date => d instanceof Date)
      .sort((a, b) => a.getTime() - b.getTime());

    const calcAvg = (arr: Date[]): number | null => {
      if (arr.length < 2) return null;
      const diffs: number[] = [];
      for (let i = 1; i < arr.length; i += 1) {
        diffs.push((arr[i].getTime() - arr[i - 1].getTime()) / 60000);
      }
      return Math.round(diffs.reduce((a, c) => a + c, 0) / diffs.length);
    };

    const feedingAvg = calcAvg(feedingTimes);
    const sleepAvg = calcAvg(sleepTimes);
    const lastFeeding = feedingTimes[feedingTimes.length - 1];
    const lastSleep = sleepTimes[sleepTimes.length - 1];
    return {
      feeding: feedingAvg && lastFeeding ? new Date(lastFeeding.getTime() + feedingAvg * 60000) : null,
      sleep: sleepAvg && lastSleep ? new Date(lastSleep.getTime() + sleepAvg * 60000) : null,
      feedingAvg,
      sleepAvg,
    };
  }, [feedings, sleeps]);

  const timeline = useMemo(() => {
    const feedingItems = safeTodayFeedings.map((f) => ({
      id: `f-${f.id}`,
      time: f.timestamp,
      color: colors.activity.feeding,
      title: f.type === 'formula' ? '분유 수유' : '모유 수유',
      subtitle: f.amountMl ? `${f.amountMl}ml` : `${f.durationMinutes ?? 0}분`,
    }));
    const sleepItems = safeTodaySleeps.map((s) => ({
      id: `s-${s.id}`,
      time: s.startTime,
      color: colors.activity.sleep,
      title: '수면 기록',
      subtitle: s.endTime ? `${Math.max(1, Math.round((s.endTime.getTime() - s.startTime.getTime()) / 60000))}분` : '진행중',
    }));
    const diaperItems = safeTodayDiapers.map((d) => ({
      id: `d-${d.id}`,
      time: d.timestamp,
      color: colors.activity.diaper,
      title: '기저귀',
      subtitle: d.type,
    }));
    return [...feedingItems, ...sleepItems, ...diaperItems]
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 6);
  }, [safeTodayFeedings, safeTodaySleeps, safeTodayDiapers]);

  const handleQuickRecord = (type: QuickActionKey) => {
    if (type === 'feeding_nursing') {
      router.push({ pathname: '/(tabs)/tracking', params: { type: 'feeding', feedingType: 'breast_left' } });
      return;
    }
    if (type === 'feeding_formula') {
      router.push({ pathname: '/(tabs)/tracking', params: { type: 'feeding', feedingType: 'formula' } });
      return;
    }
    if (type === 'sleep' || type === 'diaper') {
      router.push({ pathname: '/(tabs)/tracking', params: { type } });
      return;
    }
    router.push('/(tabs)/profile');
  };

  return (
    <SafeView edges={['top', 'left', 'right']}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.neutral.bg }}
        contentContainerStyle={{ padding: spacing.screenPadding, paddingBottom: 32, gap: spacing.sectionGap }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: colors.neutral.card,
            borderRadius: borderRadius.lg,
            padding: spacing.cardPadding,
            borderWidth: 1,
            borderColor: colors.neutral.border,
          }}
        >
          <Text style={{ fontSize: typography.display.size, fontWeight: '700', color: colors.neutral.text }}>
            {getGreeting()}
          </Text>
          <Text style={{ marginTop: spacing.itemGap, fontSize: typography.h3.size, color: colors.neutral.textSecondary }}>
            {babyName} · 생후 {daysOld}일
          </Text>
        </View>

        <CountdownTimer
          onFeedingPress={() => handleQuickRecord('feeding_nursing')}
          onSleepPress={() => handleQuickRecord('sleep')}
          onDiaperPress={() => handleQuickRecord('diaper')}
        />

        <View style={{ gap: spacing.cardGap }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.neutral.text }}>빠른 기록</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            {QUICK_ACTIONS.slice(0, 4).map((a) => (
              <QuickActionButton key={a.key} icon={a.icon} label={a.label} color={a.color} onPress={() => handleQuickRecord(a.key)} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 }}>
            {QUICK_ACTIONS.slice(4, 8).map((a) => (
              <QuickActionButton key={a.key} icon={a.icon} label={a.label} color={a.color} onPress={() => handleQuickRecord(a.key)} />
            ))}
          </View>
        </View>

        {!hasRecords ? (
          <View
            style={{
              backgroundColor: colors.neutral.card,
              borderRadius: 24,
              padding: 32,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.neutral.border,
            }}
          >
            <Star size={48} color={colors.brand.primary} />
            <Text style={{ marginTop: 12, textAlign: 'center', fontSize: 20, fontWeight: '700', color: colors.neutral.text }}>
              {babyName}의 첫 하루를{'\n'}기록해볼까요?
            </Text>
            <Text style={{ marginTop: 12, textAlign: 'center', fontSize: typography.body.size, color: colors.neutral.textSecondary }}>
              수유, 수면, 기저귀 교체를 간편하게 기록하고{'\n'}{babyName}의 패턴을 발견해보세요
            </Text>
            <TouchableOpacity
              onPress={() => handleQuickRecord('feeding_nursing')}
              activeOpacity={0.85}
              style={{
                marginTop: 20,
                height: 52,
                minWidth: 200,
                borderRadius: borderRadius.button,
                backgroundColor: colors.brand.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: colors.neutral.white, fontSize: typography.body.size, fontWeight: '700' }}>첫 기록 시작하기</Text>
            </TouchableOpacity>
            <Text style={{ marginTop: 14, textAlign: 'center', fontSize: typography.caption.size, color: colors.neutral.textMuted }}>
              기록이 3일 이상 쌓이면 패턴 분석을 시작해요
            </Text>
          </View>
        ) : (
          <>
            <View style={{ gap: spacing.itemGap }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.neutral.text }}>다음 예상</Text>
              {daysWithData < 3 ? (
                <Text style={{ fontSize: typography.caption.size, color: colors.neutral.textSecondary }}>
                  조금만 더 기록하면 예상 시간을 알려드릴게요
                </Text>
              ) : (
                <View
                  style={{
                    backgroundColor: colors.neutral.card,
                    borderRadius: borderRadius.lg,
                    padding: spacing.cardPadding,
                    ...shadows.card,
                  }}
                >
                  <Text style={{ color: colors.activity.feeding, fontWeight: '600' }}>
                    수유 약 {formatRelative(predicted.feedingAvg ?? 0)} 후 ({predicted.feeding ? formatClock(predicted.feeding) : '--:--'}경)
                  </Text>
                  <Text style={{ marginTop: 6, color: colors.activity.sleep, fontWeight: '600' }}>
                    낮잠 약 {formatRelative(predicted.sleepAvg ?? 0)} 후 ({predicted.sleep ? formatClock(predicted.sleep) : '--:--'}경)
                  </Text>
                </View>
              )}
            </View>

            <View style={{ gap: spacing.itemGap }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.neutral.text }}>오늘의 기록</Text>
              <Text style={{ fontSize: typography.body.size, color: colors.neutral.textSecondary }}>
                수유 <Text style={{ fontWeight: '700', color: colors.neutral.text }}>{safeTodayFeedings.length}회</Text>
                <Text style={{ color: colors.neutral.textMuted }}> · </Text>
                수면 <Text style={{ fontWeight: '700', color: colors.neutral.text }}>{formatSleepTotal(safeTodaySleeps)}</Text>
                <Text style={{ color: colors.neutral.textMuted }}> · </Text>
                기저귀 <Text style={{ fontWeight: '700', color: colors.neutral.text }}>{safeTodayDiapers.length}회</Text>
              </Text>
            </View>

            <View
              style={{
                backgroundColor: colors.neutral.card,
                borderRadius: borderRadius.lg,
                padding: spacing.cardPadding,
                ...shadows.card,
                gap: spacing.cardGap,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.neutral.text }}>오늘의 타임라인</Text>
              {timeline.map((item) => (
                <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.itemGap }}>
                  <Text style={{ width: 48, color: colors.neutral.textSecondary, fontSize: typography.caption.size }}>
                    {formatClock(item.time)}
                  </Text>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.neutral.text, fontSize: typography.body.size, fontWeight: '600' }}>{item.title}</Text>
                    <Text style={{ color: colors.neutral.textSecondary, fontSize: typography.caption.size }}>{item.subtitle}</Text>
                  </View>
                </View>
              ))}
              <TouchableOpacity onPress={() => router.push('/(tabs)/tracking')} activeOpacity={0.85}>
                <Text style={{ textAlign: 'center', color: colors.neutral.textMuted, fontSize: typography.caption.size }}>
                  ─── 더 보기 ───
                </Text>
              </TouchableOpacity>
            </View>

          </>
        )}
      </ScrollView>
    </SafeView>
  );
}
