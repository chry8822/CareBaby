import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { Cookie, Moon, Droplets } from 'lucide-react-native';
import { colors, spacing, borderRadius, fontSize } from '@/design-system/tokens';

type TrackingCategory = 'feeding' | 'sleep' | 'diaper';

interface TrackingInputProps {
  selected: TrackingCategory;
  onSelect: (category: TrackingCategory) => void;
}

const CATEGORIES: { key: TrackingCategory; label: string; color: string }[] = [
  { key: 'feeding', label: '수유', color: colors.chart.feeding },
  { key: 'sleep', label: '수면', color: colors.chart.sleep },
  { key: 'diaper', label: '기저귀', color: colors.chart.diaper },
];

export function TrackingInput({ selected, onSelect }: TrackingInputProps) {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 20,
      onPanResponderRelease: (_, gestureState) => {
        const currentIndex = CATEGORIES.findIndex((c) => c.key === selected);
        if (gestureState.dx > 50 && currentIndex > 0) {
          onSelect(CATEGORIES[currentIndex - 1].key);
        } else if (
          gestureState.dx < -50 &&
          currentIndex < CATEGORIES.length - 1
        ) {
          onSelect(CATEGORIES[currentIndex + 1].key);
        }
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx * 0.3);
      },
    })
  ).current;

  const getIcon = (key: TrackingCategory, color: string) => {
    switch (key) {
      case 'feeding':
        return <Cookie size={24} color={color} />;
      case 'sleep':
        return <Moon size={24} color={color} />;
      case 'diaper':
        return <Droplets size={24} color={color} />;
    }
  };

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{ transform: [{ translateX }] }}
    >
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            onPress={() => onSelect(cat.key)}
            style={{
              flex: 1,
              alignItems: 'center',
              gap: spacing.xs,
              paddingVertical: spacing.md,
              borderRadius: borderRadius.lg,
              backgroundColor:
                selected === cat.key ? cat.color + '20' : colors.neutral.card,
              borderWidth: selected === cat.key ? 2 : 1,
              borderColor: selected === cat.key ? cat.color : colors.neutral.border,
            }}
          >
            {getIcon(cat.key, selected === cat.key ? cat.color : colors.neutral.textMuted)}
            <Text
              style={{
                fontSize: fontSize.sm,
                fontWeight: '600',
                color: selected === cat.key ? cat.color : colors.neutral.textMuted,
              }}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}
