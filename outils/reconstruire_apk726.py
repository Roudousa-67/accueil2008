import base64,zlib,json,hashlib
from pathlib import Path
r=Path(__file__).resolve().parent.parent
base=(r/'distribution/Accueil2008GT_v7.25.apk').read_bytes()
encoded=''.join(p.read_text() for p in sorted((r/'distribution').glob('patch726-signe.part*')))
p=json.loads(zlib.decompress(base64.b64decode(encoded)))
assert hashlib.sha256(base).hexdigest()==p['base_sha256']
out=bytearray()
for op in p['ops']:
 if op[0]=='copy':
  assert 0<=op[1]<=len(base) and 0<=op[2]<=len(base)-op[1]
  out.extend(base[op[1]:op[1]+op[2]])
 elif op[0]=='data':out.extend(base64.b64decode(op[1],validate=True))
 else:raise ValueError('Opération inconnue')
assert hashlib.sha256(out).hexdigest()==p['target_sha256']
(r/'distribution/Accueil2008GT_v7.26.apk').write_bytes(out)
print('Identité binaire de l’APK signé vérifiée.')
