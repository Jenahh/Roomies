import { backNavigationText } from './BackNavigation.styles';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  back: { width: 44, height: 40, justifyContent: 'center' }, backText: backNavigationText,
  title: { fontSize: 27, fontWeight: '700', color: '#292B35', marginBottom: 5 }, subtitle: { fontSize: 11, lineHeight: 17, color: '#7B7D87' },
  petImage: { width: 120, height: 120 },
  petPreview: { width: 120, height: 140, justifyContent: 'flex-end', position: 'relative' },
  bowOverlay: { position: 'absolute', width: 29, height: 24, top: 31, right: 29 },
  sproutOverlay: { position: 'absolute', width: 28, height: 34, top: 5, left: 47 },
  preview: { backgroundColor: '#EDF0FF', borderRadius: 20, alignItems: 'center', padding: 18, marginTop: 14, gap: 8 }, previewLabel: { fontSize: 11, color: '#385B49', backgroundColor: '#EAF6EF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  label: { fontSize: 12, fontWeight: '600', color: '#292B35', marginTop: 14, marginBottom: 8 },
  colors: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 }, colorOption: { alignItems: 'center', gap: 6, flex: 1 }, swatch: { width: 40, height: 40, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' }, selected: { borderColor: '#4056DE' }, check: { color: '#292B35', fontSize: 18 }, small: { fontSize: 9, color: '#7B7D87', lineHeight: 14 },
  nameField: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E3E0', borderRadius: 10, paddingHorizontal: 12 }, nameInput: { flex: 1, minHeight: 44, color: '#292B35', fontSize: 13 },
  accessories: { flexDirection: 'row', gap: 8 }, accessory: { flex: 1, minHeight: 92, borderWidth: 1, borderColor: '#E4E3E0', borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', gap: 3 }, selectedAccessory: { borderColor: '#657EEA', backgroundColor: '#EDF0FF' }, accessoryIcon: { fontSize: 23, color: '#737783' }, accessoryName: { fontSize: 10, fontWeight: '600', color: '#292B35' },
  points: { backgroundColor: '#F2EDFF', paddingHorizontal: 14, paddingBottom: 14, borderRadius: 16, marginVertical: 12 }, save: { minHeight: 48, borderRadius: 14, backgroundColor: '#657EEA', alignItems: 'center', justifyContent: 'center' }, saveText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' }, pressed: { opacity: 0.7 }, error: { fontSize: 12, color: '#9B3636', marginBottom: 10 }, success: { fontSize: 12, color: '#28734E', marginBottom: 10 },
});
