import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';
import { styles } from '../../styles/ResidentDashboard.styles';
import Icon, { type IconName } from './DashboardIcon';

type DashboardStatCardProps = {
  icon: IconName;
  value: string;
  caption?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function DashboardStatCard({ icon, value, caption, onPress, style }: DashboardStatCardProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.statCard, style, pressed && styles.pressed]}>
      <Icon name={icon} />
      <Text style={styles.statNumber}>{value}</Text>
      {!!caption && <Text style={styles.statCaption}>{caption}</Text>}
    </Pressable>
  );
}
