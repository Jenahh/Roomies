import { Text, View } from 'react-native';
import Icon, { type IconName } from './DashboardIcon';
import { styles as s } from '../../styles/AchievementsScreen.styles';
import AchievementProgressBar from './AchievementProgressBar';

export default function AchievementProgressCard({ title, description, icon, value, target, amber = false }: { title: string; description: string; icon: IconName; value: number; target: number; amber?: boolean }) {
  const progress = Math.min(value, target);
  return (
    <View style={s.progressCard}>
      <View style={[s.badgeIcon, amber && s.amber]}><Icon name={icon} size={22} /></View>
      <View style={s.copy}><Text style={s.badgeName}>{title}</Text><Text style={s.detail}>{description}</Text></View>
      <View style={s.progress}>
        <AchievementProgressBar label={title} value={progress} target={target} amber={amber} />
        <Text style={s.detail}>{progress} / {target}</Text>
      </View>
    </View>
  );
}
