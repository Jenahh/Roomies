import type { SchedulerMember, ChoreTemplate } from '../features/scheduler/scheduler';
import { useEffect, useState } from 'react';

export type Chore = { id: string; title: string; due: string; completed: boolean; assignee?: string; time?: string; memberId?: string; templateId?: string; minutes?: number; scheduleWeek?: string; reason?: string };
export type Expense = { id: string; title: string; amount: number; due: string; totalAmount?: number; splitCount?: number; paidBy?: string; category?: string; recurring?: boolean; settled?: boolean };
export type HouseholdEvent = { id: string; title: string; date: string; time?: string; attendees?: string };
export type SupportDraft = { id: string; kind: 'maintenance' | 'ra'; title: string; description: string; location: string; createdAt: string; category?: string; photo?: string };
export type ResidentData = {
  scheduler?: { members: SchedulerMember[]; templates: ChoreTemplate[] };
  name: string;
  household: string;
  pet: { name: string; lastAttention: string | null; color?: string; accessory?: string } | null;
  chores: Chore[];
  expenses: Expense[];
  events: HouseholdEvent[];
  supportDrafts?: SupportDraft[];
  livingPreferences?: { quietHours: string; cleaning: string; guests: string };
  notificationPreferences?: { choresAndBills: boolean; events: boolean; quietHours: boolean };
  reminderState?: Record<string, { read?: boolean; snoozedUntil?: string }>;
};

export function useResidentData(email: string, initialName: string) {
  const key = `roomies:resident:${email}`;
  const [data, setData] = useState<ResidentData>(() => {
    const empty: ResidentData = { name: initialName, household: '', pet: null, chores: [], expenses: [], events: [] };
    try {
      const stored = JSON.parse(localStorage.getItem(key) || 'null');
      if (stored && typeof stored.name === 'string' && typeof stored.household === 'string'
        && Array.isArray(stored.chores) && Array.isArray(stored.expenses) && Array.isArray(stored.events)
        && (stored.pet === null || (typeof stored.pet?.name === 'string'
          && (stored.pet.lastAttention === null || typeof stored.pet.lastAttention === 'string')))) return stored as ResidentData;
    } catch { /* Start with an empty household when saved data is unavailable. */ }
    return empty;
  });
  const [storageError, setStorageError] = useState('');
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      setStorageError('');
    } catch {
      setStorageError('Changes could not be saved on this device. Keep this page open to retain them.');
    }
  }, [key, data]);
  return { data, setData, storageError };
}
