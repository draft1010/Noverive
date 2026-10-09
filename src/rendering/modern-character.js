import {T} from './art.js';
import {GLTFLoader} from '../../vendor/addons/loaders/GLTFLoader.js';
import {clone} from '../../vendor/addons/utils/SkeletonUtils.js';
const loader=new GLTFLoader(),templates=new Map();let animations;
function load(i){if(!templates.has(i))templates.set(i,loader.loadAsync(`./assets/openworld/Character_1_1_${i}.glb`));return templates.get(i);}
export function modernCharacter(i=1){
 const group=new T.Group();let mixer,current,actions,disposed=false;
 group.userData.ready=false;group.userData.animate=(t,moving,running,dt=.016)=>{if(!mixer)return;const next=moving?(running?'Runing_A-loop':'Walk_A-loop'):'Idle_A-loop';if(next!==current){actions[current]?.fadeOut(.2);actions[next]?.reset().fadeIn(.2).play();current=next;}mixer.update(Math.min(.1,dt));};
 group.userData.dispose=()=>{disposed=true;mixer?.stopAllAction();if(mixer)mixer.uncacheRoot(mixer.getRoot());group.clear();};
 animations??=loader.loadAsync('./assets/openworld/Characters_1_Animations.glb');
 Promise.all([load(i),animations]).then(([model,anim])=>{if(disposed)return;const root=clone(model.scene);root.scale.setScalar(1.12);group.add(root);root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false;}});mixer=new T.AnimationMixer(root);actions=Object.fromEntries(anim.animations.map(clip=>[clip.name,mixer.clipAction(clip)]));group.userData.animate(0,false,false,0);group.userData.ready=true;}).catch(error=>{group.userData.error=error.message;console.error('Habitant indisponible',error);});
 return group;
}
