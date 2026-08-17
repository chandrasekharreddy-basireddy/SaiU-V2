import test from 'node:test';
import assert from 'node:assert/strict';

const storage=new Map();
globalThis.localStorage={getItem:key=>storage.has(key)?storage.get(key):null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key),clear:()=>storage.clear()};
const {loadRemoteTimetable,readCached,clearRemoteCache}=await import('../js/remote.js');

test('offline cache keeps separate selections instead of overwriting them',async()=>{
  storage.clear();
  globalThis.fetch=async()=>({ok:true,text:async()=>['day,start,end,course,room,teacher,section','Monday,09:00,10:00,Deep Learning,A-101,Faculty A,1','Monday,10:00,11:00,Deep Learning,A-102,Faculty A,2'].join('\n')});
  const one=await loadRemoteTimetable({schoolId:'scds',yearId:'scds-3',section:'1'});
  const two=await loadRemoteTimetable({schoolId:'scds',yearId:'scds-3',section:'2'});
  assert.equal(one.source,'live');
  assert.equal(two.source,'live');
  globalThis.fetch=async()=>{throw new Error('offline')};
  assert.equal((await loadRemoteTimetable({schoolId:'scds',yearId:'scds-3',section:'1'})).source,'offline-cache');
  assert.equal((await loadRemoteTimetable({schoolId:'scds',yearId:'scds-3',section:'2'})).source,'offline-cache');
  assert.equal(readCached({schoolId:'scds',yearId:'scds-3',section:'1'}).timetable[0].section,1);
  assert.equal(readCached({schoolId:'scds',yearId:'scds-3',section:'2'}).timetable[0].section,2);
  clearRemoteCache({schoolId:'scds',yearId:'scds-3',section:'1'});
  assert.equal(readCached({schoolId:'scds',yearId:'scds-3',section:'1'}),null);
  assert.ok(readCached({schoolId:'scds',yearId:'scds-3',section:'2'}));
});
