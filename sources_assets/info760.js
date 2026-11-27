/* 7.60 : aperçus dans les « ⓘ » des réglages. À l'ouverture d'un ⓘ, pour chaque choix du réglage (Oui / Non,
   Activé / Désactivé, Petit / Moyen / Grand…), l'appli l'essaie, prend une image de l'accueil, puis remet le
   réglage comme il était. Les images apparaissent côte à côte, avec un bouton pour essayer pour de vrai.
   Automatique : toute nouvelle option a son aperçu sans rien ajouter. Si le réglage ne change rien de visible
   sur l'accueil, l'aide le dit. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 if (window.Try750) Try750.register('info760', 'Aperçus dans les ⓘ', 'Chaque ⓘ des réglages montre l’accueil avec chaque choix (activé, désactivé…).', '7.60');
 const on = () => !window.Try750 || Try750.on('info760');
 if (!window.Help723) return;
 const H = Help723;
 const strip = h => String(h || '').replace(/ src="[^"]*"/g, '').replace(/\s+/g, ' ');
 function build(item) {
  const acts = (item.acts || []).slice(0, 4), cur = acts.find(a => a.on);
  if (!on() || acts.length < 2 || !cur || !window.Snap760) return;
  const keep = { tab, setCat, setSub }, toast0 = window.toast, out = [];
  try {
   window.toast = () => {};
   for (const a of acts) {
    safe(() => window.act(a.act));
    if (tab !== keep.tab || setCat !== keep.setCat || setSub !== keep.setSub) { tab = keep.tab; setCat = keep.setCat; setSub = keep.setSub; out.length = 0; break; }
    out.push({ label: a.label, act: a.act, html: Snap760.home(.24) });
   }
  } finally { safe(() => window.act(cur.act)); window.toast = toast0; tab = keep.tab; setCat = keep.setCat; setSub = keep.setSub; }
  if (!out.length) { item.previews = []; item.noVisual = true; }
  else { item.previews = out; item.noVisual = out.every(o => strip(o.html) === strip(out[0].html)); }
  item.curLabel = cur.label;
 }
 const open0 = H.open.bind(H);
 H.open = function (key) {
  const r = open0(key);
  const it = H.current;
  if (it && it.acts && !it.previews && on()) setTimeout(() => { if (H.current !== it) return; build(it); if (H.current === it) safe(() => render()); }, 30);
  return r;
 };
 const markup0 = H.markup.bind(H);
 H.markup = function (p) {
  const html = markup0(p), it = H.current;
  if (!html || !it || !on()) return html;
  let block = '';
  if (it.acts && it.acts.length >= 2 && !it.previews) block = `<div style="margin:10px 0;color:${p.mut};font-size:14px">Préparation de l’aperçu…</div>`;
  else if (it.previews && it.previews.length && !it.noVisual) block = `<div style="margin:12px 0"><div style="font-size:15px;font-weight:700;margin-bottom:8px">Ce que ça donne sur l’accueil</div><div style="display:flex;gap:12px;flex-wrap:wrap">${it.previews.map(o => `<div style="display:flex;flex-direction:column;gap:6px"><div style="display:flex;align-items:center;gap:6px"><span style="width:12px;height:12px;border-radius:50%;background:${o.label === it.curLabel ? '#2f9e44' : '#6b7685'}"></span><b style="font-size:15px">${esc(o.label)}</b>${o.label === it.curLabel ? `<span style="font-size:12px;color:${p.mut}">(actuel)</span>` : ''}</div>${o.html}<button data-act="${esc(o.act)}" style="height:40px;border-radius:10px;font-weight:700;${o.label === it.curLabel ? `background:${p.acc};color:${p.onAcc || '#fff'}` : `background:${p.card2};color:${p.txt}`}">Essayer « ${esc(o.label)} »</button></div>`).join('')}</div></div>`;
  else if (it.previews) block = `<div style="margin:10px 0;padding:10px 12px;border-radius:10px;background:${p.card2};font-size:14px">Ce réglage ne change rien de visible sur l’accueil : il agit ${esc(it.section ? 'dans « ' + it.section + ' »' : 'ailleurs')} (alertes, trajets, envoi…).</div>`;
  const i = html.indexOf('</p>');
  return i > 0 ? html.slice(0, i + 4) + block + html.slice(i + 4) : html + block;
 };
 // Un vrai choix fait depuis l'aide : l'aperçu se refait.
 const act0 = window.act;
 window.act = function (a) {
  const r = act0.apply(this, arguments);
  const it = H.current;
  if (it && it.acts && it.acts.some(x => x.act === a) && !window.__info760busy) { it.acts.forEach(x => { x.on = x.act === a; }); it.curLabel = (it.acts.find(x => x.on) || {}).label; }
  return r;
 };
 window.Info760 = { build };
})();
