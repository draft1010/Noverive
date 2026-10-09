export const GRAPHICS = Object.freeze({
 low: {label:'Éco · smartphone',ratio:.9,minRatio:.55,pixels:650000,radius:64,detail:38,terrain:8,shadow:0,particles:32,grass:.4},
 medium: {label:'Équilibré',ratio:1.15,minRatio:.75,pixels:1200000,radius:88,detail:62,terrain:12,shadow:1024,particles:48,grass:.65},
 high: {label:'Élevé',ratio:1.5,minRatio:1,pixels:2200000,radius:120,detail:84,terrain:16,shadow:2048,particles:72,grass:1},
 ultra: {label:'Cinéma · PC',ratio:2,minRatio:1,pixels:3800000,radius:152,detail:110,terrain:20,shadow:2048,particles:96,grass:1}
});
export const graphicsProfile=q=>GRAPHICS[q]||GRAPHICS.low;
export function renderRatio(q,width,height,dpr=1,scale=1){const p=graphicsProfile(q);return Math.max(.1,Math.min(dpr,p.ratio*scale,Math.sqrt(p.pixels/Math.max(1,width*height))));}
// Hysteresis avoids changing resolution for a single sector upload or a short combat effect.
export class AdaptiveResolution{
 constructor(){this.scale=1;this.slow=0;this.fast=0;}
 sample(fps,target=30){if(fps<target*.8){this.slow++;this.fast=0;}else if(fps>target*.94){this.fast++;this.slow=0;}else{this.slow=0;this.fast=0;}
 if(this.slow>=3){this.scale=Math.max(.62,this.scale-.08);this.slow=0;}
 if(this.fast>=8){this.scale=Math.min(1,this.scale+.04);this.fast=0;}return this.scale;}
}
export class FramePacer{
 constructor(){this.phase=0;this.elapsed=0;}
 reset(){this.phase=0;this.elapsed=0;}
 tick(delta,target){this.phase+=delta;this.elapsed+=delta;const interval=1/target;if(this.phase+1e-6<interval)return 0;this.phase=Math.max(0,this.phase-interval*Math.floor((this.phase+1e-6)/interval));const elapsed=this.elapsed;this.elapsed=0;return elapsed;}
}
