/* Select existing annual model rows; fixed history and cumulative figures retain their scope. */
(() => {
 'use strict';
 const T=window.townLedgerPeriod,$=id=>document.getElementById(id),cash=n=>Number.isFinite(n)?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n):'Unavailable';
 let applying=false;
 if(window.cryerPeriod){
  window.addEventListener('cryer:period',e=>{if(!applying)T.set(e.detail.from,e.detail.to);});
  window.addEventListener('townledger:period',()=>{applying=true;try{window.cryerPeriod.follow(T.get());}finally{applying=false;}});
 }
 function selectedOutlook(){
  const host=$('lo-selected-annual');if(!host)return;
  const p=T.get(),r=window.cryerOutlook?.getRows().find(r=>r.year===p.to);
  host.className='review-selected-summary';
  host.textContent=r?`${T.label()} · Annual detail for FY${r.year}${p.from!==p.to?' (final year of the span; not a sum)':''}: spending and set-asides ${cash(r.spending)}; funding before additional savings ${cash(r.funding_before_balance)}; annual gap ${cash(r.gap)}; debt payments ${cash(r.debt)} already included in spending. Both funding and spending here include utility reimbursements; the Big Picture nets them out, with the same gap. The charts and FY2039 headline retain their full-period context.`:`${T.label()} · Selected-year Outlook detail is unavailable before FY2026. The labeled FY2026–2039 charts and FY2039 headline remain full-period context.`;
 }
 function gapLookup(){
  document.querySelectorAll('[id^="gap-lookup-year-"]').forEach(select=>{
   const p=T.get(),has=[...select.options].some(o=>+o.value===p.to&&!o.hasAttribute('data-unavailable'));
   select.querySelector('[data-unavailable]')?.remove();
   if(!has){const o=new Option('FY'+p.to+' · detail unavailable',String(p.to));o.dataset.unavailable='';select.prepend(o);}
   select.value=p.to;select.closest('.gap-lookup,.gap-lookup-projects')?.querySelectorAll('button').forEach(b=>b.disabled=!has);
  });
 }
 function debt(){
  const select=$('payment-year');if(!select)return;
  const p=T.get(),has=[...select.options].some(o=>+o.value===p.to&& !o.hasAttribute('data-unavailable'));
  select.querySelector('[data-unavailable]')?.remove();
  if(has){select.value=p.to;select.dispatchEvent(new Event('change',{bubbles:true}));}
  else{
   const o=new Option('FY'+p.to+' · loan detail unavailable',String(p.to));o.dataset.unavailable='';select.prepend(o);select.value=p.to;
   $('payment-rows').replaceChildren();const row=document.createElement('tr'),cell=document.createElement('td');cell.colSpan=3;cell.textContent='Loan-by-loan payments are supplied for FY2027–FY2048. No per-loan amounts are established here for the selected year.';row.append(cell);$('payment-rows').append(row);
   for(const id of ['existing-total','future-total','all-total'])$(id).textContent='Unavailable';
   document.querySelectorAll('[data-payment]').forEach(n=>n.textContent='Unavailable');document.querySelectorAll('.selected-year-label').forEach(n=>n.textContent='FY'+p.to+' · no loan detail supplied');$('chart-year-label').textContent='FY'+p.to+' · loan detail unavailable';$('year-scope-note').textContent='Loan-level detail begins FY2027. Earlier aggregate debt amounts in the Outlook are separate evidence, not per-loan payments.';const url=new URL(location.href);url.searchParams.set('year',p.to);history.replaceState(null,'',url);
  }
  let note=$('review-debt-period');if(!note){note=document.createElement('p');note.id='review-debt-period';note.className='review-selected-summary';select.closest('label')?.parentElement.append(note);if(!note.isConnected)select.after(note);}
  note.textContent=T.label()+' selected. Payments below use the final year, not a sum of the range. The visible debt timeline keeps its full schedule. Debt is already in Outlook spending; a zero payment is different from unavailable detail.';
  window.dispatchEvent(new Event('townledger:route'));
 }
 function render(){selectedOutlook();gapLookup();document.querySelectorAll('[data-outlook-selected-year]').forEach(n=>n.textContent='FY'+T.get().to);}
 for(const event of ['townledger:period','cryer:household','cryer:outlook','cryer:route'])window.addEventListener(event,render);
 // Existing loan calculation is only called for years actually supplied in its schedule.
 const loan=$('payment-year');if(loan){
  if(T.incomingYear>=2018&&T.incomingYear<=2039&&T.incomingYear!==T.get().to)T.set(T.incomingYear);
  loan.addEventListener('change',()=>{if(!applying&&+loan.value>=2027&&+loan.value<=2039)T.set(+loan.value);else if(!applying&&+loan.value>2039)$('review-debt-period').textContent='FY'+loan.value+' loan schedule only. The full spending outlook ends in FY2039; the remembered household selection remains '+T.label()+'.';});
  window.addEventListener('townledger:period',()=>{applying=true;try{debt();}finally{applying=false;}});
 }
 document.addEventListener('change',e=>{if(e.target.matches('[id^="gap-lookup-year-"]'))T.set(+e.target.value);});
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a)return;const u=new URL(a.getAttribute('href'),location.href);if(u.origin===location.origin&&/General-Fund-Loan-Projects/.test(u.pathname)){if(!u.searchParams.has('year'))u.searchParams.set('year',T.get().to);a.setAttribute('href',u.href);}},true);
 // Render after the page's own scripts have initialized.
 function ready(){render();if(loan){applying=true;try{debt();}finally{applying=false;}}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
