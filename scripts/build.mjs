import {cp,mkdir,writeFile,readFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const destination=resolve(process.argv[2]||'dist');
await mkdir(destination,{recursive:true});
for(const entry of ['index.html','style.css','manifest.webmanifest','sw.js','src','assets','vendor'])await cp(entry,resolve(destination,entry),{recursive:true});
await writeFile(resolve(destination,'.nojekyll'),'');
// Every file in the offline list must also be shipped by the static build.
const serviceWorker=await readFile('sw.js','utf8');const list=JSON.parse(serviceWorker.match(/const FILES = (\[[\s\S]*?\]);/)[1]);
for(const file of list)await readFile(resolve(destination,file==="./"?"index.html":file));
console.log(`Noverive prêt : ${destination}`);

