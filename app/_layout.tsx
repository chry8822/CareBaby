import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { useRecordStore } from '../stores/recordStore';
import { isSupabaseConfigured } from '../lib/supabase';
import { colors } from '../constants/theme';
import { AppModal } from '../components/ui/AppModal';
import { Toast } from '../components/ui/Toast';

const RootLayout = () => {
  const segments = useSegments();
  const rootState = useRootNavigationState();
  const { user, isInitialized, initialize } = useAuthStore();
  const { modal, hideModal, toast, hideToast } = useUIStore();
  const { loadPending, syncPending } = useRecordStore();

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, []);

  useEffect(() => {
    loadPending().then(() => syncPending());
  }, []);

  useEffect(() => {
    // 내비게이터가 마운트되기 전에는 라우팅하지 않음
    if (!rootState?.key) return;
    // 초기 세션 확인이 완료되기 전에는 라우팅하지 않음
    // (isLoading은 API 진행 중 UI 전용이므로 여기서 체크하지 않음)
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isSupabaseConfigured) {
      if (!inAuthGroup) router.replace('/(auth)/login');
      return;
    }

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isInitialized, segments, rootState?.key]);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      {/* top safe area를 루트에서 한 번만 처리한다.
          각 탭/인증 스크린이 개별로 SafeAreaView edges={['top']}을 쓰면
          탭 스크린이 처음 마운트될 때 paddingTop이 0→실제값으로 갱신되면서
          화면 전체 콘텐츠가 아래로 밀리는 쉬프팅이 발생한다.
          루트에서 한 번 처리하면 앱 시작 시 딱 한 번 안정화된다. */}
      <SafeAreaView style={styles.root} edges={['top']}>
        <StatusBar style="dark" backgroundColor={colors.bg.primary} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="index" />
        </Stack>

        <AppModal
          visible={modal.visible}
          title={modal.title}
          message={modal.message}
          primaryAction={modal.primaryAction}
          secondaryAction={modal.secondaryAction}
          onClose={hideModal}
          closeOnBackdrop
        />

        <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default RootLayout;
