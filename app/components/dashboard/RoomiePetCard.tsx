import type { PetMood } from '../../data/roomiePetMood';
import { Pressable, Text, View } from 'react-native';
import RoomiePet from '../RoomiePet';
import { getPetAccessoryIds } from '../../data/roomiePetAccessories';
import { styles } from '../../styles/ResidentDashboard.styles';
import type { ResidentData } from '../../hooks/useResidentData';

export default function RoomiePetCard({ pet, mood, onOpen }: { pet: ResidentData['pet']; mood: PetMood; onOpen: () => void }) {
  return (
          <View style={styles.petCard}>
            <RoomiePet color={pet?.color} mood={mood} accessories={getPetAccessoryIds(pet)} accessoryColors={pet?.accessoryColors} size={46} accessibilityLabel="Your Roomie Pet" />
            <View style={styles.petCopy}><Text style={styles.petHeading}>My Roomie Pet</Text><Text style={styles.petName}>{pet?.name || 'Name your pet'}</Text></View>
            <View style={styles.petActions}><Pressable accessibilityRole="button" onPress={onOpen} style={({ pressed }) => [styles.petOpen, pressed && styles.pressed]}><Text style={styles.linkText}>{pet ? 'Open' : 'Set up'}</Text></Pressable>{pet && <Text style={styles.petStatus}>{mood === 'Stressed' ? 'Feeling stressed' : mood === 'Attention' ? 'Needs attention' : 'Feeling happy'}</Text>}</View>
          </View>
  );
}
