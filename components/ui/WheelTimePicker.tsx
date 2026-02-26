import { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Animated,
  PanResponder,
  Easing,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  type ViewProps,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';

// React 19 strict 모드 대응
type AnimatedViewProps = ViewProps & { children?: React.ReactNode };
const AnimatedView = Animated.View as React.ComponentType<AnimatedViewProps>;

const ITEM_HEIGHT = 54;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS; // 270
const SHEET_OFFSCREEN = 600;

const pad = (n: number) => String(n).padStart(2, '0');

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

const generateDates = (): Date[] => {
  const dates: Date[] = [];
  for (let i = 0; i < 8; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    dates.push(d);
  }
  return dates;
};

const DATE_OPTIONS = generateDates();

const formatDateLabel = (date: Date, idx: number): string => {
  if (idx === 0) return '오늘';
  if (idx === 1) return '어제';
  if (idx === 2) return '그저께';
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
};

export interface WheelTimePickerProps {
  visible: boolean;
  value: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  accentColor?: string;
  title?: string;
  mode?: 'time' | 'datetime';
}

export const WheelTimePicker = ({
  visible,
  value,
  onConfirm,
  onCancel,
  accentColor = colors.accent,
  title = '시간 선택',
  mode = 'time',
}: WheelTimePickerProps) => {
  const [pendingHour, setPendingHour] = useState(0);
  const [pendingMinute, setPendingMinute] = useState(0);
  const [pendingDateIdx, setPendingDateIdx] = useState(0);

  const hourRef = useRef<ScrollView>(null);
  const minuteRef = useRef<ScrollView>(null);
  const dateRef = useRef<ScrollView>(null);

  // 애니메이션 값: 딤과 시트를 완전히 분리
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SHEET_OFFSCREEN)).current;

  // onCancel을 ref로 관리 (PanResponder 내부에서 안정적으로 참조)
  const onCancelRef = useRef(onCancel);
  useEffect(() => { onCancelRef.current = onCancel; }, [onCancel]);

  // 닫기 애니메이션 후 onCancel 호출
  const closeSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SHEET_OFFSCREEN,
        duration: 280,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => onCancelRef.current());
  }, [backdropOpacity, sheetTranslateY]);

  // 드래그로 닫기 (핸들 + 타이틀 영역에 부착)
  const panResponder = useRef(
    PanResponder.create({
      // 터치 시작 즉시 핸들 영역의 제스처를 캡처
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gs) =>
        gs.dy > 4 && Math.abs(gs.dy) > Math.abs(gs.dx),
      onPanResponderGrant: () => {
        // 제스처 시작 시 현재 위치 기준으로 오프셋 설정
        sheetTranslateY.setOffset(0);
        sheetTranslateY.setValue(0);
      },
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) {
          sheetTranslateY.setValue(gs.dy);
        }
      },
      onPanResponderRelease: (_, gs) => {
        sheetTranslateY.flattenOffset();
        if (gs.dy > 100 || gs.vy > 0.7) {
          // 충분히 내렸으면 닫기 애니메이션
          Animated.parallel([
            Animated.timing(backdropOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(sheetTranslateY, {
              toValue: SHEET_OFFSCREEN,
              duration: 260,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]).start(() => onCancelRef.current());
        } else {
          // 살짝 내렸으면 원위치 스냅
          Animated.spring(sheetTranslateY, {
            toValue: 0,
            tension: 80,
            friction: 14,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        // 다른 제스처가 가로채면 원위치
        sheetTranslateY.flattenOffset();
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          tension: 80,
          friction: 14,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  // visible 변경 시 열기 애니메이션
  useEffect(() => {
    if (!visible) return;

    const h = value.getHours();
    const m = value.getMinutes();
    const valueDay = new Date(value);
    valueDay.setHours(0, 0, 0, 0);
    const dateIdx = DATE_OPTIONS.findIndex((d) => d.getTime() === valueDay.getTime());
    const resolvedDateIdx = dateIdx >= 0 ? dateIdx : 0;

    setPendingHour(h);
    setPendingMinute(m);
    setPendingDateIdx(resolvedDateIdx);

    // 초기값 리셋
    backdropOpacity.setValue(0);
    sheetTranslateY.setValue(SHEET_OFFSCREEN);

    // 딤: fade in / 시트: spring으로 슬라이드 업
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        tension: 60,
        friction: 14,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      hourRef.current?.scrollTo({ y: h * ITEM_HEIGHT, animated: false });
      minuteRef.current?.scrollTo({ y: m * ITEM_HEIGHT, animated: false });
      if (mode === 'datetime') {
        dateRef.current?.scrollTo({ y: resolvedDateIdx * ITEM_HEIGHT, animated: false });
      }
    }, 80);

    return () => clearTimeout(timer);
  }, [visible, mode]);

  const handleHourScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(23, idx));
      setPendingHour(clamped);
      hourRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
    },
    [],
  );

  const handleMinuteScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(59, idx));
      setPendingMinute(clamped);
      minuteRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
    },
    [],
  );

  const handleDateScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(DATE_OPTIONS.length - 1, idx));
      setPendingDateIdx(clamped);
      dateRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
    },
    [],
  );

  const handleConfirm = () => {
    const result = new Date(value);
    if (mode === 'datetime') {
      const base = DATE_OPTIONS[pendingDateIdx];
      result.setFullYear(base.getFullYear(), base.getMonth(), base.getDate());
    }
    result.setHours(pendingHour, pendingMinute, 0, 0);
    onConfirm(result);
  };

  const renderColumn = (
    labels: string[],
    selectedIdx: number,
    ref: React.RefObject<ScrollView | null>,
    onScrollEnd: (e: NativeSyntheticEvent<NativeScrollEvent>) => void,
    flex = 1,
  ) => (
    <View style={[styles.column, { flex }]}>
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {labels.map((label, idx) => {
          const isSelected = idx === selectedIdx;
          return (
            <View key={idx} style={styles.item}>
              <Text
                style={[
                  styles.itemText,
                  isSelected
                    ? [styles.itemTextSelected, { color: accentColor }]
                    : styles.itemTextDim,
                ]}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  const hourLabels = HOURS.map(pad);
  const minuteLabels = MINUTES.map(pad);
  const dateLabels = DATE_OPTIONS.map(formatDateLabel);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeSheet}
    >
      {/* 레이어1: 딤처리 - 화면 전체를 absoluteFillObject로 덮음 */}
      <AnimatedView
        style={[styles.backdrop, { opacity: backdropOpacity }]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={closeSheet}
        />
      </AnimatedView>

      {/* 레이어2: 바텀 시트 - 독립적으로 슬라이드 */}
      <View style={styles.sheetContainer} pointerEvents="box-none">
        <AnimatedView
          style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}
        >
          {/* 핸들 + 타이틀: 드래그 제스처 감지 영역 */}
          <View {...panResponder.panHandlers} style={styles.dragArea}>
            <View style={styles.handleArea}>
              <View style={styles.handle} />
            </View>
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>{title}</Text>
            </View>
          </View>

          <View style={styles.wheelsContainer}>
            {mode === 'datetime' && (
              <>
                {renderColumn(dateLabels, pendingDateIdx, dateRef, handleDateScrollEnd, 2)}
                <View style={styles.dateDivider} />
              </>
            )}

            {renderColumn(hourLabels, pendingHour, hourRef, handleHourScrollEnd)}

            <View style={styles.colonWrapper}>
              <Text style={[styles.colon, { color: accentColor }]}>:</Text>
            </View>

            {renderColumn(minuteLabels, pendingMinute, minuteRef, handleMinuteScrollEnd)}

            {/* 페이드 마스크 + 선택 인디케이터 */}
            <View style={styles.selectionOverlay} pointerEvents="none">
              <View style={[styles.topMask, { backgroundColor: `${colors.bg.elevated}EB` }]} />
              <View
                style={[
                  styles.selectionZone,
                  { borderColor: `${accentColor}55`, backgroundColor: `${accentColor}0D` },
                ]}
              />
              <View style={[styles.bottomMask, { backgroundColor: `${colors.bg.elevated}EB` }]} />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={closeSheet} activeOpacity={0.7}>
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: accentColor }]}
              onPress={handleConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmText}>확인</Text>
            </TouchableOpacity>
          </View>
        </AnimatedView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // 딤처리: 화면 전체를 절대좌표로 덮음 (statusBarTranslucent와 함께 완전 커버)
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  // 시트 컨테이너: flex 1로 하단 정렬
  sheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bg.elevated,
    borderTopLeftRadius: borderRadius.card,
    borderTopRightRadius: borderRadius.card,
    paddingBottom: 34,
    ...shadows.elevated,
  },
  // 핸들 + 타이틀을 묶은 드래그 전체 영역
  dragArea: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  handleArea: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  titleRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.screenPadding,
  },
  titleText: {
    ...typography.bodySemiBold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  wheelsContainer: {
    height: PICKER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: spacing.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  column: {
    overflow: 'hidden',
  },
  scrollContent: {
    paddingVertical: ITEM_HEIGHT * 2,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 22,
    letterSpacing: 0.5,
  },
  itemTextSelected: {
    fontWeight: '700',
    fontSize: 26,
  },
  itemTextDim: {
    color: colors.text.secondary,
    fontWeight: '400',
  },
  colonWrapper: {
    width: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colon: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  dateDivider: {
    width: 1,
    alignSelf: 'center',
    height: '50%',
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
  },
  topMask: {
    height: ITEM_HEIGHT * 2,
  },
  selectionZone: {
    height: ITEM_HEIGHT,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
  },
  bottomMask: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    backgroundColor: colors.bg.primary,
    borderRadius: borderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    ...typography.bodySemiBold,
    color: colors.text.secondary,
  },
  confirmBtn: {
    flex: 2,
    height: 52,
    borderRadius: borderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.card,
  },
  confirmText: {
    ...typography.bodySemiBold,
    color: colors.white,
    fontSize: 16,
  },
});
