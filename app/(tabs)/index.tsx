import { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
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
      <View style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      </View>
    );
  }

  // 아기 미등록 → 온보딩 유도
  if (!currentBaby) {
    return (
      <View style={styles.safe}>
        <BabySetupPrompt />
      </View>
    );
  }

  const hasTodayRecords = homeData.timeline.length > 0;

  return (
    <View style={styles.safe}>
      {hasTodayRecords ? (
        <HomeDashboard baby={currentBaby} {...homeData} />
      ) : (
        <HomeEmpty baby={currentBaby} />
      )}
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
