import { Pressable, Text, View } from 'react-native';
import type { HallUpdate, ResidentConcern } from '../../data/demoResidentAssistant';
import { styles as s } from '../../styles/ResidentAssistantDashboard.styles';
import ConcernList from '../../components/dashboard/ConcernList';
import HallUpdates from '../../components/dashboard/HallUpdates';

type ResidentAssistantHomeProps = {
  name: string;
  hall: string;
  now: Date;
  concerns: ResidentConcern[];
  updates: HallUpdate[];
  onAllConcerns: () => void;
  onConcern: (concern: ResidentConcern) => void;
};

export default function ResidentAssistantHomeScreen({ name, hall, now, concerns, updates, onAllConcerns, onConcern }: ResidentAssistantHomeProps) {
  return (
    <>
      <Text accessibilityRole="header" style={s.title}>Hi, {name}</Text>
      <Text style={s.subtitle}>{hall} · {now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</Text>
      <View style={s.assignment}><Text style={s.assignmentText}>Verified RA · Assigned to {hall}</Text></View>
      <View style={s.sectionHeading}>
        <Text accessibilityRole="header" style={s.sectionTitle}>Shared with you</Text>
        <Pressable accessibilityRole="button" onPress={onAllConcerns} style={s.linkButton}><Text style={s.link}>All concerns</Text></Pressable>
      </View>
      <ConcernList concerns={concerns.slice(0, 3)} onSelect={onConcern} />
      <HallUpdates updates={updates} />
    </>
  );
}
