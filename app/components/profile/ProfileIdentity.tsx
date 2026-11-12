import { Text, View } from 'react-native';
import type { ResidentUser } from '../../data/demoAccount';
import { styles as s } from '../../styles/ProfileScreen.styles';
import RoomiePet from '../RoomiePet';

const roleLabels: Record<ResidentUser['role'], string> = {
  resident: 'Resident',
  assistant: 'Resident Assistant',
  'property-manager': 'Property Manager',
};

export default function ProfileIdentity({ name, email, role, color }: { name: string; email: string; role: ResidentUser['role']; color?: string }) {
  const initials = name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
  const roomieRole = role === 'assistant' || role === 'property-manager' ? role : undefined;
  return (
    <View style={s.identity}>
      {roomieRole
        ? <RoomiePet role={roomieRole} color={color} size={76} />
        : <View style={s.avatar}><Text style={s.initials}>{initials}</Text></View>}
      <Text accessibilityRole="header" style={s.name}>{name}</Text>
      <Text style={s.subtitle}>{email}</Text>
      <Text style={s.badge}>{roleLabels[role]}</Text>
    </View>
  );
}
