# Mise à jour 7.65

`settings765.js` : Réglages › Accueil et affichage › Barre de raccourcis. Il y avait deux listes qui se recoupaient : « Modifier » (barre de gauche `dockOrder730` : ordre, appli, retrait, dans une fenêtre) et « Choisir » (appli de chaque bouton `dock_<id>`, utilisée par la barre de gauche **et** la rangée d'applis de l'accueil). Maintenant :
- « Barre de gauche : ordre et appli de chaque bouton » : chaque bouton affiche « Ouvre : <appli> », avec « Choisir l'appli », ▲ ▼ et « Retirer » directement sur la ligne.
- « Autres boutons (rangée d'applis de l'accueil) » : seulement ceux qui ne sont pas dans la barre de gauche (CarPlay / AA, Ma voiture…), avec leur appli et « Choisir l'appli ».
Les réglages (`dockOrder730`, `dock_<id>`) ne changent pas.

Boutons d’action dans les autres pages (51) : relus un par un dans la liste générée, ce sont de vraies commandes à leur place (Ouvrir, Vérifier, Importer, Nettoyer…), laissés tels quels. `info760.js` reconnaît en plus « Activée », « Affichée » et « Détection activée » comme interrupteurs (images Activé / Désactivé).
