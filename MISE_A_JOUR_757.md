# Mise à jour 7.57

Ticket lu automatiquement.
- Téléphone (`docs/envoi.html`, en ligne dès la fusion) : pour un ticket, tesseract.js 5.1.1 (français) lit la photo (gris + contraste), écran « Vérifie les chiffres lus » (date, litres, prix au litre, total, compteur facultatif), puis envoi avec les chiffres dans le nom du fichier : `ticket_L42.10_P1.729_E72.79_K45210_D20261124.jpg` (date jamais dans le futur, au plus 2 ans en arrière). « Envoyer la photo seule » reste possible ; si la lecture échoue, on tape les chiffres.
- Autoradio (`ticket757.js`) : le nom gardé par le pont natif (`date-ticket-ticket_L…_P…_E…_K….jpg`) est analysé à la réception (et par « Joindre au plein ») ; « Ajouter un plein » est ouvert et rempli (sans écraser un champ déjà rempli), et rempli de nouveau après un redessin, pendant 30 minutes.
- Essai Chromium (412×915) sur un ticket dessiné et incliné : 42,1 L · 1,729 €/L · 72,79 € lus correctement.
