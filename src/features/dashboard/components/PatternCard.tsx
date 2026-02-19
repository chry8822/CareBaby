import React from 'react';
import { View, Text } from 'react-native';
import { Brain } from 'lucide-react-native';
import { usePatternAnalysis } from '../hooks/usePatternAnalysis';
import { colors, spacing, borderRadius, fontSize } from '@/design-system/tokens';

export function PatternCard() {
  const { patterns, weeklyAverage } = usePatternAnalysis();
  const safePatterns = Array.isArray(patterns) ? patterns : [];
  const safeAverage = weeklyAverage ?? {
    feeding: 0,
    sleep: 0,
    diaper: 0,
  };

  if (safePatterns.length === 0) {
    return (
      <View
        style={{
          backgroundColor: colors.neutral.card,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          alignItems: 'center',
          gap: spacing.sm,
        }}
      >
        <Brain size={24} color={colors.info} />
        <Text style={{ color: colors.neutral.textMuted, fontSize: fontSize.sm }}>
          3일 이상 기록하면 패턴을 분석해드려요
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: colors.neutral.card,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        gap: spacing.sm,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Brain size={20} color={colors.info} />
        <Text
          style={{
            fontSize: fontSize.lg,
            fontWeight: '700',
            color: colors.neutral.text,
          }}
        >
          패턴 분석
        </Text>
      </View>

      {safePatterns.map((pattern, index) => (
        <View
          key={index}
          style={{
            backgroundColor: colors.info + '15',
            borderRadius: borderRadius.md,
            padding: spacing.sm,
          }}
        >
          <Text style={{ fontSize: fontSize.sm, color: colors.neutral.text }}>
            {pattern}
          </Text>
        </View>
      ))}

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingTop: spacing.sm,
          borderTopWidth: 1,
          borderTopColor: colors.neutral.border,
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontSize: fontSize.lg,
              fontWeight: '700',
              color: colors.chart.feeding,
            }}
          >
            {Number(safeAverage.feeding).toFixed(1)}
          </Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.neutral.textMuted }}>
            수유/일
          </Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontSize: fontSize.lg,
              fontWeight: '700',
              color: colors.chart.sleep,
            }}
          >
            {Number(safeAverage.sleep).toFixed(1)}h
          </Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.neutral.textMuted }}>
            수면/일
          </Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontSize: fontSize.lg,
              fontWeight: '700',
              color: colors.chart.diaper,
            }}
          >
            {Number(safeAverage.diaper).toFixed(1)}
          </Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.neutral.textMuted }}>
            기저귀/일
          </Text>
        </View>
      </View>
    </View>
  );
}
