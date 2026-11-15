import { demoResident, demoResidentHousehold } from '../../data/demoAccount';
import { ChoreBadge } from '../../features/scheduler/ChorePresets';
import RoomieCheckInScreen from '../../pages/resident/RoomieCheckInScreen';
import { getPetMood } from '../../data/roomiePetMood';
import AchievementsScreen from '../../pages/resident/AchievementsScreen';
import DashboardStatCard from './DashboardStatCard';
import Icon from './DashboardIcon';
import DashboardHeader from './DashboardHeader';
import DashboardNavigation from './DashboardNavigation';
import HouseholdProgressCard from './HouseholdProgressCard';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Modal, Platform, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';

import RoomieCustomizationScreen from '../../pages/resident/RoomieCustomizationScreen';
import { styles } from '../../styles/ResidentDashboard.styles';
import RoomiePet from '../RoomiePet';
import type { ResidentUser } from '../../data/demoAccount';
import { useResidentData } from '../../hooks/useResidentData';
import ChoresScreen from '../../pages/resident/ChoresScreen';
import ExpensesScreen from '../../pages/resident/ExpensesScreen';
import CalendarScreen from '../../pages/resident/CalendarScreen';
import ProfileScreen from '../../pages/resident/ProfileScreen';
import NotificationsScreen from '../../pages/resident/NotificationsScreen';
import MaintenanceScreen from '../../pages/resident/MaintenanceScreen';
import ContactRAScreen from '../../pages/resident/ContactRAScreen';
import './quick-add.css';

function localDate(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function displayDate(value: string) {
  return new Date(value + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export type HouseholdDashboardProps = { user: ResidentUser; onSignOut: () => void };

export default function HouseholdDashboard({ user, onSignOut }: HouseholdDashboardProps) {
  const assignedHousehold = user.email.toLowerCase() === demoResident.email ? demoResidentHousehold : undefined;
  const hasRoomiePet = user.role === 'resident';
  const { data, setData, storageError } = useResidentData(user.email, user.name);
  const [activeTab, setActiveTab] = useState('Home');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddTarget, setQuickAddTarget] = useState<'Chores' | 'Expenses' | 'Calendar' | null>(null);
  const pageScroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const navigationTab = (activeTab === 'Notifications' || activeTab === 'Achievements' || activeTab === 'PetCheckIn') ? 'Home' : (activeTab === 'Maintenance' || activeTab === 'ContactRA' || activeTab === 'CustomizePet') ? 'Profile' : activeTab;
  useEffect(() => {
    pageScroll.current?.scrollTo({ y: 0, animated: false });
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') window.scrollTo(0, 0);
  }, [activeTab]);
  const [now, setNow] = useState(() => new Date());
  const [panel, setPanel] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const today = localDate(now);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - (now.getDay() + 6) % 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  const weeklyChores = data.chores.filter(chore => chore.due >= localDate(weekStart) && chore.due < localDate(weekEnd));
  const completed = weeklyChores.filter(chore => chore.completed).length;
  const todayCount = data.chores.filter(chore => !chore.completed && chore.due === today).length;
  const unpaidExpenses = data.expenses.filter(expense => !expense.settled);
  const totalCents = unpaidExpenses.reduce((total, expense) => total + Math.round(expense.amount * 100), 0);
  const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const petMood = getPetMood(data, now);
  const needsAttention = data.pet && (!data.pet.lastAttention || now.getTime() - new Date(data.pet.lastAttention).getTime() >= 86400000);
  const upcoming = [
    ...data.chores.filter(chore => !chore.completed).map(chore => ({ ...chore, date: chore.due, kind: 'chore' as const })),
    ...data.events.filter(event => event.date >= today).map(event => ({ ...event, kind: 'event' as const })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  function openPanel(next: string) {
    if (next === 'Pet' && !hasRoomiePet) return;
    if (next === 'Notifications') { setActiveTab('Notifications'); return; }
    if (next === 'Chores' || next === 'Expenses' || next === 'Calendar' || next === 'Profile') { setActiveTab(next); return; }
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
      if (panel === 'Pet') return { ...previous, pet: { ...previous.pet, name: title.trim(), lastAttention: previous.pet?.lastAttention || null } };
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

  const isForm = ['Profile', 'Pet', 'Add chore', 'Split expense', 'Add event'].includes(panel || '');
  const datedForm = ['Add chore', 'Split expense', 'Add event'].includes(panel || '');
  const quickAddOptions = ([
    ['Chores', 'Add chore', 'chores'],
    ['Expenses', 'Add expense', 'expenses'],
    ['Calendar', 'Add event', 'calendar'],
  ] as const).map(([tab, label, action], index) => {
    const option = (
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => { setQuickAddTarget(tab); setActiveTab(tab); setQuickAddOpen(false); }} style={({ pressed }) => [styles.quickAddOption, pressed && styles.pressed]}>
        <View style={styles.quickAddOptionContent}>
          <RoomiePet action={action} color={data.pet?.color} mood={petMood} size={72} />
        </View>
      </Pressable>
    );
    if (Platform.OS === 'web') return <div key={tab} className="quick-add-option">{option}</div>;
    const positions = [{ right: 8, bottom: 132 }, { right: 88, bottom: 78 }, { right: 132, bottom: 8 }];
    return <View key={tab} pointerEvents={quickAddOpen ? 'auto' : 'none'} style={[styles.quickAddOptionWrapper, positions[index], !quickAddOpen && styles.quickAddOptionHidden]}>{option}</View>;
  });

  const residentHeader = <DashboardHeader household={data.household} pet={data.pet} mood={petMood} onHousehold={() => openPanel('Household')} onNotifications={() => openPanel('Notifications')} onPet={() => setActiveTab('CustomizePet')} />;
  function handleQuickAdd() {
    if (quickAddOpen) {
      setQuickAddOpen(false);
      return;
    }
    if (activeTab === 'Chores' || activeTab === 'Expenses' || activeTab === 'Calendar') {
      setQuickAddTarget(activeTab);
      return;
    }
    setQuickAddOpen(true);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.shell}>
        <ScrollView ref={pageScroll} contentContainerStyle={styles.page}>
        {residentHeader}
        {activeTab === 'PetCheckIn' ? <RoomieCheckInScreen data={data} setData={setData} now={now} storageError={storageError} onBack={() => setActiveTab('Home')} onExpenses={() => setActiveTab('Expenses')} /> : activeTab === 'Achievements' ? <AchievementsScreen data={data} now={now} onBack={() => setActiveTab('Home')} /> : activeTab === 'Notifications' ? <NotificationsScreen data={data} setData={setData} mood={petMood} storageError={storageError} onBack={() => setActiveTab('Home')} /> : activeTab === 'CustomizePet' && hasRoomiePet ? <RoomieCustomizationScreen data={data} setData={setData} storageError={storageError} onBack={() => setActiveTab('Profile')} /> : activeTab === 'ContactRA' ? <ContactRAScreen data={data} setData={setData} storageError={storageError} onBack={() => setActiveTab('Profile')} /> : activeTab === 'Maintenance' ? <MaintenanceScreen data={data} setData={setData} storageError={storageError} onBack={() => setActiveTab('Profile')} /> : activeTab === 'Chores' ? <ChoresScreen assignedHousehold={assignedHousehold} data={data} setData={setData} storageError={storageError} onPet={hasRoomiePet ? () => setActiveTab('CustomizePet') : undefined} autoOpenAdd={quickAddTarget === 'Chores'} onAddOpened={() => setQuickAddTarget(null)} /> : activeTab === 'Expenses' ? <ExpensesScreen data={data} setData={setData} mood={petMood} storageError={storageError} autoOpenAdd={quickAddTarget === 'Expenses'} onAddOpened={() => setQuickAddTarget(null)} /> : activeTab === 'Calendar' ? <CalendarScreen data={data} setData={setData} mood={petMood} storageError={storageError} autoOpenAdd={quickAddTarget === 'Calendar'} onAddOpened={() => setQuickAddTarget(null)} /> : activeTab === 'Profile' ? <ProfileScreen onSignOut={onSignOut} user={user} data={data} setData={setData} storageError={storageError} onMaintenance={() => setActiveTab('Maintenance')} onContactRA={() => setActiveTab('ContactRA')} /> : <>
          <Text accessibilityRole="header" style={styles.greeting}>{greeting}, {data.name}!</Text>
          {!!storageError && <Text accessibilityRole="alert" style={styles.formError}>{storageError}</Text>}
          <HouseholdProgressCard total={weeklyChores.length} completed={completed} />
          <View style={styles.stats}>
            <DashboardStatCard action="chores" color={data.pet?.color} mood={petMood} value={todayCount + (todayCount === 1 ? ' chore' : ' chores')} onPress={() => openPanel('Chores')} style={styles.choreStat} />
            <DashboardStatCard action="expenses" color={data.pet?.color} mood={petMood} value={currency.format(totalCents / 100)} onPress={() => openPanel('Expenses')} style={styles.expenseStat} />
          </View>
          <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Coming up</Text></View>
          <View style={styles.upcoming}>
            {!upcoming.length && <Text style={styles.emptyText}>No upcoming chores or events. Add one below.</Text>}
            {upcoming.map(item => <Pressable key={item.id} accessibilityRole={item.kind === 'chore' ? 'checkbox' : 'button'} accessibilityState={item.kind === 'chore' ? { checked: false } : undefined} accessibilityLabel={item.title} onPress={() => item.kind === 'chore' ? toggleChore(item.id) : openPanel('Calendar')} style={({ pressed }) => [styles.event, pressed && styles.pressed]}><RoomiePet action={item.kind === 'chore' ? 'chores' : 'calendar'} color={data.pet?.color} mood={petMood} size={50} /><View style={styles.eventCopy}><Text style={styles.eventTitle}>{item.title}</Text><Text style={styles.eventDetail}>{displayDate(item.date)}</Text></View>{item.kind === 'chore' ? <View style={styles.checkbox} /> : <Text style={styles.chevron}>{'\u203A'}</Text>}</Pressable>)}
          </View>
          </>}
        </ScrollView>
        <View pointerEvents="box-none" style={styles.quickAddContainer}>
          {Platform.OS === 'web' ? (
            <div className={`quick-add-menu${quickAddOpen ? ' is-open' : ''}`}>
              <View pointerEvents={quickAddOpen ? 'auto' : 'none'} accessibilityElementsHidden={!quickAddOpen} style={styles.quickAddMenu}>{quickAddOptions}</View>
            </div>
          ) : (
            <View pointerEvents={quickAddOpen ? 'auto' : 'none'} accessibilityElementsHidden={!quickAddOpen} style={[styles.quickAddMenu, !quickAddOpen && styles.quickAddMenuHidden]}>{quickAddOptions}</View>
          )}
          {Platform.OS === 'web' ? (
            <div className={`quick-add-button${quickAddOpen ? ' is-open' : ''}`}>
              <Pressable accessibilityRole="button" accessibilityLabel={quickAddOpen ? 'Close quick add menu' : activeTab === 'Chores' ? 'Add chore' : activeTab === 'Expenses' ? 'Add expense' : activeTab === 'Calendar' ? 'Add event' : 'Add'} accessibilityState={{ expanded: quickAddOpen }} onPress={handleQuickAdd} style={({ pressed }) => [styles.quickAddButton, pressed && styles.pressed]}>
                <Icon name="add" color="#FFFFFF" size={25} />
              </Pressable>
            </div>
          ) : (
            <View style={styles.quickAddButtonWrapper}>
              <Pressable accessibilityRole="button" accessibilityLabel={quickAddOpen ? 'Close quick add menu' : activeTab === 'Chores' ? 'Add chore' : activeTab === 'Expenses' ? 'Add expense' : activeTab === 'Calendar' ? 'Add event' : 'Add'} accessibilityState={{ expanded: quickAddOpen }} onPress={handleQuickAdd} style={({ pressed }) => [styles.quickAddButton, pressed && styles.pressed]}>
                <Icon name="add" color="#FFFFFF" size={25} />
              </Pressable>
            </View>
          )}
        </View>
        <DashboardNavigation activeTab={navigationTab} onNavigate={tab => { setQuickAddOpen(false); setQuickAddTarget(null); setActiveTab(tab); }} />
      </View>
      <Modal visible={panel === 'Household'} transparent animationType="slide" onRequestClose={() => setPanel(null)}>
        <View style={styles.sheetBackdrop}>
          <Pressable accessibilityRole="button" accessibilityLabel="Dismiss household notice" onPress={() => setPanel(null)} style={styles.sheetDismiss} />
          <View style={styles.householdSheet}>
            <View style={styles.sheetHandle} />
            <Text accessibilityRole="header" style={styles.sectionTitle}>Your household</Text>
            <Text style={styles.modalText}>You cannot change your household. Contact your property management if you believe this is an issue.</Text>
            <Pressable accessibilityRole="button" onPress={() => setPanel(null)} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}><Text style={styles.linkText}>Got it</Text></Pressable>
          </View>
        </View>
      </Modal>
      <Modal visible={panel !== null && panel !== 'Household'} transparent animationType="fade" onRequestClose={() => setPanel(null)}>
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
          {panel === 'Calendar' && <>{[...upcoming, ...unpaidExpenses.map(expense => ({ id: expense.id, title: expense.title + ' ? ' + currency.format(expense.amount), date: expense.due }))].sort((a, b) => a.date.localeCompare(b.date)).map(item => <View key={item.id} style={styles.listRow}><Text style={styles.eventTitle}>{item.title}</Text><Text style={styles.eventDetail}>{displayDate(item.date)}</Text></View>)}{!upcoming.length && !unpaidExpenses.length && <Text style={styles.emptyText}>No scheduled items yet.</Text>}<Pressable accessibilityRole="button" onPress={() => openPanel('Add event')} style={styles.modalButton}><Text style={styles.linkText}>Add event</Text></Pressable></>}
          <Pressable accessibilityRole="button" onPress={() => setPanel(null)} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}><Text style={styles.linkText}>Close</Text></Pressable>
        </ScrollView></View>
      </Modal>
    </SafeAreaView>
  );
}
