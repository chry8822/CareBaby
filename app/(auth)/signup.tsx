import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';

const SignupScreen = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signUpWithEmail, isLoading } = useAuthStore();
  const { showModal, hideModal } = useUIStore();

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSignup = async () => {
    if (!displayName.trim() || !email.trim() || !password.trim()) {
      showModal({
        title: '입력 오류',
        message: '모든 필드를 입력해주세요.',
        primaryAction: { label: '확인', onPress: hideModal },
      });
      return;
    }
    if (!isValidEmail(email.trim())) {
      showModal({
        title: '입력 오류',
        message: '올바른 이메일 형식을 입력해주세요.',
        primaryAction: { label: '확인', onPress: hideModal },
      });
      return;
    }
    if (password !== confirmPassword) {
      showModal({
        title: '입력 오류',
        message: '비밀번호가 일치하지 않습니다.',
        primaryAction: { label: '확인', onPress: hideModal },
      });
      return;
    }
    if (password.length < 8) {
      showModal({
        title: '입력 오류',
        message: '비밀번호는 최소 8자 이상이어야 합니다.',
        primaryAction: { label: '확인', onPress: hideModal },
      });
      return;
    }

    try {
      await signUpWithEmail(email.trim(), password, displayName.trim());
      showModal({
        title: '가입 완료',
        message: '회원가입이 완료되었습니다!\n이메일을 확인해주세요.',
        primaryAction: {
          label: '로그인하러 가기',
          onPress: () => {
            hideModal();
            router.replace('/(auth)/login');
          },
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : '회원가입에 실패했습니다.';
      showModal({
        title: '회원가입 실패',
        message,
        primaryAction: { label: '확인', onPress: hideModal },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>회원가입</Text>
            <Text style={styles.subtitle}>CareBaby와 함께 육아를 시작해보세요</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <User color={colors.text.secondary} size={18} />
              <TextInput
                style={styles.input}
                placeholder="이름 (닉네임)"
                placeholderTextColor={colors.text.secondary}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Mail color={colors.text.secondary} size={18} />
              <TextInput
                style={styles.input}
                placeholder="이메일"
                placeholderTextColor={colors.text.secondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Lock color={colors.text.secondary} size={18} />
              <TextInput
                style={styles.input}
                placeholder="비밀번호 (8자 이상)"
                placeholderTextColor={colors.text.secondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.eyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff color={colors.text.secondary} size={18} />
                ) : (
                  <Eye color={colors.text.secondary} size={18} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Lock color={colors.text.secondary} size={18} />
              <TextInput
                style={styles.input}
                placeholder="비밀번호 확인"
                placeholderTextColor={colors.text.secondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>가입하기</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>이미 계정이 있으신가요? </Text>
            <Link href={"/(auth)/login" as never} asChild>
              <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}>
                <Text style={styles.footerLink}>로그인</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.sectionGap,
    paddingTop: spacing.sm,
  },
  title: {
    ...typography.display,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  form: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing.xl,
    height: 54,
    gap: spacing.sm,
    ...shadows.card,
  },
  input: {
    flex: 1,
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
  eyeButton: {
    padding: spacing.xs,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.base,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadows.card,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    ...typography.bodySemiBold,
    color: colors.white,
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: spacing.xl,
  },
  footerText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  footerLink: {
    ...typography.bodySemiBold,
    color: colors.accent,
  },
});

export default SignupScreen;
