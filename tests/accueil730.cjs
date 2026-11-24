'use strict';
const assert=require('node:assert/strict'),{make}=require('./regression.cjs');
const extras=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js'];
const t=make({canvas:true,extraScripts:extras}),r=t.run,w=t.w;let checks=0;
function check(name,condition){assert.equal(!!condition,true,name);console.log('OK '+name);checks++;}
check('chargement complet',!t.errors.length);
check('version',r('APP_VERSION')==='7.43');
check('décor par défaut disponible',r('Driver728.enabled()')===false);
check('catégorie Widgets',r("SETCATS.some(c=>c[0]==='Widgets'&&c[1].length===4)"));
r("openSet('Widgets','Vue voiture et route')");
check('réglages voiture avec aperçu',!!w.document.querySelector('.liveRoad730 canvas'));
let slider=w.document.querySelector('[data-pref730="carScale730"]');slider.value='58';slider.dispatchEvent(new w.Event('input',{bubbles:true}));
check('taille persistée par le curseur',r("store.get('carScale730')")===58);
r("App730.save('limit730',false);App730.apply()");check('limitation masquée',w.document.querySelector('.limit728').hidden);
r("App730.save('weather730','hidden');App730.apply()");check('météo masquée',w.document.querySelector('.roadHud728').dataset.weather730==='hidden');
r("App730.save('mediaLayout730','detail');openSet('Widgets','Multimédia')");check('aperçu multimédia détaillé',!!w.document.querySelector('.detail730 .times730'));
r("App730.save('mediaFont730','Inter');App730.save('mediaBackground730','#294d89');render()");check('police et fond multimédia',w.document.querySelector('.media730').style.background.includes('41, 77, 137'));
r("appsCache=[{p:'music.player',l:'Musique'},{p:'radio.player',l:'Radio'},{p:'video.player',l:'Vidéo'},{p:'com.waze',l:'Waze'}];openDrawer(null)");
check('toutes les applications réunies',w.document.querySelectorAll('#appGrid .appButton730').length===4);
const search=w.document.getElementById('appSearch730');search.value='video';search.dispatchEvent(new w.Event('input',{bubbles:true}));check('recherche sans accents',w.document.querySelectorAll('#appGrid .appButton730').length===1);
r("act('app:video.player',true)");check('appui long ajoute à la barre',r("App730.dockItems().some(d=>d.id==='pkg.video.player')"));
r("closeOverlays();openSet('Widgets','Barre des raccourcis');act('dock730:edit:music')");check('menu modification raccourci',!!w.document.querySelector('[data-dockedit730]'));
r("act('dock730:move:-1')");check('ordre modifié',r("App730.dockItems()[1].id==='music'"));
r("act('dock730:close');act('dock730:reset')");check('réinitialisation avec Accueil et Applis',r("App730.dockItems()[0].id==='home'&&App730.dockItems().at(-1).id==='apps'"));
// Reproduce native GPS visibility when settings and the application grid open.
t.setembed(true);r("tab='home';render()");
const box=w.document.querySelector('.gpsbox');box.getBoundingClientRect=()=>({left:640,top:100,right:1240,bottom:500,width:600,height:400});w.innerWidth=1280;w.innerHeight=720;
r('Frame710.openEmbedded()');check('GPS ouvert dans le cadre',t.nativeCalls.some(c=>c[0]==='visible'&&c[1]===true));
r("openSet('Widgets','Multimédia')");check('GPS masqué immédiatement dans réglages',t.nativeCalls.at(-1)[0]==='visible'&&t.nativeCalls.at(-1)[1]===false);
r("tab='home';render()");const box2=w.document.querySelector('.gpsbox');box2.getBoundingClientRect=box.getBoundingClientRect;
r("openDrawer(null);Frame710.sync()");check('GPS masqué dans la grille d’applications',r('Frame710.rect()')===null&&t.nativeCalls.at(-1)[1]===false);
r("closeOverlays();tab='home';store.set('roadScene','ville');render();weather={t:12,c:1,hours:[],days:[],day:1};loc={lat:48.58,lon:7.74,acc:8,ts:Date.now(),spd:47};Road723.at=Date.now();Road723.pos={...loc};Road723.match={tags:{highway:'residential',maxspeed:'50'},geometry:[{lat:48.579,lon:7.74},{lat:48.581,lon:7.74}]};");
for(const scene of ['ville','village','campagne','foret','autoroute']){
 r(`window.roadScene=()=> '${scene}'`);const cv=w.document.querySelector('canvas[data-road]');Object.defineProperty(cv,'clientWidth',{value:620,configurable:true});Object.defineProperty(cv,'clientHeight',{value:620,configurable:true});
 for(const d of [0,250,1000,15000]){w.RoadDecor721.draw(cv,22,d,47);t.drawings.length=0;}
 check('rendu '+scene+' et trajet prolongé',!t.errors.length);
}
check('pas d’erreur JavaScript',!t.errors.length);t.dom.window.close();console.log(checks+' contrôles Accueil 7.30 réussis.');
