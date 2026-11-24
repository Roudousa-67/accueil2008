/* Décors 7.26 : rendu local ; aucune destination ou limitation de démonstration. */
(()=>{ 'use strict'; const W=960,H=480,TOP=54,HZ=180,BOT=446;
let c,t,night,dusk,scene,ruralSeason='ete';
const mod=(x,n)=>((x%n)+n)%n;
let travelled=0, roadTravel=0;const distance=()=>travelled;
// 7.36 : les motifs réguliers (bâtiments, arbres, tirets, lampadaires) suivent la
// distance continue roadTravel ; seuls les éléments uniques suivent la boucle.
// shift() convertit une position continue en position dans la boucle courante.
const shift=()=>roadTravel-travelled;
const depthQ=z=>z< -28?0:50/(z+50);
const worldQ=z=>depthQ(z-distance());
const rnd=i=>{const n=Math.sin(i*13.71+4.9)*31753;return n-Math.floor(n)};
// 7.38 : quand il neige, les verts (herbe, haies, feuillages, collines) pâlissent vers le blanc.
// 7.40 : hors neige, les verts suivent la saison dans tous les décors (printemps, automne, hiver).
let snowNow738=false,season740='ete';const snowCache738=new Map();
const SEASON740={printemps:[[120,196,90],.25],automne:[[[214,120,40],[196,82,38],[226,168,60],[170,110,50],[205,140,55]],.55],hiver:[[150,140,120],.5]};
function seasonTint740(col){
 const def=SEASON740[season740];if(!def||typeof col!=='string'||col[0]!=='#'||(col.length!==7&&col.length!==9))return col;
 const key=season740+col;let out=snowCache738.get(key);if(out)return out;
 const r=parseInt(col.slice(1,3),16),g=parseInt(col.slice(3,5),16),b=parseInt(col.slice(5,7),16);
 if(g>r+20&&g>b+15){const to=Array.isArray(def[0][0])?def[0][(r*7+g*3+b)%def[0].length]:def[0],k=def[1];out='#'+[r,g,b].map((v,i)=>Math.round(v+(to[i]-v)*k).toString(16).padStart(2,'0')).join('')+col.slice(7);}else out=col;
 if(snowCache738.size>600)snowCache738.clear();snowCache738.set(key,out);return out;
}
function snowTint738(col){
 if(!snowNow738)return seasonTint740(col);
 if(typeof col!=='string'||col[0]!=='#'||(col.length!==7&&col.length!==9))return col;
 let out=snowCache738.get(col);if(out)return out;
 const r=parseInt(col.slice(1,3),16),g=parseInt(col.slice(3,5),16),b=parseInt(col.slice(5,7),16);
 if(g>r+12&&g>b+8){const k=night?.45:.62,to=night?[150,162,180]:[236,241,246],m=[r,g,b].map((v,i)=>Math.round(v+(to[i]-v)*k).toString(16).padStart(2,'0')).join('');out='#'+m+col.slice(7);}else out=col;
 if(snowCache738.size>600)snowCache738.clear();snowCache738.set(col,out);return out;
}
function rect(x,y,w,h,col){c.fillStyle=snowTint738(col);c.fillRect(x,y,w,h)}
function ellipse(x,y,rx,ry,col){c.fillStyle=snowTint738(col);c.beginPath();c.ellipse(x,y,Math.abs(rx),Math.abs(ry),0,0,7);c.fill()}
function line(points,col,width=1){c.strokeStyle=col;c.lineWidth=width;c.beginPath();for(let i=0;i<points.length;i++){const p=points[i];if(i)c.lineTo(p[0],p[1]);else c.moveTo(p[0],p[1]);}c.stroke()}
function poly(points,col){c.fillStyle=snowTint738(col);c.beginPath();for(let i=0;i<points.length;i++){const p=points[i];if(i)c.lineTo(p[0],p[1]);else c.moveTo(p[0],p[1]);}c.closePath();c.fill()}
// 7.36 : regroupement des petits éléments répétés (plants, herbes, fougères…) :
// un seul tracé par couleur et épaisseur au lieu d'un tracé par élément.
// Les éléments de même couleur d'un lot sont peints ensemble, dans l'ordre des couleurs.
const batch736=new Map();
// Enregistrement simple (0 = point de départ, 1 = segment, 2 = ellipse) rejoué d'un
// seul tracé : ne dépend pas de Path2D et évite closePath(), coûteux sur un long tracé.
function bEntry(key,col,width,fill){let b=batch736.get(key);if(!b){b={ops:[],col,width,fill};batch736.set(key,b);}return b.ops;}
function bLine(x0,y0,x1,y1,col,width){bEntry('s'+col+'|'+width,col,width,false).push(0,x0,y0,1,x1,y1);}
function bStroke(points,col,width){const o=bEntry('s'+col+'|'+width,col,width,false);for(let i=0;i<points.length;i++){const q=points[i];o.push(i?1:0,q[0],q[1]);}}
function bPoly(points,col){col=snowTint738(ruralSeasonColor(col));const o=bEntry('f'+col,col,0,true);for(let i=0;i<points.length;i++){const q=points[i];o.push(i?1:0,q[0],q[1]);}}
function bEllipse(x,y,rx,ry,col){col=snowTint738(ruralSeasonColor(col));bEntry('f'+col,col,0,true).push(2,x,y,Math.abs(rx),Math.abs(ry));}
function bFlush(){
 for(const b of batch736.values()){
  const o=b.ops;if(!o.length)continue;c.beginPath();
  for(let i=0;i<o.length;){const k=o[i];
   if(k===2){c.moveTo(o[i+1]+o[i+3],o[i+2]);c.ellipse(o[i+1],o[i+2],o[i+3],o[i+4],0,0,7);i+=5;}
   else{if(k)c.lineTo(o[i+1],o[i+2]);else c.moveTo(o[i+1],o[i+2]);i+=3;}}
  if(b.fill){c.fillStyle=b.col;c.fill();}else{c.strokeStyle=b.col;c.lineWidth=b.width;c.stroke();}
 }
 batch736.clear();
}
function txt(s,x,y,size=16,col='#fff',align='left'){c.fillStyle=col;c.font=`${size>=18?'bold ':''}${size}px Inter, sans-serif`;c.textAlign=align;c.textBaseline='alphabetic';c.fillText(s,x,y)}
let pScene=null,pSpread=225,pRural=false,ampAt=NaN,curveAmp=0,heightAmp=0,bendAmp=0,hillAmp=0;
function amps(){if(ampAt!==roadTravel){ampAt=roadTravel;curveAmp=105*Math.sin(roadTravel/180+.65);heightAmp=17*Math.sin(roadTravel/140+.65);bendAmp=72*Math.sin(roadTravel/240+.45);hillAmp=13*Math.sin(roadTravel/180+.6);}}
function P(q,k=0){if(scene!==pScene){pScene=scene;pSpread=scene==='autoroute'?300:(scene==='ville'||scene==='village')?260:225;pRural=scene==='campagne';}
 if(!pRural)return {x:W*.46+pSpread*q*k,y:HZ+(BOT-HZ)*q};
 return {x:W*.46+pSpread*q*k+ruralCurve(q),y:HZ+(BOT-HZ)*q-ruralRoadHeight(q)}}
function band(a,b,col){if(scene==='campagne'){const ps=[];for(let j=0;j<=48;j++){const p=P(j/48,a);ps.push([p.x,p.y]);}for(let j=48;j>=0;j--){const p=P(j/48,b);ps.push([p.x,p.y]);}poly(ps,col);return;}const p=P(0,a),q=P(1,a),r=P(1,b),s=P(0,b);poly([[p.x,p.y],[q.x,q.y],[r.x,r.y],[s.x,s.y]],col)}
function roadLine(k,col,w=2){if(scene==='campagne'){const ps=[];for(let j=0;j<=48;j++){const p=P(j/48,k);ps.push([p.x,p.y]);}line(ps,col,w);return;}const a=P(0,k),b=P(1,k);line([[a.x,a.y],[b.x,b.y]],col,w)}
function light(x,y,r,color){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#fff0');c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r)}
function tree(x,y,s,id,bush=false){rect(x-s*.035,y-s*.64,s*.07,s*.64,night?'#514638':'#755340');if(bush){ellipse(x,y-s*.17,s*.3,s*.2,night?'#263e31':'#5c884d');return}if(scene==='foret'&&id%2){for(let j=0;j<4;j++)poly([[x,y-s*(1.25-j*.2)],[x-s*(.18+j*.045),y-s*(.75-j*.2)],[x+s*(.18+j*.045),y-s*(.75-j*.2)]],night?['#15332e','#1c3c32'][j%2]:['#366448','#487956'][j%2]);}else{ellipse(x,y-s*.8,s*.32,s*.42,night?'#214238':'#548a55');ellipse(x-s*.1,y-s*.93,s*.2,s*.23,night?'#2e5040':'#77a25e')}}
function flag(x,y,s){rect(x,y-s,s*.018,s,'#c7d0d9');for(let k=0;k<3;k++)poly([[x+k*s*.13,y-s],[x+(k+1)*s*.13,y-s+Math.sin(t*3)*s*.035],[x+(k+1)*s*.13,y-s*.73],[x+k*s*.13,y-s*.75]],['#173a94','#fff','#e54245'][k])}
function person(x,y,s,id,child=false){
 const phase=t*4.2+id*1.7,step=Math.sin(phase)*s*.095,arm=Math.sin(phase+Math.PI)*s*.07;
 const skin=['#c99778','#a5795f','#d6b18e','#815d4e'][mod(id,4)],shirt=['#4a687e','#8c7466','#a97165','#74806a','#c09861','#687786'][mod(id,6)];
 ellipse(x+s*.055,y+s*.012,s*.145,s*.032,'#172b3326');
 c.save();c.lineCap='round';
 line([[x-s*.044,y-s*.35],[x-s*.05-step*.5,y-s*.17],[x-s*.07-step,y-s*.015]],'#38474e',s*.072);
 line([[x+s*.044,y-s*.35],[x+s*.05+step*.5,y-s*.17],[x+s*.065+step,y-s*.015]],'#46545a',s*.072);
 line([[x-s*.07-step,y-s*.014],[x-s*.12-step,y-s*.014]],'#27363c',s*.045);
 line([[x+s*.065+step,y-s*.014],[x+s*.12+step,y-s*.014]],'#27363c',s*.045);
 poly([[x-s*.095,y-s*.67],[x+s*.095,y-s*.67],[x+s*.079,y-s*.35],[x-s*.079,y-s*.35]],shirt);
 line([[x-s*.095,y-s*.64],[x-s*.12,y-s*.5],[x-s*.12+arm,y-s*.37]],shirt,s*.055);
 line([[x+s*.095,y-s*.64],[x+s*.12,y-s*.5],[x+s*.12-arm,y-s*.37]],shirt,s*.055);
 ellipse(x-s*.12+arm,y-s*.37,s*.025,s*.032,skin);ellipse(x+s*.12-arm,y-s*.37,s*.025,s*.032,skin);
 rect(x-s*.025,y-s*.73,s*.05,s*.08,skin);
 ellipse(x,y-s*.79,s*.072,s*.088,skin);
 ellipse(x,y-s*.845,s*.075,s*.047,['#4c4038','#8c765a','#393837'][mod(id,3)]);
 if(mod(id,4)===1){line([[x+s*.01,y-s*.65],[x+s*.07,y-s*.44]],'#3d4f55',s*.03);ellipse(x+s*.09,y-s*.5,s*.055,s*.09,'#514e47');}
 c.restore();
}
function animal(x,y,s,id,type){const body={cow:'#e4dfcd',sheep:'#e7e5da',pig:'#e5a3a0',hen:'#c99554',wolf:'#7e8c95',deer:'#ac8055',fawn:'#bb966d'}[type];const bob=Math.sin(t*2+id)*s*.008;
 if(type==='hen'){ellipse(x,y-s*.13,s*.12,s*.09,body);ellipse(x+s*.12,y-s*.23,s*.045,s*.05,body);poly([[x+s*.16,y-s*.24],[x+s*.22,y-s*.215],[x+s*.16,y-s*.2]],'#e7b14b');ellipse(x+s*.11,y-s*.285,s*.035,s*.025,'#bd3c36');line([[x-s*.04,y-s*.05],[x-s*.06,y]],'#dba64a',s*.016);line([[x+s*.04,y-s*.05],[x+s*.06,y]],'#dba64a',s*.016);return}
 for(const a of [-.18,.13])line([[x+s*a,y-s*.23],[x+s*(a+.03*Math.sin(t*3+id)),y+bob]],night?'#756d60':body,s*.048);
 ellipse(x,y-s*.3,s*.28,s*.15,body);
 if(type==='cow'){ellipse(x-s*.09,y-s*.33,s*.08,s*.075,'#464b48');ellipse(x+s*.12,y-s*.29,s*.07,s*.1,'#58544c')}
 if(type==='sheep')for(let i=0;i<7;i++)ellipse(x+s*(i*.075-.22),y-s*.36,s*.073,s*.083,'#eeeade');
 const neck=type==='deer'||type==='fawn';if(neck)line([[x+s*.19,y-s*.34],[x+s*.29,y-s*.62]],body,s*.1);
 ellipse(x+s*(neck?.31:.29),y-s*(neck?.66:.36),s*.11,s*.09,body);
 if(type==='pig'){ellipse(x+s*.39,y-s*.35,s*.065,s*.052,'#c77e83');ellipse(x+s*.405,y-s*.36,s*.008,s*.01,'#6f4950')}
 if(type==='wolf')poly([[x+s*.25,y-s*.44],[x+s*.27,y-s*.58],[x+s*.33,y-s*.44]],body);
 if(type==='deer'){for(const sg of [-1,1])line([[x+s*.3,y-s*.72],[x+s*(.3+sg*.08),y-s*.94],[x+s*(.3+sg*.17),y-s*.99]],'#796751',s*.025)}
 if(type==='fawn')for(let j=0;j<5;j++)ellipse(x+s*(rnd(j)*.35-.18),y-s*(.27+rnd(j+9)*.1),s*.012,s*.012,'#e8d7b4');
 ellipse(x+s*(neck?.355:.345),y-s*(neck?.68:.39),s*.012,s*.012,'#1d2929');line([[x-s*.26,y-s*.33],[x-s*.4,y-s*.4]],body,s*.03)
}
function fence(x,y,s){for(let j=-3;j<=3;j++)rect(x+j*s*.18,y-s*.19,s*.018,s*.21,night?'#6c7065':'#a39072');line([[x-s*.56,y-s*.15],[x+s*.56,y-s*.15]],night?'#6c7065':'#a39072',s*.025);line([[x-s*.56,y-s*.06],[x+s*.56,y-s*.06]],night?'#6c7065':'#a39072',s*.025)}
function building(x,y,s,id,type){const bw=s*(type==='mall'?1.1:.83),bh=s*(type==='house'?.53:type==='mall'?.6:type==='tower'?1.3:.7);const col=night?['#354657','#414d5b','#3c4657'][mod(id,3)]:(scene==='village'?['#dbcdb5','#e1d9c6','#c1c7b6','#cbbca4','#b9c4bf','#d3c8b7'][mod(id,6)]:['#d6c7ac','#adc0cb','#bdc2bf'][mod(id,3)]);
 poly([[x-bw*.5,y-bh],[x+bw*.5,y-bh],[x+bw*.64,y-bh+s*.1],[x+bw*.64,y],[x+bw*.5,y]],night?'#283745':'#8f9eaa');rect(x-bw*.5,y-bh,bw,bh,col);
 if(['house','farm'].includes(type))poly([[x-bw*.57,y-bh],[x,y-bh-s*(scene==='village'?[.25,.33,.40][mod(id,3)]:.33)],[x+bw*.57,y-bh]],night?'#503e44':'#a85b48');else rect(x-bw*.53,y-bh-s*.04,bw*1.07,s*.055,night?'#23313e':'#657d91');
 const cols=type==='mall'?6:3,rows=type==='tower'?5:2;
 for(let row=0;row<rows;row++)for(let j=0;j<cols;j++){const lit=night&&scene==='ville'&&rnd(id*51+row*3+j)>.47;rect(x-bw*.4+j*bw*.29*(3/cols),y-bh+s*.1+row*(bh*.65/rows),bw*(type==='mall'?.11:.17),bh*(type==='tower'?.09:.16),lit?'#f8d68a':night?'#182b3c':'#668b9f');if(lit&&s>90)light(x-bw*.32+j*bw*.29*(3/cols),y-bh+s*.13+row*(bh*.65/rows),s*.1,'#ffe5a515')}
 rect(x-s*.07,y-s*.24,s*.14,s*.24,night?'#1a2b38':'#536a76');
 if(type==='mall'||type==='school'||type==='town'){rect(x-bw*.46,y-bh*.84,bw*.92,s*.15,type==='mall'?'#427b9b':type==='school'?'#658857':'#7b8890');txt(type==='mall'?'CENTRE COMMERCIAL':type==='school'?'ÉCOLE':'MAIRIE',x,y-bh*.84+s*.11,Math.max(5,s*(type==='mall'?.072:.1)),'#fff','center');if(type==='town')flag(x+bw*.34,y-bh-s*.04,s*.4)}
 if(type==='farm'){rect(x-s*.15,y-s*.25,s*.3,s*.25,'#774f3f');txt('FERME',x,y-bh+s*.23,Math.max(6,s*.1),'#fff','center')}
}
function park(x,y,s,id){ellipse(x,y-s*.02,s*.68,s*.12,night?'#244b37':'#78a765');fence(x,y,s*1.15);const slide=x-s*.28;line([[slide,y-s*.1],[slide,y-s*.62],[slide+s*.2,y-s*.62]],'#d99d49',s*.045);line([[slide+s*.19,y-s*.62],[slide+s*.43,y-s*.1]],'#cf6966',s*.085);for(let j=0;j<4;j++)line([[slide-s*.08,y-s*.15-j*s*.11],[slide,y-s*.15-j*s*.11]],'#d9b169',s*.025);
 const sw=x+s*.3;line([[sw-s*.16,y],[sw-s*.1,y-s*.65],[sw+s*.33,y-s*.65],[sw+s*.4,y]],'#7796af',s*.035);const dx=Math.sin(t*2+id)*s*.12;line([[sw+s*.1,y-s*.65],[sw+s*.1+dx,y-s*.23]],'#bbbcac',s*.018);rect(sw+s*.04+dx,y-s*.24,s*.15,s*.035,'#c98e54');person(sw+s*.11+dx,y-s*.22,s*.25,id,true);person(x-s*.52+Math.sin(t)*s*.1,y-s*.05,s*.32,id+2,true)
}
function lamp(x,y,s,sg){line([[x,y],[x,y-s],[x-sg*s*.18,y-s]],night?'#66798b':'#71818b',Math.max(1,s*.025));rect(x-sg*s*.19-s*.055,y-s,s*.11,s*.035,night?'#ffe5a2':'#c7d0d7');if(night){const a=x-sg*s*.19;poly([[a-s*.04,y-s*.98],[a+s*.04,y-s*.98],[a+s*.35,y],[a-s*.35,y]],'#ffe7a80c');light(a,y-s*.98,s*.2,'#ffe5a53b');ellipse(a,y,s*.4,s*.07,'#ffe6ae20')}}
function traffic(x,y,s,sg=1){
 // The lens faces the approaching driver, toward the lower edge of the image.
 line([[x,y],[x,y-s*.87],[x-sg*s*.15,y-s*.87]],'#71828e',Math.max(.7,s*.026));
 const xx=x-sg*s*.15;
 poly([[xx-s*.07,y-s*.98],[xx+s*.07,y-s*.98],[xx+s*.09,y-s*.6],[xx-s*.09,y-s*.6]],'#202d37');
 const state=Math.floor((t+2)/2)%3;
 for(let j=0;j<3;j++){const yy=y-s*(.91-j*.105);rect(xx-s*.057,yy-s*.046,s*.114,s*.027,'#101b24');const col=j===state?['#fa514a','#f5c54d','#65d49b'][j]:'#414b53';ellipse(xx,yy,s*.038,s*.032,col);if(night&&j===state)light(xx,yy,s*.13,col+'30')}
}
function townSign(q,name){const p=P(q,1.55),w=270*q,h=58*q,y=p.y-104*q;for(const a of [-.32,.32])line([[p.x+a*w,p.y],[p.x+a*w,y+h]],'#abb7bf',Math.max(1,3*q));rect(p.x-w/2,y,w,h,'#f6f4e8');c.strokeStyle='#bd383a';c.lineWidth=Math.max(1,3*q);c.strokeRect(p.x-w*.48,y+3*q,w*.96,h-6*q);txt(name,p.x,y+37*q,Math.max(5,24*q),'#1d2c35','center')}
// 7.40 : panneau de sortie barré de rouge quand on quitte un village ou une ville
// (le décor passe de ville / village à campagne ou forêt) : il passe à côté de la voiture.
function townSignExit740(q,name){townSign(q,name);const p=P(q,1.55),w=270*q,h=58*q,y=p.y-104*q;line([[p.x-w*.46,y+h*.88],[p.x+w*.46,y+h*.12]],'#c0392b',Math.max(1.5,7*q));}
const exit740={name:'',scene:'',S:0,shownAt:{},last:''};
function townExit740(currentScene,main){
 const town=currentScene==='ville'||currentScene==='village';
 if(town){if(panelName){exit740.last=panelName;exit740.scene=currentScene;if(main)townEnter741(panelName);}return;}
 if(main&&exit740.last&&currentScene!=='autoroute'){
  const name=exit740.last;exit740.last='';
  if(!(Date.now()-(exit740.shownAt[name]||0)<300000)){exit740.shownAt[name]=Date.now();exit740.name=name;exit740.S=roadTravel+90;townLeave741(name);}
 }
 if(!exit740.name||currentScene==='autoroute')return;
 const z=exit740.S-roadTravel;if(z<-25){exit740.name='';return;}
 const q=depthQ(z);if(q>=.1&&q<=1.6)townSignExit740(q,exit740.name);
}
window.TownExit740=exit740;
function worldSigns(){const items=[];
 if(scene==='ville'||scene==='village')items.push({z:55,type:'town',name:scene==='ville'?'STRASBOURG':'VILLAGE EXEMPLE'});
 const data=scene==='ville'?[[65,50],[135,40],[205,30]]:scene==='village'?[[68,50],[195,30]]:scene==='autoroute'?[[75,110],[205,110]]:[[75,80],[195,80]];
 for(const [z,val]of data)items.push({z,val,type:'speed'});
 for(const it of items.sort((a,b)=>b.z-a.z)){const q=worldQ(it.z);if(q<.07||q>1.8)continue;if(it.type==='town')townSign(q,it.name);else{const p=P(q,1.3);sign(p.x,p.y,150*q,it.val,it.val===30)}}
}
function sign(x,y,s,val,zone=false){line([[x,y],[x,y-s*.85]],'#9aadb9',s*.026);if(zone){rect(x-s*.25,y-s*1.14,s*.5,s*.67,'#edf0ed');c.strokeStyle='#333';c.lineWidth=s*.012;c.strokeRect(x-s*.25,y-s*1.14,s*.5,s*.67);txt('ZONE',x,y-s*1.025,s*.105,'#18232b','center')}
 const cy=y-s*(zone?.79:.9),r=s*(zone?.18:.24);ellipse(x,cy,r,r,'#f8f8ee');c.strokeStyle='#c63d3f';c.lineWidth=r*.16;c.stroke();txt(String(val),x,cy+r*.34,r*1.02,'#172632','center')}
function tractor(x,y,s){rect(x-s*.3,y-s*.29,s*.46,s*.22,'#638b40');rect(x-s*.18,y-s*.58,s*.28,s*.3,'#4f7940');rect(x-s*.14,y-s*.54,s*.2,s*.2,'#89b4bd');rect(x+s*.16,y-s*.43,s*.026,s*.26,'#36464a');for(const [dx,rr] of [[-.22,.16],[.22,.11]]){ellipse(x+s*dx,y-s*rr,s*rr,s*rr,'#273137');ellipse(x+s*dx,y-s*rr,s*rr*.48,s*rr*.48,'#c8b688')}}
function crops(x,y,s,id){const stage=mod(id,4);for(let row=0;row<3;row++)for(let j=0;j<8;j++){const xx=x+(j-3.5)*s*.105+row*s*.025,yy=y-row*s*.065,h=s*[.04,.16,.31,.43][stage];line([[xx,yy],[xx,yy-h]],night?'#5b7141':'#57823f',s*.014);if(stage>0){line([[xx,yy-h*.4],[xx-s*.055,yy-h*.68]],'#6d944e',s*.018);line([[xx,yy-h*.6],[xx+s*.055,yy-h*.84]],'#6d944e',s*.018)}if(stage===3){if(id%2){ellipse(xx,yy-h,s*.045,s*.054,'#e7bc45');ellipse(xx,yy-h,s*.023,s*.031,'#725937')}else ellipse(xx+s*.025,yy-h*.6,s*.02,s*.07,'#d5ba63')}}}
function farmPlot(x,y,s,id){building(x,y-s*.13,s*.8,id,'farm');fence(x,y,s*1.2);const types=['cow','sheep','pig','hen'];for(let j=0;j<4;j++)animal(x+(j-1.5)*s*.31,y+s*.09,s*(j===3?.45:.55),id+j,types[j])}
function scenery(q,id,sg){const edge=scene==='autoroute'?1.28:1.34,p=P(q,sg*edge),s=q*220,x=p.x+sg*s*.62,y=p.y;
 if(scene==='ville'){const type=['town','tower','park','mall','school','house'][((id%6)+6)%6];if(type==='park')park(x,y,s,id);else building(x,y,s,id,type);if(id%2===0)person(p.x,y,s*.36,id);if(id%3===1)traffic(p.x-sg*s*.12,y,s*.88,sg);if(id%2)lamp(p.x+sg*s*.15,y,s*.95,sg);}
 if(scene==='village'){const type=((id%6)+6)%6;if(type===0)building(x,y,s,id,'town');else if(type===2)farmPlot(x+sg*s*.2,y,s,id);else if(type===4)tree(x,y,s,id);else building(x,y,s*.85,id,'house');if(id%2===0)tree(x+sg*s*.63,y,s*.52,id,true);if(id%3===0)lamp(p.x+sg*s*.18,y,s,sg)}
 if(scene==='campagne'){const kind=((id%6)+6)%6;poly([[x-s*.7,y],[x+s*.7,y],[x+s*.55,y-s*.21],[x-s*.5,y-s*.21]],night?'#364630':kind<4?'#b29c58':'#689251');if(kind<4)crops(x,y,s,id);else{fence(x,y,s);for(let j=0;j<3;j++)animal(x+(j-1)*s*.4,y,s*.6,id+j,kind===4?'cow':'sheep')}if(kind===3)tractor(x,y-s*.04,s*.8);if(kind===5)farmPlot(x+sg*s*.5,y-s*.07,s*.6,id);}
 if(scene==='foret'){tree(x+sg*s*.35,y,s*1.5,id);if(id%3===0){const kinds=['wolf','deer','fawn','deer'];animal(p.x+sg*s*.24,y,s*.6,id,kinds[((Math.floor(id/3)%4)+4)%4])}if(id%4===2)poly([[x-s*.35,y],[x-s*.3,y-s*.3],[x,y-s*.4],[x+s*.33,y]],night?'#3e5058':'#87958e');}
 if(scene==='autoroute'){if(id%4===1)farmPlot(x+sg*s*.7,y,s*.65,id);else crops(x+sg*s*.2,y,s,id);if(id%3===0)tree(x+sg*s,y,s*.85,id)}
}
function drawRoad(){
 band(-1.06,1.06,villageWet()?(night?'#233039':'#596f73'):(night?'#1e2a33':'#65716f'));
 if(scene==='autoroute'){band(-.09,.09,night?'#333f3a':'#829075');roadLine(-1.06,'#c2c6b7',2);roadLine(1.06,'#c2c6b7',2)}else{roadLine(-1,'#c9d2c2',2);roadLine(1,'#c9d2c2',2)}
 if(scene==='ville'||scene==='village'){band(-1.29,-1.055,night?'#46515c':'#abb2af');band(1.055,1.29,night?'#46515c':'#abb2af');roadLine(-1.055,'#c4c9c4',3);roadLine(1.055,'#c4c9c4',3)}
 const ks=scene==='autoroute'?[-.57,.57]:[0];
 const d=distance(),D=roadTravel,first=Math.floor((D-35)/12);
 for(let n=first;n<first+40;n++){const z=n*12-D;if(z<-28||z>430)continue;const q=depthQ(z),q2=depthQ(z+5);for(const k of ks){const a=P(q,k),b=P(q2,k),w=q*1.5;poly([[a.x-w,a.y],[a.x+w,a.y],[b.x+q2*1.5,b.y],[b.x-q2*1.5,b.y]],night?'#c6cba9':'#f0eee0')}}
 if(scene==='ville'){const z=122-d;if(z>-32&&z<420){const q=depthQ(z),q2=depthQ(z+10),a=P(q,-4),b=P(q,4),aa=P(q2,-4),bb=P(q2,4);poly([[a.x,a.y],[b.x,b.y],[bb.x,bb.y],[aa.x,aa.y]],night?'#29343d':'#75827d')}}
 if(scene==='village'||scene==='ville'){const z=112-d;if(z>-32&&z<430){const q=depthQ(z),q2=depthQ(z+3);for(let j=-5;j<=5;j++){const k=j*.155,a=P(q,k),b=P(q,k+.09),aa=P(q2,k),bb=P(q2,k+.09);poly([[a.x,a.y],[b.x,b.y],[bb.x,bb.y],[aa.x,aa.y]],night?'#c6cab7':'#ecece1')}}}
}
function oncoming(q,lane,id){const p=P(q,lane),s=88*q;if(p.y>H+90)return;ellipse(p.x,p.y,s*.52,s*.1,'#0003');for(const sg of [-1,1])rect(p.x+sg*s*.37-s*.035,p.y-s*.3,s*.07,s*.23,'#19252e');const col=['#9caebc','#ab625b','#718aa6'][mod(id,3)];poly([[p.x-s*.48,p.y-s*.08],[p.x-s*.45,p.y-s*.47],[p.x-s*.28,p.y-s*.69],[p.x+s*.28,p.y-s*.69],[p.x+s*.45,p.y-s*.47],[p.x+s*.48,p.y-s*.08]],col);poly([[p.x-s*.3,p.y-s*.61],[p.x+s*.3,p.y-s*.61],[p.x+s*.36,p.y-s*.42],[p.x-s*.36,p.y-s*.42]],'#263e50');rect(p.x-s*.24,p.y-s*.19,s*.48,s*.065,'#344453');for(const sg of [-1,1]){rect(p.x+sg*s*.34-s*.085,p.y-s*.3,s*.17,s*.055,night?'#fff4bd':'#d8e7e1');if(night)light(p.x+sg*s*.34,p.y-s*.28,s*.2,'#ffefb33a')}rect(p.x-s*.12,p.y-s*.095,s*.24,s*.04,'#c7cfcd')}
function barriers(){if(scene!=='autoroute')return;
 const d=distance();for(const k of [-1.12,-.09,.09,1.12]){const pts=[];for(let j=0;j<30;j++){const q=j/29,p=P(q,k);pts.push([p.x,p.y-q*20])}line(pts,night?'#8a9aa2':'#b7c3c6',3);for(let n=Math.floor((d-30)/9);n<Math.floor((d-30)/9)+50;n++){const z=n*9-d;if(z<-25||z>400)continue;const q=depthQ(z),p=P(q,k);line([[p.x,p.y],[p.x,p.y-q*20]],night?'#6a7a84':'#879da5',Math.max(.6,q*3))}}
 const trafficDistance=d*2.25;const cars=[];for(let n=0;n<12;n++){const z=60+n*80-trafficDistance;if(z>-32&&z<420)cars.push({q:depthQ(z),lane:n%2?-.34:-.82,id:n})}cars.sort((a,b)=>a.q-b.q);for(const car of cars)oncoming(car.q,car.lane,car.id);
}
function gantry(){if(scene!=='autoroute')return;const q=worldQ(150);if(q<.05||q>1.8)return;
 const a=P(q,.09),b=P(q,1.14),top=HZ-170*q,bottom=HZ-72*q;
 // A half-width gantry over our carriageway only, with a median support.
 line([[a.x,a.y],[a.x,bottom],[b.x,bottom],[b.x,b.y]],night?'#788d9b':'#9faeb8',Math.max(1,5*q));
 const bx=a.x+8*q,bw=b.x-a.x-16*q,bh=86*q;rect(bx,top,bw,bh,'#1e5b9f');c.strokeStyle='#d4e3e9';c.lineWidth=Math.max(1,2*q);c.strokeRect(bx+3*q,top+3*q,bw-6*q,bh-6*q);txt('STRASBOURG',bx+bw*.5,top+25*q,Math.max(5,23*q),'#fff','center');txt('SORTIE 6 · ILLKIRCH',bx+bw*.5,top+49*q,Math.max(5,17*q),'#fff','center');txt('2 km',bx+bw*.5,top+72*q,Math.max(5,20*q),'#fff','center');
}
// V3: shared ground projection, large cultivated plots, stable scatter and roadside signs.
function ruralHeight(z,k){
 if(scene!=='campagne'||Math.abs(k)<1.4||(k>0&&z<125))return 0;
 return 6*Math.sin(z*.022+k*.5)*Math.min(1,(Math.abs(k)-1.4)*.5);
}
function fieldPoint(z,k){const q=depthQ(z-distance()),p=P(q,k);p.y-=ruralHeight(z,k)*q;return p;}
function groundPatch(z0,z1,k0,k1,col){if(scene==='campagne'){if(z1<=distance()-20)return;z0=Math.max(z0,distance()-20);}if(scene==='campagne'){poly(ruralPatchPoints(z0,z1,k0,k1).map(p=>[p.x,p.y]),col);return;}const a=fieldPoint(z0,k0),b=fieldPoint(z0,k1),d=fieldPoint(z1,k0),e=fieldPoint(z1,k1);poly([[a.x,a.y],[b.x,b.y],[e.x,e.y],[d.x,d.y]],col)}
function grazingAnimal(x,y,s,id,cow){
 c.save();c.translate(x,y);c.scale(id%2?-1:1,1);
 ellipse(s*.13,s*.012,s*.38,s*.037,'#3d4e343d');
 const dip=(Math.sin(t*.65+id)+Math.sin(t*.21+id)*.5)*s*.013,body=cow?['#e4e2d4','#c7a87d','#ece6d5'][id%3]:['#e4dfcd','#d7d0ba','#eee9da'][id%3];
 for(const [xx,yy]of [[-.19,-.13],[.13,-.13],[-.12,-.10],[.20,-.10]]){
  line([[s*xx,s*yy],[s*(xx+.015),-s*.025]],cow?'#b4b6a4':'#918c74',s*.035);
  rect(s*(xx-.017),-s*.028,s*.042,s*.027,'#4d5146');
 }
 ellipse(0,-s*.23,s*.29,s*.15,body);ellipse(0,-s*.17,s*.25,s*.045,cow?'#c8cbbb':'#d1cbb5');
 if(cow){ellipse(-s*.10,-s*.25,s*.075,s*.10,'#4f554b');ellipse(s*.14,-s*.22,s*.065,s*.075,'#596052');}
 else for(let j=0;j<9;j++)ellipse((j%5-2)*s*.095,-s*(.23+Math.floor(j/5)*.095),s*.075,s*.065,'#efead9');
 const yy=-s*.15+dip;
 line([[s*.21,-s*.24],[s*.30,yy]],body,s*.11);
 ellipse(s*.31,yy,s*.09,s*.09,cow?'#d7d8c8':'#9d9a85');
 ellipse(s*.35,yy+s*.052,s*.07,s*.042,cow?'#b8afa0':'#777b6b');
 ellipse(s*.25,yy-s*.06,s*.06,s*.018,body);ellipse(s*.38,yy-s*.06,s*.05,s*.018,body);
 ellipse(s*.35,yy-s*.018,s*.009,s*.009,'#343c32');
 line([[-s*.27,-s*.25],[-s*.34,-s*.13+Math.sin(t+id)*s*.015]],body,s*.018);
 c.restore();
}
function countrysideFields(){
 const plots=[
  {a:-15,b:42,sg:-1,type:'pastureCow',out:7.6,id:0},
  {a:54,b:109,sg:-1,type:'pastureSheep',out:7.2,id:8},
  {a:-10,b:71,sg:1,type:'sunflower',out:7.0,id:1},
  {a:123,b:180,sg:-1,type:'wheat',out:6.1,id:2},
  {a:83,b:154,sg:1,type:'young',out:7.7,id:3},
  {a:195,b:277,sg:-1,type:'corn',out:7.2,id:4},
  {a:171,b:274,sg:1,type:'meadow',out:6.3,id:5},
  {a:283,b:420,sg:-1,type:'sunflower',out:8.4,id:6},
  {a:289,b:432,sg:1,type:'mid',out:8.0,id:7}
 ];
 for(const plot of plots.slice().reverse()){
  const {a,b,sg,type,out,id}=plot,near=Math.max(a,distance()-20),far=b;
  if(far<=near)continue;
  const pts=ruralFieldBoundary(near,far,sg,out,id);
  const colors={plough:'#9a8061',young:'#aca276',mid:'#839761',corn:'#759154',sunflower:'#91a366',wheat:'#b9aa72',meadow:'#88a274',pastureCow:'#8aa16a',pastureSheep:'#91a973'};
  poly(pts.map(v=>[v.x,v.y]),night?'#3b5035':colors[type]);
  c.save();c.beginPath();pts.forEach((v,i)=>i?c.lineTo(v.x,v.y):c.moveTo(v.x,v.y));c.closePath();c.clip();
  if(type==='plough'||type==='young'||type==='mid'){
   for(let j=0;j<33;j++){
    const k=sg*(1.25+(out-1.25)*j/32),p0=fieldPoint(near,k),p1=fieldPoint(far,k);
    line([[p0.x,p0.y],[p1.x,p1.y]],type==='plough'?'#6c543d77':'#74674766',Math.max(.6,worldQ(near)*1.5));
   }
  }
  if(type!=='plough'&&type!=='meadow'&&!type.startsWith('pasture'))for(let z=Math.ceil(near/5.8)*5.8;z<far;z+=5.8){
   const q=worldQ(z);if(q<.075)continue;
   for(let j=0;j<43;j++){
    const k=sg*(1.28+(out-1.28)*(j+.45)/43),pp=fieldPoint(z+(rnd(j+id*41)-.5)*1.6,k+(rnd(j+id*29)-.5)*.035+sg*.11*Math.sin(z*.034+id)),h=(ruralSeason==='hiver'?.15:ruralSeason==='printemps'?.55:ruralSeason==='automne'?.7:1)*(type==='young'?5:type==='mid'?18:type==='corn'?33:type==='sunflower'?31:22)*(1+(rnd(id*107+j)*.18-.09))*q;
    if(pp.x< -30||pp.x>W+30)continue;
    const sway=Math.sin(t*1.15+j*.8)*h*.06;
    if(type==='wheat'){
     for(let stalk=0;stalk<3;stalk++){const xx=pp.x+(stalk-1)*2.3*q;
      bLine(xx,pp.y,xx+sway,pp.y-h,night?'#887c4d':'#a08c50',Math.max(.5,q*.8));
      for(let leaf=0;leaf<3;leaf++)bLine(xx+sway-q*2,pp.y-h+leaf*2*q,xx+sway+q*2,pp.y-h+leaf*2*q+2*q,'#d0bd81',Math.max(.6,q));
     }
    }else{
     bLine(pp.x,pp.y,pp.x+sway,pp.y-h,night?'#527541':'#4d773b',Math.max(.6,q*1.25));
     if(type==='young'){
      bLine(pp.x,pp.y-2*q,pp.x-3*q,pp.y-5*q,'#6c8f46',Math.max(.7,q));bLine(pp.x,pp.y-2*q,pp.x+3*q,pp.y-4*q,'#6c8f46',Math.max(.7,q));
     }else for(const side of [-1,1])bPoly([[pp.x,pp.y-h*.35],[pp.x+side*h*.3,pp.y-h*.60],[pp.x+side*h*.12,pp.y-h*.52],[pp.x+sway,pp.y-h*.65]],night?'#496940':'#68944d');
     if(type==='sunflower'&&ruralSeason==='ete'){
      bEllipse(pp.x+sway,pp.y-h,4.2*q,4.8*q,night?'#b4a15e':'#ddbd55');bEllipse(pp.x+sway,pp.y-h,2.3*q,2.8*q,'#716044');
     }
     if(type==='corn'&&ruralSeason!=='hiver')bEllipse(pp.x+2*q,pp.y-h*.62,1.7*q,5*q,'#c3b56f');
    }
   }
   bFlush();
  }
  if(type==='meadow'||type.startsWith('pasture'))for(let j=0;j<65;j++){
   const z=near+rnd(j+id)*Math.max(1,far-near),k=sg*(1.4+rnd(j+74)*(out-1.7)),pp=fieldPoint(z,k),q=worldQ(z);
   bLine(pp.x,pp.y,pp.x+q,pp.y-3*q,'#70904d',Math.round(Math.max(.5,q)*4)/4);
  }
  bFlush();
  c.restore();
  if(type.startsWith('pasture')){
   const cattle=type==='pastureCow';
   const animals=cattle?[[12,-1.92,1],[25,-2.3,2],[37,-2.8,3]]:[[61,-2.15,4],[72,-3.75,5],[84,-2.85,6],[96,-4.45,7]];
   const objects=[];
   function fenceRun(z0,k0,z1,k1,count,gate=false){
    for(let j=0;j<=count;j++){
     if(gate&&j>=1&&j<=2)continue;
     const u=j/count,z=z0+(z1-z0)*u,k=k0+(k1-k0)*u;
     objects.push({z,draw:()=>{const pp=fieldPoint(z,k),q=worldQ(z);rect(pp.x-1.5*q,pp.y-21*q,3*q,22*q,night?'#655e4b':'#8c7757');}});
     if(j<count&&!(gate&&j<=2)){
      const v=(j+1)/count,zz=z0+(z1-z0)*v,kk=k0+(k1-k0)*v;
      objects.push({z:(z+zz)/2,draw:()=>{for(const h of [9,16]){const p=blockPoint(z,k,h),r=blockPoint(zz,kk,h);line([p,r],night?'#667268':'#8c9680',Math.max(.6,worldQ(z)*.7));}}});
     }
    }
   }
   fenceRun(a,sg*1.36,b,sg*1.51,9,true);
   fenceRun(a,sg*1.36,a,sg*(out-.12),10);
   fenceRun(b,sg*1.51,b,sg*(out-1),9);
   for(const [z,k,id]of animals){
    objects.push({z,draw:()=>{const pp=fieldPoint(z,k),q=worldQ(z);grazingAnimal(pp.x,pp.y,85*q,id,cattle);}});
   }
   objects.sort((x,y)=>y.z-x.z);for(const o of objects)o.draw();
   // A farm gate and drinking trough stay inside the enclosure.
   const zz=a+(b-a)*.18,kk=sg*1.43;
   for(const h of [6,13,20])line([blockPoint(zz,kk,h),blockPoint(zz+(b-a)*.12,kk,h)],'#9da79b',Math.max(.7,worldQ(zz)));
   const tr=fieldPoint(a+18,sg*1.82),tq=worldQ(a+18);
   rect(tr.x-9*tq,tr.y-7*tq,18*tq,7*tq,'#727b71');ellipse(tr.x,tr.y-7*tq,9*tq,2*tq,'#a6bfc0');
  }
  // Every field is bordered by a grassy strip and a narrow farm access.
  groundPatch(b,b+5,sg*1.25,sg*(out-.8),night?'#35503a':'#65894f');
  groundPatch(b+5,b+10,sg*1.14,sg*(out-.4),night?'#787760':'#bbb08b');
  for(let j=0;j<8;j++){
   if(j===0||j===1)continue;
   const kk=sg*(1.2+j*(out-1.9)/8),pp=fieldPoint(b+2,kk),q=worldQ(b+2);
   tree(pp.x,pp.y,(20+rnd(j+id)*8)*q,id+j,true);
  }
  if(type==='plough'){
   const z=94+((t*1.6)%29),pp=fieldPoint(z,-2.0),q=worldQ(z);
   groundPatch(79,z,-1.82,-2.18,'#745a40');
   tractor(pp.x,pp.y,100*q);
  }
 }
}
function ruralFarmWorld(){
 if(scene!=='campagne'||distance()>140)return;
 const gp=(z,k)=>{const p=fieldPoint(z,k);return[p.x,p.y]};
 // Separate the farm court from the crops and connect it to the carriageway.
 groundPatch(33,119,1.55,6.4,night?'#545749':'#b7ad91');
 poly([[31,1.03],[51,1.03],[64,2.30],[88,2.35],[88,3.0],[56,3.06]].map(v=>gp(...v)),night?'#626758':'#c3baa2');
 
 for(const side of [-1,1]){
  const a=[[40,1.12],[46,1.55],[54,2.08],[64,2.55],[85,2.67]].map(([z,k])=>gp(z,k+side*.10));
  line(a,'#8e866d88',2.3);
 }
 for(let j=0;j<65;j++){
  const z=57+rnd(j+780)*28,k=2.55+(rnd(j+71)-.5)*.08,pp=fieldPoint(z,k),q=worldQ(z);
  line([[pp.x,pp.y],[pp.x+q,pp.y-2*q]],'#7e8a56',Math.max(.45,q*.7));
 }
 for(let j=0;j<55;j++){
  const z=36+rnd(j+490)*75,k=1.52+(rnd(j+18)-.5)*.11,pp=fieldPoint(z,k),q=worldQ(z);
  line([[pp.x,pp.y],[pp.x-q,pp.y-(3+rnd(j)*3)*q]],'#7c8c53',Math.max(.4,q*.7));
  if(j%6===0)ellipse(pp.x,pp.y-4*q,q,q,'#d4c78c');
 }
 
 for(let j=0;j<75;j++){
  const z=37+rnd(j+6)*77,k=1.65+rnd(j+100)*4.6,p=fieldPoint(z,k),q=worldQ(z);
  ellipse(p.x,p.y,1.4*q,.5*q,night?'#797e6944':'#8b826266');
 }
 const cp=fieldPoint(40,1.21),cq=worldQ(40);
 rect(cp.x-12*cq,cp.y-5*cq,24*cq,8*cq,'#9da28e');ellipse(cp.x,cp.y,7*cq,3*cq,'#596d59');
 line([[cp.x-14*cq,cp.y-6*cq],[cp.x+14*cq,cp.y-6*cq]],'#c3c4aa',Math.max(.7,cq*2));
 // A worked field behind the farm, with long furrows.
 groundPatch(133,230,1.5,7.6,night?'#4f4838':'#9e805d');
 for(let j=0;j<32;j++){const k=1.5+j*.19;line([gp(133,k),gp(230,k)],'#70573d',Math.max(.5,worldQ(133)));}
 const zt=153+(t*1.0)%23,kt=2.52,p=fieldPoint(zt,kt),q=worldQ(zt);
 groundPatch(137,zt,kt-.17,kt+.17,'#6d5038');
 // Charrue: hitch, steel frame and individual blades behind the tractor.
 const pl=fieldPoint(zt-8,kt);line([[p.x,p.y],[pl.x,pl.y]],'#6c6f68',3*q);
 line([[pl.x-17*q,pl.y-4*q],[pl.x+17*q,pl.y-4*q]],'#8d4e3a',4*q);
 for(let j=-2;j<=2;j++)poly([[pl.x+j*7*q,pl.y-4*q],[pl.x+(j*7-4)*q,pl.y+3*q],[pl.x+(j*7+3)*q,pl.y+4*q]],'#a7aaa1');
 tractor(p.x,p.y,145*q);
 if(!night)for(let j=0;j<5;j++){const u=(t*.35+j*.21)%1;ellipse(pl.x+(j-2)*6*q,pl.y-u*12*q,(5+u*8)*q,(2+u*4)*q,'#bea57a28');}
 // Draw structures and workers in depth order.
 const items=[];
 const add=(z,k,fn)=>items.push({z,fn:()=>{const p=fieldPoint(z,k);fn(p.x,p.y,worldQ(z));}});
 add(108,3.02,(x,y,q)=>ruralBarn(x,y,190*q,false));
 add(83,4.15,(x,y,q)=>ruralBarn(x,y,240*q,true));
 add(94,2.03,(x,y,q)=>{person(x,y,67*q,21);ruralFork(x+8*q,y,48*q);});
 add(51,2.10,(x,y,q)=>ruralDigger(x,y,72*q));
 add(65,3.48,(x,y,q)=>{person(x,y,65*q,24);rect(x+9*q,y-26*q,10*q,12*q,'#777c70');});
 add(74,3.22,(x,y,q)=>ruralEquipment(x,y,q));
 add(62,3.15,(x,y,q)=>ruralBales(x,y,70*q));
 add(99,4.9,(x,y,q)=>{rect(x-12*q,y-33*q,24*q,33*q,'#818b83');ellipse(x,y-33*q,12*q,4*q,'#a0aaa0');line([[x,y-33*q],[x,y-48*q]],'#707b75',3*q);});
 add(45,1.58,(x,y,q)=>{rect(x-2*q,y-31*q,4*q,32*q,'#8b7656');for(const h of [9,22])line([[x,y-h*q],[x+36*q,y-(h+2)*q]],'#a49878',2*q);});
 add(80,1.60,(x,y,q)=>{tree(x,y,77*q,4);});
 items.sort((a,b)=>b.z-a.z);for(const it of items)it.fn();
 // Field boundaries: sparse hedges, a shallow ditch and scattered trees.
 for(const sg of [-1,1]){
  if(sg<0){line([gp(8,-1.18),gp(285,-1.18)],'#5e7950',3);line([gp(8,-1.24),gp(285,-1.24)],'#9aaa78',1);}
  for(let j=0;j<6;j++){const z=245+j*34,k=sg*(2.3+(j%3)*.68),p=fieldPoint(z,k);tree(p.x,p.y,(50+rnd(j)*25)*worldQ(z),j+40,true);}
 }
 // Bales in the harvested parcel, away from the road and animals.
 for(const [z,k]of [[141,-2.0],[155,-3.1],[171,-2.6]]){const p=fieldPoint(z,k);ruralBales(p.x,p.y,58*worldQ(z));}
 // Distant stock gives scale to the rolling pasture.
 for(const [z,k]of [[510,-7.2],[548,-8.5],[580,-8.0]]){const p=fieldPoint(z,k);grazingAnimal(p.x,p.y,69*worldQ(z),Math.round(z),true);}
 // A few birds touch down in the worked field.
 for(let j=0;j<4;j++){const p=fieldPoint(188+j*9,3.7+j*.45),q=worldQ(188+j*9);ellipse(p.x,p.y-3*q,3*q,1.7*q,'#424b3d');line([[p.x,p.y],[p.x+q,p.y-2*q]],'#5a604c',q);}
}
function ruralBales(x,y,s){
 rect(x-s*.38,y-s*.24,s*.63,s*.23,'#b6a16b');ellipse(x+s*.26,y-s*.13,s*.13,s*.13,'#cebb80');
 c.strokeStyle='#ac965e';c.lineWidth=Math.max(.6,s*.012);for(const r of [.09,.055,.022]){c.beginPath();c.ellipse(x+s*.26,y-s*.13,s*r,s*r,0,0,7);c.stroke();}
 line([[x-s*.25,y-s*.23],[x-s*.25,y]],'#8b8157',Math.max(.6,s*.012));
}
function ruralBarn(x,y,s,open){
 const w=s*1.24,h=s*.34,d=s*.30;
 poly([[x-s*.55,y],[x+s*.68,y],[x+s*1.10,y+s*.10],[x-s*.12,y+s*.10]],'#36452b38');
 poly([[x-w*.5,y],[x+w*.5,y],[x+w*.5,y-h],[x-w*.5,y-h]],open?'#a9a596':'#d0c4a5');
 poly([[x+w*.5,y],[x+w*.5+d,y-d*.35],[x+w*.5+d,y-h-d*.35],[x+w*.5,y-h]],'#8f9586');

 // Plaster grain, lower stone course and damp marks follow the wall faces.
 for(let j=0;j<100;j++){
  const xx=x-w*.49+rnd(j+73)*w*.97, yy=y-h+rnd(j+184)*h;
  rect(xx,yy,s*(.004+rnd(j+13)*.01),s*.004,j%2?'#625f4620':'#f4ecce30');
 }
 for(let row=0;row<2;row++)for(let j=0;j<12;j++){
  const xx=x-w*.5+(j+(row%2)*.5)*w/12;
  rect(xx,y-s*.025*(row+1),w/12-s*.006,s*.022,['#9d9e87','#aaa58e','#b2ab95'][j%3]);
 }
 const ridge=y-h-s*.13;
 poly([[x-w*.57,y-h],[x,ridge],[x+w*.56,y-h]],'#8b6653');
 poly([[x,ridge],[x+d,ridge-d*.35],[x+w*.5+d,y-h-d*.35],[x+w*.56,y-h]],open?'#7e8985':'#9c7760');
 for(let j=0;j<12;j++)line([[x+(j/12)*w*.52,y-h-j/12*s*.13],[x+d+(j/12)*w*.52,y-h-j/12*s*.13-d*.35]],'#c4c4b06b',Math.max(.45,s*.003));

 // Small tile joints on the clay roof; standing seams on the hangar roof.
 const roofA=[x-w*.57,y-h],roofB=[x,ridge],roofC=[x+w*.56,y-h];
 c.save();c.beginPath();c.moveTo(...roofA);c.lineTo(...roofB);c.lineTo(...roofC);c.closePath();c.clip();
 for(let row=0;row<7;row++){
  const yy=y-h-s*.13+row*s*.022;
  line([[x-w*.6,yy],[x+w*.6,yy]],open?'#aa9e8b55':'#c99b7877',Math.max(.5,s*.005));
  for(let j=0;j<24;j++){const xx=x-w*.6+(j+(row%2)*.5)*s*.052;line([[xx,yy],[xx-s*.005,yy+s*.022]],'#493f354b',Math.max(.4,s*.004));}
 }
 c.restore();
 if(open){
  rect(x-w*.43,y-h*.91,w*.86,h*.91,'#303d34');
  const shade=c.createLinearGradient(0,y-h,0,y);shade.addColorStop(0,'#14291e99');shade.addColorStop(1,'#73795b22');rect(x-w*.42,y-h*.88,w*.84,h*.88,shade);
  poly([[x-w*.43,y],[x+w*.43,y],[x+w*.25,y-h*.26],[x-w*.24,y-h*.26]],'#7d7b64');
  for(const xx of [-.43,0,.43]){rect(x+w*xx-s*.012,y-h*.94,s*.024,h*.94,'#b1aa92');}
  line([[x-w*.43,y-h*.85],[x,y-h*.38],[x+w*.43,y-h*.85]],'#8c8e79',s*.014);
  ruralBales(x-w*.25,y-h*.06,s*.31);ruralBales(x-w*.25,y-h*.23,s*.28);
  tractor(x+w*.24,y-h*.07,s*.41);
  rect(x+w*.08,y-h*.47,s*.23,s*.03,'#b3a586');
  for(let j=0;j<3;j++){rect(x+w*.12+j*s*.055,y-h*.65,s*.045,h*.17,['#8e7954','#748172','#a1906d'][j]);}
  line([[x-w*.40,y-h*.85],[x-w*.40,y]],'#d4c3a2',s*.009);
  line([[x+w*.40,y-h*.85],[x+w*.40,y]],'#d4c3a2',s*.009);
  rect(x-w*.38,y-h*.97,w*.76,s*.025,'#b4a482');
 }else{
  rect(x-w*.2,y-h*.02,w*.4,-h*.69,'#7b6b52');
  for(let j=0;j<7;j++)line([[x-w*.2+j*w*.4/7,y],[x-w*.2+j*w*.4/7,y-h*.71]],'#9a8766',s*.006);
  line([[x-w*.18,y-h*.65],[x+w*.18,y-h*.07]],'#c2aa7d',s*.013);
  rect(x-w*.37,y-h*.77,w*.13,h*.18,'#667c79');rect(x+w*.25,y-h*.77,w*.13,h*.18,'#667c79');
 }
 line([[x-w*.55,y-h],[x+w*.56,y-h]],'#626c64',s*.016);
 line([[x+w*.52,y-h],[x+w*.52,y]],'#7a8174',s*.013);
 line([[x+w*.52,y],[x+w*.57,y]],'#7a8174',s*.013);
 rect(x-w*.44,y-h*.87,s*.033,s*.035,'#b6b7a6');
 for(let j=0;j<6;j++)line([[x-w*.45+j*s*.15,y-s*.01],[x-w*.43+j*s*.15,y-s*(.03+rnd(j)*.03)]],'#69754a',s*.006);
 for(let j=0;j<7;j++)line([[x+w*.5+d*j/7,y-d*.35*j/7],[x+w*.5+d*j/7,y-h-d*.35*j/7]],'#c4c6b34d',s*.004);
}
function ruralFork(x,y,s){line([[x,y],[x+s*.08,y-s]],'#8a7051',Math.max(.7,s*.025));for(let j=0;j<3;j++)line([[x+(j-1)*s*.07,y],[x+(j-1)*s*.07,y+s*.15]],'#808c85',Math.max(.7,s*.018));}
function ruralDigger(x,y,s){
 const cycle=(t*.30)%1;
 const bend=cycle<.35?cycle/.35:cycle<.7?1-(cycle-.35)/.35:0;
 const lift=cycle>.35&&cycle<.83?Math.sin((cycle-.35)/.48*Math.PI):0;
 ellipse(x+s*.16,y+s*.014,s*.32,s*.035,'#39452d38');
 const hip=[x-s*.025,y-s*.31],shoulder=[x+s*(.02+bend*.17),y-s*(.61-bend*.16)];
 line([hip,[x-s*.13,y-s*.17],[x-s*.16,y]],'#4d5960',s*.07);
 line([hip,[x+s*.09,y-s*.16],[x+s*.14,y]],'#58666b',s*.07);
 line([hip,shoulder],'#8b8460',s*.19);
 const hx=shoulder[0]+s*.02,hy=shoulder[1]-s*.10;
 ellipse(hx,hy,s*.068,s*.078,'#c79c7b');ellipse(hx,hy-s*.055,s*.09,s*.025,'#9a8866');
 const tip=[x+s*(.36+lift*.22),y-s*(.01+lift*.36)];
 const handle=[tip[0]-s*.20,tip[1]-s*.43];
 line([handle,tip],'#9c8059',s*.024);
 for(const u of [.35,.66]){
  const hand=[handle[0]+(tip[0]-handle[0])*u,handle[1]+(tip[1]-handle[1])*u];
  line([shoulder,[hand[0]-s*.06,hand[1]+s*.04],hand],'#8b8460',s*.048);ellipse(hand[0],hand[1],s*.024,s*.024,'#c79c7b');
 }
 poly([[tip[0]-s*.055,tip[1]-s*.04],[tip[0]+s*.05,tip[1]-s*.04],[tip[0]+s*.04,tip[1]+s*.04],[tip[0],tip[1]+s*.07],[tip[0]-s*.045,tip[1]+s*.04]],'#77837b');
 if(cycle>.40&&cycle<.66)ellipse(tip[0],tip[1]-s*.025,s*.052,s*.023,'#846646');
 if(cycle>.66&&cycle<.82)for(let j=0;j<4;j++){const fall=(cycle-.66)/.16;ellipse(tip[0]+s*(.04+j*.02),tip[1]+s*(fall*.28+j*.012),s*.012,s*.008,'#846646');}
 ellipse(x+s*.52,y+s*.014,s*.13,s*.026,'#826c4d');ellipse(x+s*.34,y+s*.02,s*.07,s*.018,'#62553f');
}

function countrysideBackdrop(){
 if(scene!=='campagne')return;
 poly([[0,HZ+12],[0,HZ-18],[90,HZ-33],[180,HZ-29],[300,HZ-12],[450,HZ-18],[550,HZ-31],[690,HZ-38],[820,HZ-23],[960,HZ-31],[960,HZ+20]],night?'#34473e':'#a8b7a0');
 poly([[0,HZ+19],[0,HZ-3],[115,HZ-19],[230,HZ-3],[390,HZ+3],[520,HZ-10],[640,HZ-24],[770,HZ-6],[870,HZ-13],[960,HZ],[960,HZ+23]],night?'#3a5141':'#95aa86');
 poly([[0,HZ+25],[0,HZ+6],[160,HZ-3],[290,HZ+8],[430,HZ+5],[550,HZ+1],[730,HZ-8],[860,HZ+7],[960,HZ+4],[960,HZ+28]],night?'#405a40':'#7d9d6b');
 for(let j=0;j<42;j++){
  const x=j*24+rnd(j+87)*16;if(Math.abs(x-W*.46)<27)continue;
  const y=HZ+10+Math.sin(j*.31)*5,ss=8+rnd(j)*17;
  if(j%3===0){rect(x,y-ss*.55,ss*.05,ss*.55,'#7b8267');ellipse(x,y-ss*.52,ss*.45,ss*.29,'#73936a');ellipse(x-ss*.25,y-ss*.67,ss*.26,ss*.24,'#829f72');}
  else tree(x,y,ss,j);
 }
 for(const [x,y,ss]of [[115,HZ+4,22],[801,HZ+8,18]]){
  rect(x,y-ss*.25,ss,ss*.25,'#b1b49b');poly([[x-ss*.06,y-ss*.25],[x+ss*.4,y-ss*.44],[x+ss*1.07,y-ss*.25]],'#8a8f7a');
 }
}
function landFields(){
 if(scene==='campagne'){countrysideFields();return;}
 const d=distance(),size=100,start=Math.floor((d-38)/size);
 for(let n=start+5;n>=start;n--)for(const sg of [-1,1]){
  const z0=n*size+32,z1=z0+size-7;if(z1-d< -30)continue;const near=Math.max(z0,d-26),far=z1;
  const id=n+(sg>0?2:0),stage=mod(id,4),corn=mod(id,3)!==1;
  const k0=sg*1.38,k1=sg*6.2;
  const colors=night?['#3a332b','#37402c','#2c4530','#3c4b2d']:['#9b7d56','#9d9468','#778d4e','#a6a263'];
  groundPatch(near,far,k0,k1,colors[stage]);
  // Continuous furrows on the ground, running along the parcel rather than floating tiles.
  for(let j=0;j<28;j++){const k=k0+(k1-k0)*j/28,a=fieldPoint(near,k),b=fieldPoint(far,k);line([[a.x,a.y],[b.x,b.y]],night?'#201f1c55':'#6e583e80',Math.max(.6,depthQ(near-d)*1.8))}
  // A green uncultivated strip separates neighboring plots.
  groundPatch(far,far+5,k0,k1,night?'#243e2e':'#5f8552');
  if(stage>0){for(let z=Math.ceil(near/5.8)*5.8;z<far;z+=5.8){const q=depthQ(z-d);if(q<.1)continue;for(let j=0;j<25;j++){
   const k=k0+(k1-k0)*(j+.5)/25,p=fieldPoint(z,k);if(p.x< -30||p.x>W+30||p.y>BOT+50)continue;const h=q*[0,9,23,37][stage];
   line([[p.x,p.y],[p.x,p.y-h]],night?'#48603d':'#456b35',Math.max(.5,q*1.5));
   if(stage>=2){for(const side of [-1,1])poly([[p.x,p.y-h*.36],[p.x+side*h*.32,p.y-h*.67],[p.x+side*h*.12,p.y-h*.55],[p.x,p.y-h*.62]],night?'#3c5836':'#658d43')}
   if(stage===3){if(corn){ellipse(p.x+h*.1,p.y-h*.6,q*2.2,q*6,night?'#9a914f':'#d4b964');line([[p.x,p.y-h],[p.x-q*3,p.y-h-q*5],[p.x,p.y-h-q*2],[p.x+q*3,p.y-h-q*5]],night?'#9b965c':'#cebf7b',q*.7)}else{ellipse(p.x,p.y-h,q*5.8,q*6.4,night?'#b8a357':'#e7be4a');ellipse(p.x,p.y-h,q*3.1,q*3.6,night?'#564e30':'#66512f')}}
  }}}
  // One tractor works a bare plot; the tractor, plough and fresh furrow share ground coordinates.
  if(stage===0&&mod(id,2)===0){const travel=mod(t*2.7+id*7,52),zz=z0+18+travel,q=worldQ(zz);if(q>.12&&q<1.4){const k=sg*1.92,p=fieldPoint(zz,k),s=100*q;
   groundPatch(Math.max(near,z0+8),zz,sg*1.77,sg*2.07,night?'#29231f':'#69503b');
   tractor(p.x,p.y,s);const attach=fieldPoint(zz-5,k);line([[p.x-s*.25,p.y-s*.1],[attach.x-s*.42,attach.y-s*.08]],'#606e65',Math.max(1,s*.035));
   for(let j=0;j<4;j++){const xx=attach.x-s*(.28+j*.12),yy=attach.y+j*s*.025;poly([[xx,yy-s*.09],[xx+s*.1,yy-s*.08],[xx+s*.07,yy+s*.02],[xx-s*.035,yy+s*.06]],'#b6b6a0');ellipse(xx,yy+s*.04,s*.065,s*.025,night?'#3c3024':'#846244')}
  }}
 }
}
const basicTree=tree;
tree=function(x,y,s,id,bush=false){
 if(bush){for(let j=0;j<5;j++)ellipse(x+s*(j-2)*.1,y-s*(.12+rnd(id+j)*.04),s*.15,s*.14,night?'#294c36':['#5c7f46','#6d914e','#557a43'][mod(j,3)]);return}
 rect(x-s*.027,y-s*.73,s*.054,s*.73,night?'#514a3b':'#796349');
 if(scene==='foret'&&mod(id,3)===0){basicTree(x,y,s,id|1,false);return}
 for(let j=0;j<7;j++){const xx=x+(rnd(id*9+j)-.5)*s*.43,yy=y-s*(.63+rnd(id*7+j)*.45);ellipse(xx,yy,s*(.19+rnd(id+j)*.07),s*(.22+rnd(id+j+8)*.08),night?['#234233','#2b4937','#344f3a'][mod(j,3)]:['#557b46','#6b8f50','#7b9a58','#5c8548'][mod(j,4)])}
};
const villageStillTree=tree;
tree=function(x,y,s,id,bush=false){
 if(scene!=='village')return villageStillTree(x,y,s,id,bush);
 const bend=(Math.sin(t*1.25+id*.91)*.028+Math.sin(t*.51+id*2.1)*.014)*(bush?.58:1);
 c.save();c.transform(1,0,bend,1,-bend*y,0);
 villageStillTree(x,y,s,id,bush);c.restore();
};
const simpleBuilding=building;
building=function(x,y,s,id,type){
 // Grounded paving and gardens, larger eaves, shutters and facade articulation.
 if(scene==='village'){ellipse(x,y-s*.015,s*.62,s*.08,night?'#284230':'#78945d');line([[x,y],[x,y+s*.07]],night?'#5d6260':'#c3b99e',s*.17)}
 if(scene==='village'){
  ellipse(x+s*.15,y+s*.018,s*.62,s*.075,night?'#10222130':'#243c3134');
  poly([[x-s*.36,y],[x+s*.42,y],[x+s*.65,y+s*.08],[x-s*.10,y+s*.08]],'#203c2920');
 }else ellipse(x+s*.14,y+s*.015,s*.56,s*.065,'#10222126');simpleBuilding(x,y,s,id,type);
 const bw=s*(type==='mall'?1.1:.83),bh=s*(type==='house'?.53:type==='mall'?.6:type==='tower'?1.3:.7);
 line([[x-bw*.5,y],[x+bw*.5,y]],night?'#273541':'#87918c',Math.max(.5,s*.018));
 if(scene==='village'&&(type==='house'||type==='farm')){
  if(mod(id,3)===0){
   for(let row=0;row<7;row++)for(let col=0;col<2;col++){
    const xx=x-bw*.49+col*bw*.10+(row%2)*bw*.025,yy=y-bh+s*.04+row*bh*.12;
    rect(xx,yy,bw*.08,bh*.065,night?'#7b7c6b':['#baac94','#b0aa94','#c5bda8'][mod(row+id,3)]);
   }
  }
  line([[x-bw*.49,y-s*.04],[x+bw*.49,y-s*.04]],night?'#7a8170':'#b5b6a0',Math.max(.7,s*.022));
 }
 if(type==='house'||type==='farm'){
  line([[x-bw*.57,y-bh],[x,y-bh-s*(scene==='village'?[.25,.33,.40][mod(id,3)]:.33)],[x+bw*.57,y-bh]],night?'#644c49':'#c28167',Math.max(1,s*.024));
  for(let j=0;j<6;j++){const yy=y-bh-s*.28+j*s*.042,ratio=(j+1)/7;line([[x-bw*.48*ratio,yy],[x+bw*.48*ratio,yy]],night?'#684c4a55':'#773e3450',Math.max(.6,s*.007))}
  rect(x+bw*.23,y-bh-s*.23,s*.065,s*.18,night?'#66504a':'#a17d65');
  for(let col=0;col<3;col++){const wx=x-bw*.4+col*bw*.29;for(const sign of [-1,1])rect(wx+(sign<0?-bw*.055:bw*.18),y-bh+s*.1,bw*.045,bh*.16,night?'#3f514a':['#657a66','#6d8589','#897568'][mod(id,3)])}
  rect(x-s*.065,y-s*.22,s*.13,s*.22,night?'#29383b':'#82705b');ellipse(x+s*.03,y-s*.11,s*.008,s*.008,'#c8b58a');
  if(scene==='village'){tree(x-s*.57,y,s*.3,id,true);tree(x+s*.59,y,s*.36,id+2,true);fence(x,y+s*.035,s*.8)}
 }else if(type==='tower'){
  for(let j=1;j<5;j++)line([[x-bw*.49,y-bh+bh*j/5],[x+bw*.49,y-bh+bh*j/5]],night?'#57627266':'#d5d9d0',Math.max(.5,s*.008));
  for(let j=0;j<3;j++){const xx=x-bw*.4+j*bw*.29;line([[xx-s*.015,y-s*.15],[xx+bw*.19,y-s*.15]],night?'#6c7880':'#536f80',s*.014)}
 }else if(type==='mall'){
  rect(x-bw*.48,y-s*.23,bw*.96,s*.19,night?'#243e50':'#507f95');for(let j=0;j<8;j++)rect(x-bw*.46+j*bw*.12,y-s*.23,s*.012,s*.19,'#afb9b6');rect(x-bw*.52,y-s*.27,bw*1.04,s*.04,night?'#456074':'#aebbb7');
 }
};
function cabin(x,y,s,id){
 ellipse(x,y,s*.67,s*.08,'#1e302b22');rect(x-s*.47,y-s*.57,s*.94,s*.57,night?'#514636':'#9a7952');
 for(let j=0;j<7;j++)line([[x-s*.47,y-j*s*.078],[x+s*.47,y-j*s*.078]],night?'#6a5a4355':'#735d3f',Math.max(.6,s*.012));
 poly([[x-s*.58,y-s*.55],[x,y-s*.95],[x+s*.58,y-s*.55]],night?'#3a4443':'#596454');line([[x-s*.58,y-s*.55],[x,y-s*.95],[x+s*.58,y-s*.55]],night?'#68705a':'#879075',s*.025);
 rect(x-s*.08,y-s*.31,s*.18,s*.31,night?'#302d24':'#685239');for(const sg of [-1,1]){rect(x+sg*s*.28-s*.07,y-s*.41,s*.14,s*.15,night?'#27393b':'#678e94');line([[x+sg*s*.28,y-s*.41],[x+sg*s*.28,y-s*.26]],'#b9ae89',s*.012)}
}
function forestWorld(){
 const d=distance(),lake0=115,lake1=225;
 const near=Math.max(lake0,d-28);if(lake1>near){const pts=[];for(let j=0;j<50;j++){const a=j/50*Math.PI*2,z=170+55*Math.sin(a),k=3.2+1.45*Math.cos(a);if(z-d< -28)continue;const p=fieldPoint(z,k);pts.push([p.x,p.y])}if(pts.length>2){poly(pts,night?'#274750':'#6d9d9f');for(let j=0;j<13;j++){const z=128+j*7;if(z-d< -25)continue;const a=fieldPoint(z,2.7),b=fieldPoint(z,3.7);line([[a.x,a.y],[b.x,b.y]],night?'#5c7e8155':'#c1dbd26e',1)}}}
 const items=[];
 for(let n=-2;n<34;n++)for(const sg of [-1,1])for(let layer=0;layer<3;layer++){
  const id=n*17+layer*47+(sg<0?31:5),z=n*27+62+rnd(id)*25,k=sg*(1.55+layer*1.03+rnd(id+1)*.8);
  if(sg>0&&z>lake0-12&&z<lake1+12&&k>1.72&&k<4.95)continue;
  const rel=z-d;if(rel< -28||rel>490)continue;const q=depthQ(rel),p=fieldPoint(z,k);items.push({q,x:p.x,y:p.y,s:q*(160+rnd(id+7)*110),id,type:'tree'});
  if(layer===0&&mod(n,5)===0){const a=fieldPoint(z+8,sg*1.65);items.push({q:worldQ(z+8),x:a.x,y:a.y,s:85*worldQ(z+8),id,type:'animal'})}
 }
 for(const [z,k]of [[86,-2.5],[365,3.1]]){if(z-d< -25||z-d>420)continue;const p=fieldPoint(z,k),q=worldQ(z);items.push({q,x:p.x,y:p.y,s:140*q,id:z,type:'cabin'})}
 for(const [z,k]of [[100,1.7],[235,2],[155,-1.8],[300,-2.5]]){if(z-d< -28||z-d>420)continue;const p=fieldPoint(z,k),q=worldQ(z);items.push({q,x:p.x,y:p.y,s:75*q,id:z,type:'rock'})}
 items.sort((a,b)=>a.q-b.q);for(const a of items){if(a.x<-a.s||a.x>W+a.s)continue;if(a.type==='tree')tree(a.x,a.y,a.s,a.id);else if(a.type==='cabin')cabin(a.x,a.y,a.s,a.id);else if(a.type==='animal')animal(a.x,a.y,a.s,a.id,['deer','fawn','wolf'][mod(a.id,3)]);else poly([[a.x-a.s*.4,a.y],[a.x-a.s*.28,a.y-a.s*.36],[a.x+a.s*.04,a.y-a.s*.55],[a.x+a.s*.4,a.y-a.s*.17],[a.x+a.s*.33,a.y]],night?'#53605a':'#969f8f')}
}
const baseScenery=scenery;
scenery=function(q,id,sg){
 if(scene==='foret')return;
 if(scene==='campagne'||scene==='autoroute'){
  // Farm buildings punctuate the large fields, with no miniature field tiles.
  const p=P(q,sg*(scene==='autoroute'?3.6:3.2)),s=q*180;
  if(mod(id,5)===0)farmPlot(p.x,p.y,s*.82,id);
  if(mod(id,5)===2)tree(p.x,p.y,s,id);
  return;
 }
 baseScenery(q,id,sg);
};
worldSigns=function(){
 const items=[];if(scene==='ville'||scene==='village')items.push({z:58,type:'town',name:scene==='ville'?'STRASBOURG':'VILLAGE EXEMPLE'});
 // 95 m between the entrance name and the first speed panel; no grouped panels.
 const data=scene==='ville'?[[153,40],[283,30]]:scene==='village'?[[163,50],[303,30]]:scene==='autoroute'?[[65,110],[355,110]]:[[103,80],[303,80]];
 for(const [z,val]of data)items.push({z,val,type:'speed'});
 for(const it of items.sort((a,b)=>b.z-a.z)){const q=worldQ(it.z);if(q<.15||q>1.8)continue;if(it.type==='town')townSign(q,it.name);else{const p=P(q,1.35);sign(p.x,p.y,145*q,it.val,it.val===30)}}
};
gantry=function(){if(scene!=='autoroute')return;const q=worldQ(195);if(q<.14||q>1.8)return;
 // Low roadside destination board, beyond the safety rail on our right.
 const p=P(q,1.6),w=225*q,h=107*q,bottom=p.y-32*q,top=bottom-h;
 for(const sg of [-1,1])line([[p.x+sg*w*.34,p.y],[p.x+sg*w*.34,bottom]],'#9aaeb8',Math.max(1,4*q));
 rect(p.x-w*.5,top,w,h,'#205e99');c.strokeStyle='#d9e6e9';c.lineWidth=Math.max(1,2*q);c.strokeRect(p.x-w*.5+4*q,top+4*q,w-8*q,h-8*q);
 txt('STRASBOURG',p.x,top+29*q,Math.max(5,22*q),'#fff','center');txt('SORTIE 6 · ILLKIRCH',p.x,top+56*q,Math.max(5,16*q),'#fff','center');txt('2 km',p.x-10*q,top+87*q,Math.max(5,23*q),'#fff','center');line([[p.x+48*q,top+78*q],[p.x+78*q,top+78*q],[p.x+70*q,top+70*q]],'#fff',Math.max(1,2*q));line([[p.x+78*q,top+78*q],[p.x+70*q,top+86*q]],'#fff',Math.max(1,2*q))
};

function cityBackdrop(){if(scene!=='ville')return;for(let i=0;i<36;i++){const x=i*29-20,h=22+rnd(i+8)*51,w=21+rnd(i)*13;if(x>396&&x<478)continue;rect(x,HZ-h,w,h,night?'#293e51':'#97acb4');for(let row=0;row<4;row++)for(let col=0;col<3;col++){if(night&&rnd(i*23+row*3+col)<.55)continue;rect(x+4+col*7,HZ-h+6+row*10,3,5,night?'#d2c18d':'#b8cbd0')}}}

// Detail pass 04: village landmarks, evening light, traffic spacing and street furniture.
function facade(x,y,w,h,base){const g=c.createLinearGradient(x-w/2,0,x+w/2,0);g.addColorStop(0,base);g.addColorStop(1,night?'#34424a':dusk?'#b9a389':'#e1d9c5');c.fillStyle=g;c.fillRect(x-w/2,y-h,w,h)}
function bench(x,y,s){rect(x-s*.27,y-s*.19,s*.54,s*.035,night?'#756b58':'#a88c61');for(let j=0;j<3;j++)rect(x-s*.27,y-s*(.38-j*.045),s*.54,s*.027,night?'#756b58':'#b4986b');for(const sg of [-1,1])line([[x+sg*s*.2,y-s*.36],[x+sg*s*.2,y]],'#63736d',s*.025)}
function planter(x,y,s,id){poly([[x-s*.17,y-s*.16],[x+s*.17,y-s*.16],[x+s*.13,y],[x-s*.13,y]],night?'#785e4d':'#b68a68');tree(x,y-s*.12,s*.4,id,true);for(let j=0;j<8;j++)ellipse(x+s*(rnd(id+j)*.32-.16),y-s*(.21+rnd(j+id)*.08),s*.022,s*.019,['#dfb375','#ca7989','#d8d1a4'][mod(j,3)])}
function bicycle(x,y,s){for(const sg of [-1,1]){c.strokeStyle='#31434a';c.lineWidth=Math.max(.6,s*.017);c.beginPath();c.arc(x+sg*s*.22,y-s*.15,s*.15,0,7);c.stroke()}line([[x-s*.22,y-s*.15],[x-s*.06,y-s*.4],[x+s*.11,y-s*.15],[x-s*.22,y-s*.15],[x+s*.04,y-s*.35],[x+s*.22,y-s*.15],[x+s*.08,y-s*.5]],'#b2875e',s*.018);line([[x-s*.06,y-s*.4],[x-s*.12,y-s*.47],[x-s*.18,y-s*.47]],'#3c4b52',s*.018)}
function church(x,y,s,id){
 ellipse(x,y,s*.83,s*.08,'#12252630');facade(x+s*.08,y,s*.88,s*.65,night?'#72685b':'#c7bba2');
 poly([[x-s*.4,y-s*.64],[x+s*.06,y-s*.99],[x+s*.55,y-s*.64]],night?'#4a5054':'#77706b');
 const tower=x-s*.36;facade(tower,y,s*.28,s*1.17,night?'#786f61':'#d2c7ae');
 poly([[tower-s*.19,y-s*1.16],[tower,y-s*1.72],[tower+s*.19,y-s*1.16]],night?'#3b4550':'#5c6d76');line([[tower,y-s*1.7],[tower,y-s*1.86]],night?'#b7ac8b':'#857a63',Math.max(.6,s*.013));line([[tower-s*.045,y-s*1.79],[tower+s*.045,y-s*1.79]],night?'#b7ac8b':'#857a63',Math.max(.6,s*.013));
 // Clock, louvred belfry and stone surround.
 ellipse(tower,y-s*.94,s*.083,s*.083,'#dcd5b9');c.strokeStyle=night?'#5a5c55':'#7e7b67';c.lineWidth=Math.max(.5,s*.01);c.stroke();line([[tower,y-s*.94],[tower,y-s*1.0]],'#3b4543',s*.009);line([[tower,y-s*.94],[tower+s*.04,y-s*.91]],'#3b4543',s*.009);
 rect(tower-s*.055,y-s*1.11,s*.11,s*.095,'#3e4b4b');for(let j=0;j<4;j++)rect(tower-s*.055,y-s*(1.105-j*.02),s*.11,s*.008,'#a79f87');
 for(let j=0;j<3;j++){const xx=x-s*.07+j*s*.2;c.fillStyle=(night||dusk)?'#ae9b68':'#6e939d';c.beginPath();c.roundRect(xx-s*.043,y-s*.48,s*.086,s*.22,[s*.043,s*.043,0,0]);c.fill();line([[xx,y-s*.45],[xx,y-s*.27]],'#b7ac8c',s*.008)}
 c.fillStyle=night?'#413c31':'#746047';c.beginPath();c.roundRect(tower-s*.065,y-s*.28,s*.13,s*.28,[s*.065,s*.065,0,0]);c.fill();
 for(let j=0;j<3;j++)rect(tower-s*(.11+j*.03),y+j*s*.018,s*(.22+j*.06),s*.016,night?'#696c62':'#b1ad96');
 if(night||dusk)light(tower,y-s*.16,s*.22,'#f4d79b18');planter(x+s*.62,y,s*.42,id)
}
function shop(x,y,s,id,kind){building(x,y,s,id,'house');const label=kind==='bakery'?'BOULANGERIE':'ÉPICERIE',col=kind==='bakery'?'#9c654e':'#5d8064';rect(x-s*.39,y-s*.35,s*.78,s*.12,col);txt(label,x,y-s*.265,Math.max(4,s*.075),'#fff4df','center');rect(x-s*.35,y-s*.23,s*.7,s*.22,night?'#253f4a':'#658f9c');
 for(let j=0;j<8;j++){poly([[x-s*.4+j*s*.1,y-s*.24],[x-s*.3+j*s*.1,y-s*.24],[x-s*.29+j*s*.1,y-s*.18],[x-s*.39+j*s*.1,y-s*.18]],j%2?'#e6d9bd':col)}
 line([[x,y-s*.23],[x,y]],'#d3cab5',s*.018);planter(x-s*.5,y,s*.45,id);bicycle(x+s*.55,y,s*.44);if(kind==='bakery'){rect(x+s*.4,y-s*.18,s*.13,s*.18,night?'#766852':'#b5a07c');txt('PAIN',x+s*.465,y-s*.1,Math.max(3,s*.033),'#f5ebd4','center')}
 if(night||dusk){rect(x-s*.31,y-s*.205,s*.22,s*.16,'#e6c77c50');rect(x+s*.08,y-s*.205,s*.22,s*.16,'#e6c77c50')}
}
function villageSquare(x,y,s,id){
 ellipse(x,y,s*.95,s*.23,night?'#586260':'#bcb9a5');for(let j=-3;j<=3;j++)line([[x-s*.75,y+j*s*.035],[x+s*.75,y+j*s*.035]],night?'#7a7d6b22':'#7c826933',Math.max(.5,s*.006));
 ellipse(x,y-s*.05,s*.29,s*.085,night?'#7c8072':'#b5b7a6');ellipse(x,y-s*.07,s*.24,s*.054,night?'#365963':'#7dabb0');line([[x,y-s*.08],[x,y-s*.37]],night?'#8a8c7c':'#cac8b0',s*.08);ellipse(x,y-s*.37,s*.15,s*.035,night?'#8a8c7c':'#c7c6b0');
 for(let j=0;j<5;j++){const xx=x+(j-2)*s*.04,dy=Math.sin(t*4+j)*s*.01;line([[x,y-s*.38],[xx,y-s*(.42+j%2*.04)],[xx+s*.035,y-s*.12+dy]],night?'#b3d9da55':'#d3e8dfaa',Math.max(.5,s*.009))}
 bench(x-s*.59,y+s*.04,s*.55);bench(x+s*.58,y+s*.04,s*.55);planter(x-s*.8,y,s*.52,id);planter(x+s*.81,y,s*.52,id+5);person(x+s*.44,y-s*.02,s*.31,id+1)
}
function busStop(x,y,s,id){if(scene==='campagne')return;
 const steel=night?'#6b7d81':'#6d868b';poly([[x-s*.45,y],[x+s*.45,y],[x+s*.45,y-s*.68],[x-s*.45,y-s*.68]],night?'#35535a33':'#bbd9d640');for(const sg of [-1,1])line([[x+sg*s*.43,y],[x+sg*s*.43,y-s*.7]],steel,s*.025);rect(x-s*.49,y-s*.73,s*.98,s*.055,steel);bench(x,y-s*.01,s*.65);line([[x+s*.57,y],[x+s*.57,y-s*.93]],steel,s*.023);rect(x+s*.46,y-s*.98,s*.22,s*.25,'#2b647f');txt('BUS',x+s*.57,y-s*.81,Math.max(4,s*.07),'#fff','center');person(x+s*.24,y,s*.37,id)
}
function rearTraffic(q,k,id){const p=P(q,k),s=94*q,col=['#9babb6','#bf9c78','#7d91a1','#8f6167'][mod(id,4)];ellipse(p.x,p.y,s*.48,s*.07,'#14253240');for(const sg of [-1,1])rect(p.x+sg*s*.36-s*.045,p.y-s*.25,s*.09,s*.23,'#243038');poly([[p.x-s*.44,p.y-s*.04],[p.x-s*.46,p.y-s*.39],[p.x-s*.28,p.y-s*.67],[p.x+s*.28,p.y-s*.67],[p.x+s*.46,p.y-s*.39],[p.x+s*.44,p.y-s*.04]],col);poly([[p.x-s*.26,p.y-s*.61],[p.x+s*.26,p.y-s*.61],[p.x+s*.34,p.y-s*.36],[p.x-s*.34,p.y-s*.36]],'#2c4351');line([[p.x-s*.36,p.y-s*.22],[p.x+s*.36,p.y-s*.22]],night?'#9ba49a':'#c4c9bf',Math.max(.5,s*.013));for(const sg of [-1,1]){rect(p.x+sg*s*.34-s*.062,p.y-s*.28,s*.124,s*.065,(night||dusk)?'#e57356':'#ba514b');if(night||dusk)light(p.x+sg*s*.34,p.y-s*.25,s*.13,'#ec785b20')}rect(p.x-s*.11,p.y-s*.16,s*.22,s*.05,'#dce1d4')}
function sameWayTraffic(){if(scene!=='autoroute')return;
 // Positive relative distances and fixed lanes prevent overlap with the user's car.
 const vehicles=[{z:92+7*Math.sin(t*.25),k:.815,id:2},{z:34+t*3.3,k:.32,id:0},{z:165+t*5,k:.32,id:1}];
 for(const v of vehicles.sort((a,b)=>b.z-a.z))rearTraffic(depthQ(v.z),v.k,v.id);
}
const v3Scene=scenery;
scenery=function(q,id,sg){
 if(scene==='village'){
  const p=P(q,sg*1.40),s=q*212,x=p.x+sg*s*.66,y=p.y,kind=mod(id,12);
  if(kind===6)church(x,y,s*.92,id);
  else if(kind===1)villageSquare(x+sg*s*.14,y,s*.88,id);
  else if(kind===8)shop(x,y,s*.93,id,'bakery');
  else if(kind===10&&sg<0)villageSquare(x,y,s*.9,id);
  else if(kind===10)shop(x,y,s*.9,id,'grocer');
  else if(kind===7&&sg>0)busStop(x,y,s*.84,id);
  else if(kind===3)busStop(x,y,s*.78,id);
  else if(kind===4)farmPlot(x+sg*s*.13,y,s*.9,id);
  else if(kind===11)building(x,y,s,id,'town');
  else {building(x,y,s*(.76+rnd(id)*.15),id,'house');if(kind===0)tree(x+sg*s*.75,y,s*.56,id)}
  if(mod(id,2)===0)lamp(p.x+sg*s*.1,y,s*.84,sg);
  if(mod(id,4)===3)person(p.x,y,s*.32,id);
  if(kind===7){line([[x-s*.56,y],[x-s*.56,y-s*.26]],'#6d746b',s*.018);rect(x-s*.64,y-s*.34,s*.16,s*.14,'#b69a4c')}
  return;
 }
 v3Scene(q,id,sg);
 if(scene==='ville'){
  const p=P(q,sg*1.34),s=q*220,x=p.x+sg*s*.62,y=p.y;
  if(mod(id,3)===0){bench(p.x+sg*s*.16,y,s*.46);planter(p.x-sg*s*.08,y,s*.35,id)}
  if(mod(id,4)===2)bicycle(p.x+sg*s*.2,y,s*.45);
  if(mod(id,5)===2)busStop(x+sg*s*.75,y,s*.65,id);
 }
 if(scene==='campagne'||scene==='autoroute'){
  const p=P(q,sg*2.9),s=q*100;
  if(mod(id,4)===3){for(let j=0;j<3;j++){const xx=p.x+sg*j*s*.3,yy=p.y-j*s*.04;ellipse(xx,yy-s*.12,s*.17,s*.17,night?'#777149':'#c5ac68');c.strokeStyle=night?'#595839':'#ad9559';c.lineWidth=Math.max(.5,s*.012);c.beginPath();c.arc(xx,yy-s*.12,s*.1,0,6);c.stroke()}}
  if(mod(id,6)===1){tree(p.x,p.y,s*.55,id,true);tree(p.x+sg*s*.3,p.y,s*.5,id+1,true)}
 }
};
const v3Lamp=lamp;
lamp=function(...args){const original=night;if(dusk)night=true;v3Lamp(...args);night=original};
function forestAccents(){if(scene!=='foret')return;
 for(const [z,k,id]of [[110,-1.5,8],[270,-1.72,12],[360,1.7,15]]){if(z-distance()< -25||z-distance()>400)continue;const q=worldQ(z),p=fieldPoint(z,k),s=90*q;
  // Ferns, a fallen log and small mushrooms on the forest floor, away from the lake.
  for(let j=0;j<5;j++){const a=(j-2)*.38;line([[p.x,p.y],[p.x+Math.sin(a)*s*.25,p.y-Math.cos(a)*s*.22]],night?'#49664a':'#729251',Math.max(.6,s*.015))}
  if(id===12){line([[p.x-s*.4,p.y-s*.05],[p.x+s*.3,p.y-s*.14]],night?'#665b45':'#997a51',s*.14);ellipse(p.x+s*.3,p.y-s*.14,s*.065,s*.07,night?'#8b7754':'#bea274')}
  for(let j=0;j<3;j++){const xx=p.x+s*(j*.11-.1);rect(xx,p.y-s*.055,s*.012,s*.055,'#beb398');ellipse(xx,p.y-s*.06,s*.04,s*.022,['#b67a56','#c38d69','#aa7054'][j])}
 }
}
gantry=function(){if(scene!=='autoroute')return;const q=worldQ(235);if(q<.15||q>1.65)return;
 const p=P(q,1.92),w=280*q,h=142*q,bottom=p.y-28*q,top=bottom-h;
 for(const sg of [-1,1])line([[p.x+sg*w*.32,p.y],[p.x+sg*w*.32,bottom]],night?'#8299a3':'#a4b4bb',Math.max(1,5*q));
 const g=c.createLinearGradient(0,top,0,bottom);g.addColorStop(0,night?'#1d4c7d':'#2366a3');g.addColorStop(1,night?'#1a426d':'#23568a');rect(p.x-w*.5,top,w,h,g);c.strokeStyle='#d9e6e9';c.lineWidth=Math.max(1,2*q);c.strokeRect(p.x-w*.5+5*q,top+5*q,w-10*q,h-10*q);
 rect(p.x-w*.41,top+13*q,49*q,22*q,'#a54543');txt('A35',p.x-w*.41+24*q,top+29*q,Math.max(4,17*q),'#fff','center');txt('STRASBOURG',p.x+14*q,top+59*q,Math.max(5,26*q),'#fff','center');
 line([[p.x-w*.42,top+72*q],[p.x+w*.42,top+72*q]],'#a4c4d5',Math.max(.6,q));txt('SORTIE 6 · ILLKIRCH',p.x,top+97*q,Math.max(5,19*q),'#fff','center');txt('2 km',p.x-17*q,top+124*q,Math.max(5,21*q),'#fff','center');line([[p.x+55*q,top+117*q],[p.x+93*q,top+117*q],[p.x+82*q,top+107*q]],'#fff',Math.max(1,3*q));line([[p.x+93*q,top+117*q],[p.x+82*q,top+127*q]],'#fff',Math.max(1,3*q));
};
function eveningGrade(){if(dusk){rect(0,TOP,W,BOT-TOP,'#c8896420');for(let j=0;j<5;j++){const x=100+j*34+t*1.5,y=110+j%2*10;line([[x-4,y],[x,y+2],[x+4,y]],'#535b6670',1)}}}
function hud(names,val,zone){
 rect(0,0,W,TOP,'#111e2c');rect(0,TOP-2,W,2,night?'#607b9b':dusk?'#c49472':'#7ca5aa');
 txt(names[scene],22,24,18,'#eef3ed');txt('ÉTUDE 04 · SIGNALISATION DE DÉMONSTRATION',22,44,10,'#9dabb8');
 const labels=['JOUR','SOIR','NUIT'],mode=night?2:dusk?1:0;
 for(let i=0;i<3;i++){const x=W-211+i*66;const active=i===mode;if(active){c.fillStyle=night?'#31445d':dusk?'#67554b':'#3a5a60';c.beginPath();c.roundRect(x,14,59,25,12);c.fill()}txt(labels[i],x+29.5,31,10,active?'#f3eddd':'#6f8294','center')}
 rect(0,BOT,W,H-BOT,'#111e2c');txt('Limitation simulée · '+val+' km/h'+(zone?' · ZONE 30':''),22,H-12,12,'#c5d0d3');txt(scene==='autoroute'?'Circulation dans les deux sens · espacements fixes':scene==='village'?'Église · commerces · place · jardins':scene==='foret'?'Sous-bois · lac · cabanes occasionnelles':'Perspective commune · jour / soir / nuit',W-20,H-12,10,'#8ea4af','right')
}

// Focused revision: true city blocks and moving pedestrians, plus rest areas.
function blockPoint(z,k,h=0){const q=worldQ(z),p=P(q,k);return [p.x,p.y-(h+ruralHeight(z,k))*q]}
function blockQuad(z0,z1,k,h0,h1,col){poly([blockPoint(z0,k,h0),blockPoint(z1,k,h0),blockPoint(z1,k,h1),blockPoint(z0,k,h1)],col)}
function bQuad(z0,z1,k,h0,h1,col){bPoly([blockPoint(z0,k,h0),blockPoint(z1,k,h0),blockPoint(z1,k,h1),blockPoint(z0,k,h1)],col)}
function cityBlock(z,id,sg){
 if(mod(id,10)===3||id===25){const q=worldQ(z),p=P(q,sg*2.2);park(p.x,p.y,190*q,id);tree(p.x+sg*90*q,p.y,90*q,id);return}
 const floors=[4,9,5,13,6,8,3,11][mod(id,8)],height=44+floors*26,depth=25+mod(id,3)*3,inside=sg*((id===19?2.30:1.72)+rnd(id)*.22),outside=sg*(3.55+mod(id,3)*.2),near=z,far=z+depth;
 const q=worldQ(near);if(q<.085||q>2.0)return;
 const palettes=night?['#354b5b','#4d5556','#3e505e','#3f4c59']:['#a3b5b9','#c9c5b6','#a8afb0','#94aabd'];const main=palettes[mod(id,4)],front=night?'#2c3e4b':['#889d9f','#b2ad9c','#8d989c','#7d94a6'][mod(id,4)];
 // Side facade along the street; end facade and roof use the same projection.
 poly([blockPoint(near,inside),blockPoint(far,inside),blockPoint(far,inside,height),blockPoint(near,inside,height)],main);
 poly([blockPoint(near,inside),blockPoint(near,outside),blockPoint(near,outside,height),blockPoint(near,inside,height)],front);
 poly([blockPoint(near,inside,height),blockPoint(far,inside,height),blockPoint(far,outside,height),blockPoint(near,outside,height)],night?'#4c5b60':'#cad0ca');
 const glass=mod(id,3)===0;
 // 7.36 : fenêtres regroupées par couleur (elles ne se chevauchent pas) ; les
 // couleurs des vitres sont déclarées d'abord pour que les meneaux restent dessus.
 for(const col of ['#edce8f',night?'#182b3d':glass?'#608898':'#6f909b'])bEntry('f'+col,col,0,true);
 for(let floor=0;floor<floors;floor++){
  const h0=51+floor*26,h1=h0+14;
  for(let col=0;col<6;col++){
   const a=near+2+col*4.6,b=a+2.8,lit=(night||dusk)&&rnd(id*91+floor*7+col)>(dusk?.72:.62),color=lit?'#edce8f':night?'#182b3d':glass?'#608898':'#6f909b';
   bQuad(a,b,inside,h0,h1,color);
   if(glass)bQuad(a,b,inside,h0+6,h0+7,night?'#466271':'#b9d0d0');
   if(!glass&&floor%2===0){const lo=blockPoint(a,inside,h0-4),hi=blockPoint(b,inside,h0-4);bStroke([lo,hi],night?'#74817c':'#d3d4c7',Math.max(.5,q*1.1))}
  }
  const kp=outside-inside;
  for(let j=0;j<4;j++){
   const k0=inside+kp*(.10+j*.22),k1=k0+kp*.11,lit=(night||dusk)&&rnd(id*39+floor*5+j)>.62;
   bPoly([blockPoint(near,k0,h0),blockPoint(near,k1,h0),blockPoint(near,k1,h1),blockPoint(near,k0,h1)],lit?'#e9ca86':night?'#182b3d':'#7394a0');
  }
  bStroke([blockPoint(near,inside,44+floor*26),blockPoint(far,inside,44+floor*26)],night?'#71808744':'#d8ded777',Math.max(.5,q*.8));
 }
 bFlush();
 // Street-level storefront, entrance and sign; these are part of the facade.
 blockQuad(near+1,far-1,inside,1,33,night?'#234253':'#487987');
 for(let col=0;col<7;col++){const zz=near+1+col*4.7;line([blockPoint(zz,inside,0),blockPoint(zz,inside,34)],night?'#839a9f':'#c1cfca',Math.max(.6,q*1.5))}
 const pos=blockPoint(near,(inside+outside)*.5,27),width=Math.abs(P(q,outside).x-P(q,inside).x)*.88;
 rect(pos[0]-width/2,pos[1]-16*q,width,20*q,mod(id,4)===1?'#537c67':night?'#365d74':'#5e7f8a');
 const labels=['CAFÉ','LIBRAIRIE','BOULANGERIE','PHARMACIE','ÉPICERIE','BUREAUX'];txt(mod(id,9)===0?'ÉCOLE':mod(id,9)===4?'MAIRIE':labels[mod(id,6)],pos[0],pos[1]-1*q,Math.max(4,q*12),'#f1eedb','center');
 const shop=id===19?'cafe':id===24?'bakery':id===20?'pharmacy':mod(id,6)===0?'cafe':mod(id,6)===2?'bakery':mod(id,6)===3?'pharmacy':'home';
 if(shop==='home'){
  blockQuad(near+depth*.42,near+depth*.57,inside,0,35,night?'#202f36':'#576968');
  const ep=blockPoint(near+depth*.5,inside,16);ellipse(ep[0],ep[1],Math.max(.6,q),Math.max(.6,q),'#d7c695');
 }else{
  const col=shop==='cafe'?'#426b63':shop==='bakery'?'#a07654':'#5c7c6d';
  poly([blockPoint(near,inside,36),blockPoint(far,inside,36),blockPoint(far,inside-sg*.14,29),blockPoint(near,inside-sg*.14,29)],col);
  for(let z=near;z<far;z+=4){
   poly([blockPoint(z,inside,36),blockPoint(Math.min(z+2,far),inside,36),blockPoint(Math.min(z+2,far),inside-sg*.14,29),blockPoint(z,inside-sg*.14,29)],'#e5d9bc');
  }
  const signPos=blockPoint(near,(inside+outside)/2,27);
  rect(signPos[0]-width/2,signPos[1]-16*q,width,20*q,col);
  txt(shop==='cafe'?'CAFÉ':shop==='bakery'?'BOULANGERIE':'PHARMACIE',signPos[0],signPos[1]-q,Math.max(4,q*12),'#fff5dc','center');
  if(shop==='pharmacy'){
   const cross=blockPoint(near,inside-sg*.18,55),ss=24*q;
   line([blockPoint(near,inside,55),cross],'#65796c',2*q);
   rect(cross[0]-ss*.18,cross[1]-ss*.5,ss*.36,ss,'#39a374');rect(cross[0]-ss*.5,cross[1]-ss*.18,ss,ss*.36,'#39a374');
   rect(cross[0]-ss*.07,cross[1]-ss*.28,ss*.14,ss*.56,'#c1e4bb');rect(cross[0]-ss*.28,cross[1]-ss*.07,ss*.56,ss*.14,'#c1e4bb');
  }
  if(shop==='bakery'){
   for(let j=0;j<5;j++){
    const a=blockPoint(near+5+j*2.8,inside,10),b=blockPoint(near+6+j*2.8,inside,23);
    line([a,b],'#d9b477',Math.max(1,q*3));
   }
  }
 }
 // Roof service core and an antenna distinguish tall towers from apartments.
 if(floors>=12){const a=blockPoint(near+5,(inside+outside)*.5,height);rect(a[0]-22*q,a[1]-18*q,44*q,18*q,night?'#58646a':'#a6b3b4');line([[a[0],a[1]-18*q],[a[0],a[1]-48*q]],'#86979c',Math.max(.5,q))}
}
function streetBench(z,k){
 const q=worldQ(z),p=blockPoint(z,k),s=42*q,x=p[0],y=p[1];
 ellipse(x,y+s*.08,s*.68,s*.1,'#1c302526');
 for(const a of [-.45,.45])line([[x+s*a,y],[x+s*a,y-s*.35]],'#536267',Math.max(1,q*2));
 for(let j=0;j<3;j++){line([[x-s*.6,y-s*(.28+j*.055)],[x+s*.6,y-s*(.28+j*.055)]],'#977c5b',Math.max(1,q*3));line([[x-s*.6,y-s*(.52+j*.065)],[x+s*.6,y-s*(.52+j*.065)]],'#a88a64',Math.max(1,q*3));}
}
function streetBike(z,k){
 const q=worldQ(z),p=blockPoint(z,k),x=p[0],y=p[1],s=36*q;
 for(const sg of [-1,1]){c.strokeStyle='#4d5e62';c.lineWidth=Math.max(1,q*1.5);c.beginPath();c.ellipse(x+sg*s*.46,y-s*.17,s*.2,s*.2,0,0,7);c.stroke();}
 line([[x-s*.46,y-s*.17],[x-s*.1,y-s*.5],[x+s*.15,y-s*.17],[x-s*.46,y-s*.17],[x-s*.15,y-s*.37],[x+s*.35,y-s*.37],[x+s*.46,y-s*.17]],'#847961',Math.max(1,q*2));
 line([[x+s*.35,y-s*.37],[x+s*.28,y-s*.67],[x+s*.45,y-s*.67]],'#455b63',Math.max(1,q*2));
 line([[x-s*.21,y-s*.54],[x-s*.02,y-s*.54]],'#37474c',Math.max(1,q*3));
}
function streetTable(z,k,id){
 const q=worldQ(z),p=blockPoint(z,k),x=p[0],y=p[1],s=30*q;
 ellipse(x,y,s*.6,s*.1,'#23352d22');line([[x,y],[x,y-s*.62]],'#536267',Math.max(1,q*2));
 ellipse(x,y-s*.62,s*.48,s*.16,'#cebf9e');
 for(const sg of [-1,1]){
  const xx=x+sg*s*.75;line([[xx-s*.12,y],[xx-s*.12,y-s*.38],[xx+s*.12,y-s*.38],[xx+s*.12,y]],'#567369',Math.max(1,q*2));
  line([[xx+sg*s*.14,y-s*.38],[xx+sg*s*.14,y-s*.72]],'#567369',Math.max(1,q*2));
 }
 ellipse(x+s*.12,y-s*.67,s*.065,s*.045,'#f4ecd8');
}
function parkedPocket(z,k,color){
 // Perpendicular bay. The long vehicle axis runs across the road axis.
 const front=k-.235,rear=k+.235,zn=z-2.3,zf=z+2.3,q=worldQ(z);
 const v=(z,k,h)=>blockPoint(z,k,h);
 poly([v(zn,front,0),v(zf,front,0),v(zf,rear,0),v(zn,rear,0)],'#374b453d');
 poly([v(zn,front,4),v(zn,rear,4),v(zn,rear,18),v(zn,front,18)],color);
 poly([v(zn,front,18),v(zf,front,18),v(zf,rear,18),v(zn,rear,18)],color);
 poly([v(zn,front,4),v(zf,front,4),v(zf,front,18),v(zn,front,18)],'#69858c');
 const ra=k-.12,rb=k+.13;
 poly([v(zn,ra,18),v(zn,rb,18),v(zn,rb-.035,31),v(zn,ra+.035,31)],'#486675');
 poly([v(zn,ra+.035,31),v(zf,ra+.035,31),v(zf,rb-.035,31),v(zn,rb-.035,31)],color);
 poly([v(zn,ra,18),v(zf,ra,18),v(zf,ra+.035,31),v(zn,ra+.035,31)],'#738f99');
 for(const wheel of [k-.155,k+.155]){const xy=v(zn,wheel,5);ellipse(xy[0],xy[1],5*q,6*q,'#29393f');ellipse(xy[0],xy[1],2.5*q,3*q,'#a0aaa4');}
 const lamp=v(zn,front,11),tail=v(zn,rear,11);
 rect(lamp[0],lamp[1]-2*q,3*q,4*q,'#ece5c7');rect(tail[0]-3*q,tail[1]-2*q,3*q,4*q,'#b55c51');
}
function cityTraffic(){
 window.TrafficReview=[];
 for(const start of [140,270]){
  const z=distance()+mod(start-19*(t-2)+28,420)-28,rel=z-distance();
  if(rel< -28||rel>450)continue;
  const q=worldQ(z),p=blockPoint(z,-.5);
  window.TrafficReview.push({x:p[0]/W,y:(p[1]-TOP)/(BOT-TOP),q});
 }
}
function frontageDetails(){if(scene==='campagne'||scene==='foret')return;
 for(const [z,k,id] of [[38,-1.90,12],[69,1.92,32],[156,-1.86,21]]){
  const q=worldQ(z),foot=blockPoint(z,k),x=foot[0],y=foot[1];
  poly([blockPoint(z-1.5,k,0),blockPoint(z+1.5,k,0),blockPoint(z+1.5,k,37),blockPoint(z-1.5,k,37)],'#465e64');
  const label=blockPoint(z,k,43);rect(label[0]-7*q,label[1]-5*q,14*q,8*q,'#e2dbc4');txt(String(id),label[0],label[1]+q,Math.max(4,6*q),'#394c50','center');
  const panel=blockPoint(z+2,k,22);rect(panel[0]-2*q,panel[1]-5*q,4*q,10*q,'#bac3b8');
  for(let j=0;j<3;j++)rect(panel[0]-q,panel[1]-3*q+j*2.5*q,2*q,q,'#52696c');
 }
 const z=154,k=1.91;for(let h=1;h<32;h+=4)line([blockPoint(z-5,k,h),blockPoint(z+5,k,h)],'#778783',Math.max(.6,worldQ(z)));
 const q=worldQ(58),pos=blockPoint(58,-1.48);busStop(pos[0],pos[1],80*q,0);
 for(const [zz,kk,id]of [[54,-1.38,4],[61,-1.38,8]]){const qq=worldQ(zz),pp=blockPoint(zz,kk);person(pp[0],pp[1],61*qq,id);}
}
function cityHydrant(z,k){
 const q=worldQ(z),p=blockPoint(z,k),x=p[0],y=p[1],h=29*q;
 ellipse(x,y,11*q,3*q,'#3c4f4726');
 rect(x-5*q,y-h+6*q,10*q,h-6*q,'#ad5148');
 ellipse(x,y-h+6*q,5*q,6*q,'#c16b56');
 rect(x-9*q,y-h*.56,18*q,5*q,'#af574b');
 ellipse(x-9*q,y-h*.48,2*q,4*q,'#747b70');ellipse(x+9*q,y-h*.48,2*q,4*q,'#747b70');
 rect(x-6*q,y-4*q,12*q,4*q,'#797e6d');
 line([[x,y-h-2*q],[x,y-h+q]],'#6f7b74',Math.max(1,q*2));
}
function cityDrain(z,sg){
 const p0=blockPoint(z,sg*1.01),p1=blockPoint(z+3.3,sg*1.01),p2=blockPoint(z+3.3,sg*.96),p3=blockPoint(z,sg*.96);
 poly([p0,p1,p2,p3],'#566669');
 for(let j=0;j<6;j++)line([blockPoint(z+j*.55,sg*1.007),blockPoint(z+j*.55,sg*.965)],'#98a19b',Math.max(.5,worldQ(z)*.8));
}
function streetMeter(z,k){
 const q=worldQ(z),p=blockPoint(z,k),x=p[0],y=p[1];
 rect(x-2*q,y-43*q,4*q,43*q,'#697a78');
 rect(x-7*q,y-51*q,14*q,25*q,'#456773');
 rect(x-4*q,y-47*q,8*q,8*q,'#bbceba');
 rect(x-4*q,y-35*q,8*q,2*q,'#283e46');
 txt('P',x,y-29*q,Math.max(4,6*q),'#f5f3dc','center');
}
function neighbourhoodDetails(){if(scene==='campagne'||scene==='foret')return;
 if(scene!=='ville')return;
 // Cafe furniture occupies the facade setback, leaving the walking line clear.
 for(const z of [21,15,9])streetTable(z,1.96,0);
 // A small square takes one building plot, with planted edges and seats.
 for(const z of [91,81])streetBench(z,-3.0);
 for(const [z,k,id] of [[87,-2.7,1],[94,-3.1,2],[73,-2.72,3]]){const q=worldQ(z),p=blockPoint(z,k);planter(p[0],p[1],42*q,id);tree(p[0],p[1],95*q,id);}
 for(const [z,k] of [[33,-1.54],[48,1.54],[170,-1.54]])streetBike(z,k);
 for(const [z,sg] of [[35,-1],[60,1],[164,1]]){const q=worldQ(z),p=blockPoint(z,sg*1.53);rect(p[0]-5*q,p[1]-19*q,10*q,19*q,'#567465');ellipse(p[0],p[1]-19*q,5*q,2*q,'#294b40');}
 for(const sg of [-1,1])for(const z of [88,94,144,151]){const q=worldQ(z),p=blockPoint(z,sg*1.12);line([[p[0],p[1]],[p[0],p[1]-18*q]],'#657777',Math.max(1,q*3));ellipse(p[0],p[1]-18*q,2*q,2*q,'#c4d0c5');}
 // The parked cars sit inside a recessed bay beside the square.
 const z0=76,z1=97,k0=-1.78,k1=-2.45;
 poly([blockPoint(z0,k0),blockPoint(z1,k0),blockPoint(z1,k1),blockPoint(z0,k1)],'#899795');
 for(const z of [76,86,97])line([blockPoint(z,k0),blockPoint(z,k1)],'#e6e4d5',Math.max(.7,worldQ(z)*1.4));
 parkedPocket(91,-2.10,'#b56658');parkedPocket(80,-2.10,'#889ca8');
 streetMeter(74,-1.73);
 cityHydrant(34,1.53);cityHydrant(178,-1.53);
 for(const [z,sg]of [[15,-1],[53,1],[152,-1],[231,1]])cityDrain(z,sg);
 // An occasional local street plaque on an existing facade.
 const plaque=blockPoint(26,-1.86,49),pq=worldQ(26);
 rect(plaque[0]-35*pq,plaque[1]-7*pq,70*pq,15*pq,'#315d73');
 txt('RUE DES TILLEULS',plaque[0],plaque[1]+3*pq,Math.max(4,6*pq),'#f3f1dc','center');

}
function cityWorld(){if(scene!=='ville')return;
 const d=distance(),D=roadTravel,o=shift(),items=[];
 for(let n=Math.floor((D-65)/43);n<Math.floor((D-65)/43)+17;n++)for(const sg of [-1,1]){
  const z=54+n*43+(sg<0?18:0)-o;if(z-d< -36||z-d>620)continue;
  // Leave an actual gap for the crossing street.
  if(z>100&&z<142)continue;
  items.push({z,id:n+20+(sg<0?5:0),sg});
 }
 items.sort((a,b)=>b.z-a.z);for(const b of items)cityBlock(b.z,b.id,b.sg);
 // Pavement joints, a curb, street lighting and trees in individual planters.
 for(const sg of [-1,1]){
  for(let n=Math.floor((D-40)/7);n<Math.floor((D-40)/7)+62;n++){
   const z=45+n*7-o;if(z-d< -28||z-d>430)continue;const a=fieldPoint(z,sg*1.09),b=fieldPoint(z,sg*1.57);line([[a.x,a.y],[b.x,b.y]],night?'#7b8a8544':'#687b7060',Math.max(.5,worldQ(z)*.8));
  }
  for(let n=Math.floor((D-35)/48);n<Math.floor((D-35)/48)+11;n++){
   const z=55+n*48+(sg<0?22:0)-o;if(z-d< -28||z-d>450)continue;const q=worldQ(z),p=fieldPoint(z,sg*1.16);if(Math.abs(z-104)>18&&Math.abs(z-277)>18)lamp(p.x,p.y,127*q,sg);
   if(mod(n,2)===0){const a=fieldPoint(z+8,sg*1.47);planter(a.x,a.y,48*worldQ(z+8),n+20);tree(a.x,a.y,75*worldQ(z+8),n+20)}
  }
 }
 for(const sg of [-1,1]){
  for(const k of [1.08,1.30,1.53]){
   const pts=[];for(let z=distance()-15;z<distance()+450;z+=5){const p=fieldPoint(z,sg*k);pts.push([p.x,p.y]);}
   line(pts,night?'#85908b44':'#d6d7cb99',.8);
  }
  const curb=[];for(let z=distance()-15;z<distance()+450;z+=5){const p=fieldPoint(z,sg*1.015);curb.push([p.x,p.y]);}
  line(curb,night?'#98a5a0':'#e7e5d7',2.1);
 }
 // Walkers have a real longitudinal motion (1.2–1.6 m/s), not just a leg cycle.
 const people=[];for(let n=-3;n<28;n++)for(const sg of [-1,1]){
  const id=n*7+(sg<0?4:0),direction=mod(n,2)?1:-1,z=42+n*32+(sg<0?13:0)+direction*t*(1.2+rnd(id)*.4),rel=z-d;
  if(rel< -15||rel>360||Math.abs(z-112)<9||Math.abs(z-285)<9)continue;const q=depthQ(rel),p=fieldPoint(z,sg*(1.25+rnd(id+2)*.15));people.push({q,x:p.x,y:p.y,id});
 }
 people.sort((a,b)=>a.q-b.q);for(const p of people)person(p.x,p.y,61*p.q,p.id);
 for(const [z,k,id]of [[180,-1.40,3],[292,1.40,8]]){if(z-d< -25||z-d>380)continue;const p=fieldPoint(z,k),q=worldQ(z);busStop(p.x,p.y,92*q,id)}
}
function villageQuad(z0,z1,k0,k1,col,h=0){
 poly([blockPoint(z0,k0,h),blockPoint(z1,k0,h),blockPoint(z1,k1,h),blockPoint(z0,k1,h)],col);
}
function villageStreetPlate(z,k,label,sg){
 const q=worldQ(z),p=blockPoint(z,k),top=blockPoint(z,k,52);
 line([p,top],night?'#849188':'#89988d',Math.max(1,2*q));
 rect(top[0]-37*q,top[1],74*q,15*q,'#426c7b');
 c.strokeStyle='#c6d6c1';c.lineWidth=Math.max(.5,q);c.strokeRect(top[0]-37*q,top[1],74*q,15*q);
 txt(label,top[0],top[1]+10*q,Math.max(3,7*q),'#f4eedb','center');
}
function villageNoticeboard(z,k){
 const q=worldQ(z),a=blockPoint(z,k),x=a[0],y=a[1];
 for(const dx of [-23,23])line([[x+dx*q,y],[x+dx*q,y-70*q]],'#7c775f',Math.max(1,3*q));
 rect(x-28*q,y-74*q,56*q,43*q,night?'#59695f':'#94a393');
 rect(x-25*q,y-71*q,50*q,37*q,night?'#53635d':'#d7d7bb');
 for(const [dx,dy,w,h,col]of [[-20,-66,16,13,'#f3e8cd'],[1,-65,18,21,'#d6cbb1'],[-20,-49,15,11,'#c0d1c4']]){
  rect(x+dx*q,y+dy*q,w*q,h*q,col);
  for(let j=0;j<3;j++)rect(x+(dx+2)*q,y+(dy+3+j*2.4)*q,(w-4)*q,.6*q,'#8f9e96');
 }
 poly([[x-32*q,y-74*q],[x,y-84*q],[x+32*q,y-74*q]],night?'#636955':'#8c8b6d');
}
function villagePostbox(z,k){
 const q=worldQ(z),a=blockPoint(z,k),x=a[0],y=a[1];
 rect(x-2*q,y-35*q,4*q,35*q,'#65786c');
 rect(x-10*q,y-55*q,20*q,24*q,night?'#b79c55':'#d8b24f');
 rect(x-8*q,y-52*q,16*q,3*q,'#917f4a');
 rect(x-6*q,y-46*q,12*q,2*q,'#59675c');
 rect(x-6*q,y-41*q,12*q,5*q,'#ece1b7');
}
function villageLivingDetails(){
 if(scene!=='village')return;
 villageStreetPlate(128,-1.64,'RUE DES JARDINS',-1);
 villageStreetPlate(100,1.64,'RUE DU CLOCHER',1);
 villageNoticeboard(53,-2.23);villagePostbox(21,-1.83);
 // A few pedestrians stay on the pavements, away from the side-road mouths.
 for(const [z,k,id]of [[42+t*.6,-1.38,3],[68-t*.45,1.37,6]]){
  const a=blockPoint(z,k),q=worldQ(z);person(a[0],a[1],58*q,id);
 }
 for(const [z,sg]of [[17,-1],[63,1],[156,-1]])cityDrain(z,sg);
}
function villageCentre(){
 villageQuad(14,77,-1.64,-4.25,night?'#69726b':'#c8c2ae');
 for(let z=14;z<77;z+=5)line([blockPoint(z,-1.64),blockPoint(z,-4.25)],'#969c7e55',Math.max(.5,worldQ(z)));
 for(let k=-1.7;k>-4.25;k-=.22)line([blockPoint(14,k),blockPoint(77,k)],'#e5deca88',.7);
 const p=blockPoint(34,-2.19),q=worldQ(34);villageSquare(p[0],p[1],88*q,31);
 // Two residents in conversation near the paved approach.
 for(const [z,k,id]of [[27,-1.94,5],[30,-1.95,7]]){
  const a=blockPoint(z,k),ss=58*worldQ(z);person(a[0],a[1],ss,id);
 }
 for(const [z,k]of [[18,-3.45],[64,-3.65]]){
  const a=blockPoint(z,k),qq=worldQ(z);planter(a[0],a[1],58*qq,z);tree(a[0],a[1],93*qq,z);
 }
 // A small cafe on the back edge of the square.
 const cafe=blockPoint(66,-3.24),cq=worldQ(66),cs=135*cq;
 building(cafe[0],cafe[1],cs,38,'house');
 rect(cafe[0]-cs*.37,cafe[1]-cs*.34,cs*.74,cs*.11,'#6c7b69');txt('CAFÉ',cafe[0],cafe[1]-cs*.26,Math.max(5,cs*.085),'#f3e7c9','center');
 for(const zz of [54,45])streetTable(zz,-3.25,0);
 const sit=blockPoint(36,-2.95),sq=worldQ(36);
 ellipse(sit[0],sit[1]-23*sq,3.3*sq,4.4*sq,'#bc9278');
 line([[sit[0],sit[1]-18*sq],[sit[0]+3*sq,sit[1]-8*sq],[sit[0]+11*sq,sit[1]-8*sq],[sit[0]+12*sq,sit[1]]],'#576c78',Math.max(1.2,5*sq));
 // Litter bin belongs to the square, away from the walkway.
 const bin=blockPoint(18,-1.82),bq=worldQ(18);rect(bin[0]-5*bq,bin[1]-19*bq,10*bq,19*bq,'#617d6d');ellipse(bin[0],bin[1]-19*bq,5*bq,2*bq,'#385948');
}
function villageGardenExtras(z,id,sg){
 const gate=sg*2.45,q=worldQ(z),p=blockPoint(z+12,gate),s=146*worldQ(z+12);
 if(id%3===0){
  // A low garage shares the plot with the house.
  const gx=p[0]+sg*s*.62,gy=p[1];
  rect(gx-s*.20,gy-s*.33,s*.40,s*.33,night?'#687268':'#c4c6af');
  poly([[gx-s*.23,gy-s*.33],[gx,gy-s*.47],[gx+s*.23,gy-s*.33]],night?'#5b5550':'#927365');
  rect(gx-s*.15,gy-s*.28,s*.30,s*.28,night?'#53625b':'#8d9d8c');
  for(let j=1;j<5;j++)line([[gx-s*.14,gy-s*.28+j*s*.055],[gx+s*.14,gy-s*.28+j*s*.055]],'#63776f',Math.max(.5,s*.006));
 }
 if(id%3===1){
  villageQuad(z+2,z+17,sg*2.9,sg*3.35,night?'#5a583d':'#9a845e');
  for(let zz=z+3;zz<z+16;zz+=3)for(let k=2.96;k<3.32;k+=.10){
   const a=blockPoint(zz,sg*k),qq=worldQ(zz);ellipse(a[0],a[1]-2*qq,3*qq,2.4*qq,'#597c44');
  }
 }
 // Flower border near the gate and a house number on its post.
 for(let j=0;j<6;j++){
  const a=blockPoint(z-5,gate+sg*(.30+j*.07)),qq=worldQ(z-5);
  line([[a[0],a[1]],[a[0],a[1]-6*qq]],'#678957',Math.max(.5,qq));
  ellipse(a[0]+Math.sin(t*1.4+j)*qq,a[1]-6*qq,2*qq,1.5*qq,['#d3a36b','#c87e77','#d4c787'][j%3]);
 }
 const num=blockPoint(z-7,gate-sg*.20,21);
 rect(num[0]-4*q,num[1]-4*q,8*q,6*q,'#476a78');txt(String(2+mod(id,18)),num[0],num[1]+q,Math.max(3,5*q),'#f1edda','center');
 // Window boxes, gutters and a water butt belong to individual garden plots.
 if(id%2===0){
  for(const dx of [-.26,.20]){
   rect(p[0]+dx*s,p[1]-s*.31,s*.16,s*.035,night?'#6d604e':'#a87b61');
   for(let j=0;j<4;j++)ellipse(p[0]+(dx+.02+j*.035)*s,p[1]-s*.33,s*.018,s*.022,['#bd8b7d','#cfb47e','#b2bd83'][mod(id+j,3)]);
  }
 }
 line([[p[0]-s*.47,p[1]-s*.50],[p[0]-s*.47,p[1]]],night?'#647068':'#9daba0',Math.max(.5,s*.012));
 if(id%4===1){rect(p[0]+s*.48,p[1]-s*.18,s*.10,s*.18,'#6f8b78');ellipse(p[0]+s*.53,p[1]-s*.18,s*.05,s*.016,'#7c9680');}
 if(id===19){
  const a=blockPoint(z+5,sg*2.93),ss=54*worldQ(z+5);
  person(a[0],a[1],ss,17);const yy=a[1]-ss*.38;
  rect(a[0]+ss*.1,yy,ss*.13,ss*.09,'#7f9270');
  line([[a[0]+ss*.22,yy+ss*.03],[a[0]+ss*.33,yy+ss*.05]],'#7f9270',Math.max(.6,ss*.025));
  for(let j=0;j<3;j++)line([[a[0]+ss*.33,yy+ss*.06+j*ss*.02],[a[0]+ss*.35,yy+ss*.1+j*ss*.02]],'#acd5cf',.7);
 }
}
function villageOutskirts(q,id,sg){
 const z=distance()+50/q-50,p=blockPoint(z+7,sg*2.9),ss=158*worldQ(z+7);
 villageQuad(z-10,z+39,sg*1.67,sg*5,night?'#44583a':'#a0ad68');
 if(mod(id,3)===0)farmPlot(p[0],p[1],ss*.8,id);
 else if(mod(id,3)===1){crops(p[0],p[1],ss*1.18,id);if(sg<0)tractor(p[0]-ss*.48,p[1],ss*.55);}
 else{
  fence(p[0],p[1],ss*1.3);
  for(let j=0;j<3;j++)animal(p[0]+(j-1)*ss*.37,p[1],ss*.44,id+j,j===1?'sheep':'cow');
 }
}
function schoolPlot(z,id,sg){
 const front=z-7,back=z+37,k0=sg*1.69,k1=sg*4.18;
 villageQuad(front,back,k0,k1,night?'#565f4b':'#b8b595');
 const a=blockPoint(z+24,sg*2.5),q=worldQ(z+24),s=165*q;
 building(a[0],a[1],s,id,'school');
 // A dedicated courtyard in front of the building.
 villageQuad(front+4,z+20,sg*1.92,sg*3.65,night?'#656653':'#d0c3a0');
 for(let zz=front+7;zz<z+16;zz+=3)villageQuad(zz,zz+2.5,sg*2.85,sg*3.07,night?'#a7a68b':'#e4dcc2');
 for(const k of [k0,k1]){
  for(let zz=front;zz<=back;zz+=3)line([blockPoint(zz,k),blockPoint(zz,k,28)],night?'#889b85':'#7f9682',Math.max(.7,worldQ(zz)));
  line([blockPoint(front,k,28),blockPoint(back,k,28)],'#6d897c',Math.max(1,worldQ(front)*2));
 }
 for(const [a,b]of [[1.69,2.25],[2.70,4.18]]){
  for(let k=a;k<b;k+=.10)line([blockPoint(front,sg*k),blockPoint(front,sg*k,28)],'#80917e',Math.max(.6,worldQ(front)));
  line([blockPoint(front,sg*a,28),blockPoint(front,sg*b,28)],'#6b8476',Math.max(1,worldQ(front)*2));
 }
 for(let k=2.25;k<=2.70;k+=.075)line([blockPoint(front,sg*k),blockPoint(front,sg*k,31)],'#5d8074',Math.max(.8,worldQ(front)*1.5));
 for(const [zz,kk,id] of [[z+6,2.12,10],[z+11,3.28,12]]){
  const p=blockPoint(zz,sg*kk);person(p[0],p[1],42*worldQ(zz),id,true);
 }
 // Small separate play area behind the school boundary.
 villageQuad(z+1,z+31,sg*5.17,sg*6.33,night?'#4e6745':'#9eb579');
 villageQuad(z+7,z+11,sg*4.96,sg*5.46,night?'#7c7d68':'#c7c2a6');
 const pp=blockPoint(z+15,sg*5.73);park(pp[0],pp[1],140*worldQ(z+15),id);
}
function villageWell(z,k){
 const q=worldQ(z),p=blockPoint(z,k),x=p[0],y=p[1],s=48*q;
 ellipse(x,y,s*.57,s*.13,night?'#777d69':'#b9b8a2');
 rect(x-s*.45,y-s*.37,s*.90,s*.37,night?'#777c68':'#c4bda4');
 ellipse(x,y-s*.37,s*.46,s*.12,night?'#9a9a7c':'#d4cbb0');ellipse(x,y-s*.37,s*.31,s*.075,night?'#31433f':'#5c7978');
 for(const sg of [-1,1])line([[x+sg*s*.35,y-s*.30],[x+sg*s*.35,y-s*.96]],'#89795c',Math.max(.8,q*3));
 poly([[x-s*.60,y-s*.94],[x,y-s*1.23],[x+s*.60,y-s*.94]],night?'#5a594c':'#98775d');
 line([[x,y-s*.96],[x,y-s*.47]],'#8b8c71',Math.max(.5,q));rect(x-s*.07,y-s*.54,s*.14,s*.12,'#7c8c82');
}
function villageSmallLife(){
 if(scene!=='village')return;
 villageWell(62,-1.94);
 // A shopper leaves the bakery with a small paper bag.
 const z=157+Math.sin(t*.18)*3,a=blockPoint(z,-1.38),q=worldQ(z),s=58*q;
 person(a[0],a[1],s,16);rect(a[0]+s*.11,a[1]-s*.37,s*.13,s*.15,'#c8b28d');
 // A person walks a dog on the pavement at a safe distance from the side entrance.
 const dz=59+t*.5,dp=blockPoint(dz,1.37),dq=worldQ(dz),ds=57*dq;
 person(dp[0],dp[1],ds,21);
 const dog=blockPoint(dz+4,1.38),bob=Math.sin(t*5)*2*dq;
 ellipse(dog[0],dog[1]-8*dq,10*dq,5*dq,'#92775d');ellipse(dog[0]+8*dq,dog[1]-12*dq,4*dq,4*dq,'#92775d');
 for(const dx of [-6,5])line([[dog[0]+dx*dq,dog[1]-6*dq],[dog[0]+dx*dq+bob,dog[1]]],'#735d4c',Math.max(.7,2*dq));
 line([[dp[0]+ds*.12,dp[1]-ds*.37],[dog[0]+6*dq,dog[1]-10*dq]],'#7a8e82',Math.max(.5,dq));
}
function villageHomePlot(q,id,sg){
 const z=distance()+50/q-50,kind=id===21?11:id===22?8:mod(id,12);
 if(z>275){villageOutskirts(q,id,sg);return;}
 if(id===20&&sg<0){villageCentre();return;}
 if(id===19&&sg>0){schoolPlot(z,id,sg);return;}
 const edge=sg*1.69,back=sg*3.52,gate=sg*2.45;
 const g0=z-7,g1=z+35;
 poly([blockPoint(g0,edge),blockPoint(g1,edge),blockPoint(g1,back),blockPoint(g0,back)],night?'#334b35':['#87a86c','#8fae77','#7b9d65'][mod(id,3)]);
 const base=blockPoint(z+12,gate),bq=worldQ(z+12),s=146*bq;
 // A visible path joins the gate to the house entrance.
 poly([blockPoint(g0,gate-sg*.12),blockPoint(z+12,gate-sg*.12),blockPoint(z+12,gate+sg*.12),blockPoint(g0,gate+sg*.12)],night?'#686d61':'#c9c0a4');
 if(kind===6)church(base[0],base[1],s*.78,id);
 else if(kind===11)building(base[0],base[1],s*.9,id,'town');
 else if(kind===8)shop(base[0],base[1],s*.84,id,'bakery');
 else if(kind===1)villageSquare(base[0],base[1],s*.77,id);
 else building(base[0],base[1],s*(.83+rnd(id)*.12),id,'house');
 // Fence sections leave a central opening occupied by a separate gate.
 const height=26;
 for(const [a,b] of [[edge,gate-sg*.20],[gate+sg*.20,back]]){
  line([blockPoint(g0,a,height),blockPoint(g0,b,height)],night?'#7b8980':'#a5ae9d',Math.max(.8,q*1.7));
  line([blockPoint(g0,a,8),blockPoint(g0,b,8)],night?'#7b8980':'#a5ae9d',Math.max(.7,q));
  for(let j=0;j<=9;j++){const k=a+(b-a)*j/9;line([blockPoint(g0,k),blockPoint(g0,k,height)],night?'#79897d':'#adb3a0',Math.max(.6,q));}
 }
 for(const k of [gate-sg*.20,gate+sg*.20]){
  const a=blockPoint(g0,k),b=blockPoint(g0,k,height+5);
  line([a,b],night?'#838e7f':'#c3bca5',Math.max(1,q*4));
 }
 const angle=mod(id,5)===2?(1-Math.cos(t*.5))*.48:0;
 for(const side of [-1,1]){
  const hinge=gate+sg*side*.19;
  for(let j=0;j<=3;j++){
   const reach=.19*j/3,kk=hinge-sg*side*reach*Math.cos(angle),zz=g0+reach*20*Math.sin(angle);
   line([blockPoint(zz,kk),blockPoint(zz,kk,height-2)],'#5f7970',Math.max(.8,q*1.5));
  }
  line([blockPoint(g0,hinge,height-2),blockPoint(g0+.19*20*Math.sin(angle),hinge-sg*side*.19*Math.cos(angle),height-2)],'#5f7970',Math.max(1,q*2));
 }
 for(const k of [edge,back]){
  const a=blockPoint(g0,k),b=blockPoint(g1,k),aa=blockPoint(g0,k,18),bb=blockPoint(g1,k,18);
  line([aa,bb],night?'#647d60':'#7e936f',Math.max(1,q*2));
  for(let zz=g0;zz<=g1;zz+=6)line([blockPoint(zz,k),blockPoint(zz,k,18)],'#92a180',Math.max(.7,worldQ(zz)));
 }
 if([19,21,22].includes(id)){
  villageQuad(z-3,z+7,sg*2.75,sg*3.36,night?'#697666':'#b7b7a0');
  parkedPocket(z+3,sg*3.05,['#80999a','#a9b0a5','#9b7463'][mod(id,3)]);
 }
 const bush=blockPoint(z+3,sg*3.23);tree(bush[0],bush[1],39*q,id,true);
 if(mod(id,3)===0){const a=blockPoint(z+24,sg*3.15);tree(a[0],a[1],75*worldQ(z+24),id);}
 villageGardenExtras(z,id,sg);
 const mail=blockPoint(g0,gate+sg*.28,20);rect(mail[0]-4*q,mail[1]-5*q,8*q,6*q,'#748d81');
}
function villageLandscape(){
 if(scene!=='village')return;
 // Individual patches sit behind the established residential parcels.
 const gardens=[
 {z0:108,z1:168,k0:-3.65,k1:-7.4,col:'#829c64',orchard:true},
 {z0:175,z1:241,k0:3.65,k1:7.8,col:'#91a472',orchard:true},
 {z0:51,z1:98,k0:3.65,k1:7.4,col:'#9aab79',orchard:false},
 {z0:185,z1:248,k0:-3.65,k1:-7.8,col:'#99ab75',orchard:false}
 ];
 for(const g of gardens){
  if(g.z1-distance()< -15)continue;
  villageQuad(g.z0,g.z1,g.k0,g.k1,night?'#344d38':g.col);
  // A low stone wall runs along the rear gardens.
  const a=blockPoint(g.z0,g.k0),b=blockPoint(g.z1,g.k0),aa=blockPoint(g.z0,g.k0,14),bb=blockPoint(g.z1,g.k0,14);
  poly([a,b,bb,aa],night?'#626c5b':'#b8b7a0');line([aa,bb],night?'#85907a':'#d2cfb6',Math.max(1,worldQ(g.z0)*2));
  for(let z=g.z0;z<g.z1;z+=7){
   const qq=worldQ(z),xy=blockPoint(z,g.k0,7);line([[xy[0]-6*qq,xy[1]],[xy[0]+6*qq,xy[1]]],night?'#69735f':'#959e85',Math.max(.5,qq));
  }
  const sg=Math.sign(g.k0);
  // Meandering garden access, on the outside of residential plots.
  const path=[];for(let z=g.z0;z<=g.z1;z+=8)path.push(blockPoint(z,g.k0+sg*(.44+Math.sin(z*.08)*.13)));
  line(path,night?'#6c705b':'#c7bfa4',Math.max(1,worldQ(g.z0)*12));
  if(g.orchard){
   const list=[];for(let j=0;j<7;j++){const z=g.z0+10+j*6,k=g.k0+sg*(1.05+rnd(j+g.z0)*1.55);list.push({z,k,j});}
   list.sort((a,b)=>b.z-a.z);
   for(const o of list){const pp=blockPoint(o.z,o.k),qq=worldQ(o.z);tree(pp[0],pp[1],(57+rnd(o.j)*19)*qq,o.j+13);
    for(let j=0;j<3;j++)ellipse(pp[0]+(rnd(o.j*7+j)-.5)*29*qq,pp[1]-(37+rnd(o.j+j)*16)*qq,2*qq,2*qq,'#c4a064');
   }
  }else{
   // Small vegetable strips avoid a single blank green surface.
   const z=g.z0+12,kk=g.k0+sg*1.1;
   villageQuad(z,z+22,kk,kk+sg*1.1,night?'#575844':'#a48f65');
   for(let zz=z+2;zz<z+22;zz+=4)for(let k=0;k<5;k++){
    const pp=blockPoint(zz,kk+sg*(.12+k*.2)),qq=worldQ(zz);ellipse(pp[0],pp[1]-2*qq,3*qq,2.2*qq,'#567744');
   }
  }
  // Sparse bushes soften plot edges.
  for(const z of [g.z0+3,g.z1-4]){const pp=blockPoint(z,g.k1),qq=worldQ(z);tree(pp[0],pp[1],48*qq,z,true);}
 }
 // A garden shed behind a home, well away from the secondary street.
 const sp=blockPoint(72,4.6),sq=worldQ(72),sw=52*sq,sh=39*sq;
 rect(sp[0]-sw/2,sp[1]-sh,sw,sh,night?'#655c48':'#a58c65');
 poly([[sp[0]-sw*.57,sp[1]-sh],[sp[0],sp[1]-sh-24*sq],[sp[0]+sw*.57,sp[1]-sh]],night?'#4a5149':'#777d68');
 rect(sp[0]-6*sq,sp[1]-26*sq,12*sq,26*sq,'#78876f');
 // A winding hedge outlines the outer residential gardens.
 for(const sg of [-1,1])for(let j=0;j<15;j++){
  const z=80+j*10,pp=blockPoint(z,sg*(3.6+.12*Math.sin(j))),qq=worldQ(z);
  if(sg>0&&z>92&&z<115)continue;
  tree(pp[0],pp[1],29*qq,j+30,true);
 }
}
function villageBackdrop(){
 if(scene!=='village')return;
 // A few distant hills provide a continuous horizon behind the settlement.
 const far=[[-20,HZ-2],[90,HZ-10],[210,HZ-26],[340,HZ-14],[460,HZ-8],[610,HZ-25],[745,HZ-20],[870,HZ-8],[980,HZ-18],[980,HZ+20],[-20,HZ+20]];
 poly(far,night?'#304740':'#91a99a');
 const near=[[-20,HZ+8],[100,HZ-1],[230,HZ+2],[355,HZ-5],[480,HZ+5],[620,HZ-8],[745,HZ-4],[900,HZ+5],[980,HZ],[980,HZ+20],[-20,HZ+20]];
 poly(near,night?'#3b5141':'#89a07e');
 // Irregular clusters of trees behind the last houses.
 for(let j=0;j<19;j++){
  if(j%6===2||j%6===3)continue;
  const x=j*56+Math.sin(j*5)*22;if(Math.abs(x-W*.46)<27)continue;
  tree(x,HZ+7+Math.sin(j)*4,12+rnd(j)*10,j);
 }
}
function villageStreetUnion(rectangles,sg,col,edgeColor){
 const zs=[...new Set(rectangles.flatMap(r=>[r[0],r[1]]))].sort((a,b)=>a-b);
 const ks=[...new Set(rectangles.flatMap(r=>[r[2],r[3]]))].sort((a,b)=>a-b);
 const occupied=Array.from({length:zs.length-1},(_,zi)=>Array.from({length:ks.length-1},(_,ki)=>{
  const z=(zs[zi]+zs[zi+1])/2,k=(ks[ki]+ks[ki+1])/2;
  return rectangles.some(r=>z>r[0]&&z<r[1]&&k>r[2]&&k<r[3]);
 }));
 for(let zi=0;zi<zs.length-1;zi++)for(let ki=0;ki<ks.length-1;ki++){
  if(!occupied[zi][ki])continue;
  villageQuad(zs[zi],zs[zi+1],sg*ks[ki],sg*ks[ki+1],col);
  if(!edgeColor)continue;
  const z0=zs[zi],z1=zs[zi+1],k0=sg*ks[ki],k1=sg*ks[ki+1];
  if(!occupied[zi-1]?.[ki])line([blockPoint(z0,k0),blockPoint(z0,k1)],edgeColor,Math.max(.6,worldQ(z0)));
  if(!occupied[zi+1]?.[ki])line([blockPoint(z1,k0),blockPoint(z1,k1)],edgeColor,Math.max(.6,worldQ(z1)));
  if(!occupied[zi]?.[ki-1])line([blockPoint(z0,k0),blockPoint(z1,k0)],edgeColor,Math.max(.6,worldQ(z0)));
  if(!occupied[zi]?.[ki+1])line([blockPoint(z0,k1),blockPoint(z1,k1)],edgeColor,Math.max(.6,worldQ(z0)));
 }
}
function villageLanes(){
 if(scene!=='village')return;
 for(const sg of [-1,1]){
  const entry=sg<0?131:103,rectangles=[[entry-7,entry+7,1.0,4.955]];
  for(const k of [4.80,8.20,11.60])rectangles.push([k===4.80?entry-7:167,670,k-.155,k+.155]);
  for(const [z0,z1]of [[167,185],[246,259],[358,370],[470,484],[615,630]])rectangles.push([z0+2,z1-2,3.35,14.0]);
  // One joined pavement surface, followed by one joined carriageway.
  villageStreetUnion(rectangles.map(([z0,z1,k0,k1])=>[z0-1.8,z1+1.8,Math.max(1,k0-.085),k1+.085]),sg,night?'#718073':'#c3c4b0');
  villageStreetUnion(rectangles,sg,villageWet()?(night?'#34494e':'#718688'):(night?'#3b494c':'#7a8785'),night?'#a3afa1':'#e0ddc9');
 }
}
function villageRemoteHousing(){
 if(scene!=='village')return;
 const homes=[];
 for(const sg of [-1,1])for(let row=0;row<5;row++)for(let col=0;col<6;col++){
  if(row===0&&col===4)continue;
  const z=[204,284,391,512,660][row]+(rnd(row*23+col*5+sg)*26-13),k=sg*(3.95+col*1.70),id=row*13+col*3+(sg<0?2:0);
  homes.push({z,k,id,row,col,sg});
 }
 // Streetlights share the same depth ordering as the houses.
 for(const sg of [-1,1]){
  for(const k of [4.80,8.20,11.60])for(const z of [181,269,379,492,638]){
   homes.push({z,k:sg*(k+.20),id:Math.round(k*10)+z,isLamp:true,sg});
  }
  for(const z of [176,252,364])for(const k of [6.30,10.0,13.30]){
   homes.push({z:z+5,k:sg*k,id:Math.round(k*10)+z,isLamp:true,sg});
  }
 }
 homes.sort((a,b)=>b.z-a.z);
 for(const home of homes){
  if(home.isLamp){
   const q=worldQ(home.z),a=blockPoint(home.z,home.k);
   if(q>0&&a[0]>-30&&a[0]<W+30){
    lamp(a[0],a[1],80*q,home.sg);
    if(night){
     const headX=a[0]-home.sg*80*q*.19,headY=a[1]-80*q;
     light(headX,headY,24*q,'#ffdc9855');
     ellipse(headX,headY+q,2.8*q,1.8*q,'#ffe8b4');
     ellipse(a[0]-home.sg*13*q,a[1],36*q,7*q,'#f0d59655');
    }
   }
   continue;
  }
  const {z,k,id,row,col,sg}=home,q=worldQ(z),pt=blockPoint(z,k),size=(125+rnd(id)*38)*q;
  if(pt[0]< -90||pt[0]>W+90||q<=0)continue;
  villageQuad(z-9,z+26,k-sg*.59,k+sg*.6,night?'#3f553c':id%3===0?'#a1af87':id%3===1?'#91a679':'#aeb594');
  // Rear gardens, driveway and low boundary wall.
  villageQuad([183,257,368,482,628][row],z+5,k-sg*.10,k+sg*.10,night?'#7a8072':'#cfc7b0');
  for(const [ka,kb]of [[k-sg*.59,k-sg*.13],[k+sg*.13,k+sg*.6]])line([blockPoint(z-9,ka),blockPoint(z-9,kb)],night?'#7d8977':'#bfbda4',Math.max(.6,q*4));
  const bw=size*.82,bh=size*(id%4===0?.74:.58),x=pt[0],y=pt[1];
  poly([[x+bw*.5,y-bh],[x+bw*.67,y-bh+size*.08],[x+bw*.67,y],[x+bw*.5,y]],night?'#59685f':'#a8aa95');
  rect(x-bw*.5,y-bh,bw,bh,night?'#7a7e6b':['#e0d3b7','#c2cbb9','#d7c6a7','#c7cdbe'][mod(id,4)]);
  poly([[x-bw*.57,y-bh],[x,y-bh-size*.30],[x+bw*.57,y-bh]],night?'#5e554d':['#a36f56','#8d7a66','#9c7e61','#7e7f6c'][mod(id,4)]);
  rect(x+bw*.24,y-bh-size*.22,size*.055,size*.17,night?'#6c6656':'#b09779');
  const floors=id%4===0?2:1;
  for(let floor=0;floor<floors;floor++)for(let j=0;j<2;j++){
   const xx=x-bw*.32+j*bw*.46,yy=y-bh+size*.13+floor*size*.25;
   rect(xx,yy,size*.12,size*.15,night?'#344c4b':'#829fa0');
   rect(xx-size*.032,yy,size*.025,size*.15,night?'#586b5e':['#6e8270','#758a8a','#927b66'][mod(id,3)]);
  }
  rect(x-size*.045,y-size*.22,size*.09,size*.22,night?'#3e5048':'#8a8c74');
  if(id%3===0){const tr=blockPoint(z+18,k+sg*.42);tree(tr[0],tr[1],size*.65,id);}
  if(id%4===1){const shed=blockPoint(z+15,k-sg*.4);rect(shed[0]-size*.14,shed[1]-size*.2,size*.28,size*.2,night?'#665e49':'#a6926f');}
 }

}
function villagePavement(){
 if(scene!=='village')return;
 for(const sg of [-1,1]){
  for(let n=Math.floor((roadTravel+15)/7)-4;n<Math.floor((roadTravel+15)/7)+62;n++){const z=n*7-shift();if(z-distance()< -15||z-distance()>420)continue;
   const a=blockPoint(z,sg*1.08),b=blockPoint(z,sg*1.59);line([a,b],night?'#8d9a8a44':'#7c897866',Math.max(.5,worldQ(z)*.8));
  }
  for(const k of [1.30,1.53]){const a=blockPoint(distance()-10,sg*k),b=blockPoint(distance()+500,sg*k);line([a,b],night?'#a9b0a144':'#d8d9c799',.8);}
  for(let n=Math.floor((roadTravel-45)/54)-1;n<Math.floor((roadTravel-45)/54)+11;n++){const z=45+n*54+(sg<0?24:0)-shift();const rel=z-distance();if(rel< -20||rel>450||(sg>0&&z>94&&z<112))continue;const a=blockPoint(z,sg*1.14);lamp(a[0],a[1],105*worldQ(z),sg);}
 }
}
const originalScenery5=scenery;
scenery=function(q,id,sg){
 if(scene==='campagne'){
  // Farms will be reviewed separately from the pasture preview.
  return;
 }
 if(scene==='village'){villageHomePlot(q,id,sg);return;}
 if(scene==='ville')return;
 const z=distance()+50/q-50;
 if(scene==='autoroute'&&sg>0&&z>185&&z<330)return;
 originalScenery5(q,id,sg);
};
const road5=drawRoad;
drawRoad=function(){road5();if(scene==='ville'||scene==='village'){
 // Continuous, wide sidewalks directly below the street facades.
 band(-1.60,-1.07,night?'#687474':'#b3b6aa');band(1.07,1.60,night?'#687474':'#b3b6aa');roadLine(-1.07,night?'#bbc7bd':'#d9d8c7',3);roadLine(1.07,night?'#bbc7bd':'#d9d8c7',3)
}};
function restArea(){if(scene!=='autoroute')return;
 const d=distance(),near=Math.max(192,d-28),far=308;if(near>=far)return;
 // An exit slip lane branches away from our carriageway to an independent car park.
 const strip=[[156,1.05],[186,1.5],[220,2.35],[247,2.35],[205,1.7],[173,1.05]].filter(p=>p[0]-d> -29).map(p=>{const a=fieldPoint(p[0],p[1]);return[a.x,a.y]});
 if(strip.length>2)poly(strip,night?'#35454c':'#78827b');
 groundPatch(near,far,1.80,3.7,night?'#3c4d50':'#8a938a');
 for(const z of [200,222,244,266,288]){if(z-d< -25)continue;const q=worldQ(z);for(const k of [1.95,2.55,3.15]){
  const a=fieldPoint(z,k),b=fieldPoint(z+13,k);line([[a.x,a.y],[b.x,b.y]],night?'#b9c5b266':'#d8d9c4',Math.max(.6,q*1.2));
 }}
 const parked=[{z:227,k:2.15,id:1},{z:251,k:2.7,id:0},{z:275,k:2.1,id:2},{z:290,k:3.1,id:3}];
 for(const car of parked.sort((a,b)=>b.z-a.z)){if(car.z-d< -22)continue;rearTraffic(worldQ(car.z),car.k,car.id)}
 const z=299,q=worldQ(z);if(q>.09&&q<1.5){const p=fieldPoint(z,2.75),s=172*q;
  rect(p.x-s*.54,p.y-s*.55,s*1.08,s*.55,night?'#637578':'#c6c8b5');rect(p.x-s*.59,p.y-s*.59,s*1.18,s*.07,night?'#4f6569':'#6b8587');
  for(const a of [-.30,.06]){rect(p.x+a*s,p.y-s*.32,s*.23,s*.32,night?'#2a4851':'#648991');ellipse(p.x+(a+.19)*s,p.y-s*.15,s*.009,s*.009,'#d0cfc0')}
  rect(p.x-s*.45,p.y-s*.48,s*.9,s*.12,'#34718a');txt('WC  ·  EAU',p.x,p.y-s*.39,Math.max(4,s*.072),'#fff','center');
  if(night||dusk)light(p.x,p.y-s*.4,s*.28,'#f4e0a724');
 }
 for(const [zz,k]of [[260,3.6],[308,2.2],[315,3.7]]){
  if(zz-d< -22||zz-d>400)continue;const q=worldQ(zz),p=fieldPoint(zz,k),s=82*q;
  tree(p.x,p.y,s*1.35,zz);bench(p.x-s*.6,p.y,s*.6);rect(p.x-s*.15,p.y-s*.25,s*.55,s*.035,night?'#7e785e':'#b8a276');for(const a of [-.04,.3])line([[p.x+a*s,p.y-s*.22],[p.x+a*s,p.y]],'#7a8069',s*.025)
 }
 // A separate rest-area marker, at a different longitudinal position from destinations.
 const sq=worldQ(165);if(sq>.12&&sq<1.6){const p=fieldPoint(165,2.35),w=125*sq,h=123*sq,top=p.y-h-25*sq;
  line([[p.x,p.y],[p.x,top+h]],'#a3b4bb',Math.max(1,4*sq));rect(p.x-w/2,top,w,h,'#29638e');c.strokeStyle='#e0e9df';c.lineWidth=Math.max(1,2*sq);c.strokeRect(p.x-w*.47,top+3*sq,w*.94,h-6*sq);
  txt('P',p.x,top+51*sq,Math.max(7,48*sq),'#fff','center');txt('AIRE DE',p.x,top+74*sq,Math.max(4,14*sq),'#fff','center');txt('REPOS',p.x,top+93*sq,Math.max(4,16*sq),'#fff','center');txt('WC · EAU',p.x,top+112*sq,Math.max(4,12*sq),'#fff','center')
 }
}
// Low, planted right-side sign: one fixed world point, one monotone projection.
gantry=function(){if(scene!=='autoroute')return;const q=worldQ(235);if(q<.11||q>1.62)return;
 const p=P(q,1.90),w=286*q,h=140*q,bottom=p.y-21*q,top=bottom-h;
 for(const sg of [-1,1])line([[p.x+sg*w*.33,p.y],[p.x+sg*w*.33,bottom]],night?'#91a5af':'#a4b8bc',Math.max(1,5*q));
 const g=c.createLinearGradient(0,top,0,bottom);g.addColorStop(0,night?'#25557e':'#2b6da2');g.addColorStop(1,night?'#214768':'#285d89');rect(p.x-w*.5,top,w,h,g);c.strokeStyle='#e4eee8';c.lineWidth=Math.max(1,2*q);c.strokeRect(p.x-w*.5+5*q,top+5*q,w-10*q,h-10*q);
 rect(p.x-w*.42,top+12*q,48*q,22*q,'#ad4c49');txt('A35',p.x-w*.42+24*q,top+28*q,Math.max(4,17*q),'#fff','center');txt('STRASBOURG',p.x+10*q,top+58*q,Math.max(5,26*q),'#fff','center');line([[p.x-w*.43,top+70*q],[p.x+w*.43,top+70*q]],'#b8cfda',Math.max(.6,q));txt('SORTIE 6 · ILLKIRCH',p.x,top+96*q,Math.max(5,19*q),'#fff','center');txt('2 km',p.x-18*q,top+123*q,Math.max(5,21*q),'#fff','center');line([[p.x+51*q,top+116*q],[p.x+95*q,top+116*q],[p.x+83*q,top+105*q]],'#fff',Math.max(1,3*q));line([[p.x+95*q,top+116*q],[p.x+83*q,top+127*q]],'#fff',Math.max(1,3*q))
};
const originalHud5=hud;
hud=function(names,val,zone){originalHud5(names,val,zone);rect(0,33,430,18,'#111e2c');txt('ÉTUDE 05 · SIGNALISATION DE DÉMONSTRATION',22,44,10,'#9dabb8');rect(420,BOT,W-420,H-BOT,'#111e2c');txt(scene==='ville'?'Immeubles · tours · trottoirs · piétons en mouvement':'Panneau planté à droite · aire de repos · accès séparé',W-20,H-12,10,'#8ea4af','right')};

// Axial chase camera: the rear-view car and its own lane share one vertical axis.
const projectionBefore6=P;
P=function(q,k=0){if(scene!=='autoroute')return projectionBefore6(q,k);return{x:W*.52+300*q*(k-.815),y:HZ+(BOT-HZ)*q}};
function downArrow(x,y,s){
 poly([[x-s*.12,y-s*.38],[x+s*.12,y-s*.38],[x+s*.12,y+s*.02],[x+s*.39,y-s*.14],[x+s*.40,y+s*.05],[x,y+s*.43],[x-s*.40,y+s*.05],[x-s*.39,y-s*.14],[x-s*.12,y+s*.02]],'#f6f7e9')
}
gantry=function(){if(scene!=='autoroute')return;const z=145,q=worldQ(z);if(q<.08||q>2.15)return;
 // Supports at the central divider and the outside guardrail; no structure over opposing traffic.
 const left=P(q,.095),right=P(q,1.115),beam=HZ-30*q,top=HZ-194*q;
 const w=right.x-left.x-10*q,x=left.x+5*q,h=164*q;
 line([[left.x,left.y],[left.x,beam+4*q],[right.x,beam+4*q],[right.x,right.y]],night?'#869ba9':'#a6b8c0',Math.max(1,6*q));
 line([[left.x,beam-3*q],[right.x,beam-3*q]],night?'#a9bdc8':'#d0dbdc',Math.max(.7,3*q));
 const gradient=c.createLinearGradient(0,top,0,top+h);gradient.addColorStop(0,night?'#1c5285':'#1972b4');gradient.addColorStop(1,night?'#17446e':'#17639e');rect(x,top,w,h,gradient);c.strokeStyle='#dce8e6';c.lineWidth=Math.max(1,2*q);c.strokeRect(x+3*q,top+3*q,w-6*q,h-6*q);
 for(let j=1;j<9;j++)line([[x+4*q,top+j*h/9],[x+w-4*q,top+j*h/9]],night?'#456d8930':'#0b4e7824',Math.max(.3,q*.5));
 const mid=x+w/2;
 // The labels and destinations reproduce the user's reference as simulated data.
 if(roadRef)rect(mid-52*q,top-25*q,46*q,23*q,'#b13c3a');if(euroRef)rect(mid+3*q,top-25*q,53*q,23*q,'#248560');
 txt(roadRef,mid-29*q,top-7*q,Math.max(4,18*q),'#fff','center');txt(euroRef,mid+29*q,top-7*q,Math.max(4,18*q),'#fff','center');
 txt(panelName,mid,top+35*q,Math.max(5,28*q),'#fff','center');txt('',mid,top+69*q,Math.max(5,28*q),'#fff','center');txt('',mid,top+103*q,Math.max(5,28*q),'#fff','center');
 for(const k of [.33,.815]){const a=P(q,k);downArrow(a.x,top+137*q,35*q)}
};
function crossing6(z){const rel=z-distance();if(rel< -28||rel>450)return;const q=worldQ(z),farq=worldQ(z+3.4);
 for(let j=-5;j<=5;j++){const k=j*.155,a=P(q,k),b=P(q,k+.09),aa=P(farq,k),bb=P(farq,k+.09);poly([[a.x,a.y],[b.x,b.y],[bb.x,bb.y],[aa.x,aa.y]],night?'#d1d5bc':'#f3efe1')}
 // A stop line on the lane approaching the crossing.
 if(z-9-distance()>-28){const a=fieldPoint(z-9,.07),b=fieldPoint(z-9,1.0),aa=fieldPoint(z-8.65,.07),bb=fieldPoint(z-8.65,1.0);poly([[a.x,a.y],[b.x,b.y],[bb.x,bb.y],[aa.x,aa.y]],night?'#d1d5bc':'#f3efe1')}
}
function signal6(z,crossing,sg){const rel=z-distance();if(rel< -28||rel>450)return;const q=worldQ(z),p=P(q,sg*1.21),s=173*q;
 const remaining=crossing-distance()-5.4;
 // Demonstration phase: red at a distance, green during passage, amber after it.
 const state=remaining>55?0:remaining>-20?2:1;
 const stem=night?'#7e9196':'#8a9b9b',x=p.x-sg*9*q,y=p.y;
 line([[p.x,y],[p.x,y-s*.91],[x,y-s*.91]],stem,Math.max(1,s*.026));
 rect(x-s*.075,y-s*1.05,s*.15,s*.45,'#15252b');c.strokeStyle='#c5cfc4';c.lineWidth=Math.max(.5,s*.007);c.strokeRect(x-s*.075,y-s*1.05,s*.15,s*.45);
 for(let i=0;i<3;i++){const yy=y-s*(.98-i*.14),active=state===i,col=active?['#f35a48','#f0c65c','#69d2a3'][i]:'#35434a';rect(x-s*.068,yy-s*.059,s*.136,s*.026,'#0d1b22');ellipse(x,yy,s*.047,s*.044,col);if(active&&(night||dusk))light(x,yy,s*.17,col+'36')}
 // Driver-height repeater signal, matching the main signal.
 rect(p.x-s*.035,y-s*.43,s*.07,s*.17,'#17272f');for(let i=0;i<3;i++)ellipse(p.x,y-s*(.405-i*.045),s*.019,s*.018,state===i?['#f35a48','#f0c65c','#69d2a3'][i]:'#35434a');
}
const cityRoadPrior=drawRoad;
drawRoad=function(){
 cityRoadPrior();if(scene!=='ville')return;
 for(const sg of [-1,1]){
  const inner=sg*1,outer=sg*6;
  poly([blockPoint(103,inner),blockPoint(126,inner),blockPoint(126,outer),blockPoint(103,outer)],night?'#35434a':'#6c7778');
  for(const zz of [103,126]){
   line([blockPoint(zz,sg*1.12),blockPoint(zz,outer)],night?'#a6afa3':'#d5d5c6',2);
  }
  // A pavement corner is set back from the through lane.
  for(const [zz,zout]of [[103,98],[126,132]]){
   poly([blockPoint(zz,sg*1.07),blockPoint(zout,sg*1.07),blockPoint(zout,sg*1.6),blockPoint(zz,sg*1.6)],night?'#687474':'#b3b6aa');
  }
  for(let kk=1.7;kk<5.8;kk+=.65)line([blockPoint(114.5,sg*kk),blockPoint(114.5,sg*(kk+.3))],'#dddccc',1);
 }
};
const villageRoadBefore=drawRoad;
drawRoad=function(){
 villageRoadBefore();if(scene!=='village')return;
 for(const sg of [-1,1]){
  const entry=sg<0?131:103;if(entry-distance()< -15)continue;
  villageQuad(entry-7,entry+7,sg*1.0,sg*1.73,night?'#35434b':'#778581');
  for(const zz of [entry-7,entry+7])line([blockPoint(zz,sg*1.07),blockPoint(zz,sg*1.73)],night?'#abb6a7':'#d3d1bd',Math.max(.8,worldQ(zz)*2));
 }
 
 
 
};
const roadBefore6=drawRoad;
drawRoad=function(){roadBefore6();if(scene==='ville'){crossing6(112);crossing6(285)}};
function trafficSignals6(){if(scene!=='ville')return;for(const [z,crossing]of [[277,285],[104,112]])for(const sg of [-1,1])signal6(z,crossing,sg)}
const hudBefore6=hud;
hud=function(names,val,zone){hudBefore6(names,val,zone);rect(0,33,430,18,'#111e2c');txt('ÉTUDE 06 · SIGNALISATION DE DÉMONSTRATION',22,44,10,'#9dabb8');rect(420,BOT,W-420,H-BOT,'#111e2c');txt(scene==='ville'?'Feux · passages piétons · trottoirs animés':'Panneau en hauteur · axe de conduite aligné',W-20,H-12,10,'#8ea4af','right')};



worldSigns=function(){
 const entry=worldQ(22);
 if(panelName && ['ville','village'].includes(scene) && entry>=.1 && entry<=1.6)townSign(entry,panelName);
 if(!liveLimit)return;
 const z=Math.floor(roadTravel/230)*230+110-shift(),q=worldQ(z);
 if(q<.13||q>1.6)return;
 const p=P(q,1.35);sign(p.x,p.y,145*q,liveLimit,zone30);
};
const liveGantry=gantry;gantry=function(){if(panelName)liveGantry()};

let liveLimit=0,zone30=false,panelName='',roadRef='',euroRef='';
function villageWet(){return scene==='village'&&/^(pluie|orage)$/.test(roadKind().wx);}
function villageWetRoad(){
 if(!villageWet())return;
 c.save();
 const vertices=[P(0,-1.03),P(1.55,-1.03),P(1.55,1.03),P(0,1.03)];
 c.beginPath();vertices.forEach((v,i)=>i?c.lineTo(v.x,v.y):c.moveTo(v.x,v.y));c.closePath();c.clip();
 const g=c.createLinearGradient(0,HZ,0,BOT);
 g.addColorStop(0,night?'#55717b15':'#bed3d51e');g.addColorStop(.6,night?'#91acb921':'#d0e0df22');g.addColorStop(1,night?'#6d87922b':'#aec8ce2e');
 rect(0,HZ,W,BOT-HZ,g);
 // Warm reflections below the roadside lights.
 for(const sg of [-1,1])for(let n=0;n<10;n++){
  const z=45+n*54+(sg<0?24:0),rel=z-distance();if(rel<0||rel>360)continue;
  const q=worldQ(z),p=blockPoint(z,sg*.96);
  const glow=c.createLinearGradient(0,p[1],0,p[1]+80*q);
  glow.addColorStop(0,night?'#ffe2a16b':'#d9dfd238');glow.addColorStop(1,'#e9d8af00');
  poly([[p[0]-9*q,p[1]],[p[0]+9*q,p[1]],[p[0]+17*q,p[1]+80*q],[p[0]-17*q,p[1]+80*q]],glow);
  for(let j=0;j<6;j++){const y=p[1]+(9+j*10)*q;line([[p[0]-12*q,y],[p[0]+11*q,y]],night?'#ecd4a92b':'#d0dad22b',Math.max(.5,q));}
 }
 // Small rain ripples stay on the surface of the road.
 for(let j=0;j<19;j++){
  const z=18+rnd(j+73)*160,k=(rnd(j+15)-.5)*1.85,q=worldQ(z),p=blockPoint(z,k),r=(t*.8+rnd(j))%1;
  c.strokeStyle=night?'#b9d7df36':'#e2eae050';c.lineWidth=Math.max(.5,q);c.beginPath();c.ellipse(p[0],p[1],(3+r*9)*q,(.5+r*1.7)*q,0,0,7);c.stroke();
 }
 c.restore();
}
function villageRain(){
 if(!villageWet())return;
 // 7.38 : la pluie elle-même est dessinée pour tous les paysages par weatherFront738.
}
const fountainStill=villageSquare;
villageSquare=function(x,y,s,id){
 fountainStill(x,y,s,id);
 for(let j=0;j<2;j++){
  const r=(t*.45+j*.43)%1;c.strokeStyle='#d4e7d95c';c.lineWidth=Math.max(.45,s*.007);
  c.beginPath();c.ellipse(x,y-s*.07,s*(.04+r*.19),s*(.012+r*.032),0,0,7);c.stroke();
 }
};
// 7.36 : chaque boucle commence par une approche sans élément unique. Les
// éléments de la boucle suivante arrivent ainsi depuis l'horizon au lieu de
// remplacer d'un coup ceux de la boucle précédente.
const LOOP736={autoroute:1120,campagne:330,foret:450,village:400,ville:400},LEAD736={autoroute:300,campagne:0,foret:560,village:300,ville:660};
function loopMetres(metres,sc){const loop=LOOP736[sc]??400,lead=LEAD736[sc]??0;return mod(metres,loop+lead)-lead;}
let blendCanvas=null;
// 7.38 : soleil, lune et étoiles à leur place réelle. Hauteur selon l'heure et la
// position GPS (SunCalc), direction par rapport au cap de la voiture : un astre situé
// derrière la voiture n'apparaît pas devant. Sans GPS ni cap : vue vers le sud.
let skyCache738=null,heading738=null;
// Lumière dorée quand le soleil réel est à moins de 7° au-dessus de l'horizon (matin et soir).
function duskNow738(sky){
 if(window.SunCalc&&window.RoadSky719&&typeof loc!=='undefined'&&loc&&Number.isFinite(loc.lat)&&Number.isFinite(loc.lon))return SunCalc.getPosition(RoadSky719.now(),loc.lat,loc.lon).altitude*180/Math.PI<7;
 return !!(sky&&sky.hour>=17&&sky.hour<21);
}
function skyBodies738(){
 if(!window.RoadSky719||!RoadSky719.enabled())return;
 const wx=roadKind().wx;if(/^(pluie|orage|brouillard|neige)$/.test(wx))return;
 const date=RoadSky719.now(),p=typeof loc!=='undefined'&&loc&&Number.isFinite(loc.lat)&&Number.isFinite(loc.lon)?loc:null;
 if(p&&Number.isFinite(p.brg)&&p.brg>=0&&(p.spd||0)>5)heading738=p.brg;
 const key=[Math.floor(date.getTime()/5000),p?p.lat.toFixed(2):'',p?p.lon.toFixed(2):'',heading738==null?'':Math.round(heading738/2)].join('|');
 if(!skyCache738||skyCache738.key!==key){
  const bodies=[];
  if(window.SunCalc&&p){
   const ill=SunCalc.getMoonIllumination(date);
   for(const [kind,q] of [['sun',SunCalc.getPosition(date,p.lat,p.lon)],['moon',SunCalc.getMoonPosition(date,p.lat,p.lon)]]){
    const az=(q.azimuth*180/Math.PI+180+360)%360,alt=q.altitude*180/Math.PI;   // SunCalc : azimut compté depuis le sud
    const rel=heading738==null?az-180:((az-heading738+540)%360)-180;
    if(alt<-1.5||Math.abs(rel)>100)continue;
    bodies.push({kind,x:W*(.5+rel/210),alt,frac:ill.fraction,waxing:ill.phase<.5});
   }
  }else{
   const h=date.getHours()+date.getMinutes()/60;
   if(h>=6&&h<=20)bodies.push({kind:'sun',x:W*(.08+.84*(h-6)/14),alt:55*Math.sin(Math.PI*(h-6)/14)});
   if(h>=19||h<=7){const u=((h>=19?h-19:h+5))/12;bodies.push({kind:'moon',x:W*(.08+.84*u),alt:40*Math.sin(Math.PI*u),frac:.6,waxing:true});}
  }
  skyCache738={key,bodies,stars:Array.from({length:34},(_,i)=>({x:rnd(i+700)*W,y:TOP+4+rnd(i+760)*(HZ-TOP-30),a:.25+rnd(i+820)*.55}))};
 }
 const cloudy=wx==='nuages';
 if(night&&!cloudy)for(const st of skyCache738.stars){c.globalAlpha=st.a*(.75+.25*Math.sin(t*1.7+st.x));c.fillStyle='#e8eeff';c.fillRect(st.x,st.y,1.1,1.1);}
 c.globalAlpha=1;
 // Le canevas n'a pas la même échelle en largeur et en hauteur : compenser pour des disques ronds.
 const m=c.getTransform(),k=m.d?m.a/m.d:1;
 for(const b of skyCache738.bodies){
  // Au-dessus des collines lointaines tant que l'astre est levé ; il passe derrière en se couchant.
  const sun=b.kind==='sun',r=sun?10:8,base=HZ-30,y=b.alt>=0?base-(base-TOP-14)*Math.min(1,b.alt/50):base-b.alt*9,low=b.alt<10;
  c.save();c.globalAlpha=cloudy?.6:(!sun&&!night?.5:1);
  const g=c.createRadialGradient(b.x,y,r*.4,b.x,y,r*(sun?(low?6:4.5):3));
  g.addColorStop(0,sun?(low?'#ffb26a88':'#fff1b070'):'#dfe8ff40');g.addColorStop(1,sun?(low?'#ffb26a00':'#fff1b000'):'#dfe8ff00');
  c.translate(b.x,y);c.scale(1,k);c.translate(-b.x,-y);
  c.fillStyle=g;c.fillRect(b.x-r*6,y-r*6,r*12,r*12);
  if(sun){c.fillStyle=low?'#ffcd7c':'#fff4cc';c.beginPath();c.arc(b.x,y,r,0,7);c.fill();}
  else{
   // Phase : disque éclairé, puis ombre décalée du côté sombre (croissant ou gibbeuse).
   c.beginPath();c.arc(b.x,y,r,0,7);c.clip();
   c.fillStyle=low?'#f4d3a0':'#f2f3ea';c.fillRect(b.x-r,y-r,2*r,2*r);
   const shift=2*r*Math.max(0,Math.min(1,b.frac));
   c.fillStyle=night?'#1a2840':'#a9c6dc';c.globalAlpha*=.92;
   c.beginPath();c.arc(b.x+(b.waxing?-shift:shift),y,r*1.02,0,7);c.fill();
  }
  c.restore();
 }
}
// 7.38 : ciel selon la hauteur réelle du soleil (nuit, heure bleue, lever ou coucher,
// lumière dorée, jour) et selon la météo (voile gris plus ou moins épais).
function hexRgb738(h){h=String(h).replace('#','');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16));}
const mixRgb738=(a,b,u)=>a.map((v,i)=>Math.round(v+(b[i]-v)*u)),rgb738=a=>'rgb('+a.join(',')+')',clamp738=(x,a,b)=>Math.max(a,Math.min(b,x));
let sunCache738=null;
function sunState738(){
 if(!window.SunCalc||!window.RoadSky719||!RoadSky719.progressive()||RoadSky719.mode()==='clock')return null;
 const p=typeof loc!=='undefined'&&loc&&Number.isFinite(loc.lat)&&Number.isFinite(loc.lon)?loc:null;if(!p)return null;
 if(Number.isFinite(p.brg)&&p.brg>=0&&(p.spd||0)>5)heading738=p.brg;
 const date=RoadSky719.now(),key=[Math.floor(date.getTime()/5000),p.lat.toFixed(2),p.lon.toFixed(2),heading738==null?'':Math.round(heading738/2)].join('|');
 if(sunCache738&&sunCache738.key===key)return sunCache738.v;
 const q=SunCalc.getPosition(date,p.lat,p.lon),az=(q.azimuth*180/Math.PI+180+360)%360,alt=q.altitude*180/Math.PI;
 const rel=heading738==null?az-180:((az-heading738+540)%360)-180;
 sunCache738={key,v:{alt,rel}};return sunCache738.v;
}
// Météo du moment : type, intensité (code WMO d'Open-Meteo) et part du ciel couverte.
function wxInfo738(){
 const wx=roadKind().wx,code=typeof weather!=='undefined'&&weather&&Number.isFinite(Number(weather.c))?Number(weather.c):-1;
 const o={wx,code,rain:0,snow:0,storm:false,fog:0,cover:0};
 if(wx==='pluie'){o.rain=code>=51&&code<=57?.35:code===61||code===80?.5:code===65||code===82||code===67?1:.75;o.cover=.95;}
 else if(wx==='orage'){o.rain=code>=96?1:.85;o.storm=true;o.cover=1;}
 else if(wx==='neige'){o.snow=code===71||code===85||code===77?.45:code===75||code===86?1:.7;o.cover=.9;}
 else if(wx==='brouillard'){o.fog=code===48?1:.85;o.cover=.95;}
 else if(wx==='nuages')o.cover=code===3?.85:code===2?.5:code===1?.3:.6;
 return o;
}
const SKY738=[[-18,'#050b18','#0f1a2e'],[-10,'#0b1630','#1d2a4a'],[-5,'#1b2a57','#7a5a7e'],[-1.5,'#2f4683','#e98a5c'],[2,'#4a6fae','#f4b073'],[6,'#5f93c9','#f1d2a0']];
const GREY738={day:{nuages:['#8d99a6','#c3cbd2'],pluie:['#5e6a76','#9aa5ae'],orage:['#353d4b','#646e7c'],neige:['#a2abb5','#dde2e7'],brouillard:['#b3b9be','#d3d7da']},
 night:{nuages:['#0c121c','#1d2633'],pluie:['#0a0f17','#1a212c'],orage:['#07090f','#151a24'],neige:['#1a212c','#323b48'],brouillard:['#262c35','#3a414b']}};
function skyFill738(dayTop,dayBottom,oldTop,oldBottom){
 const s=sunState738(),w=wxInfo738();let top,bottom;
 if(s){
  const keys=[...SKY738,[12,dayTop,dayBottom]],alt=clamp738(s.alt,-18,12);let i=0;while(i<keys.length-2&&keys[i+1][0]<alt)i++;
  const a=keys[i],b=keys[i+1],u=clamp738((alt-a[0])/(b[0]-a[0]),0,1);
  top=mixRgb738(hexRgb738(a[1]),hexRgb738(b[1]),u);bottom=mixRgb738(hexRgb738(a[2]),hexRgb738(b[2]),u);
 }else{top=hexRgb738(oldTop);bottom=hexRgb738(oldBottom);}
 const m=w.wx==='nuages'?w.cover*.75:w.wx==='pluie'?.9:w.wx==='orage'?1:w.wx==='neige'?.85:w.wx==='brouillard'?.95:0;
 if(m>0&&GREY738.day[w.wx]){
  const f=s?clamp738((s.alt+8)/14,0,1):(night?0:1),dg=GREY738.day[w.wx],ng=GREY738.night[w.wx];
  top=mixRgb738(top,mixRgb738(hexRgb738(ng[0]),hexRgb738(dg[0]),f),m);bottom=mixRgb738(bottom,mixRgb738(hexRgb738(ng[1]),hexRgb738(dg[1]),f),m);
 }
 const g=c.createLinearGradient(0,TOP,0,HZ);g.addColorStop(0,rgb738(top));g.addColorStop(1,rgb738(bottom));return g;
}
// Lueur du lever ou du coucher, du côté du soleil, puis astres, puis nuages devant eux.
function sky738(){
 const s=sunState738(),w=wxInfo738();
 if(s&&s.alt>-9&&s.alt<12&&w.cover<.9){
  const strength=Math.max(0,1-Math.abs(s.alt-.5)/9.5)*(1-w.cover*.85),behind=Math.abs(s.rel)>100;
  if(strength>.02){
   const x=behind?(s.rel>0?W*1.1:-W*.1):W*(.5+s.rel/210),a=Math.round(clamp738(strength*(behind?.45:.85),0,1)*255).toString(16).padStart(2,'0');
   const band=c.createLinearGradient(0,HZ-70,0,HZ);band.addColorStop(0,'#ffb07a00');band.addColorStop(1,'#ffb07a'+Math.round(clamp738(strength*.45,0,1)*255).toString(16).padStart(2,'0'));rect(0,HZ-70,W,70,band);
   const m=c.getTransform(),k=m.d?m.a/m.d:1;c.save();c.translate(x,HZ-6);c.scale(1,k*.55);
   const g=c.createRadialGradient(0,0,4,0,0,W*.42);g.addColorStop(0,'#ffc07c'+a);g.addColorStop(.45,'#ff9e6a'+Math.round(parseInt(a,16)*.45).toString(16).padStart(2,'0'));g.addColorStop(1,'#ff9e6a00');
   c.fillStyle=g;c.fillRect(-W*.45,-W*.45,W*.9,W*.9);c.restore();
  }
 }
 skyBodies738();
 clouds738(w,s);
}
// Nuages sur deux plans, dessinés une fois dans une image puis déplacés lentement.
const cloudSprites738=new Map();
function cloudColors738(w,s){
 const f=s?clamp738((s.alt+6)/12,0,1):(night?0:1),gold=s&&s.alt>-6&&s.alt<8&&w.cover<.9?1-Math.abs(s.alt-1)/7:0;
 const day=w.storm?['#6d7684','#454d5a']:w.rain?['#9aa3ad','#717b86']:w.snow?['#d5dbe1','#a9b2bc']:w.fog?['#c4c9cd','#a3aaaf']:w.cover>.75?['#d7dde3','#a9b4bf']:['#ffffff','#c9d3dc'];
 const nt=w.storm?['#262c38','#151a22']:w.rain||w.fog?['#2c3340','#1a1f29']:['#3a4352','#222935'];
 let light=mixRgb738(hexRgb738(nt[0]),hexRgb738(day[0]),f),shade=mixRgb738(hexRgb738(nt[1]),hexRgb738(day[1]),f);
 if(gold>0){light=mixRgb738(light,[248,196,160],clamp738(gold,0,1)*.7);shade=mixRgb738(shade,[140,120,160],clamp738(gold,0,1)*.5);}
 return [rgb738(light),rgb738(shade)];
}
// k : rapport des échelles horizontale et verticale du canevas (le décor est étiré selon la taille du widget).
function cloudSprite738(layer,w,cols,k){
 k=Math.round(clamp738(k,.2,3)*20)/20;
 const key=layer+'|'+w.wx+'|'+Math.round(w.cover*10)+'|'+cols.join()+'|'+k;let sp=cloudSprites738.get(key);if(sp)return sp;
 if(cloudSprites738.size>10)cloudSprites738.clear();
 const sx=1.5,hh=HZ-TOP,cv=document.createElement('canvas');cv.width=Math.round(W*sx);cv.height=Math.round(hh*sx);
 const g=cv.getContext('2d');if(!g)return null;g.scale(sx,sx);
 const far=layer==='far',count=Math.round((far?3:2)+w.cover*(far?9:7)),seed=far?400:470;
 if(w.cover>=.85&&!far){const d=g.createLinearGradient(0,0,0,hh*.55);d.addColorStop(0,cols[1]);d.addColorStop(1,cols[1].replace('rgb','rgba').replace(')',',0)'));g.fillStyle=d;g.fillRect(0,0,W,hh*.55);}
 for(let i=0;i<count;i++){
  const cw=(far?70:120)+rnd(seed+i)*(far?90:160),cx=(i+rnd(seed+i+40)*.8)/count*W,cy=far?hh*(.48+rnd(seed+i+80)*.25):hh*(.12+rnd(seed+i+80)*.3);
  // Base plate, sommet bombé : le gris dessous, la partie claire décalée vers le haut.
  const puffs=[];for(let j=0;j<6;j++){const bell=Math.sin(Math.PI*(j+.5)/6),rx=cw*(.12+bell*.1+rnd(seed+i*5+j)*.04);puffs.push([(j-2.5)*cw*.15,(-bell*cw*.11-rnd(seed+i*7+j)*cw*.04)*k,rx]);}
  const base=cy+cw*.03*k;
  for(const dx of [-W,0,W]){
   if(cx+dx+cw<0||cx+dx-cw>W)continue;
   g.save();g.beginPath();g.rect(cx+dx-cw,-10,cw*2,base+10);g.clip();
   for(const [col,lift]of [[cols[1],0],[cols[0],cw*.045*k]]){
    g.fillStyle=col;g.beginPath();
    for(const [ox,oy,rx]of puffs){const px=cx+dx+ox,py=cy+oy-lift;g.moveTo(px+rx,py);g.ellipse(px,py,rx,rx*.72*k,0,0,6.29);}
    g.fill();
   }
   g.restore();
  }
 }
 cloudSprites738.set(key,cv);return cv;
}
function clouds738(w,s){
 if(w.cover<=0)return;
 const ww=w,cols=cloudColors738(ww,s),m=c.getTransform(),k=m.d?m.a/m.d:1;
 for(const [layer,speed,alpha]of [['far',w.storm?5:2.2,.85],['near',w.storm?11:4.5,w.fog?.75:.95]]){
  const sp=cloudSprite738(layer,ww,cols,k);if(!sp)continue;const x=mod(t*speed,W);
  c.save();c.globalAlpha=alpha;c.drawImage(sp,x-W,TOP,W,HZ-TOP);c.drawImage(sp,x,TOP,W,HZ-TOP);c.restore();
 }
}
// Pluie, neige, brouillard et orage par-dessus le décor (tous les paysages).
let storm738={next:0,bolts:[],last:0};
function weatherFront738(cv,main){
 const w=wxInfo738();if(!w.rain&&!w.snow&&!w.fog&&!w.storm)return;
 const m=c.getTransform(),k=m.d?m.a/m.d:1,H=BOT-TOP;
 if(w.fog){
  const col=night?'#4a525d':'#c9cdd1',al=x=>Math.round(clamp738(x,0,1)*255).toString(16).padStart(2,'0');
  const g=c.createLinearGradient(0,HZ-80,0,BOT);g.addColorStop(0,col+'00');g.addColorStop(.22,col+al(.88*w.fog));g.addColorStop(.55,col+al(.5*w.fog));g.addColorStop(1,col+al(.28*w.fog));rect(0,HZ-80,W,BOT-HZ+80,g);
  for(let j=0;j<4;j++){const x=mod(rnd(j+600)*W+t*(3+j),W*1.4)-W*.2,y=HZ-10+j*26;ellipse(x,y,W*.32,14+j*5,col+al(.22*w.fog));}
 }
 if(w.storm)rect(0,TOP,W,H,night?'#02040a30':'#0b102026');
 if(w.rain){
  const n=Math.round(30+95*w.rain);c.strokeStyle=night?'#a9bdd680':'#e1e9f075';c.lineWidth=1.05;c.beginPath();
  for(let j=0;j<n;j++){const s=.7+rnd(j+300)*.6,len=(10+rnd(j+310)*10)*s,x=mod(rnd(j+320)*W*1.2-t*55*s,W*1.1)-W*.05,y=TOP+mod(rnd(j+330)*(H+len)+t*560*s,H+len)-len;c.moveTo(x,y);c.lineTo(x-len*.13,y+len);}
  c.stroke();
  if(w.rain>=.75&&!w.storm)rect(0,TOP,W,H,night?'#00000018':'#4a556014');
 }
 if(w.snow){
  const n=Math.round(60+110*w.snow);c.fillStyle=night?'#dfe6f0e0':'#ffffffeb';c.beginPath();
  for(let j=0;j<n;j++){const s=.6+rnd(j+500)*.9,r=1.6+s*2.2,x=mod(rnd(j+510)*W+Math.sin(t*.9+j)*12*s-t*9,W),y=TOP+mod(rnd(j+520)*H+t*36*s,H);c.moveTo(x+r,y);c.ellipse(x,y,r,r*k,0,0,6.29);}
  c.fill();
  const g=c.createLinearGradient(0,HZ-6,0,HZ+60);g.addColorStop(0,'#f4f7fb00');g.addColorStop(.3,night?'#cfd8e626':'#f4f7fb55');g.addColorStop(1,'#f4f7fb00');rect(0,HZ-6,W,66,g);
 }
 if(w.storm){
  if(t<storm738.last-1){storm738.next=0;storm738.bolts=[];}
  storm738.last=t;
  if(!storm738.next)storm738.next=t+1.5;
  if(t>=storm738.next){
   const twin=Math.random()<.25;
   for(let q=0;q<(twin?2:1);q++){
    const x0=W*(.08+Math.random()*.84),pts=[[x0,TOP+14]],yEnd=HZ+Math.random()*26;let x=x0;
    for(let i=1;i<=9;i++){x+=(Math.random()-.5)*36;pts.push([x,TOP+14+(yEnd-TOP-14)*i/9]);}
    const branches=[3,5].map(i=>{const p=pts[i],dir=Math.random()<.5?-1:1;return [p,[p[0]+dir*(20+Math.random()*30),p[1]+22],[p[0]+dir*(30+Math.random()*40),p[1]+46]];});
    storm738.bolts.push({t0:t+q*.18,pts,branches});
   }
   storm738.next=t+4+Math.random()*7;
   if(main&&cv&&cv.isConnected&&typeof window.thunderSound==='function')window.thunderSound(.4+Math.random()*1.6);
  }
  let flash=0;storm738.bolts=storm738.bolts.filter(b=>t-b.t0<.45);
  for(const b of storm738.bolts){
   const age=t-b.t0;if(age<0)continue;
   const a=age<.08?1:age<.14?.35:age<.22?.9:Math.max(0,1-(age-.22)/.23);flash=Math.max(flash,(age<.08?1:age<.22?.6:.25)*a);
   c.save();c.globalAlpha=a;c.lineJoin='round';
   for(const [col,width]of [[night?'#9cc4ff66':'#cfe3ff70',7],['#ffffff',2.2]]){
    c.strokeStyle=col;c.lineWidth=width;c.beginPath();b.pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));
    for(const br of b.branches){c.moveTo(br[0][0],br[0][1]);c.lineTo(br[1][0],br[1][1]);c.lineTo(br[2][0],br[2][1]);}
    c.stroke();
   }
   c.restore();
  }
  if(flash>0)rect(0,TOP,W,H,(night?'rgba(200,215,255,':'rgba(255,255,255,')+(flash*(night?.42:.26)).toFixed(3)+')');
 }
}
// Neige au sol : prés, champs et bas-côtés blanchis avant la chaussée et les objets
// (la route, les voitures, les maisons et les arbres gardent leurs couleurs).
function snowGround738(){
 const w=wxInfo738();if(!w.snow)return;
 const a=.58+.3*w.snow,col=night?'170,182,200':'241,245,250';
 const g=c.createLinearGradient(0,HZ,0,BOT);g.addColorStop(0,`rgba(${col},${(a*.55).toFixed(2)})`);g.addColorStop(.22,`rgba(${col},${a.toFixed(2)})`);g.addColorStop(1,`rgba(${col},${Math.min(.93,a+.08).toFixed(2)})`);
 rect(0,HZ-1,W,BOT-HZ+1,g);
}
window.Weather738={info:wxInfo738,sun:sunState738,storm:()=>storm738};
function renderLive(cv,T,metres,speed){metres=Number.isFinite(metres)?Math.max(0,metres):0;roadTravel=metres;
 const currentScene=roadScene(),span=(LOOP736[currentScene]??400)+(LEAD736[currentScene]??0),m=loopMetres(metres,currentScene);
 paintLive(cv,T,m,speed,currentScene,true);
 // Au bouclage, la boucle précédente continue d'avancer en s'effaçant (environ 0,8 s
 // à la vitesse affichée) au lieu d'être remplacée d'un coup par la suivante.
 const since=mod(metres,span),blend=Math.max(4,Math.min(30,(Number(speed)||0)/3.6*.8));
 window.Decors726.blending=metres>=span&&since<blend&&cv.width>0&&cv.height>0;
 if(!window.Decors726.blending)return;
 if(!blendCanvas)blendCanvas=document.createElement('canvas');
 if(blendCanvas.width!==cv.width||blendCanvas.height!==cv.height){blendCanvas.width=cv.width;blendCanvas.height=cv.height;}
 roadTravel=metres;paintLive(blendCanvas,T,m+span,speed,currentScene,false);
 const ctx=cv.getContext('2d');if(!ctx)return;const u=since/blend;
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1-u*u*(3-2*u);ctx.drawImage(blendCanvas,0,0);ctx.restore();
}
function paintLive(cv,T,metres,speed,currentScene,main){
 if(currentScene==='autoroute')return motorwayDraw(cv,T,metres,speed,main);
 if(main){
 const width=cv.clientWidth,height=cv.clientHeight;if(!width||!height)return;
 const ratio=Math.min(1.25,window.devicePixelRatio||1,window.Perf725?[.85,1,1.25][Perf725.cap()]:1.25);
 if(cv.width!==Math.round(width*ratio)||cv.height!==Math.round(height*ratio)){cv.width=Math.round(width*ratio);cv.height=Math.round(height*ratio)}
 }
 c=cv.getContext('2d');if(!c)return;if(!c.roundRect)c.roundRect=function(x,y,w,h){this.rect(x,y,w,h);return this};c.setTransform(cv.width/W,0,0,cv.height/(BOT-TOP),0,-TOP*cv.height/(BOT-TOP));
 t=T;travelled=metres;scene=currentScene;ruralSeason=productionSeason730();season740=ruralSeason;const kind=roadKind();night=!!kind.night;snowNow738=kind.wx==='neige';
 const sky=window.RoadSky719&&RoadSky719.current();dusk=!night&&duskNow738(sky);
 const fresh=window.Road723&&Road723.fresh()&&Road723.match&&Date.now()-Road723.at<60000;
 const tags=fresh?Road723.match.tags:{};liveLimit=fresh&&Number.isFinite(limit)&&limit>0&&parseMax(tags.maxspeed)===limit?limit:0;
 zone30=liveLimit===30&&/zone.*30|30.*zone/i.test(String(tags['zone:maxspeed']||tags['maxspeed:type']||''));
 const locality=fresh&&['ville','village'].includes(scene)?Place710.here(.2):null;
 panelName=locality?locality.name.toLocaleUpperCase('fr'):'';
 roadRef=fresh?String(tags.ref||'').slice(0,12):'';euroRef=fresh?String(tags['int_ref']||'').slice(0,12):'';
 const g=skyFill738('#78b2d3','#c7dce4',night?'#091526':dusk?'#747493':'#78b2d3',night?'#283e57':dusk?'#e4b38f':'#c7dce4');rect(0,TOP,W,HZ-TOP,g);sky738();rect(0,HZ,W,BOT-HZ,night?'#253d32':'#72965d');
 if(scene==='ville')rect(0,HZ,W,BOT-HZ,night?'#38464d':'#a7afa5');countrysideBackdrop();villageBackdrop();villageLandscape();villageLanes();villageRemoteHousing();cityBackdrop();if(scene==='campagne'||scene==='autoroute')landFields();ruralLandscapeAccents();ruralFarmWorld();ruralArrival();forestGround();forestLeafFloor();snowGround738();drawRoad();ruralWildEdges();villageWetRoad();restArea();if(scene==='foret')improvedForestWorld();
 const objects=[],gap=scene==='ville'?57:scene==='village'?58:90,d=distance();
 for(let n=Math.floor((d-40)/gap);n<Math.floor((d-40)/gap)+12;n++)for(const sg of [-1,1]){const z=60+n*gap+(sg<0?gap*.48:0)-d;if(z< -30||z>480)continue;objects.push({q:depthQ(z),id:n+18+(sg<0?3:0),sg})}
 objects.sort((a,b)=>a.q-b.q);for(const o of objects)scenery(o.q,o.id,o.sg);cityWorld();villagePavement();villageLivingDetails();villageSmallLife();neighbourhoodDetails();frontageDetails();cityTraffic();trafficSignals6();barriers();sameWayTraffic();worldSigns();townExit740(scene,main);gantry();if(scene!=='foret')forestAccents();
 const west=P(.92,0),east=P(.92,1);
 if(main)RoadCar731.place(cv,(west.x+east.x)/(2*W),(west.y-TOP)/(BOT-TOP),(east.x-west.x)/W);
 if((night||dusk)&&scene!=='campagne'&&scene!=='foret'){const x=P(.9,scene==='autoroute'?.815:.5).x;c.save();c.translate(x,285);c.scale(1,.42);light(0,0,100,'#fff1bb35');c.restore()}
 ruralLightPass();ruralWetAtmosphere();forestFinish();forestAir();villageRain();
 weatherFront738(cv,main);townHUD741();
 c.setTransform(1,0,0,1,0,0);
}
const ruralTreeBase=tree;
tree=function(x,y,ss,id,bush=false){
 if(scene==='campagne')ellipse(x+ss*.20,y+ss*.012,ss*.36,ss*.035,'#34492b2d');
 if(scene==='campagne'&&ruralSeason==='hiver'&&!bush){
  line([[x,y],[x,y-ss*.95]],'#746d58',Math.max(.7,ss*.045));
  for(let j=0;j<5;j++)for(const sg of [-1,1]){
   const yy=y-ss*(.3+j*.12),xx=x+sg*ss*(.24-j*.026);
   line([[x,yy+ss*.10],[xx,yy-ss*.16]],'#79715d',Math.max(.5,ss*.018));
   line([[xx,yy-ss*.16],[xx+sg*ss*.06,yy-ss*.25]],'#857d66',Math.max(.4,ss*.008));
  }
  return;
 }
 ruralTreeBase(x,y,ss,id,bush);
};
function ruralLandscapeAccents(){
 if(scene!=='campagne'||distance()>175)return;
 const gp=(z,k)=>{const p=fieldPoint(z,k);return[p.x,p.y]};
 // A separate orchard parcel between pasture and the more distant crops.
 groundPatch(190,272,-1.55,-7.6,night?'#344c35':'#81975f');
 for(const z of [255,226,198])for(let j=0;j<6;j++){
  const k=-1.85-j*.76,p=fieldPoint(z,k),q=worldQ(z),ss=(108+rnd(j+z)*18)*q;
  rect(p.x-1.7*q,p.y-ss*.45,3.4*q,ss*.45,night?'#514c38':'#82704d');
  ellipse(p.x,p.y-ss*.43,ss*.35,ss*.28,night?'#304a36':ruralSeason==='automne'?'#a79a51':ruralSeason==='hiver'?'#7d8968':'#668950');
  if(ruralSeason==='hiver'){
   for(const side of [-1,1])line([[p.x,p.y-ss*.22],[p.x+side*ss*.20,p.y-ss*.55]],'#766c53',Math.max(.6,q));
  }else for(let a=0;a<7;a++){
   const xx=p.x+(rnd(a+j)*.5-.25)*ss,yy=p.y-ss*(.30+rnd(a+51)*.29);
   ellipse(xx,yy,Math.max(.6,ss*.024),Math.max(.6,ss*.024),ruralSeason==='printemps'?'#e4d4cc':'#b48b4e');
  }
 }
 // Stream runs outside the carriageway, with a small bridge on the farm track.
 const river=[[172,-1.70],[182,-2.5],[181,-4],[168,-5.4],[179,-7.8],[193,-9],[203,-9],[190,-7.7],[179,-5.4],[192,-4],[194,-2.5],[185,-1.70]];
 poly(river.map(v=>gp(...v)),night?'#34545a':'#719ca0');
 for(let j=0;j<12;j++){
  const z=179+(j%3)*4,k=-2.1-j*.48,p=fieldPoint(z,k),q=worldQ(z);
  line([[p.x-5*q,p.y],[p.x+7*q,p.y]],night?'#a0bcb64a':'#c4d8cd88',Math.max(.5,q));
 }
 groundPatch(164,215,-3.48,-3.03,night?'#676b5b':'#b3a78c');
 const bridge=[gp(174,-3.6),gp(174,-2.95),gp(199,-2.95),gp(199,-3.6)];poly(bridge,night?'#717568':'#aca58f');
 for(const k of [-3.6,-2.95]){
  line([blockPoint(174,k,12),blockPoint(199,k,12)],'#858c78',Math.max(.8,worldQ(174)*2));
  for(const z of [174,182,190,199])line([blockPoint(z,k),blockPoint(z,k,14)],'#8d917c',Math.max(.8,worldQ(z)*2));
 }
 // Short weathered wall and irregular hedges stop before the access.
 for(let j=0;j<9;j++){
  const z=121+j*5,p=fieldPoint(z,-1.49),q=worldQ(z);rect(p.x-4*q,p.y-10*q,8*q,10*q,j%2?'#9f9e85':'#aaa58b');line([[p.x-4*q,p.y-5*q],[p.x+4*q,p.y-5*q]],'#777f66',Math.max(.4,q*.6));
 }
 for(const sg of [-1,1])for(let j=0;j<14;j++){
  const z=285+j*13,k=sg*(1.7+rnd(j+81)*.3),p=fieldPoint(z,k),q=worldQ(z);
  tree(p.x,p.y,(30+rnd(j+18)*18)*q,j+52,true);
 }
 // Three birds cross high above the fields, never in front of the car.
 for(let j=0;j<3;j++){
  const x=110+mod(t*9+j*22,240),y=HZ-29+j*4,flap=Math.sin(t*4+j)*2;
  line([[x-3,y+flap],[x,y],[x+3,y+flap]],night?'#678081':'#607974',.7);
 }
}
function ruralLightPass(){
 if(scene!=='campagne')return;
 if(dusk){
  rect(0,TOP,W,BOT-TOP,'#ba875e18');
  // 7.38 : plus de soleil décoratif fixe ; le vrai soleil (sky738) est à sa place réelle.
 }
 if(night){
  // Cool ambient light, then warm lights on the farm and beams in our lane.
  rect(0,TOP,W,BOT-TOP,'#07182a63');
  const p=fieldPoint(108,3.02),q=worldQ(108);
  for(const dx of [-.30,.30])rect(p.x+190*q*dx-4*q,p.y-190*q*.26,8*q,9*q,'#ecd49b');
  const h=fieldPoint(83,4.15),hq=worldQ(83);
  light(h.x,h.y-20*hq,43*hq,'#f3ce8055');ellipse(h.x,h.y-22*hq,2*hq,hq,'#f1d7a6');
  const nearL=blockPoint(38,.23),nearR=blockPoint(38,.82),farL=blockPoint(180,.04),farR=blockPoint(180,1.01);
  const beam=c.createLinearGradient(0,farL[1],0,nearL[1]);beam.addColorStop(0,'#fff0c900');beam.addColorStop(.4,'#fff2ce0e');beam.addColorStop(.78,'#fff3ca38');beam.addColorStop(1,'#fff3ca00');
  poly([nearL,farL,farR,nearR],beam);
 }
}
function ruralSeasonColor(col){
 if(scene!=='campagne'||ruralSeason==='ete'||typeof col!=='string')return col;
 const green=['#72965d','#81975f','#8aa16a','#91a973','#88a274','#91a366','#759154','#839761','#68944d','#548a55','#77a25e','#5c884d','#668950'];
 if(!green.includes(col))return col;
 if(ruralSeason==='printemps')return ['#83a76c','#7f9f63','#8cab77'][green.indexOf(col)%3];
 if(ruralSeason==='automne')return ['#a79b65','#968950','#b0a371'][green.indexOf(col)%3];
 return ['#8e9984','#929783','#87927d'][green.indexOf(col)%3];
}
const seasonPoly=poly,seasonRect=rect,seasonEllipse=ellipse;
poly=function(p,col){seasonPoly(p,ruralSeasonColor(col));};
rect=function(x,y,w,h,col){seasonRect(x,y,w,h,ruralSeasonColor(col));};
ellipse=function(x,y,rx,ry,col){seasonEllipse(x,y,rx,ry,ruralSeasonColor(col));};

function ruralCurve(q){
 amps();const u=Math.max(0,1-q);return curveAmp*u*u;
}
function ruralRoadHeight(q){amps();return heightAmp*q*(1-q)*4;}
function ruralPatchPoints(z0,z1,k0,k1,far0=k0,far1=k1){
 const pts=[];
 for(let j=0;j<=20;j++){const u=j/20,p=fieldPoint(z0+(z1-z0)*u,k0+(far0-k0)*u);pts.push(p);}
 for(let j=20;j>=0;j--){const u=j/20,p=fieldPoint(z0+(z1-z0)*u,k1+(far1-k1)*u);pts.push(p);}
 return pts;
}
const oldRuralRoad=drawRoad;
drawRoad=function(){
 if(scene!=='campagne'){oldRuralRoad();return;}
 for(const sg of [-1,1]){
  band(sg*1.06,sg*1.18,night?'#414d3b':'#aaa184');
  band(sg*1.18,sg*1.26,night?'#364c35':'#80955c');
 }
 oldRuralRoad();
 if(/^(pluie|orage)$/.test(roadKind().wx)){
  band(-1.04,1.04,night?'#172f3c':'#526d74');
  roadLine(-1,'#c9d0c1',1.7);roadLine(1,'#c9d0c1',1.7);
  const d=roadTravel;for(let n=Math.floor((d-20)/12);n<Math.floor((d-20)/12)+35;n++){
   const a=P(depthQ(n*12-d),0),b=P(depthQ(n*12+5-d),0);if(a.y<BOT+30&&a.y>HZ)line([[a.x,a.y],[b.x,b.y]],'#dddcc5',Math.max(.5,depthQ(n*12-d)*2));
  }
  for(let j=0;j<17;j++){
   const z=16+rnd(j+65)*130,k=(rnd(j+22)-.5)*1.8,p=fieldPoint(z,k),q=worldQ(z);
   ellipse(p.x,p.y,8*q,1.0*q,'#a6c2bd29');
  }
 }
 for(const sg of [-1,1])for(let j=0;j<65;j++){
  const z=5+j*4.3;if(z-distance()<-15)continue;const k=sg*(1.19+rnd(j+71)*.10),p=fieldPoint(z,k),q=worldQ(z);
  line([[p.x,p.y],[p.x+q*(rnd(j)-.5)*3,p.y-(2+rnd(j+7)*3)*q]],night?'#4d6543':'#6f874a',Math.max(.4,q*.6));
 }
};
function ruralArrival(){
 if(scene!=='campagne')return;
 // A second farm has a closed barn and a silo, separate from the first.
 const fz=515,fk=-4.1;
 groundPatch(495,557,-5.5,-3.0,night?'#4c5746':'#aaa58b');
 groundPatch(498,504,-4.0,-1.14,night?'#697266':'#bcb598');
 const fp=fieldPoint(fz,fk),fq=worldQ(fz);ruralBarn(fp.x,fp.y,210*fq,false);
 rect(fp.x-75*fq,fp.y-62*fq,26*fq,62*fq,'#9ba18f');ellipse(fp.x-62*fq,fp.y-62*fq,13*fq,5*fq,'#b4b6a1');
}
function ruralWetAtmosphere(){
 if(scene!=='campagne'||!/^(pluie|orage)$/.test(roadKind().wx))return;
 // Stable puddles lie inside the court, without a reflective sheet over the crops.
 for(const [z,k]of [[42,2.9],[58,3.8],[72,2.6],[91,3.7]]){
  const p=fieldPoint(z,k),q=worldQ(z);ellipse(p.x,p.y,17*q,3*q,'#78959772');line([[p.x-9*q,p.y],[p.x+9*q,p.y]],'#c5d4c25a',Math.max(.5,q));
 }
 const fog=c.createLinearGradient(0,HZ-28,0,HZ+80);fog.addColorStop(0,'#b0c5bd55');fog.addColorStop(.48,'#b0c5bd38');fog.addColorStop(1,'#b0c5bd00');rect(0,HZ-28,W,108,fog);
 for(let j=0;j<45;j++){
  const x=mod(rnd(j+13)*W-t*19,W),y=TOP+mod(rnd(j+88)*(BOT-TOP)+t*135,BOT-TOP);
  line([[x,y],[x-2,y+5+rnd(j)*4]],'#d7e5dc55',.6);
 }
}

function ruralFieldBoundary(near,far,sg,out,id){
 const a=[],b=[];
 for(let j=0;j<=30;j++){
  const u=j/30,z=near+(far-near)*u;
  const inside=sg*(1.29+.10*Math.sin(z*.035+id));
  const outside=sg*(out-u*.9+.20*Math.sin(z*.04+id*2));
  a.push(fieldPoint(z,inside));b.push(fieldPoint(z,outside));
 }
 return a.concat(b.reverse());
}
const naturalTree=tree;
tree=function(x,y,s,id,bush=false){
 if(scene!=='campagne'||ruralSeason==='hiver'){naturalTree(x,y,s,id,bush);return;}
 if(bush){
  for(let j=0;j<3;j++)ellipse(x+s*(j-1)*.16,y-s*(.13+rnd(id+j)*.08),s*(.18+rnd(j+id)*.05),s*.16,['#698449','#7d9257','#5b794c'][mod(id+j,3)]);
  return;
 }
 if(mod(id,3)===0){naturalTree(x,y,s*(.88+rnd(id)*.25),id,false);return;}
 ellipse(x+s*.21,y+s*.012,s*.40,s*.035,'#34492b2d');
 line([[x,y],[x-s*.018,y-s*.54]],'#7b7154',Math.max(.7,s*.045));
 for(const [dx,dy,rx,ry]of [[-.20,-.54,.23,.20],[.17,-.58,.25,.23],[-.05,-.75,.24,.24],[.02,-.52,.30,.22]]){
  ellipse(x+s*dx,y+s*dy,s*rx,s*ry,['#6d8951','#7b965a','#5f8051'][mod(id+Math.round(dy*10),3)]);
 }
};
const naturalAnimal=grazingAnimal;
grazingAnimal=function(x,y,s,id,cow){
 s*=.88+rnd(id+81)*.24;
 if(id%3!==2){naturalAnimal(x,y,s,id,cow);return;}
 c.save();c.translate(x,y);c.scale(id%2?-1:1,1);
 ellipse(s*.12,s*.01,s*.37,s*.035,'#3d4e343d');
 const body=cow?'#dfdccb':'#e8e1ce';
 ellipse(0,-s*.105,s*.30,s*.105,body);
 if(cow){ellipse(-s*.1,-s*.12,s*.08,s*.07,'#646859');ellipse(s*.13,-s*.10,s*.07,s*.05,'#75745d');}
 else for(let j=0;j<7;j++)ellipse((j%4-1.5)*s*.11,-s*(.10+Math.floor(j/4)*.07),s*.075,s*.06,'#eee8d7');
 line([[-s*.16,-s*.025],[-s*.02,-s*.025]],'#a8aa96',s*.027);
 const heady=-s*(.22+Math.sin(t*.6+id)*.012);
 line([[s*.20,-s*.13],[s*.25,heady]],body,s*.10);
 ellipse(s*.29,heady,s*.085,s*.075,body);ellipse(s*.34,heady+s*.04,s*.06,s*.035,'#aaa691');
 ellipse(s*.26,heady-s*.055,s*.055,s*.014,body);ellipse(s*.33,heady-s*.02,s*.008,s*.008,'#343c32');
 c.restore();
};
const detailedBarn=ruralBarn;
ruralBarn=function(x,y,s,open){
 detailedBarn(x,y,s,open);
 if(open)return;
 // Stone wings frame the wooden door; the front face remains in its own plane.
 const w=s*1.24,h=s*.34;
 for(let row=0;row<7;row++)for(const sg of [-1,1])for(let j=0;j<4;j++){
  const xx=x+sg*w*(.27+j*.055),yy=y-h+(row+.15)*h/7;
  rect(xx-w*.025,yy,w*.047,h*.11,['#aaa38d','#b7af98','#c1b69b','#9f9f89'][mod(row+j,4)]);
 }
 // Door surround and iron hinges.
 line([[x-w*.21,y],[x-w*.21,y-h*.73],[x+w*.21,y-h*.73],[x+w*.21,y]],'#c8bfa4',s*.014);
 for(const sg of [-1,1])for(const yy of [.16,.52])line([[x+sg*w*.18,y-h*yy],[x+sg*w*.09,y-h*yy]],'#686e5e',s*.008);
};
function ruralEquipment(x,y,q){
 // A parked trailer, pallet stack and coiled irrigation hose in the farm court.
 const s=110*q;
 ellipse(x+s*.12,y+s*.01,s*.62,s*.043,'#38472c26');
 poly([[x-s*.40,y-s*.25],[x+s*.28,y-s*.25],[x+s*.42,y-s*.33],[x-s*.27,y-s*.33]],'#879879');
 rect(x-s*.40,y-s*.25,s*.68,s*.18,'#768b69');
 poly([[x+s*.28,y-s*.25],[x+s*.42,y-s*.33],[x+s*.42,y-s*.14],[x+s*.28,y-s*.07]],'#5d755c');
 for(let j=0;j<5;j++)rect(x-s*.37+j*s*.13,y-s*.24,s*.012,s*.15,'#a4ae8c');
 for(const xx of [-.24,.17]){ellipse(x+s*xx,y-s*.055,s*.075,s*.075,'#35443e');ellipse(x+s*xx,y-s*.055,s*.034,s*.034,'#b2ad91');}
 line([[x-s*.40,y-s*.10],[x-s*.62,y-s*.04]],'#768071',s*.025);
 for(let row=0;row<3;row++){
  const px=x+s*.58,py=y-row*s*.035;
  for(let j=0;j<4;j++)rect(px+j*s*.05,py-s*.025,s*.038,s*.017,'#ac9370');
 }
 c.strokeStyle='#6b8262';c.lineWidth=Math.max(.7,s*.014);
 for(let j=0;j<4;j++){c.beginPath();c.ellipse(x+s*.87,y-s*.018,s*(.09-j*.015),s*(.025-j*.004),0,0,7);c.stroke();}
 line([[x+s*.96,y],[x+s*1.09,y+s*.02],[x+s*1.13,y-s*.02]],'#6b8262',Math.max(.6,s*.012));
 // Red cultivator resting on its own support feet.
 const tx=x+s*.53,ty=y+s*.10;
 line([[tx-s*.15,ty],[tx+s*.14,ty]],'#966753',s*.025);
 for(let j=0;j<5;j++)line([[tx+s*(j*.06-.13),ty],[tx+s*(j*.06-.12),ty+s*.07]],'#747b6b',s*.012);
}
function ruralWildEdges(){
 if(scene!=='campagne')return;
 // Weeds remain outside the travel lanes and crop rows.
 for(const sg of [-1,1])for(let j=0;j<160;j++){
  const z=5+rnd(j+73)*260;if(z-distance()<-15)continue;
  const k=sg*(1.32+rnd(j+90)*.21),p=fieldPoint(z,k),q=worldQ(z);
  const h=(3+rnd(j+12)*8)*q;
  line([[p.x,p.y],[p.x+Math.sin(t*.8+j)*q,p.y-h]],['#748653','#879365','#68814c'][j%3],Math.max(.4,q*.7));
  if(j%9===0)ellipse(p.x,p.y-h,1.3*q,q,['#c8bd8a','#d4c9a6','#b4aa83'][j%3]);
  if(j%13===0)ellipse(p.x+3*q,p.y,2*q,.6*q,'#9c9678');
 }
}

function forestTree(x,y,s,id){forestOrganicTree(x,y,s,id);}
function forestGround(){
 if(scene!=='foret')return;
 band(-15,-1.06,night?'#293b2e':'#7e8860');band(1.06,15,night?'#293b2e':'#7e8860');
 for(let j=0;j<620;j++){
  const z=-8+rnd(j+72)*490,k=(j%2?-1:1)*(1.18+rnd(j+39)*8),q=worldQ(z);
  if(z-distance()<-22||q<.07)continue;const p=fieldPoint(z,k);
  ellipse(p.x,p.y,(5+rnd(j)*24)*q,(1+rnd(j+6)*3)*q,night?['#334630','#4a4d342e'][j%2]:['#697b503e','#a18d624d','#82945a55','#afa27c4a'][j%4]);
  if(j%3===0){line([[p.x-3*q,p.y],[p.x+5*q,p.y-q]],night?'#615d42':'#9e8760',Math.max(.6,q));ellipse(p.x,p.y-q,1.5*q,.7*q,night?'#6e6845':'#ba9d68');}
 }
 for(const sg of [-1,1])band(sg*1.06,sg*1.16,night?'#4b4c37':'#a29573');
 for(let j=0;j<75;j++){
  const x=j*14+rnd(j+41)*9;if(Math.abs(x-W*.46)<19)continue;
  const ss=20+rnd(j+2)*25;forestTree(x,HZ+10+rnd(j)*8,ss,j+120);
 }

}
function forestFern(x,y,s,id){
 for(let j=-3;j<=3;j++){
  const tip=[x+j*s*.052,y-s*(.20-Math.abs(j)*.025)];
  bLine(x,y,tip[0],tip[1],night?'#3c5841':'#637f46',Math.max(.5,s*.013));
  if(s<20)continue; // folioles invisibles au loin
  for(let a=1;a<4;a++){
   const u=a/4,xx=x+(tip[0]-x)*u,yy=y+(tip[1]-y)*u;
   bStroke([[xx-s*.035,yy-s*.02],[xx,yy],[xx+s*.035,yy-s*.018]],night?'#456449':'#789550',Math.max(.4,s*.009));
  }
 }
 bFlush();
}
function forestLake(){
 const pts=[],shore=[];
 for(let j=0;j<64;j++){
  const a=j/64*Math.PI*2,rr=1+.08*Math.sin(a*5)+.04*Math.cos(a*9)+.025*Math.sin(a*3);
  pts.push(fieldPoint(170+56*Math.sin(a)*rr,3.4+1.35*Math.cos(a)*rr));
  shore.push(fieldPoint(170+62*Math.sin(a)*rr,3.4+1.49*Math.cos(a)*rr));
 }
 poly(shore.map(p=>[p.x,p.y]),night?'#5b6045':'#a6a081');
 poly(pts.map(p=>[p.x,p.y]),night?'#2e4d52':'#799e99');
 c.save();c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.clip();
 for(let j=0;j<30;j++){
  const z=120+rnd(j+31)*100,k=2.1+rnd(j+76)*2.4,p=fieldPoint(z,k),q=worldQ(z);
  const sway=Math.sin(t*.9+j)*2*q;
  line([[p.x-7*q+sway,p.y],[p.x+(8+rnd(j)*17)*q+sway,p.y]],night?'#a2bcb132':'#c6d5c16b',Math.max(.5,q*.9));
 }
 const center=fieldPoint(170,3.4),cq=worldQ(170);
 forestSoftPatch(center.x,center.y,155*cq,38*cq,night?'#173d4c88':'#3f77856b');
 // Broken dark reflections, clipped to the water surface.
 for(let j=0;j<10;j++){const p=fieldPoint(187+j*3,3.4+j*.06),q=worldQ(187+j*3);line([[p.x,p.y],[p.x+4*q,p.y+9*q]],night?'#182f2c36':'#436c5636',Math.max(.7,3*q));}
 c.restore();
 for(let j=0;j<20;j++){
  const a=j/20*Math.PI*2,rr=1+.08*Math.sin(a*5)+.04*Math.cos(a*9)+.025*Math.sin(a*3),z=170+62*Math.sin(a)*rr,k=3.4+1.49*Math.cos(a)*rr,p=fieldPoint(z,k),q=worldQ(z);
  if(j%3===0){poly([[p.x-8*q,p.y],[p.x-6*q,p.y-5*q],[p.x+2*q,p.y-7*q],[p.x+8*q,p.y-2*q]],night?'#697369':'#a4a592');}
  else for(let r=0;r<3;r++){
   const xx=p.x+(r-1)*3*q,hh=(13+rnd(j+r)*6)*q;
   line([[xx,p.y],[xx+Math.sin(t*.7+j)*q,p.y-hh]],night?'#657855':'#7e8f55',Math.max(.5,q));
   if(r===1)line([[xx,p.y-hh],[xx,p.y-hh+4*q]],'#9b8359',Math.max(.7,2*q));
  }
 }
}
function improvedForestWorld(){
 if(scene!=='foret')return;
 const d=distance(),items=[];
 const gp=(z,k)=>{const p=fieldPoint(z,k);return[p.x,p.y]};
 forestLake();
 // Two occasional cabins, each reached by a narrow earth footpath.
 for(const [z,k]of [[86,-2.65],[365,3.1]]){
  const sg=Math.sign(k);
  poly([[z-19,sg*1.10],[z-16,sg*1.10],[z-7,k+sg*.1],[z+1,k+sg*.1],[z+1,k-sg*.16],[z-8,k-sg*.16]].map(v=>gp(...v)),night?'#5d6046':'#b1a184');
  for(let j=0;j<8;j++){
   const zz=z-18+j*2.3,kk=sg*(1.14+j*(Math.abs(k)-1.14)/8),pp=fieldPoint(zz,kk),q=worldQ(zz);
   ellipse(pp.x,pp.y,(3+rnd(j)*3)*q,q,night?'#84725344':'#d3bd9255');
   if(j%3===0)line([[pp.x-4*q,pp.y],[pp.x+3*q,pp.y-q]],night?'#736344':'#968160',Math.max(.5,q));
  }
  items.push({z,k,id:z,s:135,type:'cabin'});
 }
 const nf=Math.floor((roadTravel-75)/25);
 for(let n=nf-1;n<nf+25;n++)for(const sg of [-1,1])for(let layer=0;layer<3;layer++){
  const id=n*19+layer*47+(sg<0?33:7),z=55+n*25+rnd(id)*22-shift(),k=sg*(1.72+layer*1.12+rnd(id+4)*.8);
  if(z-d< -16||z-d>530)continue;
  // Preserve a view over the lake and clear ground around each cabin.
  if(sg>0&&z>91&&z<245&&k<5.4)continue;
  if(sg<0&&Math.abs(z-86)<28&&Math.abs(k+2.65)<1.22)continue;
  if(sg>0&&Math.abs(z-365)<23&&Math.abs(k-3.1)<.8)continue;
  if(mod(id,11)===0)continue;
  const tp=fieldPoint(z,k),cp=fieldPoint(86,-2.65);
  const corridor=z<95&&sg<0&&Math.abs(tp.x-cp.x)<(52+75*worldQ(z));
  if(!corridor)items.push({z,k,id,s:160+rnd(id+9)*77,type:'tree'});
  if(layer===0&&n%2===0)items.push({z:z+4,k:k-sg*.15,id,s:64,type:'fern'});
  if(layer===1&&n%4===1)items.push({z:z+6,k:k+sg*.2,id,s:68,type:'shrub'});
 }
 items.push({z:17,k:-2.62,id:73,s:229,type:'tree'},{z:21,k:2.62,id:76,s:235,type:'tree'});
 for(let j=0;j<38;j++)for(const sg of [-1,1]){
  const z=8+j*7+rnd(j+72)*5,k=sg*(1.27+rnd(j+5)*1.05);
  if(sg>0&&z>100&&z<235)continue;
  items.push({z,k,id:j+80,s:46+rnd(j)*32,type:j%5===0?'shrub':'fern'});
 }
 for(const [z,k,id,kind]of [[49,-1.88,7,'deer'],[56,-2.10,8,'fawn'],[302,2.9,9,'deer'],[490,-3.4,10,'wolf']])items.push({z,k,id,s:kind==='fawn'?55:82,type:kind});
 for(const [z,k,id]of [[56,1.7,2],[107,-1.85,3],[244,2.8,4],[290,-2.4,5]])items.push({z,k,id,s:58,type:'rock'});
 items.push({z:155,k:-2.30,id:16,s:100,type:'snag'},{z:390,k:4.8,id:17,s:110,type:'snag'});
 items.push({z:72,k:-3.55,id:4,s:80,type:'log'},{z:258,k:1.9,id:5,s:38,type:'stump'});
 for(const it of items.sort((a,b)=>b.z-a.z)){
  if(it.z-d< -14||it.z-d>530)continue;
  const q=worldQ(it.z),p=fieldPoint(it.z,it.k),ss=it.s*q;
  if(p.x<-ss||p.x>W+ss)continue;
  c.save();if(q<.11)c.globalAlpha=.56;else if(q<.18)c.globalAlpha=.78;
  if(it.type==='tree')forestTree(p.x,p.y,ss,it.id);
  else if(it.type==='cabin'){
   forestCabinDetailed(p.x,p.y,ss,it.id);
   for(let j=0;j<4;j++)line([[p.x-ss*.40,p.y-ss*(.08+j*.10)],[p.x+ss*.40,p.y-ss*(.08+j*.10)]],night?'#75674855':'#c6aa7b66',Math.max(.5,ss*.006));
   rect(p.x-ss*.29,p.y,ss*.58,ss*.045,night?'#6a6d51':'#9e977b');
  }else if(it.type==='snag')forestDeadWood(p.x,p.y,ss,it.id);else if(it.type==='fern')forestFern(p.x,p.y,ss,it.id);
  else if(it.type==='shrub'){
   for(let j=0;j<3;j++)ellipse(p.x+(j-1)*ss*.17,p.y-ss*(.12+rnd(j+it.id)*.1),ss*.23,ss*.15,night?'#304b35':['#65834b','#7b9152','#6b864b'][j]);
  }else if(it.type==='log'){
   line([[p.x-ss*.40,p.y-ss*.04],[p.x+ss*.35,p.y-ss*.12]],night?'#63563e':'#8a7151',ss*.13);
   ellipse(p.x+ss*.35,p.y-ss*.12,ss*.06,ss*.065,night?'#8a7955':'#bea478');
  }else if(it.type==='stump'){
   rect(p.x-ss*.18,p.y-ss*.32,ss*.36,ss*.32,night?'#63563e':'#8a7151');ellipse(p.x,p.y-ss*.32,ss*.19,ss*.045,'#b19a72');ellipse(p.x,p.y-ss*.32,ss*.10,ss*.026,night?'#303b28':'#5b5d3e');
  }else if(it.type==='rock'){
   forestSoftPatch(p.x,p.y,ss*.44,ss*.06,night?'#3a55344d':'#657f4e88');
   poly([[p.x-ss*.4,p.y],[p.x-ss*.27,p.y-ss*.18],[p.x+ss*.02,p.y-ss*.27],[p.x+ss*.37,p.y-ss*.10],[p.x+ss*.30,p.y]],night?'#5e6d62':'#9b9f8a');
   poly([[p.x-ss*.27,p.y-ss*.18],[p.x+ss*.02,p.y-ss*.27],[p.x+ss*.17,p.y-ss*.11]],night?'#6d7a6a':'#b2b59c');
  }else{
   forestNaturalAnimal(p.x,p.y,ss,it.id,it.type);
  }
  c.restore();
 }
}
function forestFinish(){
 if(scene!=='foret')return;
 // Light atmospheric perspective softens only the distant tree line.
 const fog=c.createLinearGradient(0,HZ-12,0,HZ+40);fog.addColorStop(0,night?'#799a9c00':'#b8c9ae24');fog.addColorStop(1,'#b8c9ae00');rect(0,HZ-12,W,52,fog);
 if(night){
  const a=blockPoint(38,.18),b=blockPoint(38,.88),aa=blockPoint(165,.0),bb=blockPoint(165,1.05);
  const glow=c.createLinearGradient(0,aa[1],0,a[1]);glow.addColorStop(0,'#fff0c800');glow.addColorStop(.6,'#fff2cf2e');glow.addColorStop(1,'#fff2cf00');poly([a,aa,bb,b],glow);
 }
}

function forestOrganicTree(x,y,s,id){
 const kind=mod(id,5),lean=(rnd(id+88)-.5)*s*.10;
 const sway=Math.sin(t*.65+id)*s*.006;
 forestSoftPatch(x+s*.20,y+s*.025,s*.49,s*.045,night?'#11281e66':'#283f2940');
 const bark=kind===1?(night?'#8e9284':'#c4c4ae'):(night?'#625d49':['#837254','#8c7b5a','#786c51'][kind%3]);
 line([[x,y],[x+lean*.5,y-s*.38],[x+lean,y-s*.76]],bark,Math.max(.8,s*(kind===1?.032:.050)));
 // Détails d'écorce : un seul tracé, et seulement quand l'arbre est assez grand pour les montrer.
 const detail=s>=40;
 if(detail){for(let j=0;j<9;j++){
  const yy=y-s*(.05+j*.060),xx=x+lean*(j/14);
  bLine(xx-s*.012,yy,xx+s*.009,yy-s*.023,kind===1?'#6c78686b':'#554f3c66',Math.max(.4,s*.009));
 }
 bFlush();
 ellipse(x+lean*.3,y-s*.23,s*.017,s*.023,'#57563f');}
 for(const [dx,dy]of [[-.25,-.49],[.25,-.58],[-.12,-.80]])bLine(x+lean*.4,y-s*.35,x+lean+s*dx,y+s*dy,bark,Math.max(.5,s*.014));
 bFlush();
 if(kind===0){
  for(let j=0;j<6;j++){
   const yy=y-s*(1.02-j*.13),ww=s*(.10+j*.043);
   const pts=[[x+lean+sway,yy],[x-ww*.55+lean,yy+s*.14],[x-ww+lean,yy+s*.26],[x-ww*.20+lean,yy+s*.23],[x+ww*.8+lean,yy+s*.25],[x+ww*.55+lean,yy+s*.15]];
   poly(pts,night?['#294637','#35503b'][j%2]:['#4c704b','#5e8052'][j%2]);
  }
 }else{
  const tones=night?['#304a36','#3d5840','#456348']:kind===2?['#59784b','#6c8850','#81965b']:kind===3?['#577653','#6c8a59','#7d9861']:['#5e7e50','#749158','#8da265'];
  // Small asymmetric clusters leave gaps through which the branches remain visible.
  for(let cl=0;cl<9;cl++){
   const cx=x+lean+s*(rnd(id*13+cl)*.70-.35)+sway,cy=y-s*(.52+rnd(id*17+cl+9)*.38);
   const rx=s*(.12+rnd(id+cl)*.10),ry=s*(.10+rnd(cl+id*3)*.09),pts=[];
   for(let j=0;j<13;j++){const a=j/13*Math.PI*2,r=.84+rnd(id*37+cl*13+j)*.24;pts.push([cx+Math.cos(a)*rx*r,cy+Math.sin(a)*ry*r]);}
   poly(pts,tones[cl%3]);
   if(cl%3===0&&detail)line([[cx-rx*.30,cy+ry*.35],[cx+rx*.18,cy-ry*.15]],tones[0]+'66',Math.max(.45,s*.005));
  }
 }
 for(const sg of [-1,1])bLine(x,y-s*.05,x+sg*s*.11,y,bark,Math.max(.5,s*.018));
 // Moss grows at the base, leaving most of the bark visible.
 if(detail)for(let j=0;j<3;j++)bEllipse(x+s*(j-1)*.025,y-s*(.02+j*.022),s*.023,s*.016,night?'#4c6340':'#718550');
 bFlush();
}
function forestSoftPatch(x,y,rx,ry,col){
 c.save();c.translate(x,y);c.scale(1,ry/rx);
 const g=c.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,col);g.addColorStop(1,'#60794c00');
 ellipse(0,0,rx,rx,g);c.restore();
}
function forestLeafFloor(){
 if(scene!=='foret')return;
 for(let j=0;j<95;j++){
  const z=3+rnd(j+87)*410,k=(j%2?-1:1)*(1.25+rnd(j+34)*7);if(z-distance()<-16)continue;
  const p=fieldPoint(z,k),q=worldQ(z),wet=k>0&&z>95&&z<255;
  forestSoftPatch(p.x,p.y,(32+rnd(j)*42)*q,(4+rnd(j+5)*5)*q,night?'#34443188':wet?'#5a714d77':j%3?'#9e89635c':'#665c444d');
  if(!night&&j%4===0)forestSoftPatch(p.x-8*q,p.y-2*q,25*q,3.5*q,'#d9c89428');
 }
 for(let j=0;j<1900;j++){
  const z=2+rnd(j+923)*390,k=(j%2?-1:1)*(1.20+rnd(j+217)*7);if(z-distance()<-16)continue;
  const p=fieldPoint(z,k),q=worldQ(z);if(p.x< -5||p.x>W+5)continue;
  const ss=(1.5+rnd(j)*2)*q;
  bPoly([[p.x-ss,p.y],[p.x-ss*.2,p.y-ss*.6],[p.x+ss,p.y-ss*.2],[p.x+ss*.1,p.y+ss*.3]],night?'#81704c44':['#b49a6c88','#92795299','#c0a77b66','#73764788'][j%4]);
 }
 bFlush();
}
function forestCabinDetailed(x,y,s,id){
 cabin(x,y,s,id);
 // Weathered planks, a stone foot and three shallow entrance steps.
 for(let j=0;j<14;j++){
  const xx=x-s*.43+rnd(j+72)*s*.86,yy=y-s*(.08+rnd(j+81)*.40);
  line([[xx,yy],[xx+s*(.035+rnd(j)*.09),yy]],night?'#b49a6a44':'#e0c79766',Math.max(.4,s*.006));
 }
 for(let j=0;j<3;j++)rect(x-s*(.10+j*.025),y+s*j*.018,s*(.20+j*.05),s*.024,night?'#74745c':'#aaa184');
 for(let row=0;row<2;row++)for(let j=0;j<4;j++){
  const xx=x+s*(.55+j*.085),yy=y-s*(.05+row*.075);
  line([[xx-s*.035,yy],[xx+s*.04,yy-s*.014]],night?'#7c6749':'#9a7b55',s*.060);ellipse(xx+s*.04,yy-s*.014,s*.027,s*.032,night?'#a48d60':'#c4aa7d');
 }
 for(let j=0;j<7;j++)line([[x-s*.40+j*s*.12,y-s*.64],[x-s*.40+j*s*.12+s*.07,y-s*.67]],night?'#7e866955':'#b9bda177',Math.max(.5,s*.009));
}
function forestNaturalAnimal(x,y,s,id,type){
 const young=type==='fawn',wolf=type==='wolf',phase=t*.45+id;
 const dip=(Math.sin(phase)+1)/2;
 c.save();c.translate(x,y);c.scale(id%2?-1:1,1);
 ellipse(s*.10,s*.015,s*.37,s*.036,'#263c2933');
 const body=night?(wolf?'#738274':'#9b8462'):(wolf?'#92988a':young?'#bd9f73':'#aa9067');
 for(const [xx,near]of [[-.18,false],[.14,false],[-.12,true],[.20,true]]){
  const step=Math.sin(t*.6+id)*s*.008;
  line([[s*xx,-s*.22],[s*(xx+.015),-s*.10],[s*xx+step,0]],body,s*(young?.024:.030));
 }
 ellipse(0,-s*.29,s*.27,s*.13,body);
 const headx=s*(.30+dip*.09),heady=-s*(wolf?.31:.56-dip*.34);
 line([[s*.18,-s*.32],[headx,heady]],body,s*.078);
 ellipse(headx,heady,s*.085,s*.067,body);
 ellipse(headx+s*.065,heady+s*.02,s*.045,s*.025,wolf?'#5f6c60':'#80765c');
 for(const sg of [-1,1])ellipse(headx+sg*s*.05,heady-s*(.065+Math.sin(t*.8+sg+id)*.009),s*.025,s*.045,body);
 ellipse(headx+s*.035,heady-s*.01,s*.008,s*.008,'#26352b');
 if(type==='deer')for(const sg of [-1,1])line([[headx,heady-s*.065],[headx+sg*s*.065,heady-s*.20],[headx+sg*s*.10,heady-s*.23]],night?'#8d8264':'#8c7957',s*.015);
 if(young)for(let j=0;j<7;j++)ellipse(s*(rnd(j+8)*.38-.19),-s*(.26+rnd(j+27)*.10),s*.011,s*.011,'#e7d6b6');
 line([[-s*.25,-s*.30],[-s*.35,-s*.22]],body,s*(wolf?.055:.025));
 c.restore();
}
function forestDeadWood(x,y,s,id){
 const bark=night?'#625c45':'#8b7958';
 poly([[x-s*.05,y],[x+s*.06,y],[x+s*.04,y-s*.70],[x+s*.01,y-s*.77],[x-s*.02,y-s*.65]],bark);
 for(const [dx,dy]of [[-.22,-.45],[.16,-.60],[-.12,-.70]])line([[x,y-s*.27],[x+s*dx,y+s*dy]],bark,s*.025);
 ellipse(x+s*.01,y-s*.18,s*.025,s*.05,night?'#353d2c':'#545941');
}
function forestAir(){
 if(scene!=='foret')return;
 if(/^(pluie|orage)$/.test(roadKind().wx)){
  for(const [z,k]of [[72,-1.75],[80,-2.25]]){const pp=fieldPoint(z,k),q=worldQ(z);ellipse(pp.x,pp.y,9*q,1.7*q,'#8aa4a06b');}
 }

 const mist=c.createLinearGradient(0,HZ-30,0,HZ+100);
 mist.addColorStop(0,night?'#8ea8a300':'#c1cfba32');mist.addColorStop(.40,night?'#8ea8a30c':'#c1cfba22');mist.addColorStop(1,'#c1cfba00');
 rect(0,HZ-30,W,130,mist);
}

// Isolated motorway visual study. All place names and traffic below are simulated.
const MotorwayStudy={version:2};
function mq(q,k=0,h=0){
 amps();const u=Math.max(0,1-q),bend=bendAmp*u*u;
 const hill=hillAmp*4*q*(1-q);
 const bank=q>.04?6*q*Math.sin((roadTravel+50/q-50)/150)*Math.min(1,Math.max(0,Math.abs(k)-1.3)):0;
 return{x:W*.52+430*q*(k-.815)+bend,y:HZ+(BOT-HZ)*q-h*q-hill-bank};
}
function mp(z,k=0,h=0){return mq(50/(z-distance()+50),k,h);}
function mpoly(vertices,color){
 const edge=distance()-12,clipped=[];
 for(let j=0;j<vertices.length;j++){
  const a=vertices[j],b=vertices[(j+1)%vertices.length],ai=a[0]>=edge,bi=b[0]>=edge;
  if(ai)clipped.push(a);
  if(ai!==bi){const u=(edge-a[0])/(b[0]-a[0]);clipped.push([edge,a[1]+(b[1]-a[1])*u,(a[2]||0)+((b[2]||0)-(a[2]||0))*u]);}
 }
 if(clipped.length<3)return;poly(clipped.map(([z,k,h=0])=>{const p=mp(z,k,h);return[p.x,p.y];}),color);}
function mstrip(k0,k1,color,z0=distance()-8,z1=distance()+1100){
 const pts=[];for(let j=0;j<=65;j++){const z=z0+(z1-z0)*j/65;pts.push([z,k0]);}for(let j=65;j>=0;j--){const z=z0+(z1-z0)*j/65;pts.push([z,k1]);}mpoly(pts,color);
}
function mpatch(z0,z1,k0,k1,color){if(z1<distance()-12)return;mstrip(k0,k1,color,Math.max(z0,distance()-12),z1);}
function mline(k,col,width=1,h=0,z0=distance()-8,z1=distance()+1000){
 const pts=[];for(let j=0;j<=65;j++){const p=mp(z0+(z1-z0)*j/65,k,h);pts.push([p.x,p.y]);}line(pts,col,width);
}
function mvisible(z,range=700){return z-distance()>-12&&z-distance()<range;}
function mtree(x,y,s,id,bush=false){
 if(!bush){if(dusk)forestSoftPatch(x+s*.36,y+s*.025,s*.62,s*.04,'#4d513d33');forestOrganicTree(x,y,s,id);return;}
 for(let j=0;j<3;j++)ellipse(x+(j-1)*s*.15,y-s*(.11+rnd(j+id)*.09),s*.22,s*.15,night?'#3c5438':['#718b50','#82985b','#658149'][j]);
}
function mbackdrop(){
 poly([[0,HZ+16],[0,HZ-13],[110,HZ-39],[242,HZ-19],[367,HZ-25],[490,HZ-6],[660,HZ-38],[790,HZ-24],[960,HZ-43],[960,HZ+22]],night?'#273d37':dusk?'#84947c':'#a0b396');
 poly([[0,HZ+25],[0,HZ+4],[160,HZ-11],[290,HZ+8],[440,HZ+6],[610,HZ-15],[780,HZ+1],[960,HZ-11],[960,HZ+28]],night?'#314a38':'#83a073');
 for(let j=0;j<42;j++){const x=j*25+rnd(j+41)*16;if(Math.abs(x-W*.52)<24)continue;mtree(x,HZ+13,10+rnd(j)*16,j+5);}
}
function mfields(){
 for(let n=9;n>=-1;n--)for(const sg of [-1,1]){
  const a=n*118+25,b=a+102,id=n+(sg>0?5:2),stage=mod(id,4),outer=6.7+rnd(id)*1.8;
  if(b<distance()-12)continue;const near=Math.max(a,distance()-12);
  mpatch(near,b,sg*1.43,sg*outer,night?['#3d3c2c','#43503a','#365139','#4c5135'][stage]:['#9e8060','#a4a072','#819b5d','#a5a86d'][stage]);
  mpatch(b,b+9,sg*1.36,sg*(outer+.3),night?'#5d6048':'#b2a88a');
  for(let j=0;j<36;j++){
   const k=sg*(1.45+(outer-1.45)*(j+.4)/36),ps=[];
   for(let r=0;r<=12;r++){const z=near+(b-near)*r/12,p=mp(z,k+sg*.04*Math.sin(z*.025));ps.push([p.x,p.y]);}
   bStroke(ps,night?'#282c2544':'#685b3e55',Math.max(.5,worldQ(near)));
  }
  bFlush();
  if(stage>0)for(let z=Math.ceil(near/8)*8;z<b;z+=8){const q=worldQ(z);if(q<.09)continue;
   for(let j=0;j<32;j++){
    const k=sg*(1.48+(outer-1.48)*(j+.4)/32)+sg*.04*Math.sin(z*.025),p=mp(z,k),hh=[0,7,20,29][stage]*q;
    if(p.x< -20||p.x>W+20)continue;
    bLine(p.x,p.y,p.x+Math.sin(t*.8+j)*q,p.y-hh,night?'#466142':'#5d823f',Math.max(.45,q));
    if(stage>=2)for(const side of [-1,1])bLine(p.x,p.y-hh*.35,p.x+side*hh*.23,p.y-hh*.61,night?'#58734a':'#7a9b53',Math.max(.5,q*1.5));
    if(stage===3&&id%2) {bEllipse(p.x,p.y-hh,3.7*q,4*q,'#d1b66a');bEllipse(p.x,p.y-hh,1.9*q,2.3*q,'#756244');}
   }
   bFlush();
  }
  // One working tractor and its plough per bare parcel, always behind the fence.
  if(stage===0&&mod(id,3)===0){const z=a+32+mod(t*1.1+id,35);if(mvisible(z)){
   const q=worldQ(z),p=mp(z,sg*2.4),b=mp(z-7,sg*2.4);mpatch(Math.max(near,a+10),z,sg*2.27,sg*2.53,'#70573f');tractor(p.x,p.y,125*q);
   line([[p.x,p.y],[b.x,b.y]],'#7b8173',3*q);for(let j=0;j<4;j++)poly([[b.x+(j-2)*7*q,b.y-3*q],[b.x+(j-2)*7*q-4*q,b.y+4*q],[b.x+(j-2)*7*q+3*q,b.y+3*q]],'#a6ac9c');
   if(!night&&!/^(pluie|orage)$/.test(roadKind().wx))ellipse(b.x,b.y-5*q,18*q,5*q,'#c8af7833');
  }}
 }
 for(const sg of [-1,1]){
  mstrip(sg*1.26,sg*1.42,night?'#41513a':'#8da36a');
  mline(sg*1.40,night?'#627359':'#9da983',.8,11);
  for(let z=20;z<1400;z+=25){if(!mvisible(z))continue;const p=mp(z,sg*1.40),a=mp(z,sg*1.40,13);line([[p.x,p.y],[a.x,a.y]],'#8e9b7d',Math.max(.5,worldQ(z)));}
 }
}
function mroad(){
 const wet=/^(pluie|orage)$/.test(roadKind().wx);
 mstrip(-1.30,1.30,night?'#55594c':'#b1aa8d');
 mstrip(-1.24,1.24,night?'#2c3b3b':wet?'#6a7976':'#79817a');
 for(const [a,b]of [[-1.08,-.10],[.10,1.08]])mstrip(a,b,night?'#233039':wet?'#536b71':'#6b7571');
 mstrip(-.10,.10,night?'#42503a':'#879564');
 mline(-1.08,'#d1d3c0',1.7);mline(1.08,'#d1d3c0',1.7);mline(-.12,'#c4c9b6',1);mline(.12,'#c4c9b6',1);
 for(let n=Math.floor((roadTravel-12)/14);n<Math.floor((roadTravel-12)/14)+70;n++)for(const k of [-.555,.555]){
  const z=n*14-shift();if(z-distance()<-11)continue;
  mpoly([[z,k-.003],[z,k+.003],[z+6,k+.003],[z+6,k-.003]],night?'#d6d3b4':'#e7e6d5');
 }
 if(wet)for(let j=0;j<20;j++){
  const z=distance()+12+rnd(j+61)*135,k=.16+rnd(j+39)*.85,p=mp(z,k),q=worldQ(z);
  ellipse(p.x,p.y,8*q,1.2*q,'#b4ccc130');
 }
 // Subtle asphalt aggregate and occasional repaired seams, seeded in world space.
 for(let j=0;j<240;j++){
  const z=distance()+5+rnd(j+31)*180,k=(j%2?-1:1)*(.13+rnd(j+52)*.84),p=mp(z,k),q=worldQ(z);
  ellipse(p.x,p.y,q*.7,q*.25,night?'#52615d33':'#b5b7a433');
 }
 for(const z of [85,385,755,1090])if(mvisible(z)){const ps=[];for(let j=0;j<14;j++){const p=mp(z+j*.11,.13+j*.065);ps.push([p.x,p.y]);}line(ps,night?'#35423e':'#59625b',.6);}
 for(const sg of [-1,1]){
 mline(sg*1.27,night?'#374c36':'#738958',1);mline(sg*1.32,night?'#42583b':'#718955',1);
 for(let j=0;j<70;j++){const z=distance()+8+j*5,k=sg*(1.28+rnd(j+33)*.08),p=mp(z,k),q=worldQ(z);line([[p.x,p.y],[p.x+q,p.y-(2+rnd(j)*4)*q]],night?'#65774b':'#8a9c61',Math.max(.4,q*.6));}
 }
}
function mrail(k,z0=distance()-8,z1=distance()+750,concrete=false){
 mline(k+.028,'#29412b33',1.3,0,z0,z1);
 if(concrete){mstrip(k-.013,k+.013,night?'#67746e':'#aeb5a6',z0,z1);mline(k,'#c4c9b6',2,18,z0,z1);return;}
 for(const h of [12,17])mline(k,night?'#87978e':'#b6c0b3',h===17?2.1:1, h,z0,z1);
 for(let z=Math.ceil(z0/10)*10;z<z1;z+=10){const p=mp(z,k),a=mp(z,k,18),q=worldQ(z);line([[p.x,p.y],[a.x,a.y]],night?'#6b7c73':'#8c9b8b',Math.max(.5,q*2));}
}
function mbarriers(){
 mrail(-.105);mrail(.105);mrail(-1.22);
 // A deliberate gap lets the rest-area lane depart and rejoin outside the through lanes.
 for(const [a,b]of [[distance()-8,145],[365,405],[625,810],[985,distance()+750]]){const near=Math.max(distance()-8,a),far=Math.min(b,distance()+750);if(far>near)mrail(1.22,near,far);}
 for(const [a,b]of [[600,750],[1040,1130]])if(b>distance()-8)mrail(-.105,Math.max(a,distance()-8),b,true);
}
function mtrafficCar(x,y,q,id,front=false,truck=false,indicator=false){
 const van=!truck&&id%4===1,suv=!truck&&id%4===2,w=(truck?239:van?212:suv?210:198)*q,h=w*(truck?.63:van?.47:suv?.39:.34),col=['#a6b2ae','#b4a38b','#6f8d94','#a57970','#929c81'][mod(id,5)];
 ellipse(x+w*(dusk?.30:.12),y+w*.013,w*(dusk?.76:.54),w*.044,'#20362d44');
 for(const sg of [-1,1])rect(x+sg*w*.38-w*.04,y-h*.29,w*.08,h*.28,'#293b34');
 if(truck){
  rect(x-w*.43,y-h*.91,w*.86,h*.65,night?'#7d8f85':'#c5c8b5');
  poly([[x-w*.43,y-h*.91],[x-w*.27,y-h],[x+w*.48,y-h],[x+w*.43,y-h*.91]],'#a1afa0');
  for(let j=0;j<6;j++)line([[x-w*.40,y-h*(.30+j*.10)],[x+w*.40,y-h*(.30+j*.10)]],'#7d90815a',Math.max(.4,q));
  rect(x-w*.35,y-h*.27,w*.70,h*.24,col);rect(x-w*.28,y-h*.23,w*.56,h*.10,'#394d4d');
 }else{
  poly([[x-w*.46,y-h*.05],[x-w*.46,y-h*.55],[x-w*.30,y-h*.96],[x+w*.29,y-h*.96],[x+w*.45,y-h*.55],[x+w*.46,y-h*.05]],col);
  poly([[x-w*.31,y-h*.88],[x+w*.29,y-h*.88],[x+w*.36,y-h*.49],[x-w*.36,y-h*.49]],night?'#29434a':'#42646d');
  line([[x-w*.29,y-h*.92],[x+w*.28,y-h*.92]],'#d0d4c077',Math.max(.6,q*2));
  line([[x-w*.42,y-h*.36],[x+w*.42,y-h*.36]],'#d1d5c56b',Math.max(.5,q));
 }
 for(const sg of [-1,1]){
  rect(x+sg*w*.34-w*.062,y-h*.30,w*.124,h*.10,front?(night?'#f0e4b9':'#d3d9c7'):(night||dusk?'#e78b6a':'#ae6457'));
  if(indicator&&Math.sin(t*7)>0)rect(x+w*.33,y-h*.30,w*.10,h*.12,'#e7b45b');
 }
 rect(x-w*.09,y-h*.13,w*.18,h*.055,'#d5d7c4');
 if(van)line([[x,y-h*.49],[x,y-h*.15]],'#546f68',Math.max(.5,q));
 if(suv)line([[x-w*.27,y-h*.98],[x+w*.26,y-h*.98]],'#4a635e',Math.max(.5,q*2));
 if(/^(pluie|orage)$/.test(roadKind().wx)){
  for(const sg of [-1,1])line([[x+sg*w*.32,y],[x+sg*w*.32+w*.03,y+h*.11]],front?'#dce7ce26':'#c8967126',Math.max(1,w*.045));
 }

 if(front&&night)for(const sg of [-1,1])light(x+sg*w*.34,y-h*.28,w*.12,'#f5e5b32b');
 if(/^(pluie|orage)$/.test(roadKind().wx))for(let j=0;j<3;j++)ellipse(x+(j-1)*w*.22,y+q*(j+1),w*.16,q*2,'#c6d3c525');
}
function mtrafficItems(){
 const a=[];
 // Relative positions keep a safe visible gap ahead of the user's car.
 const rt=mod(t,26),u=Math.max(0,Math.min(1,(rt-7)/5)),merge=u*u*(3-2*u);
 a.push({z:distance()+55+rt*4,k:.32+merge*.50,id:2,indicator:rt>4&&rt<12});
 a.push({z:distance()+165+12*Math.sin(t*.05),k:.815,id:0},{z:distance()+310+16*Math.sin(t*.04),k:.32,id:3},{z:distance()+250+13*Math.sin(t*.03),k:.815,id:5,truck:true});
 for(let n=0;n<11;n++){
  const z=mod(95+n*102-roadTravel*.8-t*5,1122);
  if(z>0&&z<800)a.push({z:distance()+z,k:n%2?-.35:-.81,id:n+7,front:true,truck:n%5===4});
 }
 MotorwayStudy.traffic=a.map(({z,k,front,truck})=>({z,k,front:!!front,truck:!!truck}));
 return a.map(v=>({z:v.z,k:v.k,front:!!v.front,truck:!!v.truck,draw:()=>{const q=worldQ(v.z),p=mp(v.z,v.k);c.save();c.globalAlpha=Math.min(1,Math.max(0,(850-(v.z-distance()))/180));mtrafficCar(p.x,p.y,q,v.id,v.front,v.truck,v.indicator);c.restore();}}));
}
function mpanel(z,k,lines,color='#286b99',width=132){
 if(!mvisible(z,650))return;const p=mp(z,k),q=worldQ(z),w=width*q,h=(lines.length*18+15)*q,top=p.y-h-32*q;
 line([[p.x,p.y],[p.x,top+h]],'#99aa9c',Math.max(.7,3*q));rect(p.x-w/2,top,w,h,night?'#245273':color);
 c.strokeStyle='#e4e8d7';c.lineWidth=Math.max(.6,1.5*q);c.strokeRect(p.x-w*.48,top+2*q,w*.96,h-4*q);
 lines.forEach((s,i)=>txt(s,p.x,top+(19+i*18)*q,Math.max(3,14*q),'#f1f0df','center'));
}
// 7.38 : portiques réels sur l'autoroute. Le premier montre la prochaine sortie (numéro,
// villes, distance), le second la prochaine station avec le prix de ton carburant.
// Sans données (pas d'Internet, hors autoroute) : lieux proches, comme avant.
function gantryMode738(z){
 // 7.39 : avec les panneaux synchronisés, les portiques fixes du décor ne montrent plus que les lieux proches.
 if(sync739())return ['near',null];
 const hw=window.Highway738&&Highway738.signs?Highway738.signs():null,ex=hw&&hw.exit,st=hw&&hw.station;
 if(z!==90&&st)return ['station',st];if(ex)return ['exit',ex];if(st)return ['station',st];return ['near',null];
}
// 7.39 : panneaux placés à la vraie distance. Chaque seuil (5 km, 4 km… ou 2 km, 1 km, 500 m)
// fait apparaître un portique 600 m devant : on le passe quand la sortie est vraiment à cette distance.
const ev739={signs:[],done:new Set(),log:[]};
function prefs739(){return window.Highway738&&Highway738.prefs?Highway738.prefs():null;}
function sync739(){const pr=prefs739();return !!(pr&&(pr.exits||pr.stations)&&Highway738.signs&&Highway738.signs());}
function syncSigns739(main){
 const pr=prefs739(),data=pr&&Highway738.signs&&Highway738.signs();
 if(main&&data){
  const look=.6;
  const put=(kind,obj,T)=>{let S=roadTravel+look*1000;for(const g of ev739.signs)if(Math.abs(g.S-S)<140)S=g.S+140;ev739.signs.push({S,kind,T,data:Object.assign({},obj)});ev739.log.push([kind,T,Math.round(S)]);if(ev739.log.length>40)ev739.log.shift();};
  // 7.42 : une sortie (ou station) découverte entre deux distances rondes — sorties rapprochées,
  // voie rapide rejointe tard — avait tous ses panneaux sautés. Un panneau tout de suite.
  const spawn=(kind,obj,list,id)=>{const seen=kind+'|'+id+'|vu',first=!ev739.done.has(seen),rem0=obj.d-look;let made=false;ev739.done.add(seen);
  for(const T of list){
   const key=kind+'|'+id+'|'+T;if(ev739.done.has(key))continue;
   const rem=rem0;
   if(rem<=T&&rem>T-.25){ev739.done.add(key);put(kind,obj,T);made=true;}
   else if(rem<=T-.25)ev739.done.add(key);
  }
  // Seulement si aucune distance ronde ne reste à venir (sinon deux portiques côte à côte).
  if(first&&!made&&rem0>.15&&!list.some(T=>T<rem0))put(kind,obj,Math.max(.2,Math.round(rem0*10)/10));};
  const small=pr.small;
  if(pr.exits&&data.exit)spawn('exit',data.exit,(pr.every==='km'?[5,4,3,2,1]:[2,1]).concat(small?[]:[.5]),data.exit.id);
  if(pr.stations&&data.station)spawn('station',data.station,(pr.every==='km'?[10,5,4,3,2,1]:[10,5,2,1]).concat(small?[]:[.5]),data.station.id||data.station.name);
 }
 for(const g of ev739.signs)if(g.kind==='station'&&!g.passed&&g.S-roadTravel<=0){g.passed=true;hud741.station=Object.assign({},g.data);hud741.stationUntil=Date.now()+stationDur741()*1000;}
 ev739.signs=ev739.signs.filter(g=>g.S-roadTravel>-30);
 if(ev739.done.size>400)ev739.done.clear();
}
function drawSyncSigns739(){
 for(const g of ev739.signs){const z=distance()+(g.S-roadTravel);if(mvisible(z,650))mgantry(z,[g.kind,Object.assign({},g.data,{d:g.T})]);}
}
// Petit panneau dès que la sortie (ou la station) est à 500 m : affiché tout de suite en haut à
// droite de l'image, distance mise à jour, jusqu'au passage.
// 7.41 : panneaux « dans l'image ». Petits panneaux en haut, entre la vitesse et la météo
// (sortie à 500 m, prochaine station) et panneau du village à droite sous la météo.
function hudBox741(x,y,w,h,fn){const m=c.getTransform(),k=m.d?m.a/m.d:1;c.save();c.translate(x,y);c.scale(1,k);fn(w,h/k);c.restore();}
const hud741={station:null,stationUntil:0,town:null,entered:''};
function hudSlot741(fn){hudBox741(W*.335,TOP+10,W*.3,(BOT-TOP)*.13,(w,h)=>{c.fillStyle='#00000040';c.fillRect(4,5,w,h);c.fillStyle='#1f5fa8';c.fillRect(0,0,w,h);c.strokeStyle='#ffffff';c.lineWidth=h*.04;c.strokeRect(h*.06,h*.06,w-h*.12,h-h*.12);fn(w,h);});}
function smallSign739(){
 const pr=prefs739();if(!pr||!pr.small)return false;
 const data=Highway738.signs&&Highway738.signs();if(!data)return false;
 const ex=pr.exits&&data.exit&&data.exit.d<=.5&&data.exit.d>.03?data.exit:null;if(!ex)return false;
 hudSlot741((w,h)=>{const pad=h*.12,box=h*.62,x0=pad*2+box*1.05,mw=w-x0-pad;
  c.fillStyle='#ffffff';c.fillRect(pad,(h-box)/2,box*1.05,box);c.fillStyle='#1f5fa8';c.font=`bold ${box*.22}px Inter, sans-serif`;c.textAlign='center';c.fillText('SORTIE',pad+box*.525,(h-box)/2+box*.28);
  fitText738(ex.ref||'→',pad+box*.525,(h-box)/2+box*.88,box*.9,box*.56,'#1f5fa8','center');
  fitText738(String(ex.dest[0]||'Sortie'),x0,pad+h*.24,mw,h*.24,'#ffffff','left');
  fitText738(Math.max(50,Math.round(ex.d*20)*50)+' m',w-pad,h-pad*1.1,mw,h*.34,'#ffffff','right');});
 return true;
}
// Prochaine station : 10 s (réglable) avant de passer sous le portique, et 10 s après.
const stationDur741=()=>{const v=Number(store.get('station741Dur',10));return [0,5,10,20].includes(v)?v:10;};
function stationHUD741(speed){
 const X=stationDur741();if(!X)return;
 const v=Math.max(1,Number(speed)||0)/3.6;let st=null;
 for(const g of ev739.signs)if(g.kind==='station'){const rel=g.S-roadTravel;if(rel>0&&rel<=v*X){st=g.data;break;}}
 if(!st&&Date.now()<hud741.stationUntil)st=hud741.station;
 if(!st)return;
 const live=window.Highway738&&Highway738.signs&&Highway738.signs(),cur=live&&live.station&&(live.station.id||live.station.name)===(st.id||st.name)?live.station:st;
 hudSlot741((w,h)=>{const pad=h*.12,box=h*.56;pump738(pad,(h-box)/2,box);const x0=pad*2+box,mw=w-x0-pad;
  fitText738(brand742(cur.name),x0,pad+h*.24,mw,h*.24,'#ffffff','left');
  if(cur.price>0)fitText738(cur.price.toFixed(3).replace('.',',')+' €',x0,h-pad*1.1,mw*.58,h*.32,'#ffd84d','left');
  fitText738(dist738(Math.max(0,cur.d)),w-pad,h-pad*1.1,mw*.4,h*.26,'#ffffff','right');});
}
// Village ou ville : panneau à droite sous la météo, à l'entrée puis barré à la sortie.
const townDur741=()=>{const v=Number(store.get('town741Dur',10));return [0,5,10,20].includes(v)?v:10;};
function townHUD741(){
 const o=hud741.town;if(!o)return;const now=Date.now();
 if(o.until!==Infinity&&now>o.until){hud741.town=null;return;}
 const alpha=o.until===Infinity?1:Math.max(0,Math.min(1,(o.until-now)/800));
 const w=W*.32,h=(BOT-TOP)*.12;c.save();c.globalAlpha=alpha;
 hudBox741(W-w-16,TOP+(BOT-TOP)*.25,w,h,(w,h)=>{c.fillStyle='#00000040';c.fillRect(5,6,w,h);c.fillStyle='#f6f4e8';c.fillRect(0,0,w,h);c.strokeStyle='#c0392b';c.lineWidth=h*.09;c.strokeRect(h*.08,h*.08,w-h*.16,h-h*.16);
  fitText738(o.name,w/2,h*.64,w*.8,h*.42,'#1b1b1b','center');
  if(o.exit){c.strokeStyle='#c0392b';c.lineWidth=h*.1;c.beginPath();c.moveTo(w*.06,h*.88);c.lineTo(w*.94,h*.12);c.stroke();}});
 c.restore();
}
function townEnter741(name){
 if(hud741.entered===name)return;hud741.entered=name;
 const X=townDur741();hud741.town={name,exit:false,until:X?Date.now()+X*1000:Infinity};
}
function townLeave741(name){hud741.entered='';const X=townDur741()||10;hud741.town={name,exit:true,until:Date.now()+X*1000};}
window.Hud741=hud741;
const dist738=d=>d<1?Math.max(100,Math.round(d*10)*100)+' m':(Number.isInteger(d)||d>=10?String(Math.round(d)):d.toFixed(1).replace('.',','))+' km';
// Texte ajusté à la largeur disponible (espace uniforme : 1 unité en largeur = 1 en hauteur).
function fitText738(s,x,y,maxW,size,col,align='left',bold=true){
 let f=size;c.font=`${bold?'bold ':''}${f}px Inter, sans-serif`;const w=c.measureText(s).width;if(w>maxW&&w>0){f=Math.max(4,f*maxW/w);c.font=`${bold?'bold ':''}${f}px Inter, sans-serif`;}
 c.fillStyle=col;c.textAlign=align;c.textBaseline='alphabetic';c.fillText(s,x,y);return f;
}
function refChip738(r,x,y,h){
 const R=String(r).trim(),col=/^E\s?\d/.test(R)?['#2f7d4a','#fff']:/^(A|N|B|M)\s?\d/i.test(R)?['#c0392b','#fff']:/^D\s?\d/i.test(R)?['#f2c230','#1d2733']:['#ffffff','#1f5fa8'];
 c.font=`bold ${h*.72}px Inter, sans-serif`;const w=c.measureText(R).width+h*.5;
 c.fillStyle=col[0];c.fillRect(x,y,w,h);c.fillStyle=col[1];c.textAlign='center';c.textBaseline='middle';c.fillText(R,x+w/2,y+h*.54);c.textBaseline='alphabetic';return w;
}
function exitFace738(w,h,e){
 const pad=h*.09,box=h*.5;
 // Cartouche de sortie : pictogramme et numéro.
 c.fillStyle='#ffffff';c.fillRect(pad,pad,box*1.05,box);
 c.fillStyle='#1f5fa8';c.font=`bold ${box*.2}px Inter, sans-serif`;c.textAlign='center';c.fillText('SORTIE',pad+box*.525,pad+box*.27);
 if(e.ref)fitText738(e.ref,pad+box*.525,pad+box*.86,box*.95,box*.56,'#1f5fa8','center');
 else{c.strokeStyle='#1f5fa8';c.lineWidth=box*.1;c.beginPath();c.moveTo(pad+box*.3,pad+box*.88);c.lineTo(pad+box*.3,pad+box*.55);c.lineTo(pad+box*.72,pad+box*.36);c.stroke();}
 const x0=pad*2+box*1.05,maxW=w-x0-pad,lines=(e.dest.length?e.dest:['Sortie']).slice(0,2);
 // Même taille pour les deux villes : celle qui tient pour la plus longue.
 let size=h*.21;c.font=`bold ${size}px Inter, sans-serif`;for(const d of lines){const lw=c.measureText(d).width;if(lw>maxW)size=Math.min(size,size*maxW/lw);}
 lines.forEach((d,i)=>fitText738(d,x0,pad+h*.06+size*(1+i*1.12),maxW,size,'#ffffff','left'));
 const dist=dist738(e.d);c.font=`bold ${h*.19}px Inter, sans-serif`;const dw=c.measureText(dist).width;
 fitText738(dist,w-pad,h-pad*1.1,w*.3,h*.19,'#ffffff','right');
 let rx=pad+box*.95;const ch=h*.14,ry=h-pad*1.1-ch*.85;for(const r of (e.destRef||[]).slice(0,3)){c.font=`bold ${ch*.72}px Inter, sans-serif`;if(rx+c.measureText(r).width+ch*.5>w-pad-dw-ch*.3)break;rx+=refChip738(r,rx,ry,ch)+ch*.25;}
 // Flèche de sortie vers la droite.
 c.strokeStyle='#ffffff';c.lineWidth=h*.045;c.lineCap='round';const ax=pad+box*.2,ay=h-pad*1.3;c.beginPath();c.moveTo(ax,ay);c.lineTo(ax+box*.55,ay-box*.32);c.stroke();
 c.beginPath();c.moveTo(ax+box*.55,ay-box*.32);c.lineTo(ax+box*.33,ay-box*.33);c.moveTo(ax+box*.55,ay-box*.32);c.lineTo(ax+box*.47,ay-box*.12);c.stroke();c.lineCap='butt';
}
function pump738(x,y,s){
 c.fillStyle='#ffffff';c.fillRect(x,y,s,s);c.fillStyle='#1f5fa8';
 c.fillRect(x+s*.22,y+s*.18,s*.38,s*.66);c.fillStyle='#ffffff';c.fillRect(x+s*.28,y+s*.26,s*.26,s*.18);c.fillStyle='#1f5fa8';
 c.fillRect(x+s*.16,y+s*.82,s*.5,s*.06);c.fillRect(x+s*.62,y+s*.3,s*.08,s*.06);c.fillRect(x+s*.68,y+s*.3,s*.06,s*.42);c.fillRect(x+s*.6,y+s*.68,s*.14,s*.06);
}
// 7.42 : enseigne en entier (« Station U », « Carrefour Market »), raccourcie à deux mots si trop longue.
function brand742(n){n=String(n||'').trim();if(!n)return 'Station';return n.length<=18?n:n.split(/\s+/).slice(0,2).join(' ');}
function stationFace738(w,h,st){
 const pad=h*.08,box=h*.46;pump738(pad,pad,box);
 const x0=pad*2+box,mw=w-x0-pad,label={E10:'SP95-E10',GPLc:'GPL'}[st.fuel]||st.fuel;
 fitText738(brand742(st.name),x0,pad+h*.26,mw,h*.28,'#ffffff','left');
 if(st.price>0)fitText738(st.price.toFixed(3).replace('.',',')+' €',x0,pad+h*.68,mw,h*.44,'#ffd84d','left');
 else fitText738('Prix non publié',x0,pad+h*.62,mw,h*.2,'#dfe9f5','left',false);
 fitText738(label,pad,h-pad*.8,w*.28,h*.18,'#dfe9f5','left');
 fitText738('dans '+dist738(st.d),w-pad,h-pad*.8,w*.5,h*.26,'#ffffff','right');
}
function mgantry(z=90,forced){
 const [mode,data]=forced||gantryMode738(z);
 const rows=mode==='near'&&window.RoadNear728&&RoadNear728.period()?RoadNear728.closest():[];if(mode==='near'&&!rows.length||!mvisible(z,650))return;const q=worldQ(z),a=mp(z,.11),b=mp(z,1.19),aa=mp(z,.11,196),bb=mp(z,1.19,196);
 line([[a.x,a.y],[aa.x,aa.y],[bb.x,bb.y],[b.x,b.y]],night?'#8c9e98':'#a7b7ae',Math.max(1,6*q));
 const top=mp(z,.13,304),right=mp(z,1.17,304),bottom=mp(z,.13,196),w=right.x-top.x,h=bottom.y-top.y;
 rect(top.x,top.y,w,h,night?'#235e8d':'#2577ad');c.strokeStyle='#e4ebde';c.lineWidth=Math.max(.7,2*q);c.strokeRect(top.x+3*q,top.y+3*q,w-6*q,h-6*q);
 const mid=top.x+w*.5;
 const tags=window.Road723&&Road723.fresh()&&Road723.match?Road723.match.tags:{};
 const ref=String(tags.ref||'').slice(0,10),er=String(tags['int_ref']||'').slice(0,10);
 if(ref){rect(mid-52*q,top.y-22*q,45*q,20*q,'#a14e48');txt(ref,mid-30*q,top.y-7*q,Math.max(4,15*q),'#fff','center');}
 if(er){rect(mid+1*q,top.y-22*q,49*q,20*q,'#498a68');txt(er,mid+25*q,top.y-7*q,Math.max(4,15*q),'#fff','center');}
 if(mode!=='near'&&w>8){
  const m=c.getTransform(),k=m.d?m.a/m.d:1;
  c.save();c.translate(top.x+4*q,top.y+4*q);c.scale(1,k);
  if(mode==='exit')exitFace738(w-8*q,(h-8*q)/k,data);else stationFace738(w-8*q,(h-8*q)/k,data);
  c.restore();
 }else if(mode==='near'){
 txt('À PROXIMITÉ',mid,top.y+19*q,Math.max(4,16*q),'#f5f4e6','center');
 rows.slice(0,2).forEach((row,i)=>txt(row.name+' · '+(row.km<.1?'<0,1':row.km.toLocaleString('fr',{maximumFractionDigits:1}))+' km',mid,top.y+(45+i*25)*q,Math.max(4,19*q),'#f5f4e6','center'));
 txt('à vol d’oiseau',mid,top.y+89*q,Math.max(3,11*q),'#dce8dd','center');
 }
}
function mrestArea(){
 const d=distance();
 if(d>370)return;
 const near=Math.max(180,d-10);
 mpatch(near,345,1.70,3.8,night?'#5b685b':'#a6ad96');
 mpoly([[155,1.04],[180,1.18],[210,1.80],[315,1.80],[350,1.27],[370,1.04],[354,1.17],[312,2.01],[208,2.01],[179,1.32],[155,1.17]],night?'#35454a':'#78837a');
 for(const z of [216,241,266,291])for(const k of [2.05,2.65,3.25]){
  if(!mvisible(z))continue;const p=mp(z,k),r=mp(z+16,k);line([[p.x,p.y],[r.x,r.y]],'#d9dcc7',Math.max(.5,worldQ(z)));
 }
 for(const [z,k,id]of [[229,2.2,1],[255,2.8,2],[283,2.2,3]]){if(!mvisible(z))continue;const p=mp(z,k);mtrafficCar(p.x,p.y,worldQ(z)*.82,id);}
 for(const z of [240,282]){if(!mvisible(z))continue;const p=mp(z,3.55);mtrafficCar(p.x,p.y,worldQ(z)*.80,8,false,true);}
 const z=323,q=worldQ(z),p=mp(z,2.6);
 if(mvisible(z)){
  building(p.x,p.y,200*q,8,'mall');
  txt('SERVICES',p.x,p.y-48*q,Math.max(4,15*q),'#e3ead9','center');
  for(const kk of [2.02,2.27]){const a=mp(309,kk);rect(a.x-5*q,a.y-22*q,10*q,22*q,'#a3a996');rect(a.x-3*q,a.y-19*q,6*q,8*q,'#425b55');}
 }
 for(const [zz,k]of [[260,4.1],[302,4.2],[330,3.7]]){if(!mvisible(zz))continue;const p=mp(zz,k),q=worldQ(zz);mtree(p.x,p.y,100*q,zz);bench(p.x-30*q,p.y,60*q);rect(p.x-25*q,p.y-18*q,45*q,4*q,'#aa9671');}
 for(const [zz,k,id]of [[307,2.8,3],[283,3.0,4],[316,3.3,6]])if(mvisible(zz)){const p=mp(zz,k);person(p.x,p.y,64*worldQ(zz),id);}
 // Lighting is concentrated inside the rest area.
 for(const [zz,k]of [[220,1.85],[285,3.6],[318,2.0]]){if(!mvisible(zz))continue;const p=mp(zz,k),q=worldQ(zz);lamp(p.x,p.y,120*q,1);}
 mpanel(147,1.56,['P  ·  WC','AIRE DE REPOS']);
}
function mexit(){
 if(distance()<625){
 const pts=[[405,1.04],[450,1.08],[485,1.27],[535,1.80],[590,2.7],[620,3.1],[620,3.4],[590,3.0],[535,2.06],[485,1.50],[450,1.28],[405,1.18]];
 mpoly(pts,night?'#33464a':'#7c877d');
 for(let z=450;z<508;z+=9)if(mvisible(z))mpoly([[z,1.05],[z+4,1.12],[z+4,1.22],[z,1.14]],'#cfd4bf');
 
 }
 // A separate slip road joins the motorway farther along the route.
 mpoly([[810,3.0],[855,2.3],[900,1.50],[950,1.08],[985,1.04],[985,1.19],[950,1.31],[900,1.75],[855,2.58],[810,3.3]],night?'#33464a':'#7c877d');
}
function mbridge(z=680){
 if(!mvisible(z))return;const q=worldQ(z),a=mp(z,-1.8,169),b=mp(z,2.2,169),base=mp(z,-1.8,143);
 for(const k of [-1.48,1.52]){const p=mp(z,k),h=mp(z,k,153);rect(h.x-8*q,h.y,16*q,p.y-h.y,night?'#6a7c70':'#a9b09c');}
 poly([[a.x,a.y],[b.x,b.y],[b.x,b.y+21*q],[a.x,base.y]],night?'#7c8b7d':'#c0c4b0');
 line([[a.x,a.y-12*q],[b.x,b.y-12*q]],'#85988a',Math.max(.7,2*q));
 for(let j=0;j<18;j++){const x=a.x+(b.x-a.x)*j/17;line([[x,a.y],[x,a.y-13*q]],'#8b9b8b',Math.max(.6,q));}
 mpatch(z-8,z+13,-1.10,1.10,'#243d2d38');
}
function munderpass(){
 const z=1030;if(!mvisible(z))return;
 for(const sg of [-1,1]){
  mpatch(z-30,z+28,sg*1.45,sg*3.4,night?'#3a4b39':'#7d9868');
  const p=mp(z,sg*2.2),q=worldQ(z);
  poly([[p.x-42*q,p.y],[p.x-32*q,p.y-38*q],[p.x+32*q,p.y-38*q],[p.x+42*q,p.y]],'#8f9e89');rect(p.x-25*q,p.y-28*q,50*q,28*q,'#354c3d');
  mpatch(z-4,z+4,sg*2.25,sg*5.2,night?'#606d5b':'#b1ae93');
 }
}
function msceneryItems(){
 const a=[];
 const tz=296+mod(t*1.1,16);
 if(mvisible(tz))a.push({z:tz,draw:()=>{
 const q=worldQ(tz),p=mp(tz,-2.4),b=mp(tz-7,-2.4);mpatch(278,tz,-2.28,-2.52,'#70573f');tractor(p.x,p.y,135*q);
 line([[p.x,p.y],[b.x,b.y]],'#7b8173',3*q);for(let j=0;j<4;j++)poly([[b.x+(j-2)*7*q,b.y-3*q],[b.x+(j-2)*7*q-4*q,b.y+4*q],[b.x+(j-2)*7*q+3*q,b.y+3*q]],'#a6ac9c');
 if(!night&&!/^(pluie|orage)$/.test(roadKind().wx))ellipse(b.x,b.y-5*q,18*q,5*q,'#c8af7833');
 }});
 const nt=Math.floor((roadTravel-100)/57);
 for(let n=nt;n<nt+16;n++)for(const sg of [-1,1]){
  const z=80+n*57+rnd(n+6)*26-shift(),k=sg*(2.2+rnd(n)*2.8);
  if(!mvisible(z)||sg>0&&z>140&&z<370)continue;
  a.push({z,draw:()=>{const p=mp(z,k),q=worldQ(z);mtree(p.x,p.y,(85+rnd(n)*58)*q,n+3);if(n%3===0)mtree(p.x+36*q,p.y+2*q,65*q,n+4,true);}});
 }
 for(const [z,k,id]of [[340,-3.7,2],[760,4.1,8],[1190,-3.4,9]])if(mvisible(z))a.push({z,draw:()=>{
  const p=mp(z,k),q=worldQ(z);ruralBarn(p.x,p.y,220*q,false);
  rect(p.x+84*q,p.y-58*q,24*q,58*q,night?'#6e8073':'#a8b3a0');ellipse(p.x+96*q,p.y-58*q,12*q,4*q,'#c1c7b1');
  mpatch(z-7,z+1,k-.5,k+.7,night?'#74795c':'#b7aa87');
 }});
 // Noise barriers belong to the inhabited section, not every verge.
 for(let z=900;z<1000;z+=12)if(mvisible(z))a.push({z,draw:()=>{const p=mp(z,-1.37),r=mp(z+12,-1.37),q=worldQ(z);poly([[p.x,p.y],[r.x,r.y],[r.x,r.y-75*worldQ(z+12)],[p.x,p.y-75*q]],night?'#4b6655':z%24?'#859b80':'#a0ad91');line([[p.x,p.y],[p.x,p.y-76*q]],'#b9c3ac',Math.max(.5,q*2));}});
 // Occasional homes beyond the screen reinforce the transition near the interchange.
 for(const [z,k,id]of [[945,-2.8,2],[990,-3.4,4],[1100,3.3,7]])if(mvisible(z))a.push({z,draw:()=>{const p=mp(z,k);building(p.x,p.y,140*worldQ(z),id,'house');}});
 return a;
}
function matmosphere(){
 const rain=/^(pluie|orage)$/.test(roadKind().wx);
 if(dusk)rect(0,TOP,W,BOT-TOP,'#c19b6c15');
 if(night){const a=mp(distance()+37,.20),b=mp(distance()+37,1.01),aa=mp(distance()+185,.08),bb=mp(distance()+185,1.05);const g=c.createLinearGradient(0,aa.y,0,a.y);g.addColorStop(0,'#fff2ce00');g.addColorStop(.65,'#fff2ce2d');g.addColorStop(1,'#fff2ce00');poly([[a.x,a.y],[aa.x,aa.y],[bb.x,bb.y],[b.x,b.y]],g);}
 const fog=c.createLinearGradient(0,HZ-30,0,HZ+72);fog.addColorStop(0,'#b6c7b200');fog.addColorStop(.36,night?'#b6c7b208':rain?'#b6c7b23d':'#b6c7b21c');fog.addColorStop(1,'#b6c7b200');rect(0,HZ-30,W,102,fog);
}
function motorwayDraw(cv,T,metres,speed,main=true){
 if(main){
 const width=cv.clientWidth,height=cv.clientHeight;if(!width||!height)return;
 const ratio=Math.min(1.25,window.devicePixelRatio||1,window.Perf725?[.85,1,1.25][Perf725.cap()]:1.25);
 const pxWidth=Math.round(width*ratio), pxHeight=Math.round(height*ratio);
 if(cv.width!==pxWidth || cv.height!==pxHeight){cv.width=pxWidth;cv.height=pxHeight;}
 }
 c=cv.getContext('2d');if(!c)return;
 c.setTransform(cv.width/W,0,0,cv.height/(BOT-TOP),0,-TOP*cv.height/(BOT-TOP));
 t=T;travelled=metres;scene='autoroute';season740=productionSeason730();night=!!roadKind().night;snowNow738=roadKind().wx==='neige';dusk=!night&&duskNow738(window.RoadSky719&&RoadSky719.current());
 const sky=skyFill738('#8ab8c9','#d2dfcf',night?'#102132':dusk?'#9096a2':'#8ab8c9',night?'#2c423e':dusk?'#d1baa0':'#d2dfcf');rect(0,TOP,W,HZ-TOP,sky);sky738();rect(0,HZ,W,BOT-HZ,night?'#314b36':'#849d68');
 mbackdrop();mfields();snowGround738();mroad();mrestArea();mexit();munderpass();
 const items=[...msceneryItems(),...mtrafficItems()];for(const o of items.sort((a,b)=>b.z-a.z)){c.save();c.globalAlpha=Math.min(1,Math.max(0,(750-(o.z-distance()))/160));o.draw();c.restore();}
 syncSigns739(main);mbarriers();mbridge();mgantry();mgantry(930);drawSyncSigns739();
 // Illustrative speed limit, separate from the destinations.
 const speedLimit=productionLimit730();if(speedLimit&&mvisible(35)){const p=mp(35,1.38);sign(p.x,p.y,125*worldQ(35),speedLimit,false);}
 matmosphere();weatherFront738(cv,main);if(!smallSign739())stationHUD741(speed);townHUD741();
 const depth=(TOP+.92*(BOT-TOP)-HZ)/(BOT-HZ), left=mq(depth,.555), right=mq(depth,1.08);
 if(main)RoadCar731.place(cv,(left.x+right.x)/(2*W),(left.y-TOP)/(BOT-TOP),(right.x-left.x)/W);
 c.setTransform(1,0,0,1,0,0);
}

window.MotorwayStudy=MotorwayStudy;
function productionSeason730(){const chosen=store.get('season730','auto');if(['printemps','ete','automne','hiver'].includes(chosen))return chosen;const m=new Date().getMonth();return m>=2&&m<=4?'printemps':m>=5&&m<=7?'ete':m>=8&&m<=10?'automne':'hiver';}
function productionLimit730(){if(!window.Road723||!Road723.fresh()||!Road723.match)return 0;const value=parseMax(Road723.match.tags.maxspeed);return Number.isFinite(value)&&value>0?value:0;}
window.Decors726={draw:renderLive,loopMetres,LOOP:LOOP736,LEAD:LEAD736,signs739:ev739};
RoadDecor721.draw=renderLive;
})();
