import { Text, View } from 'react-native';
import { styles as s } from '../../styles/CommunityOverviewChart.styles';

export type CommunityMetrics = {
  homes: number;
  activeHomes: number;
  activeResidents: number;
  weeklyEngagement: number;
};

export default function CommunityOverviewChart({ homes, activeHomes, activeResidents, weeklyEngagement }: CommunityMetrics) {
  const adoption = homes > 0 ? Math.round(activeHomes / homes * 100) : 0;
  const rows = [
    { label: 'Household adoption', value: adoption, color: '#657EEA' },
    { label: 'Weekly engagement', value: weeklyEngagement, color: '#77CAA0' },
  ];

  return (
    <View style={s.card}>
      <Text accessibilityRole="header" style={s.title}>Community overview</Text>
      <Text style={s.subtitle}>Aggregate community activity</Text>
      <View style={s.totals}>
        <View style={s.total}><Text style={s.number}>{activeHomes} / {homes}</Text><Text style={s.caption}>active homes</Text></View>
        <View style={s.total}><Text style={s.number}>{activeResidents}</Text><Text style={s.caption}>active residents</Text></View>
      </View>
      <View accessibilityRole="summary" accessibilityLabel={`Community overview: ${adoption}% household adoption and ${weeklyEngagement}% weekly engagement.`} style={{ gap: 16, marginTop: 16 }}>
        {rows.map(row => (
          <View key={row.label} style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={s.caption}>{row.label}</Text>
              <Text style={s.caption}>{row.value}%</Text>
            </View>
            <View style={{ height: 12, borderRadius: 7, backgroundColor: '#F0F1F5', overflow: 'hidden' }}>
              <View style={{ width: `${Math.max(0, Math.min(100, row.value))}%`, height: '100%', backgroundColor: row.color, borderRadius: 7 }} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
