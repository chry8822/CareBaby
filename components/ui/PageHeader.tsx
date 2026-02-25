import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** 하단 구분선 표시 여부 (기본 true) */
  bordered?: boolean;
}

export const PageHeader = ({ title, subtitle, bordered = true }: PageHeaderProps) => (
  <View style={[styles.header, bordered && styles.bordered]}>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  bordered: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text.primary,
    lineHeight: 26,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
});
