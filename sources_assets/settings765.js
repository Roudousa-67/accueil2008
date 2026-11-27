/* 7.65 : Réglages › Accueil et affichage › Barre de raccourcis : une seule liste au lieu de deux.
   Avant : « Modifier » (barre de gauche : ordre, appli, retirer) et plus bas « Choisir » (appli de chaque bouton),
   qui réglaient en partie la même chose. Maintenant : la liste de la barre de gauche montre l'appli ouverte par
   chaque bouton, avec « Choisir l'appli », ▲ ▼ pour l'ordre et « Retirer » ; les autres boutons (rangée d'applis
   de l'accueil : CarPlay, Ma voiture…) restent en dessous, avec leur appli et « Choisir l'appli ». */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 if (window.Try750) Try750.register('dock765', 'Barre de raccourcis : une seule liste', 'Ordre, appli de chaque bouton et retrait au même endroit.', '7.65');
 const on = () => !window.Try750 || Try750.on('dock765');
 const INIT = ['gps', 'music', 'radio', 'phone', 'settings'];
 const order = () => { const v = store.get('dockOrder730', INIT); return (Array.isArray(v) ? v : INIT).filter(x => typeof x === 'string' && x !== 'home' && x !== 'apps'); };
 const appName = id => {
  if (id.startsWith('pkg.')) { const a = safe(() => allApps().find(x => x.p === id.slice(4)), null); return a ? a.l : id.slice(4); }
  const it = safe(() => DOCK_ALL.find(d => d.id === id), null); if (!it) return '';
  const pk = safe(() => dockPk47(it), ''); const a = pk && safe(() => allApps().find(x => x.p === pk), null);
  return a ? a.l : pk ? pk : 'aucune appli trouvée';
 };
 function transform(html, p) {
  const t = document.createElement('template'); t.innerHTML = html;
  const inBar = new Set(order());
  // 1. Barre de gauche : chaque ligne montre l'appli et les vraies commandes.
  const rows = [...t.content.querySelectorAll('button[data-act^="dock730:edit:"]')].map(b => b.closest('[data-setting-row]')).filter(Boolean);
  if (!rows.length) return html;
  const list = order();
  rows.forEach(r => {
   const id = r.querySelector('button[data-act^="dock730:edit:"]').dataset.act.slice(13), k = list.indexOf(id);
   const desc = r.firstElementChild; if (desc) desc.insertAdjacentHTML('beforeend', `<div style="font-size:13px;color:${p.mut};margin-top:2px">Ouvre : ${esc(appName(id))}</div>`);
   const ctl = r.lastElementChild; if (ctl) ctl.innerHTML = (id.startsWith('pkg.') ? '' : chipBtn(p, 'assign:' + id, 'Choisir l’appli')) + chipBtn(p, 's765:mv:' + id + ':-1', '▲') + chipBtn(p, 's765:mv:' + id + ':1', '▼') + chipBtn(p, 's765:rm:' + id, 'Retirer');
   if (k === 0) { const up = ctl && ctl.querySelector('[data-act$=":-1"]'); if (up) up.style.opacity = '.35'; }
  });
  rows[0].insertAdjacentHTML('beforebegin', secT(p, 'Barre de gauche : ordre et appli de chaque bouton'));
  // 2. Ancienne liste « Choisir » : on retire les boutons déjà dans la barre de gauche.
  const choose = [...t.content.querySelectorAll('button[data-act^="assign:"]')].map(b => [b, b.closest('[data-setting-row]')]).filter(([b, r]) => r && !rows.includes(r));
  for (const [b, r] of choose) { const id = b.dataset.act.slice(7); if (inBar.has(id)) r.remove(); else { b.textContent = 'Choisir l’appli'; const d = r.firstElementChild && r.firstElementChild.children[1]; if (d && !/^Ouvre/.test(d.textContent)) d.textContent = 'Ouvre : ' + appName(id); } }
  // L'ancien titre de cette liste devient « Autres boutons ».
  [...t.content.querySelectorAll('div')].filter(d => /^APPLI DE CHAQUE RACCOURCI/.test(d.textContent.trim()) && !d.children.length).forEach(d => { d.textContent = 'AUTRES BOUTONS (RANGÉE D’APPLIS DE L’ACCUEIL)'; });
  return t.innerHTML;
 }
 function install() {
  const c = SETCATS.find(x => x[0] === 'Accueil et affichage'), i = c ? c[1].findIndex(s => s[0] === 'Barre de raccourcis') : -1; if (i < 0) return;
  const f0 = c[1][i][1]; if (f0.__s765) return;
  const f = p => { const h = safe(() => f0(p), ''); return on() ? safe(() => transform(h, p), h) : h; }; f.__s765 = true; c[1][i] = ['Barre de raccourcis', f];
 }
 install();
 const act0 = window.act;
 window.act = function (a) {
  if (typeof a === 'string' && a.startsWith('s765:')) {
   const [, op, id, d] = a.split(':'), L = order(), k = L.indexOf(id);
   if (op === 'mv' && k >= 0) { const j = k + Number(d); if (j >= 0 && j < L.length) { L.splice(k, 1); L.splice(j, 0, id); store.set('dockOrder730', L); } }
   else if (op === 'rm' && k >= 0) { if (L.length <= 1) safe(() => toast('Garde au moins un bouton.')); else { L.splice(k, 1); store.set('dockOrder730', L); safe(() => toast('Bouton retiré. « Ajouter une application » le remet.')); } }
   render(); return;
  }
  const r = act0.apply(this, arguments);
  if (typeof a === 'string' && a.startsWith('try750:')) safe(install);
  return r;
 };
 window.Settings765 = { order, appName, transform };
})();
