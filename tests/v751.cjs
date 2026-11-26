'use strict';
// 7.51 : extraire le code du lanceur d'origine (« Thème ») et l'envoyer par e-mail.
const assert=require('node:assert/strict');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js','lib/qrcode-generator.js','v738.js','transfer738.js','stations738.js','highway738.js','v740.js','diag738.js','display743.js','v750.js','v751.js','settings738.js'];
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 const screen=()=>run("document.querySelector('#screen').textContent");
 const sys=JSON.parse(run('JSON.stringify(Settings738.layout())')).find(([c])=>c==='Système')[1];
 assert(sys.includes('Analyser le lanceur d’origine'),'page dans Système');
 let sent=null;
 w.Display743Native={themeCandidates:()=>JSON.stringify([{pkg:'com.qf.theme',label:'Thème',version:'1.0',home:false,theme:true,mo:12.5},{pkg:'com.android.launcher3',label:'Launcher3',version:'10',home:true,theme:false,mo:3},{pkg:'com.qf.weather2',label:'Météo',version:'1',home:false,theme:false,mo:1}]),exportCode:(pk,mail)=>{sent={pk,mail};return JSON.stringify({ok:true,fichier:'Téléchargements/Accueil2008/code-launcher-x.zip',mo:8.2,laisses:''});}};
 run("store.set('display743Mail','moi@exemple.com');openSet('Système','Analyser le lanceur d’origine');render();");
 assert(screen().includes('Thème')&&screen().includes('com.android.launcher3'),'liste des lanceurs');
 run("act('v751:pick:com.qf.weather2')");run("act('v751:export')");t.timers.splice(0).forEach(x=>x.fn());
 assert.deepEqual(sent,{pk:'com.qf.theme,com.android.launcher3,com.qf.weather2',mail:'moi@exemple.com'},'thème et lanceurs choisis d’office, e-mail repris');
 assert(screen().includes('code-launcher-x.zip'),'résultat affiché');
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('OK analyse du lanceur d’origine : liste, choix, extraction et e-mail');
 console.log('Tests 7.51 réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
