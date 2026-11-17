# Accueil 2008 GT 7.25 — fluidité

- La route ne programme plus d'animation hors écran ou en arrière-plan ; à l'arrêt sans météo animée, elle dessine une image puis attend une modification.
- Liste des canvas gardée en mémoire entre les reconstructions de page.
- Anciennes boucles GPS à 300 ms, 500 ms, 700 ms et 1,5 s remplacées par le propriétaire Frame710 et un secours à 1 s lorsque le cadre est utilisé sur l'accueil.
- Préférences a08_* en mémoire ; écritures regroupées à environ 500 ms, vidées avant pause, sauvegarde et restauration.
- Cartes internes et bibliothèques 3D chargées à la demande, avec conservation du repli Leaflet.
- Modèle 3D actuel : 5 830 300 → 1 496 032 octets, Meshopt et textures WebP ; même nombre de triangles, cadrage contrôlé. Le modèle à portes ouvrantes n'est pas intégré à cette version.
- Hooks de pause/reprise via le provider Android ; réglages WebView et réutilisation du cache d'icônes.
- Diagnostic dans Système → Diagnostic · Performances ; garde-fou de niveau de décor, désactivable, sans effacer les choix de l'utilisateur.

586 contrôles automatisés, chargement du modèle par le véritable GLTFLoader et comparaison de sa géométrie réussis localement. La CI vérifie aussi le pont Android. Aucune mesure de FPS sur autoradio et aucun essai physique n'ont été réalisés.

La mise en pause des tâches d'affichage est ciblée : certaines anciennes minuteries mixtes de surveillance restent actives pour conserver trajets et alertes. Le regroupement des rendus complets est disponible pour les appels différés ; toutes les anciennes chaînes de rendu n'ont pas été réécrites.

Signature identique aux versions 7.23 et 7.24. Version Android interne : 95.
