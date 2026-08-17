import test from 'node:test';
import assert from 'node:assert/strict';

const storage=new Map();
globalThis.localStorage={getItem:key=>storage.has(key)?storage.get(key):null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key),clear:()=>storage.clear()};
const {load,addTask,awardXp}=await import('../js/store.js');
const {attendanceStatus,setAttendance,addExam,buildStudyPlan}=await import('../js/student.js');
const {progressSnapshot}=await import('../js/gamification.js');
const {parseCsv}=await import('../js/timetable.js');

test('canonical state keeps tasks, XP, attendance, exams and badges connected',()=>{
  storage.clear();
  load();
  addTask('Ship release');
  setAttendance('Algorithms',8,10);
  addExam({name:'AI',date:'2099-01-02'});
  for(let i=0;i<9;i++)addTask(`Task ${i}`);
  awardXp(100,'test-bonus');
  const snapshot=progressSnapshot();
  assert.equal(snapshot.xp,105);
  assert.ok(snapshot.badges.includes('100 XP'));
  assert.ok(snapshot.badges.includes('Task Crusher'));
  const state=load();
  assert.equal(state.attendance.Algorithms.attended,8);
  assert.equal(state.exams.length,1);
  assert.equal(state.tasks.length,10);
});

test('attendance rejects impossible attended totals',()=>{storage.clear();assert.throws(()=>attendanceStatus(11,10),/cannot exceed total/i)});
test('study plans contain only useful positive-duration entries',()=>{storage.clear();const plan=buildStudyPlan([{id:'e',name:'AI',date:'2099-01-02'}],()=>[],7,new Date('2099-01-01T00:00:00'));assert.deepEqual(plan,[])});
test('flat timetable parser preserves section selections',()=>{const csv='day,start,end,course,room,teacher,section\nMonday,09:00,10:00,A,R,T,2\nMonday,10:00,11:00,B,R,T,3';assert.equal(parseCsv(csv,{section:2}).length,1);assert.equal(parseCsv(csv,{section:3})[0].course,'B')});
