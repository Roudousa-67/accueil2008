"""Construit la bêta co-installable, avec la clé d’origine fournie hors dépôt."""
from pathlib import Path
import argparse,os,subprocess,zipfile,hashlib,re,shutil,tempfile,io
from preparer_sources_beta import prepare

def run(a):return subprocess.run(list(map(str,a)),check=True,text=True,capture_output=True).stdout

def certificates(tool,apk):
 s=run([tool,'verify','--print-certs',apk]);values=set(re.findall(r'certificate SHA-256 digest: ([0-9a-fA-F]+)',s));assert values,'Signature illisible';return values

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--base',required=True,type=Path);p.add_argument('--keystore',required=True,type=Path);p.add_argument('--apksigner',required=True);p.add_argument('--zipalign',required=True);p.add_argument('--tools',required=True,type=Path);p.add_argument('--output',required=True,type=Path);a=p.parse_args()
 assert os.environ.get('ACCUEIL_SIGNING_PASSWORD'),'Fournir le mot de passe via ACCUEIL_SIGNING_PASSWORD.'
 assert hashlib.sha256(a.base.read_bytes()).hexdigest()=='b101e50c1e1c0f295ea1b8471f1ee8aa87a9b0a6b2b73abadc7f841f2330f109','Base 7.26 différente de la version vérifiée.'
 assert a.keystore.is_file(),'Clé d’origine absente : aucune nouvelle clé ne sera créée.'
 expected=certificates(a.apksigner,a.base)
 with tempfile.TemporaryDirectory(prefix='accueil-beta-') as tmp:
  w=Path(tmp);src=w/'stable';src.mkdir()
  with zipfile.ZipFile(a.base) as z:
   (w/'manifest.xml').write_bytes(z.read('AndroidManifest.xml'));(w/'native.dex').write_bytes(z.read('classes3.dex'))
   for name in z.namelist():
    if not name.startswith('assets/'):continue
    rel=Path(name[7:]);assert not rel.is_absolute() and '..' not in rel.parts
    out=src/rel;out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(z.read(name))
  prepare(src,w/'assets',Path(__file__).resolve().parent.parent/'sources_assets/beta727.js')
  run(['python3',a.tools/'axml.py',w/'manifest.xml',w/'version.xml','7.27.2','1002'])
  run(['python3',Path(__file__).with_name('manifest_beta.py'),w/'version.xml',w/'beta.xml'])
  os.environ['ACCUEIL_NATIVE_DEX']=str(w/'native.dex');run(['python3',a.tools/'build.py',a.base,w/'unsigned0.apk',w/'assets',w/'beta.xml'])
  from PIL import Image,ImageDraw,ImageFont
  with zipfile.ZipFile(w/'unsigned0.apk') as source,zipfile.ZipFile(w/'unsigned.apk','w') as target:
   for entry in source.infolist():
    data=source.read(entry.filename)
    if entry.filename.startswith('res/mipmap-') and entry.filename.endswith('/ic_launcher.png'):
     im=Image.open(io.BytesIO(data)).convert('RGBA');draw=ImageDraw.Draw(im);ww,hh=im.size;draw.rectangle((0,hh*.68,ww,hh),fill='#b66822');font=ImageFont.truetype(next(str(p) for p in [Path('/usr/share/fonts/truetype/open-sans/OpenSans-Bold.ttf'),Path('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')] if p.exists()),max(8,int(ww*.18)));draw.text((ww/2,hh*.82),'BÊTA',font=font,anchor='mm',fill='white');buf=io.BytesIO();im.save(buf,format='PNG');data=buf.getvalue()
    target.writestr(entry,data)
  run([a.zipalign,'-f','4',w/'unsigned.apk',w/'aligned.apk'])
  cmd=[a.apksigner,'sign','--ks',a.keystore,'--ks-pass','env:ACCUEIL_SIGNING_PASSWORD','--out',w/'signed.apk']
  if a.keystore.suffix.lower() in ('.p12','.pfx'):cmd+=['--ks-type','PKCS12']
  run(cmd+[w/'aligned.apk']);assert certificates(a.apksigner,w/'signed.apk')==expected,'Certificat différent de la version stable.';run([a.zipalign,'-c','4',w/'signed.apk'])
  a.output.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(w/'signed.apk',a.output)
 print('Bêta signée et vérifiée :',a.output);print('SHA256',hashlib.sha256(a.output.read_bytes()).hexdigest())

if __name__=='__main__':main()
