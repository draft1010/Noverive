import {T} from './art.js';
import {GLTFLoader} from '../../vendor/addons/loaders/GLTFLoader.js';
let source;
function loadCar(){return source ||= new GLTFLoader().loadAsync('assets/openworld/player-car.glb').then(g=>g.scene);}
export function carModel(preview=false){
  const group=new T.Group();
  group.userData.dispose=()=>{group.userData.disposed=true;if(preview)group.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});};
  group.userData.ready=loadCar().then(root=>{
    if(group.userData.disposed)return;
    const model=root.clone(true);
    // Pack vehicle points along -X; the game's forward direction is +Z.
    model.rotation.y=Math.PI/2;
    model.position.y=.237;
    model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(preview){const convert=m=>{m=m.clone();m.transparent=true;m.opacity=.5;m.depthWrite=false;return m;};o.material=Array.isArray(o.material)?o.material.map(convert):convert(o.material);}}});
    group.add(model);group.userData.wheels=['FL','FR','RL','RR'].map(n=>model.getObjectByName(n)).filter(Boolean);
    group.userData.front=['FL','FR'].map(n=>model.getObjectByName(n)).filter(Boolean);
  }).catch(e=>{console.error('Chargement voiture',e);});
  return group;
}
export class VehicleFleet {
  constructor(scene){this.scene=scene;this.meshes=new Map();}
  sync(buildings,height,visible=true){
    const cars=buildings.filter(b=>b.type==='car');
    for(const [car,mesh] of this.meshes)if(!cars.includes(car)){mesh.userData.dispose();mesh.removeFromParent();this.meshes.delete(car);}
    for(const car of cars){let mesh=this.meshes.get(car);if(!mesh){mesh=carModel();this.meshes.set(car,mesh);this.scene.add(mesh);}mesh.visible=visible;mesh.position.set(car.x,height(car.x,car.z),car.z);mesh.rotation.y=car.r||0;}
  }
  update(car,dt,height,steer){const mesh=this.meshes.get(car);if(!mesh)return;mesh.position.set(car.x,height(car.x,car.z),car.z);mesh.rotation.y=car.r||0;for(const w of mesh.userData.wheels||[])w.rotation.z-=(car.speed||0)*dt/.25;for(const w of mesh.userData.front||[])w.rotation.y=-steer*.35;}
}
