import { View, StyleSheet } from 'react-native';
import { Droplets, Moon, Baby, TrendingUp } from 'lucide-react-native';
import { colors, borderRadius } from '../../constants/theme';
import type { RecordType } from '../../types/database';

interface RecordTypeIconProps {
  type: RecordType;
  size?: number;
}

const iconConfig: Record<RecordType, { icon: typeof Droplets; color: string }> = {
  feeding: { icon: Droplets, color: colors.activity.nursing },
  sleep: { icon: Moon, color: colors.activity.sleep },
  diaper: { icon: Baby, color: colors.activity.diaper },
  growth: { icon: TrendingUp, color: colors.activity.growth },
  milestone: { icon: TrendingUp, color: colors.activity.growth },
};

export const RecordTypeIcon = ({ type, size = 20 }: RecordTypeIconProps) => {
  const { icon: Icon, color } = iconConfig[type];

  return (
    <View style={[styles.container, { backgroundColor: color + '20' }]}>
      <Icon color={color} size={size} strokeWidth={1.8} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
