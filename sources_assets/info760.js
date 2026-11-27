/* 7.60, refait en 7.63 : images « Activé / Désactivé » dans chaque « ⓘ » des réglages.
   - Interrupteur (un seul bouton) : l'appli prend une image de l'accueil, bascule le réglage, reprend une image,
     puis le remet comme avant. Choix multiples (Oui / Non, Petit / Grand…) : une image par choix (4 au plus).
   - Seuls les boutons de choix sont essayés (jamais un bouton d'action comme « Effacer » ou « Envoyer »).
   - Si l'accueil ne change pas (le réglage agit ailleurs : trajets, alertes…), l'aide montre quand même deux
     images : l'interrupteur activé et désactivé, avec ce que ça fait.
   Automatique : toute nouvelle option a ses images sans rien ajouter. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 if (window.Try750) Try750.register('info760', 'Images dans les ⓘ', 'Chaque ⓘ des réglages montre le réglage activé et désactivé, en images.', '7.60');
 const on = () => !window.Try750 || Try750.on('info760');
 if (!window.Help723) return;
 const H = Help723;
 const strip = h => String(h || '').replace(/ src="[^"]*"/g, '').replace(/\s+/g, ' ');
 const prefix = a => String(a).replace(/[^:]*$/, '');
 const OFF = /^(non|désactivée?|desactivee?|off|aucun|jamais|coupée?|cachée?|masquée?|détection désactivée)$/i, ONL = /^(oui|activée?|active|on|affichée?|visible|détection activée)$/i;
 // Les choix à essayer : un interrupteur, ou les boutons d'un même groupe que le choix actuel.
 function choices(item) {
  const acts = item.acts || [], cur = acts.find(a => a.on);
  const tog = acts.filter(a => a.tog);
  if (acts.length === 1 && tog.length === 1) { const a = tog[0]; return { kind: 'tog', list: [{ act: a.act, label: 'Activé', on: !!a.on }, { act: a.act, label: 'Désactivé', on: !a.on }] }; }
  // Interrupteur écrit en texte : un seul bouton « Activé » / « Désactivé » (ou Oui / Non).
  if (acts.length === 1 && (ONL.test(acts[0].label) || OFF.test(acts[0].label))) { const a = acts[0], isOn = ONL.test(a.label); return { kind: 'tog', list: [{ act: a.act, label: 'Activé', on: isOn }, { act: a.act, label: 'Désactivé', on: !isOn }] }; }
  if (!cur) return null;
  const same = acts.filter(a => !a.tog && prefix(a.act) === prefix(cur.act)).slice(0, 4);
  return same.length >= 2 ? { kind: 'multi', list: same.map(a => ({ act: a.act, label: a.label || '?', on: !!a.on })) } : null;
 }
 function build(item) {
  const C = choices(item); item.kind = C && C.kind;
  if (!C || !on()) { item.previews = []; return; }
  const keep = { tab, setCat, setSub }, toast0 = window.toast, out = [];
  const back = () => { tab = keep.tab; setCat = keep.setCat; setSub = keep.setSub; };
  const shot = () => safe(() => window.Snap760 ? Snap760.home(.24) : '', '');
  const moved = () => tab !== keep.tab || setCat !== keep.setCat || setSub !== keep.setSub;
  try {
   window.toast = () => {}; window.__info760busy = true;
   if (C.kind === 'tog') {
    const a = C.list[0].act, first = shot();
    safe(() => window.act(a)); if (moved()) back();
    const second = shot();
    safe(() => window.act(a)); if (moved()) back();   // remis comme avant
    const curOn = C.list[0].on;
    out.push({ label: 'Activé', act: a, html: curOn ? first : second, on: curOn }, { label: 'Désactivé', act: a, html: curOn ? second : first, on: !curOn });
   } else {
    const cur = C.list.find(x => x.on);
    for (const x of C.list) { safe(() => window.act(x.act)); if (moved()) { back(); out.length = 0; break; } out.push({ label: x.label, act: x.act, html: shot(), on: x.on }); }
    if (cur) safe(() => window.act(cur.act));
    back();
   }
  } finally { window.toast = toast0; window.__info760busy = false; back(); }
  item.previews = out;
  item.noVisual = !out.length || out.some(o => !o.html) || out.every(o => strip(o.html) === strip(out[0].html));
  item.curLabel = (out.find(o => o.on) || {}).label || '';
 }
 // Image dessinée quand l'accueil ne change pas : l'interrupteur dans l'état, et ce que ça veut dire.
 function card(p, item, o) {
  const off = OFF.test(o.label) || (item.kind === 'tog' && o.label === 'Désactivé'), onS = ONL.test(o.label) || (item.kind === 'tog' && o.label === 'Activé');
  const sw = item.kind === 'tog' || off || onS
   ? `<span style="width:64px;height:36px;border-radius:18px;background:${off ? '#59606b' : '#2f9e44'};position:relative;display:inline-block;flex:none"><span style="position:absolute;top:4px;${off ? 'left:4px' : 'right:4px'};width:28px;height:28px;border-radius:50%;background:#fff"></span></span>`
   : `<span style="min-width:64px;height:36px;padding:0 12px;border-radius:10px;background:${p.acc};color:${p.onAcc || '#fff'};font-weight:800;display:inline-flex;align-items:center;justify-content:center">${esc(o.label)}</span>`;
  const txt = off ? 'Coupé : ' + (item.name || 'ce réglage') + ' ne s’affiche plus et ne fait rien.' : onS ? (item.desc || item.name || '') : 'Choix « ' + o.label + ' » : ' + (item.desc || '');
  return `<div style="width:307px;height:173px;border-radius:10px;overflow:hidden;position:relative;background:linear-gradient(160deg,${off ? '#2a2f38,#1a1d24' : '#16307e,#3159c6'});box-shadow:0 0 0 2px #ffffff33;display:flex;flex-direction:column;justify-content:center;gap:12px;padding:16px;color:#fff;flex:none">
   <div style="display:flex;align-items:center;gap:12px">${sw}<b style="font-size:16px;line-height:1.2">${esc(item.name || '')}</b></div>
   <div style="font-size:13px;line-height:1.35;opacity:${off ? .7 : .92};display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden">${esc(txt)}</div></div>`;
 }
 const open0 = H.open.bind(H);
 H.open = function (key) {
  const r = open0(key);
  const it = H.current;
  if (it && it.acts && !it.previews && on()) setTimeout(() => { if (H.current !== it) return; safe(() => build(it)); if (!it.previews) it.previews = []; if (H.current === it) safe(() => render()); }, 30);
  return r;
 };
 const markup0 = H.markup.bind(H);
 H.markup = function (p) {
  const html = markup0(p), it = H.current;
  if (!html || !it || !on() || !it.acts) return html;
  let block = '';
  if (!it.previews) block = `<div style="margin:10px 0;color:${p.mut};font-size:14px">Préparation des images…</div>`;
  else if (it.previews.length) {
   const real = !it.noVisual;
   block = `<div style="margin:12px 0"><div style="font-size:15px;font-weight:700;margin-bottom:8px">${real ? 'Ce que ça donne sur l’accueil' : 'Activé ou désactivé'}</div><div style="display:flex;gap:12px;flex-wrap:wrap">${it.previews.map(o => `<div style="display:flex;flex-direction:column;gap:6px"><div style="display:flex;align-items:center;gap:6px"><span style="width:12px;height:12px;border-radius:50%;background:${o.label === it.curLabel ? '#2f9e44' : '#6b7685'}"></span><b style="font-size:15px">${esc(o.label)}</b>${o.label === it.curLabel ? `<span style="font-size:12px;color:${p.mut}">(actuel)</span>` : ''}</div>${real ? o.html : card(p, it, o)}${o.label === it.curLabel ? `<div style="height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:700;background:${p.acc};color:${p.onAcc || '#fff'}">C’est le réglage actuel</div>` : `<button data-act="${esc(o.act)}" style="height:40px;border-radius:10px;font-weight:700;background:${p.card2};color:${p.txt}">Mettre « ${esc(o.label)} »</button>`}</div>`).join('')}</div>${real ? '' : `<div style="font-size:12.5px;color:${p.mut};margin-top:6px">Ce réglage ne change rien sur l’accueil : il agit ${esc(it.section ? 'dans « ' + it.section + ' »' : 'ailleurs')}.</div>`}</div>`;
  }
  const i = html.indexOf('</p>');
  return i > 0 ? html.slice(0, i + 4) + block + html.slice(i + 4) : html + block;
 };
 // Un vrai choix fait depuis l'aide : les images se refont.
 const act0 = window.act;
 window.act = function (a) {
  const r = act0.apply(this, arguments);
  const it = H.current;
  if (it && it.acts && !window.__info760busy && it.acts.some(x => x.act === a)) { it.previews = null; it.acts.forEach(x => { if (x.tog) x.on = !x.on; else if (it.acts.length === 1 && (ONL.test(x.label) || OFF.test(x.label))) x.label = ONL.test(x.label) ? 'Désactivé' : 'Activé'; else x.on = x.act === a; }); setTimeout(() => { if (H.current !== it) return; safe(() => build(it)); if (!it.previews) it.previews = []; safe(() => render()); }, 30); }
  return r;
 };
 window.Info760 = { build, choices };
})();
