const {make}=require('./regression.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
let count=0;const ok=(name,a,b=true)=>{assert.deepEqual(a,b,name);count++;console.log('OK '+name);};
(async()=>{
 const t=make({canvas:true}),r=t.run,w=t.w;
 ok('aucune erreur au chargement',t.errors,[]);
 // Cache : valeurs immédiatement visibles, une seule écriture finale.
 r('store.flush()');
 let reads=0,writes=0;const proto=w.Storage.prototype,get=proto.getItem,set=proto.setItem;
 proto.getItem=function(k){reads++;return get.call(this,k);};
 proto.setItem=function(k,v){writes++;return set.call(this,k,v);};
 w.localStorage.setItem('a08_perfTest','{"n":1}');writes=0;
 r("store.invalidate();store.get('perfTest');store.get('perfTest');store.get('perfTest')");
 ok('une seule lecture persistante pour trois accès',reads,1);
 r("store.set('perfTest',{n:2});store.set('perfTest',{n:3})");
 ok('écritures différées',writes,0);ok('valeur mémoire immédiate',r("store.get('perfTest').n"),3);
 r('store.flush()');ok('écritures regroupées par clé',writes,1);
 ok('format a08 conservé',JSON.parse(w.localStorage.getItem('a08_perfTest')),{n:3});
 r("store.set('perfRestore',1);restoreFrom({data:{a08_perfRestore:'2'}})");
 ok('restauration invalide le cache des préférences',r("store.get('perfRestore')"),2);
 r('store.flush()');ok('aucune écriture différée ne remplace la restauration',w.localStorage.getItem('a08_perfRestore'),'2');
 r("store.set('perfSnapshot','dernier choix')");
 ok('sauvegarde inclut les choix non encore écrits',r("JSON.parse(snapshot().data.a08_perfSnapshot)"),'dernier choix');
 r("store.set('perfTest',{n:4});onPauseHome()");
 ok('pause force la persistance',JSON.parse(w.localStorage.getItem('a08_perfTest')),{n:4});
 ok('aucune minuterie affichage active en pause',r('Perf725.stats().displayTimers'),0);
 ok('tâches non visuelles conservées',t.activeIntervals.size>0);
 r('onResumeHome()');const renders=r('Perf725.stats().renders');
 r('onPauseHome();onResumeHome();onResumeHome()');
 ok('un seul rendu par reprise effective',r('Perf725.stats().renders'),renders+1);
 // Route : une seule image sèche au repos ; aucun nouveau RAF ensuite.
 r("onPauseHome();Perf725.suspend(false);tab='home';render();curSpeed=()=>({v:0});roadKind=()=>({wx:'soleil',night:false});carYaw=0;");
 for(const cv of w.document.querySelectorAll('canvas[data-road]')){Object.defineProperty(cv,'clientWidth',{value:800,configurable:true});Object.defineProperty(cv,'clientHeight',{value:480,configurable:true});}
 r('RoadLoop725.refresh()');let started=r('Perf725.stats().draws');
 t.rafStep(1000);t.rafStep(1100);t.rafStep(1200);
 ok('une image au repos sans météo animée',r('Perf725.stats().draws'),started+1);
 ok('route au repos non programmée',r('RoadLoop725.running()'),false);
 r("window.fade725Clock=0;RoadFX718.now=()=>fade725Clock;window.roadScene=()=> 'ville';RoadFX718.frames.clear();RoadLoop725.invalidate()");t.rafStep(1233);
 r("window.roadScene=()=> 'village';RoadLoop725.invalidate()");t.rafStep(1266);
 ok('fondu à l’arrêt termine son animation',r('RoadLoop725.running()'));
 r('fade725Clock=3000');t.rafStep(1299);
 ok('fondu terminé sans état résiduel',r('Array.from(RoadFX718.frames.values()).some(s=>!!s.fade)'),false);
 ok('route statique suspendue après le fondu',r('RoadLoop725.running()'),false);
 r('curSpeed=()=>({v:60});RoadLoop725.invalidate()');t.rafStep(1300);t.rafStep(1400);
 ok('animation reprend quand vitesse change',r('RoadLoop725.running()'));
 // Cache des canvas : ne pas refaire le sélecteur de route dans une image.
 const query=w.document.querySelectorAll.bind(w.document);let roadQueries=0;
 w.document.querySelectorAll=s=>{if(s==='#screen canvas[data-road]')roadQueries++;return query(s);};
 t.rafStep(1500);t.rafStep(1600);ok('pas de recherche des canvas à chaque image',roadQueries,0);
 w.document.querySelectorAll=query;
 r("tab='settings';render()");ok('route suspendue hors Accueil',r('RoadLoop725.running()'),false);
 r("tab='home';render();onPauseHome()");ok('route suspendue en arrière-plan',r('RoadLoop725.running()'),false);
 const pausedDraws=r('Perf725.stats().draws');t.rafStep(1700);ok('aucun dessin après annulation',r('Perf725.stats().draws'),pausedDraws);
 r("onResumeHome();tab='home';curSpeed=()=>({v:0});roadKind=()=>({wx:'pluie',night:false});RoadLoop725.refresh()");t.rafStep(1800);
 ok('météo animée reste active à l’arrêt',r('RoadLoop725.running()'));
 Object.defineProperty(w.document,'hidden',{value:true,configurable:true});w.document.dispatchEvent(new w.Event('visibilitychange'));
 ok('visibilitychange suspend le rendu',r('Perf725.paused()'));ok('visibilitychange annule la route',r('RoadLoop725.running()'),false);
 Object.defineProperty(w.document,'hidden',{value:false,configurable:true});w.document.dispatchEvent(new w.Event('visibilitychange'));
 ok('visibilitychange permet la reprise',r('Perf725.paused()'),false);
 // Un seul propriétaire périodique GPS.
 const home=fs.readFileSync(path.join(__dirname,'../sources_assets/home5.js'),'utf8'),gps=fs.readFileSync(path.join(__dirname,'../sources_assets/v710.js'),'utf8');
 ok('ancienne boucle GPS 300 ms retirée',home.includes('setInterval(sync, 300)'),false);
 ok('ancienne boucle Frame710 500 ms retirée',gps.includes('setInterval(Frame710.sync, 500)'),false);
 // Les dépendances ne sont plus chargées avant le besoin.
 const html=fs.readFileSync(path.join(__dirname,'../sources_assets/index.html'),'utf8');
 for(const file of ['three.min.js','GLTFLoader.js','RoomEnvironment.js','maplibre-gl.js','leaflet.js'])ok('chargement différé : '+file,html.includes('<script src="lib/'+file+'">'),false);
 const beforeScripts=w.document.querySelectorAll('script[src="lib/three.min.js"]').length;
 const p1=r('Lazy725.car()'),p2=r('Lazy725.car()');await Promise.resolve();
 ok('dépendance 3D demandée une seule fois',w.document.querySelectorAll('script[src="lib/three.min.js"]').length,beforeScripts+1);
 // Garde-fou : ne touche pas aux préférences, et peut être désactivé.
 r("store.set('decor721_D50',true);store.set('decor721Quality','riche');Perf725.resetGuard();");
 for(let i=0;i<70;i++)r('Perf725.draw(25,'+(5000+i*50)+')');
 ok('niveau réduit sous charge soutenue',r('Decor721.quality()'),'normal');
 ok('préférence riche conservée',r("store.get('decor721Quality')"),'riche');
 r("store.set('perf725Guard',false)");ok('désactivation rétablit niveau demandé',r('Decor721.quality()'),'riche');
 ok('mémoire indisponible explicitement signalée',r('Perf725.stats().jsBytes'),null);
 r("tab='settings';setCat=SETCATS.findIndex(c=>c[0]==='Système');setSub=SETCATS[setCat][1].findIndex(s=>s[0]==='Diagnostic · Performances');render()");
 ok('diagnostic présent',!!w.document.querySelector('[data-perf725="fps"]'));
 const beforeRender=r('Perf725.stats().renders');r('requestRender725();requestRender725();requestRender725()');t.rafStep(10000);
 ok('demandes regroupées en un rendu',r('Perf725.stats().renders'),beforeRender+1);
 ok('absence erreurs dans scénarios',t.errors,[]);
 t.dom.window.close();
 console.log(count+' contrôles performances 7.25 réussis.');
})().catch(e=>{console.error(e);process.exitCode=1;});
