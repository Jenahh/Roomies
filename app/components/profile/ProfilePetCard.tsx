import type { PetMood } from '../../data/roomiePetMood';
import { Pressable, Text, View } from 'react-native';
import RoomiePet from '../RoomiePet';
import type { RoomieAccessoryId } from '../../data/roomiePetAccessories';
import { styles as s } from '../../styles/ProfileScreen.styles';

export default function ProfilePetCard({ name, color, mood, accessories, accessoryColors, onOpen }: { name?: string; color?: string; mood: PetMood; accessories: RoomieAccessoryId[]; accessoryColors?: Partial<Record<RoomieAccessoryId, string>>; onOpen: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onOpen} style={({ pressed }) => [s.pet, pressed && s.pressed]}>
      <RoomiePet color={color} mood={mood} accessories={accessories} accessoryColors={accessoryColors} size={52} accessibilityLabel="Your Roomie Pet" />
      <View style={s.copy}><Text style={s.sectionTitle}>My Roomie Pet</Text><Text style={s.subtitle}>{name || 'Set up your household companion'}</Text></View>
      <Text style={s.link}>Customize ›</Text>
    </Pressable>
  );
}
