"""Prépare un APK de test signé avec la clé d'origine, sans publier de mise à jour."""
import argparse
import getpass
import hashlib
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parent.parent

def run(args):
    return subprocess.run([str(a) for a in args], check=True, text=True, capture_output=True).stdout

def sdk_tool(name, explicit):
    if explicit:
        return explicit
    found = shutil.which(name)
    if found:
        return found
    for env in ("ANDROID_HOME", "ANDROID_SDK_ROOT"):
        sdk = os.environ.get(env)
        if not sdk:
            continue
        for build in sorted((Path(sdk) / "build-tools").glob("*"), reverse=True):
            for suffix in ("", ".bat", ".exe"):
                candidate = build / (name + suffix)
                if candidate.is_file():
                    return str(candidate)
    raise SystemExit(name + " introuvable : installer les Android SDK Build Tools ou fournir son chemin.")

def certificates(tool, apk):
    text = run([tool, "verify", "--print-certs", apk])
    values = set(re.findall(r"certificate SHA-256 digest: ([0-9a-fA-F]+)", text))
    if not values:
        raise SystemExit("Impossible de vérifier le certificat de signature.")
    return {value.lower() for value in values}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--keystore", required=True, type=Path)
    parser.add_argument("--key-alias")
    parser.add_argument("--apksigner")
    parser.add_argument("--zipalign")
    parser.add_argument("--output", type=Path, default=ROOT / "distribution/Accueil2008GT_v7.24.apk")
    args = parser.parse_args()
    if not args.keystore.is_file():
        raise SystemExit("Clé de signature absente. Ne pas utiliser une nouvelle clé.")
    if args.output.exists():
        raise SystemExit("Le fichier de sortie existe déjà ; choisir un nouveau chemin.")
    signer = sdk_tool("apksigner", args.apksigner)
    aligner = sdk_tool("zipalign", args.zipalign)
    original = ROOT / "distribution/Accueil2008GT_v7.23.apk"
    if hashlib.sha256(original.read_bytes()).hexdigest() != "c5c691324d7c369afbcbb7d1e82a8184c179661712f66a3f9441fbf905dbdf0f":
        raise SystemExit("L’APK de base ne correspond pas à la version 7.23 vérifiée.")
    expected = certificates(signer, original)
    password = os.environ.get("ACCUEIL_SIGNING_PASSWORD") or getpass.getpass("Mot de passe de la clé (non affiché) : ")
    os.environ["ACCUEIL_SIGNING_PASSWORD"] = password
    os.environ.setdefault("ACCUEIL_KEY_PASSWORD", password)
    with tempfile.TemporaryDirectory(prefix="accueil724-") as folder:
        work = Path(folder)
        assets = work / "assets"
        shutil.copytree(ROOT / "sources_assets", assets)
        script = assets / "v4.js"
        data = script.read_text(encoding="utf-8")
        marker = "APP_VERSION = '7.23'"
        if data.count(marker) != 1 and data.count("APP_VERSION = '7.24'") != 1:
            raise SystemExit("Version des sources inattendue ; préparation interrompue.")
        script.write_text(data.replace(marker, "APP_VERSION = '7.24'"), encoding="utf-8")
        manifest = work / "manifest-original.xml"
        with zipfile.ZipFile(original) as package:
            manifest.write_bytes(package.read("AndroidManifest.xml"))
        patched = work / "manifest-724.xml"
        run([sys.executable, ROOT / "outils/axml.py", manifest, patched, "7.24", "94"])
        unsigned, aligned, signed = (work / name for name in ("unsigned.apk", "aligned.apk", "signed.apk"))
        run([sys.executable, ROOT / "outils/build.py", original, unsigned, assets, patched])
        run([aligner, "-f", "4", unsigned, aligned])
        command = [signer, "sign", "--ks", args.keystore, "--ks-pass", "env:ACCUEIL_SIGNING_PASSWORD", "--key-pass", "env:ACCUEIL_KEY_PASSWORD", "--out", signed]
        if args.key_alias:
            command += ["--ks-key-alias", args.key_alias]
        if args.keystore.suffix.lower() in (".p12", ".pfx"):
            command += ["--ks-type", "PKCS12"]
        run(command + [aligned])
        if certificates(signer, signed) != expected:
            raise SystemExit("Signature différente de l’APK installé : aucune sortie conservée.")
        run([aligner, "-c", "4", signed])
        with zipfile.ZipFile(signed) as package:
            if package.testzip() or "APP_VERSION = '7.24'" not in package.read("assets/v4.js").decode():
                raise SystemExit("Vérification du paquet impossible.")
            if "Perspective commune" not in package.read("assets/decor721.js").decode():
                raise SystemExit("Le nouveau rendu de forêt manque dans le paquet.")
        args.output.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(signed, args.output)
    print("APK signé préparé :", args.output)
    print("SHA-256 :", hashlib.sha256(args.output.read_bytes()).hexdigest())
    print("Aucune publication effectuée. Tester l’APK avant de préparer la release.")
    return 0

if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except subprocess.CalledProcessError as error:
        print("Échec d’un outil de construction ou de signature ; aucun APK publié.", file=sys.stderr)
        raise SystemExit(1) from error
