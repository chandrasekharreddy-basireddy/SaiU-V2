import {schoolById,yearById,sheetCsvUrl} from './catalog.js';
import {parseCsv,SAMPLE,timetableStats} from './timetable.js';
const PREFIX='saiu-v2-timetable-cache:';
const LEGACY='saiu-v2-timetable-cache';
const REMOTE_TIMEOUT_MS=12000;
const normalizeSelection=selection=>({schoolId:selection?.schoolId||'scds',yearId:selection?.yearId||'',section:selection?.section==null||selection?.section===''?null:String(selection.section)});
const selectionKey=selection=>{const s=normalizeSelection(selection);return `${PREFIX}${encodeURIComponent(`${s.schoolId}|${s.yearId}|${s.section??'all'}`)}`};
const sameSelection=(a,b)=>{const x=normalizeSelection(a),y=normalizeSelection(b);return x.schoolId===y.schoolId&&x.yearId===y.yearId&&x.section===y.section};
function validatePayload(items,selection){if(!Array.isArray(items)||!items.length)throw new Error('No classes matched this selection');const stats=timetableStats(items);if(stats.classes>5000)throw new Error('Timetable source returned an unexpectedly large dataset');for(const c of items){if(!c.day||!c.start||!c.end||!c.course)throw new Error('Timetable source contains an invalid class row')}return {selection:normalizeSelection(selection),timetable:items};}
async function fetchText(url){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),REMOTE_TIMEOUT_MS);try{const r=await fetch(url,{cache:'no-store',signal:controller.signal});if(!r.ok)throw new Error(`Timetable source returned HTTP ${r.status}`);return await r.text()}catch(error){if(error?.name==='AbortError')throw new Error('Timetable source request timed out');throw error}finally{clearTimeout(timer)}}
export async function loadRemoteTimetable(selection={}){
 const normalized=normalizeSelection(selection); const school=schoolById(normalized.schoolId); const year=yearById(school,normalized.yearId);
 const options={school:school.short,mandatory:year?.mandatory||[],electives:(year?.electives||[]).map(label=>({id:label.toLowerCase().replace(/[^a-z0-9]+/g,'-'),label})),section:normalized.section};
 try{const parsed=parseCsv(await fetchText(sheetCsvUrl()),options);const safe=validatePayload(parsed,normalized);const payload={savedAt:Date.now(),...safe,sourceUrl:sheetCsvUrl()};localStorage.setItem(selectionKey(normalized),JSON.stringify(payload));return {timetable:safe.timetable,source:'live',savedAt:payload.savedAt,selection:safe.selection};}
 catch(error){const cached=readCached(normalized);if(cached)return {...cached,source:'offline-cache',error:String(error?.message||error)};return {timetable:SAMPLE,source:'demo',error:String(error?.message||error),selection:normalized}}
}
export function readCached(selection={}){try{let raw=localStorage.getItem(selectionKey(selection));if(!raw&&selectionKey(selection)!==LEGACY)raw=null;const p=JSON.parse(raw||'null');if(!p?.timetable?.length||!sameSelection(p.selection,selection))return null;const safe=validatePayload(p.timetable,p.selection);return {timetable:safe.timetable,savedAt:p.savedAt,selection:safe.selection};}catch{return null}}
export function clearRemoteCache(selection=null){for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key&&(key===LEGACY||key.startsWith(PREFIX))){if(selection===null||key===selectionKey(selection))localStorage.removeItem(key);}}}
export function cacheKey(selection={}){return selectionKey(selection)}
