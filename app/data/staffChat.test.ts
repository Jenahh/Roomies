import { beforeEach, describe, expect, it } from 'vitest';
import {
  appendStaffMessage, emptyStaffThread, getStaffCounterpart, isStaffMessageSeen, loadStaffThread, markStaffThreadRead,
  MAX_STAFF_MESSAGE_LENGTH, saveStaffThread, staffChatKey, unreadStaffCount,
} from './staffChat';

const store = new Map<string, string>();
globalThis.localStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => { store.set(key, value); },
  removeItem: (key: string) => { store.delete(key); },
  clear: () => store.clear(),
  key: () => null,
  length: 0,
} as Storage;

const at = (minute: number) => new Date(Date.UTC(2026, 10, 14, 15, minute));

describe('RA and property manager chat', () => {
  beforeEach(() => store.clear());

  it('shares one thread per hall between both roles', () => {
    const key = staffChatKey('Maple Hall');
    expect(key).toBe('roomies:staff-chat:maple-hall');
    const sentByRa = appendStaffMessage(loadStaffThread(key), 'assistant', '  Dryer on level 3 is out again.  ', at(0));
    expect(saveStaffThread(key, sentByRa)).toBe(true);

    const seenByManager = loadStaffThread(key);
    expect(seenByManager.messages.map(message => [message.sender, message.text])).toEqual([['assistant', 'Dryer on level 3 is out again.']]);
    expect(unreadStaffCount(seenByManager, 'property-manager')).toBe(1);
    expect(unreadStaffCount(seenByManager, 'assistant')).toBe(0);
  });

  it('clears unread and shows Seen once the other person opens the chat', () => {
    let thread = appendStaffMessage(emptyStaffThread, 'assistant', 'Can maintenance come Monday?', at(0));
    expect(isStaffMessageSeen(thread, thread.messages[0])).toBe(false);
    thread = markStaffThreadRead(thread, 'property-manager', at(5));
    expect(unreadStaffCount(thread, 'property-manager')).toBe(0);
    expect(isStaffMessageSeen(thread, thread.messages[0])).toBe(true);

    thread = appendStaffMessage(thread, 'property-manager', 'Yes, booked for 10 am.', at(6));
    expect(unreadStaffCount(thread, 'assistant')).toBe(1);
    expect(isStaffMessageSeen(thread, thread.messages[1])).toBe(false);
  });

  it('ignores blank messages and caps long ones', () => {
    expect(appendStaffMessage(emptyStaffThread, 'assistant', '   ')).toBe(emptyStaffThread);
    const long = appendStaffMessage(emptyStaffThread, 'assistant', 'a'.repeat(MAX_STAFF_MESSAGE_LENGTH + 50));
    expect(long.messages[0].text).toHaveLength(MAX_STAFF_MESSAGE_LENGTH);
  });

  it('recovers from missing or malformed saved threads', () => {
    expect(loadStaffThread('missing')).toEqual(emptyStaffThread);
    store.set('bad', '{not json');
    expect(loadStaffThread('bad')).toEqual(emptyStaffThread);
    store.set('mixed', JSON.stringify({ messages: [{ id: '1', sender: 'resident', text: 'x', sentAt: 'y' }, { id: '2', sender: 'assistant', text: 'ok', sentAt: at(0).toISOString() }], lastRead: { assistant: 5 } }));
    expect(loadStaffThread('mixed')).toEqual({ messages: [{ id: '2', sender: 'assistant', text: 'ok', sentAt: at(0).toISOString() }], lastRead: {} });
  });

  it('names the other person from their saved profile', () => {
    expect(getStaffCounterpart('assistant')).toEqual({ role: 'property-manager', name: 'Casey', roleLabel: 'Property Manager' });
    store.set('roomies:resident:resident.assistant@gmail.com', JSON.stringify({ name: 'Jordan Lee' }));
    expect(getStaffCounterpart('property-manager')).toEqual({ role: 'assistant', name: 'Jordan Lee', roleLabel: 'Resident Assistant' });
  });
});
