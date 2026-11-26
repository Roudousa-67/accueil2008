/* 7.51 : réglages rangés en 5 rubriques (Accueil, Route, Voiture, Médias, Système), taille du widget route,
   fluidité du décor, nettoyage automatique et sauvegarde automatique de la semaine (fichier dans
   Téléchargements, envoi par e-mail). Chargé après settings738.js. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 const LIST = [['cats751', 'Réglages rangés en 5 rubriques', 'Accueil · Route · Voiture · Médias · Système, avec la recherche en haut.'], ['size751', 'Taille du widget route', 'Petit, moyen ou grand : le cadre GPS à côté s’adapte.'], ['fluid751', 'Fluidité du décor', 'Économie, normal ou fluide selon ton autoradio.'], ['clean751', 'Nettoyage automatique', 'Chaque semaine : vieux tickets et fichiers inutiles effacés, avec un petit rapport.'], ['backup751', 'Sauvegarde de la semaine', 'Chaque semaine, une copie de tes trajets, pleins et réglages dans Téléchargements (gardée même si l’appli est désinstallée).']];
 if (window.Try750) LIST.forEach(([id, l, d]) => Try750.register(id, l, d, '7.51'));
 const on = id => !window.Try750 || Try750.on(id);
 const N = () => window.Display743Native || null;
 const DAY = 864e5;

 // ---------- 135. Fluidité du décor ----------
 window.Fluid751 = { mode: () => store.get('fluid751', 'normal'), step(s) { if (!on('fluid751')) return s; const m = this.mode(); return m === 'eco' ? Math.max(s, 3) : m === 'fluide' ? 1 : s; } };

 // ---------- 133. Taille du widget route (accueil libre) ----------
 const SIZES = { petit: 4, moyen: 5, grand: 6 };
 function roadItem(c) { for (const [pi, pg] of (c.pages || []).entries()) { const it = (pg || []).find(x => x.t === 'w' && (x.b || []).some(b => /^car/.test(b))); if (it) return { pg, it, pi }; } return null; }
 function applySize(name) {
  const w = SIZES[name]; if (!w || typeof fClone !== 'function') return false;
  const c = fClone(), r = roadItem(c); if (!r) return false;
  const { pg, it } = r, x0 = it.x, w0 = it.w, d = w - w0; if (!d) return true;
  for (const x of pg) {
   if (x === it || (x.x === x0 && x.w === w0)) { x.w = w; continue; }
   if (x.x === x0 + w0 && x.w - d >= 2) { x.x += d; x.w -= d; }
  }
  fSave(c); return true;
 }
 const curSize = () => { const r = safe(() => roadItem(fCfg()), null); if (!r) return ''; return Object.keys(SIZES).find(k => SIZES[k] === r.it.w) || ''; };

 // ---------- 120. Nettoyage automatique ----------
 function bytes(k) { const v = safe(() => localStorage.getItem(k), '') || ''; return (k.length + v.length) * 2; }
 function cleanNow(manual) {
  let freed = 0, n = 0; const now = Date.now(), del = k => { freed += bytes(k); safe(() => localStorage.removeItem(k)); n++; };
  const fills = safe(() => store.get('fuelLog', []), []) || [], used = new Set();
  let changed = false;
  for (const f of fills) { const r = f.receipt733; if (!r || String(r).startsWith('file738:')) continue; if (now - f.t > 365 * DAY) { del(r); delete f.receipt733; changed = true; } else used.add(r); }
  if (changed) store.set('fuelLog', fills);
  const bills = new Set((store.get('bills751', []) || []).map(b => b.ph).filter(Boolean)), tracks = new Set((safe(() => trkIndex(), []) || []).map(t => 'a08t_' + t.id));
  const keys = []; for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
  for (const k of keys) {
   if (!k) continue;
   if (k.startsWith('receipt733-') && !used.has(k)) del(k);
   else if (k.startsWith('bill751-') && !bills.has(k)) del(k);
   else if (k.startsWith('a08t_') && tracks.size && !tracks.has(k)) del(k);
  }
  const logos = store.get('radioLogos751', {}) || {}, lk = Object.keys(logos); if (lk.length > 200) { lk.slice(0, lk.length - 200).forEach(k => delete logos[k]); store.set('radioLogos751', logos); }
  const rep = { at: now, freed, n }; store.set('clean751', rep);
  if (manual || freed > 1e6) toast(`Nettoyage : ${(freed / 1048576).toFixed(1).replace('.', ',')} Mo libérés (${n} fichier${n > 1 ? 's' : ''}).`);
  return rep;
 }

 // ---------- 128. Sauvegarde de la semaine ----------
 const stamp = () => { const d = new Date(); return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); };
 const backupText = () => JSON.stringify(snapshot());
 function backupNow(manual) {
  const n = N(); if (!n || typeof n.saveText !== 'function') { if (manual) toast('Il faut la 7.51 installée sur l’autoradio.'); return null; }
  const r = safe(() => JSON.parse(n.saveText('sauvegarde-accueil2008-' + stamp() + '.json', 'application/json', backupText())), { ok: false, erreur: 'réponse illisible' });
  store.set('backup751', { at: Date.now(), ok: !!r.ok, fichier: r.fichier || '', erreur: r.erreur || '' });
  if (manual || !r.ok) toast(r.ok ? 'Sauvegarde enregistrée : ' + r.fichier : 'Sauvegarde impossible : ' + (r.erreur || ''));
  return r;
 }
 function backupMail() {
  const n = N(); if (!n || typeof n.shareText !== 'function') { toast('Il faut la 7.51 installée sur l’autoradio.'); return; }
  const r = safe(() => JSON.parse(n.shareText('sauvegarde-accueil2008-' + stamp() + '.json', 'application/json', backupText(), 'Sauvegarde Accueil 2008 du ' + new Date().toLocaleDateString('fr-FR'), store.get('display743Mail', ''))), { ok: false });
  if (!r.ok) toast('Envoi impossible : ' + (r.erreur || '')); else store.set('backup751', { at: Date.now(), ok: true, fichier: r.fichier || '' });
 }
 // Une fois par semaine, à l'arrêt.
 setInterval(() => {
  if (safe(() => moving(), false)) return;
  const b = store.get('backup751', null), c = store.get('clean751', null);
  if (on('backup751') && store.get('autoBackup751', true) !== false && (!b || Date.now() - b.at > 7 * DAY)) backupNow(false);
  if (on('clean751') && store.get('autoClean751', true) !== false && (!c || Date.now() - c.at > 7 * DAY)) cleanNow(false);
 }, 10 * 60000);

 // ---------- Pages de réglages ----------
 const yesNo = (p, key, def) => chipBtn(p, 's751:set:' + key + ':1', 'Oui', store.get(key, def) !== false) + chipBtn(p, 's751:set:' + key + ':0', 'Non', store.get(key, def) === false);
 function pageWidget(p) {
  const cs = curSize(), fm = Fluid751.mode();
  return setRow(p, 'Taille du widget route', cs ? 'Le cadre GPS et les widgets à côté s’adaptent.' : 'Disponible avec la disposition libre de l’accueil (Disposition de l’accueil).', Object.keys(SIZES).map(k => chipBtn(p, 's751:size:' + k, k[0].toUpperCase() + k.slice(1), cs === k)).join(''))
   + setRow(p, 'Fluidité du décor', 'Économie : 20 images/s, l’autoradio chauffe moins. Normal : s’adapte tout seul. Fluide : le plus d’images possible.', [['eco', 'Économie'], ['normal', 'Normal'], ['fluide', 'Fluide']].map(([k, l]) => chipBtn(p, 's751:fluid:' + k, l, fm === k)).join(''));
 }
 function pageClean(p) {
  const c = store.get('clean751', null);
  return setRow(p, 'Nettoyage automatique', 'Une fois par semaine : photos de tickets de plus d’un an, fichiers orphelins et caches. Tes pleins, trajets et factures restent.', yesNo(p, 'autoClean751', true))
   + setRow(p, 'Dernier nettoyage', c ? `${new Date(c.at).toLocaleDateString('fr-FR')} · ${(c.freed / 1048576).toFixed(1).replace('.', ',')} Mo libérés (${c.n} fichier${c.n > 1 ? 's' : ''})` : 'Jamais', chipBtn(p, 's751:clean', 'Nettoyer maintenant', true));
 }
 function pageBackup(p) {
  const b = store.get('backup751', null);
  return setRow(p, 'Sauvegarde de la semaine', 'Une fois par semaine, à l’arrêt : trajets, pleins, carnet et réglages dans Téléchargements/Accueil2008. Le fichier reste même si l’appli est désinstallée.', yesNo(p, 'autoBackup751', true))
   + setRow(p, 'Dernière sauvegarde', b ? `${new Date(b.at).toLocaleDateString('fr-FR')} · ${b.ok ? esc(b.fichier) : 'échec : ' + esc(b.erreur || '')}` : 'Jamais', chipBtn(p, 's751:backup', 'Sauvegarder maintenant', true) + chipBtn(p, 's751:mail', 'Envoyer par e-mail'));
 }
 const sys = SETCATS.find(c => c[0] === 'Système'), acc = SETCATS.find(c => c[0] === 'Accueil et affichage');
 if (sys) {
  // Doublon « Nouveautés à tester » (ajouté par la 7.50 et par la liste des pages) : un seul.
  const i1 = sys[1].findIndex(s => s[0] === 'Nouveautés à tester'), i2 = sys[1].findIndex((s, i) => i > i1 && s[0] === 'Nouveautés à tester'); if (i1 >= 0 && i2 > i1) sys[1].splice(i2, 1);
  const bi = sys[1].findIndex(s => s[0] === 'Sauvegarde');
  if (bi >= 0) { const f0 = sys[1][bi][1]; sys[1][bi] = ['Sauvegarde', p => (on('backup751') ? pageBackup(p) : '') + f0(p)]; }
  if (!sys[1].some(s => s[0] === 'Nettoyage automatique')) sys[1].splice(Math.max(0, sys[1].findIndex(s => s[0] === 'Stockage et nettoyage')) + 1, 0, ['Nettoyage automatique', pageClean]);
 }
 if (acc && !acc[1].some(s => s[0] === 'Widget route : taille et fluidité')) acc[1].push(['Widget route : taille et fluidité', pageWidget]);

 // ---------- 131. Réglages en 5 rubriques ----------
 const full = SETCATS.map(c => [c[0], c[1].slice()]);
 const take = (cat, prefix) => { const c = full.find(x => x[0] === cat); return c ? c[1].map(([s, f]) => [prefix ? prefix + s : s, f]) : []; };
 function five() {
  const widgets = take('Widgets'), media = widgets.filter(s => /multim/i.test(s[0])), other = widgets.filter(s => !/multim/i.test(s[0]));
  const extraMedia = full.flatMap(c => c[1].filter(s => s[0] === 'Pochette et mode concert'));
  const out = [
   ['Accueil', take('Accueil et affichage').concat(other)],
   ['Route', take('GPS et navigation').concat(take('Trajets et carburant'), take('Météo', 'Météo · '))],
   ['Voiture', take('Véhicule').concat(take('Entretien', 'Entretien · '))],
   ['Médias', media.concat(extraMedia)],
   ['Système', take('Système')],
  ];
  const seen = new Set(out.flatMap(c => c[1].map(s => s[1])));
  for (const c of full) for (const s of c[1]) if (!seen.has(s[1])) { out[4][1].push(s); seen.add(s[1]); }
  return out.filter(c => c[1].length);
 }
 function apply() { const list = on('cats751') ? five() : full.map(c => [c[0], c[1].slice()]); SETCATS.splice(0, SETCATS.length, ...list); safe(() => { Settings720.index = null; }); safe(() => { if (typeof setCat !== 'undefined' && setCat >= SETCATS.length) setCat = 0; }); }
 apply();
 const os0 = window.openSet;
 window.openSet = function (cat, sub) {
  if (!SETCATS.some(c => c[0] === cat) && sub) {
   const hit = SETCATS.find(c => c[1].some(s => s[0] === sub || s[0] === 'Météo · ' + sub || s[0] === 'Entretien · ' + sub));
   if (hit) { const s = hit[1].find(x => x[0] === sub || x[0] === 'Météo · ' + sub || x[0] === 'Entretien · ' + sub); return os0.call(this, hit[0], s[0]); }
  }
  return os0.apply(this, arguments);
 };
 window.Settings738 = Object.assign(window.Settings738 || {}, { layout: () => SETCATS.map(([c, subs]) => [c, subs.map(s => s[0])]), full: () => full.map(([c, subs]) => [c, subs.map(s => s[0])]) });

 const act0 = window.act;
 window.act = function (a) {
  if (typeof a === 'string' && a.startsWith('try750:cats751:')) { const r = act0.apply(this, arguments); apply(); render(); return r; }
  if (typeof a !== 'string' || !a.startsWith('s751:')) return act0.apply(this, arguments);
  const [, op, k, v] = a.split(':');
  if (op === 'size') { if (!applySize(k)) toast('Choisis d’abord la disposition libre de l’accueil.'); else { store.set('roadSize751', k); toast('Widget route : ' + k + '.'); } }
  else if (op === 'fluid') store.set('fluid751', k);
  else if (op === 'clean') cleanNow(true);
  else if (op === 'backup') backupNow(true);
  else if (op === 'mail') backupMail();
  else if (op === 'set') store.set(k, v === '1');
  render();
 };
 window.Settings751 = { apply, five, full: () => full, applySize, curSize, cleanNow, backupNow, backupMail, roadItem };
})();
