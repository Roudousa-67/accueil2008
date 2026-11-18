"""Adaptateur portable pour Signer728 et la bibliothèque officielle Android apksig."""
from pathlib import Path
import os,shutil,subprocess,sys
folder=Path(__file__).resolve().parent/'portable'
if not (folder/'Signer728.class').is_file() or not (folder/'apksig.jar').is_file():
    raise SystemExit('Outils portables absents : utiliser apksigner du SDK Android ou le dossier privé complet.')
java=shutil.which('java')
if not java:raise SystemExit('Java 17 ou ultérieur est nécessaire pour la signature.')
raise SystemExit(subprocess.call([java,'-cp',str(folder)+os.pathsep+str(folder/'apksig.jar'),'Signer728',*sys.argv[1:]]))
