import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { BarChart2 } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';

const StatsScreen = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>통계</Text>
      <Text style={styles.subtitle}>패턴 분석 및 인사이트</Text>

      <View style={styles.comingSoonCard}>
        <Image
          source={require('../../assets/images/stats-coming-soon.png')}
          style={styles.illustration}
          resizeMode="contain"
        />
        <View style={styles.iconWrapper}>
          <BarChart2 color={colors.activity.growth} size={28} />
        </View>
        <Text style={styles.comingSoonTitle}>AI 패턴 분석</Text>
        <Text style={styles.comingSoonDesc}>
          수유·수면 패턴을 AI가 분석해{'\n'}맞춤 인사이트를 제공할 예정이에요.
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>준비 중</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  content: {
    padding: spacing.screenPadding,
    paddingTop: 60,
  },
  title: {
    ...typography.display,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.sectionGap,
  },
  comingSoonCard: {
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.card,
    padding: spacing.cardPadding,
    alignItems: 'center',
    ...shadows.card,
  },
  illustration: {
    width: 160,
    height: 120,
    marginBottom: spacing.lg,
    opacity: 0.7,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.base,
    backgroundColor: `${colors.activity.growth}18`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  comingSoonTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  comingSoonDesc: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: `${colors.activity.growth}18`,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    ...typography.caption,
    color: colors.activity.growth,
    fontWeight: '600',
  },
});

export default StatsScreen;
