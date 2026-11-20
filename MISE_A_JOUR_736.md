# Accueil 2008 GT — 7.36 : widget voiture fluide et décor qui suit la ville

## Fluidité

- **Cadence régulière.** L'ancien seuil fixe de 16,7 ms refusait les images d'un écran à 60 Hz (16,67 ms) : une image sur deux était sautée, de façon irrégulière. La boucle mesure maintenant le rafraîchissement réel de l'écran et dessine toutes les 1, 2, 3 ou 4 images selon le temps de dessin constaté (rendu du canevas compris), avec une montée rapide et une redescente prudente.
- **Plus de téléportation du paysage.** Toutes les 330 à 1 120 m, le décor revenait brutalement au début de sa boucle (immeubles, champs, troupeau remplacés d'un coup). Les éléments réguliers (façades, arbres, tirets, lampadaires) suivent désormais la distance continue, et au bouclage l'ancienne boucle s'efface en continuant d'avancer (≈ 0,8 s).
- **Dessin allégé.** Plants des champs, feuilles au sol, fougères et fenêtres sont regroupés par couleur : 7 à 8 fois moins de tracés en campagne, 4 fois moins sur autoroute, 2,5 fois moins en ville. Le fondu entre décors ne copie plus le canevas toutes les 180 ms.
- La vitesse est lissée entre deux mesures GPS/CAN sans fausser la distance parcourue (le test de distance exacte 7.34, qui bloquait la publication 7.36, repasse).

## Ville, village, campagne

- Sur une avenue ou une départementale en ville, le décor restait sur Campagne dès que la zone bâtie n'était pas cartographiée à moins de 22 m de la route. La longueur des rues résidentielles dans un rayon de 150 m (déjà chargées, aucune requête en plus) sert maintenant d'indice : ≥ 450 m, ou ≥ 200 m avec une limitation à 50 km/h.
- Quand la route suivie est ambiguë (carrefour, routes parallèles), le décor est quand même évalué par la zone ; il ne quitte l'autoroute qu'après 6 s de confirmation.
- Requêtes cartographiques allégées pour aboutir en ville avant le délai de 17 s du pont Android : voies de service exclues, rues résidentielles sur 600 m, zones bâties sur 700 m.
- GPS imprécis (immeubles, tunnel) : dernier décor conservé une minute au lieu de 8 s.
- Widgets → Vue voiture et route → État du décor indique le décor affiché et la raison (route reconnue, longueur de rues, zones chargées). En mode manuel, il est précisé que le décor ne change plus seul.

## Vérifications

Suite complète réussie, plus `tests/fluidite736.cjs` : 60 i/s sans saut, 30 et 20 i/s réguliers quand le dessin est lent, bouclage sans saut pour les cinq décors, une seule copie du canevas au changement de décor, avenue de ville reconnue sans zone cartographiée, GPS dégradé, sortie d'autoroute confirmée.

Mesures Chromium sur ordinateur (rendu logiciel, pas l'autoradio) : sans bridage, 58–60 i/s réguliers dans les cinq décors (30–38 i/s irréguliers avant) ; processeur bridé ×2, écart moyen entre intervalles successifs ramené de 6–14 ms à 0,1–5 ms.

## Limites

Ni la cadence réelle ni la détection n'ont été essayées sur l'autoradio. Les seuils de longueur de rues sont des estimations à confirmer en roulant ; le comportement réel dépend des données OpenStreetMap du secteur et de la disponibilité du serveur Overpass.
