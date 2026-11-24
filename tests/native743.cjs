'use strict';
// 7.43 : lecture du code des applis système (StringScan743), en Java pur.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const has=cmd=>{try{cp.execFileSync(cmd,['-version'],{stdio:'ignore'});return true;}catch(e){return false;}};
if(!has('javac')||!has('java')){console.log('Java absent : test de la recherche de l’affichage ignoré.');process.exit(0);}
const root=path.join(__dirname,'..'),out=fs.mkdtempSync(path.join(os.tmpdir(),'t743-'));
cp.execFileSync('javac',['--release','8','-encoding','UTF-8','-Xlint:-options','-d',out,path.join(root,'module_GPS_java/java/fr/gtline/accueil2008/StringScan743.java'),path.join(__dirname,'java743/ScanTest.java')],{stdio:['ignore','ignore','inherit']});
const res=cp.spawnSync('java',['-Dfile.encoding=UTF-8','-Dstdout.encoding=UTF-8','-cp',out,'fr.gtline.accueil2008.ScanTest'],{encoding:'utf8',timeout:60000});
process.stdout.write((res.stdout||'').split('\n').filter(l=>!/^Picked up/.test(l)).join('\n'));
fs.rmSync(out,{recursive:true,force:true});
if(res.status!==0){console.error(res.stderr);process.exit(1);}
