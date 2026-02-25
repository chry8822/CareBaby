import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
  const { user, isLoading, initialize } = useAuthStore();
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
    if (isLoading) return;

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
  }, [user, isLoading, segments, rootState?.key]);

  return (
    <View style={styles.root}>
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

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default RootLayout;
