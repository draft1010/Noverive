import {ASSETS} from '../world/asset-catalog.js';
import {T} from './art.js';
import {landscapeMaterial} from './landscape-material.js';
import {placeModel,disposeModels} from '../world/model-library.js';
const soil=landscapeMaterial();
export function cropVisual(plot){
 const group=new T.Group();
 const field=ASSETS.SM_Field_1_4_A,bed=new T.Group();group.add(bed);
 placeModel('SM_Field_1_4_A',bed,0,-.055,0,1.95/Math.max(field.size[0],field.size[2])).catch(e=>console.warn(e.message));
 if(plot.stage){const id=plot.seed==='wheatSeed'?'SM_Plant_Wheat':plot.seed==='carrotSeed'?'SM_Carrot_1':plot.seed==='pumpkinSeed'?'EA_Prop_Vegetable_Pumpkin_01a_PRE':plot.seed==='flaxSeed'?'EA_M_Env_Flower_01b_PRE':'SM_Sunflower_4';const grownHeight=plot.seed==='carrotSeed'?.35:plot.seed==='pumpkinSeed'?.45:plot.seed==='flaxSeed'?.65:1.1;const scale=[0,.2,.42,.7,1][plot.stage]*grownHeight/ASSETS[id].size[1];for(const x of [-.5,.5])for(const z of [-.5,.5])placeModel(id,group,x,plot.seed==='carrotSeed'?-.19:.05,z,scale).catch(e=>console.warn(e.message));}
 group.userData.dispose=()=>{disposeModels(bed);disposeModels(group);};return group;
}
