const KEY='saiu-v2-state';
const defaults={theme:'system',section:'SCDS 3',school:'SCDS',tasks:[],xp:0,streak:0,lastOpen:null,installDismissed:false};
export function load(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return {...defaults}}}
export function save(state){localStorage.setItem(KEY,JSON.stringify(state));return state}
export function patch(values){return save({...load(),...values})}
export function addTask(title){const s=load();s.tasks.unshift({id:crypto.randomUUID(),title,done:false,createdAt:Date.now()});s.xp+=5;return save(s)}
export function toggleTask(id){const s=load();const t=s.tasks.find(x=>x.id===id);if(t){t.done=!t.done;s.xp+=t.done?10:-10}return save(s)}
export function addXp(amount){const s=load();s.xp=Math.max(0,s.xp+amount);return save(s)}
export function setTheme(theme){return patch({theme})}
export function applyTheme(){const s=load();const dark=s.theme==='dark'||(s.theme==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.body.classList.toggle('dark',dark)}
