const CACHE='saiu-v2-v8';
const SHELL=['./','./index.html','./styles.css','./js/app.js','./js/bootstrap.js','./js/store.js','./js/timetable.js','./js/timetable-safe.js','./js/ai.js','./js/calendar.js','./js/notifications.js','./js/gamification.js','./js/navigation.js','./js/social.js','./js/student.js','./js/student-os.js','./js/catalog.js','./js/remote.js','./manifest.json','./icons/icon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==location.origin)return;
 event.respondWith(fetch(event.request,{cache:event.request.mode==='navigate'?'no-store':'default'}).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{})}return response}).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));
});
