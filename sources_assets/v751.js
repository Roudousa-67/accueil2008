/* 7.51 : appui long sur une appli de « Toutes les applications » → Désinstaller (fenêtre Android), ajouter à la
   barre du bas ou la mettre sur l'accueil. Les applis du système ouvrent leur fiche Android (Désactiver). */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 const N = () => window.Display743Native || null;
 const drawerOn = () => safe(() => $('drawer').classList.contains('on'), false);
 if (window.Try750) Try750.register('uninstall751', 'Désinstaller par appui long', 'Dans « Toutes les applications », un appui long sur une appli propose de la désinstaller.', '7.51');
 const enabled = () => !window.Try750 || Try750.on('uninstall751');
 let menu = null, watch = 0;
 const close = () => { if (menu) { menu.remove(); menu = null; } };
 function open(pk) {
  close();
  const p = (typeof curP !== 'undefined' && curP) || palette(), nm = safe(() => (allApps().find(a => a.p === pk) || {}).l, '') || pk;
  const b = (act, t, st) => `<button data-act="${act}" style="height:56px;border-radius:14px;font-size:16px;font-weight:700;${st}">${t}</button>`;
  menu = document.createElement('div');
  menu.setAttribute('data-noswipe', '1'); menu.setAttribute('data-act', 'un751:x'); menu.id = 'un751';
  menu.style.cssText = 'position:absolute;inset:0;z-index:6000;background:#000000b3;display:flex;align-items:center;justify-content:center';
  menu.innerHTML = `<div data-act="un751:noop" style="width:min(460px,92vw);${card(p, 'padding:20px;display:flex;flex-direction:column;gap:10px')}"><div style="font-size:20px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(nm)}</div>
   ${b('un751:del:' + pk, '🗑 Désinstaller', 'background:#c62828;color:#fff')}${b('un751:dock:' + pk, 'Ajouter à la barre du bas', `background:${p.card2};color:${p.txt}`)}${typeof amOpen === 'function' && p.layout === 'custom' ? b('un751:home:' + pk, 'Mettre sur l’accueil…', `background:${p.card2};color:${p.txt}`) : ''}${b('un751:x', 'Annuler', `background:${p.card2};color:${p.txt}`)}</div>`;
  $('stage').appendChild(menu);
 }
 // Après la fenêtre Android : liste des applis relue (l'appli désinstallée disparaît du tiroir).
 function refreshLater(pk) {
  clearInterval(watch); let n = 0;
  watch = setInterval(() => {
   n++;
   const gone = safe(() => !N().installed(pk), false);
   if (gone || n > 40) {
    clearInterval(watch);
    if (gone) { safe(() => { appsCache = null; }); toast('Appli désinstallée.'); if (drawerOn()) safe(() => { const s = document.getElementById('appSearch730'); window.openDrawer(null); if (s) s.value = ''; }); }
   }
  }, 1500);
 }
 function uninstall(pk) {
  const n = N();
  if (!n || typeof n.uninstall !== 'function') { toast('Il faut la 7.51 installée sur l’autoradio.'); return; }
  const r = safe(() => JSON.parse(n.uninstall(pk)), { ok: false, erreur: 'réponse illisible' });
  if (!r.ok) { toast('Désinstallation impossible : ' + (r.erreur || '')); return; }
  if (r.systeme) toast('Appli du système : Android ne permet que de la désactiver (bouton « Désactiver »).');
  else refreshLater(pk);
 }
 const act0 = window.act;
 window.act = function (a, long) {
  if (typeof a === 'string' && a.startsWith('un751:')) {
   const [, op] = a.split(':'), pk = a.slice(7 + op.length);
   if (op === 'noop') return;
   close();
   if (op === 'del') uninstall(pk);
   else if (op === 'dock') safe(() => App730.addDock(pk));
   else if (op === 'home') { safe(() => closeOverlays()); safe(() => amOpen(pk)); }
   return;
  }
  if (long && typeof a === 'string' && a.startsWith('app:') && drawerOn() && !(typeof assignFor !== 'undefined' && assignFor) && enabled()) { open(a.slice(4)); return; }
  return act0.apply(this, arguments);
 };
 window.V751 = { open, close, uninstall };
})();
