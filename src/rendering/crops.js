import {ASSETS} from '../world/asset-catalog.js';
import {T} from './art.js';
import {landscapeMaterial} from './landscape-material.js';
import {placeModel,disposeModels} from '../world/model-library.js';
const soil=landscapeMaterial();
export function cropVisual(plot){
 const group=new T.Group(),geo=new T.PlaneGeometry(1.95,1.95,24,8);geo.rotateX(-Math.PI/2);const p=geo.attributes.position,colors=[],surface=[];
 for(let i=0;i<p.count;i++){const x=p.getX(i);p.setY(i,.055+Math.pow(Math.sin(x*Math.PI*3),2)*.045);colors.push(.5,.4,.3);surface.push(2);}geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setAttribute('surface',new T.Float32BufferAttribute(surface,1));geo.computeVertexNormals();
 const mesh=new T.Mesh(geo,soil);mesh.receiveShadow=true;group.add(mesh);
 if(plot.stage){const id=plot.seed==='wheatSeed'?'SM_Plant_Wheat':plot.seed==='carrotSeed'?'SM_Carrot_1':plot.seed==='pumpkinSeed'?'EA_Prop_Vegetable_Pumpkin_01a_PRE':plot.seed==='flaxSeed'?'EA_M_Env_Flower_01b_PRE':'SM_Sunflower_4';const grownHeight=plot.seed==='carrotSeed'?.35:plot.seed==='pumpkinSeed'?.45:plot.seed==='flaxSeed'?.65:1.1;const scale=[0,.2,.42,.7,1][plot.stage]*grownHeight/ASSETS[id].size[1];for(const x of [-.5,.5])for(const z of [-.5,.5])placeModel(id,group,x,.05,z,scale).catch(e=>console.warn(e.message));}
 group.userData.dispose=()=>{disposeModels(group);geo.dispose();};return group;
}
