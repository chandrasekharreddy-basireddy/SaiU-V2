import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
function has(source,needle){assert.ok(source.includes(needle),`Expected ${needle}`)}

test('student-os exports init function instead of using MutationObserver',()=>{
 const src=read('js/student-os.js');
 assert.ok(!src.includes('MutationObserver'),'MutationObserver should be removed');
 has(src,'export function init()');
});

test('bootstrap exposes StudentOS init on window and has modal focus trap',()=>{
 const src=read('js/bootstrap.js');
 has(src,'window.SaiUStudentOS');
 has(src,"import{init as initStudentOS}");
 has(src,'modal.addEventListener');
 has(src,"e.key==='Tab'");
});

test('app.js calls StudentOS init after rendering more view',()=>{
 const src=read('js/app.js');
 has(src,'window.SaiUStudentOS.init()');
});

test('app.js has loading skeleton in renderTimetable',()=>{
 const src=read('js/app.js');
 has(src,'skeleton-bar');
 has(src,'if(loading)');
});

test('app.js surfaces source errors to user',()=>{
 const src=read('js/app.js');
 has(src,'sourceError');
 has(src,'source-error');
 has(src,'retrySync');
});

test('app.js has AI retry and clear endpoint buttons',()=>{
 const src=read('js/app.js');
 has(src,'aiRetry');
 has(src,'aiClearEndpoint');
});

test('catalog has fallback sections so filter works on first load',()=>{
 const src=read('js/catalog.js');
 assert.ok(!src.includes("sections:[]"),'All years should have fallback sections');
});

test('styles.css includes skeleton and modal styles',()=>{
 const css=read('styles.css');
 has(css,'.skeleton');
 has(css,'@keyframes shimmer');
 has(css,'.modal');
 has(css,'.source-error');
});

test('no inline styles remain in app.js',()=>{
 const src=read('js/app.js');
 assert.ok(!/\bstyle\s*=\s*["']/.test(src),'app.js should not contain inline style attributes');
});