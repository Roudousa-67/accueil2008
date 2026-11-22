/* Accueil 2008 GT v4.7 — chargé en dernier (après home5.js)
   1. voiture 3D partout            4. écran de bienvenue (utilisateur, lanceur officiel, musique)
   2. un widget par usage           5. onglet Parcours : enregistrement GPS des trajets
   3. accueil rangé au 1er lancement
   Ne touche ni à car3d.js ni au CAN. */
'use strict';
const Q47 = new URLSearchParams(location.search);

// ================= 1. voiture 3D partout =================
// plus de photos ni de dessin : le modèle 3D, ou la route animée (rendue depuis le même modèle 3D).
// La photo « avant » ne sert que d'attente pendant le chargement, ou si l'autoradio n'a pas de 3D (WebGL).
window.carPick = function () { return window.Car3D && Car3D.supported() && Car3D.state() !== 'fail' ? '3d' : 'avant'; };
['avant', 'face', 'rue', 'parking', 'dessin'].forEach((k) => { delete CAR_PICS[k]; });   // plus de photo ni de dessin : la voiture 3D partout

// ================= 2. un widget par usage =================
const ell = 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
GBLOCKS.roadcar = { n: 'Route animée + voiture 3D', r: (p, w, h) => { const big = h >= 1.6, sh = 'text-shadow:0 2px 6px #0b1d55b3';
  return `<div data-roadbox style="position:relative;width:100%;height:100%;border-radius:${p.r}px;overflow:hidden;background:#24418f;color:#fff;min-height:0">
  <canvas data-road="v" style="position:absolute;inset:0;width:100%;height:100%"></canvas>
  <div style="position:absolute;left:4%;top:${big ? 6 : 5}%;line-height:1.1;${sh};pointer-events:none">
    <div style="display:flex;align-items:center;gap:10px"><div data-k="speed" data-overcol="1" style="font-size:${big ? 54 : 40}px;font-weight:600;letter-spacing:-1px;line-height:1">--</div><span style="pointer-events:auto">${limitSign(big ? 50 : 38)}</span></div>
    <div style="font-size:${big ? 15 : 12}px;font-weight:600;padding-left:3px">km/h</div></div>
  <div data-act="wxDetail" style="position:absolute;right:4%;top:${big ? 6 : 5}%;text-align:right;${sh}">
    <div style="display:flex;align-items:center;justify-content:flex-end;gap:6px"><span data-k="wIcon" data-size="${big ? 36 : 26}" style="filter:drop-shadow(0 2px 4px #0005)"></span><span data-k="wTemp" style="font-size:${big ? 34 : 24}px;font-weight:600;line-height:1">--°</span></div>
    <div data-k="cityName" style="font-size:${big ? 16 : 13}px;font-weight:700;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></div>
    <div data-show="vig" style="display:none;margin-top:5px;align-items:center;gap:6px;padding:3px 11px 3px 8px;border-radius:14px;color:#fff;font-size:${big ? 14 : 12}px;font-weight:700;box-shadow:0 2px 8px #0007;text-shadow:none;white-space:nowrap">⚠ <span data-k="vigTxt"></span></div></div>
  <div data-car360 role="img" aria-label="La 2008 sur la route, glisse pour la faire tourner" style="position:absolute;left:50%;bottom:${big ? 15 : 17}%;height:${big ? 48 : 42}%;aspect-ratio:503/300;transform:translateX(-50%);background:url(car/route-360.webp) ${car360Pos()} 0/2400% 100% no-repeat;touch-action:none;filter:drop-shadow(0 6px 6px #0008)"></div>
  <div style="position:absolute;left:50%;bottom:3%;transform:translateX(-50%);max-width:94%;display:flex;align-items:center;gap:6px;padding:3px 12px;border-radius:14px;background:#0b1d55b3;font-size:${big ? 14 : 12}px;font-weight:600;white-space:nowrap;overflow:hidden;pointer-events:none">${ic('pin', big ? 15 : 13, '#fff', 2.2)}<span data-k="adrStreet" style="overflow:hidden;text-overflow:ellipsis">Recherche de l'adresse…</span></div></div>`; } };
GBLOCKS.speedonly = { n: 'Vitesse', r: (p, w, h) => { const big = h >= 1.3, huge = h >= 2 && w >= 2; const fs = huge ? 110 : big ? 64 : 40;
  return `<div style="${card(p, `padding:8px 12px;display:flex;flex-direction:${big && w < 1.5 ? 'column' : 'row'};align-items:center;justify-content:center;gap:${big ? 10 : 12}px`)}">
  <div style="display:flex;align-items:baseline;gap:6px"><span data-k="speed" style="font-size:${fs}px;font-weight:700;line-height:1;font-variant-numeric:tabular-nums">--</span><span style="font-size:${huge ? 20 : 13}px;color:${p.mut}">km/h</span></div>${limitSign(huge ? 72 : big ? 44 : 36)}</div>`; } };
GBLOCKS.address = { n: 'Adresse', r: (p, w, h) => `<div style="${card(p, 'padding:8px 14px;display:flex;align-items:center;gap:12px')}"><span style="flex:none;display:flex">${ic('pin', h >= 1.3 ? 30 : 24, p.acc, 2.2)}</span>
  <div style="min-width:0;flex:1"><div data-k="adrStreet" style="font-size:${h >= 1.3 ? 24 : 18}px;font-weight:700;line-height:1.2;${ell}">Recherche de l'adresse…</div><div data-k="adrCity" style="font-size:${h >= 1.3 ? 15 : 13}px;color:${p.mut};${ell}"></div></div></div>` };
GBLOCKS.track = { n: 'Parcours (trajet enregistré)', r: (p, w, h) => `<button data-act="tab:tracks" style="${card(p, 'padding:8px 14px;display:flex;flex-direction:column;justify-content:center;gap:2px;text-align:left;width:100%;height:100%;color:inherit')}">
  <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:${p.mut};${ell}"><span data-k="trkDot" style="color:#ff4d4d;font-size:11px"></span><span data-k="trkState">Parcours</span></div>
  <div style="display:flex;align-items:baseline;gap:6px"><span data-k="trkKm" style="font-size:${h >= 1.3 ? 38 : 26}px;font-weight:700;line-height:1.1;font-variant-numeric:tabular-nums">0,0</span><span style="font-size:13px;color:${p.mut}">km</span><span data-k="trkDur" style="font-size:${h >= 1.3 ? 18 : 15}px;font-weight:600;margin-left:auto"></span></div>
  ${h >= 1.3 ? `<div data-k="trkSub" style="font-size:12.5px;color:${p.mut};${ell}"></div>` : ''}</button>` };
// même tuile « route + voiture 3D » dans tous les thèmes (plus de route dessinée avec une vignette posée dessus)
window.heroRoad = function (p) { return roadVideoTile(p, 3, 2); };
delete GBLOCKS.road;
// musique : la forme suit la taille choisie (barre, tuile, grande pochette)
GBLOCKS.music.r = (p, w, h) => { const cw = Math.round(w * 2), ch = Math.round(h * 1.5);
  if (ch >= 4 && cw <= 4) return musicC(p);
  if (ch >= 2 && cw >= 3) return musicC(p, 'tile');
  if (cw >= 4) return musicC(p, 'row');
  return `<div style="${card(p, `background:${p.mbg};color:#F2F2F4;padding:8px 10px;display:flex;flex-direction:column;justify-content:center;gap:6px`)}">${ch >= 2 ? mText(p, 14) + accessC() : ''}${ctlC(p, ch >= 2 ? 44 : 40)}</div>`; };
GBLOCKS.clock.r = (p, w, h) => { const big = h >= 1.3, wide = w >= 2;
  return `<div style="${card(p, 'padding:8px 16px;display:flex;flex-direction:column;justify-content:center')}"><div data-k="clock" style="font-size:${big ? (wide ? 92 : 68) : 46}px;font-weight:300;line-height:1;font-variant-numeric:tabular-nums">--:--</div><div data-k="dateTxt" style="font-size:${big ? 17 : 13}px;color:${p.mut};margin-top:${big ? 8 : 3}px;${ell}"></div></div>`; };
// noms clairs : un usage par widget
GBLOCKS.map.n = 'Carte GPS';
GBLOCKS.carfull.n = 'Route + vitesse + météo + adresse';
GBLOCKS.weather.n = 'Météo';
GBLOCKS.clock.n = 'Heure et date';
GBLOCKS.music.n = 'Musique';
GBLOCKS.speed.n = 'Vitesse + météo';
GBLOCKS.car.n = 'Ma voiture (état)';
if (GBLOCKS.where) GBLOCKS.where.n = 'Position détaillée';

// ================= 3. accueil rangé au premier lancement de la 4.7 =================
(function () {
  if (store.get('v47', 0)) return;
  store.set('v47', 1);
  for (let i = 0; i < 3; i++) {
    const old = store.get('home_v2_' + i, null);
    if (old && old.pages) {                             // l'ancienne disposition est gardée (Paramètres → Écran d'accueil)
      old.pages.forEach((pg) => pg.forEach((it) => { if (it.t === 'w' && it.b) it.b = it.b.map((b) => (b === 'road' ? 'roadcar' : b)); }));   // l'ancienne tuile route = la nouvelle
      store.set('home_bak_' + i, old);
    }
    store.set('home_v2_' + i, null);
    store.set('layout_' + i, 'custom');
  }
  store.set('carPick', null);                          // plus de choix photo / dessin : voiture 3D partout
})();
{ const cat = SETCATS.find(([n]) => n === 'Écran d\'accueil'); const sub = cat && cat[1].find(([n]) => n === 'Disposition');
  if (sub) { const f0 = sub[1]; sub[1] = (p) => f0(p) + (store.get('home_bak_' + profIdx(), null) ? setRow(p, 'Reprendre mon ancienne disposition', 'Celle d\'avant le rangement. Les deux s\'échangent : tu peux revenir en arrière.', chipBtn(p, 'h2:unbak', 'Reprendre')) : ''); } }

// ================= 4. écran de bienvenue =================
let welEl = null, welT = 0, welLeft = 0;
function welClose() { clearInterval(welT); welT = 0; if (welEl) { welEl.remove(); welEl = null; } }
let welKey = '';
// ce que l'autoradio a (ou n'a pas) : lanceur, musique, démarrage auto, position GPS, infos voiture
function welState() {
  const demo = !A, all = demo && Q47.has('welall'), now = Date.now(); let qf = {};
  if (!demo) { try { qf = JSON.parse(A.qfStatus ? A.qfStatus() : '{}') || {}; } catch (e) { qf = {}; } }
  return {
    isHome: demo ? false : !!(A.isDefaultHome && A.isDefaultHome()),
    music: demo ? false : !!(A.notifAccess && A.notifAccess()),
    auto: demo ? !all : !A.canAutoStart || !!A.canAutoStart(),
    gps: demo ? !all : !!(loc && now - loc.ts < 20000),
    car: demo ? !all : !!((car && now - car.ts < 20000) || qf.car > 0),
    qf: demo ? (all ? 4 : 0) : (!qf.bound ? 1 : !qf.linked ? 2 : !qf.init ? 3 : 4)
  };
}
function welDraw() {
  if (!welEl) return;
  const p = curP || palette(), names = profiles(), cur = profIdx(), st = welState();
  const key = JSON.stringify([st, names, cur, welLeft > 0]);
  if (key === welKey && welEl.firstChild) { const c = welEl.querySelector('[data-welcount]'); if (c) c.textContent = welLeft > 0 ? ` (${welLeft})` : ''; return; }   // rien n'a changé : on ne refait pas les boutons (un appui en cours serait perdu)
  welKey = key;
  const themes = store.get('profileThemes', {});
  const row = (ok, title, sub, btns) => `<div style="display:flex;align-items:center;gap:12px;padding:7px 14px;border-radius:13px;background:#ffffff12"><b style="flex:none;font-size:19px;color:${ok ? '#9be07a' : '#ffb84d'}">${ok ? '✓' : '!'}</b><div style="flex:1;min-width:0"><div style="font-size:15px;font-weight:600">${title}</div><div style="font-size:12px;color:#c9cbd3;line-height:1.3">${sub}</div></div>${btns}</div>`;
  const b = (act, t, pri) => `<button data-act="${act}" style="height:42px;padding:0 14px;border-radius:12px;font-size:14px;font-weight:700;white-space:nowrap;${pri ? `background:${p.acc};color:${p.onAcc}` : 'background:#ffffff24;color:#fff'}">${t}</button>`;
  const qfTxt = ['', 'Service CAN de l\'autoradio introuvable.', 'Connexion au boîtier en cours…', 'Boîtier connecté, mais accès refusé.', 'Boîtier connecté, aucune donnée pour l\'instant : mets le contact.'][st.qf] || '';
  const list = [
    st.isHome ? row(true, 'Lanceur officiel', 'L\'autoradio démarre directement sur cet écran.', '') : row(false, 'Définir comme lanceur officiel', 'Sinon l\'autoradio rouvre son écran d\'usine au redémarrage. Choisis « Accueil 2008 GT » puis « Toujours ».', b('wel:open:home', 'Définir', true) + b('wel:open:qflauncher', 'Menu de l\'autoradio')),
    st.music ? '' : row(false, 'Musique de toutes les applis', 'Autorise l\'accès pour afficher et piloter Spotify, YouTube Music, Deezer, la radio…', b('wel:open:notif', 'Autoriser', true)),
    st.gps ? '' : row(false, 'Position GPS : pas encore reçue', 'Sans elle : ni vitesse GPS, ni kilomètres, ni trajets, ni parcours. Vérifie que la localisation est autorisée pour l\'appli, et activée.', b('wel:open:app', 'Autorisations', true) + b('wel:open:location', 'Localisation')),
    st.car ? '' : row(false, 'Infos voiture : rien reçu du boîtier', `${qfTxt} Sans lui : pas de carburant, d'autonomie ni de voyants (la vitesse vient alors du GPS).`, b('wel:can', 'Voir le détail', true)),
    st.auto ? '' : row(false, 'Démarrage automatique au contact', 'Autorise l\'affichage par-dessus les autres applis.', b('wel:open:overlay', 'Régler', true))
  ].filter(Boolean);
  const small = list.length >= 4;                          // beaucoup de lignes : cartes de profil plus basses pour que tout tienne
  const cardP = (i) => { const th = THEMES.find((t) => t.id === (themes[i] || themeIdFor(i))) || THEMES[0], d = small ? 58 : 92;
    return `<button data-act="wel:prof:${i}" style="width:230px;padding:${small ? '10px 14px' : '22px 14px 18px'};border-radius:20px;background:${i === cur ? '#ffffff1f' : '#ffffff0d'};outline:${i === cur ? '3px solid ' + p.acc : '1px solid #ffffff24'};color:#fff;display:flex;flex-direction:${small ? 'row' : 'column'};align-items:center;gap:${small ? 12 : 10}px;text-align:${small ? 'left' : 'center'}">
      <span style="flex:none;width:${d}px;height:${d}px;border-radius:50%;background:${th.acc || p.acc};color:#fff;display:flex;align-items:center;justify-content:center;font-size:${small ? 27 : 42}px;font-weight:700;box-shadow:0 6px 18px #0008">${esc(names[i].charAt(0).toUpperCase())}</span>
      <span style="min-width:0;display:flex;flex-direction:column;gap:${small ? 2 : 8}px;max-width:100%"><span style="font-size:${small ? 19 : 22}px;font-weight:700;${ell}">${esc(names[i])}</span><span style="font-size:${small ? 12 : 13}px;color:#c9cbd3;${ell}">Thème ${esc(th.name || '')}</span></span></button>`; };
  welEl.innerHTML = `<div style="width:1000px;display:flex;flex-direction:column;align-items:center;gap:${small ? 11 : 16}px;color:#fff">
    <div style="text-align:center"><div style="font-size:${small ? 36 : 44}px;font-weight:700;line-height:1.1">Bienvenue</div><div style="font-size:${small ? 18 : 20}px;color:#d7d9e0;margin-top:${small ? 2 : 4}px">Choisissez l'utilisateur</div></div>
    <div style="display:flex;gap:18px">${[0, 1, 2].map(cardP).join('')}</div>
    <div style="width:860px;display:flex;flex-direction:column;gap:${small ? 6 : 8}px">${list.join('')}</div>
    <button data-act="wel:go" style="height:${small ? 46 : 50}px;padding:0 26px;border-radius:14px;background:#ffffff24;color:#fff;font-size:16px;font-weight:700">Continuer avec ${esc(names[cur])}<span data-welcount>${welLeft > 0 ? ` (${welLeft})` : ''}</span></button>
    <div style="font-size:12px;color:#a9acb6">Pour ne plus afficher cet écran : Paramètres → Profils.</div></div>`;
}
function welShow() {
  if (welEl || !store.get('welcome', true) || Q47.has('nw') || Q47.get('theme')) return;
  welEl = document.createElement('div'); welEl.id = 'welcome'; welEl.setAttribute('data-noswipe', '1');
  welEl.style.cssText = 'position:absolute;inset:0;z-index:4000;background:radial-gradient(ellipse 80% 70% at 50% 30%,#1b2440f2,#07090ef7);display:flex;align-items:center;justify-content:center';
  $('stage').appendChild(welEl);
  welLeft = 20; welKey = ''; welDraw();
  welT = displayEvery725(() => { if (!welEl) return; if (moving()) { welClose(); return; } if (welLeft > 0 && --welLeft === 0) { welClose(); return; } welDraw(); }, 1000);
}
function welAct(v) {
  const [op, a, b] = v.split(':');
  if (op === 'go') { welClose(); return; }
  if (op === 'can') { welClose(); openSet('Véhicule', 'Données CAN'); return; }
  if (op === 'prof') { store.set('profile', +a); welClose(); render(); toast('Bonjour ' + profiles()[+a]); return; }
  if (op === 'open') { welLeft = -1; welDraw(); if (A) A.openSettings(a); else toast('Réglage Android (sur l\'autoradio) : ' + a); }
}
{ const r0 = window.onResumeHome; window.onResumeHome = function () { r0(); if (welEl) welDraw(); }; }

// ================= 5. parcours : enregistrement GPS =================
const TRK_STEP = 0.02;                        // un point tous les 20 m
let trk = null, trkPts = [], trkAnchor = null, trkFast = 0, trkDirty = false, trkSavedAt = 0, trkEngAt = 0;
// dernier signe de vie du trajet : dernier mouvement, ou moteur qui tourne (bouchon, feu, passage à niveau)
const trkAlive = () => (trk ? Math.max(trk.t1, Date.now() - trkEngAt < 15000 ? trkEngAt : 0) : 0);
let trkSel = null, trkEl = null, trkMap = null, trkTiles = null, trkLayer = null, trkShown = '', trkDelArm = 0, trkTileDark = null;
const trkIndex = () => store.get('trkIndex', []);
const trkAuto = () => store.get('trkAuto', true);
const trkStopMs = () => (parseInt(store.get('trkStop', 5), 10) || 5) * 60e3;
// tracé compacté (algorithme « encoded polyline », précision 1 m)
function plEnc(pts) { let out = '', pl = 0, po = 0; const e = (v) => { v = v < 0 ? ~(v << 1) : v << 1; let s = ''; while (v >= 0x20) { s += String.fromCharCode((0x20 | (v & 0x1f)) + 63); v >>= 5; } return s + String.fromCharCode(v + 63); }; for (const [a, b] of pts) { const la = Math.round(a * 1e5), lo = Math.round(b * 1e5); out += e(la - pl) + e(lo - po); pl = la; po = lo; } return out; }
function plDec(str) { const pts = []; let i = 0, la = 0, lo = 0; const d = () => { let r = 0, s = 0, b; do { b = str.charCodeAt(i++) - 63; r |= (b & 0x1f) << s; s += 5; } while (b >= 0x20 && i < str.length); return r & 1 ? ~(r >> 1) : r >> 1; }; while (i < str.length) { la += d(); lo += d(); pts.push([la / 1e5, lo / 1e5]); } return pts; }
const trkKey = (id) => 'a08t_' + id;          // hors sauvegarde des réglages : les tracés restent sur l'appareil
function trkLoad(id) { try { const s = localStorage.getItem(trkKey(id)); return s ? plDec(s) : []; } catch (e) { return []; } }
function trkPlace() { const g = geoA; if (g) { const a = [[g.num, g.road].filter(Boolean).join(' '), g.city].filter(Boolean).join(', '); if (a) return a; } return loc && place && !/Recherche|attente/i.test(place) ? place : ''; }
function trkPersist() {
  if (!trk) { store.set('trkCur', null); return; }
  trk.to = trkPlace() || trk.to; if (!trk.from) trk.from = trk.to;
  store.set('trkCur', Object.assign({}, trk, { pl: plEnc(trkPts) })); trkDirty = false; trkSavedAt = Date.now();
}
function trkStart(pt, manual) {
  trk = { id: Date.now().toString(36), t0: pt.ts, t1: pt.ts, km: 0, mx: 0, from: trkPlace(), to: '', man: !!manual, o0: odoCar47() };
  trkPts = [[pt.lat, pt.lon]]; trkPersist();
  if (tab === 'tracks') { trkSel = 'cur'; render(); }
}
function trkPrune() {
  let idx = trkIndex(); let size = 0; idx.forEach((t) => { size += (localStorage.getItem(trkKey(t.id)) || '').length; });
  while (idx.length > 300 || size > 1500000) { const t = idx.shift(); trkArchive(t); size -= (localStorage.getItem(trkKey(t.id)) || '').length; localStorage.removeItem(trkKey(t.id)); }
  store.set('trkIndex', idx);
}
function trkFinish(boot) {
  if (!trk) return;
  const t = trk, pts = trkPts; trk = null; trkPts = []; trkAnchor = null; trkFast = 0; store.set('trkCur', null);
  if (t.km < 0.3 || pts.length < 3) { if (!boot && t.man) toast('Parcours trop court : pas enregistré'); if (tab === 'tracks') { trkSel = null; render(); } return; }
  if (!boot) t.to = trkPlace() || t.to;
  const rec = { driver733: t.driver733, id: t.id, t0: t.t0, t1: t.t1, km: Math.round(t.km * 100) / 100, mx: Math.round(t.mx), from: t.from || '', to: t.to || '', n: pts.length, mv: Math.round(t.mv || 0), st: t.st || 0, o0: t.o0 || 0, o1: t.o1 || (boot ? 0 : odoCar47()) || 0, pr: t.pr || fuelPrice(), co: t.co || fuelCons() };
  const enc = plEnc(pts);
  for (let k = 0; k < 3; k++) { try { localStorage.setItem(trkKey(t.id), enc); break; } catch (e) { const idx = trkIndex(); for (let j = 0; j < 10 && idx.length; j++) { const o = idx.shift(); trkArchive(o); localStorage.removeItem(trkKey(o.id)); } store.set('trkIndex', idx); } }
  const idx = trkIndex(); idx.push(rec); store.set('trkIndex', idx); trkPrune();
  if (!boot) toast(`Parcours enregistré : ${fr1(rec.km)} km`);
  if (tab === 'tracks') { trkSel = rec.id; render(); }
}
function usableTrackFix(l) {
  return !!l && Number.isFinite(l.lat) && Math.abs(l.lat) <= 90 &&
    Number.isFinite(l.lon) && Math.abs(l.lon) <= 180 && Number.isFinite(l.ts) &&
    (l.acc == null || (Number.isFinite(l.acc) && l.acc <= 60));
}
function trkOnLoc(l) {
  if (!usableTrackFix(l) || (trk && l.ts <= trk.t1)) return;            // position trop imprécise
  const sp = l.spd >= 0 ? l.spd : -1;
  if (!trk) {
    if (!trkAuto()) return;
    if (!trkAnchor) { trkAnchor = { lat: l.lat, lon: l.lon, ts: l.ts }; return; }
    const d0 = hav(trkAnchor.lat, trkAnchor.lon, l.lat, l.lon);
    trkFast = sp >= 8 ? trkFast + 1 : 0;
    const mv = sp < 0 || sp >= 5;                                                // à l'arrêt, le GPS « flotte » : on ne démarre pas pour ça
    if ((d0 > 0.08 && mv) || d0 > 0.3 || (trkFast >= 3 && d0 > 0.02)) trkStart(d0 > 0.5 ? { lat: l.lat, lon: l.lon, ts: l.ts } : trkAnchor, false);   // > 500 m d'un coup : GPS perdu entre-temps, on part d'ici
    else { if (l.ts - trkAnchor.ts > 120000 && d0 < 0.03) trkAnchor = { lat: l.lat, lon: l.lon, ts: l.ts }; return; }
  }
  if (l.ts - trkAlive() > trkStopMs()) { trkFinish(true); trkAnchor = { lat: l.lat, lon: l.lon, ts: l.ts }; trkFast = 0; return; }   // autoradio resté en veille : l'ancien parcours est clos, on ne colle pas deux trajets
  const last = trkPts[trkPts.length - 1], d = hav(last[0], last[1], l.lat, l.lon), dt = (l.ts - trk.t1) / 3600e3;
  if (trk.dr) {                                                                  // GPS revenu (tunnel) : distance déjà comptée avec la vitesse
    if (d > trk.dr && d < 50) trk.km += d - trk.dr;                              // la ligne droite ne peut pas être plus courte que la route
    trkPts.push([l.lat, l.lon]); trk.t1 = l.ts; trk.dr = 0; trkDirty = true; if (sp > trk.mx && sp < 250) trk.mx = sp; return;
  }
  if (d < TRK_STEP) return;
  if (d > 0.3 && dt > 0 && d / dt > 250) return;                                // saut GPS impossible
  trkPts.push([l.lat, l.lon]); trk.km += d; trk.t1 = l.ts; if (sp > trk.mx && sp < 250) trk.mx = sp; trkDirty = true;
  if (l.ts - trkSavedAt > 15000) trkPersist();                                  // sauvegarde ici aussi : en arrière-plan (Waze devant) les minuteries tournent au ralenti
}
{ const ol = window.onLoc; window.onLoc = function (lat, lon, spd, acc, brg, alt) { ol(lat, lon, spd, acc, brg, alt); try { trkOnLoc({ lat, lon, spd, acc, ts: Date.now() }); } catch (e) { /* le suivi ne doit jamais gêner le reste */ } }; }
setInterval(() => { if (!trk) return; if (Date.now() - trkAlive() > trkStopMs()) trkFinish(false); else if (trkDirty && Date.now() - trkSavedAt > 15000) trkPersist(); }, 5000);
document.addEventListener('visibilitychange', () => { if (trk && trkDirty) trkPersist(); });
window.addEventListener('pagehide', () => { if (trk && trkDirty) trkPersist(); });
// au démarrage : on reprend le parcours en cours (arrêt court), sinon on le clôt (contact coupé)
(function () {
  const c = store.get('trkCur', null); if (!c || !c.pl) return;
  trk = Object.assign({ km: 0, mx: 0, from: '', to: '' }, c, { man: !!c.man }); delete trk.pl; trkPts = plDec(c.pl);
  if (!trkPts.length || Date.now() - trk.t1 > trkStopMs()) trkFinish(true);
})();

const dur47 = (ms) => { const m = Math.max(0, Math.round(ms / 60000)); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${pad(m % 60)}`; };
const day47 = (t) => { const d = new Date(t), n = new Date(); const d0 = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime(); if (t >= d0) return 'Aujourd\'hui'; if (t >= new Date(n.getFullYear(), n.getMonth(), n.getDate() - 1).getTime()) return 'Hier'; return `${['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'][d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };
function trkSums() {
  const n = new Date(), d0 = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime(), w0 = new Date(n.getFullYear(), n.getMonth(), n.getDate() - 6).getTime(), m0 = new Date(n.getFullYear(), n.getMonth(), 1).getTime();
  const all = trkIndex().concat(trk ? [trk] : []);
  return [['Aujourd\'hui', d0], ['7 jours', w0], ['Ce mois', m0]].map(([l, s]) => { const f = all.filter((t) => t.t0 >= s); return [l, f.reduce((a, t) => a + kmOf(t), 0), f.length, f.reduce((a, t) => a + costOf(t), 0)]; });
}
function pageTracks(p) {
  if (trkWeeksOn) return trkWeeks(p);
  if (trkFull) { const d = trkDetail(p); if (d) return d; trkFull = false; }
  const idx = trkIndex().slice().reverse();
  if (trkSel === 'cur' && !trk) trkSel = null;
  if (trkSel && trkSel !== 'cur' && !idx.some((t) => t.id === trkSel)) trkSel = null;
  if (!trkSel) trkSel = trk ? 'cur' : (idx[0] ? idx[0].id : null);
  const sel = trkSel === 'cur' ? trk : idx.find((t) => t.id === trkSel);
  const sums = trkSums().map(([l, km, n, eur]) => `<div style="${box(p, 'padding:8px 12px;flex:1;min-width:0')}"><div style="font-size:12px;color:${p.mut}">${l}</div><div style="font-size:22px;font-weight:700;line-height:1.15">${fr1(km)} <span style="font-size:12px;color:${p.mut}">km</span></div><div style="font-size:12px;color:${p.mut};white-space:nowrap">${n} parcours</div>${eur > 0 ? `<div style="font-size:13px;font-weight:700;white-space:nowrap">${eur2(eur)}</div>` : ''}</div>`).join('');
  const item = (t, live) => { const on = trkSel === (live ? 'cur' : t.id);
    return `<button data-act="trk:sel:${live ? 'cur' : t.id}" style="display:block;width:100%;text-align:left;padding:9px 12px;border-radius:12px;margin-bottom:6px;${on ? `background:${p.acc};color:${p.onAcc}` : `background:${p.card2};color:${p.txt}`}">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><b style="font-size:15px">${live ? '<span style="color:#ff4d4d">●</span> En cours' : day47(t.t0)} · ${fmtTime(t.t0)}${live ? '' : ' → ' + fmtTime(t.t1)}</b><b style="font-size:16px;white-space:nowrap">${live ? '<span data-k="trkKm">' + fr1(t.km) + '</span>' : fr1(t.km)} km</b></div>
      <div style="font-size:12.5px;opacity:.8;${ell}">${esc(t.from || 'Départ')} → ${esc(live ? '…' : t.to || 'Arrivée')}</div></button>`; };
  const list = (trk ? item(trk, true) : '') + (idx.length ? idx.map((t) => item(t, false)).join('') : (trk ? '' : `<div style="padding:18px 8px;color:${p.mut};font-size:14px;line-height:1.5">Aucun parcours pour l'instant.<br>${trkAuto() ? `L’enregistrement démarre quand la voiture roule et se termine après ${store.get('trkStop', 5)} min d’arrêt.` : 'Le mode automatique est désactivé. Touche « Démarrer » pour enregistrer ton premier parcours.'}</div>`));
  const stat = (l, v) => `<div><div style="font-size:12px;color:${p.mut}">${l}</div><div style="font-size:22px;font-weight:700;line-height:1.15;white-space:nowrap">${v}</div></div>`;
  let head = `<div style="color:${p.mut};font-size:15px">Choisis un parcours dans la liste.</div>`;
  if (sel) { const live = trkSel === 'cur', ms = (live ? Date.now() : sel.t1) - sel.t0, avg = ms > 60000 ? sel.km / (ms / 3600e3) : 0;
    head = `<div style="display:flex;gap:26px;align-items:flex-end;flex-wrap:wrap">${stat('Distance', `<span ${live ? 'data-k="trkKm"' : ''}>${fr1(sel.km)}</span> km`)}${stat('Durée', `<span ${live ? 'data-k="trkDur"' : ''}>${dur47(ms)}</span>`)}${stat('Moyenne', `${Math.round(avg)} km/h`)}${stat('Vitesse max', `${Math.round(sel.mx || 0)} km/h`)}<span style="flex:1"></span>${live ? chipBtn(p, 'trk:stop', 'Arrêter et enregistrer', true) : chipBtn(p, 'trk:full', 'Détails', true) + chipBtn(p, 'trk:del:' + sel.id, trkDelArm === sel.id ? 'Confirmer ?' : 'Supprimer')}</div>
    <div style="font-size:13.5px;color:${p.mut};${ell}">${day47(sel.t0)} ${fmtDate(sel.t0)} · ${fmtTime(sel.t0)}${live ? '' : ' → ' + fmtTime(sel.t1)} · ${esc(sel.from || 'Départ')} → ${esc(live ? 'en cours…' : sel.to || 'Arrivée')}</div>` + (window.RoadsTaken738 ? `<div class="scroll" style="max-height:118px">${RoadsTaken738.html(sel.id)}</div>` : ''); }
  return pageFrame(p, `<div style="display:grid;grid-template-columns:min(400px,43%) minmax(0,1fr);gap:12px;flex:1;min-height:0">
    <div style="${card(p, 'padding:12px;display:flex;flex-direction:column;gap:10px;min-height:0')}">
      <div style="display:flex;gap:8px">${sums}</div>
      <div style="display:flex;gap:6px 8px;align-items:center;flex-wrap:wrap">${chipBtn(p, 'trk:auto', trkAuto() ? 'Auto : oui' : 'Auto : non', trkAuto())}${trk ? '' : chipBtn(p, 'trk:start', 'Démarrer')}${chipBtn(p, 'trk:weeks', 'Semaines & €', true)}${chipBtn(p, 'trk:stopmin', `Arrêt ${store.get('trkStop', 5)} min`)}</div>
      <div data-k="trkGps" style="font-size:12.5px;color:${p.mut};margin:-4px 2px 0;${ell}"></div>
      <div class="scroll" style="flex:1;min-height:0">${list}</div></div>
    <div style="${card(p, 'padding:12px 16px;display:flex;flex-direction:column;gap:8px;min-height:0')}">${head}
      <div class="trkslot" data-noswipe="1" style="position:relative;flex:1;min-height:0;border-radius:${Math.max(8, p.r - 8)}px;overflow:hidden;background:${p.light ? '#e9e7e2' : '#14171c'}"></div></div></div>`);
}
function trkDraw(p, force) {
  if (!trkMap) return;
  const live = trkSel === 'cur', pts = live ? trkPts : (trkSel ? trkLoad(trkSel) : []);
  const sig = `${trkSel}:${pts.length}:${p.acc}`;
  if (!force && sig === trkShown) return;
  const first = !trkShown.startsWith(trkSel + ':'); trkShown = sig;
  trkLayer.clearLayers();
  if (!pts.length) return;
  L.polyline(pts, { color: '#ffffff', weight: 9, opacity: 0.9 }).addTo(trkLayer);
  L.polyline(pts, { color: /^#[0-9a-f]{6}$/i.test(p.acc) ? p.acc : '#1F6FD1', weight: 5, opacity: 1 }).addTo(trkLayer);
  L.circleMarker(pts[0], { radius: 8, color: '#fff', weight: 3, fillColor: '#2E9E4D', fillOpacity: 1 }).addTo(trkLayer).bindTooltip('Départ');
  L.circleMarker(pts[pts.length - 1], { radius: 8, color: '#fff', weight: 3, fillColor: '#E0312B', fillOpacity: 1 }).addTo(trkLayer).bindTooltip(live ? 'Position' : 'Arrivée');
  if (first || force) { if (pts.length > 1) trkMap.fitBounds(L.latLngBounds(pts), { padding: [34, 34], maxZoom: 16, animate: false }); else trkMap.setView(pts[0], 15, { animate: false }); }
}
function trkAttach(p) {
  const slot = document.querySelector('#screen .trkslot'); if (!slot || !window.L) return;
  if (!trkEl) {
    trkEl = document.createElement('div'); trkEl.style.cssText = 'position:absolute;inset:0;background:transparent'; slot.appendChild(trkEl);
    trkMap = L.map(trkEl, { zoomControl: true, attributionControl: true, zoomSnap: 0.5 }); trkMap.setView([46.6, 2.4], 5);
    trkLayer = L.layerGroup().addTo(trkMap);
  } else slot.appendChild(trkEl);
  const dark = !p.light;
  if (trkTileDark !== dark) { trkTileDark = dark; if (trkTiles) trkTiles.remove();
    trkTiles = L.tileLayer(dark ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}' : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', { maxZoom: dark ? 16 : 18, attribution: '© Esri' }).addTo(trkMap); }
  trkMap.invalidateSize(false); trkDraw(p, true);
  setTimeout(() => { if (trkMap && trkEl.isConnected) { trkMap.invalidateSize(false); trkDraw(p, true); } }, 60);
}
function trkAct(v) {
  const parts = v.split(':'), op = parts[0];
  if (op === 'sel') { if (trkSel === parts[1] && parts[1] !== 'cur') trkFull = true; trkSel = parts[1]; trkDelArm = 0; render(); return; }
  if (op === 'full') { trkFull = true; render(); return; }
  if (op === 'weeks') { trkWeeksOn = true; render(); return; }
  if (op === 'wback') { trkWeeksOn = false; render(); return; }
  if (op === 'price') { store.set('fuelPrice', Math.max(0.6, Math.min(4, Math.round((fuelPrice() + Number(parts[1])) * 1000) / 1000))); render(); return; }
  if (op === 'cons') { store.set('fuelCons', Math.max(2, Math.min(20, Math.round((fuelCons() + Number(parts[1])) * 10) / 10))); store.set('fuelConsAuto', false); render(); return; }
  if (op === 'consauto') { store.set('fuelConsAuto', !store.get('fuelConsAuto', true)); render(); return; }
  if (op === 'back') { trkFull = false; render(); return; }
  if (op === 'zin' || op === 'zout') { if (trkMap) op === 'zin' ? trkMap.zoomIn() : trkMap.zoomOut(); return; }
  if (op === 'fit') { trkDraw(curP || palette(), true); return; }
  if (op === 'mail') { trkMail(parts[1]); return; }
  if (op === 'auto') { store.set('trkAuto', !trkAuto()); toast(trkAuto() ? 'Enregistrement automatique dès que la voiture roule' : 'Enregistrement automatique coupé : utilise « Démarrer »'); render(); return; }
  if (op === 'stopmin') { const o = [3, 5, 10, 15], c = parseInt(store.get('trkStop', 5), 10); store.set('trkStop', o[(o.indexOf(c) + 1) % o.length]); toast(`Le parcours se termine ${store.get('trkStop', 5)} min après l'arrêt`); render(); return; }
  if (op === 'start') { if (!trk) {
    const age = loc ? Date.now() - loc.ts : Infinity;
    if (!usableTrackFix(loc) || age < 0 || age > 10000) { toast('En attente d’une position GPS récente et précise.'); return; }
    trkStart({ lat: loc.lat, lon: loc.lon, ts: loc.ts }, true); toast('Enregistrement du parcours démarré'); } trkSel = 'cur'; render(); return; }
  if (op === 'stop') { if (trk) { trkPersist(); trkFinish(false); } render(); return; }
  if (op === 'del') { const id = parts[1]; if (trkDelArm !== id) { trkDelArm = id; render(); return; } trkDelArm = 0; store.set('trkIndex', trkIndex().filter((t) => t.id !== id)); localStorage.removeItem(trkKey(id)); trkSel = null; toast('Parcours supprimé'); render(); }
}
// onglet « Parcours » dans la barre du haut, juste après « Trajets »
// v7.4 : « Parcours » n'est plus un onglet à part, il est rangé dans « Trajets » (4e choix à côté d'Historique, Graphiques, Éco-conduite)
{ const cat = SETCATS.find(([n]) => n === 'Navigation');
  if (cat) cat[1].push(['Parcours', (p) => `${setRow(p, 'Enregistrer les parcours', 'Le tracé GPS de chaque trajet, du départ à l\'arrivée. Ouvre Trajets, puis Parcours pour le retrouver.', togBtn(p, 'tg:trkAuto:1', trkAuto()))}
    ${setRow(p, 'Fin du parcours', `Un parcours se termine ${store.get('trkStop', 5)} min après l'arrêt de la voiture.`, chipBtn(p, 'trk:stopmin', `${store.get('trkStop', 5)} min`))}
    ${setRow(p, 'Parcours gardés', `${trkIndex().length} sur cet autoradio (300 max, les plus anciens sont effacés). Les tracés ne sont pas dans la sauvegarde des réglages.`, chipBtn(p, 'tab:tracks', 'Ouvrir'))}`]); }

// données de démonstration (navigateur seulement)
if (DEMO && !trkIndex().length && !Q47.has('notrk')) {
  const mk = (id, t0, min, pts) => { let km = 0; for (let i = 1; i < pts.length; i++) km += hav(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]); localStorage.setItem(trkKey(id), plEnc(pts)); return { id, t0, t1: t0 + min * 60000, km: Math.round(km * 100) / 100, mx: 78, n: pts.length }; };
  const line = (a, b, n, wob) => Array.from({ length: n + 1 }, (_, i) => [a[0] + (b[0] - a[0]) * i / n + Math.sin(i / 3) * wob, a[1] + (b[1] - a[1]) * i / n + Math.cos(i / 4) * wob * 1.5]);
  const now = Date.now(), d = 86400000;
  store.set('trkIndex', [
    Object.assign(mk('demo1', now - 2 * d - 9 * 3600e3, 34, line([48.5734, 7.7521], [48.6921, 7.7446], 90, 0.004)), { from: '12 Rue du Rhin, Strasbourg', to: 'Rue du Général Leclerc, Brumath' }),
    Object.assign(mk('demo2', now - d - 5 * 3600e3, 22, line([48.5734, 7.7521], [48.4837, 7.6672], 70, 0.003)), { from: '12 Rue du Rhin, Strasbourg', to: 'Rue de la Gare, Geispolsheim' }),
    Object.assign(mk('demo3', now - 3 * 3600e3, 48, line([48.5734, 7.7521], [48.7420, 7.3615], 140, 0.006)), { from: '12 Rue du Rhin, Strasbourg', to: 'Grand\'Rue, Saverne' })
  ]);
}

// ================= branchements : actions, rendu, valeurs en direct =================
{ const a0 = window.act;
  window.act = function (a, long) {
    if (a.indexOf('wel:') === 0) { welAct(a.slice(4)); return; }
    if (a.indexOf('trk:') === 0) { trkAct(a.slice(4)); return; }
    if (welEl) return;                                   // rien ne passe derrière l'écran de bienvenue
    if (a.indexOf('am:') === 0) { amAct(a.slice(3)); return; }
    if (long && a.indexOf('app:') === 0 && tab === 'home' && !assignFor && palette().layout === 'custom') { amOpen(a.slice(4)); return; }   // appui long sur une appli de « Toutes les applis »
    a0(a, long);
  }; }
{ const r0 = window.render;
  window.render = function () {
    if (trkEl && trkEl.isConnected && trkEl.closest('#screen')) $('mapHold').appendChild(trkEl);   // la carte des parcours survit au changement d'écran
    if (tab !== 'tracks') { r0(); return; }
    const p = palette(); curP = p;
    const st = $('stage'); st.style.background = p.bgCss; st.style.color = p.txt;
    st.style.fontFamily = (p.font === 'Inter' ? 'Inter' : `'${p.font}',Inter`) + ',Roboto,sans-serif';
    $('mapHold').appendChild($('map')); if (window.Car3D) Car3D.detach();
    $('screen').innerHTML = pageTracks(p);
    trkAttach(p); paint();
  }; }
{ const p0 = window.paint;
  window.paint = function () {
    p0();
    const p = curP; if (!p) return;
    if (tab === 'home') {
      const g = geoA || {}; const street = [g.num, g.road].filter(Boolean).join(' ');
      setK('adrStreet', street || (loc ? place : 'GPS en attente…'));
      setK('adrCity', [[g.cp, g.city].filter(Boolean).join(' '), g.quarter && g.quarter !== g.city ? g.quarter : ''].filter(Boolean).join(' · '));
    }
    if (tab === 'home' || tab === 'tracks') {
      const last = trk ? null : trkIndex().slice(-1)[0];
      setK('trkDot', trk ? '●' : '');
      setK('trkState', trk ? `Parcours en cours · départ ${fmtTime(trk.t0)}` : last ? `Dernier parcours · ${day47(last.t0)} ${fmtTime(last.t0)}` : 'Parcours : prêt à enregistrer');
      setK('trkKm', fr1(trk ? trk.km : last ? last.km : 0));
      setK('trkDur', trk ? dur47(Date.now() - trk.t0) : last ? dur47(last.t1 - last.t0) : '');
      setK('trkSub', trk ? (trk.from ? 'De ' + trk.from : 'Touche pour voir la carte') : last ? `${last.from || 'Départ'} → ${last.to || 'Arrivée'}` : 'Démarre tout seul dès que tu roules');
    }
    if (tab === 'tracks') { const fresh = DEMO || (loc && Date.now() - loc.ts < 10000);
      setK('trkGps', fresh ? `GPS reçu · précision ${Math.round(loc.acc)} m${loc.acc > 60 ? ' : trop faible pour enregistrer' : ''}` : loc ? 'GPS : signal perdu' : 'GPS : aucune position reçue (Paramètres → Système → Autorisations)'); }
    if (tab === 'tracks' && trkSel === 'cur' && trk) trkDraw(p, false);
    document.querySelectorAll('#screen [data-act="tab:tracks"]').forEach((tb) => { if (tb.style.height !== '42px') return; const want = trk ? 'Parcours ●' : 'Parcours'; if (tb.textContent !== want) tb.innerHTML = trk ? 'Parcours <span style="color:#ff4d4d">●</span>' : 'Parcours'; });
  }; }

// réveil après une longue veille (contact coupé sans extinction complète) : même écran qu'au lancement
{ let tick = Date.now(); setInterval(() => { const n = Date.now(), gap = n - tick; tick = n; if (gap > 30 * 60000 && !moving()) welShow(); }, 5000); }
document.addEventListener('DOMContentLoaded', () => { if (DEMO && Q47.has('still')) { if (car) car.speed = 0; if (loc) loc.spd = 0; } setTimeout(welShow, 600); });

// ================= 7. appui long sur une appli de la page « toutes les applis » =================
let amEl = null;
function amClose() { if (amEl) { amEl.remove(); amEl = null; } }
function amOpen(pk) {
  if (moving()) { toast('Disponible à l\'arrêt'); return; }
  amClose(); const p = curP || palette(); const nm = (appInfo(pk) || {}).l || pk; const on = fFindApp(fCfg(), pk);
  amEl = document.createElement('div'); amEl.setAttribute('data-noswipe', '1'); amEl.setAttribute('data-act', 'am:x');
  amEl.style.cssText = 'position:absolute;inset:0;z-index:3000;background:#000000b3;display:flex;align-items:center;justify-content:center';
  const b = (act, t, pri) => `<button data-act="${act}" style="height:56px;border-radius:14px;font-size:16px;font-weight:700;${pri ? `background:${p.acc};color:${p.onAcc}` : `background:${p.card2};color:${p.txt}`}">${t}</button>`;
  amEl.innerHTML = `<div data-act="am:noop" style="width:460px;${card(p, 'padding:20px;display:flex;flex-direction:column;gap:10px')}"><div style="font-size:20px;font-weight:700;${ell}">${esc(nm)}</div>
    <div style="font-size:13px;color:${p.mut};margin-top:-4px">${on ? 'Déjà sur ton accueil.' : 'Pas encore sur ton accueil.'}</div>
    ${on ? b('am:edit:' + pk, 'Déplacer / changer la taille', true) : b('am:add:' + pk, 'Ajouter sur l\'accueil', true)}${b('am:open:' + pk, 'Ouvrir')}${b('am:x', 'Annuler')}</div>`;
  $('stage').appendChild(amEl);
}
function amAct(v) {
  const op = v.split(':')[0], pk = v.slice(op.length + 1);
  if (op === 'noop') return;
  amClose();
  if (op === 'open') { if (!A) toast('Ouverture : ' + ((appInfo(pk) || {}).l || pk)); else if (!A.launch(pk)) toast('Appli introuvable (désinstallée ?)'); return; }
  if (op === 'edit') { const f = fFindApp(fCfg(), pk); if (f) { const ff = fFind(fCfg(), f.id); if (ff) homePage = ff.pg; fEnterEdit(f.id); } return; }
  if (op === 'add') { const c = fClone(); const n = { id: nid(), t: 'a', p: pk, w: 1, h: 1 }; const pg = fPlace(c, n, 0); fSave(c); homePage = pg; fEnterEdit(n.id); toast(`Ajoutée en page ${pg + 1} : glisse-la où tu veux`); }
}

// ================= 8. kilomètres en direct même sans GPS : vitesse du boîtier intégrée chaque seconde =================
let km8At = 0;
setInterval(() => {
  const now = Date.now(), dt = km8At ? Math.min(now - km8At, 10000) : 1000; km8At = now;   // temps réellement écoulé (minuteries ralenties quand Waze est devant)
  if (!car || now - car.ts > 3000 || !(car.speed > 2)) return;
  const fresh = loc && now - loc.ts < 4000, gpsTrip = fresh && loc.acc < 80, gpsTrk = fresh && loc.acc <= 60;   // mêmes seuils que le comptage GPS de chaque écran
  if (gpsTrip && (gpsTrk || !trk)) return;                                                                     // le GPS compte déjà tout
  const d = car.speed * dt / 3600e3;                                // km parcourus depuis le dernier passage
  if (!gpsTrip) { if (trip && now - trip.last < 20 * 60e3) { trip.dist += d; trip.last = now; trip.dr = (trip.dr || 0) + d; } else if (typeof tripOnLoc === 'function' && loc) tripOnLoc(Object.assign({}, loc, { acc: 999 })); }
  if (trk && !gpsTrk) { trk.km += d; trk.t1 = now; trk.dr = (trk.dr || 0) + d; trkDirty = true; }
  if (tab === 'home' || tab === 'tracks') paint();
}, 1000);
// retour du GPS après un tunnel : la distance a déjà été comptée avec la vitesse de la voiture → on recolle le tracé sans la recompter
{ const t0 = window.tripOnLoc; window.tripOnLoc = function (l) {
  if (trip && trip.dr && l && l.acc < 80 && Date.now() - trip.last <= 20 * 60e3) { const g = hav(trip.lat, trip.lon, l.lat, l.lon); if (g > trip.dr && g < 2) trip.dist += g - trip.dr; trip.lat = l.lat; trip.lon = l.lon; trip.last = Date.now(); trip.dr = 0; return; }
  return t0.apply(this, arguments); }; }


// ================= 9. gps_container : la VRAIE appli GPS (Waze, Google Maps…) dans le cadre, en fenêtre libre =================
// Lancement par le moteur Java existant : A.launchIn(appli, gauche, haut, droite, bas) = ActivityOptions.setLaunchBounds(Rect)
// + mode fenêtre libre, le tout dans un try/catch côté Java. S'il échoue (firmware qui bloque), repli : appli en plein écran.
// Remplace l'ancienne carte intégrée et la Fenêtre web.
delete GBLOCKS.map; delete GBLOCKS.web; ['map', 'web'].forEach((k) => { const i = FORDER.indexOf(k); if (i >= 0) FORDER.splice(i, 1); });
const gbPk = () => store.get('gbApp', store.get('gpsLast', '') || 'com.waze');
const gbName = (pk) => ((NAVI_PK.find((x) => x[0] === pk) || [])[1] || (allApps().find((a) => a.p === pk) || {}).l || pk);
let gbMenu = false, gbKey = '', gbT = 0, gbFail = false, gbLive = false, gbProbe = 0;
// Mode du cadre : '' = pas encore essayé, 'cadre' = la fenêtre s'ouvre bien dans le cadre, 'plein' = l'autoradio ouvre en plein écran.
// Rien ne s'ouvre tout seul : uniquement quand tu touches le cadre (ou « Ouvrir tout seul » si la fenêtre marche vraiment).
const gbMode = () => store.get('gbMode', '');
GBLOCKS.gpsbox = { n: 'Appli GPS (Waze, Google Maps…)', r: (p) => {
  const pk = gbPk(), nm = gbName(pk), m = gbMode(), b = (act, t, main) => `<button data-act="${act}" style="height:42px;padding:0 14px;border-radius:${Math.max(8, p.r - 6)}px;background:${main ? p.acc : p.card2};color:${main ? p.onAcc : p.txt};font-size:14px;font-weight:700;border:1px solid ${p.mut}33">${t}</button>`;
  const txt = m === 'plein' ? `Ton autoradio ouvre ${esc(nm)} en plein écran : la petite fenêtre n'est pas activée sur ce système. <b data-act="gb:help" style="color:${p.acc};text-decoration:underline">Comment l'activer ?</b>`
    : m === 'cadre' ? `Touche pour ouvrir ${esc(nm)} dans ce cadre · appui long pour déplacer / redimensionner`
    : `Touche pour ouvrir ${esc(nm)} dans ce cadre. Rien ne s'ouvre tout seul.`;
  const btns = m === 'plein' ? b('gb:full', '▶ Ouvrir ' + esc(nm), true) + b('gb:retry', 'Réessayer en petit') + b('gb:menu', 'Changer d\'appli')
    : b('gb:open', '▶ Ouvrir ici', true) + b('gb:full', 'Plein écran') + b('gb:menu', 'Changer d\'appli');
  return `<div class="gpsbox" data-act="gb:tap" style="position:relative;height:100%;overflow:hidden;clip-path:inset(0 round ${p.r}px);${card(p, `background:${p.card2};border:2px solid ${p.acc}55;padding:0`)};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center">
    <span class="fic" style="--ics:60px;background:${hashCol(pk)}">${esc(nm.charAt(0))}<img data-icon="${esc(pk)}" alt=""></span>
    <div style="font-size:18px;font-weight:700">${esc(nm)}</div>
    <div style="font-size:13px;color:${p.mut};max-width:88%;line-height:1.35">${txt}</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:96%">${btns}</div></div>`;
} };
FMIN.gpsbox = [3, 2]; FSZ.gpsbox = [[4, 4], [6, 6], [8, 6]];     // Petit / Carré · Moyen / moitié d'écran · Grand / 2 tiers
FORDER.unshift('gpsbox');
const gbNames = { 4: 'Petit (carré)', 6: 'Moyen (moitié)', 8: 'Grand (2 tiers)' };
{ const fs0 = fSizes; window.fSizes = function (id) { if (id === 'gpsbox') return FSZ.gpsbox.map(([w, h]) => [gbNames[w], w, h]); return fs0(id); }; }
// Rect du cadre à l'écran (pixels physiques). La WebView couvre tout l'écran : position page = position écran, + décalage réglable.
function gbRect(loose) {        // loose : appui direct sur le cadre → pas besoin de vérifier que rien ne le cache
  const el = document.querySelector('#screen .gpsbox'); if (!el || tab !== 'home' || editing || gbMenu) return null;
  const r = el.getBoundingClientRect(); if (r.width < 60 || r.height < 60) return null;
  if (!loose) { const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (!top || !el.contains(top)) return null; }
  const k = window.devicePixelRatio || 1, dy = store.get('gbOffY', 0);
  return [Math.round(r.left * k), Math.round(r.top * k + dy), Math.round(r.right * k), Math.round(r.bottom * k + dy)];
}
function gbLaunch(force, why, loose) {
  const r = gbRect(loose); if (!r) return; const key = gbPk() + '|' + r.join(',');
  if (!force && (key === gbKey || Date.now() - gbT < 1500)) return;
  gbKey = key; gbT = Date.now(); const pk = gbPk();
  if (!A) { toast(`Aperçu : ${gbName(pk)} s'ouvrirait dans le cadre [${r.join(', ')}]`); return; }
  if (gbMode() === 'plein') { gbFull(); return; }                               // pas de petite fenêtre sur cet autoradio : plein écran direct
  let ok = false, err = ''; try { ok = !!(A.launchIn && A.launchIn(pk, r[0], r[1], r[2], r[3])); } catch (e) { ok = false; err = String(e && e.message || e); }
  dlogAdd('cadre', `ouverture dans le cadre (${why || 'appui sur le cadre'}) : ${pk} [${r.join(',')}] → ${A.launchIn ? (ok ? 'acceptée' : 'refusée') : 'fonction launchIn absente'}${err ? ' (' + err + ')' : ''}`);
  if (!ok) { store.set('gbMode', 'plein'); gbFail = true; gbFull(); return; }
  gbLive = true; gbLastWhy = why || 'appui sur le cadre'; const t = gbProbe = Date.now();
  // Si l'appli s'est mise en plein écran, notre écran passe derrière : la page devient « cachée » juste après le lancement.
  setTimeout(() => { if (gbProbe === t) { gbProbe = 0; if (!document.hidden) { let ch = false;
    if (gbMode() !== 'cadre') { store.set('gbMode', 'cadre'); dlogAdd('cadre', 'résultat : l\'accueil est resté visible 5 s → petite fenêtre OK'); ch = true; }
    if (gbFlipClear(gbLastWhy)) ch = true;                                       // v7.3 : de nouveau dans le cadre → plus d'alerte
    if (ch && tab === 'home') render(); } } }, 5000);
}
function gbFull() { const pk = gbPk(); try { if (!A) { toast('Aperçu : ' + gbName(pk) + ' en plein écran'); return; } const ok = A.launch(pk); dlogAdd('cadre', `ouverture plein écran : ${pk} → ${ok ? 'OK' : 'appli introuvable'}`); if (!ok) toast('Appli introuvable : ' + gbName(pk)); } catch (e) { dlogAdd('cadre', 'ouverture plein écran impossible : ' + (e && e.message || e)); toast('Impossible d\'ouvrir ' + gbName(pk)); } }
let gbActAt = 0, gbActName = '', gbHidAt = 0, gbRedockAt = 0, gbRedockOff = 0, gbLastWhy = '';
document.addEventListener('visibilitychange', () => {
  const now = Date.now();
  if (document.hidden) {
    const byUser = now - gbActAt < 2500 && gbActName.indexOf('gb:') !== 0;          // tu as ouvert autre chose (radio, téléphone, applis…)
    if (gbProbe && now - gbProbe < 5000) {
      const dt = now - gbProbe; gbProbe = 0;
      if (gbMode() !== 'cadre') { dlogAdd('cadre', `résultat : l'accueil est passé derrière après ${dt} ms → ouvert en plein écran`); gbLive = false; store.set('gbMode', 'plein'); return; }   // 1er essai : l'autoradio refuse la petite fenêtre
      if (byUser) { gbHidAt = now; dlogAdd('cadre', `accueil caché après ton appui (${gbActName})`); return; }
      // la petite fenêtre a déjà marché : ce n'est pas l'autoradio qui la refuse, on ne repasse pas en « plein écran ».
      // v7.3 : cause la plus probable = le GPS était déjà ouvert en grand ; Android le ramène tel quel. On le note,
      // on ne le relance plus tout seul (sinon il rebondit en grand à chaque retour) et le cadre explique quoi faire.
      dlogAdd('cadre', `le GPS est passé en plein écran ${dt} ms après l'ouverture dans le cadre (${gbLastWhy || 'appui'}) : sans doute déjà ouvert en grand`);
      gbFlipAdd(dt, gbLastWhy); gbLive = false; gbHidAt = 0;
      if (now - gbRedockAt < 4000) { gbRedockOff = now; dlogAdd('cadre', 'remise automatique dans le cadre arrêtée jusqu\'à la prochaine ouverture réussie'); }
      return;
    }
    if (gbLive) { gbHidAt = now; dlogAdd('cadre', byUser ? `accueil caché après ton appui (${gbActName})` : 'accueil caché sans appui de ta part : le GPS (ou une autre appli, ou le système) est passé devant tout seul'); }
  } else if (tab === 'home') { try { render(); } catch (e) { /* rien */ } if (gbHidAt) gbRedock('retour sur l\'accueil'); }
});
// Une fenêtre ouverte par toi dans le cadre suit le cadre si tu le déplaces ou changes sa taille. Jamais d'ouverture automatique ici,
// ni en revenant à l'accueil (c'est ce qui rouvrait Waze en plein écran à chaque retour).
let gbFollowUntil = 0; // compatibilité du choix d'application ; suivi confié à Frame710.
// Ouverture toute seule au démarrage : seulement si tu l'as activée ET si la petite fenêtre marche vraiment sur ton autoradio.
{ let tries = 0; const go = () => { if (!store.get('gbAuto', false) || gbMode() !== 'cadre') return;
  if (gbFlip()) { dlogAdd('cadre', 'pas d\'ouverture au démarrage : la dernière ouverture est passée en plein écran'); return; }   // v7.3
  if (document.hidden || welEl || brfEl || brfWant || editing) { if (++tries < 40) setTimeout(go, 2000); return; }   // d'abord la bienvenue et le point au démarrage
  gbLaunch(true, 'ouverture au démarrage'); }; setTimeout(go, 3000); }
function gbMenuEl() {
  const p = curP || palette(), cur = gbPk();
  const list = (ffApps('navi').length ? ffApps('navi') : NAVI_PK.slice(0, 2)).concat(allApps().filter((a) => !NAVI_PK.some((n) => n[0] === a.p)).map((a) => [a.p, a.l]));
  const el = document.createElement('div'); el.setAttribute('data-act', 'gb:menux'); el.setAttribute('data-noswipe', '1');
  el.style.cssText = 'position:absolute;inset:0;z-index:3000;background:#000000a6;display:flex;align-items:center;justify-content:center';
  el.innerHTML = `<div data-act="gb:noop" style="width:620px;max-height:600px;display:flex;flex-direction:column;gap:8px;${card(p, 'padding:18px')}"><div style="font-size:20px;font-weight:700;color:${p.txt}">Appli affichée dans le cadre GPS</div>
    <div style="overflow:auto;display:flex;flex-direction:column;gap:6px">${list.map(([pk, l], i) => `${i === Math.min(list.length, ffApps('navi').length || 2) ? `<div style="font-size:13px;color:${p.mut};margin:6px 2px 0">Autres applis</div>` : ''}<button data-act="gb:pick:${esc(pk)}" style="display:flex;align-items:center;gap:12px;min-height:54px;padding:6px 12px;border-radius:12px;background:${p.card2};color:${p.txt};font-size:16px;font-weight:600;${pk === cur ? `outline:3px solid ${p.acc}` : ''}"><span class="fic" style="--ics:36px;background:${hashCol(pk)}">${esc(l.charAt(0))}<img data-icon="${esc(pk)}" alt=""></span>${esc(l)}<span style="margin-left:auto">${pk === cur ? '✓' : ''}</span></button>`).join('')}</div>
    <button data-act="gb:menux" style="height:48px;border-radius:12px;background:${p.acc};color:${p.onAcc};font-size:16px;font-weight:700">Fermer</button></div>`;
  return el;
}
let gbMenuNode = null;
function gbAct(v, long) {
  if (v === 'noop') return;
  if (v === 'tap' || v === 'open') { if (long) return; gbKey = ''; if (gbMode() === 'plein') { gbFull(); return; }
    if (gbRect(true)) { gbLaunch(true, 'appui sur le cadre', true); return; }
    if (!gbOpenHere('appui sur le cadre')) gbFull(); return; }              // v7.3 : plus jamais de plein écran « par défaut » quand le cadre est là
  if (v === 'kill') { gbKill(); return; }
  if (v === 'full') { gbFull(); return; }
  if (v === 'retry') { store.set('gbMode', ''); gbFail = false; gbKey = ''; render(); setTimeout(() => gbLaunch(true), 300); return; }
  if (v === 'help') { openSet('Navigation', 'Petite fenêtre GPS'); return; }
  if (v.indexOf('mode:') === 0) { store.set('gbMode', v.slice(5) === 'auto' ? '' : v.slice(5)); render(); return; }
  if (v === 'auto') { store.set('gbAuto', !store.get('gbAuto', false)); render(); return; }
  if (v === 'redock') { store.set('gbRedock', !store.get('gbRedock', true)); render(); return; }
  if (v === 'menu') { gbMenu = true; if (gbMenuNode) gbMenuNode.remove(); gbMenuNode = gbMenuEl(); $('stage').appendChild(gbMenuNode); try { gbMenuNode.querySelectorAll('img[data-icon]').forEach((im) => { const u = A && A.icon ? A.icon(im.dataset.icon) : ''; if (u) im.src = u; else im.style.visibility = 'hidden'; }); } catch (e) { /* icônes */ } return; }
  if (v === 'menux') { gbMenu = false; if (gbMenuNode) { gbMenuNode.remove(); gbMenuNode = null; } gbKey = ''; return; }
  if (v.indexOf('pick:') === 0) { store.set('gbApp', v.slice(5)); store.set('gpsLast', v.slice(5)); gbFail = false; gbAct('menux'); render(); gbFollowUntil = 0; if (gbLive && gbMode() === 'cadre') setTimeout(() => gbLaunch(true, 'nouvelle appli choisie'), 400); return; }
  if (v.indexOf('off:') === 0) { store.set('gbOffY', store.get('gbOffY', 0) + Number(v.slice(4))); gbKey = ''; render(); return; }
}
{ const a1 = window.act; window.act = function (a, long) { if (a.indexOf('gb:') === 0) { gbAct(a.slice(3), long); return; }
  if (a === 'dock:gps' && !long) { gbKey = ''; if (gbOpenHere('icône GPS')) return;    // v7.3 : même en mode modification ou depuis une autre page → dans le cadre
    dlogAdd('cadre', `icône GPS : ${gbMode() === 'plein' ? 'mode plein écran' : 'pas de cadre GPS sur l\'accueil'} → plein écran`); }
  return a1.apply(this, arguments); }; }
// réglages : Navigation → Cadre GPS
SETCATS.forEach((c) => { if (c[0] === 'Navigation') c[1].unshift(['Cadre GPS', (p) => { const m = gbMode(); return `<div class="colns" style="display:flex;flex-direction:column;gap:10px;max-width:900px">
  ${setRow(p, 'Appli dans le cadre', esc(gbName(gbPk())), chipBtn(p, 'gb:menu', 'Changer'))}
  ${setRow(p, 'Ouverture', m === 'plein' ? 'Ton autoradio a ouvert l\'appli en plein écran : la petite fenêtre n\'y est pas activée. Le cadre ouvre donc l\'appli en grand.' : m === 'cadre' ? 'La petite fenêtre marche sur ton autoradio.' : 'Pas encore essayé : touche le cadre sur l\'accueil.', `<span style="display:flex;gap:6px;flex-wrap:wrap">${chipBtn(p, 'gb:mode:cadre', 'Dans le cadre', m === 'cadre')}${chipBtn(p, 'gb:mode:plein', 'Plein écran', m === 'plein')}${chipBtn(p, 'gb:mode:auto', 'Détecter', m === '')}</span>`)}
  ${setRow(p, 'Ouvrir tout seul au démarrage', m === 'cadre' ? 'Désactivé par défaut. Seulement dans le cadre, jamais en plein écran.' : 'Possible seulement quand la petite fenêtre marche.', chipBtn(p, 'gb:auto', store.get('gbAuto', false) ? 'Oui' : 'Non', store.get('gbAuto', false) && m === 'cadre'))}
  ${setRow(p, 'Décalage vertical', `Si la fenêtre GPS est trop haute ou trop basse par rapport au cadre (barre d'état de l'autoradio) : ${store.get('gbOffY', 0)} px`, chipBtn(p, 'gb:off:-20', '▲ 20 px') + chipBtn(p, 'gb:off:20', '▼ 20 px'))}
  ${setRow(p, 'Activer la petite fenêtre', 'Assistant pas à pas : mode développeur, fenêtres libres, redémarrage, test.', chipBtn(p, 'fw:open', 'Ouvrir l\'assistant', true))}
  <div style="font-size:13px;color:${p.mut}">Déplacer / redimensionner le cadre : appui long dessus, puis glisser (coin pour la taille, ou Petit / Moyen / Grand).</div></div>`; }]); });
// migration : l'ancienne carte (et la fenêtre web) deviennent le cadre GPS ; l'ancien module d'encastrement est tenu au silence
if (!store.get('v52gb', false)) {
  [0, 1, 2].forEach((i) => ['home_v2_', 'home_bak_'].forEach((k) => { const c = store.get(k + i, null); if (c && c.pages) { c.pages.forEach((pg) => pg.forEach((it) => { if (it.t === 'w' && it.b) it.b = it.b.map((b) => (b === 'map' || b === 'web' ? 'gpsbox' : b)); })); store.set(k + i, c); } }));
  store.set('gpsFrame', false); store.set('v52gb', true);
}

// ================= 10. vitesse : jamais bloquée à « -- » =================
// Le boîtier peut envoyer des trames sans vitesse (ou 0 alors qu'on roule) : on prend alors celle du GPS (précision jusqu'à 80 m).
window.curSpeed = function () {
  const now = Date.now(), cs = car && now - car.ts < 5000 && car.speed >= 0 ? car.speed : null, gs = loc && now - loc.ts < 5000 && loc.spd >= 0 && (loc.acc == null || loc.acc < 80) ? loc.spd : null;
  if (cs != null && (cs > 0 || gs == null || gs < 5)) return { v: cs, src: 'voiture' };
  if (gs != null) return { v: gs, src: 'GPS' };
  return cs != null ? { v: cs, src: 'voiture' } : null;
};

// ================= 11. parcours : démarrage auto quand le moteur démarre, temps en mouvement, arrêts =================
let trkRun = 0, trkMvT = 0, trkStopped = true;
{ const oc = window.onCar; window.onCar = function (o) { oc.apply(this, arguments); try {
  const run = (o.rpm > 400) || (o.speed >= 5);
  trkRun = run ? trkRun + 1 : 0;
  if (o.rpm > 400) trkEngAt = Date.now();
  if (trk && o.odo > 0 && o.odo < 2e6) { const od = Math.round(o.odo * 10) / 10; if (!trk.o0) trk.o0 = od; if (od >= trk.o0) trk.o1 = od; }
  if (!trk && trkAuto() && trkRun >= 3 && loc && Date.now() - loc.ts < 30000) trkStart({ lat: loc.lat, lon: loc.lon, ts: Date.now() }, false);
} catch (e) { /* le suivi ne doit jamais casser l'affichage */ } }; }
setInterval(() => {
  const now = Date.now(); if (!trk) { trkMvT = now; trkStopped = true; return; }
  const s = curSpeed(), dt = trkMvT ? Math.min(now - trkMvT, 5000) : 0; trkMvT = now;
  if (s && s.v >= 3) { trk.mv = (trk.mv || 0) + dt; if (trkStopped && trk.mv > 30000) trkStopped = false; }
  else if (!trkStopped && s && s.v < 1) { trk.st = (trk.st || 0) + 1; trkStopped = true; }
}, 1000);

// ================= 12. détails d'un parcours (grande carte, zoom, envoi par mail) =================
let trkFull = false;
function trkInfo(t) {
  const ms = t.t1 - t.t0, mv = t.mv > 0 ? Math.min(t.mv, ms) : 0;
  return { ms, mv, stop: mv ? ms - mv : 0, avg: ms > 60000 ? t.km / (ms / 3600e3) : 0, avgMv: mv > 60000 ? t.km / (mv / 3600e3) : 0 };
}
function trkDetail(p) {
  const t = trkIndex().find((x) => x.id === trkSel); if (!t) return null;
  const i = trkInfo(t), cell = (l, v) => `<div style="${box(p, 'padding:8px 12px')}"><div style="font-size:12px;color:${p.mut}">${l}</div><div style="font-size:20px;font-weight:700;line-height:1.2;${ell}">${v}</div></div>`;
  const zb = (a, t2) => `<button data-act="trk:${a}" style="width:52px;height:52px;border-radius:14px;background:${p.card};color:${p.txt};font-size:26px;font-weight:700;box-shadow:0 2px 10px #0006">${t2}</button>`;
  return pageFrame(p, `<div style="display:grid;grid-template-columns:min(380px,43%) minmax(0,1fr);gap:12px;flex:1;min-height:0">
    <div style="${card(p, 'padding:12px;display:flex;flex-direction:column;gap:8px;min-height:0')}">
      <div style="display:flex;gap:8px">${chipBtn(p, 'trk:back', '‹ Retour')}<span style="flex:1"></span>${chipBtn(p, 'trk:mail:' + t.id, 'Envoyer par mail', true)}</div>
      <div style="font-size:15px;font-weight:700">${day47(t.t0)} ${fmtDate(t.t0)}</div>
      <div style="font-size:13.5px;line-height:1.45"><span style="color:#2E9E4D">●</span> ${fmtTime(t.t0)} · ${esc(t.from || 'Départ')}<br><span style="color:#E0312B">●</span> ${fmtTime(t.t1)} · ${esc(t.to || 'Arrivée')}</div>
      <div class="scroll" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;align-content:start;min-height:0">
        ${cell('Distance', fr1(t.km) + ' km')}${cell('Durée totale', dur47(i.ms))}
        ${cell('En mouvement', i.mv ? dur47(i.mv) : '—')}${cell('À l\'arrêt', i.mv ? dur47(i.stop) : '—')}
        ${cell('Moyenne', Math.round(i.avg) + ' km/h')}${cell('Moy. en roulant', i.avgMv ? Math.round(i.avgMv) + ' km/h' : '—')}
        ${cell('Vitesse max', Math.round(t.mx || 0) + ' km/h')}${cell('Arrêts', t.st != null && i.mv ? String(t.st) : '—')}
        ${cell('Compteur départ', t.o0 ? fmtKm(t.o0) : '—')}${cell('Compteur arrivée', t.o1 ? fmtKm(t.o1) : '—')}
        ${cell('Carburant estimé', fr1(litOf(t)) + ' L')}${cell('Coût', eur2(costOf(t)))}
      </div>
      <div style="display:flex;gap:8px">${chipBtn(p, 'trk:del:' + t.id, trkDelArm === t.id ? 'Confirmer la suppression ?' : 'Supprimer')}</div></div>
    <div style="${card(p, 'padding:0;position:relative;min-height:0;overflow:hidden')}">
      <div class="trkslot" data-noswipe="1" style="position:absolute;inset:0;background:${p.light ? '#e9e7e2' : '#14171c'}"></div>
      <div style="position:absolute;right:12px;top:12px;z-index:900;display:flex;flex-direction:column;gap:8px">${zb('zin', '+')}${zb('zout', '−')}${zb('fit', '⤢')}</div></div></div>`);
}
function trkMail(id) {
  const t = trkIndex().find((x) => x.id === id); if (!t) return;
  const i = trkInfo(t), pts = trkLoad(id), n = pts.length, step = Math.max(1, Math.floor((n - 1) / 8));
  const way = []; for (let k = 0; k < n; k += step) way.push(pts[k]); if (n && way[way.length - 1] !== pts[n - 1]) way.push(pts[n - 1]);
  const link = 'https://www.google.com/maps/dir/' + way.slice(0, 10).map((q) => q[0].toFixed(5) + ',' + q[1].toFixed(5)).join('/');
  const subj = `Parcours du ${fmtDate(t.t0)} : ${fr1(t.km)} km`;
  const body = [`Parcours : ${day47(t.t0)} ${fmtDate(t.t0)}`, '', `Départ : ${fmtTime(t.t0)} - ${t.from || '?'}`, `Arrivée : ${fmtTime(t.t1)} - ${t.to || '?'}`, '',
    `Distance : ${fr1(t.km)} km`, `Durée totale : ${dur47(i.ms)}`, i.mv ? `En mouvement : ${dur47(i.mv)} (arrêts : ${dur47(i.stop)})` : '', `Vitesse moyenne : ${Math.round(i.avg)} km/h`, `Vitesse max : ${Math.round(t.mx || 0)} km/h`, t.o0 ? `Compteur : ${fmtKm(t.o0)} → ${t.o1 ? fmtKm(t.o1) : '?'}` : '', `Carburant estimé : ${fr1(litOf(t))} L, soit ${eur2(costOf(t))}`, '',
    `Voir le trajet sur la carte : ${link}`, '', 'Envoyé depuis Accueil 2008 GT'].filter((x) => x !== '').join('\n').replace(/\n(?=Distance|Voir|Envoyé)/g, '\n\n');
  const url = `mailto:?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
  window.__lastMail = url;
  if (A && A.openUrl) { try { if (A.openUrl(url) !== false) return; } catch (e) { /* repli */ } }
  if (!A) { toast('Aperçu : la messagerie s\'ouvrirait avec le parcours'); return; }
  toast('Aucune appli de messagerie (Gmail…) installée sur l\'autoradio');
}
{ const ta = window.act; window.act = function (a) { if (a.indexOf('tab:') === 0 && a !== 'tab:tracks') trkFull = false; return ta.apply(this, arguments); }; }

// ================= 13. 100 thèmes de plus (50 à 149) =================
if (!THEMES.some((t) => t.id === '50')) THEMES.push(
  P('50', "Peugeot Sport", 'classic', {"bg": "#0B0B0D", "acc": "#00A3E0", "r": 22, "font": "Rajdhani", "dock": "glass", "grad": ["#0B0B0D", "#2A2D33", 150]}),
  P('51', "Rouge Ultimate II", 'split', {"bg": "#3A0006", "acc": "#FFFFFF", "r": 18, "font": "Rajdhani", "dock": "glass", "grad": ["#2A0004", "#B3001B", 140]}),
  P('52', "Bleu Vertigo", 'minimal', {"bg": "#0A1F5C", "acc": "#FFD24D", "r": 26, "font": "Inter", "dock": "glass", "grad": ["#06153F", "#2A5BD7", 135]}),
  P('53', "Gris Artense", 'floating', {"bg": "#2C2F33", "acc": "#E0312B", "r": 14, "font": "Rajdhani", "dock": "color"}),
  P('54', "Blanc Banquise", 'cockpit', {"bg": "#EEF1F4", "acc": "#1F6FD1", "r": 24, "font": "Space Grotesk", "dock": "soft", "light": true, "mbg": "#1E1F24"}),
  P('55', "Noir Perla", 'bento', {"bg": "#050506", "acc": "#C9C9CF", "r": 12, "font": "Inter", "dock": "color"}),
  P('56', "Orange Fusion", 'carcenter', {"bg": "#2A1205", "acc": "#FFE0B8", "r": 22, "font": "Inter", "dock": "glass", "grad": ["#1E0C03", "#E8650A", 140]}),
  P('57', "Vert Olivine", 'speedhud', {"bg": "#1C2414", "acc": "#B5C93A", "r": 18, "font": "Space Grotesk", "dock": "mono"}),
  P('58', "Gris Platinium II", 'gauges', {"bg": "#DADDE2", "acc": "#33435E", "r": 26, "font": "Inter", "dock": "soft", "light": true, "mbg": "#1E1F24"}),
  P('59', "Bleu Célèbes", 'sidebar', {"bg": "#0B2E4F", "acc": "#7FD3FF", "r": 14, "font": "Inter", "dock": "glass", "grad": ["#082238", "#1A5C8F", 150]}),
  P('60', "Paris la nuit", 'musicfocus', {"bg": "#0B0E1E", "acc": "#F2C14E", "r": 24, "font": "Space Grotesk", "dock": "glass", "grad": ["#070914", "#2B2F6B", 150]}),
  P('61', "Nantes", 'stack', {"bg": "#0F2A2A", "acc": "#FFD166", "r": 12, "font": "Inter", "dock": "glass", "grad": ["#0A1F1F", "#1F6F6A", 140]}),
  P('62', "Saint-Nazaire", 'dashboard', {"bg": "#0B1E33", "acc": "#FF6B4A", "r": 22, "font": "Inter", "dock": "glass", "grad": ["#081626", "#1E5A8C", 160]}),
  P('63', "Marseille", 'carstatus', {"bg": "#06305A", "acc": "#FFFFFF", "r": 18, "font": "Space Grotesk", "dock": "glass", "grad": ["#04203D", "#1B7FC4", 150]}),
  Object.assign(P('64', "Lyon", 'origin', {"bg": "#2B0F12", "acc": "#F4C95D", "r": 26, "font": "Inter", "dock": "glass", "grad": ["#1E0A0C", "#7A1E28", 140]}), { streaks: true }),
  P('65', "Monaco", 'classic', {"bg": "#120F05", "acc": "#F2D06B", "r": 14, "font": "Playfair Display", "dock": "gold", "grad": ["#0C0A03", "#6E5714", 140]}),
  P('66', "Tokyo", 'split', {"bg": "#12061E", "acc": "#FF3D9A", "r": 24, "font": "Space Grotesk", "dock": "glass", "grad": ["#0C0414", "#5B1A8C", 135]}),
  P('67', "New York", 'minimal', {"bg": "#141414", "acc": "#FFC300", "r": 12, "font": "Inter", "dock": "glass", "grad": ["#0E0E0E", "#3A3A3A", 160]}),
  P('68', "Dubaï", 'floating', {"bg": "#2A1C07", "acc": "#FFF1C9", "r": 22, "font": "Playfair Display", "dock": "gold", "grad": ["#1C1204", "#B9852A", 150]}),
  P('69', "Tunis", 'cockpit', {"bg": "#F3EEE4", "acc": "#1A6FB0", "r": 18, "font": "Space Grotesk", "dock": "soft", "light": true, "mbg": "#1E1F24"}),
  P('70', "Forêt Noire", 'bento', {"bg": "#07140C", "acc": "#9BE15D", "r": 26, "font": "Inter", "dock": "glass", "grad": ["#040C07", "#1B4D2E", 150]}),
  P('71', "Océan Atlantique", 'carcenter', {"bg": "#03223A", "acc": "#7FE7FF", "r": 14, "font": "Inter", "dock": "glass", "grad": ["#021828", "#0B6E99", 160]}),
  P('72', "Désert", 'speedhud', {"bg": "#E8D7B9", "acc": "#B0581B", "r": 24, "font": "Space Grotesk", "dock": "soft", "light": true, "mbg": "#1E1F24"}),
  P('73', "Volcan", 'gauges', {"bg": "#1A0503", "acc": "#FF8A3D", "r": 12, "font": "Inter", "dock": "glass", "grad": ["#0F0302", "#8E1B0A", 150]}),
  P('74', "Glacier", 'sidebar', {"bg": "#E3F1F8", "acc": "#0F7DB8", "r": 22, "font": "Inter", "dock": "soft", "light": true, "mbg": "#1E1F24"}),
  P('75', "Aurore boréale", 'musicfocus', {"bg": "#04121C", "acc": "#7CFFB2", "r": 18, "font": "Space Grotesk", "dock": "glass", "grad": ["#020A12", "#0F6B5C", 140]}),
  P('76', "Coucher de soleil", 'stack', {"bg": "#3A1212", "acc": "#FFE08A", "r": 26, "font": "Inter", "dock": "glass", "grad": ["#2B0D1F", "#E8642F", 150]}),
  P('77', "Lavande Provence", 'dashboard', {"bg": "#E9E3F4", "acc": "#6A4FC2", "r": 14, "font": "Inter", "dock": "soft", "light": true, "mbg": "#1E1F24"}),
  P('78', "Prairie", 'carstatus', {"bg": "#EAF2DF", "acc": "#3B7D1E", "r": 24, "font": "Space Grotesk", "dock": "soft", "light": true, "mbg": "#1E1F24"}),
  Object.assign(P('79', "Nuit d'orage", 'origin', {"bg": "#0D1117", "acc": "#8AB4F8", "r": 12, "font": "Inter", "dock": "glass", "grad": ["#090C11", "#2E3A4F", 160]}), { streaks: true }),
  P('80', "Lagon bleu", 'classic', {"bg": "#00334D", "acc": "#FFFFFF", "r": 22, "font": "Inter", "dock": "glass", "grad": ["#002233", "#00A3B4", 150]}),
  P('81', "Sable fin", 'split', {"bg": "#F2EADB", "acc": "#9C6B2F", "r": 18, "font": "Space Grotesk", "dock": "soft", "light": true, "mbg": "#1E1F24"}),
  P('82', "Brume", 'minimal', {"bg": "#D9DEE3", "acc": "#4A5A70", "r": 26, "font": "Inter", "dock": "soft", "light": true, "mbg": "#1E1F24"}),
  P('83', "Cerisier", 'floating', {"bg": "#F7E6EC", "acc": "#C2185B", "r": 14, "font": "Inter", "dock": "soft", "light": true, "mbg": "#1E1F24"}),
  P('84', "Automne", 'cockpit', {"bg": "#2A1608", "acc": "#FFC46B", "r": 24, "font": "Space Grotesk", "dock": "glass", "grad": ["#1C0E05", "#9A4A12", 150]}),
  P('85', "Cyberpunk", 'bento', {"bg": "#0A0014", "acc": "#00F0FF", "r": 12, "font": "Orbitron", "dock": "outline", "grad": ["#07000F", "#3B0A6B", 140]}),
  P('86', "Néon Rose", 'carcenter', {"bg": "#10000C", "acc": "#FF2BD6", "r": 22, "font": "Orbitron", "dock": "outline"}),
  P('87', "Néon Bleu", 'speedhud', {"bg": "#00060F", "acc": "#2DD4FF", "r": 18, "font": "Orbitron", "dock": "outline"}),
  P('88', "Arcade", 'gauges', {"bg": "#0B0420", "acc": "#FFEA00", "r": 26, "font": "Orbitron", "dock": "outline", "grad": ["#07021A", "#2A1170", 150]}),
  P('89', "Matrix", 'sidebar', {"bg": "#000A02", "acc": "#00FF41", "r": 14, "font": "Orbitron", "dock": "outline"}),
  P('90', "Laser Rouge", 'musicfocus', {"bg": "#0A0000", "acc": "#FF1E1E", "r": 24, "font": "Rajdhani", "dock": "mono"}),
  P('91', "Synthwave II", 'stack', {"bg": "#1B0730", "acc": "#FF9E3D", "r": 12, "font": "Inter", "dock": "glass", "grad": ["#12041F", "#7A1E6B", 150]}),
  P('92', "Plasma", 'dashboard', {"bg": "#09001A", "acc": "#FF5CF4", "r": 22, "font": "Orbitron", "dock": "outline", "grad": ["#060012", "#4B00A8", 140]}),
  P('93', "Hologramme", 'carstatus', {"bg": "#04121A", "acc": "#B7FFF8", "r": 18, "font": "Orbitron", "dock": "outline", "grad": ["#020B10", "#106B7A", 150]}),
  Object.assign(P('94', "Tron", 'origin', {"bg": "#00080C", "acc": "#24E1FF", "r": 26, "font": "Orbitron", "dock": "outline"}), { streaks: true }),
  P('95', "Or noir", 'classic', {"bg": "#0A0806", "acc": "#D4AF37", "r": 14, "font": "Playfair Display", "dock": "gold"}),
  P('96', "Champagne", 'split', {"bg": "#F4EDE1", "acc": "#A67C2E", "r": 24, "font": "Playfair Display", "dock": "soft", "light": true, "mbg": "#1E1F24"}),
  P('97', "Velours bordeaux", 'minimal', {"bg": "#24060D", "acc": "#E8C77A", "r": 12, "font": "Playfair Display", "dock": "gold", "grad": ["#180409", "#5E0F22", 150]}),
  P('98', "Ébène", 'floating', {"bg": "#0E0A08", "acc": "#C48A5A", "r": 22, "font": "Playfair Display", "dock": "gold"}),
  P('99', "Marbre", 'cockpit', {"bg": "#EDEDEB", "acc": "#2B2B2B", "r": 18, "font": "Playfair Display", "dock": "soft", "light": true, "mbg": "#1E1F24"}),
  P('100', "Saphir", 'bento', {"bg": "#05123A", "acc": "#E5E9F5", "r": 26, "font": "Playfair Display", "dock": "gold", "grad": ["#030C28", "#163C9E", 140]}),
  P('101', "Rubis", 'carcenter', {"bg": "#2A0310", "acc": "#FFD6E0", "r": 14, "font": "Playfair Display", "dock": "gold", "grad": ["#1C020B", "#9E0C35", 145]}),
  P('102', "Émeraude II", 'speedhud', {"bg": "#03201A", "acc": "#E8D28A", "r": 24, "font": "Playfair Display", "dock": "gold", "grad": ["#021510", "#0C6B4E", 150]}),
  P('103', "Améthyste", 'gauges', {"bg": "#1A0A2E", "acc": "#E7D4FF", "r": 12, "font": "Playfair Display", "dock": "gold", "grad": ["#110620", "#5A2A9E", 140]}),
  P('104', "Perle", 'sidebar', {"bg": "#F6F4F0", "acc": "#6E6A63", "r": 22, "font": "Playfair Display", "dock": "soft", "light": true, "mbg": "#1E1F24"}),
  P('105', "Ardoise", 'musicfocus', {"bg": "#1C2128", "acc": "#58A6FF", "r": 18, "font": "Space Grotesk", "dock": "mono"}),
  P('106', "Papier", 'stack', {"bg": "#FAFAF7", "acc": "#222222", "r": 26, "font": "Inter", "dock": "soft", "light": true, "mbg": "#1E1F24"}),
  P('107', "Graphite", 'dashboard', {"bg": "#16181B", "acc": "#F2F2F2", "r": 14, "font": "Inter", "dock": "color"}),
  P('108', "Béton", 'carstatus', {"bg": "#C9C9C6", "acc": "#2F2F2F", "r": 24, "font": "Space Grotesk", "dock": "soft", "light": true, "mbg": "#1E1F24"}),
  Object.assign(P('109', "Bleu nuit", 'origin', {"bg": "#0B1220", "acc": "#4F8CFF", "r": 12, "font": "Inter", "dock": "color"}), { streaks: true }),
  P('110', "Gris acier", 'classic', {"bg": "#2A3038", "acc": "#FFB000", "r": 22, "font": "Inter", "dock": "glass", "grad": ["#1E2329", "#4A5563", 150]}),
  P('111', "Menthe douce", 'split', {"bg": "#E3F4EE", "acc": "#138A62", "r": 18, "font": "Space Grotesk", "dock": "soft", "light": true, "mbg": "#1E1F24"}),
  P('112', "Pêche", 'minimal', {"bg": "#FCE9DF", "acc": "#D9542B", "r": 26, "font": "Inter", "dock": "soft", "light": true, "mbg": "#1E1F24"}),
  P('113', "Ciel clair", 'floating', {"bg": "#E6F0FB", "acc": "#1659B5", "r": 14, "font": "Inter", "dock": "soft", "light": true, "mbg": "#1E1F24"}),
  P('114', "Encre", 'cockpit', {"bg": "#0A0F1A", "acc": "#E4E7EE", "r": 24, "font": "Space Grotesk", "dock": "mono"}),
  P('115', "Années 80", 'bento', {"bg": "#200B33", "acc": "#36F1CD", "r": 12, "font": "Orbitron", "dock": "outline", "grad": ["#150722", "#B4256B", 140]}),
  P('116', "Années 70", 'carcenter', {"bg": "#3A2210", "acc": "#FFE3A3", "r": 22, "font": "Inter", "dock": "glass", "grad": ["#2A180B", "#B8661C", 150]}),
  P('117', "Rallye", 'speedhud', {"bg": "#0E2246", "acc": "#FFC400", "r": 18, "font": "Rajdhani", "dock": "glass", "grad": ["#0A1A36", "#0F4CA8", 140]}),
  P('118', "Le Mans", 'gauges', {"bg": "#081A10", "acc": "#F2E3B3", "r": 26, "font": "Rajdhani", "dock": "glass", "grad": ["#05120B", "#11512C", 150]}),
  P('119', "Vintage crème", 'sidebar', {"bg": "#EFE6D2", "acc": "#7A3B1F", "r": 14, "font": "Playfair Display", "dock": "soft", "light": true, "mbg": "#1E1F24"}),
  P('120', "Cuir fauve", 'musicfocus', {"bg": "#2B1A0E", "acc": "#F0C987", "r": 24, "font": "Playfair Display", "dock": "gold", "grad": ["#1E1209", "#6E4220", 150]}),
  P('121', "Bois noble", 'stack', {"bg": "#24170D", "acc": "#E2A15A", "r": 12, "font": "Playfair Display", "dock": "gold"}),
  P('122', "Chrome", 'dashboard', {"bg": "#2E3236", "acc": "#FFFFFF", "r": 22, "font": "Rajdhani", "dock": "glass", "grad": ["#1E2124", "#6B7279", 160]}),
  P('123', "Turbo jaune", 'carstatus', {"bg": "#121212", "acc": "#FFD400", "r": 18, "font": "Rajdhani", "dock": "mono"}),
  Object.assign(P('124', "Racing vert", 'origin', {"bg": "#062417", "acc": "#F2F2F2", "r": 26, "font": "Rajdhani", "dock": "color"}), { streaks: true }),
  P('125', "Hiver", 'classic', {"bg": "#0C1A2B", "acc": "#CFE8FF", "r": 14, "font": "Inter", "dock": "glass", "grad": ["#08121F", "#2A4E78", 160]}),
  P('126', "Printemps", 'split', {"bg": "#EEF6E8", "acc": "#4C9A2A", "r": 24, "font": "Space Grotesk", "dock": "soft", "light": true, "mbg": "#1E1F24"}),
  P('127', "Été", 'minimal', {"bg": "#FFF4E0", "acc": "#E86A0C", "r": 12, "font": "Inter", "dock": "soft", "light": true, "mbg": "#1E1F24"}),
  P('128', "Noël", 'floating', {"bg": "#0B2014", "acc": "#F5D76E", "r": 22, "font": "Inter", "dock": "glass", "grad": ["#071509", "#7A1010", 140]}),
  P('129', "Halloween", 'cockpit', {"bg": "#140A02", "acc": "#FF8C1A", "r": 18, "font": "Space Grotesk", "dock": "glass", "grad": ["#0C0601", "#5A2A05", 150]}),
  P('130', "Ramadan", 'bento', {"bg": "#071A2B", "acc": "#E9C46A", "r": 26, "font": "Inter", "dock": "glass", "grad": ["#04111D", "#16466E", 150]}),
  P('131', "Aïd", 'carcenter', {"bg": "#0A2A1E", "acc": "#F2D27A", "r": 14, "font": "Inter", "dock": "glass", "grad": ["#061C14", "#0F6B4B", 150]}),
  P('132', "Saint-Valentin", 'speedhud', {"bg": "#2A0611", "acc": "#FFC2D1", "r": 24, "font": "Space Grotesk", "dock": "glass", "grad": ["#1C040B", "#A3133B", 145]}),
  P('133', "Nuit étoilée II", 'gauges', {"bg": "#060918", "acc": "#FFF3B0", "r": 12, "font": "Inter", "dock": "glass", "grad": ["#03050F", "#1C2660", 150]}),
  P('134', "Aube", 'sidebar', {"bg": "#F8E7DF", "acc": "#C2410C", "r": 22, "font": "Inter", "dock": "soft", "light": true, "mbg": "#1E1F24"}),
  P('135', "Rouge pur", 'musicfocus', {"bg": "#200404", "acc": "#FF2A1F", "r": 18, "font": "Space Grotesk", "dock": "mono"}),
  P('136', "Bleu pur", 'stack', {"bg": "#020B24", "acc": "#2F7FE0", "r": 26, "font": "Inter", "dock": "color"}),
  P('137', "Vert pur", 'dashboard', {"bg": "#021A08", "acc": "#2ECC40", "r": 14, "font": "Inter", "dock": "color"}),
  P('138', "Jaune pur", 'carstatus', {"bg": "#141100", "acc": "#FFDC00", "r": 24, "font": "Space Grotesk", "dock": "mono"}),
  Object.assign(P('139', "Violet pur", 'origin', {"bg": "#11021F", "acc": "#B10DC9", "r": 12, "font": "Inter", "dock": "color"}), { streaks: true }),
  P('140', "Orange pur", 'classic', {"bg": "#1C0A00", "acc": "#FF851B", "r": 22, "font": "Inter", "dock": "color"}),
  P('141', "Rose pur", 'split', {"bg": "#1F0412", "acc": "#FF4FA0", "r": 18, "font": "Space Grotesk", "dock": "mono"}),
  P('142', "Turquoise", 'minimal', {"bg": "#00191A", "acc": "#1ED9D0", "r": 26, "font": "Inter", "dock": "color"}),
  P('143', "Corail", 'floating', {"bg": "#2A0F0A", "acc": "#FFD1C2", "r": 14, "font": "Inter", "dock": "glass", "grad": ["#1C0A06", "#B3412E", 150]}),
  P('144', "Indigo", 'cockpit', {"bg": "#0A0626", "acc": "#A9B4FF", "r": 24, "font": "Space Grotesk", "dock": "glass", "grad": ["#06041A", "#2E2390", 145]}),
  P('145', "Bronze", 'bento', {"bg": "#1E1206", "acc": "#CD7F32", "r": 12, "font": "Playfair Display", "dock": "gold"}),
  P('146', "Pistache", 'carcenter', {"bg": "#EEF5E1", "acc": "#6B8E23", "r": 22, "font": "Inter", "dock": "soft", "light": true, "mbg": "#1E1F24"}),
  P('147', "Cobalt", 'speedhud', {"bg": "#001A4D", "acc": "#9EC9FF", "r": 18, "font": "Space Grotesk", "dock": "glass", "grad": ["#00113A", "#0047AB", 145]}),
  P('148', "Magenta", 'gauges', {"bg": "#1F0019", "acc": "#FF00A8", "r": 26, "font": "Inter", "dock": "color"}),
  P('149', "Kaki II", 'sidebar', {"bg": "#1E2416", "acc": "#C8B560", "r": 14, "font": "Inter", "dock": "color"})
);

// ================= 14. kilométrage voiture, semaines et argent dépensé en carburant =================
let trkWeeksOn = false;
function odoCar47() { return car && Date.now() - car.ts < 60000 && car.odo > 0 && car.odo < 2e6 ? Math.round(car.odo * 10) / 10 : 0; }
const fmtKm = (v) => Math.round(v).toLocaleString('fr-FR') + ' km';
const eur2 = (v) => v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
function fuelPrice() { const s = Number(store.get('fuelPrice', 0)); if (s > 0.5) return s; if (typeof station !== 'undefined' && station && station.price > 0.5 && station.price < 4) return station.price; return 1.80; }
function fuelCons() {   // L/100 km : celle de l'ordinateur de bord si dispo (mode auto), sinon celle que tu as réglée
  if (store.get('fuelConsAuto', true) && car && car.avg1 > 2 && car.avg1 < 25) return Math.round(car.avg1 * 10) / 10;
  return Number(store.get('fuelCons', 6.0)) || 6.0;
}
// distance : le compteur de la voiture s'il est cohérent, sinon le GPS
function kmOf(t) {
  const d = t.o1 > 0 && t.o0 > 0 ? t.o1 - t.o0 : -1, coarse = Number.isInteger(t.o0) && Number.isInteger(t.o1);
  if (d < 0 || (coarse && t.km < 20)) return t.km;                     // compteur au km près : le GPS est plus juste sur un petit trajet
  return d <= t.km * 1.6 + 3 && d >= t.km * 0.6 - 1 ? d : t.km;
}
const litOf = (t) => kmOf(t) * (t.co || fuelCons()) / 100;
const costOf = (t) => litOf(t) * (t.pr || fuelPrice());
function weekStart(ts) { const d = new Date(ts); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); }
function trkWeeks(p) {
  const all = trkIndex().concat(trk ? [trk] : []), map = {};
  all.forEach((t) => { const w = weekStart(t.t0); (map[w] = map[w] || { n: 0, km: 0, l: 0, e: 0 }); const m = map[w]; m.n++; m.km += kmOf(t); m.l += litOf(t); m.e += costOf(t); });
  trkArchDays().forEach(([ts, a]) => { const w = weekStart(ts); (map[w] = map[w] || { n: 0, km: 0, l: 0, e: 0 }); const m = map[w]; m.n += a[1]; m.km += a[0]; m.l += a[4] || 0; m.e += a[2]; });   // parcours effacés pour faire de la place
  const weeks = Object.keys(map).map(Number).sort((a, b) => b - a).slice(0, 26), cur = weekStart(Date.now()), d2 = (ts) => new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  const row = (w) => { const m = map[w]; return `<div style="display:grid;grid-template-columns:1.6fr .7fr 1fr .9fr 1fr;gap:8px;align-items:center;padding:10px 12px;border-radius:12px;margin-bottom:6px;background:${w === cur ? p.acc : p.card2};color:${w === cur ? p.onAcc : p.txt}">
    <b style="font-size:15px">${w === cur ? 'Cette semaine' : 'Semaine du ' + d2(w)}<span style="font-weight:400;font-size:12px;opacity:.8"> · ${d2(w)} → ${d2(w + 6 * 86400000)}</span></b>
    <span style="font-size:14px">${m.n} trajet${m.n > 1 ? 's' : ''}</span><b style="font-size:18px">${fr1(m.km)} km</b><span style="font-size:14px">${fr1(m.l)} L</span><b style="font-size:18px;text-align:right">${eur2(m.e)}</b></div>`; };
  const chg = (a, t) => chipBtn(p, a, t);
  const tot = weeks.reduce((a, w) => a + map[w].e, 0);
  return pageFrame(p, `<div style="display:grid;grid-template-columns:400px minmax(0,1fr);gap:12px;flex:1;min-height:0">
    <div style="${card(p, 'padding:14px;display:flex;flex-direction:column;gap:12px;min-height:0')}">
      <div>${chipBtn(p, 'trk:wback', '‹ Retour aux parcours')}</div>
      <div style="${box(p, 'padding:10px 12px')}"><div style="font-size:13px;color:${p.mut}">Prix de l'essence (que tu as payé)</div>
        <div style="font-size:30px;font-weight:700;margin:2px 0 6px">${fuelPrice().toLocaleString('fr-FR', { minimumFractionDigits: 3 })} €/L</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">${chg('trk:price:-0.1', '−0,10')}${chg('trk:price:-0.01', '−0,01')}${chg('trk:price:0.01', '+0,01')}${chg('trk:price:0.1', '+0,10')}</div></div>
      <div style="${box(p, 'padding:10px 12px')}"><div style="font-size:13px;color:${p.mut}">Consommation (L/100 km)</div>
        <div style="font-size:30px;font-weight:700;margin:2px 0 6px">${fr1(fuelCons())} L</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">${chipBtn(p, 'trk:consauto', store.get('fuelConsAuto', true) ? 'Auto (ordinateur de bord)' : 'Manuelle', store.get('fuelConsAuto', true))}${chg('trk:cons:-0.5', '−0,5')}${chg('trk:cons:-0.1', '−0,1')}${chg('trk:cons:0.1', '+0,1')}${chg('trk:cons:0.5', '+0,5')}</div></div>
      <div style="font-size:12.5px;color:${p.mut};line-height:1.45">Chaque trajet garde le prix et la conso du moment où il a été fait. Le coût est une estimation (km × conso × prix). Distance : compteur de la voiture quand il est reçu, sinon le GPS.</div></div>
    <div style="${card(p, 'padding:12px 16px;display:flex;flex-direction:column;gap:8px;min-height:0')}">
      <div style="display:flex;align-items:baseline;gap:12px"><div style="font-size:20px;font-weight:700">Par semaine</div><span style="flex:1"></span><span style="font-size:14px;color:${p.mut}">Total affiché : <b style="color:${p.txt}">${eur2(tot)}</b></span></div>
      <div style="display:grid;grid-template-columns:1.6fr .7fr 1fr .9fr 1fr;gap:8px;padding:0 12px;font-size:12px;color:${p.mut}"><span>Semaine</span><span>Trajets</span><span>Distance</span><span>Carburant</span><span style="text-align:right">Coût</span></div>
      <div class="scroll" style="flex:1;min-height:0">${weeks.length ? weeks.map(row).join('') : `<div style="padding:16px;color:${p.mut}">Aucun trajet pour l'instant.</div>`}</div></div></div>`);
}
{ const ta2 = window.act; window.act = function (a) { if (a.indexOf('tab:') === 0) trkWeeksOn = false; return ta2.apply(this, arguments); }; }

// ================= 15. alerte de vitesse : limitation de la route (OpenStreetMap) + bip si on la dépasse =================
// La limite vient de la carte OpenStreetMap à ta position GPS (Internet nécessaire). Waze / Maps ne partagent pas la leur.
const SPA = { on: () => store.get('spdAlert', true), snd: () => store.get('spdSound', true), tol: () => parseInt(store.get('tol', 3), 10) || 0 };   // même marge que l'ancien réglage, pour que couleur et bip soient d'accord
let spdCtx = null, spdLast = 0, spdOver = false;
// v7.6 : 8 sons au choix
const SPD_SNDS = [['bip', 'Bip'], ['double', 'Double bip'], ['carillon', 'Carillon'], ['radar', 'Radar'], ['doux', 'Doux'], ['alarme', 'Alarme'], ['gong', 'Gong'], ['klaxon', 'Klaxon']];
function spdTone(f, t, d, type, vol, f2) {
  const o = spdCtx.createOscillator(), g = spdCtx.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  const av = Math.max(0.0002, (vol || 0.6) * (Number(store.get('alVol_' + profIdx(), 70)) / 70));   // v7.9 : volume des alertes du profil
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.min(1.4, av), t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(spdCtx.destination); o.start(t); o.stop(t + d + 0.02);
}
function spdPlay(kind) {
  try {
    if (!spdCtx) spdCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (spdCtx.state === 'suspended') spdCtx.resume();
    const t = spdCtx.currentTime;
    switch (kind || store.get('spdSnd', 'bip')) {
      case 'double': spdTone(1320, t, 0.12); spdTone(1320, t + 0.16, 0.12); break;
      case 'carillon': spdTone(1047, t, 0.5, 'triangle'); spdTone(1319, t + 0.18, 0.5, 'triangle'); spdTone(1568, t + 0.36, 0.7, 'triangle'); break;
      case 'radar': for (let k = 0; k < 5; k++) spdTone(2000, t + k * 0.11, 0.07, 'square', 0.25); break;
      case 'doux': spdTone(660, t, 0.35, 'sine', 0.4); spdTone(880, t + 0.25, 0.45, 'sine', 0.4); break;
      case 'alarme': for (let k = 0; k < 3; k++) spdTone(700, t + k * 0.3, 0.28, 'sawtooth', 0.25, 1400); break;
      case 'gong': spdTone(196, t, 1.6, 'sine', 0.8); spdTone(392, t, 1.2, 'sine', 0.3); spdTone(588, t, 0.8, 'sine', 0.15); break;
      case 'klaxon': spdTone(415, t, 0.35, 'square', 0.22); spdTone(523, t, 0.35, 'square', 0.18); break;
      default: for (let k = 0; k < 3; k++) spdTone(1320, t + k * 0.28, 0.2);
    }
  } catch (e) { /* pas de son possible */ }
}
function spdBeep(n) {
  try {
    if (!spdCtx) spdCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (spdCtx.state === 'suspended') spdCtx.resume();
    const t0 = spdCtx.currentTime;
    for (let k = 0; k < (n || 2); k++) {
      const o = spdCtx.createOscillator(), g = spdCtx.createGain(); o.type = 'sine'; o.frequency.value = 1320;
      g.gain.setValueAtTime(0.0001, t0 + k * 0.28); g.gain.exponentialRampToValueAtTime(0.6, t0 + k * 0.28 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + k * 0.28 + 0.2);
      o.connect(g); g.connect(spdCtx.destination); o.start(t0 + k * 0.28); o.stop(t0 + k * 0.28 + 0.22);
    }
  } catch (e) { /* pas de son possible */ }
}
// le son doit être « débloqué » par un premier appui sur l'écran (règle d'Android pour les pages)
document.addEventListener('pointerdown', () => { try { if (!spdCtx) spdCtx = new (window.AudioContext || window.webkitAudioContext)(); if (spdCtx.state === 'suspended') spdCtx.resume(); } catch (e) { /* rien */ } }, { once: false, passive: true });
setInterval(() => {
  const s = curSpeed(), v = s ? s.v : 0, lim = typeof limit === 'number' ? limit : 0;
  const over = SPA.on() && lim > 0 && v > lim + SPA.tol();
  if (!SPA.on()) document.querySelectorAll('#screen [data-show="limit"]').forEach((e) => { e.style.display = 'none'; });
    document.querySelectorAll('#screen [data-show="limit"]').forEach((e) => { e.style.boxShadow = over ? '0 0 0 4px #FF4D4D, 0 0 16px #FF4D4D' : ''; });
  if (over && SPA.snd()) { const now = Date.now();   // v7.6 : un seul bip au début du dépassement (20 s mini entre deux, pour ne pas sonner si on oscille autour de la limite)
    if ((!spdOver && now - spdLast > 20000) || (store.get('spdRemind', false) && now - spdLast > 15000)) { spdPlay(); spdLast = now; } }
  spdOver = over;
}, 1000);
function spdAct(v) {
  if (v === 'on') store.set('spdAlert', !SPA.on());
  else if (v === 'snd') store.set('spdSound', !SPA.snd());
  else if (v === 'tol') { const o = [0, 3, 5, 10], c = SPA.tol(); store.set('tol', o[(o.indexOf(c) + 1) % o.length]); }
  else if (v === 'test') { spdPlay(); toast('Son de test : ' + (SPD_SNDS.find((x) => x[0] === store.get('spdSnd', 'bip')) || SPD_SNDS[0])[1]); return; }
  else if (v === 'rem') store.set('spdRemind', !store.get('spdRemind', false));
  else if (v.indexOf('s=') === 0) { store.set('spdSnd', v.slice(2)); spdPlay(v.slice(2)); }
  render();
}
{ const a1 = window.act; window.act = function (a, long) { if (a.indexOf('spd:') === 0) { spdAct(a.slice(4)); return; } return a1.apply(this, arguments); }; }
{ const cat = SETCATS.find(([n]) => n === 'Navigation');
  if (cat) cat[1].unshift(['Alerte de vitesse', (p) => `<div style="display:flex;flex-direction:column;gap:10px;max-width:680px">
    ${setRow(p, 'Panneau de limitation', 'Affiche la limitation de la route où tu roules (carte OpenStreetMap, Internet nécessaire). La vitesse passe en rouge si tu dépasses.', chipBtn(p, 'spd:on', SPA.on() ? 'Activé' : 'Désactivé', SPA.on()))}
    ${setRow(p, 'Son', 'Un bip quand tu commences à dépasser la limitation.', chipBtn(p, 'spd:snd', SPA.snd() ? 'Activé' : 'Désactivé', SPA.snd()) + chipBtn(p, 'spd:test', 'Tester'))}
    ${setRow(p, 'Choix du son', 'Touche un son : il est joué et choisi.', '<div style="display:flex;flex-wrap:wrap;gap:6px;max-width:420px">' + SPD_SNDS.map(([k, n]) => chipBtn(p, 'spd:s=' + k, n, store.get('spdSnd', 'bip') === k)).join('') + '</div>')}
    ${setRow(p, 'Rappel', 'Re-sonner toutes les 15 s tant que tu dépasses (désactivé = un seul bip).', chipBtn(p, 'spd:rem', store.get('spdRemind', false) ? 'Activé' : 'Désactivé', store.get('spdRemind', false)))}
    ${setRow(p, 'Marge', `Le bip sonne au-dessus de la limite + ${SPA.tol()} km/h (ex. 50 → bip à partir de ${50 + SPA.tol() + 1} km/h).`, chipBtn(p, 'spd:tol', '+' + SPA.tol() + ' km/h'))}</div>`]); }

// ================= 16. décor de la route : autoroute / ville / campagne =================
// Type de route lu dans OpenStreetMap (même requête que la limitation) ; sans Internet, selon la vitesse.
let roadHw = '', roadHwAt = 0, sceneCur = 'ville', sceneAt = 0, limitOkAt = 0, limitOkPos = null;
window.maybeLimit = async function () {
  if (!loc || limitBusy || DEMO) return;
  const mv = (curSpeed() || {}).v > 5;
  if (limitPos && Date.now() - limitAt < (mv ? 8000 : 60000)) return;
  limitBusy = true; limitAt = Date.now(); limitPos = { lat: loc.lat, lon: loc.lon };
  try {
    const q = `[out:json][timeout:8];way(around:20,${loc.lat.toFixed(5)},${loc.lon.toFixed(5)})[highway~"^(motorway|motorway_link|trunk|trunk_link|primary|secondary|tertiary|unclassified|residential|living_street|service|road|primary_link|secondary_link)$"];out tags 6;`;
    const els = (await getJSON('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(q))).elements || [];
    const vals = els.map((e) => parseMax(e.tags && e.tags.maxspeed)).filter((x) => x);
    limit = vals.length ? vals[0] : null; limitOkAt = Date.now(); limitOkPos = { lat: loc.lat, lon: loc.lon };
    if (els.length) {   // v7.5 : en roulant, on garde la route la plus « grosse » trouvée à 20 m (sinon une bretelle ou une rue voisine passait devant l'autoroute)
      const rank = (t) => (/^(A|M)\s?\d/.test(t.ref || '') ? 0 : ({ motorway: 0, trunk: 1, motorway_link: 2, trunk_link: 2, primary: 3, secondary: 4 })[t.highway] ?? 5);
      const best = (curSpeed() || {}).v > 45 ? els.slice().sort((a, b) => rank(a.tags) - rank(b.tags))[0] : els[0];
      const hw = /^(A|M)\s?\d/.test(best.tags.ref || '') ? 'motorway' : best.tags.highway;
      if (hw !== roadHw) dlogAdd('route', `route lue sur la carte : ${hw}${best.tags.ref ? ' (' + best.tags.ref + ')' : ''}${best.tags.maxspeed ? ', ' + best.tags.maxspeed + ' km/h' : ''}`);
      roadHw = hw; roadHwAt = Date.now(); window.__panelGreen = !/^motorway/.test(best.tags.highway || '');   // v7.6 : vert sur voie rapide (même avec un n° M/A), bleu sur vraie autoroute
      const lb = parseMax(best.tags.maxspeed); if (lb) limit = lb;
    }
  } catch (e) { /* pas de réseau */ }
  limitBusy = false;
};
// une limitation trop ancienne (réseau coupé) ou lue trop loin d'ici n'est plus la bonne : on l'efface
setInterval(() => { if (DEMO || limit == null) return; const far = loc && limitOkPos && hav(limitOkPos.lat, limitOkPos.lon, loc.lat, loc.lon) > 0.4;
  const mv = (curSpeed() || {}).v > 5;   // en roulant la limite est relue toutes les 8 s : 30 s sans réponse = plus fiable ; à l'arrêt, 2 min
  if (Date.now() - limitOkAt > (mv ? 30000 : 120000) || far) { limit = null; if (tab === 'home') paint(); } }, 3000);
function sceneWanted() {
  const v = (curSpeed() || {}).v || 0, fresh = Date.now() - roadHwAt < 120000;
  if (store.get('roadScene', 'auto') !== 'auto') return store.get('roadScene', 'auto');
  if (fresh) {
    if (/^(motorway|trunk)/.test(roadHw)) return 'autoroute';
    if (/^(residential|living_street|service|road)$/.test(roadHw) || (limit && limit <= 50)) return 'ville';
    if (limit && limit >= 110) return 'autoroute';
    return 'campagne';
  }
  return v > 90 ? 'autoroute' : v < 55 ? 'ville' : 'campagne';
}
window.roadScene = function () {
  const w = sceneWanted(), now = Date.now();
  if (w !== sceneCur && now - sceneAt > 10000) { dlogAdd('route', `décor : ${w} (carte : ${roadHw || '—'}${Date.now() - roadHwAt < 120000 ? '' : ', pas à jour'}, limite ${limit || '—'}, ${Math.round((curSpeed() || {}).v || 0)} km/h)`); sceneCur = w; sceneAt = now; }   // pas de clignotement : au moins 10 s par décor
  return sceneCur;
};
{ const a1 = window.act; window.act = function (a, long) { if (a.indexOf('scene:') === 0) { store.set('roadScene', a.slice(6)); sceneAt = 0; render(); return; } return a1.apply(this, arguments); }; }
{ const cat = SETCATS.find(([n]) => n === 'Navigation');
  if (cat) cat[1].push(['Décor de la route', (p) => `<div style="display:flex;flex-direction:column;gap:10px;max-width:680px"><div style="font-size:14px;color:${p.mut}">Décor du widget route + voiture 3D. En automatique : autoroute, ville, village, forêt ou campagne selon l'endroit où tu roules (OpenStreetMap), ou selon ta vitesse sans Internet.</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">${[['auto', 'Automatique'], ['autoroute', 'Autoroute'], ['ville', 'Ville'], ['village', 'Village'], ['foret', 'Forêt'], ['campagne', 'Campagne']].map(([k, l]) => chipBtn(p, 'scene:' + k, l, store.get('roadScene', 'auto') === k)).join('')}</div></div>`]); }

// ================= 17. ville / village, vigilance météo, tonnerre =================
{ const st = document.createElement('style'); st.textContent = '[data-roadbox][data-wx="brouillard"] [data-k="speed"],[data-roadbox][data-wx="brouillard"] [data-k="wTemp"],[data-roadbox][data-wx="brouillard"] [data-k="cityName"],[data-roadbox][data-wx="brouillard"] .sp47{color:#1c2a4a!important;text-shadow:0 1px 0 #ffffff99!important}'; document.head.appendChild(st); }
let geo47 = { city: '', dept: '', at: 0, pos: null }, vig = null, vigAt = 0, vigBeeped = '';
async function geoUpdate() {
  if (!loc || DEMO) return; const now = Date.now();
  if (geo47.pos && now - geo47.at < 300000 && hav(geo47.pos.lat, geo47.pos.lon, loc.lat, loc.lon) < 2) return;
  geo47.at = now; geo47.pos = { lat: loc.lat, lon: loc.lon };
  try { const a = (await getJSON(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${loc.lat.toFixed(4)}&lon=${loc.lon.toFixed(4)}&zoom=12&accept-language=fr`)).address || {}, d0 = geo47.dept;
    geo47.city = a.city || a.town || a.village || a.municipality || a.hamlet || ''; geo47.dept = a.county || a.state_district || ''; geo47.cc = (a.country_code || '').toLowerCase();
    if (geo47.dept !== d0) vigAt = 0; } catch (e) { /* pas de réseau */ }   // vigilance relue seulement si on change de département (le flux est lourd en 4G)
}
const norm47 = (x) => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');
const VIG_T = [[/thunder|orage/, 'Orages'], [/wind|vent/, 'Vent violent'], [/snow|ice|neige/, 'Neige-verglas'], [/fog|brouillard/, 'Brouillard'], [/high.?temp|heat|canicule/, 'Canicule'], [/low.?temp|cold|froid/, 'Grand froid'], [/coast|wave|submersion/, 'Vagues-submersion'], [/forest|fire|feu/, 'Feux de forêt'], [/avalanch/, 'Avalanches'], [/flood|crue|inond/, 'Crues'], [/rain|pluie/, 'Pluie-inondation']];
async function vigUpdate() {
  if (DEMO || !geo47.dept || Date.now() - vigAt < 900000) return; vigAt = Date.now();
  try {
    const r = await http('https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-france/'); if (!r.ok) return;
    vig = vigParse(r.b, geo47.dept);
  } catch (e) { /* flux indisponible : on garde l'état précédent */ }
}
function vigParse(txt, dept) {
    const xml = new DOMParser().parseFromString(txt, 'application/xml'), now = Date.now(), dep = norm47(dept); let best = null;
    const T = (e, n) => { const x = e.getElementsByTagNameNS('*', n)[0]; return x ? x.textContent.trim() : ''; };
    for (const e of xml.getElementsByTagNameNS('*', 'entry')) {
      if (norm47(T(e, 'areaDesc')) !== dep) continue;
      const sev = T(e, 'severity'), lvl = sev === 'Extreme' ? 2 : sev === 'Severe' ? 1 : 0; if (!lvl) continue;
      const on = Date.parse(T(e, 'onset') || T(e, 'effective')) || 0, ex = Date.parse(T(e, 'expires')) || 0; if ((on && on > now) || (ex && ex < now)) continue;
      const ev = T(e, 'event').toLowerCase(), typ = (VIG_T.find(([re]) => re.test(ev)) || [0, 'Météo'])[1];
      if (!best || lvl > best.lvl) best = { lvl, typ, ex }; else if (lvl === best.lvl && best.typ.indexOf(typ) < 0) best.typ += ', ' + typ;
    }
    return best;
}
displayEvery725(() => { geoUpdate(); vigUpdate(); if (vig && vig.ex && vig.ex < Date.now()) vig = null;
  setK('cityName', DEMO ? 'Strasbourg' : geo47.city);
  const v = DEMO && Q47.has('vig') ? { lvl: Q47.get('vig') === 'rouge' ? 2 : 1, typ: 'Orages' } : (store.get('vigOn', true) ? vig : null);
  document.querySelectorAll('#screen [data-show="vig"]').forEach((e) => { e.style.display = v ? 'inline-flex' : 'none'; if (v) e.style.background = v.lvl === 2 ? '#D7191C' : '#F28C00'; });
  if (v) { setK('vigTxt', `Vigilance ${v.lvl === 2 ? 'rouge' : 'orange'} · ${v.typ}`); const key = v.lvl + v.typ; if (key !== vigBeeped) { vigBeeped = key; const once = key + '|' + (v.ex || ''); if (store.get('vigBeep', '') !== once) { store.set('vigBeep', once); if (store.get('vigSound', true) && typeof spdBeep === 'function') spdBeep(v.lvl === 2 ? 5 : 2); } } } else vigBeeped = '';
}, 3000);
// tonnerre : grondement synthétisé (bruit filtré), un peu après l'éclair
window.thunderSound = function (delay) {
  if (!store.get('thunder', true) || document.hidden) return;
  try {
    if (!spdCtx) spdCtx = new (window.AudioContext || window.webkitAudioContext)(); if (spdCtx.state === 'suspended') spdCtx.resume();
    const ctx = spdCtx, dur = 2.6 + Math.random() * 1.5, len = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let last = 0; for (let i = 0; i < len; i++) { last = (last + 0.04 * (Math.random() * 2 - 1)) / 1.04; d[i] = last * 3.5; }
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), t0 = ctx.currentTime + (delay || 0.5);
    src.buffer = buf; f.type = 'lowpass'; f.frequency.value = 160 + Math.random() * 120;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.9, t0 + 0.08); g.gain.exponentialRampToValueAtTime(0.35, t0 + 0.6); g.gain.exponentialRampToValueAtTime(0.6, t0 + 0.9); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(ctx.destination); src.start(t0); src.stop(t0 + dur);
  } catch (e) { /* pas de son */ }
};
{ const a1 = window.act; window.act = function (a, long) {
  if (a === 'wx47:thunder') { store.set('thunder', !store.get('thunder', true)); render(); return; }
  if (a === 'wx47:test') { window.thunderSound(0.1); toast('Tonnerre de test'); return; }
  if (a === 'wx47:vig') { store.set('vigOn', !store.get('vigOn', true)); render(); return; }
  if (a === 'wx47:vigsnd') { store.set('vigSound', !store.get('vigSound', true)); render(); return; }
  return a1.apply(this, arguments); }; }
{ const cat = SETCATS.find(([n]) => n === 'Navigation');
  if (cat) cat[1].push(['Météo et vigilance', (p) => `<div style="display:flex;flex-direction:column;gap:10px;max-width:680px">
    ${setRow(p, 'Vigilance orange / rouge', `Alerte Météo-France de ton département (flux MeteoAlarm, Internet nécessaire). Département actuel : ${esc(geo47.dept || 'pas encore connu')}.`, chipBtn(p, 'wx47:vig', store.get('vigOn', true) ? 'Affichée' : 'Masquée', store.get('vigOn', true)))}
    ${setRow(p, 'Bip de vigilance', 'Bip quand une vigilance orange ou rouge commence.', chipBtn(p, 'wx47:vigsnd', store.get('vigSound', true) ? 'Activé' : 'Désactivé', store.get('vigSound', true)))}
    ${setRow(p, 'Bruit du tonnerre', 'Pendant un orage, un grondement suit chaque éclair (quand l\'accueil est affiché).', chipBtn(p, 'wx47:thunder', store.get('thunder', true) ? 'Activé' : 'Désactivé', store.get('thunder', true)) + chipBtn(p, 'wx47:test', 'Tester'))}</div>`]); }

// ================= 18. styles d'icônes : iPhone, Mac, Windows 11, Android, Accueil 2008 =================
// Dessins et effets maison qui reprennent l'allure de chaque système (pas les icônes d'Apple / Microsoft / Google).
// Les applis installées gardent leur vrai logo, posé dans la forme du style choisi.
const ICF = [['', 'Celui du thème'], ['autoradio', 'Autoradio'], ['iphone', 'iPhone'], ['mac', 'Mac'], ['windows', 'Windows 11'], ['android', 'Android'], ['a2008', 'Accueil 2008']];
// style « Autoradio » : carrés arrondis brillants, couleurs franches (rouge radio, bleu vidéo/GPS, vert téléphone), musique sur fond clair
const ARC = { radio: '#E2363A', video: '#2A6BEA', nav: '#2A6BEA', gps: '#2A6BEA', carplay: '#2A6BEA', car: '#2A6BEA', apps: '#2A6BEA', phone: '#2EB84E', bt: '#2EB84E', gear: '#6B7280', settings: '#6B7280', weather: '#2A6BEA' };
const ICV = { gps: '#0A84FF', carplay: '#30D158', nav: '#0A84FF', music: '#FF375F', phone: '#34C759', radio: '#FF9F0A', settings: '#8E8E93', car: '#5E5CE6', apps: '#64D2FF', video: '#BF5AF2', bt: '#0A84FF', weather: '#0A84FF' };
const icf = () => store.get('iconFam', '');
const hx47 = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix47 = (h, a, w) => 'rgb(' + hx47(h).map((v) => Math.round(v + ((w ? 255 : 0) - v) * a)).join(',') + ')';
// une pastille d'icône dans le style choisi (dock, réglages, aperçus)
function icTile(fam, k, col, s, p) {
  const r = (x) => `border-radius:${x}`, g = Math.round(s * 0.5);
  if (fam === 'autoradio') { const light = k === 'music', base = ARC[k] || col;
    return `<span style="width:${s}px;height:${s}px;border-radius:21%;display:flex;align-items:center;justify-content:center;background:${light ? 'linear-gradient(180deg,#ffffff,#dde3f4)' : `linear-gradient(180deg,${mix47(base, 0.38, 1)} 0%,${base} 52%,${mix47(base, 0.28, 0)} 100%)`};box-shadow:0 5px 12px #000a, inset 0 1.5px 0 #ffffff80, inset 0 -3px 0 #0000002e">${ic(k, g, light ? '#3d6bff' : '#fff', 2.4)}</span>`; }
  if (fam === 'iphone') return `<span style="width:${s}px;height:${s}px;${r('22.5%')};display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,${mix47(col, 0.28, 1)},${col});box-shadow:0 3px 8px #0006">${ic(k, g, '#fff', 2.3)}</span>`;
  if (fam === 'mac') return `<span style="width:${s}px;height:${s}px;${r('23%')};display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#fdfdfd,#d9dbe0);box-shadow:0 6px 12px #0007, inset 0 1px 0 #fff"><span style="display:flex;filter:drop-shadow(0 3px 3px #0005)">${ic(k, g, mix47(col, 0.1, 0), 2.6)}</span></span>`;
  if (fam === 'windows') return `<span style="width:${s}px;height:${s}px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 3px 4px #0007)">${ic(k, Math.round(s * 0.72), mix47(col, 0.15, 1), 2.6)}</span>`;
  if (fam === 'android') return `<span style="width:${s}px;height:${s}px;${r('50%')};display:flex;align-items:center;justify-content:center;background:${mix47(col, 0.78, 1)}">${ic(k, g, mix47(col, 0.55, 0), 2.6)}</span>`;
  if (fam === 'a2008') return `<span style="position:relative;width:${s}px;height:${s}px;${r('30%')};display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1d2433,#0b0e15);box-shadow:0 0 12px ${col}99, inset 0 0 0 1.5px ${col}66"><span style="display:flex;filter:drop-shadow(0 0 5px ${col})">${ic(k, g, '#fff', 2.3)}</span><i style="position:absolute;left:30%;right:30%;bottom:9%;height:3px;border-radius:2px;background:${col};box-shadow:0 0 6px ${col}"></i></span>`;
  return '';
}
{ const dock0 = window.dockC;
  window.dockC = function (p, vertical = false) {
    const fam = icf(); if (!fam || p.noChrome) return dock0.apply(this, arguments);
    if (fam === 'autoradio' && vertical) {   // comme l'autoradio : GPS, Musique, Radio, Applis, un bouton rond mis en avant, puis •••
      const gc = p.light ? '#1d2433' : '#ffffff', btn = (act, icon, lab) => `<button data-act="${act}" aria-label="${lab}" style="display:flex;align-items:center;justify-content:center;width:64px;height:62px;border-radius:16px">${ic(icon, 38, gc, 2.2)}</button>`;
      const its = btn('dock:gps', 'nav', 'GPS') + btn('dock:music', 'music', 'Musique') + btn('dock:radio', 'radio', 'Radio') + btn('drawer', 'grid', 'Applis')
        + `<button data-act="dock:phone" aria-label="Téléphone" style="width:62px;height:62px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 40%,${mix47(hex7(p.acc), 0.25, 1)},${hex7(p.acc)});box-shadow:0 0 0 3px ${hex7(p.acc)}66, 0 0 16px ${hex7(p.acc)}aa">${ic('phone', 28, '#ffffff', 2.4)}</button>`;
      return `<div style="display:flex;flex-direction:column;justify-content:space-around;align-items:center;padding:10px 0;border-radius:${p.r}px;background:${p.light ? 'linear-gradient(180deg,#ffffffcc,#ffffff88)' : 'linear-gradient(180deg,#ffffff2a,#ffffff12)'};box-shadow:inset 0 0 0 1px #ffffff22">${its}<button data-act="drawer" aria-label="Toutes les applis" style="color:${gc};font-size:26px;font-weight:800;letter-spacing:2px;height:34px">•••</button></div>`;
    }
    const s = vertical ? 54 : 50;
    const items = DOCK.map((d) => `<button data-act="dock:${d.id}" aria-label="${d.label}" style="display:flex;flex-direction:column;align-items:center;gap:5px;font-size:12px;color:${p.txt};${vertical ? '' : 'min-width:90px'}">${icTile(fam, d.icon, ICV[d.id] || ICV[d.icon] || hashCol(d.id), s, p)}${vertical ? '' : `<span style="${fam === 'autoradio' ? `color:${p.mut};font-size:12.5px;font-weight:600` : ''}">${d.label}</span>`}</button>`).join('');
    return `<div style="${card(p, `display:flex;${vertical ? 'flex-direction:column;padding:10px 0' : 'padding:0 10px'};justify-content:space-around;align-items:center`)}">${items}</div>`;
  }; }
// les icônes des applis installées ne sont PAS modifiées : seul le style de la barre du bas change
function icfApply() { document.body.dataset.icf = icf(); try { document.body.style.setProperty('--icglow', ((curP || palette()).acc || '#0A84FF') + 'aa'); } catch (e) { /* rien */ } }
{ const r0 = window.render; window.render = function () { icfApply(); return r0.apply(this, arguments); }; }
{ const a1 = window.act; window.act = function (a, long) { if (a.indexOf('icf:') === 0) { store.set('iconFam', a.slice(4)); render(); toast('Icônes : ' + (ICF.find((x) => x[0] === a.slice(4)) || [0, ''])[1]); return; } return a1.apply(this, arguments); }; }
{ const cat = SETCATS.find(([n]) => n === 'Affichage et personnalisation');
  if (cat) cat[1].splice(1, 0, ['Icônes', (p) => {
    const cur = icf(), demo = [['nav', 'nav'], ['phone', 'phone'], ['music', 'music'], ['radio', 'radio'], ['settings', 'gear'], ['car', 'car']];
    return `<div style="display:flex;flex-direction:column;gap:10px;max-width:900px"><div style="font-size:14px;color:${p.mut}">Style des icônes de la barre du bas. Les icônes de tes applis installées ne changent pas.</div>
    ${ICF.map(([k, n]) => { const prev = k ? demo.map(([id, i]) => icTile(k, i, ICV[id], 46, p)).join('') : `<span style="font-size:13px;color:${p.mut}">Les icônes suivent la barre du thème choisi</span>`;
      return `<button data-act="icf:${k}" style="display:flex;align-items:center;gap:16px;min-height:76px;padding:10px 16px;border-radius:14px;text-align:left;background:${k === 'iphone' ? 'linear-gradient(135deg,#3a1c71,#d76d77)' : k === 'mac' ? 'linear-gradient(180deg,#5a7fb8,#2b3f66)' : k === 'windows' ? 'linear-gradient(135deg,#1b2a4a,#3a5a9a)' : k === 'android' ? '#ece8f3' : k === 'a2008' ? '#0b0e15' : p.card2};color:${k === 'android' ? '#1b1b1f' : k ? '#fff' : p.txt};${cur === k ? `outline:3px solid ${p.acc};outline-offset:2px` : ''}">
        <b style="width:150px;font-size:17px">${n}${cur === k ? ' ✓' : ''}</b><span style="display:flex;gap:14px;align-items:center">${prev}</span></button>`; }).join('')}</div>`; }]); }
icfApply();

// ================= 19. apprentissage automatique du boîtier CAN =================
// Un appui : l'appli vérifie tout ce que le boîtier envoie déjà. Ce qui manque est listé dans un rapport ;
// pour chaque manque, « Capturer » (tu fais l'action, l'appli trouve le signal) ou « Ajouter moi-même ».
// Tout est enregistré pour toujours (carLearn, odoManual) et branché sur les widgets via onCar / onDoors.
const AL_ITEMS = [
  // [clé, nom, type, action à faire pour la capture, où le widget le lit]
  ['gps', 'Position GPS', 'gps'], ['speed', 'Vitesse', 'val'], ['odo', 'Kilométrage total', 'val'], ['rpm', 'Régime moteur', 'val'], ['fuel', 'Carburant', 'val'], ['range', 'Autonomie', 'val'], ['avg1', 'Consommation moyenne', 'val'], ['t1Km', 'Distance du trajet (ordinateur de bord)', 'val'],
  ['lf', 'Porte avant gauche', 'door', 'Ouvre la porte avant gauche'], ['rf', 'Porte avant droite', 'door', 'Ouvre la porte avant droite'], ['lb', 'Porte arrière gauche', 'door', 'Ouvre la porte arrière gauche'], ['rb', 'Porte arrière droite', 'door', 'Ouvre la porte arrière droite'],
  ['trunk', 'Coffre', 'door', 'Ouvre le coffre'], ['bonnet', 'Capot', 'door', 'Ouvre le capot'],
  ['beltD', 'Ceinture conducteur', 'bit', 'Boucle puis débloque ta ceinture'], ['rev', 'Marche arrière', 'bit', 'Passe la marche arrière (frein appuyé)'], ['hb', 'Frein à main', 'bit', 'Serre puis desserre le frein à main'],
  ['lo', 'Feux de croisement', 'bit', 'Allume les feux de croisement'], ['hi', 'Pleins phares', 'bit', 'Allume les pleins phares'], ['turnL', 'Clignotant gauche', 'bit', 'Mets le clignotant gauche'], ['turnR', 'Clignotant droit', 'bit', 'Mets le clignotant droit'], ['hazard', 'Warning', 'bit', 'Allume les warnings'], ['lock', 'Verrouillage', 'bit', 'Verrouille puis déverrouille la voiture']
];
const AL_CARKEY = { hb: 'handbrake', rev: 'reverse' };
let al = null;   // { phase: 'scan'|'done', t0, seen:{}, cap:{key, base, noise, t0, cand, msg}, pick }
const alL = () => store.get('carLearn', {}) || {};
function alHas(k, typ) {   // l'élément arrive-t-il (boîtier ou appris) ?
  const L = alL(); if (L[k]) return 'appris';
  if (typ === 'door') return doors && (doors[k] === 0 || doors[k] === 1) && doors.raw !== -1 ? 'boîtier' : '';
  const ck = AL_CARKEY[k] || k; return car && (car[ck] === 0 || car[ck] === 1) && Date.now() - car.ts < 10000 ? 'boîtier' : '';
}
function alScanTick() {
  if (!al || al.phase !== 'scan') return;
  const now = Date.now(), S = al.seen;
  if (loc && now - loc.ts < 15000) S.gps = `${loc.lat.toFixed(4)}, ${loc.lon.toFixed(4)}`;
  if (car && now - car.ts < 10000) for (const [k, , t] of AL_ITEMS) if (t === 'val') { const v = val(car[k]); if (v != null && (k !== 'odo' || v > 0)) S[k] = v; }
  if (!S.odo && +store.get('odoManual', 0)) S.odo = 'saisi : ' + Math.round(+store.get('odoManual', 0) + (typeof odoGps === 'number' ? odoGps : 0)).toLocaleString('fr-FR') + ' km';
  for (const [k, , t] of AL_ITEMS) if (t === 'door' || t === 'bit') { const h = alHas(k, t); if (h) S[k] = h; }
  if (now - al.t0 > 12000) { al.phase = 'done'; store.set('canReport', { t: now, seen: S }); render(); return; }
  al.pct = Math.round((now - al.t0) / 120); if (tab === 'settings') render(); setTimeout(alScanTick, 1000);
}
function alStart() { al = { phase: 'scan', t0: Date.now(), seen: {}, pct: 0 }; render(); setTimeout(alScanTick, 300); }
// capture d'un élément manquant (réutilise la lecture des signaux bruts de l'ancien assistant)
function alCapStart(k) {
  const it = AL_ITEMS.find((x) => x[0] === k); if (!it) return;
  const v = rawVec(); if (!v.length) { toast('Aucun signal reçu du boîtier : capture impossible'); return; }
  al = al || { phase: 'done', seen: (store.get('canReport', {}) || {}).seen || {} };
  al.cap = { key: k, base: v.slice(), noise: new Set(), t0: Date.now(), cand: null, msg: 'Ne touche à rien 3 secondes…', ph: 'noise' }; render(); setTimeout(alCapTick, 200);
}
function alCapTick() {
  const c = al && al.cap; if (!c) return;
  const v = rawVec();
  if (c.ph === 'noise') {
    v.forEach((x, i) => { const d = x ^ (c.base[i] || 0); for (let b = 0; b < 8; b++) if (d & (1 << b)) c.noise.add(i * 8 + b); });
    if (Date.now() - c.t0 > 3000) { c.base = v.slice(); c.ph = 'wait'; c.t0 = Date.now(); c.msg = 'À toi : ' + AL_ITEMS.find((x) => x[0] === c.key)[3]; render(); }
  } else {
    const ch = []; v.forEach((x, i) => { const d = x ^ (c.base[i] || 0); for (let b = 0; b < 8; b++) if ((d & (1 << b)) && !c.noise.has(i * 8 + b)) ch.push([i, b, (x >> b) & 1]); });
    if (ch.length) {
      const key = ch.map((q) => q.join('.')).join('|');
      if (!c.cand || c.cand.key !== key) c.cand = { key, t: Date.now(), ch };
      else if (Date.now() - c.cand.t > 700) { const [i, b, on] = ch[0]; alSave(c.key, { i, b, on }); toast(`Trouvé et enregistré : octet ${i}, bit ${b}`); al.cap = null; al.seen[c.key] = 'appris'; render(); return; }
    } else c.cand = null;
    if (Date.now() - c.t0 > 45000) { c.msg = 'Rien n\'a bougé en 45 s : ce signal n\'est sans doute pas envoyé par ton boîtier.'; c.ph = 'fail'; render(); return; }
  }
  setTimeout(alCapTick, 200);
}
function alSave(k, m) { const L = alL(); L[k] = m; store.set('carLearn', L); try { store.set('carLearnBak', L); } catch (e) { /* rien */ } }
// branchement sur les widgets : les signaux appris remplissent les mêmes champs que le boîtier
{ const oc = window.onCar; window.onCar = function (o) {
  try { const L = alL(), v = rawVec();
    if (v.length) for (const k of ['hi', 'turnL', 'turnR', 'hazard', 'hb', 'lock', 'fogF', 'fogR']) { const m = L[k]; if (m && v[m.i] != null) o[AL_CARKEY[k] || k] = ((v[m.i] >> m.b) & 1) === m.on ? 1 : 0; }
    if (L.beltD && o.beltD === 1) o.belt = 1;
  } catch (e) { /* jamais bloquant */ }
  return oc.apply(this, arguments); }; }
// page de réglages
function alKeypad(p) {
  const v = al.kp || '', b = (t, a) => `<button data-act="al:kp:${a}" style="height:58px;border-radius:12px;background:${p.card2};color:${p.txt};font-size:22px;font-weight:700">${t}</button>`;
  return `<div data-act="al:kp:noop" style="position:absolute;inset:0;z-index:3000;background:#000a;display:flex;align-items:center;justify-content:center"><div style="width:380px;${card(p, 'padding:16px;display:flex;flex-direction:column;gap:10px')}">
    <div style="font-size:17px;font-weight:700">Kilométrage affiché au compteur</div><div style="font-size:34px;font-weight:700;text-align:right;padding:6px 10px;border-radius:12px;background:${p.card2}">${v ? Number(v).toLocaleString('fr-FR') : '0'} km</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${'123456789'.split('').map((d) => b(d, d)).join('')}${b('⌫', 'del')}${b('0', '0')}${b('OK', 'ok')}</div>
    <button data-act="al:kp:x" style="height:46px;border-radius:12px;background:${p.card2};color:${p.txt};font-weight:600">Annuler</button></div></div>`;
}
function alPage(p) {
  const rep = al && al.phase === 'done' ? al.seen : al && al.phase === 'scan' ? al.seen : ((store.get('canReport', null) || {}).seen || null);
  const L = alL();
  const row = ([k, n, t]) => { const got = rep && rep[k] != null && rep[k] !== '', learned = !!L[k];
    const st = got || learned ? `<b style="color:#2E9E4D">✓</b>` : rep ? `<b style="color:#E8A317">!</b>` : `<b style="color:${p.mut}">·</b>`;
    const info = got ? (typeof rep[k] === 'number' ? (k === 'odo' ? Math.round(rep[k]).toLocaleString('fr-FR') + ' km' : String(Math.round(rep[k] * 10) / 10)) : esc(String(rep[k]))) : learned ? `appris (octet ${L[k].i}, bit ${L[k].b})` : rep ? 'non trouvé' : '';
    const btn = (t === 'door' || t === 'bit') ? (learned ? chipBtn(p, 'al:del:' + k, 'Oublier') : got ? '' : chipBtn(p, 'al:cap:' + k, 'Capturer', true) + chipBtn(p, 'al:pick:' + k, 'Ajouter moi-même'))
      : k === 'odo' && !got ? chipBtn(p, 'al:odo', 'Saisir mon kilométrage', true) : k === 'odo' && +store.get('odoManual', 0) ? chipBtn(p, 'al:odo', 'Corriger') : '';
    return `<div style="display:flex;align-items:center;gap:10px;min-height:46px;padding:4px 10px;border-radius:10px;background:${al && al.cap && al.cap.key === k ? p.acc + '33' : 'transparent'}">${st}<span style="flex:1;font-size:15px">${n}</span><span style="font-size:13px;color:${p.mut};max-width:260px;${ell}">${info}</span>${btn}</div>`; };
  const nOk = rep ? AL_ITEMS.filter(([k]) => (rep[k] != null && rep[k] !== '') || L[k]).length : 0;
  let top;
  if (al && al.phase === 'scan') top = `<div style="font-size:20px;font-weight:700">Recherche en cours… ${Math.min(100, al.pct)} %</div><div style="height:8px;border-radius:4px;background:${p.card2};overflow:hidden"><div style="height:100%;width:${Math.min(100, al.pct)}%;background:${p.acc}"></div></div><div style="font-size:13px;color:${p.mut}">Moteur allumé de préférence, et si possible en roulant un peu (pour comparer la vitesse au GPS).</div>`;
  else if (al && al.cap) top = `<div style="font-size:20px;font-weight:700">Capture : ${AL_ITEMS.find((x) => x[0] === al.cap.key)[1]}</div><div style="font-size:17px">${esc(al.cap.msg)}</div><div>${chipBtn(p, 'al:capx', 'Annuler la capture')}</div>`;
  else if (al && al.pick) top = `<div style="font-size:18px;font-weight:700">Ajouter moi-même : ${AL_ITEMS.find((x) => x[0] === al.pick)[1]}</div><div style="font-size:13px;color:${p.mut}">Fais l'action dans la voiture et regarde quel signal change de couleur, puis touche-le.</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px;max-height:150px;overflow:auto">${rawVec().map((x, i) => [0, 1, 2, 3, 4, 5, 6, 7].map((b) => { const on = (x >> b) & 1; return `<button data-act="al:set:${i}:${b}:${on}" style="width:52px;height:30px;border-radius:7px;font-size:11px;background:${on ? '#FFB020' : p.card2};color:${on ? '#000' : p.mut}">${i}.${b}</button>`; }).join('')).join('')}</div><div>${chipBtn(p, 'al:pickx', 'Annuler')}</div>`;
  else top = `<div style="display:flex;align-items:center;gap:12px"><div style="flex:1"><div style="font-size:20px;font-weight:700">${rep ? `${nOk} / ${AL_ITEMS.length} informations trouvées` : 'Apprentissage automatique du boîtier'}</div><div style="font-size:13px;color:${p.mut}">${rep ? 'Ce qui manque : touche « Capturer » et fais l\'action, ou « Ajouter moi-même ». Tout est enregistré pour toujours.' : 'Touche « Lancer » : l\'appli cherche toute seule ce que ton boîtier envoie (environ 12 secondes). Elle écoute seulement, elle n\'envoie rien à la voiture.'}</div></div>${chipBtn(p, 'al:start', rep ? 'Relancer' : 'Lancer', true)}</div>`;
  return `<div style="display:flex;flex-direction:column;gap:10px;max-width:900px">${top}<div style="${box(p, 'padding:6px')}">${AL_ITEMS.map(row).join('')}</div>
    <div style="font-size:12.5px;color:${p.mut}">Enregistré dans l'appli : reste après redémarrage et mise à jour. Pour le garder même après une désinstallation : Paramètres → Mises à jour → sauvegarde des réglages.</div></div>${al && al.kp != null ? alKeypad(p) : ''}`;
}
{ const a1 = window.act; window.act = function (a, long) {
  if (a.indexOf('al:') !== 0) return a1.apply(this, arguments);
  const [, op, x, y, z] = a.split(':');
  if (op === 'start') { if (moving()) { toast('À l\'arrêt de préférence, mais je lance quand même'); } alStart(); return; }
  if (op === 'cap') { alCapStart(x); return; }
  if (op === 'capx') { if (al) al.cap = null; render(); return; }
  if (op === 'pick') { al = al || { phase: 'done', seen: (store.get('canReport', {}) || {}).seen || {} }; al.pick = x; render(); clearInterval(al.pt); al.pt = displayEvery725(() => { if (al && al.pick && tab === 'settings') render(); else if (al) clearInterval(al.pt); }, 700); return; }
  if (op === 'pickx') { if (al) { al.pick = null; clearInterval(al.pt); } render(); return; }
  if (op === 'set') { const k = al && al.pick; if (k) { alSave(k, { i: +x, b: +y, on: +z }); al.seen[k] = 'appris'; al.pick = null; clearInterval(al.pt); toast('Enregistré pour toujours'); } render(); return; }
  if (op === 'del') { const L = alL(); delete L[x]; store.set('carLearn', L); if (al && al.seen) delete al.seen[x]; toast('Oublié'); render(); return; }
  if (op === 'odo') { al = al || { phase: 'done', seen: (store.get('canReport', {}) || {}).seen || {} }; al.kp = ''; render(); return; }
  if (op === 'kp') { if (x === 'noop') return; if (x === 'x') { al.kp = null; render(); return; }
    if (x === 'del') al.kp = al.kp.slice(0, -1); else if (x === 'ok') { const n = parseInt(al.kp, 10); if (n > 0 && n < 2e6) { store.set('odoManual', n); store.set('odoManualAt', Date.now()); odoGps = 0; al.seen.odo = 'saisi : ' + n.toLocaleString('fr-FR') + ' km'; toast('Kilométrage enregistré : il avancera tout seul avec le GPS'); } al.kp = null; }
    else if (al.kp.length < 7) al.kp += x; render(); return; }
}; }
{ const veh = SETCATS.find((c) => c[0] === 'Véhicule'); if (veh) veh[1].unshift(['Apprentissage automatique', (p) => alPage(p)]); }

// ================= 20. pression des pneus, pleins, bilan mensuel / annuel, mode nuit, luminosité, fatigue =================
const pressF = () => Number(store.get('pressF', 2.2)), pressR = () => Number(store.get('pressR', 2.2));
const fr1b = (x) => (Math.round(x * 10) / 10).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
function pressSync() { const it = PLAN.find((x) => x.id === 'press'); if (it) it.d = `À froid : ${fr1b(pressF())} bar avant · ${fr1b(pressR())} bar arrière (valeurs de l'étiquette de ta porte conducteur). Réglables dans Entretien → Plan constructeur.`; }
pressSync();
// réglage de la pression : petit bloc ajouté sous le plan constructeur
{ const ps = window.pageService; window.pageService = function (p) {
  pressSync();
  if (svcSub === 'pleins') return pagePleins(p);
  if (svcSub === 'bilan') return pageBilan(p);
  const h = ps.apply(this, arguments);
  if (svcSub !== 'plan') return h;
  const blk = `<div style="${box(p, 'padding:10px 12px;display:flex;flex-direction:column;gap:6px')}"><div style="font-size:14px;font-weight:700">🛞 Pression des pneus (rappel chaque mois)</div>
    ${[['F', 'Avant', pressF()], ['R', 'Arrière', pressR()]].map(([k, l, v]) => `<div style="display:flex;align-items:center;gap:8px"><span style="width:60px;font-size:13px">${l}</span>${chipBtn(p, 'prs:' + k + ':-0.1', '−')}<b style="width:64px;text-align:center">${fr1b(v)} bar</b>${chipBtn(p, 'prs:' + k + ':0.1', '+')}</div>`).join('')}
    <div style="font-size:11.5px;color:${p.mut}">Valeurs de l'étiquette sur le montant de ta porte conducteur.</div></div>`;
  return h.replace(`${smallBtn(p, 'planMail', 'Envoyer par e-mail', true)}`, blk + `${smallBtn(p, 'planMail', 'Envoyer par e-mail', true)}`);
}; }
// rappel du mois : au démarrage, si la vérification de pression est due
setTimeout(() => { try { const r = planRows().find((x) => x.it.id === 'press'); const k = new Date().toISOString().slice(0, 7);
  if (r && (r.st === 'late' || r.st === 'chk' || (r.days != null && r.days <= 2)) && brfMode() === 'off' && store.get('pressToast', '') !== k + new Date().getDate()) { store.set('pressToast', k + new Date().getDate()); toast(`🛞 Vérifie la pression des pneus : ${fr1b(pressF())} bar AV · ${fr1b(pressR())} bar AR (à froid)`); } } catch (e) { /* rien */ } }, 9000);

// ---------- carnet des pleins ----------
const fuelLog = () => (store.get('fuelLog', []) || []).slice().sort((a, b) => a.t - b.t);
let plSel = null, plKp = null;   // plein choisi · saisie en cours { f:'l'|'e'|'k', l:'', e:'', k:'' }
function plTrips(i) { const L = fuelLog(), a = L[i], b = L[i + 1]; if (!a) return []; return trkIndex().concat(trk ? [trk] : []).filter((t) => t.t0 >= a.t && (!b || t.t0 < b.t)).sort((x, y) => y.t0 - x.t0); }
function plStats(i) {
  const L = fuelLog(), a = L[i], b = L[i + 1], tr = plTrips(i), kmT = tr.reduce((s, t) => s + kmOf(t), 0);
  const km = b && b.k && a.k && b.k > a.k ? b.k - a.k : kmT, eL = a.e / a.l;
  const cons = b && km > 20 ? b.l / km * 100 : null, used = cons ? b.l : km * fuelCons() / 100;
  return { a, b, tr, km, eL, cons, used, left: b ? null : Math.max(0, a.l - used), c100: km > 0 ? used * eL / km * 100 : 0 };
}
function pagePleins(p) {
  const L = fuelLog(); if (plSel == null || plSel >= L.length) plSel = L.length - 1;
  const list = L.length ? L.map((f, i) => { const s = plStats(i); return `<button data-act="pl:sel:${i}" style="display:grid;grid-template-columns:1.1fr .8fr .9fr 1fr;gap:6px;align-items:center;width:100%;text-align:left;padding:10px 12px;border-radius:12px;margin-bottom:6px;background:${i === plSel ? p.acc : p.card2};color:${i === plSel ? p.onAcc : p.txt};font-size:14px">
      <b>${fmtDate(f.t)}</b><span>${fr1b(f.l)} L</span><span>${eur2(f.e)}</span><span style="text-align:right">${s.cons ? fr1b(s.cons) + ' L/100' : i === L.length - 1 ? 'en cours' : '—'}</span></button>`; }).reverse().join('')
    : `<div style="padding:16px;color:${p.mut}">Aucun plein noté. Touche « Nouveau plein » à la station.</div>`;
  let det = `<div style="margin:auto;color:${p.mut}">Choisis un plein à gauche.</div>`;
  if (L.length && plSel >= 0) {
    const s = plStats(plSel), cell = (l, v) => `<div style="${box(p, 'padding:8px 12px')}"><div style="font-size:12px;color:${p.mut}">${l}</div><div style="font-size:20px;font-weight:700">${v}</div></div>`;
    const rows = s.tr.length ? s.tr.map((t) => `<button data-act="pl:trip:${t.id || 'cur'}" style="display:grid;grid-template-columns:.8fr 2.4fr .7fr .7fr .8fr 24px;gap:8px;align-items:center;width:100%;text-align:left;padding:9px 10px;border-bottom:1px solid ${p.card2};color:${p.txt};font-size:13.5px">
        <span><b>${fmtDate(t.t0)}</b> <span style="color:${p.mut}">${fmtTime(t.t0)}</span></span><span style="${ell}">${esc(t.from || 'Départ')} → ${esc(t.to || (t === trk ? 'en cours' : 'Arrivée'))}</span><span>${fr1b(kmOf(t))} km</span><span>${dur47(t.t1 - t.t0)}</span><span style="color:${p.warn}">${eur2(kmOf(t) * (s.cons || fuelCons()) / 100 * s.eL)}</span><span>🗺</span></button>`).join('')
      : `<div style="padding:14px;color:${p.mut}">Aucun trajet enregistré depuis ce plein.</div>`;
    det = `<div style="display:flex;align-items:center;gap:10px"><div style="font-size:18px;font-weight:700;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Plein du ${fmtDate(s.a.t)} · ${fr1b(s.a.l)} L · ${eur2(s.a.e)}${s.a.s ? `<span style="font-size:13px;font-weight:600;color:${p.mut}"> · ${esc(s.a.s)}</span>` : ''}</div><span style="flex:1"></span>${chipBtn(p, 'pl:del:' + plSel, plDelArm === plSel ? 'Confirmer ?' : 'Supprimer')}</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">${cell(s.b ? 'Parcouru avec' : 'Depuis ce plein', fr1b(s.km) + ' km')}${cell('Conso', s.cons ? fr1b(s.cons) + ' L/100' : '≈ ' + fr1b(fuelCons()) + ' L/100')}${cell('Coût / 100 km', eur2(s.c100))}${cell(s.b ? 'Prix au litre' : 'Reste estimé', s.b ? s.eL.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' €' : fr1b(s.left) + ' L')}</div>
      <div style="font-size:12.5px;color:${p.mut}">${s.tr.length} trajet${s.tr.length > 1 ? 's' : ''} · touche un trajet pour voir sa carte du point A au point B.</div>
      <div class="scroll" style="flex:1;min-height:0">${rows}</div>`;
  }
  return pageFrame(p, `<div style="display:grid;grid-template-columns:420px minmax(0,1fr);gap:12px;flex:1;min-height:0">
    <div style="${card(p, 'padding:12px;display:flex;flex-direction:column;gap:8px;min-height:0')}"><div style="display:flex;align-items:center;gap:8px"><div style="font-size:18px;font-weight:700">Mes pleins</div><span style="flex:1"></span>${chipBtn(p, 'pl:new', '⛽ Nouveau plein', true)}</div>
      <div style="display:grid;grid-template-columns:1.1fr .8fr .9fr 1fr;gap:6px;padding:0 12px;font-size:12px;color:${p.mut}"><span>Date</span><span>Litres</span><span>Payé</span><span style="text-align:right">Conso réelle</span></div>
      <div class="scroll" style="flex:1;min-height:0">${list}</div></div>
    <div style="${card(p, 'padding:12px 14px;display:flex;flex-direction:column;gap:10px;min-height:0')}">${det}</div></div>${plKp ? plPad(p) : ''}`);
}
let plDelArm = -1;
function plPad(p) {
  const F = [['l', 'Litres mis', 'L'], ['e', 'Montant payé', '€'], ['k', 'Compteur', 'km']], v = plKp;
  const b = (t, a) => `<button data-act="pl:kp:${a}" style="height:54px;border-radius:12px;background:${p.card2};color:${p.txt};font-size:22px;font-weight:700">${t}</button>`;
  // prix de la station (plein détecté ou station où tu es) : le montant se calcule tout seul si tu ne le tapes pas
  const pr = v.pr > 0 ? v.pr : 0, lN = parseFloat(String(v.l || '').replace(',', '.')), auto = !v.e && pr && lN > 0 ? Math.round(lN * pr * 100) / 100 : 0;
  const shown = (k) => v[k] || (k === 'e' && auto ? `<span style="color:${p.mut}">≈ ${auto.toFixed(2).replace('.', ',')}</span>` : '—');
  const sub = v.st || pr ? `<div style="font-size:13px;color:${p.mut};margin-top:-4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${v.st ? '📍 ' + esc(v.st) : ''}${v.st && pr ? ' · ' : ''}${pr ? pr.toFixed(3).replace('.', ',') + ' €/L' : ''}</div>` : '';
  return `<div data-act="pl:kp:noop" data-plpad="1" data-noswipe="1" style="position:absolute;inset:0;z-index:3000;background:#000a;display:flex;align-items:center;justify-content:center"><div style="width:560px;${card(p, 'padding:16px;display:flex;flex-direction:column;gap:10px')}">
    <div style="font-size:18px;font-weight:700">${v.det ? '⛽ Plein détecté : vérifie avec ton ticket' : '⛽ Nouveau plein'}</div>${sub}
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${F.map(([k, l, u]) => `<button data-act="pl:kp:f${k}" style="text-align:left;padding:8px 10px;border-radius:12px;background:${p.card2};color:${p.txt};${v.f === k ? `outline:3px solid ${p.acc}` : ''}"><div style="font-size:12px;color:${p.mut}">${l}</div><div style="font-size:22px;font-weight:700">${shown(k)} <span style="font-size:13px">${u}</span></div></button>`).join('')}</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">${'789'.split('').map((d) => b(d, d)).join('')}${b('⌫', 'del')}${'456'.split('').map((d) => b(d, d)).join('')}${b(',', 'dot')}${'123'.split('').map((d) => b(d, d)).join('')}${b('0', '0')}</div>
    <div style="display:flex;gap:8px">${chipBtn(p, 'pl:kp:x', 'Annuler')}${v.det ? chipBtn(p, 'pl:kp:no', 'Ce n\'était pas un plein') : ''}<span style="flex:1"></span>${chipBtn(p, 'pl:kp:ok', 'Enregistrer le plein', true)}</div>
    <div style="font-size:12px;color:${p.mut}">${v.det ? 'Litres estimés avec la jauge (à 1 ou 2 L près) : corrige avec ton ticket si besoin.' : 'Le compteur est pris sur la voiture s\'il est reçu.'}${auto ? ' Montant calculé au prix de la station si tu ne le tapes pas.' : ' Le prix au litre sert ensuite pour tous les calculs en €.'}</div></div></div>`;
}
function plAct(op, x) {
  if (op === 'sel') { plSel = +x; plDelArm = -1; render(); return; }
  if (op === 'trip') { const id = x; if (id === 'cur') { trkSel = 'cur'; trkFull = false; } else { trkSel = id; trkFull = true; } tab = 'tracks'; render(); return; }
  if (op === 'del') { const i = +x; if (plDelArm !== i) { plDelArm = i; render(); setTimeout(() => { plDelArm = -1; }, 4000); return; } const L = fuelLog(); L.splice(i, 1); store.set('fuelLog', L); plSel = null; plDelArm = -1; render(); return; }
  if (op === 'new') { if (plwPend()) plwFix(); else plwNew(); return; }   // plein détecté en attente : on le reprend ; sinon station et prix pré-remplis si tu es à la pompe
  if (op === 'kp') {
    if (x === 'noop') return; const v = plKp; if (!v) return;
    if (x === 'x') { plKp = null; render(); return; }
    if (x === 'no') { store.set('plPend', null); plwAccept(); plKp = null; toast('D\'accord : ce n\'était pas un plein'); render(); return; }
    if (x[0] === 'f') { v.f = x.slice(1); render(); return; }
    if (x === 'del') v[v.f] = v[v.f].slice(0, -1);
    else if (x === 'dot') { if (v.f !== 'k' && v[v.f].indexOf(',') < 0) v[v.f] += ','; }
    else if (x === 'ok') {
      const l = parseFloat(v.l.replace(',', '.')), k = parseInt(v.k, 10) || 0; let e = parseFloat(v.e.replace(',', '.'));
      if (!(e > 0) && v.pr > 0 && l > 0) e = Math.round(l * v.pr * 100) / 100;      // montant pas tapé : litres × prix de la station
      if (!(l > 0 && l < 200) || !(e > 0 && e < 1000)) { toast('Indique les litres et le montant payé'); return; }
      const L = fuelLog(), last = L[L.length - 1]; if (k && last && last.k && k <= last.k) { toast('Le compteur doit être plus grand qu\'au dernier plein'); return; }
      const rec = { t: v.t || Date.now(), l, e, k }; if (v.st) rec.s = String(v.st).slice(0, 80);
      L.push(rec); L.sort((a, b) => a.t - b.t); store.set('fuelLog', L); store.set('fuelPrice', Math.round(e / l * 1000) / 1000);
      if (v.det) { store.set('plPend', null); plwAccept(); }
      plKp = null; plSel = L.indexOf(rec); toast(`⛽ Plein enregistré : ${(e / l).toLocaleString('fr-FR', { minimumFractionDigits: 3 })} €/L. Le compteur du plein repart à zéro.`); render(); return;
    } else if (v[v.f].replace(',', '').length < 7) v[v.f] += x;
    render();
  }
}

// ---------- bilan du mois / de l'année ----------
let bilYear = new Date().getFullYear(), bilMonth = new Date().getMonth();
const MOIS47 = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MOIS47C = ['jan', 'fév', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];   // juin et juillet ne s'écrivent plus tous les deux « jui »
function bilData(y) {
  const M = Array.from({ length: 12 }, () => ({ km: 0, n: 0, e: 0, ef: 0, l: 0, pl: 0, d: new Set() }));
  trkIndex().forEach((t) => { const d = new Date(t.t0); if (d.getFullYear() !== y) return; const m = M[d.getMonth()]; m.km += kmOf(t); m.n++; m.e += costOf(t); m.d.add(d.getDate()); });
  fuelLog().forEach((f) => { const d = new Date(f.t); if (d.getFullYear() !== y) return; const m = M[d.getMonth()]; m.ef += f.e; m.l += f.l; m.pl++; });
  trkArchDays().forEach(([ts, a]) => { const d = new Date(ts); if (d.getFullYear() !== y) return; const m = M[d.getMonth()]; m.km += a[0]; m.n += a[1]; m.e += a[2]; m.d.add(d.getDate()); });   // parcours effacés pour faire de la place
  return M;
}
function pageBilan(p) {
  const M = bilData(bilYear), m = M[bilMonth], cost = (x) => (x.ef > 0 ? x.ef : x.e);
  const maxKm = Math.max(1, ...M.map((x) => x.km)), best = M.reduce((b, x, i) => (x.km > M[b].km ? i : b), 0), dear = M.reduce((b, x, i) => (cost(x) > cost(M[b]) ? i : b), 0);
  const tot = M.reduce((a, x) => ({ km: a.km + x.km, n: a.n + x.n, e: a.e + cost(x), pl: a.pl + x.pl }), { km: 0, n: 0, e: 0, pl: 0 });
  const pairs = {}; trkIndex().forEach((t) => { const d = new Date(t.t0); if (d.getFullYear() !== bilYear || d.getMonth() !== bilMonth || !t.from) return; const k = (t.from.split(',').pop() || '').trim() + ' → ' + ((t.to || '').split(',').pop() || '').trim(); pairs[k] = (pairs[k] || 0) + 1; });
  const top = Object.entries(pairs).sort((a, b) => b[1] - a[1])[0];
  const bars = M.map((x, i) => `<button data-act="bil:m:${i}" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;height:100%;color:${p.txt}"><span style="font-size:11px;color:${p.mut}">${x.km ? Math.round(x.km) : ''}</span>
      <div style="width:100%;height:${Math.max(2, x.km / maxKm * 100)}%;border-radius:6px 6px 0 0;background:${i === bilMonth ? p.acc : i === best && x.km ? '#2E9E4D' : p.card2}"></div><span style="font-size:12px;${i === bilMonth ? 'font-weight:700' : `color:${p.mut}`}">${MOIS47C[i]}</span></button>`).join('');
  const cell = (l, v, sub) => `<div style="${box(p, 'padding:10px 12px')}"><div style="font-size:12px;color:${p.mut}">${l}</div><div style="font-size:24px;font-weight:700">${v}</div>${sub ? `<div style="font-size:12px;color:${p.mut}">${sub}</div>` : ''}</div>`;
  return pageFrame(p, `<div style="display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:12px;flex:1;min-height:0">
    <div style="${card(p, 'padding:12px 16px;display:flex;flex-direction:column;gap:10px;min-height:0')}">
      <div style="display:flex;align-items:center;gap:8px">${chipBtn(p, 'bil:y:-1', '‹')}<div style="font-size:18px;font-weight:700">Kilomètres par mois — ${bilYear}</div>${chipBtn(p, 'bil:y:1', '›')}<span style="flex:1"></span><span style="font-size:12px;color:${p.mut}">touche un mois</span></div>
      <div style="flex:1;display:flex;align-items:flex-end;gap:8px;min-height:150px">${bars}</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">${cell('Bilan ' + bilYear, Math.round(tot.km).toLocaleString('fr-FR') + ' km', tot.n + ' trajets')}${cell('Dépensé', eur2(tot.e), tot.pl + ' pleins')}${cell('Mois le plus utilisé', M[best].km ? MOIS47[best] : '—', M[best].km ? Math.round(M[best].km).toLocaleString('fr-FR') + ' km' : '')}${cell('Mois le plus cher', cost(M[dear]) ? MOIS47[dear] : '—', cost(M[dear]) ? eur2(cost(M[dear])) : '')}</div></div>
    <div style="${card(p, 'padding:12px 16px;display:flex;flex-direction:column;gap:10px;min-height:0')}">
      <div style="font-size:18px;font-weight:700">Récapitulatif de ${MOIS47[bilMonth]} ${bilYear}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${cell('Distance', fr1b(m.km) + ' km')}${cell('Trajets', String(m.n), m.d.size + ' jours de conduite')}${cell('Carburant', m.l ? fr1b(m.l) + ' L' : '—', m.pl ? m.pl + ' plein' + (m.pl > 1 ? 's' : '') : 'aucun plein noté')}${cell('Coût', eur2(cost(m)), m.ef > 0 ? 'payé à la pompe' : 'estimé')}</div>
      ${cell('Trajet le plus fait', top ? esc(top[0]) : '—', top ? top[1] + ' fois' : '')}
      <div style="font-size:12px;color:${p.mut}">Le bilan du mois s'affiche tout seul le 1er du mois suivant ; celui de l'année le 1er janvier.</div></div></div>`);
}
// bilan automatique : premier démarrage d'un nouveau mois → message + ouverture du bilan
setTimeout(() => { try {
  const n = new Date(), k = n.getFullYear() + '-' + n.getMonth(), last = store.get('bilSeen', '');
  if (!last) { store.set('bilSeen', k); return; }
  if (last !== k && trkIndex().length) {
    store.set('bilSeen', k); const pm = new Date(n.getFullYear(), n.getMonth() - 1, 1); bilYear = pm.getFullYear(); bilMonth = pm.getMonth();
    const M = bilData(bilYear), x = M[bilMonth];
    if (n.getMonth() === 0) { const best = M.reduce((b, y, i) => (y.km > M[b].km ? i : b), 0); toast(`📊 Bilan ${bilYear} : ${Math.round(M.reduce((a, y) => a + y.km, 0)).toLocaleString('fr-FR')} km · mois le plus utilisé : ${MOIS47[best]}`); }
    else toast(`📊 Bilan de ${MOIS47[bilMonth]} : ${fr1b(x.km)} km · ${eur2(x.ef > 0 ? x.ef : x.e)}`);
    if (!moving()) { tab = 'service'; svcSub = 'bilan'; render(); }
  } } catch (e) { /* rien */ } }, 12000);
{ const a1 = window.act; window.act = function (a, long) {
  if (a.indexOf('pl:') === 0) { const [, op, x] = a.split(':'); plAct(op, x); return; }
  if (a.indexOf('bil:') === 0) { const [, op, x] = a.split(':'); if (op === 'y') bilYear += +x; if (op === 'm') bilMonth = +x; render(); return; }
  if (a.indexOf('prs:') === 0) { const [, k, d] = a.split(':'); const key = k === 'F' ? 'pressF' : 'pressR'; store.set(key, Math.max(1.5, Math.min(3.5, Math.round((Number(store.get(key, 2.2)) + Number(d)) * 10) / 10))); pressSync(); render(); return; }
  return a1.apply(this, arguments); }; }

// ---------- mode nuit, luminosité ----------
const nightMode = () => store.get('nightMode', '');
{ const n0 = window.isNight; window.isNight = function () {
  const m = nightMode(); if (m === 'toujours') return true; if (m === 'jamais') return false;
  if (m === 'phares') return !!(car && Date.now() - car.ts < 15000 && (car.lo === 1 || car.hi === 1)) || n0();
  return n0(); }; }
let dimEl = null;
// v7.8 : barre de luminosité en %
function lumBar(p, key, def) { const v = Number(store.get(key, def));
  return `<span style="display:flex;align-items:center;gap:12px"><input type="range" min="15" max="100" step="1" value="${v}" style="width:300px;height:36px;accent-color:${p.acc}" oninput="store.set('${key}', +this.value); lumApply(); this.nextElementSibling.textContent = this.value + ' %'"><b style="width:60px;text-align:right;font-size:18px">${v} %</b></span>`; }
function lumApply() {
  const v = Number(store.get('lum', 100)), vn = Number(store.get('lumNight', 60)), n = store.get('lumAuto', true) && isNight();
  const eff = n ? Math.min(v, vn) : v;
  if (!dimEl) { dimEl = document.createElement('div'); dimEl.style.cssText = 'position:fixed;inset:0;background:#000;pointer-events:none;z-index:99999;opacity:0;transition:opacity .4s'; document.body.appendChild(dimEl); }
  dimEl.style.opacity = String(Math.max(0, Math.min(0.8, (100 - eff) / 100 * 0.9)));
}
displayEvery725(lumApply, 5000); setTimeout(lumApply, 500);
// ---------- pause fatigue automatique ----------
let fatT = 0, fatLast = 0, fatStop = 0, fatWarned = 0;
setInterval(() => {
  const lim = Number(store.get('fatMin', 180)) * 60000; if (!lim) return;
  const now = Date.now(), s = curSpeed(), mv = s && s.v >= 10, dt = fatLast ? Math.min(now - fatLast, 10000) : 0; fatLast = now;
  if (mv) { fatT += dt; fatStop = 0; } else { fatStop += dt; if (fatStop >= 15 * 60000) { fatT = 0; fatWarned = 0; } }
  if (fatT >= lim && mv && now - fatWarned > 20 * 60000) { fatWarned = now; const h = Math.floor(fatT / 3600000), m = Math.round((fatT % 3600000) / 60000);
    toast(`☕ ${h} h ${String(m).padStart(2, '0')} de route sans pause : arrête-toi 15 minutes à la prochaine aire.`); if (typeof spdBeep === 'function') spdBeep(3); }
}, 5000);
{ const a1 = window.act; window.act = function (a, long) {
  if (a.indexOf('nt:') === 0) { const [, op, x] = a.split(':');
    if (op === 'mode') { store.set('nightMode', x); [0, 1, 2].forEach((i) => store.set('autoNight_' + i, x !== 'jamais' && x !== '')); }
    if (op === 'lum') store.set('lum', Math.max(20, Math.min(100, Number(store.get('lum', 100)) + Number(x))));
    if (op === 'lumn') store.set('lumNight', Math.max(20, Math.min(100, Number(store.get('lumNight', 60)) + Number(x))));
    if (op === 'lauto') store.set('lumAuto', !store.get('lumAuto', true));
    if (op === 'fat') store.set('fatMin', Number(x));
    lumApply(); render(); return; }
  return a1.apply(this, arguments); }; }
{ const cat = SETCATS.find(([n]) => n === 'Affichage et personnalisation');
  if (cat) cat[1].splice(1, 0, ['Nuit, luminosité, pause', (p) => {
    const m = nightMode() || (store.get('autoNight_' + profIdx(), false) ? 'auto' : 'jamais'), seg = (pre, opts, cur) => opts.map(([k, l]) => chipBtn(p, pre + k, l, String(cur) === String(k))).join('');
    return `<div style="display:flex;flex-direction:column;gap:12px;max-width:900px">
      ${setRow(p, '🌙 Mode nuit', 'Quand l\'écran passe au thème sombre (Nuit OLED).', `<span style="display:flex;gap:6px;flex-wrap:wrap">${seg('nt:mode:', [['auto', 'Soleil'], ['phares', 'Avec les phares'], ['toujours', 'Toujours'], ['jamais', 'Jamais']], m)}</span>`)}
      ${setRow(p, '☀ Luminosité', 'Glisse la barre : l\'écran change tout de suite (15 à 100 %).', lumBar(p, 'lum', 100))}
      ${setRow(p, 'Plus sombre la nuit', 'La nuit, la luminosité ne dépasse pas ce réglage.', chipBtn(p, 'nt:lauto', store.get('lumAuto', true) ? 'Activé' : 'Désactivé', store.get('lumAuto', true)) + lumBar(p, 'lumNight', 60))}
      ${setRow(p, '☕ Pause fatigue', 'Se compte tout seul quand tu roules ; remis à zéro après 15 min d\'arrêt.', `<span style="display:flex;gap:6px">${seg('nt:fat:', [[120, '2 h'], [180, '3 h'], [240, '4 h'], [0, 'Désactivé']], store.get('fatMin', 180))}</span>`)}
      <div style="font-size:12px;color:${p.mut}">La luminosité règle l'écran de l'appli, pas le rétroéclairage de l'autoradio (il faudrait modifier la partie Java pour ça).</div></div>`; }]); }

// ================= 21. stations France + Allemagne, tension batterie =================
// France : flux officiel « Prix des carburants » (data.economie.gouv.fr, sans clé).
// Allemagne : Tankerkönig / MTS-K (CC BY 4.0), clé gratuite personnelle à saisir dans Paramètres › Navigation › Stations essence.
const ST47_DE = { E10: 'e10', SP95: 'e5', SP98: 'e5', Gazole: 'diesel' };
let st47 = { list: [], at: 0, pos: null, msg: 'Recherche des stations…', de: '', deAt: 0, deList: [], dePos: null };
const st47InDE = (la, lo) => la > 47.2 && la < 55.1 && lo > 5.8 && lo < 15.1;   // Allemagne + Alsace/Moselle (frontière)
function st47Demo() {
  const de = Q47.has('de');
  return [{ c: 'FR', name: 'Intermarché', addr: 'Route de Savenay, Pontchâteau', price: 1.689, dist: 3.4, lat: 47.43, lon: -2.09 },
    { c: 'FR', name: 'Total Access', addr: 'RN 165, Savenay', price: 1.729, dist: 1.2, lat: 47.36, lon: -1.94 },
    { c: 'FR', name: 'Leclerc', addr: 'ZA du Pré Gras, Campbon', price: 1.705, dist: 6.8, lat: 47.41, lon: -1.97 }]
    .concat(de ? [{ c: 'DE', name: 'ARAL', addr: 'Hauptstraße 12, Kehl', price: 1.619, dist: 4.1, lat: 48.57, lon: 7.81 }, { c: 'DE', name: 'JET', addr: 'Rheinstraße 3, Kehl', price: 1.589, dist: 6.0, lat: 48.58, lon: 7.82 }, { c: 'DE', name: 'Shell', addr: 'Am Hafen 1, Kehl', price: 1.549, dist: 5.2, lat: 48.57, lon: 7.80, closed: true }] : []);
}
async function st47Update(force) {
  if (DEMO) { st47.list = st47Demo(); st47.msg = ''; st47Publish(); return; }
  if (!loc) { st47.msg = 'En attente du GPS…'; return; }
  const rad = Number(store.get('stRad', 10)), now = Date.now();
  if (!force && now - st47.at < 15 * 60e3 && st47.pos && hav(st47.pos.lat, st47.pos.lon, loc.lat, loc.lon) < 3) return;
  st47.at = now; st47.pos = { lat: loc.lat, lon: loc.lon };
  const fuel = store.get('fuel', 'E10'), fk = FUEL_KEY[fuel] || 'e10', out = [];
  // --- France
  try {
    const base = 'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records';
    const geo = `within_distance(geom, geom'POINT(${loc.lon.toFixed(5)} ${loc.lat.toFixed(5)})', ${rad}km)`;
    const recs = (await getJSON(`${base}?where=${encodeURIComponent(geo + ` AND ${fk}_prix IS NOT NULL`)}&order_by=${fk}_prix&limit=30`)).results || [];
    for (const r of recs) {
      const k = Object.keys(r).find((x) => x.toLowerCase() === fk + '_prix') || Object.keys(r).find((x) => x.toLowerCase().includes(fk) && x.toLowerCase().includes('prix'));
      let pr = k ? parseFloat(r[k]) : NaN; if (pr > 10) pr /= 1000; if (!(pr > 0)) continue;
      const g = r.geom || {}, la = +g.lat || (+r.latitude > 1000 ? r.latitude / 1e5 : +r.latitude), lo = +g.lon || (+r.longitude > 1000 ? r.longitude / 1e5 : +r.longitude);
      const mj = r[fk + '_maj'] ? Date.parse(r[fk + '_maj']) : 0;
      out.push({ c: 'FR', name: r.enseigne || r.nom || (r.ville ? 'Station de ' + String(r.ville).replace(/\b\w/g, (m) => m.toUpperCase()) : 'Station'), addr: [r.adresse, r.ville].filter(Boolean).join(', '), price: pr, lat: la, lon: lo, maj: mj });
    }
  } catch (e) { /* pas de réseau ou flux indisponible */ }
  // --- Allemagne
  // conditions Tankerkönig : clé personnelle, 1 requête par minute au plus, pas d'interrogation en boucle → 5 min mini (1 min si tu touches ⟳)
  const key = String(store.get('tkKey', '') || '').trim(), dk = ST47_DE[fuel];
  if (key && dk && st47InDE(loc.lat, loc.lon)) {
    const due = now - st47.deAt >= (force === 'user' ? 60e3 : 5 * 60e3) || st47.deFuel !== fuel;
    if (due) {
      st47.deAt = now; st47.deFuel = fuel; st47.de = '';
      try {
        const j = await getJSON(`https://creativecommons.tankerkoenig.de/json/list.php?lat=${loc.lat.toFixed(5)}&lng=${loc.lon.toFixed(5)}&rad=${Math.min(25, rad)}&sort=dist&type=all&apikey=${encodeURIComponent(key)}`);
        const L = [];
        if (!j.ok) st47.de = 'Allemagne : ' + (j.message || 'clé refusée');
        for (const t of j.stations || []) {
          const pr = Number(t[dk]); if (!(pr > 0)) continue;   // toutes les stations sont gardées (pas de tri caché) ; celles fermées sont signalées
          L.push({ c: 'DE', name: (t.brand || t.name || 'Tankstelle').trim(), addr: [[t.street, t.houseNumber].filter(Boolean).join(' '), t.place].filter(Boolean).join(', '), price: pr, lat: +t.lat, lon: +t.lng, closed: t.isOpen === false });
        }
        if (j.ok) st47.deList = L;
      } catch (e) { st47.de = 'Allemagne : prix indisponibles'; }
    }
    if (now - st47.deAt < 30 * 60e3) st47.deList.forEach((x) => out.push(Object.assign({}, x)));   // dernier relevé (moins de 30 min)
  } else { st47.de = ''; }
  out.forEach((s) => { s.dist = s.lat ? hav(loc.lat, loc.lon, s.lat, s.lon) : 99; });
  if (out.length) { st47.list = out; st47.msg = ''; st47Publish(); }
  else { st47.msg = 'Aucun prix trouvé dans un rayon de ' + rad + ' km'; stationMsg = 'prix indisponible'; st47.at = now - 12 * 60e3; }
  if (tab === 'home') render();
}
function st47Publish() {   // alimente aussi l'ancien widget « Station la moins chère » et le coût des trajets
  const b = st47Sorted().find((x) => !x.closed); if (!b) return;
  station = { price: b.price, name: b.name, lat: b.lat, lon: b.lon, label: `Moins chère · ${fr1(b.dist)} km · ${b.c === 'DE' ? '🇩🇪 ' : ''}${b.name}` };
}
const st47Sorted = () => st47.list.slice().sort((a, b) => (a.closed ? 1 : 0) - (b.closed ? 1 : 0) || a.price - b.price);
window.updateStation = st47Update;
const st47Row = (p, s, i, tag) => `<div style="display:flex;align-items:center;gap:10px;min-width:0;padding:4px 0;${i ? `border-top:1px solid ${p.line || '#ffffff1a'}` : ''}">
  <div style="flex:none;width:74px"><div style="font-size:20px;font-weight:800;color:${tag === 'min' ? p.ok[1] : 'inherit'};line-height:1.1">${s.price.toFixed(3).replace('.', ',')}</div><div style="font-size:11px;color:${p.mut}">€/L ${s.c === 'DE' ? '🇩🇪' : '🇫🇷'}</div></div>
  <div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${tag === 'min' ? '💰 ' : tag === 'near' ? '📍 ' : ''}${esc(s.name)}</div><div style="font-size:12px;color:${p.mut};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.closed ? '<b style="color:#FF8A3D">fermée</b> · ' : ''}${fr1(s.dist)} km · ${esc(s.addr)}</div></div>
  <button data-act="st47:go:${i}" style="flex:none;background:#1F6FD1;color:#fff;border-radius:10px;height:38px;padding:0 12px;font-size:14px;font-weight:600">Y aller</button></div>`;
let st47Shown = [];
function st47Pick(n) {   // la moins chère, la plus proche, puis les suivantes par prix
  const byP = st47Sorted(), near = st47.list.filter((s) => !s.closed).sort((a, b) => a.dist - b.dist)[0], res = [];
  if (byP[0]) res.push([byP[0], 'min']);
  if (near && near !== byP[0]) res.push([near, 'near']);
  for (const s of byP) { if (res.length >= n) break; if (!res.some(([x]) => x === s)) res.push([s, '']); }
  return res.slice(0, n);
}
GBLOCKS.stations = { n: 'Stations autour (France + Allemagne)', r: (p, w, h) => {
  const n = h >= 2.4 ? 5 : h >= 1.6 ? 3 : 2, rows = st47Pick(n); st47Shown = rows.map(([s]) => s);
  const fuel = store.get('fuel', 'E10'), deOn = !!store.get('tkKey', ''), hasDE = st47.list.some((s) => s.c === 'DE');
  return `<div style="${card(p, 'padding:8px 12px;display:flex;flex-direction:column;gap:2px;overflow:hidden')}">
    <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:${p.mut}"><span style="font-weight:700;color:inherit">⛽ ${esc(fuel === 'E10' ? 'SP95-E10' : fuel)}</span><span>· ${store.get('stRad', 10)} km</span><span style="flex:1"></span><button data-act="st47:set" style="font-size:12px;color:${p.acc}">Réglages</button><button data-act="st47:ref" style="font-size:14px;color:${p.acc}" aria-label="Actualiser">⟳</button></div>
    ${rows.length ? rows.map(([s, t], i) => st47Row(p, s, i, t)).join('') : `<div style="flex:1;display:flex;align-items:center;font-size:14px;color:${p.mut}">${esc(st47.msg)}</div>`}
    ${hasDE ? `<div style="font-size:10px;color:${p.mut}">Prix Allemagne : Tankerkönig / MTS-K (CC BY 4.0)</div>` : st47.de ? `<div style="font-size:11px;color:#FF8A3D">${esc(st47.de)}</div>` : ''}${!deOn && !hasDE && st47InDE(...(loc ? [loc.lat, loc.lon] : [0, 0])) ? `<div style="font-size:11px;color:${p.mut}">Allemagne : ajoute ta clé gratuite dans Réglages.</div>` : ''}</div>`; } };
FMIN.stations = [3, 2]; FSZ.stations = [[3, 2], [4, 3], [6, 4]];
// ---------- tension batterie ----------
let volt47Low = false;
function volt47() {   // { v, src } ou null
  const now = Date.now();
  if (car && now - car.ts < 10000 && +car.batt > 5) return { v: +car.batt, src: 'boîtier' };
  if (typeof learned !== 'undefined' && learned.batt && now - learned.batt.t < 15 * 60e3 && learned.batt.v > 5) return { v: learned.batt.v, src: 'ordinateur de bord' };
  if (DEMO) return { v: engOn47() ? 14.1 : 12.6, src: 'démo' };
  return null;
}
const engOn47 = () => { const s = curSpeed(); return (car && Date.now() - car.ts < 10000 && car.rpm > 400) || (s && s.v >= 5); };
function volt47Col(v) {   // repères indicatifs batterie plomb 12 V
  if (engOn47()) return v >= 13.2 && v <= 14.9 ? '#3FB950' : v > 14.9 ? '#FF6B6B' : '#F2A23A';
  return v >= 12.4 ? '#3FB950' : v >= 12.0 ? '#F2A23A' : '#FF6B6B';
}
{ const sys0 = window.sysHtml; window.sysHtml = function (p) {
  const base = sys0(p); if (!store.get('voltShow', true)) return base;
  const o = volt47(), col = o ? volt47Col(o.v) : p.mut;
  const bat = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="${col}" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="7" width="17" height="11" rx="2"/><path d="M21.5 10.5v4" stroke-linecap="round"/><path d="M8 12.5h5M10.5 10v5" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  return base + `<button data-act="st47:volt" aria-label="Tension batterie" style="height:36px;padding:0 4px;display:flex;align-items:center;gap:2px;white-space:nowrap;${o ? '' : 'opacity:.4'}">${bat}<span style="font-size:14px;font-weight:700;color:${o ? col : p.mut}">${o ? o.v.toFixed(1).replace('.', ',') : '–'}<small style="font-size:12px;margin-left:2px">V</small></span></button>`; }; }
setInterval(() => { const o = volt47(); if (o && !engOn47() && o.v < 11.9 && !volt47Low) { volt47Low = true; toast('🔋 Batterie faible : ' + o.v.toFixed(1).replace('.', ',') + ' V moteur coupé'); } }, 30000);
// ---------- actions et réglages ----------
{ const a1 = window.act; window.act = function (a, long) {
  if ((a === 'accCustom' && !document.getElementById('accHex')) || (a === 'gradCustom' && !(document.getElementById('g1') && document.getElementById('g2') && document.getElementById('gAng')))) return;
  if (a.indexOf('st47:') === 0) { const [, op, x] = a.split(':');
    if (op === 'go') { const s = st47Shown[+x]; if (!s || !s.lat) { toast('Position de la station inconnue'); return; }
      if (!A) { toast('Waze : ' + s.name); return; }
      let ok = false; try { ok = A.openUrl(`https://waze.com/ul?ll=${s.lat},${s.lon}&navigate=yes`) !== false; } catch (e) { ok = false; }
      if (!ok) { try { ok = A.openUrl(`geo:${s.lat},${s.lon}?q=${s.lat},${s.lon}(${encodeURIComponent(s.name)})`) !== false; } catch (e) { ok = false; } }   // sans Waze : l'appli GPS installée
      if (!ok) toast('Aucune appli GPS pour aller à ' + s.name); return; }
    if (op === 'ref') { st47Update('user'); toast('Mise à jour des prix…'); return; }
    if (op === 'set') { openSet('Navigation', 'Stations essence'); return; }
    if (op === 'fuel') { store.set('fuel', x); st47Update(true); render(); return; }
    if (op === 'rad') { store.set('stRad', +x); st47Update(true); render(); return; }
    if (op === 'key') { const el = document.getElementById('tk47'), v = el ? el.value.trim() : '';
      if (v && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) { toast('Clé invalide : format 00000000-0000-0000-0000-000000000000'); return; }
      store.set('tkKey', v); toast(v ? 'Clé Allemagne enregistrée' : 'Clé effacée'); st47Update(true); render(); return; }
    if (op === 'vshow') { store.set('voltShow', !store.get('voltShow', true)); render(); return; }
    if (op === 'volt') { const o = volt47();
      if (!o) { toast('Tension inconnue : ton boîtier ne l\'envoie pas. Paramètres › Véhicule › Tension batterie'); openSet('Véhicule', 'Tension batterie'); return; }
      const on = engOn47(), v = o.v, txt = on ? (v > 14.9 ? 'trop haute (alternateur ?)' : v >= 13.2 ? 'charge normale' : 'charge faible (alternateur ?)') : (v >= 12.4 ? 'bonne' : v >= 12.0 ? 'moyenne' : 'faible');
      toast(`🔋 ${v.toFixed(1).replace('.', ',')} V ${on ? 'moteur tournant' : 'moteur coupé'} : ${txt}`); return; }
    return; }
  return a1.apply(this, arguments); }; }
{ const cat = SETCATS.find(([n]) => n === 'Navigation');
  if (cat) cat[1].push(['Stations essence', (p) => {
    const fuel = store.get('fuel', 'E10'), rad = store.get('stRad', 10), key = store.get('tkKey', '');
    return `<div style="display:flex;flex-direction:column;gap:12px;max-width:900px">
      ${setRow(p, '⛽ Carburant', 'Ta 2008 1.2 PureTech roule à l\'essence : SP95-E10, SP95 ou SP98.', `<span style="display:flex;gap:6px;flex-wrap:wrap">${['E10', 'SP95', 'SP98', 'Gazole', 'E85', 'GPLc'].map((f) => chipBtn(p, 'st47:fuel:' + f, f === 'E10' ? 'SP95-E10' : f, fuel === f)).join('')}</span>`)}
      ${setRow(p, 'Rayon de recherche', 'Autour de ta position.', `<span style="display:flex;gap:6px">${[2, 5, 10, 20, 30].map((r) => chipBtn(p, 'st47:rad:' + r, r + ' km', +rad === r)).join('')}</span>`)}
      ${setRow(p, '🇩🇪 Prix en Allemagne', key ? 'Clé enregistrée. Les stations allemandes s\'affichent quand tu es en Allemagne ou près de la frontière (Alsace, Moselle).' : 'Il faut ta clé personnelle gratuite Tankerkönig (inscription avec ton e-mail sur onboarding.tankerkoenig.de), puis colle-la ici. Une clé ne se partage pas.', `<span style="display:flex;gap:6px;align-items:center"><input id="tk47" value="${esc(key)}" placeholder="00000000-0000-0000-0000-000000000000" style="width:330px;height:40px;border-radius:10px;padding:0 10px;font-size:14px;background:${p.card2};color:inherit;border:1px solid ${p.mut}55">${chipBtn(p, 'st47:key', 'Enregistrer', true)}${chipBtn(p, 'st738:test', 'Tester la clé')}</span>`)}
      ${st47.de ? `<div style="font-size:13px;color:#FF8A3D">${esc(st47.de)}</div>` : ''}
      <div style="font-size:12px;color:${p.mut}">France : flux officiel « Prix des carburants » (data.economie.gouv.fr), mis à jour toutes les 10 min. Allemagne : Tankerkönig / MTS-K, licence CC BY 4.0. Le widget « Stations autour » s'ajoute depuis l'édition de l'accueil.</div></div>`; }]); }
{ const veh = SETCATS.find((c) => c[0] === 'Véhicule');
  if (veh) veh[1].push(['Tension batterie', (p) => { const o = volt47();
    return `<div style="display:flex;flex-direction:column;gap:12px;max-width:900px">
      ${setRow(p, '🔋 Afficher la tension en haut', 'À côté du Wi-Fi. Vert = bon, orange = à surveiller, rouge = problème.', chipBtn(p, 'st47:vshow', store.get('voltShow', true) ? 'Activé' : 'Désactivé', store.get('voltShow', true)))}
      <div style="${box(p, 'padding:12px')}"><div style="font-size:22px;font-weight:800">${o ? o.v.toFixed(1).replace('.', ',') + ' V' : 'Pas de tension reçue'}</div><div style="font-size:13px;color:${p.mut}">${o ? 'Source : ' + o.src : 'Ton boîtier CAN n\'envoie pas la tension à l\'appli. Si l\'appli Voiture de l\'autoradio l\'affiche, va dans Véhicule › Apprendre ma voiture, fais « Capturer » sur cet écran et choisis « Batterie » pour la ligne en volts.'}</div></div>
      <div style="font-size:12px;color:${p.mut}">Repères indicatifs pour une batterie 12 V : moteur coupé, 12,4 V et plus = bonne, 12,0 à 12,4 = moyenne, moins de 12,0 = faible. Moteur tournant, 13,2 à 14,9 V = l'alternateur charge.</div></div>`; }]); }
setTimeout(() => st47Update(true), 4000); setInterval(() => st47Update(false), 60000);

// ================= 22. mise en page : rien ne déborde =================
// colonnes qui défilent : leurs éléments gardent leur taille (un bouton ne s'écrase plus quand la colonne est pleine)
{ const st = document.createElement('style'); st.textContent = '.colns>*{flex-shrink:0}'; document.head.appendChild(st); }

// ================= 23. robustesse réseau =================
// Une requête sans réponse (autoradio en veille, réseau qui décroche) ne doit jamais bloquer une fonction :
// au bout de 30 s, on la considère comme échouée (limitation, météo, stations… repartent au tour suivant).
{ const h0 = window.http; window.http = function (url) {
  return new Promise((res) => { let done = false; const t = setTimeout(() => { if (!done) { done = true; res({ ok: false, b: 'délai dépassé' }); } }, 30000);
    try { h0(url).then((r) => { if (!done) { done = true; clearTimeout(t); res(r); } }, () => { if (!done) { done = true; clearTimeout(t); res({ ok: false, b: 'erreur' }); } }); }
    catch (e) { if (!done) { done = true; clearTimeout(t); res({ ok: false, b: String(e) }); } } }); }; }

// ================= 24. « Toutes les applis » façon Windows 11 =================
// Bouton Applis de la barre du bas : dernière appli ouverte + les plus utilisées en haut, puis toutes les applis
// de A à Z avec une lettre par groupe. Toucher une lettre (à droite, ou un titre de groupe) emmène direct à ses applis.
// « Utilisées » = ouvertes depuis cet écran d'accueil (Android ne donne pas l'historique complet sans autorisation spéciale).
{ const st = document.createElement('style'); st.textContent = `
#appGrid.ap47{display:block!important;position:relative;padding:0 64px 24px 0}
.ap47top{display:grid;grid-template-columns:250px minmax(0,1fr);gap:14px;margin-bottom:6px}
.ap47box{background:#ffffff0d;border-radius:18px;padding:12px 14px;min-width:0}
.ap47t{font-size:14px;font-weight:700;color:#C9CBD3;display:flex;align-items:center;gap:8px;margin-bottom:8px}
.ap47row{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px}
.ap47g{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:8px 10px;margin-bottom:6px}
.app47{display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px 4px;border-radius:14px;min-width:0;color:#F2F2F4;font-size:13px;text-align:center}
.app47:active{background:#ffffff14}
.app47 .nm{width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.app47 .sb{font-size:11px;color:#9A9BA3;margin-top:-4px;white-space:nowrap}
.ap47L{display:flex;align-items:center;gap:10px;width:100%;margin:14px 0 4px;padding:4px 6px;border-radius:10px;font-size:22px;font-weight:800;color:#F2F2F4;text-align:left}
.ap47L::after{content:'';flex:1;height:1px;background:#ffffff1f}
.ap47last{display:flex;align-items:center;gap:12px;width:100%;padding:6px;border-radius:14px;text-align:left;color:#F2F2F4}
#ap47az{position:absolute;right:16px;top:78px;bottom:22px;width:46px;display:flex;flex-direction:column;justify-content:space-between;align-items:center;padding:6px 0;border-radius:16px;background:#ffffff0f;z-index:5}
#ap47az button{width:40px;flex:1;max-height:26px;font-size:13.5px;font-weight:800;color:#F2F2F4;border-radius:8px}
#ap47az button.off{color:#ffffff38}
#ap47az button.on{background:var(--ap47acc,#E0312B);color:#fff}
#ap47lg{position:absolute;inset:78px 26px 22px 26px;z-index:6;border-radius:20px;background:#0d0f14f7;display:none;align-items:center;justify-content:center}
#ap47lg.on{display:flex}
#ap47lg .gr{display:grid;grid-template-columns:repeat(7,92px);gap:12px}
#ap47lg button{height:76px;border-radius:16px;font-size:30px;font-weight:800;background:#ffffff14;color:#fff}
#ap47lg button.off{background:transparent;color:#ffffff30}`; document.head.appendChild(st); }
const AP47_HL = 30 * 86400000;                                           // « les plus utilisées » : une ouverture compte moitié moins au bout d'un mois
const apUse = () => store.get('appUse', {}) || {};
const apScore = (u, now) => (u ? u.n * Math.pow(0.5, (now - u.t) / AP47_HL) : 0);
function appUsed(pk) {
  if (!pk || typeof pk !== 'string') return;
  const U = apUse(), now = Date.now(), u = U[pk] || { n: 0, t: now, c: 0 };
  U[pk] = { n: apScore(u, now) + 1, t: now, c: (u.c || 0) + 1 };
  const ks = Object.keys(U); if (ks.length > 150) ks.sort((a, b) => U[a].t - U[b].t).slice(0, ks.length - 150).forEach((k) => { delete U[k]; });
  store.set('appUse', U);
}
// l'appli qu'ouvre un bouton de la barre du bas (celle choisie, sinon la première installée)
function dockPk47(it) {
  if (!it || it.special) return '';
  const inst = (pk) => allApps().some((a) => a.p === pk);
  const c = store.get('dock_' + it.id, ''); if (c && (inst(c) || !A)) return c;
  const cand = String(it.pk || '').split(',').map((x) => x.trim()).filter(Boolean), hit = cand.find(inst); if (hit) return hit;
  const f = it.re ? allApps().find((a) => it.re.test(a.l) || it.re.test(a.p)) : null; return f ? f.p : (cand[0] || '');
}
// ordre alphabétique partout (accents ignorés : « Égaliseur » avec les E)
const apKey = (l) => { const c = String(l || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().charAt(0).toUpperCase(); return /[A-Z]/.test(c) ? c : '#'; };
{ const aa0 = window.allApps; window.allApps = function () { const r = aa0(); if (r && !r.__az) { try { r.sort((a, b) => String(a.l).localeCompare(String(b.l), 'fr', { sensitivity: 'base', numeric: true })); r.__az = true; } catch (e) { /* ordre d'origine */ } } return r; }; }
const ago47 = (t) => { const m = Math.round((Date.now() - t) / 60000); if (m < 1) return 'à l\'instant'; if (m < 60) return `il y a ${m} min`; const h = Math.round(m / 60); if (h < 24) return `il y a ${h} h`; const d = Math.floor((Date.now() - t) / 86400000); return d <= 1 ? 'hier' : `il y a ${d} jours`; };
let ap47Clear = 0, ap47Want = null;
function ap47Tile(a, sub) {
  return `<button class="app47" data-act="app:${esc(a.p)}"><span class="fic" style="--ics:58px;background:${hashCol(a.p)}">${esc(String(a.l || '?').charAt(0).toUpperCase())}<img data-icon="${esc(a.p)}" alt=""></span><span class="nm">${esc(a.l)}</span>${sub ? `<span class="sb">${sub}</span>` : ''}</button>`;
}
function ap47Html() {
  const apps = allApps(), U = apUse(), now = Date.now(), by = (pk) => apps.find((a) => a.p === pk);
  const used = Object.keys(U).filter((pk) => by(pk));
  const last = used.slice().sort((a, b) => U[b].t - U[a].t)[0];
  const most = used.filter((pk) => U[pk].c >= 2).sort((a, b) => apScore(U[b], now) - apScore(U[a], now)).slice(0, 7);
  const lastBox = last ? `<button class="ap47last" data-act="app:${esc(last)}"><span class="fic" style="--ics:72px;background:${hashCol(last)}">${esc(by(last).l.charAt(0).toUpperCase())}<img data-icon="${esc(last)}" alt=""></span><span style="min-width:0"><b style="display:block;font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(by(last).l)}</b><span style="font-size:13px;color:#9A9BA3">${ago47(U[last].t)}</span></span></button>`
    : `<div style="font-size:13px;color:#9A9BA3;line-height:1.4;padding:6px 2px">La dernière appli que tu ouvres s'affichera ici.</div>`;
  const mostRow = most.length ? `<div class="ap47row">${most.map((pk) => ap47Tile(by(pk), `${U[pk].c} fois`)).join('')}</div>`
    : `<div style="font-size:13px;color:#9A9BA3;line-height:1.4;padding:6px 2px">Tes applis préférées viendront ici toutes seules, dès que tu en auras ouvert quelques-unes.</div>`;
  const top = `<div class="ap47top" id="ap47-top"><div class="ap47box"><div class="ap47t">🕘 Dernière utilisée</div>${lastBox}</div>
    <div class="ap47box"><div class="ap47t">⭐ Les plus utilisées<span style="flex:1"></span>${used.length ? `<button data-act="ap47:clear" style="font-size:12px;font-weight:600;color:${ap47Clear ? '#FF8A3D' : '#9A9BA3'}">${ap47Clear ? 'Confirmer l\'effacement ?' : 'Effacer l\'historique'}</button>` : ''}</div>${mostRow}</div></div>`;
  const groups = {}; apps.forEach((a) => { const k = apKey(a.l); (groups[k] = groups[k] || []).push(a); });
  const order = ['#'].concat('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')).filter((k) => groups[k]);
  const list = order.map((k) => `<button class="ap47L" id="ap47-${k === '#' ? 'num' : k}" data-ap47l="${k}" data-act="ap47:grid">${k}</button><div class="ap47g">${groups[k].map((a) => ap47Tile(a)).join('')}</div>`).join('');
  return { html: apps.length ? top + `<div style="font-size:15px;font-weight:700;color:#C9CBD3;margin:14px 2px 0">Toutes les applis · A → Z</div>` + list : '<div style="color:#9A9BA3">Aucune appli trouvée.</div>', order };
}
function ap47Draw() {
  const dr = $('drawer'), grid = $('appGrid'); grid.classList.add('ap47');
  const { html, order } = ap47Html(); grid.innerHTML = html;
  const acc = (curP && /^#[0-9a-f]{6}$/i.test(curP.acc)) ? curP.acc : '#E0312B'; dr.style.setProperty('--ap47acc', acc);
  let az = document.getElementById('ap47az'); if (!az) { az = document.createElement('div'); az.id = 'ap47az'; dr.appendChild(az); }
  const all = ['★', '#'].concat('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
  az.innerHTML = all.filter((k) => k !== '#' || order.includes('#')).map((k) => (k === '★' || order.includes(k)) ? `<button data-act="ap47:go:${k === '#' ? 'num' : k === '★' ? 'top' : k}" data-k="${k}">${k}</button>` : `<button class="off" disabled>${k}</button>`).join('');
  let lg = document.getElementById('ap47lg'); if (!lg) { lg = document.createElement('div'); lg.id = 'ap47lg'; lg.setAttribute('data-act', 'ap47:lgx'); dr.appendChild(lg); }
  lg.classList.remove('on');
  lg.innerHTML = `<div class="gr">${['★', '#'].concat('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')).map((k) => (k === '★' || order.includes(k)) ? `<button data-act="ap47:go:${k === '#' ? 'num' : k === '★' ? 'top' : k}">${k}</button>` : `<button class="off" disabled>${k}</button>`).join('')}</div>`;
  grid.scrollTop = 0; ap47Want = null; ap47Mark();
  if (!grid.__ap47) { grid.__ap47 = true; grid.addEventListener('scroll', ap47Mark, { passive: true }); grid.addEventListener('pointerdown', () => { ap47Want = null; }, { passive: true }); }
  if (typeof fLoadIcons === 'function') fLoadIcons(grid);
}
function ap47Mark() {   // lettre de la partie affichée allumée dans la colonne de droite
  const grid = $('appGrid'), az = document.getElementById('ap47az'); if (!grid || !az) return;
  if (!grid.offsetParent) return;                                        // tiroir pas encore affiché : positions inconnues
  let cur = 'top'; grid.querySelectorAll('.ap47L').forEach((h) => { if (h.offsetTop - 8 <= grid.scrollTop) cur = h.id.slice(5); });
  if (ap47Want && ap47Want !== 'top' && grid.scrollTop >= grid.scrollHeight - grid.clientHeight - 3) cur = ap47Want;   // dernières lettres : la liste ne peut pas monter plus haut
  az.querySelectorAll('button[data-act]').forEach((b) => b.classList.toggle('on', b.dataset.act === 'ap47:go:' + cur));
}
function ap47Go(k) {
  const grid = $('appGrid'), h = document.getElementById('ap47-' + k); if (!grid || !h) return; ap47Want = k;
  const top = k === 'top' ? 0 : Math.max(0, h.offsetTop - 4);
  try { grid.scrollTo({ top, behavior: 'smooth' }); } catch (e) { grid.scrollTop = top; }
  setTimeout(ap47Mark, 450);
}
window.openDrawer = function (forItem) {
  assignFor = forItem; ap47Clear = 0;
  $('drawerTitle').textContent = forItem ? `Choisis l'appli pour « ${forItem.label} »` : 'Toutes les applis';
  ap47Draw(); $('drawer').classList.add('on'); ap47Mark();
};
// comptage : seulement quand c'est toi qui ouvres une appli (pas les relances automatiques du cadre GPS)
{ const a1 = window.act; window.act = function (a, long) {
  try {
    if (a.indexOf('ap47:') === 0) { const [, op, x] = a.split(':');
      if (op === 'go') { const lg = document.getElementById('ap47lg'); if (lg) lg.classList.remove('on'); ap47Go(x); return; }
      if (op === 'grid') { const lg = document.getElementById('ap47lg'); if (lg) lg.classList.add('on'); return; }
      if (op === 'lgx') { const lg = document.getElementById('ap47lg'); if (lg) lg.classList.remove('on'); return; }
      if (op === 'clear') { if (!ap47Clear) { ap47Clear = 1; ap47Draw(); setTimeout(() => { if (ap47Clear) { ap47Clear = 0; if ($('drawer').classList.contains('on')) ap47Draw(); } }, 4000); return; } ap47Clear = 0; store.set('appUse', {}); toast('Historique des applis effacé'); ap47Draw(); return; }
      return; }
    if (!long && a.indexOf('app:') === 0 && !assignFor) appUsed(a.slice(4));
    else if (!long && a.indexOf('h2:app:') === 0 && !editing) appUsed(a.slice(7));
    else if (!long && a.indexOf('dock:') === 0) { const id = a.slice(5), it = DOCK.find((d) => d.id === id) || (typeof DOCK_ALL !== 'undefined' ? DOCK_ALL.find((d) => d.id === id) : null); if (it && !it.special) appUsed(dockPk47(it)); }
    else if (a.indexOf('am:open:') === 0) appUsed(a.slice(8));
    else if ((a === 'gb:tap' && !long) || a === 'gb:full') appUsed(gbPk());
    else if (a.indexOf('gb:pick:') === 0) appUsed(a.slice(8));
    else if (a === 'mArt' && media && media.pkg) appUsed(media.pkg);
  } catch (e) { /* le comptage ne doit jamais empêcher d'ouvrir l'appli */ }
  return a1.apply(this, arguments); }; }

// ================= 25. Assistant « petite fenêtre GPS » (Paramètres › Navigation › Petite fenêtre GPS) =================
// Android interdit à une appli normale de changer les options pour les développeurs et de redémarrer l'autoradio
// (permissions réservées au système). L'assistant ouvre donc directement le bon écran à chaque étape,
// dit exactement quoi toucher, puis teste. Pour tout faire d'un coup : 3 commandes ADB (LADB, Shizuku + aShell ou PC).
const FW_CMDS = 'settings put global enable_freeform_support 1\nsettings put global force_resizable_activities 1\nreboot';
const fwDone = () => store.get('fwDone', {}) || {};
function fwOpen(actions, what) {
  if (!A) { toast('Aperçu : ouvrirait ' + what); return; }
  try { if (A.openAction) for (const a of actions) if (A.openAction(a)) return; } catch (e) { /* écran absent sur cet autoradio */ }
  try { A.openSettings(''); toast('Écran introuvable : cherche « ' + what + ' » dans les Paramètres'); } catch (e) { toast('Impossible d\'ouvrir les Paramètres'); }
}
function fwCopy() {
  let ok = false;
  try { const t = document.createElement('textarea'); t.value = FW_CMDS; t.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(t); t.select(); ok = document.execCommand('copy'); t.remove(); } catch (e) { ok = false; }
  if (!ok && navigator.clipboard) { navigator.clipboard.writeText(FW_CMDS).then(() => toast('Commandes copiées'), () => toast('Copie impossible : recopie-les à la main')); return; }
  toast(ok ? 'Commandes copiées : colle-les dans LADB ou aShell' : 'Copie impossible : recopie-les à la main');
}
function fwStep(p, n, title, txt, btn, done) {
  const on = !!fwDone()[n];
  return `<div style="${box(p, 'padding:12px 14px;display:flex;gap:14px;align-items:flex-start')}">
    <button data-act="fw:tick:${n}" aria-label="Étape ${n} faite" style="flex:none;width:44px;height:44px;border-radius:50%;font-size:18px;font-weight:800;${on ? `background:#2E9E4D;color:#fff` : `background:${p.acc};color:${p.onAcc}`}">${on ? '✓' : n}</button>
    <div style="flex:1;min-width:0"><div style="font-size:16px;font-weight:700">${title}</div><div style="font-size:13.5px;color:${p.mut};line-height:1.45;margin-top:3px">${txt}</div>
    ${btn ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">${btn}</div>` : ''}</div></div>`;
}
{ const nav = SETCATS.find((c) => c[0] === 'Navigation');
  if (nav) { const i = nav[1].findIndex((x) => x[0] === 'Cadre GPS'); nav[1].splice(i >= 0 ? i + 1 : 0, 0, ['Petite fenêtre GPS', (p) => {
    const m = gbMode(), st = m === 'cadre' ? ['#2E9E4D', 'Ça marche : ton GPS s\'ouvre dans le cadre.'] : m === 'plein' ? ['#E0312B', 'Pour l\'instant ton autoradio ouvre le GPS en plein écran.'] : ['#9A9BA3', 'Pas encore testé.'];
    return `<div class="colns" style="display:flex;flex-direction:column;gap:10px;max-width:920px">
    <div style="display:flex;align-items:center;gap:10px;font-size:14px"><span style="width:12px;height:12px;border-radius:50%;background:${st[0]}"></span><b>${st[1]}</b></div>
    <div style="font-size:13px;color:${p.mut};line-height:1.45">Android ne laisse pas une appli changer seule ces réglages ni redémarrer l'autoradio : chaque bouton t'emmène directement au bon écran. Touche le numéro quand l'étape est faite.</div>
    ${fwStep(p, 1, 'Activer le mode développeur', 'Dans « À propos », touche <b>7 fois</b> « Numéro de build » jusqu\'au message « Vous êtes développeur » (code de l\'autoradio s\'il le demande). Puis reviens ici avec la touche Retour.', chipBtn(p, 'fw:about', 'Ouvrir « À propos »', true))}
    ${fwStep(p, 2, 'Activer les fenêtres libres', 'Dans les options pour les développeurs, tout en bas (partie Applications), active :<br>• <b>« Activer les fenêtres en mode libre »</b><br>• <b>« Forcer possibilité de redimensionner les activités »</b> (le nom varie un peu selon la version)<br>Ne touche pas aux autres réglages.', chipBtn(p, 'fw:dev', 'Ouvrir les options développeur', true))}
    ${fwStep(p, 3, 'Redémarrer l\'autoradio', 'L\'appli n\'a pas le droit de le faire (réservé au système). Fais un vrai redémarrage : appui long sur le bouton marche/arrêt de l\'autoradio, puis « Redémarrer ». Couper le contact ne suffit souvent pas : beaucoup d\'autoradios se mettent seulement en veille.', '')}
    ${fwStep(p, 4, 'Tester', 'Ferme d\'abord le GPS s\'il est déjà ouvert (sinon Android le ramène en grand tel quel), puis essaie de l\'ouvrir dans le cadre. S\'il s\'ouvre encore en grand alors qu\'il était fermé, ton autoradio ne permet pas la petite fenêtre : le cadre restera en plein écran.', chipBtn(p, 'gb:kill', 'Fermer le GPS') + chipBtn(p, 'fw:test', 'Tester maintenant', true))}
    <div style="${box(p, 'padding:12px 14px')}"><div style="font-size:15px;font-weight:700">Tout d'un coup (avancé)</div>
      <div style="font-size:13px;color:${p.mut};line-height:1.45;margin:4px 0 8px">Les étapes 2 et 3 en une fois, avec un terminal ADB : l'appli LADB ou Shizuku + aShell sur l'autoradio (débogage sans fil, Wi-Fi nécessaire), ou un PC avec « adb shell ». Le mode développeur (étape 1) reste à faire à la main.</div>
      <pre style="margin:0 0 8px;padding:10px 12px;border-radius:10px;background:#00000055;font:600 14px/1.5 ui-monospace,Consolas,monospace;white-space:pre-wrap;user-select:text;-webkit-user-select:text">${esc(FW_CMDS)}</pre>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${chipBtn(p, 'fw:copy', 'Copier les commandes', true)}</div>
      <div style="font-size:12px;color:${p.mut};margin-top:8px">Pour revenir en arrière : mêmes commandes avec 0 à la place de 1, ou désactive les deux options à la main.</div></div>
    </div>`; }]); } }
{ const a1 = window.act; window.act = function (a, long) {
  if (a.indexOf('fw:') === 0) { const [, op, x] = a.split(':');
    if (op === 'open') { openSet('Navigation', 'Petite fenêtre GPS'); return; }
    if (op === 'about') { fwOpen(['android.settings.DEVICE_INFO_SETTINGS'], 'À propos'); return; }
    if (op === 'dev') { fwOpen(['android.settings.APPLICATION_DEVELOPMENT_SETTINGS'], 'Options pour les développeurs'); return; }
    if (op === 'tick') { const d = fwDone(); d[x] = !d[x]; store.set('fwDone', d); render(); return; }
    if (op === 'copy') { fwCopy(); return; }
    if (op === 'test') { store.set('gbMode', ''); gbFail = false; gbKey = ''; tab = 'home'; homePage = 0; render();
      setTimeout(() => { if (document.querySelector('#screen .gpsbox') && gbRect()) gbLaunch(true); else toast('Mets le cadre GPS sur la 1re page de l\'accueil pour tester'); }, 500); return; }
    return; }
  return a1.apply(this, arguments); }; }

// ================= 26. Diagnostic et rapport (Paramètres › Système › Diagnostic et rapport) =================
// Cherche ce qui ne va pas (cadre GPS, boîtier CAN, GPS, réseau, autorisations, erreurs), explique quoi faire,
// et prépare un rapport à envoyer par e-mail / WhatsApp / copier / photographier. Pas de position exacte,
// pas d'adresses, pas de trajets ni de clé dans le rapport.
function dlogAdd(kind, msg) {
  try {
    const L = window.__dlog || (window.__dlog = (store.get('diagLog', []) || []).slice(-80)), now = Date.now(), last = L[L.length - 1]; msg = String(msg).slice(0, 240);
    if (last && last.k === kind && last.m === msg && now - last.t < 60000) { last.n = (last.n || 1) + 1; last.t = now; }
    else { L.push({ t: now, k: kind, m: msg }); if (L.length > 80) L.splice(0, L.length - 80); }
    clearTimeout(window.__dlogT); window.__dlogT = setTimeout(() => { try { store.set('diagLog', L); } catch (e) { /* plein */ } }, 1500);
  } catch (e) { /* le journal ne doit jamais gêner */ }
}
window.addEventListener('error', (e) => dlogAdd('erreur', `${e.message || 'erreur'} @${String(e.filename || '').split('/').pop()}:${e.lineno || 0}`));
window.addEventListener('unhandledrejection', (e) => dlogAdd('erreur', 'promesse : ' + ((e.reason && (e.reason.message || e.reason)) || '?')));
document.addEventListener('visibilitychange', () => dlogAdd('écran', document.hidden ? 'accueil caché (une autre appli est devant)' : 'accueil visible'));
{ const r0 = window.onResumeHome; window.onResumeHome = function () { dlogAdd('écran', 'retour sur l\'accueil'); return r0 ? r0.apply(this, arguments) : undefined; }; }
{ const k0 = window.onHomeKey; window.onHomeKey = function () { dlogAdd('écran', 'touche Accueil'); return k0 ? k0.apply(this, arguments) : undefined; }; }
{ const h1 = window.http; window.http = function (url) { return h1(url).then((r) => { if (!r || !r.ok) { let host = '?'; try { host = new URL(url).host; } catch (e) { /* url bizarre */ } dlogAdd('réseau', `${host} : ${String(r && r.b || 'échec').slice(0, 80)}`); } return r; }); }; }
dlogAdd('appli', 'démarrage v' + APP_VERSION);

const DG_HELPERS = { 'com.draco.ladb': 'LADB', 'moe.shizuku.privileged.api': 'Shizuku', 'in.sunilpaulmathew.ashell': 'aShell', 'com.farmerbb.taskbar': 'Taskbar', 'com.topjohnwu.magisk': 'Magisk', 'io.github.huskydg.magisk': 'Magisk Delta', 'com.termux': 'Termux' };
const DG_BRIDGE = ['apps', 'icon', 'launch', 'launchIn', 'openUrl', 'openSettings', 'openAction', 'qfStatus', 'sysStatus', 'canAutoStart', 'isDefaultHome', 'notifAccess', 'immersive', 'setImmersive', 'media', 'http', 'ready'];
let dgRep = null, dgBusy = false, dgView = false;
const dgSafe = (f, d = null) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
const dgAge = (t) => { if (!t) return 'jamais'; const s = Math.round((Date.now() - t) / 1000); return s < 60 ? `il y a ${s} s` : s < 3600 ? `il y a ${Math.round(s / 60)} min` : `il y a ${Math.round(s / 3600)} h`; };
function dgSys() {
  const ua = navigator.userAgent || '', an = ua.match(/Android ([\d.]+)/), dv = ua.match(/Android [\d.]+; ([^;)]+?)(?: Build\/([^;)]+))?[;)]/), ch = ua.match(/Chrome\/([\d.]+)/);
  let bytes = 0, keys = 0; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); keys++; bytes += (k.length + (localStorage.getItem(k) || '').length) * 2; } } catch (e) { /* inaccessible */ }
  return { android: an ? an[1] : '?', modele: dv ? dv[1].trim() : '?', build: dv && dv[2] ? dv[2] : '?', webview: ch ? ch[1] : '?', ecran: `${screen.width}×${screen.height} (×${devicePixelRatio})`, fenetre: `${innerWidth}×${innerHeight}`, langue: navigator.language || '?', stock: `${keys} clés, ${(bytes / 1048576).toFixed(2)} Mo`, stockMo: bytes / 1048576 };
}
async function dgNet() {
  const T = [['Internet', 'https://www.google.com/generate_204', true], ['Météo (Open-Meteo)', 'https://api.open-meteo.com/v1/forecast?latitude=48.85&longitude=2.35&current=temperature_2m'],
    ['Limitations (Overpass)', 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent('[out:json][timeout:8];node(1);out;')], ['Adresses (Nominatim)', 'https://nominatim.openstreetmap.org/status.php?format=json'],
    ['Prix carburant (data.economie)', 'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records?limit=1']];
  return Promise.all(T.map(async ([n, u, raw]) => { const t0 = Date.now(); let r; try { r = await (raw && typeof _http === 'function' ? _http(u) : http(u)); } catch (e) { r = { ok: false, b: String(e) }; }
    return { n, ok: !!(r && r.ok), ms: Date.now() - t0, err: r && !r.ok ? String(r.b || 'échec').slice(0, 70) : '' }; }));
}
const DG_GPS = ['com.waze', 'com.google.android.apps.maps', 'com.sygic.aura', 'com.tomtom.gplay.navapp', 'com.here.app.maps', 'net.osmand.plus', 'net.osmand', 'app.organicmaps', 'com.mapswithme.maps.pro', 'com.huawei.maps.app', 'com.coyotesystems.android', 'ru.yandex.yandexnavi'];
let dgStep = '';
function dgRedraw() { if (tab === 'settings') { try { render(); } catch (e) { /* rien */ } } if (welEl) { welKey = ''; welDraw(); } }
const dgDead = () => { const apps = dgSafe(() => allApps(), []) || []; if (!A || apps.length < 4) return []; const c = dgSafe(() => fCfg(), null); if (!c) return []; return [...appsOnScreen(c)].filter((pk) => !apps.some((a) => a.p === pk)); };
// Corrections sûres, faites sans rien demander (aussi en silence au démarrage). Rien n'est supprimé de tes données.
function dgAutoFix() {
  const fixed = [], apps = dgSafe(() => allApps(), []) || [], has = (pk) => apps.some((a) => a.p === pk), real = !!A && apps.length > 3;
  if (real) { const pk = gbPk(); if (!has(pk)) { const alt = DG_GPS.find(has); if (alt) { store.set('gbApp', alt); fixed.push(`Appli GPS « ${pk} » désinstallée → remplacée par ${gbName(alt)}.`); } } }
  if (real) DOCK_ALL.filter((d) => !d.special).forEach((d) => { const c = store.get('dock_' + d.id, ''); if (c && !has(c)) { store.set('dock_' + d.id, ''); fixed.push(`Bouton « ${d.label} » de la barre du bas : son appli a été désinstallée → remis en automatique.`); } });
  if (store.get('ffAuto', false) && gbMode() === 'plein') { store.set('ffAuto', false); fixed.push('Ancienne ouverture automatique du GPS coupée : elle l\'ouvrait en plein écran.'); }
  const lum = Number(store.get('lum', 100)); if (lum > 0 && lum < 15) { store.set('lum', 100); try { lumApply(); } catch (e) { /* rien */ } fixed.push(`Luminosité de l'appli à ${lum} % (écran presque noir) → remise à 100 %.`); }
  const c = dgSafe(() => fCfg(), null);
  if (c) { let n = 0; c.pages.forEach((pg) => { for (let i = pg.length - 1; i >= 0; i--) { const it = pg[i]; if (it.t !== 'w') continue; const okB = (it.b || []).filter((x) => GBLOCKS[x]); if (!okB.length) { pg.splice(i, 1); n++; } else if (okB.length !== it.b.length) { it.b = okB; n++; } } });
    if (n) { fSave(c); fixed.push(`${n} widget(s) d'un ancien type retiré(s) de l'accueil (ils restaient vides).`); } }
  fixed.forEach((f) => dlogAdd('correction', f));
  return fixed;
}
async function dgRun(src) {
  if (dgBusy) return; dgBusy = true; dgStep = 'Corrections automatiques…'; dgRedraw();
  const F = [], ok = (t) => F.push({ lvl: 'ok', t }), fixd = (t) => F.push({ lvl: 'fix', t }), info = (t) => F.push({ lvl: 'info', t }),
    todo = (t, fix, btn) => F.push({ lvl: 'todo', t, fix: fix || '', btn: btn || null }), bad = (t, fix) => F.push({ lvl: 'bad', t, fix: fix ? (/:\s*$/.test(fix) ? fix.replace(/\s*$/, ' ') + 'envoie-moi le rapport.' : fix + ' Envoie-moi le rapport.') : 'Envoie-moi le rapport.' });
  try {
    dgAutoFix().forEach(fixd);
    dgStep = 'Autoradio et réglages…'; dgRedraw();
    const sys = dgSys(), apps = dgSafe(() => allApps(), []) || [], has = (pk) => apps.some((a) => a.p === pk);
    const br = A ? DG_BRIDGE.filter((n) => typeof A[n] === 'function') : [];
    const qf = A && A.qfStatus ? dgSafe(() => JSON.parse(A.qfStatus()), null) : null, sy = A && A.sysStatus ? dgSafe(() => JSON.parse(A.sysStatus()), null) : null;
    const isHome = A && A.isDefaultHome ? dgSafe(() => A.isDefaultHome(), null) : null, notif = A && A.notifAccess ? dgSafe(() => A.notifAccess(), null) : null, auto = A && A.canAutoStart ? dgSafe(() => A.canAutoStart(), null) : null;
    const pk = gbPk(), mode = gbMode(), helpers = Object.keys(DG_HELPERS).filter(has).map((k) => DG_HELPERS[k]), fw = fwDone();
    const boxOn = dgSafe(() => fCfg().pages.some((pg) => pg.some((it) => (it.b || []).includes('gpsbox'))), false), dead = dgDead();
    if (!A) info('Aperçu sur ordinateur : pas d\'autoradio branché, beaucoup de tests sont impossibles ici.');
    if (isHome === false) todo('Accueil 2008 GT n\'est pas le lanceur officiel : la touche Accueil ouvre un autre écran.', 'Choisis « Accueil 2008 GT » puis « Toujours ».', ['dg:open:home', 'Définir']);
    else if (isHome) ok('Lanceur officiel : l\'autoradio démarre sur cet écran.');
    if (auto === false) todo('Démarrage automatique au contact : pas autorisé.', 'Autorise l\'affichage par-dessus les autres applis.', ['dg:open:overlay', 'Régler']);
    if (notif === false) todo('Musique : accès aux notifications pas autorisé (titres et pochettes absents).', '', ['dg:open:notif', 'Autoriser']);
    // --- cadre GPS
    if (A && !br.includes('launchIn')) bad('Le module Java de l\'appli ne sait pas ouvrir une appli dans une fenêtre (fonction launchIn absente).');
    if (A && apps.length > 3 && !DG_GPS.some(has)) todo('Aucune appli GPS installée.', 'Installe Waze (ou Google Maps).', ['dg:store:com.waze', 'Installer Waze']);
    if (!boxOn) info('Le cadre GPS n\'est sur aucune page de l\'accueil (ajoute le widget « Cadre GPS » si tu le veux).');
    else if (mode === 'plein') { if (fw[1] && fw[2] && fw[3]) bad('Le GPS s\'ouvre toujours en plein écran alors que les étapes de l\'assistant sont faites : le système de l\'autoradio bloque la petite fenêtre.', helpers.some((h) => /LADB|Shizuku|aShell/.test(h)) ? `Tu as ${helpers.join(', ')} : essaie aussi les 3 commandes de l'assistant.` : '');
      else todo('Le GPS s\'ouvre en plein écran : la petite fenêtre n\'est pas activée.', 'Suis l\'assistant « Petite fenêtre GPS » (4 étapes).', ['fw:open', 'Assistant']); }
    else if (mode === 'cadre') { const fl = gbFlip();
      if (fl) todo(`Cadre GPS : ${gbName(pk)} est passé en plein écran juste après l'ouverture dans le cadre (${fl.n > 1 ? fl.n + ' fois' : '1 fois'}). Il était sans doute déjà ouvert en grand.`, `Ferme ${gbName(pk)} (Forcer l'arrêt), puis « Ouvrir ici » dans le cadre.`, ['gb:kill', 'Fermer ' + gbName(pk)]);
      else ok('Cadre GPS : le GPS s\'ouvre bien dans la petite fenêtre.'); }
    else todo('Cadre GPS : pas encore testé sur cet autoradio.', 'Le test ouvre le GPS : reviens ensuite sur l\'accueil.', ['fw:test', 'Tester']);
    if (dead.length) todo(`${dead.length} icône(s) d'appli désinstallée(s) sur l'accueil (elles n'ouvrent plus rien).`, dead.slice(0, 4).join(', '), ['dg:rmdead', 'Les retirer']);
    // --- voiture
    dgStep = 'Boîtier CAN et GPS…'; dgRedraw();
    if (A) {
      if (qf && qf.bound === false) bad('Service du boîtier CAN de l\'autoradio introuvable.', 'Redémarre l\'autoradio ; si ça continue :');
      else if (car && Date.now() - car.ts < 15000) ok(`Boîtier CAN : données reçues (${dgAge(car.ts)}).`);
      else if (carEver) info(`Boîtier CAN : plus de données depuis ${dgAge(car && car.ts)} (normal moteur coupé).`);
      else bad('Boîtier CAN : aucune donnée reçue sur cet autoradio.', 'Mets le contact et relance ; si ça continue :');
      if (car && !(+car.batt > 5) && !(learned && learned.batt)) info('Tension batterie : pas envoyée par le boîtier CAN.');
      if (car && Date.now() - car.ts < 15000 && !(val(car.fuel) > 0.5)) info('Niveau d\'essence : pas envoyé par le boîtier CAN (le plein ne peut pas être détecté tout seul ; le bouton ⛽ Plein marche quand même).');
    }
    const yr = new Date().getFullYear(); if (yr < 2025 || yr > 2040) todo(`L'heure de l'autoradio est fausse (année ${yr}) : trajets, rappels et bilans seront faux.`, '', ['dg:act:android.settings.DATE_SETTINGS', 'Régler l\'heure']);
    if (!loc) todo('GPS : aucune position reçue.', 'Vérifie que la localisation est activée et autorisée pour l\'appli.', ['dg:open:location', 'Localisation']);
    else if (Date.now() - loc.ts > 60000) info(`GPS : dernière position ${dgAge(loc.ts)} (normal dans un parking couvert).`);
    else if (loc.acc > 50) info(`GPS : précision faible (${Math.round(loc.acc)} m).`);
    else ok(`GPS : position reçue ${dgAge(loc.ts)}, précision ${Math.round(loc.acc || 0)} m.`);
    // --- réseau (avec un 2e essai automatique)
    dgStep = 'Internet et services…'; dgRedraw();
    let net = await dgNet();
    if (net[0].ok && net.some((x, i) => i && !x.ok)) { dgStep = 'Nouvel essai des services…'; dgRedraw(); await new Promise((r) => setTimeout(r, 2500)); const again = await dgNet(); net = net.map((x, i) => (!x.ok && again[i].ok ? Object.assign({}, again[i], { retried: true }) : x)); }
    if (!net[0].ok) todo('Pas d\'Internet : météo, limitations, stations et fond de carte indisponibles.', 'Vérifie le Wi-Fi ou le partage de connexion du téléphone.', ['dg:wifi', 'Wi-Fi']);
    else { net.filter((x) => x.retried).forEach((x) => fixd(`${x.n} ne répondait pas → nouvel essai : ça répond.`)); const ko = net.slice(1).filter((x) => !x.ok);
      if (ko.length) ko.forEach((x) => info(`${x.n} : ne répond pas pour l'instant (${x.err}). Souvent temporaire.`)); else ok('Internet et services en ligne : tout répond.'); }
    // --- erreurs de l'appli
    const L = window.__dlog || store.get('diagLog', []) || [], errs = L.filter((x) => x.k === 'erreur' && Date.now() - x.t < 86400000);
    if (errs.length) bad(`${errs.length} erreur(s) dans l'appli ces dernières 24 h.`, 'Je ne peux pas les corriger d\'ici :');
    else ok('Aucune erreur de l\'appli enregistrée.');
    if (sys.stockMo > 4) todo(`Mémoire de l'appli presque pleine (${sys.stock}).`, 'Efface de vieux parcours.', ['tab:tracks', 'Parcours']);
    // --- rapport texte
    const d = new Date(), pad = (n) => String(n).padStart(2, '0'), ico = { ok: '✓', fix: '🔧', todo: '!', bad: '✗', info: 'ℹ' }, cnt = (l) => F.filter((f) => f.lvl === l).length;
    const lines = [`RAPPORT ACCUEIL 2008 GT v${APP_VERSION} — ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`,
      `Bilan : ${cnt('ok')} OK · ${cnt('fix')} corrigé(s) · ${cnt('todo')} à faire · ${cnt('bad')} à envoyer`, '',
      '== Ce que la vérification a trouvé ==', ...F.map((f) => `${ico[f.lvl]} ${f.t}${f.fix ? '\n   → ' + f.fix : ''}`), '',
      '== Autoradio ==', `Android ${sys.android} · modèle ${sys.modele} · build ${sys.build}`, `WebView ${sys.webview} · écran ${sys.ecran} · fenêtre ${sys.fenetre} · ${sys.langue}`, `Stockage appli : ${sys.stock}`,
      `Pont Java : ${A ? br.join(', ') : 'absent (aperçu)'}`, `Lanceur officiel : ${isHome == null ? '?' : isHome ? 'oui' : 'non'} · notifications : ${notif == null ? '?' : notif ? 'oui' : 'non'} · démarrage auto : ${auto == null ? '?' : auto ? 'oui' : 'non'}`,
      `Réseau (autoradio) : ${sy ? JSON.stringify(sy) : '?'}`, '',
      '== Cadre GPS ==', `Appli : ${pk} (${has(pk) ? 'installée' : 'NON installée'}) · mode : ${mode || 'pas testé'} · ouverture auto : ${store.get('gbAuto', false) ? 'oui' : 'non'} · cadre sur l'accueil : ${boxOn ? 'oui' : 'non'} · assistant : ${[1, 2, 3, 4].map((k) => (fw[k] ? k : '-')).join('')}`,
      `Disposition : ${dgSafe(() => (store.get('layout_' + profIdx(), 'custom')), '?')} · thème : ${dgSafe(() => themeIdFor(profIdx()), '?')}`, '',
      '== Voiture (boîtier CAN) ==', `Service : ${qf ? JSON.stringify(qf) : '?'}`,
      car ? `Dernière trame ${dgAge(car.ts)} : ` + ['speed', 'rpm', 'odo', 'fuel', 'range', 'ign', 'lo', 'hi', 'handbrake', 'avg1', 'cur1', 'batt'].filter((k) => car[k] != null).map((k) => `${k}=${car[k]}`).join(' ') : 'Aucune trame reçue',
      car ? `Champs reçus : ${Object.keys(car).filter((k) => car[k] != null && k !== 'raw').join(', ')}` : '', car && car.raw ? `Octets bruts : ${[].concat(car.raw).join(' ')}` : '',
      `Appris (apprentissage) : ${Object.keys(store.get('carLearn', {}) || {}).join(', ') || 'rien'} · lu sur l'ordinateur de bord : ${Object.keys(learned || {}).join(', ') || 'rien'}`, '',
      '== GPS ==', loc ? `Position ${dgAge(loc.ts)} · précision ${Math.round(loc.acc || 0)} m · vitesse ${Math.round(loc.spd || 0)} km/h` : 'Aucune position', '',
      '== Services en ligne ==', ...net.map((x) => `${x.ok ? '✓' : '✗'} ${x.n} (${x.ms} ms)${x.retried ? ' (2e essai)' : ''}${x.err ? ' : ' + x.err : ''}`), '',
      '== Réglages ==', [`alerte vitesse ${SPA.on() ? 'oui' : 'non'} (marge ${SPA.tol()} km/h, son ${SPA.snd() ? 'oui' : 'non'})`, `nuit ${store.get('nightMode', 'auto')}`, `luminosité ${store.get('lum', 100)} %`, `carburant ${store.get('fuel', 'E10')}`, `clé Allemagne ${store.get('tkKey', '') ? 'oui' : 'non'}`, `tension ${store.get('voltShow', true) ? 'affichée' : 'cachée'}`, `fenêtres flottantes ${store.get('ffAuto', false) ? 'auto' : 'non'}`, `parcours ${trkIndex().length}`, `pleins ${(store.get('fuelLog', []) || []).length}`].join(' · '), '',
      `== Applis installées (${apps.length}) ==`, helpers.length ? `Outils trouvés : ${helpers.join(', ')}` : 'Outils (LADB, Shizuku, aShell, Magisk…) : aucun', apps.map((a) => a.p).join(', '), '',
      '== Journal (derniers événements) ==', ...L.slice(-30).map((x) => { const t = new Date(x.t); return `${pad(t.getDate())}/${pad(t.getMonth() + 1)} ${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())} [${x.k}] ${x.m}${x.n > 1 ? ` (×${x.n})` : ''}`; })];
    dgRep = { at: Date.now(), src: src || '', F, text: lines.filter((x) => x !== '').join('\n').replace(/\n(?===)/g, '\n\n') };
    store.set('diagLast', dgRep); dlogAdd('appli', `vérification : ${cnt('fix')} corrigé(s), ${cnt('todo')} à faire, ${cnt('bad')} à envoyer`);
  } catch (e) { dlogAdd('erreur', 'diagnostic : ' + (e && e.message || e)); dgRep = { at: Date.now(), F: [{ lvl: 'bad', t: 'La vérification elle-même a planté : ' + (e && e.message || e), fix: 'Envoie-moi le rapport.' }], text: 'Vérification interrompue : ' + (e && e.stack || e) }; }
  dgBusy = false; dgStep = ''; dgRedraw();
}
function dgSend(how) {
  const r = dgRep || store.get('diagLast', null); if (!r) { toast('Lance d\'abord le diagnostic'); return; }
  const subj = 'Rapport Accueil 2008 GT v' + APP_VERSION, body = r.text.length > 9000 ? r.text.slice(0, 9000) + '\n… (rapport coupé : utilise Copier pour le texte complet)' : r.text;
  if (how === 'copy') { let ok = false; try { const t = document.createElement('textarea'); t.value = r.text; t.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(t); t.select(); ok = document.execCommand('copy'); t.remove(); } catch (e) { ok = false; } toast(ok ? 'Rapport copié' : 'Copie impossible : utilise « Afficher » et prends une photo'); return; }
  const url = how === 'wa' ? 'whatsapp://send?text=' + encodeURIComponent(subj + '\n\n' + body) : `mailto:?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
  window.__lastDiag = url;
  if (!A) { toast(how === 'wa' ? 'Aperçu : WhatsApp s\'ouvrirait avec le rapport' : 'Aperçu : la messagerie s\'ouvrirait avec le rapport'); return; }
  let ok = false; try { ok = A.openUrl(url) !== false; } catch (e) { ok = false; }
  if (!ok) toast(how === 'wa' ? 'WhatsApp n\'est pas installé : essaie l\'e-mail, Copier ou Afficher (photo)' : 'Pas d\'appli e-mail sur l\'autoradio : essaie WhatsApp, Copier ou Afficher (photo)');
}
const DG_COL = { ok: '#2E9E4D', fix: '#2F7DE1', todo: '#F2A23A', bad: '#E0312B', info: '#7C7F88' }, DG_ICO = { ok: '✓', fix: '🔧', todo: '!', bad: '✗', info: 'i' };
function dgSum(r) { const c = (l) => r.F.filter((f) => f.lvl === l).length; return [['ok', `${c('ok')} OK`], ['fix', `${c('fix')} corrigé${c('fix') > 1 ? 's' : ''} tout seul`], ['todo', `${c('todo')} à faire`], ['bad', `${c('bad')} à m'envoyer`]].filter(([l], i) => i === 0 || c(l)); }
function dgItem(p, f) {
  return `<div style="display:flex;gap:12px;align-items:center;padding:8px 0;border-bottom:1px solid ${p.light ? '#0000000f' : '#ffffff12'}"><span style="flex:none;width:26px;height:26px;border-radius:50%;background:${DG_COL[f.lvl]};color:#fff;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:13px">${DG_ICO[f.lvl]}</span>
    <div style="flex:1;min-width:0"><div style="font-size:14.5px;font-weight:600${f.lvl === 'bad' ? ';color:#FF6B6B' : ''}">${esc(f.t)}</div>${f.fix ? `<div style="font-size:13px;color:${p.mut};margin-top:2px">→ ${esc(f.fix)}</div>` : ''}</div>
    ${f.btn ? chipBtn(p, f.btn[0], f.btn[1], true) : ''}</div>`;
}
{ const sys = SETCATS.find((c) => c[0] === 'Système');
  if (sys) sys[1].push(['Diagnostic et rapport', (p) => {
    const r = dgRep || store.get('diagLast', null), order = { bad: 0, todo: 1, fix: 2, info: 3, ok: 4 };
    const list = r ? r.F.slice().sort((x, y) => order[x.lvl] - order[y.lvl]).map((f) => dgItem(p, f)).join('') : '', hasBad = r && r.F.some((f) => f.lvl === 'bad');
    return `<div class="colns" style="display:flex;flex-direction:column;gap:10px;max-width:920px">
      <div style="font-size:13px;color:${p.mut};line-height:1.45">La vérification contrôle le cadre GPS, le boîtier CAN, le GPS, Internet et les services, les autorisations et les erreurs de l'appli. Ce qu'elle peut corriger, elle le corrige toute seule (🔧). Ce qui demande un réglage d'Android est en orange, avec le bouton pour y aller. Ce qu'elle ne peut pas corriger est en rouge : envoie-moi le rapport. Le rapport ne contient ni ta position exacte, ni tes adresses, ni tes trajets, ni ta clé.</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">${chipBtn(p, 'dg:run', dgBusy ? 'Vérification en cours…' : r ? 'Relancer la vérification' : 'Lancer la vérification', true)}${dgBusy ? `<span style="font-size:13px;color:${p.mut}">${esc(dgStep)}</span>` : ''}</div>
      ${r ? `<div style="${box(p, 'padding:8px 14px')}"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:4px 0 6px"><span style="font-size:12px;color:${p.mut};margin-right:4px">Résultat ${dgAge(r.at)} :</span>${dgSum(r).map(([l, t]) => `<span style="padding:3px 10px;border-radius:20px;font-size:12.5px;font-weight:700;background:${DG_COL[l]}26;color:${DG_COL[l]}">${t}</span>`).join('')}</div>${list}</div>
      <div style="${box(p, 'padding:12px 14px')}"><div style="font-size:15px;font-weight:700;margin-bottom:4px">${hasBad ? 'Envoie-moi le rapport' : 'Envoyer le rapport'}</div><div style="font-size:13px;color:${p.mut};margin-bottom:8px">Envoie-le-toi, puis colle-le dans notre conversation (ou envoie une photo de l'écran « Afficher »).</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">${chipBtn(p, 'dg:mail', 'Par e-mail', true)}${chipBtn(p, 'dg:wa', 'Par WhatsApp')}${chipBtn(p, 'dg:copy', 'Copier')}${chipBtn(p, 'dg:view', 'Afficher (photo)')}</div></div>` : ''}
    </div>`; }]); }
// grand affichage du rapport, pour le prendre en photo
{ const r1 = window.render; window.render = function () { const out = r1.apply(this, arguments); const old = document.getElementById('dgView'); if (old) old.remove();
  if (dgView) { const r = dgRep || store.get('diagLast', null); const el = document.createElement('div'); el.id = 'dgView';
    el.style.cssText = 'position:absolute;inset:0;z-index:2600;background:#0B0C10;color:#F2F2F4;display:flex;flex-direction:column;padding:16px 22px;gap:10px';
    el.innerHTML = `<div style="display:flex;align-items:center;gap:10px"><b style="font-size:18px;flex:1">Rapport — fais défiler et prends des photos</b><button data-act="dg:viewx" style="height:44px;padding:0 18px;border-radius:12px;background:#ffffff1a;color:#fff;font-size:15px;font-weight:600">Fermer</button></div>
      <pre class="scroll" style="flex:1;margin:0;white-space:pre-wrap;font:500 15px/1.45 ui-monospace,Consolas,monospace;user-select:text;-webkit-user-select:text">${esc(r ? r.text : 'Pas encore de rapport')}</pre>`;
    (document.getElementById('stage') || document.body).appendChild(el); }
  return out; }; }
{ const a1 = window.act; window.act = function (a, long) {
  if (a.indexOf('dg:') === 0) { const op = a.slice(3);
    if (op === 'run') { dgRun('page'); return; }
    if (op.indexOf('open:') === 0) { if (A) { try { A.openSettings(op.slice(5)); } catch (e) { toast('Réglage introuvable'); } } else toast('Réglage Android (sur l\'autoradio) : ' + op.slice(5)); return; }
    if (op.indexOf('act:') === 0) { fwOpen([op.slice(4)], 'Date et heure'); return; }
    if (op === 'wifi') { if (typeof sysOpen === 'function') sysOpen('wifi'); return; }
    if (op.indexOf('store:') === 0) { const pk = op.slice(6); if (!A) { toast('Aperçu : ouvrirait le Play Store'); return; } let ok = false; try { ok = A.openUrl('market://details?id=' + pk) !== false; } catch (e) { ok = false; } if (!ok) { try { A.openUrl('https://play.google.com/store/apps/details?id=' + pk); } catch (e) { /* rien */ } } return; }
    if (op === 'rmdead') { const dead = dgDead(), c = fCfg(); let n = 0; c.pages.forEach((pg) => { for (let i = pg.length - 1; i >= 0; i--) { const it = pg[i]; if (it.t === 'a' && dead.includes(it.p)) { pg.splice(i, 1); n++; } else if (it.t === 'f') { const k = it.apps.length; it.apps = it.apps.filter((x) => !dead.includes(x)); n += k - it.apps.length; if (!it.apps.length) pg.splice(i, 1); } } });
      fSave(c); dlogAdd('correction', `${n} icône(s) d'appli désinstallée(s) retirée(s) de l'accueil`); toast(n ? `${n} icône(s) retirée(s)` : 'Rien à retirer'); if (dgRep) { dgRep.F = dgRep.F.filter((f) => f.btn == null || f.btn[0] !== 'dg:rmdead'); dgRep.F.push({ lvl: 'fix', t: `${n} icône(s) d'appli désinstallée(s) retirée(s) de l'accueil.` }); } render(); return; }
    if (op === 'open') { openSet('Système', 'Diagnostic et rapport'); return; }
    if (op === 'mail') { dgSend('mail'); return; }
    if (op === 'wa') { dgSend('wa'); return; }
    if (op === 'copy') { dgSend('copy'); return; }
    if (op === 'view') { dgView = true; render(); return; }
    if (op === 'viewx') { dgView = false; render(); return; }
    return; }
  return a1.apply(this, arguments); }; }
// accès direct depuis l'assistant « Petite fenêtre GPS »
{ const nav = SETCATS.find((c) => c[0] === 'Navigation'), it = nav && nav[1].find((x) => x[0] === 'Petite fenêtre GPS');
  if (it) { const f0 = it[1]; it[1] = (p) => f0(p).replace(/<\/div>\s*$/, `<div style="${box(p, 'padding:12px 14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap')}"><div style="flex:1;min-width:240px"><div style="font-size:15px;font-weight:700">Ça ne marche toujours pas ?</div><div style="font-size:13px;color:${p.mut}">Le diagnostic cherche le problème et prépare un rapport à m'envoyer.</div></div>${chipBtn(p, 'dg:open', 'Diagnostic et rapport', true)}</div></div>`); } }

// ================= 27. Vérification proposée sur l'écran de bienvenue (une seule fois) + corrections au démarrage =================
setTimeout(() => { if (!A) return; const f = dgAutoFix(); if (f.length) toast('🔧 Corrigé automatiquement : ' + f[0] + (f.length > 1 ? ` (+${f.length - 1} autre${f.length > 2 ? 's' : ''})` : '')); }, 7000);
let dgWel = false;                                   // vérification lancée depuis CET écran de bienvenue
{ const w0 = window.welState; window.welState = function () { const st = w0.apply(this, arguments); st.dg = [store.get('dgWelDone', false), dgWel, dgBusy, dgStep, dgRep && dgRep.at]; return st; }; }
{ const d0 = window.welDraw; window.welDraw = function () {
  d0.apply(this, arguments);
  if (!welEl) return; const done = store.get('dgWelDone', false); if (done && !dgWel) return;
  const host = welEl.querySelector('div[style*="width:860px"]'); if (!host || host.querySelector('[data-dgrow]')) return;
  const p = curP || palette(), r = dgRep;
  const b = (act, t, pri) => `<button data-act="${act}" style="height:42px;padding:0 14px;border-radius:12px;font-size:14px;font-weight:700;white-space:nowrap;${pri ? `background:${p.acc};color:${p.onAcc}` : 'background:#ffffff24;color:#fff'}">${t}</button>`;
  let ico = '🛠', col = '#8fc1ff', title = 'Vérification de l\'autoradio', sub = 'Je vérifie le GPS, le boîtier de la voiture, Internet et les réglages, je corrige tout seul ce que je peux et je te dis le reste.', btns = b('wel:dg', 'Valider', true);
  if (dgBusy) { ico = '⏳'; title = 'Vérification en cours…'; sub = dgStep || 'Un instant…'; btns = ''; }
  else if (dgWel && r) {
    const c = (l) => r.F.filter((f) => f.lvl === l).length, nb = c('bad'), nt = c('todo'), nf = c('fix');
    ico = nb ? '✗' : nt ? '!' : '✓'; col = nb ? '#ff7b7b' : nt ? '#ffb84d' : '#9be07a'; title = nb ? `Vérification terminée : ${nb} problème${nb > 1 ? 's' : ''} à m'envoyer` : nt ? `Vérification terminée : ${nt} chose${nt > 1 ? 's' : ''} à faire` : 'Vérification terminée : tout est bon';
    sub = [`${c('ok')} OK`, nf ? `${nf} corrigé${nf > 1 ? 's' : ''} tout seul` : '', nt ? `${nt} à faire` : '', nb ? `${nb} à m'envoyer` : ''].filter(Boolean).join(' · ') + (nb ? ' — envoie-moi le rapport.' : '');
    btns = (nb ? b('wel:dgsend', 'Envoyer le rapport', true) : '') + b('wel:dgsee', 'Voir le détail', !nb);
  }
  const row = `<div data-dgrow style="display:flex;align-items:center;gap:12px;padding:7px 14px;border-radius:13px;background:#ffffff12;outline:1px solid ${col}55"><b style="flex:none;font-size:19px;color:${col}">${ico}</b><div style="flex:1;min-width:0"><div style="font-size:15px;font-weight:600">${title}</div><div style="font-size:12px;color:#c9cbd3;line-height:1.3">${esc(sub)}</div></div>${btns}</div>`;
  host.insertAdjacentHTML('afterbegin', row);
}; }
{ const a0 = window.welAct; window.welAct = function (v) {
  if (v === 'dg') { store.set('dgWelDone', true); dgWel = true; welLeft = -1; dlogAdd('appli', 'vérification validée sur l\'écran de bienvenue'); dgRun('bienvenue'); return; }
  if (v === 'dgsee') { welClose(); dgWel = false; openSet('Système', 'Diagnostic et rapport'); return; }
  if (v === 'dgsend') { dgSend('mail'); return; }
  if (v === 'go' || v.indexOf('prof:') === 0) dgWel = false;
  return a0.apply(this, arguments); }; }

// ================= 28. Le point au démarrage (Paramètres › Entretien › Le point au démarrage) =================
// Au démarrage (lancement, réveil après une longue veille, contact remis après 10 min), une fenêtre montre seulement ce qui
// demande ton attention : pense-bêtes, autonomie basse + station la moins chère, vigilance / pluie, pneus du mois, entretien
// proche, résumé d'hier (1re fois de la journée). Rien à dire : rien ne s'affiche. Se ferme seule après 15 s ou dès que tu roules.
function brfMode() { return store.get('brfMode', 'each'); }               // each : chaque démarrage · day : 1 fois par jour · off : jamais
function memoList() { return (store.get('memos', []) || []).filter((m) => m && m.id && m.txt); }
const BRF_TONE = { warn: ['#3A2A12', '#F0B060'], ok: ['#1F3A14', '#B6DD8C'], bad: ['#4A1714', '#F7B4AE'], info: ['#16263D', '#8FB8EA'], n: ['#262830', ''] };
let brfEl = null, brfT = 0, brfLeft = 0, brfKey = '', brfWant = null, brfFirst = false, brfTest = false, brfHier = null, brfSt = null, memoEl = null;
function brfWhen(t) {
  const d = new Date(t), n = new Date(), d0 = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime(), y0 = new Date(n.getFullYear(), n.getMonth(), n.getDate() - 1).getTime();
  return t >= d0 ? `aujourd'hui à ${fmtTime(t)}` : t >= y0 ? `hier à ${fmtTime(t)}` : `le ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}
const brfStLbl = (s) => (s.c === 'DE' ? [s.name, s.addr].filter(Boolean).join(', ') : s.addr || s.name || 'Station');
function brfRain() {
  const w = typeof weather !== 'undefined' ? weather : null;
  if (!w || !Array.isArray(w.hours) || Date.now() - (w.at || 0) > 3 * 3600e3) return '';
  const kind = (c) => (c >= 95 ? 'd\'orage' : (c >= 71 && c <= 77) || c === 85 || c === 86 ? 'de neige' : (c >= 51 && c <= 67) || (c >= 80 && c <= 82) ? 'de pluie' : '');
  if (kind(w.c)) return `${wmo(w.c).t} en ce moment`;
  const h = w.hours.slice(0, 6).find((x) => kind(x.c) || x.pp >= 60); if (!h) return '';
  return `Risque ${kind(h.c) || 'de pluie'} vers ${parseInt(h.h, 10)} h${h.pp != null ? ` (${h.pp} %)` : ''}`;
}
function brfHierCalc() {
  const n = new Date(), d0 = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime(), y0 = new Date(n.getFullYear(), n.getMonth(), n.getDate() - 1).getTime();
  const T = trkIndex().filter((t) => t.t0 >= y0 && t.t0 < d0); if (!T.length) return null;
  return { n: T.length, km: T.reduce((a, t) => a + kmOf(t), 0), ms: T.reduce((a, t) => a + Math.max(0, (t.t1 || t.t0) - t.t0), 0), e: T.reduce((a, t) => a + costOf(t), 0) };
}
function brfRows() {
  const out = [], now = Date.now(), M = memoList();
  M.slice(0, 3).forEach((m) => out.push({ k: 'm' + m.id, tone: 'info', ic: '📝', t: 'Pense-bête : ' + m.txt, s: 'Noté ' + brfWhen(m.t), b: [['memo:done:' + m.id, '✓ Fait']] }));
  if (M.length > 3) out.push({ k: 'mm' + M.length, tone: 'info', ic: '📝', t: `+ ${M.length - 3} autre${M.length > 4 ? 's' : ''} pense-bête${M.length > 4 ? 's' : ''}`, s: 'Paramètres → Entretien → Le point au démarrage', b: [] });
  try {   // carburant : autonomie donnée par la voiture
    const rg = car && now - car.ts < 30000 ? val(car.range) : null, lim = Number(store.get('brfRange', 100)) || 100;
    if (rg != null && rg > 0 && rg < lim) {
      const s0 = st47Sorted().find((x) => !x.closed && x.lat); brfSt = s0 || null;
      out.push({ k: 'f' + (s0 ? s0.lat : ''), tone: rg < 50 ? 'bad' : 'warn', ic: '⛽', t: `Autonomie ${Math.round(rg)} km`, s: s0 ? `La moins chère près de toi : ${brfStLbl(s0)} · ${s0.price.toFixed(3).replace('.', ',')} € · ${fr1(s0.dist)} km` : 'Recherche de la station la moins chère…', b: s0 ? [['brf:go', 'Y aller', true]] : [] });
    }
  } catch (e) { /* rien */ }
  try {   // météo : vigilance Météo-France, sinon pluie / neige / orage dans les 6 h
    const v = store.get('vigOn', true) ? vig : null, rain = brfRain();
    if (v && v.lvl) out.push({ k: 'v' + v.lvl + v.typ, tone: v.lvl === 2 ? 'bad' : 'warn', ic: '⚠️', t: `Vigilance ${v.lvl === 2 ? 'rouge' : 'orange'} · ${v.typ}${geo47.dept ? ' · ' + geo47.dept : ''}`, s: rain || 'Météo-France : prudence sur la route', b: [] });
    else if (rain) out.push({ k: 'r' + rain, tone: 'info', ic: '🌧️', t: rain, s: 'Prévision météo pour ici', b: [] });
  } catch (e) { /* rien */ }
  let rows = []; try { rows = planRows(); } catch (e) { rows = []; }
  const pr = rows.find((r) => r.it.id === 'press');   // contrôle du mois : à faire (pas « dans 30 jours », juste après l'avoir fait)
  if (pr && (pr.st === 'late' || pr.st === 'chk' || (pr.days != null && pr.days <= 2))) out.push({ k: 'p', tone: 'warn', ic: '🛞', t: 'Pression des pneus : contrôle du mois', s: `À froid : ${fr1b(pressF())} bar avant · ${fr1b(pressR())} bar arrière`, b: [['brf:press', '✓ Fait']] });
  const urg = (r) => Math.min(r.days != null ? r.days : 1e9, r.left != null ? r.left / 40 : 1e9);
  const due = rows.filter((r) => r.it.id !== 'press' && (r.st === 'late' || r.st === 'soon')).sort((a, b) => (a.st === 'late' ? 0 : 1) - (b.st === 'late' ? 0 : 1) || urg(a) - urg(b));
  const lateOk = (r) => r.st === 'late' && r.last;                                   // en retard alors que c'est noté dans le carnet
  if (due.length) out.push({ k: 'e' + due.map((r) => r.it.id + r.st).join(), tone: due.some(lateOk) ? 'bad' : due.some((r) => r.st === 'late') ? 'warn' : 'n', ic: '🔧', t: due.slice(0, 2).map((r) => `${r.it.n} : ${r.st !== 'late' ? planLeft(r) : r.last ? 'en retard' : 'à vérifier (rien dans ton carnet)'}`).join(' · ') + (due.length > 2 ? ` · +${due.length - 2}` : ''), s: 'Entretien → Plan constructeur : touche « Valider » quand c\'est fait', b: [['brf:plan', 'Voir']] });
  if (brfFirst && store.get('brfHier', true) && brfHier) {
    const h = brfHier; out.push({ k: 'h', tone: 'ok', ic: '🚗', t: `Hier : ${h.n} trajet${h.n > 1 ? 's' : ''} · ${h.km < 20 ? fr1(h.km) : Math.round(h.km)} km · ${dur47(h.ms)}`, s: `Environ ${eur2(h.e)} d'essence`, b: [['brf:trips', 'Voir']] });
  }
  return out;
}
function brfDraw(rows0) {
  if (!brfEl) return;
  const p = curP || palette(), rows = rows0 || brfRows();
  if (!rows.length && !brfTest) { brfClose(); return; }
  const key = JSON.stringify([rows.map((r) => [r.k, r.t, r.s, r.b.map((x) => x[0])]), brfLeft > 0, p.id]);
  if (key === brfKey && brfEl.firstChild) { const c = brfEl.querySelector('[data-brfcount]'); if (c) c.textContent = brfLeft > 0 ? ` (${brfLeft})` : ''; return; }   // rien n'a changé : juste le compte à rebours
  brfKey = key;
  const now = new Date(), H = now.getHours(), name = profiles()[profIdx()] || '', light = !!p.light;
  const J = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'], Mo = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const btn = (act, t, pri, big) => `<button data-act="${act}" style="flex:none;height:${big ? 52 : 42}px;padding:0 ${big ? 18 : 14}px;border-radius:${big ? 14 : 12}px;font-size:${big ? 16 : 14.5}px;font-weight:700;white-space:nowrap;${pri ? `background:${p.acc};color:${p.onAcc}` : `background:${light ? '#0000001a' : '#34363F'};color:${p.txt}`}">${t}</button>`;
  const row = (r) => { const T = BRF_TONE[r.tone] || BRF_TONE.n, col = !light && T[1] ? T[1] : p.txt;
    return `<div style="display:flex;align-items:center;gap:14px;padding:9px 14px;border-radius:14px;background:${p.card2};${r.tone !== 'n' ? `box-shadow:inset 4px 0 0 ${T[1]}` : ''}">
      <div style="flex:none;width:44px;height:44px;border-radius:12px;background:${light ? (T[1] || '#888888') + '33' : T[0]};display:flex;align-items:center;justify-content:center;font-size:23px">${r.ic}</div>
      <div style="flex:1;min-width:0"><div style="font-size:17px;font-weight:700;color:${col};${ell}">${esc(r.t)}</div><div style="font-size:13.5px;color:${p.mut};margin-top:2px;${ell}">${esc(r.s)}</div></div>${r.b.map(([a, t, pri]) => btn(a, t, pri)).join('')}</div>`; };
  const z = gbFreeZone(); brfEl.style.justifyContent = z ? 'flex-start' : 'center'; brfEl.style.paddingLeft = z ? z.left + 'px' : '0';
  brfEl.innerHTML = `<div data-act="brf:hold" style="width:${z ? Math.min(900, z.w) : 900}px;max-height:684px;box-sizing:border-box;background:${p.card};border-radius:24px;padding:18px 22px 14px;box-shadow:0 20px 60px #000c;display:flex;flex-direction:column;gap:9px;color:${p.txt}">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:2px"><div style="font-size:30px;line-height:1">${H >= 18 || H < 6 ? '🌙' : '☀️'}</div><div style="flex:1;min-width:0"><div style="font-size:24px;font-weight:800;${ell}">${H >= 18 || H < 5 ? 'Bonsoir' : 'Bonjour'} ${esc(name)}${z ? '' : ' · le point avant de partir'}</div><div style="font-size:14px;color:${p.mut}">${z ? 'Le point avant de partir' + (rows.length ? '' : ' : rien à signaler') : rows.length ? 'Seulement ce qui demande ton attention' : 'Rien à signaler : bonne route !'}</div></div><div style="flex:none;font-size:14px;color:${p.mut};text-align:right">${J[now.getDay()]} ${now.getDate()} ${Mo[now.getMonth()]}<br><b style="color:${p.txt};font-size:18px">${fmtTime(now)}</b></div></div>
    <div class="scroll" style="display:flex;flex-direction:column;gap:9px;min-height:0;overflow:auto">${rows.map(row).join('')}</div>
    <div style="display:flex;align-items:center;gap:10px;margin-top:4px"><button data-act="brf:x" style="flex:1;height:52px;border-radius:14px;background:${p.acc};color:${p.onAcc};font-size:17px;font-weight:700">C'est parti<span data-brfcount style="opacity:.75;font-weight:600">${brfLeft > 0 ? ` (${brfLeft})` : ''}</span></button>${btn('memo:add', '＋ Pense-bête', false, true)}</div>
    <div style="font-size:12.5px;color:${p.mut};text-align:center">Se ferme tout seul au bout de 15 s ou dès que tu roules · Réglage : Paramètres → Entretien → Le point au démarrage</div></div>`;
}
function brfClose() { clearInterval(brfT); brfT = 0; if (brfEl) { brfEl.remove(); brfEl = null; } brfTest = false; }
function brfShow(src) {
  if (brfEl || welEl) return false;
  brfTest = src === 'test'; brfFirst = brfTest || store.get('brfDay', '') !== dayKey(Date.now());
  brfHier = null; if (brfFirst) { try { brfHier = brfHierCalc(); } catch (e) { brfHier = null; } }
  const rows = brfRows(); if (!rows.length && !brfTest) return false;
  brfEl = document.createElement('div'); brfEl.id = 'brief'; brfEl.setAttribute('data-noswipe', '1'); brfEl.setAttribute('data-act', 'brf:hold');
  brfEl.style.cssText = 'position:absolute;inset:0;z-index:3900;background:#000000b8;display:flex;align-items:center;justify-content:center';
  $('stage').appendChild(brfEl);
  if (!brfTest) store.set('brfDay', dayKey(Date.now()));
  brfLeft = 15; brfKey = ''; brfDraw(rows);
  brfT = displayEvery725(() => { if (!brfEl) return; if (moving()) { brfClose(); return; } if (brfLeft > 0 && --brfLeft === 0) { brfClose(); return; } brfDraw(); }, 1000);
  dlogAdd('point', `le point au démarrage (${src}) : ${rows.length} ligne${rows.length > 1 ? 's' : ''}`);
  return true;
}
let memoBan = null, memoBanT = 0;
function brfBanner(M) {   // déjà en train de rouler au démarrage : seulement les pense-bêtes, en bandeau (à part : les autres messages ne l'effacent pas)
  const p = curP || palette(); if (memoBan) memoBan.remove(); clearTimeout(memoBanT);
  memoBan = document.createElement('div'); memoBan.id = 'memoBanner'; memoBan.setAttribute('data-act', 'memo:ban'); memoBan.setAttribute('data-noswipe', '1');
  memoBan.style.cssText = `position:absolute;left:50%;top:76px;transform:translateX(-50%);z-index:3800;max-width:820px;display:flex;align-items:center;gap:12px;padding:12px 18px;border-radius:16px;background:#16263D;outline:2px solid #8FB8EA;box-shadow:0 10px 30px #000b;color:#fff`;
  memoBan.innerHTML = `<span style="font-size:26px">📝</span><div style="min-width:0"><div style="font-size:19px;font-weight:800;${ell}">Pense-bête : ${esc(M[0].txt)}</div>${M.length > 1 ? `<div style="font-size:13px;color:#ffffffc8">+ ${M.length - 1} autre${M.length > 2 ? 's' : ''} · touche pour fermer</div>` : '<div style="font-size:13px;color:#ffffffc8">Touche pour fermer</div>'}</div>`;
  $('stage').appendChild(memoBan); dlogAdd('point', 'pense-bête affiché en bandeau (déjà en train de rouler)');
  memoBanT = setTimeout(() => { if (memoBan) { memoBan.remove(); memoBan = null; } }, 12000);
}
function brfArm(src) {
  const m = brfMode(); if (m === 'off' || Q47.has('nw') || Q47.get('theme')) return;
  if (m === 'day' && store.get('brfDay', '') === dayKey(Date.now())) return;
  brfWant = { src, at: Date.now(), t0: Date.now() };
}
setInterval(() => {
  if (!brfWant || brfEl) return;
  if (welEl || editing || document.hidden) { if (Date.now() - brfWant.t0 > 10 * 60000) brfWant = null; else brfWant.at = Date.now(); return; }   // d'abord la bienvenue ; Waze devant : on attend le retour sur l'accueil (10 min max)
  if (moving()) { const M = memoList(); if (M.length) brfBanner(M); brfWant = null; return; }
  const age = Date.now() - brfWant.at; if (age < 2500) return;                  // laisse arriver les infos voiture, la météo, les stations
  if (brfShow(brfWant.src) || age > 15000) brfWant = null;                      // toujours rien à dire au bout de 15 s : on n'insiste pas
}, 1000);
document.addEventListener('DOMContentLoaded', () => setTimeout(() => brfArm('lancement'), 800));
{ let tk = Date.now(); setInterval(() => { const n = Date.now(), gap = n - tk; tk = n; if (gap > 30 * 60000) brfArm('réveil après une veille'); }, 5000); }
{ let ig = null, offAt = 0; setInterval(() => {   // contact remis après au moins 10 min coupé (autoradio resté allumé)
  if (!car || Date.now() - car.ts > 15000 || (car.ign !== 0 && car.ign !== 1)) return;
  if (car.ign === 0 && ig !== 0) offAt = Date.now();
  if (car.ign === 1 && ig === 0 && Date.now() - offAt > 10 * 60000) brfArm('contact');
  ig = car.ign; }, 2000); }
function brfPress() {
  const it = PLAN.find((x) => x.id === 'press'); if (!it) return;
  const log = store.get('serviceLog', []), km = kmNow();
  log.push({ date: dayKey(Date.now()), type: it.m[0], km: km != null ? km : '', cost: '', note: it.n, plan: 'press' }); store.set('serviceLog', log);
  toast('🛞 Noté dans ton carnet : pression des pneus');
}
function brfAct(v) {
  if (v === 'hold') { if (brfLeft > 0) { brfLeft = -1; brfDraw(); } return; }      // tu lis : plus de compte à rebours
  if (v === 'x') { brfClose(); return; }
  if (v === 'go') { const s = brfSt; brfClose(); if (!s || !s.lat) { toast('Station pas encore trouvée'); return; }
    let ok = false; try { ok = !!A && A.openUrl(`https://waze.com/ul?ll=${s.lat},${s.lon}&navigate=yes`) !== false; } catch (e) { ok = false; }
    if (!ok) toast(A ? 'Waze introuvable' : `Aperçu : Waze vers ${brfStLbl(s)}`); return; }
  if (v === 'press') { brfPress(); brfLeft = -1; brfKey = ''; brfDraw(); return; }
  if (v === 'plan') { brfClose(); act('ssub:plan'); return; }
  if (v === 'trips') { brfClose(); act('tab:tracks'); return; }
  if (v === 'test') { brfClose(); brfShow('test'); }
}
function memoClose() { if (memoEl) { memoEl.remove(); memoEl = null; } }
function memoOpen() {
  memoClose(); const p = curP || palette();
  memoEl = document.createElement('div'); memoEl.setAttribute('data-noswipe', '1'); memoEl.setAttribute('data-act', 'memo:noop');
  const z = gbFreeZone();
  memoEl.style.cssText = `position:absolute;inset:0;z-index:4100;background:#000000c4;display:flex;justify-content:${z ? 'flex-start' : 'center'};align-items:flex-start;padding-top:64px;padding-left:${z ? z.left : 0}px`;
  const b = (act, t, pri) => `<button data-act="${act}" style="height:50px;padding:0 22px;border-radius:14px;font-size:16px;font-weight:700;${pri ? `background:${p.acc};color:${p.onAcc}` : `background:${p.card2};color:${p.txt}`}">${t}</button>`;
  memoEl.innerHTML = `<div style="width:${z ? Math.min(780, z.w) : 780}px;box-sizing:border-box;${card(p, 'padding:18px 20px;display:flex;flex-direction:column;gap:12px')};color:${p.txt}">
    <div style="font-size:21px;font-weight:800">📝 Nouveau pense-bête</div>
    <input id="memoIn" maxlength="90" autocomplete="off" enterkeyhint="done" placeholder="Ex. : déposer le colis à la Poste" style="height:56px;border-radius:14px;border:2px solid ${p.acc};background:${p.card2};color:${p.txt};font-size:20px;padding:0 16px;outline:none;font-family:inherit">
    <div style="font-size:13px;color:${p.mut}">Il s'affiche à chaque démarrage jusqu'à ce que tu touches « Fait ». Si ton clavier a un micro, tu peux le dicter.</div>
    <div style="display:flex;gap:10px;justify-content:flex-end">${b('memo:x', 'Annuler')}${b('memo:ok', 'Enregistrer', true)}</div></div>`;
  $('stage').appendChild(memoEl);
  const i = $('memoIn'); if (i) { i.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); act('memo:ok'); } }); setTimeout(() => { try { i.focus(); } catch (e) { /* rien */ } }, 80); }
}
function memoAct(v) {
  if (v === 'noop') return;
  if (v === 'ban') { clearTimeout(memoBanT); if (memoBan) { memoBan.remove(); memoBan = null; } return; }
  if (v === 'add') { if (brfEl) brfLeft = -1; memoOpen(); return; }
  if (v === 'x') { memoClose(); return; }
  const after = () => { if (brfEl) { brfKey = ''; brfDraw(); } if (tab === 'home' || tab === 'settings') render(); };
  if (v === 'ok') {
    const i = $('memoIn'), t = i ? i.value.trim().replace(/\s+/g, ' ').slice(0, 90) : ''; if (!t) { toast('Écris ton pense-bête'); return; }
    const L = memoList(); L.push({ id: Date.now().toString(36), txt: t, t: Date.now() }); store.set('memos', L.slice(-12)); memoClose();
    toast('📝 Pense-bête enregistré : il s\'affichera au prochain démarrage'); after(); return;
  }
  if (v.indexOf('done:') === 0) { const id = v.slice(5); store.set('memos', memoList().filter((m) => m.id !== id)); toast('📝 Pense-bête fait'); after(); }
}
// widget « Pense-bête » (en option : appui long sur l'accueil → ＋ Ajouter → Widgets)
GBLOCKS.memo = { n: 'Pense-bête', r: (p, w, h) => {
  const M = memoList(), tall = h >= 1.1;
  const add = `<button data-act="memo:add" aria-label="Ajouter un pense-bête" style="flex:none;height:44px;min-width:46px;padding:0 12px;border-radius:12px;background:${p.acc};color:${p.onAcc};font-size:15px;font-weight:700;white-space:nowrap">＋${tall ? ' Ajouter' : ''}</button>`;
  const done = (m) => `<button data-act="memo:done:${m.id}" aria-label="Fait" style="flex:none;height:40px;min-width:44px;padding:0 10px;border-radius:12px;background:${p.light ? '#0000001a' : '#34363F'};color:${p.txt};font-size:19px;font-weight:700">✓</button>`;
  if (!tall) return `<div style="${card(p, 'padding:8px 8px 8px 14px;display:flex;align-items:center;gap:10px')}"><span style="font-size:24px">📝</span><div style="flex:1;min-width:0"><div style="font-size:15px;font-weight:700;${ell}">${M.length ? esc(M[0].txt) : 'Pense-bête'}</div><div style="font-size:12px;color:${p.mut};${ell}">${M.length ? (M.length > 1 ? `+ ${M.length - 1} autre${M.length > 2 ? 's' : ''} · ` : '') + 'affiché au démarrage' : 'Touche ＋ pour en écrire un'}</div></div>${M.length ? done(M[0]) : ''}${add}</div>`;
  const n = Math.max(1, Math.floor(h * 2) - 1);
  const list = M.length ? M.slice(0, n).map((m) => `<div style="display:flex;align-items:center;gap:8px;padding:6px 6px 6px 12px;border-radius:12px;background:${p.card2}"><span style="flex:1;min-width:0;font-size:15px;font-weight:600;${ell}">${esc(m.txt)}</span>${done(m)}</div>`).join('') + (M.length > n ? `<div style="font-size:12px;color:${p.mut}">+ ${M.length - n} autre${M.length - n > 1 ? 's' : ''}</div>` : '')
    : `<div style="font-size:13.5px;color:${p.mut}">Rien à retenir. Écris-en un garé : il ressortira au prochain démarrage.</div>`;
  return `<div style="${card(p, 'padding:10px 12px;display:flex;flex-direction:column;gap:8px')}"><div style="display:flex;align-items:center;gap:10px"><span style="font-size:24px">📝</span><div style="flex:1;font-size:17px;font-weight:800">Pense-bêtes</div>${add}</div><div style="display:flex;flex-direction:column;gap:6px;min-height:0;overflow:hidden">${list}</div></div>`;
} };
FMIN.memo = [3, 1]; FSZ.memo = [[3, 1], [4, 2], [6, 2]];
{ const i = FORDER.indexOf('clock'); FORDER.splice(i >= 0 ? i + 1 : FORDER.length, 0, 'memo'); }
{ const cat = SETCATS.find(([n]) => n === 'Entretien');
  if (cat) { const i = cat[1].findIndex(([n]) => n === 'Rappels'); cat[1].splice(i >= 0 ? i + 1 : cat[1].length, 0, ['Le point au démarrage', (p) => {
    const m = brfMode(), seg = (pre, opts, cur) => opts.map(([k, l]) => chipBtn(p, pre + k, l, String(cur) === String(k))).join(''), M = memoList(), hier = store.get('brfHier', true);
    const list = M.length ? M.map((x) => `<div style="display:flex;align-items:center;gap:10px;padding:8px 8px 8px 12px;border-radius:12px;background:${p.card2}"><span style="font-size:18px">📝</span><span style="flex:1;min-width:0;font-size:15px;font-weight:600;${ell}">${esc(x.txt)}</span><span style="flex:none;font-size:12.5px;color:${p.mut}">${brfWhen(x.t)}</span>${chipBtn(p, 'memo:done:' + x.id, '✓ Fait')}</div>`).join('')
      : `<div style="font-size:14px;color:${p.mut};padding:4px 2px">Aucun pense-bête pour l'instant.</div>`;
    return `<div class="colns" style="display:flex;flex-direction:column;gap:8px;max-width:920px">
      ${setRow(p, 'Afficher le point', 'Seulement s\'il y a quelque chose à te dire. Se ferme tout seul au bout de 15 s ou dès que tu roules.', `<span style="display:flex;gap:6px;flex-wrap:wrap">${seg('brfset:mode:', [['each', 'Chaque démarrage'], ['day', '1 fois par jour'], ['off', 'Jamais']], m)}</span>`)}
      ${setRow(p, 'Autonomie à signaler', `En dessous de ${store.get('brfRange', 100)} km, avec la station la moins chère et « Y aller ».`, `<span style="display:flex;gap:6px">${seg('brfset:rg:', [[60, '60 km'], [100, '100 km'], [150, '150 km']], store.get('brfRange', 100))}</span>`)}
      ${setRow(p, 'Résumé de la veille', 'Au premier démarrage de la journée : trajets, km et essence d\'hier.', chipBtn(p, 'brfset:hier', hier ? 'Affiché' : 'Masqué', hier))}
      ${setRow(p, 'Voir le point maintenant', 'Pour tester, même s\'il n\'y a rien à signaler.', chipBtn(p, 'brf:test', 'Afficher', true))}
      <div style="display:flex;align-items:center;gap:10px;margin-top:6px"><div style="font-size:17px;font-weight:700;flex:1">Pense-bêtes</div>${chipBtn(p, 'memo:add', '＋ Ajouter', true)}</div>
      ${list}
      <div style="font-size:12.5px;color:${p.mut}">Widget « Pense-bête » possible sur l'accueil : appui long sur l'accueil → ＋ Ajouter → Widgets.</div></div>`; }]); } }
{ const a1 = window.act; window.act = function (a, long) {
  if (a.indexOf('brf:') === 0) { brfAct(a.slice(4)); return; }
  if (a.indexOf('memo:') === 0) { memoAct(a.slice(5)); return; }
  if (a.indexOf('brfset:') === 0) { const [, k, x] = a.split(':');
    if (k === 'mode') store.set('brfMode', x); if (k === 'rg') store.set('brfRange', Number(x)); if (k === 'hier') store.set('brfHier', !store.get('brfHier', true));
    render(); return; }
  return a1.apply(this, arguments); }; }

// ================= 29. Plein pré-rempli : bouton ⛽ dans la carte Carburant + widget « Plein » =================
// À chaque relevé du boîtier, on garde le niveau d'essence « avant ». S'il remonte d'au moins 5 L sans que la voiture ait roulé
// (moins de 3 km au compteur), c'est un plein : litres = écart de jauge, prix = station où tu es (flux officiel / Tankerkönig),
// compteur = voiture. Rien ne s'enregistre tout seul : la carte Carburant propose, tu valides (✓) ou tu corriges (✎).
const PLW_MIN = 5;
let plwBuf = [], plwRef = store.get('plRef', null), plwRefAt = 0;
function plwOn() { return store.get('plDetect', true); }
function plwPend() { const x = store.get('plPend', null); return x && x.t && x.l > 0 && Date.now() - x.t < 7 * 864e5 ? x : null; }
const plwMed = (a) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const plwR1 = (x) => Math.round(x * 10) / 10;
const plwPr = (x) => x.toFixed(3).replace('.', ',');
function plwSetRef(r, force) { plwRef = r; const n = Date.now(); if (force || n - plwRefAt > 30000) { plwRefAt = n; store.set('plRef', r); } }
function plwPos() { return loc && Date.now() - loc.ts < 60000 ? { lat: Math.round(loc.lat * 1e5) / 1e5, lon: Math.round(loc.lon * 1e5) / 1e5 } : null; }
function plwAccept() { const f = plwBuf.length >= 2 ? plwMed(plwBuf) : car && val(car.fuel); if (f > 0.5) plwSetRef({ f, k: odoCar47() || 0, t: Date.now(), pos: plwPos() }, true); }
function plwRefresh() { if (tab === 'home' && !editing && !plKp) render(); }
function plwTick() {
  if (!plwOn() || !car || Date.now() - car.ts > 10000) return;
  const f = val(car.fuel); if (f == null || f < 0.5 || f > 150) return;            // 0 au démarrage : pas encore lu
  plwBuf.push(f); if (plwBuf.length > 6) plwBuf.shift(); if (plwBuf.length < 4) return;   // médiane sur 20-30 s : la jauge bouge dans les virages
  const now = Date.now(), fm = plwMed(plwBuf), odo = odoCar47() || 0, s = curSpeed(), mv = !!(s && s.v > 15), pos = plwPos(), cur = { f: fm, k: odo, t: now, pos };
  if (!plwRef || !(plwRef.f > 0)) { plwSetRef(cur, true); return; }
  const up = fm - plwRef.f, dk = odo && plwRef.k ? odo - plwRef.k : null, dp = pos && plwRef.pos ? hav(pos.lat, pos.lon, plwRef.pos.lat, plwRef.pos.lon) : null;
  const still = dk != null ? dk < 3 : dp != null ? dp < 1.5 : true;                // un plein se fait à l'arrêt
  const P = plwPend();
  if (up >= PLW_MIN && still) {
    if (P && P.open) { if (up > P.l + 0.2) { P.l = plwR1(up); P.after = plwR1(fm); store.set('plPend', P); plwRefresh(); } return; }   // contact resté mis à la pompe : la jauge monte encore
    const N = { t: now, l: plwR1(up), before: plwR1(plwRef.f), after: plwR1(fm), k: odo ? Math.round(odo) : 0, pos: pos || plwRef.pos || null, open: true };
    store.set('plPend', N); dlogAdd('plein', `plein détecté : +${fr1(up)} L (jauge ${fr1(plwRef.f)} → ${fr1(fm)} L)`); plwFind(N); plwRefresh(); return;
  }
  if (P && P.open && mv) { P.open = false; store.set('plPend', P); plwSetRef(cur, true); return; }   // reparti : plein figé, nouvelle référence
  if (P && P.open) return;                                                           // encore à la pompe : la référence reste « avant le plein »
  if (up < 0 || (mv && up < 2) || (mv && !still)) plwSetRef(cur);                   // conso, petite dérive en roulant, ou référence trop vieille
}
setInterval(plwTick, 5000);
document.addEventListener('visibilitychange', () => { if (document.hidden && plwRef) store.set('plRef', plwRef); });
window.addEventListener('pagehide', () => { if (plwRef) store.set('plRef', plwRef); });
function plwRec(r, fk) {   // une station du flux officiel français
  const k = Object.keys(r).find((x) => x.toLowerCase() === fk + '_prix') || Object.keys(r).find((x) => x.toLowerCase().includes(fk) && x.toLowerCase().includes('prix'));
  let pr = k ? parseFloat(r[k]) : NaN; if (pr > 10) pr /= 1000;
  const g = r.geom || {}, la = +g.lat || (+r.latitude > 1000 ? r.latitude / 1e5 : +r.latitude), lo = +g.lon || (+r.longitude > 1000 ? r.longitude / 1e5 : +r.longitude);
  return la && lo ? { c: 'FR', name: r.enseigne || r.nom || r.ville || 'Station', addr: [r.adresse, r.ville].filter(Boolean).join(', '), price: pr > 0 ? pr : 0, lat: la, lon: lo } : null;
}
async function plwStation(pos) {   // la station où tu es (moins de 350 m) : d'abord la liste déjà chargée, sinon une petite recherche
  let best = null; const near = (s) => { if (!s || !s.lat) return; const d = hav(pos.lat, pos.lon, s.lat, s.lon); if (d < 0.35 && (!best || d < best.d)) best = Object.assign({ d }, s); };
  (st47.list || []).forEach(near);
  if (!best && !DEMO) {
    try {
      const fk = FUEL_KEY[store.get('fuel', 'E10')] || 'e10', base = 'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records';
      const geo = `within_distance(geom, geom'POINT(${pos.lon.toFixed(5)} ${pos.lat.toFixed(5)})', 0.35km)`;
      ((await getJSON(`${base}?where=${encodeURIComponent(geo)}&limit=10`)).results || []).forEach((r) => near(plwRec(r, fk)));
    } catch (e) { /* pas de réseau */ }
  }
  return best;
}
async function plwFind(N) {
  const best = N.pos ? await plwStation(N.pos) : null, cur = store.get('plPend', null); if (!cur || cur.t !== N.t) return;
  if (best) { cur.st = brfStLbl(best).slice(0, 80); if (best.price > 0.5 && best.price < 4) cur.pr = Math.round(best.price * 1000) / 1000; }
  cur.look = true; store.set('plPend', cur); dlogAdd('plein', best ? `station : ${cur.st}${cur.pr ? ' · ' + plwPr(cur.pr) + ' €/L' : ' · prix inconnu'}` : 'aucune station à moins de 350 m'); plwRefresh();
}
function plwNear() {   // station de la liste à moins de 350 m de toi (pour pré-remplir un plein noté à la main)
  const pos = plwPos(); if (!pos) return null; let best = null;
  (st47.list || []).forEach((s) => { if (!s.lat || !(s.price > 0)) return; const d = hav(pos.lat, pos.lon, s.lat, s.lon); if (d < 0.35 && (!best || d < best.d)) best = { d, lbl: brfStLbl(s), pr: s.price }; });
  return best;
}
function plwFix() {
  const P = plwPend(); if (!P) { plwNew(); return; }
  const o = P.k || Math.round(odoCar47() || 0);
  plKp = { f: 'e', l: String(P.l).replace('.', ','), e: '', k: o ? String(o) : '', pr: P.pr || 0, st: P.st || '', det: true, t: P.t }; render();
}
function plwNew() {
  const o = odoCar47() || (typeof odoNow === 'function' ? odoNow() : 0) || 0, s = plwNear();
  plKp = { f: 'l', l: '', e: '', k: o ? String(Math.round(o)) : '', pr: s ? Math.round(s.pr * 1000) / 1000 : 0, st: s ? s.lbl : '' }; render();
  const pos = plwPos(); if (!s && pos && !DEMO) { const k0 = plKp; plwStation(pos).then((b) => { if (b && plKp === k0 && !k0.st) { k0.st = brfStLbl(b).slice(0, 80); if (b.price > 0.5 && b.price < 4) k0.pr = Math.round(b.price * 1000) / 1000; render(); } }); }
}
function plwOk() {
  const P = plwPend(); if (!P) return;
  if (!(P.pr > 0)) { plwFix(); toast('Prix de la station inconnu : tape le montant payé'); return; }
  const e = Math.round(P.l * P.pr * 100) / 100, k = P.k || Math.round(odoCar47() || 0), L = fuelLog(), last = L[L.length - 1];
  if (k && last && last.k && k <= last.k) { plwFix(); toast('Compteur plus petit qu\'au dernier plein : vérifie'); return; }
  const rec = { t: P.t, l: P.l, e, k }; if (P.st) rec.s = String(P.st).slice(0, 80);
  L.push(rec); L.sort((a, b) => a.t - b.t); store.set('fuelLog', L); store.set('fuelPrice', P.pr);
  store.set('plPend', null); plwAccept(); toast(`⛽ Plein enregistré : ${fr1(P.l)} L · ${eur2(e)} (Entretien → Pleins)`); render();
}
function plwDetCard(p, P, w, h) {   // plein détecté : petite (1 ligne) ou grande carte
  const tall = h >= 1.1, e = P.pr > 0 ? Math.round(P.l * P.pr * 100) / 100 : 0, green = p.light ? '#2E7D32' : '#B6DD8C';
  const sub = P.pr > 0 ? `${P.st ? esc(P.st) + ' · ' : ''}${plwPr(P.pr)} €/L → ≈ ${eur2(e)}` : P.look ? `${P.st ? esc(P.st) + ' · ' : ''}prix inconnu : touche pour le taper` : 'Recherche de la station…';
  const bt = (act, t, pri, lbl, grow) => `<button data-act="${act}" aria-label="${lbl}" style="flex:${grow ? 1 : 'none'};height:44px;min-width:46px;padding:0 12px;border-radius:12px;font-size:${t.length === 1 ? 20 : 15}px;font-weight:700;white-space:nowrap;${pri ? `background:${p.acc};color:${p.onAcc}` : `background:${p.card2};color:${p.txt}`}">${t}</button>`;
  const narrow = w < 1.8;
  if (!tall) return `<div style="${card(p, `padding:8px 8px 8px ${narrow ? 10 : 12}px;display:flex;align-items:center;gap:${narrow ? 6 : 8}px;box-shadow:inset 0 0 0 2px ${green}66`)}"><div data-act="plw:fix" style="flex:1;min-width:0;display:flex;align-items:center;gap:${narrow ? 6 : 10}px"><span style="font-size:${narrow ? 20 : 24}px">⛽</span><div style="min-width:0"><div style="font-size:15px;font-weight:800;color:${green};${ell}">${narrow ? 'Plein' : 'Plein détecté ·'} ≈ ${fr1(P.l)} L</div><div style="font-size:12px;color:${p.mut};${ell}">${narrow && e ? `≈ ${eur2(e)}${P.st ? ' · ' + esc(P.st) : ''}` : sub}</div></div></div>${bt('plw:ok', '✓', true, 'Enregistrer le plein')}${bt('plw:no', '✕', false, 'Ce n\'était pas un plein')}</div>`;
  const cell = (l, v, s) => `<div style="background:${p.card2};border-radius:12px;padding:6px 10px;min-width:0"><div style="font-size:12px;color:${p.mut}">${l}</div><div style="font-size:19px;font-weight:800;${ell}">${v}</div>${s ? `<div style="font-size:11px;color:${p.mut};${ell}">${s}</div>` : ''}</div>`;
  const cells = [cell('Litres', '≈ ' + fr1(P.l) + ' L', `jauge ${fr1(P.before)} → ${fr1(P.after)} L`), cell('Total', e ? '≈ ' + eur2(e) : '—', P.pr ? plwPr(P.pr) + ' €/L' : 'prix à taper')]
    .concat(w >= 2.5 ? [cell('Prix au litre', P.pr ? plwPr(P.pr) + ' €' : '—', 'prix de la station'), cell('Compteur', P.k ? P.k.toLocaleString('fr-FR') + ' km' : '—', 'lu sur la voiture')] : []);
  return `<div style="${card(p, `padding:10px 12px;display:flex;flex-direction:column;justify-content:center;gap:8px;box-shadow:inset 0 0 0 2px ${green}66`)}">
    <div style="display:flex;align-items:center;gap:10px"><span style="font-size:26px">⛽</span><div style="flex:1;min-width:0"><div style="font-size:17px;font-weight:800;color:${green};${ell}">Plein détecté</div><div style="font-size:12.5px;color:${p.mut};${ell}">${P.st ? esc(P.st) : P.look ? 'Station non trouvée' : 'Recherche de la station…'} · ${brfWhen(P.t)}</div></div>${bt('plw:no', '✕', false, 'Ce n\'était pas un plein')}</div>
    <div style="display:grid;grid-template-columns:repeat(${cells.length},minmax(0,1fr));gap:6px">${cells.join('')}</div>
    <div style="display:flex;gap:8px">${bt('plw:ok', '✓ Enregistrer', true, 'Enregistrer le plein', true)}${bt('plw:fix', '✎ Corriger', false, 'Corriger')}</div></div>`;
}
// la carte Carburant de l'accueil : jauge + bouton ⛽ Plein ; après un plein, elle le propose
{ const B = GBLOCKS.fuel; if (B) { B.n = 'Carburant (+ bouton plein)'; B.r = (p, w, h) => { const P = plwOn() ? plwPend() : null; if (P) return plwDetCard(p, P, w, h);
  return `<div style="${card(p, 'padding:8px;display:flex;align-items:stretch;gap:8px')}"><div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center">${fuelC(p)}</div>
    <button data-act="plw:new" aria-label="Noter un plein" style="flex:none;min-width:58px;padding:0 8px;border-radius:${Math.max(8, p.r - 10)}px;background:${p.card2};color:${p.txt};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:11.5px;font-weight:700"><span style="font-size:21px;line-height:1">⛽</span>Plein</button></div>`; }; } }
GBLOCKS.plein = { n: 'Plein (pré-rempli)', r: (p, w, h) => {
  const P = plwOn() ? plwPend() : null; if (P) return plwDetCard(p, P, w, h);
  const tall = h >= 1.1, s = plwNear(), L = fuelLog(), last = L[L.length - 1];
  const sub = s ? `📍 ${esc(s.lbl)} · ${plwPr(s.pr)} €/L` : last ? `Dernier plein : ${fmtDate(last.t)} · ${fr1(last.l)} L · ${eur2(last.e)}` : 'Aucun plein noté pour l\'instant';
  const btn = (grow) => `<button data-act="plw:new" style="flex:${grow ? 1 : 'none'};height:44px;padding:0 14px;border-radius:12px;background:${p.acc};color:${p.onAcc};font-size:15px;font-weight:700;white-space:nowrap">⛽ ${tall ? 'Noter un plein' : 'Plein'}</button>`;
  if (!tall) return `<div style="${card(p, 'padding:8px 8px 8px 14px;display:flex;align-items:center;gap:10px')}"><div style="flex:1;min-width:0"><div style="font-size:15px;font-weight:700;${ell}">Plein</div><div style="font-size:12px;color:${p.mut};${ell}">${sub}</div></div>${btn(false)}</div>`;
  return `<div style="${card(p, 'padding:12px 14px;display:flex;flex-direction:column;justify-content:center;gap:10px')}">
    <div style="display:flex;align-items:center;gap:10px"><span style="font-size:28px">⛽</span><div style="flex:1;min-width:0"><div style="font-size:18px;font-weight:800">Plein</div><div style="font-size:12.5px;color:${p.mut};${ell}">${sub}</div></div></div>
    <div style="display:flex">${btn(true)}</div>
    <div style="font-size:11.5px;color:${p.mut};${ell}">Après un plein, la jauge le détecte : litres, prix et compteur pré-remplis.</div></div>`;
} };
FMIN.plein = [3, 1]; FSZ.plein = [[4, 1], [4, 2], [6, 2]];
{ const i = FORDER.indexOf('fuel'); FORDER.splice(i >= 0 ? i + 1 : FORDER.length, 0, 'plein'); }
// la saisie du plein s'ouvre aussi sur l'accueil (avant : seulement dans Entretien → Pleins)
{ const r0 = window.render; window.render = function () { r0.apply(this, arguments); try { if (plKp && tab === 'home' && !document.querySelector('#screen [data-plpad]')) { $('screen').insertAdjacentHTML('beforeend', plPad(curP || palette()));
  const z = gbFreeZone(), el = document.querySelector('#screen [data-plpad]'); if (z && el) { el.style.justifyContent = 'flex-start'; el.style.paddingLeft = z.left + 'px'; } } } catch (e) { /* rien */ } }; }
{ const a1 = window.act; window.act = function (a, long) {
  if (a.indexOf('plw:') === 0) { const v = a.slice(4);
    if (v === 'new') { if (plwPend()) plwFix(); else plwNew(); }
    else if (v === 'fix') plwFix();
    else if (v === 'ok') plwOk();
    else if (v === 'no') { store.set('plPend', null); plwAccept(); toast('D\'accord : ce n\'était pas un plein'); render(); }
    else if (v === 'det') { store.set('plDetect', !plwOn()); if (!plwOn()) store.set('plPend', null); render(); }
    return; }
  return a1.apply(this, arguments); }; }
{ const cat = SETCATS.find(([n]) => n === 'Véhicule'); const sub = cat && cat[1].find(([n]) => n === 'Carburant');
  if (sub) { const f0 = sub[1]; sub[1] = (p) => f0(p) + setRow(p, '⛽ Plein pré-rempli', 'Bouton ⛽ Plein sur la carte Carburant. Après un plein (+5 L ou plus à l\'arrêt, d\'après la jauge), la carte propose litres, prix de la station et compteur : rien ne s\'enregistre sans ton appui.', chipBtn(p, 'plw:det', plwOn() ? 'Détection activée' : 'Détection désactivée', plwOn())); } }

// ================= 30. Bilan juste même après 300 parcours : les parcours effacés pour faire de la place restent comptés =================
// Un petit résumé par jour (km, nombre, €, durée, litres) est gardé quand un vieux parcours est effacé ; le Bilan et les semaines l'ajoutent.
// N'utilise que des fonctions déclarées (kmOf, fuelCons, fuelPrice) : peut tourner dès le chargement (parcours clos au démarrage).
function trkArchive(t) {
  try {
    if (!t || !t.t0) return;
    const A0 = store.get('trkArch', {}) || {}, k = dayKey(t.t0), a = Array.isArray(A0[k]) ? A0[k] : [0, 0, 0, 0, 0];
    const km = kmOf(t), l = km * (t.co || fuelCons()) / 100, e = l * (t.pr || fuelPrice());
    a[0] = Math.round((a[0] + km) * 100) / 100; a[1] += 1; a[2] = Math.round((a[2] + e) * 100) / 100; a[3] += Math.max(0, (t.t1 || t.t0) - t.t0); a[4] = Math.round(((a[4] || 0) + l) * 100) / 100;
    A0[k] = a; store.set('trkArch', A0);
  } catch (e) { /* rien */ }
}
function trkArchDays() {
  const A0 = store.get('trkArch', {}) || {};
  return Object.keys(A0).map((k) => { const [y, m, d] = k.split('-').map(Number); return [new Date(y, m - 1, d, 12).getTime(), A0[k]]; }).filter(([ts, a]) => ts > 0 && Array.isArray(a));
}

// ================= 31. Cadre GPS : le GPS revient dans le cadre quand tu reviens sur l'accueil =================
// Quand une appli passe en plein écran devant l'accueil (le GPS lui-même, la radio, le téléphone…) ou que tu touches Accueil,
// Android range la petite fenêtre derrière. Si le GPS avait été ouvert dans le cadre et que la petite fenêtre marche (mode « cadre »),
// il y est remis en revenant sur l'accueil. Si le système le remet aussitôt en plein écran, on n'insiste pas pendant 10 min.
function gbRedock(why) {
  gbHidAt = 0;
  if (window.Perf725 && Perf725.paused()) return;
  if (!store.get('gbRedock', true) || !gbLive || gbMode() !== 'cadre' || !A) return;
  if (gbFlip()) { dlogAdd('cadre', `pas de remise dans le cadre (${why}) : la dernière ouverture est passée en plein écran`); return; }   // v7.3 : pas de rebond
  const now = Date.now(); if (now - gbRedockOff < 10 * 60000 || now - gbRedockAt < 3000) return;
  setTimeout(() => {
    if (document.hidden || tab !== 'home' || editing || welEl || brfEl || memoEl || gbMenu || plKp) return;
    if (!gbRect()) return;                                                       // cadre pas sur cette page, ou caché par une fenêtre de l'appli
    gbRedockAt = Date.now(); gbKey = ''; gbLaunch(true, why);
  }, 600);
}
{ const k0 = window.onHomeKey; window.onHomeKey = function () { const r = k0 ? k0.apply(this, arguments) : undefined; gbRedock('touche Accueil'); return r; }; }
{ const a1 = window.act; window.act = function (a, long) { gbActAt = Date.now(); gbActName = String(a).slice(0, 40); return a1.apply(this, arguments); }; }   // pour le journal : appui de ta part ou pas
{ const nav = SETCATS.find((c) => c[0] === 'Navigation'), sub = nav && nav[1].find(([n]) => n === 'Cadre GPS');
  if (sub) { const f0 = sub[1]; sub[1] = (p) => { const h = f0(p), on = store.get('gbRedock', true);
    const row = setRow(p, 'Remettre le GPS dans le cadre', gbMode() === 'cadre' ? 'Quand tu reviens sur l\'accueil (touche Accueil, ou après une appli en plein écran), le GPS que tu avais ouvert dans le cadre y revient tout seul.' : 'Possible seulement quand la petite fenêtre marche sur ton autoradio.', chipBtn(p, 'gb:redock', on ? 'Activé' : 'Désactivé', on));
    const k = h.indexOf('Décalage vertical'), i = k > 0 ? h.lastIndexOf('<div style="display:flex;align-items:center;justify-content:space-between', k) : -1;   // juste après « Ouvrir tout seul au démarrage »
    return i > 0 ? h.slice(0, i) + row + h.slice(i) : h + row; }; } }

// zone libre à côté du cadre quand le GPS y est ouvert : la petite fenêtre passe au-dessus de l'appli, les fenêtres de l'appli se mettent à côté
function gbFreeZone() {
  try {
    if (!gbLive || gbMode() !== 'cadre' || tab !== 'home' || document.hidden) return null;
    const el = document.querySelector('#screen .gpsbox'), st = $('stage'); if (!el || !st) return null;
    const r = el.getBoundingClientRect(), s = st.getBoundingClientRect(), k = s.width / 1280 || 1;
    const fl = (r.left - s.left) / k, fr = (r.right - s.left) / k, right = 1280 - fr - 28, left = fl - 28;
    if (right >= left && right >= 480) return { left: Math.round(fr + 12), w: Math.round(right) };
    if (left >= 480) return { left: 16, w: Math.round(left) };
  } catch (e) { /* rien */ }
  return null;
}

// ================= 32. Cadre GPS sans piège (v7.3) =================
// 1) Si le GPS repasse en plein écran juste après une ouverture dans le cadre, c'est presque toujours qu'il était
//    déjà ouvert en grand : Android ramène sa fenêtre telle quelle. On le note, on ne le relance plus tout seul
//    (plus de rebond à chaque retour sur l'accueil) et le cadre dit quoi faire : le fermer, puis « Ouvrir ici ».
// 2) Mode modification, autre page ou autre onglet : l'icône GPS et le cadre ouvrent quand même dans le cadre
//    (on sort de la modification et on va sur la bonne page), au lieu de lancer le GPS en plein écran.
// 3) Mode modification : rappel sur le cadre, et sortie toute seule après 45 s sans toucher l'écran ou si la voiture roule.
function gbFlip() { const f = store.get('gbFlip', null); return f && f.t && Date.now() - f.t < 12 * 3600e3 ? f : null; }
function gbFlipAdd(dt, why) { const f = gbFlip(); store.set('gbFlip', { t: Date.now(), n: f ? (f.n || 1) + 1 : 1, dt: dt || 0, why: String(why || '').slice(0, 40) }); }
function gbFlipClear(why) { if (!store.get('gbFlip', null)) return false; store.set('gbFlip', null); dlogAdd('cadre', `de nouveau dans le cadre ✓ (${why || 'ouverture'})`); return true; }
// page de l'accueil (disposition libre) qui contient le cadre GPS ; -1 s'il n'y en a pas
function gbWhere() {
  try {
    if (palette().layout !== 'custom') return document.querySelector('#screen .gpsbox') && tab === 'home' ? homePage : -1;
    const pages = fCfg().pages || [];
    for (let i = 0; i < pages.length; i++) if ((pages[i] || []).some((it) => it.t === 'w' && (it.b || []).includes('gpsbox'))) return i;
  } catch (e) { /* rien */ }
  return -1;
}
function gbWhyNot() {
  const el = document.querySelector('#screen .gpsbox');
  if (tab !== 'home') return 'pas sur l\'accueil'; if (editing) return 'mode modification'; if (gbMenu) return 'menu ouvert'; if (!el) return 'pas sur cette page';
  const r = el.getBoundingClientRect(); return r.width < 60 || r.height < 60 ? 'cadre trop petit' : 'caché';
}
// ouvre le GPS dans le cadre quoi qu'il arrive (sort de la modification, ferme le menu, va sur la bonne page). false = pas de cadre.
function gbOpenHere(why) {
  if (gbMode() === 'plein') return false;
  const pg = gbWhere(); if (pg < 0) return false;
  let moved = false;
  if (editing && palette().layout === 'custom') { fDone(); moved = true; dlogAdd('cadre', `mode modification quitté pour ouvrir le GPS dans le cadre (${why})`); }
  if (gbMenu) { gbAct('menux'); moved = true; }
  try { if ($('drawer').classList.contains('on') || $('settings').classList.contains('on')) { closeOverlays(); moved = true; } } catch (e) { /* rien */ }
  try { if (palette().layout === 'custom') { const it = (fCfg().pages[pg] || []).find((x) => x.t === 'w' && (x.b || []).includes('gpsbox')); const k = it ? it.b.indexOf('gpsbox') : -1; if (it && it.b.length > 1 && (stackIdx[it.id] || 0) !== k) { stackIdx[it.id] = k; moved = true; } } } catch (e) { /* rien */ }
  if (tab !== 'home' || homePage !== pg) { tab = 'home'; homePage = pg; moved = true; }
  const go = () => { gbKey = ''; if (gbRect(true)) { gbLaunch(true, why, true); return; }
    dlogAdd('cadre', `${why} : cadre GPS introuvable à l'écran (${gbWhyNot()}) → plein écran`); gbFull(); };
  if (moved) { render(); setTimeout(go, 450); } else go();
  return true;
}
// fermer le GPS : Android ne laisse pas une appli en fermer une autre → on ouvre la liste des applis (GPS → Forcer l'arrêt)
let gbKillAt = 0;
function gbKill() {
  const nm = gbName(gbPk()); gbKillAt = Date.now(); dlogAdd('cadre', `fermeture de ${nm} demandée (liste des applis)`);
  if (!A) { toast(`Aperçu : ouvrirait la liste des applis (${nm} → Forcer l'arrêt)`); return; }
  fwOpen(['android.settings.MANAGE_APPLICATIONS_SETTINGS', 'android.settings.MANAGE_ALL_APPLICATIONS_SETTINGS', 'android.settings.APPLICATION_SETTINGS'], 'Applications');
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden || !gbKillAt) return; const t = gbKillAt; gbKillAt = 0;
  if (Date.now() - t < 5 * 60000 && tab === 'home') setTimeout(() => toast(`${gbName(gbPk())} fermé ? Touche « ▶ Ouvrir ici »`), 500);
});
// le cadre explique ce qui s'est passé
{ const r0 = GBLOCKS.gpsbox.r; GBLOCKS.gpsbox.r = function (p) {
  const f = gbFlip(), m = gbMode();
  if (m === 'plein') {      // « plein » : peut aussi venir d'un GPS déjà ouvert en grand au 1er essai
    const nm = gbName(gbPk());
    return r0.apply(this, arguments).replace('Comment l\'activer ?</b>', `Comment l'activer ?</b><br>Si ${esc(nm)} était déjà ouvert, ferme-le puis « Réessayer en petit ».`)
      .replace('>Changer d\'appli</button>', `>Changer d'appli</button><button data-act="gb:kill" style="height:42px;padding:0 14px;border-radius:${Math.max(8, p.r - 6)}px;background:${p.card2};color:${p.txt};font-size:14px;font-weight:700;border:1px solid ${p.mut}33">Fermer ${esc(nm)}…</button>`);
  }
  if (!f) return r0.apply(this, arguments);
  const pk = gbPk(), nm = gbName(pk), d = new Date(f.t), hm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  const b = (act, t, main) => `<button data-act="${act}" style="height:42px;padding:0 14px;border-radius:${Math.max(8, p.r - 6)}px;background:${main ? p.acc : p.card2};color:${main ? p.onAcc : p.txt};font-size:14px;font-weight:700;border:1px solid ${p.mut}33">${t}</button>`;
  return `<div class="gpsbox" data-act="gb:tap" data-gbflip="1" style="position:relative;height:100%;overflow:hidden;clip-path:inset(0 round ${p.r}px);${card(p, `background:${p.card2};border:2px solid #F2A23A99;padding:0`)};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;text-align:center">
    <span class="fic" style="--ics:52px;background:${hashCol(pk)}">${esc(nm.charAt(0))}<img data-icon="${esc(pk)}" alt=""></span>
    <div style="font-size:17px;font-weight:700;max-width:92%">${esc(nm)} est passé en plein écran</div>
    <div style="font-size:13px;color:${p.mut};max-width:90%;line-height:1.4">${f.n > 1 ? f.n + ' fois, la dernière' : 'À'} ${f.n > 1 ? 'à ' : ''}${hm}. Il était sans doute déjà ouvert en grand : <b style="color:${p.txt}">ferme-le</b> (« Fermer ${esc(nm)} » → Forcer l'arrêt), puis « Ouvrir ici ».<br><span data-act="gb:help" style="color:${p.acc};text-decoration:underline">Toujours pareil ? Vérifie la petite fenêtre</span></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:96%">${b('gb:open', '▶ Ouvrir ici', true)}${b('gb:kill', 'Fermer ' + esc(nm) + '…')}${b('gb:full', 'Plein écran')}${b('gb:menu', 'Changer d\'appli')}</div></div>`;
}; }
// mode modification : rappel sur le cadre GPS
{ const r1 = window.render; window.render = function () { const out = r1.apply(this, arguments);
  try { if (editing && tab === 'home') { const box = document.querySelector('#screen .gpsbox'), it = box && box.closest('[data-fitem]'), ov = it && it.querySelector('[data-fdrag]');
    if (ov && !ov.querySelector('[data-gbhint]')) { ov.style.flexDirection = 'column'; ov.style.gap = '8px'; const d = document.createElement('div'); d.setAttribute('data-gbhint', '1');
      d.style.cssText = 'background:#000c;color:#fff;border-radius:8px;padding:5px 10px;font-size:12.5px;font-weight:600;max-width:90%;text-align:center;pointer-events:none;line-height:1.35';
      d.textContent = 'Mode modification : touche « OK » en haut à droite pour te servir du GPS'; ov.appendChild(d); } } } catch (e) { /* rien */ }
  return out; }; }
// mode modification : sortie toute seule (45 s sans toucher l'écran, ou la voiture roule)
setInterval(() => { try {
  if (!editing || tab !== 'home' || palette().layout !== 'custom' || fDrag || fPick || fFolder || fAsk) return;
  const mv = moving(); if (!mv && Date.now() - lastTouch < 45000) return;
  fDone(); dlogAdd('accueil', mv ? 'mode modification quitté : la voiture roule' : 'mode modification quitté tout seul (45 s sans toucher l\'écran)'); toast('Accueil enregistré');
} catch (e) { /* rien */ } }, 5000);


// ================= 33. Disposition « Autoradio » (v7.4) : comme le thème d'origine du poste =================
// barre d'icônes à gauche · vitesse + route + météo en haut à gauche · GPS (Waze) en grand en haut à droite
// · musique en bas à gauche · rangée de raccourcis en bas à droite. Thème bleu, boutons rouges.
if (!THEMES.some((t) => t.id === '150')) THEMES.push(P('150', 'Autoradio Bleu', 'custom', { bg: '#1d3a92', acc: '#E53935', r: 18, font: 'Inter', dock: 'glass', grad: ['#16307e', '#3159c6', 160] }));
function presetAutoradio() {
  const i = profIdx(), m = store.get('profileThemes', {}); m[i] = '150'; store.set('profileThemes', m);
  store.set('layout_' + i, 'custom'); store.set('dockPos_' + i, 'gauche'); store.set('iconFam', 'autoradio'); store.set('onePage_' + i, true); store.set('mCompact', true);
  const c = fCfg(), W = (b, x, y, w, h) => ({ id: nid(), t: 'w', b: [b], x, y, w, h });
  c.pages = [[W('carfull', 0, 0, 5, 4), W('gpsbox', 5, 0, 7, 4), W('music', 0, 4, 5, 2), W('apps', 5, 4, 7, 2)]];
  fSave(c); homePage = 0; tab = 'home'; render(); toast('Disposition « Autoradio » appliquée');
}
// raccourcis en une seule rangée quand le bloc est large et bas (comme en bas à droite de l'autoradio)
{ const r0 = GBLOCKS.apps.r; GBLOCKS.apps.r = function (p, w, h) {
  if (!(w >= 3 && h <= 1.5)) return r0.apply(this, arguments);
  const fam = icf(), ids = SHORTCUTS.slice(0, 5);
  return `<div style="${card(p, 'padding:10px 16px;display:flex;justify-content:space-around;align-items:center;height:100%')}">${ids.map((id) => { const d = DOCK_ALL.find((x) => x.id === id); if (!d) return '';
    const tile = fam ? icTile(fam, d.icon, ICV[d.id] || ICV[d.icon] || hashCol(d.id), 66, p) : `<span style="width:66px;height:66px;border-radius:16px;background:${d.bg};display:flex;align-items:center;justify-content:center">${ic(d.icon, 32, '#fff', 2.3)}</span>`;
    return `<button data-act="dock:${id}" style="display:flex;flex-direction:column;align-items:center;gap:8px;font-size:15px;font-weight:600;color:${p.txt}">${tile}<span>${d.label}</span></button>`; }).join('')}</div>`;
}; }
// une seule page d'accueil (les applis restent dans « ••• »)
{ const h0 = window.homePageCount; window.homePageCount = function () { if (store.get('onePage_' + profIdx(), false) && !editing) return 1; return h0.apply(this, arguments); }; }
// lecteur de musique compact : pochette + titre + artiste, et 3 boutons ronds rouges dessous
{ const m0 = GBLOCKS.music.r; GBLOCKS.music.r = function (p, w, h) {
  if (!store.get('mCompact', false) || h > 1.6) return m0.apply(this, arguments);
  const rb = (act, path, lab, k) => `<button data-act="${act}" aria-label="${lab}" ${k ? 'data-k="mPlayIcon"' : ''} style="width:46px;height:46px;border-radius:50%;background:${p.acc};color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px #0006">${path}</button>`;
  return `<div style="${card(p, 'padding:12px 16px;display:flex;flex-direction:column;justify-content:space-between;gap:8px;color:#fff')}">
    <div style="display:flex;gap:14px;align-items:center;min-width:0">${coverC(p, '74px')}${mText(p, 19)}</div>
    <div style="display:flex;justify-content:center;gap:34px">${rb('mPrev', '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 5h2v14H6zM20 5l-10 7 10 7z"/></svg>', 'Précédent')}${rb('mPlay', playIcon(false), 'Lecture', true)}${rb('mNext', '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M16 5h2v14h-2zM4 5l10 7-10 7z"/></svg>', 'Suivant')}</div></div>`;
}; }
{ const a1 = window.act; window.act = function (a, long) { if (a === 'preset:autoradio') { presetAutoradio(); return; } return a1.apply(this, arguments); }; }


// ================= 34. Thème Autoradio : couleurs, fonds, personnalisation, rangée d'applis modifiable (v7.4) =================
const AR_TH = [['150', 'Bleu', ['#16307e', '#3159c6'], '#E53935'], ['151', 'Nuit', ['#07090f', '#1f2a44'], '#2F80FF'], ['152', 'Bordeaux', ['#22060a', '#8e1b2a'], '#F5B700'],
  ['153', 'Émeraude', ['#06281f', '#127a5c'], '#FFC93C'], ['154', 'Violet', ['#1b0f3a', '#5b2bb5'], '#FF4D8D'], ['155', 'Carbone', ['#121214', '#3a3d44'], '#FF6A00'], ['156', 'Blanc', ['#f5f7fb', '#cfd9ee'], '#E53935', true]];
AR_TH.forEach(([id, n, g, acc, light]) => { if (!THEMES.some((x) => x.id === id)) THEMES.push(P(id, 'Autoradio ' + n, 'custom', { bg: g[0], acc, r: 18, font: 'Inter', dock: 'glass', grad: [g[0], g[1], 160], light: !!light })); });
const arIsTheme = () => /^15[0-6]$/.test(palette().tid || '');
// ---- rangée d'applis (en bas à droite) : modifiable directement sur l'accueil ----
const AR_FIX = { radio: 'Radio', settings: 'Réglages', music: 'Musique', carplay: 'CarPlay / AA', car: 'Ma voiture', phone: 'Téléphone', gps: 'GPS' };
const arApps = () => store.get('arApps_' + profIdx(), ['d:radio', 'd:settings', 'd:music', 'd:carplay', 'd:car']);
let arEdit = false, arPick = null;
function arTile(key, s, p) {
  const fam = icf() || 'autoradio';
  if (key.indexOf('d:') === 0) { const d = DOCK_ALL.find((x) => x.id === key.slice(2)); return d ? [icTile(fam, d.icon, ICV[d.id] || ICV[d.icon] || hashCol(d.id), s, p), AR_FIX[d.id] || d.label] : ['', '?']; }
  const pk = key.slice(2), nm = (allApps().find((a) => a.p === pk) || {}).l || pk.split('.').pop();
  return [`<span class="fic" style="--ics:${s}px;background:${hashCol(pk)};box-shadow:0 5px 12px #000a">${esc(nm.charAt(0).toUpperCase())}<img data-icon="${esc(pk)}" alt=""></span>`, nm];
}
{ const r0 = GBLOCKS.apps.r; GBLOCKS.apps.r = function (p, w, h) {
  if (!(w >= 3 && h <= 1.5)) return r0.apply(this, arguments);
  const L = arApps(), s = 64;
  const items = L.map((k, i) => { const [tile, nm] = arTile(k, s, p);
    return `<div style="position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;width:${s + 30}px">
      <button data-act="${arEdit ? 'arapp:pick:' + i : 'arapp:open:' + i}" style="display:flex;flex-direction:column;align-items:center;gap:8px;color:${p.txt};${arEdit ? 'animation:fjig .28s infinite alternate' : ''}">${tile}<span style="font-size:14px;font-weight:600;max-width:${s + 30}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(nm)}</span></button>
      ${arEdit ? `<button data-act="arapp:del:${i}" aria-label="Retirer" style="position:absolute;top:-8px;right:4px;width:28px;height:28px;border-radius:50%;background:#E53935;color:#fff;font-size:20px;font-weight:800;line-height:28px;box-shadow:0 2px 6px #0008">−</button>` : ''}</div>`; }).join('');
  const plus = arEdit && L.length < 6 ? `<button data-act="arapp:pick:new" style="display:flex;flex-direction:column;align-items:center;gap:8px;color:${p.txt};width:${s + 30}px"><span style="width:${s}px;height:${s}px;border-radius:22%;border:2px dashed ${p.txt}88;display:flex;align-items:center;justify-content:center;font-size:34px">+</span><span style="font-size:14px;font-weight:600">Ajouter</span></button>` : '';
  const done = arEdit ? `<button data-act="arapp:done" style="position:absolute;top:8px;right:10px;height:34px;padding:0 14px;border-radius:17px;background:${p.acc};color:${p.onAcc};font-weight:700;font-size:14px">OK</button>` : '';
  return `<div data-arapps style="${card(p, 'position:relative;padding:10px 16px;display:flex;justify-content:space-around;align-items:center;height:100%')}">${items}${plus}${done}</div>`;
}; }
function arPickHtml(p) {
  if (arPick == null) return '';
  const fixed = Object.keys(AR_FIX).map((id) => 'd:' + id), apps = allApps().map((a) => 'a:' + a.p), L = arApps();
  const cell = (k) => { const [tile, nm] = arTile(k, 58, p), on = L.includes(k);
    return `<button data-act="arapp:set:${esc(k)}" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px 4px;border-radius:14px;color:${p.txt};${on ? `background:${p.acc}22;box-shadow:inset 0 0 0 2px ${p.acc}` : ''}">${tile}<span style="font-size:13px;font-weight:600;max-width:100px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(nm)}</span></button>`; };
  return `<div style="position:fixed;inset:0;z-index:900;background:#0009;display:flex;align-items:center;justify-content:center" data-act="arapp:close">
    <div data-noswipe style="width:900px;max-height:600px;overflow:auto;border-radius:22px;padding:18px 22px;font-family:Inter,system-ui,sans-serif;background:${p.light ? '#fff' : '#1b2233'};color:${p.txt};box-shadow:0 20px 50px #000a" onclick="event.stopPropagation()">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><b style="font-size:20px">${arPick === 'new' ? 'Ajouter une appli' : 'Remplacer par…'}</b><button data-act="arapp:close" style="height:38px;padding:0 16px;border-radius:19px;background:${p.card2};color:${p.txt};font-weight:700">Fermer</button></div>
      <div style="font-size:13px;opacity:.75;margin:2px 0 8px">Raccourcis de l'appli</div><div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px">${fixed.map(cell).join('')}</div>
      <div style="font-size:13px;opacity:.75;margin:14px 0 8px">Tes applis installées</div><div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px">${apps.map(cell).join('')}</div></div></div>`;
}
{ const r1 = window.render; window.render = function () { const out = r1.apply(this, arguments); try { const h = arPickHtml(curP || palette()); const old = document.getElementById('arPickLayer'); if (old) old.remove(); if (h) { const d = document.createElement('div'); d.id = 'arPickLayer'; d.innerHTML = h; document.body.appendChild(d); loadIcons && loadIcons(); } } catch (e) { /* rien */ } return out; }; }
{ const a1 = window.act; window.act = function (a, long) {
  if (a.indexOf('arapp:') !== 0) return a1.apply(this, arguments);
  const [, k, v] = a.split(':'), L = arApps().slice(), i = +v, key = a.slice(('arapp:' + k + ':').length);
  if (k === 'open') { if (long) { arEdit = true; render(); return; } const it = L[i] || ''; if (it.indexOf('d:') === 0) return a1.call(this, 'dock:' + it.slice(2)); if (A && A.launch) A.launch(it.slice(2)); else toast('Aperçu : ouvrirait ' + it.slice(2)); return; }
  if (k === 'del') { L.splice(i, 1); store.set('arApps_' + profIdx(), L); render(); return; }
  if (k === 'pick') { arPick = v === 'new' ? 'new' : i; render(); return; }
  if (k === 'set') { if (arPick === 'new') L.push(key); else if (arPick != null) L[arPick] = key; store.set('arApps_' + profIdx(), L.slice(0, 6)); arPick = null; render(); return; }
  if (k === 'close') { arPick = null; render(); return; }
  if (k === 'done') { arEdit = false; arPick = null; render(); return; }
}; }
// ---- musique encore plus compacte ----
{ const m1 = GBLOCKS.music.r; GBLOCKS.music.r = function (p, w, h) {
  if (!store.get('mCompact', false) || h > 1.6) return m1.apply(this, arguments);
  const rb = (act, path, lab, k, s) => `<button data-act="${act}" aria-label="${lab}" ${k ? 'data-k="mPlayIcon"' : ''} style="width:${s}px;height:${s}px;border-radius:50%;background:${p.acc};color:${p.onAcc};display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px #0006">${path}</button>`;
  const ico = (d) => `<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="${d}"/></svg>`;
  return `<div style="${card(p, 'padding:10px 14px;display:flex;align-items:center;gap:12px;color:' + p.txt)}">
    ${coverC(p, '58px')}<div style="flex:1;min-width:0">${mText(p, 16)}</div>
    <div style="display:flex;gap:10px;flex:none">${rb('mPrev', ico('M6 5h2v14H6zM20 5l-10 7 10 7z'), 'Précédent', false, 38)}${rb('mPlay', playIcon(false), 'Lecture', true, 46)}${rb('mNext', ico('M16 5h2v14h-2zM4 5l10 7-10 7z'), 'Suivant', false, 38)}</div></div>`;
}; }
// le préréglage : musique plus basse (1 rangée et demie), route plus haute
{ const pr0 = presetAutoradio; presetAutoradio = function () { pr0(); const c = fCfg(), W = (b, x, y, w, h) => ({ id: nid(), t: 'w', b: [b], x, y, w, h });
  c.pages = [[W('carfull', 0, 0, 5, 5), W('gpsbox', 5, 0, 7, 4), W('music', 0, 5, 5, 1), W('apps', 5, 4, 7, 2)]]; fSave(c); render(); }; }
// ---- page Thèmes : section « Autoradio » en tête ----
function arThemesSec(p) {
  const cur = palette().tid, i = profIdx(), c = custom(i, cur);
  const chk = (act, on, label) => `<button data-act="${act}" style="display:flex;align-items:center;gap:10px;height:40px;font-size:14px;color:${p.txt}"><span style="width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;${on ? `background:${p.acc};color:${p.onAcc}` : `box-shadow:inset 0 0 0 2px ${p.mut}`}">${on ? '✓' : ''}</span>${label}</button>`;
  const mini = ([id, n, g, acc, light]) => { const fg = light ? '#1d2433' : '#fff';
    return `<button data-act="arth:${id}" style="display:flex;flex-direction:column;gap:6px;align-items:center;color:${p.txt}"><span style="position:relative;width:150px;height:86px;border-radius:12px;overflow:hidden;background:linear-gradient(160deg,${g[0]},${g[1]});box-shadow:${cur === id ? `0 0 0 3px ${p.acc}` : '0 2px 6px #0006'}">
      <span style="position:absolute;left:5px;top:6px;bottom:6px;width:14px;border-radius:5px;background:${light ? '#ffffffcc' : '#ffffff26'}"></span>
      <span style="position:absolute;left:24px;top:6px;width:52px;height:44px;border-radius:6px;background:#2a4896"></span><span style="position:absolute;left:80px;top:6px;right:6px;height:44px;border-radius:6px;background:${light ? '#ffffffaa' : '#ffffff22'}"></span>
      <span style="position:absolute;left:24px;bottom:6px;width:52px;height:28px;border-radius:6px;background:${light ? '#ffffffaa' : '#ffffff1a'}"><span style="position:absolute;right:5px;top:8px;width:12px;height:12px;border-radius:50%;background:${acc}"></span></span>
      <span style="position:absolute;left:80px;right:6px;bottom:6px;height:28px;border-radius:6px;background:${light ? '#ffffffaa' : '#ffffff1a'};display:flex;gap:4px;align-items:center;justify-content:center">${['#E2363A', '#6B7280', '#fff', '#2EB84E', '#2A6BEA'].map((x) => `<i style="width:11px;height:11px;border-radius:3px;background:${x}"></i>`).join('')}</span></span>
      <b style="font-size:14px">${n}${cur === id ? ' ✓' : ''}</b></button>`; };
  const walls = WALLS.filter((w, k) => k % 7 === 0).slice(0, 8);
  const wcur = pv('wall', '');
  const wcell = (id, lab, bg) => `<button data-act="arwall:${id}" style="display:flex;flex-direction:column;gap:5px;align-items:center;color:${p.txt}"><span style="width:118px;height:66px;border-radius:10px;background:${bg};background-size:cover;box-shadow:${wcur === id ? `0 0 0 3px ${p.acc}` : '0 2px 6px #0006'}"></span><span style="font-size:12.5px">${lab}</span></button>`;
  const sw = (cols, act, curv) => cols.map((x) => `<button data-act="${act}:${x}" style="width:34px;height:34px;border-radius:50%;background:${x};box-shadow:${curv === x ? `0 0 0 3px ${p.txt}` : 'inset 0 0 0 1px #ffffff40'}"></button>`).join('');
  return `<div style="${card(p, 'padding:14px 16px;display:flex;flex-direction:column;gap:12px')}">
    <div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:18px">Autoradio</b>${smallBtn(p, 'preset:autoradio', 'Appliquer la disposition Autoradio', true)}</div>
    <div style="font-size:13px;color:${p.mut}">Couleurs</div><div style="display:flex;gap:12px;flex-wrap:wrap">${AR_TH.map(mini).join('')}</div>
    <div style="font-size:13px;color:${p.mut}">Fond d'écran</div><div style="display:flex;gap:10px;flex-wrap:wrap">${wcell('', 'Celui du thème', `linear-gradient(160deg,${(AR_TH.find((x) => x[0] === cur) || AR_TH[0])[2].join(',')})`)}${walls.map((w) => wcell(w.id, w.cat, `url(${wallUrl(w.id)})`)).join('')}${wcell('photo', 'Ma photo…', '#ffffff14')}</div>
    <div style="font-size:13px;color:${p.mut}">Personnaliser</div>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px">
      <div style="background:${p.card2};border-radius:12px;padding:10px 12px"><div style="font-size:13px;font-weight:600;margin-bottom:8px">Couleur des boutons</div><div style="display:flex;gap:8px;flex-wrap:wrap">${sw(['#E53935', '#2F80FF', '#FFC93C', '#2EB84E', '#FF4D8D', '#FF6A00', '#FFFFFF'], 'acc', c.acc || palette().acc)}</div></div>
      <div style="background:${p.card2};border-radius:12px;padding:10px 12px"><div style="font-size:13px;font-weight:600;margin-bottom:8px">Couleur du fond (dégradé)</div><div style="display:flex;gap:8px;flex-wrap:wrap">${sw(['#16307e', '#07090f', '#8e1b2a', '#127a5c', '#5b2bb5', '#3a3d44', '#cfd9ee'], 'argrad', c.g2 || '')}</div></div>
      <div style="background:${p.card2};border-radius:12px;padding:10px 12px"><div style="font-size:13px;font-weight:600;margin-bottom:8px">Cartes</div>${chk('toggleGlass', !!c.glass, 'Transparentes (laissent voir le fond)')}<div style="font-size:12px;color:${p.mut};margin-top:6px">Assombrir le fond d'écran : réglage « Luminosité du fond »</div></div>
    </div></div>`;
}
{ const pt0 = window.pageThemes; window.pageThemes = function (p) { const h = pt0.apply(this, arguments); const k = h.indexOf('<div class="scroll"'); if (k < 0) return h; const e = h.indexOf('>', k) + 1; return h.slice(0, e) + arThemesSec(p) + h.slice(e); }; }
{ const a1 = window.act; window.act = function (a, long) {
  if (a.indexOf('arth:') === 0) { const m = store.get('profileThemes', {}); m[profIdx()] = a.slice(5); store.set('profileThemes', m); render(); return; }
  if (a.indexOf('arwall:') === 0) { const v = a.slice(7); if (v === 'photo') return a1.call(this, 'wall:photo'); store.set('wall_' + profIdx(), v); render(); return; }
  if (a.indexOf('argrad:') === 0) { const g2 = a.slice(7); setCustom({ bgType: 'grad', g1: mix47(g2, 0.55, 0), g2, angle: 160 }); render(); return; }
  return a1.apply(this, arguments); }; }


// ================= 35. v7.4 : villes autour, forêt / village, barre du poste, thème par défaut =================
// --- liste des villes et villages autour (OpenStreetMap), relue tous les 3 km ou toutes les 2 min en roulant ---
let plList = [], plAt = 0, plPos = null, plBusy = false, plHead = null, plHeadPos = null, plPick = null, plPickAt = 0;
let forestOn = false, forestAt = 0, forestPos = null, forestBusy = false;
async function plFetch() {
  if (!loc || DEMO || plBusy) return;
  const mv = (curSpeed() || {}).v > 5, far = !plPos || hav(plPos.lat, plPos.lon, loc.lat, loc.lon) > 3;
  if (!far && Date.now() - plAt < (mv ? 120000 : 600000)) return;
  plBusy = true;
  try {
    const q = `[out:json][timeout:12];node(around:25000,${loc.lat.toFixed(4)},${loc.lon.toFixed(4)})[place~"^(city|town|village|hamlet)$"][name];out 300;`;
    const els = (await getJSON('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(q))).elements || [];
    plList = els.map((e) => ({ n: e.tags.name, k: e.tags.place, lat: e.lat, lon: e.lon })); plAt = Date.now(); plPos = { lat: loc.lat, lon: loc.lon };
    dlogAdd('route', `${plList.length} villes et villages autour chargés`);
  } catch (e) { /* pas de réseau : on garde l'ancienne liste */ }
  plBusy = false;
}
// dans une forêt ? (le point est-il à l'intérieur d'un bois sur la carte) — relu tous les 400 m, 30 s minimum
async function forestFetch() {
  if (!loc || DEMO || forestBusy) return;
  if (forestPos && (hav(forestPos.lat, forestPos.lon, loc.lat, loc.lon) < 0.4 || Date.now() - forestAt < 30000)) return;
  forestBusy = true;
  try {
    const la = loc.lat.toFixed(5), lo = loc.lon.toFixed(5);
    const q = `[out:json][timeout:10];is_in(${la},${lo})->.a;(way(pivot.a)[landuse=forest];way(pivot.a)[natural=wood];rel(pivot.a)[landuse=forest];rel(pivot.a)[natural=wood];);out ids 1;`;
    const els = (await getJSON('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(q))).elements || [];
    forestOn = els.length > 0; forestAt = Date.now(); forestPos = { lat: loc.lat, lon: loc.lon };
  } catch (e) { /* pas de réseau */ }
  forestBusy = false;
}
setInterval(() => { if (tab !== 'home' && !store.get('gbAuto', false)) return; plFetch(); if(!window.RoadScene731)forestFetch(); }, 5000);
// cap suivi : celui du GPS, sinon calculé entre deux positions à plus de 40 m
function plHeading() {
  if (!loc) return null;
  if (loc.brg != null && (loc.spd || 0) > 2) return loc.brg;
  if (!plHeadPos) { plHeadPos = { lat: loc.lat, lon: loc.lon }; return plHead; }
  if (hav(plHeadPos.lat, plHeadPos.lon, loc.lat, loc.lon) > 0.04) { plHead = brg47(plHeadPos.lat, plHeadPos.lon, loc.lat, loc.lon); plHeadPos = { lat: loc.lat, lon: loc.lon }; }
  return plHead;
}
function brg47(a, b, c, d) { const t = Math.PI / 180, y = Math.sin((d - b) * t) * Math.cos(c * t), x = Math.cos(a * t) * Math.sin(c * t) - Math.sin(a * t) * Math.cos(c * t) * Math.cos((d - b) * t); return (Math.atan2(y, x) / t + 360) % 360; }
// village où l'on est (à moins de 1,2 km du centre), sinon null
function plVillageHere() {
  if (!loc || !plList.length) return null; let best = null, bd = 9;
  for (const x of plList) { if (x.k !== 'village' && x.k !== 'hamlet') continue; const d = hav(loc.lat, loc.lon, x.lat, x.lon); if (d < bd) { bd = d; best = x; } }
  return best && bd < 1.2 ? best : null;
}
// ville ou village le plus proche DEVANT (dans un cône de ±70° autour du cap) ; choisi toutes les 10 s, distance recalculée à chaque appel
window.roadPlace = function () {
  if (!loc || !plList.length || !plPos || hav(plPos.lat, plPos.lon, loc.lat, loc.lon) > 25) return null;
  if (sceneCur === 'village') { const v = plVillageHere(); if (v) return { name: v.n, km: hav(loc.lat, loc.lon, v.lat, v.lon) }; }
  if (!plPick || Date.now() - plPickAt > 10000) {
    const h = plHeading(); let best = null, bd = 1e9;
    for (const x of plList) {
      const d = hav(loc.lat, loc.lon, x.lat, x.lon); if (d < 0.5 || d > 25) continue;
      if (h != null) { let df = Math.abs(brg47(loc.lat, loc.lon, x.lat, x.lon) - h); if (df > 180) df = 360 - df; if (df > 70) continue; }
      const w = d * (x.k === 'city' ? 0.6 : x.k === 'town' ? 0.8 : x.k === 'hamlet' ? 1.3 : 1);   // une ville compte un peu plus qu'un hameau
      if (w < bd) { bd = w; best = x; }
    }
    plPick = best; plPickAt = Date.now();
  }
  return plPick ? { name: plPick.n, km: hav(loc.lat, loc.lon, plPick.lat, plPick.lon) } : null;
};
// décor : village et forêt en plus d'autoroute / ville / campagne
{ const sw0 = sceneWanted; sceneWanted = function () {
  const w = sw0.apply(this, arguments); if (store.get('roadScene', 'auto') !== 'auto') return w;
  if (w === 'autoroute') return w;
  if (w === 'ville' && plVillageHere() && !(limit && limit > 50 && limit < 70)) { const v = plVillageHere(); if (v) return 'village'; }
  if (w === 'campagne' && forestOn && Date.now() - forestAt < 180000) return 'foret';
  if (w === 'campagne' && plVillageHere() && (curSpeed() || {}).v < 60) return 'village';
  return w;
}; }

// --- barre du poste : quand le GPS est dans le cadre, Android affiche sa barre en haut → l'accueil descend d'autant ---
{ const st = document.createElement('style'); st.textContent = '#screen.gbbar{top:var(--gbBarH,40px)!important}'; document.head.appendChild(st); }
const gbBarH = () => store.get('gbBarH', 40);
let gbEver = false;   // v7.6 : une fois le GPS ouvert dans le cadre, l'accueil reste descendu (sinon le cadre bougeait sous Waze)
function gbBarWant() { return store.get('gbBarOn', true) && (gbLive || gbEver) && gbMode() === 'cadre' && !gbFlip(); }
function gbBarApply(on) {
  const sc = document.getElementById('screen'); if (!sc) return false;
  document.documentElement.style.setProperty('--gbBarH', gbBarH() + 'px');
  const was = sc.classList.contains('gbbar'); if (was === !!on) return false;
  sc.classList.toggle('gbbar', !!on); dlogAdd('cadre', on ? `accueil descendu de ${gbBarH()} px (barre du poste)` : 'accueil remonté'); return true;
}
// juste avant d'ouvrir le GPS dans le cadre : on descend d'abord, pour que la fenêtre soit posée au bon endroit
{ const gl0 = gbLaunch; gbLaunch = function (force, why, loose) { if (store.get('gbBarOn', true) && gbMode() === 'cadre' && A) { gbBarApply(true); gbEver = true; } return gl0.apply(this, arguments); }; }
displayEvery725(() => { const want = gbBarWant(); const sc = document.getElementById('screen'); if (!sc) return;
  if (!want && sc.classList.contains('gbbar') && Date.now() - (gbProbe || 0) > 6000) { gbBarApply(false); if (tab === 'home') render(); }
  else if (want && !sc.classList.contains('gbbar')) gbBarApply(true); }, 1000);
{ const cat = SETCATS.find(([n]) => n === 'Écran d\'accueil') || SETCATS.find(([n]) => n === 'Navigation');
  if (cat) cat[1].push(['Barre du poste (cadre GPS)', (p) => `<div style="display:flex;flex-direction:column;gap:12px;max-width:680px">
    <div style="font-size:14px;color:${p.mut}">Quand le GPS est ouvert dans le cadre, Android remet sa barre en haut (maison, Wi-Fi, heure). L'accueil descend de sa hauteur pour qu'elle ne cache rien, puis remonte quand le GPS n'est plus dans le cadre.</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">${chipBtn(p, 'gbbar:on', 'Activé', store.get('gbBarOn', true))}${chipBtn(p, 'gbbar:off', 'Désactivé', !store.get('gbBarOn', true))}</div>
    <div style="display:flex;align-items:center;gap:10px"><span style="font-size:14px">Hauteur de la barre</span>${chipBtn(p, 'gbbar:-', '−')}<b style="min-width:64px;text-align:center">${gbBarH()} px</b>${chipBtn(p, 'gbbar:+', '+')}${chipBtn(p, 'gbbar:test', 'Voir')}</div></div>`]); }
{ const a1 = window.act; window.act = function (a, long) {
  if (a.indexOf('gbbar:') !== 0) return a1.apply(this, arguments);
  const v = a.slice(6);
  if (v === 'on' || v === 'off') store.set('gbBarOn', v === 'on');
  else if (v === '+' || v === '-') { store.set('gbBarH', Math.max(0, Math.min(90, gbBarH() + (v === '+' ? 2 : -2)))); document.documentElement.style.setProperty('--gbBarH', gbBarH() + 'px'); }
  else if (v === 'test') { const sc = document.getElementById('screen'); if (sc) { sc.classList.add('gbbar'); setTimeout(() => { if (!gbBarWant()) sc.classList.remove('gbbar'); }, 3000); } }
  render(); }; }

// --- thème par défaut : la disposition « Autoradio » au tout premier démarrage (pas pour qui a déjà ses réglages) ---
if (store.get('arDefDone', null) == null) {
  const fresh = FRESH08;
  store.set('arDefDone', 1);
  if (fresh) { try {   // seulement les réglages : le premier affichage de l'appli les prendra
    const i = profIdx(), m = {}; m[i] = '150'; store.set('profileThemes', m);
    store.set('layout_' + i, 'custom'); store.set('dockPos_' + i, 'gauche'); store.set('iconFam', 'autoradio'); store.set('onePage_' + i, true); store.set('mCompact', true);
    const c = fCfg(), W = (b, x, y, w, h) => ({ id: nid(), t: 'w', b: [b], x, y, w, h });
    c.pages = [[W('carfull', 0, 0, 5, 5), W('gpsbox', 5, 0, 7, 4), W('music', 0, 5, 5, 1), W('apps', 5, 4, 7, 2)]]; fSave(c);
  } catch (e) { /* rien */ } }
}


// ================= 36. v7.5 : Waze ne disparaît plus quand on touche l'accueil =================
// Android : toucher l'accueil (appli plein écran) le fait passer devant la petite fenêtre du GPS, qui disparaît dessous.
// On remet donc le GPS devant, dans le cadre, juste après chaque appui sur l'accueil (hors du cadre).
let gbTouchAt = 0;
function gbRedockSoft(why) {
  if (Date.now() - gbRedockAt < 500) return;   // relancer le GPS déjà ouvert ne fait que le remettre devant : pas besoin d'attendre plus
  gbRedockAt = Math.min(gbRedockAt, Date.now() - 3001); gbRedock(why);
}
document.addEventListener('pointerup', (e) => {
  if (!gbLive || gbMode() !== 'cadre' || tab !== 'home' || !store.get('gbRedock', true)) return;
  const box = document.querySelector('#screen .gpsbox'); if (box && box.contains(e.target)) return;   // appui sur le cadre : « Ouvrir ici » s'en occupe
  const t = gbTouchAt = Date.now();
  setTimeout(() => { if (gbTouchAt === t) gbRedockSoft('appui sur l\'accueil'); }, 450);   // on attend la fin des appuis
}, true);
// retour sur l'onglet Accueil (depuis Trajets, Réglages…) : le GPS revient dans le cadre
{ const a1 = window.act; window.act = function (a, long) { const was = tab; const r = a1.apply(this, arguments);
  if (was !== 'home' && tab === 'home' && gbLive) setTimeout(() => gbRedockSoft('retour sur l\'onglet Accueil'), 300);
  return r; }; }
// le cadre a bougé depuis la dernière ouverture : Android remet le GPS déjà ouvert à son ancienne place → on prévient
{ const gl1 = gbLaunch; gbLaunch = function (force, why, loose) {
  const last = store.get('gbLastRect', null), pk = gbPk(), res = gl1.apply(this, arguments);   // d'abord l'ouverture (l'accueil a pu descendre sous la barre)
  const r = gbRect(loose);
  if (r && last && last.pk === pk && r.some((v, k) => Math.abs(v - last.r[k]) > 30) && Date.now() - (last.t || 0) < 24 * 3600e3) {
    dlogAdd('cadre', `le cadre a bougé depuis la dernière ouverture (${last.r.join(',')} → ${r.join(',')})`);
    setTimeout(() => toast(`${gbName(pk)} est replacé dans le nouveau cadre ; s'il reste à l'ancienne place, ferme-le une fois`), 900);
  }
  if (r) store.set('gbLastRect', { pk, r, t: Date.now() });
  return res;
}; }

// ================= 37. v7.6 : le cadre change (thème, disposition, taille) → le GPS est replacé tout seul =================
// 7.25 : repositionnement périodique remplacé par Frame710.


// ================= 38. v7.6 : police de toute l'appli (59 au choix) =================
const APP_FONTS = [["Roboto", "roboto", [400, 700]], ["Open Sans", "open-sans", [400, 700]], ["Lato", "lato", [400, 700]], ["Montserrat", "montserrat", [400, 700]], ["Poppins", "poppins", [400, 700]], ["Nunito", "nunito", [400, 700]], ["Raleway", "raleway", [400, 700]], ["Ubuntu", "ubuntu", [400, 700]], ["Oswald", "oswald", [400, 700]], ["Source Sans 3", "source-sans-3", [400, 700]], ["Work Sans", "work-sans", [400, 700]], ["Rubik", "rubik", [400, 700]], ["Mulish", "mulish", [400, 700]], ["Barlow", "barlow", [400, 700]], ["Barlow Condensed", "barlow-condensed", [400, 700]], ["Exo 2", "exo-2", [400, 700]], ["Titillium Web", "titillium-web", [400, 700]], ["Quicksand", "quicksand", [400, 700]], ["Josefin Sans", "josefin-sans", [400, 700]], ["Kanit", "kanit", [400, 700]], ["Manrope", "manrope", [400, 700]], ["DM Sans", "dm-sans", [400, 700]], ["Outfit", "outfit", [400, 700]], ["Lexend", "lexend", [400, 700]], ["Urbanist", "urbanist", [400, 700]], ["Sora", "sora", [400, 700]], ["Plus Jakarta Sans", "plus-jakarta-sans", [400, 700]], ["Archivo", "archivo", [400, 700]], ["Fira Sans", "fira-sans", [400, 700]], ["PT Sans", "pt-sans", [400, 700]], ["Noto Sans", "noto-sans", [400, 700]], ["Cabin", "cabin", [400, 700]], ["Karla", "karla", [400, 700]], ["Heebo", "heebo", [400, 700]], ["Saira", "saira", [400, 700]], ["Chakra Petch", "chakra-petch", [400, 700]], ["Audiowide", "audiowide", [400]], ["Electrolize", "electrolize", [400]], ["Michroma", "michroma", [400]], ["Russo One", "russo-one", [400]], ["Teko", "teko", [400, 700]], ["Bebas Neue", "bebas-neue", [400]], ["Anton", "anton", [400]], ["Righteous", "righteous", [400]], ["Comfortaa", "comfortaa", [400, 700]], ["Lobster", "lobster", [400]], ["Pacifico", "pacifico", [400]], ["Dancing Script", "dancing-script", [400, 700]], ["Merriweather", "merriweather", [400, 700]], ["Lora", "lora", [400, 700]], ["Share Tech Mono", "share-tech-mono", [400]], ["JetBrains Mono", "jetbrains-mono", [400, 700]], ["Caveat", "caveat", [400, 700]], ["Permanent Marker", "permanent-marker", [400]]];
{ const st = document.createElement('style');
  st.textContent = APP_FONTS.map(([f, sl, ws]) => ws.map((w) => `@font-face{font-family:'${f}';src:url(fonts/${sl}-latin-${w}-normal.woff2) format('woff2');font-weight:${w === 400 ? '100 500' : '600 900'};font-display:swap}`).join('')).join('');
  document.head.appendChild(st); }
const APP_FONTS_ALL = ['Inter', 'Rajdhani', 'Orbitron', 'Space Grotesk', 'Playfair Display'].concat(APP_FONTS.map((x) => x[0]));
{ const pal0 = palette; palette = function () { const p = pal0.apply(this, arguments); const f = store.get('appFont', ''); if (f && APP_FONTS_ALL.includes(f)) return Object.assign({}, p, { font: f }); return p; }; }
{ const a1 = window.act; window.act = function (a, long) { if (a.indexOf('font:') === 0) { store.set('appFont', a.slice(5)); render(); return; } return a1.apply(this, arguments); }; }
{ const cat = SETCATS.find(([n]) => n === 'Affichage et personnalisation');
  if (cat) cat[1].push(['Police', (p) => { const cur = store.get('appFont', '');
    const card = (f, lab) => `<div data-act="font:${f}" style="padding:10px 12px;border-radius:12px;cursor:pointer;background:${cur === f ? p.acc + '33' : p.card2};border:2px solid ${cur === f ? p.acc : 'transparent'}"><div style="font-family:${f ? `'${f}',` : ''}Inter,sans-serif;font-size:22px;white-space:nowrap;overflow:hidden">${lab || f} 12:45</div><div style="font-family:${f ? `'${f}',` : ''}Inter,sans-serif;font-size:13px;opacity:.7">Nantes · 90 km/h · Waze</div></div>`;
    return `<div style="font-size:14px;opacity:.75;margin-bottom:10px">Touche une police : toute l'appli change tout de suite. « Celle du thème » remet la police d'origine de chaque thème.</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${card('', 'Celle du thème')}${APP_FONTS_ALL.map((f) => card(f)).join('')}</div>`; }]); }

// ================= 39. v7.7 : deux thèmes seulement (Autoradio + Personnalisable), 120 dégradés =================
if (!THEMES.some((t) => t.id === '160')) THEMES.push(P('160', 'Personnalisable', 'custom', { bg: '#14151a', acc: '#2F80FF', r: 18, font: 'Inter', dock: 'glass', grad: ['#14151a', '#2a2e3a', 160] }));
{ const keep = ['150', '160']; for (let k = THEMES.length - 1; k >= 0; k--) if (!keep.includes(THEMES[k].id)) THEMES.splice(k, 1); THEMES.sort((a, b) => a.id.localeCompare(b.id)); }
AR_TH.splice(1);   // plus de variantes de couleur : les dégradés les remplacent
{ const t0 = themeIdFor; themeIdFor = function (i) { const t = t0.apply(this, arguments); return THEMES.some((x) => x.id === t) ? t : '150'; }; }
// 120 dégradés : 20 teintes × 6 styles
{ const hsl = (h, s, l) => { s /= 100; l /= 100; const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return '#' + [f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join(''); };
  const HN = ['Rouge', 'Corail', 'Orange', 'Ambre', 'Or', 'Citron', 'Anis', 'Vert', 'Émeraude', 'Menthe', 'Turquoise', 'Cyan', 'Azur', 'Bleu', 'Roi', 'Indigo', 'Violet', 'Prune', 'Magenta', 'Rose'];
  const ST = [['Nuit', (h) => [hsl(h, 70, 32), hsl(h, 60, 6)]], ['Profond', (h) => [hsl(h, 75, 45), hsl(h + 25, 70, 14)]], ['Néon', (h) => [hsl(h, 95, 55), hsl(h + 60, 90, 25)]], ['Pastel', (h) => [hsl(h, 70, 85), hsl(h + 30, 60, 72)]], ['Coucher', (h) => [hsl(h, 85, 55), hsl(h - 40, 70, 20)]], ['Métal', (h) => [hsl(h, 18, 40), hsl(h, 25, 10)]]];
  const n0 = GRADIENTS.length; GRADIENTS.length = 0;
  ST.forEach(([sn, fn]) => HN.forEach((hn, j) => { const [a, b] = fn(j * 18); GRADIENTS.push([hn + ' ' + sn, a, b]); }));
  window.__gradsOld = n0; }
// page Thèmes : la grille des 2 thèmes + les 120 dégradés (le reste de la page ne change pas)
{ const ar0 = arThemesSec; arThemesSec = function (p) { const h = ar0.apply(this, arguments), cur = palette().tid, c = custom(profIdx(), cur);
  const card2 = (id, n, d, bg) => `<button data-act="theme:${id}" style="flex:1;text-align:left;padding:10px;border-radius:14px;background:${p.card2};box-shadow:${cur === id ? `0 0 0 3px ${p.acc}` : 'none'};color:${p.txt}"><span style="display:block;height:90px;border-radius:10px;background:${bg}"></span><b style="display:block;font-size:17px;margin-top:8px">${n}${cur === id ? ' ✓' : ''}</b><span style="font-size:13px;color:${p.mut}">${d}</span></button>`;
  const two = `<div style="display:flex;gap:12px">${card2('150', 'Autoradio', 'Barre à gauche, route, GPS, musique, applis', 'linear-gradient(160deg,#16307e,#3159c6)')}${card2('160', 'Personnalisable', 'Tu mets les tuiles et widgets où tu veux (appui long sur l\'accueil → Modifier)', 'linear-gradient(160deg,#2b1640,#c2185b)')}</div>`;
  const gr = `<div style="font-size:13px;color:${p.mut}">Dégradés · ${GRADIENTS.length}</div><div style="display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:6px">${GRADIENTS.map(([n, a, b], k) => `<button data-act="grad:${k}" title="${n}" style="height:40px;border-radius:8px;background:linear-gradient(135deg,${a},${b});box-shadow:${c.bgType === 'grad' && c.g1 === a && c.g2 === b ? `0 0 0 3px ${p.txt}` : 'inset 0 0 0 1px #ffffff30'}"></button>`).join('')}</div>`;
  return h.replace(/<div style="font-size:13px;color:[^"]*">Couleurs<\/div><div style="display:flex;gap:12px;flex-wrap:wrap">[\s\S]*?<\/button><\/div>/, two + gr); }; }


// ================= 40. v7.9 : zones de danger, profils (Abdou / Sakina), accueil au démarrage, volume des alertes, assistant =================
// --- profils : noms par défaut ---
{ const cur = store.get('profiles', null); if (!cur || JSON.stringify(cur) === JSON.stringify(DEFAULT_PROFILES)) store.set('profiles', ['Abdou', 'Sakina', 'Profil 3']); }
// --- menu en touchant le nom / l'initiale en haut à gauche ---
let pmEl = null;
function pmClose() { if (pmEl) { pmEl.remove(); pmEl = null; } }
function pmOpen() {
  pmClose(); const p = palette(), names = profiles(), cur = profIdx(), th = store.get('profileThemes', {});
  pmEl = document.createElement('div'); pmEl.setAttribute('data-noswipe', '1');
  pmEl.style.cssText = 'position:absolute;inset:0;z-index:3900;background:#0006';
  const row = (i) => `<button data-act="pm:prof:${i}" style="display:flex;align-items:center;gap:12px;width:100%;padding:10px 12px;border-radius:12px;color:#fff;${i === cur ? `background:${p.acc}33` : ''}"><span style="width:40px;height:40px;border-radius:50%;background:${i === cur ? p.acc : ['#E53935', '#EC407A', '#607D8B'][i]};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px">${esc(names[i].charAt(0).toUpperCase())}</span><b style="flex:1;text-align:left;font-size:18px">${esc(names[i])}</b>${i === cur ? '✓' : ''}</button>`;
  pmEl.innerHTML = `<div data-act="pm:close" style="position:absolute;inset:0"></div><div style="position:absolute;left:16px;top:64px;width:340px;background:#1d2029;border-radius:16px;padding:10px;box-shadow:0 10px 30px #000a;display:flex;flex-direction:column;gap:4px">
    ${[0, 1, 2].map(row).join('')}<div style="border-top:1px solid #ffffff22;margin:6px 0"></div>
    <button data-act="pm:ren" style="text-align:left;padding:10px 12px;color:#fff;font-size:16px">✎ Renommer les profils</button>
    <button data-act="pm:wel" style="display:flex;justify-content:space-between;align-items:center;padding:6px 12px 8px;color:#fff;font-size:16px;text-align:left">Demander qui conduit au démarrage <span style="background:${store.get('welcome', true) ? p.acc : '#ffffff24'};border-radius:12px;padding:3px 10px;font-size:13px">${store.get('welcome', true) ? 'Activé' : 'Désactivé'}</span></button></div>`;
  $('stage').appendChild(pmEl);
}
document.addEventListener('pointerup', (e) => { if (e.target.closest && e.target.closest('#screen [data-k="hello"], #screen [data-k="avatar"]') && !pmEl && tab !== 'settings') setTimeout(pmOpen, 0); }, true);
{ const st = document.createElement('style'); st.textContent = '[data-k="hello"],[data-k="avatar"]{cursor:pointer;pointer-events:auto}'; document.head.appendChild(st); }
// --- accueil au démarrage : « Bonsoir Abdou », date, heure, météo ---
{ const wd0 = welDraw; welDraw = function () { wd0.apply(this, arguments); if (!welEl) return;
  const now = new Date(), H = now.getHours(), name = profiles()[profIdx()], J = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const wt = (document.querySelector('#screen [data-k="wTemp"]') || {}).textContent || '';
  const t = [...welEl.querySelectorAll('div')].find((d) => d.textContent === 'Bienvenue'); if (t) t.textContent = `${H >= 18 || H < 5 ? 'Bonsoir' : 'Bonjour'} ${name}`;
  const s2 = [...welEl.querySelectorAll('div')].find((d) => d.textContent === 'Choisissez l\'utilisateur');
  if (s2) s2.textContent = `${J[now.getDay()]} ${now.getDate()} · ${fmtTime(now)}${wt && wt !== '--°' ? ' · ' + wt : ''} — touche ton profil si ce n'est pas toi`; }; }
{ const ws0 = welShow; welShow = function () { ws0.apply(this, arguments); if (welEl && welLeft > 8) { welLeft = 8; welDraw(); } }; }

// --- zones de danger (radars fixes = zone, jamais l'emplacement exact ; passages à niveau, écoles, dangers) ---
const DZ = { on: () => store.get('dzOn', true), list: [], at: 0, pos: null, busy: false, cur: null, overDone: '', shown: '' };
const DZ_LAB = { zone: 'Zone de danger', pn: 'Passage à niveau', ecole: 'École', danger: 'Danger' };
function dzLen(kind) {
  if (kind !== 'zone') return kind === 'danger' ? 500 : 300;
  if (/^motorway/.test(roadHw || '')) return 4000;
  return (typeof limit === 'number' && limit <= 50) ? 300 : 2000;
}
function dzDist(a, b) { const R = 6371e3, r = Math.PI / 180, dLa = (b.lat - a.lat) * r, dLo = (b.lon - a.lon) * r; const x = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); }
function dzBrg(a, b) { const r = Math.PI / 180, y = Math.sin((b.lon - a.lon) * r) * Math.cos(b.lat * r), x = Math.cos(a.lat * r) * Math.sin(b.lat * r) - Math.sin(a.lat * r) * Math.cos(b.lat * r) * Math.cos((b.lon - a.lon) * r); return (Math.atan2(y, x) / r + 360) % 360; }
async function dzFetch() {
  if (DZ.busy || !loc || !DZ.on()) return; const here = { lat: loc.lat, lon: loc.lon };
  if (DZ.pos && dzDist(DZ.pos, here) < 2500 && Date.now() - DZ.at < 180e3) return;
  DZ.busy = true; DZ.at = Date.now(); DZ.pos = here;
  try {
    const ar = `(around:6000,${here.lat.toFixed(5)},${here.lon.toFixed(5)})`;
    const q = `[out:json][timeout:10];(node${ar}[highway=speed_camera];node${ar}[railway=level_crossing];node${ar}[amenity=school];node${ar}[hazard];way${ar}[amenity=school];);out center 300;`;
    const els = (await getJSON('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(q))).elements || [];
    DZ.list = els.map((e) => { const t = e.tags || {}, lat = e.lat ?? (e.center || {}).lat, lon = e.lon ?? (e.center || {}).lon;
      const kind = t.highway === 'speed_camera' ? 'zone' : t.railway === 'level_crossing' ? 'pn' : t.amenity === 'school' ? 'ecole' : 'danger';
      return lat ? { id: e.type + e.id, kind, lat, lon } : null; }).filter(Boolean);
    dlogAdd('zones', `${DZ.list.length} points de danger à 6 km`);
  } catch (e) { /* pas de réseau */ }
  DZ.busy = false;
}
function dzNow() {
  if (!DZ.on() || !loc || !DZ.list.length) return null;
  const s = curSpeed(); if (!s || s.v < 8) return DZ.cur && Date.now() - DZ.cur.t < 20000 ? DZ.cur : null;
  const here = { lat: loc.lat, lon: loc.lon }, brg = loc.brg; let best = null;
  for (const z of DZ.list) {
    const d = dzDist(here, z); const L = dzLen(z.kind); if (d > L / 2 + 50) continue;
    let ahead = true; if (typeof brg === 'number') { const db = Math.abs(((dzBrg(here, z) - brg + 540) % 360) - 180); ahead = db < 70; if (!ahead && db < 110 && d > 60) continue; }
    const left = ahead ? d + L / 2 : Math.max(0, L / 2 - d);
    if (!best || (z.kind === 'zone' && best.kind !== 'zone') || left < best.left) best = { id: z.id, kind: z.kind, left, L, t: Date.now() };
  }
  return best;
}
function dzPill(z) {
  if (!z) return '';
  const km = z.left >= 1000 ? (z.left / 1000).toFixed(1).replace('.', ',') + ' km' : Math.round(z.left / 50) * 50 + ' m';
  const pc = Math.max(0, Math.min(100, 100 - z.left / z.L * 100));
  return `<span style="display:inline-flex;align-items:center;gap:7px;background:#d32f2f;border-radius:16px;padding:4px 11px 4px 8px;font-size:15px;font-weight:700;color:#fff;text-shadow:none;white-space:nowrap"><svg width="18" height="16" viewBox="0 0 18 16"><polygon points="9,1 17,15 1,15" fill="#fff"/><rect x="8.1" y="5.5" width="1.8" height="5" fill="#d32f2f"/><rect x="8.1" y="11.5" width="1.8" height="1.8" fill="#d32f2f"/></svg>${z.kind === 'zone' ? 'Zone' : DZ_LAB[z.kind]} ${km}</span><span style="display:block;width:140px;height:4px;background:#ffffff44;border-radius:2px;margin-top:5px"><span style="display:block;width:${pc}%;height:100%;background:#ff5252;border-radius:2px"></span></span>`;
}
function dzSound(kind) {
  try {
    if (!spdCtx) spdCtx = new (window.AudioContext || window.webkitAudioContext)(); if (spdCtx.state === 'suspended') spdCtx.resume();
    const t = spdCtx.currentTime;
    switch (kind) {
      case 'zone': spdTone(880, t, 0.18, 'triangle', 0.5); spdTone(660, t + 0.22, 0.18, 'triangle', 0.5); spdTone(880, t + 0.44, 0.18, 'triangle', 0.5); spdTone(660, t + 0.66, 0.3, 'triangle', 0.5); break;
      case 'over': for (let i = 0; i < 4; i++) spdTone(1500, t + i * 0.12, 0.08, 'square', 0.25); break;
      case 'pn': for (let i = 0; i < 6; i++) spdTone(i % 2 ? 740 : 980, t + i * 0.25, 0.2, 'triangle', 0.45); break;
      case 'ecole': spdTone(1047, t, 0.3, 'sine', 0.5); spdTone(1319, t + 0.15, 0.3, 'sine', 0.5); spdTone(1568, t + 0.3, 0.5, 'sine', 0.5); break;
      case 'danger': spdTone(500, t, 0.5, 'sawtooth', 0.2, 900); spdTone(500, t + 0.55, 0.5, 'sawtooth', 0.2, 900); break;
      case 'fin': spdTone(660, t, 0.15, 'sine', 0.4); spdTone(990, t + 0.15, 0.3, 'sine', 0.4); break;
    }
  } catch (e) { /* pas de son */ }
}
setInterval(() => {
  if (moving()) dzFetch();
  const z = dzNow(), was = DZ.cur;
  if (z && (!was || was.id !== z.id)) { if (store.get('dzSnd_' + z.kind, true)) dzSound(z.kind); dlogAdd('zones', `entrée : ${DZ_LAB[z.kind]}`); }
  if (!z && was && store.get('dzFin', false)) dzSound('fin');
  if (z && z.kind === 'zone' && DZ.overDone !== z.id) { const s = curSpeed(); if (s && typeof limit === 'number' && limit > 0 && s.v > limit + SPA.tol()) { DZ.overDone = z.id; if (store.get('dzSnd_over', true)) dzSound('over'); } }
  DZ.cur = z;
  const html = dzPill(z);
  document.querySelectorAll('#screen [data-roadbox]').forEach((box) => {
    const sp = box.querySelector('[data-k="speed"]'); if (!sp) return; const row = sp.parentElement;
    let el = box.querySelector('.dzPill'); if (!el) { el = document.createElement('div'); el.className = 'dzPill'; el.style.cssText = 'margin-top:6px;pointer-events:none'; row.insertAdjacentElement('afterend', el); }
    if (el.dataset.h !== html) { el.innerHTML = html; el.dataset.h = html; el.style.display = html ? '' : 'none'; }
    // micro de l'assistant : coin bas-gauche de la tuile route
    let mic = box.querySelector('.asMic'); const want = store.get('asMic', true);
    if (want && !mic) { mic = document.createElement('button'); mic.className = 'asMic'; mic.setAttribute('data-act', 'as:mic'); mic.setAttribute('aria-label', 'Assistant');
      mic.style.cssText = 'position:absolute;left:3%;bottom:4%;width:46px;height:46px;border-radius:50%;background:#E53935;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px #0007;z-index:3';
      mic.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/></svg>'; box.appendChild(mic); }
    else if (!want && mic) mic.remove();
  });
}, 1000);

// --- assistant ---
let asEl = null; const asLog = [];
function asGemini() {
  if (!A || !A.openAction) return false;
  for (const a of ['android.intent.action.VOICE_COMMAND', 'android.intent.action.ASSIST', 'android.speech.action.WEB_SEARCH']) { try { if (A.openAction(a)) { dlogAdd('assistant', 'ouvert : ' + a); return true; } } catch (e) { /* suivant */ } }
  return false;
}
function asClose() { if (asEl) { asEl.remove(); asEl = null; } }
function asDraw() {
  if (!asEl) return; const p = palette();
  const msgs = asLog.slice(-8).map(([who, t]) => who === 'me' ? `<div style="align-self:flex-end;background:${p.acc};color:${p.onAcc};border-radius:16px 16px 4px 16px;padding:9px 14px;font-size:17px;max-width:85%">${esc(t)}</div>` : `<div style="align-self:flex-start;background:#262a35;border-radius:16px 16px 16px 4px;padding:9px 14px;font-size:17px;max-width:85%">${esc(t)}</div>`).join('');
  asEl.querySelector('[data-as-msgs]').innerHTML = msgs || `<div style="opacity:.7;font-size:16px;line-height:1.6">Exemples : « mets Soolking sur Spotify » · « emmène-moi au travail » · « luminosité 50 » · « volume des alertes 80 » · « profil Sakina » · « quelle heure »</div>`;
}
function asOpen() {
  asClose(); const p = palette();
  asEl = document.createElement('div'); asEl.setAttribute('data-noswipe', '1'); asEl.style.cssText = 'position:absolute;inset:0;z-index:3950;background:#0008;display:flex;align-items:center;justify-content:center';
  asEl.innerHTML = `<div style="width:720px;height:560px;background:#181b24;color:#fff;border-radius:20px;padding:18px 20px;box-sizing:border-box;display:flex;flex-direction:column;gap:12px">
    <div style="display:flex;align-items:center;gap:12px"><span style="width:44px;height:44px;border-radius:50%;background:${p.acc};display:flex;align-items:center;justify-content:center">🎙</span><b style="font-size:22px">Assistant</b>
      <button data-act="as:gem" style="margin-left:auto;height:40px;padding:0 14px;border-radius:12px;background:#ffffff1a;color:#fff;font-size:14px;font-weight:600">Ouvrir Gemini</button><button data-act="as:close" style="height:40px;padding:0 14px;border-radius:12px;background:#ffffff1a;color:#fff;font-size:14px;font-weight:600">Fermer ✕</button></div>
    <div data-as-msgs style="flex:1;display:flex;flex-direction:column;gap:8px;overflow:hidden"></div>
    <form data-as-form style="display:flex;gap:10px;margin:0"><input data-as-in placeholder="Touche ici puis le micro du clavier, et parle…" autocomplete="off" style="flex:1;height:54px;border-radius:14px;background:#262a35;color:#fff;border:0;padding:0 16px;font-size:18px">
      <button type="submit" style="width:100px;height:54px;border-radius:14px;background:${p.acc};color:${p.onAcc};font-size:16px;font-weight:700">OK</button></form></div>`;
  $('stage').appendChild(asEl); asDraw();
  const f = asEl.querySelector('[data-as-form]'), inp = asEl.querySelector('[data-as-in]');
  f.addEventListener('submit', (e) => { e.preventDefault(); const t = inp.value.trim(); if (!t) return; inp.value = ''; asLog.push(['me', t]); asLog.push(['as', asRun(t)]); asDraw(); });
  setTimeout(() => { try { inp.focus(); } catch (e) { /* rien */ } }, 200);
}
function asRun(raw) {
  const t = raw.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[«»"!?.]/g, ' ').replace(/\s+/g, ' ').trim();
  let m;
  if ((m = t.match(/(?:luminosite|lumiere)\D*(\d{1,3})/))) { const v = Math.max(15, Math.min(100, +m[1])); store.set('lum', v); lumApply(); return `Luminosité ${v} %`; }
  if ((m = t.match(/volume (?:des )?alertes?\D*(\d{1,3})/))) { const v = Math.max(0, Math.min(100, +m[1])); store.set('alVol_' + profIdx(), v); dzSound('zone'); return `Volume des alertes ${v} %`; }
  if ((m = t.match(/profil\s+(.+)$/)) || (m = t.match(/^(?:c'est|cest)\s+(.+)$/))) { const n = profiles(), i = n.findIndex((x) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') === m[1].trim()); if (i >= 0) { store.set('profile', i); render(); return `Profil ${n[i]}`; } return `Je ne trouve pas le profil « ${m[1]} »`; }
  if (/\b(heure)\b/.test(t)) return 'Il est ' + fmtTime(new Date());
  if (/\b(maison|chez moi)\b/.test(t) && /(emmene|va|aller|rentre|direction|route|itineraire|ramene)/.test(t)) { const ad = store.get('addrHome', ''); if (!ad) return 'Adresse de la maison pas encore enregistrée (Réglages → Navigation → Adresses)'; wazeTo(ad); return 'Waze vers la maison'; }
  if (/\b(travail|boulot|taf)\b/.test(t)) { const ad = store.get('addrWork', ''); if (!ad) return 'Adresse du travail pas encore enregistrée (Réglages → Navigation → Adresses)'; wazeTo(ad); return 'Waze vers le travail'; }
  if ((m = t.match(/^(?:emmene[- ]moi|va|aller|direction|itineraire|navigue)(?: vers| a| au| a la| jusqu'a)?\s+(.+)$/))) { wazeTo(m[1]); return `Waze vers ${m[1]}`; }
  if ((m = t.match(/^(?:mets|met|joue|lance|ecouter?|je veux)\s+(?:de la |du |des |la |le |les )?(?:musique (?:de )?)?(.+?)(?:\s+sur\s+(spotify|youtube(?: music)?|deezer))?$/))) {
    const q = m[1].trim(), app = m[2] || store.get('asMusic', 'spotify');
    if (/^(la musique|musique)$/.test(q)) { if (A) A.media('play'); return 'Lecture'; }
    const url = /youtube/.test(app) ? 'https://music.youtube.com/search?q=' + encodeURIComponent(q) : /deezer/.test(app) ? 'deezer://www.deezer.com/search/' + encodeURIComponent(q) : 'spotify:search:' + encodeURIComponent(q);
    if (A && A.openUrl(url)) return `${/youtube/.test(app) ? 'YouTube Music' : /deezer/.test(app) ? 'Deezer' : 'Spotify'} : « ${q} »`;
    return `Je n'arrive pas à ouvrir ${app} sur le poste`;
  }
  if (/\b(pause|stop|arrete)\b/.test(t)) { if (A) A.media('pause'); return 'Pause'; }
  if (/\b(suivant|suivante|next)\b/.test(t)) { if (A) A.media('next'); return 'Morceau suivant'; }
  if (/\b(precedent|precedente)\b/.test(t)) { if (A) A.media('prev'); return 'Morceau précédent'; }
  return 'Je n\'ai pas compris. Essaie : « mets … sur Spotify », « emmène-moi au travail », « luminosité 50 », ou touche « Ouvrir Gemini ».';
}
{ const a1 = window.act; window.act = function (a, long) {
  if (a.indexOf('pm:') === 0) { const [, op, x] = a.split(':');
    if (op === 'close') pmClose(); else if (op === 'prof') { pmClose(); store.set('profile', +x); render(); toast('Bonjour ' + profiles()[+x]); }
    else if (op === 'ren') { pmClose(); openSet('Profils'); } else if (op === 'wel') { store.set('welcome', !store.get('welcome', true)); pmOpen(); } return; }
  if (a.indexOf('as:') === 0) { const op = a.slice(3);
    if (op === 'close') { asClose(); return; }
    if (op === 'gem') { asClose(); if (!asGemini()) toast('Gemini / Google introuvable sur le poste'); return; }
    if (op === 'mic') { const g = store.get('asMode', 'gemini') === 'gemini'; if (g !== !!long) { if (!asGemini()) asOpen(); } else asOpen(); return; } }
  if (a.indexOf('dz:') === 0) { const [, op, x] = a.split(':');
    if (op === 'on') store.set('dzOn', !DZ.on()); else if (op === 'test') { dzSound(x); return; } else if (op === 'snd') store.set('dzSnd_' + x, !store.get('dzSnd_' + x, true)); else if (op === 'fin') store.set('dzFin', !store.get('dzFin', false));
    else if (op === 'mic') store.set('asMic', !store.get('asMic', true)); else if (op === 'mode') store.set('asMode', x); else if (op === 'mus') store.set('asMusic', x);
    render(); return; }
  return a1.apply(this, arguments); }; }
{ const cat = SETCATS.find(([n]) => n === 'Navigation');
  if (cat) {
    cat[1].splice(1, 0, ['Zones de danger', (p) => { const k = profIdx(), v = Number(store.get('alVol_' + k, 70));
      const snd = (key, lab) => `<span style="display:inline-flex;gap:4px;margin:0 8px 8px 0">${chipBtn(p, 'dz:snd:' + key, lab, store.get('dzSnd_' + key, true))}${chipBtn(p, 'dz:test:' + key, '▶')}</span>`;
      return `<div style="display:flex;flex-direction:column;gap:12px;max-width:900px">
      ${setRow(p, 'Zones de danger', 'Petite pastille rouge sous la vitesse, avec les km restants. Radars fixes signalés comme une zone (4 km autoroute, 2 km route, 300 m en ville), jamais l\'emplacement exact. Données OpenStreetMap, Internet nécessaire.', chipBtn(p, 'dz:on', DZ.on() ? 'Activé' : 'Désactivé', DZ.on()))}
      ${setRow(p, '🔊 Volume des alertes', 'Pour ce profil : bips de vitesse, zones, passages à niveau…', `<span style="display:flex;align-items:center;gap:12px"><input type="range" min="0" max="100" step="5" value="${v}" style="width:280px;height:36px;accent-color:${p.acc}" oninput="store.set('alVol_${k}', +this.value); this.nextElementSibling.textContent = this.value + ' %'" onchange="dzSound('zone')"><b style="width:60px;text-align:right;font-size:18px">${v} %</b></span>`)}
      ${setRow(p, 'Sons (touche ▶ pour écouter)', 'Touche le nom pour activer ou couper ce son.', `<div style="max-width:520px">${snd('zone', 'Zone')}${snd('over', 'Trop vite')}${snd('pn', 'Passage à niveau')}${snd('ecole', 'École')}${snd('danger', 'Danger')}</div>`)}
      ${setRow(p, 'Son en sortie de zone', 'Petit son doux quand la zone est finie.', chipBtn(p, 'dz:fin', store.get('dzFin', false) ? 'Activé' : 'Désactivé', store.get('dzFin', false)) + chipBtn(p, 'dz:test:fin', '▶'))}</div>`; }]);
    cat[1].splice(2, 0, ['Assistant', (p) => `<div style="display:flex;flex-direction:column;gap:12px;max-width:900px">
      ${setRow(p, '🎙 Micro sur la tuile route', 'Bouton rouge en bas à gauche de la route.', chipBtn(p, 'dz:mic', store.get('asMic', true) ? 'Affiché' : 'Caché', store.get('asMic', true)))}
      ${setRow(p, 'Le micro ouvre', 'Appui long sur le micro = l\'autre. Gemini doit être installé sur le poste.', chipBtn(p, 'dz:mode:gemini', 'Gemini / Google', store.get('asMode', 'gemini') === 'gemini') + chipBtn(p, 'dz:mode:app', 'Assistant de l\'appli', store.get('asMode', 'gemini') === 'app'))}
      ${setRow(p, 'Musique par défaut', '« mets … » sans dire l\'appli.', chipBtn(p, 'dz:mus:spotify', 'Spotify', store.get('asMusic', 'spotify') === 'spotify') + chipBtn(p, 'dz:mus:youtube', 'YouTube Music', store.get('asMusic', 'spotify') === 'youtube') + chipBtn(p, 'dz:mus:deezer', 'Deezer', store.get('asMusic', 'spotify') === 'deezer'))}
      ${setRow(p, 'Tester', 'Ouvre l\'assistant de l\'appli.', chipBtn(p, 'as:close', 'Fermer') + `<button data-act="pm:close" onclick="asOpen()" style="height:44px;padding:0 14px;border-radius:10px;font-size:14px;font-weight:600;background:${p.acc};color:${p.onAcc}">Ouvrir l'assistant</button>`)}</div>`]);
  } }
