import { Pressable, Text, View } from 'react-native';
import { styles as s } from '../../styles/ProfileSupport.styles';
import RoomiePet from '../RoomiePet';

export default function ProfileSupport({ onMaintenance, onContactRA, color }: { onMaintenance: () => void; onContactRA: () => void; color?: string }) {
  return <View style={s.section}>
    <Pressable accessibilityRole="button" onPress={onMaintenance} style={({ pressed }) => [s.feature, s.maintenance, pressed && s.pressed]}><RoomiePet role="property-manager" color={color} size={64} /><Text style={s.featureTitle}>Report maintenance issue</Text></Pressable>
    <Pressable accessibilityRole="button" onPress={onContactRA} style={({ pressed }) => [s.feature, s.ra, pressed && s.pressed]}><RoomiePet role="assistant" color={color} size={64} /><Text style={s.featureTitle}>Contact my RA</Text></Pressable>
  </View>;
}
