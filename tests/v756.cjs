'use strict';
// 7.56 : tickets reçus jamais perdus (Joindre au plein, rappel).
const assert=require('node:assert/strict');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js','lib/qrcode-generator.js','v738.js','transfer738.js','stations738.js','highway738.js','v740.js','diag738.js','display743.js','v750.js','secours753.js','uninstall753.js','bar754.js','wall755.js','ticket756.js','settings738.js'];
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 const scr=()=>run("document.querySelector('#screen').textContent");
 // Ticket reçu puis page quittée sans enregistrer le plein.
 run("Journeys733.receiveReceipt('file738:ticket-1.jpg');tab='home';render();");
 assert.equal(run("store.get('pendingTicket756').ref"),'file738:ticket-1.jpg','ticket retenu');
 run("store.set('pendingTicket756',{ref:'file738:ticket-1.jpg',at:Date.now()-10*60000});Ticket756.check();");
 assert(run("V740.Alerts.list.some(a=>a.source==='ticket756'&&/pas encore enregistré/.test(a.text))"),'rappel « Ticket non enregistré »');
 // Joindre au plein depuis le rappel.
 run("act('tk756:join:ticket-1.jpg')");assert.equal(run('tab'),'trips','page Carburant ouverte');assert(!run("V740.Alerts.list.some(a=>a.source==='ticket756')"),'rappel retiré');
 // Enregistré avec un plein → plus de rappel.
 run("store.set('fuelLog',[{t:Date.now(),l:40,e:70,k:1000,receipt733:'file738:ticket-1.jpg'}]);Ticket756.check();");assert.equal(run("store.get('pendingTicket756')"),null,'oublié une fois enregistré');
 // Liste des fichiers reçus : bouton « Joindre au plein » sur les photos.
 w.Transfer738Native=Object.assign(w.Transfer738Native||{},{status:()=>JSON.stringify({native:true,running:false,used:1000,quota:1e9,files:2}),list:()=>JSON.stringify([{name:'ticket-2.jpg',size:5000,time:Date.now(),kept:false},{name:'trajet.gpx',size:300,time:Date.now(),kept:false}])});
 run("openSet('Trajets et carburant','Transfert depuis le téléphone');render();");
 assert(run("!!document.querySelector('#screen [data-act=\"tk756:join:ticket-2.jpg\"]')"),'bouton sur la photo');
 assert(!run("!!document.querySelector('#screen [data-act=\"tk756:join:trajet.gpx\"]')"),'pas sur un GPX');
 run("act('tk756:forget')");
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('OK tickets : retenu, rappel, joindre au plein, oublié une fois enregistré, bouton dans la liste');
 console.log('Tests 7.56 réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
