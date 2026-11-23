'use strict';
// 7.40 : météo devant toi, bouchons (clé TomTom), péages estimés, sortie de village, saisons.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js','lib/qrcode-generator.js','v738.js','transfer738.js','stations738.js','highway738.js','v740.js','diag738.js','settings738.js'];
const flush=()=>new Promise(r=>setImmediate(r));
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 assert(Number(run('APP_VERSION'))>=7.40,'version 7.40 ou suivante');
 assert(fs.readFileSync(path.join(__dirname,'../sources_assets/index.html'),'utf8').includes('src="v740.js"'),'v740.js chargé par index.html');

 // ---------- 1. Météo devant toi ----------
 run("tab='home';render();loc={lat:48.5085,lon:7.6545,spd:80,acc:5,brg:180,ts:Date.now()};");
 const feed=(codes,precs,temps,cur)=>`(()=>{const now=Math.floor(Date.now()/1000);return {current:Object.assign({temperature_2m:6,weather_code:3,precipitation:0},${JSON.stringify(cur||{})}),minutely_15:{time:${JSON.stringify(codes)}.map((_,i)=>now+i*900),weather_code:${JSON.stringify(codes)},precipitation:${JSON.stringify(precs)},temperature_2m:${JSON.stringify(temps)}}};})()`;
 const evalWith=(here,ahead)=>{run(`V740.W.here=V740.parse(${here});V740.W.ahead=${ahead?`V740.parse(${ahead})`:'null'};V740.W.at=Date.now();V740.Alerts.dismissed={};V740.evaluate();`);return run('V740.current()&&V740.current().text');};
 assert.equal(evalWith(feed([3,3,63,63,3,3],[0,0,1.2,1.4,0,0],[6,5,4,4,5,5])),'Forte pluie dans 30 min','forte pluie annoncée avec le délai');
 assert.equal(evalWith(feed([3,61,61,3,3,3],[0,.3,.3,0,0,0],[6,6,6,6,6,6])),'Pluie dans 15 min','pluie faible');
 assert.equal(evalWith(feed([61,61,61,3,3,3],[.3,.3,.3,0,0,0],[6,6,6,6,6,6],{weather_code:61,precipitation:.3})),null,'déjà sous la pluie : pas de message');
 assert.equal(evalWith(feed([3,3,3,3,3,3],[0,0,0,0,0,0],[6,6,6,6,6,6])),null,'rien à signaler');
 assert(/^Verglas possible/.test(evalWith(feed([3,61,61,3,3,3],[0,.3,.3,0,0,0],[2,1,0,0,1,1]))),'verglas : 0 °C et pluie');
 assert.equal(run('V740.current().priority'),5,'le verglas passe avant tout');
 // Devant toi : orage à 20 km, à 80 km/h on y est dans 15 min.
 assert.equal(evalWith(feed([3,3,3,3,3,3],[0,0,0,0,0,0],[6,6,6,6,6,6]),feed([95,95,95,3,3,3],[2,2,2,0,0,0],[6,6,6,6,6,6])),'Orage dans 15 min','orage devant : délai = temps pour y arriver');
 // Le message est dans le widget ; la croix l'enlève ; il ne revient pas pour la même alerte.
 evalWith(feed([3,3,63,63,3,3],[0,0,1.2,1.4,0,0],[6,5,4,4,5,5]));run('V740.paintBanner()');
 assert(run("!!document.querySelector('#screen [data-roadbox] .alert740')"),'bandeau dans le widget de la route');
 run("act('alert740:open')");assert(run("document.querySelector('.alert740-pop').textContent").includes('Maintenant'),'détail : maintenant, puis les tranches suivantes');
 run("act('alert740:hide')");assert.equal(run("!!document.querySelector('.alert740-pop')"),false,'détail fermé');
 run("act('alert740:close')");assert.equal(run('V740.current()'),null,'croix : message enlevé');
 assert.equal(run("!!document.querySelector('#screen .alert740')"),false,'bandeau retiré');
 run('V740.evaluate()');assert.equal(run('V740.current()'),null,'la même alerte ne revient pas');
 run(`V740.W.here=V740.parse(${feed([3,71,71,3,3,3],[0,.3,.3,0,0,0],[3,2,2,2,2,2])});V740.evaluate();`);
 assert.equal(run('V740.current()&&V740.current().text'),'Neige dans 15 min','une nouvelle alerte s’affiche');
 // Repli par heure si le détail par 15 minutes est refusé.
 run(`window.__urls=[];getJSON=async u=>{__urls.push(u);if(/minutely_15/.test(u))return {error:true,reason:'Cannot initialize'};const now=Math.floor(Date.now()/1000);return {current:{temperature_2m:6,weather_code:3,precipitation:0},hourly:{time:[now,now+1800,now+5400],weather_code:[3,61,3],precipitation:[0,.8,0],temperature_2m:[6,5,5]}};};V740.W.fine=true;V740.W.at=0;V740.Alerts.dismissed={};`);
 await w.V740.wxRefresh(true);
 assert.equal(run('V740.W.fine'),false,'repli sur les prévisions par heure');
 assert.equal(run('V740.current()&&V740.current().text'),'Pluie dans moins d’une heure');
 run("store.set('wxAhead740',false);V740.evaluate();");assert.equal(run("V740.current()"),null,'désactivable');
 run("store.set('wxAhead740',true);V740.setAlert('meteo',null);");
 console.log('OK météo devant toi : pluie, forte pluie, neige, orage devant, verglas, pas de message sous la pluie, croix, repli par heure');

 // ---------- 2. Bouchons (TomTom) ----------
 run(`window.__tt=[];getJSON=async u=>{__tt.push(u);return {flowSegmentData:{currentSpeed:20,freeFlowSpeed:110,currentTravelTime:400,freeFlowTravelTime:100,roadClosure:false}};};store.set('tomtomKey740','');`);
 await w.V740.trafficCheck(true);assert.equal(run('__tt.length'),0,'sans clé : aucune demande');
 run("store.set('tomtomKey740','cle-de-test-123456789012345');loc={lat:48.5,lon:7.7,spd:100,acc:5,brg:180,ts:Date.now()};");
 await w.V740.trafficCheck(true);
 assert.equal(run('__tt.length'),2,'vitesse vérifiée à 2 km et 5 km devant');
 assert(/flowSegmentData\/absolute\/10\/json\?point=48\.48/.test(run('__tt[0]')),'point 2 km devant, cap au sud');
 assert.equal(run('V740.current()&&V740.current().text'),'Bouchon à 2 km : 20 km/h','message bouchon');
 run("getJSON=async()=>({flowSegmentData:{currentSpeed:105,freeFlowSpeed:110,currentTravelTime:100,freeFlowTravelTime:95}});V740.T.at=0;");
 await w.V740.trafficCheck(true);assert.equal(run("V740.Alerts.list.some(a=>a.source==='trafic')"),false,'circulation fluide : message retiré');
 run("window.__layers=[];window.L={tileLayer:(u,o)=>({u,addTo(m){__layers.push(u);return this;}})};window.__m={};V740.addTrafficLayer(__m);V740.addTrafficLayer(__m);delete window.L;");
 assert.equal(run('__layers.length'),1,'couche de circulation ajoutée une seule fois');
 assert(/traffic\/map\/4\/tile\/flow\/relative0/.test(run('__layers[0]')),'tuiles de circulation');
 console.log('OK bouchons : rien sans clé, vitesse à 2 et 5 km devant, message, couche de circulation sur les cartes');

 // ---------- 3. Péages estimés ----------
 run("trk={id:'peage740',t0:Date.now(),t1:Date.now(),km:0,mx:0};Road723.cache=[];Road723.fresh=()=>true;Road723.at=Date.now();store.set('toll740Rate',0.10);");
 const drive=(tags,steps,lon0)=>{run(`Road723.match={tags:${JSON.stringify(tags)}};`);for(let i=0;i<steps;i++){t.advance(1000);run(`loc={lat:48.5,lon:${lon0}+${i}*0.0004,spd:110,acc:5,brg:90,ts:Date.now()};V740.tollStep();`);}};
 drive({highway:'motorway',ref:'A 4',toll:'yes'},40,7.70);
 drive({highway:'motorway',ref:'A 35'},20,7.80);
 const km=run("V740.tollKm('peage740')");assert(km>1&&km<1.3,'seuls les km à péage comptent : '+km);
 assert(run("V740.tollHTML('peage740')").includes('Autoroute à péage')&&run("V740.tollHTML('peage740')").includes('0,10 €/km'),'affichage dans le trajet');
 run("act('v740:toll:0.12')");assert.equal(run("store.get('toll740Rate')"),0.12,'prix au km réglable');
 assert(run("RoadsTaken738.html('peage740')").includes('Autoroute à péage'),'sous les routes empruntées');
 run('trk=null');
 console.log('OK péages : km sur autoroute à péage, estimation au prix réglé, affichée avec le trajet');

 // ---------- 4. Décor : sortie de village et saisons ----------
 const cv=w.document.querySelector('canvas[data-road]');
 Object.defineProperty(cv,'clientWidth',{value:400,configurable:true});Object.defineProperty(cv,'clientHeight',{value:400,configurable:true});
 run("Road723.match={tags:{highway:'residential'}};Road723.at=Date.now();Place710.here=()=>({name:'Geispolsheim'});weather={c:1,day:1,t:8,hours:[]};RoadSky719.now=()=>new Date('2026-11-22T13:00:00+01:00');");
 run("store.set('roadScene','village');");w.RoadDecor721.draw(cv,10,300,50);
 run("store.set('roadScene','campagne');");w.RoadDecor721.draw(cv,10,310,50);
 assert.equal(run('TownExit740.name'),'GEISPOLSHEIM','panneau de sortie du village');
 for(let m=320;m<500;m+=20)w.RoadDecor721.draw(cv,10,m,50);
 assert.equal(run('TownExit740.name'),'','passé, puis retiré');
 run("store.set('roadScene','village');");w.RoadDecor721.draw(cv,10,600,50);run("store.set('roadScene','campagne');");w.RoadDecor721.draw(cv,10,610,50);
 assert.equal(run('TownExit740.name'),'','pas deux fois de suite pour le même village');
 const avg=()=>{const d=cv.getContext('2d').getImageData(0,Math.round(cv.height*.4),cv.width,Math.round(cv.height*.3)).data;const o=[0,0,0];for(let i=0;i<d.length;i+=16){o[0]+=d[i];o[1]+=d[i+1];o[2]+=d[i+2];}return o;};
 run("store.set('roadScene','foret');store.set('season730','ete');");w.RoadDecor721.draw(cv,10,200,50);const ete=avg();
 run("store.set('season730','automne');");w.RoadDecor721.draw(cv,10,200,50);const automne=avg();
 assert(automne[0]-automne[1]>ete[0]-ete[1]+1000,'forêt en automne : plus rousse qu’en été');
 run("store.set('season730','auto');");
 console.log('OK décor : panneau de sortie barré une fois en quittant le village, saisons dans la forêt');

 // ---------- 5. Réglages ----------
 const layout=JSON.parse(run('JSON.stringify(Settings738.layout())'));
 const has=(c,s)=>layout.some(([cc,subs])=>cc===c&&subs.includes(s));
 assert(has('GPS et navigation','Bouchons en direct')&&has('Météo','Météo devant toi')&&has('Trajets et carburant','Péages (estimation)'),'trois nouvelles pages de réglages');
 for(const [c,s] of [['GPS et navigation','Bouchons en direct'],['Météo','Météo devant toi'],['Trajets et carburant','Péages (estimation)']]){run(`openSet(${JSON.stringify(c)},${JSON.stringify(s)});render();`);assert(run("document.querySelector('#screen').textContent").length>200,s);}
 assert(run("document.querySelector('#screen').textContent").includes('Prix moyen au kilomètre'));
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('Tests 7.40 réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
