import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import type { Baby } from '../../types/database';
import type { HomeData } from '../../hooks/useHomeData';
import { colors, typography, spacing } from '../../constants/theme';
import { getDaysSinceBirth, getGreeting, formatDuration } from '../../lib/timeUtils';
import { BabyAvatar } from './BabyAvatar';
import { InsightCard } from './InsightCard';
import { TimerCardList } from './TimerCardList';
import { TimelineList } from './TimelineList';
import type { QuickCategory } from './QuickRecordSheet';

type HomeDashboardProps = {
  baby: Baby;
  onQuickAction?: (category: QuickCategory) => void;
  closeRowsRef?: React.MutableRefObject<(() => void) | null>;
} & HomeData;

export const HomeDashboard = ({
  baby,
  lastFeeding,
  lastSleep,
  lastDiaper,
  lastMeal,
  feedingElapsed,
  sleepElapsed,
  diaperElapsed,
  mealElapsed,
  todaySummary,
  insight,
  timeline,
  hasMoreTimeline,
  isLoading,
  refresh,
  loadMoreTimeline,
  onQuickAction,
  closeRowsRef,
}: HomeDashboardProps) => {
  const greeting = getGreeting();
  const daysSince = getDaysSinceBirth(baby.birth_date);

  const summaryParts: string[] = [
    `수유 ${todaySummary.feedingCount}회`,
    todaySummary.mealCount > 0 ? `이유식 ${todaySummary.mealCount}회` : null,
    todaySummary.totalSleepSeconds > 0 ? `수면 ${formatDuration(todaySummary.totalSleepSeconds)}` : null,
    `기저귀 ${todaySummary.diaperCount}회`,
  ].filter(Boolean) as string[];

  const summaryText = summaryParts.join(' · ');

  return (
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={colors.accent} />}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greetingText}>{greeting}</Text>
          <Text style={styles.babyName}>{baby.name}</Text>
          <Text style={styles.daysText}>생후 {daysSince}일</Text>
        </View>
        <BabyAvatar uri={baby.avatar_url} size={52} />
      </View>

      {/* 타이머 카드 (수평 스크롤) */}
      <TimerCardList
        lastFeeding={lastFeeding}
        lastSleep={lastSleep}
        lastDiaper={lastDiaper}
        lastMeal={lastMeal}
        feedingElapsed={feedingElapsed}
        sleepElapsed={sleepElapsed}
        diaperElapsed={diaperElapsed}
        mealElapsed={mealElapsed}
        onCardPress={onQuickAction}
      />

      {/* 패딩 콘텐츠 */}
      <View style={styles.paddedContent}>
        {/* 오늘 요약 */}
        {/* AI 인사이트 카드 */}
        <InsightCard insight={insight} />

        {/* 타임라인 */}
        <TimelineList timeline={timeline} hasMoreTimeline={hasMoreTimeline} onRefresh={refresh} onLoadMore={loadMoreTimeline} closeRowsRef={closeRowsRef} />
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
});
