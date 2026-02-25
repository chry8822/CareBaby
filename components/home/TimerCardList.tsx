import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Droplets, Moon, Wind } from 'lucide-react-native';
import type { Feeding, Sleep, Diaper } from '../../types/database';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../constants/theme';
import { formatElapsed } from '../../lib/timeUtils';

interface TimerCardListProps {
  lastFeeding: Feeding | null;
  lastSleep: Sleep | null;
  lastDiaper: Diaper | null;
  feedingElapsed: number;
  sleepElapsed: number;
  diaperElapsed: number;
}

interface TimerCardData {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  elapsed: number;
  hasRecord: boolean;
  category: string;
}

export const TimerCardList = ({
  lastFeeding,
  lastSleep,
  lastDiaper,
  feedingElapsed,
  sleepElapsed,
  diaperElapsed,
}: TimerCardListProps) => {
  const cards: TimerCardData[] = [
    {
      key: 'feeding',
      label: '수유',
      icon: <Droplets size={28} color={colors.activity.nursing} strokeWidth={1.8} />,
      color: colors.activity.nursing,
      elapsed: feedingElapsed,
      hasRecord: !!lastFeeding,
      category: 'feeding',
    },
    {
      key: 'sleep',
      label: '수면',
      icon: <Moon size={28} color={colors.activity.sleep} strokeWidth={1.8} />,
      color: colors.activity.sleep,
      elapsed: sleepElapsed,
      hasRecord: !!lastSleep,
      category: 'sleep',
    },
    {
      key: 'diaper',
      label: '기저귀',
      icon: <Wind size={28} color={colors.activity.diaper} strokeWidth={1.8} />,
      color: colors.activity.diaper,
      elapsed: diaperElapsed,
      hasRecord: !!lastDiaper,
      category: 'diaper',
    },
  ];

  const handlePress = (category: string) => {
    router.push(`/(tabs)/record?category=${category}` as never);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}
    >
      {cards.map((card) => (
        <TouchableOpacity
          key={card.key}
          style={styles.card}
          onPress={() => handlePress(card.category)}
          activeOpacity={0.85}
        >
          <View style={[styles.iconBadge, { backgroundColor: `${card.color}1A` }]}>
            {card.icon}
          </View>
          <Text style={styles.cardLabel}>{card.label}</Text>
          <Text style={[styles.elapsedText, !card.hasRecord && styles.emptyText]}>
            {card.hasRecord ? `마지막 ${formatElapsed(card.elapsed)}` : '아직 없어요'}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    marginBottom: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.md,
  },
  card: {
    width: 130,
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.card,
    padding: spacing.cardPadding,
    alignItems: 'center',
    ...shadows.card,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  cardLabel: {
    ...typography.bodySemiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  elapsedText: {
    ...typography.caption,
    color: colors.accent,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.text.secondary,
  },
});
