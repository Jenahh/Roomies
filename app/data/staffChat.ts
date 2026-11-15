import { demoPropertyManager, demoResidentAssistant, type ResidentUser } from './demoAccount';

// Direct messages between a hall's Resident Assistant and its Property Manager.
// The thread is kept in localStorage under one shared key per hall, so both demo
// accounts on this device read and write the same conversation.

export type StaffRole = Exclude<ResidentUser['role'], 'resident'>;
export type StaffMessage = { id: string; sender: StaffRole; text: string; sentAt: string };
export type StaffThread = { messages: StaffMessage[]; lastRead: Partial<Record<StaffRole, string>> };

export const MAX_STAFF_MESSAGE_LENGTH = 1000;
export const emptyStaffThread: StaffThread = { messages: [], lastRead: {} };

export const staffRoleLabels: Record<StaffRole, string> = {
  assistant: 'Resident Assistant',
  'property-manager': 'Property Manager',
};

const staffAccounts: Record<StaffRole, ResidentUser> = {
  assistant: demoResidentAssistant,
  'property-manager': demoPropertyManager,
};

export function counterpartRole(role: StaffRole): StaffRole {
  return role === 'assistant' ? 'property-manager' : 'assistant';
}

export function staffChatKey(hall: string) {
  return `roomies:staff-chat:${hall.trim().toLowerCase().replace(/\s+/g, '-')}`;
}

function isStaffRole(value: unknown): value is StaffRole {
  return value === 'assistant' || value === 'property-manager';
}

function isMessage(value: unknown): value is StaffMessage {
  const message = value as StaffMessage | null;
  return !!message && typeof message.id === 'string' && isStaffRole(message.sender)
    && typeof message.text === 'string' && typeof message.sentAt === 'string';
}

export function loadStaffThread(key: string): StaffThread {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || 'null');
    if (!stored || !Array.isArray(stored.messages)) return emptyStaffThread;
    const lastRead: StaffThread['lastRead'] = {};
    for (const role of ['assistant', 'property-manager'] as const) {
      if (typeof stored.lastRead?.[role] === 'string') lastRead[role] = stored.lastRead[role];
    }
    return { messages: stored.messages.filter(isMessage), lastRead };
  } catch {
    return emptyStaffThread;
  }
}

/** Returns false when the thread could not be written (storage full or unavailable). */
export function saveStaffThread(key: string, thread: StaffThread) {
  try {
    localStorage.setItem(key, JSON.stringify(thread));
    return true;
  } catch {
    return false;
  }
}

/** Adds a message and marks the thread read for its sender. Blank text leaves the thread unchanged. */
export function appendStaffMessage(thread: StaffThread, sender: StaffRole, text: string, now = new Date()): StaffThread {
  const trimmed = text.trim().slice(0, MAX_STAFF_MESSAGE_LENGTH);
  if (!trimmed) return thread;
  const sentAt = now.toISOString();
  return {
    messages: [...thread.messages, { id: crypto.randomUUID(), sender, text: trimmed, sentAt }],
    lastRead: { ...thread.lastRead, [sender]: sentAt },
  };
}

export function markStaffThreadRead(thread: StaffThread, role: StaffRole, now = new Date()): StaffThread {
  return { ...thread, lastRead: { ...thread.lastRead, [role]: now.toISOString() } };
}

/** Messages from the other person that arrived after `role` last opened the chat. */
export function unreadStaffCount(thread: StaffThread, role: StaffRole) {
  const lastRead = thread.lastRead[role] || '';
  return thread.messages.filter(message => message.sender !== role && message.sentAt > lastRead).length;
}

/** True once the other person has opened the chat since this message was sent. */
export function isStaffMessageSeen(thread: StaffThread, message: StaffMessage) {
  return (thread.lastRead[counterpartRole(message.sender)] || '') >= message.sentAt;
}

/** The person on the other side of the chat, using the name they saved on their own profile. */
export function getStaffCounterpart(role: StaffRole) {
  const other = counterpartRole(role);
  const account = staffAccounts[other];
  let name = account.name;
  try {
    const stored = JSON.parse(localStorage.getItem(`roomies:resident:${account.email}`) || 'null');
    if (typeof stored?.name === 'string' && stored.name.trim()) name = stored.name.trim();
  } catch { /* Fall back to the account name. */ }
  return { role: other, name, roleLabel: staffRoleLabels[other] };
}
