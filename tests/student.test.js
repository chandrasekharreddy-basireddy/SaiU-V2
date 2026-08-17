import test from 'node:test';
import assert from 'node:assert/strict';
import {attendanceStatus,setAttendance,attendanceSummary,addExam,upcomingExams,daysUntil,buildStudyPlan,clearAcademics} from '../js/student.js';
import {parseSharedSchedule,bestMeetingSlots} from '../js/social.js';
import {level,progress,title} from '../js/gamification.js';

const store=new Map();
globalThis.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};

test('attendance status calculates risk and required classes',()=>{assert.equal(attendanceStatus(7,10,75).pct,70);assert.equal(attendanceStatus(7,10,75).classesNeeded,2);assert.equal(attendanceStatus(8,10,75).atRisk,false)});
test('attendance records are normalized and sorted by risk',()=>{clearAcademics();setAttendance('Networks',8,10);setAttendance('AI',6,10);const rows=attendanceSummary();assert.equal(rows[0].subject,'AI');assert.equal(rows[0].pct,60)});
test('exam engine validates and sorts upcoming exams',()=>{clearAcademics();const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);const iso=tomorrow.toISOString().slice(0,10);addExam({name:'AI',date:iso,course:'AI'});assert.equal(upcomingExams()[0].name,'AI');assert.equal(daysUntil(iso),1)});
test('study planner creates exam-focused entries',()=>{clearAcademics();const date=new Date();date.setDate(date.getDate()+2);const iso=date.toISOString().slice(0,10);addExam({name:'DBMS',date:iso});const plan=buildStudyPlan(upcomingExams(),()=>[{start:600,end:720},{start:840,end:930}],4);assert.ok(plan.some(x=>x.focus==='DBMS'));assert.ok(plan.some(x=>x.minutes>0))});
test('shared schedule parser and common slots are local-only',()=>{const friend=parseSharedSchedule('Monday,09:00,10:00,Friend Class,B-1\nMonday,12:00,13:00,Lunch,');const mine=[{day:'Monday',start:'10:30',end:'11:30',course:'Mine',room:'A'}];const slots=bestMeetingSlots(mine,friend);assert.ok(slots.some(x=>x.day==='Monday'&&x.duration>=30))});
test('gamification progression is bounded and deterministic',()=>{assert.equal(level(0),1);assert.equal(level(250),3);assert.equal(progress(250),50);assert.equal(title(25),'Campus Legend')});
