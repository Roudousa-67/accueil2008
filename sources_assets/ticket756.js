/* 7.56 : tickets reçus du téléphone jamais perdus.
   - Réglages › Trajets et carburant › Transfert depuis le téléphone : bouton « Joindre au plein » à côté de
     chaque photo reçue qui n'est rattachée à aucun plein.
   - Rappel : si un ticket reçu n'a pas été enregistré avec un plein (page quittée, appli relancée…), une
     alerte « Ticket non enregistré » le propose de nouveau, pendant 14 jours. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 if (window.Try750) Try750.register('ticket756', 'Tickets reçus jamais perdus', 'Bouton « Joindre au plein » sur les photos reçues, et rappel si un ticket n’a pas été enregistré.', '7.56');
 const on = () => !window.Try750 || Try750.on('ticket756');
 const used = ref => safe(() => fuelLog().some(f => f.receipt733 === ref), false);
 const isImg = n => /\.(jpe?g|png)$/i.test(String(n || ''));

 // On retient le dernier ticket reçu tant qu'il n'est pas enregistré avec un plein.
 if (window.Journeys733 && typeof Journeys733.receiveReceipt === 'function') {
  const r0 = Journeys733.receiveReceipt;
  Journeys733.receiveReceipt = function (photo) {
   if (typeof photo === 'string' && photo.startsWith('file738:')) store.set('pendingTicket756', { ref: photo, at: Date.now() });
   return r0.apply(this, arguments);
  };
 }
 function join(name) {
  const ref = 'file738:' + name;
  if (!window.Journeys733) return;
  safe(() => V740.setAlert('ticket756', null));
  Journeys733.receiveReceipt(ref);
  toast('Ticket prêt : vérifie les montants puis enregistre le plein.');
 }
 // Rappel : alerte sur l'accueil (toucher → bouton pour le joindre).
 function check() {
  const p = store.get('pendingTicket756', null);
  if (!p || !on()) return safe(() => V740.setAlert('ticket756', null));
  if (used(p.ref) || Date.now() - p.at > 14 * 864e5) { store.set('pendingTicket756', null); return safe(() => V740.setAlert('ticket756', null)); }
  if (Date.now() - p.at < 5 * 60000) return;   // laissé le temps d'enregistrer le plein tout de suite
  const name = p.ref.slice(8), when = new Date(p.at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  safe(() => V740.setAlert('ticket756', { key: 'ticket756:' + name, priority: 1, color: '#6d4c41', icon: '🧾', hours: 12, title: 'Ticket non enregistré', text: `Ticket du ${when} pas encore enregistré`,
   detail: () => `<p style="font-size:18px">Le ticket reçu du téléphone le ${esc(when)} n’est rattaché à aucun plein.</p><p><button data-act="tk756:join:${esc(name)}" style="height:48px;padding:0 18px;border-radius:12px;background:#e0312b;color:#fff;font-weight:700;font-size:16px">Joindre au plein</button> <button data-act="tk756:forget" style="height:48px;padding:0 18px;border-radius:12px;background:#2a3648;color:#fff;font-weight:600;font-size:16px">Oublier ce ticket</button></p>` }));
 }
 setTimeout(check, 20000); setInterval(check, 60000);

 // Bouton « Joindre au plein » dans la liste des fichiers reçus.
 for (const cat of SETCATS) {
  const i = cat[1].findIndex(s => s[0] === 'Transfert depuis le téléphone');
  if (i < 0) continue;
  const f0 = cat[1][i][1];
  cat[1][i] = ['Transfert depuis le téléphone', p => {
   const html = String(f0(p));
   if (!on()) return html;
   return html.replace(/<button data-act="transfer738:remove:([^"]+)"/g, (m, name) => isImg(name) ? chipBtn(p, 'tk756:join:' + name, 'Joindre au plein', true) + m : m);
  }];
 }
 const act0 = window.act;
 window.act = function (a) {
  if (typeof a === 'string' && a.startsWith('tk756:')) {
   if (a === 'tk756:forget') { store.set('pendingTicket756', null); safe(() => V740.setAlert('ticket756', null)); safe(() => V740.closeDetail()); return; }
   const name = a.slice('tk756:join:'.length); safe(() => V740.closeDetail()); safe(() => closeOverlays()); join(name); return;
  }
  return act0.apply(this, arguments);
 };
 window.Ticket756 = { check, join };
})();
