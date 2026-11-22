# Accueil 2008 GT — 7.38

## 1. Cartes des trajets et des stations
- **Cause** : depuis la 7.25, la bibliothèque de cartes (Leaflet) n'était chargée que pour la carte de l'accueil, et pas du tout quand MapLibre était choisi. Les cartes du trajet en cours, de l'historique et des stations restaient vides alors que les tracés étaient bien enregistrés.
- Leaflet est chargé à l'ouverture de ces pages (3 essais au plus, sans boucle de rendus). Fond de carte unique avec les noms des rues. Sans Internet, le tracé reste visible avec un message.
- Trajet en cours : carte en direct dans l'onglet Trajets.
- **Routes empruntées** : notées pendant la conduite à partir de la route reconnue (aucune requête en plus), avec les kilomètres de chacune. Seulement pour les trajets faits après la mise à jour.
- Stations : carte avec ta position, liste vide sans erreur, tri « la plus proche d'abord », nom « Station de <ville> » (le flux national ne donne pas l'enseigne), choix « Luxembourg » sans source retiré.

## 2. Soleil, lune et étoiles
Le décor 7.26 ne les dessinait plus. Ils sont à leur place réelle : hauteur selon l'heure et la saison (SunCalc, position GPS), direction par rapport au cap de la voiture (un astre derrière la voiture n'apparaît pas), lune avec sa phase, étoiles la nuit, lumière dorée quand le soleil est à moins de 7° de l'horizon. Masqués par la pluie, l'orage et le brouillard.

## 3. Tickets et GPX par QR, sans Internet
- L'ancien QR visait un service Internet privé, injoignable : « le serveur ne répond pas ».
- Un serveur tourne désormais dans l'appli de l'autoradio (pont Android, `LocalTransfer738.java`, port 8738). Le QR ouvre sa page d'envoi sur le téléphone, qui réduit la photo avant l'envoi.
- Conditions : téléphone connecté au **point d'accès Wi-Fi de l'autoradio** (l'autoradio utilise sa carte SIM). Sans Wi-Fi, l'écran du QR donne la marche à suivre et ouvre le réglage du point d'accès.
- Sécurité : réseau local uniquement, jeton aléatoire valable 15 minutes (un nouveau QR invalide l'ancien), contenu vérifié par signature (JPEG, PNG, PDF, GPX), 15 Mo par fichier.
- Stockage : 1 Go réservé. Une fois plein, les fichiers les plus anciens non rattachés à un plein sont supprimés ; les tickets rattachés sont gardés.
- Les tickets reçus sont rangés en fichiers (référence `file738:` dans le plein) au lieu du stockage du navigateur, limité à environ 5 Mo.
- Le pont Android est recompilé à chaque publication : depuis la 7.35, les versions publiées n'embarquaient plus le pont 7.30.

## 4. Rapport de diagnostic
Paramètres → Système → Rapport de diagnostic. Reprend l'ancien diagnostic (corrections automatiques comprises) et ajoute, par catégorie : GPS, Waze et cadre GPS, autoradio, Internet et services (réponses et échecs de chaque service), serveur cartographique, décor, trajets et carte, stations, transfert, stockage, réglages (valeurs qui coupent une fonction, appli GPS absente, les 41 pages vérifiées), fonctionnement de l'appli (modules chargés, les 5 décors dessinés et chronométrés) et erreurs récentes, y compris celles que le pont Android masquait. Envoi : fichier HTML téléchargeable par QR, e-mail, WhatsApp, copie, affichage en grand.

## 5. Réglages
12 rubriques → 8 : Accueil et affichage, Widgets, GPS et navigation, Véhicule, Trajets et carburant, Météo, Entretien, Système. Retirés : « Nombre de raccourcis » (sans effet depuis la 7.30), service de transfert Internet, codes « N35 · » et « N46 · », ligne « Voiture 3D » sans commande. Fusionnés : barre de raccourcis, type de carburant, masquage de la barre, appli et cadre GPS, apprentissage de la voiture. Applis d'usine affichées seulement si installées. Les anciens liens mènent aux nouvelles pages. Les 66 options du décor 7.21 restent invisibles comme depuis la 7.28 ; seule D04 (roues de la voiture 3D), encore utilisée, revient dans Widgets.

## 6. Décor ville, village, autoroute
Position « réseau » (≈ 1 km) ignorée tant que le GPS précis a moins de 5 s ; recherche des routes isolée des autres fonctions ; maison adressée à moins de 60 m = zone habitée quand le serveur cartographique ne répond pas.

## Vérifications
Suite complète, plus `tests/v738.cjs` (cartes, routes empruntées, services, soleil devant/derrière, transfert, réglages, rapport) et `tests/native738.cjs` (serveur Java testé sur une vraie connexion HTTP : 20 contrôles). Essais de bout en bout dans Chromium. Non essayé sur l'autoradio : serveur, échange iPhone ↔ autoradio en Wi-Fi, fond de carte sur le réseau de l'autoradio.
