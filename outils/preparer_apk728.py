"""Construit la version normale 7.28 depuis la 7.26, puis la signe avec la clé d’origine."""
from pathlib import Path
import argparse,hashlib,json,os,re,shutil,struct,subprocess,sys,tempfile,zipfile

ROOT=Path(__file__).resolve().parent.parent
BASE_SHA='b101e50c1e1c0f295ea1b8471f1ee8aa87a9b0a6b2b73abadc7f841f2330f109'
def run(args,env=None):
    if str(args[0]).endswith('.py'):args=[sys.executable,*args]
    r=subprocess.run(list(map(str,args)),capture_output=True,text=True,env=env)
    if r.returncode:raise RuntimeError('Un outil de construction ou de signature a échoué ; vérifier sa configuration privée.')
    return r.stdout
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def cert(tool,apk):
    values=set(re.findall(r'certificate SHA-256 digest: ([0-9a-fA-F]+)',run([tool,'verify','--print-certs',apk])))
    if not values:raise RuntimeError('Certificat de signature illisible.')
    return {v.lower() for v in values}
def manifest_values(data):
    offset=8;t,hs,size,count,styles,flags,start,style=struct.unpack_from('<HHIIIIII',data,offset)
    assert t==1
    offsets=struct.unpack_from('<%dI'%count,data,offset+hs)
    def string(i):
        pos=offset+start+offsets[i]
        if flags&0x100:
            if data[pos]&0x80:pos+=1
            pos+=1;n=data[pos];pos+=1
            if n&0x80:n=((n&0x7f)<<8)|data[pos];pos+=1
            return data[pos:pos+n].decode('utf-8')
        n=struct.unpack_from('<H',data,pos)[0];return data[pos+2:pos+2+n*2].decode('utf-16le')
    names=[string(i) for i in range(count)];pos=offset+size
    while pos<len(data):
        kind,head,length=struct.unpack_from('<HHI',data,pos)
        if kind==0x102:
            ns,name,attr_start,attr_size,n=struct.unpack_from('<IIHHH',data,pos+16)
            if names[name]=='manifest':
                values={}
                for i in range(n):
                    _,name,raw,_,_,typ,value=struct.unpack_from('<IIIHBBI',data,pos+16+attr_start+i*attr_size)
                    values[names[name]]=names[value] if typ==3 else value
                return values
        pos+=length
    raise AssertionError('Manifeste Android absent.')
def validate(apk,source,base,version='7.28',code=98,native_dex=None):
    with zipfile.ZipFile(apk) as z,zipfile.ZipFile(base) as b:
        assert z.testzip() is None
        for n in ['classes.dex','classes2.dex']:assert z.read(n)==b.read(n),'Code Android principal différent de la base vérifiée.'
        assert z.read('classes3.dex')==(native_dex.read_bytes() if native_dex else b.read('classes3.dex')),'Pont GPS différent de la compilation vérifiée.'
        for f in source.rglob('*'):
            if f.is_file():assert z.read('assets/'+f.relative_to(source).as_posix())==f.read_bytes(),'Asset différent : '+f.name
        assert f"APP_VERSION = '{version}'" in z.read('assets/v4.js').decode()
        assert '/main/version.json?t=' in z.read('assets/v4.js').decode()
        values=manifest_values(z.read('AndroidManifest.xml'))
        assert values['package']=='fr.gtline.accueil2008' and values['versionCode']==code and values['versionName']==version,'Identité/version Android incohérente.'
        for n in z.namelist():assert not n.endswith(('.p12','.jks','.keystore')),'Clé interdite dans un APK.'
        for i in z.infolist():
            if i.compress_type!=zipfile.ZIP_STORED:continue
            z.fp.seek(i.header_offset);h=z.fp.read(30);nl,el=struct.unpack_from('<HH',h,26)
            assert (i.header_offset+30+nl+el)%4==0,'Entrée non alignée.'
def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--prepare-only',action='store_true',help='Produit uniquement un paquet non signé, non destiné à l’installation.')
    p.add_argument('--keystore',type=Path);p.add_argument('--apksigner');p.add_argument('--output',type=Path,required=True)
    p.add_argument('--native-dex',type=Path,help='Pont GPS compilé et vérifié, remplaçant uniquement classes3.dex.')
    p.add_argument('--version',choices=('7.28','7.29','7.30','7.31','7.32','7.33','7.34','7.35','7.36','7.37','7.38','7.39','7.40','7.41','7.42','7.43','7.44','7.45','7.46','7.47','7.48','7.49','7.50','7.51'),default='7.28')
    a=p.parse_args();version=a.version;code={'7.28':98,'7.29':99,'7.30':100,'7.31':101,'7.32':102,'7.33':103,'7.34':104,'7.35':105,'7.36':106,'7.37':107,'7.38':108,'7.39':109,'7.40':110,'7.41':111,'7.42':112,'7.43':113,'7.44':114,'7.45':115,'7.46':116,'7.47':117,'7.48':118,'7.49':119,'7.50':120,'7.51':121}[version]
    base=ROOT/'distribution/Accueil2008GT_v7.26.apk';source=ROOT/'sources_assets'
    assert digest(base)==BASE_SHA,'Base 7.26 différente de la version vérifiée.'
    assert not a.output.exists(),'Choisir un fichier de sortie inexistant.'
    assert f"APP_VERSION = '{version}'" in (source/'v4.js').read_text()
    if not a.prepare_only:
        assert a.keystore and a.keystore.is_file(),'Fournir la clé d’origine, sans en créer une autre.'
        assert a.apksigner and os.environ.get('ACCUEIL_SIGNING_PASSWORD'),'Fournir apksigner et ACCUEIL_SIGNING_PASSWORD.'
    with tempfile.TemporaryDirectory(prefix='accueil728-') as tmp:
        w=Path(tmp)
        with zipfile.ZipFile(base) as z:
            (w/'base.xml').write_bytes(z.read('AndroidManifest.xml'));(w/'classes3.dex').write_bytes(z.read('classes3.dex'))
        if a.native_dex:
            assert a.native_dex.is_file() and a.native_dex.read_bytes().startswith(b'dex\n'),'Pont GPS DEX invalide.'
            shutil.copy2(a.native_dex,w/'classes3.dex')
        run([sys.executable,ROOT/'outils/axml.py',w/'base.xml',w/'manifest.xml',version,str(code)])
        env=dict(os.environ,ACCUEIL_NATIVE_DEX=str(w/'classes3.dex'))
        run([sys.executable,ROOT/'outils/build.py',base,w/'unsigned.apk',source,w/'manifest.xml'],env)
        run([sys.executable,ROOT/'outils/align.py',w/'unsigned.apk',w/'aligned.apk'])
        result=w/'aligned.apk'
        if not a.prepare_only:
            expected=cert(a.apksigner,base)
            command=[a.apksigner,'sign','--ks',a.keystore,'--ks-pass','env:ACCUEIL_SIGNING_PASSWORD','--out',w/'signed.apk']
            if os.environ.get('ACCUEIL_KEY_PASSWORD'):command+=['--key-pass','env:ACCUEIL_KEY_PASSWORD']
            if a.keystore.suffix.lower() in ('.p12','.pfx'):command+=['--ks-type','PKCS12']
            run(command+[result]);result=w/'signed.apk'
            assert cert(a.apksigner,result)==expected,'Signature différente : aucune sortie conservée.'
        validate(result,source,base,version,code,a.native_dex)
        a.output.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(result,a.output)
    print('Paquet non signé, non installable.' if a.prepare_only else 'APK signé avec le certificat d’origine, sans publication automatique.')
    print('SHA256',digest(a.output))
if __name__=='__main__':
    try:main()
    except (RuntimeError,AssertionError) as e:raise SystemExit(str(e))
