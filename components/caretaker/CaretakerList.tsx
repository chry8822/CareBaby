import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { User, Trash2 } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useBabyStore } from '../../stores/babyStore';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import { useState } from 'react';
import type { Caretaker } from '../../types/database';

const ROLE_LABEL: Record<string, string> = {
  owner: '방장',
  caretaker: '양육자',
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
  const { user } = useAuthStore();
  const { showModal, hideModal, showToast } = useUIStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const myCaretaker = caretakers.find((c) => c.profile_id === user?.id);
  const isOwner = myCaretaker?.role === 'owner';

  const handleDelete = (target: Caretaker) => {
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

        return (
          <View key={ct.id}>
            {index > 0 && <View style={styles.divider} />}
            <View style={styles.row}>
              <View style={styles.avatar}>
                <User color={colors.white} size={16} strokeWidth={1.8} />
              </View>
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={styles.nameText}>
                    {isMe ? '나' : '양육자'}
                  </Text>
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
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
