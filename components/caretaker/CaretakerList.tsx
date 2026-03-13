import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { User, Trash2 } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useBabyStore } from '../../stores/babyStore';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import { useState } from 'react';
import type { CaretakerWithProfile } from '../../types/database';

const ROLE_LABEL: Record<string, string> = {
  owner: '주 양육자',
  caretaker: '공동 양육자',
};

const PARENT_ROLE_LABEL: Record<string, string> = {
  mom: '엄마',
  dad: '아빠',
  grandparent: '조부모',
  other: '기타',
};

const formatJoinedAt = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 등록`;
};

interface CaretakerListProps {
  babyId: string;
}

export const CaretakerList = ({ babyId }: CaretakerListProps) => {
  const { caretakers, fetchCaretakers } = useBabyStore();
  const { user, profile } = useAuthStore();
  const { showModal, hideModal, showToast } = useUIStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const myCaretaker = caretakers.find((c) => c.profile_id === user?.id);
  const isOwner = myCaretaker?.role === 'owner';

  const handleDelete = (target: CaretakerWithProfile) => {
    showModal({
      title: '양육자 삭제',
      message: `${target.profile_id === user?.id ? '본인을' : '이 양육자를'} 목록에서 제거하시겠어요?`,
      primaryAction: {
        label: '삭제',
        variant: 'danger',
        onPress: async () => {
          hideModal();
          setDeletingId(target.id);
          try {
            const { error } = await supabase
              .from('caretakers')
              .delete()
              .eq('id', target.id);
            if (error) throw error;
            await fetchCaretakers(babyId);
            showToast('삭제됐어요', 'success');
          } catch {
            showToast('삭제에 실패했어요', 'error');
          } finally {
            setDeletingId(null);
          }
        },
      },
      secondaryAction: {
        label: '취소',
        onPress: hideModal,
      },
    });
  };

  if (caretakers.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>공동 양육자 (0명)</Text>
        <Text style={styles.emptyText}>아직 공동 양육자가 없어요.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>공동 양육자 ({caretakers.length}명)</Text>

      {caretakers.map((ct, index) => {
        const isMe = ct.profile_id === user?.id;
        const canDelete = isOwner && !isMe;
        const isDeleting = deletingId === ct.id;

        // 이름: 본인은 authStore profile 우선, 나머지는 조인된 profiles 사용
        const displayName = isMe
          ? (profile?.display_name ?? ct.profiles?.display_name ?? null)
          : ct.profiles?.display_name ?? null;

        const avatarUrl = isMe
          ? (profile?.avatar_url ?? ct.profiles?.avatar_url ?? null)
          : ct.profiles?.avatar_url ?? null;

        const parentRole = isMe
          ? (profile?.parent_role ?? ct.profiles?.parent_role ?? null)
          : ct.profiles?.parent_role ?? null;

        // 이름 표시: "이름(부모역할)" 또는 이름만, 둘 다 없으면 기본값
        const nameLabel = (() => {
          const name = displayName ?? (isMe ? '나' : '양육자');
          const role = parentRole ? PARENT_ROLE_LABEL[parentRole] : null;
          return role ? `${name}(${role})` : name;
        })();

        return (
          <View key={ct.id}>
            {index > 0 && <View style={styles.divider} />}
            <View style={styles.row}>
              {/* 아바타 */}
              <View style={styles.avatarWrap}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatarImage} resizeMode="cover" />
                ) : displayName ? (
                  <View style={[styles.avatarInitial, isMe && styles.avatarInitialMe]}>
                    <Text style={styles.avatarInitialText}>
                      {displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.avatarIcon, isMe && styles.avatarInitialMe]}>
                    <User color={colors.white} size={16} strokeWidth={1.8} />
                  </View>
                )}
              </View>

              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={styles.nameText}>{nameLabel}</Text>
                  <View style={[
                    styles.roleBadge,
                    ct.role === 'owner' && styles.roleBadgeOwner,
                  ]}>
                    <Text style={[
                      styles.roleText,
                      ct.role === 'owner' && styles.roleTextOwner,
                    ]}>
                      {ROLE_LABEL[ct.role] ?? ct.role}
                    </Text>
                  </View>
                </View>
                <Text style={styles.joinedText}>{formatJoinedAt(ct.joined_at)}</Text>
              </View>

              {canDelete && (
                <TouchableOpacity
                  onPress={() => handleDelete(ct)}
                  disabled={isDeleting}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color={colors.error} />
                  ) : (
                    <Trash2 color={colors.error} size={16} strokeWidth={1.8} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.base,
    padding: spacing.cardPadding,
    ...shadows.card,
  },
  cardTitle: {
    ...typography.bodySemiBold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarInitial: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.text.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialMe: {
    backgroundColor: colors.accent,
  },
  avatarInitialText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  avatarIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.text.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  nameText: {
    ...typography.bodySemiBold,
    color: colors.text.primary,
    fontSize: 14,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  roleBadgeOwner: {
    backgroundColor: `${colors.accent}1A`,
  },
  roleText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  roleTextOwner: {
    color: colors.accent,
  },
  joinedText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 36 + spacing.md,
  },
});
