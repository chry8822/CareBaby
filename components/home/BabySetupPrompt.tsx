import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../constants/theme';

export const BabySetupPrompt = () => {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/images/onboarding-baby.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>아기 정보를 등록해주세요</Text>
      <Text style={styles.subtitle}>소중한 아기의 성장을 함께 기록해요</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(tabs)/settings')}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>아기 등록하기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxl * 2,
  },
  imageContainer: {
    width: 200,
    height: 200,
    backgroundColor: colors.border,
    borderRadius: borderRadius.card,
    marginBottom: spacing.xxl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.full,
    ...shadows.card,
  },
  buttonText: {
    ...typography.bodySemiBold,
    color: colors.white,
  },
});
