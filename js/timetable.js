export const SAMPLE=[
{id:'mon-ai',day:'Monday',start:'09:00',end:'10:30',course:'Artificial Intelligence',code:'AI301',room:'B-204',teacher:'Faculty A',school:'SCDS',section:3},
{id:'mon-db',day:'Monday',start:'11:00',end:'12:30',course:'Database Systems',code:'DB302',room:'B-201',teacher:'Faculty B',school:'SCDS',section:3},
{id:'mon-dl',day:'Monday',start:'14:00',end:'15:30',course:'Deep Learning',code:'DL303',room:'C-104',teacher:'Faculty C',school:'SCDS',section:3},
{id:'tue-net',day:'Tuesday',start:'09:00',end:'10:30',course:'Computer Networks',code:'CN304',room:'A-110',teacher:'Faculty D',school:'SCDS',section:3},
{id:'tue-lab',day:'Tuesday',start:'11:00',end:'13:00',course:'AI Lab',code:'AIL305',room:'Lab 3',teacher:'Faculty E',school:'SCDS',section:3},
{id:'wed-os',day:'Wednesday',start:'10:00',end:'11:30',course:'Operating Systems',code:'OS306',room:'B-203',teacher:'Faculty F',school:'SCDS',section:3},
{id:'wed-cloud',day:'Wednesday',start:'14:00',end:'15:30',course:'Cloud Computing',code:'CC307',room:'C-203',teacher:'Faculty G',school:'SCDS',section:3},
{id:'thu-ml',day:'Thursday',start:'09:00',end:'10:30',course:'Machine Learning',code:'ML308',room:'B-205',teacher:'Faculty H',school:'SCDS',section:3},
{id:'thu-project',day:'Thursday',start:'13:30',end:'15:00',course:'Project Studio',code:'PR309',room:'Innovation Lab',teacher:'Faculty I',school:'SCDS',section:3},
{id:'fri-cyber',day:'Friday',start:'10:00',end:'11:30',course:'Cyber Security',code:'CS310',room:'A-206',teacher:'Faculty J',school:'SCDS',section:3},
];
export function toMinutes(t){const [h,m]=t.split(':').map(Number);return h*60+m}
export function duration(c){return Math.max(0,toMinutes(c.end)-toMinutes(c.start))}
export function sortClasses(items){return [...items].sort((a,b)=>a.day.localeCompare(b.day)||toMinutes(a.start)-toMinutes(b.start))}
export function classesForDay(items,day){return sortClasses(items.filter(x=>x.day===day))}
export function conflicts(items){const out=[];for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){if(items[i].day!==items[j].day)continue;if(toMinutes(items[i].start)<toMinutes(items[j].end)&&toMinutes(items[j].start)<toMinutes(items[i].end))out.push([items[i],items[j]])}return out}
export function freePeriods(items,day,start=8*60,end=18*60){const busy=classesForDay(items,day).map(c=>[toMinutes(c.start),toMinutes(c.end)]).sort((a,b)=>a[0]-b[0]);const result=[];let cursor=start;for(const [s,e] of busy){if(s>cursor)result.push({start:cursor,end:Math.min(s,end)});cursor=Math.max(cursor,e);if(cursor>=end)break}if(cursor<end)result.push({start:cursor,end});return result.filter(x=>x.end>x.start)}
export function fmtMinutes(n){return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`}
export function parseCsv(text){const rows=text.trim().split(/\r?\n/).filter(Boolean);if(rows.length<2)return[];const headers=rows.shift().split(',').map(x=>x.trim().toLowerCase());return rows.map(line=>{const cells=line.match(/(?:"[^"]*"|[^,])+/g)||[];const o={};headers.forEach((h,i)=>o[h]=(cells[i]||'').replace(/^"|"$/g,'').trim());return o}).filter(x=>x.course&&x.day&&x.start&&x.end)}
export function currentClass(items,now=new Date()){const day=now.toLocaleDateString('en-US',{weekday:'long'});const mins=now.getHours()*60+now.getMinutes();return classesForDay(items,day).find(c=>mins>=toMinutes(c.start)&&mins<toMinutes(c.end))||null}
export function nextClass(items,now=new Date()){const day=now.toLocaleDateString('en-US',{weekday:'long');const mins=now.getHours()*60+now.getMinutes();const today=classesForDay(items,day).find(c=>toMinutes(c.start)>mins);if(today)return today;const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];for(let i=1;i<=7;i++){const d=days[(now.getDay()+i)%7];const first=classesForDay(items,d)[0];if(first)return first}return null}
export function commonFree(itemsA,itemsB,day){const a=freePeriods(itemsA,day),b=freePeriods(itemsB,day),out=[];for(const x of a)for(const y of b){const s=Math.max(x.start,y.start),e=Math.min(x.end,y.end);if(e>s)out.push({start:s,end:e,duration:e-s})}return out}
export async function loadCsv(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(`Timetable source returned ${r.status}`);return parseCsv(await r.text())}
