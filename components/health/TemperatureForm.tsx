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
import { RulerInput } from '../ui/RulerInput';
import { useHealthStore } from '../../stores/healthStore';
import { useAuthStore } from '../../stores/authStore';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import type { Temperature } from '../../types/database';

const COLOR = '#E05C5C';

interface Props {
  babyId: string;
  onSaved?: () => void;
  initialData?: Temperature;
}

export const TemperatureForm = ({ babyId, onSaved, initialData }: Props) => {
  const { user } = useAuthStore();
  const { saveTemperature, updateTemperature } = useHealthStore();
  const isEditing = !!initialData;

  const [tempValue, setTempValue] = useState(initialData?.value_celsius ?? 36.5);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [measuredAt, setMeasuredAt] = useState(
    initialData ? new Date(initialData.measured_at) : new Date()
  );
  const [note, setNote] = useState(initialData?.note ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTempValue(initialData?.value_celsius ?? 36.5);
    setMeasuredAt(initialData ? new Date(initialData.measured_at) : new Date());
    setNote(initialData?.note ?? '');
  }, [initialData]);

  const formatDateTime = (date: Date) =>
    date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) +
    ' ' +
    date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

  const handleSave = async () => {
    if (tempValue < 34 || tempValue > 42) {
      Alert.alert('입력 오류', '체온은 34°C ~ 42°C 사이여야 합니다.');
      return;
    }
    if (!user) return;
    setSaving(true);
    try {
      if (isEditing) {
        await updateTemperature(initialData.id, {
          value_celsius: tempValue,
          measured_at: measuredAt.toISOString(),
          note: note.trim() || null,
        });
      } else {
        await saveTemperature({
          baby_id: babyId,
          recorded_by: user.id,
          value_celsius: tempValue,
          measured_at: measuredAt.toISOString(),
          note: note.trim() || null,
        });
      }
      if (!isEditing) {
        setTempValue(36.5);
        setNote('');
        setMeasuredAt(new Date());
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
          {/* 체온 롤러 */}
          <View style={styles.section}>
            <Text style={styles.label}>체온 (°C)</Text>
            <View style={styles.rulerCard}>
              <RulerInput
                value={tempValue}
                min={34}
                max={42}
                step={0.1}
                majorEvery={10}
                decimalInput
                onChange={(v) => setTempValue(parseFloat(v.toFixed(1)))}
                formatLabel={(v) => v.toFixed(1)}
                formatTickLabel={(v) => `${v.toFixed(0)}°`}
                unit="°C"
                color={COLOR}
              />
            </View>
          </View>

          {/* 측정 시간 */}
          <View style={styles.section}>
            <Text style={styles.label}>측정 시간</Text>
            <TouchableOpacity style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
              <Text style={styles.timeText}>{formatDateTime(measuredAt)}</Text>
            </TouchableOpacity>
          </View>

          {/* 메모 */}
          <View style={styles.section}>
            <Text style={styles.label}>메모 (선택)</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="증상, 상태 등 기록..."
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
        value={measuredAt}
        mode="datetime"
        onConfirm={(date) => { setMeasuredAt(date); setShowTimePicker(false); }}
        onCancel={() => setShowTimePicker(false)}
        accentColor={COLOR}
        title="측정 시간 선택"
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
  rulerCard: {
    backgroundColor: colors.bg.primary,
    borderRadius: borderRadius.base,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
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
