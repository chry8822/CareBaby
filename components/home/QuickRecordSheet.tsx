import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomSheet } from '../ui/BottomSheet';
import { FeedingForm } from '../records/FeedingForm';
import { SleepForm } from '../records/SleepForm';
import { DiaperForm } from '../records/DiaperForm';
import { MealForm } from '../records/MealForm';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

export type QuickCategory = 'feeding' | 'meal' | 'sleep' | 'diaper';

interface QuickRecordSheetProps {
  visible: boolean;
  onClose: () => void;
  initialCategory?: QuickCategory;
  onSaveSuccess?: () => void;
}

const CATEGORIES: { key: QuickCategory; label: string; color: string }[] = [
  { key: 'feeding', label: '수유', color: colors.activity.nursing },
  { key: 'meal', label: '이유식', color: colors.activity.meal },
  { key: 'sleep', label: '수면', color: colors.activity.sleep },
  { key: 'diaper', label: '기저귀', color: colors.activity.diaper },
];

export const QuickRecordSheet = ({
  visible,
  onClose,
  initialCategory = 'feeding',
  onSaveSuccess,
}: QuickRecordSheetProps) => {
  const [activeCategory, setActiveCategory] = useState<QuickCategory>(initialCategory);
  const prevVisible = useRef(false);

  // visible이 false → true로 전환될 때만 initialCategory 반영
  // 렌더마다 실행하면 탭 전환 시 계속 리셋되는 버그 발생
  useEffect(() => {
    if (visible && !prevVisible.current) {
      setActiveCategory(initialCategory);
    }
    prevVisible.current = visible;
  }, [visible, initialCategory]);

  const activeColor =
    CATEGORIES.find((c) => c.key === activeCategory)?.color ?? colors.accent;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={['80%', '90%']}
      title="빠른 기록"
    >
      {/* 카테고리 탭 */}
      <View style={styles.tabRow}>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.tab,
                isActive && { backgroundColor: cat.color, borderColor: cat.color },
              ]}
              onPress={() => setActiveCategory(cat.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 폼 영역 */}
      <View style={styles.formArea}>
        {activeCategory === 'feeding' && (
          <FeedingForm onSaveSuccess={onSaveSuccess} />
        )}
        {activeCategory === 'meal' && (
          <MealForm onSaveSuccess={onSaveSuccess} />
        )}
        {activeCategory === 'sleep' && (
          <SleepForm onSaveSuccess={onSaveSuccess} />
        )}
        {activeCategory === 'diaper' && (
          <DiaperForm onSaveSuccess={onSaveSuccess} />
        )}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    backgroundColor: colors.bg.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabText: {
    ...typography.bodySemiBold,
    color: colors.text.secondary,
    fontSize: 13,
  },
  tabTextActive: {
    color: colors.white,
  },
  formArea: {
    flex: 1,
  },
});
