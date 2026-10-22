(() => {
 'use strict';
 const $=id=>document.getElementById(id),D=window.townLedgerPreviewData;
 const gf='Cryer-Future-Outlook-General-Fund-Source-Links-2026-10-16.html',ws='Cryer-Future-Outlook-Utilities-Source-Links-2026-10-16.html',loan='Cryer-General-Fund-Loan-Projects-Source-Links-2026-10-16.html';
 const chapters={welcome:['Welcome','index.html#welcome'],pay:['What do I pay?','index.html#relationships'],future:['Future Outlook',gf],money:['Follow the money','index.html#gf-revenue'],who:['Who pays?','who-pays/Who_Pays_Preview_v7_2026-10-19.html'],funding:['Where does funding come from?','index.html#revenue'],services:['What does it pay for?','index.html#services'],projects:['Projects, capital & debt','index.html#projects']};
 const secondary={priorities:'index.html#priorities','budget-process':'index.html#reference-budget-process',records:'index.html#records',reference:'index.html#reference',summary:'index.html#cryer-summary',changes:'index.html#what-changed','shared-costs':'index.html#flows','who-sources':'who-pays/References_v7_2026-10-19.html','loan-projects':loan,'loan-rail':loan+'#loan-a','loan-fire':loan+'#loan-b','loan-north':loan+'#loan-c','loan-ladder':loan+'#loan-d','loan-south':loan+'#loan-e'};
 const files=new Set(['index.html',gf,ws,loan,'Cryer-Water-Sewer-Loan-Projects-Source-Links-2026-10-16.html','source-notes.html','who-pays/Who_Pays_Preview_v7_2026-10-19.html','who-pays/References_v7_2026-10-19.html']);
 const evidence=new URL('evidence/',location.href),frame=$('detail-frame');
 let lastView='',pendingView=null,handledHash=location.hash,example=true;
 const selection={taxCase:'constant_receipts_share',gfCase:'historical_seven_year_mapped_utility',utilityCase:'historical_rate_growth',year:2039};
 const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
 function household(){return {home:$('home-value').value.trim().replace(/,/g,''),location:$('home-location').value,services:'both',gallons:'4000',example};}
 function renderBill(){
  const h=household(),now=window.townLedgerBill(h,D['quick-data'].rates),future=window.cryerHouseholdImpact.compute(D['household-utility-data'],h,selection);
  $('home-note').textContent=example?'Example home. Change the value to see your share.':'Uses your taxable value. Nothing is sent or published.';
  $('home-value').disabled=h.location==='outside';
  if(future.status==='outside'){
   $('current-tax').textContent='$0';$('future-tax').textContent='$0';$('bill-message').textContent='A property outside Town limits does not owe Hillsborough Town property tax. This scenario adds no Town property tax to it. Applicable County taxes and utility charges remain separate.';$('bill-breakdown').textContent='The Town property-tax share calculation does not apply to outside-Town property.';return;
  }
  if(now.error||future.status!=='ready'){
   $('current-tax').textContent='—';$('future-tax').textContent='—';$('bill-message').textContent='Enter a taxable home value of zero or more. A blank or invalid entry is not a zero tax bill.';$('bill-breakdown').textContent='No tax estimate is calculated until the input is valid.';return;
  }
  $('current-tax').textContent=money(now.tax);$('future-tax').textContent=money(future.total);
  $('bill-message').textContent='This scenario assumes your share of Town tax collections stays fixed and property taxes cover the entire annual gap. It is not an adopted bill. County taxes and utility charges are separate.';
  $('bill-breakdown').textContent=`FY2039: ${money(future.baseline)} before filling the gap + ${money(future.gapShare)} toward that year’s shortfall = ${money(future.total)} in annual Town property tax. The calculation uses only the FY2039 annual gap of ${money(future.annualGap)}, not the cumulative shortfall.`;
 }
 $('bill-form').addEventListener('submit',e=>e.preventDefault());
 for(const id of ['home-value','home-location'])$(id).addEventListener(id==='home-value'?'input':'change',()=>{example=false;renderBill();});
 function closeMenu(focus=false){$('chapter-nav').classList.remove('is-open');$('menu-toggle').setAttribute('aria-expanded','false');if(focus)$('menu-toggle').focus();}
 $('menu-toggle').addEventListener('click',()=>{const open=$('chapter-nav').classList.toggle('is-open');$('menu-toggle').setAttribute('aria-expanded',String(open));});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu(true);});
 window.addEventListener('resize',()=>{if(innerWidth>900)closeMenu();});
 function allowed(view){try{const u=new URL(view,evidence);return u.href.startsWith(evidence.href)&&files.has(decodeURIComponent(u.pathname.slice(evidence.pathname.length)));}catch{return false;}}
 function sameDocumentAndAnchor(a,b){const x=new URL(a,evidence),y=new URL(b,evidence);return x.pathname===y.pathname&&x.hash===y.hash;}
 function classify(view){
  const u=new URL(view,evidence),file=decodeURIComponent(u.pathname.slice(evidence.pathname.length)),route=decodeURIComponent(u.hash.slice(1));
  if(file==='index.html'&&route==='welcome')return 'welcome';
  if(file.includes('Loan-Projects'))return 'projects';
  if(file.includes('Future-Outlook'))return 'future';
  if(file.startsWith('who-pays/'))return 'who';
  if(['relationships','opening','map'].includes(route))return 'pay';
  if(route.startsWith('gf-revenue'))return 'money';
  if(['revenue','gf-audit-revenue','gf-budgetary-revenue','ws-revenue','sw-revenue','reference-revenue'].includes(route))return 'funding';
  if(['services','gf-categories','utilities','ws','sw','stormwater-notes','gf-overview'].includes(route)||route.startsWith('gf-service-')||route==='gf-safety')return 'services';
  if(/^(capital|projects|master-|annual-capital|vehicles|choices|register|debt|hh-capital|reference-project|reference-capital)/.test(route))return 'projects';
  if(/^(longer-outlook|gf-outlook|reference-gf|reference-one-home|reference-spending|reference-period|reference-rates|reference-calculation|ps-funding|capital-schedule)/.test(route))return 'future';
  return null;
 }
 function mark(chapter){if(chapter==='pay'||chapter==='future')chapter='brief';document.querySelectorAll('[data-chapter]').forEach(a=>{if(a.dataset.chapter===chapter)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});}
 function displayDetail(view,setSrc=true){
  const target=new URL(view,evidence);
  if(target.pathname===new URL('index.html',evidence).pathname&&['#gf-outlook','#gf-classic-overview'].includes(target.hash))view=gf;
  if(!allowed(view))return false;
  const chapter=classify(view),route=new URL(view,evidence).hash.slice(1);
  document.body.classList.toggle('welcome-open',chapter==='welcome');
  $('brief-view').hidden=true;$('detail-view').hidden=false;document.body.classList.add('details-open');
  $('detail-label').textContent=chapter?chapters[chapter][0]:D['route-data'][route]?.title||'Sources & supporting detail';
  $('open-detail').href=new URL(view,evidence).href;mark(chapter);closeMenu();window.scrollTo(0,0);
  if(setSrc&&view!==lastView){pendingView=view;lastView=view;frame.src=new URL(view,evidence).href;}
  else if(setSrc&&!pendingView&&chapter!=='welcome')frame.contentWindow.postMessage({channel:'town-ledger-local-preview',type:'household',household:household()},'*');
  document.title='Town Ledger · '+$('detail-label').textContent;return true;
 }
 function route(){
  handledHash=location.hash;
  const hash=location.hash.slice(1)||'welcome';
  if(chapters[hash])return displayDetail(chapters[hash][1]);
  if(hash==='overview')return displayDetail(gf);
  if(['gf-outlook','gf-classic-overview'].includes(hash))return displayDetail(gf);
  if(D['route-data'][hash])return displayDetail('index.html#'+hash);
  if(hash.startsWith('detail=')&&secondary[hash.slice(7)])return displayDetail(secondary[hash.slice(7)]);
  if(hash.startsWith('view=')){try{if(displayDetail(decodeURIComponent(hash.slice(5))))return;}catch{}}
  pendingView=null;$('brief-view').hidden=false;$('detail-view').hidden=true;document.body.classList.remove('details-open','welcome-open');mark('brief');closeMenu();document.title='Town Ledger · The Big Picture';
  if(hash==='sources')$('sources').open=true;
  requestAnimationFrame(()=>{positionGraph();if(['options','option-choices','participate','project-choices','sources','personal-bill'].includes(hash))$(hash).scrollIntoView({block:'start'});else window.scrollTo(0,0);});
 }
 window.addEventListener('hashchange',route);
 document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a&&a.hash===location.hash){e.preventDefault();route();}});
 window.addEventListener('message',event=>{
  if(event.source!==frame.contentWindow||event.data?.channel!=='town-ledger-local-preview')return;
  if($('detail-view').hidden||location.hash!==handledHash)return;
  const message=event.data;
  if(message.type==='overview'){location.hash='brief';return;}
  if(pendingView){
   if(!['ready','route'].includes(message.type)||!allowed(message.view)||!sameDocumentAndAnchor(message.view,pendingView))return;
   pendingView=null;
  }
  if(message.type==='navigate'&&allowed(message.view)){location.hash='view='+encodeURIComponent(message.view);}
  if(message.type==='ready'){
   if(allowed(message.view)&&message.view!==lastView){lastView=message.view;history.replaceState(null,'','#view='+encodeURIComponent(message.view));handledHash=location.hash;displayDetail(message.view,false);}
   if(classify(message.view)!=='welcome')frame.contentWindow.postMessage({channel:'town-ledger-local-preview',type:'household',household:household()},'*');
  }
  if(message.type==='route'&&allowed(message.view)&&message.view!==lastView){lastView=message.view;history.pushState(null,'','#view='+encodeURIComponent(message.view));handledHash=location.hash;displayDetail(message.view,false);}
  if(message.type==='household'&&message.household&&['inside','outside'].includes(message.household.location)&&typeof message.household.home==='string'){
   $('home-value').value=message.household.home;$('home-location').value=message.household.location;example=message.household.example===true;renderBill();
  }
 });
 // Show the annual gap first when the unchanged chart needs horizontal scrolling.
 const graph=document.querySelector('.graph-scroll');
 function positionGraph(){if(graph&&graph.clientWidth){graph.scrollLeft=graph.scrollWidth-graph.clientWidth;$('graph-scroll-hint').hidden=graph.scrollWidth<=graph.clientWidth;}}
 requestAnimationFrame(positionGraph);
 window.addEventListener('resize',()=>{if(!$('brief-view').hidden)positionGraph();});
 graph?.addEventListener('scroll',()=>{$('graph-scroll-hint').textContent=graph.scrollLeft>10?'Swipe or scroll left for the earlier years.':'Swipe or scroll right to see the FY2039 gap.';},{passive:true});
 renderBill();route();
})();
