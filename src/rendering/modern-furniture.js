import {T} from './art.js';
import {placeModel,disposeModels} from '../world/model-library.js';
export const FURNITURE_MODELS={sleepingBed:['EAThe80_Prop_Bed_01a_LOD0',.85],table:['Table_1_A',1.2],chair:['Chair_1_A',1],wardrobe:['EAThe80_Prop_Wardrobe_01a_LOD0',.8],shelf:['StandShelf_1_A',1],stove:['Owen_A',1.15]};
export function upgradeFurniture(group,building){const config=FURNITURE_MODELS[building.type];if(!config)return;const visual=new T.Group();group.add(visual);placeModel(config[0],visual,0,0,0,config[1],building.r||0).then(()=>{if(visual.userData.disposed)return;for(const child of [...group.children])if(child!==visual){child.traverse(o=>{if(o.isInstancedMesh)o.dispose();});group.remove(child);}}).catch(error=>console.warn('Mobilier conservé',config[0],error.message));}
export function disposeFurniture(group){group.traverse(o=>{if(o.userData.modelRefs||o.userData.loadingModel)disposeModels(o);});}
