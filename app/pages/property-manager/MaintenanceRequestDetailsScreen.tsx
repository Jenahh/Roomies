import { Text } from 'react-native';
import type { MaintenanceRequest } from '../../data/demoPropertyManager';
import { styles as s } from '../../styles/PropertyManagerDashboard.styles';

export default function MaintenanceRequestDetailsScreen({ request: selectedRequest }: { request: MaintenanceRequest }) {
  return <>
<Text accessibilityRole="header" style={s.sectionTitle}>{selectedRequest.title}</Text>
              <Text style={s.overviewText}>{selectedRequest.id} · {selectedRequest.unit} · {selectedRequest.detail}</Text>
              <Text style={s.overviewText}>{selectedRequest.status}</Text>
  </>;
}
