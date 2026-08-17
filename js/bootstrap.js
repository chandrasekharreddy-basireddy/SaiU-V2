const isLocalHost=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
const modal=document.querySelector('#modal');
const close=document.querySelector('#modalClose');
if(close&&modal)close.addEventListener('click',()=>modal.close());
if('serviceWorker' in navigator&&!isLocalHost){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
