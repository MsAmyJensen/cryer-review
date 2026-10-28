(() => {
 'use strict';
 const $=id=>document.getElementById(id),D=window.townLedgerPreviewData;
 const gf='Cryer-Future-Outlook-General-Fund-Source-Links-2026-10-16.html',ws='Cryer-Future-Outlook-Utilities-Source-Links-2026-10-16.html',loan='Cryer-General-Fund-Loan-Projects-Source-Links-2026-10-16.html';
 const chapters={welcome:['Welcome','welcome.html'],pay:['What do I pay?','index.html#relationships'],future:['Future Outlook',gf],money:['Follow the money','index.html#gf-revenue'],who:['Who pays?','who-pays/Who_Pays_Preview_v7_2026-10-19.html'],funding:['Where does funding come from?','index.html#revenue'],services:['What does it pay for?','index.html#services'],projects:['Projects, capital & debt','index.html#projects']};
 const secondary={priorities:'index.html#priorities','budget-process':'index.html#reference-budget-process',records:'index.html#records',reference:'index.html#reference',summary:'index.html#cryer-summary',changes:'index.html#what-changed','shared-costs':'index.html#flows','who-sources':'who-pays/References_v7_2026-10-19.html','loan-projects':loan,'loan-rail':loan+'#loan-a','loan-fire':loan+'#loan-b','loan-north':loan+'#loan-c','loan-ladder':loan+'#loan-d','loan-south':loan+'#loan-e'};
 const participationAliases={engage:'engage',priorities:'engage',participate:'engage','detail=priorities':'engage',impact:'impact','cryer-summary':'impact','what-changed':'impact','detail=summary':'impact','detail=changes':'impact'};
 const files=new Set(['index.html','welcome.html',gf,ws,loan,'Cryer-Water-Sewer-Loan-Projects-Source-Links-2026-10-16.html','source-notes.html','who-pays/Who_Pays_Preview_v7_2026-10-19.html','who-pays/References_v7_2026-10-19.html']);
 const evidence=new URL('evidence/',location.href),frame=$('detail-frame');
 let lastView='',readyView=null,pendingView=null,loadTimer=null,handledHash=location.hash,routeFromHash=null,example=true;
 const selection={taxCase:'constant_receipts_share',gfCase:'historical_seven_year_mapped_utility',utilityCase:'historical_rate_growth',year:2039};
 const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
 function household(){return {home:$('home-value').value.trim().replace(/,/g,''),location:$('home-location').value,services:'both',gallons:'4000',example};}
 // Carry only the calculator input within this tab. Never send it to a server.
 const householdKey='town-ledger-household:'+new URL('.',location.href).href;
 function storedHousehold(key,legacy=false){
  try{const saved=JSON.parse(sessionStorage.getItem(key)||'null'),h=saved?.household||saved;
   if(!h||typeof h.home!=='string'||h.home.length>1000||!['inside','outside'].includes(h.location)||typeof h.example!=='boolean'||(legacy&&h.example))return null;
   return h;
  }catch{return null;}
 }
 function restoreHousehold(){
  const saved=storedHousehold(householdKey)||storedHousehold('cryer-review-household:'+evidence.href,true)||storedHousehold('cryer-review-household:'+new URL('.',location.href).href,true);
  if(saved){$('home-value').value=saved.home;$('home-location').value=saved.location;example=saved.example;}
 }
 function saveHousehold(){try{sessionStorage.setItem(householdKey,JSON.stringify({home:$('home-value').value,location:$('home-location').value,example}));}catch{/* The calculator still works when browser storage is unavailable. */}}
 function renderBill(){
  const h=household(),now=window.townLedgerBill(h,D['quick-data'].rates),future=window.cryerHouseholdImpact.compute(D['household-utility-data'],h,selection);
  $('home-note').textContent=example?'Example value: $400,000. Replace it with your taxable home value.':'Uses your entry. Nothing is sent or published.';
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
 for(const id of ['home-value','home-location'])$(id).addEventListener(id==='home-value'?'input':'change',()=>{if(id==='home-value')example=false;saveHousehold();renderBill();});
 function closeMenu(focus=false){$('chapter-nav').classList.remove('is-open');$('menu-toggle').setAttribute('aria-expanded','false');if(focus)$('menu-toggle').focus();}
 $('menu-toggle').addEventListener('click',()=>{const open=$('chapter-nav').classList.toggle('is-open');$('menu-toggle').setAttribute('aria-expanded',String(open));});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu(true);});
 window.addEventListener('resize',()=>{if(innerWidth>900)closeMenu();});
 function allowed(view){try{const u=new URL(view,evidence);return u.href.startsWith(evidence.href)&&files.has(decodeURIComponent(u.pathname.slice(evidence.pathname.length)));}catch{return false;}}
 // The embedded page has its own visit history. Keep an outer return route
 // for budget-process visits that begin in ENGAGE, IMPACT or the overview.
 function budgetView(view){try{const u=new URL(view,evidence);return u.pathname===new URL('index.html',evidence).pathname&&u.hash==='#reference-budget-process';}catch{return false;}}
 function safeReturnHash(hash){
  if(typeof hash!=='string'||!hash.startsWith('#'))return null;
  const key=hash.slice(1);
  if(key==='detail=budget-process'||key==='reference-budget-process')return null;
  if(key.startsWith('view=')){try{const view=decodeURIComponent(key.slice(5));return allowed(view)&&!budgetView(view)?hash:null;}catch{return null;}}
  return chapters[key]||participationAliases[key]||D['route-data'][key]||['brief','options','option-choices','sources','project-choices','personal-bill','signup-title','overview','gf-outlook','gf-classic-overview'].includes(key)||(key.startsWith('detail=')&&secondary[key.slice(7)])?hash:null;
 }
 function budgetReturn(){return safeReturnHash(history.state?.townLedgerBudgetReturn)||'#brief';}
 function rememberBudgetReturn(){const hash=safeReturnHash(history.state?.townLedgerBudgetReturn)||safeReturnHash(routeFromHash)||'#brief';history.replaceState({...history.state,townLedgerBudgetReturn:hash},'');}
 function sendBudgetBackContext(){
  if(!budgetView(lastView)||$('detail-view').hidden)return;
  const key=budgetReturn().slice(1),section=participationAliases[key];
  const label=section==='engage'?'ENGAGE — Your budget priorities':section==='impact'?'IMPACT — From your input to action':chapters[key]?.[0]||(['brief','options','option-choices','sources','project-choices','personal-bill','signup-title'].includes(key)?'The Big Picture':'the previous page');
  frame.contentWindow.postMessage({channel:'town-ledger-local-preview',type:'back-context',view:lastView,label:'Return to '+label},'*');
 }
 function sameDocumentAndAnchor(a,b){const x=new URL(a,evidence),y=new URL(b,evidence);return x.pathname===y.pathname&&x.hash===y.hash;}
 function frameIsAt(view){try{return frame.contentWindow.location.href===new URL(view,evidence).href;}catch{return false;}}
 function classify(view){
  const u=new URL(view,evidence),file=decodeURIComponent(u.pathname.slice(evidence.pathname.length)),route=decodeURIComponent(u.hash.slice(1));
  if(file==='welcome.html'||file==='index.html'&&route==='welcome')return 'welcome';
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
 function clearLoadState(){clearTimeout(loadTimer);loadTimer=null;$('detail-error').hidden=true;frame.removeAttribute('aria-busy');}
 function showLoadNotice(failed){
  if(!pendingView||$('detail-view').hidden)return;
  $('detail-error-title').textContent=failed?'This page did not load.':'This page is taking longer than expected.';
  $('detail-error-message').textContent=failed?(['127.0.0.1','localhost'].includes(location.hostname)?'The local preview may have stopped. Open “Start Town Ledger.command” in the preview folder, then choose Try again.':'Please try opening the page again. You can also return to The Big Picture.'):'You can keep waiting, try again, or return to The Big Picture.';
  $('detail-error').hidden=false;
  if(failed){clearTimeout(loadTimer);loadTimer=null;frame.removeAttribute('aria-busy');}
 }
 function loadFailed(){showLoadNotice(true);}
 $('detail-retry').addEventListener('click',()=>displayDetail(lastView,true,true));
 frame.addEventListener('error',loadFailed);
 function showParticipation(section){
  pendingView=null;clearLoadState();$('brief-view').hidden=true;$('detail-view').hidden=true;$('participation-view').hidden=false;document.body.classList.remove('details-open','welcome-open');mark(section==='engage'?'priorities':'impact');closeMenu();document.title='Town Ledger · '+(section==='engage'?'Your budget priorities':'From your input to action');
  document.querySelectorAll('.participation-nav a').forEach(a=>{if(a.hash==='#'+section)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  requestAnimationFrame(()=>{const target=$(section);if(section==='engage')window.scrollTo(0,0);else target.scrollIntoView({block:'start'});target.querySelector('h1,h2').focus({preventScroll:true});});return true;
 }
 function displayDetail(view,setSrc=true,force=false){
  const target=new URL(view,evidence);
  const participation=target.pathname===new URL('index.html',evidence).pathname?participationAliases[target.hash.slice(1)]:null;
  if(participation){history.replaceState(null,'','#'+participation);handledHash=location.hash;return showParticipation(participation);}
  if(setSrc&&target.pathname===new URL('index.html',evidence).pathname&&target.hash==='#welcome')view='welcome.html';
  if(target.pathname===new URL('index.html',evidence).pathname&&['#gf-outlook','#gf-classic-overview'].includes(target.hash))view=gf;
  if(!allowed(view))return false;
  if(budgetView(view))rememberBudgetReturn();
  const chapter=classify(view),route=new URL(view,evidence).hash.slice(1);
  document.body.classList.toggle('welcome-open',chapter==='welcome');
  $('participation-view').hidden=true;$('brief-view').hidden=true;$('detail-view').hidden=false;document.body.classList.add('details-open');
  $('detail-label').textContent=chapter?chapters[chapter][0]:D['route-data'][route]?.title||'Sources & supporting detail';
  $('open-detail').href=new URL(view,evidence).href;mark(['priorities','cryer-summary'].includes(route)?'priorities':chapter);closeMenu();window.scrollTo(0,0);
  if(setSrc&&(force||view!==lastView||view!==readyView||!frameIsAt(view)||!$('detail-error').hidden)){
   clearLoadState();readyView=null;pendingView=view;lastView=view;frame.removeAttribute('data-view-ready');frame.setAttribute('aria-busy','true');loadTimer=setTimeout(()=>showLoadNotice(false),12000);
   // The parent route already records this visit. Replacing the child location
   // avoids an extra joint-history entry for the same reader action.
   const href=new URL(view,evidence).href;
   try{if(frameIsAt(view))frame.contentWindow.location.reload();else if(frame.contentWindow.location.origin===location.origin)frame.contentWindow.location.replace(href);else frame.src=href;}catch{frame.src=href;}
  }
  else if(setSrc&&!pendingView&&chapter!=='welcome')frame.contentWindow.postMessage({channel:'town-ledger-local-preview',type:'household',household:household()},'*');
  if(budgetView(view)){const section=participationAliases[budgetReturn().slice(1)];if(section)mark(section==='engage'?'priorities':'impact');sendBudgetBackContext();}
  document.title=chapter==='welcome'?'Town Ledger · Inform. Empower. Impact.':'Town Ledger · '+$('detail-label').textContent;return true;
 }
 function route(){
  routeFromHash=handledHash;handledHash=location.hash;
  const hash=location.hash.slice(1)||'welcome';
  if(participationAliases[hash]){const section=participationAliases[hash];if(hash!==section)history.replaceState(null,'','#'+section);handledHash=location.hash;return showParticipation(section);}
  if(chapters[hash])return displayDetail(chapters[hash][1]);
  if(hash==='overview')return displayDetail(gf);
  if(['gf-outlook','gf-classic-overview'].includes(hash))return displayDetail(gf);
  if(D['route-data'][hash])return displayDetail('index.html#'+hash);
  if(hash.startsWith('detail=')&&secondary[hash.slice(7)])return displayDetail(secondary[hash.slice(7)]);
  if(hash.startsWith('view=')){try{if(displayDetail(decodeURIComponent(hash.slice(5))))return;}catch{}}
  pendingView=null;clearLoadState();$('participation-view').hidden=true;$('brief-view').hidden=false;$('detail-view').hidden=true;document.body.classList.remove('details-open','welcome-open');mark(['options','option-choices'].includes(hash)?'options':'brief');closeMenu();document.title='Town Ledger · The Big Picture';
  if(hash==='sources')$('sources').open=true;
  requestAnimationFrame(()=>{positionGraph();if(['options','option-choices','participate','project-choices','sources','personal-bill','signup-title'].includes(hash))$(hash).scrollIntoView({block:'start'});else window.scrollTo(0,0);});
 }
 window.addEventListener('hashchange',route);
 document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a&&a.hash===location.hash){e.preventDefault();route();}});
 window.addEventListener('message',event=>{
  if(event.source!==frame.contentWindow||event.data?.channel!=='town-ledger-local-preview')return;
  if($('detail-view').hidden||location.hash!==handledHash)return;
  const message=event.data;
  if(message.type==='participation'&&['engage','impact'].includes(message.section)){location.hash=message.section;return;}
  if(message.type==='overview'){location.hash='brief';return;}
  if(pendingView){
   if(!['ready','route'].includes(message.type)||!allowed(message.view)||!sameDocumentAndAnchor(message.view,pendingView))return;
   // Reveal only the requested view after its shared navigation bridge is ready.
   readyView=lastView;pendingView=null;clearLoadState();frame.setAttribute('data-view-ready','');
  }
  if(message.type==='back'&&budgetView(lastView)&&budgetView(message.view)&&sameDocumentAndAnchor(message.view,lastView)){location.hash=budgetReturn();return;}
  if(message.type==='navigate'&&allowed(message.view)){location.hash='view='+encodeURIComponent(message.view);}
  if(message.type==='ready'){
   sendBudgetBackContext();
   if(allowed(message.view)&&message.view!==lastView){lastView=message.view;history.replaceState(null,'','#view='+encodeURIComponent(message.view));handledHash=location.hash;displayDetail(message.view,false);}
   if(classify(message.view)!=='welcome')frame.contentWindow.postMessage({channel:'town-ledger-local-preview',type:'household',household:household()},'*');
  }
  if(message.type==='route'&&allowed(message.view)&&message.view!==lastView){routeFromHash=handledHash;readyView=message.view;lastView=message.view;history.pushState(null,'','#view='+encodeURIComponent(message.view));handledHash=location.hash;displayDetail(message.view,false);}
  if(message.type==='household'&&message.household&&['inside','outside'].includes(message.household.location)&&typeof message.household.home==='string'){
   $('home-value').value=message.household.home;$('home-location').value=message.household.location;example=message.household.example===true;saveHousehold();renderBill();
  }
 });
 // Show the annual gap first when the unchanged chart needs horizontal scrolling.
 const graph=document.querySelector('.graph-scroll');
 function positionGraph(){if(graph&&graph.clientWidth){graph.scrollLeft=graph.scrollWidth-graph.clientWidth;$('graph-scroll-hint').hidden=graph.scrollWidth<=graph.clientWidth;}}
 requestAnimationFrame(positionGraph);
 window.addEventListener('resize',()=>{if(!$('brief-view').hidden)positionGraph();});
 graph?.addEventListener('scroll',()=>{$('graph-scroll-hint').textContent=graph.scrollLeft>10?'Swipe or scroll left for the earlier years.':'Swipe or scroll right to see the FY2039 gap.';},{passive:true});
 restoreHousehold();saveHousehold();renderBill();route();
 document.documentElement.classList.remove('route-starting');
})();
