import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root=process.cwd();
const fail=[];
const required=['index.html','manifest.json','sw.js','styles.css','README.md','SECURITY.md'];
for(const file of required)if(!fs.existsSync(path.join(root,file)))fail.push(`Missing required file: ${file}`);

function walk(dir){const out=[];for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules'].includes(entry.name))continue;const p=path.join(dir,entry.name);if(entry.isDirectory())out.push(...walk(p));else out.push(p)}return out}
const files=walk(root);
const jsFiles=files.filter(f=>f.endsWith('.js')||f.endsWith('.mjs'));
for(const file of jsFiles){const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0)fail.push(`Syntax error: ${path.relative(root,file)}\n${r.stderr.trim()}`)}

try{
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
  for(const key of ['name','short_name','start_url','display'])if(!manifest[key])fail.push(`Manifest missing ${key}`);
  if(!Array.isArray(manifest.icons)||manifest.icons.length===0)fail.push('Manifest has no icons');
  for(const icon of manifest.icons||[]){if(!icon.src)fail.push('Manifest icon missing src');else if(!fs.existsSync(path.join(root,String(icon.src).replace(/^\.\//,''))))fail.push(`Manifest icon missing: ${icon.src}`)}
}catch(e){fail.push(`Invalid manifest.json: ${e.message}`)}

const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const ref of [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m=>m[1])){
  if(/^(https?:|data:|#|mailto:|javascript:)/i.test(ref))continue;
  const clean=ref.split(/[?#]/)[0].replace(/^\//,'');
  if(clean&&!fs.existsSync(path.join(root,clean)))fail.push(`Broken local HTML reference: ${ref}`);
}
if(/style-src[^;]*'unsafe-inline'/i.test(html))fail.push('CSP permits unsafe-inline styles');
if(/\son[a-z]+\s*=\s*["']/i.test(html))fail.push('Inline event handler found in HTML');
if(/javascript:/i.test(html))fail.push('javascript: URL found in HTML');

const source=files.filter(f=>/\.(?:js|mjs|html|css|json|yml|yaml|md)$/i.test(f)).map(f=>fs.readFileSync(f,'utf8')).join('\n');
const forbidden=[/sk-[A-Za-z0-9_-]{20,}/,/AIza[0-9A-Za-z_-]{20,}/,/ghp_[A-Za-z0-9]{30,}/,/github_pat_[A-Za-z0-9_]{20,}/];
for(const re of forbidden)if(re.test(source))fail.push(`Possible hard-coded secret detected: ${re}`);

if(fail.length){console.error(`Production validation failed (${fail.length} issue${fail.length===1?'':'s'}):`);for(const item of fail)console.error(`\n- ${item}`);process.exit(1)}
console.log(`Production validation passed: ${jsFiles.length} JavaScript modules checked, required assets present, manifest valid, local HTML references resolved, CSP hardened, and secret-pattern scan clean.`);
