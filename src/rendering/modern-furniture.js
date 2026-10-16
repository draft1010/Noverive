import {T} from './art.js';
import {placeModel,disposeModels} from '../world/model-library.js';
export const FURNITURE_MODELS={bench:["Bench_1_A",1],bed:["FlowerPlacet_5_1_A",.55,Math.PI/2],lamp:["StreetLamp_3_A",.8],fence:["WallFence_1_1_A",.9],workbench:["StationTable_1_A",1.2],furnace:["Owen_A",1.15],chest:["Box_1",.8],composter:["Container_1_1",.4],sofa:["Sofa_1_A",1,Math.PI/2],sleepingBed:['EAThe80_Prop_Bed_01a_LOD0',.85],table:['Table_1_A',1],chair:['Chair_1_A',1],wardrobe:['EAThe80_Prop_Wardrobe_01a_LOD0',.8],shelf:['StandShelf_1_A',1],stove:['Owen_A',1.15]};
export function upgradeFurniture(group,building){if(building.type==='rug'){group.clear();const rug=new T.Mesh(new T.BoxGeometry(2.8,.018,2),new T.MeshStandardMaterial({color:'#627f83',roughness:1}));rug.position.y=.018;rug.rotation.y=building.r||0;rug.userData.ownsFurniture=true;group.add(rug);for(const z of [-.88,.88]){const stripe=new T.Mesh(new T.BoxGeometry(2.6,.006,.06),new T.MeshStandardMaterial({color:'#d3c9af'}));stripe.position.set(0,.032,z);stripe.userData.ownsFurniture=true;rug.add(stripe);}return;}const config=FURNITURE_MODELS[building.type];if(!config)return;const visual=new T.Group();group.add(visual);return placeModel(config[0],visual,0,0,0,config[1],(building.r||0)+(config[2]||0)).then(()=>{if(visual.userData.disposed)return;for(const child of [...group.children])if(child!==visual){child.traverse(o=>{if(o.isInstancedMesh)o.dispose();});group.remove(child);}}).catch(error=>{group.userData.loadError=error;console.warn('Mobilier indisponible',config[0],error.message);});}
export function disposeFurniture(group){group.traverse(o=>{if(o.userData.modelRefs||o.userData.loadingModel)disposeModels(o);if(o.userData.ownsFurniture){o.geometry.dispose();o.material.dispose();}});}

// Preview uses exactly the same catalogue, scale, offsets and geometry as placement.
export function furniturePreview(type){
 const group=new T.Group();group.userData.previewReady=false;
 group.userData.ready=Promise.resolve(upgradeFurniture(group,{type,r:0})).then(()=>{
  if(group.userData.disposed||group.userData.loadError)return;
  group.traverse(o=>{if(!o.isMesh)return;const clone=m=>{const copy=m.clone();copy.transparent=true;copy.opacity=.78;copy.depthWrite=false;copy.userData.previewMaterial=true;if(o.userData.ownsFurniture)m.dispose();return copy;};o.material=Array.isArray(o.material)?o.material.map(clone):clone(o.material);o.castShadow=false;});
  group.userData.previewReady=true;
 });
 group.userData.dispose=()=>{group.userData.disposed=true;disposeFurniture(group);group.traverse(o=>{for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])if(m.userData.previewMaterial)m.dispose();});};
 return group;
}
