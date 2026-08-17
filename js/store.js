const KEY='saiu-v2-state';
const defaults={theme:'system',section:'SCDS 3',school:'SCDS',tasks:[],xp:0,streak:0,lastOpen:null,installDismissed:false};
function sanitizeState(value){
  const raw=value&&typeof value==='object'?value:{};
  return {
    ...defaults,
    ...raw,
    tasks:Array.isArray(raw.tasks)?raw.tasks.filter(t=>t&&typeof t==='object').map(t=>({id:String(t.id||crypto.randomUUID()),title:String(t.title||'').trim(),done:Boolean(t.done),createdAt:Number(t.createdAt)||Date.now()})).filter(t=>t.title):[],
    xp:Math.max(0,Number(raw.xp)||0),
    streak:Math.max(0,Number(raw.streak)||0),
    theme:['system','light','dark'].includes(raw.theme)?raw.theme:'system'
  };
}
export function load(){try{return sanitizeState(JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{return {...defaults,tasks:[]}}}
export function save(state){const safe=sanitizeState(state);localStorage.setItem(KEY,JSON.stringify(safe));return safe}
export function patch(values){return save({...load(),...(values||{})})}
export function addTask(title){const clean=String(title||'').trim();if(!clean)throw new Error('Task title is required');const s=load();s.tasks.unshift({id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`,title:clean,done:false,createdAt:Date.now()});return save(s)}
export function toggleTask(id){const s=load();const t=s.tasks.find(x=>x.id===id);if(t)t.done=!t.done;return save(s)}
export function addXp(amount){const s=load();s.xp=Math.max(0,s.xp+(Number(amount)||0));return save(s)}
export function setTheme(theme){return patch({theme})}
export function applyTheme(){const s=load();const media=matchMedia('(prefers-color-scheme: dark)');const dark=s.theme==='dark'||(s.theme==='system'&&media.matches);document.body.classList.toggle('dark',dark)}
