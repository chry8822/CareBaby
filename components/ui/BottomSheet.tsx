import { useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const HANDLE_AREA_HEIGHT = 52;

type SnapPoint = '25%' | '50%' | '75%' | '80%' | '90%';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  snapPoints?: SnapPoint[];
  title?: string;
  children: React.ReactNode;
  closeOnBackdrop?: boolean;
}

const snapToHeight = (snap: SnapPoint): number => {
  const pct = parseInt(snap, 10) / 100;
  return SCREEN_HEIGHT * pct;
};

export const BottomSheet = ({
  visible,
  onClose,
  snapPoints = ['50%', '90%'],
  title,
  children,
  closeOnBackdrop = true,
}: BottomSheetProps) => {
  const defaultHeight = snapToHeight(snapPoints[0]);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(defaultHeight)).current;
  // addListener로 항상 정확한 현재 위치 추적 (애니메이션 중에도 정확)
  const currentTranslateY = useRef(defaultHeight);

  useEffect(() => {
    const id = sheetTranslateY.addListener(({ value }) => {
      currentTranslateY.current = value;
    });
    return () => sheetTranslateY.removeListener(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animateOpen = useCallback(() => {
    sheetTranslateY.setValue(defaultHeight);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        damping: 22,
        stiffness: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, sheetTranslateY, defaultHeight]);

  const animateClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: defaultHeight,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [backdropOpacity, sheetTranslateY, defaultHeight, onClose]);

  // animateClose ref — PanResponder 클로저에서 최신 참조
  const animateCloseRef = useRef(animateClose);
  animateCloseRef.current = animateClose;

  useEffect(() => {
    if (visible) {
      animateOpen();
    }
  }, [visible, animateOpen]);

  const panResponder = useRef(
    PanResponder.create({
      // ★ false: 탭은 PanResponder가 가로채지 않음 → 애니메이션 중 탭 버그 방지
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 4,

      onPanResponderGrant: () => {
        // addListener로 currentTranslateY가 항상 정확하므로 안전
        sheetTranslateY.stopAnimation();
        sheetTranslateY.setOffset(currentTranslateY.current);
        sheetTranslateY.setValue(0);
      },

      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) {
          sheetTranslateY.setValue(gs.dy);
        }
      },

      onPanResponderRelease: (_, gs) => {
        sheetTranslateY.flattenOffset();
        if (gs.dy > 80 || gs.vy > 0.5) {
          animateCloseRef.current();
        } else {
          Animated.spring(sheetTranslateY, {
            toValue: 0,
            damping: 22,
            stiffness: 260,
            useNativeDriver: true,
          }).start();
        }
      },

      onPanResponderTerminate: () => {
        sheetTranslateY.flattenOffset();
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          damping: 22,
          stiffness: 260,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  const statusBarHeight =
    Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={animateClose}
    >
      {/* 딤 배경 */}
      <Animated.View
        style={[StyleSheet.absoluteFillObject, styles.backdrop, { opacity: backdropOpacity }]}
      >
        {closeOnBackdrop ? (
          <TouchableWithoutFeedback onPress={animateClose}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
        ) : (
          <View style={StyleSheet.absoluteFillObject} />
        )}
      </Animated.View>

      {/* 시트 */}
      <View
        style={[styles.sheetWrapper, { paddingTop: statusBarHeight }]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.sheet,
            { height: defaultHeight, transform: [{ translateY: sheetTranslateY }] },
          ]}
        >
          {/* 드래그 핸들 영역 (드래그만 인식, 탭 무시) */}
          <View style={styles.dragArea} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          {/* 타이틀 + X 버튼 */}
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {title ?? ''}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={animateClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.6}
            >
              <X size={20} color={colors.text.secondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* 콘텐츠 */}
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: colors.overlay,
  },
  sheetWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bg.elevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  dragArea: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minHeight: 40,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  content: {
    flex: 1,
  },
});
