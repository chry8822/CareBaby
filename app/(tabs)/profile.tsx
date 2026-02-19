import React from 'react';
import { View, Text } from 'react-native';
import { SafeView } from '@/shared/components/SafeView';
import { colors, typography } from '@/design-system/tokens';

export default function ProfileScreen() {
  return (
    <SafeView edges={['top', 'left', 'right']}>
      <View style={{ padding: 20 }}>
        <Text
          style={{
            fontSize: typography.h1.size,
            fontWeight: typography.h1.weight,
            color: colors.neutral.text,
          }}
        >
          프로필
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontSize: typography.body.size,
            color: colors.neutral.textSecondary,
          }}
        >
          아기 정보, 돌봄이, 알림·일일 목표·앱 설정 (Phase 4)
        </Text>
      </View>
    </SafeView>
  );
}
