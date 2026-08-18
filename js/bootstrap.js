import{init as initStudentOS}from'./student-os.js';if(typeof window!=='undefined')window.SaiUStudentOS={init:initStudentOS};

const isLocalHost=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
const modal=document.querySelector('#modal');
const close=document.querySelector('#modalClose');
if(close&&modal){close.addEventListener('click',()=>modal.close());modal.addEventListener('keydown',e=>{if(e.key==='Escape'){modal.close();return}if(e.key==='Tab'){const f=modal.querySelectorAll('button,input,select,textarea,a[href]');if(!f.length)return;const[first,last]=[f[0],f[f.length-1]];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}})}
if('serviceWorker' in navigator&&!isLocalHost){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}