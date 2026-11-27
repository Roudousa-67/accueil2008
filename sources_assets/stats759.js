/* 7.59 : Trajets → « Bilan » : temps perdu dans les bouchons, carte de chaleur, exploration (zones jamais
   parcourues), frais kilométriques au barème officiel (PDF), classement de tes stations ; Éco-conduite : note de
   chaque trajet et classement de la famille du mois. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 const reg = (id, label, desc) => { if (window.Try750) Try750.register(id, label, desc, '7.59'); };
 reg('stats759', 'Bilan (Trajets)', 'Bouchons, carte de chaleur, exploration, frais kilométriques et classement des stations.');
 reg('ecofam759', 'Classement éco de la famille', 'Dans Éco-conduite : la note de chaque trajet et le classement des conducteurs du mois.');
 const on = id => !window.Try750 || Try750.on(id);
 const fmtMin = s => { const m = Math.round(s / 60); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0'); };
 const eur = v => v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
 function weekKey(t) { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7); const y = d.getFullYear(), w1 = new Date(y, 0, 4); return y + '-' + String(1 + Math.round(((d - w1) / 864e5 - 3 + (w1.getDay() + 6) % 7) / 7)).padStart(2, '0'); }

 // ---------- 2. Temps perdu dans les bouchons ----------
 // Un épisode lent (< 15 km/h) compte s'il dure au moins 90 s en avançant d'au moins 50 m : un feu rouge
 // ou un stationnement ne comptent pas.
 let slow = null;
 function jamTick() {
  const s = safe(() => curSpeed(), null), l = typeof loc !== 'undefined' ? loc : null, now = Date.now();
  if (!s || !l || !Number.isFinite(l.lat) || now - (l.ts || 0) > 5000) return;
  const v = s.v;
  if (v < 15 && (typeof trip !== 'undefined' && trip)) {
   if (!slow) slow = { t0: now, lat: l.lat, lon: l.lon, moved: 0, plat: l.lat, plon: l.lon };
   const d = safe(() => hav(slow.plat, slow.plon, l.lat, l.lon), 0); if (d < 0.2) slow.moved += d; slow.plat = l.lat; slow.plon = l.lon;
   return;
  }
  flushJam(now);
 }
 function flushJam(now) {
  if (!slow) return;
  const dur = (now - slow.t0) / 1000;
  if (dur >= 90 && dur < 4 * 3600 && slow.moved >= 0.05) { const o = Object.assign({}, store.get('jam759', {})), k = weekKey(slow.t0); o[k] = (o[k] || 0) + dur; const keys = Object.keys(o).sort(); while (keys.length > 60) delete o[keys.shift()]; store.set('jam759', o); }
  slow = null;
 }
 setInterval(jamTick, 1000);
 const hav = (a, b, c, d) => { const R = 6371, x = (c - a) * Math.PI / 180, y = (d - b) * Math.PI / 180, h = Math.sin(x / 2) ** 2 + Math.cos(a * Math.PI / 180) * Math.cos(c * Math.PI / 180) * Math.sin(y / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };

 // ---------- Tracés : carte de chaleur et exploration ----------
 const CELL = 0.0015;   // ≈ 160 m × 110 m
 function cells() {
  const idx = safe(() => trkIndex(), []), key = idx.map(t => t.id).join(',');
  if (cells.cache && cells.cache.key === key) return cells.cache;
  const m = new Map(), first = Object.assign({}, store.get('explore759', {}));
  for (const t of idx.slice().sort((a, b) => (a.t0 || 0) - (b.t0 || 0))) {
   const pts = safe(() => trkLoad(t.id), []), seen = new Set();
   for (const [la, lo] of pts) { const k = Math.round(la / CELL) + ':' + Math.round(lo / CELL); if (seen.has(k)) continue; seen.add(k); m.set(k, (m.get(k) || 0) + 1); if (!first[k]) first[k] = t.t0 || Date.now(); }
  }
  safe(() => store.set('explore759', first));
  cells.cache = { key, m, first };
  return cells.cache;
 }
 function explore() {
  const { m, first } = cells(), wk = weekKey(Date.now()), lastWk = weekKey(Date.now() - 7 * 864e5);
  let week = 0, prev = 0; for (const k of m.keys()) { const w = weekKey(first[k] || 0); if (w === wk) week++; else if (w === lastWk) prev++; }
  return { total: m.size, week, prev, km2: m.size * 0.0176 };
 }
 let heatMap = null;
 function mountHeat() {
  const el = document.getElementById('heat759'); if (!el) { if (heatMap) { safe(() => heatMap.remove()); heatMap = null; } return; }
  if (typeof L === 'undefined') { if (window.Maps738) Maps738.ensure().then(() => mountHeat()).catch(() => {}); return; }
  if (heatMap && heatMap.getContainer() === el) return;
  if (heatMap) safe(() => heatMap.remove());
  const { m } = cells(); if (!m.size) return;
  heatMap = L.map(el, { zoomControl: true, attributionControl: false });
  safe(() => { if (window.Maps738 && Maps738.tiles) Maps738.tiles(heatMap); else L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 18 }).addTo(heatMap); });
  const max = Math.max(...m.values()), pts = [];
  for (const [k, n] of [...m].sort((a, b) => a[1] - b[1]).slice(-5000)) {
   const [a, b] = k.split(':').map(Number), la = a * CELL, lo = b * CELL, u = Math.log(1 + n) / Math.log(1 + max);
   L.circleMarker([la, lo], { radius: 3 + u * 4, stroke: false, fillOpacity: .35 + .5 * u, fillColor: `hsl(${Math.round(55 - 55 * u)},100%,${Math.round(55 - 5 * u)}%)` }).addTo(heatMap);
   pts.push([la, lo]);
  }
  safe(() => heatMap.fitBounds(pts, { padding: [20, 20] }));
 }

 // ---------- 28. Frais kilométriques (barème officiel des voitures, inchangé depuis l'imposition 2024) ----------
 // Source : impots.gouv.fr / economie.gouv.fr « barème kilométrique » ; d = distance parcourue dans l'année.
 const BAREME = { 3: [[.529, 0], [.316, 1065], [.370, 0]], 4: [[.606, 0], [.340, 1330], [.407, 0]], 5: [[.636, 0], [.357, 1395], [.427, 0]], 6: [[.665, 0], [.374, 1457], [.447, 0]], 7: [[.697, 0], [.394, 1515], [.470, 0]] };
 function bareme(cv, d) { const b = BAREME[Math.max(3, Math.min(7, cv))], [k, c] = d <= 5000 ? b[0] : d <= 20000 ? b[1] : b[2]; return Math.round((d * k + c) * 100) / 100; }
 function yearKm(year, driver) {
  const rows = safe(() => Journeys733.rows(), []), a = +new Date(year, 0, 1), b = +new Date(year + 1, 0, 1);
  return rows.filter(t => t.start >= a && t.start < b && (driver === 'all' || String(t.driver ?? '') === driver)).reduce((n, t) => n + (Number(t.km) || 0), 0);
 }

 // ---------- 30. Classement de tes stations ----------
 function stationRank() {
  const by = new Map();
  for (const f of safe(() => fuelLog(), [])) { const n = String(f.s || '').trim(); if (!n || !(f.l > 0) || !(f.e > 0)) continue; const k = n.toLowerCase(); const o = by.get(k) || { name: n, l: 0, e: 0, n: 0 }; o.l += f.l; o.e += f.e; o.n++; by.set(k, o); }
  return [...by.values()].map(o => Object.assign(o, { avg: o.e / o.l })).sort((a, b) => a.avg - b.avg);
 }

 // ---------- Page « Bilan » ----------
 const S = { year: new Date().getFullYear(), cv: store.get('cv759', 6), driver: 'all', pdf: null };
 function bars(p, data) {
  const max = Math.max(1, ...data.map(d => d[1]));
  return `<div style="display:flex;gap:6px;align-items:flex-end;height:90px;margin-top:8px">${data.map(([l, v]) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px"><div style="width:70%;height:${Math.round(70 * v / max) + 2}px;background:${p.acc};border-radius:4px 4px 0 0"></div><span style="font-size:11px;color:${p.mut}">${esc(l)}</span></div>`).join('')}</div>`;
 }
 function page(p) {
  const card = (t, body) => `<div style="${box(p, 'padding:14px 16px')}"><div style="font-size:13px;color:${p.mut};margin-bottom:4px">${t}</div>${body}</div>`;
  const big = v => `<div style="font-size:26px;font-weight:800">${v}</div>`;
  const jam = store.get('jam759', {}), wk = weekKey(Date.now()), prevWk = weekKey(Date.now() - 7 * 864e5), cur = jam[wk] || 0, prev = jam[prevWk] || 0;
  const weeks = []; for (let i = 7; i >= 0; i--) { const k = weekKey(Date.now() - i * 7 * 864e5); weeks.push(['S' + k.slice(-2), (jam[k] || 0) / 60]); }
  const diff = cur - prev, jamCard = card('Temps perdu dans les bouchons', big(fmtMin(cur) + ' cette semaine') + `<div style="font-size:13px;color:${p.mut}">${prev || cur ? (diff <= 0 ? '−' : '+') + fmtMin(Math.abs(diff)) + ' par rapport à la semaine dernière' : 'Compté quand tu roules sous 15 km/h plus d’une minute et demie (pas les feux rouges).'}</div>` + bars(p, weeks));
  const ex = explore(), exCard = card('Exploration', big(ex.week + ' zone' + (ex.week > 1 ? 's' : '') + ' nouvelle' + (ex.week > 1 ? 's' : '') + ' cette semaine') + `<div style="font-size:13px;color:${p.mut}">${ex.total} zones de 160 m parcourues au total (≈ ${ex.km2.toFixed(1)} km²) · semaine dernière : ${ex.prev}. Prends une autre route pour en découvrir !</div>`);
  const heatCard = card('Carte de chaleur · toutes tes routes', ex.total ? `<div id="heat759" style="height:300px;border-radius:12px;overflow:hidden;margin-top:6px"></div><div style="font-size:12px;color:${p.mut};margin-top:6px">Jaune : rarement · rouge : là où tu passes le plus.</div>` : `<div style="font-size:13px;color:${p.mut}">Aucun tracé enregistré pour l’instant.</div>`);
  const names = safe(() => profiles(), []), km = yearKm(S.year, S.driver), amount = bareme(S.cv, km);
  const sel = (id, opts, v) => `<select data-s759="${id}" style="height:40px;border-radius:9px;background:${p.card2};color:${p.txt};border:1px solid #8899aa55;padding:0 8px">${opts.map(([k, l]) => `<option value="${k}" ${String(v) === String(k) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
  const y0 = new Date().getFullYear();
  const fraisCard = card('Frais kilométriques (impôts, frais réels)', `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:4px 0 8px">${sel('year', [[y0, String(y0)], [y0 - 1, String(y0 - 1)], [y0 - 2, String(y0 - 2)]], S.year)}${sel('cv', [[3, '3 CV et moins'], [4, '4 CV'], [5, '5 CV'], [6, '6 CV'], [7, '7 CV et plus']], S.cv)}${sel('driver', [['all', 'Tous les conducteurs'], ...names.map((n, i) => [String(i), n])], S.driver)}</div>` + big(`${Math.round(km).toLocaleString('fr-FR')} km → ${eur(amount)}`) + `<div style="font-size:12.5px;color:${p.mut};margin-top:4px">Barème officiel des voitures thermiques (inchangé depuis 2024). Seuls les trajets enregistrés par l’appli comptent : garde seulement les trajets pro si tu déclares au réel. À vérifier sur impots.gouv.fr avant de déclarer.</div><div style="margin-top:8px">${chipBtn(p, 's759:pdf', 'Créer le PDF et l’envoyer par e-mail', true)}</div>${S.pdf ? `<div style="font-size:13px;color:${S.pdf.ok ? p.mut : '#e0312b'};margin-top:6px">${S.pdf.ok ? 'PDF créé : ' + esc(S.pdf.fichier || '') : 'PDF impossible : ' + esc(S.pdf.erreur || '')}</div>` : ''}`);
  const rank = stationRank(), stCard = card('Classement de tes stations', rank.length ? rank.slice(0, 8).map((s, i) => `<div style="display:flex;gap:10px;padding:5px 0;border-bottom:1px solid #ffffff10;font-size:14px"><b style="width:22px">${i + 1}.</b><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(s.name)}</span><span style="color:${p.mut}">${s.n} plein${s.n > 1 ? 's' : ''}</span><b>${s.avg.toFixed(3)} €/L</b></div>`).join('') : `<div style="font-size:13px;color:${p.mut}">Indique le nom de la station dans tes pleins pour voir où tu paies le moins cher.</div>`);
  return pageFrame(p, `<div class="scroll" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(380px,1fr));gap:12px;align-content:start;overflow:auto;padding:2px">${jamCard}${exCard}${heatCard}${fraisCard}${stCard}</div>`);
 }
 function pdf() {
  const n = window.Display743Native, km = yearKm(S.year, S.driver), names = safe(() => profiles(), []);
  if (!n || typeof n.sharePdf !== 'function') { S.pdf = { ok: false, erreur: 'il faut l’appli installée sur l’autoradio' }; render(); return; }
  const rows = safe(() => Journeys733.rows(), []).filter(t => new Date(t.start).getFullYear() === S.year && (S.driver === 'all' || String(t.driver ?? '') === S.driver)).sort((a, b) => a.start - b.start);
  const lines = [`Frais kilométriques ${S.year}`, `Conducteur : ${S.driver === 'all' ? 'tous' : names[+S.driver] || ''}`, `Puissance fiscale : ${S.cv} CV`, `Distance enregistrée : ${Math.round(km)} km`, `Montant au barème : ${eur(bareme(S.cv, km))}`, '', 'Barème officiel des voitures (impots.gouv.fr), à vérifier avant déclaration.', '', 'Détail des trajets :'].concat(rows.map(t => `${new Date(t.start).toLocaleDateString('fr-FR')}  ${(Number(t.km) || 0).toFixed(1).padStart(7)} km  ${[t.from, t.to].filter(Boolean).join(' → ')}`));
  S.pdf = safe(() => JSON.parse(n.sharePdf('frais-km-' + S.year, 'Accueil 2008 - Frais kilométriques ' + S.year, lines.join('\n'), store.get('display743Mail', ''))), { ok: false, erreur: 'réponse illisible' });
  render();
 }
 document.addEventListener('change', e => { const k = e.target && e.target.dataset && e.target.dataset.s759; if (!k) return; const v = e.target.value; if (k === 'cv') { S.cv = +v; store.set('cv759', S.cv); } else if (k === 'year') S.year = +v; else S.driver = v; render(); });

 // Onglet dans Trajets.
 if (typeof tripSubs !== 'undefined' && !tripSubs.some(x => x[0] === 'bilan')) tripSubs.push(['bilan', 'Bilan']);
 const pt0 = window.pageTrips;
 window.pageTrips = function (p) { if (tripSub === 'bilan') return on('stats759') ? page(p) : pageFrame(p, '<div style="padding:20px">« Bilan » est désactivé dans Nouveautés à tester.</div>'); return pt0.apply(this, arguments); };
 const r0 = window.render;
 window.render = function () { const o = r0.apply(this, arguments); if (tab === 'trips' && tripSub === 'bilan') setTimeout(() => safe(mountHeat), 0); else if (heatMap) { safe(() => heatMap.remove()); heatMap = null; } return o; };

 // ---------- 148 + 171. Note de chaque trajet et classement éco de la famille ----------
 if (typeof window.archiveTrip === 'function') {
  const a0 = window.archiveTrip;
  window.archiveTrip = function (t) { const n = safe(() => tripsHistory().length, 0); const out = a0.apply(this, arguments); safe(() => { const l = tripsHistory(); if (l.length > n || (l.length && l[l.length - 1].start === t.start)) { const last = l[l.length - 1]; if (last.driver733 == null) { last.driver733 = profIdx(); store.set('trips', l); } } }); return out; };
 }
 function family(p) {
  const d = new Date(), a = +new Date(d.getFullYear(), d.getMonth(), 1), names = safe(() => profiles(), []), by = new Map();
  for (const t of safe(() => tripsHistory(), [])) { if (t.score == null || t.start < a || t.driver733 == null) continue; const o = by.get(t.driver733) || { s: 0, n: 0 }; o.s += t.score; o.n++; by.set(t.driver733, o); }
  const list = [...by].map(([i, o]) => ({ name: names[i] || 'Conducteur ' + (i + 1), avg: Math.round(o.s / o.n), n: o.n })).sort((x, y) => y.avg - x.avg);
  const medal = ['🥇', '🥈', '🥉'];
  return `<div data-ecofam759 style="margin-top:10px;padding-top:8px;border-top:1px solid #ffffff14"><div style="font-size:13px;color:${p.mut}">Classement éco de la famille · ${d.toLocaleDateString('fr-FR', { month: 'long' })}</div>${list.length ? list.slice(0, 4).map((x, i) => `<div style="display:flex;gap:10px;align-items:center;padding:3px 0;font-size:15px"><span style="width:24px">${medal[i] || i + 1 + '.'}</span><b style="flex:1">${esc(x.name)}</b><span style="color:${p.mut};font-size:12px">${x.n} trajet${x.n > 1 ? 's' : ''}</span><b style="font-size:18px">${x.avg}</b></div>`).join('') : `<div style="font-size:12.5px;color:${p.mut};margin-top:4px">Pas encore de trajet noté ce mois-ci : choisis ton profil avant de partir pour avoir ta note.</div>`}</div>`;
 }
 if (typeof window.pageEco === 'function') {
  const e0 = window.pageEco;
  window.pageEco = function (p) { const html = e0.apply(this, arguments); if (!on('ecofam759')) return html; const i = html.indexOf('<div style="font-size:12px;color:' + p.mut + ';margin-top:8px">Calcul :'); return i > 0 ? html.slice(0, i) + family(p) + html.slice(i) : html; };
 }
 const act0 = window.act;
 window.act = function (a) { if (a === 's759:pdf') { pdf(); return; } return act0.apply(this, arguments); };
 window.Stats759 = { weekKey, bareme, yearKm, stationRank, explore, cells, flushJam, jamTick, page, family, state: S };
})();
