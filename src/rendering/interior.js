import {circleHitsRect} from '../world/collision.js';
import {buildInterior} from './interior-design.js';
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
 constructor(location='home') {this.location=location;buildInterior(this,location);}
 sync(state) {
  const list=state.buildings.filter(b=>spaceOf(b)===(state.location||'world'));
  const key=JSON.stringify(list.map(({type,x,z,y,r})=>({type,x,z,y,r})));
  if(key===this.key)return;this.key=key;
  disposeFurniture(this.furniture);this.furniture.traverse(o=>{if(o.isInstancedMesh)o.dispose();});this.furniture.clear();
  for(const b of list){const g=new T.Group(),f=new Factory(g,true);furnishing(f,b.type,0,0,0,b.r);f.flush();upgradeFurniture(g,b);g.position.set(b.x,b.y||0,b.z);g.userData.building=b;this.furniture.add(g);}
 }
 collides(x,z,r=.4,y=0){return indoorCollision(x,z,r,y)||this.fixedColliders.some(c=>Math.abs(y-c.y)<1&&circleHitsRect(x,z,r,c));}
 dispose(){disposeModels(this.fixtures);disposeFurniture(this.furniture);for(const m of this.materials)m.dispose();this.root.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.isInstancedMesh)o.dispose();});this.furniture.traverse(o=>{if(o.isInstancedMesh)o.dispose();});for(const m of this.floors){m.geometry.dispose();m.material.dispose();}this.scene.clear();}
}
