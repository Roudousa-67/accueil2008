# Mise à jour 7.49

## Pourquoi les 7.46 à 7.48 ne cachaient pas Waze
Le système du fabricant (QF) range la fenêtre GPS quand une AUTRE appli passe devant en plein écran (vidéo du 25/11 ; et dans le lanceur d'origine, les autres pages sont d'autres applis). Notre appli est enregistrée comme lanceur (`persist.sys.qf.launcher`) : tout ce qui vient d'elle — accueil remis devant, page invisible, page opaque — est pris pour l'écran d'accueil, et Waze reste.

## Appli compagnon « Accueil 2008 Masque »
`compagnon/` : une activité plein écran noire, sans icône ni droit, ouverte par l'action `fr.gtline.accueil2008.MASQUER`, qui se ferme seule après 350 ms. En quittant l'accueil, `Display743Native.hideViaCompanion()` l'ouvre ; l'accueil est ensuite remis devant. Sans la compagnon : repli sur la 7.48 et conseil d'installation (une fois par jour).

Construite par `outils/construire_masque.sh` (javac, d8, aapt, zipalign, apksigner avec la même clé), vérifiée sur chaque PR sans signature, publiée une fois par `.github/workflows/compagnon.yml` (release `compagnon-1`). Installation depuis l'appli : GPS et navigation → Cacher Waze hors de l'accueil.

## Vérifications
Suite complète ; Java compilé contre l'API Android 10. Non essayé sur l'autoradio.
