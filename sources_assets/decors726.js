/* Décors 7.26 : rendu local ; aucune destination ou limitation de démonstration. */
(()=>{ 'use strict'; const W=960,H=480,TOP=54,HZ=180,BOT=446;
let c,t,night,dusk,scene;
const mod=(x,n)=>((x%n)+n)%n;
let travelled=0;const distance=()=>travelled;
const depthQ=z=>50/(z+50);
const worldQ=z=>depthQ(z-distance());
const rnd=i=>{const n=Math.sin(i*13.71+4.9)*31753;return n-Math.floor(n)};
function rect(x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h)}
function ellipse(x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,Math.abs(rx),Math.abs(ry),0,0,7);c.fill()}
function line(points,col,width=1){c.strokeStyle=col;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke()}
function poly(points,col){c.fillStyle=col;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()}
function txt(s,x,y,size=16,col='#fff',align='left'){c.fillStyle=col;c.font=`${size>=18?'bold ':''}${size}px Inter, sans-serif`;c.textAlign=align;c.textBaseline='alphabetic';c.fillText(s,x,y)}
function P(q,k=0){return {x:W*.46+(scene==='autoroute'?300:225)*q*k,y:HZ+(BOT-HZ)*q}}
function band(a,b,col){const p=P(0,a),q=P(1,a),r=P(1,b),s=P(0,b);poly([[p.x,p.y],[q.x,q.y],[r.x,r.y],[s.x,s.y]],col)}
function roadLine(k,col,w=2){const a=P(0,k),b=P(1,k);line([[a.x,a.y],[b.x,b.y]],col,w)}
function light(x,y,r,color){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#fff0');c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r)}
function tree(x,y,s,id,bush=false){rect(x-s*.035,y-s*.64,s*.07,s*.64,night?'#514638':'#755340');if(bush){ellipse(x,y-s*.17,s*.3,s*.2,night?'#263e31':'#5c884d');return}if(scene==='foret'&&id%2){for(let j=0;j<4;j++)poly([[x,y-s*(1.25-j*.2)],[x-s*(.18+j*.045),y-s*(.75-j*.2)],[x+s*(.18+j*.045),y-s*(.75-j*.2)]],night?['#15332e','#1c3c32'][j%2]:['#366448','#487956'][j%2]);}else{ellipse(x,y-s*.8,s*.32,s*.42,night?'#214238':'#548a55');ellipse(x-s*.1,y-s*.93,s*.2,s*.23,night?'#2e5040':'#77a25e')}}
function flag(x,y,s){rect(x,y-s,s*.018,s,'#c7d0d9');for(let k=0;k<3;k++)poly([[x+k*s*.13,y-s],[x+(k+1)*s*.13,y-s+Math.sin(t*3)*s*.035],[x+(k+1)*s*.13,y-s*.73],[x+k*s*.13,y-s*.75]],['#173a94','#fff','#e54245'][k])}
function person(x,y,s,id,child=false){const stride=Math.sin(t*5+id)*s*.12;ellipse(x,y-s*.77,s*.075,s*.08,'#d2a082');line([[x,y-s*.68],[x+stride*.12,y-s*.3]],['#e6ae48','#718bc0','#bd6e89'][mod(id,3)],s*.14);line([[x,y-s*.32],[x-stride,y]],'#27384c',s*.06);line([[x,y-s*.32],[x+stride,y]],'#27384c',s*.06);line([[x,y-s*.59],[x-s*.14,y-s*.4+stride*.2]],'#d2a082',s*.045);line([[x,y-s*.59],[x+s*.15,y-s*.43-stride*.2]],'#d2a082',s*.045)}
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
function building(x,y,s,id,type){const bw=s*(type==='mall'?1.1:.83),bh=s*(type==='house'?.53:type==='mall'?.6:type==='tower'?1.3:.7);const col=night?['#354657','#414d5b','#3c4657'][mod(id,3)]:['#d6c7ac','#adc0cb','#bdc2bf'][mod(id,3)];
 poly([[x-bw*.5,y-bh],[x+bw*.5,y-bh],[x+bw*.64,y-bh+s*.1],[x+bw*.64,y],[x+bw*.5,y]],night?'#283745':'#8f9eaa');rect(x-bw*.5,y-bh,bw,bh,col);
 if(['house','farm'].includes(type))poly([[x-bw*.57,y-bh],[x,y-bh-s*.33],[x+bw*.57,y-bh]],night?'#503e44':'#a85b48');else rect(x-bw*.53,y-bh-s*.04,bw*1.07,s*.055,night?'#23313e':'#657d91');
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
function townSign(q,name){const p=P(q,1.47),w=192*q,h=48*q,y=p.y-130*q;for(const a of [-.32,.32])line([[p.x+a*w,p.y],[p.x+a*w,y+h]],'#abb7bf',Math.max(1,3*q));rect(p.x-w/2,y,w,h,'#f6f4e8');c.strokeStyle='#bd383a';c.lineWidth=Math.max(1,3*q);c.strokeRect(p.x-w*.48,y+3*q,w*.96,h-6*q);txt(name,p.x,y+31*q,Math.max(5,19*q),'#1d2c35','center')}
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
 band(-1.06,1.06,night?'#1e2a33':'#65716f');
 if(scene==='autoroute'){band(-.09,.09,night?'#333f3a':'#829075');roadLine(-1.06,'#c2c6b7',2);roadLine(1.06,'#c2c6b7',2)}else{roadLine(-1,'#c9d2c2',2);roadLine(1,'#c9d2c2',2)}
 if(scene==='ville'||scene==='village'){band(-1.29,-1.055,night?'#46515c':'#abb2af');band(1.055,1.29,night?'#46515c':'#abb2af');roadLine(-1.055,'#c4c9c4',3);roadLine(1.055,'#c4c9c4',3)}
 const ks=scene==='autoroute'?[-.57,.57]:[0];
 const d=distance(),first=Math.floor((d-35)/12);
 for(let n=first;n<first+40;n++){const z=n*12-d;if(z<-28||z>430)continue;const q=depthQ(z),q2=depthQ(z+5);for(const k of ks){const a=P(q,k),b=P(q2,k),w=q*1.5;poly([[a.x-w,a.y],[a.x+w,a.y],[b.x+q2*1.5,b.y],[b.x-q2*1.5,b.y]],night?'#c6cba9':'#f0eee0')}}
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
function fieldPoint(z,k){return P(depthQ(z-distance()),k)}
function groundPatch(z0,z1,k0,k1,col){const a=fieldPoint(z0,k0),b=fieldPoint(z0,k1),d=fieldPoint(z1,k0),e=fieldPoint(z1,k1);poly([[a.x,a.y],[b.x,b.y],[e.x,e.y],[d.x,d.y]],col)}
function landFields(){
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
  if(stage>0){for(let z=Math.ceil(near/7)*7;z<far;z+=7){const q=depthQ(z-d);if(q<.1)continue;for(let j=0;j<25;j++){
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
const simpleBuilding=building;
building=function(x,y,s,id,type){
 // Grounded paving and gardens, larger eaves, shutters and facade articulation.
 if(scene==='village'){ellipse(x,y-s*.015,s*.62,s*.08,night?'#284230':'#78945d');line([[x,y],[x,y+s*.07]],night?'#5d6260':'#c3b99e',s*.17)}
 ellipse(x+s*.14,y+s*.015,s*.56,s*.065,'#10222126');simpleBuilding(x,y,s,id,type);
 const bw=s*(type==='mall'?1.1:.83),bh=s*(type==='house'?.53:type==='mall'?.6:type==='tower'?1.3:.7);
 line([[x-bw*.5,y],[x+bw*.5,y]],night?'#273541':'#87918c',Math.max(.5,s*.018));
 if(type==='house'||type==='farm'){
  line([[x-bw*.57,y-bh],[x,y-bh-s*.33],[x+bw*.57,y-bh]],night?'#644c49':'#c28167',Math.max(1,s*.024));
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
function busStop(x,y,s,id){
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
function blockPoint(z,k,h=0){const q=worldQ(z),p=P(q,k);return [p.x,p.y-h*q]}
function blockQuad(z0,z1,k,h0,h1,col){poly([blockPoint(z0,k,h0),blockPoint(z1,k,h0),blockPoint(z1,k,h1),blockPoint(z0,k,h1)],col)}
function cityBlock(z,id,sg){
 if(mod(id,10)===3){const q=worldQ(z),p=P(q,sg*2.2);park(p.x,p.y,190*q,id);tree(p.x+sg*90*q,p.y,90*q,id);return}
 const floors=[8,13,7,17,10,12][mod(id,6)],height=44+floors*26,depth=31,inside=sg*1.64,outside=sg*(3.55+mod(id,3)*.2),near=z,far=z+depth;
 const q=worldQ(near);if(q<.085||q>2.0)return;
 const palettes=night?['#354b5b','#4d5556','#3e505e','#3f4c59']:['#a3b5b9','#c9c5b6','#a8afb0','#94aabd'];const main=palettes[mod(id,4)],front=night?'#2c3e4b':['#889d9f','#b2ad9c','#8d989c','#7d94a6'][mod(id,4)];
 // Side facade along the street; end facade and roof use the same projection.
 poly([blockPoint(near,inside),blockPoint(far,inside),blockPoint(far,inside,height),blockPoint(near,inside,height)],main);
 poly([blockPoint(near,inside),blockPoint(near,outside),blockPoint(near,outside,height),blockPoint(near,inside,height)],front);
 poly([blockPoint(near,inside,height),blockPoint(far,inside,height),blockPoint(far,outside,height),blockPoint(near,outside,height)],night?'#4c5b60':'#cad0ca');
 const glass=mod(id,3)===0;
 for(let floor=0;floor<floors;floor++){
  const h0=51+floor*26,h1=h0+14;
  for(let col=0;col<6;col++){
   const a=near+2+col*4.6,b=a+2.8,lit=(night||dusk)&&rnd(id*91+floor*7+col)>(dusk?.72:.62),color=lit?'#edce8f':night?'#182b3d':glass?'#608898':'#6f909b';
   blockQuad(a,b,inside,h0,h1,color);
   if(glass)blockQuad(a,b,inside,h0+6,h0+7,night?'#466271':'#b9d0d0');
   if(!glass&&floor%2===0){const lo=blockPoint(a,inside,h0-4),hi=blockPoint(b,inside,h0-4);line([lo,hi],night?'#74817c':'#d3d4c7',Math.max(.5,q*1.1))}
  }
  const kp=outside-inside;
  for(let j=0;j<4;j++){
   const k0=inside+kp*(.10+j*.22),k1=k0+kp*.11,lit=(night||dusk)&&rnd(id*39+floor*5+j)>.62;
   poly([blockPoint(near,k0,h0),blockPoint(near,k1,h0),blockPoint(near,k1,h1),blockPoint(near,k0,h1)],lit?'#e9ca86':night?'#182b3d':'#7394a0');
  }
  line([blockPoint(near,inside,44+floor*26),blockPoint(far,inside,44+floor*26)],night?'#71808744':'#d8ded777',Math.max(.5,q*.8));
 }
 // Street-level storefront, entrance and sign; these are part of the facade.
 blockQuad(near+1,far-1,inside,1,33,night?'#234253':'#487987');
 for(let col=0;col<7;col++){const zz=near+1+col*4.7;line([blockPoint(zz,inside,0),blockPoint(zz,inside,34)],night?'#839a9f':'#c1cfca',Math.max(.6,q*1.5))}
 const pos=blockPoint(near,(inside+outside)*.5,27),width=Math.abs(P(q,outside).x-P(q,inside).x)*.88;
 rect(pos[0]-width/2,pos[1]-16*q,width,20*q,mod(id,4)===1?'#537c67':night?'#365d74':'#5e7f8a');
 const labels=['CAFÉ','LIBRAIRIE','BOULANGERIE','PHARMACIE','ÉPICERIE','BUREAUX'];txt(mod(id,9)===0?'ÉCOLE':mod(id,9)===4?'MAIRIE':labels[mod(id,6)],pos[0],pos[1]-1*q,Math.max(4,q*12),'#f1eedb','center');
 // Roof service core and an antenna distinguish tall towers from apartments.
 if(floors>=12){const a=blockPoint(near+5,(inside+outside)*.5,height);rect(a[0]-22*q,a[1]-18*q,44*q,18*q,night?'#58646a':'#a6b3b4');line([[a[0],a[1]-18*q],[a[0],a[1]-48*q]],'#86979c',Math.max(.5,q))}
}
function cityWorld(){if(scene!=='ville')return;
 const d=distance(),items=[];
 for(let n=Math.floor((d-65)/43);n<Math.floor((d-65)/43)+17;n++)for(const sg of [-1,1]){
  const z=54+n*43+(sg<0?18:0);if(z-d< -36||z-d>620)continue;
  // Leave an actual gap for the crossing street.
  if(z>100&&z<142)continue;
  items.push({z,id:n+20+(sg<0?5:0),sg});
 }
 items.sort((a,b)=>b.z-a.z);for(const b of items)cityBlock(b.z,b.id,b.sg);
 // Pavement joints, a curb, street lighting and trees in individual planters.
 for(const sg of [-1,1]){
  for(let n=Math.floor((d-40)/10);n<Math.floor((d-40)/10)+45;n++){
   const z=45+n*10;if(z-d< -28||z-d>430)continue;const a=fieldPoint(z,sg*1.09),b=fieldPoint(z,sg*1.57);line([[a.x,a.y],[b.x,b.y]],night?'#7b8a8528':'#687b7040',Math.max(.5,worldQ(z)*.8));
  }
  for(let n=Math.floor((d-35)/48);n<Math.floor((d-35)/48)+11;n++){
   const z=55+n*48+(sg<0?22:0);if(z-d< -28||z-d>450)continue;const q=worldQ(z),p=fieldPoint(z,sg*1.16);if(Math.abs(z-104)>18&&Math.abs(z-277)>18)lamp(p.x,p.y,127*q,sg);
   if(mod(n,2)===0){const a=fieldPoint(z+8,sg*1.47);planter(a.x,a.y,48*worldQ(z+8),n+20);tree(a.x,a.y,75*worldQ(z+8),n+20)}
  }
 }
 // Walkers have a real longitudinal motion (1.2–1.6 m/s), not just a leg cycle.
 const people=[];for(let n=-3;n<28;n++)for(const sg of [-1,1]){
  const id=n*7+(sg<0?4:0),direction=mod(n,2)?1:-1,z=42+n*24+(sg<0?13:0)+direction*t*(1.2+rnd(id)*.4),rel=z-d;
  if(rel< -27||rel>360)continue;const q=depthQ(rel),p=fieldPoint(z,sg*(1.28+rnd(id+2)*.10));people.push({q,x:p.x,y:p.y,id});
 }
 people.sort((a,b)=>a.q-b.q);for(const p of people)person(p.x,p.y,97*p.q,p.id);
 for(const [z,k,id]of [[180,-1.40,3],[292,1.40,8]]){if(z-d< -25||z-d>380)continue;const p=fieldPoint(z,k),q=worldQ(z);busStop(p.x,p.y,92*q,id)}
}
const originalScenery5=scenery;
scenery=function(q,id,sg){
 if(scene==='ville')return;
 const z=distance()+50/q-50;
 if(scene==='autoroute'&&sg>0&&z>185&&z<330)return;
 originalScenery5(q,id,sg);
};
const road5=drawRoad;
drawRoad=function(){road5();if(scene==='ville'){
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
const roadBefore6=drawRoad;
drawRoad=function(){roadBefore6();if(scene==='ville'){crossing6(112);crossing6(285)}};
function trafficSignals6(){if(scene!=='ville')return;for(const [z,crossing]of [[277,285],[104,112]])for(const sg of [-1,1])signal6(z,crossing,sg)}
const hudBefore6=hud;
hud=function(names,val,zone){hudBefore6(names,val,zone);rect(0,33,430,18,'#111e2c');txt('ÉTUDE 06 · SIGNALISATION DE DÉMONSTRATION',22,44,10,'#9dabb8');rect(420,BOT,W-420,H-BOT,'#111e2c');txt(scene==='ville'?'Feux · passages piétons · trottoirs animés':'Panneau en hauteur · axe de conduite aligné',W-20,H-12,10,'#8ea4af','right')};



worldSigns=function(){if(!liveLimit)return;const z=Math.floor(distance()/230)*230+110,q=worldQ(z);if(q<.13||q>1.6)return;const p=P(q,1.35);sign(p.x,p.y,145*q,liveLimit,zone30)};
const liveGantry=gantry;gantry=function(){if(panelName)liveGantry()};

let liveLimit=0,zone30=false,panelName='',roadRef='',euroRef='';
function renderLive(cv,T,metres,speed){
 const width=cv.clientWidth,height=cv.clientHeight;if(!width||!height)return;
 const ratio=Math.min(1.25,window.devicePixelRatio||1);
 if(cv.width!==Math.round(width*ratio)||cv.height!==Math.round(height*ratio)){cv.width=Math.round(width*ratio);cv.height=Math.round(height*ratio)}
 c=cv.getContext('2d');if(!c)return;if(!c.roundRect)c.roundRect=function(x,y,w,h){this.rect(x,y,w,h);return this};c.setTransform(width*ratio/W,0,0,height*ratio/(BOT-TOP),0,-TOP*height*ratio/(BOT-TOP));
 t=T;travelled=metres;scene=roadScene();const kind=roadKind();night=!!kind.night;
 const sky=window.RoadSky719&&RoadSky719.current();dusk=!night&&sky&&sky.hour>=17&&sky.hour<21;
 const fresh=window.Road723&&Road723.fresh()&&Road723.match&&Date.now()-Road723.at<60000;
 const tags=fresh?Road723.match.tags:{};liveLimit=fresh&&Number.isFinite(limit)&&limit>0&&parseMax(tags.maxspeed)===limit?limit:0;
 zone30=liveLimit===30&&/zone.*30|30.*zone/i.test(String(tags['zone:maxspeed']||tags['maxspeed:type']||''));
 const name=cv.parentNode.querySelector('.place710');panelName=fresh&&name&&!name.classList.contains('waiting710')?name.textContent.trim():'';
 roadRef=fresh?String(tags.ref||'').slice(0,12):'';euroRef=fresh?String(tags['int_ref']||'').slice(0,12):'';
 const g=c.createLinearGradient(0,TOP,0,HZ);g.addColorStop(0,night?'#091526':dusk?'#747493':'#78b2d3');g.addColorStop(1,night?'#283e57':dusk?'#e4b38f':'#c7dce4');rect(0,TOP,W,HZ-TOP,g);rect(0,HZ,W,BOT-HZ,night?'#253d32':'#72965d');
 if(scene==='ville')rect(0,HZ,W,BOT-HZ,night?'#38464d':'#a7afa5');cityBackdrop();if(scene==='campagne'||scene==='autoroute')landFields();drawRoad();restArea();if(scene==='foret')forestWorld();
 const objects=[],gap=scene==='ville'?57:scene==='village'?88:90,d=distance();
 for(let n=Math.floor((d-40)/gap);n<Math.floor((d-40)/gap)+12;n++)for(const sg of [-1,1]){const z=60+n*gap+(sg<0?gap*.48:0)-d;if(z< -30||z>480)continue;objects.push({q:depthQ(z),id:n+18+(sg<0?3:0),sg})}
 objects.sort((a,b)=>a.q-b.q);for(const o of objects)scenery(o.q,o.id,o.sg);cityWorld();trafficSignals6();barriers();sameWayTraffic();worldSigns();gantry();forestAccents();
 const car=cv.parentNode.querySelector('[data-car360]');if(car){const q=(301+120*298/300-HZ)/(BOT-HZ),x=P(q,scene==='autoroute'?.815:.5).x;
 car.style.left=(x/W*100)+'%';car.style.width=Math.min(201/W*width,120*height/(BOT-TOP)*503/300)+'px';car.style.height='auto';car.style.aspectRatio='503/300';car.style.bottom=((BOT-(301+120))/(BOT-TOP)*100)+'%';car.style.backgroundPosition='52.174% 0';}
 if(night||dusk){const x=P(.9,scene==='autoroute'?.815:.5).x;c.save();c.translate(x,285);c.scale(1,.42);light(0,0,100,'#fff1bb35');c.restore()}
 c.fillStyle='#112333dc';c.fillRect(0,TOP,W,22);txt(scene==='ville'?'Décor illustratif · feux simulés':scene==='autoroute'?'Décor illustratif · circulation et aires simulées':'Décor illustratif',12,TOP+16,12,'#e3ece8');c.setTransform(1,0,0,1,0,0);
}
window.Decors726={draw:renderLive};
RoadDecor721.draw=renderLive;
})();
