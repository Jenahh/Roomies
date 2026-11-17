import { Pressable, Text, View } from 'react-native';
import { styles } from '../../styles/ResidentDashboard.styles';
import Icon from './DashboardIcon';
import RoomiePet from '../RoomiePet';
import { getPetAccessoryIds } from '../../data/roomiePetAccessories';
import type { PetMood } from '../../data/roomiePetMood';
import type { ResidentData } from '../../hooks/useResidentData';

export default function DashboardHeader({ household, pet, mood, onHousehold, onNotifications, onPet }: {
  household: string;
  pet: ResidentData['pet'];
  mood: PetMood;
  onHousehold: () => void;
  onNotifications: () => void;
  onPet: () => void;
}) {
  return (
<View style={styles.header}>

            <Pressable accessibilityRole="button" onPress={onHousehold} style={({ pressed }) => [styles.household, pressed && styles.pressed]}>
              <Icon name="home" color="#657EEA" size={15} />
              <Text style={styles.householdName}>{household || 'Set up household'}</Text>
              <Text accessible={false} style={{ color: '#606675', fontSize: 14, lineHeight: 16 }}>⌄</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Notifications" onPress={onNotifications} style={styles.notification}><Icon name="bell" size={18} /></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Customize Roomie Pet" onPress={onPet} style={({ pressed }) => [styles.headerPet, pressed && styles.pressed]}>
              <RoomiePet color={pet?.color} mood={mood} accessories={getPetAccessoryIds(pet)} accessoryColors={pet?.accessoryColors} size={48} accessibilityLabel="Roomie Pet" />
            </Pressable>
          </View>
  );
}
