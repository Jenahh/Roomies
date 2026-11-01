export type ResidentUser = {
  name: string;
  email: string;
  role: 'resident';
};

export const demoResident: ResidentUser = {
  name: 'Resident Roomie',
  email: 'resident@gmail.com',
  role: 'resident',
};
