/* 7.51 : alertes de la route et décor vivant.
   ZFE (zones à faibles émissions), tunnel devant (feux), aires de repos avec leurs services, ce qu'il y a à la
   prochaine sortie, monuments à l'horizon, trafic réel dans le décor, panneau de limitation planté au bord de la
   route, panneau d'entrée de département. Données : OpenStreetMap (Overpass), TomTom pour le trafic. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 const OVERPASS = 'https://overpass-api.de/api/interpreter?data=';
 const op = q => getJSON(OVERPASS + encodeURIComponent('[out:json][timeout:15];' + q));
 const LIST = [
  ['zfe751', 'Zones à faibles émissions', 'Alerte en entrant dans une ZFE, avec ta vignette Crit’Air.'],
  ['tunnel751', 'Tunnel devant : feux', 'Rappel d’allumer les feux avant chaque tunnel.'],
  ['aire751', 'Aires de repos utiles', 'Sur autoroute : la prochaine aire et ses services (WC, resto, douche, jeux).'],
  ['sortie751', 'Ce qu’il y a à la sortie', 'Sur autoroute : un commerce utile près de la prochaine sortie.'],
  ['monu751', 'Monuments à l’horizon', 'En ville, les silhouettes des lieux connus apparaissent dans le décor.'],
  ['traf751', 'Trafic réel dans le décor', 'Plus de voitures dans le décor quand ça bouchonne (clé TomTom).'],
  ['limit751', 'Panneau de limitation planté', 'Quand la limite change, le panneau défile au bord de la route du décor.'],
  ['dep751', 'Panneau d’entrée de département', 'En changeant de département, un panneau défile dans le décor.'],
  ['group751', 'Alertes regroupées', 'Une seule pastille regroupe les alertes au lieu de les empiler.'],
 ];
 if (window.Try750) LIST.forEach(([id, l, d]) => Try750.register(id, l, d, '7.51'));
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
 const S = { zfe: { at: 0, pos: null, zones: [], inside: null }, tun: { at: 0, pos: null, list: [], shown: '' }, aire: { at: 0, pos: null, list: [], cur: null, svc: {} }, sortie: { id: '', poi: null }, monu: { at: 0, pos: null, list: [] }, dep: { code: '', name: '' }, lim: { v: null }, errors: [] };
 const err = (k, e) => { S.errors.push(k + ' : ' + String(e && e.message || e).slice(0, 60)); if (S.errors.length > 10) S.errors.shift(); };
 const movedFar = (pos, km) => { const l = here(); return !pos || !l || dist(pos[0], pos[1], l.lat, l.lon) > km; };

 // ---------- 7. ZFE ----------
 function inPoly(lat, lon, ring) { let ins = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [ya, xa] = ring[i], [yb, xb] = ring[j]; if ((ya > lat) !== (yb > lat) && lon < (xb - xa) * (lat - ya) / (yb - ya) + xa) ins = !ins; } return ins; }
 function zoneAt(lat, lon) { return S.zfe.zones.find(z => z.rings.some(r => inPoly(lat, lon, r))) || null; }
 async function zfeFetch() {
  const l = here(); if (!l || S.zfe.busy || (Date.now() - S.zfe.at < 300000 && !movedFar(S.zfe.pos, 5))) return;
  S.zfe.busy = true; S.zfe.at = Date.now(); S.zfe.pos = [l.lat, l.lon];
  try {
   const j = await op(`relation["boundary"="low_emission_zone"](around:12000,${l.lat.toFixed(4)},${l.lon.toFixed(4)});out geom;`);
   S.zfe.zones = (j.elements || []).map(r => ({ id: r.id, name: (r.tags && (r.tags.name || r.tags['name:fr'])) || 'ZFE', rings: (r.members || []).filter(m => m.role !== 'inner' && Array.isArray(m.geometry) && m.geometry.length > 2).map(m => m.geometry.map(g => [g.lat, g.lon])) })).filter(z => z.rings.length);
  } catch (e) { err('ZFE', e); } finally { S.zfe.busy = false; }
 }
 const critair = () => store.get('critair751', '');
 function zfeCheck() {
  if (!on('zfe751')) return alert('zfe751', null);
  const l = here(); if (!l) return; zfeFetch();
  const z = zoneAt(l.lat, l.lon), h = head();
  let soon = null; if (!z && h != null && moving()) for (const km of [.4, .8]) { const [a, b] = project(l.lat, l.lon, h, km); const zz = zoneAt(a, b); if (zz) { soon = { z: zz, km }; break; } }
  const vig = critair(), my = vig === '' ? 'règle ta vignette dans les réglages' : vig === '0' ? 'ta voiture : Crit’Air 0 (électrique)' : vig === 'nc' ? 'ta voiture : non classée' : 'ta voiture : Crit’Air ' + vig;
  if (z) { if (S.zfe.inside !== z.id) { S.zfe.inside = z.id; alert('zfe751', { key: 'zfe:' + z.id + ':' + new Date().toDateString(), priority: 5, color: '#2e7d32', icon: '🌿', hours: 6, title: 'Zone à faibles émissions', text: `ZFE ${z.name} · ${my}`, detail: () => `<p style="font-size:18px">Tu es dans la <b>${esc(z.name)}</b>.</p><p>${esc(my)}.</p><p>Les vignettes admises et les horaires changent selon la ville et l’année : vérifie la règle du moment sur le site de la ville ou sur certificat-air.gouv.fr.</p>` }); } }
  else if (soon) alert('zfe751', { key: 'zfesoon:' + soon.z.id + ':' + new Date().toDateString(), priority: 5, color: '#2e7d32', icon: '🌿', hours: 6, title: 'Zone à faibles émissions', text: `ZFE ${soon.z.name} dans ${Math.round(soon.km * 1000)} m · ${my}` });
  else if (S.zfe.inside) { S.zfe.inside = null; alert('zfe751', null); }
 }

 // ---------- 8. Tunnel devant ----------
 async function tunFetch() {
  const l = here(); if (!l || S.tun.busy || speed() < 30 || (Date.now() - S.tun.at < 120000 && !movedFar(S.tun.pos, 1.5))) return;
  S.tun.busy = true; S.tun.at = Date.now(); S.tun.pos = [l.lat, l.lon];
  try {
   const j = await op(`way["tunnel"="yes"]["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|motorway_link|trunk_link|primary_link|secondary_link)$"](around:3000,${l.lat.toFixed(4)},${l.lon.toFixed(4)});out geom tags;`);
   S.tun.list = (j.elements || []).filter(w => Array.isArray(w.geometry) && w.geometry.length > 1).map(w => ({ id: w.id, name: (w.tags && w.tags.name) || '', ends: [w.geometry[0], w.geometry[w.geometry.length - 1]], len: w.geometry.reduce((n, g, i, a) => i ? n + dist(a[i - 1].lat, a[i - 1].lon, g.lat, g.lon) : 0, 0) })).filter(t => t.len > .08);
  } catch (e) { err('tunnels', e); } finally { S.tun.busy = false; }
 }
 function tunCheck() {
  if (!on('tunnel751')) return alert('tunnel751', null);
  tunFetch();
  let best = null;
  for (const t of S.tun.list) for (const e of t.ends) { const a = ahead(e.lat, e.lon); if (a && a.d > .05 && a.d < .9 && Math.abs(a.rel) < 25 && (!best || a.d < best.a.d)) best = { t, a }; }
  if (best && best.a.d <= .7) { const m = Math.max(50, Math.round(best.a.d * 1000 / 50) * 50); alert('tunnel751', { key: 'tun:' + best.t.id + ':' + Math.floor(Date.now() / 600000), priority: 6, color: '#37474f', icon: '🚇', hours: .2, title: 'Tunnel devant', text: `Tunnel dans ${m} m : allume tes feux`, detail: () => `<p style="font-size:18px">${best.t.name ? '<b>' + esc(best.t.name) + '</b> · ' : ''}${(best.t.len).toFixed(1).replace('.', ',')} km de tunnel.</p><p>Allume tes feux de croisement avant d’entrer.</p>` }); S.tun.shown = best.t.id; }
  else if (S.tun.shown) { S.tun.shown = ''; alert('tunnel751', null); }
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
  if (!on('aire751') || !onMotorway()) { if (S.aire.cur) { S.aire.cur = null; alert('aire751', null); } return; }
  aireFetch();
  let best = null; for (const a of S.aire.list) { const p = ahead(a.lat, a.lon); if (p && p.d > .3 && p.d < 15 && Math.abs(p.rel) < 35 && (!best || p.d < best.p.d)) best = { a, p }; }
  if (!best) { if (S.aire.cur) { S.aire.cur = null; alert('aire751', null); } return; }
  svcFetch(best.a);
  const svc = (S.aire.svc[best.a.id] || {}).list || [], km = Math.max(1, Math.round(best.p.d));
  S.aire.cur = best.a.id;
  alert('aire751', { key: 'aire:' + best.a.id, priority: 2, color: '#00796b', icon: '🅿', hours: 1, title: best.a.name, text: `${best.a.name} · ${km} km${svc.length ? ' : ' + svc.slice(0, 4).join(' · ') : ''}`, detail: () => `<p style="font-size:18px"><b>${esc(best.a.name)}</b> dans ${km} km.</p><p>${svc.length ? 'Services : ' + esc(svc.join(', ')) + '.' : 'Services non renseignés sur la carte.'}</p>` });
 }

 // ---------- 10. Ce qu'il y a à la prochaine sortie ----------
 const POI = { bakery: ['boulangerie', 'nwr(around:1500,LAT,LON)["shop"="bakery"];'], mcdo: ['McDo', 'nwr(around:3000,LAT,LON)["amenity"="fast_food"]["brand"~"McDonald",i];'], pharmacy: ['pharmacie', 'nwr(around:2000,LAT,LON)["amenity"="pharmacy"];'], supermarket: ['supermarché', 'nwr(around:2000,LAT,LON)["shop"="supermarket"];'] };
 const poiKind = () => store.get('exitPoi751', 'bakery');
 async function sortieCheck() {
  if (!on('sortie751')) return alert('sortie751', null);
  const x = safe(() => Highway738.state.next, null), kind = poiKind();
  if (!x || !Number.isFinite(x.lat) || !POI[kind]) { if (S.sortie.id) { S.sortie.id = ''; alert('sortie751', null); } return; }
  const id = x.id + ':' + kind;
  if (S.sortie.id !== id) {
   S.sortie.id = id; S.sortie.poi = null;
   if (x.d > 8) return;
   try {
    const j = await op('(' + POI[kind][1].replace(/LAT/g, x.lat.toFixed(5)).replace(/LON/g, x.lon.toFixed(5)) + ');out center tags;');
    const list = (j.elements || []).map(e => ({ name: (e.tags && (e.tags.name || e.tags.brand)) || POI[kind][0], hours: (e.tags && e.tags.opening_hours) || '', d: dist(x.lat, x.lon, e.lat || e.center.lat, e.lon || e.center.lon) })).sort((a, b) => a.d - b.d);
    if (S.sortie.id === id) S.sortie.poi = list[0] || { none: true };
   } catch (e) { err('sortie', e); }
  }
  const p = S.sortie.poi;
  if (!p || p.none || x.d > 4) { alert('sortie751', null); return; }
  const ref = x.ref ? 'Sortie ' + x.ref : 'Prochaine sortie', m = p.d < 1 ? Math.round(p.d * 1000 / 50) * 50 + ' m' : p.d.toFixed(1).replace('.', ',') + ' km';
  alert('sortie751', { key: 'sortie:' + id, priority: 2, color: '#6d4c41', icon: kind === 'bakery' ? '🥖' : kind === 'mcdo' ? '🍔' : kind === 'pharmacy' ? '💊' : '🛒', hours: 1, title: ref, text: `${ref} : ${POI[kind][0]} à ${m}`, detail: () => `<p style="font-size:18px"><b>${esc(p.name)}</b> à ${m} de la ${esc(ref.toLowerCase())}.</p>${p.hours ? `<p>Horaires : ${esc(p.hours)}</p>` : ''}` });
 }

 // ---------- 102. Monuments à l'horizon ----------
 async function monuFetch() {
  const l = here(); if (!l || S.monu.busy || (Date.now() - S.monu.at < 600000 && !movedFar(S.monu.pos, 3))) return;
  S.monu.busy = true; S.monu.at = Date.now(); S.monu.pos = [l.lat, l.lon];
  const a = l.lat.toFixed(4), b = l.lon.toFixed(4);
  try {
   const j = await op(`(nwr["building"="cathedral"](around:5000,${a},${b});nwr["historic"="castle"]["name"](around:5000,${a},${b});nwr["man_made"="tower"]["tower:type"~"^(communication|observation)$"]["name"](around:5000,${a},${b});nwr["amenity"="place_of_worship"]["building"="church"]["wikidata"](around:1500,${a},${b}););out center tags;`);
   S.monu.list = (j.elements || []).map(e => { const t = e.tags || {}; return { lat: e.lat || (e.center && e.center.lat), lon: e.lon || (e.center && e.center.lon), name: t.name || '', kind: t.building === 'cathedral' ? 'cathedral' : t.historic === 'castle' ? 'castle' : t.man_made === 'tower' ? 'tower' : 'church' }; }).filter(m => Number.isFinite(m.lat)).slice(0, 12);
  } catch (e) { err('monuments', e); } finally { S.monu.busy = false; }
 }
 function silhouette(api, kind, x, base, s, col) {
  const { poly, rect } = api;
  if (kind === 'cathedral') { rect(x - s * .5, base - s * .45, s * 1.1, s * .45, col); rect(x - s * .5, base - s * 1.1, s * .26, s * .7, col); poly([[x - s * .5, base - s * 1.1], [x - s * .37, base - s * 1.75], [x - s * .24, base - s * 1.1]], col); poly([[x - s * .1, base - s * .45], [x + s * .25, base - s * .7], [x + s * .6, base - s * .45]], col); }
  else if (kind === 'castle') { rect(x - s * .6, base - s * .5, s * 1.2, s * .5, col); for (const k of [-.6, .35]) { rect(x + k * s, base - s * .85, s * .25, s * .85, col); for (let j = 0; j < 3; j++) rect(x + k * s + j * s * .09, base - s * .93, s * .05, s * .08, col); } }
  else if (kind === 'tower') { poly([[x - s * .12, base], [x - s * .05, base - s * 1.3], [x + s * .05, base - s * 1.3], [x + s * .12, base]], col); rect(x - s * .14, base - s * 1.15, s * .28, s * .12, col); rect(x - s * .01, base - s * 1.7, s * .02, s * .4, col); }
  else { rect(x - s * .35, base - s * .35, s * .7, s * .35, col); rect(x - s * .1, base - s * .7, s * .2, s * .35, col); poly([[x - s * .1, base - s * .7], [x, base - s * 1.1], [x + s * .1, base - s * .7]], col); }
 }
 const horizonDraw = api => {
  if (!on('monu751') || !(api.scene === 'ville' || api.scene === 'village')) return;
  monuFetch();
  for (const m of S.monu.list) {
   const a = ahead(m.lat, m.lon); if (!a || Math.abs(a.rel) > 55 || a.d > 6) continue;
   const x = api.W * (.5 + a.rel / 120), s = Math.max(14, Math.min(46, 60 / (1 + a.d))) * (m.kind === 'church' ? .7 : 1);
   silhouette(api, m.kind, x, api.HZ + 2, s, api.night ? '#141b2bcc' : '#7d8ea3b3');
  }
 };

 // ---------- 103. Trafic réel dans le décor ----------
 function density() {
  if (!on('traf751')) return 1;
  const T = safe(() => V740.T, null), last = T && T.last, fresh = T && Date.now() - (T.at || 0) < 300000;
  let k = 1;
  if (fresh && Array.isArray(last) && last.length) { const r = Math.min(...last.map(x => x.free > 0 ? x.cur / x.free : 1)); k = r < .5 ? 3 : r < .75 ? 2 : 1; }
  const v = speed(); if (onMotorway() && v > 3 && v < 40) k = Math.max(k, 2.5);
  return k;
 }

 // ---------- 104. Panneau de limitation planté ----------
 function limitCheck() {
  const v = typeof limit !== 'undefined' && Number.isFinite(limit) && limit > 0 ? limit : null;
  if (v && S.lim.v && v !== S.lim.v && on('limit751') && moving()) safe(() => Decor751.sign('limit751', { v }, 140));
  if (v) S.lim.v = v;
 }

 // ---------- 167. Panneau d'entrée de département ----------
 function depCode(cp) { cp = String(cp || ''); if (!/^\d{5}$/.test(cp)) return ''; if (cp.startsWith('20')) return +cp.slice(0, 3) < 202 ? '2A' : '2B'; if (cp.startsWith('97') || cp.startsWith('98')) return cp.slice(0, 3); return cp.slice(0, 2); }
 function depCheck() {
  const g = typeof geoA !== 'undefined' ? geoA : null; if (!g) return;
  const code = depCode(g.cp), name = String(g.dep || '').trim(); if (!code || !name) return;
  if (S.dep.code && S.dep.code !== code && on('dep751') && moving()) safe(() => Decor751.sign('dep751', { code, name, reg: String(g.reg || '').trim() }, 220));
  S.dep.code = code; S.dep.name = name;
 }
 const REGCOL = { 'Grand Est': '#1d4fa8', 'Bourgogne-Franche-Comté': '#7b1f3a', 'Auvergne-Rhône-Alpes': '#1e6b52', 'Île-de-France': '#22398c', 'Hauts-de-France': '#c0392b', 'Normandie': '#a93226', 'Bretagne': '#111111', 'Pays de la Loire': '#0e5f8a', 'Centre-Val de Loire': '#1b5e8c', 'Nouvelle-Aquitaine': '#b7410e', 'Occitanie': '#b3261e', 'Provence-Alpes-Côte d’Azur': '#0b5394', "Provence-Alpes-Côte d'Azur": '#0b5394', 'Corse': '#2b2b2b' };

 // Dessins dans le décor.
 function waitDecor(n) {
  if (!window.Decor751) { if (n < 40) setTimeout(() => waitDecor(n + 1), 500); return; }
  Decor751.horizon(horizonDraw);
  Decor751.density(density);
  Decor751.draw('limit751', (z, d, api) => { const q = api.worldQ(z); if (q < .07 || q > 1.8) return; const p = api.P(q, 1.3); api.sign(p.x, p.y, 150 * q, d.v, d.v === 30); });
  Decor751.draw('dep751', (z, d, api) => {
   const { mp, worldQ, line, rect, c } = api, q = worldQ(z), k0 = 1.3, k1 = 2.3, top = mp(z, k0, 165), br = mp(z, k1, 60);
   for (const k of [k0 + .1, k1 - .1]) { const g = mp(z, k), t2 = mp(z, k, 60); line([[g.x, g.y], [t2.x, t2.y]], api.night ? '#8c9e98' : '#a7b7ae', Math.max(1, 5 * q)); }
   const w = br.x - top.x, h = br.y - top.y; if (w < 3 || h < 3) return;
   rect(top.x, top.y, w, h, '#f4f4ef'); c.strokeStyle = REGCOL[d.reg] || '#1d4fa8'; c.lineWidth = Math.max(.8, 3 * q); c.strokeRect(top.x + 2 * q, top.y + 2 * q, w - 4 * q, h - 4 * q);
   if (w > 14) { const m = c.getTransform(), kk = m.d ? m.a / m.d : 1; c.save(); c.translate(top.x, top.y); c.scale(1, kk); const hh = h / kk;
    rect(w * .05, hh * .14, hh * .55, hh * .55, REGCOL[d.reg] || '#1d4fa8'); api.fit(d.code, w * .05 + hh * .275, hh * .52, hh * .5, hh * .32, '#ffffff', 'center');
    api.fit(String(d.name).toUpperCase(), w * .05 + hh * .7, hh * .42, w * .9 - hh * .7, hh * .26, '#14223a', 'left'); api.fit(d.reg || 'Bienvenue', w * .05 + hh * .7, hh * .74, w * .9 - hh * .7, hh * .17, '#3b4a5e', 'left', false);
    c.restore(); }
  });
 }
 waitDecor(0);

 // Boucles : alertes toutes les 2 s, panneaux chaque seconde.
 setInterval(() => { safe(zfeCheck); safe(tunCheck); safe(aireCheck); safe(sortieCheck); }, 2000);
 setInterval(() => { safe(limitCheck); safe(depCheck); }, 1000);

 // ---------- Réglages : GPS et navigation → Alertes de la route ----------
 function settings(p) {
  const tog = (id, l, d) => setRow(p, l, d, chipBtn(p, 'r751:on:' + id + ':1', 'Oui', store.get('on_' + id, true) !== false) + chipBtn(p, 'r751:on:' + id + ':0', 'Non', store.get('on_' + id, true) === false));
  const vig = critair();
  return LIST.filter(([id]) => id !== 'group751').map(([id, l, d]) => tog(id, l, d)).join('')
   + setRow(p, 'Ta vignette Crit’Air', 'Pour les zones à faibles émissions.', [['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['nc', 'Non classée']].map(([k, l]) => chipBtn(p, 'r751:crit:' + k, l, vig === k)).join(''))
   + setRow(p, 'À la prochaine sortie, chercher', 'Sur autoroute, quand la sortie approche.', Object.entries(POI).map(([k, v]) => chipBtn(p, 'r751:poi:' + k, v[0], poiKind() === k)).join(''));
 }
 const cat = SETCATS.find(c => c[0] === 'Navigation' || c[0] === 'GPS et navigation') || SETCATS[0];
 if (cat && !cat[1].some(s => s[0] === 'Alertes de la route')) cat[1].push(['Alertes de la route', settings]);
 const act0 = window.act;
 window.act = function (a) {
  if (typeof a === 'string' && a.startsWith('r751:')) {
   const [, op2, k, v] = a.split(':');
   if (op2 === 'on') store.set('on_' + k, v === '1'); else if (op2 === 'crit') store.set('critair751', k); else if (op2 === 'poi') { store.set('exitPoi751', k); S.sortie.id = ''; }
   render(); return;
  }
  return act0.apply(this, arguments);
 };
 window.Route751 = { S, zoneAt, inPoly, ahead, project, depCode, density, zfeCheck, tunCheck, aireCheck, sortieCheck, limitCheck, depCheck, horizonDraw, silhouette, settings, reportLines: () => ['== Alertes de la route 7.51 ==', `ZFE : ${S.zfe.zones.length} zone(s) chargée(s)`, `Tunnels proches : ${S.tun.list.length}`, `Aires : ${S.aire.list.length}`, `Monuments : ${S.monu.list.length}`, `Département : ${S.dep.code} ${S.dep.name}`, ...S.errors] };
})();
