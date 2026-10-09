import {cinematicAttack,CAST_TIMING,attackProfile} from './combat-fx.js';
import {battleEnvironment} from './battle-environment.js';
import { T, Factory, tree, flower, random, furnishing } from "./art.js";
import { modelCreature } from "./monster-models.js";
import { species } from "../systems/data.js";

const BLEND = T.AdditiveBlending;

function ease(t) {
  return t * t * (3 - 2 * t);
}

function disposeObject(root) {
  root.traverse((o) => {
    if (o.isInstancedMesh) o.dispose();
    if (o.geometry?.dispose && !o.geometry.userData.sharedAsset) o.geometry.dispose();
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      if (!m || m.userData.sharedAsset) continue;
      for (const k of ["map", "normalMap", "roughnessMap", "metalnessMap", "alphaMap", "emissiveMap"]) {
        if (!m[k]?.userData.sharedAsset) m[k]?.dispose?.();
      }
      m.dispose?.();
    }
  });
}

function makePoints(count, size, color) {
  const geometry = new T.BufferGeometry();
  const positions = new Float32Array(count * 3);
  geometry.setAttribute("position", new T.BufferAttribute(positions, 3));
  const material = new T.PointsMaterial({
    size,
    color,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    blending: BLEND,
  });
  return {
    object: new T.Points(geometry, material),
    geometry,
    positions,
  };
}

function cloneVec(v) {
  return new T.Vector3(v.x, v.y, v.z);
}

export class BattleStage {
  constructor(ally, enemy) {
    this.scene = new T.Scene();
    this.scene.background = new T.Color("#adcadd");
    this.scene.fog = new T.Fog("#adcadd", 18, 65);

    this.scene.add(new T.HemisphereLight("#fff4db", "#849377", 2.4));

    const sun = new T.DirectionalLight("#ffe4b1", 2.2);
    sun.position.set(-10, 20, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, {
      left: -18,
      right: 18,
      top: 18,
      bottom: -18,
      near: 1,
      far: 70,
    });
    sun.shadow.normalBias = 0.04;
    this.scene.add(sun);
    this.sun = sun;

    const fill = new T.DirectionalLight("#cbe7ff", 0.7);
    fill.position.set(12, 8, -8);
    this.scene.add(fill);

    battleEnvironment(this);

    this.ally = modelCreature(species(ally.id), 1.65);
    this.enemy = modelCreature(species(enemy.id), 1.65);
    this.scene.add(this.ally, this.enemy);

    this.ally.rotation.y = 2;
    this.enemy.rotation.y = -1.14;

    this.allyBase = new T.Vector3(-3.2, 0, 2.1);
    this.enemyBase = new T.Vector3(3.1, 0, -1.1);

    this.ring = new T.Mesh(
      new T.TorusGeometry(1.4, 0.035, 5, 64),
      new T.MeshBasicMaterial({
        color: "#ffdd8f",
        transparent: true,
        opacity: 0,
      }),
    );
    this.ring.rotation.x = Math.PI / 2;
    this.ring.position.set(3, 1, -1);
    this.scene.add(this.ring);

    this.particles = [];
    this.particlePool = [];
    this.pendingImpact = null;
    this.effects = [];
    this.action = null;
    this.capture = 0;

    this.ambientGlow = this.createAmbientGlow();
    this.scene.add(this.ambientGlow.object);
  }

  createAmbientGlow() {
    const pts = makePoints(140, 0.12, "#fff2c9");
    const seeds = [];
    for (let i = 0; i < 140; i++) {
      const a = Math.random() * Math.PI * 2;
      const radius = 6 + Math.random() * 20;
      seeds.push({
        x: Math.cos(a) * radius,
        y: 0.8 + Math.random() * 3.2,
        z: Math.sin(a) * radius,
        s: Math.random() * Math.PI * 2,
      });
    }
    return { ...pts, seeds };
  }

  actorForSide(allySide) {
    return allySide ? this.ally : this.enemy;
  }

  impact(allyAttacking, color, moveId = "elan", opts = {}) {
    const attacker = this.actorForSide(allyAttacking);
    const defender = this.actorForSide(!allyAttacking);

    attacker.userData.playAttack?.();

    this.action = {
      allyAttacking,
      color,
      moveId,
      elapsed: 0,
      duration: CAST_TIMING.duration,
      hitTriggered: false,
      ko: !!opts.ko,
      miss: !!opts.miss,
    };

    const from = (allyAttacking ? this.allyBase : this.enemyBase).clone().add(new T.Vector3(0, 1.12, 0));
    const to = (allyAttacking ? this.enemyBase : this.allyBase).clone().add(new T.Vector3(0, 1.02, 0));
    if (opts.miss) {
      to.x += allyAttacking ? 0.7 : -0.7;
      to.y += 0.35;
      to.z += allyAttacking ? -0.4 : 0.4;
    }

    this.spawnMoveEffect(moveId, from, to, color, allyAttacking, opts);

  }

  support(allySide, moveId = "garde", color = "#f4d688") {
    const actor = this.actorForSide(allySide);
    actor.userData.playAttack?.();
    const center = (allySide ? this.allyBase : this.enemyBase).clone().add(new T.Vector3(0, 1.02, 0));
    cinematicAttack(this,moveId,center,center,{support:true});
  }

  addEffect(root, maxLife, updater) {
    this.scene.add(root);
    this.effects.push({ root, life: maxLife, maxLife, updater });
  }

  spawnMoveEffect(id,from,to,color,side,opts={}){cinematicAttack(this,id,from,to,opts);}
  update(dt, t) {
    this.ally.position.copy(this.allyBase);
    this.enemy.position.copy(this.enemyBase);

    const allyMoving = !!(this.action && this.action.allyAttacking && this.action.moveId === "elan");
    const enemyMoving = !!(this.action && !this.action.allyAttacking && this.action.moveId === "elan");

    this.ally.userData.animate?.(t, allyMoving);
    this.enemy.userData.animate?.(t + 0.7, enemyMoving);

    // Petites lueurs d'ambiance pour éviter une arène vide.
    const amb = this.ambientGlow.object.geometry.attributes.position;
    this.ambientGlow.seeds.forEach((s, i) => {
      amb.setXYZ(
        i,
        s.x + Math.sin(t * 0.7 + s.s) * 0.25,
        s.y + Math.sin(t * 1.3 + s.s) * 0.18,
        s.z + Math.cos(t * 0.9 + s.s) * 0.25,
      );
    });
    amb.needsUpdate = true;
    this.ambientGlow.object.material.opacity = 0.42 + Math.sin(t * 1.5) * 0.06;

    if (this.action) {
      const a = this.action;
      a.elapsed += dt;
      const p = Math.min(1, a.elapsed / a.duration);
      const attacker = a.allyAttacking ? this.ally : this.enemy;
      const defender = a.allyAttacking ? this.enemy : this.ally;
      const attackerBase = a.allyAttacking ? this.allyBase : this.enemyBase;
      const defenderBase = a.allyAttacking ? this.enemyBase : this.allyBase;
      const dir = defenderBase.clone().sub(attackerBase).normalize();

      const dash=attackProfile(a.moveId).pattern==='dash',charge=Math.min(1,a.elapsed/.36),release=Math.max(0,Math.min(1,(a.elapsed-.36)/.56)),recover=Math.max(0,Math.min(1,(a.elapsed-.92)/.88));
      const push=a.elapsed<.36?-.3*Math.sin(charge*Math.PI/2):(dash?4.2:.75)*Math.sin(release*Math.PI/2)*(1-ease(recover));
      attacker.position.addScaledVector(dir,push);
      attacker.position.y+=Math.sin(release*Math.PI)*(dash?.6:.17)*(1-recover);
      attacker.rotation.z=(a.allyAttacking?-1:1)*Math.sin(charge*Math.PI)*.12*(1-release);
      if (a.elapsed >= CAST_TIMING.impact && !a.hitTriggered) {
        a.hitTriggered = true;
        if (!a.miss) {
          if (a.ko) defender.userData.playDeath?.();
          else defender.userData.playHit?.();
        }
      }

      if (!a.miss && a.elapsed > CAST_TIMING.impact) {
        const q = Math.min(1, (a.elapsed - CAST_TIMING.impact) / .88);
        const recoil = Math.sin(q * Math.PI) * (a.moveId === "elan" ? 0.48 : 0.34);
        defender.position.addScaledVector(dir, recoil);
        defender.rotation.z = Math.sin(q * Math.PI * 3) * 0.05;
      }

      if (p >= 1) {
        defender.rotation.z = 0;
        this.action = null;
      }
    } else {
      this.ally.rotation.z = 0;
      this.enemy.rotation.z = 0;
    }

    if (this.capture > 0) {
      this.capture -= dt;
      this.ring.material.opacity = Math.min(1, this.capture);
      this.ring.position.y = 0.7 + Math.sin(t * 9) * 0.5;
      this.ring.rotation.z = t * 3;
      const s = 1 + Math.sin(t * 8) * 0.2;
      this.ring.scale.setScalar(s);
    } else {
      this.ring.material.opacity = 0;
    }

    for (const p of [...this.particles]) {
      p.life -= dt;
      const a = p.m.geometry.attributes.position;
      p.vel.forEach((v, i) => {
        v[1] -= dt * p.gravity;
        a.setXYZ(
          i,
          a.getX(i) + v[0] * dt,
          a.getY(i) + v[1] * dt,
          a.getZ(i) + v[2] * dt,
        );
      });
      a.needsUpdate = true;
      p.m.material.opacity = Math.max(0, p.life / 0.8);
      if (p.life <= 0) {
        this.scene.remove(p.m);
        this.particlePool.push(p.m);
        this.particles.splice(this.particles.indexOf(p), 1);
      }
    }

    for (const e of [...this.effects]) {
      e.life -= dt;
      const progress = 1 - Math.max(0, e.life / e.maxLife);
      e.updater?.(e, dt, progress, t);
      if (e.life <= 0) {
        this.scene.remove(e.root);
        disposeObject(e.root);
        this.effects.splice(this.effects.indexOf(e), 1);
      }
    }
  }

  dispose() {
    this.decor.userData.dispose?.();this.meadow.geometry.dispose();this.meadow.material.dispose();
    this.ring.geometry.dispose();
    this.ring.material.dispose();
    this.sun.shadow.map?.dispose();

    this.decor.traverse((o) => {
      if (o.isInstancedMesh) o.dispose();
    });

    for (const actor of [this.ally,this.enemy]) actor.userData.dispose?.();

    for(const m of this.particlePool){m.geometry.dispose();m.material.dispose();}
    this.particlePool=[];
    for (const p of this.particles) {
      p.m.geometry.dispose();
      p.m.material.dispose();
    }

    for (const e of this.effects) disposeObject(e.root);

    this.ambientGlow.object.geometry.dispose();
    this.ambientGlow.object.material.dispose();
  }
}
