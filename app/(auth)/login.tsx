import { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { GoogleIcon, AppleIcon } from '../../components/ui/SocialIcons';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signInWithEmail, isLoading } = useAuthStore();
  const { showModal, hideModal } = useUIStore();

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showModal({
        title: '입력 오류',
        message: '이메일과 비밀번호를 모두 입력해주세요.',
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
    try {
      await signInWithEmail(email.trim(), password);
    } catch (err) {
      const message = err instanceof Error ? err.message : '로그인에 실패했습니다.';
      showModal({
        title: '로그인 실패',
        message,
        primaryAction: { label: '확인', onPress: hideModal },
      });
    }
  };

  const handleGoogleLogin = () => {
    showModal({
      title: '준비 중',
      message: 'Google 로그인은 곧 지원됩니다.',
      primaryAction: { label: '확인', onPress: hideModal },
    });
  };

  const handleAppleLogin = () => {
    showModal({
      title: '준비 중',
      message: 'Apple 로그인은 곧 지원됩니다.',
      primaryAction: { label: '확인', onPress: hideModal },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} bounces={false}>
          {/* 로고 영역 */}
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Image source={require('../../assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.appName}>CareBaby</Text>
            <Text style={styles.tagline}>사랑스러운 육아 기록의 시작</Text>
          </View>

          {/* 폼 영역 */}
          <View style={styles.form}>
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
                placeholder="비밀번호"
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
                {showPassword ? <EyeOff color={colors.text.secondary} size={18} /> : <Eye color={colors.text.secondary} size={18} />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryButtonText}>로그인</Text>}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>또는</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin} activeOpacity={0.85}>
              <GoogleIcon size={20} />
              <Text style={styles.socialButtonText}>Google로 계속하기</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} onPress={handleAppleLogin} activeOpacity={0.85}>
              <AppleIcon size={20} color={colors.text.primary} />
              <Text style={styles.socialButtonText}>Apple로 계속하기</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>계정이 없으신가요? </Text>
            <Link href={'/(auth)/signup' as never} asChild>
              <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}>
                <Text style={styles.footerLink}>회원가입</Text>
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
  logoSection: {
    alignItems: 'center',
    marginBottom: 44,
    paddingTop: spacing.lg,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.accent}18`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  appName: {
    ...typography.display,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  tagline: {
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.base,
    height: 54,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  socialButtonText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
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

export default LoginScreen;
