import { Tabs } from 'expo-router';
import type { ViewStyle, TextStyle } from 'react-native';
import { Home, PlusCircle, BarChart2, Settings } from 'lucide-react-native';
import { colors, layout } from '../../constants/theme';

const tabBarStyle: ViewStyle = {
  backgroundColor: colors.white,
  borderTopColor: colors.border,
  borderTopWidth: 1,
  height: layout.tabBarHeight + 30,
  paddingBottom: 20,
  paddingTop: 10,
};

const tabBarLabelStyle: TextStyle = {
  fontSize: 11,
  fontWeight: '500',
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
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Home color={color} size={size} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: '기록',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <PlusCircle color={color} size={size} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: '통계',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <BarChart2 color={color} size={size} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Settings color={color} size={size} strokeWidth={1.8} />,
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
