# Mise à jour 7.41

## 1. Panneau du village ou de la ville dans l'image
En entrant dans un village ou une ville, son nom s'affiche en haut à droite du widget, sous la météo (panneau blanc bordé de rouge). En sortant, le même panneau barré de rouge. Une seule fois par entrée. Durée réglable : 5, 10, 20 secondes ou « Tout le temps » (reste tant qu'on est dedans) — GPS et navigation → Panneaux dans l'image. Le nom est revérifié toutes les 10 secondes (réglable 10 s, 15 s, 30 s, 1 min) ; la liste des villages voisins (autoroute) n'est redemandée qu'après 2 km ou 2 minutes pour ne pas surcharger le service.

## 2. Station sur l'autoroute
Le portique garde le prix, avec un texte plus grand (nom court de l'enseigne, prix en jaune, carburant, distance) et sans les flèches. Un petit panneau bleu s'affiche en haut, entre la vitesse et la météo, 10 secondes avant de passer sous le portique et 10 secondes après. Durée réglable (5, 10, 20 s) ou désactivé, même page de réglages. Le panneau « sortie à 500 m » est au même endroit et passe en priorité : il ne cache plus la météo.

## 3. Ticket ou GPX par QR en 4G
Mode par défaut : « Par Internet (4G) ». Le QR ouvre une page sur le téléphone (https://roudousa-67.github.io/accueil2008/envoi.html) ; la photo part dans une boîte aux lettres temporaire sur ntfy.sh dont l'adresse est un code secret propre à chaque QR (valable 15 minutes) ; l'autoradio la relève toutes les 3 secondes et la télécharge. Pas de Wi-Fi ni de Bluetooth entre le téléphone et l'autoradio. L'ancien mode reste disponible : Trajets et carburant → Transfert depuis le téléphone → Mode d'envoi → Par le Wi-Fi de l'autoradio.

À activer une fois sur GitHub : dépôt accueil2008 → Settings → Pages → Build and deployment → Source « Deploy from a branch » → Branch « main », dossier « /docs » → Save. Tant que la page n'est pas en ligne, l'autoradio affiche cette marche à suivre et un bouton « Passer par le Wi-Fi ».

## Vérifications
Suite complète, plus `tests/v741.cjs` (village à l'entrée, barré à la sortie, une seule fois, tout le temps ; station 8 s avant, 5 s après, retirée après 11 s, désactivable ; réglages ; QR : adresse secrète, boîte relevée, photo téléchargée une seule fois, fiche de plein ouverte, page absente → explications et repli Wi-Fi) et le serveur Java (téléchargement refusé hors ntfy.sh, photo reçue, fichier invalide, adresse 4G jamais proposée dans le QR Wi-Fi). Non essayé sur l'autoradio ; ntfy.sh et GitHub Pages pas joignables pendant le développement.
