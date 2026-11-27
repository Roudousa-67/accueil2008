'use strict';
// 7.65 : Barre de raccourcis, une seule liste (ordre, appli de chaque bouton, retrait).
const assert=require('node:assert/strict');
const {make}=require('./regression.cjs');
const extra=eval(require('fs').readFileSync(__dirname+'/v761.cjs','utf8').match(/const extra=(\[.*?\]);/)[1]);
extra.splice(extra.indexOf('games761.js')+1,0,'settings764.js','settings765.js');
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 run("curSpeed=()=>({v:0,src:'test'});store.set('onboard760',1);openSet('Accueil et affichage','Barre de raccourcis');render();");
 const rows=JSON.parse(run("JSON.stringify([...document.querySelectorAll('#screen [data-setting-row]')].map(r=>r.textContent.replace(/\\s+/g,' ')))"));
 const named=n=>rows.filter(r=>r.startsWith(n));
 assert.equal(named('GPS').length,1,'GPS une seule fois : '+rows.join(' | '));
 assert(rows.some(r=>/^GPS.*Ouvre :.*Choisir l’appli.*Retirer/.test(r)),'GPS : appli, choisir, retirer');
 assert(rows.some(r=>/^CarPlay.*Ouvre :.*Choisir l’appli/.test(r)),'CarPlay gardé dans « Autres boutons »');
 assert(!run("!!document.querySelector('#screen [data-act^=\"dock730:edit:\"]')"),'plus de bouton « Modifier » en double');
 run("act('s765:mv:music:-1')");assert.equal(run("Settings765.order()[0]"),'music','monter');
 run("act('s765:rm:radio')");assert(!run("Settings765.order().includes('radio')"),'retirer');
 run("tab='home';render();");assert(!run("!!document.querySelector('#screen [data-dock730=\"radio\"]')"),'retiré de la barre de gauche');
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('OK barre de raccourcis : une seule liste (appli, ordre, retrait)');
 console.log('Tests 7.65 réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
