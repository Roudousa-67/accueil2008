'use strict';
const assert = require('node:assert/strict');
const {make} = require('./regression.cjs');
const t = make({extraScripts:['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js']});
const {run:r,w} = t;
assert.equal(r('dockPos()'), 'gauche');
for (const pos of ['gauche','droite','haut','bas']) {
 r(`act('dockpos:${pos}');openSet('Widgets','Barre des raccourcis')`);
 assert.equal(w.document.querySelector('.dockPreview732').dataset.position, pos);
 assert.equal(!!w.document.querySelector('.dockPreview732 .vertical730'), ['gauche','droite'].includes(pos));
 assert(w.document.querySelector('#screen .dockSlot732'));
}
r("App730.save('dockBackground730','#102030');App730.save('dockIconColor732','#00ff00');App730.save('dockAccent730','#aabbcc');App730.apply()");
for (const nav of w.document.querySelectorAll('.dock730')) {
 assert.equal(nav.style.background, 'rgb(16, 32, 48)');
 assert.equal(nav.querySelector('svg').getAttribute('stroke'), '#00ff00');
}
r("onMedia({pkg:'player',title:'A',artist:'X',art:'coverA'},true);onMedia({pkg:'player',title:'A',artist:'X',pos:20},true)");
assert.equal(r('media.art'), 'coverA');
r("onMedia({pkg:'player',title:'B',artist:'X'},true)");
assert.equal(r('media.art'), '');
r("onMedia({pkg:'player',title:'B',artist:'X',art:'coverB'},true)");
assert.equal(r('media.art'), 'coverB');
assert.equal(t.errors.length, 0);
console.log('OK barre flottante, quatre positions, aperçu, couleurs et changement de pochette');
t.dom.window.close();
