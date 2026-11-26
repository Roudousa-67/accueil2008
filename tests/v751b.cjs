'use strict';
// 7.51 (suite) : stats, alertes de la route, jeux, musique, entretien, réglages en 5 rubriques, sauvegarde et nettoyage.
const assert=require('node:assert/strict');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js','lib/qrcode-generator.js','v738.js','transfer738.js','stations738.js','highway738.js','v740.js','diag738.js','display743.js','v750.js','v751.js','wall751.js','stats751.js','route751.js','games751.js','garage751.js','settings738.js','settings751.js'];
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 const screen=()=>run("document.querySelector('#screen').textContent");
 const stop=()=>run("loc={lat:48.58,lon:7.75,spd:0,acc:5,brg:90,ts:Date.now()};");
 const go=(s=80)=>run(`loc={lat:48.58,lon:7.75,spd:${s},acc:5,brg:90,ts:Date.now()};`);
 // ---------- Réglages en 5 rubriques ----------
 assert.deepEqual(JSON.parse(run('JSON.stringify(Settings738.layout().map(c=>c[0]))')),['Accueil','Route','Voiture','Médias','Système'],'5 rubriques');
 run("openSet('Trajets et carburant','Transfert depuis le téléphone');render();");assert(screen().includes('Transfert depuis le téléphone'),'anciens liens redirigés');
 run("act('try750:cats751:off')");assert(JSON.parse(run('JSON.stringify(Settings738.layout().map(c=>c[0]))')).includes('Trajets et carburant'),'désactivable : rubriques d’avant');run("act('try750:cats751:on')");
 assert.equal(JSON.parse(run('JSON.stringify(Settings738.layout())')).find(c=>c[0]==='Système')[1].filter(s=>s==='Nouveautés à tester').length,1,'un seul « Nouveautés à tester »');
 console.log('OK réglages en 5 rubriques, anciens liens, désactivable');
 // ---------- Stats ----------
 assert.equal(run('Stats751.bareme(5,12840)'),Math.round((12840*.357+1395)*100)/100,'barème 5 CV');
 assert.equal(run('Stats751.bareme(6,4000)'),2660,'barème 6 CV ≤ 5000 km');
 run("store.set('fuelLog',[{t:Date.now()-5e8,l:40,e:68.4,k:1000,s:'Leclerc Illkirch'},{t:Date.now()-4e8,l:30,e:53.7,k:1500,s:'Total Geispolsheim'},{t:Date.now()-3e8,l:42,e:71.4,k:2100,s:'leclerc illkirch'}])");
 const rank=JSON.parse(run('JSON.stringify(Stats751.stationRank())'));assert.equal(rank[0].n,2,'stations regroupées');assert(rank[0].avg<rank[1].avg,'moins chère en premier');
 // Bouchon : 2 minutes sous 15 km/h en avançant
 run("trip=trip||{start:Date.now(),last:Date.now(),dist:0,eco:null};");
 run("loc={lat:48.58,lon:7.75,spd:8,acc:5,brg:90,ts:Date.now()};Stats751.jamTick();");t.advance(120000);run("loc={lat:48.581,lon:7.751,spd:8,acc:5,brg:90,ts:Date.now()};Stats751.jamTick();");go();run('Stats751.jamTick()');
 assert(run("Object.values(store.get('jam751',{})).reduce((a,b)=>a+b,0)")>=110,'bouchon compté');
 run("tab='trips';tripSub='bilan';render();");assert(screen().includes('Temps perdu dans les bouchons')&&screen().includes('Frais kilométriques')&&screen().includes('Leclerc Illkirch'),'page Mes stats');
 run("store.set('trips',[{start:Date.now()-3600e3,end:Date.now()-3000e3,dist:12,score:88,driver733:0},{start:Date.now()-7200e3,end:Date.now()-6600e3,dist:8,score:72,driver733:1}])");
 run("tab='trips';tripSub='eco';render();");assert(screen().includes('Classement éco de la famille'),'classement famille');
 console.log('OK stats : barème, stations, bouchons, page, classement famille');
 // ---------- Alertes de la route ----------
 assert.equal(run("Route751.depCode('20100')"),'2A');assert.equal(run("Route751.depCode('67000')"),'67');assert.equal(run("Route751.depCode('97411')"),'974');
 w.getJSON=async()=>({elements:[]});
 go();run("Route751.S.zfe.at=Date.now();Route751.S.zfe.pos=[48.58,7.75];Route751.S.zfe.zones=[{id:1,name:'ZFE Strasbourg',rings:[[[48.5,7.6],[48.7,7.6],[48.7,7.9],[48.5,7.9]]]}];store.set('critair751','1');Route751.zfeCheck();");
 assert(run("V740.Alerts.list.some(a=>a.source==='zfe751'&&/ZFE Strasbourg/.test(a.text)&&/Crit’Air 1/.test(a.text))"),'alerte ZFE');
 run("Route751.S.tun.at=Date.now();Route751.S.tun.pos=[48.58,7.75];Route751.S.tun.list=[{id:9,name:'Tunnel test',len:.5,ends:[{lat:48.58,lon:7.756},{lat:48.58,lon:7.76}]}];Route751.tunCheck();");
 assert(run("V740.Alerts.list.some(a=>a.source==='tunnel751'&&/allume tes feux/.test(a.text))"),'alerte tunnel');
 run("tab='home';render();V740.paintBanner();");
 assert(/\d alertes : /.test(run("(document.querySelector('.alert740-t')||{}).textContent||''")),'alertes regroupées dans une seule pastille');
 let signs=[];w.Decor751&&(w.Decor751.sign=(k,d)=>signs.push([k,d]));
 run("limit=90;Route751.limitCheck();limit=70;Route751.limitCheck();");assert(signs.some(s=>s[0]==='limit751'&&s[1].v===70),'panneau de limitation planté');
 run("geoA={cp:'67000',dep:'Bas-Rhin',reg:'Grand Est'};Route751.depCheck();geoA={cp:'88100',dep:'Vosges',reg:'Grand Est'};Route751.depCheck();");assert(signs.some(s=>s[0]==='dep751'&&s[1].code==='88'),'panneau de département');
 run("V740.T.last=[{cur:20,free:110}];V740.T.at=Date.now();");assert.equal(run('Route751.density()'),3,'trafic dense dans le décor');
 run("openSet('Route','Alertes de la route');render();");assert(screen().includes('Ta vignette Crit’Air'),'réglages des alertes');
 console.log('OK alertes : ZFE, tunnel, regroupées, limitation, département, trafic, réglages');
 // ---------- Jeux ----------
 assert(run("TABS.some(t=>t[0]==='games')"),'onglet Jeux');
 go();run("act('tab:games');act('gsub:plates')");assert(screen().includes('En pause pendant la conduite'),'pause en roulant');
 stop();run("Games751.G.sub='plates';render();act('gp:67');act('gp:88')");assert(screen().includes('2 / 101 départements trouvés'),'jeu des plaques');
 run("act('gsub:city')");const ci=run('Games751.G.city.i');run(`act('gc:pick:${ci}')`);assert.equal(run('Games751.G.city.score'),3,'devine la ville : 3 points au premier indice');
 // Téléphones : scores reçus par la boîte aux lettres
 w.http=async()=>({ok:true,b:JSON.stringify({id:'m1',event:'message',message:JSON.stringify({name:'Léa',found:['75','13'],city:5})})});
 run("act('gsub:phone')");assert(screen().includes('Scanne pour jouer'),'QR des passagers');
 await run('Games751.phonePoll()');assert(run("!!Games751.found()['75']"),'plaques du téléphone ajoutées');run("render()");assert(screen().includes('Léa'),'score du passager affiché');
 // Blind test : titre caché
 run("media={title:'Bohemian Rhapsody',artist:'Queen',playing:true,pos:0,dur:1,art:''};act('gsub:blind');act('gb:start');tab='home';render();paint();");
 assert(!run("document.querySelector('#screen').textContent").includes('Bohemian'),'blind test : titre caché sur l’accueil');
 run("act('gb:stop')");
 // Égaliseur et mode concert
 run("tab='home';render();paint();");assert(run("!!document.querySelector('#screen .eq751.on751')"),'égaliseur animé pendant la lecture');
 stop();run("Games751.concert(media)");t.advance(16000);stop();run("Games751.concert(media)");assert(run("!!document.getElementById('concert751')"),'mode concert à l’arrêt');go();run("Games751.concert(media)");assert(!run("!!document.getElementById('concert751')"),'concert fermé en roulant');
 console.log('OK jeux : onglet, pause en roulant, plaques, ville, téléphones, blind test, égaliseur, concert');
 // ---------- Entretien ----------
 const tk=JSON.parse(run("JSON.stringify(Garage751.parseTicket('STATION TOTAL\\nSP95-E10\\n42,10 L\\nPRIX 1,729 €/L\\nTOTAL TTC 72,79 EUR\\nCB'))"));
 assert.deepEqual(tk,{litres:42.1,total:72.79,per:1.729},'ticket lu');
 run("store.set('kmManual751',{k:52000,t:Date.now()});store.set('fuelLog',[]);store.set('tyres751',{front:{k:32000,d:''},rear:{k:null,d:''},lifeF:40000,lifeR:50000});");
 assert.equal(run("Garage751.wear('front').pct"),50,'usure des pneus');
 run("act('ssub:pneus')");assert(screen().includes('Pneus avant')&&screen().includes('50 %'),'page Pneus');
 run("act('ssub:factures')");run("document.getElementById('bi751e').value='245,50';document.getElementById('bi751g').value='Garage Peugeot';act('g751:billsave')");
 assert(screen().includes('Garage Peugeot')&&screen().includes('245,50'),'facture enregistrée');
 console.log('OK entretien : ticket, pneus, factures');
 // ---------- Système ----------
 run("store.set('fluid751','eco')");assert.equal(run('Fluid751.step(1)'),3,'économie : 20 i/s');run("store.set('fluid751','fluide')");assert.equal(run('Fluid751.step(3)'),1,'fluide');
 const before=JSON.parse(run('JSON.stringify(fCfg().pages[0])'));
 if(before.some(x=>(x.b||[]).some(b=>/^car/.test(b)))){run("Settings751.applySize('grand')");const after=JSON.parse(run('JSON.stringify(fCfg().pages[0])'));const road=after.find(x=>(x.b||[]).some(b=>/^car/.test(b)));assert.equal(road.w,6,'widget route grand');assert(after.every(x=>x.x+x.w<=12),'les voisins s’adaptent');}
 run("localStorage.setItem('receipt733-old','x'.repeat(5000));localStorage.setItem('bill751-orphan','y'.repeat(3000));");
 const rep=JSON.parse(run('JSON.stringify(Settings751.cleanNow(false))'));assert(rep.n>=2&&rep.freed>=16000,'nettoyage');assert.equal(run("localStorage.getItem('receipt733-old')"),null);
 let saved=null;w.Display743Native=Object.assign(w.Display743Native||{},{saveText:(n,m,txt)=>{saved={n,m,len:txt.length};return JSON.stringify({ok:true,fichier:'Téléchargements/Accueil2008/'+n});}});
 run('Settings751.backupNow(false)');assert(saved&&/^sauvegarde-accueil2008-\d{8}\.json$/.test(saved.n)&&saved.len>100,'sauvegarde de la semaine');
 assert(JSON.parse(run('JSON.stringify(Try750.list().map(x=>x.id))')).length>=25,'toutes les nouveautés dans « Nouveautés à tester »');
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('OK système : fluidité, taille du widget, nettoyage, sauvegarde, nouveautés à tester');
 console.log('Tests 7.51 (suite) réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
