import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Droplets, Moon, Wind } from 'lucide-react-native';
import type { Baby } from '../../types/database';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../constants/theme';
import { getDaysSinceBirth, getGreeting } from '../../lib/timeUtils';

interface HomeEmptyProps {
  baby: Baby;
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  color: string;
  category: string;
}

export const HomeEmpty = ({ baby }: HomeEmptyProps) => {
  const greeting = getGreeting();
  const daysSince = getDaysSinceBirth(baby.birth_date);

  const quickActions: QuickAction[] = [
    {
      label: '모유 수유',
      icon: <Droplets size={24} color={colors.activity.nursing} strokeWidth={1.8} />,
      color: colors.activity.nursing,
      category: 'feeding',
    },
    {
      label: '분유 수유',
      icon: <Droplets size={24} color={colors.activity.nursing} strokeWidth={1.8} />,
      color: colors.activity.nursing,
      category: 'feeding',
    },
    {
      label: '수면',
      icon: <Moon size={24} color={colors.activity.sleep} strokeWidth={1.8} />,
      color: colors.activity.sleep,
      category: 'sleep',
    },
    {
      label: '기저귀',
      icon: <Wind size={24} color={colors.activity.diaper} strokeWidth={1.8} />,
      color: colors.activity.diaper,
      category: 'diaper',
    },
  ];

  const handleQuickAction = (category: string) => {
    router.push(`/(tabs)/record?category=${category}` as never);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 인사말 카드 */}
      <View style={styles.greetingCard}>
        <Text style={styles.greetingText}>{greeting}</Text>
        <Text style={styles.babyName}>{baby.name}</Text>
        <Text style={styles.daysText}>생후 {daysSince}일</Text>
      </View>

      {/* 온보딩 CTA 카드 */}
      <View style={styles.ctaCard}>
        <View style={styles.ctaImageContainer}>
          <Image
            source={require('../../assets/images/empty-records.png')}
            style={styles.ctaImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.ctaTitle}>오늘 첫 기록을 남겨보세요</Text>
        <Text style={styles.ctaSubtitle}>
          기록이 3일 이상 쌓이면 패턴 분석을 시작해요
        </Text>
      </View>

      {/* 빠른 기록 버튼 그리드 (2×2) */}
      <Text style={styles.sectionTitle}>빠른 기록</Text>
      <View style={styles.gridContainer}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.gridItem}
            onPress={() => handleQuickAction(action.category)}
            activeOpacity={0.85}
          >
            <View style={[styles.iconBadge, { backgroundColor: `${action.color}1A` }]}>
              {action.icon}
            </View>
            <Text style={styles.gridLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  greetingCard: {
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.card,
    padding: spacing.cardPadding,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  greetingText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  babyName: {
    ...typography.h2,
    color: colors.text.primary,
  },
  daysText: {
    ...typography.bodyRegular,
    color: colors.accent,
    marginTop: spacing.xs,
  },
  ctaCard: {
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.card,
    padding: spacing.cardPadding,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  ctaImageContainer: {
    width: 160,
    height: 120,
    backgroundColor: colors.border,
    borderRadius: borderRadius.base,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaImage: {
    width: 160,
    height: 120,
  },
  ctaTitle: {
    ...typography.bodySemiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  ctaSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.bodySemiBold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gridItem: {
    width: '47%',
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.card,
    padding: spacing.cardPadding,
    alignItems: 'center',
    ...shadows.card,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  gridLabel: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
});
