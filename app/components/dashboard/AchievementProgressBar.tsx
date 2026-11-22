import { View } from 'react-native';
import { styles as s } from '../../styles/AchievementsScreen.styles';

export default function AchievementProgressBar({ label, value, target, amber = false }: { label: string; value: number; target: number; amber?: boolean }) {
  const progress = Math.max(0, Math.min(value, target));
  return <View accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: target, now: progress }} style={s.track}>
    <View style={[s.fill, amber && { backgroundColor: '#F6BC57' }, { width: `${progress / target * 100}%` }]} />
  </View>;
}
