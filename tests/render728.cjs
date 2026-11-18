// Rendu du vrai moteur et du sprite, avec composition du HUD pour la revue visuelle.
const fs=require('node:fs'),path=require('node:path');
const {createCanvas,loadImage}=require('@napi-rs/canvas'),{make}=require('./regression.cjs');
async function main(){
 const out=process.env.WIDGET_QA||path.resolve(__dirname,'../../qa728');fs.mkdirSync(out,{recursive:true});
 const sheet=createCanvas(1280,1370),sc=sheet.getContext('2d');sc.fillStyle='#101c2b';sc.fillRect(0,0,1280,1370);
 const sprite=await loadImage(path.resolve(__dirname,'../sources_assets/car/route-360.webp'));
 for(let i=0;i<4;i++){
  const t=make({canvas:true,extraScripts:['decors726.js','driver728.js','near728.js','v728.js']}),r=t.run,w=t.w,night=i>=2,driver=i%2===1;
  r(`store.set('driver728On',${driver});store.set('near728Km',0);window.roadScene=()=> '${i<2?'ville':'autoroute'}';roadKind=()=>({night:${night},wx:'soleil'});weather={t:12,c:1,hours:[],days:[],wind:0,day:${night?0:1},days:[{min:10,max:14}]};geoA={city:'Strasbourg'};city='Strasbourg';loc={lat:48.58,lon:7.74,acc:8,ts:Date.now(),spd:47,brg:0};Road723.at=Date.now();Road723.pos={...loc};Road723.match={id:17,tags:{highway:'residential',maxspeed:'50'},geometry:[{lat:48.579,lon:7.74},{lat:48.58028,lon:7.74},{lat:48.5806,lon:7.74055},{lat:48.5812,lon:7.74055}]};Road723.cache=[Road723.match];limit=50;limitOkAt=Date.now();limitOkPos={...loc};render();paint();`);
  const cv=w.document.querySelector('canvas[data-road]'),W=620,H=620;Object.defineProperty(cv,'clientWidth',{value:W,configurable:true});Object.defineProperty(cv,'clientHeight',{value:H,configurable:true});w.RoadDecor721.draw(cv,2,0,47);
  const c=createCanvas(W,H),ctx=c.getContext('2d');ctx.drawImage(t.canvasMap.get(cv).canvas,0,0,W,H);
  const car=cv.parentNode.querySelector('[data-car360]'),cw=parseFloat(car.style.width),ch=cw*300/503,cx=parseFloat(car.style.left)/100*W,cy=H*(1-parseFloat(car.style.bottom)/100)-ch;ctx.drawImage(sprite,503*12,0,503,300,cx-cw/2,cy,cw,ch);
  const text=(s,x,y,n)=>{ctx.font='500 '+n+'px sans-serif';ctx.fillStyle='#fff';ctx.shadowColor='#182b4680';ctx.shadowBlur=3;ctx.fillText(s,x,y);ctx.shadowBlur=0;};
  text('47',W*.04,H*.05+66,72);text('KM/h',W*.04+3,H*.05+91,19);
  ctx.fillStyle='#fff';ctx.strokeStyle='#e0312b';ctx.lineWidth=5;ctx.beginPath();ctx.arc(W*.04+122,H*.05+38,26,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#17252c';ctx.font='700 21px sans-serif';ctx.textAlign='center';ctx.fillText('50',W*.04+122,H*.05+46);ctx.textAlign='left';
  text('↗ Strasbourg',W*.52,H*.05+18,18);text('12°',W*.52,H*.05+74,50);text('10–14°C',W*.55,H*.05+100,15);
  const icon=cv.parentNode.querySelector('[data-k="wIcon"] svg');if(icon){try{const im=await loadImage(Buffer.from(icon.outerHTML));ctx.drawImage(im,W*.52+95,H*.05+28,46,46);}catch{}}
  text('M 351 · 67200 Strasbourg',W*.26,H-5,12);
  const x=(i%2)*640+10,y=Math.floor(i/2)*680+44;sc.drawImage(c,x,y);sc.fillStyle='#e5edf2';sc.font='600 18px sans-serif';sc.fillText((driver?'Vue conducteur':'Décor classique')+(night?' · nuit':' · jour'),x,y-15);
  fs.writeFileSync(path.join(out,'widget728-'+i+'.png'),c.toBuffer('image/png'));t.dom.window.close();
 }
 fs.writeFileSync(path.join(out,'comparaison728.png'),sheet.toBuffer('image/png'));console.log('Rendus 7.28 créés dans '+out);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
