import { Pressable, Text, View } from 'react-native';
import type { ManagedResident } from '../../data/demoPropertyManager';
import { styles as s } from '../../styles/ManageResidentsScreen.styles';

export default function ResidentRoster({ residents, householdName, selectedId, onSelect }: { residents: ManagedResident[]; householdName?: string; selectedId?: string; onSelect: (id: string) => void }) {
  return (
    <View style={s.roster}>
      {!residents.length && <Text style={s.detail}>No residents in this suite.</Text>}
      {residents.map(resident => (
        <Pressable key={resident.id} accessibilityRole="button" accessibilityLabel={`Manage ${resident.name}, ${resident.access} access`} accessibilityState={{ selected: resident.id === selectedId }} onPress={() => onSelect(resident.id)} style={({ pressed }) => [s.resident, resident.id === selectedId && s.selected, pressed && s.selected]}>
          <View style={s.avatar}><Text style={s.initials}>{resident.name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()}</Text></View>
          <View style={s.copy}><Text style={s.name}>{resident.name}</Text><Text style={s.detail}>{resident.access} access · Member of {householdName || `Suite ${resident.unit}`}</Text></View>
          <Text accessibilityElementsHidden aria-hidden style={s.more}>···</Text>
        </Pressable>
      ))}
    </View>
  );
}
