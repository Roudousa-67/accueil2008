/* Choix du décor à partir de la chaussée et de l'environnement cartographiés. */
(() => {
 'use strict';
 const settings = ['auto','ville','village','campagne','foret','autoroute'];
 const small = /^(village|hamlet)$/;
 const populated = /^(city|town|village|hamlet)$/;
 const typeTags = ['zone:traffic','maxspeed:type','source:maxspeed','zone:maxspeed','maxspeed'];
 const context = { at:0, pos:null, areas:[], places:[], pending:null, attempt:0 };
 let active = null, candidate = null, confirmedAt = 0, sampled = null, sampledScene = null, manualBefore;
 const distance = (a,b) => hav(a.lat,a.lon,b.lat,b.lon)*1000;
 const samePoint = (a,b) => a.lat===b.lat && a.lon===b.lon;
 const validLine = line => Array.isArray(line) && line.length>=2 && line.every(Place710.valid);
 const closed = line => line.length>=4 && samePoint(line[0],line[line.length-1]);
 const regulated = tags => !!tags && (/^motorway(?:_link)?$/.test(tags.highway) || tags.motorroad==='yes' || typeTags.some(key=>/^fr:expressway$/i.test(String(tags[key]||'').trim())));
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
 function environment(p, match, data) {
  if (!match) return null;
  const tags=match.tags;
  if (regulated(tags)) return 'autoroute';
  const zone=roadZone(tags);
  const segment=Road723.segment(p,match.geometry);
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
  const built=zone==='urban' || (zone!=='rural' && (settlement || points.some(point=>areasAt(point,'built').length) || /^(residential|living_street)$/.test(tags.highway)));
  if(built) {
   if(settlement) return small.test(settlement.place)?'village':'ville';
   let nearest=null, score=Infinity;
   for(const place of data.places) {
    const metres=distance(p,place), radius=place.kind==='city'?2500:place.kind==='town'?1500:750;
    if(metres<=radius && metres<score) { nearest=place; score=metres; }
   }
   if(nearest) return small.test(nearest.kind)?'village':'ville';
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
  if(context.at && context.pos && now-context.at<90000 && distance(loc,context.pos)<500) return;
  if(context.attempt && now-context.attempt<15000) return;
  const p={lat:loc.lat,lon:loc.lon}, lat=p.lat.toFixed(6), lon=p.lon.toFixed(6);
  const around=`around:1200,${lat},${lon}`;
  const filters=['[landuse~"^(residential|retail|commercial|industrial|forest)$"]','[natural=wood]','[place~"^(city|town|village|hamlet)$"][boundary!="administrative"]'];
  const query=`[out:json][timeout:10];is_in(${lat},${lon})->.containing;(${filters.map(f=>`wr(${around})${f};way(pivot.containing)${f};rel(pivot.containing)${f};`).join('')}`+
   `node(around:3500,${lat},${lon})[place~"^(city|town|village|hamlet)$"];);out geom;`;
  context.attempt=now;
  let timer;
  context.pending=(async()=>{
   try {
    const data=await Promise.race([getJSON('https://overpass-api.de/api/interpreter?data='+encodeURIComponent(query)),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),14000);})]);
    if(!Array.isArray(data.elements) || data.remark || !usable(loc) || distance(loc,p)>850) return;
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
  const keepFor=active==='autoroute'?4000:8000;
  if(!usable(loc)) {
   candidate=null; sampled=null;
   if(now-confirmedAt>keepFor) active=null;
   return active||'campagne';
  }
  const key=[loc.ts,loc.lat,loc.lon,loc.brg,loc.acc,Road723.at,context.at].join('|');
  if(sampled===key) {
   if(!sampledScene && now-confirmedAt>keepFor) active=null;
   return active||'campagne';
  }
  sampled=key;
  Road723.apply();
  const map=context.pos && now-context.at<=150000 && distance(loc,context.pos)<850?context:{areas:[],places:[]};
  const next=sampledScene=environment(loc,Road723.match,map);
  if(!next) {
   candidate=null;
   if(now-confirmedAt>keepFor) active=null;
   return active||'campagne';
  }
  confirmedAt=loc.ts;
  if(!active || next===active || next==='autoroute' || active==='autoroute') {
   active=next; candidate=null;
  } else if(!candidate || candidate.scene!==next) {
   candidate={scene:next,stamp:loc.ts};
  } else if(loc.ts-candidate.stamp>=1000) {
   active=next; candidate=null;
  }
  return active;
 }
 window.RoadScene731={regulated,decode,environment,refresh,context};
 window.roadScene=pick;
 // The road matching cache still supplies limits and geometry. This request only adds terrain.
 const refreshRoad=window.maybeLimit;
 window.maybeLimit=function(){if(tab==='home')refresh();return refreshRoad.apply(this,arguments);};
 const act=window.act;
 window.act=function(action){if(action==='road723:refresh')refresh();return act.apply(this,arguments);};
})();
