'use strict';
// 7.38 (suite) : météo du widget, lever et coucher, stations (filtres, paiement, AdBlue), panneaux d'autoroute.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js','lib/qrcode-generator.js','v738.js','transfer738.js','stations738.js','highway738.js','diag738.js','settings738.js'];
const flush=()=>new Promise(r=>setImmediate(r));
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 const index=fs.readFileSync(path.join(__dirname,'../sources_assets/index.html'),'utf8');
 for(const f of ['stations738.js','highway738.js'])assert(index.includes(`src="${f}"`),'chargé par index.html : '+f);
 assert(run("/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(store.get('tkKey'))&&store.get('tk738Init')===true"),'clé Allemagne intégrée enregistrée au premier démarrage');

 // ---------- 1. Météo : type et intensité d'après le code WMO ----------
 const info=c=>{run(`weather={c:${c},day:1,t:8,hours:[]};`);return JSON.parse(run('JSON.stringify(Weather738.info())'));};
 assert.equal(info(61).rain,.5,'pluie faible');assert.equal(info(65).rain,1,'forte pluie');
 assert(info(75).snow===1&&info(71).snow<.5,'neige faible ou forte');
 assert(info(45).fog>0&&info(95).storm===true&&info(3).cover>.8&&info(1).cover<.4,'brouillard, orage, ciel couvert ou peu nuageux');
 assert.equal(info(0).cover,0,'ciel dégagé : pas de nuages');
 console.log('OK météo : pluie, neige, brouillard, orage et nuages selon le code météo');

 // ---------- 2. Dessin de la météo et du ciel ----------
 run("tab='home';render();");
 const cv=w.document.querySelector('canvas[data-road]');
 Object.defineProperty(cv,'clientWidth',{value:400,configurable:true});Object.defineProperty(cv,'clientHeight',{value:400,configurable:true});
 const frame=(scene,code,when,brg,T=10,day=1)=>{run(`store.set('roadScene','${scene}');weather={c:${code},day:${day},t:8,hours:[]};RoadSky719.now=()=>new Date('${when}');RoadSky719.cache=null;loc={lat:48.5085,lon:7.6545,spd:60,acc:5,brg:${brg},ts:new Date('${when}').getTime()};`);w.RoadDecor721.draw(cv,T,200,60);return cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;};
 const avg=(d,y0,y1)=>{const W=cv.width,o=[0,0,0];let n=0;for(let y=Math.round(cv.height*y0);y<Math.round(cv.height*y1);y++)for(let x=0;x<W;x+=3){const i=(y*W+x)*4;o[0]+=d[i];o[1]+=d[i+1];o[2]+=d[i+2];n++;}return o.map(v=>v/n);};
 const noon=avg(frame('campagne',0,'2026-11-22T13:00:00+01:00',180),.02,.2),dawn=avg(frame('campagne',0,'2026-11-22T07:50:00+01:00',120),.2,.3);
 assert(noon[2]>noon[0],'ciel bleu à midi : '+noon.map(Math.round));
 assert(dawn[0]>dawn[2]+20,'horizon orangé au lever du soleil : '+dawn.map(Math.round));
 const night=avg(frame('campagne',0,'2026-11-22T21:00:00+01:00',180,10,0),.02,.2);
 assert(night[0]+night[1]+night[2]<200,'ciel sombre la nuit : '+night.map(Math.round));
 const clear=avg(frame('ville',0,'2026-11-22T13:00:00+01:00',180),.02,.2),rain=avg(frame('ville',65,'2026-11-22T13:00:00+01:00',180),.02,.2);
 assert(Math.abs(rain[0]-rain[2])<Math.abs(clear[0]-clear[2]),'ciel gris sous la pluie : '+rain.map(Math.round)+' / '+clear.map(Math.round));
 const ground=code=>avg(frame('campagne',code,'2026-11-22T13:00:00+01:00',180),.75,.98).reduce((x,y)=>x+y,0);
 assert(ground(73)>ground(3)+120,'neige au sol : '+Math.round(ground(73))+' / '+Math.round(ground(3)));
 for(const [scene,code]of [['ville',73],['village',45],['foret',63],['autoroute',95],['campagne',3]])assert.doesNotThrow(()=>frame(scene,code,'2026-11-22T13:00:00+01:00',180),scene+' '+code);
 // Orage : un éclair déclenché au moment voulu éclaire le ciel.
 run('Weather738.storm().next=0;Weather738.storm().bolts=[];');
 frame('autoroute',95,'2026-11-22T14:00:00+01:00',180,50);
 const before=avg(frame('autoroute',95,'2026-11-22T14:00:00+01:00',180,50.05),0,.5);
 run('Weather738.storm().next=50.1;');
 const flash=avg(frame('autoroute',95,'2026-11-22T14:00:00+01:00',180,50.12),0,.5);
 assert(flash[0]+flash[1]+flash[2]>before[0]+before[1]+before[2]+30,'éclair et flash : '+flash.map(Math.round)+' / '+before.map(Math.round));
 assert(run('Weather738.storm().bolts.length')>=1,'éclair enregistré');
 console.log('OK ciel : bleu le jour, orangé au lever, sombre la nuit, gris sous la pluie ; neige, brouillard et éclairs dessinés');

 // ---------- 3. Stations : lecture du flux officiel, d'OpenStreetMap et de Tankerkönig ----------
 const fr=JSON.parse(run(`JSON.stringify(Stations738.frStation({id:6700001,latitude:'4851000',longitude:'765000',adresse:'Aire de Geispolsheim',ville:'GEISPOLSHEIM',pop:'A',gazole_prix:'1.789',gazole_maj:'2026-11-22T08:00:00+01:00',e10_prix:1769,horaires_automate_24_24:'Oui',services_service:['Automate CB 24/24','Vente de AdBlue en vrac','Toilettes publiques'],carburants_indisponibles:'E85'}))`));
 assert.equal(fr.prices.Gazole,1.789);assert.equal(fr.prices.E10,1.769,'prix en millièmes ramené en euros');
 assert(fr.auto24&&fr.card===true&&fr.adblue===true&&fr.highway&&fr.out.includes('E85'),'automate CB 24/24, AdBlue, autoroute, rupture');
 assert.equal(Math.round(fr.lat*1000)/1000,48.51,'coordonnées du flux (×100 000)');
 const fr2=JSON.parse(run(`JSON.stringify(Stations738.frStation({id:2,geom:{lat:48.6,lon:7.7},services:'{"service":["DAB (Distributeur automatique de billets)"]}',sp98_prix:'1.9'}))`));
 assert(fr2.dab&&fr2.auto24===false&&fr2.adblue===null,'services sous forme de texte JSON');
 const osm=JSON.parse(run(`JSON.stringify([Stations738.osmInfo({'payment:cash':'yes','payment:credit_cards':'yes','fuel:adblue':'yes',brand:'Esso'}),Stations738.osmInfo({'payment:cash':'no','payment:notes':'no'}),Stations738.osmInfo({})])`));
 assert(osm[0].cash===true&&osm[0].card===true&&osm[0].adblue===true&&osm[0].brand==='Esso','paiement OpenStreetMap');
 assert(osm[1].cash===false&&osm[1].card===null&&osm[2].cash===null,'non renseigné reste inconnu');
 const de=JSON.parse(run(`JSON.stringify(Stations738.deStation({id:'x1',brand:'ARAL',street:'BAB A5',place:'Baden-Baden',lat:48.7,lng:8.2,diesel:1.629,e5:1.719,e10:1.659,isOpen:true}))`));
 assert(de.prices.Gazole===1.629&&de.prices.SP95===1.719&&de.prices.E10===1.659&&!de.prices.SP98&&de.highway,'Allemagne : Diesel, Super E5, E10 ; pas de SP98');
 const merged=JSON.parse(run(`JSON.stringify(Stations738.merge([{c:'FR',id:'a',name:'',city:'STRASBOURG',lat:48.58,lon:7.75,prices:{Gazole:1.7},maj:{},services:[],out:[],card:null,cash:null,adblue:null}],[{lat:48.5803,lon:7.7503,tags:{brand:'TotalEnergies','payment:cash':'yes'}},{lat:48.6,lon:7.8,tags:{name:'Avia','fuel:adblue':'yes'}}]))`));
 assert(merged[0].name==='TotalEnergies'&&merged[0].cash===true,'enseigne et paiement complétés par OpenStreetMap à moins de 150 m');
 assert(merged.length===2&&merged[1].c==='OSM'&&merged[1].adblue===true,'station sans prix gardée pour l’AdBlue');
 // Pagination : plus de 100 stations dans le rayon.
 run(`window.__calls=[];getJSON=async url=>{__calls.push(url);if(/offset=0/.test(url))return {total_count:130,results:Array.from({length:100},(_,i)=>({id:i,geom:{lat:48.5+i*1e-4,lon:7.6},gazole_prix:1.7}))};return {total_count:130,results:Array.from({length:30},(_,i)=>({id:100+i,geom:{lat:48.6,lon:7.6+i*1e-4},gazole_prix:1.8}))};};`);
 const n=await w.Stations738.fetchFR(48.5,7.6,10);
 assert.equal(n.length,130,'toutes les stations du rayon (2 pages)');assert.equal(run('__calls.length'),2);
 run(`getJSON=async()=>({error_code:'ODSQLError',message:'Unknown field: pop'});`);
 await assert.rejects(()=>w.Stations738.fetchFR(48.5,7.6,60,"pop='A'"),/pop/,'erreur du flux remontée (filtre autoroute refusé)');
 console.log('OK stations : tous carburants, automate CB 24/24, AdBlue, paiement OpenStreetMap, pagination, erreurs du flux');

 // ---------- 4. Page Stations : filtres ----------
 run(`onLoc(48.5085,7.6545,0,6,-1,150);Stations738.state.all=Stations738.demo();Stations738.publish();st47.at=Date.now();store.set('stRad',10);store.set('st738f',{});act('tsub:fuel');tab='trips';render();act('journey733:fuel:stations');`);
 const ids=()=>JSON.parse(run('JSON.stringify(Stations738.rows().map(s=>s.name))'));
 run("act('st738:fuel:SP98')");assert.deepEqual(ids().sort(),['Esso Express','Station de l’A35','TotalEnergies'].sort(),'SP98 : seules les stations qui en vendent');
 run("act('st738:fuel:AdBlue')");assert.deepEqual(ids().sort(),['ARAL','Station de l’A35','TotalEnergies'].sort(),'AdBlue : stations qui en vendent');
 run("act('st738:fuel:Gazole');act('st738:pay:cash')");assert.deepEqual(ids().sort(),['ARAL','TotalEnergies'].sort(),'espèces acceptées');
 run("act('st738:pay:auto')");assert(ids().every(n=>['TotalEnergies','E.Leclerc','Esso Express','Station de l’A35'].includes(n))&&ids().length===4,'automate CB 24h/24');
 run("act('st738:pay:all');act('st738:sort:price')");const byPrice=JSON.parse(run('JSON.stringify(Stations738.rows().map(s=>s.p))'));
 assert(byPrice.slice(0,-1).every((p,i)=>i===0||p>=byPrice[i-1]),'la moins chère d’abord (station fermée à la fin)');
 run("act('st738:sort:distance');act('st738:rad:2')");assert(JSON.parse(run('JSON.stringify(Stations738.rows().map(s=>s.dist))')).every(d=>d<=2),'rayon de 2 km');
 run("act('st738:rad:10');act('st738:country:DE')");assert(JSON.parse(run('JSON.stringify(Stations738.rows().map(s=>s.c))')).every(c=>c==='DE'),'pays');
 run("act('st738:country:all');render()");
 const html=run("document.querySelector('.st738').textContent");
 for(const s of ['Gazole','SP95-E10','AdBlue','30 km','Espèces','CB 24h/24','La moins chère'])assert(html.includes(s),'filtre affiché : '+s);
 run("act('st738:pick:FRTotalEnergies')");assert(run("document.querySelector('.st738-card').textContent").includes('Ouvrir dans Google Maps'),'fiche avec Waze et Google Maps');
 run("window.__open=[];Android.openUrl=u=>{__open.push(u);return true;};act('st738:gmaps:FRTotalEnergies');act('st738:go:FRTotalEnergies')");
 const opened=run('JSON.stringify(__open)');assert(/google\.com\/maps\/dir\/\?api=1&destination=/.test(opened)&&/waze\.com\/ul\?ll=/.test(opened),'liens d’itinéraire : '+opened);
 assert(run('st47.list.length')>=4&&run('st47.list.every(s=>s.price>0)'),'liste du widget « Stations autour » toujours alimentée');
 console.log('OK page Stations : carburant, AdBlue, rayon, paiement, tri, pays, fiche et itinéraires');

 // ---------- 5. Autoroute : prochaine sortie et prochaine station ----------
 const ov={elements:[
  {type:'node',id:1,lat:48.500,lon:7.700,tags:{highway:'motorway_junction',ref:'4',name:'Geispolsheim'}},
  {type:'node',id:9,lat:48.5002,lon:7.7004,tags:{highway:'motorway_junction',ref:'4'}},
  {type:'way',id:10,nodes:[1,2,3],tags:{highway:'motorway_link',destination:'Strasbourg-Centre;Kehl','destination:ref':'A 350;E 25'},geometry:[{lat:48.500,lon:7.700},{lat:48.499,lon:7.7003},{lat:48.497,lon:7.701}]},
  {type:'way',id:11,nodes:[9,5,6],tags:{highway:'motorway_link',destination:'Obernai'},geometry:[{lat:48.5002,lon:7.7004},{lat:48.5012,lon:7.7005},{lat:48.503,lon:7.7006}]},
  {type:'way',id:20,nodes:[7,1,8],tags:{highway:'motorway',ref:'A 35'}},{type:'way',id:21,nodes:[7,9,8],tags:{highway:'motorway',ref:'A 35'}}]};
 w.__ov=ov;
 const exits=JSON.parse(run('JSON.stringify(Highway738.parseExits(__ov))'));
 assert.equal(exits.length,2,'deux sorties (une par sens)');
 const e4=exits.find(e=>e.id===1);assert.deepEqual(e4.dest,['Strasbourg-Centre','Kehl']);assert.deepEqual(e4.destRef,['A 350','E 25']);assert.deepEqual(e4.refs,['A35']);
 run(`Road723.match={tags:{highway:'motorway',ref:'A 35'}};Road723.at=Date.now();Road723.fresh=()=>true;Highway738.state.exits=Highway738.parseExits(__ov);`);
 const pick=JSON.parse(run('JSON.stringify(Highway738.pickExit({lat:48.520,lon:7.700},180))'));
 assert(pick&&pick.id===1&&Math.abs(pick.d-2.22)<.1,'sortie 4 vers le sud à 2,2 km (pas celle de l’autre sens) : '+JSON.stringify(pick&&[pick.id,pick.d]));
 assert.equal(run('Highway738.pickExit({lat:48.490,lon:7.700},180)'),null,'sortie dépassée : plus affichée');
 run(`Road723.match={tags:{highway:'motorway',ref:'A 4'}};`);
 assert.equal(run('Highway738.pickExit({lat:48.520,lon:7.700},180)'),null,'sortie d’une autre autoroute ignorée');
 run(`Road723.match={tags:{highway:'motorway',ref:'A 35'}};store.set('fuel','E10');Highway738.state.stations=[
  {c:'FR',name:'Aire de droite',lat:48.40,lon:7.701,prices:{E10:1.799},highway:true},
  {c:'FR',name:'Autre sens',lat:48.49,lon:7.711,prices:{E10:1.699},highway:true},
  {c:'FR',name:'Derrière',lat:48.60,lon:7.70,prices:{E10:1.5},highway:true}];`);
 const st=JSON.parse(run('JSON.stringify(Highway738.pickStation({lat:48.520,lon:7.700},180))'));
 assert(st&&st.name==='Aire de droite'&&st.price===1.799&&Math.round(st.d)===13,'prochaine station devant, du bon côté, avec le prix : '+JSON.stringify(st&&[st.name,st.d]));
 // Portique dessiné avec les vraies données.
 run(`loc={lat:48.520,lon:7.700,spd:110,acc:5,brg:180,ts:Date.now()};Highway738.compute();store.set('roadScene','autoroute');`);
 const signs=JSON.parse(run('JSON.stringify(Highway738.signs())'));
 assert(signs&&signs.exit&&signs.exit.ref==='4'&&signs.station&&signs.station.name==='Aire de droite','données des portiques');
 assert.doesNotThrow(()=>{for(const m of [300,360,1170,1195,420])w.RoadDecor721.draw(cv,10,m,110);},'portiques sortie et station dessinés');
 assert(/sorties/.test(fs.readFileSync(path.join(__dirname,'../sources_assets/v737.js'),'utf8')),'requêtes de sorties classées dans la file Overpass');
 console.log('OK autoroute : prochaine sortie du bon sens et de la bonne autoroute, prochaine station devant avec son prix, portiques dessinés');

 // ---------- 5 bis. Carte : fond de secours si le premier ne répond pas ----------
 run(`window.__div=document.createElement('div');window.L={tileLayer:(url,opt)=>({url,options:opt,h:{},on(e,f){this.h[e]=f;return this;},setUrl(u){this.url=u;},addTo(){return this;}})};
  window.__map={getContainer:()=>__div,attributionControl:{removeAttribution(){},addAttribution(){}}};Maps738.provider=0;window.__layer=Maps738.tiles(__map);`);
 assert(/arcgisonline/.test(run('__layer.url')),'fond Esri d’abord (celui de l’accueil)');
 run("for(let i=0;i<4;i++)__layer.h.tileerror();");assert(/openstreetmap\.fr/.test(run('__layer.url')),'bascule sur OpenStreetMap France');
 run("for(let i=0;i<4;i++)__layer.h.tileerror();");assert(/tile\.openstreetmap\.org/.test(run('__layer.url')),'puis OpenStreetMap');
 run("for(let i=0;i<4;i++)__layer.h.tileerror();");assert(run("!!__div.querySelector('.offline738')"),'message seulement quand aucun fond ne répond');
 run("__layer.h.tileload();");assert(run("!__div.querySelector('.offline738')"),'message retiré dès qu’une tuile arrive');
 run('delete window.L;Maps738.provider=0;');
 console.log('OK carte : fond de secours automatique, message seulement sans aucun fond');

 // ---------- 6. Réglages : clé Tankerkönig testable ----------
 run("openSet('Trajets et carburant','Carburant et stations');render();");
 const setTxt=run("document.querySelector('#screen').textContent");
 assert(setTxt.includes('Tester la clé')&&setTxt.includes('30 km'),'bouton Tester la clé et rayon 30 km');
 run(`window.__ask=[];getJSON=async url=>{__ask.push(url);return {ok:true,stations:[{id:'a'},{id:'b'}]};};document.getElementById('tk47').value='12345678-1234-4123-8123-123456789abc';act('st738:test');`);
 await flush();await flush();
 assert(run("/list\\.php.*rad=5&/.test(__ask[0])&&store.get('tkKey')==='12345678-1234-4123-8123-123456789abc'"),'clé testée puis enregistrée');
 run("act('st738:test')");await flush();assert.equal(run('__ask.filter(u=>/rad=5&/.test(u)).length'),1,'un test par minute au plus');
 console.log('OK réglages : clé Tankerkönig testée puis enregistrée, rayons 2 à 30 km');
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('Tests 7.38 météo, stations et autoroute réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
