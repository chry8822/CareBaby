<<<<<<< HEAD
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../constants/theme';

const SplashScreen = () => {
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [user, isLoading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg.primary,
  },
});

export default SplashScreen;
=======
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { colors } from '@/design-system/tokens';

async function authenticate(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHardware || !isEnrolled) return true;

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: '아기의 데이터를 보호하고 있어요',
    fallbackLabel: '비밀번호 사용',
    cancelLabel: '취소',
  });

  return result.success;
}

export default function AuthGate() {
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [authFailed, setAuthFailed] = useState(false);

  useEffect(() => {
    const runAuth = async () => {
      const success = await authenticate();
      if (success) {
        router.replace('/(tabs)/home');
      } else {
        setAuthFailed(true);
      }
      setIsAuthenticating(false);
    };

    runAuth();
  }, [router]);

  const handleRetry = async () => {
    setIsAuthenticating(true);
    setAuthFailed(false);
    const success = await authenticate();
    if (success) {
      router.replace('/(tabs)/home');
    } else {
      setAuthFailed(true);
    }
    setIsAuthenticating(false);
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.neutral.bg,
      }}
    >
      {isAuthenticating ? (
        <>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text
            style={{
              marginTop: 16,
              fontSize: 16,
              color: colors.neutral.textSecondary,
            }}
          >
            인증 중...
          </Text>
        </>
      ) : authFailed ? (
        <View style={{ alignItems: 'center', padding: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.neutral.text,
              marginBottom: 8,
            }}
          >
            인증에 실패했어요
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.neutral.textSecondary,
              marginBottom: 24,
              textAlign: 'center',
            }}
          >
            아기 데이터를 보호하기 위해{'\n'}인증이 필요합니다
          </Text>
          <Text
            onPress={handleRetry}
            style={{
              backgroundColor: colors.brand.primary,
              color: '#fff',
              fontWeight: '600',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            다시 시도
          </Text>
        </View>
      ) : null}
    </View>
  );
}
>>>>>>> a88fc5b1eea3bf532c87154847c9ba43940e9b42
