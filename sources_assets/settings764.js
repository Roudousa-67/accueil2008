/* 7.64 : ménage des réglages (suite).
   - Widgets › Vue voiture et route : taille du widget route (petit / moyen / grand, accueil libre) et fluidité
     (Économie ≈ 20 images/s, Normal = s'adapte, Fluide = au moins 30 images/s quand l'autoradio suit).
   - Système › Sauvegarde : copie de sécurité de la semaine dans un fichier, à récupérer sur le téléphone (QR),
     pour ne rien perdre même si l'appli est désinstallée.
   - Système › Stockage et nettoyage : nettoyage automatique chaque semaine (photos de tickets de plus d'un an
     non rattachées, fichiers orphelins, caches de logos). Tes pleins, trajets et réglages restent.
   Chargé après settings738.js / ranger758.js. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 const LIST = [['size764', 'Taille du widget route', 'Petit, moyen ou grand : les widgets à côté s’adaptent.'], ['fluid764', 'Fluidité du décor', 'Économie, normal ou fluide.'], ['backup764', 'Copie de sécurité de la semaine', 'Un fichier chaque semaine, à récupérer sur ton téléphone.'], ['clean764', 'Nettoyage automatique', 'Une fois par semaine : vieux fichiers inutiles et caches.']];
 if (window.Try750) LIST.forEach(([id, l, d]) => Try750.register(id, l, d, '7.64'));
 const on = id => !window.Try750 || Try750.on(id);
 const DAY = 864e5;

 // ---------- Fluidité du décor (lue par la boucle de la route, v4.js) ----------
 window.Fluid764 = { mode: () => store.get('fluid764', 'normal'), step(s) { if (!on('fluid764')) return s; const m = this.mode(); return m === 'eco' ? Math.max(s, 3) : m === 'fluide' ? Math.min(s, 2) : s; } };

 // ---------- Taille du widget route (accueil libre, grille 12 × 6) ----------
 const SIZES = { petit: 4, moyen: 5, grand: 6 };
 function roadItem(c) { for (const pg of (c.pages || [])) { const it = (pg || []).find(x => x.t === 'w' && (x.b || []).some(b => /^(car|road)/.test(b))); if (it) return { pg, it }; } return null; }
 function applySize(name) {
  const w = SIZES[name]; if (!w || typeof fClone !== 'function') return false;
  const c = fClone(), r = roadItem(c); if (!r) return false;
  const { pg, it } = r, x0 = it.x, w0 = it.w, d = w - w0; if (!d) return true;
  if (x0 + w > 12) return false;
  for (const x of pg) {
   if (x === it) { x.w = w; continue; }
   if (x.x === x0 && x.w === w0 && x.y !== it.y) { x.w = w; continue; }              // widgets empilés sous la route
   if (x.x === x0 + w0 && x.w - d >= 2) { x.x += d; x.w -= d; }                     // widgets juste à droite
  }
  fSave(c); return true;
 }
 const curSize = () => { const r = safe(() => roadItem(fCfg()), null); if (!r) return ''; return Object.keys(SIZES).find(k => SIZES[k] === r.it.w) || ''; };

 // ---------- Copie de sécurité de la semaine ----------
 const stamp = () => { const d = new Date(); return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); };
 function backupNow(manual) {
  if (!window.Transfer738 || typeof Transfer738.saveText !== 'function') { if (manual) safe(() => toast('Copie impossible sur cet appareil.')); return null; }
  const name = 'sauvegarde-accueil2008-' + stamp() + '.json';
  const r = safe(() => Transfer738.saveText(name, 'application/json', JSON.stringify(snapshot())), { ok: false });
  const ok = !!(r && r.ok), file = (r && (r.path || r.fichier)) || name;
  store.set('backup764', { at: Date.now(), ok, file, err: ok ? '' : String((r && (r.error || r.erreur)) || 'inconnue') });
  if (ok) safe(() => Transfer738.keep && Transfer738.keep(file));
  if (manual || !ok) safe(() => toast(ok ? 'Copie de sécurité enregistrée.' : 'Copie impossible : ' + ((r && (r.error || r.erreur)) || '')));
  return r;
 }
 // ---------- Nettoyage automatique ----------
 const bytes = k => { const v = safe(() => localStorage.getItem(k), '') || ''; return (k.length + v.length) * 2; };
 function cleanNow(manual) {
  let freed = 0, n = 0; const now = Date.now(), del = k => { freed += bytes(k); safe(() => localStorage.removeItem(k)); n++; };
  const fills = safe(() => store.get('fuelLog', []), []) || [], used = new Set(); let changed = false;
  for (const f of fills) { const r = f.receipt733; if (!r || String(r).startsWith('file738:')) continue; if (now - f.t > 365 * DAY) { del(r); delete f.receipt733; changed = true; } else used.add(r); }
  if (changed) store.set('fuelLog', fills);
  const keys = []; for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
  for (const k of keys) if (k && k.startsWith('receipt733-') && !used.has(k)) del(k);
  // Caches qui peuvent grossir : logos des radios et des stations (on garde les 200 / 300 derniers).
  const logos = store.get('radioLogos758', null); if (logos && typeof logos === 'object') { const lk = Object.keys(logos); if (lk.length > 200) { lk.slice(0, lk.length - 200).forEach(k => delete logos[k]); store.set('radioLogos758', logos); } }
  const lg = keys.filter(k => k && k.startsWith('a08_logo761_')); if (lg.length > 300) lg.slice(0, lg.length - 300).forEach(del);
  const rep = { at: now, freed, n }; store.set('clean764', rep);
  if (manual) safe(() => toast(`Nettoyage : ${(freed / 1048576).toFixed(1).replace('.', ',')} Mo libérés (${n} élément${n > 1 ? 's' : ''}).`));
  return rep;
 }
 // Une fois par semaine, à l'arrêt.
 function weekly() {
  if (safe(() => moving(), false)) return;
  const b = store.get('backup764', null), c = store.get('clean764', null);
  if (on('backup764') && store.get('autoBackup764', true) !== false && (!b || Date.now() - b.at > 7 * DAY)) backupNow(false);
  if (on('clean764') && store.get('autoClean764', true) !== false && (!c || Date.now() - c.at > 7 * DAY)) cleanNow(false);
 }
 setTimeout(weekly, 90000); setInterval(weekly, 30 * 60000);

 // ---------- Lignes ajoutées aux pages existantes ----------
 const yesNo = (p, key, def) => chipBtn(p, 's764:set:' + key + ':1', 'Oui', store.get(key, def) !== false) + chipBtn(p, 's764:set:' + key + ':0', 'Non', store.get(key, def) === false);
 const fmt = t => new Date(t).toLocaleDateString('fr-FR') + ' à ' + new Date(t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
 function rowsWidget(p) {
  const cs = curSize(), fm = Fluid764.mode();
  return (on('size764') ? setRow(p, 'Taille du widget route', cs ? 'Les widgets juste à côté s’adaptent.' : 'Avec la disposition libre de l’accueil seulement.', Object.keys(SIZES).map(k => chipBtn(p, 's764:size:' + k, k[0].toUpperCase() + k.slice(1), cs === k)).join('')) : '')
   + (on('fluid764') ? setRow(p, 'Fluidité du décor', 'Économie : environ 20 images/s, l’autoradio chauffe moins. Normal : s’adapte tout seul. Fluide : au moins 30 images/s si l’autoradio suit.', [['eco', 'Économie'], ['normal', 'Normal'], ['fluide', 'Fluide']].map(([k, l]) => chipBtn(p, 's764:fluid:' + k, l, fm === k)).join('')) : '');
 }
 function rowsBackup(p) {
  if (!on('backup764')) return '';
  const b = store.get('backup764', null);
  return setRow(p, 'Copie de sécurité chaque semaine', 'Un fichier avec tous tes réglages, trajets, pleins et carnet. À récupérer sur ton téléphone pour ne rien perdre, même si l’appli est désinstallée.', yesNo(p, 'autoBackup764', true))
   + setRow(p, 'Dernière copie de sécurité', b ? (b.ok ? fmt(b.at) : 'échec : ' + esc(b.err || '')) : 'Pas encore faite', chipBtn(p, 's764:backup', 'Faire une copie maintenant', true) + (b && b.ok ? chipBtn(p, 's764:qr', 'Récupérer sur mon téléphone') : ''));
 }
 function rowsClean(p) {
  if (!on('clean764')) return '';
  const c = store.get('clean764', null);
  return setRow(p, 'Nettoyage automatique', 'Une fois par semaine : photos de tickets de plus d’un an, fichiers orphelins et caches. Tes pleins, trajets et réglages restent.', yesNo(p, 'autoClean764', true))
   + setRow(p, 'Dernier nettoyage', c ? `${fmt(c.at)} · ${(c.freed / 1048576).toFixed(1).replace('.', ',')} Mo libérés` : 'Pas encore fait', chipBtn(p, 's764:clean', 'Nettoyer maintenant', true));
 }
 function wrap(cat, sub, rows, after) {
  const c = SETCATS.find(x => x[0] === cat), i = c ? c[1].findIndex(s => s[0] === sub) : -1; if (i < 0) return false;
  const f0 = c[1][i][1]; if (f0.__s764) return true;
  const f = p => after ? safe(() => f0(p), '') + rows(p) : rows(p) + safe(() => f0(p), ''); f.__s764 = true; c[1][i] = [sub, f]; return true;
 }
 function install() { wrap('Widgets', 'Vue voiture et route', rowsWidget, false); wrap('Système', 'Sauvegarde', rowsBackup, false); wrap('Système', 'Stockage et nettoyage', rowsClean, false); safe(() => { Settings720.index = null; }); }
 install();

 const act0 = window.act;
 window.act = function (a) {
  if (typeof a === 'string' && a.startsWith('try750:')) { const r = act0.apply(this, arguments); safe(install); return r; }
  if (typeof a !== 'string' || !a.startsWith('s764:')) return act0.apply(this, arguments);
  const [, op, k, v] = a.split(':');
  if (op === 'size') { if (!applySize(k)) safe(() => toast('Taille impossible avec ta disposition actuelle (disposition libre requise).')); else safe(() => toast('Widget route : ' + k + '.')); }
  else if (op === 'fluid') { store.set('fluid764', k); safe(() => RoadLoop725.invalidate()); }
  else if (op === 'backup') backupNow(true);
  else if (op === 'qr') { const b = store.get('backup764', null); if (b && b.file) safe(() => Transfer738.showQR(b.file)); }
  else if (op === 'clean') cleanNow(true);
  else if (op === 'set') store.set(k, v === '1');
  render();
 };
 window.Settings764 = { applySize, curSize, backupNow, cleanNow, weekly, roadItem, install };
})();
