import { randomUUID } from '../../utils/randomUUID';
import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import type { ResidentData } from '../../hooks/useResidentData';
import RoomiePet from '../../components/RoomiePet';
import './MaintenanceScreen.css';
import { Image, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import DashboardIcon from '../../components/dashboard/DashboardIcon';
import type { ResidentData, SupportDraft } from '../../hooks/useResidentData';
import { styles as s } from '../../styles/MaintenanceScreen.styles';

export default function MaintenanceScreen({ setData, storageError, onBack, initialCategory = 'Plumbing' }: { data: ResidentData; setData: Dispatch<SetStateAction<ResidentData>>; storageError: string; onBack: () => void; initialCategory?: string }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const category = initialCategory;
  const examples: Record<string, string> = {
    'Plumbing': 'e.g. Kitchen faucet is dripping',
    'Electrical': 'e.g. Bedroom light is not working',
    'Heating & cooling': 'e.g. AC is not cooling',
    'Appliances': 'e.g. Refrigerator is not working',
    'Doors & locks': 'e.g. Front door lock is stuck',
    'General repair': 'e.g. Kitchen cabinet is broken',
  };
  const titlePlaceholder = examples[category] || 'Briefly describe the issue';
  const [photo, setPhoto] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  function submitRequest() {
    setSaved(false);
    if (!title.trim() || !description.trim()) { setError('Enter an issue title and description.'); return; }
    setError('Sending to property management is not connected yet. You can save as a draft.');
  }
  function save() {
    if (!title.trim() || !description.trim()) { setError('Enter an issue title and description.'); return; }
    setData(previous => ({ ...previous, supportDrafts: [...(previous.supportDrafts || []), { id: randomUUID(), kind: 'maintenance', title: title.trim(), description: description.trim(), category, photo: photo || undefined, location: previous.household, createdAt: new Date().toISOString() }] }));
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
    <View style={s.header}>
      <div key={saved ? 'saved' : 'ready'} className="maintenance-mascot">
        <RoomiePet role="property-manager" size={95} />
      </div>
      <View style={s.copy}>
        <Text accessibilityRole="header" style={s.title}>{saved && !storageError ? 'All done, Roomie!' : 'Let’s get that fixed!'}</Text>
        <Text style={s.subtitle}>{saved && !storageError ? 'Your request draft is saved.' : 'Tell me a little more about what’s happening.'}</Text>
      </View>
    </View>
    <View style={s.form}>
      <Text style={{ alignSelf: 'flex-start', backgroundColor: '#EDEEFF', color: '#5366BC', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, fontSize: 14, fontWeight: '600' }}>{category}</Text>
      <Text style={s.label}>Issue title</Text>
      <TextInput accessibilityLabel="Issue title" value={title} onChangeText={value => { setTitle(value); setSaved(false); }} placeholder={titlePlaceholder} style={s.input} />
      <Text style={s.label}>Description</Text>
      <TextInput accessibilityLabel="Issue description" multiline value={description} onChangeText={value => { setDescription(value); setSaved(false); }} placeholder="Describe the issue, where it is, and when it started." style={[s.input, s.description]} />
      <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Attach maintenance photo" style={{ display: 'none' }} onChange={event => choosePhoto(event.target.files?.[0])} />
      <Pressable accessibilityRole="button" disabled={loadingPhoto} onPress={() => fileInput.current?.click()} style={s.photoButton}><Text style={s.photoText}>{loadingPhoto ? 'Loading photo…' : photo ? 'Change photo' : '＋ Add a photo'} <Text style={s.subtitle}>Optional</Text></Text></Pressable>
    <View style={s.header}><View style={s.copy}><Text accessibilityRole="header" style={s.title}>Maintenance</Text><Text style={s.subtitle}>Let’s get your home feeling right.</Text></View><View style={s.tool}><DashboardIcon name="wrench" color="#737783" size={20} /></View></View>
    <View style={s.form}>
      <Text style={s.label}>Issue title · For property management</Text><TextInput accessibilityLabel="Issue title" value={title} onChangeText={value => { setTitle(value); setSaved(false); }} placeholder="e.g. Kitchen faucet is dripping" style={s.input} />
      <Text style={s.label}>Description · For property management</Text><TextInput accessibilityLabel="Issue description" multiline value={description} onChangeText={setDescription} placeholder="Describe the issue, where it is, and when it started." style={[s.input, s.description]} />
      <Text style={s.label}>Category</Text><View style={s.categories}>{['Plumbing', 'Electrical', 'Heating & cooling', 'Appliances', 'Doors & locks', 'General repair', 'Other'].map(item => <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: category === item }} onPress={() => setCategory(item)} style={[s.category, category === item && s.activeCategory]}><Text style={s.link}>{item}</Text></Pressable>)}</View>
      {Platform.OS === 'web' && <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Attach maintenance photo" style={{ display: 'none' }} onChange={event => choosePhoto(event.target.files?.[0])} />}
      {Platform.OS === 'web' && <Pressable accessibilityRole="button" disabled={loadingPhoto} onPress={() => fileInput.current?.click()} style={s.photoButton}><Text style={s.photoText}>{loadingPhoto ? 'Loading photo…' : photo ? 'Change photo' : '＋ Add a photo'} <Text style={s.subtitle}>Optional</Text></Text></Pressable>}
      {!!photo && <View style={s.photoCard}><Image source={{ uri: photo }} style={s.photo} resizeMode="contain" accessibilityLabel="Attached maintenance photo" /><Text style={s.subtitle}>{photoName}</Text><Pressable accessibilityRole="button" onPress={() => { setPhoto(''); setPhotoName(''); if (fileInput.current) fileInput.current.value = ''; }} style={s.back}><Text style={s.link}>Remove photo</Text></Pressable></View>}
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      {!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}
      {saved && !storageError && <Text accessibilityLiveRegion="polite" style={s.success}>Request draft saved on this device. Not sent to property management.</Text>}
      <Pressable accessibilityRole="button" disabled={loadingPhoto} onPress={submitRequest} style={({ pressed }) => [s.submit, (pressed || loadingPhoto) && s.pressed]}>
        <Text style={s.submitText}>Submit request</Text>
      </Pressable>
      <Pressable accessibilityRole="button" disabled={loadingPhoto} onPress={save} style={({ pressed }) => [s.submit, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D5D9EF' }, (pressed || loadingPhoto) && s.pressed]}>
        <Text style={[s.submitText, { color: '#5366BC' }]}>Save as draft</Text>
      </Pressable>
    </View>
    <View style={s.section}><Text accessibilityRole="header" style={s.sectionTitle}>Household requests</Text><Pressable accessibilityRole="button" onPress={() => setAll(!all)} style={s.back}><Text style={s.link}>{all ? 'Show recent' : 'View all'}</Text></Pressable></View>
    <View style={s.requests}>{requests.length ? (all ? requests : requests.slice(0, 3)).map(item => <Pressable key={item.id} accessibilityRole="button" onPress={() => setSelected(item)} style={({ pressed }) => [s.request, pressed && s.pressed]}><Text style={s.requestTitle}>{item.title}</Text><Text style={s.status}>Draft</Text></Pressable>) : <View style={s.empty}><Text style={s.requestTitle}>No maintenance requests yet</Text><Text style={s.subtitle}>Saved issue drafts will appear here.</Text></View>}</View>
    <Modal visible={selected !== null} transparent animationType="fade" onRequestClose={() => setSelected(null)}><View style={s.backdrop}><ScrollView showsVerticalScrollIndicator={false} style={s.modal} contentContainerStyle={s.modalContent}>{selected && <><Text accessibilityRole="header" style={s.sectionTitle}>{selected.title}</Text><Text style={s.status}>Draft · Not sent</Text><Text style={s.subtitle}>{selected.category || 'General repair'} · {new Date(selected.createdAt).toLocaleDateString()}</Text>{!!selected.location && <Text style={s.subtitle}>{selected.location}</Text>}<Text style={s.detail}>{selected.description}</Text>{!!selected.photo && <Image source={{ uri: selected.photo }} style={s.photo} resizeMode="contain" accessibilityLabel="Request photo" />}<Pressable accessibilityRole="button" onPress={() => setSelected(null)} style={s.back}><Text style={s.link}>Close</Text></Pressable></>}</ScrollView></View></Modal>
  </>;
}

