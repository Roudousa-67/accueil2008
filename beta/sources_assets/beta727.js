/* Bêta indépendante : démonstration, route GPS et GPX local. Aucun itinéraire extrait de Waze. */
(()=>{'use strict';
 const VERSION='7.27.1',previousDraw=RoadDecor721.draw;
 let dialog=!store.get('beta727Intro',false),lastT=0,smooth=null,roadCache=null,gpxCache=null,gpxRaw=null,notice='';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function makePath(points,id='local'){
  const pts=[];let total=0;
  for(const p of points){if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))continue;const last=pts[pts.length-1],d=last?Math.hypot(p.x-last.x,p.y-last.y):0;if(last&&d<.02)continue;total+=d;pts.push({x:p.x,y:p.y,s:total});}
  if(pts.length<2||total<1)return null;
  function at(s){s=clamp(s,0,total);let lo=1,hi=pts.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(pts[mid].s<s)lo=mid+1;else hi=mid;}const a=pts[lo-1],b=pts[lo],u=(s-a.s)/(b.s-a.s);return{x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u};}
  function pose(s){const p=at(s),a=at(Math.max(0,s-2)),b=at(Math.min(total,s+3)),n=Math.hypot(b.x-a.x,b.y-a.y)||1;return{...p,hx:(b.x-a.x)/n,hy:(b.y-a.y)/n};}
  return{pts,total,id,at,pose};
 }
 function nearest(path,p){let best=null;for(let i=1;i<path.pts.length;i++){const a=path.pts[i-1],b=path.pts[i],dx=b.x-a.x,dy=b.y-a.y,len2=dx*dx+dy*dy,u=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/len2,0,1),x=a.x+u*dx,y=a.y+u*dy,d=Math.hypot(x-p.x,y-p.y);if(!best||d<best.distance)best={s:a.s+u*Math.sqrt(len2),distance:d,hx:dx/Math.sqrt(len2),hy:dy/Math.sqrt(len2)};}return best;}
 function geoPath(points,id){if(!Array.isArray(points)||points.length<2)return null;const origin=points[0],kx=111320*Math.cos(origin.lat*Math.PI/180),ky=111320;if(!Number.isFinite(kx)||Math.abs(origin.lat)>85)return null;const path=makePath(points.map(p=>({x:(p.lon-origin.lon)*kx,y:(p.lat-origin.lat)*ky})),id);if(path)path.project=p=>({x:(p.lon-origin.lon)*kx,y:(p.lat-origin.lat)*ky});return path;}
 function parseGPX(xml){if(typeof xml!=='string'||xml.length>2000000||/<!DOCTYPE|<!ENTITY/i.test(xml))throw Error('Fichier GPX non accepté.');const doc=new DOMParser().parseFromString(xml,'application/xml');if(doc.getElementsByTagName('parsererror').length)throw Error('XML GPX invalide.');let nodes=Array.from(doc.getElementsByTagNameNS('*','trkpt'));if(!nodes.length)nodes=Array.from(doc.getElementsByTagNameNS('*','rtept'));if(nodes.length>10000)throw Error('Maximum : 10 000 points GPX.');if(nodes.some(n=>!n.hasAttribute('lat')||!n.hasAttribute('lon')||!n.getAttribute('lat').trim()||!n.getAttribute('lon').trim()))throw Error('Coordonnées GPX manquantes.');const points=nodes.map(n=>({lat:Number(n.getAttribute('lat')),lon:Number(n.getAttribute('lon'))}));if(points.length<2||points.some(p=>!Number.isFinite(p.lat)||!Number.isFinite(p.lon)||Math.abs(p.lat)>85||Math.abs(p.lon)>180))throw Error('Points GPX invalides.');if(!geoPath(points,'test'))throw Error('Tracé trop court.');return points;}
 const demo=(()=>{let a=[];const add=(x,y)=>a.push({x:x*.6,y:y*.6});const line=(p,q)=>{for(let i=0;i<30;i++){const t=i/30;add(p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t)}};const bez=(p,q,r,s)=>{for(let i=0;i<60;i++){const t=i/60,u=1-t;add(u*u*u*p[0]+3*u*u*t*q[0]+3*u*t*t*r[0]+t*t*t*s[0],u*u*u*p[1]+3*u*u*t*q[1]+3*u*t*t*r[1]+t*t*t*s[1])}};
  line([0,0],[0,150]);bez([0,150],[0,190],[80,190],[80,230]);line([80,230],[80,250]);bez([80,250],[80,278],[108,284],[112.3,301.6]);for(let i=0;i<95;i++){const t=-Math.PI/8+(Math.PI*.875)*i/94;add(80+35*Math.cos(t),315+35*Math.sin(t))}bez([55.25,339.75],[35,319],[10,339],[-40,339]);line([-40,339],[-160,339]);add(-160,339);return makePath(a,'demo');})();
 function mode(){const v=store.get('beta727Mode','demo');return ['demo','gps','gpx','classic'].includes(v)?v:'classic';}
 function selectGeometry(){
  if(!window.Road723||!Road723.fresh()||!Road723.match||Date.now()-Road723.at>60000)return null;
  const match=Road723.match;if(!Array.isArray(match.geometry))return null;
  const heading=Number.isFinite(loc.brg)?loc.brg*Math.PI/180:null;
  const key=String(match.id)+'|'+Road723.at;
  if(!roadCache||roadCache.key!==key){const path=geoPath(match.geometry,key);if(!path)return null;roadCache={key,path,reversed:null};}
  let path=roadCache.path,point=path.project(loc),snap=nearest(path,point);
  if(snap&&heading!==null&&snap.hx*Math.sin(heading)+snap.hy*Math.cos(heading)<0){if(!roadCache.reversed)roadCache.reversed=geoPath(match.geometry.slice().reverse(),key+'r');path=roadCache.reversed;}
  return path;
 }
 function sample(T){const m=mode();if(m==='classic')return{fallback:true,label:'Décor classique 7.26'};
  if(m==='demo'){const s=8+((T*13.5)%Math.max(1,demo.total-32));return{path:demo,s,kind:'demo',band:true,label:'DÉMO · trajet fictif · indépendant de Waze'};}
  if(!loc||!Number.isFinite(loc.lat)||!Number.isFinite(loc.lon)||!Number.isFinite(loc.ts)||Date.now()-loc.ts>5000||!Number.isFinite(loc.acc)||loc.acc>60)return{fallback:true,label:'BÊTA · GPS précis et récent nécessaire'};
  let path;if(m==='gps')path=selectGeometry();else{const raw=store.get('beta727GPX',null);if(raw!==gpxRaw){gpxRaw=raw;gpxCache=raw?geoPath(raw,'gpx'):null;}path=gpxCache;}
  if(!path)return{fallback:true,label:m==='gpx'?'BÊTA · importe un GPX dans les réglages':'BÊTA · géométrie routière indisponible'};
  const snap=nearest(path,path.project(loc));if(!snap||snap.distance>40)return{fallback:true,label:'BÊTA · hors du tracé, guidage Waze à consulter'};
  if(m==='gpx'&&Number.isFinite(loc.brg)&&((curSpeed()||{}).v||0)>5){const rad=loc.brg*Math.PI/180;if(snap.hx*Math.sin(rad)+snap.hy*Math.cos(rad)<-.35)return{fallback:true,label:'BÊTA · tracé GPX dans l’autre sens'};}
  if(path.total-snap.s<10)return{fallback:true,label:'BÊTA · fin du tracé disponible'};
  const prediction=clamp((Date.now()-loc.ts)/1000,0,1)*Math.max(0,((curSpeed()||{}).v||0))/3.6,target=clamp(snap.s+prediction,0,path.total-1),dt=clamp(T-lastT,0,.2);lastT=T;
  if(!smooth||smooth.id!==path.id||Math.abs(smooth.s-target)>30)smooth={id:path.id,s:target};else smooth.s+=(target-smooth.s)*Math.min(1,dt*7);
  return{path,s:smooth.s,band:m==='gpx',kind:m,label:m==='gpx'?'TRACÉ GPX · indépendant de l’itinéraire Waze':'ROUTE GPS · sans itinéraire · décor illustratif'};
 }
 function poly(c,pts,color){if(pts.some(p=>!p))return;c.fillStyle=color;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fill();}
 function stroke(c,pts,color,w){c.strokeStyle=color;c.lineWidth=w;c.lineJoin='round';c.lineCap='round';c.beginPath();let started=false;for(const p of pts){if(!p){started=false;continue}if(started)c.lineTo(p.x,p.y);else c.moveTo(p.x,p.y);started=true}c.stroke();}
 function badge(c,w,h,label,kind){c.setTransform(1,0,0,1,0,0);const ratio=Math.min(1.25,window.devicePixelRatio||1);c.scale(ratio,ratio);const fs=Math.max(10,Math.min(14,w/32));c.fillStyle=kind==='demo'?'#8a5219ed':'#18364be8';c.fillRect(4,h-48,w-8,23);c.fillStyle='#fff3db';c.font='600 '+fs+'px Inter,sans-serif';c.textAlign='center';c.fillText(label,w/2,h-32,w-16);c.setTransform(1,0,0,1,0,0);}
 function draw(cv,T,travel,speed){const state=sample(T),w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
  if(state.fallback){previousDraw(cv,T,travel,speed);const c=cv.getContext('2d');if(c)badge(c,w,h,state.label,'gps');return;}
  const ratio=Math.min(1.25,window.devicePixelRatio||1);if(cv.width!==Math.round(w*ratio)||cv.height!==Math.round(h*ratio)){cv.width=Math.round(w*ratio);cv.height=Math.round(h*ratio)}const c=cv.getContext('2d');if(!c)return;
  const W=960,H=420,hz=132,focal=470,eye=5.5,path=state.path,s=state.s,ego=path.pose(s),night=!!roadKind().night;
  c.setTransform(w*ratio/W,0,0,h*ratio/H,0,0);const sky=c.createLinearGradient(0,0,0,hz);sky.addColorStop(0,night?'#102137':'#76b1cf');sky.addColorStop(1,night?'#334a5b':'#d6e1dd');c.fillStyle=sky;c.fillRect(0,0,W,H);c.fillStyle=night?'#2c4334':'#85a36d';c.fillRect(0,hz,W,H-hz);
  const project=(p,height=0)=>{const dx=p.x-ego.x,dy=p.y-ego.y,z=dx*ego.hx+dy*ego.hy+10;if(z<3)return null;return{x:W*.5+(dx*ego.hy-dy*ego.hx)*focal/z,y:hz+(eye-height)*focal/z,z}};
  const offset=(v,k)=>{const p=path.pose(v);return{x:p.x+p.hy*k,y:p.y-p.hx*k}};
  for(let v=Math.min(path.total-1,s+170);v>s-6;v-=2){const a=Math.max(0,v-2),b=Math.min(path.total,v);poly(c,[project(offset(a,-5.4)),project(offset(a,1.8)),project(offset(b,1.8)),project(offset(b,-5.4))],night?'#27383d':'#707d78');if(state.band)poly(c,[project(offset(a,-.66)),project(offset(a,.66)),project(offset(b,.66)),project(offset(b,-.66))],night?'#7651cf':'#8255de');}
  for(const k of [-5.4,1.8]){const pts=[];for(let v=s-5;v<Math.min(path.total,s+160);v+=1.7)pts.push(project(offset(v,k)));stroke(c,pts,night?'#bbc6ad':'#e6ead8',2)}
  for(let v=Math.floor(s/9)*9;v<Math.min(path.total,s+140);v+=9)stroke(c,[project(offset(v,-1.8)),project(offset(v+3,-1.8))],night?'#c1ccb3':'#e8eddf',1.5);
  // Sparse, illustrative buildings. They are not a reconstruction of real façades.
  for(let v=Math.floor((s+160)/27)*27;v>s-10;v-=27)for(const side of [-1,1]){const p=path.pose(clamp(v,0,path.total)),base={x:p.x+p.hy*side*12,y:p.y-p.hx*side*12},foot=project(base);if(!foot||foot.z<5)continue;const id=Math.floor(v/27),height=8+(Math.abs(id)%4)*3,roof=project(base,height),width=5*focal/foot.z;if(!roof)continue;c.fillStyle=night?'#405463':'#a9b8b9';c.fillRect(foot.x-width/2,roof.y,width,foot.y-roof.y);c.fillStyle=night?'#1e3546':'#70909b';for(let row=1;row<4;row++)for(let col=0;col<2;col++){const ww=width*.17,yy=roof.y+(foot.y-roof.y)*row/5;c.fillRect(foot.x-width*.3+col*width*.4,yy,ww,(foot.y-roof.y)*.085)}}
  const car=cv.parentNode.querySelector('[data-car360]');if(car){car.style.left='50%';car.style.width=Math.min(w*.25,h*.6*503/300)+'px';car.style.height='auto';car.style.aspectRatio='503/300';car.style.bottom='4%';car.style.backgroundPosition='52.174% 0';}
  badge(c,w,h,state.label,state.kind);
 }
 function settings(p){return `<div style="font-size:15px;line-height:1.6;margin-bottom:14px">Bêta 1 séparée de la 7.26. La bande violette utilise la démo ou ton GPX. L’itinéraire de Waze n’est pas reçu par ce widget. Waze continue son propre guidage dans le cadre GPS.</div>`+setRow(p,'Vue conducteur', 'Le mode Route GPS dessine la route cartographiée, sans calculer d’itinéraire.',[['demo','Démo'],['gps','Route GPS'],['gpx','GPX local'],['classic','Décor 7.26']].map(([id,label])=>chipBtn(p,'beta727:mode:'+id,label,mode()===id)).join(''))+setRow(p,'Tester avec Waze','Le cadre et les permissions disponibles dépendent de ton autoradio.',chipBtn(p,'beta727:waze','Ouvrir Waze'))+`<div style="padding:12px 0"><b>Importer un tracé GPX local</b><p style="font-size:13px;color:${p.mut}">Fichier limité à 2 Mo / 10 000 points. Aucun envoi à un serveur.</p><input id="betaGPXFile" type="file" accept=".gpx,application/gpx+xml,text/xml"><textarea id="betaGPXText" placeholder="Ou colle ici le contenu XML du GPX" style="${fld(p,'width:100%;height:110px;margin-top:10px')}"></textarea>${chipBtn(p,'beta727:import','Charger le GPX')}${chipBtn(p,'beta727:clear','Retirer le GPX')}</div>`+setRow(p,'Revenir à la version habituelle','Garde la 7.26 installée. Désinstalle seulement « Accueil 2008 GT Bêta » si tu ne souhaites plus tester.',chipBtn(p,'beta727:stable','Ouvrir la version habituelle'));}
 function bind(){const f=$('betaGPXFile');if(f)f.onchange=()=>{const file=f.files&&f.files[0];if(!file)return;if(file.size>2000000){toast('GPX trop volumineux.');return}const reader=new FileReader();reader.onload=()=>{try{loadGPX(String(reader.result))}catch(e){toast(e.message)}};reader.readAsText(file)};}
 function loadGPX(xml){const pts=parseGPX(xml);store.set('beta727GPX',pts);gpxRaw=null;gpxCache=null;setMode('gpx');toast(pts.length+' points GPX chargés localement.');return pts.length;}
 function setMode(m){if(!['demo','gps','gpx','classic'].includes(m))throw Error('Mode inconnu');store.set('beta727Mode',m);smooth=null;dialog=false;store.set('beta727Intro',true);render();if(window.RoadLoop725)RoadLoop725.invalidate();}
 const nav=SETCATS.find(c=>c[0]==='Navigation');if(nav)nav[1].unshift(['Bêta · Vue conducteur',settings]);
 const oldRender=window.render;window.render=function(){const result=oldRender.apply(this,arguments);const screen=$('screen');if(screen){const old=screen.querySelector('[data-beta727-bar]');if(old)old.remove();screen.insertAdjacentHTML('beforeend',`<button data-beta727-bar data-act="beta727:open" style="position:absolute;left:10px;bottom:8px;z-index:3300;background:#a15d22;color:#fff7dd;border:1px solid #d8a261;border-radius:12px;padding:7px 12px;font-weight:700">BÊTA 1 · ${mode()==='demo'?'DÉMO':mode()==='gps'?'ROUTE GPS':mode()==='gpx'?'GPX':'CLASSIQUE'}</button>`);if(dialog)screen.insertAdjacentHTML('beforeend',`<div style="position:absolute;inset:0;z-index:4000;background:#0c1728ed;display:flex;align-items:center;justify-content:center;padding:25px"><div style="max-width:720px;color:#eef4ec;line-height:1.65"><h2>Accueil 2008 GT — Bêta 1</h2><p>Cette application est séparée de ta version habituelle et utilise ses propres réglages. Tu peux désinstaller uniquement la bêta pour revenir à la 7.26.</p><p>La démo est fictive. Le mode Route GPS utilise la route cartographiée. Le mode GPX utilise un fichier local. Le widget ne reçoit pas l’itinéraire de Waze.</p><div style="display:flex;gap:10px;flex-wrap:wrap">${chipBtn(palette(),'beta727:mode:demo','Essayer la démo',true)}${chipBtn(palette(),'beta727:mode:gps','Route GPS')}${chipBtn(palette(),'beta727:close','Fermer')}</div></div></div>`)}bind();return result;};
 const oldAct=window.act;window.act=function(action,long){if(!String(action).startsWith('beta727:'))return oldAct.apply(this,arguments);const op=action.split(':')[1],arg=action.split(':')[2];
  if(op==='mode'){setMode(arg);return}if(op==='close'){dialog=false;store.set('beta727Intro',true);render();return}if(op==='open'){dialog=false;store.set('beta727Intro',true);tab='settings';if(window.Settings720){Settings720.query='';Settings720.filter='';}const ci=SETCATS.findIndex(c=>c[0]==='Navigation');setCat=ci;setSub=0;render();return}
  if(op==='import'){try{loadGPX(($('betaGPXText')||{}).value||'')}catch(e){toast(e.message)}return}if(op==='clear'){store.set('beta727GPX',null);gpxRaw=null;gpxCache=null;setMode('gps');return}
  if(op==='stable'){if(A&&A.launch){if(!A.launch('fr.gtline.accueil2008'))toast('La version habituelle n’est pas installée.')}else toast('Ouvrirait la version habituelle.');return}
  if(op==='waze'){store.set('gbApp','com.waze');if(typeof gbLaunch==='function')gbLaunch(true,'essai bêta',true);else gpsOpen('com.waze');return}
 };
 store.set('welcome',false);document.title='Accueil 2008 GT Bêta 1';
 window.BetaRoad={VERSION,draw,mode,setMode,parseGPX,loadGPX,makePath,nearest,geoPath,sample,animate:()=>mode()==='demo'&&!dialog,get dialog(){return dialog;}};
 RoadDecor721.draw=draw;
})();
