import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import type { PhoneSafeAreaProps } from './PhoneSafeArea';

export default function PhoneSafeArea({ children, style, initial = false }: PhoneSafeAreaProps) {
  return <SafeAreaProvider initialMetrics={initial ? initialWindowMetrics : undefined}>
    <SafeAreaView style={style}>{children}</SafeAreaView>
  </SafeAreaProvider>;
}
