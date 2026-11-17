/* 7.20 : recherche, défilement conservé, barre compacte et mise à jour proposée. */
'use strict';
window.Settings720={
 query:'',filter:'',index:null,lastKey:null,side:0,positions:new Map(),voicePending:0,
 norm:s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),
 active(){return !!(this.query.trim()||this.filter);},
 key(){return [setCat,setSub,this.query,this.filter].join('|');},
 toolbar(p){return `<div data-search720 style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex:none"><input id="settingsSearch720" type="search" autocomplete="off" placeholder="Rechercher un réglage : GPS, panneau, son…" value="${esc(this.query)}" style="${fld(p,'flex:1;min-width:0')}"><select id="settingsFilter720" aria-label="Filtrer les réglages" style="${fld(p,'width:230px')}"><option value="">Toutes les catégories</option>${SETCATS.map(([n])=>`<option value="${esc(n)}" ${this.filter===n?'selected':''}>${esc(n)}</option>`).join('')}</select>${chipBtn(p,'search720:voice','🎙 Dicter')}${chipBtn(p,'search720:clear','Effacer')}</div>`;},
 buildIndex(p){
  if(this.index)return this.index;
  this.index=[];SETCATS.forEach(([category,subs],ci)=>subs.forEach(([name,fn],si)=>{
    let text='';try{const template=document.createElement('template');template.innerHTML=fn(p);text=template.content.textContent||'';}catch(e){}
    this.index.push({ci,si,category,name,text:this.norm(category+' '+name+' '+text)});
  }));return this.index;
 },
 matches(p){const words=this.norm(this.query).trim().split(/\s+/).filter(Boolean);return this.buildIndex(p).filter(it=>(!this.filter||this.filter===it.category)&&words.every(w=>it.text.includes(w)));},
 results(p){const list=this.matches(p);return `<div class="scroll" data-settings-scroll="body" style="flex:1;min-height:0"><div style="padding:8px;font-size:15px;color:${p.mut}">${list.length} résultat${list.length>1?'s':''}</div>${list.map(it=>`<button data-act="search720:open:${it.ci}:${it.si}" style="display:flex;flex-direction:column;gap:5px;text-align:left;width:100%;padding:14px 18px;border-radius:12px;background:${p.card2};color:${p.txt};margin-bottom:8px"><b style="font-size:18px">${esc(it.name)}</b><span style="font-size:13px;color:${p.mut}">${esc(it.category)} › ${esc(it.name)}</span></button>`).join('')||`<div style="padding:18px;color:${p.mut}">Aucun réglage trouvé. Essaie un autre mot ou une autre catégorie.</div>`}</div>`;},
 bind(){const input=$('settingsSearch720'),filter=$('settingsFilter720');if(input)input.oninput=()=>{this.query=input.value.slice(0,160);render();};if(filter)filter.onchange=()=>{this.filter=filter.value;render();};},
 acceptVoice(payload){
  if(!this.voicePending||!payload||payload.id<this.voicePending)return false;
  this.voicePending=0;
  if(payload.text){this.query=String(payload.text).slice(0,160);this.filter='';tab='settings';render();return true;}
  if(payload.error&&payload.error!=='cancelled')toast('Dictée indisponible : utilise le clavier ou son micro.');return false;
 },
 voice(){
  try{const bridge=window.GpsDock;if(bridge&&bridge.settingsVoiceStart){this.voicePending=Date.now();bridge.settingsVoiceStart();toast('Dis le réglage que tu cherches…');return;}
    const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(Recognition){const r=new Recognition();r.lang='fr-FR';r.onresult=e=>{this.query=String(e.results[0][0].transcript).slice(0,160);this.filter='';render();};r.onerror=()=>toast('Dictée indisponible : utilise le micro du clavier.');r.start();return;}
  }catch(e){}
  const input=$('settingsSearch720');if(input)input.focus();toast('Utilise le micro de ton clavier pour dicter la recherche.');
 }
};
// Mémorise chaque page et la position de la colonne des catégories avant de recréer le DOM.
{const old=render;window.render=function(){
 const s=Settings720,side=document.querySelector('#screen [data-settings-scroll="side"]'),body=document.querySelector('#screen [data-settings-scroll="body"]');
 if(side)s.side=side.scrollTop;
 if(body&&s.lastKey)s.positions.set(s.lastKey,[body.scrollTop,...Array.from(body.querySelectorAll('.scroll')).map(el=>el.scrollTop)]);
 const focused=document.activeElement,id=focused&&focused.id,caret=focused&&typeof focused.selectionStart==='number'?focused.selectionStart:null;
 const out=old.apply(this,arguments);
 if(tab==='settings'){
  const newSide=document.querySelector('#screen [data-settings-scroll="side"]'),newBody=document.querySelector('#screen [data-settings-scroll="body"]');
  const key=s.key(),values=s.positions.get(key)||[0];
  const restore=()=>{if(newSide&&newSide.isConnected)newSide.scrollTop=s.side;if(newBody&&newBody.isConnected){newBody.scrollTop=values[0];newBody.querySelectorAll('.scroll').forEach((el,i)=>el.scrollTop=values[i+1]||0);}};
  if(id){const target=$(id);if(target){try{target.focus({preventScroll:true});if(caret!==null&&target.setSelectionRange)target.setSelectionRange(caret,caret);}catch(e){}}}
  restore();requestAnimationFrame(restore);s.lastKey=key;s.bind();
 }return out;
};}
displayEvery725(()=>{const s=Settings720;if(!s.voicePending)return;if(Date.now()-s.voicePending>120000){s.voicePending=0;return;}
 try{const b=window.GpsDock;if(b&&b.settingsVoiceResult)s.acceptVoice(JSON.parse(String(b.settingsVoiceResult())));}catch(e){}
},500);

window.Compact720={
 compact:()=>store.get('appsCompact720',true)!==false,
 apply(mode){
  const key=fKey(),current=fCfg(),backup=store.get('appsCompactBackup720_'+profIdx(),null);
  if(mode&& !backup){const copy=JSON.parse(JSON.stringify(current));let changed=false;
   copy.pages.forEach(pg=>{for(const apps of pg){if(apps.t!=='w'||apps.b.length!==1||apps.b[0]!=='apps'||apps.h<2)continue;
    const gps=pg.find(it=>it.t==='w'&&it.b.includes('gpsbox')&&it.x===apps.x&&it.w===apps.w&&it.y+it.h===apps.y);
    if(gps){gps.h+=1;apps.y+=1;apps.h-=1;changed=true;}
   }});
   if(changed){store.set('appsCompactBackup720_'+profIdx(),current);store.set(key,copy);store.set('appsCompactApplied720_'+profIdx(),copy);}
  }else if(!mode&&backup){
   const applied=store.get('appsCompactApplied720_'+profIdx(),null);
   if(JSON.stringify(current)===JSON.stringify(applied))store.set(key,backup);
   store.set('appsCompactBackup720_'+profIdx(),null);
  }
  store.set('appsCompact720',mode);
 }
};
// Migration unique, seulement quand la barre et le GPS occupent les cases attendues.
if(!store.get('appsCompactInit720_'+profIdx(),false)){Compact720.apply(Compact720.compact());store.set('appsCompactInit720_'+profIdx(),true);}
{const old=GBLOCKS.apps.r;GBLOCKS.apps.r=function(p,w,h){const html=old.apply(this,arguments);return Compact720.compact()?html.replace(/--ics:64px/g,'--ics:42px').replace(/width:64px;height:64px/g,'width:42px;height:42px').replace(/padding:10px 16px/g,'padding:5px 12px').replace(/gap:8px/g,'gap:4px').replace(/font-size:14px/g,'font-size:12px'):html;};}
{const cat=SETCATS.find(c=>c[0]==="Écran d'accueil");if(cat)cat[1].push(['Barre d’applications',p=>setRow(p,'Barre compacte','Réduit les icônes. Dans la disposition Autoradio standard, une rangée est rendue au GPS. Les dispositions personnalisées restent réglables à la main.',chipBtn(p,'compact720:toggle',Compact720.compact()?'Compacte':'Normale',Compact720.compact()))]);}

window.Update720={pending:null,shown:'',
 valid(url){try{const u=new URL(url);return u.protocol==='https:'&&u.hostname==='github.com'&&u.pathname.startsWith('/'+store.get('updRepo','Roudousa-67/accueil2008')+'/releases/download/')&&u.pathname.toLowerCase().endsWith('.apk');}catch(e){return false;}},
 show(){if(!updInfo||verNum(updInfo.version)<=verNum(APP_VERSION))return;this.pending=updInfo;render();},
 markup(p){if(!this.pending)return '';return `<div data-update720 style="position:absolute;inset:0;z-index:4000;background:#000a;display:flex;align-items:center;justify-content:center"><div style="max-width:620px;padding:24px;border-radius:20px;background:${hex7(p.card)};color:${p.txt}"><b style="font-size:23px">Mise à jour ${esc(this.pending.version)} disponible</b><div style="white-space:pre-wrap;margin:16px 0;font-size:15px;max-height:200px;overflow:auto">${esc(this.pending.notes||'Une nouvelle version est prête. Tes réglages seront sauvegardés avant de télécharger.')}</div><div style="display:flex;gap:10px">${chipBtn(p,'update720:later','Plus tard')}${chipBtn(p,'update720:download','Télécharger après sauvegarde',true)}</div></div></div>`;}
};
{const old=checkUpdate;checkUpdate=async function(manual){await old.apply(this,arguments);if(updInfo&&verNum(updInfo.version)>verNum(APP_VERSION)&&Update720.shown!==updInfo.version){Update720.shown=updInfo.version;if(!moving())Update720.show();}};}
{const old=render;window.render=function(){const r=old.apply(this,arguments);const html=Update720.markup(curP||palette());if(html)$('screen').insertAdjacentHTML('beforeend',html);return r;};}
{const old=window.act;window.act=function(a,long){
 if(a==='search720:voice'){Settings720.voice();return;}
 if(a==='search720:clear'){Settings720.query='';Settings720.filter='';render();return;}
 if(a.startsWith('search720:open:')){const parts=a.split(':'),ci=Number(parts[2]),si=Number(parts[3]);if(SETCATS[ci]&&SETCATS[ci][1][si]){Settings720.query='';Settings720.filter='';setCat=ci;setSub=si;tab='settings';render();}return;}
 if(a==='compact720:toggle'){Compact720.apply(!Compact720.compact());render();return;}
 if(a==='updGet'){Update720.show();return;}
 if(a==='update720:later'){Update720.pending=null;render();return;}
 if(a==='update720:download'){const info=Update720.pending;if(!info||!Update720.valid(info.apk)){toast('Lien APK GitHub invalide : vérifie le dépôt dans les réglages.');return;}saveBackup(true);if(A&&A.openUrl)A.openUrl(info.apk);else toast('Aperçu : téléchargement après validation.');Update720.pending=null;render();return;}
 return old.apply(this,arguments);
};}
