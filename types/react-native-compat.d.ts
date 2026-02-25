/**
 * react-native@0.81.x + @types/react@19.1.x 타입 호환 패치
 *
 * react-native 0.81.x 레거시 타입 정의는 mixin 패턴을 사용합니다.
 * (Constructor<T> & typeof XxxComponent)
 * @types/react@19.1.x 에서 JSX 클래스 컴포넌트 검사가 엄격해져 호환되지 않습니다.
 *
 * 인터페이스 병합(interface merging)으로 컴포넌트 인스턴스에
 * React.Component 속성을 추가하여 이 문제를 해결합니다.
 */

import type * as React from 'react';
import type {
  ViewProps,
  TextProps,
  TextInputProps,
  ScrollViewProps,
  KeyboardAvoidingViewProps,
  ActivityIndicatorProps,
  TouchableOpacityProps,
  TouchableHighlightProps,
  TouchableWithoutFeedbackProps,
  ImageProps,
  FlatListProps,
  SectionListProps,
  ModalProps,
  PressableProps,
  RefreshControlProps,
} from 'react-native';

declare module 'react-native' {
  namespace Animated {
    // Animated.View, Animated.Text 등이 children을 받을 수 있도록 허용 (React 19 strict 모드 호환)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface AnimatedComponent<T extends React.ComponentType<any>>
      extends React.Component<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        React.ComponentPropsWithRef<T> & { children?: React.ReactNode }
      > {}
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface View extends React.Component<ViewProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Text extends React.Component<TextProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TextInput extends React.Component<TextInputProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ScrollView extends React.Component<ScrollViewProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface KeyboardAvoidingView extends React.Component<KeyboardAvoidingViewProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ActivityIndicator extends React.Component<ActivityIndicatorProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TouchableOpacity extends React.Component<TouchableOpacityProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TouchableHighlight extends React.Component<TouchableHighlightProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TouchableWithoutFeedback extends React.Component<TouchableWithoutFeedbackProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Image extends React.Component<ImageProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface FlatList<ItemT = unknown> extends React.Component<FlatListProps<ItemT>> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface SectionList<ItemT = unknown, SectionT = unknown> extends React.Component<SectionListProps<ItemT, SectionT>> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Modal extends React.Component<ModalProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Pressable extends React.Component<PressableProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface RefreshControl extends React.Component<RefreshControlProps> {}
}
