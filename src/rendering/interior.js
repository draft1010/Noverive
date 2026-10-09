import {placeModel,disposeModels} from '../world/model-library.js';
import {upgradeFurniture,disposeFurniture} from './modern-furniture.js';
import {T,Factory,furnishing} from './art.js';
import {spaceOf} from '../systems/homestead.js';
export const stairHeight = z => Math.max(0,Math.min(3.6,(3-z)*3.6/8));
export function indoorHeight(x,z,previous=0) {
 if(x>5.3 && z>=-5 && z<=3.3) return stairHeight(z);
 return previous>3.3 ? 3.6 : 0;
}
export function indoorCollision(x,z,r=.4,y=0) {
 if(Math.abs(x)>8.7-r || Math.abs(z)>7.7-r) return true;
 // The stair balustrade keeps players from stepping through its sides.
 if(Math.abs(x-5.15)<.14+r && z>-5.1-r && z<3.1+r) return true;

 if(y>3.3 && x>5.3-r && Math.abs(z-3.3)<.16+r)return true;
 // Upper room partition with a generous central doorway.
 if(y>3.3 && Math.abs(z+.9)<r+.12 && x<4.9 && Math.abs(x+2)>1.2+r) return true;
 return false;
}
// Placement uses the real room envelope rather than the larger player-safety margin.
// This lets furniture sit visually against a wall while keeping the stair/partition solid.
export function indoorPlacementCollision(x,z,r=.02,y=0) {
 if(Math.abs(x)>8.875-r || Math.abs(z)>7.875-r) return true;
 if(Math.abs(x-5.15)<.14+r && z>-5.1-r && z<3.1+r) return true;
 if(y>3.3 && x>5.3-r && Math.abs(z-3.3)<.16+r)return true;
 if(y>3.3 && Math.abs(z+.9)<r+.12 && x<4.9 && Math.abs(x+2)>1.2+r) return true;
 return false;
}
export class Interior {
 constructor(location="home") {
  this.location=location;this.fixedColliders=[];
  this.scene=new T.Scene(); this.scene.background=new T.Color('#b8ad96');
  this.scene.add(new T.HemisphereLight('#fff4df','#8b927f',1.7));
  const sun=new T.DirectionalLight('#fff0d3',1.8);sun.position.set(-6,8,5);this.scene.add(sun);
  this.root=new T.Group();this.scene.add(this.root);const f=new Factory(this.root,true);
  const box=(c,x,y,z,w,h,d,kind='wood',glow=0)=>f.part('box',c,x,y,z,w,h,d,0,0,0,kind,glow);
  box('#b59b74',0,-.12,0,18,.24,16);
  // Real upper floor with a stairwell along the east wall.
  box('#bd9e73',-1.8,3.48,0,14.4,.24,16);
  box('#bd9e73',7.2,3.48,-6.5,3.6,.24,3);
  box('#bd9e73',7.2,3.48,5.7,3.6,.24,4.6);
  for(const level of [0,3.6]) {
   for(const x of [-9,9]) {
    box('#e5e9e3',x,level+1.8,0,.25,3.6,16,'plaster');
    for(const z of [-4,3]) {
     box('#425c60',x*.984,level+2,z,.14,1.8,2.6);
     box('#a9cec0',x*.973,level+2,z,.15,1.55,2.35,'',.4);
     box('#425c60',x*.961,level+2,z,.16,1.55,.08);
    }
   }
   box('#e9e8df',0,level+1.8,-8,18,3.6,.25,'plaster');
   if(level>0)box('#e9e8df',0,level+1.8,8,18,3.6,.25,'plaster');
   else {
   box('#e9e8df',-5.1,level+1.8,8,7.8,3.6,.25,'plaster');
   box('#e9e8df',5.1,level+1.8,8,7.8,3.6,.25,'plaster');
   box('#e9e8df',0,level+3.15,8,2.4,.9,.25,'plaster');
   }
   for(const z of [-7.8,7.8]) box('#87958e',0,level+.12,z,17.8,.24,.1);
   for(const x of [-8.8,8.8]) box('#87958e',x,level+3.3,0,.22,.24,16);
  }
  box('#e9e8df',0,7.35,0,18,.25,16,'plaster');
  box('#dbe2de',-6,5.2,-.9,6,3.2,.2,'plaster');
  box('#dbe2de',2.5,5.2,-.9,5.2,3.2,.2,'plaster');
  for(let i=0;i<18;i++) {const h=(i+1)*.2;box('#ad8b5b',7.15,h/2,3-(i+.5)*8/18,3.3,h,8/18);}
  // Enclose the stairwell with a plaster half-wall and continuous wooden coping.
  box('#dbe2de',5.25,2.25,-1,.3,4.5,8.2,'plaster');
  box('#425c60',5.25,4.56,-1,.4,.14,8.4);
  box('#dbe2de',7.13,4.05,3.3,3.75,.9,.26,'plaster');
  box('#425c60',7.13,4.56,3.3,3.85,.14,.38);
  // A sloping handrail on the outer wall follows the steps without floating posts.
  f.part('box','#425c60',8.65,2.75,-1,.16,.14,Math.hypot(8,3.6),Math.atan(3.6/8),0,0,'wood');
  // Door and fixed warm wall sconces; most space remains empty for crafting.
  // Recessed door, frame, raised panels and brass handle: distinct from the wall.
  box('#695640',0,1.35,7.94,2.1,2.7,.12,'');
  for(const x of [-1.13,1.13])box('#425c60',x,1.4,7.77,.17,2.8,.22,'');
  box('#425c60',0,2.79,7.77,2.43,.18,.22,'');
  box('#a48a65',0,.06,7.63,2.4,.12,.55,'');
  for(const x of [-.49,.49])for(const y of [.68,1.92])box('#94734f',x,y,7.855,.8,1.05,.08,'');
  box('#c7a05c',.79,1.35,7.73,.08,.3,.08,'');
  f.part('sphere','#e2bd6e',.79,1.38,7.65,.07,.07,.07);
  for(const y of [.35,2.25])box('#434943',-.97,y,7.83,.18,.12,.05,'');
  for(const level of [0,3.6]) for(const x of [-6,6]) box('#f3c774',x,level+2.4,-7.8,.25,.45,.18,'',.7);
  f.flush();
  this.materials=[];const clones=new Map();
  this.root.traverse(o=>{if(!o.isMesh)return;const base=o.material;
   if(!clones.has(base)){const m=base.clone();m.userData={cutawayExcluded:!['#e5e9e3','#e9e8df','#e9e8df','#dbe2de'].some(c=>base.color.equals(new T.Color(c)))};
    if(['#e5e9e3','#e9e8df','#e9e8df','#dbe2de'].some(c=>base.color.equals(new T.Color(c)))){m.map=null;m.roughness=1;}
    if(m.map){m.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>
#ifdef USE_MAP
vec4 roomP=vec4(position,1.);vec3 roomN=normal;
#ifdef USE_INSTANCING
roomP=instanceMatrix*roomP;roomN=mat3(instanceMatrix)*roomN;
#endif
vec3 roomW=(modelMatrix*roomP).xyz;
vec3 roomA=abs(normalize(roomN));
vMapUv=roomA.y>.5?roomW.xz*.45:(roomA.x>.5?roomW.zy*.45:roomW.xy*.45);
#endif`);};m.customProgramCacheKey=()=> 'interior-world-uv-v1';}
    clones.set(base,m);this.materials.push(m);
   }o.material=clones.get(base);
  });
  this.floors=[];
  for(const y of [0,3.6]) {const m=new T.Mesh(new T.PlaneGeometry(18,16),new T.MeshBasicMaterial({visible:false}));m.rotation.x=-Math.PI/2;m.position.y=y;this.scene.add(m);this.floors.push(m);}
  this.fixtures=new T.Group();this.scene.add(this.fixtures);
  const addFixture=(id,x,y,z,s=1,r=0)=>{placeModel(id,this.fixtures,x,y,z,s,r).catch(e=>console.warn(e.message));this.fixedColliders.push({x,y,z,w:1.5,d:1.5});};
  addFixture('Sink_A',-7.1,0,-6.8,1.1,Math.PI/2);addFixture('StationTable_1_A',-5.5,0,-6.8,1.1,Math.PI/2);
  if(location==='house--20--1'){
    for(const x of [-4,0])for(const z of [-2,3]){addFixture('Table_1_A',x,0,z,1.1);addFixture('Chair_1_A',x-1.2,0,z,1,Math.PI/2);addFixture('Chair_1_A',x+1.2,0,z,1,-Math.PI/2);}
    addFixture('Owen_A',-3.8,0,-6.8,1.1);addFixture('Sofa_1_A',-7,0,2,1.3,Math.PI/2);
  }
  this.furniture=new T.Group();this.scene.add(this.furniture);this.key='';
 }
 sync(state) {
  const list=state.buildings.filter(b=>spaceOf(b)===(state.location||'world'));
  const key=JSON.stringify(list.map(({type,x,z,y,r})=>({type,x,z,y,r})));
  if(key===this.key)return;this.key=key;
  disposeFurniture(this.furniture);this.furniture.traverse(o=>{if(o.isInstancedMesh)o.dispose();});this.furniture.clear();
  for(const b of list){const g=new T.Group(),f=new Factory(g,true);furnishing(f,b.type,0,0,0,b.r);f.flush();upgradeFurniture(g,b);g.position.set(b.x,b.y||0,b.z);g.userData.building=b;this.furniture.add(g);}
 }
 collides(x,z,r=.4,y=0){return indoorCollision(x,z,r,y)||this.fixedColliders.some(c=>Math.abs(y-c.y)<1&&Math.abs(x-c.x)<c.w/2+r&&Math.abs(z-c.z)<c.d/2+r);}
 dispose(){disposeModels(this.fixtures);disposeFurniture(this.furniture);for(const m of this.materials)m.dispose();this.root.traverse(o=>{if(o.isInstancedMesh)o.dispose();});this.furniture.traverse(o=>{if(o.isInstancedMesh)o.dispose();});for(const m of this.floors){m.geometry.dispose();m.material.dispose();}this.scene.clear();}
}
