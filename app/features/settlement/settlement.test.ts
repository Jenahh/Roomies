import { describe, expect, it } from 'vitest';
import { applyTransfers, greedySettle, optimizeSettlement, zeroSumGroups, type Balance } from './settlement';
import { expenseOccurrences, memberSummaries, parseLedger, planSettlement, residentExpenses, splitCents, type HouseholdLedger } from './ledger';
import { explainTransfers, summarizePlan } from './explain';

const b = (entries: Record<string, number>): Balance[] => Object.entries(entries).map(([id, cents]) => ({ id, cents }));

function settlesEveryone(balances: Balance[], transfers: ReturnType<typeof greedySettle>) {
  for (const cents of applyTransfers(balances, transfers).values()) expect(cents).toBe(0);
  for (const transfer of transfers) {
    expect(transfer.cents).toBeGreaterThan(0);
    expect(transfer.from).not.toBe(transfer.to);
  }
}

/** Independent check: try every partition of the people and keep the most zero-sum blocks. */
function bruteForceMinimum(balances: Balance[]) {
  const values = balances.filter(item => item.cents !== 0).map(item => item.cents);
  let most = 0;
  const blocks: number[] = [];
  (function place(index: number) {
    if (index === values.length) {
      if (blocks.every(total => total === 0)) most = Math.max(most, blocks.length);
      return;
    }
    for (let block = 0; block < blocks.length; block++) {
      blocks[block] += values[index]; place(index + 1); blocks[block] -= values[index];
    }
    blocks.push(values[index]); place(index + 1); blocks.pop();
  })(0);
  return values.length - most;
}

function randomBalances(seed: number, people: number) {
  let state = seed;
  const next = () => { state = (state * 1103515245 + 12345) % 2147483648; return state / 2147483648; };
  const cents = Array.from({ length: people - 1 }, () => Math.round(next() * 10 - 5) * 100 + 0);
  cents.push(0 - cents.reduce((sum, value) => sum + value, 0));
  return cents.map((value, index) => ({ id: 'p' + index, cents: value }));
}

describe('settlement optimizer', () => {
  it('settles the three-roommate example with two payments', () => {
    const balances = b({ Maya: 95000, Jordan: -49000, Sam: -46000 });
    const result = optimizeSettlement(balances);
    expect(result.method).toBe('exact');
    expect(result.transfers).toEqual([
      { from: 'Jordan', to: 'Maya', cents: 49000 },
      { from: 'Sam', to: 'Maya', cents: 46000 },
    ]);
    settlesEveryone(balances, result.transfers);
  });

  it('beats greedy when a pair cancels out exactly', () => {
    const balances = b({ A: 400, B: 300, C: 300, D: -600, E: -400 });
    expect(greedySettle(balances)).toHaveLength(4);
    const exact = optimizeSettlement(balances);
    expect(exact.transfers).toHaveLength(3);
    expect(exact.groups).toEqual([['A', 'E'], ['B', 'C', 'D']]);
    settlesEveryone(balances, exact.transfers);
  });

  it('finds the true minimum on hundreds of random households (checked by brute force)', () => {
    let greedyWorse = 0;
    for (let seed = 1; seed <= 400; seed++) {
      const balances = randomBalances(seed, 3 + (seed % 6));
      const exact = optimizeSettlement(balances);
      const greedy = greedySettle(balances);
      settlesEveryone(balances, exact.transfers);
      settlesEveryone(balances, greedy);
      expect(exact.transfers.length).toBe(bruteForceMinimum(balances));
      expect(greedy.length).toBeGreaterThanOrEqual(exact.transfers.length);
      if (greedy.length > exact.transfers.length) greedyWorse++;
    }
    expect(greedyWorse).toBeGreaterThan(0);
  });

  it('handles nobody owing anything and rejects balances that do not add up', () => {
    expect(optimizeSettlement(b({ A: 0, B: 0 })).transfers).toEqual([]);
    expect(zeroSumGroups([])).toEqual([]);
    expect(() => optimizeSettlement(b({ A: 100, B: -99 }))).toThrow(/sum to zero/);
    expect(() => optimizeSettlement(b({ A: 0.5, B: -0.5 }))).toThrow(/whole number/);
  });

  it('falls back to greedy for very large groups', () => {
    const balances = randomBalances(7, 20);
    const result = optimizeSettlement(balances);
    expect(result.method).toBe('greedy');
    settlesEveryone(balances, result.transfers);
  });

  it('finishes quickly at the exact-search limit', () => {
    const start = Date.now();
    const balances = randomBalances(11, 16);
    settlesEveryone(balances, optimizeSettlement(balances).transfers);
    expect(Date.now() - start).toBeLessThan(2000);
  });
});

const ledger = (overrides: Partial<HouseholdLedger> = {}): HouseholdLedger => ({
  version: 1,
  members: [{ id: 'maya', name: 'Maya' }, { id: 'jordan', name: 'Jordan' }, { id: 'sam', name: 'Sam' }],
  expenses: [
    { id: 'rent', title: 'Rent', category: 'Rent', amountCents: 150000, paidBy: 'maya', splitAmong: ['maya', 'jordan', 'sam'], date: '2026-11-01' },
    { id: 'net', title: 'Internet', category: 'Internet', amountCents: 6000, paidBy: 'jordan', splitAmong: ['maya', 'jordan', 'sam'], date: '2026-11-05' },
    { id: 'food', title: 'Groceries', category: 'Groceries', amountCents: 9000, paidBy: 'sam', splitAmong: ['maya', 'jordan', 'sam'], date: '2026-11-08' },
  ],
  payments: [],
  ...overrides,
});

describe('household ledger', () => {
  it('splits cents so shares always add up to the total', () => {
    const shares = splitCents(10000, ['c', 'a', 'b']);
    expect([...shares.entries()]).toEqual([['a', 3334], ['b', 3333], ['c', 3333]]);
    expect(splitCents(1, ['a', 'b']).get('b')).toBe(0);
  });

  it('computes net balances and compares settlement methods', () => {
    const balances = Object.fromEntries(memberSummaries(ledger(), '2026-11').map(item => [item.id, item.balanceCents]));
    expect(balances).toEqual({ maya: 95000, jordan: -49000, sam: -46000 });
    const plan = planSettlement(ledger(), '2026-11');
    expect(plan.comparison).toEqual({ pairwise: 3, greedy: 2, optimal: 2 });
    expect(summarizePlan(plan)).toBe('Your household can settle up with 2 payments instead of 3 if everyone paid each roommate back separately.');
    const name = (id: string) => ({ maya: 'Maya', jordan: 'Jordan', sam: 'Sam' } as Record<string, string>)[id];
    expect(explainTransfers(plan, name)).toEqual([
      'Jordan pays Maya $490.00. This clears the $490.00 Jordan owes, and Maya is still owed $460.00.',
      'Sam pays Maya $460.00. This clears the $460.00 Sam owes, and Maya is then fully paid back.',
    ]);
  });

  it('counts recorded payments toward balances', () => {
    const paid = ledger({ payments: [{ id: 'p1', from: 'jordan', to: 'maya', amountCents: 49000, date: '2026-11-10' }] });
    const plan = planSettlement(paid, '2026-11');
    expect(plan.transfers).toEqual([{ from: 'sam', to: 'maya', cents: 46000 }]);
  });

  it('repeats recurring expenses monthly, clamping the day and stopping at the end month', () => {
    const recurring = ledger({ expenses: [{ id: 'rent', title: 'Rent', category: 'Rent', amountCents: 90000, paidBy: 'maya', splitAmong: ['maya', 'sam'], date: '2026-01-31', recurring: { endMonth: '2026-03' } }] });
    expect(expenseOccurrences(recurring, '2026-06').map(item => [item.id, item.date])).toEqual([
      ['rent', '2026-01-31'], ['rent@2026-02', '2026-02-28'], ['rent@2026-03', '2026-03-31'],
    ]);
    expect(expenseOccurrences(recurring, '2026-01')).toHaveLength(1);
  });

  it("shows each resident's outstanding shares adding up to what they owe", () => {
    const view = residentExpenses(ledger({ payments: [{ id: 'p', from: 'jordan', to: 'maya', amountCents: 20000, date: '2026-11-10' }] }), 'jordan', '2026-11');
    const unpaid = view.filter(item => !item.settled).reduce((sum, item) => sum + Math.round(item.amount * 100), 0);
    expect(unpaid).toBe(29000);
    expect(view.map(item => item.title)).toEqual(['Rent', 'Groceries']);
    expect(residentExpenses(ledger(), 'maya', '2026-11').every(item => item.settled)).toBe(true);
  });

  it('drops malformed saved data instead of crashing', () => {
    expect(parseLedger(null).expenses).toEqual([]);
    const parsed = parseLedger({ members: [{ id: 'a', name: 'A' }, 3], expenses: [{ id: 'x', title: 'Bad', amountCents: -5 }], payments: [{ id: 'p', from: 'a', to: 'a', amountCents: 5, date: '2026-01-01' }] });
    expect(parsed).toEqual({ version: 1, members: [{ id: 'a', name: 'A' }], expenses: [], payments: [] });
  });
});
