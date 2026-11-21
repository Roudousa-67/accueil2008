'use strict';
// 7.37 : requêtes cartographiques coordonnées, indice d'adresse et diagnostic du décor.
const assert=require('node:assert/strict');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js'];
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 const flush=()=>new Promise(r=>setImmediate(r));
 // Pont Android à réponse manuelle : permet de compter les requêtes en cours.
 const pending=[];
 w.Android.http=(url,id)=>{pending.push({url,id});};
 const answer=(index,ok,body)=>{const job=pending.splice(index,1)[0];w.__httpCb(job.id,ok,typeof body==='string'?body:JSON.stringify(body));return job;};
 const overpass=()=>pending.filter(p=>p.url.includes('/api/interpreter'));
 t.pos();run("store.set('roadScene','auto');tab='home';");

 // 1. Plusieurs services demandent Overpass en même temps : une seule requête part.
 run('Road723.at=0;Road723.attempt=0;RoadScene731.context.attempt=0;RoadScene731.context.at=0;');
 run('Road723.refresh(true)');run('RoadScene731.refresh()');run("getJSON('https://overpass-api.de/api/interpreter?data='+encodeURIComponent('[out:json];node(around:25000,48.58,7.74)[place];out;'))");
 await flush();
 assert.equal(overpass().length,1,'une seule requête Overpass à la fois');
 assert.match(decodeURIComponent(overpass()[0].url),/around:1000,/,'les routes passent en premier');
 assert.equal(run('Overpass737.queue.length'),2,'les deux autres attendent leur tour');

 // 2. Refus 429 : pause, puis serveur de secours pour la suite.
 answer(pending.indexOf(overpass()[0]),false,'<html><body>429 Too Many Requests: rate_limited</body></html>');
 await flush();
 assert.equal(overpass().length,0,'pause après le refus');
 const pause=t.timers.filter(x=>x.ms>=4000&&x.ms<=5000).at(-1);assert(pause,'reprise programmée après 5 s');
 t.advance(5100);pause.fn();await flush();
 assert.equal(overpass().length,1);
 assert.match(overpass()[0].url,/^https:\/\/overpass\.kumi\.systems\//,'serveur de secours après saturation');
 answer(pending.indexOf(overpass()[0]),true,{elements:[]});await flush();
 assert.equal(overpass().length,1,'la requête suivante part dès la réponse');
 answer(pending.indexOf(overpass()[0]),true,{elements:[]});await flush();
 assert.equal(run('Overpass737.queue.length'),0);
 assert.match(run('Overpass737.report().join(" | ")'),/Routes : échec .*429 Too Many Requests/);
 assert.match(run('Overpass737.report().join(" | ")'),/Zones bâties : reçues/);
 assert.match(run('Overpass737.report().join(" | ")'),/Serveur de secours utilisé/);
 // Une demande identique en attente est partagée.
 run("window.q737='https://overpass-api.de/api/interpreter?data='+encodeURIComponent('[out:json];way(1);out;');window.p1=getJSON(q737);window.p2=getJSON(q737);");
 assert.equal(run('p1===p2'),true,'demande identique partagée');
 await flush();assert.equal(overpass().length,1,'demande partagée envoyée une seule fois');
 answer(pending.indexOf(overpass()[0]),true,{elements:[]});await flush();
 assert.equal(run('Overpass737.queue.length'),0);
 console.log('OK Overpass : une requête à la fois, routes en priorité, pause et serveur de secours après refus');

 // 3. Sans données routières, l'adresse Nominatim indique l'autoroute.
 pending.length=0;
 run('Road723.cache=[];Road723.pos=null;Road723.at=0;Road723.match=null;RoadScene731.context.pos=null;');
 t.advance(1000);run('loc.lat+=0.000001');
 assert.equal(w.roadScene(),'campagne','aucune donnée : décor par défaut');
 run("window.rev737=getJSON('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat='+loc.lat.toFixed(6)+'&lon='+loc.lon.toFixed(6)+'&zoom=18')");await flush();
 const reverse=pending.find(p=>p.url.includes('nominatim'));assert(reverse);
 answer(pending.indexOf(reverse),true,{category:'highway',type:'motorway',address:{road:'A 35',city:'Strasbourg'}});await flush();
 assert.equal(run('RoadHint737(loc).kind'),'autoroute');
 t.advance(1000);run('loc.lat+=0.000001');
 assert.equal(w.roadScene(),'autoroute','autoroute reconnue par l’adresse');
 assert.match(run('RoadScene731.status.reason'),/indice adresse : motorway/);
 // Indice ancien : ignoré ; le dernier décor reste affiché faute de toute donnée.
 t.advance(95000);run('loc.lat+=0.000001');
 assert.equal(run('RoadHint737(loc)'),null,'indice de plus de 90 s ignoré');
 assert.equal(w.roadScene(),'autoroute','décor conservé sans donnée');
 t.advance(200000);run('loc.lat+=0.000001');assert.equal(w.roadScene(),'autoroute','toujours conservé après 5 min moins quelques secondes');
 t.advance(10000);run('loc.lat+=0.000001');assert.equal(w.roadScene(),'campagne','abandonné après 5 min sans aucune donnée');
 console.log('OK autoroute reconnue par l’adresse quand Overpass manque, décor conservé 5 min');

 // 5. 7.38 : maison adressée à moins de 60 m → zone habitée, même sans Overpass.
 pending.length=0;
 run("store.set('roadScene','auto');plList=[{n:'Geispolsheim-Gare',k:'village',lat:loc.lat+0.001,lon:loc.lon}];plAt=Date.now();plPos={lat:loc.lat,lon:loc.lon};");
 run("window.rev738=getJSON('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat='+loc.lat.toFixed(6)+'&lon='+loc.lon.toFixed(6)+'&zoom=18')");await flush();
 const house=pending.find(p=>p.url.includes('nominatim'));
 answer(pending.indexOf(house),true,{category:'place',type:'house',lat:String(run('loc.lat')+0.0002),lon:String(run('loc.lon')),address:{house_number:'3',road:'Rue du Fort',village:'Geispolsheim-Gare'}});await flush();
 assert.equal(run('RoadHint737(loc).kind'),'bâti','maison proche : zone habitée');
 run("store.set('roadScene','village');roadScene();store.set('roadScene','auto');");
 t.advance(1000);run('loc.lat+=0.000001');
 assert.equal(w.roadScene(),'village','village reconnu par l’adresse sans données Overpass');
 assert.match(run('RoadScene731.status.reason'),/indice adresse : maison proche/);
 console.log('OK village reconnu par une maison adressée à moins de 60 m');

 // 6. 7.38 : position réseau imprécise ignorée, étapes de réception isolées.
 pending.length=0;
 run('onLoc(48.58,7.74,30,6,90,150)');const precise=run('loc.acc');
 run('onLoc(48.583,7.736,-1,1400,-1,-9999)');
 assert.equal(run('loc.acc'),precise,'position réseau ignorée tant que le GPS précis est récent');
 assert.equal(run('Overpass737.gpsStats.ignored'),1);
 t.advance(6000);run('onLoc(48.583,7.736,-1,1400,-1,-9999)');
 assert.equal(run('loc.acc'),1400,'acceptée quand le GPS précis manque depuis plus de 5 s');
 run("window.tripOnLoc=()=>{throw Error('trajet illisible')};Road723.at=0;Road723.attempt=0;");
 t.advance(1000);run('onLoc(48.58,7.74,30,6,90,150)');await flush();
 assert.equal(run('loc.acc'),6,'position enregistrée malgré l’erreur');
 assert(pending.some(p=>/around%3A1000%2C|around:1000,/.test(p.url)),'routes demandées malgré l’erreur du trajet');
 assert.match(run('Overpass737.report().join(" | ")'),/Erreur réception GPS : trajet illisible/);
 for(const p of overpass())answer(pending.indexOf(p),true,{elements:[]});await flush();
 console.log('OK position réseau ignorée, recherche des routes protégée des erreurs, erreur affichée');

 // 4. Diagnostic visible dans les réglages.
 run("tab='settings';openSet('Widgets','Vue voiture et route');render();");
 const text=w.document.body.textContent;
 assert.match(text,/Données du décor/);assert.match(text,/GPS : précision \d+ m/);assert.match(text,/Routes : /);
 assert.match(text,/État du décor/);
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 t.dom.window.close();
 console.log('OK diagnostic du GPS et des requêtes affiché dans Widgets → Vue voiture et route');
})().catch(e=>{console.error(e);process.exitCode=1;});
