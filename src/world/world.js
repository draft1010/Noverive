import {upgradeFurniture,disposeFurniture} from '../rendering/modern-furniture.js';
import {modernCharacter} from '../rendering/modern-character.js';
import {buildModernWorld,populateModernWild} from './modern-world.js';
import {staticCollision} from './layout.js';
import {WORLD_LIMIT,roadAt} from './regions.js';
import {chooseEncounter,wildZone} from '../systems/encounters.js';
import {flowingFountain} from '../rendering/fountain.js';
import {
  T,
  Factory,
  random,
  house,
  tree,
  flower,
  lamp,
  furnishing,
} from "../rendering/art.js";
import { character } from "../rendering/character-assets.js";
import { modelCreature } from "../rendering/monster-models.js";
import { stepNpc } from "../systems/npc-motion.js";
import {
  groundMaterial,
  villageDetails,
  lamplightPools,
} from "../rendering/village.js";
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
  collides(x, z, r = 0.4) {
    if (Math.abs(x)>WORLD_LIMIT-2 || Math.abs(z)>WORLD_LIMIT-2) return true;
    if(staticCollision(x,z,r))return true;
    if(terrainHeight(x,z)<-.3 && !onBridge(x,z))return true;
    if (Math.abs(x - riverX(z)) < 5.1 && !onBridge(x, z)) return true;
    for (const c of this.colliders) {
      if (c.disabled) continue;
      if (c.kind === "rect") {
        if (Math.abs(x - c.x) < c.w / 2 + r && Math.abs(z - c.z) < c.d / 2 + r)
          return true;
      } else if (Math.hypot(x - c.x, z - c.z) < c.r + r) return true;
    }
    return false;
  }
  build() { buildModernWorld(this); }
  populate() {
    const npcData = [
      ["Maëlle", "La gardienne des jardins", -5, 4, "#9f8670", "maelle"],
      ["Soline", "Tisserande et marchande", -27, -14, "#b98769", "soline"],
      ["Ivo", "Botaniste des Sources", -14, -20, "#73948a", "ivo"],
      ["Noé", "Promeneur des terrasses", -12, 15, "#8b91a5", "noe"],
      ["Ysée", "La mémoire des ruines", 30, -29, "#b59c75", "ysee"],
      ["Tess", "Menuisière", -41, 8, "#8d9d7b", "tess"],
      ["Orin", "Marchand de semences", -38, -14, "#bcaa78", "orin"],
      ["Alba", "Voyageuse", -9, -40, "#ac8981", "alba"],
    ];
    npcData.forEach(([name, role, x, z, color, characterKind], i) => {
      const mesh = modernCharacter(i%3+1);
      mesh.position.set(x, height(x, z), z);
      mesh.rotation.y = i;
      this.scene.add(mesh);
      this.npcs.push({
        name,
        role,
        x,
        z,
        homeX: x,
        homeZ: z,
        mesh,
        phase: i * 1.7,
        route: [
          [
            { x: -5, z: 4 },
            { x: -5, z: 8 },
            { x: -15, z: 8 },
            { x: -15, z: 0 },
          ],
          [
            { x: -27, z: -14 },
            { x: -23, z: -19 },
            { x: -34, z: -19 },
          ],
          [
            { x: -14, z: -20 },
            { x: -9, z: -19 },
            { x: -9, z: -12 },
            { x: -16, z: -12 },
          ],
          [
            { x: -12, z: 15 },
            { x: -9, z: 20 },
            { x: -9, z: 8 },
            { x: -20, z: 8 },
          ],
          [
            { x: 30, z: -29 },
            { x: 35, z: -30 },
            { x: 35, z: -35 },
          ],
          [
            { x: -41, z: 8 },
            { x: -32, z: 8 },
            { x: -41, z: 12 },
          ],
          [
            { x: -38, z: -14 },
            { x: -40, z: -19 },
            { x: -32, z: -19 },
          ],
          [
            { x: -9, z: -40 },
            { x: -17, z: -39 },
            { x: -9, z: -48 },
          ],
        ][i],
      });
    });
    for(let i=0;i<16;i++){
      const x=-242+(i%4)*40,z=-147+Math.floor(i/4)*40,mesh=modernCharacter(i%3+1);
      mesh.position.set(x,height(x,z),z);this.scene.add(mesh);
      this.npcs.push({name:['Lina','Sam','Milo','Nora','Jules','Aya','Lou','Eden'][i%8]+(i>7?' · Horizons':''),role:i%4===0?'Commerçant des Horizons':'Habitant des Horizons',x,z,homeX:x,homeZ:z,mesh,phase:i,route:[{x,z},{x,z:z+20},{x:x+20,z:z+20},{x,z}]});
    }
    populateModernWild(this);
  }
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
    for (const w of this.wild) {
      const wasCooling=w.cooldown>0;
      w.cooldown = Math.max(0, w.cooldown - dt);
      if(w.id!=='gardien' && ((wasCooling && w.cooldown===0)||w.respawnPending|| Math.hypot(px-w.homeX,pz-w.homeZ)>95 || (w.spawnDay!==undefined&&w.spawnDay!==state.day))){
       if(Math.hypot(px-w.x,pz-w.z)>20){const e=chooseEncounter(Math.random,(x,z,r)=>this.collides(x,z,r)||Math.hypot(px-x,pz-z)<20,this.wild.filter(v=>v!==w),null,{x:px,z:pz});if(e){w.mesh.removeFromParent();w.mesh.userData.dispose?.();Object.assign(w,e);w.mesh=modelCreature(species(e.id),1);this.scene.add(w.mesh);w.mesh.position.set(w.x,height(w.x,w.z),w.z);w.spawnDay=state.day;w.respawnPending=false;}}
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
    for (const p of state.plots) {
      const key = `${p.seed}-${p.stage}-${p.water > 0.1}-${p.fertilized}`;
      const old = this.plotMeshes.get(p.id);
      if (old?.key === key) continue;

      if (old) {
        old.g.traverse((o) => {
          if (o.isInstancedMesh) o.dispose();
        });
        this.scene.remove(old.g);
      }

      const g = new T.Group();
      const f = new Factory(g, true);
      const wet = p.water > 0.1;
      const plotIndex = Number(String(p.id).replace(/\D/g, "")) || 0;
      const pr = random(8401 + plotIndex * 97 + p.stage * 13 + (wet ? 31 : 0));

      const soilDark = wet ? "#44372f" : "#654a35";
      const soilMid = wet ? "#554338" : "#79583d";
      const soilLight = wet ? "#665044" : "#8b6848";

      /* Une vraie parcelle de terre, basse et organique. */
      f.part("box", soilDark, 0, 0.035, 0, 1.88, 0.09, 1.82);

      /* Bordure en bois sombre, fine, pas de grandes planches beiges. */
      const rim = "#72563d";
      f.part("box", rim, 0, 0.105, -0.91, 1.92, 0.12, 0.10, 0, 0, 0, "wood");
      f.part("box", rim, 0, 0.105, 0.91, 1.92, 0.12, 0.10, 0, 0, 0, "wood");
      f.part("box", rim, -0.95, 0.105, 0, 0.10, 0.12, 1.72, 0, 0, 0, "wood");
      f.part("box", rim, 0.95, 0.105, 0, 0.10, 0.12, 1.72, 0, 0, 0, "wood");

      /* Quatre sillons bombés. */
      for (let i = 0; i < 4; i++) {
        const x = -0.57 + i * 0.38;
        f.part(
          "sphere",
          i % 2 ? soilMid : soilLight,
          x,
          0.10,
          0,
          0.15,
          0.055 + pr() * 0.015,
          0.76,
          0,
          0,
          (pr() - 0.5) * 0.05,
        );
      }

      /* Petites mottes : cassent l'aspect parfait. */
      for (let i = 0; i < 10; i++) {
        const x = (pr() - 0.5) * 1.55;
        const z = (pr() - 0.5) * 1.45;
        f.part(
          "sphere",
          pr() > 0.5 ? soilMid : soilDark,
          x,
          0.13 + pr() * 0.025,
          z,
          0.045 + pr() * 0.045,
          0.025 + pr() * 0.025,
          0.05 + pr() * 0.05,
          0,
          pr() * 6,
          0,
        );
      }

      if (p.fertilized) {
        for (let i = 0; i < 7; i++) {
          f.part(
            "sphere",
            i % 2 ? "#66724d" : "#88724c",
            (pr() - 0.5) * 1.45,
            0.16,
            (pr() - 0.5) * 1.35,
            0.035 + pr() * 0.035,
            0.025,
            0.035 + pr() * 0.035,
          );
        }
      }

      if (wet) {
        for (let i = 0; i < 4; i++) {
          f.part(
            "sphere",
            "#65756e",
            (pr() - 0.5) * 1.3,
            0.155,
            (pr() - 0.5) * 1.25,
            0.06 + pr() * 0.05,
            0.008,
            0.04 + pr() * 0.04,
          );
        }
      }

      /* Culture : davantage de plants, volumes plus naturels. */
      if(p.stage>0 && p.seed && p.seed!=='seed') {
        for(let i=0;i<6;i++){
          const x=-.5+(i%3)*.5,z=-.4+Math.floor(i/3)*.8,h=.15+p.stage*.17;
          f.part('cone','#789157',x,.14+h/2,z,.04,h,.04,0,i*.5,.08,'leaf');
          if(p.seed==='wheatSeed'){
            for(let j=0;j<3;j++)f.part('sphere',p.stage===4?'#dfc179':'#99a665',x+(j%2?-.045:.045),.12+h-j*.09,z,.055,.09,.04);
          }else if(p.seed==='carrotSeed'){
            f.part('cone','#88a35f',x,.2+h*.3,z,.15,h*.6,.12,Math.PI,0,.3,'leaf');
            if(p.stage>2)f.part('sphere','#d78e53',x,.17,z,.10,.08,.10);
          }else if(p.seed==='pumpkinSeed'){
            f.part('sphere','#88a35f',x,.2,z,.2,.035,.23,0,i,0,'leaf');
            if(p.stage>2)f.part('sphere','#d5a05d',x,.15+p.stage*.04,z,p.stage*.065,p.stage*.06,p.stage*.065);
          }else{
            for(let j=0;j<3;j++){const a=j*Math.PI*2/3;f.part('sphere',p.stage>2?'#a7a4cf':'#99a665',x+Math.sin(a)*.07,.14+h,z+Math.cos(a)*.07,.075,.025,.075);}
          }
        }
      }else if (p.stage > 0) {
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 2; col++) {
            const x = -0.38 + row * 0.38 + (pr() - 0.5) * 0.045;
            const z = -0.38 + col * 0.76 + (pr() - 0.5) * 0.05;
            const size = 0.16 + p.stage * 0.10;

            f.part(
              "cone",
              "#607f48",
              x,
              0.14 + size * 0.52,
              z,
              0.032,
              size,
              0.038,
              0,
              pr() * 6,
              (pr() - 0.5) * 0.22,
              "leaf",
            );

            for (const side of [-1, 1]) {
              f.part(
                "sphere",
                side > 0 ? "#88a35f" : "#769255",
                x + side * (0.07 + size * 0.15),
                0.15 + size * 0.55,
                z + (pr() - 0.5) * 0.05,
                0.10 + size * 0.24,
                0.04 + size * 0.08,
                0.16 + size * 0.20,
                0,
                side * 0.45,
                side * 0.22,
                "leaf",
              );
            }

            if (p.stage >= 3) {
              f.part(
                "sphere",
                p.stage === 4 ? "#c77970" : "#a7ba6d",
                x,
                0.18 + size * 1.12,
                z,
                0.11 + size * 0.20,
                0.13 + size * 0.18,
                0.11 + size * 0.18,
              );
            }

            if (p.stage === 4) {
              for (let petal = 0; petal < 4; petal++) {
                const a = petal * Math.PI / 2;
                f.part(
                  "sphere",
                  petal % 2 ? "#edd1ae" : "#e4b7aa",
                  x + Math.sin(a) * 0.075,
                  0.23 + size * 1.2,
                  z + Math.cos(a) * 0.075,
                  0.07,
                  0.035,
                  0.09,
                  0,
                  a,
                  0.1,
                );
              }
              f.part("sphere", "#d8bd70", x, 0.25 + size * 1.2, z, 0.045, 0.04, 0.045);
            }
          }
        }
      }

      f.flush();
      g.position.set(p.x, height(p.x, p.z) + 0.05, p.z);
      g.rotation.y = (pr() - 0.5) * 0.025;
      this.scene.add(g);
      this.plotMeshes.set(p.id, { key, g });
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

