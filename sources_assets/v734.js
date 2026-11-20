/* Route cartographiée en cache et état de la détection. */
(() => {
 'use strict';
 const cached=store.get('roadCache734',null);
 if(cached&&Array.isArray(cached.elements)&&cached.elements.length<=200&&Place710.valid(cached.pos)&&Number.isFinite(cached.at)&&Date.now()>=cached.at&&Date.now()-cached.at<30*60000){
  Road723.cache=cached.elements;Road723.pos=cached.pos;Road723.at=cached.at;
 }
 const widgets=SETCATS.find(c=>c[0]==='Widgets');
 const view=widgets?.[1].find(s=>s[0]==='Vue voiture et route');
 if(view){const before=view[1];view[1]=p=>before(p)+setRow(p,'État du décor',
  (store.get('roadScene','auto')==='auto'?'Mode automatique':'Mode manuel : '+store.get('roadScene')+' (le décor ne change plus seul)')+' · Décor affiché : '+roadScene()+(window.RoadScene731&&RoadScene731.status&&RoadScene731.status.reason&&store.get('roadScene','auto')==='auto'?' ('+RoadScene731.status.reason+')':'')+' · '+Road723.status()+' · '+Math.round((curSpeed()||{}).v||0)+' km/h',
  chipBtn(p,'scene:auto','Détection automatique',store.get('roadScene','auto')==='auto')+chipBtn(p,'road723:refresh','Actualiser la route'));
 }
})();
