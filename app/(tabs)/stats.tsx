<<<<<<< HEAD
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { BarChart2 } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';

const StatsScreen = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>통계</Text>
      <Text style={styles.subtitle}>패턴 분석 및 인사이트</Text>

      <View style={styles.comingSoonCard}>
        <Image
          source={require('../../assets/images/stats-coming-soon.png')}
          style={styles.illustration}
          resizeMode="contain"
        />
        <View style={styles.iconWrapper}>
          <BarChart2 color={colors.activity.growth} size={28} />
        </View>
        <Text style={styles.comingSoonTitle}>AI 패턴 분석</Text>
        <Text style={styles.comingSoonDesc}>
          수유·수면 패턴을 AI가 분석해{'\n'}맞춤 인사이트를 제공할 예정이에요.
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>준비 중</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  content: {
    padding: spacing.screenPadding,
    paddingTop: 60,
  },
  title: {
    ...typography.display,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.sectionGap,
  },
  comingSoonCard: {
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.card,
    padding: spacing.cardPadding,
    alignItems: 'center',
    ...shadows.card,
  },
  illustration: {
    width: 160,
    height: 120,
    marginBottom: spacing.lg,
    opacity: 0.7,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.base,
    backgroundColor: `${colors.activity.growth}18`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  comingSoonTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  comingSoonDesc: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: `${colors.activity.growth}18`,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    ...typography.caption,
    color: colors.activity.growth,
    fontWeight: '600',
  },
});

export default StatsScreen;
=======
import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeView } from '@/shared/components/SafeView';
import { useTrackingStore } from '@/features/tracking/store';
import { usePatternAnalysis } from '@/features/dashboard/hooks/usePatternAnalysis';
import { colors, spacing, borderRadius, fontSize } from '@/design-system/tokens';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { getStartOfDay } from '@/shared/utils/date';

type StatPeriod = 'today' | 'week';

export default function StatsScreen() {
  const [period, setPeriod] = useState<StatPeriod>('today');
  const { weeklyAverage, todayVsYesterday } = usePatternAnalysis();
  const safeVs = todayVsYesterday ?? {
    feeding: 0,
    sleep: 0,
    diaper: 0,
    yesterdayFeeding: 0,
    yesterdaySleep: 0,
    yesterdayDiaper: 0,
  };
  const safeWeekly = weeklyAverage ?? { feeding: 0, sleep: 0, diaper: 0 };
  const feedings = useTrackingStore((s) => s.feedings) ?? [];
  const sleeps = useTrackingStore((s) => s.sleeps) ?? [];
  const diapers = useTrackingStore((s) => s.diapers) ?? [];

  const todayStart = useMemo(() => getStartOfDay(new Date()), []);

  const todayStats = useMemo(() => {
    const a = Array.isArray(feedings) ? feedings : [];
    const b = Array.isArray(sleeps) ? sleeps : [];
    const c = Array.isArray(diapers) ? diapers : [];
    const tf = a.filter((f) => f?.timestamp && f.timestamp >= todayStart);
    const ts = b.filter((s) => s?.startTime && s.startTime >= todayStart);
    const td = c.filter((d) => d?.timestamp && d.timestamp >= todayStart);

    let sleepMinutes = 0;
    for (const s of ts) {
      if (s?.endTime && s?.startTime) {
        sleepMinutes += (s.endTime.getTime() - s.startTime.getTime()) / 60000;
      }
    }

    return {
      feedingCount: tf.length,
      sleepHours: Math.round((sleepMinutes / 60) * 10) / 10,
      diaperCount: td.length,
    };
  }, [feedings, sleeps, diapers, todayStart]);

  const getTrendIcon = (diff: number) => {
    if (diff > 0) return <TrendingUp size={16} color={colors.brand.secondary} />;
    if (diff < 0) return <TrendingDown size={16} color="#FF6B6B" />;
    return <Minus size={16} color={colors.neutral.textMuted} />;
  };

  return (
    <SafeView edges={['top', 'left', 'right']}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.neutral.bg }}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontSize: fontSize.xxl,
            fontWeight: '700',
            color: colors.neutral.text,
          }}
        >
          통계
        </Text>

        {/* 기간 선택 */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: colors.neutral.card,
            borderRadius: borderRadius.md,
            padding: 4,
          }}
        >
          {(['today', 'week'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              style={{
                flex: 1,
                paddingVertical: spacing.sm,
                borderRadius: borderRadius.sm,
                backgroundColor:
                  period === p ? colors.brand.primary : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontWeight: '600',
                  color: period === p ? '#fff' : colors.neutral.textSecondary,
                }}
              >
                {p === 'today' ? '오늘' : '이번 주'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {period === 'today' ? (
          <>
            {/* 오늘 통계 카드 */}
            <View style={{ gap: spacing.sm }}>
              <StatCard
                title="수유"
                value={`${todayStats.feedingCount}회`}
                color={colors.chart.feeding}
                comparison={safeVs.feeding}
                trendIcon={getTrendIcon(safeVs.feeding)}
              />
              <StatCard
                title="수면"
                value={`${todayStats.sleepHours}시간`}
                color={colors.chart.sleep}
                comparison={safeVs.sleep}
                trendIcon={getTrendIcon(safeVs.sleep)}
              />
              <StatCard
                title="기저귀"
                value={`${todayStats.diaperCount}회`}
                color={colors.chart.diaper}
                comparison={safeVs.diaper}
                trendIcon={getTrendIcon(safeVs.diaper)}
              />
            </View>

            {/* 어제 vs 오늘 비교 */}
            <View
              style={{
                backgroundColor: colors.neutral.card,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                gap: spacing.sm,
              }}
            >
              <Text
                style={{
                  fontSize: fontSize.lg,
                  fontWeight: '700',
                  color: colors.neutral.text,
                }}
              >
                어제 vs 오늘
              </Text>
              <ComparisonRow
                label="수유"
                yesterday={safeVs.yesterdayFeeding}
                today={todayStats.feedingCount}
                unit="회"
                color={colors.chart.feeding}
              />
              <ComparisonRow
                label="수면"
                yesterday={safeVs.yesterdaySleep}
                today={todayStats.sleepHours}
                unit="시간"
                color={colors.chart.sleep}
              />
              <ComparisonRow
                label="기저귀"
                yesterday={safeVs.yesterdayDiaper}
                today={todayStats.diaperCount}
                unit="회"
                color={colors.chart.diaper}
              />
            </View>
          </>
        ) : (
          /* 주간 통계 */
          <View style={{ gap: spacing.sm }}>
            <View
              style={{
                backgroundColor: colors.neutral.card,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                gap: spacing.sm,
              }}
            >
              <Text
                style={{
                  fontSize: fontSize.lg,
                  fontWeight: '700',
                  color: colors.neutral.text,
                }}
              >
                7일 평균
              </Text>
              <WeeklyRow
                label="수유"
                value={`${Number(safeWeekly.feeding).toFixed(1)}회/일`}
                color={colors.chart.feeding}
              />
              <WeeklyRow
                label="수면"
                value={`${Number(safeWeekly.sleep).toFixed(1)}시간/일`}
                color={colors.chart.sleep}
              />
              <WeeklyRow
                label="기저귀"
                value={`${Number(safeWeekly.diaper).toFixed(1)}회/일`}
                color={colors.chart.diaper}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeView>
  );
}

function StatCard({
  title,
  value,
  color,
  comparison,
  trendIcon,
}: {
  title: string;
  value: string;
  color: string;
  comparison: number;
  trendIcon: React.ReactNode;
}) {
  const diffText =
    comparison === 0
      ? '어제와 같음'
      : comparison > 0
        ? `어제보다 ${comparison} 더`
        : `어제보다 ${Math.abs(comparison)} 적게`;

  return (
    <View
      style={{
        backgroundColor: colors.neutral.card,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderLeftWidth: 4,
        borderLeftColor: color,
      }}
    >
      <View>
        <Text style={{ fontSize: fontSize.sm, color: colors.neutral.textSecondary }}>
          {title}
        </Text>
        <Text
          style={{
            fontSize: fontSize.xl,
            fontWeight: '700',
            color: colors.neutral.text,
          }}
        >
          {value}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        {trendIcon}
        <Text style={{ fontSize: fontSize.xs, color: colors.neutral.textMuted }}>
          {diffText}
        </Text>
      </View>
    </View>
  );
}

function ComparisonRow({
  label,
  yesterday,
  today,
  unit,
  color,
}: {
  label: string;
  yesterday: number;
  today: number;
  unit: string;
  color: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.xs,
      }}
    >
      <Text style={{ color: colors.neutral.textSecondary, flex: 1 }}>{label}</Text>
      <Text style={{ color: colors.neutral.textMuted, flex: 1, textAlign: 'center' }}>
        {yesterday}
        {unit}
      </Text>
      <Text
        style={{
          color,
          fontWeight: '700',
          flex: 1,
          textAlign: 'right',
        }}
      >
        {today}
        {unit}
      </Text>
    </View>
  );
}

function WeeklyRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.xs,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: color,
          }}
        />
        <Text style={{ color: colors.neutral.textSecondary }}>{label}</Text>
      </View>
      <Text style={{ fontWeight: '700', color: colors.neutral.text }}>{value}</Text>
    </View>
  );
}
>>>>>>> a88fc5b1eea3bf532c87154847c9ba43940e9b42
