(function(){
const select=document.getElementById('currency-choice'),fxStatus=document.getElementById('fx-status');
const cards=[...document.querySelectorAll('.card .price')];const base=[35000,65000,110000,120000];let rates=null,updated=null;
function fmt(n,c){return new Intl.NumberFormat('en-US',{style:'currency',currency:c,maximumFractionDigits:c==='RWF'?0:2}).format(n)}
function render(){const c=select.value;
cards.forEach((el,i)=>{el.textContent=c==='RWF'?fmt(base[i],'RWF'):rates&&rates[c]?fmt(base[i]*rates[c],c):fmt(base[i],'RWF')});
document.querySelectorAll('[data-rwf]').forEach(el=>{const amount=Number(el.dataset.rwf);el.textContent=c==='RWF'?fmt(amount,'RWF'):rates&&rates[c]?fmt(amount*rates[c],c):fmt(amount,'RWF')});
if(c==='RWF')fxStatus.textContent='';else if(rates&&rates[c])fxStatus.textContent='Estimated conversion';else fxStatus.textContent='Rates unavailable — showing RWF';}
select.addEventListener('change',render);render();
fetch('https://open.er-api.com/v6/latest/RWF',{mode:'cors'}).then(r=>{if(!r.ok)throw Error('Rate service unavailable');return r.json()}).then(data=>{if(data.result!=='success'||!data.rates||!['EUR','USD','PLN'].every(c=>Number.isFinite(data.rates[c])&&data.rates[c]>0))throw Error('Missing rates');rates=data.rates;updated=data.time_last_update_utc||null;render()}).catch(()=>{rates=null;render()});
})();
