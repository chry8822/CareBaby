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
import { Calendar, Trash2 } from 'lucide-react-native';
import { WheelTimePicker } from '../ui/WheelTimePicker';
import { RulerInput } from '../ui/RulerInput';
import { useAuthStore } from '../../stores/authStore';
import { useBabyStore } from '../../stores/babyStore';
import { useRecordStore } from '../../stores/recordStore';
import { useUIStore } from '../../stores/uiStore';
import { Chip } from '../ui/Chip';
import { SaveButton } from '../ui/SaveButton';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import type { MealType, MealReaction, Meal } from '../../types/database';

const MEAL_TYPES: { key: MealType; label: string }[] = [
  { key: 'puree', label: '죽/퓨레' },
  { key: 'finger_food', label: '핑거푸드' },
  { key: 'snack', label: '간식' },
];

const REACTIONS: { key: MealReaction; label: string }[] = [
  { key: 'good', label: '잘 먹음' },
  { key: 'neutral', label: '보통' },
  { key: 'refused', label: '거부' },
];

const MEMO_CHIPS = ['처음 먹어봄', '알레르기 반응', '더 달라고 함', '게워냄'];
const MEAL_COLOR = colors.activity.meal;

const formatAmountMl = (ml: number): string => {
  if (ml === 0) return '미입력';
  return `${ml}ml`;
};

interface MealFormProps {
  onSaveSuccess?: () => void;
  initialRecord?: Meal;
  onDelete?: () => void;
}

export const MealForm = ({ onSaveSuccess, initialRecord, onDelete }: MealFormProps) => {
  const { user } = useAuthStore();
  const { currentBaby } = useBabyStore();
  const { saveMeal, deleteRecord } = useRecordStore();
  const { showToast, showModal, hideModal } = useUIStore();

  const isEditMode = !!initialRecord;

  const [mealType, setMealType] = useState<MealType>(initialRecord?.meal_type ?? 'puree');
  const [occurredAt, setOccurredAt] = useState(
    initialRecord ? new Date(initialRecord.occurred_at) : new Date(),
  );
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [amountValue, setAmountValue] = useState<number>(initialRecord?.amount_ml ?? 0);
  const [reaction, setReaction] = useState<MealReaction | null>(initialRecord?.reaction ?? null);
  const [selectedMemos, setSelectedMemos] = useState<string[]>(initialRecord?.memo_tags ?? []);
  const [customMemo, setCustomMemo] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const toggleMemo = useCallback((memo: string) => {
    setSelectedMemos((prev) =>
      prev.includes(memo) ? prev.filter((m) => m !== memo) : [...prev, memo],
    );
  }, []);

  const handleTimeConfirm = (date: Date) => {
    setOccurredAt(date);
    setShowTimePicker(false);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
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

    const allMemos = [...selectedMemos];
    if (customMemo.trim()) allMemos.push(customMemo.trim());

    setIsSaving(true);
    try {
      await saveMeal({
        ...(isEditMode && initialRecord?.id ? { id: initialRecord.id } : {}),
        baby_id: currentBaby.id,
        recorded_by: user.id,
        meal_type: mealType,
        occurred_at: occurredAt.toISOString(),
        amount_ml: amountValue > 0 ? amountValue : null,
        reaction: reaction,
        memo_tags: allMemos.length > 0 ? allMemos : null,
        note: null,
      });

      showToast(isEditMode ? '기록이 수정되었어요' : '기록이 저장되었어요', 'success');
      if (!isEditMode) resetForm();
      onSaveSuccess?.();
    } catch {
      showModal({
        title: isEditMode ? '수정 실패' : '저장 실패',
        message:
          '기록 저장에 실패했어요.\n\n⚠️ Supabase에 meals 테이블이 없을 수 있어요. DB 마이그레이션을 확인하세요.',
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
            await deleteRecord('meal', initialRecord.id);
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
    setMealType('puree');
    setOccurredAt(new Date());
    setAmountValue(0);
    setReaction(null);
    setSelectedMemos([]);
    setCustomMemo('');
    setShowCustomInput(false);
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
        {/* 이유식 종류 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>이유식 종류</Text>
          <View style={styles.chipRow}>
            {MEAL_TYPES.map((mt) => (
              <Chip
                key={mt.key}
                label={mt.label}
                selected={mealType === mt.key}
                onPress={() => setMealType(mt.key)}
                color={MEAL_COLOR}
              />
            ))}
          </View>
        </View>

        {/* 식사 시간 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>식사 시간</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.8}
          >
            <Calendar size={18} color={MEAL_COLOR} />
            <Text style={styles.timeButtonText}>{formatTime(occurredAt)}</Text>
            <Text style={styles.timeButtonLabel}>탭하여 변경</Text>
          </TouchableOpacity>
          <WheelTimePicker
            visible={showTimePicker}
            value={occurredAt}
            onConfirm={handleTimeConfirm}
            onCancel={() => setShowTimePicker(false)}
            accentColor={MEAL_COLOR}
            title="식사 시간 선택"
          />
        </View>

        {/* 섭취량 슬라이더 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>섭취량</Text>
          <View style={styles.sliderCard}>
            <RulerInput
              value={amountValue}
              min={0}
              max={500}
              step={10}
              onChange={setAmountValue}
              formatLabel={formatAmountMl}
              formatTickLabel={(v) => v === 0 ? '0' : v % 100 === 0 ? `${v}` : v % 50 === 0 ? `${v}` : ''}
              unit="ml"
              majorEvery={5}
              color={MEAL_COLOR}
            />
          </View>
        </View>

        {/* 반응 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>반응</Text>
          <View style={styles.chipRow}>
            {REACTIONS.map((r) => (
              <Chip
                key={r.key}
                label={r.label}
                selected={reaction === r.key}
                onPress={() => setReaction((prev) => (prev === r.key ? null : r.key))}
                color={MEAL_COLOR}
              />
            ))}
          </View>
        </View>

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
                color={MEAL_COLOR}
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
                  color={MEAL_COLOR}
                  label="수정 저장"
                />
              </View>
            </View>
          ) : (
            <SaveButton onPress={handleSave} isLoading={isSaving} color={MEAL_COLOR} />
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
  section: { marginBottom: spacing.sectionGap },
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
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.base,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  timeButtonText: {
    ...typography.bodySemiBold,
    color: colors.text.primary,
    flex: 1,
  },
  timeButtonLabel: {
    ...typography.caption,
    color: colors.text.secondary,
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
  saveArea: { marginTop: spacing.sm },
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
  editSaveBtn: { flex: 1 },
});
