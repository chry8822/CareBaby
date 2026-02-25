import { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBabyStore } from '../../stores/babyStore';
import { useHomeData } from '../../hooks/useHomeData';
import { colors } from '../../constants/theme';
import { BabySetupPrompt } from '../../components/home/BabySetupPrompt';
import { HomeEmpty } from '../../components/home/HomeEmpty';
import { HomeDashboard } from '../../components/home/HomeDashboard';

const HomeScreen = () => {
  const { currentBaby, fetchBabies, isLoading: babyLoading } = useBabyStore();
  const homeData = useHomeData(currentBaby?.id ?? null);

  useEffect(() => {
    fetchBabies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 아기 정보 로딩 중
  if (babyLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  // 아기 미등록 → 온보딩 유도
  if (!currentBaby) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <BabySetupPrompt />
      </SafeAreaView>
    );
  }

  const hasTodayRecords = homeData.timeline.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {hasTodayRecords ? (
        <HomeDashboard baby={currentBaby} {...homeData} />
      ) : (
        <HomeEmpty baby={currentBaby} />
      )}
    </SafeAreaView>
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
