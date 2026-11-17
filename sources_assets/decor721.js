/* Rendu Canvas du décor 7.21. Identités stables des objets ; aucune donnée simulée dans le GPS. */
'use strict';
window.RoadDecor721={
 // État propre à chaque widget : aucune écriture dans les données GPS.
 places:new WeakMap(),
 // Perspective commune à la chaussée, au relief et aux objets du décor forestier.
 forest(c,W,H,T,distance,on,night){
  const cz=distance*.35,centre=z=>4*Math.sin(z/180),alt=z=>on(67)?3.8*Math.sin(z/27)+1.8*Math.sin(z/66):0;
  const eyeX=centre(cz)+4.4,pitch=.18,co=Math.cos(pitch),si=Math.sin(pitch);
  const project=(x,y,z)=>{
   const dz=z-cz+25,dy=y+alt(z)-alt(cz)-12,depth=dz*co-dy*si;
   return depth<1?null:{x:W*.5+(x-eyeX)*W*.5625/depth,y:H*.36-(dy*co+dz*si)*H*1.15/depth,k:W*.5625/depth,depth};
  };
  const pos=(x,y,z)=>[centre(z)+x,y,z],poly=(pts,color)=>{
   const q=pts.map(p=>project(...p));if(q.some(p=>!p))return;c.fillStyle=color;c.beginPath();q.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fill();
  },line=(pts,color,w=.1)=>{
   const q=pts.map(p=>project(...p));if(q.some(p=>!p))return;c.strokeStyle=color;c.lineWidth=Math.max(.5,w*q[0].k);c.beginPath();q.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();
  },patch=(x,z,w,d,color,y=.03)=>poly([pos(x-w/2,y,z-d/2),pos(x+w/2,y,z-d/2),pos(x+w/2,y,z+d/2),pos(x-w/2,y,z+d/2)],color);
  const hz=H*.36-Math.tan(pitch)*H*1.15;
  let g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,night?'#0d1d2a':'#85b4c3');g.addColorStop(.3,night?'#253d43':'#c1d0c3');g.addColorStop(1,night?'#1d302a':'#8a9b72');c.fillStyle=g;c.fillRect(0,0,W,H);
  for(let layer=0;layer<3;layer++){
   c.fillStyle=night?['#1c303a','#203b40','#294841'][layer]:['#91afb0','#819f9e','#708f86'][layer];c.beginPath();c.moveTo(0,hz+H*.08);
   for(let x=0;x<=W+10;x+=10)c.lineTo(x,hz-H*(.02+.1*Math.pow(Math.max(0,Math.sin(x/W*6+layer*1.7)),2))+layer*H*.015);
   c.lineTo(W,hz+H*.1);c.closePath();c.fill();
  }
  c.fillStyle=night?'#27382c':'#82916b';c.fillRect(0,hz+H*.06,W,H);
  const band=(a,b,color)=>{const pts=[];for(let z=cz-15;z<cz+410;z+=3)pts.push(pos(a,0,z));for(let z=cz+407;z>=cz-15;z-=3)pts.push(pos(b,0,z));poly(pts,color);};
  band(-8.8,8.8,night?'#263137':'#6c736d');
  for(const x of [-8.6,8.6]){const pts=[];for(let z=cz-12;z<cz+350;z+=3)pts.push(pos(x,.04,z));line(pts,night?'#aebcaf':'#dddcc9',.12);}
  for(let z=Math.floor((cz-12)/12)*12;z<cz+300;z+=12)patch(0,z,.14,4.5,night?'#d6dcc8':'#e4e0ca',.06);
  const objects=[],r=this.rnd.bind(this),period=180;
  for(let base=Math.floor((cz-80)/period)*period;base<cz+390;base+=period){
   if(on(68)){
    const z=base+44,waterY=alt(z)-1;
    const lp=(x,y,zz)=>pos(x,y+waterY-alt(zz),zz),pts=[];
    for(let j=0;j<60;j++){const a=j/60*Math.PI*2;pts.push(lp(27+12*Math.cos(a)*(1+.08*Math.sin(a*5)),.09,z+20*Math.sin(a)));}
    poly(pts,night?'#24454c':'#5b8e93');
    for(let j=0;j<16;j++){const zz=z-17+j*2,span=9*Math.sqrt(Math.max(0,1-Math.pow((zz-z)/20,2))),xx=27+(r(j+base)-.5)*span;
     line([lp(xx-span*.2,.12,zz),lp(xx+span*.2,.12,zz+.08*Math.sin(T+j))],night?'#718f8b50':'#bbd1bd65',.045);}
    for(let j=0;j<18;j++){const a=j/18*Math.PI*2,x=27+12*Math.cos(a),zz=z+20*Math.sin(a);line([lp(x,.08,zz),lp(x+.12,.9,zz)],night?'#536c40':'#879954',.06);}
   }
   if(on(69))for(let z=base+70;z<base+156;z+=3){const x=-22+Math.sin(z/13)*2;patch(x,z,4.4,3.1,night?'#264e58':'#649eaa',.08);if(z%9===0)line([pos(x-1,.1,z),pos(x+1,.1,z+.2)],'#bed6cb70',.06);}
   if(on(70))objects.push({type:'cascade',x:-31,z:base+124,h:8,id:base+8});
   if(on(71))objects.push({type:'cabin',x:19,z:base+73,h:4,id:base+9});
  }
  for(let z=Math.floor((cz-20)/11)*11;z<cz+330;z+=11)for(const sg of [-1,1]){
   const local=this.mod(z,period),inLake=sg>0&&on(68)&&local>18&&local<68;
   for(let layer=0;layer<3;layer++){
    const id=z*7+sg*17+layer*19,x=sg*(13+r(id)*5+layer*9);
    if(inLake&&layer<2)continue;
    if(on(70)&&sg<0&&local>110&&local<140&&layer===2)continue;
    objects.push({type:'tree',x,z:z+layer*3,h:7+r(id+1)*8,radius:2+r(id+4),id,pine:this.mod(id,3)!==0});
   }
   if(on(66)&&this.mod(z,33)===0&&!inLake)objects.push({type:'rock',x:sg*(12+r(z)*3),z:z+3,h:2.6+r(z+7)*1.8,id:z});
   if(on(72)&&this.mod(z,44)===0&&!inLake)objects.push({type:'animal',x:sg*13,z:z+6,h:1.5,id:Math.floor(z/11)});
   if(!inLake)for(let j=0;j<4;j++){const x=sg*(10.5+r(z+j)*2);line([pos(x,0,z+j),pos(x-.15,.6,z+j),pos(x+.2,.25,z+j)],night?'#3c5936':'#68844e',.05);}
  }
  objects.map(o=>({o,p:project(...pos(o.x,0,o.z))})).filter(v=>v.p&&v.p.depth>8&&v.p.depth<300).sort((a,b)=>b.p.depth-a.p.depth).forEach(({o,p})=>{
   const s=p.k,x=centre(o.z)+o.x,z=o.z;
   if(o.type==='tree'){
    const t=project(x,o.h*.72,z);if(!t)return;
    line([[x,0,z],[x,o.h*.85,z]],night?'#514b3b':'#716049',.24);
    if(o.pine){for(let j=0;j<9;j++){const yy=o.h*(1-j*.083),rad=o.radius*(.22+j*.09);
     const top=project(x,yy+.7,z),left=project(x-rad,yy-1,z),right=project(x+rad,yy-1,z);if(!top||!left||!right)continue;
     g=c.createLinearGradient(left.x,0,right.x,0);g.addColorStop(0,night?'#213d32':'#3e6047');g.addColorStop(.5,night?'#365443':'#728a58');g.addColorStop(1,night?'#263e35':'#496b4b');c.fillStyle=g;c.beginPath();c.moveTo(top.x,top.y);c.lineTo(left.x,left.y);c.lineTo(right.x,right.y);c.fill();
    }}else for(let j=0;j<10;j++){
     const a=r(o.id+j)*Math.PI*2,rad=o.radius*t.k,cx=t.x+Math.cos(a)*rad*.55,cy=t.y+Math.sin(a)*rad*.4,rr=rad*(.4+r(j+o.id)*.23);
     g=c.createRadialGradient(cx-rr*.3,cy-rr*.3,0,cx,cy,rr);g.addColorStop(0,night?'#486047':'#8c9f69');g.addColorStop(1,night?'#263f31':'#476746');c.fillStyle=g;c.beginPath();c.ellipse(cx,cy,rr,rr*1.1,0,0,7);c.fill();
    }
   }else if(o.type==='rock'||o.type==='cascade'){
    const w=o.type==='cascade'?5:2.6,h=o.h;
    poly([[x-w,0,z-1],[x-w*.7,h*.7,z],[x,h,z],[x+w*.7,h*.3,z-1],[x+w,0,z-1]],night?'#47544c':'#939e89');
    poly([[x,h,z],[x+w*.8,h*.5,z+1],[x+w,0,z-1],[x+w*.7,h*.3,z-1]],night?'#35483f':'#70867a');
    if(o.type==='cascade'){
     for(let j=0;j<5;j++){const pts=[];for(let k=0;k<=16;k++)pts.push([x+(j-2)*.22+Math.sin(T*4+k+j)*.07,h*(1-k/16),z-.12]);line(pts,night?'#86b5b688':'#d4e9e0',.2);}
     patch(o.x,z-1.5,6,3,night?'#31565c':'#75a6a8');
    }
   }else if(o.type==='cabin'){
    poly([[x-3,0,z-3],[x+3,0,z-3],[x+3,3.4,z-3],[x-3,3.4,z-3]],night?'#5a5040':'#a58a62');
    poly([[x+3,0,z-3],[x+3,0,z+3],[x+3,3.4,z+3],[x+3,3.4,z-3]],night?'#403f31':'#796c4f');
    poly([[x-3.5,3.4,z-3.2],[x,5,z-3.2],[x+3.5,3.4,z-3.2]],night?'#46493a':'#957d58');
    poly([[x,5,z-3.2],[x+3.5,3.4,z-3.2],[x+3.5,3.4,z+3],[x,5,z+3]],night?'#3a4135':'#7e7055');
    for(const sg of [-1,1])poly([[x+sg*1.7-.4,1.3,z-3.05],[x+sg*1.7+.4,1.3,z-3.05],[x+sg*1.7+.4,2.2,z-3.05],[x+sg*1.7-.4,2.2,z-3.05]],night&&on(26)?'#e1c17c':'#658c8e');
   }else if(o.type==='animal'){
    c.save();this.animal(c,p.x+Math.sin(T*.6+o.id)*s*.15,p.y,s*6,o.id,night,on(75),T);c.restore();
   }
  });
  if(night&&on(73))for(const offset of [-.6,.6]){
   const p=project(...pos(4.4+offset,0,cz+32));if(!p)continue;c.save();c.translate(p.x,p.y);c.scale(W*.12,H*.14);g=c.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'#f0efd64a');g.addColorStop(.5,'#f0efd620');g.addColorStop(1,'#f0efd600');c.fillStyle=g;c.fillRect(-1,-1,2,2);c.restore();
  }
  return {project,pos,cz};
 },

 fence(c,x,y,s,night){c.strokeStyle=night?'#506274':'#8b9289';c.lineWidth=Math.max(.6,s*.012);for(let j=-5;j<=5;j++){const a=x+j*s*.055;c.beginPath();c.moveTo(a,y);c.lineTo(a,y-s*.12);c.stroke();}for(const h of [.04,.1]){c.beginPath();c.moveTo(x-s*.28,y-s*h);c.lineTo(x+s*.28,y-s*h);c.stroke();}},
 animal(c,x,y,s,id,night,eyes,T,species){
  const kind=species==='cow'?4:this.mod(id,4);
  if(kind===3){c.strokeStyle=night?'#71818c':'#455c68';c.lineWidth=Math.max(.7,s*.012);c.beginPath();c.moveTo(x-s*.08,y-s*.2);c.quadraticCurveTo(x-s*.03,y-s*(.22+Math.sin(T*3+id)*.025),x,y-s*.18);c.quadraticCurveTo(x+s*.03,y-s*.24,x+s*.08,y-s*.2);c.stroke();return;}c.fillStyle=['#b69978','#d0c2b2','#bb754a','#d9d5bf','#e3dfcf'][kind];
  c.beginPath();c.ellipse(x,y-s*.06,s*(kind===4?.13:.09),s*.045,0,0,7);c.fill();if(kind===4){c.fillStyle='#47504a';c.fillRect(x-s*.06,y-s*.09,s*.045,s*.04);}
  c.beginPath();c.ellipse(x+s*.08,y-s*.1,s*.035,s*.033,0,0,7);c.fill();
  c.strokeStyle=c.fillStyle;c.lineWidth=Math.max(1,s*.012);
  for(const a of [-.05,.05]){c.beginPath();c.moveTo(x+s*a,y-s*.04);c.lineTo(x+s*a,y+Math.sin(T*2+id)*s*.008);c.stroke();}
  for(const a of [.065,.09]){c.beginPath();c.moveTo(x+s*a,y-s*.12);c.lineTo(x+s*a,y-s*(kind===1?.2:.16));c.stroke();}
  c.fillStyle=night&&eyes?'#dfd9a7':'#25302c';c.globalAlpha*=night&&eyes?.55:1;c.beginPath();c.arc(x+s*.099,y-s*.108,Math.max(.4,s*.005),0,7);c.fill();
 },
 detail(c,scene,x,y,s,id,night,on,T){
  const ink=night?'#344b54':'#778c72';
  const rect=(a,b,w,h,col)=>{c.fillStyle=col;c.fillRect(x+a*s,y+b*s,w*s,h*s);};
  const label=(txt)=>{c.fillStyle=night?'#e3cd9b':'#283f51';c.font='700 '+Math.max(2,s*.035)+'px sans-serif';c.textAlign='center';c.fillText(txt,x,y-s*.23,s*.42);};
  if(scene==='autoroute'){
   if(on(53)){rect(-.32,-.03,.64,.05,night?'#3d352f':'#9a704a');for(let j=0;j<6;j++)rect(-.3+j*.1,-.03,.015,.05,ink);}
   for(let j=0;j<8;j++){const a=-.25+j*.07;
    if(on(51)){rect(a,-.16,.008,.13,ink);c.fillStyle=night?'#8c793f':'#f2c93d';c.beginPath();c.arc(x+a*s,y-s*.16,s*.026,0,7);c.fill();c.fillStyle='#654b31';c.beginPath();c.arc(x+a*s,y-s*.16,s*.012,0,7);c.fill();}
    if(on(52)){rect(a,-.08,.008,.08,night?'#8b8055':'#d9b865');for(let k=0;k<3;k++)rect(a-.012,-.13+k*.018,.03,.01,night?'#8b8055':'#ebcf7a');}
   }
   if(on(54)){rect(-.3,-.02,.6,.05,night?'#28463b':'#71995a');this.fence(c,x,y,s,night);for(let j=0;j<2;j++){c.save();this.animal(c,x+s*(j*.24-.13),y-s*.04,s*.75,id*4,night,on(75),T,'cow');c.restore();rect(j*.24-.16,-.108,.025,.025,'#34403c');}}
  }
  if(scene==='ville'){
   if(on(56)||on(57)||on(58)||on(59)){rect(-.3,-.015,.6,.04,night?'#264737':'#719b64');if(on(56))this.fence(c,x,y,s,night);
    if(on(58)){rect(-.23,-.23,.025,.22,'#668dab');c.strokeStyle='#d39961';c.lineWidth=Math.max(1,s*.028);c.beginPath();c.moveTo(x-s*.2,y-s*.23);c.lineTo(x-s*.05,y);c.stroke();}
    if(on(59)){c.strokeStyle=ink;c.lineWidth=Math.max(1,s*.014);c.beginPath();c.moveTo(x,y);c.lineTo(x+s*.04,y-s*.25);c.lineTo(x+s*.23,y-s*.25);c.lineTo(x+s*.27,y);c.stroke();const dx=Math.sin(T*1.5+id)*s*.045;c.beginPath();c.moveTo(x+s*.14,y-s*.25);c.lineTo(x+s*.14+dx,y-s*.07);c.stroke();rect(.11+dx/s,-.07,.07,.018,'#a98569');}
    if(on(57))for(let j=0;j<2;j++){const a=x+s*(-.06+j*.15+Math.sin(T+j+id)*.025),b=y-s*.03; c.fillStyle='#d4ad91';c.beginPath();c.arc(a,b-s*.085,s*.018,0,7);c.fill();c.strokeStyle=j?'#bc897c':'#779acc';c.lineWidth=Math.max(1,s*.018);c.beginPath();c.moveTo(a,b-s*.065);c.lineTo(a,b-s*.025);c.moveTo(a-s*.025,b+Math.sin(T*3+j)*s*.012);c.lineTo(a,b-s*.025);c.lineTo(a+s*.025,b);c.stroke();}
   }
   if(on(60)&&this.mod(id,3)===0){rect(-.28,-.32,.56,.2,night?'#4d586c':'#c4b99b');label('ÉCOLE');this.fence(c,x,y-s*.015,s*1.1,night);}
   if(on(61)&&this.mod(id,3)===1){rect(-.25,-.25,.5,.2,night?'#594b56':'#d3b69a');rect(-.26,-.19,.52,.04,'#a95e58');rect(-.18,-.14,.14,.08,night&&on(26)?'#edca85':'#6a8a9a');label('BOUTIQUE');}
   if(on(62)){rect(-.2,-.07,.18,.025,'#927354');rect(-.19,-.045,.015,.045,ink);rect(-.05,-.045,.015,.045,ink);rect(.28,-.08,.05,.08,ink);}
  }
  if(scene==='village'){
   if(on(63)&&this.mod(id,4)===0){rect(-.26,-.35,.52,.35,night?'#536076':'#c6c3ad');rect(-.04,-.13,.08,.13,'#665d57');label('MAIRIE');for(const a of [-.17,.11])rect(a,-.19,.06,.06,night&&on(26)?'#ebce89':'#7694a6');}
   if(on(64))for(let j=0;j<9;j++){rect(-.28+j*.065,-.05,.008,.05,ink);c.fillStyle=['#e5bb74','#ca8d9d','#c9c4e3'][j%3];c.beginPath();c.arc(x+s*(-.28+j*.065),y-s*.055,s*.014,0,7);c.fill();}
   if(on(65)){this.fence(c,x,y,s,night);rect(.12,-.32,.035,.13,'#8d705b');for(const a of [-.18,.04])rect(a,-.19,.03,.08,'#6d8883');}
  }
  if(scene==='foret'){
   if(on(66)){c.fillStyle=night?'#3a4856':'#8b9598';c.beginPath();c.moveTo(x-s*.25,y);c.lineTo(x-s*.2,y-s*.14);c.lineTo(x-s*.09,y-s*.19);c.lineTo(x+s*.02,y-s*.08);c.lineTo(x+s*.06,y);c.fill();}
   if(on(71)&&this.mod(id,4)===0){rect(.02,-.18,.25,.18,night?'#544637':'#957350');c.fillStyle='#514944';c.beginPath();c.moveTo(x,y-s*.18);c.lineTo(x+s*.15,y-s*.29);c.lineTo(x+s*.3,y-s*.18);c.fill();rect(.12,-.1,.06,.1,'#3a3935');}
   if(on(72)){c.save();this.animal(c,x+s*.15,y,s*.8,id,night,on(75),T);c.restore();}
  }
  if(on(74)&&['ville','village'].includes(scene)){rect(.34,-.65,.012,.65,night?'#647181':'#7c8791');rect(.23,-.66,.12,.018,'#8796a3');if(night){const g=c.createRadialGradient(x+s*.24,y,0,x+s*.24,y,s*.24);g.addColorStop(0,'#ffe6a537');g.addColorStop(1,'#ffe6a500');c.fillStyle=g;c.beginPath();c.ellipse(x+s*.24,y,s*.24,s*.055,0,0,7);c.fill();rect(.23,-.65,.045,.012,'#ffe7ac');}}
 },
 rnd(i){const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);},
 mod(x,m){return ((x%m)+m)%m;},
 smooth(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);},
 projection(W,H,distance,on){
  const hz=H*.36+(on(15)?Math.sin(distance*.003)*H*.012:0),bend=on(14)?Math.sin(distance*.0015)*W*.065:0;
  return {hz,y:z=>hz+(H-hz)/z,center:q=>W*.5-([51,56,63,66,67,68,69,70,71,72].some(on)?W*.21*q:0)+bend*(1-q)*(1-q),half:q=>W*(.045+.475*q)};
 },
 slots(distance,on){
  const gap=1.6,shift=this.mod(distance*.07,gap),base=Math.floor(distance*.07/gap),items=[];
  for(let k=-1;k<17;k++){const z=1.15+k*gap-shift;if(z>(on(43)?.28:1.05)&&z<26)items.push([z,k+base]);}
  return items.sort((a,b)=>b[0]-a[0]);
 },
 carRect(box,W,H){const r=RoadMotion713.car(box,W,H);return r||{right:W*.78,top:H*.51};},
 panelGeometry(z,W,H,car,on){
  const p=RoadMotion713.geometry(z,W,H,car);
  if(on(44)){
   // Même trajectoire analytique que l'ancien décor, écart réduit uniquement si la marge le permet.
   const hz=H*.36,depth=H*.47/Math.max(H*.02,car.top-hz),base=W*.5585;
   p.left=base+Math.max(W*.532,(car.right+W*.012-base)*depth)/z;
  }
  return p;
 },
 paintPanel(c,p,text,scene,on,exit=false){
  c.save();c.globalAlpha=this.smooth((26-p.z)/7);
  if(on(46)){c.shadowColor='#07112888';c.shadowBlur=3;}
  c.fillStyle='#c9d8eb';for(const k of [.16,.84])c.fillRect(p.left+p.width*k,p.bottom,Math.max(.7,p.width*.012),p.ground-p.bottom);
  const hw=scene==='autoroute';c.fillStyle=hw?'#1554b4':'#fff';c.fillRect(p.left,p.top,p.width,p.height);c.shadowBlur=0;
  c.strokeStyle=hw?'#fff':'#d4202a';c.lineWidth=Math.max(.5,p.height*.065);c.strokeRect(p.left+p.width*.035,p.top+p.height*.1,p.width*.93,p.height*.8);
  c.fillStyle=hw?'#fff':'#171c27';c.textAlign='center';c.textBaseline='middle';if(window.PanelText723)PanelText723.draw(c,p,text);else{c.font='700 '+Math.min(p.height*.6,p.width/Math.max(5,text.length*.55))+'px Inter,sans-serif';c.fillText(text,p.left+p.width*.5,p.top+p.height*.52,p.width*.86);}if(exit){c.strokeStyle='#d4202a';c.lineWidth=Math.max(1,p.height*.08);c.beginPath();c.moveTo(p.left+p.width*.1,p.top+p.height*.85);c.lineTo(p.left+p.width*.9,p.top+p.height*.15);c.stroke();}c.restore();
 },
 // Le même identifiant conserve sa famille, sa taille et son emplacement pendant tout son passage.
 objectPlan(id,sg,scene,on){
  const r=this.rnd(id*17+(sg>0?4:8)),slot=RoadMotion713.kind(id);
  if(sg>0&&(slot==='panel'||(!on(45)&&slot==='gap')))return null;
  if(scene==='ville')return {type:on(27)&&r<.22?'garden':'building',r};
  if(scene==='village')return {type:r>.46?'house':on(27)&&r<.19?'garden':'tree',r};
  return {type:'tree',r};
 },
 draw(cv,T,distance,speed){
  const W=cv.clientWidth,H=cv.clientHeight;if(!W||!H)return;
  const box=cv.parentNode,preview=box.hasAttribute('data-decor721-preview'),D=Decor721;
  const help=box.getAttribute('data-help-decor723'),on=id=>help!==null?Number(help)===id:D.on(id),quality=preview&&D.preview||D.quality(),level={calme:.65,normal:1,riche:1.3}[quality];
  const dpr=Math.min(quality==='calme'?1:1.5,window.devicePixelRatio||1);
  if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);}
  const c=cv.getContext('2d');if(!c)return;c.setTransform(dpr,0,0,dpr,0,0);c.globalAlpha=1;
  const scene=preview?(box.getAttribute('data-help-scene723')||D.previewScene):roadScene(),kind=roadKind(),wx=preview?(box.getAttribute('data-help-wx723')||D.previewWx):kind.wx;
  if(preview||Array.from({length:27},(_,i)=>i+51).some(on)){
   const carNode=box.querySelector('[data-car360]');
   if(carNode){carNode.style.width='29.2%';carNode.style.height='auto';carNode.style.bottom='28%';if(preview||speed>=2)carNode.style.backgroundPosition='52.174% 0';}
  }

  const sky=preview?RoadSky719.sample(new Date(2026,5,21,Number(box.getAttribute('data-help-hour723')||D.previewHour)),null,'clock'):RoadSky719.current(),night=preview?sky.night:kind.night;
  if(scene==='foret'&&[66,67,68,69,70,71,72,75].some(on)){
   const geometry=this.forest(c,W,H,T,distance,on,night);
   const items=this.slots(distance,on),slot=RoadMotion713.slot(items.filter(it=>it[0]>1.05&&it[0]<22)),el=box.querySelector('.place710'),name=preview?'FORÊT — APERÇU':el&&!el.classList.contains('waiting710')?el.textContent:'';
   if(slot&&name){const p=this.panelGeometry(slot[0],W,H,this.carRect(box,W,H),on);p.z=slot[0];this.paintPanel(c,p,name,scene,on);}
   if(on(76)&&!preview&&!DEMO&&Road723.fresh()&&Road723.match&&Date.now()-Road723.at<60000&&Road723.pos&&hav(Road723.pos.lat,Road723.pos.lon,loc.lat,loc.lon)<.35&&Number.isFinite(limit)&&limit>0&&parseMax(Road723.match.tags.maxspeed)===limit){
    const z=geometry.cz+30,p=geometry.project(...geometry.pos(12.5,3.2,z)),foot=geometry.project(...geometry.pos(12.5,0,z));
    const namePanel=slot&&name?this.panelGeometry(slot[0],W,H,this.carRect(box,W,H),on):null;
    if(p&&foot){const radius=p.k*1.15,clear=!namePanel||p.x+radius<namePanel.left-8||p.x-radius>namePanel.left+namePanel.width+8||p.y+radius<namePanel.top-8||p.y-radius>namePanel.ground+8;
     if(clear){c.strokeStyle='#a4afa4';c.lineWidth=Math.max(1,p.k*.07);c.beginPath();c.moveTo(foot.x,foot.y);c.lineTo(p.x,p.y);c.stroke();c.fillStyle='#f2efe1';c.beginPath();c.arc(p.x,p.y,radius,0,7);c.fill();c.strokeStyle='#bd4b3f';c.lineWidth=Math.max(1,radius*.16);c.stroke();c.fillStyle='#28382f';c.font='700 '+radius*.78+'px Inter,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(String(limit),p.x,p.y,radius*1.55);}
    }
   }
   this.wheels(box,T,preview?60:speed,on(4));box.dataset.wx=wx;return;
  }
  const P=this.projection(W,H,distance,on),hz=P.hz,rnd=i=>this.rnd(i),season=D.season(),wet=['pluie','orage'].includes(wx),snow=wx==='neige';
  let pal=RoadSky719.palette()||{top:night?'#0d1a45':'#3d62b8',bottom:night?'#081232':'#99c5e6'};
  if(preview)pal=night?{top:'#0a1230',bottom:'#253d69'}:{top:'#3d72b5',bottom:'#acd5ee'};
  const hour=sky.hour;
  if(on(32)&&hour>=4&&hour<9){const a=this.smooth(1-Math.abs(hour-6.5)/2.5);pal={top:pal.top,bottom:'rgb('+[172,137,175].map((v,i)=>Math.round(v+[50,12,-30][i]*a)).join(',')+')'};}
  if(on(33)&&hour>=16&&hour<21)pal={top:'#644f91',bottom:hour<19.5?'#efa66f':'#b37794'};
  let g=c.createLinearGradient(0,0,0,hz);g.addColorStop(0,pal.top);g.addColorStop(1,pal.bottom);c.fillStyle=g;c.fillRect(0,0,W,H);
  // Ciel : chaque interrupteur contrôle une seule couche.
  if(on(34)&&night){c.fillStyle='#d9e5fa';for(let i=0;i<25*level;i++){c.globalAlpha=.3+rnd(i+9)*.45;c.fillRect(rnd(i+600)*W,rnd(i+610)*hz*.8,1,1);}c.globalAlpha=1;}
  if(RoadSky719.enabled())for(const b of sky.bodies){if(wet||wx==='brouillard')continue;const x=b.x*W,y=b.y*H,r=H*(b.kind==='sun'?.025:.019);
   if(b.kind==='moon'&&on(35)){g=c.createRadialGradient(x,y,r,x,y,r*4);g.addColorStop(0,'#cddcff50');g.addColorStop(1,'#cddcff00');c.fillStyle=g;c.fillRect(x-r*4,y-r*4,r*8,r*8);}
   c.fillStyle=b.kind==='sun'?'#ffe6a7':'#e4e9ee';c.beginPath();c.arc(x,y,r,0,7);c.fill();
   if(b.kind==='sun'&&on(36)&&!night){c.save();c.globalAlpha=.08;for(let i=0;i<3;i++){c.fillStyle='#fff4b8';c.beginPath();c.moveTo(x,y);c.lineTo(x+W*(.1+i*.08),hz+H*.12);c.lineTo(x+W*(.14+i*.08),hz+H*.12);c.fill();}c.restore();}
  }
  if(on(31)){for(let plane=0;plane<2;plane++)for(let i=0;i<4;i++){const x=this.mod(rnd(i+plane*90)*W+T*(plane?3:1),W+W*.5)-W*.25,y=hz*(.1+rnd(i+21)*.45);c.fillStyle=night?'#b3c6e015':'#eaf5ff70';c.beginPath();c.ellipse(x,y,W*(plane?.1:.07),hz*(plane?.08:.045),0,0,7);c.fill();}}
  // Silhouette de fond conservée même sans options de végétation.
  if(scene==='ville')for(let i=0;i<30;i++){const par=distance*(on(41)?.035:.10),x=this.mod(i*W/29-par,W+30)-15,w=W*(.018+rnd(i+80)*.022),h=H*(.025+rnd(i+81)*.15);c.fillStyle=night?'#5479b744':'#8db4db66';c.fillRect(x,hz-h,w,h);}
  if(on(29)){for(let j=0;j<3;j++){c.fillStyle=night?['#223359','#263e63','#30506c'][j]:['#728caf','#6d92ae','#5d859b'][j];c.beginPath();c.moveTo(0,hz);for(let x=0;x<=W+8;x+=8)c.lineTo(x,hz-H*(.035+(2-j)*.018)*(1+Math.sin(x/W*7+j*3-distance*(on(41)?.0003:.001))*.7));c.lineTo(W,hz+5);c.fill();}}
  if(on(22)){for(let j=0;j<Math.floor(24*level);j++){const x=this.mod(j*W/24-distance*(on(41)?.18:.4),W+30)-15;c.fillStyle=night?'#1c3c3b':'#477b68';c.beginPath();c.moveTo(x,hz-9-rnd(j)*H*.035);c.lineTo(x-8,hz+5);c.lineTo(x+8,hz+5);c.fill();}}
  const green=season==='automne'?'#786443':season==='hiver'?'#819296':night?'#183c35':'#3c7159';c.fillStyle=green;c.fillRect(0,hz,W,H-hz);
  if(on(28)&&['campagne','village','autoroute'].includes(scene)){for(let sg of [-1,1]){c.fillStyle=night?'#3c4a35':'#a9aa5e';c.beginPath();c.moveTo(W/2,hz);c.lineTo(sg<0?0:W,hz);c.lineTo(sg<0?0:W,H*.7);c.fill();c.strokeStyle=night?'#1a3a33':'#426546';c.lineWidth=3;for(let j=1;j<4;j++){c.beginPath();c.moveTo(W*.5,hz);c.lineTo(sg<0?0:W,hz+H*j*.09);c.stroke();}}}
  if(scene==='foret'){
   if(on(67)){c.fillStyle=night?'#263c44':'#547c65';c.beginPath();c.moveTo(0,hz);c.quadraticCurveTo(W*.15,hz-H*.17,W*.3,hz+H*.12);c.lineTo(0,H*.7);c.fill();}
   if(on(68)){c.fillStyle=night?'#234255':'#6ba4b3';c.beginPath();c.ellipse(W*.85,hz+H*.12,W*.19,H*.045,0,0,7);c.fill();}
   if(on(69)){c.strokeStyle=night?'#345c70':'#83b7c4';c.lineWidth=W*.035;c.beginPath();c.moveTo(W*.83,hz+H*.08);c.bezierCurveTo(W*.66,H*.6,W*.92,H*.62,W,H*.9);c.stroke();}
   if(on(70)){c.fillStyle=night?'#5b8190':'#badbe1';c.fillRect(W*.86,hz-H*.05,W*.018,H*.15);c.strokeStyle=night?'#8ba4ac':'#e4f3ee';for(let j=0;j<4;j++){const y=hz-H*.04+this.mod(T*.03+j*.033,.13)*H;c.beginPath();c.moveTo(W*.86,y);c.lineTo(W*.878,y+H*.012);c.stroke();}}
  }
  const pt=(q,k)=>({x:P.center(q)+P.half(q)*k,y:hz+(H-hz)*q});
  const band=(a,b,col)=>{c.fillStyle=col;c.beginPath();for(let i=0;i<=32;i++){const p=pt(i/32,a);i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);}for(let i=32;i>=0;i--){const p=pt(i/32,b);c.lineTo(p.x,p.y);}c.closePath();c.fill();};
  if(on(13)){band(-1.25,-1.02,night?'#283e39':'#7f8b69');band(1.02,1.25,night?'#283e39':'#7f8b69');}
  g=c.createLinearGradient(0,hz,0,H);g.addColorStop(0,night?'#303a3c':'#80847d');g.addColorStop(1,night?'#182629':'#626b67');
  band(-1,1,g);
  const motorway=scene==='autoroute';if(motorway){band(-3.4,-1.3,night?'#202d30':'#69716d');band(-1.3,-1.08,night?'#414b40':'#839174');}
  const stroke=(k,color,width)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();for(let i=0;i<=32;i++){const p=pt(i/32,k);i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);}c.stroke();};
  stroke(-1,'#dedfce',2);stroke(1,'#dedfce',2);if(motorway){stroke(-3.4,'#dadcca',1);stroke(-1.3,'#c4cbbd',2);}
  const offset=this.mod(distance*.12,1);
  for(let z=.4-offset;z<40;z+=1){if(z<=.3)continue;const q0=Math.min(1,1/z),q1=Math.min(1,1/(z+.48));if(q0===q1)continue;
   const lanes=motorway?[-.15,-2.35]:[0];for(const lane of lanes){const a=pt(q0,lane),b=pt(q1,lane),w0=Math.max(.4,P.half(q0)*.025),w1=Math.max(.3,P.half(q1)*.025);c.fillStyle=night&&on(18)?'#fff9d9':'#eef3ff';c.beginPath();c.moveTo(a.x-w0,a.y);c.lineTo(a.x+w0,a.y);c.lineTo(b.x+w1,b.y);c.lineTo(b.x-w1,b.y);c.fill();}}
  if(on(18)&&night){g=c.createRadialGradient(W*.5,H*.9,5,W*.5,H*.75,H*.38);g.addColorStop(0,'#fff4ce32');g.addColorStop(1,'#fff4ce00');c.fillStyle=g;c.fillRect(0,hz,W,H-hz);}
  if(on(73)&&night){c.save();for(const sg of [-1,1]){g=c.createRadialGradient(W*(.5+sg*.07),H*.46,1,W*(.5+sg*.07),H*.46,H*.22);g.addColorStop(0,'#fff5c632');g.addColorStop(1,'#fff5c600');c.fillStyle=g;c.beginPath();c.moveTo(W*(.5+sg*.07),H*.55);c.lineTo(W*(.5+sg*.2),hz+H*.02);c.lineTo(W*(.5-sg*.04),hz+H*.02);c.closePath();c.fill();}c.restore();}
  if(on(19)&&wet){c.save();c.globalAlpha=.16;c.strokeStyle='#a5d5ff';for(let i=0;i<18*level;i++){const q=this.mod(rnd(i)*1+distance*.003,1),p=pt(q,(rnd(i+3)-.5)*1.8);c.lineWidth=Math.max(.4,q*W*.009);c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+W*q*.008,p.y+H*q*.07);c.stroke();}c.restore();}
  if(motorway&&on(16)){for(const sg of [1,-3.5]){stroke(sg,'#a7c2da',2);for(let z=.6-this.mod(distance*.07,.8);z<20;z+=.8){if(z<=.3)continue;const q=1/z,p=pt(q,sg);c.fillStyle='#acc3d5';c.fillRect(p.x,p.y-H*.055*q,Math.max(1,W*.004*q),H*.055*q);}}}
  if(on(17))for(let sg of [-1,1])for(let z=.6-this.mod(distance*.07,1.6);z<23;z+=1.6){if(z<=.35)continue;const q=1/z,p=pt(q,sg*1.08);c.fillStyle='#d8e2ed';c.fillRect(p.x,p.y-H*.055*q,Math.max(1,W*.008*q),H*.055*q);c.fillStyle=sg>0?'#f1d2a1':'#e0efff';c.fillRect(p.x,p.y-H*.048*q,Math.max(1,W*.008*q),Math.max(1,H*.012*q));}
  if(motorway){const count=on(48)?4:3;for(let i=0;i<count;i++){const z=23.4-this.mod(i*7.13+T*(3+i),22),q=1/z,p=pt(q,-1.65-(i%2)*.95),s=P.half(q);c.fillStyle=['#dce4ed','#b74b44','#597aaf','#aaa6a1'][i];c.fillRect(p.x-s*.16,p.y-s*.2,s*.32,s*.18);c.fillStyle='#15283d';c.fillRect(p.x-s*.11,p.y-s*.19,s*.22,s*.075);c.fillStyle='#fff6dc';for(let sg of [-1,1]){c.beginPath();c.arc(p.x+sg*s*.11,p.y-s*.06,Math.max(.7,s*.026),0,7);c.fill();}if(on(48)){c.fillStyle='#15202b';c.fillRect(p.x-s*.07,p.y-s*.05,s*.14,s*.025);}}}
  const items=this.slots(distance,on),car=this.carRect(box,W,H),panelSlot=RoadMotion713.slot(items.filter(it=>it[0]>1.05&&it[0]<22));
  const el=box.querySelector('.place710'),text=preview?(scene==='village'?'VILLAGE — APERÇU':scene==='autoroute'?'LOCALITÉ — APERÇU':'VILLE — APERÇU'):el&&!el.classList.contains('waiting710')?el.textContent:'';
  let history=this.places.get(box);
  const here=!preview&&!DEMO&&Road723.fresh()?Place710.here():null;
  if(here&&here.name){if(!history){history={name:here.name};this.places.set(box,history);}else if(history.name!==here.name){history.old=history.name;history.name=here.name;history.until=Date.now()+12000;}}
  const exit=!!(on(77)&&here&&history&&history.old&&Date.now()<history.until),panelText=exit?history.old.toUpperCase():text;
  let panel=null;if(panelSlot&&text){let z=panelSlot[0];if(!on(47))z=Math.max(1.05,Math.round(z*12)/12);panel=this.panelGeometry(z,W,H,car,on);panel.z=z;}
  // Peindre le panneau une fois derrière, ou devant pour l'option de lisibilité. Jamais déplacer/effacer les arbres à son approche.
  if(panel&&!on(46))this.paintPanel(c,panel,panelText,scene,on,exit);
  for(const [z,id]of items){const q=1/z,y=P.y(z);c.save();c.globalAlpha=on(42)?this.smooth((26-z)/9):Math.min(1,(26-z)/5);
   for(const sg of [-1,1]){const plan=this.objectPlan(id,sg,scene,on);if(!plan)continue;const r=plan.r;if(plan.type==='tree'&&r>Math.min(.96,.68*D.density()))continue;
    const x=P.center(q)+sg*(P.half(q)*1.17+W*.035*q),s=Math.min(W,H)*q,th=s*(.35+r*.2);
    if(x+th<0||x-th>W||y-th>H)continue;
    if(plan.type==='building'||plan.type==='house'){
     const house=plan.type==='house',varied=on(house?24:25),w=s*(house?.25:.24)+(varied?s*r*.16:0),h=s*(house?.19:.44)+(varied?s*r*(house?.1:.48):0),bx=x+sg*w*.65;
     c.fillStyle=night?(varied?['#324875','#45577d','#344f75'][Math.floor(r*3)]:'#2f4f9a'):(varied?['#a7b4c7','#c7c8b6','#7f9cbb'][Math.floor(r*3)]:'#6f9be0');c.fillRect(bx-w/2,y-h,w,h);
     if(house){c.fillStyle=varied?['#a5604d','#6a6572','#8d4a3a'][Math.floor(r*3)]:'#8d4a3a';c.beginPath();c.moveTo(bx-w*.6,y-h);c.lineTo(bx,y-h-w*.4);c.lineTo(bx+w*.6,y-h);c.fill();if(varied){c.fillStyle='#7d6b62';c.fillRect(bx+w*.22,y-h-w*.23,w*.08,w*.25);}}
     const cols=house?2:3,rows=house?1:varied?4+Math.floor(r*3):4;for(let yy=0;yy<rows;yy++)for(let xx=0;xx<cols;xx++){const lit=night&&on(26)&&rnd(id*7+yy*3+xx)>.4;c.fillStyle=lit?'#f1cf86':night?'#1f3151':'#b6d2e5';c.fillRect(bx-w*.37+xx*w*.28,y-h+h*.15+yy*h*.12,w*.13,h*(house?.2:.06));}
     if(varied){c.fillStyle='#51627a';c.fillRect(bx-w*.06,y-h*.28,w*.12,h*.28);}
    }else if(plan.type==='garden'){
     c.fillStyle=night?'#285346':'#63995d';c.beginPath();c.ellipse(x,y-s*.025,s*.25,s*.06,0,0,7);c.fill();for(let j=0;j<5;j++){c.fillStyle=j%2?'#c69aa7':'#d9bf76';c.fillRect(x+s*(rnd(j+id)-.5)*.4,y-s*.06,Math.max(1,s*.016),Math.max(1,s*.02));}
    }else{
     const sway=on(40)?Math.sin(T*.8+id)*s*.012:0,conifer=scene==='foret'||on(21)&&r>.5;
     c.fillStyle='#715640';c.fillRect(x-s*.013,y-th*.4,s*.026,th*.4);
     c.fillStyle=season==='automne'?(night?'#66503b':['#ba8a45','#aa6545','#bf9b4f'][Math.floor(r*3)]):season==='hiver'?(night?'#53626b':'#9aabb0'):night?'#285546':(on(21)?['#54886c','#3e785c','#689371'][Math.floor(r*3)]:'#4f8f6a');
     if(conifer){for(let j=0;j<3;j++){c.beginPath();c.moveTo(x+sway,y-th*(1-j*.22));c.lineTo(x-th*(.22+j*.03),y-th*(.5-j*.22));c.lineTo(x+th*(.22+j*.03),y-th*(.5-j*.22));c.fill();}}
     else {c.beginPath();c.ellipse(x+sway,y-th*.7,th*.3,th*.4,0,0,7);c.fill();if(on(21)){c.fillStyle=night?'#34654f':season==='automne'?'#d0a354':'#79a17a';c.beginPath();c.ellipse(x+sway-th*.1,y-th*.82,th*.15,th*.19,0,0,7);c.fill();}}
     if(on(30)&&season==='printemps'&&r<.5){c.fillStyle='#e4b2ca';for(let j=0;j<3;j++){c.beginPath();c.arc(x+(j-1)*th*.13,y-th*(.7+j*.04),Math.max(1,th*.055),0,7);c.fill();}}
     if(on(22)&&level>.7){c.strokeStyle=night?'#3f6048':'#8baa64';c.lineWidth=Math.max(.5,q);for(let j=0;j<3;j++){c.beginPath();c.moveTo(x+(j-1)*s*.05,y);c.lineTo(x+(j-1)*s*.05-s*.01,y-s*.045);c.stroke();}}
    }
    this.detail(c,scene,x+sg*s*.28,y,s,id,night,on,T);
   }c.restore();
  }
  if(on(37)){g=c.createLinearGradient(0,hz-H*.08,0,hz+H*.2);g.addColorStop(0,'#c8d9e600');g.addColorStop(.3,night?'#a5b7cf25':'#d5e1ea60');g.addColorStop(1,'#c8d9e600');c.fillStyle=g;c.fillRect(0,hz-H*.08,W,H*.28);}
  if(motorway&&on(55)){const z=22-this.mod(distance*.025,22);if(z>.35){const q=1/z,y=P.y(z),mid=P.center(q),w=P.half(q)*1.23,h=H*.7*q;c.save();c.globalAlpha=this.smooth((22-z)/6);c.strokeStyle=night?'#61738c':'#a9bac5';c.lineWidth=Math.max(1,W*.012*q);c.beginPath();c.moveTo(mid-w,y);c.lineTo(mid-w,y-h);c.lineTo(mid+w,y-h);c.lineTo(mid+w,y);c.stroke();c.restore();}}
  if(on(20)){const z=28-this.mod(distance*.018,28);if(z>.4&&z<20){const q=1/z,y=P.y(z),w=P.half(q)*2.3,h=H*.18*q;c.save();c.globalAlpha=this.smooth((20-z)/7);c.fillStyle=night?'#31405a':'#8295b0';c.fillRect(W*.5-w,y-h,w*2,h*.22);for(let sg of [-1,1])c.fillRect(W*.5+sg*w-w*.04,y-h,w*.08,h);if(z<2){c.fillStyle='rgba(1,8,22,'+(.24*Math.sin(Math.PI*Math.max(0,(z-.4)/1.6)))+')';c.fillRect(0,0,W,H);}c.restore();}}
  // Particules latérales : jamais sur la voiture ni sur le texte du panneau.
  if(on(38)&&wet||on(39)&&snow){const rain=wet;c.save();c.strokeStyle=night?'#9ebddd70':'#d6e7f5b0';c.fillStyle='#edf5ffbb';c.lineWidth=.8;for(let i=0;i<Math.floor((rain?40:22)*level);i++){const sg=i%2?1:-1,x=(sg<0?.02:.87)*W+rnd(i+73)*W*.1,y=this.mod(rnd(i+91)+T*(rain?.85:.12),1)*H;if(panel&&x>panel.left-4&&x<panel.left+panel.width+4&&y>panel.top-12&&y<panel.ground+12)continue;if(rain){c.beginPath();c.moveTo(x,y);c.lineTo(x-2,y+H*.025);c.stroke();}else{c.beginPath();c.arc(x+Math.sin(T+i)*2,y,1+rnd(i),0,7);c.fill();}}c.restore();}
  // Créneau distinct du panneau de localité ; aucune valeur de démonstration.
  if(on(76)&&!preview&&!DEMO&&Road723.fresh()&&Road723.match&&Date.now()-Road723.at<60000&&Road723.pos&&hav(Road723.pos.lat,Road723.pos.lon,loc.lat,loc.lon)<.35&&Number.isFinite(limit)&&limit>0&&parseMax(Road723.match.tags.maxspeed)===limit&&(!panel||panel.z<4||panel.z>12)){
   const z=8,q=1/z,p=pt(q,-1.5),radius=H*.065*q;
   c.fillStyle='#fff';c.beginPath();c.arc(p.x,p.y-H*.2*q,radius,0,7);c.fill();c.strokeStyle='#d4202a';c.lineWidth=Math.max(1,radius*.16);c.stroke();c.fillStyle='#20252a';c.font='700 '+radius+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(String(limit),p.x,p.y-H*.2*q,radius*1.5);
  }
  if(panel)this.paintPanel(c,panel,panelText,scene,on,exit); // invariant de lisibilité du panneau conservé même option désactivée
  this.wheels(box,T,preview?60:speed,on(4));
  box.dataset.wx=wx;
 },
 wheels(box,T,speed,enabled){
  const car=box.querySelector('[data-car360]');if(!car)return;let cv=car.querySelector('[data-wheels721]');
  if(!enabled){if(cv)cv.remove();return;}
  if(!cv){cv=document.createElement('canvas');cv.setAttribute('data-wheels721','');cv.width=503;cv.height=300;cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none';car.appendChild(cv);}
  const c=cv.getContext('2d');if(!c)return;c.clearRect(0,0,503,300);
  // Vue arrière du sprite original : seule la bande de roulement est visible, pas de jante inventée.
  if(Math.abs(carYaw)>8||speed<1)return;
  const phase=this.mod(T*speed*.22,4);c.save();c.fillStyle='#a5adad40';
  for(const x of [147,350]){c.save();c.beginPath();c.rect(x,235,5,10);c.clip();for(let y=231+phase;y<249;y+=4)c.fillRect(x,y,5,.75);c.restore();}c.restore();
 }
};
