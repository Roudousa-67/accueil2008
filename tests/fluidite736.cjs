'use strict';
// 7.36 : cadence régulière du widget, bouclage continu du décor et détection ville/village.
const assert=require('node:assert/strict');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js'];

// ---------- 1. Cadence ----------
function pacing(drawMs){
 const t=make({canvas:true,extraScripts:extra});
 // Horloge de mesure maîtrisée : le coût du dessin est simulé, pas celui de la machine de test.
 let clock=0;t.w.performance.now=()=>clock;
 t.run("curSpeed=()=>({v:50,src:'GPS'});store.set('roadScene','campagne');store.set('driver728On',false);store.set('perf725Guard',false)");
 const draw=t.w.RoadDecor721.draw;t.w.RoadDecor721.draw=function(){const r=draw.apply(this,arguments);clock+=drawMs;return r;};
 const stamps=[];let previous=null;
 for(const cv of t.w.document.querySelectorAll('canvas[data-road]')){Object.defineProperty(cv,'clientWidth',{value:480,configurable:true});Object.defineProperty(cv,'clientHeight',{value:400,configurable:true});}
 t.run('RoadLoop725.invalidate()');
 const period=1000/60;
 for(let i=0;i<240;i++){
  const now=1000+i*period;clock=now;t.rafStep(now);
  const m=t.w.RoadMotion734;if(m&&m!==previous){stamps.push(now);previous=m;}
 }
 const pace=t.run('RoadLoop725.pace()');
 assert.equal(t.errors.length,0);t.dom.window.close();
 const late=stamps.slice(-60),gaps=late.slice(1).map((x,i)=>x-late[i]);
 return {draws:stamps.length,gaps,pace};
}
{
 const fast=pacing(2);
 // L'ancien seuil fixe de 16,7 ms refusait une image sur deux à 60 Hz (16,67 ms).
 assert(fast.draws>=235,'60 i/s sans image sautée : '+fast.draws+' dessins sur 240');
 assert.equal(fast.pace.step,1);
 assert(fast.gaps.every(g=>Math.abs(g-1000/60)<0.01),'intervalles réguliers à 60 i/s');
 const slow=pacing(24);
 assert.equal(slow.pace.step,2,'dessin de 24 ms : une image sur deux');
 assert(slow.gaps.every(g=>Math.abs(g-2000/60)<0.01),'intervalles réguliers à 30 i/s : '+slow.gaps.join(','));
 const heavy=pacing(40);
 assert.equal(heavy.pace.step,3,'dessin de 40 ms : 20 i/s réguliers');
 assert(heavy.gaps.every(g=>Math.abs(g-3000/60)<0.01));
 console.log('OK cadence : 60 i/s sans saut, puis 30 et 20 i/s réguliers selon le coût du dessin');
}

// ---------- 2. Bouclage continu ----------
{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 run("store.set('driver728On',false);store.set('perf725Guard',false);weather={c:0,day:1,t:15};");
 const cv=w.document.querySelector('canvas[data-road]');
 Object.defineProperty(cv,'clientWidth',{value:420,configurable:true});Object.defineProperty(cv,'clientHeight',{value:420,configurable:true});
 const snap=m=>{w.RoadDecor721.draw(cv,10,m,50);const c=cv.getContext('2d');return c.getImageData(0,0,cv.width,cv.height).data;};
 const diff=(a,b)=>{let s=0;for(let i=0;i<a.length;i+=4)s+=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);return s/(a.length/4);};
 const report=[];
 for(const scene of ['ville','village','campagne','foret','autoroute']){
  run(`store.set('roadScene','${scene}')`);
  const span=w.Decors726.LOOP[scene]+w.Decors726.LEAD[scene];
  assert(Math.abs(w.Decors726.loopMetres(span-.1,scene)-(w.Decors726.LOOP[scene]-.1))<1e-6,'fin de boucle : '+scene);
  assert(Math.abs(w.Decors726.loopMetres(span+.1,scene)-(.1-w.Decors726.LEAD[scene]))<1e-6,'début de la boucle suivante : '+scene);
  const step=.6,normal=Math.max(...[span*.3,span*.55,span*.8].map(m=>diff(snap(m),snap(m+step)))),wrap=diff(snap(2*span-step/2),snap(2*span+step/2));
  assert.equal(w.Decors726.blending,true,'fondu actif juste après le bouclage : '+scene);
  snap(2*span+40);assert.equal(w.Decors726.blending,false,'fondu terminé : '+scene);
  report.push(scene+' '+wrap.toFixed(2)+'/'+normal.toFixed(2));
  assert(wrap<=normal*1.6+.5,`bouclage sans saut visible (${scene}) : ${wrap.toFixed(2)} contre ${normal.toFixed(2)} pour un pas normal`);
 }
 assert.equal(t.errors.length,0);t.dom.window.close();
 console.log('OK bouclage continu des cinq décors ('+report.join(', ')+')');
}

// ---------- 3. Transition entre décors : une seule copie du canevas ----------
{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 run("store.set('driver728On',false);store.set('roadFade718',1000);RoadFX718.frames.clear();window.fx736='ville';window.roadScene=()=>fx736;");
 const cv=w.document.createElement('canvas');cv.width=8;cv.height=8;
 let copies=0;const create=w.document.createElement.bind(w.document);w.document.createElement=n=>{if(String(n).toLowerCase()==='canvas')copies++;return create(n);};
 w.fxCv736=cv;for(let i=0;i<30;i++)run(`RoadFX718.now=()=>${i*40};RoadFX718.draw(fxCv736,()=>{})`);
 assert.equal(copies,0,'aucune copie périodique sans changement de décor');
 run("fx736='village';RoadFX718.now=()=>1300;RoadFX718.draw(fxCv736,()=>{})");
 assert.equal(copies,1,'une copie au changement de décor');
 t.dom.window.close();
 console.log('OK fondu entre décors sans copie du canevas toutes les 180 ms');
}

// ---------- 4. Détection ville / village / campagne ----------
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t,scene=w.RoadScene731;
 const p={lat:48.58,lon:7.74},dLat=1/111320,dLon=1/(111320*Math.cos(p.lat*Math.PI/180));
 const way=(tags,id,points)=>({type:'way',id,tags,geometry:points.map(([n,e])=>({lat:p.lat+n*dLat,lon:p.lon+e*dLon}))});
 // Avenue nord-sud ; rues résidentielles perpendiculaires à plus de 75 m (jamais prises pour la chaussée suivie).
 const avenue=way({highway:'primary',maxspeed:'50'},1,[[-600,0],[600,0]]);
 const streets=[-130,-100,100,130].map((n,i)=>way({highway:'residential'},10+i,[[n,-300],[n,300]]));
 const rural=way({highway:'secondary',maxspeed:'80'},2,[[-600,0],[600,0]]);
 const lane=way({highway:'residential'},20,[[0,-300],[0,300]]);
 const load=(elements)=>{w.cache736=elements;run('Road723.cache=cache736;Road723.pos={lat:loc.lat,lon:loc.lon};Road723.at=Date.now();');};
 const empty={areas:[],places:[]};
 t.pos(p.lat,p.lon);
 load([avenue,...streets]);
 const dense=scene.streetDensity({...p});
 assert(dense>=700&&dense<800,'rues résidentielles mesurées : '+dense);
 run("plList=[{n:'Grande ville',k:'city',lat:48.582,lon:7.741}];plAt=Date.now();plPos={lat:loc.lat,lon:loc.lon};");
 assert.equal(scene.environment({...p},avenue,empty),'ville','avenue de ville sans polygone d’occupation du sol');
 assert.equal(scene.environment({...p},null,empty),'ville','route non identifiée mais rues denses');
 run("plList=[{n:'Petit village',k:'village',lat:48.5803,lon:7.7402}];plAt=Date.now();");
 assert.equal(scene.environment({...p},avenue,empty),'village','centre de village proche');
 load([rural,lane]);
 const sparse=scene.streetDensity({...p});
 assert(sparse>200&&sparse<450,'une seule rue croisée : '+sparse);
 assert.equal(scene.environment({...p},rural,empty),'campagne','route départementale croisant une rue isolée');
 assert.equal(scene.environment({...p},way({highway:'secondary',maxspeed:'50'},3,[[-600,0],[600,0]]),empty),'village','rue isolée et limitation à 50 : traversée de localité');
 assert.equal(scene.environment({...p},way({highway:'motorway'},4,[[-600,0],[600,0]]),empty),'autoroute');
 console.log('OK zones bâties reconnues par les rues chargées, sans requête supplémentaire');

 // Chaîne complète : ville confirmée, GPS dégradé, autoroute et route ambiguë.
 run("store.set('roadScene','auto');plList=[{n:'Grande ville',k:'city',lat:48.582,lon:7.741}];plAt=Date.now();");
 load([avenue,...streets]);
 assert.equal(w.roadScene(),'ville');
 t.advance(1000);run('loc.acc=80');
 assert.equal(w.roadScene(),'ville','GPS imprécis : décor conservé');
 t.advance(50000);assert.equal(w.roadScene(),'ville','encore conservé après 50 s');
 t.advance(15000);assert.equal(w.roadScene(),'campagne','abandonné après une minute sans GPS exploitable');
 t.pos(p.lat,p.lon);load([way({highway:'motorway'},5,[[-600,0],[600,0]]),...streets]);
 assert.equal(w.roadScene(),'autoroute');
 // Échangeur : route non identifiée pendant quelques secondes, rues proches.
 load([way({highway:'motorway'},6,[[-600,3],[600,3]]),way({highway:'secondary'},7,[[-600,-3],[600,-3]]),...streets]);
 for(let i=1;i<=5;i++){t.advance(1000);run('loc.lat+=0.000001');assert.equal(w.roadScene(),'autoroute','sans route reconnue, l’autoroute reste affichée '+i+' s');}
 t.advance(2000);run('loc.lat+=0.000001');assert.equal(w.roadScene(),'ville','puis la zone bâtie l’emporte après confirmation');
 assert.match(run('RoadScene731.status.reason'),/Route non identifiée · rues \d+ m/);
 assert.equal(t.errors.length,0);t.dom.window.close();
 console.log('OK décor conservé en GPS dégradé, sortie d’autoroute confirmée, état affiché dans les réglages');
})().catch(e=>{console.error(e);process.exitCode=1;});
