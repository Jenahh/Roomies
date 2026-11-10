import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import type { ResidentData, SupportDraft } from '../../hooks/useResidentData';
import { styles as s } from '../../styles/MaintenanceScreen.styles';

export default function MaintenanceScreen({ data, setData, storageError, onBack }: { data: ResidentData; setData: Dispatch<SetStateAction<ResidentData>>; storageError: string; onBack: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Plumbing');
  const [photo, setPhoto] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [all, setAll] = useState(false);
  const [selected, setSelected] = useState<SupportDraft | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const requests = [...(data.supportDrafts || [])].filter(item => item.kind === 'maintenance').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  function save() {
    if (!title.trim() || !description.trim()) { setError('Enter an issue title and description.'); return; }
    setData(previous => ({ ...previous, supportDrafts: [...(previous.supportDrafts || []), { id: crypto.randomUUID(), kind: 'maintenance', title: title.trim(), description: description.trim(), category, photo: photo || undefined, location: previous.household, createdAt: new Date().toISOString() }] }));
    setTitle(''); setDescription(''); setPhoto(''); setPhotoName(''); setError(''); setSaved(true);
    if (fileInput.current) fileInput.current.value = '';
  }
  function choosePhoto(file?: File) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 1024 * 1024) { setError('Choose a JPG, PNG, or WebP photo under 1 MB.'); if (fileInput.current) fileInput.current.value = ''; return; }
    setLoadingPhoto(true); setError('');
    const reader = new FileReader();
    reader.onload = () => { setPhoto(String(reader.result)); setPhotoName(file.name); setLoadingPhoto(false); };
    reader.onerror = () => { setError('This photo could not be read. Try another file.'); setLoadingPhoto(false); };
    reader.readAsDataURL(file);
  }
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel="Back to profile" onPress={onBack} style={s.backArrow}><Text style={s.backArrowText}>{'<'}</Text></Pressable>
    <View style={s.header}><View style={s.copy}><Text accessibilityRole="header" style={s.title}>Maintenance</Text><Text style={s.subtitle}>Let’s get your home feeling right.</Text></View><View style={s.tool}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#737783" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6 4-4a6 6 0 0 0-8 8L3 17a3 3 0 0 0 4 4l7-7a6 6 0 0 0 8-8l-4 4-4-4Z" /></svg></View></View>
    <View style={s.form}>
      <Text style={s.label}>Issue title · For property management</Text><TextInput accessibilityLabel="Issue title" value={title} onChangeText={value => { setTitle(value); setSaved(false); }} placeholder="e.g. Kitchen faucet is dripping" style={s.input} />
      <Text style={s.label}>Description · For property management</Text><TextInput accessibilityLabel="Issue description" multiline value={description} onChangeText={setDescription} placeholder="Describe the issue, where it is, and when it started." style={[s.input, s.description]} />
      <Text style={s.label}>Category</Text><select aria-label="Maintenance category" value={category} onChange={event => setCategory(event.target.value)} style={{ width: '100%', minHeight: 44, border: '1px solid #E4E3E0', borderRadius: 10, padding: '0 12px', background: '#FFFFFF', color: '#292B35', font: 'inherit', fontSize: 13 }}>{['Plumbing', 'Electrical', 'Heating & cooling', 'Appliances', 'Doors & locks', 'General repair', 'Other'].map(item => <option key={item}>{item}</option>)}</select>
      <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Attach maintenance photo" style={{ display: 'none' }} onChange={event => choosePhoto(event.target.files?.[0])} />
      <Pressable accessibilityRole="button" disabled={loadingPhoto} onPress={() => fileInput.current?.click()} style={s.photoButton}><Text style={s.photoText}>{loadingPhoto ? 'Loading photo…' : photo ? 'Change photo' : '＋ Add a photo'} <Text style={s.subtitle}>Optional</Text></Text></Pressable>
      {!!photo && <View style={s.photoCard}><Image source={{ uri: photo }} style={s.photo} resizeMode="contain" accessibilityLabel="Attached maintenance photo" /><Text style={s.subtitle}>{photoName}</Text><Pressable accessibilityRole="button" onPress={() => { setPhoto(''); setPhotoName(''); if (fileInput.current) fileInput.current.value = ''; }} style={s.back}><Text style={s.link}>Remove photo</Text></Pressable></View>}
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      {!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}
      {saved && !storageError && <Text accessibilityLiveRegion="polite" style={s.success}>Request draft saved on this device. Not sent to property management.</Text>}
      <Pressable accessibilityRole="button" disabled={loadingPhoto} onPress={save} style={({ pressed }) => [s.submit, (pressed || loadingPhoto) && s.pressed]}><Text style={s.submitText}>Save request draft</Text></Pressable>
    </View>
    <View style={s.section}><Text accessibilityRole="header" style={s.sectionTitle}>Household requests</Text><Pressable accessibilityRole="button" onPress={() => setAll(!all)} style={s.back}><Text style={s.link}>{all ? 'Show recent' : 'View all'}</Text></Pressable></View>
    <View style={s.requests}>{requests.length ? (all ? requests : requests.slice(0, 3)).map(item => <Pressable key={item.id} accessibilityRole="button" onPress={() => setSelected(item)} style={({ pressed }) => [s.request, pressed && s.pressed]}><Text style={s.requestTitle}>{item.title}</Text><Text style={s.status}>Draft</Text></Pressable>) : <View style={s.empty}><Text style={s.requestTitle}>No maintenance requests yet</Text><Text style={s.subtitle}>Saved issue drafts will appear here.</Text></View>}</View>
    <Modal visible={selected !== null} transparent animationType="fade" onRequestClose={() => setSelected(null)}><View style={s.backdrop}><ScrollView style={s.modal} contentContainerStyle={s.modalContent}>{selected && <><Text accessibilityRole="header" style={s.sectionTitle}>{selected.title}</Text><Text style={s.status}>Draft · Not sent</Text><Text style={s.subtitle}>{selected.category || 'General repair'} · {new Date(selected.createdAt).toLocaleDateString()}</Text>{!!selected.location && <Text style={s.subtitle}>{selected.location}</Text>}<Text style={s.detail}>{selected.description}</Text>{!!selected.photo && <Image source={{ uri: selected.photo }} style={s.photo} resizeMode="contain" accessibilityLabel="Request photo" />}<Pressable accessibilityRole="button" onPress={() => setSelected(null)} style={s.back}><Text style={s.link}>Close</Text></Pressable></>}</ScrollView></View></Modal>
  </>;
}
