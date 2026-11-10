import { Text, View } from 'react-native';
import type { ResidentUser } from '../../data/demoAccount';
import { styles as s } from '../../styles/ProfileScreen.styles';

const roleLabels: Record<ResidentUser['role'], string> = {
  resident: 'Resident',
  assistant: 'Resident Assistant',
  'property-manager': 'Property Manager',
};

export default function ProfileIdentity({ name, email, role }: { name: string; email: string; role: ResidentUser['role'] }) {
  const initials = name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
  return (
    <View style={s.identity}>
      <View style={s.avatar}><Text style={s.initials}>{initials}</Text></View>
      <Text accessibilityRole="header" style={s.name}>{name}</Text>
      <Text style={s.subtitle}>{email}</Text>
      <Text style={s.badge}>{roleLabels[role]}</Text>
    </View>
  );
}
