import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

export type PhoneSafeAreaProps = {
  children: ReactNode;
  style: StyleProp<ViewStyle>;
  initial?: boolean;
};

export default function PhoneSafeArea({ children, style }: PhoneSafeAreaProps) {
  return <View style={style}>{children}</View>;
}
