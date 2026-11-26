# Mise à jour 7.48

## Waze toujours visible sur Trajets (essai du 26/11, 7.47)
Deux causes possibles, corrigées ensemble :
1. Le masquage ne se déclenchait que si l'appli avait elle-même ouvert Waze depuis son démarrage (`gbKey`). Après une mise à jour, l'appli redémarre alors que Waze est encore ouvert dans le cadre : rien ne se passait. Désormais seul le mode « cadre » compte.
2. SettingsVoiceActivity a un thème translucide : Android la traite comme une vitre et ne fait pas passer Waze dessous. Elle devient opaque (fond noir, `Activity.convertFromTranslucent` par réflexion) quand elle sert au masquage.

Si Waze reste encore visible : Réglages → Système → Rapport de diagnostic, lignes « cadre » (« page … : Waze caché (…) »).

## Vérifications
Suite complète ; Java compilé contre l'API Android 10. Non essayé sur l'autoradio.
