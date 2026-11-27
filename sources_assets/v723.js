/* 7.23 : cycle de fenêtre GPS, reconnaissance routière et aide des paramètres. */
'use strict';
window.Window723 = {
 hidden:false, retryAt:0, warned:false,
 sync(){
  if(Frame710.embedded() || !gbLive || gbMode()!=='cadre')return;
  // Ne jamais ramener le lanceur devant une autre application ou un écran éteint.
  if(document.hidden)return;
  const r=Frame710.rect(),show=!!r;
  const n=window.GpsDock;
  if(!show){
   if(this.hidden || Date.now()<this.retryAt)return;
   this.retryAt=Date.now()+5000;
   try{if(n&&n.gpsWindowVisible&&n.gpsWindowVisible(gbPk(),false)){this.hidden=true;this.warned=false;return;}}catch(e){}
   if(!this.warned){this.warned=true;dlogAdd('cadre','Le système refuse le masquage de la fenêtre GPS.');toast('Le système refuse de masquer le GPS : utilise le plein écran en attendant.');}
   return;
  }
  if(this.hidden){
   let restored=false;
   try{restored=!!(n&&n.gpsWindowVisible&&n.gpsWindowVisible(gbPk(),true));}catch(e){}
   this.hidden=false;this.retryAt=0;
   if(!restored){gbKey='';gbLaunch(true,'retour sur Accueil',true);return;}
  }
  const prev=store.get('gbLastRect',null);
  if(!prev||prev.pk!==gbPk()||r.some((v,i)=>Math.abs(v-prev.r[i])>2)){
   if(Date.now()<this.retryAt)return;
   let resized=false;
   try{resized=!!(n&&n.gpsResize&&n.gpsResize(gbPk(),...r));}catch(e){}
   if(resized)store.set('gbLastRect',{pk:gbPk(),r,t:Date.now()});
   else{this.retryAt=Date.now()+3500;gbLaunch(true,'alignement du cadre',true);}
  }
 }
};

window.Road723 = {
 cache:[],at:0,pos:null,attempt:0,pending:null,match:null,error:'',
 fresh(p=loc){return Place710.valid(p)&&Number.isFinite(p.ts)&&Date.now()-p.ts>=0&&Date.now()-p.ts<30000&&Number.isFinite(p.acc)&&p.acc>=0&&p.acc<=100;},
 angle(a,b){return Math.abs(((a-b+540)%360)-180);},
 segment(p,geometry){
  const kx=111320*Math.cos(p.lat*Math.PI/180),ky=111320;let best=null;
  for(let i=1;i<geometry.length;i++){
   const a=geometry[i-1],b=geometry[i];if(!Place710.valid(a)||!Place710.valid(b))continue;
   const ax=(a.lon-p.lon)*kx,ay=(a.lat-p.lat)*ky,dx=(b.lon-a.lon)*kx,dy=(b.lat-a.lat)*ky,den=dx*dx+dy*dy;
   if(!den)continue;
   const t=Math.max(0,Math.min(1,-(ax*dx+ay*dy)/den)),distance=Math.hypot(ax+t*dx,ay+t*dy);
   if(!best||distance<best.distance)best={distance,bearing:(Math.atan2(dx,dy)*180/Math.PI+360)%360};
  }return best;
 },
 choose(elements,p){
  if(!this.fresh(p))return null;
  const heading=Number.isFinite(p.brg)&&p.brg>=0&&(curSpeed()||{}).v>8;
  const max=Math.max(25,Math.min(75,(Number(p.acc)||15)*1.5));
  const list=elements.filter(e=>e.tags&&/^(motorway|motorway_link|trunk|trunk_link|primary|secondary|tertiary|unclassified|residential|living_street|service|road|primary_link|secondary_link|tertiary_link)$/.test(e.tags.highway)&&Array.isArray(e.geometry)).map(e=>{
   const s=this.segment(p,e.geometry);if(!s||s.distance>max)return null;
   let delta=0;if(heading){const forward=this.angle(p.brg,s.bearing),reverse=this.angle(p.brg,s.bearing+180);delta=e.tags.oneway==='-1'?reverse:e.tags.oneway==='yes'||e.tags.oneway==='1'?forward:Math.min(forward,reverse);}
   return {e,distance:s.distance,score:s.distance+(heading?delta*.3:0)};
  }).filter(Boolean).sort((a,b)=>a.score-b.score);
  if(!list.length)return null;
  // Routes parallèles : ne pas inventer une autoroute si les deux solutions sont indiscernables.
  const roadClass = e => window.RoadScene731?.regulated(e.tags) ? 'route réglementée' : e.tags.highway;
  if(list[1]&&list[1].score-list[0].score<5&&roadClass(list[1].e)!==roadClass(list[0].e)){
   const previous=list.find(x=>this.match&&x.e.id===this.match.id&&x.score<=list[0].score+3);
   if(!previous)return null;
   if(window.RoadScene731 && RoadScene731.regulated(list[0].e.tags)!==RoadScene731.regulated(list[1].e.tags))return null;
   return previous.e;
  }
  return list[0].e;
 },
 apply(){
  const fresh=this.fresh()&&this.pos&&Date.now()-this.at<30*60000;
  this.match=fresh?this.choose(this.cache,loc):null;
  roadHw=this.match?this.match.tags.highway:'';roadHwAt=this.match?Date.now():0;
  window.__panelGreen=!!this.match&&(window.RoadScene731?RoadScene731.regulated(this.match.tags)&&!/^motorway/.test(roadHw):/^trunk/.test(roadHw));
  limit=this.match&&Date.now()-this.at<60000?parseMax(this.match.tags.maxspeed):null;
  if(this.match){limitOkAt=Date.now();limitOkPos={lat:loc.lat,lon:loc.lon};}
 },
 async refresh(force=false){
  if(DEMO||!this.fresh())return;
  if(this.pending)return this.pending;
  this.apply();
  const far=!this.pos||hav(this.pos.lat,this.pos.lon,loc.lat,loc.lon)>.35;
  if(!force&&((this.at&&Date.now()-this.at<45000&&!far)||(this.attempt&&Date.now()-this.attempt<12000)))return;
  this.attempt=Date.now();const p={lat:loc.lat,lon:loc.lon},at=`${p.lat.toFixed(6)},${p.lon.toFixed(6)}`;
  // 7.36 : en ville, 1 km de rues et d'allées de service dépassait souvent le délai
  // (réponse de plusieurs Mo) : plus aucune route reconnue, décor bloqué sur Campagne.
  // Grands axes sur 1 km, rues résidentielles sur 600 m, voies de service exclues.
  const q=`[out:json][timeout:13];(way(around:1000,${at})[highway~"^(motorway|motorway_link|trunk|trunk_link|primary|secondary|tertiary|unclassified|road|primary_link|secondary_link|tertiary_link)$"];way(around:600,${at})[highway~"^(residential|living_street)$"];);out geom;`;
  let timer;
  this.pending=(async()=>{try{
   const j=await Promise.race([getJSON('https://overpass-api.de/api/interpreter?data='+encodeURIComponent(q)),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),16500);})]);
   if(!Array.isArray(j.elements)||j.remark)throw Error('incomplete');
   if(!this.fresh()||hav(p.lat,p.lon,loc.lat,loc.lon)>.75)return;
   this.cache=j.elements;this.pos=p;this.at=Date.now();this.error='';this.apply();const count=j.elements.reduce((n,e)=>n+(e.geometry||[]).length,0);if(j.elements.length<=200&&count<=12000)store.set('roadCache734',{elements:j.elements,pos:p,at:this.at});
  }catch(e){this.error='Données routières indisponibles';this.apply();}
  finally{clearTimeout(timer);this.pending=null;}})();return this.pending;
 },
 status(){return !this.fresh()?'GPS absent, ancien ou imprécis':this.match?'Route reconnue : '+this.match.tags.highway:this.error||'Route incertaine : nouvelle recherche automatique';}
};
window.maybeLimit=()=>Road723.refresh();
sceneWanted=function(){
 const manual=store.get('roadScene','auto');if(manual!=='auto')return manual;
 if(!Road723.fresh())return 'campagne';
 Road723.apply();
 if(Road723.match){if(/^(motorway|trunk)/.test(roadHw))return 'autoroute';
  const here=Place710.here();if(here)return /^(village|hamlet)$/.test(here.kind)?'village':'ville';
  return /^(residential|living_street)$/.test(roadHw)?'ville':'campagne';}
 // Aucun classement à partir de la seule vitesse.
 const here=Place710.here();return here?(/^(village|hamlet)$/.test(here.kind)?'village':'ville'):'campagne';
};
setInterval(()=>{Road723.apply();},3000);

window.PanelText723={
 lines(text){
  if(text.length<=18)return [text];
  const cuts=[];for(let i=1;i<text.length-1;i++)if(/[ ·-]/.test(text[i]))cuts.push(i);
  if(!cuts.length)return [text];
  const cut=cuts.reduce((a,b)=>Math.abs(a-text.length/2)<Math.abs(b-text.length/2)?a:b);
  return [text.slice(0,cut+(text[cut]==='-'?1:0)).trim(),text.slice(cut+1).trim()].filter(Boolean);
 },
 draw(c,p,text){
  const lines=this.lines(text),size=Math.min(p.height*(lines.length>1?.37:.6),...lines.map(line=>p.width*.85/Math.max(5,line.length*.58)));
  c.font='700 '+size+'px Inter,sans-serif';
  const measured=Math.max(...lines.map(line=>c.measureText(line).width));
  const fit=size*Math.min(1,p.width*.84/Math.max(1,measured));
  c.font='700 '+fit+'px Inter,sans-serif';c.textAlign='center';c.textBaseline='middle';
  lines.forEach((line,i)=>c.fillText(line,p.left+p.width*.5,p.top+p.height*.5+(i-(lines.length-1)/2)*size*1.15,p.width*.85));
 }
};
window.Help723={
 current:null,rows:new Map(),count:0,focus:null,
 plain(html){const t=document.createElement('template');t.innerHTML=html;return (t.content.textContent||'').replace(/\s+/g,' ').trim();},
 decorate(){
  if(tab!=='settings')return;
  this.rows.clear();this.count=0;
  const body=document.querySelector('[data-settings-scroll="body"]');if(!body)return;
  const section=SETCATS[setCat][1][setSub][0];
  const header=document.createElement('div');header.setAttribute('data-help-section','');header.innerHTML=`<button data-act="help723:section" aria-label="Informations sur ${esc(section)}" style="padding:8px 12px;border-radius:10px;background:transparent;color:inherit;border:1px solid currentColor;margin-bottom:10px">ⓘ ${esc(section)} : explications</button>`;body.prepend(header);
  body.querySelectorAll('[data-setting-row]').forEach(row=>{
   const title=row.firstElementChild&&row.firstElementChild.firstElementChild;if(!title)return;
   const name=title.textContent,desc=title.nextElementSibling?title.nextElementSibling.textContent:'';
   const controls=row.lastElementChild.cloneNode(true);
   controls.querySelectorAll('script,iframe,img,video,audio').forEach(e=>e.remove());
   controls.querySelectorAll('*').forEach(e=>{Array.from(e.attributes).filter(a=>a.name.startsWith('on')||['data-act','data-set','id','href','src'].includes(a.name)).forEach(a=>e.removeAttribute(a.name));if(/^(BUTTON|INPUT|SELECT|TEXTAREA)$/.test(e.tagName))e.disabled=true;});
   const choices=Array.from(row.lastElementChild.querySelectorAll('button,option')).map(e=>e.textContent.trim()).filter(Boolean);
   const key=String(++this.count);const acc=(curP||palette()).acc,acts=Array.from(row.lastElementChild.querySelectorAll('button[data-act]')).filter(b=>!/^help723:/.test(b.dataset.act)).map(b=>({act:b.dataset.act,label:b.textContent.trim(),on:(b.getAttribute('style')||'').includes('background:'+acc)}));this.rows.set(key,{name,desc,choices,preview:controls.innerHTML,section,acts});   /* 7.60 : vrais choix, pour les aperçus */
   const button=document.createElement('button');button.textContent='ⓘ';button.setAttribute('data-act','help723:'+key);button.setAttribute('aria-label','Informations : '+name);button.style.cssText='margin-left:8px;min-width:36px;min-height:36px;border-radius:50%;background:transparent;color:inherit;border:1px solid currentColor;font-size:20px;';title.appendChild(button);
  });
  body.querySelectorAll('input,select,textarea').forEach(input=>{
   if(input.closest('[data-setting-row]'))return;
   const name=input.getAttribute('aria-label')||input.getAttribute('placeholder')||input.getAttribute('name')||'Champ de '+section;
   const key=String(++this.count),preview=input.cloneNode(true);preview.disabled=true;preview.removeAttribute('id');preview.removeAttribute('data-set');
   this.rows.set(key,{name,section,desc:'Champ de la rubrique '+section+'. La valeur est enregistrée lorsque tu la modifies dans la page de réglages.',choices:[],preview:preview.outerHTML});
   const button=document.createElement('button');button.textContent='ⓘ';button.setAttribute('aria-label','Informations : '+name);button.setAttribute('data-act','help723:'+key);button.style.cssText='min-width:36px;min-height:36px;background:transparent;color:inherit;border-radius:50%;border:1px solid currentColor;margin-left:4px';input.insertAdjacentElement('afterend',button);
  });
 },
 open(key){
  this.focus=document.activeElement;
  if(key==='section'){const section=SETCATS[setCat][1][setSub][0];this.current={name:section,desc:'Cette rubrique contient : '+Array.from(this.rows.values()).slice(0,6).map(i=>i.name).join(', ')+'. Les boutons ⓘ expliquent chaque réglage. Les commandes affichées dans l’aide sont une illustration : elles ne changent pas tes préférences.',section,choices:[],preview:''};}
  else this.current=this.rows.get(key)||null;
  if(this.current)render();
 },
 example(item){
  const s=Settings720.norm(item.name+' '+item.section);
  if(/cadre gps|appli dans le cadre|gps visible/.test(s))return 'Exemple : Accueil → GPS visible ; Paramètres, Trajets ou Entretien → GPS masqué ; retour sur Accueil → GPS restauré. Le trajet du GPS n’est pas effacé.';
  if(/taille des panneaux/.test(s))return 'Exemple : 120 % agrandit le panneau par rapport à 100 %. La taille du texte augmente avec le panneau et la marge avec la voiture reste protégée.';
  if(/actualiser les panneaux/.test(s))return 'Exemple : 30 s demande une actualisation des localités et de l’adresse toutes les 30 secondes en déplacement. Le réseau et une position récente restent nécessaires.';
  if(/detection de la route/.test(s))return 'Exemple : à 40 km/h sur une autoroute cartographiée, le décor peut rester Autoroute. Une rue proche n’est pas choisie seulement parce qu’elle est dans le cercle GPS. En cas de doute, la détection indique Route incertaine.';
  if(item.choices.length>1)return 'Exemple de choix proposé : « '+item.choices[Math.min(1,item.choices.length-1)]+' ». Lis l’effet ci-dessus, puis ferme cette aide pour l’appliquer avec le vrai bouton.';
  if(item.choices.length)return 'Commande disponible : « '+item.choices[0]+' ». Cette aide ne l’exécute pas ; ferme-la pour utiliser la commande.';
  return 'L’aperçu ci-dessous montre les commandes de ce réglage. Ferme cette fenêtre pour les utiliser ; les champs de l’aide ne modifient rien.';
 },
 visual(item){
  const match=item.name.match(/^D(\d+)/),panel=/taille des panneaux|distance du bord|frequence de passage/.test(Settings720.norm(item.name));
  if(match||panel){const id=match?Number(match[1]):0,scene=[16,17,48,51,52,53,54,55].includes(id)?'autoroute':[24,27,63,64,65].includes(id)?'village':[29,66,67,68,69,70,71,72,75].includes(id)?'foret':'ville',wx=id===38?'pluie':id===39?'neige':'soleil',hour=[26,34,35,73,74,75].includes(id)?23:id===32?6:id===33?19:14;
   return `<div style="margin:12px 0;font-size:13px">Exemple animé fictif · réglages et GPS inchangés</div><div data-roadbox data-decor721-preview data-help-decor723="${id}" data-help-scene723="${scene}" data-help-wx723="${wx}" data-help-hour723="${hour}" style="position:relative;height:220px;overflow:hidden;border-radius:12px"><canvas data-road="v" style="position:absolute;inset:0;width:100%;height:100%"></canvas><div data-car360 style="position:absolute;left:50%;bottom:4%;height:60%;aspect-ratio:503/300;transform:translateX(-50%);background:url(car/route-360.webp) 52.1739% 0/2400% 100% no-repeat"></div></div>`;
  }
  if(/gps|cadre/.test(Settings720.norm(item.name)))return '<div style="display:flex;gap:10px;margin:12px 0"><div style="flex:1;padding:18px;background:#205e86;color:white;border-radius:12px">Accueil<br><b>GPS affiché</b></div><div style="flex:1;padding:18px;background:#35435e;color:white;border-radius:12px">Autres sections<br><b>GPS masqué</b></div></div>';
  return '';
 },
 markup(p){if(!this.current)return '';const i=this.current;return `<div data-help723 style="position:absolute;inset:0;z-index:7000;background:#000b;display:flex;align-items:center;justify-content:center;padding:18px"><div role="dialog" aria-modal="true" aria-labelledby="help723Title" style="width:680px;max-width:100%;max-height:90%;overflow:auto;background:${hex7(p.card)};color:${p.txt};padding:22px;border-radius:18px"><h2 id="help723Title">${esc(i.name)}</h2><p style="line-height:1.5">${esc(i.desc||'Cette commande appartient à la rubrique '+i.section+'.')}</p><p style="line-height:1.5">${esc(this.example(i))}</p>${this.visual(i)}${i.preview?`<div aria-label="Illustration des commandes, sans effet" style="padding:16px;border:1px solid ${p.mut};border-radius:12px;pointer-events:none;opacity:.85">${i.preview}</div>`:''}<p style="font-size:12px;color:${p.mut}">Illustration : aucun réglage modifié.</p><button data-act="help723:close" style="padding:12px 20px;border-radius:12px;background:${p.acc};color:${p.onAcc};font-size:17px">Fermer l’information</button></div></div>`;}
};
// Diagnostic regroupé avec les réglages de détection existants.
{const nav=SETCATS.find(c=>c[0]==='Navigation'),entry=nav&&nav[1].find(s=>s[0]==='Décor de la route');if(entry){const old=entry[1];entry[1]=p=>setRow(p,'Détection de la route',Road723.status()+'. Le mode Automatique utilise la géométrie, la précision GPS et le cap ; aucune autoroute déduite de la seule vitesse.',chipBtn(p,'road723:refresh','Relancer la détection'))+old(p);}}
{const old=render;window.render=function(){const r=old.apply(this,arguments);Help723.decorate();const html=Help723.markup(curP||palette());if(html){$('screen').insertAdjacentHTML('beforeend',html);const close=document.querySelector('[data-help723] [data-act="help723:close"]');if(close)close.focus({preventScroll:true});}Frame710.sync();return r;};}
{const old=window.act;window.act=function(a,long){if(a==='help723:close'){Help723.current=null;render();return;}if(a.startsWith('help723:')){Help723.open(a.slice(8));return;}if(a==='road723:refresh'){Road723.refresh(true);toast('Recherche de la route…');return;}return old.apply(this,arguments);};}
document.addEventListener('keydown',e=>{
 if(!Help723.current)return;
 if(e.key==='Escape'){e.preventDefault();act('help723:close');}
 if(e.key==='Tab'){const dialog=document.querySelector('[data-help723] [role="dialog"]');const items=dialog&&Array.from(dialog.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]'));if(items&&items.length){e.preventDefault();const index=items.indexOf(document.activeElement);items[(index+(e.shiftKey?-1:1)+items.length)%items.length].focus();}}
});
