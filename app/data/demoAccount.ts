export type ResidentUser = {
  name: string;
  email: string;
  role: 'resident' | 'assistant' | 'property-manager';
};

export const demoResident: ResidentUser = {
  name: 'Resident Roomie',
  email: 'resident@gmail.com',
  role: 'resident',
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

export const demoAccounts = [
  { user: demoResident, password: '1234' },
  { user: demoResidentAssistant, password: '1234' },
  { user: demoPropertyManager, password: '1234' },
];
