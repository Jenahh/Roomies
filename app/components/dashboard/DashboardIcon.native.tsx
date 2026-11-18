import { Image, Text } from 'react-native';
import { ROOMIE_UI_ICONS } from '../../../assets/roomie-ui-icons/roomie-ui-icons/icons';
import { getImageSource } from '../../utils/imageSource';
import type { IconName } from './DashboardIcon';

const iconGlyphs: Record<IconName, string> = {
  group: '♧',
  star: '☆',
  flame: '♨',
  sprout: '♧',
  dashboard: '▦',
  wrench: '⚒',
  announcement: '▤',
  properties: '⌂',
  residents: '♙',
  concerns: '♡',
  messages: '☏',
  home: '⌂',
  chores: '✓',
  expenses: '$',
  calendar: '▦',
  profile: '●',
  bell: '♧',
  tree: '♧',
  dishes: '◉',
  sparkles: '✦',
  broom: '⌁',
  laundry: '◉',
  trash: '▤',
  dinner: '◉',
  study: '📖',
  game: '🎮',
  basket: '🛒',
  add: '+',
  split: '$',
};

export default function DashboardIcon({ name, color = '#555B69', size = 20, active = false, imageSize = 24 }: { name: IconName; color?: string; size?: number; active?: boolean; imageSize?: number }) {
  const mappedName = name === 'bell' ? 'notifications' : name;
  if (mappedName in ROOMIE_UI_ICONS) {
    const icon = ROOMIE_UI_ICONS[mappedName as keyof typeof ROOMIE_UI_ICONS];
    return <Image source={getImageSource(icon[active ? 'active' : 'inactive'])} resizeMode="contain" style={{ width: imageSize, height: imageSize }} accessible={false} />;
  }
  return <Text accessible={false} style={{ color, fontSize: size, lineHeight: size + 2, textAlign: 'center', width: size, height: size + 2 }}>{iconGlyphs[name]}</Text>;
}
