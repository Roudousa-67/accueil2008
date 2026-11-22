/* 7.38 : stations — tous les carburants d'un coup, filtres (carburant, rayon, paiement),
   AdBlue, carte avec bulles de prix et fiche de la station.
   Sources : flux officiel « Prix des carburants » (France), Tankerkönig / MTS-K (Allemagne,
   clé personnelle), OpenStreetMap pour le paiement, l'AdBlue et l'enseigne. */
(() => {
 'use strict';
 // clé interne, libellé, champ du flux France, champ Tankerkönig
 const FUELS = [['Gazole', 'Gazole', 'gazole', 'diesel'], ['E10', 'SP95-E10', 'e10', 'e10'], ['SP95', 'SP95', 'sp95', 'e5'], ['SP98', 'SP98', 'sp98', ''], ['E85', 'E85', 'e85', ''], ['GPLc', 'GPL', 'gplc', ''], ['AdBlue', 'AdBlue', '', '']];
 const RADII = [2, 5, 10, 20, 30];
 const FR_BASE = 'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records';
 const TK = 'https://creativecommons.tankerkoenig.de/json/list.php';
 const OVERPASS = 'https://overpass-api.de/api/interpreter?data=';
 // Clé Tankerkönig du propriétaire, intégrée à sa demande (le dépôt est public : elle y est lisible).
 // Enregistrée une seule fois : une clé saisie ou effacée dans les réglages reste prioritaire.
 const BUILTIN_TK = ['ea55960e', 'b3e6', '421f', '858e', '37a20b744fb0'].join('-');
 if (!store.get('tk738Init', false)) { if (!String(store.get('tkKey', '') || '').trim()) store.set('tkKey', BUILTIN_TK); store.set('tk738Init', true); }
 const S = { all: [], osm: [], osmAt: 0, osmPos: null, osmRad: 0, osmError: '', frError: '', busy: null, testAt: 0, pick: -1 };
 const fuelLabel = k => (FUELS.find(f => f[0] === k) || [k, k])[1];
 const prefs = () => Object.assign({ fuel: store.get('fuel', 'E10'), pay: 'all', sort: 'distance', country: 'all' }, store.get('st738f', {}) || {});
 const setPref = (k, v) => { const p = Object.assign({}, store.get('st738f', {}) || {}); p[k] = v; store.set('st738f', p); };
 const price3 = v => v.toFixed(3).replace('.', ',');
 const km = d => d < 1 ? Math.round(d * 1000) + ' m' : (d < 10 ? d.toFixed(1).replace('.', ',') : Math.round(d)) + ' km';
 const title = s => String(s || '').toLowerCase().replace(/(^|[\s'-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());

 // ---------- Lecture des sources ----------
 function list(v) {
  if (Array.isArray(v)) return v.map(x => String(x).trim()).filter(Boolean);
  if (v && typeof v === 'object') return list(v.service || v.services || []);
  if (typeof v === 'string' && v.trim()) { try { return list(JSON.parse(v)); } catch (e) { return v.split(/\s*[;,]\s*/).filter(Boolean); } }
  return [];
 }
 function frPrice(r, fk) {
  const key = Object.keys(r).find(x => x.toLowerCase() === fk + '_prix');
  let pr = key ? parseFloat(r[key]) : NaN; if (pr > 10) pr /= 1000;
  return pr > 0 ? pr : 0;
 }
 function frStation(r) {
  const g = r.geom || {}, lat = +g.lat || (+r.latitude > 1000 ? r.latitude / 1e5 : +r.latitude), lon = +g.lon || (+r.longitude > 1000 ? r.longitude / 1e5 : +r.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !lat || !lon) return null;
  const prices = {}, maj = {};
  for (const [k, , fk] of FUELS) if (fk) { const pr = frPrice(r, fk); if (pr) { prices[k] = pr; const m = r[fk + '_maj']; maj[k] = m ? Date.parse(m) || 0 : 0; } }
  const services = list(r.services_service).length ? list(r.services_service) : list(r.services);
  const out = list(r.carburants_indisponibles).concat(list(r.carburants_rupture_temporaire));
  const auto = /^oui$/i.test(String(r.horaires_automate_24_24 || '').trim()) || services.some(x => /automate.*24/i.test(x));
  return { c: 'FR', id: 'fr' + (r.id || lat.toFixed(5) + lon.toFixed(5)), name: String(r.enseigne || r.nom || '').trim(), city: r.ville || '', addr: [r.adresse, r.ville].filter(Boolean).join(', '), lat, lon, prices, maj, services, out,
   auto24: auto, card: auto ? true : null, cash: null, adblue: services.some(x => /adblue/i.test(x)) ? true : null, dab: services.some(x => /\bDAB\b|billets/i.test(x)), highway: String(r.pop || '').toUpperCase() === 'A' };
 }
 async function fetchFR(lat, lon, rad, extraWhere) {
  const geo = `within_distance(geom, geom'POINT(${lon.toFixed(5)} ${lat.toFixed(5)})', ${rad}km)` + (extraWhere ? ' AND ' + extraWhere : ''), out = [];
  // 100 résultats au plus par page : plusieurs pages pour ne plus perdre les stations proches.
  for (let off = 0; off < 300; off += 100) {
   const j = await getJSON(`${FR_BASE}?where=${encodeURIComponent(geo)}&limit=100&offset=${off}`);
   if (j && (j.error_code || j.errorcode)) throw Error(String(j.message || j.error_code || 'requête refusée').slice(0, 90));
   const recs = (j && j.results) || [];
   for (const r of recs) { const s = frStation(r); if (s) out.push(s); }
   if (recs.length < 100 || !(Number(j.total_count) > off + 100)) break;
  }
  return out;
 }
 function deStation(t) {
  const prices = {};
  for (const [k, , , dk] of FUELS) if (dk) { const v = Number(t[dk]); if (v > 0) prices[k] = v; }
  return { c: 'DE', id: 'de' + t.id, name: String(t.brand || t.name || 'Tankstelle').trim(), city: t.place || '', addr: [[t.street, t.houseNumber].filter(Boolean).join(' '), t.place].filter(Boolean).join(', '), lat: +t.lat, lon: +t.lng, prices, maj: {}, services: [], out: [],
   closed: t.isOpen === false, auto24: null, card: null, cash: null, adblue: null, highway: /\bBAB\b|autobahn|\bA ?\d{1,3}\b/i.test(String(t.street || '') + ' ' + String(t.name || '')) };
 }
 async function fetchDE(lat, lon, rad, key) {
  const j = await getJSON(`${TK}?lat=${lat.toFixed(5)}&lng=${lon.toFixed(5)}&rad=${Math.min(25, rad)}&sort=dist&type=all&apikey=${encodeURIComponent(key)}`);
  if (!j || !j.ok) throw Error(j && j.message || 'clé refusée');
  return (j.stations || []).map(deStation).filter(s => Number.isFinite(s.lat) && Number.isFinite(s.lon));
 }
 async function fetchOSM(lat, lon, rad) {
  const q = `[out:json][timeout:25];nwr["amenity"="fuel"](around:${Math.round(rad * 1000)},${lat.toFixed(5)},${lon.toFixed(5)});out tags center;`;
  const j = await getJSON(OVERPASS + encodeURIComponent(q));
  return ((j && j.elements) || []).map(e => {
   const la = Number.isFinite(e.lat) ? e.lat : e.center && e.center.lat, lo = Number.isFinite(e.lon) ? e.lon : e.center && e.center.lon;
   return Number.isFinite(la) && Number.isFinite(lo) ? { lat: la, lon: lo, tags: e.tags || {} } : null;
  }).filter(Boolean);
 }
 const CASH = ['payment:cash', 'payment:coins', 'payment:notes'];
 const CARD = ['payment:credit_cards', 'payment:debit_cards', 'payment:cards', 'payment:visa', 'payment:mastercard', 'payment:maestro', 'payment:girocard', 'payment:cb', 'payment:v_pay'];
 function osmInfo(t) {
  const yes = k => t[k] === 'yes', no = k => t[k] === 'no', has = keys => keys.filter(k => k in t);
  return {
   cash: CASH.some(yes) ? true : has(CASH).length && has(CASH).every(no) ? false : null,
   card: CARD.some(yes) ? true : has(CARD).length && has(CARD).every(no) ? false : null,
   adblue: t['fuel:adblue'] === 'yes' ? true : t['fuel:adblue'] === 'no' ? false : null,
   brand: String(t.brand || t.name || t.operator || '').trim(), hours: String(t.opening_hours || '')
  };
 }
 // Les positions du flux officiel et d'OpenStreetMap diffèrent souvent de quelques dizaines de mètres.
 function merge(stations, osm) {
  const used = new Set();
  for (const s of stations) {
   let best = -1, bd = .15;
   for (let i = 0; i < osm.length; i++) { const d = hav(s.lat, s.lon, osm[i].lat, osm[i].lon); if (d < bd) { bd = d; best = i; } }
   if (best < 0) continue;
   used.add(best); const o = osmInfo(osm[best].tags);
   s.osm = true; if (!s.name && o.brand) s.name = o.brand;
   if (s.cash == null) s.cash = o.cash; if (s.card == null) s.card = o.card; if (s.adblue == null) s.adblue = o.adblue; s.hours = o.hours;
  }
  const extra = osm.filter((o, i) => !used.has(i)).map(o => { const x = osmInfo(o.tags);
   return { c: 'OSM', id: 'osm' + o.lat.toFixed(5) + o.lon.toFixed(5), name: x.brand, city: o.tags['addr:city'] || '', addr: [[o.tags['addr:street'], o.tags['addr:housenumber']].filter(Boolean).join(' '), o.tags['addr:city']].filter(Boolean).join(', '), lat: o.lat, lon: o.lon, prices: {}, maj: {}, services: [], out: [], auto24: null, card: x.card, cash: x.cash, adblue: x.adblue, highway: false, osm: true, hours: x.hours }; });
  const all = stations.concat(extra);
  for (const s of all) if (!s.name) s.name = s.city ? 'Station de ' + title(s.city) : 'Station';
  return all;
 }

 // ---------- Mise à jour ----------
 function publish() {
  // Liste historique (widget « Stations autour », coût des trajets) : prix du carburant de la voiture.
  const fuel = store.get('fuel', 'E10');
  st47.list = S.all.filter(s => s.c !== 'OSM' && s.prices[fuel] > 0).map(s => ({ c: s.c, name: s.name, addr: s.addr, price: s.prices[fuel], lat: s.lat, lon: s.lon, dist: s.dist, closed: !!s.closed, maj: s.maj[fuel] || 0, id: s.id }));
  if (st47.list.length) { st47.msg = ''; if (typeof st47Publish === 'function') st47Publish(); }
 }
 function refreshDistances() { if (loc) for (const s of S.all) s.dist = hav(loc.lat, loc.lon, s.lat, s.lon); }
 async function run(force) {
  const rad = Number(store.get('stRad', 10)), now = Date.now(), here = { lat: loc.lat, lon: loc.lon };
  st47.at = now; st47.pos = here;
  let fr = [];
  try { fr = await fetchFR(here.lat, here.lon, rad); S.frError = ''; } catch (e) { S.frError = 'France : flux indisponible (' + String(e && e.message || e).slice(0, 60) + ')'; }
  // Allemagne : clé personnelle ; au plus une demande toutes les 5 minutes (1 min si tu actualises).
  const key = String(store.get('tkKey', '') || '').trim();
  if (key && st47InDE(here.lat, here.lon)) {
   if (now - st47.deAt >= (force === 'user' ? 60e3 : 5 * 60e3) || st47.deRad !== rad) {
    st47.deAt = now; st47.deRad = rad; st47.de = '';
    try { st47.deList = await fetchDE(here.lat, here.lon, rad, key); } catch (e) { st47.de = 'Allemagne : ' + String(e && e.message || 'prix indisponibles').slice(0, 80); }
   }
  } else { st47.de = key ? '' : (st47InDE(here.lat, here.lon) ? 'Allemagne : ajoute ta clé Tankerkönig (Carburant et stations).' : ''); }
  const de = now - st47.deAt < 30 * 60e3 ? (st47.deList || []).map(s => Object.assign({}, s)) : [];
  S.all = merge(fr.concat(de), S.osm); refreshDistances(); publish();
  if (!fr.length && !de.length) { st47.msg = S.frError || 'Aucun prix trouvé dans un rayon de ' + rad + ' km'; st47.at = now - 12 * 60e3; }
  else st47.msg = '';
  // Paiement et AdBlue (OpenStreetMap) : rafraîchis toutes les 30 min ou après un déplacement.
  if (force === 'user' || now - S.osmAt > 30 * 60e3 || !S.osmPos || S.osmRad < rad || hav(S.osmPos.lat, S.osmPos.lon, here.lat, here.lon) > rad / 2) {
   S.osmAt = now; S.osmPos = here; S.osmRad = rad;
   fetchOSM(here.lat, here.lon, rad).then(osm => { S.osm = osm; S.osmError = ''; S.all = merge(S.all.filter(s => s.c !== 'OSM').map(s => s), osm); refreshDistances(); publish(); if (onStations()) render(); })
    .catch(e => { S.osmError = 'Paiement et AdBlue : OpenStreetMap indisponible pour le moment.'; S.osmAt = now - 25 * 60e3; });
  }
  if (tab === 'home' || onStations()) render();
 }
 function update(force) {
  if (typeof DEMO !== 'undefined' && DEMO) { S.all = demo(); refreshDistances(); publish(); return Promise.resolve(); }
  if (!loc) { st47.msg = 'En attente du GPS…'; return Promise.resolve(); }
  const rad = Number(store.get('stRad', 10));
  if (!force && Date.now() - st47.at < 15 * 60e3 && st47.pos && hav(st47.pos.lat, st47.pos.lon, loc.lat, loc.lon) < Math.max(2, rad / 4)) return Promise.resolve();
  if (S.busy) return S.busy;
  S.busy = run(force).catch(e => { window.Errors738 && Errors738.add('stations', e); }).finally(() => { S.busy = null; });
  return S.busy;
 }
 function demo() {
  const base = loc ? [loc.lat, loc.lon] : [48.58, 7.75], at = (dy, dx) => [base[0] + dy, base[1] + dx];
  const mk = (c, name, addr, p, o) => { const [lat, lon] = at(p[0], p[1]); return Object.assign({ c, id: c + name, name, city: '', addr, lat, lon, prices: p[2], maj: {}, services: [], out: [], auto24: null, card: null, cash: null, adblue: null, highway: false }, o || {}); };
  return [mk('FR', 'TotalEnergies', 'Route du Rhin, Strasbourg', [.004, .006, { Gazole: 1.769, E10: 1.749, SP98: 1.859 }], { auto24: true, card: true, cash: true, adblue: true }),
   mk('FR', 'E.Leclerc', 'Rue de la Plaine, Geispolsheim', [-.03, -.02, { Gazole: 1.699, E10: 1.689, SP95: 1.719, E85: .899 }], { auto24: true, card: true, cash: false }),
   mk('FR', 'Esso Express', 'Avenue de Colmar, Strasbourg', [-.012, .01, { Gazole: 1.739, E10: 1.729, SP98: 1.829 }], { auto24: true, card: true }),
   mk('DE', 'ARAL', 'Hauptstraße 12, Kehl', [.0, .06, { Gazole: 1.619, E10: 1.639, SP95: 1.699 }], { adblue: true, cash: true, card: true }),
   mk('DE', 'JET', 'Rheinstraße 3, Kehl', [.008, .075, { Gazole: 1.589, E10: 1.609, SP95: 1.669 }], { closed: true }),
   mk('FR', 'Station de l’A35', 'Aire de Geispolsheim, A35', [-.045, -.005, { Gazole: 1.879, E10: 1.869, SP98: 1.959 }], { highway: true, auto24: true, card: true, adblue: true })];
 }

 // ---------- Page Stations ----------
 const onStations = () => tab === 'trips' && window.Journeys733 && Journeys733.state.view === 'fuel' && Journeys733.state.fuelView === 'stations';
 function rows() {
  if (!loc) return [];
  const f = prefs(), rad = Number(store.get('stRad', 10)), adblue = f.fuel === 'AdBlue';
  const out = S.all.map(s => Object.assign({}, s, { dist: hav(loc.lat, loc.lon, s.lat, s.lon), p: adblue ? 0 : (s.prices[f.fuel] || 0) }))
   .filter(s => s.dist <= rad && (f.country === 'all' || s.c === f.country || s.c === 'OSM' && f.country === 'FR' && !st47InDE(s.lat, s.lon)))
   .filter(s => adblue ? s.adblue === true : s.p > 0)
   .filter(s => f.pay === 'card' ? (s.card === true || s.auto24) : f.pay === 'cash' ? s.cash === true : f.pay === 'auto' ? !!s.auto24 : true);
  const key = f.sort === 'price' && !adblue ? 'p' : 'dist';
  return out.sort((a, b) => (a.closed ? 1 : 0) - (b.closed ? 1 : 0) || a[key] - b[key]);
 }
 function color(s, low, high) { if (!(s.p > 0)) return '#5f6b78'; const r = high > low ? (s.p - low) / (high - low) : 0; return `hsl(${Math.round(125 - r * 125)},62%,${36 + Math.round(r * 4)}%)`; }
 function badges(s, fuel) {
  const b = [];
  if (s.closed) b.push(['Fermée', '#b54a2c']);
  if (s.out && s.out.some(x => x.toLowerCase() === String(fuel).toLowerCase())) b.push(['Rupture ' + fuelLabel(fuel), '#b54a2c']);
  if (s.auto24) b.push(['CB 24h/24', '#2b6cb0']); else if (s.card === true) b.push(['Carte', '#2b6cb0']);
  if (s.cash === true) b.push(['Espèces', '#2f855a']); else if (s.cash === false) b.push(['Sans espèces', '#7b5a2a']);
  if (s.adblue === true) b.push(['AdBlue', '#2c7a9b']);
  if (s.highway) b.push(['Autoroute', '#4a5568']);
  return b.map(([t, c]) => `<i class="st738-b" style="background:${c}">${esc(t)}</i>`).join('');
 }
 const chip = (p, a, l, on) => chipBtn(p, 'st738:' + a, l, on);
 // Menus déroulants, même présentation que « Période » et « Conducteur ».
 const select = (key, label, options, value) => `<label>${esc(label)}<select data-st738="${key}">${options.map(([v, n]) => `<option value="${esc(String(v))}" ${String(v) === String(value) ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>`;
 document.addEventListener('change', e => { const el = e.target, key = el && el.dataset && el.dataset.st738; if (key) window.act('st738:' + key + ':' + el.value); });
 function card(p, s, f) {
  const prices = FUELS.filter(x => s.prices[x[0]] > 0).map(x => `<div><small>${esc(x[1])}</small><b>${price3(s.prices[x[0]])} €</b></div>`).join('');
  const pay = `Carte : ${s.auto24 ? 'oui, automate CB 24h/24' : s.card === true ? 'oui' : s.card === false ? 'non' : 'non renseigné'} · Espèces : ${s.cash === true ? 'oui' : s.cash === false ? 'non' : 'non renseigné'}${s.dab ? ' · distributeur de billets' : ''}`;
  return `<div class="st738-card"><div class="st738-card-h"><div><b>${esc(s.name)}</b><small>${esc(s.addr || '')} · ${km(s.dist)}</small></div>${chip(p, 'pick:-1', 'Fermer')}</div>
   <div class="st738-prices">${prices || '<div><small>Prix</small><b>non publiés</b></div>'}${s.adblue === true ? '<div><small>AdBlue</small><b>disponible</b></div>' : ''}</div>
   <p>${esc(pay)}${s.hours ? ' · Horaires : ' + esc(s.hours) : ''}</p><div class="st738-badges">${badges(s, f.fuel)}</div>
   <div class="st738-go">${chip(p, 'go:' + s.id, 'Y aller avec Waze', true)}${chip(p, 'gmaps:' + s.id, 'Ouvrir dans Google Maps')}</div></div>`;
 }
 function page(p) {
  const f = prefs(), rad = Number(store.get('stRad', 10)), list = rows(), known = list.filter(s => s.p > 0), low = Math.min(...known.map(s => s.p)), high = Math.max(...known.map(s => s.p));
  const pick = list.find(s => s.id === S.pickId);
  const busy = !!S.busy;
  return `<div class="j733-panel st738">
   <div class="j733-toolbar st738-tools">${select('fuel', 'Carburant', FUELS.map(x => [x[0], x[1]]), f.fuel)}${select('rad', 'Rayon', RADII.map(r => [r, r + ' km']), rad)}${select('pay', 'Paiement', [['all', 'Tous'], ['card', 'Carte'], ['auto', 'CB 24h/24'], ['cash', 'Espèces']], f.pay)}${select('sort', 'Trier', [['distance', 'La plus proche'], ['price', 'La moins chère']], f.sort)}${select('country', 'Pays', [['all', 'Tous'], ['FR', 'France'], ['DE', 'Allemagne']], f.country)}<span style="flex:1"></span>${chip(p, 'refresh', busy ? 'Recherche…' : 'Actualiser')}</div>
   <p class="st738-note">${esc([st47.msg, st47.de, S.frError, S.osmError].filter(Boolean).join(' · '))}${st47.at ? ` Dernière recherche : ${new Date(st47.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · ${list.length} station${list.length > 1 ? 's' : ''} à moins de ${rad} km.` : ' Aucune recherche effectuée.'}${f.fuel === 'AdBlue' ? ' Le prix de l’AdBlue n’est publié par aucune source : seules les stations qui en vendent sont montrées.' : ''}</p>
   <div class="st738-grid"><div class="st738-mapwrap">${list.length || loc ? '<div id="stationMap733" class="j733-map st738-map"></div>' : ''}${pick ? card(p, pick, f) : ''}</div>
   <div class="st738-list">${list.map(s => `<button class="j733-row st738-row${pick && pick.id === s.id ? ' on' : ''}" data-act="st738:pick:${esc(s.id)}" style="border-left:6px solid ${color(s, low, high)}"><div><b>${esc(s.name)}</b><small>${s.c === 'DE' ? 'Allemagne · ' : ''}${km(s.dist)} · ${esc(s.addr || '')}</small><span class="st738-badges">${badges(s, f.fuel)}</span></div><b style="color:${color(s, low, high)}">${s.p > 0 ? price3(s.p) + ' €' : f.fuel === 'AdBlue' ? 'AdBlue' : '—'}</b></button>`).join('') || `<p>Aucune station pour ces critères. Élargis le rayon ou change de filtre.</p>`}</div></div>
   <p class="st738-note">Prix : France (flux officiel, toutes les 10 min), Allemagne (Tankerkönig / MTS-K, CC BY 4.0, avec ta clé). Paiement, AdBlue et enseignes : automate CB 24h/24 déclaré dans le flux officiel, sinon OpenStreetMap (contributions bénévoles, parfois incomplètes). Distances à vol d’oiseau.</p></div>`;
 }

 // ---------- Carte ----------
 let map = null, layer = null, drawnKey = '', fitKey = '';
 function mount() {
  const el = document.getElementById('stationMap733');
  if (map && map.getContainer() !== el) { map.remove(); map = null; drawnKey = ''; fitKey = ''; }
  if (!el || typeof L === 'undefined') return;
  if (!map) { map = L.map(el, { zoomControl: true, attributionControl: true, zoomSnap: .5 }); (window.Maps738 ? Maps738.tiles(map) : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map)); layer = L.layerGroup().addTo(map); }
  const list = rows(), known = list.filter(s => s.p > 0), low = Math.min(...known.map(s => s.p)), high = Math.max(...known.map(s => s.p));
  const key = JSON.stringify([list.map(s => s.id + ':' + s.p), S.pickId, loc && [loc.lat.toFixed(4), loc.lon.toFixed(4)]]);
  if (key === drawnKey) return; drawnKey = key; layer.clearLayers();
  if (loc) {
   L.circle([loc.lat, loc.lon], { radius: Math.max(15, Math.min(150, loc.acc || 25)), color: '#1a73e8', weight: 1, fillColor: '#1a73e8', fillOpacity: .14, interactive: false }).addTo(layer);
   L.circleMarker([loc.lat, loc.lon], { radius: 8, color: '#fff', weight: 3, fillColor: '#1a73e8', fillOpacity: 1, interactive: false }).addTo(layer);
  }
  for (const s of list) {
   const on = s.id === S.pickId, text = s.p > 0 ? price3(s.p) : 'AdBlue';
   const icon = L.divIcon({ className: 'st738-pin', html: `<div class="st738-bub${on ? ' on' : ''}${s.closed ? ' off' : ''}" style="--c:${color(s, low, high)}"><b>${esc(text)}</b><small>${esc(String(s.name).slice(0, 14))}</small></div>`, iconSize: null, iconAnchor: [0, 0] });
   L.marker([s.lat, s.lon], { icon, zIndexOffset: on ? 1000 : Math.round(-s.dist * 10) }).addTo(layer).on('click', () => window.act('st738:pick:' + s.id));
  }
  const fk = JSON.stringify(list.map(s => s.id));
  if (fk !== fitKey) {
   fitKey = fk;
   const pts = list.slice(0, 25).map(s => [s.lat, s.lon]).concat(loc ? [[loc.lat, loc.lon]] : []);
   if (pts.length > 1) map.fitBounds(pts, { padding: [40, 40], maxZoom: 15 }); else if (pts.length) map.setView(pts[0], 14); else map.setView([48.58, 7.75], 10);
  }
  const pick = list.find(s => s.id === S.pickId);
  if (pick && !map.getBounds().pad(-.15).contains([pick.lat, pick.lon])) map.panTo([pick.lat, pick.lon]);
 }

 function openLink(url) {
  const A = window.Android;
  try { if (A && A.openUrl) { if (A.openUrl(url) === false) toast('Aucune application compatible sur le poste.'); return; } } catch (e) {}
  window.open(url, '_blank');
 }
 async function testKey() {
  const el = document.getElementById('tk47'), v = (el ? el.value : String(store.get('tkKey', '') || '')).trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) { toast('Colle d’abord la clé (format 00000000-0000-0000-0000-000000000000).'); return; }
  if (Date.now() - S.testAt < 60000) { toast('Attends une minute entre deux tests (règle Tankerkönig).'); return; }
  S.testAt = Date.now();
  const here = loc && Number.isFinite(loc.lat) && st47InDE(loc.lat, loc.lon) ? loc : { lat: 48.5734, lon: 7.8150 };
  toast('Test de la clé…');
  try {
   const j = await getJSON(`${TK}?lat=${here.lat.toFixed(5)}&lng=${here.lon.toFixed(5)}&rad=5&sort=dist&type=all&apikey=${encodeURIComponent(v)}`);
   if (j && j.ok) { store.set('tkKey', v); st47.deAt = 0; toast(`Clé acceptée et enregistrée : ${(j.stations || []).length} stations allemandes trouvées${here === loc ? '' : ' autour de Kehl'}.`); update(true); }
   else toast('Clé refusée par Tankerkönig : ' + String(j && j.message || 'réponse inattendue').slice(0, 90));
  } catch (e) { toast('Test impossible : ' + String(e && e.message || 'pas de réseau').slice(0, 80)); }
  render();
 }

 const act0 = window.act;
 window.act = function (a, long) {
  if (typeof a === 'string' && a.startsWith('st738:')) {
   const [, op, ...rest] = a.split(':'), arg = rest.join(':');
   if (op === 'fuel' && FUELS.some(x => x[0] === arg)) { setPref('fuel', arg); S.pickId = null; render(); return; }
   if (op === 'rad' && RADII.includes(Number(arg))) { store.set('stRad', Number(arg)); S.pickId = null; update(true); render(); return; }
   if (op === 'pay' && ['all', 'card', 'auto', 'cash'].includes(arg)) { setPref('pay', arg); render(); return; }
   if (op === 'sort' && ['distance', 'price'].includes(arg)) { setPref('sort', arg); render(); return; }
   if (op === 'country' && ['all', 'FR', 'DE'].includes(arg)) { setPref('country', arg); render(); return; }
   if (op === 'pick') { S.pickId = arg === '-1' ? null : arg; render(); return; }
   if (op === 'refresh') { update('user').then(() => render()); render(); return; }
   if (op === 'test') { testKey(); return; }
   const s = S.all.find(x => x.id === arg);
   if (op === 'go' && s) { openLink(`https://waze.com/ul?ll=${s.lat},${s.lon}&navigate=yes`); return; }
   if (op === 'gmaps' && s) { openLink(`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lon}&travelmode=driving`); return; }
   return;
  }
  return act0.apply(this, arguments);
 };

 // Remplace la recherche de la 6.4 : mêmes appels (minuteur, bouton ⟳, réglages).
 window.st47Update = update; window.updateStation = update;
 const css = document.createElement('style');
 css.textContent = `.st738{display:flex;flex-direction:column;gap:10px}.st738-bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.st738-g{display:inline-flex;gap:5px;align-items:center;margin-right:10px}.st738-g>small{font-weight:700;opacity:.8;margin-right:2px}
 .st738-grid{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);gap:10px;align-items:start}.st738-list{max-height:430px;overflow:auto;display:flex;flex-direction:column;gap:6px}.st738-row{padding:8px 10px!important}.st738-row small{display:block}
 .st738-note{opacity:.78;font-size:13px;margin:0;line-height:1.4}.st738-mapwrap{position:relative}.st738-map{height:430px!important;border-radius:14px}
 .st738-pin{background:none;border:0}.st738-bub{position:absolute;transform:translate(-50%,calc(-100% - 9px));background:#fff;color:#1d2733;border-radius:10px;padding:3px 8px;box-shadow:0 2px 6px #0006;white-space:nowrap;text-align:center;border:2px solid var(--c);line-height:1.1}
 .st738-bub b{display:block;font-size:14px;color:var(--c)}.st738-bub small{display:block;font-size:10px;color:#4a5562}.st738-bub:after{content:'';position:absolute;left:50%;bottom:-9px;transform:translateX(-50%);border:8px solid transparent;border-bottom:0;border-top-color:var(--c)}
 .st738-bub.on{background:var(--c);transform:translate(-50%,calc(-100% - 9px)) scale(1.18)}.st738-bub.on b,.st738-bub.on small{color:#fff}.st738-bub.off{opacity:.55}
 .st738-card{position:absolute;left:10px;right:10px;bottom:10px;z-index:700;background:#ffffff;color:#1d2733;border-radius:14px;padding:12px 14px;box-shadow:0 4px 14px #0007;display:flex;flex-direction:column;gap:6px}
 .st738-card p{margin:0;font-size:13px;color:#3d4955}.st738-card-h{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.st738-card-h small{display:block;color:#4a5562;font-size:13px}.st738-card-h b{font-size:17px}
 .st738-prices{display:flex;flex-wrap:wrap;gap:8px}.st738-prices div{background:#eef2f6;border-radius:8px;padding:4px 8px}.st738-prices small{display:block;font-size:11px;color:#4a5562}.st738-prices b{font-size:15px}
 .st738-go{display:flex;gap:8px;flex-wrap:wrap}.st738-badges{display:flex;flex-wrap:wrap;gap:4px;margin-top:3px}.st738-b{font-style:normal;color:#fff;font-size:11px;border-radius:6px;padding:1px 6px}
 .st738-row.on{outline:2px solid #1a73e8}`;
 document.head.appendChild(css);
 window.Stations738 = { update, rows, page, mount, state: S, merge, publish() { refreshDistances(); publish(); }, frStation, deStation, osmInfo, fetchFR, fetchDE, fuels: FUELS, prefs, demo };
})();
