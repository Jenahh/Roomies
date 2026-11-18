import { describe, expect, it } from 'vitest';
import { getTreeProgress } from '../../assets/roomie-tree-stages/roomie-tree-stages/treeStages';
import { countCompletedChores } from './householdTree';
import type { Chore } from '../hooks/useResidentData';

describe('household tree progress', () => {
  it('uses the five supplied thresholds and caps the final stage', () => {
    expect([0, 4, 5, 14, 15, 29, 30, 49, 50, 80].map(n => getTreeProgress(n).stage)).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
    expect(getTreeProgress(2)).toMatchObject({ remaining: 3, progress: 0.4 });
    expect(getTreeProgress(50)).toMatchObject({ remaining: 0, progress: 1 });
  });
  it('counts each completed occurrence once, including separate recurring occurrences', () => {
    const chore = (id: string, completed: boolean): Chore => ({ id, completed, title: 'Dishes', due: '2026-11-17', templateId: 'dishes' });
    expect(countCompletedChores([chore('one', true), chore('one', true), chore('two', true), chore('three', false)])).toBe(2);
    expect(countCompletedChores([chore('one', false)])).toBe(0);
  });
});
