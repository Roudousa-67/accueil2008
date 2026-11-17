/* Mesures comparatives en Node/JSDOM : pas des mesures d'autoradio. */
const fs=require('node:fs'),path=require('node:path'),{performance}=require('node:perf_hooks');
const base=process.env.BASELINE_ROOT;
if(!base)throw Error('BASELINE_ROOT requis pour comparer les mêmes scénarios.');
function measure(root){
 const {make}=require(path.join(root,'tests/regression.cjs')),t=make({canvas:true}),r=t.run,w=t.w;
 r("tab='home';render();curSpeed=()=>({v:0});roadKind=()=>({wx:'soleil',night:false});carYaw=0;");
 const pending=new Map();let id=0;
 w.requestAnimationFrame=fn=>{pending.set(++id,fn);return id;};w.cancelAnimationFrame=i=>pending.delete(i);
 let queries=0;const query=w.document.querySelectorAll.bind(w.document);w.document.querySelectorAll=s=>{if(s==='#screen canvas[data-road]')queries++;return query(s);};
 t.drawFrame(1000);
 queries=0;let callbacks=0;const start=performance.now();
 for(let i=1;i<=120;i++){const batch=Array.from(pending.values());pending.clear();for(const fn of batch){callbacks++;fn(1000+i*40);}}
 const stationaryMs=performance.now()-start,stationaryQueries=queries;
 r("tab='settings';render()");callbacks=0;queries=0;
 for(let i=1;i<=120;i++){const batch=Array.from(pending.values());pending.clear();for(const fn of batch){callbacks++;fn(6000+i*40);}}
 const offHomeCallbacks=callbacks,offHomeQueries=queries;
 let reads=0;const proto=w.Storage.prototype,old=proto.getItem;proto.getItem=function(k){reads++;return old.call(this,k);};
 r("store.set('perfBench',123);if(store.flush)store.flush();");
 reads=0;for(let i=0;i<1000;i++)r("store.get('perfBench',0)");const storageReads=reads;
 const renderStart=performance.now();for(let i=0;i<15;i++)r('render()');const renderAverageMs=(performance.now()-renderStart)/15;
 t.dom.window.close();return {stationarySimulationMs:stationaryMs,stationaryRouteQueries:stationaryQueries,offHomeCallbacks,offHomeRouteQueries:offHomeQueries,localStorageReadsFor1000Gets:storageReads,renderAverageMs};
}
const report={environment:'GitHub Actions Linux, Node/JSDOM et Canvas CPU ; aucune mesure GPU ni UIS7862S',before:measure(base),after:measure(path.resolve(__dirname,'..'))};
if(report.after.offHomeRouteQueries!==0||report.after.offHomeCallbacks>0||report.after.localStorageReadsFor1000Gets!==0)throw Error('Régression des gains attendus : '+JSON.stringify(report));
fs.writeFileSync(process.env.PERF_REPORT||'mesures-performances725.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
