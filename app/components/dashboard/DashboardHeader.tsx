import { Pressable, Text, View } from 'react-native';
import { styles } from '../../styles/ResidentDashboard.styles';
import Icon from './DashboardIcon';
import RoomiePet from '../RoomiePet';
import { getPetAccessoryIds } from '../../data/roomiePetAccessories';
import type { PetMood } from '../../data/roomiePetMood';
import type { ResidentData } from '../../hooks/useResidentData';

export default function DashboardHeader({ household, pet, mood, onHousehold, onNotifications, onPet, notificationsActive = false }: {
  household: string;
  pet: ResidentData['pet'];
  mood: PetMood;
  onHousehold: () => void;
  onNotifications: () => void;
  notificationsActive?: boolean;
  onPet: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel={household || 'Set up household'} onPress={onHousehold} style={({ pressed }) => [styles.household, pressed && styles.pressed]}>
        <Icon name="home" color="#657EEA" size={18} />
        <Text numberOfLines={1} style={styles.householdName}>{household || 'Set up household'}</Text>
        <Text accessible={false} style={styles.chevron}>{'\u2304'}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Notifications" onPress={onNotifications} style={({ pressed }) => [styles.notification, pressed && styles.pressed]}>
        <Icon name="bell" size={20} active={notificationsActive} />
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Customize Roomie" onPress={onPet} style={({ pressed }) => [styles.headerPet, pressed && styles.pressed]}>
        <RoomiePet color={pet?.color} mood={mood} accessories={getPetAccessoryIds(pet)} accessoryColors={pet?.accessoryColors} size={40} accessibilityLabel="Roomie Pet" />
      </Pressable>
    </View>
  );
}
