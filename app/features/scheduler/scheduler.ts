export type SchedulerMember = { id: string; name: string; days: number[]; capacity: number };
export type ChoreTemplate = { id: string; title: string; minutes: number; frequency: number };
export type ScheduledTask = { id: string; title: string; due: string; completed: boolean; assignee?: string; memberId?: string; templateId?: string; minutes?: number; scheduleWeek?: string; reason?: string };
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
   tasks.push({id:`scheduler:${week}:${template.id}:${occurrence}`,title:template.title,due:best.due,completed:false,assignee:best.m.name,memberId:best.m.id,templateId:template.id,minutes:template.minutes,scheduleWeek:week,reason:'Available that day; balances weekly effort and considers assignments from the previous 4 weeks.'});
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
