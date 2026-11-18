import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 18, gap: 10, marginBottom: 20 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  plus: { width: 20, height: 20, borderWidth: 1, borderColor: '#657EEA', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, lineHeight: 24, fontWeight: '600', color: '#292B35' },
  description: { fontSize: 13, lineHeight: 20, color: '#7B7D87' },
  label: { fontSize: 12, fontWeight: '600', color: '#292B35', marginTop: 2 },
  input: { minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: '#E4E3E0', padding: 12, color: '#292B35', fontSize: 13 },
  button: { minHeight: 48, borderRadius: 14, backgroundColor: '#657EEA', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  buttonText: { fontSize: 14, fontWeight: '600', color: '#111827' },
  pressed: { opacity: 0.7 },
  error: { fontSize: 12, lineHeight: 18, color: '#9B3636' },
  success: { fontSize: 12, lineHeight: 18, color: '#28734E' },
});
