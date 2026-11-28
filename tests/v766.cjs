'use strict';
// 7.66 : décor vivant (monuments, trafic, panneau de limitation planté, panneau de département).
const assert=require('node:assert/strict');
const {make}=require('./regression.cjs');
const extra=eval(require('fs').readFileSync(__dirname+'/v761.cjs','utf8').match(/const extra=(\[.*?\]);/)[1]);
extra.splice(extra.indexOf('games761.js')+1,0,'settings764.js','settings765.js','decor766.js');
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 run("store.set('onboard760',1);getJSON=async()=>({elements:[]});");
 for(let i=0;i<3;i++)t.timers.filter(x=>x.ms===500).forEach(x=>x.fn());
 assert(run("!!window.Decor766&&typeof Decor766.sign==='function'"),'moteur du décor prêt');
 const moveAt=(spd)=>run(`curSpeed=()=>({v:${spd},src:'test'});loc={lat:48.58,lon:7.75,spd:${spd/3.6},acc:5,brg:0,alt:0,ts:Date.now()};`);
 // Département : panneau quand on change de département en roulant
 moveAt(80);run("geoA={cp:'67000',dep:'Bas-Rhin',reg:'Grand Est'};Decor766Live.depCheck();");assert.equal(run("Decor766.signs().length"),0,'pas de panneau au premier relevé');
 run("geoA={cp:'68000',dep:'Haut-Rhin',reg:'Grand Est'};Decor766Live.depCheck();");
 assert(run("Decor766.signs().some(g=>g.kind==='dep766'&&g.data.code==='68'&&g.data.name==='Haut-Rhin')"),'panneau Haut-Rhin');
 assert.equal(run("Decor766Live.depCode('20100')"),'2A','Corse-du-Sud');
 // Limitation : panneau planté quand la limite change
 run("limit=50;Decor766Live.limitCheck();limit=30;Decor766Live.limitCheck();");assert(run("Decor766.signs().some(g=>g.kind==='limit766'&&g.data.v===30)"),'panneau 30 planté');
 // À l'arrêt : rien
 moveAt(0);run("limit=70;Decor766Live.limitCheck();");assert(!run("Decor766.signs().some(g=>g.kind==='limit766'&&g.data.v===70)"),'pas de panneau à l’arrêt');
 // Coupé dans les réglages
 moveAt(80);run("act('d766:on:limit766:0');limit=90;Decor766Live.limitCheck();");assert(!run("Decor766.signs().some(g=>g.kind==='limit766'&&g.data.v===90)"),'panneau coupé');run("act('d766:on:limit766:1')");
 // Trafic : plus de voitures dans les bouchons
 run("V740.T.last=[{cur:20,free:90}];V740.T.at=Date.now();");assert.equal(run('Decor766Live.density()'),3,'bouchon : 3 fois plus de voitures');
 run("V740.T.last=[{cur:85,free:90}];");assert.equal(run('Decor766Live.density()'),1,'fluide : normal');
 // Monuments : silhouettes dessinées en ville, dans la bonne direction
 run("Decor766Live.S.monu.at=Date.now();Decor766Live.S.monu.pos=[48.58,7.75];Decor766Live.S.monu.list=[{lat:48.60,lon:7.75,name:'Cathédrale',kind:'cathedral'},{lat:48.56,lon:7.75,name:'Derrière',kind:'tower'}];");
 const n=run("(()=>{let k=0;const api={scene:'ville',night:false,W:960,HZ:200,rect:()=>k++,poly:()=>k++};Decor766Live.horizonDraw(api);return k})()");
 assert(n>0&&n<12,'cathédrale devant dessinée, tour derrière ignorée : '+n);
 assert.equal(run("(()=>{let k=0;Decor766Live.horizonDraw({scene:'autoroute',W:960,HZ:200,rect:()=>k++,poly:()=>k++});return k})()"),0,'pas de monuments sur autoroute');
 // Réglages
 run("openSet('Widgets','Vue voiture et route');tab='settings';render();");const txt=run("document.getElementById('screen').textContent");
 assert(txt.includes('DÉCOR VIVANT')&&txt.includes('Monuments à l’horizon')&&txt.includes('Panneau d’entrée de département'),'réglages du décor vivant');
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('OK décor vivant : département, limitation, trafic, monuments, réglages');
 console.log('Tests 7.66 réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
