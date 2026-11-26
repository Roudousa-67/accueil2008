'use strict';
// 7.54 : barre d'applis du bas : taille « Barre » possible, remise à sa place, bouton ✎.
const assert=require('node:assert/strict');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js','lib/qrcode-generator.js','v738.js','transfer738.js','stations738.js','highway738.js','v740.js','diag738.js','display743.js','v750.js','secours753.js','uninstall753.js','bar754.js','settings738.js'];
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 assert.deepEqual(JSON.parse(run("JSON.stringify(fSizes('apps')[0])")),['Barre',7,1],'taille « Barre » proposée');
 assert.deepEqual(JSON.parse(run('JSON.stringify(FMIN.apps)')),[3,1],'1 case de haut autorisée');
 // Barre disparue → remise à sa place une fois.
 run("const c=fClone();c.pages[0]=c.pages[0].filter(x=>!(x.b||[]).includes('apps'));fSave(c);store.set('bar754_'+profIdx(),false);");
 assert.equal(run('Bar754.restore()'),true,'barre remise');
 const bar=JSON.parse(run("JSON.stringify(fCfg().pages[0].find(x=>(x.b||[]).includes('apps')))"));
 assert.deepEqual([bar.x,bar.y,bar.w,bar.h],[5,5,7,1],'en bas à droite, en barre');
 assert.equal(run('Bar754.restore()'),false,'une seule fois');
 // Grille puis retour à la barre depuis « Modifier l'accueil ».
 run(`fEnterEdit('${bar.id}');act('h2:sz:4:2');act('h2:sz:7:1');act('h2:done');tab='home';render();`);
 const back=JSON.parse(run("JSON.stringify(fCfg().pages[0].find(x=>(x.b||[]).includes('apps')))"));assert.equal(back.h,1,'retour à la barre possible');
 assert(run("!!document.querySelector('#screen [data-arapps]')"),'affichée en barre');
 assert(run("!!document.querySelector('#screen [data-act=\"bar754:edit\"]')"),'bouton ✎');
 run("act('bar754:edit')");assert.equal(run('arEdit'),true,'✎ ouvre la modification');
 assert(run("document.querySelectorAll('#screen [data-act^=\"arapp:del:\"]').length")>=1,'croix pour retirer');
 run("act('arapp:done')");
 run("Try750.set('bar754','off');tab='home';render();");assert(!run("!!document.querySelector('#screen [data-act=\"bar754:edit\"]')"),'désactivable');
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('OK barre d’applis : taille Barre, remise à sa place, retour depuis Grille, bouton ✎, désactivable');
 console.log('Tests 7.54 réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
