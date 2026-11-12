import { addDays, choreDates, planChoreOccurrences, DEFAULT_CHORE_MINUTES, suggestAssignee, weeklyWorkload, type SchedulerMember } from '../../features/scheduler/scheduler';
import { resolveChoreLook, type ChoreLook } from '../../data/chorePresets';
import { ChoreBadge, ChorePresets } from '../../features/scheduler/ChorePresets';
import ChorePet, { chorePetPrompt } from './ChorePet';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import type { ResidentData } from '../../hooks/useResidentData';
import { styles as s } from '../../styles/ChoresScreen.styles';

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function ChoresScreen({ data, setData, storageError, onPet, assignedHousehold }: {
  data: ResidentData; setData: Dispatch<SetStateAction<ResidentData>>; storageError: string; onPet?: () => void;
  assignedHousehold?: { name: string; roommates: { id: string; name: string }[] };
}) {
  const [celebration, setCelebration] = useState<ResidentData['chores'][number] | null>(null);
  useEffect(() => {
    if (!celebration) return;
    const timer = setTimeout(() => setCelebration(null), 2800);
    return () => clearTimeout(timer);
  }, [celebration]);
  const [filter, setFilter] = useState('All Chores');
  const [adding, setAdding] = useState(false);
  const [look, setLook] = useState<ChoreLook>('custom');
  const [title, setTitle] = useState('');
  const [due, setDue] = useState(dateKey(new Date()));
  const [repeat, setRepeat] = useState<'once' | 'weekly' | 'daily'>('once');
  const [through, setThrough] = useState('');
  const [choice, setChoice] = useState<string | null>(null);
  const [minutes, setMinutes] = useState(String(DEFAULT_CHORE_MINUTES));
  const self: SchedulerMember = { id: 'resident-self', name: data.name, days: [0,1,2,3,4,5,6], capacity: 120 };
  const members: SchedulerMember[] = [self, ...(assignedHousehold?.roommates ?? []).map(roommate => ({ ...self, ...roommate }))];
  const [error, setError] = useState('');
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() + 6) % 7);
  const end = new Date(start); end.setDate(start.getDate() + 6);
  const weekly = data.chores.filter(chore => chore.due >= dateKey(start) && chore.due <= dateKey(end));
  const completed = weekly.filter(chore => chore.completed).length;
  const remaining = weekly.length - completed;
  const petName = data.pet?.name || 'Roomie';
  const mine = (chore: ResidentData['chores'][number]) => !chore.unassigned && (!chore.assignee || chore.assignee === data.name);
  const upcomingChores = data.chores.filter(chore => !chore.completed).sort((a,b) => a.due.localeCompare(b.due));
  const nextChore = upcomingChores.find(mine) ?? upcomingChores[0];
  const featuredChore = celebration ?? nextChore;
  const petLook = featuredChore ? resolveChoreLook(featuredChore.look, featuredChore.title) : undefined;
  const petCopy = celebration ? `${celebration.title} done! Look at us go.` : petLook ? chorePetPrompt(petLook) : weekly.length && !remaining ? 'We finished this week’s chores. High five!' : 'A little quiet time! I’m here when you’re ready for the next chore.';
  const workloads = weeklyWorkload(dateKey(start), members, data.chores, data.name);
  const candidates = suggestAssignee({ title, look, due, minutes: Number(minutes) }, members, data.chores, data.name);
  const suggested = candidates[0];
  const chosen = choice === null ? suggested : candidates.find(candidate => candidate.member.id === choice);
  const override = chosen && suggested && chosen.member.id !== suggested.member.id && chosen.minutes > suggested.minutes;
  const dates = choreDates(due, repeat, through);
  const input = { title: title.trim(), look, minutes: Number(minutes) };
  const repeatPreview = adding && title.trim() && repeat !== 'once' && Number(minutes) > 0 && dates.length
    ? planChoreOccurrences(input, dates, members, data.chores, data.name, choice, 'preview') : [];
  const unassignedCount = repeatPreview.filter(chore => chore.unassigned).length;
  const repeatUntil = dates.length > 1 ? new Date(dates[dates.length - 1] + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null;
  const unavailable = choice !== null && !chosen;

  function openAdd() {
    setTitle(''); setLook('custom'); setDue(dateKey(new Date())); setMinutes(String(DEFAULT_CHORE_MINUTES));
    setRepeat('once'); setThrough(''); setChoice(null); setError(''); setAdding(true);
  }

  const visible = [...data.chores].filter(chore => filter === 'Completed' ? chore.completed : !chore.completed && (filter !== 'My Chores' || mine(chore))).sort((a, b) => a.due.localeCompare(b.due));
  const points = data.chores.filter(chore => chore.completed && mine(chore)).length * 10;
  const format = (date: Date) => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  function save() {
    const parsed = new Date(due + 'T12:00:00');
    if (!title.trim()) { setError('Enter a chore title.'); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(due) || !Number.isFinite(parsed.getTime()) || dateKey(parsed) !== due) { setError('Enter a valid date in YYYY-MM-DD format.'); return; }
    const effort = Number(minutes);
    if (!Number.isInteger(effort) || effort < 1 || effort > 1440) { setError('Enter an effort estimate between 1 and 1440 minutes.'); return; }
    if (unavailable) { setError('Use the updated suggestion or choose another available roommate.'); return; }
    if (!dates.length) { setError('Choose a repeat end date on or after the first date, with at most 52 occurrences.'); return; }
    const id = crypto.randomUUID();
    setData(previous => ({ ...previous,
      chores: [...previous.chores, ...planChoreOccurrences(input, dates, members, previous.chores, previous.name, choice, id)] }));
    setFilter('All Chores');
    setAdding(false);
  }

  return <>
    <View style={s.header}>
      
      <View style={s.copy}><Text accessibilityRole="header" style={s.title}>Chores</Text><Text style={s.subtitle}>{assignedHousehold?.name || data.household || 'Your household'} · {format(start)}–{format(end)}</Text></View>
    </View>
    {!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}
    <View style={s.petHero}>
      <View style={s.petIntro}>
        <ChorePet key={celebration ? `done:${celebration.id}` : featuredChore?.id ?? 'idle'} look={petLook} name={petName} color={data.pet?.color} accessory={data.pet?.accessory} celebrating={!!celebration} />
        <View style={s.copy}>
          <Text style={s.petEyebrow}>{celebration ? '✦ SMALL WIN' : 'YOUR CHORE BUDDY'}</Text>
          <Text style={s.sectionTitle}>{petName}</Text>
          <Text accessibilityLiveRegion="polite" style={s.caption}>{petCopy}</Text>
          {!data.pet && onPet && <Pressable accessibilityRole="button" onPress={onPet}><Text style={s.upcoming}>Meet your pet →</Text></Pressable>}
        </View>
      </View>
      <View style={s.row}><Text style={s.cardTitle}>This week’s progress</Text><Text style={s.count}>{completed} / {weekly.length} done</Text></View>
      <View accessibilityRole="progressbar" accessibilityLabel="Chores completed this week" accessibilityValue={{ min: 0, max: weekly.length || 1, now: completed }} style={s.track}><View style={[s.fill, { width: `${weekly.length ? completed / weekly.length * 100 : 0}%` }]} /></View>
    </View>
    <Pressable accessibilityRole="button" onPress={openAdd} style={({ pressed }) => [s.addButton, pressed && s.pressed]}><Text style={s.addText}>＋ Add chore</Text></Pressable>
    <View style={s.splitCard}>
      <Text accessibilityRole="header" style={s.cardTitle}>This week’s split</Text>
      <View style={s.splitRow}>{workloads.map(({member, minutes}) => <Text key={member.id} style={s.splitChip}>{member.name} · {minutes} min</Text>)}</View>
      {weekly.some(chore => chore.unassigned && !chore.completed) && <Text style={s.caption}>{weekly.filter(chore => chore.unassigned && !chore.completed).length} still unassigned</Text>}
    </View>
    <View accessibilityRole="tablist" accessibilityLabel="Chore filters" style={s.filters}>{['My Chores', 'All Chores', 'Completed'].map(item => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: filter === item }} onPress={() => setFilter(item)} style={[s.filter, filter === item && s.selectedFilter]}><Text style={[s.filterText, filter === item && s.selectedText]}>{item}</Text></Pressable>)}</View>
    <View style={s.section}><Text accessibilityRole="header" style={s.sectionTitle}>{filter === 'Completed' ? 'Completed chores' : 'Your chore list'}</Text><Text style={s.upcoming}>{visible.length} {filter === 'Completed' ? 'completed' : 'upcoming'}</Text></View>
    <View style={s.list}>
      {!visible.length && <View style={s.empty}><Text style={s.cardTitle}>{filter === 'Completed' ? 'A little effort goes a long way' : 'A little room to breathe'}</Text><Text style={s.caption}>{filter === 'Completed' ? 'Chores you complete will appear here.' : filter === 'My Chores' ? 'No chores assigned to you. Add one to get started.' : 'Your chore list is clear. Add a task for your household.'}</Text></View>}
      {visible.map((chore, index) => {
        const own = mine(chore);
        const name = chore.unassigned ? 'Unassigned' : chore.assignee || data.name;
        const initials = name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
        const day = chore.due === dateKey(now) ? 'Today' : new Date(chore.due + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        return <Pressable key={chore.id} accessibilityRole="checkbox" accessibilityState={{ checked: chore.completed }} accessibilityLabel={`${chore.title}, ${name}, ${day}`} onPress={() => { setCelebration(chore.completed ? null : chore); setData(previous => ({ ...previous, chores: previous.chores.map(item => item.id === chore.id ? { ...item, completed: !item.completed } : item) })); }} style={({ pressed }) => [s.chore, pressed && s.pressed]}>
          <View style={[s.checkbox, (own || chore.completed) && s.blueBorder, chore.completed && s.checked]}>{chore.completed && <Text style={s.check}>✓</Text>}</View>
          <ChoreBadge look={chore.look} title={chore.title} />
          <View style={s.copy}><Text style={[s.choreTitle, chore.completed && s.completed]}>{chore.title}</Text><View style={s.details}><View style={[s.avatar, { backgroundColor: ['#F1EBFF', '#FFF2DC', '#EAF6EF'][index % 3] }]}><Text style={s.initials}>{initials}</Text></View><Text style={s.detailText}>{name}{own ? ' (you)' : ''} · {day}{chore.time ? `, ${chore.time}` : ''}</Text></View></View>
          {own && <Text style={s.badge}>Yours</Text>}
        </Pressable>;
      })}
    </View>
    <View style={s.pointsCard}><View style={s.copy}><Text style={s.cardTitle}>Pet rewards</Text><Text style={s.subtitle}>{points < 210 ? `${210 - points} points to unlock the Leaf hat. Earn 10 per chore you finish.` : 'Leaf hat unlocked! Equip it in Customize Pet.'}</Text></View><Text style={s.points}>{points} pts</Text></View>
    <Modal visible={adding} transparent animationType="fade" onRequestClose={() => setAdding(false)}><View style={s.backdrop}><ScrollView style={s.formShell} contentContainerStyle={s.form} keyboardShouldPersistTaps="handled">
      <Text accessibilityRole="header" style={s.sectionTitle}>Add a chore</Text>
      <Text style={s.caption}>Pick a shortcut or type your own. {petName} helps split the work.</Text>
      <ChorePresets onPick={preset => { setTitle(preset.title); setLook(preset.look); setMinutes(String(preset.minutes)); setChoice(null); setError(''); }} />
      <TextInput accessibilityLabel="Chore title" placeholder="Or name your own chore" value={title} onChangeText={setTitle} style={s.input} />
      <div className="chore-details chore-event-fields chore-quick-fields">
        <label>Date<input type="date" value={due} onChange={event => {
          const next = event.target.value; setDue(next); setError('');
          if (next && repeat !== 'once' && (!through || through < next)) setThrough(addDays(next, repeat === 'weekly' ? 21 : 6));
        }} /></label>
        <label>Repeat<select value={repeat} onChange={event => {
          const next = event.target.value as typeof repeat; setRepeat(next); setError('');
          setThrough(due && next !== 'once' ? addDays(due, next === 'weekly' ? 21 : 6) : '');
        }}><option value="once">Does not repeat</option><option value="weekly">Every week</option><option value="daily">Every day</option></select></label>
        <label>Effort (min)<input type="number" min={1} max={1440} value={minutes} onChange={event => { setMinutes(event.target.value); setError(''); }} /></label>
        {repeat !== 'once' && <label className="chore-repeat-end">Repeat through<input type="date" min={due} value={through} onChange={event => { setThrough(event.target.value); setError(''); }} /></label>}
      </div>
      {repeat !== 'once' && dates.length > 0 && <Text style={s.caption}>{dates.length} {dates.length === 1 ? 'chore' : 'chores'}{repeatUntil ? ` through ${repeatUntil}` : ''}.</Text>}
      <View style={s.suggestionCard}>
        <Text accessibilityLiveRegion="polite" style={s.cardTitle}>{unavailable ? 'Choose another assignee' : chosen ? `${choice === null ? 'Suggested' : 'Assigned to'}: ${chosen.member.name}` : 'Unassigned'}</Text>
        <Text style={s.caption}>{unavailable ? 'This roommate is unavailable or would exceed their weekly limit.' : chosen ? `${chosen.minutes ? `${chosen.minutes} min already assigned this week.` : 'No chores assigned this week yet.'}${choice === null && chosen.lastAssignee && !chosen.repeated ? ` ${chosen.lastAssignee} had this chore last time.` : ''}` : 'Nobody is available within their workload limit. Try another date, or add it without an assignee.'}</Text>
        {!!override && <Text accessibilityLiveRegion="polite" style={s.fairnessNote}>With this chore: {chosen.member.name} · {chosen.projected} min, {suggested.member.name} · {suggested.minutes} min. You can keep it or switch to spread the work.</Text>}
        {repeatPreview.length > 0 && <Text style={s.caption}>{unassignedCount > 0 ? `${unassignedCount} ${unassignedCount === 1 ? 'date needs' : 'dates need'} someone. The rest are assigned automatically.` : 'Roomies balances the later dates too.'}</Text>}
        {candidates.length > 0 && <div className="chore-choices" role="group" aria-label={repeat === 'once' ? 'Choose assignee' : 'Choose first assignee'}>
          {candidates.map(candidate => {
            const { member, minutes: assigned } = candidate;
            const recommended = suggested?.member.id === member.id;
            const selected = chosen?.member.id === member.id;
            return <button type="button" key={member.id} aria-pressed={selected} onClick={() => { setChoice(recommended ? null : member.id); setError(''); }}>
              <strong>{member.name}</strong><span>{assigned} min assigned</span>{recommended && <span className="chore-recommended">Suggested</span>}
            </button>;
          })}
        </div>}
        {members.length === 1 && <Text style={s.caption}>No other roommates are assigned to your household yet.</Text>}
      </View>
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      <Pressable accessibilityRole="button" onPress={save} style={s.addButton}><Text style={s.addText}>{repeat !== 'once' && dates.length > 1 ? `Add ${dates.length} chores` : 'Add chore'}</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={() => setAdding(false)} style={s.cancel}><Text style={s.upcoming}>Cancel</Text></Pressable>
    </ScrollView></View></Modal>
  </>;
}
