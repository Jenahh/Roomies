import type { Announcement } from './demoPropertyManager';

const STORAGE_KEY = 'roomies:announcements';

export function loadAnnouncements(): Announcement[] {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(stored)) return [];
    return stored.filter(item =>
      typeof item?.id === 'string' &&
      typeof item?.title === 'string' &&
      typeof item?.message === 'string'
     );
  } catch {
    return [];
  }
}

export function saveAnnouncements(announcements: Announcement[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(announcements));
    return true;
  } catch {
    return false;
  }
}
