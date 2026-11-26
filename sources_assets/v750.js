/* 7.50 : « Nouveautés à tester » (activer / désactiver / « Je n'aime pas » pour chaque nouveauté), mise à jour
   téléchargée en roulant et installée au prochain arrêt, et ménage choisi dans l'Atelier 2008 GT. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 const redraw = () => { if (tab === 'settings') safe(() => render()); };

 // ---------- Nouveautés à tester ----------
 // Chaque nouveauté a un interrupteur. « Je n'aime pas » la coupe tout de suite et la note pour la
 // supprimer à la mise à jour suivante ; la liste part dans le rapport de diagnostic.
 const LIST = [];
 const Try750 = {
  register(id, label, desc, version) { if (!LIST.some(x => x.id === id)) LIST.push({ id, label, desc, version: version || APP_VERSION }); },
  on(id) { const v = (store.get('try750', {}) || {})[id]; return v !== 'off' && v !== 'no'; },
  state(id) { return (store.get('try750', {}) || {})[id] || 'on'; },
  set(id, v) { const o = Object.assign({}, store.get('try750', {}) || {}); o[id] = v; store.set('try750', o); },
  disliked() { return LIST.filter(x => this.state(x.id) === 'no'); },
  list: () => LIST.slice(),
  reportLines() {
   const no = this.disliked(), off = LIST.filter(x => this.state(x.id) === 'off');
   return ['== Nouveautés à tester ==', no.length ? 'À supprimer (je n’aime pas) : ' + no.map(x => x.label).join(', ') : 'Rien à supprimer.', off.length ? 'Désactivées pour l’instant : ' + off.map(x => x.label).join(', ') : ''].filter(Boolean);
  },
 };
 window.Try750 = Try750;
 function page(p) {
  const rows = LIST.map(x => {
   const st = Try750.state(x.id);
   return setRow(p, x.label + ' · ' + x.version, x.desc, chipBtn(p, 'try750:' + x.id + ':on', 'Activé', st === 'on') + chipBtn(p, 'try750:' + x.id + ':off', 'Désactivé', st === 'off') + chipBtn(p, 'try750:' + x.id + ':no', 'Je n’aime pas', st === 'no'));
  }).join('');
  const no = Try750.disliked();
  return `<div style="font-size:13.5px;color:${p.mut};line-height:1.5;margin-bottom:10px">Chaque nouveauté se coupe ici, tout de suite. « Je n’aime pas » la coupe aussi et la note : envoie-moi le rapport de diagnostic (il contient la liste) et je la supprime à la mise à jour suivante.</div>${rows}${no.length ? `<div style="${box(p, 'padding:12px 14px;margin-top:10px')}"><b>À supprimer à la prochaine mise à jour :</b> ${no.map(x => esc(x.label)).join(', ')}</div>` : ''}`;
 }
 const sys = SETCATS.find(c => c[0] === 'Système');
 if (sys && !sys[1].some(s => s[0] === 'Nouveautés à tester')) sys[1].push(['Nouveautés à tester', page]);

 // ---------- Nouveautés de l'appli : les 3 dernières versions, le reste plié ----------
 function changelog(p) {
  const card = ([v, d, l]) => `<div style="${box(p, 'padding:12px 16px;margin-bottom:10px')}"><div style="display:flex;gap:10px;align-items:center"><b style="font-size:16px">Version ${esc(v)}</b><span style="color:${p.mut};font-size:13px">${esc(d)}</span></div><ul style="margin:6px 0 0;padding-left:20px;line-height:1.5">${l.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>`;
  const all = typeof CHANGELOG !== 'undefined' ? CHANGELOG : [];
  return all.slice(0, 3).map(card).join('') + (all.length > 3 ? `<details style="${box(p, 'padding:10px 14px')}"><summary style="cursor:pointer;color:${p.mut}">Versions plus anciennes (${all.length - 3})</summary><div style="margin-top:10px">${all.slice(3).map(card).join('')}</div></details>` : '');
 }

 // ---------- Ménage ----------
 Try750.register('dock750', 'Barre du bas sans doublons', 'Radio, Réglages et Musique sont déjà dans la barre de gauche : ils quittent la barre du bas.', '7.50');
 Try750.register('pill750', 'Plus de pastille rouge sous la vitesse', 'La zone de danger s’affiche seulement en panneau, en haut de l’image.', '7.50');
 Try750.register('install750', 'Mise à jour en roulant', 'La mise à jour se télécharge en roulant, sans fenêtre ; l’installation est proposée au prochain arrêt (même un feu rouge).', '7.50');
 // Barre du bas : sans les raccourcis déjà présents dans la barre de gauche de l'autoradio (la barre verticale garde tout).
 if (typeof window.dockC === 'function') {
  const dock0 = window.dockC;
  window.dockC = function (p, vertical) {
   const html = dock0.apply(this, arguments);
   if (vertical || !Try750.on('dock750') || !html) return html;
   return String(html).replace(/<button[^>]*data-(?:dock730|act)="(?:dock:)?(?:music|radio|settings)"[\s\S]*?<\/button>/g, '');
  };
 }
 // Pastille rouge sous la vitesse : la zone de danger n'a plus que le panneau du haut.
 if (typeof window.dzPill === 'function') {
  const pill0 = window.dzPill;
  window.dzPill = function (z) { if (z && z.kind === 'zone' && Try750.on('pill750')) return ''; return pill0.apply(this, arguments); };
 }
 // Ancien cadre « encastré » : refusé par l'autoradio (droit système manquant, rapport du 25/11). On ne
 // l'essaie plus, ce qui supprime aussi le message « Android refuse Waze dans le cadre ».
 if (!store.get('gpsRefused', false)) store.set('gpsRefused', true);
 // Envoi par le Wi-Fi de l'autoradio : retiré des réglages, l'envoi passe par Internet (le Wi-Fi ne reste
 // qu'en secours automatique si la page d'envoi n'est pas en ligne).
 if (store.get('transferMode741', 'internet') !== 'internet') store.set('transferMode741', 'internet');
 // Assistant vocal des réglages : bouton « Dicter » retiré de la recherche.
 if (window.Settings720 && typeof Settings720.toolbar === 'function') {
  const tb0 = Settings720.toolbar;
  Settings720.toolbar = function (p) { return String(tb0.apply(this, arguments)).replace(/<button[^>]*data-act="search720:voice"[\s\S]*?<\/button>/, ''); };
 }

 // ---------- Mise à jour : téléchargée en roulant, installée au prochain arrêt ----------
 const stopped = () => { const s = typeof curSpeed === 'function' ? curSpeed() : null; return !s || s.v < 3; };
 let stillSince = 0, queued = store.get('install750', false);
 const act0 = window.act;
 window.act = function (a, long) {
  if (typeof a === 'string' && a.startsWith('try750:')) { const [, id, v] = a.split(':'); if (['on', 'off', 'no'].includes(v)) Try750.set(id, v); redraw(); return; }
  if (a === 'files721:install' && typeof moving === 'function' && moving() && Try750.on('install750')) { queued = true; store.set('install750', true); toast('Installation au prochain arrêt.'); return; }
  return act0.apply(this, arguments);
 };
 if (typeof checkUpdate === 'function') {
  const check0 = checkUpdate;
  checkUpdate = async function () {
   await check0.apply(this, arguments);
   try {
    if (!Try750.on('install750') || typeof moving !== 'function' || !moving() || !window.Files721 || !updInfo || verNum(updInfo.version) <= verNum(APP_VERSION)) return;
    const ph = Files721.state && Files721.state.phase;
    if (ph === 'downloading' || ph === 'verifying' || ph === 'ready') return;
    if (Files721.start(updInfo)) { queued = true; store.set('install750', true); toast('Mise à jour ' + updInfo.version + ' : téléchargement en route, installation au prochain arrêt.'); }
   } catch (e) { /* jamais bloquant */ }
  };
 }
 setInterval(() => {
  if (!queued) return;
  if (!stopped()) { stillSince = 0; return; }
  if (!stillSince) { stillSince = Date.now(); return; }
  if (Date.now() - stillSince < 2500) return;
  const ph = safe(() => Files721.state.phase, '');
  if (ph !== 'ready') return;
  queued = false; store.set('install750', false); stillSince = 0;
  safe(() => window.act('files721:install'));
 }, 1000);

 window.V750 = { changelog, page, stopped };
})();
