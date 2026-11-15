import { backNavigationText } from './BackNavigation.styles';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  back: { width: 44, height: 40, justifyContent: 'center' }, backText: backNavigationText,
  preview: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#EDF0FF', borderRadius: 12, padding: 12, marginTop: 8 },
  petPreview: { flex: 1, height: 240, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  colors: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 8 }, colorOption: { alignItems: 'center', justifyContent: 'center' }, swatch: { width: 38, height: 38, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' }, selected: { borderColor: '#4056DE' }, check: { color: '#292B35', fontSize: 18 },
  nameField: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E3E0', borderRadius: 8, paddingHorizontal: 12, marginTop: 12 }, nameInput: { flex: 1, minHeight: 44, color: '#292B35', fontSize: 13, textAlign: 'left' },
  accessories: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 14 }, accessory: { width: '30%', aspectRatio: 1, borderWidth: 1, borderColor: '#E4E3E0', borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 8, position: 'relative' }, accessoryImage: { width: '75%', height: '75%' }, equippedBadge: { position: 'absolute', right: 2, bottom: 1 }, lockBadge: { position: 'absolute', top: 4, right: 4, borderRadius: 10, backgroundColor: '#FFFFFF', paddingHorizontal: 3 }, lockText: { fontSize: 10 }, selectedAccessory: { borderColor: '#657EEA', backgroundColor: '#EDF0FF' }, lockedAccessory: { opacity: 0.55 },
  save: { minHeight: 48, borderRadius: 14, backgroundColor: '#657EEA', alignItems: 'center', justifyContent: 'center', marginTop: 14 }, saved: { backgroundColor: '#42A779' }, saveText: { color: '#FFFFFF', fontSize: 22, fontWeight: '600' }, pressed: { opacity: 0.7 }, error: { fontSize: 12, color: '#9B3636', marginBottom: 10 },
});
