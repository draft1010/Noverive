import {T} from './art.js';
export function atmosphere(scene){
 const uniforms={day:{value:1},wet:{value:0}};
 const material=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms,vertexShader:`varying vec3 direction;void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec3 direction;uniform float day;uniform float wet;void main(){vec3 d=normalize(direction);float h=pow(max(d.y,0.),.55);vec3 horizon=mix(vec3(.15,.23,.32),vec3(.77,.87,.86),day);vec3 zenith=mix(vec3(.025,.055,.13),vec3(.26,.57,.79),day);vec3 c=mix(horizon,zenith,h);float sun=pow(max(dot(d,normalize(vec3(-.5,.65,.5))),0.),96.);c+=vec3(1.,.76,.37)*sun*.22*day*(1.-wet);c=mix(c,vec3(.48,.57,.59)*(.4+.6*day),wet*.65);gl_FragColor=vec4(c,1.);#include <colorspace_fragment>}`.replace(';#include',';\n#include')});
 const sky=new T.Mesh(new T.SphereGeometry(180,24,12),material);sky.frustumCulled=false;sky.renderOrder=-100;sky.userData.cutawayExcluded=true;scene.add(sky);
 return {update(camera,day,wet){sky.position.copy(camera.position);uniforms.day.value=day;uniforms.wet.value=wet;}};
}
// One instanced draw grounds every character even when real-time shadow maps are disabled.
export function contactShadows(scene,capacity=128){
 const size=32,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const r=Math.hypot((x+.5)/size*2-1,(y+.5)/size*2-1),i=(y*size+x)*4;data[i]=20;data[i+1]=34;data[i+2]=27;data[i+3]=Math.round(Math.max(0,1-r)**2*125);}
 const texture=new T.DataTexture(data,size,size);texture.needsUpdate=true;texture.magFilter=T.LinearFilter;texture.minFilter=T.LinearFilter;
 const mesh=new T.InstancedMesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}),capacity),o=new T.Object3D();mesh.frustumCulled=false;mesh.userData.cutawayExcluded=true;scene.add(mesh);
 return {update(actors,ground){let i=0;for(const a of actors){if(!a?.visible||i>=capacity)continue;const p=a.position;o.position.set(p.x,ground(p.x,p.z)+.045,p.z);o.rotation.set(-Math.PI/2,0,0);o.scale.set(1.25,1.05,1);o.updateMatrix();mesh.setMatrixAt(i++,o.matrix);}mesh.count=i;mesh.instanceMatrix.needsUpdate=true;}};
}
