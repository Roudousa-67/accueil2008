# Mise à jour 7.53

## 1re nouveauté du plan : désinstaller par appui long
`uninstall753.js` (repris de la 7.51, seul) + natif `uninstall(pkg)` / `installed(pkg)` ; permission REQUEST_DELETE_PACKAGES ajoutée par `outils/axml.py` (vérifiée dans publier753.yml).

## Revenir en arrière (`secours753.js`)
- « Tout couper » / « Tout remettre » en haut de Nouveautés à tester.
- Mode secours : 3 lancements de l’appli en 3 minutes → toutes les nouveautés coupées.
- Erreurs en série (5 en 1 minute) venant d’un fichier 7.53+ → tout coupé.
- Coupure à distance : `distribution/off.json` (`{"off":["id"]}`) lu au démarrage puis toutes les 3 h.

Un vrai retour à un APK plus ancien est impossible sans désinstaller (Android refuse un numéro de version plus petit) : en cas de problème grave, je republie l’ancien code sous un numéro plus grand, comme la 7.52.
