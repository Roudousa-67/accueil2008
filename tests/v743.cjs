'use strict';
// 7.43 : « Rechercher l'affichage » : recherche complète du poste, essais pour cacher Waze, envoi par QR, rapport.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js','lib/qrcode-generator.js','v738.js','transfer738.js','stations738.js','highway738.js','v740.js','diag738.js','display743.js','settings738.js'];
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 assert(Number(run('APP_VERSION'))>=7.43,'version 7.43 ou suivante');
 const index=fs.readFileSync(path.join(__dirname,'../sources_assets/index.html'),'utf8');
 assert(index.indexOf('src="display743.js"')>index.indexOf('src="diag738.js"')&&index.indexOf('src="display743.js"')<index.indexOf('src="settings738.js"'),'chargé par index.html au bon endroit');
 assert(fs.readFileSync(path.join(__dirname,'../module_GPS_java/java/fr/gtline/accueil2008/GpsDockInit.java'),'utf8').includes('"Display743Native"'),'pont natif branché');
 const layout=JSON.parse(run('JSON.stringify(Settings738.layout())'));
 assert(layout.some(([c,subs])=>c==='Système'&&subs.includes('Rechercher l’affichage')),'page dans Réglages → Système');
 const screen=()=>run("document.querySelector('#screen').textContent");
 run("openSet('Système','Rechercher l’affichage');render();");
 assert(screen().includes('Lancer la recherche')&&screen().includes('Essai 2 : ouverture en plein écran'),'page affichée');
 run("act('display743:start')");assert(screen().includes('il faut la 7.43'),'sans le pont natif : message clair');
 // Pont natif simulé : une recherche qui dure deux relevés.
 const result={poste:{fabricant:'FYT',marque:'Android',modele:'UIS7862',android:'10',sdk:29,build:'QP1A'},fenetres:{fenetre_libre:true,ActivityView:true},appli:{systeme:false,privilegiee:false,droits:[]},ecrans:[{id:0,nom:'Écran intégré',taille:'1280x720',drapeaux:3}],root:[],lanceur_par_defaut:'fr.gtline.accueil2008 / .MainActivity',lanceurs:['com.syu.launcher / .Launcher'],applis_liees:['com.syu.launcher (système)'],waze:{installee:true,version:'5.0',activite:'com.waze.FreeMapAppActivity',encastrable:false,redimensionnable:2},analyse:[{paquet:'com.syu.launcher',version:'1.0',systeme:true,privilegiee:true,droits:['ACTIVITY_EMBEDDING : accordée'],fichiers_lus:['base.apk!classes.dex'],octets:3145728,mots:{ActivityView:4,'com.waze':2},commandes:['com.syu.ms.action.SHOW_NAVI_WINDOW']},{paquet:'com.android.systemui',saute:'temps dépassé'}],duree_ms:31000};
 let polls=0;const launched=[];
 w.Display743Native={start:()=>'{"ok":true}',state:()=>JSON.stringify(++polls<2?{running:true,step:'Lecture du code : com.syu.launcher',result:''}:{running:false,step:'Terminé',result:JSON.stringify(result)}),launch:(pkg,full)=>{launched.push([pkg,full]);return JSON.stringify({ok:true,mode:full?'plein écran demandé':'normal'});}};
 run("act('display743:start')");assert(screen().includes('Recherche en cours'),'recherche en cours affichée');
 run('Display743.poll()');assert(screen().includes('Lecture du code'),'étape affichée');
 run('Display743.poll()');
 const txt=screen();
 assert(txt.includes('UIS7862')&&txt.includes('com.syu.launcher')&&txt.includes('encastrement')&&txt.includes('1 commande(s) du fabricant'),'résultat lisible : '+txt.slice(0,300));
 assert(JSON.parse(run("JSON.stringify(store.get('display743').data.poste)")).modele==='UIS7862','résultat gardé');
 // Essais pour cacher Waze.
 run("act('display743:try:plein')");assert.deepEqual(launched,[['com.android.settings',true]],'Réglages Android ouverts en plein écran');
 run("act('display743:answer:plein:non')");assert(screen().includes('Non, toujours visible'));
 run("act('display743:try:normal')");run("act('display743:answer:normal:non')");
 // 7.44 : essais 3 et 4 (Waze derrière en plein écran, Waze hors de l'écran) avec l'appli choisie.
 w.Display743Native.launchOffscreen=pkg=>{launched.push(['hors',pkg]);return JSON.stringify({ok:true,mode:'cadre hors écran demandé (écran 1280x720)'});};
 run("store.set('display743App','com.radio.test')");
 // Minuteries du banc d'essai : on exécute celle de 900 ms posée par l'essai.
 const fire=()=>{const i=t.timers.findIndex(x=>x.ms===900);assert(i>=0,'délai de 900 ms posé');t.timers.splice(i,1)[0].fn();};
 run("act('display743:try:derriere')");fire();
 run("act('display743:try:horsecran')");fire();
 assert.deepEqual(launched.slice(-4),[['com.waze',true],['com.radio.test',true],['hors','com.waze'],['com.radio.test',true]],'Waze d’abord, puis l’appli choisie : '+JSON.stringify(launched));
 run("act('display743:answer:derriere:oui:hidden');act('display743:answer:derriere:non:back');act('display743:answer:horsecran:non:hidden')");
 assert(screen().includes('Essai 4 : Waze poussé hors de l’écran')&&screen().includes('revenu dans le cadre'),'essais 3 et 4 affichés');
 const lines=JSON.parse(run('JSON.stringify(Display743.reportLines())')).join('\n');
 for(const s of ['FYT / Android / UIS7862','com.syu.ms.action.SHOW_NAVI_WINDOW','ActivityView×4','ACTIVITY_EMBEDDING : accordée','com.android.systemui : temps dépassé','Essai 2 : ouverture en plein écran (com.android.settings) : ouvert (plein écran demandé), Waze caché : non','Essai 3 : Waze en plein écran derrière, puis l’appli (com.radio.test) : ouvert','Waze caché : oui, revenu dans le cadre : non','Essai 4 : Waze poussé hors de l’écran, puis l’appli (com.radio.test)'])assert(lines.includes(s),'rapport : '+s+'\n'+lines);
 // Envoi au téléphone par QR.
 let savedName='';
 w.Transfer738Native={start:()=>'',stop:()=>'',status:()=>JSON.stringify({native:true,running:true,port:8738,ips:['192.168.43.1'],used:0,quota:1073741824,files:0,received:0}),newToken:()=>'c'.repeat(48),list:()=>'[]',dataUrl:()=>'',text:()=>'',saveText:(n,txt)=>{savedName=n;return JSON.stringify({ok:true,path:'/files/'+n});},remove:()=>true,keep:()=>{},keepOnly:()=>{}};
 run("store.set('transferMode741','wifi');act('display743:send')");
 assert(/^affichage-\d{8}-\d{4}\.html$/.test(savedName),'fichier du résultat : '+savedName);
 assert(run("!!document.querySelector('[data-transfer738] svg')"),'QR affiché pour le téléphone');
 run("act('transfer738:close')");
 // Ajouté au rapport de diagnostic.
 w.Android.http=(url,id)=>queueMicrotask(()=>w.__httpCb(id,true,'{}'));
 run("openSet('Système','Rapport de diagnostic');window.L=window.L||{};"); // bibliothèque de cartes : pas de chargement réseau dans le test
 await run('Diag738.run()');
 assert(run('Diag738.report.text').includes('== Recherche de l’affichage (7.43) ==')&&run('Diag738.report.text').includes('UIS7862'),'résultat dans le rapport de diagnostic');
 // PDF par e-mail.
 w.Display743Native.sharePdf=(n,title,txt,email)=>{w.__pdf=[n,title,txt,email];return JSON.stringify({ok:true,fichier:'Téléchargements/Accueil2008/'+n});};
 run("openSet('Système','Rechercher l’affichage');act('display743:pdf')");
 assert(/^affichage-\d{8}-\d{4}\.pdf$/.test(w.__pdf[0])&&w.__pdf[2].includes('UIS7862'),'PDF fabriqué avec le résultat');
 assert(screen().includes('PDF créé')&&screen().includes('Téléchargements/Accueil2008'),'PDF annoncé');
 // 7.44 : « Tout rechercher » enchaîne recherche + essais côté natif, puis PDF avec l'e-mail prérempli.
 let allPolls=0;const started=[];
 w.Display743Native.startAll=(app,navp)=>{started.push([app,navp]);allPolls=0;return JSON.stringify({ok:true});};
 const resultAll=Object.assign({},result,{essais_auto:[{essai:'derriere',ok:true,waze:'plein écran demandé',appli:'plein écran demandé'},{essai:'horsecran',ok:true,waze:'cadre hors écran demandé',appli:'plein écran demandé'}]});
 w.Display743Native.state=()=>JSON.stringify(++allPolls<2?{running:true,step:'Essai : horsecran',result:''}:{running:false,step:'Terminé',result:JSON.stringify(resultAll)});
 run("store.set('display743App','com.radio.test');store.set('display743Mail','abc@exemple.com');act('display743:all')");
 assert.deepEqual(started.slice(-1)[0],['com.radio.test','com.waze'],'startAll avec l’appli choisie et Waze');
 run('Display743.poll()');run('Display743.poll()');
 assert(screen().includes('Terminé — tu peux arrêter de filmer'),'bandeau de fin affiché pour savoir quand arrêter de filmer');
 const tfin=t.timers.find(x=>x.ms===2600);assert(tfin,'e-mail ouvert après le bandeau');tfin.fn();
 assert.equal((w.__pdf[3]||''),'abc@exemple.com','PDF envoyé à l’adresse préremplie, sans réponse à donner');
 assert(w.__pdf[2].includes('Essais automatiques')&&w.__pdf[2].includes('derriere'),'essais automatiques dans le PDF');
 assert(JSON.parse(run("JSON.stringify(Display743.reportLines())")).join('\n').includes('horsecran : ouvert'),'résultat des essais auto lisible');
 w.Display743Native.sharePdf=()=>JSON.stringify({ok:false,fichier:'Téléchargements/Accueil2008/a.pdf',erreur:'aucune appli d’e-mail sur l’autoradio'});
 run("act('display743:pdf')");assert(screen().includes('aucune appli d’e-mail')&&screen().includes('QR'),'sans appli d’e-mail : repli QR proposé');
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('OK page Rechercher l’affichage : recherche, résultat, essais plein écran, envoi par QR, rapport de diagnostic');

 // ---------- Autoroute : villes et distances, sortie exacte, zone de danger ----------
 run("tab='home';render();");
 let cv;const grab=()=>{run("tab='home';render();");cv=w.document.querySelector('#screen canvas[data-road]');Object.defineProperty(cv,'clientWidth',{value:400,configurable:true});Object.defineProperty(cv,'clientHeight',{value:400,configurable:true});};grab();
 const px=(fx,fy)=>JSON.parse(run(`JSON.stringify(Array.from((c=>c.getContext('2d').getImageData(Math.round(c.width*${fx}),Math.round(c.height*${fy}),1,1).data)(document.querySelector('#screen canvas[data-road]'))))`));
 run("weather={c:1,day:1,t:8,hours:[]};RoadSky719.now=()=>new Date('2026-11-23T12:00:00+01:00');loc={lat:48.5,lon:7.7,spd:110,acc:5,brg:180,ts:Date.now()};store.set('roadScene','autoroute');store.set('hw739',{});store.set('station741Dur',0);");
 // Choix des villes : devant, de plus en plus loin, grandes villes ensuite.
 run(`Highway738.state.cities=[{name:'Erstein',lat:48.42,lon:7.66,city:false,pop:10000},{name:'Colmar',lat:48.08,lon:7.36,city:true,pop:70000},{name:'Mulhouse',lat:47.75,lon:7.34,city:true,pop:105000},{name:'Bâle',lat:47.56,lon:7.59,city:true,pop:175000},{name:'Lyon',lat:45.76,lon:4.84,city:true,pop:520000},{name:'Metz',lat:49.12,lon:6.18,city:true,pop:120000},{name:'Haguenau',lat:48.82,lon:7.79,city:false,pop:35000}]`);
 const towns=JSON.parse(run('JSON.stringify(Highway738.pickTowns({lat:48.5,lon:7.7},190).map(c=>c.name))'));
 assert.deepEqual(towns.slice(0,2),['Erstein','Colmar'],'villes devant toi, la plus proche d’abord : '+towns);
 assert(!towns.includes('Metz')&&!towns.includes('Haguenau'),'rien derrière toi');
 assert(towns.includes('Lyon'),'une grande ville lointaine');
 // Déclenchement : en arrivant sur l'autoroute (après 15 s), distances estimées « ≈ » si le calcul par la route ne répond pas.
 run("Object.assign(Highway738.state,{onSince:Date.now()-20000,townsOnce:false,townsPos:null,towns:null,cityAt:Date.now(),cityPos:{lat:48.5,lon:7.7},at:Date.now()});Highway738.maybeTowns(190);");
 const tw=JSON.parse(run('JSON.stringify(Highway738.state.towns)'));
 assert(tw&&tw.list[0][0]==='Erstein'&&/^≈ \d+$/.test(tw.list[0][1]),'panneau prêt en arrivant sur l’autoroute : '+JSON.stringify(tw&&tw.list));
 await new Promise(r=>setImmediate(r));t.advance(5000);
 assert(JSON.parse(run('JSON.stringify(Highway738.signs().towns.list)')).length>=3,'donné au décor');
 run("Highway738.maybeTowns(190)");assert.equal(run('Highway738.state.towns.id'),tw.id,'pas un deuxième panneau tout de suite');
 grab(); // l'écran a pu être redessiné pendant l'attente
 // Panneau des villes planté au bord de la route, puis en grand en haut.
 run("Decors726.signs739.signs.length=0;Decors726.signs739.done.clear();Hud744.dist=null;store.set('dist744Dur',10);Highway738.signs=()=>({exit:null,station:null,towns:{id:5,ref:'A 35',list:[['Colmar','63'],['Mulhouse','104'],['Bâle','140']]}});");
 w.RoadDecor721.draw(cv,10,1000,110);
 const S=run("Decors726.signs739.signs.find(g=>g.kind==='dist').S");assert(S>1500,'panneau des villes planté 600 m devant');
 w.RoadDecor721.draw(cv,10,S-400,110);assert.equal(run('Hud744.dist'),null,'à 400 m : pas encore en haut');
 w.RoadDecor721.draw(cv,10,S-200,110);
 assert.equal(JSON.parse(run('JSON.stringify(Hud744.dist.list[0])'))[0],'Colmar','à 200 m : affiché en haut');
 const count=(test)=>JSON.parse(run(`(c=>{const W=c.width,H=c.height,d=c.getContext('2d').getImageData(Math.round(W*.32),Math.round(H*.04),Math.round(W*.36),Math.round(H*.2)).data;let n=0;for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];if(${test})n++;}return n;})(document.querySelector('#screen canvas[data-road]'))`));
 assert(count('r<70&&b>140&&g<120')>200,'panneau bleu en haut, entre la vitesse et la météo');
 assert(run("document.documentElement.hasAttribute('data-hud744')"),'pastille de limitation cachée pendant le panneau');
 t.advance(11000);w.RoadDecor721.draw(cv,10,S+100,110);w.RoadDecor721.draw(cv,10,S+110,110);
 assert(!run("document.documentElement.hasAttribute('data-hud744')"),'pastille de limitation revenue');
 run("Decors726.signs739.signs.length=0;Decors726.signs739.done.clear();Hud744.dist=null;store.set('hw739',{towns:false});");w.RoadDecor721.draw(cv,10,5000,110);
 assert(!run("Decors726.signs739.signs.some(g=>g.kind==='dist')"),'panneau des villes désactivable');
 run("store.set('hw739',{});Decors726.signs739.done.clear();store.set('dist744Dur',0);");w.RoadDecor721.draw(cv,10,6000,110);const S2=run("Decors726.signs739.signs.find(g=>g.kind==='dist').S");w.RoadDecor721.draw(cv,10,S2-200,110);
 assert.equal(run('Hud744.dist'),null,'affichage en haut désactivable');run("store.set('dist744Dur',10)");
 // Panneau « SORTIE » au début exact de la bretelle.
 run("Decors726.signs739.signs.length=0;Decors726.signs739.done.clear();Highway738.signs=()=>({exit:{id:41,ref:'4',dest:['Geispolsheim'],destRef:[],refs:[],d:.45},station:null});");
 w.RoadDecor721.draw(cv,10,8000,110);
 const post=JSON.parse(run("JSON.stringify(Decors726.signs739.signs.filter(g=>g.kind==='post').map(g=>g.S))"));
 assert.equal(post.length,1,'un panneau SORTIE');assert(Math.abs(post[0]-8450)<15,'planté à la vraie position de la sortie : '+post[0]);
 run("Decors726.signs739.signs.length=0;Decors726.signs739.done.clear();store.set('hw739',{post:false});");w.RoadDecor721.draw(cv,10,9000,110);
 assert(!run("Decors726.signs739.signs.some(g=>g.kind==='post')"),'panneau SORTIE désactivable');run("store.set('hw739',{});Highway738.signs=()=>null;");
 // Zone de danger en haut (forme autorisée), coupée en Allemagne.
 run("DZ.cur={id:'z',kind:'zone',left:3200,L:4000,t:Date.now()};limit=130;geo47={cc:'fr'};");
 w.RoadDecor721.draw(cv,10,12000,110);const red=()=>count('r>190&&g<70&&b<70');assert(red()>150,'panneau de la zone de danger (bord rouge) : '+red());
 run("geo47={cc:'de'}");w.RoadDecor721.draw(cv,10,12100,110);
 assert(red()<20,'en Allemagne : pas de zone de danger');
 assert.equal(run("dzPill({id:'z',kind:'zone',left:3200,L:4000,t:Date.now()})"),'','pastille rouge sous la vitesse remplacée par le panneau');
 run("geo47={cc:'fr'};store.set('dz744Hud',false)");assert.notEqual(run("dzPill({id:'z',kind:'zone',left:3200,L:4000,t:Date.now()})"),'','panneau désactivé : la pastille revient');run("store.set('dz744Hud',true);DZ.cur=null;");
 // Réglages.
 run("openSet('GPS et navigation','Panneaux d’autoroute');render();");
 assert(screen().includes('Panneau « SORTIE » au début de la bretelle')&&screen().includes('Panneau des grandes villes et distances'),'options autoroute');
 run("act('hw739:towns:0');act('hw739:post:0')");assert(run("store.get('hw739').towns===false&&store.get('hw739').post===false"));run("act('hw739:towns:1');act('hw739:post:1')");
 run("openSet('GPS et navigation','Panneaux dans l’image');render();");
 assert(screen().includes('Grandes villes et distances')&&screen().includes('Zone de danger en haut de l’image'),'options panneaux');
 run("act('v741:dist:0');act('v741:dz:0')");assert(run("store.get('dist744Dur')===0&&store.get('dz744Hud')===false"));run("act('v741:dist:10');act('v741:dz:1')");
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('OK autoroute : villes et distances au bord de la route et en haut, SORTIE au début de la bretelle, zone de danger (coupée en Allemagne), tout désactivable');
 // 7.46 : ouverture des applis en plein écran par le pont natif (cache Waze), repli sur l'ancienne méthode.
 const opened=[];w.Display743Native.launch=(pk,full)=>{opened.push([pk,full]);return JSON.stringify({ok:pk!=='absent.app',mode:'plein écran demandé'});};
 assert.equal(run("launch745('com.radio.test')"),true);assert.deepEqual(opened.slice(-1)[0],['com.radio.test',true],'appli ouverte en plein écran');
 const old=[];w.Android.launch=pk=>{old.push(pk);return true;};
 run("launch745('absent.app')");assert.deepEqual(old,['absent.app'],'repli sur l’ancienne méthode si le plein écran échoue');
 run("launch745('com.waze,com.google.android.apps.maps')");assert.equal(old.length,2,'liste d’applis : ancienne méthode');
 console.log('OK applis ouvertes en plein écran (Waze caché), repli sinon');
 // 7.46 : changer de page dans l'appli met Waze derrière ; revenir à l'accueil le remet dans son cadre.
 let fronts=0,nav0=0;w.Display743Native.hideViaCompanion=()=>{fronts++;return '{"ok":true}';};w.Display743Native.hideNav=()=>{nav0++;return '{"ok":true}';};
 run("tab='home';render();gbKey='com.waze|1,2,3,4';store.set('gbMode','cadre');");
 run("tab='trips';render();");assert.equal(fronts,1,'Trajets : Waze passé derrière');assert(run('V746.hidden()'));
 run("tab='maint';render();");assert.equal(fronts,1,'pas deux fois');
 const before=t.timers.length;run("tab='home';render();");
 assert(!run('V746.hidden()')&&t.timers.length>before,'retour à l’accueil : Waze relancé dans le cadre');
 run("store.set('hideNav746',false);tab='trips';render();");assert.equal(fronts,1,'désactivable');run("store.set('hideNav746',true);tab='home';render();");
 run("gbKey='';tab='trips';render();");assert.equal(fronts,2,'Waze ouvert avant le redémarrage de l’appli : caché quand même');run("tab='home';render();");
 assert.equal(nav0,0,'appli compagnon utilisée en premier');
 // Sans l'appli compagnon : ancienne méthode + conseil d'installation, une fois par jour.
 w.Display743Native.hideViaCompanion=()=>'{"ok":false,"erreur":"appli compagnon absente"}';
 run("store.set('companionHint749',0);tab='trips';render();");assert.equal(nav0,1,'repli sans compagnon');run("tab='home';render();");
 // Réglage : état et installation.
 w.Display743Native.hasCompanion=()=>false;const urls=[];w.Android.openUrl=u=>urls.push(u);
 run("openSet('GPS et navigation','Cacher Waze hors de l’accueil');render();");
 assert(screen().includes('Accueil 2008 Masque')&&screen().includes('Télécharger et installer'),'page de réglage de la compagnon');
 run("act('v749:install')");assert(/releases\/download\/compagnon-1\/Accueil2008Masque\.apk$/.test(urls[0]||''),'lien de téléchargement');
 w.Display743Native.hasCompanion=()=>true;run('render()');assert(screen().includes('✓ Installée'));
 run("act('v749:on:0')");assert.equal(run("store.get('hideNav746')"),false);run("act('v749:on:1');tab='home';render();");
 console.log('OK pages de l’appli : Waze derrière hors de l’accueil, revient sur l’accueil');
 console.log('Tests 7.43 réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
