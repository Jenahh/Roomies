import { useEffect, useRef, useState } from 'react';
import type { Chore } from './useResidentData';

type ChoreSnapshot = {
  chores: Chore[];
  roommates: { id: string; name: string }[];
};

export function useSharedChores(email: string, householdId: number | undefined, activeTab: string) {
  const endpoint = householdId === undefined ? null : '/api/households/' + householdId + '/chores';
  const [snapshot, setSnapshot] = useState<ChoreSnapshot>();
  const [loadError, setLoadError] = useState('');
  const [writeError, setWriteError] = useState('');
  const [busy, setBusy] = useState(false);
  const writing = useRef(false);

  async function request(url: string, method: string, body?: object, signal?: AbortSignal) {
    const response = await fetch(url, {
      method, signal,
      headers: { 'X-Roomies-Demo-Email': email, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const failure = await response.json().catch(() => null);
      throw new Error(failure?.error || 'Start the Roomies demo API and try again.');
    }
    return await response.json() as ChoreSnapshot;
  }

  useEffect(() => {
    if (!endpoint || busy) return;
    const controller = new AbortController();
    request(endpoint, 'GET', undefined, controller.signal).then(result => {
      if (controller.signal.aborted || writing.current) return;
      setSnapshot(result);
      setLoadError('');
    }).catch((failure: Error) => {
      if (!controller.signal.aborted) setLoadError(failure.message);
    });
    return () => controller.abort();
  }, [endpoint, email, activeTab, busy]);

  async function update(path: string, method: string, body: object) {
    if (!endpoint || writing.current || !snapshot) return false;
    writing.current = true;
    setBusy(true);
    setWriteError('');
    try {
      setSnapshot(await request(endpoint + path, method, body));
      return true;
    } catch (failure) {
      setWriteError(failure instanceof Error ? failure.message : 'Could not save the chore.');
      return false;
    } finally {
      writing.current = false;
      setBusy(false);
    }
  }

  return {
    snapshot, error: writeError || loadError, busy: busy || !snapshot,
    add: (chores: Chore[]) => update('', 'POST', { chores }),
    complete: (chore: Chore) => update('/' + chore.id, 'PATCH', { completed: !chore.completed }),
  };
}
