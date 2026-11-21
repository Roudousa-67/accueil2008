# Accueil 2008 GT — 7.37 : détection du décor fiabilisée

Constat après la 7.36 : sur l'autoradio, le décor ne change toujours pas (ni ville, ni autoroute).

## Cause la plus probable

L'autoroute, la ville et le village ne sont reconnus qu'avec les données du serveur public Overpass. En conduite, l'appli lui envoyait jusqu'à cinq types de requêtes (routes, zones bâties, deux listes de localités, zones de danger), souvent deux ou trois en même temps, environ dix par minute sur autoroute. Le serveur refuse au-delà de deux requêtes simultanées par connexion (réponse 429) et ralentit les connexions trop actives. Sans réponse « routes », plus de route reconnue : le décor retombait sur Campagne.

Non vérifié depuis l'autoradio : l'écran Données du décor ci-dessous est fait pour le confirmer.

## Corrections

- Requêtes Overpass envoyées une par une, routes en priorité, demandes identiques partagées. Après un refus ou un délai dépassé : pause croissante (5 s à 60 s) et serveur de secours `overpass.kumi.systems` pendant 2 min. Ce serveur de secours n'a pas pu être testé depuis l'environnement de développement.
- Sans aucune donnée routière, l'adresse Nominatim (déjà demandée pour le panneau d'adresse) sert d'indice : voie la plus proche autoroute/voie rapide → décor Autoroute ; rue résidentielle → Ville ou Village. Indice valable 90 s, à moins de 1 km.
- Dernier décor conservé 5 minutes quand le GPS est imprécis ou que les données manquent, au lieu d'1 minute.
- Widgets → Vue voiture et route → **Données du décor** : précision et âge du GPS, dernières requêtes routes et zones (reçues, ou échec avec le message du serveur), serveur de secours, pause en cours.
- Les workflows 7.35 et 7.36 ne se relancent plus à chaque envoi sur main.

## Vérifications

Suite complète réussie, plus `tests/decor737.cjs` : une seule requête à la fois, routes en premier, pause et bascule après un refus 429, demande partagée, autoroute reconnue par l'adresse, décor conservé 5 min, diagnostic affiché. Application complète chargée sans erreur dans Chromium.

Pas d'essai sur l'autoradio ni contre le vrai serveur Overpass (accès réseau non disponible dans l'environnement de développement).
