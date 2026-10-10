import {PLAN,inCity} from './plan.js';
export const riverX=z=>19+Math.sin(z*.008)*3;
export function baseTerrainHeight(x,z){
 let h=.4;
 if(!inCity(x,z)&&x>40){const t=Math.min(1,(x-40)/90);h+=t*(2.2+Math.sin(x*.015)*Math.cos(z*.013)*2.1+Math.sin(x*.031+z*.007)*.6);const mountains=Math.max(0,Math.min(1,(x-300)/220))*Math.max(0,Math.min(1,(-z-280)/220));h+=mountains*(60+Math.sin(x*.011)*Math.cos(z*.009)*30);}
 if(x<0&&z>250)h+=(Math.sin(x*.006)*Math.cos(z*.007)+1)*Math.min(8,(z-250)*.018);
 const l=Math.hypot((x-410)/1.25,z-280);if(l<80)return -1.4;if(l<94)h=-.4+(h+.4)*(l-80)/14;
 const d=Math.abs(x-riverX(z));if(d<4.7)return -1.2;if(d<8)h=-.4+(h+.4)*Math.min(1,(d-4.7)/3.3);
 return h;
}
export const onBridge=(x,z)=>x>=10&&x<=29&&(Math.abs(z-8)<2.4||Math.abs(z+30)<2.4);
export function bridgeHeight(x,z){const c=Math.abs(z-8)<Math.abs(z+30)?8:-30,t=Math.max(0,Math.min(1,(x-10)/19));return baseTerrainHeight(10,c)*(1-t)+baseTerrainHeight(29,c)*t+Math.sin(t*Math.PI)*.6;}
export function terrainHeight(x,z){let h=baseTerrainHeight(x,z);const d=Math.hypot(x-PLAN.arena.x,z-PLAN.arena.z);if(d<15)h=baseTerrainHeight(PLAN.arena.x,PLAN.arena.z);for(const [lx,lz,r] of [[465,-374,24],[260,-200,22]]){const d=Math.hypot(x-lx,z-lz),t=Math.max(0,Math.min(1,(r+12-d)/12));h=h*(1-t)+baseTerrainHeight(lx,lz)*t;}return onBridge(x,z)?Math.min(h,bridgeHeight(x,z)-.2):h;}
export const height=(x,z)=>onBridge(x,z)?bridgeHeight(x,z):terrainHeight(x,z);
export const clearLandmark=(x,z)=>Math.hypot(x-PLAN.arena.x,z-PLAN.arena.z)<17||Math.hypot(x-PLAN.plaza.x,z-PLAN.plaza.z)<16||Math.hypot(x-465,z+374)<36||Math.hypot(x-260,z+200)<34||onBridge(x,z);
