// World coordinates are stable save identifiers. The original homestead stays in place.
export const WORLD_LIMIT = 320;
export const CHUNK_SIZE = 32;
export const REGIONS = [
 {id:'downtown',name:'Centre • Les Horizons',x:-168,z:-72,color:'#c7cbbb',species:['velune','lumignon','melipom'],resources:['scrap'],level:2},
 {id:'suburb',name:'Quartier des Jardins',x:-60,z:-10,color:'#bac79b',species:['velune','aurelievre','melipom'],resources:['fiber'],level:2},
 {id:'farm',name:'Plaine des Vergers',x:-28,z:48,color:'#b8c67b',species:['moussier','melipom','aurelievre'],resources:['fiber','wood'],level:3},
 {id:'forest',name:'Forêt des Murmures',x:90,z:20,color:'#648f78',species:['moussier','germousse','vrille','velune'],resources:['wood','fiber'],level:4},
 {id:'lake',name:'Lac des Reflets',x:145,z:110,color:'#78b9be',species:['ondril','rainette','coralys'],resources:['fiber'],level:4},
 {id:'quarry',name:'Carrière des Roches Claires',x:110,z:-80,color:'#b6ada0',species:['galetis','brasile','dracendre'],resources:['stone','ore','coal'],level:5},
 {id:'mountain',name:'Crêtes du Levant',x:210,z:-190,color:'#a8b5ad',species:['nivours','alizelle','galetis'],resources:['stone','ore'],level:7},
 {id:'cave',name:'Grotte de Résonance',x:192,z:-120,color:'#aaa1bb',species:['lumignon','dracendre','galetis'],resources:['crystal','coal','ore'],level:8},
 {id:'wild',name:'Réserve des Lointains',x:235,z:210,color:'#568574',species:['germousse','dracendre','alizelle','coralys'],resources:['wood','crystal'],level:9},
];
export function biomeAt(x,z){
 let id = x < -90 && z < 80 && z > -220 ? 'downtown' : x < 8 && z < 18 && z > -90 ? 'suburb' : x < 8 ? 'farm' : 'forest';
 if(x>55&&z<-45)id='quarry';
 if(x>140&&z<-145)id='mountain';
 if(Math.hypot(x-192,z+120)<32)id='cave';
 if(Math.hypot((x-145)/1.2,z-110)<58)id='lake';
 if(x>165&&z>175)id='wild';
 return REGIONS.find(r=>r.id===id);
}
export const CITY_X=[-248,-208,-168,-128,-88];
export const CITY_Z=[-192,-152,-112,-72,-32,8,48];
export function roadAt(x,z){
 if(x>=-260&&x<=-76&&z>=-204&&z<=64 && (CITY_X.some(v=>Math.abs(x-v)<4)||CITY_Z.some(v=>Math.abs(z-v)<4)))return 'city';
 if(x>-260&&x<260&&Math.abs(z-8)<3.5)return 'country';
 if(x>-90&&x<12&&Math.abs(z+30)<3.5)return 'country';
 if(x>28&&x<250&&Math.abs(z+30)<2.5)return 'trail';
 if(Math.abs(x+9)<2.5&&z>-70&&z<120)return 'country';
 if(x>-42&&x<-9&&Math.abs(z-20)<1.3)return 'trail';
 if(Math.abs(x+32)<1.3&&z>20&&z<42)return 'trail';
 if(x>28&&Math.abs(x-(82+Math.sin(z*.018)*8))<2&&z>-190&&z<255)return 'trail';
 if(x>80&&x<230&&Math.abs(z+120)<2)return 'trail';
 return null;
}
export const isFarm = (x,z)=>x>-46&&x<-13&&z>18&&z<44;
export function hash(x,z,s=0){let n=Math.imul(x+374761393,668265263)^Math.imul(z+144269,1274126177)^s;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
export function cityParkAt(x,z){const bx=Math.floor((x+248)/40)*40-248,bz=Math.floor((z+192)/40)*40-192;return bx>=-248&&bx<-88&&bz>=-192&&bz<48&&hash(bx,bz)<.13&&x-bx>5&&x-bx<35&&z-bz>5&&z-bz<35;}
export const chunkKey=(x,z)=>`${Math.floor(x/CHUNK_SIZE)},${Math.floor(z/CHUNK_SIZE)}`;
export function wantedChunks(x,z,radius){const out=[];const cx=Math.floor(x/32),cz=Math.floor(z/32),n=Math.ceil(radius/32);for(let a=cx-n;a<=cx+n;a++)for(let b=cz-n;b<=cz+n;b++){if(a< -10||a>=10||b< -10||b>=10)continue;const d=Math.hypot(a*32+16-x,b*32+16-z);if(d<radius+23)out.push({key:`${a},${b}`,cx:a,cz:b,d});}return out.sort((a,b)=>a.d-b.d);}
// Future field skills can be enabled without changing combat or existing saves.
export const FIELD_SKILLS={eau:['irrigation'],feu:['heat'],nature:['cultivation'],air:['updraft'],terre:['excavation'],lumiere:['illumination']};

