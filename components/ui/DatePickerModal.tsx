import React, {
  useRef,
  useEffect,
  useCallback,
  useReducer,
  useMemo,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
  BackHandler,
  Platform,
  StatusBar,
  Easing,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import WheelPicker from '@quidone/react-native-wheel-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../../constants/theme';

// ─── 상수 ─────────────────────────────────────────────────────────────────────
const ITEM_H = 44;
const SHEET_OFF = 500;
const MONTH_COPIES = 3; // 36개 — 마운트 속도 최적화
const DAY_COPIES = 3;   // 최대 93개

const pad = (n: number) => String(n).padStart(2, '0');
const nowYear = new Date().getFullYear();
const getDays = (y: number, m: number) => new Date(y, m, 0).getDate();

// ─── 정적 데이터 (모듈 로드 시 1회 생성) ─────────────────────────────────────
const YEAR_DATA = Array.from(
  { length: nowYear - 1969 },
  (_, i) => ({ value: nowYear - i, label: `${nowYear - i}` }),
);

const LOOP_MONTHS = Array.from({ length: 12 * MONTH_COPIES }, (_, i) => ({
  value: i,
  label: pad((i % 12) + 1),
}));
const MONTH_MID = 12 * Math.floor(MONTH_COPIES / 2);
const getMonthVirt = (m: number) => MONTH_MID + (m - 1);
const getRealMonth = (v: number) => (v % 12) + 1;

const buildLoopDays = (max: number) =>
  Array.from({ length: max * DAY_COPIES }, (_, i) => ({
    value: i,
    label: pad((i % max) + 1),
  }));
const LOOP_DAYS_MAP: Record<number, { value: number; label: string }[]> = {
  28: buildLoopDays(28),
  29: buildLoopDays(29),
  30: buildLoopDays(30),
  31: buildLoopDays(31),
};
const getDayVirt = (day: number, max: number) =>
  max * Math.floor(DAY_COPIES / 2) + (day - 1);
const getRealDay = (v: number, max: number) => (v % max) + 1;

// ─── 공개 타입 ────────────────────────────────────────────────────────────────
export interface PickerDate { year: number; month: number; day: number; }

// ─── Reducer ─────────────────────────────────────────────────────────────────
interface PickerState {
  year: number;
  month: number; monthVirt: number;
  day: number;   dayVirt: number;
  maxDays: number;
}
type PickerAction =
  | { type: 'SET_YEAR';  year: number }
  | { type: 'SET_MONTH'; monthVirt: number }
  | { type: 'SET_DAY';   dayVirt: number }
  | { type: 'RESET';     value: PickerDate };

function initState(v: PickerDate): PickerState {
  const maxDays = getDays(v.year, v.month);
  const day = Math.min(Math.max(v.day, 1), maxDays);
  return { year: v.year, month: v.month, monthVirt: getMonthVirt(v.month),
           day, dayVirt: getDayVirt(day, maxDays), maxDays };
}

function reducer(s: PickerState, a: PickerAction): PickerState {
  switch (a.type) {
    case 'SET_YEAR': {
      const maxDays = getDays(a.year, s.month);
      const day = Math.min(s.day, maxDays);
      return { ...s, year: a.year, day, dayVirt: getDayVirt(day, maxDays), maxDays };
    }
    case 'SET_MONTH': {
      const month = getRealMonth(a.monthVirt);
      const maxDays = getDays(s.year, month);
      const day = Math.min(s.day, maxDays);
      return { ...s, month, monthVirt: a.monthVirt, day, dayVirt: getDayVirt(day, maxDays), maxDays };
    }
    case 'SET_DAY':
      return { ...s, day: getRealDay(a.dayVirt, s.maxDays), dayVirt: a.dayVirt };
    case 'RESET':
      return initState(a.value);
  }
}

// ─── 컬럼 컴포넌트 (각각 React.memo 격리 — 다른 컬럼 변경 시 리렌더 없음) ────
type ColProps = {
  overlayStyle: StyleProp<ViewStyle>;
};

type YearColProps = ColProps & {
  year: number;
  onChanged: (e: { item: { value: number; label: string } }) => void;
};
const YearCol = React.memo(({ year, onChanged, overlayStyle }: YearColProps) => (
  <View style={styles.colWrap}>
    <WheelPicker
      data={YEAR_DATA}
      value={year}
      onValueChanged={onChanged}
      itemHeight={ITEM_H}
      visibleItemCount={5}
      itemTextStyle={styles.itemText}
      overlayItemStyle={overlayStyle}
    />
    <Text pointerEvents="none" style={styles.unit}>년</Text>
  </View>
));

type MonthColProps = ColProps & {
  monthVirt: number;
  onChanged: (e: { item: { value: number; label: string } }) => void;
};
const MonthCol = React.memo(({ monthVirt, onChanged, overlayStyle }: MonthColProps) => (
  <View style={styles.colWrap}>
    <WheelPicker
      data={LOOP_MONTHS}
      value={monthVirt}
      onValueChanged={onChanged}
      itemHeight={ITEM_H}
      visibleItemCount={5}
      itemTextStyle={styles.itemText}
      overlayItemStyle={overlayStyle}
    />
    <Text pointerEvents="none" style={styles.unit}>월</Text>
  </View>
));

type DayColProps = ColProps & {
  dayVirt: number;
  maxDays: number;
  onChanged: (e: { item: { value: number; label: string } }) => void;
};
const DayCol = React.memo(({ dayVirt, maxDays, onChanged, overlayStyle }: DayColProps) => {
  const data = LOOP_DAYS_MAP[maxDays] ?? LOOP_DAYS_MAP[31];
  return (
    <View style={styles.colWrap}>
      <WheelPicker
        key={`d${maxDays}`}
        data={data}
        value={dayVirt}
        onValueChanged={onChanged}
        itemHeight={ITEM_H}
        visibleItemCount={5}
        itemTextStyle={styles.itemText}
        overlayItemStyle={overlayStyle}
      />
      <Text pointerEvents="none" style={styles.unit}>일</Text>
    </View>
  );
});

// ─── Props ────────────────────────────────────────────────────────────────────
interface DatePickerModalProps {
  visible: boolean;
  value: PickerDate;
  onConfirm: (date: PickerDate) => void;
  onCancel: () => void;
  accentColor?: string;
}

// ─── DatePickerModal ──────────────────────────────────────────────────────────
export const DatePickerModal = ({
  visible, value, onConfirm, onCancel,
  accentColor = colors.accent,
}: DatePickerModalProps) => {
  const [state, dispatch] = useReducer(reducer, value, initState);
  const insets = useSafeAreaInsets();

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(SHEET_OFF)).current;
  const onCancelRef = useRef(onCancel);
  useEffect(() => { onCancelRef.current = onCancel; }, [onCancel]);

  const onConfirmRef = useRef(onConfirm);
  useEffect(() => { onConfirmRef.current = onConfirm; }, [onConfirm]);

  // 최신 state를 ref로 유지 — handleConfirm이 state에 의존하지 않도록
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // dispatch는 useReducer가 보장하는 안정 참조 → 빈 배열 의존성 가능
  const onYearChanged = useCallback(
    (e: { item: { value: number; label: string } }) =>
      dispatch({ type: 'SET_YEAR', year: e.item.value }),
    [],
  );
  const onMonthChanged = useCallback(
    (e: { item: { value: number; label: string } }) =>
      dispatch({ type: 'SET_MONTH', monthVirt: e.item.value }),
    [],
  );
  const onDayChanged = useCallback(
    (e: { item: { value: number; label: string } }) =>
      dispatch({ type: 'SET_DAY', dayVirt: e.item.value }),
    [],
  );

  const overlayStyle = useMemo(() => ({
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: `${accentColor}50`,
    borderBottomColor: `${accentColor}50`,
    backgroundColor: `${accentColor}0D`,
  }), [accentColor]);

  // Android 뒤로가기 버튼으로 닫기 (closeSheet 선언 이후에 위치)
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onCancelRef.current();
      return true;
    });
    return () => sub.remove();
  }, [visible]);

  const runCloseAnim = useCallback(
    (onDone: () => void) => {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        Animated.timing(sheetY, { toValue: SHEET_OFF, duration: 260, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start(() => onDone());
    },
    [backdropOpacity, sheetY],
  );

  const closeSheet = useCallback(() => {
    runCloseAnim(() => onCancelRef.current());
  }, [runCloseAnim]);

  // 확인: 닫기 애니메이션 완료 후 onConfirm 호출 → 딤이 확실히 사라진 뒤 처리
  const handleConfirm = useCallback(() => {
    const { year, month, day } = stateRef.current;
    runCloseAnim(() => onConfirmRef.current({ year, month, day }));
  }, [runCloseAnim]);

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponder: (_, gs) => gs.dy > 4 && Math.abs(gs.dy) > Math.abs(gs.dx),
    onPanResponderGrant: () => { sheetY.setOffset(0); sheetY.setValue(0); },
    onPanResponderMove: (_, gs) => { if (gs.dy > 0) sheetY.setValue(gs.dy); },
    onPanResponderRelease: (_, gs) => {
      sheetY.flattenOffset();
      if (gs.dy > 100 || gs.vy > 0.7) {
        Animated.parallel([
          Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(sheetY, { toValue: SHEET_OFF, duration: 260, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        ]).start(() => onCancelRef.current());
      } else {
        Animated.spring(sheetY, { toValue: 0, tension: 80, friction: 14, useNativeDriver: true }).start();
      }
    },
    onPanResponderTerminate: () => {
      sheetY.flattenOffset();
      Animated.spring(sheetY, { toValue: 0, tension: 80, friction: 14, useNativeDriver: true }).start();
    },
  })).current;

  useEffect(() => {
    if (visible) {
      dispatch({ type: 'RESET', value });
      backdropOpacity.setValue(0);
      sheetY.setValue(SHEET_OFF);
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 260, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.spring(sheetY, { toValue: 0, tension: 60, friction: 14, useNativeDriver: true }),
      ]).start();
    } else {
      // 열기 애니메이션이 진행 중일 수 있으므로 먼저 중단 후 값 설정
      backdropOpacity.stopAnimation();
      sheetY.stopAnimation();
      backdropOpacity.setValue(0);
      sheetY.setValue(SHEET_OFF);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const statusBarH = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  // Modal 대신 절대 위치 View — 피커가 항상 마운트된 상태를 유지해서
  // 열기/닫기 시 1,665개 Animated 객체 재생성 없이 애니메이션만 실행됨
  return (
    <View
      style={[StyleSheet.absoluteFillObject, styles.overlay]}
      pointerEvents={visible ? 'box-none' : 'none'}
    >
      {/* 딤 배경 */}
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>
      </Animated.View>

      <View style={[styles.wrapper, { paddingTop: statusBarH }]} pointerEvents="box-none">
        <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetY }], paddingBottom: Math.max(insets.bottom, 16) }]}>

          <View style={styles.dragArea} {...panResponder.panHandlers}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>생년월일 선택</Text>
          </View>

          {/* 피커는 항상 마운트 — 최초 1회만 Animated 객체 생성 */}
          <View style={styles.pickerRow}>
            <YearCol  year={state.year}           onChanged={onYearChanged}  overlayStyle={overlayStyle} />
            <MonthCol monthVirt={state.monthVirt} onChanged={onMonthChanged} overlayStyle={overlayStyle} />
            <DayCol   dayVirt={state.dayVirt}     maxDays={state.maxDays}   onChanged={onDayChanged} overlayStyle={overlayStyle} />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: accentColor }]}
              onPress={handleConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmText}>
                {`${state.year}년 ${pad(state.month)}월 ${pad(state.day)}일 선택`}
              </Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </View>
    </View>
  );
};

// ─── 스타일 ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay:    { zIndex: 999 },
  backdrop:   { backgroundColor: colors.overlay },
  wrapper:    { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg.elevated,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 8,
    // paddingBottom은 useSafeAreaInsets로 인라인 처리 (네비바 겹침 방지)
  },
  dragArea: { height: 60, alignItems: 'center', justifyContent: 'center', paddingTop: spacing.md },
  handle:   { width: 36, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0' },
  sheetTitle: { fontSize: 17, fontWeight: '600', color: colors.text.primary, marginTop: spacing.sm },
  pickerRow:  { flexDirection: 'row', marginHorizontal: spacing.screenPadding, marginTop: spacing.sm },
  colWrap:    { flex: 1, position: 'relative' },
  itemText:   { fontSize: 16, color: colors.text.secondary },
  unit: {
    position: 'absolute', right: 4, top: '50%', marginTop: -9,
    fontSize: 13, fontWeight: '500', color: colors.text.secondary,
  },
  footer: { paddingHorizontal: spacing.screenPadding, paddingTop: spacing.xl },
  confirmBtn: { borderRadius: borderRadius.base, paddingVertical: spacing.lg, alignItems: 'center' },
  confirmText: { fontSize: 15, fontWeight: '600', color: colors.white },
});
