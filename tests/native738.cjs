'use strict';
// 7.38 : serveur de transfert de l'autoradio, testé en vrai sur une connexion HTTP locale.
// Les classes Android utilisées sont remplacées par de petites imitations (tests/java738/stubs).
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const has=cmd=>{try{cp.execFileSync(cmd,['-version'],{stdio:'ignore'});return true;}catch(e){return false;}};
if(!has('javac')||!has('java')){console.log('Java absent : test du serveur de transfert ignoré.');process.exit(0);}
const root=path.join(__dirname,'..'),out=fs.mkdtempSync(path.join(os.tmpdir(),'t738-'));
const list=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?list(path.join(dir,e.name)):e.name.endsWith('.java')?[path.join(dir,e.name)]:[]);
const sources=[...list(path.join(__dirname,'java738/stubs')),path.join(root,'module_GPS_java/java/fr/gtline/accueil2008/LocalTransfer738.java')];
cp.execFileSync('javac',['--release','8','-encoding','UTF-8','-Xlint:-options','-d',out,...sources],{stdio:['ignore','ignore','inherit']});
cp.execFileSync('javac',['-encoding','UTF-8','-nowarn','-cp',out,'-d',out,path.join(__dirname,'java738/TransferTest.java')],{stdio:['ignore','ignore','inherit']});
const res=cp.spawnSync('java',['-Dfile.encoding=UTF-8','-Dstdout.encoding=UTF-8','-Dassets.dir='+path.join(root,'sources_assets'),'-cp',out,'fr.gtline.accueil2008.TransferTest'],{encoding:'utf8',timeout:120000});
process.stdout.write((res.stdout||'').split('\n').filter(l=>!/^Picked up/.test(l)).join('\n'));
fs.rmSync(out,{recursive:true,force:true});
if(res.status!==0){console.error(res.stderr);process.exit(1);}
