import type { Chore, ResidentData } from '../hooks/useResidentData';
import { countCompletedChores } from './householdTree';
import { getPetAccessoryIds } from './roomiePetAccessories';

export const POINTS_PER_CHORE = 10;
export const LEAF_HAT_POINTS = 20;

export function hasUnlockedLeafHat(data: Pick<ResidentData, 'pet' | 'leafHatUnlock'>): boolean {
  return data.leafHatUnlock === 'pending' || data.leafHatUnlock === 'seen' || getPetAccessoryIds(data.pet).includes('sprout-hat');
}

export function isPersonalChore(chore: Chore, name: string, shared = false): boolean {
  return !chore.unassigned && (shared ? chore.memberId === 'resident-self' : !chore.assignee || chore.assignee === name);
}

export function getPersonalChorePoints(data: ResidentData, shared = false): number {
  return countCompletedChores(data.chores.filter(chore => isPersonalChore(chore, data.name, shared))) * POINTS_PER_CHORE;
}
