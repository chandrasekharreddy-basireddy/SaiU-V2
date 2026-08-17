import test from 'node:test';
import assert from 'node:assert/strict';
import {ics} from '../js/calendar.js';
import {parseCsv} from '../js/timetable.js';

test('calendar export creates escaped weekly recurring events',()=>{
  const text=ics([{id:'m1',day:'Monday',start:'09:00',end:'10:00',course:'AI, Ethics; Lab',room:'B\\2',code:'A;1',teacher:'Prof, A'}]);
  assert.match(text,/RRULE:FREQ=WEEKLY;BYDAY=MO/);
  assert.match(text,/SUMMARY:AI\\, Ethics\\; Lab/);
  assert.match(text,/LOCATION:B\\\\2/);
  assert.match(text,/DESCRIPTION:A\\;1 — Prof\\, A/);
  assert.match(text,/DTSTART;TZID=Asia\/Kolkata:/);
});

test('grid parser tolerates room rows separated by blank metadata rows',()=>{
  const csv=[
    'Monday,09:00-10:00,Data Structures @ Faculty A',
    ',,,',
    ',,,',
    ',,Room A-201',
    'Monday,11:00-12:00,Algorithms @ Faculty B',
    ',,Room B-101'
  ].join('\n');
  const parsed=parseCsv(csv,{school:'SCDS'});
  assert.equal(parsed.length,2);
  assert.equal(parsed[0].room,'Room A-201');
  assert.equal(parsed[1].room,'Room B-101');
});
