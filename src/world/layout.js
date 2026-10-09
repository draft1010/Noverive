import {ASSETS} from './asset-catalog.js';
import {biomeAt,roadAt,isFarm,hash,chunkKey} from './regions.js';
import {height,riverX,onBridge} from './terrain.js';
const layouts=new Map();
export function footprintFor(p){const a=ASSETS[p.id],s=p.s||1,c=Math.abs(Math.cos(p.r||0)),t=Math.abs(Math.sin(p.r||0));return {x:p.x,z:p.z,w:(a.size[0]*c+a.size[2]*t)*s,d:(a.size[0]*t+a.size[2]*c)*s,kind:'rect',r:0};}
export const FIXED=[
 {id:'Kiosk_1_A',x:-148,z:-52,s:1},
 {id:'FoodCart_1_A',x:-148,z:-44,s:1},
 {id:'SM_House_1_A',x:-36,z:25,s:.39},
 {id:'SM_Barn_1_A',x:-57,z:52,s:.8},
 {id:'SM_Silos_1_A',x:-67,z:50,s:.7},
 {id:'SM_Tractor_1_A',x:-50,z:46,s:1},
 {id:'SM_GreenHouse_1_A',x:-57,z:78,s:.8},
 {id:'SM_Hay_1',x:-50,z:58,s:1},
 {id:'SM_Hay_1',x:-52,z:58,s:1},
 {id:'Axe_A',x:-40.5,z:32,s:1,dy:1.1,solid:false},
 {id:'Hammer_1_A',x:-39.6,z:32,s:1,dy:1.1,solid:false},
 {id:'Kiosk_1_A',x:-28,z:-17,s:1},
 {id:'FoodCart_1_A',x:-38,z:-17,s:1},
 {id:'Building_12_A',x:-20,z:-7,s:1},
 {id:'Building_13_A',x:1,z:-9,s:1},
 {id:'Building_10_A',x:-35,z:-49,s:1.2},
 {id:'Building_14_A',x:-54,z:-49,s:1},
 {id:'Building_1_A',x:-62,z:-18,s:1},
 {id:'Building_26_A',x:-45,z:-30,s:1},
 {id:'Bench_1_A',x:-5,z:0,s:1,r:Math.PI/2},
 {id:'Bench_1_A',x:-13,z:0,s:1,r:Math.PI/2},
 {id:'StreetLamp_3_A',x:-4,z:7,s:1},
 {id:'StreetLamp_3_A',x:-14,z:7,s:1},
 {id:'BusStop_A',x:-55,z:3,s:1,r:Math.PI/2},
];
const buildings=['Building_1_A','Building_4_A','Building_8_1_A','Building_15_A','Building_18_1_A','Building_24_A','Building_26_A','Building_10_A','Building_6_A','Building_14_A','Building_20_1_A','Building_3_1_A'];
const field=(x,z)=>x>-110&&x<-28&&z>92&&z<146;
function reserved(x,z){return isFarm(x,z)||field(x,z)||Math.hypot(x+9,z)<18||Math.hypot(x-43,z+39)<12||Math.abs(x-riverX(z))<8||roadAt(x,z);}
export function sectorLayout(cx,cz){
 const key=`${cx},${cz}`;if(layouts.has(key))return layouts.get(key);
 const models=[],colliders=[],resources=[];
 function put(id,x,z,s=1,r=0,solid=true){if(chunkKey(x,z)!==key)return;const p={id,x,z,y:height(x,z),s,r};models.push(p);if(solid){let c=footprintFor(p);if(/Tree/.test(id))c={x,z,r:.32*s,kind:'circle'};colliders.push(c);}return p;}
 for(const p of FIXED){const placed=put(p.id,p.x,p.z,p.s,p.r,p.solid!==false);if(placed)placed.y+=p.dy||0;}
 for(let x=-102;x<-32;x+=8)for(let z=100;z<140;z+=8)put(x<-70?'SM_Field_1_4_A':'SM_Field_3_1',x,z,1,0,false);
 for(let z=99;z<145;z+=3.2)put('SM_Fence_1_2_A',-110,z,1);
 // A walkable rock gallery: walls flank a clear corridor; roof pieces have no ground collider.
 for(const x of [192,202,212]){
  for(const z of [-127,-113])put('EA01_Env_Clif_01a',x,z,.62,Math.PI/2);
  const roof=put('EA01_Env_Clif_01b',x,-120,.75,0,false);if(roof){roof.y+=6.8;roof.sy=.12;roof.sx=.75;roof.sz=.75;}
 }
 // Authored road modules retain the pack's lane markings and kerbs.
 for(let x=cx*32;x<cx*32+32;x+=8)for(let z=cz*32;z<cz*32+32;z+=8){
  if(roadAt(x,z)!=='city')continue;
  const crossing=Math.abs((x+248)%40)<.1&&Math.abs((z+192)%40)<.1;
  const p=put(crossing?'Road_A_7':'Road_A_1',x,z,1,Math.abs((z+192)%40)<.1?Math.PI/2:0,false);if(p)p.y-=.2;
 }
 // Original street grid; every block has a 12 metre public corridor.
 for(let bx=-248;bx<-88;bx+=40)for(let bz=-192;bz<48;bz+=40){
  const block=hash(bx,bz);if(block<.13){for(const dx of [11,28])for(const dz of [11,28])put('Tree_10_AA',bx+dx,bz+dz,1.3);put('Bench_1_A',bx+12,bz+17,1);continue;}
  if(block>.86){put('Building_7_1_A',bx+20,bz+20,.67);continue;}
  for(const dx of [12,28])for(const dz of [13,28]){const id=buildings[Math.floor(hash(bx+dx,bz+dz)*buildings.length)],meta=ASSETS[id],s=Math.min(1.15,12/Math.max(meta.size[0],meta.size[2]));put(id,bx+dx,bz+dz,s,dz===13?Math.PI:0);}
 }
 // Sidewalk furniture and parked vehicles occupy designated kerb strips.
 for(let x=-248;x<=-88;x+=40)for(let z=-192;z<=48;z+=20){put('StreetLamp_3_A',x+5.3,z+5.3,1);put(['Car_1_A','Car_5_A','Car_7_A'][Math.floor(hash(x,z)*3)],x+2.8,z+12,1,Math.PI/2);}
 for(let x=-248;x<=-88;x+=40)for(let z=-192;z<48;z+=40){put('BushPot_1_A',x+6.5,z+18,1,Math.PI/2);put('Bench_1_A',x+6.5,z+10,1);}
 // Residential streets gradually give way to larger gardens.
 for(let x=-72;x<=-22;x+=24)for(let z=-78;z<-45;z+=22){if(FIXED.some(p=>Math.hypot(p.x-x,p.z-z)<15))continue;put('Building_12_A',x,z,.9);put('Tree_10_AA',x+8,z+5,1.2);}
 const region=biomeAt(cx*32+16,cz*32+16),density=region.id==='forest'||region.id==='wild'?23:region.id==='farm'?5:region.id==='suburb'?3:region.id==='mountain'?4:0;
 for(let i=0;i<density;i++){
  const x=cx*32+2+hash(cx,cz,i*11+1)*28,z=cz*32+2+hash(cx,cz,i*11+2)*28;
  if(reserved(x,z)||height(x,z)<0||models.some(p=>Math.hypot(p.x-x,p.z-z)<7)||FIXED.some(p=>Math.hypot(p.x-x,p.z-z)<12))continue;
  const wild=region.id==='wild',id=(region.id==='forest'&&i%5===0)||wild?'EA01_Env_Tree_01c_PRE':['Tree_10_AA','Tree_9_AA','Tree_8_AA'][i%3];
  put(id,x,z,.85+hash(cx,cz,i+55)*.55,hash(cx,cz,i+99)*6.28);
  if(i%3===0)put('EA_M_Env_Grass_01a_PRE',x+1,z+1,.7,0,false);
 }
 if(['quarry','mountain','cave'].includes(region.id))for(let i=0;i<7;i++){
  const x=cx*32+hash(cx,cz,i+181)*32,z=cz*32+hash(cx,cz,i+219)*32;
  if(reserved(x,z))continue;put(i<2?'EA01_Env_Clif_01a':'EA01_Env_Rock_01b',x,z,i<2?1:.5,hash(cx,cz,i+303)*6.28);
 }
 // Resource locations are seeded, stable across chunk unloads and restricted by ecology.
 for(let i=0;i<3;i++){
  const x=cx*32+4+hash(cx,cz,i+801)*24,z=cz*32+4+hash(cx,cz,i+901)*24,biome=biomeAt(x,z);
  if(reserved(x,z)||height(x,z)<0||colliders.some(c=>c.kind==='rect'?Math.abs(x-c.x)<c.w/2+2&&Math.abs(z-c.z)<c.d/2+2:Math.hypot(x-c.x,z-c.z)<c.r+2))continue;
  const type=biome.resources[i%biome.resources.length];resources.push({id:`ow:${key}:${i}`,type,x,z,model:type==='scrap'?'Box_1':type==='wood'?'TreeTrunk_1_1_A':type==='fiber'?'EA_M_Env_Bush_BerryDome_01a_PRE':'EA01_Env_Rock_01c'});
 }
 for(const [i,x,z] of [[0,193,-118],[1,204,-118],[2,214,-122]])if(chunkKey(x,z)===key)resources.push({id:`ow:cave-crystal:${i}`,type:'crystal',x,z,model:'EA01_Env_Rock_01c'});
 const result={models,colliders,resources};layouts.set(key,result);return result;
}
export function staticCollision(x,z,r=.4){
 for(let cx=Math.floor((x-20)/32);cx<=Math.floor((x+20)/32);cx++)for(let cz=Math.floor((z-20)/32);cz<=Math.floor((z+20)/32);cz++){
  for(const c of sectorLayout(cx,cz).colliders){if(c.kind==='rect'?(Math.abs(x-c.x)<c.w/2+r&&Math.abs(z-c.z)<c.d/2+r):Math.hypot(x-c.x,z-c.z)<c.r+r)return true;}
 }return false;
}
// Cross-sector footprints matter: a building can extend beyond its owning sector.
export function resourceLocations(cx,cz){return sectorLayout(cx,cz).resources.filter(r=>!staticCollision(r.x,r.z,.8));}



