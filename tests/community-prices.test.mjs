import test from 'node:test';import assert from 'node:assert/strict';
import {shopPrice} from '../src/systems/community.js';
import {newState} from '../src/systems/state.js';
test('reputation unlocks bounded permanent shop discounts',()=>{const s=newState();assert.equal(shopPrice(s,100),100);s.flags.communityReputation=60;assert.ok(shopPrice(s,100)<100);s.flags.communityReputation=9999;assert.equal(shopPrice(s,100),90);assert.equal(shopPrice(s,1),1);});
