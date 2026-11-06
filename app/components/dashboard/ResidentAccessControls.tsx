import { Pressable, Text, View } from 'react-native';
import type { ManagedResident } from '../../data/demoPropertyManager';
import { styles as s } from '../../styles/ManageResidentsScreen.styles';
import Icon from './DashboardIcon';

export default function ResidentAccessControls({ resident, onChangeStatus, onRemove }: { resident: ManagedResident; onChangeStatus: () => void; onRemove: () => void }) {
  return (
    <View style={s.controls}>
      <Text style={s.controlsTitle}>Access controls · selected: {resident.name}</Text>
      <View style={s.accessRow}>
        <Text style={s.accessText}>Resident access: {resident.access}</Text>
        <Pressable accessibilityRole="button" onPress={onChangeStatus} style={s.action}><Text style={s.link}>Change status</Text></Pressable>
      </View>
      <Pressable accessibilityRole="button" onPress={onRemove} style={s.remove}>
        <Icon name="trash" size={15} color="#C23B45" />
        <Text style={s.dangerText}>Remove from unit… · confirmation required</Text>
      </Pressable>
    </View>
  );
}
