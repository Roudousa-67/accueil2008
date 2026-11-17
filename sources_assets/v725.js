/* 7.25 : intégration de la gestion des performances, sans remise à zéro. */
'use strict';
window.Map725={
 pending:null,
 mount(slot,p){
  if(map){slot.appendChild($('map'));if(lastLight!==!!p.light){lastLight=!!p.light;tiles.setUrl(p);}setTimeout(()=>{if(!Perf725.paused()&&map&&document.querySelector('#screen .mapslot')){map.invalidateSize();if(loc&&follow)map.setView([loc.lat,loc.lon],map.getZoom(),{animate:false});}},30);return;}
  if(this.pending)return;
  this.pending=Lazy725.map().then(()=>{
   if(Perf725.paused()||!document.querySelector('#screen .mapslot'))return;
   try{initMap();}catch(e){
    if(Lazy725.forceLeaflet)throw e;
    Lazy725.forceLeaflet=true;
    return Perf725.script('lib/leaflet.js').then(()=>{if(!Perf725.paused()&&document.querySelector('#screen .mapslot'))initMap();});
   }
  }).then(()=>{const current=document.querySelector('#screen .mapslot');if(map&&current&&!Perf725.paused())this.mount(current,curP||p);})
  .catch(e=>{console.log('carte',e);toast('Carte interne indisponible. Tu peux ouvrir ton GPS habituel.');})
  .finally(()=>{this.pending=null;});
 }
};
window.Performance725=(()=>{
 let gpsTimer=null,diagnosticTimer=null,renderRAF=0,resuming=false,refreshKey='';
 const originalRender=window.render,originalPaint=window.paint;
 function gpsLoop(){
  const needed=!Perf725.paused()&&tab==='home'&&gbLive;
  if(needed&&!gpsTimer)gpsTimer=displayEvery725(()=>Frame710.sync(),1000);
  if(!needed&&gpsTimer){Perf725.cancel(gpsTimer);gpsTimer=null;}
 }
 function updateDiagnostic(){
  const s=Perf725.stats(),fmt=v=>v===null?'Indisponible':Number(v).toFixed(1),values={
   startup:s.startupMs===null?'En attente':fmt(s.startupMs)+' ms (premier rendu)',
   fps:fmt(s.fps)+' images/s',draw:fmt(s.drawMs)+' ms',
   render:fmt(s.renderMs)+' ms',timers:s.intervals+' intervalles · '+s.timeouts+' délais JS observés',
   display:s.displayTimers+' minuteries d’affichage',loops:s.roadLoops+' route · '+s.carLoops+' voiture 3D',
   memory:s.jsBytes===null?'Non fournie par cette WebView':(s.jsBytes/1048576).toFixed(1)+' Mo',
   pending:store.pending()+' écritures en attente'+(store.error()?' · '+store.error():'')
  };
  document.querySelectorAll('[data-perf725]').forEach(el=>{const value=values[el.dataset.perf725];if(value!==undefined&&el.textContent!==value)el.textContent=value;});
 }
 window.requestRender725=function(){
  if(renderRAF||Perf725.paused())return;
  renderRAF=requestAnimationFrame(()=>{renderRAF=0;render();});
 };
 window.render=function(){
  if(document.hidden||Perf725.paused()||resuming)return;
  if(renderRAF){cancelAnimationFrame(renderRAF);renderRAF=0;}
  const at=performance.now(),result=originalRender.apply(this,arguments);
  Perf725.render(performance.now()-at);
  RoadLoop725.refresh();gpsLoop();
  const need=!!document.querySelector('[data-perf725]');
  if(need&&!diagnosticTimer)diagnosticTimer=displayEvery725(updateDiagnostic,1000);
  if(!need&&diagnosticTimer){Perf725.cancel(diagnosticTimer);diagnosticTimer=null;}
  updateDiagnostic();return result;
 };
 window.paint=function(){
  if(Perf725.paused())return;
  const result=originalPaint.apply(this,arguments);
  const key=[(curSpeed()||{}).v||0,roadKind().wx,roadScene(),Math.floor(Date.now()/60000)].join('|');
  if(key!==refreshKey){refreshKey=key;RoadLoop725.invalidate();}
  return result;
 };
 const oldResume=window.onResumeHome,oldPause=window.onPauseHome;
 window.onPauseHome=function(){
  Perf725.suspend(true);store.flush();RoadLoop725.stop();
  if(renderRAF){cancelAnimationFrame(renderRAF);renderRAF=0;}
  if(window.Car3D&&Car3D.pause)Car3D.pause();
  if(window.GpsDock&&Frame710.embedded())try{GpsDock.gpsVisible(false);}catch(e){}
  if(oldPause)oldPause.apply(this,arguments);
 };
 let resumed=false;
 window.onResumeHome=function(){
  if(document.hidden)return;
  const changed=Perf725.suspend(false);
  if(resumed&&!changed)return;
  resumed=true;resuming=true;
  try{if(oldResume)oldResume.apply(this,arguments);}finally{resuming=false;}
  render();
  if(window.Car3D&&Car3D.resume)Car3D.resume();
 };
 document.addEventListener('visibilitychange',()=>{if(document.hidden)onPauseHome();else onResumeHome();});
 window.addEventListener('resize',()=>{if(!Perf725.paused())RoadLoop725.refresh();});
 const oldQuality=Decor721.quality.bind(Decor721);
 Decor721.quality=()=>{const wanted=oldQuality();if(!store.get('perf725Guard',true))return wanted;return ['calme','normal','riche'][Math.min(['calme','normal','riche'].indexOf(wanted),Perf725.cap())]||wanted;};
 const oldAct=window.act;
 window.act=function(a,long){
  if(a==='perf725:guard'){store.set('perf725Guard',!store.get('perf725Guard',true));Perf725.resetGuard();render();return;}
  if(a==='perf725:reset'){Perf725.resetGuard();toast('Niveau de décor demandé rétabli.');render();return;}
  return oldAct.apply(this,arguments);
 };
 const system=SETCATS.find(c=>c[0]==='Système')||SETCATS.find(c=>/Système/.test(c[0]));
 if(system)system[1].push(['Diagnostic · Performances',p=>{
  const row=(label,key)=>setRow(p,label,'Mesure locale sur cet appareil.','<b data-perf725="'+key+'">…</b>');
  return '<p>Mesures de cette session. Le temps de dessin mesure le calcul JavaScript, pas le GPU. Le compteur ne comprend pas les tâches natives Android.</p>'+
   row('Démarrage → premier accueil rendu','startup')+row('Cadence de la route','fps')+row('Dessin moyen de la route','draw')+row('Rendu complet moyen','render')+
   row('Intervalles JavaScript','timers')+row('Minuteries d’affichage','display')+row('Animation de route','loops')+row('Mémoire JavaScript','memory')+row('Enregistrement des préférences','pending')+
   setRow(p,'Protection de fluidité','Après plusieurs secondes au-dessus de 20 ms par dessin, réduit temporairement le niveau. Tes préférences restent conservées.',chipBtn(p,'perf725:guard',store.get('perf725Guard',true)?'Activée':'Désactivée',store.get('perf725Guard',true)))+
   setRow(p,'Rétablir le niveau demandé','Relance l’essai sans modifier les interrupteurs de décor.',chipBtn(p,'perf725:reset','Rétablir'));
 }]);
 // Les anciennes sauvegardes parcourent localStorage : écrire le cache avant.
 for(const name of ['saveBackup','exportBackup'])if(typeof window[name]==='function'){const old=window[name];window[name]=function(){store.flush();return old.apply(this,arguments);};}
 const oldWindowSync=Window723.sync;Window723.sync=function(){if(Perf725.paused())return;return oldWindowSync.apply(this,arguments);};
 return {refresh:gpsLoop,diagnostic:updateDiagnostic};
})();
