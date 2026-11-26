/* 7.38 : transfert depuis le téléphone par le serveur de l'autoradio (réseau local, sans service Internet). */
(() => {
 'use strict';
 const native = () => window.Transfer738Native || null;
 const parse = (s, d) => { try { return JSON.parse(s); } catch (e) { return d; } };
 const mo = n => (n / 1048576).toLocaleString('fr-FR', { maximumFractionDigits: n < 10485760 ? 1 : 0 }) + ' Mo';
 const TITLES = { ticket: 'Envoyer un ticket depuis le téléphone', gpx: 'Importer un trajet GPX depuis le téléphone', fichier: 'Envoyer un fichier depuis le téléphone', telechargement: 'Télécharger sur le téléphone' };
 let overlay = null, timer = null, current = null;
 // ---------- 7.41 : envoi par Internet (4G) ----------
 // Le téléphone dépose le fichier dans une boîte aux lettres publique (ntfy.sh) dont l'adresse
 // est un code secret propre au QR ; l'autoradio la consulte toutes les 3 s et télécharge le fichier.
 const RELAY = 'https://ntfy.sh/';
 const PAGE = () => String(store.get('relayPage741', 'https://roudousa-67.github.io/accueil2008/envoi.html'));
 const internetMode = () => store.get('transferMode741', 'internet') !== 'wifi';
 let relay = null, pageOK = null, pageAt = 0, forceWifi = false;
 function randomTopic() {
  const a = new Uint8Array(12);
  if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a); else for (let i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256);
  return 'a08-' + Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
 }
 async function checkPage() {
  if (Date.now() - pageAt < 60000 && pageOK !== null) return pageOK;
  pageAt = Date.now();
  try { const r = await http(PAGE()); pageOK = !!(r && r.ok && /Accueil 2008/.test(String(r.b))); } catch (e) { pageOK = false; }
  return pageOK;
 }
 function relayStop() { if (relay && relay.timer) clearInterval(relay.timer); relay = null; }
 function relayStart(kind) {
  relayStop();
  relay = { topic: randomTopic(), kind, since: Math.floor(Date.now() / 1000) - 5, until: Date.now() + 15 * 60000, seen: new Set(), busy: false, got: 0 };
  relay.timer = setInterval(relayPoll, 3000);
  return relay;
 }
 async function relayPoll() {
  const r0 = relay; if (!r0 || r0.busy) return;
  if (Date.now() > r0.until) { relayStop(); return; }
  r0.busy = true;
  try {
   const r = await http(`${RELAY}${r0.topic}/json?poll=1&since=${r0.since}`);
   if (r && r.ok) for (const line of String(r.b).split('\n')) {
    let m = null; try { m = JSON.parse(line); } catch (e) { continue; }
    if (!m || m.event !== 'message' || r0.seen.has(m.id)) continue;
    r0.seen.add(m.id);
    const att = m.attachment; if (!att || !att.url) continue;
    const n = native();
    if (n && n.download) { n.download(String(att.url), r0.kind, String(att.name || r0.kind)); r0.got++; status741('Fichier reçu sur Internet : téléchargement…'); }
   }
  } catch (e) { window.Errors738 && Errors738.add('envoi par Internet', e); }
  finally { r0.busy = false; }
 }
 function status741(text) { const el = $('transferStatus738'); if (el) el.textContent = text; }

 function status() {
  const n = native();
  if (!n) return { native: false, running: false, ips: [], ip: '', url: '', used: 0, quota: 1073741824, files: 0, error: '' };
  const s = parse(n.status(), {}), ip = (s.ips || [])[0] || '';
  return Object.assign({ ips: [], used: 0, quota: 1073741824 }, s, { ip, url: ip ? `http://${ip}:${s.port}` : '' });
 }
 function start() { const n = native(); if (n) try { n.start(); } catch (e) { window.Errors738 && Errors738.add('serveur de transfert', e); } return status(); }
 function stop() { const n = native(); if (n) n.stop(); render(); }
 function list() { const n = native(); return n ? parse(n.list(), []) : []; }
 function dataUrl(name) { const n = native(); return n ? n.dataUrl(name) : ''; }
 function keep(name, value) { const n = native(); if (n) n.keep(name, !!value); }
 function keepOnly(names) { const n = native(); if (n) n.keepOnly(names.join('\n')); }
 function saveText(name, mime, text) { const n = native(); return n ? parse(n.saveText(name, text), { ok: false }) : { ok: false }; }

 function close() {
  if (timer) clearInterval(timer); timer = null; current = null;
  if (overlay) overlay.remove(); overlay = null;
  if (window.Frame710) Frame710.sync();
 }
 function qrSvg(text) {
  const qr = qrcode(0, 'M'); qr.addData(text); qr.make();
  return qr.createSvgTag({ cellSize: 4, margin: 4, scalable: true }).replace('<svg ', '<svg aria-label="QR de transfert" style="display:block;width:min(300px,40vh);height:min(300px,40vh)" ');
 }
 function overlayHTML(kind, file) {
  const s = start(), p = curP || palette();
  const head = `<h2 style="margin:0">${esc(TITLES[kind] || TITLES.fichier)}</h2>`;
  if (internetMode() && !forceWifi && kind !== 'telechargement') {
   const n = native();
   if (!n || !n.download) return head + `<p style="max-width:640px;text-align:center">Le module Android installé ne sait pas encore recevoir par Internet. Installe la version 7.41 depuis Paramètres → Mises à jour.</p>${chipBtn(p, 'transfer738:wifi', 'Passer par le Wi-Fi de l’autoradio')}`;
   if (pageOK === false) return head + `<p style="max-width:700px;text-align:center;line-height:1.5">La page d’envoi pour le téléphone n’est pas encore en ligne.<br>Sur GitHub : ton dépôt <b>accueil2008</b> → <b>Settings</b> → <b>Pages</b> → Source « Deploy from a branch », branche <b>main</b>, dossier <b>/docs</b> → <b>Save</b>. Attends 1 à 2 minutes puis touche « Réessayer ».</p><div style="display:flex;gap:10px">${chipBtn(p, 'transfer738:retry', 'Réessayer', true)}${chipBtn(p, 'transfer738:wifi', 'Passer par le Wi-Fi de l’autoradio')}</div>`;
   const r = relayStart(kind), url = `${PAGE()}#t=${r.topic}&k=${encodeURIComponent(kind)}&x=${r.until}`;
   current = { kind, file, at: Date.now(), via: 'internet' };
   return head + `<div style="background:#fff;padding:14px;border-radius:14px">${qrSvg(url)}</div><p id="transferStatus738" role="status" style="margin:0">QR valable 15 minutes · en attente du téléphone</p><p style="max-width:680px;text-align:center;line-height:1.45;margin:0">Scanne le QR avec l’appareil photo de ton téléphone. <b>Pas besoin de Wi-Fi</b> : la 4G suffit, des deux côtés. Puis ${kind === 'ticket' ? 'prends le ticket en photo' : 'choisis le fichier'} et touche Envoyer.</p>${chipBtn(p, 'transfer738:wifi', 'Passer plutôt par le Wi-Fi de l’autoradio')}`;
  }
  if (!s.native) return head + `<p style="max-width:640px;text-align:center">Le module Android installé ne contient pas encore le serveur de l’autoradio. Installe la version complète 7.38 depuis Paramètres → Mises à jour.</p>`;
  if (!s.running) return head + `<p style="max-width:640px;text-align:center">Le serveur de l’autoradio n’a pas pu démarrer${s.error ? ' : ' + esc(s.error) : ''}.</p>${chipBtn(p, 'transfer738:retry', 'Réessayer', true)}`;
  if (!s.ip) return head + `<p style="max-width:680px;text-align:center;line-height:1.5">L’autoradio n’est sur aucun réseau Wi-Fi. Comme il utilise sa propre carte SIM :<br>1. Active son <b>point d’accès Wi-Fi</b> (partage de connexion).<br>2. Connecte ton téléphone à ce Wi-Fi.<br>3. Touche « Réessayer ».</p><div style="display:flex;gap:10px">${chipBtn(p, 'transfer738:hotspot', 'Ouvrir le point d’accès', true)}${chipBtn(p, 'transfer738:retry', 'Réessayer')}</div>`;
  const n = native(), token = n.newToken(kind, 15, file || ''), url = `${s.url}/?t=${token}`;
  current = { kind, file, at: Date.now(), received: s.received };
  return head + `<div style="background:#fff;padding:14px;border-radius:14px">${qrSvg(url)}</div><p id="transferStatus738" role="status" style="margin:0">QR valable 15 minutes · en attente du téléphone</p><p style="max-width:680px;text-align:center;line-height:1.45;margin:0">Ton téléphone doit être connecté au Wi-Fi de l’autoradio (${esc(s.ip)}). Scanne le QR avec l’appareil photo puis ${kind === 'telechargement' ? 'touche « Télécharger le rapport »' : 'choisis la photo ou le fichier à envoyer'}.</p>`;
 }
 function open(kind, file) {
  close();
  overlay = document.createElement('div'); overlay.className = 'ov on'; overlay.setAttribute('data-transfer738', '');
  overlay._kind = kind; overlay._file = file;
  overlay.style.cssText = 'z-index:6000;align-items:center;justify-content:center;gap:14px;flex-direction:column;display:flex';
  const fill = () => { overlay.innerHTML = overlayHTML(kind, file) + `<button class="close" data-act="transfer738:close" style="margin-top:6px">Fermer</button>`; };
  fill(); overlay._fill = fill;
  $('screen').appendChild(overlay); if (window.Frame710) Frame710.sync();
  // Page d'envoi en ligne ? (vérifiée une fois par minute au plus) — sinon, explications.
  if (internetMode() && kind !== 'telechargement') checkPage().then(ok => { if (!ok && overlay && overlay._fill === fill) { relayStop(); fill(); } });
  timer = setInterval(() => {
   if (!overlay) return;
   if (current && Date.now() - current.at > 15 * 60000) { const el = $('transferStatus738'); if (el) el.textContent = 'Ce QR a expiré : touche « Fermer » puis recommence.'; }
  }, 5000);
 }
 // Appelé par le module Android à chaque fichier reçu.
 function onReceived(info) {
  if (info && info.error) { status741('Réception impossible : ' + info.error); toast('Fichier non reçu : ' + info.error); return; }
  if (!info || !info.name) return;
  const name = String(info.name);
  if (info.via === 'internet' && relay && (relay.kind === 'ticket' || relay.kind === 'gpx')) relayStop();
  try {
   if (info.type === 'gpx') {
    const xml = native().text(name);
    Driver728.parseGPX(xml); close(); Driver728.loadGPX(xml); toast('Trajet GPX reçu et importé.');
   } else if (/^(jpg|png)$/.test(info.type) && (info.kind === 'ticket' || current && current.kind === 'ticket')) {
    close(); Journeys733.receiveReceipt('file738:' + name); toast('Ticket reçu. Vérifie les montants puis enregistre le plein.');
   } else {
    const el = $('transferStatus738'); if (el) el.textContent = 'Reçu : ' + name;
    toast('Fichier reçu sur l’autoradio : ' + name);
   }
  } catch (e) { window.Errors738 && Errors738.add('réception du téléphone', e); toast('Fichier reçu mais illisible : ' + name); }
  if (tab === 'settings') render();
 }
 window.Transfer738 = { status, start, stop, list, dataUrl, keep, keepOnly, saveText, open, close, onReceived, showQR: (file) => open('telechargement', file), relay: () => relay, relayPoll, checkPage, page: PAGE, setPageOK: v => { pageOK = v; pageAt = Date.now(); } };

 // Réglages : Trajets et carburant → Transfert depuis le téléphone.
 function settings(p) {
  const s = status(), files = list().slice(0, 12), pct = Math.min(100, s.used / s.quota * 100);
  const row = (title, desc, ctl) => setRow(p, title, desc, ctl || '');
  const state = !s.native ? 'Module Android sans serveur (installe la 7.38 complète).' : s.running ? 'En marche' : 'Arrêté';
  const net = s.ip ? `Wi-Fi de l’autoradio : ${esc(s.url)}` : 'Aucun Wi-Fi : active le point d’accès de l’autoradio et connecte ton téléphone dessus.';
  if (pageOK === null) checkPage().then(() => { if (tab === 'settings') render(); });
  const pageState = pageOK === true ? 'En ligne.' : pageOK === false ? 'Pas encore en ligne : sur GitHub, ton dépôt accueil2008 → Settings → Pages → Source « Deploy from a branch », branche main, dossier /docs → Save.' : 'Vérification…';
  // 7.50 : le choix « Mode d’envoi » est retiré ; l’envoi passe par Internet (Wi-Fi en secours automatique).
  return ''
   + setRow(p, 'Page d’envoi pour le téléphone', esc(pageState), chipBtn(p, 'transfer738:checkpage', 'Vérifier'))
   + `<p style="line-height:1.5;color:${p.mut}">Par Internet, le fichier passe par une boîte aux lettres gratuite (ntfy.sh) dont l’adresse est un code secret propre à chaque QR ; il s’efface au bout de quelques heures. Par le Wi-Fi, il va directement du téléphone à l’autoradio.</p>`
   + row('Serveur de l’autoradio', state, s.native ? (s.running ? chipBtn(p, 'transfer738:stop', 'Arrêter') : chipBtn(p, 'transfer738:start', 'Démarrer', true)) : '')
   + row('Réseau', net, s.ip ? '' : chipBtn(p, 'transfer738:hotspot', 'Point d’accès'))
   + row('Stockage réservé', `${mo(s.used)} utilisés sur 1 Go · ${s.files || 0} fichiers. Une fois plein, les fichiers les plus anciens non rattachés à un plein sont supprimés.<div style="height:8px;border-radius:5px;background:#ffffff22;margin-top:6px;overflow:hidden"><i style="display:block;height:100%;width:${pct.toFixed(1)}%;background:#61b04a"></i></div>`)
   + row('Envoyer depuis le téléphone', 'Un QR valable 15 minutes, pour ce seul envoi.', chipBtn(p, 'transfer738:ticket', 'Ticket', true) + chipBtn(p, 'transfer738:gpx', 'Trajet GPX') + chipBtn(p, 'transfer738:fichier', 'Autre fichier'))
   + (files.length ? `<div style="margin-top:10px">${files.map(f => setRow(p, esc(f.name), `${mo(f.size)} · ${new Date(f.time).toLocaleString('fr-FR')}${f.kept ? ' · rattaché à un plein' : ''}`, f.kept ? '' : chipBtn(p, 'transfer738:remove:' + f.name, 'Supprimer'))).join('')}</div>` : '');
 }
 const cat = SETCATS.find(c => c[0] === 'Trajets et carburant');
 if (cat) {
  const i = cat[1].findIndex(s => s[0] === 'Importer depuis le téléphone');
  if (i >= 0) cat[1][i] = ['Transfert depuis le téléphone', settings]; else cat[1].push(['Transfert depuis le téléphone', settings]);
 }
 const open0 = window.openSet;
 window.openSet = function (c, sub) { if (sub === 'Importer depuis le téléphone') sub = 'Transfert depuis le téléphone'; return open0.call(this, c, sub); };
 const act0 = window.act;
 window.act = function (a, long) {
  if (typeof a === 'string' && (a.startsWith('transfer738:') || a.startsWith('transfer734:'))) {
   const op = a.split(':')[1], arg = a.split(':').slice(2).join(':');
   if (op === 'close') { forceWifi = false; close(); return; }
   if (op === 'wifi') { forceWifi = true; relayStop(); if (overlay && overlay._fill) overlay._fill(); return; }
   if (op === 'mode' && ['internet', 'wifi'].includes(arg)) { store.set('transferMode741', arg); render(); return; }
   if (op === 'checkpage') { pageAt = 0; checkPage().then(() => render()); return; }
   if (['ticket', 'gpx', 'fichier'].includes(op)) { open(op); return; }
   if (op === 'retry') { pageAt = 0; pageOK = null; if (overlay && overlay._fill) { overlay._fill(); checkPage().then(ok => { if (overlay && overlay._fill) overlay._fill(); }); } return; }
   if (op === 'hotspot') { if (typeof fwOpen === 'function') fwOpen(['android.settings.TETHER_SETTINGS', 'android.settings.WIFI_AP_SETTINGS', 'android.settings.WIRELESS_SETTINGS'], 'Point d’accès'); return; }
   if (op === 'start') { start(); render(); return; }
   if (op === 'stop') { stop(); return; }
   if (op === 'remove' && arg) { const n = native(); if (n) n.remove(arg); render(); return; }
   return;
  }
  return act0.apply(this, arguments);
 };
 const back0 = window.onBackKey;
 window.onBackKey = function () { if (overlay) { close(); return; } return back0 ? back0.apply(this, arguments) : undefined; };
 window.addEventListener('pagehide', close);
 // L'import GPX de la vue conducteur passe aussi par l'autoradio.
 const nav = SETCATS.find(c => c[0] === 'Navigation'), driver = nav && nav[1].find(s => s[0] === 'Vue conducteur');
 if (driver) { const old = driver[1]; driver[1] = p => old(p) + setRow(p, 'Importer un GPX depuis le téléphone', 'Scanne le QR avec le téléphone connecté au Wi-Fi de l’autoradio.', chipBtn(p, 'transfer738:gpx', 'Importer par QR')); }
 if (window.Settings720) Settings720.index = null;
})();
