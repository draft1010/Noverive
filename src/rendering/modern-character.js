import {T} from './art.js';
import {GLTFLoader} from '../../vendor/addons/loaders/GLTFLoader.js';
import {clone} from '../../vendor/addons/utils/SkeletonUtils.js';
const loader=new GLTFLoader(),templates=new Map();let animations;
function load(i){if(!templates.has(i))templates.set(i,loader.loadAsync(`./assets/openworld/Character_1_1_${i}.glb`));return templates.get(i);}
export async function preloadModernCharacters(onProgress=()=>{}){animations??=loader.loadAsync('./assets/openworld/Characters_1_Animations.glb');let done=0;const results=await Promise.allSettled([1,2,3,4].map(i=>load(i).finally(()=>onProgress(++done,5,'Habitants contemporains'))).concat(animations.finally(()=>onProgress(++done,5,'Animations des habitants'))));return {total:5,failed:results.filter(r=>r.status==='rejected').length};}
export function modernCharacter(i=1,hero=false){
 const group=new T.Group();let mixer,current,actions,disposed=false,arm,anchor,elapsed=1,gesture='';const fallbackGrip=new T.Group();fallbackGrip.position.set(-.35,1.1,.15);group.add(fallbackGrip);group.userData.arms=[new T.Group(),fallbackGrip];group.userData.legs=[];
 const handQ=new T.Quaternion(),bodyQ=new T.Quaternion();
 group.userData.playAction=name=>{gesture=name;elapsed=0;};
 group.userData.ready=false;group.userData.animate=(t,moving,running,dt=.016)=>{if(!mixer)return;const next=moving?(running?'Runing_A-loop':'Walk_A-loop'):'Idle_A-loop';if(next!==current){actions[current]?.fadeOut(.2);actions[next]?.reset().fadeIn(.2).play();current=next;}const step=Math.min(.1,dt);mixer.update(step);elapsed+=step;if(hero&&arm&&elapsed<.85){const wave=Math.sin(elapsed/.85*Math.PI);arm.rotation.x-=wave*(gesture==='Farm_Watering'?.55:1.25);arm.rotation.z+=wave*.3;}if(anchor){anchor.parent.getWorldQuaternion(handQ);group.getWorldQuaternion(bodyQ);anchor.quaternion.copy(handQ.invert()).multiply(bodyQ);}};
 group.userData.dispose=()=>{disposed=true;mixer?.stopAllAction();if(mixer)mixer.uncacheRoot(mixer.getRoot());group.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.dispose();});group.clear();};
 animations??=loader.loadAsync('./assets/openworld/Characters_1_Animations.glb');
 group.userData.whenReady=Promise.all([load(i),animations]).then(([model,anim])=>{if(disposed)return;const root=clone(model.scene);root.scale.setScalar(1.12);group.add(root);root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false;}});mixer=new T.AnimationMixer(root);actions=Object.fromEntries(anim.animations.map(clip=>[clip.name,mixer.clipAction(clip)]));if(hero){const hand=root.getObjectByName('Hand.R');arm=root.getObjectByName('Arm.R');anchor=new T.Group();anchor.name='NoveriveToolAnchor';anchor.scale.setScalar(1/1.12);(hand||root).add(anchor);for(const child of [...fallbackGrip.children])anchor.add(child);group.remove(fallbackGrip);group.userData.arms=[new T.Group(),anchor];}group.userData.animate(0,false,false,0);group.userData.ready=true;}).catch(error=>{group.userData.error=error.message;console.error('Habitant indisponible',error);});
 return group;
}
