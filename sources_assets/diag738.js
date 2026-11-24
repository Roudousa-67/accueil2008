/* 7.38 : rapport de diagnostic complet, par catégorie, avec vérification des réglages et de l'appli. */
(() => {
 'use strict';
 const CATS = [
  ['gps', 'GPS'], ['waze', 'Waze et cadre GPS'], ['autoradio', 'Autoradio'], ['internet', 'Internet et services'],
  ['carto', 'Serveur cartographique'], ['decor', 'Décor du widget'], ['trajets', 'Trajets et carte'], ['stations', 'Stations et carburant'],
  ['transfert', 'Transfert QR'], ['stockage', 'Mémoire et stockage'], ['reglages', 'Réglages'], ['appli', 'Fonctionnement de l’appli'], ['erreurs', 'Erreurs récentes'],
 ];
 const RANK = { bad: 3, todo: 2, info: 0, fix: 0, ok: 0 };
 const LABEL = { bad: 'Problème', todo: 'À vérifier', info: 'Info', fix: 'Corrigé', ok: 'OK' };
 const COLOR = { bad: '#e0312b', todo: '#f0a23a', info: '#7c8aa5', fix: '#2f7de1', ok: '#2e9e4d' };
 const ICON = { bad: '✗', todo: '!', info: 'ℹ', fix: '🔧', ok: '✓' };
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 const ago = t => { if (!t) return 'jamais'; const s = Math.round((Date.now() - t) / 1000); return s < 90 ? 'il y a ' + s + ' s' : s < 5400 ? 'il y a ' + Math.round(s / 60) + ' min' : 'il y a ' + Math.round(s / 3600) + ' h'; };
 const pad = n => String(n).padStart(2, '0');
 const stamp = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;

 // Classement des constats de l'ancien diagnostic (v47) dans les nouvelles catégories.
 function classify(text) {
  if (/cadre GPS|appli GPS|Waze|plein écran|petite fenêtre|launchIn/i.test(text)) return 'waze';
  if (/^GPS|position|localisation/i.test(text)) return 'gps';
  if (/Internet|services en ligne|ne répond|Météo|Limitations|Adresses|carburant \(data/i.test(text)) return 'internet';
  if (/Mémoire/i.test(text)) return 'stockage';
  if (/erreur/i.test(text)) return 'erreurs';
  return 'autoradio';
 }

 // Contrôles propres à la 7.38. Chaque constat : { cat, lvl, t, fix?, btn? }.
 async function checks() {
  const F = [], add = (cat, lvl, t, fix, btn) => F.push({ cat, lvl, t, fix: fix || '', btn: btn || null });
  const tech = [];
  // --- GPS
  const g = safe(() => Overpass737.gpsStats, null);
  if (g) {
   add('gps', 'info', `${g.received} positions reçues depuis le démarrage, ${g.ignored} positions « réseau » imprécises ignorées.`);
   if (g.error) add('gps', 'bad', `Erreur à la réception GPS : ${g.error} (${ago(g.errorAt)}).`, 'Envoie-moi ce rapport.');
  }
  if (loc && Number.isFinite(loc.acc) && loc.acc > 45 && Date.now() - loc.ts < 60000) add('gps', 'todo', `Précision actuelle ${Math.round(loc.acc)} m : trop imprécise pour reconnaître la route.`, 'Normal sous un toit ou entre de hauts immeubles ; sinon vérifie l’antenne GPS.');
  // --- Serveur cartographique
  const os = safe(() => Overpass737.stats, {}) || {};
  for (const [k, label] of [['routes', 'Routes'], ['zones', 'Zones bâties']]) {
   const s = os[k];
   if (!s) { add('carto', 'info', `${label} : aucune demande pour l’instant (il faut rouler ou être sur l’accueil).`); continue; }
   const lastOk = s.okAt && s.okAt >= s.failAt;
   if (lastOk) add('carto', s.fail > s.ok ? 'todo' : 'ok', `${label} : reçues ${ago(s.okAt)} (${s.size} éléments) · ${s.ok} réussies, ${s.fail} échouées.`);
   else add('carto', s.ok ? 'todo' : 'bad', `${label} : dernier échec ${ago(s.failAt)} — ${s.error} · ${s.ok} réussies, ${s.fail} échouées.`, /429|busy|rate/i.test(s.error) ? 'Le serveur public est saturé : l’appli fait une pause puis passe sur le serveur de secours.' : 'Vérifie Internet ; si ça continue, envoie-moi ce rapport.');
  }
  safe(() => Overpass737.report(), []).forEach(line => tech.push(line));
  // --- Décor
  const manual = store.get('roadScene', 'auto');
  if (manual !== 'auto') add('decor', 'todo', `Paysage réglé à la main sur « ${manual} » : le décor ne change plus tout seul.`, 'Remets « Automatique ».', ['scene:auto', 'Automatique']);
  else add('decor', 'ok', `Décor automatique · affiché : ${safe(() => roadScene(), '?')}.`);
  const reason = safe(() => RoadScene731.status.reason, '');
  if (reason) add('decor', /absentes|imprécis/.test(reason) ? 'todo' : 'info', 'Raison du choix : ' + reason + '.');
  add('decor', 'info', 'Route : ' + safe(() => Road723.status(), '?') + '.');
  const pace = safe(() => RoadLoop725.pace(), null), perf = safe(() => Perf725.stats(), null);
  if (pace) add('decor', 'info', `Cadence de l’animation : ${Math.round(pace.fps)} images/s (dessin moyen ${pace.cost.toFixed(1)} ms).`);
  if (safe(() => Perf725.cap(), 2) < 2) add('decor', 'info', 'Décor allégé automatiquement pour rester fluide.', '', ['perf725:reset', 'Rétablir']);
  if (!safe(() => RoadSky719.enabled(), true)) add('decor', 'info', 'Soleil et lune masqués par un réglage.');
  // --- Trajets et carte
  const idx = safe(() => trkIndex(), []) || [];
  add('trajets', safe(() => trkAuto(), false) ? 'ok' : 'info', safe(() => trkAuto(), false) ? `Enregistrement automatique des trajets : activé · ${idx.length} trajets gardés.` : `Enregistrement automatique des trajets désactivé · ${idx.length} trajets gardés.`, '', safe(() => trkAuto(), false) ? null : ['tg:trkAuto:1', 'Activer']);
  if (typeof trk !== 'undefined' && trk) add('trajets', 'info', `Trajet en cours depuis ${ago(trk.t0)} · ${fr1(trk.km)} km · ${safe(() => trkPts.length, 0)} positions.`);
  const leaflet = typeof L !== 'undefined' ? true : await safe(() => Maps738.ensure().then(() => true, () => false), Promise.resolve(false));
  add('trajets', leaflet ? 'ok' : 'bad', leaflet ? 'Bibliothèque de cartes : chargée.' : 'Bibliothèque de cartes : impossible à charger.', leaflet ? '' : 'Envoie-moi ce rapport.');
  const tiles = safe(() => [Maps738.tileLoads, Maps738.tileErrors], [0, 0]);
  if (tiles[0] + tiles[1]) add('trajets', tiles[1] > tiles[0] ? 'todo' : 'ok', `Fond de carte : ${tiles[0]} morceaux reçus, ${tiles[1]} en échec.`, tiles[1] > tiles[0] ? 'Le fond de carte demande Internet ; le tracé reste visible sans.' : '');
  // --- Stations
  const st = safe(() => st47, null), sv = window.Services738 || {};
  if (st) {
   if (st.list.length) add('stations', 'ok', `${st.list.length} stations avec prix · recherche ${ago(st.at)}.`);
   else add('stations', st.at ? 'todo' : 'info', st.msg || 'Aucune station pour l’instant.', st.at ? 'Augmente le rayon de recherche ou vérifie Internet.' : 'La recherche démarre avec une position GPS.');
   if (st.de) add('stations', 'info', st.de);
  }
  for (const name of ['Prix carburant France', 'Prix carburant Allemagne']) { const s = sv[name]; if (s && s.fail && s.failAt > s.okAt) add('stations', 'todo', `${name} : dernier échec ${ago(s.failAt)} — ${s.error}.`); }
  if (loc && safe(() => st47InDE(loc.lat, loc.lon), false) && !String(store.get('tkKey', '') || '').trim()) add('stations', 'info', 'Prix allemands indisponibles : aucune clé Tankerkönig enregistrée.', '', ['journey733:stationSettings', 'Réglages']);
  const S738 = safe(() => Stations738.state, null), H738 = safe(() => Highway738.state, null);
  const V = safe(() => window.V740, null);
  if (V) {
   if (V.W.error) add('internet', 'todo', 'Météo devant toi : ' + V.W.error); else if (V.W.at) add('internet', 'ok', `Météo devant toi : prévision reçue ${ago(V.W.at)}${V.W.fine ? ' (tranches de 15 min)' : ' (par heure)'}.`);
   if (!String(store.get('tomtomKey740', '') || '').trim()) add('carto', 'info', 'Bouchons en direct : aucune clé TomTom (GPS et navigation → Bouchons en direct).');
   else if (V.T.error) add('carto', 'todo', 'Bouchons en direct : ' + V.T.error);
  }
  if (S738 && S738.frError) add('stations', 'todo', S738.frError, 'Vérifie Internet (carte SIM) puis Actualiser dans Carburant → Stations.');
  if (S738 && S738.osmError) add('stations', 'info', S738.osmError); else if (S738 && S738.osmAt) add('stations', 'ok', `Paiement et AdBlue (OpenStreetMap) : ${S738.osm.length} stations décrites autour de toi.`);
  if (H738 && H738.exitsAt) add('carto', H738.exitError ? 'todo' : 'ok', H738.exitError ? 'Sorties d’autoroute : ' + H738.exitError : `Sorties d’autoroute connues : ${H738.exits.length} (recherche ${ago(H738.exitsAt)}).`);
  if (H738 && H738.stAt) add('stations', H738.stError ? 'todo' : 'ok', H738.stError ? 'Stations d’autoroute : ' + H738.stError : `Stations d’autoroute jusqu’à 60 km : ${H738.stations.length} (${H738.source}).`);
  // --- Transfert QR
  const tr = safe(() => Transfer738.status(), null);
  if (!tr) add('transfert', 'info', 'Serveur de transfert non disponible dans cette version.');
  else {
   if (!tr.native) add('transfert', 'bad', 'Le serveur de l’autoradio est absent du module Android installé.', 'Installe la dernière version de l’appli.');
   else if (!tr.running) add('transfert', 'todo', 'Serveur de l’autoradio arrêté.', '', ['transfer738:start', 'Démarrer']);
   else if (!tr.ip) add('transfert', 'todo', 'Serveur en marche, mais l’autoradio n’est sur aucun réseau Wi-Fi.', 'Active le point d’accès Wi-Fi de l’autoradio et connecte ton téléphone dessus.');
   else add('transfert', 'ok', `Serveur en marche : ${tr.url}`);
   if (tr.native) add('stockage', tr.used > tr.quota * .9 ? 'todo' : 'ok', `Fichiers reçus : ${(tr.used / 1048576).toFixed(0)} Mo sur ${(tr.quota / 1073741824).toFixed(0)} Go réservés.`);
  }
  // --- Stockage du navigateur
  let bytes = 0; safe(() => { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); bytes += (k.length + (localStorage.getItem(k) || '').length) * 2; } });
  add('stockage', bytes > 4.2e6 ? 'todo' : 'ok', `Données de l’appli : ${(bytes / 1048576).toFixed(1)} Mo (limite d’Android ≈ 5 Mo).`, bytes > 4.2e6 ? 'Efface de vieux trajets.' : '');
  if (safe(() => store.error(), '')) add('stockage', 'bad', 'Enregistrement des réglages impossible : ' + store.error() + '.', 'Libère de la place ; si ça continue, envoie-moi ce rapport.');
  // --- Réglages : valeurs qui coupent une fonction ou figent un affichage
  const R = [
   [store.get('updAuto', true) === false, 'info', 'Recherche automatique des mises à jour désactivée.', ['tg:updAuto:1', 'Activer']],
   [store.get('perf725Guard', true) === false, 'info', 'Protection de fluidité désactivée : le décor peut saccader sur ce poste.', ['perf725:guard', 'Activer']],
   [store.get('driver728On', false) === true, 'info', 'Vue conducteur GPS activée (remplace les cinq décors).', null],
   [Number(store.get('near728Km', 1)) === 0, 'info', 'Panneaux des villes et villages proches désactivés.', null],
   [store.get('skyBodies719', true) === false, 'info', 'Soleil et lune masqués.', null],
  ];
  for (const [on, lvl, t, btn] of R) if (on && t) add('reglages', lvl, t, '', btn);
  const gbp = safe(() => gbPk(), ''), apps = safe(() => allApps(), []) || [];
  if (A && gbp && apps.length > 3 && !apps.some(a => a.p === gbp)) add('reglages', 'bad', `Appli GPS choisie (${gbp}) non installée.`, 'Choisis une autre appli GPS.', ['gb:menu', 'Choisir']);
  // Toutes les pages de réglages doivent s'afficher sans erreur.
  const p = curP || palette();let pages = 0;const broken = [];
  for (const [cat, subs] of SETCATS) for (const [sub, fn] of subs) { pages++; try { const html = fn(p); if (typeof html !== 'string') throw Error('page vide'); } catch (e) { broken.push(`${cat} › ${sub} : ${e && e.message || e}`); } }
  if (broken.length) broken.forEach(b => add('reglages', 'bad', 'Page de réglages en erreur : ' + b, 'Envoie-moi ce rapport.'));
  else add('reglages', 'ok', `${pages} pages de réglages vérifiées : toutes s’affichent.`);
  // --- Fonctionnement de l'appli : modules et décors
  const modules = [['Route', 'Road723'], ['Choix du décor', 'RoadScene731'], ['Lieux', 'Place710'], ['Décors', 'Decors726'], ['Requêtes cartographiques', 'Overpass737'], ['Cartes', 'Maps738'], ['Routes empruntées', 'RoadsTaken738'], ['Trajets', 'Journeys733'], ['Transfert', 'Transfer738'], ['Stations', 'Stations738'], ['Autoroute', 'Highway738'], ['Météo du décor', 'Weather738'], ['Alertes sur la route', 'V740']];
  // Certains modules sont des déclarations globales (const), pas des propriétés de window.
  const exists = name => safe(() => new Function(`return typeof ${name} !== 'undefined'`)(), false);
  const missing = modules.filter(([, g]) => !exists(g)).map(([n]) => n);
  add('appli', missing.length ? 'bad' : 'ok', missing.length ? 'Modules absents : ' + missing.join(', ') + '.' : `${modules.length} modules chargés.`, missing.length ? 'Réinstalle l’appli ; si ça continue, envoie-moi ce rapport.' : '');
  const draws = await decorTest();
  const failed = draws.filter(d => d.error);
  add('appli', failed.length ? 'bad' : 'ok', failed.length ? 'Décor en erreur : ' + failed.map(d => d.scene + ' (' + d.error + ')').join(', ') : 'Les 5 décors se dessinent : ' + draws.map(d => d.scene + ' ' + d.ms + ' ms').join(', ') + '.');
  // --- Erreurs récentes (journal 7.38)
  const errs = safe(() => Errors738.list.slice(-15).reverse(), []);
  if (errs.length) errs.forEach(e => add('erreurs', 'bad', `${e.where} : ${e.message}${e.count > 1 ? ' (×' + e.count + ')' : ''} · ${ago(e.at)}`));
  else add('erreurs', 'ok', 'Aucune erreur enregistrée depuis le démarrage.');
  // --- Données techniques
  for (const [name, s] of Object.entries(sv)) tech.push(`${name} : ${s.ok} réussies, ${s.fail} échouées${s.okAt ? ' · dernière réponse ' + ago(s.okAt) + ' en ' + s.ms + ' ms' : ''}${s.failAt > s.okAt ? ' · dernier échec : ' + s.error : ''}`);
  if (perf) tech.push(`Performances : ${perf.fps.toFixed(1)} i/s · dessin ${perf.drawMs.toFixed(1)} ms · rendu ${perf.renderMs.toFixed(1)} ms · mémoire ${perf.jsBytes ? (perf.jsBytes / 1048576).toFixed(0) + ' Mo' : '?'}`);
  return { F, tech };
 }

 // Dessine chaque décor hors écran pour vérifier qu'il fonctionne et mesurer son coût.
 async function decorTest() {
  const out = [], box = document.createElement('div');
  box.setAttribute('data-roadbox', ''); box.style.cssText = 'position:fixed;left:-3000px;top:0;width:320px;height:320px;overflow:hidden';
  box.innerHTML = '<canvas data-road="v" style="position:absolute;inset:0;width:100%;height:100%"></canvas><div data-car360 style="position:absolute"></div>';
  document.body.appendChild(box);
  const cv = box.querySelector('canvas'), scene0 = window.roadScene;
  try {
   for (const scene of ['ville', 'village', 'campagne', 'foret', 'autoroute']) {
    window.roadScene = () => scene;
    const t0 = performance.now();
    try { RoadDecor721.draw(cv, 10, 120, 50); out.push({ scene, ms: Math.round(performance.now() - t0) }); }
    catch (e) { out.push({ scene, ms: 0, error: String(e && e.message || e).slice(0, 80) }); }
    await Promise.resolve();
   }
  } finally { window.roadScene = scene0; box.remove(); safe(() => RoadFX718.frames.clear()); }
  return out;
 }

 const Diag738 = {
  busy: false, report: null, step: '',
  async run() {
   if (this.busy) return; this.busy = true; this.step = 'Vérifications de base…'; redraw();
   try {
    if (typeof dgRun === 'function') await dgRun('rapport738');
    this.step = 'Vérifications 7.38…'; redraw();
    const base = (typeof dgRep !== 'undefined' && dgRep) || { F: [], text: '' };
    const { F, tech } = await checks();
    const all = base.F.filter(f => !(f.lvl === 'ok' && /Aucune erreur/.test(f.t))).map(f => ({ ...f, cat: classify(f.t) })).concat(F);
    const cats = CATS.map(([id, title]) => {
     const items = all.filter(f => f.cat === id);
     let lvl = items.reduce((w, f) => RANK[f.lvl] > RANK[w] ? f.lvl : w, 'ok');
     // Que des informations (aucun contrôle réussi) : « Info » plutôt que « OK ».
     if (lvl === 'ok' && !items.some(f => f.lvl === 'ok' || f.lvl === 'fix')) lvl = 'info';
     return { id, title, lvl, items };
    }).filter(c => c.items.length);
    const d = new Date(), count = l => cats.filter(c => c.lvl === l).length;
    const head = `RAPPORT COMPLET ACCUEIL 2008 GT ${APP_VERSION} — ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const lines = [head, `Résumé : ${count('bad')} problème(s), ${count('todo')} à vérifier, ${count('ok')} OK`, ''];
    for (const c of cats) { lines.push(`== ${c.title} : ${LABEL[c.lvl]} ==`); for (const f of c.items) lines.push(`${ICON[f.lvl]} ${f.t}${f.fix ? '\n   → ' + f.fix : ''}`); lines.push(''); }
    lines.push('== Données techniques 7.38 ==', ...tech, '', ...(window.Display743 ? safe(() => Display743.reportLines(), []) : []), '', '== Détails (vérification de base) ==', base.text || '');
    const text = lines.join('\n');
    this.report = { at: Date.now(), name: `rapport-${stamp(d)}.html`, cats, text, counts: { bad: count('bad'), todo: count('todo'), ok: count('ok') } };
    // L'envoi existant (e-mail, WhatsApp, copie, affichage plein écran) utilise ce texte complet.
    if (typeof dgRep !== 'undefined' && dgRep) { dgRep.text = text; store.set('diagLast', dgRep); }
    store.set('diag738', { at: this.report.at, name: this.report.name, counts: this.report.counts, cats: cats.map(c => ({ id: c.id, title: c.title, lvl: c.lvl, items: c.items.map(f => ({ lvl: f.lvl, t: f.t, fix: f.fix, btn: f.btn })) })) });
    safe(() => { const saved = Transfer738.saveText(this.report.name, 'text/html', toHTML(this.report)); this.report.file = saved; });
   } catch (e) {
    safe(() => Errors738.add('rapport de diagnostic', e));
    this.report = { at: Date.now(), cats: [{ id: 'erreurs', title: 'Erreurs récentes', lvl: 'bad', items: [{ lvl: 'bad', t: 'Le rapport lui-même a échoué : ' + (e && e.message || e), fix: 'Envoie-moi une photo de cet écran.' }] }], text: String(e && e.stack || e), counts: { bad: 1, todo: 0, ok: 0 } };
   }
   this.busy = false; this.step = ''; redraw();
  },
  saved() { if (this.report) return this.report; const s = store.get('diag738', null); return s ? { ...s, text: (store.get('diagLast', null) || {}).text || '' } : null; },
 };
 window.Diag738 = Diag738;
 function redraw() { if (tab === 'settings') safe(() => render()); }
 function toHTML(r) {
  const card = c => `<section style="border:1px solid #dde3ef;border-radius:12px;padding:12px 14px;margin:10px 0"><h2 style="margin:0 0 6px;font-size:17px">${esc(c.title)} <span style="font-size:13px;color:${COLOR[c.lvl]}">${LABEL[c.lvl]}</span></h2>${c.items.map(f => `<p style="margin:4px 0">${ICON[f.lvl]} ${esc(f.t)}${f.fix ? `<br><small style="color:#55627a">→ ${esc(f.fix)}</small>` : ''}</p>`).join('')}</section>`;
  return `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(r.name)}</title><body style="font:15px/1.5 system-ui,sans-serif;max-width:900px;margin:0 auto;padding:16px;color:#14223a"><h1 style="font-size:22px">Rapport Accueil 2008 GT ${esc(APP_VERSION)}</h1><p>${r.counts.bad} problème(s) · ${r.counts.todo} à vérifier · ${r.counts.ok} OK</p>${r.cats.map(card).join('')}<details><summary>Texte complet</summary><pre style="white-space:pre-wrap;font-size:12.5px">${esc(r.text)}</pre></details></body></html>`;
 }

 function page(p) {
  const r = Diag738.saved(), busy = Diag738.busy;
  const chip = (lvl, text) => `<span style="padding:3px 10px;border-radius:20px;font-size:12.5px;font-weight:700;background:${COLOR[lvl]}2b;color:${COLOR[lvl]}">${esc(text)}</span>`;
  const tr = safe(() => Transfer738.status(), null);
  const actions = r ? `<div style="${box(p, 'padding:12px 14px;display:flex;flex-wrap:wrap;gap:8px;align-items:center')}">${chipBtn(p, 'diag738:run', busy ? 'Vérification en cours…' : 'Créer un nouveau rapport', true)}${tr && tr.running && tr.ip && r.file && r.file.ok ? chipBtn(p, 'diag738:qr', 'QR pour le télécharger') : ''}${chipBtn(p, 'dg:mail', 'E-mail')}${chipBtn(p, 'dg:wa', 'WhatsApp')}${chipBtn(p, 'dg:copy', 'Copier')}${chipBtn(p, 'dg:view', 'Afficher en grand')}<span style="font-size:12.5px;color:${p.mut}">${r.file && r.file.ok ? 'Fichier : ' + esc(r.name) : 'Créé ' + ago(r.at)}</span></div>` : '';
  const cats = r ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px;align-items:start">${r.cats.map(c => `<details ${c.lvl === 'bad' || c.lvl === 'todo' ? 'open' : ''} style="${box(p, 'padding:10px 12px')}"><summary style="display:flex;justify-content:space-between;align-items:center;gap:8px;cursor:pointer;font-weight:700;font-size:15px">${esc(c.title)} ${chip(c.lvl, LABEL[c.lvl])}</summary>${c.items.map(f => `<div style="font-size:13px;line-height:1.4;margin-top:6px;color:${f.lvl === 'ok' ? p.mut : p.txt}">${ICON[f.lvl]} ${esc(f.t)}${f.fix ? `<div style="color:${p.mut}">→ ${esc(f.fix)}</div>` : ''}${f.btn ? `<div style="margin-top:4px">${chipBtn(p, f.btn[0], f.btn[1])}</div>` : ''}</div>`).join('')}</details>`).join('')}</div>` : '';
  const summary = r ? `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">${chip('bad', r.counts.bad + ' problème(s)')}${chip('todo', r.counts.todo + ' à vérifier')}${chip('ok', r.counts.ok + ' OK')}<span style="font-size:12.5px;color:${p.mut}">Créé ${ago(r.at)}</span></div>` : '';
  return `<div style="display:flex;flex-direction:column;gap:12px;max-width:1000px"><div style="font-size:13.5px;color:${p.mut};line-height:1.45">Vérifie tout le poste, par catégorie : GPS, Waze, autoradio, Internet, serveur cartographique, décor, trajets, stations, transfert, stockage, réglages, fonctionnement de l’appli et erreurs. Ce qui peut être corrigé tout seul l’est (🔧). Envoie-moi le rapport pour que je voie d’où vient un problème.</div>
   ${r ? summary : `<div>${chipBtn(p, 'diag738:run', busy ? 'Vérification en cours…' : 'Créer le rapport', true)}</div>`}${busy ? `<div style="font-size:13px;color:${p.mut}">${esc(Diag738.step)}</div>` : ''}${cats}${actions}</div>`;
 }
 const sys = SETCATS.find(c => c[0] === 'Système');
 if (sys) {
  const i = sys[1].findIndex(s => s[0] === 'Diagnostic et rapport');
  if (i >= 0) sys[1][i] = ['Rapport de diagnostic', page]; else sys[1].push(['Rapport de diagnostic', page]);
 }
 const open0 = window.openSet;
 window.openSet = function (cat, sub) { if (sub === 'Diagnostic et rapport') sub = 'Rapport de diagnostic'; return open0.call(this, cat, sub); };
 const act0 = window.act;
 window.act = function (a, long) {
  if (a === 'dg:open') { openSet('Système', 'Rapport de diagnostic'); return; }
  if (a === 'diag738:run') { Diag738.run(); return; }
  if (a === 'diag738:qr') { safe(() => Transfer738.showQR(Diag738.report.file.path, 'Rapport de diagnostic')); return; }
  return act0.apply(this, arguments);
 };
})();
