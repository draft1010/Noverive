import test from 'node:test';import assert from 'node:assert/strict';
import {newState,normalizeSave,canPlace} from '../src/systems/state.js';
import {orders,deliverOrder,claimMilestone,startDelivery,updateDelivery,deliveryTarget} from '../src/systems/community.js';
import {PLAN} from '../src/world/plan.js';
import {roadAt} from '../src/world/regions.js';
import {sectorLayout,footprintFor} from '../src/world/layout.js';
test('daily orders debit goods exactly once and survive reload',()=>{let s=newState(),o=orders(s)[0];assert.equal(deliverOrder(s,o.id),false);s.inventory[o.item]=o.count;const coins=s.coins;assert.ok(deliverOrder(s,o.id));assert.equal(s.inventory[o.item],0);assert.equal(s.coins,coins+o.coins);s=normalizeSave(JSON.parse(JSON.stringify(s)));assert.equal(deliverOrder(s,o.id),false);s.day++;assert.notEqual(orders(s)[0].id,o.id);assert.equal(deliverOrder(s,o.id),false);});
test('milestones do not reward incomplete or repeated claims',()=>{const s=newState();assert.equal(claimMilestone(s,'gardener'),false);s.stats.harvested=20;assert.ok(claimMilestone(s,'gardener'));assert.equal(claimMilestone(s,'gardener'),false);assert.equal(s.flags.communityReputation,20);});
test('delivery requires a car, pickup, actual travel and can span days',()=>{let s=newState();assert.equal(startDelivery(s),false);s.buildings.push({type:'car',...PLAN.workshop});assert.ok(startDelivery(s));assert.equal(startDelivery(s),false);assert.equal(updateDelivery(s,true),null);s.player={...PLAN.workshop};assert.equal(updateDelivery(s,false),null);assert.match(updateDelivery(s,true),/Colis chargé/);s=normalizeSave(JSON.parse(JSON.stringify(s)));s.day++;s.player={...deliveryTarget(s)};assert.match(updateDelivery(s,true),/terminée/);assert.equal(updateDelivery(s,true),null);assert.equal(startDelivery(s),false);s.day++;assert.ok(startDelivery(s));});
test('public interiors cannot be obstructed by furniture',()=>{const s=newState();for(const location of ['house--8-24','house--40-24']){s.location=location;assert.equal(canPlace(s,0,0,()=>false,'chair'),false);}});
test('outer half of perimeter road remains clear of decorative model footprints',()=>{
 for(const [x,z] of [[-770,-200],[2,-200],[-200,-578],[-200,98]])assert.equal(roadAt(x,z),'city');
 const strips=[[-772,-768,-580,100],[0,4,-580,100],[-772,4,-580,-576],[-772,4,96,100]];
 const sectors=new Set();for(const [left,right,top,bottom] of strips)for(let x=Math.floor(left/32);x<=Math.floor(right/32);x++)for(let z=Math.floor(top/32);z<=Math.floor(bottom/32);z++)sectors.add(`${x},${z}`);
 for(const key of sectors){const [x,z]=key.split(',').map(Number);for(const m of sectorLayout(x,z).models){if(/^(Road_|StreetTile_)/.test(m.id))continue;const f=footprintFor(m);for(const [l,r,t,b] of strips)assert.ok(!(f.x+f.w/2>l+.02&&f.x-f.w/2<r-.02&&f.z+f.d/2>t+.02&&f.z-f.d/2<b-.02),`${m.id} overlaps perimeter at ${m.x},${m.z}`);}}
});
