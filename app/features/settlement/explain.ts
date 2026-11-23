import type { SettlementPlan } from './ledger';

export const formatCents = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

/** The signed amount for balances, for example, "+$300.00" or "−$600.00". */
export const formatBalance = (cents: number) => (cents > 0 ? '+' : cents < 0 ? '−' : '') + formatCents(Math.abs(cents));

/** One short line for the top of the assistant card. */
export function summarizePlan(plan: SettlementPlan) {
  const count = plan.transfers.length;
  if (!count) return 'Everyone is even.';
  return `${count} ${count === 1 ? 'payment settles' : 'payments settle'} everyone.`;
}
