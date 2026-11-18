import { backNavigationText } from './BackNavigation.styles';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F6' },
  page: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  back: { width: 32, minHeight: 44, justifyContent: 'center' },
  backText: backNavigationText,
  logo: { width: 38, height: 38 },
  wordmark: { fontSize: 24, fontWeight: '800', color: '#292B35' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 32, gap: 28 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '800', color: '#292B35', textAlign: 'left', letterSpacing: -0.5 },
  note: { fontSize: 14, lineHeight: 22, color: '#7B7D87', textAlign: 'left', maxWidth: 320 },
  continueButton: { minHeight: 52, borderRadius: 16, backgroundColor: '#C9D2FF', alignItems: 'center', justifyContent: 'center' },
  continueText: { fontSize: 15, fontWeight: '700', color: '#263350' },
  pressed: { opacity: 0.8 },
});
