import DashboardIcon from '../../components/dashboard/DashboardIcon';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import type { ResidentData, SupportDraft } from '../../hooks/useResidentData';
import { styles as s } from '../../styles/MaintenanceScreen.styles';

export default function ContactRAScreen({ data, setData, storageError, onBack }: { data: ResidentData; setData: Dispatch<SetStateAction<ResidentData>>; storageError: string; onBack: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General support');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [all, setAll] = useState(false);
  const [selected, setSelected] = useState<SupportDraft | null>(null);
  const requests = [...(data.supportDrafts || [])].filter(item => item.kind === 'ra').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  function save() {
    if (!title.trim() || !description.trim()) { setError('Enter a subject and describe the support you need.'); return; }
    setData(previous => ({ ...previous, supportDrafts: [...(previous.supportDrafts || []), { id: crypto.randomUUID(), kind: 'ra', title: title.trim(), description: description.trim(), category, location: previous.household, createdAt: new Date().toISOString() }] }));
    setTitle(''); setDescription(''); setError(''); setSaved(true);
  }
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel="Back to profile" onPress={onBack} style={s.backArrow}><Text style={s.backArrowText}>{'<'}</Text></Pressable>
    <View style={s.header}><View style={s.copy}><Text accessibilityRole="header" style={s.title}>Contact My RA</Text><Text style={s.subtitle}>Send a support request to your Resident Assistant.</Text></View><View style={s.tool}><DashboardIcon name="group" color="#737783" size={20} /></View></View>
    <View style={s.form}>
      <Text style={s.label}>Subject · For Resident Assistant</Text><TextInput accessibilityLabel="RA request subject" value={title} onChangeText={value => { setTitle(value); setSaved(false); }} placeholder="What would you like help with?" style={s.input} />
      <Text style={s.label}>Description · For Resident Assistant</Text><TextInput accessibilityLabel="RA request description" multiline value={description} onChangeText={value => { setDescription(value); setSaved(false); }} placeholder="Tell your RA what’s happening and how they can help." style={[s.input, s.description]} />
      <Text style={s.label}>Category</Text><select aria-label="RA request category" value={category} onChange={event => setCategory(event.target.value)} style={{ width: '100%', minHeight: 44, border: '1px solid #E4E3E0', borderRadius: 10, padding: '0 12px', background: '#FFFFFF', color: '#292B35', font: 'inherit', fontSize: 13 }}>{['General support', 'Roommate concerns', 'Community concerns', 'Wellbeing', 'Schedule a conversation', 'Other'].map(item => <option key={item}>{item}</option>)}</select>
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      {!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}
      {saved && !storageError && <Text accessibilityLiveRegion="polite" style={s.success}>Support request draft saved. It has not been sent to your RA.</Text>}
      <Pressable accessibilityRole="button" onPress={save} style={({ pressed }) => [s.submit, pressed && s.pressed]}><Text style={s.submitText}>Save support request draft</Text></Pressable>
    </View>
    <View style={s.section}><Text accessibilityRole="header" style={s.sectionTitle}>Your support requests</Text><Pressable accessibilityRole="button" onPress={() => setAll(!all)} style={s.back}><Text style={s.link}>{all ? 'Show recent' : 'View all'}</Text></Pressable></View>
    <View style={s.requests}>{requests.length ? (all ? requests : requests.slice(0, 3)).map(item => <Pressable key={item.id} accessibilityRole="button" onPress={() => setSelected(item)} style={({ pressed }) => [s.request, pressed && s.pressed]}><Text style={s.requestTitle}>{item.title}</Text><Text style={s.status}>Draft</Text></Pressable>) : <View style={s.empty}><Text style={s.requestTitle}>No support requests yet</Text><Text style={s.subtitle}>Your saved RA requests will appear here.</Text></View>}</View>
    <Modal visible={selected !== null} transparent animationType="fade" onRequestClose={() => setSelected(null)}><View style={s.backdrop}><ScrollView style={s.modal} contentContainerStyle={s.modalContent}>{selected && <><Text accessibilityRole="header" style={s.sectionTitle}>{selected.title}</Text><Text style={s.status}>Draft · Not sent</Text><Text style={s.subtitle}>{selected.category || 'General support'} · {new Date(selected.createdAt).toLocaleDateString()}</Text><Text style={s.detail}>{selected.description}</Text><Pressable accessibilityRole="button" onPress={() => setSelected(null)} style={s.back}><Text style={s.link}>Close</Text></Pressable></>}</ScrollView></View></Modal>
  </>;
}
