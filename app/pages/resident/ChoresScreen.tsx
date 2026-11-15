import { addDays, choreDates, planChoreOccurrences, DEFAULT_CHORE_MINUTES, suggestAssignee, weeklyWorkload, type SchedulerMember } from '../../features/scheduler/scheduler';
import { resolveChoreLook, type ChoreLook } from '../../data/chorePresets';
import { ChoreBadge, ChorePresets } from '../../features/scheduler/ChorePresets';
import ChorePet, { chorePetPrompt } from './ChorePet';
import RoomiePet from '../../components/RoomiePet';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import type { ResidentData } from '../../hooks/useResidentData';
import { styles as s } from '../../styles/ChoresScreen.styles';

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function ChoresScreen({ data, setData, storageError, onPet, assignedHousehold, autoOpenAdd = false, onAddOpened }: {
  data: ResidentData; setData: Dispatch<SetStateAction<ResidentData>>; storageError: string; onPet?: () => void;
  assignedHousehold?: { name: string; roommates: { id: string; name: string }[] };
  autoOpenAdd?: boolean; onAddOpened?: () => void;
}) {
  const [celebration, setCelebration] = useState<ResidentData['chores'][number] | null>(null);
  useEffect(() => {
    if (!celebration) return;
    const timer = setTimeout(() => setCelebration(null), 2800);
    return () => clearTimeout(timer);
  }, [celebration]);
  const [burst, setBurst] = useState<string | null>(null);
  useEffect(() => {
    if (!burst) return;
    const timer = setTimeout(() => setBurst(null), 480);
    return () => clearTimeout(timer);
  }, [burst]);
  const [filter, setFilter] = useState('All Chores');
  const [adding, setAdding] = useState(false);
  const [look, setLook] = useState<ChoreLook>('custom');
  const [title, setTitle] = useState('');
  const [due, setDue] = useState(dateKey(new Date()));
  const [repeat, setRepeat] = useState<'once' | 'weekly' | 'daily'>('once');
  const [repeatCount, setRepeatCount] = useState(4);
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
  const dates = choreDates(due, repeat, addDays(due, (repeatCount - 1) * (repeat === 'weekly' ? 7 : 1)));
  const upcomingDates = Array.from({ length: 28 }, (_, index) => addDays(dateKey(now), index));
  const input = { title: title.trim(), look, minutes: Number(minutes) };
  const repeatPreview = adding && title.trim() && repeat !== 'once' && Number(minutes) > 0 && dates.length
    ? planChoreOccurrences(input, dates, members, data.chores, data.name, choice, 'preview') : [];
  const unassignedCount = repeatPreview.filter(chore => chore.unassigned).length;
  const repeatUntil = dates.length > 1 ? new Date(dates[dates.length - 1] + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null;
  const unavailable = choice !== null && !chosen;

  function openAdd() {
    setTitle(''); setLook('custom'); setDue(dateKey(new Date())); setMinutes(String(DEFAULT_CHORE_MINUTES));
    setRepeat('once'); setRepeatCount(4); setChoice(null); setError(''); setAdding(true);
  }
  useEffect(() => {
    if (!autoOpenAdd) return;
    openAdd();
    onAddOpened?.();
  }, [autoOpenAdd]);

  const visible = [...data.chores].filter(chore => filter === 'Completed' ? chore.completed : (!chore.completed || chore.id === burst) && (filter !== 'My Chores' || mine(chore))).sort((a, b) => a.due.localeCompare(b.due));
  const points = data.chores.filter(chore => chore.completed && mine(chore)).length * 10;
  function save() {
    const parsed = new Date(due + 'T12:00:00');
    if (!title.trim()) { setError('Pick a chore to get started.'); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(due) || !Number.isFinite(parsed.getTime()) || dateKey(parsed) !== due) { setError('Enter a valid date in YYYY-MM-DD format.'); return; }
    const effort = Number(minutes);
    if (!Number.isInteger(effort) || effort < 1 || effort > 1440) { setError('Enter an effort estimate between 1 and 1440 minutes.'); return; }
    if (unavailable) { setError('Use the updated suggestion or choose another available roommate.'); return; }
    if (!dates.length) { setError('Choose when the chore should repeat.'); return; }
    const id = crypto.randomUUID();
    setData(previous => ({ ...previous,
      chores: [...previous.chores, ...planChoreOccurrences(input, dates, members, previous.chores, previous.name, choice, id)] }));
    setFilter('All Chores');
    setAdding(false);
  }

  return <>
    <View style={s.header}>
      
      <View style={s.copy}><Text accessibilityRole="header" style={s.title}>Chores</Text></View>
    </View>
    {!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}
    <View style={s.petHero}>
      <View style={s.petIntro}>
        <ChorePet key={celebration ? `done:${celebration.id}` : nextChore?.id ?? 'idle'} look={petLook} name={petName} color={data.pet?.color} accessory={data.pet?.accessory} accessories={data.pet?.accessories} accessoryColors={data.pet?.accessoryColors} celebrating={!!celebration} />
        <View style={s.copy}>
          <Text style={s.petEyebrow}>{celebration ? '✦ SMALL WIN' : 'YOUR CHORE BUDDY'}</Text>
          <View style={s.row}><Text style={s.sectionTitle}>{petName}</Text><Text style={s.points} accessibilityLabel={`${points} Roomie points`}>{points} pts</Text></View>
          <Text accessibilityLiveRegion="polite" style={s.caption}>{petCopy}</Text>
          {!data.pet && onPet && <Pressable accessibilityRole="button" onPress={onPet}><Text style={s.upcoming}>Meet your pet →</Text></Pressable>}
        </View>
      </View>
      <View style={s.row}><Text style={s.cardTitle}>This week</Text><Text style={s.count}>{completed} / {weekly.length} done</Text></View>
      <View accessibilityRole="progressbar" accessibilityLabel="Chores completed this week" accessibilityValue={{ min: 0, max: weekly.length || 1, now: completed }} style={s.track}><View style={[s.fill, { width: `${weekly.length ? completed / weekly.length * 100 : 0}%` }]} /></View>
    </View>
    <View accessibilityRole="tablist" accessibilityLabel="Chore filters" style={s.filters}>{['My Chores', 'All Chores', 'Completed'].map(item => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: filter === item }} onPress={() => setFilter(item)} style={[s.filter, filter === item && s.selectedFilter]}><Text style={[s.filterText, filter === item && s.selectedText]}>{item}</Text></Pressable>)}</View>
    <View style={s.list}>
      {!visible.length && <View style={s.empty}><Text style={s.cardTitle}>{filter === 'Completed' ? 'No completed chores yet' : 'A little room to breathe'}</Text><Text style={s.caption}>{filter === 'Completed' ? 'Check off a chore to see it here.' : filter === 'My Chores' ? 'Nothing assigned to you right now.' : 'All clear! Use + to add a chore.'}</Text></View>}
      {visible.map(chore => {
        const own = mine(chore);
        const name = chore.unassigned ? 'Unassigned' : chore.assignee || data.name;
        const day = chore.due === dateKey(now) ? 'Today' : new Date(chore.due + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        return <Pressable key={chore.id} accessibilityRole="checkbox" accessibilityState={{ checked: chore.completed }} accessibilityLabel={`${chore.title}, ${name}, ${day}`} onPress={() => { setBurst(chore.completed ? null : chore.id); setCelebration(chore.completed ? null : chore); setData(previous => ({ ...previous, chores: previous.chores.map(item => item.id === chore.id ? { ...item, completed: !item.completed } : item) })); }} style={({ pressed }) => [s.chore, pressed && s.pressed]}>
          <View style={[s.checkbox, (own || chore.completed) && s.blueBorder, chore.completed && s.checked]}>{chore.completed && <Text style={s.check}>✓</Text>}{burst === chore.id && <span className="chore-confetti" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <i key={i} />)}</span>}</View>
          <ChoreBadge look={chore.look} title={chore.title} />
          <View style={s.copy}><Text style={[s.choreTitle, chore.completed && s.completed]}>{chore.title}</Text><Text style={s.detailText}>{name}{own ? ' (you)' : ''} · {day}{chore.time ? `, ${chore.time}` : ''}</Text></View>
        </Pressable>;
      })}
    </View>
    <View style={s.splitCard}>
      <Text accessibilityRole="header" style={s.cardTitle}>This week’s split</Text>
      <View style={s.splitRow}>{workloads.map(({member, minutes}) => <Text key={member.id} style={s.splitChip}>{member.name} · {minutes} min</Text>)}</View>
      {weekly.some(chore => chore.unassigned && !chore.completed) && <Text style={s.caption}>{weekly.filter(chore => chore.unassigned && !chore.completed).length} still unassigned</Text>}
    </View>
    <Modal visible={adding} transparent animationType="fade" onRequestClose={() => setAdding(false)}><View style={s.backdrop}><ScrollView style={s.formShell} contentContainerStyle={s.form} keyboardShouldPersistTaps="handled">
      <Text accessibilityRole="header" style={s.sectionTitle}>Add a chore</Text>
      <Text style={s.caption}>Pick a chore. {petName} helps split the work.</Text>
      <ChorePresets selected={title ? look : undefined} onPick={preset => { setTitle(preset.title); setLook(preset.look); setMinutes(String(preset.minutes)); setChoice(null); setError(''); }} />
      <div className="chore-details chore-event-fields chore-quick-fields">
        <label>When<select value={due} onChange={event => { setDue(event.target.value); setError(''); }}>{upcomingDates.map((date, index) => <option key={date} value={date}>{index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : new Date(date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</option>)}</select></label>
        <label>Repeat<select value={repeat} onChange={event => {
          const next = event.target.value as typeof repeat; setRepeat(next); setError('');
          setRepeatCount(next === 'daily' ? 7 : 4);
        }}><option value="once">Once</option><option value="weekly">Weekly</option><option value="daily">Daily</option></select></label>
        <label>Effort<select value={minutes} onChange={event => { setMinutes(event.target.value); setError(''); }}>{[5, 10, 15, 20, 30, 45, 60].map(value => <option key={value} value={value}>{value} min</option>)}</select></label>
        {repeat !== 'once' && <label className="chore-repeat-end">How many times?<select value={repeatCount} onChange={event => setRepeatCount(Number(event.target.value))}>{[2, 3, 4, 7, 8, 12].map(count => <option key={count} value={count}>{count} times</option>)}</select></label>}
      </div>
      {repeat !== 'once' && dates.length > 0 && <Text style={s.caption}>{dates.length} {dates.length === 1 ? 'chore' : 'chores'}{repeatUntil ? ` through ${repeatUntil}` : ''}.</Text>}
      {!!title && <View style={s.suggestionCard}>
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
      </View>}
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      <Pressable accessibilityRole="button" onPress={save} style={s.addButton}><Text style={s.addText}>{repeat !== 'once' && dates.length > 1 ? `Add ${dates.length} chores` : 'Add chore'}</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={() => setAdding(false)} style={s.cancel}><Text style={s.upcoming}>Cancel</Text></Pressable>
    </ScrollView></View></Modal>
  </>;
}
