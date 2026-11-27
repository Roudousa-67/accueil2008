/* 7.61 : « Rentable ? » dans Trajets › Stations. Pour chaque station : le plein (litres choisis × prix) + le
   carburant brûlé pour y aller et revenir depuis ta position exacte (distance par la route, OSRM ; sinon vol
   d'oiseau + 30 %, marqué « ≈ »), comparé à la station la plus proche. Verdict : meilleur choix, rentable
   (tu gagnes X €), pas rentable (+X €) ou pareil. Conso : ordinateur de bord, sinon celle réglée. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 if (!window.Stations738) return;
 if (window.Try750) Try750.register('rent761', 'Stations : rentable ou pas ?', 'Pour chaque station, le prix du plein + le trajet aller-retour depuis ta position, comparé à la plus proche.', '7.61');
 const on = () => !window.Try750 || Try750.on('rent761');
 const OSRM = 'https://router.project-osrm.org/table/v1/driving/';
 const R = { road: {}, time: {}, key: '', at: 0, pos: null, busy: false, error: '' };
 const rad = x => x * Math.PI / 180;
 const hv = (a, b, c, d) => { const x = rad(c - a), y = rad(d - b), h = Math.sin(x / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(y / 2) ** 2; return 12742 * Math.asin(Math.sqrt(h)); };
 const eur = v => (Math.round(v * 100) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
 const kmT = v => (v < 10 ? (Math.round(v * 10) / 10).toLocaleString('fr-FR') : Math.round(v)) + ' km';
 const cons = () => safe(() => fuelCons(), 0) || Number(String(store.get('consFallback', '')).replace(',', '.')) || 6.0;
 const consSrc = () => safe(() => store.get('fuelConsAuto', true) && car && car.avg1 > 2 && car.avg1 < 25, false) ? 'ordinateur de bord' : 'réglée';
 const CAP = () => Number(store.get('tank761', 44)) || 44;
 const tankL = () => safe(() => (car && Date.now() - car.ts < 60000 && car.fuel > 0.5 && car.fuel < 80) ? car.fuel : null, null);
 function fill() {
  const v = store.get('fill761', 40);
  if (v === 'auto') { const t = tankL(); return t == null ? 40 : Math.max(5, Math.round(CAP() - t)); }
  return Number(v) || 40;
 }
 // Distances par la route (une seule requête pour toutes les stations, au plus toutes les 2 min ou après 1 km).
 function fetchRoad(list) {
  if (!loc || R.busy || !list.length) return;
  const sel = list.slice().sort((a, b) => a.dist - b.dist).slice(0, 80), key = sel.map(s => s.id).join(',');
  const moved = R.pos ? hv(R.pos[0], R.pos[1], loc.lat, loc.lon) : 99;
  if (key === R.key && moved < 1 && Date.now() - R.at < 120000) return;
  if (R.error && Date.now() - R.at < 120000 && moved < 1) return;
  R.busy = true; R.at = Date.now(); R.pos = [loc.lat, loc.lon];
  const pts = [[loc.lon, loc.lat]].concat(sel.map(s => [s.lon, s.lat])).map(([a, b]) => a.toFixed(5) + ',' + b.toFixed(5)).join(';');
  getJSON(OSRM + pts + '?sources=0&annotations=distance,duration')
   .then(j => {
    const d = j && j.distances && j.distances[0], t = j && j.durations && j.durations[0];
    if (!d) throw Error((j && j.code) || 'réponse vide');
    R.road = {}; R.time = {};
    sel.forEach((s, i) => { if (d[i + 1] > 0) R.road[s.id] = d[i + 1] / 1000; if (t && t[i + 1] > 0) R.time[s.id] = t[i + 1] / 60; });
    R.key = key; R.error = '';
   })
   .catch(e => { R.error = String(e && e.message || e).slice(0, 80); })
   .finally(() => { R.busy = false; safe(() => { if (tab === 'trips' && document.querySelector('#screen .st738')) render(); }); });
 }
 // Calcul pour chaque station.
 function compute(list) {
  const L = fill(), c = cons(), known = list.filter(s => s.p > 0 && !s.closed);
  const out = {};
  for (const s of known) {
   const road = R.road[s.id], km1 = road || s.dist * 1.3, exact = !!road;
   const trip = 2 * km1 * c / 100 * s.p, total = L * s.p + trip;
   out[s.id] = { km: km1, exact, min: R.time[s.id] ? 2 * R.time[s.id] : 2 * km1 / 45 * 60, trip, fillCost: L * s.p, total };
  }
  const ids = Object.keys(out); if (!ids.length) return { out, L, c };
  const near = ids.reduce((a, b) => out[a].km <= out[b].km ? a : b), best = ids.reduce((a, b) => out[a].total <= out[b].total ? a : b);
  for (const id of ids) { const o = out[id]; o.diff = o.total - out[near].total; o.near = id === near; o.best = id === best; }
  return { out, L, c, near, best };
 }
 function verdict(o) {
  if (o.best) return ['🏆 Meilleur choix' + (o.near ? '' : ' : tu gagnes ' + eur(-o.diff)), '#2f9e44'];
  if (o.near) return ['📍 La plus proche', '#6b7685'];
  if (o.diff <= -0.3) return ['✅ Rentable : −' + eur(-o.diff), '#2f9e44'];
  if (o.diff >= 0.3) return ['❌ Pas rentable : +' + eur(o.diff), '#c92a2a'];
  return ['≈ Pareil que la plus proche', '#6b7685'];
 }
 // Dans la liste : juste le gain ou la perte à côté du prix, en vert ou en rouge.
 function tag(o) {
  const col = o.best || o.diff <= -0.3 ? '#2f9e44' : o.diff >= 0.3 ? '#e03131' : '#8a94a3';
  const txt = o.near && !o.best ? 'la + proche' : Math.abs(o.diff) < 0.3 ? '≈ pareil' : (o.diff < 0 ? '−' : '+') + n2(Math.abs(o.diff)) + ' €';
  return `<small class="rent761" style="display:block;margin-top:2px;font-size:13px;font-weight:800;color:${col};white-space:nowrap">${o.best ? '🏆 ' : ''}${txt}</small>`;
 }
 const n2 = v => (Math.round(v * 100) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
 function line(o) { const [t, col] = verdict(o); return `<span class="rent761" style="display:block;margin-top:4px;font-size:13px;line-height:1.35"><b style="color:${col}">${t}</b><br><span style="opacity:.85">Plein ${n2(o.fillCost)} + trajet ${n2(o.trip)} = <b>${eur(o.total)}</b><br>${o.exact ? '' : '≈ '}${kmT(2 * o.km)} aller-retour · ${Math.max(1, Math.round(o.min))} min</span></span>`; }
 function toolbar(p, C) {
  const v = store.get('fill761', 40), t = tankL();
  const opts = [20, 30, 40, CAP()].filter((x, i, a) => a.indexOf(x) === i).map(x => chipBtn(p, 'rent761:fill:' + x, x + ' L', String(v) === String(x)));
  if (t != null) opts.push(chipBtn(p, 'rent761:fill:auto', `Plein (${Math.max(5, Math.round(CAP() - t))} L)`, v === 'auto'));
  return `<div class="rent761-bar" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:4px 0 6px;font-size:13px"><span style="opacity:.85">Rentable ? (plein + trajet aller-retour, comparé à la plus proche) · je mets</span>${opts.join('')}<span style="opacity:.7">· ${String(Math.round(C.c * 10) / 10).replace('.', ',')} L/100 · ${Object.keys(R.road).length ? 'par la route' : '≈ vol d’oiseau + 30 %'}</span></div>`;
 }
 const page0 = Stations738.page;
 Stations738.page = function (p) {
  const html = page0.apply(this, arguments);
  if (!on() || !safe(() => loc, null)) return html;
  const list = safe(() => Stations738.rows(), []); if (!list.length || safe(() => Stations738.prefs().fuel, '') === 'AdBlue') return html;
  fetchRoad(list);
  const C = compute(list); if (!Object.keys(C.out).length) return html;
  const t = document.createElement('template'); t.innerHTML = html;
  t.content.querySelectorAll('.st738-row').forEach(b => { const id = (b.getAttribute('data-act') || '').slice('st738:pick:'.length), o = C.out[id], pr = b.lastElementChild; if (o && pr && pr !== b.firstElementChild) pr.insertAdjacentHTML('beforeend', tag(o)); });
  const card = t.content.querySelector('.st738-card'), pid = safe(() => Stations738.state.pickId, ''), o = C.out[pid];
  if (card && o) { const pr = card.querySelector('.st738-prices'); if (pr) pr.insertAdjacentHTML('afterend', `<div style="margin:6px 0">${line(o)}</div>`); }
  const tools = t.content.querySelector('.st738-tools'); if (tools) tools.insertAdjacentHTML('afterend', toolbar(p, C));
  return t.innerHTML;
 };
 const act0 = window.act;
 window.act = function (a) {
  if (typeof a === 'string' && a.startsWith('rent761:fill:')) { const v = a.slice(13); store.set('fill761', v === 'auto' ? 'auto' : Number(v)); render(); return; }
  return act0.apply(this, arguments);
 };
 window.Rent761 = { R, compute, verdict, fill, cons, fetchRoad };
})();
