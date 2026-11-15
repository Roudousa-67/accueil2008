# Accueil 2008 GT

Lanceur Android personnalisé pour l’autoradio d’une Peugeot 2008 GT Line.
Version actuelle : **7.20** · application `fr.gtline.accueil2008` · Android 7.0+.

## Installer

[Télécharger l’APK 7.20](https://github.com/Roudousa-67/accueil2008/releases/download/v7.20/Accueil2008GT_v7.20.apk)
· [Toutes les versions](https://github.com/Roudousa-67/accueil2008/releases)

Si la release n’est pas encore publiée, l’APK signé vérifié est aussi disponible
dans [distribution](distribution/Accueil2008GT_v7.20.apk). Ouvrir le fichier,
puis utiliser « Download raw file » pour le télécharger.

Sur l’autoradio, ouvrir l’APK et autoriser cette source d’installation si Android
le demande. Conserver l’application installée pour garder les réglages.
La signature est la même que sur les livraisons précédentes. Sauvegarder ses
réglages dans les paramètres avant une mise à jour. Éviter de désinstaller.

## Nouveautés 7.20

- Recherche dans le contenu des paramètres, filtre par catégorie et dictée.
- Position de défilement conservée après modification d’un réglage.
- Barre d’applications compacte : GPS de 4 à 5 rangées dans la disposition
  Autoradio standard, choix réversible dans les paramètres.
- Proposition avant téléchargement : « Plus tard » ou « Télécharger après
  sauvegarde ». Aucun APK téléchargé automatiquement.

Sont aussi conservés : panneaux de ville, village et localité proche sur
l’autoroute ; actualisation géolocalisée réglable ; panneaux animés dans le décor
avec marge par rapport à la voiture ; transitions, ciel progressif, soleil et lune.

## Où régler les fonctions

| Fonction | Emplacement |
| --- | --- |
| Recherche et dictée | En haut de Paramètres |
| Barre d’applications compacte | Écran d’accueil > Barre d’applications |
| Hauteur de la barre Accueil | Écran d’accueil > Hauteur de la barre Accueil |
| Taille, distance, fréquence des panneaux et délai GPS | Navigation > Panneaux et localités |
| Transition, soleil, lune et ciel | Navigation > Décor de la route |
| Position et cadre du GPS | Navigation > Cadre GPS |
| Dépôt et vérification des versions | Mises à jour |

Dépôt à indiquer dans l’application : **`Roudousa-67/accueil2008`** (sans `.git`).
La vérification automatique consulte `version.json` sur `main` au démarrage,
puis toutes les six heures. La publication d’une nouvelle version reste manuelle.

## Vérifications et limites

**113 contrôles simulés réussis** pour la version 7.20, dont rendu Canvas,
géolocalisation simulée, réglages, défilement et liens de mise à jour.
Voir [les résultats](tests/RESULTATS.txt) et [le bilan](tests/VERIFICATION.json).
Signature APK, manifeste Android, classe de dictée et correspondance des assets
avec les sources contrôlés localement. Aucun essai physique n’est annoncé.

La dictée dépend du service vocal installé sur l’autoradio. L’intégration Waze
et le masquage des barres Android dépendent du firmware et des permissions du
poste. La présence de ces fonctions dans le code ne garantit pas leur prise en
charge sur chaque autoradio. Les astres sont un décor ; sans GPS récent, leur
trajectoire est indicative. Régler l’écran à l’arrêt.

## Contenu du dépôt

- `sources_assets/` : interface, décor et bibliothèques embarquées.
- `module_GPS_java/` : module natif GPS et dictée Android.
- `outils/` : reconstruction des assets, manifeste et module DEX.
- `tests/` : régression de l’interface et résultats locaux.
- `distribution/` : APK déjà signé, empreinte SHA-256 et notes de version.
- `.github/workflows/` : contrôles automatiques et publication sur déclenchement manuel.

Les sources du lanceur sont celles de la livraison disponible : il ne s’agit
pas d’un projet Gradle complet de l’application Android d’origine. La
reconstruction s’appuie sur un APK de base et sur le module natif fourni.

## Développement et publication

Avec Node.js 24 :

```sh
npm install --prefix tests
npm test --prefix tests
```

La clé de signature et son mot de passe ne sont pas dans ce dépôt. Ils restent
nécessaires localement pour compiler une mise à jour installable par-dessus la
version existante. Ne jamais les ajouter aux fichiers, commits ou issues.

Voir [GITHUB.md](GITHUB.md) pour préparer puis publier une version après validation.
Les contrôles automatiques ne publient pas d’APK.

## Crédits et licences

Modèle « 2018 Peugeot 2008 » : tonielpro520 sur Sketchfab, licence CC BY 4.0,
comme indiqué dans les crédits de l’application. SunCalc 1.9.0 : Vladimir
Agafonkin, licence BSD incluse dans `sources_assets/lib/SunCalc-LICENSE.txt`.
Les bibliothèques, polices, données cartographiques et autres ressources gardent
leurs licences respectives ; consulter leurs fichiers et les crédits embarqués.
Aucune licence globale nouvelle n’est attribuée aux sources du lanceur.
