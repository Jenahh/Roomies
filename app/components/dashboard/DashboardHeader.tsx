import { Pressable, Text, View } from 'react-native';
import { styles } from '../../styles/ResidentDashboard.styles';
import Icon from './DashboardIcon';

export default function DashboardHeader({ household, onHousehold, onNotifications, onAchievements }: {
  household: string;
  onHousehold: () => void;
  onNotifications: () => void;
  onAchievements: () => void;
}) {
  return (
<View style={styles.header}>

            <Pressable accessibilityRole="button" onPress={onHousehold} style={({ pressed }) => [styles.household, pressed && styles.pressed]}>
              <Icon name="home" color="#657EEA" size={15} />
              <Text style={styles.householdName}>{household || 'Set up household'}</Text>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#606675" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}><path d="m6 9 6 6 6-6" /></svg>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Notifications" onPress={onNotifications} style={styles.notification}><Icon name="bell" size={18} /></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Achievements" onPress={onAchievements} style={styles.notification}><Icon name="star" color="#657EEA" size={21} /></Pressable>
          </View>
  );
}
