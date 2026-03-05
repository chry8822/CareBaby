import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Share2, Copy, RefreshCw } from 'lucide-react-native';
import { useBabyStore } from '../../stores/babyStore';
import { useUIStore } from '../../stores/uiStore';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';

interface InviteCodeCardProps {
  babyId: string;
}

const formatTimeLeft = (expiresAt: string): string => {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return '만료됨';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}시간 ${m}분 남음`;
};

const isExpired = (expiresAt: string | null): boolean => {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() <= Date.now();
};

export const InviteCodeCard = ({ babyId }: InviteCodeCardProps) => {
  const { caretakers, generateInviteCode, fetchCaretakers } = useBabyStore();
  const { showToast, showModal, hideModal } = useUIStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // 현재 owner의 caretaker 행에서 invite_code 찾기
  const ownerCaretaker = caretakers.find((c) => c.role === 'owner');
  const inviteCode = ownerCaretaker?.invite_code ?? null;
  const inviteExpiresAt = ownerCaretaker?.invite_expires_at ?? null;
  const codeValid = inviteCode && !isExpired(inviteExpiresAt);

  // 남은 시간 1분 단위 갱신
  useEffect(() => {
    if (!inviteExpiresAt || isExpired(inviteExpiresAt)) {
      setTimeLeft('');
      return;
    }
    setTimeLeft(formatTimeLeft(inviteExpiresAt));
    const timer = setInterval(() => {
      if (isExpired(inviteExpiresAt)) {
        setTimeLeft('');
        clearInterval(timer);
      } else {
        setTimeLeft(formatTimeLeft(inviteExpiresAt));
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [inviteExpiresAt]);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      await generateInviteCode(babyId);
      await fetchCaretakers(babyId);
    } catch {
      showModal({
        title: '코드 생성 실패',
        message: '초대 코드를 생성하지 못했어요. 잠시 후 다시 시도해주세요.',
        primaryAction: { label: '확인', onPress: hideModal },
      });
    } finally {
      setIsGenerating(false);
    }
  }, [babyId, generateInviteCode, fetchCaretakers, showModal, hideModal]);

  const handleCopy = useCallback(async () => {
    if (!inviteCode) return;
    try {
      await Clipboard.setStringAsync(inviteCode);
      showToast('코드가 복사됐어요', 'success');
    } catch {
      showToast('복사에 실패했어요', 'error');
    }
  }, [inviteCode, showToast]);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Share2 color={colors.accent} size={18} strokeWidth={1.8} />
        <Text style={styles.cardTitle}>공동 양육자 초대</Text>
      </View>

      {codeValid ? (
        <>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{inviteCode}</Text>
          </View>
          <Text style={styles.expiryText}>24시간 유효 · {timeLeft}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleGenerate}
              disabled={isGenerating}
              activeOpacity={0.8}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <RefreshCw size={14} color={colors.accent} strokeWidth={1.8} />
              )}
              <Text style={styles.buttonTextSecondary}>새 코드 생성</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleCopy}
              activeOpacity={0.8}
            >
              <Copy size={14} color={colors.white} strokeWidth={1.8} />
              <Text style={styles.buttonTextPrimary}>코드 복사</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.emptyText}>
            초대 코드를 생성하면 24시간 동안 공유할 수 있어요.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary, styles.buttonFull]}
            onPress={handleGenerate}
            disabled={isGenerating}
            activeOpacity={0.8}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <RefreshCw size={14} color={colors.white} strokeWidth={1.8} />
            )}
            <Text style={styles.buttonTextPrimary}>새 코드 생성</Text>
          </TouchableOpacity>
        </>
      )}
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.bodySemiBold,
    color: colors.text.primary,
  },
  codeBox: {
    backgroundColor: colors.bg.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeText: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 8,
    color: colors.text.primary,
  },
  expiryText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.sm,
  },
  buttonFull: {
    flex: 0,
    width: '100%',
  },
  buttonPrimary: {
    backgroundColor: colors.accent,
  },
  buttonSecondary: {
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  buttonTextPrimary: {
    ...typography.bodySemiBold,
    color: colors.white,
    fontSize: 14,
  },
  buttonTextSecondary: {
    ...typography.bodySemiBold,
    color: colors.accent,
    fontSize: 14,
  },
});
