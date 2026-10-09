import {T} from './art.js';
// World-space materials keep the same physical tile size across all streaming sectors.
export function landscapeMaterial(){
 const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.94});
 material.userData.cutawayExcluded=true;
 material.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float surface; varying vec3 vLandscape; varying float vSurface;').replace('#include <begin_vertex>','#include <begin_vertex>\nvLandscape=(modelMatrix*vec4(position,1.0)).xyz; vSurface=surface;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
   varying vec3 vLandscape; varying float vSurface;
   float grain(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float noise2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(grain(i),grain(i+vec2(1,0)),f.x),mix(grain(i+vec2(0,1)),grain(i+vec2(1)),f.x),f.y);}
  `).replace('#include <color_fragment>',`#include <color_fragment>
   vec2 p=vLandscape.xz;
   float broad=noise2(p*.17),small=noise2(p*4.0),fine=noise2(p*32.0);
   if(vSurface<.5){
    float blades=smoothstep(.50,.82,noise2(p*vec2(40.0,7.0)));
    diffuseColor.rgb*=.83+broad*.22+small*.09+blades*.055;
    diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.14,1.04,.78),smoothstep(.55,.8,noise2(p*.31))*.3);
   }else if(vSurface<1.5){
    vec2 q=p*1.25;
    vec2 uv=fract(q),aa=fwidth(q)*.85;
    vec2 edge=smoothstep(vec2(.018),vec2(.018)+aa,min(uv,1.0-uv));
    float grout=edge.x*edge.y;
    float tile=grain(floor(q));
    diffuseColor.rgb=vec3(.48,.50,.49)*(.91+tile*.18+fine*.04)*mix(.67,1.0,grout);
    if(distance(p,vec2(-24.,28.))<12.){float ring=abs(fract(distance(p,vec2(-24.,28.))*.5)-.5);diffuseColor.rgb*=mix(.67,1.0,smoothstep(.025,.05,ring));}
   }else if(vSurface<2.5){diffuseColor.rgb=vec3(.34,.27,.18)*(.78+broad*.32+small*.25+fine*.12);}
   else if(vSurface<3.5){diffuseColor.rgb=vec3(.17,.19,.19)*(.88+small*.12+fine*.15);}
   else{diffuseColor.rgb=vec3(.53,.47,.32)*(.85+broad*.18+fine*.12);}
  `);
 };
 material.customProgramCacheKey=()=> 'noverive-landscape-v2';
 return material;
}
