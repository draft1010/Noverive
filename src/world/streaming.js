import {T} from '../rendering/art.js';
import {terrainHeight,height,riverX,onBridge} from './terrain.js';
import {biomeAt,roadAt,wantedChunks,cityParkAt} from './regions.js';
import {sectorLayout,resourceLocations} from './layout.js';
import {acquireModel,releaseModel,instanceModel,modelStats} from './model-library.js';
const grassMaterial=new T.MeshStandardMaterial({vertexColors:true,roughness:1});
grassMaterial.userData.cutawayExcluded=true;
export function terrainMesh(cx,cz,size=32,steps=16){
 const geo=new T.PlaneGeometry(size,size,steps,steps);geo.rotateX(-Math.PI/2);const pos=geo.attributes.position,colors=[],c=new T.Color();
 for(let i=0;i<pos.count;i++){const x=pos.getX(i)+cx,z=pos.getZ(i)+cz;pos.setY(i,terrainHeight(x,z));c.set(cityParkAt(x,z)?"#82aa74":biomeAt(x,z).color);const road=roadAt(x,z);if(road)c.set(road==='city'?'#68747b':road==='country'?'#858777':'#b3a27d');else c.offsetHSL(0,0,Math.sin(x*.11)*Math.cos(z*.13)*.025);colors.push(c.r,c.g,c.b);}
 geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();const mesh=new T.Mesh(geo,grassMaterial);mesh.position.set(cx,0,cz);mesh.receiveShadow=true;return mesh;
}
export class WorldStreamer {
 constructor(world){this.world=world;this.active=new Map();this.pending=0;this.failures=[];this.radius=80;this.lastKey='';this.elapsed=1;}
 update(dt,x,z,state){
  this.elapsed+=dt;this.state=state;this.radius=state.settings.quality==='low'?72:state.settings.quality==='medium'?104:136;
  if(this.elapsed<.15)return;this.elapsed=0;
  const wanted=wantedChunks(x,z,this.radius),keep=new Set(wantedChunks(x,z,this.radius+40).map(c=>c.key));this.desiredKeys=wanted.map(c=>c.key);
  for(const [key,sector] of this.active)if(!keep.has(key))this.unload(key,sector);
  for(const c of wanted){if(this.active.has(c.key))continue;if(this.pending>=2)break;this.load(c);}
  for(const r of this.world.resources){const visible=!(state.depleted[r.id]>state.day);r.mesh.visible=visible;if(r.collider)r.collider.disabled=!visible;}
  this.world.chunks=[...this.active.values()];
 }
 async load(c){
  const w=this.world,g=new T.Group(),sector={...c,g,x:c.cx*32+16,z:c.cz*32+16,refs:[],dead:false,ready:false,resources:[],colliders:[]};
  this.active.set(c.key,sector);this.pending++;w.scene.add(g);
  const terrain=terrainMesh(sector.x,sector.z);g.add(terrain);sector.terrain=terrain;w.pickSurfaces.push(terrain);
  const layout=sectorLayout(c.cx,c.cz),groups=new Map();
  for(const p of layout.models){if(!groups.has(p.id))groups.set(p.id,[]);groups.get(p.id).push(p);}
  try{
   // Sequential within a sector bounds both network and GPU upload spikes.
   for(const [id,placements] of groups){if(sector.dead)break;const root=await acquireModel(id);if(sector.dead){releaseModel(id);break;}sector.refs.push(id);instanceModel(root,id,placements,g);await new Promise(resolve=>setTimeout(resolve,0));}
   for(const spec of resourceLocations(c.cx,c.cz)){if(sector.dead)break;const root=await acquireModel(spec.model);if(sector.dead){releaseModel(spec.model);break;}sector.refs.push(spec.model);const mesh=new T.Group();instanceModel(root,spec.model,[{x:0,y:0,z:0,s:spec.type==='fiber'?.42:spec.type==='wood'?1.1:.22}],mesh);if(['crystal','ore','coal'].includes(spec.type)){mesh.traverse(o=>{if(!o.isMesh)return;const clone=m=>{const a=m.clone();a.color.set(spec.type==='crystal'?'#9acfd5':spec.type==='ore'?'#bb8962':'#424d54');if(spec.type==='crystal'){a.emissive.set('#3b747d');a.emissiveIntensity=.35;}return a;};o.material=Array.isArray(o.material)?o.material.map(clone):clone(o.material);o.userData.ownsMaterial=true;});}
      mesh.position.set(spec.x,height(spec.x,spec.z),spec.z);g.add(mesh);const collider=w.collider(spec.x,spec.z,.4),resource={...spec,mesh,collider};sector.resources.push(resource);sector.colliders.push(collider);w.resources.push(resource);mesh.visible=!(this.state?.depleted[spec.id]>this.state?.day);collider.disabled=!mesh.visible;}
   sector.ready=true;
  }catch(error){this.failures.push(`${c.key}: ${error.message}`);console.error('Secteur indisponible',c.key,error);}finally{this.pending--;}
 }
 unload(key,s){s.dead=true;s.g.removeFromParent();s.g.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.userData.ownsMaterial)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});s.terrain.geometry.dispose();for(const id of s.refs)releaseModel(id);const w=this.world;w.pickSurfaces=w.pickSurfaces.filter(o=>o!==s.terrain);w.resources=w.resources.filter(r=>!s.resources.includes(r));w.colliders=w.colliders.filter(c=>!s.colliders.includes(c));this.active.delete(key);}
 stats(){return {active:this.active.size,loading:this.pending,missing:(this.desiredKeys||[]).filter(k=>!this.active.get(k)?.ready).length,ready:[...this.active.values()].filter(s=>s.ready).length,radius:this.radius,failures:[...this.failures],...modelStats()};}
}

