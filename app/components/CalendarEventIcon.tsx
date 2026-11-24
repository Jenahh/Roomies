import { Image, StyleSheet, View } from 'react-native';
import calendarAtlas from '../../assets/calendar-icons/calendar-atlas.png';
import { getImageSource } from '../utils/imageSource';

const tiles = { dinner: 0, group: 1, study: 2, game: 3, basket: 4, calendar: 5, sparkles: 6, bill: 7 } as const;
export type CalendarEventIconName = keyof typeof tiles;

export default function CalendarEventIcon({ name, tint }: { name: CalendarEventIconName; tint: string }) {
  const tile = tiles[name];
  return <View accessible={false} pointerEvents="none" style={[s.badge, { backgroundColor: tint }]}>
    <Image accessible={false} source={getImageSource(calendarAtlas)} resizeMode="stretch" style={[
      s.atlas, { left: -(tile % 4) * 36, top: -Math.floor(tile / 4) * 36 },
    ]} />
  </View>;
}

const s = StyleSheet.create({
  badge: { width: 36, height: 36, borderRadius: 12, flexShrink: 0, overflow: 'hidden' },
  atlas: { position: 'absolute', width: 144, height: 72, maxWidth: undefined },
});
