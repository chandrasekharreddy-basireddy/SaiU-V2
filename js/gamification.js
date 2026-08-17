import {load,patch} from './store.js';
import {academics} from './student.js';
const LEGACY='saiu-v2-gamification';
function migrateLegacy(){
  const current=load();
  try{
    const legacy=JSON.parse(localStorage.getItem(LEGACY)||'null');
    if(legacy&&typeof legacy==='object'&&current.xp===0&&Number(legacy.xp)>0)patch({xp:Number(legacy.xp)||0,streak:Number(legacy.streak)||0,lastOpen:legacy.lastActive||null});
    if(legacy)localStorage.removeItem(LEGACY);
  }catch{localStorage.removeItem(LEGACY)}
  return load();
}
export function gameState(){return migrateLegacy()}
export function level(xp){return Math.max(1,Math.floor(Math.max(0,Number(xp)||0)/100)+1)}
export function progress(xp){return Math.max(0,Math.min(99,Math.max(0,Number(xp)||0)%100))}
export function title(l){if(l>=25)return 'Campus Legend';if(l>=15)return 'Power Student';if(l>=8)return 'Focused Learner';return 'Freshman Mode'}
export function badges(state=gameState()){
  const academic=academics();
  const b=[];
  if(state.xp>=100)b.push('100 XP');
  if(state.tasks.filter(t=>t.done).length>=10)b.push('Task Crusher');
  if(state.streak>=7)b.push('7-Day Streak');
  if(Object.keys(academic.attendance||{}).length>=5)b.push('Attendance Tracker');
  if((academic.exams||[]).length>=3)b.push('Exam Ready');
  return [...new Set(b)];
}
export function awardXp(amount,event='general'){
  const n=Math.max(0,Math.min(100,Number(amount)||0));
  const s=load();
  const ledger=s.__xpEvents&&typeof s.__xpEvents==='object'?{...s.__xpEvents}:{};
  const today=new Date().toISOString().slice(0,10);
  const dayEvents=Array.isArray(ledger[today])?ledger[today]:[];
  if(dayEvents.includes(event))return s.xp;
  ledger[today]=[...dayEvents,event];
  const cutoff=new Date();cutoff.setDate(cutoff.getDate()-60);
  for(const day of Object.keys(ledger)){if(new Date(`${day}T00:00:00`)<cutoff)delete ledger[day]}
  return patch({xp:s.xp+n,__xpEvents:ledger}).xp;
}
export function recordActivity(date=new Date()){
  const s=load();
  const day=new Date(date);const dayIso=`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;
  if(s.lastOpen===dayIso)return s.streak;
  const prev=s.lastOpen?new Date(`${s.lastOpen}T00:00:00`):null;
  const cur=new Date(`${dayIso}T00:00:00`);
  const diff=prev?Math.round((cur-prev)/86400000):null;
  const streak=diff===1?s.streak+1:1;
  patch({streak,lastOpen:dayIso});
  return streak;
}
export function progressSnapshot(){const s=load();const l=level(s.xp);return {xp:s.xp,level:l,title:title(l),progress:progress(l? s.xp:0),toNext:100-progress(s.xp),streak:s.streak,badges:badges(s)}}
