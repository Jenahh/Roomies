import type { Expense } from '../../hooks/useResidentData';
import { greedySettle, optimizeSettlement, type Balance, type Settlement, type Transfer } from './settlement';

/**
 * This is the household expense ledger. All of the money is stored as integer cents so splits never drift from floating-point rounding!
 */
export type LedgerMember = { id: string; name: string; manual?: boolean };
export type LedgerCategory = 'Rent' | 'Electricity' | 'Groceries' | 'Internet' | 'Other';
export type LedgerExpense = {
  id: string;
  title: string;
  category: LedgerCategory;
  amountCents: number;
  paidBy: string;
  splitAmong: string[];
  /** YYYY-MM-DD. For recurring expenses, this is the first occurrence. */
  date: string;
  /** Repeats on the same day each month (optionally through `endMonth` (YYYY-MM)). */
  recurring?: { endMonth?: string };
};
export type LedgerPayment = { id: string; from: string; to: string; amountCents: number; date: string };
export type HouseholdLedger = { version: 1; members: LedgerMember[]; expenses: LedgerExpense[]; payments: LedgerPayment[] };
/** This is one month's instance of an expense (recurring expenses produce only one per month). */
export type ExpenseOccurrence = LedgerExpense & { sourceId: string; month: string };

export const emptyLedger: HouseholdLedger = { version: 1, members: [], expenses: [], payments: [] };
export const LEDGER_CATEGORIES: LedgerCategory[] = ['Rent', 'Electricity', 'Groceries', 'Internet', 'Other'];

export function memberId(name: string) {
  return 'name:' + name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function monthKey(date: string) {
  return date.slice(0, 7);
}

function addMonths(month: string, count: number) {
  const [year, index] = month.split('-').map(Number);
  const date = new Date(year, index - 1 + count, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function daysInMonth(month: string) {
  const [year, index] = month.split('-').map(Number);
  return new Date(year, index, 0).getDate();
}

/** This is a function that expands recurring expenses into one occurrence per month (up to and including `throughMonth`). */
export function expenseOccurrences(ledger: HouseholdLedger, throughMonth: string): ExpenseOccurrence[] {
  const result: ExpenseOccurrence[] = [];
  for (const expense of ledger.expenses) {
    const start = monthKey(expense.date);
    if (!expense.recurring) {
      if (start <= throughMonth) result.push({ ...expense, sourceId: expense.id, month: start });
      continue;
    }
    const last = expense.recurring.endMonth && expense.recurring.endMonth < throughMonth ? expense.recurring.endMonth : throughMonth;
    const day = Number(expense.date.slice(8, 10));
    for (let month = start, guard = 0; month <= last && guard < 600; month = addMonths(month, 1), guard++) {
      const date = `${month}-${String(Math.min(day, daysInMonth(month))).padStart(2, '0')}`;
      result.push({ ...expense, id: month === start ? expense.id : `${expense.id}@${month}`, date, sourceId: expense.id, month });
    }
  }
  return result.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

/**
 * An equal split in cents. Leftover cents go one each to the first participants in id order, so that the shares always add up 
 * to the exact total.
 */
export function splitCents(amountCents: number, participants: string[]) {
  const ids = [...new Set(participants)].sort();
  const shares = new Map<string, number>();
  if (!ids.length) return shares;
  const base = Math.floor(amountCents / ids.length);
  const extra = amountCents - base * ids.length;
  ids.forEach((id, index) => shares.set(id, base + (index < extra ? 1 : 0)));
  return shares;
}

export type MemberSummary = { id: string; paidCents: number; shareCents: number; sentCents: number; receivedCents: number; balanceCents: number };

/** The net balance per member: what they paid for the household minus their share, also adjusted for payments between roommates. */
export function memberSummaries(ledger: HouseholdLedger, throughMonth: string): MemberSummary[] {
  const summaries = new Map<string, MemberSummary>();
  const get = (id: string) => {
    let summary = summaries.get(id);
    if (!summary) { summary = { id, paidCents: 0, shareCents: 0, sentCents: 0, receivedCents: 0, balanceCents: 0 }; summaries.set(id, summary); }
    return summary;
  };
  ledger.members.forEach(member => get(member.id));
  for (const expense of expenseOccurrences(ledger, throughMonth)) {
    get(expense.paidBy).paidCents += expense.amountCents;
    for (const [id, share] of splitCents(expense.amountCents, expense.splitAmong)) get(id).shareCents += share;
  }
  for (const payment of ledger.payments) {
    if (monthKey(payment.date) > throughMonth) continue;
    get(payment.from).sentCents += payment.amountCents;
    get(payment.to).receivedCents += payment.amountCents;
  }
  for (const summary of summaries.values()) {
    summary.balanceCents = summary.paidCents - summary.shareCents + summary.sentCents - summary.receivedCents;
  }
  return [...summaries.values()];
}

/**
 * The baseline for comparison: what happens if each pair of roommates settles directly (all of A's IOUs to B netted against B's 
 * IOUs to A)? There is one payment per pair that still has a debt.
 */
export function pairwiseTransfers(ledger: HouseholdLedger, throughMonth: string): Transfer[] {
  const owed = new Map<string, number>();
  const add = (from: string, to: string, cents: number) => {
    if (from === to) return;
    const [a, b] = from < to ? [from, to] : [to, from];
    const key = a + '\u0000' + b;
    owed.set(key, (owed.get(key) ?? 0) + (from === a ? cents : -cents));
  };
  for (const expense of expenseOccurrences(ledger, throughMonth)) {
    for (const [id, share] of splitCents(expense.amountCents, expense.splitAmong)) add(id, expense.paidBy, share);
  }
  for (const payment of ledger.payments) if (monthKey(payment.date) <= throughMonth) add(payment.to, payment.from, payment.amountCents);
  const transfers: Transfer[] = [];
  for (const [key, cents] of owed) {
    const [a, b] = key.split('\u0000');
    if (cents > 0) transfers.push({ from: a, to: b, cents });
    else if (cents < 0) transfers.push({ from: b, to: a, cents: -cents });
  }
  return transfers;
}

export type SettlementPlan = Settlement & {
  balances: Balance[];
  comparison: { pairwise: number; greedy: number; optimal: number };
};

export function planSettlement(ledger: HouseholdLedger, throughMonth: string): SettlementPlan {
  const balances = memberSummaries(ledger, throughMonth).map(summary => ({ id: summary.id, cents: summary.balanceCents }));
  const settlement = optimizeSettlement(balances);
  return {
    ...settlement,
    balances,
    comparison: {
      pairwise: pairwiseTransfers(ledger, throughMonth).length,
      greedy: greedySettle(balances).length,
      optimal: settlement.transfers.length,
    },
  };
}

/**
 * The per-resident view used by Home, Calendar, Notifications and the Roomie Pet mood. The amount still owed is 
 * spread across the newest expenses that other people paid for, thus the unsettled amounts add up to exactly what 
 * this resident owes overall.
 */
export function residentExpenses(ledger: HouseholdLedger, me: string, throughMonth: string): Expense[] {
  const balance = memberSummaries(ledger, throughMonth).find(summary => summary.id === me)?.balanceCents ?? 0;
  let remaining = Math.max(0, -balance);
  const names = new Map(ledger.members.map(member => [member.id, member.name]));
  return expenseOccurrences(ledger, throughMonth)
    .filter(expense => expense.paidBy !== me && expense.splitAmong.includes(me))
    .reverse()
    .map(expense => {
      const share = splitCents(expense.amountCents, expense.splitAmong).get(me) ?? 0;
      const outstanding = Math.min(share, remaining);
      remaining -= outstanding;
      return {
        id: expense.id,
        title: expense.title,
        amount: (outstanding || share) / 100,
        totalAmount: expense.amountCents / 100,
        splitCount: new Set(expense.splitAmong).size,
        paidBy: names.get(expense.paidBy) ?? expense.paidBy,
        due: expense.date,
        category: expense.category,
        recurring: !!expense.recurring,
        settled: outstanding === 0,
      };
    })
    .reverse();
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/** Validates the data read from storage; anything malformed is dropped rather than simply crashing the page. */
export function parseLedger(value: unknown): HouseholdLedger {
  if (!value || typeof value !== 'object') return emptyLedger;
  const raw = value as Record<string, unknown>;
  const cents = (item: unknown) => Number.isSafeInteger(item) && (item as number) > 0;
  const date = (item: unknown) => isString(item) && /^\d{4}-\d{2}-\d{2}$/.test(item);
  const members = Array.isArray(raw.members) ? raw.members.filter((item): item is LedgerMember => !!item && isString(item.id) && isString(item.name)) : [];
  const expenses = Array.isArray(raw.expenses) ? raw.expenses.filter((item): item is LedgerExpense => !!item && isString(item.id) && isString(item.title)
    && cents(item.amountCents) && isString(item.paidBy) && Array.isArray(item.splitAmong) && item.splitAmong.length > 0 && item.splitAmong.every(isString)
    && date(item.date) && LEDGER_CATEGORIES.includes(item.category)) : [];
  const payments = Array.isArray(raw.payments) ? raw.payments.filter((item): item is LedgerPayment => !!item && isString(item.id) && isString(item.from)
    && isString(item.to) && item.from !== item.to && cents(item.amountCents) && date(item.date)) : [];
  return { version: 1, members, expenses, payments };
}

/** Adds roster members the ledger has not seen yet and refreshes the display names. */
export function withRoster(ledger: HouseholdLedger, roster: LedgerMember[]): HouseholdLedger {
  const known = new Map(ledger.members.map(member => [member.id, member]));
  let changed = false;
  for (const member of roster) {
    const existing = known.get(member.id);
    if (!existing) { known.set(member.id, member); changed = true; }
    else if (existing.name !== member.name || existing.manual) { known.set(member.id, { id: member.id, name: member.name }); changed = true; }
  }
  return changed ? { ...ledger, members: [...known.values()] } : ledger;
}
