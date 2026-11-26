# Mise à jour 7.51

## Désinstaller par appui long
Toutes les applications : appui long sur une appli → menu Désinstaller / Ajouter à la barre du bas / Mettre sur l’accueil. « Désinstaller » ouvre la fenêtre Android ; une appli du système ouvre sa fiche (Désactiver). Natif : `Display743Native.uninstall(pkg)`, `installed(pkg)`. Manifeste : `outils/axml.py` remplace la permission INJECT_EVENTS (jamais accordée) par REQUEST_DELETE_PACKAGES, obligatoire depuis Android 9. Vérifié dans publier751.yml (`aapt dump permissions`).

## Fonds d’espace et ciel (`wall751.js`)
18 fonds d’espace animés, « Ciel réel » (SunCalc : soleil, lune avec phase, étoiles qui tournent), « Fond qui suit la journée ». Couche canvas 640×360 sous le contenu de #stage (z-index -1), 8 images/s seulement sur l’Accueil, coupée en arrière-plan ; réglage Lente / Fixe dans Fond d’écran. Voie lactée dans le décor de la route la nuit (`Milky751`, appelé depuis decors726.js).

## Ménage
Page « Rechercher l’affichage » retirée des réglages (Waze se cache bien avec le compagnon).

## Tout l’Atelier en une version
- `stats751.js` : Trajets → Mes stats (bouchons ≥ 90 s sous 15 km/h en avançant, carte de chaleur et exploration par cases de ~160 m depuis les tracés, frais kilométriques au barème officiel des voitures avec PDF, classement des stations depuis les pleins) ; Éco-conduite : classement de la famille du mois (`driver733` ajouté aux trajets).
- `route751.js` : ZFE (`boundary=low_emission_zone`, vignette Crit’Air réglable), tunnel devant (feux), aires de repos et services, commerce à la prochaine sortie (boulangerie, McDo, pharmacie, supermarché), monuments à l’horizon, trafic TomTom dans le décor, panneau de limitation planté, panneau d’entrée de département. `decors726.js` expose `Decor751` (panneaux, horizon, densité). `v740.js` : alertes regroupées.
- `games751.js` : onglet Jeux (plaques, devine la ville, blind test, téléphones des passagers via `docs/jeux.html` + ntfy.sh), pochette en fond, égaliseur, logos des radios (radio-browser.info), mode concert à l’arrêt.
- `garage751.js` : Entretien → Pneus et Factures ; Pleins → Lire un ticket (tesseract.js chargé à la demande).
- `settings751.js` : réglages en 5 rubriques (anciens liens redirigés), taille du widget route, fluidité du décor (`Fluid751` dans la boucle du décor), nettoyage et sauvegarde hebdomadaires (natif `saveText` / `shareText`).
- Tout est déclaré dans « Nouveautés à tester ». Tests : `tests/v751b.cjs`.
