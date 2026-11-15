# Dépôt et mises à jour

Dépôt : https://github.com/Roudousa-67/accueil2008
Branche principale : `main`. Version préparée : `7.20`, code Android `90`.
Dans l’application : Paramètres > Mises à jour > Dépôt GitHub =
`Roudousa-67/accueil2008`.

## Règle de publication

Les changements sont présentés pour validation avant chaque nouvelle version.
Les contrôles sur les commits et demandes de fusion ne publient rien.
Le workflow « Publier la version validée » se lance uniquement depuis Actions,
avec la confirmation explicite « PUBLIER ». Il n’y a pas de publication sur push.

Pour la version 7.20 déjà fournie, le dépôt contient l’APK signé et vérifié.
Actions > Publier la version validée > Run workflow > saisir PUBLIER.
Le workflow relance les tests, contrôle le SHA-256, puis crée la release `v7.20`
avec l’APK. Le fichier `version.json` pointe vers cette release. Avant cette
publication, télécharger l’APK directement depuis `distribution/`.
La publication ne télécharge ni n’installe l’APK sur l’autoradio.

## Préparer la version suivante

1. Modifier et tester les sources dans une branche de travail.
2. Générer et signer l’APK localement avec la clé d’origine, jamais publiée.
3. Ajouter l’APK choisi dans `distribution/`, son SHA-256, les notes de version,
   le bilan de tests et les nouvelles valeurs de `version.json`.
4. Présenter les changements, limites et résultats ; obtenir la validation.
5. Fusionner la version retenue, puis lancer manuellement la publication.

Le workflow utilise les données validées de `version.json` et n’accepte que le
lien APK de ce dépôt et de la version choisie. Le mot de passe de signature
reste local : le workflow ne recompile pas et ne signe pas l’APK.

## Reconstruction locale

Le script `module_GPS_java/build.bat` nécessite Windows, un JDK 17, le SDK
Android, les Build Tools 34, l’API 30 et apktool, aux emplacements indiqués au
début du script. Copier localement l’APK de base au chemin attendu, ainsi que la
clé d’origine dans `outils/`, et définir KSPASS dans un environnement privé.
Le script exige ces éléments ; il ne contient aucun mot de passe.
Les autres outils Python permettent de remplacer les assets et le manifeste.
Voir aussi `LISEZMOI.txt` pour l’historique technique, dont les anciens états de
la configuration. Le présent document décrit la configuration actuelle.

## Dépannage

- Pas de release : utiliser le fichier APK dans `distribution/` ou lancer la
  publication validée depuis Actions.
- Vérification de mise à jour impossible : vérifier la connexion Internet, le
  dépôt saisi sans `.git`, et la présence de `version.json` sur `main`.
- Installation refusée : ne pas désinstaller ; vérifier la signature et
  l’autorisation Android d’installer depuis le navigateur ou gestionnaire choisi.
- Dictée absente : utiliser le clavier et vérifier le service vocal Android.
- Waze ne rentre pas dans son cadre : vérifier les permissions et le firmware
  du poste ; les tests simulés ne remplacent pas l’essai sur l’autoradio.
