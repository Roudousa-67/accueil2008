/* 7.61 : alertes de la route (reprises de la 7.51, seules cette fois).
   ZFE avec ta vignette Crit'Air, tunnel devant (feux), aires de repos et leurs services, ce qu'il y a à la
   prochaine sortie. Données OpenStreetMap (Overpass), demandées seulement quand c'est utile (en roulant, sur
   autoroute pour les aires et sorties) et pas plus d'une fois toutes les quelques minutes.
   Réglages : GPS et navigation › Alertes de la route. Chaque alerte se coupe là ou dans Nouveautés à tester. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 const OVERPASS = 'https://overpass-api.de/api/interpreter?data=';
 const op = q => getJSON(OVERPASS + encodeURIComponent('[out:json][timeout:15];' + q));
 const LIST = [
  ['zfe761', 'Zones à faibles émissions (ZFE)', 'Alerte avant d’entrer dans une ZFE, avec ta vignette Crit’Air.'],
  ['tunnel761', 'Tunnel devant : feux', 'Rappel d’allumer les feux avant chaque tunnel.'],
  ['aire761', 'Aires de repos utiles', 'Sur autoroute : la prochaine aire et ses services (WC, resto, douche, jeux).'],
  ['sortie761', 'Ce qu’il y a à la sortie', 'Sur autoroute : un commerce utile près de la prochaine sortie.'],
 ];
 if (window.Try750) LIST.forEach(([id, l, d]) => Try750.register(id, l, d, '7.61'));
 const on = id => (!window.Try750 || Try750.on(id)) && store.get('on_' + id, true) !== false;
 const here = () => (typeof loc !== 'undefined' && loc && Number.isFinite(loc.lat) && Date.now() - (loc.ts || 0) < 15000) ? loc : null;
 const rad = x => x * Math.PI / 180;
 const dist = (a, b, c, d) => { const x = rad(c - a), y = rad(d - b), h = Math.sin(x / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(y / 2) ** 2; return 12742 * Math.asin(Math.sqrt(h)); };
 const brg = (a, b, c, d) => { const y = Math.sin(rad(d - b)) * Math.cos(rad(c)), x = Math.cos(rad(a)) * Math.sin(rad(c)) - Math.sin(rad(a)) * Math.cos(rad(c)) * Math.cos(rad(d - b)); return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360; };
 let heading = null;
 const head = () => { const l = here(); if (l && Number.isFinite(l.brg) && l.brg >= 0 && (l.spd || 0) > 8) heading = l.brg; return heading; };
 // Distance (km) et angle par rapport au sens de marche d'un point.
 function ahead(lat, lon) { const l = here(), h = head(); if (!l) return null; const d = dist(l.lat, l.lon, lat, lon), r = h == null ? 0 : ((brg(l.lat, l.lon, lat, lon) - h + 540) % 360) - 180; return { d, rel: r }; }
 function project(lat, lon, b, km) { const R = 6371, d = km / R, br = rad(b), a1 = rad(lat), o1 = rad(lon), a2 = Math.asin(Math.sin(a1) * Math.cos(d) + Math.cos(a1) * Math.sin(d) * Math.cos(br)), o2 = o1 + Math.atan2(Math.sin(br) * Math.sin(d) * Math.cos(a1), Math.cos(d) - Math.sin(a1) * Math.sin(a2)); return [a2 * 180 / Math.PI, o2 * 180 / Math.PI]; }
 const alert = (src, a) => safe(() => V740.setAlert(src, a));
 const speed = () => safe(() => curSpeed().v, 0) || 0;
 const moving = () => speed() > 5;
 const S = { zfe: { at: 0, pos: null, zones: [], inside: null }, tun: { at: 0, pos: null, list: [], shown: '' }, aire: { at: 0, pos: null, list: [], cur: null, svc: {} }, sortie: { id: '', poi: null }, errors: [] };
 const err = (k, e) => { S.errors.push(k + ' : ' + String(e && e.message || e).slice(0, 60)); if (S.errors.length > 10) S.errors.shift(); };
 const movedFar = (pos, km) => { const l = here(); return !pos || !l || dist(pos[0], pos[1], l.lat, l.lon) > km; };

 // ---------- 7. ZFE ----------
 function inPoly(lat, lon, ring) { let ins = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [ya, xa] = ring[i], [yb, xb] = ring[j]; if ((ya > lat) !== (yb > lat) && lon < (xb - xa) * (lat - ya) / (yb - ya) + xa) ins = !ins; } return ins; }
 function zoneAt(lat, lon) { return S.zfe.zones.find(z => z.rings.some(r => inPoly(lat, lon, r))) || null; }
 async function zfeFetch() {
  const l = here(); if (!l || S.zfe.busy || (Date.now() - S.zfe.at < 1800000 && !movedFar(S.zfe.pos, 8))) return;
  S.zfe.busy = true; S.zfe.at = Date.now(); S.zfe.pos = [l.lat, l.lon];
  try {
   const j = await op(`relation["boundary"="low_emission_zone"](around:12000,${l.lat.toFixed(4)},${l.lon.toFixed(4)});out geom;`);
   S.zfe.zones = (j.elements || []).map(r => ({ id: r.id, name: (r.tags && (r.tags.name || r.tags['name:fr'])) || 'ZFE', rings: (r.members || []).filter(m => m.role !== 'inner' && Array.isArray(m.geometry) && m.geometry.length > 2).map(m => m.geometry.map(g => [g.lat, g.lon])) })).filter(z => z.rings.length);
  } catch (e) { err('ZFE', e); } finally { S.zfe.busy = false; }
 }
 const critair = () => store.get('critair761', '');
 function zfeCheck() {
  if (!on('zfe761')) return alert('zfe761', null);
  const l = here(); if (!l) return; zfeFetch();
  const z = zoneAt(l.lat, l.lon), h = head();
  let soon = null; if (!z && h != null && moving()) for (const km of [.4, .8]) { const [a, b] = project(l.lat, l.lon, h, km); const zz = zoneAt(a, b); if (zz) { soon = { z: zz, km }; break; } }
  const vig = critair(), my = vig === '' ? 'règle ta vignette dans les réglages' : vig === '0' ? 'ta voiture : Crit’Air 0 (électrique)' : vig === 'nc' ? 'ta voiture : non classée' : 'ta voiture : Crit’Air ' + vig;
  if (!S.zfe.seen) { if (!S.zfe.at || S.zfe.busy) return; S.zfe.seen = true; if (z) { S.zfe.inside = z.id; return; } }
  if (z) { if (S.zfe.inside !== z.id) { S.zfe.inside = z.id; alert('zfe761', { key: 'zfe:' + z.id + ':' + new Date().toDateString(), priority: 5, color: '#2e7d32', icon: '🌿', hours: 6, title: 'Zone à faibles émissions', text: `ZFE ${z.name} · ${my}`, detail: () => `<p style="font-size:18px">Tu es dans la <b>${esc(z.name)}</b>.</p><p>${esc(my)}.</p><p>Les vignettes admises et les horaires changent selon la ville et l’année : vérifie la règle du moment sur le site de la ville ou sur certificat-air.gouv.fr.</p>` }); } }
  else if (soon) S.zfe.soon = true, alert('zfe761', { key: 'zfesoon:' + soon.z.id + ':' + new Date().toDateString(), priority: 5, color: '#2e7d32', icon: '🌿', hours: 6, title: 'Zone à faibles émissions', text: `ZFE ${soon.z.name} dans ${Math.round(soon.km * 1000)} m · ${my}` });
  else if (S.zfe.inside || S.zfe.soon) { S.zfe.inside = null; S.zfe.soon = false; alert('zfe761', null); }
 }

 // ---------- 8. Tunnel devant ----------
 async function tunFetch() {
  const l = here(); if (!l || S.tun.busy || speed() < 30 || (Date.now() - S.tun.at < 60000 || (Date.now() - S.tun.at < 300000 && !movedFar(S.tun.pos, 2)))) return;
  S.tun.busy = true; S.tun.at = Date.now(); S.tun.pos = [l.lat, l.lon];
  try {
   const j = await op(`way["tunnel"="yes"]["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|motorway_link|trunk_link|primary_link|secondary_link)$"](around:3000,${l.lat.toFixed(4)},${l.lon.toFixed(4)});out geom tags;`);
   S.tun.list = (j.elements || []).filter(w => Array.isArray(w.geometry) && w.geometry.length > 1).map(w => ({ id: w.id, name: (w.tags && w.tags.name) || '', ends: [w.geometry[0], w.geometry[w.geometry.length - 1]], len: w.geometry.reduce((n, g, i, a) => i ? n + dist(a[i - 1].lat, a[i - 1].lon, g.lat, g.lon) : 0, 0) })).filter(t => t.len > .08);
  } catch (e) { err('tunnels', e); } finally { S.tun.busy = false; }
 }
 function tunCheck() {
  if (!on('tunnel761')) return alert('tunnel761', null);
  tunFetch();
  let best = null;
  for (const t of S.tun.list) for (const e of t.ends) { const a = ahead(e.lat, e.lon); if (a && a.d > .05 && a.d < .9 && Math.abs(a.rel) < 25 && (!best || a.d < best.a.d)) best = { t, a }; }
  if (best && best.a.d <= .7) { const m = Math.max(50, Math.round(best.a.d * 1000 / 50) * 50); alert('tunnel761', { key: 'tun:' + best.t.id + ':' + Math.floor(Date.now() / 600000), priority: 6, color: '#37474f', icon: '🚇', hours: .2, title: 'Tunnel devant', text: `Tunnel dans ${m} m : allume tes feux`, detail: () => `<p style="font-size:18px">${best.t.name ? '<b>' + esc(best.t.name) + '</b> · ' : ''}${(best.t.len).toFixed(1).replace('.', ',')} km de tunnel.</p><p>Allume tes feux de croisement avant d’entrer.</p>` }); S.tun.shown = best.t.id; }
  else if (S.tun.shown) { S.tun.shown = ''; alert('tunnel761', null); }
 }

 // ---------- 9. Aires de repos utiles ----------
 const onMotorway = () => safe(() => !!(Highway738.state.next || Highway738.state.onSince), false);
 const SVC = [['toilets', 'WC'], ['restaurant', 'resto'], ['fast_food', 'restauration rapide'], ['cafe', 'café'], ['shower', 'douche'], ['fuel', 'carburant'], ['charging_station', 'recharge'], ['playground', 'aire de jeux'], ['picnic_table', 'pique-nique']];
 async function aireFetch() {
  const l = here(); if (!l || S.aire.busy || !onMotorway() || (Date.now() - S.aire.at < 300000 && !movedFar(S.aire.pos, 8))) return;
  S.aire.busy = true; S.aire.at = Date.now(); S.aire.pos = [l.lat, l.lon];
  try {
   const j = await op(`nwr["highway"~"^(rest_area|services)$"](around:25000,${l.lat.toFixed(4)},${l.lon.toFixed(4)});out center tags;`);
   S.aire.list = (j.elements || []).map(e => ({ id: e.type + e.id, lat: e.lat || (e.center && e.center.lat), lon: e.lon || (e.center && e.center.lon), name: (e.tags && e.tags.name) || (e.tags && e.tags.highway === 'services' ? 'Aire de services' : 'Aire de repos'), tags: e.tags || {} })).filter(a => Number.isFinite(a.lat));
  } catch (e) { err('aires', e); } finally { S.aire.busy = false; }
 }
 async function svcFetch(a) {
  if (S.aire.svc[a.id]) return;
  S.aire.svc[a.id] = { list: [], busy: true };
  const set = new Set(); for (const [k] of SVC) if (a.tags[k] === 'yes') set.add(k);
  if (a.tags.highway === 'services') set.add('fuel');
  try {
   const j = await op(`(nwr(around:450,${a.lat.toFixed(5)},${a.lon.toFixed(5)})["amenity"~"^(toilets|restaurant|fast_food|cafe|shower|fuel|charging_station)$"];nwr(around:450,${a.lat.toFixed(5)},${a.lon.toFixed(5)})["leisure"="playground"];nwr(around:300,${a.lat.toFixed(5)},${a.lon.toFixed(5)})["leisure"="picnic_table"];);out tags;`);
   for (const e of j.elements || []) { const t = e.tags || {}; if (t.amenity) set.add(t.amenity); if (t.leisure) set.add(t.leisure); }
  } catch (e) { err('services', e); }
  S.aire.svc[a.id] = { list: SVC.filter(([k]) => set.has(k)).map(x => x[1]), busy: false };
 }
 function aireCheck() {
  if (!on('aire761') || !onMotorway()) { if (S.aire.cur) { S.aire.cur = null; alert('aire761', null); } return; }
  aireFetch();
  let best = null; for (const a of S.aire.list) { const p = ahead(a.lat, a.lon); if (p && p.d > .3 && p.d < 15 && Math.abs(p.rel) < 35 && (!best || p.d < best.p.d)) best = { a, p }; }
  if (!best) { if (S.aire.cur) { S.aire.cur = null; alert('aire761', null); } return; }
  svcFetch(best.a);
  const svc = (S.aire.svc[best.a.id] || {}).list || [], km = Math.max(1, Math.round(best.p.d));
  S.aire.cur = best.a.id;
  alert('aire761', { key: 'aire:' + best.a.id, priority: 2, color: '#00796b', icon: '🅿', hours: 1, title: best.a.name, text: `${best.a.name} · ${km} km${svc.length ? ' : ' + svc.slice(0, 4).join(' · ') : ''}`, detail: () => `<p style="font-size:18px"><b>${esc(best.a.name)}</b> dans ${km} km.</p><p>${svc.length ? 'Services : ' + esc(svc.join(', ')) + '.' : 'Services non renseignés sur la carte.'}</p>` });
 }

 // ---------- 10. Ce qu'il y a à la prochaine sortie ----------
 const POI = { bakery: ['boulangerie', 'nwr(around:1500,LAT,LON)["shop"="bakery"];'], mcdo: ['McDo', 'nwr(around:3000,LAT,LON)["amenity"="fast_food"]["brand"~"McDonald",i];'], pharmacy: ['pharmacie', 'nwr(around:2000,LAT,LON)["amenity"="pharmacy"];'], supermarket: ['supermarché', 'nwr(around:2000,LAT,LON)["shop"="supermarket"];'] };
 const poiKind = () => store.get('exitPoi761', 'bakery');
 async function sortieCheck() {
  if (!on('sortie761')) return alert('sortie761', null);
  const x = safe(() => Highway738.state.next, null), kind = poiKind();
  if (!x || !Number.isFinite(x.lat) || !POI[kind]) { if (S.sortie.id) { S.sortie.id = ''; alert('sortie761', null); } return; }
  const id = x.id + ':' + kind;
  if (S.sortie.id !== id) {
   if (x.d > 8) return;
   S.sortie.id = id; S.sortie.poi = null;
   try {
    const j = await op('(' + POI[kind][1].replace(/LAT/g, x.lat.toFixed(5)).replace(/LON/g, x.lon.toFixed(5)) + ');out center tags;');
    const list = (j.elements || []).map(e => ({ name: (e.tags && (e.tags.name || e.tags.brand)) || POI[kind][0], hours: (e.tags && e.tags.opening_hours) || '', d: dist(x.lat, x.lon, e.lat || e.center.lat, e.lon || e.center.lon) })).sort((a, b) => a.d - b.d);
    if (S.sortie.id === id) S.sortie.poi = list[0] || { none: true };
   } catch (e) { err('sortie', e); }
  }
  const p = S.sortie.poi;
  if (!p || p.none || x.d > 4) { alert('sortie761', null); return; }
  const ref = x.ref ? 'Sortie ' + x.ref : 'Prochaine sortie', m = p.d < 1 ? Math.round(p.d * 1000 / 50) * 50 + ' m' : p.d.toFixed(1).replace('.', ',') + ' km';
  alert('sortie761', { key: 'sortie:' + id, priority: 2, color: '#6d4c41', icon: kind === 'bakery' ? '🥖' : kind === 'mcdo' ? '🍔' : kind === 'pharmacy' ? '💊' : '🛒', hours: 1, title: ref, text: `${ref} : ${POI[kind][0]} à ${m}`, detail: () => `<p style="font-size:18px"><b>${esc(p.name)}</b> à ${m} de la ${esc(ref.toLowerCase())}.</p>${p.hours ? `<p>Horaires : ${esc(p.hours)}</p>` : ''}` });
 }

 // Boucle : toutes les 3 s, seulement avec une position récente.
 setInterval(() => { if (!here()) return; safe(zfeCheck); safe(tunCheck); safe(aireCheck); safe(sortieCheck); }, 3000);

 // ---------- Réglages : GPS et navigation › Alertes de la route ----------
 function settings(p) {
  const tog = (id, l, d) => setRow(p, l, d, chipBtn(p, 'r761:on:' + id + ':1', 'Oui', store.get('on_' + id, true) !== false) + chipBtn(p, 'r761:on:' + id + ':0', 'Non', store.get('on_' + id, true) === false));
  const vig = critair();
  return LIST.map(([id, l, d]) => tog(id, l, d)).join('')
   + setRow(p, 'Ta vignette Crit’Air', 'Pour les zones à faibles émissions.', [['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['nc', 'Non classée']].map(([k, l]) => chipBtn(p, 'r761:crit:' + k, l, vig === k)).join(''))
   + setRow(p, 'À la prochaine sortie, chercher', 'Sur autoroute, quand la sortie approche.', Object.entries(POI).map(([k, v]) => chipBtn(p, 'r761:poi:' + k, v[0], poiKind() === k)).join(''));
 }
 const cat = SETCATS.find(c => c[0] === 'GPS et navigation') || SETCATS.find(c => c[0] === 'Navigation');
 if (cat && !cat[1].some(s => s[0] === 'Alertes de la route')) { const i = cat[1].findIndex(s => s[0] === 'Zones de danger'); cat[1].splice(i >= 0 ? i + 1 : cat[1].length, 0, ['Alertes de la route', settings]); safe(() => { Settings720.index = null; }); }
 const act0 = window.act;
 window.act = function (a) {
  if (typeof a === 'string' && a.startsWith('r761:')) {
   const [, op2, k, v] = a.split(':');
   if (op2 === 'on') { store.set('on_' + k, v === '1'); if (v !== '1') alert(k, null); }
   else if (op2 === 'crit') store.set('critair761', k);
   else if (op2 === 'poi') { store.set('exitPoi761', k); S.sortie.id = ''; }
   render(); return;
  }
  return act0.apply(this, arguments);
 };
 window.Route761 = { S, zoneAt, inPoly, ahead, project, zfeCheck, tunCheck, aireCheck, sortieCheck, settings, reportLines: () => ['== Alertes de la route 7.61 ==', `ZFE : ${S.zfe.zones.length} zone(s) chargée(s)`, `Tunnels proches : ${S.tun.list.length}`, `Aires : ${S.aire.list.length}`, ...S.errors] };
})();
