import { Text } from 'react-native';
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
  add: '+',
  split: '$',
};

export default function DashboardIcon({ name, color = '#555B69', size = 20 }: { name: IconName; color?: string; size?: number }) {
  return <Text accessible={false} style={{ color, fontSize: size, lineHeight: size + 2, textAlign: 'center', width: size, height: size + 2 }}>{iconGlyphs[name]}</Text>;
}
