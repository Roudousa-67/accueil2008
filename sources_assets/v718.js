/* 7.18 : options utilisateur rangées dans Navigation. */
'use strict';
window.RoadOptions718={
 size:()=>[80,100,120,140].includes(Number(store.get('panelSize718',120)))?Number(store.get('panelSize718',120))/100:1.2,
 distance:()=>[0,8,16,24].includes(Number(store.get('panelDistance718',8)))?Number(store.get('panelDistance718',8)):8,
 spacing:()=>[6,8,12].includes(Number(store.get('panelSpacing718',8)))?Number(store.get('panelSpacing718',8)):8,
 duration:()=>[0,500,1000,1500,2000].includes(Number(store.get('roadFade718',1000)))?Number(store.get('roadFade718',1000)):1000
};
window.RoadFX718={
 frames:new Map(),now:()=>performance.now(),
 copy(source){const cv=document.createElement('canvas');cv.width=source.width;cv.height=source.height;cv.getContext('2d').drawImage(source,0,0);return cv;},
 draw(cv,draw){
   const item=cv.closest('[data-fitem]'),key=item?item.getAttribute('data-fitem'):'hero';
   const scene=window.roadScene(),duration=RoadOptions718.duration(),now=this.now();
   let state=this.frames.get(key);
   if(state && state.canvas!==cv)state=null;
   if(state&&state.scene!==scene){
    const highwayChange=store.get('roadScene','auto')==='auto' && [scene,state.scene].includes('autoroute');
    state.fade=duration&&state.last&&!highwayChange?this.copy(state.last):null;
    state.at=now;state.duration=duration;state.scene=scene;
   }
   if(!state){state={scene,canvas:cv,fade:null,last:null,at:now,duration};this.frames.set(key,state);if(this.frames.size>16)this.frames.delete(this.frames.keys().next().value);}
   draw();
   const c=cv.getContext('2d');
   if(state.fade&&duration){const t=Math.max(0,Math.min(1,(now-state.at)/state.duration));
     if(t<1){c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=1-t*t*(3-2*t);c.drawImage(state.fade,0,0,cv.width,cv.height);c.restore();}
     else state.fade=null;
   }else state.fade=null;
   if(duration){if(!state.last||state.last.width!==cv.width||state.last.height!==cv.height)state.last=this.copy(cv);
     else {const last=state.last.getContext('2d');last.clearRect(0,0,cv.width,cv.height);last.drawImage(cv,0,0);}}
 }
};
const nav718=SETCATS.find(c=>c[0]==='Navigation');
if(nav718){
 const decor=nav718[1].find(c=>c[0]==='Décor de la route');
 if(decor){const old=decor[1];decor[1]=p=>old(p)+setRow(p,'Transition entre les décors','Fondu progressif entre ville, village, campagne et autoroute. Choisis la durée.',
 [0,500,1000,1500,2000].map(ms=>chipBtn(p,'nav718:fade:'+ms,ms?String(ms/1000).replace('.',',')+' s':'Désactivée',RoadOptions718.duration()===ms)).join(''));}
 const panels=nav718[1].find(c=>c[0]==='Panneaux et localités');
 if(panels){const old=panels[1];panels[1]=p=>old(p)+
 setRow(p,'Taille des panneaux','La marge avec la voiture reste protégée.',[80,100,120,140].map(v=>chipBtn(p,'nav718:size:'+v,v+' %',RoadOptions718.size()===v/100)).join(''))+
 setRow(p,'Distance du bord de route','Proche, actuelle, éloignée ou très éloignée. La position minimale tient compte de la voiture.',[0,8,16,24].map((v,i)=>chipBtn(p,'nav718:distance:'+v,['Proche','Actuelle','Éloignée','Très éloignée'][i],RoadOptions718.distance()===v)).join(''))+
 setRow(p,'Fréquence de passage','Les espaces sont prévus dans le décor : les bâtiments ne disparaissent pas pendant leur passage.',[6,8,12].map((v,i)=>chipBtn(p,'nav718:spacing:'+v,['Très rapprochés','Actuelle','Espacés'][i],RoadOptions718.spacing()===v)).join(''));}
}
{const old=window.act;window.act=function(a,long){
 if(!a.startsWith('nav718:'))return old.apply(this,arguments);
 const [,key,text]=a.split(':'),value=Number(text),defs={fade:['roadFade718',[0,500,1000,1500,2000]],size:['panelSize718',[80,100,120,140]],distance:['panelDistance718',[0,8,16,24]],spacing:['panelSpacing718',[6,8,12]]};
 if(defs[key]&&defs[key][1].includes(value)){store.set(defs[key][0],value);render();}
};}
