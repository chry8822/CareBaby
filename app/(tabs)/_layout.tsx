<<<<<<< HEAD
import { Tabs } from 'expo-router';
import type { ViewStyle, TextStyle } from 'react-native';
import { Home, PlusCircle, BarChart2, Settings } from 'lucide-react-native';
import { colors, layout } from '../../constants/theme';

const tabBarStyle: ViewStyle = {
  backgroundColor: colors.white,
  borderTopColor: colors.border,
  borderTopWidth: 1,
  height: layout.tabBarHeight,
  paddingBottom: 20,
  paddingTop: 10,
};

const tabBarLabelStyle: TextStyle = {
  fontSize: 11,
  fontWeight: '500',
};

const TabsLayout = () => {
=======
import React from 'react';
import { View, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, PenLine, BarChart3, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typo } from '@/design-system/tokens';

function TabIcon({ focused, color, label, icon }: { focused: boolean; color: string; label: string; icon: React.ReactNode }) {
  return (
    <View style={{ alignItems: 'center', gap: 2, minWidth: 56 }}>
      {icon}
      <Text
        style={{
          fontSize: typo.tiny.size,
          lineHeight: typo.tiny.lineHeight,
          color,
          fontWeight: focused ? '600' : '500',
        }}
      >
        {label}
      </Text>
      <View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.brand.primary,
          opacity: focused ? 1 : 0,
        }}
      />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
>>>>>>> a88fc5b1eea3bf532c87154847c9ba43940e9b42
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
<<<<<<< HEAD
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
=======
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: colors.neutral.textMuted,
        tabBarStyle: {
          backgroundColor: colors.neutral.white,
          borderTopColor: colors.neutral.border,
          borderTopWidth: 1,
          paddingBottom: Math.max(8, insets.bottom),
          paddingTop: 12,
          height: 80 + insets.bottom,
        },
        tabBarLabelStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: '홈',
          tabBarIcon: ({ color, focused }) => <TabIcon focused={focused} color={color} label="홈" icon={<Home size={24} color={color} />} />,
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          title: '기록',
          tabBarIcon: ({ color, focused }) => <TabIcon focused={focused} color={color} label="기록" icon={<PenLine size={24} color={color} />} />,
>>>>>>> a88fc5b1eea3bf532c87154847c9ba43940e9b42
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: '통계',
<<<<<<< HEAD
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
=======
          tabBarIcon: ({ color, focused }) => <TabIcon focused={focused} color={color} label="통계" icon={<BarChart3 size={24} color={color} />} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '프로필',
          tabBarIcon: ({ color, focused }) => <TabIcon focused={focused} color={color} label="설정" icon={<User size={24} color={color} />} />,
>>>>>>> a88fc5b1eea3bf532c87154847c9ba43940e9b42
        }}
      />
    </Tabs>
  );
<<<<<<< HEAD
};

export default TabsLayout;
=======
}
>>>>>>> a88fc5b1eea3bf532c87154847c9ba43940e9b42
