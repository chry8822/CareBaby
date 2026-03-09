import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Droplets, Moon, Wind, Utensils } from 'lucide-react-native';
import type { Feeding, Sleep, Diaper, Meal } from '../../types/database';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../constants/theme';
import { formatElapsed } from '../../lib/timeUtils';
import type { QuickCategory } from './QuickRecordSheet';

interface TimerCardListProps {
  lastFeeding: Feeding | null;
  lastSleep: Sleep | null;
  lastDiaper: Diaper | null;
  lastMeal: Meal | null;
  feedingElapsed: number;
  sleepElapsed: number;
  diaperElapsed: number;
  mealElapsed: number;
  onCardPress?: (category: QuickCategory) => void;
}

interface TimerCardData {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  elapsed: number;
  hasRecord: boolean;
  category: QuickCategory;
}

export const TimerCardList = ({
  lastFeeding,
  lastSleep,
  lastDiaper,
  lastMeal,
  feedingElapsed,
  sleepElapsed,
  diaperElapsed,
  mealElapsed,
  onCardPress,
}: TimerCardListProps) => {
  const cards: TimerCardData[] = [
    {
      key: 'feeding',
      label: '수유',
      icon: <Droplets size={24} color={colors.activity.nursing} strokeWidth={1.8} />,
      color: colors.activity.nursing,
      elapsed: feedingElapsed,
      hasRecord: !!lastFeeding,
      category: 'feeding',
    },
    {
      key: 'meal',
      label: '이유식',
      icon: <Utensils size={24} color={colors.activity.meal} strokeWidth={1.8} />,
      color: colors.activity.meal,
      elapsed: mealElapsed,
      hasRecord: !!lastMeal,
      category: 'meal',
    },
    {
      key: 'sleep',
      label: '수면',
      icon: <Moon size={24} color={colors.activity.sleep} strokeWidth={1.8} />,
      color: colors.activity.sleep,
      elapsed: sleepElapsed,
      hasRecord: !!lastSleep,
      category: 'sleep',
    },
    {
      key: 'diaper',
      label: '기저귀',
      icon: <Wind size={24} color={colors.activity.diaper} strokeWidth={1.8} />,
      color: colors.activity.diaper,
      elapsed: diaperElapsed,
      hasRecord: !!lastDiaper,
      category: 'diaper',
    },
  ];

  const handlePress = (category: QuickCategory) => {
    if (onCardPress) {
      onCardPress(category);
    } else {
      router.push(`/(tabs)/record?category=${category}` as never);
    }
  };

  return (
    <FlatList
      horizontal
      data={cards}
      keyExtractor={(item) => item.key}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}
      renderItem={({ item: card }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => handlePress(card.category)}
          activeOpacity={0.82}
        >
          {/* 상단: 아이콘 + 라벨 */}
          <View style={styles.cardTop}>
            <View style={[styles.iconBadge, { backgroundColor: `${card.color}1A` }]}>
              {card.icon}
            </View>
            <Text style={styles.cardLabel}>{card.label}</Text>
          </View>

          {/* 하단: 경과 시간 */}
          <View style={styles.cardBottom}>
            {card.hasRecord ? (
              <Text style={[styles.elapsedText, { color: card.color }]} numberOfLines={2}>
                {formatElapsed(card.elapsed)}
              </Text>
            ) : (
              <Text style={styles.emptyText} numberOfLines={1}>아직 없어요</Text>
            )}
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

const CARD_WIDTH = 152;

const styles = StyleSheet.create({
  scroll: {
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: 8,
    gap: spacing.sm,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.card,
    padding: 14, 
    ...shadows.card,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardLabel: {
    ...typography.bodySemiBold,
    color: colors.text.primary,
    flexShrink: 1,
  },
  cardBottom: {
    minHeight: 32,
    justifyContent: 'center',
  },
  elapsedText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  emptyText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});
