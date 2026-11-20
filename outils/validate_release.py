"""Vérifie la proposition d’APK avant publication manuelle et annonce aux appareils."""
import json,re,hashlib,zipfile,sys
from pathlib import Path
root=Path(__file__).resolve().parent.parent
metadata=root/(sys.argv[1] if len(sys.argv)>1 else 'version.json')
j=json.loads(metadata.read_text());v=j['version']
if not re.fullmatch(r'[0-9]+(?:\.[0-9]+){1,2}',v):raise SystemExit('Version invalide')
def number(value):
 if not isinstance(value,str) or not re.fullmatch(r'[0-9]+(?:\.[0-9]+){1,2}',value):raise SystemExit('Version publiée invalide')
 parts=tuple(map(int,value.split('.')))
 return parts+(0,)*(3-len(parts))
public=json.loads((root/'version.json').read_text())
# Les versions historiques peuvent être revérifiées en CI, sans autoriser leur publication OTA.
allow_historical='--historical-check' in sys.argv[2:]
if number(v)<number(public['version']) and not allow_historical:raise SystemExit('Retour à une ancienne version refusé')
name=f'Accueil2008GT_v{v}.apk'
url=f'https://github.com/Roudousa-67/accueil2008/releases/download/v{v}/{name}'
if j.get('apk')!=url:raise SystemExit('Lien APK incompatible avec le dépôt/version')
p=root/'distribution'/name
lines=(root/'distribution/SHA256SUMS').read_text().splitlines()
expected=[line.split()[0] for line in lines if len(line.split())==2 and line.split()[-1]=='distribution/'+name]
if len(expected)!=1 or hashlib.sha256(p.read_bytes()).hexdigest()!=expected[0]:raise SystemExit('SHA-256 incorrect')
with zipfile.ZipFile(p) as z:
 if z.testzip() or ("APP_VERSION = '"+v+"'") not in z.read('assets/v4.js').decode():raise SystemExit('Version des assets APK incohérente')
print('Version, lien GitHub, ZIP APK et SHA-256 cohérents :',v)
