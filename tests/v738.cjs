'use strict';
// 7.38 : cartes, routes empruntées, soleil et lune, rapport de diagnostic, transfert local, réglages rangés.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js','lib/qrcode-generator.js','v738.js','transfer738.js','diag738.js','settings738.js'];
const flush=()=>new Promise(r=>setImmediate(r));
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 const index=fs.readFileSync(path.join(__dirname,'../sources_assets/index.html'),'utf8');
 for(const f of ['v738.js','transfer738.js','diag738.js','settings738.js'])assert(index.includes(`src="${f}"`),'chargé par index.html : '+f);
 assert(!index.includes('transfer734.js'),'ancien transfert par Internet retiré');

 // ---------- 1. Cartes : Leaflet chargé à la demande ----------
 const scripts=[];run('Perf725.script=src=>{window.__scripts=(window.__scripts||[]);__scripts.push(src);return Promise.resolve();}');
 run(`const pts=[];for(let i=0;i<30;i++)pts.push([48.5085+i*.0006,7.6545+i*.0004]);localStorage.setItem('a08t_essai',plEnc(pts));store.set('trkIndex',[{id:'essai',t0:Date.now()-3600e3,t1:Date.now()-3000e3,km:5.2,mx:70,from:'Départ',to:'Arrivée',n:30}]);tab='trips';render();act('journey733:select:essai');`);
 await flush();
 const asked=run('window.__scripts');
 assert(asked.length>=1&&asked.length<=3&&asked.every(s=>s==='lib/leaflet.js'),'Leaflet demandé pour la carte du trajet, 3 essais au plus : '+asked);
 for(let i=0;i<5;i++){run('render()');await flush();}
 assert(run('window.__scripts.length')<=3,'pas de demandes sans fin si la bibliothèque ne s’installe pas');
 // Charger la vraie bibliothèque dans la page de test, comme le ferait l'autoradio.
 run(fs.readFileSync(path.join(__dirname,'../sources_assets/lib/leaflet.js'),'utf8'));
 run('render()');await flush();
 assert(run("!!document.querySelector('#journeyMap733.leaflet-container')"),'carte du trajet créée');
 assert(run("document.querySelectorAll('#journeyMap733 path').length")>=2,'tracé dessiné (contour et ligne)');
 assert(run("document.body.textContent.includes('Routes empruntées')"),'routes empruntées affichées');
 console.log('OK carte du trajet : bibliothèque chargée à la demande, tracé et routes empruntées');

 // ---------- 2. Routes empruntées pendant la conduite ----------
 run("trk={id:'route738',t0:Date.now(),t1:Date.now(),km:0,mx:0};trkPts=[];");
 const road=(id,tags,lat)=>({type:'way',id,tags,geometry:[{lat,lon:7.60},{lat,lon:7.70}]});
 const drive=(tags,steps)=>{w.cache738=[road(1,tags,48.5085)];run('Road723.cache=cache738;Road723.pos={lat:48.5085,lon:7.65};Road723.at=Date.now();');for(let i=0;i<steps;i++){t.advance(1000);run(`loc={lat:48.5085,lon:${7.62}+(window.__x=(window.__x||0)+.0007),acc:6,spd:50,brg:90,ts:Date.now()};Road723.apply();RoadsTaken738.step();`);}};
 drive({highway:'secondary',ref:'D 1083',name:'Route de Strasbourg'},12);
 drive({highway:'motorway',ref:'A 35'},20);
 const list=JSON.parse(run("JSON.stringify(RoadsTaken738.summary('route738'))"));
 assert.deepEqual(list.map(r=>r.n),['D 1083 · Route de Strasbourg','A 35'],'routes notées dans l’ordre');
 assert(list[1].km>list[0].km&&list[1].km>.8,'kilomètres par route');
 run('trk=null');
 console.log('OK routes empruntées notées pendant la conduite, avec les kilomètres');

 // ---------- 3. Services suivis ----------
 w.Android.http=(url,id)=>queueMicrotask(()=>w.__httpCb(id,!url.includes('economie'),url.includes('economie')?'Service indisponible':'{"ok":1}'));
 await run("getJSON('https://api.open-meteo.com/v1/forecast?x=1').catch(()=>{})");
 await run("getJSON('https://data.economie.gouv.fr/api/x').catch(()=>{})");
 assert.equal(run("Services738['Météo'].ok"),1);
 assert.equal(run("Services738['Prix carburant France'].fail"),1);
 assert.match(run("Services738['Prix carburant France'].error"),/Service indisponible/);
 console.log('OK réponses et échecs suivis par service');

 // ---------- 4. Soleil devant ou derrière la voiture ----------
 run("tab='home';render();");
 const cv=w.document.querySelector('canvas[data-road]');
 Object.defineProperty(cv,'clientWidth',{value:400,configurable:true});Object.defineProperty(cv,'clientHeight',{value:400,configurable:true});
 run("store.set('roadScene','campagne');weather={c:0,day:1,t:8,hours:[]};RoadSky719.now=()=>new Date('2026-11-22T12:15:00+01:00');");
 const brightest=brg=>{run(`loc={lat:48.5085,lon:7.6545,spd:60,acc:5,brg:${brg},ts:Date.now()};`);w.RoadDecor721.draw(cv,10,200,60);const d=cv.getContext('2d').getImageData(0,0,cv.width,Math.round(cv.height*.3)).data;let m=0;for(let i=0;i<d.length;i+=4)m=Math.max(m,d[i]+d[i+1]+d[i+2]);return m;};
 const south=brightest(180),north=brightest(0);
 assert(south>=690,'soleil visible cap au sud (disque #fff4cc) : '+south);
 assert(north<south-40,'pas de soleil cap au nord (il est derrière) : '+north);
 run("RoadSky719.now=()=>new Date('2026-11-22T22:30:00+01:00');store.set('roadScene','ville');");
 assert.doesNotThrow(()=>w.RoadDecor721.draw(cv,10,200,60),'lune et étoiles la nuit');
 run('RoadSky719.now=()=>new Date();');
 console.log('OK soleil dessiné quand il est devant la voiture, absent quand il est derrière');

 // ---------- 5. Transfert local avec un faux module Android ----------
 const files={};let token='';const kept=new Set();
 w.Transfer738Native={start:()=>'',stop:()=>'',status:()=>JSON.stringify({native:true,running:true,port:8738,ips:['192.168.43.1'],used:120000,quota:1073741824,files:Object.keys(files).length,received:0}),
  newToken:(kind,min,file)=>(token='a'.repeat(48)),list:()=>JSON.stringify(Object.keys(files).map(n=>({name:n,size:files[n].length,time:Date.now(),kept:kept.has(n)}))),
  dataUrl:n=>files[n]||'',text:n=>files[n]||'',saveText:(n,txt)=>{files[n]=txt;return JSON.stringify({ok:true,path:n});},remove:n=>delete files[n],keep:(n,v)=>v?kept.add(n):kept.delete(n),keepOnly:s=>{kept.clear();String(s).split('\n').filter(Boolean).forEach(n=>kept.add(n));}};
 run("tab='home';render();act('transfer738:ticket')");
 assert(run("!!document.querySelector('[data-transfer738] svg')"),'QR affiché');
 assert(run("document.querySelector('[data-transfer738]').textContent.includes('192.168.43.1')"),'adresse Wi-Fi de l’autoradio indiquée');
 files['20261123-081600-ticket-ticket.jpg']='data:image/jpeg;base64,/9j/AAAA';
 run("Transfer738.onReceived({name:'20261123-081600-ticket-ticket.jpg',kind:'ticket',type:'jpg',size:1200})");
 assert.equal(run("!!document.querySelector('[data-transfer738]')"),false,'QR fermé à la réception');
 assert.equal(run("Journeys733.state.view"),'fuel','fiche de plein ouverte');
 run("Journeys733.saveFill&&0");
 assert(run("Transfer738.status().url")==='http://192.168.43.1:8738');
 w.Transfer738Native.status=()=>JSON.stringify({native:true,running:true,port:8738,ips:[],used:0,quota:1073741824});
 run("act('transfer738:gpx')");
 assert(run("document.querySelector('[data-transfer738]').textContent.includes('point d’accès')"),'sans Wi-Fi : marche à suivre du point d’accès');
 run("act('transfer738:close')");
 console.log('OK transfert : QR local, réception du ticket, consigne du point d’accès sans Wi-Fi');

 // ---------- 6. Réglages rangés ----------
 const layout=JSON.parse(run('JSON.stringify(Settings738.layout())'));
 assert.deepEqual(layout.map(c=>c[0]),['Accueil et affichage','Widgets','GPS et navigation','Véhicule','Trajets et carburant','Météo','Entretien','Système'],'8 rubriques');
 for(const [from,to] of [[['Navigation','Stations essence'],['Trajets et carburant','Carburant et stations']],[['Widgets','Barre des raccourcis'],['Accueil et affichage','Barre de raccourcis']],[['Véhicule','Carburant'],['Trajets et carburant','Carburant et stations']],[['Système','Diagnostic et rapport'],['Système','Rapport de diagnostic']],[['Mises à jour','Version'],['Système','Mises à jour']],[['Navigation','Paysages et météo'],['Widgets','Vue voiture et route']],[['Trajets et carburant','Importer depuis le téléphone'],['Trajets et carburant','Transfert depuis le téléphone']]]){
  run(`openSet(${JSON.stringify(from[0])},${JSON.stringify(from[1])})`);
  assert.deepEqual([run('SETCATS[setCat][0]'),run('SETCATS[setCat][1][setSub][0]')],to,'ancien lien '+from.join(' › '));
 }
 const html=(c,s)=>run(`(()=>{const cat=SETCATS.find(x=>x[0]===${JSON.stringify(c)});return cat[1].find(x=>x[0]===${JSON.stringify(s)})[1](palette());})()`);
 assert(!html('Accueil et affichage','Barre de raccourcis').includes('Nombre de raccourcis'),'« Nombre de raccourcis » retiré');
 assert(html('Accueil et affichage','Barre de raccourcis').includes('assign:gps'),'choix de l’appli par bouton conservé');
 assert.equal((html('Trajets et carburant','Carburant et stations').match(/fuel:E10/g)||[]).length,1,'un seul choix de carburant');
 assert(!html('GPS et navigation','Cadre GPS et alignement').includes('frame710:immersive'),'une seule commande pour masquer la barre');
 assert(!/N\d\d · /.test(html('Système','Stockage et nettoyage')+html('Système','Mises à jour')),'codes internes retirés');
 assert(html('Widgets','Vue voiture et route').includes('decor721:toggle:4'),'roues de la voiture 3D gardées');
 let pages=0;for(const [c,subs] of layout)for(const s of subs){html(c,s);pages++;}
 assert(pages>=40,'toutes les pages s’affichent : '+pages);
 run("tab='trips';act('tsub:fuel');act('journey733:fuel:stations');");
 assert(!run("document.body.innerHTML.includes('value=\"LU\"')"),'choix Luxembourg sans source retiré');
 console.log('OK réglages en 8 rubriques, doublons fusionnés, anciens liens redirigés, '+pages+' pages affichées');

 // ---------- 7. Rapport de diagnostic ----------
 w.Android.http=(url,id)=>queueMicrotask(()=>w.__httpCb(id,true,'{}'));
 run("openSet('Système','Rapport de diagnostic');");
 await run('Diag738.run()');
 const r=JSON.parse(run('JSON.stringify({cats:Diag738.report.cats.map(c=>c.id),text:Diag738.report.text,file:Diag738.report.file,counts:Diag738.report.counts})'));
 for(const id of ['gps','carto','decor','trajets','stations','transfert','reglages','appli','erreurs'])assert(r.cats.includes(id),'catégorie '+id);
 assert.match(r.text,/pages de réglages vérifiées : toutes s’affichent/);
 assert.match(r.text,/Les 5 décors se dessinent/);
 assert.match(r.text,/Serveur en marche|aucun réseau Wi-Fi/);
 assert(r.file&&r.file.ok&&files[r.file.path].includes('<html'),'rapport enregistré en fichier HTML');
 assert(run("document.body.textContent.includes('Créer un nouveau rapport')"),'page du rapport affichée');
 assert.equal(run("dgRep.text===Diag738.report.text"),true,'envoi e-mail, WhatsApp et copie du rapport complet');
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 t.dom.window.close();
 console.log('OK rapport de diagnostic complet : catégories, réglages et décors vérifiés, fichier enregistré');
})().catch(e=>{console.error(e);process.exitCode=1;});
