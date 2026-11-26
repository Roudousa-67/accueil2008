'use strict';
// 7.41 : panneaux dans l'image (village, station, sortie à 500 m), durées réglables,
// nom du village vérifié toutes les 10 s, portiques sans flèches, envoi par QR en 4G.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js','lib/qrcode-generator.js','v738.js','transfer738.js','stations738.js','highway738.js','v740.js','diag738.js','settings738.js'];
const flush=()=>new Promise(r=>setImmediate(r));
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 assert(Number(run('APP_VERSION'))>=7.41,'version 7.41 ou suivante');
 const src=fs.readFileSync(path.join(__dirname,'../sources_assets/decors726.js'),'utf8');
 const gantry=src.slice(src.indexOf('function mgantry(z=90,forced){'),src.indexOf('function mrestArea(){'));
 assert(!/downArrow\(/.test(gantry),'portiques sans flèches');

 run("tab='home';render();");
 const cv=w.document.querySelector('canvas[data-road]');
 Object.defineProperty(cv,'clientWidth',{value:400,configurable:true});Object.defineProperty(cv,'clientHeight',{value:400,configurable:true});
 const blueAt=(fx,fy)=>JSON.parse(run(`(c=>{const p=c.getContext('2d').getImageData(Math.round(c.width*${fx}),Math.round(c.height*${fy}),1,1).data;return JSON.stringify(p[0]<70&&p[2]>140);})(document.querySelector('#screen canvas[data-road]'))`));
 run("weather={c:1,day:1,t:8,hours:[]};RoadSky719.now=()=>new Date('2026-11-23T12:00:00+01:00');loc={lat:48.5,lon:7.7,spd:50,acc:5,brg:180,ts:Date.now()};");

 // ---------- 1. Village : nom à l'entrée, barré à la sortie, durée réglable ----------
 run("Road723.fresh=()=>true;Road723.match={tags:{highway:'residential'}};Road723.at=Date.now();Place710.here=()=>({name:'Geispolsheim'});store.set('town741Dur',10);");
 run("store.set('roadScene','village');");w.RoadDecor721.draw(cv,10,300,50);
 let town=JSON.parse(run('JSON.stringify(Hud741.town)'));
 assert(town&&town.name==='GEISPOLSHEIM'&&!town.exit,'panneau du village à l’entrée');
 assert(Math.abs(town.until-run('Date.now()')-10000)<200,'affiché 10 secondes');
 t.advance(11000);run('Road723.at=Date.now();');w.RoadDecor721.draw(cv,10,320,50);
 assert.equal(run('Hud741.town'),null,'retiré après 10 secondes');
 w.RoadDecor721.draw(cv,10,340,50);assert.equal(run('Hud741.town'),null,'pas réaffiché tant qu’on reste dans le village');
 run("store.set('roadScene','campagne');Road723.at=Date.now();");w.RoadDecor721.draw(cv,10,360,50);
 town=JSON.parse(run('JSON.stringify(Hud741.town)'));
 assert(town&&town.exit&&town.name==='GEISPOLSHEIM','panneau barré à la sortie');
 run("store.set('town741Dur',0);Place710.here=()=>({name:'Entzheim'});store.set('roadScene','village');Road723.at=Date.now();");w.RoadDecor721.draw(cv,10,700,50);
 town=JSON.parse(run('JSON.stringify(Hud741.town&&{n:Hud741.town.name,inf:Hud741.town.until===Infinity})'));
 assert(town.n==='ENTZHEIM'&&town.inf,'« tout le temps » : reste tant qu’on est dans le village');
 assert(blueAt(.5,.04)===false,'le panneau du village n’est pas au milieu (il est à droite, sous la météo)');
 run("store.set('town741Dur',10);");
 console.log('OK village : nom 10 s à l’entrée, barré à la sortie, une seule fois, durée réglable ou permanent');

 // ---------- 2. Station : à côté de la vitesse, 10 s avant et 10 s après le portique ----------
 run("store.set('roadScene','autoroute');store.set('hw739',{});store.set('station741Dur',10);Decors726.signs739.signs.length=0;Decors726.signs739.done.clear();Hud741.stationUntil=0;");
 const station=d=>run(`Highway738.signs=()=>({exit:null,station:{id:9,name:'TotalEnergies Geispolsheim',d:${d},price:1.789,fuel:'E10',c:'FR'}});`);
 station(5.55);w.RoadDecor721.draw(cv,10,1000,110);
 const S=run("Decors726.signs739.signs.find(g=>g.kind==='station')&&Decors726.signs739.signs.find(g=>g.kind==='station').S");
 assert(S>1500,'portique de station annoncé 600 m devant : '+S);
 station(5.3);w.RoadDecor721.draw(cv,10,S-500,110);
 assert.equal(blueAt(.48,.09),false,'à 500 m (16 s à 110 km/h) : pas encore de panneau');
 station(5.1);w.RoadDecor721.draw(cv,10,S-250,110);
 assert.equal(blueAt(.48,.09),true,'à 250 m (8 s) : petit panneau à côté de la vitesse');
 station(4.9);w.RoadDecor721.draw(cv,10,S+5,110);
 assert(run('Hud741.stationUntil')-run('Date.now()')>9000,'après le portique : encore 10 s');
 t.advance(5000);station(4.8);w.RoadDecor721.draw(cv,10,S+150,110);assert.equal(blueAt(.48,.09),true,'5 s après : toujours affiché');
 t.advance(6000);station(4.6);w.RoadDecor721.draw(cv,10,S+300,110);assert.equal(blueAt(.48,.09),false,'11 s après : retiré');
 run("store.set('station741Dur',0);Decors726.signs739.signs.length=0;Decors726.signs739.done.clear();");station(5.55);w.RoadDecor721.draw(cv,10,5000,110);
 const S2=run("Decors726.signs739.signs.find(g=>g.kind==='station').S");station(5.1);w.RoadDecor721.draw(cv,10,S2-250,110);
 assert.equal(blueAt(.48,.09),false,'panneau de station désactivable');
 run("store.set('station741Dur',10);");
 console.log('OK station : petit panneau à côté de la vitesse 10 s avant et 10 s après le portique, réglable');

 // ---------- 3. Nom du village vérifié toutes les 10 s ----------
 assert.equal(run('Place710.every()'),10000,'10 secondes par défaut');
 assert(run('Place710.intervals.includes(10)'));
 console.log('OK nom du village vérifié toutes les 10 secondes');

 // ---------- 4. Réglages des panneaux ----------
 const layout=JSON.parse(run('JSON.stringify(Settings738.layout())'));
 assert(layout.some(([c,subs])=>c==='GPS et navigation'&&subs.includes('Panneaux dans l’image')),'page Panneaux dans l’image');
 run("openSet('GPS et navigation','Panneaux dans l’image');render();");
 const txt=run("document.querySelector('#screen').textContent");
 for(const s of ['Panneau du village ou de la ville','Tout le temps','Panneau de la prochaine station','Désactivé','Vérifier le nom du village'])assert(txt.includes(s),'réglage : '+s);
 run("act('v741:town:20');act('v741:station:5');act('v741:place:15')");
 assert(run("store.get('town741Dur')===20&&store.get('station741Dur')===5&&store.get('placeEvery')===15"),'réglages enregistrés');
 run("act('v741:town:10');act('v741:station:10');act('v741:place:10')");
 console.log('OK réglages : durée du panneau de village, du panneau de station, vérification du nom');

 // ---------- 5. QR par Internet (4G) ----------
 const page=fs.readFileSync(path.join(__dirname,'../docs/envoi.html'),'utf8');
 assert(page.includes('Accueil 2008')&&page.includes('https://ntfy.sh/')&&page.includes('a08-[0-9a-f]{24}'),'page d’envoi pour le téléphone');
 assert(fs.existsSync(path.join(__dirname,'../docs/.nojekyll')));
 const dl=[];
 w.Transfer738Native={start:()=>'',stop:()=>'',status:()=>JSON.stringify({native:true,running:true,port:8738,ips:['192.168.43.1'],used:0,quota:1073741824,files:0,received:0}),newToken:()=>'b'.repeat(48),list:()=>'[]',dataUrl:()=>'',text:()=>'',saveText:()=>'{"ok":true}',remove:()=>true,keep:()=>{},keepOnly:()=>{},download:(u,k,n)=>{dl.push([u,k,n]);return '{"ok":true}';}};
 run("store.set('transferMode741','internet');Transfer738.setPageOK(true);tab='home';render();act('transfer738:ticket');");
 const ov=run("document.querySelector('[data-transfer738]').textContent");
 assert(run("!!document.querySelector('[data-transfer738] svg')")&&ov.includes('Pas besoin de Wi-Fi'),'QR Internet affiché');
 const topic=run('Transfer738.relay().topic');assert(/^a08-[0-9a-f]{24}$/.test(topic),'adresse secrète de la boîte aux lettres : '+topic);
 assert.equal(run('Transfer738.relay().kind'),'ticket');
 w.__line=JSON.stringify({id:'m1',time:1,event:'message',topic,message:'ticket.jpg',attachment:{name:'ticket.jpg',type:'image/jpeg',size:200000,url:'https://ntfy.sh/file/m1.jpg'}});
 run(`window.__asked=[];http=async u=>{__asked.push(u);return {ok:true,b:JSON.stringify({id:'o',event:'open'})+'\\n'+__line+'\\n'};};`);
 await w.Transfer738.relayPoll();
 assert(/^https:\/\/ntfy\.sh\/a08-[0-9a-f]{24}\/json\?poll=1&since=\d+$/.test(run('__asked[0]')),'boîte aux lettres consultée');
 assert.deepEqual(dl,[['https://ntfy.sh/file/m1.jpg','ticket','ticket.jpg']],'photo téléchargée par l’autoradio');
 await w.Transfer738.relayPoll();assert.equal(dl.length,1,'pas téléchargée deux fois');
 run("Transfer738.onReceived({name:'20261123-120000-ticket-ticket.jpg',kind:'ticket',type:'jpg',size:200000,via:'internet'})");
 assert.equal(run("!!document.querySelector('[data-transfer738]')"),false,'QR fermé à la réception');
 assert.equal(run('Transfer738.relay()'),null,'attente terminée');
 assert.equal(run('Journeys733.state.view'),'fuel','fiche de plein ouverte avec la photo');
 run("Transfer738.onReceived({error:'réponse 404',via:'internet'})");
 // Page pas encore en ligne : marche à suivre GitHub, et repli Wi-Fi.
 run("tab='home';render();Transfer738.setPageOK(false);act('transfer738:gpx');");
 const off=run("document.querySelector('[data-transfer738]').textContent");
 assert(off.includes('Settings')&&off.includes('/docs')&&off.includes('Wi-Fi'),'page pas en ligne : explications');
 run("act('transfer738:wifi')");
 assert(run("document.querySelector('[data-transfer738]').textContent.includes('192.168.43.1')"),'repli sur le Wi-Fi de l’autoradio');
 run("act('transfer738:close');Transfer738.setPageOK(true);");
 // Réglage du mode d'envoi.
 run("openSet('Trajets et carburant','Transfert depuis le téléphone');render();");
 assert(!run("document.querySelector('#screen').textContent").includes('Mode d’envoi'),'mode d’envoi retiré en 7.50');
 run("act('transfer738:mode:wifi')");assert.equal(run("store.get('transferMode741')"),'wifi');
 run("act('transfer738:mode:internet')");
 console.log('OK QR en 4G : adresse secrète, boîte aux lettres consultée, photo téléchargée une fois, plein ouvert ; explications et repli Wi-Fi');
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('Tests 7.41 réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
