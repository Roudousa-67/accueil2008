# Mise à jour 7.56

`ticket756.js` : le dernier ticket reçu (`file738:…`) est retenu (`pendingTicket756`) tant qu’aucun plein ne l’utilise. Après 5 minutes sans plein enregistré, alerte « Ticket non enregistré » (14 jours max) avec « Joindre au plein » / « Oublier ce ticket ». Dans Transfert depuis le téléphone, chaque photo .jpg/.png non rattachée a un bouton « Joindre au plein » (→ `Journeys733.receiveReceipt`).
