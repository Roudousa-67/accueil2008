# Mise à jour 7.46

## Waze caché quand une autre appli s'ouvre
Résultat de la vidéo du 25/11 (Rechercher l'affichage, 7.45) : à chacun des 4 essais, l'appli d'essai ouverte par le pont natif (startActivity, plein écran demandé) passe par-dessus Waze, qui disparaît ; au retour à l'accueil, Waze revient dans son cadre.

Toutes les ouvertures d'applis de l'accueil (barre de gauche, raccourcis, widgets, plein écran du GPS…) passent désormais par `launch745` : pont natif `Display743Native.launch(appli, plein écran)`, repli sur l'ancienne méthode si le pont manque, refuse, ou si plusieurs applis sont proposées.

La page provisoire « Rechercher l'affichage » sera retirée une fois ce résultat confirmé en voiture.

## Vérifications
Suite complète. Non essayé sur l'autoradio avec cette version.
