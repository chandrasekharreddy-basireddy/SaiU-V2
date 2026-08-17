import test from 'node:test';
import assert from 'node:assert/strict';

const storage=new Map();
globalThis.localStorage={getItem:key=>storage.has(key)?storage.get(key):null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key),clear:()=>storage.clear()};
const {remindBeforeClass,reminders,clearAllReminders}=await import('../js/notifications.js');

test('class reminders persist independently across reload semantics',()=>{
  storage.clear();
  const now=new Date(2026,7,17,21,0);
  const a={id:'class-a',day:'Tuesday',start:'09:00',end:'10:00',course:'AI',room:'B-101'};
  const b={id:'class-b',day:'Wednesday',start:'11:00',end:'12:00',course:'Networks',room:'B-102'};
  const ka=remindBeforeClass(a,10,now);
  const kb=remindBeforeClass(b,20,now);
  assert.ok(ka&&kb&&ka!==kb);
  const saved=reminders();
  assert.equal(saved.length,2);
  assert.ok(saved.some(x=>x.key===ka));
  assert.ok(saved.some(x=>x.key===kb));
  clearAllReminders();
  assert.equal(reminders().length,0);
});
