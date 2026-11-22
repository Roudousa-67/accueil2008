/* Trajets et carburant : un espace commun, données existantes conservées. */
(() => {
 'use strict';
 const palette = ['#61b1ff','#ed9c64','#a99aff'];
 const state = {view:'history',period:'month',driver:'all',from:'',to:'',query:'',minKm:'',maxKm:'',minMinutes:'',maxMinutes:'',minCost:'',maxCost:'',selected:null,fuelView:'fills',stationSort:'distance',country:'all',busy:false};
 let pendingReceipt=null,receiptGeneration=0;
 const extra = () => store.get('journeyNotes733', {});
 const num = value => Number(String(value ?? '').replace(',', '.'));
 const finite = value => Number.isFinite(Number(value));
 const safeColor = value => /^#[a-f0-9]{6}$/i.test(value);
 const driverColor = id => {const saved=store.get('driverColors733',palette);return safeColor(saved[id])?saved[id]:palette[id]||'#a7b1ba';};
 const driverName = id => Number.isInteger(id)&&id>=0&&id<profiles().length ? profiles()[id] : 'Conducteur non renseigné';
 const date = time => new Date(time).toLocaleDateString('fr-FR');
 const time = value => new Date(value).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
 const dayEnd = value => {const d=new Date(value+'T00:00:00');d.setDate(d.getDate()+1);return +d;};
 const btn = (p,action,label,active=false) => chipBtn(p,'journey733:'+action,label,active);
 const field = (id,label,type='text',value='',attrs='') => `<label>${esc(label)}<input id="j733-${id}" type="${type}" value="${esc(String(value))}" ${attrs}></label>`;
 const select = (key,label,options,value) => `<label>${esc(label)}<select data-journey733="${key}">${options.map(([v,n])=>`<option value="${esc(String(v))}" ${String(v)===String(value)?'selected':''}>${esc(n)}</option>`).join('')}</select></label>`;
 function rows() {
  const tracks=trkIndex().map(t=>({id:String(t.id),start:t.t0,end:t.t1,km:t.km,cons:t.co,price:t.pr,max:t.mx,from:t.from,to:t.to,driver:t.driver733,track:true}));
  const legacy=tripsHistory().filter(t=>!tracks.some(x=>t.start<=x.end&&t.end>=x.start)).map(t=>({id:'legacy-'+t.start,start:t.start,end:t.end,km:t.dist,cons:t.cons,price:t.price,score:t.score,driver:t.driver733,track:false}));
  return tracks.concat(legacy).filter(t=>finite(t.start)&&finite(t.end)).map(t=>Object.assign(t,extra()[t.id]||{})).sort((a,b)=>b.start-a.start);
 }
 function bounds(now=Date.now()) {
  let start=0,end=Infinity,d=new Date(now);d.setHours(0,0,0,0);
  if(state.period==='day'){start=+d;d.setDate(d.getDate()+1);end=+d;}
  if(state.period==='week'){d.setDate(d.getDate()-(d.getDay()+6)%7);start=+d;d.setDate(d.getDate()+7);end=+d;}
  if(state.period==='month'){d.setDate(1);start=+d;d.setMonth(d.getMonth()+1);end=+d;}
  if(state.period==='year'){d.setMonth(0,1);start=+d;d.setFullYear(d.getFullYear()+1);end=+d;}
  if(state.period==='dates'){start=state.from?+new Date(state.from+'T00:00:00'):0;end=state.to?dayEnd(state.to):state.from?dayEnd(state.from):Infinity;}
  return {start,end};
 }
 const cost = t => t.cons>0&&t.price>0 ? t.km*t.cons*t.price/100 : null;
 function filtered(list=rows()) {
  const {start,end}=bounds(),q=state.query.toLocaleLowerCase('fr-FR');
  const inRange=(value,min,max)=>(min===''||value!=null&&value>=num(min))&&(max===''||value!=null&&value<=num(max));
  return list.filter(t=>t.start>=start&&t.start<end&&(state.driver==='all'||String(t.driver??'unknown')===state.driver)&&(!q||[t.from,t.to,t.note,driverName(t.driver)].join(' ').toLocaleLowerCase('fr-FR').includes(q))&&inRange(t.km,state.minKm,state.maxKm)&&inRange((t.end-t.start)/60000,state.minMinutes,state.maxMinutes)&&inRange(cost(t),state.minCost,state.maxCost));
 }
 function totals(list) {
  return list.reduce((a,t)=>{a.count++;a.km+=num(t.km)||0;a.minutes+=Math.max(0,(t.end-t.start)/60000);if(t.cons>0){a.litres+=t.km*t.cons/100;a.knownLitres++;}const euros=cost(t);if(euros!=null){a.euros+=euros;a.knownCost++;}return a;},{count:0,km:0,minutes:0,litres:0,euros:0,knownLitres:0,knownCost:0});
 }
 function summary(list) {
  const n=totals(list);
  return `<div class="j733-kpis">${[['Trajets',n.count],['Distance',fr1(n.km)+' km'],['Durée',Math.round(n.minutes)+' min'],['Carburant estimé',n.knownLitres?fr1(n.litres)+' L':'—'],['Coût estimé',n.knownCost?fr2(n.euros)+' €':'—']].map(([label,value])=>`<div><small>${label}</small><b>${value}</b></div>`).join('')}</div>`;
 }
 function toolbar(p) {
  return `<div class="j733-toolbar">${select('period','Période',[['day','Aujourd’hui'],['week','Semaine'],['month','Mois'],['year','Année'],['all','Tout'],['dates','Dates personnalisées']],state.period)}${select('driver','Conducteur',[['all','Tous'],...profiles().map((n,i)=>[String(i),n]),['unknown','Non renseigné']],state.driver)}${btn(p,'settings','Réglages')}${chipBtn(p,'transfer738:gpx','Importer un GPX par QR')}</div>
  <details class="j733-search" ${state.period==='dates'?'open':''}><summary>Rechercher et filtrer</summary><div class="j733-form">${field('from','Du','date',state.from)}${field('to','Au (inclus)','date',state.to)}${field('query','Adresse, conducteur ou note','search',state.query)}${field('minKm','Distance minimale (km)','number',state.minKm,'min="0"')}${field('maxKm','Distance maximale (km)','number',state.maxKm,'min="0"')}${field('minMinutes','Durée minimale (min)','number',state.minMinutes,'min="0"')}${field('maxMinutes','Durée maximale (min)','number',state.maxMinutes,'min="0"')}${field('minCost','Coût minimal estimé (€)','number',state.minCost,'min="0" step="0.01"')}${field('maxCost','Coût maximal estimé (€)','number',state.maxCost,'min="0" step="0.01"')}</div><div class="j733-actions">${btn(p,'search','Appliquer',true)}${btn(p,'reset','Réinitialiser')}</div><p>Renseigne une date seule pour cette journée, ou les deux dates pour une période.</p></details>`;
 }
 function live(p) {
  if(!trk)return `<div class="j733-panel">Aucun trajet en cours. ${btn(p,'start','Démarrer un trajet')}</div>`;
  const driver=Number.isInteger(trk.driver733)?trk.driver733:null;
  return `<div class="j733-panel" style="border-left:5px solid ${driverColor(driver)}"><b>Trajet en cours · ${esc(driverName(driver))}</b><p>${esc(trk.from||'Adresse de départ indisponible')} → ${esc(trkPlace()||'Position actuelle')}</p><p>${fr1(trk.km)} km · ${time(trk.t0)}${trk.mx?' · maximum '+Math.round(trk.mx)+' km/h':''}</p><div id="liveMap738"></div>${window.RoadsTaken738?RoadsTaken738.html(trk.id):''}${btn(p,'finish','Terminer le trajet')}</div>`;
 }
 function graph(values,unit) {
  const max=Math.max(1,...values.map(v=>v.value));
  return `<div class="j733-chart" role="img" aria-label="${esc('Évolution en '+unit)}">${values.map(v=>`<div><small>${fr1(v.value)}</small><i style="height:${Math.max(2,v.value/max*110)}px;background:${v.color||'#61b1ff'}"></i><span>${esc(v.label)}</span></div>`).join('')}</div>`;
 }
 function stats(list) {
  const groups=new Map();
  for(const t of list.slice().reverse()){const d=new Date(t.start),key=state.period==='year'?d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'):dayKey(t.start);groups.set(key,(groups.get(key)||0)+t.km);}
  return `<div class="j733-panel"><h3>Distance par ${state.period==='year'?'mois':'jour'}</h3>${graph([...groups].slice(-31).map(([label,value])=>({label,value})),'km')}<p>Les valeurs détaillées restent incluses dans les totaux, même si le graphique affiche les 31 dernières périodes.</p></div><div class="j733-panel"><h3>Comparaison des conducteurs</h3>${profiles().map((name,i)=>{const n=totals(list.filter(t=>t.driver===i));return `<p style="border-left:4px solid ${driverColor(i)};padding-left:10px">${esc(name)} · ${n.count} trajets · ${fr1(n.km)} km · ${Math.round(n.minutes)} min · ${n.knownCost?fr2(n.euros)+' € estimés':'coût inconnu'}</p>`;}).join('')}</div>`;
 }
 function history(p,list) {
  return `<div class="j733-panel"><h3>Historique · ${list.length} trajets</h3>${list.length?list.map(t=>`<button class="j733-row" data-act="journey733:select:${esc(t.id)}" style="border-left:5px solid ${driverColor(t.driver)}"><div><b>${date(t.start)} · ${time(t.start)}</b><small>${esc(driverName(t.driver))}</small></div><span>${esc(t.from||'Départ non renseigné')} → ${esc(t.to||'Arrivée non renseignée')}</span><div><b>${fr1(t.km)} km</b><small>${Math.round((t.end-t.start)/60000)} min${cost(t)!=null?' · '+fr2(cost(t))+' € estimés':''}</small></div></button>`).join(''):'Aucun trajet pour ces critères.'}</div>`;
 }
 function pathFor(t) {return t.track?trkLoad(t.id):[];}
 function mapHTML(p,t) {
  const points=pathFor(t);
  if(points.length<2)return '<p>Le tracé GPS n’est pas disponible pour ce trajet.</p>';
  return `<div id="journeyMap733" class="j733-map" data-trip="${esc(t.id)}"></div><p>Parcours GPS enregistré · ${points.length} positions. Les coupures GPS peuvent laisser des segments incomplets.</p>${window.RoadsTaken738?RoadsTaken738.html(t.id):''}`;
 }
 function detail(p,t) {
  return `<div class="j733-panel">${btn(p,'back','Retour')}<h3>${date(t.start)} · ${time(t.start)} – ${time(t.end)}</h3><p>${esc(t.from||'Adresse de départ inconnue')} → ${esc(t.to||'Adresse d’arrivée inconnue')}</p>${summary([t])}${mapHTML(p,t)}<div class="j733-form">${select('assign','Conducteur', [['unknown','Non renseigné'],...profiles().map((n,i)=>[String(i),n])],String(t.driver??'unknown'))}${field('note','Note du trajet','text',t.note||'','maxlength="500"')}</div><div class="j733-actions">${btn(p,'note','Enregistrer la note')}${btn(p,'mail','Préparer un e-mail')}${btn(p,'sms','Préparer un SMS')}${btn(p,'report','Rapport imprimable / PDF')}${btn(p,'json','Exporter le tracé')}</div><p>Les adresses et les coûts sont présentés selon les informations enregistrées.</p></div>`;
 }
 function textReport(t) {
  const pts=pathFor(t),link=pts.length?`https://www.openstreetmap.org/?mlat=${pts[pts.length-1][0]}&mlon=${pts[pts.length-1][1]}#map=15/${pts[pts.length-1][0]}/${pts[pts.length-1][1]}`:'';
  return ['Rapport de trajet – Accueil 2008 GT',date(t.start)+' '+time(t.start)+' – '+time(t.end),driverName(t.driver),'Départ : '+(t.from||'adresse inconnue'),'Arrivée : '+(t.to||'adresse inconnue'),fr1(t.km)+' km · '+Math.round((t.end-t.start)/60000)+' min',cost(t)!=null?'Coût estimé : '+fr2(cost(t))+' €':'Coût indisponible',t.note||'',link].filter(Boolean).join('\n');
 }
 function openURL(url) {if(A&&A.openUrl){if(!A.openUrl(url))toast('Aucune application compatible sur le poste.');}else window.open(url,'_blank');}
 function exportFile(name,data,type='application/json') {
  const blob=new Blob([data],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
 }
 function report(p,t) {
  const win=window.open('','_blank');
  if(!win){toast('Ce poste ne permet pas l’impression depuis cette fenêtre. Utilise l’export.');return;}
  const points=pathFor(t),map=points.length>1?svgMap(points,driverColor(t.driver)):'';
  win.document.write(`<!doctype html><html lang="fr"><meta charset="utf-8"><title>Rapport de trajet</title><style>body{font:16px sans-serif;max-width:900px;margin:30px auto;padding:20px}pre{white-space:pre-wrap}svg{width:100%;height:340px;border:1px solid #ddd}</style><h1>Rapport de trajet</h1><pre>${esc(textReport(t))}</pre>${map}<p>Tracé GPS, fond cartographique à consulter séparément. Coûts estimés.</p><button onclick="window.print()">Imprimer / enregistrer en PDF</button></html>`);win.document.close();
 }
 function svgMap(points,color) {
  const lat=points.map(p=>p[0]),lon=points.map(p=>p[1]),minX=Math.min(...lon),maxX=Math.max(...lon),minY=Math.min(...lat),maxY=Math.max(...lat),dx=Math.max(.0001,maxX-minX),dy=Math.max(.0001,maxY-minY);
  const poly=points.map(p=>[20+(p[1]-minX)/dx*760,320-(p[0]-minY)/dy*300].join(',')).join(' ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 340"><rect width="800" height="340" fill="#f2f4f1"/><polyline points="${poly}" fill="none" stroke="${color}" stroke-width="4"/><text x="20" y="20" fill="#333">Tracé GPS du départ à l’arrivée</text></svg>`;
 }
 function fuelFiltered() {const {start,end}=bounds();return fuelLog().filter(f=>f.t>=start&&f.t<end&&(state.driver==='all'||String(f.driver733??'unknown')===state.driver));}
 function fillForm(p) {
  return `<details class="j733-panel"><summary>Ajouter un plein</summary><div class="j733-form">${field('fillDate','Date','date',dayKey(Date.now()))}${field('litres','Litres','number','','min="0.01" max="500" step="0.01"')}${field('paid','Montant payé (€)','number','','min="0.01" max="5000" step="0.01"')}${field('perLitre','Prix au litre (€)','number','','min="0.001" max="10" step="0.001"')}${field('odometer','Compteur kilométrique','number',odoCar47()||'','min="0" max="3000000"')}${field('station','Station / adresse','text','','maxlength="200"')}<label>Type de plein<select id="j733-full"><option value="yes">Réservoir rempli complètement</option><option value="no">Plein partiel</option></select></label></div><p>Renseigne les litres et le montant, ou les litres et le prix au litre. Vérifie les montants du ticket.</p>${btn(p,'saveFill','Enregistrer le plein',true)}${pendingReceipt?'<p>Photo prête à joindre.</p>':''}</details>`;
 }
 function receiptControls(p) {
  return `<div class="j733-panel"><h3>Ticket du prochain plein</h3>${chipBtn(p,'transfer738:ticket','Envoyer un ticket par QR')}<label>Photographier ou choisir un ticket<input type="file" id="j733-ticket" accept="image/jpeg,image/png,image/webp" capture="environment"></label><p id="j733-ticket-status">${pendingReceipt?'Photo prête à joindre au prochain plein.':'La photo est conservée sur le poste après validation du plein. Vérifie les montants avant d’enregistrer.'}</p><label>Importer un plein exporté<input type="file" id="j733-import" accept="application/json,.json"></label>${btn(p,'exportFills','Exporter les pleins')}<p>Les photos jointes se consultent dans l’historique. L’export JSON contient les montants et dates.</p></div>`;
 }
 function showTicket(stamp) {
  // 7.38 : photo reçue par l'autoradio (fichier) ou ancienne photo gardée dans l'appli.
  const ref=fill?.receipt733,src=ref&&(String(ref).startsWith('file738:')?(window.Transfer738?Transfer738.dataUrl(ref.slice(8)):''):localStorage.getItem(ref));
  if(!src||!/^data:image\/(jpeg|png);base64,/.test(src)){toast('Photo indisponible.');return;}
  const overlay=document.createElement('div');overlay.className='ov on';overlay.style.zIndex='6000';
  const close=document.createElement('button');close.className='close';close.textContent='Fermer le ticket';close.onclick=()=>overlay.remove();
  const img=document.createElement('img');img.src=src;img.alt='Ticket du plein du '+date(stamp);img.style.cssText='max-width:100%;min-height:0;flex:1;object-fit:contain';
  overlay.append(close,img);document.body.appendChild(overlay);
 }
 async function readReceipt(file) {
  const generation=++receiptGeneration;
  if(!file||!/^image\/(jpeg|png|webp)$/.test(file.type)||file.size>12*1024*1024){toast('Choisis une photo JPEG, PNG ou WebP de moins de 12 Mo.');return;}
  const url=URL.createObjectURL(file),img=new Image();
  try {
   await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url;});
   if(generation!==receiptGeneration)return;
   const ratio=Math.min(1,1200/Math.max(img.naturalWidth,img.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(img.naturalHeight*ratio));
   const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
   const photo=canvas.toDataURL('image/jpeg',.7);if(photo.length>350000){toast('Cette photo est trop volumineuse. Recadre le ticket.');return;}
   pendingReceipt=photo;const status=$('j733-ticket-status');if(status)status.textContent='Photo prête. Reviens aux pleins, saisis les montants puis enregistre.';
  }catch(e){toast('Impossible de lire cette photo.');}finally{URL.revokeObjectURL(url);}
 }
 async function importFills(file) {
  if(!file||file.size>2000000){toast('Choisis un export JSON de moins de 2 Mo.');return;}
  try {
   const data=JSON.parse(await file.text());if(data.schema!=='accueil2008-fills-v1'||!Array.isArray(data.fills)||data.fills.length>2000)throw Error();
   const accepted=data.fills.map(f=>{if(!(Number.isFinite(f.t)&&f.t>0&&f.t<=Date.now()+86400000&&Number.isFinite(f.l)&&f.l>0&&f.l<=500&&Number.isFinite(f.e)&&f.e>0&&f.e<=5000&&Number.isFinite(f.k)&&f.k>=0&&f.k<=3000000))throw Error();return {t:f.t,l:f.l,e:f.e,k:f.k,s:String(f.s||'').slice(0,200),full733:f.full733===true,driver733:Number.isInteger(f.driver733)&&f.driver733>=0&&f.driver733<=2?f.driver733:null};});
   const list=fuelLog(),seen=new Set(list.map(f=>[f.t,f.l,f.e].join('|')));let added=0;
   for(const f of accepted){const key=[f.t,f.l,f.e].join('|');if(!seen.has(key)){seen.add(key);list.push(f);added++;}}
   store.set('fuelLog',list.sort((a,b)=>a.t-b.t));toast(added+' pleins importés.');render();
  }catch(e){toast('Import refusé : fichier ou valeurs invalides.');}
 }
 function cleanReceipts() {
  const used=new Set(fuelLog().map(f=>f.receipt733).filter(Boolean));
  for(const key of Object.keys(localStorage))if(key.startsWith('receipt733-')&&!used.has(key))localStorage.removeItem(key);
  // Les photos reçues par l'autoradio restent gardées tant qu'un plein les utilise.
  if(window.Transfer738)Transfer738.keepOnly([...used].filter(r=>String(r).startsWith('file738:')).map(r=>String(r).slice(8)));
 }
 document.addEventListener('change',event=>{if(event.target.id==='j733-ticket')readReceipt(event.target.files?.[0]);if(event.target.id==='j733-import')importFills(event.target.files?.[0]);});
 function fuel(p) {
  if(state.fuelView==='tickets')return `<div class="j733-actions">${btn(p,'fuel:fills','Retour aux pleins')}</div>`+receiptControls(p);
  const fills=fuelFiltered(),sumL=fills.reduce((n,f)=>n+f.l,0),sumE=fills.reduce((n,f)=>n+f.e,0);
  return `<div class="j733-actions">${btn(p,'fuel:fills','Mes pleins',state.fuelView==='fills')}${btn(p,'fuel:stations','Stations',state.fuelView==='stations')}${btn(p,'fuel:charts','Graphiques',state.fuelView==='charts')}${btn(p,'receipts','Tickets et import')}${btn(p,'settings','Réglages')}</div>${state.fuelView==='stations'?stations(p):`<div class="j733-kpis"><div><small>Litres achetés</small><b>${fr1(sumL)} L</b></div><div><small>Dépenses</small><b>${fr2(sumE)} €</b></div><div><small>Prix moyen pondéré</small><b>${sumL?fr2(sumE/sumL)+' €/L':'—'}</b></div></div>${state.fuelView==='charts'?`<div class="j733-panel"><h3>Évolution du prix au litre</h3>${graph(fills.slice(-30).map(f=>({label:date(f.t),value:f.e/f.l,color:driverColor(f.driver733)})),'€/L')}<p>Chaque barre correspond à un plein.</p></div><div class="j733-panel"><h3>Dépenses par mois</h3>${monthlyFuel(fills)}</div>`:fillForm(p)+`<div class="j733-panel">${fills.length?fills.slice().reverse().map(f=>`<div class="j733-row" style="border-left:4px solid ${driverColor(f.driver733)}"><div><b>${date(f.t)}</b><small>${esc(driverName(f.driver733))}</small></div><span>${esc(f.s||'Station non renseignée')}<small>${f.k?Number(f.k).toLocaleString('fr-FR')+' km':''}</small></span><div><b>${fr1(f.l)} L · ${fr2(f.e)} €</b><small>${(f.e/f.l).toFixed(3)} €/L${f.full733===false?' · partiel':''}</small>${f.receipt733?btn(p,'ticket:'+f.t,'Voir le ticket'):''}</div></div>`).join(''):'Aucun plein pour cette période.'}</div>`}`}`;
 }
 function monthlyFuel(fills) {const map=new Map();for(const f of fills){const key=dayKey(f.t).slice(0,7);map.set(key,(map.get(key)||0)+f.e);}return graph([...map].sort().slice(-24).map(([label,value])=>({label,value})),'€');}
 function stationRows() {
  if(window.Stations738)return Stations738.rows();
  if(!loc)return [];
  const radius=Number(store.get('stRad',10)),list=st47.list.filter(s=>finite(s.lat)&&finite(s.lon)).map(s=>({...s,dist:hav(loc.lat,loc.lon,s.lat,s.lon)})).filter(s=>s.dist<=radius&&(state.country==='all'||s.c===state.country));
  const key=state.stationSort==='distance'?'dist':'price';
  return list.sort((a,b)=>(a.closed?1:0)-(b.closed?1:0)||(a[key]>0?a[key]:Infinity)-(b[key]>0?b[key]:Infinity));
 }
 function stations(p) {
  if(window.Stations738)return Stations738.page(p);
  const list=stationRows(),known=list.filter(s=>s.price>0),low=Math.min(...known.map(s=>s.price)),high=Math.max(...known.map(s=>s.price));
  return `<div class="j733-panel"><div class="j733-toolbar">${select('stationSort','Trier',[['distance','La plus proche d’abord'],['price','La moins chère d’abord']],state.stationSort)}${select('country','Pays',[['all','Tous disponibles'],['FR','France'],['DE','Allemagne']],state.country)}${btn(p,'stationSettings','Carburant et rayon')}${btn(p,'refreshStations',state.busy?'Recherche…':'Actualiser')}</div><p>${esc(st47.msg||'')} ${esc(st47.de||'')}</p><p>Distance à vol d’oiseau · ${st47.at?'recherche du '+date(st47.at)+' à '+time(st47.at):'aucune recherche effectuée'}. France et Allemagne selon les sources configurées. Un prix inconnu reste hors du classement.</p>${list.length?`<div id="stationMap733" class="j733-map"></div>`:''}${list.map((s,i)=>{const ratio=s.price>0&&high>low?(s.price-low)/(high-low):0,color=s.price>0?`hsl(${Math.round(125-ratio*125)},60%,40%)`:'#9099a2';return `<button class="j733-row" data-act="journey733:station:${i}" style="border-left:5px solid ${color}"><div><b>${esc(s.name)}</b><small>${esc(s.c)} · ${s.dist.toFixed(1)} km${s.closed?' · fermée':''}</small></div><span>${esc(s.addr||'')}<small>${s.maj?'Prix relevé le '+date(s.maj)+' '+time(s.maj):'Heure du relevé non fournie'}</small></span><b style="color:${color}">${s.price>0?s.price.toFixed(3)+' €/L':'Prix inconnu'}</b></button>`;}).join('')||'<p>Aucune station disponible pour ces critères. Actualise ou change le rayon.</p>'}<p>Prix disponibles : France (flux officiel) et Allemagne (avec une clé Tankerkönig, dans Carburant et stations).</p></div>`;
 }
 function page(p) {
  const list=filtered(),selected=rows().find(t=>t.id===state.selected),content=selected?detail(p,selected):toolbar(p)+(state.view==='fuel'?fuel(p):summary(list)+(state.view==='stats'?stats(list):live(p)+history(p,list)));
  return pageFrame(p,`<div class="j733 scroll" style="--j733-card:${p.card};--j733-bg:${p.card2};--j733-text:${p.txt}">${content}</div>`);
 }
 let journeyMap=null,stationMap=null;
 function mountMaps() {
  if(typeof L==='undefined')return;
  const mapEl=$('journeyMap733');
  if(journeyMap&&journeyMap.getContainer()!==mapEl){journeyMap.remove();journeyMap=null;}
  if(mapEl&&!journeyMap){const t=rows().find(t=>t.id===mapEl.dataset.trip),points=t&&pathFor(t);if(points?.length>1){journeyMap=L.map(mapEl,{zoomControl:true,attributionControl:true});window.Maps738?Maps738.tiles(journeyMap):L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(journeyMap);L.polyline(points,{color:'#ffffff',weight:9,opacity:.9}).addTo(journeyMap);const line=L.polyline(points,{color:Number.isInteger(t.driver)?driverColor(t.driver):'#1f6fd1',weight:5}).addTo(journeyMap);journeyMap.fitBounds(line.getBounds(),{padding:[15,15],maxZoom:16});L.circleMarker(points[0],{radius:8,color:'#fff',weight:3,fillColor:'#2e9e4d',fillOpacity:1}).addTo(journeyMap).bindTooltip('Départ');L.circleMarker(points[points.length-1],{radius:8,color:'#fff',weight:3,fillColor:'#e0312b',fillOpacity:1}).addTo(journeyMap).bindTooltip('Arrivée');}}
  if(window.Stations738){Stations738.mount();return;}
  const stationEl=$('stationMap733');
  if(stationMap&&stationMap.getContainer()!==stationEl){stationMap.remove();stationMap=null;}
  if(stationEl&&!stationMap){stationMap=L.map(stationEl);window.Maps738?Maps738.tiles(stationMap):L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(stationMap);if(loc)L.circleMarker([loc.lat,loc.lon],{radius:8,color:'#fff',weight:3,fillColor:'#1f6fd1',fillOpacity:1}).addTo(stationMap).bindTooltip('Ma position');const list=stationRows();for(const [i,s] of list.entries()){const marker=L.marker([s.lat,s.lon]).addTo(stationMap),button=document.createElement('button');button.textContent=s.name+' · '+(s.price>0?s.price.toFixed(3)+' €/L':'prix inconnu');button.onclick=()=>window.act('journey733:station:'+i);marker.bindPopup(button);}const pts=list.map(s=>[s.lat,s.lon]).concat(loc?[[loc.lat,loc.lon]]:[]);if(pts.length>1)stationMap.fitBounds(pts,{padding:[15,15],maxZoom:14});else if(pts.length)stationMap.setView(pts[0],13);else stationMap.setView([48.58,7.75],10);}
 }
 function metadata(id,patch) {const map=extra();map[id]={...(map[id]||{}),...patch};store.set('journeyNotes733',map);}
 function settings(p) {
  const days=store.get('journeyRetention733',0);
  return `<div class="prefs730"><h3>Trajets et carburant</h3><details open><summary>Conducteurs</summary><p>Le profil actif est associé aux nouveaux trajets et pleins. Les anciens trajets restent « Non renseigné » jusqu’à ton attribution.</p>${profiles().map((n,i)=>`<label class="prefRow730">${esc(n)}<input type="color" data-drivercolor733="${i}" value="${driverColor(i)}"></label>`).join('')}</details><details><summary>Rapports et partage</summary><p>Les rapports comprennent les dates, adresses enregistrées, conducteur, distance, durée et coûts estimés. L’e-mail et le SMS s’ouvrent dans l’application d’envoi du poste. Le rapport imprimable permet d’enregistrer un PDF sur les postes compatibles.</p>${field('email','E-mail destinataire','email',store.get('journeyEmail733',store.get('mailTo','')))}${field('phone','Numéro destinataire','tel',store.get('journeyPhone733',''))}${btn(p,'saveDestinations','Enregistrer')}<p>Envoi automatique et file d’attente : service d’envoi à configurer. Envoi SMS autonome par la SIM : pont Android et autorisation SMS à ajouter.</p></details><details><summary>Stations et pleins</summary><p>Les pleins et leurs graphiques sont réunis dans Trajets → Carburant. Les réglages du carburant, du rayon et de la clé Allemagne sont conservés.</p>${btn(p,'stationSettings','Sources, carburant et rayon')}</details><details><summary>Tickets et transfert ⓘ</summary><p>La saisie manuelle et les anciens pleins restent disponibles. La lecture automatique d’un ticket photographié, l’OCR multilingue et le transfert par QR code via Internet nécessitent un service de transfert et de reconnaissance à configurer. Aucun ticket n’est envoyé automatiquement.</p></details><details><summary>Conservation et suppression ⓘ</summary><label>Conserver les trajets<select id="j733-retention">${[[0,'Sans limite de durée'],[30,'30 jours'],[90,'90 jours'],[365,'1 an'],[1095,'3 ans']].map(([v,n])=>`<option value="${v}" ${Number(days)===v?'selected':''}>${n}</option>`).join('')}</select></label><p>Ce réglage concerne les trajets et leurs tracés, hors limites de stockage existantes. Les pleins et leurs montants sont conservés. Une réduction de la durée demande une confirmation avant suppression.</p>${btn(p,'retention','Appliquer la conservation')}<p>Les archives de bilan déjà agrégées restent dans l’ancien bilan. Elles ne permettent plus de retrouver un parcours individuel.</p></details></div>`;
 }
 function saveFill() {
  const read=id=>$('j733-'+id)?.value||'',litres=num(read('litres')),paid=num(read('paid')),per=num(read('perLitre')),amount=paid>0?paid:litres*per,km=num(read('odometer')),dt=Date.parse(read('fillDate')+'T12:00:00');
  if(!(litres>0&&litres<=500&&amount>0&&amount<=5000&&km>=0&&km<=3000000&&Number.isFinite(dt)&&dt<=Date.now()+86400000)){toast('Vérifie la date, les litres, le montant et le compteur.');return;}
  if(paid>0&&per>0&&Math.abs(paid-litres*per)>Math.max(.1,paid*.01)){toast('Le montant ne correspond pas aux litres et au prix. Vérifie le ticket.');return;}
  const list=fuelLog();if(list.some(f=>Math.abs(f.t-dt)<60000&&Math.abs(f.l-litres)<.01&&Math.abs(f.e-amount)<.01)){toast('Ce plein est déjà présent.');return;}
  const before=list.filter(f=>f.t<dt&&f.k>0).at(-1),after=list.find(f=>f.t>dt&&f.k>0);
  if(km&&((before&&km<before.k)||(after&&km>after.k))){toast('Le compteur ne correspond pas à l’ordre des pleins.');return;}
  const record={t:dt,l:litres,e:Math.round(amount*100)/100,k:km,s:read('station').slice(0,200),driver733:profIdx(),full733:read('full')==='yes'};if(pendingReceipt&&String(pendingReceipt).startsWith('file738:')){record.receipt733=pendingReceipt;if(window.Transfer738)Transfer738.keep(pendingReceipt.slice(8),true);pendingReceipt=null;}else if(pendingReceipt){try{const id='receipt733-'+Date.now().toString(36);localStorage.setItem(id,pendingReceipt);record.receipt733=id;pendingReceipt=null;}catch(e){toast('Photo non enregistrée : stockage insuffisant. Le plein reste enregistré.');}}list.push(record);store.set('fuelLog',list.sort((a,b)=>a.t-b.t));toast('Plein enregistré.');render();
 }
 function prune(days) {
  if(!days)return;
  const cutoff=Date.now()-days*86400000,all=trkIndex(),old=all.filter(t=>t.t1<cutoff),ids=new Set(old.map(t=>String(t.id))),notes=extra();
  store.set('trkIndex',all.filter(t=>!ids.has(String(t.id))));
  store.set('trips',tripsHistory().filter(t=>{if(t.end<cutoff){delete notes['legacy-'+t.start];return false;}return true;}));
  for(const id of ids){localStorage.removeItem(trkKey(id));delete notes[id];}
  store.set('journeyNotes733',notes);store.flush();
 }
 const start=window.trkStart;window.trkStart=function(){const result=start.apply(this,arguments);if(trk){trk.driver733=profIdx();trkPersist();}return result;};
 window.pageTrips=page;
 const originalRender=window.render;window.render=function(){const result=originalRender.apply(this,arguments);mountMaps();return result;};
 const originalAct=window.act;window.act=function(action){
  if(typeof action==='string'&&action.startsWith('tsub:')){const sub=action.slice(5);state.view=sub==='fuel'?'fuel':sub==='stats'?'stats':'history';state.selected=null;}
  if(typeof action!=='string'||!action.startsWith('journey733:')){const result=originalAct.apply(this,arguments);if(typeof action==='string'&&action.startsWith('pl:del:'))cleanReceipts();return result;}
  const [op,...args]=action.slice(11).split(':'),id=args.join(':'),selected=rows().find(t=>t.id===state.selected);
  if(op==='select'){state.selected=id;render();return;}
  if(op==='back'){state.selected=null;render();return;}
  if(op==='settings'){openSet('Trajets et carburant','Organisation et données');return;}
  if(op==='search'){for(const key of ['from','to','query','minKm','maxKm','minMinutes','maxMinutes','minCost','maxCost'])state[key]=$('j733-'+key)?.value||'';if(state.from||state.to)state.period='dates';if(state.from&&state.to&&state.from>state.to){toast('La date de fin doit suivre la date de début.');return;}render();return;}
  if(op==='reset'){Object.assign(state,{period:'month',driver:'all',from:'',to:'',query:'',minKm:'',maxKm:'',minMinutes:'',maxMinutes:'',minCost:'',maxCost:''});render();return;}
  if(op==='start'){if(!loc||!usableTrackFix(loc)){toast('Une position GPS précise est nécessaire.');return;}trkStart(loc,true);render();return;}
  if(op==='finish'){trkFinish(false);render();return;}
  if(op==='note'&&selected){metadata(selected.id,{note:($('j733-note')?.value||'').slice(0,500)});toast('Note enregistrée.');return;}
  if(op==='mail'&&selected){openURL('mailto:'+encodeURIComponent(store.get('journeyEmail733',''))+'?subject='+encodeURIComponent('Rapport de trajet du '+date(selected.start))+'&body='+encodeURIComponent(textReport(selected)));return;}
  if(op==='sms'&&selected){openURL('smsto:'+encodeURIComponent(store.get('journeyPhone733',''))+'?body='+encodeURIComponent(textReport(selected)));return;}
  if(op==='report'&&selected){report(curP,selected);return;}
  if(op==='json'&&selected){try{exportFile('Trajet-'+dayKey(selected.start)+'.json',JSON.stringify({schema:'accueil2008-trip-v1',...selected,points:pathFor(selected)},null,2));}catch(e){toast('Export indisponible sur ce poste.');}return;}
  if(op==='fuel'){state.fuelView=id;render();return;}
  if(op==='saveFill'){saveFill();return;}
  if(op==='ticket'){showTicket(Number(id));return;}
  if(op==='stationSettings'){openSet('Navigation','Stations essence');return;}
  if(op==='receipts'){state.fuelView='tickets';render();return;}
  if(op==='exportFills'){try{exportFile('Pleins-'+dayKey(Date.now())+'.json',JSON.stringify({schema:'accueil2008-fills-v1',fills:fuelLog()},null,2));}catch(e){toast('Export indisponible sur ce poste.');}return;}
  if(op==='saveDestinations'){const email=($('j733-email')?.value||'').trim(),phone=($('j733-phone')?.value||'').trim();if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||phone&&!/^\+?[0-9 ()-]{6,25}$/.test(phone)){toast('Vérifie l’e-mail et le numéro.');return;}store.set('journeyEmail733',email);store.set('journeyPhone733',phone);toast('Destinataires enregistrés.');return;}
  if(op==='retention'){const days=Number($('j733-retention')?.value);if(![0,30,90,365,1095].includes(days))return;if(days&&(!store.get('journeyRetention733',0)||days<store.get('journeyRetention733',0))&&!window.confirm('Supprimer les trajets et tracés plus anciens que '+days+' jours ?'))return;store.set('journeyRetention733',days);prune(days);toast('Conservation appliquée.');return;}
  if(op==='refreshStations'){if(state.busy)return;state.busy=true;render();st47Update('user').finally(()=>{state.busy=false;render();});return;}
  if(op==='station'){const s=stationRows()[Number(id)];if(s)openURL('https://waze.com/ul?ll='+s.lat+','+s.lon+'&navigate=yes');return;}
 };
 document.addEventListener('change',event=>{const el=event.target,key=el.dataset.journey733;if(key){if(key==='assign'&&state.selected)metadata(state.selected,{driver:el.value==='unknown'?null:Number(el.value)});else if(['period','driver','stationSort','country'].includes(key))state[key]=el.value;render();}if(el.dataset.drivercolor733!==undefined&&safeColor(el.value)){const colors=store.get('driverColors733',palette.slice());colors[Number(el.dataset.drivercolor733)]=el.value;store.set('driverColors733',colors);}});
 SETCATS.push(['Trajets et carburant',[['Organisation et données',settings]]]);Settings720.index=null;
 tripSubs.splice(0,tripSubs.length,['hist','Trajets'],['stats','Statistiques'],['fuel','Carburant'],['eco','Éco-conduite']);
 const oldPage=window.pageTrips;window.pageTrips=function(p){if(tripSub==='eco')return pageEco(p);return oldPage(p);};
 const css=document.createElement('style');css.textContent=`.j733{color:var(--j733-text);display:flex;flex-direction:column;gap:12px;min-height:0;flex:1;padding:2px}.j733-panel{background:var(--j733-card);border-radius:16px;padding:16px}.j733-toolbar,.j733-actions{display:flex;gap:10px;align-items:end;flex-wrap:wrap}.j733-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:10px}.j733-kpis>div{background:var(--j733-card);padding:12px;border-radius:12px}.j733 small{display:block;font-size:12px;opacity:.8}.j733-kpis b{display:block;font-size:22px;margin-top:8px}.j733 label,.prefs730 label{display:flex;flex-direction:column;gap:6px}.j733 input,.j733 select,.prefs730 input,.prefs730 select{height:44px;border:1px solid #8899aa55;border-radius:9px;background:#20354c;color:#fff;font:inherit;padding:8px;min-width:0}.j733-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:12px 0}.j733-row{width:100%;display:grid;grid-template-columns:minmax(120px,1fr) minmax(150px,2fr) minmax(120px,1fr);gap:12px;padding:14px 10px;text-align:left;border-bottom:1px solid #ffffff14;color:inherit;align-items:center}.j733-map{height:300px;border-radius:12px;overflow:hidden}.j733-chart{display:flex;gap:10px;min-height:160px;align-items:end;overflow-x:auto;padding:12px 0}.j733-chart>div{flex:1;min-width:58px;display:flex;flex-direction:column;align-items:center;gap:6px}.j733-chart i{display:block;width:80%;border-radius:5px 5px 0 0}.j733-chart span{font-size:11px}.j733-search{padding:12px;background:var(--j733-card);border-radius:12px}.j733 summary,.prefs730 summary{cursor:pointer;padding:10px 0;font-weight:600}.j733 h3{margin:0 0 12px}.j733 p,.prefs730 p{font-size:14px;line-height:1.5}.j733 .leaflet-container{color:#142536}.j733 .leaflet-container button{padding:10px;color:#142536}`;document.head.appendChild(css);
 window.Journeys733={state,rows,filtered,totals,bounds,cost,driverColor,metadata,saveFill,prune,stationRows,receiveReceipt(photo){pendingReceipt=photo;state.view='fuel';state.fuelView='fills';state.selected=null;tripSub='fuel';tab='trips';render();}};
 const retention=Number(store.get('journeyRetention733',0));
 cleanReceipts();
 if([30,90,365,1095].includes(retention))prune(retention);
 setInterval(()=>{const days=Number(store.get('journeyRetention733',0));if([30,90,365,1095].includes(days))prune(days);},86400000);
})();
