import { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ClipboardPaste } from 'lucide-react-native';
import { useBabyStore } from '../../stores/babyStore';
import { useUIStore } from '../../stores/uiStore';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';

const CODE_LENGTH = 6;

export const JoinByCodeForm = () => {
  const { joinByInviteCode, fetchBabies } = useBabyStore();
  const { showToast, showModal, hideModal } = useUIStore();

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isJoining, setIsJoining] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChangeText = async (text: string, index: number) => {
    const char = text.toUpperCase().slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // 6자리 완성 시 자동 제출
    if (char && index === CODE_LENGTH - 1) {
      const code = [...newDigits.slice(0, CODE_LENGTH - 1), char].join('');
      if (code.length === CODE_LENGTH) {
        Keyboard.dismiss();
        await submitCode(code);
      }
    }
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const submitCode = async (code: string) => {
    setIsJoining(true);
    try {
      const result = await joinByInviteCode(code);
      if (result.success) {
        await fetchBabies();
        showToast('공동 양육자로 등록됐어요', 'success');
        setDigits(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      } else {
        showModal({
          title: '코드가 올바르지 않아요',
          message: '코드를 다시 확인하거나 새 코드를 요청해보세요.',
          primaryAction: { label: '확인', onPress: hideModal },
        });
        setDigits(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch {
      showModal({
        title: '참여 실패',
        message: '초대 코드가 만료됐거나 올바르지 않아요.',
        primaryAction: { label: '확인', onPress: hideModal },
      });
      setDigits(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsJoining(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH);
      if (!cleaned) return;

      const newDigits = Array(CODE_LENGTH).fill('');
      cleaned.split('').forEach((char, i) => {
        newDigits[i] = char;
      });
      setDigits(newDigits);

      Keyboard.dismiss();
    } catch {
      showToast('클립보드를 읽을 수 없어요', 'error');
    }
  };

  const handleSubmitPress = async () => {
    const code = digits.join('');
    if (code.length < CODE_LENGTH) return;
    Keyboard.dismiss();
    await submitCode(code);
  };

  const isFilled = digits.every((d) => d.length > 0);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>초대 코드 입력</Text>
      <Text style={styles.cardSubtitle}>공동 양육자에게 받은 6자리 코드를 입력해주세요.</Text>

      {/* 6칸 코드 입력 */}
      <View style={styles.codeRow}>
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[styles.digitInput, digit && styles.digitInputFilled]}
            value={digit}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            maxLength={2}
            autoCapitalize="characters"
            keyboardType="default"
            returnKeyType={index === CODE_LENGTH - 1 ? 'done' : 'next'}
            selectTextOnFocus
            editable={!isJoining}
          />
        ))}
      </View>

      {/* 클립보드 붙여넣기 버튼 */}
      <TouchableOpacity
        style={styles.pasteButton}
        onPress={handlePasteFromClipboard}
        disabled={isJoining}
        activeOpacity={0.7}
      >
        <ClipboardPaste size={14} color={colors.accent} strokeWidth={1.8} />
        <Text style={styles.pasteButtonText}>복사한 코드 붙여넣기</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.submitButton, (!isFilled || isJoining) && styles.submitButtonDisabled]}
        onPress={handleSubmitPress}
        disabled={!isFilled || isJoining}
        activeOpacity={0.8}
      >
        {isJoining ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Text style={styles.submitButtonText}>참여하기</Text>
        )}
      </TouchableOpacity>
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
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  codeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    justifyContent: 'center',
  },
  digitInput: {
    width: 44,
    height: 52,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bg.primary,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  digitInputFilled: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}0D`,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  pasteButtonText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.border,
  },
  submitButtonText: {
    ...typography.bodySemiBold,
    color: colors.white,
  },
});
