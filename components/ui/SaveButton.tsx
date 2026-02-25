import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, typography, borderRadius, shadows } from '../../constants/theme';

interface SaveButtonProps {
  onPress: () => void;
  isLoading: boolean;
  label?: string;
  color?: string;
}

export const SaveButton = ({
  onPress,
  isLoading,
  label = '기록 저장',
  color = colors.accent,
}: SaveButtonProps) => (
  <TouchableOpacity
    style={[styles.button, { backgroundColor: color }, isLoading && styles.disabled]}
    onPress={onPress}
    disabled={isLoading}
    activeOpacity={0.85}
  >
    {isLoading ? (
      <ActivityIndicator color={colors.white} size="small" />
    ) : (
      <Text style={styles.label}>{label}</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: borderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.card,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    ...typography.bodySemiBold,
    color: colors.white,
    fontSize: 15,
    letterSpacing: 0.2,
  },
});
