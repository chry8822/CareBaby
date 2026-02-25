import { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Animated.View에 children prop을 허용하는 타입 (React 19 strict 모드 대응)
type AnimatedViewProps = ViewProps & { children?: React.ReactNode };
const AnimatedView = Animated.View as React.ComponentType<AnimatedViewProps>;
import { colors, typography, borderRadius } from '../../constants/theme';
import type { ToastType } from '../../stores/uiStore';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
}

const BG_COLORS: Record<ToastType, string> = {
  success: colors.toast.success,
  error: colors.toast.error,
  info: colors.toast.info,
};

export const Toast = ({
  visible,
  message,
  type = 'success',
  duration = 2000,
  onHide,
}: ToastProps) => {
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onHideRef = useRef(onHide);
  onHideRef.current = onHide;

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 80,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onHideRef.current?.());
  };

  useEffect(() => {
    if (visible) {
      translateY.setValue(80);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        hide();
      }, duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [visible, duration]);

  if (!visible) return null;

  return (
    <AnimatedView
      style={[
        styles.container,
        {
          backgroundColor: BG_COLORS[type],
          bottom: insets.bottom + 16,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 24,
    right: 24,
    borderRadius: borderRadius.base,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 9999,
  },
  text: {
    ...typography.bodySemiBold,
    color: colors.white,
  },
});
