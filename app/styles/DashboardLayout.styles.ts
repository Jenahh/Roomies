import { StyleSheet } from 'react-native';
import { backNavigationText } from './BackNavigation.styles';

export const dashboardLayout = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F6' },
  shell: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center' },
  page: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 30, paddingBottom: 32 },
  title: { fontSize: 28, lineHeight: 36, fontWeight: '800', letterSpacing: -0.6, color: '#292B35' },
  subtitle: { fontSize: 12, lineHeight: 20, color: '#7B7D87', marginTop: 2 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 4, marginBottom: 8 },
  sectionTitle: { fontSize: 16, lineHeight: 24, fontWeight: '600', color: '#292B35' },
  linkButton: { minHeight: 36, justifyContent: 'center' },
  link: { fontSize: 11, fontWeight: '500', color: '#4056DE' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  pressed: { opacity: 0.65 },
  back: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  backText: backNavigationText,
  backdrop: { flex: 1, backgroundColor: 'rgba(30,32,42,0.35)', alignItems: 'center', justifyContent: 'center', padding: 24 },
});
