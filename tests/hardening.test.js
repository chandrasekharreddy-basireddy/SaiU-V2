import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SAMPLE,
  toMinutes,
  fmtMinutes,
  duration,
  conflicts,
  freePeriods,
  commonFree,
  parseTimeRange,
  parseCsv,
  currentClass,
  nextClass,
  timetableStats
} from '../js/timetable.js';
import {ics} from '../js/calendar.js';

test('time conversion preserves valid 24-hour boundaries', () => {
  assert.equal(toMinutes('00:00'), 0);
  assert.equal(toMinutes('23:59'), 1439);
  assert.ok(Number.isNaN(toMinutes('24:00')));
  assert.ok(Number.isNaN(toMinutes('12:60')));
  assert.equal(fmtMinutes(0), '00:00');
  assert.equal(fmtMinutes(1439), '23:59');
  assert.equal(fmtMinutes(1440), '00:00');
  assert.equal(duration({start:'09:15', end:'10:45'}), 90);
  assert.equal(duration({start:'bad', end:'10:45'}), 0);
});

test('time parser handles common academic timetable formats and rejects invalid ranges', () => {
  assert.deepEqual(parseTimeRange('9:00 AM - 10:30 AM'), {start:'09:00', end:'10:30'});
  assert.deepEqual(parseTimeRange('2 PM to 3:30 PM'), {start:'14:00', end:'15:30'});
  assert.deepEqual(parseTimeRange('09:00-10:00'), {start:'09:00', end:'10:00'});
  assert.equal(parseTimeRange('25:00-26:00'), null);
  assert.equal(parseTimeRange('9:61 AM - 10:30 AM'), null);
  assert.equal(parseTimeRange('10:00-09:00'), null);
  assert.equal(parseTimeRange('10 PM-11 PM'), null);
  assert.equal(parseTimeRange('not a time'), null);
});

test('conflict engine detects only overlapping classes', () => {
  const items = [
    {day:'Monday', start:'09:00', end:'10:00', course:'A'},
    {day:'Monday', start:'10:00', end:'11:00', course:'B'},
    {day:'Monday', start:'10:30', end:'11:30', course:'C'}
  ];
  const found = conflicts(items);
  assert.equal(found.length, 1);
  assert.deepEqual(found[0].map(x => x.course), ['B','C']);
});

test('free-time engine never returns inverted or zero-length slots', () => {
  const slots = freePeriods(SAMPLE, 'Monday', 8 * 60, 18 * 60);
  assert.ok(slots.length > 0);
  for (const slot of slots) {
    assert.ok(slot.start < slot.end);
    assert.ok(slot.start >= 8 * 60);
    assert.ok(slot.end <= 18 * 60);
  }
  assert.deepEqual(freePeriods(SAMPLE,'Monday',18*60,20*60), [{start:1080,end:1200}]);
});

test('common-free engine returns true intersections', () => {
  const a = [{day:'Monday',start:'09:00',end:'10:00',course:'A'}];
  const b = [{day:'Monday',start:'11:00',end:'12:00',course:'B'}];
  const common = commonFree(a, b, 'Monday', 8 * 60, 13 * 60);
  assert.deepEqual(common, [
    {start:480,end:540,duration:60},
    {start:600,end:660,duration:60},
    {start:720,end:780,duration:60}
  ]);
});

test('CSV parser rejects incomplete rows without crashing', () => {
  const csv = [
    'day,start,end,course,room,teacher,section',
    'Monday,09:00,10:00,Algorithms,A-101,Faculty,3',
    'BadDay,09:00,10:00,Ignored,A-102,Faculty,3',
    ',,,,,',
  ].join('\n');
  const parsed = parseCsv(csv, {school:'SCDS', section:3});
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].course, 'Algorithms');
});

test('CSV parser handles quoted commas, BOM headers, normalization and section filtering', () => {
  const csv = [
    '\uFEFFday,start,end,course,room,teacher,section',
    ' tuesday ,09:00,10:00,"AI, Ethics",B-101,Faculty A,2',
    'Tuesday,10:00,11:00,"AI, Ethics",B-102,Faculty B,3'
  ].join('\n');
  const parsed = parseCsv(csv, {section:3});
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].course, 'AI, Ethics');
  assert.equal(parsed[0].section, 3);
  assert.equal(parsed[0].day, 'Tuesday');
});

test('iCalendar escapes special text and emits CRLF records', () => {
  const text=ics([{id:'x,1',day:'Monday',start:'09:00',end:'10:00',course:'AI, Ethics; Intro',room:'B\\201, Lab',code:'AI;301',teacher:'Prof, A'}]);
  assert.match(text,/SUMMARY:AI\\, Ethics\\; Intro/);
  assert.match(text,/LOCATION:B\\\\201\\, Lab/);
  assert.match(text,/DESCRIPTION:AI\\;301 \\x2014 Prof\\, A/);
  assert.ok(text.endsWith('\r\n'));
  assert.match(text,/BEGIN:VEVENT\r\n/);
});

test('current and next class are deterministic for supplied clock values', () => {
  const now = new Date(2026, 7, 17, 9, 30);
  const current = currentClass(SAMPLE, now);
  assert.equal(current?.course, 'Artificial Intelligence');
  const next = nextClass(SAMPLE, now);
  assert.equal(next?.course, 'Database Systems');
});

test('timetable statistics remain internally consistent', () => {
  const stats = timetableStats(SAMPLE);
  assert.equal(stats.classes, SAMPLE.length);
  assert.equal(stats.days, 5);
  assert.equal(stats.conflicts, 0);
  assert.ok(stats.minutes > 0);
});