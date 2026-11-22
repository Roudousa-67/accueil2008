/* 7.38 : transfert depuis le téléphone par le serveur de l'autoradio (réseau local, sans service Internet). */
(() => {
 'use strict';
 const native = () => window.Transfer738Native || null;
 const parse = (s, d) => { try { return JSON.parse(s); } catch (e) { return d; } };
 const mo = n => (n / 1048576).toLocaleString('fr-FR', { maximumFractionDigits: n < 10485760 ? 1 : 0 }) + ' Mo';
 const TITLES = { ticket: 'Envoyer un ticket depuis le téléphone', gpx: 'Importer un trajet GPX depuis le téléphone', fichier: 'Envoyer un fichier depuis le téléphone', telechargement: 'Télécharger sur le téléphone' };
 let overlay = null, timer = null, current = null;

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
  overlay.style.cssText = 'z-index:6000;align-items:center;justify-content:center;gap:14px;flex-direction:column;display:flex';
  const fill = () => { overlay.innerHTML = overlayHTML(kind, file) + `<button class="close" data-act="transfer738:close" style="margin-top:6px">Fermer</button>`; };
  fill(); overlay._fill = fill;
  $('screen').appendChild(overlay); if (window.Frame710) Frame710.sync();
  timer = setInterval(() => {
   if (!overlay) return;
   if (current && Date.now() - current.at > 15 * 60000) { const el = $('transferStatus738'); if (el) el.textContent = 'Ce QR a expiré : touche « Fermer » puis recommence.'; }
  }, 5000);
 }
 // Appelé par le module Android à chaque fichier reçu.
 function onReceived(info) {
  if (!info || !info.name) return;
  const name = String(info.name);
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
 window.Transfer738 = { status, start, stop, list, dataUrl, keep, keepOnly, saveText, open, close, onReceived, showQR: (file) => open('telechargement', file) };

 // Réglages : Trajets et carburant → Transfert depuis le téléphone.
 function settings(p) {
  const s = status(), files = list().slice(0, 12), pct = Math.min(100, s.used / s.quota * 100);
  const row = (title, desc, ctl) => setRow(p, title, desc, ctl || '');
  const state = !s.native ? 'Module Android sans serveur (installe la 7.38 complète).' : s.running ? 'En marche' : 'Arrêté';
  const net = s.ip ? `Wi-Fi de l’autoradio : ${esc(s.url)}` : 'Aucun Wi-Fi : active le point d’accès de l’autoradio et connecte ton téléphone dessus.';
  return `<p style="line-height:1.5;color:${p.mut}">Le téléphone envoie directement à l’autoradio, sans passer par Internet. Ils doivent être sur le même Wi-Fi : avec la carte SIM de l’autoradio, active son point d’accès et connecte ton téléphone dessus.</p>`
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
   if (op === 'close') { close(); return; }
   if (['ticket', 'gpx', 'fichier'].includes(op)) { open(op); return; }
   if (op === 'retry') { if (overlay && overlay._fill) overlay._fill(); return; }
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
