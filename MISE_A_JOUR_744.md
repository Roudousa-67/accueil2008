# Mise à jour 7.44

## Rechercher l'affichage, 2e passage
Le premier résultat (7.43) montre : autoradio ROCO K706 (Unisoc UIS7862S, firmware QF), Android 10 réel (affiché « 14 »), fenêtre libre active (persist.sys.qf.use_freeform), pas de root, encastrement refusé à notre appli, Waze non encastrable mais redimensionnable, droit REORDER_TASKS accordé. Le lanceur d'origine n'apparaît pas : il est peut-être désactivé ou porte un nom du fabricant.

Ajouts : applis du fabricant (QF, ZJ, Hiworld, CarPlay) lues en priorité, lanceurs désactivés listés, liste de toutes les applis ; choix de l'appli d'essai (les Réglages Android n'ont pas d'icône sur ce poste, d'où l'échec de l'essai 2) ; essai 3 (Waze passé en plein écran derrière, puis l'appli) et essai 4 (Waze relancé dans un cadre hors de l'écran, puis l'appli), avec la question « revenu dans le cadre ? ».

## Tout automatique
Un seul bouton « Tout rechercher » enchaîne la recherche puis les quatre essais, côté natif : entre chaque essai, l'appli revient toute seule au premier plan (AppTask.moveToFront, sans droit spécial). Rien à toucher : l'utilisateur filme l'écran avec son téléphone, et le résultat visuel se lit sur la vidéo. À la fin, le PDF se crée et l'e-mail s'ouvre prérempli avec l'adresse saisie une fois sur l'autoradio (jamais dans le code, le dépôt étant public).

## Vérifications
Suite complète ; Java compilé contre l'API Android 10. Non essayé sur l'autoradio.
