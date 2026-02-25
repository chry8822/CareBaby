import { Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

interface TimerDisplayProps {
  seconds: number;
  size?: 'large' | 'medium';
}

const pad = (n: number): string => String(n).padStart(2, '0');

export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
};

export const TimerDisplay = ({ seconds, size = 'large' }: TimerDisplayProps) => (
  <Text style={size === 'large' ? styles.large : styles.medium}>
    {formatDuration(seconds)}
  </Text>
);

const styles = StyleSheet.create({
  large: {
    fontSize: 52,
    fontWeight: '200',
    color: colors.text.primary,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  medium: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.text.primary,
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
});
