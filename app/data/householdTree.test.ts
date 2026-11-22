import { describe, expect, it } from 'vitest';
import { getTreeProgress } from '../../assets/roomie-tree-stages/roomie-tree-stages/treeStages';
import { countCompletedChores } from './householdTree';
import { getPersonalChorePoints, hasUnlockedLeafHat, LEAF_HAT_POINTS, POINTS_PER_CHORE } from './choreRewards';
import type { Chore } from '../hooks/useResidentData';

describe('household tree progress', () => {
  it('uses the five supplied thresholds and caps the final stage', () => {
    expect([0, 9, 10, 19, 20, 29, 30, 39, 40, 49, 50, 80].map(points => getTreeProgress(points).stage)).toEqual([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
    expect(getTreeProgress(0)).toMatchObject({ image: null, remaining: 10, progress: 0 });
    expect(getTreeProgress(14)).toMatchObject({ remaining: 6, progress: 0.4 });
    expect(getTreeProgress(50)).toMatchObject({ remaining: 0, progress: 1 });
  });
  it('counts each completed occurrence once, including separate recurring occurrences', () => {
    const chore = (id: string, completed: boolean): Chore => ({ id, completed, title: 'Dishes', due: '2026-11-17', templateId: 'dishes' });
    expect(countCompletedChores([chore('one', true), chore('one', true), chore('two', true), chore('three', false)])).toBe(2);
    expect(countCompletedChores([chore('one', false)])).toBe(0);
  });

  it('unlocks the leaf hat at the personal threshold even after the household tree matures', () => {
    const chores: Chore[] = Array.from({ length: 30 }, (_, index) => ({
      id: String(index),
      title: 'Dishes',
      due: '2026-11-17',
      completed: index !== 1,
      memberId: index < 2 ? 'resident-self' : 'roommate',
    }));
    const data = { name: 'Alex', household: 'Home', chores, expenses: [], events: [], pet: null };
    expect(getPersonalChorePoints(data, true)).toBe(LEAF_HAT_POINTS - POINTS_PER_CHORE);
    expect(getTreeProgress(countCompletedChores(chores) * POINTS_PER_CHORE).stage).toBe(5);
    chores[1].completed = true;
    expect(getPersonalChorePoints(data, true)).toBe(LEAF_HAT_POINTS);
  });

  it('recognizes saved unlocks and hats equipped before unlock history was added', () => {
    expect(hasUnlockedLeafHat({ pet: null })).toBe(false);
    expect(hasUnlockedLeafHat({ pet: null, leafHatUnlock: 'pending' })).toBe(true);
    expect(hasUnlockedLeafHat({ pet: null, leafHatUnlock: 'seen' })).toBe(true);
    expect(hasUnlockedLeafHat({ pet: { name: 'Pip', lastAttention: null, accessory: 'Leaf hat' } })).toBe(true);
  });
});
