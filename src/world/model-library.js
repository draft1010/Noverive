import {T} from '../rendering/art.js';
import {GLTFLoader} from '../../vendor/addons/loaders/GLTFLoader.js';
import {prepareOccluders} from '../rendering/occlusion.js';
import {ASSETS} from './asset-catalog.js';
const loader=new GLTFLoader();
const cache=new Map();
export const modelErrors=[];
// Only the selected catalogue can be requested. Idle entries are evicted, including GPU resources.
export async function acquireModel(id){
 if(!ASSETS[id])throw Error(`Unknown model ${id}`);
 let entry=cache.get(id);
 if(!entry){entry={refs:0,used:performance.now()};cache.set(id,entry);entry.promise=loader.loadAsync(ASSETS[id].file).then(gltf=>{entry.root=gltf.scene;entry.root.rotation.x+=ASSETS[id].rotationX||0;entry.root.updateMatrixWorld(true);prepareOccluders(entry.root);return entry.root;}).catch(e=>{cache.delete(id);modelErrors.push(`${id}: ${e.message}`);throw e;});}
 entry.refs++;entry.used=performance.now();
 try{return await entry.promise;}catch(e){entry.refs--;throw e;}
}
export function releaseModel(id){const e=cache.get(id);if(e)e.refs=Math.max(0,e.refs-1);trimModels();}
function trimModels(){const idle=[...cache.entries()].filter(([,e])=>!e.refs&&e.root).sort((a,b)=>a[1].used-b[1].used);while(cache.size>32&&idle.length){const [id,e]=idle.shift(),geos=new Set(),mats=new Set(),tex=new Set();e.root.traverse(o=>{if(o.geometry)geos.add(o.geometry);for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){mats.add(m);for(const v of Object.values(m))if(v?.isTexture)tex.add(v);}});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());tex.forEach(t=>t.dispose());cache.delete(id);}}
export function modelStats(){return {cached:cache.size,referenced:[...cache.values()].filter(e=>e.refs>0).length,errors:[...modelErrors]};}
export function instanceModel(root,id,placements,parent){
 const meta=ASSETS[id],matrix=new T.Matrix4(),normalizer=new T.Matrix4().makeTranslation(-meta.center[0],-meta.minY,-meta.center[2]),obj=new T.Object3D();
 root.traverse(node=>{if(!node.isMesh)return;const batch=new T.InstancedMesh(node.geometry,node.material,placements.length);batch.castShadow=!/Grass|Road/.test(id);batch.receiveShadow=true;
 placements.forEach((p,i)=>{obj.position.set(p.x,p.y,p.z);obj.rotation.set(0,p.r||0,0);const s=p.s??1;obj.scale.set(p.sx??s,p.sy??s,p.sz??s);obj.updateMatrix();matrix.copy(obj.matrix).multiply(normalizer).multiply(node.matrixWorld);batch.setMatrixAt(i,matrix);});batch.computeBoundingSphere();parent.add(batch);});
}
export async function placeModel(id,parent,x=0,y=0,z=0,s=1,r=0){parent.userData.loadingModel=true;const root=await acquireModel(id);if(parent.userData.disposed){releaseModel(id);return;}instanceModel(root,id,[{x,y,z,s,r}],parent);parent.userData.modelRefs??=[];parent.userData.modelRefs.push(id);}
export function disposeModels(parent){parent.userData.disposed=true;parent.traverse(o=>{if(o.isInstancedMesh)o.dispose();});for(const id of parent.userData.modelRefs||[])releaseModel(id);parent.userData.modelRefs=[];}
