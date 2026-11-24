/* 7.43 : « Rechercher l'affichage » (Réglages → Système). Fouille l'autoradio pour savoir comment le
   lanceur d'origine affiche Waze dans un petit cadre (encastrement, écran virtuel, fenêtre libre,
   commande du fabricant) et ce que notre appli a le droit d'utiliser ; essais pour cacher Waze quand
   une autre appli s'ouvre. Lecture seule : rien n'est modifié sur le poste. Le résultat part au
   téléphone par QR et s'ajoute au rapport de diagnostic. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 const N = () => window.Display743Native || null;
 const TEST_APP = 'com.android.settings';
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
  const n = N(); let r = null;
  if (n) r = safe(() => JSON.parse(n.launch(TEST_APP, kind === 'plein')), null);
  else if (kind === 'normal' && typeof A !== 'undefined' && A && A.launch) r = { ok: !!A.launch(TEST_APP), mode: 'normal' };
  S.tests[kind] = { at: Date.now(), ok: !!(r && r.ok), mode: r ? (r.mode || r.erreur || '') : 'indisponible ici', hidden: '' };
  store.set('display743Tests', S.tests); redraw();
 }
 function answer(kind, v) {
  if (!S.tests[kind]) S.tests[kind] = { at: Date.now(), ok: false, mode: '' };
  S.tests[kind].hidden = v; store.set('display743Tests', S.tests); redraw();
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
  const t = (k, label) => { const r = S.tests[k]; return r ? `${label} : ${r.ok ? 'ouvert' : 'échec'} (${r.mode || ''}), Waze caché : ${r.hidden || 'pas répondu'}` : `${label} : pas fait`; };
  L.push('Essais : ' + t('normal', 'ouverture normale') + ' ; ' + t('plein', 'ouverture en plein écran'));
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

 function page(p) {
  const d = S.data, f = findings(d);
  const row = (t, v) => `<div style="display:flex;gap:10px;font-size:13.5px;line-height:1.4"><span style="min-width:170px;color:${p.mut}">${esc(t)}</span><span style="flex:1;min-width:0;word-break:break-word">${esc(v)}</span></div>`;
  const intro = `<div style="font-size:13.5px;color:${p.mut};line-height:1.5">1. Ouvre Waze dans le cadre de l’accueil, comme d’habitude.<br>2. Lance la recherche (30 à 60 secondes) : modèle, droits, écrans et code du lanceur d’origine. Rien n’est modifié sur le poste.<br>3. Fais les deux essais : les Réglages Android s’ouvrent ; regarde si Waze reste visible par-dessus, reviens ici et réponds.<br>4. Envoie-moi le résultat par QR. Il est aussi ajouté au Rapport de diagnostic.</div>`;
  const actions = `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">${chipBtn(p, 'display743:start', S.running ? 'Recherche en cours… ' + S.step : d ? 'Refaire la recherche' : 'Lancer la recherche', true)}${d && !S.running ? chipBtn(p, 'display743:send', 'Envoyer au téléphone (QR)', false) : ''}</div>`;
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
   const r = S.tests[kind];
   return `<div style="${box(p, 'padding:10px 12px;display:flex;flex-direction:column;gap:8px')}"><b>${title}</b><div>${chipBtn(p, 'display743:try:' + kind, 'Ouvrir les Réglages Android', false)}</div>${r ? `<div style="font-size:13px;color:${p.mut}">${r.ok ? 'Ouvert' : 'Échec'} · ${esc(r.mode || '')}</div><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;font-size:13.5px">Waze était caché ? ${chipBtn(p, 'display743:answer:' + kind + ':oui', 'Oui, caché', r.hidden === 'oui')}${chipBtn(p, 'display743:answer:' + kind + ':non', 'Non, toujours visible', r.hidden === 'non')}</div>` : ''}</div>`;
  };
  const tests = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px">${test('normal', 'Essai 1 : ouverture normale')}${test('plein', 'Essai 2 : ouverture en plein écran')}</div>`;
  return `<div style="display:flex;flex-direction:column;gap:12px;max-width:1000px">${intro}${actions}${err}${found}${tests}</div>`;
 }

 const sys = SETCATS.find(c => c[0] === 'Système');
 if (sys && !sys[1].some(s => s[0] === 'Rechercher l’affichage')) sys[1].push(['Rechercher l’affichage', page]);
 const act0 = window.act;
 window.act = function (a, long) {
  if (a === 'display743:start') { start(); return; }
  if (a === 'display743:send') { send(); return; }
  if (a.indexOf('display743:try:') === 0) { tryOpen(a.slice(15)); return; }
  if (a.indexOf('display743:answer:') === 0) { const [kind, v] = a.slice(18).split(':'); answer(kind, v); return; }
  return act0.apply(this, arguments);
 };
 window.Display743 = { state: S, poll, start, findings, reportLines, page };
})();
