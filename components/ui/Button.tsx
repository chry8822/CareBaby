import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
} from 'react-native';
import { colors, typography, borderRadius, shadows } from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = ({
  label,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps) => {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.white : colors.accent}
          size="small"
        />
      ) : (
        <Text style={[styles.label, styles[`label_${variant}`], styles[`labelSize_${size}`]]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.base,
  },
  primary: {
    backgroundColor: colors.accent,
    ...shadows.card,
  },
  secondary: {
    backgroundColor: colors.bg.elevated,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  size_sm: {
    height: 40,
    paddingHorizontal: 16,
  },
  size_md: {
    height: 52,
    paddingHorizontal: 24,
  },
  size_lg: {
    height: 58,
    paddingHorizontal: 32,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontWeight: '600',
  },
  label_primary: {
    color: colors.white,
  },
  label_secondary: {
    color: colors.accent,
  },
  label_ghost: {
    color: colors.accent,
  },
  labelSize_sm: {
    ...typography.caption,
    fontWeight: '600',
  },
  labelSize_md: {
    ...typography.bodyRegular,
    fontWeight: '600',
  },
  labelSize_lg: {
    fontSize: 16,
    fontWeight: '600',
  },
});
