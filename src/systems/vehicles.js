// All probes cover the body, including its interior, so narrow obstacles cannot
// disappear between corner checks. Movement and rotation use the same envelope.
export function vehicleBlocked(car, blocked) {
  if(!Number.isFinite(car.x)||!Number.isFinite(car.z)||Math.abs(car.x)>1019||Math.abs(car.z)>1019)return true;
  const c=Math.cos(car.r||0),s=Math.sin(car.r||0);
  for(let i=0;i<=4;i++)for(let j=0;j<=9;j++){
    const x=-.75+i*.375,z=-1.7+j*3.4/9;
    if(blocked(car.x+x*c+z*s,car.z-x*s+z*c,.2))return true;
  }
  return false;
}
export function driveVehicle(car,control,dt,blocked) {
  dt=Math.max(0,Math.min(dt,.1));
  const throttle=Math.max(-1,Math.min(1,control.throttle||0));
  let speed=car.speed||0;
  const braking=control.brake || (throttle && speed*throttle<0);
  if(braking||!throttle){const loss=(braking?18:3)*dt;speed=Math.sign(speed)*Math.max(0,Math.abs(speed)-loss);}
  else speed=Math.max(-4,Math.min(14,speed+throttle*7*dt));
  const steps=Math.max(1,Math.ceil(Math.abs(speed)*dt/.09));
  for(let i=0;i<steps;i++){
    const r=(car.r||0)-(control.steer||0)*speed/2.5*.48*dt/steps;
    const next={x:car.x+Math.sin(r)*speed*dt/steps,z:car.z+Math.cos(r)*speed*dt/steps,r};
    if(vehicleBlocked(next,blocked)){speed=0;break;}
    Object.assign(car,next);
  }
  car.speed=speed;
  return car;
}
export function vehicleExit(car,blocked){
  const c=Math.cos(car.r||0),s=Math.sin(car.r||0);
  for(const side of [-1,1])for(const dz of [0,-1,1,-2.5,2.5]){
    const x=car.x+side*1.5*c+dz*s,z=car.z-side*1.5*s+dz*c;
    if(!blocked(x,z,.32))return {x,z};
  }
  return null;
}
