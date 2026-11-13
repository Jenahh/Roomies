export const ROOMIE_ACTIONS = {
  chores: { label: 'Chores', sprite: 'broom' },
  expenses: { label: 'Expenses', sprite: 'receipt' },
  dinner: { label: 'Meals', sprite: 'food' },
  calendar: { label: 'Calendar events', sprite: 'calendar' },
} as const;

export type RoomieActionId = keyof typeof ROOMIE_ACTIONS;
