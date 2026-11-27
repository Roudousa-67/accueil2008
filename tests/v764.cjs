'use strict';
// 7.64 : ménage des réglages (doublons, vrais titres), taille et fluidité du widget route, copie de sécurité, nettoyage.
const assert=require('node:assert/strict');
const {make}=require('./regression.cjs');
const extra=eval(require('fs').readFileSync(__dirname+'/v761.cjs','utf8').match(/const extra=(\[.*?\]);/)[1]);
extra.splice(extra.indexOf('games761.js')+1,0,'settings764.js');
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 run("curSpeed=()=>({v:0,src:'test'});store.set('onboard760',1);");
 // Plus de rubrique en double
 const dup=run("JSON.stringify(SETCATS.flatMap(c=>c[1].map(s=>c[0]+'/'+s[0])).filter((x,i,a)=>a.indexOf(x)!==i))");
 assert.equal(dup,'[]','aucune rubrique en double : '+dup);
 // Vrais titres pour les champs
 const names=JSON.parse(run("(()=>{const out=[];for(let c=0;c<SETCATS.length;c++)for(let s=0;s<SETCATS[c][1].length;s++){setCat=c;setSub=s;tab='settings';try{render();}catch(e){}for(const [k,it] of Help723.rows)out.push(it.name)}return JSON.stringify(out)})()"));
 const bad=names.filter(n=>/^Champ de /.test(n));assert(bad.length<=2,'champs sans titre : '+bad.join(', '));
 assert(!names.some(n=>/\d$/.test(n)&&/Taille des icônes/.test(n)),'pas de valeur collée au titre');
 // Taille du widget route
 const w0=run("Settings764.roadItem(fCfg())&&Settings764.roadItem(fCfg()).it.w");
 if(w0){run("act('s764:size:grand')");assert.equal(run("Settings764.curSize()"),'grand','widget route grand');run("act('s764:size:petit')");assert.equal(run("Settings764.curSize()"),'petit','widget route petit');
  const ok=run("fCfg().pages[0].every(a=>a.x>=0&&a.x+a.w<=12&&a.y+a.h<=6)");assert(ok,'les widgets restent dans l’écran');}
 // Fluidité
 run("act('s764:fluid:eco')");assert.equal(run('Fluid764.step(1)'),3,'économie : 1 image sur 3');run("act('s764:fluid:fluide')");assert.equal(run('Fluid764.step(4)'),2,'fluide : au plus 1 sur 2');run("act('s764:fluid:normal')");assert.equal(run('Fluid764.step(2)'),2,'normal : adapté');
 run("openSet('Widgets','Vue voiture et route');render();");assert(run("document.getElementById('screen').textContent").includes('Fluidité du décor'),'réglages dans Vue voiture et route');
 // Copie de sécurité
 run("window.__saved=[];Transfer738.saveText=(n,m,txt)=>{__saved.push([n,txt.length]);return {ok:true,path:n}};Transfer738.showQR=f=>{window.__qr=f};");
 run("act('s764:backup')");assert(run("__saved.length===1&&__saved[0][0].startsWith('sauvegarde-accueil2008-')"),'fichier de sauvegarde');
 run("openSet('Système','Sauvegarde');render();");assert(run("document.getElementById('screen').textContent").includes('Récupérer sur mon téléphone'),'bouton téléphone');
 run("act('s764:qr')");assert(run("String(window.__qr).startsWith('sauvegarde-accueil2008-')"),'QR de récupération');
 // Nettoyage
 run("store.set('fuelLog',[{t:Date.now()-400*864e5,l:30,e:50,receipt733:'receipt733-old'},{t:Date.now(),l:30,e:50,receipt733:'receipt733-new'}]);localStorage.setItem('receipt733-old','x'.repeat(1000));localStorage.setItem('receipt733-new','y');localStorage.setItem('receipt733-orphan','z');act('s764:clean')");
 assert(!run("localStorage.getItem('receipt733-old')")&&!run("localStorage.getItem('receipt733-orphan')")&&run("localStorage.getItem('receipt733-new')")==='y','nettoyage : vieux et orphelins supprimés, récent gardé');
 assert.equal(run("store.get('fuelLog').length"),2,'les pleins restent');
 // Chaque semaine, pas en roulant
 run("store.set('backup764',{at:Date.now()-8*864e5,ok:true});__saved.length=0;curSpeed=()=>({v:70,src:'test'});loc={lat:48.5,lon:7.7,spd:20,ts:Date.now()};Settings764.weekly()");assert.equal(run('__saved.length'),0,'pas de sauvegarde en roulant');
 run("curSpeed=()=>({v:0,src:'test'});loc={lat:48.5,lon:7.7,spd:0,ts:Date.now()};Settings764.weekly()");assert.equal(run('__saved.length'),1,'sauvegarde de la semaine');
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('OK réglages sans doublon, champs titrés ('+names.length+' lignes), taille et fluidité du widget route, copie de sécurité, nettoyage');
 console.log('Tests 7.64 réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
