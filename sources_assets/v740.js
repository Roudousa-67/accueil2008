/* 7.40 : alertes sur ta route dans le widget (météo devant toi, bouchons en direct),
   péages estimés pendant les trajets, réglages correspondants. */
(() => {
 'use strict';
 const addError = (w, e) => { if (window.Errors738) Errors738.add(w, e); };
 const rad = x => x * Math.PI / 180;
 function project(lat, lon, brg, km) {
  const d = km / 6371, b = rad(brg), l1 = rad(lat), g1 = rad(lon);
  const l2 = Math.asin(Math.sin(l1) * Math.cos(d) + Math.cos(l1) * Math.sin(d) * Math.cos(b));
  const g2 = g1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(l1), Math.cos(d) - Math.sin(l1) * Math.sin(l2));
  return { lat: l2 * 180 / Math.PI, lon: g2 * 180 / Math.PI };
 }
 const heading = () => loc && Number.isFinite(loc.brg) && loc.brg >= 0 && (loc.spd || 0) > 15 ? loc.brg : null;

 // ---------- Bandeau d'alerte dans le widget de la route ----------
 // Un seul message à la fois (le plus important). La croix l'enlève : il ne revient pas
 // pour la même alerte, seulement pour une nouvelle.
 const Alerts = { list: [], dismissed: {} };
 try { const o = JSON.parse(localStorage.getItem('a08alerts740') || '{}'), now = Date.now(); for (const k in o) if (o[k] > now) Alerts.dismissed[k] = o[k]; } catch (e) {}
 const saveDismissed = () => { try { localStorage.setItem('a08alerts740', JSON.stringify(Alerts.dismissed)); } catch (e) {} };
 function setAlert(source, alert) {
  Alerts.list = Alerts.list.filter(a => a.source !== source);
  if (alert) Alerts.list.push(Object.assign({ source, priority: 1, color: '#2b6cb0', icon: '!' }, alert));
  paintBanner();
 }
 function current() {
  const now = Date.now();
  return Alerts.list.filter(a => !(Alerts.dismissed[a.key] > now)).sort((a, b) => b.priority - a.priority)[0] || null;
 }
 function dismiss() {
  const a = current(); if (!a) return;
  Alerts.dismissed[a.key] = Date.now() + (a.hours || 3) * 3600000; saveDismissed(); closeDetail(); paintBanner();
 }
 function paintBanner() {
  const a = current();
  document.querySelectorAll('#screen [data-roadbox][data-road728]').forEach(box => {
   if (box.closest('[data-decor721-preview]')) return;
   let el = box.querySelector('.alert740');
   if (!a) { if (el) el.remove(); return; }
   if (!el) { el = document.createElement('div'); el.className = 'alert740'; box.appendChild(el); }
   const sig = a.key + '|' + a.text;
   if (el.dataset.sig !== sig) {
    el.dataset.sig = sig;
    el.innerHTML = `<button class="alert740-main" data-act="alert740:open"><span class="alert740-ic" style="background:${a.color}">${a.icon}</span><span class="alert740-t">${esc(a.text)}</span></button><button class="alert740-x" data-act="alert740:close" aria-label="Enlever le message">×</button>`;
   }
  });
 }
 let detail = null;
 function closeDetail() { if (detail) detail.remove(); detail = null; }
 function openDetail() {
  const a = current(); if (!a) return; closeDetail();
  detail = document.createElement('div'); detail.className = 'alert740-pop'; detail.setAttribute('role', 'dialog');
  detail.innerHTML = `<div class="alert740-card"><div class="alert740-head"><b>${esc(a.title || 'Alerte')}</b><button data-act="alert740:hide">Fermer</button></div>${a.detail ? a.detail() : `<p>${esc(a.text)}</p>`}<div class="alert740-foot"><button data-act="alert740:close">Enlever ce message</button></div></div>`;
  ($('screen') || document.body).appendChild(detail);
 }

 // ---------- Météo devant toi ----------
 const RAIN = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82]), SNOW = new Set([71, 73, 75, 77, 85, 86]), STORM = new Set([95, 96, 99]), FOG = new Set([45, 48]), FREEZE = new Set([56, 57, 66, 67]);
 const W = { at: 0, pos: null, brg: null, here: null, ahead: null, aheadKm: 20, fine: true, error: '', busy: false };
 const wxOn = () => store.get('wxAhead740', true) !== false;
 function url(p, fine) {
  const base = `https://api.open-meteo.com/v1/forecast?latitude=${p.lat.toFixed(3)}&longitude=${p.lon.toFixed(3)}&current=temperature_2m,weather_code,precipitation&timeformat=unixtime`;
  return fine ? base + '&minutely_15=precipitation,weather_code,temperature_2m&forecast_minutely_15=6' : base + '&hourly=precipitation,weather_code,temperature_2m&forecast_hours=3';
 }
 // Prévision d'un point : maintenant + tranches de 15 min (ou d'une heure en repli).
 function parse(j) {
  if (!j || j.error) throw Error(j && j.reason || 'réponse météo vide');
  const cur = j.current || {}, src = j.minutely_15 && Array.isArray(j.minutely_15.time) ? j.minutely_15 : j.hourly && Array.isArray(j.hourly.time) ? j.hourly : null;
  const step = src === j.minutely_15 ? 15 : 60, tl = [];
  if (src) for (let i = 0; i < src.time.length; i++) tl.push({ t: src.time[i] * 1000, c: Number(src.weather_code && src.weather_code[i]), temp: Number(src.temperature_2m && src.temperature_2m[i]), p: Number(src.precipitation && src.precipitation[i]) || 0 });
  return { step, cur: { c: Number(cur.weather_code), temp: Number(cur.temperature_2m), p: Number(cur.precipitation) || 0 }, tl };
 }
 async function point(p) {
  if (W.fine) { try { const r = parse(await getJSON(url(p, true))); if (r.tl.length) return r; } catch (e) { W.fine = false; } }
  return parse(await getJSON(url(p, false)));
 }
 function kindOf(c, p, step) {
  if (STORM.has(c)) return 'orage'; if (SNOW.has(c)) return 'neige';
  if (RAIN.has(c) || p >= (step === 15 ? .1 : .3)) return p >= (step === 15 ? 1 : 4) || [65, 67, 82].includes(c) ? 'forte pluie' : 'pluie';
  if (FOG.has(c)) return 'brouillard'; return null;
 }
 const LABEL = { orage: ['Orage', '⛈', '#6b3fa0', 4], neige: ['Neige', '❄', '#2c7a9b', 3], 'forte pluie': ['Forte pluie', '🌧', '#2b6cb0', 3], pluie: ['Pluie', '🌧', '#2b6cb0', 2], brouillard: ['Brouillard', '🌫', '#5f6b78', 2] };
 const wmoText = c => (typeof wmo === 'function' ? wmo(c).t : '');
 function when(min, step) {
  if (step === 60) return min < 60 ? 'dans moins d’une heure' : 'vers ' + new Date(Date.now() + min * 60000).getHours() + ' h';
  return min < 5 ? 'dans quelques minutes' : `dans ${Math.max(5, Math.round(min / 5) * 5)} min`;
 }
 function evaluate() {
  if (!wxOn() || !W.here) return setAlert('meteo', null);
  const now = Date.now(), cur = W.here.cur, curKind = kindOf(cur.c, cur.p, W.here.step);
  const speed = Math.max(30, Number(loc && loc.spd) || 0), eta = W.ahead ? W.aheadKm / speed * 60 : 0;
  let best = null, ice = null;
  for (const [pt, isAhead] of [[W.here, false], [W.ahead, true]]) {
   if (!pt) continue;
   for (const s of pt.tl) {
    if (s.t < now - pt.step * 30000) continue;
    let min = Math.max(0, (s.t - now) / 60000); if (isAhead) min = Math.max(min, eta);
    if (min > 75) continue;
    const k = kindOf(s.c, s.p, pt.step);
    if (Number.isFinite(s.temp) && s.temp <= 1 && (s.p > 0 || FREEZE.has(s.c) || SNOW.has(s.c))) { if (!ice || min < ice.min) ice = { min, temp: s.temp, t: s.t }; }
    if (!k) continue;
    // Déjà sous la pluie (ou la neige) : pas d'annonce, tu la vois.
    if (curKind && curKind !== 'brouillard' && k !== 'brouillard' && k !== 'orage') continue;
    if (curKind === k) continue;
    const sev = LABEL[k][3];
    if (!best || min < best.min - 10 || (Math.abs(min - best.min) <= 10 && sev > best.sev)) best = { k, min, sev, t: s.t, isAhead };
   }
  }
  const step = W.here.step;
  if (ice) {
   return setAlert('meteo', { key: 'verglas:' + Math.floor(ice.t / 10800000), priority: 5, color: '#c0392b', icon: '⚠', title: 'Météo sur ta route', text: `Verglas possible ${when(ice.min, step)} (${Math.round(ice.temp)} °C)`, detail: () => detailHTML(ice) });
  }
  if (!best) return setAlert('meteo', null);
  const [label, icon, color, sev] = LABEL[best.k];
  setAlert('meteo', { key: 'meteo:' + best.k + ':' + Math.floor(best.t / 10800000), priority: sev, color, icon, title: 'Météo sur ta route', text: `${label} ${when(best.min, step)}`, detail: () => detailHTML(null) });
 }
 function detailHTML(ice) {
  const src = W.ahead && heading() != null ? W.ahead : W.here, step = src.step, now = Date.now();
  const pick = min => src.tl.reduce((b, s) => Math.abs(s.t - (now + min * 60000)) < Math.abs(b.t - (now + min * 60000)) ? s : b, src.tl[0] || { c: src.cur.c, temp: src.cur.temp, t: now });
  const boxes = [['Maintenant', W.here.cur], ...(step === 15 ? [['Dans 15–30 min', pick(22)], ['Dans 45–60 min', pick(52)]] : [['Dans 1 h', pick(60)], ['Dans 2 h', pick(120)]])];
  const box = ([t, s], i) => `<div class="alert740-box${i === 1 ? ' on' : ''}"><small>${t}</small><b>${esc(wmoText(s.c) || '—')}</b><span>${Number.isFinite(s.temp) ? Math.round(s.temp) + ' °C' : ''}</span></div>`;
  return `<div class="alert740-boxes">${boxes.map(box).join('')}</div>${ice ? `<p class="alert740-ice"><b>Verglas possible</b> : ${Math.round(ice.temp)} °C avec de la pluie ou de la neige. Ralentis.</p>` : ''}<p class="alert740-src">Prévision Open-Meteo pour ta position${W.ahead ? ` et ${W.aheadKm} km devant toi (selon ton cap)` : ''} · mise à jour ${new Date(W.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.</p>`;
 }
 async function wxRefresh(force) {
  if (!wxOn() || !loc || !Number.isFinite(loc.lat) || W.busy) return;
  const hd = heading(), moved = W.pos ? hav(W.pos.lat, W.pos.lon, loc.lat, loc.lon) : 99, turned = hd != null && W.brg != null ? Math.abs(((hd - W.brg + 540) % 360) - 180) : 0;
  if (!force && Date.now() - W.at < 10 * 60000 && moved < 8 && turned < 60) { evaluate(); return; }
  W.busy = true; W.at = Date.now(); W.pos = { lat: loc.lat, lon: loc.lon }; W.brg = hd;
  try {
   W.here = await point(loc);
   W.ahead = hd != null ? await point(project(loc.lat, loc.lon, hd, W.aheadKm)) : null;
   W.error = '';
  } catch (e) { W.error = String(e && e.message || e).slice(0, 80); addError('météo devant toi', e); }
  finally { W.busy = false; }
  evaluate();
 }

 // ---------- Bouchons en direct (TomTom, clé personnelle) ----------
 const T = { at: 0, busy: false, last: [], error: '', testAt: 0 };
 const tomtomKey = () => String(store.get('tomtomKey740', '') || '').trim();
 const flowURL = (p, key) => `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${p.lat.toFixed(5)},${p.lon.toFixed(5)}&unit=KMPH&key=${encodeURIComponent(key)}`;
 function readFlow(j) { const f = j && j.flowSegmentData; return f ? { cur: Number(f.currentSpeed), free: Number(f.freeFlowSpeed), tt: Number(f.currentTravelTime), ftt: Number(f.freeFlowTravelTime), closed: !!f.roadClosure } : null; }
 async function trafficCheck(force) {
  const key = tomtomKey();
  if (!key || store.get('traffic740', true) === false) return setAlert('trafic', null);
  const hd = heading();
  if (!loc || hd == null || (loc.spd || 0) < 30) return;
  if (T.busy || (!force && Date.now() - T.at < 120000)) return;
  T.busy = true; T.at = Date.now();
  try {
   const res = [];
   for (const km of [2, 5]) { const f = readFlow(await getJSON(flowURL(project(loc.lat, loc.lon, hd, km), key))); if (f) res.push(Object.assign({ km }, f)); }
   T.last = res; T.error = '';
   const bad = res.find(r => r.closed || (r.free >= 40 && r.cur > 0 && r.cur < r.free * .5));
   if (!bad) return setAlert('trafic', null);
   const extra = Math.max(0, Math.round((bad.tt - bad.ftt) / 60));
   setAlert('trafic', { key: 'trafic:' + Math.floor(Date.now() / 1800000) + ':' + bad.km, priority: 4, color: '#c0392b', icon: '🚗', hours: .5, title: 'Circulation devant toi',
    text: bad.closed ? `Route fermée à ${bad.km} km` : `Bouchon à ${bad.km} km : ${Math.round(bad.cur)} km/h`,
    detail: () => `<p style="font-size:18px">${bad.closed ? 'La route est signalée fermée' : `Vitesse actuelle <b>${Math.round(bad.cur)} km/h</b> au lieu de ${Math.round(bad.free)} km/h`} à environ ${bad.km} km devant toi.${extra ? ` Temps perdu sur ce tronçon : environ ${extra} min.` : ''}</p><p class="alert740-src">Circulation TomTom · point mesuré à ${bad.km} km dans ton axe : sur une route sinueuse, il peut tomber sur une route voisine.</p>` });
  } catch (e) { T.error = String(e && e.message || e).slice(0, 80); addError('bouchons', e); }
  finally { T.busy = false; }
 }
 // Couche « circulation » sur les cartes Leaflet (accueil, trajets, stations).
 const trafficTiles = key => `https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${encodeURIComponent(key)}`;
 function addTrafficLayer(m) {
  const key = tomtomKey(); if (!key || store.get('trafficMap740', true) === false || typeof L === 'undefined' || !m || m._traffic740) return;
  try { m._traffic740 = L.tileLayer(trafficTiles(key), { maxZoom: 18, opacity: .85, attribution: 'Circulation © TomTom' }).addTo(m); } catch (e) { addError('carte de circulation', e); }
 }
 if (window.Maps738) { const tiles0 = Maps738.tiles; Maps738.tiles = function (m) { const layer = tiles0.apply(this, arguments); addTrafficLayer(m); return layer; }; }
 function homeMapTraffic() { try { if (typeof map !== 'undefined' && map && typeof L !== 'undefined' && map instanceof L.Map) addTrafficLayer(map); } catch (e) {} }
 async function testTomTom() {
  const el = document.getElementById('tomtom740'), key = (el ? el.value : tomtomKey()).trim();
  if (key.length < 20) { toast('Colle d’abord ta clé TomTom.'); return; }
  if (Date.now() - T.testAt < 30000) { toast('Attends 30 secondes entre deux tests.'); return; }
  T.testAt = Date.now(); toast('Test de la clé…');
  const p = loc && Number.isFinite(loc.lat) ? loc : { lat: 48.5734, lon: 7.7521 };
  try {
   const f = readFlow(await getJSON(flowURL(p, key)));
   if (f) { store.set('tomtomKey740', key); toast(`Clé acceptée et enregistrée : vitesse mesurée ${Math.round(f.cur)} km/h sur la route la plus proche.`); homeMapTraffic(); }
   else toast('Clé refusée ou réponse inattendue de TomTom.');
  } catch (e) { toast('Test impossible : ' + String(e && e.message || 'pas de réseau').slice(0, 80)); }
  render();
 }

 // ---------- Péages estimés ----------
 // Kilomètres parcourus sur une autoroute marquée « à péage » sur la carte (OpenStreetMap),
 // multipliés par un prix moyen au kilomètre que tu règles. Ce n'est pas le tarif officiel.
 const tollRate = () => { const v = Number(store.get('toll740Rate', 0.10)); return v > 0 && v < 1 ? v : 0.10; };
 const tollKey = id => 'a08toll_' + id;
 let toll = null, tollLast = null, tollDirty = 0;
 const tollLoad = id => { try { return Number(localStorage.getItem(tollKey(id))) || 0; } catch (e) { return 0; } };
 function tollSave() { if (toll) try { localStorage.setItem(tollKey(toll.id), String(Math.round(toll.km * 1000) / 1000)); tollDirty = 0; } catch (e) {} }
 function tollStep() {
  if (typeof trk === 'undefined' || !trk || !loc || !(loc.acc <= 50) || !Number.isFinite(loc.lat)) { tollLast = null; return; }
  if (!toll || toll.id !== trk.id) { tollSave(); toll = { id: trk.id, km: tollLoad(trk.id) }; tollLast = null; }
  const p = { lat: loc.lat, lon: loc.lon, ts: loc.ts }, tags = window.Road723 && Road723.fresh() && Road723.match ? Road723.match.tags || {} : {};
  if (tollLast && p.ts !== tollLast.ts) {
   const d = hav(tollLast.lat, tollLast.lon, p.lat, p.lon);
   if (d > 0 && d < 1 && tags.toll === 'yes' && /^motorway/.test(String(tags.highway || ''))) { toll.km += d; if (++tollDirty >= 20) tollSave(); }
  }
  tollLast = p;
 }
 function tollKm(id) { return toll && toll.id === String(id) ? toll.km : tollLoad(id); }
 function tollHTML(id) {
  const km = tollKm(id); if (!(km >= .5)) return '';
  const eur = km * tollRate();
  return `<div class="toll740"><b>Autoroute à péage</b><span>${fr1(km)} km · environ ${eur.toFixed(2).replace('.', ',')} €</span><small>Estimation à ${tollRate().toFixed(2).replace('.', ',')} €/km, pas le tarif officiel.</small></div>`;
 }
 if (window.RoadsTaken738) { const html0 = RoadsTaken738.html; RoadsTaken738.html = function (id) { return html0.apply(this, arguments) + tollHTML(String(id)); }; }
 if (typeof window.trkFinish === 'function') { const finish0 = window.trkFinish; window.trkFinish = function () { try { tollSave(); } catch (e) {} return finish0.apply(this, arguments); }; }

 // ---------- Branchements ----------
 const onLoc0 = window.onLoc;
 window.onLoc = function () {
  onLoc0.apply(this, arguments);
  try { tollStep(); } catch (e) { addError('péages', e); }
 };
 setInterval(() => { wxRefresh(false); trafficCheck(false); }, 30000);
 setTimeout(() => { wxRefresh(true); homeMapTraffic(); }, 15000);
 const render0 = window.render;
 window.render = function () { const r = render0.apply(this, arguments); try { paintBanner(); homeMapTraffic(); } catch (e) {} return r; };
 const act0 = window.act;
 window.act = function (a, long) {
  if (typeof a === 'string' && a.startsWith('alert740:')) {
   const op = a.split(':')[1];
   if (op === 'open') openDetail(); else if (op === 'close') dismiss(); else if (op === 'hide') closeDetail();
   return;
  }
  if (typeof a === 'string' && a.startsWith('v741:')) {
   const [, op, v] = a.split(':'), n = Number(v);
   if (op === 'town' && [0, 5, 10, 20].includes(n)) store.set('town741Dur', n);
   else if (op === 'station' && [0, 5, 10, 20].includes(n)) store.set('station741Dur', n);
   else if (op === 'place' && [10, 15, 30, 60].includes(n)) store.set('placeEvery', n);
   else if (op === 'dist' && [0, 5, 10, 20].includes(n)) store.set('dist744Dur', n);
   else if (op === 'dz' && [0, 1].includes(n)) store.set('dz744Hud', n === 1);
   render(); return;
  }
  if (typeof a === 'string' && a.startsWith('v740:')) {
   const [, op, v] = a.split(':');
   if (op === 'wx') { store.set('wxAhead740', v === '1'); if (v === '1') wxRefresh(true); else setAlert('meteo', null); }
   else if (op === 'traffic') { store.set('traffic740', v === '1'); if (v !== '1') setAlert('trafic', null); }
   else if (op === 'trafficMap') store.set('trafficMap740', v === '1');
   else if (op === 'tomtomSave') { const el = document.getElementById('tomtom740'), k = el ? el.value.trim() : ''; store.set('tomtomKey740', k); toast(k ? 'Clé TomTom enregistrée.' : 'Clé TomTom effacée.'); if (k) homeMapTraffic(); }
   else if (op === 'tomtomTest') { testTomTom(); return; }
   else if (op === 'toll' && [0.08, 0.10, 0.12, 0.15].includes(Number(v))) store.set('toll740Rate', Number(v));
   render(); return;
  }
  return act0.apply(this, arguments);
 };
 const back0 = window.onBackKey;
 window.onBackKey = function () { if (detail) { closeDetail(); return; } return back0 ? back0.apply(this, arguments) : undefined; };

 // ---------- Réglages ----------
 const onoff = (p, a, on) => chipBtn(p, a + ':1', 'Activé', on) + chipBtn(p, a + ':0', 'Désactivé', !on);
 function settingsWeather(p) {
  return setRow(p, 'Météo devant toi', 'Un petit message dans le widget de la route quand de la pluie, de la neige, un orage, du brouillard ou du verglas arrive sur ta route. Touche-le pour le détail ; la croix l’enlève pour cette alerte.', onoff(p, 'v740:wx', wxOn()))
   + `<p style="color:${p.mut};font-size:13px;line-height:1.45">Prévision Open-Meteo pour ta position et 20 km devant toi (selon ton cap), mise à jour toutes les 10 minutes ou après 8 km.${W.error ? ' Dernière erreur : ' + esc(W.error) : ''}</p>`;
 }
 function settingsTraffic(p) {
  const key = tomtomKey();
  return `<p style="line-height:1.5">Les bouchons viennent de TomTom, qui demande une clé gratuite à ton nom. Pour l’obtenir : sur le site développeurs de TomTom, crée un compte gratuit, puis copie la clé (« API key ») de ton espace et colle-la ici.</p>`
   + setRow(p, 'Clé TomTom', key ? 'Clé enregistrée.' : 'Aucune clé : les bouchons ne s’affichent pas.', `<span style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><input id="tomtom740" value="${esc(key)}" placeholder="colle ta clé ici" style="width:330px;height:40px;border-radius:10px;padding:0 10px;font-size:14px;background:${p.card2};color:inherit;border:1px solid ${p.mut}55">${chipBtn(p, 'v740:tomtomSave', 'Enregistrer', true)}${chipBtn(p, 'v740:tomtomTest', 'Tester la clé')}</span>`)
   + setRow(p, 'Message « Bouchon devant toi »', 'Quand tu roules, la vitesse est vérifiée à 2 km et 5 km devant toi toutes les 2 minutes. Si elle est moitié moins rapide que d’habitude, un message apparaît dans le widget.', onoff(p, 'v740:traffic', store.get('traffic740', true) !== false))
   + setRow(p, 'Couleurs de circulation sur les cartes', 'Routes en vert, orange ou rouge selon la circulation, sur la carte de l’accueil, des trajets et des stations.', onoff(p, 'v740:trafficMap', store.get('trafficMap740', true) !== false))
   + (T.error ? `<p style="color:#FF8A3D;font-size:13px">Dernière erreur : ${esc(T.error)}</p>` : '');
 }
 function settingsToll(p) {
  const r = tollRate();
  return `<p style="line-height:1.5">Pendant tes trajets, l’appli compte les kilomètres faits sur une autoroute marquée « à péage » sur la carte, et les multiplie par un prix moyen au kilomètre. Le total s’affiche dans le détail de chaque trajet, sous « Routes empruntées ».</p>`
   + setRow(p, 'Prix moyen au kilomètre', 'Ce n’est pas le tarif officiel : les prix changent selon les sociétés d’autoroute. Ajuste-le d’après tes tickets.', [0.08, 0.10, 0.12, 0.15].map(v => chipBtn(p, 'v740:toll:' + v.toFixed(2), v.toFixed(2).replace('.', ',') + ' €/km', Math.abs(r - v) < .001)).join(''));
 }
 // 7.41 : panneaux affichés dans l'image (village, station) et vérification du nom du village.
 function settingsPanels(p) {
  const town = Number(store.get('town741Dur', 10)), station = Number(store.get('station741Dur', 10)), place = Number(store.get('placeEvery', 10)), dist = Number(store.get('dist744Dur', 10)), dz = store.get('dz744Hud', true) !== false ? 1 : 0;
  const chips = (pre, list, cur) => list.map(([v, l]) => chipBtn(p, pre + v, l, cur === v)).join('');
  return setRow(p, 'Panneau du village ou de la ville', 'En entrant, le nom s’affiche en haut à droite, sous la météo ; en sortant, le même panneau barré de rouge. Durée d’affichage :', chips('v741:town:', [[5, '5 s'], [10, '10 s'], [20, '20 s'], [0, 'Tout le temps']], town))
   + setRow(p, 'Panneau de la prochaine station (autoroute)', 'Petit panneau à côté de ta vitesse : nom, prix et distance. Il apparaît avant de passer sous le portique de la station et reste après. Durée avant et après :', chips('v741:station:', [[5, '5 s'], [10, '10 s'], [20, '20 s'], [0, 'Désactivé']], station))
   + setRow(p, 'Grandes villes et distances (autoroute)', 'Le panneau des villes planté au bord de la route s’affiche aussi en grand en haut, entre la vitesse et la météo. Durée :', chips('v741:dist:', [[5, '5 s'], [10, '10 s'], [20, '20 s'], [0, 'Désactivé']], dist))
   + setRow(p, 'Zone de danger en haut de l’image', 'Panneau « Zone de danger » avec la distance qui reste ; il clignote si tu dépasses la limite. Forme autorisée en France (jamais l’emplacement d’un radar) ; coupé automatiquement en Allemagne, où c’est interdit en roulant.', chips('v741:dz:', [[1, 'Activé'], [0, 'Désactivé']], dz))
   + setRow(p, 'Vérifier le nom du village toutes les', 'Plus souvent = le bon nom plus vite après l’entrée dans un village. Il faut Internet.', chips('v741:place:', [[10, '10 s'], [15, '15 s'], [30, '30 s'], [60, '1 min']], place));
 }
 const css = document.createElement('style');
 css.textContent = `.alert740{position:absolute;left:3%;right:3%;top:27%;z-index:6;display:flex;gap:6px;align-items:stretch;pointer-events:auto}
 .alert740-main{flex:1;min-width:0;display:flex;align-items:center;gap:10px;background:#0b1a3ce6;color:#fff;border-radius:12px;padding:8px 12px;font-weight:600;font-size:clamp(13px,2.2vh,19px);text-align:left;box-shadow:0 4px 12px #0006}
 .alert740-ic{flex:none;width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:17px}
 .alert740-t{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 .alert740-x{flex:none;width:44px;border-radius:12px;background:#0b1a3ce6;color:#fff;font-size:24px;line-height:1;box-shadow:0 4px 12px #0006}
 .alert740-pop{position:absolute;inset:0;z-index:6100;display:flex;align-items:center;justify-content:center;background:#0006}
 .alert740-card{width:min(640px,90%);background:#fff;color:#1d2733;border-radius:18px;padding:18px;box-shadow:0 10px 30px #0008;display:flex;flex-direction:column;gap:12px}
 .alert740-head{display:flex;justify-content:space-between;align-items:center}.alert740-head b{color:#2b6cb0;font-size:16px}
 .alert740-head button,.alert740-foot button{background:#e4e9ef;color:#1d2733;border-radius:10px;padding:10px 16px;font-weight:600;font-size:15px}
 .alert740-boxes{display:flex;border-radius:10px;overflow:hidden;text-align:center}.alert740-box{flex:1;background:#dbe8f6;padding:10px 6px;display:flex;flex-direction:column;gap:2px}
 .alert740-box.on{background:#2b6cb0;color:#fff}.alert740-box small{font-size:13px;opacity:.85}.alert740-box b{font-size:16px}
 .alert740-ice{background:#fdecea;color:#a12b20;border-radius:10px;padding:10px 12px;margin:0}.alert740-src{font-size:13px;color:#55606c;margin:0}
 .alert740-card p{margin:0}.alert740-foot{display:flex;justify-content:flex-end}
 .toll740{display:flex;flex-direction:column;gap:2px;margin-top:8px;padding:8px 10px;border-radius:10px;background:#ffffff14}.toll740 small{opacity:.75}`;
 document.head.appendChild(css);
 window.V740 = { Alerts, setAlert, current, dismiss, paintBanner, openDetail, closeDetail, W, wxRefresh, evaluate, parse, kindOf, project, T, trafficCheck, readFlow, addTrafficLayer, tollStep, tollKm, tollHTML, tollRate, settingsWeather, settingsTraffic, settingsToll, settingsPanels };
 // 7.43 : zones de danger. En Allemagne, avertir des radars en roulant est interdit (§ 23 Abs. 1c StVO) :
 // les zones issues des radars sont ignorées dès que la position est en Allemagne. Quand le panneau
 // du haut de l'image est affiché, la pastille rouge sous la vitesse ne fait plus doublon.
 const germany = () => typeof geo47 !== 'undefined' && geo47 && geo47.cc === 'de';
 if (typeof window.dzNow === 'function') {
  const dzNow0 = window.dzNow;
  window.dzNow = function () { const z = dzNow0.apply(this, arguments); return z && z.kind === 'zone' && germany() ? null : z; };
 }
 if (typeof window.dzPill === 'function') {
  const dzPill0 = window.dzPill;
  window.dzPill = function (z) { if (z && z.kind === 'zone' && store.get('dz744Hud', true) !== false && document.querySelector('#screen canvas[data-road]')) return ''; return dzPill0.apply(this, arguments); };
 }
 window.V743 = { germany };
 // 7.46 : Waze reste par-dessus les autres pages de l'appli (Trajets, Entretien, Réglages…) parce que
 // c'est une fenêtre à part posée sur le cadre de l'accueil. En quittant l'accueil, l'appli se remet au
 // premier plan (Waze passe derrière, vu sur la vidéo du 25/11) ; au retour, Waze reprend son cadre.
 let lastTab746 = typeof tab !== 'undefined' ? tab : 'home', hidden746 = false;
 const render746 = window.render;
 window.render = function () {
  const out = render746.apply(this, arguments);
  try {
   if (tab !== lastTab746) {
    const was = lastTab746, n = window.Display743Native; lastTab746 = tab;
    // 7.48 : Waze peut être resté ouvert dans le cadre d'une session précédente (appli redémarrée après une
    // mise à jour) : on ne demande plus que l'appli l'ait ouvert elle-même, seulement le mode « cadre ».
    const framed = typeof gbMode !== 'function' || gbMode() === 'cadre';
    if (was === 'home' && tab !== 'home' && framed && n && (typeof n.hideNav === 'function' || typeof n.front === 'function') && store.get('hideNav746', true) !== false) {
     const r = typeof n.hideNav === 'function' ? n.hideNav() : n.front(); hidden746 = true; if (typeof dlogAdd === 'function') dlogAdd('cadre', 'page ' + tab + ' : Waze caché (' + r + ')');
    } else if (tab === 'home' && hidden746) {
     hidden746 = false;
     if (typeof gbLaunch === 'function') setTimeout(() => { if (tab === 'home') gbLaunch(true, 'retour sur l’accueil'); }, 350);
    }
   }
  } catch (e) { /* jamais bloquant */ }
  return out;
 };
 window.V746 = { hidden: () => hidden746 };
})();
