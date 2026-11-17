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
      <svg viewBox="0 0 320 160" width="100%" role="img" aria-label={`Community overview: ${adoption}% household adoption and ${weeklyEngagement}% weekly engagement.`} style={{ display: 'block' }}>
        {[0, 25, 50, 75, 100].map(tick => <g key={tick}>
          <line x1={10 + tick * 2.9} x2={10 + tick * 2.9} y1="24" y2="138" stroke="#ECECEE" strokeWidth="1" />
          <text x={10 + tick * 2.9} y="155" textAnchor="middle" fontSize="10" fill="#7B7D87">{tick}%</text>
        </g>)}
        {rows.map((row, index) => <g key={row.label}>
          <text x="10" y={16 + index * 70} fontSize="12" fill="#292B35">{row.label}</text>
          <text x="300" y={16 + index * 70} textAnchor="end" fontSize="12" fontWeight="600" fill="#292B35">{row.value}%</text>
          <rect x="10" y={28 + index * 70} width="290" height="22" rx="7" fill="#F0F1F5" />
          <rect x="10" y={28 + index * 70} width={Math.max(0, Math.min(100, row.value)) * 2.9} height="22" rx="7" fill={row.color} />
        </g>)}
      </svg>
    </View>
  );
}
