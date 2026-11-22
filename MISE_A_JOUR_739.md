# Mise à jour 7.39

## 1. Stations : filtres en menus déroulants
Carburant, rayon, paiement, tri et pays sont des menus déroulants, présentés comme « Période » et « Conducteur ». La carte et la liste remontent dans l'écran.

## 2. Panneaux d'autoroute à la vraie distance
Les portiques de sortie ne passent plus au rythme du décor : chacun apparaît 600 m devant et se trouve là où la sortie est vraiment à 5 km, 4 km, 3 km, 2 km et 1 km (réglage « Tous les kilomètres ») ou à 2 km et 1 km. Même principe pour la prochaine station d'autoroute avec le prix de ton carburant (10 km, 5 km puis tous les kilomètres, ou 10, 5, 2 et 1 km). Dès que la sortie ou la station est à 500 m, un petit panneau apparaît tout de suite en haut à droite de l'image, avec la distance qui diminue jusqu'au passage. Un panneau dont la distance est déjà dépassée quand les données arrivent n'est pas affiché.

## 3. Réglages
GPS et navigation → Panneaux d'autoroute : panneaux de sortie, fréquence, panneaux de station avec le prix, petit panneau à 500 m.

## Vérifications
Suite complète, plus `tests/v739.cjs` (menus déroulants, réglages, portiques tous les kilomètres ou 2 km / 1 km / 500 m, données arrivées en retard, petit panneau). Non essayé sur l'autoradio ; les sorties viennent d'OpenStreetMap et demandent Internet.
