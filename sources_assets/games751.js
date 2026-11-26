/* 7.51 : onglet « Jeux » (jeu des plaques, devine la ville, blind test, jeux sur le téléphone des passagers) et
   musique : pochette en fond, égaliseur animé, logos des radios, mode concert à l'arrêt. Les jeux qu'on touche
   se mettent en pause quand la voiture roule ; les passagers jouent sur leur téléphone (QR). */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 // Départements : [numéro, nom, région].
 const DEPS = [['01','Ain','ARA'],['02','Aisne','HDF'],['03','Allier','ARA'],['04','Alpes-de-Haute-Provence','PACA'],['05','Hautes-Alpes','PACA'],['06','Alpes-Maritimes','PACA'],['07','Ardèche','ARA'],['08','Ardennes','GE'],['09','Ariège','OCC'],['10','Aube','GE'],['11','Aude','OCC'],['12','Aveyron','OCC'],['13','Bouches-du-Rhône','PACA'],['14','Calvados','NOR'],['15','Cantal','ARA'],['16','Charente','NA'],['17','Charente-Maritime','NA'],['18','Cher','CVL'],['19','Corrèze','NA'],['2A','Corse-du-Sud','COR'],['2B','Haute-Corse','COR'],['21','Côte-d’Or','BFC'],['22','Côtes-d’Armor','BRE'],['23','Creuse','NA'],['24','Dordogne','NA'],['25','Doubs','BFC'],['26','Drôme','ARA'],['27','Eure','NOR'],['28','Eure-et-Loir','CVL'],['29','Finistère','BRE'],['30','Gard','OCC'],['31','Haute-Garonne','OCC'],['32','Gers','OCC'],['33','Gironde','NA'],['34','Hérault','OCC'],['35','Ille-et-Vilaine','BRE'],['36','Indre','CVL'],['37','Indre-et-Loire','CVL'],['38','Isère','ARA'],['39','Jura','BFC'],['40','Landes','NA'],['41','Loir-et-Cher','CVL'],['42','Loire','ARA'],['43','Haute-Loire','ARA'],['44','Loire-Atlantique','PDL'],['45','Loiret','CVL'],['46','Lot','OCC'],['47','Lot-et-Garonne','NA'],['48','Lozère','OCC'],['49','Maine-et-Loire','PDL'],['50','Manche','NOR'],['51','Marne','GE'],['52','Haute-Marne','GE'],['53','Mayenne','PDL'],['54','Meurthe-et-Moselle','GE'],['55','Meuse','GE'],['56','Morbihan','BRE'],['57','Moselle','GE'],['58','Nièvre','BFC'],['59','Nord','HDF'],['60','Oise','HDF'],['61','Orne','NOR'],['62','Pas-de-Calais','HDF'],['63','Puy-de-Dôme','ARA'],['64','Pyrénées-Atlantiques','NA'],['65','Hautes-Pyrénées','OCC'],['66','Pyrénées-Orientales','OCC'],['67','Bas-Rhin','GE'],['68','Haut-Rhin','GE'],['69','Rhône','ARA'],['70','Haute-Saône','BFC'],['71','Saône-et-Loire','BFC'],['72','Sarthe','PDL'],['73','Savoie','ARA'],['74','Haute-Savoie','ARA'],['75','Paris','IDF'],['76','Seine-Maritime','NOR'],['77','Seine-et-Marne','IDF'],['78','Yvelines','IDF'],['79','Deux-Sèvres','NA'],['80','Somme','HDF'],['81','Tarn','OCC'],['82','Tarn-et-Garonne','OCC'],['83','Var','PACA'],['84','Vaucluse','PACA'],['85','Vendée','PDL'],['86','Vienne','NA'],['87','Haute-Vienne','NA'],['88','Vosges','GE'],['89','Yonne','BFC'],['90','Territoire de Belfort','BFC'],['91','Essonne','IDF'],['92','Hauts-de-Seine','IDF'],['93','Seine-Saint-Denis','IDF'],['94','Val-de-Marne','IDF'],['95','Val-d’Oise','IDF'],['971','Guadeloupe','OM'],['972','Martinique','OM'],['973','Guyane','OM'],['974','La Réunion','OM'],['976','Mayotte','OM']];
 const REGIONS = { GE: 'Grand Est', HDF: 'Hauts-de-France', IDF: 'Île-de-France', NOR: 'Normandie', BRE: 'Bretagne', PDL: 'Pays de la Loire', CVL: 'Centre-Val de Loire', BFC: 'Bourgogne-Franche-Comté', ARA: 'Auvergne-Rhône-Alpes', NA: 'Nouvelle-Aquitaine', OCC: 'Occitanie', PACA: 'Provence-Alpes-Côte d’Azur', COR: 'Corse', OM: 'Outre-mer' };
 // Villes d'Europe : [ville, pays, indice 1, indice 2, indice 3].
 const CITIES = [['Paris','France','Capitale au bord de la Seine','Une tour de fer de 330 m','Le Louvre'],['Rome','Italie','Ville aux sept collines','Le Colisée','Fontaine de Trevi'],['Londres','Royaume-Uni','Traversée par la Tamise','Big Ben','Bus rouges à deux étages'],['Berlin','Allemagne','Un mur la coupait en deux','Porte de Brandebourg','Capitale fédérale'],['Madrid','Espagne','Au centre du pays','Musée du Prado','Le Real joue au Bernabéu'],['Barcelone','Espagne','Au bord de la Méditerranée','La Sagrada Família','Gaudí'],['Amsterdam','Pays-Bas','Des canaux partout','Vélos par milliers','Maison d’Anne Frank'],['Bruxelles','Belgique','Siège de l’Union européenne','L’Atomium','Manneken-Pis'],['Lisbonne','Portugal','Sur le Tage','Tramway jaune n° 28','Pastéis de nata'],['Vienne','Autriche','Sur le Danube','Valses et Mozart','Palais de Schönbrunn'],['Prague','Tchéquie','La ville aux cent clochers','Pont Charles','Horloge astronomique'],['Venise','Italie','Pas de voitures','Gondoles','Place Saint-Marc'],['Athènes','Grèce','Berceau de la démocratie','L’Acropole','Le Parthénon'],['Dublin','Irlande','Sur la Liffey','Trèfle vert','Une bière noire célèbre'],['Copenhague','Danemark','La Petite Sirène','Tivoli','Capitale nordique des vélos'],['Stockholm','Suède','Bâtie sur 14 îles','Remise des prix Nobel','Musée Vasa'],['Budapest','Hongrie','Deux villes réunies par le Danube','Parlement au bord de l’eau','Bains thermaux'],['Strasbourg','France','Siège du Parlement européen','Cathédrale de grès rose','Marché de Noël'],['Marseille','France','Le Vieux-Port','Notre-Dame-de-la-Garde','La bouillabaisse'],['Lyon','France','Rhône et Saône','Fête des Lumières','Bouchons et quenelles'],['Bordeaux','France','Port de la Lune','Le miroir d’eau','Capitale du vin'],['Nice','France','Promenade des Anglais','Baie des Anges','Carnaval'],['Genève','Suisse','Au bout d’un grand lac','Jet d’eau de 140 m','Siège de nombreuses organisations'],['Munich','Allemagne','Capitale de la Bavière','Oktoberfest','BMW'],['Milan','Italie','Capitale de la mode','Le Duomo','La Scala'],['Florence','Italie','Berceau de la Renaissance','Le Ponte Vecchio','Le David de Michel-Ange'],['Édimbourg','Royaume-Uni','Capitale de l’Écosse','Château sur un volcan','Festival d’été'],['Cracovie','Pologne','Ancienne capitale royale','Château du Wawel','Grande place du marché'],['Séville','Espagne','Flamenco','La Giralda','Orangers dans les rues'],['Luxembourg','Luxembourg','Capitale d’un grand-duché','Casemates du Bock','Une des plus riches d’Europe']];
 const LIST = [['games751', 'Onglet « Jeux »', 'Un onglet à côté de Trajets et Entretien, avec les jeux en grandes tuiles.'], ['phone751', 'Jeux sur le téléphone des passagers', 'Les passagers scannent un QR et jouent sur leur téléphone ; les scores s’affichent ici.'], ['blind751', 'Blind test en famille', 'Le titre en cours est caché : qui le trouve en premier ?'], ['cover751', 'Pochette en grand', 'L’accueil prend les couleurs de la musique en cours (pochette floutée en fond).'], ['eq751', 'Égaliseur animé', 'Des barres qui dansent dans le widget musique pendant la lecture.'], ['radio751', 'Logos des radios', 'Le logo de la station quand la radio ne fournit pas d’image.'], ['concert751', 'Mode concert à l’arrêt', 'À l’arrêt, la musique en grand : pochette, égaliseur, titre.']];
 if (window.Try750) LIST.forEach(([id, l, d]) => Try750.register(id, l, d, '7.51'));
 const on = id => !window.Try750 || Try750.on(id);
 const driving = () => safe(() => moving(), false);
 const G = { sub: 'home', city: null, blind: { on: false, shown: false, d: 0, p: 0 }, phone: { topic: '', since: 0, until: 0, busy: false, seen: new Set() }, plateArm: false };
 if (on('games751') && typeof TABS !== 'undefined' && !TABS.some(t => t[0] === 'games')) TABS.push(['games', 'Jeux']);

 // ---------- Jeu des plaques ----------
 const found = () => store.get('plates751', {}) || {};
 function togglePlate(code, who) { const f = Object.assign({}, found()); if (f[code] && !who) delete f[code]; else if (!f[code]) f[code] = { t: Date.now(), who: who || 'autoradio' }; store.set('plates751', f); }
 function plates(p) {
  const f = found(), n = DEPS.filter(d => f[d[0]]).length, groups = Object.keys(REGIONS);
  const chip = d => `<button data-act="gp:${d[0]}" title="${esc(d[1])}" style="height:46px;min-width:58px;padding:0 6px;border-radius:10px;font-weight:800;font-size:16px;${f[d[0]] ? `background:${p.acc};color:${p.onAcc || '#fff'}` : `background:${p.card2};color:${p.txt}`}">${d[0]}</button>`;
  return `<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap"><div style="font-size:24px;font-weight:800">${n} / ${DEPS.length} départements trouvés</div><div style="flex:1;min-width:160px;height:12px;border-radius:6px;background:${p.card2};overflow:hidden"><div style="height:100%;width:${Math.round(n / DEPS.length * 100)}%;background:${p.acc}"></div></div>${chipBtn(p, 'gp:reset', G.plateArm ? 'Touche encore pour tout effacer' : 'Recommencer')}</div>
  <div style="font-size:13px;color:${p.mut};margin:6px 0 10px">Repère le numéro sur les plaques des autres voitures et touche-le. Les passagers peuvent jouer sur leur téléphone (onglet « Sur les téléphones »).</div>
  ${groups.map(g => `<div style="margin-bottom:10px"><div style="font-size:13px;color:${p.mut};margin-bottom:4px">${REGIONS[g]} · ${DEPS.filter(d => d[2] === g && f[d[0]]).length}/${DEPS.filter(d => d[2] === g).length}</div><div style="display:flex;flex-wrap:wrap;gap:6px">${DEPS.filter(d => d[2] === g).map(chip).join('')}</div></div>`).join('')}`;
 }

 // ---------- Devine la ville ----------
 function newCity() {
  const i = Math.floor(Math.random() * CITIES.length), others = CITIES.map((c, k) => k).filter(k => k !== i).sort(() => Math.random() - .5).slice(0, 3);
  G.city = { i, clue: 1, choices: [i, ...others].sort(() => Math.random() - .5), picked: null, score: G.city ? G.city.score : 0, played: G.city ? G.city.played : 0 };
 }
 function skyline(seed, w, h, col) {   // silhouette décorative (pas la vraie ville)
  let s = seed * 9301 + 49297, out = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none"><path fill="${col}" d="M0 ${h}`; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let x = 0; x < w;) { const bw = 12 + r() * 30, bh = h * (.25 + r() * .6); out += ` L${x} ${h - bh} L${x + bw} ${h - bh}`; if (r() > .8) out += ` L${x + bw / 2} ${h - bh - 18} `; x += bw; }
  return out + ` L${w} ${h} Z"/></svg>`;
 }
 function city(p) {
  if (!G.city) newCity();
  const c = G.city, C = CITIES[c.i], done = c.picked != null;
  const clues = [C[2], C[3], C[4]].slice(0, c.clue).map((t, k) => `<div style="${box(p, 'padding:12px 14px;font-size:18px')}"><b>Indice ${k + 1} :</b> ${esc(t)}</div>`).join('');
  return `<div style="display:flex;justify-content:space-between;align-items:center"><div style="font-size:22px;font-weight:800">Quelle ville ?</div><div style="font-size:16px;color:${p.mut}">Score : <b style="color:${p.txt}">${c.score}</b> · ${c.played} partie${c.played > 1 ? 's' : ''}</div></div>
  <div style="opacity:.9;margin:8px 0">${skyline(c.i + 7, 600, 70, p.acc + '88')}</div>
  <div style="display:flex;flex-direction:column;gap:8px">${clues}</div>
  ${!done && c.clue < 3 ? `<div style="margin-top:10px">${chipBtn(p, 'gc:clue', 'Un autre indice (−1 point)')}</div>` : ''}
  <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px">${c.choices.map(k => { const good = k === c.i, mine = k === c.picked; return `<button data-act="gc:pick:${k}" style="height:60px;border-radius:14px;font-size:19px;font-weight:700;${done ? (good ? 'background:#2f9e44;color:#fff' : mine ? 'background:#c62828;color:#fff' : `background:${p.card2};color:${p.mut}`) : `background:${p.card2};color:${p.txt}`}">${esc(CITIES[k][0])}</button>`; }).join('')}</div>
  ${done ? `<div style="margin-top:12px;font-size:18px">${c.picked === c.i ? '✓ Bravo ! ' : '✗ Raté : '}c’était <b>${esc(C[0])}</b> (${esc(C[1])}). ${chipBtn(p, 'gc:next', 'Ville suivante', true)}</div>` : ''}`;
 }

 // ---------- Blind test ----------
 function blind(p) {
  const B = G.blind, m = typeof media !== 'undefined' ? media : null;
  if (!B.on) return `<div style="font-size:18px;line-height:1.5">Lance ta musique (Spotify, YouTube Music…), puis démarre : le titre et l’artiste sont cachés sur l’écran. Le premier qui trouve marque un point.</div><div style="margin-top:14px">${chipBtn(p, 'gb:start', 'Démarrer le blind test', true)}</div>`;
  const big = (l, v) => `<div style="${box(p, 'padding:14px;text-align:center')}"><div style="font-size:14px;color:${p.mut}">${l}</div><div style="font-size:44px;font-weight:800">${v}</div></div>`;
  return `<div style="font-size:26px;font-weight:800;text-align:center;margin:6px 0 12px">${B.shown && m ? esc(m.title || '?') + '<div style="font-size:18px;font-weight:600;color:' + p.mut + '">' + esc(m.artist || '') + '</div>' : 'Qui chante ça ?'}</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${big('Conducteur', B.d)}${big('Passagers', B.p)}</div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:14px">${chipBtn(p, 'gb:show', B.shown ? 'Cacher' : 'Révéler la réponse', true)}${chipBtn(p, 'gb:d', '+1 conducteur')}${chipBtn(p, 'gb:p', '+1 passagers')}${chipBtn(p, 'gb:next', 'Morceau suivant')}${chipBtn(p, 'gb:stop', 'Arrêter')}</div>
  ${m ? '' : `<div style="text-align:center;color:${p.mut};margin-top:10px">Aucune musique en cours.</div>`}`;
 }

 // ---------- Jeux sur le téléphone des passagers (QR + boîte aux lettres ntfy.sh) ----------
 const PHONE_PAGE = 'https://roudousa-67.github.io/accueil2008/jeux.html';
 function topic() {
  const P = G.phone; if (P.topic && Date.now() < P.until) return P.topic;
  const a = new Uint8Array(10); safe(() => crypto.getRandomValues(a)); P.topic = 'a08j-' + Array.from(a, b => (b || Math.floor(Math.random() * 256)).toString(16).padStart(2, '0')).join('');
  P.since = Math.floor(Date.now() / 1000) - 5; P.until = Date.now() + 4 * 3600000; P.seen = new Set(); return P.topic;
 }
 async function phonePoll() {
  const P = G.phone; if (!P.topic || Date.now() > P.until || P.busy) return;
  P.busy = true;
  try {
   const r = await http(`https://ntfy.sh/${P.topic}/json?poll=1&since=${P.since}`);
   if (r && r.ok) for (const line of String(r.b).split('\n')) {
    let m = null; try { m = JSON.parse(line); } catch (e) { continue; }
    if (!m || m.event !== 'message' || P.seen.has(m.id)) continue; P.seen.add(m.id);
    let d = null; try { d = JSON.parse(m.message); } catch (e) { continue; }
    if (!d || typeof d.name !== 'string') continue;
    const name = d.name.slice(0, 20).replace(/[<>]/g, '') || 'Passager', sc = Object.assign({}, store.get('phoneScores751', {}));
    const o = sc[name] || {}; if (Number.isFinite(d.city)) o.city = Math.max(0, Math.min(999, d.city | 0)); if (Array.isArray(d.found)) { o.plates = d.found.length; d.found.slice(0, 120).forEach(c => { if (DEPS.some(x => x[0] === c)) togglePlate(c, name); }); } o.at = Date.now(); sc[name] = o; store.set('phoneScores751', sc);
    if (tab === 'games') render();
   }
  } catch (e) { /* hors ligne : on réessaie */ } finally { P.busy = false; }
 }
 setInterval(phonePoll, 4000);
 function phone(p) {
  const url = PHONE_PAGE + '#t=' + topic(), sc = store.get('phoneScores751', {}), rows = Object.entries(sc).sort((a, b) => (b[1].plates || 0) + (b[1].city || 0) - (a[1].plates || 0) - (a[1].city || 0));
  let qr = ''; try { const q = qrcode(0, 'M'); q.addData(url); q.make(); qr = q.createSvgTag({ cellSize: 6, margin: 2, scalable: true }); } catch (e) { qr = '<div>QR indisponible</div>'; }
  return `<div style="display:grid;grid-template-columns:minmax(220px,300px) 1fr;gap:16px;align-items:start"><div style="background:#fff;border-radius:16px;padding:10px">${qr}</div><div><div style="font-size:22px;font-weight:800">Scanne pour jouer</div><div style="font-size:15px;line-height:1.5;color:${p.mut};margin:6px 0 12px">Chaque passager scanne ce QR avec son téléphone : jeu des plaques et devine la ville, même en roulant. Les plaques trouvées s’ajoutent ici et les scores s’affichent ci-dessous. Personne ne touche l’écran devant le conducteur.</div>
  <div style="${box(p, 'padding:12px 14px')}"><b>Scores des passagers</b>${rows.length ? rows.map(([n, o]) => `<div style="display:flex;gap:10px;padding:6px 0;font-size:16px"><b style="flex:1">${esc(n)}</b><span>${o.plates || 0} plaques</span><span>${o.city || 0} villes</span></div>`).join('') : `<div style="color:${p.mut};margin-top:6px">En attente des passagers…</div>`}${rows.length ? `<div style="margin-top:8px">${chipBtn(p, 'gq:clear', 'Effacer les scores')}</div>` : ''}</div></div></div>`;
 }

 // ---------- Page « Jeux » ----------
 const TILES = [['plates', '🚗', 'Jeu des plaques', () => `${DEPS.filter(d => found()[d[0]]).length} départements trouvés`], ['city', '🏙', 'Devine la ville', () => 'Une ville d’Europe, 3 indices'], ['blind', '🎵', 'Blind test', () => 'Qui chante ça ?'], ['phone', '📱', 'Sur les téléphones', () => 'Les passagers jouent sur leur téléphone'], ['eco', '🌱', 'Éco-conduite', () => 'Ta note à chaque trajet']];
 const touchGames = ['plates', 'city', 'blind'];
 window.pageGames = function (p) {
  if (!on('games751')) return pageFrame(p, '<div style="padding:20px">L’onglet Jeux est désactivé dans Nouveautés à tester.</div>');
  let body;
  if (G.sub !== 'home' && touchGames.includes(G.sub) && driving()) body = `<div style="text-align:center;padding:30px 20px"><div style="font-size:54px">⏸</div><div style="font-size:24px;font-weight:800;margin:8px 0">En pause pendant la conduite</div><div style="font-size:16px;color:${p.mut};margin-bottom:16px">Les passagers peuvent continuer sur leur téléphone.</div>${chipBtn(p, 'gsub:phone', 'Afficher le QR des passagers', true)}</div>`;
  else if (G.sub === 'plates') body = plates(p);
  else if (G.sub === 'city') body = city(p);
  else if (G.sub === 'blind') body = blind(p);
  else if (G.sub === 'phone') body = phone(p);
  else body = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px">${TILES.filter(t => t[0] !== 'phone' || on('phone751')).filter(t => t[0] !== 'blind' || on('blind751')).map(([k, icon, t, sub]) => `<button data-act="gsub:${k}" style="${box(p, 'padding:20px;text-align:left;display:flex;flex-direction:column;gap:6px;min-height:150px')};color:${p.txt}"><span style="font-size:44px">${icon}</span><b style="font-size:20px">${t}</b><span style="font-size:14px;color:${p.mut}">${esc(sub())}</span>${touchGames.includes(k) && driving() ? `<span style="font-size:12px;color:${p.mut}">⏸ à l’arrêt</span>` : ''}</button>`).join('')}</div>`;
  return pageFrame(p, `<div class="scroll" style="overflow:auto;padding:4px 2px">${body}</div>`);
 };
 window.Games751 = { subs: () => [['gsub:home', 'Tous les jeux', G.sub === 'home'], ['gsub:plates', 'Plaques', G.sub === 'plates'], ['gsub:city', 'Devine la ville', G.sub === 'city'], ...(on('blind751') ? [['gsub:blind', 'Blind test', G.sub === 'blind']] : []), ...(on('phone751') ? [['gsub:phone', 'Téléphones', G.sub === 'phone']] : [])] };

 // ---------- Musique ----------
 const isRadio = m => m && /radio|fmradio|dab|qf\.radio/i.test(String(m.pkg || '') + ' ' + String(m.app || ''));
 const logos = store.get('radioLogos751', {}) || {};
 const logoBusy = new Set();
 async function radioLogo(name) {
  const k = String(name || '').trim().toLowerCase(); if (!k || k.length < 3 || logoBusy.has(k) || k in logos) return;
  logoBusy.add(k);
  try { const j = await getJSON('https://de1.api.radio-browser.info/json/stations/byname/' + encodeURIComponent(k) + '?limit=5&hidebroken=true&order=votes&reverse=true'); const s = (Array.isArray(j) ? j : []).find(x => x && /^https:\/\//.test(x.favicon || '')); logos[k] = s ? s.favicon : ''; store.set('radioLogos751', logos); }
  catch (e) { /* réessai plus tard */ } finally { logoBusy.delete(k); }
 }
 const p0 = window.paint;
 window.paint = function () {
  const out = p0.apply(this, arguments);
  safe(() => {
   const m = typeof media !== 'undefined' ? media : null;
   if (m && on('radio751') && isRadio(m) && !m.art) { const name = m.title || m.artist || m.album; radioLogo(name); const u = logos[String(name || '').trim().toLowerCase()]; if (u) document.querySelectorAll('#screen [data-img="mArt"]').forEach(e => { if (e.getAttribute('src') !== u) e.src = u; e.style.display = 'block'; e.style.objectFit = 'contain'; e.style.background = '#fff'; }); }
   if (G.blind.on && on('blind751') && !G.blind.shown) document.querySelectorAll('#screen [data-k="mTitle"],#screen [data-k="mArtist"]').forEach((e, i) => { e.textContent = e.dataset.k === 'mTitle' ? '🎵 Qui chante ça ?' : 'Blind test en cours'; });
   if (G.blind.on && !G.blind.shown) document.querySelectorAll('#screen [data-img="mArt"]').forEach(e => { e.style.display = 'none'; });
   // Égaliseur posé par-dessus le widget (position absolue) : il ne prend aucune place et ne pousse rien.
   if (on('eq751')) document.querySelectorAll('#screen [data-k="mArtist"]').forEach(e => { const par = e.parentElement; if (!par || par.querySelector(':scope > .eqw751')) return; if (getComputedStyle(par).position === 'static') par.style.position = 'relative'; par.insertAdjacentHTML('beforeend', EQW); });
   const playing = !!(m && m.playing);
   document.querySelectorAll('#screen .eq751').forEach(e => e.classList.toggle('on751', playing));
   coverBg(m);
   concert(m);
  });
  return out;
 };
 // Égaliseur : barres CSS dans le widget musique (animation par le navigateur, presque gratuite).
 const css = document.createElement('style');
 css.textContent = `.eq751{display:inline-flex;gap:3px;align-items:flex-end;height:18px;margin-top:4px}.eqw751{position:absolute;right:6px;top:2px;margin:0;height:14px;pointer-events:none;opacity:.85}.eqw751 i{width:3px}.eq751 i{display:block;width:4px;height:4px;border-radius:2px;background:var(--mediaAccent730,#e0312b)}.eq751.on751 i{animation:eq751 .9s ease-in-out infinite alternate}.eq751 i:nth-child(2){animation-delay:-.3s!important}.eq751 i:nth-child(3){animation-delay:-.6s!important}.eq751 i:nth-child(4){animation-delay:-.15s!important}.eq751 i:nth-child(5){animation-delay:-.45s!important}.eq751 i:nth-child(6){animation-delay:-.75s!important}.eq751 i:nth-child(7){animation-delay:-.2s!important}@keyframes eq751{0%{height:3px}50%{height:12px}100%{height:18px}}#concert751{position:absolute;inset:0;z-index:5500;display:flex;align-items:center;justify-content:center;gap:48px;color:#fff;overflow:hidden}#concert751 .bg{position:absolute;inset:-40px;background-size:cover;background-position:center;filter:blur(40px) brightness(.4);z-index:-1}#concert751 .eq751{height:60px;gap:8px}#concert751 .eq751 i{width:14px}#concert751 .eq751.on751 i{animation-name:eqb751}@keyframes eqb751{0%{height:8px}50%{height:36px}100%{height:60px}}`;
 document.head.appendChild(css);
 const EQ = '<span class="eq751" aria-hidden="true">' + '<i></i>'.repeat(7) + '</span>';
 const EQW = '<span class="eq751 eqw751" aria-hidden="true">' + '<i></i>'.repeat(7) + '</span>';
 // Pochette en fond : l'accueil prend les couleurs du disque en cours.
 let coverEl = null;
 function coverBg(m) {
  const want = on('cover751') && store.get('coverBg751', true) !== false && tab === 'home' && m && m.playing && m.art && !G.blind.on;
  const st = safe(() => $('stage'), null); if (!st) return;
  if (!want) { if (coverEl) { coverEl.remove(); coverEl = null; } return; }
  if (!coverEl || !coverEl.isConnected) { coverEl = document.createElement('div'); coverEl.id = 'cover751'; coverEl.style.cssText = 'position:absolute;inset:-60px;z-index:-1;pointer-events:none;background-size:cover;background-position:center;filter:blur(38px) brightness(.42) saturate(1.3);transition:background-image .6s'; st.insertBefore(coverEl, st.firstChild); }
  const u = 'url("' + String(m.art).replace(/"/g, '%22') + '")'; if (coverEl.style.backgroundImage !== u) coverEl.style.backgroundImage = u;
 }
 // Mode concert : à l'arrêt depuis 15 s, musique en cours, sur l'accueil.
 let still = 0, concertEl = null, concertOff = 0;
 function concert(m) {
  const v = safe(() => curSpeed().v, 0) || 0, now = Date.now();
  if (v > 3) still = 0; else if (!still) still = now;
  const want = on('concert751') && store.get('concert751', true) !== false && tab === 'home' && m && m.playing && still && now - still > 15000 && now > concertOff;
  if (!want) { if (concertEl) { concertEl.remove(); concertEl = null; } return; }
  const st = safe(() => $('stage'), null); if (!st) return;
  if (!concertEl || !concertEl.isConnected) { concertEl = document.createElement('div'); concertEl.id = 'concert751'; concertEl.setAttribute('data-act', 'gq:concertoff'); st.appendChild(concertEl); }
  const sig = [m.title, m.artist, m.art ? m.art.length : 0, G.blind.on && !G.blind.shown].join('|');
  if (concertEl.dataset.sig !== sig) {
   concertEl.dataset.sig = sig;
   const hide = G.blind.on && !G.blind.shown;
   concertEl.innerHTML = `<div class="bg" style="background-image:${m.art && !hide ? 'url(&quot;' + esc(m.art) + '&quot;)' : 'none'};background-color:#111"></div><div style="width:380px;height:380px;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px #000a;background:#222;display:flex;align-items:center;justify-content:center;font-size:120px">${m.art && !hide ? `<img src="${esc(m.art)}" alt="" style="width:100%;height:100%;object-fit:cover">` : '🎵'}</div><div style="max-width:560px"><div style="font-size:46px;font-weight:800;line-height:1.1">${esc(hide ? 'Qui chante ça ?' : m.title || '')}</div><div style="font-size:26px;opacity:.8;margin:12px 0 24px">${esc(hide ? '' : m.artist || '')}</div><span class="eq751 on751">${'<i></i>'.repeat(9)}</span><div style="font-size:14px;opacity:.6;margin-top:22px">Touche l’écran pour revenir · disparaît en roulant</div></div>`;
  }
 }
 setInterval(() => safe(() => { if (concertEl || (still && Date.now() - still > 15000)) concert(typeof media !== 'undefined' ? media : null); else { const v = safe(() => curSpeed().v, 0) || 0; if (v > 3) still = 0; else if (!still) still = Date.now(); } }), 1000);

 // ---------- Actions ----------
 const act0 = window.act;
 window.act = function (a) {
  if (typeof a !== 'string') return act0.apply(this, arguments);
  if (a.startsWith('gsub:')) { const k = a.slice(5); if (k === 'eco') { tab = 'trips'; tripSub = 'eco'; render(); return; } G.sub = k; tab = 'games'; render(); return; }
  if (a.startsWith('gp:')) { if (driving()) { toast('À l’arrêt, ou sur le téléphone des passagers.'); return; } const k = a.slice(3); if (k === 'reset') { if (G.plateArm) { store.set('plates751', {}); G.plateArm = false; } else { G.plateArm = true; setTimeout(() => { G.plateArm = false; }, 4000); } render(); return; } togglePlate(k); render(); return; }
  if (a.startsWith('gc:')) { if (driving()) { toast('À l’arrêt seulement.'); return; } const c = G.city || (newCity(), G.city); if (a === 'gc:clue' && c.clue < 3 && c.picked == null) c.clue++; else if (a.startsWith('gc:pick:') && c.picked == null) { c.picked = +a.slice(8); c.played++; if (c.picked === c.i) c.score += 4 - c.clue; } else if (a === 'gc:next') newCity(); render(); return; }
  if (a.startsWith('gb:')) { const B = G.blind, k = a.slice(3); if (k === 'start') { B.on = true; B.shown = false; } else if (k === 'stop') { B.on = false; } else if (k === 'show') B.shown = !B.shown; else if (k === 'd') { B.d++; B.shown = true; } else if (k === 'p') { B.p++; B.shown = true; } else if (k === 'next') { B.shown = false; safe(() => A && A.media('next')); } render(); safe(() => paint()); return; }
  if (a === 'gq:clear') { store.set('phoneScores751', {}); render(); return; }
  if (a === 'gq:concertoff') { concertOff = Date.now() + 10 * 60000; if (concertEl) { concertEl.remove(); concertEl = null; } return; }
  return act0.apply(this, arguments);
 };
 // Réglages : Multimédia.
 const mcat = SETCATS.find(c => /multim|média|musique/i.test(c[0])) || SETCATS.find(c => c[1].some(x => /multim/i.test(x[0])));
 if (mcat && !mcat[1].some(s => s[0] === 'Pochette et mode concert')) mcat[1].push(['Pochette et mode concert', p => setRow(p, 'Pochette en fond de l’accueil', 'Pendant la lecture, la pochette floutée remplace le fond.', chipBtn(p, 'gq:set:coverBg751:1', 'Oui', store.get('coverBg751', true) !== false) + chipBtn(p, 'gq:set:coverBg751:0', 'Non', store.get('coverBg751', true) === false)) + setRow(p, 'Mode concert à l’arrêt', 'Après 15 s à l’arrêt avec de la musique : pochette, titre et égaliseur en grand.', chipBtn(p, 'gq:set:concert751:1', 'Oui', store.get('concert751', true) !== false) + chipBtn(p, 'gq:set:concert751:0', 'Non', store.get('concert751', true) === false))]);
 const act1 = window.act;
 window.act = function (a) { if (typeof a === 'string' && a.startsWith('gq:set:')) { const [, , k, v] = a.split(':'); store.set(k, v === '1'); render(); return; } return act1.apply(this, arguments); };
 window.Games751Data = { DEPS, REGIONS, CITIES };
 Object.assign(window.Games751, { G, found, togglePlate, newCity, phonePoll, topic, radioLogo, logos, concert, coverBg });
})();
