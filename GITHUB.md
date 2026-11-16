# Dépôt et mises à jour

Dépôt : https://github.com/Roudousa-67/accueil2008
Branche principale : `main`. Version publiée : `7.23`, code Android `93`.
Dans l’application : Paramètres > Mises à jour > Dépôt GitHub =
`Roudousa-67/accueil2008`. Activer « Vérifier automatiquement » : recherche au
démarrage puis toutes les six heures pendant que l’application fonctionne.
Une connexion Internet est nécessaire. Le téléchargement attend une validation.
La version déjà installée n’est pas reproposée comme une nouvelle mise à jour.

## Publication après validation

Les contrôles sur les commits et demandes de fusion ne publient rien.
Le workflow « Publier la version validée » se lance uniquement depuis Actions,
avec la confirmation explicite « PUBLIER ». Il n’y a pas de publication sur push.
Il teste les sources, contrôle l’empreinte et les métadonnées, puis publie l’APK
signé. Seulement après disponibilité de l’APK, il met à jour `version.json`, lu
par les appareils. Ainsi, une version préparée n’est pas annoncée prématurément.

Deux fichiers ont des rôles distincts :
- `distribution/release.json` : proposition de version à publier.
- `version.json` : dernière version publiée, annoncée aux autoradios.

Si une release existe déjà, le workflow vérifie que son APK est strictement
identique au fichier proposé avant d’autoriser l’annonce. Il ne remplace pas un
APK publié par un autre. Une proposition plus ancienne est refusée.

## Préparer la version suivante

1. Modifier et tester les sources dans une branche de travail.
2. Générer et signer l’APK localement avec la clé d’origine, jamais publiée.
3. Ajouter l’APK dans `distribution/`, son SHA-256, les notes de version et le
   bilan de tests. Modifier **distribution/release.json** avec la nouvelle
   version et son lien GitHub. Laisser **version.json inchangé** à ce stade.
4. Présenter les changements et résultats ; obtenir la validation.
5. Fusionner la version retenue sur `main`, puis lancer manuellement la
   publication depuis Actions en saisissant PUBLIER.
6. Vérifier le résultat du workflow et la disponibilité de la release.

Le workflow ne recompile ni ne signe : il utilise l’APK signé et validé.
En cas d’échec après création de la release, il peut être relancé : il contrôle
l’APK existant avant de terminer l’annonce, sans le remplacer.

## Sources et reconstruction locale

Les sources disponibles ne constituent pas un projet Gradle complet de l’APK
d’origine. `module_GPS_java/build.bat` nécessite Windows, un JDK 17, le SDK
Android, les Build Tools 34, l’API 30 et apktool aux chemins indiqués dans ce
script. Copier localement l’APK de base au chemin attendu et la clé d’origine
dans `outils/`, puis définir KSPASS dans un environnement privé.
Aucune clé privée ni mot de passe n’est inclus dans le dépôt.

Avec Node.js 24 : `npm install --prefix tests` puis `npm test --prefix tests`.
Les dépendances de tests sont ignorées dans Git. L’APK et le SHA-256 sont dans
`distribution/`. Les anciens états de configuration dans `LISEZMOI.txt`
constituent l’historique ; ce guide décrit le fonctionnement actuel.

## Transfert initial

Le dossier `bootstrap/` contient les 26 parties de l’archive validée 7.20.
Le workflow d’initialisation contrôle le SHA-256 de l’ensemble avant extraction.
Un marqueur empêche de réécrire les sources lors d’une relance. Ce transfert
initial n’est pas nécessaire pour les mises à jour suivantes.

## Dépannage

- Pas de proposition : vérifier Internet, le dépôt saisi sans `.git`, l’option
  automatique, et qu’une version plus récente a bien été publiée. Le contrôle
  peut aussi être lancé manuellement dans les paramètres.
- Échec de publication : consulter Actions ; ne pas modifier `version.json`
  pour annoncer une version dont l’APK n’est pas disponible.
- Installation refusée : conserver l’application et vérifier sa signature ainsi
  que les autorisations Android d’installation depuis la source choisie.
- Dictée indisponible : vérifier le service vocal Android ou utiliser le clavier.
- Waze hors cadre : vérifier permissions et firmware du poste. Aucun test
  physique sur autoradio n’est annoncé dans cette livraison.

## Préparer l’APK des décors validés (branche de travail)

Le code des décors et les captures de contrôle sont dans la branche
`feat/widget-decors-illustres`. L’artefact `widget-jour-nuit` du workflow de
vérification contient les captures produites par le moteur Canvas avec la
voiture vue de dos ; ce ne sont pas des maquettes générées par IA.

La préparation de l’APK demande la clé de signature originale, absente du dépôt,
et les Android SDK Build Tools (`apksigner`, `zipalign`).
Sur le poste qui possède cette clé, après les tests :

```sh
python outils/preparer_apk_decors.py --keystore CHEMIN_VERS_LA_CLE_ORIGINALE
```

Le mot de passe est demandé sans affichage. Il peut aussi être fourni dans
`ACCUEIL_SIGNING_PASSWORD` et, si le mot de passe de clé est distinct,
`ACCUEIL_KEY_PASSWORD`. Ne jamais enregistrer ces valeurs ou la clé dans Git.

L’outil prépare une copie des assets en version 7.24 et le manifeste Android
avec le code 94, construit et signe l’APK, puis compare son certificat avec
celui de l’APK 7.23. Une signature différente bloque la sortie. Il affiche le
SHA-256 et laisse `version.json` inchangé. Aucune publication ni annonce aux
autoradios n’a lieu à ce stade. L’installation et les performances sur le poste,
l’examen visuel et la préparation de la release restent à faire.
