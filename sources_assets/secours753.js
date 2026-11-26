/* 7.53 : revenir en arrière sans réinstaller.
   - « Tout couper » dans Nouveautés à tester : toutes les nouveautés reviennent comme avant d'un seul appui.
   - Mode secours : si l'appli est relancée 3 fois en 3 minutes (écran bloqué → tu la relances), ou si une
     nouveauté provoque des erreurs en série, toutes les nouveautés sont coupées automatiquement.
   - Coupure à distance : distribution/off.json sur GitHub peut couper une nouveauté sans nouvelle version. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 if (!window.Try750) return;
 const LOG = 'a08launch753';
 Try750.allOff = function (why) {
  const ids = Try750.list().map(x => x.id);
  ids.forEach(id => { if (Try750.state(id) === 'on') Try750.set(id, 'off'); });
  store.set('secours753', { at: Date.now(), why: why || 'manuel', ids });
  return ids.length;
 };
 Try750.allOn = function () { Try750.list().forEach(x => { if (Try750.state(x.id) === 'off') Try750.set(x.id, 'on'); }); store.set('secours753', null); };

 // ---------- Mode secours : 3 lancements en 3 minutes ----------
 let launches = safe(() => JSON.parse(localStorage.getItem(LOG) || '[]'), []).filter(t => Date.now() - t < 180000);
 launches.push(Date.now());
 safe(() => localStorage.setItem(LOG, JSON.stringify(launches.slice(-5))));
 // Un lancement qui tient 2 minutes est « normal » : le compteur repart de zéro.
 setTimeout(() => safe(() => localStorage.setItem(LOG, '[]')), 120000);
 const rescue = launches.length >= 3;
 setTimeout(() => {
  if (rescue && Try750.list().some(x => Try750.state(x.id) === 'on')) { Try750.allOff('3 lancements en 3 minutes'); safe(() => localStorage.setItem(LOG, '[]')); safe(() => toast('Mode secours : les nouveautés sont coupées. Réglages → Système → Nouveautés à tester pour les remettre.')); safe(() => render()); }
 }, 0);

 // ---------- Erreurs en série venant d'une nouveauté ----------
 const errs = [];
 window.addEventListener('error', e => {
  const f = String(e && e.filename || '');
  if (!/(75[3-9]|7[6-9]\d)\.js/.test(f)) return;   // seulement les fichiers des nouveautés (7.53 et suivantes)
  errs.push(Date.now()); while (errs.length && Date.now() - errs[0] > 60000) errs.shift();
  if (errs.length >= 5) { errs.length = 0; Try750.allOff('erreurs en série : ' + f.split('/').pop()); safe(() => toast('Une nouveauté a fait des erreurs : elles sont toutes coupées.')); safe(() => render()); }
 });

 // ---------- Coupure à distance ----------
 async function remote() {
  try {
   const j = await getJSON('https://raw.githubusercontent.com/Roudousa-67/accueil2008/main/distribution/off.json?t=' + Math.floor(Date.now() / 600000));
   const off = Array.isArray(j && j.off) ? j.off.filter(x => typeof x === 'string') : [];
   const done = store.get('remoteOff753', []) || [];
   let n = 0; off.forEach(id => { if (!done.includes(id) && Try750.state(id) === 'on') { Try750.set(id, 'off'); n++; } });
   store.set('remoteOff753', off);
   if (n) { safe(() => toast(n + ' nouveauté' + (n > 1 ? 's coupées' : ' coupée') + ' à distance (correctif en préparation).')); safe(() => render()); }
  } catch (e) { /* hors ligne : rien */ }
 }
 setTimeout(remote, 20000); setInterval(remote, 3 * 3600000);

 // ---------- Boutons dans « Nouveautés à tester » ----------
 const sys = SETCATS.find(c => c[0] === 'Système'), i = sys ? sys[1].findIndex(s => s[0] === 'Nouveautés à tester') : -1;
 if (i >= 0) {
  const f0 = sys[1][i][1];
  sys[1][i] = ['Nouveautés à tester', p => {
   const s = store.get('secours753', null);
   return `<div style="${box(p, 'padding:12px 14px;margin-bottom:10px;display:flex;flex-direction:column;gap:8px')}"><b>Revenir comme avant</b><div style="font-size:13.5px;color:${p.mut};line-height:1.5">« Tout couper » remet l’appli comme avant les nouveautés, sans rien réinstaller. Si un jour l’écran ne répond plus : relance l’appli 3 fois de suite (en moins de 3 minutes), tout se coupe tout seul.</div>${s ? `<div style="font-size:13.5px;color:#f2a33a">Coupées le ${new Date(s.at).toLocaleDateString('fr-FR')} à ${new Date(s.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} (${esc(s.why)}).</div>` : ''}<div style="display:flex;gap:8px;flex-wrap:wrap">${chipBtn(p, 'sec753:off', 'Tout couper', true)}${chipBtn(p, 'sec753:on', 'Tout remettre')}</div></div>` + f0(p);
  }];
 }
 const act0 = window.act;
 window.act = function (a) {
  if (a === 'sec753:off') { const n = Try750.allOff('manuel'); toast(n ? 'Toutes les nouveautés sont coupées.' : 'Aucune nouveauté à couper.'); render(); return; }
  if (a === 'sec753:on') { Try750.allOn(); toast('Nouveautés remises.'); render(); return; }
  return act0.apply(this, arguments);
 };
 window.Secours753 = { remote, rescue, launches: () => launches.slice() };
})();
