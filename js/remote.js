import {schoolById,yearById,sheetCsvUrl} from './catalog.js';
import {parseCsv,SAMPLE} from './timetable.js';
const KEY='saiu-v2-timetable-cache';
export async function loadRemoteTimetable(selection={}){
 const school=schoolById(selection.schoolId||'scds'); const year=yearById(school,selection.yearId);
 const options={school:school.short,mandatory:year?.mandatory||[],electives:(year?.electives||[]).map(label=>({id:label.toLowerCase().replace(/[^a-z0-9]+/g,'-'),label})),section:selection.section};
 try{const r=await fetch(sheetCsvUrl(),{cache:'no-store'});if(!r.ok)throw new Error(`HTTP ${r.status}`);const parsed=parseCsv(await r.text(),options);if(!parsed.length)throw new Error('No classes matched this selection');const payload={savedAt:Date.now(),selection,timetable:parsed};localStorage.setItem(KEY,JSON.stringify(payload));return {timetable:parsed,source:'live',savedAt:payload.savedAt};}
 catch(error){const cached=readCached(selection);if(cached)return {...cached,source:'offline-cache'};return {timetable:SAMPLE,source:'demo',error:String(error?.message||error)}}
}
export function readCached(selection={}){try{const p=JSON.parse(localStorage.getItem(KEY)||'null');if(!p?.timetable?.length)return null;return JSON.stringify(p.selection||{})===JSON.stringify(selection||{})?{timetable:p.timetable,savedAt:p.savedAt}:null}catch{return null}}
export function clearRemoteCache(){localStorage.removeItem(KEY)}
