/* Véhicules illustratifs de ville : gabarit et voie opposée. */
function drawTrafficCar(ctx,x,bottom,w,index){
 const h=w*(index%2?.82:.94),y=bottom-h;
 ctx.save();ctx.translate(x,y);
 const path=(pts,color)=>{ctx.fillStyle=color;ctx.beginPath();pts.forEach(([a,b],i)=>i?ctx.lineTo(a*w,b*h):ctx.moveTo(a*w,b*h));ctx.closePath();ctx.fill();};
 const round=(a,b,ww,hh,r,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(a*w,b*h,ww*w,hh*h,r*w);ctx.fill();};
 const colors=index%2?['#b2b8b3','#d4d7ce','#7a8d8b']:['#61828e','#8ca8ac','#3e606f'];
 ctx.fillStyle='#1e333942';ctx.beginPath();ctx.ellipse(0,h*.97,w*.54,h*.055,0,0,7);ctx.fill();
 round(-.48,.61,.13,.36,.035,'#26373e');round(.35,.61,.13,.36,.035,'#26373e');
 path([[-.43,.41],[-.33,.10],[-.23,0],[.23,0],[.33,.10],[.43,.41],[.48,.62],[.47,.88],[-.47,.88],[-.48,.62]],colors[0]);
 path([[-.31,.115],[-.23,.035],[.23,.035],[.31,.115]],colors[1]);
 const glass=ctx.createLinearGradient(0,h*.12,0,h*.44);glass.addColorStop(0,'#253e4d');glass.addColorStop(1,'#73929b');
 path([[-.29,.14],[.29,.14],[.36,.42],[-.36,.42]],glass);
 path([[-.25,.16],[-.21,.16],[-.02,.40],[-.075,.40]],'#bed0cc4d');
 round(-.51,.35,.1,.055,.018,colors[2]);round(.41,.35,.1,.055,.018,colors[2]);
 const hood=ctx.createLinearGradient(0,h*.43,0,h*.70);hood.addColorStop(0,colors[1]);hood.addColorStop(1,colors[0]);
 path([[-.37,.43],[.37,.43],[.46,.66],[-.46,.66]],hood);
 path([[-.31,.46],[-.26,.46],[-.35,.64],[-.40,.64]],'#cad7d130');
 path([[.26,.46],[.31,.46],[.40,.64],[.35,.64]],'#1f46532b');
 round(-.46,.65,.92,.23,.045,colors[2]);
 path([[-.43,.67],[-.19,.69],[-.22,.765],[-.43,.75]],'#e2e4d4');
 path([[.19,.69],[.43,.67],[.43,.75],[.22,.765]],'#e2e4d4');
 round(-.17,.70,.34,.07,.018,'#304752');
 round(-.34,.81,.68,.055,.015,'#263f4b');
 round(-.12,.80,.24,.043,.008,'#d4d8d0');
 if(index%2===0){round(-.37,.90,.74,.025,.008,'#a3b0ae');}
 ctx.restore();
}

window.CityCar730=drawTrafficCar;
