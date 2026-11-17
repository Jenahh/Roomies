import { chorePresets } from '../../data/chorePresets';
import { ChoreBadge, ChorePresets } from './ChorePresets';
import { useState, type Dispatch, type SetStateAction } from 'react';
import type { ResidentData } from '../../hooks/useResidentData';
import { addDays, generateSchedule, nextMonday, publishSchedule, validateDraft, validateSettings, type ChoreTemplate, type ScheduledTask, type SchedulerMember } from './scheduler';
import './scheduler.css';
const starterIds = { counters: 'starter-kitchen', trash: 'starter-trash', floors: 'starter-floor' } as const;
const starterChores: ChoreTemplate[] = chorePresets.flatMap(preset => {
  const id = starterIds[preset.look as keyof typeof starterIds];
  return id ? [{ ...preset, id }] : [];
});
const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
export default function SmartScheduler({data,setData,onBack,storageError}:{data:ResidentData;storageError:string;setData:Dispatch<SetStateAction<ResidentData>>;onBack:()=>void}){
 const [tab,setTab]=useState<'quick'|'setup'|'review'>('quick');
 const [members,setMembers]=useState<SchedulerMember[]>(()=>data.scheduler?.members??[{id:crypto.randomUUID(),name:data.name,days:[0,1,2,3,4,5,6],capacity:120}]);
 const [templates,setTemplates]=useState<ChoreTemplate[]>(()=>data.scheduler?.templates??[]);
 const [week,setWeek]=useState(() => { let next = nextMonday(); while (data.chores.some(chore => chore.scheduleWeek === next)) next = addDays(next, 7); return next; }); const [draft,setDraft]=useState<ScheduledTask[]|null>(null); const [conflicts,setConflicts]=useState<string[]>([]); const [message,setMessage]=useState('');
 const [roommateName,setRoommateName]=useState('');
 const [snapshot,setSnapshot]=useState('');
 const fingerprint=JSON.stringify(data.chores);
 const settingsError=validateSettings(members,templates);
 const issues=draft?validateDraft(draft,members,data.chores,week):[];
 const stale=!!draft&&snapshot!==fingerprint;
 function change(){setDraft(null);setConflicts([]);setMessage('');}
 function updateMember(id:string,patch:Partial<SchedulerMember>){change();setMembers(previous=>previous.map(m=>m.id===id?{...m,...patch}:m));}
 function updateTemplate(id:string,patch:Partial<ChoreTemplate>){change();setTemplates(previous=>previous.map(t=>t.id===id?{...t,...patch}:t));}
 function addQuickRoommate() {
  const name = roommateName.trim();
  if (!name) { setMessage('Enter your roommate’s name.'); return; }
  if (members.some(member => member.name.trim().toLowerCase() === name.toLowerCase())) { setMessage('That roommate is already in your plan.'); return; }
  change();
  setMembers(previous => [...previous, { id: crypto.randomUUID(), name, days: [0,1,2,3,4,5,6], capacity: 120 }]);
  setRoommateName('');
 }
 function generate(chores = templates){try{const result=generateSchedule(week,members,chores,data.chores);setTemplates(chores);setDraft(result.tasks);setConflicts(result.conflicts);setSnapshot(fingerprint);setMessage('');setTab('review');}catch(e){setMessage((e as Error).message);}}
 function publish(){if(!draft||conflicts.length||stale)return;try{
  // Validate against current source before updating shared app state.
  publishSchedule(data.chores,draft,week,members);
  setData(previous=>({...previous,chores:publishSchedule(previous.chores,draft,week,members),scheduler:{members,templates}}));
  setDraft(null);setMessage('Schedule published. Open Chores or Calendar to see your assignments.');
 }catch(e){setMessage((e as Error).message);}}
 return <section className="scheduler" aria-label="Smart chore scheduler">
 <button className="sc-back" onClick={onBack}>← Back to chores</button>
 <div className="sc-eyebrow">ROOMIE’S WEEKLY RESET</div><h1>Plan the week</h1><p className="sc-intro">Give everyone a fair share of the chores.</p>
 {storageError&&<p className="sc-warning" role="alert">{storageError}</p>}
 {message&&<p className="sc-message" role="status">{message}</p>}
 {tab==='quick'?<>
 <div className="sc-card sc-quick"><h2>{templates.length ? 'Use your usual chores' : 'Start with a ready-made plan'}</h2>
 <p>{members.length === 1 ? `Planning for ${members[0].name}. Add a roommate to split the work.` : `Planning for ${members.length} roommates: ${members.map(member => member.name).join(', ')}.`}</p>
 <ul className="sc-chore-list">{(templates.length ? templates : starterChores).map(chore => <li key={chore.id}><ChoreBadge look={chore.look} title={chore.title} />{chore.title}</li>)}</ul>
 <p>Week of {new Date(week+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'})}</p>
 <button className="sc-primary" onClick={()=>generate(templates.length ? templates : starterChores)}>Preview my plan</button>
 </div>
 <details className="sc-card"><summary>Add a roommate</summary>
 <form onSubmit={event=>{event.preventDefault();addQuickRoommate();}}>
 <label className="sc-quick-name">Roommate name<input value={roommateName} maxLength={60} onChange={event=>setRoommateName(event.target.value)} /></label>
 <p>Starts with any day and a two-hour weekly limit. You can adjust both in settings.</p>
 <button className="sc-outline" type="submit">Add to plan</button>
 </form></details>
 <button className="sc-outline" onClick={()=>{setMessage('');setTab('setup');}}>Customize chores or roommates</button>
 <p className="sc-hint">Plans are saved in this browser.</p>
 </>:tab==='setup'?<>
 <button className="sc-back" onClick={()=>{setMessage('');setTab('quick');}}>← Quick plan</button>
 <div className="sc-section-heading"><h2>Roommate availability</h2><span>Weekly limits in minutes</span></div>
 <p>Enter each participating roommate’s preferences. Days selected below are available days.</p>
 {members.map(m=><article className="sc-card" key={m.id}><div className="sc-fields"><label>Name<input aria-label={`Roommate name ${m.name}`} value={m.name} maxLength={60} onChange={e=>updateMember(m.id,{name:e.target.value})}/></label><label>Weekly limit (min)<input aria-label={`Weekly limit for ${m.name}`} type="number" min="1" max="10080" value={m.capacity} onChange={e=>updateMember(m.id,{capacity:Number(e.target.value)})}/></label></div><div className="sc-days" role="group" aria-label={`Available days for ${m.name}`}>{days.map((day,i)=><button key={day} aria-label={`${day} available for ${m.name}`} aria-pressed={m.days.includes(i)} onClick={()=>updateMember(m.id,{days:m.days.includes(i)?m.days.filter(d=>d!==i):[...m.days,i]})}>{day}</button>)}</div><button className="sc-remove" onClick={()=>{change();setMembers(members.filter(x=>x.id!==m.id));}}>Remove roommate</button></article>)}
 <button className="sc-outline" onClick={()=>{change();setMembers([...members,{id:crypto.randomUUID(),name:'',days:[0,1,2,3,4,5,6],capacity:120}]);}}>+ Add roommate</button>
 <div className="sc-section-heading"><h2>Recurring chores</h2><span>Separate from one-off chores</span></div>
 <ChorePresets onPick={preset=>{change();setTemplates(previous=>[...previous,{...preset,id:crypto.randomUUID()}]);}} />
 {!templates.length&&<div className="sc-empty">Add your first recurring chore, such as taking out the trash or cleaning the kitchen.</div>}
 {templates.map((t,index)=><article className="sc-card" key={t.id}><label>Chore name<input aria-label={`Recurring chore ${index+1}`} value={t.title} maxLength={100} placeholder="e.g. Clean kitchen" onChange={e=>updateTemplate(t.id,{title:e.target.value})}/></label><div className="sc-fields"><label>Effort (minutes)<input aria-label={`Effort for chore ${index+1}`} type="number" min="1" max="1440" value={t.minutes} onChange={e=>updateTemplate(t.id,{minutes:Number(e.target.value)})}/></label><label>Times per week<select aria-label={`Frequency for chore ${index+1}`} value={t.frequency} onChange={e=>updateTemplate(t.id,{frequency:Number(e.target.value)})}>{[1,2,3,4,5,6,7].map(n=><option key={n} value={n}>{n}</option>)}</select></label></div><button className="sc-remove" onClick={()=>{change();setTemplates(templates.filter(x=>x.id!==t.id));}}>Remove recurring chore</button></article>)}
 <button className="sc-outline" onClick={()=>{change();setTemplates([...templates,{id:crypto.randomUUID(),title:'',minutes:30,frequency:1}]);}}>+ Add recurring chore</button>
 <div className="sc-card"><label>Week starting (Monday)<input aria-label="Week starting Monday" type="date" value={week} onChange={e=>{change();setWeek(e.target.value);}}/></label><p>The scheduler balances effort relative to weekly limits and discourages repeating assignments from the previous four weeks. Existing chores count toward limits; chores without effort count as 30 minutes. This is a best-effort plan, not a guarantee of the optimal schedule.</p></div>
 {settingsError&&<p className="sc-hint">{settingsError}</p>}
 <button className="sc-outline" onClick={()=>{if(settingsError){setMessage(settingsError);return;}setData(p=>({...p,scheduler:{members,templates}}));setMessage('Preferences saved in this browser.');}}>Save preferences</button>
 <button className="sc-primary" onClick={()=>generate()}>Generate weekly schedule →</button>
 </>:<>
 <h2>Your weekly plan</h2><p>{new Date(week+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'})} – {new Date(addDays(week,6)+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'})}</p>
 {!draft?<div className="sc-empty">{message.startsWith('Schedule published')?'Your plan is published. Return to chores to get started.':'Set up your preferences, then generate a schedule to review.'}<button className="sc-outline" onClick={onBack}>See my chores</button></div>:<>
 <div className="sc-totals">{members.map(m=><div key={m.id}><strong>{m.name}</strong><span>{draft.filter(t=>t.memberId===m.id).reduce((sum,t)=>sum+(t.minutes??0),0)} min planned / {m.capacity} min limit</span></div>)}</div>
 {[...conflicts,...issues,...(stale?['Chores changed since this preview. Generate a fresh schedule before publishing.']:[])].length>0&&<div className="sc-warning" role="alert"><strong>Review needed</strong><ul>{[...conflicts,...issues,...(stale?['Chores changed since this preview. Generate a fresh schedule before publishing.']:[])].map((text,i)=><li key={i}>{text}</li>)}</ul></div>}
 {draft.map(task=><article className="sc-card" key={task.id}><div className="sc-section-heading"><h3 className="chore-icon-preview"><ChoreBadge look={task.look} title={task.title} />{task.title}</h3><span>{task.minutes} min</span></div><p className="sc-assignment">{task.assignee} · {new Date(task.due+'T12:00:00').toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}</p><details><summary>Adjust assignment</summary><div className="sc-fields"><label>Assigned to<select aria-label={`Assignee for ${task.title}`} value={task.memberId} onChange={e=>{const m=members.find(x=>x.id===e.target.value)!;setDraft(draft.map(t=>t.id===task.id?{...t,memberId:m.id,assignee:m.name,reason:'Manually adjusted during review.'}:t));}}>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label><label>Day<input aria-label={`Date for ${task.title}`} type="date" min={week} max={addDays(week,6)} value={task.due} onChange={e=>setDraft(draft.map(t=>t.id===task.id?{...t,due:e.target.value,reason:'Manually adjusted during review.'}:t))}/></label></div></details><p className="sc-reason">{task.reason}</p></article>)}
 <button className="sc-outline" onClick={()=>setTab('setup')}>Change plan settings</button>{stale&&<button className="sc-outline" onClick={()=>generate()}>Refresh plan</button>}<button className="sc-primary" disabled={!!conflicts.length||!!issues.length||stale||!draft.length} onClick={publish}>Publish schedule</button><p className="sc-hint">Publishing adds these chores once and preserves existing chores and completion history.</p>
 </>}
 </>}
 </section>;
}
