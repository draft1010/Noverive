import {T} from '../rendering/art.js';
import {WorldStreamer,terrainMesh} from './streaming.js';
import {placeModel} from './model-library.js';
import {height,bridgeHeight} from './terrain.js';
import {PLAN,WORLD_SIZE} from './plan.js';
import {modernCharacter} from '../rendering/modern-character.js';
import {modelCreature} from '../rendering/monster-models.js';
import {species} from '../systems/data.js';
import {chooseEncounter} from '../systems/encounters.js';
export function buildModernWorld(w){
 T.Cache.enabled=false;T.Cache.clear();
 const ground=terrainMesh(0,0,WORLD_SIZE,256);ground.position.y=-.075;w.scene.add(ground);w.ground=ground;w.pickSurfaces=[ground];
 const waterMaterial=new T.MeshStandardMaterial({color:'#478f9b',roughness:.23,metalness:.28,transparent:true,opacity:.91});
 waterMaterial.uniforms={time:{value:0},sun:{value:1},lowQuality:{value:0}};waterMaterial.userData.cutawayExcluded=true;
 waterMaterial.onBeforeCompile=s=>{s.uniforms.uWaterTime=waterMaterial.uniforms.time;s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWater;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWater=(modelMatrix*vec4(position,1.)).xyz;');s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nuniform float uWaterTime; varying vec3 vWater;').replace('#include <color_fragment>','#include <color_fragment>\nfloat wave=sin(vWater.x*1.7+uWaterTime)*sin(vWater.z*1.2-uWaterTime*.7);diffuseColor.rgb*=.93+wave*.075;');};
 const water=new T.Mesh(new T.PlaneGeometry(WORLD_SIZE,WORLD_SIZE),waterMaterial);water.rotation.x=-Math.PI/2;water.position.y=-.48;w.water=water;w.scene.add(water);
 // Fine jets cascade between the actual fountain bowls.
 const jetGeometry=new T.BufferGeometry(),jetPositions=new Float32Array(360*3);jetGeometry.setAttribute('position',new T.BufferAttribute(jetPositions,3));const jets=new T.Points(jetGeometry,new T.PointsMaterial({color:'#c3f2f4',size:.055,transparent:true,opacity:.78,depthWrite:false}));jets.frustumCulled=false;w.scene.add(jets);
 w.fountain={update(t){jets.visible=Math.hypot(w.lastPlayerX+24,w.lastPlayerZ-28)<90;for(let i=0;i<360;i++){const stream=Math.floor(i/60),u=((i%60)/60+t*.65)%1,a=stream*Math.PI/3,r=.2+u*1.9;jetPositions[i*3]=-24+Math.cos(a)*r;jetPositions[i*3+1]=2.65+Math.sin(u*Math.PI)*.8-u*1.9;jetPositions[i*3+2]=28+Math.sin(a)*r;}jetGeometry.attributes.position.needsUpdate=true;}};
 // Architectural bridge: thin concrete deck, steel posts and continuous handrail.
 const bridgeGroup=new T.Group();w.scene.add(bridgeGroup);const steel=new T.MeshStandardMaterial({color:'#334c53',metalness:.65,roughness:.4}),concrete=new T.MeshStandardMaterial({color:'#c9c6b8',roughness:.88});
 function bar(x,y,z,sx,sy,sz,mat){const m=new T.Mesh(new T.BoxGeometry(sx,sy,sz),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;bridgeGroup.add(m);return m;}
 for(const z of [8,-30]){const geo=new T.PlaneGeometry(19,4.8,38,1);geo.rotateX(-Math.PI/2);const p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,bridgeHeight(p.getX(i)+19.5,z));geo.computeVertexNormals();const deck=new T.Mesh(geo,concrete);deck.position.x=19.5;deck.position.z=z;deck.receiveShadow=true;bridgeGroup.add(deck);w.pickSurfaces.push(deck);for(const side of [-1,1]){for(let x=10;x<=29;x+=1){const y=bridgeHeight(x,z);bar(x,y+.5,z+side*2.35,.045,1,.045,steel);bar(x,y+1.02,z+side*2.35,1.05,.055,.075,steel);}w.collider(19.5,z+side*2.35,0,'rect',19,.12);}for(const x of [12,27])bar(x,-.1,z,.6,1.5,4.2,concrete);}
 w.interactables.push(
  {type:'expedition',name:'Office des Horizons · expéditions',x:-32,z:34},
  {type:'shop',name:'Halles des Horizons · acheter et vendre',x:-78,z:28},
  {type:'home',name:'Votre maison · entrer',x:PLAN.door.x,z:PLAN.door.z},
  {type:'workbench',name:'Atelier du domaine',x:PLAN.workshop.x,z:PLAN.workshop.z},
  {type:'home',name:'Café des Horizons · entrer',location:'house--40-24',x:-34,z:24},
  {type:'home',name:'Maison des Explorateurs · entrer',location:'house--8-24',x:-13,z:24}
 );
 w.createParticles();w.populate();w.streamer=new WorldStreamer(w);w.streamer.update(1,PLAN.spawn.x,PLAN.spawn.z,{settings:{quality:'low'},depleted:{},day:1});
}
export function populateModernPeople(w){
 const people=[['Maëlle','Accueil des Horizons',-24,19],['Soline','Commerçante des Halles',-78,28],['Orin','Commerçant de semences',-62,32],['Ivo','Chercheur de résonance',-14,25],['Noé','Voisin des Vergers',-108,167],['Tess','Architecte du domaine',-114,178],['Ysée','Exploratrice',-12,30],['Alba','Voyageuse',-32,38]];
 for(let i=0;i<32;i++){const x=-54-(i%8)*48,z=-18-Math.floor(i/8)*48;people.push([['Lina','Sam','Milo','Nora','Jules','Aya','Lou','Eden'][i%8]+` ${Math.floor(i/8)+1}`,i%7===0?'Commerçant des Horizons':'Habitant des Horizons',x,z]);}
 people.forEach(([name,role,x,z],i)=>{if(w.collides(x,z,.4)){for(let k=1;k<12;k++)if(!w.collides(x+k*.5,z,.4)){x+=k*.5;break;}}const mesh=modernCharacter(i%8+1);mesh.position.set(x,height(x,z),z);w.scene.add(mesh);const route=[{x,z},{x,z:z+5},{x:x+3,z:z+5},{x,z}].filter(p=>!w.collides(p.x,p.z,.4));w.npcs.push({name,role,x,z,homeX:x,homeZ:z,mesh,phase:i,route});});
}
export function populateModernWild(w){
 for(let i=0;i<22;i++){const e=chooseEncounter(w.rand,w.collides.bind(w),w.wild,null,PLAN.spawn);if(!e)continue;const mesh=modelCreature(species(e.id),1);mesh.position.set(e.x,height(e.x,e.z),e.z);w.scene.add(mesh);w.wild.push({...e,mesh,index:i,cooldown:0});}
 const {x,z}=PLAN.arena,mesh=modelCreature(species('gardien'),1);mesh.position.set(x,height(x,z),z);w.scene.add(mesh);w.wild.push({id:'gardien',x,z,homeX:x,homeZ:z,mesh,phase:0,cooldown:0,index:22,level:7});
}
