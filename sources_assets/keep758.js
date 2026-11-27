/* 7.58 : la page ne remonte plus en haut. À chaque appui (activer, désactiver, choisir…), l'appli redessine la
   page : la position de défilement et les sections ouvertes (« Ajouter un plein », « Avancé »…) étaient
   perdues. Elles sont maintenant retenues avant le redessin et remises juste après, sur toutes les pages,
   tant qu'on reste sur la même page. Chargé en dernier : il entoure tous les redessins. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 const SEL = '#screen .scroll, #screen .j733, #screen [style*="overflow:auto"], #screen [style*="overflow: auto"], #screen [style*="overflow-y:auto"], #screen [style*="overflow-y: auto"]';
 // Signature de la page affichée : on ne remet la position que si c'est la même page.
 const sig = () => [safe(() => tab, ''), safe(() => setCat, ''), safe(() => setSub, ''), safe(() => tripSub, ''), safe(() => svcSub, ''), safe(() => { const s = Journeys733.state; return [s.view, s.fuelView, s.selected].join(','); }, ''), safe(() => homePage, '')].join('|');
 function snapshot() {
  const els = Array.from(document.querySelectorAll(SEL));
  return { sig: sig(), tops: els.map(e => e.scrollTop), lefts: els.map(e => e.scrollLeft), opens: Array.from(document.querySelectorAll('#screen details')).map(d => d.open), focus: safe(() => { const a = document.activeElement; return a && a.id && a.closest('#screen') ? a.id : ''; }, '') };
 }
 function restore(s) {
  if (!s || s.sig !== sig()) return;
  const els = Array.from(document.querySelectorAll(SEL));
  if (els.length === s.tops.length) els.forEach((e, i) => { if (s.tops[i] && e.scrollTop !== s.tops[i]) e.scrollTop = s.tops[i]; if (s.lefts[i] && e.scrollLeft !== s.lefts[i]) e.scrollLeft = s.lefts[i]; });
  const ds = Array.from(document.querySelectorAll('#screen details'));
  if (ds.length === s.opens.length) ds.forEach((d, i) => { if (s.opens[i] && !d.open) d.open = true; });
 }
 const on = () => !window.Try750 || Try750.on('keep758');
 if (window.Try750) Try750.register('keep758', 'La page ne remonte plus', 'Après un appui (activer, désactiver…), la page reste là où tu étais au lieu de remonter en haut.', '7.58');
 const r0 = window.render;
 window.render = function () {
  if (!on()) return r0.apply(this, arguments);
  const s = safe(snapshot, null);
  const out = r0.apply(this, arguments);
  safe(() => restore(s));
  // Certaines pages finissent leur mise en page à l'image suivante : on remet une seconde fois.
  if (s && s.tops.some(Boolean)) requestAnimationFrame(() => safe(() => restore(s)));
  return out;
 };
 window.Keep758 = { snapshot, restore, sig };
})();
