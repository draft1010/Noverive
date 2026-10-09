// All gameplay coordinates belong to the new world, independently of its visuals.
export const PLAN = {
 spawn:{x:-24,z:36}, plaza:{x:-24,z:24}, home:{x:-96,z:157}, door:{x:-96,z:165},
 farm:{x:-96,z:190,left:-164,right:-74,top:140,bottom:220},
 plots:{x:-111,z:185}, workshop:{x:-115,z:177}, arena:{x:280,z:-140},
 lake:{x:410,z:280,rx:100,rz:80}, cave:{x:465,z:-350},
};
export const WORLD_SIZE=2048;
export const CITY_BLOCK=48;
export const CITY_BOUNDS={left:-768,right:0,top:-576,bottom:96};
export function cityBlock(x,z){return {x:Math.floor(x/48)*48,z:Math.floor(z/48)*48};}
export function inCity(x,z){const b=CITY_BOUNDS;return x>=b.left&&x<=b.right&&z>=b.top&&z<=b.bottom;}
