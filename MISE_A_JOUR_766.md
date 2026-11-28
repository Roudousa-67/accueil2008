# Mise à jour 7.66

Décor vivant repris de la 7.51, seul cette fois.
- `decors726.js` : points d'accroche `Decor766` (panneaux ajoutés, silhouettes à l'horizon, densité du trafic). Nouveau par rapport à la 7.51 : les panneaux ajoutés sont aussi dessinés hors autoroute (ville, village, campagne, forêt : `drawExt766`), et les monuments sont dessinés après les immeubles de l'arrière-plan (en 7.51, ils étaient cachés derrière en ville).
- `decor766.js` :
  - **Monuments à l'horizon** (ville, village) : cathédrales, châteaux, tours et églises connues à moins de 5 km (OpenStreetMap, au plus toutes les 10 min ou après 3 km), dans leur vraie direction par rapport au sens de marche.
  - **Trafic réel** : jusqu'à 3 fois plus de voitures en face sur autoroute quand les bouchons en direct (TomTom) montrent un ralentissement, ou en roulant entre 3 et 40 km/h sur autoroute.
  - **Panneau de limitation planté** : quand la limite change en roulant, le nouveau panneau défile au bord de la route.
  - **Panneau de département** : en changeant de département (code postal de l'adresse), panneau bleu (numéro, nom, région) au bord de la route.
  - Réglages : Widgets › Vue voiture et route › « Décor vivant » (Oui / Non pour chaque élément), et Nouveautés à tester.
