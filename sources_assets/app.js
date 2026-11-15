/* Accueil 2008 GT v4.6 — by Roudoussa 67 — écran d'accueil pour autoradio Android (Peugeot 2008 GT Line)
   13 thèmes, couleurs et dégradés personnalisables, thème par profil,
   onglets Trajets / Entretien / Éco-conduite / Thèmes. */
'use strict';
// v7.4 : tout premier démarrage (aucun réglage enregistré) → la disposition « Autoradio » sera mise par défaut
const FRESH08 = (() => { try { return !Object.keys(localStorage).some((k) => k.startsWith('a08_') && k !== 'a08_arDefDone'); } catch (e) { return false; } })();
const $ = (id) => document.getElementById(id);
const A = window.Android || null;
const DEMO = !A;

// ================= stockage =================
const store = {
  get(k, d) { try { const v = localStorage.getItem('a08_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('a08_' + k, JSON.stringify(v)); } catch (e) {} }
};

// ================= réseau =================
const httpCbs = {}; let httpN = 0;
window.__httpCb = (id, ok, body) => { const c = httpCbs[id]; delete httpCbs[id]; if (c) c(ok, body); };
function http(url) {
  return new Promise((res) => {
    if (A) {
      const id = 'c' + (++httpN);
      const timer = setTimeout(() => { delete httpCbs[id]; res({ ok: false, b: 'Délai réseau dépassé' }); }, 17000);
      httpCbs[id] = (ok, b) => { clearTimeout(timer); res({ ok, b }); };
      try { A.http(url, id); } catch (e) { clearTimeout(timer); delete httpCbs[id]; res({ ok: false, b: String(e) }); }
    }
    else if (DEMO) res({ ok: false, b: 'demo' });
    else fetch(url).then((r) => r.text().then((t) => res({ ok: r.ok, b: t }))).catch((e) => res({ ok: false, b: String(e) }));
  });
}
async function getJSON(url) { const r = await http(url); if (!r.ok) throw new Error(String(r.b).slice(0, 200)); return JSON.parse(r.b); }

// ================= utilitaires =================
const fr1 = (n) => n.toFixed(1).replace('.', ',');
const fr2 = (n) => n.toFixed(2).replace('.', ',');
const pad = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function hav(a, b, c, d) { const R = 6371, t = Math.PI / 180; const x = Math.sin((c - a) * t / 2) ** 2 + Math.cos(a * t) * Math.cos(c * t) * Math.sin((d - b) * t / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); }
let toastT = 0;
function toast(msg) { const t = $('toast'); t.textContent = msg; t.style.display = 'block'; clearTimeout(toastT); toastT = setTimeout(() => { t.style.display = 'none'; }, 3000); }
const hex7 = (h) => (h || '#000000').slice(0, 7);
function lum(h) { h = hex7(h).slice(1); const v = [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; }
const dayKey = (t) => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const fmtDate = (t) => { const d = new Date(t); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; };
const fmtTime = (t) => { const d = new Date(t); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };

// ================= thèmes =================
const THEMES = [
  { id: '01', name: 'GT Line Noir et Rouge', layout: 'classic', bg: '#0B0C0F', card: '#14151A', card2: '#1E2027', txt: '#F2F2F4', mut: '#9A9BA3', acc: '#E0312B', wbg: '#161B24', wacc: '#8FB8EA', mbg: '#1F1826', mtxt: '#C7B8E0', art: '#7A2E1C', map: '#17201F', ok: ['#1F3A14', '#B6DD8C'], bad: ['#4A1714', '#F7B4AE'], warn: '#F0B060', r: 22, font: 'Inter', dock: 'color' },
  { id: '02', name: 'Blanc Nacré', layout: 'split', bg: '#ECEAE4', card: '#FBFAF7', card2: '#F1EFE9', txt: '#16171A', mut: '#6B6A66', acc: '#D22B25', wbg: '#FBFAF7', wacc: '#185FA5', mbg: '#16171A', mtxt: '#C9C6BC', art: '#8C3A22', map: '#E3E6E1', ok: ['#E2EFD3', '#2F5E0E'], bad: ['#FBE3E1', '#A32D2D'], warn: '#9A5B05', r: 24, font: 'Inter', dock: 'dark', light: true },
  { id: '03', name: 'Nuit OLED', layout: 'minimal', bg: '#000000', card: '#000000', card2: '#0F1013', txt: '#D8D8DC', mut: '#8A8B91', acc: '#C0392B', wbg: '#000000', wacc: '#6F95C0', mbg: '#000000', mtxt: '#8A8B91', art: '#3D1A10', map: '#07090A', ok: ['#0F1A0A', '#7FA85A'], bad: ['#2A0E0C', '#E08A82'], warn: '#C99A50', r: 22, font: 'Inter', border: '#1A1C1F', dock: 'mono' },
  { id: '04', name: 'Panorama', layout: 'floating', bg: '#141B1A', card: '#0E1116E6', card2: '#1C2028CC', txt: '#F2F2F4', mut: '#A3A5AD', acc: '#E0312B', wbg: '#0E1116E6', wacc: '#8FB8EA', mbg: '#0E1116E6', mtxt: '#C7B8E0', art: '#7A2E1C', map: '#141B1A', ok: ['#1F3A14', '#B6DD8C'], bad: ['#4A1714', '#F7B4AE'], warn: '#F0B060', r: 18, font: 'Inter', dock: 'color' },
  { id: '05', name: 'i-Cockpit', layout: 'cockpit', bg: '#0A0A0C', card: '#151519', card2: '#1E1F25', txt: '#F2F2F4', mut: '#9A9BA3', acc: '#E0312B', wbg: '#151519', wacc: '#7DB8F0', mbg: '#151519', mtxt: '#A9AAB0', art: '#5A2A6E', map: '#161D1C', ok: ['#1F3A14', '#B6DD8C'], bad: ['#4A1714', '#F7B4AE'], warn: '#EF9F27', r: 20, font: 'Rajdhani', border: '#2A2A30', dock: 'color' },
  { id: '06', name: 'Bento Graphite', layout: 'bento', bg: '#101216', card: '#181A20', card2: '#22252D', txt: '#F2F2F4', mut: '#9A9BA3', acc: '#1D9E75', wbg: '#18202C', wacc: '#8FB8EA', mbg: '#1F1826', mtxt: '#C7B8E0', art: '#0F6E56', map: '#161D1C', ok: ['#0F3A2C', '#9FE1CB'], bad: ['#4A1714', '#F7B4AE'], warn: '#F0B060', r: 20, font: 'Space Grotesk', dock: 'color' },
  { id: '07', name: 'Sport Racing', layout: 'carcenter', bg: '#0C0C0D', card: '#161618', card2: '#202024', txt: '#FFFFFF', mut: '#A0A0A6', acc: '#FF2A1F', wbg: '#161618', wacc: '#FF8A80', mbg: '#161618', mtxt: '#B0B0B6', art: '#8B1A12', map: '#141416', ok: ['#16300F', '#9FD36A'], bad: ['#5A120E', '#FFB4AE'], warn: '#FFB020', r: 6, font: 'Rajdhani', stripe: true, dock: 'mono' },
  { id: '08', name: 'Néon Cyber', layout: 'bento', bg: '#07060F', card: '#0E0C1E', card2: '#17143A', txt: '#E8F7FF', mut: '#8C8AB8', acc: '#FF2BD6', wbg: '#0E0C1E', wacc: '#22E5FF', mbg: '#0E0C1E', mtxt: '#22E5FF', art: '#3B0D5C', map: '#0A0918', ok: ['#0B2B33', '#22E5FF'], bad: ['#3A0B33', '#FF7BE6'], warn: '#FFE14D', r: 14, font: 'Orbitron', border: '#2B2470', dock: 'outline' },
  { id: '09', name: 'Synthwave Rétro 80', layout: 'carcenter', bg: '#1A0B2E', card: '#24123F', card2: '#311A55', txt: '#FFF1E6', mut: '#C3A6E0', acc: '#FF7A1A', wbg: '#24123F', wacc: '#FFB86B', mbg: '#24123F', mtxt: '#FF9EDB', art: '#7A1F6E', map: '#1E0E36', ok: ['#1F3A2A', '#7CF2B4'], bad: ['#4A1430', '#FF9EB4'], warn: '#FFD166', r: 18, font: 'Orbitron', dock: 'color' },
  { id: '10', name: 'Forêt Sauge', layout: 'classic', bg: '#E6E9E1', card: '#F7F8F3', card2: '#ECEFE5', txt: '#1E2A1E', mut: '#5E6B5C', acc: '#3B6D11', wbg: '#F7F8F3', wacc: '#3B6D11', mbg: '#2B3A2A', mtxt: '#C0DD97', art: '#4E6B2E', map: '#DDE5D5', ok: ['#DDEDC8', '#27500A'], bad: ['#F7DDD8', '#99351E'], warn: '#8A5A0B', r: 26, font: 'Inter', dock: 'soft', light: true },
  { id: '11', name: 'Océan Profond', layout: 'split', bg: '#06182B', card: '#0C2540', card2: '#123257', txt: '#E6F1FB', mut: '#85B7EB', acc: '#5DCAA5', wbg: '#0C2540', wacc: '#9FE1CB', mbg: '#0C2540', mtxt: '#85B7EB', art: '#185FA5', map: '#0A2036', ok: ['#0F3A3A', '#9FE1CB'], bad: ['#4A1A24', '#F7B4C0'], warn: '#FAC775', r: 22, font: 'Inter', dock: 'color' },
  { id: '12', name: 'Luxe Or et Noir', layout: 'minimal', bg: '#0B0A08', card: '#13110D', card2: '#1C1914', txt: '#F3EBDD', mut: '#A89A80', acc: '#C9A227', wbg: '#13110D', wacc: '#C9A227', mbg: '#13110D', mtxt: '#A89A80', art: '#4A3A14', map: '#0F0E0B', ok: ['#26220F', '#E0C870'], bad: ['#3A1712', '#E8A598'], warn: '#E0C870', r: 4, font: 'Playfair Display', border: '#2E281C', dock: 'gold' },
  { id: '14', name: 'Coucher de Soleil', layout: 'speedhud', grad: ['#FF7E5F', '#3A1C71', 160], bg: '#2A1530', card: '#1A0F22CC', card2: '#2A1A36CC', txt: '#FFF4EC', mut: '#E6C3C8', acc: '#FF7E5F', wbg: '#1A0F22CC', wacc: '#FEB47B', mbg: '#1A0F22CC', mtxt: '#FEB47B', art: '#B4483A', map: '#22142C', ok: ['#1F3A2A', '#9FE1CB'], bad: ['#5A1A24', '#FFB4B4'], warn: '#FEB47B', r: 24, font: 'Inter', dock: 'color' },
  { id: '15', name: 'Cyber Aurore', layout: 'gauges', grad: ['#0F2027', '#2C5364', 135], bg: '#0F2027', card: '#0B1A22D9', card2: '#14303CCC', txt: '#E6FBFF', mut: '#8FB8C8', acc: '#22E5FF', wbg: '#0B1A22D9', wacc: '#22E5FF', mbg: '#0B1A22D9', mtxt: '#7FE7F5', art: '#0F6E80', map: '#0C1C24', ok: ['#0B3333', '#5DE5C5'], bad: ['#3A1222', '#FF8FA8'], warn: '#FFD166', r: 16, font: 'Space Grotesk', dock: 'outline' },
  { id: '16', name: 'Rouge Lave', layout: 'sidebar', grad: ['#1A0508', '#8C1C3A', 120], bg: '#1A0508', card: '#140608CC', card2: '#2A0E14CC', txt: '#FFF0EE', mut: '#D9A6A6', acc: '#FF3B2F', wbg: '#140608CC', wacc: '#FF9A7A', mbg: '#140608CC', mtxt: '#FFB4A8', art: '#7A1018', map: '#160608', ok: ['#1F3A14', '#B6DD8C'], bad: ['#5A0E0E', '#FFB4AE'], warn: '#FFB020', r: 14, font: 'Rajdhani', dock: 'color' },
  { id: '17', name: 'Améthyste Musique', layout: 'musicfocus', grad: ['#8E2DE2', '#1A0B3A', 150], bg: '#2A1050', card: '#170A2CCC', card2: '#2A1650CC', txt: '#F6EEFF', mut: '#C9B4E8', acc: '#C471ED', wbg: '#170A2CCC', wacc: '#E0B8FF', mbg: '#170A2CCC', mtxt: '#E0B8FF', art: '#5A1E9E', map: '#1A0B30', ok: ['#1F3A2A', '#9FE1CB'], bad: ['#4A1430', '#FF9EB4'], warn: '#FFD166', r: 26, font: 'Inter', dock: 'color' },
  { id: '18', name: 'Océan Turquoise', layout: 'stack', grad: ['#0B3D5C', '#2193B0', 180], bg: '#0B3D5C', card: '#06233AD9', card2: '#0C3452CC', txt: '#E6F7FF', mut: '#9FD3EA', acc: '#6DD5ED', wbg: '#06233AD9', wacc: '#9FE1CB', mbg: '#06233AD9', mtxt: '#9FD3EA', art: '#1A6E8C', map: '#0A2A3E', ok: ['#0F3A3A', '#9FE1CB'], bad: ['#4A1A24', '#F7B4C0'], warn: '#FAC775', r: 20, font: 'Inter', dock: 'color' },
  { id: '19', name: 'Forêt Menthe', layout: 'dashboard', grad: ['#0B2A22', '#3C7A5A', 135], bg: '#0B2A22', card: '#071D17D9', card2: '#10302ACC', txt: '#EAF7F0', mut: '#A6CDB8', acc: '#3CBA92', wbg: '#071D17D9', wacc: '#9FE1CB', mbg: '#071D17D9', mtxt: '#9FE1CB', art: '#1D6B4E', map: '#0A221B', ok: ['#0F3A2C', '#9FE1CB'], bad: ['#4A1714', '#F7B4AE'], warn: '#F0C060', r: 22, font: 'Inter', dock: 'soft' },
  { id: '20', name: 'Titane', layout: 'carstatus', grad: ['#283048', '#859398', 135], bg: '#283048', card: '#1A1F2ED9', card2: '#2A3144CC', txt: '#F2F4F8', mut: '#B4BCCB', acc: '#8FB8EA', wbg: '#1A1F2ED9', wacc: '#B5D4F4', mbg: '#1A1F2ED9', mtxt: '#B5D4F4', art: '#3A4A6A', map: '#1E2436', ok: ['#1F3A2A', '#9FE1CB'], bad: ['#4A1A24', '#F7B4C0'], warn: '#F0C060', r: 18, font: 'Space Grotesk', dock: 'soft' },
  { id: '21', name: 'Racing Carbone', layout: 'gauges', grad: ['#000000', '#5A0A04', 160], bg: '#000000', card: '#0E0E10E6', card2: '#1C1C20CC', txt: '#FFFFFF', mut: '#A8A8AE', acc: '#FF2A1F', wbg: '#0E0E10E6', wacc: '#FF8A80', mbg: '#0E0E10E6', mtxt: '#B0B0B6', art: '#8B1A12', map: '#0E0E10', ok: ['#16300F', '#9FD36A'], bad: ['#5A120E', '#FFB4AE'], warn: '#FFB020', r: 6, font: 'Rajdhani', stripe: true, dock: 'mono' },
  { id: '22', name: 'Pêche Douce', layout: 'stack', grad: ['#FFE5E8', '#F3B2BE', 160], bg: '#FFE5E8', card: '#FFFFFFD9', card2: '#FCEFF1E6', txt: '#3A1E24', mut: '#8A6068', acc: '#E0566E', wbg: '#FFFFFFD9', wacc: '#B04A5E', mbg: '#3A1E24', mtxt: '#F3B2BE', art: '#B04A5E', map: '#F6E6E8', ok: ['#E2EFD3', '#2F5E0E'], bad: ['#FBE3E1', '#A32D2D'], warn: '#9A5B05', r: 26, font: 'Inter', dock: 'soft', light: true },
  { id: '23', name: 'Or Nuit', layout: 'speedhud', grad: ['#0B0A08', '#3A2A05', 160], bg: '#0B0A08', card: '#13110DD9', card2: '#1F1A10CC', txt: '#F3EBDD', mut: '#B8A88A', acc: '#D4AF37', wbg: '#13110DD9', wacc: '#E0C870', mbg: '#13110DD9', mtxt: '#C9B48A', art: '#5A4410', map: '#0F0E0B', ok: ['#26220F', '#E0C870'], bad: ['#3A1712', '#E8A598'], warn: '#E0C870', r: 6, font: 'Playfair Display', border: '#3A3020', dock: 'gold' },
  { id: '24', name: 'Aurore Boréale', layout: 'sidebar', grad: ['#04263A', '#0BA360', 135], bg: '#04263A', card: '#03182AD9', card2: '#0A2A3ACC', txt: '#E8FFF4', mut: '#9FD9C0', acc: '#3CEFA0', wbg: '#03182AD9', wacc: '#92FE9D', mbg: '#03182AD9', mtxt: '#92FE9D', art: '#0B6E5A', map: '#062030', ok: ['#0F3A2C', '#92FE9D'], bad: ['#4A1A24', '#F7B4C0'], warn: '#FFD166', r: 20, font: 'Inter', dock: 'color' },
  { id: '13', name: 'Glacier', layout: 'cockpit', bg: '#E8EEF4', card: '#FAFCFE', card2: '#EDF2F7', txt: '#0F2236', mut: '#5B6F84', acc: '#1F6FD1', wbg: '#FAFCFE', wacc: '#1F6FD1', mbg: '#0F2236', mtxt: '#B5D4F4', art: '#185FA5', map: '#DCE6EF', ok: ['#DCEFE6', '#0F6E56'], bad: ['#FBE3E1', '#A32D2D'], warn: '#8A5A0B', r: 22, font: 'Inter', border: '#D3DEE9', dock: 'soft', light: true }
];
// générateur de palettes pour les thèmes 25 à 44
function mixHex(a, b, t) { a = hex7(a).slice(1); b = hex7(b).slice(1); const c = [0, 2, 4].map((i) => Math.round(parseInt(a.substr(i, 2), 16) * (1 - t) + parseInt(b.substr(i, 2), 16) * t)); return '#' + c.map((x) => x.toString(16).padStart(2, '0')).join(''); }
function P(id, name, layout, o) {
  const light = !!o.light, txt = o.txt || (light ? '#1A1B1F' : '#F2F2F4'), bg = o.bg, card = o.card || (light ? mixHex(bg, '#FFFFFF', 0.7) : mixHex(bg, '#FFFFFF', 0.06));
  const glass = o.grad ? (light ? 'D9' : 'CC') : '';
  const t = { id, name, layout, bg, light, txt, acc: o.acc, card: card + glass, card2: mixHex(card, txt, light ? 0.06 : 0.08) + glass, mut: mixHex(txt, bg, 0.42),
    wbg: card + glass, wacc: o.wacc || mixHex(o.acc, txt, 0.3), mbg: (o.mbg || (light ? '#1E1F24' : card)) + (o.mbg || light ? '' : glass), mtxt: o.mtxt || mixHex(o.acc, '#FFFFFF', 0.4), art: mixHex(o.acc, '#000000', 0.45), map: o.map || mixHex(bg, light ? '#FFFFFF' : '#000000', 0.3),
    ok: light ? ['#E2EFD3', '#2F5E0E'] : ['#1F3A14', '#B6DD8C'], bad: light ? ['#FBE3E1', '#A32D2D'] : ['#4A1714', '#F7B4AE'], warn: light ? '#9A5B05' : '#F0B060',
    r: o.r ?? 20, font: o.font || 'Inter', dock: o.dock || 'color', border: o.border, grad: o.grad, stripe: o.stripe };
  return t;
}
THEMES.push(
  P('25', 'Bleu Lion', 'classic', { bg: '#0A1430', acc: '#2F7FE0', r: 22 }),
  P('26', 'Rouge Ultimate', 'speedhud', { bg: '#2A0006', grad: ['#3A0000', '#C0001A', 150], acc: '#FF4D4D', r: 18, font: 'Rajdhani' }),
  P('27', 'Gris Platinium', 'dashboard', { bg: '#E9EBEE', acc: '#3A4A6A', light: true, dock: 'dark', r: 18 }),
  P('28', 'Vert Fluo', 'gauges', { bg: '#0A0A0A', acc: '#B6FF3B', wacc: '#B6FF3B', font: 'Space Grotesk', dock: 'outline', r: 10, border: '#1E2A10' }),
  P('29', 'Lagon', 'stack', { bg: '#0083B0', grad: ['#00B4DB', '#00405C', 180], acc: '#FFFFFF', wacc: '#E6F7FF', r: 24 }),
  P('30', 'Lavande', 'split', { bg: '#EEE8F7', acc: '#7F77DD', light: true, mbg: '#2A2440', r: 26, dock: 'soft' }),
  P('31', 'Café Crème', 'minimal', { bg: '#F1E9DE', acc: '#8B5A2B', light: true, mbg: '#2E2218', font: 'Playfair Display', r: 10, dock: 'soft' }),
  P('32', 'Bordeaux Cuir', 'carcenter', { bg: '#2A0A12', acc: '#C9A227', wacc: '#E0C870', font: 'Playfair Display', r: 12, dock: 'gold', border: '#4A1A24' }),
  P('33', 'Arctique Nuit', 'sidebar', { bg: '#000428', grad: ['#000428', '#004E92', 135], acc: '#56CCF2', r: 20 }),
  P('34', 'Néon Vert', 'bento', { bg: '#050A05', acc: '#39FF14', wacc: '#39FF14', font: 'Orbitron', dock: 'outline', r: 12, border: '#123A12' }),
  P('35', 'Flamme', 'gauges', { bg: '#7A1A08', grad: ['#F12711', '#3A0A02', 160], acc: '#FFD166', r: 16, font: 'Rajdhani' }),
  P('36', 'Minuit Violet', 'musicfocus', { bg: '#0F0C29', grad: ['#0F0C29', '#302B63', 150], acc: '#FF6EC7', r: 24 }),
  P('37', 'Sable Doré', 'classic', { bg: '#F4ECE4', acc: '#C08A2E', light: true, mbg: '#2E2418', r: 24, dock: 'soft' }),
  P('38', 'Graphite Orange', 'cockpit', { bg: '#121212', acc: '#FF7A1A', font: 'Rajdhani', r: 14, border: '#26262A' }),
  P('39', 'Cerise', 'speedhud', { bg: '#7A1020', grad: ['#EB3349', '#3A0610', 160], acc: '#FFD1D8', wacc: '#FFD1D8', r: 22 }),
  P('40', 'Émeraude Luxe', 'minimal', { bg: '#021A12', acc: '#2ECC71', font: 'Playfair Display', r: 6, dock: 'gold', border: '#0E3A28' }),
  P('41', 'Ciel d\'été', 'floating', { bg: '#DCEAF7', acc: '#1F6FD1', light: true, card: '#FFFFFF', mbg: '#0F2236', r: 22 }),
  P('42', 'Monochrome', 'bento', { bg: '#000000', acc: '#FFFFFF', wacc: '#DDDDDD', mtxt: '#BBBBBB', dock: 'mono', r: 16, border: '#222222' }),
  P('43', 'Rétro Turbo', 'carcenter', { bg: '#3F2A8B', grad: ['#FC466B', '#3F5EFB', 135], acc: '#FFE14D', font: 'Orbitron', r: 18 }),
  P('44', 'Kaki Commando', 'carstatus', { bg: '#1E2416', acc: '#B5A642', font: 'Rajdhani', r: 8, dock: 'soft', border: '#2E361F' })
);
THEMES.push(
  Object.assign(P('45', 'Origine Bleu', 'origin', { bg: '#13235E', grad: ['#0E1C55', '#3566D8', 135], acc: '#E0312B', wacc: '#9FD3FF', card: '#1A2C78', r: 26, dock: 'glass' }), { streaks: true }),
  Object.assign(P('46', 'Origine Nuit', 'origin', { bg: '#070B1E', grad: ['#050814', '#1B2A6B', 150], acc: '#3FA9FF', card: '#111A40', r: 26, dock: 'glass' }), { streaks: true }),
  Object.assign(P('47', 'Origine Violet', 'origin', { bg: '#1E0E4A', grad: ['#160A3A', '#6A35D8', 135], acc: '#FF5AA8', card: '#2A1668', r: 26, dock: 'glass' }), { streaks: true }),
  Object.assign(P('48', 'Origine Rouge GT', 'origin', { bg: '#1A0508', grad: ['#120306', '#9E1622', 140], acc: '#FF3B2F', card: '#2A0A10', r: 26, dock: 'glass' }), { streaks: true }),
  Object.assign(P('49', 'Origine Ciel', 'origin', { bg: '#CFE3FA', grad: ['#EAF3FF', '#9CC6F5', 160], acc: '#1F6FD1', card: '#FFFFFF', light: true, mbg: '#0F2236', r: 26, dock: 'glass' }), { streaks: true })
);
const LAYOUT_NAMES = { origin: 'Origine', custom: 'Personnalisée', classic: 'Classique', split: 'Partagé', minimal: 'Minimal', floating: 'Carte plein écran', cockpit: 'Barre à gauche', bento: 'Tuiles', carcenter: 'Voiture au centre', speedhud: 'Vitesse + météo', gauges: 'Compteurs', sidebar: 'Colonne infos', musicfocus: 'Musique en grand', stack: 'Carte en haut', dashboard: 'Tableau de bord', carstatus: 'État de la voiture' };
const ACCENTS = ['#E0312B', '#FF2A1F', '#C2272D', '#FF5A4F', '#D4537E', '#FF2BD6', '#FF9EB4', '#FF7A1A', '#EF9F27', '#F0B060', '#FFD166', '#C9A227', '#9FD36A', '#639922', '#3B6D11', '#1D9E75', '#5DCAA5', '#22E5FF', '#56CCF2', '#2F7FE0', '#1F6FD1', '#185FA5', '#7F77DD', '#4A3FA8', '#8E2DE2', '#B4B2A9', '#FFFFFF', '#5F5E5A'];
const SOLIDS = ['#000000', '#0B0C0F', '#101216', '#14151A', '#1B1F2A', '#202124', '#1A0B2E', '#06182B', '#0B0A08', '#1E2A1E', '#2A1215', '#2B2B2B', '#ECEAE4', '#FFFFFF', '#E8EEF4', '#E6E9E1', '#F4ECE4', '#F3F0FA'];
const GRADIENTS = [
  ['Coucher de soleil', '#FF7E5F', '#FEB47B'], ['Lave', '#F12711', '#F5AF19'], ['Racing', '#000000', '#8E0E00'], ['Bordeaux', '#3D0A1A', '#8C1C3A'],
  ['Rose néon', '#FF0099', '#493240'], ['Synthwave', '#3A1C71', '#D76D77'], ['Améthyste', '#8E2DE2', '#4A00E0'], ['Cyber', '#12C2E9', '#F64F59'],
  ['Océan', '#2193B0', '#6DD5ED'], ['Ciel', '#56CCF2', '#2F80ED'], ['Nuit étoilée', '#0F2027', '#2C5364'], ['Titane', '#283048', '#859398'],
  ['Carbone', '#232526', '#414345'], ['Forêt', '#134E5E', '#71B280'], ['Menthe', '#0BA360', '#3CBA92'], ['Aurore', '#00C9FF', '#92FE9D'],
  ['Or', '#3A2A05', '#BF953F'], ['Glace', '#E0EAFC', '#CFDEF3'], ['Pêche', '#FFDDE1', '#EE9CA7'], ['Sable', '#E6DADA', '#C9B79C']
];

// ================= profils =================
const DEFAULT_PROFILES = ['Michael', 'Profil 2', 'Invité'];
const profiles = () => store.get('profiles', DEFAULT_PROFILES).map((n, i) => (n && n.trim()) || DEFAULT_PROFILES[i]);
const profIdx = () => Math.min(store.get('profile', 0), 2);
function themeIdFor(i) { const m = store.get('profileThemes', {}); return m[i] || '01'; }
function custom(i, tid) { return store.get(`custom_${i}_${tid}`, {}); }
function setCustom(patch) { const i = profIdx(), tid = themeIdFor(i); const c = Object.assign(custom(i, tid), patch); store.set(`custom_${i}_${tid}`, c); }
function isNight() { if (weather) return weather.day === 0; const h = new Date().getHours(); return h < 7 || h >= 19; }

// palette effective = thème du profil + couleurs perso
function palette() {
  const i = profIdx();
  let tid = themeIdFor(i);
  if (store.get('autoNight_' + i, false) && isNight()) tid = '03';
  const base = THEMES.find((t) => t.id === tid) || THEMES[0];
  const c = custom(i, base.id);
  const p = Object.assign({}, base);
  const lay = store.get('layout_' + i, ''); if (lay && LAYOUTS[lay]) p.layout = lay;
  if (c.acc) p.acc = c.acc;
  let bgColors = [base.bg];
  if (c.bgType === 'solid' && c.bg) { p.bgCss = c.bg; bgColors = [c.bg]; }
  else if (c.bgType === 'grad' && c.g1 && c.g2) { p.bgCss = `linear-gradient(${c.angle || 135}deg, ${c.g1}, ${c.g2})`; bgColors = [c.g1, c.g2]; }
  else if (base.grad) { p.bgCss = `linear-gradient(${base.grad[2]}deg, ${base.grad[0]}, ${base.grad[1]})`; bgColors = [base.grad[0], base.grad[1]]; }
  else p.bgCss = base.bg;
  if (c.glass) {
    const a = p.light ? 'D9' : 'B3';
    ['card', 'wbg', 'mbg'].forEach((k) => { p[k] = hex7(p[k]) + a; });
    p.card2 = hex7(p.card2) + (p.light ? 'E6' : 'CC');
  }
  const L = bgColors.reduce((s, x) => s + lum(x), 0) / bgColors.length;
  p.ontxt = L > 0.45 ? '#16171A' : '#F2F2F4';
  p.onmut = L > 0.45 ? '#55565C' : '#B4B5BC';
  p.onAcc = lum(p.acc) > 0.45 ? '#16171A' : '#FFFFFF';
  p.tid = base.id;
  return p;
}

// ================= icônes =================
const ICON = {
  nav: 'M12 2L19 21 12 17 5 21Z', music: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 1 1 6 0M20 16a3 3 0 1 1-6 0 3 3 0 1 1 6 0',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2', radio: 'M4 9h16v11H4zM8 9l9-5M13 13h4M13 16h4M7 14.5h2',
  cast: 'M4 4h16v12H4zM8 20h8M10 8l5 2-5 2z', car: 'M5 17H3v-5l2-5h14l2 5v5h-2M5 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0M15 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0M9 17h6M3 12h18',
  gear: 'M12 9a3 3 0 1 0 .01 0M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2', grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  home: 'M3 11l9-7 9 7M5 10v10h14V10', work: 'M4 8h16v12H4zM9 8V5h6v3', target: 'M12 3v3M12 18v3M3 12h3M18 12h3M12 8a4 4 0 1 0 .01 0'
};
const ic = (k, s = 24, c = 'currentColor', w = 2) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICON[k]}"/></svg>`;

// ================= briques d'interface =================
const card = (p, extra = '') => `background:${p.card};border-radius:${p.r}px;${p.border ? `border:1px solid ${p.border};` : ''}min-width:0;min-height:0;${extra}`;
const box = (p, extra = '') => `background:${p.card2};border-radius:${Math.max(4, p.r - 10)}px;min-width:0;${extra}`;
const TABS = [['home', 'Accueil'], ['trips', 'Trajets'], ['service', 'Entretien']];
let tab = 'home';

function R(p, tpl) { if (!p.noChrome) return tpl; return tpl.split(' ').filter((t, i, a) => !((i === 0 && (t === '44px' || t === '84px')) || (i === a.length - 1 && (t === '86px' || t === '76px')))).join(' ') || 'minmax(0,1fr)'; }
function header(p) {
  if (p.noChrome) return '';
  const list = profiles(), cur = profIdx();
  const tabs = TABS.map(([id, l]) => `<button data-act="tab:${id}" style="height:42px;padding:0 16px;border-radius:${Math.max(6, p.r - 10)}px;font-size:15px;font-weight:600;${tab === id ? `background:${p.acc};color:${p.onAcc}` : `color:${p.onmut}`}">${l}</button>`).join('');
  const prof = list.map((n, i) => `<button data-act="prof:${i}" style="border-radius:${Math.max(4, p.r - 12)}px;padding:7px 12px;font-size:14px;${i === cur ? `background:${p.ontxt};color:${hex7(p.ontxt) === '#16171A' ? '#fff' : '#16171A'};font-weight:600` : `background:${p.card2};color:${p.mut}`}">${esc(n)}</button>`).join('');
  return `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;color:${p.ontxt};height:44px">
  <div style="display:flex;align-items:center;gap:10px;min-width:0"><div data-k="avatar" style="width:40px;height:40px;flex:none;border-radius:50%;background:${p.acc};color:${p.onAcc};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:17px">M</div>
  <div data-k="hello" style="font-size:20px;font-weight:600;white-space:nowrap">Bonjour</div></div>
  <div style="display:flex;gap:4px;background:${p.card2};border-radius:${Math.max(8, p.r - 8)}px;padding:2px">${tabs}</div>
  <div style="display:flex;align-items:center;gap:6px">${prof}<div data-k="clock" style="font-size:23px;font-weight:600;margin-left:6px;min-width:64px;text-align:right">--:--</div>
  <button data-act="gear" aria-label="Réglages" style="width:42px;height:42px;border-radius:12px;background:${p.card2};color:${p.txt};display:flex;align-items:center;justify-content:center">${ic('gear', 22)}</button></div></div>`;
}

function mapCard(p, opts = {}) {
  const g = p.light ? '#FFFFFFEB' : '#0E1116E0', gt = p.light ? '#16171A' : '#F2F2F4';
  const btn = (k, t, act, blue) => `<button data-act="${act}" style="background:${blue ? '#1F6FD1' : g};color:${blue ? '#fff' : gt};border-radius:${Math.max(6, p.r - 8)}px;height:50px;padding:0 15px;display:flex;align-items:center;gap:9px;font-size:16px;font-weight:600">${ic(k, 21)}${t}</button>`;
  return `<div style="position:relative;overflow:hidden;background:${p.map};${opts.bleed ? '' : card(p, `background:${p.map};`)}${opts.style || ''}"><div class="mapslot" style="position:absolute;inset:0"></div>
  <div style="position:absolute;top:${opts.top || 14}px;left:14px;right:${opts.right || 14}px;display:flex;gap:10px;z-index:500">${btn('home', 'Maison', 'mHome')}${btn('work', 'Travail', 'mWork')}<div style="margin-left:auto">${btn('nav', esc(typeof navName === 'function' ? navName() : 'Waze'), 'mWaze', true)}</div></div>
  <div style="position:absolute;bottom:${opts.bottom || 14}px;left:14px;right:14px;display:flex;justify-content:space-between;align-items:flex-end;z-index:500;pointer-events:none">
  <div data-k="place" style="background:${g};color:${gt};border-radius:12px;padding:9px 14px;font-size:15px;max-width:70%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Recherche GPS…</div>
  <button data-act="recenter" data-show="recenter" style="pointer-events:auto;display:none;background:${g};color:${gt};border-radius:12px;height:46px;padding:0 14px;font-size:14px;font-weight:600">Recentrer</button></div></div>`;
}

function weatherC(p, mode = 'card', extra = '') {
  if (mode === 'mini') return `<div style="display:flex;align-items:center;gap:10px;${extra}"><span data-k="wIcon" data-size="34"></span><div><div data-k="wTemp" style="font-size:24px;font-weight:600;line-height:1">--°</div><div style="font-size:12px;color:${p.mut}"><span data-k="wCity">Météo</span> · <span data-k="wDesc">…</span></div></div></div>`;
  return `<div data-act="wxDetail" style="${card(p, `background:${p.wbg};padding:14px 16px;${extra}`)}">
  <div style="display:flex;justify-content:space-between;align-items:center"><div><div data-k="wCity" style="font-size:14px;color:${p.mut}">Météo</div><div data-k="wTemp" style="font-size:34px;font-weight:600;line-height:1.1">--°</div><div data-k="wDesc" style="font-size:13px;color:${p.wacc}">…</div></div><span data-k="wIcon" data-size="50"></span></div>
  ${mode === 'nohours' ? '' : `<div data-k="wHours" style="display:flex;justify-content:space-between;margin-top:8px;font-size:12px;color:${p.mut};text-align:center"></div>`}</div>`;
}

function coverC(p, size) {
  return `<button data-act="mArt" style="width:${size};${size === '100%' ? 'flex:1;min-height:70px' : `height:${size};flex:none`};border-radius:${Math.max(4, p.r - 8)}px;background:${p.art};position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center">
  <img data-img="mArt" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none">${ic('music', 30, '#ffffffaa', 1.8)}</button>`;
}
const playIcon = (playing) => playing ? '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M7 5h3v14H7zM14 5h3v14h-3z"/></svg>' : '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>';
const ctlC = (p, big = 54) => `<div style="display:flex;justify-content:space-around;align-items:center;color:#F2F2F4">
  <button data-act="mPrev" aria-label="Précédent" style="width:46px;height:46px;display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 5h2v14H6zM20 5l-10 7 10 7z"/></svg></button>
  <button data-act="mPlay" aria-label="Lecture" data-k="mPlayIcon" style="width:${big}px;height:${big}px;border-radius:50%;background:${p.acc};color:${p.onAcc};display:flex;align-items:center;justify-content:center">${playIcon(false)}</button>
  <button data-act="mNext" aria-label="Suivant" style="width:46px;height:46px;display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M16 5h2v14h-2zM4 5l10 7-10 7z"/></svg></button></div>`;
const barC = (p) => `<div style="height:4px;background:#ffffff26;border-radius:2px"><div data-k="mBar" style="width:0;height:4px;background:${p.acc};border-radius:2px"></div></div>`;
const accessC = () => `<button data-act="open:notif" data-show="mAccess" style="display:none;background:#7F77DD;color:#fff;border-radius:10px;padding:8px;font-size:13px;font-weight:600">Autoriser la musique</button>`;
const mText = (p, size = 17) => `<div style="min-width:0;white-space:nowrap;overflow:hidden"><div data-k="mApp" style="font-size:12px;color:${p.mtxt}">Musique</div><div data-k="mTitle" style="font-size:${size}px;font-weight:600;overflow:hidden;text-overflow:ellipsis">Aucune musique</div><div data-k="mArtist" style="font-size:13px;color:${p.mtxt};overflow:hidden;text-overflow:ellipsis">Lance Spotify ou YouTube Music</div></div>`;
function musicC(p, mode = 'tall', extra = '') {
  const t = '#F2F2F4';
  if (mode === 'row') return `<div style="${card(p, `background:${p.mbg};color:${t};padding:10px;display:flex;gap:12px;align-items:center;${extra}`)}">${coverC(p, '72px')}
  <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:5px">${mText(p, 16)}${barC(p)}${accessC()}</div><div style="width:150px;flex:none">${ctlC(p, 46)}</div></div>`;
  if (mode === 'tile') return `<div style="${card(p, `background:${p.mbg};color:${t};padding:12px 14px;display:flex;flex-direction:column;justify-content:space-between;gap:6px;${extra}`)}">
  <div style="display:flex;gap:12px;align-items:center;min-width:0">${coverC(p, '64px')}${mText(p, 16)}</div>${barC(p)}${accessC()}${ctlC(p, 46)}</div>`;
  return `<div style="${card(p, `background:${p.mbg};color:${t};padding:14px 16px;display:flex;flex-direction:column;justify-content:space-between;gap:8px;${extra}`)}">
  ${coverC(p, '100%')}${mText(p)}${accessC()}${barC(p)}${ctlC(p)}</div>`;
}

const CAR_ART = ` <defs> <linearGradient id="bodySide" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#ECEDEF"/><stop offset="1" stop-color="#C9CCD1"/></linearGradient> <linearGradient id="bodyFront" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FAFBFC"/><stop offset="1" stop-color="#D8DBE0"/></linearGradient> <linearGradient id="hood" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#E6E8EC"/><stop offset=".6" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F1F2F4"/></linearGradient> <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3A4250"/><stop offset=".5" stop-color="#1C2129"/><stop offset="1" stop-color="#0E1116"/></linearGradient> <linearGradient id="glassRefl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".22"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient> <linearGradient id="clad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A2C31"/><stop offset="1" stop-color="#121316"/></linearGradient> <radialGradient id="rim" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#0B0C0E"/><stop offset=".8" stop-color="#08090A"/><stop offset="1" stop-color="#1A1C20"/></radialGradient> <radialGradient id="shadow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient> <linearGradient id="lamp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9AA3AE"/><stop offset=".5" stop-color="#E8EDF3"/><stop offset="1" stop-color="#6E7782"/></linearGradient> <g id="spokes"><path d="M-.05 -.98 L.03 -.2 L-.09 -.2 Z M.1 -.97 L.11 -.2 L.01 -.2 Z"/></g> </defs> <g transform="translate(0 -38)"> <ellipse cx="520" cy="612" rx="490" ry="40" fill="url(#shadow)"/> <ellipse cx="128" cy="548" rx="34" ry="48" fill="#0C0D0F"/> <path d="M455 448 L470 388 Q478 372 500 368 L905 328 Q935 326 948 352 L962 420 Q966 448 950 470 L930 500 L520 548 Z" fill="url(#bodySide)"/> <path d="M486 424 L944 382" stroke="#B9BDC4" stroke-width="2.5" fill="none"/> <path d="M480 462 L948 418" stroke="#ffffff" stroke-width="3" stroke-opacity=".8" fill="none"/> <path d="M640 368 L652 520 M800 354 L808 506" stroke="#AEB2B9" stroke-width="2.2" fill="none"/> <path d="M705 410 h34 M860 396 h30" stroke="#9EA3AB" stroke-width="5" stroke-linecap="round"/> <path d="M574 362 L628 286 Q636 276 652 275 L858 270 Q876 270 886 284 L912 328 Z" fill="url(#glass)"/> <path d="M636 286 L700 284 L668 352 L600 358 Z" fill="url(#glassRefl)"/> <path d="M714 279 L722 280 L714 358 L704 359 Z" fill="#0B0C0E"/> <path d="M842 271 L852 271 L870 335 L860 336 Z" fill="#0B0C0E"/> <path d="M560 272 Q600 238 660 236 L860 238 Q890 240 904 262 L886 284 Q876 270 858 270 L652 275 Q636 276 628 286 Z" fill="#0F1013"/> <path d="M612 236 Q640 222 690 220 L868 224 Q888 226 896 240" stroke="#1E2024" stroke-width="9" fill="none" stroke-linecap="round"/> <path d="M612 236 Q640 222 690 220 L868 224 Q888 226 896 240" stroke="#5A5E66" stroke-width="2.5" fill="none" stroke-linecap="round"/> <path d="M640 226 v14 M870 226 v14" stroke="#1E2024" stroke-width="8" stroke-linecap="round"/> <path d="M840 238 L862 170" stroke="#2A2C31" stroke-width="3" stroke-linecap="round"/> <path d="M276 392 L452 300 Q500 272 560 272 L628 286 L574 362 L470 388 Q440 392 420 400 Z" fill="url(#glass)"/> <path d="M330 380 L470 300 L520 290 L380 388 Z" fill="url(#glassRefl)"/> <path d="M560 272 L574 362 L566 364 L548 276 Z" fill="#0B0C0E"/> <path d="M60 466 Q120 448 300 452 L462 444 L470 470 L300 476 Q150 480 60 470 Z" fill="#EEF0F2"/> <path d="M70 452 Q110 420 200 404 L276 392 L420 400 Q440 392 470 388 L455 448 Q300 458 168 470 Q110 474 70 452 Z" fill="url(#hood)" stroke="#F4F5F7" stroke-width="5" stroke-linejoin="round"/> <path d="M150 440 Q260 418 420 412" stroke="#C9CDD3" stroke-width="2" fill="none"/> <path d="M236 418 l8 6 M306 410 l8 6" stroke="#2A2C31" stroke-width="3" stroke-linecap="round"/> <path d="M60 462 Q70 452 110 456 Q220 470 455 448 L470 470 L478 560 L118 574 Q72 572 58 548 Z" fill="url(#bodyFront)"/> <path d="M300 474 Q380 462 456 448 L452 470 Q400 494 324 500 Q300 496 300 474 Z" fill="url(#lamp)"/> <path d="M330 492 Q392 484 446 466" stroke="#ffffff" stroke-width="3" fill="none"/> <path d="M318 498 Q380 498 440 478" stroke="#E0312B" stroke-width="1.5" stroke-opacity=".0" fill="none"/> <path d="M64 470 Q78 462 100 466 L104 482 Q86 488 66 484 Z" fill="url(#lamp)"/> <path d="M100 486 Q190 496 286 488 L280 548 Q190 556 112 552 Z" fill="#141518"/> <g stroke="#3A3E46" stroke-width="2.2" fill="none"><path d="M112 492 l14 30 l-14 30"/><path d="M134 492 l14 30 l-14 30"/><path d="M156 492 l14 30 l-14 30"/><path d="M178 492 l14 30 l-14 30"/><path d="M200 492 l14 30 l-14 30"/><path d="M222 492 l14 30 l-14 30"/><path d="M244 492 l14 30 l-14 30"/><path d="M266 492 l14 30 l-14 30"/></g> <path d="M100 486 Q190 496 286 488" stroke="#3A3D44" stroke-width="3" fill="none"/> <path d="M60 548 Q120 560 300 556 L478 548 L480 590 Q300 600 120 596 Q70 592 60 572 Z" fill="url(#clad)"/> <path d="M110 576 Q260 588 430 578 L436 592 Q260 604 112 592 Z" fill="#A7ACB4"/><path d="M116 580 Q260 591 428 582" stroke="#D6DAE0" stroke-width="2" fill="none"/> <ellipse cx="420" cy="566" rx="18" ry="10" fill="#2C2F35"/><ellipse cx="420" cy="566" rx="10" ry="6" fill="#C8CED6"/> <g transform="translate(118 556) rotate(-2)"> <rect x="0" y="0" width="150" height="34" rx="3" fill="#FFFFFF" stroke="#222" stroke-width="2"/> <rect x="0" y="0" width="16" height="34" rx="2" fill="#1F4FB5"/><rect x="134" y="0" width="16" height="34" rx="2" fill="#1F4FB5"/> <text x="8" y="30" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="10" font-weight="700" fill="#fff">F</text> <text x="75" y="25" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="21" font-weight="700" fill="#111" letter-spacing="1">EK-188-XR</text> </g> <path d="M450 444 L506 432 L560 438 L500 470 L486 560 L474 562 L466 470 Z" fill="url(#bodySide)"/> <path d="M470 540 L520 540 L930 492 L952 462 L958 488 L934 520 L524 572 L476 574 Z" fill="url(#clad)"/> <path d="M488 556 Q496 436 588 430 Q684 428 702 528 L680 536 Q664 462 590 458 Q520 464 512 558 Z" fill="#141518"/> <path d="M836 502 Q842 404 898 398 Q950 396 960 466 L944 474 Q934 422 900 424 Q860 430 856 504 Z" fill="#141518"/> <g transform="translate(592 544)"> <ellipse rx="76" ry="86" fill="#0C0D0F"/> <ellipse rx="50" ry="57" fill="url(#rim)"/> <g><path d="M-1.5 -13.9 L-8.9 -52.0" stroke="#26292F" stroke-width="7" stroke-linecap="round"/><path d="M-1.5 -13.9 L-8.9 -52.0" stroke="#545A64" stroke-width="1.6" stroke-linecap="round" transform="translate(-1.2 -1.2)"/><path d="M1.5 -13.9 L8.9 -52.0" stroke="#26292F" stroke-width="7" stroke-linecap="round"/><path d="M1.5 -13.9 L8.9 -52.0" stroke="#545A64" stroke-width="1.6" stroke-linecap="round" transform="translate(-1.2 -1.2)"/><path d="M11.1 -5.9 L40.2 -25.9" stroke="#26292F" stroke-width="7" stroke-linecap="round"/><path d="M11.1 -5.9 L40.2 -25.9" stroke="#545A64" stroke-width="1.6" stroke-linecap="round" transform="translate(-1.2 -1.2)"/><path d="M12.1 -2.7 L45.7 -6.3" stroke="#26292F" stroke-width="7" stroke-linecap="round"/><path d="M12.1 -2.7 L45.7 -6.3" stroke="#545A64" stroke-width="1.6" stroke-linecap="round" transform="translate(-1.2 -1.2)"/><path d="M8.4 10.2 L33.8 36.0" stroke="#26292F" stroke-width="7" stroke-linecap="round"/><path d="M8.4 10.2 L33.8 36.0" stroke="#545A64" stroke-width="1.6" stroke-linecap="round" transform="translate(-1.2 -1.2)"/><path d="M6.0 12.2 L19.3 48.1" stroke="#26292F" stroke-width="7" stroke-linecap="round"/><path d="M6.0 12.2 L19.3 48.1" stroke="#545A64" stroke-width="1.6" stroke-linecap="round" transform="translate(-1.2 -1.2)"/><path d="M-6.0 12.2 L-19.3 48.1" stroke="#26292F" stroke-width="7" stroke-linecap="round"/><path d="M-6.0 12.2 L-19.3 48.1" stroke="#545A64" stroke-width="1.6" stroke-linecap="round" transform="translate(-1.2 -1.2)"/><path d="M-8.4 10.2 L-33.8 36.0" stroke="#26292F" stroke-width="7" stroke-linecap="round"/><path d="M-8.4 10.2 L-33.8 36.0" stroke="#545A64" stroke-width="1.6" stroke-linecap="round" transform="translate(-1.2 -1.2)"/><path d="M-12.1 -2.7 L-45.7 -6.3" stroke="#26292F" stroke-width="7" stroke-linecap="round"/><path d="M-12.1 -2.7 L-45.7 -6.3" stroke="#545A64" stroke-width="1.6" stroke-linecap="round" transform="translate(-1.2 -1.2)"/><path d="M-11.1 -5.9 L-40.2 -25.9" stroke="#26292F" stroke-width="7" stroke-linecap="round"/><path d="M-11.1 -5.9 L-40.2 -25.9" stroke="#545A64" stroke-width="1.6" stroke-linecap="round" transform="translate(-1.2 -1.2)"/></g> <ellipse rx="50" ry="57" fill="none" stroke="#3A3E46" stroke-width="3"/><path d="M-30 -40 A50 57 0 0 1 20 -52" stroke="#8A9099" stroke-width="2" fill="none" opacity=".7"/> <ellipse rx="12" ry="14" fill="#202226" stroke="#5A5E66" stroke-width="2"/> </g> <g transform="translate(898 488)"> <ellipse rx="52" ry="68" fill="#0C0D0F"/> <ellipse rx="33" ry="45" fill="url(#rim)"/> <g><path d="M-0.9 -9.9 L-5.6 -40.2" stroke="#26292F" stroke-width="5" stroke-linecap="round"/><path d="M-0.9 -9.9 L-5.6 -40.2" stroke="#545A64" stroke-width="1.2" stroke-linecap="round" transform="translate(-1 -1)"/><path d="M0.9 -9.9 L5.6 -40.2" stroke="#26292F" stroke-width="5" stroke-linecap="round"/><path d="M0.9 -9.9 L5.6 -40.2" stroke="#545A64" stroke-width="1.2" stroke-linecap="round" transform="translate(-1 -1)"/><path d="M6.6 -4.2 L25.3 -20.0" stroke="#26292F" stroke-width="5" stroke-linecap="round"/><path d="M6.6 -4.2 L25.3 -20.0" stroke="#545A64" stroke-width="1.2" stroke-linecap="round" transform="translate(-1 -1)"/><path d="M7.2 -1.9 L28.8 -4.9" stroke="#26292F" stroke-width="5" stroke-linecap="round"/><path d="M7.2 -1.9 L28.8 -4.9" stroke="#545A64" stroke-width="1.2" stroke-linecap="round" transform="translate(-1 -1)"/><path d="M5.0 7.3 L21.3 27.9" stroke="#26292F" stroke-width="5" stroke-linecap="round"/><path d="M5.0 7.3 L21.3 27.9" stroke="#545A64" stroke-width="1.2" stroke-linecap="round" transform="translate(-1 -1)"/><path d="M3.6 8.7 L12.2 37.2" stroke="#26292F" stroke-width="5" stroke-linecap="round"/><path d="M3.6 8.7 L12.2 37.2" stroke="#545A64" stroke-width="1.2" stroke-linecap="round" transform="translate(-1 -1)"/><path d="M-3.6 8.7 L-12.2 37.2" stroke="#26292F" stroke-width="5" stroke-linecap="round"/><path d="M-3.6 8.7 L-12.2 37.2" stroke="#545A64" stroke-width="1.2" stroke-linecap="round" transform="translate(-1 -1)"/><path d="M-5.0 7.3 L-21.3 27.9" stroke="#26292F" stroke-width="5" stroke-linecap="round"/><path d="M-5.0 7.3 L-21.3 27.9" stroke="#545A64" stroke-width="1.2" stroke-linecap="round" transform="translate(-1 -1)"/><path d="M-7.2 -1.9 L-28.8 -4.9" stroke="#26292F" stroke-width="5" stroke-linecap="round"/><path d="M-7.2 -1.9 L-28.8 -4.9" stroke="#545A64" stroke-width="1.2" stroke-linecap="round" transform="translate(-1 -1)"/><path d="M-6.6 -4.2 L-25.3 -20.0" stroke="#26292F" stroke-width="5" stroke-linecap="round"/><path d="M-6.6 -4.2 L-25.3 -20.0" stroke="#545A64" stroke-width="1.2" stroke-linecap="round" transform="translate(-1 -1)"/></g> <ellipse rx="33" ry="45" fill="none" stroke="#4A4E56" stroke-width="2.5"/> <ellipse rx="9" ry="12" fill="#202226"/> </g> <path d="M548 380 Q532 356 560 350 L596 354 Q608 368 594 384 Z" fill="#0F1013"/> <path d="M590 372 L604 372" stroke="#0F1013" stroke-width="6"/> <path d="M552 378 Q570 384 594 380" stroke="#D6DAE0" stroke-width="2.5" fill="none" stroke-linecap="round"/> <path d="M940 356 L964 366 L968 412 L950 404 Z" fill="#5A0A08"/><path d="M946 366 L962 372 M947 380 L964 386 M948 394 L965 400" stroke="#FF3B2F" stroke-width="4" stroke-linecap="round"/> <path d="M600 430 h26" stroke="#E0312B" stroke-width="4" stroke-linecap="round"/> </g> `;
const CAR_PICS = { '3d': '3D (tourne au doigt)', avant: 'Studio 3/4 avant', face: 'Studio de face', rue: 'Rue, jantes noires', parking: 'Photo parking', dessin: 'Dessin' };
const CAR_SIZE = { avant: [886, 529], face: [702, 595], rue: [827, 451], parking: [645, 449] };
// roues visibles (centre x,y et rayons en px de l'image) : elles tournent quand la voiture roule
const CAR_WHEELS = { avant: [[511, 414, 43, 81], [842, 343, 28, 66]] };
function wheelsHtml(pick, src) {
  const R = CAR_SIZE[pick], Wl = CAR_WHEELS[pick]; if (!R || !Wl) return '';
  return Wl.map(([cx, cy, rx, ry]) => {
    const k = (ry / rx).toFixed(3), ik = (rx / ry).toFixed(3), pad = 0.12;
    const bw = 2 * rx * (1 + 2 * pad), bh = 2 * ry * (1 + 2 * pad);
    return `<div data-carv="main" style="position:absolute;left:${((cx - rx) / R[0] * 100).toFixed(3)}%;top:${((cy - ry) / R[1] * 100).toFixed(3)}%;width:${(2 * rx / R[0] * 100).toFixed(3)}%;height:${(2 * ry / R[1] * 100).toFixed(3)}%;border-radius:50%;overflow:hidden;transition:opacity .4s">`
      + `<div data-wheel style="position:absolute;left:${-pad * 100}%;top:${-pad * 100}%;width:${100 + 2 * pad * 100}%;height:${100 + 2 * pad * 100}%;background:url(${src}) no-repeat;background-size:${(R[0] / bw * 100).toFixed(3)}% ${(R[1] / bh * 100).toFixed(3)}%;background-position:${((cx - bw / 2) / (R[0] - bw) * 100).toFixed(3)}% ${((cy - bh / 2) / (R[1] - bh) * 100).toFixed(3)}%;--k:${k};--ik:${ik};animation:wspin 1s linear infinite paused;will-change:transform"></div></div>`;
  }).join('');
}
(function () { const st = document.createElement('style'); st.textContent = '@keyframes wspin{from{transform:scaleY(var(--k)) rotate(0deg) scaleY(var(--ik))}to{transform:scaleY(var(--k)) rotate(-360deg) scaleY(var(--ik))}}@keyframes cbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.2px)}}'; document.head.appendChild(st); })();
let wheelDur = '';
function carPick() { const c = store.get('carPick', ''); if (c && (CAR_PICS[c] || c === 'perso')) return c; return store.get('carImg', '') ? 'perso' : (window.Car3D && Car3D.supported() ? '3d' : 'avant'); }
function carSvg(p, w = '100%', fit = false) {
  let pick = carPick(); const img = store.get('carImg', '');
  if (pick === '3d') {
    const badge3 = `<div data-carbadge style="position:absolute;top:2%;left:50%;transform:translateX(-50%);display:none;background:#E0312B;color:#fff;border-radius:8px;padding:4px 10px;font:600 13px Inter,sans-serif;white-space:nowrap;box-shadow:0 2px 8px #0006;z-index:2;pointer-events:none"></div>`;
    if (window.Car3D && Car3D.state() !== 'fail') {
      const ph = `<img src="car/avant.webp" alt="Ma 2008" style="position:absolute;left:0;top:0;width:100%;height:100%;object-fit:contain;transition:opacity .4s;pointer-events:none">`;
      if (fit) return `<div data-carwrap style="position:relative;width:100%;height:100%"><div class="car3dslot" style="position:absolute;inset:0">${ph}</div>${badge3}</div>`;
      return `<div data-carwrap style="position:relative;width:${w};margin:0 auto"><div class="car3dslot" style="position:relative;width:100%;aspect-ratio:16/9">${ph}</div>${badge3}</div>`;
    }
    pick = 'avant';
  }
  const fx = 'filter:drop-shadow(0 8px 10px #0008);transition:opacity .4s';
  if ((pick === 'perso' && img) || (pick !== 'dessin' && pick !== 'perso' && pick !== '3d')) {
    const main = pick === 'perso' ? img : `car/${pick}.webp`;
    const badge = `<div data-carbadge style="position:absolute;top:2%;left:50%;transform:translateX(-50%);display:none;background:#E0312B;color:#fff;border-radius:8px;padding:4px 10px;font:600 13px Inter,sans-serif;white-space:nowrap;box-shadow:0 2px 8px #0006;z-index:2"></div>`;
    const abs = 'position:absolute;left:0;top:0;width:100%;height:100%;object-fit:contain;';
    const R = CAR_SIZE[pick];
    if (fit && !R) return `<div data-carwrap style="position:relative;width:100%;height:100%"><img data-carv="main" src="${main}" alt="Ma 2008" style="${abs}${fx}"><img data-carv="rear" src="car/arriere.webp" alt="" style="${abs}${fx};opacity:0">${badge}</div>`;
    const ww = fit ? `width:min(100cqw, calc(100cqh * ${R[0]} / ${R[1]}))` : `width:${w}`;
    return `<div data-carwrap style="position:relative;${ww};margin:0 auto"><div data-carbody style="position:relative">${`<img data-carv="main" src="${main}" alt="Ma 2008" style="display:block;width:100%;${fx}">`}${wheelsHtml(pick, main)}</div><img data-carv="rear" src="car/arriere.webp" alt="" style="${abs}${fx};opacity:0">${badge}</div>`;
  }
  if (!store.get('oldCar', false)) return `<svg viewBox="0 50 1000 560" style="width:${w};height:auto;display:block" role="img" aria-label="Ma 2008, plaque EK-188-XR">${CAR_ART}</svg>`;
  const sh = p.light ? '#00000022' : '#000', st = p.light ? 'stroke="#CFCAC0" stroke-width="1.5"' : '';
  return `<svg viewBox="0 0 440 200" style="width:${w};height:auto;display:block" role="img" aria-label="Ma 2008, plaque EK-188-XR"><ellipse cx="230" cy="186" rx="205" ry="12" fill="${sh}"/><ellipse cx="44" cy="160" rx="12" ry="20" fill="#0B0B0B"/>
  <path ${st} d="M170 156L170 104L206 78L398 78Q420 84 422 114L422 150Z" fill="#E9E7E1"/><path ${st} d="M30 160L26 116Q30 100 52 96L170 104L170 156Z" fill="#F4F2EC"/>
  <path data-door="bonnet" d="M52 96L170 104L206 78L96 72Z" fill="#FBFAF7"/><path d="M96 72L206 78L246 50L156 46Z" fill="#2A2D35"/><path d="M156 46L246 50L254 40L170 36Z" fill="#0B0B0B"/><path d="M246 50L372 52L366 42L254 40Z" fill="#0B0B0B"/>
  <path d="M212 76L246 52L370 54Q388 58 396 76Z" fill="#23262D"/><path data-door="f" d="M212 80L300 79L300 140L212 146Z" fill="#E0312B" opacity=".85" style="display:none"/><path data-door="r" d="M302 79L398 80L404 112L392 140L302 140Z" fill="#E0312B" opacity=".85" style="display:none"/>
  <path d="M300 53L300 140" stroke="#0B0B0B" stroke-width="3"/><path d="M370 54Q388 58 396 76L384 76L366 56Z" fill="#0B0B0B"/><path d="M206 80L194 74L188 83L204 87Z" fill="#0B0B0B"/>
  <path d="M170 144L422 140L422 152L170 158Z" fill="#1A1B1F"/><path d="M28 150L170 152L170 160L30 163Z" fill="#1A1B1F"/>
  <ellipse cx="214" cy="152" rx="30" ry="33" fill="#1A1B1F"/><ellipse cx="214" cy="156" rx="25" ry="30" fill="#0B0B0B"/><ellipse cx="214" cy="156" rx="14" ry="18" fill="#1E1F24"/>
  <ellipse cx="370" cy="148" rx="27" ry="30" fill="#1A1B1F"/><ellipse cx="370" cy="152" rx="22" ry="27" fill="#0B0B0B"/><ellipse cx="370" cy="152" rx="12" ry="16" fill="#1E1F24"/>
  <path data-door="trunk" d="M398 80Q420 86 422 114L412 112L404 82Z" fill="#E0312B" style="display:none"/>
  <path d="M410 92L422 96L422 108L412 106Z" fill="#E0312B"/><path d="M34 112L64 110L66 118L36 121Z" fill="#D7DCE3"/><path d="M136 108L166 110L166 118L138 117Z" fill="#D7DCE3"/><path d="M72 120L130 121L128 138L74 137Z" fill="#15161A"/>
  <rect x="62" y="140" width="76" height="17" rx="2" fill="#fff" stroke="#111"/><rect x="62" y="140" width="8" height="17" fill="#1F4FB5"/><rect x="130" y="140" width="8" height="17" fill="#1F4FB5"/>
  <text x="100" y="152.5" text-anchor="middle" font-family="Inter" font-size="11.5" font-weight="700" fill="#111">EK-188-XR</text></svg>`;
}
const limitSign = (s = 44) => `<div data-show="limit" style="width:${s}px;height:${s}px;flex:none;border-radius:50%;border:${Math.round(s / 11)}px solid #E0312B;background:#fff;color:#14151A;display:none;align-items:center;justify-content:center;font-weight:700;font-size:${Math.round(s * 0.38)}px;font-family:Inter"><span data-k="limit">50</span></div>`;
function speedC(p, size = 48) {
  return `<div><div style="display:flex;align-items:baseline;gap:6px"><span data-k="speed" style="font-size:${size}px;font-weight:700;line-height:1">--</span><span style="font-size:14px;color:${p.mut}">km/h</span><span data-k="speedSrc" style="font-size:11px;color:${p.mut}"></span></div>
  <div data-show="over" style="display:none;margin-top:4px;background:#B3261E;color:#fff;border-radius:8px;padding:3px 9px;font-size:13px;font-weight:600"><span data-k="over"></span></div></div>`;
}
function gaugePath(v, max) { const a = Math.max(0, Math.min(1, v / max)), ang = Math.PI * (1 - a); return `M10 62A50 50 0 0 1 ${(60 + 50 * Math.cos(ang)).toFixed(1)} ${(62 - 50 * Math.sin(ang)).toFixed(1)}`; }
function gaugeC(p, key, max, unit, color, size = 130) {
  return `<div style="text-align:center;width:${size}px"><svg viewBox="0 0 120 72" width="${size}"><path d="M10 62A50 50 0 0 1 110 62" stroke="${p.card2}" stroke-width="10" fill="none" stroke-linecap="round"/><path data-g="${key}" data-max="${max}" d="M10 62A50 50 0 0 1 10 62" stroke="${color}" stroke-width="10" fill="none" stroke-linecap="round"/></svg>
  <div data-k="${key}" style="font-size:${Math.round(size / 4.3)}px;font-weight:700;margin-top:-${Math.round(size / 3.4)}px">--</div><div style="font-size:11px;color:${p.mut}">${unit}</div></div>`;
}
const statsC = (p, extra = '') => `<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;text-align:center;${extra}">
  ${[['avg', 'L/100', 'conso moy.'], ['inst', 'L/100', 'instantanée'], ['range', 'km', 'autonomie']].map(([k, u, l]) => `<div style="${box(p, 'padding:6px')}"><b data-k="${k}" style="font-size:19px">—</b> <span style="font-size:11px;color:${p.mut}">${u}</span><div style="font-size:11px;color:${p.mut}">${l}</div></div>`).join('')}</div>`;
const alertsC = (p) => (store.get('showAlerts', false) ? `<div data-k="alerts" style="display:flex;gap:6px;flex-wrap:wrap"></div>` : '');
const tripC = (p, extra = '', small = false) => `<div style="${box(p, `padding:8px 12px;${extra}`)}"><div style="display:flex;justify-content:space-between;font-size:12px;color:${p.mut};margin-bottom:5px"><span>Trajet en cours</span><span data-k="tSince"></span></div>
  <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));text-align:center;white-space:nowrap">${[['tDur', 'durée'], ['tKm', 'distance'], ['tCons', 'L/100 km'], ['tCost', 'coût']].map(([k, l], i) => `<div><b data-k="${k}" style="font-size:${small ? 14 : 16}px;display:block;${i === 3 ? `color:${p.warn}` : ''}">—</b><span style="font-size:11px;color:${p.mut}">${l}</span></div>`).join('')}</div></div>`;
const serviceC = (p, extra = '') => `<button data-act="tab:service" style="${box(p, `padding:8px 12px;text-align:left;display:block;width:100%;${extra}`)}"><div style="font-size:12px;color:${p.mut}">Entretien</div><div data-k="eText" style="font-size:13px;font-weight:600;color:${p.warn};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Touchez pour régler</div>
  <div style="height:5px;background:${p.light ? '#00000014' : '#ffffff1a'};border-radius:3px;margin-top:5px"><div data-k="eBar" style="width:0;height:5px;background:#EF9F27;border-radius:3px"></div></div><div data-k="eCt" style="font-size:11px;color:${p.mut};margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div></button>`;
const stationC = (p, extra = '') => `<div style="${box(p, `padding:8px 8px 8px 12px;display:flex;flex-direction:column;justify-content:space-between;gap:4px;${extra}`)}"><div data-k="stName" style="font-size:12px;color:${p.mut};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Station la moins chère</div>
  <div style="display:flex;justify-content:space-between;align-items:center;gap:6px"><div style="min-width:0"><div data-k="stFuel" style="font-size:11px;color:${p.mut}">SP95-E10</div><div data-k="stPrice" style="font-size:16px;font-weight:600;color:${p.ok[1]};white-space:nowrap">…</div></div><button data-act="stGo" style="background:#1F6FD1;color:#fff;border-radius:10px;height:42px;padding:0 12px;font-size:14px;font-weight:600;flex:none">Y aller</button></div></div>`;
const carTitle = (p) => `<div style="display:flex;justify-content:space-between;align-items:center"><div style="font-size:18px;font-weight:600">2008 <span style="color:${p.acc}">GT Line</span></div>${store.get('showAlerts', false) ? '<span data-k="badge"></span>' : ''}</div>`;

const DOCK = [
  { id: 'gps', label: 'GPS', bg: '#1F6FD1', icon: 'nav', pk: 'com.waze,com.google.android.apps.maps', re: /waze|maps|navi|gps/i },
  { id: 'music', label: 'Musique', bg: '#C2272D', icon: 'music', pk: 'com.spotify.music,com.google.android.apps.youtube.music,com.qf.musicplayer', re: /spotify|music|musique/i },
  { id: 'phone', label: 'Téléphone', bg: '#2E8B3E', icon: 'phone', pk: 'com.qf.bluetooth', re: /bluetooth|t[ée]l[ée]phone|phone/i },
  { id: 'radio', label: 'Radio', bg: '#C46A12', icon: 'radio', pk: 'com.qf.radio,com.android.fmradio', re: /radio|\bfm\b/i },
  { id: 'carplay', label: 'CarPlay / AA', bg: '#13866A', icon: 'cast', pk: 'com.zjinnova.zlink', re: /zlink|carplay|android auto|carlink/i },
  { id: 'car', label: 'Ma voiture', bg: '#4A3FA8', icon: 'car', pk: 'com.qf.vehicle', re: /carapp|vehicle|voiture|automobile/i },
  { id: 'settings', label: 'Réglages', bg: '#3E3F46', icon: 'gear', pk: 'com.qf.carsettings,com.android.settings', re: /r[ée]glage|setting|param[eè]tre/i },
  { id: 'apps', label: 'Applis', bg: '#2A2B31', icon: 'grid', special: 'drawer' }
];
function dockC(p, vertical = false) {
  if (p.noChrome) return '';
  const items = DOCK.map((d) => {
    let st;
    if (p.dock === 'color') st = `background:${d.bg};color:#fff`;
    else if (p.dock === 'dark') st = 'background:#16171A;color:#fff';
    else if (p.dock === 'soft') st = `background:${p.card2};color:${p.acc}`;
    else if (p.dock === 'outline') st = `border:1.5px solid ${p.acc};color:${p.wacc}`;
    else if (p.dock === 'gold') st = `border:1px solid ${p.acc};color:${p.acc}`;
    else if (p.dock === 'glass') st = `background:#ffffff14;color:${p.txt}`;
    else st = `color:${p.mut}`;
    const s = vertical ? 54 : 50;
    return `<button data-act="dock:${d.id}" aria-label="${d.label}" style="display:flex;flex-direction:column;align-items:center;gap:5px;font-size:12px;color:${p.txt};${vertical ? '' : 'min-width:90px'}"><span style="width:${s}px;height:${s}px;border-radius:${Math.max(6, p.r - 8)}px;display:flex;align-items:center;justify-content:center;${st}">${ic(d.icon, 26)}</span>${vertical ? '' : `<span>${d.label}</span>`}</button>`;
  }).join('');
  return `<div style="${card(p, `display:flex;${vertical ? 'flex-direction:column;padding:10px 0' : 'padding:0 10px'};justify-content:space-around;align-items:center`)}">${items}</div>`;
}

// ----- briques infos voiture supplémentaires -----
const tempInline = (p, size = 30, fs = 22) => `<span style="display:inline-flex;align-items:center;gap:6px"><span data-k="wIcon" data-size="${size}"></span><span data-k="wTemp" style="font-size:${fs}px;font-weight:600">--°</span></span>`;
function speedHero(p, size = 100) {
  return `<div style="display:flex;align-items:center;justify-content:space-between;gap:14px"><div><div data-k="speed" style="font-size:${size}px;font-weight:700;line-height:.85">--</div><div style="font-size:14px;color:${p.mut};margin-top:4px">km/h <span data-k="speedSrc"></span></div>
  <div data-show="over" style="display:none;margin-top:6px;background:#B3261E;color:#fff;border-radius:8px;padding:3px 9px;font-size:13px;font-weight:600"><span data-k="over"></span></div></div>
  <div style="display:flex;flex-direction:column;gap:10px;align-items:center">${limitSign(Math.round(size * 0.55))}${tempInline(p, 28, 20)}</div></div>`;
}
const TANK = 50;
const fuelC = (p, extra = '') => `<div style="${box(p, `padding:8px 12px;${extra}`)}"><div style="display:flex;justify-content:space-between;align-items:baseline;font-size:12px;color:${p.mut}"><span>Carburant</span><span><b data-k="fuelL" style="color:${p.txt};font-size:16px">—</b> L · <b data-k="range" style="color:${p.txt}">—</b> km</span></div>
  <div style="height:8px;background:${p.light ? '#00000014' : '#ffffff1a'};border-radius:4px;margin-top:6px"><div data-k="fuelBar" style="width:0;height:8px;background:${p.ok[1]};border-radius:4px"></div></div></div>`;
const IND = [['lo', 'Feux'], ['hi', 'Pleins phares'], ['fogF', 'Antibrouillard AV'], ['fogR', 'Antibrouillard AR'], ['turnL', '◀ Clignotant'], ['turnR', 'Clignotant ▶'], ['hazard', 'Warning'], ['lock', 'Verrouillée'], ['win', 'Vitre ouverte'], ['sun', 'Toit ouvrant'], ['belt', 'Ceinture'], ['hb', 'Frein à main']];
const indC = (p, keys) => `<div style="display:flex;flex-wrap:wrap;gap:5px">${IND.filter(([k]) => !keys || keys.includes(k)).map(([k, l]) => `<span data-ind="${k}" style="border-radius:8px;padding:4px 8px;font-size:12px;font-weight:600;background:${p.card2};color:${p.mut};opacity:.55">${l}</span>`).join('')}</div>`;
const tcC = (p, extra = '') => `<div style="${box(p, `padding:8px 12px;${extra}`)}"><div style="font-size:12px;color:${p.mut};margin-bottom:4px">Ordinateur de bord</div><div style="display:grid;grid-template-columns:auto 1fr 1fr 1fr;gap:3px 10px;font-size:13px;align-items:center;white-space:nowrap">
  <span></span><span style="color:${p.mut};font-size:11px">km</span><span style="color:${p.mut};font-size:11px">km/h moy.</span><span style="color:${p.mut};font-size:11px">L/100</span>
  <b>Trajet 1</b><span data-k="t1Km">—</span><span data-k="t1Spd">—</span><span data-k="avg">—</span><b>Trajet 2</b><span data-k="t2Km">—</span><span data-k="t2Spd">—</span><span data-k="avg2">—</span></div></div>`;
const infoRowC = (p, extra = '') => `<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;text-align:center;${extra}">${[['odo', 'compteur km'], ['rpm', 'tr/min'], ['heading', 'cap'], ['alt', 'altitude m']].map(([k, l]) => `<div style="${box(p, 'padding:6px')}"><b data-k="${k}" style="font-size:16px;white-space:nowrap">—</b><div style="font-size:11px;color:${p.mut}">${l}</div></div>`).join('')}</div>`;
function heroRoad(p) {
  const light = p.light;
  return `<div style="${card(p, `position:relative;overflow:hidden;padding:14px 18px;background:linear-gradient(180deg, ${hex7(p.card)}, ${mixHex(p.card, p.acc, 0.25)})`)}">
  <svg viewBox="0 0 600 300" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">
    <path d="M0 150 L40 150 L40 110 L70 110 L70 130 L100 130 L100 90 L130 90 L130 140 L170 140 L170 120 L200 120 L200 150 L400 150 L400 125 L430 125 L430 95 L455 95 L455 135 L490 135 L490 105 L520 105 L520 140 L560 140 L560 118 L600 118 L600 150 Z" fill="${light ? '#00000010' : '#ffffff10'}"/>
    <path d="M300 150 L80 300 L520 300 Z" fill="${light ? '#00000014' : '#00000040'}"/>
    <path d="M300 150 L170 300 M300 150 L430 300" stroke="${light ? '#ffffffcc' : '#ffffff55'}" stroke-width="3"/>
    <path d="M300 160 L296 190 M300 205 L294 245 M300 260 L292 300" stroke="${p.acc}" stroke-width="4"/>
    <path d="M300 150 L60 300" stroke="${p.acc}" stroke-opacity=".45" stroke-width="10"/><path d="M300 150 L540 300" stroke="${p.acc}" stroke-opacity=".45" stroke-width="10"/></svg>
  <div style="position:relative;display:flex;justify-content:space-between;align-items:flex-start;height:100%">
    <div><div style="display:flex;align-items:baseline;gap:8px"><span data-k="speed" style="font-size:64px;font-weight:700;line-height:.9">--</span><span style="font-size:15px;color:${p.mut}">km/h</span></div><div data-show="over" style="display:none;margin-top:6px;background:#B3261E;color:#fff;border-radius:8px;padding:3px 9px;font-size:13px;font-weight:600"><span data-k="over"></span></div><div style="margin-top:8px">${limitSign(42)}</div></div>
    <div style="position:absolute;left:50%;bottom:-6px;transform:translateX(-50%);width:46%">${carSvg(p)}</div>
    <div style="text-align:right"><div style="display:flex;align-items:center;gap:8px;justify-content:flex-end"><span data-k="wIcon" data-size="40"></span><span data-k="wTemp" style="font-size:40px;font-weight:600">--°</span></div><div data-k="wCity" style="font-size:15px;color:${p.mut}">Météo</div><div data-k="wDesc" style="font-size:13px;color:${p.wacc}"></div></div>
  </div></div>`;
}
const SHORTCUTS = ['radio', 'settings', 'music', 'carplay', 'car', 'phone'];
function appsCard(p) {
  return `<div style="${card(p, 'padding:12px 14px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;align-content:center')}">${SHORTCUTS.map((id) => { const d = DOCK.find((x) => x.id === id); return `<button data-act="dock:${id}" style="display:flex;flex-direction:column;align-items:center;gap:6px;font-size:12px;color:${p.txt}"><span data-appicon="${id}" style="width:52px;height:52px;border-radius:14px;background:${d.bg};color:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden">${ic(d.icon, 26)}</span><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%">${d.label}</span></button>`; }).join('')}</div>`;
}
const fullCard = (p, extra = '') => card(p, `padding:12px 14px;display:flex;flex-direction:column;gap:8px;${extra}`);

// ================= dispositions de l'accueil =================
const sideBox = (p) => `background:${p.card};${p.border ? `border:1px solid ${p.border};` : ''}`;
const LAYOUTS = {
  classic: (p) => `<div style="display:grid;grid-template-rows:${R(p, '44px minmax(0,1fr) 86px')};gap:12px;height:100%">${header(p)}
    <div style="display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,.85fr) minmax(0,1.3fr);gap:12px;min-height:0">${mapCard(p)}
      <div style="display:grid;grid-template-rows:auto minmax(0,1fr);gap:12px;min-height:0">${weatherC(p)}${musicC(p)}</div>
      <div style="${card(p, 'padding:12px 16px;display:flex;flex-direction:column;gap:6px')}">${carTitle(p)}
        <div style="position:relative"><div style="position:absolute;top:0;left:0;z-index:1">${speedC(p)}</div><div style="position:absolute;top:2px;right:0">${limitSign()}</div><div style="${store.get('carView', 'road') === 'road' ? 'padding-top:58px' : 'padding-top:12px;padding-left:12%'}">${carSvg(p)}</div></div>
        ${statsC(p)}${alertsC(p)}${tripC(p)}<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6px">${serviceC(p)}${stationC(p)}</div></div></div>${dockC(p)}</div>`,

  split: (p) => `<div style="display:grid;grid-template-rows:${R(p, '44px minmax(0,1fr) 86px')};gap:12px;height:100%">${header(p)}
    <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;min-height:0">${mapCard(p)}
      <div style="display:grid;grid-template-rows:auto auto minmax(0,1fr);gap:12px;min-height:0">
        <div style="${card(p, 'padding:8px 16px;display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:center')}">${carSvg(p, '82%')}
          <div style="display:flex;flex-direction:column;gap:8px">${carTitle(p)}<div style="display:flex;justify-content:space-between;align-items:center">${speedC(p, 46)}${limitSign(48)}</div>${alertsC(p)}</div></div>
        <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:12px">${weatherC(p, 'nohours', 'padding:10px 14px')}${musicC(p, 'row')}</div>
        <div style="${card(p, 'padding:10px 12px;display:grid;grid-template-rows:auto auto 1fr;gap:6px')}">${statsC(p)}${tripC(p)}<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px">${serviceC(p)}${stationC(p)}</div></div></div></div>${dockC(p)}</div>`,

  minimal: (p) => `<div style="display:grid;grid-template-rows:${R(p, '44px minmax(0,1fr)')};gap:12px;height:100%">${header(p)}
    <div style="display:grid;grid-template-columns:minmax(0,1.7fr) 430px;gap:14px;min-height:0">
    <div style="display:grid;grid-template-rows:${R(p, 'minmax(0,1fr) 76px')};gap:12px;min-height:0">${mapCard(p)}${dockC(p)}</div>
    <div style="display:flex;flex-direction:column;gap:10px;min-height:0">
      <div style="${card(p, 'padding:6px 18px;display:flex;justify-content:space-between;align-items:center')}"><div><div data-k="clock" style="font-size:42px;font-weight:300;line-height:1">--:--</div><div data-k="dateTxt" style="font-size:13px;color:${p.mut};margin-top:4px"></div></div>${weatherC(p, 'mini')}</div>
      <div style="${card(p, 'padding:10px 16px;display:flex;flex-direction:column;gap:6px')}">${carTitle(p)}<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center"><div style="display:flex;align-items:center;gap:12px">${speedC(p, 48)}${limitSign(46)}</div>${carSvg(p)}</div>${alertsC(p)}${statsC(p)}</div>
      ${musicC(p, 'row', 'padding:6px 10px')}
      <div style="display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.35fr) minmax(0,.75fr);gap:8px;flex:1;min-height:0">${serviceC(p)}${stationC(p)}<button data-act="tab:trips" style="${box(p, 'padding:8px 12px;text-align:left')}"><div style="font-size:12px;color:${p.mut}">Trajet</div><b data-k="tKm" style="font-size:16px;display:block">—</b><span style="font-size:12px;color:${p.mut}"><span data-k="tDur">—</span> · <span data-k="tCost">—</span></span></button></div></div></div></div>`,

  floating: (p) => `<div style="position:absolute;inset:0">${mapCard(p, { bleed: true, style: 'position:absolute;inset:0', top: 72, bottom: 214, right: 440 })}
    <div style="position:absolute;top:10px;left:16px;right:16px;${card(p, 'padding:4px 10px')}">${header(p)}</div>
    <div style="position:absolute;top:80px;right:16px;width:410px;bottom:112px;${card(p, 'padding:12px 16px;display:flex;flex-direction:column;gap:7px')}">${carTitle(p)}
      <div style="position:relative"><div style="position:absolute;top:0;left:0;z-index:1">${speedC(p, 46)}</div><div style="position:absolute;top:0;right:0;z-index:1">${limitSign(42)}</div><div style="padding:12px 0 0 14%">${carSvg(p)}</div></div>${statsC(p)}${alertsC(p)}${tripC(p)}<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6px">${serviceC(p)}${stationC(p)}</div></div>
    <div style="position:absolute;top:144px;left:16px;width:280px">${weatherC(p)}</div>
    <div style="position:absolute;bottom:112px;left:16px;width:520px">${musicC(p, 'row')}</div>
    <div style="position:absolute;bottom:12px;left:16px;right:16px;height:88px;display:grid">${dockC(p)}</div></div>`,

  cockpit: (p) => `<div style="display:grid;grid-template-columns:${R(p, '84px minmax(0,1fr)')};gap:12px;height:100%">${dockC(p, true)}
    <div style="display:grid;grid-template-rows:${R(p, '44px minmax(0,1fr) auto')};gap:12px;min-height:0">${header(p)}
      <div style="display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:12px;min-height:0">${mapCard(p)}
        <div style="${card(p, 'padding:14px 16px;display:flex;flex-direction:column;gap:8px')}"><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-size:18px;font-weight:600">Ma 2008 <span style="color:${p.acc}">GT Line</span></div><div style="display:flex;gap:8px;align-items:center">${weatherC(p, 'mini')}<span data-k="badge"></span></div></div>
          <div style="display:flex;justify-content:space-between;align-items:flex-end">${gaugeC(p, 'speed', 180, 'km/h', p.acc, 140)}<div style="display:flex;flex-direction:column;align-items:center;gap:4px">${limitSign(54)}<div data-show="over" style="display:none;background:#B3261E;color:#fff;border-radius:8px;padding:3px 8px;font-size:12px;font-weight:600"><span data-k="over"></span></div></div>${gaugeC(p, 'inst', 15, 'L/100 instant.', '#EF9F27', 120)}</div>
          <div style="padding:0 6%">${carSvg(p)}</div>${statsC(p)}${alertsC(p)}</div></div>
      <div style="display:grid;grid-template-columns:1.8fr 1.5fr 1fr 1.1fr;gap:10px">${musicC(p, 'row')}${tripC(p, sideBox(p), true)}${serviceC(p, sideBox(p))}${stationC(p, sideBox(p))}</div></div></div>`,

  bento: (p) => `<div style="display:grid;grid-template-rows:${R(p, '44px minmax(0,1fr) 86px')};gap:12px;height:100%">${header(p)}
    <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:repeat(3,minmax(0,1fr));gap:12px;min-height:0">
      ${mapCard(p, { style: 'grid-column:span 2;grid-row:span 3' })}
      <div style="${card(p, 'grid-row:span 2;padding:12px 16px;display:flex;flex-direction:column;gap:8px;justify-content:space-between')}">${carTitle(p)}<div style="display:flex;justify-content:space-between;align-items:center">${speedC(p, 46)}${limitSign(46)}</div>${carSvg(p)}${statsC(p)}${alertsC(p)}</div>
      ${weatherC(p, 'card', 'display:flex;flex-direction:column;justify-content:space-between')}
      ${musicC(p, 'tile')}
      <div style="${card(p, 'padding:10px;display:flex;flex-direction:column')}">${tripC(p, 'flex:1;display:flex;flex-direction:column;justify-content:center', true)}</div>
      <div style="${card(p, 'padding:10px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:8px')}">${serviceC(p)}${stationC(p)}</div></div>${dockC(p)}</div>`,

  carcenter: (p) => `<div style="display:grid;grid-template-rows:${R(p, '44px minmax(0,1fr) 112px 86px')};gap:12px;height:100%">${header(p)}
    <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr) minmax(0,.8fr);gap:12px;min-height:0">${mapCard(p)}
      <div style="${card(p, `padding:14px 18px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden${p.stripe ? `;background:repeating-linear-gradient(135deg,${p.card} 0 10px,${p.card2} 10px 11px)` : ''}`)}">${carTitle(p)}
        <div style="display:flex;justify-content:center;align-items:center;gap:22px"><div style="text-align:center"><div data-k="speed" style="font-size:80px;font-weight:700;line-height:.9">--</div><div style="font-size:15px;color:${p.mut}">km/h <span data-k="speedSrc"></span></div><div data-show="over" style="display:none;margin-top:4px;background:#B3261E;color:#fff;border-radius:8px;padding:3px 9px;font-size:13px;font-weight:600"><span data-k="over"></span></div></div>${limitSign(70)}</div>
        <div style="padding:0 14%">${carSvg(p)}</div>${statsC(p)}</div>
      <div style="display:grid;grid-template-rows:auto minmax(0,1fr);gap:12px;min-height:0">${weatherC(p)}${musicC(p)}</div></div>
    <div style="display:grid;grid-template-columns:1.2fr 1.6fr 1fr 1fr;gap:12px">
      <div style="${card(p, 'padding:12px 14px;display:flex;flex-direction:column;justify-content:center;gap:8px')}"><div style="font-size:12px;color:${p.mut}">Alertes voiture</div>${alertsC(p)}</div>
      ${tripC(p, `${sideBox(p)}display:flex;flex-direction:column;justify-content:center`)}${serviceC(p, sideBox(p))}${stationC(p, sideBox(p))}</div>${dockC(p)}</div>`
};

Object.assign(LAYOUTS, {
  speedhud: (p) => `<div style="display:grid;grid-template-rows:${R(p, '44px minmax(0,1fr) 86px')};gap:12px;height:100%">${header(p)}
    <div style="display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:12px;min-height:0">${mapCard(p)}
      <div style="display:grid;grid-template-rows:auto auto auto minmax(0,1fr);gap:10px;min-height:0">
        <div style="${card(p, 'padding:12px 18px')}">${speedHero(p, 92)}</div>
        <div style="${card(p, 'padding:10px 14px;display:grid;grid-template-columns:.9fr 1.1fr;gap:12px;align-items:center')}">${carSvg(p)}<div style="display:flex;flex-direction:column;gap:6px">${carTitle(p)}${alertsC(p)}<div style="font-size:12px;color:${p.mut}">Trajet : <b data-k="tKm" style="color:${p.txt}">—</b> · <b data-k="tDur" style="color:${p.txt}">—</b> · <b data-k="tCost" style="color:${p.warn}">—</b></div></div></div>
        ${musicC(p, 'row')}
        <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px">${fuelC(p, sideBox(p) + 'display:flex;flex-direction:column;justify-content:center')}${stationC(p, sideBox(p))}</div></div></div>${dockC(p)}</div>`,

  gauges: (p) => `<div style="display:grid;grid-template-rows:${R(p, '44px auto minmax(0,1fr) 86px')};gap:12px;height:100%">${header(p)}
    <div style="display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr;gap:12px">
      <div style="${card(p, `padding:10px 14px;display:flex;align-items:center;justify-content:space-between${p.stripe ? `;background:repeating-linear-gradient(135deg,${p.card} 0 10px,${p.card2} 10px 11px)` : ''}`)}">${gaugeC(p, 'speed', 180, 'km/h', p.acc, 150)}<div style="display:flex;flex-direction:column;gap:8px;align-items:center">${limitSign(48)}${tempInline(p, 26, 18)}</div></div>
      <div style="${card(p, 'padding:10px;display:flex;justify-content:center;align-items:center')}">${gaugeC(p, 'rpm', 6000, 'tr/min', '#EF9F27', 150)}</div>
      <div style="${card(p, 'padding:10px;display:flex;justify-content:center;align-items:center')}">${gaugeC(p, 'fuelL', TANK, 'litres restants', '#5DCAA5', 150)}</div>
      <div style="${card(p, 'padding:10px;display:flex;justify-content:center;align-items:center')}">${gaugeC(p, 'inst', 15, 'L/100 instant.', p.wacc, 150)}</div></div>
    <div style="display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr) minmax(0,.9fr);gap:12px;min-height:0">${mapCard(p)}
      <div style="${fullCard(p)}">${carTitle(p)}<div style="padding:0 10%">${carSvg(p)}</div>${statsC(p)}${alertsC(p)}</div>
      <div style="display:grid;grid-template-rows:minmax(0,1fr) auto;gap:12px;min-height:0">${musicC(p, 'tile')}<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px">${serviceC(p, sideBox(p))}${stationC(p, sideBox(p))}</div></div></div>${dockC(p)}</div>`,

  sidebar: (p) => `<div style="display:grid;grid-template-rows:${R(p, '44px minmax(0,1fr) 86px')};gap:12px;height:100%">${header(p)}
    <div style="display:grid;grid-template-columns:minmax(0,1fr) 400px;gap:12px;min-height:0">
      <div style="position:relative;min-height:0">${mapCard(p, { style: 'position:absolute;inset:0', bottom: 112 })}<div style="position:absolute;left:14px;right:14px;bottom:14px;z-index:600">${musicC(p, 'row')}</div></div>
      <div style="${fullCard(p, 'gap:7px')}">
        ${speedHero(p, 78)}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center">${carSvg(p)}<div style="display:flex;flex-direction:column;gap:6px">${carTitle(p).replace('font-size:18px', 'font-size:15px')}${alertsC(p)}</div></div>
        ${fuelC(p)}${tcC(p)}<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:6px">${serviceC(p)}${stationC(p)}</div></div></div>${dockC(p)}</div>`,

  musicfocus: (p) => `<div style="display:grid;grid-template-rows:${R(p, '44px minmax(0,1fr) 86px')};gap:12px;height:100%">${header(p)}
    <div style="display:grid;grid-template-columns:minmax(0,.95fr) minmax(0,1.15fr) minmax(0,1fr);gap:12px;min-height:0">
      <div style="${card(p, `background:${p.mbg};color:#F2F2F4;padding:16px;display:flex;flex-direction:column;gap:10px`)}">${coverC(p, '100%')}${mText(p, 22)}${accessC()}${barC(p)}${ctlC(p, 64)}</div>
      ${mapCard(p)}
      <div style="${fullCard(p, 'gap:7px')}"><div style="display:flex;justify-content:space-between;align-items:center">${speedC(p, 56)}<div style="display:flex;flex-direction:column;align-items:center;gap:6px">${limitSign(46)}${tempInline(p, 24, 17)}</div></div>
        ${carSvg(p)}${statsC(p)}${alertsC(p)}${fuelC(p)}<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:6px">${serviceC(p)}${stationC(p)}</div></div></div>${dockC(p)}</div>`,

  stack: (p) => `<div style="display:grid;grid-template-rows:${R(p, '44px minmax(0,1fr) 170px 86px')};gap:12px;height:100%">${header(p)}${mapCard(p)}
    <div style="display:grid;grid-template-columns:1.05fr 1.1fr 1.25fr 1fr 1fr;gap:12px;min-height:0">
      <div style="${card(p, 'padding:12px 14px;display:flex;flex-direction:column;justify-content:center')}">${speedHero(p, 72)}</div>
      <div style="${fullCard(p, 'gap:4px;justify-content:space-between')}">${carTitle(p).replace('font-size:18px', 'font-size:15px')}${carSvg(p, '82%')}${alertsC(p)}</div>
      ${musicC(p, 'tile')}
      <div style="${fullCard(p, 'padding:10px;gap:6px;justify-content:space-between')}">${fuelC(p)}<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;text-align:center"><div style="${box(p, 'padding:5px')}"><b data-k="avg" style="font-size:16px">—</b><div style="font-size:11px;color:${p.mut}">L/100 moy.</div></div><div style="${box(p, 'padding:5px')}"><b data-k="tKm" style="font-size:16px">—</b><div style="font-size:11px;color:${p.mut}">trajet</div></div></div></div>
      <div style="${fullCard(p, 'padding:10px;gap:6px')}">${serviceC(p)}${stationC(p, 'flex:1')}</div></div>${dockC(p)}</div>`,

  dashboard: (p) => `<div style="display:grid;grid-template-rows:${R(p, '44px minmax(0,1fr) 86px')};gap:12px;height:100%">${header(p)}
    <div style="display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1.25fr) minmax(0,.8fr);gap:12px;min-height:0">
      <div style="${fullCard(p, 'gap:8px')}">${speedHero(p, 80)}${tcC(p)}${infoRowC(p)}${fuelC(p)}${tripC(p, '', true)}</div>
      ${mapCard(p)}
      <div style="display:grid;grid-template-rows:minmax(0,1fr) auto;gap:12px;min-height:0">${musicC(p)}<div style="${fullCard(p, 'gap:6px')}">${carSvg(p)}${alertsC(p)}${stationC(p)}</div></div></div>${dockC(p)}</div>`,

  carstatus: (p) => `<div style="display:grid;grid-template-rows:${R(p, '44px minmax(0,1fr) 86px')};gap:12px;height:100%">${header(p)}
    <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr) minmax(0,.85fr);gap:12px;min-height:0">${mapCard(p)}
      <div style="${fullCard(p, 'gap:8px')}">${carTitle(p)}<div style="padding:0 8%">${carSvg(p)}</div>${indC(p)}${alertsC(p)}${infoRowC(p)}${tcC(p)}</div>
      <div style="display:grid;grid-template-rows:auto auto minmax(0,1fr);gap:12px;min-height:0"><div style="${card(p, 'padding:12px 14px')}">${speedHero(p, 70)}</div>${fuelC(p, sideBox(p))}${musicC(p, 'tile')}</div></div>${dockC(p)}</div>`
});

LAYOUTS.origin = (p) => `<div style="display:grid;grid-template-columns:${R(p, '84px minmax(0,1fr)')};gap:12px;height:100%">${dockC(p, true)}
  <div style="display:grid;grid-template-rows:${R(p, '44px minmax(0,1fr)')};gap:12px;min-height:0">${header(p)}
    <div style="display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:12px;min-height:0">
      <div style="display:grid;grid-template-rows:minmax(0,1.1fr) minmax(0,1fr);gap:12px;min-height:0">${heroRoad(p)}
        <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;min-height:0">${musicC(p, 'tile')}${appsCard(p)}</div></div>
      ${mapCard(p)}</div></div></div>`;

// ----- disposition personnalisée (déplaçable) -----
const BLOCKS = {
  map: { n: 'Carte', grow: true, r: (p) => mapCard(p) },
  road: { n: 'Vitesse + voiture + météo', r: (p) => heroRoad(p).replace('position:relative;overflow:hidden;', 'position:relative;overflow:hidden;min-height:230px;') },
  speed: { n: 'Vitesse + météo', r: (p) => `<div style="${card(p, 'padding:12px 16px')}">${speedHero(p, 80)}</div>` },
  weather: { n: 'Météo', r: (p) => weatherC(p) },
  music: { n: 'Musique (grande)', grow: true, r: (p) => musicC(p) },
  musicRow: { n: 'Musique (bandeau)', r: (p) => musicC(p, 'row') },
  car: { n: 'Ma voiture', r: (p) => `<div style="${fullCard(p, 'gap:6px')}">${carTitle(p)}${carSvg(p)}${statsC(p)}${alertsC(p)}</div>` },
  fuel: { n: 'Carburant', r: (p) => `<div style="${card(p, 'padding:8px')}">${fuelC(p)}</div>` },
  trip: { n: 'Trajet', r: (p) => `<div style="${card(p, 'padding:8px')}">${tripC(p)}</div>` },
  service: { n: 'Entretien', r: (p) => `<div style="${card(p, 'padding:8px')}">${serviceC(p)}</div>` },
  station: { n: 'Station la moins chère', r: (p) => `<div style="${card(p, 'padding:8px')}">${stationC(p)}</div>` },
  computer: { n: 'Ordinateur de bord', r: (p) => `<div style="${card(p, 'padding:8px')}">${tcC(p)}</div>` },
  indicators: { n: 'Voyants', r: (p) => `<div style="${card(p, 'padding:10px')}">${indC(p)}</div>` },
  info: { n: 'Compteur, régime, cap', r: (p) => `<div style="${card(p, 'padding:8px')}">${infoRowC(p)}</div>` },
  apps: { n: 'Raccourcis', r: (p) => appsCard(p) }
};
const DEFAULT_COMPOSE = { cols: [{ w: 1.5, b: ['map'] }, { w: 0.9, b: ['weather', 'music'] }, { w: 1.2, b: ['speed', 'car', 'station'] }] };
let editing = false, cmpAddCol = null;
let editBar;
const compose = () => store.get('compose_' + profIdx(), DEFAULT_COMPOSE);
editBar = function (p) {
  const c = compose();
  const b = (act, t, pri) => `<button data-act="${act}" style="height:40px;padding:0 12px;border-radius:10px;font-size:14px;font-weight:600;${pri ? `background:${p.acc};color:${p.onAcc}` : `background:${p.card2};color:${p.txt}`}">${t}</button>`;
  return `<div style="display:flex;align-items:center;gap:8px;height:44px;color:${p.ontxt}"><b style="font-size:16px;margin-right:6px">Mode édition</b>${c.cols.map((col, i) => `<span style="display:flex;align-items:center;gap:4px;background:${p.card2};border-radius:10px;padding:2px 4px 2px 10px;font-size:13px;color:${p.txt}">Col. ${i + 1}${b(`cmp:w:${i}:-1`, '−')}${b(`cmp:w:${i}:1`, '+')}</span>`).join('')}
    ${c.cols.length < 4 ? b('cmp:addcol', '+ Colonne') : ''}${c.cols.length > 1 ? b('cmp:delcol', '− Colonne') : ''}<span style="flex:1"></span>${b('cmp:reset', 'Par défaut')}${b('cmp:done', 'Terminer', true)}</div>`;
};
LAYOUTS.custom = (p) => {
  const c = compose(); let mapUsed = false;
  const tb = (act, t) => `<button data-act="${act}" style="width:46px;height:46px;border-radius:12px;background:#ffffffee;color:#16171A;font-size:20px;font-weight:700">${t}</button>`;
  const cols = c.cols.map((col, ci) => `<div style="display:flex;flex-direction:column;gap:12px;min-height:0;min-width:0">${col.b.map((id, bi) => {
    const B = BLOCKS[id]; if (!B || (id === 'map' && mapUsed)) return ''; if (id === 'map') mapUsed = true;
    const ed = editing ? `<div style="position:absolute;inset:0;z-index:700;background:#000000a6;border:2px dashed ${p.acc};border-radius:${p.r}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px"><b style="color:#fff;font-size:15px">${B.n}</b><div style="display:flex;gap:6px">${tb(`cmp:mv:${ci}:${bi}:l`, '◀')}${tb(`cmp:mv:${ci}:${bi}:u`, '▲')}${tb(`cmp:mv:${ci}:${bi}:d`, '▼')}${tb(`cmp:mv:${ci}:${bi}:r`, '▶')}${tb(`cmp:del:${ci}:${bi}`, '✕')}</div></div>` : '';
    return `<div style="position:relative;min-width:0;${B.grow ? 'flex:1;min-height:0;display:grid' : 'flex:none'}">${B.r(p)}${ed}</div>`;
  }).join('')}${editing ? `<button data-act="cmp:pick:${ci}" style="flex:none;height:48px;border-radius:12px;border:2px dashed ${p.acc};color:${p.ontxt};font-size:15px;font-weight:600">+ Ajouter un bloc</button>` : ''}</div>`).join('');
  const picker = editing && cmpAddCol != null ? `<div style="position:absolute;inset:60px 120px;z-index:900;${card(p, 'padding:16px;display:flex;flex-direction:column;gap:10px')};background:${hex7(p.card)}"><div style="display:flex;justify-content:space-between;align-items:center;font-size:17px;font-weight:600">Ajouter dans la colonne ${cmpAddCol + 1}<button data-act="cmp:pick:x" style="height:42px;padding:0 14px;border-radius:10px;background:${p.card2}">Annuler</button></div><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">${Object.entries(BLOCKS).filter(([k]) => k !== 'map' || !c.cols.some((x) => x.b.includes('map'))).map(([k, B]) => `<button data-act="cmp:add:${cmpAddCol}:${k}" style="height:52px;border-radius:12px;background:${p.card2};color:${p.txt};font-size:15px;font-weight:600">${B.n}</button>`).join('')}</div></div>` : '';
  return `<div style="position:relative;display:grid;grid-template-rows:${R(p, '44px minmax(0,1fr) 86px')};gap:12px;height:100%">${header(p)}<div style="display:grid;grid-template-columns:${c.cols.map((x) => `minmax(0,${x.w}fr)`).join(' ')};gap:12px;min-height:0">${cols}</div>${dockC(p)}${picker}</div>`;
};
function cmpAct(parts) {
  const c = JSON.parse(JSON.stringify(compose())); const [op, a, b, d] = parts;
  if (op === 'done') { editing = false; cmpAddCol = null; }
  else if (op === 'reset') { store.set('compose_' + profIdx(), DEFAULT_COMPOSE); return render(); }
  else if (op === 'w') { const col = c.cols[+a]; col.w = Math.max(0.5, Math.min(3, Math.round((col.w + (+b) * 0.2) * 10) / 10)); }
  else if (op === 'addcol') c.cols.push({ w: 1, b: [] });
  else if (op === 'delcol') { const last = c.cols.pop(); c.cols[c.cols.length - 1].b.push(...last.b); }
  else if (op === 'del') c.cols[+a].b.splice(+b, 1);
  else if (op === 'pick') cmpAddCol = a === 'x' ? null : +a;
  else if (op === 'add') { c.cols[+a].b.push(b); cmpAddCol = null; }
  else if (op === 'mv') {
    const ci = +a, bi = +b, col = c.cols[ci], id = col.b[bi];
    if (d === 'u' && bi > 0) [col.b[bi - 1], col.b[bi]] = [col.b[bi], col.b[bi - 1]];
    if (d === 'd' && bi < col.b.length - 1) [col.b[bi + 1], col.b[bi]] = [col.b[bi], col.b[bi + 1]];
    if ((d === 'l' && ci > 0) || (d === 'r' && ci < c.cols.length - 1)) { col.b.splice(bi, 1); c.cols[ci + (d === 'l' ? -1 : 1)].b.push(id); }
  }
  store.set('compose_' + profIdx(), c); render();
}

// ================= GRILLE 6 x 4 (tailles, déplacement, groupes à points) =================
const GW = 6, GH = 4;
const carFit = (p) => `<div style="flex:1;min-height:0;display:flex;align-items:center;justify-content:center;container-type:size;width:100%">${carSvg(p, '100%', true).replace('width:100%;height:auto', 'height:100%;width:auto;max-width:100%;max-height:100%')}</div>`;
const GBLOCKS = {
  map: { n: 'Carte', r: (p) => mapCard(p) },
  carfull: { n: 'Vitesse + ma voiture', r: (p, w, h) => `<div style="${fullCard(p, 'gap:6px;justify-content:space-between')}">${carTitle(p)}<div style="display:flex;align-items:center;justify-content:space-between;gap:8px">${speedC(p, h >= 2 ? 52 : 40)}${limitSign(h >= 2 ? 46 : 36)}</div>${carFit(p)}${h >= 2 ? statsC(p) + alertsC(p) : ''}</div>` },
  road: { n: 'Route + vitesse + météo', r: (p) => heroRoad(p) },
  speed: { n: 'Vitesse + météo', r: (p, w, h) => `<div style="${card(p, 'padding:12px 16px;display:flex;flex-direction:column;justify-content:center')}">${speedHero(p, h >= 2 ? 96 : w >= 2 ? 70 : 52)}</div>` },
  car: { n: 'Ma voiture', r: (p, w, h) => `<div style="${fullCard(p, 'gap:6px;justify-content:space-between')}">${carTitle(p)}${carFit(p)}${h >= 2 ? statsC(p) : ''}${alertsC(p)}</div>` },
  weather: { n: 'Météo', r: (p, w, h) => weatherC(p, w * h >= 2 ? 'card' : 'nohours', 'display:flex;flex-direction:column;justify-content:center') },
  music: { n: 'Musique', r: (p, w, h) => (h >= 2 && w <= 2 ? musicC(p) : w >= 2 ? musicC(p, 'row') : musicC(p, 'tile')) },
  fuel: { n: 'Carburant', r: (p) => `<div style="${card(p, 'padding:10px;display:flex;flex-direction:column;justify-content:center')}">${fuelC(p)}</div>` },
  trip: { n: 'Trajet', r: (p, w) => `<div style="${card(p, 'padding:8px;display:flex;flex-direction:column;justify-content:center')}">${w >= 2 ? tripC(p) : tripC(p, '', true).replace('repeat(4,', 'repeat(2,')}</div>` },
  service: { n: 'Entretien', r: (p) => `<div style="${card(p, 'padding:8px;display:flex;flex-direction:column;justify-content:center')}">${serviceC(p)}</div>` },
  station: { n: 'Station la moins chère', r: (p) => `<div style="${card(p, 'padding:8px;display:flex;flex-direction:column;justify-content:center')}">${stationC(p)}</div>` },
  computer: { n: 'Ordinateur de bord', r: (p) => `<div style="${card(p, 'padding:8px;display:flex;flex-direction:column;justify-content:center')}">${tcC(p)}</div>` },
  indicators: { n: 'Voyants', r: (p) => `<div style="${card(p, 'padding:10px;display:flex;flex-direction:column;justify-content:center')}">${indC(p)}</div>` },
  info: { n: 'Compteur, régime, cap, altitude', r: (p) => `<div style="${card(p, 'padding:8px;display:flex;flex-direction:column;justify-content:center')}">${infoRowC(p)}</div>` },
  alerts: { n: 'Alertes', r: (p) => `<div style="${card(p, 'padding:10px 12px;display:flex;flex-direction:column;justify-content:center;gap:6px')}"><div style="font-size:12px;color:${p.mut}">Alertes voiture</div>${alertsC(p)}</div>` },
  apps: { n: 'Raccourcis', r: (p) => appsCard(p) },
  clock: { n: 'Horloge', r: (p) => `<div style="${card(p, 'padding:10px 16px;display:flex;flex-direction:column;justify-content:center')}"><div data-k="clock" style="font-size:52px;font-weight:300;line-height:1">--:--</div><div data-k="dateTxt" style="font-size:14px;color:${p.mut};margin-top:4px"></div></div>` }
};
const DEFAULT_GRID = { items: [
  { b: ['map'], x: 0, y: 0, w: 3, h: 4 },
  { b: ['weather'], x: 3, y: 0, w: 1, h: 1 },
  { b: ['music'], x: 3, y: 1, w: 1, h: 3 },
  { b: ['carfull'], x: 4, y: 0, w: 2, h: 2 },
  { b: ['station', 'service', 'trip', 'computer'], x: 4, y: 2, w: 2, h: 1 },
  { b: ['fuel', 'info'], x: 4, y: 3, w: 2, h: 1 }
] };
const gridCfg = () => store.get('grid_' + profIdx(), DEFAULT_GRID);
let gSel = null, gPick = null, stackIdx = {};
const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
function freeSpot(items, w, h) { for (let y = 0; y <= GH - h; y++) for (let x = 0; x <= GW - w; x++) { const r = { x, y, w, h }; if (!items.some((it) => overlap(it, r))) return r; } return null; }
LAYOUTS.custom = (p) => {
  const g = gridCfg(); let mapUsed = false;
  const cells = editing ? Array.from({ length: GW * GH }, (_, k) => `<div style="grid-column:${(k % GW) + 1};grid-row:${Math.floor(k / GW) + 1};border:2px dashed ${p.light ? '#0003' : '#fff3'};border-radius:${p.r}px"></div>`).join('') : '';
  const items = g.items.map((it, i) => {
    const n = it.b.length, cur = Math.min(stackIdx[i] || 0, n - 1), id = it.b[cur], B = GBLOCKS[id];
    if (!B) return '';
    let inner;
    if (id === 'map') { if (mapUsed) inner = `<div style="${card(p)}"></div>`; else { mapUsed = true; inner = B.r(p, it.w, it.h); } } else inner = B.r(p, it.w, it.h);
    const dots = n > 1 ? `<div style="position:absolute;left:50%;bottom:4px;transform:translateX(-50%);display:flex;gap:6px;z-index:600">${it.b.map((_, j) => `<button data-act="stk:${i}:${j}" aria-label="Élément ${j + 1}" style="width:${j === cur ? 18 : 8}px;height:8px;border-radius:4px;background:${j === cur ? p.acc : (p.light ? '#0004' : '#fff6')}"></button>`).join('')}</div>` : '';
    const sel = editing ? `<div data-act="gsel:${i}" style="position:absolute;inset:0;z-index:700;border-radius:${p.r}px;background:${gSel === i ? '#00000059' : '#00000026'};border:${gSel === i ? `3px solid ${p.acc}` : `2px dashed ${p.acc}`};display:flex;align-items:center;justify-content:center"><span style="background:#000c;color:#fff;border-radius:8px;padding:4px 10px;font-size:13px;font-weight:600">${it.b.map((x) => GBLOCKS[x] ? GBLOCKS[x].n : x).join(' · ')}${n > 1 ? ' (groupe)' : ''} · ${it.w}×${it.h}</span></div>` : '';
    return `<div ${n > 1 && !editing ? `data-stack="${i}"` : ''} ${!editing && id !== 'map' ? `data-gi="${i}"` : ''} style="grid-column:${it.x + 1} / span ${it.w};grid-row:${it.y + 1} / span ${it.h};position:relative;min-width:0;min-height:0;display:grid;overflow:hidden;border-radius:${p.r}px">${inner}${dots}${sel}</div>`;
  }).join('');
  const picker = editing && gPick ? `<div style="position:absolute;inset:40px 100px;z-index:900;${card(p, 'padding:16px;display:flex;flex-direction:column;gap:10px')};background:${hex7(p.card)}"><div style="display:flex;justify-content:space-between;align-items:center;font-size:17px;font-weight:600">${gPick === 'new' ? 'Nouveau bloc' : 'Ajouter dans le groupe (les points permettront de glisser)'}<button data-act="g:pickx" style="height:42px;padding:0 14px;border-radius:10px;background:${p.card2};color:${p.txt}">Annuler</button></div><div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px">${Object.entries(GBLOCKS).filter(([k]) => k !== 'map' || !g.items.some((x) => x.b.includes('map'))).map(([k, B]) => `<button data-act="g:add:${k}" style="height:52px;border-radius:12px;background:${p.card2};color:${p.txt};font-size:14px;font-weight:600">${B.n}</button>`).join('')}</div></div>` : '';
  return `<div style="position:relative;display:grid;grid-template-rows:${R(p, '44px minmax(0,1fr) 86px')};gap:12px;height:100%">${header(p)}<div style="position:relative;display:grid;grid-template-columns:repeat(${GW},minmax(0,1fr));grid-template-rows:repeat(${GH},minmax(0,1fr));gap:12px;min-height:0">${cells}${items}</div>${dockC(p)}${picker}</div>`;
};
editBar = function (p) {
  const b = (act, t, pri, title) => `<button data-act="${act}" ${title ? `aria-label="${title}"` : ''} style="height:40px;min-width:40px;padding:0 10px;border-radius:10px;font-size:14px;font-weight:600;${pri ? `background:${p.acc};color:${p.onAcc}` : `background:${p.card2};color:${p.txt}`}">${t}</button>`;
  const g = gridCfg(), it = gSel != null ? g.items[gSel] : null;
  const tools = it ? `${b('g:mv:l', '◀', 0, 'Gauche')}${b('g:mv:u', '▲', 0, 'Haut')}${b('g:mv:d', '▼', 0, 'Bas')}${b('g:mv:r', '▶', 0, 'Droite')}<span style="width:6px"></span>${b('g:w:-1', 'Largeur −')}${b('g:w:1', 'Largeur +')}${b('g:h:-1', 'Hauteur −')}${b('g:h:1', 'Hauteur +')}<span style="width:6px"></span>${b('g:group', '+ Grouper')}${b('g:del', 'Retirer')}`
    : `<span style="font-size:14px;color:${p.onmut}">Touche un bloc pour le modifier</span>`;
  return `<div style="display:flex;align-items:center;gap:6px;height:44px;color:${p.ontxt}"><b style="font-size:15px;margin-right:4px">Édition</b>${tools}<span style="flex:1"></span>${b('g:new', '+ Bloc')}${b('g:reset', 'Par défaut')}${b('g:done', 'Terminer', 1)}</div>`;
};
function gAct(parts) {
  const g = JSON.parse(JSON.stringify(gridCfg())); const [op, a] = parts; const it = gSel != null ? g.items[gSel] : null;
  const fits = (r, skip) => r.x >= 0 && r.y >= 0 && r.x + r.w <= GW && r.y + r.h <= GH && !g.items.some((o, k) => k !== skip && overlap(o, r));
  if (op === 'done') { editing = false; gSel = null; gPick = null; return render(); }
  if (op === 'reset') { store.set('grid_' + profIdx(), DEFAULT_GRID); gSel = null; return render(); }
  if (op === 'pickx') { gPick = null; return render(); }
  if (op === 'new') { gPick = 'new'; return render(); }
  if (op === 'group') { if (it) gPick = 'group'; return render(); }
  if (op === 'add') {
    if (gPick === 'group' && it) it.b.push(a);
    else { const r = freeSpot(g.items, 1, 1); if (!r) { toast('Plus de place libre : réduis ou retire un bloc'); gPick = null; return render(); } g.items.push(Object.assign({ b: [a] }, r)); gSel = g.items.length - 1; }
    gPick = null;
  } else if (it && op === 'mv') {
    const r = { x: it.x + (a === 'l' ? -1 : a === 'r' ? 1 : 0), y: it.y + (a === 'u' ? -1 : a === 'd' ? 1 : 0), w: it.w, h: it.h };
    if (fits(r, gSel)) Object.assign(it, r); else toast('Place occupée ou bord de l\'écran');
  } else if (it && (op === 'w' || op === 'h')) {
    const r = { x: it.x, y: it.y, w: it.w + (op === 'w' ? +a : 0), h: it.h + (op === 'h' ? +a : 0) };
    if (r.w < 1 || r.h < 1) return; if (fits(r, gSel)) Object.assign(it, r); else toast('Pas assez de place : déplace ou réduis le bloc voisin');
  } else if (it && op === 'del') {
    const cur = Math.min(stackIdx[gSel] || 0, it.b.length - 1);
    if (it.b.length > 1) { it.b.splice(cur, 1); stackIdx[gSel] = 0; } else { g.items.splice(gSel, 1); gSel = null; stackIdx = {}; }
  }
  store.set('grid_' + profIdx(), g); render();
}
function stackMove(i, dir) { const it = gridCfg().items[i]; if (!it) return; const n = it.b.length; stackIdx[i] = ((stackIdx[i] || 0) + dir + n) % n; render(); }

// ----- pages à faire glisser sur l'accueil (3 petits points) -----
let homePage = 0;
const HOME_PAGES = 3;
function pageCar(p) {
  return `<div style="display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr) minmax(0,1fr);gap:12px;height:100%;min-height:0">
    <div style="${fullCard(p, 'gap:10px')}">${carTitle(p)}<div style="padding:0 6%">${carSvg(p)}</div>${indC(p)}${alertsC(p)}</div>
    <div style="${fullCard(p, 'gap:8px')}">${speedHero(p, 72)}${fuelC(p)}${tcC(p)}${infoRowC(p)}</div>
    <div style="${fullCard(p, 'gap:8px')}"><div style="font-size:16px;font-weight:600">Trajet, entretien et carburant</div>${tripC(p)}${serviceC(p)}${stationC(p, 'flex:1')}</div></div>`;
}
function pageApps(p) {
  const apps = allApps();
  return `<div class="scroll" style="${card(p, 'padding:16px;display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:14px;align-content:start;height:100%')}">${apps.length ? apps.map((a) => `<button data-act="app:${esc(a.p)}" style="display:flex;flex-direction:column;align-items:center;gap:6px;font-size:13px;color:${p.txt}"><img data-icon="${esc(a.p)}" alt="" style="width:60px;height:60px;border-radius:14px;background:${p.card2}"><span style="width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center">${esc(a.l)}</span></button>`).join('') : `<div style="color:${p.mut}">Les applis s'affichent ici sur l'autoradio.</div>`}</div>`;
}
const dotsHtml = (p) => `<div style="position:absolute;left:50%;bottom:3px;transform:translateX(-50%);display:flex;gap:9px;z-index:900">${Array.from({ length: homePageCount() }, (_, i) => `<button data-act="hpage:${i}" aria-label="Page ${i + 1}" style="width:${i === homePage ? 22 : 9}px;height:9px;border-radius:5px;background:${i === homePage ? p.acc : (p.light ? '#0004' : '#fff6')}"></button>`).join('')}</div>`;
function loadIcons() {
  fLoadIcons($('screen'));
  if (!A) return;
  document.querySelectorAll('#screen [data-appicon]').forEach((e) => {
    const d = DOCK.find((x) => x.id === e.dataset.appicon); const pk = (store.get('dock_' + d.id, '') + ',' + (d.pk || '')).split(',').filter(Boolean);
    for (const k of pk) { const src = getIcon(k); if (src) { e.style.background = 'transparent'; e.innerHTML = `<img src="${src}" alt="" style="width:52px;height:52px">`; break; } }
  });
}

// cadre des onglets (pages autres que l'accueil)
// cadre : en-tête en haut + barre d'applis en bas, en haut, à gauche ou à droite
function chromeFrame(p, body, pos) {
  const q = Object.assign({}, p, { noChrome: false });
  const dk = (v) => dockC(q, v);
  let inner;
  if (pos === 'haut') inner = `<div style="display:grid;grid-template-rows:86px minmax(0,1fr);gap:12px;min-height:0">${dk(false)}${body}</div>`;
  else if (pos === 'gauche') inner = `<div style="display:grid;grid-template-columns:84px minmax(0,1fr);gap:12px;min-height:0">${dk(true)}${body}</div>`;
  else if (pos === 'droite') inner = `<div style="display:grid;grid-template-columns:minmax(0,1fr) 84px;gap:12px;min-height:0">${body}${dk(true)}</div>`;
  else if (pos === 'cachee') inner = `<div style="display:grid;min-height:0">${body}</div>`;
  else inner = `<div style="display:grid;grid-template-rows:minmax(0,1fr) 86px;gap:12px;min-height:0">${body}${dk(false)}</div>`;
  return `<div style="display:grid;grid-template-rows:44px minmax(0,1fr);gap:12px;height:100%">${editing ? editBar(q) : header(q)}${inner}</div>`;
}
const dockPos = () => store.get('dockPos_' + profIdx(), 'auto');
const pageFrame = (p, content) => chromeFrame(p, `<div style="min-height:0;display:flex;flex-direction:column">${content}</div>`, dockPos() === 'auto' ? 'bas' : dockPos());
const h2 = (p, t, right = '') => `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><div style="font-size:16px;font-weight:600">${t}</div>${right}</div>`;
const smallBtn = (p, act, t, pri) => `<button data-act="${act}" style="height:42px;padding:0 14px;border-radius:10px;font-size:14px;font-weight:600;${pri ? `background:${p.acc};color:${p.onAcc}` : `background:${p.card2};color:${p.txt}`}">${t}</button>`;
const fld = (p, extra = '') => `background:${p.card2};color:${p.txt};border:1px solid ${p.border || (p.light ? '#D6D3CA' : '#2E3038')};border-radius:10px;height:42px;padding:0 10px;font-size:14px;width:100%;${extra}`;

// ----- onglet Trajets -----
function tripsHistory() { return store.get('trips', []); }
function tripStats(list, since) {
  const t = list.filter((x) => x.start >= since);
  const km = t.reduce((s, x) => s + x.dist, 0);
  const L = t.reduce((s, x) => s + (x.cons ? x.dist * x.cons / 100 : 0), 0);
  const eur = t.reduce((s, x) => s + (x.cons && x.price ? x.dist * x.cons / 100 * x.price : 0), 0);
  return { n: t.length, km, L, eur };
}
function pageTrips(p) {
  const list = tripsHistory().slice().reverse();
  const now = new Date(); const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const w0 = d0 - ((now.getDay() + 6) % 7) * 86400000, m0 = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const sums = [['Aujourd\'hui', d0], ['Cette semaine', w0], ['Ce mois', m0]].map(([l, s]) => { const r = tripStats(tripsHistory(), s); return `<div style="${card(p, 'padding:12px 16px')}"><div style="font-size:13px;color:${p.mut}">${l}</div><div style="font-size:28px;font-weight:700">${fr1(r.km)} <span style="font-size:14px;color:${p.mut}">km</span></div><div style="font-size:13px;color:${p.mut}">${r.n} trajet${r.n > 1 ? 's' : ''} · ${fr1(r.L)} L · <b style="color:${p.warn}">${fr2(r.eur)} €</b></div></div>`; }).join('');
  const days = []; for (let i = 6; i >= 0; i--) { const s = d0 - i * 86400000; days.push({ s, km: tripStats(tripsHistory().filter((x) => x.start < s + 86400000), s).km }); }
  const max = Math.max(1, ...days.map((d) => d.km));
  const J = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
  const chart = `<div style="${card(p, 'padding:12px 16px;display:flex;flex-direction:column')}">${h2(p, 'Km sur 7 jours')}<div style="flex:1;display:flex;align-items:flex-end;gap:10px;min-height:90px">${days.map((d) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end"><span style="font-size:11px;color:${p.mut}">${d.km ? Math.round(d.km) : ''}</span><div style="width:100%;height:${Math.max(3, d.km / max * 100)}%;background:${d.s === d0 ? p.acc : p.wacc};opacity:${d.s === d0 ? 1 : 0.55};border-radius:6px"></div><span style="font-size:12px;color:${p.mut}">${J[new Date(d.s).getDay()]}</span></div>`).join('')}</div></div>`;
  const rows = list.length ? list.slice(0, 60).map((t) => `<div style="display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr 1fr 1fr .8fr;gap:8px;align-items:center;padding:9px 12px;border-bottom:1px solid ${p.card2};font-size:14px"><span><b>${fmtDate(t.start)}</b> <span style="color:${p.mut}">${fmtTime(t.start)}</span></span><span>${Math.max(1, Math.round((t.end - t.start) / 60000))} min</span><span>${fr1(t.dist)} km</span><span>${t.cons ? fr1(t.cons) + ' L/100' : '—'}</span><span>${t.cons ? fr1(t.dist * t.cons / 100) + ' L' : '—'}</span><span style="color:${p.warn}">${t.cons && t.price ? fr2(t.dist * t.cons / 100 * t.price) + ' €' : '—'}</span><span style="color:${scoreColor(t.score)}">${t.score != null ? t.score + '/100' : '—'}</span></div>`).join('')
    : `<div style="padding:20px;color:${p.mut}">Aucun trajet enregistré pour l'instant. Chaque trajet est enregistré quand tu t'arrêtes plus de 20 minutes.</div>`;
  const head = `<div style="display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr 1fr 1fr .8fr;gap:8px;padding:6px 12px;font-size:12px;color:${p.mut}"><span>Date</span><span>Durée</span><span>Distance</span><span>Conso</span><span>Litres</span><span>Coût</span><span>Éco</span></div>`;
  return pageFrame(p, `<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1.3fr);gap:12px;margin-bottom:12px">${sums}${chart}</div>
    <div style="${card(p, 'padding:12px 4px 4px;flex:1;display:flex;flex-direction:column')}"><div style="padding:0 12px">${h2(p, 'Historique des trajets', smallBtn(p, 'clearTrips', clearArm ? 'Appuie encore pour effacer' : 'Effacer'))}</div>${head}<div class="scroll" style="flex:1">${rows}</div></div>`);
}

// ----- onglet Entretien -----
const SERVICE_TYPES = ['Vidange', 'Filtres', 'Pneus', 'Freins', 'Batterie', 'Contrôle technique', 'Courroie', 'Climatisation', 'Révision', 'Lavage', 'Autre'];
function pageService(p) {
  const log = store.get('serviceLog', []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const year = String(new Date().getFullYear());
  const spent = log.filter((e) => (e.date || '').startsWith(year)).reduce((s, e) => s + (parseFloat(e.cost) || 0), 0);
  const odo = car && val(car.odo);
  const rows = log.length ? log.map((e) => `<div style="display:grid;grid-template-columns:1fr 1.3fr 1fr .9fr 2fr auto;gap:8px;align-items:center;padding:9px 12px;border-bottom:1px solid ${p.card2};font-size:14px"><b>${e.date ? fmtDate(e.date) : '—'}</b><span>${esc(e.type)}</span><span>${e.km ? Number(e.km).toLocaleString('fr-FR') + ' km' : '—'}</span><span style="color:${p.warn}">${e.cost ? fr2(parseFloat(e.cost)) + ' €' : '—'}</span><span style="color:${p.mut};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(e.note)}</span><button data-act="delLog:${e.id}" style="color:${p.mut};font-size:13px;padding:6px 8px">Suppr.</button></div>`).join('')
    : `<div style="padding:20px;color:${p.mut}">Ton carnet est vide. Ajoute ta dernière vidange, tes pneus, le contrôle technique…</div>`;
  const form = `<div style="${card(p, 'padding:12px 16px;display:flex;flex-direction:column;gap:8px')}">${h2(p, 'Ajouter une intervention')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><input id="fDate" type="date" value="${dayKey(Date.now())}" style="${fld(p)}"><select id="fType" style="${fld(p)}">${SERVICE_TYPES.map((t) => `<option>${t}</option>`).join('')}</select>
    <input id="fKm" type="number" placeholder="Km compteur" value="${odo ? Math.round(odo) : ''}" style="${fld(p)}"><input id="fCost" type="number" step="0.01" placeholder="Prix (€)" style="${fld(p)}"></div>
    <input id="fNote" placeholder="Note (garage, marque des pneus…)" style="${fld(p)}">${smallBtn(p, 'addLog', 'Ajouter au carnet', true)}</div>`;
  const remind = `<div style="${card(p, 'padding:12px 16px;display:flex;flex-direction:column;gap:8px')}">${h2(p, 'Rappels', smallBtn(p, 'gear', 'Modifier'))}
    <div style="${box(p, 'padding:10px 12px')}"><div style="font-size:12px;color:${p.mut}">Vidange</div><div data-k="eText" style="font-size:16px;font-weight:600;color:${p.warn}">—</div><div style="height:6px;background:${p.light ? '#00000014' : '#ffffff1a'};border-radius:3px;margin-top:6px"><div data-k="eBar" style="width:0;height:6px;background:#EF9F27;border-radius:3px"></div></div></div>
    <div style="${box(p, 'padding:10px 12px')}"><div style="font-size:12px;color:${p.mut}">Contrôle technique</div><div data-k="eCt" style="font-size:15px;font-weight:600">—</div></div>
    <div style="${box(p, 'padding:10px 12px')}"><div style="font-size:12px;color:${p.mut}">Compteur</div><div style="font-size:15px;font-weight:600">${odo ? Math.round(odo).toLocaleString('fr-FR') + ' km' : 'non reçu de la voiture'}</div></div>
    <div style="${box(p, 'padding:10px 12px')}"><div style="font-size:12px;color:${p.mut}">Dépensé en ${year}</div><div style="font-size:18px;font-weight:700;color:${p.warn}">${fr2(spent)} €</div></div></div>`;
  return pageFrame(p, `<div style="display:grid;grid-template-columns:330px minmax(0,1fr);gap:12px;flex:1;min-height:0">${remind}
    <div style="display:grid;grid-template-rows:auto minmax(0,1fr);gap:12px;min-height:0">${form}<div style="${card(p, 'padding:12px 4px 4px;display:flex;flex-direction:column')}"><div style="padding:0 12px">${h2(p, 'Carnet d\'entretien')}</div><div class="scroll" style="flex:1">${rows}</div></div></div></div>`);
}

// ----- onglet Éco-conduite -----
const scoreColor = (s) => (s == null ? '#9A9BA3' : s >= 80 ? '#5DCAA5' : s >= 60 ? '#EF9F27' : '#E24B4A');
function ecoScore(e) {
  if (!e || e.secs < 30) return null;
  const min = e.secs / 60;
  let s = 100;
  s -= Math.min(30, (e.acc / min) * 12);
  s -= Math.min(30, (e.brk / min) * 14);
  s -= Math.min(25, (e.over / e.secs) * 60);
  if (e.rpmSecs > 0) s -= Math.min(15, (e.rpmHigh / e.rpmSecs) * 40);
  return Math.max(0, Math.round(s));
}
function pageEco(p) {
  const e = trip && trip.eco, sc = ecoScore(e);
  const hist = tripsHistory().filter((t) => t.score != null).slice(-10);
  const avg = hist.length ? Math.round(hist.reduce((s, t) => s + t.score, 0) / hist.length) : null;
  const ring = (v, size, label) => { const a = v == null ? 0 : v / 100, R = 70, C = 2 * Math.PI * R; return `<div style="text-align:center"><svg viewBox="0 0 160 160" width="${size}" height="${size}"><circle cx="80" cy="80" r="${R}" stroke="${p.card2}" stroke-width="14" fill="none"/><circle cx="80" cy="80" r="${R}" stroke="${scoreColor(v)}" stroke-width="14" fill="none" stroke-linecap="round" stroke-dasharray="${(C * a).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 80 80)"/><text x="80" y="88" text-anchor="middle" font-size="40" font-weight="700" fill="${p.txt}" font-family="Inter">${v == null ? '—' : v}</text></svg><div style="font-size:14px;color:${p.mut}">${label}</div></div>`; };
  const m = (l, v) => `<div style="${box(p, 'padding:10px 14px')}"><div style="font-size:12px;color:${p.mut}">${l}</div><div style="font-size:20px;font-weight:700">${v}</div></div>`;
  const tips = [];
  if (e && e.secs > 30) {
    if (e.acc > 2) tips.push('Accélère plus doucement : les démarrages brusques font grimper la conso.');
    if (e.brk > 2) tips.push('Anticipe les ralentissements : lève le pied plus tôt au lieu de freiner fort.');
    if (e.over / e.secs > 0.05) tips.push('Tu dépasses souvent la limite : rouler 10 km/h moins vite économise du carburant.');
    if (e.rpmSecs && e.rpmHigh / e.rpmSecs > 0.1) tips.push('Passe la vitesse supérieure plus tôt (vers 2 000 – 2 500 tr/min).');
  }
  if (!tips.length) tips.push(sc == null ? 'Le score s\'affiche après une minute de conduite.' : 'Conduite souple, continue comme ça.');
  return pageFrame(p, `<div style="display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:12px;flex:1;min-height:0">
    <div style="${card(p, 'padding:16px;display:flex;flex-direction:column;gap:12px')}">${h2(p, 'Score d\'éco-conduite')}<div style="display:flex;justify-content:space-around;align-items:center">${ring(sc, 200, 'Trajet en cours')}${ring(avg, 150, 'Moyenne des 10 derniers trajets')}</div>
      <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px">${m('Accélérations brusques', e ? e.acc : 0)}${m('Freinages brusques', e ? e.brk : 0)}${m('Excès de vitesse', e && e.secs ? Math.round(e.over / e.secs * 100) + ' %' : '0 %')}${m('Régime élevé', e && e.rpmSecs ? Math.round(e.rpmHigh / e.rpmSecs * 100) + ' %' : '—')}</div></div>
    <div style="display:grid;grid-template-rows:auto minmax(0,1fr);gap:12px;min-height:0"><div style="${card(p, 'padding:16px')}">${h2(p, 'Conseils')}${tips.map((t) => `<div style="display:flex;gap:10px;align-items:flex-start;padding:6px 0;font-size:15px"><span style="color:${p.acc};font-weight:700">›</span><span>${t}</span></div>`).join('')}</div>
      <div style="${card(p, 'padding:16px;display:flex;flex-direction:column')}">${h2(p, 'Scores des derniers trajets')}<div style="flex:1;display:flex;align-items:flex-end;gap:8px;min-height:80px">${hist.length ? hist.map((t) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end"><span style="font-size:11px">${t.score}</span><div style="width:100%;height:${Math.max(4, t.score)}%;background:${scoreColor(t.score)};border-radius:6px"></div><span style="font-size:11px;color:${p.mut}">${fmtDate(t.start).slice(0, 5)}</span></div>`).join('') : `<span style="color:${p.mut}">Pas encore de trajet terminé.</span>`}</div>
      <div style="font-size:12px;color:${p.mut};margin-top:8px">Calcul : accélérations et freinages brusques, temps au-dessus de la limite, régime moteur (si la voiture l'envoie).</div></div></div></div>`);
}

// ----- onglet Thèmes -----
function pageThemes(p) {
  const i = profIdx(), cur = themeIdFor(i), c = custom(i, cur), name = profiles()[i];
  const gallery = THEMES.slice().sort((a, b) => a.id.localeCompare(b.id)).map((t) => `<button data-act="theme:${t.id}" style="border-radius:12px;overflow:hidden;background:${p.card2};outline:${t.id === cur ? `3px solid ${p.acc}` : 'none'};text-align:left"><img src="previews/theme_${t.id}.jpg" alt="" style="width:100%;display:block;aspect-ratio:16/9"><div style="padding:6px 8px;font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.id} · ${t.name}</div><div style="padding:0 8px 6px;font-size:11px;color:${p.mut}">${LAYOUT_NAMES[t.layout]}</div></button>`).join('');
  const sw = (col, act, on, size = 34) => `<button data-act="${act}" aria-label="${col}" style="width:${size}px;height:${size}px;border-radius:50%;background:${col};border:${on ? `3px solid ${p.txt}` : '1px solid #8886'};flex:none"></button>`;
  const accents = ACCENTS.map((a) => sw(a, 'acc:' + a, c.acc === a)).join('');
  const solids = SOLIDS.map((a) => sw(a, 'solid:' + a, c.bgType === 'solid' && c.bg === a)).join('');
  const grads = GRADIENTS.map(([n, a, b], k) => `<button data-act="grad:${k}" style="height:52px;border-radius:10px;background:linear-gradient(135deg,${a},${b});color:${lum(a) + lum(b) > 0.9 ? '#16171A' : '#fff'};font-size:12px;font-weight:600;border:${c.bgType === 'grad' && c.g1 === a && c.g2 === b ? `3px solid ${p.txt}` : '1px solid #8884'}">${n}</button>`).join('');
  const sec = (t, inner, extra = '') => `<div style="${card(p, `padding:12px 16px;flex:none;${extra}`)}">${h2(p, t)}${inner}</div>`;
  const chk = (act, on, label) => `<button data-act="${act}" style="display:flex;align-items:center;gap:10px;height:44px;font-size:14px"><span style="width:44px;height:26px;border-radius:13px;background:${on ? p.acc : p.card2};position:relative;flex:none"><span style="position:absolute;top:3px;${on ? 'right:3px' : 'left:3px'};width:20px;height:20px;border-radius:50%;background:#fff"></span></span>${label}</button>`;
  return pageFrame(p, `<div class="scroll" style="flex:1;display:flex;flex-direction:column;gap:12px;padding-right:4px">
    ${sec(`Thème du profil « ${esc(name)} »`, `<div style="display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:10px">${gallery}</div>`)}
    <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;flex:none">
      ${sec('Couleur principale', `<div style="display:flex;flex-wrap:wrap;gap:8px">${accents}</div><div style="display:flex;gap:8px;align-items:center;margin-top:10px"><span style="font-size:13px;color:${p.mut}">Couleur libre</span><input id="accPick" type="color" value="${hex7(p.acc)}" style="width:60px;height:40px;border:0;background:none"><input id="accHex" value="${hex7(p.acc)}" maxlength="7" style="${fld(p, 'width:110px')}">${smallBtn(p, 'accCustom', 'Appliquer', true)}${smallBtn(p, 'accReset', 'Par défaut')}</div>`)}
      ${sec('Options', `${chk('toggleGlass', !!c.glass, 'Cartes transparentes (laisse voir le fond)')}${chk('toggleNight', store.get('autoNight_' + i, false), 'Passer en Nuit OLED le soir automatiquement')}<div style="font-size:12px;color:${p.mut};margin-top:6px">Chaque profil garde son thème et ses couleurs. Change de profil en haut pour régler le sien.</div>`)}
    </div>
    ${sec('Ma disposition à moi', `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${smallBtn(p, 'editLayout', 'Ouvrir la grille et déplacer les blocs', true)}${smallBtn(p, 'toggleAutoStack', store.get('autoStack', false) ? 'Défilement auto des groupes : oui' : 'Défilement auto des groupes : non')}<span style="font-size:13px;color:${p.mut}">Grille de 6 × 4 cases : déplace, agrandis, rapetisse, regroupe des blocs (avec des points pour glisser).</span></div>`)}
    ${sec('Barre d\'applis', `<div style="display:flex;gap:8px;flex-wrap:wrap">${[['auto', 'Celle du thème'], ['bas', 'En bas'], ['haut', 'En haut'], ['gauche', 'À gauche'], ['droite', 'À droite'], ['cachee', 'Cachée']].map(([k, n]) => `<button data-act="dockpos:${k}" style="height:48px;padding:0 16px;border-radius:10px;font-size:14px;font-weight:600;${dockPos() === k ? `background:${p.acc};color:${p.onAcc}` : `background:${p.card2};color:${p.txt}`}">${n}</button>`).join('')}</div>`)}
    ${sec('Image de ma voiture', `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><div style="width:220px">${carSvg(p)}</div><div style="display:flex;gap:8px;flex-wrap:wrap;max-width:700px">${Object.entries(CAR_PICS).concat(store.get('carImg', '') ? [['perso', 'Ma photo importée']] : []).map(([k, n]) => smallBtn(p, 'carPick:' + k, n, carPick() === k)).join('')}${smallBtn(p, 'carImgPick', 'Importer une photo…')}</div><span style="font-size:12px;color:${p.mut};max-width:520px">${carPick() === '3d' ? 'Fais glisser ton doigt sur la voiture pour la tourner, double appui pour revenir. En roulant elle se met face à la route, et elle se tourne seule vers le coffre ou la porte ouverte. Modèle 3D « 2018 Peugeot 2008 » par tonielpro520 (Sketchfab), licence CC BY 4.0, repeint aux couleurs de ta GT Line.' : 'Quand le coffre s\'ouvre, la vue arrière s\'affiche toute seule, et un bandeau rouge indique ce qui est ouvert.'}</span><input id="carImgFile" type="file" accept="image/*" style="display:none"></div>`)}
    ${sec('Disposition des éléments (indépendante des couleurs)', `<div style="display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:8px">${[['', 'Celle du thème']].concat(Object.entries(LAYOUT_NAMES)).map(([k, n]) => `<button data-act="layout:${k}" style="height:48px;border-radius:10px;font-size:13px;font-weight:600;${(store.get('layout_' + i, '') === k) ? `background:${p.acc};color:${p.onAcc}` : `background:${p.card2};color:${p.txt}`}">${n}</button>`).join('')}</div>`)}
    ${sec('Fond uni', `<div style="display:flex;flex-wrap:wrap;gap:8px">${solids}${smallBtn(p, 'bgReset', 'Fond d\'origine')}</div>`)}
    ${sec('Fonds dégradés', `<div style="display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:8px">${grads}</div>
      <div style="display:flex;gap:10px;align-items:center;margin-top:12px;flex-wrap:wrap"><span style="font-size:14px;font-weight:600">Mon dégradé :</span><input id="g1" type="color" value="${c.g1 || '#1F6FD1'}" style="width:60px;height:40px;border:0;background:none"><input id="g2" type="color" value="${c.g2 || '#E0312B'}" style="width:60px;height:40px;border:0;background:none">
      <select id="gAng" style="${fld(p, 'width:170px')}">${[['180', 'Haut → bas'], ['90', 'Gauche → droite'], ['135', 'Diagonale ↘'], ['45', 'Diagonale ↗']].map(([v, l]) => `<option value="${v}" ${String(c.angle || 135) === v ? 'selected' : ''}>${l}</option>`).join('')}</select>${smallBtn(p, 'gradCustom', 'Appliquer', true)}</div>`)}
  </div>`);
}

// ----- assistant de calibrage des voyants -----
let calib = { step: 0, A: null, B: null, C: null };
const CALIB_STEPS = ['Ferme les portes et le coffre, et attache ta ceinture. Puis appuie sur « Valider ».', 'Détache ta ceinture (le reste ne bouge pas). Puis appuie sur « Valider ».', 'Rattache ta ceinture et ouvre le coffre. Puis appuie sur « Valider ».'];
function pageCalib(p) {
  const bits = rawBits();
  const list = bits ? Object.keys(BIT_NAMES).filter((k) => k in bits).map((k) => { const ch = calib.A && calib.A[k] !== bits[k]; return `<div style="display:flex;justify-content:space-between;padding:5px 10px;border-radius:8px;font-size:13px;${ch ? `background:${p.acc};color:${p.onAcc}` : `background:${p.card2}`}"><span>${BIT_NAMES[k]}</span><b>${bits[k]}</b></div>`; }).join('') : `<div style="color:${p.mut}">Aucune donnée reçue du boîtier pour l'instant. Mets le contact.</div>`;
  const done = calib.step >= 3;
  const res = store.get('calibMap', null);
  return pageFrame(p, `<div style="display:grid;grid-template-columns:400px minmax(0,1fr);gap:12px;flex:1;min-height:0">
    <div style="${card(p, 'padding:16px;display:flex;flex-direction:column;gap:12px')}">${h2(p, 'Corriger les voyants')}
      <div style="font-size:14px;color:${p.mut}">Ton boîtier mélange certains voyants (ex. ceinture et coffre). En 3 étapes, l'écran apprend lesquels sont les bons.</div>
      ${done ? `<div style="font-size:16px;font-weight:600;color:${p.ok[1]}">Réglage enregistré.</div><div style="font-size:14px">${res && !res.belt.filter(([k]) => !res.trunk.some(([t]) => t === k)).length && !res.trunk.filter(([k]) => !res.belt.some(([t]) => t === k)).length ? 'Ton boîtier envoie exactement la même info pour la ceinture et le coffre : l\'écran affichera « Ceinture ou coffre ».' : 'La ceinture et le coffre sont maintenant séparés.'}</div>`
      : `<div style="font-size:13px;color:${p.mut}">Étape ${calib.step + 1} sur 3</div><div style="font-size:18px;font-weight:600;line-height:1.4">${CALIB_STEPS[calib.step]}</div>`}
      <div style="display:flex;gap:8px;margin-top:auto">${done ? smallBtn(p, 'tab:home', 'Terminer', true) : smallBtn(p, 'calibNext', 'Valider', true)}${smallBtn(p, 'calibReset', 'Recommencer')}${smallBtn(p, 'calibClear', 'Effacer le réglage')}</div></div>
    <div style="${card(p, 'padding:16px;display:flex;flex-direction:column')}">${h2(p, 'Données reçues en direct', `<span style="font-size:12px;color:${p.mut}">en couleur : ce qui a changé depuis l'étape 1</span>`)}<div data-k="qfInfo" style="font-size:12px;color:${p.mut};margin:2px 0 8px;line-height:1.4">${qfInfo().txt}</div><div class="scroll" style="flex:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;align-content:start">${list}</div><div data-k="qfHex" style="font:11px monospace;color:${p.mut};word-break:break-all;margin-top:6px">${qfInfo().q.last || ''}</div></div></div>`);
}
// état de la liaison avec le service CAN de l'autoradio (com.qf.vehicle)
function qfInfo() {
  let q = {}; try { q = JSON.parse(window.Android && Android.qfStatus ? Android.qfStatus() : '{}'); } catch (e) { q = {}; }
  const c = car || {};
  const etat = !q.bound ? 'service CAN introuvable' + (q.err ? ' (' + q.err + ')' : '') : !q.linked ? 'connexion en cours…' : q.init ? 'connecté ✓' : 'connecté, accès refusé' + (q.err ? ' (' + q.err + ')' : '');
  return { q, txt: `Service CAN : ${etat} · paquets voiture ${q.car || 0}, portes ${q.door || 0}, diffusion ${q.bc || 0} · tr/min ${c.rpm > 0 ? c.rpm : '—'} · essence ${c.fuel > 0 ? fr1(c.fuel) + ' L' : '—'} · autonomie ${c.range > 0 ? Math.round(c.range) + ' km' : '—'}` };
}
function calibNext() {
  const bits = rawBits(); if (!bits) { toast('Aucune donnée du boîtier : mets le contact'); return; }
  if (calib.step === 0) calib.A = Object.assign({}, bits);
  else if (calib.step === 1) calib.B = Object.assign({}, bits);
  else if (calib.step === 2) {
    calib.C = Object.assign({}, bits);
    const diff = (X) => Object.keys(calib.A).filter((k) => X[k] !== calib.A[k]).map((k) => [k, X[k]]);
    const belt = diff(calib.B), trunk = diff(calib.C);
    if (!belt.length && !trunk.length) { toast('Rien n\'a changé : recommence en suivant les étapes'); calib = { step: 0 }; render(); return; }
    store.set('calibMap', { belt, trunk });
  }
  calib.step++; render();
}

const moving = () => { const s = curSpeed(); return !!(s && s.v > 10); };
const lockedPage = (p) => pageFrame(p, `<div style="${card(p, 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center')}"><div style="font-size:26px;font-weight:700">Disponible à l'arrêt</div><div style="font-size:16px;color:${p.mut};max-width:520px">Pour ta sécurité, le changement de thème et de couleurs se fait quand la voiture est arrêtée.</div>${smallBtn(p, 'tab:home', 'Retour à l\'accueil', true)}</div>`);

function importCarImage(file) {
  const r = new FileReader();
  r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 900 / im.width); const cv = document.createElement('canvas'); cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); let url = cv.toDataURL('image/webp', 0.85); if (url.indexOf('image/webp') < 0) url = cv.toDataURL('image/png'); store.set('carImg', url); store.set('carPick', 'perso'); toast('Photo de la voiture enregistrée'); render(); }; im.src = r.result; };
  r.readAsDataURL(file);
}

// ================= rendu =================
let map = null, tiles = null, meMarker = null, follow = true, lastLight = null, curP = null, clearArm = false;
function render() {
  const p = palette(); curP = p;
  const st = $('stage');
  st.style.background = p.streaks ? `radial-gradient(ellipse 60% 40% at 18% 22%, #ffffff26, transparent 70%), radial-gradient(ellipse 50% 35% at 82% 78%, #8fd3ff22, transparent 70%), linear-gradient(115deg, transparent 40%, #ffffff12 48%, transparent 56%), ${p.bgCss}` : p.bgCss;
  st.style.color = p.txt;
  st.style.fontFamily = (p.font === 'Inter' ? 'Inter' : `'${p.font}',Inter`) + ',Roboto,sans-serif';
  st.style.letterSpacing = p.font === 'Orbitron' ? '.2px' : '0';
  let html;
  if (tab === 'trips') html = pageTrips(p);
  else if (tab === 'service') html = pageService(p);
  else if (tab === 'eco') html = pageEco(p);
  else if (tab === 'themes') html = moving() ? lockedPage(p) : pageThemes(p);
  else if (tab === 'calib') html = pageCalib(p);
  else {
    const pos = dockPos(), free = p.layout === 'custom', nPg = homePageCount();
    if (!free && editing) editing = false;
    if (homePage > nPg - 1) homePage = nPg - 1;
    if (!free && homePage === 1) html = chromeFrame(p, pageCar(p), pos === 'auto' ? 'bas' : pos);
    else if ((!free && homePage === 2) || (free && !editing && homePage === nPg - 1 && !store.get('onePage_' + profIdx(), false))) html = chromeFrame(p, pageApps(p), pos === 'auto' ? 'bas' : pos);
    else if (editing || (pos !== 'auto' && p.layout !== 'floating')) html = chromeFrame(p, LAYOUTS[p.layout](Object.assign({}, p, { noChrome: true })), pos === 'auto' ? 'bas' : pos);
    else html = LAYOUTS[p.layout](p);
    if (nPg > 1) html += dotsHtml(p);
    html += fOverlays(p);
  }
  const scr = $('screen');
  $('mapHold').appendChild($('map'));
  scr.innerHTML = html;
  if (window.Car3D) { const cs = scr.querySelector('.car3dslot'); if (cs) { Car3D.setAccent(/^#[0-9a-f]{6}$/i.test(p.acc) ? p.acc : '#3B82F6'); Car3D.attach(cs); } else Car3D.detach(); }
  const slot = scr.querySelector('.mapslot');
  if (slot) {
    slot.appendChild($('map'));
    if (!map) initMap();
    if (lastLight !== !!p.light) { lastLight = !!p.light; tiles.setUrl(p); }
    setTimeout(() => { map.invalidateSize(); if (loc && follow) map.setView([loc.lat, loc.lon], map.getZoom(), { animate: false }); }, 30);
  }
  loadIcons();
  if (tab === 'themes') {
    const ap = $('accPick'); if (ap) ap.addEventListener('input', () => { $('accHex').value = ap.value; });
    const cf = $('carImgFile'); if (cf) cf.addEventListener('change', () => { const f = cf.files && cf.files[0]; if (f) importCarImage(f); });
  }
  if (tab === 'home') fAfterRender();
  paint();
}

// ================= mise à jour des valeurs =================
function setK(k, v) { document.querySelectorAll(`#screen [data-k="${k}"]`).forEach((e) => { if (e.textContent !== String(v)) e.textContent = v; }); }
function setH(k, v) { document.querySelectorAll(`#screen [data-k="${k}"]`).forEach((e) => { if (e.innerHTML !== v) e.innerHTML = v; }); }
function show(k, on, disp = 'flex') { document.querySelectorAll(`#screen [data-show="${k}"]`).forEach((e) => { e.style.display = on ? disp : 'none'; }); }
function paint() {
  const p = curP; if (!p) return;
  const now = new Date();
  setK('clock', pad(now.getHours()) + ':' + pad(now.getMinutes()));
  const J = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'], M = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  setK('dateTxt', `${J[now.getDay()]} ${now.getDate()} ${M[now.getMonth()]}`);
  const name = profiles()[profIdx()];
  setK('hello', (now.getHours() >= 18 || now.getHours() < 5 ? 'Bonsoir ' : 'Bonjour ') + name);
  setK('avatar', name.charAt(0).toUpperCase());
  // vitesse
  const s = curSpeed(), tol = parseInt(store.get('tol', 3), 10) || 0;
  const over = !!(s && limit && s.v > limit + tol);
  setK('speed', s ? Math.round(s.v) : '--');
  document.querySelectorAll('#screen [data-k="speed"]').forEach((e) => { e.style.color = over ? '#FF5A4F' : ''; });
  setK('speedSrc', s ? s.src : '');
  show('limit', !!limit); setK('limit', limit || '');
  show('over', over, 'inline-block'); setK('over', over ? `Ralentis · limite ${limit}` : '');
  // voiture
  const avg = car && val(car.avg1), inst = car && val(car.instant), rng = car && val(car.range);
  setK('avg', avg != null && avg > 0 ? fr1(avg) : '—');
  setK('inst', inst != null ? fr1(inst) : '—');
  setK('range', rng != null ? Math.round(rng) : '—');
  const fresh = car && Date.now() - car.ts < 120000;
  const fuelL = fresh ? val(car.fuel) : null, rpm = fresh ? val(car.rpm) : null;
  setK('fuelL', fuelL != null ? fr1(fuelL) : '—');
  document.querySelectorAll('#screen [data-k="fuelBar"]').forEach((e) => { const pc = fuelL != null ? Math.min(100, fuelL / TANK * 100) : 0; e.style.width = pc + '%'; e.style.background = pc < 15 ? '#E24B4A' : pc < 30 ? '#EF9F27' : p.ok[1]; });
  setK('rpm', rpm != null ? Math.round(rpm) : '—');
  setK('odo', fresh && val(car.odo) ? Math.round(car.odo).toLocaleString('fr-FR') : '—');
  setK('avg2', fresh && val(car.avg2) ? fr1(car.avg2) : '—');
  setK('t1Km', fresh && val(car.t1Km) != null ? fr1(car.t1Km) : '—'); setK('t2Km', fresh && val(car.t2Km) != null ? fr1(car.t2Km) : '—');
  setK('t1Spd', fresh && val(car.t1Spd) != null ? car.t1Spd : '—'); setK('t2Spd', fresh && val(car.t2Spd) != null ? car.t2Spd : '—');
  const CAP = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  setK('heading', loc && loc.brg >= 0 ? CAP[Math.round(loc.brg / 45) % 8] : '—');
  setK('alt', loc && loc.alt > -9000 ? Math.round(loc.alt) : '—');
  document.querySelectorAll('#screen [data-g]').forEach((g) => { const k = g.dataset.g; const v = k === 'speed' ? (s ? s.v : 0) : k === 'rpm' ? (rpm || 0) : k === 'fuelL' ? (fuelL || 0) : (inst || 0); g.setAttribute('d', gaugePath(v, parseFloat(g.dataset.max))); });
  const indOn = (k) => { if (!fresh) return false; if (k === 'win') return !!(car.wFL || car.wFR || car.wBL || car.wBR); if (k === 'belt') return !!beltTrunk().belt; if (k === 'hb') return car.handbrake === 1; return car[k] === 1; };
  document.querySelectorAll('#screen [data-ind]').forEach((e) => { const k = e.dataset.ind, on = indOn(k); const warnK = ['turnL', 'turnR', 'hazard', 'win', 'sun', 'hb'].includes(k); e.style.opacity = on ? '1' : '.55'; e.style.background = on ? (warnK ? '#EF9F27' : k === 'hi' ? '#2F7FE0' : k === 'lo' || k === 'fogF' || k === 'fogR' ? '#3B6D11' : p.acc) : p.card2; e.style.color = on ? '#fff' : p.mut; });
  const d = doors || {};
  document.querySelectorAll('#screen [data-door]').forEach((e) => {
    const k = e.dataset.door;
    if (k === 'bonnet') e.setAttribute('fill', d.bonnet ? '#E0312B' : '#FBFAF7');
    else e.style.display = (k === 'f' ? d.lf || d.rf : k === 'r' ? d.lb || d.rb : beltTrunk().trunk) ? 'block' : 'none';
  });
  const btk = beltTrunk(), trunkOpen = !!(btk.trunk || btk.either), open = [];
  if (d.lf) open.push('Porte av. G'); if (d.rf) open.push('Porte av. D'); if (d.lb) open.push('Porte arr. G'); if (d.rb) open.push('Porte arr. D'); if (btk.trunk) open.push('Coffre'); else if (btk.either) open.push('Coffre ?'); if (d.bonnet) open.push('Capot');
  document.querySelectorAll('#screen [data-carv]').forEach((e) => { e.style.opacity = (e.dataset.carv === 'rear') === trunkOpen ? '1' : '0'; });
  { const sp = curSpeed(), v = sp ? sp.v : 0, rolling = v >= 2 && !trunkOpen;
    // pneu ~1,95 m de tour : vitesse réelle jusqu'à ~25 km/h, puis plafonnée (sinon effet stroboscopique)
    const dur = rolling ? Math.max(0.28, 1.95 / (v / 3.6)).toFixed(2) + 's' : '';
    document.querySelectorAll('#screen [data-wheel]').forEach((e) => { e.style.animationPlayState = rolling ? 'running' : 'paused'; if (dur && e.dataset.dur !== dur) { e.style.animationDuration = dur; e.dataset.dur = dur; } e.style.filter = v > 40 ? 'blur(.6px)' : ''; });
    if (window.Car3D) Car3D.update({ speed: v, focus: trunkOpen ? 'rear' : (d.lf || d.lb) ? 'left' : (d.rf || d.rb) ? 'right' : null });
    document.querySelectorAll('#screen [data-carbody]').forEach((e) => { e.style.animation = rolling ? `cbob ${v > 60 ? '.35s' : '.6s'} ease-in-out infinite` : ''; }); }
  document.querySelectorAll('#screen [data-carbadge]').forEach((e) => { e.style.display = open.length ? 'block' : 'none'; e.textContent = open.length ? 'Ouvert : ' + open.join(' · ') : ''; });
  const al = alertList(over);
  const chip = (t, k) => `<span style="background:${p[k][0]};color:${p[k][1]};border-radius:8px;padding:4px 9px;font-size:12px;font-weight:600;white-space:nowrap">${t}</span>`;
  setH('alerts', al.length ? al.map((t) => chip(t, 'bad')).join('') : carEver ? chip('Tout est OK', 'ok') + chip('Portes fermées', 'ok') : `<span style="background:${p.card2};color:${p.mut};border-radius:8px;padding:4px 9px;font-size:12px">Boîtier CAN : pas encore de données</span>`);
  setH('badge', al.length ? chip(`${al.length} alerte${al.length > 1 ? 's' : ''}`, 'bad') : carEver ? chip('OK', 'ok') : `<span style="background:${p.card2};color:${p.mut};border-radius:8px;padding:4px 9px;font-size:12px">GPS</span>`);
  // trajet
  if (trip) {
    const min = Math.max(0, Math.round((trip.last - trip.start) / 60000));
    setK('tDur', min >= 60 ? `${Math.floor(min / 60)} h ${pad(min % 60)}` : `${min} min`);
    setK('tKm', fr1(trip.dist) + ' km');
    const c = consumption();
    setK('tCons', c ? fr1(c) : '—');
    setK('tCost', c && station && trip.dist > 0 ? fr2(trip.dist * c / 100 * station.price) + ' €' : '—');
    setK('tSince', 'depuis ' + fmtTime(trip.start));
  }
  paintService();
  // météo
  if (weather) {
    const w = wmo(weather.c);
    setK('wTemp', Math.round(weather.t) + '°'); setK('wDesc', w.t); setK('wCity', city || 'Météo');
    document.querySelectorAll('#screen [data-k="wIcon"]').forEach((e) => { const h = weatherSvg(w.i, weather.day, +e.dataset.size || 50, p.wacc); if (e.innerHTML !== h) e.innerHTML = h; });
    setH('wHours', weather.hours.slice(0, 4).map((h) => `<div>${h.h}<br><b style="color:${p.txt};font-size:14px">${Math.round(h.t)}°</b></div>`).join(''));
  }
  // station
  if (station) { setK('stName', station.label); setK('stPrice', station.price.toFixed(3).replace('.', ',') + ' €/L'); }
  else setK('stPrice', stationMsg);
  const fuel = store.get('fuel', 'E10'); setK('stFuel', fuel === 'E10' ? 'SP95-E10' : fuel);
  setK('place', place);
  show('recenter', !follow, 'block');
  // musique
  show('mAccess', mediaAccess === false, 'block');
  if (media) {
    setK('mApp', media.app || 'Musique'); setK('mTitle', media.title || 'Titre inconnu'); setK('mArtist', media.artist || '');
    const pos = media.pos + (media.playing ? Date.now() - mediaPosAt : 0);
    document.querySelectorAll('#screen [data-k="mBar"]').forEach((e) => { e.style.width = media.dur ? Math.min(100, pos / media.dur * 100) + '%' : '0'; });
    document.querySelectorAll('#screen [data-img="mArt"]').forEach((e) => { if (media.art) { if (e.getAttribute('src') !== media.art) e.src = media.art; e.style.display = 'block'; } else e.style.display = 'none'; });
  } else {
    setK('mApp', 'Musique'); setK('mTitle', mediaAccess === false ? 'Musique' : 'Aucune musique'); setK('mArtist', mediaAccess === false ? 'Autorise l\'accès pour la pochette' : 'Lance Spotify ou YouTube Music');
    document.querySelectorAll('#screen [data-img="mArt"]').forEach((e) => { e.style.display = 'none'; });
    document.querySelectorAll('#screen [data-k="mBar"]').forEach((e) => { e.style.width = '0'; });
  }
  setH('mPlayIcon', playIcon(media && media.playing));
}

// ================= météo =================
let weather = null, weatherAt = 0, city = '', cityAt = 0;
function wmo(c) {
  if (c === 0) return { t: 'Ciel dégagé', i: 'sun' }; if (c <= 2) return { t: 'Peu nuageux', i: 'cloudsun' }; if (c === 3) return { t: 'Couvert', i: 'cloud' };
  if (c === 45 || c === 48) return { t: 'Brouillard', i: 'fog' }; if (c >= 51 && c <= 57) return { t: 'Bruine', i: 'rain' }; if (c === 61 || c === 80) return { t: 'Pluie faible', i: 'rain' };
  if (c >= 61 && c <= 67) return { t: 'Pluie', i: 'rain' }; if (c >= 81 && c <= 82) return { t: 'Averses', i: 'rain' }; if ((c >= 71 && c <= 77) || c === 85 || c === 86) return { t: 'Neige', i: 'snow' };
  if (c >= 95) return { t: 'Orage', i: 'storm' }; return { t: 'Variable', i: 'cloud' };
}
function weatherSvg(kind, day, size, col) {
  const s = `width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" stroke="${col}" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"`;
  const cloud = 'M14 32H36A7 7 0 0 0 35 18 10 10 0 0 0 16 20 6 6 0 0 0 14 32Z';
  const sun = day ? '<circle cx="24" cy="24" r="8" stroke="#F0B060"/><path stroke="#F0B060" d="M24 6v5M24 37v5M6 24h5M37 24h5M11 11l3 3M34 34l3 3M11 37l3-3M34 14l3-3"/>' : '<path stroke="#C9C6BC" d="M30 10a14 14 0 1 0 8 22 11 11 0 0 1-8-22Z"/>';
  if (kind === 'sun') return `<svg ${s}>${sun}</svg>`;
  if (kind === 'cloudsun') return `<svg ${s}><g transform="translate(-6,-6) scale(.8)">${sun}</g><path d="${cloud}"/></svg>`;
  if (kind === 'fog') return `<svg ${s}><path d="${cloud}"/><path d="M12 38h24M16 43h18"/></svg>`;
  if (kind === 'rain') return `<svg ${s}><path d="${cloud}"/><path d="M18 37l-2 5M26 37l-2 5M34 37l-2 5"/></svg>`;
  if (kind === 'snow') return `<svg ${s}><path d="${cloud}"/><path d="M18 39h.01M26 41h.01M34 39h.01" stroke-width="4"/></svg>`;
  if (kind === 'storm') return `<svg ${s}><path d="${cloud}"/><path stroke="#F0B060" d="M25 34l-4 6h6l-4 6"/></svg>`;
  return `<svg ${s}><path d="${cloud}"/></svg>`;
}
async function updateWeather(force) {
  if (!loc || DEMO) return;
  if (!force && Date.now() - weatherAt < 15 * 60e3) return;
  weatherAt = Date.now();
  try {
    const j = await getJSON(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat.toFixed(3)}&longitude=${loc.lon.toFixed(3)}&current=temperature_2m,weather_code,is_day&hourly=temperature_2m,weather_code,is_day&forecast_hours=6&timezone=auto`);
    const hrs = [];
    for (let i = 1; i < Math.min(5, j.hourly.time.length); i++) hrs.push({ h: j.hourly.time[i].slice(11, 13) + 'h', t: j.hourly.temperature_2m[i], c: j.hourly.weather_code[i] });
    const wasNight = isNight();
    weather = { t: j.current.temperature_2m, c: j.current.weather_code, day: j.current.is_day, hours: hrs };
    if (wasNight !== isNight()) render();
  } catch (e) { weatherAt = Date.now() - 13 * 60e3; }
  if (Date.now() - cityAt > 30 * 60e3) {
    cityAt = Date.now();
    try { const a = (await getJSON(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${loc.lat.toFixed(4)}&lon=${loc.lon.toFixed(4)}&zoom=10&accept-language=fr`)).address || {}; city = a.city || a.town || a.village || a.municipality || ''; } catch (e) { cityAt = 0; }
  }
}

// ================= carte =================
let place = 'Recherche GPS…', placeAt = 0;
// Carte : OpenFreeMap (gratuit, sans clé) avec MapLibre ; secours Esri si l'écran ne gère pas WebGL
const STYLE_LIGHT = 'https://tiles.openfreemap.org/styles/liberty';
const STYLE_DARK = 'https://tiles.openfreemap.org/styles/positron';
const DARK_FILTER = 'invert(1) hue-rotate(180deg) brightness(.95) contrast(.9) saturate(.7)';
const ARROW = '<svg id="meArrow" viewBox="0 0 24 24" width="32" height="32" aria-hidden="true"><path d="M12 2L19 21 12 17 5 21Z" fill="#2F7FE0" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
let mapEngine = '';
function initMap() {
  const el = $('map'), c0 = [48.5734, 7.7521];
  let ok = false;
  try { const cv = document.createElement('canvas'); ok = !!(window.maplibregl && (cv.getContext('webgl2') || cv.getContext('webgl'))); } catch (e) { ok = false; }
  if (ok) {
    mapEngine = 'maplibre';
    const m = new maplibregl.Map({ container: el, style: STYLE_LIGHT, center: [c0[1], c0[0]], zoom: 15, attributionControl: { compact: true }, dragRotate: false, pitchWithRotate: false, fadeDuration: 0, maxZoom: 18 });
    m.touchZoomRotate.disableRotation();
    const a = document.createElement('div'); a.innerHTML = ARROW;
    const mk = new maplibregl.Marker({ element: a }).setLngLat([c0[1], c0[0]]).addTo(m);
    let cur = 'light';
    map = {
      setView: (ll, z, o) => { if (o && o.animate) m.easeTo({ center: [ll[1], ll[0]], zoom: z, duration: 700 }); else m.jumpTo({ center: [ll[1], ll[0]], zoom: z }); },
      getZoom: () => m.getZoom(), invalidateSize: () => m.resize(), on: (ev, cb) => m.on(ev, cb)
    };
    meMarker = { setLatLng: (ll) => mk.setLngLat([ll[1], ll[0]]) };
    tiles = { setUrl: (p) => { const want = p.light ? 'light' : 'dark'; if (want !== cur) { cur = want; m.setStyle(want === 'light' ? STYLE_LIGHT : STYLE_DARK); } m.getCanvas().style.filter = want === 'dark' ? DARK_FILTER : ''; } };
  } else {
    mapEngine = 'leaflet';
    const esri = (p) => p.light ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}' : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
    const lm = L.map(el, { zoomControl: false, attributionControl: true, inertia: false }).setView(c0, 15);
    const layer = L.tileLayer(esri(curP || THEMES[0]), { maxZoom: 16, attribution: '© Esri' }).addTo(lm);
    lm.attributionControl.setPrefix(false);
    map = lm;
    meMarker = L.marker(c0, { icon: L.divIcon({ className: '', iconSize: [34, 34], iconAnchor: [17, 17], html: ARROW }) }).addTo(lm);
    tiles = { setUrl: (p) => layer.setUrl(esri(p)) };
  }
  tiles.setUrl(curP || THEMES[0]);
  lastLight = !!(curP && curP.light);
  map.on('dragstart', () => { follow = false; paint(); });
}
async function updatePlace() {
  if (!loc || DEMO || Date.now() - placeAt < 20e3) return;
  placeAt = Date.now();
  try { const a = (await getJSON(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${loc.lat.toFixed(5)}&lon=${loc.lon.toFixed(5)}&zoom=17&accept-language=fr`)).address || {}; place = [a.road || a.pedestrian || a.neighbourhood || '', a.city || a.town || a.village || ''].filter(Boolean).join(', ') || 'Position GPS'; } catch (e) {}
}
function wazeTo(q) { if (!A || !A.openUrl(`https://waze.com/ul?q=${encodeURIComponent(q)}&navigate=yes`)) toast('Waze introuvable'); }

// ================= position, vitesse, limitation =================
let loc = null;
window.onLoc = (lat, lon, spd, acc, brg, alt) => {
  const first = !loc;
  loc = { lat, lon, spd, acc, brg, alt: alt == null ? -9999 : alt, ts: Date.now() };
  if (map) {
    meMarker.setLatLng([lat, lon]);
    const ar = document.getElementById('meArrow'); if (ar && brg >= 0) ar.style.transform = `rotate(${brg}deg)`;
    if (follow && document.querySelector('#screen .mapslot')) { const sp = (curSpeed() || {}).v || 0; const z = store.get('autoZoom', true) ? (sp > 100 ? 14 : sp > 60 ? 15 : 16) : map.getZoom(); map.setView([lat, lon], first ? 16 : z, { animate: !first }); }
  }
  tripOnLoc(loc);
  if (first) { updateWeather(true); updateStation(true); }
  updatePlace(); maybeLimit();
};
let limit = null, limitAt = 0, limitPos = null, limitBusy = false;
function parseMax(v) { if (!v) return null; const m = String(v).match(/\d+/); if (m) return parseInt(m[0], 10); return { 'FR:urban': 50, 'FR:rural': 80, 'FR:motorway': 130, 'FR:zone30': 30 }[v] ?? null; }
async function maybeLimit() {
  if (!loc || limitBusy || DEMO) return;
  const moving = (curSpeed() || {}).v > 5;
  if (limitPos && Date.now() - limitAt < (moving ? 8000 : 60000)) return;
  limitBusy = true; limitAt = Date.now(); limitPos = { lat: loc.lat, lon: loc.lon };
  try {
    const q = `[out:json][timeout:8];way(around:20,${loc.lat.toFixed(5)},${loc.lon.toFixed(5)})[highway][maxspeed];out tags 4;`;
    const vals = ((await getJSON('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(q))).elements || []).map((e) => parseMax(e.tags && e.tags.maxspeed)).filter((x) => x);
    limit = vals.length ? vals[0] : null;
  } catch (e) {}
  limitBusy = false;
}
function curSpeed() {
  const now = Date.now();
  if (car && now - car.ts < 5000 && car.speed >= 0) return { v: car.speed, src: 'voiture' };
  if (loc && now - loc.ts < 5000 && loc.spd >= 0 && loc.acc < 50) return { v: loc.spd, src: 'GPS' };
  return null;
}

// ================= voiture =================
let car = null, doors = null, carEver = store.get('carEver', false);
window.onCar = (o) => { o.ts = Date.now(); car = o; if (!carEver) { carEver = true; store.set('carEver', true); } };
window.onDoors = (o) => { o.ts = Date.now(); doors = o; carEver = true; };
const val = (x) => (typeof x === 'number' && x >= 0 ? x : null);
function consumption() {
  const c = car && (val(car.avg1) || val(car.cur1));
  if (c && c > 0.5 && c < 40) return c;
  const f = parseFloat(String(store.get('consFallback', '')).replace(',', '.'));
  return f > 0 ? f : null;
}
// bits bruts reçus du boîtier : c2.7 … c6.0 (voiture) et d.7 … d.2 (portes)
const BIT_NAMES = { 'c2.7': 'Pleins phares', 'c2.6': 'Feux de croisement', 'c2.5': 'Antibrouillard AV', 'c2.4': 'Antibrouillard AR', 'c2.3': 'Clignotant D', 'c2.2': 'Clignotant G', 'c2.1': 'Warning', 'c2.0': 'Phares',
  'c3.7': 'Veilleuses', 'c3.6': 'Feux de position', 'c3.5': 'Feu de recul', 'c3.4': 'Feu stop', 'c3.3': 'Voyant alerte', 'c4.7': 'Verrouillage central', 'c4.6': 'Verrou AVG', 'c4.5': 'Verrou AVD', 'c4.4': 'Verrou ARG', 'c4.3': 'Verrou ARD', 'c4.2': 'Verrou coffre', 'c4.1': 'Vitre AVG', 'c4.0': 'Vitre AVD',
  'c5.7': 'Vitre ARG', 'c5.6': 'Vitre ARD', 'c5.5': 'Toit ouvrant', 'c5.4': 'Hayon électrique', 'c5.3': 'Ceinture conducteur', 'c5.2': 'Ceinture passager', 'c6.7': 'Contact', 'c6.6': 'Embrayage', 'c6.5': 'Rapport', 'c6.4': 'Frein à main', 'c6.3': 'Lave-glace', 'c6.2': 'Essuie-glace', 'c6.1': 'Mode affichage', 'c6.0': 'Mode conduite',
  'd.7': 'Porte AVG', 'd.6': 'Porte AVD', 'd.5': 'Porte ARG', 'd.4': 'Porte ARD', 'd.3': 'Coffre', 'd.2': 'Capot' };
function rawBits() {
  const b = {};
  if (car && Array.isArray(car.raw)) car.raw.forEach((v, k) => { for (let i = 0; i < 8; i++) b[`c${k + 2}.${i}`] = (v >> i) & 1; });
  if (doors && typeof doors.raw === 'number') for (let i = 2; i < 8; i++) b[`d.${i}`] = (doors.raw >> i) & 1;
  return Object.keys(b).length ? b : null;
}
function beltTrunk() {
  const m = store.get('calibMap', null), bits = rawBits();
  if (m && bits) {
    const match = (S) => S.length > 0 && S.every(([k, v]) => bits[k] === v);
    const Ub = m.belt.filter(([k]) => !m.trunk.some(([t]) => t === k)), Ut = m.trunk.filter(([k]) => !m.belt.some(([t]) => t === k));
    if (!Ub.length && !Ut.length) return { either: match(m.belt) };
    return { belt: Ub.length ? match(Ub) : match(m.belt) && !match(Ut), trunk: Ut.length ? match(Ut) : match(m.trunk) && !match(Ub) };
  }
  // sans calibrage : ton boîtier met la ceinture détachée dans la case « coffre »
  if (!(doors && doors.trunk === 1)) return {};
  const s = curSpeed();
  if (s && s.v > 10) return { belt: true };
  return { either: true };
}
function alertList(over) {
  const l = [], d = doors || {}, s = curSpeed();
  if (d.lf) l.push('Porte conducteur'); if (d.rf) l.push('Porte passager'); if (d.lb) l.push('Porte arr. gauche'); if (d.rb) l.push('Porte arr. droite');
  const bt = beltTrunk();
  if (bt.trunk) l.push('Coffre ouvert'); if (bt.belt) l.push('Ceinture non attachée'); if (bt.either) l.push('Ceinture ou coffre'); if (d.bonnet) l.push('Capot ouvert');
  if (car && Date.now() - car.ts < 120000) {
    if (car.handbrake === 1 && s && s.v > 5) l.push('Frein à main serré');
    if (car.washer === 1) l.push('Lave-glace bas');
    const r = val(car.range); if (r != null && r < 60) l.push('Carburant bas');
  }
  if (over) l.push('Vitesse');
  return l;
}

// ================= trajets et éco-conduite =================
let trip = store.get('trip', null);
const newEco = () => ({ secs: 0, acc: 0, brk: 0, over: 0, rpmHigh: 0, rpmSecs: 0, prev: null });
function archiveTrip(t) {
  if (!t || t.dist < 0.3) return;
  const list = tripsHistory();
  list.push({ start: t.start, end: t.last, dist: Math.round(t.dist * 100) / 100, cons: t.cons || null, price: t.price || null, score: ecoScore(t.eco) });
  while (list.length > 300) list.shift();
  store.set('trips', list);
}
function tripOnLoc(l) {
  const now = Date.now();
  if (!trip || now - trip.last > 20 * 60e3) {
    archiveTrip(trip);
    trip = { start: now, last: now, dist: 0, lat: l.lat, lon: l.lon, eco: newEco() };
  } else {
    if (l.acc < 80) {
      const d = hav(trip.lat, trip.lon, l.lat, l.lon);
      if (d > 0.008 && d < 2) { trip.dist += d; trip.lat = l.lat; trip.lon = l.lon; } else if (d >= 2) { trip.lat = l.lat; trip.lon = l.lon; }
    }
    trip.last = now;
  }
}
function ecoTick() {
  if (!trip) return;
  if (!trip.eco) trip.eco = newEco();
  const e = trip.eco, s = curSpeed();
  if (!s) { e.prev = null; return; }
  if (s.v > 3) {
    e.secs++;
    if (e.prev != null) { const dv = s.v - e.prev; if (dv > 9) e.acc++; if (dv < -11) e.brk++; }
    const tol = parseInt(store.get('tol', 3), 10) || 0;
    if (limit && s.v > limit + tol) e.over++;
    if (car && Date.now() - car.ts < 5000 && car.rpm > 0) { e.rpmSecs++; if (car.rpm > 3000) e.rpmHigh++; }
  }
  e.prev = s.v;
  const c = consumption(); if (c) trip.cons = c;
  if (station) trip.price = station.price;
}

// ================= entretien (rappels) =================
function paintService() {
  const oilKm = parseFloat(store.get('oilKm', '')), oilDate = store.get('oilDate', ''), ct = store.get('ctDate', '');
  const interval = parseFloat(store.get('oilInt', '')) || 20000, odo = car && val(car.odo);
  let txt = 'Touchez pour régler', prog = 0;
  if (oilKm > 0 && odo) { const left = Math.round(oilKm - odo); txt = left > 0 ? `Vidange dans ${left.toLocaleString('fr-FR')} km` : 'Vidange à faire'; prog = Math.min(1, Math.max(0, 1 - left / interval)); }
  else if (oilDate) { const days = Math.ceil((new Date(oilDate) - new Date()) / 86400000); txt = days > 0 ? `Vidange dans ${days} jours` : 'Vidange à faire'; prog = Math.min(1, Math.max(0, 1 - days / 365)); }
  else if (oilKm > 0) txt = `Vidange à ${oilKm.toLocaleString('fr-FR')} km`;
  setK('eText', txt);
  document.querySelectorAll('#screen [data-k="eBar"]').forEach((e) => { e.style.width = Math.round(prog * 100) + '%'; e.style.background = prog > 0.9 ? '#E24B4A' : '#EF9F27'; });
  if (ct) { const days = Math.ceil((new Date(ct) - new Date()) / 86400000); setK('eCt', `CT : ${fmtDate(ct)}` + (days >= 0 ? ` (dans ${days} j)` : ' (dépassé)')); } else setK('eCt', 'CT : date à régler');
}

// ================= station la moins chère =================
let station = null, stationAt = 0, stationPos = null, stationMsg = '…';
const FUEL_KEY = { E10: 'e10', SP95: 'sp95', SP98: 'sp98', Gazole: 'gazole', E85: 'e85', GPLc: 'gplc' };
async function updateStation(force) {
  if (!loc || DEMO) return;
  if (!force && Date.now() - stationAt < 15 * 60e3 && stationPos && hav(stationPos.lat, stationPos.lon, loc.lat, loc.lon) < 3) return;
  stationAt = Date.now(); stationPos = { lat: loc.lat, lon: loc.lon };
  const fk = FUEL_KEY[store.get('fuel', 'E10')] || 'e10';
  const base = 'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records';
  const geo = `within_distance(geom, geom'POINT(${loc.lon.toFixed(5)} ${loc.lat.toFixed(5)})', 10km)`;
  let recs = null;
  try { recs = (await getJSON(`${base}?where=${encodeURIComponent(geo + ` AND ${fk}_prix IS NOT NULL`)}&order_by=${fk}_prix&limit=20`)).results; } catch (e) {}
  if (!recs || !recs.length) { try { recs = (await getJSON(`${base}?where=${encodeURIComponent(geo)}&limit=100`)).results; } catch (e) {} }
  let best = null;
  for (const r of recs || []) {
    const k = Object.keys(r).find((x) => x.toLowerCase().includes(fk) && x.toLowerCase().includes('prix'));
    let pr = k ? parseFloat(r[k]) : NaN; if (pr > 10) pr /= 1000;
    if (!isNaN(pr) && pr > 0 && (!best || pr < best.price)) { const g = r.geom || {}; best = { price: pr, name: [r.adresse, r.ville].filter(Boolean).join(', '), lat: g.lat, lon: g.lon }; }
  }
  if (best) { const dist = best.lat ? hav(loc.lat, loc.lon, best.lat, best.lon) : null; best.label = `Moins chère${dist != null ? ' · ' + fr1(dist) + ' km' : ''} · ${best.name}`; station = best; }
  else { stationMsg = 'prix indisponible'; stationAt = Date.now() - 12 * 60e3; }
}

// ================= musique =================
let media = null, mediaPosAt = 0, mediaAccess = null;
window.onMedia = (m, access) => {
  mediaAccess = access;
  if (!access || !m) { media = null; paint(); return; }
  const prevArt = media && media.art;
  media = m; mediaPosAt = Date.now();
  if (!('art' in m)) media.art = prevArt;
  paint();
};

// ================= applis =================
let appsCache = null;
function allApps() { if (!appsCache) { try { appsCache = A ? JSON.parse(A.apps()) : (DEMO ? DEMO_APPS : []); } catch (e) { appsCache = []; } } return appsCache; }
function launchDock(item) {
  if (!item) return;
  if (item.special === 'drawer') { openDrawer(null); return; }
  if (!A) { toast('Ouverture : ' + item.label); return; }
  const custom2 = store.get('dock_' + item.id, '');
  if (custom2 && A.launch(custom2)) return;
  if (A.launch(item.pk)) return;
  const found = allApps().find((a) => item.re.test(a.l) || item.re.test(a.p));
  if (found && A.launch(found.p)) return;
  if (item.id === 'phone' && A.dial()) return;
  toast(`Appli pour « ${item.label} » non trouvée : choisis-la dans la liste`);
  openDrawer(item);
}
let assignFor = null;
function openDrawer(forItem) {
  assignFor = forItem;
  $('drawerTitle').textContent = forItem ? `Choisis l'appli pour « ${forItem.label} »` : 'Applications';
  const grid = $('appGrid'); const apps = allApps();
  grid.innerHTML = apps.length ? apps.map((a) => `<button class="app" data-act="app:${esc(a.p)}"><div class="ph"></div><span>${esc(a.l)}</span></button>`).join('') : '<div style="color:#9A9BA3">Aucune appli trouvée.</div>';
  $('drawer').classList.add('on');
  let i = 0; const btns = grid.querySelectorAll('.app');
  const step = () => { if (!$('drawer').classList.contains('on')) return; for (let k = 0; k < 6 && i < apps.length; k++, i++) { const src = A ? A.icon(apps[i].p) : ''; if (src) { const img = document.createElement('img'); img.src = src; img.alt = ''; btns[i].replaceChild(img, btns[i].firstChild); } } if (i < apps.length) setTimeout(step, 16); };
  step();
}

// ================= réglages =================
const SET_FIELDS = ['aHome:addrHome', 'aWork:addrWork', 'tol:tol', 'fuel:fuel', 'consFallback:consFallback', 'oilKm:oilKm', 'oilDate:oilDate', 'oilInt:oilInt', 'ctDate:ctDate'];
function openSettings(focusId) {
  const pr = profiles(); ['p0', 'p1', 'p2'].forEach((id, i) => { $(id).value = pr[i] || ''; });
  SET_FIELDS.forEach((s) => { const [id, k] = s.split(':'); $(id).value = store.get(k, id === 'fuel' ? 'E10' : id === 'tol' ? '3' : ''); });
  $('notifState').textContent = A && A.notifAccess() ? 'Activé ✓' : 'À activer ›';
  const isHome = A && A.isDefaultHome && A.isDefaultHome();
  $('homeState').textContent = isHome ? '✓ Accueil 2008 GT est ton écran d\'accueil officiel' : '⚠ Pas encore ton écran d\'accueil officiel : choisis-le avec un des deux boutons ci-dessous';
  $('homeState').style.color = isHome ? '#B6DD8C' : '#F0B060';
  $('autoState').textContent = A && A.canAutoStart && A.canAutoStart() ? 'Activé ✓' : 'À activer ›';
  $('immState').textContent = !A || !A.immersive || A.immersive() ? 'Oui ✓' : 'Non';
  $('carInfo').textContent = qfInfo().txt + ' — ' + (carEver ? 'Données de la voiture : reçues du boîtier CAN.' : 'Données de la voiture : rien reçu pour l\'instant (vitesse affichée par GPS).');
  $('settings').classList.add('on');
  if (focusId) setTimeout(() => $(focusId).focus(), 100);
}
function saveSettings() {
  store.set('profiles', ['p0', 'p1', 'p2'].map((id) => $(id).value.trim()));
  const oldFuel = store.get('fuel', 'E10');
  SET_FIELDS.forEach((s) => { const [id, k] = s.split(':'); store.set(k, $(id).value.trim()); });
  if (store.get('fuel', 'E10') !== oldFuel) { station = null; updateStation(true); }
  closeOverlays(); render(); toast('Réglages enregistrés');
}
function closeOverlays() { $('drawer').classList.remove('on'); $('settings').classList.remove('on'); assignFor = null; if (document.activeElement) document.activeElement.blur(); }

// ================= actions (appui court / long) =================
function act(a, long) {
  const [k, v] = [a.split(':')[0], a.slice(a.indexOf(':') + 1)];
  if (k !== 'clearTrips') clearArm = false;
  switch (k) {
    case 'tab': tab = v; if (v === 'home') homePage = 0; if (editing) fDone(); else render(); break;
    case 'prof': if (long) openSettings('p' + v); else { store.set('profile', parseInt(v, 10)); render(); toast(`Profil ${profiles()[v]} · thème ${(THEMES.find((t) => t.id === themeIdFor(+v)) || {}).name}`); } break;
    case 'gear': openSettings(); break;
    case 'close': closeOverlays(); break;
    case 'saveSettings': saveSettings(); break;
    case 'toggleImmersive': if (A && A.setImmersive) { A.setImmersive(!A.immersive()); setTimeout(() => { fit(); openSettings(); }, 400); } break;
    case 'open': if (A) A.openSettings(v); else toast('Réglage Android : ' + v); break;
    case 'dock': { const it = DOCK.find((d) => d.id === v); if (long && !it.special) openDrawer(it); else launchDock(it); break; }
    case 'app': if (assignFor) { store.set('dock_' + assignFor.id, v); toast(`« ${assignFor.label} » ouvrira ${(allApps().find((x) => x.p === v) || {}).l || v}`); closeOverlays(); } else { closeOverlays(); if (A) A.launch(v); } break;
    case 'mHome': case 'mWork': { const key = k === 'mHome' ? 'addrHome' : 'addrWork'; const ad = store.get(key, ''); if (long || !ad) { toast('Indique l\'adresse dans les réglages'); openSettings(k === 'mHome' ? 'aHome' : 'aWork'); } else wazeTo(ad); break; }
    case 'mWaze': if (!A || !A.launch(store.get('dock_gps', '') || 'com.waze,com.google.android.apps.maps')) launchDock(DOCK[0]); break;
    case 'recenter': follow = true; if (loc && map) map.setView([loc.lat, loc.lon], Math.max(map.getZoom(), 15)); paint(); break;
    case 'mPrev': if (A) A.media('prev'); break;
    case 'mNext': if (A) A.media('next'); break;
    case 'mPlay': if (!media) launchDock(DOCK[1]); else { if (A) A.media(media.playing ? 'pause' : 'play'); media.playing = !media.playing; paint(); } break;
    case 'mArt': if (media && media.pkg && A) A.launch(media.pkg); else launchDock(DOCK[1]); break;
    case 'stGo': if (!station || !station.lat) toast('Station pas encore trouvée'); else if (!A || !A.openUrl(`https://waze.com/ul?ll=${station.lat},${station.lon}&navigate=yes`)) toast('Waze introuvable'); break;
    case 'clearTrips': if (clearArm) { store.set('trips', []); clearArm = false; toast('Historique effacé'); } else clearArm = true; render(); break;
    case 'addLog': {
      const e = { id: Date.now().toString(36), date: $('fDate').value, type: $('fType').value, km: $('fKm').value, cost: $('fCost').value, note: $('fNote').value.trim() };
      const log = store.get('serviceLog', []); log.push(e); store.set('serviceLog', log);
      if (e.type === 'Vidange' && e.km) { const intv = parseFloat(store.get('oilInt', '')) || 20000; store.set('oilKm', String(Math.round(parseFloat(e.km) + intv))); }
      toast('Ajouté au carnet'); render(); break;
    }
    case 'calib': closeOverlays(); calib = { step: 0 }; tab = 'calib'; render(); break;
    case 'calibNext': calibNext(); break;
    case 'calibReset': calib = { step: 0 }; render(); break;
    case 'calibClear': store.set('calibMap', null); calib = { step: 0 }; toast('Réglage des voyants effacé'); render(); break;
    case 'delLog': store.set('serviceLog', store.get('serviceLog', []).filter((e) => e.id !== v)); render(); break;
    case 'theme': { const m = store.get('profileThemes', {}); m[profIdx()] = v; store.set('profileThemes', m); render(); break; }
    case 'acc': setCustom({ acc: v }); render(); break;
    case 'accCustom': { const h = ($('accHex').value || '').trim(); if (/^#[0-9a-fA-F]{6}$/.test(h)) { setCustom({ acc: h }); render(); } else toast('Couleur invalide (ex. #E0312B)'); break; }
    case 'accReset': setCustom({ acc: null }); render(); break;
    case 'solid': setCustom({ bgType: 'solid', bg: v }); render(); break;
    case 'grad': { const g = GRADIENTS[+v]; setCustom({ bgType: 'grad', g1: g[1], g2: g[2], angle: 135 }); render(); break; }
    case 'gradCustom': setCustom({ bgType: 'grad', g1: $('g1').value, g2: $('g2').value, angle: parseInt($('gAng').value, 10) }); render(); break;
    case 'layout': store.set('layout_' + profIdx(), v); render(); break;
    case 'dockpos': store.set('dockPos_' + profIdx(), v); render(); break;
    case 'editLayout': if (moving()) { toast('Disponible à l\'arrêt'); break; } store.set('layout_' + profIdx(), 'custom'); tab = 'home'; homePage = 0; fEnterEdit(null); break;
    case 'cmp': if (!moving()) cmpAct(v.split(':')); else toast('Disponible à l\'arrêt'); break;
    case 'g': if (!moving()) gAct(v.split(':')); else toast('Disponible à l\'arrêt'); break;
    case 'gsel': gSel = +v; render(); break;
    case 'stk': { const [i, j] = v.split(':').map(Number); stackIdx[i] = j; render(); break; }
    case 'hpage': fAnim = +v > homePage ? 'L' : 'R'; homePage = +v; render(); break;
    case 'h2': fAct(v, long); break;
    case 'toggleAutoStack': store.set('autoStack', !store.get('autoStack', false)); render(); break;
    case 'carImgPick': { const f = $('carImgFile'); if (f) f.click(); break; }
    case 'carPick': store.set('carPick', v); render(); break;
    case 'carImgReset': store.set('carImg', ''); toast('Dessin d\'origine remis'); render(); break;
    case 'bgReset': setCustom({ bgType: null }); render(); break;
    case 'toggleGlass': { const i = profIdx(); setCustom({ glass: !custom(i, themeIdFor(i)).glass }); render(); break; }
    case 'toggleNight': { const i = profIdx(); store.set('autoNight_' + i, !store.get('autoNight_' + i, false)); render(); break; }
  }
}
let press = null, lastTouch = Date.now(), swipe = null;
function setupPress() {
  const st = $('stage');
  st.addEventListener('pointerdown', (e) => { lastTouch = Date.now(); const stk = e.target.closest('[data-stack]'); swipe = { x: e.clientX, y: e.clientY, t: Date.now(), stack: stk ? stk.dataset.stack : null, ok: tab === 'home' && !fPick && !fFolder && !fAsk && (!editing || (e.target.closest('[data-fgridbg]') && !e.target.closest('[data-fitem]'))) && !e.target.closest('.mapslot, .car3dslot, .scroll, input, select, textarea, .ov, [data-noswipe], [data-roadbox], [data-car360], .gpsslot') }; }, true);
  st.addEventListener('pointerup', (e) => {
    if (!swipe || !swipe.ok) return; const s0 = window.innerWidth / 1280; const dx = (e.clientX - swipe.x) / s0, dy = (e.clientY - swipe.y) / s0; const swipe0 = swipe; swipe = null;
    if (swipe0 && swipe0.stack != null && Math.abs(dx) > 50 && Math.abs(dy) < 60) { if (press) { clearTimeout(press.timer); press = null; } stackMove(swipe0.stack, dx < 0 ? 1 : -1); return; }
    if (Math.abs(dx) > 90 && Math.abs(dy) < 90) { const n = Math.max(0, Math.min(homePageCount() - 1, homePage + (dx < 0 ? 1 : -1))); if (n !== homePage) { homePage = n; fAnim = dx < 0 ? 'L' : 'R'; if (press) { clearTimeout(press.timer); press = null; } render(); } }
  }, true);
  st.addEventListener('pointerdown', (e) => {
    const t = e.target.closest('[data-act]'); if (!t) return;
    press = { el: t, x: e.clientX, y: e.clientY, fired: false };
    press.timer = setTimeout(() => { if (press) { press.fired = true; act(t.dataset.act, true); } }, 650);
  });
  st.addEventListener('pointermove', (e) => { if (press && Math.abs(e.clientX - press.x) + Math.abs(e.clientY - press.y) > 20) { clearTimeout(press.timer); press = null; } });
  st.addEventListener('pointerup', (e) => { if (!press) return; clearTimeout(press.timer); const t = e.target.closest('[data-act]'); const p0 = press; press = null; if (!p0.fired && t === p0.el) act(t.dataset.act, false); });
  st.addEventListener('pointercancel', () => { if (press) clearTimeout(press.timer); press = null; });
  st.addEventListener('contextmenu', (e) => { if (!e.target.closest('input, textarea')) e.preventDefault(); });
}

// ================= échelle et démarrage =================
function fit() { const s = window.innerWidth / 1280, st = $('stage'); st.style.transform = `scale(${s})`; st.style.height = (window.innerHeight / s) + 'px'; if (map) setTimeout(() => map.invalidateSize(), 50); }
window.addEventListener('resize', fit);
window.onBackKey = () => { if ($('drawer').classList.contains('on') || $('settings').classList.contains('on')) closeOverlays(); else if (fPick || fFolder || fAsk) { fPick = null; fFolder = null; fFolderEdit = false; fAsk = false; render(); } else if (editing) fDone(); else if (tab !== 'home') { tab = 'home'; render(); } };
window.onHomeKey = () => { closeOverlays(); if (tab !== 'home') { tab = 'home'; render(); } follow = true; if (loc && map) map.setView([loc.lat, loc.lon], 16); };
window.onResumeHome = () => { appsCache = null; fit(); };

function start() {
  fit(); setupPress(); render();
  setInterval(() => { ecoTick(); if (tab === 'calib') { const qi = qfInfo(); setK('qfInfo', qi.txt); setK('qfHex', qi.q.last || ''); } if (tab === 'home') paint(); else if (tab === 'eco' && Date.now() % 10000 < 1000) render(); }, 1000);
  setInterval(() => { if (store.get('autoStack', false) && tab === 'home' && homePage === 0 && !editing && curP && curP.layout === 'custom' && !fPick && !fFolder) { const pg = fCfg().pages[homePage] || []; let ch = false; pg.forEach((it) => { if (it.t === 'w' && it.b.length > 1) { stackIdx[it.id] = ((stackIdx[it.id] || 0) + 1) % it.b.length; ch = true; } }); if (ch) render(); } if (!editing && !fPick && !fFolder && (tab !== 'home' || homePage !== 0) && tab !== 'calib' && tab !== 'settings' && Date.now() - lastTouch > 60000 && !$('settings').classList.contains('on')) { tab = 'home'; homePage = 0; render(); } if (tab === 'themes' && moving()) render(); if (trip) store.set('trip', trip); updateStation(false); maybeLimit(); if (store.get('autoNight_' + profIdx(), false)) { const p = palette(); if (p.tid !== curP.tid) render(); } }, 10000);
  if (A) A.ready();
  if (A && A.isDefaultHome && !A.isDefaultHome()) setTimeout(() => toast('Pour en faire ton écran d\'accueil officiel : roue dentée → Système → Écran d\'accueil'), 2500);
  if (DEMO) demo();
}

// ================= démo (aperçu navigateur) =================
function demo() {
  const q = new URLSearchParams(location.search);
  if (q.get('theme')) { const m = {}; m[0] = q.get('theme'); store.set('profileThemes', m); }
  if (q.get('grad')) setCustom({ bgType: 'grad', g1: GRADIENTS[+q.get('grad')][1], g2: GRADIENTS[+q.get('grad')][2], glass: q.get('glass') === '1' });
  if (q.get('tab')) tab = q.get('tab');
  onLoc(48.5839, 7.7455, 54, 8, 40);
  limit = 50;
  onCar({ speed: 48, rpm: 2100, fuel: 31.5, odo: 91240, range: 412, instant: 4.2, avg1: 5.8, avg2: 6.1, cur1: 6.0, handbrake: 0, washer: 0, ign: 1, lo: 1, hi: 0, fogF: 0, fogR: 0, turnL: 0, turnR: 0, hazard: 0, lock: 1, wFL: 0, wFR: 0, wBL: 0, wBR: 0, sun: 0, beltD: 0, t1Km: 18.4, t2Km: 642.7, t1Spd: 47, t2Spd: 58, raw: [64, 0, 128, 0, 128] });
  loc.alt = 142;
  onDoors({ lf: 0, rf: 0, lb: 0, rb: 0, trunk: 0, bonnet: 0, raw: 0 });
  onMedia({ title: 'Titre du morceau', artist: 'Artiste', app: 'YouTube Music', pkg: 'x', playing: true, pos: 61000, dur: 200000, art: '' }, true);
  weather = { t: 14, c: 61, day: 1, hours: [{ h: '17h', t: 13 }, { h: '18h', t: 12 }, { h: '19h', t: 11 }, { h: '20h', t: 10 }] }; city = 'Strasbourg';
  station = { price: 1.689, label: 'Moins chère · 2,1 km · Av. de Colmar, Strasbourg', lat: 48.57, lon: 7.75 };
  place = 'Rue du Rhin, Strasbourg';
  trip = { start: Date.now() - 23 * 60000, last: Date.now(), dist: 18.4, lat: 48.5839, lon: 7.7455, cons: 5.8, price: 1.689, eco: { secs: 1300, acc: 3, brk: 2, over: 40, rpmHigh: 20, rpmSecs: 1300, prev: 48 } };
  if (!tripsHistory().length) { const l = []; for (let i = 1; i <= 12; i++) { const s = Date.now() - i * 13 * 3600e3; l.unshift({ start: s, end: s + (15 + i * 3) * 60000, dist: 5 + (i * 7) % 30, cons: 5.4 + (i % 4) * 0.3, price: 1.69, score: 62 + (i * 11) % 35 }); } store.set('trips', l); }
  if (!store.get('serviceLog', []).length) store.set('serviceLog', [{ id: 'a', date: '2026-05-12', type: 'Vidange', km: '75240', cost: '129', note: 'Garage du centre' }, { id: 'b', date: '2026-03-02', type: 'Contrôle technique', km: '72100', cost: '78', note: 'Favorable' }, { id: 'c', date: '2025-11-20', type: 'Pneus', km: '68000', cost: '420', note: '4 pneus hiver' }]);
  store.set('oilKm', '95000'); store.set('ctDate', '2027-03-14');
  render();
}

document.addEventListener('DOMContentLoaded', start);
