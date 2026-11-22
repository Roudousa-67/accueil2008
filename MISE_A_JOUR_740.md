# Mise à jour 7.40

## 1. Météo devant toi (idée C)
Un petit message apparaît dans le widget de la route, sous la vitesse, quand de la pluie, de la neige, un orage, du brouillard ou du verglas arrive : « Forte pluie dans 30 min », « Verglas possible dans 15 min (0 °C) ». Toucher le message ouvre le détail (maintenant, dans 15–30 min, dans 45–60 min) ; la croix l'enlève et il ne revient pas pour la même alerte. Rien n'est annoncé quand il pleut déjà. Prévision Open-Meteo pour ta position et 20 km devant toi selon ton cap, toutes les 10 minutes ou après 8 km ; repli sur la prévision par heure si le détail par 15 minutes n'est pas disponible. Réglage : Météo → Météo devant toi.

## 2. Bouchons en direct (n° 7)
Avec une clé gratuite TomTom (GPS et navigation → Bouchons en direct, bouton « Tester la clé ») : en roulant, la vitesse est vérifiée à 2 km et 5 km devant toi toutes les 2 minutes ; si elle tombe sous la moitié de la vitesse habituelle, le message « Bouchon à 2 km : 20 km/h » apparaît dans le widget. Les cartes (accueil, trajets, stations) montrent la circulation en couleurs. Sans clé, rien n'est demandé.

## 3. Péages estimés (n° 8)
Pendant les trajets, les kilomètres faits sur une autoroute marquée « à péage » sur la carte (OpenStreetMap) sont multipliés par un prix moyen au kilomètre (0,10 € par défaut, réglable : Trajets et carburant → Péages). Le total apparaît sous « Routes empruntées » dans le détail du trajet. Ce n'est pas le tarif officiel : aucune source de tarifs fiable n'a été trouvée.

## 4. Décor (n° 10 et 11)
Panneau de sortie barré de rouge quand on quitte un village ou une ville (une fois par village et par 5 minutes). Saisons dans tous les décors : verts plus vifs au printemps, roux en automne, gris en hiver, selon la date ou le réglage « Saison du décor ».

## Vérifications
Suite complète, plus `tests/v740.cjs` (pluie, forte pluie, neige, orage devant, verglas, pas de message sous la pluie, croix, repli par heure, bouchons avec ou sans clé, couche de circulation, péages, sortie de village, automne). Non essayé sur l'autoradio ; noms des paramètres Open-Meteo (15 minutes) et TomTom codés de mémoire, réseau bloqué pendant le développement.
