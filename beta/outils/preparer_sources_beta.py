"""Superpose la fonctionnalité bêta aux assets 7.26 sans modifier ces derniers."""
from pathlib import Path
import shutil,sys

def prepare(source,destination,module):
 source,destination,module=map(Path,(source,destination,module))
 if source.resolve()==destination.resolve():raise ValueError('Les sources stables doivent rester séparées.')
 shutil.copytree(source,destination,dirs_exist_ok=True)
 p=destination/'v4.js';s=p.read_text();assert "APP_VERSION = '7.26'" in s
 s=s.replace("APP_VERSION = '7.26'","APP_VERSION = '7.27.1'").replace('/main/version.json?t=','/main/version-beta.json?t=').replace('Fichier version.json','Fichier version-beta.json')
 s=s.replace("const animate=()=>!!(window.Decor721&&Decor721.preview)||", "const animate=()=>!!(window.BetaRoad&&BetaRoad.animate())||!!(window.Decor721&&Decor721.preview)||")
 p.write_text(s)
 p=destination/'index.html';p.write_text(p.read_text().replace('</body>','<script src="beta727.js"></script>\n</body>'))
 if module.resolve()!=(destination/'beta727.js').resolve():shutil.copy2(module,destination/'beta727.js')

if __name__=='__main__':prepare(*sys.argv[1:4])
