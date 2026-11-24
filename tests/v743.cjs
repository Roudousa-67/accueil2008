'use strict';
// 7.43 : « Rechercher l'affichage » : recherche complète du poste, essais pour cacher Waze, envoi par QR, rapport.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js','lib/qrcode-generator.js','v738.js','transfer738.js','stations738.js','highway738.js','v740.js','diag738.js','display743.js','settings738.js'];
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 assert.equal(run('APP_VERSION'),'7.43');
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
 const lines=JSON.parse(run('JSON.stringify(Display743.reportLines())')).join('\n');
 for(const s of ['FYT / Android / UIS7862','com.syu.ms.action.SHOW_NAVI_WINDOW','ActivityView×4','ACTIVITY_EMBEDDING : accordée','com.android.systemui : temps dépassé','ouverture en plein écran : ouvert (plein écran demandé), Waze caché : non'])assert(lines.includes(s),'rapport : '+s);
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
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('OK page Rechercher l’affichage : recherche, résultat, essais plein écran, envoi par QR, rapport de diagnostic');
 console.log('Tests 7.43 réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
