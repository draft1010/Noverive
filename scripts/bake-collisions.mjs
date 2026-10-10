import fs from 'node:fs';
import {Matrix4,Vector3,Quaternion} from '../vendor/three.module.js';
import {ASSETS} from '../src/world/asset-catalog.js';
// Bake body-height silhouettes from the shipped meshes. Runtime needs no mesh raycasts.
const profiles={};
function hull(points){const p=[...new Map(points.map(v=>[v.join(','),v])).values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);if(p.length<3)return p;const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);const half=list=>{const out=[];for(const a of list){while(out.length>1&&cross(out.at(-2),out.at(-1),a)<=.00001)out.pop();out.push(a);}return out;};return [...half(p).slice(0,-1),...half([...p].reverse()).slice(0,-1)];}
function clip(poly,y,above){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],ia=above?a[1]>=y:a[1]<=y,ib=above?b[1]>=y:b[1]<=y;if(ia)out.push(a);if(ia!==ib){const t=(y-a[1])/(b[1]-a[1]);out.push(a.map((v,k)=>v+(b[k]-v)*t));}}return out;}
for(const [id,a] of Object.entries(ASSETS)){
 if(/^(Road_|StreetTile_|Character)|Grass|Flower|Bush/.test(id)&&!/^FlowerPlace/.test(id))continue;
 const b=fs.readFileSync(a.file),j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));let bin;for(let off=12;off<b.length;){const n=b.readUInt32LE(off),type=b.readUInt32LE(off+4);if(type===0x004e4942)bin=b.subarray(off+8,off+8+n);off+=n+8;}if(!bin)continue;
 const read=(n)=>{const a=j.accessors[n],v=j.bufferViews[a.bufferView],size={5126:4,5125:4,5123:2,5121:1}[a.componentType],components={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type],stride=v.byteStride||size*components,method={5126:'readFloatLE',5125:'readUInt32LE',5123:'readUInt16LE',5121:'readUInt8'}[a.componentType];return Array.from({length:a.count},(_,i)=>Array.from({length:components},(_,k)=>bin[method]((v.byteOffset||0)+(a.byteOffset||0)+i*stride+k*size)));};
 const polys=[];
 const visit=(index,parent)=>{const node=j.nodes[index],local=node.matrix?new Matrix4().fromArray(node.matrix):new Matrix4().compose(new Vector3(...(node.translation||[0,0,0])),new Quaternion(...(node.rotation||[0,0,0,1])),new Vector3(...(node.scale||[1,1,1]))),matrix=parent.clone().multiply(local);
 if(node.mesh!==undefined)for(const prim of j.meshes[node.mesh].primitives){if(prim.mode!==undefined&&prim.mode!==4)continue;const pos=read(prim.attributes.POSITION).map(p=>{const v=new Vector3(...p).applyMatrix4(matrix);return [v.x-a.center[0],v.y-a.minY,v.z-a.center[2]];}),indices=prim.indices===undefined?pos.map((_,i)=>i):read(prim.indices).flat();for(let i=0;i<indices.length;i+=3){const tri=indices.slice(i,i+3).map(k=>pos[k]);const poly=clip(clip(tri,.16,true),/Tree/.test(id)?.65:1.7,false);if(poly.length>=3)polys.push(poly);}}
 for(const child of node.children||[])visit(child,matrix);};
 for(const n of j.scenes[j.scene||0].nodes)visit(n,new Matrix4().makeRotationX(a.rotationX||0));
 // Separate disconnected legs, posts and walls after clipping away overhead geometry.
 const parent=polys.map((_,i)=>i),find=i=>parent[i]===i?i:parent[i]=find(parent[i]),vertices=new Map();polys.forEach((poly,i)=>{for(const p of poly){const key=p.map(v=>Math.round(v*10000)).join(',');if(vertices.has(key))parent[find(i)]=find(vertices.get(key));else vertices.set(key,i);}});
 const groups=new Map();polys.forEach((poly,i)=>{const root=find(i);if(!groups.has(root))groups.set(root,[]);groups.get(root).push(...poly.map(p=>[+p[0].toFixed(3),+p[2].toFixed(3)]));});
 let shapes=[...groups.values()].map(hull).filter(p=>p.length>=2);
 if(id==='SM_Hay_1')shapes=[hull(shapes.flat())];
 const inside=(p,poly)=>poly.length>2&&poly.every((a,i)=>{const b=poly[(i+1)%poly.length];return (b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0])>=-.0001;});
 const area=poly=>Math.abs(poly.reduce((v,p,i)=>{const q=poly[(i+1)%poly.length];return v+p[0]*q[1]-p[1]*q[0];},0));
 shapes=shapes.filter((poly,i)=>!shapes.some((outer,j)=>i!==j&&outer.length>2&&poly.every(p=>inside(p,outer))&&(area(outer)>area(poly)+.0001||j<i)));
 profiles[id]=shapes;
}
fs.writeFileSync('src/world/collision-profiles.js','// Generated from body-height mesh geometry by scripts/bake-collisions.mjs.\nexport const COLLISION_PROFILES = '+JSON.stringify(profiles)+';\n');
console.log(Object.keys(profiles).length+' profiles, '+fs.statSync('src/world/collision-profiles.js').size+' bytes');
