import { randomUUID } from '../../utils/randomUUID';
import { addDays, choreDates, isAssignedTo, planChoreOccurrences, DEFAULT_CHORE_MINUTES, suggestAssignee, weeklyWorkload, type SchedulerMember } from '../../features/scheduler/scheduler';
import { choreLooks, chorePresets, resolveChoreLook, type ChoreLook } from '../../data/chorePresets';
import { ChoreBadge } from '../../features/scheduler/ChorePresets';
import { POINTS_PER_CHORE } from '../../data/choreRewards';
import { ROOMIE_COLORS } from '../../components/RoomiePet';
import ChorePet from './ChorePet';
import { useEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Animated, Easing, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import type { useSharedChores } from '../../hooks/useSharedChores';
import type { ResidentData } from '../../hooks/useResidentData';
import { styles as s } from '../../styles/ChoresScreen.styles';

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const roommateColors = [
  ROOMIE_COLORS.blue,
  ROOMIE_COLORS.green,
  ROOMIE_COLORS.purple,
  ROOMIE_COLORS.yellow,
  ROOMIE_COLORS.pink,
];

const confettiPieces = [
  { dx: -19, dy: -12, backgroundColor: '#A35FEC' },
  { dx: -8, dy: -23, backgroundColor: '#D28B25' },
  { dx: 10, dy: -24, backgroundColor: '#3B9663' },
  { dx: 23, dy: -10, backgroundColor: '#DF6598' },
  { dx: 19, dy: 12, backgroundColor: '#D28B25' },
  { dx: -16, dy: 14, backgroundColor: '#3B9663' },
];

function ChoreConfetti() {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.timing(progress, { toValue: 1, duration: 460, easing: Easing.out(Easing.ease), useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [progress]);
  const opacity = progress.interpolate({ inputRange: [0, 0.65, 1], outputRange: [1, 1, 0] });
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  const rotation = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '75deg'] });

  return <View pointerEvents="none" style={s.confetti}>{confettiPieces.map((piece, index) => <Animated.View key={index} style={[
    s.confettiPiece,
    { left: '50%', top: '50%', backgroundColor: piece.backgroundColor, opacity, transform: [
      { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, piece.dx] }) },
      { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, piece.dy] }) },
      { scale },
      { rotate: rotation },
    ] },
  ]} />)}</View>;
}

export default function ChoresScreen({ data, setData, storageError, assignedHousehold, autoOpenAdd = false, onAddOpened, renderPage, shared }: {
  data: ResidentData; setData: Dispatch<SetStateAction<ResidentData>>; storageError: string; onPet?: () => void;
  assignedHousehold?: { name: string; roommates: { id: string; name: string }[] };
  shared?: ReturnType<typeof useSharedChores>;
  autoOpenAdd?: boolean; onAddOpened?: () => void; renderPage: (content: ReactNode) => ReactNode;
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
  const [activeSheet, setActiveSheet] = useState<'add' | 'split' | 'points' | null>(null);
  const adding = activeSheet === 'add';
  const sheetTitle = adding ? 'Add a chore' : activeSheet === 'points' ? 'Roomie points' : 'Roomies Split';
  const closeSheet = () => setActiveSheet(null);
  const webDialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeSheet || Platform.OS !== 'web') return;
    const previousFocus = document.activeElement;
    webDialog.current?.querySelector<HTMLElement>('[role="button"]')?.focus({ preventScroll: true });
    return () => {
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [activeSheet]);
  const [picker, setPicker] = useState<'chore' | 'date' | null>(null);
  const [calendarWeek, setCalendarWeek] = useState(0);
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
  const treeContributions = members.map((member, index) => ({
    id: member.id,
    name: member.id === self.id ? 'You' : member.name,
    color: roommateColors[index % roommateColors.length],
    total: 0,
    done: 0,
  }));
  const otherChores = { id: 'other-chores', name: 'Other chores', color: '#6E7481', total: 0, done: 0 };
  for (const chore of weekly) {
    const index = members.findIndex(member => isAssignedTo(chore, member, members, data.name));
    const contribution = treeContributions[index] ?? otherChores;
    contribution.total++;
    if (chore.completed) contribution.done++;
  }
  if (otherChores.total) treeContributions.push(otherChores);
  const petName = data.pet?.name || 'Roomie';
  const mine = (chore: ResidentData['chores'][number]) => !chore.unassigned && (shared ? chore.memberId === 'resident-self' : !chore.assignee || chore.assignee === data.name);
  const upcomingChores = data.chores.filter(chore => !chore.completed).sort((a,b) => a.due.localeCompare(b.due));
  const nextChore = upcomingChores.find(mine) ?? upcomingChores[0];
  const featuredChore = celebration ?? nextChore;
  const petLook = featuredChore ? resolveChoreLook(featuredChore.look, featuredChore.title) : undefined;
  const workloads = weeklyWorkload(dateKey(start), members, data.chores, data.name);
  const candidates = suggestAssignee({ title, look, due, minutes: Number(minutes) }, members, data.chores, data.name);
  const suggested = candidates[0];
  const chosen = choice === null ? suggested : candidates.find(candidate => candidate.member.id === choice);
  const override = chosen && suggested && chosen.member.id !== suggested.member.id && chosen.minutes > suggested.minutes;
  const dates = choreDates(due, repeat, addDays(due, (repeatCount - 1) * (repeat === 'weekly' ? 7 : 1)));
  const calendarStart = addDays(dateKey(now), calendarWeek * 7);
  const calendarDates = Array.from({ length: 7 }, (_, index) => addDays(calendarStart, index));
  const dateLabel = (date: string) => new Date(date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const input = { title: title.trim(), look, minutes: Number(minutes) };
  const repeatPreview = adding && title.trim() && repeat !== 'once' && Number(minutes) > 0 && dates.length
    ? planChoreOccurrences(input, dates, members, data.chores, data.name, choice, 'preview') : [];
  const unassignedCount = repeatPreview.filter(chore => chore.unassigned).length;
  const repeatUntil = dates.length > 1 ? new Date(dates[dates.length - 1] + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null;
  const unavailable = choice !== null && !chosen;

  function openAdd() {
    setPicker(null); setCalendarWeek(0);
    setTitle(''); setLook('custom'); setDue(dateKey(new Date())); setMinutes(String(DEFAULT_CHORE_MINUTES));
    setRepeat('once'); setRepeatCount(4); setChoice(null); setError(''); setActiveSheet('add');
  }
  useEffect(() => {
    if (!autoOpenAdd) return;
    openAdd();
    onAddOpened?.();
  }, [autoOpenAdd]);

  const visible = [...data.chores].filter(chore => filter === 'Completed' ? chore.completed : (!chore.completed || chore.id === burst) && (filter !== 'My Chores' || mine(chore))).sort((a, b) => a.due.localeCompare(b.due));
  const points = data.chores.filter(chore => chore.completed && mine(chore)).length * POINTS_PER_CHORE;
  async function save() {
    const parsed = new Date(due + 'T12:00:00');
    if (!title.trim()) { setError('Pick a chore to get started.'); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(due) || !Number.isFinite(parsed.getTime()) || dateKey(parsed) !== due) { setError('Choose a valid date.'); return; }
    const effort = Number(minutes);
    if (!Number.isInteger(effort) || effort < 1 || effort > 1440) { setError('Choose an effort estimate.'); return; }
    if (unavailable) { setError('Choose an available roommate.'); return; }
    if (!dates.length) { setError('Choose when the chore should repeat.'); return; }
    const id = randomUUID();
    if (shared) {
      const chores = planChoreOccurrences(input, dates, members, data.chores, data.name, choice, id);
      if (!await shared.add(chores)) return;
    } else {
      setData(previous => ({ ...previous,
        chores: [...previous.chores, ...planChoreOccurrences(input, dates, members, previous.chores, previous.name, choice, id)] }));
    }
    setFilter('All Chores');
    closeSheet();
  }

  const treeBar = (
    <View accessibilityRole="progressbar" accessibilityLabel="Weekly tree" accessibilityValue={{ min: 0, max: weekly.length || 1, now: completed }} style={s.track}>
      {treeContributions.filter(person => person.done > 0).map(person => (
        <View key={person.id} style={[s.fill, { backgroundColor: person.color, width: `${person.done / weekly.length * 100}%` }]} />
      ))}
    </View>
  );

  const page = renderPage(<>
    <View style={s.header}>
      <View style={s.copy}><Text numberOfLines={1} accessibilityRole="header" style={s.title}>Chores</Text></View>
    </View>
    {!!storageError && <Text numberOfLines={1} accessibilityRole="alert" style={s.error}>{storageError}</Text>}
    <View style={s.petHero}>
      <View style={s.petIntro}>
        <ChorePet key={celebration ? `done:${celebration.id}` : nextChore?.id ?? 'idle'} look={petLook} name={petName} color={data.pet?.color} accessory={data.pet?.accessory} accessories={data.pet?.accessories} accessoryColors={data.pet?.accessoryColors} celebrating={!!celebration} />
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Your points: ${points}. View points and tree rules`} onPress={() => setActiveSheet('points')} style={s.petPoints}>
        <Text numberOfLines={1} style={s.points}>Your pts: {points} ›</Text>
      </Pressable>
      <View style={s.row}><Text numberOfLines={1} style={s.cardTitle}>Weekly tree</Text><Text numberOfLines={1} style={s.count}>{completed} / {weekly.length} chores</Text></View>
      {treeBar}
    </View>
    <View accessibilityRole="tablist" accessibilityLabel="Chore filters" style={s.filters}>{['My Chores', 'All Chores', 'Completed'].map(item => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: filter === item }} onPress={() => setFilter(item)} style={[s.filter, filter === item && s.selectedFilter]}><Text numberOfLines={1} style={[s.filterText, filter === item && s.selectedText]}>{item}</Text></Pressable>)}</View>
    <View style={s.list}>
      {!visible.length && <View style={s.empty}><Text numberOfLines={1} style={s.cardTitle}>{filter === 'Completed' ? 'No completed chores yet' : 'Use + to add a chore.'}</Text></View>}
      {visible.map(chore => {
        const own = mine(chore);
        const name = chore.unassigned ? 'Unassigned' : chore.assignee || data.name;
        const day = chore.due === dateKey(now) ? 'Today' : new Date(chore.due + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        return <Pressable key={chore.id} accessibilityRole="checkbox" accessibilityState={{ checked: chore.completed }} accessibilityLabel={`${chore.title}, ${name}, ${day}`} disabled={shared?.busy} onPress={async () => {
          if (shared) {
            if (!await shared.complete(chore)) return;
          } else {
            setData(previous => ({ ...previous, chores: previous.chores.map(item => item.id === chore.id ? { ...item, completed: !item.completed } : item) }));
          }
          setBurst(chore.completed ? null : chore.id);
          setCelebration(chore.completed ? null : chore);
        }} style={({ pressed }) => [s.chore, chore.completed && s.completedRow, pressed && s.pressed]}>
          <View style={[s.checkbox, own && !chore.completed && s.blueBorder, chore.completed && s.checked]}>{chore.completed && <Text numberOfLines={1} style={s.check}>✓</Text>}{burst === chore.id && <ChoreConfetti key={burst} />}</View>
          <ChoreBadge look={chore.look} title={chore.title} muted={chore.completed} />
          <View style={s.copy}><Text numberOfLines={1} style={[s.choreTitle, chore.completed && s.completed]}>{chore.title}</Text><Text numberOfLines={1} style={s.detailText}>{name}{own ? ' (you)' : ''} · {day}{chore.time ? `, ${chore.time}` : ''}</Text></View>
        </Pressable>;
      })}
    </View>
    <View style={s.splitCard}>
      <Pressable accessibilityRole="button" accessibilityLabel="Roomies Split" onPress={() => setActiveSheet('split')} style={({ pressed }) => [s.splitToggle, pressed && s.pressed]}>
        <Text numberOfLines={1} style={s.splitSparkle}>✦</Text>
        <Text numberOfLines={1} style={[s.cardTitle, s.splitLabel]}>Roomies Split</Text>
        <Text numberOfLines={1} style={s.pickerArrow}>›</Text>
      </Pressable>
    </View>
  </>);

  if (!activeSheet) return page;

  const sheet = (
    <View style={s.formShell}>
      <View style={s.formHeader}>
        <Text numberOfLines={1} accessibilityRole="header" style={s.sectionTitle}>{sheetTitle}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`Close ${sheetTitle}`} onPress={closeSheet} style={s.closeButton}>
          <Text numberOfLines={1} style={s.closeText}>×</Text>
        </Pressable>
      </View>
      {adding ? <>
        <ScrollView style={s.formScroll} contentContainerStyle={s.form} showsVerticalScrollIndicator={false}>
          <View style={s.formFields}>
            <Text numberOfLines={1} style={s.fieldLabel}>Chore</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={title || 'Choose a chore'} accessibilityState={{ expanded: picker === 'chore' }} onPress={() => setPicker(picker === 'chore' ? null : 'chore')} style={s.pickerButton}>
              {!!title && <ChoreBadge look={look} />}
              <Text numberOfLines={1} style={s.pickerLabel}>{title ? choreLooks[look].label : 'Choose a chore'}</Text>
              <Text numberOfLines={1} style={s.pickerArrow}>{picker === 'chore' ? '▴' : '▾'}</Text>
            </Pressable>
            {picker === 'chore' && <View accessibilityRole="radiogroup" accessibilityLabel="Chore presets" style={s.pickerList}>
              {chorePresets.map(preset => <Pressable key={preset.look} accessibilityRole="radio" accessibilityState={{ checked: look === preset.look }} onPress={() => {
                setTitle(preset.title);
                setLook(preset.look);
                setMinutes(String(preset.minutes));
                setChoice(null);
                setError('');
                setPicker(null);
              }} style={[s.pickerOption, look === preset.look && s.fieldChoiceSelected]}>
                <ChoreBadge look={preset.look} /><Text numberOfLines={1} style={s.pickerLabel}>{choreLooks[preset.look].label}</Text>
              </Pressable>)}
            </View>}
            <Text numberOfLines={1} style={s.fieldLabel}>Due date</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={`Due date, ${dateLabel(due)}`} accessibilityState={{ expanded: picker === 'date' }} onPress={() => setPicker(picker === 'date' ? null : 'date')} style={s.pickerButton}>
              <Text numberOfLines={1} style={s.pickerLabel}>{due === dateKey(now) ? 'Today' : dateLabel(due)}</Text>
              <Text numberOfLines={1} style={s.pickerArrow}>{picker === 'date' ? '▴' : '▾'}</Text>
            </Pressable>
            {picker === 'date' && <View style={s.calendar}>
              <View style={s.row}>
                <Pressable accessibilityRole="button" accessibilityLabel="Previous week" disabled={calendarWeek === 0} onPress={() => setCalendarWeek(calendarWeek - 1)} style={s.calendarNav}>
                  <Text numberOfLines={1} style={[s.closeText, calendarWeek === 0 && s.disabledText]}>‹</Text>
                </Pressable>
                <Text numberOfLines={1} style={s.cardTitle}>{new Date(calendarStart + 'T12:00:00').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Next week" disabled={calendarWeek === 3} onPress={() => setCalendarWeek(calendarWeek + 1)} style={s.calendarNav}>
                  <Text numberOfLines={1} style={[s.closeText, calendarWeek === 3 && s.disabledText]}>›</Text>
                </Pressable>
              </View>
              <View accessibilityRole="radiogroup" accessibilityLabel="Due date" style={s.calendarDays}>
                {calendarDates.map(date => {
                  const day = new Date(date + 'T12:00:00');
                  return <Pressable key={date} accessibilityRole="radio" accessibilityLabel={dateLabel(date)} accessibilityState={{ checked: due === date }} onPress={() => { setDue(date); setPicker(null); setError(''); }} style={[s.calendarDay, due === date && s.fieldChoiceSelected]}>
                    <Text numberOfLines={1} style={s.calendarWeekday}>{day.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2)}</Text>
                    <Text numberOfLines={1} style={s.calendarNumber}>{day.getDate()}</Text>
                  </Pressable>;
                })}
              </View>
            </View>}
            <Text numberOfLines={1} style={s.fieldLabel}>Repeat</Text>
            <View style={s.fieldChoices}>
              {(['once', 'weekly', 'daily'] as const).map(item => <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: repeat === item }} onPress={() => { setRepeat(item); setError(''); setRepeatCount(item === 'daily' ? 7 : 4); }} style={[s.fieldChoice, repeat === item && s.fieldChoiceSelected]}><Text numberOfLines={1} style={s.fieldChoiceText}>{item === 'once' ? 'Once' : item === 'weekly' ? 'Weekly' : 'Daily'}</Text></Pressable>)}
            </View>
            <Text numberOfLines={1} style={s.fieldLabel}>Effort</Text>
            <View style={s.fieldChoices}>
              {[5, 10, 15, 20, 30, 45, 60].map(value => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: Number(minutes) === value }} onPress={() => { setMinutes(String(value)); setError(''); }} style={[s.fieldChoice, Number(minutes) === value && s.fieldChoiceSelected]}><Text numberOfLines={1} style={s.fieldChoiceText}>{value} min</Text></Pressable>)}
            </View>
            {repeat !== 'once' && <>
              <Text numberOfLines={1} style={s.fieldLabel}>How many times?</Text>
              <View style={s.fieldChoices}>
                {[2, 3, 4, 7, 8, 12].map(count => <Pressable key={count} accessibilityRole="radio" accessibilityState={{ checked: repeatCount === count }} onPress={() => setRepeatCount(count)} style={[s.fieldChoice, repeatCount === count && s.fieldChoiceSelected]}><Text numberOfLines={1} style={s.fieldChoiceText}>{count} times</Text></Pressable>)}
              </View>
            </>}
          </View>
          {repeat !== 'once' && dates.length > 0 && <Text numberOfLines={1} style={s.caption}>{dates.length} {dates.length === 1 ? 'chore' : 'chores'}{repeatUntil ? ` through ${repeatUntil}` : ''}.</Text>}
          {!!title && <View style={s.suggestionCard}>
            <Text numberOfLines={1} accessibilityLiveRegion="polite" style={s.cardTitle}>{unavailable ? 'Choose another assignee' : chosen ? `${choice === null ? 'Suggested' : 'Assigned to'}: ${chosen.member.name}` : 'Unassigned'}</Text>
            {unavailable && <Text numberOfLines={1} style={s.caption}>Schedule or workload conflict</Text>}
            {!unavailable && !chosen && <Text numberOfLines={1} style={s.caption}>Try another day or add unassigned.</Text>}
            {choice === null && !!chosen?.lastAssignee && !chosen.repeated && <Text numberOfLines={1} style={s.caption}>Last time: {chosen.lastAssignee}</Text>}
            {!!override && <Text numberOfLines={1} accessibilityLiveRegion="polite" style={s.fairnessNote}>Weekly load rises to {chosen.projected} min</Text>}
            {unassignedCount > 0 && <Text numberOfLines={1} style={s.caption}>{unassignedCount} unassigned {unassignedCount === 1 ? 'date' : 'dates'}</Text>}
            {candidates.length > 0 && <View accessibilityRole="radiogroup" accessibilityLabel={repeat === 'once' ? 'Choose assignee' : 'Choose first assignee'} style={s.assigneeChoices}>
              {candidates.map(candidate => {
                const { member, minutes: assigned } = candidate;
                const recommended = suggested?.member.id === member.id;
                const selected = chosen?.member.id === member.id;
                return <Pressable key={member.id} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => { setChoice(recommended ? null : member.id); setError(''); }} style={[s.assigneeChoice, selected && s.fieldChoiceSelected]}>
                  <Text numberOfLines={1} style={s.assigneeName}>{member.name}</Text><Text numberOfLines={1} style={s.caption}>{assigned} min</Text>{recommended && <Text numberOfLines={1} style={s.upcoming}>Suggested</Text>}
                </Pressable>;
              })}
            </View>}
            {members.length === 1 && <Text numberOfLines={1} style={s.caption}>No roommates in this household yet.</Text>}
          </View>}
          {(error || shared?.error) && <Text numberOfLines={1} accessibilityRole="alert" style={s.error}>{error || shared?.error}</Text>}
        </ScrollView>
        <View style={s.formFooter}>
          <Pressable accessibilityRole="button" onPress={save} disabled={shared?.busy} style={s.addButton}><Text numberOfLines={1} style={s.addText}>{repeat !== 'once' && dates.length > 1 ? `Add ${dates.length} chores` : 'Add chore'}</Text></Pressable>
        </View>
      </> : activeSheet === 'points' ? (
        <ScrollView style={s.formScroll} contentContainerStyle={s.form} showsVerticalScrollIndicator>
          <View style={s.row}>
            <Text numberOfLines={1} style={s.cardTitle}>{points} pts all time</Text>
            <Text numberOfLines={1} style={s.caption}>+{POINTS_PER_CHORE} per assigned chore</Text>
          </View>
          <View style={s.row}>
            <Text numberOfLines={1} style={s.cardTitle}>Weekly tree</Text>
            <Text numberOfLines={1} style={s.count}>{completed} / {weekly.length} chores</Text>
          </View>
          {treeBar}
          <View style={s.splitList}>
            {treeContributions.map(person => <View key={person.id} style={s.splitChip}>
              <View style={[s.contributionDot, { backgroundColor: person.color }]} />
              <Text numberOfLines={1} style={[s.splitName, s.splitLabel]}>{person.name}</Text>
              <Text numberOfLines={1} style={s.splitMinutes}>{person.total ? `${person.done * POINTS_PER_CHORE} / ${person.total * POINTS_PER_CHORE} pts` : 'No chores due'}</Text>
            </View>)}
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={s.formScroll} contentContainerStyle={s.form} showsVerticalScrollIndicator persistentScrollbar>
          <Text numberOfLines={1} style={s.caption}>Chore minutes this week</Text>
          <View style={s.splitList}>
            {workloads.map(({ member, minutes }) => <View key={member.id} style={s.splitChip}>
              <Text numberOfLines={1} style={s.splitName}>{member.id === self.id ? 'You' : member.name}</Text>
              <Text numberOfLines={1} style={s.splitMinutes}>{minutes} min</Text>
            </View>)}
          </View>
          {weekly.some(chore => chore.unassigned && !chore.completed) && <Text numberOfLines={1} style={s.caption}>{weekly.filter(chore => chore.unassigned && !chore.completed).length} still unassigned</Text>}
        </ScrollView>
      )}
    </View>
  );

  return <>
    {page}
    {Platform.OS === 'web' ? (
      <div
        ref={webDialog}
        role="dialog"
        aria-modal="true"
        aria-label={sheetTitle}
        style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column' }}
        onKeyDown={event => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            closeSheet();
          }
          if (event.key !== 'Tab') return;
          const controls = event.currentTarget.querySelectorAll<HTMLElement>('[tabindex="0"]');
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <View style={s.backdrop}>{sheet}</View>
      </div>
    ) : (
      <Modal transparent animationType="slide" onRequestClose={closeSheet}>
        <SafeAreaProvider><SafeAreaView style={s.backdrop}>{sheet}</SafeAreaView></SafeAreaProvider>
      </Modal>
    )}
  </>;
}
