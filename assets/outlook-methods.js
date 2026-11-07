/* Open source notes when their existing Outlook jump link is followed. */
(() => {
 'use strict';
 const section=document.getElementById('outlook-calculations');
 const notes=document.getElementById('outlook-methods');
 if(!section||!notes)return;
 const summary=notes.querySelector('summary');
 function reveal(){
  notes.open=true;
  requestAnimationFrame(()=>{
   summary.focus({preventScroll:true});
   section.scrollIntoView({block:'start'});
  });
 }
 function followHash(){if(location.hash==='#outlook-calculations')reveal();}
 document.addEventListener('click',event=>{
  if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  const link=event.target.closest('a[href]');
  if(!link||link.target==='_blank')return;
  const target=new URL(link.getAttribute('href'),location.href);
  if(target.origin===location.origin&&target.pathname===location.pathname&&target.search===location.search&&target.hash==='#outlook-calculations')reveal();
 });
 window.addEventListener('hashchange',followHash);
 followHash();
})();
