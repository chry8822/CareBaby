import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Droplets, Moon, Wind, Plus } from 'lucide-react-native';
import type { Baby } from '../../types/database';
import type { HomeData } from '../../hooks/useHomeData';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../constants/theme';
import { getDaysSinceBirth, getGreeting, formatDuration } from '../../lib/timeUtils';
import { BabyAvatar } from './BabyAvatar';
import { InsightCard } from './InsightCard';
import { TimerCardList } from './TimerCardList';
import { TimelineList } from './TimelineList';

// HomeData에서 refresh와 isLoading만 추출하는 타입
type HomeDashboardProps = {
  baby: Baby;
} & HomeData;

const QUICK_ACTIONS = [
  { label: '모유', icon: <Droplets size={18} color={colors.activity.nursing} strokeWidth={1.8} />, color: colors.activity.nursing, category: 'feeding' },
  { label: '분유', icon: <Droplets size={18} color={colors.activity.nursing} strokeWidth={1.8} />, color: colors.activity.nursing, category: 'feeding' },
  { label: '수면', icon: <Moon size={18} color={colors.activity.sleep} strokeWidth={1.8} />, color: colors.activity.sleep, category: 'sleep' },
  { label: '기저귀', icon: <Wind size={18} color={colors.activity.diaper} strokeWidth={1.8} />, color: colors.activity.diaper, category: 'diaper' },
];

export const HomeDashboard = ({
  baby,
  lastFeeding,
  lastSleep,
  lastDiaper,
  feedingElapsed,
  sleepElapsed,
  diaperElapsed,
  todaySummary,
  insight,
  timeline,
  isLoading,
  refresh,
}: HomeDashboardProps) => {
  const greeting = getGreeting();
  const daysSince = getDaysSinceBirth(baby.birth_date);

  const handleQuickAction = (category: string) => {
    router.push(`/(tabs)/record?category=${category}` as never);
  };

  const summaryText = [
    `수유 ${todaySummary.feedingCount}회`,
    todaySummary.totalSleepSeconds > 0
      ? `수면 ${formatDuration(todaySummary.totalSleepSeconds)}`
      : null,
    `기저귀 ${todaySummary.diaperCount}회`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refresh}
          tintColor={colors.accent}
        />
      }
    >
      {/* 5-1. 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greetingText}>{greeting}</Text>
          <Text style={styles.babyName}>{baby.name}</Text>
          <Text style={styles.daysText}>생후 {daysSince}일</Text>
        </View>
        <BabyAvatar uri={baby.avatar_url} size={52} />
      </View>

      {/* 5-2. 타이머 카드 (수평 스크롤, 패딩 없이 full-bleed) */}
      <TimerCardList
        lastFeeding={lastFeeding}
        lastSleep={lastSleep}
        lastDiaper={lastDiaper}
        feedingElapsed={feedingElapsed}
        sleepElapsed={sleepElapsed}
        diaperElapsed={diaperElapsed}
      />

      {/* 이하 섹션은 수평 패딩 */}
      <View style={styles.paddedContent}>
        {/* 5-3. 오늘 요약 한 줄 */}
        <Text style={styles.summaryText}>{summaryText}</Text>

        {/* 5-4. AI 인사이트 카드 */}
        <InsightCard insight={insight} />

        {/* 5-5. 타임라인 */}
        <TimelineList timeline={timeline} />

        {/* 5-6. 빠른 기록 버튼 (1행 수평 스크롤) */}
        <Text style={styles.sectionLabel}>빠른 기록</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickScrollContent}
        style={styles.quickScroll}
      >
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.quickBtn}
            onPress={() => handleQuickAction(action.category)}
            activeOpacity={0.85}
          >
            <View style={[styles.quickBtnIcon, { backgroundColor: `${action.color}1A` }]}>
              {action.icon}
            </View>
            <Text style={styles.quickBtnLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}

        {/* [+] 전체 기록 탭으로 이동 */}
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => router.push('/(tabs)/record' as never)}
          activeOpacity={0.85}
        >
          <View style={[styles.quickBtnIcon, { backgroundColor: colors.border }]}>
            <Plus size={18} color={colors.text.secondary} strokeWidth={1.8} />
          </View>
          <Text style={styles.quickBtnLabel}>더보기</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 5-7. 광고 배너 자리 (Phase 7 AdMob 연동 예정) */}
      <View style={styles.adBanner}>
        {/* AdMob 배너 광고 - Phase 7 */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  greetingText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  babyName: {
    ...typography.h2,
    color: colors.text.primary,
  },
  daysText: {
    ...typography.caption,
    color: colors.accent,
    marginTop: 2,
  },
  paddedContent: {
    paddingHorizontal: spacing.screenPadding,
  },
  summaryText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.bodySemiBold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  quickScroll: {
    marginBottom: spacing.lg,
  },
  quickScrollContent: {
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.sm,
  },
  quickBtn: {
    alignItems: 'center',
    minWidth: 60,
  },
  quickBtnIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    ...shadows.card,
  },
  quickBtnLabel: {
    ...typography.caption,
    color: colors.text.primary,
  },
  adBanner: {
    height: 52,
    marginHorizontal: spacing.screenPadding,
    marginBottom: spacing.xxl,
    backgroundColor: colors.border,
    borderRadius: borderRadius.base,
    // Phase 7: AdMob 배너 광고 영역
  },
});
