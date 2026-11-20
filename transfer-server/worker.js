/* Transfert temporaire de tickets et GPX. Le contenu est chiffré par le téléphone. */
const ttl = 15 * 60 * 1000;
const maxBody = 3 * 1024 * 1024;
const headers = {'Cache-Control':'no-store','Access-Control-Allow-Origin':'*','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'};
const random = () => Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join('');
const digest = async value => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
const json = (value,status=200) => new Response(JSON.stringify(value),{status,headers:{...headers,'Content-Type':'application/json'}});
const sessionPath = id => 'transfers/'+id+'.json';
const payloadPath = id => 'transfers/'+id+'.data';
async function remove(bucket,id){await bucket.delete([sessionPath(id),payloadPath(id)]);}
async function cleanup(bucket){
 const objects=await bucket.list({prefix:'transfers/',limit:100});
 for(const item of objects.objects){if(item.key.endsWith('.json')&&Date.now()-new Date(item.uploaded).getTime()>ttl){const id=item.key.slice(10,-5);if(/^[a-f0-9]{48}$/.test(id))await remove(bucket,id);}}
}
async function limitedBody(request){
 const reader=request.body?.getReader();if(!reader)return null;
 const pieces=[];let length=0;
 while(true){const {value,done}=await reader.read();if(done)break;length+=value.byteLength;if(length>maxBody){await reader.cancel();return null;}pieces.push(value);}
 const bytes=new Uint8Array(length);let offset=0;for(const piece of pieces){bytes.set(piece,offset);offset+=piece.byteLength;}return bytes;
}
async function api(request,env,ctx){
 const url=new URL(request.url),bucket=env.BUCKET;
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Authorization, Content-Type'}});
 if(url.pathname==='/')return new Response(page,{headers:{...headers,'Content-Type':'text/html;charset=utf-8','Content-Security-Policy':"default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' blob: data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"}});
 if(!bucket)return json({error:'Stockage du service non configuré.'},503);
 if(url.pathname==='/api/new'&&request.method==='GET'){
  const kind=url.searchParams.get('kind');if(!['ticket','gpx'].includes(kind))return json({error:'Type invalide.'},400);
  // Une création par tranche de quinze secondes et adresse IP.
  const ip=request.headers.get('CF-Connecting-IP')||'local',minute=Math.floor(Date.now()/15000),rate='limits/'+await digest(ip+'|'+minute);
  const granted=await bucket.put(rate,'1',{onlyIf:{etagDoesNotMatch:'*'}});if(!granted)return json({error:'Réessaie dans quelques secondes.'},429);
  const id=random(),read=random(),write=random(),expires=Date.now()+ttl;
  await bucket.put(sessionPath(id),JSON.stringify({read:await digest(read),write:await digest(write),kind,expires}),{onlyIf:{etagDoesNotMatch:'*'}});
  if(ctx?.waitUntil)ctx.waitUntil(cleanup(bucket));
  return json({id,read,write,kind,expires});
 }
 const match=/^\/api\/(upload|result|ack)\/([a-f0-9]{48})$/.exec(url.pathname);
 if(!match)return json({error:'Introuvable.'},404);
 const [,op,id]=match,object=await bucket.get(sessionPath(id));if(!object)return json({error:'Lien expiré ou annulé.'},410);
 const session=await object.json(),token=op==='upload'?(request.headers.get('Authorization')||'').replace(/^Bearer /,''):url.searchParams.get('key');
 if(!/^[a-f0-9]{48}$/.test(token||'')||await digest(token)!==session[op==='upload'?'write':'read'])return json({error:'Accès refusé.'},403);
 if(session.expires<=Date.now()){await remove(bucket,id);return json({error:'Lien expiré.'},410);}
 if(op==='upload'&&request.method==='POST'){
  if(Number(request.headers.get('Content-Length'))>maxBody)return json({error:'Fichier trop volumineux.'},413);
  const bytes=await limitedBody(request);if(!bytes||bytes.length<30)return json({error:'Fichier invalide ou trop volumineux.'},413);
  const stored=await bucket.put(payloadPath(id),bytes,{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/octet-stream'}});
  if(!stored)return json({error:'Ce lien a déjà reçu un fichier.'},409);
  // Une annulation simultanée supprime aussi le contenu qui vient d’arriver.
  if(!await bucket.get(sessionPath(id))){await bucket.delete(payloadPath(id));return json({error:'Transfert annulé.'},410);}
  return json({ok:true});
 }
 if(op==='result'&&request.method==='GET'){
  const content=await bucket.get(payloadPath(id));if(!content)return json({waiting:true,expires:session.expires});
  const bytes=new Uint8Array(await content.arrayBuffer());let binary='';for(let start=0;start<bytes.length;start+=16384)binary+=String.fromCharCode(...bytes.subarray(start,start+16384));
  return json({ready:true,data:btoa(binary),kind:session.kind});
 }
 if(op==='ack'&&request.method==='GET'){await remove(bucket,id);return json({ok:true});}
 return json({error:'Méthode non autorisée.'},405);
}
export default {async fetch(request,env,ctx){try{return await api(request,env,ctx);}catch(e){return json({error:'Service temporairement indisponible.'},503);}},async scheduled(event,env){if(env.BUCKET)await cleanup(env.BUCKET);}};
const page=`<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Envoyer au poste · Accueil 2008 GT</title><style>body{margin:0;background:#0e1c2b;color:#f1f5fa;font:17px system-ui;padding:28px}main{max-width:520px;margin:5vh auto;background:#172b40;padding:26px;border-radius:22px}h1{font-size:28px}p{line-height:1.5;color:#becbd8}button,input{font:inherit;max-width:100%;box-sizing:border-box}button{padding:16px 22px;border:0;border-radius:12px;background:#f17c6a;color:#152335;font-weight:700}input{padding:16px 0}small{color:#b4c2cf}#status{min-height:60px}</style><main><h1 id="title">Envoyer un fichier au poste</h1><p id="help">Scanne le QR affiché sur ton autoradio pour ouvrir un transfert.</p><input id="file" type="file" hidden><button id="send" disabled hidden>Envoyer au poste</button><p id="status" role="status"></p><small>Le lien expire après 15 minutes. Le fichier est chiffré sur ton téléphone et supprimé du service après réception confirmée. Le poste te demande de vérifier le ticket avant d’enregistrer le plein.</small></main><script>
const params=new URLSearchParams(location.hash.slice(1)),id=params.get('id'),token=params.get('token'),keyText=params.get('key'),kind=params.get('kind');
history.replaceState(null,'',location.pathname);
const file=document.getElementById('file'),send=document.getElementById('send'),status=document.getElementById('status');
function bytes64(bytes){let out='';for(let i=0;i<bytes.length;i+=16384)out+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(out)}
async function jpeg(f){const url=URL.createObjectURL(f),img=new Image();try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url});if(img.naturalWidth*img.naturalHeight>50000000)throw Error('Photo trop grande. Recadre le ticket.');const ratio=Math.min(1,1200/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas');c.width=Math.round(img.naturalWidth*ratio);c.height=Math.round(img.naturalHeight*ratio);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);const value=c.toDataURL('image/jpeg',.7);if(value.length>350000)throw Error('Recadre le ticket pour réduire la taille.');return value;}finally{URL.revokeObjectURL(url)}}
if(/^[a-f0-9]{48}$/.test(id||'')&&/^[a-f0-9]{48}$/.test(token||'')&&/^[a-f0-9]{64}$/.test(keyText||'')&&['ticket','gpx'].includes(kind)&&crypto.subtle){document.getElementById('title').textContent=kind==='ticket'?'Envoyer un ticket':'Envoyer un trajet GPX';document.getElementById('help').textContent=kind==='ticket'?'Photographie le ticket ou choisis une photo existante.':'Choisis un fichier GPX. Le poste vérifiera le tracé avant de l’importer.';file.hidden=false;send.hidden=false;file.accept=kind==='ticket'?'image/jpeg,image/png,image/webp':'.gpx,application/gpx+xml,text/xml';if(kind==='ticket')file.setAttribute('capture','environment');file.onchange=()=>send.disabled=!file.files.length;}else status.textContent='Ce lien est incomplet, expiré ou ton navigateur ne prend pas en charge le chiffrement. Scanne un nouveau QR sur le poste.';
send.onclick=async()=>{const f=file.files[0];if(!f)return;send.disabled=true;status.textContent='Préparation du fichier…';try{if(f.size>12*1024*1024)throw Error('Fichier trop volumineux.');let data;if(kind==='ticket'){if(!/^image\\/(jpeg|png|webp)$/.test(f.type))throw Error('Choisis une photo JPEG, PNG ou WebP.');data=await jpeg(f);}else{if(f.size>2000000)throw Error('Le fichier GPX doit faire moins de 2 Mo.');data=await f.text();if(/<!DOCTYPE|<!ENTITY/i.test(data))throw Error('GPX non accepté.');const doc=new DOMParser().parseFromString(data,'application/xml');if(doc.querySelector('parsererror')||doc.documentElement.localName!=='gpx')throw Error('Fichier GPX invalide.');}const keyBytes=Uint8Array.from(keyText.match(/../g),v=>parseInt(v,16)),key=await crypto.subtle.importKey('raw',keyBytes,'AES-GCM',false,['encrypt']),iv=crypto.getRandomValues(new Uint8Array(12));const plaintext=new TextEncoder().encode(JSON.stringify({kind,name:f.name,data}));const ciphertext=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,plaintext)),body=new Uint8Array(iv.length+ciphertext.length);body.set(iv);body.set(ciphertext,iv.length);status.textContent='Envoi chiffré en cours…';const response=await fetch('/api/upload/'+id,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/octet-stream'},body});const result=await response.json();if(!response.ok)throw Error(result.error||'Envoi impossible.');status.textContent='Fichier envoyé. Le poste va le recevoir. Pour le ticket, vérifie les montants sur le poste puis enregistre le plein.';file.disabled=true;}catch(e){status.textContent=e.message||'Envoi impossible. Réessaie.';send.disabled=false;}};
</script></html>`;
