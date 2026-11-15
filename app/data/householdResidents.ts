import type { ManagedResident } from './demoPropertyManager';

export function getHouseholdResidents(residents: ManagedResident[], householdId?: string) {
  return residents.filter(resident => resident.householdId === householdId);
}

export function replaceHouseholdResidents(residents: ManagedResident[], householdId: string | undefined, updated: ManagedResident[]) {
  return [
    ...residents.filter(resident => resident.householdId !== householdId),
    ...updated.map(resident => ({ ...resident, householdId })),
  ];
}
