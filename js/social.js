import {commonFree,freePeriods,fmtMinutes,parseCsv} from './timetable.js';

function cleanClass(c){return {day:String(c.day||''),start:String(c.start||''),end:String(c.end||''),course:String(c.course||''),room:String(c.room||'')}}
export async function shareSchedule(items){const safe=(items||[]).map(cleanClass);const text=safe.map(c=>`${c.day} ${c.start}-${c.end} ${c.course}${c.room?` (${c.room})`:''}`).join('\n');if(navigator.share){await navigator.share({title:'My SaiU V2 timetable',text});return 'shared'}if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return 'copied'}throw new Error('Sharing is unavailable in this browser')}
export function scheduleText(items){return (items||[]).map(cleanClass).map(c=>`${c.day},${c.start},${c.end},${c.course.replaceAll(',',' ')},${c.room.replaceAll(',',' ')}`).join('\n')}
export function parseSharedSchedule(text){const header='day,start,end,course,room';const parsed=parseCsv(`${header}\n${String(text||'')}`,{});return parsed.map(cleanClass)}
export function compareSchedules(a,b,day){return commonFree(a,b,day).filter(x=>x.duration>=30).map(x=>({start:x.start,end:x.end,duration:x.duration,label:`${fmtMinutes(x.start)}–${fmtMinutes(x.end)}`}))}
export function personalFreeTime(items,day){return freePeriods(items,day).filter(x=>x.end-x.start>=60)}
export function bestMeetingSlots(a,b,days=['Monday','Tuesday','Wednesday','Thursday','Friday']){return days.flatMap(day=>compareSchedules(a,b,day).map(slot=>({...slot,day}))).sort((x,y)=>y.duration-x.duration)}
