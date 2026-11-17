import type { ChoreLook } from '../data/chorePresets';
import type { SchedulerMember, ChoreTemplate } from '../features/scheduler/scheduler';
import type { RoomieAccessoryId } from '../data/roomiePetAccessories';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type Chore = { unassigned?: boolean; look?: ChoreLook; id: string; title: string; due: string; completed: boolean; assignee?: string; time?: string; memberId?: string; templateId?: string; minutes?: number; scheduleWeek?: string; reason?: string };
export type Expense = { id: string; title: string; amount: number; due: string; totalAmount?: number; splitCount?: number; paidBy?: string; category?: string; recurring?: boolean; settled?: boolean };
export type HouseholdEvent = { id: string; title: string; date: string; time?: string; attendees?: string; custom?: boolean };
export type SupportDraft = { id: string; kind: 'maintenance' | 'ra'; title: string; description: string; location: string; createdAt: string; category?: string; photo?: string };
export type ResidentData = {
  welcomeSeen?: { chores: string[]; expenses: string[] };
  scheduler?: { members: SchedulerMember[]; templates: ChoreTemplate[] };
  name: string;
  household: string;
  pet: { name: string; lastAttention: string | null; color?: string; accessory?: string; accessories?: RoomieAccessoryId[]; accessoryColors?: Partial<Record<RoomieAccessoryId, string>> } | null;
  chores: Chore[];
  expenses: Expense[];
  events: HouseholdEvent[];
  supportDrafts?: SupportDraft[];
  livingPreferences?: { quietHours: string; cleaning: string; guests: string };
  notificationPreferences?: { choresAndBills: boolean; events: boolean; quietHours: boolean };
  reminderState?: Record<string, { read?: boolean; snoozedUntil?: string }>;
};

function isResidentData(value: unknown): value is ResidentData {
  if (!value || typeof value !== 'object') return false;
  const stored = value as Record<string, unknown>;
  const pet = stored.pet;
  return typeof stored.name === 'string'
    && typeof stored.household === 'string'
    && Array.isArray(stored.chores)
    && Array.isArray(stored.expenses)
    && Array.isArray(stored.events)
    && (pet === null || (typeof pet === 'object' && pet !== null
      && typeof (pet as Record<string, unknown>).name === 'string'
      && ((pet as Record<string, unknown>).lastAttention === null || typeof (pet as Record<string, unknown>).lastAttention === 'string')));
}

export function useResidentData(email: string, initialName: string) {
  const key = `roomies:resident:${email}`;
  const [data, setData] = useState<ResidentData>(() => {
    const empty: ResidentData = { name: initialName, household: '', pet: null, chores: [], expenses: [], events: [] };
    if (Platform.OS !== 'web') return empty;
    try {
      const stored = JSON.parse(localStorage.getItem(key) || 'null');
      if (isResidentData(stored)) return stored;
    } catch { /* Start with an empty household when saved data is unavailable. */ }
    return empty;
  });
  const [storageError, setStorageError] = useState('');
  const [storageReady, setStorageReady] = useState(Platform.OS === 'web');

  useEffect(() => {
    if (Platform.OS === 'web') return;
    let active = true;
    async function load() {
      try {
        const stored = JSON.parse((await AsyncStorage.getItem(key)) || 'null');
        if (active && isResidentData(stored)) setData(stored);
      } catch {
        if (active) setStorageError('Saved data could not be loaded from this device.');
      } finally {
        if (active) setStorageReady(true);
      }
    }
    void load();
    return () => { active = false; };
  }, [key]);

  useEffect(() => {
    if (!storageReady) return;
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, JSON.stringify(data));
        setStorageError('');
      } else {
        void AsyncStorage.setItem(key, JSON.stringify(data))
          .then(() => setStorageError(''))
          .catch(() => setStorageError('Changes could not be saved on this device.'));
      }
    } catch {
      setStorageError('Changes could not be saved on this device. Keep this page open to retain them.');
    }
  }, [key, data, storageReady]);
  return { data, setData, storageError };
}
