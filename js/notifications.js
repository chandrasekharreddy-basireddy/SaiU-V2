const KEY='saiu-v2-reminders';
const DAY_INDEX={Sunday:0,Monday:1,Tuesday:2,Wednesday:3,Thursday:4,Friday:5,Saturday:6};
let registration=null;const timers=new Map();
const read=()=>{try{const value=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(value)?value:[]}catch{return[]}};
const write=value=>{try{localStorage.setItem(KEY,JSON.stringify(value.slice(-200)))}catch{}};
const classKey=c=>String(c?.id||`${c?.day}-${c?.start}-${c?.course}`);
const scope=()=>`${localStorage.getItem('saiu_school')||''}|${localStorage.getItem('saiu_year')||''}|${localStorage.getItem('saiu_section')||''}`;
function targetDate(c,now=new Date()){const dayIndex=DAY_INDEX[c?.day];if(dayIndex==null)return null;const [h,m]=String(c?.start||'').split(':').map(Number);if(!Number.isInteger(h)||!Number.isInteger(m)||h<0||h>23||m<0||m>59)return null;const target=new Date(now);const delta=(dayIndex-target.getDay()+7)%7;target.setDate(target.getDate()+delta);target.setHours(h,m,0,0);return target}
export async function initNotifications(){if('serviceWorker' in navigator)try{registration=await navigator.serviceWorker.ready}catch{};recoverDueReminders();return registration}
export async function notify(title,body,tag='saiu-v2'){if(!registration||typeof Notification==='undefined'||Notification.permission!=='granted')return false;try{await registration.showNotification(title,{body,tag,renotify:true});return true}catch{return false}}
export async function requestNotifications(){if(!('Notification' in window))return 'unsupported';return Notification.requestPermission()}
function clearTimer(key){const timer=timers.get(key);if(timer)clearTimeout(timer);timers.delete(key)}
function scheduleStored(reminder){clearTimer(reminder.key);const delay=reminder.fireAt-Date.now();if(delay<=0||delay>7*86400000)return;const timer=setTimeout(()=>{timers.delete(reminder.key);void notify('Upcoming class',`${reminder.course} starts in ${reminder.minutes} minutes — ${reminder.room||'room TBD'}`,`class-${reminder.key}`);removeReminder(reminder.key)},Math.min(delay,2147483647));timers.set(reminder.key,timer)}
export function recoverDueReminders(){const current=Date.now(),active=[];for(const r of read()){if(!r?.key||!Number.isFinite(r.fireAt))continue;if(r.fireAt<=current){void notify('Upcoming class',`${r.course} was due ${r.minutes} minutes before class — ${r.room||'room TBD'}`,`class-${r.key}`);continue}if(r.scope&&r.scope!==scope())continue;active.push(r);scheduleStored(r)}write(active);return active.length}
export function remindBeforeClass(c,minutes=10,now=new Date()){if(!c)return null;const target=targetDate(c,now);if(!target)return null;const lead=Math.max(1,Math.min(120,Number(minutes)||10)),fireAt=target.getTime()-lead*60000;if(fireAt<=now.getTime()||fireAt-now.getTime()>7*86400000)return null;const key=`${classKey(c)}:${target.getTime()}:${lead}`;const currentScope=scope();const prefix=`${classKey(c)}:`;const reminders=read().filter(r=>(r.scope||'')===currentScope&&!String(r.key||'').startsWith(prefix));const reminder={key,fireAt,minutes:lead,course:String(c.course||'Class').slice(0,200),room:String(c.room||'').slice(0,120),scope:currentScope};reminders.push(reminder);write(reminders);scheduleStored(reminder);return key}
function removeReminder(key){clearTimer(key);write(read().filter(r=>r.key!==key))}
export function clearScheduledReminders(){for(const key of [...timers.keys()])clearTimer(key)}
export function clearAllReminders(){clearScheduledReminders();write([])}
export function reminders(){return read()}
