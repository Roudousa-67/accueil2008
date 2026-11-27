# Mise à jour 7.64

- `settings738.js` : une rubrique ne peut plus apparaître deux fois dans une catégorie (Système avait « Nouveautés à tester » et « Rechercher l'affichage » en double).
- `v723.js` : les champs sans titre (« Champ de … ») prennent le texte de leur étiquette, du texte juste avant ou du bloc qui les contient ; la valeur affichée à côté (ex. « 34 ») n'est plus collée au titre.
- `settings764.js` :
  - Widgets › Vue voiture et route : **taille du widget route** (petit 4, moyen 5, grand 6 colonnes sur 12 ; les widgets juste à droite et en dessous s'adaptent ; disposition libre seulement) et **fluidité du décor** (`Fluid764` lu par la boucle de la route dans `v4.js` : Économie = une image sur 3, Normal = adaptatif, Fluide = au moins une sur 2).
  - Système › Sauvegarde : **copie de sécurité chaque semaine** dans un fichier (`Transfer738.saveText`), bouton « Récupérer sur mon téléphone » (QR de téléchargement). En plus de la sauvegarde automatique existante.
  - Système › Stockage et nettoyage : **nettoyage automatique chaque semaine** (photos de tickets de plus d'un an, photos orphelines, caches de logos). Rien en roulant.
