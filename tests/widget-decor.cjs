const {make}=require('./regression.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
(async()=>{
const t=make({canvas:true}),r=t.run;
r("Decor721.preview='normal';Decor721.defs.forEach(d=>store.set('decor721_D'+d[0],true));render();window.widgetCv=document.querySelector('canvas[data-road]');widgetCv.parentNode.setAttribute('data-decor721-preview','');");
const cv=t.w.document.querySelector('canvas[data-road]');
Object.defineProperty(cv,'clientWidth',{value:800,configurable:true});Object.defineProperty(cv,'clientHeight',{value:480,configurable:true});
const out=process.env.WIDGET_QA; if(out)fs.mkdirSync(out,{recursive:true});
const sheet=createCanvas(1600,4*510),ctx=sheet.getContext('2d');let row=0,checks=0;
for(const scene of ['autoroute','ville','village','foret']){
 for(const [col,hour] of [14,23].entries()){
 r(`Decor721.previewScene='${scene}';Decor721.previewHour=${hour};RoadDecor721.draw(widgetCv,9,360,60);`);
 const image=t.canvasMap.get(cv).canvas;const buf=image.toBuffer('image/png');
 // Les images livrées incluent aussi la voiture, comme le widget DOM.
 ctx.drawImage(image, col*800,row*510,800,480);
 // Même sprite original que le widget, posé au-dessus du décor comme dans le DOM.
 const sprite=await loadImage(path.join(__dirname,'../sources_assets/car/route-360.webp'));
 const spriteW=800*.292,spriteH=spriteW*300/503,frame=createCanvas(800,480),fc=frame.getContext('2d');fc.drawImage(image,0,0);fc.drawImage(sprite,sprite.width/24*12,0,sprite.width/24,sprite.height,(800-spriteW)/2,480*.72-spriteH,spriteW,spriteH);ctx.drawImage(frame,col*800,row*510);if(out)fs.writeFileSync(path.join(out,scene+'-'+hour+'.png'),frame.toBuffer('image/png'));
 ctx.fillStyle='#fff';ctx.font='18px sans-serif';ctx.fillText(scene+' · '+hour+' h · décor illustratif',col*800+12,row*510+502);
 assert.equal(t.errors.length,0);checks++;
 }
 row++;
}
// Chaque nouvelle option produit réellement une différence dans la scène adaptée.
for(let id=51;id<=75;id++){
 const scene=id<=55?'autoroute':id<=62?'ville':id<=65?'village':id<=72||id===75?'foret':'ville';
 r(`Decor721.defs.forEach(d=>store.set('decor721_D'+d[0],false));Decor721.previewScene='${scene}';Decor721.previewHour=${id>=73?23:14};${id===75?"store.set('decor721_D72',true);":''}`);
 let changed=false;
 for(const distance of [0,90,360,800]){
 r(`store.set('decor721_D${id}',false);RoadDecor721.draw(widgetCv,9,${distance},60);`);const before=t.canvasMap.get(cv).canvas.toBuffer('image/png');
 r(`store.set('decor721_D${id}',true);RoadDecor721.draw(widgetCv,9,${distance},60);`);changed ||= !before.equals(t.canvasMap.get(cv).canvas.toBuffer('image/png'));
 }
 assert(changed,'effet visible D'+id);checks++;
}
// Une limitation manquante ou périmée ne doit jamais être dessinée.
r("Decor721.preview=null;widgetCv.parentNode.removeAttribute('data-decor721-preview');store.set('decor721_D76',true);limit=90;Road723.match=null;RoadDecor721.draw(widgetCv,9,360,60);");
assert(!t.drawings.some(d=>d.text==='90'));checks++;
r("Road723.cache=[{id:1,tags:{highway:'residential',maxspeed:'90'},geometry:[{lat:loc.lat,lon:loc.lon-.01},{lat:loc.lat,lon:loc.lon+.01}]}];Road723.pos={...loc};Road723.at=Date.now();Road723.apply();");
for(const [age,expected] of [[0,true],[61000,false]]){
 r(`Road723.at=Date.now()-${age}`);t.drawings.length=0;r('RoadDecor721.draw(widgetCv,9,360,60)');assert.equal(t.drawings.some(d=>d.text==='90'),expected);checks++;
}
// Noms très longs : chaque ligne tient dans la largeur disponible.
const dc=t.canvasMap.get(cv).ctx;dc.save();r("PanelText723.draw(widgetCv.getContext('2d'),{left:0,top:0,width:120,height:35},'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW')");
assert(dc.measureText('WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW').width<=120*.85+.01);dc.restore();checks++;
// Nom précédent issu du géocodage, conservé par widget, jamais créé dans un aperçu.
t.setcity({city:'Ancienne commune'});await r('Place710.refresh(true)');r('RoadDecor721.draw(widgetCv,9,360,60)');
t.advance(61000);t.pos(48.6,7.8);t.setcity({city:'Nouvelle commune'});await r('Place710.refresh(true)');r("store.set('decor721_D77',true);RoadDecor721.draw(widgetCv,9,360,60)");
assert.equal(r('RoadDecor721.places.get(widgetCv.parentNode).old'),'Ancienne commune');checks++;
assert.equal(r('Place710.here().name'),'Nouvelle commune');checks++;
assert.deepEqual(t.errors,[]);if(out)fs.writeFileSync(path.join(out,'jour-nuit.png'),sheet.toBuffer('image/png'));
// Géométrie et orientation correspondant à la référence approuvée.
r("Decor721.preview='normal';Decor721.previewScene='foret';Decor721.previewHour=14;Decor721.defs.forEach(d=>store.set('decor721_D'+d[0],true));RoadDecor721.draw(widgetCv,3,120,60)");
const car=t.w.document.querySelector('[data-decor721-preview] [data-car360]');
assert(car);assert.equal(car.style.width,'29.2%');assert.equal(car.style.bottom,'28%');assert(car.style.backgroundPosition.startsWith('52.174%'));checks++;
r("store.set('decor721_D67',false);RoadDecor721.draw(widgetCv,3,120,60)");
const flat=t.canvasMap.get(cv).canvas.toBuffer('image/png');r("store.set('decor721_D67',true);RoadDecor721.draw(widgetCv,3,120,60)");
assert(!flat.equals(t.canvasMap.get(cv).canvas.toBuffer('image/png')));checks++;
assert.equal(typeof r('RoadDecor721.forest'),'function');checks++;
t.dom.window.close();console.log(checks+' contrôles du widget enrichi réussis.');
})().catch(e=>{console.error(e);process.exitCode=1;});
