import {T} from './art.js';
import {placeModel} from '../world/model-library.js';
import {ASSETS} from '../world/asset-catalog.js';
export function buildInterior(room,location){
 room.scene=new T.Scene();room.scene.background=new T.Color('#bfd6df');room.root=new T.Group();room.scene.add(room.root);
 room.scene.add(new T.HemisphereLight('#edf6ff','#9b8368',2.5));const daylight=new T.DirectionalLight('#fff5df',2.6);daylight.position.set(-8,10,4);room.scene.add(daylight);
 const plaster=new T.MeshStandardMaterial({color:'#f1ede2',roughness:.9}),dark=new T.MeshStandardMaterial({color:'#243d43',roughness:.35,metalness:.3}),oak=new T.MeshStandardMaterial({color:'#bda37c',roughness:.6}),glass=new T.MeshStandardMaterial({color:'#9ec5d1',transparent:true,opacity:.2,roughness:.1,metalness:.15}),stone=new T.MeshStandardMaterial({color:'#d0cec5',roughness:.85});
 oak.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vRoom;').replace('#include <begin_vertex>','#include <begin_vertex>\nvRoom=(modelMatrix*vec4(position,1.)).xyz;');s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vRoom;').replace('#include <color_fragment>',`#include <color_fragment>
 vec2 p=vRoom.xz;float row=floor(p.x/.22),offset=fract(sin(row*13.7)*637.5)*2.4;vec2 tile=fract(vec2(p.x/.22,(p.y+offset)/2.4));float seam=step(.015,min(tile.x,1.-tile.x))*step(.002,min(tile.y,1.-tile.y));float grain=sin(p.x*360.+sin(p.y*5.)*2.)*.025;diffuseColor.rgb*=mix(.55,.91+fract(sin(row*21.4)*317.2)*.15+grain,seam);`);};
 room.materials=[plaster,dark,oak,glass,stone];plaster.userData.cutawayOccluder=true;for(const m of [dark,oak,stone])m.userData.cutawayExcluded=true;
 const mesh=(w,h,d,x,y,z,m)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;room.root.add(o);return o;};
 mesh(18,.18,16,0,-.09,0,oak);mesh(14.4,.18,16,-1.8,3.51,0,oak);mesh(3.6,.18,3,7.2,3.51,-6.5,oak);mesh(3.6,.18,4.6,7.2,3.51,5.7,oak);
 // Real openings: no opaque wall behind the glazing.
 for(const level of [0,3.6]){
  for(const side of [-1,1]){const x=side*9;mesh(.2,.8,16,x,level+.4,0,plaster);mesh(.2,.65,16,x,level+3.275,0,plaster);for(const z of [-7.5,-.5,7.5])mesh(.2,2.15,z===-.5?2:1,x,level+1.875,z,plaster);for(const z of [-4,3.5]){mesh(.07,2.08,5.7,x,level+1.87,z,glass);for(const zz of [z-2.9,z,z+2.9])mesh(.15,2.18,.06,x-side*.05,level+1.87,zz,dark);for(const yy of [.78,2.95])mesh(.15,.07,5.9,x-side*.05,level+yy,z,dark);}}
  mesh(18,3.6,.2,0,level+1.8,-8,plaster);mesh(7.7,3.6,.2,-5.15,level+1.8,8,plaster);mesh(7.7,3.6,.2,5.15,level+1.8,8,plaster);mesh(2.6,.7,.2,0,level+3.25,8,plaster);
  for(const x of [-8.85,8.85])mesh(.06,.12,15.8,x,level+.06,0,dark);mesh(17.8,.12,.06,0,level+.06,-7.85,dark);
 }
 mesh(18,.18,16,0,7.3,0,plaster);mesh(6,3.3,.12,-6,5.25,-.9,plaster);mesh(5.2,3.3,.12,2.5,5.25,-.9,plaster);
 for(let i=0;i<18;i++)mesh(3.2,.12,8/18,7.15,(i+1)*.2-.06,3-(i+.5)*8/18,oak);
 for(const x of [5.28,8.8]){const rail=mesh(.06,.06,Math.hypot(8,3.6),x,2.8,-1,dark);rail.rotation.x=Math.atan(3.6/8);for(let i=0;i<9;i++)mesh(.03,.9,.03,x,1+(i*.4),3-i, dark);}
 mesh(.055,1,8.2,5.23,4.1,-1,glass);mesh(3.7,1,.06,7.1,4.1,3.3,glass);mesh(3.8,.06,.08,7.1,4.62,3.3,dark);
 mesh(2.35,2.9,.1,0,1.45,7.94,dark);mesh(1.98,2.48,.03,0,1.5,7.86,glass);mesh(.08,.65,.08,.72,1.45,7.74,stone);
 const lightMat=new T.MeshStandardMaterial({color:'#ffecc6',emissive:'#ffdf9d',emissiveIntensity:1.2});room.materials.push(lightMat);for(const y of [3.3,6.9])for(const x of [-5,1]){mesh(1.5,.07,.15,x,y,-2,dark);mesh(1.4,.035,.1,x,y-.05,-2,lightMat);}
 // Geometric art panels and live plants frame the rooms without blocking the circulation route.
 for(const x of [-4,0]){mesh(1.4,1.8,.04,x,1.95,-7.83,dark);const art=new T.MeshStandardMaterial({color:x===-4?'#d59468':'#5b918a',roughness:1});room.materials.push(art);mesh(1.28,1.68,.02,x,1.95,-7.8,art);}
 room.fixtures=new T.Group();room.scene.add(room.fixtures);room.fixedColliders=[];
 const fixture=(id,x,y,z,s=1,r=0,solid=true)=>{placeModel(id,room.fixtures,x,y,z,s,r).catch(e=>console.warn(e.message));const a=ASSETS[id],c=Math.abs(Math.cos(r)),t=Math.abs(Math.sin(r));if(solid)room.fixedColliders.push({x,y,z,w:(a.size[0]*c+a.size[2]*t)*s,d:(a.size[0]*t+a.size[2]*c)*s});};
 fixture('Sink_A',-7,0,-6.6,.85,Math.PI/2);fixture('StationTable_1_A',-5.9,0,-6.6,1,Math.PI/2);fixture('Owen_A',-4.8,0,-6.6,.85);fixture('HangShelf_1_A',-6.4,2,-7.6,1.3,0,false);
 for(const [x,z] of [[-7.7,6],[3.8,-6.6]]){fixture('FlowerPot_5_1_A',x,0,z,1);fixture('Bush_1_A_1',x,.25,z,.52,0,false);}
 if(location==='house--40-24'){
  for(const [x,z] of [[-5,-1],[-1,-1],[-5,3],[-1,3]]){fixture('Table_1_A',x,0,z,1.1);fixture('Chair_1_A',x-1.2,0,z,1,Math.PI/2);fixture('Chair_1_A',x+1.2,0,z,1,-Math.PI/2);fixture('FlowerPot_5_1_A',x,.8,z,.25,0,false);}
  fixture('Sofa_1_A',-7.2,0,2,1,Math.PI/2);
 }else if(location!=='home'){fixture('Table_1_A',-2,0,0,1.5);fixture('StandShelf_1_A',-6,0,-3,1.5);fixture('Sofa_1_A',-6,0,4,1);}
 room.floors=[];for(const y of [0,3.6]){const m=new T.Mesh(new T.PlaneGeometry(18,16),new T.MeshBasicMaterial({visible:false}));m.rotation.x=-Math.PI/2;m.position.y=y;room.scene.add(m);room.floors.push(m);}
 room.furniture=new T.Group();room.scene.add(room.furniture);room.key='';
}
