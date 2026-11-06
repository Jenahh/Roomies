import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: { padding: 18, borderRadius: 20, backgroundColor: '#FFFFFF', gap: 8, marginTop: 20, marginBottom: 20 },
  title: { fontSize: 16, fontWeight: '600', color: '#292B35' },
  subtitle: { fontSize: 12, lineHeight: 18, color: '#7B7D87' },
  totals: { flexDirection: 'row', gap: 12, marginVertical: 8 },
  total: { flex: 1, padding: 12, borderRadius: 14, backgroundColor: '#F5F6FC', gap: 4 },
  number: { fontSize: 22, fontWeight: '700', color: '#292B35' },
  caption: { fontSize: 11, lineHeight: 17, color: '#7B7D87' },
});
