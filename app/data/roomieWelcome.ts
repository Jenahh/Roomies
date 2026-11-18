import type { ResidentData } from '../hooks/useResidentData';
import { getPetMood } from './roomiePetMood';

export type WelcomeTarget = 'Chores' | 'Expenses' | 'Calendar';
export type WelcomeUpdate = { title: string; detail: string; target: WelcomeTarget };

export function getRoomieWelcome(data: ResidentData, now: Date) {
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  const chores = data.chores.filter(item => !item.completed && !item.unassigned && (!item.assignee || item.assignee === data.name));
  const expenses = data.expenses.filter(item => !item.settled);
  const updates: WelcomeUpdate[] = [];
  const titles = (items: { title: string }[]) => items.slice(0, 3).map(item => item.title).join(', ') + (items.length > 3 ? ` and ${items.length - 3} more` : '');
  const add = (items: { title: string }[], label: string, target: WelcomeTarget) => {
    if (items.length) updates.push({ title: `${items.length} ${label}`, detail: titles(items), target });
  };
  const overdueChores = chores.filter(item => item.due < today);
  const overdueExpenses = expenses.filter(item => item.due < today);
  add(overdueChores, overdueChores.length === 1 ? 'overdue chore' : 'overdue chores', 'Chores');
  add(overdueExpenses, overdueExpenses.length === 1 ? 'overdue expense' : 'overdue expenses', 'Expenses');
  const newChores = chores.filter(item => !data.welcomeSeen?.chores.includes(item.id));
  const newExpenses = expenses.filter(item => !data.welcomeSeen?.expenses.includes(item.id));
  add(newChores, newChores.length === 1 ? 'new chore' : 'new chores', 'Chores');
  add(newExpenses, newExpenses.length === 1 ? 'new expense' : 'new expenses', 'Expenses');
  const dueToday = chores.filter(item => item.due === today);
  add(dueToday, dueToday.length === 1 ? 'chore due today' : 'chores due today', 'Chores');
  const billsToday = expenses.filter(item => item.due === today);
  add(billsToday, billsToday.length === 1 ? 'expense due today' : 'expenses due today', 'Expenses');
  const eventsToday = data.events.filter(item => item.date === today);
  add(eventsToday, eventsToday.length === 1 ? 'event today' : 'events today', 'Calendar');
  const mood = getPetMood(data, now);
  const dialogue = mood === 'Stressed'
    ? "I'm feeling a little stressed because there are overdue chores or expenses. Let's take them one at a time!"
    : mood === 'Attention'
      ? "I've missed you! I could use a little attention. Here's what's happening at home."
      : updates.length
        ? "I'm feeling happy! Here's a little update on what's happening at home."
        : "I'm feeling happy! There are no overdue chores or expenses, and nothing new to catch up on.";
  return { mood, dialogue, updates };
}
