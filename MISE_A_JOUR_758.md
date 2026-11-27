# Mise à jour 7.58

## Fenêtre « Remplacer par… » (barre d’applis)
Elle était ajoutée à `document.body`, hors de `#stage` où sont écoutés les appuis : rien n’y répondait (choix, Fermer, appui à côté). Maintenant dans `#stage` (position absolue, z-index 6000), fond `data-act=arapp:close`, carte `arapp:noop`, et `fLoadIcons` sur la fenêtre pour les vrais logos (avant : lettres). Bug reproduit avec l’ancien code, corrigé vérifié avec de vrais appuis.

## Musique (`music758.js`, n° 3 du plan)
Pochette floutée en fond (couche `pointer-events:none` sous le contenu), égaliseur posé en position absolue sur le widget (ne pousse rien : accueil vérifié à 720 px), logo des radios via radio-browser.info, mode concert après 30 s à l’arrêt (15 s en 7.51), fermé 10 min par un appui, retiré en roulant.
