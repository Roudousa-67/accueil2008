'use strict';
// 7.51 : appui long dans « Toutes les applications » → Désinstaller ; page « Rechercher l'affichage » retirée.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js','lib/qrcode-generator.js','v738.js','transfer738.js','stations738.js','highway738.js','v740.js','diag738.js','display743.js','v750.js','v751.js','wall751.js','settings738.js'];
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 const sys=JSON.parse(run('JSON.stringify(Settings738.layout())')).find(([c])=>c==='Système')[1];
 assert(!sys.includes('Rechercher l’affichage')&&!sys.includes('Analyser le lanceur d’origine'),'pages techniques retirées');
 // Manifeste : la permission de désinstaller est ajoutée à la construction.
 assert(fs.readFileSync(path.join(__dirname,'../outils/axml.py'),'utf8').includes("'android.permission.REQUEST_DELETE_PACKAGES'"),'permission ajoutée au manifeste');
 let asked=[],installed=true;
 w.Display743Native=Object.assign(w.Display743Native||{},{uninstall:pk=>{asked.push(pk);return JSON.stringify({ok:true,systeme:pk==='com.qf.radio'});},installed:()=>installed});
 run("openDrawer(null)");assert(run("$('drawer').classList.contains('on')"),'tiroir ouvert');
 run("act('app:com.spotify.music',true)");
 assert(run("!!document.getElementById('un751')"),'menu à l’appui long');
 assert(run("document.getElementById('un751').textContent").includes('Désinstaller'));
 run("act('un751:del:com.spotify.music')");
 assert.deepEqual(asked,['com.spotify.music'],'fenêtre Android demandée');
 assert(!run("!!document.getElementById('un751')"),'menu fermé');
 installed=false;[...t.activeIntervals.values()].filter(x=>x.ms===1500).forEach(x=>x.fn());
 assert(run("document.body.textContent").includes('Appli désinstallée'),'liste relue après désinstallation');
 // Appui court : ouvre l'appli comme avant ; tiroir en mode « choisir » : pas de menu.
 run("act('app:com.qf.radio',true)");run("act('un751:del:com.qf.radio')");assert(run("document.body.textContent").includes('Appli du système'),'appli système : fiche Android');
 run("act('try750:uninstall751:off')");run("openDrawer(null);act('app:com.spotify.music',true)");assert(!run("!!document.getElementById('un751')"),'désactivable');
 // Fonds d'espace animés, ciel réel, fond qui suit la journée
 const walls=JSON.parse(run("JSON.stringify(WALLS.filter(x=>x.k==='sp751').map(x=>x.id))"));
 assert.equal(walls.length,20,'18 fonds d’espace + ciel réel + journée');
 run("act('wall:sky');tab='home';render();");
 assert(run("!!document.getElementById('wall751')"),'couche animée posée sous l’accueil');
 assert([...t.activeIntervals.values()].some(x=>x.ms===125),'animation lente');
 run("act('w751:fixe');tab='home';render();");assert(![...t.activeIntervals.values()].some(x=>x.ms===125),'fixe : plus d’animation');
 assert(run("typeof Milky751")==='function'&&require('node:fs').readFileSync(require('node:path').join(__dirname,'../sources_assets/decors726.js'),'utf8').includes('Milky751(c,W,TOP,HZ,t)'),'Voie lactée branchée sur le décor');
 run("act('wall:g0');render();");assert(!run("!!document.getElementById('wall751')"),'couche retirée avec un fond classique');
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('OK fonds d’espace animés, ciel réel, journée, Voie lactée');
 console.log('OK appui long : désinstaller, appli système, liste relue, désactivable ; pages techniques retirées');
 console.log('Tests 7.51 réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
