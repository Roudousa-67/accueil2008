#!/usr/bin/env bash
# Construit l'appli compagnon « Accueil 2008 Masque » (compagnon/). Sans clé : APK non signé (vérification).
# Avec ACCUEIL_KEYSTORE (+ ACCUEIL_SIGNING_PASSWORD, ACCUEIL_KEY_PASSWORD facultatif) : APK signé avec la même clé
# que l'appli principale. Usage : outils/construire_masque.sh <dossier de sortie>
set -euo pipefail
out="$1"; mkdir -p "$out"
work="$(mktemp -d)"; trap 'rm -rf "$work"' EXIT
platform="$(find "$ANDROID_HOME/platforms" -name android.jar | sort -V | tail -n 1)"
bt="$(dirname "$(find "$ANDROID_HOME/build-tools" -name aapt -type f | sort -V | tail -n 1)")"
test -n "$platform" && test -x "$bt/aapt" && test -x "$bt/d8" && test -x "$bt/zipalign"
mkdir -p "$work/classes" "$work/dex"
javac --release 8 -encoding UTF-8 -cp "$platform" -d "$work/classes" compagnon/java/fr/gtline/accueil2008/masque/*.java
jar --create --file "$work/masque.jar" -C "$work/classes" .
"$bt/d8" --release --min-api 24 --lib "$platform" --output "$work/dex" "$work/masque.jar"
"$bt/aapt" package -f -M compagnon/AndroidManifest.xml -I "$platform" -F "$work/unsigned.apk"
(cd "$work/dex" && "$bt/aapt" add "$work/unsigned.apk" classes.dex)
"$bt/zipalign" -f -p 4 "$work/unsigned.apk" "$work/aligned.apk"
"$bt/aapt" dump badging "$work/aligned.apk" | grep -F "package: name='fr.gtline.accueil2008.masque' versionCode='1' versionName='1.0'"
if [ -n "${ACCUEIL_KEYSTORE:-}" ]; then
  args=(sign --ks "$ACCUEIL_KEYSTORE" --ks-type PKCS12 --ks-pass env:ACCUEIL_SIGNING_PASSWORD --out "$out/Accueil2008Masque.apk")
  if [ -n "${ACCUEIL_KEY_PASSWORD:-}" ]; then args+=(--key-pass env:ACCUEIL_KEY_PASSWORD); fi
  "$bt/apksigner" "${args[@]}" "$work/aligned.apk"
  "$bt/apksigner" verify "$out/Accueil2008Masque.apk"
else
  cp "$work/aligned.apk" "$out/Accueil2008Masque-non-signe.apk"
fi
ls -la "$out"
