import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import type { ResidentData } from '../../hooks/useResidentData';
import RoomiePet from '../../components/RoomiePet';
import './MaintenanceScreen.css';
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
  </>;
}

