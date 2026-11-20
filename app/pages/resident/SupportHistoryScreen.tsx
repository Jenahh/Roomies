import { useState, type Dispatch, type SetStateAction } from 'react';
import { Image, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { History, Wrench, MessageCircle, ChevronRight } from 'lucide-react';
import RoomiePet from '../../components/RoomiePet';
import type { ResidentData } from '../../hooks/useResidentData';
import { styles as s } from '../../styles/ProfileScreen.styles';
import './SupportHistoryScreen.css';
type Props = { data: ResidentData; setData: Dispatch<SetStateAction<ResidentData>>; storageError?: string; kind: 'maintenance' | 'ra'; onBack: () => void };
export default function SupportHistoryScreen({ data, setData, storageError, kind, onBack }: Props) {
  const [id, setId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notice, setNotice] = useState('');
  const maintenance = kind === 'maintenance';
  const requests = [...(data.supportDrafts || [])].filter(x => x.kind === kind).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  const selected = requests.find(x => x.id === id);
  const Icon = maintenance ? Wrench : MessageCircle;
  function reset() { setEditing(false); setConfirm(false); setNotice(''); }
  function save() {
    if (!selected) return;
    if (!title.trim() || !description.trim()) { setNotice('Please enter a title and description.'); return; }
    setData(previous => ({ ...previous, supportDrafts: (previous.supportDrafts || []).map(x => x.id === selected.id && x.kind === kind ? { ...x, title: title.trim(), description: description.trim() } : x) }));
    setEditing(false); setNotice('Changes updated.');
  }
  function remove() {
    if (!selected) return;
    setData(previous => ({ ...previous, supportDrafts: (previous.supportDrafts || []).filter(x => !(x.id === selected.id && x.kind === kind)) }));
    setId(null); reset();
  }
  function back() {
    if (selected) {
      setId(null);
      reset();
    } else {
      onBack();
    }
  }

  function edit() {
    if (!selected) return;
    setTitle(selected.title);
    setDescription(selected.description);
    reset();
    setEditing(true);
  }

  if (Platform.OS !== 'web') {
    return (
      <View style={s.card}>
        <Pressable accessibilityRole="button" onPress={back} style={s.edit}>
          <Text style={s.link}>{selected ? 'Back to history' : 'Back to profile'}</Text>
        </Pressable>
        <Text accessibilityRole="header" style={s.title}>{maintenance ? 'Request history' : 'Message history'}</Text>
        {!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}
        {selected ? <>
          <Text style={s.subtitle}>Draft · Not sent</Text>
          <Text style={s.subtitle}>{selected.category || 'Other'} · {new Date(selected.createdAt).toLocaleDateString()}</Text>
          {editing ? <>
            <Text style={s.label}>{maintenance ? 'Issue title' : 'Subject'}</Text>
            <TextInput accessibilityLabel={maintenance ? 'Issue title' : 'Subject'} value={title} onChangeText={setTitle} style={s.input} />
            <Text style={s.label}>Description</Text>
            <TextInput accessibilityLabel="Description" value={description} onChangeText={setDescription} multiline style={s.input} />
            <Pressable accessibilityRole="button" onPress={save} style={s.save}><Text style={s.saveText}>Save changes</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={reset} style={s.edit}><Text style={s.link}>Cancel</Text></Pressable>
          </> : <>
            <Text accessibilityRole="header" style={s.name}>{selected.title}</Text>
            <Text style={s.email}>{selected.description}</Text>
            {!!selected.photo && <Image accessibilityLabel="Attached maintenance photo" source={{ uri: selected.photo }} resizeMode="contain" style={{ height: 160 }} />}
            {confirm ? <>
              <Text style={s.sectionTitle}>Delete this draft?</Text>
              <Pressable accessibilityRole="button" onPress={remove} style={s.signOut}><Text style={s.signOutText}>Confirm deletion</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={reset} style={s.edit}><Text style={s.link}>Cancel</Text></Pressable>
            </> : <>
              <Pressable accessibilityRole="button" onPress={() => setNotice('Submission is not connected yet. Your draft has been kept.')} style={s.save}><Text style={s.saveText}>{maintenance ? 'Submit request' : 'Send message'}</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={edit} style={s.edit}><Text style={s.link}>Edit draft</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={() => { setNotice(''); setConfirm(true); }} style={s.edit}><Text style={s.error}>Delete draft</Text></Pressable>
            </>}
          </>}
          {!!notice && !storageError && <Text accessibilityLiveRegion="polite" style={s.subtitle}>{notice}</Text>}
        </> : requests.length ? requests.map(item => (
          <Pressable key={item.id} accessibilityRole="button" onPress={() => { reset(); setId(item.id); }} style={s.input}>
            <Text style={s.sectionTitle}>{item.title}</Text>
            <Text numberOfLines={2} style={s.subtitle}>{item.description}</Text>
            <Text style={s.subtitle}>Draft · {new Date(item.createdAt).toLocaleDateString()}</Text>
          </Pressable>
        )) : <Text style={s.subtitle}>No drafts yet.</Text>}
      </View>
    );
  }

  return <section className="support-history">
    <button className="history-back" onClick={back}>‹ {selected ? 'Back to history' : 'Back to profile'}</button>
    <div className="history-header"><RoomiePet role={maintenance ? 'property-manager' : 'assistant'} color={data.pet?.color} size={85}/><div><h2>{maintenance ? 'Request history' : 'Message history'}</h2><p>{maintenance ? 'Manage your maintenance drafts.' : 'Manage your RA message drafts.'}</p></div></div>
    {storageError && <p role="alert" className="history-error">{storageError}</p>}
    {selected ? <div className="history-details">
      <span className="history-status">Draft · Not sent</span><p className="history-meta">{selected.category || 'Other'} · {new Date(selected.createdAt).toLocaleDateString()}</p>
      {editing ? <><label htmlFor="draft-title">{maintenance ? 'Issue title' : 'Subject'}</label><input id="draft-title" value={title} onChange={e => setTitle(e.target.value)}/><label htmlFor="draft-description">Description</label><textarea id="draft-description" rows={5} value={description} onChange={e => setDescription(e.target.value)}/><button className="history-primary" onClick={save}>Save changes</button><button className="history-secondary" onClick={reset}>Cancel</button></> : <><h2>{selected.title}</h2><p className="history-description">{selected.description}</p>
      {selected.photo && <img className="history-photo" src={selected.photo} alt="Attached maintenance photo"/>}
      {!confirm ? <><button className="history-primary" onClick={() => setNotice('Submission is not connected yet. Your draft has been kept.')}>{maintenance ? 'Submit request' : 'Send message'}</button><button className="history-secondary" onClick={() => { setTitle(selected.title); setDescription(selected.description); reset(); setEditing(true); }}>Edit draft</button><button className="history-delete" onClick={() => { setNotice(''); setConfirm(true); }}>Delete draft</button></> : <div className="history-confirm"><strong>Delete this draft?</strong><p>This cannot be undone.</p><button className="history-delete" onClick={remove}>Confirm deletion</button><button className="history-secondary" onClick={reset}>Cancel</button></div>}</>}
      {notice && !storageError && <p role="status" className="history-meta">{notice}</p>}
    </div> : requests.length ? <div className="history-list">{requests.map(item => <button key={item.id} className="history-card" onClick={() => { reset(); setId(item.id); }}><div className="history-icon"><Icon size={22}/></div><div className="history-card-copy"><h3>{item.title}</h3><p className="history-preview">{item.description}</p><p className="history-meta">{item.category || 'Other'} · {new Date(item.createdAt).toLocaleDateString()}</p><span className="history-status">Draft</span></div><ChevronRight size={18}/></button>)}</div> : <div className="history-empty"><History size={26}/><h3>No drafts yet</h3><p>Your saved drafts will appear here.</p></div>}
  </section>;
}
