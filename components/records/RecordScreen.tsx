import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Heart, MoreHorizontal, Construction } from 'lucide-react-native';
import { FeedingForm } from './FeedingForm';
import { SleepForm } from './SleepForm';
import { DiaperForm } from './DiaperForm';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import { PageHeader } from '../ui/PageHeader';

type TabKey = 'feeding' | 'sleep' | 'diaper' | 'growth' | 'health' | 'more';

interface Tab {
  key: TabKey;
  label: string;
}

const TABS: Tab[] = [
  { key: 'feeding', label: '수유' },
  { key: 'sleep', label: '수면' },
  { key: 'diaper', label: '기저귀' },
  { key: 'growth', label: '성장' },
  { key: 'health', label: '건강' },
  { key: 'more', label: '더보기' },
];

const TAB_COLORS: Record<TabKey, string> = {
  feeding: colors.activity.nursing,
  sleep: colors.activity.sleep,
  diaper: colors.activity.diaper,
  growth: colors.activity.growth,
  health: colors.accent,
  more: colors.text.secondary,
};

const ComingSoonPlaceholder = ({
  tabKey,
}: {
  tabKey: 'growth' | 'health' | 'more';
}) => {
  const config: Record<
    'growth' | 'health' | 'more',
    { Icon: typeof TrendingUp; label: string; desc: string }
  > = {
    growth: {
      Icon: TrendingUp,
      label: '성장 기록',
      desc: '키, 몸무게 등 성장 데이터를\n기록하고 차트로 확인해요.',
    },
    health: {
      Icon: Heart,
      label: '건강 기록',
      desc: '예방접종, 병원 방문 기록을\n한곳에서 관리해요.',
    },
    more: {
      Icon: MoreHorizontal,
      label: '더보기',
      desc: '더 많은 기록 기능이\n곧 추가될 예정이에요.',
    },
  };

  const { Icon, label, desc } = config[tabKey];

  return (
    <View style={comingSoonStyles.container}>
      <View style={comingSoonStyles.iconWrapper}>
        <Icon color={colors.text.secondary} size={36} />
      </View>
      <Text style={comingSoonStyles.title}>{label}</Text>
      <Text style={comingSoonStyles.desc}>{desc}</Text>
      <View style={comingSoonStyles.badge}>
        <Construction size={12} color={colors.accent} />
        <Text style={comingSoonStyles.badgeText}>준비 중</Text>
      </View>
    </View>
  );
};

const comingSoonStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.screenPadding,
    paddingBottom: 80,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.card,
    backgroundColor: colors.bg.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  desc: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: `${colors.accent}18`,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
});

export type { TabKey };

interface RecordScreenProps {
  initialTab?: TabKey;
}

export const RecordScreen = ({ initialTab }: RecordScreenProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab ?? 'feeding');
  const flatListRef = useRef<FlatList<Tab>>(null);

  // initialTab이 외부에서 변경될 때 동기화 (홈 → 기록탭 딥링크 대응)
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const renderTab = ({ item }: { item: Tab }) => {
    const isActive = activeTab === item.key;
    const tabColor = TAB_COLORS[item.key];
    return (
      <TouchableOpacity
        style={[
          styles.tab,
          isActive && { backgroundColor: tabColor },
        ]}
        onPress={() => setActiveTab(item.key)}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'feeding':
        return <FeedingForm />;
      case 'sleep':
        return <SleepForm />;
      case 'diaper':
        return <DiaperForm />;
      case 'growth':
        return <ComingSoonPlaceholder tabKey="growth" />;
      case 'health':
        return <ComingSoonPlaceholder tabKey="health" />;
      case 'more':
        return <ComingSoonPlaceholder tabKey="more" />;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PageHeader title="기록하기" subtitle="오늘의 육아를 기록해요" />

      <View style={styles.tabBarWrapper}>
        <FlatList
          ref={flatListRef}
          data={TABS}
          renderItem={renderTab}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        />
      </View>

      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  tabBarWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabBar: {
    paddingHorizontal: spacing.screenPadding - spacing.sm,
    paddingVertical: spacing.sm,
    gap: 4,
  },
  tab: {
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
  },
});
