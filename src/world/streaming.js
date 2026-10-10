import {graphicsProfile} from '../rendering/graphics.js';
import {meadowTufts} from '../rendering/meadow.js';
import {T} from '../rendering/art.js';
import {terrainHeight,height,riverX,onBridge} from './terrain.js';
import {biomeAt,roadAt,wantedChunks,cityParkAt} from './regions.js';
import {sectorLayout,resourceLocations} from './layout.js';
import {acquireModel,releaseModel,instanceModel,modelStats} from './model-library.js';
import {landscapeMaterial} from '../rendering/landscape-material.js';
import {PLAN,inCity} from './plan.js';
const crystalGeometry=new T.CylinderGeometry(0,.32,1.5,5,1),crystalMaterial=new T.MeshStandardMaterial({color:'#72edec',emissive:'#159cbd',emissiveIntensity:.65,roughness:.22,metalness:.25});
function crystalCluster(){const g=new T.Group();for(let i=0;i<5;i++){const m=new T.Mesh(crystalGeometry,crystalMaterial),a=i*2.4,k=i===0?1.35:.55+i*.09;m.scale.setScalar(k);m.position.set(i?Math.cos(a)*.44:0,k*.65,i?Math.sin(a)*.44:0);m.rotation.z=i?Math.cos(a)*.35:0;m.castShadow=true;g.add(m);}return g;}
const grassMaterial=landscapeMaterial();
grassMaterial.userData.cutawayExcluded=true;
export function terrainMesh(cx,cz,size=32,steps=16){
 const geo=new T.PlaneGeometry(size,size,steps,steps);geo.rotateX(-Math.PI/2);const pos=geo.attributes.position,colors=[],surfaces=[],c=new T.Color();
 for(let i=0;i<pos.count;i++){const x=pos.getX(i)+cx,z=pos.getZ(i)+cz;pos.setY(i,terrainHeight(x,z));c.set(cityParkAt(x,z)?'#6e9258':biomeAt(x,z).color);const road=roadAt(x,z);let surface=inCity(x,z)&&!cityParkAt(x,z)?1:0;if(road)surface=road==='trail'?2:3;if(Math.hypot((x-410)/1.25,z-280)<96)surface=4;surfaces.push(surface);colors.push(c.r,c.g,c.b);}
 geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setAttribute('surface',new T.Float32BufferAttribute(surfaces,1));geo.computeVertexNormals();const mesh=new T.Mesh(geo,grassMaterial);mesh.position.set(cx,0,cz);mesh.receiveShadow=true;return mesh;
}
export class WorldStreamer {
 constructor(world){this.world=world;this.active=new Map();this.pending=0;this.failures=[];this.radius=80;this.lastKey='';this.elapsed=1;}
 update(dt,x,z,state){
  this.elapsed+=dt;this.state=state;this.profile=graphicsProfile(state.settings.quality);this.radius=this.profile.radius;
  if(this.elapsed<.15)return;this.elapsed=0;
  const wanted=wantedChunks(x,z,this.radius),keep=new Set(wantedChunks(x,z,this.radius+24).map(c=>c.key));this.desiredKeys=wanted.map(c=>c.key);
  for(const [key,sector] of this.active)if(!keep.has(key))this.unload(key,sector);
  for(const c of wanted){if(this.active.has(c.key))continue;if(this.pending>=2)break;this.load(c);}
  for(const r of this.world.resources){const visible=!(state.depleted[r.id]>state.day);r.mesh.visible=visible;if(r.collider)r.collider.disabled=!visible;}
  for(const s of this.active.values())if(s.detail)s.detail.visible=Math.hypot(s.x-x,s.z-z)<this.profile.detail;
  for(const sector of this.active.values())for(const grass of sector.grass||[]){grass.count=Math.ceil(grass.userData.fullCount*this.profile.grass);grass.visible=Math.hypot(sector.x-x,sector.z-z)<this.profile.detail;}
  this.world.chunks=[...this.active.values()];
 }
 async load(c){
  const w=this.world,g=new T.Group(),sector={...c,g,x:c.cx*32+16,z:c.cz*32+16,refs:[],dead:false,ready:false,resources:[],colliders:[]};
  this.active.set(c.key,sector);this.pending++;w.scene.add(g);
  const terrain=terrainMesh(sector.x,sector.z,32,this.profile?.terrain||8);g.add(terrain);sector.terrain=terrain;w.pickSurfaces.push(terrain);
  sector.detail=new T.Group();g.add(sector.detail);
  const layout=sectorLayout(c.cx,c.cz),groups=new Map();
  for(const p of layout.models){const key=p.id+(p.meadow?'|meadow':'')+(p.detail?'|detail':'');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(p);}
  try{
   // Sequential within a sector bounds both network and GPU upload spikes.
   for(const [key,placements] of groups){if(sector.dead)break;if(placements[0].meadow){const grass=meadowTufts(placements,g);grass.userData.fullCount=placements.length;sector.grass??=[];sector.grass.push(grass);continue;}const id=placements[0].id,root=await acquireModel(id);if(sector.dead){releaseModel(id);break;}sector.refs.push(id);instanceModel(root,id,placements,placements[0].detail?sector.detail:g);await new Promise(resolve=>setTimeout(resolve,0));}
   for(const spec of resourceLocations(c.cx,c.cz)){if(sector.dead)break;let mesh;if(spec.type==='crystal'){mesh=crystalCluster();}else{const root=await acquireModel(spec.model);if(sector.dead){releaseModel(spec.model);break;}sector.refs.push(spec.model);mesh=new T.Group();instanceModel(root,spec.model,[{x:0,y:0,z:0,s:spec.type==='fiber'?.42:spec.type==='wood'?1.1:.22}],mesh);if(['crystal','ore','coal'].includes(spec.type)){mesh.traverse(o=>{if(!o.isMesh)return;const clone=m=>{const a=m.clone();a.color.set(spec.type==='crystal'?'#9acfd5':spec.type==='ore'?'#bb8962':'#424d54');if(spec.type==='crystal'){a.emissive.set('#3b747d');a.emissiveIntensity=.35;}return a;};o.material=Array.isArray(o.material)?o.material.map(clone):clone(o.material);o.userData.ownsMaterial=true;});}
      }mesh.position.set(spec.x,height(spec.x,spec.z),spec.z);g.add(mesh);const collider=w.collider(spec.x,spec.z,.4),resource={...spec,mesh,collider};sector.resources.push(resource);sector.colliders.push(collider);w.resources.push(resource);mesh.visible=!(this.state?.depleted[spec.id]>this.state?.day);collider.disabled=!mesh.visible;}
   sector.ready=true;
  }catch(error){this.failures.push(`${c.key}: ${error.message}`);console.error('Secteur indisponible',c.key,error);}finally{this.pending--;}
 }
 unload(key,s){s.dead=true;s.g.removeFromParent();s.g.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.userData.ownsMaterial)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});s.terrain.geometry.dispose();for(const id of s.refs)releaseModel(id);const w=this.world;w.pickSurfaces=w.pickSurfaces.filter(o=>o!==s.terrain);w.resources=w.resources.filter(r=>!s.resources.includes(r));w.colliders=w.colliders.filter(c=>!s.colliders.includes(c));this.active.delete(key);}
 stats(){return {active:this.active.size,loading:this.pending,missing:(this.desiredKeys||[]).filter(k=>!this.active.get(k)?.ready).length,ready:[...this.active.values()].filter(s=>s.ready).length,radius:this.radius,failures:[...this.failures],...modelStats()};}
}
