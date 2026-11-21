/* Choix du décor à partir de la chaussée et de l'environnement cartographiés. */
(() => {
 'use strict';
 const settings = ['auto','ville','village','campagne','foret','autoroute'];
 const small = /^(village|hamlet)$/;
 const populated = /^(city|town|village|hamlet)$/;
 const typeTags = ['zone:traffic','maxspeed:type','source:maxspeed','zone:maxspeed','maxspeed'];
 const context = { at:0, pos:null, areas:[], places:[], pending:null, attempt:0 };
 // Le pont Android abandonne une requête après 17 s : rester en dessous.
 const CONTEXT_RADIUS=700, CONTEXT_REUSE=600;
 let active = null, candidate = null, confirmedAt = 0, sampled = null, sampledScene = null, manualBefore;
 const status = { reason:'', match:'', density:null, context:0, hint:'' };
 const distance = (a,b) => hav(a.lat,a.lon,b.lat,b.lon)*1000;
 const samePoint = (a,b) => a.lat===b.lat && a.lon===b.lon;
 const validLine = line => Array.isArray(line) && line.length>=2 && line.every(Place710.valid);
 const closed = line => line.length>=4 && samePoint(line[0],line[line.length-1]);
 const regulated = tags => !!tags && (/^(?:motorway|trunk)(?:_link)?$/.test(tags.highway) || tags.motorroad==='yes' || typeTags.some(key=>/^fr:expressway$/i.test(String(tags[key]||'').trim())));
 function areaKind(tags) {
  if (tags.boundary!=='administrative' && populated.test(tags.place)) return 'settlement';
  if (/^(residential|retail|commercial|industrial)$/.test(tags.landuse)) return 'built';
  if (tags.landuse==='forest' || tags.natural==='wood') return 'forest';
  return '';
 }
 function joinRings(members, role) {
  const lines = members.filter(m=>m.type==='way' && (m.role===role || role==='outer' && !m.role));
  if (lines.some(m=>!validLine(m.geometry))) return null;
  const remaining = lines.map(m=>m.geometry.slice()), rings=[];
  while (remaining.length) {
   let ring = remaining.pop();
   while (!closed(ring)) {
    const end=ring[ring.length-1];
    const i=remaining.findIndex(line=>samePoint(end,line[0]) || samePoint(end,line[line.length-1]));
    if(i<0) return null;
    const line=remaining.splice(i,1)[0];
    ring=ring.concat((samePoint(end,line[0]) ? line : line.reverse()).slice(1));
   }
   rings.push(ring);
  }
  return rings;
 }
 function polygon(points) {
  const bounds=[Infinity,Infinity,-Infinity,-Infinity];
  for(const p of points) {
   bounds[0]=Math.min(bounds[0],p.lat); bounds[1]=Math.min(bounds[1],p.lon);
   bounds[2]=Math.max(bounds[2],p.lat); bounds[3]=Math.max(bounds[3],p.lon);
  }
  return { points, bounds };
 }
 function contains(ring,p) {
  const [south,west,north,east]=ring.bounds;
  if(p.lat<south || p.lat>north || p.lon<west || p.lon>east) return false;
  let inside=false;
  for(let i=1;i<ring.points.length;i++) {
   const a=ring.points[i-1],b=ring.points[i];
   if((a.lat>p.lat)!==(b.lat>p.lat) && p.lon<(b.lon-a.lon)*(p.lat-a.lat)/(b.lat-a.lat)+a.lon) inside=!inside;
  }
  return inside;
 }
 function decode(elements) {
  const areas=[], places=[];
  for(const element of elements) {
   const tags=element.tags||{}, kind=areaKind(tags);
   if(element.type==='node' && populated.test(tags.place) && Place710.valid(element)) {
    places.push({lat:element.lat,lon:element.lon,kind:tags.place});
   } else if(kind) {
    let outer=[], inner=[];
    if(element.type==='way' && validLine(element.geometry) && closed(element.geometry)) outer=[element.geometry];
    if(element.type==='relation' && Array.isArray(element.members)) {
     outer=joinRings(element.members,'outer'); inner=joinRings(element.members,'inner');
    }
    if(outer?.length && inner) areas.push({kind,place:tags.place,outer:outer.map(polygon),inner:inner.map(polygon)});
   }
  }
  return {areas,places};
 }
 function roadZone(tags) {
  for(const key of typeTags) {
   const value=String(tags[key]||'').trim().toLowerCase();
   if(/^(?:[a-z]{2}:)?(?:urban|living_street|zone30)$/.test(value)) return 'urban';
   if(/^(?:[a-z]{2}:)?rural$/.test(value)) return 'rural';
  }
  return '';
 }
 // 7.36 : longueur de rues résidentielles autour de la position, calculée sur les
 // routes déjà chargées (aucune requête de plus). Une avenue de ville bordée de
 // rues reste reconnue même sans polygone d'occupation du sol à moins de 22 m.
 function clipped(ax,ay,bx,by,r) {
  const dx=bx-ax,dy=by-ay,a=dx*dx+dy*dy;if(!a)return 0;
  const b=2*(ax*dx+ay*dy),c=ax*ax+ay*ay-r*r,disc=b*b-4*a*c;if(disc<=0)return 0;
  const s=Math.sqrt(disc),t0=Math.max(0,(-b-s)/(2*a)),t1=Math.min(1,(-b+s)/(2*a));
  return t1>t0?(t1-t0)*Math.sqrt(a):0;
 }
 function streetDensity(p,radius=150) {
  const cache=Road723.cache,origin=Road723.pos;
  // Hors de la zone couverte par la dernière requête, la mesure serait sous-estimée.
  if(!Array.isArray(cache)||!cache.length||!Place710.valid(origin)||distance(p,origin)>450||!(Date.now()-Road723.at<30*60000))return null;
  const kx=111320*Math.cos(p.lat*Math.PI/180),ky=111320;let total=0;
  for(const e of cache) {
   if(!e.tags||!/^(residential|living_street)$/.test(e.tags.highway)||!Array.isArray(e.geometry))continue;
   for(let i=1;i<e.geometry.length;i++) {
    const a=e.geometry[i-1],b=e.geometry[i];if(!Place710.valid(a)||!Place710.valid(b))continue;
    total+=clipped((a.lon-p.lon)*kx,(a.lat-p.lat)*ky,(b.lon-p.lon)*kx,(b.lat-p.lat)*ky,radius);
   }
  }
  return total;
 }
 function nearbyPlace(p,list) {
  let nearest=null,score=Infinity;
  for(const place of list) {
   if(!Place710.valid(place))continue;
   const kind=place.kind||place.k,metres=distance(p,place),radius=kind==='city'?2500:kind==='town'?1500:750;
   if(metres<=radius&&metres<score){nearest=kind;score=metres;}
  }
  return nearest;
 }
 function placesList() {
  // Liste des centres déjà chargée pour les panneaux (Place710), réutilisée si récente.
  if(typeof plList==='undefined'||!Array.isArray(plList)||!Place710.valid(plPos)||!Number.isFinite(plAt))return [];
  if(Date.now()-plAt<0||Date.now()-plAt>Math.max(300000,Place710.every()*3)||distance(loc,plPos)>5000)return [];
  return plList;
 }
 function environment(p, match, data, density) {
  // Sans chaussée reconnue (requête absente ou routes parallèles indiscernables),
  // l'environnement reste évalué par les zones et les rues ; jamais d'autoroute.
  const tags=match?match.tags:{};
  if (match && regulated(tags)) return 'autoroute';
  if (density===undefined) density=streetDensity(p);
  const zone=roadZone(tags);
  const segment=match?Road723.segment(p,match.geometry):null;
  // A road can divide two land-use polygons. Check close to the road on both sides too.
  const points=[p];
  if(segment) {
   const bearing=(segment.bearing+90)*Math.PI/180;
   const latStep=22*Math.cos(bearing)/111320;
   const lonStep=22*Math.sin(bearing)/(111320*Math.max(.1,Math.cos(p.lat*Math.PI/180)));
   points.push({lat:p.lat+latStep,lon:p.lon+lonStep},{lat:p.lat-latStep,lon:p.lon-lonStep});
  }
  const areasAt=(point,kind)=>data.areas.filter(area=>area.kind===kind && area.outer.some(ring=>contains(ring,point)) && !area.inner.some(ring=>contains(ring,point)));
  const settlement=areasAt(p,'settlement')[0];
  const speed=parseMax(tags.maxspeed);
  const streets=Number.isFinite(density) && (density>=450 || (density>=200 && Number.isFinite(speed) && speed>0 && speed<=50));
  const built=zone==='urban' || (zone!=='rural' && (settlement || points.some(point=>areasAt(point,'built').length) || /^(residential|living_street)$/.test(tags.highway) || streets));
  if(built) {
   if(settlement) return small.test(settlement.place)?'village':'ville';
   const nearest=nearbyPlace(p,data.places)||nearbyPlace(p,placesList());
   if(nearest) return small.test(nearest)?'village':'ville';
   const here=Place710.here(.2);
   return here && small.test(here.kind)?'village':'ville';
  }
  if(areasAt(p,'forest').length || (points.length===3 && points.slice(1).every(point=>areasAt(point,'forest').length))) return 'foret';
  return 'campagne';
 }
 function usable(p) {
  const age=p && Date.now()-p.ts;
  return Road723.fresh(p) && age>=0 && age<=12000 && Number.isFinite(p.acc) && p.acc>=0 && p.acc<=45;
 }
 async function refresh() {
  if(DEMO || !usable(loc) || context.pending || store.get('roadScene','auto')!=='auto') return;
  const now=Date.now();
  // Renouveler le contexte avant qu'il devienne inutilisable (150 s / 850 m).
  // Un trajet lent en ville ne doit pas rester bloqué sur un ancien paysage.
  if(context.at && context.pos && now-context.at<60000 && distance(loc,context.pos)<350) return;
  if(context.attempt && now-context.attempt<15000) return;
  const p={lat:loc.lat,lon:loc.lon}, lat=p.lat.toFixed(6), lon=p.lon.toFixed(6);
  // 7.36 : rayon réduit (1200 → 700 m). En ville, la réponse complète dépassait
  // souvent le délai du serveur : le décor restait alors sur Campagne.
  const around=`around:${CONTEXT_RADIUS},${lat},${lon}`;
  const filters=['[landuse~"^(residential|retail|commercial|industrial|forest)$"]','[natural=wood]','[place~"^(city|town|village|hamlet)$"][boundary!="administrative"]'];
  const query=`[out:json][timeout:13];is_in(${lat},${lon})->.containing;(${filters.map(f=>`wr(${around})${f};way(pivot.containing)${f};rel(pivot.containing)${f};`).join('')}`+
   `node(around:3500,${lat},${lon})[place~"^(city|town|village|hamlet)$"];);out geom;`;
  context.attempt=now;
  let timer;
  context.pending=(async()=>{
   try {
    const data=await Promise.race([getJSON('https://overpass-api.de/api/interpreter?data='+encodeURIComponent(query)),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),16500);})]);
    if(!Array.isArray(data.elements) || data.remark || !usable(loc) || distance(loc,p)>CONTEXT_REUSE) return;
    Object.assign(context,decode(data.elements),{pos:p,at:Date.now()});
    sampled=null; RoadLoop725.invalidate();
   }catch(e){ /* Keep the previous map context only within its time and distance limits. */ }
   finally{clearTimeout(timer);context.pending=null;}
  })();
  return context.pending;
 }
 function pick() {
  const manual=store.get('roadScene','auto');
  if(manual!==manualBefore) { active=null; candidate=null; sampled=null; manualBefore=manual; }
  if(manual!=='auto' && settings.includes(manual)) return manual;
  const now=Date.now();
  // GPS dégradé (immeubles, tunnel) ou données cartographiques absentes : conserver le
  // dernier décor confirmé (5 min en 7.37) plutôt que de retomber sur Campagne.
  const keepFor=300000;
  if(!usable(loc)) {
   candidate=null; sampled=null; status.reason='GPS imprécis ou ancien : décor précédent conservé';
   if(now-confirmedAt>keepFor) active=null;
   return active||'campagne';
  }
  const key=[loc.ts,loc.lat,loc.lon,loc.brg,loc.acc,Road723.at,context.at,plAt].join('|');
  if(sampled===key) {
   if(!sampledScene && now-confirmedAt>keepFor) active=null;
   return active||'campagne';
  }
  sampled=key;
  Road723.apply();
  const map=context.pos && now-context.at<=150000 && distance(loc,context.pos)<CONTEXT_REUSE?context:{areas:[],places:[]};
  const match=Road723.match,density=streetDensity(loc);
  // Sans route reconnue ni rues ni zones chargées, rien ne permet de trancher.
  const informed=!!match || density!==null || map.areas.length>0;
  let next=informed?environment(loc,match,map,density):null,hint=null;
  // 7.37 : sans aucune donnée Overpass, type de la voie la plus proche donné par
  // l'adresse Nominatim (autoroute ou rue résidentielle), récent et à moins de 1 km.
  if(!informed&&typeof window.RoadHint737==='function'){hint=RoadHint737(loc);if(hint)next=hint.kind==='autoroute'?'autoroute':environment(loc,null,map,450);}
  sampledScene=next;
  status.match=match?match.tags.highway:'';status.density=density;status.context=map.areas.length;status.hint=hint?hint.type:'';
  if(!next) {
   candidate=null; status.reason='Données cartographiques absentes : décor précédent conservé';
   if(now-confirmedAt>keepFor) active=null;
   return active||'campagne';
  }
  confirmedAt=loc.ts;
  // Une conclusion sans chaussée reconnue ne fait pas quitter l'autoroute
  // immédiatement (échangeurs, routes parallèles) : 6 s de confirmation.
  const weak=!match, confirm=weak&&active==='autoroute'?6000:1000;
  if(!active || next===active || (!weak && (next==='autoroute' || active==='autoroute'))) {
   active=next; candidate=null;
  } else if(!candidate || candidate.scene!==next) {
   candidate={scene:next,stamp:loc.ts};
  } else if(loc.ts-candidate.stamp>=confirm) {
   active=next; candidate=null;
  }
  status.reason=(match?'Route '+match.tags.highway:'Route non identifiée')+(density!==null?' · rues '+Math.round(density)+' m':'')+(map.areas.length?' · '+map.areas.length+' zones':'')+(hint?' · indice adresse : '+hint.type:'');
  return active;
 }
 window.RoadScene731={regulated,decode,environment,refresh,context,streetDensity,status};
 window.roadScene=pick;
 // Le changement de position est la source de vérité : solliciter les deux
 // rafraîchissements sans multiplier les requêtes (leurs garde-fous restent actifs).
 const oldApply=Road723.apply;
 Road723.apply=function(){
  const result=oldApply.apply(this,arguments);
  if(!context.pending && store.get('roadScene','auto')==='auto' && usable(loc))refresh();
  return result;
 };
 // The road matching cache still supplies limits and geometry. This request only adds terrain.
 const refreshRoad=window.maybeLimit;
 window.maybeLimit=function(){if(tab==='home')refresh();return refreshRoad.apply(this,arguments);};
 const act=window.act;
 window.act=function(action){if(action==='road723:refresh')refresh();return act.apply(this,arguments);};
})();
