'use strict';
// 7.60 (suite) : page Apparence par étapes, thèmes 1/2/3, barre de gauche, aperçus dans les ⓘ, photos des conducteurs, nouveaux fonds.
const assert=require('node:assert/strict');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js','lib/qrcode-generator.js','v738.js','transfer738.js','stations738.js','highway738.js','v740.js','diag738.js','display743.js','v750.js','secours753.js','uninstall753.js','bar754.js','wall755.js','walls760.js','ticket756.js','ticket757.js','music758.js','stats759.js','tour760.js','photo760.js','settings738.js','ranger758.js','apparence760.js','info760.js','keep758.js'];
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 run("curSpeed=()=>({v:0,src:'test'});store.set('onboard760',1);");
 // Nouveaux fonds
 const n=run('Wall760.ids.length');assert(n>=24,'fonds en plus : '+n);
 assert(run("Wall760.ids.every(id=>WALLS.some(w=>w.id===id))"),'fonds dans la liste');
 run("(()=>{const c=document.createElement('canvas');c.width=96;c.height=54;const g=c.getContext('2d');Wall760.ids.forEach(id=>Wall760.paint(id,g,96,54,3.1))})()");
 assert.equal(t.errors.length,0,'chaque fond se dessine sans erreur\n'+t.errors.join('\n'));
 // Une seule page Apparence
 assert(run("!SETCATS.some(c=>c[1].some(s=>['Thèmes','Fond d\\'écran','Police','Icônes'].includes(s[0])))"),'anciennes pages retirées');
 run("openSet('Accueil et affichage','Police');render();");
 assert.equal(run('SETCATS[setCat][1][setSub][0]'),'Apparence','ancienne adresse → Apparence');
 assert.equal(run('Apparence760.S.step'),3,'… directement à l’étape Police');
 run("act('ap760:step:1');render();");
 assert(run("!!document.querySelector('#screen [data-act=\"wall:x7montagnes\"]')||!!document.querySelector('#screen [data-act^=\"ap760:cat:\"]')"),'étape Fond avec les catégories');
 run("act('ap760:cat:Paysages animés');render();");
 assert(run("!!document.querySelector('#screen [data-act=\"wall:x7montagnes\"]')"),'paysages animés proposés');
 run("act('wall:x7montagnes');render();");assert.equal(run("pv('wall','')"),'x7montagnes','fond choisi');
 for(const s of [2,3,4,5]){run("act('ap760:next');render();");assert.equal(run('Apparence760.S.step'),s,'étape '+s);}
 run("act('ap760:prev');render();");assert.equal(run('Apparence760.S.step'),4,'retour');
 // Barre de gauche
 for(const k of ['rond','carre','neon','mini','vraies']){run(`act('ap760:dock:${k}');tab='home';render();`);assert.equal(run("store.get('dockStyle760','')"),k);}
 run("act('ap760:dock:');tab='settings';render();");
 // Thème 1
 run("openSet('Accueil et affichage','Apparence');Apparence760.S.step=5;render();act('ap760:save:0');render();");
 const sl=run('JSON.stringify(Apparence760.slots()[0]||null)');assert(sl&&sl.includes('x7montagnes'),'Thème 1 garde le fond');
 assert(run("document.querySelector('#screen').textContent").includes('Thème 1'),'cases Thème 1/2/3');
 // Aperçus ⓘ
 run("openSet('Widgets','Pochette et mode concert');render();");
 const before=run("String(store.get('coverBg758',true))");
 const k=run("(()=>{const b=document.querySelectorAll('#screen [data-act^=\"help723:\"]');for(const e of b){const a=e.dataset.act;if(a!=='help723:close'&&a!=='help723:section'){act(a);return a}}return ''})()");
 assert(k,'un ⓘ');
 t.timers.filter(x=>x.ms===30).forEach(x=>x.fn());
 assert(run('!!Help723.current&&!!Help723.current.previews'),'aperçus préparés');
 assert.equal(run("String(store.get('coverBg758',true))"),before,'réglage remis comme avant');
 run("act('help723:close')");
 // Photo
 run("Photo760.set(profIdx(),'data:image/png;base64,iVBORw0KGgo=');tab='home';render();");
 assert(run("[...document.querySelectorAll('#screen [data-k=\"avatar\"]')].some(e=>e.style.backgroundImage.includes('data:image'))"),'photo en haut de l’accueil');
 run("openSet('Système','Profils');render();");
 assert(run("document.querySelector('#screen').textContent").includes('Photos des conducteurs'),'section Photos dans Profils');
 run("act('ph760:del:'+profIdx())");assert.equal(run('Photo760.get(profIdx())'),'','photo retirée');
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('OK Apparence par étapes (5 étapes, thème 1), barre de gauche, aperçus ⓘ, photos, '+n+' nouveaux fonds');
 console.log('Tests 7.60 (suite) réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
