(() => {
 'use strict';
 const finite=n=>typeof n==='number'&&Number.isFinite(n);
 const cents=n=>Math.round((n+Number.EPSILON)*100)/100;
 function compact(n){
  if(!finite(n))return '—';const a=Math.abs(n),sign=n<0?'−':'';
  if(a>=1e6)return window.cryerAccounting(sign+'$'+(a/1e6).toFixed(a>=1e8?0:1)+'M');
  if(a>=1000)return window.cryerAccounting(sign+'$'+(a/1000).toFixed(a<10000?1:0)+'K');
  return window.cryerAccounting(sign+'$'+a.toLocaleString('en-US',{maximumFractionDigits:2}));
 }
 const exact=n=>finite(n)?n.toLocaleString('en-US',{style:'currency',currency:'USD',currencySign:'accounting',minimumFractionDigits:2,maximumFractionDigits:2}):'Not available';
 function change(a,b){return finite(a)&&finite(b)&&a!==0?(b/a-1)*100:null;}
 const pct=n=>window.cryerAccounting(finite(n)?(n>0?'+':n<0?'−':'')+Math.abs(n).toFixed(2)+'%':'—');
 const signed=n=>finite(n)?(n>0?'+':'')+compact(n):'—';
 function bill(input,rates){
  const inside=input.location==='inside',services=input.services;
  if(!['inside','outside'].includes(input.location)||!['both','water','sewer','none'].includes(services))return {error:'Choose your location and services.'};
  const home=Number(input.home),gallons=Number(input.gallons);
  if(inside&&(String(input.home).trim()===''||!Number.isFinite(home)||home<0))return {error:'Enter the taxable home value from your bill.'};
  if(services!=='none'&&(String(input.gallons).trim()===''||!Number.isFinite(gallons)||gallons<0))return {error:'Enter monthly water use in gallons, including zero if appropriate.'};
  const tariff=rates[inside?'inside':'outside'];
  const used=services==='none'?0:Math.max(2000,gallons);
  const water=['both','water'].includes(services)?cents(used/1000*tariff.water):0;
  const sewer=['both','sewer'].includes(services)?cents(used/1000*tariff.sewer):0;
  const tax=inside?cents(home/100*rates.taxPer100):0;
  const stormwater=inside?rates.stormwater:0;
  const utilities=cents(water+sewer),annual=cents(tax+utilities*12+stormwater);
  return {tax,water,sewer,utilities,stormwater,annual,monthly:cents(annual/12),billedGallons:used};
 }
 const math={finite,cents,compact,exact,change,pct,signed,bill};
 window.townLedgerBill=math.bill;
})();
