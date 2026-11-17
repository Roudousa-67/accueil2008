const {make}=require('./regression.cjs'),fs=require('fs'),assert=require('assert');
const t=make({canvas:true});t.run(fs.readFileSync(__dirname+'/../sources_assets/decors726.js','utf8'));
for(const scene of ['ville','village','campagne','foret','autoroute']){
 t.run(`window.roadScene=()=> '${scene}';roadKind=()=>({night:false,wx:'soleil'});`);
 const cv=t.w.document.querySelector('canvas[data-road]');assert(cv);
 Object.defineProperty(cv,'clientWidth',{value:480,configurable:true});Object.defineProperty(cv,'clientHeight',{value:300,configurable:true});
 for(const dist of [0,80,140])t.w.Decors726.draw(cv,dist/16,dist,60);
 console.log('OK rendu réel '+scene);
}
assert(!t.drawings.some(x=>/MÂCON|DIJON|PARIS|ILLKIRCH/.test(x.text||'')),'aucune destination fictive');
assert.deepStrictEqual(t.errors,[]);t.dom.window.close();console.log('OK chargement, cinq scènes et absence de destinations de démonstration');
