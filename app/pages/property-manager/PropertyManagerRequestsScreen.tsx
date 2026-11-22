
import { Text, View } from 'react-native';
import MaintenanceRequestList from '../../components/dashboard/MaintenanceRequestList';
import type { MaintenanceRequest } from '../../data/demoPropertyManager';
import { styles as s } from '../../styles/PropertyManagerDashboard.styles';

type Props = {
  property: { name: string };
  requests: MaintenanceRequest[];
  onSelect: (request: MaintenanceRequest) => void;
};

export default function PropertyManagerRequestsScreen({
  property,
  requests,
  onSelect,
}: Props) {
  const openRequests = requests.filter(
    request =>
      request.status === 'Submitted' ||
      request.status === 'In Progress'
  );

  const completedRequests = requests.filter(
    request =>
      request.status === 'Resolved' ||
      request.status === 'Closed'
  );

  return (
    <View style={{ gap: 18 }}>
      <Text accessibilityRole="header" style={s.title}>
        Requests
      </Text>

      <Text style={s.subtitle}>
        {property.name} · {openRequests.length} open maintenance requests
      </Text>

      <Text style={s.sectionTitle}>Open requests</Text>
      <MaintenanceRequestList
        requests={openRequests}
        onSelect={onSelect}
      />

      <Text style={s.sectionTitle}>Resolved and closed</Text>
      <MaintenanceRequestList
        requests={completedRequests}
        onSelect={onSelect}
      />
    </View>
  );
}
