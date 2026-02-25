import { View, Text, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../constants/theme';

interface InsightCardProps {
  insight: string | null;
}

export const InsightCard = ({ insight }: InsightCardProps) => {
  // null이면 카드 자체를 숨김 (공간 차지 금지)
  if (!insight) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Sparkles size={16} color={colors.accent} strokeWidth={1.8} />
        <Text style={styles.headerText}>AI 인사이트</Text>
      </View>
      <Text style={styles.insightText}>{insight}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.insightBg,
    borderRadius: borderRadius.card,
    padding: spacing.cardPadding,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: `${colors.accent}30`,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  headerText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  insightText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
});
