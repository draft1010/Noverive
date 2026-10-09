import {SPECIES} from './data.js';
import {biomeAt,roadAt,isFarm,REGIONS} from '../world/regions.js';
import {terrainHeight,riverX} from '../world/terrain.js';
export function wildZone(x,z){return Math.abs(x)<310&&Math.abs(z)<310&&!isFarm(x,z)&&!roadAt(x,z)&&Math.abs(x-riverX(z))>7&&terrainHeight(x,z)>=0&&Math.hypot(x-43,z+39)>11&&Math.hypot(x+9,z)>11;}
export function chooseEncounter(rng=Math.random,blocked=()=>false,occupied=[],preferred=null,focus=null){
 for(let attempt=0;attempt<500;attempt++){
  const center=focus||REGIONS[Math.floor(rng()*REGIONS.length)];
  const angle=rng()*Math.PI*2,dist=15+rng()*70,x=center.x+Math.sin(angle)*dist,z=center.z+Math.cos(angle)*dist;
  if(!wildZone(x,z)||blocked(x,z,2.2)||occupied.some(w=>Math.hypot(x-w.homeX,z-w.homeZ)<6))continue;
  const biome=biomeAt(x,z),pool=SPECIES.filter(s=>biome.species.includes(s.id)),weights=pool.map(s=>1/s.rarity),total=weights.reduce((a,b)=>a+b,0);let roll=rng()*total,s=pool.at(-1);for(let i=0;i<pool.length;i++){roll-=weights[i];if(roll<=0){s=pool[i];break;}}
  if(preferred&&biome.species.includes(preferred))s=pool.find(s=>s.id===preferred)||s;
  if(!s)continue;
  return {id:s.id,x,z,homeX:x,homeZ:z,biome:biome.id,level:biome.level+Math.floor(rng()*3),phase:rng()*Math.PI*2};
 }return null;
}

