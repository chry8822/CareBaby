import {
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '../../constants/theme';

export interface ClearableInputProps extends TextInputProps {
  /** controlled value (required) */
  value: string;
  /** controlled change handler (required) */
  onChangeText: (text: string) => void;
  /**
   * wrapper View에 적용할 스타일.
   * flex row 컨테이너 안에서 사용할 때는 { flex: 1 } 전달.
   */
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * 텍스트가 입력되면 우측에 X 버튼이 나타나고
 * 누르면 입력 내용을 초기화하는 TextInput 래퍼 컴포넌트.
 *
 * style prop은 내부 TextInput에 전달되므로 기존 스타일 그대로 사용 가능.
 */
export const ClearableInput = ({
  value,
  onChangeText,
  style,
  containerStyle,
  ...rest
}: ClearableInputProps) => {
  const hasValue = value.length > 0;

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[style, hasValue && styles.withClear]}
        placeholderTextColor={colors.text.secondary}
        {...rest}
      />
      {hasValue && (
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() => onChangeText('')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.6}
        >
          <X size={14} color={colors.text.secondary} strokeWidth={2.5} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  /** 텍스트가 X 버튼과 겹치지 않도록 우측 패딩 확보 */
  withClear: {
    paddingRight: 40,
  },
  clearBtn: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
  },
});
