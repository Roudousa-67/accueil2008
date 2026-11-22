/* 7.37 : requêtes cartographiques coordonnées, indice de route Nominatim et diagnostic du décor. */
(() => {
 'use strict';
 // Le serveur Overpass public refuse plus de deux requêtes simultanées par connexion
 // (réponse 429) et ralentit les connexions trop actives. En conduite, l'appli envoyait
 // jusqu'à cinq types de requêtes, souvent en même temps : les routes n'arrivaient plus,
 // le décor retombait sur Campagne. Ici : une requête à la fois, routes en priorité,
 // pause croissante après un refus et serveur de secours pendant deux minutes.
 const MAIN='https://overpass-api.de/api/interpreter?data=';
 const SPARE='https://overpass.kumi.systems/api/interpreter?data=';
 const PRIORITY={routes:0,zones:1,test:1,sorties:2,localites:2,stations:3,dangers:3,autre:3};
 const base=window.getJSON;
 const queue=[];
 let running=null,coolUntil=0,backoff=0,spareUntil=0,timer=0;
 const stats={};
 function kind(query){
  if(/motorway_junction/.test(query))return 'sorties';
  if(/"amenity"="fuel"/.test(query))return 'stations';
  if(/is_in\(/.test(query))return 'zones';
  if(/highway~/.test(query)&&/around:1000,/.test(query))return 'routes';
  if(/around:25000/.test(query))return 'localites';
  if(/speed_camera/.test(query))return 'dangers';
  if(/node\(1\)/.test(query))return 'test';
  return 'autre';
 }
 function saturated(text){return /\b(429|503|504)\b|too many|rate.?limit|timed? ?out|délai|gateway|runtime error|dispatcher|abandonn/i.test(String(text||''));}
 function short(text){return String(text||'échec').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,60);}
 function record(k,ok,info){
  const s=stats[k]||(stats[k]={ok:0,fail:0,okAt:0,failAt:0,error:'',ms:0,size:0,host:''});
  if(ok){s.ok++;s.okAt=Date.now();s.ms=info.ms;s.size=info.size;s.host=info.host;}
  else{s.fail++;s.failAt=Date.now();s.error=short(info.error);s.host=info.host;}
 }
 function schedule(delay){if(timer)return;timer=setTimeout(()=>{timer=0;pump();},Math.max(0,delay));}
 async function pump(){
  if(running||!queue.length)return;
  const wait=coolUntil-Date.now();if(wait>0){schedule(wait);return;}
  const job=queue.shift();
  // Une demande restée trop longtemps en file a déjà été abandonnée par son appelant.
  if(Date.now()-job.at>15000){job.reject(Error('Requête abandonnée en file d’attente'));pump();return;}
  running=job;
  const host=Date.now()<spareUntil?SPARE:MAIN,started=Date.now();
  try{
   const result=await base(host+job.data);
   if(result&&result.remark){record(job.k,false,{error:result.remark,host});if(saturated(result.remark)){backoff=Math.min(60000,backoff?backoff*2:5000);coolUntil=Date.now()+backoff;}}
   else{record(job.k,true,{ms:Date.now()-started,size:Array.isArray(result&&result.elements)?result.elements.length:0,host});backoff=0;}
   job.resolve(result);
  }catch(error){
   record(job.k,false,{error:error&&error.message,host});
   if(saturated(error&&error.message)){
    backoff=Math.min(60000,backoff?backoff*2:5000);coolUntil=Date.now()+backoff;
    // Bascule temporaire ; si le secours échoue aussi, retour au serveur principal.
    spareUntil=host===MAIN?Date.now()+120000:0;
   }
   job.reject(error);
  }finally{running=null;pump();}
 }
 window.getJSON=function(url){
  if(typeof url==='string'&&url.startsWith('https://nominatim.openstreetmap.org/reverse'))return base.apply(this,arguments).then(result=>{remember(url,result);return result;});
  if(typeof url!=='string'||!url.startsWith(MAIN))return base.apply(this,arguments);
  const data=url.slice(MAIN.length);
  // La même demande déjà en file est partagée au lieu d'être envoyée deux fois.
  const same=queue.find(job=>job.data===data)||(running&&running.data===data?running:null);
  if(same)return same.promise;
  let query='';try{query=decodeURIComponent(data);}catch(e){query=data;}
  const k=kind(query);let resolve,reject;
  const promise=new Promise((ok,ko)=>{resolve=ok;reject=ko;});
  queue.push({data,k,p:PRIORITY[k],at:Date.now(),resolve,reject,promise});
  queue.sort((a,b)=>a.p-b.p||a.at-b.at);
  // Envoi à la fin du tour en cours : les demandes lancées ensemble sont d'abord triées.
  Promise.resolve().then(pump);
  return promise;
 };

 // Indice indépendant d'Overpass : l'adresse Nominatim (déjà demandée pour le panneau
 // d'adresse) indique le type de la voie la plus proche. Utilisé seulement quand les
 // données routières manquent, pendant 90 s et à moins de 1 km du point demandé.
 let hint=null;
 function remember(url,result){
  const lat=Number((url.match(/[?&]lat=([-\d.]+)/)||[])[1]),lon=Number((url.match(/[?&]lon=([-\d.]+)/)||[])[1]);
  if(!result||!Number.isFinite(lat)||!Number.isFinite(lon))return;
  const type=result.category==='highway'||result.class==='highway'?String(result.type||''):'';
  // 7.38 : une maison ou un bâtiment adressé à moins de 60 m signale une zone habitée.
  const rlat=Number(result.lat),rlon=Number(result.lon),near=Number.isFinite(rlat)&&Number.isFinite(rlon)&&hav(lat,lon,rlat,rlon)<=.06;
  const house=near&&(/^(building)$/.test(result.category)||/^(house|building|residential|apartments|detached|terrace|semidetached_house)$/.test(String(result.type||''))||/^(building|house)$/.test(String(result.addresstype||'')))&&!!(result.address&&(result.address.house_number||result.address.road));
  hint={lat,lon,at:Date.now(),type,house};
 }
 window.RoadHint737=function(p){
  if(!hint||(!hint.type&&!hint.house)||!p||Date.now()-hint.at>90000||hav(hint.lat,hint.lon,p.lat,p.lon)>1)return null;
  if(/^(motorway|trunk)(_link)?$/.test(hint.type))return {kind:'autoroute',type:hint.type};
  if(/^(residential|living_street|pedestrian)$/.test(hint.type))return {kind:'bâti',type:hint.type};
  if(hint.house)return {kind:'bâti',type:'maison proche'};
  return null;
 };

 // 7.38 : réception GPS. Le pont natif transmet aussi, toutes les 10 s, la position
 // « réseau » (précision de l'ordre du kilomètre) : elle écrasait la position GPS et
 // pouvait lancer une recherche de routes au mauvais endroit. Elle est ignorée tant
 // qu'une position GPS précise a moins de 5 s. Chaque étape est isolée : une erreur
 // (trajet, adresse…) n'empêche plus la recherche des routes, et elle est affichée.
 const gpsStats={received:0,ignored:0,error:'',errorAt:0};
 let goodAt=0;
 const receive=window.onLoc;
 function failure(where,e){gpsStats.error=where+' : '+short(e&&e.message||e);gpsStats.errorAt=Date.now();}
 window.onLoc=function(lat,lon,spd,acc){
  gpsStats.received++;
  const precise=Number.isFinite(acc)&&acc>=0&&acc<=50;
  if(!precise&&goodAt&&Date.now()-goodAt<5000){gpsStats.ignored++;return;}
  if(precise)goodAt=Date.now();
  try{receive.apply(this,arguments);}catch(e){failure('réception GPS',e);}
  refreshRoads();
 };
 // La recherche des routes ne dépend plus des minuteries générales de l'appli.
 function refreshRoads(){try{const r=Road723.refresh();if(r&&typeof r.catch==='function')r.catch(e=>failure('recherche des routes',e));}catch(e){failure('recherche des routes',e);}}
 displayEvery725(()=>{if(tab==='home')refreshRoads();},3000);
 const age=t=>{if(!t)return 'jamais';const s=Math.round((Date.now()-t)/1000);return s<90?'il y a '+s+' s':'il y a '+Math.round(s/60)+' min';};
 function line(k,label){
  const s=stats[k];if(!s)return label+' : aucune demande';
  const okLast=s.okAt&&s.okAt>=s.failAt;
  return label+' : '+(okLast?'reçues '+age(s.okAt)+' ('+s.size+' éléments)':'échec '+age(s.failAt)+' — '+s.error)+' · '+s.ok+' réussies / '+s.fail+' échouées';
 }
 function gps(){
  if(!loc||!Number.isFinite(loc.ts))return 'GPS : aucune position';
  return 'GPS : précision '+(Number.isFinite(loc.acc)?Math.round(loc.acc)+' m':'inconnue')+', '+age(loc.ts)+(Number.isFinite(loc.acc)&&loc.acc>45?' (trop imprécis pour le décor)':'')+(gpsStats.ignored?' · '+gpsStats.ignored+' positions réseau ignorées':'');
 }
 window.Overpass737={stats,queue,pump,kind,gpsStats,report(){return [gps(),line('routes','Routes'),line('zones','Zones bâties'),hint&&Date.now()-hint.at<90000?'Adresse : '+(hint.type||'')+(hint.house?' (maison à moins de 60 m)':'')+' '+age(hint.at):'',gpsStats.error?'Erreur '+gpsStats.error+' '+age(gpsStats.errorAt):'',Date.now()<spareUntil?'Serveur de secours utilisé':'',coolUntil>Date.now()?'Pause après refus du serveur : '+Math.ceil((coolUntil-Date.now())/1000)+' s':''].filter(Boolean);}};

 // Diagnostic lisible dans Widgets → Vue voiture et route.
 const widgets=SETCATS.find(c=>c[0]==='Widgets');
 const view=widgets&&widgets[1].find(s=>s[0]==='Vue voiture et route');
 if(view){const before=view[1];view[1]=p=>before(p)+setRow(p,'Données du décor',Overpass737.report().map(esc).join('<br>'),'');}
})();
