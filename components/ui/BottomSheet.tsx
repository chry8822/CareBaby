import { useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const HANDLE_AREA_HEIGHT = 44;

type SnapPoint = '25%' | '50%' | '75%' | '90%';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  snapPoints?: SnapPoint[];
  title?: string;
  children: React.ReactNode;
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
}: BottomSheetProps) => {
  const defaultHeight = snapToHeight(snapPoints[0]);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(defaultHeight)).current;
  const currentTranslateY = useRef(defaultHeight);

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
    ]).start(() => {
      currentTranslateY.current = 0;
    });
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
      currentTranslateY.current = 0;
    });
  }, [backdropOpacity, sheetTranslateY, defaultHeight, onClose]);

  useEffect(() => {
    if (visible) {
      animateOpen();
    }
  }, [visible, animateOpen]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 4,
      onPanResponderGrant: () => {
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
          animateClose();
        } else {
          Animated.spring(sheetTranslateY, {
            toValue: 0,
            damping: 22,
            stiffness: 260,
            useNativeDriver: true,
          }).start(() => {
            currentTranslateY.current = 0;
          });
        }
      },
      onPanResponderTerminate: () => {
        sheetTranslateY.flattenOffset();
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          damping: 22,
          stiffness: 260,
          useNativeDriver: true,
        }).start(() => {
          currentTranslateY.current = 0;
        });
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
        <TouchableWithoutFeedback onPress={animateClose}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* 시트 — KeyboardAvoidingView를 여기서 관리하지 않음.
          내부 컴포넌트가 각자 필요에 따라 처리한다. */}
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
          {/* 드래그 핸들 + 타이틀 영역 */}
          <View style={styles.dragArea} {...panResponder.panHandlers}>
            <View style={styles.handle} />
            {title ? <Text style={styles.title}>{title}</Text> : null}
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
    height: HANDLE_AREA_HEIGHT,
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
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  content: {
    flex: 1,
  },
});
