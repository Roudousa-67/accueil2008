/* 7.38 : sur l'autoroute, prochaine sortie (numéro et villes) et prochaine station avec son
   prix, affichées sur les portiques du décor.
   Sorties : OpenStreetMap (nœuds highway=motorway_junction, bretelles et leurs destinations).
   Stations : flux officiel français (stations d'autoroute), Tankerkönig en Allemagne. */
(() => {
 'use strict';
 const OVERPASS = 'https://overpass-api.de/api/interpreter?data=';
 const H = { cities: [], cityAt: 0, cityPos: null, cityBusy: false, cityError: '', towns: null, townsId: 0, townsPos: null, townsOnce: false, onSince: 0, passedAt: 0, exits: [], exitsAt: 0, exitsPos: null, exitError: '', exitBusy: false, stations: [], stAt: 0, stPos: null, stError: '', stBusy: false, heading: null, next: null, station: null, at: 0, source: '' };
 const rad = x => x * Math.PI / 180;
 function bearing(a, b) {
  const y = Math.sin(rad(b.lon - a.lon)) * Math.cos(rad(b.lat)), x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lon - a.lon));
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
 }
 const diff = (a, b) => ((a - b + 540) % 360) - 180;
 const norm = r => String(r || '').split(';')[0].replace(/\s+/g, '').toUpperCase();
 const split = v => String(v || '').split(';').map(x => x.trim()).filter(Boolean);
 function road() { return window.Road723 && Road723.fresh() && Road723.match ? Road723.match.tags || {} : {}; }
 function onMotorway() {
  const hw = String(road().highway || '');
  return /^motorway/.test(hw) || (typeof roadScene === 'function' && roadScene() === 'autoroute');
 }

 // ---------- Sorties ----------
 function exitQuery(lat, lon) {
  return `[out:json][timeout:25];node(around:12000,${lat.toFixed(5)},${lon.toFixed(5)})[highway=motorway_junction]->.j;.j out body;way(bn.j)[highway~"^(motorway|trunk)_link$"];out body geom;way(bn.j)[highway~"^(motorway|trunk)$"];out body;`;
 }
 function parseExits(json) {
  const els = (json && json.elements) || [], junctions = new Map(), refs = new Map(), out = [];
  for (const e of els) if (e.type === 'node' && e.tags && e.tags.highway === 'motorway_junction') junctions.set(e.id, e);
  for (const e of els) if (e.type === 'way' && e.tags && /^(motorway|trunk)$/.test(e.tags.highway) && Array.isArray(e.nodes))
   for (const id of e.nodes) if (junctions.has(id) && e.tags.ref) (refs.get(id) || refs.set(id, new Set()).get(id)).add(norm(e.tags.ref));
  const byJunction = new Map();
  for (const e of els) {
   if (e.type !== 'way' || !e.tags || !/^(motorway|trunk)_link$/.test(e.tags.highway) || !Array.isArray(e.nodes) || !junctions.has(e.nodes[0])) continue;
   const j = junctions.get(e.nodes[0]), g = Array.isArray(e.geometry) ? e.geometry.filter(p => p && Number.isFinite(p.lat)) : [];
   if (g.length < 2) continue;
   // Sens de la bretelle au départ : il donne le sens de circulation de la chaussée concernée.
   const far = g[Math.min(4, g.length - 1)], dir = bearing({ lat: j.lat, lon: j.lon }, { lat: far.lat, lon: far.lon });
   const t = j.tags || {}, x = byJunction.get(j.id) || { id: j.id, lat: j.lat, lon: j.lon, ref: String(t.ref || '').trim(), name: String(t.name || t.exit_to || '').trim(), dest: [], destRef: [], dir, refs: [...(refs.get(j.id) || [])] };
   for (const d of split(e.tags.destination || e.tags['destination:forward'] || t.exit_to)) if (!x.dest.includes(d)) x.dest.push(d);
   for (const r of split(e.tags['destination:ref'])) if (!x.destRef.includes(r)) x.destRef.push(r);
   byJunction.set(j.id, x);
  }
  for (const x of byJunction.values()) { if (!x.dest.length && x.name) x.dest.push(x.name); out.push(x); }
  return out;
 }
 function fetchExits(force) {
  if (H.exitBusy || !loc) return;
  const moved = H.exitsPos ? hav(H.exitsPos.lat, H.exitsPos.lon, loc.lat, loc.lon) : 99;
  if (!force && Date.now() - H.exitsAt < 5 * 60000 && moved < 5) return;
  if (!force && H.exitError && Date.now() - H.exitsAt < 90000) return;
  H.exitBusy = true; H.exitsAt = Date.now(); H.exitsPos = { lat: loc.lat, lon: loc.lon };
  getJSON(OVERPASS + encodeURIComponent(exitQuery(loc.lat, loc.lon)))
   .then(j => { if (j && j.remark && !(j.elements || []).length) throw Error(j.remark); H.exits = parseExits(j); H.exitError = ''; })
   .catch(e => { H.exitError = String(e && e.message || e).replace(/<[^>]*>/g, ' ').trim().slice(0, 80); })
   .finally(() => { H.exitBusy = false; compute(); });
 }
 function pickExit(p, hd) {
  const ref = norm(road().ref);
  let best = null;
  for (const e of H.exits) {
   const d = hav(p.lat, p.lon, e.lat, e.lon); if (d < .08 || d > 15) continue;
   const off = Math.abs(diff(bearing(p, e), hd)), cone = d > 5 ? 22 : d > 1.5 ? 35 : 55;
   if (off > cone || Math.abs(diff(e.dir, hd)) > 65) continue;
   if (ref && e.refs.length && !e.refs.includes(ref)) continue;
   if (!best || d < best.d) best = Object.assign({}, e, { d });
  }
  return best;
 }

 // ---------- Prochaine station ----------
 function fetchStations(force) {
  if (H.stBusy || !loc || !window.Stations738) return;
  const moved = H.stPos ? hav(H.stPos.lat, H.stPos.lon, loc.lat, loc.lon) : 999;
  if (!force && Date.now() - H.stAt < 10 * 60000 && moved < 20) return;
  if (!force && H.stError && Date.now() - H.stAt < 3 * 60000) return;
  H.stBusy = true; H.stAt = Date.now(); H.stPos = { lat: loc.lat, lon: loc.lon };
  // Stations d'autoroute du flux officiel (champ pop = « A ») jusqu'à 60 km.
  Stations738.fetchFR(loc.lat, loc.lon, 60, "pop='A'")
   .then(list => { H.stations = list.filter(s => s.highway); H.source = 'flux officiel'; H.stError = ''; })
   .catch(() => Stations738.fetchFR(loc.lat, loc.lon, 30).then(list => {
    // Si le filtre n'est pas accepté : adresses d'aires ou d'autoroutes.
    H.stations = list.filter(s => s.highway || /\baire\b|autoroute|\bA ?\d{1,3}\b/i.test(s.addr)); H.source = 'flux officiel (adresses)'; H.stError = '';
   }))
   .catch(e => { H.stError = String(e && e.message || e).slice(0, 80); })
   .finally(() => { H.stBusy = false; compute(); });
 }
 const brands = new Map();
 let brandBusy = false;
 const generic = n => !n || /^(station(-service| service)?|tankstelle|carburants?|aire.*)$/i.test(String(n).trim());
 function brandKey(s) { return s.id || s.lat.toFixed(4) + ',' + s.lon.toFixed(4); }
 function fetchBrand(s) {
  const k = brandKey(s);
  if (brandBusy || brands.has(k)) return;
  brandBusy = true; brands.set(k, '');
  const q = `[out:json][timeout:15];nwr(around:300,${s.lat.toFixed(5)},${s.lon.toFixed(5)})["amenity"="fuel"];out center tags;`;
  getJSON(OVERPASS + encodeURIComponent(q))
   .then(j => {
    let best = null, bd = .3;
    for (const e of (j && j.elements) || []) {
     const la = Number.isFinite(e.lat) ? e.lat : e.center && e.center.lat, lo = Number.isFinite(e.lon) ? e.lon : e.center && e.center.lon;
     if (!Number.isFinite(la)) continue; const d = hav(s.lat, s.lon, la, lo); if (d < bd) { bd = d; best = e; }
    }
    const t = best && best.tags || {}, b = String(t.brand || t.operator || t.name || '').trim();
    brands.set(k, generic(b) ? '' : b);
   })
   .catch(() => { setTimeout(() => brands.delete(k), 120000); })
   .finally(() => { brandBusy = false; compute(); });
 }
 function withBrand(s) {
  if (!s || !generic(s.name)) return s;
  const b = brands.get(brandKey(s));
  if (b) s.name = b; else if (!brands.has(brandKey(s))) fetchBrand(s);
  return s;
 }
 function pickStation(p, hd) {
  const fuel = store.get('fuel', 'E10');
  const de = (typeof st47 !== 'undefined' && Date.now() - (st47.deAt || 0) < 30 * 60000 ? st47.deList || [] : []).filter(s => s.highway);
  let best = null;
  for (const s of H.stations.concat(de)) {
   const d = hav(p.lat, p.lon, s.lat, s.lon); if (d < .3 || d > 60) continue;
   const dd = diff(bearing(p, s), hd), off = Math.abs(dd), cone = d > 10 ? 15 : d > 3 ? 25 : 40;
   if (off > cone) continue;
   // Circulation à droite : une station nettement à gauche et proche est sur l'autre sens.
   if (d < 8 && d * Math.sin(rad(dd)) < -.08) continue;
   const price = s.prices && s.prices[fuel] > 0 ? s.prices[fuel] : 0;
   const score = d + (price ? 0 : 5);
   if (!best || score < best.score) best = Object.assign({}, s, { d, price, fuel, score });
  }
  return best;
 }

 // ---------- 7.43 : grandes villes et distances (panneau au bord de la route) ----------
 // Villes (OpenStreetMap) dans ton sens de circulation ; distance par la route (OSRM),
 // sinon à vol d'oiseau + 20 % marquée « ≈ ». Un panneau en arrivant sur l'autoroute,
 // puis après chaque sortie passée, au plus un tous les 10 km.
 const OSRM = 'https://router.project-osrm.org/table/v1/driving/';
 function fetchCities(force) {
  if (H.cityBusy || !loc) return;
  const moved = H.cityPos ? hav(H.cityPos.lat, H.cityPos.lon, loc.lat, loc.lon) : 999;
  if (!force && moved < 60 && Date.now() - H.cityAt < 30 * 60000) return;
  if (!force && H.cityError && Date.now() - H.cityAt < 3 * 60000) return;
  H.cityBusy = true; H.cityAt = Date.now(); H.cityPos = { lat: loc.lat, lon: loc.lon };
  const la = loc.lat.toFixed(4), lo = loc.lon.toFixed(4);
  const q = `[out:json][timeout:25];(node(around:450000,${la},${lo})[place=city][name];node(around:70000,${la},${lo})[place=town][name];);out body;`;
  getJSON(OVERPASS + encodeURIComponent(q))
   .then(j => {
    if (j && j.remark && !(j.elements || []).length) throw Error(j.remark);
    H.cities = ((j && j.elements) || []).filter(e => e.tags && e.tags.name && Number.isFinite(e.lat)).map(e => ({ name: String(e.tags['name:fr'] || e.tags.name), lat: e.lat, lon: e.lon, city: e.tags.place === 'city', pop: Number(String(e.tags.population || '').replace(/\D/g, '')) || 0 }));
    H.cityError = '';
   })
   .catch(e => { H.cityError = String(e && e.message || e).slice(0, 80); })
   .finally(() => { H.cityBusy = false; });
 }
 function pickTowns(p, hd) {
  const cand = [];
  for (const c of H.cities || []) {
   const d = hav(p.lat, p.lon, c.lat, c.lon); if (d < 8 || d > 650) continue;
   // Plus la ville est loin, plus la route peut s'écarter de la ligne droite.
   if (Math.abs(diff(bearing(p, c), hd)) > (d < 60 ? 30 : d < 200 ? 25 : 35)) continue;
   cand.push(Object.assign({ d }, c));
  }
  cand.sort((a, b) => a.d - b.d);
  const out = [];
  for (const c of cand) {
   if (out.length >= 4) break;
   const last = out[out.length - 1];
   if (!last) { out.push(c); continue; }
   if (c.d < last.d * 1.4 || c.d - last.d < 15) continue;
   if (!c.city && out.length >= 1) continue;
   if (out.length >= 2 && c.pop && c.pop < 100000 && cand.some(x => x.city && x.pop >= 100000 && x.d > last.d * 1.4)) continue;
   out.push(c);
  }
  return out;
 }
 function refineTowns(t) {
  if (!t || !t.items.length || !loc) return;
  const pts = [[loc.lon, loc.lat]].concat(t.items.map(c => [c.lon, c.lat])).map(([a, b]) => a.toFixed(5) + ',' + b.toFixed(5)).join(';');
  getJSON(OSRM + pts + '?sources=0&annotations=distance')
   .then(j => {
    const row = j && j.distances && j.distances[0];
    if (!row) return;
    t.list = t.items.map((c, i) => [c.name, Number.isFinite(row[i + 1]) && row[i + 1] > 0 ? String(Math.round(row[i + 1] / 1000)) : '≈ ' + Math.round(c.d * 1.2)]);
    t.road = true;
   }).catch(() => { /* reste à vol d'oiseau */ });
 }
 function maybeTowns(hd) {
  const pr = prefs(); if (!pr.towns || !loc) return;
  fetchCities(false);
  const now = Date.now(), entered = !H.onSince || now - H.onSince < 25000;
  const passed = H.passedAt && now - H.passedAt < 20000;
  const far = !H.townsPos || hav(H.townsPos.lat, H.townsPos.lon, loc.lat, loc.lon) >= 10;
  if (!far || (!passed && !(entered && now - H.onSince > 15000 && !H.townsOnce))) return;
  const items = pickTowns(loc, hd); if (!items.length) return;
  const ref = String(road().ref || '').split(';')[0].replace(/^([AMN])\s*(\d)/, '$1 $2').trim();
  H.towns = { id: ++H.townsId, ref, at: now, items, list: items.map(c => [c.name, '≈ ' + Math.round(c.d * 1.2)]), road: false };
  H.townsPos = { lat: loc.lat, lon: loc.lon }; H.townsOnce = true; H.passedAt = 0;
  refineTowns(H.towns);
 }

 // ---------- Calcul à chaque position ----------
 function compute() {
  if (!loc || !Number.isFinite(loc.lat)) { H.next = H.station = null; return; }
  if (Number.isFinite(loc.brg) && loc.brg >= 0 && (loc.spd || 0) > 15) H.heading = loc.brg;
  if (!onMotorway() || H.heading == null) { H.next = H.station = null; H.onSince = 0; H.townsOnce = false; return; }
  if (!H.onSince) H.onSince = Date.now();
  const prev = H.next;
  H.next = pickExit(loc, H.heading); H.station = withBrand(pickStation(loc, H.heading)); H.at = Date.now();
  // Sortie dépassée (la suivante prend sa place alors qu'elle était tout près) : on vient de passer un échangeur.
  if (prev && prev.d < .4 && (!H.next || H.next.id !== prev.id)) H.passedAt = Date.now();
  maybeTowns(H.heading);
 }
 const onLoc0 = window.onLoc;
 let lastCompute = 0;
 window.onLoc = function () {
  onLoc0.apply(this, arguments);
  try {
   if (Date.now() - lastCompute < 900) return; lastCompute = Date.now();
   compute();
   if (onMotorway() && (loc.spd || 0) > 40) { fetchExits(false); fetchStations(false); }
  } catch (e) { window.Errors738 && Errors738.add('autoroute', e); }
 };
 // Données pour les portiques du décor : rien de plus vieux que 2 minutes.
 function signs() {
  if (!H.at || Date.now() - H.at > 120000) return null;
  return { exit: H.next, station: H.station, towns: H.towns && Date.now() - H.towns.at < 60000 && (H.towns.road || Date.now() - H.towns.at > 4000) ? H.towns : null };
 }

 // ---------- 7.39 : réglages des panneaux ----------
 const PREF_DEF = { exits: true, stations: true, every: 'km', small: true, post: true, towns: true };
 const prefs = () => Object.assign({}, PREF_DEF, store.get('hw739', {}) || {});
 function setPref(k, v) { const o = Object.assign({}, store.get('hw739', {}) || {}); o[k] = v; store.set('hw739', o); }
 function settings(p) {
  const f = prefs(), onoff = k => chipBtn(p, 'hw739:' + k + ':1', 'Activé', f[k] === true) + chipBtn(p, 'hw739:' + k + ':0', 'Désactivé', f[k] === false);
  return setRow(p, 'Panneaux de sortie', 'Portique bleu avec le numéro de la sortie, les villes et la distance, placé à la vraie distance de la sortie.', onoff('exits'))
   + setRow(p, 'Fréquence des panneaux', 'Tous les kilomètres : 5 km, 4 km, 3 km, 2 km et 1 km avant la sortie. Comme sur l’autoroute : 2 km et 1 km.', chipBtn(p, 'hw739:every:km', 'Tous les kilomètres', f.every === 'km') + chipBtn(p, 'hw739:every:classic', '2 km et 1 km', f.every === 'classic'))
   + setRow(p, 'Panneaux de station avec le prix', 'Prochaine station d’autoroute devant toi avec le prix de ton carburant : 10 km, 5 km puis tous les kilomètres (ou 10, 5, 2 et 1 km).', onoff('stations'))
   + setRow(p, 'Panneau « SORTIE » au début de la bretelle', 'Panneau planté au bord de la route à l’endroit exact où commence la sortie, avec son numéro et les villes.', onoff('post'))
   + setRow(p, 'Panneau des grandes villes et distances', 'En arrivant sur l’autoroute puis après chaque sortie passée (au plus un tous les 10 km) : les grandes villes devant toi et leur distance par la route (« ≈ » si elle est estimée).', onoff('towns'))
   + setRow(p, 'Petit panneau à 500 m', 'Dès que la sortie ou la station est à 500 m, un petit panneau apparaît tout de suite en haut à droite de l’image, avec la distance qui diminue.', onoff('small'))
   + `<p style="color:${p.mut};font-size:13px;line-height:1.45">Sorties : OpenStreetMap. Prix : flux officiel (France) et Tankerkönig (Allemagne). Il faut Internet. Hors autoroute ou sans données, les portiques montrent les lieux proches comme avant.</p>`;
 }
 const act0 = window.act;
 window.act = function (a, long) {
  if (typeof a === 'string' && a.startsWith('hw739:')) {
   const [, k, v] = a.split(':');
   if (['exits', 'stations', 'small', 'post', 'towns'].includes(k)) setPref(k, v === '1');
   else if (k === 'every' && ['km', 'classic'].includes(v)) setPref('every', v);
   render(); return;
  }
  return act0.apply(this, arguments);
 };
 window.Highway738 = { state: H, brands, withBrand, pickTowns, maybeTowns, fetchCities, refineTowns, signs, compute, parseExits, pickExit, pickStation, exitQuery, fetchExits, fetchStations, bearing, prefs, settings };
})();
