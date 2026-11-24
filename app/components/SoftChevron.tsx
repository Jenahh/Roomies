import { StyleSheet, View } from 'react-native';

/** Rounded native bars keep navigation arrows consistent on web and phones. */
export default function SoftChevron({ direction = 'left', color = '#555B69' }: {
  direction?: 'left' | 'right' | 'down'; color?: string;
}) {
  return <View accessible={false} pointerEvents="none" style={[s.arrow, {
    transform: [{ rotate: direction === 'right' ? '180deg' : direction === 'down' ? '-90deg' : '0deg' }],
  }]}>
    <View style={[s.bar, { top: 6, backgroundColor: color, transform: [{ rotate: '-45deg' }] }]} />
    <View style={[s.bar, { top: 12, backgroundColor: color, transform: [{ rotate: '45deg' }] }]} />
  </View>;
}

const s = StyleSheet.create({
  arrow: { width: 22, height: 22, flexShrink: 0 },
  bar: { position: 'absolute', left: 6, width: 11, height: 2.5, borderRadius: 2 },
});
