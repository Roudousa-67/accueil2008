/* 7.25 : instrumentation, tâches d'affichage et chargements partagés. */
'use strict';
window.Perf725=(()=>{
 const started=performance.now(),native={setInterval:window.setInterval.bind(window),clearInterval:window.clearInterval.bind(window),setTimeout:window.setTimeout.bind(window),clearTimeout:window.clearTimeout.bind(window)};
 const intervals=new Set(),display=new Set(),loads=new Map();
 let paused=document.hidden,boot=null,draws=0,drawMs=0,renderMs=0,renders=0,lastFPS=performance.now(),fps=0,fpsN=0,slowMs=0,slowN=0,slowStart=null,cap=2,lastNotice=0;
 window.setInterval=(fn,ms,...args)=>{const id=native.setInterval(fn,ms,...args);intervals.add(id);return id;};
 window.clearInterval=id=>{intervals.delete(id);native.clearInterval(id);};
 function every(fn,ms){const task={fn,ms,id:null};display.add(task);if(!paused)task.id=window.setInterval(fn,ms);return task;}
 function cancel(task){if(!task)return;if(task.id!==null)window.clearInterval(task.id);task.id=null;display.delete(task);}
 function suspend(value){if(paused===value)return false;paused=value;for(const t of display){if(value){if(t.id!==null)window.clearInterval(t.id);t.id=null;}else if(t.id===null)t.id=window.setInterval(t.fn,t.ms);}return true;}
 function script(src){if(loads.has(src))return loads.get(src);const p=new Promise((resolve,reject)=>{const el=document.createElement('script');el.src=src;el.onload=()=>resolve();el.onerror=()=>{el.remove();loads.delete(src);reject(Error('Chargement impossible : '+src));};document.head.appendChild(el);});loads.set(src,p);return p;}
 function draw(ms,at){draws++;drawMs+=ms;fpsN++;const dt=at-lastFPS;if(dt>=1000){fps=fpsN*1000/dt;fpsN=0;lastFPS=at;}
  if(typeof store==='undefined'||!store.get('perf725Guard',true)){slowStart=null;slowMs=slowN=0;cap=2;return;}
  if(slowStart===null)slowStart=at;slowMs+=ms;slowN++;
  if(at-slowStart>=3000){if(slowN>=20&&slowMs/slowN>20&&cap>0){const q=typeof Decor721==='undefined'?2:['calme','normal','riche'].indexOf(Decor721.quality());cap=Math.max(0,Math.min(cap,q<0?2:q)-1);if(at-lastNotice>5000){lastNotice=at;if(typeof toast==='function')toast('Décor allégé pour garder une animation fluide.');}}slowStart=at;slowMs=slowN=0;}
 }
 return {native,script,every,cancel,suspend,paused:()=>paused,draw,resetGuard(){cap=2;slowStart=null;slowMs=slowN=0;},
  cap:()=>cap,render(ms){renders++;renderMs+=ms;if(boot===null)boot=performance.now()-started;},
  stats(){const mem=performance.memory;return {startupMs:boot,draws,drawMs:draws?drawMs/draws:0,fps:paused||!window.RoadLoop725||!RoadLoop725.running()?0:fps,renders,renderMs:renders?renderMs/renders:0,intervals:intervals.size,displayTimers:Array.from(display).filter(t=>t.id!==null).length,roadLoops:window.RoadLoop725&&RoadLoop725.running()?1:0,jsBytes:mem&&Number.isFinite(mem.usedJSHeapSize)?mem.usedJSHeapSize:null,paused};}
 };
})();
window.displayEvery725=(fn,ms)=>Perf725.every(fn,ms);
window.Lazy725={
 forceLeaflet:false,
 car(){return Perf725.script('lib/three.min.js').then(()=>Perf725.script('lib/GLTFLoader.js')).then(()=>Perf725.script('lib/RoomEnvironment.js'));},
 map(){
  let webgl=false;try{const c=document.createElement('canvas');webgl=!!(c.getContext('webgl2')||c.getContext('webgl'));}catch(e){}
  return webgl&&!this.forceLeaflet?Perf725.script('lib/maplibre-gl.js').catch(()=>{this.forceLeaflet=true;return Perf725.script('lib/leaflet.js');}):Perf725.script('lib/leaflet.js');
 }
};
