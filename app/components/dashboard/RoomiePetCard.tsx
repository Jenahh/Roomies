import type { PetMood } from '../../data/roomiePetMood';
import { Image, Pressable, Text, View } from 'react-native';
import { getHatlessPetImage } from '../../data/roomiePetImages';
import { styles } from '../../styles/ResidentDashboard.styles';
import type { ResidentData } from '../../hooks/useResidentData';

export default function RoomiePetCard({ pet, mood, onOpen }: { pet: ResidentData['pet']; mood: PetMood; onOpen: () => void }) {
  return (
          <View style={styles.petCard}>
            <Image source={{ uri: getHatlessPetImage(pet?.color, mood) }} style={styles.petImage} resizeMode="contain" accessibilityLabel="Your Roomie Pet" />
            <View style={styles.petCopy}><Text style={styles.petHeading}>My Roomie Pet</Text><Text style={styles.petName}>{pet?.name || 'Name your pet'}</Text></View>
            <View style={styles.petActions}><Pressable accessibilityRole="button" onPress={onOpen} style={({ pressed }) => [styles.petOpen, pressed && styles.pressed]}><Text style={styles.linkText}>{pet ? 'Open' : 'Set up'}</Text></Pressable>{pet && <Text style={styles.petStatus}>{mood === 'Stressed' ? 'Feeling stressed' : mood === 'Attention' ? 'Needs attention' : 'Feeling happy'}</Text>}</View>
          </View>
  );
}
