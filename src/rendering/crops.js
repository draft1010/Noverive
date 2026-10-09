import {ASSETS} from '../world/asset-catalog.js';
import {T} from './art.js';
import {placeModel,disposeModels} from '../world/model-library.js';
export function wetSoilMaterial(source,wetness){
 const material=source.clone();material.userData={cutawayExcluded:true};
 material.onBeforeCompile=shader=>{shader.uniforms.soilWetness=wetness;shader.fragmentShader='uniform float soilWetness;\n'+shader.fragmentShader;
 shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 // The atlas contains both brown soil and green edging: only wet the earth.
 float earthMask=smoothstep(.85,1.15,diffuseColor.r/max(diffuseColor.g,.001));
 diffuseColor.rgb*=mix(vec3(1.),vec3(.34,.29,.23),soilWetness*earthMask);
 `).replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.63,soilWetness*earthMask);');};
 material.customProgramCacheKey=()=> 'soil-moisture-v1';return material;
}
export function cropVisual(plot){
 const group=new T.Group(),wetness={value:Math.max(0,Math.min(1,plot.water||0))},ownedMaterials=[];
 group.userData.setMoisture=value=>{wetness.value=Math.max(0,Math.min(1,value||0));};
 const field=ASSETS.SM_Field_1_4_A,bed=new T.Group();group.add(bed);
 placeModel('SM_Field_1_4_A',bed,0,-.055,0,1.95/Math.max(field.size[0],field.size[2])).then(()=>{if(bed.userData.disposed)return;bed.traverse(o=>{if(!o.isMesh)return;const copy=m=>{const mat=wetSoilMaterial(m,wetness);ownedMaterials.push(mat);return mat;};o.material=Array.isArray(o.material)?o.material.map(copy):copy(o.material);});}).catch(e=>console.warn(e.message));
 if(plot.stage){const id=plot.seed==='wheatSeed'?'SM_Plant_Wheat':plot.seed==='carrotSeed'?'SM_Carrot_1':plot.seed==='pumpkinSeed'?'EA_Prop_Vegetable_Pumpkin_01a_PRE':plot.seed==='flaxSeed'?'EA_M_Env_Flower_01b_PRE':'SM_Sunflower_4';const grownHeight=plot.seed==='carrotSeed'?.35:plot.seed==='pumpkinSeed'?.45:plot.seed==='flaxSeed'?.65:1.1;const scale=[0,.2,.42,.7,1][plot.stage]*grownHeight/ASSETS[id].size[1];for(const x of [-.5,.5])for(const z of [-.5,.5])placeModel(id,group,x,plot.seed==='carrotSeed'?-.19:.05,z,scale).catch(e=>console.warn(e.message));}
 group.userData.dispose=()=>{disposeModels(bed);disposeModels(group);ownedMaterials.forEach(m=>m.dispose());};return group;
}
