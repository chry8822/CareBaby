import { Tabs } from 'expo-router';
import type { ViewStyle, TextStyle } from 'react-native';
import { Home, PlusCircle, BarChart2, Settings } from 'lucide-react-native';
import { colors } from '../../constants/theme';

const tabBarLabelStyle: TextStyle = {
  fontSize: 11,
  fontWeight: '500',
};

// 탭 바 스타일을 컴포넌트 외부 상수로 정의.
// 이전에는 useSafeAreaInsets()로 height를 동적 계산했는데,
// initialWindowMetrics가 null(Expo Go 등)이면 insets.bottom이 0→실제값으로 변경되어
// 탭 바 height가 바뀌고 콘텐츠 영역 높이가 재계산되면서 레이아웃 쉬프팅이 발생했다.
// height/paddingBottom을 직접 지정하지 않으면 @react-navigation/bottom-tabs가
// 내부에서 useSafeAreaInsets()로 올바르게 safe area를 처리한다.
const tabBarStyle: ViewStyle = {
  backgroundColor: colors.white,
  borderTopColor: colors.border,
  borderTopWidth: 1,
};

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle,
        tabBarLabelStyle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Home color={color} size={size} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: '기록',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <PlusCircle color={color} size={size} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: '통계',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <BarChart2 color={color} size={size} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Settings color={color} size={size} strokeWidth={1.8} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
