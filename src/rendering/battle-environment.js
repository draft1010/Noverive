import {T} from './art.js';
import {landscapeMaterial} from './landscape-material.js';
import {placeModel,disposeModels} from '../world/model-library.js';
export function battleEnvironment(stage){
 const geometry=new T.PlaneGeometry(100,100,48,48);geometry.rotateX(-Math.PI/2);const p=geometry.attributes.position,colors=[],surfaces=[];
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),d=Math.hypot(x,z);p.setY(i,d<10?-.04:Math.sin(x*.1)*Math.cos(z*.13)*Math.min(2,(d-10)*.2));colors.push(...(d<9?[.43,.36,.25]:[.24,.4,.2]));surfaces.push(d<9?2:0);}geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.setAttribute('surface',new T.Float32BufferAttribute(surfaces,1));geometry.computeVertexNormals();
 stage.meadow=new T.Mesh(geometry,new T.MeshStandardMaterial({vertexColors:true,roughness:1}));stage.meadow.receiveShadow=true;stage.scene.add(stage.meadow);stage.decor=new T.Group();stage.scene.add(stage.decor);
 for(let i=0;i<24;i++){const a=i*2.399,r=15+(i%4)*3,x=Math.cos(a)*r,z=Math.sin(a)*r;placeModel(i%3?'Tree_8_AA':'EA01_Env_Tree_01c_PRE',stage.decor,x,-.05,z,1.2+(i%3)*.2,a).catch(()=>{});placeModel('EA_M_Env_Bush_LeafClusterLarge_01ax_PRE',stage.decor,x*.8,0,z*.8,.8,a).catch(()=>{});}
 for(let i=0;i<28;i++){const a=i*2.399;placeModel('EA_M_Env_Flower_01a_PRE',stage.decor,Math.cos(a)*(10+i%6),0,Math.sin(a)*(10+i%6),.65,a).catch(()=>{});}
 stage.decor.userData.dispose=()=>disposeModels(stage.decor);
}
