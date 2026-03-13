import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import type { Baby } from '../../types/database';
import type { HomeData } from '../../hooks/useHomeData';
import { colors, spacing } from '../../constants/theme';
import { HomeHeader } from './HomeHeader';
import { InsightCard } from './InsightCard';
import { TimerCardList } from './TimerCardList';
import { TimelineList } from './TimelineList';
import type { QuickCategory } from './QuickRecordSheet';

type HomeDashboardProps = {
  baby: Baby;
  babies: Baby[];
  onSwitchBaby: (baby: Baby) => void;
  onQuickAction?: (category: QuickCategory) => void;
  closeRowsRef?: React.MutableRefObject<(() => void) | null>;
} & HomeData;

export const HomeDashboard = ({
  baby,
  babies,
  onSwitchBaby,
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
  return (
    <>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={colors.accent} />
        }
      >
        {/* 공통 헤더 */}
        <HomeHeader baby={baby} babies={babies} onSwitchBaby={onSwitchBaby} />

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

        {/* 콘텐츠 */}
        <View style={styles.paddedContent}>
          <InsightCard insight={insight} />
          <TimelineList
            timeline={timeline}
            hasMoreTimeline={hasMoreTimeline}
            onRefresh={refresh}
            onLoadMore={loadMoreTimeline}
            closeRowsRef={closeRowsRef}
          />
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  paddedContent: {
    paddingHorizontal: spacing.screenPadding,
  },
});
