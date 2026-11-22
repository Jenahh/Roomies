import { Pressable, Text, View } from 'react-native';
import type { ResidentConcern } from '../../data/demoResidentAssistant';
import { styles as s } from '../../styles/ResidentAssistantDashboard.styles';

export default function ConcernList({ concerns, onSelect }: { concerns: ResidentConcern[]; onSelect: (concern: ResidentConcern) => void }) {
  return (
    <View style={s.card}>
      {!concerns.length && <Text style={s.empty}>No concerns have been shared with you.</Text>}
      {concerns.map((concern, index) => (
        <Pressable key={concern.id} accessibilityRole="button" accessibilityLabel={`${concern.title}, ${concern.status}`} onPress={() => onSelect(concern)} style={({ pressed }) => [s.concern, index < concerns.length - 1 && s.divider, pressed && s.pressed]}>
          <View style={s.row}>
            <Text style={s.cardTitle}>{concern.title}</Text>
            <View style={[s.badge, concern.status === 'New' ? s.newBadge : concern.status === 'In Progress' ? s.progressBadge : s.resolvedBadge]}>
              <Text style={[s.badgeText, concern.status === 'New' && s.newBadgeText]}>{concern.status}</Text>
            </View>
          </View>
          <Text style={s.detail}>{concern.room} · {concern.resident} · {concern.detail}</Text>
        </Pressable>
      ))}
    </View>
  );
}
