import { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated, Easing, StyleSheet, type ViewProps } from 'react-native';
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

export const AppModal = ({ visible, title, message, children, primaryAction, secondaryAction, onClose, closeOnBackdrop = true }: AppModalProps) => {
  // 실제 Modal visible — 닫기 애니메이션이 끝난 후 false로 전환
  const [showing, setShowing] = useState(visible);

  // 전체 오버레이(backdrop + 카드 + 텍스트) 한 번에 fade
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  // 카드 등장 scale (열 때만 사용)
  const cardScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible) {
      setShowing(true);

      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          tension: 150,
          friction: 20,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 100,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 0.5,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setShowing(false);
      });
    }
  }, [visible, overlayOpacity, cardScale]);

  const handleBackdropPress = () => {
    if (closeOnBackdrop && onClose) onClose();
  };

  return (
    <Modal transparent visible={showing} animationType="none" statusBarTranslucent onRequestClose={onClose}>
      {/* 전체를 하나의 Animated.View로 감싸서 opacity 일괄 적용 */}
      <AnimatedView style={[StyleSheet.absoluteFillObject, { opacity: overlayOpacity }]} renderToHardwareTextureAndroid shouldRasterizeIOS>
        {/* 배경 딤처리 */}
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* 카드 — AnimatedView는 scale 전달만, elevation은 내부 View에 분리 */}
        <View style={styles.centered} pointerEvents="box-none">
          <AnimatedView style={[styles.cardWrapper, { transform: [{ scale: cardScale }] }]}>
            <View style={styles.card}>
              {title ? <Text style={styles.title}>{title}</Text> : null}
              {message ? <Text style={styles.message}>{message}</Text> : null}
              {children}
              {primaryAction || secondaryAction ? (
                <View style={styles.actions}>
                  {secondaryAction ? (
                    <TouchableOpacity style={styles.secondaryButton} onPress={secondaryAction.onPress} activeOpacity={0.8}>
                      <Text style={styles.secondaryText}>{secondaryAction.label}</Text>
                    </TouchableOpacity>
                  ) : null}
                  {primaryAction ? (
                    <TouchableOpacity
                      style={[styles.primaryButton, primaryAction.variant === 'danger' && styles.dangerButton]}
                      onPress={primaryAction.onPress}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.primaryText}>{primaryAction.label}</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}
            </View>
          </AnimatedView>
        </View>
      </AnimatedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    zIndex: 0,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  cardWrapper: {
    width: '100%',
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
