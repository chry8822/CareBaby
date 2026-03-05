import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useBabyStore } from '../stores/babyStore';
import { useUIStore } from '../stores/uiStore';
import { DatePickerModal, PickerDate } from '../components/ui/DatePickerModal';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';
import type { BabyGender } from '../types/database';

const GENDERS: {
  key: BabyGender;
  label: string;
  sub: string;
  color: string;
  bgActive: string;
}[] = [
  { key: 'male',    label: '남아', sub: 'Boy',     color: '#7BABD4', bgActive: '#EEF4FA' },
  { key: 'female',  label: '여아', sub: 'Girl',    color: '#D4849A', bgActive: '#FDF2F5' },
  { key: 'unknown', label: '미정', sub: 'Unknown', color: '#9BAE9B', bgActive: '#F2F6F2' },
];

const pad = (n: number) => String(n).padStart(2, '0');

const formatDate = (y: number, m: number, d: number) =>
  `${y}년 ${pad(m)}월 ${pad(d)}일`;

const todayDate: PickerDate = (() => {
  const t = new Date();
  return { year: t.getFullYear() - 1, month: t.getMonth() + 1, day: t.getDate() };
})();

const parseBirthDate = (dateStr: string): PickerDate => {
  const d = new Date(dateStr);
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
};

const BabySetupScreen = () => {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { currentBaby, createBaby, updateBaby, isLoading } = useBabyStore();
  const { showToast } = useUIStore();

  const isEdit = mode === 'edit' && !!currentBaby;

  const [name, setName] = useState(isEdit ? (currentBaby?.name ?? '') : '');
  const [gender, setGender] = useState<BabyGender>(
    isEdit ? (currentBaby?.gender ?? 'unknown') : 'unknown',
  );
  const [birthDate, setBirthDate] = useState<PickerDate>(
    isEdit && currentBaby?.birth_date ? parseBirthDate(currentBaby.birth_date) : todayDate,
  );
  const [dateSelected, setDateSelected] = useState(isEdit && !!currentBaby?.birth_date);
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('아기 이름을 입력해주세요.', 'error');
      return;
    }
    if (!dateSelected) {
      showToast('생년월일을 선택해주세요.', 'error');
      return;
    }

    const birthDateStr = `${birthDate.year}-${pad(birthDate.month)}-${pad(birthDate.day)}`;

    try {
      if (isEdit && currentBaby) {
        await updateBaby(currentBaby.id, name.trim(), birthDateStr, gender);
        showToast('아기 정보가 수정되었습니다.', 'success');
        router.back();
      } else {
        await createBaby(name.trim(), birthDateStr, gender);
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error('[BabySetup] 저장 실패:', err);
      showToast(isEdit ? '수정에 실패했습니다.' : '아기 등록에 실패했습니다.', 'error');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ChevronLeft color={colors.text.primary} size={24} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? '아기 정보 수정' : '아기 등록'}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!isEdit && (
          <Text style={styles.pageDesc}>소중한 아기의 정보를 등록해 주세요.</Text>
        )}

        {/* 이름 */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>이름</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="아기 이름을 입력해주세요"
            placeholderTextColor="#C2C2C2"
            maxLength={20}
            returnKeyType="done"
          />
        </View>

        {/* 생년월일 */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>생년월일</Text>
          <TouchableOpacity
            style={[styles.input, styles.dateInput]}
            onPress={() => { Keyboard.dismiss(); setPickerVisible(true); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.inputText, !dateSelected && styles.placeholder]}>
              {dateSelected
                ? formatDate(birthDate.year, birthDate.month, birthDate.day)
                : '생년월일 선택하기'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 성별 */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>성별</Text>
          <View style={styles.genderRow}>
            {GENDERS.map(({ key, label, sub, color, bgActive }) => {
              const isActive = gender === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.genderChip,
                    isActive && { borderColor: color, backgroundColor: bgActive },
                  ]}
                  onPress={() => setGender(key)}
                  activeOpacity={0.8}
                >
                  {/* 색상 인디케이터 도트 */}
                  <View
                    style={[
                      styles.genderDot,
                      { backgroundColor: isActive ? color : `${color}50` },
                    ]}
                  />
                  <Text style={[styles.genderLabel, isActive && { color }]}>
                    {label}
                  </Text>
                  <Text style={[styles.genderSub, isActive && { color, opacity: 0.8 }]}>
                    {sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 저장 버튼 */}
        <TouchableOpacity
          style={[styles.saveBtn, isLoading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>{isEdit ? '수정 완료' : '등록하기'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <DatePickerModal
        visible={pickerVisible}
        value={birthDate}
        onConfirm={(date) => {
          setBirthDate(date);
          setDateSelected(true);
          setPickerVisible(false);
        }}
        onCancel={() => setPickerVisible(false)}
        accentColor={colors.accent}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: 48,
    paddingTop: spacing.md,
  },
  pageDesc: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.xxl,
  },
  fieldGroup: {
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    ...typography.bodySemiBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    fontSize: 15,
    color: colors.text.primary,
    ...shadows.card,
  },
  dateInput: {
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 15,
    color: colors.text.primary,
  },
  placeholder: {
    color: '#C2C2C2',
  },
  genderRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  genderChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.base,
    paddingVertical: spacing.xl,
    paddingTop: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 4,
    ...shadows.card,
  },
  genderDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 2,
  },
  genderLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  genderSub: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.text.secondary,
    opacity: 0.6,
  },
  saveBtn: {
    marginTop: spacing.sectionGap,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.base,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    ...shadows.elevated,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    ...typography.bodySemiBold,
    fontSize: 16,
    color: colors.white,
  },
});

export default BabySetupScreen;
