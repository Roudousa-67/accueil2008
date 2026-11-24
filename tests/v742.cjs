'use strict';
// 7.42 : décor juste en ville près d'une voie rapide, sorties des voies rapides et sorties
// rapprochées toujours annoncées, enseigne des stations d'autoroute.
const assert=require('node:assert/strict');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js','lib/qrcode-generator.js','v738.js','transfer738.js','stations738.js','highway738.js','v740.js','diag738.js','settings738.js'];
const flush=async()=>{for(let i=0;i<6;i++)await new Promise(r=>setImmediate(r));};
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 assert(Number(run('APP_VERSION'))>=7.42,'version 7.42 ou suivante');

 // ---------- 1. Décor : rue de Strasbourg à côté de la M351 ----------
 run("store.set('roadScene','auto')");t.pos(48.5905,7.7035);run('loc.spd=15');
 w.m351=[{type:'way',id:51,tags:{highway:'trunk',ref:'M 351',maxspeed:'90'},geometry:[{lat:48.5855,lon:7.7035},{lat:48.5955,lon:7.7035}]}];
 const road=()=>run("Road723.cache=m351;Road723.pos={...loc};Road723.at=Date.now();");
 road();assert.equal(w.roadScene(),'autoroute','sans adresse : voie rapide retenue');
 const nomi=async obj=>{const h0=w.Android.http;w.Android.http=(url,id)=>{queueMicrotask(()=>w.__httpCb(id,true,JSON.stringify(obj)));};await run("getJSON('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat='+loc.lat+'&lon='+loc.lon)");w.Android.http=h0;};
 await nomi({lat:'48.5905',lon:'7.7037',category:'building',type:'house',addresstype:'building',address:{house_number:'12',road:'Avenue Pierre Corneille',city:'Strasbourg'}});
 t.advance(1000);road();w.roadScene();t.advance(7000);road();
 const city=w.roadScene();
 assert(['ville','village'].includes(city),'à 15 km/h dans l’avenue : décor de ville, pas autoroute ('+city+')');
 assert(run('RoadScene731.status.reason').includes('voie rapide voisine ignorée'),'raison visible dans le diagnostic');
 t.advance(1000);run('loc.spd=100');road();assert.equal(w.roadScene(),'autoroute','à 100 km/h sur la M351 : autoroute');
 t.advance(1000);run('loc.spd=100');w.m351[0].tags.maxspeed='50';road();w.roadScene();t.advance(7000);road();
 assert.notEqual(w.roadScene(),'autoroute','boulevard « trunk » limité à 50 : jamais autoroute');
 w.m351[0].tags.maxspeed='90';
 // Vraie autoroute dont l'adresse est l'autoroute elle-même : on y reste, même lentement (bouchon).
 await nomi({lat:'48.5905',lon:'7.7035',category:'highway',type:'trunk',address:{road:'A 35',city:'Strasbourg'}});
 w.m351[0].tags.ref='A 35';t.advance(60000);run('loc.spd=10');road();w.roadScene();t.advance(7000);road();
 assert.equal(w.roadScene(),'autoroute','bouchon sur l’autoroute : décor autoroute conservé');
 console.log('OK décor : rue en ville près d’une voie rapide = ville ; voie rapide à vitesse normale = autoroute ; bouchon = autoroute');

 // ---------- 2. Sorties des voies rapides (bretelles « trunk_link ») ----------
 assert(run('Highway738.exitQuery(48.6,7.7)').includes('(motorway|trunk)_link'),'bretelles des voies rapides demandées');
 const ex=JSON.parse(run(`JSON.stringify(Highway738.parseExits({elements:[{type:'node',id:1,lat:48.6,lon:7.7,tags:{highway:'motorway_junction',ref:'3'}},{type:'way',id:10,tags:{highway:'trunk_link',destination:'Hautepierre'},nodes:[1,2],geometry:[{lat:48.6,lon:7.7},{lat:48.601,lon:7.7001}]},{type:'way',id:11,tags:{highway:'trunk',ref:'M 351'},nodes:[0,1,3]}]}))`));
 assert.equal(ex.length,1,'sortie de voie rapide reconnue');assert.deepEqual(ex[0].dest,['Hautepierre']);assert.equal(ex[0].ref,'3');
 console.log('OK sorties des voies rapides (M35, M351, N4…) reconnues');

 // ---------- 3. Sortie découverte tard : un portique quand même ----------
 run("tab='home';render();");
 const cv=w.document.querySelector('canvas[data-road]');
 Object.defineProperty(cv,'clientWidth',{value:400,configurable:true});Object.defineProperty(cv,'clientHeight',{value:400,configurable:true});
 run("store.set('roadScene','autoroute');store.set('hw739',{});Decors726.signs739.signs.length=0;Decors726.signs739.done.clear();");
 run("Highway738.signs=()=>({exit:{id:77,ref:'4',dest:['Hautepierre'],destRef:['M 351'],refs:[],d:0.9},station:null});");
 w.RoadDecor721.draw(cv,10,1000,110);
 let ex7=JSON.parse(run("JSON.stringify(Decors726.signs739.signs.filter(g=>g.kind==='exit').map(g=>g.T))"));
 assert.deepEqual(ex7,[0.3],'sortie à 900 m découverte tard : portique « 300 m » tout de suite');
 w.RoadDecor721.draw(cv,10,1010,110);
 ex7=JSON.parse(run("JSON.stringify(Decors726.signs739.signs.filter(g=>g.kind==='exit').map(g=>g.T))"));
 assert.equal(ex7.length,1,'un seul portique de rattrapage');
 run("Decors726.signs739.signs.length=0;Decors726.signs739.done.clear();Highway738.signs=()=>({exit:{id:78,ref:'5',dest:['Kehl'],destRef:[],refs:[],d:5.5},station:null});");
 w.RoadDecor721.draw(cv,10,2000,110);
 assert.deepEqual(JSON.parse(run("JSON.stringify(Decors726.signs739.signs.map(g=>g.T))")),[5],'sortie vue de loin : distances rondes comme avant');
 run("Decors726.signs739.signs.length=0;Decors726.signs739.done.clear();Highway738.signs=()=>({exit:{id:79,ref:'6',dest:['Erstein'],destRef:[],refs:[],d:2.62},station:null});");
 w.RoadDecor721.draw(cv,10,2500,110);run("Highway738.signs=()=>({exit:{id:79,ref:'6',dest:['Erstein'],destRef:[],refs:[],d:2.6},station:null});");w.RoadDecor721.draw(cv,10,2520,110);
 assert.deepEqual(JSON.parse(run("JSON.stringify(Decors726.signs739.signs.map(g=>g.T))")),[2],'sortie vue juste avant 2 km : un seul portique, pas de doublon');
 console.log('OK portiques : sortie rapprochée annoncée tout de suite, une seule fois ; distances rondes inchangées');

 // ---------- 4. Enseigne de la station ----------
 t.setels([{type:'node',lat:48.6001,lon:7.7001,tags:{amenity:'fuel',brand:'TotalEnergies',name:'Relais de la Plaine'}},{type:'node',lat:48.61,lon:7.71,tags:{amenity:'fuel',brand:'Esso'}}]);
 const st=()=>JSON.parse(run("JSON.stringify(Highway738.withBrand({id:'fr9',name:'',lat:48.6,lon:7.7,d:5,price:1.789}))"));
 assert.equal(st().name,'','pas encore d’enseigne : demande envoyée');
 await flush();
 assert.equal(st().name,'TotalEnergies','enseigne de la station la plus proche (OpenStreetMap)');
 assert.equal(JSON.parse(run("JSON.stringify(Highway738.withBrand({id:'fr10',name:'Esso Express',lat:48.7,lon:7.7}))")).name,'Esso Express','enseigne déjà connue gardée');
 run("Decors726.signs739.signs.length=0;Decors726.signs739.done.clear();Highway738.signs=()=>({exit:null,station:{id:'fr9',name:'Carrefour Market',d:2.2,price:1.749,fuel:'E10',c:'FR'}});");
 w.RoadDecor721.draw(cv,10,3000,110);w.RoadDecor721.draw(cv,10,3400,110);
 console.log('OK enseigne des stations d’autoroute affichée en entier');
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('Tests 7.42 réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
