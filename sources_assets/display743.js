/* 7.43 : « Rechercher l'affichage » (Réglages → Système). Fouille l'autoradio pour savoir comment le
   lanceur d'origine affiche Waze dans un petit cadre (encastrement, écran virtuel, fenêtre libre,
   commande du fabricant) et ce que notre appli a le droit d'utiliser ; essais pour cacher Waze quand
   une autre appli s'ouvre. Lecture seule : rien n'est modifié sur le poste. Le résultat part au
   téléphone par QR et s'ajoute au rapport de diagnostic. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 const N = () => window.Display743Native || null;
 // 7.44 : appli d'essai au choix (les Réglages Android n'ont pas d'icône sur certains autoradios).
 const ME = 'fr.gtline.accueil2008';
 const nav = () => safe(() => typeof gbPk === 'function' ? gbPk() : 'com.waze', 'com.waze') || 'com.waze';
 function testApps() {
  const list = safe(() => (typeof allApps === 'function' ? allApps() : []).filter(a => a && a.p && a.p !== ME && a.p !== nav()), []);
  const score = a => /radio|music|musique|youtube|spotify|deezer|player|lecteur/i.test(a.p + ' ' + (a.l || '')) ? 0 : 1;
  return list.slice().sort((a, b) => score(a) - score(b)).slice(0, 6);
 }
 const testApp = () => store.get('display743App', '') || (testApps()[0] || {}).p || 'com.android.settings';
 const mail = () => store.get('display743Mail', '') || '';

 // 7.44 : tout d'un coup. Recherche + 4 essais enchaînés côté natif, puis PDF et e-mail prérempli.
 // L'utilisateur filme l'écran avec son téléphone ; rien à toucher pendant les essais.
 function runAll() {
  const n = N(), inp = document.getElementById('d743mail');
  if (inp && inp.value) store.set('display743Mail', inp.value.trim());
  if (!n || typeof n.startAll !== 'function') { S.error = 'Il faut la 7.44 installée sur l’autoradio.'; redraw(); return; }
  S.allRunning = true; S.error = ''; S.pdf = null;
  safe(() => n.startAll(testApp(), nav()));
  if (!S.timer) S.timer = setInterval(poll, 800);
  redraw();
 }
 const last = store.get('display743', null);
 const S = { running: false, step: '', data: last && last.data || null, at: last && last.at || 0, error: '', tests: store.get('display743Tests', {}) || {}, timer: 0 };
 const redraw = () => { if (tab === 'settings') safe(() => render()); };
 const yes = v => v === true ? 'oui' : v === false ? 'non' : String(v == null ? '—' : v);
 const pad = n => String(n).padStart(2, '0');
 const when = t => { const d = new Date(t); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };

 function poll() {
  const n = N(); if (!n) return;
  const st = safe(() => JSON.parse(n.state() || '{}'), {});
  S.running = !!st.running; S.step = st.step || '';
  if (!st.running && st.result) {
   const d = safe(() => JSON.parse(st.result), null);
   if (d) { S.data = d; S.at = Date.now(); S.error = d.erreur ? 'La recherche s’est arrêtée : ' + d.erreur : ''; store.set('display743', { at: S.at, data: d }); }
   else S.error = 'Réponse illisible.';
   clearInterval(S.timer); S.timer = 0;
   if (S.allRunning && !S.error) { S.allRunning = false; pdf(); }
   S.allRunning = false;
  }
  redraw();
 }
 function start() {
  const n = N();
  if (!n) { S.error = 'Recherche impossible ici : il faut la 7.43 installée sur l’autoradio.'; redraw(); return; }
  if (!S.running) { safe(() => n.start()); S.running = true; S.error = ''; S.step = 'Démarrage'; }
  if (!S.timer) S.timer = setInterval(poll, 700);
  redraw();
 }
 function tryOpen(kind) {
  const n = N(), app = testApp(), j = f => safe(() => JSON.parse(f()), null);
  const save = r => { S.tests[kind] = { at: Date.now(), app, ok: !!(r && r.ok), mode: r ? (r.mode || r.erreur || '') : 'indisponible ici', hidden: '', back: '' }; store.set('display743Tests', S.tests); redraw(); };
  if (!n) { save(kind === 'normal' && typeof A !== 'undefined' && A && A.launch ? { ok: !!A.launch(app), mode: 'normal' } : null); return; }
  if (kind === 'normal' || kind === 'plein') { save(j(() => n.launch(app, kind === 'plein'))); return; }
  // Essais 3 et 4 : d'abord Waze (en plein écran derrière, ou poussé hors de l'écran), puis l'appli.
  const first = kind === 'derriere' ? j(() => n.launch(nav(), true)) : j(() => typeof n.launchOffscreen === 'function' ? n.launchOffscreen(nav()) : '{"ok":false,"erreur":"pont trop ancien"}');
  setTimeout(() => { const r = j(() => n.launch(app, true)); save({ ok: !!(first && first.ok && r && r.ok), mode: `Waze : ${first ? first.mode || first.erreur || '' : '?'} · appli : ${r ? r.mode || r.erreur || '' : '?'}` }); }, 900);
 }
 function answer(kind, v, what) {
  if (!S.tests[kind]) S.tests[kind] = { at: Date.now(), ok: false, mode: '' };
  S.tests[kind][what === 'back' ? 'back' : 'hidden'] = v; store.set('display743Tests', S.tests); redraw();
 }

 // Ce que le code de chaque appli système trahit, en clair.
 function findings(d) {
  const out = [];
  if (!d) return out;
  const stock = String(d.lanceur_par_defaut || '').split(' / ')[0];
  for (const s of d.analyse || []) {
   if (!s || !s.paquet) continue;
   const w = s.mots || {}, has = ks => ks.some(k => w[k]), how = [];
   if (has(['ActivityView', 'TaskEmbedder', 'TaskView', 'TaskOrganizer'])) how.push('encastrement');
   if (has(['createVirtualDisplay', 'VirtualDisplay'])) how.push('écran virtuel');
   if (has(['setLaunchBounds', 'WINDOWING_MODE_FREEFORM', 'freeform', 'setLaunchWindowingMode', 'setTaskWindowingMode'])) how.push('fenêtre libre');
   if (has(['moveTaskToBack', 'removeTask', 'resizeTask'])) how.push('range ou ferme des fenêtres');
   out.push({ pkg: s.paquet, how, cmds: (s.commandes || []).length, stock: s.paquet === stock, waze: !!w['com.waze'], skipped: s.saute || s.erreur || '' });
  }
  return out;
 }

 const TESTS = [['normal', 'Essai 1 : ouverture normale'], ['plein', 'Essai 2 : ouverture en plein écran'], ['derriere', 'Essai 3 : Waze en plein écran derrière, puis l’appli'], ['horsecran', 'Essai 4 : Waze poussé hors de l’écran, puis l’appli']];
 function reportLines() {
  const d = S.data, L = ['== Recherche de l’affichage (7.43) =='];
  if (!d) { L.push('Pas encore faite (Réglages → Système → Rechercher l’affichage).'); return L; }
  const P = d.poste || {}, F = d.fenetres || {}, M = d.appli || {}, W = d.waze || {};
  L.push(`Faite le ${when(S.at)} en ${Math.round((d.duree_ms || 0) / 1000)} s`);
  L.push(`Poste : ${P.fabricant || '?'} / ${P.marque || '?'} / ${P.modele || '?'} · Android ${P.android || '?'} (SDK ${P.sdk || '?'}) · ${P.build || ''}`);
  L.push(`Appareil : ${P.appareil || ''} · produit ${P.produit || ''} · carte ${P.carte || ''} · matériel ${P.materiel || ''}`);
  L.push(`Empreinte : ${P.empreinte || ''}`);
  L.push(`Lanceur par défaut : ${d.lanceur_par_defaut || '—'}`);
  L.push(`Lanceurs : ${(d.lanceurs || []).join(' ; ') || '—'}`);
  L.push(`Fenêtres : fenêtre libre ${yes(F.fenetre_libre)}, image dans l’image ${yes(F.image_dans_image)}, écrans secondaires ${yes(F.ecrans_secondaires)}, réglage fenêtre libre ${yes(F.reglage_fenetre_libre)}, forcer le redimensionnement ${yes(F.forcer_redimension)}, options développeur ${yes(F.options_developpeur)}, ActivityView ${yes(F.ActivityView)}, TaskOrganizer ${yes(F.TaskOrganizer)}, superposition ${yes(F.superposition)}`);
  L.push(`Notre appli : système ${yes(M.systeme)}, privilégiée ${yes(M.privilegiee)}, ${M.fichier || ''} · droits : ${(M.droits || []).join(', ') || 'aucun droit spécial'}`);
  L.push(`Écrans : ${(d.ecrans || []).map(e => `${e.id} « ${e.nom} » ${e.taille} (${e.drapeaux})`).join(' ; ') || '—'}`);
  L.push(`Root : ${(d.root || []).join(', ') || 'non trouvé'}`);
  L.push(`Waze : ${W.installee ? `version ${W.version || '?'}, ${W.activite || ''}, encastrable ${yes(W.encastrable)}, redimensionnable ${yes(W.redimensionnable)}` : 'non installé'}`);
  L.push(`Applis liées : ${(d.applis_liees || []).join(', ') || '—'}`);
  L.push('Code lu :');
  for (const s of d.analyse || []) {
   if (!s) continue;
   if (s.saute || s.erreur) { L.push(` - ${s.paquet} : ${s.saute || s.erreur}`); continue; }
   const w = Object.entries(s.mots || {}).map(([k, n]) => `${k}×${n}`).join(', ');
   L.push(` - ${s.paquet} ${s.version || ''} (système ${yes(s.systeme)}, privilégiée ${yes(s.privilegiee)}, ${Math.round((s.octets || 0) / 1048576)} Mo lus)`);
   L.push(`   mots : ${w || 'aucun'}`);
   if ((s.droits || []).length) L.push(`   droits : ${s.droits.join(', ')}`);
   if ((s.commandes || []).length) L.push(`   commandes : ${s.commandes.join(' | ')}`);
   if (!(s.fichiers_lus || []).length) L.push('   aucun fichier de code lisible');
  }
  L.push(`Propriétés : ${(d.proprietes || []).join(' | ') || '—'}`);
  const t = (k, label) => { const r = S.tests[k]; return r ? `${label} (${r.app || '?'}) : ${r.ok ? 'ouvert' : 'échec'} (${r.mode || ''}), Waze caché : ${r.hidden || 'pas répondu'}${k === 'derriere' || k === 'horsecran' ? ', revenu dans le cadre : ' + (r.back || 'pas répondu') : ''}` : `${label} : pas fait`; };
  L.push('Essais :');
  for (const [k, label] of TESTS) L.push(' - ' + t(k, label));
  const auto = (d.essais_auto || []);
  if (auto.length) { L.push('Essais automatiques (ce que l’autoradio a tenté) :'); for (const e of auto) L.push(` - ${e.essai} : ${e.ok ? 'ouvert' : 'échec'}${e.waze ? ' · Waze : ' + e.waze : ''} · appli : ${e.appli || ''}`); }
  L.push(`Tous les paquets : ${(d.tous_paquets || []).join(', ') || '—'}`);
  if (d.erreur) L.push('Erreur : ' + d.erreur);
  return L;
 }

 function send() {
  const text = reportLines().join('\n'), d = new Date();
  const name = `affichage-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.html`;
  const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(name)}</title><pre style="white-space:pre-wrap;font:13px/1.45 monospace;padding:12px">${esc(text)}</pre></html>`;
  const saved = safe(() => Transfer738.saveText(name, 'text/html', html), null);
  if (saved && saved.ok !== false && saved.path) safe(() => Transfer738.showQR(saved.path, 'Recherche de l’affichage'));
  else toast('Enregistrement impossible : fais une photo de l’écran.');
 }

 // PDF enregistré dans Téléchargements/Accueil2008 puis envoyé avec l'appli d'e-mail choisie.
 function pdf() {
  const n = N(), d = new Date();
  if (!n || typeof n.sharePdf !== 'function') { S.pdf = { ok: false, erreur: 'il faut la 7.43 installée sur l’autoradio' }; redraw(); return; }
  const name = `affichage-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.pdf`;
  S.pdf = safe(() => JSON.parse(n.sharePdf(name, 'Accueil 2008 - Recherche de l’affichage', reportLines().join('\n'), mail())), { ok: false, erreur: 'réponse illisible' });
  redraw();
 }

 function page(p) {
  const d = S.data, f = findings(d);
  const row = (t, v) => `<div style="display:flex;gap:10px;font-size:13.5px;line-height:1.4"><span style="min-width:170px;color:${p.mut}">${esc(t)}</span><span style="flex:1;min-width:0;word-break:break-word">${esc(v)}</span></div>`;
  const intro = `<div style="font-size:13.5px;color:${p.mut};line-height:1.5">1. Ouvre Waze dans le cadre.<br>2. Filme l’écran de l’autoradio avec ton téléphone.<br>3. Appuie sur <b>Tout rechercher</b> : l’appli fouille le poste puis fait les 4 essais toute seule (elle ouvre la radio, revient, recommence). Tu n’as rien à toucher — c’est ta vidéo qui montre si Waze s’est caché.<br>4. À la fin, le PDF se crée et ton e-mail s’ouvre déjà rempli. Tu envoies, puis tu m’envoies le PDF et ta vidéo. Page provisoire, retirée une fois la solution trouvée.</div>`;
  const mailRow = `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;font-size:13.5px"><span style="color:${p.mut}">Ton e-mail (gardé seulement sur l’autoradio) :</span><input id="d743mail" type="email" value="${esc(mail())}" placeholder="toi@exemple.com" style="flex:1;min-width:180px;padding:9px 11px;border-radius:9px;border:1px solid ${p.line || '#2b3a4f'};background:${p.card2 || '#0a0f16'};color:inherit"></div>`;
  const allBtn = `<div style="${box(p, 'padding:12px 14px;display:flex;flex-direction:column;gap:10px')}">${mailRow}${chipBtn(p, 'display743:all', S.allRunning ? 'En cours… ' + esc(S.step) : '🔎 Tout rechercher (puis e-mail)', true)}<div style="font-size:12.5px;color:${p.mut}">Filme l’écran pendant que ça tourne.</div></div>`;
  const actions = `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">${chipBtn(p, 'display743:start', S.running ? 'Recherche en cours… ' + S.step : d ? 'Refaire la recherche' : 'Lancer la recherche', true)}${d && !S.running ? chipBtn(p, 'display743:pdf', 'Créer le PDF et l’envoyer par e-mail', false) + chipBtn(p, 'display743:send', 'Envoyer au téléphone (QR)', false) : ''}</div>`;
  const sent = S.pdf ? `<div style="font-size:13.5px;color:${S.pdf.ok ? p.mut : '#e0312b'}">${S.pdf.ok ? 'PDF créé (' + esc(S.pdf.fichier || '') + '). Choisis ton appli d’e-mail, envoie-le-toi, puis envoie-moi le PDF.' : 'PDF impossible : ' + esc(S.pdf.erreur || '') + (S.pdf.fichier ? ' — il est quand même dans ' + esc(S.pdf.fichier) : '') + '. Utilise le QR à la place.'}</div>` : '';
  const err = S.error ? `<div style="color:#e0312b;font-size:13.5px">${esc(S.error)}</div>` : '';
  let found = '';
  if (d && !d.erreur) {
   const P = d.poste || {}, F = d.fenetres || {}, M = d.appli || {}, W = d.waze || {};
   found = `<div style="${box(p, 'padding:12px 14px;display:flex;flex-direction:column;gap:6px')}"><b>Résultat du ${esc(when(S.at))}</b>
    ${row('Poste', `${P.marque || ''} ${P.modele || ''} · Android ${P.android || '?'}`)}
    ${row('Lanceur d’origine', d.lanceur_par_defaut || '—')}
    ${row('Fenêtre libre', yes(F.fenetre_libre) + ' · encastrement possible : ' + yes(F.ActivityView))}
    ${row('Notre appli', `système ${yes(M.systeme)} · ${(M.droits || []).join(', ') || 'aucun droit spécial'}`)}
    ${row('Root', (d.root || []).length ? 'oui' : 'non trouvé')}
    ${row('Waze', W.installee ? `encastrable ${yes(W.encastrable)}` : 'non installé')}
    ${f.map(x => row(x.pkg + (x.stock ? ' (lanceur)' : ''), x.skipped || ((x.how.join(', ') || 'rien de parlant') + (x.cmds ? ` · ${x.cmds} commande(s) du fabricant` : '') + (x.waze ? ' · parle de Waze' : '')))).join('')}
   </div>`;
  }
  const test = (kind, title) => {
   const r = S.tests[kind], two = kind === 'derriere' || kind === 'horsecran';
   const q = (what, label, yes, no) => `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;font-size:13.5px">${label} ${chipBtn(p, `display743:answer:${kind}:oui:${what}`, yes, r[what] === 'oui')}${chipBtn(p, `display743:answer:${kind}:non:${what}`, no, r[what] === 'non')}</div>`;
   return `<div style="${box(p, 'padding:10px 12px;display:flex;flex-direction:column;gap:8px')}"><b>${title}</b><div>${chipBtn(p, 'display743:try:' + kind, 'Lancer l’essai', false)}</div>${r ? `<div style="font-size:13px;color:${p.mut}">${r.ok ? 'Ouvert' : 'Échec'} · ${esc(r.mode || '')}</div>${q('hidden', 'Waze était caché ?', 'Oui, caché', 'Non, toujours visible')}${two ? q('back', 'De retour à l’accueil, Waze est revenu dans le cadre ?', 'Oui', 'Non') : ''}` : ''}</div>`;
  };
  const apps = testApps(), cur = testApp();
  const pick = `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;font-size:13.5px">Appli pour les essais : ${(apps.length ? apps : [{ p: cur, l: cur }]).map(a => chipBtn(p, 'display743:app:' + a.p, a.l || a.p, a.p === cur)).join('')}</div>`;
  const tests = `${pick}<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px">${TESTS.map(([k, l]) => test(k, l)).join('')}</div>`;
  return `<div style="display:flex;flex-direction:column;gap:12px;max-width:1000px">${intro}${allBtn}${sent}${err}${found}<details style="${box(p, 'padding:8px 12px')}"><summary style="cursor:pointer;font-size:13.5px;color:${p.mut}">Le faire à la main (recherche et essais séparés)</summary><div style="margin-top:10px;display:flex;flex-direction:column;gap:12px">${actions}${tests}</div></details></div>`;
 }

 const sys = SETCATS.find(c => c[0] === 'Système');
 if (sys && !sys[1].some(s => s[0] === 'Rechercher l’affichage')) sys[1].push(['Rechercher l’affichage', page]);
 const act0 = window.act;
 window.act = function (a, long) {
  if (a === 'display743:start') { start(); return; }
  if (a === 'display743:send') { send(); return; }
  if (a === 'display743:pdf') { const inp = document.getElementById('d743mail'); if (inp && inp.value) store.set('display743Mail', inp.value.trim()); pdf(); return; }
  if (a === 'display743:all') { runAll(); return; }
  if (a.indexOf('display743:try:') === 0) { tryOpen(a.slice(15)); return; }
  if (a.indexOf('display743:answer:') === 0) { const [kind, v, what] = a.slice(18).split(':'); answer(kind, v, what); return; }
  if (a.indexOf('display743:app:') === 0) { store.set('display743App', a.slice(15)); redraw(); return; }
  return act0.apply(this, arguments);
 };
 window.Display743 = { state: S, poll, start, runAll, findings, reportLines, page, pdf };
})();
