import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Droplets, Moon, Wind, Utensils } from 'lucide-react-native';
import type { Baby } from '../../types/database';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import { HomeHeader } from './HomeHeader';
import type { QuickCategory } from './QuickRecordSheet';

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  color: string;
  category: QuickCategory;
}

interface HomeEmptyProps {
  baby: Baby;
  babies: Baby[];
  onSwitchBaby: (baby: Baby) => void;
  onQuickAction?: (category: QuickCategory) => void;
}

export const HomeEmpty = ({ baby, babies, onSwitchBaby, onQuickAction }: HomeEmptyProps) => {
  const quickActions: QuickAction[] = [
    {
      label: '수유',
      icon: <Droplets size={24} color={colors.activity.nursing} strokeWidth={1.8} />,
      color: colors.activity.nursing,
      category: 'feeding',
    },
    {
      label: '이유식',
      icon: <Utensils size={24} color={colors.activity.meal} strokeWidth={1.8} />,
      color: colors.activity.meal,
      category: 'meal',
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

  const handleQuickAction = (category: QuickCategory) => {
    if (onQuickAction) {
      onQuickAction(category);
    } else {
      router.push(`/(tabs)/record?category=${category}` as never);
    }
  };

  return (
    <>
      {/* 공통 헤더 — ScrollView 바깥에서 렌더링 (패딩 중복 방지) */}
      <HomeHeader baby={baby} babies={babies} onSwitchBaby={onSwitchBaby} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
      {/* 온보딩 CTA 카드 */}
      <View style={styles.ctaCard}>
        <View style={styles.ctaImageContainer}>
          <Image
            source={require('../../assets/images/empty-home.png')}
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
    </>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxl * 2,
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
    borderRadius: borderRadius.base,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaImage: {
    width: 180,
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
