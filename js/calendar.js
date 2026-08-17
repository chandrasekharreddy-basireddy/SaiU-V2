import {sortClasses} from './timetable.js';
const escapeIcs=value=>String(value??'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/([,;])/g,'\\$1');
const dayCode={Sunday:'SU',Monday:'MO',Tuesday:'TU',Wednesday:'WE',Thursday:'TH',Friday:'FR',Saturday:'SA'};
const pad=n=>String(n).padStart(2,'0');
const dtLocal=d=>`${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
const dtUtc=d=>`${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
export function ics(items,title='SaiU V2 Timetable'){
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SaiU V2//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH',`X-WR-CALNAME:${escapeIcs(title)}`];
 const base=new Date();const dayIndex={Sunday:0,Monday:1,Tuesday:2,Wednesday:3,Thursday:4,Friday:5,Saturday:6};
 for(const c of sortClasses(items)){
   const d=new Date(base);const delta=(dayIndex[c.day]-d.getDay()+7)%7;d.setDate(d.getDate()+delta);const [sh,sm]=c.start.split(':').map(Number),[eh,em]=c.end.split(':').map(Number);if(!Number.isInteger(sh)||!Number.isInteger(sm)||!Number.isInteger(eh)||!Number.isInteger(em))continue;
   const s=new Date(d);s.setHours(sh,sm,0,0);const e=new Date(d);e.setHours(eh,em,0,0);if(e<=s)continue;
   const uid=escapeIcs(`${c.id||`${c.day}-${c.start}-${c.course}`}@saiu-v2`);
   lines.push('BEGIN:VEVENT',`UID:${uid}`,`DTSTAMP:${dtUtc(new Date())}`,`DTSTART:${dtLocal(s)}`,`DTEND:${dtLocal(e)}`,`RRULE:FREQ=WEEKLY;BYDAY=${dayCode[c.day]||''}`,`SUMMARY:${escapeIcs(c.course)}`,`LOCATION:${escapeIcs(c.room)}`,`DESCRIPTION:${escapeIcs(`${c.code||''} — ${c.teacher||''}`)}`,'SEQUENCE:0','STATUS:CONFIRMED','END:VEVENT');
 }
 lines.push('END:VCALENDAR');return lines.join('\r\n')+'\r\n'
}
export function downloadIcs(items){const blob=new Blob([ics(items)],{type:'text/calendar;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='saiu-timetable.ics';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
