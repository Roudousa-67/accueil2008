# Mise à jour 7.51

## Désinstaller par appui long
Toutes les applications : appui long sur une appli → menu Désinstaller / Ajouter à la barre du bas / Mettre sur l’accueil. « Désinstaller » ouvre la fenêtre Android ; une appli du système ouvre sa fiche (Désactiver). Natif : `Display743Native.uninstall(pkg)`, `installed(pkg)`. Manifeste : `outils/axml.py` remplace la permission INJECT_EVENTS (jamais accordée) par REQUEST_DELETE_PACKAGES, obligatoire depuis Android 9. Vérifié dans publier751.yml (`aapt dump permissions`).

## Fonds d’espace et ciel (`wall751.js`)
18 fonds d’espace animés, « Ciel réel » (SunCalc : soleil, lune avec phase, étoiles qui tournent), « Fond qui suit la journée ». Couche canvas 640×360 sous le contenu de #stage (z-index -1), 8 images/s seulement sur l’Accueil, coupée en arrière-plan ; réglage Lente / Fixe dans Fond d’écran. Voie lactée dans le décor de la route la nuit (`Milky751`, appelé depuis decors726.js).

## Ménage
Page « Rechercher l’affichage » retirée des réglages (Waze se cache bien avec le compagnon).
