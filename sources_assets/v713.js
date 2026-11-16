/* 7.13 : panneau planté dans le même espace et le même ordre que les arbres. */
'use strict';
window.RoadMotion713 = {
  kind(id) { const n=window.RoadOptions718?window.RoadOptions718.spacing():8,phase=((id%n)+n)%n;return phase===0?'panel':phase===1||phase===n-1?'gap':'scenery'; },
  slot(items) { return items.filter(x=>this.kind(x[1])==='panel').sort((a,b)=>a[0]-b[0])[0] || null; },
  geometry(z,W,H,car) {
    const horizon=H*.36, baseX=W*(.5+.045*1.3),size=window.RoadOptions718?window.RoadOptions718.size():1,distance=window.RoadOptions718?window.RoadOptions718.distance():8;
    const top=car ? car.top : H*.51, right=car ? car.right : W*.78;
    const safeDepth=H*.47/Math.max(H*.02,top-horizon);
    const lateral=Math.max(W*(.532+distance*.006),(right+W*.008-baseX)*safeDepth);
    const bottom=horizon+H*.47/z;
    return {left:baseX+lateral/z,top:bottom-H*.13*size/z,width:W*.48*size/z,height:H*.13*size/z,ground:horizon+H*.64/z,bottom};
  },
  obstacle(scene,z,x,y,r,W,H) {
    const sc=1/z;
    let left=x, right=x, top=y;
    if(scene==='ville') {
      left=x-34*sc;right=x+8*sc;top=y-130*sc*H/340-8*sc;
      if(r>.2){const bw=(150+r*80)*sc*W/800,bh=(220+r*260)*sc*H/340;right=Math.max(right,x+30*sc+bw);top=Math.min(top,y-bh);}
    } else if(scene==='village' && r>.5) {
      const hx=x+(95+r*30)*sc*W/800,bw=(150+r*60)*sc*W/800,bh=(85+r*35)*sc*H/340;
      left=hx-bw*.65;right=hx+bw*.65;top=y-bh-bw*.45;
    } else if(scene==='foret') {
      const th=260*sc*H/340;left=x-th*.35;right=x+180*sc+th*.35;top=y-th*1.1;
    } else {
      const village=scene==='village',th=(village?110+r*60:130+r*80)*sc*H/340;
      const tx=x+(village?30+r*50:20+r*60)*sc;
      left=tx-th*.35;right=tx+th*.35;top=y-th*1.1;
    }
    return {left:left-3,right:right+3,top:top-3,bottom:y+3};
  },
  clearObject(scene,z,x,y,r,W,H,car,panelDepth) {
    const p=this.geometry(panelDepth,W,H,car);
    if(p.left>=W)return true;
    const b=this.obstacle(scene,z,x,y,r,W,H),pad=4;
    // Inclut le panneau ET les poteaux, à chaque image de chaque passage.
    return b.right<p.left-pad || b.left>p.left+p.width+pad || b.bottom<p.top-pad || b.top>p.ground+pad;
  },
  car(box,W,H) {
    if(!box)return null;
    const b=box.getBoundingClientRect(),el=box.querySelector('[data-car360]'),r=el&&el.getBoundingClientRect();
    return r&&b.width&&b.height&&r.width ? {right:(r.right-b.left)*W/b.width,top:(r.top-b.top)*H/b.height} : null;
  },
  panel(c,z,W,H,box,scene) {
    const el=box&&box.querySelector('.place710');if(!el||el.classList.contains('waiting710'))return;
    const p=this.geometry(z,W,H,this.car(box,W,H));if(p.left>=W)return;
    c.save();c.globalAlpha=Math.min(1,(18-z)/6);
    c.fillStyle='#d9dee6';for(const x of [.16,.84])c.fillRect(p.left+p.width*x,p.bottom,Math.max(1,W*.005/z),p.ground-p.bottom);
    const hw=scene==='autoroute',green=el.classList.contains('trunk710');
    c.fillStyle=hw?(green?'#176c40':'#1554b4'):'#fff';c.fillRect(p.left,p.top,p.width,p.height);
    c.strokeStyle=hw?'#fff':'#d4202a';c.lineWidth=Math.max(.7,W*.008/z);c.strokeRect(p.left+p.width*.04,p.top+p.height*.1,p.width*.92,p.height*.8);
    c.fillStyle=hw?'#fff':'#161616';c.textAlign='center';c.textBaseline='middle';
    if(window.PanelText723)PanelText723.draw(c,p,el.textContent);else{c.font='700 '+Math.min(p.height*.6,p.width/Math.max(5,el.textContent.length*.55))+'px Inter,sans-serif';c.fillText(el.textContent,p.left+p.width*.5,p.top+p.height*.5,p.width*.85);}c.restore();
  }
};
// Le nom DOM reste disponible au lecteur d'écran ; le panneau visuel est dans le décor.
const road713Style=document.createElement('style');road713Style.textContent='.place710{opacity:0!important}';document.head.appendChild(road713Style);
