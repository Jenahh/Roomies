import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { emptyLedger, parseLedger, withRoster, type HouseholdLedger, type LedgerMember } from '../features/settlement/ledger';

export function householdLedgerKey(household: string) {
  return 'roomies:household-expenses:' + household.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function readWeb(key: string) {
  try { return parseLedger(JSON.parse(localStorage.getItem(key) || 'null')); } catch { return emptyLedger; }
}

/**
 * The shared expense ledger for one household. Every roommate that is signed in on this device reads and writes the same record, 
 * and open tabs pick up each other's changes.
 */
export function useHouseholdLedger(household: string, roster: LedgerMember[]) {
  const key = householdLedgerKey(household);
  const rosterKey = roster.map(member => member.id + '=' + member.name).join('|');
  const stableRoster = useMemo(() => roster, [rosterKey]);
  const [ledger, setLedger] = useState<HouseholdLedger>(() => Platform.OS === 'web' ? withRoster(readWeb(key), roster) : withRoster(emptyLedger, roster));
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    if (Platform.OS === 'web') {
      setLedger(withRoster(readWeb(key), stableRoster));
      const onStorage = (event: StorageEvent) => { if (event.key === key || event.key === null) setLedger(withRoster(readWeb(key), stableRoster)); };
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    }
    let active = true;
    AsyncStorage.getItem(key)
      .then(stored => { if (active) setLedger(withRoster(parseLedger(JSON.parse(stored || 'null')), stableRoster)); })
      .catch(() => { if (active) setStorageError('Saved expenses could not be loaded from this device.'); });
    return () => { active = false; };
  }, [key, stableRoster]);

  /** Applies a change to the latest saved ledger so that two open tabs never overwrite each other. */
  const update = useCallback((change: (current: HouseholdLedger) => HouseholdLedger) => {
    if (Platform.OS === 'web') {
      const next = change(withRoster(readWeb(key), stableRoster));
      try { localStorage.setItem(key, JSON.stringify(next)); setStorageError(''); }
      catch { setStorageError('Expenses could not be saved on this device. Keep this page open to retain them.'); }
      setLedger(next);
      return;
    }
    setLedger(current => {
      const next = change(current);
      AsyncStorage.setItem(key, JSON.stringify(next)).then(() => setStorageError('')).catch(() => setStorageError('Expenses could not be saved on this device.'));
      return next;
    });
  }, [key, stableRoster]);

  return { ledger, update, storageError };
}
