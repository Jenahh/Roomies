import { Text, View } from 'react-native';
import type { HallUpdate } from '../../data/demoResidentAssistant';
import { styles as s } from '../../styles/ResidentAssistantDashboard.styles';

export default function HallUpdates({ updates }: { updates: HallUpdate[] }) {
  return (
    <View>
      <View style={s.sectionHeading}><Text accessibilityRole="header" style={s.sectionTitle}>Hall updates</Text></View>
      {!updates.length && <Text style={s.empty}>No hall updates yet.</Text>}
      {updates.map(update => (
        <View key={update.id} style={s.update}>
          <Text style={s.cardTitle}>{update.title}</Text>
          <Text style={s.detail}>{update.schedule}</Text>
          <Text style={s.detail}>{update.description}</Text>
        </View>
      ))}
    </View>
  );
}
