// npm install --prefix tests jsdom ; node tests/regression.cjs
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');
const { JSDOM, VirtualConsole } = require(process.env.JSDOM_MODULE || 'jsdom');
const dir = path.join(__dirname, '../sources_assets');
let passed=0;
function ok(name, actual, expected){assert.deepEqual(JSON.parse(JSON.stringify(actual)),expected,name); console.log('OK '+name);passed++;}
function make(options={}){
 const errors=[],calls=[], moves=[], nativeCalls=[], rafs=[], drawings=[];
 const nativeCanvas=options.canvas?require(process.env.CANVAS_MODULE || '@napi-rs/canvas'):null, canvasMap=new Map();
 const vc=new VirtualConsole();vc.on('jsdomError', e=>errors.push(e.message));
 const dom=new JSDOM(fs.readFileSync(path.join(dir,'index.html'),'utf8').replace(/<script[^>]*src=[^>]+><\/script>/g,''),{runScripts:'outside-only',url:'https://test.local/',pretendToBeVisual:true,virtualConsole:vc});
 const w=dom.window, ctx=dom.getInternalVMContext();
 let now=1800000000000, city={city:'Strasbourg'}, elements=[], offline=false, embedded=false;
 const RealDate=w.Date;
 w.Date=class extends RealDate {constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}};
 const activeIntervals=new Map(),activeRAFs=new Map();let intervalID=0,rafID=0;
 const timers=[];w.setTimeout=(fn,ms)=>{timers.push({fn,ms});return timers.length;}; w.clearTimeout=()=>{};w.setInterval=(fn,ms)=>{const id=++intervalID;activeIntervals.set(id,{fn,ms});return id;};w.clearInterval=id=>activeIntervals.delete(id);w.requestAnimationFrame=fn=>{const id=++rafID;activeRAFs.set(id,fn);rafs.push(time=>{if(activeRAFs.delete(id))fn(time);});return id;};w.cancelAnimationFrame=id=>activeRAFs.delete(id);
 w.matchMedia=()=>({matches:false,addListener(){},addEventListener(){}});
 w.HTMLCanvasElement.prototype.getContext=function(type){
  if(!nativeCanvas || type!=='2d')return null;
  let item=canvasMap.get(this);
  if(!item||item.canvas.width!==this.width||item.canvas.height!==this.height){
   const canvas=nativeCanvas.createCanvas(this.width,this.height),ctx=canvas.getContext('2d');
   const fill=ctx.fillRect.bind(ctx),text=ctx.fillText.bind(ctx),image=ctx.drawImage.bind(ctx);
   ctx.drawImage=(source,...args)=>image((canvasMap.get(source)||{}).canvas||source,...args);
   ctx.fillRect=(...args)=>{drawings.push({style:ctx.fillStyle,args});return fill(...args)};
   ctx.fillText=(...args)=>{drawings.push({text:args[0]});return text(...args)};
   item={canvas,ctx};canvasMap.set(this,item);
  }return item.ctx;
 };
 w.Android={setImmersive(){},immersive:()=>true,apps:()=> '[]',media:()=> '{}',qfStatus:()=> '{}',sysStatus:()=> '{}',ready(){},launch:()=>true,launchIn:(...r)=>{moves.push(r);return true;},http:(url,id)=>{calls.push(url);queueMicrotask(()=>w.__httpCb(id,!offline,JSON.stringify(offline?{}:url.includes('nominatim')?{address:city}:{elements})));}};
 let vp={x:0,y:50,width:1280,height:670};
 w.GpsDock={gpsCanEmbed:()=>embedded,gpsViewport:()=>JSON.stringify(vp),gpsVisible:v=>nativeCalls.push(['visible',v]),gpsBounds:(...a)=>nativeCalls.push(['bounds',...a]),gpsOpen:p=>nativeCalls.push(['open',p]),gpsLast:()=>'',gpsResize:()=>false,gpsImmersive(){}};
 for(const f of ['perf725-core.js','app.js','v4.js','home5.js','v47.js','v710.js','v711.js','v712.js','v713.js','v718.js','lib/suncalc-1.9.0.js','v719.js','v720.js','v721.js','decor721.js','files721.js','v723.js','v725.js'])new vm.Script(fs.readFileSync(path.join(dir,f),'utf8'),{filename:f}).runInContext(ctx);
 const run=s=>vm.runInContext(s,ctx);
 run("tab='home'; render();");
 w.document.elementFromPoint=()=>w.document.querySelector('.gpsbox');
 function pos(lat=48.58,lon=7.74){run(`loc={lat:${lat},lon:${lon},ts:Date.now(),spd:0,acc:8};`);}
 pos();
 function drawFrame(time,frameHeight=400){
  for(const cv of w.document.querySelectorAll('canvas[data-road]')){
   Object.defineProperty(cv,'clientWidth',{value:480,configurable:true});Object.defineProperty(cv,'clientHeight',{value:frameHeight,configurable:true});
  }
  run('if(window.RoadLoop725)RoadLoop725.invalidate()');const pending=rafs.splice(0);for(const fn of pending)fn(time);
 }
 return {w,dom,run,errors,activeIntervals,activeRAFs,rafStep:time=>{const pending=rafs.splice(0);for(const fn of pending)fn(time);},calls,moves,nativeCalls,timers,pos,drawings,drawFrame,canvasMap,setcity:a=>city=a,setels:a=>elements=a,setoffline:a=>offline=a,setembed:a=>embedded=a,setvp:a=>vp=a,advance:ms=>{now+=ms;run('if(loc) loc.ts=Date.now();');}};
}
module.exports={make};
if(require.main===module)(async()=>{
 const t=make(),{run}=t;
 ok('chargement complet sans erreur',t.errors,[]);
 ok('version',run('APP_VERSION'),'7.26');
 ok('délai initial une minute',run('Place710.every()'),60000);
 t.setels([{type:'node',lat:48.5805,lon:7.74,tags:{name:'Village proche',place:'village'}},{type:'node',lat:48.59,lon:7.74,tags:{name:'Grande ville',place:'city'}}]);
 await run('Place710.refresh()');
 ok('ville à la position GPS',run('Place710.here().name'),'Strasbourg');
 ok('panneau ville permanent',t.w.document.querySelector('.place710').textContent,'STRASBOURG');
 ok('une seule requête par service malgré appels concurrents',t.calls.length,2);
 await Promise.all([run('geoUpdate()'),run('updatePlace()'),run('plFetch()')]);
 ok('pas de doublons dans la minute',t.calls.length,2);
 run("Road723.cache=[{id:1,tags:{highway:'motorway'},geometry:[{lat:loc.lat,lon:loc.lon-.01},{lat:loc.lat,lon:loc.lon+.01}]}];Road723.pos={...loc};Road723.at=Date.now();sceneAt=0;");
 ok('autoroute choisit le plus proche, même village derrière à moins de 500 m',run('roadPlace().name'),'Village proche');
 run('Place710.paintSigns()');
 ok('panneau bleu autoroute',t.w.document.querySelector('.place710').classList.contains('highway710'),true);
 ok('distance indiquée',t.w.document.querySelector('.place710').textContent,'Village proche · < 1 km');
 t.advance(61000);t.pos(48.59,7.74);t.setcity({village:'Petit village',city:'Commune englobante'});
 await run('Place710.refresh()');run("Road723.cache=[{id:2,tags:{highway:'residential'},geometry:[{lat:loc.lat,lon:loc.lon-.01},{lat:loc.lat,lon:loc.lon+.01}]}];Road723.pos={...loc};Road723.at=Date.now();sceneAt=0;");
 ok('village précis au lieu de la commune englobante',run('roadPlace().name'),'Petit village');
 run('Place710.paintSigns()');ok('panneau village blanc rouge',t.w.document.querySelector('.place710').classList.contains('highway710'),false);
 ok('panneau village visible',t.w.document.querySelector('.place710').textContent,'PETIT VILLAGE');
 t.advance(61000);await run('Place710.refresh()');ok('cache à l’arrêt évite les requêtes répétées',t.calls.length,4);
 run("act('place710:every:30')");ok('réglage 30 secondes enregistré',run('store.get("placeEvery")'),30);
 run("act('place710:every:2')");ok('valeur de délai invalide ignorée',run('Place710.every()'),30000);
 t.advance(31000);t.pos(48.60,7.74);await run('Place710.refresh()');ok('nouvelle position au nouveau délai',t.calls.length,6);
 t.setoffline(true);t.advance(31000);t.pos(49,7.74);await run('Place710.refresh()');
 ok('hors réseau les noms éloignés sont masqués',run('roadPlace()'),null);
 run('Place710.paintSigns()');ok('indisponibilité annoncée',t.w.document.querySelector('.place710').textContent.includes('indisponible'),true);
 ok('échec réseau libère le verrou',run('Place710.status().busy'),false);
 t.setoffline(false);t.advance(31000);t.setcity({town:'Retour réseau'});await run('Place710.refresh()');ok('reprise réseau',run('Place710.here().name'),'Retour réseau');
 run('loc.ts=Date.now()-61000');ok('GPS périmé masqué',run('roadPlace()'),null);t.pos();
 ok('priorité village à la ville administrative',run('Place710.locality({city:"A",village:"B"})'),{name:'B',kind:'village'});
 ok('géométrie choisit la rue proche plutôt que l’autoroute voisine',run('Road710.choose([{tags:{highway:"motorway"},geometry:[{lat:48.5805,lon:7.73},{lat:48.5805,lon:7.75}]},{tags:{highway:"residential"},geometry:[{lat:48.58,lon:7.73},{lat:48.58,lon:7.75}]}],loc).tags.highway'),'residential');
 run("tab='home'; editing=false;gbMenu=false;render();");
 const box=t.w.document.querySelector('.gpsbox');box.getBoundingClientRect=()=>({left:640,top:100,right:1240,bottom:500,width:600,height:400});
 // JSDOM a une largeur par défaut de 1024 : fixer le viewport réel.
 t.w.innerWidth=1280;t.w.innerHeight=670;
 ok('origine réelle WebView et bordure',run('gbRect(true)'),[644,154,1236,546]);
 run("store.set('gbOffY',20)");ok('réglage descend réellement le rectangle',run('gbRect(true)'),[644,174,1236,566]);
 run("store.set('gbOffY',0)");t.setvp({x:0,y:0,width:2560,height:1440});
 ok('écran haute densité',run('gbRect(true)'),[1288,208,2472,992]);
 t.setvp({x:0,y:0,width:1280,height:720});t.setembed(true);run('Frame710.openEmbedded()');
 ok('intégration native appelée',t.nativeCalls.some(a=>a[0]==='open'&&a[1]==='com.waze'),true);
 box.getBoundingClientRect=()=>({left:640,top:140,right:1240,bottom:540,width:600,height:400});
 run('Frame710.sync()');ok('GPS natif suit un déplacement de 40 pixels',t.nativeCalls.filter(a=>a[0]==='bounds').at(-1),['bounds',644,144,592,392]);
 run("tab='settings';Frame710.sync()");ok('GPS natif masqué dans les réglages',t.nativeCalls.at(-1),['visible',false]);
 run("tab='home';editing=true;Frame710.sync()");ok('GPS natif masqué pendant modification',t.nativeCalls.at(-1),['visible',false]);
 run("editing=false; tab='home'");t.setembed(false);run('Frame710.sync()');
 ok('refus natif ne force pas une ouverture plein écran',run('gbLive'),false);
 const lastMoves=t.moves.length;run("gbLive=true;store.set('gbMode','cadre');store.set('gbLastRect',{pk:gbPk(),r:[644,104,1236,496],t:Date.now()});gbProbe=0;Frame710.sync()");
 ok('fenêtre existante reçoit une nouvelle position après déplacement',t.moves.length>lastMoves,true);
 ok('coordonnées transmises à Android',t.moves.at(-1).slice(1),[644,144,1236,536]);
 const count=t.calls.length;run('loc.ts=Date.now()-61000');await run('Place710.refresh(true)');ok('aucune requête avec une position GPS périmée',t.calls.length,count);t.pos();
 const nav=run('SETCATS.find(c=>c[0]==="Navigation")[1].find(c=>c[0]==="Panneaux et localités")[1](palette())');
 ok('options d’actualisation présentes dans les réglages',nav.includes('1 min')&&nav.includes('15 s')&&nav.includes('5 min'),true);
 ok('aucune erreur de script après scénarios',t.errors,[]);
 ok('panneau unique par tuile route',t.w.document.querySelectorAll('[data-roadbox] .place710').length,t.w.document.querySelectorAll('[data-roadbox]').length);
 run("tab='home';editing=false;render();");
 const sign=t.w.document.querySelector('.place710');
 const style=t.w.getComputedStyle(sign);
 ok('panneau sur le côté droit',style.right,'3%');
 ok('panneau fixe à la même hauteur',style.top,'38%');
 ok('aucun panneau en bas',style.bottom,'auto');
 ok('largeur du panneau limitée au bas-côté',style.width,'28%');
 const position=[style.top,style.right,style.width,style.bottom];
 run('loc.spd=40;Place710.paintSigns()');t.advance(60000);run('loc.spd=100;Place710.paintSigns()');
 const after=t.w.getComputedStyle(t.w.document.querySelector('.place710'));
 ok('la vitesse et le temps ne déplacent pas le panneau',[after.top,after.right,after.width,after.bottom],position);
 ok('barre Accueil descendue au démarrage',run('Screen711.height()'),64);
 ok('espace réservé appliqué',t.w.document.documentElement.style.getPropertyValue('--headerDrop711'),'64px');
 run("act('screen711:down')");ok('descendre la barre dans les réglages',run('Screen711.height()'),72);
 run("act('screen711:up')");ok('remonter la barre dans les réglages',run('Screen711.height()'),64);
 run("store.set('gbBarOn',true);store.set('gbBarH',40);gbBarApply(true)");
 ok('hauteur de barre non cumulée',run('Screen711.reserved()'),64);
 run("store.set('gbBarH',90);gbBarApply(true)");ok('grande barre du poste prise en compte',run('Screen711.reserved()'),90);
 run("store.set('headerDrop711',160);act('screen711:down')");ok('limite basse de l’écran respectée',run('Screen711.height()'),160);
 run("store.set('headerDrop711',0);act('screen711:up')");ok('limite supérieure respectée',run('Screen711.height()'),0);
 run("act('screen711:reset')");ok('retour à la hauteur conseillée',run('Screen711.height()'),64);
 for(const ratio of [0.72,0.78,0.85]) for(let metres=0;metres<330;metres+=0.5){
  const p=run(`RoadMotion712.signPoint(${metres},640,470,${640}*${ratio})`);
  assert(p.left>=640*ratio+9.5);assert(p.left+p.width<=640);assert(p.top<470);assert(p.opacity>=0&&p.opacity<=1);
 }
 ok('panneau reste hors de la voiture sur trois passages et trois formats',true,true);
 const signBefore=run('RoadMotion712.signPoint(10,640,470,500)'),signAfter=run('RoadMotion712.signPoint(80,640,470,500)');
 ok('le panneau défile vers le bas-côté',signAfter.left>signBefore.left && signAfter.top>signBefore.top,true);
 ok('véhicule opposé se rapproche au lieu de s’éloigner',run('RoadMotion712.oncomingDepth(1,0)>RoadMotion712.oncomingDepth(2,0)'),true);
 for(const aspect of [[640,470,.78,.51],[480,500,.86,.51],[1000,470,.7,.51]]){
  const [W,H,rx,ty]=aspect;const car={right:W*rx,top:H*ty};
  for(let z=1.05;z<18;z+=.02){const p=run(`RoadMotion713.geometry(${z},${W},${H},${JSON.stringify(car)})`);assert(p.left>=W*.558);assert(p.bottom<=car.top+.01||p.left>=car.right);}
 }
 ok('perspective hors de la route et hors de la voiture pour trois formats',true,true);
 ok('panneau choisit un emplacement du même flux que les arbres',run('RoadMotion713.slot([[8,8],[2,16],[4,9]])'),[2,16]);
 const far=run('RoadMotion713.geometry(7,640,470,null)'),near=run('RoadMotion713.geometry(3,640,470,null)');
 ok('panneau grandit et approche vers le bas-côté',near.width>far.width&&near.ground>far.ground&&near.left>far.left,true);
 const closer=run('RoadMotion713.geometry(4,640,470,{right:499.2,top:239.7})');
 const previous=640*(.5+.045*1.3)+Math.max(640*.78,(499.2+640*.02-640*(.5+.045*1.3))*(470*.50/(239.7-470*.36)))/4;
 ok('panneau réellement rapproché de la route',closer.left<previous,true);
 let kept=0,blocked=0;
 for(const scene of ['ville','village','foret'])for(let phase=0;phase<320;phase+=2){
   const travel=phase*.07,shift=travel%1.6,base=Math.floor(travel/1.6),items=[];
   for(let k=0;k<14;k++){const z=1.15+k*1.6-shift;if(z>1.05&&z<18)items.push([z,k+base]);}
   const slot=run(`RoadMotion713.slot(${JSON.stringify(items)})`);if(!slot)continue;
   for(const [z,id]of items){if(id===slot[1])continue;const y=470*.36+470*.64/z,x=320+(640*.045+640*.475/z)*1.1;
    const clear=run(`RoadMotion713.clearObject('${scene}',${z},${x},${y},0.8,640,470,null,${slot[0]})`);if(clear)kept++;else blocked++;
   }
 }
 ok('décor mélangé conservé au fil des passages',kept>0,true);ok('obstacles gênants filtrés à chaque passage',blocked>0,true);
 ok('alternance bâtiment espace panneau espace prévue dès le départ',run('Array.from({length:8},(_,i)=>RoadMotion713.kind(i))'),['panel','gap','scenery','scenery','scenery','scenery','scenery','gap']);
 for(let lap=0;lap<20;lap++)for(let id=0;id<8;id++)assert.equal(run(`RoadMotion713.kind(${lap*8+id})`),run(`RoadMotion713.kind(${id})`));
 ok('emplacements stables sur vingt tours',true,true);
 const renderer=fs.readFileSync(path.join(dir,'v4.js'),'utf8');ok('aucun masquage dynamique dans le décor',renderer.includes('.clearObject('),false);
 const oldLeft=640*(.5+.045*1.3)+Math.max(640*.64,(499.2+640*.012-640*(.5+.045*1.3))*(470*.50/(239.7-470*.36)))/4;
 const newLeft=run('RoadMotion713.geometry(4,640,470,{right:499.2,top:239.7}).left');
 ok('rapprochement visible par rapport à la 7.16',oldLeft-newLeft>5,true);
 ok('espaces réservés divisés par deux',run('Array.from({length:8},(_,i)=>RoadMotion713.kind(i)).filter(x=>x==="gap").length'),2);

 ok('transition rangée dans Décor de la route',run('SETCATS.find(c=>c[0]==="Navigation")[1].find(c=>c[0]==="Décor de la route")[1](palette()).includes("Transition entre les décors")'),true);
 ok('réglages panneaux dans Panneaux et localités',run('SETCATS.find(c=>c[0]==="Navigation")[1].find(c=>c[0]==="Panneaux et localités")[1](palette()).includes("Taille des panneaux")'),true);
 run("act('nav718:fade:1500')");ok('durée sauvegardée',run('RoadOptions718.duration()'),1500);
 run("act('nav718:size:140')");ok('taille sauvegardée',run('RoadOptions718.size()'),1.4);
 run("act('nav718:distance:0')");ok('écart sauvegardé',run('RoadOptions718.distance()'),0);
 run("act('nav718:spacing:12')");ok('fréquence sauvegardée',run('RoadOptions718.spacing()'),12);
 run("act('nav718:size:900')");ok('valeur de taille invalide ignorée',run('RoadOptions718.size()'),1.4);
 for(const size of [80,100,120,140])for(const distance of [0,8,16,24]){
  run(`store.set('panelSize718',${size});store.set('panelDistance718',${distance})`);
  for(let z=1.05;z<18;z+=.05){const p=run(`RoadMotion713.geometry(${z},480,500,{right:412.8,top:255})`);assert(p.bottom<=255||p.left>=412.8);}
 }
 ok('marge voiture pour toutes les tailles et distances',true,true);
 const skyAt=h=>run(`RoadSky719.sample(new Date(2026,5,21,${h}),null,'clock')`);
 const sunAt=h=>skyAt(h).bodies.find(p=>p.kind==='sun'),moonAt=h=>skyAt(h).bodies.find(p=>p.kind==='moon');
 ok('soleil traverse le ciel du matin au soir',sunAt(7).x<sunAt(13).x&&sunAt(13).x<sunAt(19).x,true);
 ok('soleil plus haut à midi',sunAt(13).y<sunAt(7).y,true);
 ok('lune traverse la nuit y compris minuit',moonAt(21).x<moonAt(0).x&&moonAt(0).x<moonAt(5).x,true);
 ok('pas de soleil en pleine nuit en mode heure',skyAt(0).bodies.some(p=>p.kind==='sun'),false);
 ok('mode horaire local sans GPS',skyAt(12).source,'clock');
 const gps=run("(()=>{const d=new Date(Date.UTC(2026,5,21,11));return RoadSky719.sample(d,{lat:48.58,lon:7.74,ts:d.getTime()},'gps')})()");
 ok('mode GPS calcule localement',gps.source,'gps');ok('soleil visible à midi en été',gps.bodies.some(p=>p.kind==='sun'),true);
 ok('GPS ancien revient au rythme horaire',run("(()=>{const d=new Date();return RoadSky719.sample(d,{lat:48.58,lon:7.74,ts:d.getTime()-61000},'gps').source})()"),'clock');
 ok('position invalide ne produit pas de coordonnées de dessin',run("RoadSky719.sample(new Date(),{lat:200,lon:0,ts:Date.now()},'gps').source"),'clock');
 run("act('sky719:mode:clock')");ok('mode de ciel sauvegardé',run('RoadSky719.mode()'),'clock');
 run("act('sky719:bodies')");ok('astres désactivables',run('RoadSky719.enabled()'),false);run("act('sky719:bodies')");
 run("act('sky719:gradient')");ok('ciel progressif désactivable',run('RoadSky719.palette()'),null);run("act('sky719:gradient')");
 ok('réglages ciel dans la catégorie Navigation',run('SETCATS.find(c=>c[0]==="Navigation")[1].find(c=>c[0]==="Décor de la route")[1](palette()).includes("Soleil et lune")'),true);
 for(const h of [0,5,6,7,12,18,20,24])for(const p of skyAt(h).bodies)assert(Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=1&&p.y>=0&&p.y<=.36);
 ok('positions des astres bornées dans le ciel',true,true);
 run("Settings720.query='soleil';Settings720.filter='';");
 ok('recherche par mot à l’intérieur des réglages',run('Settings720.matches(palette()).some(x=>x.name==="Décor de la route")'),true);
 run("Settings720.filter='Véhicule'");ok('filtre par catégorie',run('Settings720.matches(palette()).every(x=>x.category==="Véhicule")'),true);
 run("Settings720.query='SOLEIL';Settings720.filter='Navigation'");ok('recherche sans sensibilité à la casse',run('Settings720.matches(palette()).length>0'),true);
 run("Settings720.query='';Settings720.filter='';tab='settings';openSet('Navigation','Décor de la route');");
 let content=t.w.document.querySelector('[data-settings-scroll="body"]');content.scrollTop=315;
 const sidebar=t.w.document.querySelector('[data-settings-scroll="side"]');sidebar.scrollTop=145;
 run("act('sky719:bodies')");
 ok('défilement du paramètre conservé après sélection',t.w.document.querySelector('[data-settings-scroll="body"]').scrollTop,315);
 ok('défilement des catégories conservé',t.w.document.querySelector('[data-settings-scroll="side"]').scrollTop,145);
 run("act('sky719:bodies')");
 const search=t.w.document.getElementById('settingsSearch720');search.focus();search.value='panneau';search.setSelectionRange(7,7);search.dispatchEvent(new t.w.Event('input'));
 ok('texte de recherche conservé pendant le rendu',t.w.document.getElementById('settingsSearch720').value,'panneau');
 ok('focus conservé pendant la frappe',t.w.document.activeElement.id,'settingsSearch720');
 run("Settings720.voicePending=Date.now();Settings720.acceptVoice({id:Date.now()+1,text:'lune'});");ok('résultat vocal alimente la recherche',run('Settings720.query'),'lune');
 run("act('search720:clear');tab='home';render();");
 const compact=run('fCfg().pages[0]'),gpsCard=compact.find(x=>x.b&&x.b.includes('gpsbox')),appsCard=compact.find(x=>x.b&&x.b.includes('apps'));
 ok('GPS étendu à cinq rangées',gpsCard.h,5);ok('barre applications ramenée à une rangée',appsCard.h,1);
 run("act('compact720:toggle')");ok('disposition normale restaurable',run('fCfg().pages[0].find(x=>x.b&&x.b.includes("gpsbox")).h'),4);
 run("act('compact720:toggle')");
 ok('lien de mise à jour du dépôt accepté',run('Update720.valid("https://github.com/Roudousa-67/accueil2008/releases/download/v8/app.apk")'),true);
 ok('lien externe de mise à jour refusé',run('Update720.valid("https://evil.example/app.apk")'),false);
 run("updInfo={version:'99.0',apk:'https://github.com/Roudousa-67/accueil2008/releases/download/v99/app.apk'};act('updGet');");
 ok('proposition avant téléchargement',!!t.w.document.querySelector('[data-update720]'),true);
 run("act('update720:later')");ok('report de mise à jour sans téléchargement',run('Update720.pending'),null);
 t.dom.window.close();
 if(process.env.CANVAS_MODULE || (()=>{try{return !!require.resolve('@napi-rs/canvas')}catch(e){return false}})()){ 
  const c=make({canvas:true});c.setels([]);await c.run('Place710.refresh()');
  c.run("Road723.cache=[{id:2,tags:{highway:'residential'},geometry:[{lat:loc.lat,lon:loc.lon-.01},{lat:loc.lat,lon:loc.lon+.01}]}];Road723.pos={...loc};Road723.at=Date.now();sceneAt=0;loc.spd=40;render();");
  for(let i=1;i<=90;i++)c.drawFrame(i*100);
  const buildings=c.drawings.filter(x=>['#6f9be0','#2f4f9a'].includes(x.style));
  ok('immeubles du premier plan conservés à gauche',buildings.length>0,true);
  ok('bâtiments rétablis à droite hors du panneau',buildings.some(x=>x.args[0]>=240),true);
  ok('panneau maintenant dessiné dans le décor animé',c.drawings.some(x=>x.text),true);
  for(const scene of ['village','autoroute']){
   c.run(`store.set('roadScene','${scene}');sceneAt=0;render();`);
   c.drawFrame(10000);ok('rendu Canvas sans erreur : '+scene,c.errors,[]);
  }
  c.run("RoadFX718.frames.clear();store.set('roadFade718',1000);window.fxScene718='ville';window.fxTime718=0;window.roadScene=()=>fxScene718;RoadFX718.now=()=>fxTime718;window.fxCv718=document.createElement('canvas');fxCv718.width=4;fxCv718.height=4;");
  c.run("RoadFX718.draw(fxCv718,()=>{const x=fxCv718.getContext('2d');x.fillStyle='#ff0000';x.fillRect(0,0,4,4)});fxScene718='village';fxTime718=1000;RoadFX718.draw(fxCv718,()=>{const x=fxCv718.getContext('2d');x.fillStyle='#0000ff';x.fillRect(0,0,4,4)});");
  ok('début de transition conserve l’ancien décor',Array.from(c.run('fxCv718.getContext("2d").getImageData(0,0,1,1).data')).slice(0,3),[255,0,0]);
  c.run("fxTime718=1500;RoadFX718.draw(fxCv718,()=>{const x=fxCv718.getContext('2d');x.fillStyle='#0000ff';x.fillRect(0,0,4,4)});");
  const middle=Array.from(c.run('fxCv718.getContext("2d").getImageData(0,0,1,1).data'));
  ok('fondu intermédiaire mélange les deux décors',middle[0]>100&&middle[2]>100,true);
  c.run("fxTime718=2100;RoadFX718.draw(fxCv718,()=>{const x=fxCv718.getContext('2d');x.fillStyle='#0000ff';x.fillRect(0,0,4,4)});");
  ok('fin de transition affiche le nouveau décor',Array.from(c.run('fxCv718.getContext("2d").getImageData(0,0,1,1).data')).slice(0,3),[0,0,255]);
  c.run('RoadFX718.frames.clear();window.roadScene=()=>"ville";');
  c.drawFrame(11000,400);c.drawFrame(11100,320);
  ok('canvas redimensionné quand seule la hauteur change',c.w.document.querySelector('canvas[data-road]').height,320);
  const context=c.w.document.createElement('canvas').getContext('2d');
  for(const h of [0,7,13,19,21]){c.run(`RoadSky719.now=()=>new Date(2026,5,21,${h});RoadSky719.cache=null;store.set('skyPosition719','clock');`);c.run('RoadSky719.draw(document.createElement("canvas").getContext("2d"),480,320,"soleil")');}
  ok('dessin soleil et lune sans erreur Canvas',c.errors,[]);
  c.dom.window.close();
 }
 console.log(`\n${passed} vérifications réussies.`);
})().catch(e=>{console.error(e);process.exit(1)});
