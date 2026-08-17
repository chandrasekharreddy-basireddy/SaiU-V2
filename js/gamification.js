import {load,awardXp as grantXp,recordActivity as touchActivity,patch} from './store.js';
export function gameState(){const s=load();return {xp:s.xp,streak:s.streak,lastActive:s.lastActive,tasks:s.tasks,attendance:s.attendance,exams:s.exams,xpEvents:s.xpEvents}}
export function level(xp){return Math.max(1,Math.floor(Math.max(0,Number(xp)||0)/100)+1)}
export function progress(xp){return Math.max(0,Math.min(99,Math.max(0,Number(xp)||0)%100))}
export function title(l){if(l>=25)return 'Campus Legend';if(l>=15)return 'Power Student';if(l>=8)return 'Focused Learner';return 'Freshman Mode'}
export function badges(state){const s=state||gameState();const b=[];if(s.xp>=100)b.push('100 XP');if(Array.isArray(s.tasks)&&s.tasks.filter(t=>t.done).length>=10)b.push('Task Crusher');if(s.streak>=7)b.push('7-Day Streak');if(s.attendance&&Object.keys(s.attendance).length>=5)b.push('Attendance Tracker');if(Array.isArray(s.exams)&&s.exams.length>=3)b.push('Exam Ready');return [...new Set(b)]}
export function awardXp(amount,event='general'){return grantXp(amount,event)}
export function recordActivity(date=new Date()){return touchActivity(date)}
export function progressSnapshot(){const s=gameState();const l=level(s.xp);return {xp:s.xp,level:l,title:title(l),progress:progress(s.xp),toNext:100-progress(s.xp),streak:s.streak,badges:badges(s)}}
export function resetProgress(){const s=load();patch({xp:0,streak:0,lastActive:null,xpEvents:{}});return load()}
