'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const {make}=require('./regression.cjs');
class Bucket {
 constructor(){this.records=new Map();}
 async put(key,value,options={}){if(options.onlyIf?.etagDoesNotMatch==='*'&&this.records.has(key))return null;const bytes=typeof value==='string'?new TextEncoder().encode(value):new Uint8Array(value);this.records.set(key,{bytes,uploaded:new Date()});return {key};}
 async get(key){const value=this.records.get(key);if(!value)return null;return {json:async()=>JSON.parse(new TextDecoder().decode(value.bytes)),arrayBuffer:async()=>value.bytes.buffer.slice(value.bytes.byteOffset,value.bytes.byteOffset+value.bytes.byteLength)};}
 async delete(keys){for(const key of Array.isArray(keys)?keys:[keys])this.records.delete(key);}
 async list({prefix,limit}){return {objects:[...this.records].filter(([key])=>key.startsWith(prefix)).slice(0,limit).map(([key,value])=>({key,uploaded:value.uploaded}))};}
}
(async()=>{
 const worker=(await import(pathToFileURL(path.join(__dirname,'../transfer-server/worker.js')))).default;
 const env={BUCKET:new Bucket()},ctx={waitUntil(){}},origin='https://transfer.example';
 const call=(url,options={})=>worker.fetch(new Request(origin+url,options),env,ctx);
 const html=await (await call('/')).text();new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
 assert(!html.includes('http://'));
 const created=await call('/api/new?kind=ticket',{headers:{'CF-Connecting-IP':'test'}}),ticket=await created.json();
 assert.equal(created.status,200);assert(ticket.id&&ticket.read&&ticket.write);
 assert.equal((await call('/api/new?kind=ticket',{headers:{'CF-Connecting-IP':'test'}})).status,429);
 assert.equal((await call('/api/result/'+ticket.id+'?key=wrong')).status,403);
 const waiting=await (await call('/api/result/'+ticket.id+'?key='+ticket.read)).json();assert(waiting.waiting);
 const bytes=crypto.getRandomValues(new Uint8Array(100));
 const uploaded=await call('/api/upload/'+ticket.id,{method:'POST',headers:{Authorization:'Bearer '+ticket.write},body:bytes});assert.equal(uploaded.status,200);
 assert.equal((await call('/api/upload/'+ticket.id,{method:'POST',headers:{Authorization:'Bearer '+ticket.write},body:bytes})).status,409);
 const received=await (await call('/api/result/'+ticket.id+'?key='+ticket.read)).json();assert(received.ready);assert.deepEqual(Buffer.from(received.data,'base64'),Buffer.from(bytes));
 assert.equal((await call('/api/ack/'+ticket.id+'?key='+ticket.read)).status,200);
 assert.equal((await call('/api/result/'+ticket.id+'?key='+ticket.read)).status,410);
 const gpx=await (await call('/api/new?kind=gpx',{headers:{'CF-Connecting-IP':'gpx-test'}})).json();
 const key='transfers/'+gpx.id+'.json',record=await (await env.BUCKET.get(key)).json();record.expires=Date.now()-1;await env.BUCKET.put(key,JSON.stringify(record));
 assert.equal((await call('/api/result/'+gpx.id+'?key='+gpx.read)).status,410);
 assert.equal(await env.BUCKET.get(key),null);
 const t=make({extraScripts:['traffic730.js','decors726.js','driver728.js','near728.js','v728.js','v730.js','v731.js','v732.js','journeys733.js','v734.js','lib/qrcode-generator.js','transfer734.js']});
 t.run("openSet('Trajets et carburant','Importer depuis le téléphone')");
 assert(t.w.document.querySelector('[data-act="transfer734:ticket"]'));
 assert(t.w.document.querySelector('[data-act="transfer734:gpx"]'));
 assert.equal(t.w.Transfer734.validOrigin('https://transfer.example'),true);
 assert.equal(t.w.Transfer734.validOrigin('https://user:secret@transfer.example'),false);
 assert.equal(t.w.Transfer734.validOrigin('http://transfer.example'),false);
 t.run("act('tsub:fuel');act('journey733:receipts')");assert(t.w.document.querySelector('[data-act="transfer734:ticket"]'));
 t.run("act('tsub:hist')");assert(t.w.document.querySelector('[data-act="transfer734:gpx"]'));
 assert.equal(t.errors.length,0);
 t.dom.window.close();
 console.log('OK QR ticket et GPX visibles, service HTTPS, session temporaire, accès par jeton, fichier unique, réception et expiration');
})().catch(e=>{console.error(e);process.exitCode=1;});
