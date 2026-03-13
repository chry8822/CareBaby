import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import { ChevronDown } from 'lucide-react-native';
import type { Baby } from '../../types/database';
import { colors, typography, spacing } from '../../constants/theme';
import { getDaysSinceBirth, getGreeting, getTimeOfDay } from '../../lib/timeUtils';
import { BabyAvatar } from './BabyAvatar';
import { BabySwitcherSheet } from '../ui/BabySwitcherSheet';

const GREETING_ANIMATIONS = {
  morning: require('../../assets/lottie/greeting-morning.json'),
  afternoon: require('../../assets/lottie/greeting-afternoon.json'),
  evening: require('../../assets/lottie/greeting-evening.json'),
  night: require('../../assets/lottie/greeting-night.json'),
} as const;

interface HomeHeaderProps {
  baby: Baby;
  babies: Baby[];
  onSwitchBaby: (baby: Baby) => void;
}

export const HomeHeader = ({ baby, babies, onSwitchBaby }: HomeHeaderProps) => {
  const greeting = getGreeting();
  const timeOfDay = getTimeOfDay();
  const daysSince = getDaysSinceBirth(baby.birth_date);
  const [switcherVisible, setSwitcherVisible] = useState(false);
  const canSwitch = babies.length > 1;

  return (
    <>
      <View style={styles.header}>
        {/* 왼쪽: 아기 사진 */}
        <BabyAvatar
          uri={baby.avatar_url}
          size={52}
          onPress={() => router.push('/baby-setup?mode=edit')}
        />

        {/* 가운데: 아기 이름 + 생후 일수 */}
        <TouchableOpacity
          style={styles.babyInfo}
          onPress={() => canSwitch && setSwitcherVisible(true)}
          activeOpacity={canSwitch ? 0.7 : 1}
        >
          <View style={styles.babyNameRow}>
            <Text style={styles.babyName}>{baby.name}</Text>
            {canSwitch && (
              <ChevronDown size={14} color={colors.text.secondary} strokeWidth={2} />
            )}
          </View>
          <Text style={styles.daysText}>D+ {daysSince}일</Text>
        </TouchableOpacity>

        {/* 오른쪽: Lottie + 인사말 */}
        <View style={styles.greetingRow}>
          <Text style={styles.greetingText}>{greeting}</Text>
          <LottieView
            source={GREETING_ANIMATIONS[timeOfDay]}
            autoPlay
            loop
            style={[
              styles.greetingLottie,
              timeOfDay === 'night' && styles.greetingLottieNight,
            ]}
          />
        </View>
      </View>

      {canSwitch && (
        <BabySwitcherSheet
          visible={switcherVisible}
          onClose={() => setSwitcherVisible(false)}
          babies={babies}
          currentBaby={baby}
          onSelect={(b) => {
            onSwitchBaby(b);
            setSwitcherVisible(false);
          }}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 1,
    flex: 1,
  },
  greetingLottie: {
    width: 50,
    height: 50,
  },
  greetingLottieNight: {
    width: 40,
    height: 40,
  },
  greetingText: {
    ...typography.caption,
    color: colors.text.secondary,
    flexShrink: 1,
    fontWeight: 'bold',
  },
  babyInfo: {
    marginLeft: 5,
    alignItems: 'center',
  },
  babyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  babyName: {
    ...typography.display,
    color: colors.text.primary,
  },
  daysText: {
    ...typography.bodySemiBold,
    color: colors.accent,
    marginTop: 2,
  },
});
