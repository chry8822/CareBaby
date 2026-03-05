import { useState, useCallback, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useBabyStore } from '../../stores/babyStore';
import { useHomeData } from '../../hooks/useHomeData';
import { colors, layout, shadows } from '../../constants/theme';
import { BabySetupPrompt } from '../../components/home/BabySetupPrompt';
import { HomeEmpty } from '../../components/home/HomeEmpty';
import { HomeDashboard } from '../../components/home/HomeDashboard';
import { QuickRecordSheet } from '../../components/home/QuickRecordSheet';

type QuickCategory = 'feeding' | 'sleep' | 'diaper';

const HomeScreen = () => {
  const { currentBaby, fetchBabies, isLoading: babyLoading } = useBabyStore();
  const homeData = useHomeData(currentBaby?.id ?? null);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<QuickCategory>('feeding');
  const navLock = useRef(false);

  useEffect(() => {
    fetchBabies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <BabySetupPrompt onRegisterPress={() => {
          if (navLock.current) return;
          navLock.current = true;
          router.push('/baby-setup');
          setTimeout(() => { navLock.current = false; }, 600);
        }} />
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

      {/* 플로팅 액션 버튼 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setSelectedCategory('feeding');
          setSheetVisible(true);
        }}
        activeOpacity={0.85}
      >
        <Plus color={colors.white} size={24} strokeWidth={2.5} />
      </TouchableOpacity>

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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: layout.tabBarHeight + 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.elevated,
  },
});

export default HomeScreen;
