/* Vue conducteur 7.28 : géométrie GPS et GPX local ; aucun itinéraire extrait de Waze. */
(()=>{'use strict';
 const VERSION='7.28',previousDraw=RoadDecor721.draw;
 let lastT=0,smooth=null,roadCache=null,gpxCache=null,gpxRaw=null,lastHeading=null;
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
 function parseGPX(xml){if(typeof xml!=='string'||xml.length>2000000||/<!DOCTYPE|<!ENTITY/i.test(xml))throw Error('Fichier GPX non accepté.');const doc=new DOMParser().parseFromString(xml,'application/xml');if(doc.getElementsByTagName('parsererror').length)throw Error('XML GPX invalide.');if(doc.getElementsByTagNameNS('*','trkseg').length>1||doc.getElementsByTagNameNS('*','rte').length>1)throw Error('Importer un tracé GPX continu (un seul segment).');let nodes=Array.from(doc.getElementsByTagNameNS('*','trkpt'));if(!nodes.length)nodes=Array.from(doc.getElementsByTagNameNS('*','rtept'));if(nodes.length>10000)throw Error('Maximum : 10 000 points GPX.');if(nodes.some(n=>!n.hasAttribute('lat')||!n.hasAttribute('lon')||!n.getAttribute('lat').trim()||!n.getAttribute('lon').trim()))throw Error('Coordonnées GPX manquantes.');const points=nodes.map(n=>({lat:Number(n.getAttribute('lat')),lon:Number(n.getAttribute('lon'))}));if(points.length<2||points.some(p=>!Number.isFinite(p.lat)||!Number.isFinite(p.lon)||Math.abs(p.lat)>85||Math.abs(p.lon)>180))throw Error('Points GPX invalides.');if(!geoPath(points,'test'))throw Error('Tracé trop court.');return points;}
 const demo=(()=>{let a=[];const add=(x,y)=>a.push({x:x*.6,y:y*.6});const line=(p,q)=>{for(let i=0;i<30;i++){const t=i/30;add(p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t)}};const bez=(p,q,r,s)=>{for(let i=0;i<60;i++){const t=i/60,u=1-t;add(u*u*u*p[0]+3*u*u*t*q[0]+3*u*t*t*r[0]+t*t*t*s[0],u*u*u*p[1]+3*u*u*t*q[1]+3*u*t*t*r[1]+t*t*t*s[1])}};
  line([0,0],[0,150]);bez([0,150],[0,190],[80,190],[80,230]);line([80,230],[80,250]);bez([80,250],[80,278],[108,284],[112.3,301.6]);for(let i=0;i<95;i++){const t=-Math.PI/8+(Math.PI*.875)*i/94;add(80+35*Math.cos(t),315+35*Math.sin(t))}bez([55.25,339.75],[35,319],[10,339],[-40,339]);line([-40,339],[-160,339]);add(-160,339);return makePath(a,'demo');})();
 function enabled(){return store.get('driver728On',true)!==false;}
 function mode(){return !enabled()?'classic':store.get('driver728Source','gps')==='gpx'?'gpx':'gps';}
 function bearing(){
  if(Number.isFinite(loc.brg)&&loc.brg>=0&&loc.brg<360){lastHeading={rad:loc.brg*Math.PI/180,at:Date.now(),lat:loc.lat,lon:loc.lon};return lastHeading.rad;}
  if(lastHeading&&Date.now()-lastHeading.at<30000&&hav(loc.lat,loc.lon,lastHeading.lat,lastHeading.lon)<.1)return lastHeading.rad;
  return null;
 }
 function connectedGeometry(match,heading){
  let points=match.geometry.slice();if(points.length<2)return null;
  const path=geoPath(points,'direction');if(!path)return null;const snap=nearest(path,path.project(loc));
  const reversed=snap.hx*Math.sin(heading)+snap.hy*Math.cos(heading)<0;
  if(reversed)points.reverse();
  const seen=new Set([match.id]),cache=Array.isArray(Road723.cache)?Road723.cache:[];
  const near=(a,b)=>hav(a.lat,a.lon,b.lat,b.lon)<.002;
  // Closed ways (including roundabouts) keep one extra lap available.
  if(near(points[0],points[points.length-1]))return points.concat(points.slice(1));
  for(let step=0;step<8&&points.length<10000;step++){
   const end=points[points.length-1],candidates=[];
   for(const way of cache){
    if(seen.has(way.id)||!Array.isArray(way.geometry)||way.geometry.length<2||!way.tags||!way.tags.highway)continue;
    let g=way.geometry;
    if(near(end,g[0])&&way.tags.oneway!=='-1')candidates.push({id:way.id,g});
    else if(near(end,g[g.length-1])&&!['yes','1'].includes(way.tags.oneway))candidates.push({id:way.id,g:g.slice().reverse()});
   }
   // At a fork we do not guess which exit Waze will take.
   if(candidates.length!==1)break;
   const candidate=candidates[0];seen.add(candidate.id);points.push(...candidate.g.slice(1));
   if(near(candidate.g[0],candidate.g[candidate.g.length-1]))break;
  }
  return points;
 }
 function selectGeometry(){
  if(!window.Road723||!Road723.fresh()||!Road723.match||Date.now()-Road723.at>30*60000)return null;
  const match=Road723.match;if(!Array.isArray(match.geometry))return null;
  const heading=bearing();if(heading===null)return null;
  const directionPath=geoPath(match.geometry,'orient');if(!directionPath)return null;
  const snap=nearest(directionPath,directionPath.project(loc));if(!snap)return null;
  const rev=snap.hx*Math.sin(heading)+snap.hy*Math.cos(heading)<0;
  const key=String(match.id)+'|'+Road723.at+'|'+rev;
  if(!roadCache||roadCache.key!==key){const points=connectedGeometry(match,heading),path=points&&geoPath(points,key);if(!path)return null;roadCache={key,path};}
  return roadCache.path;
 }
 function sample(T,preview=false){const m=preview?'demo':mode();if(m==='classic')return{fallback:true,label:''};
  if(m==='demo'){const s=8+((T*13.5)%Math.max(1,demo.total-32));return{path:demo,s,kind:'demo',band:true,label:'Aperçu fictif'};}
  if(!Place710.valid(loc)||!Number.isFinite(loc.ts)||Date.now()-loc.ts<0||Date.now()-loc.ts>5000||!Number.isFinite(loc.acc)||loc.acc<0||loc.acc>60)return{fallback:true,label:'GPS précis et récent nécessaire'};
  let path;if(m==='gps')path=selectGeometry();else{const raw=store.get('driver728GPX',null);if(raw!==gpxRaw){gpxRaw=raw;gpxCache=raw?geoPath(raw,'gpx'):null;}path=gpxCache;}
  if(!path)return{fallback:true,label:m==='gpx'?'importe un GPX dans les paramètres':'Route GPS indisponible ou cap inconnu'};
  const snap=nearest(path,path.project(loc));if(!snap||snap.distance>40)return{fallback:true,label:'hors du tracé, guidage Waze à consulter'};
  if(m==='gpx'&&Number.isFinite(loc.brg)&&loc.brg>=0&&((curSpeed()||{}).v||0)>5){const rad=loc.brg*Math.PI/180;if(snap.hx*Math.sin(rad)+snap.hy*Math.cos(rad)<-.35)return{fallback:true,label:'tracé GPX dans l’autre sens'};}
  if(path.total-snap.s<10)return{fallback:true,label:'fin du tracé disponible'};
  const prediction=clamp((Date.now()-loc.ts)/1000,0,1)*Math.max(0,((curSpeed()||{}).v||0))/3.6,target=clamp(snap.s+prediction,0,path.total-1),dt=clamp(T-lastT,0,.2);lastT=T;
  if(!smooth||smooth.id!==path.id||Math.abs(smooth.s-target)>30)smooth={id:path.id,s:target};else smooth.s+=(target-smooth.s)*Math.min(1,dt*7);
  return{path,s:smooth.s,band:m==='gpx',kind:m,label:m==='gpx'?'Tracé GPX local':'Route GPS'};
 }
 function polygon(c,pts,color){if(pts.some(p=>!p))return;c.fillStyle=color;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fill();}
 function stroke(c,pts,color,width){c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.beginPath();let started=false;for(const p of pts){if(!p){started=false;continue;}if(started)c.lineTo(p.x,p.y);else c.moveTo(p.x,p.y);started=true;}c.stroke();}
 const random=n=>{const v=Math.sin(n*127.13+7.7)*35873;return v-Math.floor(v);};
 function draw(cv,T,travel,speed){
  const preview=!!cv.closest('[data-driver728-preview]'),state=sample(T,preview),w=cv.clientWidth,h=cv.clientHeight;
  if(!w||!h)return;
  cv.dataset.driverFallback=state.fallback?'1':'0';
  if(state.fallback){previousDraw(cv,T,travel,speed);cv.dataset.driverStatus=state.label;return;}
  const ratio=Math.min(1.25,window.devicePixelRatio||1);if(cv.width!==Math.round(w*ratio)||cv.height!==Math.round(h*ratio)){cv.width=Math.round(w*ratio);cv.height=Math.round(h*ratio);}
  const c=cv.getContext('2d');if(!c)return;
  cv.dataset.driverStatus=state.kind==='gpx'?'Tracé GPX local, indépendant de Waze':'Route cartographiée, sans itinéraire Waze';
  const W=960,H=480,hz=165,focal=470,eye=5.5,path=state.path,s=state.s,ego=path.pose(s),kind=roadKind(),night=!!kind.night,scene=roadScene(),highway=scene==='autoroute';
  c.setTransform(w*ratio/W,0,0,h*ratio/H,0,0);
  const sky=c.createLinearGradient(0,0,0,hz);sky.addColorStop(0,night?'#0d1c30':'#79b5d2');sky.addColorStop(1,night?'#344458':'#d9e3dc');c.fillStyle=sky;c.fillRect(0,0,W,H);
  c.fillStyle=night?'#253c30':scene==='ville'?'#a4b2a4':'#83a36e';c.fillRect(0,hz,W,H-hz);
  const project=(p,height=0)=>{const dx=p.x-ego.x,dy=p.y-ego.y,z=dx*ego.hx+dy*ego.hy+10;if(z<3)return null;return{x:W*.5+(dx*ego.hy-dy*ego.hx)*focal/z,y:hz+(eye-height)*focal/z,z};};
  const offset=(v,k)=>{const p=path.pose(v);return{x:p.x+p.hy*k,y:p.y-p.hx*k};};
  const point=(v,k,height=0)=>project(offset(clamp(v,0,path.total),k),height),far=Math.min(path.total-.1,s+220),near=Math.max(0,s-6);
  const patch=(a,b,k0,k1,col)=>polygon(c,[point(a,k0),point(a,k1),point(b,k1),point(b,k0)],col);
  // Fields, pavements and carriageways use the same curved ground projection.
  if(scene==='campagne'||highway){for(let v=Math.floor(far/60)*60;v>=near-60;v-=60)for(const side of [-1,1]){
   const a=Math.max(near,v),b=Math.min(far,v+55);if(a>=b)continue;const stage=((Math.floor(v/60)+(side===1?1:0))%4+4)%4,k0=side*(highway?15:7),k1=side*50;
   patch(a,b,k0,k1,night?['#3b332c','#37482f','#3d5131','#4c5032'][stage]:['#9c7f58','#8b985b','#73914a','#b0a25a'][stage]);
   for(let j=0;j<18;j++){const k=k0+(k1-k0)*j/18;stroke(c,[point(a,k),point(b,k)],night?'#192b2244':'#6a593f77',.8);}
   if(stage>0)for(let z=a+3;z<b;z+=8)for(let j=0;j<12;j++){const k=k0+(k1-k0)*(j+.5)/12,p=point(z,k);if(!p||p.x<0||p.x>W)continue;const ph=(stage===1?.15:stage===2?.6:1.15)*focal/p.z;stroke(c,[p,{x:p.x,y:p.y-ph}],night?'#4e6b38':'#597f34',Math.max(.5,18/p.z));if(stage===3){c.fillStyle=night?'#b1a458':'#dfbd42';c.beginPath();c.arc(p.x,p.y-ph,Math.max(1,35/p.z),0,7);c.fill();}}
  }}
  if(scene==='ville'||scene==='village')for(let v=far;v>near;v-=3){const a=Math.max(near,v-3);patch(a,v,-8,-5.5,night?'#5a6968':'#c1c4b7');patch(a,v,1.9,4.5,night?'#5a6968':'#c1c4b7');}
  for(let v=far;v>near;v-=2){const a=Math.max(near,v-2);patch(a,v,-5.4,1.8,night?'#26313b':'#6d7b79');if(highway){patch(a,v,-13.2,-6.2,night?'#26313b':'#6d7b79');patch(a,v,-6.2,-5.4,night?'#3b4b38':'#8a9e74');}if(state.band)patch(a,v,-.6,.6,night?'#7452c6':'#8257dc');}
  const edges=highway?[-13.2,-6.2,-5.4,1.8]:[-5.4,1.8];
  for(const k of edges){const pts=[];for(let v=near;v<=far;v+=2)pts.push(point(v,k));stroke(c,pts,night?'#c1cdb7':'#e5ead7',1.7);}
  for(let v=Math.floor(near/9)*9;v<far-4;v+=9)for(const k of highway?[-9.7,-1.8]:[-1.8])stroke(c,[point(v,k),point(v+3,k)],night?'#c4cdb5':'#e8ebd9',1.4);
  if(highway)for(const k of [-13.6,-5.8,2.3]){const rail=[];for(let v=near;v<far;v+=3)rail.push(point(v,k,.7));stroke(c,rail,night?'#84959e':'#b9c7c5',2);for(let v=Math.floor(near/8)*8;v<far;v+=8)stroke(c,[point(v,k),point(v,k,.8)],'#82969a',1);}
  // Illustrative roadside scenery. Its locations are not actual buildings or hazards.
  for(let v=Math.floor(far/30)*30;v>near;v-=30)for(const side of [-1,1]){
   const id=Math.floor(v/30)*3+(side>0?1:0),k=side*(highway?18:scene==='ville'?11:9)+side*random(id)*3,foot=point(v,k);if(!foot||foot.z<7||foot.x< -120||foot.x>W+120)continue;
   const scale=focal/foot.z;
   if(scene==='foret'||scene==='campagne'||highway&&id%4!==0){
    c.fillStyle=night?'#74664c':'#80684b';c.fillRect(foot.x-.15*scale,foot.y-4*scale,.3*scale,4*scale);
    const height=(scene==='foret'?7:4)+random(id)*3,top=point(v,k,height);if(!top)continue;
    c.fillStyle=night?'#254735':'#548349';c.beginPath();c.ellipse(foot.x,top.y+height*scale*.35,2.2*scale,height*scale*.45,0,0,7);c.fill();
    if(scene==='foret'&&id%5===0){c.fillStyle=night?'#1e3b31':'#447448';polygon(c,[{x:foot.x,y:top.y-1.5*scale},{x:foot.x-2.4*scale,y:foot.y-scale},{x:foot.x+2.4*scale,y:foot.y-scale}],c.fillStyle);}
   }else{
    const floors=scene==='ville'?4+Math.abs(id%7):2,height=floors*2.9,roof=point(v,k,height);if(!roof)continue;const bw=(scene==='ville'?6:5)*scale;
    c.fillStyle=night?'#354957':id%2?'#c6c8b8':'#a9babc';c.fillRect(foot.x-bw/2,roof.y,bw,foot.y-roof.y);
    c.fillStyle=night?'#293c48':'#8d9fa3';polygon(c,[{x:foot.x+bw/2,y:roof.y},{x:foot.x+bw*.66,y:roof.y+scale},{x:foot.x+bw*.66,y:foot.y},{x:foot.x+bw/2,y:foot.y}],c.fillStyle);
    if(scene!=='ville')polygon(c,[{x:foot.x-bw*.58,y:roof.y},{x:foot.x,y:roof.y-2*scale},{x:foot.x+bw*.58,y:roof.y}],night?'#5c4843':'#ac6e53');
    for(let row=0;row<floors;row++)for(let col=0;col<3;col++){c.fillStyle=night&&random(id*20+row*3+col)>.6?'#eed396':night?'#192e3e':'#6f919e';c.fillRect(foot.x-bw*.39+col*bw*.28,roof.y+scale*(.7+row*2.8),bw*.15,1.2*scale);}
   }
   if((scene==='ville'||scene==='village')&&id%2===0){const k=side*(side>0?3.2:6.8),base=point(v,k),top=point(v,k,7);if(base&&top){stroke(c,[base,top,{x:top.x-side*scale,y:top.y}],night?'#82969e':'#849a9e',1.8);if(night){c.fillStyle='#ffe7a68a';c.beginPath();c.arc(top.x-side*scale,top.y,1.7*scale,0,7);c.fill();}}}
  }
  if(night){const g=c.createRadialGradient(W*.5,H*.68,5,W*.5,H*.68,165);g.addColorStop(0,'#fff0b92b');g.addColorStop(1,'#fff0b900');c.fillStyle=g;c.fillRect(W*.5-180,H*.33,360,H*.67);}
  if(/^(pluie|orage|neige)$/.test(kind.wx))for(let i=0;i<65;i++){const x=random(i+33)*W,y=((random(i+71)*H+T*(kind.wx==='neige'?13:180))%H);if(kind.wx==='neige'){c.fillStyle='#f2f3eaaa';c.beginPath();c.arc(x,y,1+random(i)*1.8,0,7);c.fill();}else stroke(c,[{x,y},{x:x-3,y:y+10+random(i)*7}],'#d4e6ef77',1);}
  // The lane around the ego position is 3.6 m wide at its contact point.
  const left=point(s,-1.8),right=point(s,1.8);
  RoadCar731.place(cv,(left.x+right.x)/(2*W),(left.y+right.y)/(2*H),(right.x-left.x)/W);
  c.setTransform(1,0,0,1,0,0);
 }
 function setEnabled(v){store.set('driver728On',!!v);smooth=null;RoadFX718.frames.clear();render();RoadLoop725.invalidate();}
 function setSource(v){if(!['gps','gpx'].includes(v))return;store.set('driver728Source',v);smooth=null;render();RoadLoop725.invalidate();}
 function loadGPX(xml){const points=parseGPX(xml);store.set('driver728GPX',points);gpxRaw=null;gpxCache=null;store.set('driver728On',true);setSource('gpx');toast(points.length+' points GPX chargés sur le poste.');return points.length;}
 function clearGPX(){store.set('driver728GPX',null);gpxRaw=null;gpxCache=null;setSource('gps');}
 window.Driver728={VERSION,enabled,mode,setEnabled,setSource,parseGPX,loadGPX,clearGPX,makePath,nearest,geoPath,connectedGeometry,sample,draw,preview:false};
 RoadDecor721.draw=draw;
})();
