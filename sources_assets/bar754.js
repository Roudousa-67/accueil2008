/* 7.54 : la barre d'applis du bas à droite (Radio, Réglages, Musique, CarPlay, Ma voiture).
   - Taille « Barre » (1 case de haut) de nouveau possible : la hauteur mini était de 2 cases, la barre ne
     pouvait plus revenir une fois agrandie.
   - Si elle a disparu de l'accueil, elle revient à sa place (en bas à droite) quand la place est libre.
   - Bouton ✎ sur la barre : on change, retire ou ajoute une appli directement depuis l'accueil. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 if (window.Try750) Try750.register('bar754', 'Barre d’applis du bas', 'Taille « Barre » de nouveau possible, barre remise à sa place, bouton ✎ pour changer les applis depuis l’accueil.', '7.54');
 const on = () => !window.Try750 || Try750.on('bar754');
 if (typeof FMIN !== 'undefined') FMIN.apps = [3, 1];
 if (typeof window.fSizes === 'function') {
  const fs0 = window.fSizes;
  window.fSizes = function (id) { if (id === 'apps' && on()) return [['Barre', 7, 1], ['Barre courte', 5, 1], ['Grille', 4, 2], ['Grande grille', 6, 3]]; return fs0.apply(this, arguments); };
 }
 // Après la mise à jour, une fois par profil : la barre est mise sur l'accueil (page 1), en bas à droite.
 // - déjà en grille sur la page 1 → repassée en barre ;
 // - absente → posée en bas à droite ; si la place est prise par un widget qui descend jusqu'en bas (cadre GPS
 //   agrandi, par exemple), ce widget perd une case de haut pour lui laisser la place.
 const isBar = it => it && it.t === 'w' && (it.b || []).includes('apps');
 const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
 function restore() {
  if (!on() || typeof fClone !== 'function') return false;
  const key = 'bar754_' + safe(() => profIdx(), 0); if (store.get(key, false)) return false;
  store.set(key, true);
  const c = fClone(); if (!c || !Array.isArray(c.pages) || !c.pages.length) return false;
  const pg = c.pages[0], cur = pg.find(isBar);
  if (cur && cur.h <= 1 && cur.w >= 3) return false;                       // déjà en barre : rien à faire
  if (cur) pg.splice(pg.indexOf(cur), 1);                                   // en grille : on la repose en barre
  for (const p2 of c.pages.slice(1)) { const i = p2.findIndex(isBar); if (i >= 0 && !cur) p2.splice(i, 1); }
  const fits = r => safe(() => fFits(pg, r, null), false);
  let r = [{ x: 5, y: 5, w: 7, h: 1 }, { x: 0, y: 5, w: 7, h: 1 }].find(fits) || null;
  if (!r) {
   const want = { x: 5, y: 5, w: 7, h: 1 }, hit = pg.filter(it => overlap(it, want));
   if (hit.length && hit.every(it => it.y + it.h === 6 && it.h >= 2)) { hit.forEach(it => { it.h -= 1; }); r = want; }
  }
  if (!r) r = safe(() => fFree(pg, 7, 1, null), null) || safe(() => fFree(pg, 5, 1, null), null) || safe(() => fFree(pg, 3, 1, null), null);
  if (!r) { store.set(key, false); return false; }
  pg.push(Object.assign({ id: (cur && cur.id) || nid(), t: 'w', b: ['apps'] }, r)); fSave(c);
  safe(() => toast('Barre d’applis remise en bas de l’accueil. ✎ pour changer les applis.'));
  return true;
 }
 // Bouton ✎ sur la barre (hors mode modification).
 if (typeof GBLOCKS !== 'undefined' && GBLOCKS.apps) {
  const r0 = GBLOCKS.apps.r;
  GBLOCKS.apps.r = function (p, w, h) {
   const html = r0.apply(this, arguments);
   if (!on() || safe(() => arEdit, false) || !/data-arapps/.test(html)) return html;
   const btn = `<button data-act="bar754:edit" aria-label="Modifier les applis" style="position:absolute;top:4px;right:6px;width:30px;height:30px;border-radius:50%;background:${p.card2};color:${p.txt};font-size:15px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px #0005">✎</button>`;
   const i = html.lastIndexOf('</div>'); return i > 0 ? html.slice(0, i) + btn + html.slice(i) : html;
  };
 }
 const act0 = window.act;
 window.act = function (a) {
  if (a === 'bar754:edit') { safe(() => { arEdit = true; }); render(); return; }   // comme l'appui long existant sur la barre
  return act0.apply(this, arguments);
 };
 setTimeout(() => { if (restore()) safe(() => render()); }, 0);
 window.Bar754 = { restore };
})();
