# Mise à jour 7.43

## Rechercher l'affichage (Réglages → Système)
Recherche complète de l'autoradio pour comprendre comment le lanceur d'origine affiche Waze dans un petit cadre, et pour cacher Waze quand une autre appli s'ouvre. Lecture seule : rien n'est modifié sur le poste.

Ce qui est lu : modèle, Android et propriétés système ; modes de fenêtres (fenêtre libre, image dans l'image, écrans secondaires, encastrement) ; droits de notre appli ; écrans (y compris virtuels) ; présence du root ; lanceurs et applis système liées, dont le code est parcouru (méthodes d'affichage, commandes du fabricant) ; Waze (encastrable, redimensionnable).

Essais : les Réglages Android s'ouvrent normalement puis en plein écran ; on répond si Waze est resté visible.

Le résultat part au téléphone par QR et s'ajoute au rapport de diagnostic. Il servira à coder la solution pour cacher Waze dans la version suivante.

## Vérifications
Suite complète, plus `tests/v743.cjs` (page, recherche simulée, essais, envoi, rapport) et `tests/native743.cjs` (lecture du code). Le Java compile contre l'API Android 10. Non essayé sur l'autoradio.
