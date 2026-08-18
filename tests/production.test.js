import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

function has(html,needle){assert.ok(html.includes(needle),`Expected ${needle}`)}

test('security headers and no inline executable handlers', ()=>{
 const html=read('index.html');
 has(html,'Content-Security-Policy');
 assert.match(html,/style-src 'self'/);
 assert.doesNotMatch(html,/style-src[^;]*'unsafe-inline'/i);
 assert.doesNotMatch(html,/\son[a-z]+\s*=\s*['"]/i);
 assert.doesNotMatch(html,/javascript:/i);
 has(html,'icons/icon.svg');
});

test('manifest references an existing production icon',()=>{
 const manifest=JSON.parse(read('manifest.json'));
 assert.ok(Array.isArray(manifest.icons)&&manifest.icons.length>0);
 for(const icon of manifest.icons)assert.ok(fs.existsSync(path.join(root,icon.src.replace(/^\.\/ /,''))),icon.src);
});

test('offline shell contains every browser module imported by bootstrap', ()=>{
 const sw=read('sw.js');
 has(sw,'./js/bootstrap.js');
 has(sw,'./js/student-os.js');
 has(sw,'./icons/icon.svg');
 assert.match(sw,/saiu-v2-v8/);
});

test('performance budgets stay bounded',()=>{
 const html=fs.statSync(path.join(root,'index.html')).size;
 const css=fs.statSync(path.join(root,'styles.css')).size;
 assert.ok(html<12000,`index.html too large: ${html}`);
 assert.ok(css<16000,`styles.css too large: ${css}`);
});

test('HTML accessibility fundamentals exist',()=>{
 const html=read('index.html');
 has(html,'lang="en"');
 has(html,'aria-label="Primary navigation"');
 has(html,'role="status"');
 has(html,'tabindex="-1"');
});

test('live timetable integration points at the configured published source', ()=>{
 const catalog=read('js/catalog.js');
 const remote=read('js/remote.js');
 assert.match(catalog,/docs\.google\.com\/spreadsheets\/d\//);
 assert.match(catalog,/1Jk3KCLqHHzi-jxigIcPpcXZestcxb8Y0BeQLjhiezb8/);
 assert.match(remote,/cache:\'no-store\'/);
 assert.match(remote,/offline-cache/);
 assert.match(remote,/No classes matched this selection/);
});