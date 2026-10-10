import {COLLISION_PROFILES} from './collision-profiles.js';
export const PLAYER_RADIUS=.28;
export function circleHitsRect(x,z,r,c){const dx=Math.max(0,Math.abs(x-c.x)-c.w/2),dz=Math.max(0,Math.abs(z-c.z)-c.d/2);return dx*dx+dz*dz<r*r || r===0&&Math.abs(x-c.x)<c.w/2&&Math.abs(z-c.z)<c.d/2;}
function nearSegment(x,z,r,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],n=dx*dx+dz*dz,t=n?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/n)):0;return (x-a[0]-t*dx)**2+(z-a[1]-t*dz)**2<r*r;}
export function circleHitsPolygon(x,z,r,poly){let inside=poly.length>2;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];if((b[0]-a[0])*(z-a[1])-(b[1]-a[1])*(x-a[0])<0)inside=false;if(nearSegment(x,z,r,a,b))return true;}return inside;}
export function modelCollider(p,bounds){const polygons=COLLISION_PROFILES[p.id];return {...bounds,kind:polygons?'mesh':'rect',polygons,scale:p.s??1,cos:Math.cos(p.r||0),sin:Math.sin(p.r||0),assetId:p.id};}
export function hitsCollider(c,x,z,r=PLAYER_RADIUS){if(c.disabled)return false;if(c.kind==='circle')return Math.hypot(x-c.x,z-c.z)<c.r+r;if(!circleHitsRect(x,z,r,c))return false;if(c.kind!=='mesh')return true;const dx=x-c.x,dz=z-c.z,lx=(dx*c.cos-dz*c.sin)/c.scale,lz=(dx*c.sin+dz*c.cos)/c.scale;return c.polygons.some(p=>circleHitsPolygon(lx,lz,r/c.scale,p));}
// Small swept steps prevent crossing narrow fences at low frame rates; axes slide at corners.
export function slideMove(x,z,dx,dz,blocked){const n=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.1)),sx=dx/n,sz=dz/n;for(let i=0;i<n;i++){if(!blocked(x+sx,z+sz)){x+=sx;z+=sz;continue;}if(!blocked(x+sx,z))x+=sx;if(!blocked(x,z+sz))z+=sz;}return {x,z};}
