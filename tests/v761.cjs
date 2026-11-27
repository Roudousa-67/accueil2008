'use strict';
// 7.61 : alertes de la route (ZFE, tunnel, aires, sortie).
const assert=require('node:assert/strict');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js','lib/qrcode-generator.js','v738.js','transfer738.js','stations738.js','highway738.js','v740.js','diag738.js','display743.js','v750.js','secours753.js','uninstall753.js','bar754.js','wall755.js','walls760.js','walls761.js','ticket756.js','ticket757.js','music758.js','stats759.js','tour760.js','photo760.js','settings738.js','ranger758.js','apparence760.js','couleurs760.js','osm761.js','route761.js','stations761.js','perso761.js','games761.js','info760.js','keep758.js'];
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 run("store.set('onboard760',1);");
 // OpenStreetMap : si le serveur principal échoue, un miroir répond
 run("window.__h761=[];http=async u=>{__h761.push(u);return u.includes('overpass-api.de')?{ok:false,b:'busy'}:{ok:true,b:'{\"elements\":[{\"id\":1}]}'}};");
 const om=await run("getJSON('https://overpass-api.de/api/interpreter?data=x').then(j=>j.elements.length)");
 assert.equal(om,1,'miroir Overpass utilisé');assert(run("__h761[1].includes('kumi.systems')"),'deuxième serveur essayé');
 await run("getJSON('https://overpass-api.de/api/interpreter?data=y')");assert(run("__h761[2].includes('kumi.systems')"),'le miroir qui marche est gardé');
 run("window.__req761=[];getJSON=async u=>{__req761.push(u);return {elements:[]}};");
 const A=src=>run(`JSON.stringify((V740.Alerts.list.find(a=>a.source==='${src}')||{}).text||'')`);
 const at=(lat,lon,brg=0,spd=15)=>run(`loc={lat:${lat},lon:${lon},spd:${spd},acc:5,brg:${brg},alt:0,ts:Date.now()};curSpeed=()=>({v:${spd*3.6},src:'test'});`);
 // Réglages
 run("openSet('GPS et navigation','Alertes de la route');render();");
 const txt=run("document.getElementById('screen').textContent");
 assert(txt.includes('Ta vignette Crit’Air')&&txt.includes('Tunnel devant'),'page Alertes de la route');
 run("act('r761:crit:2');");assert.equal(run("store.get('critair761','')"),'2','vignette Crit’Air');
 // ZFE : déjà dedans au démarrage → rien ; en y entrant → alerte
 run("Route761.S.zfe.zones=[{id:1,name:'ZFE Test',rings:[[[48.50,7.70],[48.50,7.80],[48.60,7.80],[48.60,7.70]]]}];Route761.S.zfe.at=Date.now();Route761.S.zfe.pos=[48.55,7.75];");
 at(48.55,7.75);run('Route761.zfeCheck()');assert.equal(A('zfe761'),'""','pas d’alerte quand on démarre dans la ZFE');
 at(48.45,7.75);run('Route761.zfeCheck()');at(48.55,7.75,0);run('Route761.zfeCheck()');
 run("Route761.S.zfe.inside=null;");run('Route761.zfeCheck()');
 assert(A('zfe761').includes('ZFE Test')&&A('zfe761').includes('Crit’Air 2'),'alerte en entrant : '+A('zfe761'));
 at(48.40,7.75);run('Route761.zfeCheck()');assert.equal(A('zfe761'),'""','sortie de ZFE : alerte retirée');
 // ZFE devant (400-800 m)
 at(48.4965,7.75,0,15);run('Route761.zfeCheck()');assert(A('zfe761').includes('dans'),'ZFE devant : '+A('zfe761'));
 // Tunnel à 500 m devant
 at(48.0,7.5,0,25);run("Route761.S.tun.list=[{id:5,name:'Tunnel du test',ends:[{lat:48.0045,lon:7.5},{lat:48.02,lon:7.5}],len:1.8}];Route761.S.tun.at=Date.now();Route761.S.tun.pos=[48.0,7.5];Route761.tunCheck();");
 assert(A('tunnel761').includes('Tunnel dans 500 m'),'tunnel : '+A('tunnel761'));
 at(48.0,7.5,180,25);run('Route761.tunCheck()');assert.equal(A('tunnel761'),'""','tunnel derrière : rien');
 // Aire d'autoroute à 5 km
 at(48.0,7.5,0,33);run("Highway738.state.onSince=Date.now();Route761.S.aire.list=[{id:'a1',lat:48.045,lon:7.5,name:'Aire du Haut-Koenigsbourg',tags:{toilets:'yes',highway:'services'}}];Route761.S.aire.at=Date.now();Route761.S.aire.pos=[48.0,7.5];Route761.aireCheck();");
 await new Promise(r=>setImmediate(r));run('Route761.aireCheck()');
 assert(A('aire761').includes('Aire du Haut-Koenigsbourg')&&A('aire761').includes('WC'),'aire : '+A('aire761'));
 // Sortie : boulangerie la plus proche
 run("getJSON=async u=>{__req761.push(u);return {elements:[{lat:48.031,lon:7.501,tags:{name:'Boulangerie Paul',shop:'bakery'}},{lat:48.05,lon:7.52,tags:{shop:'bakery'}}]}};");
 run("Highway738.state.next={id:'e1',lat:48.03,lon:7.5,ref:'12',d:10};");await run('Route761.sortieCheck()');assert.equal(A('sortie761'),'""','sortie trop loin : pas encore');
 run("Highway738.state.next.d=3;");await run('Route761.sortieCheck()');await new Promise(r=>setImmediate(r));await run('Route761.sortieCheck()');
 assert(A('sortie761').includes('Sortie 12')&&A('sortie761').includes('boulangerie'),'sortie (cherchée même repérée à plus de 8 km) : '+A('sortie761'));
 // Couper une alerte
 run("act('r761:on:tunnel761:0');");at(48.0,7.5,0,25);run('Route761.tunCheck()');assert.equal(A('tunnel761'),'""','alerte coupée');
 // 40 fonds de plus
 assert.equal(run('Walls761.ids.length'),41,'41 nouveaux fonds');assert(run("Walls761.ids.every(id=>WALLS.some(w=>w.id===id)&&Wall760.has(id))"),'fonds branchés');
 run("(()=>{const c=document.createElement('canvas');c.width=96;c.height=54;const g=c.getContext('2d');Walls761.ids.forEach(id=>Wall760.paint(id,g,96,54,4321))})()");
 assert.equal(t.errors.length,0,'chaque fond se dessine\n'+t.errors.join('\n'));
 assert(run("WALLS.some(w=>w.cat==='Abstraits animés')"),'catégorie Abstraits animés');
 // Onglet Jeux
 assert(run("TABS.some(x=>x[0]==='games')"),'onglet Jeux');
 run("curSpeed=()=>({v:0,src:'test'});loc.spd=0;tab='games';render();");assert(run("document.getElementById('screen').textContent").includes('Jeu des plaques'),'page Jeux affichée (plus l’accueil)');
 run("act('gsub:plates');act('gp:67');");assert(run("!!Games751.found()['67']"),'plaque 67 trouvée');
 run("act('gsub:city');act('gc:pick:'+Games751.G.city.choices[0]);");assert(run('Games751.G.city.played')>=1,'devine la ville joué');
 run("act('gsub:phone');render();");assert(run("!!document.querySelector('#screen svg')"),'QR des passagers');
 run("curSpeed=()=>({v:60,src:'test'});act('gsub:plates');render();");assert(run("document.getElementById('screen').textContent").includes('pause'),'jeux en pause en roulant');
 run("curSpeed=()=>({v:0,src:'test'});act('gsub:eco');");assert.equal(run('tab'),'trips','éco-conduite mène aux Trajets');
 run("tab='home';render();");
 assert(run("Route761.reportLines().join('\\n')").includes('Alertes de la route 7.61'),'rapport');
 // Stations : rentable ou pas, logos, services, filtres
 run("loc={lat:48.58,lon:7.75,spd:0,acc:5,brg:0,alt:0,ts:Date.now()};curSpeed=()=>({v:0,src:'test'});store.set('fuel','E10');store.set('fuelConsAuto',false);store.set('fuelCons',6);const D=Stations738.demo();D[0].services=['Toilettes publiques','Boutique alimentaire','Station de lavage'];D[1].tags={brand:'E.Leclerc',compressed_air:'yes'};Stations738.state.all=D;");
 run("getJSON=async u=>{__req761.push(u);if(u.includes('project-osrm')){const n=u.split('/driving/')[1].split('?')[0].split(';').length;return {code:'Ok',distances:[Array.from({length:n},(_,i)=>i?i*4000:0)],durations:[Array.from({length:n},(_,i)=>i*300)]}}return {elements:[]}};");
 run("tab='trips';act('tsub:stations');render();");
 assert(run("!!document.querySelector('#screen .st738')"),'page Stations');
 await new Promise(r=>setImmediate(r));await new Promise(r=>setImmediate(r));run('render()');
 const rows=run("[...document.querySelectorAll('#screen .st738-row .rent761')].map(e=>e.textContent)");
 assert(rows.length>=4,'gain ou perte à côté du prix : '+rows.length);
 assert(rows.some(x=>x.includes('🏆')),'meilleur choix');assert(rows.some(x=>x.includes('la + proche')),'plus proche');
 assert(rows.every(x=>x.length<24),'liste pas chargée : '+rows.join(' | '));
 assert(run("[...document.querySelectorAll('#screen .st738-row .rent761')].every(e=>/#2f9e44|#e03131|#8a94a3/.test(e.getAttribute('style')))"),'vert ou rouge');
 assert(run("__req761.some(u=>u.includes('project-osrm'))"),'distances par la route demandées');
 // En euros (par défaut 50 €)
 assert.equal(run("Rent761.amt().u"),'eur','montant en € par défaut');
 run("act(document.querySelector('#screen .st738-row').dataset.act);render();");
 let det=run("(document.querySelector('#screen .st738-card .rent761')||{}).textContent||''");
 assert(/Pour 50,00 € : [0-9,]+ L achetés − [0-9,]+ L brûlés pour l’aller-retour = [0-9,]+ L utiles/.test(det),'calcul en € dans la fiche : '+det);
 assert(det.includes('la moins chère'),'comparé aussi à la moins chère');
 const C=JSON.parse(run("JSON.stringify(Rent761.compute(Stations738.rows()))")),o=C.out[C.best],ref=C.out[C.near];
 assert(Math.abs(o.diff-((ref.net-o.net)*ref.p))<1e-9&&o.diff<=0,'gain = litres utiles en plus × prix de la plus proche');
 // En litres
 run("act('rent761:unit:l');act('rent761:amt:l:40');render();");
 det=run("(document.querySelector('#screen .st738-card .rent761')||{}).textContent||''");
 assert(/Plein 40,0 L : [0-9,]+ € \+ trajet [0-9,]+ € = [0-9,]+ €/.test(det),'calcul en litres : '+det);
 run("act('rent761:unit:eur');render();");
 // Logos et services
 assert(run("document.querySelectorAll('#screen .st738-row .lg761').length")>=4,'logos dans la liste');
 assert(run("[...document.querySelectorAll('#screen .st738-row .lg761 img')].some(i=>i.src.includes('totalenergies.fr'))"),'logo TotalEnergies');
 assert.equal(run("Rent761.brandOf({name:'Station de Geispolsheim',tags:{brand:'E.Leclerc'}}).key"),'E.Leclerc','enseigne lue dans OpenStreetMap');
 const sv=run("[...document.querySelectorAll('#screen .st738-row .sv761')].map(e=>e.textContent).join(' / ')");
 assert(sv.includes('WC')&&sv.includes('Boutique')&&sv.includes('Lavage')&&sv.includes('Gonflage'),'services : '+sv);
 // Filtre enseigne, préférées, déjà utilisées
 run("store.set('stBrand761','ARAL');render();");assert(run("Stations738.rows().every(s=>Rent761.brandOf(s).key==='ARAL')")&&run("Stations738.rows().length")>=1,'filtre par enseigne');
 run("store.set('stBrand761','fav');render();");assert.equal(run("Stations738.rows().length"),0,'aucune préférée');
 run("store.set('stBrand761','all');render();const s=Stations738.rows()[2];act('st738:pick:'+s.id);act('rent761:fav:'+s.id);store.set('stBrand761','fav');render();");
 assert.equal(run("Stations738.rows().length"),1,'une préférée');assert(run("document.querySelector('#screen .st738-row').textContent").includes('★'),'étoile dans la liste');
 run("store.set('stBrand761','all');Rent761.watchFills();const st=Stations738.state.all[1];loc={lat:st.lat,lon:st.lon,spd:0,acc:5,brg:0,alt:0,ts:Date.now()};store.set('fuelLog',(store.get('fuelLog',[])||[]).concat([{t:Date.now(),l:30,e:50,k:0,s:''}]));Rent761.watchFills();store.set('stBrand761','used');render();");
 assert.equal(run("Stations738.rows().length"),1,'déjà utilisée après un plein');
 run("store.set('stBrand761','all');render();");
 // Vrais logos : Wikidata (logo P154) puis Wikimedia Commons
 run("getJSON=async u=>{__req761.push(u);if(u.includes('wikidata.org')){const ids=decodeURIComponent(u.split('ids=')[1]).split('|');const e={};ids.forEach(q=>e[q]={claims:q==='Q154037'?{P154:[{mainsnak:{datavalue:{value:'TotalEnergies logo.svg'}}}]}:{}});return {entities:e}}return {elements:[]}};render();");
 for(let k=0;k<4;k++){t.timers.splice(0).filter(x=>x.ms<=500).forEach(x=>x.fn());await new Promise(r=>setImmediate(r));await new Promise(r=>setImmediate(r));}run('render()');
 assert(run("__req761.some(u=>u.includes('wikidata.org')&&u.includes('Q154037'))"),'logo demandé à Wikidata');
 assert(run("[...document.querySelectorAll('#screen .st738-row .lg761 img')].some(i=>i.src.includes('commons.wikimedia.org/wiki/Special:FilePath/TotalEnergies_logo.svg'))"),'vrai logo TotalEnergies (Commons)');
 assert(String(run("store.get('logo761_Q565734','')")).startsWith('-|'),'marque sans logo libre : notée, secours icône');
 // Personnaliser mon écran (façon iPhone)
 run("tab='settings';openSet('Accueil et affichage','Apparence');render();");
 assert(run("!!document.querySelector('#screen [data-act=\"perso761:open\"]')"),'gros bouton Personnaliser');
 run("curSpeed=()=>({v:0,src:'test'});act('perso761:open')");
 assert(run("!!document.getElementById('perso761')"),'personnalisation ouverte');assert.equal(run('tab'),'home','accueil en direct derrière');
 assert(run("document.getElementById('stage').style.transform").includes('scale(0.'),'accueil réduit à gauche');
 const pz=a=>run(`(()=>{const b=document.querySelector('#perso761 [data-pz="${a}"]');if(!b)return false;b.click();return true})()`);
 assert(pz('next'),'Commencer');assert(run("document.querySelector('#perso761').textContent").includes('Ton fond d’écran'),'étape fond');
 assert(pz('cat:Paysages animés'));assert(pz('wall:x7lavande'));assert.equal(run("pv('wall','')"),'x7lavande','fond choisi');
 assert(pz('next'));assert(pz('do:acc:#1D9E75'));assert.equal(run('palette().acc.toUpperCase()'),'#1D9E75','couleur des boutons');
 assert(pz('next'));assert(pz('do:font:Orbitron'));assert.equal(run("store.get('appFont','')"),'Orbitron','écriture');
 assert(pz('next'));assert(pz('lay:gps'));assert.equal(run('Perso761.layoutNow()'),'gps','disposition GPS en grand');
 assert(run("fCfg().pages[0].some(it=>it.b[0]==='apps')"),'raccourcis gardés');
 assert(pz('lay:undo'));assert.notEqual(run('Perso761.layoutNow()'),'gps','ancienne disposition remise');
 assert(pz('next'));assert(pz('do:ap760:dock:neon'));assert.equal(run("store.get('dockStyle760','')"),'neon','icônes');
 assert(pz('next'));assert(run("document.querySelector('#perso761').textContent").includes('C’est prêt'),'fin');
 assert(pz('save:1'));assert(run('!!Apparence760.slots()[1]'),'Thème 2 enregistré');
 assert(pz('close'));assert(!run("!!document.getElementById('perso761')"),'fermé');assert(!run("document.getElementById('stage').style.transform").includes('translate'),'accueil remis en plein écran');
 run("curSpeed=()=>({v:50,src:'test'});act('perso761:open')");assert(!run("!!document.getElementById('perso761')"),'pas en roulant');run("curSpeed=()=>({v:0,src:'test'})");
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('OK alertes de la route : ZFE (pas au démarrage dedans, en entrant, devant), tunnel devant, aire et services, commerce à la sortie, coupure, réglages ; miroirs OpenStreetMap ; stations rentables (€ ou litres, plus proche et moins chère), logos, services, filtre enseigne, préférées, déjà utilisées, vrais logos ; personnalisation façon iPhone ; 41 fonds de plus ; onglet Jeux');
 console.log('Tests 7.61 réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
