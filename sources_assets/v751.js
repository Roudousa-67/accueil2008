/* 7.51 : « Analyser le lanceur d'origine » (Réglages → Système). Extrait le code de l'appli « Thème » et
   des autres lanceurs du poste (manifeste, code, fiche des composants ; pas les images) dans un .zip
   envoyé par e-mail, pour comprendre comment ils cachent et rouvrent l'appli du petit carré. Lecture
   seule : rien n'est modifié sur l'autoradio. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 const N = () => window.Display743Native || null;
 const S = { list: null, pick: null, res: null, busy: false };
 const mail = () => store.get('display743Mail', '');
 const redraw = () => { if (tab === 'settings') safe(() => render()); };
 function load() {
  const n = N();
  if (!n || typeof n.themeCandidates !== 'function') { S.list = { erreur: 'il faut la 7.51 installée sur l’autoradio' }; return; }
  S.list = safe(() => JSON.parse(n.themeCandidates()), { erreur: 'réponse illisible' });
  if (Array.isArray(S.list) && !S.pick) S.pick = S.list.filter(x => x.theme || x.home).map(x => x.pkg);
 }
 function exportNow() {
  const n = N(), pk = (S.pick || []).join(',');
  if (!n || typeof n.exportCode !== 'function') { S.res = { ok: false, erreur: 'il faut la 7.51 installée sur l’autoradio' }; redraw(); return; }
  if (!pk) { toast('Choisis au moins une appli.'); return; }
  S.busy = true; redraw();
  setTimeout(() => { S.res = safe(() => JSON.parse(n.exportCode(pk, mail())), { ok: false, erreur: 'réponse illisible' }); S.busy = false; redraw(); }, 50);
 }
 function page(p) {
  if (!S.list) load();
  const intro = `<div style="font-size:13.5px;color:${p.mut};line-height:1.5">L’appli copie le code de l’appli « Thème » et des lanceurs du poste (sans les images) dans un fichier .zip, puis ouvre ton e-mail. Envoie-moi le fichier : je regarde comment le lanceur d’origine cache et rouvre l’appli du petit carré. Rien n’est modifié sur l’autoradio.</div>`;
  const mailRow = `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;font-size:13.5px"><span style="color:${p.mut}">Ton e-mail :</span><input id="v751mail" type="email" value="${esc(mail())}" placeholder="toi@exemple.com" style="flex:1;min-width:180px;padding:9px 11px;border-radius:9px;border:1px solid ${p.line || '#2b3a4f'};background:${p.card2 || '#1b2533'};color:${p.txt}"></div>`;
  let list = '';
  if (S.list && S.list.erreur) list = `<div style="color:#e0312b;font-size:13.5px">${esc(S.list.erreur)}</div>`;
  else if (Array.isArray(S.list)) list = S.list.length ? `<div style="display:flex;flex-direction:column;gap:6px">${S.list.map(x => `<div style="display:flex;gap:10px;align-items:center;font-size:13.5px">${chipBtn(p, 'v751:pick:' + x.pkg, S.pick.includes(x.pkg) ? '✓ Choisie' : 'Choisir', S.pick.includes(x.pkg))}<span style="flex:1;min-width:0;word-break:break-word"><b>${esc(x.label)}</b> · ${esc(x.pkg)} ${esc(x.version || '')}<span style="color:${p.mut}"> · ${x.mo} Mo${x.home ? ' · lanceur' : ''}${x.theme ? ' · thème' : ''}</span></span></div>`).join('')}</div>` : `<div style="font-size:13.5px;color:${p.mut}">Aucun lanceur trouvé.</div>`;
  const res = S.res ? `<div style="font-size:13.5px;color:${S.res.ok ? p.mut : '#e0312b'}">${S.res.ok ? `Fichier créé (${esc(S.res.fichier || '')}, ${S.res.mo} Mo). Choisis ton appli d’e-mail, envoie-le-toi, puis envoie-le-moi.` : 'Échec : ' + esc(S.res.erreur || '') + (S.res.fichier ? ' — fichier : ' + esc(S.res.fichier) : '')}${S.res.laisses ? `<div style="margin-top:4px">Laissé de côté : ${esc(S.res.laisses)}</div>` : ''}</div>` : '';
  return `<div style="display:flex;flex-direction:column;gap:12px;max-width:1000px">${intro}<div style="${box(p, 'padding:12px 14px;display:flex;flex-direction:column;gap:10px')}">${mailRow}${list}${chipBtn(p, 'v751:export', S.busy ? 'Extraction en cours…' : '📦 Extraire et envoyer par e-mail', true)}</div>${res}</div>`;
 }
 const sys = SETCATS.find(c => c[0] === 'Système');
 if (sys && !sys[1].some(s => s[0] === 'Analyser le lanceur d’origine')) sys[1].push(['Analyser le lanceur d’origine', page]);
 const act0 = window.act;
 window.act = function (a, long) {
  if (typeof a === 'string' && a.startsWith('v751:')) {
   const inp = document.getElementById('v751mail'); if (inp && inp.value) store.set('display743Mail', inp.value.trim());
   if (a === 'v751:export') { exportNow(); return; }
   if (a.startsWith('v751:pick:')) { const k = a.slice(10); S.pick = S.pick || []; S.pick = S.pick.includes(k) ? S.pick.filter(x => x !== k) : S.pick.concat(k); redraw(); return; }
   return;
  }
  return act0.apply(this, arguments);
 };
 window.V751 = { state: S, page, load, exportNow };
})();
