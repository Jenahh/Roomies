import { ChoreBadge } from '../../features/scheduler/ChorePresets';
import type { ChoreLook } from '../../data/chorePresets';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import type { ResidentData } from '../../hooks/useResidentData';
import { styles as s } from '../../styles/CalendarScreen.styles';

function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
const colors = { chore: '#70C99C', bill: '#F0B84E', event: '#7588ED' };
const backgrounds = { chore: '#EAF6EF', bill: '#FFF2DC', event: '#EDF0FF' };
type CalendarItem = { id: string; title: string; date: string; detail: string; kind: keyof typeof colors; look?: ChoreLook };
const iconPaths = { chore: 'M3 5h18M9 5V2h6v3M6 5l1 17h10l1-17M10 9v9M14 9v9', bill: 'M20 8V4H4v16h16v-8h-6V8h7v4M17 10h.01', event: 'M4 5h16v16H4zM8 2v6M16 2v6M4 10h16M8 14h.01M16 14h.01' };

export default function CalendarScreen({ data, setData, storageError }: { data: ResidentData; setData: Dispatch<SetStateAction<ResidentData>>; storageError: string }) {
  const today = dateKey(new Date());
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('');
  const [attendees, setAttendees] = useState('Everyone');
  const [error, setError] = useState('');
  const [detail, setDetail] = useState<CalendarItem | null>(null);
  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const items: CalendarItem[] = [
    ...data.chores.filter(item => !item.completed).map(item => ({ id: item.id, title: item.title, date: item.due, detail: [item.time, item.unassigned ? 'Unassigned' : item.assignee || data.name].filter(Boolean).join(' · '), look: item.look, kind: 'chore' as const })),
    ...data.expenses.filter(item => !item.settled).map(item => ({ id: item.id, title: item.title, date: item.due, detail: `Your share ${currency.format(item.amount)}`, kind: 'bill' as const })),
    ...data.events.map(item => ({ id: item.id, title: item.title, date: item.date, detail: [item.time, item.attendees || 'Everyone'].filter(Boolean).join(' · '), kind: 'event' as const })),
  ].sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
  const monthKey = dateKey(month).slice(0, 7);
  const visible = items.filter(item => selected ? item.date === selected : item.date.startsWith(monthKey) && (monthKey !== today.slice(0, 7) || item.date >= today));
  const gridStart = new Date(month); gridStart.setDate(1 - (month.getDay() + 6) % 7);
  const cellCount = Math.ceil(((month.getDay() + 6) % 7 + new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()) / 7) * 7;
  const cells = Array.from({ length: cellCount }, (_, index) => { const day = new Date(gridStart); day.setDate(gridStart.getDate() + index); return day; });
  function changeMonth(offset: number) { setMonth(new Date(month.getFullYear(), month.getMonth() + offset, 1)); setSelected(null); }
  function openAdd() { setTitle(''); setDate(selected || (monthKey === today.slice(0, 7) ? today : dateKey(month))); setTime(''); setAttendees('Everyone'); setError(''); setAdding(true); }
  function save() {
    if (!title.trim()) { setError('Enter an event title.'); return; }
    const parsed = new Date(date + 'T12:00:00');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || dateKey(parsed) !== date) { setError('Enter a valid date in YYYY-MM-DD format.'); return; }
    setData(previous => ({ ...previous, events: [...previous.events, { id: crypto.randomUUID(), title: title.trim(), date, time: time.trim(), attendees: attendees.trim() || 'Everyone' }] }));
    setMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1)); setSelected(date); setAdding(false);
  }
  return <>
    <View style={s.header}><View style={s.copy}><Text accessibilityRole="header" style={s.title}>Our calendar</Text><Text style={s.subtitle}>One home. Everyone in the loop.</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Add event" onPress={openAdd} style={s.add}><Text style={s.plus}>+</Text></Pressable></View>
    {!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}
    <View style={s.calendar}>
      <View style={s.monthHeader}><Pressable accessibilityRole="button" accessibilityLabel="Previous month" onPress={() => changeMonth(-1)} style={s.arrow}><Text style={s.arrowText}>‹</Text></Pressable><Text accessibilityRole="header" accessibilityLiveRegion="polite" style={s.monthTitle}>{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</Text><Pressable accessibilityRole="button" accessibilityLabel="Next month" onPress={() => changeMonth(1)} style={s.arrow}><Text style={s.arrowText}>›</Text></Pressable></View>
      <View style={s.grid}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <View key={index} style={s.weekday}><Text style={s.weekdayText}>{day}</Text></View>)}
        {cells.map(day => {
          const key = dateKey(day); const active = key === (selected || today); const outside = day.getMonth() !== month.getMonth();
          const kinds = (Object.keys(colors) as (keyof typeof colors)[]).filter(kind => items.some(item => item.date === key && item.kind === kind));
          return <Pressable key={key} accessibilityRole="button" accessibilityState={{ selected: selected === key }} accessibilityLabel={`${day.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}${key === today ? ', today' : ''}, ${items.filter(item => item.date === key).length} scheduled items`} onPress={() => { if (outside) setMonth(new Date(day.getFullYear(), day.getMonth(), 1)); setSelected(selected === key ? null : key); }} style={s.dayCell}><View style={[s.dayNumber, active && s.activeDay]}><Text style={[s.dayText, outside && s.outside, active && s.activeDayText]}>{day.getDate()}</Text></View><View style={s.dots}>{kinds.map(kind => <View key={kind} style={[s.dot, { backgroundColor: colors[kind] }]} />)}</View></Pressable>;
        })}
      </View>
    </View>
    <View style={s.legend}>{(['chore', 'bill', 'event'] as const).map(kind => <View key={kind} style={s.legendItem}><View style={[s.dot, { backgroundColor: colors[kind] }]} /><Text style={s.legendText}>{kind === 'chore' ? 'Chores' : kind === 'bill' ? 'Bills' : 'Events'}</Text></View>)}</View>
    <View style={s.section}><Text accessibilityRole="header" style={s.sectionTitle}>{selected ? new Date(selected + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Coming up'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Return to today" onPress={() => { const now = new Date(); setMonth(new Date(now.getFullYear(), now.getMonth(), 1)); setSelected(null); }} style={s.today}><Text style={s.link}>Today · {new Date(today + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Text></Pressable></View>
    <View style={s.list}>{visible.length ? visible.map(item => <Pressable key={`${item.kind}-${item.id}`} accessibilityRole="button" onPress={() => setDetail(item)} style={({ pressed }) => [s.item, pressed && s.pressed]}><View style={[s.dateBadge, { backgroundColor: backgrounds[item.kind] }]}><Text style={s.badgeMonth}>{new Date(item.date + 'T12:00:00').toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}</Text><Text style={s.badgeDay}>{Number(item.date.slice(8))}</Text></View><View style={s.copy}><Text style={s.itemTitle}>{item.title}</Text><Text style={s.subtitle}>{item.date === today ? 'Today' : new Date(item.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long' })}{item.detail ? ` · ${item.detail}` : ''}</Text></View>{item.kind === 'chore' ? <ChoreBadge look={item.look} title={item.title} /> : <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#737783" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPaths[item.kind]} /></svg>}</Pressable>) : <View style={s.empty}><Text style={s.itemTitle}>{selected ? 'A little space in your day' : 'Your calendar is clear'}</Text><Text style={s.subtitle}>No scheduled items {selected ? 'on this day' : 'coming up this month'}. Tap + to add an event.</Text></View>}</View>
    <Modal visible={adding || detail !== null} transparent animationType="fade" onRequestClose={() => { setAdding(false); setDetail(null); }}><View style={s.backdrop}><ScrollView style={s.modal} contentContainerStyle={s.form} keyboardShouldPersistTaps="handled">
      <Text accessibilityRole="header" style={s.sectionTitle}>{adding ? 'Add event' : detail?.title}</Text>
      {adding ? <><Text style={s.label}>Event title</Text><TextInput autoFocus accessibilityLabel="Event title" placeholder="e.g. House dinner" value={title} onChangeText={setTitle} style={s.input} /><Text style={s.label}>Date (YYYY-MM-DD)</Text><TextInput accessibilityLabel="Event date (YYYY-MM-DD)" value={date} onChangeText={setDate} style={s.input} /><Text style={s.label}>Time (optional)</Text><TextInput accessibilityLabel="Event time" placeholder="e.g. 7 pm" value={time} onChangeText={setTime} style={s.input} /><Text style={s.label}>Who’s coming?</Text><TextInput accessibilityLabel="Attendees" value={attendees} onChangeText={setAttendees} style={s.input} />{!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}<Pressable accessibilityRole="button" onPress={save} style={s.save}><Text style={s.saveText}>Save event</Text></Pressable></> : detail && <><Text style={s.subtitle}>{new Date(detail.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</Text><Text style={s.itemTitle}>{detail.detail}</Text><Text style={s.subtitle}>{detail.kind === 'event' ? 'Household event' : detail.kind === 'chore' ? 'Manage this task in Chores.' : 'Manage this payment in Expenses.'}</Text></>}
      <Pressable accessibilityRole="button" onPress={() => { setAdding(false); setDetail(null); }} style={s.close}><Text style={s.link}>{adding ? 'Cancel' : 'Close'}</Text></Pressable>
    </ScrollView></View></Modal>
  </>;
}
