import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../constants/theme';

const SplashScreen = () => {
  const { user, isInitialized } = useAuthStore();

  useEffect(() => {
    // 초기 세션 확인이 완료되기 전까지 스플래시 표시
    if (!isInitialized) return;

    if (user) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [user, isInitialized]);

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
