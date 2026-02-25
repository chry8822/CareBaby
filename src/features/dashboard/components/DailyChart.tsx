import React, { useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { useTrackingStore } from '@/features/tracking/store';
import { colors, spacing, borderRadius, fontSize } from '@/design-system/tokens';
import { getStartOfDay } from '@/shared/utils/date';

const CHART_SIZE = Dimensions.get('window').width - spacing.md * 4;

interface ChartSegment {
  label: string;
  value: number;
  color: string;
}

export function DailyChart() {
  const feedings = useTrackingStore((s) => s.feedings) ?? [];
  const sleeps = useTrackingStore((s) => s.sleeps) ?? [];
  const diaperRecords = useTrackingStore((s) => s.diapers) ?? [];

  const todayStart = useMemo(() => getStartOfDay(new Date()), []);

  const data: ChartSegment[] = useMemo(() => {
    const a = Array.isArray(feedings) ? feedings : [];
    const b = Array.isArray(sleeps) ? sleeps : [];
    const c = Array.isArray(diaperRecords) ? diaperRecords : [];
    const todayFeedings = a.filter((f) => f?.timestamp && f.timestamp >= todayStart).length;
    const todaySleeps = b.filter((s) => s?.startTime && s.startTime >= todayStart).length;
    const todayDiapers = c.filter((d) => d?.timestamp && d.timestamp >= todayStart).length;

    return [
      { label: '수유', value: todayFeedings, color: colors.chart.feeding },
      { label: '수면', value: todaySleeps, color: colors.chart.sleep },
      { label: '기저귀', value: todayDiapers, color: colors.chart.diaper },
    ];
  }, [feedings, sleeps, diaperRecords, todayStart]);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <View
        style={{
          backgroundColor: colors.neutral.card,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: colors.neutral.textMuted, fontSize: fontSize.md }}>아직 오늘 기록이 없어요</Text>
        <Text style={{ color: colors.neutral.textMuted, fontSize: fontSize.sm, marginTop: 4 }}>첫 기록을 남겨보세요!</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: colors.neutral.card,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        gap: spacing.md,
      }}
    >
      <Text
        style={{
          fontSize: fontSize.lg,
          fontWeight: '700',
          color: colors.neutral.text,
        }}
      >
        오늘의 비율
      </Text>

      {/* 바 차트 */}
      <View style={{ gap: spacing.sm }}>
        {data.map((segment) => {
          const ratio = total > 0 ? segment.value / total : 0;
          return (
            <View key={segment.label} style={{ gap: 4 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    color: colors.neutral.textSecondary,
                    fontWeight: '600',
                  }}
                >
                  {segment.label}
                </Text>
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    color: colors.neutral.text,
                    fontWeight: '700',
                  }}
                >
                  {segment.value}회
                </Text>
              </View>
              <View
                style={{
                  height: 12,
                  backgroundColor: colors.neutral.bg,
                  borderRadius: borderRadius.full,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${Math.max(ratio * 100, 5)}%`,
                    backgroundColor: segment.color,
                    borderRadius: borderRadius.full,
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* 범례 */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.md }}>
        {data.map((segment) => (
          <View key={segment.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: segment.color,
              }}
            />
            <Text style={{ fontSize: fontSize.xs, color: colors.neutral.textSecondary }}>{segment.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
