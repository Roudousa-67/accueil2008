/* N35 + N46 : progression réelle fournie par Android, nettoyage limité à cette application. */
'use strict';
window.Files721={
 state:{phase:'idle',percent:-1,bytes:0,total:0,message:''},sizes:null,confirm:null,active:false,
 native(){return window.AppFiles721&&typeof AppFiles721.status==='function'?AppFiles721:null;},
 decode(raw){try{return JSON.parse(String(raw));}catch(e){return {error:'Réponse Android illisible.'};}},
 bytes(n){return (Math.max(0,Number(n)||0)/1048576).toLocaleString('fr-FR',{maximumFractionDigits:1})+' Mo';},
 poll(){const b=this.native();if(!b)return;const next=this.decode(b.status());if(next.error)return;const before=this.state.phase;this.state=next;this.active=['downloading','verifying'].includes(next.phase);
  document.querySelectorAll('[data-files721-status]').forEach(el=>el.textContent=this.label());
  document.querySelectorAll('[data-files721-progress]').forEach(el=>{if(next.percent>=0){el.value=next.percent;el.setAttribute('aria-valuenow',next.percent);}else el.removeAttribute('value');});
  document.querySelectorAll('[data-files721-size]').forEach(el=>el.textContent=this.bytes(next.bytes)+(next.total?' / '+this.bytes(next.total):''));
  if(before!==next.phase&&tab==='settings'&&!Settings720.active())render();
 },
 label(){const s=this.state;return ({idle:'Aucun téléchargement en cours',downloading:'Téléchargement'+(s.percent>=0?' · '+s.percent+' %':''),verifying:'Vérification de l’empreinte et de la signature…',ready:'Prêt à installer',cancelled:'Téléchargement annulé',error:'Échec — '+(s.message||'réessaie plus tard')}[s.phase]||'État indisponible');},
 start(info){if(!info||!Update720.valid(info.apk)||!/^([a-f0-9]{64})$/i.test(info.sha256||'')){toast('Empreinte de la version absente ou lien invalide. Aucun téléchargement lancé.');return false;}
  const b=this.native();if(!b){toast('Le téléchargement suivi nécessite l’application Android.');return false;}
  saveBackup(true);const result=this.decode(b.download(info.apk,info.sha256,String(info.version)));if(result.error){toast(result.error);return false;}this.state=result;this.active=true;return true;
 },
 downloadPage(p){const s=this.state;return setRow(p,'N35 · Téléchargement suivi','Progression Android réelle, puis vérification SHA-256, paquet, version et signature. Installation uniquement après ton appui.',`<div style="min-width:240px;max-width:460px"><b data-files721-status>${esc(this.label())}</b><progress data-files721-progress max="100" ${s.percent>=0?'value="'+s.percent+'"':''} style="display:block;width:100%;height:18px;margin:8px 0"></progress><span data-files721-size>${this.bytes(s.bytes)}${s.total?' / '+this.bytes(s.total):''}</span></div>`)+
   (s.phase==='ready'?chipBtn(p,'files721:install','Installer — validation Android',true):['downloading','verifying'].includes(s.phase)?chipBtn(p,'files721:cancel','Annuler le téléchargement'):chipBtn(p,'updCheck','Chercher une mise à jour',true))+
   (s.message?`<p style="font-size:14px;color:${p.mut}">${esc(s.message)}</p>`:'');
 },
 measure(){const b=this.native();if(!b){toast('Mesure disponible dans l’application Android.');return;}const r=this.decode(b.storage());if(r.error){toast(r.error);return;}this.sizes=r;},
 storagePage(p){const titles={cache:'Cache de cette application',thumbnails:'Miniatures en cache',downloads:'Anciens APK téléchargés'};
  let h=setRow(p,'N46 · Fichiers de l’application','Les réglages, trajets, photos personnelles et fichiers des autres GPS sont conservés. Le téléchargement actuel est protégé.',chipBtn(p,'files721:measure','Actualiser les tailles'));
  for(const key of Object.keys(titles))h+=setRow(p,titles[key],this.sizes?this.bytes(this.sizes[key]):'Actualise pour mesurer l’espace récupérable.',chipBtn(p,'files721:choose:'+key,'Voir avant de nettoyer'));
  if(this.confirm){const key=this.confirm;h+=`<div style="padding:18px;border:2px solid ${p.acc};border-radius:14px"><b>Aperçu : ${titles[key]}</b><p>${this.sizes?this.bytes(this.sizes[key]):'Taille à mesurer'} récupérables. Seule cette catégorie sera nettoyée.</p>${chipBtn(p,'files721:clean:'+key,'Confirmer le nettoyage',true)}${chipBtn(p,'files721:back','Annuler')}</div>`;}
  return h;
 }
};
{const cat=SETCATS.find(c=>c[0]==='Mises à jour');if(cat){cat[1].push(['Téléchargement et vérification',p=>Files721.downloadPage(p)]);cat[1].push(['Stockage et nettoyage',p=>Files721.storagePage(p)]);}}
{const old=window.act;window.act=function(a,long){
 if(a==='update720:download'){if(Files721.start(Update720.pending)){Update720.pending=null;const i=SETCATS.findIndex(c=>c[0]==='Mises à jour');setCat=i;setSub=SETCATS[i][1].findIndex(s=>s[0]==='Téléchargement et vérification');Settings720.query='';Settings720.filter='';tab='settings';render();}return;}
 if(!a.startsWith('files721:'))return old.apply(this,arguments);
 const [,op,key]=a.split(':'),b=Files721.native();
 if(op==='measure'){Files721.measure();render();return;}
 if(op==='choose'&&['cache','thumbnails','downloads'].includes(key)){Files721.measure();if(Files721.sizes)Files721.confirm=key;render();return;}
 if(op==='back'){Files721.confirm=null;render();return;}
 if(op==='clean'&&Files721.confirm===key&&b){const r=Files721.decode(b.clean(key));Files721.confirm=null;if(r.error)toast(r.error);else{if(key==='thumbnails'||key==='cache')iconCache.clear();Files721.measure();toast(Files721.bytes(r.freed)+' libérés. Réglages et trajets conservés.');}render();return;}
 if(op==='cancel'&&b){Files721.state=Files721.decode(b.cancel());Files721.active=false;render();return;}
 if(op==='install'&&b){if(moving()){toast('Installation disponible à l’arrêt.');return;}const r=Files721.decode(b.install());if(r.error)toast(r.error);else toast('Valide l’installation dans Android. Si Android demande une autorisation, reviens ensuite sur Installer.');return;}
};}
setInterval(()=>Files721.poll(),750);
if(window.Settings720)Settings720.index=null;
