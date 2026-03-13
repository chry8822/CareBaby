import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { WheelTimePicker } from '../ui/WheelTimePicker';
import { ClearableInput } from '../ui/ClearableInput';
import { useHealthStore } from '../../stores/healthStore';
import { useAuthStore } from '../../stores/authStore';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import type { Medicine } from '../../types/database';

const COLOR = '#9B8EC4';

const COMMON_MEDICINES = ['타이레놀', '부루펜', '콧물약', '소화제', '유산균', '비타민D'];

interface Props {
  babyId: string;
  onSaved?: () => void;
  initialData?: Medicine;
}

export const MedicineForm = ({ babyId, onSaved, initialData }: Props) => {
  const { user } = useAuthStore();
  const { saveMedicine, updateMedicine } = useHealthStore();
  const isEditing = !!initialData;

  const [medicineName, setMedicineName] = useState(initialData?.medicine_name ?? '');
  const [dosage, setDosage] = useState(initialData?.dosage ?? '');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [givenAt, setGivenAt] = useState(
    initialData ? new Date(initialData.given_at) : new Date()
  );
  const [note, setNote] = useState(initialData?.note ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMedicineName(initialData?.medicine_name ?? '');
    setDosage(initialData?.dosage ?? '');
    setGivenAt(initialData ? new Date(initialData.given_at) : new Date());
    setNote(initialData?.note ?? '');
  }, [initialData]);

  const formatDateTime = (date: Date) =>
    date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) +
    ' ' +
    date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

  const handleSave = async () => {
    if (!medicineName.trim()) {
      Alert.alert('입력 오류', '약 이름을 입력해주세요.');
      return;
    }
    if (!user) return;
    setSaving(true);
    try {
      if (isEditing) {
        await updateMedicine(initialData.id, {
          medicine_name: medicineName.trim(),
          dosage: dosage.trim() || null,
          given_at: givenAt.toISOString(),
          note: note.trim() || null,
        });
      } else {
        await saveMedicine({
          baby_id: babyId,
          recorded_by: user.id,
          medicine_name: medicineName.trim(),
          dosage: dosage.trim() || null,
          given_at: givenAt.toISOString(),
          note: note.trim() || null,
        });
      }
      if (!isEditing) {
        setMedicineName('');
        setDosage('');
        setNote('');
        setGivenAt(new Date());
      }
      onSaved?.();
    } catch {
      Alert.alert('저장 실패', '다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 약 이름 */}
          <View style={styles.section}>
            <Text style={styles.label}>약 이름</Text>
            <ClearableInput
              style={styles.input}
              value={medicineName}
              onChangeText={setMedicineName}
              placeholder="약 이름 입력"
              maxLength={50}
              returnKeyType="done"
            />
            <View style={styles.chipRow}>
              {COMMON_MEDICINES.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.chip,
                    medicineName === m && { backgroundColor: `${COLOR}20`, borderColor: COLOR },
                  ]}
                  onPress={() => setMedicineName(m)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      medicineName === m && { color: COLOR, fontWeight: '600' },
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 용량 */}
          <View style={styles.section}>
            <Text style={styles.label}>용량 (선택)</Text>
            <ClearableInput
              style={styles.input}
              value={dosage}
              onChangeText={setDosage}
              placeholder="예: 5ml, 1정"
              maxLength={30}
              returnKeyType="done"
            />
          </View>

          {/* 복용 시간 */}
          <View style={styles.section}>
            <Text style={styles.label}>복용 시간</Text>
            <TouchableOpacity style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
              <Text style={styles.timeText}>{formatDateTime(givenAt)}</Text>
            </TouchableOpacity>
          </View>

          {/* 메모 */}
          <View style={styles.section}>
            <Text style={styles.label}>메모 (선택)</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="반응, 증상 변화 등..."
              placeholderTextColor={colors.text.secondary}
              multiline
              maxLength={200}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: COLOR }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.saveText}>{isEditing ? '수정' : '저장'}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <WheelTimePicker
        visible={showTimePicker}
        value={givenAt}
        mode="datetime"
        onConfirm={(date) => { setGivenAt(date); setShowTimePicker(false); }}
        onCancel={() => setShowTimePicker(false)}
        accentColor={COLOR}
        title="복용 시간 선택"
      />
    </>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  input: {
    height: 48,
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.base,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    ...typography.bodyRegular,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg.elevated,
  },
  chipText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  timeButton: {
    height: 48,
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.base,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  timeText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
  noteInput: {
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.base,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.bodyRegular,
    color: colors.text.primary,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  saveButton: {
    height: 52,
    borderRadius: borderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  saveText: {
    ...typography.bodySemiBold,
    color: colors.white,
    fontWeight: '600',
  },
});
