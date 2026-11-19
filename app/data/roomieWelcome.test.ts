import { describe, expect, it } from 'vitest';
import type { ResidentData } from '../hooks/useResidentData';
import { getRoomieWelcome } from './roomieWelcome';

const now = new Date(2026, 10, 15, 12);
function household(): ResidentData {
  return { name: 'Alex', household: 'Home', pet: { name: 'Pip', lastAttention: now.toISOString() }, chores: [], expenses: [], events: [] };
}

describe('Roomie login update', () => {
  it('explains stress and reports only relevant unfinished overdue work', () => {
    const data = household();
    data.chores = [
      { id: 'mine', title: 'Dishes', due: '2026-11-14', completed: false, assignee: 'Alex' },
      { id: 'other', title: 'Laundry', due: '2026-11-14', completed: false, assignee: 'Sam' },
      { id: 'unassigned', title: 'Trash', due: '2026-11-14', completed: false, unassigned: true },
      { id: 'done', title: 'Vacuum', due: '2026-11-14', completed: true },
    ];
    data.expenses = [
      { id: 'bill', title: 'Electricity', due: '2026-11-14', amount: 25 },
      { id: 'paid', title: 'Internet', due: '2026-11-14', amount: 10, settled: true },
    ];
    const result = getRoomieWelcome(data, now);
    expect(result.mood).toBe('Stressed');
    expect(result.dialogue).toContain('overdue');
    expect(result.updates).toContainEqual({ title: '1 overdue chore', detail: 'Dishes', target: 'Chores' });
    expect(result.updates).toContainEqual({ title: '1 overdue expense', detail: 'Electricity', target: 'Expenses' });
    expect(JSON.stringify(result)).not.toMatch(/Laundry|Trash|Vacuum|Internet/);
  });

  it('compares items with the previous welcome and still flags known overdue items', () => {
    const data = household();
    data.welcomeSeen = { chores: ['old'], expenses: ['old-bill'] };
    data.chores = [
      { id: 'old', title: 'Dishes', due: '2026-11-14', completed: false },
      { id: 'new', title: 'Trash', due: '2026-11-16', completed: false },
    ];
    data.expenses = [
      { id: 'old-bill', title: 'Rent', due: '2026-12-01', amount: 500 },
      { id: 'new-bill', title: 'Groceries', due: '2026-11-17', amount: 20 },
    ];
    const { updates } = getRoomieWelcome(data, now);
    expect(updates).toContainEqual({ title: '1 new chore', detail: 'Trash', target: 'Chores' });
    expect(updates).toContainEqual({ title: '1 new expense', detail: 'Groceries', target: 'Expenses' });
    expect(updates).toContainEqual({ title: '1 overdue chore', detail: 'Dishes', target: 'Chores' });
  });

  it('shows a happy all-clear for an empty household, including without a pet setup', () => {
    const data = household();
    data.pet = null;
    expect(getRoomieWelcome(data, now)).toMatchObject({ mood: 'Happy', updates: [] });
    expect(getRoomieWelcome(data, now).dialogue).toContain('nothing new');
  });

  it('explains attention and includes chores, bills, and events due today', () => {
    const data = household();
    data.pet!.lastAttention = null;
    data.chores = [{ id: 'today', title: 'Dishes', due: '2026-11-15', completed: false }];
    data.expenses = [{ id: 'bill', title: 'Internet', due: '2026-11-15', amount: 10 }];
    data.events = [{ id: 'event', title: 'Dinner', date: '2026-11-15' }];
    const result = getRoomieWelcome(data, now);
    expect(result.mood).toBe('Attention');
    expect(result.dialogue).toContain('attention');
    expect(result.updates.map(item => item.title)).toEqual(['1 new chore', '1 new expense', '1 chore due today', '1 expense due today', '1 event today']);
  });
});
