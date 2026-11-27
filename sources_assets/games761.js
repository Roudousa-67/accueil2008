/* 7.61 : onglet « Jeux » (repris de la 7.51, sans la partie musique déjà dans la 7.58) : jeu des plaques,
   devine la ville, blind test, et jeux sur le téléphone des passagers (QR). Les jeux qu'on touche se mettent en
   pause quand la voiture roule ; les passagers jouent sur leur téléphone. */
(() => {
 'use strict';
 const safe = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
 // Départements : [numéro, nom, région].
 const DEPS = [['01','Ain','ARA'],['02','Aisne','HDF'],['03','Allier','ARA'],['04','Alpes-de-Haute-Provence','PACA'],['05','Hautes-Alpes','PACA'],['06','Alpes-Maritimes','PACA'],['07','Ardèche','ARA'],['08','Ardennes','GE'],['09','Ariège','OCC'],['10','Aube','GE'],['11','Aude','OCC'],['12','Aveyron','OCC'],['13','Bouches-du-Rhône','PACA'],['14','Calvados','NOR'],['15','Cantal','ARA'],['16','Charente','NA'],['17','Charente-Maritime','NA'],['18','Cher','CVL'],['19','Corrèze','NA'],['2A','Corse-du-Sud','COR'],['2B','Haute-Corse','COR'],['21','Côte-d’Or','BFC'],['22','Côtes-d’Armor','BRE'],['23','Creuse','NA'],['24','Dordogne','NA'],['25','Doubs','BFC'],['26','Drôme','ARA'],['27','Eure','NOR'],['28','Eure-et-Loir','CVL'],['29','Finistère','BRE'],['30','Gard','OCC'],['31','Haute-Garonne','OCC'],['32','Gers','OCC'],['33','Gironde','NA'],['34','Hérault','OCC'],['35','Ille-et-Vilaine','BRE'],['36','Indre','CVL'],['37','Indre-et-Loire','CVL'],['38','Isère','ARA'],['39','Jura','BFC'],['40','Landes','NA'],['41','Loir-et-Cher','CVL'],['42','Loire','ARA'],['43','Haute-Loire','ARA'],['44','Loire-Atlantique','PDL'],['45','Loiret','CVL'],['46','Lot','OCC'],['47','Lot-et-Garonne','NA'],['48','Lozère','OCC'],['49','Maine-et-Loire','PDL'],['50','Manche','NOR'],['51','Marne','GE'],['52','Haute-Marne','GE'],['53','Mayenne','PDL'],['54','Meurthe-et-Moselle','GE'],['55','Meuse','GE'],['56','Morbihan','BRE'],['57','Moselle','GE'],['58','Nièvre','BFC'],['59','Nord','HDF'],['60','Oise','HDF'],['61','Orne','NOR'],['62','Pas-de-Calais','HDF'],['63','Puy-de-Dôme','ARA'],['64','Pyrénées-Atlantiques','NA'],['65','Hautes-Pyrénées','OCC'],['66','Pyrénées-Orientales','OCC'],['67','Bas-Rhin','GE'],['68','Haut-Rhin','GE'],['69','Rhône','ARA'],['70','Haute-Saône','BFC'],['71','Saône-et-Loire','BFC'],['72','Sarthe','PDL'],['73','Savoie','ARA'],['74','Haute-Savoie','ARA'],['75','Paris','IDF'],['76','Seine-Maritime','NOR'],['77','Seine-et-Marne','IDF'],['78','Yvelines','IDF'],['79','Deux-Sèvres','NA'],['80','Somme','HDF'],['81','Tarn','OCC'],['82','Tarn-et-Garonne','OCC'],['83','Var','PACA'],['84','Vaucluse','PACA'],['85','Vendée','PDL'],['86','Vienne','NA'],['87','Haute-Vienne','NA'],['88','Vosges','GE'],['89','Yonne','BFC'],['90','Territoire de Belfort','BFC'],['91','Essonne','IDF'],['92','Hauts-de-Seine','IDF'],['93','Seine-Saint-Denis','IDF'],['94','Val-de-Marne','IDF'],['95','Val-d’Oise','IDF'],['971','Guadeloupe','OM'],['972','Martinique','OM'],['973','Guyane','OM'],['974','La Réunion','OM'],['976','Mayotte','OM']];
 const REGIONS = { GE: 'Grand Est', HDF: 'Hauts-de-France', IDF: 'Île-de-France', NOR: 'Normandie', BRE: 'Bretagne', PDL: 'Pays de la Loire', CVL: 'Centre-Val de Loire', BFC: 'Bourgogne-Franche-Comté', ARA: 'Auvergne-Rhône-Alpes', NA: 'Nouvelle-Aquitaine', OCC: 'Occitanie', PACA: 'Provence-Alpes-Côte d’Azur', COR: 'Corse', OM: 'Outre-mer' };
 // Villes d'Europe : [ville, pays, indice 1, indice 2, indice 3].
 const CITIES = [['Paris','France','Capitale au bord de la Seine','Une tour de fer de 330 m','Le Louvre'],['Rome','Italie','Ville aux sept collines','Le Colisée','Fontaine de Trevi'],['Londres','Royaume-Uni','Traversée par la Tamise','Big Ben','Bus rouges à deux étages'],['Berlin','Allemagne','Un mur la coupait en deux','Porte de Brandebourg','Capitale fédérale'],['Madrid','Espagne','Au centre du pays','Musée du Prado','Le Real joue au Bernabéu'],['Barcelone','Espagne','Au bord de la Méditerranée','La Sagrada Família','Gaudí'],['Amsterdam','Pays-Bas','Des canaux partout','Vélos par milliers','Maison d’Anne Frank'],['Bruxelles','Belgique','Siège de l’Union européenne','L’Atomium','Manneken-Pis'],['Lisbonne','Portugal','Sur le Tage','Tramway jaune n° 28','Pastéis de nata'],['Vienne','Autriche','Sur le Danube','Valses et Mozart','Palais de Schönbrunn'],['Prague','Tchéquie','La ville aux cent clochers','Pont Charles','Horloge astronomique'],['Venise','Italie','Pas de voitures','Gondoles','Place Saint-Marc'],['Athènes','Grèce','Berceau de la démocratie','L’Acropole','Le Parthénon'],['Dublin','Irlande','Sur la Liffey','Trèfle vert','Une bière noire célèbre'],['Copenhague','Danemark','La Petite Sirène','Tivoli','Capitale nordique des vélos'],['Stockholm','Suède','Bâtie sur 14 îles','Remise des prix Nobel','Musée Vasa'],['Budapest','Hongrie','Deux villes réunies par le Danube','Parlement au bord de l’eau','Bains thermaux'],['Strasbourg','France','Siège du Parlement européen','Cathédrale de grès rose','Marché de Noël'],['Marseille','France','Le Vieux-Port','Notre-Dame-de-la-Garde','La bouillabaisse'],['Lyon','France','Rhône et Saône','Fête des Lumières','Bouchons et quenelles'],['Bordeaux','France','Port de la Lune','Le miroir d’eau','Capitale du vin'],['Nice','France','Promenade des Anglais','Baie des Anges','Carnaval'],['Genève','Suisse','Au bout d’un grand lac','Jet d’eau de 140 m','Siège de nombreuses organisations'],['Munich','Allemagne','Capitale de la Bavière','Oktoberfest','BMW'],['Milan','Italie','Capitale de la mode','Le Duomo','La Scala'],['Florence','Italie','Berceau de la Renaissance','Le Ponte Vecchio','Le David de Michel-Ange'],['Édimbourg','Royaume-Uni','Capitale de l’Écosse','Château sur un volcan','Festival d’été'],['Cracovie','Pologne','Ancienne capitale royale','Château du Wawel','Grande place du marché'],['Séville','Espagne','Flamenco','La Giralda','Orangers dans les rues'],['Luxembourg','Luxembourg','Capitale d’un grand-duché','Casemates du Bock','Une des plus riches d’Europe']];
 const LIST = [['games751', 'Onglet « Jeux »', 'Un onglet à côté de Trajets et Entretien, avec les jeux en grandes tuiles.'], ['phone751', 'Jeux sur le téléphone des passagers', 'Les passagers scannent un QR et jouent sur leur téléphone ; les scores s’affichent ici.'], ['blind751', 'Blind test en famille', 'Le titre en cours est caché : qui le trouve en premier ?']];
 if (window.Try750) LIST.forEach(([id, l, d]) => Try750.register(id, l, d, '7.61'));
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
  const subs = window.Games751.subs().map(([act, l, on]) => chipBtn(p, act, l, on)).join('');
  return pageFrame(p, `<div style="display:flex;gap:8px;flex-wrap:wrap;margin:0 0 10px">${subs}</div><div class="scroll" style="overflow:auto;padding:4px 2px;min-height:0">${body}</div>`);
 };
 window.Games751 = { subs: () => [['gsub:home', 'Tous les jeux', G.sub === 'home'], ['gsub:plates', 'Plaques', G.sub === 'plates'], ['gsub:city', 'Devine la ville', G.sub === 'city'], ...(on('blind751') ? [['gsub:blind', 'Blind test', G.sub === 'blind']] : []), ...(on('phone751') ? [['gsub:phone', 'Téléphones', G.sub === 'phone']] : [])] };

 // ---------- Actions ----------
 const act0 = window.act;
 window.act = function (a) {
  if (typeof a !== 'string') return act0.apply(this, arguments);
  if (a.startsWith('gsub:')) { const k = a.slice(5); if (k === 'eco') { tab = 'trips'; tripSub = 'eco'; render(); return; } G.sub = k; tab = 'games'; render(); return; }
  if (a.startsWith('gp:')) { if (driving()) { toast('À l’arrêt, ou sur le téléphone des passagers.'); return; } const k = a.slice(3); if (k === 'reset') { if (G.plateArm) { store.set('plates751', {}); G.plateArm = false; } else { G.plateArm = true; setTimeout(() => { G.plateArm = false; }, 4000); } render(); return; } togglePlate(k); render(); return; }
  if (a.startsWith('gc:')) { if (driving()) { toast('À l’arrêt seulement.'); return; } const c = G.city || (newCity(), G.city); if (a === 'gc:clue' && c.clue < 3 && c.picked == null) c.clue++; else if (a.startsWith('gc:pick:') && c.picked == null) { c.picked = +a.slice(8); c.played++; if (c.picked === c.i) c.score += 4 - c.clue; } else if (a === 'gc:next') newCity(); render(); return; }
  if (a.startsWith('gb:')) { const B = G.blind, k = a.slice(3); if (k === 'start') { B.on = true; B.shown = false; } else if (k === 'stop') { B.on = false; } else if (k === 'show') B.shown = !B.shown; else if (k === 'd') { B.d++; B.shown = true; } else if (k === 'p') { B.p++; B.shown = true; } else if (k === 'next') { B.shown = false; safe(() => A && A.media('next')); } render(); safe(() => paint()); return; }
  if (a === 'gq:clear') { store.set('phoneScores751', {}); render(); return; }
  return act0.apply(this, arguments);
 };
 window.Games751Data = { DEPS, REGIONS, CITIES };
 Object.assign(window.Games751, { G, found, togglePlate, newCity, phonePoll, topic });
})();
