'use strict';
// 7.58 : fenêtre « Remplacer par… » dans #stage avec les vrais logos ; musique (pochette, égaliseur, radios, concert).
const assert=require('node:assert/strict');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js','lib/qrcode-generator.js','v738.js','transfer738.js','stations738.js','highway738.js','v740.js','diag738.js','display743.js','v750.js','secours753.js','uninstall753.js','bar754.js','wall755.js','ticket756.js','ticket757.js','music758.js','settings738.js'];
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 // ---------- Fenêtre « Remplacer par… » ----------
 run("appsCache=[{p:'com.spotify.music',l:'Spotify'},{p:'com.waze',l:'Waze'}];allApps().forEach(a=>iconCache.set(a.p,'data:image/png;base64,AAAA'))");
 run("tab='home';render();act('bar754:edit');act('arapp:pick:0');");
 assert(run("!!document.querySelector('#stage #arPickLayer')"),'fenêtre dans la zone des appuis (#stage)');
 assert(run("document.querySelectorAll('#arPickLayer img[data-icon][src]').length")>0,'logos chargés');
 assert.equal(run("document.querySelector('#arPickLayer [data-act=\"arapp:set:d:phone\"]').closest('[data-act]').dataset.act"),'arapp:set:d:phone','un appui sur une appli la choisit');
 run("act('arapp:set:d:phone')");assert.equal(run("arApps()[0]"),'d:phone','appli remplacée');assert(!run("!!document.getElementById('arPickLayer')"),'fenêtre fermée');
 run("act('arapp:done')");
 console.log('OK fenêtre « Remplacer par… » : dans la zone des appuis, logos, choix, fermeture');
 // ---------- Musique ----------
 const stop=()=>run("loc={lat:48.58,lon:7.75,spd:0,acc:5,brg:90,ts:Date.now()};"),go=()=>run("loc={lat:48.58,lon:7.75,spd:60,acc:5,brg:90,ts:Date.now()};");
 run("media={pkg:'com.google.android.apps.youtube.music',app:'YouTube Music',title:'Umrumdusi',artist:'X',playing:true,pos:0,dur:1,art:'data:image/png;base64,AAAA'};tab='home';render();paint();");
 const eq=run("[...document.querySelectorAll('#screen .eq758')].length");assert(eq>=1,'égaliseur posé');
 assert(run("[...document.querySelectorAll('#screen .eq758')].every(e=>e.parentElement.lastElementChild===e)"),'égaliseur en dernier, par-dessus (pas dans le texte)');
 assert(run("!!document.querySelector('#screen .eq758.on758')"),'égaliseur animé pendant la lecture');
 assert(run("!!document.getElementById('cover758')")&&run("getComputedStyle(document.getElementById('cover758')).pointerEvents")==='none','pochette en fond, sans capter les appuis');
 stop();run("Music758.concert(media)");assert(!run("!!document.getElementById('concert758')"),'pas de concert tout de suite');
 t.advance(31000);stop();run("Music758.concert(media)");assert(run("!!document.getElementById('concert758')"),'concert après 30 s à l’arrêt');
 run("act('mu758:off')");assert(!run("!!document.getElementById('concert758')"),'un appui le ferme');
 t.advance(11*60000);stop();run("Music758.concert(media)");t.advance(31000);stop();run("Music758.concert(media)");assert(run("!!document.getElementById('concert758')"),'revient plus tard');
 go();run("Music758.concert(media)");assert(!run("!!document.getElementById('concert758')"),'disparaît en roulant');
 // Logo de radio
 w.getJSON=async()=>[{name:'France Bleu Alsace',favicon:'https://exemple.fr/logo.png'}];
 run("media={pkg:'com.qf.radio',app:'Radio',title:'France Bleu Alsace',artist:'',playing:true,pos:0,dur:0,art:''};");await run("Music758.radioLogo('France Bleu Alsace')");run("paint()");
 assert.equal(run("(document.querySelector('#screen [data-img=\"mArt\"]')||{}).src||''"),'https://exemple.fr/logo.png','logo de la radio');
 run("Try750.set('eq758','off');paint();");assert.equal(run("document.querySelectorAll('#screen .eq758').length"),0,'égaliseur désactivable');
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('OK musique : égaliseur par-dessus, pochette en fond, concert 30 s / appui / roulant, logo radio, désactivable');
 console.log('Tests 7.58 réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
