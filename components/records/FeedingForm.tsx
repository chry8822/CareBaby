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
import { Play, Pause, Square, Clock, SlidersHorizontal, Trash2 } from 'lucide-react-native';
import { WheelTimePicker } from '../ui/WheelTimePicker';
import { SliderInput } from '../ui/SliderInput';
import { useAuthStore } from '../../stores/authStore';
import { useBabyStore } from '../../stores/babyStore';
import { useRecordStore } from '../../stores/recordStore';
import { useUIStore } from '../../stores/uiStore';
import { useTimer } from '../../hooks/useTimer';
import { Chip } from '../ui/Chip';
import { TimerDisplay, formatDuration } from '../ui/TimerDisplay';
import { SaveButton } from '../ui/SaveButton';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import type { FeedingType, Feeding } from '../../types/database';

const FEEDING_TYPES: { key: FeedingType; label: string }[] = [
  { key: 'breast_left', label: '모유(좌)' },
  { key: 'breast_right', label: '모유(우)' },
  { key: 'pumped', label: '유축모유' },
  { key: 'formula', label: '분유' },
];

const MEMO_CHIPS = ['잘 먹음', '칭얼거림', '트림함', '뱉음', '졸면서 먹음'];
const NURSING_COLOR = colors.activity.nursing;

const formatDurationMin = (min: number): string => {
  if (min === 0) return '미입력';
  if (min < 60) return `${min}분`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
};

const formatAmountMl = (ml: number): string => {
  if (ml === 0) return '미입력';
  return `${ml}ml`;
};

interface FeedingFormProps {
  onSaveSuccess?: () => void;
  initialRecord?: Feeding;
  onDelete?: () => void;
}

export const FeedingForm = ({ onSaveSuccess, initialRecord, onDelete }: FeedingFormProps) => {
  const { user } = useAuthStore();
  const { currentBaby } = useBabyStore();
  const { saveFeeding, deleteRecord } = useRecordStore();
  const { showToast, showModal, hideModal } = useUIStore();

  const { elapsed, isRunning, isPaused, start, pause, resume, stop, reset } = useTimer();

  const isEditMode = !!initialRecord;

  const [feedingType, setFeedingType] = useState<FeedingType>(
    initialRecord?.feeding_type ?? 'breast_left',
  );
  const [isDirectInput, setIsDirectInput] = useState(isEditMode);
  const [durationMin, setDurationMin] = useState<number>(
    initialRecord?.duration_seconds ? Math.round(initialRecord.duration_seconds / 60) : 15,
  );
  const [startTime, setStartTime] = useState(
    initialRecord ? new Date(initialRecord.started_at) : new Date(),
  );
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [amountValue, setAmountValue] = useState<number>(initialRecord?.amount_ml ?? 0);
  const [selectedMemos, setSelectedMemos] = useState<string[]>(initialRecord?.memo_tags ?? []);
  const [customMemo, setCustomMemo] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isAmountVisible = feedingType === 'formula' || feedingType === 'pumped';

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
    } else if (durationMin > 0) {
      durationSeconds = durationMin * 60;
      endedAt = new Date(startTime.getTime() + durationSeconds * 1000).toISOString();
    }

    const allMemos = [...selectedMemos];
    if (customMemo.trim()) allMemos.push(customMemo.trim());

    setIsSaving(true);
    try {
      await saveFeeding({
        ...(isEditMode && initialRecord?.id ? { id: initialRecord.id } : {}),
        baby_id: currentBaby.id,
        recorded_by: user.id,
        feeding_type: feedingType,
        started_at: startTime.toISOString(),
        ended_at: endedAt,
        duration_seconds: durationSeconds,
        amount_ml: isAmountVisible && amountValue > 0 ? amountValue : null,
        memo_tags: allMemos.length > 0 ? allMemos : null,
        note: null,
      });

      showToast(isEditMode ? '기록이 수정되었어요' : '기록이 저장되었어요', 'success');
      if (!isEditMode) resetForm();
      onSaveSuccess?.();
    } catch {
      showModal({
        title: isEditMode ? '수정 실패' : '저장 실패',
        message: '기록 저장에 실패했어요. 오프라인 상태에서는 나중에 자동으로 동기화돼요.',
        primaryAction: { label: '확인', onPress: hideModal },
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!initialRecord) return;
    showModal({
      title: '기록 삭제',
      message: '이 기록을 삭제할까요? 삭제한 기록은 복구할 수 없어요.',
      primaryAction: {
        label: '삭제',
        onPress: async () => {
          hideModal();
          setIsSaving(true);
          try {
            await deleteRecord('feeding', initialRecord.id);
            showToast('기록이 삭제되었어요', 'success');
            onDelete?.();
            onSaveSuccess?.();
          } catch {
            showModal({
              title: '삭제 실패',
              message: '기록 삭제에 실패했어요.',
              primaryAction: { label: '확인', onPress: hideModal },
            });
          } finally {
            setIsSaving(false);
          }
        },
      },
      secondaryAction: { label: '취소', onPress: hideModal },
    });
  };

  const resetForm = () => {
    reset();
    setDurationMin(15);
    setStartTime(new Date());
    setAmountValue(0);
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

        {/* 타이머 / 슬라이더 토글 — 수정 모드에서는 숨김 */}
        {!isEditMode && (
          <View style={styles.section}>
            <View style={styles.inputModeRow}>
              <TouchableOpacity
                style={[styles.modeTab, !isDirectInput && styles.modeTabActive]}
                onPress={() => setIsDirectInput(false)}
              >
                <Clock size={14} color={!isDirectInput ? colors.white : colors.text.secondary} />
                <Text style={[styles.modeTabText, !isDirectInput && styles.modeTabTextActive]}>
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
                <SlidersHorizontal
                  size={14}
                  color={isDirectInput ? colors.white : colors.text.secondary}
                />
                <Text style={[styles.modeTabText, isDirectInput && styles.modeTabTextActive]}>
                  직접 입력
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 타이머 모드 */}
        {!isDirectInput && !isEditMode ? (
          <View style={[styles.section, { marginTop: -spacing.sectionGap }]}>
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
                      <Text style={[styles.timerBtnText, { color: colors.text.secondary }]}>
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
                      <Text style={[styles.timerBtnText, { color: colors.text.secondary }]}>
                        중단
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : null}
              </View>
              {elapsed > 0 && !isRunning && !isPaused ? (
                <Text style={styles.elapsedHint}>기록된 시간: {formatDuration(elapsed)}</Text>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* 슬라이더 / 직접입력 모드 */}
        {(isDirectInput || isEditMode) ? (
          <View style={styles.section}>
            {/* 시작 시간 */}
            <Text style={styles.sectionTitle}>시작 시간</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.timeButtonText}>
                {startTime.toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Text style={styles.timeButtonLabel}>탭하여 변경</Text>
            </TouchableOpacity>
            <WheelTimePicker
              visible={showTimePicker}
              value={startTime}
              onConfirm={handleTimeConfirm}
              onCancel={() => setShowTimePicker(false)}
              accentColor={NURSING_COLOR}
              title="시작 시간 선택"
            />

            {/* 수유 시간 슬라이더 */}
            <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>수유 시간</Text>
            <View style={styles.sliderCard}>
              <SliderInput
                value={durationMin}
                min={0}
                max={120}
                step={5}
                onChange={setDurationMin}
                formatLabel={formatDurationMin}
                unit="분"
                color={NURSING_COLOR}
              />
            </View>
          </View>
        ) : null}

        {/* 수유량 (분유/유축 시만) — 슬라이더 */}
        {isAmountVisible ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>수유량</Text>
            <View style={styles.sliderCard}>
              <SliderInput
                value={amountValue}
                min={0}
                max={300}
                step={10}
                onChange={setAmountValue}
                formatLabel={formatAmountMl}
                unit="ml"
                color={NURSING_COLOR}
              />
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

        {/* 저장 / 삭제 버튼 */}
        <View style={styles.saveArea}>
          {isEditMode ? (
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={handleDelete}
                activeOpacity={0.8}
                disabled={isSaving}
              >
                <Trash2 size={18} color={colors.error} />
                <Text style={styles.deleteBtnText}>삭제</Text>
              </TouchableOpacity>
              <View style={styles.editSaveBtn}>
                <SaveButton
                  onPress={handleSave}
                  isLoading={isSaving}
                  color={NURSING_COLOR}
                  label="수정 저장"
                />
              </View>
            </View>
          ) : (
            <SaveButton onPress={handleSave} isLoading={isSaving} color={NURSING_COLOR} />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  timerBtnPrimary: { backgroundColor: colors.activity.nursing },
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
  timerBtnTextSecondary: { color: colors.activity.nursing },
  elapsedHint: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  timeButton: {
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.base,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  timeButtonText: {
    ...typography.h2,
    fontSize: 24,
    color: colors.activity.nursing,
  },
  timeButtonLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  sliderCard: {
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.base,
    padding: spacing.xl,
    paddingHorizontal: spacing.screenPadding,
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
  editButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.base,
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  deleteBtnText: {
    ...typography.bodySemiBold,
    color: colors.error,
    fontSize: 14,
  },
  editSaveBtn: {
    flex: 1,
  },
});
