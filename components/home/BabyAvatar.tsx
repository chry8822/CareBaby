import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/theme';

interface BabyAvatarProps {
  uri?: string | null;
  size?: number;
  onPress?: () => void;
}

export const BabyAvatar = ({ uri, size = 44, onPress }: BabyAvatarProps) => {
  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const content = uri ? (
    <Image
      source={{ uri }}
      style={[styles.avatar, avatarStyle]}
      resizeMode="cover"
    />
  ) : (
    <View style={[styles.placeholder, avatarStyle]}>
      <Image
        source={require('../../assets/images/baby-profile-default.png')}
        style={[styles.avatar, avatarStyle]}
        resizeMode="cover"
        onError={() => {}}
      />
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
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
