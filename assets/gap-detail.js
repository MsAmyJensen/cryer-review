/* Presentation-only backup for the existing net General Fund chart. */
(() => {
 'use strict';
 const D=window.townLedgerGapDetailData;if(!D)return;
 const root=new URL('../',document.currentScript.src),cash=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0,currencySign:'accounting'}).format(Math.round(n)),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const label={spending:'Spending & set-asides',funding:'Funding before additional savings'};
 const basis=r=>r.year===2027?'May recommended budget · June amended budget adopted; final line-item reconciliation pending':r.basis;
 const link=s=>`<a href="${esc(new URL(s.href,root).href)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a>`;
 const dialog=document.createElement('dialog');dialog.className='gap-backup';dialog.setAttribute('aria-labelledby','gap-backup-title');
 dialog.innerHTML=`<div class="gap-backup-bar"><button type="button" data-gap-close>← Back to gap chart</button><span>GENERAL FUND · CHART BACKUP</span></div><div class="gap-backup-body"><h2 id="gap-backup-title" tabindex="-1"></h2><p id="gap-backup-basis"></p><div class="gap-backup-controls"><label>Fiscal year<select id="gap-backup-year">${D.rows.map(r=>`<option value="${r.year}">FY${r.year}</option>`).join('')}</select></label><label>Chart line<select id="gap-backup-line"><option value="spending">Spending & set-asides</option><option value="funding">Funding</option></select></label></div><div id="gap-backup-content" aria-live="polite"></div></div>`;
 dialog.querySelector('.gap-backup-bar').append(dialog.querySelector('.gap-backup-controls'));
 document.body.append(dialog);
 const $=s=>dialog.querySelector(s);let returnFocus=null;
 function table(parts,total,title){
  const difference=Math.round(total)-parts.reduce((s,p)=>s+Math.round(p.amount),0);
  const body=parts.map(p=>`<tr><th scope="row">${esc(p.label)}</th><td class="gap-amount">${cash(p.amount)}</td><td>${p.note?`<p>${esc(p.note)}</p>`:''}${(p.sources||[]).map(link).join('<br>')}</td></tr>`).join('');
  const round=difference?`<tr class="gap-round"><th scope="row">${title==='Spending & set-asides'&&$('#gap-backup-year').value==='2025'?'Source summary rounding':'Whole-dollar rounding'}</th><td class="gap-amount">${cash(difference)}</td><td>Shown separately so displayed rows add exactly to the chart value. ${$('#gap-backup-year').value==='2025'?'The published summary uses rounded component rows.':''}</td></tr>`:'';
  return `<p class="gap-table-hint">Swipe the table left to see source records →</p><div class="gap-table-scroll" tabindex="0" role="region" aria-label="${esc(title)} components"><table><caption>${esc(title)} · annual dollars</caption><thead><tr><th scope="col">Component</th><th scope="col">Amount</th><th scope="col">Source and calculation</th></tr></thead><tbody>${body}${round}</tbody><tfoot><tr><th scope="row">${esc(title)} total</th><td class="gap-amount">${cash(total)}</td><td>Components reconcile exactly to this displayed total.</td></tr></tfoot></table></div>`;
 }
 function render(){
  const r=D.rows.find(r=>r.year===+$('#gap-backup-year').value),kind=$('#gap-backup-line').value;
  $('#gap-backup-title').textContent=`FY${r.year} · ${label[kind]}`;$('#gap-backup-basis').textContent=basis(r);
  const scope=kind==='funding'?'Annual General Fund funding, excluding utility reimbursements.':'Annual General Fund spending and set-asides, net of utility reimbursements. Loan payments and project contributions are already counted in spending; full construction costs are not added again.';
  let out=`<div class="gap-proof"><strong>${cash(r[kind])}</strong><span>Matches the ${kind} line · $${(r[kind]/1e6).toFixed(1)}M on the graph</span></div><p class="gap-scope">${scope}</p>`;
  const fundingNote=kind==='funding'?`<p class="gap-scope">Funding adds taxes, other receipts and incoming transfers. Utility reimbursements of ${cash(r.utility)} are excluded; no additional use of savings is assumed.</p>`:'';
  out+=table(r[kind+'Parts'],r[kind],label[kind]);
  out+=fundingNote;
  const gap=Math.round(Math.abs(r.spending-r.funding)),roundedGap=Math.abs(Math.round(r.spending)-Math.round(r.funding)),gapRounding=gap-roundedGap;
  out+=`<p class="gap-equation"><b>That year’s ${r.spending>=r.funding?'gap':'surplus'}:</b> ${r.spending>=r.funding?`${cash(r.spending)} spending − ${cash(r.funding)} funding`:`${cash(r.funding)} funding − ${cash(r.spending)} spending`}${gapRounding?` ${gapRounding>0?'+':'−'} ${cash(Math.abs(gapRounding))} rounding`:''} = <b>${cash(gap)}</b>. This is one year, not the running total above the chart.${gapRounding?' The gap is calculated before rounding the two line values.':''}</p>`;
  if(kind==='spending'&&r.capitalDetail)out+=`<details><summary>Which purchases and transfers make up these rows?</summary><p>These are the components of the Capital purchases and Project and reserve transfers rows above, not additional spending.</p>${table(r.capitalDetail,r.capitalDetail.reduce((s,p)=>s+p.amount,0),'Capital purchases')}${table(r.transferDetail,r.transferDetail.reduce((s,p)=>s+p.amount,0),'Project and reserve transfers')}</details>`;
  if(r.year>=2030){
   const g=D.growth;
   out+=`<details><summary>Where do the forecast starting values and growth rates come from?</summary><p>The forecast starts with FY2029 in the saved recommended budget, not an adopted post-FY2029 plan. ${link({label:'FY2029 source column · printed p.20 / PDF p.21',href:'evidence/Cryer-Future-Outlook-Source-Documents-2026-10-16/FY2027-Recommended-Budget-and-Financial-Plan.pdf#page=21'})}</p><p><b>Personnel:</b> FY2029 ${cash(D.base.personnel)}, growing ${(g.personnel.cagr*100).toFixed(2)}% a year. The rate is (${cash(g.personnel.end)} ÷ ${cash(g.personnel.start)})^(1/7) − 1, using FY2018 and FY2025 actual personnel costs.</p><p><b>Eligible operations:</b> FY2029 Operating ${cash(10032606)} − Orange Rural Fire ${cash(2283016)} − roadwork ${cash(335000)} − contingency ${cash(450000)} − phone/security ${cash(220000)} − housing payments ${cash(276174)} = ${cash(6468416)}. The removed components have their own rows and are counted once.</p><p>The operating rate is (${cash(g.operating.selected_end)} ÷ ${cash(g.operating.start)})^(1/7) − 1 = ${(g.operating.selected_cagr*100).toFixed(2)}%. The FY2025 endpoint removes ${cash(9998)} of identified Disaster costs from ${cash(g.operating.raw_end)}; it is not subtracted again from FY2029.</p><p><b>Historical source references:</b> FY2018 original audit, Schedule 1, printed pp.73–76 / PDF pp.93–96 (the original PDF is not available in this review); FY2025 audit, Schedule 1, printed pp.74–77 / PDF pp.97–100. ${link({label:'FY2025 audit · PDF p.97',href:'evidence/Cryer-Future-Outlook-Source-Documents-2026-10-16/FY2025-Audited-Financial-Statements.pdf#page=97'})} · ${link({label:'Historical source calculations and qualifications',href:'evidence/index.html#reference-spending-growth'})}</p><p>Past spending reflects changes in staffing, services, benefits, contracts and grants. One-time costs and changes in cost categories may also affect these growth rates, so they do not measure inflation or recurring costs alone. Future amounts are assumptions; approvals and commitments remain unverified.</p></details>`;
   out+=`<details><summary>How is the utility reimbursement calculated?</summary><p>This amount is deducted once from gross spending and excluded from the funding line. Mapped shares are retained in the source calculations and cite the FY2027–FY2029 Water & Sewer and Stormwater allocation workpapers, page 1. The original allocation workpapers are not available in this review. It is not a new utility bill.</p>${table(r.utilityParts,r.utility,'Utility reimbursement')}${link({label:'Shared-cost source calculations',href:'evidence/index.html#reference-gf-methods'})}</details>`;
  }
  const capital=r.capitalDiscrepancy;
  const comparison=capital?`<p>Two pages of the <strong>same FY2027 Recommended Budget and Financial Plan</strong> show different FY2026 amounts for General Fund disaster-related capital:</p><ul><li><strong>Summary: ${cash(capital.summary.amount)}</strong><br>${link(capital.summary.source)}</li><li><strong>Appendix: ${cash(capital.appendix.amount)}</strong><br>${link(capital.appendix.source)}</li></ul><p><strong>Difference: ${cash(capital.summary.amount-capital.appendix.amount)}.</strong></p><p><strong>The chart uses the higher summary figure, ${cash(capital.summary.amount)}.</strong> It makes the capital components add to the General Fund’s published total of ${cash(r.spendingParts.find(p=>p.label==='Capital purchases').amount)}. The existing model follows that summary total. ${link(capital.controlSource)}</p><p>The General Fund-labeled appendix repeats the operating and capital line items in the Water & Sewer appendix, and its totals match that fund’s summary. ${link(capital.waterSewerAppendixSource)} · ${link(capital.waterSewerSource)} This suggests a possible copying or fund-label issue; it does not prove which General Fund amount is correct.</p><p>The correct amount and fund classification need clarification from the Town. No adjustment has been made to the chart.</p>`:'';
  if(r.notes.length||capital)out+=`<div class="gap-source-notes"><h3>${capital?'FY2026: two different capital amounts':r.year>=2030?'About this forecast':'About these figures'}</h3>${comparison}${r.notes.map(n=>`<p>${esc(n)}</p>`).join('')}</div>`;
  out+=`<p class="gap-source-note">Source links open separately, keeping this backup and your return to the chart in place. ${link({label:'Existing loan project and payment detail',href:`evidence/Cryer-General-Fund-Loan-Projects-Source-Links-2026-10-16.html?year=${r.year}`})}</p>`;
  $('#gap-backup-content').innerHTML=out;
 }
 function open(year,kind,from){window.townLedgerPeriod?.set(year);returnFocus=from;$('#gap-backup-year').value=year;$('#gap-backup-line').value=kind;render();hideTip();dialog.showModal();dialog.scrollTop=0;$('#gap-backup-title').focus({preventScroll:true});}
 $('[data-gap-close]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{hideTip();returnFocus?.focus({preventScroll:true});});
 for(const sel of ['#gap-backup-year','#gap-backup-line'])$(sel).addEventListener('change',render);
 const tip=document.createElement('div');tip.className='gap-point-tip';tip.id='gap-point-tip';tip.setAttribute('role','tooltip');tip.hidden=true;document.body.append(tip);
 let tipPoint=null;
 function hideTip(){tip.hidden=true;tipPoint?.point.removeAttribute('data-gap-active');tipPoint?.point.ownerSVGElement.removeAttribute('data-gap-near');tipPoint=null;}
 function showTip(point,r,kind){if(tipPoint?.point!==point)hideTip();tipPoint={point,r,kind};point.setAttribute('data-gap-active','');point.ownerSVGElement.setAttribute('data-gap-near','');tip.textContent=`FY${r.year} · ${label[kind]}: ${cash(r[kind])} · ${basis(r)}. Select for backup.`;tip.hidden=false;const b=point.getBoundingClientRect();tip.style.left=Math.max(8,Math.min(innerWidth-tip.offsetWidth-8,b.x+b.width/2-tip.offsetWidth/2))+'px';tip.style.top=Math.max(8,b.y-tip.offsetHeight-12)+'px';}
 document.addEventListener('keydown',e=>{if(e.key==='Escape')hideTip();});window.addEventListener('scroll',()=>{if(tipPoint&&document.activeElement===tipPoint.point&&!dialog.open)showTip(tipPoint.point,tipPoint.r,tipPoint.kind);else hideTip();},true);window.addEventListener('resize',hideTip);
 document.querySelectorAll('[data-gap-chart]').forEach((host,index)=>{
  const svg=host.querySelector('svg');if(!svg)return;
  // Preserve original paths, point positions and loan links; only add interaction.
  // A root SVG title produces a native generic tooltip everywhere, including near dots.
  // Retain its accessible name/description without competing with the value tooltip.
  const chartTitle=svg.querySelector(':scope > title'),chartDesc=svg.querySelector(':scope > desc');
  svg.setAttribute('role','group');svg.removeAttribute('aria-labelledby');svg.setAttribute('aria-label',`${chartTitle?.textContent||'General Fund chart'}. Select a Spending or Funding point for its dollar value and backup.`);
  if(chartDesc?.id)svg.setAttribute('aria-describedby',chartDesc.id);
  chartTitle?.remove();
  svg.querySelectorAll('title').forEach(title=>{if(!title.closest('a'))title.remove();});
  const pointData=[];
  for(const [kind,color] of [['spending','#bb5a0f'],['funding','#00899a']]){
   const points=[...svg.querySelectorAll(`circle[fill="${color}"][r="4.5"]`)];
   if(points.length!==D.rows.length)continue;
   points.forEach((point,i)=>{
    const r=D.rows[i];point.setAttribute('tabindex','0');point.setAttribute('role','button');point.setAttribute('data-gap-point',`${kind}-${r.year}`);point.setAttribute('aria-haspopup','dialog');point.setAttribute('aria-label',`FY${r.year} ${label[kind]}: ${cash(r[kind])}. ${basis(r)}. Show backup.`);point.setAttribute('aria-describedby','gap-point-tip');
    pointData.push({point,r,kind});
    point.addEventListener('focus',()=>{showTip(point,r,kind);requestAnimationFrame(()=>{if(document.activeElement===point&&!dialog.open)showTip(point,r,kind);});});point.addEventListener('blur',hideTip);point.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();open(r.year,kind,point);}});
   });
  }
  // Select the nearest dot within 18 screen pixels. Unlike overlapping enlarged
  // circles, this keeps both series reachable where Spending and Funding almost meet.
  function nearestPoint(event){
   if(dialog.open||event.target.closest('a'))return null;
   let nearest=null,distance=18;const m=svg.getScreenCTM();if(!m)return null;
   for(const item of pointData){const x=+item.point.getAttribute('cx'),y=+item.point.getAttribute('cy'),d=Math.hypot(event.clientX-(m.a*x+m.c*y+m.e),event.clientY-(m.b*x+m.d*y+m.f));if(d<distance){nearest=item;distance=d;}}
   return nearest;
  }
  svg.addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;const item=nearestPoint(event);if(item)showTip(item.point,item.r,item.kind);else hideTip();});
  svg.addEventListener('pointerleave',hideTip);
  svg.addEventListener('click',event=>{const item=nearestPoint(event);if(item)open(item.r.year,item.kind,item.point);});
  const lookup=document.createElement('div');lookup.className='gap-lookup';lookup.innerHTML=`<div><strong>See the numbers behind either line</strong><p>Hover or focus a dot for its value. Select a dot, or choose a year here, for components and source records.</p></div><label for="gap-lookup-year-${index}">Fiscal year<select id="gap-lookup-year-${index}">${D.rows.map(r=>`<option value="${r.year}"${r.year===2039?' selected':''}>FY${r.year}</option>`).join('')}</select></label><button type="button" data-kind="spending">Spending detail</button><button type="button" data-kind="funding">Funding detail</button>`;
  const figure=host.closest('figure'),projects=figure?.querySelector('.debt-link-panel');
  if(projects){
   lookup.className='debt-link-panel gap-lookup-projects';
   const controls=document.createElement('div');controls.className='gap-lookup-controls';
   controls.append(...lookup.querySelectorAll('label,button'));lookup.append(controls);
   lookup.querySelectorAll('button').forEach(button=>button.classList.add('debt-link'));
   projects.after(lookup);
  }else (figure||host).after(lookup);
  lookup.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>open(+lookup.querySelector('select').value,b.dataset.kind,b)));
 });
})();
