import {graphicsProfile} from './graphics.js';
import {T} from './art.js';
import {MOVES} from '../systems/data.js';
export const CAST_TIMING={impact:.92,duration:1.8};
const palettes={feu:['#ff6434','#fff0a2'],eau:['#28badd','#d8fcff'],nature:['#66b34c','#edee9a'],terre:['#927562','#ffd29b'],air:['#82ded7','#f3ffff'],lumiere:['#ffd567','#fffce6']};
export function attackProfile(id){const m=MOVES[id]||{},element=m.element||(id==='brume'?'eau':'lumiere');return {element,colors:palettes[element],pattern:m.fx||({elan:'dash',gresil:'volley',eboulis:'meteor',dard:'volley',pollen:'vortex',graine:'volley',halo:'beam',eclat:'beam',liane:'eruption',rafale:'vortex',souffle:'vortex'}[id]||'projectile')};}
const smooth=t=>{t=T.MathUtils.clamp(t,0,1);return t*t*(3-2*t);};
export function cinematicAttack(stage,id,from,to,{support=false,miss=false}={}){
 const budget=graphicsProfile(stage.quality),count=budget.particles;
 const profile=attackProfile(id),[color,accent]=profile.colors,root=new T.Group(),parts=[],q=new T.Quaternion(),up=new T.Vector3(0,1,0),axis=to.clone().sub(from),distance=axis.length(),dir=axis.clone().normalize();
 const mat=(c,opacity=1,glow=0)=>new T.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:glow,roughness:.35,metalness:.12,transparent:opacity<1,opacity,depthWrite:opacity===1,side:T.DoubleSide});
 const coreMaterial=mat(color,.9,1.2),rimMaterial=mat(accent,.85,2),solidMaterial=mat(color,1,.18);
 const core=new T.Mesh(profile.element==='terre'?new T.DodecahedronGeometry(.55,0):profile.element==='lumiere'?new T.OctahedronGeometry(.48):new T.SphereGeometry(.42,20,12),coreMaterial);root.add(core);
 const halo=new T.Mesh(new T.SphereGeometry(.62,18,12),mat(accent,.12,1));root.add(halo);
 const rings=[];for(let i=0;i<4;i++){const ring=new T.Mesh(new T.TorusGeometry(1,.022+i*.006,6,80),mat(i%2?accent:color,.7,1));ring.rotation.x=Math.PI/2;root.add(ring);rings.push(ring);}
 const beam=new T.Mesh(new T.CylinderGeometry(.07,.16,1,10,1,true),rimMaterial);root.add(beam);
 const shardGeo=profile.element==='nature'?new T.OctahedronGeometry(.15,0):profile.element==='terre'?new T.DodecahedronGeometry(.17,0):new T.OctahedronGeometry(.095,0);
 const shards=new T.InstancedMesh(shardGeo,profile.element==='terre'?solidMaterial:rimMaterial,count),obj=new T.Object3D();shards.frustumCulled=false;root.add(shards);
 const light=new T.PointLight(color,0,12,2);if(count>32)root.add(light);
 const spiral=[];for(let k=0;k<(count<=32?1:3);k++){const points=[];for(let i=0;i<=70;i++){const u=i/70,a=u*Math.PI*5+k*2.094;points.push(new T.Vector3(Math.cos(a)*(.35+u*.8),u*2.5,Math.sin(a)*(.35+u*.8)));}const mesh=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),70,.025,5,false),mat(k%2?accent:color,.65,.9));root.add(mesh);spiral.push(mesh);}
 const seed=Array.from({length:count},(_,i)=>({a:i*2.399,r:.35+(i%11)/11,v:1.5+(i%7)*.32,offset:(i%13)/13}));
 stage.addEffect(root,CAST_TIMING.duration,(effect,dt,progress)=>{
  const t=progress*CAST_TIMING.duration,charge=smooth(t/.36),travel=smooth((t-.36)/.56),hit=smooth((t-CAST_TIMING.impact)/.8),impact=t>=CAST_TIMING.impact;
  const center=from.clone().lerp(to,travel);if(profile.pattern==='meteor')center.y+=Math.sin(travel*Math.PI)*4.5;if(support)center.copy(from);
  core.position.copy(center);halo.position.copy(center);const alive=impact?(1-hit)*1.4:charge*(.7+Math.sin(t*22)*.04);core.scale.setScalar(Math.max(.001,alive));halo.scale.setScalar(Math.max(.001,alive));core.rotation.set(t*2,t*4,t);core.visible=!support;
  if(profile.element==='nature')core.scale.y*=1.7;if(profile.element==='feu')core.scale.y*=1.3;
  light.position.copy(center);light.intensity=(impact?7*(1-hit):2.5*charge);
  beam.visible=profile.pattern==='beam'&&t>.36&&t<1.12;beam.position.copy(from).lerp(center,.5);q.setFromUnitVectors(up,dir);beam.quaternion.copy(q);beam.scale.set(1,Math.max(.01,from.distanceTo(center)),1);
  rings.forEach((ring,i)=>{const r=impact?.4+hit*(2.8+i*.5):.5+charge*(.65+i*.22);ring.position.copy(impact?to:from);ring.position.y=(impact?.08:from.y-.7)+i*.045;ring.scale.setScalar(r);ring.material.opacity=(impact?1-hit:charge*.65)*(miss?.35:1);ring.rotation.z=t*(i%2?1:-1)+i;});
  spiral.forEach((mesh,i)=>{mesh.visible=support||['vortex','eruption','nova'].includes(profile.pattern);mesh.position.copy(impact||support?to:center);mesh.position.y-=1;mesh.scale.setScalar(Math.max(.001,impact?(1+hit)*(.9-hit*.5):charge*.65));mesh.rotation.y=t*(2+i*.3);mesh.material.opacity=(impact?1-hit:charge)*.75;});
  for(let i=0;i<count;i++){const s=seed[i];let scale=.5;
   if(t<.36){const a=s.a+t*5,r=(1-charge*.7)*s.r*1.8;obj.position.set(from.x+Math.cos(a)*r,from.y+Math.sin(a*2)*.45,from.z+Math.sin(a)*r);scale=charge*.7;}
   else if(!impact){const lag=Math.max(0,travel-s.offset*.35),a=s.a+t*9;obj.position.copy(from).lerp(to,lag);const spread=profile.pattern==='volley'?.65:.2;obj.position.x+=Math.cos(a)*spread;obj.position.z+=Math.sin(a)*spread;obj.position.y+=Math.sin(lag*Math.PI)*(profile.pattern==='meteor'?4.5:.4)+Math.sin(a)*spread;scale=.35+(1-s.offset)*.8;}
   else{const elapsed=t-CAST_TIMING.impact,a=s.a;obj.position.set(to.x+Math.cos(a)*s.v*elapsed,to.y+(.8+s.offset*3)*elapsed-3*elapsed*elapsed,to.z+Math.sin(a)*s.v*elapsed);obj.position.y=Math.max(.04,obj.position.y);scale=(1-hit)*(.5+s.offset);}
   if(support){const a=s.a+t*3;obj.position.set(from.x+Math.cos(a)*s.r,from.y-1+((t+s.offset*2)%2),from.z+Math.sin(a)*s.r);scale=Math.sin(progress*Math.PI)*.6;}
   obj.rotation.set(t+i,t*2+i,i);obj.scale.setScalar(Math.max(.001,scale));if(profile.element==='nature')obj.scale.set(scale*.5,scale*1.8,scale*.25);obj.updateMatrix();shards.setMatrixAt(i,obj.matrix);
  }shards.instanceMatrix.needsUpdate=true;
 });return root;
}
