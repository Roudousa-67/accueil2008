/* 7.58 : musique. Pochette floutée en fond de l'accueil pendant la lecture, égaliseur animé posé sur le widget
   musique (sans prendre de place), logo des radios quand la radio n'envoie pas d'image, mode concert à
   l'arrêt (pochette, titre et égaliseur en grand ; un appui le ferme pour 10 minutes, il disparaît en roulant). */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 const LIST = [['cover758', 'Pochette en grand', 'L’accueil prend les couleurs de la musique en cours (pochette floutée en fond).'], ['eq758', 'Égaliseur animé', 'Des barres qui dansent sur le widget musique pendant la lecture.'], ['radio758', 'Logos des radios', 'Le logo de la station quand la radio ne fournit pas d’image.'], ['concert758', 'Mode concert à l’arrêt', 'Après 30 s à l’arrêt avec de la musique : pochette, titre et égaliseur en grand.']];
 if (window.Try750) LIST.forEach(([id, l, d]) => Try750.register(id, l, d, '7.58'));
 const on = id => !window.Try750 || Try750.on(id);
 const isRadio = m => m && /radio|fmradio|dab|qf\.radio/i.test(String(m.pkg || '') + ' ' + String(m.app || ''));
 const logos = store.get('radioLogos758', {}) || {};
 const logoBusy = new Set();
 async function radioLogo(name) {
  const k = String(name || '').trim().toLowerCase(); if (!k || k.length < 3 || logoBusy.has(k) || k in logos) return;
  logoBusy.add(k);
  try { const j = await getJSON('https://de1.api.radio-browser.info/json/stations/byname/' + encodeURIComponent(k) + '?limit=5&hidebroken=true&order=votes&reverse=true'); const s = (Array.isArray(j) ? j : []).find(x => x && /^https:\/\//.test(x.favicon || '')); logos[k] = s ? s.favicon : ''; store.set('radioLogos758', logos); }
  catch (e) { /* réessai plus tard */ } finally { logoBusy.delete(k); }
 }
 const EQW = '<span class="eq758" aria-hidden="true">' + '<i></i>'.repeat(7) + '</span>';
 const p0 = window.paint;
 window.paint = function () {
  const out = p0.apply(this, arguments);
  safe(() => {
   const m = typeof media !== 'undefined' ? media : null;
   if (m && on('radio758') && isRadio(m) && !m.art) { const name = m.title || m.artist || m.album; radioLogo(name); const u = logos[String(name || '').trim().toLowerCase()]; if (u) document.querySelectorAll('#screen [data-img="mArt"]').forEach(e => { if (e.getAttribute('src') !== u) e.src = u; e.style.display = 'block'; e.style.objectFit = 'contain'; e.style.background = '#fff'; }); }
   // Égaliseur posé par-dessus le widget (position absolue) : il ne pousse rien (erreur de la 7.51 corrigée).
   if (on('eq758')) document.querySelectorAll('#screen [data-k="mArtist"]').forEach(e => { const par = e.parentElement; if (!par || par.querySelector(':scope > .eq758')) return; if (getComputedStyle(par).position === 'static') par.style.position = 'relative'; par.insertAdjacentHTML('beforeend', EQW); });
   else document.querySelectorAll('#screen .eq758').forEach(e => e.remove());
   const playing = !!(m && m.playing);
   document.querySelectorAll('#screen .eq758').forEach(e => e.classList.toggle('on758', playing));
   coverBg(m);
   concert(m);
  });
  return out;
 };
 const css = document.createElement('style');
 css.textContent = `.eq758{position:absolute;right:6px;top:2px;display:inline-flex;gap:3px;align-items:flex-end;height:14px;pointer-events:none;opacity:.85}.eq758 i{display:block;width:3px;height:3px;border-radius:2px;background:var(--mediaAccent730,#e0312b)}.eq758.on758 i{animation:eq758 .9s ease-in-out infinite alternate}.eq758 i:nth-child(2){animation-delay:-.3s!important}.eq758 i:nth-child(3){animation-delay:-.6s!important}.eq758 i:nth-child(4){animation-delay:-.15s!important}.eq758 i:nth-child(5){animation-delay:-.45s!important}.eq758 i:nth-child(6){animation-delay:-.75s!important}.eq758 i:nth-child(7){animation-delay:-.2s!important}@keyframes eq758{0%{height:3px}50%{height:9px}100%{height:14px}}#concert758{position:absolute;inset:0;z-index:5500;display:flex;align-items:center;justify-content:center;gap:48px;color:#fff;overflow:hidden}#concert758 .bg{position:absolute;inset:-40px;background-size:cover;background-position:center;filter:blur(40px) brightness(.4);z-index:-1}#concert758 .eqc{display:inline-flex;gap:8px;align-items:flex-end;height:60px}#concert758 .eqc i{display:block;width:14px;height:8px;border-radius:4px;background:#fff;animation:eqc758 .9s ease-in-out infinite alternate}#concert758 .eqc i:nth-child(2n){animation-delay:-.4s}#concert758 .eqc i:nth-child(3n){animation-delay:-.7s}@keyframes eqc758{0%{height:8px}50%{height:36px}100%{height:60px}}`;
 document.head.appendChild(css);
 // Pochette en fond : l'accueil prend les couleurs du disque en cours.
 let coverEl = null;
 function coverBg(m) {
  const want = on('cover758') && store.get('coverBg758', false) === true && tab === 'home' && m && m.playing && m.art;
  const st = safe(() => $('stage'), null); if (!st) return;
  if (!want) { if (coverEl) { coverEl.remove(); coverEl = null; } return; }
  // Cadre à la taille exacte de l'écran (rien ne déborde) ; l'image floutée, plus grande, est rognée dedans.
  if (!coverEl || !coverEl.isConnected) { coverEl = document.createElement('div'); coverEl.id = 'cover758'; coverEl.style.cssText = 'position:absolute;inset:0;z-index:-1;pointer-events:none;overflow:hidden'; coverEl.innerHTML = '<div style="position:absolute;inset:-60px;background-size:cover;background-position:center;filter:blur(38px) brightness(.42) saturate(1.3)"></div>'; st.insertBefore(coverEl, st.firstChild); }
  const img = coverEl.firstChild, u = 'url("' + String(m.art).replace(/"/g, '%22') + '")'; if (img.style.backgroundImage !== u) img.style.backgroundImage = u;
 }
 // Mode concert : à l'arrêt depuis 30 s, musique en cours, sur l'accueil.
 const DELAY0 = 120000, DELAYS = [[30000, '30 s'], [60000, '1 min'], [120000, '2 min'], [300000, '5 min'], [600000, '10 min']];
 const delayNow = () => { const v = Number(store.get('concertDelay762', DELAY0)); return DELAYS.some(d => d[0] === v) ? v : DELAY0; };   // 7.62 : réglable (2 min par défaut)
 let still = 0, concertEl = null, concertOff = 0;
 function concert(m) {
  const v = safe(() => curSpeed().v, 0) || 0, now = Date.now();
  if (v > 3) still = 0; else if (!still) still = now;
  const want = on('concert758') && store.get('concert758', true) !== false && tab === 'home' && m && m.playing && still && now - still > delayNow() && now > concertOff;
  if (!want) { if (concertEl) { concertEl.remove(); concertEl = null; } return; }
  const st = safe(() => $('stage'), null); if (!st) return;
  if (!concertEl || !concertEl.isConnected) { concertEl = document.createElement('div'); concertEl.id = 'concert758'; concertEl.setAttribute('data-act', 'mu758:off'); st.appendChild(concertEl); }
  const sig = [m.title, m.artist, m.art ? m.art.length : 0].join('|');
  if (concertEl.dataset.sig !== sig) {
   concertEl.dataset.sig = sig;
   concertEl.innerHTML = `<div class="bg" style="background-image:${m.art ? 'url(&quot;' + esc(m.art) + '&quot;)' : 'none'};background-color:#111"></div><div style="width:380px;height:380px;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px #000a;background:#222;display:flex;align-items:center;justify-content:center;font-size:120px">${m.art ? `<img src="${esc(m.art)}" alt="" style="width:100%;height:100%;object-fit:cover">` : '🎵'}</div><div style="max-width:560px"><div style="font-size:46px;font-weight:800;line-height:1.1">${esc(m.title || '')}</div><div style="font-size:26px;opacity:.8;margin:12px 0 24px">${esc(m.artist || '')}</div><span class="eqc">${'<i></i>'.repeat(9)}</span><div style="font-size:14px;opacity:.6;margin-top:22px">Touche l’écran pour revenir · disparaît en roulant</div></div>`;
  }
 }
 setInterval(() => safe(() => { if (concertEl || (still && Date.now() - still > delayNow())) concert(typeof media !== 'undefined' ? media : null); else { const v = safe(() => curSpeed().v, 0) || 0; if (v > 3) still = 0; else if (!still) still = Date.now(); } }), 1000);
 // Réglages : avec Multimédia.
 const mcat = SETCATS.find(c => /multim|média|musique/i.test(c[0])) || SETCATS.find(c => c[1].some(x => /multim/i.test(x[0])));
 const yn = (p, k, d = true) => chipBtn(p, 'mu758:set:' + k + ':1', 'Oui', store.get(k, d) === true || (d && store.get(k, d) !== false)) + chipBtn(p, 'mu758:set:' + k + ':0', 'Non', store.get(k, d) === false);
 if (mcat && !mcat[1].some(s => s[0] === 'Pochette et mode concert')) mcat[1].push(['Pochette et mode concert', p => setRow(p, 'Pochette en fond de l’accueil', 'Pendant la lecture, la pochette floutée remplace le fond.', yn(p, 'coverBg758', false)) + setRow(p, 'Mode concert à l’arrêt', 'À l’arrêt avec de la musique : pochette, titre et égaliseur en grand. Un appui le ferme pour 10 minutes.', yn(p, 'concert758')) + setRow(p, 'Mode concert : au bout de', 'Temps à l’arrêt avant qu’il s’affiche (un feu rouge dure souvent moins d’1 min).', DELAYS.map(([ms, l]) => chipBtn(p, 'mu762:delay:' + ms, l, delayNow() === ms)).join(''))]);
 const act0 = window.act;
 window.act = function (a) {
  if (typeof a === 'string' && a.startsWith('mu762:delay:')) { store.set('concertDelay762', Number(a.slice(12))); render(); return; }
  if (a === 'mu758:off') { concertOff = Date.now() + 10 * 60000; if (concertEl) { concertEl.remove(); concertEl = null; } return; }
  if (typeof a === 'string' && a.startsWith('mu758:set:')) { const [, , k, v] = a.split(':'); store.set(k, v === '1'); render(); return; }
  return act0.apply(this, arguments);
 };
 window.Music758 = { concert, coverBg, radioLogo, logos, isRadio };
})();
