export type MaintenanceRequest = {
  id: string;
  title: string;
  unit: string;
  detail: string;
  status: 'Submitted' | 'In Progress';
};

export type Announcement = { id: string; title: string; message: string };
export type ManagedHousehold = { id: string; propertyName: string; name: string };

// Sample community data for the property manager demo.
export const demoProperty = {
  name: 'Maple Hall',
  homes: 36,
  activeHomes: 30,
  activeResidents: 120,
  weeklyEngagement: 74,
  resolvedThisMonth: 24,
};

export const demoMaintenanceRequests: MaintenanceRequest[] = [
  { id: 'M-1042', title: 'Kitchen faucet is dripping', unit: '3B', detail: 'Normal · 9:20 am', status: 'Submitted' },
  { id: 'M-1039', title: 'Hallway light flickering', unit: 'Level 3', detail: 'High', status: 'In Progress' },
  { id: 'M-1043', title: 'Bedroom window is stuck', unit: '2A', detail: 'Normal', status: 'Submitted' },
  { id: 'M-1044', title: 'Laundry dryer not heating', unit: 'Laundry room', detail: 'Normal', status: 'Submitted' },
  { id: 'M-1038', title: 'Bathroom fan is noisy', unit: '1C', detail: 'Normal', status: 'In Progress' },
  { id: 'M-1037', title: 'Front door closer needs adjusting', unit: 'Entrance', detail: 'High', status: 'In Progress' },
  { id: 'M-1036', title: 'Loose cabinet handle', unit: '4A', detail: 'Low', status: 'In Progress' },
  { id: 'M-1035', title: 'Radiator needs inspection', unit: '2C', detail: 'Normal', status: 'In Progress' },
];

export type ManagedResident = {
  id: string;
  householdId?: string;
  joinCode?: string;
  name: string;
  email: string;
  unit: string;
  access: 'Active' | 'Suspended' | 'Invited';
};

export const demoManagedResidents: ManagedResident[] = [
  { id: 'alexandra', name: 'Alexandra Hawk', email: 'alexandra@example.com', unit: '3B', access: 'Active' },
  { id: 'elizabeth', name: 'Elizabeth Odukoya', email: 'elizabeth@example.com', unit: '3B', access: 'Active' },
  { id: 'jenah', name: 'Jenah Mansour', email: 'jenah@example.com', unit: '3B', access: 'Active' },
  { id: 'madison', name: 'Madison Harman', email: 'madison@example.com', unit: '3B', access: 'Active' },
  { id: 'nour', name: 'Nour Khalifa', email: 'nour@example.com', unit: '3B', access: 'Active' },
  { id: 'sam', name: 'Sam Rivera', email: 'sam@example.com', unit: '3C', access: 'Active' },
  { id: 'avery', name: 'Avery Chen', email: 'avery@example.com', unit: '3C', access: 'Active' },
  { id: 'jordan', name: 'Jordan Lee', email: 'jordan@example.com', unit: '3C', access: 'Active' },
  { id: 'taylor', name: 'Taylor Morgan', email: 'taylor@example.com', unit: '3C', access: 'Active' },
  { id: 'riley', name: 'Riley Adams', email: 'riley@example.com', unit: '3C', access: 'Invited' },
];
