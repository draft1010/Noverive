import {T} from './art.js';
export function atmosphere(scene){
 const uniforms={fogTint:{value:scene.fog.color},day:{value:1},wet:{value:0},clockTime:{value:0},dusk:{value:0}};
 const material=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms,vertexShader:`varying vec3 direction;void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec3 direction;uniform vec3 fogTint;uniform float day;uniform float wet;uniform float clockTime;uniform float dusk;void main(){vec3 d=normalize(direction);float h=pow(max(d.y,0.),.55);vec3 horizon=fogTint;vec3 zenith=mix(vec3(.025,.055,.13),vec3(.26,.57,.79),day);horizon=mix(horizon,vec3(.94,.63,.43),dusk*.35*h);vec3 c=mix(horizon,zenith,h);
vec2 cloudUV=d.xz/max(.16,d.y)*2.5+vec2(clockTime*.007,clockTime*.002);
float cloud=sin(cloudUV.x+sin(cloudUV.y*.8))*sin(cloudUV.y*.65+sin(cloudUV.x*.4));
float cover=smoothstep(.25,.8,cloud)*smoothstep(.03,.3,d.y)*(1.-smoothstep(.65,1.,d.y));
c=mix(c,mix(vec3(.24,.29,.39),vec3(.96,.95,.89),day),cover*.45*(1.-wet));float sun=pow(max(dot(d,normalize(vec3(-.5,.65,.5))),0.),96.);c+=vec3(1.,.76,.37)*sun*.22*day*(1.-wet);c=mix(c,vec3(.48,.57,.59)*(.4+.6*day),wet*.65*h);gl_FragColor=vec4(c,1.);#include <colorspace_fragment>}`.replace(';#include',';\n#include')});
 const sky=new T.Mesh(new T.SphereGeometry(180,24,12),material);sky.frustumCulled=false;sky.renderOrder=-100;sky.userData.cutawayExcluded=true;scene.add(sky);
 return {update(camera,day,wet,time=0,hour=12){uniforms.clockTime.value=time;uniforms.dusk.value=Math.max(0,1-Math.min(Math.abs(hour-18),Math.abs(hour-7))/2);sky.position.copy(camera.position);uniforms.day.value=day;uniforms.wet.value=wet;}};
}
// One instanced draw grounds every character even when real-time shadow maps are disabled.
export function contactShadows(scene,capacity=128){
 const size=32,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const r=Math.hypot((x+.5)/size*2-1,(y+.5)/size*2-1),i=(y*size+x)*4;data[i]=20;data[i+1]=34;data[i+2]=27;data[i+3]=Math.round(Math.max(0,1-r)**2*125);}
 const texture=new T.DataTexture(data,size,size);texture.needsUpdate=true;texture.magFilter=T.LinearFilter;texture.minFilter=T.LinearFilter;
 const mesh=new T.InstancedMesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}),capacity),o=new T.Object3D();mesh.frustumCulled=false;mesh.userData.cutawayExcluded=true;scene.add(mesh);
 return {update(actors,ground){let i=0;for(const a of actors){if(!a?.visible||i>=capacity)continue;const p=a.position;o.position.set(p.x,ground(p.x,p.z)+.045,p.z);o.rotation.set(-Math.PI/2,0,0);o.scale.set(1.25,1.05,1);o.updateMatrix();mesh.setMatrixAt(i++,o.matrix);}mesh.count=i;mesh.instanceMatrix.needsUpdate=true;}};
}
