/* 7.61 : page Trajets › Stations enrichie.
   - « Rentable ? » : depuis ta position exacte, pour le montant que tu mets (en € ou en litres), ce que te coûte
     chaque station trajet aller-retour compris (distance par la route, OSRM ; sinon vol d'oiseau + 30 %, « ≈ »).
     Dans la liste : seulement le gain ou la perte à côté du prix, en vert ou en rouge, par rapport à la plus
     proche. Dans la fiche : le calcul complet, comparé à la plus proche et à la moins chère.
   - Logo de chaque enseigne (liste, fiche et carte).
   - Services lisibles : WC, boutique, lavage, gonflage, café/resto, DAB, recharge… (flux officiel + OpenStreetMap).
   - Filtre « Enseigne » : une marque, mes préférées (★, à choisir dans la fiche) ou celles où j'ai déjà fait le plein. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 if (!window.Stations738) return;
 if (window.Try750) Try750.register('rent761', 'Stations : rentable, logos, services', 'Gain ou perte de chaque station trajet compris, logos des enseignes, services, filtre par enseigne et préférées.', '7.61');
 const on = () => !window.Try750 || Try750.on('rent761');
 const OSRM = 'https://router.project-osrm.org/table/v1/driving/';
 const R = { road: {}, time: {}, key: '', at: 0, pos: null, busy: false, error: '' };
 const rad = x => x * Math.PI / 180;
 const hv = (a, b, c, d) => { const x = rad(c - a), y = rad(d - b), h = Math.sin(x / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(y / 2) ** 2; return 12742 * Math.asin(Math.sqrt(h)); };
 const n2 = v => (Math.round(v * 100) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
 const eur = v => n2(v) + ' €';
 const l1 = v => (Math.round(v * 10) / 10).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' L';
 const kmT = v => (v < 10 ? (Math.round(v * 10) / 10).toLocaleString('fr-FR') : Math.round(v)) + ' km';
 const cons = () => safe(() => fuelCons(), 0) || Number(String(store.get('consFallback', '')).replace(',', '.')) || 6.0;
 const CAP = () => Number(store.get('tank761', 44)) || 44;
 const tankL = () => safe(() => (car && Date.now() - car.ts < 60000 && car.fuel > 0.5 && car.fuel < 80) ? car.fuel : null, null);

 // ---------- Montant : en euros (par défaut) ou en litres ----------
 const amt = () => Object.assign({ u: 'eur', v: 50 }, store.get('amt761', {}) || {});
 function litresWanted() { const a = amt(); if (a.v === 'auto') { const t = tankL(); return t == null ? 40 : Math.max(5, Math.round(CAP() - t)); } return Number(a.v) || 40; }

 // ---------- Distances par la route (une requête pour toutes, au plus toutes les 2 min ou après 1 km) ----------
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

 // ---------- Calcul ----------
 // En € : ce que tu mets est fixe ; on compare les litres utiles (achetés − brûlés pour l'aller-retour),
 // ramenés en € au prix de la station de référence. En litres : plein + carburant du trajet.
 function compute(list) {
  const a = amt(), c = cons(), known = list.filter(s => s.p > 0 && !s.closed), out = {};
  const E = Number(a.v) || 50, L = litresWanted();
  for (const s of known) {
   const road = R.road[s.id], km1 = road || s.dist * 1.3, tripL = 2 * km1 * c / 100;
   const o = { km: km1, exact: !!road, min: R.time[s.id] ? 2 * R.time[s.id] : 2 * km1 / 45 * 60, tripL, trip: tripL * s.p, p: s.p };
   if (a.u === 'eur' && a.v !== 'auto') { o.mode = 'eur'; o.E = E; o.bought = E / s.p; o.net = o.bought - tripL; }
   else { o.mode = 'l'; o.L = L; o.fillCost = L * s.p; o.total = o.fillCost + o.trip; }
   out[s.id] = o;
  }
  const ids = Object.keys(out); if (!ids.length) return { out, c };
  const near = ids.reduce((x, y) => out[x].km <= out[y].km ? x : y), cheap = ids.reduce((x, y) => out[x].p <= out[y].p ? x : y);
  const diff = (o, ref) => o.mode === 'eur' ? (ref.net - o.net) * ref.p : o.total - ref.total;   // < 0 : tu gagnes
  for (const id of ids) { const o = out[id]; o.diff = diff(o, out[near]); o.diffCheap = diff(o, out[cheap]); o.near = id === near; o.cheap = id === cheap; }
  const best = ids.reduce((x, y) => out[x].diff <= out[y].diff ? x : y);
  out[best].best = true;
  return { out, c, near, cheap, best };
 }
 // Liste : gain ou perte à côté du prix, en vert ou en rouge.
 function tag(o) {
  const col = o.best || o.diff <= -0.3 ? '#2f9e44' : o.diff >= 0.3 ? '#e03131' : '#8a94a3';
  const txt = o.near && !o.best ? 'la + proche' : Math.abs(o.diff) < 0.3 ? '≈ pareil' : (o.diff < 0 ? '−' : '+') + n2(Math.abs(o.diff)) + ' €';
  return `<small class="rent761" style="display:block;margin-top:2px;font-size:13px;font-weight:800;color:${col};white-space:nowrap">${o.best ? '🏆 ' : ''}${txt}</small>`;
 }
 const vs = (d, name) => Math.abs(d) < 0.3 ? `≈ pareil que ${name}` : d < 0 ? `<b style="color:#2f9e44">tu gagnes ${eur(-d)}</b> par rapport à ${name}` : `<b style="color:#e03131">tu perds ${eur(d)}</b> par rapport à ${name}`;
 // Fiche : le calcul complet.
 function detail(o) {
  const head = o.best ? '🏆 Le meilleur choix d’ici' : o.near ? '📍 La station la plus proche' : o.diff <= -0.3 ? '✅ Rentable' : o.diff >= 0.3 ? '❌ Pas rentable' : '≈ Ça revient au même';
  const calc = o.mode === 'eur'
   ? `Pour ${eur(o.E)} : ${l1(o.bought)} achetés − ${l1(o.tripL)} brûlés pour l’aller-retour = <b>${l1(o.net)} utiles</b>`
   : `Plein ${l1(o.L)} : ${eur(o.fillCost)} + trajet ${eur(o.trip)} = <b>${eur(o.total)}</b>`;
  return `<div class="rent761" style="margin:8px 0;padding:8px 10px;border-radius:10px;background:#00000022;font-size:14px;line-height:1.45"><b style="font-size:15px">${head}</b><br>${calc}<br>${o.exact ? '' : '≈ '}${kmT(2 * o.km)} aller-retour · ${Math.max(1, Math.round(o.min))} min<br>${o.near ? '' : vs(o.diff, 'la plus proche') + '<br>'}${o.cheap ? 'C’est la moins chère au litre.' : vs(o.diffCheap, 'la moins chère au litre')}</div>`;
 }

 // ---------- Logos des enseignes ----------
 const BR = [
  [/total ?energies|^total\b|total access|\belan\b/i, 'TotalEnergies', 'totalenergies.fr', '#e30613'], [/\besso\b/i, 'Esso', 'esso.fr', '#e2001a'], [/\bshell\b/i, 'Shell', 'shell.fr', '#f2b705'],
  [/^bp\b|\bbp\b/i, 'BP', 'bp.com', '#009b3a'], [/\baral\b/i, 'ARAL', 'aral.de', '#0063ad'], [/\bjet\b/i, 'JET', 'jet-tankstellen.de', '#f5c400'], [/\bavia\b/i, 'Avia', 'avia-france.fr', '#e2001a'],
  [/\bagip\b|\beni\b/i, 'Eni', 'eni.com', '#e0b000'], [/leclerc/i, 'E.Leclerc', 'e.leclerc', '#0066b3'], [/carrefour/i, 'Carrefour', 'carrefour.fr', '#004e9f'],
  [/intermarch|mousquetaires/i, 'Intermarché', 'intermarche.com', '#e2001a'], [/auchan/i, 'Auchan', 'auchan.fr', '#e2001a'], [/super ?u\b|hyper ?u\b|syst[eè]me ?u|\bu express|magasins u/i, 'Système U', 'magasins-u.com', '#e2001a'],
  [/casino|g[ée]ant/i, 'Casino', 'supercasino.fr', '#00703c'], [/dyneff/i, 'Dyneff', 'dyneff.fr', '#e30613'], [/\bnetto\b/i, 'Netto', 'netto.fr', '#d9b300'], [/\bcora\b/i, 'Cora', 'cora.fr', '#e2001a'],
  [/\bstar\b/i, 'Star', 'star.de', '#e2001a'], [/\bhem\b/i, 'HEM', 'hem-tankstelle.de', '#00843d'], [/\bomv\b/i, 'OMV', 'omv.de', '#003c71'], [/westfalen/i, 'Westfalen', 'westfalen.com', '#e2001a'],
  [/orlen/i, 'ORLEN', 'orlen.de', '#e2001a'], [/raiffeisen/i, 'Raiffeisen', 'raiffeisen.com', '#00843d'], [/\bbft\b/i, 'bft', 'bft.de', '#e2001a'], [/globus/i, 'Globus', 'globus.de', '#e2001a'],
  [/tamoil/i, 'Tamoil', 'tamoil.de', '#e2001a'], [/\bq1\b/i, 'Q1', 'q1.eu', '#e2001a'], [/\bhoyer\b/i, 'Hoyer', 'hoyer.de', '#00843d'], [/markenfrei|freie tankstelle/i, 'Indépendante', '', '#6b7685'],
 ];
 function brandOf(s) {
  const txt = [s.name, s.tags && s.tags.brand, s.tags && s.tags.operator, s.tags && s.tags.name].filter(Boolean).join(' ');
  const b = BR.find(x => x[0].test(txt));
  return b ? { key: b[1], label: b[1], domain: b[2], col: b[3] } : { key: 'Autres', label: 'Autre station', domain: '', col: '#5f6b78' };
 }
 const escA = x => String(x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
 function logo(s, size) {
  if (!on()) return '';
  const b = brandOf(s), n = size || 26, ini = b.domain ? b.label.replace(/[^A-Za-zÀ-ÿ]/g, '').slice(0, 2).toUpperCase() : '⛽';
  const img = b.domain ? `<img alt="" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(b.domain)}&sz=64" onerror="this.remove()" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#fff;padding:1px">` : '';
  return `<span class="lg761" title="${escA(b.label)}" style="position:relative;display:inline-flex;align-items:center;justify-content:center;width:${n}px;height:${n}px;flex:0 0 ${n}px;border-radius:${Math.round(n / 4)}px;overflow:hidden;background:${b.col};color:#fff;font:800 ${Math.round(n * .42)}px Inter,sans-serif;vertical-align:middle">${ini}${img}</span>`;
 }

 // ---------- Services ----------
 const SV = [
  ['🚻', 'WC', /toilettes/i, t => t.toilets === 'yes'], ['🛒', 'Boutique', /boutique|alimentaire/i, t => !!t.shop && t.shop !== 'no'], ['🧽', 'Lavage', /lavage/i, t => t.car_wash === 'yes'],
  ['🛞', 'Gonflage', /gonflage/i, t => t.compressed_air === 'yes'], ['☕', 'Café / resto', /restauration|\bbar\b|caf[ée]/i, t => t.cafe === 'yes' || /cafe|restaurant|fast_food/.test(t['amenity:secondary'] || '')],
  ['🏧', 'DAB', /\bDAB\b|billets/i, t => t.atm === 'yes'], ['⚡', 'Recharge', /bornes?.*lectrique|recharge/i, t => t['fuel:electricity'] === 'yes'], ['🚿', 'Douches', /douche/i, t => t.shower === 'yes'],
  ['👕', 'Laverie', /laverie/i, () => false], ['📶', 'Wi-Fi', /wifi|wi-fi/i, t => t.internet_access === 'wlan'], ['🔥', 'Gaz', /gaz domestique|\bgpl\b/i, t => t['fuel:lpg'] === 'yes'],
 ];
 function services(s) { const tx = (s.services || []).join(' | '), t = s.tags || {}; return SV.filter(([, , re, f]) => re.test(tx) || safe(() => f(t), false)).map(([i, l]) => [i, l]); }
 const svLine = (list, max) => list.length ? `<span class="sv761">${list.slice(0, max || 99).map(([i, l]) => `<span>${i} ${l}</span>`).join('')}</span>` : '';

 // ---------- Préférées et déjà utilisées ----------
 const favs = () => store.get('stFav761', []) || [];
 const used = () => store.get('stUsed761', []) || [];
 const near80 = (s, x) => x && Number.isFinite(x.lat) && hv(s.lat, s.lon, x.lat, x.lon) < .08;
 const isFav = s => favs().some(f => f.id === s.id || near80(s, f));
 const isUsed = s => used().some(u => u.id === s.id || near80(s, u));
 function toggleFav(id) {
  const s = (Stations738.state.all || []).find(x => x.id === id); if (!s) return;
  const L = favs(); const i = L.findIndex(f => f.id === s.id || near80(s, f));
  if (i >= 0) L.splice(i, 1); else L.push({ id: s.id, name: s.name, lat: s.lat, lon: s.lon });
  store.set('stFav761', L);
 }
 // Un nouveau plein enregistré près d'une station : elle passe dans « déjà utilisées ».
 function watchFills() {
  const n = safe(() => fuelLog().length, null); if (n == null) return;
  const was = store.get('stUsedN761', null); store.set('stUsedN761', n);
  if (was == null || n <= was || !loc || Date.now() - (loc.ts || 0) > 600000) return;
  let best = null, bd = .15; for (const s of Stations738.state.all || []) { const d = hv(loc.lat, loc.lon, s.lat, s.lon); if (d < bd) { bd = d; best = s; } }
  if (!best) return;
  const L = used().filter(u => !(u.id === best.id || near80(best, u))); L.unshift({ id: best.id, name: best.name, lat: best.lat, lon: best.lon, t: Date.now() }); store.set('stUsed761', L.slice(0, 40));
 }

 // ---------- Filtre « Enseigne » (liste et carte) ----------
 const F = { brands: [] };
 const brandPref = () => store.get('stBrand761', 'all');
 function filter(list) {
  if (!on()) return list;
  const seen = new Map(); for (const s of list) { const b = brandOf(s).key; seen.set(b, (seen.get(b) || 0) + 1); }
  F.brands = [...seen.entries()].sort((a, b) => b[1] - a[1]);
  const v = brandPref();
  if (v === 'all') return list;
  if (v === 'fav') return list.filter(isFav);
  if (v === 'used') return list.filter(isUsed);
  return list.filter(s => brandOf(s).key === v);
 }
 function bar(p, C) {
  const a = amt(), t = tankL(), v = brandPref();
  const chips = (a.u === 'eur' ? [20, 30, 50, 70].map(x => chipBtn(p, 'rent761:amt:eur:' + x, x + ' €', a.v === x)) : [20, 30, 40, CAP()].filter((x, i, arr) => arr.indexOf(x) === i).map(x => chipBtn(p, 'rent761:amt:l:' + x, x + ' L', a.v === x)));
  if (t != null) chips.push(chipBtn(p, 'rent761:amt:l:auto', `Plein (${Math.max(5, Math.round(CAP() - t))} L)`, a.v === 'auto'));
  const unit = chipBtn(p, 'rent761:unit:eur', 'en €', a.u === 'eur') + chipBtn(p, 'rent761:unit:l', 'en litres', a.u === 'l');
  const opts = [['all', 'Toutes les enseignes'], ['fav', '★ Mes préférées (' + favs().length + ')'], ['used', '↺ Déjà utilisées (' + used().length + ')']].concat(F.brands.map(([k, n]) => [k, k + ' (' + n + ')']));
  if (!opts.some(o => o[0] === v)) opts.push([v, v + ' (0)']);
  const sel = `<label style="display:flex;align-items:center;gap:6px">Enseigne<select data-st761="brand" style="height:40px;border-radius:10px;padding:0 8px">${opts.map(([k, l]) => `<option value="${escA(k)}" ${k === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>`;
  const src = C && C.c ? `· ${String(Math.round(C.c * 10) / 10).replace('.', ',')} L/100 · ${Object.keys(R.road).length ? 'par la route' : '≈ vol d’oiseau + 30 %'}` : '';
  return `<div class="rent761-bar" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:4px 0 6px;font-size:13px">${sel}<span style="width:10px"></span><span style="opacity:.85">Rentable ? je mets</span>${unit}${chips.join('')}<span style="opacity:.7">${src}</span></div>`;
 }
 document.addEventListener('change', e => { const el = e.target; if (el && el.dataset && el.dataset.st761 === 'brand') { store.set('stBrand761', el.value); safe(() => render()); } });

 // ---------- Page ----------
 const CSS = `.st738-list .st738-row{border-bottom:1px solid #ffffff2e!important}.st738-row .lg761{margin-right:6px}.sv761{display:flex;flex-wrap:wrap;margin-top:4px;font-size:12px;line-height:1.2}.sv761>span{padding:1px 6px;border-left:1px solid #ffffff55;white-space:nowrap}.sv761>span:first-child{border-left:0;padding-left:0}.st738-card .sv761{font-size:14px;margin:6px 0}.st738-card .sv761>span{padding:3px 10px}.st738-bub .lg761{display:flex!important;margin:0 auto 2px}.fav761{color:#f5c400}`;
 if (!document.getElementById('css761')) { const st = document.createElement('style'); st.id = 'css761'; st.textContent = CSS; document.head.appendChild(st); }
 const page0 = Stations738.page;
 Stations738.page = function (p) {
  const html = page0.apply(this, arguments);
  if (!on()) return html;
  safe(watchFills);
  const list = safe(() => Stations738.rows(), []), adblue = safe(() => Stations738.prefs().fuel, '') === 'AdBlue';
  const C = loc && list.length && !adblue ? (fetchRoad(list), compute(list)) : { out: {} };
  const byId = new Map(list.map(s => [s.id, s]));
  const t = document.createElement('template'); t.innerHTML = html;
  t.content.querySelectorAll('.st738-row').forEach(b => {
   const id = (b.getAttribute('data-act') || '').slice('st738:pick:'.length), s = byId.get(id), d = b.firstElementChild, pr = b.lastElementChild; if (!s || !d) return;
   const nm = d.querySelector('b'); if (nm) nm.insertAdjacentHTML('beforebegin', logo(s, 24)), nm.insertAdjacentHTML('afterbegin', (isFav(s) ? '<span class="fav761">★</span> ' : '') + (isUsed(s) ? '↺ ' : ''));
   d.insertAdjacentHTML('beforeend', svLine(services(s), 5));
   const o = C.out[id]; if (o && pr && pr !== d) pr.insertAdjacentHTML('beforeend', tag(o));
  });
  const card = t.content.querySelector('.st738-card'), pid = safe(() => Stations738.state.pickId, ''), ps = (Stations738.state.all || []).find(s => s.id === pid);
  if (card && ps) {
   const h = card.querySelector('.st738-card-h b'); if (h) h.insertAdjacentHTML('beforebegin', logo(ps, 30) + ' ');
   const pr = card.querySelector('.st738-prices'), o = C.out[pid];
   if (pr) pr.insertAdjacentHTML('afterend', (o ? detail(o) : '') + (services(ps).length ? `<div style="font-size:13px;opacity:.8;margin-top:6px">Services</div>${svLine(services(ps))}` : ''));
   const go = card.querySelector('.st738-go'); if (go) go.insertAdjacentHTML('beforeend', chipBtn(p, 'rent761:fav:' + pid, isFav(ps) ? '★ Préférée' : '☆ Mettre en préférée', isFav(ps)));
  }
  const tools = t.content.querySelector('.st738-tools'); if (tools) tools.insertAdjacentHTML('afterend', bar(p, C));
  return t.innerHTML;
 };
 const act0 = window.act;
 window.act = function (a) {
  if (typeof a === 'string' && a.startsWith('rent761:')) {
   const [, op, x, y] = a.split(':');
   if (op === 'unit') store.set('amt761', { u: x, v: x === 'eur' ? 50 : 40 });
   else if (op === 'amt') store.set('amt761', { u: x, v: y === 'auto' ? 'auto' : Number(y) });
   else if (op === 'fav') toggleFav(a.slice('rent761:fav:'.length));
   render(); return;
  }
  return act0.apply(this, arguments);
 };
 window.St761 = { filter, logo, brandOf, services };
 window.Rent761 = { R, compute, amt, litresWanted, cons, fetchRoad, brandOf, services, isFav, isUsed, watchFills };
})();
