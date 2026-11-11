import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const code=ts.transpileModule(readFileSync('app/features/scheduler/scheduler.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {generateSchedule,validateDraft,publishSchedule,addDays,suggestAssignee,weeklyWorkload,weekOf,choreDates,planChoreOccurrences}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const week='2026-11-09';
const members=[{id:'a',name:'Alex',days:[0,1,2,3,4,5,6],capacity:60},{id:'b',name:'Sam',days:[0,1,2,3,4,5,6],capacity:60}];
const templates=[{id:'k',title:'Kitchen',minutes:30,frequency:2},{id:'t',title:'Trash',minutes:15,frequency:2}];
let checks=0;function test(name,fn){fn();checks++;console.log('PASS '+name);}
test('balanced feasible weekly schedule',()=>{const d=generateSchedule(week,members,templates,[]);assert.equal(d.tasks.length,4);assert.deepEqual(d.conflicts,[]);assert.deepEqual(validateDraft(d.tasks,members,[],week),[]);for(const m of members)assert.ok(d.tasks.filter(t=>t.memberId===m.id).reduce((s,t)=>s+t.minutes,0)<=m.capacity);assert.deepEqual(generateSchedule(week,members,templates,[]),d);});
test('respects available days and separates recurring occurrences',()=>{const d=generateSchedule(week,[{...members[0],days:[2,5],capacity:120}],templates,[]);assert.equal(d.tasks.length,4);assert.ok(d.tasks.every(t=>[2,5].includes((new Date(t.due+'T12:00:00').getDay()+6)%7)));});
test('reports impossible schedule without exceeding capacity',()=>{const d=generateSchedule(week,[{...members[0],days:[0],capacity:15}],templates,[]);assert.ok(d.conflicts.length);assert.ok(d.tasks.reduce((s,t)=>s+t.minutes,0)<=15);});
test('rotates repeated chore away from recent assignee',()=>{const d=generateSchedule(week,members,[templates[0]&&{...templates[0],frequency:1}],[{id:'old',title:'Kitchen',templateId:'k',memberId:'a',assignee:'Alex',due:'2026-11-02',completed:true,minutes:30}]);assert.equal(d.tasks[0].memberId,'b');});
test('counts existing manual chores against capacity',()=>{const history=[{id:'manual',title:'Manual',assignee:'Alex',due:week,completed:false,minutes:60}];const d=generateSchedule(week,members,[{...templates[0],frequency:1}],history);assert.equal(d.tasks[0].memberId,'b');});
test('rejects manual edits on unavailable days',()=>{const ms=[{...members[0],days:[0]}];const d=generateSchedule(week,ms,[{...templates[0],frequency:1}],[]);assert.ok(validateDraft([{...d.tasks[0],due:addDays(week,1)}],ms,[],week).length);});
test('publishes once and preserves history',()=>{const d=generateSchedule(week,members,templates,[]);const old={id:'old',title:'Old task',due:'2026-11-01',completed:true};const result=publishSchedule([old],d.tasks,week,members);assert.equal(result[0],old);assert.throws(()=>publishSchedule(result,d.tasks,week,members),/already been published/);});
test('rejects invalid dates, empty settings, duplicate names',()=>{assert.throws(()=>generateSchedule('2026-02-30',members,templates,[]));assert.throws(()=>generateSchedule(week,[],templates,[]));assert.throws(()=>generateSchedule(week,[members[0],{...members[1],name:'alex'}],templates,[]));});
test('rejects draft overload and duplicate recurring day',()=>{const d=generateSchedule(week,members,templates,[]);const tasks=d.tasks.map(t=>({...t,memberId:'a',assignee:'Alex',due:week}));assert.ok(validateDraft(tasks,members,[],week).some(e=>e.includes('exceeds')));assert.ok(validateDraft(tasks,members,[],week).some(e=>e.includes('twice')));});
test('preserves the selected chore look through publishing',()=>{const draft=generateSchedule(week,members,[{...templates[0],look:'counters'}],[]);const result=publishSchedule([],draft.tasks,week,members);assert.equal(result.length,2);assert.ok(result.every(task=>task.look==='counters'));});
test('quick assignment accounts for current workload and prior rotation',()=>{
 const input={title:'Kitchen',due:week,minutes:15};
 const old={id:'old',title:'Kitchen',assignee:'Alex',due:addDays(week,-7),completed:true};
 assert.equal(suggestAssignee(input,members,[old],'Alex')[0].member.id,'b');
 const busy={id:'busy',title:'Laundry',assignee:'Sam',due:week,completed:true,minutes:35};
 assert.equal(suggestAssignee(input,members,[old,busy],'Alex')[0].member.id,'a');
});
test('quick assignment excludes unavailable and overloaded roommates',()=>{
 const input={title:'Kitchen',due:week,minutes:30};
 const busy={id:'busy',title:'Laundry',assignee:'Sam',due:week,completed:false,minutes:40};
 assert.deepEqual(suggestAssignee(input,[{...members[0],days:[1]},members[1]],[busy],'Alex'),[]);
});
test('weekly workload includes legacy chores but excludes unassigned and out-of-week work',()=>{
 const chore={id:'base',title:'Kitchen',due:week,completed:false};
 assert.equal(weekOf(addDays(week,6)),week);
 assert.deepEqual(weeklyWorkload(week,members,[chore,{...chore,id:'unassigned',unassigned:true},{...chore,id:'later',due:addDays(week,7)}],'Alex').map(row=>row.minutes),[30,0]);
});
test('repeat uses an inclusive end date and caps series size',()=>{
 assert.deepEqual(choreDates(week,'once',''),[week]);
 assert.deepEqual(choreDates(week,'weekly',addDays(week,20)),[week,addDays(week,7),addDays(week,14)]);
 assert.equal(choreDates(week,'daily',addDays(week,51)).length,52);
 assert.deepEqual(choreDates(week,'daily',addDays(week,52)),[]);
 assert.deepEqual(choreDates(week,'weekly',addDays(week,-1)),[]);
});
test('repeat rotates eligible roommates and keeps each occurrence independent',()=>{
 const dates=choreDates(week,'weekly',addDays(week,21));
 const tasks=planChoreOccurrences({title:'Kitchen',minutes:30,look:'counters'},dates,members,[],'Alex','b','series');
 assert.deepEqual(tasks.map(task=>task.memberId),['b','a','b','a']);
 assert.equal(new Set(tasks.map(task=>task.id)).size,4);
 assert.ok(tasks.every(task=>!task.completed&&task.look==='counters'));
});
test('repeat leaves occurrences unassigned when they exceed weekly capacity',()=>{
 const dates=choreDates(week,'daily',addDays(week,2));
 const tasks=planChoreOccurrences({title:'Kitchen',minutes:40},dates,[members[0]],[],'Alex',null,'series');
 assert.deepEqual(tasks.map(task=>task.unassigned),[false,true,true]);
});
test('preassigned roster counts older chores saved with a previous member ID',()=>{
 const old={id:'old',title:'Kitchen',memberId:'previous-local-id',assignee:'Alex',due:week,completed:true,minutes:20};
 assert.deepEqual(weeklyWorkload(week,members,[old],'Alex').map(row=>row.minutes),[20,0]);
});
test('exact workload ties rotate across weeks regardless of roster order',()=>{
 const suggest=(due,roster)=>suggestAssignee({title:'Kitchen',due,minutes:15},roster,[],'Alex')[0].member.id;
 assert.equal(suggest(week,members),suggest(week,[...members].reverse()));
 assert.notEqual(suggest(week,members),suggest(addDays(week,7),members));
 assert.equal(suggest(week,members),suggest(addDays(week,14),members));
});
console.log(`${checks} scheduler checks passed.`);
