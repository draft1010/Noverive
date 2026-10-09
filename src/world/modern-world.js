import {T,Factory,furnishing} from '../rendering/art.js';
import {flowingFountain} from '../rendering/fountain.js';
import {WorldStreamer,terrainMesh} from './streaming.js';
import {placeModel,acquireModel,instanceModel} from './model-library.js';
import {height,bridgeHeight,terrainHeight} from './terrain.js';
import {modelCreature} from '../rendering/monster-models.js';
import {species} from '../systems/data.js';
import {chooseEncounter} from '../systems/encounters.js';
export function buildModernWorld(w){
 // Disable Three's unbounded raw-file cache; the model library owns its bounded cache.
 T.Cache.enabled=false;T.Cache.clear();
 const ground=terrainMesh(0,0,640,160);ground.position.y=-.045;w.scene.add(ground);w.ground=ground;w.pickSurfaces=[ground];
 const water=new T.Mesh(new T.PlaneGeometry(640,640),new T.MeshStandardMaterial({color:'#5dabb4',roughness:.22,metalness:.18,transparent:true,opacity:.86}));water.rotation.x=-Math.PI/2;water.position.y=-.48;water.material.uniforms={time:{value:0},sun:{value:1},lowQuality:{value:0}};water.material.userData.cutawayExcluded=true;w.water=water;w.scene.add(water);
 w.fountain=flowingFountain(w.scene,-9,height(-9,0),0);w.collider(-9,0,2.7);
 const civic=new T.Group(),f=new Factory(civic,true);w.scene.add(civic);w.landmarkGroup=civic;
 f.part('cylinder','#d4ded6',-9,height(-9,0)+.15,0,2.7,.3,2.7);
 // Concrete pedestrian bridge decks follow the walking surface exactly.
 for(const z of [8,-30]){
  const geo=new T.PlaneGeometry(17,3.9,34,1);geo.rotateX(-Math.PI/2);const p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,bridgeHeight(p.getX(i)+19.5,z));geo.computeVertexNormals();const deck=new T.Mesh(geo,new T.MeshStandardMaterial({color:'#c9c7b8',roughness:.9}));deck.material.userData.cutawayExcluded=true;deck.position.set(19.5,0,z);deck.receiveShadow=true;w.scene.add(deck);w.pickSurfaces.push(deck);
  for(const side of [-1,1]){for(let x=11;x<=28;x+=1){const y=bridgeHeight(x,z);f.part('box','#637d83',x,y+.55,z+side*1.9,.08,1.1,.08);f.part('box','#637d83',x,y+1.1,z+side*1.9,1.05,.08,.08);}w.collider(19.5,z+side*1.9,0,'rect',17,.18);}
 }
 // Keep the rural kit's stone supports underneath the precisely fitted walking decks.
 acquireModel('EA_Bridge_3x10_01b_PRE.prefab').then(root=>instanceModel(root,'EA_Bridge_3x10_01b_PRE.prefab',[8,-30].map(z=>({x:19.5,y:-3.3,z,r:Math.PI/2,sx:.85,sy:.7,sz:1.62})),civic)).catch(e=>console.warn('Supports de pont',e.message));
 for(let x=-44;x<=-16;x+=2){if(x>-29&&x<-23)continue;furnishing(f,'fence',x,height(x,42),42);w.collider(x,42,0,'rect',1.9,.3);}
 furnishing(f,'workbench',-40,height(-40,32),32);
 w.interactables.push({type:'expedition',name:'Consulter les expéditions',x:-9,z:-5},{type:'expedition',name:'Maison des Explorateurs · missions',x:-35,z:-43},{type:'home',name:'Votre maison · entrer',x:-36,z:28.3},{type:'workbench',name:'Atelier de la ferme',x:-40,z:32});
 for(const [x,z,name] of [[-20,-1,'Café des Sources'],[1,-5,'Maison des Jardins'],[-35,-43,'Maison des Explorateurs']])w.interactables.push({type:'home',name:`${name} · entrer`,location:`house-${x}-${z}`,x,z});
 // Existing final encounter remains reachable at its original quest coordinates.
 f.part('cylinder','#c4d4cb',43,terrainHeight(43,-39)+.18,-39,5.5,.36,5.5);f.part('torus','#65b6ae',43,height(43,-39)+3,-43,2,2,2);
 f.flush();w.createParticles();w.populate();
 w.streamer=new WorldStreamer(w);w.streamer.update(1,-9,8,{settings:{quality:'low'},depleted:{},day:1});
}
export function populateModernWild(w){
 for(let i=0;i<26;i++){const e=chooseEncounter(w.rand,w.collides.bind(w),w.wild,null,{x:-9,z:8});if(!e)continue;const mesh=modelCreature(species(e.id),1);mesh.position.set(e.x,height(e.x,e.z),e.z);w.scene.add(mesh);w.wild.push({...e,mesh,index:i,cooldown:0});}
 const mesh=modelCreature(species('gardien'),1);mesh.position.set(43,height(43,-38),-38);w.scene.add(mesh);w.wild.push({id:'gardien',x:43,z:-38,homeX:43,homeZ:-38,mesh,phase:0,cooldown:0,index:26,level:7});
}

