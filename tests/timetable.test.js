import test from 'node:test';import assert from 'node:assert/strict';import {SAMPLE,toMinutes,freePeriods,conflicts,commonFree,parseCsv,parseTimeRange,timetableStats} from '../js/timetable.js';
test('time conversion',()=>assert.equal(toMinutes('09:30'),570));
test('time range parser handles 12-hour input',()=>assert.deepEqual(parseTimeRange('9:30 AM - 11:00 AM'),{start:'09:30',end:'11:00'}));
test('sample has no conflicts',()=>assert.equal(conflicts(SAMPLE).length,0));
test('free periods include lunch gap',()=>{const p=freePeriods(SAMPLE,'Monday');assert.ok(p.some(x=>x.start===750&&x.end===840))});
test('common free time intersects two schedules',()=>{const a=[{day:'Monday',start:'09:00',end:'10:00',course:'A'}];const b=[{day:'Monday',start:'11:00',end:'12:00',course:'B'}];assert.ok(commonFree(a,b,'Monday').some(x=>x.start===600&&x.end===660))});
test('CSV parser handles flat rows',()=>{const rows=parseCsv('day,start,end,course\nMonday,09:00,10:00,AI');assert.equal(rows[0].course,'AI');assert.equal(rows[0].day,'Monday')});
test('CSV parser handles grid rows and section filters',()=>{const csv='Monday,09:00-10:00,Deep Learning (Sec 1),Deep Learning (Sec 2)\n,,Room A,Room B\n';const rows=parseCsv(csv,{mandatory:['Deep Learning'],school:'SCDS',section:2});assert.equal(rows.length,1);assert.equal(rows[0].section,2)});
test('stats are deterministic',()=>{const s=timetableStats(SAMPLE);assert.equal(s.classes,10);assert.equal(s.days,5);assert.equal(s.conflicts,0);assert.ok(s.minutes>0)});
