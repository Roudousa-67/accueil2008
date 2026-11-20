/* Import depuis le téléphone, par lien QR temporaire. */
(() => {
 'use strict';
 let session=null,pollTimer=null,overlay=null,loading=false;
 const message=text=>{const el=$('transferStatus734');if(el)el.textContent=text;};
 const service=()=>String(store.get('transferService734','https://accueil2008-transfert.bonnyherb4.chatgpt.site')).trim().replace(/\/$/,'');
 function validOrigin(value){try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&url.pathname==='/'&&!url.search&&!url.hash;}catch(e){return false;}}
 function settings(p){
  const url=service();
  return `<div class="prefs730"><h3>Transfert depuis le téléphone</h3><p>Choisis un ticket ou un GPX, puis scanne le QR avec ton téléphone. Le lien ouvre une page d’envoi sur Internet. Les appareils peuvent utiliser des connexions différentes.</p><div class="j733-actions">${chipBtn(p,'transfer734:ticket','QR pour un ticket',true)}${chipBtn(p,'transfer734:gpx','QR pour un GPX')}</div><details><summary>Service de transfert</summary><p>Le service de transfert doit être publié et configuré avant de produire un QR utilisable. Le lien est temporaire, et le contenu est chiffré sur le téléphone.</p><label>Adresse HTTPS du service<input id="transferService734" type="url" placeholder="https://ton-service.example" value="${esc(url)}" style="${fld(p)}"></label>${chipBtn(p,'transfer734:save','Enregistrer le service')}</details></div>`;
 }
 async function request(path){const response=await http(service()+path);if(!response.ok)throw Error('Le service ne répond pas ou son accès est protégé.');let data;try{data=JSON.parse(response.b);}catch(e){throw Error('Réponse du service non reconnue.');}if(data.error)throw Error(data.error);return data;}
 function close(){
  const current=session;session=null;loading=false;
  if(pollTimer)clearInterval(pollTimer);pollTimer=null;
  if(overlay)overlay.remove();overlay=null;
  if(current)request('/api/ack/'+current.id+'?key='+current.read).catch(()=>{});
  if(window.Frame710)Frame710.sync();
 }
 async function receive(payload){
  const raw=Uint8Array.from(atob(payload.data),c=>c.charCodeAt(0));if(raw.length>3*1024*1024||raw.length<30)throw Error('Taille du fichier invalide.');
  const key=await crypto.subtle.importKey('raw',session.key,'AES-GCM',false,['decrypt']);
  const decoded=await crypto.subtle.decrypt({name:'AES-GCM',iv:raw.subarray(0,12)},key,raw.subarray(12));
  const file=JSON.parse(new TextDecoder().decode(decoded));
  if(file.kind!==session.kind||typeof file.data!=='string')throw Error('Type du fichier reçu invalide.');
  if(file.kind==='gpx'){
   // La même validation que l’import par fichier protège les GPX transférés.
   Driver728.parseGPX(file.data);
   const xml=file.data;close();Driver728.loadGPX(xml);toast('GPX reçu et importé depuis le téléphone.');
  }else{
   if(file.data.length>350000||!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(file.data))throw Error('Photo du ticket invalide.');
   const photo=file.data,img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=photo;});
   close();Journeys733.receiveReceipt(photo);toast('Ticket reçu. Vérifie les montants puis enregistre le plein.');
  }
 }
 async function poll(){
  if(!session||loading||document.hidden)return;
  if(Date.now()>=session.expires){message('Ce QR a expiré. Ferme cette fenêtre puis crée un nouveau transfert.');clearInterval(pollTimer);pollTimer=null;return;}
  loading=true;
  const current=session;
  try{const data=await request('/api/result/'+current.id+'?key='+current.read);if(session!==current)return;if(data.ready){message('Fichier reçu, vérification…');await receive(data);}else message('En attente du téléphone · expiration dans '+Math.ceil((current.expires-Date.now())/60000)+' min');}
  catch(e){if(session===current)message(e.message||'Réception indisponible. Le poste réessaiera.');}
  finally{loading=false;}
 }
 async function open(kind){
  if(!['ticket','gpx'].includes(kind))return;
  if(!validOrigin(service())){openSet('Trajets et carburant','Importer depuis le téléphone');toast('Le service Internet doit être configuré pour créer le QR.');return;}
  if(!window.crypto?.subtle||!window.crypto?.getRandomValues){toast('Le chiffrement nécessaire au transfert n’est pas disponible sur ce poste.');return;}
  close();
  overlay=document.createElement('div');overlay.className='ov on';overlay.setAttribute('data-transfer734','');overlay.style.cssText='z-index:6000;align-items:center;justify-content:center;gap:14px';
  overlay.innerHTML=`<h2>${kind==='ticket'?'Envoyer un ticket depuis le téléphone':'Importer un trajet GPX depuis le téléphone'}</h2><div id="transferQR734" style="background:white;padding:14px;border-radius:14px"></div><p id="transferStatus734" role="status">Préparation du QR…</p><p style="max-width:650px;text-align:center">Scanne avec ton téléphone. Choisis le fichier puis envoie-le. Garde cette fenêtre ouverte sur le poste.</p><button data-act="transfer734:close" class="close">Fermer le transfert</button>`;
  $('screen').appendChild(overlay);Frame710.sync();
  const currentOverlay=overlay;
  try{
   const data=await request('/api/new?kind='+kind);
   if(overlay!==currentOverlay)return;
   if(!/^[a-f0-9]{48}$/.test(data.id)||!/^[a-f0-9]{48}$/.test(data.read)||!/^[a-f0-9]{48}$/.test(data.write)||data.kind!==kind||!Number.isFinite(data.expires)||data.expires<=Date.now()||data.expires>Date.now()+16*60000)throw Error('Session de transfert invalide.');
   const key=crypto.getRandomValues(new Uint8Array(32)),hex=Array.from(key,b=>b.toString(16).padStart(2,'0')).join('');
   session={...data,key};
   const url=service()+'/#id='+data.id+'&token='+data.write+'&key='+hex+'&kind='+kind;
   const qr=qrcode(0,'M');qr.addData(url);qr.make();
   $('transferQR734').innerHTML=qr.createSvgTag({cellSize:4,margin:4,scalable:true});
   const svg=$('transferQR734').querySelector('svg');svg.style.cssText='display:block;width:min(320px,42vh);height:min(320px,42vh)';svg.setAttribute('aria-label','QR de transfert temporaire');
   message('QR prêt · valable 15 minutes');pollTimer=setInterval(poll,2500);
  }catch(e){message(e.message||'Création du transfert impossible.');}
 }
 const originalAct=window.act;window.act=function(action){
  if(typeof action==='string'&&action.startsWith('transfer734:')){const op=action.slice(12);if(op==='close'){close();return;}if(op==='save'){const url=($('transferService734')?.value||'').trim().replace(/\/$/,'');if(url&&!validOrigin(url)){toast('Indique uniquement une adresse de service HTTPS.');return;}close();store.set('transferService734',url);toast('Service enregistré.');return;}open(op);return;}
  return originalAct.apply(this,arguments);
 };
 const previousBack=window.onBackKey;window.onBackKey=function(){if(overlay){close();return;}return previousBack.apply(this,arguments);};
 window.addEventListener('pagehide',close);
 const cat=SETCATS.find(c=>c[0]==='Trajets et carburant');if(cat)cat[1].push(['Importer depuis le téléphone',settings]);
 const nav=SETCATS.find(c=>c[0]==='Navigation'),driver=nav?.[1].find(s=>s[0]==='Vue conducteur');
 if(driver){const old=driver[1];driver[1]=p=>old(p)+setRow(p,'Importer un GPX depuis le téléphone','Scanne le QR pour transférer un parcours par Internet.',chipBtn(p,'transfer734:gpx','Importer par QR'));}
 Settings720.index=null;
 window.Transfer734={open,close,validOrigin};
})();
