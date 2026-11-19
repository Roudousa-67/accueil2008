/* Accueil 7.30 : réglages validés, lanceur d'applications et cycle GPS. */
(()=>{'use strict';
 const defaults={carScale730:44,limit730:true,weather730:'compact',hudContrast730:false,mediaLayout730:'compact',mediaAccent730:'theme',mediaText730:'theme',mediaBackground730:'theme',mediaFont730:'theme',mediaOrder730:'cover-first',dockSize730:34,dockGap730:8,dockLabels730:false,dockColor730:'color',dockAccent730:'theme',dockBackground730:'theme',dockLock730:true,appsSize730:56,season730:'auto'};
 const get=k=>store.get(k,defaults[k]),number=(k,min,max)=>Math.max(min,Math.min(max,Number(get(k))||defaults[k])),color=(v,fallback)=>/^#[0-9a-f]{6}$/i.test(String(v))?v:fallback;
 const font=()=>APP_FONTS_ALL.includes(get('mediaFont730'))?get('mediaFont730'):'inherit';
 function save(k,v){if(!(k in defaults))return;store.set(k,v);Settings720.index=null;}
 if(!store.get('migrated730',false)){if(store.get('driver728On',null)===null)store.set('driver728On',false);store.set('migrated730',true);}
 function allowedGPS(){return tab==='home'&&!editing&&!gbMenu&&!gpsMenu&&!Driver728.preview&&!fPick&&!fFolder&&!fAsk&&!document.hidden&&(!window.Perf725||!Perf725.paused())&&!document.querySelector('.ov.on,[data-help723],[data-dockedit730]');}
 const frameRect=Frame710.rect;Frame710.rect=function(){return allowedGPS()?frameRect.apply(this,arguments):null;};gbRect=Frame710.rect;
 let gpsSuppressed=false;
 function hideGPS(){
  const n=window.GpsDock;if(!n)return;
  try{n.gpsVisible(false);}catch(e){}
  if(gbLive&&gbMode()==='cadre'&&!Frame710.embedded()&&!gpsSuppressed){
   try{if(n.gpsWindowVisible&&n.gpsWindowVisible(gbPk(),false)){gpsSuppressed=true;Window723.hidden=true;Window723.retryAt=0;}}catch(e){}
  }
 }
 const frameSync=Frame710.sync;Frame710.sync=function(){
  if(!allowedGPS()){hideGPS();return;}
  if(gpsSuppressed){Window723.hidden=true;Window723.retryAt=0;gpsSuppressed=false;}
  return frameSync.apply(this,arguments);
 };
 const launchFrame=window.gbLaunch;window.gbLaunch=function(){if(!allowedGPS())return false;return launchFrame.apply(this,arguments);};
 const oldOpenSet=window.openSet;window.openSet=function(cat,sub){hideGPS();if(cat==='Navigation'&&sub==='Paysages et météo'){cat='Widgets';sub='Vue voiture et route';}if(cat==='Navigation'&&sub==='Panneaux et localités'){cat='Widgets';sub='Vue voiture et route';}return oldOpenSet(cat,sub);};
 function syncCar(cv){
  const car=cv.parentNode.querySelector('[data-car360]');if(!car)return;const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
  const fraction=number('carScale730',28,62)/100;
  car.style.width=Math.min(w*fraction,h*.60*503/300)+'px';
  if(roadScene()==='autoroute')car.style.left='52%';
 }
 const bigCar=RoadNear728.bigCar;RoadNear728.bigCar=function(cv){bigCar(cv);syncCar(cv);};
 const draw=RoadDecor721.draw;RoadDecor721.draw=function(cv){const r=draw.apply(this,arguments);syncCar(cv);
  if(roadScene()==='ville'&&window.CityCar730&&(!Driver728.enabled()||cv.dataset.driverFallback==='1')){
   const ctx=cv.getContext('2d');if(ctx){ctx.save();ctx.setTransform(1,0,0,1,0,0);(window.TrafficReview||[]).forEach((v,i)=>{if(v.q>.1&&v.q<1.7)CityCar730(ctx,v.x*cv.width,v.y*cv.height,cv.width*.24*v.q,i);});ctx.restore();}
  }return r;};
 function applyHud(){
  document.querySelectorAll('.roadHud728').forEach(h=>{h.classList.toggle('contrast730',!!get('hudContrast730'));h.dataset.weather730=get('weather730');const lim=h.querySelector('.limit728');if(lim)lim.hidden=!get('limit730');});
 }
 function mediaPalette(p){return Object.assign({},p,{acc:color(get('mediaAccent730'),p.acc),mbg:color(get('mediaBackground730'),p.mbg),mtxt:color(get('mediaText730'),p.mtxt)});}
 function mediaHTML(p,preview=false){
  const mp=mediaPalette(p),layout=get('mediaLayout730'),accent=mp.acc,txt=color(get('mediaText730'),'#f2f2f4');
  return `<div class="media730 ${layout==='detail'?'detail730':'compact730'} ${get('mediaOrder730')==='controls-first'?'controlsFirst730':''}" style="background:${mp.mbg};color:${txt};font-family:${esc(font())};--mediaAccent730:${accent}">
   <div class="cover730">${coverC(mp,layout==='detail'?'86px':'68px')}</div>
   <div class="meta730"><div data-k="mApp" class="app730">Multimédia</div><div data-k="mTitle" class="title730">${preview?'Aperçu du titre':'Aucune lecture'}</div><div data-k="mArtist" class="artist730">${preview?'Artiste · Radio · Vidéo':'Ouvre ton application multimédia'}</div>${layout==='compact'?barC(mp):''}</div>
   <div class="controls730">${ctlC(mp,50)}</div>
   ${layout==='detail'?`<div class="timeline730">${barC(mp)}<div class="times730"><span data-media730="position">0:00</span><span data-media730="duration">—</span></div></div>`:''}${accessC()}</div>`;
 }
 window.musicC=function(p){return mediaHTML(p);};
 const baseDock=DOCK_ALL.slice(),home={id:'home',label:'Accueil',icon:'home',bg:'#66829b'},apps=baseDock.find(d=>d.id==='apps');
 const initial=['gps','music','radio','phone','settings'];
 function dockItems(){
  const ids=store.get('dockOrder730',initial),seen=new Set();const middle=(Array.isArray(ids)?ids:initial).filter(id=>typeof id==='string'&&id!=='home'&&id!=='apps'&&!seen.has(id)&&seen.add(id)).slice(0,10).map(id=>baseDock.find(d=>d.id===id)||(id.startsWith('pkg.')?{id,label:(allApps().find(a=>a.p===id.slice(4))||{}).l||id.slice(4),icon:'grid',pk:id.slice(4),bg:hashCol(id)}:null)).filter(Boolean);
  return [home,...middle,apps];
 }
 function setDock(ids){store.set('dockOrder730',ids.filter(x=>x!=='home'&&x!=='apps').slice(0,10));}
 function addDock(pk){if(!allApps().some(a=>a.p===pk))return;const id='pkg.'+pk,ids=dockItems().slice(1,-1).map(d=>d.id);if(!ids.includes(id)){if(ids.length>=10){toast('La barre contient déjà 10 raccourcis. Retire-en un dans les réglages.');return;}ids.push(id);setDock(ids);}toast('Raccourci ajouté à la barre.');}
 let selected='',editID=null;
 window.dockC=function(p,vertical=false){
  if(p.noChrome)return '';const size=number('dockSize730',24,48),gap=number('dockGap730',0,18),accent=color(get('dockAccent730'),p.acc),background=color(get('dockBackground730'),p.card2);
  return `<nav aria-label="Raccourcis" class="dock730 ${vertical?'vertical730':''}" style="gap:${gap}px;background:${background};--dockAccent730:${accent};--dockIcon730:${size}px">${dockItems().map(d=>{
   const active=d.id==='home'?tab==='home':d.id==='settings'?tab==='settings':selected===d.id;
   const iconColor=get('dockColor730')==='mono'?p.txt:(d.bg||accent),pkg=d.id.startsWith('pkg.')?d.pk:'';
   return `<button data-act="nav730:${esc(d.id)}" data-dock730="${esc(d.id)}" aria-label="${esc(d.label)}" ${active?'aria-current="page"':''} class="dockButton730 ${active?'active730':''}" style="min-width:${Math.max(54,size+20)}px;min-height:${Math.max(54,size+20)}px;color:${p.txt};${active?'background:'+accent+'33;':''}">${pkg?`<span class="fic" style="--ics:${size}px;background:${hashCol(pkg)}">${esc(d.label[0])}<img data-icon="${esc(pkg)}" alt=""></span>`:ic(d.icon,size,iconColor,2)}${get('dockLabels730')?`<span>${esc(d.label)}</span>`:''}</button>`;
  }).join('')}</nav>`;
 };
 function launch(pk){if(!pk){toast('Choisis une application dans les réglages.');return false;}try{if(!A){toast('Aperçu : ouverture de l’application.');return true;}if(A.launch(pk)!==false){store.set('lastApp730',pk);return true;}}catch(e){}toast('Application indisponible. Choisis une autre application.');return false;}
 function redrawApps(query=''){
  const grid=$('appGrid'),q=query.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const list=allApps().filter(a=>String(a.l||a.p).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q));
  grid.className='allApps730';grid.style.setProperty('--appsSize730',number('appsSize730',40,84)+'px');
  grid.innerHTML=list.length?list.map(a=>`<button data-act="app:${esc(a.p)}" class="appButton730" aria-label="${esc(a.l)}"><span class="fic" style="--ics:${number('appsSize730',40,84)}px;background:${hashCol(a.p)}">${esc((a.l||'?')[0])}<img data-icon="${esc(a.p)}" alt=""></span><span>${esc(a.l)}</span></button>`).join(''):'<p>Aucune application correspondante.</p>';
  fLoadIcons(grid);const count=$('appCount730');if(count)count.textContent=list.length+' applications';
 }
 window.openDrawer=function(forItem){
  hideGPS();assignFor=forItem||null;$('drawerTitle').textContent=forItem?`Choisir pour « ${forItem.label} »`:'Toutes les applications';
  const dr=$('drawer');dr.dataset.all730='';dr.classList.add('on');
  let search=$('appSearch730');if(!search){const wrap=document.createElement('div');wrap.className='search730';wrap.innerHTML='<input id="appSearch730" type="search" placeholder="Rechercher une application" aria-label="Rechercher une application"><span id="appCount730"></span>';$('appGrid').before(wrap);search=$('appSearch730');search.addEventListener('input',()=>redrawApps(search.value));}
  search.value='';redrawApps();
 };
 function editDock(id){
  editID=id;const d=dockItems().find(x=>x.id===id);if(!d)return;hideGPS();
  const el=document.createElement('div');el.dataset.dockedit730='';el.className='dockEdit730';el.innerHTML=`<div><h3>${esc(d.label)}</h3>${chipBtn(curP,'dock730:move:-1','Monter')}${chipBtn(curP,'dock730:move:1','Descendre')}${chipBtn(curP,'dock730:assign','Choisir une application')}${chipBtn(curP,'dock730:remove','Retirer')}${chipBtn(curP,'dock730:close','Fermer')}</div>`;$('screen').appendChild(el);
 }
 function closeDockEdit(){document.querySelectorAll('[data-dockedit730]').forEach(e=>e.remove());editID=null;Frame710.sync();}
 const range=(k,label,min,max,step=1)=>`<label class="prefRow730">${label}<input data-pref730="${k}" type="range" min="${min}" max="${max}" step="${step}" value="${number(k,min,max)}"><output>${get(k)}</output></label>`;
 const choices=(k,label,items)=>`<label class="prefRow730">${label}<select data-pref730="${k}">${items.map(([v,s])=>`<option value="${esc(v)}" ${String(get(k))===String(v)?'selected':''}>${esc(s)}</option>`).join('')}</select></label>`;
 const toggle=(k,label)=>`<label class="prefRow730">${label}<input type="checkbox" data-pref730="${k}" ${get(k)?'checked':''}></label>`;
 const colors=(k,label)=>`<div class="prefRow730">${label}<div>${['theme','#e15c5b','#3478b8','#1d9e75','#ffffff','#162b41','#294d89'].map(v=>`<button data-act="pref730:${k}:${v}" style="background:${v==='theme'?'#607080':v};color:#fff;padding:8px;border-radius:8px;margin:2px;border:2px solid ${get(k)===v?'#e5d18c':'transparent'}" aria-label="${esc(label+' '+v)}">${v==='theme'?'Thème':'●'}</button>`).join('')}<input data-pref730="${k}" aria-label="${esc(label)} personnalisée" type="color" value="${color(get(k),'#294d89')}"></div></div>`;
 const nav=SETCATS.find(c=>c[0]==='Navigation'),land=nav[1].find(s=>s[0]==='Paysages et météo'),places=nav[1].find(s=>s[0]==='Panneaux et localités');
 function roadSettings(p){return `<div class="prefs730"><h3>Vue voiture et route</h3>${range('carScale730','Taille de la voiture',28,62)}${toggle('limit730','Afficher le panneau à côté de la vitesse')}${toggle('hudContrast730','Renforcer le contraste des informations')}${choices('weather730','Météo',[['compact','Compacte'],['complete','Complète'],['hidden','Masquée']])}${choices('season730','Saison du décor',[['auto','Selon la date'],['printemps','Printemps'],['ete','Été'],['automne','Automne'],['hiver','Hiver']])}<div class="liveRoad730" data-decor721-preview><canvas data-road="v"></canvas><div data-car360 role="img" aria-label="Aperçu de la voiture"></div><div class="roadHud728"><div class="roadSpeed728"><div class="roadSpeedRow728"><span class="speed728">47</span><span class="limit728">${limitSign(48)}</span></div><span class="unit728">KM/h</span></div><button data-act="wxDetail" class="roadWeather728"><div class="weatherCity728">Aperçu météo</div><div class="weatherTemp728"><span>12°</span></div><div class="weatherMin728">10–14°C</div></button></div></div><p>La taille de la voiture se voit directement dans cet aperçu. Les bâtiments, animaux et bretelles constituent un décor ; le guidage reste celui de ton application GPS.</p>${land?land[1](p):''}${places?places[1](p):''}${chipBtn(p,'driver730:settings','Vue conducteur GPS et GPX')}</div>`;}
 function multimediaSettings(p){return `<div class="prefs730"><h3>Multimédia</h3>${choices('mediaLayout730','Présentation',[['compact','Compacte (A)'],['detail','Détaillée (B)']])}${choices('mediaOrder730','Disposition',[['cover-first','Pochette à gauche'],['controls-first','Commandes à gauche']])}${choices('mediaFont730','Écriture',[['theme','Écriture du thème'],...APP_FONTS_ALL.map(f=>[f,f])])}${colors('mediaAccent730','Couleur des commandes')}${colors('mediaText730','Couleur de l’écriture')}${colors('mediaBackground730','Fond')}${mediaHTML(p,true)}${setRow(p,'Application préférée','Choisis une application de musique, radio ou vidéo.',chipBtn(p,'media730:choose','Choisir'))}<p>Le titre, la pochette et les commandes dépendent des informations transmises par l’application à Android. Si elle ne les fournit pas, ouvre-la depuis la pochette.</p></div>`;}
 function dockSettings(p){return `<div class="prefs730"><h3>Barre des raccourcis</h3>${range('dockSize730','Taille des icônes',24,48)}${range('dockGap730','Espacement',0,18)}${toggle('dockLabels730','Afficher les noms')}${toggle('dockLock730','Verrouiller la disposition')}${choices('dockColor730','Icônes',[['color','Colorées'],['mono','Monochromes']])}${colors('dockAccent730','Sélection')}${colors('dockBackground730','Fond de la barre')}<div class="dockPreview730">${dockC(p,false)}</div>${dockItems().slice(1,-1).map(d=>setRow(p,d.label,'',chipBtn(p,'dock730:edit:'+d.id,'Modifier'))).join('')}${chipBtn(p,'dock730:add','Ajouter une application')}${chipBtn(p,'dock730:reset','Rétablir la barre par défaut')}<p>Accueil et Toutes les applications restent accessibles. Déverrouille la disposition pour modifier un raccourci par appui long.</p></div>`;}
 const driverSettings=nav[1].find(s=>s[0]==='Vue conducteur');
 SETCATS.push(['Widgets',[['Vue voiture et route',roadSettings],['Multimédia',multimediaSettings],['Barre des raccourcis',dockSettings],['Toutes les applications',p=>`<div class="prefs730">${range('appsSize730','Taille des icônes',40,84)}${chipBtn(p,'apps730:preview','Voir toutes les applications')}<p>Toutes les applications sont réunies dans une grille. Fais défiler si elles ne tiennent pas à l’écran. Un appui long permet d’ajouter un raccourci.</p></div>`]]]);
 nav[1]=nav[1].filter(s=>!['Paysages et météo','Panneaux et localités'].includes(s[0]));Settings720.index=null;
 function refresh(){render();paint();}
 function apply(){applyHud();document.querySelectorAll('canvas[data-road]').forEach(cv=>syncCar(cv));fLoadIcons($('screen'));}
 const oldRender=window.render;window.render=function(){if(!allowedGPS())hideGPS();const r=oldRender.apply(this,arguments);apply();Frame710.sync();return r;};
 const paintBefore=window.paint;window.paint=function(){const r=paintBefore.apply(this,arguments);applyHud();
  const m=typeof media!=='undefined'?media:null,position=m&&Number.isFinite(m.pos)?Math.max(0,m.pos+(m.playing?Date.now()-mediaPosAt:0)):0,duration=m&&Number.isFinite(m.dur)?m.dur:0,fmt=n=>Math.floor(n/60000)+':'+String(Math.floor(n/1000)%60).padStart(2,'0');
  document.querySelectorAll('[data-media730]').forEach(e=>e.textContent=e.dataset.media730==='position'?fmt(duration?Math.min(position,duration):position):duration?fmt(duration):'—');
  document.querySelectorAll('.media730').forEach(e=>{e.querySelectorAll('[data-act="mPrev"],[data-act="mNext"]').forEach(b=>b.disabled=!m);if(!m){const title=e.querySelector('[data-k="mTitle"]');if(title)title.textContent='Aucune lecture';const artist=e.querySelector('[data-k="mArtist"]');if(artist)artist.textContent='Musique, radio ou vidéo';}});return r;};
 const oldAct=window.act;window.act=function(a,long){
  a=String(a);
  if(['gear','drawer'].includes(a)||a.startsWith('tab:')&&a!=='tab:home')hideGPS();
  if(a.startsWith('pref730:')){const [,key,...v]=a.split(':');save(key,v.join(':'));refresh();return;}
  if(a==='driver730:settings'){openSet('Navigation','Vue conducteur');return;}
  if(a==='apps730:preview'){openDrawer(null);return;}
  if(a==='media730:choose'){openDrawer({id:'multimedia730',label:'Multimédia'});return;}
  if(a==='dock730:add'){openDrawer({id:'add730',label:'Ajouter à la barre'});return;}
  if(a==='dock730:reset'){store.set('dockOrder730',initial.slice());for(const k of Object.keys(defaults).filter(k=>k.startsWith('dock')))store.set(k,defaults[k]);refresh();return;}
  if(a.startsWith('dock730:edit:')){editDock(a.slice(13));return;}
  if(a==='dock730:close'){closeDockEdit();return;}
  if(a.startsWith('dock730:move:')){const ids=dockItems().slice(1,-1).map(d=>d.id),i=ids.indexOf(editID),j=i+Number(a.slice(13));if(i>=0&&j>=0&&j<ids.length){[ids[i],ids[j]]=[ids[j],ids[i]];setDock(ids);}const id=editID;closeDockEdit();refresh();editDock(id);return;}
  if(a==='dock730:remove'){setDock(dockItems().slice(1,-1).filter(d=>d.id!==editID).map(d=>d.id));closeDockEdit();refresh();return;}
  if(a==='dock730:assign'){const d=dockItems().find(x=>x.id===editID);closeDockEdit();if(d)openDrawer(d);return;}
  if(a.startsWith('nav730:')){const id=a.slice(7),d=dockItems().find(x=>x.id===id);if(!d)return;
   if(long&&id!=='home'&&id!=='apps'){if(get('dockLock730'))toast('Déverrouille la barre dans Paramètres → Widgets → Barre des raccourcis.');else editDock(id);return;}
   if(id==='apps'){openDrawer(null);return;}if(id==='home'){closeOverlays();tab='home';refresh();return;}if(id==='settings'){openSet('Widgets','Barre des raccourcis');return;}
   selected=id;if(id.startsWith('pkg.')){launch(d.pk);return;}return oldAct('dock:'+id,long);
  }
  if(a.startsWith('app:')){const pk=a.slice(4);if(long&&!assignFor){addDock(pk);return;}
   if(assignFor&&assignFor.id==='add730'){addDock(pk);closeOverlays();refresh();return;}
   if(assignFor){store.set('dock_'+assignFor.id,pk);closeOverlays();refresh();return;}
   closeOverlays();launch(pk);Frame710.sync();return;
  }
  if(['mPrev','mNext','mPlay','mArt'].includes(a)){
   if(a==='mArt'||!media){const pk=media&&media.pkg||store.get('dock_multimedia730','')||dockPk47(baseDock.find(d=>d.id==='music'));launch(pk);return;}
   try{const command=a==='mPrev'?'prev':a==='mNext'?'next':media.playing?'pause':'play';if(A&&A.media(command)===false)toast('Cette application ne fournit pas cette commande. Ouvre-la depuis la pochette.');}catch(e){toast('Commande multimédia indisponible pour cette application.');}return;
  }
  const r=oldAct.apply(this,arguments);Frame710.sync();return r;
 };
 function updatePref(el){const key=el.dataset.pref730;if(!key)return;let value=el.type==='checkbox'?el.checked:el.type==='range'?Number(el.value):el.value;save(key,value);if(el.nextElementSibling&&el.nextElementSibling.tagName==='OUTPUT')el.nextElementSibling.textContent=value;apply();RoadLoop725.invalidate();}
 document.addEventListener('input',e=>{if(e.target.matches('[data-pref730]'))updatePref(e.target);});
 document.addEventListener('change',e=>{if(e.target.matches('[data-pref730]')){updatePref(e.target);refresh();}});
 const back=window.onBackKey;window.onBackKey=function(){if(editID){closeDockEdit();return;}const r=back.apply(this,arguments);Frame710.sync();return r;};
 const css=document.createElement('style');css.textContent=`
 .roadHud728{grid-template-columns:minmax(0,1fr) auto;gap:14px}.roadSpeedRow728{min-height:72px;gap:14px}.speed728{min-width:2.15em;font-variant-numeric:tabular-nums}.limit728[hidden]{display:none!important}.roadWeather728{text-align:right;min-width:130px}.weatherCity728{justify-content:flex-end}.weatherTemp728{justify-content:flex-end}.weatherMin728{padding:0}.roadHud728[data-weather730=compact] .weatherMin728{display:none}.roadHud728[data-weather730=hidden] .roadWeather728{display:none}.contrast730 .roadSpeed728,.contrast730 .roadWeather728{background:#142a3d88;border-radius:14px;padding:8px 10px}.liveRoad730{height:280px;max-width:560px;position:relative;overflow:hidden;border-radius:16px;background:#6b9272}.liveRoad730 canvas{width:100%;height:100%}.liveRoad730 [data-car360]{position:absolute;left:57%;bottom:8%;width:44%;aspect-ratio:503/300;transform:translateX(-50%);background:url(car/route-360.webp) 52.174% 0/2400% 100% no-repeat}.liveRoad730 .speed728{font-size:46px}.liveRoad730 .unit728{font-size:14px}.liveRoad730 .roadSpeedRow728{min-height:48px}.liveRoad730 .roadHud728{top:10px}.liveRoad730 .weatherCity728{font-size:13px}.liveRoad730 .weatherTemp728{font-size:25px}
 .media730{border-radius:18px;padding:12px;display:grid;grid-template-columns:auto minmax(0,1fr) 150px;gap:12px;align-items:center;min-height:94px;overflow:hidden}.media730 .app730{font-size:12px;opacity:.8}.media730 .title730{font-size:18px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.media730 .artist730{font-size:13px;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:3px 0 7px}.controls730 button{min-width:44px;min-height:46px}.controls730 button:disabled{opacity:.35}.detail730 .timeline730{grid-column:1/-1}.times730{display:flex;justify-content:space-between;margin-top:4px;font-size:12px;opacity:.8}.controlsFirst730 .controls730{grid-column:1;grid-row:1}.controlsFirst730 .cover730{grid-column:3;grid-row:1}.controlsFirst730 .meta730{grid-column:2;grid-row:1}.controlsFirst730{grid-template-columns:150px minmax(0,1fr) auto}.media730 [data-show=mAccess]{grid-column:1/-1}
 .dock730{display:flex;align-items:center;justify-content:space-around;padding:8px;border-radius:18px;overflow:auto;min-width:0;min-height:0}.dock730.vertical730{flex-direction:column;justify-content:flex-start;overflow-y:auto}.dockButton730{flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border-radius:14px;padding:6px;touch-action:manipulation}.dockButton730 span:not(.fic){font-size:11px;max-width:85px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dockButton730.active730{background:color-mix(in srgb,var(--dockAccent730) 28%,transparent);box-shadow:inset 3px 0 0 var(--dockAccent730)}.dockPreview730{max-width:700px}.prefs730{max-width:900px;display:flex;flex-direction:column;gap:14px}.prefRow730{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;min-height:48px;padding:8px 0}.prefRow730 input[type=range]{width:min(300px,45vw)}.prefRow730 input[type=checkbox]{width:26px;height:26px}.prefRow730 select{max-width:100%;min-height:44px;padding:8px;background:#253e57;color:#fff;border-radius:9px}.prefs730 p{line-height:1.5;opacity:.8}.dockEdit730{position:absolute;inset:0;z-index:5000;background:#0009;display:grid;place-items:center}.dockEdit730>div{background:#20374e;padding:22px;border-radius:18px;max-width:520px;display:flex;flex-wrap:wrap;gap:10px}.dockEdit730 h3{flex-basis:100%;margin-top:0}
 #drawer[data-all730]{inset:0;padding:18px;z-index:5000}#drawer[data-all730] #appGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(calc(var(--appsSize730) + 55px),1fr));gap:12px;overflow:auto;flex:1;min-height:0;padding:12px 0;align-content:start}#drawer[data-all730] #ap47az,#drawer[data-all730] #ap47lg{display:none!important}.appButton730{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:8px;min-height:96px;padding:10px 5px;border-radius:14px;background:#ffffff0b}.appButton730>span:last-child{max-width:100%;font-size:13px;overflow-wrap:anywhere;line-height:1.2}.search730{display:flex;gap:14px;align-items:center}.search730 input{flex:1;min-width:0;height:48px;border:1px solid #8ba2b255;background:#142a3e;color:#fff;border-radius:12px;padding:0 14px;font-size:18px}.search730 span{font-size:13px;opacity:.7}.dock730 img{object-fit:contain}
 @media(max-width:650px){.media730{grid-template-columns:auto minmax(0,1fr);gap:8px}.media730 .controls730{grid-column:1/-1}.roadHud728{gap:6px}.speed728{min-width:0}.roadWeather728{min-width:95px}}
 `;document.head.appendChild(css);
 window.App730={get,save,allowedGPS,hideGPS,dockItems,addDock,mediaHTML,roadSettings,apply,syncCar};
})();
