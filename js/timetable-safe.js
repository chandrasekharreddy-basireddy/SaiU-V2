import * as base from './timetable.js';
const MAX_CSV_CHARS=1500000;
const BAD_12_HOUR=/(?:^|[\n,])\s*0(?::\d{2})?\s*(?:AM|PM)\b/i;
export const parseTimeRange=value=>BAD_12_HOUR.test(String(value??''))?null:base.parseTimeRange(value);
export function parseCsv(text,options={}){const raw=String(text??'');if(raw.length>MAX_CSV_CHARS)throw new Error('Timetable CSV is too large');if(BAD_12_HOUR.test(raw))throw new Error('Timetable source contains an invalid 12-hour time');return base.parseCsv(raw,options)}
export async function loadCsv(url,options={}){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);try{const r=await fetch(url,{cache:'no-store',signal:controller.signal});if(!r.ok)throw new Error(`Timetable source returned ${r.status}`);const text=await r.text();return parseCsv(text,options)}catch(e){if(e?.name==='AbortError')throw new Error('Timetable source request timed out');throw e}finally{clearTimeout(timer)}}
export const SAMPLE=base.SAMPLE,timetableStats=base.timetableStats;
export const toMinutes=base.toMinutes,fmtMinutes=base.fmtMinutes,duration=base.duration,sortClasses=base.sortClasses,classesForDay=base.classesForDay,currentClass=base.currentClass,nextClass=base.nextClass,freePeriods=base.freePeriods,commonFree=base.commonFree,conflicts=base.conflicts;
