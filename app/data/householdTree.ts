import type { Chore } from '../hooks/useResidentData';

// Each recurring occurrence has its own ID; duplicate records count once.
export function countCompletedChores(chores: readonly Chore[]): number {
  return new Set(chores.filter(chore => chore.completed).map(chore => chore.id)).size;
}
