import RoomiePet from '../../components/RoomiePet';
import './MaintenanceScreen.css';
import { randomUUID } from '../../utils/randomUUID';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import type { ResidentData } from '../../hooks/useResidentData';
import { styles as s } from '../../styles/MaintenanceScreen.styles';

export default function ContactRAScreen({ setData, storageError, onBack, initialCategory = 'General support' }: { data: ResidentData; setData: Dispatch<SetStateAction<ResidentData>>; storageError: string; onBack: () => void; initialCategory?: string }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const category = initialCategory;
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  function sendMessage() {
    setSaved(false);
    if (!title.trim() || !description.trim()) { setError('Enter a subject and description.'); return; }
    setError('Sending to your RA is not connected yet. You can save as a draft.');
  }
  function save() {
    if (!title.trim() || !description.trim()) { setError('Enter a subject and describe the support you need.'); return; }
    setData(previous => ({ ...previous, supportDrafts: [...(previous.supportDrafts || []), { id: randomUUID(), kind: 'ra', title: title.trim(), description: description.trim(), category, location: previous.household, createdAt: new Date().toISOString() }] }));
    setTitle(''); setDescription(''); setError(''); setSaved(true);
  }
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel="Back to profile" onPress={onBack} style={s.backArrow}><Text style={s.backArrowText}>{'<'}</Text></Pressable>
    <View style={s.header}>
      {Platform.OS === 'web' ? (
        <div key={saved && !storageError ? 'saved' : 'ready'} className="maintenance-mascot">
          <RoomiePet role="assistant" size={95} />
        </div>
      ) : <RoomiePet role="assistant" size={95} />}
      <View style={s.copy}>
        <Text accessibilityRole="header" style={s.title}>{saved && !storageError ? 'Draft saved, Roomie!' : 'Hey, Roomie!'}</Text>
        <Text style={s.subtitle}>{saved && !storageError ? 'Your support request is saved.' : 'Let’s talk about what’s happening.'}</Text>
      </View>
    </View>
    <View style={s.form}>
      <Text style={{ alignSelf: 'flex-start', backgroundColor: '#EDEEFF', color: '#5366BC', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, fontSize: 14, fontWeight: '600' }}>{category}</Text>
      <Text style={s.label}>Subject</Text><TextInput accessibilityLabel="RA request subject" value={title} onChangeText={value => { setTitle(value); setSaved(false); }} placeholder="What would you like help with?" style={s.input} />
      <Text style={s.label}>Description</Text><TextInput accessibilityLabel="RA request description" multiline value={description} onChangeText={value => { setDescription(value); setSaved(false); }} placeholder="Tell your RA what’s happening and how they can help." style={[s.input, s.description]} />

      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      {!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}
      {saved && !storageError && <Text accessibilityLiveRegion="polite" style={s.success}>Support request draft saved. It has not been sent to your RA.</Text>}
      <Pressable accessibilityRole="button" onPress={sendMessage} style={({ pressed }) => [s.submit, pressed && s.pressed]}>
        <Text style={s.submitText}>Send message</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={save} style={({ pressed }) => [s.submit, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D5D9EF' }, pressed && s.pressed]}>
        <Text style={[s.submitText, { color: '#5366BC' }]}>Save as draft</Text>
      </Pressable>
    </View>
  </>;
}
