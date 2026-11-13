import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';
import { styles } from '../../styles/ResidentDashboard.styles';
import Icon, { type IconName } from './DashboardIcon';
import RoomiePet from '../RoomiePet';
import type { RoomieActionId } from '../../data/roomieActions';
import type { PetMood } from '../../data/roomiePetMood';

type DashboardStatCardProps = {
  icon?: IconName;
  action?: RoomieActionId;
  color?: string;
  mood?: PetMood;
  value: string;
  caption?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function DashboardStatCard({ icon, action, color, mood, value, caption, onPress, style }: DashboardStatCardProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.statCard, style, pressed && styles.pressed]}>
      {action ? <RoomiePet action={action} color={color} mood={mood} size={50} /> : icon ? <Icon name={icon} /> : null}
      <Text style={styles.statNumber}>{value}</Text>
      {!!caption && <Text style={styles.statCaption}>{caption}</Text>}
    </Pressable>
  );
}
