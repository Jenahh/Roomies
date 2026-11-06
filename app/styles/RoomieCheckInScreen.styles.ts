import { StyleSheet } from 'react-native';
import { backNavigationText } from './BackNavigation.styles';

export const styles = StyleSheet.create({
  back: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
  backText: backNavigationText,
  subtitle: { fontSize: 11, lineHeight: 18, color: '#7B7D87', marginBottom: 10 },
  title: { fontSize: 27, lineHeight: 34, fontWeight: '700', color: '#292B35', marginBottom: 6 },
  hero: { backgroundColor: '#EAF6EF', borderRadius: 22, alignItems: 'center', padding: 12, marginBottom: 12 },
  image: { width: 145, height: 145 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { flexShrink: 1, fontSize: 18, fontWeight: '700', color: '#292B35' },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, backgroundColor: '#EAF6EF' },
  badgeText: { fontSize: 10, fontWeight: '600', color: '#385B49' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 14, gap: 8, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { flexShrink: 1, fontSize: 13, lineHeight: 20, color: '#292B35' },
  detail: { fontSize: 11, lineHeight: 18, color: '#7B7D87' },
  points: { backgroundColor: '#EDF0FF', borderRadius: 20, padding: 16, gap: 5, marginBottom: 12 },
  pointsTitle: { color: '#4056DE', fontSize: 17, fontWeight: '700' },
  unlock: { backgroundColor: '#F1EBFF', borderRadius: 20, padding: 16, gap: 6, marginBottom: 12 },
  button: { minHeight: 46, borderRadius: 14, backgroundColor: '#657EEA', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, marginBottom: 10 },
  buttonText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  pressed: { opacity: 0.7 },
  error: { fontSize: 12, lineHeight: 18, color: '#9B3636' },
});
