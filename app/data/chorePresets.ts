import type { IconName } from '../components/dashboard/DashboardIcon';

export const choreLooks = {
  dishes: { label: 'Dishes', icon: 'dishes', tint: '#E8F0FF', ink: '#345295' },
  counters: { label: 'Wipe counters', icon: 'sparkles', tint: '#FFF1D8', ink: '#79521E' },
  trash: { label: 'Take out trash', icon: 'trash', tint: '#E5F4EA', ink: '#315F46' },
  floors: { label: 'Sweep floors', icon: 'broom', tint: '#F0E9FC', ink: '#64428A' },
  laundry: { label: 'Laundry', icon: 'laundry', tint: '#FCE8ED', ink: '#8E4259' },
  plants: { label: 'Water plants', icon: 'sprout', tint: '#ECF4DC', ink: '#47602B' },
  custom: { label: 'Custom', icon: 'star', tint: '#FFF1D8', ink: '#79521E' },
} satisfies Record<string, { label: string; icon: IconName; tint: string; ink: string }>;

export type ChoreLook = keyof typeof choreLooks;
export const chorePresets = [
  { look: 'dishes', title: 'Wash the dishes', minutes: 20, frequency: 3 },
  { look: 'counters', title: 'Wipe kitchen counters', minutes: 15, frequency: 2 },
  { look: 'trash', title: 'Take out the trash', minutes: 10, frequency: 1 },
  { look: 'floors', title: 'Sweep shared spaces', minutes: 20, frequency: 1 },
  { look: 'laundry', title: 'Do the laundry', minutes: 30, frequency: 1 },
  { look: 'plants', title: 'Water the plants', minutes: 5, frequency: 1 },
] as const;

export function resolveChoreLook(look?: ChoreLook, title = ''): ChoreLook {
  if (look && Object.hasOwn(choreLooks, look)) return look;
  if (/dish|plate/i.test(title)) return 'dishes';
  if (/trash|garbage|recycl/i.test(title)) return 'trash';
  if (/sweep|floor|vacuum|mop/i.test(title)) return 'floors';
  if (/laundry|clothes/i.test(title)) return 'laundry';
  if (/plant/i.test(title)) return 'plants';
  if (/kitchen|counter/i.test(title)) return 'counters';
  return 'custom';
}

export function getChoreLook(look?: ChoreLook, title = '') {
  return choreLooks[resolveChoreLook(look, title)];
}
