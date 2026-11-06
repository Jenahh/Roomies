import { Image, Pressable, Text, View } from 'react-native';
import { getHatlessPetImage } from '../../data/roomiePetImages';
import { styles as s } from '../../styles/ProfileScreen.styles';

export default function ProfilePetCard({ name, color, onOpen }: { name?: string; color?: string; onOpen: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onOpen} style={({ pressed }) => [s.pet, pressed && s.pressed]}>
      <Image source={{ uri: getHatlessPetImage(color) }} style={s.petImage} resizeMode="contain" accessibilityLabel="Your Roomie Pet" />
      <View style={s.copy}><Text style={s.sectionTitle}>My Roomie Pet</Text><Text style={s.subtitle}>{name || 'Set up your household companion'}</Text></View>
      <Text style={s.link}>Customize ›</Text>
    </Pressable>
  );
}
