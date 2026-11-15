import { useCallback, useEffect, useState } from 'react';
import {
  appendStaffMessage, loadStaffThread, markStaffThreadRead, saveStaffThread, staffChatKey, unreadStaffCount,
  type StaffRole, type StaffThread,
} from '../data/staffChat';

export type StaffChat = {
  thread: StaffThread;
  unread: number;
  storageError: string;
  send: (text: string) => void;
  markRead: () => void;
};

/** The RA ↔ Property Manager conversation for one hall, from `role`'s point of view. */
export function useStaffChat(hall: string, role: StaffRole): StaffChat {
  const key = staffChatKey(hall);
  const [thread, setThread] = useState<StaffThread>(() => loadStaffThread(key));
  const [storageError, setStorageError] = useState('');

  // Pick up messages the other person sends from another tab or window.
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
    const onStorage = (event: StorageEvent) => { if (event.key === key || event.key === null) setThread(loadStaffThread(key)); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  // Always apply changes to the latest stored thread so two open tabs never overwrite each other.
  const update = useCallback((change: (current: StaffThread) => StaffThread) => {
    const current = loadStaffThread(key);
    const next = change(current);
    if (next === current) return;
    setStorageError(saveStaffThread(key, next) ? '' : 'Messages could not be saved on this device. Keep this page open to retain them.');
    setThread(next);
  }, [key]);

  const send = useCallback((text: string) => update(current => appendStaffMessage(current, role, text)), [update, role]);
  const markRead = useCallback(() => update(current => unreadStaffCount(current, role) ? markStaffThreadRead(current, role) : current), [update, role]);

  return { thread, unread: unreadStaffCount(thread, role), storageError, send, markRead };
}
