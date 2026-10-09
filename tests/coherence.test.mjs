import test from 'node:test';
import assert from 'node:assert/strict';
import {sectorLayout,FIXED,footprintFor} from '../src/world/layout.js';
import {roadAt} from '../src/world/regions.js';
import {PLAN} from '../src/world/plan.js';
import fs from 'node:fs';
import {PropertyBinding} from '../vendor/three.module.js';

test('entire world has no vehicles or environmental footprints on roads',()=>{
 let buildings=0;
 for(let cx=-32;cx<32;cx++)for(let cz=-32;cz<32;cz++)for(const p of sectorLayout(cx,cz).models){
  assert.ok(!/^(Car_|Taxi_|PostCar_|IceTruck_|SM_Tractor)/.test(p.id),p.id);
  if(/^(Road_|StreetTile_)/.test(p.id))continue;
  const f=footprintFor(p);if(/Building|SM_House|SM_Barn/.test(p.id))buildings++;
  // Independent dense probes across actual rotated bounds, not just object centres.
  for(let x=f.x-f.w/2;x<=f.x+f.w/2+.001;x+=Math.max(.25,f.w/8))for(let z=f.z-f.d/2;z<=f.z+f.d/2+.001;z+=Math.max(.25,f.d/8))assert.equal(roadAt(x,z),null,`${p.id} at ${p.x},${p.z} crosses a road at ${x},${z}`);
 }
 assert.ok(buildings>1000);
});
test('all fixed landmarks exist and house is fully inside the fenced property',()=>{
 for(const p of FIXED)assert.ok(sectorLayout(Math.floor(p.x/32),Math.floor(p.z/32)).models.some(m=>m.id===p.id&&m.x===p.x&&m.z===p.z),`${p.id} missing`);
 const house=footprintFor(FIXED.find(p=>p.id==='SM_House_1_A'));
 assert.ok(house.x-house.w/2>PLAN.farm.left&&house.x+house.w/2<PLAN.farm.right&&house.z-house.d/2>PLAN.farm.top&&house.z+house.d/2<PLAN.farm.bottom);
 assert.equal(roadAt(PLAN.home.x,PLAN.home.z),null);
});
test('tool attachment uses the actual GLTFLoader-sanitized right hand name',()=>{
 const b=fs.readFileSync('assets/openworld/Character_10_1_1.glb'),j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));
 assert.ok(j.nodes.some(n=>PropertyBinding.sanitizeNodeName(n.name||'')==='HandR'));
 assert.match(fs.readFileSync('src/rendering/modern-character.js','utf8'),/getObjectByName\('HandR'\)/);
});
test('all city buildings have separate complete footprints',()=>{
 const buildings=[];for(let x=-24;x<=0;x++)for(let z=-18;z<=3;z++)buildings.push(...sectorLayout(x,z).models.filter(p=>p.id.startsWith('Building')).map(footprintFor));
 for(let i=0;i<buildings.length;i++)for(let j=i+1;j<buildings.length;j++){const a=buildings[i],b=buildings[j];assert.ok(Math.abs(a.x-b.x)>=(a.w+b.w)/2-.05||Math.abs(a.z-b.z)>=(a.d+b.d)/2-.05,`buildings overlap at ${a.x},${a.z} and ${b.x},${b.z}`);}
});
