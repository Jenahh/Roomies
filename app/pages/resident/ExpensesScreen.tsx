import { randomUUID } from '../../utils/randomUUID';
import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import DashboardIcon, { type IconName } from '../../components/dashboard/DashboardIcon';
import SettleUpAssistant from '../../components/expenses/SettleUpAssistant';
import type { PetMood } from '../../data/roomiePetMood';
import {
  expenseOccurrences, LEDGER_CATEGORIES, memberId, memberSummaries, monthKey, planSettlement, splitCents,
  type ExpenseOccurrence, type HouseholdLedger, type LedgerCategory,
} from '../../features/settlement/ledger';
import type { Transfer } from '../../features/settlement/settlement';
import { formatCents } from '../../features/settlement/explain';
import { styles as s } from '../../styles/ExpensesScreen.styles';

const paths = {
  wallet: 'M20 8V4H4v16h16v-8h-6V8h7v4M17 10h.01',
  Rent: 'M3 10 12 3l9 7M5 9v12h14V9M9 21v-8h6v8',
  Electricity: 'm13 2-9 12h7l-1 8L21 9h-8l1-7',
  Groceries: 'M3 9h18l-2 12H5L3 9ZM8 9l4-7 4 7M9 13v4M15 13v4',
  Internet: 'M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8 16a6 6 0 0 1 8 0M12 20h.01',
  Other: 'M5 3h14v18l-3-2-4 2-4-2-3 2V3ZM8 8h8M8 12h8',
  repeat: 'm18 2 4 4-4 4M2 11V6h20M6 22l-4-4 4-4M22 13v5H2',
} as const;
const iconNames: Record<keyof typeof paths, IconName> = {
  wallet: 'expenses', Rent: 'home', Electricity: 'flame', Groceries: 'dinner', Internet: 'messages', Other: 'split', repeat: 'calendar',
};
const tints: Record<LedgerCategory, string> = { Rent: '#F1EBFF', Electricity: '#FFF2DC', Groceries: '#EAF6EF', Internet: '#EDF0FF', Other: '#F4F4F6' };

function Icon({ name, size = 20 }: { name: keyof typeof paths; size?: number }) {
  if (Platform.OS !== 'web') return <DashboardIcon name={iconNames[name]} color="#737783" size={size} />;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function validDate(value: string) {
  const parsed = new Date(value + 'T12:00:00');
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(parsed.getTime()) && localDate(parsed) === value;
}
const dateLabel = (date: string) => new Date(date + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
const monthLabel = (month: string) => new Date(month + '-15T12:00:00').toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
const signed = (cents: number) => (cents > 0 ? '+' : cents < 0 ? '−' : '') + formatCents(Math.abs(cents));

type Panel = 'add' | 'balances' | 'recurring' | 'all' | 'person' | 'payment';

type ExpensesScreenProps = {
  ledger: HouseholdLedger;
  update: (change: (current: HouseholdLedger) => HouseholdLedger) => void;
  me: string;
  mood: PetMood;
  petColor?: string;
  storageError: string;
  autoOpenAdd?: boolean;
  onAddOpened?: () => void;
};

export default function ExpensesScreen({ ledger, update, me, mood, petColor, storageError, autoOpenAdd = false, onAddOpened }: ExpensesScreenProps) {
  const [panel, setPanel] = useState<Panel | null>(null);
  const [selected, setSelected] = useState<ExpenseOccurrence | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(me);
  const [splitAmong, setSplitAmong] = useState<string[]>([]);
  const [date, setDate] = useState(localDate());
  const [category, setCategory] = useState<LedgerCategory>('Other');
  const [recurring, setRecurring] = useState(false);
  const [personName, setPersonName] = useState('');
  const [paymentTo, setPaymentTo] = useState('');
  const [error, setError] = useState('');

  const today = localDate();
  const month = monthKey(today);
  const members = ledger.members;
  const names = new Map(members.map(member => [member.id, member.name]));
  const nameOf = (id: string) => (names.get(id) ?? id.replace(/^name:/, '')) + (id === me ? ' (you)' : '');
  const labelOf = (id: string) => id === me ? 'You' : names.get(id) ?? id.replace(/^name:/, '');
  const occurrences = expenseOccurrences(ledger, month);
  const thisMonth = occurrences.filter(item => item.month === month);
  const monthlyTotal = thisMonth.reduce((sum, item) => sum + item.amountCents, 0);
  const summaries = memberSummaries(ledger, month);
  const myBalance = summaries.find(item => item.id === me)?.balanceCents ?? 0;
  const plan = planSettlement(ledger, month);
  const myPayees = [...new Set(plan.transfers.filter(item => item.from === me).map(item => item.to))];
  const recurringExpenses = ledger.expenses.filter(item => item.recurring);
  const used = new Set([...ledger.expenses.flatMap(item => [item.paidBy, ...item.splitAmong]), ...ledger.payments.flatMap(item => [item.from, item.to])]);

  function openAdd() {
    setTitle(''); setAmount(''); setPaidBy(me); setSplitAmong(members.map(member => member.id)); setDate(localDate());
    setCategory('Other'); setRecurring(false); setError(''); setSelected(null); setPanel('add');
  }
  useEffect(() => {
    if (!autoOpenAdd) return;
    openAdd();
    onAddOpened?.();
  }, [autoOpenAdd]);

  function close() { setPanel(null); setSelected(null); setConfirmDelete(false); setError(''); }

  function saveExpense() {
    const totalCents = Math.round(Number(amount) * 100);
    if (!title.trim()) { setError('Enter what the expense was for.'); return; }
    if (!/^\d+(\.\d{1,2})?$/.test(amount.trim()) || totalCents <= 0 || totalCents > 100_000_000) { setError('Enter an amount above $0 with up to two decimal places.'); return; }
    if (!splitAmong.length) { setError('Choose at least one person to split with.'); return; }
    if (totalCents < splitAmong.length) { setError('The amount must be at least one cent per person.'); return; }
    if (!validDate(date)) { setError('Enter a valid date in YYYY-MM-DD format.'); return; }
    update(current => ({ ...current, expenses: [...current.expenses, { id: randomUUID(), title: title.trim(), category, amountCents: totalCents, paidBy, splitAmong: [...splitAmong], date, ...(recurring ? { recurring: {} } : {}) }] }));
    close();
  }

  function recordTransfer(transfer: Transfer) {
    update(current => ({ ...current, payments: [...current.payments, { id: randomUUID(), from: transfer.from, to: transfer.to, amountCents: transfer.cents, date: today }] }));
  }

  function savePayment() {
    const cents = Math.round(Number(amount) * 100);
    if (!paymentTo) { setError('Choose who you paid.'); return; }
    if (!/^\d+(\.\d{1,2})?$/.test(amount.trim()) || cents <= 0) { setError('Enter an amount above $0 with up to two decimal places.'); return; }
    recordTransfer({ from: me, to: paymentTo, cents });
    setPanel('balances'); setAmount(''); setError('');
  }

  function addPerson() {
    const name = personName.trim();
    if (!name) { setError('Enter a name.'); return; }
    if (members.some(member => member.id === memberId(name))) { setError(`${name} is already in this household.`); return; }
    update(current => ({ ...current, members: [...current.members, { id: memberId(name), name, manual: true }] }));
    setPersonName(''); setError(''); setPanel('balances');
  }

  function deleteSelected() {
    if (!selected) return;
    update(current => ({ ...current, expenses: current.expenses.filter(item => item.id !== selected.sourceId) }));
    close();
  }

  function stopRepeating() {
    if (!selected) return;
    update(current => ({ ...current, expenses: current.expenses.map(item => item.id === selected.sourceId ? { ...item, recurring: { endMonth: month } } : item) }));
    close();
  }

  function expenseRow(item: ExpenseOccurrence) {
    const shares = splitCents(item.amountCents, item.splitAmong);
    const each = Math.round(item.amountCents / shares.size);
    return <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${item.title}, ${formatCents(item.amountCents)}, paid by ${labelOf(item.paidBy)}`} onPress={() => { setPanel(null); setConfirmDelete(false); setSelected(item); }} style={({ pressed }) => [s.expense, pressed && s.pressed]}>
      <View style={[s.iconBox, { backgroundColor: tints[item.category] }]}><Icon name={item.category} /></View>
      <View style={s.copy}><Text numberOfLines={1} style={s.expenseTitle}>{item.title}</Text><Text style={s.detail}>Paid by {nameOf(item.paidBy)} · {dateLabel(item.date)}{item.recurring ? ' · Monthly' : ''}</Text></View>
      <View style={s.amounts}><Text style={s.expenseTitle}>{formatCents(item.amountCents)}</Text><Text style={s.detail}>{shares.size === 1 ? `${labelOf([...shares.keys()][0])} only` : `${formatCents(each)} each`}</Text></View>
    </Pressable>;
  }

  const chip = (label: string, active: boolean, onPress: () => void, role: 'radio' | 'checkbox' = 'radio') => (
    <Pressable key={label} accessibilityRole={role} accessibilityState={{ checked: active }} onPress={onPress} style={[s.chip, active && s.activeChip]}><Text style={s.chipText}>{label}</Text></Pressable>
  );

  const splitPreview = (() => {
    const cents = Math.round(Number(amount) * 100);
    if (!splitAmong.length || !/^\d+(\.\d{1,2})?$/.test(amount.trim()) || cents <= 0) return '';
    return `${formatCents(Math.floor(cents / splitAmong.length))}${cents % splitAmong.length ? '–' + formatCents(Math.ceil(cents / splitAmong.length)) : ''} each, split between ${splitAmong.length} ${splitAmong.length === 1 ? 'person' : 'people'}`;
  })();

  const modalTitle = selected ? selected.title : panel === 'add' ? 'Add expense' : panel === 'balances' ? 'Net balances' : panel === 'recurring' ? 'Recurring monthly expenses'
    : panel === 'all' ? 'All expenses' : panel === 'person' ? 'Add someone to split with' : 'Record a payment';

  return <>
    <View style={s.header}>
      <View style={s.copy}>
        <Text accessibilityRole="header" style={s.title}>Expenses</Text>
        <Text style={s.subtitle}>{monthLabel(month)} · Split equally, {members.length} {members.length === 1 ? 'person' : 'roommates'}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="View net balances" onPress={() => setPanel('balances')} style={s.headerButton}><Icon name="Other" size={18} /></Pressable>
    </View>
    {!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}

    <View style={[s.summary, myBalance > 0 && s.owedSummary]}>
      <View style={s.row}>
        <View style={s.copy}>
          <Text style={s.summaryLabel}>{myBalance < 0 ? `You owe${myPayees.length === 1 ? ' ' + labelOf(myPayees[0]) : ''}` : myBalance > 0 ? "You're owed" : "You're all settled up"}</Text>
          <Text style={s.balance}>{formatCents(Math.abs(myBalance))}</Text>
        </View>
        <View style={[s.wallet, myBalance > 0 && s.owedWallet]}><Icon name="wallet" size={28} /></View>
      </View>
      <Text style={s.summaryDetail}>Monthly total {formatCents(monthlyTotal)} · {thisMonth.length} {thisMonth.length === 1 ? 'expense' : 'expenses'} this month</Text>
    </View>

    <View style={s.section}>
      <Text accessibilityRole="header" style={s.sectionTitle}>Who owes what</Text>
      <Pressable accessibilityRole="button" onPress={() => setPanel('balances')} style={s.linkButton}><Text style={s.link}>Net balances</Text></Pressable>
    </View>
    {members.length > 1
      ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.balances}>
          {summaries.map(item => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${nameOf(item.id)}: ${item.balanceCents < 0 ? 'owes' : item.balanceCents > 0 ? 'is owed' : 'even'} ${formatCents(Math.abs(item.balanceCents))}`} onPress={() => setPanel('balances')} style={s.balanceCard}>
            <Text numberOfLines={2} style={s.person}>{item.id === me ? `${names.get(me) ?? 'You'}\n(you)` : names.get(item.id) ?? item.id}</Text>
            <Text style={[s.personAmount, item.balanceCents > 0 && s.positive, item.balanceCents < 0 && s.negative]}>{signed(item.balanceCents)}</Text>
          </Pressable>)}
        </ScrollView>
      : <View style={s.clearCard}>
          <Text style={s.expenseTitle}>Add the people you share costs with</Text>
          <Text style={s.detail}>Roommates assigned to your household appear here automatically. You can also add someone yourself.</Text>
          <Pressable accessibilityRole="button" onPress={() => { setError(''); setPanel('person'); }} style={s.linkButton}><Text style={s.link}>Add someone</Text></Pressable>
        </View>}

    {members.length > 1 && <SettleUpAssistant plan={plan} summaries={summaries} me={me} nameOf={nameOf} labelOf={labelOf} petColor={petColor} mood={mood} onRecord={recordTransfer} />}

    <View style={s.section}>
      <Text accessibilityRole="header" style={s.sectionTitle}>Shared this month</Text>
      <Pressable accessibilityRole="button" onPress={() => setPanel('all')} style={s.linkButton}><Text style={s.link}>{thisMonth.length} {thisMonth.length === 1 ? 'expense' : 'expenses'} · See all</Text></Pressable>
    </View>
    <View style={s.expenses}>
      {thisMonth.length ? thisMonth.map(expenseRow) : <View style={s.empty}><Text style={s.expenseTitle}>Keep household costs in one place</Text><Text style={s.subtitle}>Add rent, groceries, or a bill to split with your roomies.</Text></View>}
    </View>
    <Pressable accessibilityRole="button" onPress={() => setPanel('recurring')} style={s.recurring}><Icon name="repeat" size={17} /><Text style={s.recurringText}>Recurring monthly expenses ({recurringExpenses.length})</Text><Text style={s.link}>›</Text></Pressable>
    <Pressable accessibilityRole="button" onPress={openAdd} style={({ pressed }) => [s.addButton, pressed && s.pressed]}><Text style={s.addText}>+  Add Expense</Text></Pressable>

    <Modal visible={panel !== null || selected !== null} transparent animationType="fade" onRequestClose={close}>
      <View style={s.backdrop}>
        <ScrollView showsVerticalScrollIndicator={false} style={s.modal} contentContainerStyle={s.form} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={s.sectionTitle}>{modalTitle}</Text>

          {panel === 'add' && <>
            <Text style={s.label}>What was it for?</Text>
            <TextInput autoFocus accessibilityLabel="Expense title" placeholder="e.g. Rent" value={title} onChangeText={setTitle} style={s.input} />
            <Text style={s.label}>Total amount (USD)</Text>
            <TextInput accessibilityLabel="Total amount (USD)" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} placeholder="0.00" style={s.input} />
            <Text style={s.label}>Paid by</Text>
            <View style={s.chips}>{members.map(member => chip(labelOf(member.id), paidBy === member.id, () => setPaidBy(member.id)))}</View>
            <Text style={s.label}>Split equally between</Text>
            <View style={s.chips}>{members.map(member => chip(labelOf(member.id), splitAmong.includes(member.id), () => setSplitAmong(current => current.includes(member.id) ? current.filter(id => id !== member.id) : [...current, member.id]), 'checkbox'))}</View>
            {!!splitPreview && <Text style={s.hint}>{splitPreview}</Text>}
            <Text style={s.label}>Date (YYYY-MM-DD)</Text>
            <TextInput accessibilityLabel="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} style={s.input} />
            <Text style={s.label}>Category</Text>
            <View style={s.chips}>{LEDGER_CATEGORIES.map(kind => chip(kind, category === kind, () => setCategory(kind)))}</View>
            <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: recurring }} onPress={() => setRecurring(!recurring)} style={s.recurring}><Text style={s.link}>{recurring ? '☑' : '☐'} Repeat every month (rent, internet, …)</Text></Pressable>
            {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
            <Pressable accessibilityRole="button" onPress={saveExpense} style={({ pressed }) => [s.addButton, pressed && s.pressed]}><Text style={s.addText}>Save expense</Text></Pressable>
          </>}

          {panel === 'balances' && <>
            <Text style={s.subtitle}>Positive means the household owes them; negative means they owe the household. Balances always add up to zero.</Text>
            {summaries.map(item => <View key={item.id} style={[s.listRow, s.divider]}>
              <View style={s.copy}><Text style={s.expenseTitle}>{nameOf(item.id)}</Text><Text style={s.detail}>Paid {formatCents(item.paidCents)} · Share {formatCents(item.shareCents)}{item.sentCents || item.receivedCents ? ` · Sent ${formatCents(item.sentCents)} · Received ${formatCents(item.receivedCents)}` : ''}</Text></View>
              <Text style={[s.personAmount, item.balanceCents > 0 && s.positive, item.balanceCents < 0 && s.negative]}>{signed(item.balanceCents)}</Text>
              {members.find(member => member.id === item.id)?.manual && !used.has(item.id) && <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${nameOf(item.id)}`} onPress={() => update(current => ({ ...current, members: current.members.filter(member => member.id !== item.id) }))}><Text style={s.link}>Remove</Text></Pressable>}
            </View>)}
            <View style={s.chips}>
              <Pressable accessibilityRole="button" onPress={() => { setError(''); setAmount(''); setPaymentTo(''); setPanel('payment'); }} style={s.secondaryButton}><Text style={s.link}>Record a payment</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={() => { setError(''); setPanel('person'); }} style={s.secondaryButton}><Text style={s.link}>Add someone</Text></Pressable>
            </View>
            {ledger.payments.length > 0 && <>
              <Text style={s.label}>Payments between roommates</Text>
              {[...ledger.payments].reverse().map(payment => <View key={payment.id} style={s.listRow}>
                <Text style={[s.detail, { flex: 1 }]}>{labelOf(payment.from)} paid {labelOf(payment.to)} {formatCents(payment.amountCents)} · {dateLabel(payment.date)}</Text>
                {(payment.from === me || payment.to === me) && <Pressable accessibilityRole="button" accessibilityLabel={`Undo payment of ${formatCents(payment.amountCents)}`} onPress={() => update(current => ({ ...current, payments: current.payments.filter(item => item.id !== payment.id) }))}><Text style={s.link}>Undo</Text></Pressable>}
              </View>)}
            </>}
          </>}

          {panel === 'payment' && <>
            <Text style={s.subtitle}>Paid a roommate outside the suggested plan? Record it so everyone's balances stay accurate.</Text>
            <Text style={s.label}>Who did you pay?</Text>
            <View style={s.chips}>{members.filter(member => member.id !== me).map(member => chip(member.name, paymentTo === member.id, () => setPaymentTo(member.id)))}</View>
            <Text style={s.label}>Amount (USD)</Text>
            <TextInput accessibilityLabel="Payment amount (USD)" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} placeholder="0.00" style={s.input} />
            {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
            <Pressable accessibilityRole="button" onPress={savePayment} style={({ pressed }) => [s.addButton, pressed && s.pressed]}><Text style={s.addText}>Record payment</Text></Pressable>
          </>}

          {panel === 'person' && <>
            <Text style={s.subtitle}>Add a roommate, guest or partner who shares some costs. Assigned household members are added automatically.</Text>
            <TextInput autoFocus accessibilityLabel="Name" placeholder="Name" value={personName} onChangeText={setPersonName} style={s.input} />
            {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
            <Pressable accessibilityRole="button" onPress={addPerson} style={({ pressed }) => [s.addButton, pressed && s.pressed]}><Text style={s.addText}>Add</Text></Pressable>
          </>}

          {panel === 'recurring' && <>
            <Text style={s.subtitle}>Set up once and added automatically on the same day each month.</Text>
            {recurringExpenses.map(item => {
              const latest = [...occurrences].reverse().find(occurrence => occurrence.sourceId === item.id);
              return <View key={item.id}>
                {latest ? expenseRow(latest) : <Text style={s.detail}>{item.title} starts {dateLabel(item.date)}</Text>}
                {item.recurring?.endMonth && <Text style={s.detail}>Ended after {monthLabel(item.recurring.endMonth)}</Text>}
              </View>;
            })}
            {!recurringExpenses.length && <Text style={s.subtitle}>No recurring expenses yet. Tick "Repeat every month" when adding rent or a bill.</Text>}
          </>}

          {panel === 'all' && <>
            {[...occurrences].reverse().map(expenseRow)}
            {!occurrences.length && <Text style={s.subtitle}>No expenses yet.</Text>}
          </>}

          {selected && (() => {
            const shares = splitCents(selected.amountCents, selected.splitAmong);
            return <>
              <Text style={s.subtitle}>{selected.category} · {dateLabel(selected.date)}{selected.recurring ? (selected.recurring.endMonth ? ` · Monthly through ${monthLabel(selected.recurring.endMonth)}` : ' · Repeats monthly') : ''}</Text>
              <Text style={s.balance}>{formatCents(selected.amountCents)}</Text>
              <Text style={s.expenseTitle}>Paid by {nameOf(selected.paidBy)}</Text>
              <Text style={s.label}>Split between</Text>
              {[...shares].map(([id, share]) => <View key={id} style={s.listRow}><Text style={s.detail}>{nameOf(id)}</Text><Text style={s.expenseTitle}>{formatCents(share)}</Text></View>)}
              {selected.recurring && !selected.recurring.endMonth && <Pressable accessibilityRole="button" onPress={stopRepeating} style={s.secondaryButton}><Text style={s.link}>Stop repeating after this month</Text></Pressable>}
              {!confirmDelete
                ? <Pressable accessibilityRole="button" onPress={() => setConfirmDelete(true)} style={s.dangerButton}><Text style={s.dangerText}>Delete expense</Text></Pressable>
                : <>
                    <Text style={s.hint}>{selected.recurring ? 'This removes every month of this recurring expense and updates everyone\'s balances.' : 'This updates everyone\'s balances.'}</Text>
                    <Pressable accessibilityRole="button" onPress={deleteSelected} style={s.dangerButton}><Text style={s.dangerText}>Yes, delete it</Text></Pressable>
                  </>}
            </>;
          })()}

          <Pressable accessibilityRole="button" onPress={panel === 'payment' || panel === 'person' ? () => { setError(''); setPanel('balances'); } : close} style={s.close}><Text style={s.link}>{panel === 'add' ? 'Cancel' : panel === 'payment' || panel === 'person' ? 'Back' : 'Close'}</Text></Pressable>
        </ScrollView>
      </View>
    </Modal>
  </>;
}
