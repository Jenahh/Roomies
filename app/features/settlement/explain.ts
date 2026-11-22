import type { MemberSummary } from './ledger';
import type { SettlementPlan } from './ledger';
import type { Transfer } from './settlement';

export const formatCents = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

type Names = (id: string) => string;

/** The plain-language account of how one person's balance was reached. */
export function explainBalance(summary: MemberSummary, name: Names) {
  const who = name(summary.id);
  const parts = [`${who} paid ${formatCents(summary.paidCents)} toward shared bills, and their share of those bills is ${formatCents(summary.shareCents)}.`];
  if (summary.sentCents) parts.push(`They have already sent roommates ${formatCents(summary.sentCents)}.`);
  if (summary.receivedCents) parts.push(`They have received ${formatCents(summary.receivedCents)} from roommates.`);
  if (summary.balanceCents > 0) parts.push(`So ${who} is owed ${formatCents(summary.balanceCents)}.`);
  else if (summary.balanceCents < 0) parts.push(`So ${who} owes ${formatCents(-summary.balanceCents)}.`);
  else parts.push(`So ${who} is even.`);
  return parts.join(' ');
}

/** Why each suggested payment is there, tracking the balances as payments are made in order. */
export function explainTransfers(plan: SettlementPlan, name: Names) {
  const original = new Map(plan.balances.map(item => [item.id, item.cents]));
  const remaining = new Map(original);
  return plan.transfers.map((transfer: Transfer) => {
    const fromBefore = -(remaining.get(transfer.from) ?? 0);
    const owed = fromBefore === -(original.get(transfer.from) ?? 0) ? '' : 'remaining ';
    const toBefore = remaining.get(transfer.to) ?? 0;
    remaining.set(transfer.from, -fromBefore + transfer.cents);
    remaining.set(transfer.to, toBefore - transfer.cents);
    const fromLeft = fromBefore - transfer.cents;
    const toLeft = toBefore - transfer.cents;
    const fromPart = fromLeft === 0 ? `clears the ${owed}${formatCents(fromBefore)} ${name(transfer.from)} owes` : `covers part of the ${owed}${formatCents(fromBefore)} ${name(transfer.from)} owes`;
    const toPart = toLeft === 0 ? `${name(transfer.to)} is then fully paid back` : `${name(transfer.to)} is still owed ${formatCents(toLeft)}`;
    return `${name(transfer.from)} pays ${name(transfer.to)} ${formatCents(transfer.cents)}. This ${fromPart}, and ${toPart}.`;
  });
}

/** This is a one-sentence summary of the savings, for the top of the assistant card. */
export function summarizePlan(plan: SettlementPlan) {
  const { transfers, comparison } = plan;
  if (!transfers.length) return 'Everyone is even. There is nothing to pay right now.';
  const count = `${transfers.length} ${transfers.length === 1 ? 'payment' : 'payments'}`;
  if (comparison.pairwise > transfers.length) {
    return `Your household can settle up with ${count} instead of ${comparison.pairwise} if everyone paid each roommate back separately.`;
  }
  return `Your household can settle up with ${count}. That's the fewest possible.`;
}

export function methodLabel(plan: SettlementPlan) {
  return plan.method === 'exact'
    ? 'Exact optimizer: checked every way of grouping roommates whose balances cancel out.'
    : 'Large household: used the fast greedy method, which may suggest a few extra payments.';
}
