import type { ResidentData } from '../hooks/useResidentData';

export type PetMood = 'Happy' | 'Annoyed' | 'Stressed';

export function getPetMood(data: ResidentData, now: Date): PetMood {
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  const unfinished = data.chores.filter(chore => !chore.completed);
  const dueToday = new Set(unfinished.filter(chore => chore.due === today).map(chore => chore.id));
  if (dueToday.size > 5) return 'Stressed';
  if (unfinished.some(chore => chore.due && chore.due < today)) return 'Annoyed';
  return 'Happy';
}
