'use strict';
const assert=require('node:assert/strict');
const {make}=require('./regression.cjs');
const t=make({canvas:true,extraScripts:['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js']});
const {w,run}=t, scene=w.RoadScene731;
const p={lat:48.58,lon:7.74};
const way=(tags,id=1,lon=p.lon)=>({type:'way',id,tags,geometry:[{lat:48.575,lon},{lat:48.585,lon}]});
function ring(lat,lon,size){return [{lat:lat-size,lon:lon-size},{lat:lat-size,lon:lon+size},{lat:lat+size,lon:lon+size},{lat:lat+size,lon:lon-size},{lat:lat-size,lon:lon-size}];}
const village={type:'node',tags:{place:'village',name:'Village de test'},...p};
const built={type:'way',tags:{landuse:'residential'},geometry:ring(p.lat,p.lon,.0005)};
const forest={type:'way',tags:{natural:'wood'},geometry:ring(p.lat,p.lon,.0007)};
const main=way({highway:'secondary',ref:'D 1'});
const builtContext=scene.decode([village,built]);
assert.equal(scene.environment(p,main,builtContext),'village');
assert.equal(scene.environment({...p,lat:48.5812},main,builtContext),'campagne');
assert.equal(scene.environment(p,way({...main.tags,'zone:traffic':'FR:rural'}),builtContext),'campagne');
assert.equal(scene.environment(p,way({...main.tags,'source:maxspeed':'FR:urban'}),scene.decode([village])),'village');
assert.equal(scene.environment(p,way({highway:'trunk',maxspeed:'110'}),scene.decode([village])),'autoroute');
assert.equal(scene.environment(p,way({highway:'trunk',motorroad:'yes'}),builtContext),'autoroute');
assert.equal(scene.environment(p,way({highway:'primary','source:maxspeed':'FR:expressway'}),builtContext),'autoroute');
assert.equal(scene.environment(p,way({highway:'motorway_link'}),builtContext),'autoroute');
assert.equal(scene.environment(p,main,scene.decode([forest])),'foret');
assert.equal(scene.environment(p,main,scene.decode([built,{...village,tags:{place:'city'}}])),'ville');
const outer=ring(p.lat,p.lon,.001),inner=ring(p.lat,p.lon,.0004);
const withHole={type:'relation',tags:{natural:'wood'},members:[{type:'way',role:'outer',geometry:outer.slice(0,3)},{type:'way',role:'outer',geometry:outer.slice(2).reverse()},{type:'way',role:'inner',geometry:inner}]};
assert.equal(scene.environment(p,main,scene.decode([withHole])),'campagne');
assert.equal(scene.environment({...p,lat:p.lat+.0008},main,scene.decode([withHole])),'foret');
console.log('OK cartographie : zone bâtie, forêt avec clairière, routes ordinaires et réglementées');
(async()=>{
 t.pos();t.setels([village,built]);await scene.refresh();
 assert.equal(scene.context.areas.length,1);
 const terrainRequests=t.calls.length;await scene.refresh();assert.equal(t.calls.length,terrainRequests);
 w.matcher=[main];run('Road723.cache=matcher;Road723.pos={...loc};Road723.at=Date.now()');
 assert.equal(w.roadScene(),'village');
 t.advance(1000);run('loc.lat+=.001');assert.equal(w.roadScene(),'village');
 for(let i=0;i<14;i++)assert.equal(w.roadScene(),'village');
 t.advance(1100);run('loc.lat+=.0001');assert.equal(w.roadScene(),'campagne');
 w.matcher=[way({highway:'motorway'})];run('Road723.cache=matcher;Road723.pos={...loc};Road723.at=Date.now()');
 assert.equal(w.roadScene(),'autoroute');
 w.matcher=[main];t.advance(1000);run('Road723.cache=matcher;Road723.pos={...loc};Road723.at=Date.now()');
 assert.equal(w.roadScene(),'campagne');
 w.matcher=[way({highway:'trunk',motorroad:'yes'},1,p.lon+.00002),way({highway:'secondary'},2)];
 assert.equal(w.Road723.choose(w.matcher,{...p,acc:8,ts:run('Date.now()')}),null);
 run("store.set('roadScene','foret')");assert.equal(w.roadScene(),'foret');
 run("store.set('roadScene','auto');loc.acc=80");assert.equal(w.roadScene(),'campagne');
 console.log('OK passage village → campagne → autoroute → campagne et mode manuel');
 const cv=w.document.querySelector('canvas[data-road]');
 for(const [width,height,dpr] of [[420,490,1.25],[620,620,1],[720,290,2]]){
  Object.defineProperty(cv,'clientWidth',{value:width,configurable:true});Object.defineProperty(cv,'clientHeight',{value:height,configurable:true});
  Object.defineProperty(w,'devicePixelRatio',{value:dpr,configurable:true});
  for(const environment of ['ville','village','campagne','foret','autoroute']){
   run(`store.set('roadScene','${environment}');store.set('carScale730',62);store.set('driver728On',false);`);
   for(const condition of [{c:0,day:1},{c:63,day:0},{c:73,day:1}]){
    w.condition=condition;run('weather={...condition,t:12};');
    for(const travel of [0,22,110,290,329,330,400,450,1119,1120,15000]){
     t.drawings.length=0;w.RoadDecor721.draw(cv,travel/14,travel,50);
     const car=cv.parentNode.querySelector('[data-car360]'),{x,y,laneWidth}=cv.roadCar731;
     assert(x>0&&x<1&&y>0&&y<1&&laneWidth>0);
     assert(Math.abs(parseFloat(car.style.left)/100-x)<1e-6);
     assert(parseFloat(car.style.width)*.51<=width*laneWidth+.001);
     assert(!t.drawings.some(a=>/GEISPOLSHEIM|STRASBOURG|VILLAGE · DÉMO/.test(a.text||'')));
    }
   }
  }
 }
 assert.equal(t.errors.length,0);
 console.log('OK 495 rendus : route, voiture, signalisation, trois formats et trois états météo');
 t.dom.window.close();
})().catch(e=>{console.error(e);t.dom.window.close();process.exitCode=1;});
