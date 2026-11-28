/* 7.66 : décor vivant (repris de la 7.51, seul cette fois) : monuments à l'horizon en ville, plus de voitures
   quand ça bouchonne, panneau de limitation planté au bord de la route quand la limite change, panneau d'entrée
   de département. Dessiné par le moteur du décor (decors726.js, Decor766). Données : OpenStreetMap pour les
   monuments (au plus toutes les 10 min ou après 3 km), bouchons en direct déjà chargés par l'appli.
   Chaque élément se coupe dans Réglages › Widgets › Vue voiture et route, ou dans Nouveautés à tester. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 const OVERPASS = 'https://overpass-api.de/api/interpreter?data=';
 const op = q => getJSON(OVERPASS + encodeURIComponent('[out:json][timeout:15];' + q));
 const LIST = [
  ['monu766', 'Monuments à l’horizon', 'En ville, les silhouettes des lieux connus (cathédrale, château, tour) apparaissent à l’horizon, dans leur vraie direction.'],
  ['traf766', 'Trafic réel dans le décor', 'Plus de voitures dans le décor quand ça bouchonne (bouchons en direct ou vitesse lente sur autoroute).'],
  ['limit766', 'Panneau de limitation planté', 'Quand la limite change, le nouveau panneau défile au bord de la route du décor.'],
  ['dep766', 'Panneau d’entrée de département', 'En changeant de département, un panneau bleu (numéro, nom, région) défile dans le décor.'],
 ];
 if (window.Try750) LIST.forEach(([id, l, d]) => Try750.register(id, l, d, '7.66'));
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
 const speed = () => safe(() => curSpeed().v, 0) || 0;
 const moving = () => speed() > 5;
 const S = { monu: { at: 0, pos: null, list: [] }, dep: { code: '', name: '' }, lim: { v: null }, errors: [] };
 const err = (k, e) => { S.errors.push(k + ' : ' + String(e && e.message || e).slice(0, 60)); if (S.errors.length > 10) S.errors.shift(); };
 const movedFar = (pos, km) => { const l = here(); return !pos || !l || dist(pos[0], pos[1], l.lat, l.lon) > km; };

 const onMotorway = () => safe(() => !!(Highway738.state.next || Highway738.state.onSince), false);
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
  if (!on('monu766') || !(api.scene === 'ville' || api.scene === 'village')) return;
  monuFetch();
  for (const m of S.monu.list) {
   const a = ahead(m.lat, m.lon); if (!a || Math.abs(a.rel) > 55 || a.d > 6) continue;
   const x = api.W * (.5 + a.rel / 120), s = Math.max(18, Math.min(64, 84 / (1 + a.d))) * (m.kind === 'church' ? .75 : 1);
   silhouette(api, m.kind, x, api.HZ + 2, s, api.night ? '#0c1220e6' : '#4f6078e0');
  }
 };

 // ---------- 103. Trafic réel dans le décor ----------
 function density() {
  if (!on('traf766')) return 1;
  const T = safe(() => V740.T, null), last = T && T.last, fresh = T && Date.now() - (T.at || 0) < 300000;
  let k = 1;
  if (fresh && Array.isArray(last) && last.length) { const r = Math.min(...last.map(x => x.free > 0 ? x.cur / x.free : 1)); k = r < .5 ? 3 : r < .75 ? 2 : 1; }
  const v = speed(); if (onMotorway() && v > 3 && v < 40) k = Math.max(k, 2.5);
  return k;
 }

 // ---------- 104. Panneau de limitation planté ----------
 function limitCheck() {
  const v = typeof limit !== 'undefined' && Number.isFinite(limit) && limit > 0 ? limit : null;
  if (v && S.lim.v && v !== S.lim.v && on('limit766') && moving()) safe(() => Decor766.sign('limit766', { v }, 140));
  if (v) S.lim.v = v;
 }

 // ---------- 167. Panneau d'entrée de département ----------
 function depCode(cp) { cp = String(cp || ''); if (!/^\d{5}$/.test(cp)) return ''; if (cp.startsWith('20')) return +cp.slice(0, 3) < 202 ? '2A' : '2B'; if (cp.startsWith('97') || cp.startsWith('98')) return cp.slice(0, 3); return cp.slice(0, 2); }
 function depCheck() {
  const g = typeof geoA !== 'undefined' ? geoA : null; if (!g) return;
  const code = depCode(g.cp), name = String(g.dep || '').trim(); if (!code || !name) return;
  if (S.dep.code && S.dep.code !== code && on('dep766') && moving()) safe(() => Decor766.sign('dep766', { code, name, reg: String(g.reg || '').trim() }, 220));
  S.dep.code = code; S.dep.name = name;
 }
 const REGCOL = { 'Grand Est': '#1d4fa8', 'Bourgogne-Franche-Comté': '#7b1f3a', 'Auvergne-Rhône-Alpes': '#1e6b52', 'Île-de-France': '#22398c', 'Hauts-de-France': '#c0392b', 'Normandie': '#a93226', 'Bretagne': '#111111', 'Pays de la Loire': '#0e5f8a', 'Centre-Val de Loire': '#1b5e8c', 'Nouvelle-Aquitaine': '#b7410e', 'Occitanie': '#b3261e', 'Provence-Alpes-Côte d’Azur': '#0b5394', "Provence-Alpes-Côte d'Azur": '#0b5394', 'Corse': '#2b2b2b' };

 // Dessins dans le décor.
 function waitDecor(n) {
  if (!window.Decor766) { if (n < 40) setTimeout(() => waitDecor(n + 1), 500); return; }
  Decor766.horizon(horizonDraw);
  Decor766.density(density);
  Decor766.draw('limit766', (z, d, api) => { const q = api.town ? api.depthQ(z - api.d) : api.worldQ(z); if (q < .07 || q > 1.8) return; const p = api.P(q, api.town ? 1.2 : 1.3); api.sign(p.x, p.y, (api.town ? 130 : 150) * q, d.v, d.v === 30); });
  Decor766.draw('dep766', (z, d, api) => {
   const { mp, worldQ, line, rect, c } = api;
   let q, top, br;
   if (api.town) {   // hors autoroute : panneau sur deux poteaux, à droite de la route
    q = api.depthQ(z - api.d); if (q < .07 || q > 1.8) return;
    const g = api.P(q, 1.32), w0 = 170 * q, h0 = 88 * q, y0 = g.y - 150 * q;
    for (const dx of [w0 * .15, w0 * .85]) line([[g.x + dx, g.y], [g.x + dx, y0 + h0]], api.night ? '#8c9e98' : '#a7b7ae', Math.max(1, 4 * q));
    top = { x: g.x, y: y0 }; br = { x: g.x + w0, y: y0 + h0 };
   } else {
    q = worldQ(z); const k0 = 1.3, k1 = 2.3; top = mp(z, k0, 165); br = mp(z, k1, 60);
    for (const k of [k0 + .1, k1 - .1]) { const g = mp(z, k), t2 = mp(z, k, 60); line([[g.x, g.y], [t2.x, t2.y]], api.night ? '#8c9e98' : '#a7b7ae', Math.max(1, 5 * q)); }
   }
   const w = br.x - top.x, h = br.y - top.y; if (w < 3 || h < 3) return;
   rect(top.x, top.y, w, h, '#f4f4ef'); c.strokeStyle = REGCOL[d.reg] || '#1d4fa8'; c.lineWidth = Math.max(.8, 3 * q); c.strokeRect(top.x + 2 * q, top.y + 2 * q, w - 4 * q, h - 4 * q);
   if (w > 14) { const m = c.getTransform(), kk = m.d ? m.a / m.d : 1; c.save(); c.translate(top.x, top.y); c.scale(1, kk); const hh = h / kk;
    rect(w * .05, hh * .14, hh * .55, hh * .55, REGCOL[d.reg] || '#1d4fa8'); api.fit(d.code, w * .05 + hh * .275, hh * .52, hh * .5, hh * .32, '#ffffff', 'center');
    api.fit(String(d.name).toUpperCase(), w * .05 + hh * .7, hh * .42, w * .9 - hh * .7, hh * .26, '#14223a', 'left'); api.fit(d.reg || 'Bienvenue', w * .05 + hh * .7, hh * .74, w * .9 - hh * .7, hh * .17, '#3b4a5e', 'left', false);
    c.restore(); }
  });
 }
 waitDecor(0);

 // Panneaux : chaque seconde.
 setInterval(() => { safe(limitCheck); safe(depCheck); }, 1000);

 // ---------- Réglages : Widgets › Vue voiture et route ----------
 function rows(p) {
  return LIST.map(([id, l, d]) => setRow(p, l, d, chipBtn(p, 'd766:on:' + id + ':1', 'Oui', store.get('on_' + id, true) !== false) + chipBtn(p, 'd766:on:' + id + ':0', 'Non', store.get('on_' + id, true) === false))).join('');
 }
 function install() {
  const c = SETCATS.find(x => x[0] === 'Widgets'), i = c ? c[1].findIndex(s => s[0] === 'Vue voiture et route') : -1; if (i < 0) return;
  const f0 = c[1][i][1]; if (f0.__d766) return;
  const f = p => safe(() => f0(p), '') + `<div style="font-size:12px;font-weight:700;letter-spacing:.06em;color:${p.mut};margin:14px 0 4px">DÉCOR VIVANT</div>` + rows(p); f.__d766 = true; c[1][i] = ['Vue voiture et route', f];
 }
 install();
 const act0 = window.act;
 window.act = function (a) {
  if (typeof a === 'string' && a.startsWith('d766:on:')) { const [, , k, v] = a.split(':'); store.set('on_' + k, v === '1'); render(); return; }
  const r = act0.apply(this, arguments);
  if (typeof a === 'string' && a.startsWith('try750:')) safe(install);
  return r;
 };
 window.Decor766Live = { S, depCode, density, limitCheck, depCheck, horizonDraw, silhouette, monuFetch, reportLines: () => ['== Décor vivant 7.66 ==', `Monuments : ${S.monu.list.length}`, `Département : ${S.dep.code} ${S.dep.name}`, ...S.errors] };
})();
