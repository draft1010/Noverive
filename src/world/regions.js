import {PLAN,WORLD_SIZE,inCity,cityBlock} from './plan.js';
export const WORLD_LIMIT=WORLD_SIZE/2,CHUNK_SIZE=32;
export const REGIONS=[
 {id:'downtown',name:'Les Horizons • Métropole',x:-240,z:-168,color:'#a6a8a2',species:['velune','lumignon','melipom'],resources:['scrap'],level:2},
 {id:'suburb',name:'Jardins de la Rive',x:-180,z:120,color:'#8eaa72',species:['velune','aurelievre','melipom'],resources:['fiber'],level:2},
 {id:'farm',name:'Les Vergers',x:-96,z:190,color:'#92a863',species:['cactine','moussier','melipom','aurelievre'],resources:['fiber','wood'],level:3},
 {id:'forest',name:'Forêt des Murmures',x:180,z:80,color:'#557e50',species:['dinosylve','moussier','germousse','vrille','velune'],resources:['wood','fiber'],level:4},
 {id:'lake',name:'Lac des Reflets',x:410,z:280,color:'#96ad7c',species:['calamaree','ondril','rainette','coralys'],resources:['fiber'],level:4},
 {id:'quarry',name:'Carrière des Roches Claires',x:260,z:-200,color:'#a99881',species:['sorbel','rocogre','galetis','brasile','dracendre'],resources:['stone','ore','coal'],level:5},
 {id:'mountain',name:'Massif du Levant',x:650,z:-550,color:'#929b8b',species:['astrel','nivours','alizelle','galetis'],resources:['stone','ore'],level:7},
 {id:'cave',name:'Grotte de Résonance',x:465,z:-374,color:'#918888',species:['noctile','lumignon','dracendre','galetis'],resources:['crystal','coal','ore'],level:8},
 {id:'wild',name:'Réserve des Lointains',x:650,z:650,color:'#66804e',species:['fulgurin','dinosylve','germousse','dracendre','alizelle','coralys'],resources:['wood','crystal'],level:9},
];
export function biomeAt(x,z){let id=inCity(x,z)?'downtown':x<5?(z<155?'suburb':'farm'):'forest';if(x>170&&z<-100)id='quarry';if(x>380&&z<-390)id='mountain';if(Math.hypot(x-PLAN.cave.x,z-PLAN.cave.z)<62)id='cave';if(Math.hypot((x-410)/1.25,z-280)<125)id='lake';if(x>430&&z>470)id='wild';return REGIONS.find(r=>r.id===id);}
export const CITY_X=Array.from({length:17},(_,i)=>-768+i*48),CITY_Z=Array.from({length:15},(_,i)=>-576+i*48);
const gridDistance=n=>Math.abs(n-Math.round(n/48)*48);
export function roadAt(x,z){
 if(inCity(x,z)&&(gridDistance(x)<4||gridDistance(z)<4))return 'city';
 if(x>0&&x<820&&Math.abs(z-8)<3.8)return 'country';
 if(z>96&&z<120&&Math.abs(x+96)<3.8)return 'country';
 if(x>=-100&&x<=-60&&Math.abs(z-120)<3.8)return 'country';
 if(z>=120&&Math.abs(x+64)<3.8)return 'country';
 if(x>28&&Math.abs(x-(180+Math.sin(z*.006)*38))<2.2)return 'trail';
 if(x>140&&x<740&&Math.abs(z+350)<2.2)return 'trail';
 if(x>180&&x<430&&Math.abs(z-280)<2.2)return 'trail';
 if(x>-130&&x<-68&&Math.abs(z-168)<2)return 'trail';
 if(x>140&&x<261&&Math.abs(z+200)<2.2)return 'trail';
 if(z<-348&&z>-360&&Math.abs(x-465)<2.2)return 'trail';
 return null;
}
export const isFarm=(x,z)=>x>PLAN.farm.left&&x<PLAN.farm.right&&z>PLAN.farm.top&&z<PLAN.farm.bottom;
export function hash(x,z,s=0){let n=Math.imul(Math.floor(x)+374761393,668265263)^Math.imul(Math.floor(z)+144269,1274126177)^s;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
export function blockKind(bx,bz){if(bx===-48&&bz===0)return 'plaza';if(bx===-96&&bz===0)return 'market';const n=hash(bx,bz,4);return n<.08?'park':n>.92?'court':bx<-440?'residential':bz<-240?'towers':'shops';}
export function cityParkAt(x,z){if(!inCity(x,z))return false;const b=cityBlock(x,z);return blockKind(b.x,b.z)==='park'&&x-b.x>8&&x-b.x<40&&z-b.z>8&&z-b.z<40;}
export const chunkKey=(x,z)=>`${Math.floor(x/32)},${Math.floor(z/32)}`;
export function wantedChunks(x,z,radius){const out=[],cx=Math.floor(x/32),cz=Math.floor(z/32),n=Math.ceil(radius/32),limit=WORLD_LIMIT/32;for(let a=cx-n;a<=cx+n;a++)for(let b=cz-n;b<=cz+n;b++){if(a< -limit||a>=limit||b< -limit||b>=limit)continue;const d=Math.hypot(a*32+16-x,b*32+16-z);if(d<radius+23)out.push({key:`${a},${b}`,cx:a,cz:b,d});}return out.sort((a,b)=>a.d-b.d);}
export const FIELD_SKILLS={eau:['irrigation'],feu:['heat'],nature:['cultivation'],air:['updraft'],terre:['excavation'],lumiere:['illumination']};
