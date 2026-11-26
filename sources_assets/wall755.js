/* 7.55 : fonds d'espace animés (18), « Ciel réel » (soleil, lune et étoiles à leur vraie place), « Fond qui suit
   la journée » et Voie lactée dans le décor de la route la nuit. Animation lente (8 images/s) seulement sur
   l'Accueil, coupée en arrière-plan ; réglage « Fixe » pour ne rien animer. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 function rng(seed){ let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
 function stars(c, w, h, n, r, t, tw){ for (let i = 0; i < n; i++) { const x = r() * w, y = r() * h, z = r(), a = 0.35 + 0.65 * z * (tw ? 0.75 + 0.25 * Math.sin(t / 700 + i) : 1); c.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`; const s = z > 0.97 ? 1.8 : z > 0.8 ? 1.1 : 0.6; c.fillRect(x, y, s, s); } }
 function blob(c, x, y, rad, col){ const g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill(); }
 function draw(k, c, w, h, t){
   const r = rng(77 + k * 131);
   c.globalCompositeOperation = 'source-over';
   if (k === 0) { c.fillStyle = '#05040e'; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'lighter';
     const d = Math.sin(t / 5000) * 0.03;
     blob(c, w * (0.38 + d), h * 0.45, w * 0.32, 'rgba(155,60,190,.55)'); blob(c, w * 0.58, h * (0.55 - d), w * 0.28, 'rgba(40,150,190,.45)'); blob(c, w * 0.5, h * 0.4, w * 0.15, 'rgba(255,170,120,.35)'); blob(c, w * 0.7, h * 0.3, w * 0.18, 'rgba(230,60,120,.30)');
     c.globalCompositeOperation = 'source-over'; stars(c, w, h, 420, r, t, true); }
   if (k === 1) { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#020812'); g.addColorStop(1, '#0a1a24'); c.fillStyle = g; c.fillRect(0, 0, w, h); stars(c, w, h * 0.7, 260, r, t, true); c.globalCompositeOperation = 'lighter';
     for (let b = 0; b < 4; b++) { c.beginPath(); for (let x = 0; x <= w; x += 6) { const y = h * (0.28 + b * 0.05) + Math.sin(x / (90 + b * 30) + t / (1800 + b * 400) + b) * h * 0.06; x ? c.lineTo(x, y) : c.moveTo(x, y); }
       c.lineTo(w, h * 0.75); c.lineTo(0, h * 0.75); c.closePath(); const a = c.createLinearGradient(0, h * 0.2, 0, h * 0.75); a.addColorStop(0, b % 2 ? 'rgba(120,255,190,.14)' : 'rgba(80,255,160,.18)'); a.addColorStop(1, 'rgba(60,120,255,0)'); c.fillStyle = a; c.fill(); }
     c.globalCompositeOperation = 'source-over'; c.fillStyle = '#03070b'; c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= w; x += 10) c.lineTo(x, h * 0.78 - Math.abs(Math.sin(x / 120)) * h * 0.08 - Math.sin(x / 47) * h * 0.015); c.lineTo(w, h); c.fill(); }
   if (k === 2) { c.fillStyle = '#04060f'; c.fillRect(0, 0, w, h); c.save(); c.translate(w * 0.5, h * 0.45); c.rotate(-0.55); c.globalCompositeOperation = 'lighter';
     for (let i = 0; i < 9; i++) blob(c, (i - 4) * w * 0.09, (r() - 0.5) * h * 0.06, w * 0.12, 'rgba(190,170,255,.10)'); blob(c, 0, 0, w * 0.16, 'rgba(255,220,180,.16)'); c.restore(); c.globalCompositeOperation = 'source-over'; stars(c, w, h * 0.8, 500, r, t, true);
     c.fillStyle = '#05070c'; c.fillRect(0, h * 0.8, w, h * 0.2); c.fillStyle = '#121725'; c.beginPath(); c.moveTo(w * 0.47, h * 0.8); c.lineTo(w * 0.53, h * 0.8); c.lineTo(w * 0.85, h); c.lineTo(w * 0.15, h); c.fill();
     c.strokeStyle = 'rgba(255,255,255,.55)'; c.setLineDash([w * 0.02, w * 0.02]); c.lineDashOffset = -t / 40; c.beginPath(); c.moveTo(w * 0.5, h * 0.8); c.lineTo(w * 0.5, h); c.lineWidth = 2; c.stroke(); c.setLineDash([]); }
   if (k === 3) { c.fillStyle = '#02030a'; c.fillRect(0, 0, w, h); stars(c, w, h, 360, r, t, true); const cx = w * 0.5, cy = h * 1.55, R = h * 1.05, sun = 0.5 + 0.5 * Math.sin(t / 4000);
     blob(c, cx, cy - R, w * 0.35, `rgba(120,190,255,${(0.25 + sun * 0.15).toFixed(3)})`); const g = c.createRadialGradient(cx - R * 0.2, cy - R * 0.4, R * 0.2, cx, cy, R); g.addColorStop(0, '#1b5d8c'); g.addColorStop(0.7, '#0b2a4a'); g.addColorStop(1, '#061527'); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
     c.strokeStyle = 'rgba(140,210,255,.55)'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, R + 2, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); blob(c, cx + R * 0.45, cy - R * 0.92, w * 0.06, 'rgba(255,240,200,.9)'); }
   if (k === 4) { const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#070512'); g.addColorStop(1, '#120b05'); c.fillStyle = g; c.fillRect(0, 0, w, h); stars(c, w, h, 300, r, t, true); const cx = w * 0.56, cy = h * 0.5, R = h * 0.22;
     const ring = (front) => { c.save(); c.translate(cx, cy); c.rotate(-0.32); c.scale(1, 0.28); c.lineWidth = R * 0.32; c.strokeStyle = 'rgba(230,200,150,.55)'; c.beginPath(); c.arc(0, 0, R * 1.75, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2); c.stroke(); c.lineWidth = R * 0.08; c.strokeStyle = 'rgba(255,230,190,.5)'; c.beginPath(); c.arc(0, 0, R * 2.05, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2); c.stroke(); c.restore(); };
     ring(false); const p = c.createRadialGradient(cx - R * 0.4, cy - R * 0.4, R * 0.1, cx, cy, R); p.addColorStop(0, '#f2d7a0'); p.addColorStop(0.6, '#c39a5a'); p.addColorStop(1, '#4a3016'); c.fillStyle = p; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill(); ring(true); }
   if (k === 6) { c.fillStyle = '#080206'; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'lighter'; const d = Math.sin(t / 6000) * .02;
     blob(c, w * (.45 + d), h * .5, w * .34, 'rgba(220,60,40,.5)'); blob(c, w * .6, h * .4, w * .22, 'rgba(255,150,60,.35)'); blob(c, w * .35, h * .35, w * .2, 'rgba(120,40,160,.35)'); c.globalCompositeOperation = 'source-over'; stars(c, w, h, 380, r, t, true); }
   if (k === 7) { c.fillStyle = '#03030a'; c.fillRect(0, 0, w, h); stars(c, w, h, 300, r, t, true); c.save(); c.translate(w * .5, h * .5); c.rotate(t / 40000); c.globalCompositeOperation = 'lighter';
     for (let a = 0; a < 2; a++) for (let i = 0; i < 260; i++) { const th = i * .045 + a * Math.PI, rr = 4 + i * w * .0016; c.fillStyle = `rgba(${170 + (i % 80)},${170 + (i % 60)},255,.22)`; c.beginPath(); c.arc(Math.cos(th) * rr, Math.sin(th) * rr * .55, 2 + i * .02, 0, 7); c.fill(); }
     blob(c, 0, 0, w * .08, 'rgba(255,235,200,.8)'); c.restore(); }
   if (k === 8) { c.fillStyle = '#000'; c.fillRect(0, 0, w, h); stars(c, w, h, 300, r, t, false); const cx = w * .5, cy = h * .5; c.globalCompositeOperation = 'lighter';
     c.save(); c.translate(cx, cy); c.scale(1, .28); c.rotate(t / 3000); for (let i = 0; i < 40; i++) { c.strokeStyle = `rgba(255,${120 + i * 3},40,.08)`; c.lineWidth = 6; c.beginPath(); c.arc(0, 0, w * (.14 + i * .004), 0, 7); c.stroke(); } c.restore();
     blob(c, cx, cy - h * .02, w * .16, 'rgba(255,160,60,.25)'); c.globalCompositeOperation = 'source-over'; c.fillStyle = '#000'; c.beginPath(); c.arc(cx, cy, h * .14, 0, 7); c.fill(); }
   if (k === 9) { c.fillStyle = '#04050c'; c.fillRect(0, 0, w, h); stars(c, w, h, 240, r, t, true); const cx = w * .62, cy = h * .45, R = h * .28; blob(c, cx, cy, R * 1.8, 'rgba(200,210,255,.12)');
     const g = c.createRadialGradient(cx - R * .3, cy - R * .3, R * .1, cx, cy, R); g.addColorStop(0, '#f4f3ea'); g.addColorStop(1, '#a9a99c'); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
     c.fillStyle = 'rgba(120,120,110,.35)'; [[.2, -.2, .18], [-.3, .1, .12], [.1, .35, .1], [-.1, -.4, .08]].forEach(([x, y, z]) => { c.beginPath(); c.arc(cx + x * R, cy + y * R, z * R, 0, 7); c.fill(); }); }
   if (k === 10) { c.fillStyle = '#02040c'; c.fillRect(0, 0, w, h); stars(c, w, h, 320, r, t, true); const x = w * (.75 + Math.sin(t / 7000) * .02), y = h * .3; c.globalCompositeOperation = 'lighter';
     const g = c.createLinearGradient(x, y, w * .1, h * .8); g.addColorStop(0, 'rgba(180,230,255,.8)'); g.addColorStop(1, 'rgba(80,150,255,0)'); c.strokeStyle = g; for (let i = 0; i < 6; i++) { c.lineWidth = 10 - i * 1.5; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(w * .45, h * (.42 + i * .02), w * .08, h * (.75 + i * .02)); c.stroke(); }
     blob(c, x, y, w * .03, 'rgba(255,255,255,.95)'); }
   if (k === 11) { c.fillStyle = '#030512'; c.fillRect(0, 0, w, h); stars(c, w, h, 300, r, t, true); for (let i = 0; i < 5; i++) { const p = ((t / 2600 + i * .37) % 1), x0 = w * (.15 + i * .17), y0 = h * (.05 + (i % 3) * .08);
       const x = x0 + p * w * .25, y = y0 + p * h * .3; const g = c.createLinearGradient(x, y, x - w * .08, y - h * .1); g.addColorStop(0, `rgba(255,255,255,${(1 - p).toFixed(2)})`); g.addColorStop(1, 'rgba(255,255,255,0)'); c.strokeStyle = g; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x - w * .08, y - h * .1); c.stroke(); } }
   if (k === 12) { c.fillStyle = '#05040a'; c.fillRect(0, 0, w, h); stars(c, w, h, 260, r, t, true); const cx = w * .55, cy = h * .5, R = h * .32; c.save(); c.beginPath(); c.arc(cx, cy, R, 0, 7); c.clip();
     for (let i = -10; i < 10; i++) { c.fillStyle = ['#d9b38c', '#c49064', '#e8d2b0', '#a8693f', '#f0e0c4'][(i + 20) % 5]; c.fillRect(cx - R, cy + i * R * .1 + Math.sin(t / 3000 + i) * 2, R * 2, R * .1); }
     c.fillStyle = 'rgba(190,80,50,.85)'; c.beginPath(); c.ellipse(cx + R * .3, cy + R * .25, R * .16, R * .09, 0, 0, 7); c.fill(); const sh = c.createRadialGradient(cx - R * .4, cy - R * .3, R * .2, cx, cy, R * 1.05); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.55)'); c.fillStyle = sh; c.fillRect(cx - R, cy - R, R * 2, R * 2); c.restore(); }
   if (k === 13) { c.fillStyle = '#01020a'; c.fillRect(0, 0, w, h); stars(c, w, h * .5, 200, r, t, true); const cx = w * .5, cy = h * 1.35, R = h * 1.0; const g = c.createRadialGradient(cx, cy, R * .6, cx, cy, R); g.addColorStop(0, '#04081a'); g.addColorStop(1, '#0b1838'); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
     c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 260; i++) { const a = Math.PI * (1.15 + r() * .7), d = R * (.55 + r() * .43), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d; if (y > h) continue; c.fillStyle = `rgba(255,${180 + (i % 60)},90,${(.3 + r() * .6).toFixed(2)})`; c.fillRect(x, y, 2, 2); }
     c.strokeStyle = 'rgba(90,170,255,.6)'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, R + 2, Math.PI * 1.12, Math.PI * 1.88); c.stroke(); }
   if (k === 14) { c.fillStyle = '#04040a'; c.fillRect(0, 0, w, h); stars(c, w, h, 280, r, t, true); for (let i = 0; i < 70; i++) { const x = ((r() * w + t / (40 + i % 30)) % (w + 40)) - 20, y = h * (.35 + r() * .35), z = 2 + r() * 9;
       c.fillStyle = `rgb(${90 + (i * 7) % 60},${80 + (i * 5) % 50},${70 + (i * 3) % 40})`; c.beginPath(); c.ellipse(x, y, z, z * .7, i, 0, 7); c.fill(); } }
   if (k === 15) { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#050212'); g.addColorStop(1, '#1a0a24'); c.fillStyle = g; c.fillRect(0, 0, w, h); stars(c, w, h * .7, 260, r, t, true); c.globalCompositeOperation = 'lighter';
     for (let b = 0; b < 4; b++) { c.beginPath(); for (let x = 0; x <= w; x += 6) { const y = h * (.25 + b * .06) + Math.sin(x / (80 + b * 25) + t / (1700 + b * 300) + b) * h * .07; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.lineTo(w, h * .8); c.lineTo(0, h * .8); c.closePath();
       const a = c.createLinearGradient(0, h * .2, 0, h * .8); a.addColorStop(0, b % 2 ? 'rgba(200,90,255,.16)' : 'rgba(255,80,190,.14)'); a.addColorStop(1, 'rgba(60,20,120,0)'); c.fillStyle = a; c.fill(); }
     c.globalCompositeOperation = 'source-over'; c.fillStyle = '#05020a'; c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= w; x += 10) c.lineTo(x, h * .82 - Math.abs(Math.sin(x / 140)) * h * .07); c.lineTo(w, h); c.fill(); }
   if (k === 16) { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a1a3a'); g.addColorStop(.55, '#a8603c'); g.addColorStop(1, '#4a2414'); c.fillStyle = g; c.fillRect(0, 0, w, h); blob(c, w * .55, h * .58, w * .06, 'rgba(190,220,255,.9)'); blob(c, w * .55, h * .58, w * .2, 'rgba(160,200,255,.25)');
     c.fillStyle = '#2b130b'; c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= w; x += 8) c.lineTo(x, h * .7 - Math.abs(Math.sin(x / 90)) * h * .06 - (x > w * .6 && x < w * .8 ? h * .1 : 0)); c.lineTo(w, h); c.fill(); }
   if (k === 17) { c.fillStyle = '#02030a'; c.fillRect(0, 0, w, h); stars(c, w, h, 320, r, t, true); const a = t / 2500, cx = w * .5, cy = h * .5, d = w * .09; c.globalCompositeOperation = 'lighter';
     blob(c, cx + Math.cos(a) * d, cy + Math.sin(a) * d * .5, w * .1, 'rgba(255,200,120,.7)'); blob(c, cx - Math.cos(a) * d, cy - Math.sin(a) * d * .5, w * .08, 'rgba(120,180,255,.7)'); }
   if (k === 5) { c.fillStyle = '#01020a'; c.fillRect(0, 0, w, h); const cx = w / 2, cy = h / 2; for (let i = 0; i < 260; i++) { const a = r() * Math.PI * 2, sp = 0.2 + r() * 0.8, life = ((t / 1000) * sp * 0.35 + r()) % 1, d = life * life * w * 0.7, l = 2 + life * 18;
       c.strokeStyle = `rgba(${170 + (i % 60)},${200 + (i % 50)},255,${(life * 0.9).toFixed(3)})`; c.lineWidth = 0.6 + life * 1.6; c.beginPath(); c.moveTo(cx + Math.cos(a) * d, cy + Math.sin(a) * d); c.lineTo(cx + Math.cos(a) * (d + l), cy + Math.sin(a) * (d + l)); c.stroke(); }
     blob(c, cx, cy, w * 0.08, 'rgba(140,180,255,.25)'); }
 }
 const NAMES = ['Nébuleuse d’Orion', 'Aurore sur les Vosges', 'Voie lactée sur la route', 'Planète au lever', 'Saturne', 'Tunnel d’étoiles', 'Nébuleuse de la Carène', 'Galaxie spirale', 'Trou noir', 'Pleine lune', 'Comète', 'Étoiles filantes', 'Jupiter', 'La Terre de nuit', 'Ceinture d’astéroïdes', 'Aurore violette', 'Coucher de soleil martien', 'Étoiles jumelles'];
 const reg = (id, label, desc) => { if (window.Try750) Try750.register(id, label, desc, '7.55'); };
 reg('wall755', 'Fonds d’espace animés', '18 fonds d’espace, le ciel réel et le fond qui suit la journée (Fond d’écran).');
 reg('milky755', 'Route sous la Voie lactée', 'La nuit, par temps clair, la Voie lactée traverse le ciel du décor de la route.');
 const on = id => !window.Try750 || Try750.on(id);
 const here = () => { const l = typeof loc !== 'undefined' && loc && Number.isFinite(loc.lat) ? loc : null; return l || store.get('lastLoc755', null) || { lat: 48.58, lon: 7.75 }; };
 const deg = r => r * 180 / Math.PI;
 const sunAlt = d => { const p = here(); return window.SunCalc ? deg(SunCalc.getPosition(d, p.lat, p.lon).altitude) : (() => { const h = d.getHours() + d.getMinutes() / 60; return 60 * Math.sin(Math.PI * (h - 6) / 14); })(); };
 const mix = (a, b, u) => a.map((x, i) => Math.round(x + (b[i] - x) * Math.max(0, Math.min(1, u))));
 const rgb = a => `rgb(${a[0]},${a[1]},${a[2]})`;
 // Couleurs du ciel selon la hauteur du soleil (haut, bas de l'image).
 function skyCols(alt) {
  const K = [[-18, [2, 3, 10], [5, 7, 20]], [-8, [8, 12, 40], [40, 30, 70]], [-2, [40, 40, 100], [230, 120, 90]], [4, [90, 140, 210], [255, 180, 120]], [15, [60, 130, 220], [170, 210, 250]], [90, [40, 110, 215], [150, 200, 250]]];
  if (alt <= K[0][0]) return [K[0][1], K[0][2]];
  for (let i = 1; i < K.length; i++) if (alt <= K[i][0]) { const u = (alt - K[i - 1][0]) / (K[i][0] - K[i - 1][0]); return [mix(K[i - 1][1], K[i][1], u), mix(K[i - 1][2], K[i][2], u)]; }
  return [K[K.length - 1][1], K[K.length - 1][2]];
 }
 function gradSky(c, w, h, alt) { const [a, b] = skyCols(alt), g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, rgb(a)); g.addColorStop(1, rgb(b)); c.fillStyle = g; c.fillRect(0, 0, w, h); }
 function hills(c, w, h, alt) { const col = mix([4, 5, 10], [40, 60, 50], (alt + 6) / 20); c.fillStyle = rgb(col); c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= w; x += 8) c.lineTo(x, h * .86 - Math.abs(Math.sin(x / 130)) * h * .05 - Math.abs(Math.sin(x / 47)) * h * .015); c.lineTo(w, h); c.fill(); }
 // Ciel réel : étoiles qui tournent avec la Terre, Voie lactée, lune avec sa phase, soleil, à leur vraie place.
 function drawSky(c, w, h, t, d) {
  const p = here(), alt = sunAlt(d); gradSky(c, w, h, alt);
  const night = Math.max(0, Math.min(1, (-alt - 4) / 10));
  if (night > 0) {
   const lst = ((d.getTime() / 86164091) * 2 * Math.PI + p.lon * Math.PI / 180) % (2 * Math.PI), r = rng(4242), cx = w * .5, cy = -h * .35;
   c.save(); c.translate(cx, cy); c.rotate(lst); c.globalAlpha = night;
   for (let i = 0; i < 1100; i++) { const a = r() * 2 * Math.PI, dd = Math.sqrt(r()) * w * 1.15, z = r(), x = Math.cos(a) * dd, y = Math.sin(a) * dd; c.fillStyle = `rgba(255,255,255,${(0.45 + 0.55 * z * (0.8 + 0.2 * Math.sin(t / 900 + i))).toFixed(3)})`; const s = z > .97 ? 2 : z > .8 ? 1.3 : .8; c.fillRect(x, y, s, s); }
   c.globalCompositeOperation = 'lighter'; c.rotate(.9); for (let i = 0; i < 40; i++) blob(c, -w + i * w * .06, h * .9 + Math.sin(i * 1.7) * h * .06, w * (.08 + (i % 3) * .02), 'rgba(175,165,255,.10)');
   c.restore();
  }
  if (window.SunCalc) {
   const ill = SunCalc.getMoonIllumination(d);
   for (const [kind, q] of [['sun', SunCalc.getPosition(d, p.lat, p.lon)], ['moon', SunCalc.getMoonPosition(d, p.lat, p.lon)]]) {
    const a = deg(q.altitude); if (a < -2) continue;
    const x = w * (.5 + deg(q.azimuth) / 200), y = h * .84 - (h * .74) * Math.min(1, a / 70), R = kind === 'sun' ? h * .045 : h * .04;
    if (x < -R || x > w + R) continue;
    if (kind === 'sun') { blob(c, x, y, R * 5, a < 8 ? 'rgba(255,170,90,.55)' : 'rgba(255,240,190,.45)'); c.fillStyle = a < 8 ? '#ffc477' : '#fff6d8'; c.beginPath(); c.arc(x, y, R, 0, 7); c.fill(); }
    else {
     blob(c, x, y, R * 3.5, `rgba(210,225,255,${(0.12 + 0.25 * night).toFixed(2)})`);
     c.fillStyle = '#eef0e6'; c.beginPath(); c.arc(x, y, R, 0, 7); c.fill();
     const f = ill.fraction, wax = ill.phase < .5; c.fillStyle = 'rgba(10,14,30,.88)'; c.beginPath(); c.arc(x, y, R + .5, Math.PI / 2, Math.PI * 1.5, !wax);
     c.ellipse(x, y, R * Math.abs(1 - 2 * f), R + .5, 0, Math.PI * 1.5, Math.PI / 2, f > .5 ? wax : !wax); c.fill();
    }
   }
  }
  hills(c, w, h, alt);
 }
 function puff(c, x, y, r) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,255,255,.75)'); g.addColorStop(.6, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
 // Fond qui suit la journée : aube rose, jour bleu, soir orangé, nuit étoilée, en douceur.
 function drawDay(c, w, h, t, d) {
  const alt = sunAlt(d); gradSky(c, w, h, alt);
  const night = Math.max(0, Math.min(1, (-alt - 2) / 10));
  if (night > 0) { c.save(); c.globalAlpha = night; stars(c, w, h * .8, 300, rng(99), t, true); c.restore(); }
  c.globalCompositeOperation = 'lighter';
  const glow = alt > -10 && alt < 12 ? 1 - Math.abs(alt - 1) / 11 : 0, east = d.getHours() < 13;
  if (glow > 0) blob(c, east ? w * .2 : w * .8, h * .85, w * .45, `rgba(255,140,80,${(0.45 * glow).toFixed(2)})`);
  c.globalCompositeOperation = 'source-over';
  if (alt >= 8) for (let i = 0; i < 5; i++) { const x = ((i * 0.23 + t / 400000) % 1.2 - .1) * w, y = h * (.16 + (i % 3) * .09); for (let j = 0; j < 5; j++) puff(c, x + (j - 2) * w * .03, y + Math.sin(j * 2.1 + i) * h * .015, w * (.035 + (j % 2) * .012)); }
  hills(c, w, h, alt);
 }
 function paint(id, c, w, h, t, d) {
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  if (id === 'sky') drawSky(c, w, h, t, d); else if (id === 'day') drawDay(c, w, h, t, d); else draw(+id.slice(2), c, w, h, t);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
 }
 const IDS = NAMES.map((_, k) => 'sp' + k).concat(['sky', 'day']);
 const ours = id => IDS.includes(id);
 // Ajout aux fonds de l'appli (aperçus et image fixe sous l'animation).
 if (typeof WALLS !== 'undefined' && !WALLS.some(x => x.id === 'sp0')) {
  NAMES.forEach((n, k) => WALLS.push({ id: 'sp' + k, k: 'sp751', pi: 0, cat: 'Espace animé', name: n }));
  WALLS.push({ id: 'sky', k: 'sp751', pi: 0, cat: 'Ciel', name: 'Ciel réel' }, { id: 'day', k: 'sp751', pi: 0, cat: 'Ciel', name: 'Fond qui suit la journée' });
 }
 if (typeof window.drawWall === 'function') {
  const dw0 = window.drawWall;
  window.drawWall = function (w, W, H) {
   if (!w || w.k !== 'sp751') return dw0.apply(this, arguments);
   const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
   safe(() => paint(w.id, cv.getContext('2d'), W, H, 0, new Date()));
   return safe(() => cv.toDataURL('image/jpeg', .85), '');
  };
 }
 // Couche animée sous le contenu de l'Accueil.
 let layer = null, timer = 0, slow = 0, cur = '', cost = 0, frames = 0;
 const wall = () => safe(() => pv('wall', ''), '');
 const mode = () => store.get('wallAnim755', 'lent');
 const visible = () => !document.hidden && !safe(() => Perf725.paused(), false);
 function frame() {
  if (!layer || !ours(cur) || !visible()) return;
  const c = layer.getContext('2d'), w = layer.width, h = layer.height, now = Date.now(), t0 = performance.now();
  safe(() => paint(cur, c, w, h, mode() === 'fixe' ? 0 : now, new Date(now)));
  // Garde-fou : si le dessin coûte plus de 25 ms en moyenne, l'autoradio est trop juste → fond fixe.
  if (timer) { cost = cost * .85 + (performance.now() - t0) * .15; if (++frames > 16 && cost > 25) { store.set('wallAnim755', 'fixe'); clearInterval(timer); timer = 0; safe(() => toast('Fond d’espace passé en « Fixe » : l’animation était trop lourde pour l’autoradio.')); } }
  const dim = safe(() => pv('wallDim', 30), 30) / 100; if (dim > 0) { c.fillStyle = `rgba(0,0,0,${dim})`; c.fillRect(0, 0, w, h); }
 }
 function sync() {
  const id = on('wall755') ? wall() : '', st = safe(() => $('stage'), null);
  if (!st) return;
  if (!ours(id)) { if (layer) { layer.remove(); layer = null; } clearInterval(timer); clearInterval(slow); timer = slow = 0; cur = ''; return; }
  if (!layer || !layer.isConnected) {
   layer = document.createElement('canvas'); layer.id = 'wall755'; layer.width = 480; layer.height = 270;
   layer.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;z-index:-1;pointer-events:none';
   st.insertBefore(layer, st.firstChild);
  }
  const changed = cur !== id; cur = id;
  const anim = mode() !== 'fixe' && tab === 'home';
  if (anim && !timer) { cost = 0; frames = 0; timer = setInterval(frame, 125); }
  if (!anim && timer) { clearInterval(timer); timer = 0; }
  if (!slow) slow = setInterval(frame, 60000);   // ciel réel et journée : mis à jour chaque minute même sans animation
  if (changed || !anim) frame();
 }
 if (typeof window.render === 'function') {
  const r0 = window.render;
  window.render = function () { const out = r0.apply(this, arguments); safe(sync); return out; };
 }
 setInterval(() => { if (typeof loc !== 'undefined' && loc && Number.isFinite(loc.lat)) { const l = store.get('lastLoc755', null); if (!l || Math.abs(l.lat - loc.lat) + Math.abs(l.lon - loc.lon) > .2) store.set('lastLoc755', { lat: +loc.lat.toFixed(2), lon: +loc.lon.toFixed(2) }); } }, 60000);
 // Réglage dans Fond d'écran.
 const page = SETCATS.map(c => c[1].find(s => s[0] === 'Fond d\'écran')).find(Boolean);
 if (page && !page.__w755) {
  const f0 = page[1];
  page[1] = function (p) {
   return f0.apply(this, arguments) + secT(p, 'Fonds d’espace et ciel') + setRow(p, 'Animation', 'Lente : les étoiles scintillent doucement sur l’Accueil (8 images/s). Fixe : aucune animation, le ciel réel se met quand même à jour chaque minute.', chipBtn(p, 'w755:lent', 'Lente', mode() !== 'fixe') + chipBtn(p, 'w755:fixe', 'Fixe', mode() === 'fixe'));
  };
  page.__w755 = true;
 }
 const act0 = window.act;
 window.act = function (a) {
  if (a === 'w755:lent' || a === 'w755:fixe') { store.set('wallAnim755', a.slice(5)); render(); return; }
  return act0.apply(this, arguments);
 };
 // Décor de la route : bande de la Voie lactée la nuit (appelée par decors726.js).
 window.Milky755 = function (c, W, top, hz, t) {
  if (!on('milky755')) return;
  c.save(); c.globalCompositeOperation = 'lighter';
  const r = rng(751);
  for (let i = 0; i < 14; i++) { const u = i / 13, x = W * (.05 + .9 * u), y = top + (hz - top) * (.15 + .55 * u); const g = c.createRadialGradient(x, y, 0, x, y, (hz - top) * .35); g.addColorStop(0, 'rgba(190,180,255,.07)'); g.addColorStop(1, 'rgba(190,180,255,0)'); c.fillStyle = g; c.fillRect(x - W * .2, y - (hz - top) * .4, W * .4, (hz - top) * .8); }
  for (let i = 0; i < 90; i++) { const u = r(), x = W * (.05 + .9 * u) + (r() - .5) * W * .08, y = top + (hz - top) * (.15 + .55 * u) + (r() - .5) * (hz - top) * .18; c.globalAlpha = .3 + .5 * r() * (.8 + .2 * Math.sin(t * 1.3 + i)); c.fillStyle = '#f0f0ff'; c.fillRect(x, y, .9, .9); }
  c.restore();
 };
 window.Wall755 = { paint, sync, names: NAMES, ids: IDS };
})();
