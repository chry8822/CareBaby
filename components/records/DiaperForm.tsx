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
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { useBabyStore } from '../../stores/babyStore';
import { useRecordStore } from '../../stores/recordStore';
import { useUIStore } from '../../stores/uiStore';
import { Chip } from '../ui/Chip';
import { SaveButton } from '../ui/SaveButton';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import type { DiaperType } from '../../types/database';

const DIAPER_TYPES: { key: DiaperType; label: string }[] = [
  { key: 'wet', label: '소변' },
  { key: 'dirty', label: '대변' },
  { key: 'both', label: '소+대변' },
];

const MEMO_CHIPS = ['색이 이상함', '냄새 심함', '피가 섞임', '점액질'];

const DIAPER_COLOR = colors.activity.diaper;

export const DiaperForm = () => {
  const { user } = useAuthStore();
  const { currentBaby } = useBabyStore();
  const { saveDiaper } = useRecordStore();
  const { showToast, showModal, hideModal } = useUIStore();

  const [diaperType, setDiaperType] = useState<DiaperType>('wet');
  const [occurredAt, setOccurredAt] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMemos, setSelectedMemos] = useState<string[]>([]);
  const [customMemo, setCustomMemo] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const toggleMemo = useCallback((memo: string) => {
    setSelectedMemos((prev) =>
      prev.includes(memo) ? prev.filter((m) => m !== memo) : [...prev, memo],
    );
  }, []);

  const handleDatePickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'set' && date) {
      setOccurredAt(date);
    }
  };

  const formatDateTime = (date: Date): string => {
    const today = new Date();
    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    const timeStr = date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (isToday) return `오늘 ${timeStr}`;

    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    }) + ` ${timeStr}`;
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
      await saveDiaper({
        baby_id: currentBaby.id,
        recorded_by: user.id,
        diaper_type: diaperType,
        occurred_at: occurredAt.toISOString(),
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
    setDiaperType('wet');
    setOccurredAt(new Date());
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
        {/* 기저귀 타입 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기저귀 종류</Text>
          <View style={styles.chipRow}>
            {DIAPER_TYPES.map((dt) => (
              <Chip
                key={dt.key}
                label={dt.label}
                selected={diaperType === dt.key}
                onPress={() => setDiaperType(dt.key)}
                color={DIAPER_COLOR}
              />
            ))}
          </View>
        </View>

        {/* 발생 시간 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>발생 시간</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <Calendar color={DIAPER_COLOR} size={20} />
            <Text style={styles.dateButtonText}>{formatDateTime(occurredAt)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={occurredAt}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDatePickerChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* 특이사항 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>특이사항</Text>
          <View style={styles.chipRow}>
            {MEMO_CHIPS.map((memo) => (
              <Chip
                key={memo}
                label={memo}
                selected={selectedMemos.includes(memo)}
                onPress={() => toggleMemo(memo)}
                color={DIAPER_COLOR}
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
              placeholder="특이사항을 입력하세요"
              placeholderTextColor={colors.text.secondary}
              maxLength={50}
            />
          ) : null}
        </View>

        <View style={styles.saveArea}>
          <SaveButton onPress={handleSave} isLoading={isSaving} />
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.base,
    padding: spacing.xl,
    ...shadows.card,
  },
  dateButtonText: {
    ...typography.bodySemiBold,
    color: colors.text.primary,
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
