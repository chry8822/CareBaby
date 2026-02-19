import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Animated } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Cookie, Moon, Droplets, Check } from 'lucide-react-native';
import { SafeView } from '@/shared/components/SafeView';
import { useTrackingStore } from '@/features/tracking/store';
import { colors, spacing, borderRadius, fontSize, typography, shadows } from '@/design-system/tokens';
import type { DiaperType } from '@/features/tracking/types';

type TrackingCategory = 'feeding' | 'sleep' | 'diaper';
type FeedingSelection = 'breast_left' | 'breast_right' | 'bottle' | 'expressed_milk' | 'formula';

const FEEDING_TYPES: { key: FeedingSelection; label: string }[] = [
  { key: 'breast_left', label: '모유(좌)' },
  { key: 'breast_right', label: '모유(우)' },
  { key: 'expressed_milk', label: '유축모유' },
  { key: 'formula', label: '분유' },
];

const DIAPER_TYPES: { key: DiaperType; label: string }[] = [
  { key: 'wet', label: '소변' },
  { key: 'dirty', label: '대변' },
  { key: 'mixed', label: '혼합' },
  { key: 'dry', label: '건조' },
];

const QUICK_MEMO = {
  feeding: ['잘 먹음', '졸려서 안 먹음', '토해냄', '중간에 멈춤', '보충 필요'],
  sleep: ['깊이 잠', '자주 깸', '뒤척임', '울면서 깸', '스스로 잠듦'],
  diaper: ['정상', '발진 있음', '묽음', '냄새 심함', '양 적음'],
} as const;

export default function TrackingScreen() {
  const params = useLocalSearchParams<{ type?: string; feedingType?: string }>();
  const initialCategory = (params.type as TrackingCategory) ?? 'feeding';
  const [category, setCategory] = useState<TrackingCategory>(initialCategory);
  const [feedingType, setFeedingType] = useState<FeedingSelection>('breast_left');
  const [diaperType, setDiaperType] = useState<DiaperType>('wet');
  const [duration, setDuration] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedMemos, setSelectedMemos] = useState<string[]>([]);
  const [showManualDuration, setShowManualDuration] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const manualAnim = useRef(new Animated.Value(0)).current;

  const addFeeding = useTrackingStore((s) => s.addFeeding);
  const addSleep = useTrackingStore((s) => s.addSleep);
  const addDiaper = useTrackingStore((s) => s.addDiaper);

  useEffect(() => {
    const t = params.type;
    if (t === 'feeding' || t === 'sleep' || t === 'diaper') setCategory(t);
  }, [params.type]);

  useEffect(() => {
    const ft = params.feedingType;
    if (ft === 'breast_left' || ft === 'breast_right' || ft === 'formula' || ft === 'expressed_milk') {
      setFeedingType(ft);
    }
  }, [params.feedingType]);

  useEffect(() => {
    if (category !== 'feeding') {
      setAmount('');
    }
  }, [category]);

  useEffect(() => {
    Animated.timing(manualAnim, {
      toValue: showManualDuration ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [showManualDuration, manualAnim]);

  const startTimer = useCallback(() => {
    if (isTimerRunning) return;
    setIsTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
  }, [isTimerRunning]);

  const pauseTimer = useCallback(() => {
    setIsTimerRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    pauseTimer();
    setTimerSeconds(0);
    setDuration('');
  }, [pauseTimer]);

  const formatTimer = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const toggleMemo = (value: string) => {
    setSelectedMemos((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSave = async () => {
    const now = new Date();
    const finalNote = [...selectedMemos, note.trim()].filter(Boolean).join(' · ') || undefined;

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignore haptics error
    }

    if (category === 'feeding') {
      addFeeding({
        type: feedingType as Parameters<typeof addFeeding>[0]['type'],
        timestamp: now,
        durationMinutes: duration ? parseInt(duration, 10) : timerSeconds ? Math.ceil(timerSeconds / 60) : undefined,
        amountMl: amount ? parseFloat(amount) : undefined,
        note: finalNote,
      });
    } else if (category === 'sleep') {
      const durationMin = duration ? parseInt(duration, 10) : Math.max(1, Math.ceil(timerSeconds / 60));
      const startTime = new Date(now.getTime() - durationMin * 60000);
      addSleep({
        startTime,
        endTime: now,
        quality: 'deep',
        note: finalNote,
      });
    } else {
      addDiaper({
        type: diaperType,
        timestamp: now,
        note: finalNote,
      });
    }

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setDuration('');
      setAmount('');
      setNote('');
      setSelectedMemos([]);
      resetTimer();
    }, 1400);
  };

  const categories: { key: TrackingCategory; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'feeding', label: '수유', icon: <Cookie size={20} color={colors.chart.feeding} />, color: colors.chart.feeding },
    { key: 'sleep', label: '수면', icon: <Moon size={20} color={colors.chart.sleep} />, color: colors.chart.sleep },
    { key: 'diaper', label: '기저귀', icon: <Droplets size={20} color={colors.chart.diaper} />, color: colors.chart.diaper },
  ];

  const memoList = useMemo(() => QUICK_MEMO[category], [category]);
  const showAmountInput =
    category === 'feeding' &&
    (feedingType === 'formula' || feedingType === 'expressed_milk');
  const manualHeight = manualAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 58] });
  const manualOpacity = manualAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <SafeView edges={['top', 'left', 'right']}>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.neutral.bg }}
          contentContainerStyle={{
            padding: spacing.screenPadding,
            gap: spacing.sectionGap,
            paddingBottom: spacing.xl,
          }}
        >
          <Text style={{ fontSize: fontSize.xxl, fontWeight: '700', color: colors.neutral.text }}>기록하기</Text>

          <View style={{ flexDirection: 'row', gap: spacing.cardGap }}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c.key}
                onPress={() => setCategory(c.key)}
                style={{
                  flex: 1,
                  minHeight: 44,
                  borderRadius: borderRadius.md,
                  backgroundColor: category === c.key ? c.color + '24' : colors.neutral.card,
                  borderWidth: 1,
                  borderColor: category === c.key ? c.color : colors.neutral.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing.itemGap,
                }}
              >
                {c.icon}
                <Text style={{ color: category === c.key ? c.color : colors.neutral.textSecondary, fontWeight: '600' }}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {category === 'feeding' && (
            <View style={{ backgroundColor: colors.neutral.card, borderRadius: borderRadius.lg, padding: spacing.cardPadding, gap: 10, borderWidth: 1, borderColor: colors.neutral.border }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.neutral.text }}>수유 종류</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {FEEDING_TYPES.map((ft) => {
                  const selected = feedingType === ft.key;
                  return (
                    <TouchableOpacity
                      key={ft.key}
                      onPress={() => setFeedingType(ft.key)}
                      style={{
                        minHeight: 44,
                        borderRadius: 24,
                        paddingHorizontal: spacing.md,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: selected ? colors.brand.primary : colors.neutral.cardHover,
                        borderWidth: 1,
                        borderColor: selected ? colors.brand.primary : colors.neutral.border,
                      }}
                    >
                      <Text style={{ fontWeight: '600', color: selected ? colors.neutral.white : colors.neutral.text }}>{ft.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {category === 'diaper' && (
            <View style={{ backgroundColor: colors.neutral.card, borderRadius: borderRadius.lg, padding: spacing.cardPadding, gap: 10, borderWidth: 1, borderColor: colors.neutral.border }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.neutral.text }}>기저귀 종류</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {DIAPER_TYPES.map((dt) => {
                  const selected = diaperType === dt.key;
                  return (
                    <TouchableOpacity
                      key={dt.key}
                      onPress={() => setDiaperType(dt.key)}
                      style={{
                        minHeight: 44,
                        borderRadius: 24,
                        paddingHorizontal: spacing.md,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: selected ? colors.chart.diaper : colors.neutral.cardHover,
                        borderWidth: 1,
                        borderColor: selected ? colors.chart.diaper : colors.neutral.border,
                      }}
                    >
                      <Text style={{ fontWeight: '600', color: selected ? colors.neutral.white : colors.neutral.text }}>{dt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {(category === 'feeding' || category === 'sleep') && (
            <View
              style={{
                backgroundColor: category === 'feeding' ? colors.brand.primaryLight : colors.brand.secondaryLight,
                borderRadius: borderRadius.lg,
                paddingVertical: 32,
                paddingHorizontal: spacing.cardPadding,
                alignItems: 'center',
                gap: 24,
                ...shadows.card,
              }}
            >
              <Text style={{ fontSize: 42, fontWeight: '700', color: colors.neutral.text, fontVariant: ['tabular-nums'] }}>
                {formatTimer(timerSeconds)}
              </Text>

              {isTimerRunning ? (
                <TouchableOpacity
                  onPress={pauseTimer}
                  style={{
                    width: 160,
                    height: 52,
                    borderRadius: borderRadius.button,
                    backgroundColor: colors.brand.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: colors.neutral.white, fontWeight: '700', fontSize: 17 }}>일시정지</Text>
                </TouchableOpacity>
              ) : timerSeconds > 0 ? (
                <View style={{ flexDirection: 'row', gap: spacing.cardGap }}>
                  <TouchableOpacity
                    onPress={startTimer}
                    style={{
                      width: 160,
                      height: 52,
                      borderRadius: borderRadius.button,
                      backgroundColor: colors.brand.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: colors.neutral.white, fontWeight: '700', fontSize: 17 }}>이어서</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={resetTimer}
                    style={{
                      width: 120,
                      height: 52,
                      borderRadius: borderRadius.button,
                      borderWidth: 1,
                      borderColor: colors.neutral.borderStrong,
                      backgroundColor: colors.neutral.white,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: colors.neutral.text, fontWeight: '700', fontSize: 17 }}>종료</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={startTimer}
                  style={{
                    width: 160,
                    height: 52,
                    borderRadius: borderRadius.button,
                    backgroundColor: colors.brand.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: colors.neutral.white, fontWeight: '700', fontSize: 17 }}>시작</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={() => setShowManualDuration((v) => !v)}>
                <Text style={{ color: colors.neutral.textSecondary, fontSize: typography.caption.size }}>직접 입력 ▾</Text>
              </TouchableOpacity>
              <Animated.View style={{ width: '100%', height: manualHeight, opacity: manualOpacity, overflow: 'hidden' }}>
                <TextInput
                  placeholder="분 단위 입력"
                  placeholderTextColor={colors.neutral.textMuted}
                  keyboardType="numeric"
                  value={duration}
                  onChangeText={setDuration}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.neutral.border,
                    borderRadius: borderRadius.md,
                    paddingHorizontal: spacing.md,
                    height: 52,
                    textAlign: 'center',
                    fontSize: fontSize.md,
                    color: colors.neutral.text,
                    backgroundColor: colors.neutral.white,
                  }}
                />
              </Animated.View>
            </View>
          )}

          {showAmountInput && (
            <View style={{ backgroundColor: colors.neutral.card, borderRadius: borderRadius.lg, padding: spacing.cardPadding, gap: spacing.itemGap, borderWidth: 1, borderColor: colors.neutral.border }}>
              <Text style={{ fontWeight: '700', color: colors.neutral.text, fontSize: 18 }}>수유량 (ml)</Text>
              <TextInput
                placeholder="ml 입력"
                placeholderTextColor={colors.neutral.textMuted}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                style={{
                  borderWidth: 1,
                  borderColor: colors.neutral.border,
                  borderRadius: borderRadius.md,
                  paddingHorizontal: spacing.md,
                  height: 52,
                  fontSize: fontSize.md,
                  color: colors.neutral.text,
                  backgroundColor: colors.neutral.white,
                }}
              />
            </View>
          )}

          <View style={{ backgroundColor: colors.neutral.card, borderRadius: borderRadius.lg, padding: spacing.cardPadding, gap: spacing.itemGap, borderWidth: 1, borderColor: colors.neutral.border }}>
            <Text style={{ fontWeight: '700', color: colors.neutral.text, fontSize: 18 }}>빠른 메모</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.itemGap }}>
              {memoList.map((m) => {
                const selected = selectedMemos.includes(m);
                return (
                  <TouchableOpacity
                    key={m}
                    onPress={() => toggleMemo(m)}
                    style={{
                      height: 36,
                      borderRadius: 24,
                      paddingHorizontal: spacing.md,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: selected ? colors.brand.primary : colors.neutral.cardHover,
                    }}
                  >
                    <Text style={{ color: selected ? colors.neutral.white : colors.neutral.textSecondary, fontSize: typography.caption.size }}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <Text style={{ color: colors.neutral.textSecondary, fontSize: typography.caption.size }}>직접 입력</Text>
            <TextInput
              placeholder="메모를 입력하세요"
              placeholderTextColor={colors.neutral.textMuted}
              multiline
              value={note}
              onChangeText={setNote}
              style={{
                borderWidth: 1,
                borderColor: colors.neutral.border,
                borderRadius: borderRadius.md,
                paddingHorizontal: spacing.md,
                paddingVertical: 10,
                fontSize: fontSize.md,
                color: colors.neutral.text,
                minHeight: 60,
                textAlignVertical: 'top',
                backgroundColor: colors.neutral.white,
              }}
            />
          </View>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saved}
              style={{
                backgroundColor: saved ? colors.brand.secondary : colors.brand.primary,
                borderRadius: borderRadius.button,
                height: 52,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: spacing.sm,
                ...shadows.card,
              }}
            >
              {saved ? (
                <>
                  <Check size={20} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: fontSize.lg }}>기록 완료</Text>
                </>
              ) : (
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: fontSize.lg }}>기록 저장</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    </SafeView>
  );
}
