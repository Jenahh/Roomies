import type { ChoreLook } from '../../data/chorePresets';

export type SchedulerMember = { id: string; name: string; days: number[]; capacity: number };
export type ChoreTemplate = { look?: ChoreLook; id: string; title: string; minutes: number; frequency: number };
export type ScheduledTask = { unassigned?: boolean; look?: ChoreLook; id: string; title: string; due: string; completed: boolean; assignee?: string; memberId?: string; templateId?: string; minutes?: number; scheduleWeek?: string; reason?: string };
export type ScheduleDraft = { tasks: ScheduledTask[]; conflicts: string[] };
export function dateKey(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
export function validDate(value: string): boolean { const d = new Date(value+'T12:00:00'); return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(d.getTime()) && dateKey(d) === value; }
export function addDays(value: string, days: number): string { const d = new Date(value+'T12:00:00'); d.setDate(d.getDate()+days); return dateKey(d); }
export function nextMonday(): string { const d = new Date(); d.setDate(d.getDate()+((8-d.getDay())%7 || 7)); return dateKey(d); }
export function validateSettings(members: SchedulerMember[], templates: ChoreTemplate[]): string | null {
 if (!members.length || !templates.length) return 'Add at least one roommate and one recurring chore.';
 if (new Set(members.map(m=>m.name.trim().toLowerCase())).size !== members.length) return 'Roommate names must be unique.';
 if (new Set(members.map(m=>m.id)).size !== members.length || new Set(templates.map(t=>t.id)).size !== templates.length) return 'Duplicate settings IDs. Remove the duplicate and try again.';
 for (const m of members) if (!m.name.trim() || !Number.isInteger(m.capacity) || m.capacity<1 || m.capacity>10080 || !m.days.length || m.days.some(d=>!Number.isInteger(d)||d<0||d>6)) return 'Each roommate needs a name, available day, and weekly limit of 1–10080 minutes.';
 for (const t of templates) if (!t.title.trim() || !Number.isInteger(t.minutes)||t.minutes<1||t.minutes>1440||!Number.isInteger(t.frequency)||t.frequency<1||t.frequency>7) return 'Each chore needs a title, 1–1440 minutes of effort, and 1–7 occurrences per week.';
 return null;
}
// Greedy heuristic: constrained chores first; balance weekly utilization, then
// discourage repeating the same chore from recent history. Never break hard limits.
export function generateSchedule(week: string, members: SchedulerMember[], templates: ChoreTemplate[], history: ScheduledTask[]): ScheduleDraft {
 const error=validateSettings(members,templates); if(error) throw new Error(error);
 if(!validDate(week)||new Date(week+'T12:00:00').getDay()!==1) throw new Error('Choose a Monday as the week start.');
 const end=addDays(week,7); const loads: Record<string,number>={}; const daily: Record<string,number>={};
 for(const m of members) loads[m.id]=history.filter(t=>t.due>=week&&t.due<end&&(t.memberId===m.id||(!t.memberId&&t.assignee===m.name))).reduce((a,t)=>a+(t.minutes??30),0);
 const tasks: ScheduledTask[]=[]; const conflicts: string[]=[];
 const sorted=[...templates].sort((a,b)=>members.filter(m=>m.capacity>=a.minutes).length-members.filter(m=>m.capacity>=b.minutes).length||b.minutes-a.minutes||a.id.localeCompare(b.id));
 for(const template of sorted){ const used=new Set<string>();
  for(let occurrence=0;occurrence<template.frequency;occurrence++){
   const candidates=members.flatMap(m=>Array.from({length:7},(_,day)=>({m,day,due:addDays(week,day)})).filter(c=>m.days.includes(c.day)&&!used.has(c.due)&&loads[m.id]+template.minutes<=m.capacity).map(c=>{
    const recent=history.filter(t=>t.templateId===template.id&&t.due<week&&t.due>=addDays(week,-28)&&(t.memberId===m.id||(!t.memberId&&t.assignee===m.name))).length;
    const target=Math.floor(occurrence*7/template.frequency);
    return {...c,score:(loads[m.id]+template.minutes)/m.capacity+recent*.3+(daily[m.id+':'+c.day]??0)/m.capacity*.2+Math.abs(c.day-target)*.01};
   })).sort((a,b)=>a.score-b.score||a.day-b.day||a.m.id.localeCompare(b.m.id));
   const best=candidates[0];
   if(!best){conflicts.push(`${template.title}: occurrence ${occurrence+1} could not be placed within availability and workload limits. Adjust availability or capacity and generate again.`);continue;}
   used.add(best.due); loads[best.m.id]+=template.minutes; daily[best.m.id+':'+best.day]=(daily[best.m.id+':'+best.day]??0)+template.minutes;
   tasks.push({id:`scheduler:${week}:${template.id}:${occurrence}`,title:template.title,look:template.look,due:best.due,completed:false,assignee:best.m.name,memberId:best.m.id,templateId:template.id,minutes:template.minutes,scheduleWeek:week,reason:'Available that day; balances weekly effort and considers assignments from the previous 4 weeks.'});
  }
 }
 return {tasks:tasks.sort((a,b)=>a.due.localeCompare(b.due)||a.title.localeCompare(b.title)),conflicts};
}
export function validateDraft(tasks: ScheduledTask[], members: SchedulerMember[], existing: ScheduledTask[], week: string): string[] {
 const errors: string[]=[]; const end=addDays(week,7);
 for(const task of tasks){const member=members.find(m=>m.id===task.memberId); if(!member||!validDate(task.due)||task.due<week||task.due>=end||!member.days.includes((new Date(task.due+'T12:00:00').getDay()+6)%7)) errors.push(`${task.title}: choose an available roommate and day within this week.`);}
 for(const member of members){const load=[...existing.filter(t=>t.due>=week&&t.due<end),...tasks].filter(t=>t.memberId===member.id||(!t.memberId&&t.assignee===member.name)).reduce((s,t)=>s+(t.minutes??30),0);if(load>member.capacity)errors.push(`${member.name} exceeds their weekly limit (${load}/${member.capacity} min).`);}
 const keys=tasks.map(t=>t.templateId+':'+t.due);if(new Set(keys).size!==keys.length)errors.push('The same recurring chore cannot occur twice on one day.');
 if(existing.some(t=>t.scheduleWeek===week))errors.push('A schedule has already been published for this week. Choose another week.');
 return errors;
}
export function publishSchedule(existing: ScheduledTask[], tasks: ScheduledTask[], week: string, members: SchedulerMember[]): ScheduledTask[] {
 if(!tasks.length) throw new Error('Generate a schedule first.');
 const errors=validateDraft(tasks,members,existing,week);if(errors.length)throw new Error(errors.join(' '));
 if(tasks.some(t=>existing.some(e=>e.id===t.id)))throw new Error('These assignments already exist.');
 return [...existing,...tasks];
}

export const DEFAULT_CHORE_MINUTES = 30;
const normalizedName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, ' ');

export function weekOf(date: string): string {
  return addDays(date, -(new Date(date + 'T12:00:00').getDay() + 6) % 7);
}

function isAssignedTo(chore: ScheduledTask, member: SchedulerMember, members: SchedulerMember[], residentName: string) {
  if (chore.unassigned) return false;
  if (chore.memberId && members.some(person => person.id === chore.memberId)) return chore.memberId === member.id;
  return normalizedName(chore.assignee || residentName) === normalizedName(member.name);
}

export function weeklyWorkload(week: string, members: SchedulerMember[], chores: ScheduledTask[], residentName: string) {
  const end = addDays(week, 7);
  return members.map(member => ({
    member,
    minutes: chores.filter(chore => chore.due >= week && chore.due < end && isAssignedTo(chore, member, members, residentName)).reduce((sum, chore) => sum + (chore.minutes ?? DEFAULT_CHORE_MINUTES), 0),
  }));
}

export function suggestAssignee(input: { title: string; look?: ChoreLook; due: string; minutes: number }, members: SchedulerMember[], chores: ScheduledTask[], residentName: string) {
  if (!members.length || !validDate(input.due) || !Number.isInteger(input.minutes) || input.minutes < 1 || input.minutes > 1440) return [];
  const week = weekOf(input.due);
  const day = (new Date(input.due + 'T12:00:00').getDay() + 6) % 7;
  const title = normalizedName(input.title);
  const last = chores.filter(chore => !chore.unassigned && chore.due < input.due && chore.due >= addDays(input.due, -28) && (
    normalizedName(chore.title) === title || (input.look && input.look !== 'custom' && input.look === chore.look)
  )).sort((a,b) => b.due.localeCompare(a.due))[0];
  // Rotate exact ties by calendar week; sort stable IDs so roster order does not affect it.
  const order = [...members].sort((a, b) => a.id.localeCompare(b.id));
  const weekIndex = Math.floor(Date.parse(week + 'T00:00:00Z') / 604800000);
  const offset = ((weekIndex % order.length) + order.length) % order.length;
  const rank = (id: string) => (order.findIndex(member => member.id === id) - offset + order.length) % order.length;
  return weeklyWorkload(week, members, chores, residentName)
    .filter(({ member, minutes }) => member.days.includes(day) && minutes + input.minutes <= member.capacity)
    .map(entry => {
      const { member, minutes } = entry;
      const repeated = !!last && isAssignedTo(last, member, members, residentName);
      return { ...entry, repeated, lastAssignee: last?.assignee || (last ? residentName : undefined), projected: minutes + input.minutes, score: (minutes + input.minutes) / member.capacity + (repeated ? 0.2 : 0) };
    })
    .sort((a,b) => a.score - b.score || Number(a.repeated) - Number(b.repeated) || a.minutes - b.minutes || rank(a.member.id) - rank(b.member.id));
}

export function choreDates(first: string, frequency: 'once' | 'weekly' | 'daily', through: string): string[] {
  if (!validDate(first)) return [];
  if (frequency === 'once') return [first];
  if (!validDate(through) || through < first) return [];
  const step = frequency === 'daily' ? 1 : 7;
  const dates: string[] = [];
  for (let date = first; date <= through; date = addDays(date, step)) {
    if (dates.length === 52) return [];
    dates.push(date);
  }
  return dates;
}

export function planChoreOccurrences(
  input: { title: string; look?: ChoreLook; minutes: number; time?: string },
  dates: string[], members: SchedulerMember[], existing: ScheduledTask[], residentName: string,
  firstChoice: string | null, id: string,
) {
  const tasks: (ScheduledTask & { time?: string })[] = [];
  for (const [index, due] of dates.entries()) {
    const candidates = suggestAssignee({ ...input, due }, members, [...existing, ...tasks], residentName);
    const choice = index === 0 && firstChoice !== null ? candidates.find(candidate => candidate.member.id === firstChoice) : candidates[0];
    tasks.push({ ...input, id: `${id}:${index}`, due, completed: false, assignee: choice?.member.name, memberId: choice?.member.id, unassigned: !choice });
  }
  return tasks;
}
