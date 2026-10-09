import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {wantedChunks,biomeAt,REGIONS,roadAt,chunkKey} from '../src/world/regions.js';
import {sectorLayout,staticCollision,footprintFor,resourceLocations} from '../src/world/layout.js';
import {ASSETS} from '../src/world/asset-catalog.js';
import {chooseEncounter,wildZone} from '../src/systems/encounters.js';
import {findPath} from '../src/systems/navigation.js';
import {terrainHeight,riverX,onBridge} from '../src/world/terrain.js';
import {EXPEDITIONS,completeExpedition} from '../src/systems/expeditions.js';
import {newState,normalizeSave,craft} from '../src/systems/state.js';
import {RECIPES} from '../src/systems/data.js';
test('active sectors are bounded independently of total world area',()=>{for(let x=-1020;x<1024;x+=89)for(let z=-1020;z<1024;z+=91){const list=wantedChunks(x,z,72);assert.ok(list.length<=32);assert.equal(new Set(list.map(c=>c.key)).size,list.length);assert.ok(list.every(c=>c.cx>=-32&&c.cx<32&&c.cz>=-32&&c.cz<32));}});
test('resource identities and habitat assignments survive sector recreation',()=>{const ids=new Set();for(let x=-32;x<32;x+=2)for(let z=-32;z<32;z+=2){const a=sectorLayout(x,z);assert.deepEqual(a,sectorLayout(x,z));for(const r of resourceLocations(x,z)){assert.ok(!ids.has(r.id));ids.add(r.id);assert.ok(biomeAt(r.x,r.z).resources.includes(r.type));assert.equal(chunkKey(r.x,r.z),`${x},${z}`);assert.ok(!staticCollision(r.x,r.z,.2));if(biomeAt(r.x,r.z).id==='downtown')assert.equal(r.type,'scrap');}}assert.ok(ids.size>200);});
test('catalogue dependencies exist and models remain finite and usable',()=>{for(const a of Object.values(ASSETS)){const b=fs.readFileSync(new URL('../'+a.file.slice(2),import.meta.url));assert.equal(b.readUInt32LE(0),0x46546c67);const g=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());assert.ok(a.size.every(n=>Number.isFinite(n)&&n>0));for(const image of g.images||[])if(image.uri&&!image.uri.startsWith('data:'))assert.ok(fs.existsSync(new URL('../assets/openworld/'+image.uri,import.meta.url)));}});
test('every biome keeps its own encounter pool including town wildlife',()=>{let n=5;const rng=()=>((n=(n*1664525+1013904223)>>>0)/4294967296);for(const region of REGIONS)for(let i=0;i<30;i++){const e=chooseEncounter(rng,staticCollision,[],null,region);assert.ok(e);assert.ok(wildZone(e.x,e.z));assert.ok(biomeAt(e.x,e.z).species.includes(e.id));assert.ok(e.level>=biomeAt(e.x,e.z).level);}});
test('streets connect the city, new property and river crossings',()=>{const blocked=(x,z)=>Math.abs(x)>1022||Math.abs(z)>1022||staticCollision(x,z,.35)||(Math.abs(x-riverX(z))<5.1&&!onBridge(x,z))||(terrainHeight(x,z)<-.3&&!onBridge(x,z));for(const [a,b] of [[[-240,-168],[-240,0]],[[-240,0],[-96,0]],[[-96,0],[-24,36]],[[-24,36],[-24,19]],[[-24,36],[-96,165]],[[-96,165],[-96,180]],[[-24,36],[8,8]],[[8,8],[40,8]],[[40,8],[180,8]]]){assert.ok(findPath({x:a[0],z:a[1]},{x:b[0],z:b[1]},blocked).length,`${a} to ${b}`);}});
test('expedition rewards are single use and debit only the specified items',()=>{const s=newState();s.inventory.scrap=8;const coins=s.coins;assert.equal(completeExpedition(s,'recycling'),true);assert.equal(s.inventory.scrap,0);assert.equal(s.coins,coins+80);assert.equal(completeExpedition(s,'recycling'),false);assert.equal(completeExpedition(s,'geology'),false);const loaded=normalizeSave(JSON.parse(JSON.stringify(s)));assert.equal(completeExpedition(loaded,'recycling'),false);});
test('urban recycling produces metal with the existing crafting system',()=>{const s=newState();s.inventory.scrap=4;const r=RECIPES.find(r=>r.cost.scrap);assert.ok(craft(s,r));assert.equal(s.inventory.iron,1);assert.equal(s.inventory.scrap,0);assert.equal(craft(s,r),false);});


test('camera clears a parked car above its roof while ground collision stays solid',()=>{const p=sectorLayout(-8,-6).models.find(p=>/^(Car|Taxi|PostCar)/.test(p.id));assert.ok(p);assert.equal(staticCollision(p.x,p.z,.14),true);assert.equal(staticCollision(p.x,p.z,.14,p.y+ASSETS[p.id].size[1]*p.s+.5),false);});
