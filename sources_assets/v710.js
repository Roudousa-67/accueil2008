/* Accueil 2008 GT 7.10 : lieux et géométrie GPS. Chargé après v47.js. */
'use strict';
const Place710 = (() => {
  const intervals = [15, 30, 60, 120, 300];
  const every = () => {
    const v = Number(store.get('placeEvery', 60));
    return (intervals.includes(v) ? v : 60) * 1000;
  };
  let pending = null, attempt = 0, current = null, nearby = [], nearbyPos = null;
  let addressPos = null, addressAt = 0, nearbyAt = 0, error = '';
  const valid = p => p && Number.isFinite(p.lat) && Number.isFinite(p.lon) && Math.abs(p.lat) <= 90 && Math.abs(p.lon) <= 180;
  const fresh = () => valid(loc) && Number.isFinite(loc.ts) && Date.now() - loc.ts < 60000;
  const distance = (a, b) => hav(a.lat, a.lon, b.lat, b.lon);
  const nearest = (list, p) => list.reduce((b, x) => !b || distance(p, x) < distance(p, b) ? x : b, null);
  function locality(a) {
    // Les hameaux et villages sont plus précis que la commune administrative.
    for (const k of ['village', 'hamlet', 'town', 'city', 'municipality']) {
      if (typeof a[k] === 'string' && a[k].trim()) return { name: a[k].trim(), kind: k };
    }
    return null;
  }
  async function json(url) {
    // Un callback Android manquant ne doit jamais bloquer les actualisations suivantes.
    let timer;
    try { return await Promise.race([getJSON(url), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Délai réseau dépassé')), 18000); })]); }
    finally { clearTimeout(timer); }
  }
  async function refresh(force = false) {
    if (pending) return pending;
    if (DEMO || !fresh() || (attempt && Date.now() - attempt < (force ? 1500 : every()))) return;
    attempt = Date.now();
    const p = { lat: loc.lat, lon: loc.lon };
    pending = (async () => {
      const problems = [];
      try {
        if (addressPos && distance(p, addressPos) < 0.03 && Date.now() - addressAt < 300000) {
          // À l'arrêt, le panneau est actualisé localement ; réponse géocodée en cache 5 min.
        } else {
        const j = await json(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${p.lat.toFixed(6)}&lon=${p.lon.toFixed(6)}&zoom=18&addressdetails=1&accept-language=fr`);
        if (j.error || !j.address || typeof j.address !== 'object') throw new Error('Adresse indisponible');
        const a = j.address, here = locality(a), d0 = geo47.dept;
        // Une réponse tardive ne sert plus si l'on s'est éloigné entre-temps.
        if (valid(loc) && distance(p, loc) < 2) {
          current = here; addressPos = p; addressAt = Date.now();
          geoA = { num: a.house_number || '', road: a.road || a.pedestrian || a.footway || a.path || '', quarter: a.suburb || a.quarter || '', city: here ? here.name : '', cp: a.postcode || '', dep: a.county || a.state_district || '', reg: a.state || '' };
          city = geoA.city; cityAt = Date.now(); geoAt = cityAt; placeAt = cityAt;
          place = [geoA.road, geoA.city].filter(Boolean).join(', ') || 'Position GPS';
          geo47 = { city, dept: geoA.dep, cc: (a.country_code || '').toLowerCase(), at: cityAt, pos: p };
          if (d0 !== geo47.dept) vigAt = 0;
        }
        }
      } catch (e) { problems.push('Adresse indisponible'); }
      try {
        if (nearbyPos && distance(p, nearbyPos) < 0.03 && Date.now() - nearbyAt < 300000) {
          // Même cache pour la liste des centres à l'arrêt.
        } else {
        // Pas de tri par taille, de préférence au cap ni d'exclusion à moins de 500 m.
        // La sélection se fait sur la distance réelle à tous les centres retournés.
        const q = `[out:json][timeout:12];nwr(around:25000,${p.lat.toFixed(5)},${p.lon.toFixed(5)})[place~"^(city|town|village|hamlet)$"][name];out center;`;
        const j = await json('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(q));
        if (!Array.isArray(j.elements) || j.remark) throw new Error('Liste incomplète');
        const list = j.elements.map(e => ({ name: e.tags && e.tags.name, kind: e.tags && e.tags.place, lat: e.lat != null ? e.lat : e.center && e.center.lat, lon: e.lon != null ? e.lon : e.center && e.center.lon })).filter(x => valid(x) && typeof x.name === 'string' && x.name.trim());
        nearby = list; nearbyPos = p; nearbyAt = Date.now();
        plList = list.map(x => ({ n: x.name, k: x.kind, lat: x.lat, lon: x.lon })); plPos = p; plAt = nearbyAt; plPick = null;
        }
      } catch (e) { problems.push('Lieux proches indisponibles'); }
      error = problems.join(' · ');
      dlogAdd('route', `lieux : ${current ? current.name : '—'}, ${nearby.length} centres proches${error ? ' · ' + error : ''}`);
      if (tab === 'home') paint();
      paintSigns();
    })().finally(() => { pending = null; });
    return pending;
  }
  function here() {
    if (!fresh() || !addressPos || distance(loc, addressPos) > 2 || Date.now() - addressAt > Math.max(every() * 2, distance(loc, addressPos) < 0.03 ? 300000 : 120000)) return null;
    return current;
  }
  function roadPlace() {
    if (!fresh()) return null;
    const highway = roadScene() === 'autoroute';
    if (!highway) {
      const h = here(); return h ? { name: h.name, kind: h.kind, km: null, highway: false } : null;
    }
    if (!nearbyPos || distance(loc, nearbyPos) > 20 || Date.now() - nearbyAt > Math.max(every() * 2, distance(loc, nearbyPos) < 0.03 ? 300000 : 120000)) return null;
    const best = nearest(nearby.filter(x => distance(loc, x) <= 25), loc);
    return best ? { name: best.name, kind: best.kind, km: distance(loc, best), highway: true } : null;
  }
  // Adresse discrète au bord inférieur de la route, sans modifier le décor.
  function roadAddress() {
    if (!fresh()) return 'GPS en attente…';
    if (!addressPos || !addressAt || distance(loc, addressPos) > 2 ||
        Date.now() - addressAt > Math.max(every() * 2, distance(loc, addressPos) < 0.03 ? 300000 : 120000)) return 'Adresse indisponible';
    const g = geoA || {};
    const street = [g.num, g.road].filter(Boolean).join(' ');
    const town = [g.cp, g.city].filter(Boolean).join(' ');
    return [street, town].filter(Boolean).join(' · ') || 'Adresse indisponible';
  }
  function paintSigns() {
    const pl = roadPlace();
    document.querySelectorAll('#screen [data-roadbox]').forEach(box => {
      let sign = box.querySelector('.place710');
      if (!sign) { sign = document.createElement('div'); sign.className = 'place710'; sign.setAttribute('role', 'status'); box.appendChild(sign); }
      let address = box.querySelector('.roadAddress722');
      if (!address) {
        address = document.createElement('div');
        address.className = 'roadAddress722';
        box.appendChild(address);
      }
      // textContent empêche une adresse reçue du réseau d'injecter du HTML.
      address.textContent = roadAddress();
      address.title = address.textContent;
      const hw = pl && pl.highway;
      sign.classList.toggle('highway710', !!hw);
      sign.classList.toggle('trunk710', !!hw && !!window.__panelGreen);
      sign.classList.toggle('waiting710', !pl);
      sign.textContent = pl ? (hw ? `${pl.name} · ${pl.km < 1 ? '< 1' : Math.round(pl.km)} km` : pl.name.toLocaleUpperCase('fr')) : (!fresh() ? 'GPS en attente…' : error ? 'Localité indisponible · nouvelle tentative automatique' : 'Recherche de la localité…');
      sign.title = pl ? (hw ? 'Localité la plus proche · distance à vol d’oiseau' : 'Localité à la position GPS') : error;
      box.querySelectorAll('[data-k="roadAddr"], [data-k="adrStreet"]').forEach(el => { el.parentElement.style.visibility = 'hidden'; });
    });
  }
  return { intervals, every, refresh, roadPlace, roadAddress, here, paintSigns, locality, nearest, valid, status: () => ({ attempt, addressAt, nearbyAt, error, busy: !!pending }) };
})();

// Les anciens appels GPS, vigilance et liste de lieux partagent la même requête.
window.Place710Refresh = () => Place710.refresh();
window.updatePlace = window.Place710Refresh;
geoUpdate = () => Place710.refresh();
plFetch = () => Place710.refresh();
window.roadPlace = () => Place710.roadPlace();
{ const old = sceneWanted; sceneWanted = function () {
  const w = old();
  if (store.get('roadScene', 'auto') !== 'auto' || w === 'autoroute') return w;
  const h = Place710.here();
  if (h) return /^(village|hamlet)$/.test(h.kind) ? 'village' : 'ville';
  return w;
}; }

{ const style = document.createElement('style'); style.textContent = `
  .roadAddress722{position:absolute;left:4px;right:4px;bottom:2px;z-index:8;color:#fff;background:transparent;border:0;padding:0;text-align:center;font:600 clamp(9px,1vw,12px)/1.15 Inter,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 3px #000,0 0 3px #000;pointer-events:none}
  .place710{position:absolute;left:auto;right:3%;top:38%;bottom:auto;width:28%;min-height:28px;padding:4px 6px;display:flex;align-items:center;justify-content:center;background:#fff;color:#161616;border:3px solid #d4202a;outline:2px solid #fff;border-radius:4px;font:700 clamp(11px,1.2vw,17px)/1.15 Inter,sans-serif;text-align:center;overflow-wrap:anywhere;pointer-events:none;z-index:4;box-shadow:0 2px 7px #0006}
  .place710::before,.place710::after{content:"";position:absolute;top:calc(100% + 3px);width:3px;height:22px;background:#d9dee6;box-shadow:0 1px 2px #0005}
  .place710::before{left:14%}.place710::after{right:14%}
  .place710.highway710{background:#1554b4;color:#fff;border:2px solid #fff;outline:3px solid #1554b4}
  .place710.trunk710{background:#176c40;outline-color:#176c40}
  .place710.waiting710{background:#10244bd9;color:#e5edff;border:0;outline:0;font-size:11px;min-height:24px}
  .place710.waiting710::before,.place710.waiting710::after{display:none}
`; document.head.appendChild(style); }
displayEvery725(() => { Place710.refresh(); Place710.paintSigns(); }, 1000);
{ const old = render; window.render = function () { const r = old.apply(this, arguments); Place710.paintSigns(); return r; }; }


// Recherche de la chaussée la plus proche, plutôt que de la première voie renvoyée.
const Road710 = {
  distance(p, geometry) {
    if (!Array.isArray(geometry) || geometry.length < 2) return Infinity;
    const kx = 111320 * Math.cos(p.lat * Math.PI / 180), ky = 111320;
    let best = Infinity;
    for (let i = 1; i < geometry.length; i++) {
      const a = geometry[i - 1], b = geometry[i];
      if (!Place710.valid(a) || !Place710.valid(b)) continue;
      const ax = (a.lon - p.lon) * kx, ay = (a.lat - p.lat) * ky;
      const dx = (b.lon - a.lon) * kx, dy = (b.lat - a.lat) * ky, den = dx * dx + dy * dy;
      const t = den ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / den)) : 0;
      best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy));
    }
    return best;
  },
  choose(elements, p) {
    return elements.filter(e => e.tags && e.tags.highway && Array.isArray(e.geometry))
      .reduce((best, e) => !best || this.distance(p, e.geometry) < this.distance(p, best.geometry) ? e : best, null);
  }
};
window.maybeLimit = async function () {
  if (!loc || DEMO || limitBusy || Date.now() - loc.ts > 60000) return;
  const movingNow = (curSpeed() || {}).v > 5;
  if (limitPos && Date.now() - limitAt < (movingNow ? 8000 : 60000)) return;
  limitBusy = true; limitAt = Date.now();
  const p = limitPos = { lat: loc.lat, lon: loc.lon };
  try {
    const radius = Math.min(100, Math.max(30, Number(loc.acc) || 30));
    const q = `[out:json][timeout:8];way(around:${radius},${p.lat.toFixed(6)},${p.lon.toFixed(6)})[highway~"^(motorway|motorway_link|trunk|trunk_link|primary|secondary|tertiary|unclassified|residential|living_street|service|road|primary_link|secondary_link|tertiary_link)$"];out geom;`;
    const j = await getJSON('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(q));
    if (!Array.isArray(j.elements) || j.remark) return;
    if (!loc || hav(p.lat, p.lon, loc.lat, loc.lon) > 0.4) return;
    const best = Road710.choose(j.elements, p);
    limit = best ? parseMax(best.tags.maxspeed) : null;
    roadHw = best ? best.tags.highway : ''; roadHwAt = best ? Date.now() : 0;
    // Un numéro Mxxx ne prouve pas qu'il s'agit d'une autoroute.
    window.__panelGreen = !!best && /^trunk/.test(best.tags.highway);
    limitOkAt = Date.now(); limitOkPos = p;
  } catch (e) { /* L'ancien garde-fou efface la limitation périmée. */ }
  finally { limitBusy = false; }
};

// Coordonnées de fenêtre : origine réelle de la WebView, pixels physiques et marge du cadre.
const Frame710 = (() => {
  const native = () => window.GpsDock || null;
  const embedded = () => { try { const n = native(); return !!(n && n.gpsCanEmbed && n.gpsCanEmbed()); } catch (e) { return false; } };
  function viewport() {
    try { const n = native(); const m = n && n.gpsViewport ? JSON.parse(String(n.gpsViewport())) : null; if (m && ['x','y','width','height'].every(k => Number.isFinite(m[k])) && m.width > 0 && m.height > 0) return m; } catch (e) { /* ancien module */ }
    return { x: 0, y: 0, width: innerWidth * (devicePixelRatio || 1), height: innerHeight * (devicePixelRatio || 1) };
  }
  function rect(loose) {
    const el = document.querySelector('#screen .gpsbox');
    if (!el || tab !== 'home' || editing || gbMenu || (window.Perf725 && Perf725.paused())) return null;
    const r = el.getBoundingClientRect(), v = viewport(), kx = v.width / innerWidth, ky = v.height / innerHeight;
    if (r.width < 60 || r.height < 60) return null;
    if (!loose) { const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (!top || !el.contains(top)) return null; }
    const padx = 4 * kx, pady = 4 * ky, dx = Number(store.get('gbOffX', 0)) || 0, dy = Number(store.get('gbOffY', 0)) || 0;
    const bottom = v.y + v.height, right = v.x + v.width;
    const a = [Math.max(v.x, v.x + r.left * kx + padx + dx), Math.max(v.y, v.y + r.top * ky + pady + dy), Math.min(right, v.x + r.right * kx - padx + dx), Math.min(bottom, v.y + r.bottom * ky - pady + dy)].map(Math.round);
    return a[2] - a[0] >= 60 && a[3] - a[1] >= 60 ? a : null;
  }
  let embedLive = false, last = '', settling = 0;
  function sync() {
    if (embedLive && !embedded()) {
      native().gpsVisible(false); embedLive = false; gbLive = false;
      store.set('gbMode', '');
      toast('Intégration native refusée par Android. Touche le cadre pour essayer la fenêtre Android.');
      return;
    }
    if (embedded()) {
      const n = native(), r = rect();
      const show = embedLive && !!r && !document.hidden;
      if (!show) { n.gpsVisible(false); return; }
      const key = r.join(',');
      if (key !== last) { n.gpsBounds(r[0], r[1], r[2] - r[0], r[3] - r[1]); last = key; }
      n.gpsVisible(true);
      return;
    }
    if (window.Window723) { Window723.sync(); return; }
    if (!gbLive || gbMode() !== 'cadre' || document.hidden || !rect() || Date.now() < settling) return;
    const r = rect(), prev = store.get('gbLastRect', null);
    if (!prev || prev.pk !== gbPk() || r.some((v, i) => Math.abs(v - prev.r[i]) > 2)) {
      const n = native();
      let resized = false;
      try { resized = !!(n && n.gpsResize && n.gpsResize(gbPk(), ...r)); } catch (e) { /* tentative normale ci-dessous */ }
      if (resized) { gbKey = gbPk() + '|' + r.join(','); store.set('gbLastRect', { pk: gbPk(), r, t: Date.now() }); }
      else { settling = Date.now() + 3500; gbLaunch(true, 'alignement du cadre', true); }
    }
  }
  function openEmbedded() {
    const r = rect(true), n = native(); if (!r || !embedded()) return false;
    n.gpsBounds(r[0], r[1], r[2] - r[0], r[3] - r[1]); n.gpsVisible(true); n.gpsOpen(gbPk());
    embedLive = true; last = r.join(','); gbLive = true; store.set('gbMode', 'cadre');
    store.set('gbLastRect', { pk: gbPk(), r, t: Date.now() });
    return true;
  }
  function applyImmersive() {
    try { const n = native(); if (n && n.gpsImmersive) n.gpsImmersive(); } catch (e) { /* firmware */ }
  }
  function closeEmbedded() { embedLive = false; const n = native(); if (n) n.gpsVisible(false); }
  return { rect, viewport, embedded, sync, openEmbedded, closeEmbedded, applyImmersive };
})();
gbRect = Frame710.rect;
{ const old = gbFull; gbFull = function () { Frame710.closeEmbedded(); return old.apply(this, arguments); }; }
{ const old = gbLaunch; gbLaunch = function () {
  if (Frame710.embedded() && Frame710.openEmbedded()) return;
  return old.apply(this, arguments);
}; }
// Suivi continu : même un déplacement de quelques pixels ou un redimensionnement de barre compte.
// La boucle unique de secours est installée par v725.js et stoppée hors Accueil.
window.addEventListener('resize', () => { fit(); setTimeout(Frame710.sync, 250); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) { Frame710.applyImmersive(); setTimeout(Frame710.sync, 350); } });

{ const nav = SETCATS.find(c => c[0] === 'Navigation');
  if (nav) nav[1].unshift(['Panneaux et localités', p => `<div style="display:flex;flex-direction:column;gap:12px;max-width:820px">
    ${setRow(p, 'Actualiser les panneaux', 'Ville ou village à ta position. Sur autoroute : localité la plus proche, distance à vol d’oiseau. GPS et Internet nécessaires.', '<div style="display:flex;gap:8px;flex-wrap:wrap">' + Place710.intervals.map(s => chipBtn(p, 'place710:every:' + s, s < 60 ? s + ' s' : s / 60 + ' min', Place710.every() === s * 1000)).join('') + '</div>')}
    ${setRow(p, 'Actualiser maintenant', 'Les requêtes en cours sont partagées pour éviter les doublons.', chipBtn(p, 'place710:refresh', 'Actualiser'))}
    <div style="font-size:13px;color:${p.mut}">Données © OpenStreetMap. Les noms dépendent des données cartographiques disponibles. Sans réponse récente, le panneau indique l’indisponibilité.</div></div>`]); }
{ const cat = SETCATS.find(c => c[0] === "Écran d'accueil") || SETCATS.find(c => c[0] === 'Navigation');
  if (cat) cat[1].push(['Alignement GPS et plein écran', p => `<div style="display:flex;flex-direction:column;gap:12px;max-width:820px">
    ${setRow(p, 'Position horizontale du GPS', 'Pixels physiques ; le cadre garde une bordure visible.', chipBtn(p, 'frame710:x:-4', '←') + ' ' + (Number(store.get('gbOffX', 0)) || 0) + ' px ' + chipBtn(p, 'frame710:x:4', '→'))}
    ${setRow(p, 'Position verticale du GPS', 'Descendre ou remonter la fenêtre pour la faire correspondre au cadre.', chipBtn(p, 'frame710:y:-4', '↑') + ' ' + (Number(store.get('gbOffY', 0)) || 0) + ' px ' + chipBtn(p, 'frame710:y:4', '↓'))}
    ${setRow(p, 'Revenir à l’alignement automatique', 'Supprime les corrections manuelles de position.', chipBtn(p, 'frame710:reset', 'Réinitialiser'))}
    ${setRow(p, 'Masquer la barre du haut', 'Applique le plein écran à l’accueil et le réapplique au retour. La barre imposée par le firmware ou la fenêtre Waze peut rester visible.', chipBtn(p, 'frame710:immersive', 'Masquer'))}
    <div style="font-size:14px;color:${p.mut}">${Frame710.embedded() ? 'Intégration native disponible : Waze suit directement le cadre.' : 'Fenêtre Android : déplacement direct si le poste l’autorise, sinon nouvelle demande de position. L’intégration native sans titre nécessite Android 10/11 et la permission système ACTIVITY_EMBEDDING.'}</div></div>`]); }
{ const old = window.act; window.act = function (a, long) {
  if (a.startsWith('place710:every:')) {
    const n = Number(a.split(':')[2]); if (Place710.intervals.includes(n)) store.set('placeEvery', n);
    render(); return;
  }
  if (a === 'place710:refresh') { Place710.refresh(true); toast('Actualisation des localités…'); return; }
  if (a.startsWith('frame710:')) {
    const parts = a.split(':'), dir = parts[1], val = Number(parts[2]);
    if ((dir === 'x' || dir === 'y') && Number.isFinite(val)) {
      const key = dir === 'x' ? 'gbOffX' : 'gbOffY'; store.set(key, Math.max(-160, Math.min(160, (Number(store.get(key, 0)) || 0) + val)));
    } else if (dir === 'reset') { store.set('gbOffX', 0); store.set('gbOffY', 0); }
    else if (dir === 'immersive') { if (A && A.setImmersive) A.setImmersive(true); Frame710.applyImmersive(); toast('Plein écran demandé'); }
    render(); return;
  }
  return old.apply(this, arguments);
}; }

// La demande 7.10 est de retrouver le cadre normal et de masquer la barre supérieure.
// Le décalage réservé reste réactivable dans les réglages si le poste impose sa barre.
if (!store.get('frame710Migrated', false)) {
  store.set('gbBarOn', false); store.set('frame710Migrated', true);
  if (A && A.setImmersive) A.setImmersive(true);
}
setTimeout(() => { Frame710.applyImmersive(); gbBarApply(gbBarWant()); }, 500);
