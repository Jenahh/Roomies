import { backNavigationText } from './BackNavigation.styles';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  back: { width: 44, height: 36, justifyContent: 'center' }, backText: backNavigationText,
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }, logo: { width: 38, height: 38 }, copy: { flex: 1, minWidth: 0, gap: 4 },
  title: { fontSize: 25, fontWeight: '700', color: '#292B35', letterSpacing: -0.7 }, subtitle: { fontSize: 11, lineHeight: 17, color: '#7B7D87' }, bell: { width: 36, height: 40, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  section: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }, sectionTitle: { fontSize: 13, fontWeight: '600', color: '#292B35' }, textButton: { minHeight: 40, justifyContent: 'center' }, link: { color: '#4056DE', fontSize: 11, fontWeight: '600' }, muted: { color: '#9094A0' },
  list: { gap: 10 }, card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 14, gap: 9 }, cardHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, cardTitle: { fontSize: 13, fontWeight: '600', color: '#292B35' }, unread: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4056DE' },
  reminderBody: { flexDirection: 'row', alignItems: 'center', gap: 10 }, petCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' }, petImage: { width: 30, height: 30 }, body: { flex: 1, fontSize: 12, lineHeight: 18, color: '#7B7D87' },
  actions: { flexDirection: 'row', gap: 8 }, gotIt: { flex: 1, minHeight: 38, borderRadius: 12, backgroundColor: '#EDF0FF', alignItems: 'center', justifyContent: 'center' }, later: { flex: 1, minHeight: 38, borderRadius: 12, borderWidth: 1, borderColor: '#E4E3E0', alignItems: 'center', justifyContent: 'center' }, laterText: { fontSize: 11, fontWeight: '600', color: '#292B35' },
  preferencesTitle: { fontSize: 15, fontWeight: '600', color: '#292B35', marginTop: 16, marginBottom: 10 }, preferences: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 14 }, preference: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 }, divider: { borderBottomWidth: 1, borderBottomColor: '#EFEEEB' }, preferenceTitle: { fontSize: 12, fontWeight: '600', color: '#292B35' }, small: { fontSize: 10, lineHeight: 15, color: '#7B7D87' },
  pressed: { opacity: 0.7 }, error: { fontSize: 12, color: '#9B3636', lineHeight: 18 },
});
