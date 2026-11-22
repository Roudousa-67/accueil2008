/* 7.38 : sur l'autoroute, prochaine sortie (numéro et villes) et prochaine station avec son
   prix, affichées sur les portiques du décor.
   Sorties : OpenStreetMap (nœuds highway=motorway_junction, bretelles et leurs destinations).
   Stations : flux officiel français (stations d'autoroute), Tankerkönig en Allemagne. */
(() => {
 'use strict';
 const OVERPASS = 'https://overpass-api.de/api/interpreter?data=';
 const H = { exits: [], exitsAt: 0, exitsPos: null, exitError: '', exitBusy: false, stations: [], stAt: 0, stPos: null, stError: '', stBusy: false, heading: null, next: null, station: null, at: 0, source: '' };
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
  return `[out:json][timeout:25];node(around:12000,${lat.toFixed(5)},${lon.toFixed(5)})[highway=motorway_junction]->.j;.j out body;way(bn.j)[highway=motorway_link];out body geom;way(bn.j)[highway~"^(motorway|trunk)$"];out body;`;
 }
 function parseExits(json) {
  const els = (json && json.elements) || [], junctions = new Map(), refs = new Map(), out = [];
  for (const e of els) if (e.type === 'node' && e.tags && e.tags.highway === 'motorway_junction') junctions.set(e.id, e);
  for (const e of els) if (e.type === 'way' && e.tags && /^(motorway|trunk)$/.test(e.tags.highway) && Array.isArray(e.nodes))
   for (const id of e.nodes) if (junctions.has(id) && e.tags.ref) (refs.get(id) || refs.set(id, new Set()).get(id)).add(norm(e.tags.ref));
  const byJunction = new Map();
  for (const e of els) {
   if (e.type !== 'way' || !e.tags || e.tags.highway !== 'motorway_link' || !Array.isArray(e.nodes) || !junctions.has(e.nodes[0])) continue;
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

 // ---------- Calcul à chaque position ----------
 function compute() {
  if (!loc || !Number.isFinite(loc.lat)) { H.next = H.station = null; return; }
  if (Number.isFinite(loc.brg) && loc.brg >= 0 && (loc.spd || 0) > 15) H.heading = loc.brg;
  if (!onMotorway() || H.heading == null) { H.next = H.station = null; return; }
  H.next = pickExit(loc, H.heading); H.station = pickStation(loc, H.heading); H.at = Date.now();
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
  return { exit: H.next, station: H.station };
 }
 window.Highway738 = { state: H, signs, compute, parseExits, pickExit, pickStation, exitQuery, fetchExits, fetchStations, bearing };
})();
