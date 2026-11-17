# Livraison 7.25

Cette version conserve les réglages et les décors de la 7.24. Elle prépare la fluidité sans ajouter les portes ouvrantes.

| Demande | État | Résultat et limite |
|---|---|---|
| 1. Boucle de route | Fait | Arrêt hors écran/en pause/au repos sec ; cache des canvas renouvelé après rendu. L'aperçu de décor demandé dans les paramètres reste animé. Un changement de vitesse, de météo, d'heure ou de taille peut redessiner le widget au repos. |
| 2. Pause | Partiel | Hooks natifs par ActivityLifecycleCallbacks du provider, arrêt de la route/3D et des tâches d'affichage converties. Les minuteries mixtes historiques ne sont pas toutes supprimées : CAN, trajets et alertes sont conservés. Test firmware à faire. |
| 3. Cache store | Fait | Map en mémoire, clés a08_* inchangées, écritures regroupées ; pause, sauvegarde et restauration protégées. |
| 4. Chargements à la demande | Fait | Three/GLTF/RoomEnvironment/Meshopt au besoin ; MapLibre pour une carte interne et Leaflet comme repli. Aucune des deux cartes n'est supprimée car le repli WebGL reste utile. |
| 5. Compression du GLB | Fait avec réserve visuelle | 5 830 300 → 1 496 032 octets (−74,3 %). Même nombre de triangles, bornes à moins de 5 mm de la base. Textures WebP qualité 80 et quantification : une absence absolue de différence visuelle n'est pas garantie ; à vérifier sur le poste. |
| 6. WebView et icônes | Fait côté code | Priorité renderer et offscreen preraster sous garde de version Android ; le tiroir réutilise getIcon et son cache. Compilation Java vérifiée ; pas de mesure GPU matérielle. |
| 7. Mises à jour partielles | Partiel | Les champs courants continuent par paint/textContent ; requestRender725 regroupe les demandes différées. Les changements structurels et les anciennes chaînes render restent synchrones. |
| 8. Garde-fou | Fait | Mesure CPU des cycles de dessin ; moyenne >20 ms sur une fenêtre de 3 s et au moins 20 échantillons : niveau temporaire inférieur, message, interrupteur et rétablissement. Pas de baisse persistante des préférences. |

## Réponse sur le GPS

Oui, la boucle home5.js de 300 ms était encore présente dans la 7.24. Elle est supprimée, ainsi que les anciens recalages à 700 ms et 1,5 s et le polling Frame710 de 500 ms. Frame710 garde les événements et un secours à 1 seconde, actif seulement quand le cadre GPS est utilisé sur l'accueil. Les ouvertures explicitement demandées et la logique d'ouverture au démarrage restent disponibles. La reprise de la tâche GPS et la continuité Waze doivent être testées sur le matériel.

## Diagnostic

Système → Diagnostic · Performances : délai du premier rendu, FPS route observés, moyenne CPU de dessin, moyenne des rendus complets, intervalles et délais JS suivis, tâches d'affichage, boucles route/3D, mémoire JS si la WebView la fournit, préférences en attente.

Les compteurs n'incluent pas les tâches natives Android et ne constituent pas une mesure GPU. Le délai démarre au chargement du premier module JavaScript, pas au démarrage du processus Android. La cadence à l'arrêt est zéro après l'image statique.

## Mesures avant/après

Référence : commit 54875bf8713abdc0e38befa3caf8bbe119ac90c6 (7.24).
Le script tests/benchmark725.cjs compare les deux arbres sous Node/JSDOM avec Canvas CPU. Les résultats chiffrés sont joints dans distribution/MESURES725.json ; une deuxième mesure est produite par GitHub Actions. Les temps dépendent de la machine et ne promettent pas de gain chiffré sur UIS7862S.

Gains déterministes du scénario : 120 recherches de canvas deviennent 0 au repos ; 120 deviennent 0 hors accueil ; 1 000 lectures localStorage deviennent 0 après mise en cache. Une frame ponctuelle de restauration du défilement des paramètres est conservée.

## Validation et livraison

Les 547 contrôles existants et 42 nouveaux contrôles de performances passent, ainsi que le décodage du GLB par le GLTFLoader livré, la comparaison des triangles et des bornes et la compilation du pont Java.

Le nouvel APK incorpore un classes3.dex fraîchement compilé à partir des sources de cette branche. La préparation refuse un certificat différent de l'APK de base 7.23 et une source autre que 7.25. Même package, versionCode 95. Les secrets de signature ne sont jamais déposés dans le dépôt.

Après validation de l'APK signé, le workflow de publication crée la release 7.25 et met à jour version.json seulement après la disponibilité du téléchargement. Android peut demander la confirmation d'installation. Aucun test de conduite ou de fonctionnement physique sur ton autoradio n'est revendiqué.

Le modèle fourni séparément avec les portes animées est conservé hors de cet APK, conformément à l'objectif « aucune nouvelle fonction » de ton document.
