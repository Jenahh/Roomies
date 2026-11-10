import { Text } from 'react-native';
import { styles as s } from '../../styles/ResidentAssistantDashboard.styles';

export default function ResidentAssistantMessagesScreen() {
  return <>
<Text accessibilityRole="header" style={s.title}>Messages</Text>
            <Text style={s.empty}>No messages yet.</Text>
  </>;
}
