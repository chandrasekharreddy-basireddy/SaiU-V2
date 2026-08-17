const KEY='saiu-v2-gamification';
const defaults={xp:0,streak:0,lastActive:null,events:{}};
export function gameState(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return {...defaults}}}
function save(v){localStorage.setItem(KEY,JSON.stringify({...gameState(),...v}))}
export function level(xp){return Math.max(1,Math.floor(Math.max(0,Number(xp)||0)/100)+1)}
export function progress(xp){return Math.max(0,Math.min(99,Math.max(0,Number(xp)||0)%100))}
export function title(l){if(l>=25)return 'Campus Legend';if(l>=15)return 'Power Student';if(l>=8)return 'Focused Learner';return 'Freshman Mode'}
export function badges(state){const s=state||gameState();const b=[];if(s.xp>=100)b.push('100 XP');if(s.tasks?.filter(t=>t.done).length>=10)b.push('Task Crusher');if(s.streak>=7)b.push('7-Day Streak');if(Object.keys(s.attendance||{}).length>=5)b.push('Attendance Tracker');if(s.exams?.length>=3)b.push('Exam Ready');return [...new Set(b)]}
export function awardXp(amount,event='general'){const n=Math.max(0,Math.min(100,Number(amount)||0));const s=gameState();const today=new Date().toISOString().slice(0,10);const events={...s.events};const dayEvents=Array.isArray(events[today])?events[today]:[];if(dayEvents.includes(event))return s.xp;events[today]=[...dayEvents,event];s.xp+=n;save({xp:s.xp,events});return s.xp}
export function recordActivity(date=new Date()){const s=gameState();const day=new Date(date).toISOString().slice(0,10);if(s.lastActive===day)return s.streak;const prev=s.lastActive?new Date(`${s.lastActive}T00:00:00`):null;const cur=new Date(`${day}T00:00:00`);const diff=prev?Math.round((cur-prev)/86400000):null;s.streak=diff===1?s.streak+1:1;s.lastActive=day;save({streak:s.streak,lastActive:day});return s.streak}
export function progressSnapshot(){const s=gameState();const l=level(s.xp);return {xp:s.xp,level:l,title:title(l),progress:progress(s.xp),toNext:100-progress(s.xp),streak:s.streak,badges:badges(s)}}
