/* 7.61 : « Personnaliser mon écran », comme la mise en route d'un iPhone neuf.
   Plein écran : à gauche ton vrai accueil, en direct (il change à chaque choix) ; à droite une étape à la fois,
   avec de grandes vignettes, « Continuer » et « Retour ».
   Étapes : Bienvenue · Fond d'écran · Couleurs · Écriture · Disposition de l'accueil (widgets) · Icônes · Terminé
   (enregistrer dans Thème 1, 2 ou 3). Ouverture : Réglages › Accueil et affichage › Apparence, ou act('perso761:open').
   Les choix utilisent les réglages existants (fond, thème, police, disposition, icônes) : rien de nouveau à régler ailleurs. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 if (window.Try750) Try750.register('perso761', 'Personnaliser mon écran (façon iPhone)', 'Fond, couleurs, écriture, disposition et icônes en plein écran, accueil en direct à côté.', '7.61');
 const on = () => !window.Try750 || Try750.on('perso761');
 const escA = x => String(x == null ? '' : x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
 const STEPS = [
  ['hello', 'Personnalise ta 2008 GT Line', 'Choisis ton fond, tes couleurs, ton écriture et ta disposition. À gauche, ton accueil change en direct.'],
  ['fond', 'Ton fond d’écran', 'Touche un fond : l’accueil à gauche le prend tout de suite.'],
  ['couleurs', 'Tes couleurs', 'Le style des cartes et la couleur des boutons.'],
  ['ecriture', 'Ton écriture', 'La police de toute l’appli.'],
  ['accueil', 'Ton accueil', 'Choisis une disposition. Tu pourras toujours bouger un widget plus tard (appui long dessus).'],
  ['icones', 'Tes icônes', 'La barre de gauche et la barre des raccourcis.'],
  ['fin', 'C’est prêt !', 'Enregistre ce style pour le remettre d’un seul appui.'],
 ];
 const S = { open: false, i: 0, cat: 'Espace animé', keep: null, gridBackup: null, layer: null };

 // ---------- Données des choix ----------
 const GROUPS = [['Espace animé', w => w.k === 'sp751' && /Espace animé/.test(w.cat)], ['Paysages animés', w => w.cat === 'Paysages animés'], ['Ciel', w => w.cat === 'Ciel'], ['Espace', w => w.cat === 'Espace'], ['Paysages', w => /Paysages de nuit|Aurores/.test(w.cat)], ['Dégradés', w => /Dégradés|Abstraits|Carbone/.test(w.cat)]];
 const walls = cat => { const g = GROUPS.find(x => x[0] === cat); return safe(() => WALLS.filter(w => g && g[1](w)), []); };
 const DOCK = [['', 'D’origine'], ['rond', 'Ronds colorés'], ['carre', 'Carrés colorés'], ['neon', 'Néon'], ['mini', 'Minimal'], ['vraies', 'Vrais logos']];
 // Dispositions de l'accueil (grille 12 × 6) ; les widgets déjà là gardent leurs réglages (ex. applis de la barre).
 const LAYOUTS = [
  ['route', 'Route + GPS', 'La route à gauche, Waze à droite, musique et raccourcis en bas.', [['carfull', 0, 0, 5, 5], ['gpsbox', 5, 0, 7, 5], ['music', 0, 5, 5, 1], ['apps', 5, 5, 7, 1]]],
  ['gps', 'GPS en grand', 'Waze prend presque tout l’écran.', [['gpsbox', 0, 0, 8, 5], ['carfull', 8, 0, 4, 3], ['music', 8, 3, 4, 2], ['apps', 0, 5, 12, 1]]],
  ['musique', 'Musique en avant', 'La pochette et la musique bien visibles.', [['carfull', 0, 0, 4, 5], ['music', 4, 0, 3, 5], ['gpsbox', 7, 0, 5, 5], ['apps', 0, 5, 12, 1]]],
  ['tableau', 'Tableau de bord', 'Voiture, GPS, météo et carburant d’un coup d’œil.', [['carfull', 0, 0, 4, 4], ['gpsbox', 4, 0, 5, 4], ['weather', 9, 0, 3, 2], ['fuel', 9, 2, 3, 2], ['music', 0, 4, 6, 2], ['apps', 6, 4, 6, 2]]],
 ];
 const layoutNow = () => { const c = safe(() => fCfg(), null), pg = c && c.pages && c.pages[0] || []; const sig = it => it.b[0] + ':' + it.x + ',' + it.y + ',' + it.w + ',' + it.h; const cur = pg.filter(it => it.t === 'w').map(sig).sort().join('|'); const L = LAYOUTS.find(l => l[3].map(([b, x, y, w, h]) => b + ':' + x + ',' + y + ',' + w + ',' + h).sort().join('|') === cur); return L ? L[0] : ''; };
 function applyLayout(id) {
  const L = LAYOUTS.find(l => l[0] === id); if (!L) return;
  const c = JSON.parse(JSON.stringify(fCfg())); if (!S.gridBackup) S.gridBackup = JSON.parse(JSON.stringify(c));
  const old = c.pages[0] || [], used = new Set(), out = [];
  for (const [b, x, y, w, h] of L[3]) { const k = old.findIndex((it, n) => !used.has(n) && it.t === 'w' && it.b && it.b[0] === b); if (k >= 0) { used.add(k); out.push(Object.assign({}, old[k], { x, y, w, h })); } else out.push({ id: nid(), t: 'w', b: [b], x, y, w, h }); }
  // Ce qui ne rentre plus sur la page 1 part sur la page 2 (rien n'est perdu).
  const rest = old.filter((it, n) => !used.has(n));
  if (rest.length) { if (!c.pages[1]) c.pages[1] = []; for (const it of rest) { const sp = freeSpot761(c.pages[1], it.w, it.h) || freeSpot761(c.pages[1], 1, 1); if (sp) c.pages[1].push(Object.assign({}, it, sp)); } }
  c.pages[0] = out;
  safe(() => store.set('layout_' + profIdx(), 'custom'));
  fSave(c);
 }
 function freeSpot761(items, w, h) { const ov = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h; for (let y = 0; y <= 6 - h; y++) for (let x = 0; x <= 12 - w; x++) { const r = { x, y, w, h }; if (!items.some(it => ov(it, r))) return r; } return null; }

 // ---------- Mise en page : l'accueil réel, réduit, à gauche ----------
 const PANEL = () => Math.round(Math.max(380, Math.min(520, innerWidth * .37)));
 function placeStage() {
  const st = document.getElementById('stage'); if (!st) return;
  const pw = PANEL(), m = 24, aw = innerWidth - pw - 2 * m, ah = innerHeight - 2 * m - 40, s = Math.min(aw / 1280, ah / 720);
  const x = m + (aw - 1280 * s) / 2, y = m + 40 + (ah - 720 * s) / 2;
  st.style.height = '720px'; st.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px) scale(${s})`;
  st.style.borderRadius = '22px'; st.style.boxShadow = '0 0 0 3px #ffffff30, 0 24px 60px #000c'; st.style.pointerEvents = 'none';
  if (S.layer) { const lb = S.layer.querySelector('[data-pz=live]'); if (lb) { lb.style.left = Math.round(x) + 'px'; lb.style.top = Math.round(y - 34) + 'px'; } }
 }
 function freeStage() { const st = document.getElementById('stage'); if (!st) return; st.style.borderRadius = ''; st.style.boxShadow = ''; st.style.pointerEvents = ''; safe(() => fit()); }

 // ---------- Panneau ----------
 const btn = (act, label, on, extra) => `<button data-pz="${escA(act)}" class="pz-b${on ? ' on' : ''}" style="${extra || ''}">${label}</button>`;
 function tile(act, on, inner, label) { return `<button data-pz="${escA(act)}" class="pz-t${on ? ' on' : ''}">${inner}${label ? `<span class="pz-l">${label}</span>` : ''}</button>`; }
 function body() {
  const k = STEPS[S.i][0];
  if (k === 'hello') return `<div style="display:flex;flex-direction:column;align-items:center;gap:18px;margin-top:20px;text-align:center"><div style="font-size:84px">🚗</div><div style="font-size:17px;opacity:.85;line-height:1.5">6 petites étapes, une minute.<br>Tu peux tout changer plus tard dans<br><b>Réglages › Apparence</b>.</div></div>`;
  if (k === 'fond') {
   const cur = safe(() => pv('wall', ''), '');
   const chips = GROUPS.map(([g]) => btn('cat:' + g, g, S.cat === g)).join('');
   const tiles = [tile('wall:', cur === '', `<span class="pz-th" style="background:${safe(() => palette().bgCss, '#123')}"></span>`, 'Couleur du thème')].concat(walls(S.cat).map(w => tile('wall:' + w.id, cur === w.id, `<img class="pz-th" data-w761="${escA(w.id)}" alt="">`, escA(w.name || w.cat || '')))).join('');
   const dim = safe(() => pv('wallDim', 30), 30);
   return `<div class="pz-chips">${chips}</div><div class="pz-grid">${tiles}</div><div class="pz-row"><span>Assombrir</span>${[0, 15, 30, 45, 60].map(d => btn('do:wallDim:' + d, d + ' %', dim === d)).join('')}</div>`;
  }
  if (k === 'couleurs') {
   const pl = safe(() => palette(), {}), cur = pl.tid || '', acc = String(pl.acc || '').toUpperCase();
   const c = safe(() => custom(profIdx(), themeIdFor(profIdx())), {}) || {}, wall = safe(() => pv('wall', ''), '');
   const styles = [['150', 'Autoradio', 'Barre à gauche, route, GPS, musique', 'linear-gradient(160deg,#16307e,#3159c6)'], ['160', 'Personnalisable', 'Les mêmes widgets, en plus sobre', 'linear-gradient(160deg,#14151a,#2a2e3a)']].filter(x => safe(() => THEMES.some(t => t.id === x[0]), true));
   const st = styles.map(([id, n, d, bg]) => tile('do:arth:' + id, cur === id, `<span class="pz-th" style="background:${bg}"></span>`, `<b>${n}</b><small>${d}</small>`)).join('');
   const grads = ['#16307e', '#07090f', '#8e1b2a', '#127a5c', '#5b2bb5', '#3a3d44', '#cfd9ee'];
   const gsw = grads.map(g => `<button data-pz="do:argrad:${g}" class="pz-sw${c.bgType === 'grad' && String(c.g2).toLowerCase() === g ? ' on' : ''}" style="background:linear-gradient(160deg,${g},${g}99)"></button>`).join('');
   const sw = safe(() => ACCENTS, []).slice(0, 20).map(x => `<button data-pz="do:acc:${x}" class="pz-sw${acc === x.toUpperCase() ? ' on' : ''}" style="background:${x}"></button>`).join('');
   const auto = !window.Try750 || Try750.on('col760');
   return `<div class="pz-h">Style des cartes</div><div class="pz-grid two">${st}</div>
    <div class="pz-h" style="margin-top:14px">Couleur des boutons</div><div class="pz-sws">${sw}</div>
    <div class="pz-row"><span>Assortir les couleurs au fond tout seul</span>${btn('do:col760:auto:1', 'Oui', auto)}${btn('do:col760:auto:0', 'Non', !auto)}</div>
    <div class="pz-row"><span>Cartes transparentes</span>${btn('do:toggleGlass', c.glass ? 'Oui' : 'Non', !!c.glass)}</div>
    ${wall ? '' : `<div class="pz-h" style="margin-top:14px">Couleur du fond (sans image)</div><div class="pz-sws">${gsw}</div>`}`;
  }
  if (k === 'ecriture') {
   const cur = store.get('appFont', '') || safe(() => palette().font, 'Inter');
   return `<div class="pz-fonts">${safe(() => APP_FONTS_ALL, ['Inter']).map(f => tile('do:font:' + f, cur === f, `<span style="font-family:'${escA(f)}',sans-serif;font-size:30px;font-weight:700;line-height:1">12:45</span><span style="font-family:'${escA(f)}',sans-serif;font-size:15px;opacity:.85">Bonjour Abdou</span>`, escA(f))).join('')}</div>`;
  }
  if (k === 'accueil') {
   const cur = layoutNow();
   const mini = L => `<span class="pz-lay">${L[3].map(([b, x, y, w, h]) => `<i style="left:${x / 12 * 100}%;top:${y / 6 * 100}%;width:calc(${w / 12 * 100}% - 3px);height:calc(${h / 6 * 100}% - 3px);background:${b === 'gpsbox' ? '#2a6bea' : b === 'music' ? '#e2363a' : b === 'apps' ? '#6b7280' : b === 'carfull' ? '#2f9e44' : '#f0a020'}"></i>`).join('')}</span>`;
   return `<div class="pz-grid two">${LAYOUTS.map(L => tile('lay:' + L[0], cur === L[0], mini(L), `<b>${escA(L[1])}</b><small>${escA(L[2])}</small>`)).join('')}</div><div class="pz-leg"><i style="background:#2f9e44"></i>Route et voiture <i style="background:#2a6bea"></i>GPS <i style="background:#e2363a"></i>Musique <i style="background:#6b7280"></i>Raccourcis</div>${S.gridBackup ? `<div class="pz-row">${btn('lay:undo', '↶ Remettre mon ancienne disposition')}</div>` : ''}`;
  }
  if (k === 'icones') {
   const d = store.get('dockStyle760', ''), f = store.get('iconFam', '');
   return `<div class="pz-h">Barre de gauche</div><div class="pz-chips">${DOCK.map(([v, n]) => btn('do:ap760:dock:' + v, n, d === v)).join('')}</div><div class="pz-h">Icônes des raccourcis</div><div class="pz-chips">${safe(() => ICF, []).map(([v, n]) => btn('do:icf:' + v, n, f === v)).join('')}</div>`;
  }
  if (k === 'fin') {
   const L = safe(() => Apparence760.slots(), []) || [];
   return `<div class="pz-grid three">${[0, 1, 2].map(i => tile('save:' + i, false, `<span class="pz-th" style="display:flex;align-items:center;justify-content:center;font-size:30px">${L[i] ? '💾' : '＋'}</span>`, `<b>Thème ${i + 1}</b><small>${L[i] ? 'Remplacer' : 'Enregistrer ici'}</small>`)).join('')}</div><div style="opacity:.8;font-size:14px;margin-top:10px">Tes thèmes se remettent dans Réglages › Apparence.</div>`;
  }
  return '';
 }
 function panel() {
  const [, title, sub] = STEPS[S.i], last = S.i === STEPS.length - 1;
  const dots = STEPS.map((_, n) => `<i class="${n === S.i ? 'on' : n < S.i ? 'done' : ''}"></i>`).join('');
  return `<div class="pz-p"><div class="pz-top"><div class="pz-dots">${dots}</div>${btn('close', 'Quitter', false, 'margin-left:auto')}</div>
   <div class="pz-title">${title}</div><div class="pz-sub">${sub}</div><div class="pz-body">${body()}</div>
   <div class="pz-foot">${S.i > 0 ? btn('prev', '◀ Retour') : ''}${btn(last ? 'close' : 'next', last ? 'Terminer' : S.i === 0 ? 'Commencer' : 'Continuer', true, 'flex:1;height:58px;font-size:19px')}</div></div>`;
 }
 const CSS = `#perso761{position:fixed;inset:0;z-index:2147482000;pointer-events:none;font-family:Inter,system-ui,sans-serif;color:#fff}
 #perso761 [data-pz=live]{position:absolute;font-size:14px;opacity:.85;letter-spacing:.3px}
 #perso761 .pz-p{position:absolute;top:0;right:0;bottom:0;display:flex;flex-direction:column;padding:22px 24px;background:#0b1224f2;box-shadow:-10px 0 40px #0008;pointer-events:auto}
 #perso761 .pz-top{display:flex;align-items:center;gap:10px}#perso761 .pz-dots{display:flex;gap:7px}#perso761 .pz-dots i{width:9px;height:9px;border-radius:50%;background:#ffffff33}#perso761 .pz-dots i.done{background:#ffffff99}#perso761 .pz-dots i.on{background:#4c8dff;width:26px;border-radius:6px}
 #perso761 .pz-title{font-size:30px;font-weight:800;margin-top:18px;line-height:1.15}#perso761 .pz-sub{font-size:15px;opacity:.78;margin:8px 0 14px;line-height:1.45}
 #perso761 .pz-body{flex:1;overflow:auto;padding-right:4px}#perso761 .pz-foot{display:flex;gap:10px;margin-top:14px}
 #perso761 .pz-b{height:46px;padding:0 16px;border-radius:14px;background:#ffffff18;color:#fff;font-size:15px;font-weight:700;border:0}#perso761 .pz-b.on{background:#2f6bff}
 #perso761 .pz-chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}#perso761 .pz-chips .pz-b{height:40px;font-size:14px}
 #perso761 .pz-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}#perso761 .pz-grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}
 #perso761 .pz-t{display:flex;flex-direction:column;gap:6px;align-items:stretch;padding:6px;border-radius:16px;background:#ffffff10;color:#fff;border:0;text-align:left;outline:3px solid transparent}#perso761 .pz-t.on{outline-color:#4c8dff;background:#2f6bff33}
 #perso761 .pz-th{position:relative;display:block;width:100%;aspect-ratio:16/9;border-radius:11px;background:#1a2340;object-fit:cover}
 #perso761 .pz-l{font-size:13px;font-weight:700;line-height:1.25;display:flex;flex-direction:column;gap:2px}#perso761 .pz-l small{font-weight:400;opacity:.75;font-size:12px}
 #perso761 .pz-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:14px;font-size:14px}#perso761 .pz-row .pz-b{height:40px}
 #perso761 .pz-h{font-size:15px;font-weight:800;margin:6px 0 10px;opacity:.9}
 #perso761 .pz-sws{display:flex;gap:10px;flex-wrap:wrap}#perso761 .pz-sw{width:40px;height:40px;border-radius:50%;border:0;box-shadow:inset 0 0 0 1px #ffffff40}#perso761 .pz-sw.on{box-shadow:0 0 0 3px #0b1224,0 0 0 6px #fff}
 #perso761 .pz-fonts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}#perso761 .pz-fonts .pz-t{padding:12px 14px;gap:4px}
 #perso761 .pz-lay{position:relative;display:block;aspect-ratio:16/9;border-radius:11px;background:#0d1730;padding:3px}#perso761 .pz-lay i{position:absolute;border-radius:5px;margin:3px}
 #perso761 .pz-leg{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:12.5px;opacity:.85;margin-top:10px}#perso761 .pz-leg i{width:12px;height:12px;border-radius:3px;display:inline-block;margin-left:6px}`;
 function draw() {
  if (!S.layer) return;
  const sc = S.layer.querySelector('.pz-body'), top = sc ? sc.scrollTop : 0;
  S.layer.querySelector('[data-pz=panel]').innerHTML = panel();
  const p = S.layer.querySelector('.pz-p'); if (p) p.style.width = PANEL() + 'px';
  const sc2 = S.layer.querySelector('.pz-body'); if (sc2 && S.keepScroll) sc2.scrollTop = top; S.keepScroll = false;
  loadThumbs();
 }
 function loadThumbs() { const imgs = Array.from(S.layer.querySelectorAll('img[data-w761]:not([src])')); let n = 0; const step = () => { if (!S.open) return; const im = imgs[n++]; if (!im) return; const u = safe(() => wallUrl(im.dataset.w761), ''); if (u) im.src = u; setTimeout(step, 30); }; step(); }
 function live() { safe(() => { tab = 'home'; render(); }); placeStage(); }

 // ---------- Ouvrir / fermer ----------
 function open(step) {
  if (!on()) return;
  if (safe(() => curSpeed().v, 0) > 8) { safe(() => toast('À l’arrêt seulement.')); return; }
  if (S.open) { S.i = step || 0; draw(); return; }
  S.open = true; S.i = step || 0; S.gridBackup = null; S.keep = { tab, bodyBg: document.body.style.background };
  safe(() => { if (window.Tour760) Tour760.close(); }); safe(() => welClose()); safe(() => brfClose()); safe(() => { brfWant = null; }); safe(() => closeOverlays());
  if (!document.getElementById('css761p')) { const st = document.createElement('style'); st.id = 'css761p'; st.textContent = CSS; document.head.appendChild(st); }
  const L = document.createElement('div'); L.id = 'perso761';
  L.innerHTML = `<div data-pz="live">● Ton accueil, en direct</div><div data-pz="panel"></div>`;
  document.body.appendChild(L); S.layer = L; document.body.style.background = 'radial-gradient(1200px 700px at 30% 40%,#1b2a55,#060912)';
  L.addEventListener('click', onClick);
  live(); draw();
 }
 function close() {
  if (!S.open) return;
  S.open = false; if (S.layer) S.layer.remove(); S.layer = null; document.body.style.background = S.keep ? S.keep.bodyBg : '';
  freeStage(); safe(() => { tab = 'home'; render(); });
 }
 function onClick(e) {
  const b = e.target.closest('[data-pz]'); if (!b || !S.layer || !S.layer.contains(b)) return;
  const a = b.dataset.pz; if (a === 'live' || a === 'panel') return;
  e.preventDefault(); e.stopPropagation();
  S.keepScroll = true;
  if (a === 'close') { close(); return; }
  if (a === 'next') { S.i = Math.min(STEPS.length - 1, S.i + 1); S.keepScroll = false; draw(); return; }
  if (a === 'prev') { S.i = Math.max(0, S.i - 1); S.keepScroll = false; draw(); return; }
  if (a.startsWith('cat:')) { S.cat = a.slice(4); S.keepScroll = false; draw(); return; }
  if (a.startsWith('wall:')) { safe(() => window.act(a)); live(); draw(); return; }
  if (a.startsWith('do:')) { safe(() => window.act(a.slice(3))); live(); draw(); return; }
  if (a === 'lay:undo') { if (S.gridBackup) { fSave(S.gridBackup); S.gridBackup = null; } live(); draw(); return; }
  if (a.startsWith('lay:')) { safe(() => applyLayout(a.slice(4))); live(); draw(); return; }
  if (a.startsWith('save:')) { safe(() => window.act('ap760:save:' + a.slice(5))); safe(() => toast('Enregistré dans Thème ' + (+a.slice(5) + 1) + '.')); live(); draw(); return; }
 }
 addEventListener('resize', () => { if (S.open) { placeStage(); draw(); } });
 // En roulant : on referme.
 setInterval(() => { if (S.open && safe(() => curSpeed().v, 0) > 8) close(); }, 2000);
 // Le rendu normal remet l'accueil à sa place : on le réduit à nouveau.
 const r0 = window.render; window.render = function () { const o = r0.apply(this, arguments); if (S.open) { if (tab !== 'home') { tab = 'home'; r0.apply(this, arguments); } placeStage(); } return o; };

 // ---------- Réglages › Apparence : un gros bouton au lieu de longues listes ----------
 function hero(p, old) {
  const L = safe(() => Apparence760.slots(), []) || [];
  const card = `background:${p.card2};border-radius:${Math.max(8, p.r - 6)}px;padding:16px 18px`;
  return `<div style="display:flex;flex-direction:column;gap:14px">
   <div style="${card};display:flex;align-items:center;gap:18px"><div style="font-size:52px">✨</div><div style="flex:1;min-width:0"><div style="font-size:22px;font-weight:800">Personnaliser mon écran</div><div style="color:${p.mut};font-size:14.5px;margin-top:4px;line-height:1.4">Fond, couleurs, écriture, disposition des widgets et icônes, étape par étape, avec ton accueil en direct à côté.</div></div><button data-act="perso761:open" style="height:56px;padding:0 26px;border-radius:16px;background:${p.acc};color:${p.onAcc || '#fff'};font-size:18px;font-weight:800">Commencer</button></div>
   <div style="${card}"><div style="font-size:16px;font-weight:800;margin-bottom:10px">Mes thèmes</div><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px">${[0, 1, 2].map(i => { const s = L[i]; return `<div style="display:flex;flex-direction:column;gap:8px;align-items:stretch">${s && s.__prev ? `<div style="pointer-events:none;overflow:hidden;border-radius:10px">${s.__prev}</div>` : `<div style="aspect-ratio:16/9;border-radius:10px;border:2px dashed ${p.mut};display:flex;align-items:center;justify-content:center;color:${p.mut};font-size:30px">＋</div>`}<b>Thème ${i + 1}</b>${s ? chipBtn(p, 'ap760:load:' + i, 'Mettre ce thème', true) : `<span style="font-size:13px;color:${p.mut}">Vide : enregistre-le à la fin de « Personnaliser ».</span>`}</div>`; }).join('')}</div></div>
   <details><summary style="font-size:15px;font-weight:700;padding:8px 0;cursor:pointer">Réglages détaillés (ancienne page étape par étape)</summary>${safe(() => old(p), '')}</details></div>`;
 }
 function wrapPage() {
  for (const c of SETCATS) { const k = c[1].findIndex(s => s[0] === 'Apparence'); if (k >= 0 && !c[1][k][1].__pz) { const old = c[1][k][1], f = p => on() ? hero(p, old) : old(p); f.__pz = true; c[1][k][1] = f; } }
 }
 wrapPage();
 const act0 = window.act;
 window.act = function (a) {
  if (a === 'perso761:open') { open(0); return; }
  const r = act0.apply(this, arguments);
  if (typeof a === 'string' && a.startsWith('try750:')) safe(wrapPage);
  return r;
 };
 window.Perso761 = { S, open, close, applyLayout, layoutNow, LAYOUTS, STEPS, draw };
})();
