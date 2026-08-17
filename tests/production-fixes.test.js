import test from 'node:test';
import assert from 'node:assert/strict';
import {parseTimeRange} from '../js/timetable.js';
import {ics} from '../js/calendar.js';
import {setAttendance,attendanceStatus,buildStudyPlan,clearAcademics} from '../js/student.js';
import {load,save,addTask,toggleTask} from '../js/store.js';
import {awardXp,badges} from '../js/gamification.js';
import {cacheKey,readCached,clearRemoteCache} from '../js/remote.js';
import {remindBeforeClass,clearReminderStore} from '../js/notifications.js';

class LocalStorageMock{
  constructor(){this.map=new Map()}
  getItem(k){return this.map.has(k)?this.map.get(k):null}
  setItem(k,v){this.map.set(String(k),String(v))}
  removeItem(k){this.map.delete(String(k))}
  clear(){this.map.clear()}
  key(i){return [...this.map.keys()][i]??null}
  get length(){return this.map.size}
}

globalThis.localStorage=new LocalStorageMock();
if(!globalThis.navigator)globalThis.navigator={};

test.beforeEach(()=>{localStorage.clear()});
test.afterEach(()=>{clearRemoteCache();clearReminderStore();clearAcademics()});

test('XP, tasks and badges share one state model',()=>{
  save({tasks:[],xp:0,streak:0});
  addTask('A');addTask('B');
  assert.equal(load().xp,0);
  awardXp(5,'task-add');
  assert.equal(load().xp,5);
  awardXp(5,'task-add');
  assert.equal(load().xp,5);
  for(let i=0;i<10;i++){addTask(`Task ${i}`);toggleTask(load().tasks.find(t=>!t.done).id)}
  const state=load();
  assert.equal(state.tasks.filter(t=>t.done).length,10);
  assert.ok(badges(state).includes('Task Crusher'));
});

test('attendance rejects impossible and zero-total records',()=>{
  assert.throws(()=>setAttendance('DB',120,100),/Attendance must have/);
  assert.throws(()=>setAttendance('DB',1,0),/Attendance must have/);
  assert.deepEqual(attendanceStatus(8,10,75),{attended:8,total:10,pct:80,atRisk:false,classesNeeded:0,target:75});
});

test('study plan omits zero-minute days',()=>{
  const plan=buildStudyPlan([{id:'e',name:'Exam',date:'2026-08-18'}],()=>[],3,new Date(2026,7,17));
  assert.deepEqual(plan,[]);
});

test('timetable parser rejects backwards ranges instead of normalizing them',()=>{
  assert.equal(parseTimeRange('17:00-09:00'),null);
  assert.equal(parseTimeRange('11:00 AM-12:00 PM')?.end,'12:00');
});

test('offline cache is isolated per timetable selection',()=>{
  const a={schoolId:'scds',yearId:'scds-3',section:'1'};
  const b={schoolId:'scds',yearId:'scds-3',section:'2'};
  const timetable=[{day:'Monday',start:'09:00',end:'10:00',course:'Algorithms'}];
  localStorage.setItem(cacheKey(a),JSON.stringify({selection:a,timetable,savedAt:1}));
  assert.ok(readCached(a));
  assert.equal(readCached(b),null);
  assert.notEqual(cacheKey(a),cacheKey(b));
});

test('reminders persist a unique schedule record',()=>{
  const now=new Date(2026,7,17,8,0);
  remindBeforeClass({id:'class-1',day:'Monday',start:'09:00',end:'10:00',course:'Algorithms',room:'A-101'},10,now);
  remindBeforeClass({id:'class-1',day:'Monday',start:'09:00',end:'10:00',course:'Algorithms',room:'A-101'},10,now);
  const records=JSON.parse(localStorage.getItem('saiu-v2-reminders'));
  assert.equal(records.length,1);
  assert.equal(records[0].course,'Algorithms');
});

test('ICS output escapes special characters and creates weekly recurrence',()=>{
  const text=ics([{id:'x',day:'Monday',start:'09:00',end:'10:00',course:'AI, Ethics; Lab',room:'B\\2',code:'A;1',teacher:'Prof, A'}]);
  assert.match(text,/RRULE:FREQ=WEEKLY;BYDAY=MO/);
  assert.match(text,/SUMMARY:AI\\, Ethics\\; Lab/);
  assert.match(text,/LOCATION:B\\\\2/);
  assert.match(text,/DESCRIPTION:A\\;1 — Prof\\, A/);
  assert.match(text,/END:VCALENDAR/);
});
