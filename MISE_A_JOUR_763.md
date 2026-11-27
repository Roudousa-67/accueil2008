# Mise à jour 7.63

`info760.js` refait : la 7.60 ne faisait des images que pour les réglages à plusieurs boutons (Oui / Non…) ; les interrupteurs (un seul bouton, `togBtn` ou « Activé » / « Désactivé » écrit) n'avaient rien.
- Interrupteur : image de l'accueil, bascule, deuxième image, bascule de retour (réglage remis comme avant). Images « Activé » et « Désactivé ».
- Choix multiples : une image par choix du même groupe que le choix actuel (4 au plus) ; les boutons d'action (« Effacer », « Tester »…) ne sont jamais essayés.
- Si l'accueil ne change pas, deux images dessinées (interrupteur allumé / éteint + ce que fait le réglage) au lieu d'un simple texte.
- Bouton « Mettre « X » » sous l'autre état, « C'est le réglage actuel » sous l'état en cours.
`v723.js` : note si un bouton est un interrupteur (`aria-pressed`). `apparence760.js` : une image de l'accueil refusée par le navigateur n'annule plus toute la capture.
