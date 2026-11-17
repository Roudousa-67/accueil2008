"""Crée un manifeste co-installable : autre application ID, composants pleinement qualifiés."""
import struct,sys
from pathlib import Path
src,dst=sys.argv[1:3];b=bytearray(Path(src).read_bytes());off=8
t,hs,sz,cnt,scnt,flags,sstart,stystart=struct.unpack_from('<HHIIIIII',b,off);assert t==1
positions=struct.unpack_from('<%dI'%cnt,b,off+hs);utf8=flags&0x100

def l8(p):
 v=b[p];p+=1
 if v&128:v=((v&127)<<8)|b[p];p+=1
 return v,p

def l16(p):
 v=struct.unpack_from('<H',b,p)[0];p+=2
 if v&32768:v=((v&32767)<<16)|struct.unpack_from('<H',b,p)[0];p+=2
 return v,p

def get(i):
 p=off+sstart+positions[i]
 if utf8:
  _,p=l8(p);n,p=l8(p);return b[p:p+n].decode('utf8')
 n,p=l16(p);return b[p:p+n*2].decode('utf-16le')
strings=[get(i) for i in range(cnt)];original=strings[:]
for i,s in enumerate(strings):
 if s=='fr.gtline.accueil2008':strings[i]='fr.gtline.accueil2008.beta'
 elif s=='fr.gtline.accueil2008.gpsdock':strings[i]='fr.gtline.accueil2008.beta.gpsdock'
 elif s.startswith('Accueil 2008 GT'):strings[i]=s.replace('Accueil 2008 GT','Accueil 2008 GT Bêta',1)
 elif s=='android.intent.category.HOME':strings[i]='fr.gtline.accueil2008.beta.DISABLED_HOME'
 elif s in ['android.intent.action.BOOT_COMPLETED','android.intent.action.LOCKED_BOOT_COMPLETED','android.intent.action.QUICKBOOT_POWERON','com.qf.action.ACC_ON']:strings[i]='fr.gtline.accueil2008.beta.DISABLED_'+str(i)
assert strings!=original
# Component class names stay in their original Java namespace.
assert 'fr.gtline.accueil2008.MainActivity' in strings

def n8(n):return bytes([n]) if n<128 else bytes([(n>>8)|128,n&255])
def n16(n):return struct.pack('<H',n) if n<32768 else struct.pack('<HH',(n>>16)|32768,n&65535)
payload=bytearray();offsets=[]
for s in strings:
 offsets.append(len(payload));u=s.encode('utf-16le');n=len(u)//2
 if utf8:
  raw=s.encode('utf8');payload.extend(n8(n)+n8(len(raw))+raw+b'\0')
 else:payload.extend(n16(n)+u+b'\0\0')
payload.extend(b'\0'*((-len(payload))%4));styleoffs=bytes(b[off+hs+cnt*4:off+hs+(cnt+scnt)*4]);styles=bytes(b[off+stystart:off+sz]) if stystart else b''
start=hs+(cnt+scnt)*4;style_start=start+len(payload) if styles else 0
pool=struct.pack('<HHIIIIII',t,hs,start+len(payload)+len(styles),cnt,scnt,flags&~1,start,style_start)+bytes(b[off+28:off+hs])+struct.pack('<%dI'%cnt,*offsets)+styleoffs+payload+styles
out=bytearray(b[:off]+pool+b[off+sz:]);struct.pack_into('<I',out,4,len(out));Path(dst).write_bytes(out)
print('Identifiant bêta distinct, autorité distincte, lancement HOME et démarrage automatique désactivés.')
