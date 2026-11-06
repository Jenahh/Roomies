import { useState, type Dispatch, type SetStateAction } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';

import type { ResidentData } from '../../hooks/useResidentData';
import { styles as s } from '../../styles/ChoresScreen.styles';

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function ChoresScreen({ data, setData, storageError }: {
  data: ResidentData; setData: Dispatch<SetStateAction<ResidentData>>; storageError: string;
}) {
  const [filter, setFilter] = useState('All Chores');
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState(dateKey(new Date()));
  const [assignee, setAssignee] = useState(data.name);
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() + 6) % 7);
  const end = new Date(start); end.setDate(start.getDate() + 6);
  const weekly = data.chores.filter(chore => chore.due >= dateKey(start) && chore.due <= dateKey(end));
  const completed = weekly.filter(chore => chore.completed).length;
  const remaining = weekly.length - completed;
  const mine = (name?: string) => !name || name === data.name;
  const visible = [...data.chores].filter(chore => filter === 'Completed' ? chore.completed : !chore.completed && (filter !== 'My Chores' || mine(chore.assignee))).sort((a, b) => a.due.localeCompare(b.due));
  const points = data.chores.filter(chore => chore.completed && mine(chore.assignee)).length * 10;
  const format = (date: Date) => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  function save() {
    const parsed = new Date(due + 'T12:00:00');
    if (!title.trim()) { setError('Enter a chore title.'); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(due) || !Number.isFinite(parsed.getTime()) || dateKey(parsed) !== due) { setError('Enter a valid date in YYYY-MM-DD format.'); return; }
    setData(previous => ({ ...previous, chores: [...previous.chores, { id: crypto.randomUUID(), title: title.trim(), due, completed: false, assignee: assignee.trim() || data.name, time: time.trim() }] }));
    setAdding(false);
  }

  return <>
    <View style={s.header}>
      
      <View style={s.copy}><Text accessibilityRole="header" style={s.title}>Chores</Text><Text style={s.subtitle}>{data.household || 'Your household'} · {format(start)}–{format(end)}</Text></View>
    </View>
    {!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}
    <View style={s.progressCard}>
      <View style={s.row}><Text style={s.cardTitle}>A fresher home, together</Text><Text style={s.count}>{completed} / {weekly.length}</Text></View>
      <View accessibilityRole="progressbar" accessibilityLabel="Chores completed this week" accessibilityValue={{ min: 0, max: weekly.length || 1, now: completed }} style={s.track}><View style={[s.fill, { width: `${weekly.length ? completed / weekly.length * 100 : 0}%` }]} /></View>
      <Text style={s.caption}>{weekly.length ? remaining ? `${remaining} little ${remaining === 1 ? 'task' : 'tasks'} left. Every bit helps.` : 'All done this week. Great teamwork!' : 'Add your first chore. Every bit helps.'}</Text>
    </View>
    <View accessibilityRole="tablist" accessibilityLabel="Chore filters" style={s.filters}>{['My Chores', 'All Chores', 'Completed'].map(item => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: filter === item }} onPress={() => setFilter(item)} style={[s.filter, filter === item && s.selectedFilter]}><Text style={[s.filterText, filter === item && s.selectedText]}>{item}</Text></Pressable>)}</View>
    <View style={s.section}><Text accessibilityRole="header" style={s.sectionTitle}>{filter === 'Completed' ? 'Completed chores' : 'Your chore list'}</Text><Text style={s.upcoming}>{visible.length} {filter === 'Completed' ? 'completed' : 'upcoming'}</Text></View>
    <View style={s.list}>
      {!visible.length && <View style={s.empty}><Text style={s.cardTitle}>{filter === 'Completed' ? 'A little effort goes a long way' : 'A little room to breathe'}</Text><Text style={s.caption}>{filter === 'Completed' ? 'Chores you complete will appear here.' : filter === 'My Chores' ? 'No chores assigned to you. Add one to get started.' : 'Your chore list is clear. Add a task for your household.'}</Text></View>}
      {visible.map((chore, index) => {
        const own = mine(chore.assignee);
        const name = chore.assignee || data.name;
        const initials = name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
        const day = chore.due === dateKey(now) ? 'Today' : new Date(chore.due + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        return <Pressable key={chore.id} accessibilityRole="checkbox" accessibilityState={{ checked: chore.completed }} accessibilityLabel={`${chore.title}, ${name}, ${day}`} onPress={() => setData(previous => ({ ...previous, chores: previous.chores.map(item => item.id === chore.id ? { ...item, completed: !item.completed } : item) }))} style={({ pressed }) => [s.chore, pressed && s.pressed]}>
          <View style={[s.checkbox, (own || chore.completed) && s.blueBorder, chore.completed && s.checked]}>{chore.completed && <Text style={s.check}>✓</Text>}</View>
          <View style={s.copy}><Text style={[s.choreTitle, chore.completed && s.completed]}>{chore.title}</Text><View style={s.details}><View style={[s.avatar, { backgroundColor: ['#F1EBFF', '#FFF2DC', '#EAF6EF'][index % 3] }]}><Text style={s.initials}>{initials}</Text></View><Text style={s.detailText}>{name}{own ? ' (you)' : ''} · {day}{chore.time ? `, ${chore.time}` : ''}</Text></View></View>
          {own && <Text style={s.badge}>Yours</Text>}
        </Pressable>;
      })}
    </View>
    <View style={s.pointsCard}><View style={s.copy}><Text style={s.cardTitle}>Your Roomie points</Text><Text style={s.subtitle}>+10 points per assigned chore completed</Text></View><Text style={s.points}>{points} pts</Text></View>
    <Pressable accessibilityRole="button" onPress={() => { setTitle(''); setDue(dateKey(new Date())); setAssignee(data.name); setTime(''); setError(''); setAdding(true); }} style={({ pressed }) => [s.addButton, pressed && s.pressed]}><Text style={s.addText}>＋ Add chore</Text></Pressable>
    <Modal visible={adding} transparent animationType="fade" onRequestClose={() => setAdding(false)}><View style={s.backdrop}><View style={s.form}>
      <Text accessibilityRole="header" style={s.sectionTitle}>Add chore</Text>
      <Text style={s.cardTitle}>Chore title</Text><TextInput autoFocus accessibilityLabel="Chore title" placeholder="e.g. Take out trash" value={title} onChangeText={setTitle} style={s.input} />
      <Text style={s.cardTitle}>Assigned to</Text><TextInput accessibilityLabel="Assigned to" value={assignee} onChangeText={setAssignee} style={s.input} />
      <Text style={s.cardTitle}>Due date (YYYY-MM-DD)</Text><TextInput accessibilityLabel="Due date (YYYY-MM-DD)" value={due} onChangeText={setDue} style={s.input} />
      <Text style={s.cardTitle}>Time (optional)</Text><TextInput accessibilityLabel="Time (optional)" placeholder="e.g. 8 pm" value={time} onChangeText={setTime} style={s.input} />
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      <Pressable accessibilityRole="button" onPress={save} style={s.addButton}><Text style={s.addText}>Save chore</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={() => setAdding(false)} style={s.cancel}><Text style={s.upcoming}>Cancel</Text></Pressable>
    </View></View></Modal>
  </>;
}
