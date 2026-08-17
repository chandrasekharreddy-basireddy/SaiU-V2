import test from 'node:test';import assert from 'node:assert/strict';import {SAMPLE,toMinutes,freePeriods,conflicts,commonFree,parseCsv} from '../js/timetable.js';
test('time conversion',()=>assert.equal(toMinutes('09:30'),570));
test('sample has no conflicts',()=>assert.equal(conflicts(SAMPLE).length,0));
test('free periods include lunch gap',()=>{const p=freePeriods(SAMPLE,'Monday');assert.ok(p.some(x=>x.start===750&&x.end===840))});
test('common free time intersects two schedules',()=>{const a=[{day:'Monday',start:'09:00',end:'10:00',course:'A'}];const b=[{day:'Monday',start:'11:00',end:'12:00',course:'B'}];assert.ok(commonFree(a,b,'Monday').some(x=>x.start===600&&x.end===660))});
test('CSV parser normalizes basic rows',()=>{const rows=parseCsv('day,start,end,course\nMonday,09:00,10:00,AI');assert.equal(rows[0].course,'AI');assert.equal(rows[0].day,'Monday')});
