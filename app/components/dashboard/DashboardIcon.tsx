const iconPaths = {
  group: 'M16 21v-2a4 4 0 0 0-8 0v2M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6M5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5M19 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5M2 19v-3a3 3 0 0 1 4-2.8M22 19v-3a3 3 0 0 0-4-2.8',
  star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z',
  flame: 'M12 3c2 5-2 5 1 9 2-1 3-3 3-5 5 5 5 14-4 14S3 12 7 8c0 4 2 5 3 5-2-5 2-6 2-10Z',
  sprout: 'M12 22V11M12 16C5 17 3 13 3 8c6 0 9 3 9 8ZM12 11c0-6 4-9 9-9 0 6-3 9-9 9M6 22h12',
  dashboard: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  wrench: 'm14 6 4-4a6 6 0 0 0-8 8L3 17a3 3 0 0 0 4 4l7-7a6 6 0 0 0 8-8l-4 4-4-4Z',
  announcement: 'M3 9h5l12-5v16L8 15H3V9ZM8 15l2 6H6l-2-6M8 9v6',
  properties: 'M3 21h18M5 21V7h5V3h9v18M10 7v14M13 7h3M13 11h3M13 15h3M7 11h.01M7 15h.01',
  residents: 'M16 21v-2a5 5 0 0 0-10 0v2M11 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 21v-2a6 6 0 0 0-2-4M17 4a4 4 0 0 1 0 8',
  concerns: 'M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-4 5 1 9 8 15 7-6 12-10 8-15ZM8 11l3-3 5 5M7 16l3 3M10 13l4 4',
  messages: 'M21 11.5a9 9 0 0 1-9 9H3l1.5-5A9 9 0 1 1 21 11.5Z',
  home: 'M3 10 12 3l9 7M5 9v12h14V9M9 21v-8h6v8',
  chores: 'M9 12l2 2 4-4M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  expenses: 'M20 8V4H4v16h16v-8h-6V8h7v4M17 10h.01',
  calendar: 'M4 5h16v16H4zM8 2v6M16 2v6M4 10h16M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01',
  profile: 'M20 21v-2a7 7 0 0 0-14 0v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
  bell: 'M6 8a6 6 0 0 1 12 0c0 8 3 8 3 10H3c0-2 3-2 3-10M10 22h4',
  tree: 'M12 22V10M12 16C3 17 2 11 3 8c6-1 10 2 9 8ZM12 11c-1-7 3-10 8-9 1 6-2 10-8 9M5 22h14',
  trash: 'M3 5h18M9 5V2h6v3M6 5l1 17h10l1-17M10 9v9M14 9v9',
  dinner: 'M3 20 9 3c7 2 11 8 12 15L3 20ZM7 15l11-1M11 9h.01M10 17h.01',
  add: 'M12 4v16M4 12h16',
  split: 'M5 3h14v18l-3-2-4 2-4-2-3 2V3ZM15 7H10a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H9M12 5v12',
} as const;
export type IconName = keyof typeof iconPaths;

export default function DashboardIcon({ name, color = '#555B69', size = 20 }: { name: IconName; color?: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPaths[name]} /></svg>;
}

