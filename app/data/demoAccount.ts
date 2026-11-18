export type ResidentUser = {
  name: string;
  email: string;
  demoHouseholdId?: number;
  databaseDemoStaff?: boolean;
  role: 'resident' | 'assistant' | 'property-manager';
};

export const demoResident: ResidentUser = {
  name: 'Resident Roomie',
  email: 'resident@gmail.com',
  role: 'resident',
};

// The demo resident is already assigned to this household before opening Chores.
export const demoResidentHousehold = {
  name: 'Maple Hall · 3B',
  roommates: [
    { id: 'maple-3b-maya', name: 'Maya' },
    { id: 'maple-3b-jordan', name: 'Jordan' },
  ],
};

export const demoResidentAssistant: ResidentUser = {
  name: 'Resident Assistant',
  email: 'resident.assistant@gmail.com',
  role: 'assistant',
};

export const demoPropertyManager: ResidentUser = {
  name: 'Casey',
  email: 'property.manager@gmail.com',
  role: 'property-manager',
};

const databaseDemoResidents: ResidentUser[] = [
  { name: 'Alex', email: 'alex@example.com', role: 'resident', demoHouseholdId: 1 },
  { name: 'Mia', email: 'mia@example.com', role: 'resident', demoHouseholdId: 1 },
  { name: 'Sam', email: 'sam@example.com', role: 'resident', demoHouseholdId: 1 },
  { name: 'Riley', email: 'riley@example.com', role: 'resident', demoHouseholdId: 2 },
];

const databaseDemoStaff: ResidentUser[] = [
  { name: 'Jordan', email: 'jordan@example.com', role: 'property-manager', databaseDemoStaff: true },
  { name: 'Morgan', email: 'morgan@example.com', role: 'property-manager', databaseDemoStaff: true },
  { name: 'Taylor', email: 'taylor@example.com', role: 'assistant', databaseDemoStaff: true },
  { name: 'Casey', email: 'casey@example.com', role: 'assistant', databaseDemoStaff: true },
];

export const demoAccounts = [
  ...databaseDemoStaff.map(user => ({ user, password: '1234' })),
  ...databaseDemoResidents.map(user => ({ user, password: '1234' })),
  { user: demoResident, password: '1234' },
  { user: demoResidentAssistant, password: '1234' },
  { user: demoPropertyManager, password: '1234' },
];
