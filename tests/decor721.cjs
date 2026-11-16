const {make}=require('./regression.cjs');
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),crypto=require('crypto');
let count=0;function ok(name,test){assert(test,name);count++;console.log('OK '+name);}
const t=make({canvas:true}),r=t.run;
const ids=[4,...Array.from({length:38},(_,i)=>i+13)];
ok('39 options correspondent exactement à la sélection',JSON.stringify(r('Decor721.defs.map(d=>d[0])'))===JSON.stringify(ids));
ok('aucune option activée sans choix utilisateur',r('Decor721.enabled()')===false);
for(const id of ids){r(`act('decor721:toggle:${id}')`);ok('D'+id+' activable et persisté',r(`Decor721.on(${id})&&store.get('decor721_D${id}')===true`));r(`act('decor721:toggle:${id}')`);ok('D'+id+' désactivable',!r(`Decor721.on(${id})`));}
const nav=r('SETCATS.find(c=>c[0]==="Navigation")[1]');
ok('cinq rubriques de décor',nav.filter(x=>x[0].startsWith('Décor ·')).length===5);
for(let g=0;g<5;g++){const html=r(`Decor721.settings(palette(),${g})`);ok('options présentes rubrique '+g,ids.filter(id=>r(`Decor721.defs.find(d=>d[0]===${id})[1]`)===g).every(id=>html.includes('decor721:toggle:'+id)));}
r("act('decor721:toggle:23');act('decor721:density:1.5')");ok('densité élevée sauvegardée',r('Decor721.density()')===1.5);
r("act('decor721:density:99')");ok('densité invalide ignorée',r('Decor721.density()')===1.5);
r("act('decor721:toggle:30');act('decor721:season:automne')");ok('saison manuelle',r('Decor721.season()')==='automne');
r("act('decor721:season:inconnu')");ok('saison invalide ignorée',r('Decor721.season()')==='automne');
r("store.set('decor721Quality','normal');act('decor721:preview:riche')");ok('aperçu ne modifie pas niveau sauvegardé',r("store.get('decor721Quality')")==='normal');
ok('aperçu contient la simulation et son canvas',t.w.document.querySelector('[data-decor721-preview]')!==null);
r("act('decor721:close')");ok('fermeture conserve ancien niveau',r("store.get('decor721Quality')")==='normal');
r("act('decor721:preview:calme');act('decor721:apply')");ok('application explicite du niveau',r('Decor721.quality()')==='calme');
r("loc.spd=40;act('decor721:toggle:4')");ok('modifications bloquées en roulant',!r('Decor721.on(4)'));r('loc.spd=0;');
r("tab='settings';setCat=SETCATS.findIndex(c=>c[0]==='Navigation');setSub=SETCATS[setCat][1].findIndex(c=>c[0]==='Décor · Paysages');Settings720.query='';Settings720.filter='';render();");
t.w.document.querySelector('[data-settings-scroll="body"]').scrollTop=350;
r("act('decor721:toggle:21')");ok('défilement conservé après nouveau réglage',t.w.document.querySelector('[data-settings-scroll="body"]').scrollTop===350);
r("Settings720.query='balises';Settings720.index=null;");ok('recherche trouve les nouveaux réglages',r('Settings720.matches(palette()).some(s=>s.name==="Décor · Route")'));r("Settings720.query='';");
// Protection de la voiture : balayage de toute la profondeur et de trois formats.
for(const [W,H,rx,ty] of [[480,400,.78,.51],[1280,470,.72,.50],[480,640,.86,.55]])for(let z=1.06;z<26;z+=.05){const p=r(`RoadDecor721.panelGeometry(${z},${W},${H},{right:${W*rx},top:${H*ty}},()=>true)`);assert(p.bottom<=H*ty||p.left>W*rx);}
ok('panneau protégé sur tous les passages et formats',true);
for(let id=0;id<150;id++){const a=r(`RoadDecor721.objectPlan(${id},1,'ville',()=>true)`),b=r(`RoadDecor721.objectPlan(${id},1,'ville',()=>true)`);assert.deepEqual(a,b);}
ok('identités des bâtiments stables, pas de suppression dynamique',true);
// Vérifier tous les rendus, pas seulement l'existence des boutons.
r("tab='home';loc.spd=0;Decor721.defs.forEach(d=>store.set('decor721_D'+d[0],true));render();window.testCv721=document.querySelector('canvas[data-road]');");
const cv=t.w.document.querySelector('canvas[data-road]');Object.defineProperty(cv,'clientWidth',{value:640,configurable:true});Object.defineProperty(cv,'clientHeight',{value:430,configurable:true});
const outputs=process.env.QA721; if(outputs)fs.mkdirSync(outputs,{recursive:true});
for(const scene of ['ville','village','campagne','foret','autoroute'])for(const wx of ['soleil','pluie','neige','brouillard'])for(const hour of [6,14,19,23]){
 r(`Decor721.preview='normal';Decor721.previewScene='${scene}';Decor721.previewWx='${wx}';Decor721.previewHour=${hour};testCv721.parentNode.setAttribute('data-decor721-preview','');RoadDecor721.draw(testCv721,12,800,60);`);
 ok('rendu '+scene+'/'+wx+'/'+hour+' h',t.errors.length===0);
 if(outputs&&wx==='soleil'&&hour===19){const canvas=t.canvasMap.get(cv).canvas;fs.writeFileSync(path.join(outputs,scene+'.png'),canvas.toBuffer('image/png'));}
 t.drawings.length=0;
}
r('Decor721.preview=null;testCv721.parentNode.removeAttribute("data-decor721-preview");');
for(const id of ids){r(`Decor721.defs.forEach(d=>store.set('decor721_D'+d[0],false));store.set('decor721_D${id}',true);RoadDecor721.draw(testCv721,12,800,60);`);ok('rendu isolé D'+id,t.errors.length===0);t.drawings.length=0;}
// N35 : ne jamais afficher une progression inventée, ni télécharger un lien non vérifié.
ok('empreinte absente bloque avant téléchargement',!r("Files721.start({version:'8.0',apk:'https://github.com/Roudousa-67/accueil2008/releases/download/v8.0/Accueil2008GT_v8.0.apk'})"));
const native=[];t.w.AppFiles721={status:()=>JSON.stringify({phase:'downloading',percent:37,bytes:3700,total:10000}),download:(...args)=>(native.push(['download',...args]),JSON.stringify({phase:'downloading',percent:0})),cancel:()=>(native.push(['cancel']),'{"phase":"cancelled"}'),install:()=>(native.push(['install']),'{"phase":"ready"}'),storage:()=>'{"cache":1048576,"thumbnails":0,"downloads":2097152,"protectedDownload":true}',clean:key=>(native.push(['clean',key]),'{"freed":1048576}')};
r("Files721.poll()");ok('progression réelle du pont Android',r('Files721.state.percent')===37);
ok('téléchargement valide transmis une fois',r("Files721.start({version:'8.0',apk:'https://github.com/Roudousa-67/accueil2008/releases/download/v8.0/Accueil2008GT_v8.0.apk',sha256:'a'.repeat(64)})")&&native.filter(x=>x[0]==='download').length===1);
r("act('files721:choose:cache')");ok('aperçu nettoyage sans supprimer',r('Files721.confirm')==='cache'&&!native.some(x=>x[0]==='clean'));
r("act('files721:clean:downloads')");ok('autre catégorie ne peut pas être nettoyée sans confirmation',!native.some(x=>x[0]==='clean'));
r("act('files721:clean:cache')");ok('confirmation ne nettoie que la catégorie choisie',JSON.stringify(native.filter(x=>x[0]==='clean'))===JSON.stringify([['clean','cache']]));
r("act('files721:cancel')");ok('annulation transmise au gestionnaire Android',r('Files721.state.phase')==='cancelled');
ok('tests sans erreur JS',t.errors.length===0);
t.dom.window.close();console.log('\n'+count+' vérifications 7.21 réussies.');
