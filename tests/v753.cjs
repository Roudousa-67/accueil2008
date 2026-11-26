'use strict';
// 7.53 : désinstaller par appui long ; revenir comme avant (tout couper, mode secours, coupure à distance).
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js','lib/qrcode-generator.js','v738.js','transfer738.js','stations738.js','highway738.js','v740.js','diag738.js','display743.js','v750.js','secours753.js','uninstall753.js','settings738.js'];
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 assert(fs.readFileSync(path.join(__dirname,'../outils/axml.py'),'utf8').includes("'android.permission.REQUEST_DELETE_PACKAGES'"),'permission ajoutée au manifeste');
 // ---------- Désinstaller ----------
 let asked=[],installed=true;
 w.Display743Native=Object.assign(w.Display743Native||{},{uninstall:pk=>{asked.push(pk);return JSON.stringify({ok:true,systeme:pk==='com.qf.radio'});},installed:()=>installed});
 run("openDrawer(null)");run("act('app:com.spotify.music',true)");
 assert(run("!!document.getElementById('un753')"),'menu à l’appui long');
 run("act('un753:del:com.spotify.music')");assert.deepEqual(asked,['com.spotify.music'],'fenêtre Android demandée');
 installed=false;[...t.activeIntervals.values()].filter(x=>x.ms===1500).forEach(x=>x.fn());
 assert(run("document.body.textContent").includes('Appli désinstallée'),'liste relue');
 run("act('app:com.qf.radio',true)");run("act('un753:del:com.qf.radio')");assert(run("document.body.textContent").includes('Appli du système'),'appli système');
 // L'appui court ouvre toujours l'appli ; l'appui long hors du tiroir ne change pas.
 run("closeOverlays();act('app:com.spotify.music',true)");assert(!run("!!document.getElementById('un753')"),'pas de menu hors du tiroir');
 console.log('OK désinstaller par appui long : menu, fenêtre Android, appli système, liste relue');
 // ---------- Revenir comme avant ----------
 run("openSet('Système','Nouveautés à tester');render();");
 const scr=()=>run("document.querySelector('#screen').textContent");
 assert(scr().includes('Revenir comme avant')&&scr().includes('Tout couper'),'boutons en haut de la page');
 run("act('sec753:off')");assert.equal(run("Try750.on('uninstall753')"),false,'tout coupé');
 run("openDrawer(null);act('app:com.spotify.music',true)");assert(!run("!!document.getElementById('un753')"),'désinstaller coupé');
 run("act('sec753:on')");assert.equal(run("Try750.on('uninstall753')"),true,'tout remis');
 // Coupure à distance
 w.getJSON=async()=>({off:['uninstall753']});await run('Secours753.remote()');assert.equal(run("Try750.on('uninstall753')"),false,'coupure à distance');
 run("Try750.set('uninstall753','on')");await run('Secours753.remote()');assert.equal(run("Try750.on('uninstall753')"),true,'une seule fois : tu peux la remettre');
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 // Mode secours : 3e lancement en 3 minutes → tout coupé.
 run("localStorage.setItem('a08launch753',JSON.stringify([Date.now()-60000,Date.now()-30000]))");
 t.timers.length=0;
 w.eval(fs.readFileSync(path.join(__dirname,'../sources_assets/secours753.js'),'utf8'));
 t.timers.filter(x=>!x.ms).forEach(x=>x.fn());
 assert.equal(run("Try750.on('uninstall753')"),false,'mode secours : nouveautés coupées');
 assert(/3 lancements/.test(run("store.get('secours753').why")),'raison notée');
 console.log('OK revenir comme avant : tout couper, tout remettre, coupure à distance, mode secours');
 console.log('Tests 7.53 réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
