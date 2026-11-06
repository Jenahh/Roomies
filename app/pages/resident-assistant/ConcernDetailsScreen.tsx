import { Pressable, Text, View } from 'react-native';
import type { ResidentConcern } from '../../data/demoResidentAssistant';
import { styles as s } from '../../styles/ResidentAssistantDashboard.styles';

export default function ConcernDetailsScreen({ concern: selectedConcern, onBack }: { concern: ResidentConcern; onBack: () => void }) {
  return (
<View style={s.modal}>
            <Pressable accessibilityRole="button" accessibilityLabel="Back to concerns" onPress={onBack} style={s.back}><Text style={s.backText}>{'<'}</Text></Pressable>
            <Text accessibilityRole="header" style={s.sectionTitle}>{selectedConcern.title}</Text>
            <Text style={s.detail}>{selectedConcern.room} · {selectedConcern.resident}</Text>
            <Text style={s.detail}>{selectedConcern.detail}</Text>
            <Text style={s.assignmentText}>{selectedConcern.status}</Text>
          </View>
  );
}
