# Mise à jour 7.43

## Autoroute
- Panneau « SORTIE » planté au bord de la route au début exact de la bretelle (position du point de sortie OpenStreetMap), avec le numéro et les villes. Il défile avec le décor.
- Panneau des grandes villes et de leurs distances : en arrivant sur l'autoroute puis après chaque sortie passée, au plus un tous les 10 km. Villes OpenStreetMap devant toi ; distance par la route (OSRM), sinon à vol d'oiseau + 20 % marquée « ≈ ». Planté au bord de la route et affiché en grand en haut, entre la vitesse et la météo, pendant 10 s (5, 10, 20 s ou désactivé).
- Zone de danger en haut de l'image avec la distance restante ; elle clignote et bipe si la limite est dépassée. Forme autorisée en France (zone, jamais l'emplacement d'un radar : article R413-15 du Code de la route). Coupée automatiquement en Allemagne, où l'avertissement de radars en roulant est interdit (§ 23 Abs. 1c StVO). La pastille rouge sous la vitesse ne fait plus doublon.
- La pastille de limitation se cache pendant qu'un panneau du haut est affiché (elle le recouvrait).
- Corrigé : double portique quand une sortie apparaissait juste avant une distance ronde (7.42).
- Réglages : GPS et navigation → Panneaux d'autoroute (« SORTIE », grandes villes) et Panneaux dans l'image (durée des villes en haut, zone de danger).

## Rechercher l'affichage (Réglages → Système)
Recherche complète de l'autoradio pour comprendre comment le lanceur d'origine affiche Waze dans un petit cadre, et pour cacher Waze quand une autre appli s'ouvre. Lecture seule : rien n'est modifié sur le poste.

Ce qui est lu : modèle, Android et propriétés système ; modes de fenêtres (fenêtre libre, image dans l'image, écrans secondaires, encastrement) ; droits de notre appli ; écrans (y compris virtuels) ; présence du root ; lanceurs et applis système liées, dont le code est parcouru (méthodes d'affichage, commandes du fabricant) ; Waze (encastrable, redimensionnable).

Essais : les Réglages Android s'ouvrent normalement puis en plein écran ; on répond si Waze est resté visible.

Le résultat se crée en PDF (Téléchargements/Accueil2008) et s'envoie par e-mail avec l'appli choisie, ou part au téléphone par QR ; il s'ajoute aussi au rapport de diagnostic. Page provisoire, retirée une fois la solution trouvée. Il servira à coder la solution pour cacher Waze dans la version suivante.

## Vérifications
Suite complète, plus `tests/v743.cjs` (page, recherche simulée, essais, envoi, rapport) et `tests/native743.cjs` (lecture du code). Le Java compile contre l'API Android 10. Non essayé sur l'autoradio.
