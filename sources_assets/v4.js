/* Accueil 2008 GT — module v4.0 — by Roudoussa 67
   Ajouts de la version 4 (chargé après app.js) :
   - barre du haut : date complète, état d'Internet, heure et date personnalisables
   - tuile voiture : route animée (vitesse réelle, météo réelle, jour / nuit)
   - appui long sur un widget : choisir ce qu'il affiche (croix pour retirer)
   - météo détaillée (heure par heure + 7 jours), actualisation réglable
   - Trajets : Historique, Graphiques (prix, litres, km, score éco), Éco-conduite
   - Paramètres rangés par catégories (Thèmes déplacés ici)
   - ~100 fonds d'écran + photos perso, nombre de raccourcis
   - vérification CAN au démarrage, sauvegarde / restauration, mises à jour */
'use strict';
const APP_VERSION = '7.21';
const APP_AUTHOR = 'Roudoussa 67';
const CHANGELOG = [
  ['7.21', 'Novembre 2026', ['39 options de décor indépendantes dans Navigation', 'Aperçu animé local avant application', 'Téléchargement vérifié et gestion du cache de cette application']],
  ['7.20', 'Novembre 2026', ['Position de défilement conservée dans les paramètres', 'Recherche des réglages avec filtres et dictée vocale', 'Barre d’applications compacte pour agrandir le GPS', 'Proposition de mise à jour avant téléchargement']],
  ['7.19', 'Novembre 2026', ['Soleil, lune et ciel progressif selon heure et GPS, réglables dans Navigation / Décor de la route', 'Canvas redimensionné aussi lorsque seule la hauteur disponible change']],
  ['7.18', 'Novembre 2026', ['Transition et durée réglables dans Navigation / Décor de la route', 'Taille, écart et fréquence des panneaux dans Navigation / Panneaux et localités']],
  ['7.17', 'Novembre 2026', ['Panneaux rapprochés du bord de route et espaces réservés réduits']],
  ['7.16', 'Novembre 2026', ['Décor d’origine avec emplacements fixes pour bâtiments, espaces et panneaux ; suppression du masquage dynamique']],
  ['7.15', 'Novembre 2026', ['Arbres et maisons rétablis autour du panneau, protection locale des poteaux et du nom à chaque passage']],
  ['7.14', 'Novembre 2026', ['Panneau rapproché de la route avec marge de sécurité, arbres du premier plan droit dégagés']],
  ['7.13', 'Novembre 2026', ['Panneau dans la perspective et l’ordre du décor, comme les arbres, ancré hors de la chaussée']],
  ['7.12', 'Novembre 2026', ['Panneau animé avec le décor et protégé du chevauchement avec la voiture', 'Véhicules visibles en sens inverse sur l’autre chaussée']],
  ['7.11', 'Novembre 2026', ['Barre Accueil descendue et hauteur réglable pour rester accessible', 'Un seul panneau fixe sur le bas-côté droit, sans avancer vers la voiture', 'Suppression du panneau sous la voiture et des bâtiments qui gênent le panneau']],
  ['7.10', 'Novembre 2026', ['Panneaux permanents ville / village / autoroute, ville ou village le plus proche sur autoroute', 'Actualisation des lieux réglable (1 minute par défaut)', 'Coordonnées GPS corrigées, suivi du cadre et réglage fin de sa position', 'Intégration native lorsque les permissions Android le permettent, plein écran renforcé']],
  ['7.9', 'Novembre 2026', ['Zones de danger : petite pastille sous la vitesse + sons (zone, trop vite, passage à niveau, école, danger)', 'Volume des alertes réglable par profil', 'Profils Abdou, Sakina, Profil 3 : touche ton nom en haut à gauche pour changer', 'Accueil au démarrage : Bonsoir + ton nom, date, météo', 'Assistant : micro sur la tuile route (Gemini ou assistant de l\'appli), désactivable']],
  ['7.8', 'Novembre 2026', ['Luminosité : barre à glisser en % (et pour la nuit aussi)']],
  ['7.7', 'Novembre 2026', ['Plus que 2 thèmes : Autoradio et Personnalisable (tuiles et widgets où tu veux)', '120 dégradés de toutes les couleurs', '200 fonds d\'écran de toutes les couleurs', 'Panneau d\'autoroute et de voie rapide sur le bas-côté : il ne passe plus sur la voiture']],
  ['7.6', 'Novembre 2026', ['Panneau de limitation à côté de la vitesse sur la tuile route ; vitesse en rouge si tu dépasses', 'Bip : une seule fois quand tu dépasses (rappel toutes les 15 s en option) et 8 sons au choix', 'Grands panneaux d\'entrée de ville et de village (le nom de l\'endroit où tu es)', 'Panneau vert sur voie rapide, bleu sur autoroute, toujours entier dans la tuile', '59 polices pour toute l\'appli (Affichage et personnalisation → Police)', 'Cadre GPS : l\'accueil ne remonte plus pendant que Waze est ouvert, et Waze est replacé tout seul si le cadre bouge (thème, taille…)']],
  ['7.5', 'Novembre 2026', ['Cadre GPS : toucher l\'accueil ne fait plus disparaître Waze (il est remis dans le cadre juste après), retour sur l\'onglet Accueil aussi', 'Autoroute mieux reconnue : la grosse route passe devant la bretelle ou la rue voisine, et les voies rapides « A » ou « M » (comme la M 35) comptent comme autoroute', 'Message si le cadre a bougé depuis la dernière ouverture (fermer Waze une fois pour qu\'il se remette au bon endroit)', 'Journal : route lue sur la carte et décor choisi']],
  ['7.4', 'Novembre 2026', ['Disposition « Autoradio » (thème par défaut) : barre d\'icônes à gauche, route + vitesse + météo, GPS en grand, musique compacte, rangée d\'applis, une seule page', 'Thème Autoradio en 7 couleurs (Bleu, Nuit, Bordeaux, Émeraude, Violet, Carbone, Blanc), fonds d\'écran et personnalisation (boutons, fond, cartes transparentes)', 'Applis du bas modifiables sur l\'accueil : appui long → retirer (−), ajouter (+), remplacer', 'Style d\'icônes « Autoradio »', 'Décor autoroute 2×2 voies (voie de droite, muret central, bande d\'arrêt d\'urgence) avec panneau bleu de la ville la plus proche devant toi', 'Nouveaux décors forêt et village (maisonnettes espacées, panneau d\'entrée), détectés sur la carte', 'Neige sur les arbres et les toits, pluie bien visible, brouillard sur tous les décors', 'Cadre GPS : l\'accueil descend sous la barre du poste quand le GPS est dans le cadre (hauteur réglable)', '« Parcours » rangé dans l\'onglet Trajets']],
  ['7.3', 'Novembre 2026', ['Cadre GPS : si le GPS repasse en plein écran juste après l\'ouverture dans le cadre (il était déjà ouvert en grand), le cadre l\'explique et propose « Fermer Waze » puis « Ouvrir ici ». L\'appli ne le relance plus toute seule, donc plus de rebond en plein écran à chaque retour sur l\'accueil', 'Icône GPS : ouvre le GPS dans le cadre même en mode modification ou depuis une autre page (avant : plein écran)', 'Mode modification : rappel « OK en haut à droite » sur le cadre GPS, et sortie toute seule après 45 s sans toucher l\'écran ou dès que la voiture roule', 'Toucher le cadre ouvre toujours le GPS dedans, même si une fenêtre de l\'appli le recouvre en partie', 'Assistant « Petite fenêtre GPS » et diagnostic : bouton pour fermer le GPS avant de tester', 'Message au démarrage : le bon chemin vers le réglage du lanceur officiel (Système → Écran d\'accueil)']],
  ['7.2', 'Novembre 2026', ['Cadre GPS : quand tu reviens sur l\'accueil (touche Accueil, ou après une appli en plein écran), le GPS que tu avais ouvert dans le cadre y revient tout seul. Réglage : Navigation → Cadre GPS → Remettre le GPS dans le cadre', 'Cadre GPS : une fois la petite fenêtre confirmée, l\'appli ne repasse plus jamais d\'elle-même en mode plein écran', 'Cadre GPS : le GPS n\'est plus relancé au hasard d\'un rafraîchissement de l\'écran, seulement juste après avoir déplacé ou redimensionné le cadre', 'Le point au démarrage, la saisie du plein et du pense-bête s\'affichent à côté du cadre quand le GPS y est ouvert (la petite fenêtre passe au-dessus de l\'appli)', 'Ouverture toute seule au démarrage (si activée) : après l\'écran Bienvenue et le point au démarrage', 'Pense-bête en roulant : bandeau à part, plus effacé par les autres messages', 'Diagnostic : le journal dit si le GPS est passé en plein écran après un de tes appuis ou tout seul']],
  ['7.1', 'Novembre 2026', ['Le point au démarrage : au contact, une fenêtre montre seulement ce qui demande ton attention (pense-bêtes, autonomie basse avec la station la moins chère, vigilance et pluie, pneus du mois, entretien proche, résumé d\'hier). Se ferme toute seule après 15 s ou dès que tu roules. Réglages : Entretien → Le point au démarrage', 'Pense-bêtes : écris-en un garé, il ressort à chaque démarrage jusqu\'à « Fait ». Widget « Pense-bête » en option', 'Plein pré-rempli : bouton ⛽ Plein sur la carte Carburant. Après un plein, la jauge le détecte et la carte propose litres, prix de la station et compteur : un appui pour l\'enregistrer dans Entretien → Pleins. Widget « Plein » en option', 'Bilan : les parcours effacés pour faire de la place (au-delà de 300) restent comptés dans le mois, l\'année et les semaines', 'Bilan : « juin » et « juil » au lieu de deux « jui »', 'Rappel de pression des pneus : plus de message tous les jours juste après le contrôle']],
  ['7.0', 'Novembre 2026', ['Écran de bienvenue : « Vérification de l\'autoradio » proposée une seule fois ; une fois validée, elle n\'est plus proposée', 'La vérification corrige toute seule ce qu\'elle peut (appli GPS désinstallée, boutons de la barre reliés à une appli désinstallée, ancienne ouverture auto en plein écran, luminosité presque noire, widgets d\'un ancien type, services qui ne répondaient pas)', 'Ce qui demande un réglage d\'Android est en orange avec le bouton pour y aller ; ce qu\'elle ne peut pas corriger est en rouge, avec le rapport à m\'envoyer', 'Corrections sûres faites aussi en silence au démarrage']],
  ['6.9', 'Novembre 2026', ['Paramètres › Système › Diagnostic et rapport : l\'appli cherche ce qui ne va pas (cadre GPS, boîtier CAN, GPS, Internet et services, autorisations, erreurs) et dit quoi faire', 'Rapport complet (autoradio, Android, applis installées, données de la voiture, journal) à envoyer par e-mail, WhatsApp, copier, ou afficher en grand pour une photo', 'Journal des événements : essais du cadre GPS, erreurs, réseau', 'Bouton « Ça ne marche toujours pas ? » dans l\'assistant Petite fenêtre GPS']],
  ['6.8', 'Novembre 2026', ['Paramètres › Navigation › Petite fenêtre GPS : assistant pas à pas (bouton vers « À propos » pour le mode développeur, bouton vers les options développeur, redémarrage, test)', 'Option avancée : les 3 commandes ADB pour tout activer d\'un coup, avec un bouton Copier', 'Le lien « Comment l\'activer ? » du cadre GPS ouvre l\'assistant']],
  ['6.7', 'Novembre 2026', ['Waze ne s\'ouvre plus tout seul au démarrage ni en revenant à l\'accueil : seulement quand tu touches le cadre GPS', 'Si l\'autoradio ouvre l\'appli en plein écran, le cadre le détecte et te le dit (avec la marche à suivre pour essayer d\'activer la petite fenêtre)', 'Paramètres › Navigation › Cadre GPS : mode Dans le cadre / Plein écran, et ouverture au démarrage (désactivée par défaut)', 'Ancienne fenêtre flottante de la carte : ne s\'ouvre plus toute seule non plus']],
  ['6.6', 'Novembre 2026', ['Applis (barre du bas) façon Windows 11 : la dernière utilisée et les plus utilisées en haut, puis toutes les applis de A à Z', 'Lettres A à Z sur la droite, ou grille des lettres en touchant un titre : un appui emmène direct aux applis de cette lettre', 'Ordre alphabétique aussi dans la page des applis de l\'accueil et les listes de choix', 'Historique des applis effaçable (deux appuis)']],
  ['6.5', 'Novembre 2026', ['Contrôle complet de l\'appli : 691 boutons, 35 pages de réglages, 149 thèmes, 16 dispositions et tous les widgets testés', 'Parcours : un bouchon ou un arrêt moteur tournant ne coupe plus le trajet en deux', 'Parcours : compteur de départ et d\'arrivée gardés (même si l\'appli redémarre en route), kilomètres plus justes sur les petits trajets', 'Limitation de vitesse : effacée quand elle n\'est plus sûre (réseau coupé, position trop loin) : plus de bip à tort', 'Vigilance : bip une seule fois par alerte, alerte effacée à son expiration même sans réseau', 'Coût des trajets : prix de la station la moins chère tant qu\'aucun plein n\'est noté', 'Stations : Y aller ouvre l\'appli GPS installée si Waze manque ; Allemagne interrogée au plus toutes les 5 min (règles Tankerkönig), stations fermées signalées', 'Apprendre ma voiture : n\'efface plus ce qui a été appris avec l\'apprentissage automatique', 'Réseau : une requête sans réponse ne bloque plus la limitation, la météo ou les stations']],
  ['6.4', 'Novembre 2026', ['Widget « Stations autour » : la moins chère et la plus proche, bouton Y aller (Waze)', 'Prix en Allemagne (Tankerkönig, clé gratuite) près de la frontière et en Allemagne', 'Tension batterie dans la barre du haut, à côté du Wi-Fi (vert, orange, rouge)', 'Alerte batterie faible moteur coupé']],
  ['6.3', 'Novembre 2026', ['Entretien : pression des pneus chaque mois (valeurs réglables), filtre à carburant, bouton Fait', 'Entretien → Pleins : carnet des pleins, trajets faits avec chaque plein (carte du point A au point B), conso et coût réels', 'Entretien → Bilan : récapitulatif du mois avec graphique et bilan de l\'année (mois le plus utilisé, le plus cher)', 'Paramètres : mode nuit (soleil, phares, toujours, jamais), luminosité, pause fatigue automatique au bout de 3 h']],
  ['6.2', 'Novembre 2026', ['Paramètres → Véhicule → Apprentissage automatique : l\'appli cherche toute seule ce que le boîtier CAN envoie, rapport de ce qui manque, capture ou ajout manuel, enregistré pour toujours et branché sur tous les widgets', 'Kilométrage : saisie manuelle si le boîtier ne l\'envoie pas (il avance ensuite avec le GPS)']],
  ['6.1', 'Novembre 2026', ['Styles d\'icônes : seulement la barre du bas, les icônes des applis installées restent d\'origine']],
  ['6.0', 'Novembre 2026', ['Paramètres → Affichage → Icônes : 5 styles d\'icônes (iPhone, Mac, Windows 11, Android, Accueil 2008) pour la barre du bas et les applis de l\'accueil']],
  ['5.9', 'Novembre 2026', ['Widget route : brouillard (nappes qui dérivent), orage avec éclairs à différents endroits, flash et bruit de tonnerre', 'Vigilance météo orange / rouge de ton département (MeteoAlarm / Météo-France) en pastille, avec bip', 'Nom de la ville ou du village sous la température']],
  ['5.8', 'Novembre 2026', ['Widget route : décor autoroute (3 voies, glissières, panneaux), ville (immeubles, lampadaires) ou campagne (collines, arbres), choisi tout seul selon la route', 'Le bord de route défile avec ta vitesse', 'Paramètres → Navigation → Décor de la route : automatique ou forcé']],
  ['5.7', 'Novembre 2026', ['Alerte de vitesse : panneau de limitation sur le widget voiture 3D, vitesse en rouge et bip si tu dépasses', 'Paramètres → Navigation → Alerte de vitesse : activer / couper le son, marge de tolérance, bouton Tester']],
  ['5.6', 'Novembre 2026', ['Widget voiture 3D : vitesse à la place du kilométrage', 'Parcours : compteur de la voiture au départ et à l\'arrivée, carburant et coût de chaque trajet', 'Parcours → Semaines & € : total de km, litres et euros par semaine, prix de l\'essence réglable']],
  ['5.5', 'Novembre 2026', ['Widget route + voiture 3D : kilométrage de la voiture, km du trajet, météo en haut à droite et adresse en bas']],
  ['5.4', 'Novembre 2026', ['100 nouveaux thèmes (50 à 149) : villes, nature, néon, luxe, rétro, saisons, couleurs pures', 'Aperçus des 149 thèmes refaits avec la voiture 3D et les widgets actuels']],
  ['5.3', 'Novembre 2026', ['Vitesse : prend celle du GPS quand le boîtier n\'envoie rien ou 0 en roulant', 'Parcours : démarre tout seul quand le moteur démarre', 'Parcours : fiche détaillée (grande carte, zoom, temps en mouvement, arrêts, moyennes) et envoi par mail']],
  ['5.2', 'Novembre 2026', ['Cadre GPS : la vraie appli (Waze, Google Maps…) s\'ouvre dans le cadre en fenêtre libre et se recale quand tu le déplaces ou le redimensionnes', 'Ancienne carte intégrée et Fenêtre web retirées de l\'accueil', 'Tailles Petit / Moyen / Grand pour le cadre GPS']],
  ['5.1', 'Novembre 2026', ['Nouveau widget « Fenêtre web » à la place du GPS : Waze carte en direct, Google Maps ou n\'importe quelle page web (Paramètres → Fenêtre web)']],
  ['5.0', 'Novembre 2026', ['Kilomètres en direct sur les widgets même quand le GPS est faible ou absent (vitesse de la voiture utilisée)', 'GPS moins imprécis accepté pour compter les km']],
  ['4.9', 'Novembre 2026', ['Cadre GPS : Waze / Maps dans le cadre (module GPS), sans les logos sur le côté ni aucun bouton. Si Android refuse (appli pas dans /system/priv-app), le cadre montre la carte de l\'appli au lieu du message d\'erreur', 'Écran de bienvenue : indique si la position GPS ou les infos de la voiture ne sont pas reçues, avec le bouton pour corriger', 'Onglet Parcours : état du GPS affiché']],
  ['4.7', 'Novembre 2026', ['Nouvel onglet Parcours : le tracé GPS de chaque trajet est enregistré du départ à l\'arrivée (carte, kilomètres, durée, vitesse)', 'Écran de bienvenue au démarrage : choix de l\'utilisateur, lanceur officiel, musique', 'Un widget par usage : Vitesse, Météo, Adresse, Route animée, Parcours…', 'Choix des widgets en images, avec la taille', 'Appui long sur un widget ou une appli : mode édition direct', 'Voiture 3D partout : photos et dessin retirés, aperçus des thèmes refaits', 'Widget GPS : Waze ou Google Maps dans le cadre (version système)']],
  ['4.3', 'Novembre 2026', ['Apprendre l\'ordinateur de bord : lit les valeurs de l\'appli voiture (Capturer / Terminer / Main libre), carburant, autonomie, kilométrage…', 'Apprendre ma voiture : portes, coffre, capot, marche arrière, feux, ceinture, étape par étape', 'Kilométrage : valeur apprise + distance GPS', 'Nouvelle voiture 3D sur l\'accueil', 'Cadre GPS en mode Freeform à la place de la carte : choix du GPS, lancement automatique, appui long = Navi / DVR']],
  ['4.2', 'Novembre 2026', ['Route façon autoradio : ville en fond, grosse vitesse, météo, route bleue qui défile, pluie, neige, nuit, adresse en bas', 'Plan d\'entretien : bouton Valider sur chaque ligne (date, km, prix, garage) qui remplit le carnet', '4G avec les barres, Bluetooth et Wi-Fi en haut : blancs quand c\'est activé, ils ouvrent leur réglage', 'Bouton Cadre sur la carte : Navi ou DVR, choix de l\'appli GPS, ouverture dans le cadre (fenêtre freeform)']],
  ['4.1', 'Novembre 2026', ['Nouveau bloc « Ville + rue + position » (numéro, rue, code postal, coordonnées GPS, altitude)', 'Entretien › Plan constructeur Peugeot 2008 1.2 PureTech avec échéances en km et en date', 'Envoi du plan par e-mail et impression PDF', 'Autonomie lue au bon endroit des données voiture', 'Boutons directs vers DSP, ventilateur, TPMS, caméra de recul et test usine']],
  ['4.0', 'Novembre 2026', ['Paramètres rangés par catégories ; Thèmes déplacés dans Paramètres › Affichage', 'Onglets Accueil, Trajets (Historique, Graphiques, Éco-conduite) et Entretien', 'Graphiques par jour : prix, litres, kilomètres, score éco', 'Tuile voiture : route animée qui avance avec la vitesse, pluie, neige, brouillard, jour et nuit', 'Appui long sur un widget pour choisir ce qu\'il affiche (croix pour retirer)', 'Date complète et état d\'Internet dans la barre du haut ; heure et date personnalisables', 'Météo détaillée : heure par heure et 7 jours, actualisation réglable', 'Environ 100 fonds d\'écran + tes photos', 'Nombre de raccourcis réglable ; appli GPS au choix', 'Vérification des données CAN à chaque démarrage', 'Sauvegarde et restauration des réglages ; vérification des mises à jour', '« 2008 GT Line », alertes portes / ceinture masquées tant qu\'elles ne marchent pas']],
  ['3.2', '', ['49 thèmes, 14 dispositions et grille 6 × 4', 'Voiture en 3D, calibrage des voyants', 'Onglets Trajets, Entretien, Éco-conduite, Thèmes']]
];

// ---------- petites aides ----------
ICON.wifi = 'M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01';
ICON.off = 'M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01M3 3l18 18';
ICON.x = 'M6 6l12 12M18 6L6 18';
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const pv = (k, d) => store.get(k + '_' + profIdx(), d);
const setPv = (k, v) => store.set(k + '_' + profIdx(), v);
const chipBtn = (p, act, t, on, extra = '') => `<button data-act="${act}" style="height:44px;padding:0 14px;border-radius:10px;font-size:14px;font-weight:600;white-space:nowrap;${on ? `background:${p.acc};color:${p.onAcc}` : `background:${p.card2};color:${p.txt}`};${extra}">${t}</button>`;
const togBtn = (p, act, on) => `<button data-act="${act}" aria-pressed="${on}" style="width:52px;height:30px;border-radius:15px;background:${on ? p.acc : p.card2};position:relative;flex:none;border:1px solid #8883"><span style="position:absolute;top:3px;${on ? 'right:3px' : 'left:3px'};width:22px;height:22px;border-radius:50%;background:#fff"></span></button>`;
const setRow = (p, t, d, ctl) => `<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 2px;border-bottom:1px solid ${p.light ? '#0000000f' : '#ffffff0f'}"><div style="min-width:0"><div style="font-size:16px;font-weight:600">${t}</div>${d ? `<div style="font-size:13px;color:${p.mut};margin-top:2px">${d}</div>` : ''}</div><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end">${ctl || ''}</div></div>`;
const secT = (p, t) => `<div style="font-size:12px;font-weight:700;letter-spacing:.06em;color:${p.mut};margin:14px 0 4px">${t.toUpperCase()}</div>`;

// ---------- réseau : Internet OK ? ----------
let netOk = null, netAt = 0;
const _http = window.http;
window.http = function (url) { return _http(url).then((r) => { if (!DEMO) { netOk = !!r.ok || netOk; if (r.ok) netAt = Date.now(); } return r; }); };
async function checkNet() { if (DEMO) { netOk = true; return; } const r = await _http('https://www.google.com/generate_204'); netOk = !!r.ok; if (r.ok) netAt = Date.now(); }

// ---------- heure et date personnalisables ----------
const CLK_DEF = { font: '', color: '', size: 'm', h12: false, sec: false, date: 'court', year: true };
const clk = () => Object.assign({}, CLK_DEF, pv('clk', {}));
const CLK_FONTS = [['', 'Celle du thème'], ['Inter', 'Inter'], ['Rajdhani', 'Rajdhani'], ['Orbitron', 'Orbitron'], ['Space Grotesk', 'Space Grotesk'], ['Playfair Display', 'Playfair']];
const CLK_COLORS = ['', '#FFFFFF', '#E0312B', '#F0B060', '#5DCAA5', '#56CCF2', '#2F7FE0', '#B388FF', '#FF7AB6'];
const CLK_SIZE = { s: [19, 11], m: [23, 12], l: [28, 13], xl: [34, 14] };
function clockTxt(c, now) { let h = now.getHours(); const suf = c.h12 ? (h >= 12 ? ' PM' : ' AM') : ''; if (c.h12) h = h % 12 || 12; return (c.h12 ? h : pad(h)) + ':' + pad(now.getMinutes()) + (c.sec ? ':' + pad(now.getSeconds()) : '') + suf; }
function dateTxt(c, now) {
  const y = c.year ? ' ' + now.getFullYear() : '';
  if (c.date === 'aucune') return '';
  if (c.date === 'long') return `${JOURS[now.getDay()]} ${now.getDate()} ${MOIS[now.getMonth()]}${y}`;
  if (c.date === 'chiffres') return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}${c.year ? '/' + now.getFullYear() : ''}`;
  return `${JOURS[now.getDay()].slice(0, 3)}. ${now.getDate()} ${MOIS[now.getMonth()]}${y}`;
}

// ---------- barre du haut ----------
const tripSubs = [['hist', 'Historique'], ['charts', 'Graphiques'], ['eco', 'Éco-conduite']];
let tripSub = 'hist', svcSub = 'plan';
window.header = function (p) {
  if (p.noChrome) return '';
  const name = profiles()[profIdx()];
  const uiTab = tab === 'eco' || tab === 'tracks' ? 'trips' : tab;
  const tabs = TABS.map(([id, l]) => `<button data-act="tab:${id}" style="height:42px;padding:0 16px;border-radius:${Math.max(6, p.r - 10)}px;font-size:15px;font-weight:600;${uiTab === id ? `background:${p.acc};color:${p.onAcc}` : `color:${p.onmut}`}">${l}</button>`).join('');
  const subL = uiTab === 'trips' ? tripSubs.map(([k, l]) => ['tsub:' + k, l, tripSub === k && tab !== 'tracks']).concat([['tab:tracks', 'Parcours', tab === 'tracks']]) : uiTab === 'service' ? [['ssub:plan', 'Plan constructeur', svcSub === 'plan'], ['ssub:pleins', 'Pleins', svcSub === 'pleins'], ['ssub:bilan', 'Bilan', svcSub === 'bilan'], ['ssub:log', 'Mon carnet', svcSub === 'log']] : null;
  const sub = subL ? `<div style="display:flex;gap:2px;background:${p.card2};border-radius:${Math.max(8, p.r - 8)}px;padding:2px">${subL.map(([a, l, on]) => `<button data-act="${a}" style="height:38px;padding:0 ${subL.length > 3 ? 9 : 12}px;border-radius:${Math.max(6, p.r - 10)}px;font-size:13.5px;font-weight:600;${on ? `background:${p.txt};color:${p.card}` : `color:${p.mut}`}">${l}</button>`).join('')}</div>` : '';
  const c = clk(), cs = CLK_SIZE[c.size] || CLK_SIZE.m;
  const ff = c.font ? `font-family:'${c.font}',Inter,sans-serif;` : '';
  const net = store.get('showNet', true) ? `<div data-k2="sys" style="display:flex;align-items:center;gap:2px;height:40px;padding:0 4px;border-radius:12px;background:${p.card2}">${sysHtml(p)}</div>` : '';
  return `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;color:${p.ontxt};height:44px">
  <div style="display:flex;align-items:center;gap:10px;min-width:0;${sub ? 'flex:none;' : ''}"><button data-act="profNext" aria-label="Changer de profil" data-k="avatar" style="width:40px;height:40px;flex:none;border-radius:50%;background:${p.acc};color:${p.onAcc};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:17px">${esc(name.charAt(0).toUpperCase())}</button>
  <div data-k="hello" style="font-size:20px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:230px;min-width:0;${sub ? 'display:none;' : ''}">Bonjour</div></div>
  <div style="display:flex;gap:8px;align-items:center"><div style="display:flex;gap:4px;background:${p.card2};border-radius:${Math.max(8, p.r - 8)}px;padding:2px">${tabs}</div>${sub}</div>
  <div style="display:flex;align-items:center;gap:10px">${net}
  <button data-act="set:clock" style="text-align:right;line-height:1.05;color:${c.color || p.ontxt};${ff}"><div data-k="clk2" style="font-size:${cs[0]}px;font-weight:600;white-space:nowrap">--:--</div><div data-k="date2" style="font-size:${cs[1]}px;font-weight:600;opacity:.75;white-space:nowrap"></div></button>
  <button data-act="gear" aria-label="Paramètres" style="width:42px;height:42px;border-radius:12px;background:${p.card2};color:${p.txt};display:flex;align-items:center;justify-content:center">${ic('gear', 22)}</button></div></div>`;
};
// ----- icônes 4G / Bluetooth / Wi-Fi -----
let sys = null;
function readSys() { try { if (A && A.sysStatus) sys = JSON.parse(A.sysStatus()); else if (DEMO) sys = { wifi: 0, bt: 1, data: 1, air: 0, net: 'mobile', sub: 'LTE', wsig: -1, sig: 3 }; } catch (e) { sys = null; } }
const genOf = (sub) => { sub = (sub || '').toUpperCase(); return /NR|5G/.test(sub) ? '5G' : /LTE|4G|IWLAN/.test(sub) ? '4G' : /HSPA|UMTS|HSDPA|HSUPA|3G|WCDMA|EVDO/.test(sub) ? '3G' : /EDGE|GPRS|GSM|1XRTT|CDMA/.test(sub) ? '2G' : ''; };
function sysHtml(p) {
  const s = sys || {}, on = p.ontxt || p.txt, off = p.mut, dim = 'opacity:.38';
  const mob = s.net === 'mobile', dataOn = s.data !== 0 && s.air !== 1;
  const lvl = s.sig >= 0 ? Math.min(4, s.sig) : (mob && netOk ? 3 : 0);
  const gen = genOf(mob ? s.sub : '') || (dataOn ? '4G' : '');
  const bad = netOk === false;
  const col = bad ? '#FF8A3D' : on;
  const bars = [0, 1, 2, 3].map((i) => `<rect x="${2 + i * 5}" y="${16 - i * 4}" width="3.4" height="${4 + i * 4}" rx="1" fill="${i < lvl ? col : off}" ${i < lvl ? '' : 'opacity=".35"'}/>`).join('');
  const b4 = `<button data-act="sys:mobile" aria-label="Données mobiles" style="height:36px;padding:0 6px;display:flex;align-items:flex-end;gap:2px;color:${col};${dataOn ? '' : dim}"><span style="font-size:10.5px;font-weight:800;line-height:1;margin-bottom:12px">${gen || '4G'}</span><svg viewBox="0 0 22 21" width="22" height="20" aria-hidden="true">${bars}</svg></button>`;
  const btOn = s.bt === 1 || (s.bt == null && false);
  const bt = `<button data-act="sys:bt" aria-label="Bluetooth" style="height:36px;width:32px;display:flex;align-items:center;justify-content:center;${btOn ? '' : dim}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="${btOn ? on : off}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7l10 10-5 4V3l5 4L7 17"/></svg></button>`;
  const wOn = s.wifi === 1 || s.wifi === 2, wl = s.net === 'wifi' ? (s.wsig >= 0 ? Math.max(1, Math.min(4, s.wsig)) : 3) : 0;
  const arc = (r, i) => `<path d="M${12 - r} ${18 - r * 0.62}a${r} ${r} 0 0 1 ${r * 2} 0" stroke="${wOn && (wl > i || !wl) ? on : off}" ${wOn && wl > i ? '' : wOn && !wl ? 'opacity=".55"' : 'opacity=".5"'}/>`;
  const wf = `<button data-act="sys:wifi" aria-label="Wi-Fi" style="height:36px;width:34px;display:flex;align-items:center;justify-content:center;${wOn ? '' : dim}"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke-width="2.3" stroke-linecap="round" aria-hidden="true">${arc(9, 2)}${arc(6, 1)}${arc(3, 0)}<circle cx="12" cy="19.2" r="1.5" fill="${wOn && wl ? on : off}" stroke="none"/></svg></button>`;
  return b4 + bt + wf;
}
function sysOpen(k) {
  const act = { mobile: ['android.settings.DATA_ROAMING_SETTINGS', 'android.settings.WIRELESS_SETTINGS'], bt: ['android.settings.BLUETOOTH_SETTINGS'], wifi: ['android.settings.WIFI_SETTINGS'] }[k] || [];
  if (!A) { toast('Ouvrirait les réglages ' + ({ mobile: 'données mobiles', bt: 'Bluetooth', wifi: 'Wi-Fi' }[k])); return; }
  if (A.openAction) { for (const a of act) if (A.openAction(a)) return; }
  A.openSettings('');
}
function netHtml(p) {
  if (netOk === false) return `${ic('off', 18, '#FF6B6B')}<span style="color:#FF6B6B">Hors ligne</span>`;
  if (netOk == null) return `${ic('wifi', 18, p.mut)}<span style="color:${p.mut}">Internet…</span>`;
  return `${ic('wifi', 18, '#3FB950')}<span style="color:#3FB950">Internet OK</span>`;
}

// ---------- appli GPS au choix ----------
function navName() { const pk = store.get('dock_gps', ''); if (!pk) return 'Waze'; const a = allApps().find((x) => x.p === pk); return a ? a.l : pk.split('.').pop(); }

// ---------- nombre de raccourcis ----------
const DOCK_ALL = DOCK.slice();
const _dockC = window.dockC;
window.dockC = function (p, vertical) {
  const n = Math.max(3, Math.min(DOCK_ALL.length, store.get('dockN', DOCK_ALL.length)));
  const keep = DOCK_ALL.filter((d) => !d.special).slice(0, n - 1).concat(DOCK_ALL.filter((d) => d.special));
  DOCK.length = 0; keep.forEach((d) => DOCK.push(d));
  try { return _dockC(p, vertical); } finally { DOCK.length = 0; DOCK_ALL.forEach((d) => DOCK.push(d)); }
};

// ---------- fonds d'écran (générés + photos) ----------
const WPAL = [['#E0312B', '#0B0C0F'], ['#1F6FD1', '#05080f'], ['#3FB950', '#06100a'], ['#F2A33A', '#120a03'], ['#9B5DE5', '#0a0612'], ['#00BCD4', '#03100f'], ['#FF4081', '#12030a'], ['#C9A227', '#0d0b04'], ['#64748B', '#0b0d10'], ['#EF6C00', '#100703']];
// v7.7 : 10 couleurs de plus → 200 fonds de toutes les couleurs
WPAL.push(['#FFD60A', '#0f0d02'], ['#2EC4B6', '#021010'], ['#E91E63', '#140209'], ['#7CB342', '#070d03'], ['#3949AB', '#04061a'], ['#FF8A65', '#140806'], ['#8D6E63', '#0e0907'], ['#00E676', '#02100a'], ['#B0BEC5', '#0c0f12'], ['#D500F9', '#0e0214']);
const WKINDS = [['space', 'Espace'], ['space2', 'Espace'], ['grad', 'Dégradés'], ['grad2', 'Dégradés'], ['halo', 'Dégradés'], ['mesh', 'Abstraits'], ['mesh2', 'Abstraits'], ['mount', 'Paysages de nuit'], ['aur', 'Aurores'], ['carbon', 'Carbone']];
const WALLS = []; WPAL.forEach((_, i) => WKINDS.forEach(([k, cat], j) => WALLS.push({ id: 'g' + (i * 10 + j), pi: i, k, cat })));
function seeded(seed) { let s = seed * 9301 + 49297; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
function drawWall(w, W, H) {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const [a, b] = WPAL[w.pi], a2 = WPAL[(w.pi + 3) % WPAL.length][0], a3 = WPAL[(w.pi + 5) % WPAL.length][0];
  const R = seeded(w.pi * 31 + w.k.length * 7 + 3), rnd = (x, y) => x + R() * (y - x), sc = W / 640;
  const glow = (x, y, r, col, al) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col + al); gr.addColorStop(1, col + '00'); g.fillStyle = gr; g.fillRect(0, 0, W, H); };
  const stars = (n, hmax) => { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(255,255,255,${rnd(0.2, 1)})`; const s = (R() < 0.05 ? 1.8 : 1) * sc; g.fillRect(rnd(0, W), rnd(0, H * hmax), s, s); } };
  if (w.k === 'space' || w.k === 'space2') {
    const col = w.k === 'space' ? a : a2; g.fillStyle = '#03040a'; g.fillRect(0, 0, W, H);
    for (let k = 0; k < 3; k++) glow(rnd(0, W), rnd(0, H), rnd(120, 260) * sc, col, '66'); stars(420, 1);
    if (w.k === 'space') { const x = rnd(W * 0.6, W * 0.9), y = rnd(H * 0.2, H * 0.5), r = rnd(30, 60) * sc; const gp = g.createRadialGradient(x - r / 3, y - r / 3, 2, x, y, r); gp.addColorStop(0, '#e8e8f0'); gp.addColorStop(1, col); g.fillStyle = gp; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  } else if (w.k === 'grad' || w.k === 'grad2') {
    const gr = w.k === 'grad' ? g.createLinearGradient(0, 0, W, H) : g.createLinearGradient(W, 0, 0, H); gr.addColorStop(0, w.k === 'grad' ? a : b); gr.addColorStop(1, w.k === 'grad' ? b : a); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  } else if (w.k === 'halo') {
    g.fillStyle = b; g.fillRect(0, 0, W, H); const gr = g.createRadialGradient(W * 0.8, 0, 0, W * 0.8, 0, W * 0.9); gr.addColorStop(0, a + 'aa'); gr.addColorStop(1, b + '00'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  } else if (w.k === 'mesh' || w.k === 'mesh2') {
    const col = w.k === 'mesh' ? a : a3; g.fillStyle = b; g.fillRect(0, 0, W, H);
    for (let k = 0; k < 4; k++) glow(rnd(0, W), rnd(0, H), rnd(150, 330) * sc, k % 2 ? col : '#ffffff', k % 2 ? '88' : '14');
  } else if (w.k === 'mount') {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#05070f'); gr.addColorStop(1, a); g.fillStyle = gr; g.fillRect(0, 0, W, H); stars(120, 0.5);
    for (let L = 0; L < 4; L++) { g.fillStyle = `rgba(0,0,0,${0.25 + L * 0.18})`; g.beginPath(); g.moveTo(0, H); let y = H * (0.45 + L * 0.12); g.lineTo(0, y); for (let x = 0; x <= W; x += 20 * sc) { y += rnd(-14, 14) * sc; y = Math.max(H * 0.3, Math.min(H * 0.95, y)); g.lineTo(x, y); } g.lineTo(W, H); g.fill(); }
  } else if (w.k === 'aur') {
    g.fillStyle = '#04060c'; g.fillRect(0, 0, W, H);
    for (let k = 0; k < 5; k++) { const y0 = rnd(H * 0.15, H * 0.5); for (let x = 0; x < W; x += 6 * sc) { const y = y0 + Math.sin(x / (90 * sc) + k) * 40 * sc; const gr = g.createLinearGradient(0, y - 60 * sc, 0, y + 30 * sc); gr.addColorStop(0, a + '00'); gr.addColorStop(0.7, a + '30'); gr.addColorStop(1, a + '00'); g.fillStyle = gr; g.fillRect(x, y - 60 * sc, 6 * sc, 90 * sc); } }
    stars(200, 1);
  } else {
    const t = 6 * sc; for (let y = 0; y < H; y += t) for (let x = 0; x < W; x += t) { g.fillStyle = (Math.round((x + y) / t)) % 2 ? '#141519' : '#0c0d10'; g.fillRect(x, y, t, t); }
    const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, a + '00'); gr.addColorStop(1, a + '40'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  }
  return c.toDataURL('image/jpeg', 0.85);
}
const wallCache = {};
function wallUrl(id) {
  if (!id) return '';
  if (id === 'photo') return store.get('wallPhoto', '');
  const w = WALLS.find((x) => x.id === id); if (!w) return '';
  if (!wallCache[id]) wallCache[id] = drawWall(w, 1280, 720);
  return wallCache[id];
}
const _palette = window.palette;
window.palette = function () {
  const p = _palette(); const id = pv('wall', '');
  const url = wallUrl(id);
  if (url) {
    const dim = pv('wallDim', 30) / 100;
    p.bgCss = `linear-gradient(rgba(0,0,0,${dim}),rgba(0,0,0,${dim})), url(${url}) center/cover no-repeat`;
    p.streaks = false; p.ontxt = '#F2F2F4'; p.onmut = '#C9CAD0';
  }
  return p;
};
function importWallPhoto(file) {
  const r = new FileReader();
  r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 1280 / im.width, 720 / im.height * 1.6); const cv = document.createElement('canvas'); cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); const url = cv.toDataURL('image/jpeg', 0.82); try { store.set('wallPhoto', url); setPv('wall', 'photo'); toast('Photo mise en fond d\'écran'); } catch (e) { toast('Photo trop grande'); } render(); }; im.src = r.result; };
  r.readAsDataURL(file);
}

// ---------- tuile voiture : route animée ----------
function roadKind() {
  if (DEMO && demoWx) return demoWx;
  if (!weather) return { wx: 'nuages', night: isNight() };
  const i = wmo(weather.c).i;
  const wx = i === 'sun' ? 'soleil' : i === 'cloudsun' || i === 'cloud' ? 'nuages' : i === 'fog' ? 'brouillard' : i === 'snow' ? 'neige' : i === 'storm' ? 'orage' : i === 'rain' ? 'pluie' : 'nuages';
  return { wx, night: weather.day === 0 };
}
let demoWx = null;
const roadBox = (fit, w) => `<div data-roadbox style="position:relative;${fit ? 'width:100%;height:100%' : `width:${w || '100%'};aspect-ratio:16/8;margin:0 auto`};border-radius:14px;overflow:hidden;min-height:120px;background:#24418f"><canvas data-road="v" style="position:absolute;inset:0;width:100%;height:100%"></canvas><div data-car360 role="img" aria-label="La 2008 sur la route, glisse pour la faire tourner" style="position:absolute;left:50%;bottom:4%;height:60%;aspect-ratio:503/300;transform:translateX(-50%);background:url(car/route-360.webp) ${car360Pos()} 0/2400% 100% no-repeat;touch-action:none;filter:drop-shadow(0 6px 6px #0008)"></div></div>`;
const _carSvg = window.carSvg;
window.carSvg = function (p, w = '100%', fit = false) { return store.get('carView', 'road') === 'road' && !carSvgRaw ? roadBox(fit, w) : _carSvg(p, w, fit); };
let carSvgRaw = false;
// accueil par défaut : la météo est dans la tuile voiture, la musique prend toute la hauteur
DEFAULT_GRID.items = DEFAULT_GRID.items.filter((it) => it.b[0] !== 'weather'); DEFAULT_GRID.items.forEach((it) => { if (it.b[0] === 'music') { it.y = 0; it.h = 4; } });
const _carfullR = GBLOCKS.carfull.r;
GBLOCKS.carfull.n = 'Vitesse + voiture sur la route';
GBLOCKS.carfull.r = (p, w, h) => {
  if (store.get('carView', 'road') !== 'road') return _carfullR(p, w, h);
  if (store.get('roadStyle', 'video') === 'video') return roadVideoTile(p, w, h);
  const big = h >= 2;
  return `<div style="${fullCard(p, 'gap:6px;padding:12px 14px')}">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
      <div style="min-width:0">${carTitle(p)}<div style="display:flex;align-items:center;gap:10px;margin-top:2px"><span data-k="speed" style="font-size:${big ? 48 : 36}px;font-weight:700;line-height:1">--</span><span style="font-size:13px;color:${p.mut}">km/h</span>${limitSign(big ? 44 : 34)}</div></div>
      <button data-act="wxDetail" style="text-align:right;padding:6px 8px;border-radius:12px;background:${p.light ? '#0000000a' : '#ffffff0a'};color:${p.txt}"><div style="display:flex;align-items:center;gap:6px;justify-content:flex-end"><span data-k="wIcon" data-size="30"></span><span data-k="wTemp" style="font-size:28px;font-weight:700">--°</span></div><div style="font-size:12px;color:${p.wacc}"><span data-k="wCity">Météo</span> · <span data-k="wDesc">…</span></div>${big ? '<div data-k="wDays" style="font-size:11.5px;color:' + p.mut + ';margin-top:2px"></div>' : ''}</button>
    </div>
    <div style="flex:1;min-height:0;position:relative;border-radius:${Math.max(8, p.r - 8)}px;overflow:hidden">
      <canvas data-road style="position:absolute;inset:0;width:100%;height:100%"></canvas>
      <div data-car360 role="img" aria-label="La 2008 sur la route, glisse pour la faire tourner" style="position:absolute;left:50%;bottom:-2%;height:74%;aspect-ratio:503/300;transform:translateX(-50%);background:url(car/route-360.webp) ${car360Pos()} 0/2400% 100% no-repeat;touch-action:none"></div>
    </div></div>`;
};

// ----- style « autoradio » (comme le lanceur d'origine) -----
function roadVideoTile(p, w, h) {
  const big = h >= 2;
  return `<div data-roadbox style="position:relative;width:100%;height:100%;border-radius:${p.r}px;overflow:hidden;background:#24418f;color:#fff;min-height:0">
    <canvas data-road="v" style="position:absolute;inset:0;width:100%;height:100%"></canvas>
    <div style="position:absolute;left:5%;top:${big ? 6 : 4}%;line-height:1;text-shadow:0 2px 6px #0b1d5580;pointer-events:none">
      <div style="display:flex;align-items:center;gap:${big ? 12 : 8}px"><div data-k="speed" data-overcol="1" style="font-size:${big ? 64 : 44}px;font-weight:500;letter-spacing:-1px">--</div><span style="pointer-events:auto">${limitSign(big ? 54 : 40)}</span></div>
      <div style="font-size:${big ? 19 : 15}px;font-weight:500;margin-top:2px;padding-left:4px">KM/h</div></div>
    <div data-act="wxDetail" style="position:absolute;right:4%;top:${big ? 6 : 4}%;text-align:left;text-shadow:0 2px 6px #0b1d5580;min-width:40%">
      <div style="display:flex;align-items:center;gap:6px;font-size:${big ? 17 : 14}px;font-weight:600"><svg viewBox="0 0 24 24" width="${big ? 18 : 14}" height="${big ? 18 : 14}" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#2f8dff"/><path d="M7 12.5 17 7l-4.5 10-1.5-4z" fill="#fff"/></svg><span data-k="wCity" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px">—</span></div>
      <div style="display:flex;align-items:center;gap:8px"><span data-k="wTemp" style="font-size:${big ? 46 : 32}px;font-weight:500;line-height:1.05">--°</span><span data-k="wIcon" data-size="${big ? 46 : 32}" style="filter:drop-shadow(0 2px 4px #0005)"></span></div>
      <div data-k="wMinMax" style="font-size:${big ? 15 : 12}px;font-weight:500;padding-left:${big ? 22 : 16}px">—</div></div>
    <div data-car360 role="img" aria-label="La 2008 sur la route, glisse pour la faire tourner" style="position:absolute;left:50%;bottom:${big ? 9 : 11}%;height:${big ? 40 : 44}%;aspect-ratio:503/300;transform:translateX(-50%);background:url(car/route-360.webp) ${car360Pos()} 0/2400% 100% no-repeat;touch-action:none;filter:drop-shadow(0 6px 6px #0008)"></div>
    <div style="position:absolute;left:50%;bottom:2.5%;transform:translateX(-50%);max-width:92%;display:flex;align-items:center;gap:6px;padding:4px 12px;border-radius:14px;background:#0b1d55b3;font-size:${big ? 14 : 12}px;font-weight:600;white-space:nowrap;overflow:hidden;pointer-events:none">${ic('pin', 13, '#7fd0ff', 2.4)}<span data-k="roadAddr" style="overflow:hidden;text-overflow:ellipsis">Recherche de l'adresse…</span></div>
  </div>`;
}
// voiture qui tourne au doigt (24 vues, une tous les 15°), puis revient seule de dos
let carYaw = 0, carDrag = null, carRelease = 0;
const car360Pos = () => { const i = ((Math.round((carYaw + 180) / 15) % 24) + 24) % 24; return (i / 23 * 100).toFixed(3) + '%'; };
function setupCar360() {
  const st = $('stage');
  st.addEventListener('pointerdown', (e) => {
    const rb = e.target.closest('[data-roadbox], [data-car360]') || (e.target.closest('canvas[data-road]') && e.target);
    if (!rb) return;
    carDrag = { x: e.clientX, yaw: carYaw };
    if (swipe) swipe.ok = false;
  }, true);
  st.addEventListener('pointermove', (e) => { if (!carDrag) return; const s0 = window.innerWidth / 1280; carYaw = carDrag.yaw - (e.clientX - carDrag.x) / s0 * 0.9; paintCar360(); }, true);
  const end = () => { if (carDrag) { carDrag = null; carRelease = performance.now(); } };
  st.addEventListener('pointerup', end, true); st.addEventListener('pointercancel', end, true);
}
function paintCar360() { const pos = car360Pos() + ' 0'; document.querySelectorAll('#screen [data-car360]').forEach((e) => { if (e.style.backgroundPosition !== pos) e.style.backgroundPosition = pos; }); }
(function roadLoop() {
  let T = 0, travel = 0, last = performance.now(), v = 0, lastDraw = 0;
  const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const bld = Array.from({ length: 46 }, (_, i) => ({ x: i / 46, w: 0.018 + rnd(i) * 0.03, h: 0.25 + rnd(i + 9) * 0.75 }));
  const trees = Array.from({ length: 30 }, (_, i) => ({ x: i / 30 + rnd(i + 4) * 0.02, h: 0.35 + rnd(i + 2) * 0.5 }));
  const drops = Array.from({ length: 160 }, (_, i) => ({ x: rnd(i + 3), y: rnd(i + 7), s: 0.6 + rnd(i + 11) * 0.8 }));
  function frame(now) {
    requestAnimationFrame(frame);
    const cvs = document.querySelectorAll('#screen canvas[data-road]');
    if (!cvs.length) { last = now; return; }
    if (now - lastDraw < 33) return; // ~30 images / s, assez pour l'autoradio
    lastDraw = now;
    const dt = Math.min(0.1, (now - last) / 1000); last = now; T += dt;
    const sp = curSpeed(); const tgt = sp ? sp.v : 0; v += (tgt - v) * Math.min(1, dt * 2);
    travel += v / 3.6 * dt;

    if (!carDrag && carYaw !== 0 && now - carRelease > 2500) { carYaw = Math.abs(carYaw) < 4 ? 0 : carYaw - Math.sign(carYaw) * Math.min(Math.abs(carYaw), 240 * dt); carYaw = ((carYaw + 540) % 360) - 180; paintCar360(); }
    const wxNow = roadKind().wx; cvs.forEach((cv) => { const rb = cv.parentNode; if (rb && rb.dataset && rb.dataset.wx !== wxNow) rb.dataset.wx = wxNow; const paint=()=>cv.dataset.road === 'v' ? drawV(cv) : draw(cv); return window.RoadFX718 ? window.RoadFX718.draw(cv,paint) : paint(); });
  }
  function draw(cv) {
    const dpr = Math.min(1.5, window.devicePixelRatio || 1), W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const { wx, night: n } = roadKind(), hz = H * 0.36, cx = W / 2;
    const ville = v < 70;
    const SKY = n ? ['#03060f', '#14203a'] : { soleil: ['#2f74d0', '#a8d2f5'], nuages: ['#5b7593', '#a9bccf'], pluie: ['#38424f', '#6f7b8b'], orage: ['#262c36', '#4d5664'], neige: ['#7f8b9a', '#cfd7e0'], brouillard: ['#8d949c', '#c2c7cc'] }[wx];
    let g = c.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, SKY[0]); g.addColorStop(1, SKY[1]); c.fillStyle = g; c.fillRect(0, 0, W, hz + 1);
    if (n && wx !== 'brouillard') { c.fillStyle = '#fff'; for (let i = 0; i < 40; i++) { c.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(T * 1.3 + i)); c.fillRect(rnd(i) * W, rnd(i + 50) * hz * 0.8, 1.4, 1.4); } c.globalAlpha = 1; }
    if (wx === 'soleil' || (n && wx === 'nuages')) { const sx = W * 0.8, sy = hz * 0.35; const sg = c.createRadialGradient(sx, sy, 2, sx, sy, n ? 26 : 60); sg.addColorStop(0, n ? '#f4f1e1' : '#fffbe0'); sg.addColorStop(0.25, n ? '#f4f1e1aa' : '#ffe9a0aa'); sg.addColorStop(1, '#ffffff00'); c.fillStyle = sg; c.fillRect(sx - 60, sy - 60, 120, 120); }
    if (wx === 'nuages' || wx === 'pluie' || wx === 'orage') { c.fillStyle = n ? '#ffffff10' : '#ffffff40'; for (let i = 0; i < 6; i++) { const x = ((rnd(i + 20) + T * 0.004 * (1 + i % 3)) % 1.3 - 0.15) * W, y = hz * (0.15 + rnd(i + 30) * 0.4); c.beginPath(); c.ellipse(x, y, W * 0.12, hz * 0.07, 0, 0, 7); c.fill(); } }
    const par = (travel * 0.02) % 1, far = n ? '#0b1222' : { soleil: '#5d7fa8', nuages: '#5f7186', pluie: '#46505e', orage: '#363d48', neige: '#8a96a5', brouillard: '#a3a9b0' }[wx];
    if (ville) {
      for (const b of bld) {
        const x = ((b.x - par + 1) % 1) * W * 1.1 - W * 0.05, bw = b.w * W, bh = b.h * hz * 0.55;
        c.fillStyle = far; c.fillRect(x, hz - bh, bw, bh);
        if (n) { c.fillStyle = '#ffd77a'; for (let yy = hz - bh + 4; yy < hz - 4; yy += 6) for (let xx = x + 2; xx < x + bw - 2; xx += 5) if (rnd(Math.round(xx - x) * 3 + yy + b.x * 999) > 0.62) c.fillRect(xx, yy, 2, 2.4); }
      }
    } else {
      c.fillStyle = far; c.beginPath(); c.moveTo(0, hz); for (let x = 0; x <= W; x += 10) c.lineTo(x, hz - hz * 0.18 * (0.5 + 0.5 * Math.sin((x / W + par) * 9))); c.lineTo(W, hz); c.fill();
      for (const t of trees) { const x = ((t.x - par * 1.6 + 2) % 1) * W * 1.1 - W * 0.05, th = t.h * hz * 0.32; c.fillStyle = n ? '#0a1410' : wx === 'neige' ? '#6f8a7a' : '#2f5a3a'; c.beginPath(); c.moveTo(x, hz - th); c.lineTo(x - th * 0.32, hz); c.lineTo(x + th * 0.32, hz); c.fill(); }
    }
    c.fillStyle = n ? '#070b12' : wx === 'neige' ? '#e3e9f0' : { soleil: '#3f5e3a', nuages: '#3a4f3a', pluie: '#2b3530', orage: '#242c28', brouillard: '#5b625d' }[wx];
    c.fillRect(0, hz, W, H - hz);
    const hw = (y) => W * 0.03 + (W * 0.7 - W * 0.03) * ((y - hz) / (H - hz));
    c.beginPath(); c.moveTo(cx - hw(hz), hz); c.lineTo(cx + hw(hz), hz); c.lineTo(cx + hw(H), H); c.lineTo(cx - hw(H), H); c.closePath();
    g = c.createLinearGradient(0, hz, 0, H); g.addColorStop(0, n ? '#151a24' : wx === 'neige' ? '#b5bdc7' : '#3a3f48'); g.addColorStop(1, n ? '#0d1018' : wx === 'neige' ? '#8f99a5' : (wx === 'pluie' || wx === 'orage') ? '#20252c' : '#262a31'); c.fillStyle = g; c.fill();
    if (n) { g = c.createRadialGradient(cx, H, 10, cx, H, H * 0.75); g.addColorStop(0, '#fff6d855'); g.addColorStop(1, '#fff6d800'); c.fillStyle = g; c.fill(); }
    c.save(); c.strokeStyle = '#7cc8ff'; c.lineWidth = 3; c.shadowColor = '#4aa8ff'; c.shadowBlur = n ? 14 : 6;
    for (const sgn of [-1, 1]) { c.beginPath(); c.moveTo(cx + sgn * hw(hz) * 0.94, hz); c.lineTo(cx + sgn * hw(H) * 0.94, H); c.stroke(); }
    c.restore();
    const yOf = (z) => hz + (H - hz) / z;
    c.fillStyle = wx === 'neige' ? '#ffffffaa' : '#ffffffdd';
    const off = (travel * 0.12) % 1;
    for (let z = 1 - off; z < 60; z += 1) {
      const z0 = Math.max(1, z), z1 = z + 0.45; if (z1 <= 1) continue;
      const y0 = yOf(z0), y1 = yOf(z1);
      for (const lane of [-0.5, 0.5]) { const w0 = Math.max(0.5, hw(y0) * 0.02), w1 = Math.max(0.4, hw(y1) * 0.02); c.beginPath(); c.moveTo(cx + lane * hw(y0) - w0, y0); c.lineTo(cx + lane * hw(y0) + w0, y0); c.lineTo(cx + lane * hw(y1) + w1, y1); c.lineTo(cx + lane * hw(y1) - w1, y1); c.fill(); }
    }
    if (wx === 'pluie' || wx === 'orage') { c.fillStyle = '#9fc7ff14'; for (let z = 1.2 - (travel * 0.12) % 0.7; z < 30; z += 0.7) { const y = yOf(z); c.fillRect(cx - hw(y) * 0.8, y, hw(y) * 1.6, Math.max(1, 5 / z)); } }
    if (wx === 'pluie' || wx === 'orage') { c.strokeStyle = n ? '#9fb7d8aa' : '#e6f0ffaa'; c.lineWidth = 1.2; c.beginPath(); for (const d of drops) { const x = ((d.x + T * 0.05 * d.s) % 1) * W, y = ((d.y + T * 1.6 * d.s) % 1) * H; c.moveTo(x, y); c.lineTo(x - 3, y + 14 * d.s); } c.stroke(); }
    if (wx === 'orage' && (T % 7) < 0.12) { c.fillStyle = '#ffffff55'; c.fillRect(0, 0, W, H); }
    if (wx === 'neige') { c.fillStyle = '#fff'; for (const d of drops) { const x = (((d.x + Math.sin(T * 0.8 + d.y * 9) * 0.02 + T * 0.01) % 1) + 1) % 1 * W, y = ((d.y + T * 0.18 * d.s) % 1) * H; c.beginPath(); c.arc(x, y, 1.2 + d.s * 1.4, 0, 6.3); c.fill(); } }
    if (wx === 'brouillard') { g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#d5d9dd00'); g.addColorStop(0.3, '#d5d9ddee'); g.addColorStop(0.55, '#d5d9dd99'); g.addColorStop(1, '#d5d9dd22'); c.fillStyle = n ? '#4a5260aa' : g; c.fillRect(0, 0, W, H); }
  }

  const sky = Array.from({ length: 34 }, (_, i) => ({ x: i / 34 + rnd(i + 70) * 0.01, w: 0.02 + rnd(i + 71) * 0.035, h: 0.25 + rnd(i + 72) * 0.75, roof: rnd(i + 73) }));
  const flakes = Array.from({ length: 90 }, (_, i) => ({ x: rnd(i + 90), y: rnd(i + 91), s: 0.5 + rnd(i + 92) }));

  // ---- v7.4 : nom de la ville / du village le plus proche (fourni par v47.js, sinon rien) ----
  let curWx = '';
  // v7.11 : les panneaux sont désormais un seul élément DOM fixe sur le côté.
  // Aucun panneau n'est dessiné dans le flux du décor animé.

  // pluie bien visible : nuages sombres, ciel assombri, pluie en biais, éclaboussures sur la route
  const rainD = Array.from({ length: 140 }, (_, i) => ({ x: rnd(i + 900), y: rnd(i + 901), s: 0.6 + rnd(i + 902) * 0.8 }));
  function rainExtra(c, W, H, hz, n, heavy) {
    c.fillStyle = n ? '#05081888' : '#0b183844'; c.fillRect(0, 0, W, H);
    c.fillStyle = n ? '#232c4acc' : '#4b5a82cc';
    for (let i = 0; i < 9; i++) { const x = ((rnd(i + 950) * W + T * (6 + i)) % (W + 260)) - 130; c.beginPath(); c.ellipse(x, H * (0.03 + rnd(i + 951) * 0.12), W * (0.10 + rnd(i + 952) * 0.08), H * 0.08, 0, 0, 7); c.fill(); }
    c.strokeStyle = n ? '#aac4ffaa' : '#e6f0ffcc'; c.lineWidth = 1.3; c.beginPath();
    const nb = heavy ? 140 : 100;
    for (let k = 0; k < nb; k++) { const d = rainD[k], x = ((d.x + T * 0.12 * d.s) % 1) * W, y = ((d.y + T * 1.9 * d.s) % 1) * H, L = 9 + 9 * d.s; c.moveTo(x, y); c.lineTo(x - L * 0.3, y + L); }
    c.stroke();
    c.strokeStyle = '#dfeaffaa'; c.lineWidth = 1;
    for (let i = 0; i < 22; i++) { const ph = (T * 2.2 + rnd(i + 960)) % 1, x = W * (0.2 + rnd(i + 961) * 0.6), y = hz + (H - hz) * (0.25 + rnd(i + 962) * 0.75), r = 2 + ph * 7 * (y - hz) / (H - hz);
      c.globalAlpha = 1 - ph; c.beginPath(); c.ellipse(x, y, r, r * 0.35, 0, 0, 7); c.stroke(); }
    c.globalAlpha = 1;
  }
  // autoroute : 2 voies dans notre sens, voiture sur la voie de droite, bande d'arrêt d'urgence,
  // séparateur central en béton, puis l'autre sens à gauche.
  function drawMotorway(c, W, H, hz, cx, n, wx, box) {
    const tt = (y) => (y - hz) / (H - hz), Lw = (y) => W * 0.012 + (W * 0.40 - W * 0.012) * tt(y);
    const X = (y, k) => cx + k * Lw(y), yOf = (z) => hz + (H - hz) / z;
    const band = (k0, k1, fill) => { c.beginPath(); c.moveTo(X(hz, k0), hz); c.lineTo(X(hz, k1), hz); c.lineTo(X(H, k1), H); c.lineTo(X(H, k0), H); c.closePath(); c.fillStyle = fill; c.fill(); };
    let g = c.createLinearGradient(0, hz, 0, H); g.addColorStop(0, n ? '#14234f' : '#2a4896'); g.addColorStop(1, n ? '#0a1436' : '#1a2f70');
    const g2 = c.createLinearGradient(0, hz, 0, H); g2.addColorStop(0, n ? '#101c40' : '#253f86'); g2.addColorStop(1, n ? '#08102c' : '#172a63');
    band(-4.3, -2.0, g2);                         // l'autre sens
    band(-2.0, -1.55, n ? '#1b2a52' : '#3a5aa6');  // terre-plein central
    band(-1.55, 1.05, g);                          // nos 2 voies + bande d'arrêt d'urgence
    if (wx === 'neige') { band(-4.3, 1.05, '#ffffff1c'); band(1.05, 1.9, '#eef4ffcc'); band(-2.0, -1.55, '#eef4ffaa'); band(-6, -4.3, '#eef4ff99'); }
    if (wx === 'pluie' || wx === 'orage') { band(-4.3, 1.05, '#0a163a33');
      c.save(); c.globalAlpha = 0.28; c.filter = 'blur(3px)'; c.strokeStyle = '#7fe8ff'; c.lineWidth = 7;
      for (const k of [-1.53, 1.03]) { c.beginPath(); c.moveTo(X(hz, k) + 2, hz + 4); c.lineTo(X(H, k) + 6, H); c.stroke(); }
      c.restore(); }
    // lumière blanche sur le bas-côté droit (comme le décor d'origine)
    g = c.createLinearGradient(X(H, 0.8), 0, X(H, 1.45), 0); g.addColorStop(0, '#ffffff00'); g.addColorStop(1, n ? '#9cc4ff40' : '#ffffffa0');
    c.fillStyle = g; c.beginPath(); c.moveTo(X(hz, 0.8), hz); c.lineTo(X(hz, 1.45), hz); c.lineTo(X(H, 1.45), H); c.lineTo(X(H, 0.8), H); c.fill();
    // lignes continues : bord gauche (près du séparateur) et bord droit (avant la bande d'arrêt d'urgence)
    const line = (k, w, col) => { c.beginPath(); const a = Math.max(0.3, w * Lw(hz)), b = w * Lw(H); c.moveTo(X(hz, k) - a, hz); c.lineTo(X(hz, k) + a, hz); c.lineTo(X(H, k) + b, H); c.lineTo(X(H, k) - b, H); c.closePath(); c.fillStyle = col; c.fill(); };
    line(-1.47, 0.03, '#ffffff'); line(0.5, 0.03, '#ffffff');
    // bandes cyan lumineuses sur les bords extérieurs (style du décor)
    c.save(); c.shadowColor = '#3fd4ff'; c.shadowBlur = n ? 12 : 8; c.strokeStyle = '#5fe0ff'; c.lineWidth = 3.2;
    for (const k of [-1.53, 1.03]) { c.beginPath(); c.moveTo(X(hz, k), hz); c.lineTo(X(H, k), H); c.stroke(); }
    c.restore();
    // tirets qui défilent : entre nos 2 voies, et au milieu de l'autre sens
    const off = (travel * 0.12) % 1; c.fillStyle = '#ffffff';
    for (let z = 1 - off; z < 60; z += 1) { const z0 = Math.max(1, z), z1 = z + 0.45; if (z1 <= 1) continue; const y0 = yOf(z0), y1 = yOf(z1);
      for (const k of [-0.5, -3.15]) { const w0 = Math.max(0.5, Lw(y0) * 0.028), w1 = Math.max(0.35, Lw(y1) * 0.028); c.globalAlpha = k < -2 ? 0.55 : 1; c.beginPath(); c.moveTo(X(y0, k) - w0, y0); c.lineTo(X(y0, k) + w0, y0); c.lineTo(X(y1, k) + w1, y1); c.lineTo(X(y1, k) - w1, y1); c.fill(); } }
    c.globalAlpha = 1;
    // séparateur central en béton (muret) : face claire + dessus, joints qui défilent
    const hb = (y) => Lw(y) * 0.09;
    c.beginPath(); c.moveTo(X(hz, -1.8), hz); for (let y = hz; y <= H; y += 4) c.lineTo(X(y, -1.8), y - hb(y)); c.lineTo(X(H, -1.8), H - hb(H)); c.lineTo(X(H, -1.72), H); c.lineTo(X(hz, -1.72), hz); c.closePath();
    c.fillStyle = n ? '#4f6498' : '#9fb7e6'; c.fill();
    c.beginPath(); for (let y = hz; y <= H; y += 4) c.lineTo(X(y, -1.8), y - hb(y)); for (let y = H; y >= hz; y -= 4) c.lineTo(X(y, -1.86), y - hb(y)); c.closePath(); c.fillStyle = wx === 'neige' ? '#ffffff' : n ? '#7389bd' : '#c9d8f2'; c.fill();
    c.strokeStyle = n ? '#3f5488' : '#9fb4dc'; c.lineWidth = 1;
    for (let z = 1.1 - (travel * 0.12 % 0.8); z < 30; z += 0.8) { if (z <= 1) continue; const y = yOf(z); c.beginPath(); c.moveTo(X(y, -1.75), y); c.lineTo(X(y, -1.8), y - hb(y)); c.stroke(); }
    // Voitures de face sur la chaussée opposée : profondeur décroissante = approche.
    for (let i = 0; i < 3; i++) {
      const z = window.RoadMotion712 ? window.RoadMotion712.oncomingDepth(T,i) : 23.4 - ((i * 7.13 + T * (3+i)) % 22);
      const y = yOf(z), k = -2.6 - (i % 2) * 1.1, s = Lw(y), x = X(y,k);
      c.fillStyle = n ? '#7487aa' : ['#dce4ed','#b74b44','#597aaf'][i];
      c.fillRect(x-s*0.23,y-s*0.30,Math.max(2,s*0.46),Math.max(2,s*0.28));
      c.fillStyle = '#16283f'; c.fillRect(x-s*0.15,y-s*0.26,Math.max(1,s*0.30),Math.max(1,s*0.10));
      c.fillStyle = '#fff6d8';
      for (const side of [-1,1]) { c.beginPath(); c.arc(x+side*s*0.17,y-s*0.07,Math.max(0.6,s*0.045),0,7);c.fill(); }
    }
    // côté droit : glissière + panneaux bleus avec la ville la plus proche
    const gap = 1.1, sh = (travel * 0.05) % gap, items = [];
    for (let k = 0; k < 16; k++) { const z = 1.15 + k * gap - sh; if (z > 1.05 && z < 18) items.push([z, k + Math.floor(travel * 0.05 / gap)]); }
    items.sort((a, b) => b[0] - a[0]);
    const panelSlot = window.RoadMotion713 ? window.RoadMotion713.slot(items) : null;
    c.strokeStyle = '#cfe6ff'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(X(hz, 1.2), hz - 1); c.lineTo(X(H, 1.2), H - Lw(H) * 0.12); c.stroke();
    for (const [z, id] of items) {
      const y = yOf(z), sc = 1 / z, fade = Math.min(1, (18 - z) / 6), x = X(y, 1.2); c.globalAlpha = fade;
      c.fillStyle = '#cfe6ffcc'; c.fillRect(x - 1.5 * sc, y - Lw(y) * 0.12, 3 * sc + 1, Lw(y) * 0.12);

    }
    if(panelSlot) window.RoadMotion713.panel(c,panelSlot[0],W,H,box,'autoroute');
    c.globalAlpha = 1;
    return { yOf };
  }
  function drawV(cv) {
    if(window.RoadDecor721 && (Decor721.enabled() || cv.parentNode.hasAttribute('data-decor721-preview')))return RoadDecor721.draw(cv,T,cv.parentNode.hasAttribute('data-decor721-preview')?T*60/3.6:travel,v);
    const dpr = Math.min(1.5, window.devicePixelRatio || 1), W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const { wx, night: n } = roadKind(), hz = H * 0.36, cx = W / 2; curWx = wx;
    let top = n ? '#0d1a45' : wx === 'pluie' || wx === 'orage' ? '#3a5194' : wx === 'brouillard' ? '#6f84b8' : '#3d62b8';
    let bot = n ? '#081232' : '#1d3577';
    const sky719=window.RoadSky719?window.RoadSky719.palette():null;
    if(sky719){top=sky719.top;bot=sky719.bottom;}
    let g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(0.4, sky719?sky719.bottom:n ? '#122458' : '#2c4c9e'); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, W, H);
    if(window.RoadSky719)window.RoadSky719.draw(c,W,H,wx);
    const scene = typeof window.roadScene === 'function' ? window.roadScene() : 'ville';
    const par = (travel * 0.004) % 1, base = hz + H * 0.02;
    if (scene === 'ville') {
    // ville en fond (silhouette bleu clair) + tour
    c.fillStyle = n ? '#3b5fae55' : '#8fc0ff66';
    for (const b of sky) { const x = ((b.x - par + 1) % 1) * W * 1.08 - W * 0.04, bw = b.w * W, bh = b.h * hz * 0.62; c.fillRect(x, base - bh, bw, bh); if (b.roof > 0.7) c.fillRect(x + bw * 0.4, base - bh - 6, bw * 0.2, 6); }
    const tx = ((0.31 - par + 1) % 1) * W * 1.08 - W * 0.04; c.fillRect(tx - 2, base - hz * 0.95, 4, hz * 0.95); c.beginPath(); c.ellipse(tx, base - hz * 0.62, 7, 5, 0, 0, 7); c.fill(); c.fillRect(tx - 0.8, base - hz * 1.08, 1.6, hz * 0.14);
    c.fillStyle = n ? '#ffe39a' : '#d6ecff88';
    for (const b of sky) { const x = ((b.x - par + 1) % 1) * W * 1.08 - W * 0.04, bw = b.w * W, bh = b.h * hz * 0.62; for (let yy = base - bh + 4; yy < base - 3; yy += 6) for (let xx = x + 2; xx < x + bw - 2; xx += 5) if (rnd(Math.round(xx * 3 + yy)) > (n ? 0.55 : 0.8)) c.fillRect(xx, yy, 1.6, 2); }
    } else {
      // collines au loin (autoroute / campagne)
      c.fillStyle = n ? '#3b5fae55' : '#8fc0ff55';
      c.beginPath(); c.moveTo(0, base); for (let x = 0; x <= W; x += 8) c.lineTo(x, base - hz * (scene === 'autoroute' ? 0.16 : 0.26) * (0.5 + 0.5 * Math.sin((x / W - par * 2) * 7 + 1.3))); c.lineTo(W, base); c.fill();
      c.fillStyle = n ? '#4a6fc055' : '#a9d0ff55';
      c.beginPath(); c.moveTo(0, base); for (let x = 0; x <= W; x += 8) c.lineTo(x, base - hz * 0.12 * (0.5 + 0.5 * Math.sin((x / W - par * 3) * 13 + 4))); c.lineTo(W, base); c.fill();
    }
    if (scene === 'foret') {   // lisière de sapins sombres sur l'horizon
      c.fillStyle = curWx === 'neige' ? (n ? '#56688f' : '#b9c9df') : n ? '#1d3a3a' : '#2f6a52';
      c.beginPath(); c.moveTo(0, base); for (let x = -10; x <= W + 10; x += 9) { const hh = hz * (0.18 + 0.14 * rnd(Math.round(x / 9 + par * 400) + 300)); c.lineTo(x, base - hh * 0.55); c.lineTo(x + 4.5, base - hh); } c.lineTo(W, base); c.fill();
    } else if (scene === 'village') {   // quelques toits et un clocher au loin
      c.fillStyle = n ? '#3b5fae66' : '#c9dcff99';
      for (let i = 0; i < 7; i++) { const x = ((0.08 + i * 0.13 + rnd(i + 500) * 0.05 - par + 1) % 1) * W * 1.08 - W * 0.04, w = W * 0.035, h = hz * 0.07; c.fillRect(x, base - h, w, h); c.beginPath(); c.moveTo(x - 2, base - h); c.lineTo(x + w / 2, base - h - w * 0.45); c.lineTo(x + w + 2, base - h); c.fill(); }
      const sx = ((0.58 - par + 1) % 1) * W * 1.08 - W * 0.04; c.fillRect(sx, base - hz * 0.26, W * 0.016, hz * 0.26); c.beginPath(); c.moveTo(sx - 1, base - hz * 0.26); c.lineTo(sx + W * 0.008, base - hz * 0.42); c.lineTo(sx + W * 0.016 + 1, base - hz * 0.26); c.fill();
    }
    // halo blanc au pied de la ville
    g = c.createLinearGradient(0, base - 6, 0, base + H * 0.08); g.addColorStop(0, n ? '#5f86d840' : '#d9ecff99'); g.addColorStop(1, '#d9ecff00'); c.fillStyle = g; c.fillRect(0, base - 6, W, H * 0.08 + 6);
    if (scene === 'autoroute') drawMotorway(c, W, H, hz, cx, n, wx, cv.parentNode);
    else {
    // route
    const wide = false, hw = (y) => W * (wide ? 0.06 : 0.045) + (W * (wide ? 0.64 : 0.52) - W * (wide ? 0.06 : 0.045)) * ((y - hz) / (H - hz));
    c.beginPath(); c.moveTo(cx - hw(hz), hz); c.lineTo(cx + hw(hz), hz); c.lineTo(cx + hw(H), H); c.lineTo(cx - hw(H), H); c.closePath();
    g = c.createLinearGradient(0, hz, 0, H); g.addColorStop(0, n ? '#14234f' : '#2a4896'); g.addColorStop(1, n ? '#0a1436' : '#1a2f70'); c.fillStyle = g; c.fill();
    if (wx === 'neige') { c.fillStyle = '#ffffff22'; c.fill(); }
    // lumière blanche sur les bas-côtés
    for (const sgn of [-1, 1]) { g = c.createLinearGradient(cx + sgn * hw(H) * 0.7, 0, cx + sgn * hw(H) * 1.15, 0); g.addColorStop(0, '#ffffff00'); g.addColorStop(1, n ? '#9cc4ff40' : '#ffffffa0'); c.fillStyle = g; c.beginPath(); c.moveTo(cx + sgn * hw(hz), hz); c.lineTo(cx + sgn * hw(hz) * 1.6, hz); c.lineTo(cx + sgn * hw(H) * 1.3, H); c.lineTo(cx + sgn * hw(H) * 0.75, H); c.fill(); }
    const yOf = (z) => hz + (H - hz) / z, off = (travel * 0.12) % 1;
    // bandes cyan sur les bords, en tirets qui défilent
    c.save(); c.shadowColor = '#3fd4ff'; c.shadowBlur = n ? 12 : 8;
    for (const sgn of [-1, 1]) { c.strokeStyle = '#5fe0ff'; c.lineWidth = 3.2; c.beginPath(); c.moveTo(cx + sgn * hw(hz) * 0.97, hz); c.lineTo(cx + sgn * hw(H) * 0.97, H); c.stroke(); }
    c.restore();
    c.fillStyle = '#bfefff';
    for (let z = 1 - (travel * 0.2 % 1); z < 40; z += 0.5) { const z0 = Math.max(1, z), z1 = z + 0.28; if (z1 <= 1) continue; const y0 = yOf(z0), y1 = yOf(z1); for (const sgn of [-1, 1]) { const a0 = cx + sgn * hw(y0) * 1.02, a1 = cx + sgn * hw(y1) * 1.02, t0 = Math.max(1, hw(y0) * 0.035), t1 = Math.max(0.6, hw(y1) * 0.035); c.beginPath(); c.moveTo(a0, y0); c.lineTo(a0 + sgn * t0, y0); c.lineTo(a1 + sgn * t1, y1); c.lineTo(a1, y1); c.fill(); } }
    // ligne blanche au centre
    c.fillStyle = '#ffffff';
    for (let z = 1 - off; z < 60; z += 1) { const z0 = Math.max(1, z), z1 = z + 0.5; if (z1 <= 1) continue; const y0 = yOf(z0), y1 = yOf(z1), w0 = Math.max(0.6, hw(y0) * 0.05), w1 = Math.max(0.4, hw(y1) * 0.05); for (const L of (wide ? [-1 / 3, 1 / 3] : [0])) { const a0 = cx + L * hw(y0), a1 = cx + L * hw(y1); c.beginPath(); c.moveTo(a0 - w0, y0); c.lineTo(a0 + w0, y0); c.lineTo(a1 + w1, y1); c.lineTo(a1 - w1, y1); c.fill(); } }
    roadSide(c, scene, hw, yOf, cx, hz, H, W, n, cv.parentNode);
    }
    var hw = (y) => W * 0.045 + (W * 0.52 - W * 0.045) * ((y - hz) / (H - hz)), yOf = (z) => hz + (H - hz) / z;
    if (wx === 'pluie' || wx === 'orage') rainExtra(c, W, H, hz, n, wx === 'orage');
    // phares la nuit
    if (n) { g = c.createRadialGradient(cx, H * 0.62, 4, cx, H * 0.55, H * 0.4); g.addColorStop(0, '#fff6d830'); g.addColorStop(1, '#fff6d800'); c.fillStyle = g; c.fillRect(0, hz, W, H - hz); }
    // météo : petits détails
    if (wx === 'pluie' || wx === 'orage') {
      c.strokeStyle = '#dbeaffaa'; c.lineWidth = 1; c.beginPath();
      for (let k = 0; k < 70; k++) { const d = drops[k], x = ((d.x + T * 0.04 * d.s) % 1) * W, y = ((d.y + T * 1.4 * d.s) % 1) * H; c.moveTo(x, y); c.lineTo(x - 1.5, y + 7 * d.s); } c.stroke();
      c.fillStyle = '#ffffff55'; for (let i = 0; i < 14; i++) { const ph = (T * 1.5 + rnd(i + 5)) % 1, x = cx + (rnd(i + 8) - 0.5) * hw(H) * 1.6, y = hz + (H - hz) * (0.4 + rnd(i + 9) * 0.6); c.beginPath(); c.ellipse(x, y, 5 * ph, 1.6 * ph, 0, 0, 7); c.globalAlpha = 1 - ph; c.fill(); } c.globalAlpha = 1;
    }
    if (wx === 'orage') stormV(c, W, H, hz, n);
    if (wx === 'neige') { c.fillStyle = '#fff'; for (const f of flakes) { const x = ((((f.x + Math.sin(T * 0.9 + f.y * 8) * 0.015 + T * 0.008) % 1) + 1) % 1) * W, y = ((f.y + T * 0.12 * f.s) % 1) * H; c.beginPath(); c.arc(x, y, 0.8 + f.s * 1.3, 0, 6.3); c.fill(); } c.fillStyle = '#ffffffcc'; c.fillRect(0, base - 2, W, 3); }
    if (wx === 'brouillard') {   // brouillard moyen : voile + nappes qui dérivent ; la route et le décor restent visibles
      g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, n ? '#5d6a8ad0' : '#cfd8e8d0'); g.addColorStop(0.4, n ? '#6b789ad8' : '#dfe6f2d8'); g.addColorStop(0.62, n ? '#5d6a8a90' : '#d2dbea90'); g.addColorStop(1, n ? '#5d6a8a40' : '#c7d1e340'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 10; i++) { const sp = 10 + rnd(i) * 18, x = ((rnd(i + 20) * W + T * sp) % (W + 600)) - 300, y = hz - 50 * H / 344 + i * 16 * H / 344; c.fillStyle = (n ? 'rgba(150,165,200,' : 'rgba(244,247,252,') + (0.3 + rnd(i + 5) * 0.25) + ')'; c.beginPath(); c.ellipse(x, y, (220 + rnd(i + 3) * 160) * W / 816, (18 + rnd(i + 8) * 16) * H / 344, 0, 0, 7); c.fill(); }
    }
    if (wx === 'soleil' && !n) { g = c.createRadialGradient(W * 0.9, 0, 2, W * 0.9, 0, W * 0.35); g.addColorStop(0, '#fff7d070'); g.addColorStop(1, '#fff7d000'); c.fillStyle = g; c.fillRect(0, 0, W, H * 0.5); }
  }
  // orage : nuages qui passent, éclairs à des endroits différents (parfois en double), flash, tonnerre
  let boltList = [], boltNext = 0;
  function stormV(c, W, H, hz, n) {
    c.fillStyle = '#0b1430' + '55'; c.fillRect(0, 0, W, H);
    c.fillStyle = n ? '#2a3456' : '#46557f'; for (let i = 0; i < 8; i++) { c.beginPath(); c.ellipse(((W * (i * 0.15) + T * 12) % (W + 200)) - 100, H * (0.06 + rnd(i) * 0.06), W * 0.15, H * 0.12, 0, 0, 7); c.fill(); }
    if (T > boltNext) {
      const k = Math.random() < 0.3 ? 2 : 1;
      for (let q = 0; q < k; q++) boltList.push({ t0: T + q * 0.15, x: W * (0.08 + Math.random() * 0.84), len: hz * (0.8 + Math.random() * 0.5), w: 2 + Math.random() * 1.8, s: Math.floor(Math.random() * 999) });
      boltNext = T + 2 + Math.random() * 5;
      if (typeof window.thunderSound === 'function') window.thunderSound(0.3 + Math.random() * 1.2);
    }
    let fl = 0;
    boltList = boltList.filter((b) => T - b.t0 < 0.4);
    for (const b of boltList) {
      const age = T - b.t0; if (age < 0) continue; fl = Math.max(fl, age < 0.08 ? 0.5 : 0.2 * (1 - age / 0.4));
      c.save(); c.globalAlpha = age < 0.12 ? 1 : Math.max(0, 1 - (age - 0.12) / 0.28); c.strokeStyle = '#fff'; c.shadowColor = '#bfe0ff'; c.shadowBlur = 20; c.lineWidth = b.w;
      c.beginPath(); let x = b.x, y = 4; c.moveTo(x, y);
      for (let i = 0; i < 8; i++) { x += (rnd(i * 13 + b.s) - 0.5) * W * 0.05; y += b.len / 8; c.lineTo(x, y); if (i === 3 || i === 5) { c.stroke(); c.lineWidth = b.w * 0.45; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (rnd(b.s + i) - 0.5) * W * 0.11, y + H * 0.12); c.lineTo(x + (rnd(b.s + i + 1) - 0.5) * W * 0.13, y + H * 0.22); c.stroke(); c.lineWidth = b.w; c.beginPath(); c.moveTo(x, y); } }
      c.stroke(); c.restore();
    }
    if (fl > 0) { c.fillStyle = 'rgba(255,255,255,' + fl + ')'; c.fillRect(0, 0, W, H); }
  }
  // bord de route : immeubles + lampadaires (ville), glissières + panneaux (autoroute), arbres (campagne). Ils avancent avec la voiture.
  function roadSide(c, scene, hw, yOf, cx, hz, H, W, n, box) {
    const gap = scene === 'autoroute' ? 1.1 : 1.6, sh = (travel * (scene === 'autoroute' ? 0.05 : 0.07)) % gap, items = [];
    for (let k = 0; k < 14; k++) { const z = 1.15 + k * gap - sh; if (z > 1.05 && z < 18) items.push([z, k + Math.floor(travel * (scene === 'autoroute' ? 0.05 : 0.07) / gap)]); }
    items.sort((a, b) => b[0] - a[0]);
    const panelSlot = window.RoadMotion713 ? window.RoadMotion713.slot(items) : null;
    for (const [z, id] of items) {
      const y = yOf(z), sc = 1 / z, fade = Math.min(1, (18 - z) / 6);
      c.globalAlpha = fade;
      for (const sg of [-1, 1]) {
        // Emplacement décidé par l'identité de l'objet, du lointain jusqu'au passage.
        // Jamais de masquage déclenché par sa position à l'écran.
        if(sg>0 && window.RoadMotion713 && window.RoadMotion713.kind(id)!=='scenery') continue;
        const x = cx + sg * hw(y) * 1.1, r = rnd(id * 2 + (sg > 0 ? 1 : 0));
        if (scene === 'ville') {
          // v7.11 : garder le premier plan droit dégagé pour le panneau fixe.
          if (r > 0.2) { const bw = (150 + r * 80) * sc * W / 800, bh = (220 + r * 260) * sc * H / 340, bx = x + sg * (bw * 0.5 + 30 * sc); c.fillStyle = n ? '#2f4f9a' : '#6f9be0'; c.fillRect(bx - bw / 2, y - bh, bw, bh);
            c.fillStyle = n ? '#ffe39a' : '#d6ecff'; const cs = Math.max(1, 12 * sc * W / 800), st = cs * 2; for (let yy = y - bh + cs; yy < y - cs * 1.5; yy += st) for (let xx = bx - bw / 2 + cs; xx < bx + bw / 2 - cs; xx += st) c.fillRect(xx, yy, cs, cs); }
          c.strokeStyle = '#cfe6ff'; c.lineWidth = Math.max(1, 4 * sc); c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 120 * sc * H / 340); c.lineTo(x - sg * 28 * sc, y - 120 * sc * H / 340); c.stroke();
          c.fillStyle = '#fff5c8'; c.beginPath(); c.arc(x - sg * 28 * sc, y - 118 * sc * H / 340, 4 * sc + 1, 0, 7); c.fill();
        } else if (scene === 'autoroute') {
          c.fillStyle = '#cfe6ffcc'; c.fillRect(x - 2 * sc, y - 24 * sc * H / 340, 4 * sc + 1, 24 * sc * H / 340);

        } else if (scene === 'foret') {   // forêt : sapins serrés des deux côtés, sur deux rangs
          for (const [d, kk] of [[18, 0], [85, 1], [150, 2]]) { const rr = rnd(id * 7 + kk * 3 + (sg > 0 ? 1 : 0)), tx = x + sg * (d + rr * 30) * sc, th = (150 + rr * 110) * sc * H / 340;
            c.fillStyle = '#5a3d24'; c.fillRect(tx - 2.5 * sc, y - th * 0.18, 5 * sc + 1, th * 0.18);
            c.fillStyle = n ? (kk ? '#1c3d34' : '#24493d') : (kk ? '#2f6a52' : '#3b7d5f');
            for (let j = 0; j < 3; j++) { const yb = y - th * (0.15 + j * 0.25), wb = th * (0.30 - j * 0.07); c.beginPath(); c.moveTo(tx - wb, yb); c.lineTo(tx, yb - th * 0.38); c.lineTo(tx + wb, yb); c.fill(); }
            if (curWx === 'neige') { c.fillStyle = '#f4f8ff'; for (let j = 0; j < 3; j++) { const yb = y - th * (0.15 + j * 0.25), wb = th * (0.30 - j * 0.07), ap = yb - th * 0.38; c.beginPath(); c.moveTo(tx, ap); c.lineTo(tx - wb * 0.55, ap + th * 0.21); c.lineTo(tx - wb * 0.2, ap + th * 0.17); c.lineTo(tx, ap + th * 0.22); c.lineTo(tx + wb * 0.25, ap + th * 0.16); c.lineTo(tx + wb * 0.55, ap + th * 0.21); c.fill(); } c.fillStyle = n ? (kk ? '#1c3d34' : '#24493d') : (kk ? '#2f6a52' : '#3b7d5f'); } }
        } else if (scene === 'village') {   // village : maisonnettes espacées, jardins et arbres entre elles
          if (r > 0.5) { const hx = x + sg * (95 + r * 30) * sc * W / 800, bw = (150 + r * 60) * sc * W / 800, bh = (85 + r * 35) * sc * H / 340;
            c.fillStyle = n ? '#56688f' : '#eef2f8'; c.fillRect(hx - bw / 2, y - bh, bw, bh);
            c.fillStyle = n ? '#6a3a35' : (r > 0.75 ? '#b5523b' : '#8d4a3a'); c.beginPath(); c.moveTo(hx - bw * 0.6, y - bh); c.lineTo(hx, y - bh - bw * 0.42); c.lineTo(hx + bw * 0.6, y - bh); c.fill();
            if (curWx === 'neige') { c.fillStyle = '#f4f8ff'; c.beginPath(); c.moveTo(hx - bw * 0.62, y - bh + 1); c.lineTo(hx, y - bh - bw * 0.44); c.lineTo(hx + bw * 0.62, y - bh + 1); c.lineTo(hx + bw * 0.5, y - bh - bw * 0.05); c.lineTo(hx, y - bh - bw * 0.3); c.lineTo(hx - bw * 0.5, y - bh - bw * 0.05); c.fill(); c.fillRect(hx - bw * 0.5, y - 2 * sc - 1, bw, 2 * sc + 1); }
            c.fillStyle = n ? '#ffe39a' : '#7fa6dd'; const ww = bw * 0.16; c.fillRect(hx - bw * 0.32, y - bh * 0.7, ww, ww); c.fillRect(hx + bw * 0.16, y - bh * 0.7, ww, ww);
            c.fillStyle = n ? '#2a3350' : '#7b5a3d'; c.fillRect(hx - bw * 0.07, y - bh * 0.5, bw * 0.14, bh * 0.5); }
          else if (r > 0.28) { const tx = x + sg * (30 + r * 50) * sc, th = (110 + r * 60) * sc * H / 340; c.fillStyle = '#6b4a2b'; c.fillRect(tx - 3 * sc, y - th * 0.35, 6 * sc + 1, th * 0.35); c.fillStyle = n ? '#2e5a4a' : '#4f8f6a'; c.beginPath(); c.ellipse(tx, y - th * 0.62, th * 0.28, th * 0.38, 0, 0, 7); c.fill(); if (curWx === 'neige') { c.fillStyle = '#f4f8ff'; c.beginPath(); c.ellipse(tx, y - th * 0.82, th * 0.22, th * 0.15, 0, 0, 7); c.fill(); } }
        } else {
          if (r > 0.15) { const tx = x + sg * (20 + r * 60) * sc, th = (130 + r * 80) * sc * H / 340; c.fillStyle = '#6b4a2b'; c.fillRect(tx - 3 * sc, y - th * 0.35, 6 * sc + 1, th * 0.35); c.fillStyle = n ? '#2e5a4a' : '#4f8f6a'; c.beginPath(); c.ellipse(tx, y - th * 0.65, th * 0.32, th * 0.45, 0, 0, 7); c.fill(); }
        }
      }
    }
    if(panelSlot) window.RoadMotion713.panel(c,panelSlot[0],W,H,box,scene);
    c.globalAlpha = 1;
  }
  requestAnimationFrame(frame);
})();

// ---------- météo détaillée et actualisation ----------
let wxOpen = false;
window.updateWeather = async function (force) {
  if (!loc || DEMO) return;
  const every = Math.max(2, parseInt(store.get('wxEvery', 5), 10) || 5) * 60e3;
  if (!force && Date.now() - weatherAt < every) return;
  weatherAt = Date.now();
  try {
    const j = await getJSON(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat.toFixed(3)}&longitude=${loc.lon.toFixed(3)}&current=temperature_2m,weather_code,is_day,apparent_temperature,wind_speed_10m,relative_humidity_2m&hourly=temperature_2m,weather_code,is_day,precipitation_probability&forecast_hours=25&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&forecast_days=7&timezone=auto`);
    const hrs = [];
    for (let i = 1; i < Math.min(25, j.hourly.time.length); i++) hrs.push({ h: j.hourly.time[i].slice(11, 13) + 'h', t: j.hourly.temperature_2m[i], c: j.hourly.weather_code[i], d: j.hourly.is_day[i], pp: (j.hourly.precipitation_probability || [])[i] });
    const days = (j.daily && j.daily.time || []).map((t, i) => ({ t, c: j.daily.weather_code[i], max: j.daily.temperature_2m_max[i], min: j.daily.temperature_2m_min[i], pp: (j.daily.precipitation_probability_max || [])[i], rise: (j.daily.sunrise || [])[i], set: (j.daily.sunset || [])[i] }));
    const wasNight = isNight();
    weather = { t: j.current.temperature_2m, c: j.current.weather_code, day: j.current.is_day, feel: j.current.apparent_temperature, wind: j.current.wind_speed_10m, hum: j.current.relative_humidity_2m, hours: hrs, days, at: Date.now() };
    if (wasNight !== isNight()) render(); else if (wxOpen) render();
  } catch (e) { weatherAt = Date.now() - every + 60e3; }
  // v7.10 : nom partagé avec les panneaux, sans géocodage météo concurrent.
  if (window.Place710Refresh) window.Place710Refresh();
};
function wxPanel(p) {
  if (!weather) return `<div style="padding:30px;color:${p.mut}">Pas encore de météo : il faut le GPS et Internet.</div>`;
  const w = wmo(weather.c), D = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
  const hours = (weather.hours || []).slice(0, 12).map((h) => `<div style="flex:1;text-align:center;${box(p, 'padding:8px 2px')}"><div style="font-size:12px;color:${p.mut}">${h.h}</div>${weatherSvg(wmo(h.c).i, h.d !== 0, 30, p.wacc)}<div style="font-size:16px;font-weight:700">${Math.round(h.t)}°</div>${h.pp != null ? `<div style="font-size:11px;color:#56CCF2">${h.pp} %</div>` : ''}</div>`).join('');
  const days = (weather.days || []).map((d, i) => `<div style="display:grid;grid-template-columns:110px 40px 1fr 70px;align-items:center;gap:10px;padding:8px 4px;border-bottom:1px solid ${p.light ? '#0000000f' : '#ffffff0f'}"><b>${i === 0 ? 'Aujourd\'hui' : D[new Date(d.t + 'T12:00').getDay()] + ' ' + d.t.slice(8, 10)}</b>${weatherSvg(wmo(d.c).i, true, 30, p.wacc)}<span style="color:${p.mut}">${wmo(d.c).t}${d.pp != null ? ` · pluie ${d.pp} %` : ''}</span><span style="text-align:right"><b>${Math.round(d.max)}°</b> <span style="color:${p.mut}">${Math.round(d.min)}°</span></span></div>`).join('');
  const t0 = weather.days && weather.days[0];
  return `<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:16px;min-height:0;flex:1">
    <div style="display:flex;flex-direction:column;gap:12px;min-height:0">
      <div style="display:flex;align-items:center;gap:16px">${weatherSvg(w.i, weather.day, 80, p.wacc)}<div><div style="font-size:56px;font-weight:700;line-height:1">${Math.round(weather.t)}°</div><div style="font-size:16px;color:${p.wacc}">${esc(city || 'Ma position')} · ${w.t}</div></div></div>
      <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px">${[['Ressenti', weather.feel != null ? Math.round(weather.feel) + '°' : '—'], ['Vent', weather.wind != null ? Math.round(weather.wind) + ' km/h' : '—'], ['Humidité', weather.hum != null ? weather.hum + ' %' : '—'], ['Soleil', t0 && t0.rise ? t0.rise.slice(11, 16) + ' – ' + t0.set.slice(11, 16) : '—']].map(([a, b]) => `<div style="${box(p, 'padding:8px 10px')}"><div style="font-size:12px;color:${p.mut}">${a}</div><b style="font-size:16px">${b}</b></div>`).join('')}</div>
      <div style="font-size:13px;font-weight:600;color:${p.mut}">HEURE PAR HEURE</div><div style="display:flex;gap:6px">${hours}</div>
      <div style="font-size:12px;color:${p.mut}">Actualisée à ${weather.at ? fmtTime(weather.at) : '—'} · toutes les ${store.get('wxEvery', 5)} min · position GPS · open-meteo.com</div></div>
    <div class="scroll" style="min-height:0"><div style="font-size:13px;font-weight:600;color:${p.mut};margin-bottom:4px">7 JOURS</div>${days}</div></div>`;
}

// ---------- appui long sur un widget : choisir ce qu'il affiche ----------
let grpEd = null;
function grpEditor(p) {
  const g = gridCfg(), it = g.items[grpEd]; if (!it) { grpEd = null; return ''; }
  const cur = it.b.map((k, j) => `<div style="position:relative;${box(p, 'padding:14px 40px 14px 14px;font-size:15px;font-weight:600')}">${GBLOCKS[k] ? GBLOCKS[k].n : k}${it.b.length > 1 ? `<button data-act="ge:del:${j}" aria-label="Retirer" style="position:absolute;top:-8px;right:-8px;width:34px;height:34px;border-radius:50%;background:#E0312B;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px #0007">${ic('x', 18, '#fff', 3)}</button>` : ''}</div>`).join('');
  const used = new Set(g.items.flatMap((x) => x.b));
  const add = Object.entries(GBLOCKS).filter(([k]) => k !== 'map' && !it.b.includes(k)).map(([k, B]) => `<button data-act="ge:add:${k}" style="height:50px;border-radius:12px;background:${p.card2};color:${p.txt};font-size:14px;font-weight:600;text-align:left;padding:0 14px">+ ${B.n}${used.has(k) ? ` <span style="color:${p.mut};font-weight:400">(déjà ailleurs)</span>` : ''}</button>`).join('');
  return `<div style="position:absolute;inset:0;z-index:1500;background:#000a;display:flex;align-items:center;justify-content:center" data-act="ge:close"><div data-act="ge:noop" style="width:880px;max-height:640px;${card(p, 'padding:20px;display:flex;flex-direction:column;gap:14px')};background:${hex7(p.card)}">
    <div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:20px;font-weight:700">Ce que ce widget affiche</div><div style="font-size:13px;color:${p.mut}">Croix rouge pour retirer. S'il y en a plusieurs, des points permettent de passer de l'un à l'autre.</div></div>${chipBtn(p, 'ge:close', 'Terminer', true)}</div>
    <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;padding-top:8px">${cur}</div>
    <div style="font-size:13px;font-weight:700;color:${p.mut}">AJOUTER</div><div class="scroll" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;min-height:0">${add}</div></div></div>`;
}
function geAct(op, a) {
  if (op === 'noop') return;
  if (op === 'close') { grpEd = null; return render(); }
  const g = JSON.parse(JSON.stringify(gridCfg())), it = g.items[grpEd]; if (!it) return;
  if (op === 'del' && it.b.length > 1) { it.b.splice(+a, 1); stackIdx[grpEd] = 0; }
  if (op === 'add') it.b.push(a);
  store.set('grid_' + profIdx(), g); render();
}
function setupLongWidget() {
  const st = $('stage'); let lp = null;
  st.addEventListener('pointerdown', (e) => {
    if (tab !== 'home' || editing || homePage !== 0 || grpEd != null) return;
    const gi = e.target.closest('[data-gi]'); if (!gi || e.target.closest('.mapslot') || e.target.closest('.ffslot')) return;
    lp = { x: e.clientX, y: e.clientY, t: setTimeout(() => { lp = null; if (press) { clearTimeout(press.timer); press = null; } if (curP && curP.layout !== 'custom') return; grpEd = +gi.dataset.gi; render(); }, 600) };
  }, true);
  const cancel = (e) => { if (lp && (!e || e.type !== 'pointermove' || Math.abs(e.clientX - lp.x) + Math.abs(e.clientY - lp.y) > 20)) { clearTimeout(lp.t); lp = null; } };
  st.addEventListener('pointermove', cancel, true); st.addEventListener('pointerup', () => cancel(), true); st.addEventListener('pointercancel', () => cancel(), true);
}

// ---------- Trajets : graphiques ----------
let chartDays = 7;
function dayStats(n) {
  const now = new Date(), d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(), list = tripsHistory(), out = [];
  for (let i = n - 1; i >= 0; i--) {
    const s = d0 - i * 86400000, t = list.filter((x) => x.start >= s && x.start < s + 86400000);
    const km = t.reduce((a, x) => a + x.dist, 0), L = t.reduce((a, x) => a + (x.cons ? x.dist * x.cons / 100 : 0), 0), eur = t.reduce((a, x) => a + (x.cons && x.price ? x.dist * x.cons / 100 * x.price : 0), 0);
    const sc = t.filter((x) => x.score != null), score = sc.length ? Math.round(sc.reduce((a, x) => a + x.score, 0) / sc.length) : null;
    out.push({ s, km, L, eur, score, n: t.length, min: t.reduce((a, x) => a + (x.end - x.start) / 60000, 0) });
  }
  return out;
}
function barChart(p, title, data, key, fmt, color, unit) {
  const max = Math.max(1e-9, ...data.map((d) => d[key] || 0)), J = ['D', 'L', 'M', 'M', 'J', 'V', 'S'], many = data.length > 10;
  const total = data.reduce((a, d) => a + (d[key] || 0), 0);
  return `<div style="${card(p, 'padding:12px 16px;display:flex;flex-direction:column;min-height:0')}"><div style="display:flex;justify-content:space-between;align-items:baseline"><div style="font-size:15px;font-weight:600">${title}</div><div style="font-size:13px;color:${p.mut}">${key === 'score' ? 'moyenne' : 'total'} <b style="color:${p.txt};font-size:16px">${key === 'score' ? (data.some((d) => d.score != null) ? Math.round(data.filter((d) => d.score != null).reduce((a, d) => a + d.score, 0) / data.filter((d) => d.score != null).length) : '—') : fmt(total)}</b> ${unit}</div></div>
    <div style="flex:1;display:flex;align-items:flex-end;gap:${many ? 3 : 8}px;min-height:60px;margin-top:6px">${data.map((d) => { const v = d[key] || 0, isT = d.s === data[data.length - 1].s; const col = key === 'score' ? scoreColor(d.score) : color; return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;height:100%;justify-content:flex-end;min-width:0">${many ? '' : `<span style="font-size:11px;color:${p.mut};white-space:nowrap">${v ? fmt(v) : ''}</span>`}<div style="width:100%;height:${v ? Math.max(3, v / max * 100) : 2}%;background:${col};opacity:${isT ? 1 : 0.7};border-radius:${many ? 3 : 6}px"></div><span style="font-size:${many ? 9 : 12}px;color:${p.mut}">${many ? new Date(d.s).getDate() : J[new Date(d.s).getDay()]}</span></div>`; }).join('')}</div></div>`;
}
function pageCharts(p) {
  const data = dayStats(chartDays);
  const tot = data.reduce((a, d) => ({ km: a.km + d.km, L: a.L + d.L, eur: a.eur + d.eur, n: a.n + d.n, min: a.min + d.min }), { km: 0, L: 0, eur: 0, n: 0, min: 0 });
  const kpi = (l, v, u, col) => `<div style="${card(p, 'padding:10px 16px')}"><div style="font-size:12px;color:${p.mut}">${l}</div><div style="font-size:24px;font-weight:700;${col ? `color:${col}` : ''}">${v} <span style="font-size:13px;color:${p.mut};font-weight:500">${u}</span></div></div>`;
  return pageFrame(p, `<div style="display:flex;gap:12px;align-items:stretch;margin-bottom:12px"><div style="display:flex;gap:6px;align-items:center">${chipBtn(p, 'cdays:7', '7 jours', chartDays === 7)}${chipBtn(p, 'cdays:30', '30 jours', chartDays === 30)}</div>
      <div style="flex:1;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px">${kpi('Trajets', tot.n, '')}${kpi('Distance', fr1(tot.km), 'km')}${kpi('Carburant', fr1(tot.L), 'L')}${kpi('Prix', fr2(tot.eur), '€', p.warn)}${kpi('Au volant', tot.min >= 60 ? Math.floor(tot.min / 60) + ' h ' + pad(Math.round(tot.min % 60)) : Math.round(tot.min) + ' min', '')}</div></div>
    <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:12px;min-height:0">
      ${barChart(p, 'Prix par jour', data, 'eur', fr2, p.warn || '#EF9F27', '€')}
      ${barChart(p, 'Litres consommés par jour', data, 'L', fr1, '#56CCF2', 'L')}
      ${barChart(p, 'Kilomètres par jour', data, 'km', (x) => String(Math.round(x)), p.acc, 'km')}
      ${barChart(p, 'Score éco par jour', data, 'score', (x) => String(x), '#5DCAA5', '/100')}</div>`);
}
const _pageTrips = window.pageTrips;
window.pageTrips = function (p) { if (tripSub === 'charts') return pageCharts(p); if (tripSub === 'eco') return pageEco(p); return _pageTrips(p); };

// ---------- vérification CAN au démarrage ----------
function canReport() {
  const c = car || {}, fresh = car && Date.now() - car.ts < 120000, sp = curSpeed();
  const items = [['Vitesse', !!(fresh && c.speed >= 0), sp ? sp.src : ''], ['Régime moteur', !!(fresh && val(c.rpm) != null)], ['Carburant (litres)', !!(fresh && val(c.fuel) != null)], ['Autonomie', !!(fresh && val(c.range) != null)], ['Consommation moyenne', !!(fresh && val(c.avg1) > 0)], ['Consommation instantanée', !!(fresh && val(c.instant) != null)], ['Compteur km', !!(fresh && val(c.odo))], ['Portes / coffre', !!doors]];
  return { ts: Date.now(), items, svc: qfInfo().q };
}
function canCheckAtStart() {
  setTimeout(() => {
    const r = canReport(); store.set('canReport', r);
    const ok = r.items.filter((x) => x[1]).length;
    if (store.get('canAuto', true) && ok < r.items.length) toast(`Données de la voiture : ${ok} sur ${r.items.length} reçues. Détail : Paramètres › Véhicule`);
  }, 25000);
}

// ---------- sauvegarde ----------
function snapshot() { const d = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('a08_')) d[k] = localStorage.getItem(k); } return { app: 'accueil2008', ver: APP_VERSION, ts: Date.now(), data: d }; }
function saveBackup(silent) { try { localStorage.setItem('a08bak_auto', JSON.stringify(snapshot())); if (!silent) toast('Sauvegarde faite'); } catch (e) { try { const s = snapshot(); delete s.data.a08_wallPhoto; delete s.data.a08_carImg; localStorage.setItem('a08bak_auto', JSON.stringify(s)); if (!silent) toast('Sauvegarde faite (sans les photos)'); } catch (e2) { if (!silent) toast('Pas assez de place pour la sauvegarde'); } } }
function lastBackup() { try { return JSON.parse(localStorage.getItem('a08bak_auto') || 'null'); } catch (e) { return null; } }
function restoreFrom(b) { if (!b || !b.data) { toast('Sauvegarde illisible'); return; } Object.keys(b.data).forEach((k) => { if (k.startsWith('a08_')) localStorage.setItem(k, b.data[k]); }); toast('Réglages restaurés'); setTimeout(() => location.reload(), 600); }
function autoBackupAtStart() {
  if (!store.get('autoBackup', true)) return;
  const last = lastBackup(), prevVer = store.get('lastVer', '');
  if (prevVer !== APP_VERSION || !last || Date.now() - last.ts > 86400000) saveBackup(true);
  store.set('lastVer', APP_VERSION);
}

// ---------- mises à jour (GitHub) ----------
let updInfo = null, updMsg = '';
const verNum = (v) => String(v || '0').split('.').map((x) => parseInt(x, 10) || 0).reduce((a, x, i) => a + x / Math.pow(1000, i), 0);
async function checkUpdate(manual) {
  const repo = store.get('updRepo', 'Roudousa-67/accueil2008');
  updMsg = 'Vérification…'; if (manual) render();
  const r = await http(`https://raw.githubusercontent.com/${repo}/main/version.json?t=${Date.now()}`);
  try { if (!r.ok) throw new Error(); updInfo = JSON.parse(r.b); store.set('updAt', Date.now()); updMsg = verNum(updInfo.version) > verNum(APP_VERSION) ? `Version ${updInfo.version} disponible` : 'Tu as la dernière version'; }
  catch (e) { updInfo = null; updMsg = DEMO ? 'Aperçu : vérification sur l\'autoradio' : 'Impossible de joindre GitHub (dépôt ' + repo + ')'; }
  if (manual || (updInfo && verNum(updInfo.version) > verNum(APP_VERSION))) { if (!manual) toast('Mise à jour ' + updInfo.version + ' disponible : Paramètres › Mises à jour'); if (tab === 'settings') render(); }
}

// ---------- applis de la voiture (réglages d'origine) ----------
const CARAPPS = [['Paramètres de voiture', 'com.qf.carsettings', /param[eè]tres de voiture|carsetting/i], ['Applications de la voiture', 'com.qf.vehicle', /automobiles|vehicle/i], ['Son (DSP)', 'com.qf.soundeffect', /^dsp$|dsp/i], ['Ventilateur', 'com.qf.fancontrol', /ventilateur|fan/i], ['Pression des pneus (TPMS)', 'com.syt.tmps', /tpms/i], ['Caméra de recul / 360', 'com.qf.backcar', /360|panorama|recul/i], ['Test usine (工厂测试)', 'com.qf.test', /工厂|factory/i], ['Enregistreur (dashcam)', '', /enregistreur|dvr|record/i]];
function launchCarApp(i) { const [n, pk, re] = CARAPPS[i]; if (!A) { toast('Ouverture : ' + n); return; } if (pk && A.launch(pk)) return; const f = allApps().find((a) => re.test(a.l) || re.test(a.p)); if (f && A.launch(f.p)) return; toast(`« ${n} » introuvable sur l'autoradio`); }

// ---------- Paramètres ----------
let setCat = 0, setSub = 0, setCaptureFrame = false, setText = '';
const _chromeFrame = window.chromeFrame;
window.chromeFrame = function (p, body, pos) { return setCaptureFrame ? body : _chromeFrame(p, body, pos); };
function inner(fn, p) { setCaptureFrame = true; try { return fn(p); } finally { setCaptureFrame = false; } }
function themesBody(p) { return inner(pageThemes, p).replace(/<div style="min-height:0;display:flex;flex-direction:column">/, '<div>').replace('class="scroll" style="flex:1;', 'style="'); }
const SETCATS = [
  ['Affichage et personnalisation', [
    ['Thèmes', (p) => themesBody(p)],
    ['Fond d\'écran', (p) => {
      const cur = pv('wall', ''), cats = [...new Set(WALLS.map((w) => w.cat))];
      const tile = (id, label, extra) => `<button data-act="wall:${id}" style="aspect-ratio:16/9;border-radius:10px;overflow:hidden;position:relative;background:${p.card2};outline:${cur === id ? `3px solid ${p.acc}` : 'none'};outline-offset:2px;${extra || ''}">${id && id !== 'photo' ? `<img data-wall="${id}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">` : ''}<span style="position:absolute;left:6px;bottom:4px;font-size:12px;font-weight:600;color:#fff;text-shadow:0 1px 3px #000">${label || ''}</span></button>`;
      return `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><div style="font-size:14px;color:${p.mut}">${WALLS.length} fonds + tes photos. Touche un fond : l'accueil change tout de suite.</div>${chipBtn(p, 'wallPick', '+ Ajouter ma photo', true)}<input id="wallFile" type="file" accept="image/*" style="display:none"></div>
        <div style="display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin-top:10px">${tile('', 'Couleur du thème')}${store.get('wallPhoto', '') ? tile('photo', 'Ma photo', `background:url(${store.get('wallPhoto', '')}) center/cover`) : ''}</div>
        ${cats.map((c) => `${secT(p, c + ' · ' + WALLS.filter((w) => w.cat === c).length)}<div style="display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px">${WALLS.filter((w) => w.cat === c).map((w) => tile(w.id)).join('')}</div>`).join('')}
        ${secT(p, 'Réglages')}${setRow(p, 'Assombrir le fond', 'Pour que les widgets restent lisibles.', [0, 15, 30, 45, 60].map((d) => chipBtn(p, 'wallDim:' + d, d + ' %', pv('wallDim', 30) === d)).join(''))}
        ${setRow(p, 'Cartes transparentes', 'Laisse voir le fond derrière les widgets.', togBtn(p, 'toggleGlass', !!custom(profIdx(), themeIdFor(profIdx())).glass))}`;
    }],
    ['Heure et date', (p) => {
      const c = clk(), sv = (k, v) => `clk:${k}:${v}`;
      return `${setRow(p, 'Aperçu', '', `<div style="text-align:right;line-height:1.05;color:${c.color || p.txt};${c.font ? `font-family:'${c.font}',Inter;` : ''}"><div data-k="clk2" style="font-size:${(CLK_SIZE[c.size] || CLK_SIZE.m)[0] + 6}px;font-weight:600">--:--</div><div data-k="date2" style="font-size:${(CLK_SIZE[c.size] || CLK_SIZE.m)[1] + 2}px;font-weight:600;opacity:.75"></div></div>`)}
        ${setRow(p, 'Format de l\'heure', '', chipBtn(p, sv('h12', 0), '24 h', !c.h12) + chipBtn(p, sv('h12', 1), '12 h', c.h12))}
        ${setRow(p, 'Afficher les secondes', '', togBtn(p, sv('sec', c.sec ? 0 : 1), c.sec))}
        ${setRow(p, 'Date', '', [['long', 'lundi 9 novembre'], ['court', 'lun. 9 novembre'], ['chiffres', '09/11'], ['aucune', 'Masquée']].map(([k, l]) => chipBtn(p, sv('date', k), l, c.date === k)).join(''))}
        ${setRow(p, 'Afficher l\'année', '', togBtn(p, sv('year', c.year ? 0 : 1), c.year))}
        ${setRow(p, 'Taille', '', [['s', 'Petite'], ['m', 'Moyenne'], ['l', 'Grande'], ['xl', 'Très grande']].map(([k, l]) => chipBtn(p, sv('size', k), l, c.size === k)).join(''))}
        ${setRow(p, 'Police', '', CLK_FONTS.map(([k, l]) => chipBtn(p, sv('font', k || '-'), l, c.font === k, k ? `font-family:'${k}',Inter` : '')).join(''))}
        ${setRow(p, 'Couleur', '', CLK_COLORS.map((col) => `<button data-act="${sv('color', col || '-')}" aria-label="${col || 'Couleur du thème'}" style="width:36px;height:36px;border-radius:50%;background:${col || `linear-gradient(135deg, ${p.txt} 50%, ${p.acc} 50%)`};border:${c.color === col ? `3px solid ${p.acc}` : '1px solid #8886'}"></button>`).join(''))}`;
    }],
    ['Barre du haut', (p) => `${setRow(p, 'Afficher 4G, Bluetooth et Wi-Fi', 'À côté de l\'heure : allumé en blanc quand c\'est activé. Touche une icône pour ouvrir son réglage.', togBtn(p, 'tg:showNet:1', store.get('showNet', true)))}
      ${setRow(p, 'Masquer la barre Android', 'Plein écran pour l\'accueil.', togBtn(p, 'toggleImmersive', !A || !A.immersive || A.immersive()))}
      ${setRow(p, 'Changer de profil', 'Touche la pastille ronde en haut à gauche.', '')}`],
    ['Voiture affichée', (p) => `${setRow(p, 'Dans la tuile voiture', 'La route avance avec ta vitesse et suit la météo (pluie, neige, brouillard) et le jour / la nuit.', chipBtn(p, 'carView:road', 'Route animée', store.get('carView', 'road') === 'road') + chipBtn(p, 'carView:car', 'Voiture 3D seule', store.get('carView', 'road') !== 'road'))}
      ${setRow(p, 'Voiture 3D', 'La même voiture en 3D partout. Glisse le doigt dessus pour la faire tourner à 360°.', '')}
      <div style="font-size:12px;color:${p.mut};margin-top:10px">Modèle 3D « 2018 Peugeot 2008 » par tonielpro520 (Sketchfab), licence CC BY 4.0.</div>`]
  ]],
  ['Écran d\'accueil', [
    ['Disposition', (p) => `${setRow(p, 'Modifier l\'accueil', 'Écran libre : place tes widgets et tes applis où tu veux, sur plusieurs pages. Raccourci : appui long sur un widget ou une appli.', chipBtn(p, 'editLayout', 'Modifier', true))}
      ${setRow(p, 'Remettre la disposition rangée', 'Remplace ta disposition par celle d\'origine (GPS, musique, route, vitesse, météo, adresse).', chipBtn(p, 'h2:tidy', 'Ranger'))}
      ${setRow(p, 'Défilement automatique des groupes', 'Les widgets à points changent seuls toutes les 10 s.', togBtn(p, 'toggleAutoStack', store.get('autoStack', false)))}
      ${secT(p, 'Disposition toute faite')}<div style="display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px">${[['', 'Celle du thème']].concat(Object.entries(LAYOUT_NAMES)).map(([k, n]) => chipBtn(p, 'layout:' + k, n, store.get('layout_' + profIdx(), '') === k)).join('')}</div>`],
    ['Barre de raccourcis', (p) => `${setRow(p, 'Position', '', [['auto', 'Celle du thème'], ['bas', 'En bas'], ['haut', 'En haut'], ['gauche', 'À gauche'], ['droite', 'À droite'], ['cachee', 'Cachée']].map(([k, n]) => chipBtn(p, 'dockpos:' + k, n, dockPos() === k)).join(''))}
      ${setRow(p, 'Nombre de raccourcis', '« Applis » reste toujours au bout.', `${chipBtn(p, 'dockN:-1', '−')}<b style="min-width:40px;text-align:center;font-size:18px">${Math.min(DOCK_ALL.length, store.get('dockN', DOCK_ALL.length))}</b>${chipBtn(p, 'dockN:1', '+')}`)}
      ${secT(p, 'Appli de chaque raccourci (ou appui long sur le raccourci)')}${DOCK_ALL.filter((d) => !d.special).map((d) => { const pk = store.get('dock_' + d.id, ''); const a = pk && allApps().find((x) => x.p === pk); return setRow(p, d.label, a ? a.l : 'Par défaut', chipBtn(p, 'assign:' + d.id, 'Choisir')); }).join('')}`]
  ]],
  ['Véhicule', [
    ['Données CAN', (p) => { const r = store.get('canReport', null), now = canReport(); return `<div style="font-size:14px;color:${p.mut};margin-bottom:6px">Ce que l'appli reçoit du boîtier CAN de l'autoradio en ce moment.</div>
      <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px">${now.items.map(([n, ok]) => `<div style="${box(p, 'padding:10px 12px')}"><div style="font-size:13px;color:${p.mut}">${n}</div><b style="color:${ok ? '#5DCAA5' : '#FF6B6B'}">${ok ? 'Reçu' : 'Pas reçu'}</b></div>`).join('')}</div>
      <div data-k="qfInfo" style="font-size:12px;color:${p.mut};margin:10px 0">${qfInfo().txt}</div>
      ${setRow(p, 'Vérifier à chaque démarrage', 'Te prévient si une donnée manque.', togBtn(p, 'tg:canAuto:1', store.get('canAuto', true)))}
      ${setRow(p, 'Dernière vérification', r ? `${fmtDate(r.ts)} ${fmtTime(r.ts)} · ${r.items.filter((x) => x[1]).length} sur ${r.items.length} reçues` : 'Pas encore faite', chipBtn(p, 'canNow', 'Vérifier maintenant'))}
      ${setRow(p, 'Corriger les voyants', 'Ceinture, coffre… si le boîtier les mélange.', chipBtn(p, 'calib', 'Lancer', true))}
      ${setRow(p, 'Protocole CAN de l\'autoradio', 'À régler dans le menu usine : Peugeot 2008 (2013-2019).', chipBtn(p, 'open:qflauncher', 'Menu usine'))}`; }],
    ['Réglages voiture', (p) => `<div style="${box(p, 'padding:12px 14px;font-size:14px;line-height:1.5')}">Les LED d'ambiance (5 niveaux), le son et le ventilateur sont pilotés par des applis système de l'autoradio : Android ne laisse pas une appli normale leur envoyer des ordres. Ces boutons ouvrent directement le bon réglage d'origine. Pour les LED : « Applications de la voiture » › Réglages › Éclairage d'ambiance.</div>
      ${CARAPPS.map(([n], i) => setRow(p, n, '', chipBtn(p, 'carapp:' + i, 'Ouvrir'))).join('')}`],
    ['Carburant', (p) => `${setRow(p, 'Carburant de ma 2008', '', ['E10', 'SP95', 'SP98', 'Gazole', 'E85', 'GPLc'].map((f) => chipBtn(p, 'fuel:' + f, f, store.get('fuel', 'E10') === f)).join(''))}
      ${setRow(p, 'Consommation si la voiture ne la donne pas', 'L/100 km', `<input data-set="consFallback" type="number" step="0.1" value="${esc(store.get('consFallback', ''))}" placeholder="6,0" style="${fld(p, 'width:120px')}">`)}`],
    ['Alertes', (p) => `${setRow(p, 'Alertes portes, coffre, ceinture', 'Masquées pour l\'instant : les capteurs ne sont pas encore bien lus.', togBtn(p, 'tg:showAlerts:0', store.get('showAlerts', false)))}
      ${setRow(p, 'Alerte vitesse au-delà de la limite de', '', ['0', '3', '5', '10'].map((t) => chipBtn(p, 'tol:' + t, '+' + t + ' km/h', String(store.get('tol', '3')) === t)).join(''))}`]
  ]],
  ['Navigation', [
    ['Appli GPS', (p) => `${setRow(p, 'Appli ouverte par le bouton de la carte', 'Waze, Google Maps ou n\'importe quelle appli installée.', `<b>${esc(navName())}</b>${chipBtn(p, 'assign:gps', 'Choisir', true)}`)}
      ${setRow(p, 'Zoom automatique selon la vitesse', '', togBtn(p, 'tg:autoZoom:1', store.get('autoZoom', true)))}`],
    ['Adresses', (p) => `${setRow(p, 'Maison', '', `<input data-set="addrHome" value="${esc(store.get('addrHome', ''))}" placeholder="12 rue des Lilas, Strasbourg" style="${fld(p, 'width:420px')}">`)}${setRow(p, 'Travail', '', `<input data-set="addrWork" value="${esc(store.get('addrWork', ''))}" placeholder="Adresse du travail" style="${fld(p, 'width:420px')}">`)}`]
  ]],
  ['Météo', [
    ['Actualisation', (p) => `${setRow(p, 'Actualiser toutes les', 'Avec ta position GPS.', ['2', '5', '10', '15', '30'].map((m) => chipBtn(p, 'wxEvery:' + m, m + ' min', String(store.get('wxEvery', 5)) === m)).join(''))}
      ${setRow(p, 'Actualiser maintenant', weather && weather.at ? 'Dernière mise à jour à ' + fmtTime(weather.at) : '', chipBtn(p, 'wxNow', 'Actualiser', true))}
      ${setRow(p, 'Météo détaillée', 'Heure par heure et 7 jours. Aussi en touchant la météo sur l\'accueil.', chipBtn(p, 'wxDetail', 'Voir'))}`]
  ]],
  ['Entretien', [
    ['Rappels', (p) => `${setRow(p, 'Prochaine vidange à', 'km compteur', `<input data-set="oilKm" type="number" value="${esc(store.get('oilKm', ''))}" placeholder="95000" style="${fld(p, 'width:160px')}">`)}${setRow(p, 'ou à la date', '', `<input data-set="oilDate" type="date" value="${esc(store.get('oilDate', ''))}" style="${fld(p, 'width:200px')}">`)}
      ${setRow(p, 'Intervalle entre vidanges', 'km', `<input data-set="oilInt" type="number" value="${esc(store.get('oilInt', ''))}" placeholder="20000" style="${fld(p, 'width:160px')}">`)}${setRow(p, 'Prochain contrôle technique', '', `<input data-set="ctDate" type="date" value="${esc(store.get('ctDate', ''))}" style="${fld(p, 'width:200px')}">`)}`]
  ]],
  ['Profils', [
    ['Profils', (p) => `${[0, 1, 2].map((i) => setRow(p, 'Profil ' + (i + 1), i === profIdx() ? 'Profil actif' : '', `<input data-set="prof:${i}" value="${esc(profiles()[i])}" maxlength="16" style="${fld(p, 'width:240px')}">${chipBtn(p, 'prof:' + i, i === profIdx() ? 'Actif' : 'Activer', i === profIdx())}`)).join('')}
      ${setRow(p, 'Écran de bienvenue au démarrage', '« Bienvenue, choisissez l\'utilisateur » à chaque lancement.', togBtn(p, 'tg:welcome:1', store.get('welcome', true)))}
      <div style="font-size:13px;color:${p.mut};margin-top:8px">Chaque profil garde son thème, son fond, son accueil et son heure.</div>`]
  ]],
  ['Système', [
    ['Écran d\'accueil', (p) => { const isHome = A && A.isDefaultHome && A.isDefaultHome(); return `${setRow(p, 'Toujours ouvrir à la place du lanceur d\'usine', isHome ? '✓ Accueil 2008 GT est ton écran d\'accueil' : 'Pas encore : choisis-le comme écran d\'accueil Android', chipBtn(p, 'open:home', 'Choisir', !isHome))}
      ${setRow(p, 'Écran d\'accueil de l\'autoradio (menu usine)', '', chipBtn(p, 'open:qflauncher', 'Ouvrir'))}
      ${setRow(p, 'Démarrage automatique au contact', A && A.canAutoStart && A.canAutoStart() ? 'Activé ✓' : 'À activer', chipBtn(p, 'open:overlay', 'Régler'))}`; }],
    ['Autorisations', (p) => `${setRow(p, 'Musique et pochettes', A && A.notifAccess && A.notifAccess() ? 'Activé ✓' : 'À activer', chipBtn(p, 'open:notif', 'Régler'))}${setRow(p, 'Localisation (GPS)', '', chipBtn(p, 'open:location', 'Régler'))}${setRow(p, 'Toutes les autorisations de l\'appli', '', chipBtn(p, 'open:app', 'Ouvrir'))}`],
    ['Sauvegarde', (p) => { const b = lastBackup(); return `${setRow(p, 'Sauvegarde automatique', 'Avant chaque mise à jour et une fois par jour : pages, widgets, thème, fonds, raccourcis, trajets, carnet.', togBtn(p, 'tg:autoBackup:1', store.get('autoBackup', true)))}
      ${setRow(p, 'Dernière sauvegarde', b ? `${fmtDate(b.ts)} ${fmtTime(b.ts)} · version ${b.ver}` : 'Aucune', chipBtn(p, 'bakNow', 'Sauvegarder maintenant', true) + (b ? chipBtn(p, 'bakRestore', 'Restaurer') : ''))}
      ${setRow(p, 'Exporter', 'Copie le texte ci-dessous et garde-le (notes, e-mail). Indispensable avant de désinstaller l\'appli.', chipBtn(p, 'bakExport', 'Afficher le texte') + chipBtn(p, 'bakCopy', 'Copier'))}
      ${setRow(p, 'Importer', 'Colle un texte exporté puis appuie sur Importer.', chipBtn(p, 'bakImport', 'Importer'))}
      <textarea id="bakText" style="${fld(p, 'height:120px;padding:10px;font:12px monospace')}" placeholder="Texte de sauvegarde">${esc(setText)}</textarea>`; }]
  ]],
  ['Mises à jour', [
    ['Version', (p) => `<div style="display:flex;gap:14px;align-items:center;${box(p, 'padding:14px 18px')}"><div style="flex:1"><div style="font-size:13px;color:${p.mut}">Installée</div><div style="font-size:28px;font-weight:700">${APP_VERSION}</div></div><div style="flex:1"><div style="font-size:13px;color:${p.mut}">Sur GitHub</div><div style="font-size:28px;font-weight:700;color:${updInfo && verNum(updInfo.version) > verNum(APP_VERSION) ? '#5DCAA5' : p.txt}">${updInfo ? esc(updInfo.version) : '—'}</div></div>${updInfo && verNum(updInfo.version) > verNum(APP_VERSION) ? chipBtn(p, 'updGet', 'Télécharger la ' + esc(updInfo.version), true) : chipBtn(p, 'updCheck', 'Vérifier maintenant', true)}</div>
      <div style="font-size:14px;margin:8px 2px;color:${p.mut}">${esc(updMsg)}</div>
      ${setRow(p, 'Vérifier automatiquement', 'Au démarrage puis toutes les 6 h.', togBtn(p, 'tg:updAuto:1', store.get('updAuto', true)))}
      ${setRow(p, 'Dépôt GitHub', 'Fichier version.json à la racine de la branche main.', `<input data-set="updRepo" value="${esc(store.get('updRepo', 'Roudousa-67/accueil2008'))}" style="${fld(p, 'width:320px')}">`)}
      <div style="font-size:13px;color:${p.mut};margin-top:8px">Android demande toujours de toucher « Installer » : une appli ne peut pas se mettre à jour toute seule sans ton accord. Tes réglages sont sauvegardés avant.</div>`],
    ['Nouveautés et historique', (p) => CHANGELOG.map(([v, d, l], i) => `<div style="${box(p, 'padding:12px 16px;margin-bottom:10px')}"><div style="display:flex;gap:10px;align-items:center"><b style="font-size:18px">Version ${v}</b>${i === 0 ? `<span style="background:#1d3b22;color:#7EE787;border-radius:6px;padding:2px 8px;font-size:12px;font-weight:700">INSTALLÉE</span>` : ''}<span style="color:${p.mut};font-size:13px">${d}</span></div><ul style="margin:8px 0 0;padding-left:20px;line-height:1.6;font-size:14px">${l.map((x) => `<li>${x}</li>`).join('')}</ul></div>`).join('')]
  ]],
  ['À propos', [
    ['À propos', (p) => `<div style="display:flex;align-items:center;gap:18px;${box(p, 'padding:18px 20px')}"><div style="width:72px;height:72px;border-radius:18px;background:${p.acc};color:${p.onAcc};display:flex;align-items:center;justify-content:center">${ic('car', 40, p.onAcc)}</div><div><div style="font-size:24px;font-weight:700">Accueil 2008 GT</div><div style="font-size:15px;color:${p.mut}">Version ${APP_VERSION} · fr.gtline.accueil2008</div><div style="font-size:17px;font-weight:600;margin-top:4px;color:${p.acc}">by ${APP_AUTHOR}</div></div></div>
      ${setRow(p, 'Pour', 'Peugeot 2008 GT Line · autoradio Android', '')}
      ${setRow(p, 'Modèle 3D', '« 2018 Peugeot 2008 » par tonielpro520 (Sketchfab), licence CC BY 4.0', '')}
      ${setRow(p, 'Données', 'Météo open-meteo.com · cartes OpenFreeMap / OpenStreetMap · prix carburants prix-carburants.gouv.fr', '')}`]
  ]]
];
const SETICONS = ['gear', 'grid', 'car', 'nav', 'target', 'work', 'home', 'gear', 'target', 'target'];
function pageSettings(p) {
  if(window.Settings720 && Settings720.active()) return pageFrame(p,Settings720.toolbar(p)+Settings720.results(p));
  setCat = Math.min(setCat, SETCATS.length - 1); const [cn, subs] = SETCATS[setCat]; setSub = Math.min(setSub, subs.length - 1);
  const side = SETCATS.map(([n, s], i) => `<button data-act="scat:${i}:0" style="display:flex;align-items:center;gap:10px;width:100%;text-align:left;min-height:48px;padding:0 14px;border-radius:12px;font-size:15px;font-weight:600;${i === setCat ? `background:${p.acc};color:${p.onAcc}` : `color:${p.txt}`}">${n}</button>${i === setCat && s.length > 1 ? `<div style="margin:2px 0 6px 18px;border-left:2px solid ${p.card2};padding-left:8px;display:flex;flex-direction:column">${s.map(([sn], j) => `<button data-act="scat:${i}:${j}" style="text-align:left;height:38px;padding:0 10px;border-radius:8px;font-size:14px;${j === setSub ? `background:${p.card2};color:${p.txt};font-weight:600` : `color:${p.mut}`}">${sn}</button>`).join('')}</div>` : ''}`).join('');
  const tabsRow = subs.length > 1 ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">${subs.map(([sn], j) => chipBtn(p, `scat:${setCat}:${j}`, sn, j === setSub)).join('')}</div>` : '';
  let body = ''; try { body = subs[setSub][1](p); } catch (e) { body = `<div style="color:#FF6B6B">Erreur : ${esc(e.message)}</div>`; }
  return pageFrame(p, `${window.Settings720?Settings720.toolbar(p):''}<div style="display:grid;grid-template-columns:300px minmax(0,1fr);gap:12px;flex:1;min-height:0">
    <div class="scroll" data-settings-scroll="side" style="${card(p, 'padding:12px 10px;display:flex;flex-direction:column;gap:2px')}"><div style="font-size:24px;font-weight:700;padding:4px 10px 10px">Paramètres</div>${side}</div>
    <div style="${card(p, 'padding:14px 18px;display:flex;flex-direction:column;min-height:0')}"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><div style="font-size:20px;font-weight:700">${cn}${subs.length > 1 ? ` <span style="color:${p.mut};font-weight:500">› ${subs[setSub][0]}</span>` : ''}</div>${chipBtn(p, 'tab:home', 'Fermer')}</div>${tabsRow}<div class="scroll" data-settings-scroll="body" style="flex:1;min-height:0;padding-right:6px">${body}</div></div></div>`);
}
function openSet(cat, sub) { const ci = SETCATS.findIndex(([n]) => n === cat); setCat = ci < 0 ? 0 : ci; setSub = 0; if (sub) { const si = SETCATS[setCat][1].findIndex(([n]) => n === sub); setSub = si < 0 ? 0 : si; } closeOverlays(); tab = 'settings'; render(); }
function bindSettings() {
  document.querySelectorAll('#screen [data-set]').forEach((el) => el.addEventListener('change', () => {
    const k = el.dataset.set, v = el.value.trim();
    if (k.startsWith('prof:')) { const l = store.get('profiles', DEFAULT_PROFILES).slice(); l[+k.slice(5)] = v; store.set('profiles', l); }
    else store.set(k, v);
    toast('Enregistré');
  }));
  const wf = $('wallFile'); if (wf) wf.addEventListener('change', () => { const f = wf.files && wf.files[0]; if (f) importWallPhoto(f); });
  const cf = $('carImgFile'); if (cf) cf.addEventListener('change', () => { const f = cf.files && cf.files[0]; if (f) importCarImage(f); });
  const ap = $('accPick'); if (ap) ap.addEventListener('input', () => { $('accHex').value = ap.value; });
  const imgs = Array.from(document.querySelectorAll('#screen img[data-wall]')); let i = 0;
  const step = () => { if (tab !== 'settings') return; for (let k = 0; k < 4 && i < imgs.length; k++, i++) { const w = WALLS.find((x) => x.id === imgs[i].dataset.wall); if (!w) continue; if (!thumbCache[w.id]) thumbCache[w.id] = drawWall(w, 192, 108); imgs[i].src = thumbCache[w.id]; } if (i < imgs.length) setTimeout(step, 20); };
  step();
}
const thumbCache = {};

// ---------- rendu ----------
const _render = window.render;
window.render = function () {
  if (tab === 'themes') { tab = 'settings'; setCat = 0; setSub = 0; }
  if (tab === 'eco') { tab = 'trips'; tripSub = 'eco'; }
  if (tab === 'settings') {
    const p = palette(); curP = p;
    const st = $('stage');
    st.style.background = p.bgCss; st.style.color = p.txt;
    st.style.fontFamily = (p.font === 'Inter' ? 'Inter' : `'${p.font}',Inter`) + ',Roboto,sans-serif';
    $('mapHold').appendChild($('map'));
    $('screen').innerHTML = pageSettings(p);
    if (window.Car3D) Car3D.detach();
    bindSettings(); paint();
  } else _render();
  const scr = $('screen');
  if (grpEd != null && tab === 'home') scr.insertAdjacentHTML('beforeend', grpEditor(curP));
  if (wxOpen) scr.insertAdjacentHTML('beforeend', `<div data-act="wxClose" style="position:absolute;inset:0;z-index:1600;background:#000b;display:flex;align-items:center;justify-content:center"><div data-act="ge:noop" style="width:1180px;max-height:640px;${card(curP, 'padding:20px 24px;display:flex;flex-direction:column;gap:12px')};background:${hex7(curP.card)};color:${curP.txt}"><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-size:22px;font-weight:700">Météo</div><div style="display:flex;gap:8px">${chipBtn(curP, 'wxNow', 'Actualiser')}${chipBtn(curP, 'wxClose', 'Fermer', true)}</div></div>${wxPanel(curP)}</div></div>`);
  paint();
};

// ---------- valeurs en direct ----------
const _paint = window.paint;
window.paint = function () {
  _paint();
  const p = curP; if (!p) return;
  const now = new Date(), c = clk();
  setK('clk2', clockTxt(c, now)); setK('date2', dateTxt(c, now));
  setH('wDays', weather && weather.days && weather.days.length > 1 ? weather.days.slice(1, 4).map((d) => `${['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'][new Date(d.t + 'T12:00').getDay()].replace('.', '')} ${Math.round(d.max)}°`).join(' · ') : '');
  document.querySelectorAll('#screen [data-k2="sys"]').forEach((e) => { const h = sysHtml(p); if (e.innerHTML !== h) e.innerHTML = h; });
};

// ---------- actions ----------
const _act = window.act;
window.act = function (a, long) {
  const k = a.split(':')[0], v = a.slice(a.indexOf(':') + 1), parts = v.split(':');
  switch (k) {
    case 'gear': openSet('Affichage et personnalisation'); return;
    case 'tab': if (v === 'themes') { openSet('Affichage et personnalisation', 'Thèmes'); return; } if (v === 'eco') { tripSub = 'eco'; tab = 'trips'; render(); return; } grpEd = null; wxOpen = false; break;
    case 'tsub': tripSub = v; tab = 'trips'; render(); return;
    case 'cdays': chartDays = +v; render(); return;
    case 'scat': setCat = +parts[0]; setSub = +parts[1]; render(); return;
    case 'sys': sysOpen(v); return;
    case 'set': if (v === 'clock') openSet('Affichage et personnalisation', 'Heure et date'); else if (v === 'net') openSet('Affichage et personnalisation', 'Barre du haut'); return;
    case 'profNext': if (long) { openSet('Profils'); return; } { const n = (profIdx() + 1) % 3; store.set('profile', n); render(); toast('Profil ' + profiles()[n]); } return;
    case 'prof': store.set('profile', +v); render(); return;
    case 'clk': { const c = pv('clk', {}); const [kk, vv] = parts; c[kk] = kk === 'h12' || kk === 'sec' || kk === 'year' ? vv === '1' : vv === '-' ? '' : vv; setPv('clk', c); render(); return; }
    case 'tg': { const [kk, def] = parts; store.set(kk, !store.get(kk, def === '1')); render(); return; }
    case 'wall': setPv('wall', v); render(); return;
    case 'wallPick': { const f = $('wallFile'); if (f) f.click(); return; }
    case 'wallDim': setPv('wallDim', +v); render(); return;
    case 'carView': store.set('carView', v); render(); return;
    case 'dockN': store.set('dockN', Math.max(3, Math.min(DOCK_ALL.length, store.get('dockN', DOCK_ALL.length) + (+v)))); render(); return;
    case 'assign': { const it = DOCK_ALL.find((d) => d.id === v); if (it) openDrawer(it); return; }
    case 'fuel': store.set('fuel', v); station = null; updateStation(true); render(); return;
    case 'tol': store.set('tol', v); render(); return;
    case 'wxEvery': store.set('wxEvery', +v); render(); return;
    case 'wxNow': updateWeather(true); toast('Météo en cours d\'actualisation'); return;
    case 'wxDetail': wxOpen = true; render(); return;
    case 'wxClose': wxOpen = false; render(); return;
    case 'ge': geAct(parts[0], parts[1]); return;
    case 'canNow': store.set('canReport', canReport()); render(); return;
    case 'carapp': launchCarApp(+v); return;
    case 'bakNow': saveBackup(false); render(); return;
    case 'bakRestore': restoreFrom(lastBackup()); return;
    case 'bakExport': setText = JSON.stringify(snapshot()); render(); return;
    case 'bakCopy': { setText = JSON.stringify(snapshot()); render(); const t = $('bakText'); if (t) { t.select(); try { document.execCommand('copy'); toast('Copié'); } catch (e) { toast('Sélectionne le texte et copie-le'); } } return; }
    case 'bakImport': { const t = $('bakText'); try { restoreFrom(JSON.parse(t.value)); } catch (e) { toast('Texte de sauvegarde invalide'); } return; }
    case 'updCheck': checkUpdate(true); return;
    case 'updGet': if (updInfo && updInfo.apk) { saveBackup(true); if (!A || !A.openUrl(updInfo.apk)) toast('Lien : ' + updInfo.apk); } return;
    case 'calib': grpEd = null; break;
    case 'theme': case 'acc': case 'accCustom': case 'accReset': case 'solid': case 'grad': case 'gradCustom': case 'layout': case 'dockpos': case 'bgReset': case 'toggleGlass': case 'toggleNight': case 'toggleAutoStack': case 'carPick':
      if (k === 'solid' || k === 'grad' || k === 'gradCustom' || k === 'bgReset') setPv('wall', '');
      _act(a, long); return;
  }
  _act(a, long);
};

// ================= v4.1 : autonomie, position, plan d'entretien =================
// Autonomie : sur PSA la vraie valeur est aux octets 26-27 du paquet voiture (pas 18-19)
const _onCar = window.onCar;
window.onCar = function (o) {
  try {
    const q = A && A.qfStatus ? JSON.parse(A.qfStatus()) : null, h = q && q.last;
    if (h && h.length >= 52) { const v = parseInt(h.substr(48, 4), 16); if (v > 0 && v < 65535) o.range = v / 10; else if (!(o.range > 0 && o.range < 2000)) o.range = -1; }
    else if (o.range > 1500) o.range = -1;
  } catch (e) {}
  _onCar(o);
};

// ----- Widget « Où suis-je » -----
ICON.check = 'M5 12.5l4.5 4.5L19 7';
ICON.pin = 'M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z';
[0, 1, 2].forEach((i) => { if (store.get('whereGone_' + i, false)) return; const g = store.get('grid_' + i, null); if (g && g.items && store.get('whereAdded_' + i, false)) { g.items.forEach((it) => { if (it.b.length > 1) it.b = it.b.filter((x) => x !== 'where'); }); store.set('grid_' + i, g); } store.set('whereGone_' + i, true); });
let geoA = null, geoAt = 0;
window.updatePlace = async function () {
  if (!loc || DEMO || Date.now() - geoAt < 15e3) return;
  geoAt = Date.now(); placeAt = Date.now();
  try {
    const a = (await getJSON(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${loc.lat.toFixed(6)}&lon=${loc.lon.toFixed(6)}&zoom=18&addressdetails=1&accept-language=fr`)).address || {};
    geoA = { num: a.house_number || '', road: a.road || a.pedestrian || a.footway || a.path || a.neighbourhood || '', quarter: a.suburb || a.quarter || a.neighbourhood || '', city: a.city || a.town || a.village || a.municipality || '', cp: a.postcode || '', dep: a.county || a.state_district || '', reg: a.state || '' };
    place = [geoA.road, geoA.city].filter(Boolean).join(', ') || 'Position GPS';
    if (geoA.city) city = geoA.city;
    if (tab === 'home') paint();
  } catch (e) { geoAt = Date.now() - 10e3; }
};
const dms = (v, pos, neg) => { const a = Math.abs(v), d = Math.floor(a), m = (a - d) * 60, mm = Math.floor(m), ss = ((m - mm) * 60).toFixed(1); return `${d}°${String(mm).padStart(2, '0')}'${ss.padStart(4, '0')}" ${v >= 0 ? pos : neg}`; };
function whereHtml(p, big) {
  const g = geoA || {}, ok = loc && Date.now() - loc.ts < 60e3;
  const c = g.city || (city || (ok ? 'Recherche…' : 'GPS en attente'));
  const street = [g.num, g.road].filter(Boolean).join(' ') || (ok ? 'Rue inconnue' : '—');
  const sub = [g.cp, g.quarter && g.quarter !== g.road ? g.quarter : '', g.dep].filter(Boolean).join(' · ');
  const co = ok ? `${loc.lat.toFixed(5)}, ${loc.lon.toFixed(5)}` : '—';
  const extra = ok ? [loc.acc > 0 ? `±${Math.round(loc.acc)} m` : '', loc.alt > -9000 ? `alt. ${Math.round(loc.alt)} m` : ''].filter(Boolean).join(' · ') : '';
  return `<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:${p.mut}">${ic('pin', 14, p.acc, 2.4)}<span>Je suis à</span></div>
    <div style="font-size:${big ? 30 : 24}px;font-weight:700;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(c)}</div>
    <div style="font-size:${big ? 18 : 15}px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(street)}</div>
    ${sub ? `<div style="font-size:12px;color:${p.mut};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(sub)}</div>` : ''}
    <div style="font-size:12.5px;color:${p.mut};font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${co}${big && ok ? ` · ${dms(loc.lat, 'N', 'S')} ${dms(loc.lon, 'E', 'O')}` : ''}${extra ? ' · ' + extra : ''}</div>`;
}
GBLOCKS.where = { n: 'Ville + rue + position', r: (p, w, h) => `<button data-act="whereShare" style="${card(p, 'padding:10px 14px;display:flex;flex-direction:column;justify-content:center;gap:2px;text-align:left;width:100%;height:100%;color:inherit')}"><div data-k="whereBox"${w >= 2 && h >= 2 ? ' data-big="1"' : ''} style="display:flex;flex-direction:column;gap:2px;min-width:0">${whereHtml(p, w >= 2 && h >= 2)}</div></button>` };

// ----- Plan d'entretien constructeur (Peugeot 2008 1.2 PureTech) -----
// km / mois en usage normal, puis en usage sévère (ville, trajets courts, remorque, poussière)
const PLAN = [
  { id: 'rev', n: 'Révision + vidange + filtre à huile', km: 15000, mo: 12, kmS: 10000, moS: 12, m: ['Vidange', 'Révision'], d: 'Huile 0W-30 norme PSA B71 2312 (ou 0W-20 B71 2010 sur moteurs récents). Carnet d\'origine : 25 000 km / 1 an, Peugeot conseille désormais plus court sur PureTech.' },
  { id: 'belt', n: 'Contrôle courroie de distribution (humide)', km: 30000, mo: 24, kmS: 20000, moS: 12, m: ['Révision', 'Courroie'], d: 'Contrôle de l\'usure de la courroie qui baigne dans l\'huile. À faire au garage avec l\'outil de mesure.' },
  { id: 'dist', n: 'Remplacement kit de distribution', km: 100000, mo: 72, kmS: 100000, moS: 72, m: ['Courroie'], d: 'PureTech : 100 000 km ou 6 ans (au premier atteint). Avec la pompe à vide si le garage le recommande.' },
  { id: 'acc', n: 'Courroie d\'accessoires', km: 100000, mo: 72, kmS: 100000, moS: 72, m: ['Courroie'], d: 'Souvent changée en même temps que la distribution.' },
  { id: 'air', n: 'Filtre à air', km: 50000, mo: 48, kmS: 30000, moS: 48, m: ['Filtres'], d: '' },
  { id: 'hab', n: 'Filtre d\'habitacle (pollen)', km: 25000, mo: 24, kmS: 15000, moS: 12, m: ['Filtres', 'Climatisation'], d: 'Constructeur : 2 ans ; conseillé chaque année si allergies.' },
  { id: 'plug', n: 'Bougies d\'allumage', km: 50000, mo: 48, kmS: 30000, moS: 48, m: ['Bougies'], d: '' },
  { id: 'brake', n: 'Liquide de frein', km: 0, mo: 24, kmS: 0, moS: 24, m: ['Freins', 'Liquide de frein'], d: 'Tous les 2 ans, quel que soit le kilométrage.' },
  { id: 'cool', n: 'Liquide de refroidissement (contrôle)', km: 50000, mo: 48, kmS: 30000, moS: 48, m: ['Révision', 'Liquide de refroidissement'], d: 'Contrôle du niveau et du pH ; remplacement si besoin.' },
  { id: 'pads', n: 'Plaquettes et disques (contrôle)', km: 20000, mo: 12, kmS: 15000, moS: 12, m: ['Freins', 'Révision'], d: 'Contrôle d\'usure à chaque révision.' },
  { id: 'clim', n: 'Climatisation (entretien)', km: 0, mo: 24, kmS: 0, moS: 24, m: ['Climatisation'], d: 'Recharge et désinfection conseillées tous les 2 ans.' },
  { id: 'bat', n: 'Batterie (contrôle)', km: 0, mo: 12, kmS: 0, moS: 12, m: ['Batterie', 'Révision'], d: 'Test de charge à chaque hiver, surtout après 4 ans.' },
  { id: 'tyre', n: 'Pneus (usure)', km: 10000, mo: 6, kmS: 10000, moS: 6, m: ['Pneus'], d: 'Témoin d\'usure légal 1,6 mm.' },
  { id: 'press', n: 'Pression des pneus', km: 0, mo: 1, kmS: 0, moS: 1, m: ['Pression pneus'], d: '' },
  { id: 'fuelf', n: 'Filtre à carburant', km: 60000, mo: 72, kmS: 60000, moS: 72, m: ['Filtres'], d: 'Sur le 1.2 PureTech essence, il est souvent intégré au module de pompe dans le réservoir : à confirmer avec ton garage.' },
  { id: 'ct', n: 'Contrôle technique', km: 0, mo: 24, kmS: 0, moS: 24, m: ['Contrôle technique'], d: 'Premier à 4 ans, puis tous les 2 ans.' }
];
['Bougies', 'Liquide de frein', 'Liquide de refroidissement'].forEach((t) => { if (!SERVICE_TYPES.includes(t)) SERVICE_TYPES.splice(SERVICE_TYPES.length - 2, 0, t); });
const addMonths = (d, n) => { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; };
function kmNow() {
  const o = car && val(car.odo); if (o) return Math.round(o);
  const m = +store.get('odoManual', 0), at = +store.get('odoManualAt', 0); if (!m) return null;
  return Math.round(m + tripsHistory().filter((t) => t.start > at).reduce((s, t) => s + (t.dist || 0), 0));
}
function planRows() {
  const sev = store.get('planSevere', false), now = kmNow(), reg = store.get('regDate', '');
  const log = store.get('serviceLog', []);
  return PLAN.map((it) => {
    const km = sev ? it.kmS : it.km, mo = sev ? it.moS : it.mo;
    const mine = log.filter((e) => e.plan === it.id || (!e.plan && it.m.includes(e.type) && (it.id !== 'dist' && it.id !== 'acc' || /distri|accessoire|courroie/i.test(e.type + ' ' + (e.note || ''))))).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const last = mine[0];
    let baseD = last && last.date ? last.date : reg, baseK = last ? +last.km || 0 : 0;
    let dueD = null, dueK = null;
    if (it.id === 'ct' && !last && reg) dueD = addMonths(reg, 48);
    else if (baseD && mo) dueD = addMonths(baseD, mo);
    if (km) dueK = (last || reg || now != null) ? baseK + km : null;
    const days = dueD ? Math.ceil((dueD - new Date()) / 864e5) : null, left = dueK != null && now != null ? dueK - now : null;
    const st = (days != null && days < 0) || (left != null && left < 0) ? 'late' : (days != null && days < 45) || (left != null && left < 1500) ? 'soon' : (dueD || dueK != null) ? 'ok' : 'unk';
    const st2 = !last && st === 'late' && it.id !== 'ct' ? 'chk' : st;
    return { it, km, mo, last, n: mine.length, dueD, dueK, days, left, st: st2 };
  });
}
const planInt = (r) => [r.km ? r.km.toLocaleString('fr-FR') + ' km' : '', r.mo ? (r.mo % 12 ? r.mo + ' mois' : (r.mo / 12) + (r.mo === 12 ? ' an' : ' ans')) : ''].filter(Boolean).join(' ou ');
const planDue = (r) => [r.dueK != null ? r.dueK.toLocaleString('fr-FR') + ' km' : '', r.dueD ? fmtDate(r.dueD) : ''].filter(Boolean).join(' ou ') || 'Indique la date de mise en circulation';
const planLeft = (r) => r.st === 'chk' ? 'À vérifier : pas dans ton carnet' : r.st === 'late' ? 'En retard' : [r.left != null ? `dans ${r.left.toLocaleString('fr-FR')} km` : '', r.days != null ? `dans ${r.days} j` : ''].filter(Boolean).join(' · ') || '—';
function planText() {
  const rows = planRows(), now = kmNow();
  return `Plan d'entretien Peugeot 2008 GT Line (1.2 PureTech)\nUsage : ${store.get('planSevere', false) ? 'sévère' : 'normal'}${now ? ` · compteur ${now.toLocaleString('fr-FR')} km` : ''} · ${fmtDate(Date.now())}\n\n` +
    rows.map((r) => `• ${r.it.n}\n   Tous les ${planInt(r)} — prochaine : ${planDue(r)} (${planLeft(r)})${r.last ? `\n   Dernière : ${r.last.date ? fmtDate(r.last.date) : ''}${r.last.km ? ' à ' + Number(r.last.km).toLocaleString('fr-FR') + ' km' : ''}` : ''}`).join('\n') +
    `\n\nRègle : faire l'opération au premier des deux termes atteint (km ou durée).\nIntervalles d'après le plan constructeur Peugeot 1.2 PureTech et les recommandations actuelles. Vérifie avec ton carnet d'entretien ou ton garage Peugeot.\n\nEnvoyé depuis Accueil 2008 GT ${APP_VERSION} — by Roudoussa 67`;
}
function pagePlan(p) {
  const rows = planRows(), now = kmNow(), sev = store.get('planSevere', false);
  const col = { late: '#E24B4A', soon: '#EF9F27', ok: '#5DCAA5', unk: p.mut, chk: '#6FA8FF' };
  const list = rows.map((r) => `<div style="display:grid;grid-template-columns:14px minmax(0,2.3fr) minmax(0,1.1fr) minmax(0,1.5fr) minmax(0,1.1fr);gap:10px;align-items:center;padding:10px 12px;border-bottom:1px solid ${p.card2}">
    <span style="width:12px;height:12px;border-radius:50%;background:${col[r.st]}"></span>
    <div style="min-width:0"><div style="font-size:15px;font-weight:600">${r.it.n}</div>${r.it.d ? `<div style="font-size:12px;color:${p.mut};line-height:1.3">${r.it.d}</div>` : ''}</div>
    <div style="font-size:13.5px">${planInt(r)}</div>
    <div style="font-size:13.5px;font-weight:600">${planDue(r)}${r.last ? `<div style="font-size:12px;color:${p.mut};font-weight:400">fait le ${r.last.date ? fmtDate(r.last.date) : '?'}</div>` : ''}</div>
    <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-start"><div style="font-size:13.5px;font-weight:700;color:${col[r.st]}">${planLeft(r)}</div><button data-act="planDo:${r.it.id}" style="height:34px;padding:0 12px;border-radius:9px;font-size:13px;font-weight:700;background:${planEdit === r.it.id ? p.card2 : p.acc};color:${planEdit === r.it.id ? p.txt : p.onAcc}">${ic('check', 14, 'currentColor', 3)} Valider</button></div></div>
    ${planEdit === r.it.id ? `<div style="display:grid;grid-template-columns:1fr 1fr 1fr 2fr auto auto;gap:8px;align-items:end;padding:10px 12px 12px 36px;background:${p.card2};border-bottom:1px solid ${p.card}">
      <label style="font-size:12px;color:${p.mut}">Fait le<input id="pfDate" type="date" value="${dayKey(Date.now())}" style="${fld(p, 'margin-top:4px;background:' + p.card)}"></label>
      <label style="font-size:12px;color:${p.mut}">À (km)<input id="pfKm" type="number" value="${kmNow() || ''}" placeholder="km compteur" style="${fld(p, 'margin-top:4px;background:' + p.card)}"></label>
      <label style="font-size:12px;color:${p.mut}">Prix (€)<input id="pfCost" type="number" step="0.01" style="${fld(p, 'margin-top:4px;background:' + p.card)}"></label>
      <label style="font-size:12px;color:${p.mut}">Garage, note<input id="pfNote" placeholder="Garage, pièces…" style="${fld(p, 'margin-top:4px;background:' + p.card)}"></label>
      ${smallBtn(p, 'planOk:' + r.it.id, 'Enregistrer', true)}${smallBtn(p, 'planDo:', 'Annuler')}</div>
      ${r.n ? `<div style="padding:0 12px 10px 36px;background:${p.card2};font-size:12.5px;color:${p.mut}">Historique : ${store.get('serviceLog', []).filter((e) => e.plan === r.it.id || (!e.plan && r.it.m.includes(e.type))).sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 5).map((e) => `${e.date ? fmtDate(e.date) : '?'}${e.km ? ' · ' + Number(e.km).toLocaleString('fr-FR') + ' km' : ''}${e.cost ? ' · ' + e.cost + ' €' : ''}`).join(' — ')}</div>` : ''}` : ''}`).join('');
  const late = rows.filter((r) => r.st === 'late').length, soon = rows.filter((r) => r.st === 'soon').length;
  const side = `<div class="scroll colns" style="${card(p, 'padding:12px 16px;display:flex;flex-direction:column;gap:10px;overflow-y:auto;min-height:0')}">${h2(p, 'Ma 2008')}
    <label style="font-size:12px;color:${p.mut}">1re mise en circulation<input id="pReg" type="date" value="${esc(store.get('regDate', ''))}" style="${fld(p, 'margin-top:4px')}"></label>
    <label style="font-size:12px;color:${p.mut}">Kilométrage actuel${car && val(car.odo) ? ' (lu par la voiture)' : ''}<input id="pOdo" type="number" value="${now || ''}" placeholder="ex. 84500" style="${fld(p, 'margin-top:4px')}"></label>
    <label style="font-size:12px;color:${p.mut}">Mon adresse e-mail<input id="pMail" type="email" value="${esc(store.get('mailTo', ''))}" placeholder="moi@exemple.fr" style="${fld(p, 'margin-top:4px')}"></label>
    ${smallBtn(p, 'planSave', 'Enregistrer', true)}
    <div style="display:flex;justify-content:space-between;align-items:center;font-size:14px;font-weight:600">Usage sévère ${togBtn(p, 'tg:planSevere:0', sev)}</div>
    <div style="font-size:12px;color:${p.mut};line-height:1.35">Sévère : surtout en ville, trajets courts, remorque, routes poussiéreuses.</div>
    <div style="${box(p, 'padding:10px 12px;font-size:14px;font-weight:600')}"><span style="color:#E24B4A">${late} en retard</span> · <span style="color:#EF9F27">${soon} bientôt</span><div style="font-size:12px;color:${p.mut};font-weight:400;margin-top:4px">Ajoute tes factures dans « Mon carnet » : le plan se recale tout seul.</div></div>
    ${smallBtn(p, 'planMail', 'Envoyer par e-mail', true)}${smallBtn(p, 'planPdf', 'Enregistrer en PDF')}</div>`;
  return pageFrame(p, `<div style="display:grid;grid-template-columns:300px minmax(0,1fr);gap:12px;flex:1;min-height:0">${side}
    <div style="${card(p, 'padding:12px 4px 4px;display:flex;flex-direction:column;min-height:0')}"><div style="padding:0 12px">${h2(p, 'Entretiens à faire — Peugeot 2008 1.2 PureTech', `<span style="font-size:12px;color:${p.mut}">Au premier des deux termes atteint</span>`)}</div>
    <div style="display:grid;grid-template-columns:14px minmax(0,2.3fr) minmax(0,1.1fr) minmax(0,1.5fr) minmax(0,1.1fr);gap:10px;padding:0 12px 6px;font-size:12px;color:${p.mut}"><span></span><span>Opération</span><span>Intervalle</span><span>Prochaine fois</span><span>Reste</span></div>
    <div class="scroll" style="flex:1">${list}</div></div></div>`);
}
function planPrintHtml() {
  const rows = planRows(), now = kmNow();
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Plan d'entretien 2008 GT Line</title><style>body{font:13px Arial,sans-serif;color:#111;margin:24px}h1{font-size:20px;margin:0}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border-bottom:1px solid #ccc;padding:6px;text-align:left;vertical-align:top}th{background:#f2f2f2}.late{color:#c0221f;font-weight:bold}.chk{color:#2a5db0}.soon{color:#b86e00;font-weight:bold}small{color:#666}</style></head><body>
<h1>Plan d'entretien — Peugeot 2008 GT Line (1.2 PureTech)</h1><div>${fmtDate(Date.now())} · usage ${store.get('planSevere', false) ? 'sévère' : 'normal'}${now ? ' · compteur ' + now.toLocaleString('fr-FR') + ' km' : ''}</div>
<table><tr><th>Opération</th><th>Intervalle</th><th>Prochaine fois</th><th>Reste</th></tr>${rows.map((r) => `<tr><td><b>${r.it.n}</b><br><small>${r.it.d}</small></td><td>${planInt(r)}</td><td>${planDue(r)}</td><td class="${r.st}">${planLeft(r)}</td></tr>`).join('')}</table>
<p><small>Faire l'opération au premier des deux termes atteint. Vérifie avec ton carnet ou ton garage Peugeot. — Accueil 2008 GT ${APP_VERSION}, by Roudoussa 67</small></p></body></html>`;
}
let planEdit = '';
const _pageService = window.pageService;
window.pageService = function (p) { return svcSub === 'plan' ? pagePlan(p) : _pageService(p); };

const _act41 = window.act;
window.act = function (a, long) {
  const k = a.split(':')[0], v = a.slice(a.indexOf(':') + 1);
  switch (k) {
    case 'ssub': svcSub = v; tab = 'service'; render(); return;
    case 'planDo': planEdit = planEdit === v ? '' : v; render(); return;
    case 'planOk': {
      const it = PLAN.find((x) => x.id === v); if (!it) return;
      const d = $('pfDate'), km = $('pfKm'), co = $('pfCost'), no = $('pfNote');
      const log = store.get('serviceLog', []);
      log.push({ date: d && d.value || dayKey(Date.now()), type: it.m[0], km: km && km.value ? +km.value : '', cost: co && co.value ? co.value : '', note: [it.n, no && no.value].filter(Boolean).join(' — '), plan: it.id });
      store.set('serviceLog', log);
      if (km && km.value && !(car && val(car.odo)) && +km.value >= (kmNow() || 0)) { store.set('odoManual', +km.value); store.set('odoManualAt', Date.now()); }
      if (it.id === 'rev') { const nk = km && km.value ? +km.value + (store.get('planSevere', false) ? it.kmS : it.km) : ''; if (nk) store.set('oilKm', nk); }
      planEdit = ''; toast('Ajouté au carnet : ' + it.n); render(); return;
    }
    case 'planSave': {
      const r = $('pReg'), o = $('pOdo'), m = $('pMail');
      if (r) store.set('regDate', r.value);
      if (o && o.value && !(car && val(car.odo))) { store.set('odoManual', +o.value); store.set('odoManualAt', Date.now()); }
      if (m) store.set('mailTo', m.value.trim());
      toast('Enregistré'); render(); return;
    }
    case 'planMail': {
      const to = store.get('mailTo', '');
      const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent('Plan d\'entretien Peugeot 2008 GT Line')}&body=${encodeURIComponent(planText())}`;
      if (!A) { toast('Aperçu : ouvrirait ton appli e-mail'); return; }
      if (!A.openUrl(url)) toast('Aucune appli e-mail sur l\'autoradio'); return;
    }
    case 'planPdf': {
      const w = window.open('', '_blank');
      if (w) { w.document.write(planPrintHtml()); w.document.close(); setTimeout(() => { try { w.print(); } catch (e) {} }, 400); }
      else toast('Impression PDF non disponible : utilise « Envoyer par e-mail »');
      return;
    }
    case 'whereShare': {
      if (!loc) { toast('Position GPS en attente'); return; }
      const g = geoA || {}, t = `${[g.num, g.road].filter(Boolean).join(' ')}, ${g.cp || ''} ${g.city || ''} — ${loc.lat.toFixed(6)}, ${loc.lon.toFixed(6)}`;
      try { navigator.clipboard.writeText(t); } catch (e) {}
      toast(t); return;
    }
  }
  _act41(a, long);
};
const _paint41 = window.paint;
window.paint = function () { _paint41(); if (curP && tab === 'home') { const d0 = weather && weather.days && weather.days[0]; setK('wMinMax', d0 ? `${Math.round(d0.min)}-${Math.round(d0.max)}°C` : ''); const g = geoA || {}; const ad = [[g.num, g.road].filter(Boolean).join(' '), g.city].filter(Boolean).join(', '); setK('roadAddr', ad || (loc ? place : 'GPS en attente…')); } if (curP && tab === 'home') setH('whereBox', whereHtml(curP, !!document.querySelector('#screen [data-k="whereBox"][data-big]'))); };

// ================= Navi / DVR dans le cadre de la carte (fenêtre freeform) =================
const NAVI_PK = [['com.waze', 'Waze'], ['com.google.android.apps.maps', 'Google Maps'], ['com.here.app.maps', 'HERE WeGo'], ['net.osmand', 'OsmAnd'], ['com.sygic.aura', 'Sygic'], ['ru.yandex.yandexnavi', 'Yandex Navi'], ['com.tomtom.gplay.navapp', 'TomTom GO'], ['cz.aponia.bor3', 'Mapy.cz']];
let ffDlg = false;
function ffApps(kind) {
  const all = allApps();
  if (kind === 'dvr') {
    const l = all.filter((a) => /dvr|dashcam|recorder|enregistr|camera|caméra|行车|记录/i.test(a.l + ' ' + a.p) && !/backcar/.test(a.p)).map((a) => [a.p, a.l]);
    return l.length ? l : (DEMO ? [['com.qf.dvr', 'Enregistreur'], ['com.qf.backcar', 'Caméra de recul']] : []);
  }
  const l = NAVI_PK.filter(([pk], i) => (DEMO && i < 2) || all.some((a) => a.p === pk));
  all.forEach((a) => { if (/navi|gps|maps|waze/i.test(a.p) && !l.some((x) => x[0] === a.p)) l.push([a.p, a.l]); });
  return l;
}
function ffRect() {
  const el = document.querySelector('#screen .ffslot') || document.querySelector('#screen .mapslot'); if (!el) return null;
  const r = el.getBoundingClientRect(), k = window.devicePixelRatio || 1;
  return [Math.round(r.left * k), Math.round(r.top * k), Math.round(r.right * k), Math.round(r.bottom * k)];
}
function ffLaunch() {
  const kind = store.get('ffType', 'navi'), pk = store.get(kind === 'dvr' ? 'ffDvr' : 'ffNavi', kind === 'dvr' ? '' : 'com.waze');
  if (!pk) { ffDlg = true; render(); return; }
  const r = ffRect();
  if (!A) { toast(`Aperçu : ${pk} s'ouvrirait dans le cadre (${r ? r.join(', ') : '?'})`); return; }
  if (A.launchIn && r && A.launchIn(pk, r[0], r[1], r[2], r[3])) return;
  if (!A.launch(pk)) toast('Appli introuvable : ' + pk);
}
function ffDialog(p) {
  const kind = store.get('ffType', 'navi'), list = ffApps(kind), cur = store.get(kind === 'dvr' ? 'ffDvr' : 'ffNavi', kind === 'dvr' ? '' : 'com.waze');
  const radio = (k, l) => `<button data-act="ff:type:${k}" style="display:flex;align-items:center;gap:12px;height:48px;font-size:17px;font-weight:600;color:${p.txt}"><span style="width:22px;height:22px;border-radius:50%;border:2px solid ${kind === k ? '#3aa0ff' : p.mut};display:flex;align-items:center;justify-content:center">${kind === k ? '<span style="width:12px;height:12px;border-radius:50%;background:#3aa0ff"></span>' : ''}</span>${l}</button>`;
  const apps = list.length ? list.map(([pk, l]) => `<button data-act="ff:pick:${pk}" style="display:flex;align-items:center;gap:12px;height:54px;padding:0 12px;border-radius:12px;background:${cur === pk ? '#3aa0ff26' : p.card2};color:${p.txt};font-size:16px;font-weight:600;border:2px solid ${cur === pk ? '#3aa0ff' : 'transparent'}"><img data-icon="${pk}" alt="" style="width:34px;height:34px;border-radius:8px">${esc(l)}${cur === pk ? '<span style="margin-left:auto;color:#3aa0ff">●</span>' : ''}</button>`).join('') : `<div style="color:${p.mut};font-size:14px">Aucune appli ${kind === 'dvr' ? 'caméra / DVR' : 'GPS'} trouvée sur l'autoradio.</div>`;
  return `<div data-act="ff:close" style="position:absolute;inset:0;z-index:1700;background:#000a;display:flex;align-items:center;justify-content:center"><div data-act="ge:noop" style="width:720px;display:grid;grid-template-columns:1fr 1.2fr;gap:18px;padding:20px 22px;border-radius:18px;background:${hex7(p.card)};border:2px solid #3aa0ff;box-shadow:0 0 30px #3aa0ff55">
    <div><div style="font-size:18px;font-weight:700;margin-bottom:10px">Freeform display type selection</div>${radio('navi', 'Navi')}${radio('dvr', 'DVR')}
    <div style="font-size:12.5px;color:${p.mut};margin-top:10px;line-height:1.4">L'appli s'ouvre dans une fenêtre posée sur le cadre de la carte. Ton choix est gardé.</div></div>
    <div style="display:flex;flex-direction:column;gap:8px"><div style="font-size:14px;color:${p.mut}">${kind === 'dvr' ? 'Caméra / DVR' : 'Sélection GPS'}</div>${apps}
    <div style="display:flex;gap:8px;margin-top:6px">${smallBtn(p, 'ff:go', 'Lancer dans le cadre', true)}${smallBtn(p, 'ff:close', 'Fermer')}</div></div></div></div>`;
}
const _mapCard = window.mapCard;
window.mapCard = function (p, opts) {
  const g = p.light ? '#FFFFFFEB' : '#0E1116E0', gt = p.light ? '#16171A' : '#F2F2F4';
  const b = `<button data-act="ff:open" aria-label="Navi ou DVR dans le cadre" style="background:${g};color:${gt};border-radius:${Math.max(6, p.r - 8)}px;height:50px;padding:0 14px;display:flex;align-items:center;gap:8px;font-size:15px;font-weight:600"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><rect x="11" y="9" width="7" height="7" rx="1" fill="currentColor"/></svg>${store.get('ffType', 'navi') === 'dvr' ? 'DVR' : 'Cadre'}</button>`;
  return _mapCard(p, opts).replace('<div style="margin-left:auto">', `<div style="margin-left:auto;display:flex;gap:10px">${b}`);
};
const _actFF = window.act;
window.act = function (a, long) {
  if (a.startsWith('ff:')) {
    const [, k, ...rest] = a.split(':'); const v = rest.join(':');
    if (k === 'open') { if (long) { ffLaunch(); return; } ffDlg = true; render(); return; }
    if (k === 'close') { ffDlg = false; render(); return; }
    if (k === 'type') { store.set('ffType', v); render(); return; }
    if (k === 'pick') { store.set(store.get('ffType', 'navi') === 'dvr' ? 'ffDvr' : 'ffNavi', v); const inSet = tab === 'settings'; ffDlg = false; render(); if (!inSet) setTimeout(ffLaunch, 250); return; }
    if (k === 'dvr') { store.set('ffDvr', v); render(); return; }
    if (k === 'go') { ffDlg = false; render(); setTimeout(ffLaunch, 250); return; }
  }
  _actFF(a, long);
};
const _renderFF = window.render;
window.render = function () { _renderFF(); if (ffDlg && tab === 'home' && curP) { $('screen').insertAdjacentHTML('beforeend', ffDialog(curP)); document.querySelectorAll('#screen img[data-icon]').forEach((im) => { try { const u = A && A.icon ? A.icon(im.dataset.icon) : ''; if (u) im.src = u.startsWith('data:') ? u : 'data:image/png;base64,' + u; else im.style.visibility = 'hidden'; } catch (e) { im.style.visibility = 'hidden'; } }); } };

// ================= v4.3 : apprendre l'ordinateur de bord et la voiture =================
const CAN = window.Can || null;
const CARAPP_DEF = 'com.qf.vehicle';
const LFIELDS = [['fuel', 'Carburant (L)', 'L'], ['fuelPct', 'Carburant (%)', '%'], ['range', 'Autonomie', 'km'], ['odo', 'Kilométrage', 'km'], ['avg1', 'Conso moyenne', 'L/100'], ['instant', 'Conso instantanée', 'L/100'], ['batt', 'Batterie', 'V'], ['outT', 'Temp. extérieure', '°C'], ['oilT', 'Temp. d\'huile', '°C'], ['t1Spd', 'Vitesse moyenne', 'km/h'], ['t1Km', 'Distance trajet', 'km'], ['', 'Ignorer', '']];
const LGUESS = [[/r[ée]siduel|restant|carbur|fuel|essence|r[ée]servoir|tank|油量/i, 'fuel'], [/autonom|range|rest.*km|distance.*(restante|possible)/i, 'range'], [/kilom|odom|compteur|总里程|mileage/i, 'odo'], [/(conso|consum).*inst|instant/i, 'instant'], [/(conso|consum|moy|average|avg)/i, 'avg1'], [/batt|volt|tension/i, 'batt'], [/ext[ée]r|outside|outdoor|室外/i, 'outT'], [/temp.*(huile|oil)|(huile|oil).*temp/i, 'oilT'], [/vitesse moy|avg.*speed|average speed/i, 't1Spd'], [/carbur|fuel|essence|huile r[ée]siduelle|réservoir|tank|油/i, 'fuel']];
let learned = store.get('learned', {}), learnMap = store.get('canMap', []), learnRows = null, canAt = 0;
const numOf = (s) => { const m = String(s || '').replace(/\s/g, '').replace(',', '.').match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : null; };
const unitOf = (s) => { s = String(s || '').toLowerCase(); return /l\/100|l\/1/.test(s) ? 'L/100' : /km\/h/.test(s) ? 'km/h' : /km/.test(s) ? 'km' : /°|℃/.test(s) ? '°C' : /%/.test(s) ? '%' : /\bv\b|v$/.test(s) ? 'V' : /\bl\b|l$/.test(s) ? 'L' : ''; };
// paires « étiquette → valeur » : chaque texte avec un chiffre prend l'étiquette la plus proche (à gauche ou au-dessus)
function pairUp(items) {
  const vals = items.filter((o) => /\d/.test(o.t || o.d)), labs = items.filter((o) => !/\d/.test(o.t || o.d) && (o.t || o.d).length > 1);
  return vals.map((v) => {
    let best = null, bd = 1e9;
    for (const l of labs) { const dx = (v.x + v.w / 2) - (l.x + l.w / 2), dy = v.y - l.y; if (dy < -10 && Math.abs(dy) > v.h) continue; const d = Math.abs(dy) * 1.2 + Math.abs(dx) * 0.8; if (d < bd && d < 420) { bd = d; best = l; } }
    const lab = best ? (best.t || best.d) : (v.d && v.t ? v.d : '');
    const txt = v.t || v.d, u = unitOf(txt + ' ' + lab);
    let f = ''; for (const [re, k] of LGUESS) if (re.test(lab)) { f = k; break; }
    if (!f) f = u === 'L/100' ? 'avg1' : u === 'V' ? 'batt' : u === '°C' ? 'outT' : u === 'L' ? 'fuel' : u === '%' ? 'fuelPct' : '';
    return { txt, lab, id: v.id || '', x: v.x, y: v.y, f, u };
  });
}
function applyLearn(items, pkg) {
  if (!items || !items.length) return 0;
  const pairs = pairUp(items); let n = 0;
  for (const m of learnMap) {
    if (!m.f || (m.pkg && pkg && m.pkg !== pkg)) continue;
    let hit = m.id ? pairs.filter((p) => p.id === m.id) : [];
    if (hit.length !== 1) hit = pairs.filter((p) => p.lab && p.lab === m.lab);
    if (hit.length !== 1) hit = pairs.filter((p) => Math.abs(p.x - m.x) < 40 && Math.abs(p.y - m.y) < 30);
    if (!hit.length) continue;
    const v = numOf(hit[0].txt); if (v == null) continue;
    learned[m.f] = { v, t: Date.now(), txt: hit[0].txt }; n++;
  }
  if (n) { store.set('learned', learned); if (learned.odo) { store.set('odoManual', learned.odo.v); store.set('odoManualAt', Date.now()); odoGps = 0; } }
  return n;
}
function pollCan() {
  if (!CAN || !learnMap.length) return;
  const pkg = store.get('canPkg', CARAPP_DEF);
  try { const r = JSON.parse(CAN.last(pkg)); if (r.t && r.t !== canAt) { canAt = r.t; if (applyLearn(r.items, pkg) && tab === 'home') paint(); } } catch (e) {}
}
// kilométrage : dernière valeur lue + km faits depuis (vitesse / GPS)
let odoGps = 0, odoLastT = Date.now();
function odoTick() { const now = Date.now(), sp = curSpeed(), dt = Math.min(5, (now - odoLastT) / 1000); odoLastT = now; if (sp && sp.v > 1) odoGps += sp.v / 3600 * dt; }
function odoNow() { const base = learned.odo ? learned.odo.v : +store.get('odoManual', 0); if (!base) return null; return base + odoGps; }
// les valeurs apprises complètent celles du boîtier CAN
const _onCar43 = window.onCar;
window.onCar = function (o) {
  const fresh = (k) => learned[k] && Date.now() - learned[k].t < 6 * 3600e3;
  if (!(o.fuel > 0) && fresh('fuel')) o.fuel = learned.fuel.v;
  if (!(o.range > 0) && fresh('range')) o.range = learned.range.v;
  if (!(o.avg1 > 0) && fresh('avg1')) o.avg1 = learned.avg1.v;
  if (!(o.instant > 0) && learned.instant && Date.now() - learned.instant.t < 60e3) o.instant = learned.instant.v;
  if (!(o.odo > 0)) { const od = odoNow(); if (od) o.odo = od; }
  if (fresh('t1Spd') && !(o.t1Spd > 0)) o.t1Spd = learned.t1Spd.v;
  if (fresh('t1Km') && !(o.t1Km > 0)) o.t1Km = learned.t1Km.v;
  applyBits(o);
  _onCar43(o);
};

// ----- apprendre ma voiture : quel bit bouge quand on ouvre une porte, passe la marche arrière… -----
const LSTEPS = [['base', 'Ferme tout (portes, coffre, capot) et ne touche à rien', 'J\'observe les données pendant 5 secondes…'], ['lf', 'Ouvre la porte avant gauche', 'J\'attends que tu le fasses…'], ['rf', 'Ouvre la porte avant droite', 'Referme la précédente avant.'], ['lb', 'Ouvre la porte arrière gauche', ''], ['rb', 'Ouvre la porte arrière droite', ''], ['trunk', 'Ouvre le coffre', ''], ['bonnet', 'Ouvre le capot (ou passe)', ''], ['rev', 'Passe la marche arrière (frein appuyé)', ''], ['lo', 'Allume les feux de croisement', ''], ['beltD', 'Boucle puis débloque la ceinture conducteur', '']];
let lw = null; // assistant en cours
function rawVec() {
  let hex = ''; try { const q = JSON.parse(A && A.qfStatus ? A.qfStatus() : '{}'); hex = q.last || ''; } catch (e) {}
  if (DEMO) hex = demoRaw();
  const v = []; for (let i = 0; i + 1 < hex.length; i += 2) v.push(parseInt(hex.substr(i, 2), 16));
  if (doors && doors.raw != null) v.push(doors.raw);
  return v;
}
let demoBits = 0; function demoRaw() { const b = Array(40).fill(0); b[2] = demoBits; b[6] = (Date.now() / 100) & 255; return b.map((x) => x.toString(16).padStart(2, '0')).join(''); }
function lwStart() { lw = { step: 0, base: null, noise: new Set(), seen: [], t0: Date.now(), got: {}, msg: '' }; openSet('Véhicule', 'Apprendre ma voiture'); lwTick(); }
function lwTick() {
  if (!lw) return;
  const v = rawVec(), st = LSTEPS[lw.step];
  if (!v.length) { lw.msg = 'Aucune donnée reçue du boîtier CAN : impossible d\'apprendre.'; render(); return; }
  if (st[0] === 'base') {
    if (!lw.base) lw.base = v.slice();
    v.forEach((x, i) => { const d = x ^ (lw.base[i] || 0); for (let b = 0; b < 8; b++) if (d & (1 << b)) lw.noise.add(i * 8 + b); });
    if (Date.now() - lw.t0 > 5000) { lw.base = v.slice(); lw.step++; lw.t0 = Date.now(); render(); }
  } else {
    const ch = [];
    v.forEach((x, i) => { const d = x ^ (lw.base[i] || 0); for (let b = 0; b < 8; b++) if ((d & (1 << b)) && !lw.noise.has(i * 8 + b)) ch.push([i, b, (x >> b) & 1]); });
    if (ch.length) {
      if (!lw.cand || lw.cand.key !== ch.map((c) => c.join('.')).join('|')) lw.cand = { key: ch.map((c) => c.join('.')).join('|'), t: Date.now(), ch };
      else if (Date.now() - lw.cand.t > 700) { const [i, b, on] = ch[0]; lw.got[st[0]] = { i, b, on }; lw.msg = `Trouvé : octet ${i}, bit ${b}`; lwNext(); return; }
    } else lw.cand = null;
  }
  setTimeout(lwTick, 200);
}
function lwNext() { if (!lw) return; lw.step++; lw.t0 = Date.now(); lw.cand = null; lw.base = rawVec(); if (lw.step >= LSTEPS.length) { store.set('carLearn', Object.assign({}, store.get('carLearn', {}) || {}, lw.got)); const n = Object.keys(lw.got).length; lw = null; toast(`Voiture apprise : ${n} élément${n > 1 ? 's' : ''}`); render(); return; } render(); setTimeout(lwTick, 200); }
function applyBits(o) {
  const L = store.get('carLearn', null); if (!L) return;
  const v = rawVec(); if (!v.length) return;
  const bit = (k) => { const m = L[k]; if (!m || v[m.i] == null) return null; return ((v[m.i] >> m.b) & 1) === m.on ? 1 : 0; };
  const d = {}; let any = false;
  for (const k of ['lf', 'rf', 'lb', 'rb', 'trunk', 'bonnet']) { const x = bit(k); if (x != null) { d[k] = x; any = true; } }
  if (any) { d.raw = -1; d.ts = Date.now(); doors = Object.assign({}, doors || {}, d); }
  const r = bit('rev'); if (r != null) o.reverse = r;
  const lo = bit('lo'); if (lo != null) o.lo = lo;
  const bd = bit('beltD'); if (bd != null) o.beltD = bd;
}
function lwPanel(p) {
  if (!lw) return '';
  const st = LSTEPS[lw.step];
  return `<div style="${box(p, 'padding:16px 18px;margin:8px 0;border:2px solid #3aa0ff')}"><div style="font-size:12px;color:${p.mut};letter-spacing:.5px">APPRENDRE MA VOITURE · ÉTAPE ${lw.step + 1} SUR ${LSTEPS.length}</div>
    <div style="font-size:22px;font-weight:700;margin:6px 0">${st[1]}</div><div style="font-size:14px;color:${p.mut}">${st[2] || 'J\'attends que tu le fasses…'} ${lw.msg ? '· ' + lw.msg : ''}</div>
    <div style="display:flex;gap:8px;margin-top:12px">${smallBtn(p, 'lw:done', 'C\'est fait', true)}${smallBtn(p, 'lw:skip', 'Passer')}${smallBtn(p, 'lw:stop', 'Arrêter')}</div></div>`;
}
function learnPage(p) {
  const on = CAN && CAN.enabled(), cfg = CAN && CAN.configured(), pkg = store.get('canPkg', CARAPP_DEF);
  const apps = allApps().filter((a) => /vehicle|carinfo|canbus|can\b|canupgrade|voiture|automobile|carcan/i.test(a.p + ' ' + a.l));
  if (!apps.some((a) => a.p === pkg)) apps.unshift({ p: pkg, l: 'Applications automobiles d\'origine' });
  const L = store.get('carLearn', null), lv = Object.entries(learned);
  return `${lwPanel(p)}
  ${setRow(p, 'Lecture de l\'appli voiture', on ? 'Activée ✓ : l\'appli lit ce que l\'appli voiture affiche.' : cfg ? 'Activée dans Android, en attente…' : 'À activer une fois dans Accessibilité › Accueil 2008 GT.', on ? '<b style="color:#3FB950">Activée</b>' : chipBtn(p, 'lc:acc', 'Activer', true))}
  <div style="${box(p, 'padding:14px 16px;margin-top:10px')}"><div style="font-size:17px;font-weight:700">Apprendre l'ordinateur de bord</div>
    <div style="font-size:13.5px;color:${p.mut};line-height:1.45;margin:4px 0 10px">L'autoradio a sa propre appli « voiture » (CAN). Montre une fois à l'accueil où elle affiche le carburant, l'autonomie, le kilométrage… il les lira ensuite tout seul. 2 minutes, contact mis.<br>
    1. L'accueil ouvre l'appli voiture avec une barre en haut. 2. Va jusqu'à la page qui affiche les infos. 3. Touche « Capturer » (et d'autres pages si besoin), puis « Terminer ».</div>
    <div style="font-size:12px;color:${p.mut};margin-bottom:6px">QUELLE EST L'APPLI DE LA VOITURE ?</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px">${apps.slice(0, 6).map((a) => chipBtn(p, 'lc:pkg:' + a.p, esc(a.l), a.p === pkg)).join('')}</div>
    <div style="display:flex;gap:8px;margin-top:12px">${chipBtn(p, 'lc:go', 'Commencer', true)}${learnMap.length ? chipBtn(p, 'lc:peek', 'Relire maintenant') : ''}${learnMap.length ? chipBtn(p, 'lc:clear', 'Oublier') : ''}</div>
    ${learnMap.length ? `<div style="font-size:13px;margin-top:10px">${learnMap.filter((m) => m.f).length} données apprises : ${learnMap.filter((m) => m.f).map((m) => `<b>${(LFIELDS.find((f) => f[0] === m.f) || [])[1]}</b>${learned[m.f] ? ' = ' + esc(learned[m.f].txt) : ''}`).join(' · ')}</div>` : ''}</div>
  ${setRow(p, 'Relire tout seul au démarrage', 'Une seconde sur l\'appli voiture puis retour à l\'accueil.', togBtn(p, 'tg:canBoot:1', store.get('canBoot', true)))}
  <div style="${box(p, 'padding:14px 16px;margin-top:10px')}"><div style="font-size:17px;font-weight:700">Apprendre ma voiture (portes, coffre, marche arrière, feux)</div>
    <div style="font-size:13.5px;color:${p.mut};margin:4px 0 10px">Je te demande d'ouvrir chaque porte une par une, et je trouve tout seul quelle donnée du boîtier change.</div>
    <div style="display:flex;gap:8px">${chipBtn(p, 'lw:start', 'Commencer', true)}${L ? chipBtn(p, 'lw:forget', 'Oublier') : ''}</div>
    ${L ? `<div style="font-size:13px;margin-top:8px">Appris : ${Object.keys(L).map((k) => (LSTEPS.find((s) => s[0] === k) || [0, k])[1].replace(/^(Ouvre|Passe|Allume|Boucle puis débloque) (la |le |les )?/, '')).join(', ')}</div>` : ''}</div>`;
}
function mapPage(p) {
  const rows = learnRows || [];
  return `<div style="position:absolute;inset:0;z-index:1650;background:#000b;display:flex;align-items:center;justify-content:center"><div data-act="ge:noop" style="width:1100px;max-height:640px;${card(p, 'padding:18px 22px;display:flex;flex-direction:column;gap:10px')};background:${hex7(p.card)}">
    <div style="display:flex;justify-content:space-between;align-items:center"><div style="font-size:20px;font-weight:700">${rows.length} données reconnues dans l'appli voiture</div>${smallBtn(p, 'lc:save', 'Enregistrer', true)}</div>
    <div style="font-size:13.5px;color:${p.mut}">Vérifie chaque ligne : touche ce qu'elle représente, ou « Ignorer ». Les valeurs sont celles affichées au moment de la capture.</div>
    <div class="scroll" style="flex:1;min-height:0">${rows.length ? rows.map((r, i) => `<div style="display:grid;grid-template-columns:200px 1fr;gap:12px;align-items:center;padding:8px 0;border-bottom:1px solid ${p.card2}"><div><div style="font-size:18px;font-weight:700">${esc(r.txt)}</div><div style="font-size:12px;color:${p.mut}">${esc(r.lab || '—')}</div></div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">${LFIELDS.map(([k, l]) => `<button data-act="lc:f:${i}:${k}" style="height:36px;padding:0 10px;border-radius:9px;font-size:13px;font-weight:600;${r.f === k ? `background:${k ? '#2F7FE0' : '#555B66'};color:#fff` : `background:${p.card2};color:${p.txt}`}">${l}</button>`).join('')}</div></div>`).join('') : `<div style="padding:20px;color:${p.mut}">Rien de lisible capturé. Vérifie que la lecture est activée, et capture la page où les chiffres sont affichés.</div>`}</div></div></div>`;
}
window.onCanLearnDone = function () {
  try {
    const caps = JSON.parse(CAN.captures()); const rows = [];
    caps.forEach((pg) => pairUp(pg.items || []).forEach((r) => { r.pkg = pg.pkg; r.cls = pg.cls; if (!rows.some((x) => x.txt === r.txt && x.lab === r.lab)) rows.push(r); }));
    if (caps[0]) { store.set('canPkg', caps[0].pkg); store.set('canCls', caps[0].cls || ''); }
    learnRows = rows; openSet('Véhicule', 'Apprendre ma voiture');
  } catch (e) { toast('Capture illisible'); }
};
window.onCanPeek = () => setTimeout(pollCan, 300);
window.onCanReady = () => { if (tab === 'settings') render(); };
const _actL = window.act;
window.act = function (a, long) {
  const [k, x, y, z] = a.split(':');
  if (k === 'lc') {
    if (x === 'acc') { if (CAN) CAN.openSettings(); else toast('Aperçu : ouvrirait Accessibilité'); return; }
    if (x === 'pkg') { store.set('canPkg', a.slice(7)); render(); return; }
    if (x === 'go') { if (!CAN) { learnRows = pairUp(DEMO_CAP); render(); return; } if (!CAN.enabled()) { toast('Active d\'abord la lecture (bouton Activer)'); return; } if (!CAN.learn(store.get('canPkg', CARAPP_DEF), '')) toast('Appli voiture introuvable'); return; }
    if (x === 'f') { if (learnRows && learnRows[+y]) learnRows[+y].f = z || ''; render(); return; }
    if (x === 'save') { learnMap = (learnRows || []).filter((r) => r.f).map((r) => ({ f: r.f, lab: r.lab, id: r.id, x: r.x, y: r.y, pkg: r.pkg || store.get('canPkg', CARAPP_DEF) })); store.set('canMap', learnMap); (learnRows || []).forEach((r) => { if (r.f) { const v = numOf(r.txt); if (v != null) learned[r.f] = { v, t: Date.now(), txt: r.txt }; } }); store.set('learned', learned); if (learned.odo) { store.set('odoManual', learned.odo.v); store.set('odoManualAt', Date.now()); odoGps = 0; } learnRows = null; toast(learnMap.length + ' données enregistrées'); render(); return; }
    if (x === 'peek') { if (CAN && !CAN.peek(store.get('canPkg', CARAPP_DEF), store.get('canCls', ''), 1500)) toast('Active d\'abord la lecture'); return; }
    if (x === 'clear') { learnMap = []; learned = {}; store.set('canMap', []); store.set('learned', {}); render(); return; }
  }
  if (k === 'lw') {
    if (x === 'start') { lwStart(); return; }
    if (x === 'done') { if (lw && lw.cand) { const [i, b, on] = lw.cand.ch[0]; lw.got[LSTEPS[lw.step][0]] = { i, b, on }; } lwNext(); return; }
    if (x === 'skip') { lwNext(); return; }
    if (x === 'stop') { lw = null; render(); return; }
    if (x === 'forget') { store.set('carLearn', null); render(); return; }
  }
  _actL(a, long);
};
const DEMO_CAP = [{ t: 'Huile résiduelle', x: 60, y: 120, w: 180, h: 30 }, { t: '31 L', x: 60, y: 155, w: 80, h: 30 }, { t: 'Autonomie', x: 330, y: 120, w: 150, h: 30 }, { t: '412 km', x: 330, y: 155, w: 100, h: 30 }, { t: 'Kilométrage total', x: 600, y: 120, w: 200, h: 30 }, { t: '91 240 km', x: 600, y: 155, w: 140, h: 30 }, { t: 'Consommation moyenne', x: 60, y: 240, w: 260, h: 30 }, { t: '5,8 L/100km', x: 60, y: 275, w: 150, h: 30 }, { t: 'Tension batterie', x: 330, y: 240, w: 200, h: 30 }, { t: '14,1 V', x: 330, y: 275, w: 90, h: 30 }, { t: 'Ceintures', x: 600, y: 240, w: 120, h: 30 }, { t: 'Non bouclée', x: 600, y: 275, w: 140, h: 30 }];
const _renderL = window.render;
window.render = function () { _renderL(); if (learnRows && curP) $('screen').insertAdjacentHTML('beforeend', mapPage(curP)); };

// ----- cadre GPS en mode Freeform (à la place de la carte) -----
let ffLast = 0;
function ffMode() { return store.get('mapMode', 'freeform') === 'freeform'; }
function ffAuto(force) {
  if (!ffMode() || tab !== 'home' || homePage !== 0 || editing || !store.get('ffAuto', false)) return;
  if (!force && Date.now() - ffLast < 4000) return;
  if (!document.querySelector('#screen .ffslot')) return;
  ffLast = Date.now(); setTimeout(() => { if (tab === 'home') ffLaunch(); }, 350);
}
const _mapCard43 = window.mapCard;
window.mapCard = function (p, opts = {}) {
  if (!ffMode()) return _mapCard43(p, opts);
  const kind = store.get('ffType', 'navi'), pk = store.get(kind === 'dvr' ? 'ffDvr' : 'ffNavi', kind === 'dvr' ? '' : 'com.waze');
  const nm = kind === 'dvr' ? 'Caméra (DVR)' : ((NAVI_PK.find((x) => x[0] === pk) || [])[1] || (allApps().find((a) => a.p === pk) || {}).l || pk);
  return `<div data-act="ff:slot" class="ffslot" style="position:relative;overflow:hidden;${opts.bleed ? '' : card(p, '')};background:linear-gradient(160deg,#0f1a33,#0a1022);border:2px solid #3aa0ff55;${opts.style || ''};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#cfe3ff;text-align:center">
    <img data-icon="${esc(pk)}" alt="" style="width:72px;height:72px;border-radius:16px;opacity:.95">
    <div style="font-size:20px;font-weight:700">${esc(nm)} s'ouvre ici</div>
    <div style="font-size:13.5px;color:#8fa9d6;max-width:80%">Touche pour relancer · appui long pour choisir Navi / DVR et l'appli</div></div>`;
};
const _actFF43 = window.act;
window.act = function (a, long) {
  if (a === 'ff:slot') { if (long) { ffDlg = true; render(); } else ffLaunch(); return; }
  if (a === 'mapMode:map' || a === 'mapMode:freeform') { store.set('mapMode', a.split(':')[1]); render(); return; }
  const was = tab;
  _actFF43(a, long);
  if (was !== 'home' && tab === 'home') ffAuto(true);
};
const _renderFF43 = window.render;
window.render = function () { _renderFF43(); document.querySelectorAll('#screen .ffslot img[data-icon]').forEach((im) => { try { const u = A && A.icon ? A.icon(im.dataset.icon) : ''; if (u) im.src = u; else im.style.visibility = 'hidden'; } catch (e) { im.style.visibility = 'hidden'; } }); };
const _homeKey = window.onHomeKey; window.onHomeKey = function () { _homeKey(); ffAuto(true); };
const _resumeHome = window.onResumeHome; window.onResumeHome = function () { _resumeHome(); ffAuto(false); };
document.addEventListener('visibilitychange', () => { if (!document.hidden) ffAuto(false); });


{ const veh = SETCATS.find((c) => c[0] === 'Véhicule'); if (veh) veh[1].unshift(['Apprendre ma voiture', (p) => learnPage(p)]);
  const nav = SETCATS.find((c) => c[0] === 'Navigation'); if (nav) nav[1].unshift(['Ancien cadre (dispositions classiques)', (p) => `${setRow(p, 'Dans le grand cadre de l\'accueil', 'Freeform : ton GPS (Waze, Google Maps…) s\'ouvre dans le cadre, comme sur le lanceur d\'origine. Carte : l\'ancienne carte intégrée.', chipBtn(p, 'mapMode:freeform', 'Freeform', ffMode()) + chipBtn(p, 'mapMode:map', 'Carte intégrée', !ffMode()))}
    ${setRow(p, 'Type', '', chipBtn(p, 'ff:type:navi', 'Navi', store.get('ffType', 'navi') === 'navi') + chipBtn(p, 'ff:type:dvr', 'DVR', store.get('ffType', 'navi') === 'dvr'))}
    ${setRow(p, 'Appli GPS dans le cadre', '', ffApps('navi').map(([pk, l]) => chipBtn(p, 'ff:pick:' + pk, esc(l), store.get('ffNavi', 'com.waze') === pk)).join('') || 'Aucune appli GPS trouvée')}
    ${setRow(p, 'Appli caméra (DVR)', '', ffApps('dvr').map(([pk, l]) => chipBtn(p, 'ff:dvr:' + pk, esc(l), store.get('ffDvr', '') === pk)).join('') || 'Aucune appli caméra trouvée')}
    ${setRow(p, 'Ouvrir tout seul en revenant à l\'accueil', '', togBtn(p, 'tg:ffAuto:1', store.get('ffAuto', false)))}`]); }
// ----- démarrage -----
function learnStart() {
  setInterval(() => { odoTick(); pollCan(); if (lw && tab === 'settings') { const e = document.querySelector('#screen [data-k2="lw"]'); } }, 1000);
  if (CAN && learnMap.length && store.get('canBoot', true)) setTimeout(() => { if (CAN.enabled()) CAN.peek(store.get('canPkg', CARAPP_DEF), store.get('canCls', ''), 1500); }, 20000);
  setTimeout(() => ffAuto(true), 3000);
}

// ---------- démarrage ----------
const _start = window.start;
window.start = function () {
  autoBackupAtStart();
  [0, 1, 2].forEach((i) => { if (store.get('layout_' + i, null) === null) store.set('layout_' + i, 'custom'); });
  _start();
  setupLongWidget(); setupCar360();
  learnStart(); checkNet(); setInterval(checkNet, 30000); readSys(); setInterval(() => { readSys(); paint(); }, 3000);
  setInterval(() => { updateWeather(false); if (tab === 'settings' && SETCATS[setCat][0] === 'Véhicule') setK('qfInfo', qfInfo().txt); if (tab !== 'home') paint(); }, 5000);
  setTimeout(() => updateWeather(true), 4000);
  canCheckAtStart();
  if (store.get('updAuto', true) && !DEMO) { setTimeout(() => checkUpdate(false), 30000); setInterval(() => checkUpdate(false), 6 * 3600e3); }
  if (DEMO) {
    const q = new URLSearchParams(location.search);
    if (q.get('wx')) demoWx = { wx: q.get('wx'), night: q.get('night') === '1' };
    if (weather) { weather.days = [0, 1, 2, 3, 4, 5, 6].map((i) => ({ t: dayKey(Date.now() + i * 86400000), c: [61, 3, 1, 0, 61, 71, 2][i], max: [14, 12, 13, 12, 11, 4, 9][i], min: [9, 7, 8, 6, 6, 0, 3][i], pp: [80, 20, 10, 0, 70, 60, 20][i], rise: '2026-11-09T07:38', set: '2026-11-09T16:52' })); weather.hours = Array.from({ length: 24 }, (_, i) => ({ h: pad((17 + i) % 24) + 'h', t: 14 - Math.sin(i / 4) * 4, c: i < 5 ? 61 : 3, d: (17 + i) % 24 > 7 && (17 + i) % 24 < 17 ? 1 : 0, pp: Math.max(0, 80 - i * 6) })); weather.feel = 12; weather.wind = 18; weather.hum = 82; weather.at = Date.now(); }
    netOk = true;
    setInterval(() => { if (car) car.ts = Date.now(); if (loc) loc.ts = Date.now(); }, 1000);
    if (q.get('page') === 'settings') { setCat = +(q.get('cat') || 0); setSub = +(q.get('sub') || 0); tab = 'settings'; }
    if (q.get('tsub')) { tab = 'trips'; tripSub = q.get('tsub'); }
    if (q.get('grp')) grpEd = +q.get('grp');
    if (q.get('wxo')) wxOpen = true;
    geoA = { num: '12', road: 'Rue du Rhin', quarter: 'Neudorf', city: 'Strasbourg', cp: '67100', dep: 'Bas-Rhin', reg: 'Grand Est' };
    if (!store.get('regDate', '')) { store.set('regDate', '2018-05-14'); store.set('serviceLog', [{ date: '2025-06-02', type: 'Révision', km: 76200, cost: 289 }, { date: '2024-10-15', type: 'Pneus', km: 70100, cost: 360 }, { date: '2023-03-20', type: 'Contrôle technique', km: 58000, cost: 79 }]); }
    if (q.get('ssub')) { tab = 'service'; svcSub = q.get('ssub'); }
    if (q.get('pe')) planEdit = q.get('pe');
    if (q.get('ff')) ffDlg = true;
    if (q.get('lmap')) learnRows = pairUp(DEMO_CAP);
    if (q.get('lw')) { lw = { step: +q.get('lw'), base: [], noise: new Set(), got: {}, msg: '', t0: Date.now() }; }
    render();
  }
};
document.removeEventListener('DOMContentLoaded', _start);
document.addEventListener('DOMContentLoaded', window.start);
