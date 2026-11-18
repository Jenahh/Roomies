import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
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
  label: string;
  status: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function DashboardStatCard({ icon, action, color, mood, value, label, status, onPress, style }: DashboardStatCardProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.statCard, style, pressed && styles.pressed]}>
      <View style={styles.statHeading}>
        <Text style={styles.statLabel}>{label}</Text>
        {action ? <RoomiePet action={action} color={color} mood={mood} size={44} /> : icon ? <Icon name={icon} /> : null}
      </View>
      <Text style={styles.statNumber} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{value}</Text>
      <Text style={styles.statCaption}>{status}</Text>
    </Pressable>
  );
}
