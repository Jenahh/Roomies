import type { ResidentData } from '../hooks/useResidentData';

export type PetMood = 'Happy' | 'Attention' | 'Stressed';

export function getPetMood(data: ResidentData, now: Date): PetMood {
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  const overdueChore = data.chores.some(chore => !chore.completed && chore.due < today && (!chore.unassigned && (!chore.assignee || chore.assignee === data.name)));
  const overdueExpense = data.expenses.some(expense => !expense.settled && expense.due < today);
  if (overdueChore || overdueExpense) return 'Stressed';
  if (data.pet && (!data.pet.lastAttention || now.getTime() - new Date(data.pet.lastAttention).getTime() >= 86400000)) return 'Attention';
  return 'Happy';
}
