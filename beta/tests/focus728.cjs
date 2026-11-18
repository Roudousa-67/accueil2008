'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const {make}=require(process.env.BETA_FIXTURE||'../../tests/regression.cjs');
const t=make({canvas:true,assetRoot:process.env.BETA_ASSETS||path.resolve(__dirname,'../../../beta-assets'),extraScripts:['decors726.js','beta727.js','focus728.js']}),w=t.w,r=t.run,N=w.RoadNear728;
let count=0;const check=(s,v)=>{assert(v,s);count++;console.log('OK '+s);};
w.BetaRoad.setMode('classic');
const cv=()=>w.document.querySelector('canvas[data-road]');
function dims(h=400){Object.defineProperty(cv(),'clientWidth',{value:480,configurable:true});Object.defineProperty(cv(),'clientHeight',{value:h,configurable:true});}
function seed(){r("loc={lat:48.58,lon:7.74,acc:8,ts:Date.now(),spd:72,brg:0};plPos={lat:48.58,lon:7.74};plAt=Date.now();plList=[{n:'Proche',k:'village',lat:48.59,lon:7.74},{n:'Lointain',k:'town',lat:48.7,lon:7.74},{n:'Proche',k:'village',lat:48.595,lon:7.74},{n:'Incorrect',k:'suburb',lat:48.58,lon:7.74}];");N.reset();}
function drive(m){t.advance(5000);r(`loc.lat+=${m/111195};loc.ts=Date.now();`);return N.update();}
check('intervalle de 1 km par défaut',N.period()===1);
for(const h of [250,400,650]){dims(h);w.RoadDecor721.draw(cv(),0,0,0);const car=cv().parentNode.querySelector('[data-car360]'),width=parseFloat(car.style.width);check('voiture agrandie et contenue à hauteur '+h,width>480*.5&&width<=480*.64+.01&&width*300/503<=h*.60+.01);}
seed();dims();let item=N.update();check('premier panneau disponible dès le début',!!item);check('deux localités réelles triées, sans doublon',item.rows.length===2&&item.rows[0].name==='Proche'&&item.rows[1].name==='Lointain');
N.paint(cv());check('panneau visible avec la distance à vol d’oiseau',!cv().parentNode.querySelector('[data-near728]').hidden&&cv().parentNode.textContent.includes('Distances à vol d’oiseau'));
const startTop=cv().parentNode.querySelector('[data-near728]').style.top;drive(50);N.paint(cv());check('le panneau se rapproche quand la voiture avance',parseFloat(cv().parentNode.querySelector('[data-near728]').style.top)>parseFloat(startTop));
for(let i=0;i<8;i++)drive(100);check('aucune répétition avant 1 km',N.state().active===null&&N.state().next===1000);
drive(200);check('nouveau panneau après 1 km parcouru',N.state().active&&N.state().active!==item&&N.state().metres>1000);
item=N.state().active;for(let i=0;i<10;i++){t.advance(1000);N.paint(cv());}check('aucun kilomètre ajouté à l’arrêt',N.state().active===item&&N.state().metres<1051);
N.setPeriod(.5);check('réglage à 500 m conservé',N.period()===.5&&r("store.get('near728Km')")===.5);seed();N.update();drive(300);drive(220);check('intervalle de 500 m appliqué',N.state().active&&N.state().active.at>500);
N.setPeriod(0);dims();N.paint(cv());check('désactivation masque le panneau',cv().parentNode.querySelector('[data-near728]')===null||cv().parentNode.querySelector('[data-near728]').hidden);N.setPeriod(1);N.setPeriod(-3);check('valeur de réglage invalide refusée',N.period()===1);
seed();N.update();const d=N.state().metres;r('loc.lat+=1;loc.ts+=5000;');N.update();check('saut GPS ne fabrique pas un kilomètre',N.state().metres===d);
seed();N.update();r('loc.acc=100');check('GPS imprécis : panneau masqué',N.update()===null);
seed();N.update();r('loc.ts-=20000');check('GPS ancien : panneau masqué',N.update()===null);
seed();r('plAt-=1000000');check('cache de localités ancien refusé',N.closest().length===0);
seed();r('plPos.lat+=1');check('cache éloigné refusé',N.closest().length===0);
seed();r('plList=[]');check('aucun nom inventé sans données',N.update()===null);
seed();r("plList=[{n:'<img src=x onerror=alert(1)>',k:'village',lat:48.59,lon:7.74}]");dims();N.paint(cv());check('nom réseau traité comme du texte',cv().parentNode.querySelector('[data-near728]').textContent.includes('<img')&&!cv().parentNode.querySelector('[data-near728] img'));
check('paramètre présent dans Navigation',r("SETCATS.find(c=>c[0]==='Navigation')[1].some(c=>c[0]==='Voiture et panneaux proches')"));
check('aucune erreur JavaScript',t.errors.length===0);t.dom.window.close();console.log(count+' contrôles cadrage et panneaux réussis.');
