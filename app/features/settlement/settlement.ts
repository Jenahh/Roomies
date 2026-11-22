/**
 * Settlement Optimizer (honors option feature for CSC 4330).
 *
 * Each household members' net balance in integer cents (positive = owed money, negative = owes money, 
 * all balances summing to zero), which suggests a set of payments that brings every balance to zero--utilizing 
 * as few payments as possible!
 *
 * One important fact is that, if the members can be split into g disjoint groups whose balances each sum up to zero, 
 * the household can be settled with n - g payments (as a group of k people needs k - 1 payments), and no settlement can use fewer than that. 
 * Therefore, minimizing the payments is the same as maximizing the number of zero-sum groups. That problem is 
 * NP-hard in general (as subset-sum reduces to it), but households are small, so we solve it exactly using dynamic programming
 * over subsets in O(n · 2^n) time. Additionally, larger groups fall back to the "greedy" heuristic.
 */

export type Balance = { id: string; cents: number };
export type Transfer = { from: string; to: string; cents: number };
export type SettlementMethod = 'exact' | 'greedy';
export type Settlement = {
  transfers: Transfer[];
  method: SettlementMethod;
  /** The zero-sum groups found by the exact optimizer (which are each settled independently). */
  groups: string[][];
};

/** Above this many non-zero balances, the exact search (2^n states) is skipped. */
export const EXACT_LIMIT = 16;

function nonZero(balances: Balance[]) {
  const total = balances.reduce((sum, item) => sum + item.cents, 0);
  if (total !== 0) throw new Error(`Balances must sum to zero (got ${total} cents).`);
  for (const item of balances) {
    if (!Number.isSafeInteger(item.cents)) throw new Error(`Balance for ${item.id} must be a whole number of cents.`);
  }
  // This is stable order, so the results are deterministic for the same input.
  return balances.filter(item => item.cents !== 0).sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * This is the greedy heuristic, which repeatedly has the person who owes the most pay the person who is owed the most (as much as 
 * possible). Every payment zeroes at least one balance, so it uses, at most, n - 1 payments. However, it can miss smaller groups 
 * that cancel out exactly.
 */
export function greedySettle(balances: Balance[]): Transfer[] {
  const people = nonZero(balances).map(item => ({ ...item }));
  const transfers: Transfer[] = [];
  for (;;) {
    let creditor: Balance | undefined;
    let debtor: Balance | undefined;
    for (const person of people) {
      if (person.cents > 0 && (!creditor || person.cents > creditor.cents)) creditor = person;
      if (person.cents < 0 && (!debtor || person.cents < debtor.cents)) debtor = person;
    }
    if (!creditor || !debtor) return transfers;
    const cents = Math.min(creditor.cents, -debtor.cents);
    transfers.push({ from: debtor.id, to: creditor.id, cents });
    creditor.cents -= cents;
    debtor.cents += cents;
  }
}

/**
 * This is the exact optimizer. best[mask] is the largest number of zero-sum groups the members in 'mask' can be partitioned into, 
 * counting only groups that end where the running total returns to zero:
 *   best[mask] = max over i in mask of best[mask without i] + (sum(mask) == 0 ? 1 : 0)
 * Walking back from the full set, every zero-sum mask on the path closes exactly one group.
 */
export function zeroSumGroups(people: Balance[]): string[][] {
  const n = people.length;
  if (!n) return [];
  if (n > 30) throw new Error('Too many people for subset search.');
  const size = 1 << n;
  const sum = new Float64Array(size);
  const best = new Int8Array(size);
  for (let mask = 1; mask < size; mask++) {
    const low = mask & -mask;
    sum[mask] = sum[mask ^ low] + people[31 - Math.clz32(low)].cents;
    let most = 0;
    for (let rest = mask; rest; rest &= rest - 1) {
      const candidate = best[mask ^ (rest & -rest)];
      if (candidate > most) most = candidate;
    }
    best[mask] = most + (sum[mask] === 0 ? 1 : 0);
  }

  const groups: string[][] = [];
  let mask = size - 1;
  let group: string[] = [];
  while (mask) {
    const target = best[mask] - (sum[mask] === 0 ? 1 : 0);
    // Removes the lowest-index member that keeps the optimum (deterministic choice).
    let removed = -1;
    for (let rest = mask; rest; rest &= rest - 1) {
      const bit = rest & -rest;
      if (best[mask ^ bit] === target) { removed = 31 - Math.clz32(bit); break; }
    }
    group.push(people[removed].id);
    mask ^= 1 << removed;
    if (sum[mask] === 0) { groups.push(group.sort()); group = []; }
  }
  return groups.sort((a, b) => a[0].localeCompare(b[0]));
}

/** Fewest payments: these are exact for typical households, and then greedy fallback for very large ones. */
export function optimizeSettlement(balances: Balance[], exactLimit = EXACT_LIMIT): Settlement {
  const people = nonZero(balances);
  if (people.length > exactLimit) return { transfers: greedySettle(people), method: 'greedy', groups: [] };
  const byId = new Map(people.map(person => [person.id, person]));
  const groups = zeroSumGroups(people);
  // Inside a zero-sum group that cannot be split furthermore, greedy uses exactly k - 1 payments.
  const transfers = groups.flatMap(group => greedySettle(group.map(id => byId.get(id)!)));
  return { transfers, method: 'exact', groups };
}

/** Applies transfers to balances, which is used by tests and the UI to confirm everything reaches zero. */
export function applyTransfers(balances: Balance[], transfers: Transfer[]) {
  const result = new Map(balances.map(item => [item.id, item.cents]));
  for (const transfer of transfers) {
    result.set(transfer.from, (result.get(transfer.from) ?? 0) + transfer.cents);
    result.set(transfer.to, (result.get(transfer.to) ?? 0) - transfer.cents);
  }
  return result;
}
