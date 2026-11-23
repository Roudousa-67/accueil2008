# Mise à jour 7.42

## 1. Décor en ville près d'une voie rapide
En ville, la position GPS pouvait être rattachée à une voie rapide voisine (M35, M351, rocade) : le décor passait sur Autoroute à 15 km/h. Désormais une voie rapide n'est retenue que si l'on a roulé à 50 km/h ou plus dans les 45 dernières secondes, ou si l'adresse donnée par la carte est cette voie (un bouchon sur l'autoroute garde donc le décor Autoroute). Un boulevard classé « trunk » limité à 50 n'est jamais une autoroute. Une maison adressée à côté de la rue suffit pour le décor Ville ou Village. Le rapport de diagnostic l'indique : « rue en ville, voie rapide voisine ignorée ».

## 2. Sorties toujours annoncées
Les sorties des voies rapides (bretelles « trunk_link » : M35, N4…) sont maintenant reconnues. Une sortie découverte entre deux distances rondes (sorties rapprochées, voie rejointe tard) a un portique tout de suite, à sa vraie distance, une seule fois.

## 3. Enseigne des stations d'autoroute
Le flux officiel ne donne souvent pas l'enseigne : elle est cherchée une fois sur OpenStreetMap (station la plus proche à moins de 300 m) puis gardée. Elle s'écrit en entier (« Carrefour Market », « Station U »), raccourcie à deux mots si elle est trop longue.

## Vérifications
Suite complète, plus `tests/v742.cjs`. Non essayé sur l'autoradio.
