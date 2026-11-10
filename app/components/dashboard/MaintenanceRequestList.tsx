import { Pressable, Text, View } from 'react-native';
import type { MaintenanceRequest } from '../../data/demoPropertyManager';
import { styles as s } from '../../styles/PropertyManagerDashboard.styles';

export default function MaintenanceRequestList({ requests, onSelect }: { requests: MaintenanceRequest[]; onSelect: (request: MaintenanceRequest) => void }) {
  return (
    <View style={s.card}>
      {!requests.length && <Text style={s.empty}>No maintenance requests.</Text>}
      {requests.map((request, index) => (
        <Pressable key={request.id} accessibilityRole="button" accessibilityLabel={`${request.title}, ${request.status}`} onPress={() => onSelect(request)} style={({ pressed }) => [s.request, index < requests.length - 1 && s.divider, pressed && s.pressed]}>
          <Text style={s.cardTitle}>{request.title}</Text>
          <View style={s.row}>
            <Text style={s.detail}>{request.id} · {request.unit} · {request.detail}</Text>
            <View style={[s.badge, request.status === 'In Progress' && s.progressBadge]}><Text style={s.badgeText}>{request.status}</Text></View>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
