/* 7.51 : Entretien → « Pneus » (usure estimée selon les km depuis le montage) et « Factures » (photo, montant,
   kilométrage, recherche) ; Pleins → « Lire un ticket » (reconnaissance du texte de la photo : litres, total,
   prix au litre). */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 const LIST = [['tyres751', 'Usure des pneus', 'Entretien → Pneus : estimation selon les kilomètres depuis le montage.'], ['bills751', 'Factures du garage', 'Entretien → Factures : photo, montant et kilométrage, retrouvables en deux secondes.'], ['ocr751', 'Ticket lu automatiquement', 'Pleins → « Lire un ticket » : la photo remplit les litres et le prix (téléchargement de 15 Mo la première fois).']];
 if (window.Try750) LIST.forEach(([id, l, d]) => Try750.register(id, l, d, '7.51'));
 const on = id => !window.Try750 || Try750.on(id);
 const eur = v => (Number(v) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
 const num = s => { const v = parseFloat(String(s || '').replace(/\s/g, '').replace(',', '.')); return Number.isFinite(v) ? v : NaN; };

 // Compteur actuel : CAN de la voiture, sinon dernier plein + trajets depuis.
 function kmNow() {
  const odo = safe(() => (typeof car !== 'undefined' && car && Date.now() - car.ts < 600000) ? Number(val(car.odo)) : NaN, NaN);
  if (odo > 0) return Math.round(odo);
  const last = safe(() => fuelLog().filter(f => f.k > 0).at(-1), null), man = store.get('kmManual751', null);
  let base = last ? { k: last.k, t: last.t } : null; if (man && (!base || man.t > base.t)) base = man;
  if (!base) return null;
  const since = safe(() => Journeys733.rows().filter(t => t.start > base.t).reduce((n, t) => n + (Number(t.km) || 0), 0), 0);
  return Math.round(base.k + since);
 }

 // ---------- 35. Pneus ----------
 const tyres = () => Object.assign({ front: { k: null, d: '' }, rear: { k: null, d: '' }, lifeF: 40000, lifeR: 50000 }, store.get('tyres751', {}));
 function wear(axle) { const T = tyres(), a = T[axle], km = kmNow(), life = axle === 'front' ? T.lifeF : T.lifeR; if (a.k == null || km == null) return null; const used = Math.max(0, km - a.k); return { used, pct: Math.max(0, Math.round(100 - used / life * 100)), left: Math.max(0, life - used) }; }
 function pageTyres(p) {
  const T = tyres(), km = kmNow();
  const ax = (k, l, life) => { const w = wear(k), col = !w ? p.mut : w.pct > 40 ? '#2f9e44' : w.pct > 15 ? '#f2a33a' : '#e0312b';
   return `<div style="${box(p, 'padding:16px;display:flex;flex-direction:column;gap:10px')}"><div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-size:19px">${l}</b><span style="font-size:13px;color:${p.mut}">${T[k].d ? 'montés le ' + esc(T[k].d) : ''}</span></div>
   ${w ? `<div style="font-size:40px;font-weight:800;color:${col}">${w.pct} %</div><div style="height:12px;border-radius:6px;background:${p.card2};overflow:hidden"><div style="height:100%;width:${w.pct}%;background:${col}"></div></div><div style="font-size:14px;color:${p.mut}">${w.used.toLocaleString('fr-FR')} km depuis le montage · encore ≈ ${w.left.toLocaleString('fr-FR')} km</div>${w.pct <= 15 ? '<div style="color:#e0312b;font-weight:700">Fais vérifier la profondeur des sculptures (1,6 mm minimum légal).</div>' : ''}` : `<div style="font-size:14px;color:${p.mut}">Indique le compteur au montage pour voir l’usure.</div>`}
   <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><input id="ty751${k}" type="number" placeholder="Compteur au montage" value="${T[k].k ?? ''}" style="${fld(p, 'width:190px')}"><input id="tyl751${k}" type="number" placeholder="Durée de vie (km)" value="${life}" style="${fld(p, 'width:170px')}">${chipBtn(p, 'g751:tysave:' + k, 'Enregistrer')}${km != null ? chipBtn(p, 'g751:tynow:' + k, 'Changés aujourd’hui', true) : ''}</div></div>`; };
  return pageFrame(p, `<div class="scroll" style="overflow:auto;display:flex;flex-direction:column;gap:12px;padding:2px"><div style="font-size:14px;color:${p.mut}">Compteur actuel : <b style="color:${p.txt}">${km != null ? km.toLocaleString('fr-FR') + ' km' : 'inconnu'}</b> ${km == null ? '' : '(voiture, sinon dernier plein + trajets)'} · estimation selon les kilomètres, à confirmer par un contrôle visuel.</div>${km == null ? `<div style="display:flex;gap:8px;align-items:center">${'<input id="km751" type="number" placeholder="Compteur actuel" style="' + fld(p, 'width:190px') + '">'}${chipBtn(p, 'g751:km', 'Enregistrer le compteur', true)}</div>` : ''}<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:12px">${ax('front', 'Pneus avant', T.lifeF)}${ax('rear', 'Pneus arrière', T.lifeR)}</div></div>`);
 }

 // ---------- 38. Factures du garage ----------
 const bills = () => (store.get('bills751', []) || []).slice().sort((a, b) => b.t - a.t);
 const B = { q: '', photo: null, open: null };
 function resize(file, max) { return new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, max / Math.max(im.width, im.height)), cv = document.createElement('canvas'); cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); ok(cv.toDataURL('image/jpeg', .72)); }; im.onerror = ko; im.src = r.result; }; r.onerror = ko; r.readAsDataURL(file); }); }
 function pageBills(p) {
  const q = B.q.trim().toLowerCase(), list = bills().filter(b => !q || [b.g, b.n, String(b.e), String(b.k), new Date(b.t).toLocaleDateString('fr-FR')].join(' ').toLowerCase().includes(q));
  const total = list.reduce((n, b) => n + (b.e || 0), 0), today = new Date().toISOString().slice(0, 10);
  const open = B.open && bills().find(b => b.id === B.open), img = open && open.ph ? safe(() => localStorage.getItem(open.ph), '') : '';
  const form = `<details style="${box(p, 'padding:12px 14px')}" ${B.photo ? 'open' : ''}><summary style="cursor:pointer;font-weight:700">+ Ajouter une facture</summary><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;margin-top:10px">
   <input id="bi751d" type="date" value="${today}" style="${fld(p)}"><input id="bi751g" placeholder="Garage" value="${esc(store.get('lastGarage751', ''))}" style="${fld(p)}"><input id="bi751e" type="text" inputmode="decimal" placeholder="Montant (€)" style="${fld(p)}"><input id="bi751k" type="number" placeholder="Kilométrage" value="${kmNow() ?? ''}" style="${fld(p)}"><input id="bi751n" placeholder="Travaux (vidange, freins…)" style="${fld(p)}"></div>
   <div style="display:flex;gap:8px;align-items:center;margin-top:10px;flex-wrap:wrap"><label style="${box(p, 'padding:10px 14px;cursor:pointer;font-weight:600')}">📷 ${B.photo ? 'Photo prête ✓' : 'Ajouter la photo'}<input id="bi751f" type="file" accept="image/*" style="display:none"></label>${chipBtn(p, 'g751:billsave', 'Enregistrer la facture', true)}</div></details>`;
  const rows = list.map(b => `<button data-act="g751:billopen:${b.id}" style="display:grid;grid-template-columns:110px 1fr 120px 110px 40px;gap:10px;align-items:center;width:100%;text-align:left;padding:12px 10px;border-bottom:1px solid #ffffff12;color:${p.txt}"><span>${new Date(b.t).toLocaleDateString('fr-FR')}</span><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><b>${esc(b.g || 'Garage')}</b> · ${esc(b.n || '')}</span><span>${b.k ? b.k.toLocaleString('fr-FR') + ' km' : ''}</span><b>${eur(b.e)}</b><span>${b.ph ? '📷' : ''}</span></button>`).join('');
  const viewer = open ? `<div data-act="g751:billclose" style="position:absolute;inset:0;z-index:5200;background:#000d;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;padding:16px"><div style="color:#fff;font-size:18px"><b>${esc(open.g || '')}</b> · ${new Date(open.t).toLocaleDateString('fr-FR')} · ${eur(open.e)} · ${esc(open.n || '')}</div>${img ? `<img src="${img}" alt="" style="max-width:100%;max-height:78%;border-radius:10px">` : '<div style="color:#fff">Pas de photo.</div>'}<div style="display:flex;gap:8px">${chipBtn(p, 'g751:billclose', 'Fermer', true)}${chipBtn(p, 'g751:billdel:' + open.id, B.delArm === open.id ? 'Touche encore pour supprimer' : 'Supprimer')}</div></div>` : '';
  return pageFrame(p, `<div class="scroll" style="overflow:auto;display:flex;flex-direction:column;gap:12px;padding:2px;position:relative"><div style="display:flex;gap:10px;align-items:center"><input id="bi751q" type="search" placeholder="Rechercher : garage, travaux, date, montant…" value="${esc(B.q)}" style="${fld(p, 'flex:1')}"><span style="color:${p.mut}">${list.length} facture${list.length > 1 ? 's' : ''} · ${eur(total)}</span></div>${form}<div style="${box(p, 'padding:4px 8px')}">${rows || `<div style="padding:14px;color:${p.mut}">Aucune facture.</div>`}</div></div>${viewer}`);
 }
 document.addEventListener('change', async e => {
  const el = e.target; if (!el) return;
  if (el.id === 'bi751f' && el.files && el.files[0]) { try { B.photo = await resize(el.files[0], 1400); toast('Photo prête.'); } catch (x) { toast('Photo illisible.'); } render(); }
  if (el.id === 'ocr751f' && el.files && el.files[0]) readTicket(el.files[0]);
 });
 document.addEventListener('input', e => { if (e.target && e.target.id === 'bi751q') { B.q = e.target.value; clearTimeout(B.qt); B.qt = setTimeout(() => { render(); const i = document.getElementById('bi751q'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 350); } });
 function saveBill() {
  const v = id => (document.getElementById(id) || {}).value || '';
  const e = num(v('bi751e')), k = Math.round(num(v('bi751k'))), t = Date.parse(v('bi751d') + 'T12:00:00');
  if (!(e > 0 && e < 100000) || !Number.isFinite(t)) { toast('Indique au moins la date et le montant.'); return; }
  const id = 'b' + Date.now().toString(36), rec = { id, t, g: v('bi751g').slice(0, 80), e: Math.round(e * 100) / 100, k: k > 0 ? k : null, n: v('bi751n').slice(0, 160) };
  if (B.photo) { try { localStorage.setItem('bill751-' + id, B.photo); rec.ph = 'bill751-' + id; } catch (x) { toast('Mémoire pleine : facture enregistrée sans photo.'); } }
  store.set('bills751', bills().concat(rec)); if (rec.g) store.set('lastGarage751', rec.g); B.photo = null; toast('Facture enregistrée.'); render();
 }

 // ---------- 27. Ticket lu automatiquement ----------
 const OCR = { busy: false, msg: '' };
 function loadTesseract() {
  if (window.Tesseract) return Promise.resolve();
  return new Promise((ok, ko) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js'; s.onload = ok; s.onerror = () => ko(Error('téléchargement impossible')); document.head.appendChild(s); });
 }
 // Analyse du texte d'un ticket de carburant : litres, total payé, prix au litre.
 function parseTicket(text) {
  const t = String(text || '').replace(/\r/g, '').replace(/[Oo](?=[,.]\d)/g, '0'), n = s => parseFloat(String(s).replace(',', '.'));
  let litres = null, total = null, per = null, m;
  if ((m = t.match(/(\d{1,3}[,.]\d{2,3})\s*(?:l\b|litres?|ltr)/i))) litres = n(m[1]);
  if (!litres && (m = t.match(/(?:volume|quantit[eé]|qt[eé])\D{0,12}(\d{1,3}[,.]\d{2,3})/i))) litres = n(m[1]);
  if ((m = t.match(/(\d[,.]\d{3})\s*(?:€|eur|e)?\s*\/\s*l/i)) || (m = t.match(/(?:prix|p\.?u\.?)\D{0,15}(\d[,.]\d{3})/i))) per = n(m[1]);
  const tot = [...t.matchAll(/(?:total|ttc|montant|à payer|a payer|carte|cb)\D{0,20}(\d{1,4}[,.]\d{2})(?!\d)/gi)].map(x => n(x[1])).filter(x => x > 1 && x < 2000);
  if (tot.length) total = Math.max(...tot);
  if (!total && litres && per) total = Math.round(litres * per * 100) / 100;
  if (!per && litres && total) per = Math.round(total / litres * 1000) / 1000;
  if (!litres && total && per) litres = Math.round(total / per * 100) / 100;
  return { litres, total, per };
 }
 function fill(id, v) { const el = document.getElementById(id); if (!el || v == null || !Number.isFinite(v)) return false; el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true })); return true; }
 async function readTicket(file) {
  if (OCR.busy) return; OCR.busy = true; OCR.msg = 'Lecture du ticket… (la première fois, téléchargement d’environ 15 Mo)'; status();
  try {
   await loadTesseract();
   const img = await resize(file, 1800);
   const r = await Tesseract.recognize(img, 'fra', { logger: m => { if (m && m.status === 'recognizing text') { OCR.msg = 'Lecture du ticket… ' + Math.round((m.progress || 0) * 100) + ' %'; status(); } } });
   const v = parseTicket(r && r.data && r.data.text);
   const okL = fill('j733-litres', v.litres), okE = fill('j733-paid', v.total), okP = fill('j733-perLitre', v.per);
   OCR.msg = okL || okE || okP ? `Ticket lu : ${v.litres ? v.litres + ' L' : '? L'} · ${v.total ? eur(v.total) : '? €'}${v.per ? ' · ' + v.per + ' €/L' : ''}. Vérifie avant d’enregistrer.` : 'Ticket illisible : rapproche-toi, à plat, bien éclairé.';
  } catch (e) { OCR.msg = 'Lecture impossible : ' + String(e && e.message || e).slice(0, 60); }
  finally { OCR.busy = false; status(); }
 }
 function status() { const el = document.getElementById('ocr751s'); if (el) el.textContent = OCR.msg; }
 function injectOcr() {
  if (!on('ocr751')) return;
  const l = document.getElementById('j733-litres'); if (!l || document.getElementById('ocr751')) return;
  const form = l.closest('.j733-form') || l.parentElement; if (!form) return;
  const div = document.createElement('div'); div.id = 'ocr751'; div.style.cssText = 'display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:6px 0';
  div.innerHTML = `<label style="padding:10px 14px;border-radius:10px;background:#2a3648;color:#fff;font-weight:700;cursor:pointer">📷 Lire un ticket<input id="ocr751f" type="file" accept="image/*" style="display:none"></label><span id="ocr751s" style="font-size:13px;opacity:.8">${esc(OCR.msg || 'La photo du ticket remplit les litres et le prix.')}</span>`;
  form.parentElement.insertBefore(div, form);
 }

 // ---------- Branchements ----------
 if (typeof svcSubs !== 'undefined') { if (!svcSubs.some(s => s[0] === 'pneus')) svcSubs.push(['pneus', 'Pneus']); if (!svcSubs.some(s => s[0] === 'factures')) svcSubs.push(['factures', 'Factures']); }
 const ps0 = window.pageService;
 window.pageService = function (p) {
  if (svcSub === 'pneus') return on('tyres751') ? pageTyres(p) : pageFrame(p, '<div style="padding:20px">Désactivé dans Nouveautés à tester.</div>');
  if (svcSub === 'factures') return on('bills751') ? pageBills(p) : pageFrame(p, '<div style="padding:20px">Désactivé dans Nouveautés à tester.</div>');
  return ps0.apply(this, arguments);
 };
 const r0 = window.render;
 window.render = function () { const o = r0.apply(this, arguments); safe(injectOcr); return o; };
 const act0 = window.act;
 window.act = function (a) {
  if (typeof a !== 'string' || !a.startsWith('g751:')) return act0.apply(this, arguments);
  const [, op, k] = a.split(':'), v = id => (document.getElementById(id) || {}).value;
  const T = tyres();
  if (op === 'tysave') { const km = Math.round(num(v('ty751' + k))), life = Math.round(num(v('tyl751' + k))); T[k] = { k: km > 0 ? km : null, d: T[k].d || '' }; if (life >= 5000 && life <= 150000) T[k === 'front' ? 'lifeF' : 'lifeR'] = life; store.set('tyres751', T); toast('Enregistré.'); }
  else if (op === 'tynow') { const km = kmNow(); if (km != null) { T[k] = { k: km, d: new Date().toLocaleDateString('fr-FR') }; store.set('tyres751', T); toast('Pneus notés comme neufs.'); } }
  else if (op === 'km') { const km = Math.round(num(v('km751'))); if (km > 0) store.set('kmManual751', { k: km, t: Date.now() }); }
  else if (op === 'billsave') { saveBill(); return; }
  else if (op === 'billopen') { B.open = k; B.delArm = null; }
  else if (op === 'billclose') { B.open = null; }
  else if (op === 'billdel') { if (B.delArm === k) { const b = bills().find(x => x.id === k); if (b && b.ph) safe(() => localStorage.removeItem(b.ph)); store.set('bills751', bills().filter(x => x.id !== k)); B.open = null; B.delArm = null; } else B.delArm = k; }
  render();
 };
 window.Garage751 = { kmNow, wear, tyres, bills, parseTicket, readTicket, injectOcr, B, OCR };
})();
