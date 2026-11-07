/* On-screen explanation only; the scenario's data and calculations are unchanged. */
(() => {
 'use strict';
 const charts=[...document.querySelectorAll('[data-gap-chart]')];
 const growth=window.townLedgerGapDetailData?.growth;
 if(!charts.length||!growth)return;
 const percent=rate=>(rate*100).toFixed(2)+'%';
 const dialog=document.createElement('dialog');
 dialog.id='scenario-assumptions';
 dialog.className='scenario-assumptions';
 dialog.setAttribute('aria-labelledby','scenario-assumptions-title');
 dialog.setAttribute('aria-describedby','scenario-assumptions-intro');
 dialog.innerHTML=`
  <header class="scenario-assumptions-header">
   <div><p>FY2030–FY2039 · TOWN LEDGER SCENARIO</p><h2 id="scenario-assumptions-title" tabindex="-1">What is this scenario based on?</h2></div>
   <button type="button" data-scenario-close aria-label="Close scenario assumptions">Close <span aria-hidden="true">×</span></button>
  </header>
  <div class="scenario-assumptions-body">
   <p id="scenario-assumptions-intro">The scenario extends FY2029 values from the saved Town recommended budget. <strong>It is an illustration, not an adopted Town budget.</strong> These annual growth assumptions compound through FY2039.</p>
   <dl class="scenario-assumptions-rates">
    <div><dt>Personnel <strong>${percent(growth.personnel.cagr)} a year</strong></dt><dd>Based on compound growth between FY2018 and FY2025 audited personnel spending: seven annual intervals.</dd></div>
    <div><dt>Eligible operations <strong>${percent(growth.operating.selected_cagr)} a year</strong></dt><dd>Based on the same seven-year calculation for selected operating costs, after removing identified FY2025 disaster costs. Fire and certain other items are modeled separately.</dd></div>
    <div><dt>Orange Rural Fire <strong>5.00% a year</strong></dt><dd>Extends the approximately 5.00% annual increases in the Town’s FY2027–FY2029 recommended plan. Continuing that pattern after FY2029 is a Town Ledger assumption, subject to future funding decisions.</dd></div>
    <div><dt>Capital purchases <strong>3.00% a year</strong></dt><dd>A Town Ledger allowance for growth from the FY2029 purchase base. The saved model does not document a separately verified forecast basis for this rate.</dd></div>
    <div><dt>Property-tax receipts <strong>2.00% a year</strong></dt><dd>Rounds the Town plan’s approximately 1.81% compound annual growth in property-tax receipts from FY2026 to FY2029 to 2.00%. Continuing it through FY2039 is a scenario assumption. This is growth in receipts, not a 2.00% increase in the tax rate.</dd></div>
    <div><dt>Most other revenue <strong>Held flat</strong></dt><dd>Most other receipts and incoming transfers stay at FY2029 dollar levels. This is a continuation assumption, not a guarantee.</dd></div>
   </dl>
   <p class="scenario-assumptions-caution"><strong>Historical growth is not inflation alone.</strong> It can include staffing, benefits, service changes, contracts, one-time costs and changes in reporting categories. Extending those rates does not establish that the same growth will recur.</p>
   <p class="scenario-assumptions-scope">The chart also retains scheduled loan payments, project and reserve transfers, and utility reimbursements. Funding gaps are before additional use of savings.</p>
   <details class="scenario-assumptions-sources"><summary>Basis in the saved records</summary><p>Historical rates: original FY2018 audit, Schedule 1, printed pp.73–76 / PDF pp.93–96, and FY2025 audit, Schedule 1, printed pp.74–77 / PDF pp.97–100. These are the retained model’s audited category endpoints; the original FY2018 PDF is not available in this review.</p><p>Fire planning pattern: FY2027 Recommended Budget and Financial Plan, Fire Protection, printed p.255 / PDF p.256: $2,070,763 in FY2027, $2,174,301 in FY2028 and $2,283,016 in FY2029. The 3.00% capital rate is a retained allowance without a separately verified forecast basis.</p><p>Property-tax planning basis: the same budget, General Fund financial summary, printed p.20 / PDF p.21: $12,319,376 in FY2026 estimated receipts and $13,000,000 in FY2029 projected receipts. Their compound annual growth over three intervals is approximately 1.81%, rounded to 2.00% in the scenario. Extending that rate after FY2029 is not a verified Town forecast.</p></details>
  </div>`;
 document.body.append(dialog);
 let opener=null;
 dialog.querySelector('[data-scenario-close]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
 dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const first=dialog.querySelector('[data-scenario-close]'),last=dialog.querySelector('summary');
  if(event.shiftKey&&(document.activeElement===first||document.activeElement===dialog.querySelector('h2'))){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 });
 dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const box=dialog.getBoundingClientRect();
  if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();
 });
 charts.forEach(host=>{
  const figure=host.closest('figure');if(!figure)return;
  const launcher=document.createElement('div');launcher.className='scenario-assumptions-launcher';
  launcher.innerHTML='<button type="button" aria-haspopup="dialog" aria-controls="scenario-assumptions">Assumptions at a glance</button><span>FY2030–FY2039</span>';
  const scroll=figure.querySelector('.graph-scroll,.chart-scroll');
  if(scroll)scroll.before(launcher);else figure.prepend(launcher);
  launcher.querySelector('button').setAttribute('data-scenario-assumptions','');
 });
 document.querySelectorAll('[data-scenario-assumptions]').forEach(button=>{
  button.addEventListener('click',event=>{
   opener=event.currentTarget;
   if(dialog.open)return;
   dialog.showModal();dialog.scrollTop=0;
   dialog.querySelector('h2').focus({preventScroll:true});
  });
 });
})();
