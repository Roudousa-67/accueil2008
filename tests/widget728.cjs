'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {make}=require('./regression.cjs');
const t=make({canvas:true,extraScripts:['decors726.js','driver728.js','near728.js','v728.js']}),r=t.run,w=t.w,D=w.Driver728,N=w.RoadNear728;
let count=0;function check(name,actual){assert(actual,name);count++;console.log('OK '+name);}
const cv=()=>w.document.querySelector('canvas[data-road]');
function dims(h=400){Object.defineProperty(cv(),'clientWidth',{value:480,configurable:true});Object.defineProperty(cv(),'clientHeight',{value:h,configurable:true});}
function seed(){r("loc={lat:48.58,lon:7.74,acc:8,ts:Date.now(),spd:47,brg:0};plPos={lat:48.58,lon:7.74};plAt=Date.now();plList=[{n:'Proche',k:'village',lat:48.59,lon:7.74},{n:'Lointain',k:'town',lat:48.7,lon:7.74},{n:'Proche',k:'village',lat:48.595,lon:7.74}];Road723.at=Date.now();Road723.cache=[];Road723.match={id:99,tags:{highway:'residential'},geometry:[{lat:48.579,lon:7.74},{lat:48.581,lon:7.74},{lat:48.583,lon:7.741}]};Road723.cache=[Road723.match];Road723.pos={...loc};");N.reset();}
function drive(m){t.advance(5000);r(`loc.lat+=${m/111195};loc.ts=Date.now();`);return N.update();}
check('version stable 7.43',r('APP_VERSION')==='7.43');
check('aucun script bêta dans la version normale',!fs.readFileSync(path.join(__dirname,'../sources_assets/index.html'),'utf8').includes('beta727.js'));
check('vue conducteur activée et désactivable',D.enabled());D.setEnabled(false);check('interrupteur désactive la vue GPS',D.sample(0).fallback);D.setEnabled(true);
seed();const initial=r('JSON.stringify(loc)');dims();w.RoadDecor721.draw(cv(),0,0,47);check('courbe réelle disponible dans la vue',D.sample(1).path&&!D.sample(1).band);check('la vue ne modifie ni GPS ni vitesse',r('JSON.stringify(loc)')===initial);
for(const h of [250,400,650]){dims(h);w.RoadDecor721.draw(cv(),1,0,47);const width=parseFloat(cv().parentNode.querySelector('[data-car360]').style.width);check('grande voiture contenue, hauteur '+h,width>=480*.28&&width<=480*.62+.01&&width*300/503<=h*.6+.01);}
let box=cv().parentNode;const limit=box.querySelector('.limit728 [data-show="limit"]');
check('limitation dans la même ligne que la vitesse',limit.closest('.roadSpeedRow728').contains(box.querySelector('[data-k="speed"]')));
check('météo en haut à droite avec ville et min/max',!!box.querySelector('.roadWeather728 [data-k="wCity"]')&&!!box.querySelector('.roadWeather728 [data-k="wTemp"]')&&!!box.querySelector('.roadWeather728 [data-k="wMinMax"]'));
check('bande décorative supprimée du moteur',!t.drawings.some(x=>/^Décor illustratif/.test(x.text||'')));
check('aucune bannière bêta sur l’accueil',!w.document.querySelector('[data-beta727-bar]'));
r('loc.ts-=20000');check('GPS ancien retourne au décor classique',D.sample(2).fallback);seed();r('loc.acc=90');check('GPS imprécis retourne au décor classique',D.sample(3).fallback);
seed();r('loc.lon+=.05');check('position hors de la route refusée',D.sample(4).fallback);
const gpx='<gpx><trk><trkseg><trkpt lat="48.58" lon="7.74"/><trkpt lat="48.59" lon="7.74"/></trkseg></trk></gpx>';
seed();D.loadGPX(gpx);check('bande violette uniquement pour le GPX local',D.sample(5).kind==='gpx'&&D.sample(5).band);D.clearGPX();check('suppression GPX retourne à la route GPS',D.mode()==='gps'&&r("store.get('driver728GPX')")===null);
for(const bad of ['<gpx/>','<!DOCTYPE x [<!ENTITY x "x">]><gpx/>','<gpx><rtept lat="" lon="0"/><rtept lat="1" lon="0"/></gpx>','<gpx><trk><trkseg><trkpt lat="1" lon="1"/></trkseg><trkseg><trkpt lat="20" lon="20"/></trkseg></trk></gpx>']){assert.throws(()=>D.parseGPX(bad));count++;}
seed();r("Road723.match={id:1,tags:{highway:'residential'},geometry:[{lat:48.579,lon:7.74},{lat:48.581,lon:7.74}]};Road723.cache=[Road723.match,{id:2,tags:{highway:'residential'},geometry:[{lat:48.581,lon:7.74},{lat:48.583,lon:7.741}]}]");
check('prolonge une route connectée sans bifurcation',r('Driver728.connectedGeometry(Road723.match,0).length')===3);
r("Road723.cache.push({id:3,tags:{highway:'residential'},geometry:[{lat:48.581,lon:7.74},{lat:48.581,lon:7.742}]})");check('aucune sortie inventée à une bifurcation',r('Driver728.connectedGeometry(Road723.match,0).length')===2);
r("Road723.match={id:4,tags:{highway:'residential',junction:'roundabout'},geometry:[{lat:48.58,lon:7.74},{lat:48.5803,lon:7.7403},{lat:48.5806,lon:7.74},{lat:48.5803,lon:7.7397},{lat:48.58,lon:7.74}]}");check('rond-point fermé reste disponible au passage du point de fermeture',r('Driver728.connectedGeometry(Road723.match,0).length')===9);
seed();check('panneaux espacés de 1 km par défaut',N.period()===1);const first=N.update();check('deux localités réelles sans doublon',first.rows.length===2&&first.rows[0].name==='Proche');
dims();N.paint(cv());box=cv().parentNode;const top=box.querySelector('[data-near728]').style.top;drive(50);N.paint(cv());check('panneau avance sur son point fixe',parseFloat(box.querySelector('[data-near728]').style.top)>parseFloat(top));for(let i=0;i<8;i++)drive(100);check('pas de nouveau panneau avant 1 km',N.state().active===null&&N.state().next===1000);drive(200);check('nouveau panneau après 1 km',N.state().active&&N.state().active!==first);
const km=N.state().metres;for(let i=0;i<8;i++){t.advance(1000);N.update();}check('aucun kilomètre fabriqué à l’arrêt',N.state().metres===km);
N.setPeriod(.5);seed();N.update();drive(300);drive(220);check('intervalle de 500 m appliqué',N.state().active&&N.state().active.at>500);
N.setPeriod(0);dims();N.paint(cv());check('panneaux désactivables',!cv().parentNode.querySelector('[data-near728]')||cv().parentNode.querySelector('[data-near728]').hidden);N.setPeriod(1);N.setPeriod(-1);check('intervalle invalide refusé',N.period()===1);
seed();N.update();r('loc.lat+=1;loc.ts+=5000');N.update();check('saut GPS ne fabrique pas de panneau',N.state().metres===0);
seed();r('plAt-=1000000');check('localités anciennes masquées',N.closest().length===0);seed();r('plPos.lat+=1');check('localités éloignées masquées',N.closest().length===0);
seed();r("plList=[{n:'<img src=x onerror=alert(1)>',k:'village',lat:48.59,lon:7.74}]");dims();N.paint(cv());check('les noms reçus ne créent pas de HTML',cv().parentNode.querySelector('[data-near728]').textContent.includes('<img')&&!cv().parentNode.querySelector('[data-near728] img'));
const nav=r("SETCATS.find(c=>c[0]==='Navigation')[1].map(c=>c[0])");check('anciennes options décor sans effet retirées',!nav.some(n=>n.startsWith('Décor ·')||n.includes('Ancien cadre')||n.includes('Bêta')));check('GPS, vue conducteur et panneaux rangés ensemble',nav.includes('Cadre GPS et alignement')&&nav.includes('Vue conducteur')&&nav.includes('Panneaux et localités'));
check('catégorie GPS en double retirée',r("SETCATS.filter(c=>c[0]==='Appli GPS').length")===0);
r("store.set('decor721_D49',true);store.set('roadFade718',0)");check('réglage transition ne dépend plus d’une option masquée',r('RoadOptions718.duration()')===0);
r("Settings720.query='conducteur';Settings720.index=null");check('recherche trouve la nouvelle option',r("Settings720.matches(palette()).some(x=>x.name==='Vue conducteur')"));r("Settings720.query='';Settings720.filter='';openSet('Navigation','Décor de la route')");check('ancien lien redirige vers le réglage actif',r("SETCATS[setCat][1][setSub][0]")==='Paysages et météo');
// A different ratio on each axis used to shift the native GPS vertically.
r("tab='home';editing=false;gbMenu=false;gbLive=false;store.set('gbOffX',0);store.set('gbOffY',0);render()");const gps=w.document.querySelector('.gpsbox');gps.getBoundingClientRect=()=>({left:640,top:100,right:1240,bottom:500,width:600,height:400});w.innerWidth=1280;w.innerHeight=670;t.setvp({x:10,y:50,width:2560,height:1440});check('alignement GPS sur les deux axes physiques',JSON.stringify(r('Frame710.rect(true)'))===JSON.stringify([1298,274,2482,1116]));
// All final settings pages, not only the historical controls, must render.
let pages=0;const sizes=r('SETCATS.map(c=>c[1].length)');for(let ci=0;ci<sizes.length;ci++)for(let si=0;si<sizes[ci];si++){r(`tab='settings';setCat=${ci};setSub=${si};render();`);assert(w.document.querySelector('[data-help-section]'));pages++;}check('toutes les pages de paramètres réorganisées s’ouvrent',pages>35);
r("store.set('carLearn',{kept:true});store.set('fuelLog',[{t:1}]);store.set('driver728On',true);onPauseHome()");check('profils et données conservés',r("store.get('carLearn').kept&&store.get('fuelLog').length===1"));check('pause suspend la boucle de route',!w.RoadLoop725.running());
check('aucune erreur JavaScript',t.errors.length===0);t.dom.window.close();console.log(count+' contrôles intégration 7.28 réussis.');
