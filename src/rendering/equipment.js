import {T} from './art.js';
import {placeModel,disposeModels} from '../world/model-library.js';
import {ASSETS} from '../world/asset-catalog.js';
export function equipment(tool){const root=new T.Group();root.name='HeldTool';root.userData.dispose=()=>disposeModels(root);const id={axe:'SM_Axe_1',pick:'Hammer_1_A',hoe:'Hoe_A',water:'SM_WateringCan_1_A'}[tool];if(!id)return root;const a=ASSETS[id],scale=tool==='water'?.48/Math.max(a.size[0],a.size[1],a.size[2]):.85/Math.max(...a.size);placeModel(id,root,0,tool==='water'?-.3:-.35,tool==='water'?.16:0,scale).catch(e=>console.warn(e.message));root.rotation.x=tool==='water'?0:.25;return root;}

export function characterActionForTool(tool){return {water:'Farm_Watering',hoe:'Farm_PlantSeed',axe:'TreeChopping_Loop',pick:'TreeChopping_Loop'}[tool]||'Interact';}
