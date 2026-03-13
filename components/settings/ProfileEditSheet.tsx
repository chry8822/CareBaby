import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { BottomSheet } from '../ui/BottomSheet';
import { AvatarPicker } from '../ui/AvatarPicker';
import { ClearableInput } from '../ui/ClearableInput';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { uploadAvatarToStorage } from '../../lib/avatarUtils';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';

const PARENT_ROLES = [
  { key: 'mom', label: '엄마' },
  { key: 'dad', label: '아빠' },
  { key: 'grandparent', label: '조부모' },
  { key: 'other', label: '기타' },
] as const;

interface ProfileEditSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const ProfileEditSheet = ({ visible, onClose }: ProfileEditSheetProps) => {
  const { profile, updateProfile, user } = useAuthStore();
  const { showToast } = useUIStore();

  const [displayName, setDisplayName] = useState('');
  const [parentRole, setParentRole] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible && profile) {
      setDisplayName(profile.display_name ?? '');
      setParentRole(profile.parent_role ?? null);
      setAvatarUri(profile.avatar_url ?? null);
      setAvatarChanged(false);
    }
  }, [visible, profile]);

  const uploadUserAvatar = (localUri: string): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    return uploadAvatarToStorage('user-avatars', `${user.id}_${Date.now()}`, localUri);
  };

  const handleSave = async () => {
    const trimmed = displayName.trim();
    if (!trimmed) {
      showToast('이름을 입력해주세요.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      // undefined 값이 포함되지 않도록 명시적으로 구성
      const updates: Parameters<typeof updateProfile>[0] = {
        display_name: trimmed,
      };
      // parentRole이 null이면 키 자체를 제외 (DB에 없는 컬럼 업데이트 방지)
      if (parentRole !== null) {
        updates.parent_role = parentRole;
      }

      if (avatarChanged && avatarUri) {
        const url = await uploadUserAvatar(avatarUri);
        updates.avatar_url = url;
      }

      await updateProfile(updates);
      showToast('프로필이 저장되었습니다.', 'success');
      onClose();
    } catch (err) {
      console.error('[ProfileEditSheet] 저장 실패:', err);
      showToast('저장에 실패했습니다.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={['60%']}
      title="프로필 수정"
      closeOnBackdrop={false}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        {/* 아바타 */}
        <View style={styles.avatarRow}>
          <AvatarPicker
            uri={avatarUri}
            size={88}
            onPick={(uri) => {
              setAvatarUri(uri);
              setAvatarChanged(true);
            }}
          />
        </View>

        {/* 이름 */}
        <Text style={styles.label}>이름</Text>
        <ClearableInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="이름을 입력해주세요"
          maxLength={20}
          returnKeyType="done"
        />

        {/* 역할 */}
        <Text style={[styles.label, { marginTop: spacing.lg }]}>역할</Text>
        <View style={styles.roleRow}>
          {PARENT_ROLES.map((r) => (
            <TouchableOpacity
              key={r.key}
              style={[styles.roleChip, parentRole === r.key && styles.roleChipActive]}
              onPress={() => setParentRole(parentRole === r.key ? null : r.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.roleChipText, parentRole === r.key && styles.roleChipTextActive]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 저장 버튼 */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>저장</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.xxl ?? 40,
  },
  avatarRow: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.bodyRegular,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  roleChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  roleChipText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  roleChipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.base,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...typography.bodySemiBold,
    color: colors.white,
  },
});
