"""Reconstitue exactement l’APK 7.31 déjà signé, sans accéder à une clé privée."""
from pathlib import Path
import base64,hashlib,json,zlib
root=Path(__file__).resolve().parent.parent
base=(root/'distribution/Accueil2008GT_v7.26.apk').read_bytes()
parts=sorted((root/'distribution').glob('patch731-signe.part*'))
assert parts,'Delta signé absent.'
patch=json.loads(zlib.decompress(base64.b64decode(''.join(p.read_text() for p in parts),validate=True)))
assert hashlib.sha256(base).hexdigest()==patch['base_sha256']
out=bytearray()
for op in patch['ops']:
    if op[0]=='copy':
        assert 0<=op[1]<=len(base) and 0<=op[2]<=len(base)-op[1]
        out.extend(base[op[1]:op[1]+op[2]])
    elif op[0]=='data':out.extend(base64.b64decode(op[1],validate=True))
    else:raise ValueError('Opération non reconnue.')
meta=json.loads((root/'distribution/release731.json').read_text())
assert hashlib.sha256(out).hexdigest()==patch['target_sha256']==meta['sha256']
path=root/'distribution/Accueil2008GT_v7.31.apk';path.write_bytes(out)
print('APK signé 7.31 reconstitué, identité binaire vérifiée.')
