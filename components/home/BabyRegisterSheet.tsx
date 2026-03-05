import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BottomSheet } from '../ui/BottomSheet';
import { BirthDatePicker } from '../ui/BirthDatePicker';
import type { BirthDate } from '../ui/BirthDatePicker';
import { Chip } from '../ui/Chip';
import { SaveButton } from '../ui/SaveButton';
import { useBabyStore } from '../../stores/babyStore';
import { useUIStore } from '../../stores/uiStore';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import type { BabyGender } from '../../types/database';

interface BabyRegisterSheetProps {
  visible: boolean;
  onClose: () => void;
  onRegisterSuccess?: () => void;
}

const GENDER_OPTIONS: { key: BabyGender; label: string }[] = [
  { key: 'male', label: '남아' },
  { key: 'female', label: '여아' },
  { key: 'unknown', label: '모름' },
];

const todayBirthDate = (): BirthDate => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
};

export const BabyRegisterSheet = ({
  visible,
  onClose,
  onRegisterSuccess,
}: BabyRegisterSheetProps) => {
  const { createBaby } = useBabyStore();
  const { showModal, hideModal, showToast } = useUIStore();

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState<BirthDate>(todayBirthDate);
  const [gender, setGender] = useState<BabyGender>('unknown');
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setName('');
    setBirthDate(todayBirthDate());
    setGender('unknown');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showModal({
        title: '이름을 입력해주세요',
        message: '아기 이름은 필수 항목이에요.',
        primaryAction: { label: '확인', onPress: hideModal },
      });
      return;
    }

    const { year, month, day } = birthDate;
    const birthDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    setIsSaving(true);
    try {
      await createBaby(name.trim(), birthDateStr, gender);
      showToast('아기 정보가 등록됐어요', 'success');
      resetForm();
      onRegisterSuccess?.();
    } catch {
      showModal({
        title: '등록 실패',
        message: '아기 정보 등록에 실패했어요. 잠시 후 다시 시도해주세요.',
        primaryAction: { label: '확인', onPress: hideModal },
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={['75%']}
      title="아기 등록"
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 이름 */}
          <View style={styles.section}>
            <Text style={styles.label}>아기 이름</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="이름을 입력해주세요"
              placeholderTextColor={colors.text.secondary}
              maxLength={20}
              returnKeyType="done"
            />
          </View>

          {/* 생년월일 — 휠 피커 */}
          <View style={styles.section}>
            <Text style={styles.label}>생년월일</Text>
            <BirthDatePicker
              value={birthDate}
              onChange={setBirthDate}
              accentColor={colors.accent}
            />
          </View>

          {/* 성별 */}
          <View style={styles.section}>
            <Text style={styles.label}>성별</Text>
            <View style={styles.chipRow}>
              {GENDER_OPTIONS.map((opt) => (
                <Chip
                  key={opt.key}
                  label={opt.label}
                  selected={gender === opt.key}
                  onPress={() => setGender(opt.key)}
                  color={colors.accent}
                />
              ))}
            </View>
          </View>

          <View style={styles.saveArea}>
            <SaveButton onPress={handleSave} isLoading={isSaving} color={colors.accent} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
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
  label: {
    ...typography.bodySemiBold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  input: {
    height: 52,
    backgroundColor: colors.bg.primary,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    ...typography.bodyRegular,
    color: colors.text.primary,
    ...shadows.card,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  saveArea: {
    marginTop: spacing.sm,
  },
});
