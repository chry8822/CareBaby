import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { colors, typography, spacing } from '../../constants/theme';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** subtitle 옆에 전환 버튼 표시 (true이면 ChevronDown 아이콘 노출) */
  onSubtitlePress?: () => void;
  /** 하단 구분선 표시 여부 (기본 true) */
  bordered?: boolean;
}

export const PageHeader = ({ title, subtitle, onSubtitlePress, bordered = true }: PageHeaderProps) => (
  <View style={[styles.header, bordered && styles.bordered]}>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? (
      onSubtitlePress ? (
        <TouchableOpacity style={styles.subtitleRow} onPress={onSubtitlePress} activeOpacity={0.7}>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <ChevronDown size={13} color={colors.text.secondary} strokeWidth={2} />
        </TouchableOpacity>
      ) : (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )
    ) : null}
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
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});
