/* 7.19 : ciel et astres calculés localement ; aucune requête réseau supplémentaire. */
'use strict';
window.RoadSky719={
 enabled:()=>store.get('skyBodies719',true)!==false,
 progressive:()=>store.get('skyGradient719',true)!==false,
 mode:()=>store.get('skyPosition719','gps')==='clock'?'clock':'gps',
 now:()=>new Date(),cache:null,
 sample(date,position,mode){
  const hour=date.getHours()+date.getMinutes()/60+date.getSeconds()/3600;
  const h=((hour%24)+24)%24,clock=[];
  const point=(kind,t)=>({kind,x:.08+.84*t,y:.33-.25*Math.sin(Math.PI*t)});
  if(h>=6&&h<=20)clock.push(point('sun',(h-6)/14));
  if(h>=20||h<=6)clock.push(point('moon',(h>=20?h-20:h+4)/10));
  const good=mode!=='clock'&&position&&Number.isFinite(position.lat)&&Number.isFinite(position.lon)&&Math.abs(position.lat)<=90&&Math.abs(position.lon)<=180&&Number.isFinite(position.ts)&&Math.abs(date.getTime()-position.ts)<60000&&window.SunCalc;
  if(!good)return {source:'clock',bodies:clock,night:h<6||h>=20,hour:h,light:Math.max(0,Math.sin(Math.PI*(h-6)/14))};
  const sun=SunCalc.getPosition(date,position.lat,position.lon),moon=SunCalc.getMoonPosition(date,position.lat,position.lon),bodies=[];
  for(const [kind,p]of [['sun',sun],['moon',moon]])if(Number.isFinite(p.altitude)&&Number.isFinite(p.azimuth)&&p.altitude>-.015){
    bodies.push({kind,x:.5+.42*Math.sin(p.azimuth),y:.33-.25*Math.max(0,Math.min(1,p.altitude/(Math.PI/2)))});
  }
  return {source:'gps',bodies,night:sun.altitude<-.04,hour:h,light:Math.max(0,Math.min(1,(sun.altitude+.10)/.55))};
 },
 current(){
  const date=this.now(),position=typeof loc!=='undefined'?loc:null,mode=this.mode();
  const valid=position&&Number.isFinite(position.ts)&&Math.abs(date.getTime()-position.ts)<60000;
  const key=[Math.floor(date.getTime()/10000),mode,valid?Number(position.lat).toFixed(2):'',valid?Number(position.lon).toFixed(2):''].join(':');
  if(!this.cache||this.cache.key!==key)this.cache={key,value:this.sample(date,position,mode)};
  return this.cache.value;
 },
 palette(){
  if(!this.progressive())return null;
  const v=this.current(),h=v.hour;
  if(v.source==='gps'){
    const mix=(a,b,t)=>'rgb('+a.map((x,i)=>Math.round(x+(b[i]-x)*t)).join(',')+')';
    const light=v.light,keys=[[0,[13,26,69],[8,18,50]],[.15,[78,57,109],[194,120,104]],[.55,[61,98,184],[155,201,232]],[1,[61,98,184],[155,201,232]]];
    let i=0;while(i<keys.length-2&&keys[i+1][0]<light)i++;const a=keys[i],b=keys[i+1],t=(light-a[0])/(b[0]-a[0]);
    return {top:mix(a[1],b[1],t),bottom:mix(a[2],b[2],t)};
  }
  const keys=[[0,[13,26,69],[8,18,50]],[5,[45,42,94],[107,72,94]],[6.5,[115,83,137],[244,165,112]],[9,[61,98,184],[137,192,228]],[16,[56,110,181],[158,204,234]],[18.5,[107,69,132],[242,142,95]],[21,[24,30,78],[40,45,91]],[24,[13,26,69],[8,18,50]]];
  let i=0;while(i<keys.length-2&&keys[i+1][0]<h)i++;const a=keys[i],b=keys[i+1],t=(h-a[0])/(b[0]-a[0]);
  const mix=k=>'rgb('+a[k].map((v,j)=>Math.round(v+(b[k][j]-v)*t)).join(',')+')';return {top:mix(1),bottom:mix(2)};
 },
 draw(c,W,H,wx){
  if(!this.enabled())return;
  const data=this.current();
  if(['pluie','orage','brouillard'].includes(wx))return;
  c.save();c.beginPath();c.rect(0,0,W,H*.36);c.clip();
  if(data.night){c.fillStyle='#e5edff';for(let i=0;i<28;i++){const x=((Math.sin(i*14.3+2)*43758)%1+1)%1*W,y=((Math.sin(i*7.9+6)*1123)%1+1)%1*H*.28;c.globalAlpha=.25+(i%4)*.14;c.fillRect(x,y,1.2,1.2);}c.globalAlpha=1;}
  for(const body of data.bodies){
   const sun=body.kind==='sun',p={x:body.x*W,y:body.y*H,r:H*(sun?.028:.022)};
   c.globalAlpha=wx==='nuages'?.7:1;
   const halo=c.createRadialGradient(p.x,p.y,p.r*.5,p.x,p.y,p.r*(sun?5:3));halo.addColorStop(0,sun?'#ffe2a370':'#c5d8ff44');halo.addColorStop(1,sun?'#ffe2a300':'#c5d8ff00');c.fillStyle=halo;c.fillRect(p.x-p.r*5,p.y-p.r*5,p.r*10,p.r*10);
   const disk=c.createRadialGradient(p.x-p.r*.3,p.y-p.r*.3,0,p.x,p.y,p.r);disk.addColorStop(0,sun?'#fff9db':'#f3f4ed');disk.addColorStop(1,sun?'#ffbe57':'#cad7e8');c.fillStyle=disk;c.beginPath();c.arc(p.x,p.y,p.r,0,Math.PI*2);c.fill();
   if(!sun){c.fillStyle='#9baec04d';for(const [x,y,r]of [[-.3,-.2,.17],[.28,.13,.23],[-.08,.42,.12]]){c.beginPath();c.arc(p.x+x*p.r,p.y+y*p.r,r*p.r,0,7);c.fill();}}
  }
  c.restore();
 }
};
{const old=roadKind;roadKind=function(){const value=old();if(RoadSky719.progressive())value.night=RoadSky719.current().night;return value;};}
{const nav=SETCATS.find(c=>c[0]==='Navigation'),decor=nav&&nav[1].find(c=>c[0]==='Décor de la route');if(decor){const old=decor[1];decor[1]=p=>old(p)+
 setRow(p,'Soleil et lune','Les astres suivent l’heure. Les calculs GPS sont effectués sur le poste, sans transmettre la position.',chipBtn(p,'sky719:bodies',RoadSky719.enabled()?'Activés':'Désactivés',RoadSky719.enabled()))+
 setRow(p,'Ciel progressif','Couleurs du ciel et éclairage du décor évoluent progressivement.',chipBtn(p,'sky719:gradient',RoadSky719.progressive()?'Activé':'Désactivé',RoadSky719.progressive()))+
 setRow(p,'Position des astres','Automatique : date, heure et GPS récent. Sans GPS : rythme indicatif 6–20 h pour le soleil, 20–6 h pour la lune. Projection décorative gauche/droite, sans suivi du cap du véhicule.',chipBtn(p,'sky719:mode:gps','Automatique GPS',RoadSky719.mode()==='gps')+chipBtn(p,'sky719:mode:clock','Heure locale',RoadSky719.mode()==='clock'));}}
{const old=window.act;window.act=function(a,long){
 if(a==='sky719:bodies')store.set('skyBodies719',!RoadSky719.enabled());
 else if(a==='sky719:gradient')store.set('skyGradient719',!RoadSky719.progressive());
 else if(a==='sky719:mode:gps'||a==='sky719:mode:clock')store.set('skyPosition719',a.split(':')[2]);
 else return old.apply(this,arguments);
 RoadSky719.cache=null;render();
};}
