import { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, StyleSheet, type ViewStyle, type ImageStyle } from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';

// React 19 타입 변경으로 Animated 컴포넌트에 style/children 이 없다고 인식되는 문제 우회
type AnyStyle = ViewStyle | ImageStyle | (ViewStyle | ImageStyle | object)[];
const AnimatedView  = Animated.View  as unknown as React.ComponentType<{ style?: AnyStyle }>;
const AnimatedImage = Animated.Image as unknown as React.ComponentType<{
  source: ReturnType<typeof require>;
  style?: AnyStyle;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
}>;

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen = ({ message = '불러오는 중...' }: LoadingScreenProps) => {
  const tilt = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(tilt, { toValue: 1,  duration: 400, useNativeDriver: true }),
        Animated.timing(tilt, { toValue: -1, duration: 400, useNativeDriver: true }),
        Animated.timing(tilt, { toValue: 0,  duration: 300, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [tilt]);

  const rotate = tilt.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-18deg', '0deg', '18deg'],
  });

  return (
    <View style={styles.container}>
      <AnimatedImage
        source={require('../../assets/images/baby-profile-default.png')}
        style={[styles.image, { transform: [{ rotate }] }]}
        resizeMode="contain"
      />
      <Text style={styles.message}>{message}</Text>
      <View style={styles.dots}>
        <DotPulse delay={0} />
        <DotPulse delay={160} />
        <DotPulse delay={320} />
      </View>
    </View>
  );
};

const DotPulse = ({ delay }: { delay: number }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1,   duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 300, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity, delay]);

  return <AnimatedView style={[styles.dot, { opacity } as ViewStyle]} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.primary,
  },
  image: {
    width: 100,
    height: 100,
  },
  message: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
});
