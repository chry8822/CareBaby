import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Check, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { BottomSheet } from './BottomSheet';
import type { Baby } from '../../types/database';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

interface BabySwitcherSheetProps {
  visible: boolean;
  onClose: () => void;
  babies: Baby[];
  currentBaby: Baby;
  onSelect: (baby: Baby) => void;
}

const BabyAvatar = ({ baby, size = 44 }: { baby: Baby; size?: number }) => {
  const radius = size / 2;
  if (baby.avatar_url) {
    return (
      <Image
        source={{ uri: baby.avatar_url }}
        style={{ width: size, height: size, borderRadius: radius }}
        resizeMode="cover"
      />
    );
  }
  const emoji =
    baby.gender === 'male' ? '👦' : baby.gender === 'female' ? '👧' : '🍼';
  return (
    <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: radius }]}>
      <Text style={{ fontSize: size * 0.45 }}>{emoji}</Text>
    </View>
  );
};

export const BabySwitcherSheet = ({
  visible,
  onClose,
  babies,
  currentBaby,
  onSelect,
}: BabySwitcherSheetProps) => {
  const handleSelect = (baby: Baby) => {
    onSelect(baby);
    onClose();
  };

  const handleAddBaby = () => {
    onClose();
    router.push('/baby-setup');
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={['40%']}
      title="아기 선택"
      closeOnBackdrop
    >
      <View style={styles.content}>
        {babies.map((baby, index) => {
          const isSelected = baby.id === currentBaby.id;
          return (
            <TouchableOpacity
              key={baby.id}
              style={[
                styles.babyRow,
                index < babies.length - 1 && styles.babyRowBorder,
                isSelected && styles.babyRowSelected,
              ]}
              onPress={() => handleSelect(baby)}
              activeOpacity={0.7}
            >
              <BabyAvatar baby={baby} />
              <View style={styles.babyInfo}>
                <Text style={[styles.babyName, isSelected && styles.babyNameSelected]}>
                  {baby.name}
                </Text>
                {baby.birth_date && (
                  <Text style={styles.babySub}>
                    {new Date(baby.birth_date).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                )}
              </View>
              {isSelected && (
                <View style={styles.checkWrap}>
                  <Check size={16} color={colors.accent} strokeWidth={2.5} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* 아기 추가 버튼 */}
        <TouchableOpacity style={styles.addRow} onPress={handleAddBaby} activeOpacity={0.7}>
          <View style={styles.addIcon}>
            <Plus size={18} color={colors.accent} strokeWidth={2} />
          </View>
          <Text style={styles.addText}>아기 추가하기</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xl,
  },
  babyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  babyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  babyRowSelected: {
    // 선택된 항목 강조 없음 — checkmark로 충분
  },
  avatarFallback: {
    backgroundColor: '#FDF2F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  babyInfo: {
    flex: 1,
  },
  babyName: {
    ...typography.bodySemiBold,
    color: colors.text.primary,
  },
  babyNameSelected: {
    color: colors.accent,
  },
  babySub: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  checkWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${colors.accent}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${colors.accent}18`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: `${colors.accent}60`,
  },
  addText: {
    ...typography.bodySemiBold,
    color: colors.accent,
  },
});
