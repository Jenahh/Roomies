import { Text } from 'react-native';
import MaintenanceRequestList from '../../components/dashboard/MaintenanceRequestList';
import type { MaintenanceRequest } from '../../data/demoPropertyManager';
import { styles as s } from '../../styles/PropertyManagerDashboard.styles';

export default function PropertyManagerRequestsScreen({ property: demoProperty, requests: demoMaintenanceRequests, onSelect: setSelectedRequest }: { property: { name: string }; requests: MaintenanceRequest[]; onSelect: (request: MaintenanceRequest) => void }) {
  return <>
<Text accessibilityRole="header" style={s.title}>Requests</Text>
            <Text style={s.subtitle}>{demoProperty.name} · {demoMaintenanceRequests.length} open maintenance requests</Text>
            <MaintenanceRequestList requests={demoMaintenanceRequests} onSelect={setSelectedRequest} />
  </>;
}
