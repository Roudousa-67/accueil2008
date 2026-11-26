# Mise à jour 7.47

## Waze caché sur les autres pages de l'appli
7.46 : remettre l'accueil au premier plan (AppTask.moveToFront) ne suffisait pas — l'accueil y était déjà, Android ne réordonne rien, et la fenêtre libre de Waze restait au-dessus (essai en voiture du 26/11).

Sur la vidéo du 25/11, Waze disparaissait quand une appli plein écran passait par-dessus PUIS que l'accueil revenait devant. 7.47 reproduit cet enchaînement sans ouvrir d'autre appli : `Display743Native.hideNav()` ouvre SettingsVoiceActivity (thème translucide, déjà déclarée, hors des récents) dans une nouvelle tâche en plein écran ; elle remet la tâche de l'accueil devant après 180 ms puis se ferme (finishAndRemoveTask) 250 ms plus tard. Retour sur l'accueil : Waze relancé dans son cadre, comme en 7.46.

## Vérifications
Suite complète ; Java compilé contre l'API Android 10. Non essayé sur l'autoradio.
