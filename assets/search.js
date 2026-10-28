/* Local topic search: no requests, cookies, storage, analytics or third-party code. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),form=$('site-search-form'),topInput=$('site-search-input'),dialog=$('site-search-dialog'),query=$('search-dialog-input'),results=$('site-search-results'),status=$('site-search-status');
 const normalize=value=>String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim();
 const stem=word=>word==='taxes'?'tax':word.length>4&&word.endsWith('ies')?word.slice(0,-3)+'y':word.length>3&&word.endsWith('s')&&!word.endsWith('ss')?word.slice(0,-1):word;
 const terms=value=>normalize(value).split(/\s+/).filter(Boolean).map(stem);
 const stop=new Set(['a','an','the','and','of','to','for','in','on','with','what','how','where','does','do','i','my','our','is','are']);
 const documents=(window.townLedgerSearchIndex?.entries||[]).map((entry,index)=>({...entry,index,titleTerms:terms(entry.title).join(' '),contextTerms:terms(entry.context).join(' '),bodyTerms:terms(entry.text).join(' ')}));
 let restoreFocus=true;
 function matches(value){
  const tokens=[...new Set(terms(value).filter(token=>!stop.has(token)))];
  if(!tokens.length)return [];
  const phrase=tokens.join(' ');
  return documents.map(entry=>{
   const all=entry.titleTerms+' '+entry.contextTerms+' '+entry.bodyTerms;
   if(!tokens.every(token=>all.includes(token)))return null;
   let score=entry.titleTerms.includes(phrase)?80:0;
   for(const token of tokens)score+=(entry.titleTerms.includes(token)?30:0)+(entry.contextTerms.includes(token)?8:0)+(entry.bodyTerms.includes(token)?2:0);
   return {entry,score};
  }).filter(Boolean).sort((a,b)=>b.score-a.score||a.entry.title.length-b.entry.title.length||a.entry.index-b.entry.index).map(item=>item.entry);
 }
 function snippet(entry,value){
  const words=terms(value).filter(token=>!stop.has(token));const lower=entry.text.toLowerCase();let at=-1;
  for(const word of words){const found=lower.indexOf(word);if(found>=0&&(at<0||found<at))at=found;}
  let start=at>65?at-45:0;if(start)start=entry.text.indexOf(' ',start)+1;
  let excerpt=entry.text.slice(start,start+185).trim();const more=start+185<entry.text.length;if(more)excerpt=excerpt.replace(/\s+\S*$/,'');if(start)excerpt='…'+excerpt;if(more)excerpt+='…';return excerpt;
 }
 function update(){
  const value=query.value.trim();topInput.value=query.value;results.replaceChildren();
  if(!value||!terms(value).some(token=>!stop.has(token))){status.textContent='Type a topic to find its section.';return;}
  const found=matches(value),shown=found.slice(0,12);
  status.textContent=found.length?(found.length>12?'Showing 12 of '+found.length+' results':'Found '+found.length+' result'+(found.length===1?'':'s'))+' for “'+value+'”.':'No matching topics for “'+value+'”. Try fewer words, or a topic such as property tax, sidewalks or reserves.';
  for(const entry of shown){
   const li=document.createElement('li'),a=document.createElement('a');a.href=entry.url;
   for(const [className,text] of [['search-result-context',entry.context],['search-result-title',entry.title+' →'],['search-result-snippet',snippet(entry,value)]]){const span=document.createElement('span');span.className=className;span.textContent=text;a.append(span);}
   li.append(a);results.append(li);
  }
 }
 function close(returnFocus=true){restoreFocus=returnFocus;if(dialog.open)dialog.close();document.body.classList.remove('search-open');if(returnFocus)topInput.focus({preventScroll:true});}
 function open(){
  $('chapter-nav').classList.remove('is-open');$('menu-toggle').setAttribute('aria-expanded','false');query.value=topInput.value;update();restoreFocus=true;dialog.showModal();document.body.classList.add('search-open');query.focus();
 }
 form.hidden=false;
 form.addEventListener('submit',event=>{event.preventDefault();open();});
 $('search-dialog-form').addEventListener('submit',event=>{event.preventDefault();update();results.querySelector('a')?.focus();});
 query.addEventListener('input',update);
 query.addEventListener('keydown',event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){const links=[...results.querySelectorAll('a')];if(links.length){event.preventDefault();links[event.key==='ArrowDown'?0:links.length-1].focus();}}});
 results.addEventListener('keydown',event=>{const links=[...results.querySelectorAll('a')],at=links.indexOf(document.activeElement);if(at<0)return;if(event.key==='ArrowDown'){event.preventDefault();links[Math.min(at+1,links.length-1)].focus();}else if(event.key==='ArrowUp'){event.preventDefault();if(at===0)query.focus();else links[at-1].focus();}});
 $('site-search-clear').addEventListener('click',()=>{query.value='';update();query.focus();});
 $('site-search-close').addEventListener('click',()=>close());
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const controls=[...dialog.querySelectorAll('button,input,a[href]')].filter(n=>!n.disabled&&n.getClientRects().length);const first=controls[0],last=controls[controls.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
 document.addEventListener('keydown',event=>{if(dialog.open&&event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}},true);
 dialog.addEventListener('close',()=>{document.body.classList.remove('search-open');if(restoreFocus)topInput.focus({preventScroll:true});});
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}});
 results.addEventListener('click',event=>{const a=event.target.closest('a');if(!a||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;close(false);requestAnimationFrame(()=>$('main').focus({preventScroll:true}));});
 window.addEventListener('hashchange',()=>{if(dialog.open)close(false);});
})();
