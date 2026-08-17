import {commonFree,freePeriods,fmtMinutes} from './timetable.js';
export async function shareSchedule(items){const text=items.map(c=>`${c.day} ${c.start}-${c.end} ${c.course} (${c.room})`).join('\n');if(navigator.share){await navigator.share({title:'My SaiU V2 timetable',text});return 'shared'}await navigator.clipboard?.writeText(text);return 'copied'}
export function compareSchedules(a,b,day){return commonFree(a,b,day).filter(x=>x.duration>=30).map(x=>`${fmtMinutes(x.start)}–${fmtMinutes(x.end)}`)}
export function personalFreeTime(items,day){return freePeriods(items,day).filter(x=>x.end-x.start>=60)}
