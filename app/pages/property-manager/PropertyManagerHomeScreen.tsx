import { Pressable, Text, View } from 'react-native';
import type { MaintenanceRequest } from '../../data/demoPropertyManager';
import { styles as s } from '../../styles/PropertyManagerDashboard.styles';
import MaintenanceRequestList from '../../components/dashboard/MaintenanceRequestList';
import CommunityOverviewChart from '../../components/property-manager/CommunityOverviewChart';

type PropertyManagerHomeProps = {
  name: string;
  now: Date;
  property: { name: string; homes: number; activeHomes: number; activeResidents: number; weeklyEngagement: number; resolvedThisMonth: number };
  requests: MaintenanceRequest[];
  onCreateAnnouncement: () => void;
  onAllRequests: () => void;
  onRequest: (request: MaintenanceRequest) => void;
  onManageResidents: () => void;
};

export default function PropertyManagerHomeScreen({ name, now, property, requests, onCreateAnnouncement, onAllRequests, onRequest, onManageResidents }: PropertyManagerHomeProps) {
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  return (
    <>
      <Text accessibilityRole="header" style={s.title}>{greeting}, {name.trim().split(/\s+/)[0]}</Text>
      <Text style={s.subtitle}>{property.name} · {now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</Text>
      <View style={s.verified}><Text style={s.verifiedText}>Verified Property Manager</Text></View>
      <CommunityOverviewChart {...property} />
      <View style={s.stats}>
        <Pressable accessibilityRole="button" onPress={onAllRequests} style={({ pressed }) => [s.metric, s.openMetric, pressed && s.pressed]}>
          <Text style={s.metricValue}>{requests.length} open</Text>
          <Text style={s.metricCaption}>Includes {requests.filter(request => request.status === 'Submitted').length} awaiting review</Text>
        </Pressable>
        <View style={[s.metric, s.resolvedMetric]}><Text style={s.metricValue}>{property.resolvedThisMonth}</Text><Text style={s.metricCaption}>resolved this month</Text></View>
      </View>
      <Pressable accessibilityRole="button" onPress={onCreateAnnouncement} style={({ pressed }) => [s.primaryButton, pressed && s.pressed]}><Text style={s.primaryText}>Create Announcement</Text></Pressable>
      <View style={s.sectionHeading}>
        <Text accessibilityRole="header" style={s.sectionTitle}>Maintenance</Text>
        <Pressable accessibilityRole="button" onPress={onAllRequests} style={s.linkButton}><Text style={s.link}>View all {requests.length}</Text></Pressable>
      </View>
      <MaintenanceRequestList requests={requests.slice(0, 2)} onSelect={onRequest} />
      <Pressable accessibilityRole="button" onPress={onManageResidents} style={({ pressed }) => [s.primaryButton, s.manageResidentsButton, pressed && s.pressed]}>
        <Text style={s.primaryText}>Manage Residents</Text>
      </Pressable>
    </>
  );
}
