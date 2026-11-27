/* 7.60 : photo de chaque conducteur. Ajoutée depuis la bienvenue (📷 sur la carte du profil) ou Réglages ›
   Système › Profils ; elle remplace la lettre en haut de l'accueil et sur les cartes de profil. La photo reste
   sur l'autoradio (réduite à 256 px). */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 const KEY = i => 'photo760_' + i;
 const get = i => safe(() => localStorage.getItem('a08ph_' + i), '') || '';
 const set = (i, v) => safe(() => { if (v) localStorage.setItem('a08ph_' + i, v); else localStorage.removeItem('a08ph_' + i); });
 function resize(file) { return new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const s = 256, cv = document.createElement('canvas'); cv.width = cv.height = s; const g = cv.getContext('2d'), k = Math.max(s / im.width, s / im.height), w = im.width * k, h = im.height * k; g.drawImage(im, (s - w) / 2, (s - h) / 2, w, h); ok(cv.toDataURL('image/jpeg', .82)); }; im.onerror = ko; im.src = r.result; }; r.onerror = ko; r.readAsDataURL(file); }); }
 async function fromInput(input) {
  const i = +input.dataset.photo760, f = input.files && input.files[0]; if (!f || !Number.isFinite(i)) return;
  try { set(i, await resize(f)); safe(() => toast('Photo enregistrée.')); } catch (e) { safe(() => toast('Photo illisible.')); }
  safe(() => render()); safe(() => window.Tour760 && document.getElementById('tour760') && Tour760.welcome('none'));
 }
 document.addEventListener('change', e => { const t = e.target; if (t && t.dataset && t.dataset.photo760 != null) fromInput(t); });
 // En haut de l'accueil : la photo à la place de la lettre.
 function avatar() {
  const src = get(safe(() => profIdx(), 0));
  document.querySelectorAll('#screen [data-k="avatar"]').forEach(e => {
   if (src) { if (e.dataset.ph760 !== src.length + '') { e.dataset.ph760 = src.length + ''; e.style.backgroundImage = `url("${src}")`; e.style.backgroundSize = 'cover'; e.style.backgroundPosition = 'center'; e.style.color = 'transparent'; } }
   else if (e.dataset.ph760) { delete e.dataset.ph760; e.style.backgroundImage = ''; e.style.color = ''; }
  });
 }
 const p0 = window.paint; window.paint = function () { const o = p0.apply(this, arguments); safe(avatar); return o; };
 const r0 = window.render; window.render = function () { const o = r0.apply(this, arguments); safe(avatar); return o; };
 // Réglages › Système › Profils : les photos.
 function photos(p) {
  const names = safe(() => profiles(), []);
  return `<div style="${box(p, 'padding:12px 14px;margin-bottom:12px')}"><b style="font-size:16px">Photos des conducteurs</b><div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:10px">${names.map((n, i) => { const src = get(i); return `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;width:120px"><div style="width:84px;height:84px;border-radius:50%;background:${src ? `url('${src}') center/cover` : p.card2};display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:900">${src ? '' : esc((n || '?')[0].toUpperCase())}</div><b>${esc(n)}</b><label style="padding:6px 10px;border-radius:8px;background:${p.acc};color:${p.onAcc || '#fff'};font-weight:700;font-size:13px;cursor:pointer">📷 ${src ? 'Changer' : 'Ajouter'}<input type="file" accept="image/*" data-photo760="${i}" style="display:none"></label>${src ? chipBtn(p, 'ph760:del:' + i, 'Retirer') : ''}</div>`; }).join('')}</div></div>`;
 }
 const sys = SETCATS.find(c => c[1].some(s => s[0] === 'Profils'));
 if (sys) { const i = sys[1].findIndex(s => s[0] === 'Profils'), f0 = sys[1][i][1]; sys[1][i] = ['Profils', p => photos(p) + f0(p)]; }
 const act0 = window.act;
 window.act = function (a) { if (typeof a === 'string' && a.startsWith('ph760:del:')) { set(+a.slice(10), ''); render(); return; } return act0.apply(this, arguments); };
 window.Photo760 = { get, set, resize, avatar };
})();
