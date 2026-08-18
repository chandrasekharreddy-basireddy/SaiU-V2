import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

// Browser-global shims so timetable-safe.js loads under node
globalThis.window=globalThis;
globalThis.document={querySelector:()=>null,addEventListener:()=>{},querySelectorAll:()=>[]};
globalThis.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
globalThis.fetch=async()=>{throw new Error('no fetch')};

test('timetable-safe re-exports every symbol app.js imports from it',async()=>{
  const safe=await import(path.join(root,'js/timetable-safe.js'));
  const appSrc=read('js/app.js');
  const m=appSrc.match(/import\s+\{([^}]+)\}\s+from\s+'\.\/timetable-safe\.js'/);
  assert.ok(m,'app.js should import from timetable-safe.js');
  const names=m[1].split(',').map(s=>s.trim());
  const missing=names.filter(n=>!(n in safe));
  assert.deepEqual(missing,[],`timetable-safe.js must re-export everything app.js imports; missing: ${missing.join(', ')}`);
  for(const n of names){assert.ok(safe[n]!==undefined,`${n} must not be undefined`)}
});

test('remote.js can resolve every symbol it imports from timetable-safe.js',async()=>{
  const safe=await import(path.join(root,'js/timetable-safe.js'));
  const remoteSrc=read('js/remote.js');
  const m=remoteSrc.match(/import\s+\{([^}]+)\}\s+from\s+'\.\/timetable-safe\.js'/);
  assert.ok(m,'remote.js should import from timetable-safe.js');
  const names=m[1].split(',').map(s=>s.trim());
  const missing=names.filter(n=>!(n in safe));
  assert.deepEqual(missing,[],`timetable-safe.js must re-export everything remote.js imports; missing: ${missing.join(', ')}`);
});
