"""Vérifie le lien, le paquet APK et l’empreinte avant publication manuelle."""
import json,re,hashlib,zipfile
from pathlib import Path
root=Path(__file__).resolve().parent.parent
j=json.loads((root/'version.json').read_text())
v=j['version']
if not re.fullmatch(r'[0-9]+(?:\.[0-9]+){1,2}',v):raise SystemExit('Version invalide')
name=f'Accueil2008GT_v{v}.apk'
url=f'https://github.com/Roudousa-67/accueil2008/releases/download/v{v}/{name}'
if j.get('apk')!=url:raise SystemExit('Lien APK incompatible avec le dépôt/version')
p=root/'distribution'/name
lines=(root/'distribution/SHA256SUMS').read_text().splitlines()
expected=[line.split()[0] for line in lines if line.split()[-1]=='distribution/'+name]
if len(expected)!=1 or hashlib.sha256(p.read_bytes()).hexdigest()!=expected[0]:raise SystemExit('SHA-256 incorrect')
with zipfile.ZipFile(p) as z:
 if z.testzip() or z.read('assets/v4.js').decode().find("APP_VERSION = '"+v+"'")<0:raise SystemExit('Version des assets APK incohérente')
print('Version, lien GitHub, ZIP APK et SHA-256 cohérents :',v)
