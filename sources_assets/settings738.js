/* 7.38 : réglages rangés en 8 rubriques, doublons fusionnés, lignes sans effet retirées.
   Les pages restent celles des modules d'origine ; seules l'organisation et quelques lignes changent.
   Les anciens emplacements restent valables : ils sont redirigés vers les nouveaux. */
(() => {
 'use strict';
 const page = (cat, sub) => { const c = SETCATS.find(x => x[0] === cat), s = c && c[1].find(x => x[0] === sub); return s ? s[1] : null; };
 const fail = e => { if (window.Errors738) Errors738.add('réglages', e); return ''; };
 const run = (f, p) => { try { return f ? f(p) : ''; } catch (e) { return fail(e); } };
 const join = (...parts) => p => parts.map(f => run(f, p)).join('');
 const title = r => ((r.firstElementChild && r.firstElementChild.firstElementChild) || r).textContent.replace(/ⓘ/g, '').trim();
 // Retire des lignes par leur titre, sans modifier le module qui les dessine.
 function drop(f, titles) {
  return p => {
   const t = document.createElement('template'); t.innerHTML = run(f, p);
   t.content.querySelectorAll('[data-setting-row]').forEach(r => { const n = title(r); if (titles.some(x => n === x || n.startsWith(x + ' '))) r.remove(); });
   return t.innerHTML;
  };
 }
 const clean = f => p => run(f, p).replace(/\bN\d{2} · /g, '');   // codes internes visibles par erreur
 // Applis d'usine : seules celles réellement installées sur l'autoradio sont proposées.
 function installedCarApps(f) {
  return p => {
   const apps = (typeof allApps === 'function' && allApps()) || [];
   if (!A || apps.length < 4 || typeof CARAPPS === 'undefined') return run(f, p);
   const missing = CARAPPS.filter(([, pk, re]) => !apps.some(a => a.p === pk || re.test(a.l || '') || re.test(a.p))).map(([n]) => n);
   const html = drop(f, missing)(p);
   return missing.length === CARAPPS.length ? html + `<p style="color:${p.mut}">Aucune appli d’usine reconnue sur cet autoradio.</p>` : html;
  };
 }
 // D04 (roues de la voiture 3D) : seule option cachée du décor 7.21 encore utilisée.
 const wheels = p => setRow(p, 'Roues qui tournent (voiture 3D)', 'La bande de roulement tourne avec la vitesse.', chipBtn(p, 'decor721:toggle:4', Decor721.on(4) ? 'Activé' : 'Désactivé', Decor721.on(4)));

 const old = SETCATS.map(([c, subs]) => [c, subs.slice()]);
 const P = page;
 const layout = [
  ['Accueil et affichage', [
   ['Thèmes', P('Affichage et personnalisation', 'Thèmes')],
   ['Fond d\'écran', P('Affichage et personnalisation', 'Fond d\'écran')],
   ['Icônes', P('Affichage et personnalisation', 'Icônes')],
   ['Police', P('Affichage et personnalisation', 'Police')],
   ['Heure et date', P('Affichage et personnalisation', 'Heure et date')],
   ['Nuit, luminosité, pause', P('Affichage et personnalisation', 'Nuit, luminosité, pause')],
   ['Barre du haut', P('Affichage et personnalisation', 'Barre du haut')],
   ['Disposition de l\'accueil', join(P('Écran d\'accueil', 'Disposition'), P('Écran d\'accueil', 'Hauteur de la barre Accueil'), P('Écran d\'accueil', 'Barre d’applications'))],
   ['Barre de raccourcis', join(P('Widgets', 'Barre des raccourcis'), drop(P('Écran d\'accueil', 'Barre de raccourcis'), ['Position', 'Nombre de raccourcis']))],
   ['Toutes les applications', P('Widgets', 'Toutes les applications')],
  ]],
  ['Widgets', [
   ['Vue voiture et route', join(P('Widgets', 'Vue voiture et route'), drop(P('Affichage et personnalisation', 'Voiture affichée'), ['Voiture 3D']), wheels)],
   ['Multimédia', P('Widgets', 'Multimédia')],
  ]],
  ['GPS et navigation', [
   ['Cadre GPS et alignement', join(P('Navigation', 'Appli GPS'), drop(P('Navigation', 'Cadre GPS et alignement'), ['Masquer la barre du haut']))],
   ['Vue conducteur', P('Navigation', 'Vue conducteur')],
   ['Alerte de vitesse', P('Navigation', 'Alerte de vitesse')],
   ['Zones de danger', P('Navigation', 'Zones de danger')],
   ['Assistant vocal', P('Navigation', 'Assistant')],
   ['Adresses', P('Navigation', 'Adresses')],
   ['Panneaux d’autoroute', p => window.Highway738 && Highway738.settings ? Highway738.settings(p) : ''],
   ['Bouchons en direct', p => window.V740 ? V740.settingsTraffic(p) : ''],
   ['Panneaux dans l’image', p => window.V740 ? V740.settingsPanels(p) : ''],
   ['Cacher Waze hors de l’accueil', p => window.V740 && V740.settingsCompanion ? V740.settingsCompanion(p) : ''],
  ]],
  ['Véhicule', [
   ['Apprendre ma voiture', join(P('Véhicule', 'Apprentissage automatique'), P('Véhicule', 'Apprendre ma voiture'))],
   ['Données CAN', P('Véhicule', 'Données CAN')],
   ['Applis de l\'autoradio', installedCarApps(P('Véhicule', 'Réglages voiture'))],
   ['Alertes', P('Véhicule', 'Alertes')],
   ['Tension batterie', P('Véhicule', 'Tension batterie')],
  ]],
  ['Trajets et carburant', [
   ['Enregistrement des trajets', P('Navigation', 'Parcours')],
   ['Carburant et stations', join(P('Véhicule', 'Carburant'), drop(P('Navigation', 'Stations essence'), ['⛽ Carburant']))],
   ['Organisation et données', P('Trajets et carburant', 'Organisation et données')],
   ['Péages (estimation)', p => window.V740 ? V740.settingsToll(p) : ''],
   ['Transfert depuis le téléphone', P('Trajets et carburant', 'Transfert depuis le téléphone')],
  ]],
  ['Météo', [
   ['Actualisation', P('Météo', 'Actualisation')],
   ['Affichage et vigilance', P('Météo', 'Affichage et vigilance')],
   ['Météo devant toi', p => window.V740 ? V740.settingsWeather(p) : ''],
  ]],
  ['Entretien', [
   ['Rappels', P('Entretien', 'Rappels')],
   ['Le point au démarrage', P('Entretien', 'Le point au démarrage')],
  ]],
  ['Système', [
   ['Profils', P('Profils', 'Profils')],
   ['Écran d\'accueil du poste', P('Système', 'Écran d\'accueil')],
   ['Autorisations', P('Système', 'Autorisations')],
   ['Sauvegarde', P('Système', 'Sauvegarde')],
   ['Rapport de diagnostic', P('Système', 'Rapport de diagnostic')],
   ['Rechercher l’affichage', P('Système', 'Rechercher l’affichage')],
   ['Performances', P('Système', 'Diagnostic · Performances')],
   ['Mises à jour', join(P('Mises à jour', 'Version'), clean(P('Mises à jour', 'Téléchargement et vérification')))],
   ['Nouveautés', P('Mises à jour', 'Nouveautés et historique')],
   ['Stockage et nettoyage', clean(P('Mises à jour', 'Stockage et nettoyage'))],
   ['À propos', P('À propos', 'À propos')],
  ]],
 ];
 // Toute page ajoutée par un module et non classée ci-dessus reste accessible dans sa rubrique d'origine.
 const used = new Set(['Navigation/Appli GPS', 'Navigation/Cadre GPS et alignement', 'Navigation/Vue conducteur', 'Navigation/Alerte de vitesse', 'Navigation/Zones de danger', 'Navigation/Assistant', 'Navigation/Adresses', 'Navigation/Parcours', 'Navigation/Stations essence',
  'Écran d\'accueil/Disposition', 'Écran d\'accueil/Hauteur de la barre Accueil', 'Écran d\'accueil/Barre d’applications', 'Écran d\'accueil/Barre de raccourcis',
  'Widgets/Barre des raccourcis', 'Widgets/Toutes les applications', 'Widgets/Vue voiture et route', 'Widgets/Multimédia', 'Véhicule/Apprentissage automatique', 'Véhicule/Apprendre ma voiture', 'Véhicule/Données CAN', 'Véhicule/Réglages voiture', 'Véhicule/Alertes', 'Véhicule/Tension batterie', 'Véhicule/Carburant',
  'Système/Écran d\'accueil', 'Système/Autorisations', 'Système/Sauvegarde', 'Système/Rapport de diagnostic', 'Système/Diagnostic · Performances', 'Profils/Profils', 'Mises à jour/Version', 'Mises à jour/Téléchargement et vérification', 'Mises à jour/Nouveautés et historique', 'Mises à jour/Stockage et nettoyage', 'À propos/À propos',
  'Trajets et carburant/Organisation et données', 'Trajets et carburant/Transfert depuis le téléphone', 'Météo/Actualisation', 'Météo/Affichage et vigilance', 'Entretien/Rappels', 'Entretien/Le point au démarrage',
  ...['Thèmes', 'Fond d\'écran', 'Icônes', 'Police', 'Heure et date', 'Nuit, luminosité, pause', 'Barre du haut', 'Voiture affichée'].map(s => 'Affichage et personnalisation/' + s)]);
 const target = { 'Affichage et personnalisation': 'Accueil et affichage', 'Écran d\'accueil': 'Accueil et affichage', 'Navigation': 'GPS et navigation', 'Profils': 'Système', 'Mises à jour': 'Système', 'À propos': 'Système' };
 for (const [c, subs] of old) for (const [s, f] of subs) {
  if (used.has(c + '/' + s)) continue;
  const name = target[c] || c, cat = layout.find(x => x[0] === name);
  if (cat) cat[1].push([s, f]); else layout.push([name, [[s, f]]]);
 }
 for (const cat of layout) cat[1] = cat[1].filter(([, f]) => typeof f === 'function');
 SETCATS.splice(0, SETCATS.length, ...layout.filter(c => c[1].length));

 // Anciens emplacements → nouveaux (boutons « Réglages » ailleurs dans l'appli, anciens liens).
 const ALIAS = {
  'Affichage et personnalisation/Voiture affichée': ['Widgets', 'Vue voiture et route'],
  'Écran d\'accueil/Disposition': ['Accueil et affichage', 'Disposition de l\'accueil'], 'Écran d\'accueil/Hauteur de la barre Accueil': ['Accueil et affichage', 'Disposition de l\'accueil'],
  'Écran d\'accueil/Barre d’applications': ['Accueil et affichage', 'Disposition de l\'accueil'], 'Écran d\'accueil/Barre de raccourcis': ['Accueil et affichage', 'Barre de raccourcis'],
  'Écran d\'accueil/Alignement GPS et plein écran': ['GPS et navigation', 'Cadre GPS et alignement'],
  'Widgets/Barre des raccourcis': ['Accueil et affichage', 'Barre de raccourcis'], 'Widgets/Toutes les applications': ['Accueil et affichage', 'Toutes les applications'],
  'Navigation/Appli GPS': ['GPS et navigation', 'Cadre GPS et alignement'], 'Navigation/Cadre GPS': ['GPS et navigation', 'Cadre GPS et alignement'], 'Navigation/Petite fenêtre GPS': ['GPS et navigation', 'Cadre GPS et alignement'],
  'Navigation/Assistant': ['GPS et navigation', 'Assistant vocal'], 'Navigation/Parcours': ['Trajets et carburant', 'Enregistrement des trajets'], 'Navigation/Stations essence': ['Trajets et carburant', 'Carburant et stations'],
  'Navigation/Paysages et météo': ['Widgets', 'Vue voiture et route'], 'Navigation/Panneaux et localités': ['Widgets', 'Vue voiture et route'], 'Navigation/Décor de la route': ['Widgets', 'Vue voiture et route'],
  'Navigation/Météo et vigilance': ['Météo', 'Affichage et vigilance'],
  'Véhicule/Carburant': ['Trajets et carburant', 'Carburant et stations'], 'Véhicule/Apprentissage automatique': ['Véhicule', 'Apprendre ma voiture'], 'Véhicule/Réglages voiture': ['Véhicule', 'Applis de l\'autoradio'],
  'Système/Écran d\'accueil': ['Système', 'Écran d\'accueil du poste'], 'Système/Diagnostic · Performances': ['Système', 'Performances'], 'Système/Diagnostic et rapport': ['Système', 'Rapport de diagnostic'],
  'Profils/Profils': ['Système', 'Profils'], 'Mises à jour/Version': ['Système', 'Mises à jour'], 'Mises à jour/Téléchargement et vérification': ['Système', 'Mises à jour'],
  'Mises à jour/Nouveautés et historique': ['Système', 'Nouveautés'], 'Mises à jour/Stockage et nettoyage': ['Système', 'Stockage et nettoyage'], 'À propos/À propos': ['Système', 'À propos'],
  'Trajets et carburant/Importer depuis le téléphone': ['Trajets et carburant', 'Transfert depuis le téléphone'],
 };
 const exists = (c, s) => { const cat = SETCATS.find(x => x[0] === c); return !!cat && (!s || cat[1].some(x => x[0] === s)); };
 const open0 = window.openSet;
 window.openSet = function (cat, sub) {
  if (!exists(cat, sub)) {
   const a = ALIAS[cat + '/' + sub];
   if (a) { cat = a[0]; sub = a[1]; }
   else if (target[cat]) cat = target[cat];   // même page, nouvelle rubrique (sinon la première page de la rubrique)
  }
  return open0.call(this, cat, sub);
 };
 window.Settings738 = { layout: () => SETCATS.map(([c, subs]) => [c, subs.map(s => s[0])]), alias: ALIAS };
 if (window.Settings720) Settings720.index = null;
})();
