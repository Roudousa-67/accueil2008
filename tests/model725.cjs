// Charge le GLB optimisé avec le vrai THREE.GLTFLoader livré dans l'APK.
// Les images sont simulées : ce contrôle porte sur décodage, géométrie et cadrage.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=path.join(__dirname,'../sources_assets');
const ctx={console,TextDecoder,TextEncoder,URL,Blob,fetch,ArrayBuffer,Uint8Array,DataView,setTimeout,clearTimeout,createImageBitmap:async()=>({width:1024,height:1024}),ProgressEvent:class{}};
ctx.self=ctx;ctx.window=ctx;ctx.navigator={userAgent:'Node test'};
ctx.Image=class{constructor(){this.height=this.width=1;}set src(v){queueMicrotask(()=>this.onload&&this.onload());}};
vm.createContext(ctx);
for(const f of ['lib/three.min.js','lib/GLTFLoader.js','lib/meshopt_decoder.js'])vm.runInContext(fs.readFileSync(path.join(dir,f),'utf8'),ctx,{filename:f});
function load(file){const b=fs.readFileSync(file);const ab=b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);return new Promise((resolve,reject)=>new ctx.THREE.GLTFLoader().setMeshoptDecoder(ctx.MeshoptDecoder).parse(ab,'',resolve,reject));}
(async()=>{
 await ctx.MeshoptDecoder.ready;
 const file=path.join(dir,'car/2008.glb');assert(fs.statSync(file).size<1500000,'modèle inférieur à 1,5 Mo');
 const model=await load(file);model.scene.updateMatrixWorld(true);
 const box=new ctx.THREE.Box3().setFromObject(model.scene);let vertices=0,triangles=0;
 model.scene.traverse(o=>{if(o.isMesh){vertices+=o.geometry.attributes.position.count;triangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;}});
 assert(vertices>0&&triangles>0);assert(box.max.z-box.min.z>3,'longueur du véhicule conservée');
 assert(box.max.x-box.min.x>1,'largeur du véhicule conservée');
 const result={bytes:fs.statSync(file).size,vertices,triangles,min:box.min.toArray(),max:box.max.toArray()};
 if(process.env.BASE_MODEL){const original=await load(process.env.BASE_MODEL);original.scene.updateMatrixWorld(true);const base=new ctx.THREE.Box3().setFromObject(original.scene);let oldTriangles=0;original.scene.traverse(o=>{if(o.isMesh)oldTriangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;});assert.equal(triangles,oldTriangles,'aucun triangle supprimé');for(const axis of ['x','y','z']){assert(Math.abs(base.min[axis]-box.min[axis])<.005);assert(Math.abs(base.max[axis]-box.max[axis])<.005);}result.originalBytes=fs.statSync(process.env.BASE_MODEL).size;}
 console.log('Modèle optimisé chargé par GLTFLoader : '+JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1;});
