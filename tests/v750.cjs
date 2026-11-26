'use strict';
// 7.50 : Nouveautés à tester, mise à jour en roulant installée au prochain arrêt, ménage.
const assert=require('node:assert/strict');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js','lib/qrcode-generator.js','v738.js','transfer738.js','stations738.js','highway738.js','v740.js','diag738.js','display743.js','v750.js','settings738.js'];
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 assert(Number(run('APP_VERSION'))>=7.50);
 const screen=()=>run("document.querySelector('#screen').textContent");
 // Nouveautés à tester
 const layout=JSON.parse(run('JSON.stringify(Settings738.layout())'));
 const sys=layout.find(([c])=>c==='Système')[1];
 assert(sys.includes('Nouveautés à tester')&&!sys.includes('Performances')&&!sys.includes('Écran d\'accueil du poste'),'Système rangé : '+sys.join(', '));
 run("openSet('Système','Nouveautés à tester');render();");
 assert(screen().includes('Barre du bas sans doublons')&&screen().includes('Je n’aime pas'),'page des nouveautés');
 run("act('try750:pill750:no')");assert.equal(run("Try750.on('pill750')"),false);assert(screen().includes('À supprimer à la prochaine mise à jour'));
 assert(JSON.parse(run('JSON.stringify(Try750.reportLines())')).join(' ').includes('Plus de pastille rouge'),'liste dans le rapport');
 run("act('try750:pill750:on')");
 // Rapport : partie avancée
 run("openSet('Système','Rapport de diagnostic');render();");assert(screen().includes('Avancé : performances'),'pages techniques rangées');
 // Nouveautés : 3 dernières versions
 run("openSet('Système','Nouveautés');render();");assert(screen().includes('Versions plus anciennes'),'historique plié');
 // Barre du bas sans doublons, barre de gauche intacte
 run("tab='home';render();");
 run("if(!DOCK.some(d=>d.id==='radio'))DOCK.splice(0,DOCK.length,...DOCK_ALL)");const bottom=run("dockC(Object.assign({},palette(),{noChrome:false}),false)"),rail=run("dockC(Object.assign({},palette(),{noChrome:false}),true)");
 assert(/dock730="gps"|dock:gps/.test(bottom)&&!/dock730="(radio|music|settings)"|dock:(radio|music|settings)"/.test(bottom),'barre du bas sans doublons');
 assert.equal(rail,run("dockC(Object.assign({},palette(),{noChrome:false}),true)"));
 run("act('try750:dock750:off')");assert(/dock730="radio"|dock:radio"/.test(run("dockC(Object.assign({},palette(),{noChrome:false}),false)")),"désactivable");run("act('try750:dock750:on')");
 // Pastille rouge supprimée
 assert.equal(run("dzPill({id:'z',kind:'zone',left:3000,L:4000,t:Date.now()})"),'');
 // Ancien cadre encastré abandonné, envoi par Internet, plus de « Dicter »
 assert.equal(run("store.get('gpsRefused')"),true);assert.equal(run("store.get('transferMode741','internet')"),'internet');
 run("openSet('Système','Rapport de diagnostic');render();");assert(!screen().includes('Dicter'),'bouton Dicter retiré');
 run("openSet('Trajets et carburant','Transfert depuis le téléphone');render();");assert(!screen().includes('Mode d’envoi'),'choix du mode d’envoi retiré');
 // Mise à jour : téléchargée en roulant, installée au prochain arrêt
 let started=0,installs=0;
 run("updInfo={version:'9.99',apk:'https://github.com/Roudousa-67/accueil2008/releases/download/v9.99/a.apk',sha256:'a'.repeat(64)};");
 w.Files721.start=()=>{started++;w.Files721.state={phase:'ready'};return true;};
 w.Android.http=(url,id)=>queueMicrotask(()=>w.__httpCb(id,true,JSON.stringify({version:'9.99',apk:'https://github.com/Roudousa-67/accueil2008/releases/download/v9.99/a.apk',sha256:'a'.repeat(64)})));
 run("loc={lat:48.5,lon:7.7,spd:80,acc:5,brg:0,ts:Date.now()};");
 await run('checkUpdate()');
 assert.equal(started,1,'téléchargement lancé en roulant');
 assert.equal(run('Update720.pending'),null,'pas de fenêtre en roulant');
 const old=w.act;w.__inst=0;run("const a0=act;act=function(a){if(a==='files721:install'&&!moving()){window.__inst++;return;}return a0.apply(this,arguments);};");
 const tick=()=>{const it=[...t.activeIntervals.values()].filter(x=>x.ms===1000);it.forEach(x=>x.fn());};
 tick();assert.equal(run('window.__inst'),0,'rien en roulant');
 run("loc={lat:48.5,lon:7.7,spd:0,acc:5,brg:0,ts:Date.now()};");tick();t.advance(3000);run('loc.spd=0;loc.ts=Date.now();');tick();
 assert.equal(run('window.__inst'),1,'installation proposée à l’arrêt');
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('OK nouveautés à tester, ménage, mise à jour en roulant installée au prochain arrêt');
 console.log('Tests 7.50 réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
