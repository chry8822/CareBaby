import { TouchableOpacity, View, Image, StyleSheet, Text } from 'react-native';
import { Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useUIStore } from '../../stores/uiStore';
import { colors, typography, borderRadius } from '../../constants/theme';

interface AvatarPickerProps {
  /** 현재 표시할 이미지 URI (로컬 또는 원격) */
  uri: string | null;
  /** 아바타 크기(px), 기본 96 */
  size?: number;
  /** 이미지 선택 완료 시 로컬 URI를 전달하는 콜백 */
  onPick: (uri: string) => void;
}

/**
 * 갤러리에서 정사각형 이미지를 선택하는 재사용 아바타 피커 컴포넌트.
 * 선택된 이미지가 있으면 표시하고, 없으면 점선 플레이스홀더를 보여준다.
 * 오른쪽 하단에 카메라 뱃지가 항상 표시된다.
 */
export const AvatarPicker = ({ uri, size = 96, onPick }: AvatarPickerProps) => {
  const { showToast } = useUIStore();

  const badgeSize = Math.round(size * 0.27);
  const radius = size / 2;

  const handlePress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('사진 접근 권한이 필요합니다.', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onPick(result.assets[0].uri);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={{ width: size, height: size, position: 'relative' }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: radius }}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.placeholder, { width: size, height: size, borderRadius: radius }]}>
          <Camera size={size * 0.28} color={colors.text.secondary} strokeWidth={1.5} />
          <Text style={styles.placeholderText}>사진 등록</Text>
        </View>
      )}

      {/* 카메라 뱃지 */}
      <View
        style={[
          styles.badge,
          {
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
          },
        ]}
      >
        <Camera size={badgeSize * 0.5} color={colors.white} strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.bg.elevated,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  placeholderText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  badge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg.elevated,
  },
});
