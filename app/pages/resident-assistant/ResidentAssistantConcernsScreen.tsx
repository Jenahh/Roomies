import { Text } from 'react-native';
import ConcernList from '../../components/dashboard/ConcernList';
import type { ResidentConcern } from '../../data/demoResidentAssistant';
import { styles as s } from '../../styles/ResidentAssistantDashboard.styles';

export default function ResidentAssistantConcernsScreen({ hall: demoHall, concerns: demoConcerns, onSelect: setSelectedConcern }: { hall: string; concerns: ResidentConcern[]; onSelect: (concern: ResidentConcern) => void }) {
  return <>
<Text accessibilityRole="header" style={s.title}>Concerns</Text>
            <Text style={[s.subtitle, { marginBottom: 20 }]}>Shared with you · {demoHall}</Text>
            <ConcernList concerns={demoConcerns} onSelect={setSelectedConcern} />
  </>;
}
