import type { ReactNode } from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { colors, borderRadius, spacing, shadows } from '../../constants/theme';

interface CardProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
}

export const Card = ({ children, style, elevated = false }: CardProps) => {
  return (
    <View style={[styles.card, elevated && styles.elevated, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.card,
    padding: spacing.cardPadding,
    ...shadows.card,
  },
  elevated: {
    ...shadows.elevated,
  },
});
