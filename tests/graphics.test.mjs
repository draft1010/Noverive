import test from 'node:test';import assert from 'node:assert/strict';
import {GRAPHICS,renderRatio,AdaptiveResolution,FramePacer} from '../src/rendering/graphics.js';
import {newState,normalizeSave} from '../src/systems/state.js';
test('pixel budgets hold at phone, tablet and 4K resolutions for every preset',()=>{for(const [q,p] of Object.entries(GRAPHICS))for(const [w,h,dpr] of [[844,390,3],[1920,1080,2],[3840,2160,2]]){const r=renderRatio(q,w,h,dpr);assert.ok(w*h*r*r<=p.pixels+1);assert.ok(r<=dpr);assert.ok(r<=p.ratio);}});
test('Eco is the default on all devices',()=>assert.equal(newState().settings.quality,'low'));
test('adaptive resolution ignores isolated spikes and stays bounded under sustained pressure',()=>{const a=new AdaptiveResolution();a.sample(10);a.sample(30);assert.equal(a.scale,1);for(let i=0;i<100;i++)a.sample(10);assert.equal(a.scale,.62);for(let i=0;i<100;i++)a.sample(30);assert.equal(a.scale,1);});


test('frame pacing preserves elapsed time and target cadence on fast displays',()=>{for(const hz of [60,90,120,144,165])for(const target of [30,60]){const p=new FramePacer();let frames=0,elapsed=0;for(let i=0;i<hz*10;i++){const dt=p.tick(1/hz,target);if(dt){frames++;elapsed+=dt;}}assert.ok(Math.abs(frames-target*10)<=1,`${hz}Hz / ${target}fps: ${frames}`);assert.ok(Math.abs(elapsed-10)<1/target);}});

test('old saves start in Eco once, while new explicit quality choices persist',()=>{const state=newState();delete state.settings.graphicsVersion;state.settings.quality='ultra';assert.equal(normalizeSave(state).settings.quality,'low');state.settings.graphicsVersion=1;assert.equal(normalizeSave(state).settings.quality,'ultra');});
