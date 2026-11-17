"""Transfère exactement l'APK 7.24 déjà signé ; aucune clé privée n'est incluse."""
import base64
import hashlib
import json
from pathlib import Path
import tempfile
import zlib

ROOT = Path(__file__).resolve().parent.parent
BASE_SHA = 'c5c691324d7c369afbcbb7d1e82a8184c179661712f66a3f9441fbf905dbdf0f'

def main():
    metadata = json.loads((ROOT / 'distribution/release.json').read_text())
    if metadata['version'] != '7.24':
        raise SystemExit('Ce transfert est réservé à la version 7.24.')
    target = ROOT / 'distribution/Accueil2008GT_v7.24.apk'
    if target.exists():
        if hashlib.sha256(target.read_bytes()).hexdigest() != metadata['sha256']:
            raise SystemExit('Un APK différent existe déjà ; aucun écrasement.')
        print('APK 7.24 présent, SHA-256 vérifié.')
        return
    source = (ROOT / 'distribution/Accueil2008GT_v7.23.apk').read_bytes()
    if hashlib.sha256(source).hexdigest() != BASE_SHA:
        raise SystemExit('APK de base incorrect.')
    patch = json.loads(zlib.decompress(base64.b64decode((ROOT / 'distribution/patch724-signe.b64').read_text(), validate=False)))
    if patch['base_sha256'] != BASE_SHA or patch['target_sha256'] != metadata['sha256']:
        raise SystemExit('Empreintes de transfert incohérentes.')
    with tempfile.NamedTemporaryFile(dir=target.parent, suffix='.apk.tmp', delete=False) as stream:
        temporary = Path(stream.name)
        try:
            for operation in patch['ops']:
                if operation[0] == 'copy':
                    offset, length = operation[1:]
                    if offset < 0 or length < 0 or offset + length > len(source):
                        raise ValueError('Plage de copie invalide')
                    stream.write(source[offset:offset + length])
                elif operation[0] == 'data':
                    stream.write(base64.b64decode(operation[1], validate=True))
                else:
                    raise ValueError('Opération de transfert inconnue')
            stream.flush()
            if hashlib.sha256(temporary.read_bytes()).hexdigest() != metadata['sha256']:
                raise ValueError('Reconstruction différente de l’APK signé')
        except BaseException:
            temporary.unlink(missing_ok=True)
            raise
    temporary.replace(target)
    print('APK 7.24 reconstruit : identité binaire et SHA-256 vérifiés.')

if __name__ == '__main__':
    main()
