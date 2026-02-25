import { View, Image, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

interface BabyAvatarProps {
  uri?: string | null;
  size?: number;
}

export const BabyAvatar = ({ uri, size = 44 }: BabyAvatarProps) => {
  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.avatar, avatarStyle]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={[styles.placeholder, avatarStyle]}>
      <Image
        source={require('../../assets/images/baby-profile-default.png')}
        style={[styles.avatar, avatarStyle]}
        resizeMode="cover"
        // 파일 없을 때 투명 표시
        onError={() => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.border,
  },
  placeholder: {
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
});
