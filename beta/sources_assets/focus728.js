/* Grand cadrage de la voiture et panneaux périodiques de localités réelles. */
(()=>{'use strict';
 const intervals=[0,.5,1,2,5,10],period=()=>{const v=Number(store.get('near728Km',1));return intervals.includes(v)?v:1;};
 let last=null,metres=0,next=0,active=null;
 function fresh(p=loc){return Place710.valid(p)&&Number.isFinite(p.ts)&&Date.now()-p.ts>=0&&Date.now()-p.ts<=10000&&Number.isFinite(p.acc)&&p.acc>=0&&p.acc<=50;}
 function closest(p=loc){
  if(!fresh(p)||typeof plList==='undefined'||!Array.isArray(plList)||!Place710.valid(plPos)||!Number.isFinite(plAt)||Date.now()-plAt<0||Date.now()-plAt>Math.max(120000,Place710.every()*2)||hav(p.lat,p.lon,plPos.lat,plPos.lon)>5)return [];
  const seen=new Set();return plList.filter(x=>Place710.valid(x)&&typeof x.n==='string'&&x.n.trim()&&/^(city|town|village|hamlet)$/.test(x.k)).map(x=>({name:x.n.trim().slice(0,100),km:hav(p.lat,p.lon,x.lat,x.lon)})).filter(x=>Number.isFinite(x.km)&&x.km<=25).sort((a,b)=>a.km-b.km).filter(x=>{const key=x.name.toLocaleLowerCase('fr');if(seen.has(key))return false;seen.add(key);return true;}).slice(0,2);
 }
 function advance(p=loc){
  if(!fresh(p)){last=null;active=null;return null;}
  if(!last){last={...p};return metres;}
  if(p.ts===last.ts)return metres;
  const dt=(p.ts-last.ts)/1000,d=hav(last.lat,last.lon,p.lat,p.lon)*1000;
  if(dt<=0)return metres;
  if(dt>15||d>Math.max(50,60*dt)){last={...p};active=null;return metres;}
  // Stationary GPS jitter must not manufacture kilometres or signs.
  if(d<Math.max(3,Math.min(p.acc,last.acc)*.3))return metres;
  metres+=d;last={...p};return metres;
 }
 function update(){
  if(!period()){active=null;last=null;return null;}
  if(advance()===null)return null;
  const rows=closest();if(!rows.length){active=null;return null;}
  if(metres>=next){active={at:metres,rows};next=metres+period()*1000;}
  if(active&&metres-active.at>165)active=null;
  return active;
 }
 function bigCar(cv){const car=cv.parentNode&&cv.parentNode.querySelector('[data-car360]');if(!car)return;
  const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
  // The rear sprite contains transparent side margins: 64% gives a visible car
  // roughly 32% of the tile width, matching the reference without changing it.
  car.style.width=Math.min(w*.64,h*.60*503/300)+'px';car.style.height='auto';car.style.aspectRatio='503/300';car.style.bottom='8%';car.style.backgroundPosition='52.174% 0';
 }
 function hide(box){const e=box.querySelector('[data-near728]');if(e)e.hidden=true;}
 function paint(cv){const box=cv.parentNode;if(!box)return;bigCar(cv);
  if(cv.closest('[data-decor721-preview]')||window.BetaRoad&&BetaRoad.mode()==='demo'){hide(box);return;}
  const item=update();if(!item){hide(box);return;}
  let e=box.querySelector('[data-near728]');if(!e){e=document.createElement('div');e.dataset.near728='';e.className='near728';e.setAttribute('role','status');const head=document.createElement('b');head.className='near728-head';head.textContent='LOCALITÉS PROCHES';e.appendChild(head);const list=document.createElement('div');list.className='near728-list';e.appendChild(list);const foot=document.createElement('small');foot.textContent='Distances à vol d’oiseau';e.appendChild(foot);box.appendChild(e);}
  if(e._item!==item){const list=e.querySelector('.near728-list');list.replaceChildren();for(const row of item.rows){const line=document.createElement('div'),name=document.createElement('span'),km=document.createElement('strong');name.textContent=row.name;km.textContent=(row.km<.1?'< 0,1':row.km.toLocaleString('fr',{minimumFractionDigits:row.km<10?1:0,maximumFractionDigits:row.km<10?1:0}))+' km';line.append(name,km);list.appendChild(line);}e._item=item;}
  // One fixed roadside point: grows on approach and leaves after passing.
  const q=50/(120-(metres-item.at)+50);if(q<=0||q>2.2){e.hidden=true;return;}
  e.hidden=false;e.style.top=(39+Math.min(1.7,q)*32)+'%';e.style.transform='translate(-50%,-100%) scale('+Math.min(1.05,Math.max(.45,q*1.45))+')';
 }
 function setPeriod(v){v=Number(v);if(!intervals.includes(v))return;store.set('near728Km',v);active=null;next=metres;last=null;render();if(window.RoadLoop725)RoadLoop725.invalidate();}
 const nav=SETCATS.find(c=>c[0]==='Navigation');if(nav)nav[1].push(['Voiture et panneaux proches',p=>setRow(p,'Voiture en grand','Cadrage agrandi, comme sur la vue d’origine. Le reste du décor est conservé.','')+setRow(p,'Panneaux des villes et villages proches','Un panneau au début, puis à cette distance parcourue. Noms réels issus de la carte ; distances à vol d’oiseau, sans indication de sortie ni de direction. GPS récent et Internet nécessaires pour actualiser les lieux.','<div style="display:flex;gap:8px;flex-wrap:wrap">'+intervals.map(v=>chipBtn(p,'near728:km:'+v,v?v.toLocaleString('fr')+' km':'Désactivés',period()===v)).join('')+'</div>')]);
 const oldAct=window.act;window.act=function(a){if(String(a).startsWith('near728:km:')){setPeriod(a.split(':')[2]);return;}return oldAct.apply(this,arguments);};
 const draw=RoadDecor721.draw;RoadDecor721.draw=function(cv){const result=draw.apply(this,arguments);paint(cv);return result;};
 const style=document.createElement('style');style.textContent='.near728{position:absolute;left:84%;width:31%;max-width:230px;box-sizing:border-box;z-index:5;pointer-events:none;transform-origin:50% 100%;background:#f4f5ed;color:#162d36;border:2px solid #e8eff0;border-radius:3px;box-shadow:0 2px 4px #0006;font:600 clamp(10px,1.15vw,15px)/1.25 Inter,sans-serif}.near728[hidden]{display:none}.near728-head{display:block;padding:5px 3px;background:#245d84;color:#fff;font-size:.74em;text-align:center}.near728-list{padding:5px}.near728-list>div{display:flex;gap:5px;align-items:center;margin:4px 0}.near728-list span{flex:1;min-width:0;overflow-wrap:anywhere}.near728-list strong{white-space:nowrap;font-size:.88em}.near728 small{display:block;text-align:center;font-size:.65em;padding:2px 2px 5px}.near728:before,.near728:after{content:"";position:absolute;top:100%;height:22px;width:3px;background:#a7b6bc;box-shadow:1px 1px 2px #0005}.near728:before{left:20%}.near728:after{right:20%}';document.head.appendChild(style);
 window.RoadNear728={period,setPeriod,closest,advance,update,paint,bigCar,state:()=>({metres,next,active}),reset(){last=null;metres=0;next=0;active=null;}};
})();
