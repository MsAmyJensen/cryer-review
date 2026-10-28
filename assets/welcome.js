// Welcome can open without loading the financial evidence or source documents.
(() => {
 'use strict';
 if(parent===window)return;
 const channel='town-ledger-local-preview';
 document.getElementById('cw-start').addEventListener('click',event=>{
  if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();parent.postMessage({channel,type:'overview'},'*');
 });
 parent.postMessage({channel,type:'ready',view:'welcome.html'},'*');
})();
