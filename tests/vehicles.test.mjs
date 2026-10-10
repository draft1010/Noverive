import test from 'node:test';
import assert from 'node:assert/strict';
import {driveVehicle,vehicleBlocked,vehicleExit} from '../src/systems/vehicles.js';
import {newState,craft,canPlace,normalizeSave} from '../src/systems/state.js';
import {RECIPES} from '../src/systems/data.js';
import {PLAN} from '../src/world/plan.js';
test('workshop chain consumes actual components and builds a car',()=>{
 const s=newState();Object.assign(s.inventory,{iron:14,fiber:16,plank:4,crystal:3,cloth:2});
 assert.equal(craft(s,RECIPES.find(r=>r.id==='carWheel')),false);
 s.player={...PLAN.workshop};
 for(const id of ['carWheel','carWheel','carWheel','carWheel','carFrame','carMotor','car'])assert.equal(craft(s,RECIPES.find(r=>r.id===id)),true,id);
 assert.equal(s.inventory.car,1);assert.equal(s.inventory.carWheel,0);assert.equal(craft(s,RECIPES.find(r=>r.id==='car')),false);
});
test('car can be placed outside farm but not inside obstacles, homes or world edge',()=>{
 const s=newState();assert.ok(canPlace(s,500,500,()=>false,'car'));
 assert.equal(canPlace(s,500,500,(x,z)=>Math.hypot(x-500,z-500)<.3,'car'),false);
 assert.equal(canPlace(s,1023,500,()=>false,'car'),false);
 s.location='home';assert.equal(canPlace(s,0,0,()=>false,'car'),false);
});
test('acceleration, reverse, steering, braking and swept collision',()=>{
 const car={x:0,z:0,r:0};
 for(let i=0;i<60;i++)driveVehicle(car,{throttle:1},1/60,()=>false);
 assert.ok(car.z>3&&car.speed>6);
 const oldR=car.r;driveVehicle(car,{throttle:1,steer:1},.1,()=>false);assert.ok(car.r<oldR);
 for(let i=0;i<30;i++)driveVehicle(car,{brake:true},1/60,()=>false);assert.equal(car.speed,0);
 for(let i=0;i<60;i++)driveVehicle(car,{throttle:-1},1/60,()=>false);assert.ok(car.speed<0);
 const fast={x:0,z:0,r:0,speed:14};for(let i=0;i<30;i++)driveVehicle(fast,{throttle:1},.1,(x,z,r)=>z+r>=5);
 assert.ok(fast.z<3.2);assert.equal(fast.speed,0);
 assert.equal(vehicleBlocked({x:0,z:0,r:Math.PI/4},(x,z,r)=>Math.hypot(x,z)<r),true);
});
test('exit chooses an unblocked side and parked position survives a save',()=>{
 const car={type:'car',x:500,z:500,r:0,location:'world'};
 assert.equal(vehicleExit(car,()=>true),null);
 const exit=vehicleExit(car,(x)=>x<500);assert.ok(exit.x>500);
 const s=newState();s.buildings.push(car);const loaded=normalizeSave(JSON.parse(JSON.stringify(s)));assert.deepEqual(loaded.buildings[0],car);
});
