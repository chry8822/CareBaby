import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, typography, borderRadius } from '../../constants/theme';

interface SaveButtonProps {
  onPress: () => void;
  isLoading: boolean;
  label?: string;
}

export const SaveButton = ({ onPress, isLoading, label = '기록 저장' }: SaveButtonProps) => (
  <TouchableOpacity
    style={[styles.button, isLoading && styles.disabled]}
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
    backgroundColor: colors.accent,
    borderRadius: borderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    ...typography.bodySemiBold,
    color: colors.white,
    fontSize: 16,
  },
});
