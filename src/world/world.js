import {hitsCollider,PLAYER_RADIUS} from './collision.js';
import {terrainBlocked} from './terrain.js';
import {cropVisual} from '../rendering/crops.js';
import {upgradeFurniture,disposeFurniture} from '../rendering/modern-furniture.js';
import {buildModernWorld,populateModernWild,populateModernPeople} from './modern-world.js';
import {staticCollision} from './layout.js';
import {WORLD_LIMIT,roadAt} from './regions.js';
import {chooseEncounter,wildZone} from '../systems/encounters.js';
import {
  T,
  Factory,
  random,
furnishing,
} from "../rendering/art.js";
import { modelCreature } from "../rendering/monster-models.js";
import { stepNpc } from "../systems/npc-motion.js";
import { species } from "../systems/data.js";
import {riverX,terrainHeight,onBridge,height,bridgeHeight,baseTerrainHeight,clearLandmark} from './terrain.js';
export {riverX,terrainHeight,onBridge,height,bridgeHeight,clearLandmark} from './terrain.js';
export const isRoad=roadAt;
export class World {
  constructor(scene) {
    this.scene = scene;
    this.chunks = [];
    this.colliders = [];
    this.resources = [];
    this.npcs = [];
    this.wild = [];
    this.interactables = [];
    this.lamps = [];
    this.plotMeshes = new Map();
    this.buildMeshes = [];
    this.buildLampLights = [];
    this.buildLampPoolMaterial = null;
    this.buildLampPoolGeometry = null;
    this.rand = random(57291);
    this.lowQuality = false;
    this.build();
  }
  collider(x, z, r, kind = "circle", w = 0, d = 0) {
    const collider = { x, z, r, kind, w, d, disabled: false };
    this.colliders.push(collider);
    return collider;
  }
  ensureBuildLampAssets() {
    if (this.buildLampPoolMaterial && this.buildLampPoolGeometry) return;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,205,130,.58)");
    gradient.addColorStop(0.42, "rgba(244,164,77,.24)");
    gradient.addColorStop(1, "rgba(230,125,43,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new T.CanvasTexture(canvas);
    texture.colorSpace = T.SRGBColorSpace;
    texture.minFilter = T.LinearFilter;
    texture.magFilter = T.LinearFilter;
    this.buildLampPoolMaterial = new T.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      blending: T.AdditiveBlending,
      opacity: 0,
      toneMapped: false,
    });
    this.buildLampPoolGeometry = new T.PlaneGeometry(5.8, 5.8);
    this.buildLampPoolGeometry.rotateX(-Math.PI / 2);
  }
  collides(x, z, r = PLAYER_RADIUS) {
    if (Math.abs(x)>WORLD_LIMIT-2 || Math.abs(z)>WORLD_LIMIT-2) return true;
    if(staticCollision(x,z,r))return true;
    if(terrainBlocked(x,z))return true;
    for (const c of this.colliders) {
      if(hitsCollider(c,x,z,r))return true;
    }
    return false;
  }
  build() { buildModernWorld(this); }
  populate() { populateModernPeople(this);populateModernWild(this); }
  createParticles() {
    const r = this.rand,
      count = 180,
      g = new T.BufferGeometry(),
      p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (r() - 0.5) * 110;
      p[i * 3 + 1] = 1 + r() * 9;
      p[i * 3 + 2] = (r() - 0.5) * 110;
    }
    g.setAttribute("position", new T.BufferAttribute(p, 3));
    this.motes = new T.Points(
      g,
      new T.PointsMaterial({
        color: "#f9e8b3",
        size: 0.075,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
      }),
    );
    this.scene.add(this.motes);
    const rainGeo = new T.BufferGeometry(),
      rp = new Float32Array(1200 * 3);
    for (let i = 0; i < 1200; i++) {
      rp[i * 3] = (r() - 0.5) * 60;
      rp[i * 3 + 1] = r() * 25;
      rp[i * 3 + 2] = (r() - 0.5) * 60;
    }
    rainGeo.setAttribute("position", new T.BufferAttribute(rp, 3));
    this.rain = new T.Points(
      rainGeo,
      new T.PointsMaterial({
        color: "#d8e7dd",
        size: 0.06,
        transparent: true,
        opacity: 0.7,
      }),
    );
    this.scene.add(this.rain);
    this.effects = [];
  }
  setQuality(q) {
    const low = q === "low";
    this.lowQuality = low;
    this.ground?.material?.userData.setDetail?.(q);
    if (this.water?.material?.uniforms?.lowQuality)
      this.water.material.uniforms.lowQuality.value = low ? 1 : 0;
    if (this.ground?.material) {
      this.ground.material.userData.lowQuality = low;
      if (this.ground.material.userData.ambLowUniform)
        this.ground.material.userData.ambLowUniform.value = low ? 1 : 0;
    }
    if (this.motes) this.motes.visible = !low;
    if (this.rain?.geometry) this.rain.geometry.setDrawRange(0, low ? 420 : 1200);
  }
  burst(x, y, z, color = "#efd28b", count = 14) {
    if (this.lowQuality) count = Math.min(count, 8);
    const r = this.rand,
      geo = new T.BufferGeometry(),
      p = new Float32Array(count * 3),
      v = [];
    for (let i = 0; i < count; i++) {
      p.set([x, y, z], i * 3);
      v.push([(r() - 0.5) * 3, 1 + r() * 3, (r() - 0.5) * 3]);
    }
    geo.setAttribute("position", new T.BufferAttribute(p, 3));
    const m = new T.Points(
      geo,
      new T.PointsMaterial({ color, size: 0.14, transparent: true }),
    );
    this.scene.add(m);
    this.effects.push({ m, v, life: 1 });
  }
  update(dt, t, state, px, pz) {
    this.lastPlayerX=px;this.lastPlayerZ=pz;
    this.streamer?.update(dt,px,pz,state);
    this.water.material.uniforms.time.value = t;
    this.fountain?.update(t);
    this.rain.visible = state.weather === "pluie";
    if (this.rain.visible) {
      this.rain.position.set(px, 0, pz);
      const a = this.rain.geometry.attributes.position;
      const rainCount = this.lowQuality ? Math.min(a.count, 420) : a.count;
      for (let i = 0; i < rainCount; i++) {
        a.setY(i, (a.getY(i) - dt * 16 + 25) % 25);
        a.setX(i, ((a.getX(i) - dt * 2 + 30) % 60) - 30);
      }
      a.needsUpdate = true;
    }
    this.motes.position.x = Math.sin(t * 0.1) * 1.2;
    this.motes.position.y = Math.sin(t * 0.4) * 0.2;
    this.motes.material.opacity =
      state.time > 18 || state.time < 6 ? 0.8 : 0.35;
    for (const n of this.npcs) {
      const npcDistance = Math.hypot(px - n.x, pz - n.z);
      const npcVisible = npcDistance < (this.lowQuality ? 45 : 80);
      n.mesh.visible = npcVisible;
      if (!npcVisible) continue;
      const motion = stepNpc(n, dt, { x: px, z: pz }, this.collides.bind(this));
      n.mesh.position.set(n.x, height(n.x, n.z), n.z);
      if (motion.facing !== undefined) n.mesh.rotation.y = motion.facing;
      n.animationElapsed=(n.animationElapsed||0)+dt;
      if(npcDistance<28 || n.animationElapsed>=1/15){
        n.mesh.userData.animate(t,motion.moving,false,n.animationElapsed);
        n.animationElapsed=0;
      }
    }
    this.spawnElapsed=(this.spawnElapsed||0)+dt;
    let canRespawn=this.spawnElapsed>=.25;
    if(canRespawn)this.spawnElapsed=0;
    for (const w of this.wild) {
      const wasCooling=w.cooldown>0;
      w.cooldown = Math.max(0, w.cooldown - dt);
      if(wasCooling && w.cooldown===0 && w.id!=='gardien')w.respawnPending=true;
      if(canRespawn && t>=(w.nextSpawnAttempt||0) && w.id!=='gardien' && ((wasCooling && w.cooldown===0)||w.respawnPending|| Math.hypot(px-w.homeX,pz-w.homeZ)>95 || (w.spawnDay!==undefined&&w.spawnDay!==state.day))){
       if(Math.hypot(px-w.x,pz-w.z)>20){canRespawn=false;w.nextSpawnAttempt=t+2;const e=chooseEncounter(Math.random,(x,z,r)=>this.collides(x,z,r)||Math.hypot(px-x,pz-z)<20,this.wild.filter(v=>v!==w),null,{x:px,z:pz});if(e){w.mesh.removeFromParent();w.mesh.userData.dispose?.();Object.assign(w,e);w.mesh=modelCreature(species(e.id),1);this.scene.add(w.mesh);w.mesh.position.set(w.x,height(w.x,w.z),w.z);w.spawnDay=state.day;w.respawnPending=false;}}
       else if(wasCooling)w.respawnPending=true;
      }
      w.spawnDay??=state.day;
      const nocturnal = w.id === "lumignon",
        rainOnly = w.id === "coralys";
      const wildDistance = Math.hypot(px - w.homeX, pz - w.homeZ);
      w.mesh.visible =
        w.cooldown === 0 && !w.respawnPending &&
        (wildDistance < (this.lowQuality ? 48 : 85)) &&
        (!nocturnal || state.time >= 17 || state.time < 6) &&
        (!rainOnly || state.weather === "pluie") &&
        !(w.id === "gardien" && state.flags.guardian);
      if (!w.mesh.visible) continue;
      const dist = Math.hypot(px - w.homeX, pz - w.homeZ),
        timid = species(w.id).temper === "timide",
        move = w.id !== "gardien";
      const flee = timid && dist < 4 ? 2 : 0;
      w.x =
        w.homeX +
        (move ? Math.sin(t * 0.28 + w.phase) * 1.5 : 0) +
        (dist > 0 ? ((w.homeX - px) / dist) * flee : 0);
      w.z = w.homeZ + (move ? Math.cos(t * 0.22 + w.phase) : 0);
      if(w.id!=='gardien' && (!wildZone(w.x,w.z)||this.collides(w.x,w.z,.65))){w.x=w.homeX;w.z=w.homeZ;}
      w.mesh.position.set(w.x, height(w.x, w.z), w.z);
      w.mesh.rotation.y =
        dist < 5
          ? Math.atan2(px - w.x, pz - w.z)
          : Math.cos(t * 0.28 + w.phase) * 1.7;
      w.mesh.userData.animate(t + w.phase, move);
    }
    for (const e of [...this.effects]) {
      e.life -= dt;
      const a = e.m.geometry.attributes.position;
      e.v.forEach((v, i) => {
        v[1] -= dt * 5;
        a.setXYZ(
          i,
          a.getX(i) + v[0] * dt,
          a.getY(i) + v[1] * dt,
          a.getZ(i) + v[2] * dt,
        );
      });
      a.needsUpdate = true;
      e.m.material.opacity = Math.max(0, e.life);
      if (e.life <= 0) {
        this.scene.remove(e.m);
        e.m.geometry.dispose();
        e.m.material.dispose();
        this.effects.splice(this.effects.indexOf(e), 1);
      }
    }
    this.buildLampLights = this.buildLampLights.filter((entry) => entry.group.parent);
    const daylightRaw = Math.max(
      0,
      Math.sin(((state.time - 6) / 15) * Math.PI),
    );
    const daylight = T.MathUtils.smoothstep(daylightRaw, 0.02, 0.42);
    const lampStrength = T.MathUtils.smoothstep(1 - daylight, 0.18, 0.82);
    if (this.buildLampPoolMaterial)
      this.buildLampPoolMaterial.opacity = lampStrength * 0.72;
    for (const entry of this.buildLampLights)
      entry.light.intensity = this.lowQuality ? 0 : lampStrength * 1.75;

    const radius =
      state.settings.quality === "low"
        ? 48
        : state.settings.quality === "medium"
          ? 70
          : 95;
    // Active sectors are already bounded by WorldStreamer with unload hysteresis.
  }
  sync(state) {
    const buildKey=JSON.stringify(state.buildings.map(({type,x,z,r,y})=>({type,x,z,r,y})));
    if(buildKey!==this.buildKey){
      this.buildKey=buildKey;
      for(const g of this.buildMeshes){disposeFurniture(g);g.traverse(o=>{if(o.isInstancedMesh)o.dispose();});g.removeFromParent();}
      this.buildMeshes=[];this.buildLampLights=[];
    }
    for (const r of this.resources) {
      const visible = !(state.depleted[r.id] > state.day);
      r.mesh.visible = visible;
      if (r.collider) r.collider.disabled = !visible;
    }
    for(const p of state.plots){
      const key=`${p.seed}-${p.stage}`;const old=this.plotMeshes.get(p.id);if(old?.key===key){old.g.userData.setMoisture(p.water);continue;}
      if(old){old.g.userData.dispose?.();old.g.removeFromParent();}
      const g=cropVisual(p);g.position.set(p.x,height(p.x,p.z)+.02,p.z);this.scene.add(g);this.plotMeshes.set(p.id,{key,g});
    }
    this.buildLampLights = this.buildLampLights.filter((entry) => entry.group.parent);
    while (this.buildMeshes.length < state.buildings.length) {
      const b = state.buildings[this.buildMeshes.length],
        g = new T.Group(),
        f = new Factory(g, true);
      furnishing(f, b.type, 0, 0, 0, b.r);
      f.flush();upgradeFurniture(g,b);
      g.position.set(b.x, height(b.x, b.z), b.z);

      if (b.type === "lamp") {
        this.ensureBuildLampAssets();
        const pool = new T.Mesh(this.buildLampPoolGeometry, this.buildLampPoolMaterial);
        pool.position.set(0, 0.065, 0);
        pool.renderOrder = 1;
        pool.castShadow = false;
        pool.receiveShadow = false;
        g.add(pool);

        const pointLight = new T.PointLight("#ffd58f", 0, 8.5, 2);
        pointLight.position.set(0, 2.83, 0);
        pointLight.castShadow = false;
        // Warm pooled ground glow is enough; avoid accumulating point lights.
        this.buildLampLights.push({ group: g, light: pointLight });
      }

      this.scene.add(g);
      g.userData.building=b;
      this.buildMeshes.push(g);
    }
  }
}
