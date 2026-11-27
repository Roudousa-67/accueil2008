'use strict';
// 7.63 : images « Activé / Désactivé » dans les ⓘ (interrupteurs, choix multiples, image dessinée sinon).
const assert=require('node:assert/strict');
const {make}=require('./regression.cjs');
const extra=require('fs').readFileSync(__dirname+'/v761.cjs','utf8').match(/const extra=(\[.*?\]);/)[1];
(async()=>{
 const t=make({canvas:true,extraScripts:eval(extra)}),{run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 run("curSpeed=()=>({v:0,src:'test'});store.set('onboard760',1);");
 // Recense les réglages : interrupteurs et choix ont des images
 const st=JSON.parse(run("(()=>{const r={tog:null,multi:null,n:{tog:0,multi:0}};for(let c=0;c<SETCATS.length;c++)for(let s=0;s<SETCATS[c][1].length;s++){setCat=c;setSub=s;tab='settings';try{render();}catch(e){}for(const [k,it] of Help723.rows){const C=Info760.choices(it);if(!C)continue;r.n[C.kind]++;if(!r[C.kind])r[C.kind]=[c,s,k];}}return JSON.stringify(r)})()"));
 assert(st.n.tog>=15,'interrupteurs reconnus : '+st.n.tog);assert(st.n.multi>=50,'choix reconnus : '+st.n.multi);
 const open=f=>{run(`setCat=${f[0]};setSub=${f[1]};tab='settings';render();act('help723:${f[2]}')`);t.timers.filter(x=>x.ms===30).forEach(x=>x.fn());};
 // Interrupteur : deux images, réglage remis comme avant
 const snap=()=>run("JSON.stringify(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)]).filter(([k])=>!/^a08_(tint760|logo761|stUsedN761|lastRender|perf)/.test(k)))");
 const before=snap();open(st.tog);
 const it=JSON.parse(run("JSON.stringify({p:(Help723.current.previews||[]).map(o=>o.label),cur:Help723.current.curLabel})"));
 assert.deepEqual(it.p,['Activé','Désactivé'],'interrupteur : images Activé et Désactivé');assert(it.cur,'état actuel marqué');
 assert.equal(snap(),before,'réglage remis comme avant');
 assert(run("document.querySelector('[data-help723]').textContent").includes('Activé'),'affiché dans l’aide');
 run("act('help723:close')");
 // Réglage sans effet sur l'accueil : image dessinée
 run("Help723.current={name:'Test',desc:'Fait quelque chose ailleurs',section:'Trajets',choices:[],preview:'',acts:[{act:'decor721:toggle:4',label:'Activé',on:true,tog:false}]};");
 run("Info760.build(Help723.current);Help723.current.noVisual=true;render();");
 const html=run("document.querySelector('[data-help723]').innerHTML");
 assert(html.includes('Activé ou désactivé')&&html.includes('Coupé'),'image dessinée Activé / Désactivé');
 run("act('help723:close')");
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('OK images Activé / Désactivé dans les ⓘ ('+st.n.tog+' interrupteurs, '+st.n.multi+' choix)');
 console.log('Tests 7.63 réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
