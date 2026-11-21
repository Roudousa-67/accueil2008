# Accueil 2008 GT — 7.38 : trois défauts corrigés dans la détection du décor

Contexte : en 7.37, Internet fonctionnait (adresse et météo affichées à Geispolsheim-Gare), mais le décor restait sur Campagne dans le village.

Un essai de bout en bout (application complète dans Chromium, faux pont Android reproduisant le vrai) a montré que la logique du décor fonctionne quand les données cartographiques arrivent : Village en 2 s. La relecture du code a relevé trois défauts propres aux conditions réelles :

1. **Position « réseau » prise pour la position GPS.** Le pont natif envoie aussi, toutes les 10 s, la position du fournisseur « network » (précision d'environ 1 km, décalée de plusieurs centaines de mètres). Elle écrasait la position GPS : décor évalué comme « GPS imprécis » et recherche de routes possible au mauvais endroit. Elle est maintenant ignorée tant qu'une position GPS précise (≤ 50 m) a moins de 5 s.
2. **Recherche des routes bloquable en silence.** Elle n'était lancée que dans `onLoc`, après l'enregistrement du trajet, et dans une minuterie de 10 s, après la mise à jour des stations. Une erreur dans l'une de ces fonctions, avalée par le pont natif, empêchait toute recherche. Chaque étape est maintenant isolée, la recherche a sa propre minuterie (3 s) et l'erreur est affichée.
3. **Aucun repli pour les villages sans serveur cartographique.** L'adresse Nominatim ne servait que pour l'autoroute. Une maison ou un bâtiment adressé à moins de 60 m signale désormais une zone habitée (Village ou Ville selon la localité).

Diagnostic (Widgets → Vue voiture et route → Données du décor) : positions réseau ignorées, adresse utilisée, dernière erreur de réception GPS.

Vérifications : suite complète, `tests/decor737.cjs` étendu (maison proche, position réseau ignorée, erreur isolée), essai de bout en bout dans trois situations — données reçues, serveur qui refuse (429), fonction de trajet en erreur : Village en 1 à 2 s dans les trois cas. Sur la 7.37 publiée, le cas « serveur qui refuse » restait sur Campagne.

Non vérifié sur l'autoradio ni contre le vrai serveur Overpass.
