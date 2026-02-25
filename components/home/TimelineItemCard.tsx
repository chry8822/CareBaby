import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Droplets, Moon, Wind } from 'lucide-react-native';
import type { TimelineItem } from '../../hooks/useHomeData';
import {
  colors,
  typography,
  spacing,
  borderRadius,
} from '../../constants/theme';
import { formatTime, formatDuration } from '../../lib/timeUtils';

interface TimelineItemCardProps {
  item: TimelineItem;
  onPress?: () => void;
}

const FEEDING_TYPE_LABELS: Record<string, string> = {
  breast_left: '모유(좌)',
  breast_right: '모유(우)',
  pumped: '유축',
  formula: '분유',
};

const SLEEP_TYPE_LABELS: Record<string, string> = {
  nap: '낮잠',
  night: '밤잠',
};

const DIAPER_TYPE_LABELS: Record<string, string> = {
  wet: '소변',
  dirty: '대변',
  both: '소+대변',
};

export const TimelineItemCard = ({ item, onPress }: TimelineItemCardProps) => {
  const renderContent = () => {
    switch (item.type) {
      case 'feeding': {
        const typeLabel = FEEDING_TYPE_LABELS[item.data.feeding_type] ?? item.data.feeding_type;
        const duration = item.data.duration_seconds
          ? formatDuration(item.data.duration_seconds)
          : null;
        return (
          <>
            <View style={[styles.dot, { backgroundColor: colors.activity.nursing }]} />
            <View style={styles.iconWrapper}>
              <Droplets size={16} color={colors.activity.nursing} strokeWidth={1.8} />
            </View>
            <View style={styles.textGroup}>
              <Text style={styles.mainText}>수유 · {typeLabel}</Text>
              {duration && <Text style={styles.subText}>{duration}</Text>}
            </View>
          </>
        );
      }
      case 'sleep': {
        const typeLabel = SLEEP_TYPE_LABELS[item.data.sleep_type] ?? item.data.sleep_type;
        const duration = item.data.duration_seconds
          ? formatDuration(item.data.duration_seconds)
          : null;
        return (
          <>
            <View style={[styles.dot, { backgroundColor: colors.activity.sleep }]} />
            <View style={styles.iconWrapper}>
              <Moon size={16} color={colors.activity.sleep} strokeWidth={1.8} />
            </View>
            <View style={styles.textGroup}>
              <Text style={styles.mainText}>수면 · {typeLabel}</Text>
              {duration && <Text style={styles.subText}>{duration}</Text>}
            </View>
          </>
        );
      }
      case 'diaper': {
        const typeLabel = DIAPER_TYPE_LABELS[item.data.diaper_type] ?? item.data.diaper_type;
        return (
          <>
            <View style={[styles.dot, { backgroundColor: colors.activity.diaper }]} />
            <View style={styles.iconWrapper}>
              <Wind size={16} color={colors.activity.diaper} strokeWidth={1.8} />
            </View>
            <View style={styles.textGroup}>
              <Text style={styles.mainText}>기저귀 · {typeLabel}</Text>
            </View>
          </>
        );
      }
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.row}>{renderContent()}</View>
      <Text style={styles.timeText}>{formatTime(item.time)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  iconWrapper: {
    marginRight: spacing.sm,
  },
  textGroup: {
    flex: 1,
  },
  mainText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
  subText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  timeText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
});
