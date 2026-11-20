'use strict';
const assert=require('node:assert/strict');
const {make}=require('./regression.cjs');
function measure(step,speed){
 const t=make({canvas:true,extraScripts:['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js']});
 t.run(`curSpeed=()=>({v:${speed},src:'GPS'});store.set('roadScene','campagne');store.set('driver728On',false)`);
 t.drawFrame(1000);
 const start=t.w.RoadMotion734.metres;
 for(let ms=1000+step;ms<=5000;ms+=step)t.drawFrame(ms);
 const distance=t.w.RoadMotion734.metres-start;
 t.run('onPauseHome()');t.drawFrame(105000);
 assert.equal(t.w.RoadMotion734.metres-start,distance,'la pause ne rajoute pas de distance');
 assert.equal(t.errors.length,0);
 t.dom.window.close();return distance;
}
for(const speed of [0,20,80,130]){
 const slow=measure(500,speed),fast=measure(40,speed),expected=speed/3.6*4;
 assert(Math.abs(slow-expected)<1e-8,`${speed} km/h à deux images/s`);
 assert(Math.abs(fast-expected)<1e-8,`${speed} km/h à 25 images/s`);
}
console.log('OK distance proportionnelle à 0, 20, 80 et 130 km/h, à 2 et 25 images/s, sans avance pendant la pause');
