export type ConcernStatus = 'New' | 'In Progress' | 'Resolved';

export type ResidentConcern = {
  id: string;
  title: string;
  room: string;
  resident: string;
  detail: string;
  status: ConcernStatus;
};

export type HallUpdate = { id: string; title: string; schedule: string; description: string };

// Local demo content; these are not live resident requests or messages.
export const demoHall = 'Maple Hall';
export const demoConcerns: ResidentConcern[] = [
  { id: 'noise', title: 'Late-night noise', room: 'C-217', resident: 'Alexandra Hawk', detail: '9:35 am', status: 'New' },
  { id: 'settling-in', title: 'Settling into hall life', room: 'C-209', resident: 'Sam Rivera', detail: 'Follow-up at 2 pm', status: 'In Progress' },
  { id: 'study-space', title: 'Finding a study space', room: 'C-198', resident: 'Avery Chen', detail: 'Closed Oct 16', status: 'Resolved' },
];

export const demoHallUpdates: HallUpdate[] = [
  { id: 'drop-in', title: 'Maple Hall community drop-in', schedule: 'Wed, Oct 21 · 6 pm · Ground-floor lounge', description: 'Optional conversation, tea and a little connection.' },
];
