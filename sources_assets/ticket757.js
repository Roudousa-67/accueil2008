/* 7.57 : ticket lu automatiquement. Le téléphone lit le ticket (page d'envoi), tu vérifies les chiffres, et ils
   arrivent avec la photo dans le nom du fichier (…-ticket_L42.10_P1.729_E72.79_K45210_D20261126.jpg). L'autoradio remplit
   alors « Ajouter un plein » : date, litres, prix au litre, total et compteur. Tu n'as plus qu'à enregistrer. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 if (window.Try750) Try750.register('ticket757', 'Ticket lu automatiquement', 'Les chiffres lus par le téléphone remplissent le plein sur l’autoradio.', '7.57');
 const on = () => !window.Try750 || Try750.on('ticket757');
 // Chiffres portés par le nom du fichier.
 function parseName(ref) {
  const n = String(ref || ''), g = (k, max) => { const m = n.match(new RegExp('_' + k + '(\\d+(?:\\.\\d+)?)(?=_|\\.|$)')); const v = m ? parseFloat(m[1]) : NaN; return Number.isFinite(v) && v > 0 && v <= max ? v : null; };
  const v = { litres: g('L', 500), per: g('P', 10), total: g('E', 5000), km: g('K', 3000000), date: null };
  const d = n.match(/_D(\d{4})(\d{2})(\d{2})(?=_|\.|$)/);
  if (d) { const iso = d[1] + '-' + d[2] + '-' + d[3], ms = Date.parse(iso + 'T12:00:00'); if (Number.isFinite(ms) && ms <= Date.now() + 864e5) v.date = iso; }
  return v.litres || v.total || v.per || v.km || v.date ? v : null;
 }
 let pending = null;   // { ref, v, at } : chiffres à poser dans le formulaire du plein
 const fr = (x, d) => String(Math.round(x * 10 ** d) / 10 ** d);
 function fill() {
  if (!pending || !on()) return false;
  const L = document.getElementById('j733-litres'); if (!L) return false;
  if (Date.now() - pending.at > 30 * 60000 || safe(() => fuelLog().some(f => f.receipt733 === pending.ref), false)) { pending = null; return false; }
  const set = (id, val, force) => { const el = document.getElementById('j733-' + id); if (!el || val == null || (el.value && !force) || el.value === val) return false; el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); return true; };
  const v = pending.v, any = [set('fillDate', v.date, true), set('litres', v.litres != null ? fr(v.litres, 2) : null), set('perLitre', v.per != null ? fr(v.per, 3) : null), set('paid', v.total != null ? fr(v.total, 2) : null), set('odometer', v.km != null ? String(Math.round(v.km)) : null)].some(Boolean);
  const det = L.closest('details'); if (det) det.open = true;
  if (any && !pending.told) pending.told = true, toast(`Ticket lu${v.date ? ' du ' + v.date.split('-').reverse().join('/') : ''} : ${v.litres != null ? fr(v.litres, 2).replace('.', ',') + ' L' : ''}${v.total != null ? ' · ' + fr(v.total, 2).replace('.', ',') + ' €' : ''}. Vérifie puis enregistre le plein.`);
  return any;
 }
 if (window.Journeys733 && typeof Journeys733.receiveReceipt === 'function') {
  const r0 = Journeys733.receiveReceipt;
  Journeys733.receiveReceipt = function (photo) {
   const v = on() ? parseName(photo) : null;
   if (v) pending = { ref: photo, v, at: Date.now() };
   const out = r0.apply(this, arguments);
   if (v) { let n = 0; const tryFill = () => { if (fill() || ++n > 20) return; setTimeout(tryFill, 150); }; setTimeout(tryFill, 0); }
   return out;
  };
 }
 // Si l'écran est redessiné avant l'enregistrement, les chiffres sont remis dans le formulaire vide.
 const r1 = window.render;
 window.render = function () { const o = r1.apply(this, arguments); if (pending) setTimeout(() => safe(fill), 0); return o; };
 window.Ticket757 = { parseName, fill, pending: () => pending };
})();
