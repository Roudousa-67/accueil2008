# Mise à jour 7.61

`route761.js` : alertes de la route reprises de la 7.51 (seules cette fois, sans le décor), affichées par le bandeau d'alertes existant (`V740.setAlert`).

- **ZFE** : contours `boundary=low_emission_zone` (Overpass, rayon 12 km, au plus toutes les 30 min ou après 8 km). Alerte 400-800 m avant d'entrer et en entrant, avec la vignette Crit'Air réglée. Au démarrage déjà dans une ZFE (ex. domicile) : pas d'alerte.
- **Tunnel devant** : tunnels routiers à 3 km (en roulant à plus de 30 km/h, requête au plus chaque minute et après 2 km). Alerte « allume tes feux » 700 m avant l'entrée, dans le sens de marche.
- **Aires d'autoroute** : `rest_area` / `services` à 25 km, services (WC, resto, café, douche, carburant, recharge, jeux, pique-nique) lus autour de l'aire.
- **Ce qu'il y a à la sortie** : sur autoroute, à moins de 4 km de la prochaine sortie (`Highway738.state.next`), le commerce choisi le plus proche (boulangerie, McDo, pharmacie, supermarché). Corrigé par rapport à la 7.51 : la recherche ne se faisait jamais si la sortie était repérée à plus de 8 km.

Réglages : GPS et navigation › Alertes de la route (Oui/Non par alerte, vignette Crit'Air, commerce cherché). Chaque alerte est aussi dans Nouveautés à tester (secours : coupure à distance possible via `distribution/off.json`).

`stations761.js` : Trajets › Stations.
- **Rentable ?** Montant en € (20/30/50/70 €, par défaut 50 €) ou en litres (20/30/40/44 L, ou « Plein » d'après le niveau du réservoir si la voiture l'envoie). En € : litres achetés − litres brûlés pour l'aller-retour = litres utiles ; l'écart avec la plus proche est ramené en € au prix de celle-ci. En litres : plein + carburant du trajet. Distance aller-retour par la route (OSRM, une requête pour toutes les stations, au plus toutes les 2 min ou après 1 km ; sinon vol d'oiseau + 30 %, « ≈ »). Conso : ordinateur de bord, sinon celle réglée. Dans la liste : seulement le gain ou la perte à côté du prix (vert, rouge, gris si moins de 30 centimes), 🏆 pour le meilleur choix. Dans la fiche : le calcul complet, comparé à la plus proche et à la moins chère au litre. Les stations fermées ne comptent pas.
- **Logos** : enseigne reconnue dans le nom ou les étiquettes OpenStreetMap (Total, Esso, Shell, BP, ARAL, JET, Avia, Eni, Leclerc, Carrefour, Intermarché, Auchan, Système U, Casino, Dyneff, Netto, Cora, Star, HEM, OMV, Westfalen, ORLEN, Raiffeisen, bft, Globus, Tamoil, Q1, Hoyer…). Icône du site de la marque (service d'icônes de Google, chargé par l'autoradio) sur une pastille aux couleurs de la marque ; sans réseau, les initiales.
- **Services** : flux officiel (`services`) + OpenStreetMap (`toilets`, `shop`, `car_wash`, `compressed_air`, `atm`…), séparés par un trait dans la liste (5 au plus) et en entier dans la fiche. `stations738.js` garde maintenant les étiquettes OpenStreetMap de chaque station (`s.tags`).
- **Filtre « Enseigne »** (liste et carte) : une marque, ★ mes préférées (bouton dans la fiche), ↺ déjà utilisées (station à moins de 150 m quand un nouveau plein est enregistré).

`osm761.js` : les demandes à `overpass-api.de` qui échouent (saturé, « OpenStreetMap indisponible ») sont refaites sur `overpass.kumi.systems` puis `overpass.private.coffee` ; le serveur qui répond est gardé 15 min. Touche toutes les fonctions OpenStreetMap de l'appli sans les modifier.
