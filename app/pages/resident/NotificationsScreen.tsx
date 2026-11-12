import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';

import type { ResidentData } from '../../hooks/useResidentData';
import RoomiePet from '../../components/RoomiePet';
import { getPetMood } from '../../data/roomiePetMood';
import { getPetAccessoryIds } from '../../data/roomiePetAccessories';
import { styles as s } from '../../styles/NotificationsScreen.styles';

function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export default function NotificationsScreen({ data, setData, storageError, onBack }: { data: ResidentData; setData: Dispatch<SetStateAction<ResidentData>>; storageError: string; onBack: () => void }) {
  const [now, setNow] = useState(() => new Date());
  const [message, setMessage] = useState('');
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 30000); return () => window.clearInterval(timer); }, []);
  const preferences = data.notificationPreferences || { choresAndBills: true, events: true, quietHours: true };
  const petMood = getPetMood(data, now);
  const today = dateKey(now);
  const end = new Date(now); end.setDate(end.getDate() + 7);
  const dateLabel = (value: string) => value === today ? 'today' : new Date(value + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const reminders = [
    ...(preferences.choresAndBills ? data.chores.filter(item => !item.completed && (!item.assignee || item.assignee === data.name) && item.due <= dateKey(end)).map(item => ({ id: `chore:${item.id}:${item.due}`, date: item.due, title: 'A fresh start', body: `${item.title} is ${item.due < today ? 'overdue' : `due ${dateLabel(item.due)}`}${item.time ? `, ${item.time}` : ''}. You've got this!`, color: '#EDF0FF' })) : []),
    ...(preferences.choresAndBills ? data.expenses.filter(item => !item.settled && item.due <= dateKey(end)).map(item => ({ id: `bill:${item.id}:${item.due}`, date: item.due, title: 'Shared bills, sorted', body: `Your ${currency.format(item.amount)} share for ${item.title}${item.paidBy ? ` is owed to ${item.paidBy}` : ''}${item.due < today ? ' and is overdue' : ` is due ${dateLabel(item.due)}`}. Thanks for keeping it fair!`, color: '#FFF2DC' })) : []),
    ...(preferences.events ? data.events.filter(item => item.date >= today && item.date <= dateKey(end)).map(item => ({ id: `event:${item.id}:${item.date}`, date: item.date, title: 'Good food, good company', body: `${item.title} is ${dateLabel(item.date)}${item.time ? ` at ${item.time}` : ''}. ${item.attendees || 'Everyone'} is invited.`, color: '#F2EDFF' })) : []),
  ].sort((a, b) => a.date.localeCompare(b.date));
  const visible = reminders.filter(item => !data.reminderState?.[item.id]?.snoozedUntil || new Date(data.reminderState[item.id].snoozedUntil!).getTime() <= now.getTime());
  const unread = visible.filter(item => !data.reminderState?.[item.id]?.read).length;
  function markRead(ids: string[]) {
    setData(previous => { const state = { ...previous.reminderState }; ids.forEach(id => { state[id] = { ...state[id], read: true }; }); return { ...previous, reminderState: state }; });
  }
  function snooze(id: string) {
    setData(previous => ({ ...previous, reminderState: { ...previous.reminderState, [id]: { read: false, snoozedUntil: new Date(Date.now() + 3600000).toISOString() } } }));
    setMessage('We’ll show this reminder again in one hour.');
  }
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel="Back to home" onPress={onBack} style={s.back}><Text style={s.backText}>{'<'}</Text></Pressable>
    <View style={s.header}><View style={s.copy}><Text accessibilityRole="header" style={s.title}>Your reminders</Text></View><View style={s.bell}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555B69" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 8 3 8 3 10H3c0-2 3-2 3-10M10 22h4" /></svg></View></View>
    <View style={s.section}><Text style={s.sectionTitle}>Today · {unread} unread</Text><Pressable accessibilityRole="button" disabled={!unread} onPress={() => markRead(visible.map(item => item.id))} style={s.textButton}><Text style={[s.link, !unread && s.muted]}>Mark all as read</Text></Pressable></View>
    {!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}
    {!!message && <Text accessibilityLiveRegion="polite" style={s.subtitle}>{message}</Text>}
    <View style={s.list}>{visible.map(item => { const read = data.reminderState?.[item.id]?.read; return <View key={item.id} style={s.card}><View style={s.cardHeading}><Text style={s.cardTitle}>{item.title}</Text>{!read && <View accessibilityLabel="Unread" style={s.unread} />}</View><View style={s.reminderBody}><View style={[s.petCircle, { backgroundColor: item.color }]}><RoomiePet color={data.pet?.color} mood={petMood} accessories={getPetAccessoryIds(data.pet)} accessoryColors={data.pet?.accessoryColors} size={30} accessibilityLabel="Roomie Pet reminder" /></View><Text style={s.body}>{item.body}</Text></View><View style={s.actions}><Pressable accessibilityRole="button" accessibilityLabel={`Acknowledge ${item.body}`} onPress={() => markRead([item.id])} style={({ pressed }) => [s.gotIt, pressed && s.pressed]}><Text style={s.link}>{read ? 'Got it ✓' : 'Got it'}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Remind me in one hour: ${item.body}`} onPress={() => snooze(item.id)} style={({ pressed }) => [s.later, pressed && s.pressed]}><Text style={s.laterText}>Remind Me Later</Text></Pressable></View></View>; })}{!visible.length && <View style={s.card}><Text style={s.cardTitle}>You’re all caught up</Text><Text style={s.body}>Reminders for your chores, bills, and household events will appear here as they come up.</Text></View>}</View>
    <Text accessibilityRole="header" style={s.preferencesTitle}>Your notification preferences</Text><View style={s.preferences}>{([{ key: 'choresAndBills', title: 'Chores & bills', description: 'Timely nudges before things are due' }, { key: 'events', title: 'Household events', description: 'A heads-up for your shared plans' }, { key: 'quietHours', title: 'Quiet hours', description: 'Pause notification alerts · 11 pm–8 am' }] as const).map((item, index) => <View key={item.key} style={[s.preference, index < 2 && s.divider]}><View style={s.copy}><Text style={s.preferenceTitle}>{item.title}</Text><Text style={s.small}>{item.description}</Text></View><Switch accessibilityLabel={item.title} value={preferences[item.key]} onValueChange={value => setData(previous => ({ ...previous, notificationPreferences: { choresAndBills: true, events: true, quietHours: true, ...previous.notificationPreferences, [item.key]: value } }))} trackColor={{ false: '#D7D9E1', true: '#657EEA' }} thumbColor="#FFFFFF" /></View>)}</View>
  </>;
}
