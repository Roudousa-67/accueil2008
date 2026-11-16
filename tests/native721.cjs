const fs=require('fs'),os=require('os'),path=require('path'),cp=require('child_process');
const root=path.resolve(__dirname,'..'),out=fs.mkdtempSync(path.join(os.tmpdir(),'accueil-native721-'));
function run(command,args){const r=cp.spawnSync(command,args,{stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)throw Error(command+' a échoué : '+r.status);}
try{
 const source=path.join(root,'module_GPS_java/java/fr/gtline/accueil2008/FilePolicy721.java'),test=path.join(__dirname,'FilePolicy721Test.java');
 if(process.env.ECJ_JAR)run('java',['-jar',process.env.ECJ_JAR,'-8','-proc:none','-nowarn','-d',out,source,test]);
 else run('javac',['-d',out,source,test]);
 run('java',['-Djava.io.tmpdir='+out,'-cp',out,'FilePolicy721Test']);
}finally{fs.rmSync(out,{recursive:true,force:true});}
