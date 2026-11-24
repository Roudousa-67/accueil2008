'use strict';
// 7.39 : filtres des stations en menus déroulants, panneaux d'autoroute à la vraie distance, réglages.
const assert=require('node:assert/strict');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js','lib/qrcode-generator.js','v738.js','transfer738.js','stations738.js','highway738.js','diag738.js','settings738.js'];
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 assert(Number(run('APP_VERSION'))>=7.39,'version 7.39 ou suivante');

 // ---------- 1. Stations : menus déroulants ----------
 run(`onLoc(48.5085,7.6545,0,6,-1,150);Stations738.state.all=Stations738.demo();Stations738.publish();st47.at=Date.now();store.set('stRad',10);store.set('st738f',{});act('tsub:fuel');tab='trips';render();act('journey733:fuel:stations');`);
 const keys=JSON.parse(run("JSON.stringify([...document.querySelectorAll('.st738 select[data-st738]')].map(s=>s.dataset.st738))"));
 assert.deepEqual(keys,['fuel','rad','pay','sort','country'],'cinq menus déroulants');
 assert.equal(run("document.querySelectorAll('.st738 .st738-bar').length"),0,'plus de rangées de boutons');
 const change=(key,value)=>run(`(()=>{const el=document.querySelector('.st738 select[data-st738="${key}"]');el.value='${value}';el.dispatchEvent(new Event('change',{bubbles:true}));})()`);
 change('fuel','SP98');assert.equal(run("Stations738.prefs().fuel"),'SP98','carburant choisi au menu');
 assert.equal(run("document.querySelector('.st738 select[data-st738=\"fuel\"]').value"),'SP98','menu affiché sur le choix');
 change('rad','20');assert.equal(run("store.get('stRad')"),20,'rayon choisi au menu');
 change('pay','cash');change('sort','price');change('country','DE');
 assert.deepEqual(JSON.parse(run("JSON.stringify(Stations738.prefs())")).pay,'cash');
 assert(JSON.parse(run('JSON.stringify(Stations738.rows().map(s=>s.c))')).every(c=>c==='DE'),'filtres appliqués');
 change('country','all');change('pay','all');change('fuel','Gazole');change('rad','10');
 console.log('OK stations : carburant, rayon, paiement, tri et pays en menus déroulants');

 // ---------- 2. Réglages : Panneaux d'autoroute ----------
 const layout=JSON.parse(run("JSON.stringify(Settings738.layout())"));
 const gps=layout.find(([c])=>c==='GPS et navigation');
 assert(gps&&gps[1].includes('Panneaux d’autoroute'),'page Panneaux d’autoroute dans GPS et navigation');
 run("openSet('GPS et navigation','Panneaux d’autoroute');render();");
 const txt=run("document.querySelector('#screen').textContent");
 for(const s of ['Panneaux de sortie','Tous les kilomètres','2 km et 1 km','Panneaux de station avec le prix','Petit panneau à 500 m'])assert(txt.includes(s),'réglage affiché : '+s);
 assert.deepEqual(JSON.parse(run('JSON.stringify(Highway738.prefs())')),{exits:true,stations:true,every:'km',small:true,post:true,towns:true},'réglages par défaut');
 run("act('hw739:every:classic');act('hw739:small:0');act('hw739:stations:0')");
 assert.deepEqual(JSON.parse(run('JSON.stringify(Highway738.prefs())')),{exits:true,stations:false,every:'classic',small:false,post:true,towns:true});
 run("store.set('hw739',{})");
 console.log('OK réglages : sorties, fréquence, stations, petit panneau à 500 m');

 // ---------- 3. Panneaux à la vraie distance ----------
 run("tab='home';render();");
 const cv=w.document.querySelector('canvas[data-road]');
 Object.defineProperty(cv,'clientWidth',{value:400,configurable:true});Object.defineProperty(cv,'clientHeight',{value:400,configurable:true});
 run("store.set('roadScene','autoroute');weather={c:1,day:1,t:8,hours:[]};loc={lat:48.5,lon:7.7,spd:110,acc:5,brg:180,ts:Date.now()};");
 // On roule 7 km vers la sortie 4 ; la station est 4 km plus loin.
 const drive=(from,to,setup)=>{run(setup||'');const out=[];for(let m=0;m<=(from-to)*1000;m+=50){run(`window.__d=${from}-${m}/1000;Highway738.signs=()=>({exit:{id:1,ref:'4',dest:['Strasbourg-Centre','Kehl'],destRef:['A 350'],d:__d},station:{id:9,name:'Total',d:__d+4,price:1.789,fuel:'E10',c:'FR'}});`);w.RoadDecor721.draw(cv,10+m/30,1000+m,110);}};
 const reset=()=>run("Decors726.signs739.signs.length=0;Decors726.signs739.done.clear();Decors726.signs739.log.length=0;");reset();
 drive(7,.2);
 const spawned=JSON.parse(run('JSON.stringify(Decors726.signs739.log)'));
 assert.deepEqual(spawned.filter(s=>s[0]==='exit').map(s=>s[1]),[5,4,3,2,1],'sortie : un portique tous les kilomètres');
 assert.deepEqual(spawned.filter(s=>s[0]==='station').map(s=>s[1]),[10,5,4],'station : 10 km, 5 km puis tous les kilomètres (jusqu’à 4,2 km ici)');
 // Le portique « 2 km » est placé là où la sortie est vraiment à 2 km.
 const g2=spawned.find(s=>s[0]==='exit'&&s[1]===2);assert(Math.abs((g2[2]-1000)-(7-2)*1000)<=200,'portique 2 km à sa place : '+g2[2]);
 reset();
 drive(3,.2,"store.set('hw739',{every:'classic',small:false,stations:false})");
 assert.deepEqual(JSON.parse(run('JSON.stringify(Decors726.signs739.log)')).map(s=>s[0]+s[1]),['exit2','exit1','exit0.5'],'2 km, 1 km et 500 m quand le petit panneau est désactivé');
 run("store.set('hw739',{});");
 // Données arrivées tard (sortie déjà à 1,2 km) : pas de vieux panneau « 5 km ».
 reset();
 drive(1.2,.2);
 assert(JSON.parse(run('JSON.stringify(Decors726.signs739.log)')).filter(s=>s[0]==='exit').every(s=>s[1]<=1),'pas de panneau de sortie dépassé');
 // Petit panneau à 500 m : dessiné tout de suite en haut à droite (bleu).
 run("Highway738.signs=()=>({exit:{id:1,ref:'4',dest:['Kehl'],destRef:[],d:.35},station:null});");
 w.RoadDecor721.draw(cv,50,5000,110);
 const px=JSON.parse(run(`JSON.stringify([...(c=>c.getContext('2d').getImageData(Math.round(c.width*.48),Math.round(c.height*.09),1,1))(document.querySelector('#screen canvas[data-road]')).data])`));
 assert(px[0]<70&&px[2]>140,'petit panneau bleu en haut, à côté de la vitesse (7.41) : '+px);
 run("store.set('hw739',{small:false});store.set('station741Dur',0);");w.RoadDecor721.draw(cv,50,5000,110);
 const px2=JSON.parse(run(`JSON.stringify([...(c=>c.getContext('2d').getImageData(Math.round(c.width*.48),Math.round(c.height*.09),1,1))(document.querySelector('#screen canvas[data-road]')).data])`));
 assert(!(px2[0]<70&&px2[2]>140),'petit panneau absent quand il est désactivé : '+px2);
 run("store.set('hw739',{});store.set('station741Dur',10);");
 console.log('OK autoroute : portiques à la vraie distance (tous les km ou 2 km / 1 km / 500 m), station avec prix, petit panneau à 500 m');
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('Tests 7.39 réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
