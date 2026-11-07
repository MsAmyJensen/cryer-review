/* A tab-local year selection shared by the overview and supporting pages. */
(() => {
 'use strict';
 const root=new URL('../',document.currentScript.src),key='town-ledger-period:'+root.href;
 const valid=p=>p&&Number.isInteger(p.from)&&Number.isInteger(p.to)&&p.from>=2018&&p.to<=2039&&p.from<=p.to;
 let period={from:2039,to:2039};try{const saved=JSON.parse(sessionStorage.getItem(key));if(valid(saved))period=saved;}catch{}
 const get=()=>({...period}),label=()=>period.from===period.to?'FY'+period.to:'FY'+period.from+'–'+period.to;
 function set(from,to=from,{remote=false}={}){
  const p={from:Math.min(+from,+to),to:Math.max(+from,+to)};if(!valid(p))return false;
  if(p.from===period.from&&p.to===period.to){if(remote)window.dispatchEvent(new CustomEvent('townledger:period',{detail:{...get(),remote}}));return false;}period=p;
  try{sessionStorage.setItem(key,JSON.stringify(p));}catch{}
  window.dispatchEvent(new CustomEvent('townledger:period',{detail:{...get(),remote}}));
  if(!remote&&parent!==window)parent.postMessage({channel:'town-ledger-period',period:get()},location.origin);
  return true;
 }
 window.townLedgerPeriod={get,set,label,incomingYear:Number(new URLSearchParams(location.search).get('year'))};
 window.addEventListener('message',e=>{
  const frame=document.getElementById('detail-frame');
  if(e.origin!==location.origin||e.data?.channel!=='town-ledger-period'||!(e.source===parent&&parent!==window||frame&&!document.getElementById('detail-view')?.hidden&&e.source===frame.contentWindow)||!valid(e.data.period))return;
  set(e.data.period.from,e.data.period.to,{remote:true});
 });
 function renderControls(){
  document.querySelectorAll('[data-period-controls]').forEach((host,i)=>{
   if(!host.dataset.periodReady){
    host.dataset.periodReady='true';const prefix='review-period-'+i,options=Array.from({length:22},(_,i)=>`<option value="${2018+i}">FY${2018+i}</option>`).join('');
    const availability='Tax illustrations: FY2026–2039. Utility illustrations: FY2027–2039. Earlier personalized bills are unavailable. A range compares annual endpoints; it is not a sum.';
    const help=host.hasAttribute('data-period-compact')?`<div class="review-period-help"><span>Annual endpoints, not a total.</span><details><summary>Year availability</summary><p>${availability}</p></details></div>`:`<p>${availability}</p>`;
    host.innerHTML=`<fieldset class="review-period"><legend>Years &amp; range</legend><label for="${prefix}-mode">Compare<select id="${prefix}-mode" data-period-mode><option value="year">One year</option><option value="range">Year range</option></select></label><label for="${prefix}-from" data-period-start>From<select id="${prefix}-from" data-period-from>${options}</select></label><label for="${prefix}-to">Year / through<select id="${prefix}-to" data-period-to>${options}</select></label>${help}</fieldset>`;
    host.addEventListener('change',e=>{
     let from=+host.querySelector('[data-period-from]').value,to=+host.querySelector('[data-period-to]').value;
     if(host.querySelector('[data-period-mode]').value==='year')from=to;
     else if(e.target.matches('[data-period-mode]'))from=2026;
     else if(from>to){if(e.target.matches('[data-period-from]'))to=from;else from=to;}
     set(from,to);renderControls();
    });
   }
   const range=period.from!==period.to;host.querySelector('[data-period-mode]').value=range?'range':'year';host.querySelector('[data-period-start]').hidden=!range;host.querySelector('[data-period-from]').value=period.from;host.querySelector('[data-period-to]').value=period.to;
  });
 }
 window.addEventListener('townledger:period',renderControls);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',renderControls);else renderControls();
})();
