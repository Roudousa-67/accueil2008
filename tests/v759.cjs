'use strict';
// 7.59 : Trajets → Bilan (bouchons, chaleur, exploration, frais km, stations) et classement éco de la famille.
const assert=require('node:assert/strict');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js','lib/qrcode-generator.js','v738.js','transfer738.js','stations738.js','highway738.js','v740.js','diag738.js','display743.js','v750.js','secours753.js','uninstall753.js','bar754.js','wall755.js','ticket756.js','ticket757.js','music758.js','stats759.js','settings738.js','ranger758.js','keep758.js'];
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 const screen=()=>run("document.querySelector('#screen').textContent");
 assert.deepEqual(JSON.parse(run('JSON.stringify(tripSubs.map(x=>x[1]))')),['Trajets','Stats','Bilan','Éco','Pleins','Tickets','Stations'],'onglets de Trajets');
 assert.equal(run('Stats759.bareme(5,12840)'),Math.round((12840*.357+1395)*100)/100,'barème 5 CV');
 assert.equal(run('Stats759.bareme(6,4000)'),2660,'barème 6 CV ≤ 5000 km');
 run("store.set('fuelLog',[{t:Date.now()-5e8,l:40,e:68.4,k:1000,s:'Leclerc Illkirch'},{t:Date.now()-4e8,l:30,e:53.7,k:1500,s:'Total Geispolsheim'},{t:Date.now()-3e8,l:42,e:71.4,k:2100,s:'leclerc illkirch'}])");
 const rank=JSON.parse(run('JSON.stringify(Stats759.stationRank())'));assert.equal(rank[0].n,2,'stations regroupées');assert(rank[0].avg<rank[1].avg,'moins chère en premier');
 run("trip=trip||{start:Date.now(),last:Date.now(),dist:0,eco:null};loc={lat:48.58,lon:7.75,spd:8,acc:5,brg:90,ts:Date.now()};Stats759.jamTick();");
 t.advance(120000);run("loc={lat:48.581,lon:7.751,spd:8,acc:5,brg:90,ts:Date.now()};Stats759.jamTick();loc={lat:48.6,lon:7.8,spd:80,acc:5,brg:90,ts:Date.now()};Stats759.jamTick();");
 assert(run("Object.values(store.get('jam759',{})).reduce((a,b)=>a+b,0)")>=110,'bouchon compté');
 run("act('tsub:bilan')");assert(screen().includes('Temps perdu dans les bouchons')&&screen().includes('Frais kilométriques')&&screen().includes('Leclerc Illkirch'),'page Bilan');
 run("store.set('trips',[{start:Date.now()-3600e3,end:Date.now()-3000e3,dist:12,score:88,driver733:0},{start:Date.now()-7200e3,end:Date.now()-6600e3,dist:8,score:72,driver733:1}])");
 run("act('tsub:eco')");assert(screen().includes('Classement éco de la famille'),'classement famille');
 run("act('tsub:pleins')");assert(run("!!document.querySelector('#screen [data-act=\"tsub:conso\"]')"),'bouton Conso par plein');
 run("act('tsub:conso')");assert(run("!!document.querySelector('#screen [data-act=\"tsub:pleins\"]')"),'retour aux pleins');
 let pdf=null;w.Display743Native={sharePdf:(n,ti,tx,m)=>{pdf={n,ti};return JSON.stringify({ok:true,fichier:'x.pdf'});}};
 run("act('tsub:bilan');act('s759:pdf')");assert(pdf&&/Frais kilométriques/.test(pdf.ti),'PDF des frais kilométriques');
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('OK Bilan : barème, stations, bouchons, page, famille, Conso par plein, PDF');
 console.log('Tests 7.59 réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
