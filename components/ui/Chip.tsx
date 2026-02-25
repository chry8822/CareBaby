import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}

export const Chip = ({ label, selected, onPress, color }: ChipProps) => {
  const activeColor = color ?? colors.accent;

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        selected && { backgroundColor: activeColor, borderColor: activeColor },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.label,
          selected && styles.labelSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bg.elevated,
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  labelSelected: {
    color: colors.white,
    fontWeight: '600',
  },
});
