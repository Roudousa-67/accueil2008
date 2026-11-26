'use strict';
// 7.57 : ticket lu par le téléphone → plein rempli sur l'autoradio.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {make}=require('./regression.cjs');
const extra=['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','v737.js','lib/qrcode-generator.js','v738.js','transfer738.js','stations738.js','highway738.js','v740.js','diag738.js','display743.js','v750.js','secours753.js','uninstall753.js','bar754.js','wall755.js','ticket756.js','ticket757.js','settings738.js'];
(async()=>{
 const t=make({canvas:true,extraScripts:extra}),{w,run}=t;
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 // Nom donné par l'autoradio au fichier reçu (date + type + nom envoyé par le téléphone).
 const name='20261126-174200-ticket-ticket_L42.10_P1.729_E72.79_K45210.jpg';
 assert.deepEqual(JSON.parse(run(`JSON.stringify(Ticket757.parseName('file738:${name}'))`)),{litres:42.1,per:1.729,total:72.79,km:45210},'chiffres lus dans le nom');
 assert.equal(run("Ticket757.parseName('file738:20261126-174200-ticket-ticket.jpg')"),null,'photo seule : rien à remplir');
 // Réception : le plein est rempli.
 run(`Transfer738.onReceived({name:'${name}',kind:'ticket',type:'jpg',via:'internet'})`);
 t.timers.splice(0).forEach(x=>x.fn());t.timers.splice(0).forEach(x=>x.fn());
 const v=id=>run(`(document.getElementById('j733-${id}')||{}).value`);
 assert.equal(run('tab'),'trips','page Carburant ouverte');
 assert.equal(v('litres'),'42.1','litres');assert.equal(v('perLitre'),'1.729','prix au litre');assert.equal(v('paid'),'72.79','total');
 assert(run("(document.getElementById('j733-litres').closest('details')||{}).open")===true,'formulaire « Ajouter un plein » ouvert');
 // Redessin avant l'enregistrement : les chiffres reviennent.
 run('render()');t.timers.splice(0).forEach(x=>x.fn());assert.equal(v('litres'),'42.1','chiffres remis après redessin');
 // La page du téléphone lit le ticket et met les chiffres dans le nom du fichier.
 const page=fs.readFileSync(path.join(__dirname,'../docs/envoi.html'),'utf8');
 assert(page.includes("'ticket' + tag + '.jpg'")&&page.includes('tesseract.js@5.1.1')&&page.includes('Vérifie les chiffres lus'),'lecture sur le téléphone avec vérification');
 const parse=new Function(page.match(/ const num = [\s\S]*?\n \}\n(?= function loadOcr)/)[0]+';return parseTicket;')();
 assert.deepEqual(parse('TOTAL\nVOLUME 42,10 L\nPRIX 1,729 EUR/L\nMONTANT TTC 72,79 EUR'),{litres:42.1,total:72.79,per:1.729},'analyse du texte d’un ticket');
 assert.deepEqual(parse('Quantité : 30.00\nPrix unitaire 1.799\nA PAYER 53,97'),{litres:30,total:53.97,per:1.799},'autre présentation');
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 console.log('OK ticket lu : chiffres dans le nom, plein rempli et ouvert, remis après redessin, analyse du texte');
 console.log('Tests 7.57 réussis.');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
