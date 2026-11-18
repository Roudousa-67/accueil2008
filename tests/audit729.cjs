'use strict';
process.env.TZ = 'Europe/Paris';
const assert = require('node:assert/strict');
const {make} = require('./regression.cjs');
const t = make({extraScripts:['decors726.js', 'driver728.js', 'near728.js', 'v728.js']});
const run = t.run;
let checks = 0;
function check(name, expression) {
  assert.equal(run(expression), true, name);
  console.log('OK ' + name);
  checks++;
}
run("trk=null; store.set('trkIndex',[]); store.set('trkAuto',false); trkFull=false; trkWeeksOn=false;");
check('écran vide manuel', "pageTracks(palette()).includes('Touche « Démarrer »')");
run("store.set('trkAuto',true)");
check('écran vide automatique', "pageTracks(palette()).includes('quand la voiture roule')");
run("loc={lat:48,lon:7,acc:5,ts:Date.now()-11000}; trkAct('start')");
check('ancienne position refusée', 'trk===null');
run("loc.ts=Date.now(); loc.acc=90; trkAct('start')");
check('position imprécise refusée', 'trk===null');
run("loc.acc=8; trkAct('start')");
check('position fraîche acceptée', 'trk && trk.t0===loc.ts');
run("trkOnLoc({...loc,lat:49,ts:loc.ts-200}); trkOnLoc({...loc,lat:NaN,ts:loc.ts+1000});");
check('points périmés et invalides ignorés', 'trkPts.length===1 && trk.km===0');
run("trk=null; Settings720.query='limitation'; Settings720.filter='Navigation'; openSet('Navigation','Météo et vigilance');");
check('ancien lien météo malgré une recherche', "SETCATS[setCat][0]==='Météo' && SETCATS[setCat][1][setSub][0]==='Affichage et vigilance' && !Settings720.active()");
run('openSet("Écran d\'accueil","Alignement GPS et plein écran")');
check('ancien lien alignement', "SETCATS[setCat][1][setSub][0]==='Cadre GPS et alignement'");
run("Settings720.query='vue conducteur'");
check('titre exact en premier', "Settings720.matches(palette())[0].name==='Vue conducteur'");
for (const [today,yesterday,previous] of [
  ['2026-03-30T12:00:00','2026-03-29T00:01:00','2026-03-28T23:59:00'],
  ['2026-10-26T12:00:00','2026-10-25T00:01:00','2026-10-24T23:59:00']
]) {
  t.advance(new Date(today).getTime()-run('Date.now()'));
  check('jour civil après changement d’heure '+today, `day47(+new Date('${yesterday}'))==='Hier' && day47(+new Date('${previous}'))!=='Hier'`);
}
t.advance(new Date('2026-10-29T12:00:00').getTime()-run('Date.now()'));
run("store.set('trkIndex',[{t0:+new Date('2026-10-23T00:05:00'),km:1},{t0:+new Date('2026-10-22T23:59:00'),km:2}])");
check('sept dates civiles incluent le premier matin', 'trkSums()[1][2]===1 && trkSums()[1][1]===1');
t.dom.window.close();
console.log(checks+' contrôles ciblés réussis.');
