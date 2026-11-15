import { StyleSheet } from 'react-native';
import { backNavigationText } from './BackNavigation.styles';

export const styles = StyleSheet.create({
  // Profile entry card
  section: { marginTop: 26, gap: 12 },
  entry: { minHeight: 96, flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, gap: 14, backgroundColor: '#EDF0FF' },
  entryCopy: { flex: 1, gap: 4 },
  entryTitle: { fontSize: 15, fontWeight: '600', color: '#292B35' },
  entryPreview: { fontSize: 12, lineHeight: 18, color: '#606675' },
  unreadBadge: { minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, backgroundColor: '#4056DE', alignItems: 'center', justifyContent: 'center' },
  unreadText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  chevron: { fontSize: 22, color: '#4056DE' },

  // Conversation screen
  backArrow: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-start' },
  backArrowText: backNavigationText,
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  headerCopy: { flex: 1, gap: 2 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700', color: '#292B35', letterSpacing: -0.5 },
  subtitle: { fontSize: 12, lineHeight: 18, color: '#7B7D87' },
  messages: { flexGrow: 0, minHeight: 220, maxHeight: 400, borderRadius: 12, backgroundColor: '#FFFFFF' },
  messagesContent: { flexGrow: 1, padding: 14, gap: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 28 },
  emptyTitle: { fontSize: 14, fontWeight: '600', color: '#292B35' },
  emptyText: { fontSize: 12, lineHeight: 18, color: '#7B7D87', textAlign: 'center' },
  day: { alignSelf: 'center', fontSize: 10, fontWeight: '600', color: '#7B7D87', marginVertical: 6 },
  bubble: { maxWidth: '82%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  mine: { alignSelf: 'flex-end', backgroundColor: '#4056DE', borderBottomRightRadius: 4 },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#F1F1F4', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 13, lineHeight: 19, color: '#292B35' },
  mineText: { color: '#FFFFFF' },
  meta: { fontSize: 10, color: '#7B7D87', marginBottom: 4 },
  metaMine: { alignSelf: 'flex-end' },
  metaTheirs: { alignSelf: 'flex-start' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 12 },
  input: { flex: 1, minHeight: 44, maxHeight: 110, borderWidth: 1, borderColor: '#D7D9E1', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 11, fontSize: 13, lineHeight: 19, color: '#292B35', backgroundColor: '#FFFFFF' },
  send: { minHeight: 44, paddingHorizontal: 18, borderRadius: 14, backgroundColor: '#4056DE', alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { backgroundColor: '#B9C0E6' },
  sendText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  note: { fontSize: 11, lineHeight: 17, color: '#7B7D87', marginTop: 8 },
  error: { fontSize: 12, lineHeight: 18, color: '#9B3636', marginTop: 8 },
  pressed: { opacity: 0.7 },
});
