# Accueil 2008 GT — Bêta 2 (7.27.2)

Cette application de test s’installe à côté de la version stable 7.26.

- Application ID : `fr.gtline.accueil2008.beta` ; activité Java : `fr.gtline.accueil2008.MainActivity`.
- Nom Android : **Accueil 2008 GT Bêta**, avec badge BÊTA sur l’icône.
- Pas de catégorie HOME, pas de lancement sur BOOT/ACC. La bêta ne remplace pas le lanceur habituel.
- Réglages et données propres à la bêta ; pas de lecture du stockage privé de la version stable.
- Canal `version-beta.json`, distinct de `version.json`. Publication GitHub marquée prerelease.
- Même certificat de signature que la version stable. Aucune clé privée incluse.

## Tester

Garder la 7.26 installée. Télécharger l’APK de la préversion et ouvrir **Accueil 2008 GT Bêta** depuis les applications du poste.

1. **Démo** : route fictive avec courbes et rond-point, bande violette. La démo ne modifie ni la position GPS ni la vitesse reçue de la voiture. Elle se suspend avec l’application.
2. **Route GPS** : forme de la route cartographiée à proximité, depuis les données déjà utilisées par l’application. Pas de bande d’itinéraire calculé. Position ancienne/imprécise ou géométrie indisponible : retour au décor 7.26 avec une indication.
3. **GPX local** : fichier GPX ou contenu XML collé dans les réglages. Maximum 2 Mo / 10 000 points. Le suivi nécessite une position GPS proche du tracé, récente et suffisamment précise. Pas de calcul d’itinéraire, de recalcul ou d’instructions vocales.
4. **Décor 7.26** : rendu classique dans la bêta.

Les paramètres sont accessibles par le bouton BÊTA 2, ou Navigation → Bêta · Vue conducteur.

Waze s’ouvre avec le mécanisme de cadre existant, selon les autorisations de l’autoradio ; le plein écran reste la solution de repli. Le widget ne reçoit pas l’itinéraire Waze. La bande violette est celle de la démo ou du GPX importé. Les bâtiments et positions de voies restent illustratifs.

## Revenir à la version habituelle

Utiliser **Ouvrir la version habituelle** dans les paramètres bêta, ou ouvrir l’icône habituelle **Accueil 2008 GT**. Pour arrêter les essais : Android → Applications → **Accueil 2008 GT Bêta** → Désinstaller. Ne pas désinstaller la 7.26 : ses réglages sont conservés dans son application séparée.

La désinstallation efface les réglages propres à la bêta, pas ceux de la version stable. Aucun downgrade de la version stable n’est nécessaire.

## Construction et vérifications

`outils/preparer_beta.py` utilise l’APK 7.26 vérifié, un autre manifeste, les nouveaux assets et la clé d’origine fournie hors dépôt. Le mot de passe passe par une variable d’environnement. Le script vérifie le certificat et l’alignement du résultat.

Les tests couvrent le GPS absent/ancien/imprécis, le suivi de géométrie, le GPX valide et invalide, la conservation des données GPS, le retour au rendu classique, le ciblage du paquet stable et le canal de mise à jour séparé. Les métadonnées Android, l’absence de HOME/BOOT, l’autorité du provider et l’intégrité de l’APK stable sont contrôlées.

Un essai d’installation et de rendu sur l’autoradio reste à effectuer ; aucun autoradio n’est connecté à cet environnement.

## Révision 7.27.2 — voiture et localités proches

- Voiture agrandie : le sprite occupe jusqu’à 64 % de la largeur du widget, soit une voiture visible d’environ 32 % de sa largeur. Sa hauteur est bornée pour les petits widgets. La position sur sa voie est conservée.
- Navigation → Voiture et panneaux proches : intervalle par défaut **1 km**, choix **500 m, 1, 2, 5 ou 10 km**, ou désactivation.
- Premier panneau quand les données sont disponibles, puis après la distance choisie. Il se rapproche avec le déplacement et disparaît après le passage.
- Deux villes/villages/hameaux les plus proches dans les données de carte disponibles ; noms réels, distances **à vol d’oiseau**. Aucun lien de direction, de sortie ou de parcours Waze n’est supposé.
- Pas de panneau en démo fictive, sans GPS précis/récent ou si les données de localités sont trop anciennes. Les sauts GPS et la dérive à l’arrêt ne fabriquent pas des kilomètres.
- Toujours une application bêta séparée. La version stable 7.26 et ses réglages restent en place.
