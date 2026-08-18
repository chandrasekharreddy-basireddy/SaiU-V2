import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

function has(content,needle){assert.ok(content.includes(needle),`Expected "${needle}"`)}

test('loading skeleton bars exist in app.js and styles.css',()=>{
  const app=read('js/app.js');
  const css=read('styles.css');
  has(app,'skeleton-bar');
  has(css,'.skeleton-bar');
  has(css,'@keyframes shimmer');
});

test('source error banner with retry button exists in app.js',()=>{
  const app=read('js/app.js');
  const css=read('styles.css');
  has(app,'sourceError');
  has(app,'source-error');
  has(app,'retrySync');
  has(css,'.source-error');
});

test('AI retry and clear endpoint controls exist in app.js',()=>{
  const app=read('js/app.js');
  has(app,'aiRetryRow');
  has(app,'aiRetry');
  has(app,'aiClearEndpoint');
});

test('StudentOS exposes init() and app.js calls it on More view',()=>{
  const app=read('js/app.js');
  const sos=read('js/student-os.js');
  has(app,'SaiUStudentOS');
  has(sos,'window.SaiUStudentOS={init}');
  has(sos,'function init()');
  assert.doesNotMatch(sos,/new MutationObserver/,'MutationObserver should be removed');
});

test('service worker cache version bumped past v6',()=>{
  const sw=read('sw.js');
  assert.match(sw,/saiu-v2-v[78]/);
  assert.doesNotMatch(sw,/saiu-v2-v6/);
});

test('hidden utility class exists in styles.css',()=>{
  const css=read('styles.css');
  has(css,'.hidden');
});
