import { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  type ViewProps,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import type { ModalVariant, ModalPrimaryAction, ModalSecondaryAction } from '../../stores/uiStore';

// Animated.View에 children prop을 허용하는 타입 (React 19 strict 모드 대응)
type AnimatedViewProps = ViewProps & { children?: React.ReactNode };
const AnimatedView = Animated.View as React.ComponentType<AnimatedViewProps>;

interface AppModalProps {
  visible: boolean;
  variant?: ModalVariant;
  title?: string;
  message?: string;
  children?: React.ReactNode;
  primaryAction?: ModalPrimaryAction;
  secondaryAction?: ModalSecondaryAction;
  onClose?: () => void;
  closeOnBackdrop?: boolean;
}

export const AppModal = ({
  visible,
  title,
  message,
  children,
  primaryAction,
  secondaryAction,
  onClose,
  closeOnBackdrop = true,
}: AppModalProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
      scale.setValue(0.92);
    }
  }, [visible, opacity, scale]);

  const handleBackdropPress = () => {
    if (closeOnBackdrop && onClose) {
      onClose();
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <AnimatedView style={[styles.backdrop, { opacity }]}>
          <TouchableWithoutFeedback>
            <AnimatedView style={[styles.card, { transform: [{ scale }] }]}>
              {title ? <Text style={styles.title}>{title}</Text> : null}
              {message ? <Text style={styles.message}>{message}</Text> : null}
              {children}
              {(primaryAction || secondaryAction) ? (
                <View style={styles.actions}>
                  {secondaryAction ? (
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={secondaryAction.onPress}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.secondaryText}>{secondaryAction.label}</Text>
                    </TouchableOpacity>
                  ) : null}
                  {primaryAction ? (
                    <TouchableOpacity
                      style={[
                        styles.primaryButton,
                        primaryAction.variant === 'danger' && styles.dangerButton,
                      ]}
                      onPress={primaryAction.onPress}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.primaryText}>{primaryAction.label}</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}
            </AnimatedView>
          </TouchableWithoutFeedback>
        </AnimatedView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.card,
    padding: 24,
    ...shadows.elevated,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  primaryButton: {
    flex: 1,
    height: 48,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: colors.error,
  },
  primaryText: {
    ...typography.bodySemiBold,
    color: colors.white,
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    backgroundColor: colors.bg.primary,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryText: {
    ...typography.bodySemiBold,
    color: colors.text.secondary,
  },
});
