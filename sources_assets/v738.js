/* 7.38 : cartes des trajets et des stations, routes empruntées, suivi des services et journal d'erreurs. */
(() => {
 'use strict';
 // ---------- Journal d'erreurs (consulté par le rapport de diagnostic) ----------
 const errors = [];
 function addError(where, e) {
  const message = String(e && (e.message || e.reason && e.reason.message || e.reason) || e || 'erreur').slice(0, 200);
  const last = errors[errors.length - 1];
  if (last && last.where === where && last.message === message) { last.count++; last.at = Date.now(); return; }
  errors.push({ where, message, at: Date.now(), count: 1 });
  if (errors.length > 60) errors.shift();
 }
 window.addEventListener('error', e => addError(e.filename ? e.filename.split('/').pop() + ':' + e.lineno : 'page', e.error || e.message));
 window.addEventListener('unhandledrejection', e => addError('promesse', e.reason));
 window.Errors738 = { list: errors, add: addError };

 // ---------- Suivi des services réseau ----------
 // Chaque appel à getJSON est compté par service : réponses, échecs, dernier message, durée.
 const services = {};
 const SERVICE_NAMES = [
  [/overpass/, 'Serveur cartographique'], [/nominatim/, 'Adresses (Nominatim)'], [/open-meteo/, 'Météo'],
  [/data\.economie\.gouv\.fr/, 'Prix carburant France'], [/tankerkoenig/, 'Prix carburant Allemagne'],
  [/api\.github\.com|raw\.githubusercontent|github\.com/, 'Mises à jour (GitHub)'], [/vigilance|meteofrance/, 'Vigilance'],
 ];
 const serviceOf = url => (SERVICE_NAMES.find(([re]) => re.test(url)) || [0, (String(url).split('/')[2] || 'autre')])[1];
 const baseJSON = window.getJSON;
 window.getJSON = function (url) {
  const name = serviceOf(String(url)), s = services[name] || (services[name] = { ok: 0, fail: 0, okAt: 0, failAt: 0, error: '', ms: 0 });
  const started = Date.now();
  return baseJSON.apply(this, arguments).then(result => { s.ok++; s.okAt = Date.now(); s.ms = Date.now() - started; return result; },
   error => { s.fail++; s.failAt = Date.now(); s.error = String(error && error.message || error).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90); throw error; });
 };
 window.Services738 = services;

 // ---------- Cartes : chargement de Leaflet à la demande ----------
 // Depuis la 7.25, Leaflet n'était chargé que pour la carte de l'accueil (et pas du tout
 // quand MapLibre est choisi) : les cartes des trajets et des stations restaient vides.
 const Maps738 = {
  pending: null, tileErrors: 0, tileLoads: 0,
  failed: 0,
  ensure() {
   if (typeof L !== 'undefined') return Promise.resolve();
   // Trois essais au plus par démarrage, pour ne pas redemander sans fin un fichier absent.
   if (!this.pending) { if (this.failed >= 3) return Promise.reject(Error('bibliothèque de cartes indisponible')); this.pending = Perf725.script('lib/leaflet.js').then(() => { if (typeof L === 'undefined') { this.failed++; this.pending = null; } }, e => { this.failed++; addError('carte', e); this.pending = null; throw e; }); }
   return this.pending;
  },
  // Même fond pour toutes les cartes des trajets : rues et noms lisibles, sans l'en-tête exigé par les tuiles OSM.
  tiles(map) {
   const layer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18, attribution: '© Esri' });
   layer.on('tileload', () => { Maps738.tileLoads++; });
   layer.on('tileerror', () => { Maps738.tileErrors++; const el = map.getContainer(); if (el && !el.querySelector('.offline738')) { const n = document.createElement('div'); n.className = 'offline738'; n.textContent = 'Fond de carte indisponible (pas d’Internet) : le tracé reste exact.'; el.appendChild(n); } });
   return layer.addTo(map);
  },
 };
 window.Maps738 = Maps738;
 const needsMap = () => document.querySelector('#screen .trkslot, #journeyMap733, #stationMap733, #liveMap738');
 let live = null;
 function mountLive() {
  const el = document.getElementById('liveMap738');
  if (live && live.map.getContainer() !== el) { live.map.remove(); live = null; }
  if (!el || typeof L === 'undefined' || typeof trkPts === 'undefined') return;
  if (!live) {
   const map = L.map(el, { zoomControl: true, attributionControl: true, zoomSnap: .5 });
   Maps738.tiles(map);
   live = { map, outline: L.polyline([], { color: '#ffffff', weight: 9, opacity: .9 }).addTo(map), line: L.polyline([], { color: '#1f6fd1', weight: 5 }).addTo(map), here: L.circleMarker([0, 0], { radius: 8, color: '#fff', weight: 3, fillColor: '#e0312b', fillOpacity: 1 }), shown: -1 };
  }
  const pts = trkPts.slice();
  if (pts.length && pts.length !== live.shown) {
   live.outline.setLatLngs(pts); live.line.setLatLngs(pts); live.here.setLatLng(pts[pts.length - 1]).addTo(live.map);
   if (live.shown < 0) { if (pts.length > 1) live.map.fitBounds(L.latLngBounds(pts), { padding: [20, 20], maxZoom: 16 }); else live.map.setView(pts[0], 15); }
   else if (!live.map.getBounds().contains(pts[pts.length - 1])) live.map.panTo(pts[pts.length - 1]);
   live.shown = pts.length;
  }
 }
 const render0 = window.render;
 window.render = function () {
  const result = render0.apply(this, arguments);
  if (needsMap()) {
   // Nouveau rendu seulement si la bibliothèque est vraiment là : sinon, pas de boucle de rendus.
   if (typeof L === 'undefined') Maps738.ensure().then(() => { if (typeof L !== 'undefined' && needsMap()) render(); else addError('carte', 'bibliothèque de cartes chargée sans effet'); }).catch(() => {});
   else try { mountLive(); } catch (e) { addError('carte du trajet en cours', e); }
  }
  return result;
 };
 displayEvery725(() => { if (document.getElementById('liveMap738')) try { mountLive(); } catch (e) { addError('carte du trajet en cours', e); } }, 2000);

 // ---------- Routes empruntées ----------
 // Notées pendant la conduite à partir de la route reconnue (aucune requête en plus).
 const RoadsTaken738 = (() => {
  const key = id => 'a08r_' + id;
  let cur = null, last = null, dirty = 0;
  function label(tags) {
   const ref = String(tags.ref || '').split(';')[0].trim(), name = String(tags.name || '').trim();
   if (/^(motorway|trunk)/.test(tags.highway)) return ref || name || 'Voie rapide';
   return ref && name ? ref + ' · ' + name : (ref || name || 'Route sans nom');
  }
  function load(id) { try { const v = JSON.parse(localStorage.getItem(key(id)) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function save() { if (!cur) return; try { localStorage.setItem(key(cur.id), JSON.stringify(cur.list.slice(-300))); dirty = 0; } catch (e) { addError('routes empruntées', e); } }
  function step() {
   if (typeof trk === 'undefined' || !trk || !loc || !(loc.acc <= 50) || !Number.isFinite(loc.lat)) { last = null; return; }
   if (!cur || cur.id !== trk.id) { save(); cur = { id: trk.id, list: load(trk.id) }; last = null; }
   const p = { lat: loc.lat, lon: loc.lon, ts: loc.ts };
   if (last && p.ts !== last.ts) {
    const d = hav(last.lat, last.lon, p.lat, p.lon);
    if (d > 0 && d < 1) {
     const fresh = window.Road723 && Road723.fresh() && Road723.match && Date.now() - Road723.at < 30 * 60000;
     const name = fresh ? label(Road723.match.tags) : 'Route non identifiée', top = cur.list[cur.list.length - 1];
     if (top && top.n === name) top.km += d; else cur.list.push({ n: name, km: d, h: fresh ? Road723.match.tags.highway : '' });
     if (++dirty >= 15) save();
    }
   }
   last = p;
  }
  // Fusionne les passages très courts (carrefours, erreurs d'appariement) dans la route voisine.
  function summary(id) {
   const raw = cur && cur.id === id ? cur.list : load(id), out = [];
   for (const r of raw) {
    const top = out[out.length - 1];
    if (top && top.n === r.n) top.km += r.km;
    else if (r.km < .12 && top) top.km += r.km;
    else out.push({ n: r.n, km: r.km, h: r.h });
   }
   return out.filter(r => r.km >= .05);
  }
  function html(id) {
   const list = summary(String(id));
   if (!list.length) return '<div class="roads738"><b>Routes empruntées</b><span>Notées à partir de la 7.38, pendant la conduite.</span></div>';
   return '<div class="roads738"><b>Routes empruntées</b>' + list.map(r => `<div><span><i style="background:${/^(motorway|trunk)/.test(r.h) ? '#1f6fd1' : /^(primary|secondary)/.test(r.h) ? '#f0b060' : '#9aa7a7'}"></i>${esc(r.n)}</span><small>${fr1(r.km)} km</small></div>`).join('') + '</div>';
  }
  return { step, save, summary, html, label };
 })();
 window.RoadsTaken738 = RoadsTaken738;
 const onLoc0 = window.onLoc;
 window.onLoc = function () { onLoc0.apply(this, arguments); try { RoadsTaken738.step(); } catch (e) { addError('routes empruntées', e); } };
 if (typeof window.trkFinish === 'function') { const finish0 = window.trkFinish; window.trkFinish = function () { try { RoadsTaken738.save(); } catch (e) {} return finish0.apply(this, arguments); }; }

 const css = document.createElement('style');
 css.textContent = `.roads738{display:flex;flex-direction:column;gap:2px;font-size:14px;padding:8px 2px}.roads738>b{font-size:14px;margin-bottom:4px}.roads738>span{opacity:.75;font-size:13px}
 .roads738>div{display:flex;justify-content:space-between;gap:10px;padding:5px 0;border-bottom:1px solid #ffffff1f}.roads738>div:last-child{border-bottom:0}.roads738 i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:8px}
 .roads738 small{opacity:.8;white-space:nowrap}.offline738{position:absolute;left:8px;bottom:8px;z-index:500;background:#14223ae6;color:#fff;font-size:12px;padding:4px 8px;border-radius:6px}
 #liveMap738{height:240px;border-radius:12px;overflow:hidden;margin-top:8px;position:relative}`;
 document.head.appendChild(css);
})();
