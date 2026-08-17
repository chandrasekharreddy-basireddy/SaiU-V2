import {schoolById,yearById,sheetCsvUrl} from './catalog.js';
import {parseCsv,SAMPLE,timetableStats} from './timetable-safe.js';
const KEY='saiu-v2-timetable-cache-v2';
const LEGACY_KEY='saiu-v2-timetable-cache';
const REMOTE_TIMEOUT_MS=12000;const MAX_CACHE_ENTRIES=20;const MAX_REMOTE_CHARS=1_500_000;const MAX_CACHE_CHARS=900_000;
const normalizeSelection=selection=>({schoolId:selection?.schoolId||'scds',yearId:selection?.yearId||'',section:selection?.section==null||selection?.section===''?null:String(selection.section)});
const cacheId=s=>`${s.schoolId}|${s.yearId}|${s.section??'all'}`;
const sameSelection=(a,b)=>cacheId(normalizeSelection(a))===cacheId(normalizeSelection(b));
function readEntries(){try{const raw=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(raw))return raw;if(raw?.timetable)return [raw];return[]}catch{return[]}}
function writeEntries(entries){let safe=entries.slice(-MAX_CACHE_ENTRIES);while(safe.length){const raw=JSON.stringify(safe);if(raw.length<=MAX_CACHE_CHARS)break;safe=safe.slice(1)}try{localStorage.setItem(KEY,JSON.stringify(safe))}catch{}}
function validatePayload(items,selection){if(!Array.isArray(items)||!items.length)throw new Error('No classes matched this selection');const stats=timetableStats(items);if(stats.classes>5000)throw new Error('Timetable source returned an unexpectedly large dataset');for(const c of items){if(!c.day||!c.start||!c.end||!c.course)throw new Error('Timetable source contains an invalid class row')}return {selection:normalizeSelection(selection),timetable:items};}
async function fetchText(url){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),REMOTE_TIMEOUT_MS);try{const r=await fetch(url,{cache:'no-store',signal:controller.signal});if(!r.ok)throw new Error(`Timetable source returned HTTP ${r.status}`);const text=await r.text();if(text.length>MAX_REMOTE_CHARS)throw new Error('Timetable source is too large');return text}catch(error){if(error?.name==='AbortError')throw new Error('Timetable source request timed out');throw error}finally{clearTimeout(timer)}}
function migrateLegacy(){const legacy=(()=>{try{return JSON.parse(localStorage.getItem(LEGACY_KEY)||'null')}catch{return null}})();if(legacy?.timetable?.length&&!readEntries().length){writeEntries([legacy]);}localStorage.removeItem(LEGACY_KEY)}
export async function loadRemoteTimetable(selection={}){
 migrateLegacy();const normalized=normalizeSelection(selection);const school=schoolById(normalized.schoolId);const year=yearById(school,normalized.yearId);
 const options={school:school.short,mandatory:year?.mandatory||[],electives:(year?.electives||[]).map(label=>({id:label.toLowerCase().replace(/[^a-z0-9]+/g,'-'),label})),tracks:year?.tracks||[],section:normalized.section};
 try{const parsed=parseCsv(await fetchText(sheetCsvUrl()),options);const safe=validatePayload(parsed,normalized);const payload={savedAt:Date.now(),...safe,sourceUrl:sheetCsvUrl()};const entries=readEntries().filter(x=>!sameSelection(x.selection,normalized));entries.push(payload);writeEntries(entries);return {timetable:safe.timetable,source:'live',savedAt:payload.savedAt,selection:safe.selection};}
 catch(error){const cached=readCached(normalized);if(cached)return {...cached,source:'offline-cache',error:String(error?.message||error)};return {timetable:SAMPLE,source:'demo',error:String(error?.message||error),selection:normalized}}
}
export function readCached(selection={}){migrateLegacy();const normalized=normalizeSelection(selection);try{const entry=readEntries().filter(x=>sameSelection(x.selection,normalized)).sort((a,b)=>(b.savedAt||0)-(a.savedAt||0))[0];if(!entry?.timetable?.length)return null;const safe=validatePayload(entry.timetable,entry.selection);return {timetable:safe.timetable,savedAt:entry.savedAt,selection:safe.selection}}catch{return null}}
export function clearRemoteCache(selection=null){if(!selection){localStorage.removeItem(KEY);localStorage.removeItem(LEGACY_KEY);return}migrateLegacy();writeEntries(readEntries().filter(x=>!sameSelection(x.selection,selection)))}
export function cacheKey(){return KEY}
export function cachedSelections(){migrateLegacy();return readEntries().map(x=>x.selection).filter(Boolean)}
