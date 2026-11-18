# Accueil 2008 GT 7.28 — version normale

La voiture retrouve un grand cadrage, proche de la vue de référence. La bande sombre du haut du décor est retirée. La vitesse reste en haut à gauche, avec le panneau de limitation juste à côté ; la ville, la température, l’icône météo et les températures mini/maxi restent en haut à droite.

Le cadre GPS utilise désormais les rapports réels de largeur et de hauteur du poste. Les corrections de position sont remises à zéro une seule fois et gardées dans une sauvegarde interne. Navigation → Cadre GPS et alignement permet de réaligner automatiquement la fenêtre. L’intégration et le redimensionnement dépendent des permissions du firmware Android ; le plein écran reste disponible.

Navigation → Vue conducteur permet d’activer ou de désactiver la nouvelle vue. Elle reprend les courbes des routes cartographiées autour du GPS. Les segments connectés sont prolongés lorsqu’il n’y a pas de choix de direction ; aux bifurcations, aucune sortie n’est devinée. Les ronds-points fermés restent disponibles au franchissement du point de fermeture. Une position trop ancienne, trop imprécise ou hors de la route déclenche le retour au décor classique.

Le widget ne reçoit pas l’itinéraire de Waze. Waze continue son guidage dans son propre cadre. Une bande violette peut suivre un fichier GPX local importé dans les réglages avancés ; elle est indépendante de Waze, sans calcul d’itinéraire, recalcul ou instructions vocales. Un aperçu fictif est disponible uniquement dans les paramètres, sans modifier le GPS ni la vitesse réelle.

Navigation → Panneaux et localités affiche les deux localités les plus proches présentes dans les données disponibles. Le premier panneau apparaît quand les données sont prêtes, puis après la distance choisie : 500 m, 1 km (par défaut), 2, 5 ou 10 km. L’affichage est désactivable. Les distances aux localités sont à vol d’oiseau, sans indication de sortie ni de direction. La dérive à l’arrêt et les sauts GPS ne génèrent pas de faux kilomètres. Les noms reçus sont affichés comme du texte.

Les paramètres de navigation sont regroupés : Appli GPS, Cadre GPS et alignement, Vue conducteur, Paysages et météo, Panneaux et localités, puis les services existants. Les anciens interrupteurs de décor sans effet sur le nouveau moteur et le sélecteur d’ancien cadre ne sont plus présentés. Les outils spécifiques au firmware sont rangés dans les réglages avancés. Les profils, données CAN, trajets et entretiens ne sont pas effacés.

L’APK normal conserve `fr.gtline.accueil2008`, la clé d’origine et les composants Android existants. Il s’installe par-dessus la version stable. Cette version ne crée pas d’application bêta séparée.

## Construction

`outils/preparer_apk728.py` reconstruit les assets et le manifeste 7.28 / code 98 à partir de l’APK 7.26 vérifié. Les DEX restent identiques. Chaque asset est comparé aux sources ; l’identité Android, l’alignement ZIP et l’absence de clé privée dans l’APK sont contrôlés. En mode signé, le certificat doit correspondre à la 7.26. Le mot de passe passe exclusivement par une variable d’environnement.

La publication normale est préparée dans `.github/workflows/publication728.yml`. Elle publie et retélécharge l’APK avant de changer `version.json`. Aucun APK non signé n’est annoncé comme une mise à jour installable. Le fichier de clé n’est jamais destiné au dépôt public ni aux assets d’une release.

Un essai sur l’autoradio reste à effectuer après la signature et l’installation.
