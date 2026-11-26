# Mise à jour 7.50

## Nouveautés à tester
Réglages → Système → Nouveautés à tester : chaque nouveauté a « Activé », « Désactivé » et « Je n’aime pas ». « Je n’aime pas » la coupe tout de suite et l’inscrit dans le rapport de diagnostic (« À supprimer ») : elle est retirée à la mise à jour suivante. Module `Try750` (registre des nouveautés) pour toutes les versions à venir.

## Mise à jour en roulant
Quand une version sort pendant que la voiture roule, l’APK se télécharge sans fenêtre (Files721) ; l’installation est proposée automatiquement dès que la voiture est à l’arrêt depuis 2,5 s (feu rouge compris). Un appui sur « Installer » en roulant la met aussi en attente du prochain arrêt. L’installation elle-même reste à l’arrêt : c’est l’écran d’Android qui demande de valider.

## Ménage (sélection de l’Atelier)
Barre du bas sans Radio, Réglages et Musique (déjà dans la barre de gauche) ; pastille rouge de zone de danger supprimée (panneau du haut seulement) ; bouton « Dicter » retiré de la recherche des réglages ; choix du mode d’envoi retiré (Internet, Wi-Fi en secours automatique) ; l’ancien cadre encastré n’est plus essayé (droit refusé par l’autoradio), donc plus de message « Android refuse Waze dans le cadre » ; Performances et Écran d’accueil du poste rangés dans « Avancé » du rapport de diagnostic ; Nouveautés : 3 dernières versions, le reste plié ; anciens circuits de publication GitHub supprimés.

Pas encore fait : la page « Rechercher l’affichage » (retirée quand la 7.49 aura confirmé que Waze se range), le regroupement du code.

## Vérifications
Suite complète, plus `tests/v750.cjs`. Non essayé sur l’autoradio.
