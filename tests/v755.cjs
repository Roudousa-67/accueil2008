'use strict';
// 7.55 : fonds d'espace animés, ciel réel, fond qui suit la journée, Voie lactée ; garde-fou de lenteur.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js','lib/qrcode-generator.js','v738.js','transfer738.js','stations738.js','highway738.js','v740.js','diag738.js','display743.js','v750.js','secours753.js','uninstall753.js','bar754.js','wall755.js','settings738.js'];
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 assert.equal(JSON.parse(run("JSON.stringify(WALLS.filter(x=>x.k==='sp751').map(x=>x.id))")).length,20,'18 fonds + ciel réel + journée');
 run("act('wall:sky');tab='home';render();");
 assert(run("!!document.getElementById('wall755')"),'couche posée sous l’accueil');
 assert([...t.activeIntervals.values()].some(x=>x.ms===125),'animation lente');
 assert.equal(run("getComputedStyle(document.getElementById('wall755')).pointerEvents"),'none','ne capte aucun appui');
 run("act('w755:fixe');tab='home';render();");assert(![...t.activeIntervals.values()].some(x=>x.ms===125),'fixe');
 run("act('w755:lent');tab='trips';render();");assert(![...t.activeIntervals.values()].some(x=>x.ms===125),'pas d’animation hors de l’accueil');
 assert(fs.readFileSync(path.join(__dirname,'../sources_assets/decors726.js'),'utf8').includes('Milky755(c,W,TOP,HZ,t)')&&run("typeof Milky755")==='function','Voie lactée branchée');
 // Garde-fou : dessin trop lent → Fixe.
 run("tab='home';render();");const it=[...t.activeIntervals.values()].find(x=>x.ms===125);
 let tick=0;const p0=w.performance.now.bind(w.performance);w.performance.now=()=>(tick+=40);
 for(let i=0;i<20;i++)it.fn();
 w.performance.now=p0;
 assert.equal(run("store.get('wallAnim755')"),'fixe','trop lent → Fixe tout seul');
 run("act('wall:g0');render();");assert(!run("!!document.getElementById('wall755')"),'couche retirée avec un fond classique');
 run("Try750.set('wall755','off');act('wall:sky');render();");assert(!run("!!document.getElementById('wall755')"),'désactivable');
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('OK fonds d’espace : 20 fonds, couche sans appui, lente/fixe, accueil seulement, garde-fou, Voie lactée, désactivable');
 console.log('Tests 7.55 réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
