import { randomUUID } from '../../utils/randomUUID';
import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import DashboardIcon, { type IconName } from '../../components/dashboard/DashboardIcon';
import SettleUpAssistant from '../../components/expenses/SettleUpAssistant';
import type { PetMood } from '../../data/roomiePetMood';
import {
  expenseOccurrences, memberId, memberSummaries, monthKey, planSettlement, splitCents,
  type ExpenseOccurrence, type HouseholdLedger, type LedgerCategory,
} from '../../features/settlement/ledger';
import type { Transfer } from '../../features/settlement/settlement';
import { formatBalance, formatCents } from '../../features/settlement/explain';
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

/** Bills that people pick from instead of physically typing. "Other" lets them name anything they please. */
const PRESETS: { category: LedgerCategory; monthly: boolean }[] = [
  { category: 'Rent', monthly: true },
  { category: 'Electricity', monthly: true },
  { category: 'Internet', monthly: true },
  { category: 'Groceries', monthly: false },
];

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
const validAmount = (value: string) => /^\d+(\.\d{1,2})?$/.test(value.trim()) && Number(value) > 0;

type Panel = 'add' | 'balances' | 'recurring' | 'all' | 'person' | 'payment';
type When = 'today' | 'yesterday' | 'other';

type ExpensesScreenProps = {
  ledger: HouseholdLedger;
  update: (change: (current: HouseholdLedger) => HouseholdLedger) => void;
  me: string;
  mood: PetMood;
  petColor?: string;
  storageError: string;
  /** Opened by the quick-add plus button. */
  autoOpenAdd?: boolean;
  onAddOpened?: () => void;
};

export default function ExpensesScreen({ ledger, update, me, mood, petColor, storageError, autoOpenAdd = false, onAddOpened }: ExpensesScreenProps) {
  const [panel, setPanel] = useState<Panel | null>(null);
  const [selected, setSelected] = useState<ExpenseOccurrence | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [category, setCategory] = useState<LedgerCategory | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(me);
  const [splitAmong, setSplitAmong] = useState<string[]>([]);
  const [when, setWhen] = useState<When>('today');
  const [otherDate, setOtherDate] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [personName, setPersonName] = useState('');
  const [paymentTo, setPaymentTo] = useState('');
  const [error, setError] = useState('');

  const today = localDate();
  const month = monthKey(today);
  const members = ledger.members;
  const names = new Map(members.map(member => [member.id, member.name]));
  const labelOf = (id: string) => id === me ? 'You' : names.get(id) ?? id.replace(/^name:/, '');
  const occurrences = expenseOccurrences(ledger, month);
  const thisMonth = occurrences.filter(item => item.month === month).reverse();
  const monthlyTotal = thisMonth.reduce((sum, item) => sum + item.amountCents, 0);
  const summaries = memberSummaries(ledger, month);
  const myBalance = summaries.find(item => item.id === me)?.balanceCents ?? 0;
  const plan = planSettlement(ledger, month);
  const recurringExpenses = ledger.expenses.filter(item => item.recurring);
  const used = new Set([...ledger.expenses.flatMap(item => [item.paidBy, ...item.splitAmong]), ...ledger.payments.flatMap(item => [item.from, item.to])]);

  function openAdd() {
    setCategory(null); setCustomTitle(''); setAmount(''); setPaidBy(me); setSplitAmong(members.map(member => member.id));
    setWhen('today'); setOtherDate(today); setRecurring(false); setError(''); setSelected(null); setPanel('add');
  }
  useEffect(() => {
    if (!autoOpenAdd) return;
    openAdd();
    onAddOpened?.();
  }, [autoOpenAdd]);

  function close() { setPanel(null); setSelected(null); setConfirmDelete(false); setError(''); }

  /** Picking a preset fills in last time's amount and whether or not it repeats monthly. */
  function pickPreset(next: LedgerCategory) {
    setCategory(next);
    setError('');
    if (next === 'Other') { setRecurring(false); return; }
    const last = [...ledger.expenses].reverse().find(item => item.category === next && item.title === next);
    if (last) setAmount(String(last.amountCents / 100));
    setRecurring(PRESETS.find(item => item.category === next)?.monthly ?? false);
  }

  function saveExpense() {
    const title = category === 'Other' ? customTitle.trim() : category;
    const totalCents = Math.round(Number(amount) * 100);
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const date = when === 'today' ? today : when === 'yesterday' ? localDate(yesterday) : otherDate.trim();
    if (!category) { setError('Pick what the expense is for.'); return; }
    if (!title) { setError('Name the expense.'); return; }
    if (!validAmount(amount) || totalCents > 100_000_000) { setError('Enter an amount, like 45 or 45.50.'); return; }
    if (!splitAmong.length) { setError('Pick at least one person.'); return; }
    if (totalCents < splitAmong.length) { setError('Amount is too small to split.'); return; }
    if (!validDate(date)) { setError('Enter the date as YYYY-MM-DD.'); return; }
    update(current => ({ ...current, expenses: [...current.expenses, { id: randomUUID(), title, category, amountCents: totalCents, paidBy, splitAmong: [...splitAmong], date, ...(recurring ? { recurring: {} } : {}) }] }));
    close();
  }

  function recordTransfer(transfer: Transfer) {
    update(current => ({ ...current, payments: [...current.payments, { id: randomUUID(), from: transfer.from, to: transfer.to, amountCents: transfer.cents, date: today }] }));
  }

  function savePayment() {
    if (!paymentTo) { setError('Pick who you paid.'); return; }
    if (!validAmount(amount)) { setError('Enter an amount, like 45 or 45.50.'); return; }
    recordTransfer({ from: me, to: paymentTo, cents: Math.round(Number(amount) * 100) });
    setPanel('balances'); setAmount(''); setError('');
  }

  function addPerson() {
    const name = personName.trim();
    if (!name) { setError('Enter a name.'); return; }
    if (members.some(member => member.id === memberId(name))) { setError(`${name} is already here.`); return; }
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
    return <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${item.title}, ${formatCents(item.amountCents)}, paid by ${labelOf(item.paidBy)}`} onPress={() => { setPanel(null); setConfirmDelete(false); setSelected(item); }} style={({ pressed }) => [s.expense, pressed && s.pressed]}>
      <View style={[s.iconBox, { backgroundColor: tints[item.category] }]}><Icon name={item.category} /></View>
      <View style={s.copy}><Text numberOfLines={1} style={s.expenseTitle}>{item.title}</Text><Text style={s.detail}>{labelOf(item.paidBy)} paid · {dateLabel(item.date)}</Text></View>
      <View style={s.amounts}><Text style={s.expenseTitle}>{formatCents(item.amountCents)}</Text><Text style={s.detail}>{formatCents(Math.round(item.amountCents / shares.size))} each</Text></View>
    </Pressable>;
  }

  const chip = (label: string, active: boolean, onPress: () => void, role: 'radio' | 'checkbox' = 'radio') => (
    <Pressable key={label} accessibilityRole={role} accessibilityState={{ checked: active }} onPress={onPress} style={[s.chip, active && s.activeChip]}><Text style={s.chipText}>{label}</Text></Pressable>
  );

  const eachPreview = validAmount(amount) && splitAmong.length ? `${formatCents(Math.round(Number(amount) * 100 / splitAmong.length))} each` : '';

  const modalTitle = selected ? selected.title : panel === 'add' ? 'Add expense' : panel === 'balances' ? 'Balances' : panel === 'recurring' ? 'Monthly bills'
    : panel === 'all' ? 'All expenses' : panel === 'person' ? 'Add person' : 'Record a payment';

  return <>
    <View style={s.header}>
      <View style={s.copy}>
        <Text accessibilityRole="header" style={s.title}>Expenses</Text>
        <Text style={s.subtitle}>{monthLabel(month)}</Text>
      </View>
    </View>
    {!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}

    <View style={[s.summary, myBalance > 0 && s.owedSummary]}>
      <View style={s.row}>
        <View style={s.copy}>
          <Text style={s.summaryLabel}>{myBalance < 0 ? 'You owe' : myBalance > 0 ? "You're owed" : 'All settled up'}</Text>
          <Text style={s.balance}>{formatCents(Math.abs(myBalance))}</Text>
        </View>
        <View style={[s.wallet, myBalance > 0 && s.owedWallet]}><Icon name="wallet" size={28} /></View>
      </View>
      <Text style={s.summaryDetail}>{formatCents(monthlyTotal)} spent this month</Text>
    </View>

    <View style={s.section}>
      <Text accessibilityRole="header" style={s.sectionTitle}>Balances</Text>
      <Pressable accessibilityRole="button" onPress={() => { setError(''); setPanel(members.length > 1 ? 'balances' : 'person'); }} style={s.linkButton}><Text style={s.link}>{members.length > 1 ? 'Manage' : 'Add person'}</Text></Pressable>
    </View>
    {members.length > 1
      ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.balances}>
          {summaries.map(item => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${labelOf(item.id)}: ${formatBalance(item.balanceCents)}`} onPress={() => setPanel('balances')} style={s.balanceCard}>
            <Text numberOfLines={1} style={s.person}>{labelOf(item.id)}</Text>
            <Text style={[s.personAmount, item.balanceCents > 0 && s.positive, item.balanceCents < 0 && s.negative]}>{formatBalance(item.balanceCents)}</Text>
          </Pressable>)}
        </ScrollView>
      : <Text style={s.subtitle}>Add the people you split costs with.</Text>}

    {members.length > 1 && <SettleUpAssistant plan={plan} summaries={summaries} me={me} labelOf={labelOf} petColor={petColor} mood={mood} onRecord={recordTransfer} />}

    <View style={s.section}>
      <Text accessibilityRole="header" style={s.sectionTitle}>This month</Text>
      {occurrences.length > thisMonth.length && <Pressable accessibilityRole="button" onPress={() => setPanel('all')} style={s.linkButton}><Text style={s.link}>See all</Text></Pressable>}
    </View>
    <View style={s.expenses}>
      {thisMonth.length ? thisMonth.map(expenseRow) : <View style={s.empty}><Text style={s.subtitle}>No expenses yet. Tap + to add one.</Text></View>}
    </View>
    {recurringExpenses.length > 0 && <Pressable accessibilityRole="button" onPress={() => setPanel('recurring')} style={s.recurring}><Icon name="repeat" size={17} /><Text style={s.recurringText}>Monthly bills ({recurringExpenses.length})</Text><Text style={s.link}>›</Text></Pressable>}

    <Modal visible={panel !== null || selected !== null} transparent animationType="fade" onRequestClose={close}>
      <View style={s.backdrop}>
        <ScrollView showsVerticalScrollIndicator={false} style={s.modal} contentContainerStyle={s.form} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={s.sectionTitle}>{modalTitle}</Text>

          {panel === 'add' && <>
            <Text style={s.label}>For</Text>
            <View style={s.chips}>
              {[...PRESETS.map(item => item.category), 'Other' as const].map(kind => (
                <Pressable key={kind} accessibilityRole="radio" accessibilityState={{ checked: category === kind }} onPress={() => pickPreset(kind)} style={[s.presetChip, category === kind && s.activeChip]}>
                  <Icon name={kind} size={16} /><Text style={s.chipText}>{kind}</Text>
                </Pressable>
              ))}
            </View>
            {category === 'Other' && <TextInput autoFocus accessibilityLabel="Expense name" placeholder="What was it?" value={customTitle} onChangeText={setCustomTitle} style={s.input} />}
            <Text style={s.label}>Amount</Text>
            <TextInput accessibilityLabel="Amount (USD)" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} placeholder="$0.00" style={s.input} />
            <Text style={s.label}>Paid by</Text>
            <View style={s.chips}>{members.map(member => chip(labelOf(member.id), paidBy === member.id, () => setPaidBy(member.id)))}</View>
            <Text style={s.label}>Split with{eachPreview ? ` · ${eachPreview}` : ''}</Text>
            <View style={s.chips}>{members.map(member => chip(labelOf(member.id), splitAmong.includes(member.id), () => setSplitAmong(current => current.includes(member.id) ? current.filter(id => id !== member.id) : [...current, member.id]), 'checkbox'))}</View>
            <Text style={s.label}>When</Text>
            <View style={s.chips}>{(['today', 'yesterday', 'other'] as const).map(option => chip(option === 'today' ? 'Today' : option === 'yesterday' ? 'Yesterday' : 'Pick date', when === option, () => setWhen(option)))}</View>
            {when === 'other' && <TextInput accessibilityLabel="Date (YYYY-MM-DD)" value={otherDate} onChangeText={setOtherDate} placeholder="YYYY-MM-DD" style={s.input} />}
            <View style={s.chips}>{chip('Repeats monthly', recurring, () => setRecurring(!recurring), 'checkbox')}</View>
            {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
            <Pressable accessibilityRole="button" onPress={saveExpense} style={({ pressed }) => [s.addButton, pressed && s.pressed]}><Text style={s.addText}>Save</Text></Pressable>
          </>}

          {panel === 'balances' && <>
            {summaries.map(item => <View key={item.id} style={[s.listRow, s.divider]}>
              <Text style={[s.expenseTitle, { flex: 1 }]}>{labelOf(item.id)}</Text>
              <Text style={[s.personAmount, item.balanceCents > 0 && s.positive, item.balanceCents < 0 && s.negative]}>{formatBalance(item.balanceCents)}</Text>
              {members.find(member => member.id === item.id)?.manual && !used.has(item.id) && <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${labelOf(item.id)}`} onPress={() => update(current => ({ ...current, members: current.members.filter(member => member.id !== item.id) }))}><Text style={s.link}>Remove</Text></Pressable>}
            </View>)}
            <View style={s.chips}>
              <Pressable accessibilityRole="button" onPress={() => { setError(''); setAmount(''); setPaymentTo(''); setPanel('payment'); }} style={s.secondaryButton}><Text style={s.link}>Record a payment</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={() => { setError(''); setPanel('person'); }} style={s.secondaryButton}><Text style={s.link}>Add person</Text></Pressable>
            </View>
            {ledger.payments.length > 0 && <>
              <Text style={s.label}>Payments</Text>
              {[...ledger.payments].reverse().map(payment => <View key={payment.id} style={s.listRow}>
                <Text style={[s.detail, { flex: 1 }]}>{labelOf(payment.from)} → {labelOf(payment.to)} {formatCents(payment.amountCents)} · {dateLabel(payment.date)}</Text>
                {(payment.from === me || payment.to === me) && <Pressable accessibilityRole="button" accessibilityLabel={`Undo payment of ${formatCents(payment.amountCents)}`} onPress={() => update(current => ({ ...current, payments: current.payments.filter(item => item.id !== payment.id) }))}><Text style={s.link}>Undo</Text></Pressable>}
              </View>)}
            </>}
          </>}

          {panel === 'payment' && <>
            <Text style={s.label}>Paid to</Text>
            <View style={s.chips}>{members.filter(member => member.id !== me).map(member => chip(member.name, paymentTo === member.id, () => setPaymentTo(member.id)))}</View>
            <Text style={s.label}>Amount</Text>
            <TextInput accessibilityLabel="Payment amount (USD)" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} placeholder="$0.00" style={s.input} />
            {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
            <Pressable accessibilityRole="button" onPress={savePayment} style={({ pressed }) => [s.addButton, pressed && s.pressed]}><Text style={s.addText}>Save</Text></Pressable>
          </>}

          {panel === 'person' && <>
            <TextInput autoFocus accessibilityLabel="Name" placeholder="Name" value={personName} onChangeText={setPersonName} style={s.input} />
            {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
            <Pressable accessibilityRole="button" onPress={addPerson} style={({ pressed }) => [s.addButton, pressed && s.pressed]}><Text style={s.addText}>Add</Text></Pressable>
          </>}

          {panel === 'recurring' && recurringExpenses.map(item => {
            const latest = [...occurrences].reverse().find(occurrence => occurrence.sourceId === item.id);
            return latest ? <View key={item.id}>{expenseRow(latest)}{item.recurring?.endMonth && <Text style={s.detail}>Stopped after {monthLabel(item.recurring.endMonth)}</Text>}</View> : null;
          })}

          {panel === 'all' && [...occurrences].reverse().map(expenseRow)}

          {selected && (() => {
            const shares = splitCents(selected.amountCents, selected.splitAmong);
            return <>
              <Text style={s.balance}>{formatCents(selected.amountCents)}</Text>
              <Text style={s.subtitle}>{labelOf(selected.paidBy)} paid · {dateLabel(selected.date)}{selected.recurring && !selected.recurring.endMonth ? ' · Monthly' : ''}</Text>
              {[...shares].map(([id, share]) => <View key={id} style={s.listRow}><Text style={s.detail}>{labelOf(id)}</Text><Text style={s.expenseTitle}>{formatCents(share)}</Text></View>)}
              {selected.recurring && !selected.recurring.endMonth && <Pressable accessibilityRole="button" onPress={stopRepeating} style={s.secondaryButton}><Text style={s.link}>Stop repeating</Text></Pressable>}
              {!confirmDelete
                ? <Pressable accessibilityRole="button" onPress={() => setConfirmDelete(true)} style={s.dangerButton}><Text style={s.dangerText}>Delete</Text></Pressable>
                : <Pressable accessibilityRole="button" onPress={deleteSelected} style={s.dangerButton}><Text style={s.dangerText}>{selected.recurring ? 'Delete every month?' : 'Delete for everyone?'}</Text></Pressable>}
            </>;
          })()}

          <Pressable accessibilityRole="button" onPress={panel === 'payment' || panel === 'person' ? () => { setError(''); setPanel(members.length > 1 ? 'balances' : null); } : close} style={s.close}><Text style={s.link}>{panel === 'add' ? 'Cancel' : panel === 'payment' || panel === 'person' ? 'Back' : 'Close'}</Text></Pressable>
        </ScrollView>
      </View>
    </Modal>
  </>;
}
