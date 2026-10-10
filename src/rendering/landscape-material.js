import {T} from './art.js';
// World-space materials keep the same physical tile size across all streaming sectors.
export function landscapeMaterial(){
 const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.94});
 material.userData.cutawayExcluded=true;
 const detail={value:0};material.userData.setDetail=q=>{detail.value=q==='low'?0:1;};
 material.onBeforeCompile=shader=>{shader.uniforms.uGroundDetail=detail;
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float surface; varying vec3 vLandscape; varying float vSurface;').replace('#include <begin_vertex>','#include <begin_vertex>\nvLandscape=(modelMatrix*vec4(position,1.0)).xyz; vSurface=surface;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
   uniform float uGroundDetail; varying vec3 vLandscape; varying float vSurface;
   float grain(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float noise2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(grain(i),grain(i+vec2(1,0)),f.x),mix(grain(i+vec2(0,1)),grain(i+vec2(1)),f.x),f.y);}
  `).replace('#include <color_fragment>',`#include <color_fragment>
   vec2 p=vLandscape.xz;
   float broad=noise2(p*.17),small=noise2(p*4.0),fine=grain(floor(p*32.0));
   float surface=vSurface;
   bool city=p.x>=-768.&&p.x<=0.&&p.y>=-576.&&p.y<=96.;
   vec2 grid=abs(p-floor(p/48.+.5)*48.);
   bool country=(p.y>96.&&p.y<120.&&abs(p.x+96.)<3.8)||(p.x>=-100.&&p.x<=-60.&&abs(p.y-120.)<3.8)||(p.y>=120.&&abs(p.x+64.)<3.8)||(p.x>0.&&p.x<820.&&abs(p.y-8.)<3.8);
   bool trail=(p.x>140.&&p.x<261.&&abs(p.y+200.)<2.2)||(p.y< -348.&&p.y> -360.&&abs(p.x-465.)<2.2)||(p.x>28.&&abs(p.x-(180.+sin(p.y*.006)*38.))<2.2)||(p.x>140.&&p.x<740.&&abs(p.y+350.)<2.2)||(p.x>180.&&p.x<430.&&abs(p.y-280.)<2.2)||(p.x>-130.&&p.x<-68.&&abs(p.y-168.)<2.);
   if(city)surface=(grid.x<4.||grid.y<4.)?3.:(vSurface<.5?0.:1.);
   else if(country)surface=3.;else if(trail)surface=2.;else surface=length(vec2((p.x-410.)/1.25,p.y-280.))<96.?4.:0.;
   if(surface<.5){
    float blades=smoothstep(.50,.82,grain(floor(p*vec2(40.0,7.0))));
    float meadow=noise2(p*.42)*.6+noise2(p*.085)*.4;
    diffuseColor.rgb*=.64+broad*.36+small*.18+blades*.14;
    diffuseColor.rgb=mix(diffuseColor.rgb*vec3(.76,.92,.66),diffuseColor.rgb*vec3(1.18,1.12,.77),smoothstep(.25,.75,meadow));
    diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.14,1.04,.78),smoothstep(.55,.8,noise2(p*.31))*.3);
   }else if(surface<1.5){
    vec2 q=p*1.25;
    vec2 uv=fract(q),aa=fwidth(q)*.85;
    vec2 edge=smoothstep(vec2(.018),vec2(.018)+aa,min(uv,1.0-uv));
    float grout=edge.x*edge.y;
    float tile=grain(floor(q));
    diffuseColor.rgb=vec3(.48,.50,.49)*(.91+tile*.18+fine*.04)*mix(.67,1.0,grout);
    if(distance(p,vec2(-24.,28.))<12.){float ring=abs(fract(distance(p,vec2(-24.,28.))*.5)-.5);diffuseColor.rgb*=mix(.67,1.0,smoothstep(.025,.05,ring));}
   }else if(surface<2.5){diffuseColor.rgb=vec3(.34,.27,.18)*(.78+broad*.32+small*.25+fine*.12);}
   else if(surface<3.5){diffuseColor.rgb=vec3(.17,.19,.19)*(.88+small*.12+fine*.15);}
   else{diffuseColor.rgb=vec3(.53,.47,.32)*(.85+broad*.18+fine*.12);}
  `).replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   if(uGroundDetail>.5 && (vSurface<.5 || (vSurface>1.5 && vSurface<2.5))){
    vec2 p=vLandscape.xz;float relief=noise2(p*3.)*.018;
    vec3 dx=dFdx(vViewPosition),dy=dFdy(vViewPosition);
    vec3 rx=cross(dy,normal),ry=cross(normal,dx);
    float det=dot(dx,rx);
    normal=normalize(abs(det)*normal-sign(det)*(dFdx(relief)*rx+dFdy(relief)*ry));
   }
  `);
 };
 material.customProgramCacheKey=()=> 'noverive-landscape-v5';
 return material;
}
