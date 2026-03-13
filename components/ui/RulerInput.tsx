/**
 * RulerInput — 네이티브 ScrollView 기반 룰러 피커
 *
 * - ScrollView가 좌우로 이동, 가운데 인디케이터 고정
 * - snapToInterval + decelerationRate="fast" → 네이티브 스레드 스냅
 * - PanResponder 없음 → 버벅임 없음
 * - 눈금에 라벨 직접 표시
 * - 탭하여 숫자 직접 입력 가능
 */
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { colors, typography } from '../../constants/theme';

const STEP_PX = 20; // 픽셀/스텝 — 넓을수록 부드럽게 느껴짐
const TICK_MINOR = 14;
const TICK_MAJOR = 30;
const RULER_H = 44; // 눈금선 높이
const LABEL_H = 20; // 눈금 아래 라벨 영역 높이
const RULER_TOTAL = RULER_H + LABEL_H + 16; // 컨테이너 전체 높이

interface RulerInputProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  formatLabel?: (v: number) => string; // 상단 큰 값 표시
  formatTickLabel?: (v: number) => string; // 눈금 아래 짧은 라벨
  unit?: string;
  color?: string;
  majorEvery?: number; // 큰 눈금 간격(스텝 수)
  decimalInput?: boolean; // 소수점 직접 입력 지원 여부
}

export const RulerInput = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  formatLabel,
  formatTickLabel,
  unit = '',
  color = colors.accent,
  majorEvery = 5,
  decimalInput = false,
}: RulerInputProps) => {
  const scrollRef = useRef<ScrollView>(null);
  const containerW = useRef(0);
  const [containerReady, setContainerReady] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const isScrolling = useRef(false);
  const ignoreNextSync = useRef(false); // onChange로 인한 외부 value 변경 무시 플래그

  // value → scrollX 변환
  const valToX = useCallback((v: number) => ((v - min) / step) * STEP_PX, [min, step]);

  // scrollX → 가장 가까운 value
  const xToVal = useCallback(
    (x: number) => {
      const idx = x / STEP_PX;
      const raw = min + idx * step;
      const snap = Math.round((raw - min) / step) * step + min;
      return Math.max(min, Math.min(max, snap));
    },
    [min, max, step],
  );

  // 컨테이너 레이아웃 완료 후 초기 스크롤
  const onLayout = useCallback((e: { nativeEvent: { layout: { width: number } } }) => {
    containerW.current = e.nativeEvent.layout.width;
    setContainerReady(true);
  }, []);

  useEffect(() => {
    if (containerReady) {
      scrollRef.current?.scrollTo({ x: valToX(value), animated: false });
      setDisplayValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerReady]);

  // 외부에서 value가 바뀌면 스크롤 동기화 (스크롤 중에는 무시)
  const prevValue = useRef(value);
  useEffect(() => {
    if (ignoreNextSync.current) {
      ignoreNextSync.current = false;
      prevValue.current = value;
      return;
    }
    if (!isScrolling.current && prevValue.current !== value) {
      prevValue.current = value;
      setDisplayValue(value);
      scrollRef.current?.scrollTo({ x: valToX(value), animated: true });
    }
  }, [value, valToX]);

  const onScrollBegin = useCallback(() => {
    isScrolling.current = true;
  }, []);

  // 스크롤 중 라벨 실시간 업데이트
  const onScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      const x = e.nativeEvent.contentOffset.x;
      const v = xToVal(x);
      setDisplayValue(v);
    },
    [xToVal],
  );

  // 스크롤 끝 → onChange 호출
  const onScrollEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      isScrolling.current = false;
      const x = e.nativeEvent.contentOffset.x;
      const v = xToVal(x);
      prevValue.current = v;
      setDisplayValue(v);
      ignoreNextSync.current = true;
      onChange(v);
    },
    [xToVal, onChange],
  );

  // 눈금 데이터
  const ticks = useMemo(() => {
    const count = Math.round((max - min) / step);
    return Array.from({ length: count + 1 }, (_, i) => ({
      i,
      v: min + i * step,
      major: i % majorEvery === 0,
    }));
  }, [min, max, step, majorEvery]);

  // 직접 입력
  const [editing, setEditing] = useState(false);
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const startEdit = () => {
    setInputText(String(value));
    setEditing(true);
  };

  const commitEdit = () => {
    const n = decimalInput ? parseFloat(inputText) : parseInt(inputText, 10);
    if (!isNaN(n)) {
      const snap = parseFloat(
        Math.max(min, Math.min(max, Math.round((n - min) / step) * step + min)).toFixed(decimalInput ? (String(step).split('.')[1]?.length ?? 1) : 0),
      );
      onChange(snap);
      setDisplayValue(snap);
      scrollRef.current?.scrollTo({ x: valToX(snap), animated: true });
    }
    setEditing(false);
  };

  const bigLabel = formatLabel ? formatLabel(displayValue) : `${displayValue}${unit}`;
  // STEP_PX/2 을 빼야 tick 중앙이 정확히 뷰포트 중앙에 정렬됨
  // (tickWrap 너비가 STEP_PX이고 tick 선은 그 중앙에 위치하므로 오프셋 보정)
  const pad = containerReady ? containerW.current / 2 - STEP_PX / 2 : 0;

  return (
    <View style={styles.wrapper}>
      {/* ── 상단 값 표시 (탭 → 직접 입력) ── */}
      {editing ? (
        <View style={styles.editRow}>
          <TextInput
            ref={inputRef}
            style={[styles.editInput, { color, borderBottomColor: color }]}
            value={inputText}
            onChangeText={setInputText}
            keyboardType={decimalInput ? 'decimal-pad' : 'number-pad'}
            onBlur={commitEdit}
            onSubmitEditing={commitEdit}
            selectTextOnFocus
            autoFocus
            maxLength={5}
          />
          {unit ? <Text style={[styles.editUnit, { color }]}>{unit}</Text> : null}
        </View>
      ) : (
        <TouchableOpacity onPress={startEdit} activeOpacity={0.7} style={styles.labelBtn}>
          <Text style={[styles.bigLabel, { color }]}>{bigLabel}</Text>
          <Text style={styles.tapHint}>탭하여 직접 입력</Text>
        </TouchableOpacity>
      )}

      {/* ── 룰러 영역 ── */}
      <View style={styles.rulerWrap} onLayout={onLayout}>
        {/* 룰러 배경 트랙 */}
        <View style={styles.rulerBg} pointerEvents="none" />

        {/* 중앙 선택 하이라이트 */}
        <View style={[styles.centerHighlight, { borderColor: color, backgroundColor: `${color}12` }]} pointerEvents="none" />

        {/* 네이티브 수평 스크롤 */}
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={STEP_PX}
          decelerationRate="fast"
          overScrollMode="never"
          scrollEventThrottle={16}
          onScrollBeginDrag={onScrollBegin}
          onScroll={onScroll}
          onScrollEndDrag={onScrollEnd}
          onMomentumScrollEnd={onScrollEnd}
          contentContainerStyle={{ paddingHorizontal: pad }}
          style={styles.scroll}
        >
          {ticks.map((tick) => (
            <View key={tick.i} style={styles.tickWrap}>
              {/* 눈금 선 */}
              <View
                style={[
                  styles.tick,
                  {
                    height: tick.major ? TICK_MAJOR : TICK_MINOR,
                    backgroundColor: tick.major ? colors.text.primary : colors.text.secondary,
                    width: tick.major ? 2 : 1.5,
                    opacity: tick.major ? 0.7 : 0.3,
                  },
                ]}
              />
              {/* 눈금 라벨 */}
              {tick.major ? <Text style={styles.tickLabel}>{formatTickLabel ? formatTickLabel(tick.v) : `${tick.v}${unit}`}</Text> : null}
            </View>
          ))}
        </ScrollView>

        {/* 고정 중앙 인디케이터 (맨 위 레이어) */}
        <View style={styles.indicatorWrap} pointerEvents="none">
          <View style={[styles.indicatorLine, { backgroundColor: color }]} />
          <View style={[styles.indicatorArrow, { borderTopColor: color }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { width: '100%' },

  labelBtn: { alignItems: 'center', marginBottom: 4 },
  bigLabel: {
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
  },
  tapHint: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },

  editRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 4,
  },
  editInput: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    borderBottomWidth: 2,
    minWidth: 80,
    paddingVertical: 0,
    paddingHorizontal: 4,
    color: colors.accent,
  },
  editUnit: { fontSize: 16, fontWeight: '600' },

  rulerWrap: {
    height: RULER_TOTAL,
    position: 'relative',
    // overflow는 visible — 라벨이 잘리지 않도록
  },

  rulerBg: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    height: RULER_H,
    backgroundColor: colors.bg.primary,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },

  centerHighlight: {
    position: 'absolute',
    top: 8,
    height: RULER_H,
    width: STEP_PX * 2,
    left: '50%',
    marginLeft: -STEP_PX,
    borderRadius: 4,
    borderWidth: 1.5,
    zIndex: 5,
  },

  indicatorWrap: {
    position: 'absolute',
    top: 4,
    bottom: 0,
    left: '50%',
    alignItems: 'center',
    zIndex: 20,
    width: 2,
    marginLeft: -1,
  },
  indicatorLine: {
    width: 2.5,
    height: RULER_H + 4,
    borderRadius: 2,
  },
  indicatorArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: 3,
  },

  scroll: { flex: 1 },

  tickWrap: {
    width: STEP_PX,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
    height: RULER_TOTAL,
  },
  tick: { borderRadius: 1, marginTop: 0 },
  tickLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.text.primary,
    marginTop: 4,
    textAlign: 'center',
    width: 64,
    marginLeft: -10,
    opacity: 0.75,
  },
});
