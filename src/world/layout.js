import {ASSETS} from './asset-catalog.js';
import {biomeAt,roadAt,isFarm,hash,chunkKey,blockKind} from './regions.js';
import {PLAN,CITY_BOUNDS,inCity} from './plan.js';
import {height,riverX,clearLandmark} from './terrain.js';
const layouts=new Map();
export function footprintFor(p){const a=ASSETS[p.id],s=p.s??1,c=Math.abs(Math.cos(p.r||0)),t=Math.abs(Math.sin(p.r||0));return {x:p.x,z:p.z,w:(a.size[0]*c+a.size[2]*t)*s,d:(a.size[0]*t+a.size[2]*c)*s,kind:'rect',r:0,y:p.y??height(p.x,p.z),height:a.size[1]*s};}
// Reserve the whole footprint, including rotated eaves, foliage and field borders.
export function overlapsRoad(p){const f=footprintFor(p),nx=Math.max(1,Math.ceil(f.w)),nz=Math.max(1,Math.ceil(f.d));for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++)if(roadAt(f.x-f.w/2+f.w*i/nx,f.z-f.d/2+f.d*j/nz))return true;return false;}
export const FIXED=[
 {id:'Fountain_1_A',x:-24,z:28,s:1.6},
 {id:'Building_3_1_A',x:-40,z:24,s:.85,r:Math.PI},
 {id:'CafeSign_5_A',x:-35,z:21,s:1,solid:false},
 {id:'Building_2_1_A',x:-8,z:24,s:.85,r:0},
 {id:'Kiosk_1_A',x:-78,z:24,s:1.1},
 {id:'FoodCart_1_A',x:-62,z:28,s:1},
 {id:'SM_House_1_A',x:PLAN.home.x,z:PLAN.home.z,s:.9},
 {id:'SM_Barn_1_A',x:-144,z:182,s:1},
 {id:'SM_Silos_1_A',x:-155,z:176,s:1},
 {id:'SM_GreenHouse_1_A',x:-145,z:208,s:1},
 {id:'SM_Hay_1',x:-133,z:179,s:1},
 {id:'SM_Hay_1',x:-133,z:182,s:1.2},
 {id:'StationTable_1_A',x:PLAN.workshop.x,z:PLAN.workshop.z,s:1.3},
 {id:'Axe_A',x:-115.5,z:177,s:1,dy:1,solid:false},
 {id:'Hammer_1_A',x:-114.5,z:177,s:1,dy:1,solid:false},
 {id:'Basketball_Court_1',x:PLAN.arena.x,z:PLAN.arena.z,s:1.5,solid:false},
];
const blocks=['Building_1_A','Building_2_1_A','Building_8_1_A','Building_10_A','Building_15_A','Building_18_1_A','Building_24_A','Building_26_A','Building_9_2_A','Building_11_1_A','Building_17_2_A','Building_21_3_A','Building_27_A'];
const fields=(x,z)=>x>-280&&x<-140&&z>250&&z<520;
function reserve(x,z){return roadAt(x,z)||isFarm(x,z)||fields(x,z)||clearLandmark(x,z)||Math.abs(x-riverX(z))<9||FIXED.some(p=>Math.hypot(x-p.x,z-p.z)<Math.max(5,Math.max(ASSETS[p.id].size[0],ASSETS[p.id].size[2])*(p.s||1)/2+2));}
export function sectorLayout(cx,cz){
 const key=`${cx},${cz}`;if(layouts.has(key)){const value=layouts.get(key);layouts.delete(key);layouts.set(key,value);return value;}
 const models=[],colliders=[],resources=[];
 function put(id,x,z,s=1,r=0,solid=true,detail=false){if(chunkKey(x,z)!==key||!ASSETS[id])return;const p={id,x,z,y:height(x,z),s,r,detail};if(!/^(Road_|StreetTile_)/.test(id)&&overlapsRoad(p))return;models.push(p);if(solid){const c=/Tree/.test(id)?{x,z,r:(id.startsWith('EA01_Env_Tree')?1.65:.42)*s,kind:'circle'}:footprintFor(p);c.y=p.y;c.height=ASSETS[id].size[1]*s;colliders.push(c);}return p;}
 function building(id,x,z,rotation=0,maxWidth=10,maxDepth=12){const a=ASSETS[id],r=rotation+Math.PI/2,c=Math.abs(Math.cos(r)),t=Math.abs(Math.sin(r)),s=Math.min(1.15,maxWidth/(a.size[0]*c+a.size[2]*t),maxDepth/(a.size[0]*t+a.size[2]*c));return put(id,x,z,s,rotation+Math.PI/2);}
 function garden(x,z,r=0){put('FlowerPlacet_5_1_A',x,z,1,r);for(let k=-3;k<=3;k++){const d=k*.49,dx=Math.sin(r)*d,dz=Math.cos(r)*d;const bush=put('Bush_1_A_1',x+dx,z+dz,.46,r,false,true);if(bush)bush.y+=.66;for(const side of [-1,1]){const flower=put(k%2?'Flowers_1_A':'Flowers_2_A',x+dx+Math.cos(r)*side*.34,z+dz-Math.sin(r)*side*.34,1.35,r,false,true);if(flower)flower.y+=.73;}}}
 for(const p of FIXED){const m=put(p.id,p.x,p.z,p.s,p.r,p.solid!==false);if(m)m.y+=p.dy||0;}
 // Roads are exact 8 m modules. Raised paving is instanced and has a world-aligned stone material beneath it.
 for(let x=cx*32;x<cx*32+32;x+=8)for(let z=cz*32;z<cz*32+32;z+=8){if(roadAt(x,z)!=='city')continue;const crossing=x%48===0&&z%48===0;const p=put(crossing?'Road_A_7':'Road_A_1',x,z,1,z%48===0?Math.PI/2:0,false);if(p)p.y-=.19;}
 const b=CITY_BOUNDS;
 // Only blocks touching this sector are evaluated; no full-world scan is needed for streaming or collision.
 for(let bx=Math.max(b.left,Math.floor((cx*32-48)/48)*48);bx<=Math.min(b.right-48,Math.floor((cx*32+32)/48)*48);bx+=48)
 for(let bz=Math.max(b.top,Math.floor((cz*32-48)/48)*48);bz<=Math.min(b.bottom-48,Math.floor((cz*32+32)/48)*48);bz+=48){
  const kind=blockKind(bx,bz),h=hash(bx,bz,22);
  if(kind==='plaza'||kind==='market'){
   for(const dx of [12,24,36])building(blocks[(dx/12+Math.floor(h*10))%blocks.length],bx+dx,bz+11,0,10,12);
   if(kind==='plaza'){
    for(const [dx,dz] of [[10,38],[38,38],[24,40],[9,9],[39,9]]){put('FlowerPlace_6_A',bx+dx,bz+dz,1);put('Tree_A_1',bx+dx,bz+dz,1.7);}
    for(const dx of [14,34]){put('Bench_1_A',bx+dx,bz+32,1,dx<24?Math.PI/2:-Math.PI/2);garden(bx+dx,bz+38,Math.PI/2);garden(bx+dx,bz+19,Math.PI/2);}
    for(const dz of [22,27]){put('Table_1_A',bx+15,bz+dz,1,0,false);for(const dx of [13.5,16.5])put('Chair_1_A',bx+dx,bz+dz,1,dx<15?Math.PI/2:-Math.PI/2);}
    for(const dx of [6,42])for(const dz of [18,30,40])garden(bx+dx,bz+dz);for(const dx of [18,30]){garden(bx+dx,bz+34);garden(bx+dx,bz+42,Math.PI/2);}
   }else{for(const dx of [12,24,36])garden(bx+dx,bz+42,Math.PI/2);}
  }else if(kind==='park'||kind==='court'){
   if(kind==='court'){put('Basketball_Court_1',bx+24,bz+24,1.65,0,false);for(const dz of [10,38])put('Basketball_Stand_A',bx+24,bz+dz,1,dz===10?0:Math.PI);}
   for(const dx of [10,38])for(const dz of [10,24,38]){put('Tree_B_1',bx+dx,bz+dz,1.8);put('Bush_1_A_1',bx+dx+2,bz+dz,1,0,false,true);}
   for(const dz of [16,32])put('Bench_1_A',bx+7,bz+dz,1,Math.PI/2);
  }else if(kind==='towers'&&h>.35){building('Building_7_1_A',bx+24,bz+24,0,29,29);for(const dx of [9,39])for(const dz of [12,36])put('FlowerPlacet_5_1_A',bx+dx,bz+dz,1,Math.PI/2);}
  else{
   for(const dz of [12,36])for(const dx of [12,24,36]){const ids=kind==='residential'?['Building_1_1_A','Building_12_A','Building_10_A']:blocks,id=ids[Math.floor(hash(bx+dx,bz+dz,82)*ids.length)];building(id,bx+dx,bz+dz,dz===12?Math.PI:0,10.6,11.2);}
   for(const dx of [12,36])building(blocks[Math.floor(hash(bx+dx,bz,92)*blocks.length)],bx+dx,bz+24,dx===12?-Math.PI/2:Math.PI/2,10.5,10);
   put('Pallet_1_1',bx+21,bz+24,1,0,true,true);put('Trashbin_1_A',bx+27,bz+24,1,0,true,true);
  }
  // Every street has a continuous furnished edge, with free pedestrian corridors.
  for(const d of [10,24,38]){put('StreetLamp_3_A',bx+5.5,bz+d,1);put('StreetLamp_3_A',bx+d,bz+5.5,1);}
  for(const d of [17,33]){put('FlowerPlace_6_A',bx+6,bz+d,.7,0,false);put('Tree_A_1',bx+6,bz+d,1.2);put('Trashbin_1_A',bx+d,bz+5.5,1,0,true,true);garden(bx+d,bz+6,Math.PI/2);}

  if(h>.55)put('BusStop_A',bx+31,bz+5.8,1);
  for(let d=6;d<=42;d+=2){put('StreetTile_1_A_1',bx+d,bz+5,1,0,false,true);put('StreetTile_1_A_1',bx+5,bz+d,1,0,false,true);}
 }
 // Farmland and orchard rows make the property part of a working landscape.
 for(let x=Math.floor(cx*32/10)*10;x<cx*32+32;x+=10)for(let z=Math.floor(cz*32/10)*10;z<cz*32+32;z+=10){if(fields(x,z)){put('SM_Field_1_4_A',x,z,1.2,0,false);for(const dx of [-2,0,2])for(const dz of [-2,0,2]){const id=z%30===0?'SM_CornPlant':'SM_Plant_Wheat';put(id,x+dx,z+dz,1.15/ASSETS[id].size[1],0,false,true);}}}
 if(cz*32>220&&cx*32<-300)for(let x=cx*32+6;x<cx*32+32;x+=12)for(let z=cz*32+6;z<cz*32+32;z+=12)if(!roadAt(x,z))put('Tree_7_AA',x,z,1.05);
 for(let x=PLAN.farm.left;x<=PLAN.farm.right;x+=2.5)for(const z of [PLAN.farm.top,PLAN.farm.bottom])put('SM_Fence_1_2_A',x,z,.8,Math.PI/2);
 for(let z=PLAN.farm.top;z<PLAN.farm.bottom;z+=2.5)for(const x of [PLAN.farm.left,PLAN.farm.right])if(Math.abs(z-168)>3)put('SM_Fence_1_2_A',x,z,.8);
 // Managed orchard, productive beds and entrance planting inside the farm fence.
 for(const x of [-155,-143,-131])for(const z of [148,158])put('SM_Tree_A_1',x,z,1.2);
 for(const z of [198,206,214]){put('SM_Field_3_1',-128,z,.65,0,false);for(const dx of [-1,1])for(const dz of [-1,1])put(z===198?'SM_TomatoPlant_1_A':z===206?'SM_CornPlant':'SM_Sunflower_4',-128+dx,z+dz,.65,0,false);}
 for(const x of [-119,-79]){garden(x,149,Math.PI/2);garden(x,159,Math.PI/2);}
 put('Bench_1_A',-83,163,1,Math.PI);put('SM_WateringCan_1_A',-116,179,.8,0,false);
 put('SM_FarmSign_1_A',-78,174,.45);put('SM_LetterBox_1_1_A',-78,163,1.2);
 // Short meadow islands break up the lawn without filling paths, buildings or working beds.
 for(let i=0;i<560;i++){
  const x=cx*32+hash(cx*560+i,cz,701)*32,z=cz*32+hash(cx,cz*560+i,1792)*32;
  if(!isFarm(x,z)||roadAt(x,z)||Math.abs(z-168)<3||x>-114&&x<-100&&z>182&&z<193||x>-132&&x<-124&&z>194||FIXED.some(p=>{const f=footprintFor(p);return Math.abs(x-f.x)<f.w/2+1.8&&Math.abs(z-f.z)<f.d/2+1.8;}))continue;
  if(hash(Math.floor(x/4),Math.floor(z/4),501)<.32)continue;
  const flower=i%17===0,id=flower?'EA_M_Env_Flower_01a_PRE':'EA_M_Env_Grass_01a_PRE';
  const p=put(id,x,z,flower?.28:.12+hash(cx,cz,i+63)*.09,hash(cx,cz,i+15)*6.28,false,false);if(p&&!flower)p.meadow=true;
 }
 // A wide doorway faces the mountain trail; walls and roof sit entirely off the road.
 for(const z of [-367,-377,-387]){
  for(const x of [455,475])put('EA01_Env_Clif_01a',x,z,.65,Math.PI/2);
  const roof=put('EA01_Env_Clif_01b',465,z,.75,0,false);if(roof){roof.y+=6;roof.sy=.16;roof.sx=1.3;roof.sz=.9;}
 }
 put('EA01_Env_Clif_01a',465,-394,.8);
 // Working quarry, with an open western entrance and a broad central aisle.
 for(const [x,z] of [[245,-216],[259,-222],[275,-216],[283,-202],[275,-184],[259,-179],[245,-184]])put('EA01_Env_Clif_01a',x,z,.65,0);
 const region=biomeAt(cx*32+16,cz*32+16),natural=region.id!=='downtown';
 if(region.id==='forest'){const x=cx*32+16,z=cz*32+16;if(!reserve(x,z))put('SM_Tree_F_1',x,z,1,hash(cx,cz)*6.28,false,true);}
 const trees=['forest','wild'].includes(region.id)?24:['farm','suburb'].includes(region.id)?7:region.id==='lake'?8:4;
 if(natural)for(let i=0;i<trees;i++){
  const x=cx*32+hash(cx,cz,i*7+1)*32,z=cz*32+hash(cx,cz,i*7+2)*32;if(reserve(x,z)||height(x,z)<.05||inCity(x,z)||models.some(p=>!p.detail&&Math.hypot(x-p.x,z-p.z)<3.2))continue;
  const id=region.id==='wild'||i%4===0?'EA01_Env_Tree_01c_PRE':['Tree_7_AA','Tree_8_AA','Tree_9_AA'][i%3];put(id,x,z,.9+hash(cx,cz,i+500)*.7,hash(cx,cz,i+900)*6.28);
 }
 if(natural)for(let i=0;i<180;i++){
  const x=cx*32+hash(cx,cz,i*13+401)*32,z=cz*32+hash(cx,cz,i*13+402)*32;if(reserve(x,z)||height(x,z)<0||inCity(x,z))continue;
  const id=i%9===0?'EA_M_Env_Flower_01a_PRE':i%13===0?'EA_M_Env_Flower_01b_PRE':i%7===0?'EA_M_Env_Bush_LeafClusterLarge_01ax_PRE':i%5===0?'EA_M_Env_Dry_Grass_01a_PRE':'EA_M_Env_Grass_01a_PRE';const grass=id==='EA_M_Env_Grass_01a_PRE',m=put(id,x,z,(grass?.14:.7)+hash(cx,cz,i+87)*(grass?.07:.5),hash(cx,cz,i+91)*6.28,false,true);if(m&&grass)m.meadow=true;
 }
 if(['quarry','mountain','cave','lake','wild'].includes(region.id))for(let i=0;i<12;i++){const x=cx*32+hash(cx,cz,i+181)*32,z=cz*32+hash(cx,cz,i+219)*32;if(reserve(x,z)||height(x,z)<0)continue;put(i<2?'EA01_Env_Clif_01a':'EA01_Env_Rock_01b',x,z,i<2?.8+hash(cx,cz,i)*.7:.2+hash(cx,cz,i)*.45,hash(cx,cz,i+303)*6.28,i<5,i>=5);}
 for(let i=0;i<4;i++){const x=cx*32+4+hash(cx,cz,i+801)*24,z=cz*32+4+hash(cx,cz,i+901)*24,bio=biomeAt(x,z);if(reserve(x,z)||height(x,z)<0)continue;const type=bio.resources[i%bio.resources.length];resources.push({id:`v2:${key}:${i}`,type,x,z,model:type==='scrap'?'Box_1':type==='wood'?'TreeTrunk_1_1_A':type==='fiber'?'EA_M_Env_Bush_BerryDome_01a_PRE':'EA01_Env_Rock_01c'});}
 for(const [i,x,z] of [[0,462,-363],[1,468,-371],[2,462,-379],[3,468,-386]])if(chunkKey(x,z)===key)resources.push({id:`v2:cave:${i}`,type:'crystal',x,z,model:'EA01_Env_Rock_01c'});
 for(const [i,x,z,type] of [[0,251,-208,'stone'],[1,262,-210,'ore'],[2,270,-203,'coal'],[3,261,-190,'ore']])if(chunkKey(x,z)===key)resources.push({id:'v3:quarry:'+i,type,x,z,model:'EA01_Env_Rock_01c'});
 const result={models,colliders,resources};layouts.set(key,result);if(layouts.size>512)layouts.delete(layouts.keys().next().value);return result;
}
export function staticCollision(x,z,r=.4,cameraY=null){for(let cx=Math.floor((x-28)/32);cx<=Math.floor((x+28)/32);cx++)for(let cz=Math.floor((z-28)/32);cz<=Math.floor((z+28)/32);cz++)for(const c of sectorLayout(cx,cz).colliders)if((cameraY===null||(cameraY>c.y-.2&&cameraY<c.y+c.height+.1))&&(c.kind==='rect'?(Math.abs(x-c.x)<c.w/2+r&&Math.abs(z-c.z)<c.d/2+r):Math.hypot(x-c.x,z-c.z)<c.r+r))return true;return false;}
export function resourceLocations(cx,cz){return sectorLayout(cx,cz).resources.filter(r=>!staticCollision(r.x,r.z,.8)&&!overlapsRoad({id:r.model,x:r.x,z:r.z,s:r.type==='fiber'?.42:r.type==='wood'?1.1:.22}));}
