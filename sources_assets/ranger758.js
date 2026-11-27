/* 7.58 : essence, tickets et trajets rangés à des endroits clairs.
   Onglet Trajets : Trajets · Stats · Éco · Pleins · Conso · Tickets · Stations.
   - « Pleins » : la liste des pleins, « Ajouter un plein » et les graphiques.
   - « Conso » : la consommation de chaque plein et les trajets faits avec (avant : Entretien › Pleins).
   - « Tickets » : envoyer un ticket par QR, photo, import.
   - « Stations » : prix autour de toi.
   Entretien ne garde que l'entretien (Plan constructeur, Bilan, Mon carnet).
   Réglages : « Trajets et carburant » devient deux rubriques : « Trajets » et « Carburant et tickets ».
   Chargé après settings738.js. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 if (window.Try750) Try750.register('ranger758', 'Essence, tickets et trajets rangés', 'Onglets Pleins, Conso, Tickets et Stations dans Trajets ; réglages « Trajets » et « Carburant et tickets » séparés.', '7.58');
 const on = () => !window.Try750 || Try750.on('ranger758');
 const J = () => window.Journeys733 && Journeys733.state;
 const FUEL = { pleins: 'fills', tickets: 'tickets', stations: 'stations' };
 const OLD_TRIP = safe(() => tripSubs.map(x => x.slice()), []);
 // 7.59 : « Bilan » (bouchons, chaleur, frais km…) prend la place de « Conso », qui passe en bouton dans Pleins.
 const NEW_TRIP = [['hist', 'Trajets'], ['stats', 'Stats'], ['bilan', 'Bilan'], ['eco', 'Éco'], ['pleins', 'Pleins'], ['tickets', 'Tickets'], ['stations', 'Stations']];
 function applyTabs() { if (typeof tripSubs === 'undefined') return; tripSubs.splice(0, tripSubs.length, ...(on() ? NEW_TRIP : OLD_TRIP).map(x => x.slice())); }
 applyTabs();
 // Sous-onglet qui correspond à la vue carburant affichée.
 const subFor = fv => fv === 'tickets' ? 'tickets' : fv === 'stations' ? 'stations' : 'pleins';
 function openSub(k) {
  const s = J(); tab = 'trips'; tripSub = k;
  if (s && FUEL[k]) { s.view = 'fuel'; s.selected = null; if (!(k === 'pleins' && s.fuelView === 'charts')) s.fuelView = FUEL[k]; }
  render();
 }
 const pt0 = window.pageTrips;
 window.pageTrips = function (p) {
  if (on()) {
   const s = J();
   if (tripSub === 'fuel') tripSub = subFor(s && s.fuelView);          // ancienne entrée (ticket reçu, liens)
   if (s && FUEL[tripSub]) { s.view = 'fuel'; const want = FUEL[tripSub]; if (!(tripSub === 'pleins' && s.fuelView === 'charts') && s.fuelView !== want) s.fuelView = want; }
   else if (s && (tripSub === 'hist' || tripSub === 'stats') && s.view === 'fuel') s.view = tripSub === 'stats' ? 'stats' : 'history';
   // Les boutons « Stations » et « Tickets et import » font doublon avec les onglets du haut.
   if (s && FUEL[tripSub]) {
    let html = String(pt0.apply(this, arguments)).replace(/<button data-act="journey733:(?:fuel:stations|receipts)"[^>]*>[\s\S]*?<\/button>/g, '');
    // « Conso par plein » juste après « Mes pleins ».
    if (tripSub === 'pleins') html = html.replace(/(<button data-act="journey733:fuel:fills"[^>]*>[\s\S]*?<\/button>)/, '$1' + chipBtn(p, 'tsub:conso', 'Conso par plein'));
    return html;
   }
   if (tripSub === 'conso' && typeof pagePleins === 'function') return String(pagePleins(p)).replace(/(<div style="min-height:0;display:flex;flex-direction:column">)/, '$1<div style="margin-bottom:8px">' + chipBtn(p, 'tsub:pleins', '← Retour aux pleins') + '</div>');
  }
  return pt0.apply(this, arguments);
 };
 // Entretien sans « Pleins » (déplacé dans Trajets › Conso).
 if (typeof svcSubs !== 'undefined') {
  const OLD_SVC = svcSubs.map(x => x.slice());
  window.Ranger758svc = () => { svcSubs.splice(0, svcSubs.length, ...(on() ? OLD_SVC.filter(x => x[0] !== 'pleins') : OLD_SVC).map(x => x.slice())); };
  Ranger758svc();
 }
 const act0 = window.act;
 window.act = function (a) {
  if (typeof a !== 'string' || !on()) return act0.apply(this, arguments);
  if (a === 'tsub:pleins' || a === 'tsub:tickets' || a === 'tsub:stations' || a === 'tsub:conso') { openSub(a.slice(5)); return; }
  if (a === 'tsub:fuel') { openSub('pleins'); return; }
  if (a === 'ssub:pleins') { openSub('conso'); return; }
  if (a.startsWith('try750:ranger758:')) { const r = act0.apply(this, arguments); applyTabs(); safe(() => Ranger758svc()); applySettings(); render(); return r; }
  const r = act0.apply(this, arguments);
  // Boutons à l'intérieur de Carburant : l'onglet suit la vue choisie.
  if (a.startsWith('journey733:fuel:') || a === 'journey733:receipts') { const s = J(); if (s) { tripSub = subFor(s.fuelView); safe(() => render()); } }
  return r;
 };

 // ---------- Réglages : « Trajets » et « Carburant et tickets » ----------
 const SET_OLD = SETCATS.map(c => [c[0], c[1].slice()]);
 const FUEL_PAGES = ['Carburant et stations', 'Transfert depuis le téléphone'];
 function applySettings() {
  const out = [];
  for (const [c, subs] of SET_OLD) {
   if (on() && c === 'Trajets et carburant') {
    out.push(['Trajets', subs.filter(s => !FUEL_PAGES.includes(s[0]))]);
    out.push(['Carburant et tickets', subs.filter(s => FUEL_PAGES.includes(s[0]))]);
   } else out.push([c, subs.slice()]);
  }
  SETCATS.splice(0, SETCATS.length, ...out.filter(c => c[1].length));
  safe(() => { Settings720.index = null; });
  safe(() => { if (setCat >= SETCATS.length) setCat = 0; });
 }
 applySettings();
 // Anciens liens « Trajets et carburant / … » : on retrouve la page là où elle est rangée maintenant.
 const os0 = window.openSet;
 window.openSet = function (cat, sub) {
  if (!SETCATS.some(c => c[0] === cat) && sub) { const hit = SETCATS.find(c => c[1].some(s => s[0] === sub)); if (hit) return os0.call(this, hit[0], sub); }
  return os0.apply(this, arguments);
 };
 window.Settings738 = Object.assign(window.Settings738 || {}, { layout: () => SETCATS.map(([c, subs]) => [c, subs.map(s => s[0])]) });
 window.Ranger758 = { applyTabs, applySettings, openSub };
})();
