const {make}=require('./regression.cjs');
const assert=require('assert/strict');
let checks=0;
function ok(name,value,expected){assert.deepEqual(value,expected,name);checks++;console.log('OK '+name);}
(async()=>{
 const t=make(),{run,w}=t;
 t.setcity({house_number:'12',road:'Rue du Rhin',postcode:'67100',city:'Strasbourg'});
 await run('Place710.refresh()');run('Place710.paintSigns()');
 const address=()=>w.document.querySelector('[data-roadbox] .roadAddress722');
 ok('adresse complète au bord de la route',address().textContent,'12 Rue du Rhin · 67100 Strasbourg');
 ok('une seule adresse par route',Array.from(w.document.querySelectorAll('[data-roadbox]')).every(b=>b.querySelectorAll('.roadAddress722').length===1),true);
 run('render();Place710.paintSigns();Place710.paintSigns()');
 ok('pas de doublon après recréation et actualisation',w.document.querySelector('[data-roadbox]').querySelectorAll('.roadAddress722').length,1);
 const style=Array.from(w.document.querySelectorAll('style')).map(e=>e.textContent).join('\n');
 ok('position au plus bas avec marge de deux pixels',style.includes('bottom:2px;z-index:8'),true);
 ok('pas de cartouche opaque',style.includes('background:transparent;border:0;padding:0;text-align:center;font:600 clamp(9px,1vw,12px)'),true);
 run("act('place710:every:30')");t.advance(31000);t.pos(48.59,7.74);
 t.setcity({road:'Rue Nouvelle',postcode:'67200',town:'Nouvelle Ville'});
 await run('Place710.refresh()');run('Place710.paintSigns()');
 ok('adresse changée au délai configuré',address().textContent,'Rue Nouvelle · 67200 Nouvelle Ville');
 t.advance(31000);t.pos(48.60,7.74);t.setcity({road:'<img src=x onerror=alert(1)>',postcode:'67000',village:'Village'});
 await run('Place710.refresh()');run('Place710.paintSigns()');
 ok('le texte réseau ne crée aucun élément HTML',address().children.length,0);
 ok('GPS périmé ne montre pas la dernière adresse',run('loc.ts=Date.now()-61000;Place710.roadAddress()'),'GPS en attente…');
 t.pos(50,7.74);run('Place710.paintSigns()');
 ok('ancienne adresse éloignée masquée',address().textContent,'Adresse indisponible');
 t.dom.window.close();console.log('\n'+checks+' vérifications adresse 7.22 réussies.');
})().catch(e=>{console.error(e);process.exit(1);});
