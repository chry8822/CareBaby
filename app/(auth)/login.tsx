import { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, X, Check } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { GoogleIcon, AppleIcon } from '../../components/ui/SocialIcons';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import { getAuthErrorMessage } from '../../lib/authErrors';
import { getSavedEmail, setSavedEmail, clearSavedEmail, getRememberMe, setRememberMe } from '../../lib/loginPrefs';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveId, setSaveId] = useState(false);
  const [rememberMe, setRememberMeState] = useState(true);
  const { signInWithEmail, isLoading } = useAuthStore();
  const { showModal, hideModal } = useUIStore();

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  useEffect(() => {
    const loadPrefs = async () => {
      const saved = await getSavedEmail();
      const remember = await getRememberMe();
      if (saved) {
        setEmail(saved);
        setSaveId(true);
      }
      setRememberMeState(remember);
    };
    loadPrefs();
  }, []);

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

      // 아이디 저장
      if (saveId) {
        await setSavedEmail(email.trim());
      } else {
        await clearSavedEmail();
      }
      // 로그인 유지 설정 저장
      await setRememberMe(rememberMe);

      router.replace('/(tabs)');
    } catch (err) {
      const message = getAuthErrorMessage(err, '로그인에 실패했습니다.');
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
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
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
            {/* 이메일 인풋 */}
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
              {email.length > 0 && (
                <TouchableOpacity onPress={() => setEmail('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <X color={colors.text.secondary} size={16} />
                </TouchableOpacity>
              )}
            </View>

            {/* 비밀번호 인풋 */}
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
              {password.length > 0 && (
                <TouchableOpacity onPress={() => setPassword('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.iconButton}>
                  <X color={colors.text.secondary} size={16} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.iconButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? <EyeOff color={colors.text.secondary} size={18} /> : <Eye color={colors.text.secondary} size={18} />}
              </TouchableOpacity>
            </View>

            {/* 체크박스 영역 */}
            <View style={styles.checkboxRow}>
              <TouchableOpacity style={styles.checkboxItem} onPress={() => setSaveId((v) => !v)} activeOpacity={0.7}>
                <View style={[styles.checkbox, saveId && styles.checkboxChecked]}>
                  {saveId && <Check color={colors.white} size={12} strokeWidth={3} />}
                </View>
                <Text style={styles.checkboxLabel}>아이디 저장</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.checkboxItem} onPress={() => setRememberMeState((v) => !v)} activeOpacity={0.7}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Check color={colors.white} size={12} strokeWidth={3} />}
                </View>
                <Text style={styles.checkboxLabel}>로그인 유지</Text>
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
  iconButton: {
    padding: spacing.xs,
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    paddingHorizontal: spacing.xs,
    marginTop: -spacing.xs,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bg.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkboxLabel: {
    ...typography.bodyRegular,
    fontSize: 14,
    color: colors.text.secondary,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.base,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
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
