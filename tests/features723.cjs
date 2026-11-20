const {make}=require('./regression.cjs');const assert=require('assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
let count=0;const ok=(n,a,b=true)=>{assert.deepEqual(a,b,n);count++;console.log('OK '+n);};
(async()=>{
 const t=make({canvas:true}),{run,w}=t;
 const calls=[];w.GpsDock.gpsWindowVisible=(pk,visible)=>(calls.push([pk,visible]),true);w.GpsDock.gpsResize=()=>true;
 const rect={left:500,top:100,right:1000,bottom:500,width:500,height:400};
 const orig=w.HTMLElement.prototype.getBoundingClientRect;
 w.HTMLElement.prototype.getBoundingClientRect=function(){return this.classList.contains('gpsbox')?rect:orig.call(this);};
 run("gbLive=true;store.set('gbMode','cadre');tab='home';render();");
 for(const tab of ['settings','trips','service','tracks','eco','apps']){
  run(`tab='${tab}';render();`);ok('GPS masqué hors Accueil : '+tab,calls.at(-1)[1],false);
  const n=calls.length;run('Frame710.sync();Frame710.sync()');ok('aucun masquage en boucle : '+tab,calls.length,n);
  run("tab='home';render();");ok('GPS rétabli au retour de '+tab,calls.at(-1)[1],true);
 }
 const before=calls.length;run('gbLive=false;tab="settings";render();tab="home";render()');ok('GPS non ouvert ne se lance pas seul',calls.length,before);
 run('gbLive=true;tab="settings";');Object.defineProperty(w.document,'hidden',{value:true,configurable:true});run('Frame710.sync()');ok('aucun retour forcé si application en arrière-plan',calls.length,before);Object.defineProperty(w.document,'hidden',{value:false,configurable:true});
 w.GpsDock.gpsWindowVisible=()=>false;run('Window723.hidden=false;Window723.retryAt=0;Frame710.sync()');ok('refus système signalé sans faux succès',run('Window723.hidden'),false);
 const mk=(id,hw,lat,lon,vertical=false,extra={})=>({id,tags:{highway:hw,...extra},geometry:vertical?[{lat:lat-.01,lon},{lat:lat+.01,lon}]:[{lat,lon:lon-.01},{lat,lon:lon+.01}]});
 w.candidates=[mk(1,'motorway',48.58,7.74),mk(2,'residential',48.5807,7.74)];t.pos();
 ok('autoroute choisie même à faible vitesse',run('Road723.choose(candidates,loc).id'),1);
 w.candidates=[mk(1,'motorway',48.5805,7.74),mk(2,'residential',48.58,7.74)];ok('route urbaine sous la position prioritaire',run('Road723.choose(candidates,loc).id'),2);
 w.candidates=[mk(1,'motorway',48.58,7.74),mk(2,'residential',48.58,7.74,true)];run('loc.spd=10;loc.brg=90;');ok('cap distingue les routes qui se croisent',run('Road723.choose(candidates,loc).id'),1);
 run('loc.brg=0;');ok('virage et nouveau cap changent la voie retenue',run('Road723.choose(candidates,loc).id'),2);
 w.candidates=[mk(1,'motorway',48.58,7.74,false,{oneway:'yes'}),mk(2,'residential',48.58,7.74,false,{oneway:'-1'})];run('loc.brg=270;');ok('sens unique distingue les chaussées opposées',run('Road723.choose(candidates,loc).id'),2);
 w.candidates=[mk(1,'motorway',48.58,7.74),mk(2,'residential',48.58002,7.74)];run('loc.brg=-1;Road723.match=null');ok('routes parallèles indiscernables indiquent une incertitude',run('Road723.choose(candidates,loc)'),null);
 run('loc.acc=150');ok('GPS imprécis rejeté',run('Road723.choose(candidates,loc)'),null);t.pos();run('loc.ts=Date.now()-31000');ok('GPS ancien rejeté',run('Road723.choose(candidates,loc)'),null);t.pos();
 w.candidates=[mk(1,'motorway',48.59,7.74)];ok('route trop éloignée rejetée',run('Road723.choose(candidates,loc)'),null);
 run("loc.spd=40;Road723.cache=[];Road723.at=0;geoA=null");ok('pas d’autoroute inventée par la seule vitesse',run('sceneWanted()'),'campagne');
 w.candidates=[mk(1,'motorway',48.58,7.74)];run('Road723.cache=candidates;Road723.pos={...loc};Road723.at=Date.now();loc.spd=0');ok('autoroute cartographiée reconnue à l’arrêt',run('sceneWanted()'),'autoroute');
 t.advance(61000);ok('route conservée depuis le cache proche',run('sceneWanted()'),'autoroute');ok('limitation ancienne masquée',run('limit'),null);t.advance(30*60000);ok('cache trop ancien abandonné',run('sceneWanted()'),'campagne');
 t.pos();t.setels([mk(1,'motorway',48.58,7.74)]);run('Road723.at=0;Road723.attempt=0');await run('Road723.refresh()');ok('réponse réseau appliquée',run('Road723.match.tags.highway'),'motorway');const requests=t.calls.length;await run('Road723.refresh()');ok('cache évite une seconde recherche au même endroit',t.calls.length,requests);ok('verrou réseau libéré',run('Road723.pending'),null);
 t.setoffline(true);t.advance(61000);await run('Road723.refresh()');ok('échec réseau conserve uniquement la route proche du GPS',run('Road723.match.tags.highway'),'motorway');ok('échec réseau masque la limitation devenue ancienne',run('limit'),null);t.pos(48.59,7.74);run('Road723.apply()');ok('une route en cache éloignée du GPS est abandonnée',run('Road723.match'),null);ok('échec réseau libère le verrou',run('Road723.pending'),null);t.setoffline(false);
 // Un pont HTTP qui ne rappelle jamais ne doit pas bloquer les détections suivantes.
 t.pos();t.advance(15000);run('window.savedJSON723=getJSON;getJSON=()=>new Promise(()=>{});Road723.at=0;Road723.attempt=0;');const pending=run('Road723.refresh()');
 const timeout=t.timers.filter(x=>x.ms===14000).at(-1);timeout.fn();await pending;ok('callback réseau absent libère le verrou après délai',run('Road723.pending'),null);run('getJSON=savedJSON723');
 // Toutes les pages de réglages : chargement, aide de rubrique et information de chaque ligne.
 run('gbLive=false;Settings720.query="";Settings720.filter="";');let pages=0,rows=0;
 const sizes=run('SETCATS.map(c=>c[1].length)');
 for(let ci=0;ci<sizes.length;ci++)for(let si=0;si<sizes[ci];si++){
  run(`tab='settings';setCat=${ci};setSub=${si};render();`);pages++;
  assert(w.document.querySelector('[data-help-section]'),'aide de rubrique '+ci+'/'+si);
  for(const row of w.document.querySelectorAll('[data-setting-row]')){rows++;assert(row.querySelector('button[aria-label^="Informations :"]'),'aide de réglage '+ci+'/'+si);}
 }
 ok('toutes les pages de paramètres parcourues',pages>50);ok('informations ajoutées à plus de 100 réglages',rows>100);
 run("setCat=SETCATS.findIndex(c=>c[0]==='Navigation');setSub=SETCATS[setCat][1].findIndex(c=>c[0]==='Panneaux et localités');render();");const btn=w.document.querySelector('button[aria-label^="Informations :"]');const action=btn.getAttribute('data-act'),snapshot=run('JSON.stringify(snapshot().data)');
 run(`act('${action}')`);ok('fenêtre d’aide ouverte',!!w.document.querySelector('[role="dialog"][aria-modal="true"]'));ok('aucune commande active dans l’illustration',w.document.querySelectorAll('[data-help723] [data-act]:not([data-act="help723:close"])').length,0);
 w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Tab',bubbles:true}));ok('focus conservé dans la fenêtre',w.document.querySelector('[data-help723]').contains(w.document.activeElement));
 run("act('help723:close')");ok('aide ne change pas les réglages',run('JSON.stringify(snapshot().data)'),snapshot);ok('aide fermée',w.document.querySelector('[data-help723]'),null);
 // Les aides D04 et D13–D50 montrent le vrai moteur de décor, sans écrire les préférences.
 const defs=run('Decor721.defs.map(d=>[d[0],d[1]])');
 for(const [id,group]of defs){run(`setCat=SETCATS.findIndex(c=>c[0]==='Navigation');setSub=SETCATS[setCat][1].findIndex(c=>c[0]===['Décor · Voiture','Décor · Route','Décor · Paysages','Décor · Ciel et météo','Décor · Animation et panneaux'][${group}]);render();`);
  const button=Array.from(w.document.querySelectorAll('button[aria-label^="Informations :"]')).find(b=>b.getAttribute('aria-label').startsWith('Informations : D'+String(id).padStart(2,'0')+' ·'));
  const before=run('JSON.stringify(snapshot().data)');run(`act('${button.getAttribute('data-act')}')`);
  const cv=w.document.querySelector('[data-help-decor723="'+id+'"] canvas');assert(cv,'aperçu D'+id);Object.defineProperty(cv,'clientWidth',{value:540,configurable:true});Object.defineProperty(cv,'clientHeight',{value:220,configurable:true});w.helpCanvas723=cv;run('RoadDecor721.draw(helpCanvas723,12,180,60)');assert.equal(run('JSON.stringify(snapshot().data)'),before,'aperçu sans modification D'+id);run("act('help723:close')");
 }
 ok('66 exemples de décor dessinés sans changer les préférences',defs.length,66);
 ok('noms de panneaux longs répartis sur deux lignes',run("PanelText723.lines('SAINT-MARTIN-LES-BELLEVILLE').length"),2);
 ok('panneaux 20 % plus grands par défaut',run('RoadOptions718.size()'),1.2);run("store.set('panelSize718',80)");ok('taille personnelle conservée',run('RoadOptions718.size()'),.8);
 const root=path.join(__dirname,'..');for(const file of fs.readdirSync(path.join(root,'sources_assets')).filter(n=>n.endsWith('.js')))new vm.Script(fs.readFileSync(path.join(root,'sources_assets',file),'utf8'),{filename:file});ok('syntaxe de tous les scripts applicatifs valide',true);
 fs.writeFileSync(path.join(__dirname,'AUDIT723.json'),JSON.stringify({pages,rows,emptySections:run('SETCATS.filter(c=>!c[1].length).map(c=>c[0])'),jsErrors:t.errors},null,2)+'\n');
 ok('aucune erreur JavaScript pendant les scénarios',t.errors,[]);t.dom.window.close();console.log('\n'+count+' vérifications 7.23 réussies.');
})().catch(e=>{console.error(e);process.exit(1);});
