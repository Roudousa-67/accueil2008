"""Prépare un delta public de l'APK déjà signé, sans clé privée."""
from pathlib import Path
import hashlib,zipfile,struct,base64,json,zlib
r=Path(__file__).resolve().parent.parent
bp=r/'distribution/Accueil2008GT_v7.26.apk';tp=r/'distribution/Accueil2008GT_v7.33.apk'
b=bp.read_bytes();t=tp.read_bytes();ops=[];cursor=0
with zipfile.ZipFile(bp) as bz,zipfile.ZipFile(tp) as tz:
    originals={i.filename:i for i in bz.infolist()}
    for i in tz.infolist():
        o=originals.get(i.filename)
        if not o:continue
        # Local headers may differ; copy the exact compressed payload when identical.
        def payload(data,item):
            nl,el=struct.unpack_from('<HH',data,item.header_offset+26)
            start=item.header_offset+30+nl+el
            return start,data[start:start+item.compress_size]
        bs,bc=payload(b,o);ts,tc=payload(t,i)
        if tc!=bc or not tc:continue
        if ts>cursor:ops.append(['data',base64.b64encode(t[cursor:ts]).decode()])
        ops.append(['copy',bs,len(tc)]);cursor=ts+len(tc)
if cursor<len(t):ops.append(['data',base64.b64encode(t[cursor:]).decode()])
patch={'base_sha256':hashlib.sha256(b).hexdigest(),'target_sha256':hashlib.sha256(t).hexdigest(),'ops':ops}
s=base64.b64encode(zlib.compress(json.dumps(patch,separators=(',',':')).encode(),9)).decode()
for i,start in enumerate(range(0,len(s),48000)):(r/f'distribution/patch733-signe.part{i:02d}').write_text(s[start:start+48000])
print('Delta public',len(s),'caractères,',len(ops),'opérations')
