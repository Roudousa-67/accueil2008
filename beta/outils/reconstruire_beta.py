"""Reconstitue l’APK bêta déjà signé, sans accéder à une clé privée."""
import base64,zlib,json,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent.parent
BASE=ROOT/'distribution/Accueil2008GT_v7.26.apk'
OUT=ROOT/'beta/distribution/Accueil2008GT_v7.27.1.apk'
p=json.loads(zlib.decompress(base64.b64decode(''.join(x.read_text() for x in sorted((ROOT/'beta/distribution').glob('patch-beta-signe.part*'))))))
a=BASE.read_bytes();assert hashlib.sha256(a).hexdigest()==p['base_sha256']
b=bytearray()
for op in p['ops']:
 if op[0]=='copy':
  assert 0<=op[1]<=len(a) and 0<=op[2]<=len(a)-op[1]
  b.extend(a[op[1]:op[1]+op[2]])
 elif op[0]=='data':b.extend(base64.b64decode(op[1],validate=True))
 else:raise ValueError('Opération inconnue')
assert hashlib.sha256(b).hexdigest()==p['target_sha256']
OUT.parent.mkdir(parents=True,exist_ok=True);OUT.write_bytes(b)
print('APK bêta signé reconstitué, identité binaire vérifiée.')
