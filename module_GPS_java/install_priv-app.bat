@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
rem Installe l'appli comme appli système privilégiée (root / adb root obligatoire)
set "ADB=C:\Android\platform-tools\adb.exe"
set "APK=..\Accueil2008GT_v7.19.apk"
set "XML=privapp-permissions-fr.gtline.accueil2008.xml"
if not exist "%ADB%" (echo [ERREUR] adb introuvable : %ADB% & goto fail)
if not exist "%APK%" (echo [ERREUR] Lance d'abord build.bat & goto fail)

echo Autoradio branche ?  Liste des appareils :
"%ADB%" devices
echo.
echo ATTENTION : fais une sauvegarde de tes reglages dans l'appli avant de continuer.
pause

"%ADB%" root || goto fail
timeout /t 3 >nul
"%ADB%" remount || (echo Remount refuse : essaie "adb disable-verity", redemarre l'autoradio, puis relance ce fichier & goto fail)
rem Ne pas desinstaller : cela effacerait les donnees. Mise a jour signee uniquement.
"%ADB%" shell mkdir -p /system/priv-app/Accueil2008GT || goto fail
"%ADB%" push "%APK%" /system/priv-app/Accueil2008GT/Accueil2008GT.apk || goto fail
"%ADB%" push "%XML%" /system/etc/permissions/%XML% || goto fail
"%ADB%" shell chmod 755 /system/priv-app/Accueil2008GT
"%ADB%" shell chmod 644 /system/priv-app/Accueil2008GT/Accueil2008GT.apk
"%ADB%" shell chmod 644 /system/etc/permissions/%XML%
echo.
echo OK. L'autoradio va redemarrer.
"%ADB%" reboot
pause
exit /b 0
:fail
echo ****** ECHEC : envoie-moi une photo du message ******
pause
exit /b 1
