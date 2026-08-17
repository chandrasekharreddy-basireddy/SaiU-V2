const DAY_ORDER=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const DAY_SET=new Set(DAY_ORDER);
const SECTION_RE=/\(\s*Sec(?:tion)?\s*(\d+)\s*\)/i;
const TIME_RE=/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?\s*(?:-|–|—|to)\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i;

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
 {id:'fri-cyber',day:'Friday',start:'10:00',end:'11:30',course:'Cyber Security',code:'CS310',room:'A-206',teacher:'Faculty J',school:'SCDS',section:3}
];

export function toMinutes(t){const [h,m]=String(t).split(':').map(Number);return h*60+m}
export function fmtMinutes(n){return `${String(Math.floor(n/60)%24).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`}
export function duration(c){return Math.max(0,toMinutes(c.end)-toMinutes(c.start))}
export function sortClasses(items){return [...items].sort((a,b)=>(DAY_ORDER.indexOf(a.day)-DAY_ORDER.indexOf(b.day))||toMinutes(a.start)-toMinutes(b.start)||String(a.course).localeCompare(String(b.course)))}
export function classesForDay(items,day){return sortClasses(items.filter(x=>x.day===day))}
export function conflicts(items){const out=[];const groups=new Map();for(const c of items){const k=c.day;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(c)}for(const list of groups.values()){const sorted=[...list].sort((a,b)=>toMinutes(a.start)-toMinutes(b.start));for(let i=0;i<sorted.length;i++)for(let j=i+1;j<sorted.length;j++){if(toMinutes(sorted[j].start)>=toMinutes(sorted[i].end))break;if(toMinutes(sorted[i].start)<toMinutes(sorted[j].end)&&toMinutes(sorted[j].start)<toMinutes(sorted[i].end))out.push([sorted[i],sorted[j]])}}return out}
export function freePeriods(items,day,start=8*60,end=18*60){const busy=classesForDay(items,day).map(c=>[toMinutes(c.start),toMinutes(c.end)]).sort((a,b)=>a[0]-b[0]);const result=[];let cursor=start;for(const [s,e] of busy){if(s>cursor)result.push({start:cursor,end:Math.min(s,end)});cursor=Math.max(cursor,e);if(cursor>=end)break}if(cursor<end)result.push({start:cursor,end});return result.filter(x=>x.end>x.start)}
export function commonFree(itemsA,itemsB,day,start=8*60,end=18*60){const a=freePeriods(itemsA,day,start,end),b=freePeriods(itemsB,day,start,end),out=[];for(const x of a)for(const y of b){const s=Math.max(x.start,y.start),e=Math.min(x.end,y.end);if(e>s)out.push({start:s,end:e,duration:e-s})}return out}
function normalizeTime(h,m,ampm){let hour=Number(h),min=Number(m||0);if(ampm){const a=ampm.toUpperCase();if(a==='PM'&&hour<12)hour+=12;if(a==='AM'&&hour===12)hour=0}return hour*60+min}
export function parseTimeRange(value){const m=String(value||'').match(TIME_RE);if(!m)return null;let s=normalizeTime(m[1],m[2],m[3]);let e=normalizeTime(m[4],m[5],m[6]||m[3]);if(e<=s)e+=12*60;if(e<=s)e+=24*60;return {start:fmtMinutes(s),end:fmtMinutes(e%1440)}}
function splitCSVLine(line){const cells=[];let cur='',quoted=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(quoted&&line[i+1]==='"'){cur+='"';i++;}else quoted=!quoted;}else if(ch===','&&!quoted){cells.push(cur.trim());cur='';}else cur+=ch}cells.push(cur.trim());return cells}
function cleanCell(s){return String(s??'').replace(/\s+/g,' ').replace(/^"|"$/g,'').trim()}
function subjectFaculty(cell){const text=cleanCell(cell).replace(SECTION_RE,'').trim();const parts=text.split(/\s*(?:\||@|\s+[-–—]\s+)\s*/);return {subject:(parts[0]||text).trim(),teacher:(parts[1]||'').trim()}}
function slug(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function canonicalCourse(s){return slug(s)}
function findRoom(rows,rowIndex,col){for(let k=rowIndex+1;k<Math.min(rowIndex+3,rows.length);k++){const v=cleanCell(rows[k][col]);if(v&&/(room|lab|ab\d|[a-z]-\d)/i.test(v))return v}return ''}

/** Parse the published SaiU grid CSV. It accepts the original grid format and flat CSV. */
export function parseCsv(text,options={}){
 const rows=String(text||'').split(/\r?\n/).map(splitCSVLine).filter(r=>r.some(x=>cleanCell(x)));
 if(!rows.length)return[];
 const header=rows[0].map(x=>cleanCell(x).toLowerCase());
 const flat=header.includes('day')&&(header.includes('start')||header.includes('starttime'));
 if(flat)return parseFlatRows(rows,options);
 return parseGridRows(rows,options);
}
function parseFlatRows(rows,options){const h=rows.shift().map(x=>cleanCell(x).toLowerCase());const idx=n=>h.indexOf(n);const pick=(r,names)=>{for(const n of names){const i=idx(n);if(i>=0)return cleanCell(r[i])}return ''};const out=[];for(const r of rows){const day=pick(r,['day','weekday']);const times=parseTimeRange(pick(r,['time','timerange']))||{start:pick(r,['start','starttime']),end:pick(r,['end','endtime'])};const course=pick(r,['course','subject','name']);if(!DAY_SET.has(day)||!times.start||!times.end||!course)continue;const sec=Number(pick(r,['section','sec']))||null;out.push({id:`${day}-${times.start}-${canonicalCourse(course)}-${sec||'all'}`,day,start:times.start,end:times.end,course,code:pick(r,['code','coursecode']),room:pick(r,['room','classroom']),teacher:pick(r,['teacher','faculty']),school:options.school||'',section:sec})}return filterForSelection(out,options)}
function parseGridRows(rows,options){const out=[];let day=null;for(let i=0;i<rows.length;i++){const row=rows[i].map(cleanCell);const first=(row[0]||'').toUpperCase();if(DAY_SET.has(first[0]+first.slice(1).toLowerCase()))day=first[0]+first.slice(1).toLowerCase();if(!day)continue;const tr=parseTimeRange(row[1]);if(!tr)continue;for(let col=2;col<row.length;col++){const cell=row[col];if(!cell||/^(lunch|break|open block)$/i.test(cell))continue;const secMatch=cell.match(SECTION_RE);const parsed=subjectFaculty(cell);const subject=parsed.subject;if(!subject||subject.length<2)continue;const sec=secMatch?Number(secMatch[1]):null;const mandatory=(options.mandatory||[]).some(x=>subject.toLowerCase().startsWith(String(x).toLowerCase())||String(x).toLowerCase().startsWith(subject.toLowerCase()));const elective=(options.electives||[]).find(x=>subject.toLowerCase().startsWith(String(x.label||x).toLowerCase()));if((options.mandatory?.length||options.electives?.length)&&!mandatory&&!elective)continue;if(options.section!=null&&sec!=null&&Number(options.section)!==sec&&!elective)continue;out.push({id:`${day}-${tr.start}-${canonicalCourse(subject)}-${sec||'all'}-${col}`,day,start:tr.start,end:tr.end,course:subject,code:elective?.id||canonicalCourse(subject).toUpperCase().slice(0,8),room:findRoom(rows,i,col),teacher:parsed.teacher,school:options.school||'',section:sec,elective:elective?.id||null})}}return filterForSelection(out,options)}
function filterForSelection(items,options){return items.filter(c=>{if(options.section==null)return true;if(c.section==null)return true;return Number(c.section)===Number(options.section)})}
export async function loadCsv(url,options={}){const r=await fetch(url,{cache:'no-store',headers:{Accept:'text/csv'}});if(!r.ok)throw new Error(`Timetable source returned ${r.status}`);const text=await r.text();return parseCsv(text,options)}
export function currentClass(items,now=new Date()){const day=now.toLocaleDateString('en-US',{weekday:'long'});const mins=now.getHours()*60+now.getMinutes();return classesForDay(items,day).find(c=>mins>=toMinutes(c.start)&&mins<toMinutes(c.end))||null}
export function nextClass(items,now=new Date()){const day=now.toLocaleDateString('en-US',{weekday:'long');const mins=now.getHours()*60+now.getMinutes();const today=classesForDay(items,day).find(c=>toMinutes(c.start)>mins);if(today)return today;for(let i=1;i<=7;i++){const d=DAY_ORDER[(DAY_ORDER.indexOf(day)+i)%DAY_ORDER.length];const first=classesForDay(items,d)[0];if(first)return first}return null}
export function timetableStats(items){return {classes:items.length,minutes:items.reduce((n,c)=>n+duration(c),0),conflicts:conflicts(items).length,days:new Set(items.map(c=>c.day)).size}}
