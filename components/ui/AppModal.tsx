import { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  StyleSheet,
  type ViewProps,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import type { ModalVariant, ModalPrimaryAction, ModalSecondaryAction } from '../../stores/uiStore';

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
  // 배경 딤처리: 독립적으로 fade
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  // 카드: opacity + translateY
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      // 초기값 리셋
      backdropOpacity.setValue(0);
      cardOpacity.setValue(0);
      cardTranslateY.setValue(20);

      Animated.parallel([
        // 배경: 부드럽게 fade in
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        // 카드: 위로 올라오며 fade in
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslateY, {
          toValue: 0,
          tension: 70,
          friction: 14,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 150,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(cardTranslateY, {
          toValue: 10,
          duration: 150,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, backdropOpacity, cardOpacity, cardTranslateY]);

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
      {/* 배경 딤처리 레이어 */}
      <AnimatedView
        style={[styles.backdrop, { opacity: backdropOpacity }]}
        pointerEvents="box-none"
      >
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>
      </AnimatedView>

      {/* 카드 레이어 */}
      <View style={styles.centered} pointerEvents="box-none">
        <AnimatedView
          style={[
            styles.card,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslateY }],
            },
          ]}
        >
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
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  centered: {
    flex: 1,
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
    fontSize: 17,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    lineHeight: 22,
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
