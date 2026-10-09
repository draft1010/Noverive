import test from 'node:test';
import assert from 'node:assert/strict';
import {height,terrainHeight,clearLandmark} from '../src/world/terrain.js';
import {indoorCollision} from '../src/rendering/interior.js';
test('both bridges connect continuously to banks and clear the terrain',()=>{for(const z of [8,-30]){assert.ok(Math.abs(height(11,z)-height(10.999,z))<.01);assert.ok(Math.abs(height(28,z)-height(28.001,z))<.01);for(let x=11;x<=28;x+=.25)assert.ok(height(x,z)-terrainHeight(x,z)>.15);}});
test('procedural trees reserve sanctuary crowns and bridge approaches',()=>{assert.ok(clearLandmark(43,-39));assert.ok(clearLandmark(50,-39));assert.ok(clearLandmark(29,-30));assert.ok(clearLandmark(10,8));assert.equal(clearLandmark(50,30),false);});
test('upstairs stairwell guard blocks a fall while both landings remain accessible',()=>{assert.ok(indoorCollision(7,3.3,.35,3.6));assert.ok(indoorCollision(5.25,0,.35,3.6));assert.equal(indoorCollision(7,3.8,.35,0),false);assert.equal(indoorCollision(7,-5.7,.35,3.6),false);});
