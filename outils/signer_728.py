"""Entrée interactive du dossier privé : signe la version normale avec sa clé existante."""
from pathlib import Path
import argparse,getpass,os,subprocess,sys
root=Path(__file__).resolve().parent.parent
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--keystore',type=Path,default=root/'signature_privee/accueil2008gt.p12')
p.add_argument('--output',type=Path,default=root/'distribution/Accueil2008GT_v7.28.apk')
p.add_argument('--apksigner',default=str(root/'outils/apksigner_portable.py'))
a=p.parse_args()
if not a.keystore.is_file():raise SystemExit('Clé d’origine absente. Aucune nouvelle clé ne sera créée.')
if not os.environ.get('ACCUEIL_SIGNING_PASSWORD'):os.environ['ACCUEIL_SIGNING_PASSWORD']=getpass.getpass('Mot de passe de la clé d’origine (non affiché) : ')
raise SystemExit(subprocess.call([sys.executable,str(root/'outils/preparer_apk728.py'),'--keystore',str(a.keystore),'--apksigner',a.apksigner,'--output',str(a.output)]))
