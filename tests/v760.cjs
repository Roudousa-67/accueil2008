'use strict';
// 7.60 : bienvenue (2008 GT Line, bonjour/bon après-midi/bonsoir, profils) et visites guidées.
const assert=require('node:assert/strict');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js','lib/qrcode-generator.js','v738.js','transfer738.js','stations738.js','highway738.js','v740.js','diag738.js','display743.js','v750.js','secours753.js','uninstall753.js','bar754.js','wall755.js','walls760.js','ticket756.js','ticket757.js','music758.js','stats759.js','tour760.js','photo760.js','settings738.js','ranger758.js','apparence760.js','info760.js','keep758.js'];
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 run("curSpeed=()=>({v:0,src:'test'})");
 // Bonjour selon l'heure
 const g=h=>run(`(()=>{const D=Date;const d=new D();d.setHours(${h},0,0,0);const o=D.prototype.getHours;D.prototype.getHours=function(){return ${h}};const r=greet760();D.prototype.getHours=o;return r;})()`);
 assert.equal(g(9),'Bonjour');assert.equal(g(14),'Bon après-midi');assert.equal(g(21),'Bonsoir');assert.equal(g(3),'Bonsoir');
 // Premier lancement : bienvenue
 t.timers.filter(x=>x.ms===3500).forEach(x=>x.fn());
 assert(run("!!document.getElementById('tour760')"),'bienvenue au premier lancement');
 assert(run("document.getElementById('tour760').textContent").includes('Bienvenue dans ta 2008 GT Line'),'« 2008 GT Line »');
 // Nouveau conducteur
 run("document.querySelector('#tour760 [data-t=\"new\"]').click();document.getElementById('t760name').value='Léa';document.querySelector('#tour760 [data-t=\"save\"]').click();");
 assert.equal(run('profiles()[profIdx()]'),'Léa','nouveau conducteur créé et choisi');
 run("document.querySelector('#tour760 [data-t=\"next\"]').click();");
 assert(run("store.get('onboard760',0)")>0,'bienvenue vue une fois');
 const steps=run('Tour760.state().steps.length');assert(steps>=30,'visite complète : '+steps+' étapes');
 t.timers.splice(0).forEach(x=>x.fn());
 const txt=run("document.getElementById('tour760').textContent");assert(txt.includes('VISITE GUIDÉE')&&txt.includes('Le couper'),'étape avec « le couper »');
 for(let i=0;i<steps+2&&run("!!Tour760.state()");i++){run("document.querySelector('#tour760 [data-t=\"next\"]').click()");t.timers.splice(0).forEach(x=>x.fn());}
 assert(!run("!!document.getElementById('tour760')"),'visite terminée');
 // Relance par catégorie depuis les réglages
 run("openSet('Système','Aide et visites guidées');render();");
 assert(run("!!document.querySelector('#screen [data-act=\"tour760:tickets\"]')"),'page Aide avec les catégories');
 run("act('tour760:tickets')");assert.equal(run('Tour760.state().steps.length'),2,'visite Tickets seule');
 run("Tour760.close();act('tour760:welcome')");assert(run("document.getElementById('tour760').textContent").includes('Qui conduit'),'revoir la bienvenue');
 run("Tour760.close()");
 // En roulant : pas de visite
 run("curSpeed=()=>({v:60,src:'test'});act('tour760:all')");assert(!run("!!document.getElementById('tour760')"),'pas en roulant');
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('OK bienvenue (GT Line, bonjour selon l’heure, nouveau conducteur) et visites guidées ('+steps+' étapes, par catégorie, pas en roulant)');
 console.log('Tests 7.60 réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
