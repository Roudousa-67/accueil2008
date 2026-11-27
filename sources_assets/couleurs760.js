/* 7.60 : couleurs assorties au fond. Dès qu'un fond est choisi, l'appli lit ses couleurs dominantes et règle
   la couleur des boutons, des cartes et de la musique pour aller avec. Un bandeau (Réglages › Apparence, étapes
   1 et 2) montre les couleurs et propose « Annuler ». Choisir soi-même un thème ou une couleur à l'étape 2 passe
   devant. Réglage : « Couleurs assorties au fond » Auto / Non (et dans Nouveautés à tester).
   Stockage par conducteur : a08_tint760_<profil> = { wall: fond déjà vu, t: couleurs | null }. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 if (window.Try750) Try750.register('col760', 'Couleurs assorties au fond', 'Quand tu choisis un fond, les couleurs des boutons et des cartes s’accordent toutes seules.', '7.60');
 const on = () => !window.Try750 || Try750.on('col760');
 const KEY = () => 'tint760_' + safe(() => profIdx(), 0);
 const get = () => store.get(KEY(), null);
 const put = v => store.set(KEY(), v);
 const curWall = () => safe(() => pv('wall', ''), '') || '';
 const UI = { undo: undefined, name: '', busy: '' };

 // ---------- couleurs ----------
 const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
 function hsl(h, s, l) {
  h = ((h % 360) + 360) % 360; s = clamp(s, 0, 1); l = clamp(l, 0, 1);
  const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
 }
 // Lit les pixels : teinte dominante, seconde teinte, part de couleur.
 function analyze(data) {
  const bins = new Float64Array(36); let total = 0, n = 0;
  for (let i = 0; i < data.length; i += 4) {
   const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; n++;
   if (d < .04) continue;
   let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360;
   const w = d * d; bins[Math.floor(h / 10) % 36] += w; total += w;
  }
  const sc = i => bins[(i + 35) % 36] * .5 + bins[i] + bins[(i + 1) % 36] * .5;
  let b1 = 0; for (let i = 1; i < 36; i++) if (sc(i) > sc(b1)) b1 = i;
  let b2 = -1; for (let i = 0; i < 36; i++) { const dist = Math.min(Math.abs(i - b1), 36 - Math.abs(i - b1)); if (dist >= 5 && sc(i) >= sc(b1) * .25 && (b2 < 0 || sc(i) > sc(b2))) b2 = i; }
  const h1 = b1 * 10 + 5, h2 = b2 >= 0 ? b2 * 10 + 5 : (h1 + 35) % 360;
  return { h1, h2, vivid: n ? total / n : 0 };
 }
 function scheme(a, light) {
  if (!a || a.vivid < 1e-4) return null;              // fond gris ou noir : rien à assortir
  const sf = clamp(a.vivid * 25, .3, 1), H = a.h1;
  const accL = light ? .42 : (H > 200 && H < 290 ? .66 : .58);
  const t = { acc: hsl(H, .85, accL), wacc: hsl(a.h2, .8, light ? .4 : .68), art: hsl(H, .55, light ? .4 : .28) };
  if (light) Object.assign(t, { card: hsl(H, .35, .96), card2: hsl(H, .3, .91) });
  else Object.assign(t, { card: hsl(H, .1 + .3 * sf, .12), card2: hsl(H, .1 + .25 * sf, .18), mtxt: hsl(H, .55, .8) });
  return t;
 }
 // Image du fond en petit, puis les couleurs (rappel quand c'est prêt).
 function sample(id, done) {
  const W = 96, H = 54, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  const read = () => safe(() => analyze(g.getImageData(0, 0, W, H).data), null);
  const animated = window.Wall755 && (Wall755.ids.includes(id) || (window.Wall760 && Wall760.has(id)));
  if (animated) { safe(() => Wall755.paint(id, g, W, H, 20000, new Date())); done(read()); return; }
  const url = safe(() => wallUrl(id), ''); if (!url) { done(null); return; }
  const im = new Image(); im.onload = () => { safe(() => g.drawImage(im, 0, 0, W, H)); done(read()); }; im.onerror = () => done(null); im.src = url;
 }
 const wallName = id => id === 'photo' ? 'ta photo' : safe(() => { const w = WALLS.find(x => x.id === id) || {}; return w.name || w.cat; }, '') || 'ce fond';
 function match(id, quiet) {
  const prev = get(); UI.busy = id;
  sample(id, a => {
   UI.busy = '';
   if (curWall() !== id) return;                       // un autre fond a été choisi entre-temps
   const light = safe(() => !!palette().light, false), t = scheme(a, light);
   UI.undo = prev ? prev.t : null; UI.name = wallName(id);
   put({ wall: id, t });
   if (!t) { if (!quiet) safe(() => toast('Ce fond n’a pas de couleur marquée : couleurs du thème gardées.')); }
   else if (!quiet && !inApp()) safe(() => toast('🎨 Couleurs assorties au fond. Pour changer : Réglages › Apparence.'));
   safe(() => render());
  });
 }
 const inApp = () => safe(() => tab === 'settings' && SETCATS[setCat][1][setSub][0] === 'Apparence', false);

 // ---------- palette ----------
 const pal0 = window.palette;
 window.palette = function () {
  const p = pal0.apply(this, arguments), s = on() ? get() : null, t = s && s.t;
  if (!t || !curWall()) return p;
  const al = x => (String(x || '').length === 9 ? String(x).slice(7) : 'CC');
  const q = Object.assign({}, p);
  if (t.acc) { q.acc = t.acc; q.onAcc = safe(() => lum(t.acc) > .45, false) ? '#16171A' : '#FFFFFF'; }
  if (t.wacc) q.wacc = t.wacc; if (t.art) q.art = t.art; if (t.mtxt) q.mtxt = t.mtxt;
  if (t.card) { q.card = t.card + al(p.card); q.wbg = t.card + al(p.wbg); if (!p.light) q.mbg = t.card + al(p.mbg); }
  if (t.card2) q.card2 = t.card2 + al(p.card2);
  return q;
 };

 // ---------- fond changé : on assortit ----------
 function check() {
  const id = curWall(), s = get();
  if (!s) { put({ wall: id, t: null }); return; }       // première fois : on ne touche à rien
  if (s.wall === id || UI.busy === id) return;
  if (!on() || !id) { put({ wall: id, t: null }); return; }
  match(id);
 }
 const r0 = window.render;
 window.render = function () { safe(check); return r0.apply(this, arguments); };

 // ---------- choix à la main : il passe devant ----------
 const act0 = window.act;
 window.act = function (a) {
  if (typeof a === 'string' && a.startsWith('col760:')) {
   const op = a.slice(7), s = get() || { wall: curWall(), t: null };
   if (op === 'undo') { put({ wall: curWall(), t: UI.undo === undefined ? null : UI.undo }); UI.undo = undefined; }
   else if (op === 'match') { if (curWall()) { put({ wall: curWall(), t: null }); match(curWall(), false); } }
   else if (op === 'off') { UI.undo = s.t; put({ wall: curWall(), t: null }); }
   else if (op === 'auto:1' || op === 'auto:0') { safe(() => Try750.set('col760', op === 'auto:1' ? 'on' : 'off')); }
   render(); return;
  }
  if (typeof a === 'string') {
   const s = get();
   if (s && s.t && (a.startsWith('theme:') || a.startsWith('arth:'))) { UI.undo = s.t; put({ wall: s.wall, t: null }); }
   else if (s && s.t && s.t.acc && (a.startsWith('acc:') || a === 'accCustom' || a === 'accReset')) { const t = Object.assign({}, s.t); delete t.acc; put({ wall: s.wall, t }); }
  }
  return act0.apply(this, arguments);
 };

 // ---------- bandeau dans Apparence (étapes 1 et 2) ----------
 function banner(p, step) {
  if (step !== 1 && step !== 2) return '';
  const s = get(), t = s && s.t, auto = on(), id = curWall();
  const dot = c => `<span style="width:22px;height:22px;border-radius:50%;background:${c};border:2px solid #ffffff55;flex:0 0 auto"></span>`;
  const sw = chipBtn(p, 'col760:auto:1', 'Auto', auto) + chipBtn(p, 'col760:auto:0', 'Non', !auto);
  let msg = '', btns = '';
  if (UI.busy && UI.busy === id) msg = 'Je cherche les couleurs qui vont avec ce fond…';
  else if (t) { msg = `${[t.acc, t.wacc, t.card].filter(Boolean).map(dot).join('')}<span>Couleurs assorties à « ${esc(UI.name || wallName(s.wall))} »</span>`; btns = (UI.undo !== undefined ? chipBtn(p, 'col760:undo', 'Annuler') : chipBtn(p, 'col760:off', 'Retirer')) + (step === 1 ? chipBtn(p, 'ap760:next', 'Les changer moi-même ▶') : ''); }
  else if (id) { msg = step === 2 && UI.undo ? 'Tu as choisi tes couleurs : elles passent devant.' : 'Couleurs du thème.'; btns = chipBtn(p, 'col760:match', '🎨 Assortir au fond', true) + (UI.undo ? chipBtn(p, 'col760:undo', 'Remettre les couleurs assorties') : ''); }
  else msg = 'Fond « Couleur du thème » : rien à assortir.';
  return `<div data-col760 style="${box(p, 'padding:10px 12px;margin:0 0 12px;display:flex;flex-direction:column;gap:8px')}"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><b style="font-size:15px">Couleurs assorties au fond</b>${sw}</div><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:14px">${msg}<span style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap">${btns}</span></div></div>`;
 }
 window.Couleurs760 = { analyze, scheme, sample, match, banner, get, hsl };
})();
