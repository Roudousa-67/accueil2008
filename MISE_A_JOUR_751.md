# Mise à jour 7.51

## Analyser le lanceur d’origine
Réglages → Système → Analyser le lanceur d’origine : liste l’appli « Thème » et les lanceurs du poste, extrait pour chacun le manifeste, le code (classes*.dex, .odex/.vdex), les petits fichiers assets et une fiche des composants (activités, services, récepteurs, permissions) dans `Téléchargements/Accueil2008/code-launcher-*.zip` (23 Mo max), puis ouvre l’e-mail. Natif : `Display743Native.themeCandidates()` et `exportCode(paquets, email)`. But : comprendre comment le lanceur d’origine cache et rouvre l’appli du petit carré, avant de séparer l’appli en deux.
