import { useState, type Dispatch, type SetStateAction } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import type { Expense, ResidentData } from '../../hooks/useResidentData';
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
function Icon({ name, size = 20 }: { name: keyof typeof paths; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
const cents = (amount: number) => Math.round(amount * 100);
const dateLabel = (date: string) => new Date(date + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export default function ExpensesScreen({ data, setData, storageError }: { data: ResidentData; setData: Dispatch<SetStateAction<ResidentData>>; storageError: string }) {
  const [panel, setPanel] = useState<'add' | 'balances' | 'recurring' | null>(null);
  const [selected, setSelected] = useState<Expense | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [splitCount, setSplitCount] = useState('1');
  const [paidBy, setPaidBy] = useState('');
  const [due, setDue] = useState(today());
  const [category, setCategory] = useState<keyof typeof paths>('Other');
  const [recurring, setRecurring] = useState(false);
  const [error, setError] = useState('');
  const month = today().slice(0, 7);
  const monthly = data.expenses.filter(item => item.due.startsWith(month)).sort((a, b) => a.due.localeCompare(b.due));
  const outstanding = data.expenses.filter(item => !item.settled);
  const balance = outstanding.reduce((sum, item) => sum + cents(item.amount), 0);
  const total = monthly.reduce((sum, item) => sum + cents(item.totalAmount ?? item.amount), 0);
  const nextDue = outstanding.map(item => item.due).sort()[0];
  const balances = Array.from(new Set(outstanding.map(item => item.paidBy || 'Household'))).map(name => ({ name, amount: outstanding.filter(item => (item.paidBy || 'Household') === name).reduce((sum, item) => sum + cents(item.amount), 0) }));
  const recurringExpenses = data.expenses.filter(item => item.recurring);
  function openAdd() { setTitle(''); setAmount(''); setSplitCount('1'); setPaidBy(''); setDue(today()); setCategory('Other'); setRecurring(false); setError(''); setPanel('add'); }
  function save() {
    if (!title.trim()) { setError('Enter an expense title.'); return; }
    if (!/^\d+(\.\d{1,2})?$/.test(amount) || !Number.isSafeInteger(cents(Number(amount))) || cents(Number(amount)) <= 0) { setError('Enter a positive total with up to two decimal places.'); return; }
    const count = Number(splitCount);
    if (!/^\d+$/.test(splitCount) || !Number.isSafeInteger(count) || count < 1 || count > 100) { setError('Enter between 1 and 100 people.'); return; }
    const parsed = new Date(due + 'T12:00:00');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(due) || !Number.isFinite(parsed.getTime()) || parsed.getFullYear() !== Number(due.slice(0, 4)) || parsed.getMonth() + 1 !== Number(due.slice(5, 7)) || parsed.getDate() !== Number(due.slice(8))) { setError('Enter a valid date in YYYY-MM-DD format.'); return; }
    if (cents(Number(amount)) < count) { setError('The total must allow at least one cent per person.'); return; }
    setData(previous => ({ ...previous, expenses: [...previous.expenses, { id: crypto.randomUUID(), title: title.trim(), amount: Math.round(cents(Number(amount)) / count) / 100, totalAmount: Number(amount), splitCount: count, paidBy: paidBy.trim() || 'Household', due, category, recurring, settled: false }] }));
    setPanel(null);
  }
  function settle(item: Expense) { setData(previous => ({ ...previous, expenses: previous.expenses.map(expense => expense.id === item.id ? { ...expense, settled: !expense.settled } : expense) })); setSelected(null); }
  function expenseRow(item: Expense) {
    const kind = (['Rent', 'Electricity', 'Groceries', 'Internet'].includes(item.category || '') ? item.category : 'Other') as keyof typeof paths;
    return <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${item.title}, your share ${money(cents(item.amount))}${item.settled ? ', settled' : ''}`} onPress={() => { setPanel(null); setSelected(item); }} style={({ pressed }) => [s.expense, pressed && s.pressed]}>
      <View style={[s.iconBox, { backgroundColor: kind === 'Electricity' ? '#FFF2DC' : kind === 'Groceries' ? '#EAF6EF' : '#F1EBFF' }]}><Icon name={kind} /></View>
      <View style={s.copy}><Text style={s.expenseTitle}>{item.title}</Text><Text style={s.detail}>{item.paidBy ? `Paid by ${item.paidBy}` : 'Your expense share'} · {dateLabel(item.due)}{item.settled ? ' · Settled' : ''}</Text></View>
      <View style={s.amounts}><Text style={s.expenseTitle}>{money(cents(item.totalAmount ?? item.amount))}</Text><Text style={s.detail}>{money(cents(item.amount))} each</Text></View>
    </Pressable>;
  }
  return <>
    <View style={s.header}><View style={s.copy}><Text accessibilityRole="header" style={s.title}>Expenses</Text><Text style={s.subtitle}>{new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="View expense balances" onPress={() => setPanel('balances')} style={s.headerButton}><Icon name="Other" size={18} /></Pressable></View>
    {!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}
    <View style={s.summary}><View style={s.row}><View style={s.copy}><Text style={s.summaryLabel}>You owe{balances.length === 1 && balances[0].name !== 'Household' ? ` ${balances[0].name}` : ''}</Text><Text style={s.balance}>{money(balance)}</Text></View><View style={s.wallet}><Icon name="wallet" size={28} /></View></View><Text style={s.summaryDetail}>{nextDue ? `Next due ${dateLabel(nextDue)} · ` : 'All settled up · '}Monthly total {money(total)}</Text></View>
    <View style={s.section}><Text accessibilityRole="header" style={s.sectionTitle}>Who you owe</Text><Pressable accessibilityRole="button" onPress={() => setPanel('balances')} style={s.linkButton}><Text style={s.link}>View balances</Text></Pressable></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.balances}>{balances.length ? balances.map(item => <Pressable key={item.name} accessibilityRole="button" onPress={() => setPanel('balances')} style={s.balanceCard}><Text numberOfLines={2} style={s.person}>{item.name}</Text><Text style={s.personAmount}>{money(item.amount)}</Text></Pressable>) : <View style={s.clearCard}><Text style={s.detail}>No outstanding balances. A fresh start together.</Text></View>}</ScrollView>
    <View style={s.section}><Text accessibilityRole="header" style={s.sectionTitle}>Shared this month</Text><Text style={s.link}>{monthly.length} {monthly.length === 1 ? 'expense' : 'expenses'}</Text></View>
    <View style={s.expenses}>{monthly.length ? monthly.map(expenseRow) : <View style={s.empty}><Text style={s.expenseTitle}>Keep household costs in one place</Text><Text style={s.subtitle}>Add rent, groceries, or a bill to split with your roomies.</Text></View>}</View>
    <Pressable accessibilityRole="button" onPress={() => setPanel('recurring')} style={s.recurring}><Icon name="repeat" size={17} /><Text style={s.recurringText}>Recurring monthly expenses</Text><Text style={s.link}>›</Text></Pressable>
    <Pressable accessibilityRole="button" onPress={openAdd} style={({ pressed }) => [s.addButton, pressed && s.pressed]}><Text style={s.addText}>＋ Add Expense</Text></Pressable>
    <Modal visible={panel !== null || selected !== null} transparent animationType="fade" onRequestClose={() => { setPanel(null); setSelected(null); }}><View style={s.backdrop}><ScrollView style={s.modal} contentContainerStyle={s.form} keyboardShouldPersistTaps="handled">
      <Text accessibilityRole="header" style={s.sectionTitle}>{selected ? selected.title : panel === 'add' ? 'Add expense' : panel === 'balances' ? 'Your outstanding balances' : 'Recurring monthly expenses'}</Text>
      {panel === 'add' && <>
        <Text style={s.label}>Expense title</Text><TextInput autoFocus accessibilityLabel="Expense title" placeholder="e.g. Rent" value={title} onChangeText={setTitle} style={s.input} />
        <Text style={s.label}>Total amount (USD)</Text><TextInput accessibilityLabel="Total amount (USD)" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} placeholder="0.00" style={s.input} />
        <Text style={s.label}>Split equally between (including you)</Text><TextInput accessibilityLabel="Number of people" keyboardType="number-pad" value={splitCount} onChangeText={setSplitCount} style={s.input} />
        <Text style={s.label}>Paid by / owed to</Text><TextInput accessibilityLabel="Paid by or owed to" placeholder="Roommate or household" value={paidBy} onChangeText={setPaidBy} style={s.input} />
        <Text style={s.label}>Due date (YYYY-MM-DD)</Text><TextInput accessibilityLabel="Due date (YYYY-MM-DD)" value={due} onChangeText={setDue} style={s.input} />
        <Text style={s.label}>Category</Text><View style={s.categories}>{(['Rent', 'Electricity', 'Groceries', 'Internet', 'Other'] as const).map(kind => <Pressable key={kind} accessibilityRole="radio" accessibilityState={{ checked: category === kind }} onPress={() => setCategory(kind)} style={[s.category, category === kind && s.activeCategory]}><Text style={s.link}>{kind}</Text></Pressable>)}</View>
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: recurring }} onPress={() => setRecurring(!recurring)} style={s.recurring}><Text style={s.link}>{recurring ? '☑' : '☐'} Recurring monthly expense</Text></Pressable>
        {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
        <Pressable accessibilityRole="button" onPress={save} style={s.addButton}><Text style={s.addText}>Save expense</Text></Pressable>
      </>}
      {panel === 'balances' && <><Text style={s.subtitle}>Your unpaid shares across all months.</Text>{balances.map(item => <View key={item.name} style={s.row}><Text style={s.expenseTitle}>{item.name}</Text><Text style={s.expenseTitle}>{money(item.amount)}</Text></View>)}{!balances.length && <Text style={s.subtitle}>You’re all settled up.</Text>}{outstanding.map(expenseRow)}</>}
      {panel === 'recurring' && <><Text style={s.subtitle}>Expenses marked as monthly. Add each new bill when it arrives.</Text>{recurringExpenses.map(expenseRow)}{!recurringExpenses.length && <Text style={s.subtitle}>No recurring expenses yet. Mark an expense as recurring when you add it.</Text>}</>}
      {selected && <><Text style={s.subtitle}>Due {dateLabel(selected.due)}{selected.paidBy ? ` · Owed to ${selected.paidBy}` : ''}</Text><Text style={s.expenseTitle}>Your share: {money(cents(selected.amount))}</Text><Text style={s.subtitle}>Total: {money(cents(selected.totalAmount ?? selected.amount))}{selected.splitCount ? ` · ${selected.splitCount} people` : ''}</Text><Pressable accessibilityRole="button" onPress={() => settle(selected)} style={s.addButton}><Text style={s.addText}>{selected.settled ? 'Mark unpaid' : 'Mark your share paid'}</Text></Pressable></>}
      <Pressable accessibilityRole="button" onPress={() => { setPanel(null); setSelected(null); }} style={s.close}><Text style={s.link}>{panel === 'add' ? 'Cancel' : 'Close'}</Text></Pressable>
    </ScrollView></View></Modal>
  </>;
}
