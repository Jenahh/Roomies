import { Text, View } from 'react-native';
import { styles as s } from '../../styles/PropertyManagerDashboard.styles';

type CommunityOverviewProps = { homes: number; activeHomes: number; activeResidents: number; weeklyEngagement: number };

export default function CommunityOverview({ homes, activeHomes, activeResidents, weeklyEngagement }: CommunityOverviewProps) {
  const adoption = homes ? Math.round(activeHomes / homes * 100) : 0;
  return (
    <View style={s.overview}>
      <Text style={s.cardTitle}>Community overview · aggregate only</Text>
      <Text style={s.overviewText}>{homes} homes · {activeHomes} active homes · {adoption}% adoption</Text>
      <Text style={s.overviewText}>{activeResidents} active residents · {weeklyEngagement}% weekly engagement</Text>
    </View>
  );
}
