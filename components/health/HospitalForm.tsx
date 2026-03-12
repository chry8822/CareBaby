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
import { useHealthStore } from '../../stores/healthStore';
import { useAuthStore } from '../../stores/authStore';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import type { HospitalVisit } from '../../types/database';

const COLOR = '#7BA7A0';

const VISIT_REASONS = ['감기', '발열', '예방접종', '검진', '피부', '소화', '기타'];

interface Props {
  babyId: string;
  onSaved?: () => void;
  initialData?: HospitalVisit;
}

export const HospitalForm = ({ babyId, onSaved, initialData }: Props) => {
  const { user } = useAuthStore();
  const { saveHospitalVisit, updateHospitalVisit } = useHealthStore();
  const isEditing = !!initialData;

  const [clinicName, setClinicName] = useState(initialData?.clinic_name ?? '');
  const [reason, setReason] = useState(initialData?.reason ?? '');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [occurredAt, setOccurredAt] = useState(
    initialData ? new Date(initialData.occurred_at) : new Date()
  );
  const [note, setNote] = useState(initialData?.note ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setClinicName(initialData?.clinic_name ?? '');
    setReason(initialData?.reason ?? '');
    setOccurredAt(initialData ? new Date(initialData.occurred_at) : new Date());
    setNote(initialData?.note ?? '');
  }, [initialData]);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleSave = async () => {
    if (!clinicName.trim()) {
      Alert.alert('입력 오류', '병원 이름을 입력해주세요.');
      return;
    }
    if (!user) return;
    setSaving(true);
    try {
      if (isEditing) {
        await updateHospitalVisit(initialData.id, {
          clinic_name: clinicName.trim(),
          reason: reason.trim() || null,
          occurred_at: occurredAt.toISOString(),
          note: note.trim() || null,
        });
      } else {
        await saveHospitalVisit({
          baby_id: babyId,
          recorded_by: user.id,
          clinic_name: clinicName.trim(),
          reason: reason.trim() || null,
          occurred_at: occurredAt.toISOString(),
          note: note.trim() || null,
        });
      }
      if (!isEditing) {
        setClinicName('');
        setReason('');
        setNote('');
        setOccurredAt(new Date());
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
          {/* 병원 이름 */}
          <View style={styles.section}>
            <Text style={styles.label}>병원 이름</Text>
            <TextInput
              style={styles.input}
              value={clinicName}
              onChangeText={setClinicName}
              placeholder="병원·의원 이름 입력"
              placeholderTextColor={colors.text.secondary}
              maxLength={50}
            />
          </View>

          {/* 방문 사유 */}
          <View style={styles.section}>
            <Text style={styles.label}>방문 사유 (선택)</Text>
            <TextInput
              style={[styles.input, { marginBottom: spacing.sm }]}
              value={reason}
              onChangeText={setReason}
              placeholder="직접 입력"
              placeholderTextColor={colors.text.secondary}
              maxLength={50}
            />
            <View style={styles.chipRow}>
              {VISIT_REASONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.chip,
                    reason === r && { backgroundColor: `${COLOR}20`, borderColor: COLOR },
                  ]}
                  onPress={() => setReason(reason === r ? '' : r)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      reason === r && { color: COLOR, fontWeight: '600' },
                    ]}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 방문 날짜 */}
          <View style={styles.section}>
            <Text style={styles.label}>방문 날짜</Text>
            <TouchableOpacity style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
              <Text style={styles.timeText}>{formatDate(occurredAt)}</Text>
            </TouchableOpacity>
          </View>

          {/* 메모 */}
          <View style={styles.section}>
            <Text style={styles.label}>메모 (선택)</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="진단명, 처방, 특이사항 등..."
              placeholderTextColor={colors.text.secondary}
              multiline
              maxLength={300}
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
        value={occurredAt}
        mode="datetime"
        onConfirm={(date) => { setOccurredAt(date); setShowTimePicker(false); }}
        onCancel={() => setShowTimePicker(false)}
        accentColor={COLOR}
        title="방문 날짜 선택"
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
