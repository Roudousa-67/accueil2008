'use strict';
// 7.58 : fenêtre « Remplacer par… » dans #stage avec les vrais logos ; musique (pochette, égaliseur, radios, concert).
const assert=require('node:assert/strict');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js','lib/qrcode-generator.js','v738.js','transfer738.js','stations738.js','highway738.js','v740.js','diag738.js','display743.js','v750.js','secours753.js','uninstall753.js','bar754.js','wall755.js','ticket756.js','ticket757.js','music758.js','settings738.js','ranger758.js','keep758.js'];
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 // ---------- Fenêtre « Remplacer par… » ----------
 run("appsCache=[{p:'com.spotify.music',l:'Spotify'},{p:'com.waze',l:'Waze'}];allApps().forEach(a=>iconCache.set(a.p,'data:image/png;base64,AAAA'))");
 run("tab='home';render();act('bar754:edit');act('arapp:pick:0');");
 assert(run("!!document.querySelector('#stage #arPickLayer')"),'fenêtre dans la zone des appuis (#stage)');
 assert(run("document.querySelectorAll('#arPickLayer img[data-icon][src]').length")>0,'logos chargés');
 assert.equal(run("document.querySelector('#arPickLayer [data-act=\"arapp:set:d:phone\"]').closest('[data-act]').dataset.act"),'arapp:set:d:phone','un appui sur une appli la choisit');
 run("act('arapp:set:d:phone')");assert.equal(run("arApps()[0]"),'d:phone','appli remplacée');assert(!run("!!document.getElementById('arPickLayer')"),'fenêtre fermée');
 run("act('arapp:done')");
 console.log('OK fenêtre « Remplacer par… » : dans la zone des appuis, logos, choix, fermeture');
 // ---------- Musique ----------
 const stop=()=>run("loc={lat:48.58,lon:7.75,spd:0,acc:5,brg:90,ts:Date.now()};"),go=()=>run("loc={lat:48.58,lon:7.75,spd:60,acc:5,brg:90,ts:Date.now()};");
 run("media={pkg:'com.google.android.apps.youtube.music',app:'YouTube Music',title:'Umrumdusi',artist:'X',playing:true,pos:0,dur:1,art:'data:image/png;base64,AAAA'};tab='home';render();paint();");
 const eq=run("[...document.querySelectorAll('#screen .eq758')].length");assert(eq>=1,'égaliseur posé');
 assert(run("[...document.querySelectorAll('#screen .eq758')].every(e=>e.parentElement.lastElementChild===e)"),'égaliseur en dernier, par-dessus (pas dans le texte)');
 assert(run("!!document.querySelector('#screen .eq758.on758')"),'égaliseur animé pendant la lecture');
 assert(run("!!document.getElementById('cover758')")&&run("getComputedStyle(document.getElementById('cover758')).pointerEvents")==='none','pochette en fond, sans capter les appuis');
 stop();run("Music758.concert(media)");assert(!run("!!document.getElementById('concert758')"),'pas de concert tout de suite');
 t.advance(31000);stop();run("Music758.concert(media)");assert(run("!!document.getElementById('concert758')"),'concert après 30 s à l’arrêt');
 run("act('mu758:off')");assert(!run("!!document.getElementById('concert758')"),'un appui le ferme');
 t.advance(11*60000);stop();run("Music758.concert(media)");t.advance(31000);stop();run("Music758.concert(media)");assert(run("!!document.getElementById('concert758')"),'revient plus tard');
 go();run("Music758.concert(media)");assert(!run("!!document.getElementById('concert758')"),'disparaît en roulant');
 // Logo de radio
 w.getJSON=async()=>[{name:'France Bleu Alsace',favicon:'https://exemple.fr/logo.png'}];
 run("media={pkg:'com.qf.radio',app:'Radio',title:'France Bleu Alsace',artist:'',playing:true,pos:0,dur:0,art:''};");await run("Music758.radioLogo('France Bleu Alsace')");run("paint()");
 assert.equal(run("(document.querySelector('#screen [data-img=\"mArt\"]')||{}).src||''"),'https://exemple.fr/logo.png','logo de la radio');
 run("Try750.set('eq758','off');paint();");assert.equal(run("document.querySelectorAll('#screen .eq758').length"),0,'égaliseur désactivable');
 // ---------- La page ne remonte plus ----------
 run("openSet('Système','Nouveautés à tester');render();");
 run("const sc=document.querySelector('#screen .scroll, #screen [style*=\"overflow:auto\"]');window.__sc=sc;if(sc){Object.defineProperty(sc,'scrollTop',{value:0,writable:true,configurable:true});sc.scrollTop=420;}");
 const snap=JSON.parse(run('JSON.stringify(Keep758.snapshot())'));assert(snap.tops.includes(420),'position retenue');
 run("render();");
 assert(run("[...document.querySelectorAll('#screen .scroll, #screen .j733, #screen [style*=\"overflow:auto\"], #screen [style*=\"overflow: auto\"], #screen [style*=\"overflow-y:auto\"], #screen [style*=\"overflow-y: auto\"]')].some(e=>e.scrollTop===420)"),'position remise après le redessin');
 run("tab='trips';tripSub='pleins';render();const d=document.querySelector('#screen details');if(d)d.open=true;render();");
 assert(run("[...document.querySelectorAll('#screen details')].some(d=>d.open)"),'section ouverte restée ouverte');
 // ---------- Rangement ----------
 assert.deepEqual(JSON.parse(run('JSON.stringify(tripSubs.map(x=>x[1]))')),['Trajets','Stats','Éco','Pleins','Conso','Tickets','Stations'],'sous-onglets de Trajets');
 run("act('tsub:tickets')");assert.equal(run('Journeys733.state.fuelView'),'tickets','Tickets');
 run("act('tsub:stations')");assert.equal(run('Journeys733.state.fuelView'),'stations','Stations');
 run("act('tsub:pleins')");assert.equal(run('Journeys733.state.fuelView'),'fills','Pleins');assert(!run("!!document.querySelector('#screen [data-act=\"journey733:receipts\"]')"),'pas de doublon Tickets dans Pleins');
 run("act('journey733:fuel:charts')");assert.equal(run('tripSub'),'pleins','Graphiques reste dans Pleins');
 run("act('tsub:conso')");assert(run("document.querySelector('#screen').textContent").includes('Aucun plein noté')||run("document.querySelector('#screen').textContent").includes('Plein du'),'Conso = consommation par plein');
 run("act('ssub:pleins')");assert.equal(run('tripSub'),'conso','ancien lien Entretien › Pleins → Trajets › Conso');
 assert(!JSON.parse(run('JSON.stringify(svcSubs.map(x=>x[0]))')).includes('pleins'),'Entretien sans Pleins');
 const cats=JSON.parse(run('JSON.stringify(Settings738.layout().map(c=>c[0]))'));assert(cats.includes('Trajets')&&cats.includes('Carburant et tickets')&&!cats.includes('Trajets et carburant'),'réglages séparés');
 run("openSet('Trajets et carburant','Transfert depuis le téléphone');");assert.equal(run('SETCATS[setCat][0]'),'Carburant et tickets','ancien lien de réglage redirigé');
 run("Journeys733.receiveReceipt('file738:t.jpg');render();");assert.equal(run('tripSub'),'pleins','ticket reçu : ouvre Pleins (Ajouter un plein)');
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('OK page qui ne remonte plus, rangement essence / tickets / trajets, réglages séparés');
 console.log('OK musique : égaliseur par-dessus, pochette en fond, concert 30 s / appui / roulant, logo radio, désactivable');
 console.log('Tests 7.58 réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
