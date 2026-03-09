import { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useBabyStore } from '../../stores/babyStore';
import { useHomeData } from '../../hooks/useHomeData';
import { colors } from '../../constants/theme';
import { BabySetupPrompt } from '../../components/home/BabySetupPrompt';
import { HomeEmpty } from '../../components/home/HomeEmpty';
import { HomeDashboard } from '../../components/home/HomeDashboard';
import { QuickRecordSheet } from '../../components/home/QuickRecordSheet';
import type { QuickCategory } from '../../components/home/QuickRecordSheet';

const HomeScreen = () => {
  const { currentBaby, fetchBabies, isLoading: babyLoading } = useBabyStore();
  const homeData = useHomeData(currentBaby?.id ?? null);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<QuickCategory>('feeding');

  const navigating = useRef(false);

  useEffect(() => {
    fetchBabies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 화면이 다시 포커스를 받을 때(= baby-setup에서 돌아올 때) 락 해제
  useFocusEffect(
    useCallback(() => {
      navigating.current = false;
    }, [])
  );

  const handleRegisterPress = useCallback(() => {
    if (navigating.current) return;
    navigating.current = true;
    router.push('/baby-setup');
  }, []);

  const handleQuickAction = useCallback((category: QuickCategory) => {
    setSelectedCategory(category);
    setSheetVisible(true);
  }, []);

  const handleSheetClose = useCallback(() => {
    setSheetVisible(false);
  }, []);

  const handleSaveSuccess = useCallback(() => {
    setSheetVisible(false);
    homeData.refresh();
  }, [homeData]);

  if (babyLoading) {
    return (
      <View style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      </View>
    );
  }

  if (!currentBaby) {
    return (
      <View style={styles.safe}>
        <BabySetupPrompt onRegisterPress={handleRegisterPress} />
      </View>
    );
  }

  const hasTodayRecords = homeData.timeline.length > 0;

  return (
    <View style={styles.safe}>
      {hasTodayRecords ? (
        <HomeDashboard
          baby={currentBaby}
          {...homeData}
          onQuickAction={handleQuickAction}
        />
      ) : (
        <HomeEmpty
          baby={currentBaby}
          onQuickAction={handleQuickAction}
        />
      )}

      {/* 빠른기록 바텀시트 */}
      <QuickRecordSheet
        visible={sheetVisible}
        onClose={handleSheetClose}
        initialCategory={selectedCategory}
        onSaveSuccess={handleSaveSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;
