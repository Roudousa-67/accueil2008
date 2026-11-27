/* 7.61 : OpenStreetMap (Overpass) plus fiable. Le serveur principal overpass-api.de est souvent saturé
   (« OpenStreetMap indisponible pour le moment » dans Stations). Si une demande échoue, elle est refaite sur
   deux serveurs miroirs publics ; celui qui a répondu est gardé 15 min. Concerne : paiement et AdBlue des
   stations, limitations, sorties d'autoroute, alertes de la route. */
(() => {
 'use strict';
 const MAIN = 'https://overpass-api.de/api/interpreter';
 const MIRRORS = [MAIN, 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
 const M = { good: 0, at: 0, fails: 0, last: '' };
 const g0 = window.getJSON;
 if (typeof g0 !== 'function') return;
 window.getJSON = async function (url) {
  if (typeof url !== 'string' || url.indexOf(MAIN) !== 0) return g0.apply(this, arguments);
  const rest = url.slice(MAIN.length);
  const start = Date.now() - M.at < 15 * 60000 ? M.good : 0;
  let err = null;
  for (let k = 0; k < MIRRORS.length; k++) {
   const i = (start + k) % MIRRORS.length;
   try {
    const j = await g0.call(this, MIRRORS[i] + rest);
    if (j && j.remark && /runtime error|too many|timeout|rate_limited/i.test(j.remark) && !(j.elements || []).length) throw Error(j.remark);
    if (i !== M.good) { M.good = i; }
    M.at = Date.now(); M.last = MIRRORS[i];
    return j;
   } catch (e) { err = e; M.fails++; }
  }
  throw err || Error('OpenStreetMap indisponible');
 };
 window.Osm761 = { M, MIRRORS };
})();
