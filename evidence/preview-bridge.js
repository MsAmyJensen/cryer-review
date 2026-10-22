/* Keep detailed reviewer pages inside the shared Town Ledger navigation. */
(() => {
 'use strict';
 if(window.parent===window){const a=document.createElement('a');a.href=new URL('../index.html#brief',document.currentScript.src).href;a.textContent='← The Big Picture';a.style.cssText='display:inline-block;margin:16px 20px;font:600 14px system-ui;color:#19364b';document.body.prepend(a);return;}
 const root=new URL('./',document.currentScript.src),channel='town-ledger-local-preview';
 document.documentElement.classList.add('town-ledger-framed-preview');
 const style=document.createElement('style');style.textContent=`
 .town-ledger-framed-preview .top,.town-ledger-framed-preview #site-menu,.town-ledger-framed-preview #overview-site-menu,.town-ledger-framed-preview #overview-menu-toggle{display:none!important}
 .town-ledger-framed-preview body{margin-left:0!important;padding-left:0!important;padding-top:0!important}
 .town-ledger-framed-preview .workspace{display:block!important;height:100dvh!important;min-height:0!important}
 .town-ledger-framed-preview .stage{height:100dvh!important;border:0!important;border-radius:0!important}
 .town-ledger-framed-preview .context{display:none!important}
 .town-ledger-framed-preview .screen{border:0!important;border-radius:0!important}
 .town-ledger-framed-preview .cryer-overview-layout{display:block!important}
 .town-ledger-framed-preview .cryer-overview-sidebar{display:none!important}
 .town-ledger-framed-preview .strip,.town-ledger-framed-preview header>.brand{display:none!important}
 .town-ledger-framed-preview .wrap>header{justify-content:flex-end;padding:18px 0}
 .town-ledger-framed-preview .wrap{max-width:1280px!important}
 .town-ledger-framed-preview body[data-route="welcome"] .preview-period{display:none!important}
 .preview-period{background:#f2f4ef;border-bottom:1px solid #d8dfdc;padding:8px 20px;font:12px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#19364b;flex:none}
 .preview-period summary{cursor:pointer;font-weight:600}.preview-period .period-picker{padding:10px 0!important;margin:0!important;border:0!important;max-width:700px}
 .preview-period #period-edit{display:flex;gap:15px;flex-wrap:wrap;align-items:start}.preview-period label{max-width:210px}.preview-period select{font-size:12px;padding:6px}
 .preview-period .period-title,.preview-period #period-help{font-size:11px}.preview-period .period-range{display:flex;gap:10px}
 @media(max-width:650px){.town-ledger-framed-preview .wrap{padding-left:18px!important;padding-right:18px!important}.preview-period{padding:8px 14px}}
 `;document.head.appendChild(style);
 const period=document.querySelector('#site-menu .period-picker'),stage=document.querySelector('.stage');
 if(period&&stage){const details=document.createElement('details');details.className='preview-period';const summary=document.createElement('summary');summary.textContent='Years & range';details.append(summary,period);stage.prepend(details);}
 function post(type,values={}){parent.postMessage({channel,type,...values},'*');}
 function view(){const u=new URL(location.href);return decodeURIComponent(u.pathname.slice(root.pathname.length))+u.search+u.hash;}
 function household(){const home=document.getElementById('hh-home')||document.getElementById('review-household-home'),location=document.getElementById('hh-location')||document.getElementById('review-household-location');return home&&location?{home:home.value.replace(/,/g,''),location:location.value,example:false}:null;}
 document.addEventListener('click',event=>{
  const a=event.target.closest('a[href]');if(!a||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||a.target==='_blank')return;
  const url=new URL(a.href,location.href);
  if(url.pathname===new URL('index.html',root).pathname&&['#gf-outlook','#gf-classic-overview'].includes(url.hash)){event.preventDefault();event.stopImmediatePropagation();post('navigate',{view:'Cryer-Future-Outlook-General-Fund-Source-Links-2026-10-16.html'});return;}
  if(document.body.dataset.route==='welcome'&&url.pathname===location.pathname&&url.hash==='#relationships'){event.preventDefault();event.stopImmediatePropagation();post('overview');return;}
  if(url.href.startsWith(root.href)&&url.pathname!==location.pathname&&url.pathname.endsWith('.html')){
   const h=household();if(h)post('household',{household:h});event.preventDefault();event.stopImmediatePropagation();post('navigate',{view:decodeURIComponent(url.pathname.slice(root.pathname.length))+url.search+url.hash});
  }
 },true);
 window.addEventListener('hashchange',()=>{
  const route=decodeURIComponent(location.hash.slice(1));
  if(window.cryerReview?.routes[route]&&document.body.dataset.route!==route)window.cryerReview.show(route);
  setTimeout(()=>post('route',{view:view()}),0);
 });
 window.addEventListener('cryer:route',()=>setTimeout(()=>post('route',{view:view()}),0));
 for(const type of ['input','change'])document.addEventListener(type,e=>{if(['hh-home','hh-location','review-household-home','review-household-location'].includes(e.target.id)){const h=household();if(h)post('household',{household:h});}});
 document.addEventListener('change',e=>{if(e.target.tagName==='SELECT')setTimeout(()=>post('route',{view:view()}),0);});
 window.addEventListener('message',event=>{
  if(event.source!==parent||event.data?.channel!==channel||event.data.type!=='household')return;
  const h=event.data.household;if(!h||typeof h.home!=='string'||!['inside','outside'].includes(h.location))return;
  const home=document.getElementById('hh-home')||document.getElementById('review-household-home'),loc=document.getElementById('hh-location')||document.getElementById('review-household-location');
  if(home&&loc){home.value=h.home;home.dispatchEvent(new Event('input',{bubbles:true}));loc.value=h.location;loc.dispatchEvent(new Event('change',{bubbles:true}));}
 });
 post('ready',{view:view()});
})();
