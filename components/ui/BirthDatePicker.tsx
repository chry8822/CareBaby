import { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const pad = (n: number) => String(n).padStart(2, '0');

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i); // 최신년도 → 2000
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const getDaysInMonth = (year: number, month: number): number =>
  new Date(year, month, 0).getDate();

export interface BirthDate {
  year: number;
  month: number;
  day: number;
}

interface BirthDatePickerProps {
  value: BirthDate;
  onChange: (date: BirthDate) => void;
  accentColor?: string;
}

export const BirthDatePicker = ({
  value,
  onChange,
  accentColor = colors.accent,
}: BirthDatePickerProps) => {
  const yearRef = useRef<ScrollView>(null);
  const monthRef = useRef<ScrollView>(null);
  const dayRef = useRef<ScrollView>(null);

  const days = Array.from(
    { length: getDaysInMonth(value.year, value.month) },
    (_, i) => i + 1,
  );

  const yearIdx = YEARS.indexOf(value.year);
  const monthIdx = value.month - 1;
  const dayIdx = value.day - 1;

  // 초기 스크롤 위치 설정
  useEffect(() => {
    const timer = setTimeout(() => {
      yearRef.current?.scrollTo({ y: Math.max(0, yearIdx) * ITEM_HEIGHT, animated: false });
      monthRef.current?.scrollTo({ y: monthIdx * ITEM_HEIGHT, animated: false });
      dayRef.current?.scrollTo({ y: dayIdx * ITEM_HEIGHT, animated: false });
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  // 월/년 변경 시 일 범위 초과 보정
  useEffect(() => {
    const maxDay = getDaysInMonth(value.year, value.month);
    if (value.day > maxDay) {
      onChange({ ...value, day: maxDay });
    }
  }, [value.year, value.month]);

  const handleYearScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(YEARS.length - 1, idx));
      yearRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
      onChange({ ...value, year: YEARS[clamped] });
    },
    [value, onChange],
  );

  const handleMonthScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(11, idx));
      monthRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
      onChange({ ...value, month: MONTHS[clamped] });
    },
    [value, onChange],
  );

  const handleDayScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(days.length - 1, idx));
      dayRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
      onChange({ ...value, day: days[clamped] });
    },
    [value, onChange, days],
  );

  const renderColumn = (
    labels: string[],
    selectedIdx: number,
    ref: React.RefObject<ScrollView | null>,
    onScrollEnd: (e: NativeSyntheticEvent<NativeScrollEvent>) => void,
    unit: string,
    flex: number = 1,
  ) => (
    <View style={[styles.columnWrapper, { flex }]}>
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

      {/* 선택 영역 하이라이트 */}
      <View pointerEvents="none" style={styles.highlight} />

      {/* 단위 레이블 */}
      <Text style={[styles.unit, { color: accentColor }]}>{unit}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderColumn(
        YEARS.map(String),
        Math.max(0, yearIdx),
        yearRef,
        handleYearScrollEnd,
        '년',
        3,
      )}
      {renderColumn(
        MONTHS.map((m) => pad(m)),
        monthIdx,
        monthRef,
        handleMonthScrollEnd,
        '월',
        2,
      )}
      {renderColumn(
        days.map((d) => pad(d)),
        dayIdx,
        dayRef,
        handleDayScrollEnd,
        '일',
        2,
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: PICKER_HEIGHT,
    backgroundColor: colors.bg.primary,
    borderRadius: borderRadius.base,
    overflow: 'hidden',
  },
  columnWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingVertical: ITEM_HEIGHT * 2,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 17,
    lineHeight: ITEM_HEIGHT,
  },
  itemTextSelected: {
    fontWeight: '700',
    fontSize: 19,
  },
  itemTextDim: {
    color: colors.text.secondary,
    fontWeight: '400',
  },
  highlight: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    top: '50%',
    marginTop: -(ITEM_HEIGHT / 2),
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  unit: {
    position: 'absolute',
    right: spacing.sm,
    top: '50%',
    marginTop: -10,
    fontSize: 13,
    fontWeight: '500',
  },
});
