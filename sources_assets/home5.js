/* Accueil 2008 GT v4.4 — écran libre + widget GPS (chargé après v4.js)
   - accueil « écran libre » : widgets et applis à placer au doigt, taille réglable, pages avec points, dossiers
   - widget GPS : boutons Waze / Google Maps ; remplace l'ancienne carte et l'ancien cadre freeform
   - ne touche ni à la voiture 3D (car3d.js, setupCar360) ni au CAN (Can, CanReader, qf) */
'use strict';
const FW = 12, FH = 6;

// ================= icônes d'applis (cache) =================
const iconCache = new Map();
function hashCol(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return `hsl(${Math.abs(h) % 360},55%,42%)`; }
const DEMO_APPS = [['Waze', 'com.waze'], ['Spotify', 'com.spotify.music'], ['YouTube Music', 'com.google.android.apps.youtube.music'], ['Maps', 'com.google.android.apps.maps'], ['Radio', 'com.qf.radio'], ['Téléphone', 'com.qf.bluetooth'], ['zLink', 'com.zjinnova.zlink'], ['Réglages', 'com.android.settings'], ['Chrome', 'com.android.chrome'], ['Deezer', 'deezer.android.app'], ['Coyote', 'com.coyotesystems.android'], ['Météo', 'com.weather'], ['Galerie', 'com.android.gallery3d'], ['Fichiers', 'com.android.documentsui'], ['Podcasts', 'com.google.android.apps.podcasts'], ['TuneIn', 'tunein.player'], ['Vidéo', 'com.qf.video'], ['Calculatrice', 'com.android.calculator2'], ['Play Store', 'com.android.vending'], ['Uber Eats', 'com.ubercab.eats'], ['WhatsApp', 'com.whatsapp'], ['Google', 'com.google.android.googlequicksearchbox'], ['Égaliseur', 'com.qf.eq'], ['Caméra recul', 'com.qf.camera']].map(([l, p]) => ({ l, p }));
function getIcon(pkg) {
  if (iconCache.has(pkg)) return iconCache.get(pkg);
  let src = '';
  if (A) { try { src = A.icon(pkg) || ''; } catch (e) { src = ''; } }
  else if (DEMO) { const a = DEMO_APPS.find((x) => x.p === pkg); if (a) src = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="22" fill="${hashCol(pkg)}"/><text x="48" y="62" font-family="Arial" font-size="40" font-weight="700" text-anchor="middle" fill="#fff">${a.l.charAt(0)}</text></svg>`); }
  iconCache.set(pkg, src);
  return src;
}
// charge les icônes par petits paquets pour ne pas figer l'écran
function fLoadIcons(root) {
  const imgs = Array.from((root || document).querySelectorAll('img[data-icon]:not([src])')); let i = 0;
  const step = () => { for (let k = 0; k < 8 && i < imgs.length; k++, i++) { const src = getIcon(imgs[i].dataset.icon); if (src) imgs[i].src = src; } if (i < imgs.length) setTimeout(step, 16); };
  step();
}
const appInfo = (pkg) => allApps().find((a) => a.p === pkg);

// ================= configuration =================
const fKey = () => 'home_v2_' + profIdx();
let fSeq = 0;
const nid = () => 'i' + Date.now().toString(36) + (++fSeq).toString(36);
// disposition rangée d'origine (grille 12 x 6)
function fTidy() {
  const W = (b, x, y, w, h) => ({ id: nid(), t: 'w', b: [b], x, y, w, h });
  return { pages: [
    [W('gpsbox', 0, 0, 6, 6), W('music', 6, 0, 2, 6), W('roadcar', 8, 0, 4, 2), W('speedonly', 8, 2, 2, 2), W('weather', 10, 2, 2, 2), W('address', 8, 4, 4, 1), W('fuel', 8, 5, 4, 1)],
    [W('carfull', 0, 0, 6, 4), W('track', 0, 4, 3, 2), W('clock', 3, 4, 3, 2), W('computer', 6, 0, 6, 2), W('station', 6, 2, 6, 1), W('trip', 6, 3, 6, 1), W('service', 6, 4, 6, 1), W('indicators', 6, 5, 6, 1)]
  ] };
}
function fMigrate() { return fTidy(); }
function fCfg() {
  let c = store.get(fKey(), null);
  if (!c || !Array.isArray(c.pages) || !c.pages.length) { c = fMigrate(); store.set(fKey(), c); }
  return c;
}
const fSave = (c) => store.set(fKey(), c);
const fClone = () => JSON.parse(JSON.stringify(fCfg()));
const fIsFree = () => tab === 'home' && palette().layout === 'custom';
function fFind(c, id) { for (let pg = 0; pg < c.pages.length; pg++) { const k = c.pages[pg].findIndex((x) => x.id === id); if (k >= 0) return { pg, k, it: c.pages[pg][k] }; } return null; }
const fOverlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const fFits = (items, r, skip) => r.x >= 0 && r.y >= 0 && r.x + r.w <= FW && r.y + r.h <= FH && !items.some((o) => o.id !== skip && fOverlap(o, r));
function fFree(items, w, h, skip) { for (let y = 0; y <= FH - h; y++) for (let x = 0; x <= FW - w; x++) { const r = { x, y, w, h }; if (fFits(items, r, skip)) return r; } return null; }
const hasMap = (items, skip) => items.some((o) => o.id !== skip && o.t === 'w' && o.b.includes('map'));
// place un élément à la première place libre à partir de la page « from » ; crée une page si tout est plein
function fPlace(c, it, from) {
  const isMap = it.t === 'w' && it.b.includes('map');
  for (let pg = Math.max(0, from || 0); pg < c.pages.length; pg++) {
    if (isMap && hasMap(c.pages[pg])) continue;
    const r = fFree(c.pages[pg], it.w, it.h); if (r) { Object.assign(it, r); c.pages[pg].push(it); return pg; }
  }
  c.pages.push([]); Object.assign(it, { x: 0, y: 0 }); c.pages[c.pages.length - 1].push(it); return c.pages.length - 1;
}
const appsOnScreen = (c) => { const s = new Set(); c.pages.forEach((pg) => pg.forEach((it) => { if (it.t === 'a') s.add(it.p); if (it.t === 'f') it.apps.forEach((a) => s.add(a)); })); return s; };

// tailles mini (en cases 12 x 6) et tailles proposées
const FMIN = { map: [3, 2], carfull: [4, 3], roadcar: [3, 2], speed: [3, 2], speedonly: [2, 1], car: [3, 3], weather: [2, 2], address: [3, 1], where: [3, 2], music: [2, 1], fuel: [3, 1], trip: [4, 1], track: [3, 1], service: [3, 1], station: [4, 1], computer: [4, 2], indicators: [4, 1], info: [4, 1], alerts: [2, 1], apps: [3, 2], clock: [2, 1] };
function fMin(it) { if (it.t !== 'w') return [1, 1]; return it.b.reduce((m, id) => { const v = FMIN[id] || [2, 1]; return [Math.max(m[0], v[0]), Math.max(m[1], v[1])]; }, [1, 1]); }
// Petit / Moyen / Grand, réglés widget par widget
const FSZ = { map: [[4, 3], [6, 4], [6, 6]], carfull: [[4, 3], [6, 4], [8, 6]], roadcar: [[3, 2], [4, 2], [6, 3]], speedonly: [[2, 1], [2, 2], [4, 3]], speed: [[3, 2], [4, 2], [6, 3]], weather: [[2, 2], [3, 2], [4, 3]], address: [[3, 1], [4, 1], [6, 1]], where: [[3, 2], [4, 2], [6, 3]], clock: [[2, 1], [3, 2], [4, 2]], music: [[4, 1], [4, 2], [2, 6]], track: [[3, 1], [3, 2], [4, 2]], fuel: [[3, 1], [4, 1], [6, 1]], trip: [[4, 1], [5, 1], [6, 1]], station: [[4, 1], [5, 1], [6, 1]], service: [[3, 1], [4, 1], [6, 1]], computer: [[4, 2], [6, 2], [8, 2]], indicators: [[6, 1], [4, 2], [6, 2]], info: [[4, 1], [6, 1], [8, 1]], alerts: [[2, 1], [3, 1], [4, 2]], car: [[3, 3], [4, 4], [6, 6]], apps: [[3, 2], [4, 3], [6, 4]] };
// ordre d'affichage dans le choix des widgets
const FORDER = ['map', 'roadcar', 'carfull', 'speedonly', 'weather', 'address', 'clock', 'music', 'track', 'fuel', 'trip', 'station', 'service', 'computer', 'indicators', 'info', 'alerts', 'car', 'where', 'speed', 'apps'];
const fOrder = () => { const ks = Object.keys(GBLOCKS); return FORDER.filter((k) => GBLOCKS[k]).concat(ks.filter((k) => !FORDER.includes(k))).map((k) => [k, GBLOCKS[k]]); };
function fSizes(id) {
  const names = ['Petit', 'Moyen', 'Grand'];
  if (FSZ[id]) return FSZ[id].map(([w, h], i) => [names[i], w, h]);
  const [w, h] = FMIN[id] || [2, 1];
  return [[w, h], [Math.min(FW, w + 2), Math.min(FH, h + 1)], [Math.min(FW, w + 3), Math.min(FH, h + 2)]].map(([a, b], i) => [names[i], a, b]);
}

// ================= état =================
let fSel = null, fPick = null, fPickTab = 'w', fFolder = null, fFolderPg = 0, fFolderEdit = false, fAsk = false, fAnim = null, fResetArm = false, fStackAnim = null;
let fDrag = null, fTidyArm = 0;

// ================= rendu =================
const fWName = (id) => (GBLOCKS[id] ? GBLOCKS[id].n : id);
function fAppHtml(p, pkg, edit, badgeAct) {
  const a = appInfo(pkg), label = a ? a.l : (A ? 'Désinstallée' : pkg);
  return `<button ${edit ? '' : `data-act="h2:app:${esc(pkg)}"`} class="fapp" style="color:${p.ontxt}"><span class="ficw"><span class="fic" style="background:${hashCol(pkg)}">${esc(label.charAt(0).toUpperCase())}<img data-icon="${esc(pkg)}" alt=""></span>${badgeAct ? `<span data-act="${badgeAct}" class="fdel">−</span>` : ''}</span><span class="flb">${esc(label)}</span></button>`;
}
function fFolderTile(p, it, edit, badgeAct) {
  return `<button ${edit ? '' : `data-act="h2:fold:${it.id}"`} class="fapp" style="color:${p.ontxt}"><span class="ficw"><span class="fic ffold" style="background:${p.light ? '#00000024' : '#ffffff2e'}">${it.apps.slice(0, 9).map((pk) => `<i style="background:${hashCol(pk)}"><img data-icon="${esc(pk)}" alt=""></i>`).join('')}</span>${badgeAct ? `<span data-act="${badgeAct}" class="fdel">−</span>` : ''}</span><span class="flb">${esc(it.n || 'Dossier')}</span></button>`;
}
function fItemHtml(p, it, edit, mapState) {
  const pos = `grid-column:${it.x + 1} / span ${it.w};grid-row:${it.y + 1} / span ${it.h};`;
  const faded = fDrag && fDrag.started && fDrag.id === it.id ? 'opacity:.25;' : '';
  const sel = edit && fSel === it.id;
  if (it.t === 'a' || it.t === 'f') {
    const inner = it.t === 'a' ? fAppHtml(p, it.p, edit, edit ? `h2:del:${it.id}` : '') : fFolderTile(p, it, edit, edit ? `h2:del:${it.id}` : '');
    const ov = edit ? `<div data-fdrag="${it.id}" style="position:absolute;inset:0;z-index:700;border-radius:16px;${sel ? `background:${p.acc}33;outline:3px solid ${p.acc}` : ''}"></div>` : '';
    return `<div data-fitem="${it.id}" class="${edit ? 'fj' : ''}" style="${pos}position:relative;min-width:0;min-height:0;display:grid;${faded}">${inner}${ov}</div>`;
  }
  const n = it.b.length, cur = Math.min(stackIdx[it.id] || 0, n - 1), id = it.b[cur], B = GBLOCKS[id];
  if (!B) return '';
  const w6 = it.w / 2, h4 = it.h * GH / FH;
  let inner;
  if (id === 'map') { if (mapState.used) inner = `<div style="${card(p, 'display:flex;align-items:center;justify-content:center;color:' + p.mut + '')}">Une seule carte par page</div>`; else { mapState.used = true; inner = B.r(p, w6, h4); } }
  else inner = B.r(p, w6, h4);
  const dots = n > 1 ? `<div style="position:absolute;left:50%;bottom:4px;transform:translateX(-50%);display:flex;gap:6px;z-index:600">${it.b.map((_, j) => `<button data-act="h2:stk:${it.id}:${j}" aria-label="Élément ${j + 1}" style="width:${j === cur ? 18 : 8}px;height:8px;border-radius:4px;background:${j === cur ? p.acc : (p.light ? '#0004' : '#fff6')}"></button>`).join('')}</div>` : '';
  const ov = edit ? `<div data-fdrag="${it.id}" style="position:absolute;inset:0;z-index:700;border-radius:${p.r}px;background:${sel ? '#00000059' : '#00000026'};border:${sel ? `3px solid ${p.acc}` : `2px dashed ${p.acc}`};display:flex;align-items:center;justify-content:center"><span style="background:#000c;color:#fff;border-radius:8px;padding:4px 10px;font-size:13px;font-weight:600;max-width:90%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${it.b.map(fWName).join(' · ')}${n > 1 ? ' (groupe)' : ''} · <span data-fsize>${it.w}×${it.h}</span></span></div>
    <button data-act="h2:del:${it.id}" class="fdel" style="top:6px;left:6px" aria-label="Retirer">−</button><div data-fh="${it.id}" class="fhandle" aria-label="Taille"></div>` : '';
  const anim = fStackAnim && fStackAnim.id === it.id ? ` class="fslide${fStackAnim.d}"` : '';
  return `<div data-fitem="${it.id}" ${n > 1 && !edit ? `data-stack="${it.id}"` : ''} style="${pos}position:relative;min-width:0;min-height:0;display:grid;overflow:hidden;border-radius:${p.r}px;${faded}"><div${anim} style="display:grid;min-width:0;min-height:0">${inner}</div>${dots}${ov}</div>`;
}
LAYOUTS.custom = (p) => {
  const c = fCfg();
  if (homePage > c.pages.length - 1) homePage = c.pages.length - 1;
  const items = c.pages[homePage] || [];
  const edit = editing;
  const cells = edit ? Array.from({ length: FW * FH }, (_, k) => `<div style="grid-column:${(k % FW) + 1};grid-row:${Math.floor(k / FW) + 1};border:1.5px dashed ${p.light ? '#0002' : '#fff2'};border-radius:10px;pointer-events:none"></div>`).join('') : '';
  const ms = { used: false };
  const html = items.map((it) => fItemHtml(p, it, edit, ms)).join('');
  const empty = !items.length ? `<div style="grid-column:3 / span 8;grid-row:3 / span 2;display:flex;align-items:center;justify-content:center;text-align:center;color:${p.onmut};font-size:16px;pointer-events:none">${edit ? 'Page vide : touche « + Ajouter » ou glisse un élément ici' : 'Page vide · appui long pour la remplir'}</div>` : '';
  const grid = `<div id="fgrid" data-fgridbg="1" style="position:relative;display:grid;grid-template-columns:repeat(${FW},minmax(0,1fr));grid-template-rows:repeat(${FH},minmax(0,1fr));gap:12px;min-height:0;${edit ? 'touch-action:none;' : ''}">${cells}${empty}${html}</div>`;
  return `<div style="position:relative;display:grid;grid-template-rows:${R(p, '44px minmax(0,1fr) 86px')};gap:12px;height:100%">${header(p)}${grid}${dockC(p)}</div>`;
};

// barre d'édition (remplace l'en-tête)
editBar = function (p) {
  const b = (act, t, pri, title) => `<button data-act="${act}" ${title ? `aria-label="${title}"` : ''} style="height:40px;min-width:40px;padding:0 10px;border-radius:10px;font-size:14px;font-weight:600;white-space:nowrap;${pri ? `background:${p.acc};color:${p.onAcc}` : `background:${p.card2};color:${p.txt}`}">${t}</button>`;
  const c = fCfg(), f = fSel ? fFind(c, fSel) : null, it = f && f.it;
  let tools;
  if (!it) tools = `<span style="font-size:14px;color:${p.onmut};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Glisse pour déplacer · coin ◢ pour la taille · lâche une appli sur une autre = dossier</span>`;
  else if (it.t === 'w') {
    const id = it.b[0];
    tools = `${fSizes(id).slice(0, 4).map(([n, w, h]) => b(`h2:sz:${w}:${h}`, n, it.w === w && it.h === h)).join('')}<span style="width:4px"></span>${b('h2:dw:-1', '↔−', 0, 'Moins large')}${b('h2:dw:1', '↔+', 0, 'Plus large')}${b('h2:dh:-1', '↕−', 0, 'Moins haut')}${b('h2:dh:1', '↕+', 0, 'Plus haut')}<span style="width:4px"></span>${b('h2:group', '+ Grouper')}${b('h2:mvp:-1', '◀', 0, 'Page précédente')}${b('h2:mvp:1', '▶', 0, 'Page suivante')}`;
  } else if (it.t === 'f') tools = `${b('h2:fedit:' + it.id, 'Ouvrir / renommer')}${b('h2:unfold:' + it.id, 'Défaire le dossier')}${b('h2:mvp:-1', '◀ Page')}${b('h2:mvp:1', 'Page ▶')}`;
  else tools = `<span style="font-size:14px;color:${p.onmut}">${esc((appInfo(it.p) || {}).l || it.p)}</span>${b('h2:mvp:-1', '◀ Page')}${b('h2:mvp:1', 'Page ▶')}`;
  return `<div style="display:flex;align-items:center;gap:6px;height:44px;color:${p.ontxt};min-width:0"><b style="font-size:15px;white-space:nowrap">Page ${homePage + 1}/${c.pages.length}</b>${tools}<span style="flex:1"></span>${it ? '' : b('h2:newpage', '+ Page') + b('h2:reset', fResetArm ? 'Confirmer ?' : 'Par défaut')}${b('h2:add', '+ Ajouter')}${b('h2:done', 'OK', 1)}</div>`;
};

// fenêtres par-dessus l'accueil : ajout, dossier, question
function fOverlays(p) {
  let h = '';
  const panel = (inner, w = 1060) => `<div data-act="h2:pickx" data-noswipe="1" style="position:absolute;inset:0;z-index:950;background:#000000a6;display:flex;align-items:center;justify-content:center"><div data-act="h2:noop" style="width:${w}px;max-height:96%;${card(p, 'padding:16px 18px;display:flex;flex-direction:column;gap:12px')};background:${hex7(p.card)};color:${p.txt}">${inner}</div></div>`;
  if (fPick) {
    const c = fCfg(); const on = appsOnScreen(c);
    const tb = (k, t) => `<button data-act="h2:ptab:${k}" style="height:42px;padding:0 16px;border-radius:10px;font-size:15px;font-weight:600;${fPickTab === k ? `background:${p.acc};color:${p.onAcc}` : `background:${p.card2};color:${p.txt}`}">${t}</button>`;
    const head = `<div style="display:flex;align-items:center;gap:8px"><b style="font-size:18px;margin-right:8px">${fPick === 'g' ? 'Ajouter au groupe (on glisse d\'un widget à l\'autre)' : 'Ajouter sur la page ' + (homePage + 1)}</b>${fPick === 'g' ? '' : tb('w', 'Widgets') + tb('a', 'Applis')}<span style="flex:1"></span><button data-act="h2:pickx" style="height:42px;padding:0 16px;border-radius:10px;background:${p.card2};color:${p.txt};font-weight:600">Fermer</button></div>`;
    let body;
    if (fPick === 'g' || fPickTab === 'w') {
      body = `<div class="scroll" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;max-height:470px;align-content:start">${fOrder().map(([k, B]) => `<div style="${box(p, 'padding:8px;display:flex;flex-direction:column;gap:6px')}"><div style="height:112px;border-radius:10px;background:#0b0d12 url(wprev/${k}.webp) center/contain no-repeat"></div><b style="font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${B.n}</b><div style="display:flex;gap:6px">${fPick === 'g' ? `<button data-act="h2:addg:${k}" style="flex:1;height:42px;border-radius:10px;background:${p.acc};color:${p.onAcc};font-weight:600">Ajouter au groupe</button>` : fSizes(k).map(([n, w, h]) => `<button data-act="h2:addw:${k}:${w}:${h}" style="flex:1;height:42px;border-radius:10px;background:${p.card};color:${p.txt};font-size:13px;font-weight:600;line-height:1.1">${n}<br><span style="font-size:11px;color:${p.mut}">${w}×${h}</span></button>`).join('')}</div></div>`).join('')}</div>`;
    } else {
      const apps = allApps(); const missing = apps.filter((a) => !on.has(a.p)).length;
      body = `<div style="display:flex;gap:8px;align-items:center"><input id="fQ" class="fld" placeholder="Rechercher une appli" style="${fld(p, 'flex:1;height:46px;font-size:16px')}"><button data-act="h2:addall" style="height:46px;padding:0 14px;border-radius:10px;background:${p.acc};color:${p.onAcc};font-weight:600;white-space:nowrap">Ajouter toutes les applis (${missing})</button></div>
      <div class="scroll" id="fAppList" style="display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:10px;max-height:380px;align-content:start;--ics:54px">${apps.length ? apps.map((a) => `<button data-act="h2:adda:${esc(a.p)}" data-name="${esc(a.l.toLowerCase())}" class="fapp" style="color:${p.txt};padding:6px 0;position:relative"><span class="ficw"><span class="fic" style="background:${hashCol(a.p)}">${esc(a.l.charAt(0).toUpperCase())}<img data-icon="${esc(a.p)}" alt=""></span>${on.has(a.p) ? `<span class="fdel" style="background:${p.acc};font-size:15px">✓</span>` : ''}</span><span class="flb" style="text-shadow:none">${esc(a.l)}</span></button>`).join('') : `<div style="grid-column:1 / -1;color:${p.mut}">Aucune appli trouvée.</div>`}</div>`;
    }
    h += panel(head + body);
  }
  if (fFolder) {
    const c = fCfg(), f = fFind(c, fFolder);
    if (!f) fFolder = null;
    else {
      const it = f.it, per = 18, nP = Math.max(1, Math.ceil(it.apps.length / per)); fFolderPg = Math.min(fFolderPg, nP - 1);
      const list = it.apps.slice(fFolderPg * per, fFolderPg * per + per);
      const title = fFolderEdit ? `<div style="display:flex;gap:8px;align-items:center"><input id="fName" value="${esc(it.n || 'Dossier')}" maxlength="24" style="${fld(p, 'flex:1;height:48px;font-size:18px;font-weight:600')}"><button data-act="h2:fren" style="height:48px;padding:0 16px;border-radius:10px;background:${p.acc};color:${p.onAcc};font-weight:600">Renommer</button><button data-act="h2:fclose" style="height:48px;padding:0 16px;border-radius:10px;background:${p.card2};color:${p.txt};font-weight:600">Fermer</button></div>` : `<div style="font-size:22px;font-weight:600;text-align:center">${esc(it.n || 'Dossier')}</div>`;
      const grid = `<div data-folder="${it.id}" data-noswipe="1" style="display:grid;grid-template-columns:repeat(6,minmax(0,1fr));grid-auto-rows:110px;gap:8px;--ics:62px;min-height:${Math.min(3, Math.ceil(list.length / 6)) * 118}px">${list.map((pk) => `<div style="display:grid">${fAppHtml(Object.assign({}, p, { ontxt: p.txt }), pk, false, fFolderEdit ? `h2:frm:${pk}` : '')}</div>`).join('')}</div>`;
      const dots = nP > 1 ? `<div style="display:flex;justify-content:center;gap:9px">${Array.from({ length: nP }, (_, i) => `<button data-act="h2:fpg:${i}" style="width:${i === fFolderPg ? 22 : 9}px;height:9px;border-radius:5px;background:${i === fFolderPg ? p.acc : '#8888'}"></button>`).join('')}</div>` : '';
      h += `<div data-act="h2:fclose" data-noswipe="1" style="position:absolute;inset:0;z-index:950;background:#000000b3;display:flex;align-items:center;justify-content:center"><div data-act="h2:noop" style="width:820px;${card(p, 'padding:18px 22px;display:flex;flex-direction:column;gap:14px')};background:${hex7(p.card)};color:${p.txt}">${title}${grid}${dots}${fFolderEdit ? `<div style="font-size:13px;color:${p.mut}">Touche « − » pour sortir une appli du dossier.</div>` : ''}</div></div>`;
    }
  }
  if (fAsk) h += panel(`<div style="font-size:20px;font-weight:600">Personnaliser l'accueil ?</div><div style="font-size:15px;color:${p.mut};line-height:1.5">L'accueil passe en « écran libre » : tu places tes widgets et tes applis où tu veux, sur plusieurs pages. Ton thème garde ses couleurs. Tu peux revenir à la disposition du thème dans l'onglet Thèmes.</div><div style="display:flex;gap:10px;justify-content:flex-end"><button data-act="h2:ask:no" style="height:48px;padding:0 18px;border-radius:10px;background:${p.card2};color:${p.txt};font-weight:600">Non</button><button data-act="h2:ask:yes" style="height:48px;padding:0 18px;border-radius:10px;background:${p.acc};color:${p.onAcc};font-weight:600">Oui, personnaliser</button></div>`, 620);
  return h;
}
// après chaque rendu : taille des icônes, animations, recherche
function fAfterRender() {
  const g = $('fgrid');
  if (g) {
    const ch = (g.clientHeight - 12 * (FH - 1)) / FH, cw = (g.clientWidth - 12 * (FW - 1)) / FW;
    g.style.setProperty('--ics', Math.round(Math.max(34, Math.min(64, ch - 24, cw - 18))) + 'px');
  }
  if (fAnim) { const t = g || $('screen').firstElementChild; if (t) t.classList.add('fslide' + fAnim); fAnim = null; }
  fStackAnim = null;
  fLoadIcons($('screen'));
  const q = $('fQ');
  if (q) q.addEventListener('input', () => { const s = q.value.trim().toLowerCase(); document.querySelectorAll('#fAppList [data-name]').forEach((e) => { e.style.display = !s || e.dataset.name.includes(s) ? '' : 'none'; }); });
  if (fDrag && fDrag.started) fDrag.ph = null;
}

// nombre de pages glissables sur l'accueil
function homePageCount() {
  if (palette().layout === 'custom') return fCfg().pages.length + (editing ? 0 : 1);
  return 3;
}
function fStackMove(id, dir) {
  const c = fCfg(), f = fFind(c, id); if (!f) return; const n = f.it.b.length;
  stackIdx[id] = ((stackIdx[id] || 0) + dir + n) % n; fStackAnim = { id, d: dir > 0 ? 'L' : 'R' }; render();
}
stackMove = fStackMove;

// ================= actions =================
function fEnterEdit(selId) {
  if (moving()) { toast('Disponible à l\'arrêt'); return; }
  if (palette().layout !== 'custom') { fAsk = true; render(); return; }
  editing = true; fSel = selId || null; fPick = null; fFolder = null; tab = 'home';
  if (homePage > fCfg().pages.length - 1) homePage = 0;
  render();
}
function fDone() {
  const c = fClone();
  c.pages = c.pages.filter((pg, i) => i === 0 || pg.length);
  fSave(c); editing = false; fSel = null; fPick = null; fFolder = null; fFolderEdit = false; fResetArm = false;
  if (homePage > c.pages.length - 1) homePage = c.pages.length - 1;
  render();
}
function fAct(v, long) {
  const parts = v.split(':'), op = parts[0];
  const edits = ['del', 'add', 'addw', 'adda', 'addall', 'addg', 'newpage', 'reset', 'sz', 'dw', 'dh', 'mvp', 'group', 'unfold', 'frm', 'fren'];
  if (edits.includes(op) && moving()) { toast('Disponible à l\'arrêt'); return; }
  if (op !== 'reset') fResetArm = false;
  const c = fClone();
  const f = fSel ? fFind(c, fSel) : null, it = f && f.it;
  const save = () => { fSave(c); render(); };
  switch (op) {
    case 'noop': return;
    case 'app': {
      const pk = parts.slice(1).join(':');
      if (long && palette().layout === 'custom' && tab === 'home') { const ff = fFindApp(c, pk); fEnterEdit(ff ? ff.id : null); return; }
      if (fFolder) { fFolder = null; render(); }
      if (!A) toast('Ouverture : ' + ((appInfo(pk) || {}).l || pk)); else if (!A.launch(pk)) toast('Appli introuvable (désinstallée ?)');
      return;
    }
    case 'fold': if (long) fEnterEdit(parts[1]); else { fFolder = parts[1]; fFolderPg = 0; fFolderEdit = false; render(); } return;
    case 'fedit': fFolder = parts[1]; fFolderPg = 0; fFolderEdit = true; render(); return;
    case 'fclose': fFolder = null; fFolderEdit = false; render(); return;
    case 'fpg': fFolderPg = +parts[1]; render(); return;
    case 'fren': { const ff = fFind(c, fFolder); if (ff) { ff.it.n = ($('fName').value || '').trim() || 'Dossier'; fSave(c); toast('Dossier renommé'); } render(); return; }
    case 'frm': {
      const pk = parts.slice(1).join(':'); const ff = fFind(c, fFolder); if (!ff) return;
      ff.it.apps = ff.it.apps.filter((x) => x !== pk);
      fPlace(c, { id: nid(), t: 'a', p: pk, w: 1, h: 1 }, homePage);
      if (ff.it.apps.length <= 1) { fUnfold(c, ff); fFolder = null; }
      return save();
    }
    case 'unfold': { const ff = fFind(c, parts[1]); if (ff) { fUnfold(c, ff); fSel = null; } return save(); }
    case 'stk': { stackIdx[parts[1]] = +parts[2]; render(); return; }
    case 'del': {
      const ff = fFind(c, parts[1]); if (!ff) return;
      if (ff.it.t === 'w' && ff.it.b.length > 1) { const cur = Math.min(stackIdx[ff.it.id] || 0, ff.it.b.length - 1); ff.it.b.splice(cur, 1); stackIdx[ff.it.id] = 0; toast('Retiré du groupe'); }
      else { c.pages[ff.pg].splice(ff.k, 1); if (fSel === ff.it.id) fSel = null; toast(ff.it.t === 'f' ? 'Dossier retiré (les applis restent dans « Toutes les applis »)' : 'Retiré de l\'écran'); }
      return save();
    }
    case 'add': fPick = 'n'; render(); return;
    case 'group': if (it && it.t === 'w') { fPick = 'g'; render(); } return;
    case 'ptab': fPickTab = parts[1]; render(); return;
    case 'pickx': fPick = null; fAsk = false; if (fFolder) { fFolder = null; fFolderEdit = false; } render(); return;
    case 'addw': {
      const [, id, w, h] = parts; const n = { id: nid(), t: 'w', b: [id], w: +w, h: +h };
      const pg = fPlace(c, n, homePage); fPick = null; fSel = n.id; if (pg !== homePage) { homePage = pg; toast(`Plus de place ici : ajouté en page ${pg + 1}`); }
      return save();
    }
    case 'addg': {
      if (!it || it.t !== 'w') return; const id = parts[1];
      if (!it.b.includes(id)) it.b.push(id);
      const [mw, mh] = fMin(it);
      if (it.w < mw || it.h < mh) { const r = { x: it.x, y: it.y, w: Math.max(it.w, mw), h: Math.max(it.h, mh) }; if (fFits(c.pages[f.pg], r, it.id)) Object.assign(it, r); }
      stackIdx[it.id] = it.b.length - 1; fPick = null; toast('Ajouté au groupe : glisse dessus pour passer de l\'un à l\'autre'); return save();
    }
    case 'adda': {
      const pk = parts.slice(1).join(':');
      if (appsOnScreen(c).has(pk)) { toast('Déjà sur l\'écran'); return; }
      const pg = fPlace(c, { id: nid(), t: 'a', p: pk, w: 1, h: 1 }, homePage);
      toast(`${(appInfo(pk) || {}).l || pk} ajoutée${pg !== homePage ? ` en page ${pg + 1}` : ''}`); fSave(c); render(); return;
    }
    case 'addall': {
      const on = appsOnScreen(c); const list = allApps().filter((a) => !on.has(a.p));
      if (!list.length) { toast('Toutes les applis sont déjà sur l\'écran'); return; }
      const before = c.pages.length; let first = -1; list.forEach((a) => { const pg = fPlace(c, { id: nid(), t: 'a', p: a.p, w: 1, h: 1 }, homePage); if (first < 0) first = pg; });
      fPick = null; if (first >= 0 && first !== homePage) { fAnim = first > homePage ? 'L' : 'R'; homePage = first; } toast(`${list.length} applis ajoutées${c.pages.length > before ? ` · ${c.pages.length - before} page(s) créée(s)` : ''}`); return save();
    }
    case 'newpage': c.pages.push([]); homePage = c.pages.length - 1; fSel = null; return save();
    case 'tidy': {
      if (moving()) { toast('Disponible à l\'arrêt'); return; }
      if (Date.now() - fTidyArm > 5000) { fTidyArm = Date.now(); toast('Touche encore « Ranger » pour confirmer : ta disposition actuelle sera remplacée'); return; }
      fTidyArm = 0; const cur0 = store.get(fKey(), null); if (cur0) store.set('home_bak_' + profIdx(), cur0);
      store.set('layout_' + profIdx(), 'custom'); store.set(fKey(), fTidy()); editing = false; fSel = null; tab = 'home'; homePage = 0; render(); toast('Accueil rangé'); return;
    }
    case 'unbak': { const b0 = store.get('home_bak_' + profIdx(), null); if (!b0) { toast('Pas d\'ancienne disposition gardée'); return; } store.set('home_bak_' + profIdx(), fCfg()); store.set(fKey(), b0); store.set('layout_' + profIdx(), 'custom'); tab = 'home'; homePage = 0; render(); toast('Ancienne disposition remise'); return; }
    case 'reset': if (!fResetArm) { fResetArm = true; render(); return; } fResetArm = false; store.set(fKey(), null); fSel = null; homePage = 0; render(); toast('Disposition par défaut remise'); return;
    case 'done': fDone(); return;
    case 'sz': case 'dw': case 'dh': {
      if (!it || it.t !== 'w') return; const [mw, mh] = fMin(it);
      let w = op === 'sz' ? +parts[1] : it.w + (op === 'dw' ? +parts[1] : 0), h = op === 'sz' ? +parts[2] : it.h + (op === 'dh' ? +parts[1] : 0);
      w = Math.max(mw, Math.min(FW, w)); h = Math.max(mh, Math.min(FH, h));
      if (w === it.w && h === it.h) { toast(op === 'sz' ? 'Déjà à cette taille' : 'Taille mini ou maxi atteinte'); return; }
      const items = c.pages[f.pg];
      let r = { x: Math.min(it.x, FW - w), y: Math.min(it.y, FH - h), w, h };
      if (!fFits(items, r, it.id)) r = fFree(items, w, h, it.id);
      if (!r) { toast('Pas assez de place sur cette page : déplace ou réduis un voisin'); return; }
      Object.assign(it, r); return save();
    }
    case 'mvp': {
      if (!it) return; const to = f.pg + (+parts[1]); if (to < 0) { toast('Déjà sur la première page'); return; }
      if (to >= c.pages.length) c.pages.push([]);
      if (it.t === 'w' && it.b.includes('map') && hasMap(c.pages[to])) { toast('Il y a déjà une carte sur cette page'); return; }
      const r = fFree(c.pages[to], it.w, it.h); if (!r) { toast('Pas de place sur la page ' + (to + 1)); return; }
      c.pages[f.pg].splice(f.k, 1); Object.assign(it, r); c.pages[to].push(it); homePage = to; fAnim = parts[1] > 0 ? 'L' : 'R'; return save();
    }
    case 'ask': fAsk = false; if (parts[1] === 'yes') { store.set('layout_' + profIdx(), 'custom'); editing = true; fSel = null; homePage = 0; } render(); return;
  }
}
function fFindApp(c, pk) { for (const pg of c.pages) for (const it of pg) if (it.t === 'a' && it.p === pk) return it; return null; }
function fUnfold(c, ff) {
  const it = ff.it, pg = c.pages[ff.pg]; pg.splice(ff.k, 1);
  if (it.apps.length) { const first = { id: nid(), t: 'a', p: it.apps[0], x: it.x, y: it.y, w: 1, h: 1 }; pg.push(first); it.apps.slice(1).forEach((pk) => fPlace(c, { id: nid(), t: 'a', p: pk, w: 1, h: 1 }, ff.pg)); }
}

// ================= glisser-déposer et taille au doigt =================
function fMetrics() {
  const g = $('fgrid'); if (!g) return null;
  const r = g.getBoundingClientRect(); const s = r.width / g.offsetWidth; const gap = 12 * s;
  const cw = (r.width - gap * (FW - 1)) / FW, ch = (r.height - gap * (FH - 1)) / FH;
  return { g, r, s, gap, cw, ch, sx: cw + gap, sy: ch + gap };
}
function fItemAt(items, cx, cy, skip) { return items.find((o) => o.id !== skip && cx >= o.x && cx < o.x + o.w && cy >= o.y && cy < o.y + o.h); }
function fSetupDrag() {
  const st = $('stage');
  st.addEventListener('pointerdown', (e) => {
    if (!editing || tab !== 'home' || fPick || fFolder || palette().layout !== 'custom') return;
    const hd = e.target.closest('[data-fh]'), dg = e.target.closest('[data-fdrag]');
    if (!hd && !dg) return;
    const id = hd ? hd.dataset.fh : dg.dataset.fdrag;
    const c = fCfg(), f = fFind(c, id); const el = document.querySelector(`[data-fitem="${id}"]`); const m = fMetrics();
    if (!f || !el || !m) return;
    e.preventDefault();
    const er = el.getBoundingClientRect();
    fDrag = { mode: hd ? 'size' : 'move', id, src: f.pg, it: Object.assign({}, f.it), x0: e.clientX, y0: e.clientY, offX: e.clientX - er.left, offY: e.clientY - er.top, w: er.width / m.s, h: er.height / m.s, started: false, pid: e.pointerId, target: null, edgeT: 0, edgeDir: 0 };
    try { st.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
  }, true);
  st.addEventListener('pointermove', (e) => {
    if (!fDrag || e.pointerId !== fDrag.pid) return;
    const dx = e.clientX - fDrag.x0, dy = e.clientY - fDrag.y0;
    if (!fDrag.started) { if (Math.abs(dx) + Math.abs(dy) < 10) return; fDrag.started = true; fStartGhost(); }
    e.preventDefault();
    if (fDrag.mode === 'move') fDragMove(e); else fSizeMove(e);
  }, true);
  const end = (e) => {
    if (!fDrag || e.pointerId !== fDrag.pid) return;
    const d = fDrag; fDrag = null; clearTimeout(d.edgeT);
    if (d.ghost) d.ghost.remove();
    if (!d.started) { fSel = fSel === d.id ? null : d.id; render(); return; }
    if (e.type === 'pointercancel') { render(); return; }
    if (d.mode === 'move') fDrop(d); else fSizeDrop(d);
  };
  st.addEventListener('pointerup', end, true);
  st.addEventListener('pointercancel', end, true);
}
function fStartGhost() {
  const d = fDrag; if (d.mode !== 'move') return;
  const el = document.querySelector(`[data-fitem="${d.id}"]`); if (!el) return;
  const gh = el.cloneNode(true);
  gh.querySelectorAll('[id]').forEach((x) => x.removeAttribute('id'));
  gh.querySelectorAll('[data-k],[data-fdrag],[data-fh],.fdel').forEach((x) => { if (x.matches('[data-fdrag],[data-fh],.fdel')) x.remove(); else x.removeAttribute('data-k'); });
  gh.removeAttribute('data-fitem'); gh.classList.remove('fj');
  Object.assign(gh.style, { position: 'absolute', left: '0', top: '0', width: d.w + 'px', height: d.h + 'px', zIndex: 2500, pointerEvents: 'none', opacity: '.9', transform: 'scale(1.04)', boxShadow: '0 12px 32px #000a', gridColumn: '', gridRow: '' });
  $('stage').appendChild(gh); d.ghost = gh;
  el.style.opacity = '.25';
}
function fPlaceGhost(e) {
  const d = fDrag, st = $('stage').getBoundingClientRect(), s = st.width / 1280;
  if (d.ghost) { d.ghost.style.left = ((e.clientX - st.left - d.offX) / s) + 'px'; d.ghost.style.top = ((e.clientY - st.top - d.offY) / s) + 'px'; }
}
function fPh(m) {
  if (!fDrag.ph || !fDrag.ph.isConnected) { const ph = document.createElement('div'); ph.style.cssText = 'z-index:650;pointer-events:none;border-radius:14px;border:3px dashed'; m.g.appendChild(ph); fDrag.ph = ph; }
  return fDrag.ph;
}
function fDragMove(e) {
  const d = fDrag; fPlaceGhost(e);
  const m = fMetrics(); if (!m) return;
  const c = fCfg(), items = c.pages[homePage] || [];
  const it = d.it;
  // élément sous le doigt : dossier, groupe ou échange
  const cx = Math.floor((e.clientX - m.r.left + m.gap / 2) / m.sx), cy = Math.floor((e.clientY - m.r.top + m.gap / 2) / m.sy);
  const under = fItemAt(items, cx, cy, d.id);
  document.querySelectorAll('.fmerge').forEach((x) => x.classList.remove('fmerge'));
  d.target = null;
  if (under) {
    const ur = document.querySelector(`[data-fitem="${under.id}"]`);
    let kind = null;
    if (it.t === 'a' && under.t === 'a') kind = 'folder';
    else if (it.t === 'a' && under.t === 'f') kind = 'infolder';
    else if (it.t === 'w' && under.t === 'w') kind = 'stack';
    if (kind && ur) {
      const rr = ur.getBoundingClientRect(), mx = rr.width * 0.22, my = rr.height * 0.22;
      if (e.clientX > rr.left + mx && e.clientX < rr.right - mx && e.clientY > rr.top + my && e.clientY < rr.bottom - my) { d.target = { kind, id: under.id }; ur.classList.add('fmerge'); }
    }
  }
  // case visée par le coin haut-gauche du fantôme
  const gx = e.clientX - d.offX, gy = e.clientY - d.offY;
  const tx = Math.max(0, Math.min(FW - it.w, Math.round((gx - m.r.left) / m.sx))), ty = Math.max(0, Math.min(FH - it.h, Math.round((gy - m.r.top) / m.sy)));
  d.cell = { x: tx, y: ty, w: it.w, h: it.h };
  const ok = !d.target && fFits(items, d.cell, d.id) && !(it.t === 'w' && it.b.includes('map') && hasMap(items, d.id));
  const ph = fPh(m);
  ph.style.gridColumn = `${tx + 1} / span ${it.w}`; ph.style.gridRow = `${ty + 1} / span ${it.h}`;
  ph.style.display = d.target ? 'none' : 'block';
  ph.style.borderColor = ok ? curP.acc : '#E0312B'; ph.style.background = ok ? hex7(curP.acc) + '2e' : '#E0312B2e';
  d.ok = ok;
  // bord de l'écran : changement de page
  const edge = e.clientX < m.r.left + 26 * m.s ? -1 : e.clientX > m.r.right - 26 * m.s ? 1 : 0;
  if (edge !== d.edgeDir) {
    clearTimeout(d.edgeT); d.edgeDir = edge;
    if (edge) d.edgeT = setTimeout(() => fFlip(edge), 650);
  }
}
function fFlip(dir) {
  const d = fDrag; if (!d) return;
  const c = fClone(); const to = homePage + dir;
  if (to < 0) return;
  if (to >= c.pages.length) { if (!c.pages[c.pages.length - 1].length) return; c.pages.push([]); fSave(c); }
  homePage = to; fAnim = dir > 0 ? 'L' : 'R'; d.ph = null; render(); d.edgeDir = 0;
  d.edgeT = setTimeout(() => { if (fDrag === d && d.edgeDir) fFlip(d.edgeDir); }, 900);
}
function fDrop(d) {
  document.querySelectorAll('.fmerge').forEach((x) => x.classList.remove('fmerge'));
  const c = fClone(), src = fFind(c, d.id); if (!src) { render(); return; }
  const it = src.it, items = c.pages[homePage];
  const remove = () => { const s2 = fFind(c, d.id); c.pages[s2.pg].splice(s2.k, 1); };
  if (d.target) {
    const t = fFind(c, d.target.id).it;
    if (d.target.kind === 'folder') { remove(); const tf = fFind(c, t.id); tf.it.t = 'f'; tf.it.n = 'Dossier'; tf.it.apps = [t.p, it.p]; delete tf.it.p; fSel = null; fFolder = t.id; fFolderEdit = true; fFolderPg = 0; toast('Dossier créé : donne-lui un nom'); }
    else if (d.target.kind === 'infolder') { remove(); if (!t.apps.includes(it.p)) t.apps.push(it.p); toast(`Ajoutée au dossier « ${t.n || 'Dossier'} »`); }
    else { remove(); it.b.forEach((b) => { if (!t.b.includes(b)) t.b.push(b); }); const tf = fFind(c, t.id); const [mw, mh] = fMin(t); if (t.w < mw || t.h < mh) { const r = { x: t.x, y: t.y, w: Math.max(t.w, mw), h: Math.max(t.h, mh) }; if (fFits(c.pages[tf.pg], r, t.id)) Object.assign(t, r); } stackIdx[t.id] = 0; fSel = t.id; toast('Groupe créé : glisse dessus pour passer d\'un widget à l\'autre'); }
    fSave(c); render(); return;
  }
  if (d.ok && d.cell) { remove(); Object.assign(it, { x: d.cell.x, y: d.cell.y }); c.pages[homePage].push(it); fSel = it.id; fSave(c); render(); return; }
  // échange avec un élément de même taille sur la même page
  if (d.cell && src.pg === homePage) {
    const others = items.filter((o) => o.id !== it.id && fOverlap(o, d.cell));
    if (others.length === 1 && others[0].w === it.w && others[0].h === it.h) { const o = others[0]; [o.x, o.y, it.x, it.y] = [it.x, it.y, d.cell.x, d.cell.y]; fSave(c); render(); return; }
  }
  toast('Pas de place ici'); render();
}
function fSizeMove(e) {
  const d = fDrag, m = fMetrics(); if (!m) return;
  const el = document.querySelector(`[data-fitem="${d.id}"]`); if (!el) return;
  const it = d.it, [mw, mh] = fMin(it);
  const left = m.r.left + it.x * m.sx, top = m.r.top + it.y * m.sy;
  const w = Math.max(mw, Math.min(FW - it.x, Math.ceil((e.clientX - left + m.gap / 2) / m.sx - 0.35)));
  const h = Math.max(mh, Math.min(FH - it.y, Math.ceil((e.clientY - top + m.gap / 2) / m.sy - 0.35)));
  const items = fCfg().pages[homePage] || [];
  const ok = fFits(items, { x: it.x, y: it.y, w, h }, it.id);
  d.size = { w, h }; d.ok = ok;
  el.style.gridColumn = `${it.x + 1} / span ${w}`; el.style.gridRow = `${it.y + 1} / span ${h}`;
  el.style.outline = ok ? '' : '4px solid #E0312B';
  const lab = el.querySelector('[data-fsize]'); if (lab) lab.textContent = `${w}×${h}`;
}
function fSizeDrop(d) {
  if (d.ok && d.size) { const c = fClone(), f = fFind(c, d.id); if (f) { Object.assign(f.it, d.size); fSel = d.id; fSave(c); } }
  else toast('Ça touche un autre élément : taille non changée');
  render();
}

// appui long sur l'accueil (hors boutons) = mode édition
function fSetupLongPress() {
  const st = $('stage'); let lp = null;
  st.addEventListener('pointerdown', (e) => {
    if (tab !== 'home' || editing || fPick || fFolder || fAsk) return;
    if (!e.target.closest('#screen') || e.target.closest('input, select, textarea, .ov')) return;
    const it = e.target.closest('[data-fitem]');
    // hors widget : seulement sur une zone vide ; sur un widget ou une appli : partout
    if (!it && e.target.closest('[data-act], .mapslot, .car3dslot, .scroll, [data-noswipe]')) return;
    lp = { x: e.clientX, y: e.clientY, id: it ? it.dataset.fitem : null, t: setTimeout(() => { if (!lp) return; const id = lp.id; lp = null; if (press) { clearTimeout(press.timer); press = null; } swipe = null; fEnterEdit(id); }, it ? 520 : 700) };
  }, true);
  const cancel = () => { if (lp) { clearTimeout(lp.t); lp = null; } };
  st.addEventListener('pointermove', (e) => { if (lp && Math.abs(e.clientX - lp.x) + Math.abs(e.clientY - lp.y) > 14) cancel(); }, true);
  st.addEventListener('pointerup', cancel, true);
  st.addEventListener('pointercancel', cancel, true);
  // glisser dans un dossier ouvert : pages du dossier
  let fs = null;
  st.addEventListener('pointerdown', (e) => { fs = e.target.closest('[data-folder]') ? { x: e.clientX, y: e.clientY } : null; }, true);
  st.addEventListener('pointerup', (e) => {
    if (!fs || !fFolder) return; const s = $('stage').getBoundingClientRect().width / 1280; const dx = (e.clientX - fs.x) / s, dy = (e.clientY - fs.y) / s; fs = null;
    if (Math.abs(dx) > 60 && Math.abs(dy) < 80) { const f = fFind(fCfg(), fFolder); if (!f) return; const nP = Math.ceil(f.it.apps.length / 18); const n = Math.max(0, Math.min(nP - 1, fFolderPg + (dx < 0 ? 1 : -1))); if (n !== fFolderPg) { fFolderPg = n; render(); } }
  }, true);
}


document.addEventListener('DOMContentLoaded', () => { fSetupDrag(); fSetupLongPress(); });

// ================= widget GPS (remplace la carte intégrée et le cadre freeform) =================
const GPS_APPS = [['com.waze', 'Waze'], ['com.google.android.apps.maps', 'Google Maps']];
const GD = window.GpsDock || null;   // objet natif ajouté par GpsDockInit (module à compiler)
const GPS_OFF = 'off.accueil2008';     // faux nom d'appli : mémorisé dans le module natif pour qu'il ne rouvre rien tout seul
const gpsNative = () => !!(GD && typeof GD.gpsOpen === 'function');     // module natif présent dans l'APK
// Par défaut : Waze / Maps DANS le cadre (le module GPS natif), sans aucun logo ni bouton autour.
// Android ne l'accepte que si l'appli est dans /system/priv-app ; s'il refuse (gpsRefused), le cadre montre la carte de l'appli.
const gpsEmbed = () => gpsNative() && store.get('gpsFrame', true) !== false && !store.get('gpsRefused', false);
let gpsPend = 0, gpsArm = 0, gpsShown = false, gpsNote = false;   // essai en attente · essai lancé (heure) · cadre natif affiché · message à montrer au retour
function gpsTry(pk) { gpsPend = Date.now(); if (gpsShown) { gpsArm = gpsPend; gpsPend = 0; } GD.gpsOpen(pk); }
const gpsNativeLast = () => { try { const l = gpsNative() ? String(GD.gpsLast() || '') : ''; return l === GPS_OFF ? '' : l; } catch (e) { return ''; } };
const gpsLastPk = () => store.get('gpsLast', '') || gpsNativeLast() || 'com.waze';
function gpsOpen(pk) {
  store.set('gpsLast', pk);
  if (gpsEmbed()) { gpsTry(pk); render(); return; }
  if (!A) { toast('Aperçu : ' + ((GPS_APPS.find((x) => x[0] === pk) || [])[1] || pk) + ' s\'ouvrirait'); render(); return; }
  if (!A.launch(pk)) toast('Appli introuvable : ' + pk);
}
let gpsMenu = false;
function gpsCard(p, opts = {}) {
  const nm = (GPS_APPS.find((x) => x[0] === gpsLastPk()) || [0, 'GPS'])[1];
  if (!gpsEmbed()) {      // juste la carte (elle suit la voiture) ; « Recentrer » n'apparaît que si on l'a déplacée au doigt
    const g = p.light ? '#FFFFFFEB' : '#0E1116E0', gt = p.light ? '#16171A' : '#F2F2F4';
    return `<div style="position:relative;overflow:hidden;background:${p.map};${opts.bleed ? '' : card(p, `background:${p.map};`)}${opts.style || ''};min-height:0;min-width:0"><div class="mapslot" data-noswipe="1" style="position:absolute;inset:0"></div>
    <button data-act="recenter" data-show="recenter" style="position:absolute;bottom:${opts.bottom || 12}px;right:12px;z-index:500;display:none;background:${g};color:${gt};border-radius:12px;height:44px;padding:0 14px;font-size:14px;font-weight:600;box-shadow:0 2px 10px #0005">Recentrer</button></div>`;
  }
  const inner = gpsEmbed() ? `<div>Chargement de ${nm}…</div>` : `<button data-act="gps:open:${gpsLastPk()}" style="background:#1F6FD1;color:#fff;border-radius:14px;padding:14px 22px;font-size:17px;font-weight:700">Ouvrir ${nm}</button><div style="font-size:12px;opacity:.75;margin-top:10px">Changer de GPS : appui long sur « GPS » en bas, ou Paramètres → Appli GPS.</div>`;
  return `<div style="position:relative;display:flex;padding:10px;${opts.bleed ? '' : card(p, '')};${opts.style || ''};min-height:0;min-width:0">
    <div class="gpsslot" data-noswipe="1" style="flex:1;min-width:0;border-radius:${Math.max(10, p.r - 6)}px;background:linear-gradient(160deg,#0f1a33,#0a1022);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#cfe3ff;font-size:15px;line-height:1.45;padding:14px">${inner}</div></div>`;
}
// petit menu Waze / Google Maps (appui long sur « GPS » ou réglages)
function gpsMenuHtml(p) {
  if (!gpsMenu) return '';
  const cur = gpsLastPk();
  const row = ([pk, n]) => `<button data-act="gps:set:${pk}" style="display:flex;align-items:center;gap:12px;width:100%;min-height:60px;padding:8px 14px;border-radius:12px;background:${p.card2};color:${p.txt};font-size:17px;font-weight:600;${cur === pk ? 'outline:3px solid #1F6FD1' : ''}"><span class="fic" style="--ics:40px;background:${hashCol(pk)}">${n.charAt(0)}<img data-icon="${pk}" alt=""></span>${n}<span style="margin-left:auto">${cur === pk ? '✓' : ''}</span></button>`;
  return `<div data-act="gps:menux" data-noswipe="1" style="position:absolute;inset:0;z-index:960;background:#00000099;display:flex;align-items:center;justify-content:center"><div data-act="h2:noop" style="width:380px;${card(p, 'padding:16px;display:flex;flex-direction:column;gap:10px')};background:${hex7(p.card)};color:${p.txt}"><b style="font-size:18px">Appli GPS</b>${GPS_APPS.map(row).join('')}<div style="font-size:13px;color:${p.mut}">${gpsEmbed() ? 'Elle se lance toute seule dans le cadre au démarrage.' : 'Elle s\'ouvre en grand quand tu touches « GPS » en bas.'}</div></div></div>`;
}
const _fOverlays = fOverlays;
fOverlays = function (p) { return _fOverlays(p) + gpsMenuHtml(p); };
window.mapCard = function (p, opts) { return gpsCard(p, opts || {}); };
if (GBLOCKS.map) { GBLOCKS.map.n = 'GPS (Waze / Google Maps)'; GBLOCKS.map.r = (p) => gpsCard(p); }
// ancien cadre freeform : désactivé
window.ffLaunch = function () { gpsOpen(gpsLastPk()); };
window.ffAuto = function () {};
window.ffMode = function () { return false; };
const _actGps = window.act;
window.act = function (a, long) {
  if (a.indexOf('gps:open:') === 0) { gpsOpen(a.slice(9)); return; }
  if (a.indexOf('gps:pick:') === 0) { const pk = a.slice(9); store.set('gpsLast', pk); if (gpsEmbed()) gpsTry(pk); toast('GPS : ' + ((GPS_APPS.find((x) => x[0] === pk) || [0, ''])[1])); render(); return; }
  if (a === 'gps:menux') { gpsMenu = false; render(); return; }
  if (a === 'gps:frame') {
    const nm = (GPS_APPS.find((x) => x[0] === gpsLastPk()) || [0, 'GPS'])[1];
    if (gpsEmbed()) { store.set('gpsFrame', false); try { GD.gpsVisible(false); GD.gpsOpen(GPS_OFF); } catch (e) { /* rien */ } toast('Carte de l\'appli dans le cadre'); }
    else if (!gpsNative()) toast('Module GPS absent de cette version');
    else { store.set('gpsFrame', true); store.set('gpsRefused', false); tab = 'home'; homePage = 0; render(); gpsTry(gpsLastPk()); toast('Ouverture de ' + nm + ' dans le cadre…'); return; }
    render(); return;
  }
  if (a.indexOf('gps:set:') === 0) { gpsMenu = false; gpsOpen(a.slice(8)); toast('GPS : ' + ((GPS_APPS.find((x) => x[0] === a.slice(8)) || [0, ''])[1])); return; }
  if (a === 'dock:gps') { if (long) { gpsMenu = true; tab = 'home'; homePage = 0; render(); } else { if (gpsEmbed()) { tab = 'home'; homePage = 0; } gpsOpen(gpsLastPk()); } return; }
  _actGps(a, long);
};
// position du cadre envoyée au module natif (s'il existe et si le réglage est activé)
(function () {
  if (!gpsNative()) return;
  let last = '';
  const t0 = Date.now(); let boot = false;   // boot : le module natif va relancer tout seul le dernier GPS (1,5 s après son démarrage)
  const sync = () => {
    if (!gpsEmbed()) { gpsShown = false; if (last !== 'off') { last = 'off'; try { GD.gpsVisible(false); } catch (e) { /* rien */ } } return; }
    const el = document.querySelector('#screen .gpsslot'); let key = 'hide', r = null;
    if (el && tab === 'home') {
      r = el.getBoundingClientRect();
      const top = r.width > 40 && r.height > 40 ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) : null;
      if (top && el.contains(top)) { const k = window.devicePixelRatio || 1; r = [r.left, r.top, r.width, r.height].map((v) => Math.round(v * k)); key = r.join(','); }
    }
    if (key !== last) {
      last = key;
      if (key === 'hide') { gpsShown = false; GD.gpsVisible(false); }
      else { GD.gpsBounds(r[0], r[1], r[2], r[3]); GD.gpsVisible(true); gpsShown = true; if (gpsPend) { gpsArm = Date.now(); gpsPend = 0; } }   // c'est à l'affichage du cadre que le module lance vraiment l'appli
    }
    // relance automatique du module : elle part dès que le cadre est affiché (donc après l'écran de bienvenue s'il est là)
    if (gpsShown && boot) { gpsArm = Date.now(); if (Date.now() - t0 >= 1500) boot = false; }
  };
  setInterval(sync, 300);
  // Au démarrage : le module natif relance tout seul le dernier GPS (1,5 s après) ; s'il n'a rien en mémoire, on ouvre nous-mêmes celui choisi.
  boot = gpsEmbed() && !!gpsNativeLast();
  setTimeout(() => { if (gpsEmbed() && !gpsNativeLast()) gpsTry(gpsLastPk()); }, 2500);
  // Refus d'Android (appli pas dans /system/priv-app) : le module ouvre alors le GPS en plein écran, donc notre écran passe
  // derrière juste après l'essai. C'est le signe : on arrête d'essayer et le cadre montre la carte de l'appli à la place.
  const refused = () => {
    if (!gpsEmbed() || !gpsArm || Date.now() - gpsArm > 9000) return;
    gpsArm = 0; store.set('gpsRefused', true); gpsNote = true; gpsShown = false; last = 'off';
    try { const l = gpsNativeLast(); if (l && !store.get('gpsLast', '')) store.set('gpsLast', l); GD.gpsVisible(false); GD.gpsOpen(GPS_OFF); } catch (e) { /* rien */ }
    try { render(); } catch (e) { /* rien */ }
  };
  const back = () => { if (!gpsNote) return; gpsNote = false; try { render(); } catch (e) { /* rien */ } toast('Android refuse Waze dans le cadre (appli pas dans /system/priv-app) : carte de l\'appli à la place. Waze s\'ouvre en grand avec « GPS ».'); };
  // (on ne se fie pas à la perte de « focus » : quand Waze marche DANS le cadre, il prend aussi le focus)
  document.addEventListener('visibilitychange', () => { if (document.hidden) refused(); else setTimeout(back, 400); });
  { const r0 = window.onResumeHome; window.onResumeHome = function () { if (r0) r0.apply(this, arguments); setTimeout(back, 400); }; }
  // cadre natif coupé ou refusé : le module relance sinon tout seul le dernier GPS au démarrage (en plein écran, avec son message d'erreur).
  // On lui fait mémoriser un nom d'appli qui n'existe pas ; fait après son propre démarrage (1,5 s), sinon il ré-écrit par-dessus.
  const quiet = () => { if (gpsEmbed()) return; try { const l = String(GD.gpsLast() || ''); if (l && l !== GPS_OFF) { if (!store.get('gpsLast', '')) store.set('gpsLast', l); GD.gpsVisible(false); GD.gpsOpen(GPS_OFF); } } catch (e) { /* rien */ } };
  setTimeout(quiet, 4000); setTimeout(quiet, 12000);
})();

// réglage « Appli GPS » dans la page Paramètres
if (typeof SETCATS !== 'undefined') SETCATS.splice(Math.max(0, SETCATS.findIndex(([n]) => n === 'Navigation')) + 1, 0, ['Appli GPS', [['Appli GPS', (p) => {
  const cur = gpsLastPk();
  const on = gpsEmbed();
  return `<div style="display:flex;flex-direction:column;gap:10px;max-width:640px"><div style="font-size:14px;color:${p.mut}">${on ? 'L\'appli choisie s\'ouvre dans le cadre GPS de l\'accueil et se relance toute seule au démarrage.' : 'Le cadre de l\'accueil montre la carte, seule. L\'appli choisie s\'ouvre en grand avec le bouton « GPS » de la barre du bas.'} Changer d'appli : ici, ou appui long sur « GPS ».</div>${GPS_APPS.map(([pk, n]) => `<button data-act="gps:pick:${pk}" style="display:flex;align-items:center;gap:12px;min-height:60px;padding:8px 14px;border-radius:12px;background:${p.card2};color:${p.txt};font-size:17px;font-weight:600;${cur === pk ? 'outline:3px solid #1F6FD1' : ''}"><span class="fic" style="--ics:40px;background:${hashCol(pk)}">${n.charAt(0)}<img data-icon="${pk}" alt=""></span>${n}<span style="margin-left:auto">${cur === pk ? '✓' : ''}</span></button>`).join('')}
    ${setRow(p, 'Waze / Maps dans le cadre', !gpsNative() ? 'Module GPS absent de cette version.' : on ? 'Activé. Android ne l\'accepte que si l\'appli est installée dans /system/priv-app (autoradio rooté).' : store.get('gpsRefused', false) ? 'Android a refusé : l\'appli n\'est pas dans /system/priv-app. Le cadre montre la carte de l\'appli à la place.' : 'Désactivé : le cadre montre la carte de l\'appli.', chipBtn(p, 'gps:frame', on ? 'Activé' : store.get('gpsRefused', false) ? 'Réessayer' : 'Activer', on))}</div>`;
}]]]);
