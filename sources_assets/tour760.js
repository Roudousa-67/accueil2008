/* 7.60 : bienvenue et visites guidées.
   - Premier lancement (et une fois après cette mise à jour) : « Bienvenue dans ta 2008 GT Line », choix ou
     création du conducteur, puis visite guidée de toute l'appli.
   - Visite guidée sur le vrai écran : tout s'assombrit sauf la zone expliquée (cadre jaune + flèche + bulle).
     Chaque étape dit ce que c'est, à quoi ça sert et comment le couper (ou que ça ne se coupe pas).
   - Réglages › Système › « Aide et visites guidées » : relancer une catégorie, tout revoir, ou la bienvenue.
   Seulement à l'arrêt : en roulant, la visite se met en pause. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 if (window.Try750) Try750.register('tour760', 'Bienvenue et visites guidées', 'Au premier lancement : choix du conducteur puis visite guidée. Réglages › Système › Aide et visites guidées.', '7.60');
 const on = () => !window.Try750 || Try750.on('tour760');
 const driving = () => safe(() => moving(), false);
 const greet = () => { const h = new Date().getHours(); return h >= 5 && h < 12 ? 'Bonjour' : h >= 12 && h < 18 ? 'Bon après-midi' : 'Bonsoir'; };
 window.greet760 = greet;
 const go = a => () => safe(() => act(a));
 const set = (c, s) => () => safe(() => openSet(c, s));
 const home = () => { safe(() => closeOverlays()); tab = 'home'; safe(() => render()); };
 const NO = 'Ça ne se coupe pas : c’est la base de l’appli.';
 // [catégorie, icône, titre, étapes] ; étape : [aller, sélecteur, titre, ce que c'est, comment le couper]
 const TOURS = [
  ['accueil', '🏠', 'Accueil', [
   [home, '[data-k="hello"]', 'Ton profil', 'Le bonjour change avec l’heure (bonjour, bon après-midi, bonsoir) et montre qui conduit. Touche-le pour changer de conducteur : chacun a son thème, ses trajets et sa note éco.', NO],
   [home, '[data-roadbox]', 'Ta vitesse et la route', 'La vitesse en grand, la météo et un décor qui suit la vraie route : ville, village, forêt, autoroute, panneaux de sortie, de stations et de limitation. Touche-le pour choisir le décor.', 'Réglages › Widgets › Vue voiture et route (décor, panneaux). Pour retirer le widget : appui long sur l’accueil, puis la croix.'],
   [home, '[data-act="gb:tap"]', 'Le cadre GPS', 'Waze (ou Maps) s’ouvre dans ce cadre, sur l’accueil. Il se cache tout seul quand tu vas dans Trajets, Entretien ou les réglages.', 'Réglages › GPS et navigation › Cadre GPS et alignement, et « Cacher Waze hors de l’accueil ».'],
   [home, '[data-act="mPlay"]', 'La musique', 'Titre, pochette et commandes de ta musique (Spotify, YouTube Music, radio…). Pendant la lecture, l’accueil prend les couleurs de la pochette, et après 30 s à l’arrêt le mode concert l’affiche en grand.', 'Réglages › Widgets › Pochette et mode concert (ou Nouveautés à tester).'],
   [home, '[data-arapps]', 'Tes applis préférées', 'Un appui ouvre l’appli. Le ✎ (ou un appui long) permet de changer, retirer ou ajouter une appli, avec leurs vrais logos.', 'Pour retirer la barre : appui long sur l’accueil, puis la croix. Pour retirer le ✎ : Nouveautés à tester.'],
   [home, 'nav.dock730', 'La barre de gauche', 'Les raccourcis toujours visibles : accueil, GPS, musique, radio, téléphone, réglages, toutes les applis. Appui long sur un raccourci pour choisir une autre appli.', 'Réglages › Widgets › Barre des raccourcis (position, taille, verrouillage).'],
   [home, '[data-act="tab:trips"]', 'Les onglets', 'Accueil, Trajets (tes trajets, ton bilan, tes pleins, tes tickets, les stations) et Entretien (plan constructeur, bilan, carnet).', NO],
   [home, '[data-act="sys:mobile"]', 'L’état de la voiture', 'Réseau, Bluetooth, Wi-Fi et tension de la batterie. Touche une icône pour ouvrir son réglage Android.', 'Réglages › Accueil et affichage › Barre du haut.'],
   [home, '[data-act="gear"]', 'Les réglages', 'Tout se règle ici, avec une recherche en haut. Chaque option a un ⓘ qui explique ce qu’elle fait. Tu y retrouves aussi « Aide et visites guidées ».', NO],
  ]],
  ['gps', '🧭', 'GPS et Waze', [
   [home, '[data-act="gb:open"]', 'Ouvrir ici', 'Ouvre Waze dans le cadre de l’accueil.', 'Rien ne s’ouvre tout seul : c’est toi qui touches.'],
   [home, '[data-act="gb:full"]', 'Plein écran', 'Ouvre Waze sur tout l’écran. Le bouton Accueil le remet dans le cadre.', NO],
   [home, '[data-act="gb:menu"]', 'Changer d’appli', 'Choisis l’appli du cadre : Waze, Google Maps, ou une autre.', NO],
   [set('GPS et navigation', 'Cacher Waze hors de l’accueil'), '#screen', 'Waze caché hors de l’accueil', 'Quand tu vas dans Trajets ou les réglages, l’appli compagnon cache Waze, puis il revient sur l’accueil.', 'Ici même : « Cacher Waze hors de l’accueil » → Non.'],
  ]],
  ['trajets', '🛣', 'Trajets et Bilan', [
   [go('tsub:hist'), '[data-act="tsub:hist"]', 'Les onglets de Trajets', 'Trajets (la liste), Stats, Bilan, Éco, Pleins, Tickets et Stations : tout ce qui touche à tes trajets et à l’essence, au même endroit.', NO],
   [go('tsub:hist'), '#screen .j733', 'Tes trajets', 'Chaque trajet enregistré : date, départ, arrivée, km, coût. Touche-en un pour voir la carte et le détail. Les filtres en haut (période, conducteur) changent tout ce qui est affiché.', 'Réglages › Trajets › Enregistrement des trajets.'],
   [go('tsub:bilan'), '#screen', 'Ton bilan', 'Le temps perdu dans les bouchons, la carte de chaleur de tes routes, les zones découvertes, les frais kilométriques pour les impôts (PDF) et le classement de tes stations.', 'Nouveautés à tester › Bilan (Trajets).'],
   [go('tsub:eco'), '#screen', 'L’éco-conduite', 'Une note sur 100 à chaque trajet (accélérations, freinages, vitesse) et le classement de la famille du mois.', 'La note ne se coupe pas ; le classement : Nouveautés à tester.'],
  ]],
  ['pleins', '⛽', 'Pleins et carburant', [
   [go('tsub:pleins'), '[data-act="tsub:pleins"]', 'Tes pleins', 'Litres, dépenses et prix moyen sur la période choisie, et la liste de tes pleins.', NO],
   [go('tsub:pleins'), '#screen details', 'Ajouter un plein', 'Date, litres, prix, compteur et station. Avec un ticket lu par le téléphone, tout est déjà rempli : tu n’as plus qu’à enregistrer.', NO],
   [go('tsub:pleins'), '[data-act="tsub:conso"]', 'Conso par plein', 'Ce que tu as consommé entre deux pleins, et les trajets faits avec chaque plein.', NO],
   [go('tsub:pleins'), '[data-act="journey733:fuel:charts"]', 'Graphiques', 'Tes dépenses et ton prix au litre mois par mois.', NO],
  ]],
  ['tickets', '🧾', 'Tickets', [
   [go('tsub:tickets'), '[data-act="transfer738:ticket"]', 'Envoyer un ticket', 'Affiche un QR : tu le scannes avec ton téléphone et tu prends la photo du ticket. Le téléphone lit la date, les litres et le prix, tu vérifies, et le plein se remplit ici.', 'Rien n’est envoyé sans toi. « Envoyer la photo seule » si tu ne veux pas la lecture.'],
   [set('Trajets et carburant', 'Transfert depuis le téléphone'), '#screen', 'Tes photos reçues', 'Toutes les photos reçues du téléphone. « Joindre au plein » rattache un ticket oublié. Un rappel te prévient si un ticket n’a pas été enregistré.', 'Nouveautés à tester › Tickets reçus jamais perdus.'],
  ]],
  ['stations', '📍', 'Stations', [
   [go('tsub:stations'), '#screen', 'Les stations autour de toi', 'Les prix du carburant autour de toi (France et Allemagne), triés par distance ou par prix, avec la carte. Sur autoroute, la prochaine station s’affiche aussi dans le décor.', 'Réglages › Carburant et tickets › Carburant et stations.'],
  ]],
  ['entretien', '🔧', 'Entretien', [
   [go('tab:service'), '[data-act="ssub:plan"]', 'Plan constructeur', 'Les entretiens prévus pour ta 2008 et quand les faire.', NO],
   [go('ssub:bilan'), '#screen', 'Bilan', 'Ce que t’a coûté l’entretien cette année.', NO],
   [go('ssub:log'), '#screen', 'Mon carnet', 'Ton carnet d’entretien : ajoute chaque passage au garage.', NO],
  ]],
  ['musique', '🎵', 'Musique', [
   [home, '[data-act="mPrev"]', 'Commandes', 'Morceau précédent, lecture/pause, suivant, pour l’appli de musique en cours.', NO],
   [home, '[data-act="mArt"]', 'La pochette', 'La pochette du morceau ; touche-la pour ouvrir l’appli de musique. Pour la radio, le logo de la station s’affiche quand il est connu.', 'Logos des radios : Nouveautés à tester.'],
   [set('Widgets', 'Pochette et mode concert'), '#screen', 'Pochette et mode concert', 'La pochette floutée en fond pendant la lecture, et la musique en grand après 30 s à l’arrêt (un appui la ferme 10 minutes).', 'Ici même : Oui / Non pour chacun.'],
  ]],
  ['reglages', '⚙️', 'Réglages', [
   [() => { safe(() => openSet('Système', 'Nouveautés à tester')); }, '#settingsSearch720', 'Chercher un réglage', 'Tape un mot (GPS, panneau, son…) : tous les réglages qui en parlent s’affichent.', NO],
   [() => { safe(() => openSet('Système', 'Nouveautés à tester')); }, '[data-act="sec753:off"]', 'Nouveautés à tester', 'Chaque nouveauté se coupe ici. « Je n’aime pas » la note pour que je la supprime. « Tout couper » remet l’appli comme avant. Si l’écran ne répond plus, relance l’appli 3 fois en 3 minutes.', NO],
   [() => { safe(() => openSet('Système', 'Aide et visites guidées')); }, '#screen', 'Aide et visites guidées', 'Ici, tu relances n’importe quelle visite guidée, ou la bienvenue.', NO],
  ]],
 ];
 const BYID = Object.fromEntries(TOURS.map(t => [t[0], t]));

 // ---------- Calque (hors #stage : il a ses propres appuis) ----------
 let layer = null, run = null;
 function drop() { if (layer) layer.remove(); layer = null; }
 function close() { drop(); run = null; }
 // Les écrans du démarrage (choix du profil, « le point avant de partir ») sont fermés : ils cacheraient la zone expliquée.
 const clearStartup = () => { safe(() => welClose()); safe(() => brfClose()); safe(() => closeOverlays()); };
 function el(html) { drop(); clearStartup(); layer = document.createElement('div'); layer.id = 'tour760'; layer.style.cssText = 'position:fixed;inset:0;z-index:2147483000;font-family:Inter,system-ui,sans-serif;color:#fff'; layer.innerHTML = html; document.body.appendChild(layer); return layer; }
 const B = (id, t, pri) => `<button data-t="${id}" style="height:48px;padding:0 22px;border-radius:14px;font-weight:800;font-size:17px;border:0;cursor:pointer;${pri ? 'background:#e0312b;color:#fff' : 'background:#ffffff1f;color:#fff'}">${t}</button>`;
 const card = 'background:#1b2233;border-radius:22px;box-shadow:0 30px 80px #000c;';

 // ---------- Bienvenue ----------
 const COLORS = ['#e0312b', '#1f6fd1', '#2f9e44', '#f2a33a', '#9b5de5'];
 function welcome(then) {
  if (driving()) { safe(() => toast('La bienvenue s’affichera à l’arrêt.')); pending = then || 'all'; return; }
  const names = safe(() => profiles(), ['Conducteur']), cur = safe(() => profIdx(), 0);
  const L = el(`<div style="position:absolute;inset:0;background:radial-gradient(circle at 30% 20%,#2b3f7a,#0b1020 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;padding:20px">
   <div style="font-size:clamp(28px,4vw,46px);font-weight:900;text-align:center">Bienvenue dans ta 2008 GT Line 👋</div>
   <div id="t760hi" style="font-size:20px;opacity:.85">${greet()} ${esc(names[cur] || '')} ! Qui conduit ? Choisis ton profil, ou crée-le.</div>
   <div style="display:flex;gap:18px;flex-wrap:wrap;justify-content:center">${names.map((n, i) => `<button data-t="p${i}" style="width:170px;height:190px;border-radius:22px;border:0;cursor:pointer;background:#ffffff12;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;${i === cur ? 'box-shadow:0 0 0 4px #e0312b' : ''}"><span style="width:86px;height:86px;border-radius:50%;background:${COLORS[i % COLORS.length]};display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:900">${esc((n || '?')[0].toUpperCase())}</span><b style="font-size:20px">${esc(n)}</b></button>`).join('')}
    <button data-t="new" style="width:170px;height:190px;border-radius:22px;border:3px dashed #ffffff55;background:none;color:#fff;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px"><span style="font-size:54px">＋</span><b style="font-size:18px">Nouveau conducteur</b></button></div>
   <div id="t760new" style="display:none;gap:10px;align-items:center"><input id="t760name" maxlength="20" placeholder="Prénom" style="height:48px;border-radius:12px;border:0;padding:0 14px;font-size:18px;width:240px"><span style="opacity:.75;font-size:15px">remplace</span><select id="t760slot" style="height:48px;border-radius:12px;font-size:16px">${names.map((n, i) => `<option value="${i}">${esc(n)}</option>`).join('')}</select>${B('save', 'Créer', 1)}</div>
   ${B('next', 'Continuer ▶', 1)}<div style="font-size:14px;opacity:.6">Ensuite, la visite guidée de l’appli (tu peux la passer).</div></div>`);
  L.addEventListener('click', e => {
   const t = e.target.closest('[data-t]'); if (!t) return; const k = t.dataset.t;
   if (k[0] === 'p') { store.set('profile', +k.slice(1)); safe(() => render()); welcome(then); }
   else if (k === 'new') { L.querySelector('#t760new').style.display = 'flex'; const sl = L.querySelector('#t760slot'); const d = names.findIndex(n => /^(profil \d|invité|michael)$/i.test(String(n).trim())); sl.value = String(d >= 0 ? d : names.length - 1); L.querySelector('#t760name').focus(); }
   else if (k === 'save') { const v = L.querySelector('#t760name').value.trim().slice(0, 20); if (!v) return; const i = +L.querySelector('#t760slot').value, l = safe(() => profiles().slice(), []); l[i] = v; store.set('profiles', l); store.set('profile', i); safe(() => render()); welcome(then); }
   else if (k === 'next') { store.set('onboard760', Date.now()); close(); if (then === 'none') return; start(then && BYID[then] ? [then] : TOURS.map(x => x[0])); }
  });
 }

 // ---------- Visite guidée ----------
 let pending = null;
 function start(cats) {
  if (driving()) { safe(() => toast('La visite guidée démarre à l’arrêt.')); pending = cats; return; }
  const steps = []; cats.forEach(c => (BYID[c] || [, , , []])[3].forEach((s, i, a) => steps.push({ cat: BYID[c][2], n: i + 1, of: a.length, s })));
  run = { steps, i: 0 }; show();
 }
 function show() {
  if (!run) return; const st = run.steps[run.i]; if (!st) { close(); safe(() => toast('Visite terminée. Tu la retrouves dans Réglages › Système › Aide et visites guidées.')); home(); return; }
  const r0 = run; safe(() => st.s[0]());
  setTimeout(() => { if (run !== r0) return; draw(st); }, 160);
 }
 function draw(st) {
  const [, sel, title, what, how] = st.s;
  let target = safe(() => document.querySelector(sel), null);
  if (target && sel === '[data-act="mPlay"]') target = target.closest('[data-fitem]') || target;
  if (target && sel === '[data-act="tab:trips"]') target = target.parentElement || target;
  if (target && sel === '[data-act="sys:mobile"]') target = target.parentElement || target;
  if (target && sel === '[data-act="tsub:hist"]' || target && sel === '[data-act="tsub:pleins"]') target = target.parentElement || target;
  const W = innerWidth, H = innerHeight;
  let r = target ? target.getBoundingClientRect() : null;
  if (r && (r.width < 4 || r.height < 4 || sel === '#screen')) r = sel === '#screen' && target ? r : null;
  const pad = 8, box = r ? { x: Math.max(4, r.x - pad), y: Math.max(4, r.y - pad), w: Math.min(W - 8, r.width + 2 * pad), h: Math.min(H - 8, r.height + 2 * pad) } : null;
  const BW = Math.min(420, W - 40), BH = 270;
  let bx = (W - BW) / 2, by = (H - BH) / 2, arrow = '';
  if (box && !(box.w > W * .8 && box.h > H * .7)) {
   const right = W - (box.x + box.w), left = box.x, below = H - (box.y + box.h);
   if (right >= BW + 50) { bx = box.x + box.w + 40; by = Math.min(H - BH - 10, Math.max(10, box.y + box.h / 2 - BH / 2)); }
   else if (left >= BW + 50) { bx = box.x - BW - 40; by = Math.min(H - BH - 10, Math.max(10, box.y + box.h / 2 - BH / 2)); }
   else if (below >= BH + 40) { by = box.y + box.h + 30; bx = Math.min(W - BW - 10, Math.max(10, box.x + box.w / 2 - BW / 2)); }
   else { by = Math.max(10, box.y - BH - 30); bx = Math.min(W - BW - 10, Math.max(10, box.x + box.w / 2 - BW / 2)); }
   const sx = bx + BW / 2 < box.x ? bx + BW : bx > box.x + box.w ? bx : bx + BW / 2, sy = by + BH / 2 < box.y ? by + BH : by > box.y + box.h ? by : by + BH / 2;
   const tx = Math.min(box.x + box.w, Math.max(box.x, sx)), ty = Math.min(box.y + box.h, Math.max(box.y, sy));
   arrow = `<svg style="position:absolute;inset:0;pointer-events:none" width="${W}" height="${H}"><defs><marker id="t760m" markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12 z" fill="#ffd60a"/></marker></defs><path d="M${sx},${sy} Q ${(sx + tx) / 2},${Math.min(sy, ty) - 30} ${tx},${ty}" stroke="#ffd60a" stroke-width="5" fill="none" marker-end="url(#t760m)"/></svg>`;
  }
  const spot = box && !(box.w > W * .8 && box.h > H * .7) ? `<div style="position:absolute;left:${box.x}px;top:${box.y}px;width:${box.w}px;height:${box.h}px;border-radius:18px;box-shadow:0 0 0 4px #ffd60a,0 0 0 9999px #000000c4;pointer-events:none"></div>` : '<div style="position:absolute;inset:0;background:#000000a8;pointer-events:none"></div>';
  const L = el(`${spot}${arrow}<div style="position:absolute;left:${bx}px;top:${by}px;width:${BW}px;${card}padding:20px 22px"><div style="font-size:13px;color:#ffd60a;font-weight:800;letter-spacing:.3px">VISITE GUIDÉE · ${esc(st.cat)} · ${st.n} / ${st.of}</div><div style="font-size:22px;font-weight:900;margin:6px 0 8px">${esc(title)}</div><div style="font-size:15.5px;line-height:1.45;opacity:.92">${esc(what)}</div><div style="font-size:14px;line-height:1.4;margin-top:8px;color:#9fd3ff"><b>Le couper :</b> ${esc(how)}</div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px"><button data-t="skip" style="background:none;border:0;color:#fff;opacity:.65;font-size:15px;cursor:pointer">Passer la visite</button><div style="display:flex;gap:10px">${run.i ? B('prev', '◀') : ''}${B('next', run.i === run.steps.length - 1 ? 'Terminer ✓' : 'Suivant ▶', 1)}</div></div><div style="font-size:12px;opacity:.5;margin-top:8px">Étape ${run.i + 1} sur ${run.steps.length}</div></div>`);
  L.addEventListener('click', e => { const t = e.target.closest('[data-t]'); if (!t || !run) return; const k = t.dataset.t; if (k === 'skip') { close(); home(); } else if (k === 'prev') { run.i = Math.max(0, run.i - 1); show(); } else if (k === 'next') { run.i++; show(); } });
 }
 // En roulant : pause.
 setInterval(() => {
  if (layer && driving()) { const r = run; close(); safe(() => toast('Visite en pause pendant la conduite. Reprends-la dans Réglages › Système › Aide et visites guidées.')); if (r) pending = null; }
  else if (pending && !driving() && !layer) { const p = pending; pending = null; if (typeof p === 'string' || p === undefined) welcome(p); else start(p); }
 }, 1500);

 // ---------- Réglages › Système › Aide et visites guidées ----------
 function page(p) {
  return `<div style="font-size:14px;color:${p.mut};line-height:1.5;margin-bottom:12px">Choisis ce que tu veux revoir. Chaque visite montre le vrai écran avec une flèche, explique à quoi sert chaque chose et comment la couper. Les visites se font à l’arrêt.</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">${TOURS.map(([id, ic, t, s]) => `<button data-act="tour760:${id}" style="${box(p, 'padding:16px;text-align:left;display:flex;flex-direction:column;gap:6px;min-height:120px')};color:${p.txt}"><span style="font-size:34px">${ic}</span><b style="font-size:18px">${esc(t)}</b><span style="font-size:13px;color:${p.mut}">${s.length} étape${s.length > 1 ? 's' : ''} · ▶ Lancer</span></button>`).join('')}</div>
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">${chipBtn(p, 'tour760:all', '▶ Tout revoir depuis le début', true)}${chipBtn(p, 'tour760:welcome', 'Revoir la bienvenue (profils)')}</div>`;
 }
 const sys = SETCATS.find(c => c[0] === 'Système');
 if (sys && !sys[1].some(s => s[0] === 'Aide et visites guidées')) sys[1].unshift(['Aide et visites guidées', page]);
 const act0 = window.act;
 window.act = function (a) {
  if (typeof a === 'string' && a.startsWith('tour760:')) {
   const k = a.slice(8);
   if (k === 'welcome') welcome('none'); else if (k === 'all') start(TOURS.map(x => x[0])); else if (BYID[k]) start([k]);
   return;
  }
  return act0.apply(this, arguments);
 };
 // Premier lancement (ou première fois après cette mise à jour).
 setTimeout(() => { if (on() && !store.get('onboard760', 0)) welcome('all'); }, 3500);
 window.Tour760 = { welcome, start, close, TOURS, greet, state: () => run };
})();
