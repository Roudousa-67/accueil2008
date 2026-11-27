/* 7.60 : « Apparence » en assistant, étape par étape, avec un aperçu de l'accueil en direct.
   1 Fond (Couleur, Dégradés, Espace animé, Ciel, Paysages, Mes photos) · 2 Couleurs (thème) · 3 Police ·
   4 Icônes (barre du bas et barre de gauche) · 5 Enregistrer dans Thème 1, 2 ou 3 (et les remettre d'un appui).
   Remplace les pages séparées Thèmes, Fond d'écran, Icônes et Police (leurs liens mènent ici).
   Snap760.home() : image de l'accueil (sert aussi aux aperçus des « i »). Chargé après settings738.js. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 if (window.Try750) Try750.register('appa760', 'Apparence en assistant', 'Fond, couleurs, police et icônes étape par étape, avec aperçu en direct et Thème 1, 2, 3.', '7.60');
 const on = () => !window.Try750 || Try750.on('appa760');

 // ---------- Image de l'accueil (copie réduite de l'écran, toiles comprises) ----------
 let snapping = false;
 function homeHTML(scale) {
  if (snapping) return '';
  snapping = true;
  const keep = { tab, setCat: safe(() => setCat, 0), setSub: safe(() => setSub, 0) }, toast0 = window.toast;
  let out = '';
  try {
   window.toast = () => {};
   tab = 'home'; render();
   const sc = document.getElementById('screen'), st = document.getElementById('stage');
   const clone = sc.cloneNode(true), src = sc.querySelectorAll('canvas'), dst = clone.querySelectorAll('canvas');
   src.forEach((c, i) => { try { const im = document.createElement('img'); im.src = c.toDataURL('image/jpeg', .7); im.style.cssText = c.style.cssText; im.className = c.className; if (!im.style.width) { im.style.width = c.clientWidth + 'px'; im.style.height = c.clientHeight + 'px'; } dst[i].replaceWith(im); } catch (e) { } });
   clone.removeAttribute('id'); clone.querySelectorAll('[id]').forEach(e => e.removeAttribute('id')); clone.querySelectorAll('[data-act]').forEach(e => e.removeAttribute('data-act'));
   clone.querySelectorAll('#tour760,[data-help723],.ap760').forEach(e => e.remove());
   const bg = st.style.background || getComputedStyle(st).background, W = st.offsetWidth || 1280, H = st.offsetHeight || 720;
   const layers = ['wall755', 'cover758'].map(id => { const e = document.getElementById(id); if (!e) return ''; if (e.tagName === 'CANVAS') return `<img src="${e.toDataURL('image/jpeg', .7)}" style="position:absolute;inset:0;width:100%;height:100%">`; const bi = e.firstChild && e.firstChild.style && e.firstChild.style.backgroundImage; return bi ? `<div style="position:absolute;inset:0;background-image:${bi.replace(/"/g, '&quot;')};background-size:cover;filter:blur(12px) brightness(.42)"></div>` : ''; }).join('');
   out = `<div style="width:${Math.round(W * scale)}px;height:${Math.round(H * scale)}px;overflow:hidden;border-radius:10px;position:relative;background:${bg.replace(/"/g, '&quot;')};box-shadow:0 0 0 2px #ffffff33;flex:none">${layers}<div style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform:scale(${scale});transform-origin:0 0;pointer-events:none">${clone.outerHTML}</div></div>`;
  } catch (e) { out = ''; }
  finally {
   tab = keep.tab; safe(() => { setCat = keep.setCat; setSub = keep.setSub; }); window.toast = toast0; snapping = false;
   safe(() => render());
  }
  return out;
 }
 window.Snap760 = { home: homeHTML, busy: () => snapping };

 // ---------- Assistant ----------
 const S = { step: 1, cat: 'Espace animé', prev: '', prevKey: '' };
 const STEPS = ['Fond', 'Couleurs', 'Police', 'Icônes', 'Enregistrer'];
 const GROUPS = [['Couleur', w => false], ['Espace animé', w => w.k === 'sp751' && /Espace animé/.test(w.cat)], ['Paysages animés', w => w.cat === 'Paysages animés'], ['Abstraits animés', w => w.cat === 'Abstraits animés'], ['Ciel', w => w.cat === 'Ciel'], ['Espace fixe', w => w.cat === 'Espace'], ['Paysages fixes', w => /Paysages de nuit|Aurores/.test(w.cat)], ['Dégradés', w => /Dégradés|Abstraits|Carbone/.test(w.cat)], ['Mes photos', w => false]];
 const sig = () => [safe(() => pv('wall', ''), ''), JSON.stringify(store.get('tint760_' + safe(() => profIdx(), 0), null)), safe(() => themeIdFor(profIdx()), ''), store.get('appFont', ''), store.get('iconFam', ''), store.get('dockStyle760', ''), safe(() => JSON.stringify(custom(profIdx(), themeIdFor(profIdx()))), '')].join('|');
 function refreshPreview() {
  const k = sig(); if (k === S.prevKey && S.prev) return;
  setTimeout(() => {
   if (tab !== 'settings' || safe(() => SETCATS[setCat][1][setSub][0], '') !== 'Apparence') return;
   S.prevKey = sig(); S.prev = homeHTML(.27);
   const el = document.getElementById('ap760prev'); if (el) el.innerHTML = S.prev;
  }, 30);
 }
 const tile = (p, id, label, bg) => { const cur = safe(() => pv('wall', ''), ''); return `<button data-act="wall:${id}" style="aspect-ratio:16/9;border-radius:10px;overflow:hidden;position:relative;background:${bg || p.card2};outline:${cur === id ? `3px solid ${p.acc}` : 'none'};outline-offset:2px">${id && id !== 'photo' ? `<img data-wall="${esc(id)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">` : ''}<span style="position:absolute;left:6px;bottom:4px;font-size:12px;font-weight:700;color:#fff;text-shadow:0 1px 3px #000">${esc(label || '')}</span></button>`; };
 function stepFond(p) {
  const chips = GROUPS.map(([g]) => chipBtn(p, 'ap760:cat:' + g, g, S.cat === g)).join('');
  let grid = '';
  if (S.cat === 'Couleur') grid = tile(p, '', 'Couleur du thème') + `<div style="grid-column:span 3;font-size:13.5px;color:${p.mut};align-self:center">Le fond prend la couleur du thème choisi à l’étape 2.</div>`;
  else if (S.cat === 'Mes photos') { const ph = store.get('wallPhoto', ''); grid = (ph ? tile(p, 'photo', 'Ma photo', `url(${ph}) center/cover`) : '') + `<button data-act="wallPick" style="aspect-ratio:16/9;border-radius:10px;border:2px dashed ${p.mut};color:${p.txt};font-weight:700">＋ Ajouter ma photo</button><input id="wallFile" type="file" accept="image/*" style="display:none">`; }
  else { const g = GROUPS.find(x => x[0] === S.cat); grid = (typeof WALLS !== 'undefined' ? WALLS : []).filter(w => g && g[1](w)).map(w => tile(p, w.id, w.name || '')).join(''); }
  const dim = safe(() => pv('wallDim', 30), 30);
  return `<div style="font-size:20px;font-weight:800;margin-bottom:8px">1. Choisis ton fond</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">${chips}</div><div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px">${grid}</div>
  <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:12px"><span style="color:${p.mut};font-size:14px">Assombrir le fond :</span>${[0, 15, 30, 45, 60].map(d => chipBtn(p, 'wallDim:' + d, d + ' %', dim === d)).join('')}${typeof Wall755 !== 'undefined' ? `<span style="color:${p.mut};font-size:14px;margin-left:10px">Animation :</span>${chipBtn(p, 'w755:lent', 'Lente', store.get('wallAnim755', 'lent') !== 'fixe')}${chipBtn(p, 'w755:fixe', 'Fixe', store.get('wallAnim755', 'lent') === 'fixe')}` : ''}</div>`;
 }
 const pageOf = (cat, sub) => { for (const c of (window.__ap760old || [])) if (c[0] === cat || !cat) { const s = c[1].find(x => x[0] === sub); if (s) return s[1]; } return null; };
 function stepFrom(sub, n, title) { const f = pageOf(null, sub); return `<div style="font-size:20px;font-weight:800;margin-bottom:8px">${n}. ${title}</div>${f ? safe(() => f(curP || palette()), '') : ''}`; }
 // Barre de gauche : styles d'icônes.
 const DSTYLES = [['', 'Contour (d’origine)'], ['rond', 'Ronds colorés'], ['carre', 'Carrés colorés'], ['neon', 'Néon'], ['mini', 'Minimal'], ['vraies', 'Vrais logos des applis']];
 function stepIcones(p) {
  const cur = store.get('dockStyle760', '');
  return `<div style="font-size:20px;font-weight:800;margin-bottom:8px">4. Choisis les icônes</div><div style="font-size:16px;font-weight:700;margin:4px 0 8px">Barre de gauche</div><div style="display:flex;gap:8px;flex-wrap:wrap">${DSTYLES.map(([k, n]) => chipBtn(p, 'ap760:dock:' + k, n, cur === k)).join('')}</div><div style="font-size:13px;color:${p.mut};margin:6px 0 14px">Pour changer l’appli d’un raccourci de la barre de gauche : appui long dessus, puis « Choisir une application ».</div><div style="font-size:16px;font-weight:700;margin:4px 0 8px">Barre du bas</div>${(() => { const f = pageOf(null, 'Icônes'); return f ? safe(() => f(p), '') : ''; })()}`;
 }
 // Thèmes enregistrés : fond, couleurs, police, icônes du profil.
 const KEYRE = () => new RegExp('^a08_(custom_' + profIdx() + '_|wall_' + profIdx() + '$|wallDim_' + profIdx() + '$|appFont$|iconFam$|dockStyle760$|wallAnim755$|tint760_' + profIdx() + '$|dock(Color|IconColor|Accent|Background)7\\d\\d$|media(Accent|Background|Text)730$)');
 function snapshot() { store.flush && store.flush(); const re = KEYRE(), o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && re.test(k)) o[k] = localStorage.getItem(k); } o.__theme = safe(() => themeIdFor(profIdx()), '01'); o.__desc = [safe(() => (WALLS.find(w => w.id === pv('wall', '')) || {}).name, '') || 'couleur du thème', store.get('appFont', '') || 'police du thème'].join(' · '); o.__prev = S.prev; o.__at = Date.now(); return o; }
 function apply(o) { const re = KEYRE(); for (let i = localStorage.length - 1; i >= 0; i--) { const k = localStorage.key(i); if (k && re.test(k) && !(k in o)) localStorage.removeItem(k); } for (const k in o) if (k.startsWith('a08_')) localStorage.setItem(k, o[k]); const m = Object.assign({}, store.get('profileThemes', {})); m[profIdx()] = o.__theme; safe(() => store.reload && store.reload()); store.set('profileThemes', m); location.reload(); }
 const slots = () => store.get('apSlots760_' + safe(() => profIdx(), 0), [null, null, null]);
 function stepSave(p) {
  const L = slots();
  return `<div style="font-size:20px;font-weight:800;margin-bottom:8px">5. Enregistre ton thème</div><div style="font-size:14px;color:${p.mut};margin-bottom:10px">Touche une case pour y enregistrer ton apparence actuelle. « Mettre » remet tout d’un coup : fond, couleurs, police et icônes.</div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">${[0, 1, 2].map(i => { const s = L[i]; return `<div style="${box(p, 'padding:12px;display:flex;flex-direction:column;gap:8px')}">${s && s.__prev ? `<div style="pointer-events:none;transform-origin:0 0">${s.__prev}</div>` : `<div style="height:120px;border-radius:10px;border:2px dashed ${p.mut};display:flex;align-items:center;justify-content:center;font-size:40px;color:${p.mut}">＋</div>`}<b style="font-size:18px">Thème ${i + 1}</b><span style="font-size:13px;color:${p.mut}">${s ? esc(s.__desc || '') : 'vide'}</span><div style="display:flex;gap:6px;flex-wrap:wrap">${chipBtn(p, 'ap760:save:' + i, s ? 'Remplacer' : 'Enregistrer ici', !s)}${s ? chipBtn(p, 'ap760:load:' + i, 'Mettre', true) : ''}</div></div>`; }).join('')}</div>`;
 }
 function page(p) {
  if (!on()) return `<div style="font-size:14px;color:${p.mut}">L’assistant est coupé (Nouveautés à tester).</div>`;
  const bar = `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${STEPS.map((s, i) => { const n = i + 1, done = n < S.step, cur = n === S.step; return `<button data-act="ap760:step:${n}" style="display:flex;align-items:center;gap:6px;color:${p.txt};opacity:${cur ? 1 : .75}"><span style="width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;${done ? 'background:#2f9e44;color:#fff' : cur ? `background:${p.acc};color:${p.onAcc || '#fff'}` : `background:${p.card2}`}">${done ? '✓' : n}</span><b style="font-size:15px">${s}</b></button>${n < 5 ? `<span style="opacity:.35">—</span>` : ''}`; }).join('')}</div>`;
  const body = S.step === 1 ? stepFond(p) : S.step === 2 ? stepFrom('Thèmes', 2, 'Choisis les couleurs (thème)') : S.step === 3 ? stepFrom('Police', 3, 'Choisis la police') : S.step === 4 ? stepIcones(p) : stepSave(p);
  const col = safe(() => (window.Couleurs760 ? Couleurs760.banner(p, S.step) : ''), '');
  const nav = `<div style="display:flex;gap:8px;margin-left:auto">${S.step > 1 ? chipBtn(p, 'ap760:prev', '◀ Retour') : ''}${S.step < 5 ? chipBtn(p, 'ap760:next', 'Suivant : ' + STEPS[S.step].toLowerCase() + ' ▶', true) : ''}</div>`;
  refreshPreview();
  return `<div class="ap760" style="display:flex;flex-direction:column;gap:12px"><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">${bar}${nav}</div><div style="display:grid;grid-template-columns:${Math.round(1280 * .27) + 6}px minmax(0,1fr);gap:16px;align-items:start"><div><div style="font-size:13px;color:${p.mut};margin-bottom:6px">Aperçu en direct</div><div id="ap760prev">${S.prev || `<div style="width:${Math.round(1280 * .27)}px;height:${Math.round(720 * .27)}px;border-radius:10px;background:${p.card2}"></div>`}</div></div><div style="min-width:0">${col ? body.replace(/^(<div[^>]*>[^<]*<\/div>)/, (m) => m + col) : body}</div></div></div>`;
 }
 // ---------- Rangement : une seule page « Apparence » ----------
 const OLD = ['Thèmes', 'Fond d\'écran', 'Icônes', 'Police'];
 function arrange() {
  if (!window.__ap760old) window.__ap760old = SETCATS.map(c => [c[0], c[1].slice()]);
  const acc = SETCATS.find(c => c[1].some(s => OLD.includes(s[0]))) || SETCATS[0];
  for (const c of SETCATS) c[1] = c[1].filter(s => !(on() && OLD.includes(s[0])) && s[0] !== 'Apparence');
  if (on()) acc[1].unshift(['Apparence', page]); else { const o = window.__ap760old.find(c => c[0] === acc[0]); if (o) acc[1].splice(0, acc[1].length, ...o[1]); }
  safe(() => { Settings720.index = null; });
 }
 arrange();
 const os0 = window.openSet;
 window.openSet = function (cat, sub) {
  if (on() && OLD.includes(sub)) { S.step = sub === 'Fond d\'écran' ? 1 : sub === 'Thèmes' ? 2 : sub === 'Police' ? 3 : 4; const c = SETCATS.find(x => x[1].some(s => s[0] === 'Apparence')); return os0.call(this, c ? c[0] : cat, 'Apparence'); }
  return os0.apply(this, arguments);
 };
 // Barre de gauche : styles d'icônes (classe sur la barre) et vrais logos.
 const css = document.createElement('style');
 css.textContent = `.dock760-rond .dockButton730>span:first-child,.dock760-rond .dockButton730 svg{border-radius:50%!important}.dock760-rond .dockButton730{border-radius:50%}.dock760-rond .dockButton730 svg{background:var(--dockAccent730);padding:7px;border-radius:50%;color:#fff;stroke:#fff}.dock760-carre .dockButton730 svg{background:var(--dockAccent730);padding:7px;border-radius:12px;stroke:#fff}.dock760-neon .dockButton730 svg{filter:drop-shadow(0 0 6px var(--dockAccent730)) drop-shadow(0 0 2px var(--dockAccent730));stroke:var(--dockAccent730)}.dock760-mini .dockButton730{opacity:.75}.dock760-mini .dockButton730 svg{transform:scale(.8)}.dock760-vraies .dockButton730 img.real760{width:var(--dockIcon730,34px);height:var(--dockIcon730,34px);border-radius:22%}`;
 document.head.appendChild(css);
 function dockLook() {
  const k = store.get('dockStyle760', '');
  document.querySelectorAll('#screen nav.dock730').forEach(n => {
   DSTYLES.forEach(([s]) => s && n.classList.toggle('dock760-' + s, s === k));
   if (k !== 'vraies') return;
   n.querySelectorAll('.dockButton730[data-dock730]').forEach(b => {
    if (b.querySelector('img.real760')) return;
    const id = b.dataset.dock730, d = safe(() => DOCK_ALL.find(x => x.id === id), null);
    const pks = id.startsWith('pkg.') ? [id.slice(4)] : (store.get('dock_' + id, '') + ',' + ((d && d.pk) || '')).split(',').filter(Boolean);
    for (const pk of pks) { const src = safe(() => getIcon(pk), ''); if (src) { const svg = b.querySelector('svg'); const im = document.createElement('img'); im.className = 'real760'; im.src = src; im.alt = ''; if (svg) svg.replaceWith(im); else b.prepend(im); break; } }
   });
  });
 }
 const r0 = window.render;
 window.render = function () { const o = r0.apply(this, arguments); safe(dockLook); return o; };
 const act0 = window.act;
 window.act = function (a) {
  if (typeof a !== 'string') return act0.apply(this, arguments);
  if (a.startsWith('ap760:')) {
   const [, op, v] = a.split(':');
   if (op === 'step') S.step = Math.max(1, Math.min(5, +v)); else if (op === 'next') S.step = Math.min(5, S.step + 1); else if (op === 'prev') S.step = Math.max(1, S.step - 1);
   else if (op === 'cat') S.cat = v; else if (op === 'dock') store.set('dockStyle760', v || '');
   else if (op === 'save') { const L = slots().slice(); S.prev = homeHTML(.27); L[+v] = snapshot(); store.set('apSlots760_' + profIdx(), L); toast('Apparence enregistrée dans Thème ' + (+v + 1) + '.'); }
   else if (op === 'load') { const o = slots()[+v]; if (o) { toast('Thème ' + (+v + 1) + ' remis.'); setTimeout(() => apply(o), 300); } return; }
   render(); return;
  }
  if (a.startsWith('try750:appa760:')) { const r = act0.apply(this, arguments); arrange(); render(); return r; }
  return act0.apply(this, arguments);
 };
 window.Apparence760 = { S, page, snapshot, apply, slots, homeHTML, arrange, dockLook };
})();
