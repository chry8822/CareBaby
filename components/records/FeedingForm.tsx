import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Play, Pause, Square, Clock, Edit2 } from 'lucide-react-native';
import { WheelTimePicker } from '../ui/WheelTimePicker';
import { useAuthStore } from '../../stores/authStore';
import { useBabyStore } from '../../stores/babyStore';
import { useRecordStore } from '../../stores/recordStore';
import { useUIStore } from '../../stores/uiStore';
import { useTimer } from '../../hooks/useTimer';
import { Chip } from '../ui/Chip';
import { TimerDisplay, formatDuration } from '../ui/TimerDisplay';
import { SaveButton } from '../ui/SaveButton';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import type { FeedingType } from '../../types/database';

const FEEDING_TYPES: { key: FeedingType; label: string }[] = [
  { key: 'breast_left', label: '모유(좌)' },
  { key: 'breast_right', label: '모유(우)' },
  { key: 'pumped', label: '유축모유' },
  { key: 'formula', label: '분유' },
];

const MEMO_CHIPS = ['잘 먹음', '칭얼거림', '트림함', '뱉음', '졸면서 먹음'];

const NURSING_COLOR = colors.activity.nursing;

export const FeedingForm = () => {
  const { user } = useAuthStore();
  const { currentBaby } = useBabyStore();
  const { saveFeeding } = useRecordStore();
  const { showToast, showModal, hideModal } = useUIStore();

  const { elapsed, isRunning, isPaused, start, pause, resume, stop, reset } = useTimer();

  const [feedingType, setFeedingType] = useState<FeedingType>('breast_left');
  const [isDirectInput, setIsDirectInput] = useState(false);
  const [directMinutes, setDirectMinutes] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [amountMl, setAmountMl] = useState('');
  const [selectedMemos, setSelectedMemos] = useState<string[]>([]);
  const [customMemo, setCustomMemo] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isAmountVisible =
    feedingType === 'formula' || feedingType === 'pumped';

  const toggleMemo = useCallback((memo: string) => {
    setSelectedMemos((prev) =>
      prev.includes(memo) ? prev.filter((m) => m !== memo) : [...prev, memo],
    );
  }, []);

  const handleStartTimer = () => {
    setIsDirectInput(false);
    setStartTime(new Date());
    start();
  };

  const handleStopTimer = () => {
    stop();
    reset();
  };

  const handleTimeConfirm = (date: Date) => {
    setStartTime(date);
    setShowTimePicker(false);
  };

  const handleSave = async () => {
    if (!user) {
      showModal({
        title: '로그인 필요',
        message: '기록을 저장하려면 로그인이 필요해요.',
        primaryAction: { label: '확인', onPress: hideModal },
      });
      return;
    }
    if (!currentBaby) {
      showModal({
        title: '아기 정보 없음',
        message: '먼저 아기 프로필을 등록해주세요.',
        primaryAction: { label: '확인', onPress: hideModal },
      });
      return;
    }

    let durationSeconds: number | null = null;
    let endedAt: string | null = null;

    if (!isDirectInput && isRunning) {
      const finalElapsed = stop();
      durationSeconds = finalElapsed;
      endedAt = new Date().toISOString();
    } else if (!isDirectInput && elapsed > 0) {
      durationSeconds = elapsed;
      endedAt = new Date().toISOString();
    } else if (isDirectInput && directMinutes.trim()) {
      const mins = parseInt(directMinutes, 10);
      if (!isNaN(mins) && mins > 0) {
        durationSeconds = mins * 60;
        endedAt = new Date(startTime.getTime() + durationSeconds * 1000).toISOString();
      }
    }

    const allMemos = [...selectedMemos];
    if (customMemo.trim()) allMemos.push(customMemo.trim());

    setIsSaving(true);
    try {
      await saveFeeding({
        baby_id: currentBaby.id,
        recorded_by: user.id,
        feeding_type: feedingType,
        started_at: startTime.toISOString(),
        ended_at: endedAt,
        duration_seconds: durationSeconds,
        amount_ml: isAmountVisible && amountMl ? parseInt(amountMl, 10) : null,
        memo_tags: allMemos.length > 0 ? allMemos : null,
        note: null,
      });

      showToast('기록이 저장되었어요', 'success');
      resetForm();
    } catch {
      showModal({
        title: '저장 실패',
        message: '기록 저장에 실패했어요. 오프라인 상태에서는 나중에 자동으로 동기화돼요.',
        primaryAction: { label: '확인', onPress: hideModal },
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    reset();
    setDirectMinutes('');
    setStartTime(new Date());
    setAmountMl('');
    setSelectedMemos([]);
    setCustomMemo('');
    setShowCustomInput(false);
    setIsDirectInput(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 수유 타입 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>수유 종류</Text>
          <View style={styles.chipRow}>
            {FEEDING_TYPES.map((ft) => (
              <Chip
                key={ft.key}
                label={ft.label}
                selected={feedingType === ft.key}
                onPress={() => setFeedingType(ft.key)}
                color={NURSING_COLOR}
              />
            ))}
          </View>
        </View>

        {/* 타이머 / 직접 입력 토글 */}
        <View style={styles.section}>
          <View style={styles.inputModeRow}>
            <TouchableOpacity
              style={[styles.modeTab, !isDirectInput && styles.modeTabActive]}
              onPress={() => setIsDirectInput(false)}
            >
              <Clock
                size={14}
                color={!isDirectInput ? colors.white : colors.text.secondary}
              />
              <Text
                style={[
                  styles.modeTabText,
                  !isDirectInput && styles.modeTabTextActive,
                ]}
              >
                타이머
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeTab, isDirectInput && styles.modeTabActive]}
              onPress={() => {
                setIsDirectInput(true);
                if (isRunning) stop();
              }}
            >
              <Edit2
                size={14}
                color={isDirectInput ? colors.white : colors.text.secondary}
              />
              <Text
                style={[
                  styles.modeTabText,
                  isDirectInput && styles.modeTabTextActive,
                ]}
              >
                직접 입력
              </Text>
            </TouchableOpacity>
          </View>

          {!isDirectInput ? (
            <View style={styles.timerCard}>
              <TimerDisplay seconds={elapsed} size="large" />
              <View style={styles.timerButtons}>
                {!isRunning && !isPaused ? (
                  <TouchableOpacity
                    style={[styles.timerBtn, styles.timerBtnPrimary]}
                    onPress={handleStartTimer}
                    activeOpacity={0.8}
                  >
                    <Play color={colors.white} size={20} fill={colors.white} />
                    <Text style={styles.timerBtnText}>시작</Text>
                  </TouchableOpacity>
                ) : null}
                {isRunning && !isPaused ? (
                  <>
                    <TouchableOpacity
                      style={[styles.timerBtn, styles.timerBtnSecondary]}
                      onPress={pause}
                      activeOpacity={0.8}
                    >
                      <Pause color={NURSING_COLOR} size={18} />
                      <Text style={[styles.timerBtnText, styles.timerBtnTextSecondary]}>
                        일시정지
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.timerBtn, styles.timerBtnStop]}
                      onPress={handleStopTimer}
                      activeOpacity={0.8}
                    >
                      <Square color={colors.text.secondary} size={16} />
                      <Text
                        style={[styles.timerBtnText, { color: colors.text.secondary }]}
                      >
                        중단
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : null}
                {isPaused ? (
                  <>
                    <TouchableOpacity
                      style={[styles.timerBtn, styles.timerBtnPrimary]}
                      onPress={resume}
                      activeOpacity={0.8}
                    >
                      <Play color={colors.white} size={18} fill={colors.white} />
                      <Text style={styles.timerBtnText}>재개</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.timerBtn, styles.timerBtnStop]}
                      onPress={handleStopTimer}
                      activeOpacity={0.8}
                    >
                      <Square color={colors.text.secondary} size={16} />
                      <Text
                        style={[styles.timerBtnText, { color: colors.text.secondary }]}
                      >
                        중단
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : null}
              </View>
              {elapsed > 0 && !isRunning && !isPaused ? (
                <Text style={styles.elapsedHint}>
                  기록된 시간: {formatDuration(elapsed)}
                </Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.directCard}>
              <View style={styles.directRow}>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.timeButtonText}>
                    {startTime.toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.timeButtonLabel}>시작 시간</Text>
                </TouchableOpacity>
                <View style={styles.durationInput}>
                  <TextInput
                    style={styles.numberInput}
                    value={directMinutes}
                    onChangeText={setDirectMinutes}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.text.secondary}
                    maxLength={3}
                  />
                  <Text style={styles.unitText}>분</Text>
                </View>
              </View>
              <WheelTimePicker
                visible={showTimePicker}
                value={startTime}
                onConfirm={handleTimeConfirm}
                onCancel={() => setShowTimePicker(false)}
                accentColor={NURSING_COLOR}
                title="시작 시간 선택"
              />
            </View>
          )}
        </View>

        {/* 수유량 (분유/유축 시만) */}
        {isAmountVisible ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>수유량</Text>
            <View style={styles.amountRow}>
              <TextInput
                style={styles.amountInput}
                value={amountMl}
                onChangeText={setAmountMl}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.text.secondary}
                maxLength={4}
              />
              <Text style={styles.unitText}>ml</Text>
            </View>
          </View>
        ) : null}

        {/* 빠른 메모 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>빠른 메모</Text>
          <View style={styles.chipRow}>
            {MEMO_CHIPS.map((memo) => (
              <Chip
                key={memo}
                label={memo}
                selected={selectedMemos.includes(memo)}
                onPress={() => toggleMemo(memo)}
                color={NURSING_COLOR}
              />
            ))}
            <Chip
              label="+ 직접입력"
              selected={showCustomInput}
              onPress={() => setShowCustomInput((v) => !v)}
              color={colors.text.secondary}
            />
          </View>
          {showCustomInput ? (
            <TextInput
              style={styles.customMemoInput}
              value={customMemo}
              onChangeText={setCustomMemo}
              placeholder="메모를 입력하세요"
              placeholderTextColor={colors.text.secondary}
              maxLength={50}
            />
          ) : null}
        </View>

        <View style={styles.saveArea}>
          <SaveButton onPress={handleSave} isLoading={isSaving} color={NURSING_COLOR} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.screenPadding,
    paddingBottom: 40,
  },
  section: {
    marginBottom: spacing.sectionGap,
  },
  sectionTitle: {
    ...typography.bodySemiBold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  inputModeRow: {
    flexDirection: 'row',
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.base,
    padding: 4,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  modeTabActive: {
    backgroundColor: colors.activity.nursing,
  },
  modeTabText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: colors.white,
  },
  timerCard: {
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.card,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.card,
  },
  timerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  timerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.base,
  },
  timerBtnPrimary: {
    backgroundColor: colors.activity.nursing,
  },
  timerBtnSecondary: {
    backgroundColor: `${colors.activity.nursing}18`,
    borderWidth: 1.5,
    borderColor: colors.activity.nursing,
  },
  timerBtnStop: {
    backgroundColor: colors.bg.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timerBtnText: {
    ...typography.bodySemiBold,
    color: colors.white,
    fontSize: 14,
  },
  timerBtnTextSecondary: {
    color: colors.activity.nursing,
  },
  elapsedHint: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  directCard: {
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.base,
    padding: spacing.xl,
    ...shadows.card,
  },
  directRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  timeButton: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeButtonText: {
    ...typography.h2,
    color: colors.text.primary,
  },
  timeButtonLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  durationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  numberInput: {
    width: 72,
    height: 56,
    backgroundColor: colors.bg.primary,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
    ...typography.h2,
    color: colors.text.primary,
  },
  unitText: {
    ...typography.bodySemiBold,
    color: colors.text.secondary,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  amountInput: {
    width: 100,
    height: 52,
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
    ...typography.h2,
    color: colors.text.primary,
    ...shadows.card,
  },
  customMemoInput: {
    marginTop: spacing.sm,
    height: 44,
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
  saveArea: {
    marginTop: spacing.sm,
  },
});
