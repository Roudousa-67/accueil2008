# Mise à jour 7.61

`route761.js` : alertes de la route reprises de la 7.51 (seules cette fois, sans le décor), affichées par le bandeau d'alertes existant (`V740.setAlert`).

- **ZFE** : contours `boundary=low_emission_zone` (Overpass, rayon 12 km, au plus toutes les 30 min ou après 8 km). Alerte 400-800 m avant d'entrer et en entrant, avec la vignette Crit'Air réglée. Au démarrage déjà dans une ZFE (ex. domicile) : pas d'alerte.
- **Tunnel devant** : tunnels routiers à 3 km (en roulant à plus de 30 km/h, requête au plus chaque minute et après 2 km). Alerte « allume tes feux » 700 m avant l'entrée, dans le sens de marche.
- **Aires d'autoroute** : `rest_area` / `services` à 25 km, services (WC, resto, café, douche, carburant, recharge, jeux, pique-nique) lus autour de l'aire.
- **Ce qu'il y a à la sortie** : sur autoroute, à moins de 4 km de la prochaine sortie (`Highway738.state.next`), le commerce choisi le plus proche (boulangerie, McDo, pharmacie, supermarché). Corrigé par rapport à la 7.51 : la recherche ne se faisait jamais si la sortie était repérée à plus de 8 km.

Réglages : GPS et navigation › Alertes de la route (Oui/Non par alerte, vignette Crit'Air, commerce cherché). Chaque alerte est aussi dans Nouveautés à tester (secours : coupure à distance possible via `distribution/off.json`).

`stations761.js` : « Rentable ? » dans Trajets › Stations. Pour chaque station ouverte avec un prix : plein (litres choisis : 20, 30, 40, 44 L ou « Plein » d'après le niveau du réservoir si la voiture l'envoie, réservoir réglé à 44 L) + carburant du trajet aller-retour depuis la position actuelle (distance par la route via OSRM, une requête pour toutes les stations, au plus toutes les 2 min ou après 1 km ; sinon vol d'oiseau + 30 % marqué « ≈ »). Conso : ordinateur de bord, sinon celle réglée (`fuelCons`). Comparé à la station la plus proche : 🏆 meilleur choix, ✅ rentable (−X €), ❌ pas rentable (+X €), ≈ pareil (moins de 30 centimes). Aussi dans la fiche de la station. Le temps du détour est affiché mais pas compté en euros.

`osm761.js` : les demandes à `overpass-api.de` qui échouent (saturé, « OpenStreetMap indisponible ») sont refaites sur `overpass.kumi.systems` puis `overpass.private.coffee` ; le serveur qui répond est gardé 15 min. Touche toutes les fonctions OpenStreetMap de l'appli sans les modifier.
