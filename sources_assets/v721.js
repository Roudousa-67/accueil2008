/* 7.21 : options de décor choisies D04 et D13–D50. Dessin local, sans réseau. */
'use strict';
window.Decor721 = {
 defs: [
 [4,0,'Roues en rotation','Rotation liée à la vitesse ; arrêt quand la voiture est immobile.'],
 [13,1,'Accotements naturels','Herbe et bordures entre la route et la végétation.'],[14,1,'Virages doux','Courbure décorative légère ; la voiture reste centrée.'],[15,1,'Relief à l’horizon','Ondulations légères du paysage.'],[16,1,'Glissières détaillées','Rails et poteaux sur les côtés de l’autoroute.'],[17,1,'Balises réfléchissantes','Petits réflecteurs au bord de la chaussée.'],[18,1,'Marquages de nuit','Éclairage doux des traits de route.'],[19,1,'Route humide','Reflets atténués quand la météo indique pluie ou orage.'],[20,1,'Passages sous les ponts','Ponts décoratifs et variation progressive de lumière.'],
 [21,2,'Arbres plus variés','Feuillus et conifères alternés.'],[22,2,'Végétation en profondeur','Herbe, arbres proches et forêt lointaine.'],[23,2,'Densité du décor réglable','Choix peu, moyen ou beaucoup de végétation.'],[24,2,'Maisons de village','Façades, toits et détails variés.'],[25,2,'Ville plus vivante','Immeubles de hauteurs et couleurs différentes.'],[26,2,'Fenêtres allumées','Quelques fenêtres chaleureuses la nuit.'],[27,2,'Petites places et jardins','Espaces aménagés entre les bâtiments.'],[28,2,'Paysages de campagne','Champs et haies au-delà de l’accotement.'],[29,2,'Montagnes au loin','Silhouettes sur plusieurs plans.'],[30,2,'Décor saisonnier','Saison automatique ou choisie ; effet purement décoratif.'],
 [31,3,'Nuages en plusieurs plans','Mouvements lents à différentes profondeurs.'],[32,3,'Aube rosée','Teintes douces autour du lever du jour.'],[33,3,'Coucher de soleil doré','Teintes chaudes à la fin du jour.'],[34,3,'Nuit étoilée discrète','Étoiles fixes, sans clignotement.'],[35,3,'Halo de lune léger','Lueur fine autour de la lune.'],[36,3,'Rayons de soleil subtils','Rayons discrets quand le soleil est visible.'],[37,3,'Brume lointaine','Voile limité à l’horizon ; panneaux lisibles.'],[38,3,'Pluie fine latérale','Pluie sur les côtés quand la météo indique pluie ou orage.'],[39,3,'Neige légère','Flocons latéraux quand la météo indique neige.'],[40,3,'Vent dans la végétation','Faible balancement des feuillages.'],
 [41,4,'Défilement en profondeur','Plans proches plus rapides, plans éloignés plus lents.'],[42,4,'Apparition progressive','Arbres et bâtiments apparaissent depuis l’horizon.'],[43,4,'Sortie fluide de l’écran','Le décor sort par les bords.'],[44,4,'Panneaux près de la route','Rapproche le panneau avec marge protégée autour de la voiture.'],[45,4,'Petit espace pour le panneau','Réduit l’espace réservé entre panneau et bâtiments.'],[46,4,'Panneaux bien dégagés','Texte et poteaux restent devant la végétation.'],[47,4,'Passage naturel du panneau','Perspective commune avec les arbres, sortie latérale.'],[48,4,'Circulation inverse détaillée','Voitures de face sur la chaussée opposée de l’autoroute.'],[49,4,'Transitions progressives','Fondu entre les différents paysages.'],[50,4,'Niveaux d’animation','Calme, normal ou riche, avec aperçu avant application.']
 ,[51, 2, 'Tournesols', 'Rangées de tournesols illustratifs sur autoroute.'],
 [52, 2, 'Blé', 'Épis dorés au-delà des accotements sur autoroute.'],
 [53, 2, 'Terres cultivées', 'Parcelles de terre et sillons décoratifs sur autoroute.'],
 [54, 2, 'Prairies et vaches', 'Prairies clôturées avec quelques vaches sur autoroute.'],
 [55, 1, 'Portiques autoroutiers', 'Structures sans consigne routière passant au-dessus de la voiture.'],
 [56, 2, 'Parcs clôturés', 'Parcs urbains entourés de grilles.'],
 [57, 2, 'Enfants animés', 'Petites silhouettes en mouvement dans les parcs urbains.'],
 [58, 2, 'Toboggans', 'Jeux colorés dans les parcs urbains.'],
 [59, 2, 'Balançoires', 'Sièges oscillant doucement dans les parcs urbains.'],
 [60, 2, 'Écoles grillagées', 'Écoles illustratives et cours entourées de grillages.'],
 [61, 2, 'Commerces', 'Devantures de commerces imaginaires en ville.'],
 [62, 2, 'Mobilier urbain', 'Bancs, poubelles et bornes sur les trottoirs.'],
 [63, 2, 'Mairie du village', 'Bâtiment municipal illustratif, sans lien avec votre position.'],
 [64, 2, 'Jardins fleuris', 'Massifs colorés devant les maisons du village.'],
 [65, 2, 'Détails des maisons', 'Volets, portes, cheminées et clôtures dans les villages.'],
 [66, 2, 'Gros rochers', 'Rochers sur les côtés de la forêt.'],
 [67, 2, 'Relief forestier', 'Talus et collines illustratifs dans la forêt.'],
 [68, 2, 'Lac', 'Plan d’eau illustratif dans le paysage forestier.'],
 [69, 2, 'Rivière', 'Cours d’eau décoratif sur le côté de la forêt.'],
 [70, 2, 'Cascade', 'Cascade animée au loin dans la forêt.'],
 [71, 2, 'Cabanes', 'Petites cabanes en bois dans la forêt.'],
 [72, 2, 'Animaux forestiers', 'Cerfs, lapins, renards et oiseaux illustratifs.'],
 [73, 0, 'Faisceaux des phares', 'Lumière diffuse sur la route devant la voiture, uniquement la nuit.'],
 [74, 1, 'Lampadaires hauts', 'Lampadaires urbains avec lumière douce au sol la nuit.'],
 [75, 3, 'Reflets dans les yeux', 'Reflets nocturnes discrets sur les animaux activés.'],
 [76, 4, 'Limitations espacées', 'Panneau séparé : uniquement une limitation GPS récente et vérifiée ; aucune valeur inventée.'],
 [77, 4, 'Ancien nom barré', 'À un changement de localité confirmé par le GPS, montre brièvement le nom précédent barré. Aucune sortie supposée.']
 ],
 on(id){return store.get('decor721_D'+id,false)===true;},
 enabled(){return this.defs.some(d=>this.on(d[0]));},
 quality(){return this.on(50)?this.choice('decor721Quality',['calme','normal','riche'],'normal'):'normal';},
 choice(k,allowed,defaultValue){const v=store.get(k,defaultValue);return allowed.includes(v)?v:defaultValue;},
 season(){if(!this.on(30))return 'ete';const s=this.choice('decor721Season',['auto','printemps','ete','automne','hiver'],'auto');if(s!=='auto')return s;return ['hiver','hiver','printemps','printemps','printemps','ete','ete','ete','automne','automne','automne','hiver'][new Date().getMonth()];},
 density(){return this.on(23)?Number(this.choice('decor721Density',[0.6,1,1.5],1)):1;},
 level(){return {calme:0.65,normal:1,riche:1.3}[this.quality()];},
 preview:null,previewScene:'ville',previewWx:'soleil',previewHour:14,
 config(){const out={};this.defs.forEach(d=>out[d[0]]=this.on(d[0]));return out;},
 settings(p,group){
  let html='<div style="font-size:14px;margin-bottom:12px;color:'+p.mut+'">Options indépendantes, désactivées au départ pour conserver ton décor. Les protections des panneaux restent actives. Effets météo selon la météo reçue ; les décors restent illustratifs et ne décrivent pas les lieux réels. Aucune signalisation inventée ne sert de donnée de navigation.</div>';
  html+=this.defs.filter(d=>d[1]===group).map(d=>setRow(p,'D'+String(d[0]).padStart(2,'0')+' · '+d[2],d[3],chipBtn(p,'decor721:toggle:'+d[0],this.on(d[0])?'Activé':'Désactivé',this.on(d[0])))).join('');
  if(group===2)html+=setRow(p,'D23 · Quantité de végétation','Utilisée quand D23 est activé.',[0.6,1,1.5].map((v,i)=>chipBtn(p,'decor721:density:'+v,['Peu','Moyen','Beaucoup'][i],this.density()===v)).join(''))+setRow(p,'D30 · Saison','Choisis la saison ou suis le calendrier du poste.',['auto','printemps','ete','automne','hiver'].map((v,i)=>chipBtn(p,'decor721:season:'+v,['Automatique','Printemps','Été','Automne','Hiver'][i],store.get('decor721Season','auto')===v)).join(''));
  if(group===4)html+=setRow(p,'D50 · Niveau','Ce choix ne modifie pas les interrupteurs des autres effets.',['calme','normal','riche'].map(v=>chipBtn(p,'decor721:preview:'+v,v.charAt(0).toUpperCase()+v.slice(1),this.quality()===v)).join(''));
  return html+setRow(p,'Aperçu local','Teste sans changer ta position GPS ni les données de ta voiture.',chipBtn(p,'decor721:preview:'+this.quality(),'Voir l’animation'));
 },
 previewMarkup(p){if(!this.preview)return '';return `<div style="position:absolute;inset:0;z-index:4100;background:#080d19ec;padding:18px;display:flex;flex-direction:column;gap:10px;color:#fff"><b>Aperçu du décor · simulation à 60 km/h · aucun GPS modifié</b><div style="display:flex;gap:6px;flex-wrap:wrap">${['ville','village','campagne','foret','autoroute'].map(s=>chipBtn(p,'decor721:scene:'+s,s,this.previewScene===s)).join('')}${['soleil','pluie','neige'].map(s=>chipBtn(p,'decor721:weather:'+s,s,this.previewWx===s)).join('')}${[6,14,19,23].map(h=>chipBtn(p,'decor721:hour:'+h,h+' h',this.previewHour===h)).join('')}</div><div data-roadbox data-decor721-preview style="position:relative;flex:1;min-height:100px;overflow:hidden;border-radius:16px"><canvas data-road="v" style="width:100%;height:100%;position:absolute;inset:0"></canvas><div data-car360 style="position:absolute;left:50%;bottom:4%;height:60%;aspect-ratio:503/300;transform:translateX(-50%);background:url(car/route-360.webp) ${car360Pos()} 0/2400% 100% no-repeat;filter:drop-shadow(0 6px 6px #0008)"></div></div><div style="display:flex;gap:8px">${chipBtn(p,'decor721:apply','Appliquer le niveau '+this.preview,true)}${chipBtn(p,'decor721:close','Fermer sans changer le niveau')}</div></div>`;}
};
{const nav=SETCATS.find(c=>c[0]==='Navigation');if(nav){['Décor · Voiture','Décor · Route','Décor · Paysages','Décor · Ciel et météo','Décor · Animation et panneaux'].forEach((title,i)=>nav[1].push([title,p=>Decor721.settings(p,i)]));}}
// D49 utilise le fondu éprouvé et sa durée déjà réglable ; pas de fondu imposé si désactivé.
{const previous=RoadOptions718.duration;RoadOptions718.duration=()=>Decor721.on(49)?Math.max(1500,previous()):previous();}
{const previous=window.render;window.render=function(){const r=previous.apply(this,arguments);const s=Decor721.previewMarkup(curP||palette());if(s)$('screen').insertAdjacentHTML('beforeend',s);return r;};}
{const previous=window.act;window.act=function(a,long){if(!a.startsWith('decor721:'))return previous.apply(this,arguments);const [,op,text]=a.split(':');
 if(moving()&&!Decor721.preview){toast('Réglages du décor disponibles à l’arrêt.');return;}
 if(op==='toggle'&&Decor721.defs.some(d=>d[0]===Number(text))){store.set('decor721_D'+Number(text),!Decor721.on(Number(text)));RoadFX718.frames.clear();}
 else if(op==='density'&&[0.6,1,1.5].includes(Number(text)))store.set('decor721Density',Number(text));
 else if(op==='season'&&['auto','printemps','ete','automne','hiver'].includes(text))store.set('decor721Season',text);
 else if(op==='preview'&&['calme','normal','riche'].includes(text))Decor721.preview=text;
 else if(op==='scene'&&['ville','village','campagne','foret','autoroute'].includes(text))Decor721.previewScene=text;
 else if(op==='weather'&&['soleil','pluie','neige'].includes(text))Decor721.previewWx=text;
 else if(op==='hour'&&[6,14,19,23].includes(Number(text)))Decor721.previewHour=Number(text);
 else if(op==='apply'&&Decor721.preview){store.set('decor721Quality',Decor721.preview);store.set('decor721_D50',true);Decor721.preview=null;}
 else if(op==='close')Decor721.preview=null;
 Settings720.index=null;render();};}
