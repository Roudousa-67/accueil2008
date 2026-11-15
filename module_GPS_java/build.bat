@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
rem ==== Réglages : à changer seulement si tu as installé ailleurs ====
set "SDK=C:\Android"
set "BT=%SDK%\build-tools\34.0.0"
set "PLAT=%SDK%\platforms\android-30\android.jar"
set "APKTOOL=%SDK%\apktool\apktool.jar"
set "IN=..\Accueil2008GT_v7.20.apk"
set "OUT=..\Accueil2008GT_v7.20_recompile.apk"
set "KS=..\outils\accueil2008gt.p12"

for %%F in ("%PLAT%" "%BT%\d8.bat" "%BT%\zipalign.exe" "%BT%\apksigner.bat" "%APKTOOL%" "%IN%" "%KS%") do if not exist %%F (echo [ERREUR] Introuvable : %%~F & goto fail)
where javac >nul 2>nul || (echo [ERREUR] Java JDK 17 non installe ou pas dans le PATH & goto fail)

if not defined KSPASS (echo Definir KSPASS dans votre environnement prive avant compilation & exit /b 1)

if exist work rmdir /s /q work
mkdir work\classes work\dex work\dex3

echo.
echo [1/6] Compilation du code Java...
javac -encoding UTF-8 --release 8 -cp "%PLAT%" -d work\classes java\fr\gtline\accueil2008\GpsDock.java java\fr\gtline\accueil2008\GpsDockInit.java java\fr\gtline\accueil2008\SettingsVoiceActivity.java || goto fail
jar --create --file work\gps.jar -C work\classes . || goto fail

echo [2/6] Conversion pour Android (dex)...
call "%BT%\d8.bat" --release --min-api 24 --lib "%PLAT%" --output work\dex work\gps.jar || goto fail
copy /y work\dex\classes.dex work\dex3\classes3.dex >nul || goto fail

echo [3/6] Ouverture de l'APK...
java -jar "%APKTOOL%" d -s -f -o work\apk "%IN%" || goto fail

echo [4/6] Modification du manifeste...
powershell -NoProfile -ExecutionPolicy Bypass -File patch_manifest.ps1 "work\apk\AndroidManifest.xml" || goto fail

echo [5/6] Reconstruction de l'APK...
java -jar "%APKTOOL%" b -o work\unsigned.apk work\apk || goto fail
jar --update --file work\unsigned.apk --no-manifest -C work\dex3 classes3.dex || goto fail
"%BT%\zipalign.exe" -f -p 4 work\unsigned.apk work\aligned.apk || goto fail

echo [6/6] Signature...
call "%BT%\apksigner.bat" sign --ks "%KS%" --ks-type PKCS12 --ks-key-alias accueil2008 --ks-pass "pass:%KSPASS%" --out "%OUT%" work\aligned.apk || goto fail
call "%BT%\apksigner.bat" verify "%OUT%" || goto fail

echo.
echo ==========================================
echo  TERMINE : %OUT%
echo ==========================================
pause
exit /b 0

:fail
echo.
echo ****** ECHEC : lis le message juste au-dessus et envoie-moi une photo ******
pause
exit /b 1
