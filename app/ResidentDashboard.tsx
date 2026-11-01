import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import roomiesLogo from '../assets/Roomies Logo.png';
import roomiePet from '../assets/Roomie Pet.png';
import { styles } from './styles/ResidentDashboard.styles';
import type { ResidentUser } from './data/demoAccount';
import { useResidentData } from './hooks/useResidentData';

const iconPaths = {
  home: 'M3 10 12 3l9 7M5 9v12h14V9M9 21v-8h6v8',
  chores: 'M9 12l2 2 4-4M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  expenses: 'M20 8V4H4v16h16v-8h-6V8h7v4M17 10h.01',
  calendar: 'M4 5h16v16H4zM8 2v6M16 2v6M4 10h16M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01',
  more: 'M4 12h.01M12 12h.01M20 12h.01',
  bell: 'M6 8a6 6 0 0 1 12 0c0 8 3 8 3 10H3c0-2 3-2 3-10M10 22h4',
  tree: 'M12 22V10M12 16C3 17 2 11 3 8c6-1 10 2 9 8ZM12 11c-1-7 3-10 8-9 1 6-2 10-8 9M5 22h14',
  trash: 'M3 5h18M9 5V2h6v3M6 5l1 17h10l1-17M10 9v9M14 9v9',
  dinner: 'M3 20 9 3c7 2 11 8 12 15L3 20ZM7 15l11-1M11 9h.01M10 17h.01',
  add: 'M12 4v16M4 12h16',
  split: 'M5 3h14v18l-3-2-4 2-4-2-3 2V3ZM15 7H10a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H9M12 5v12',
} as const;
type IconName = keyof typeof iconPaths;

function Icon({ name, color = '#555B69', size = 20 }: { name: IconName; color?: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPaths[name]} /></svg>;
}

const tabs: { label: string; icon: IconName }[] = [
  { label: 'Home', icon: 'home' }, { label: 'Chores', icon: 'chores' },
  { label: 'Expenses', icon: 'expenses' }, { label: 'Calendar', icon: 'calendar' }, { label: 'More', icon: 'more' },
];

function localDate(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function displayDate(value: string) {
  return new Date(value + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function ResidentDashboard({ user }: { user: ResidentUser }) {
  const { data, setData, storageError } = useResidentData(user.email, user.name);
  const [now, setNow] = useState(() => new Date());
  const [panel, setPanel] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const today = localDate(now);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - (now.getDay() + 6) % 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  const weeklyChores = data.chores.filter(chore => chore.due >= localDate(weekStart) && chore.due < localDate(weekEnd));
  const completed = weeklyChores.filter(chore => chore.completed).length;
  const todayCount = data.chores.filter(chore => !chore.completed && chore.due === today).length;
  const totalCents = data.expenses.reduce((total, expense) => total + Math.round(expense.amount * 100), 0);
  const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });
  const nextDue = data.expenses.map(expense => expense.due).sort()[0];
  const initials = data.name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const needsAttention = data.pet && (!data.pet.lastAttention || now.getTime() - new Date(data.pet.lastAttention).getTime() >= 86400000);
  const upcoming = [
    ...data.chores.filter(chore => !chore.completed).map(chore => ({ ...chore, date: chore.due, kind: 'chore' as const })),
    ...data.events.filter(event => event.date >= today).map(event => ({ ...event, kind: 'event' as const })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  function openPanel(next: string) {
    setTitle(next === 'Household' ? data.household : next === 'Profile' ? data.name : next === 'Pet' ? data.pet?.name || '' : '');
    setDate(today);
    setAmount('');
    setError('');
    setPanel(next);
  }

  function save() {
    if (!title.trim()) { setError('Enter a name or title.'); return; }
    if (['Add chore', 'Split expense', 'Add event'].includes(panel || '')) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(new Date(date + 'T12:00:00').getTime()) || localDate(new Date(date + 'T12:00:00')) !== date) {
        setError('Enter a valid date in YYYY-MM-DD format.'); return;
      }
    }
    const numericAmount = Number(amount);
    if (panel === 'Split expense' && (!/^\d+(\.\d{1,2})?$/.test(amount) || !Number.isFinite(numericAmount) || numericAmount <= 0)) {
      setError('Enter your share as a positive amount with up to two decimal places.'); return;
    }
    const id = crypto.randomUUID();
    setData(previous => {
      if (panel === 'Profile') return { ...previous, name: title.trim() };
      if (panel === 'Household') return { ...previous, household: title.trim() };
      if (panel === 'Pet') return { ...previous, pet: { name: title.trim(), lastAttention: previous.pet?.lastAttention || null } };
      if (panel === 'Add chore') return { ...previous, chores: [...previous.chores, { id, title: title.trim(), due: date, completed: false }] };
      if (panel === 'Split expense') return { ...previous, expenses: [...previous.expenses, { id, title: title.trim(), due: date, amount: numericAmount }] };
      if (panel === 'Add event') return { ...previous, events: [...previous.events, { id, title: title.trim(), date }] };
      return previous;
    });
    setPanel(null);
  }

  function toggleChore(id: string) {
    setData(previous => ({ ...previous, chores: previous.chores.map(chore => chore.id === id ? { ...chore, completed: !chore.completed } : chore) }));
  }

  const isForm = ['Profile', 'Household', 'Pet', 'Add chore', 'Split expense', 'Add event'].includes(panel || '');
  const datedForm = ['Add chore', 'Split expense', 'Add event'].includes(panel || '');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.shell}>
        <ScrollView contentContainerStyle={styles.page}>
          <View style={styles.header}>
            <Image source={{ uri: roomiesLogo }} style={styles.logo} resizeMode="contain" accessibilityLabel="Roomies logo" />
            <Pressable accessibilityRole="button" onPress={() => openPanel('Household')} style={({ pressed }) => [styles.household, pressed && styles.pressed]}>
              <Icon name="home" color="#657EEA" size={15} /><Text style={styles.householdName}>{data.household || 'Set up household'}<Text style={styles.householdArrow}>{'\u00A0\u2304'}</Text></Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Notifications" onPress={() => openPanel('Notifications')} style={styles.notification}><Icon name="bell" size={18} /></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={data.name + ' profile'} onPress={() => openPanel('Profile')} style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></Pressable>
          </View>
          <Text accessibilityRole="header" style={styles.greeting}>{greeting}, {data.name}!</Text>
          <Text style={styles.date}>{now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          {!!storageError && <Text accessibilityRole="alert" style={styles.formError}>{storageError}</Text>}
          <View style={styles.treeCard}>
            <View style={styles.treeHeading}><View style={styles.eventCopy}><Text style={styles.cardTitle}>Grow your household tree</Text><Text style={styles.progressCopy}>{weeklyChores.length ? completed + ' of ' + weeklyChores.length + ' chores done this week' : 'Add chores to start growing your tree'}</Text></View><Icon name="tree" color="#657EEA" size={28} /></View>
            <View accessibilityRole="progressbar" accessibilityLabel="Weekly chores" accessibilityValue={{ min: 0, max: weeklyChores.length || 1, now: completed }} style={styles.progressTrack}><View style={[styles.progressFill, { width: (weeklyChores.length ? completed / weeklyChores.length * 100 : 0) + '%' }]} /></View>
            <Text style={styles.rewardText}>Complete your chores to grow together.</Text>
          </View>
          <View style={styles.stats}>
            <Pressable accessibilityRole="button" onPress={() => openPanel('Chores')} style={({ pressed }) => [styles.statCard, styles.choreStat, pressed && styles.pressed]}><Icon name="chores" /><Text style={styles.statNumber}>{todayCount} {todayCount === 1 ? 'chore' : 'chores'}</Text><Text style={styles.statCaption}>on your list today</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={() => openPanel('Expenses')} style={({ pressed }) => [styles.statCard, styles.expenseStat, pressed && styles.pressed]}><Icon name="expenses" /><Text style={styles.statNumber}>{currency.format(totalCents / 100)}</Text><Text style={styles.statCaption}>{nextDue ? 'you owe ? due ' + displayDate(nextDue) : 'No outstanding expenses'}</Text></Pressable>
          </View>
          <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Coming up</Text><Pressable accessibilityRole="button" onPress={() => openPanel('Calendar')} style={styles.calendarLink}><Text style={styles.linkText}>View calendar</Text></Pressable></View>
          <View style={styles.upcoming}>
            {!upcoming.length && <Text style={styles.emptyText}>No upcoming chores or events. Add one below.</Text>}
            {upcoming.map(item => <Pressable key={item.id} accessibilityRole={item.kind === 'chore' ? 'checkbox' : 'button'} accessibilityState={item.kind === 'chore' ? { checked: false } : undefined} accessibilityLabel={item.title} onPress={() => item.kind === 'chore' ? toggleChore(item.id) : openPanel('Calendar')} style={({ pressed }) => [styles.event, pressed && styles.pressed]}><View style={[styles.eventIcon, item.kind === 'chore' ? styles.choreStat : styles.dinnerIcon]}><Icon name={item.kind === 'chore' ? 'trash' : 'calendar'} size={19} /></View><View style={styles.eventCopy}><Text style={styles.eventTitle}>{item.title}</Text><Text style={styles.eventDetail}>{displayDate(item.date)}</Text></View>{item.kind === 'chore' ? <View style={styles.checkbox} /> : <Text style={styles.chevron}>{'\u203A'}</Text>}</Pressable>)}
          </View>
          <View style={styles.petCard}>
            <Image source={{ uri: roomiePet }} style={styles.petImage} resizeMode="contain" accessibilityLabel="Your Roomie Pet" />
            <View style={styles.petCopy}><Text style={styles.petHeading}>My Roomie Pet</Text><Text style={styles.petName}>{data.pet?.name || 'Name your pet'}</Text></View>
            <View style={styles.petActions}><Pressable accessibilityRole="button" onPress={() => openPanel('Pet')} style={({ pressed }) => [styles.petOpen, pressed && styles.pressed]}><Text style={styles.linkText}>{data.pet ? 'Open' : 'Set up'}</Text></Pressable>{data.pet && <Text style={styles.petStatus}>{needsAttention ? 'Needs Attention' : 'Feeling happy'}</Text>}</View>
          </View>
          <View style={styles.quickActions}>{([{ label: 'Add chore', icon: 'add' }, { label: 'Split expense', icon: 'split' }, { label: 'Calendar', icon: 'calendar' }] as const).map(action => <Pressable key={action.label} accessibilityRole="button" onPress={() => openPanel(action.label)} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}><Icon name={action.icon} size={20} /><Text style={styles.quickLabel}>{action.label}</Text></Pressable>)}</View>
        </ScrollView>
        <View accessibilityRole="tablist" accessibilityLabel="Main navigation" style={styles.navigation}>{tabs.map(tab => <Pressable key={tab.label} accessibilityRole="tab" accessibilityState={{ selected: tab.label === 'Home' }} onPress={() => { if (tab.label !== 'Home') openPanel(tab.label); }} style={({ pressed }) => [styles.navItem, pressed && styles.pressed]}><View style={[styles.navIcon, tab.label === 'Home' && styles.activeNav]}><Icon name={tab.icon} color={tab.label === 'Home' ? '#657EEA' : '#737783'} size={20} /></View><Text style={[styles.navLabel, tab.label === 'Home' && styles.activeLabel]}>{tab.label}</Text></Pressable>)}</View>
      </View>
      <Modal visible={panel !== null} transparent animationType="fade" onRequestClose={() => setPanel(null)}>
        <View style={styles.modalBackdrop}><ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalCard} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={styles.sectionTitle}>{panel}</Text>
          {isForm && <>
            <Text style={styles.formLabel}>{panel === 'Profile' ? 'Your name' : panel === 'Household' ? 'Household name' : panel === 'Pet' ? 'Pet name' : 'Title'}</Text>
            <TextInput accessibilityLabel={panel === 'Profile' ? 'Your name' : panel === 'Household' ? 'Household name' : panel === 'Pet' ? 'Pet name' : 'Title'} value={title} onChangeText={setTitle} style={styles.formInput} />
            {datedForm && <><Text style={styles.formLabel}>Date (YYYY-MM-DD)</Text><TextInput accessibilityLabel="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} style={styles.formInput} /></>}
            {panel === 'Split expense' && <><Text style={styles.formLabel}>Your share (USD)</Text><TextInput accessibilityLabel="Your share (USD)" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} style={styles.formInput} /></>}
            {!!error && <Text accessibilityRole="alert" style={styles.formError}>{error}</Text>}
            <Pressable accessibilityRole="button" onPress={save} style={({ pressed }) => [styles.modalButton, pressed && styles.pressed]}><Text style={styles.linkText}>Save</Text></Pressable>
            {panel === 'Pet' && data.pet && <Pressable accessibilityRole="button" onPress={() => setData(previous => ({ ...previous, pet: previous.pet ? { ...previous.pet, lastAttention: new Date().toISOString() } : null }))} style={styles.modalButton}><Text style={styles.linkText}>{needsAttention ? 'Give attention' : 'Feeling happy'}</Text></Pressable>}
          </>}
          {panel === 'Chores' && <>{!data.chores.length && <Text style={styles.emptyText}>No chores yet.</Text>}{data.chores.map(chore => <Pressable key={chore.id} accessibilityRole="checkbox" accessibilityState={{ checked: chore.completed }} onPress={() => toggleChore(chore.id)} style={styles.listRow}><Text style={[styles.eventTitle, chore.completed && styles.completed]}>{chore.title}</Text><Text style={styles.eventDetail}>{displayDate(chore.due)} ? {chore.completed ? 'Completed' : 'Not completed'}</Text></Pressable>)}<Pressable accessibilityRole="button" onPress={() => openPanel('Add chore')} style={styles.modalButton}><Text style={styles.linkText}>Add chore</Text></Pressable></>}
          {panel === 'Expenses' && <>{!data.expenses.length && <Text style={styles.emptyText}>No outstanding expenses.</Text>}{data.expenses.map(expense => <View key={expense.id} style={styles.listRow}><Text style={styles.eventTitle}>{expense.title} ? {currency.format(expense.amount)}</Text><Text style={styles.eventDetail}>Due {displayDate(expense.due)}</Text><Pressable accessibilityRole="button" accessibilityLabel={'Mark ' + expense.title + ' paid'} onPress={() => setData(previous => ({ ...previous, expenses: previous.expenses.filter(item => item.id !== expense.id) }))} style={styles.modalButton}><Text style={styles.linkText}>Mark paid</Text></Pressable></View>)}<Pressable accessibilityRole="button" onPress={() => openPanel('Split expense')} style={styles.modalButton}><Text style={styles.linkText}>Add your expense share</Text></Pressable></>}
          {panel === 'Calendar' && <>{[...upcoming, ...data.expenses.map(expense => ({ id: expense.id, title: expense.title + ' ? ' + currency.format(expense.amount), date: expense.due }))].sort((a, b) => a.date.localeCompare(b.date)).map(item => <View key={item.id} style={styles.listRow}><Text style={styles.eventTitle}>{item.title}</Text><Text style={styles.eventDetail}>{displayDate(item.date)}</Text></View>)}{!upcoming.length && !data.expenses.length && <Text style={styles.emptyText}>No scheduled items yet.</Text>}<Pressable accessibilityRole="button" onPress={() => openPanel('Add event')} style={styles.modalButton}><Text style={styles.linkText}>Add event</Text></Pressable></>}
          {panel === 'Notifications' && <Text style={styles.emptyText}>{todayCount ? todayCount + ' chores are due today.' : 'No chores due today.'}</Text>}
          {panel === 'More' && <>{['Profile', 'Household', 'Pet'].map(item => <Pressable key={item} accessibilityRole="button" onPress={() => openPanel(item)} style={styles.modalButton}><Text style={styles.linkText}>{item}</Text></Pressable>)}</>}
          <Pressable accessibilityRole="button" onPress={() => setPanel(null)} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}><Text style={styles.linkText}>Close</Text></Pressable>
        </ScrollView></View>
      </Modal>
    </SafeAreaView>
  );
}
