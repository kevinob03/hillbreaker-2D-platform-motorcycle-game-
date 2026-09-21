import { Box,Circle,Vec2,WheelJoint } from 'planck'
import { BIKE,WORLD } from './constants'
const u=v=>v/WORLD.scale
const view=(body,r=0)=>({body,position:{x:0,y:0},velocity:{x:0,y:0},angle:0,angularVelocity:0,circleRadius:r})
export function syncBike(b){for(const p of [b.chassis,b.rear,b.front]){const x=p.body.getPosition(),v=p.body.getLinearVelocity();p.position.x=x.x*WORLD.scale;p.position.y=x.y*WORLD.scale;p.velocity.x=v.x*WORLD.scale;p.velocity.y=v.y*WORLD.scale;p.angle=p.body.getAngle();p.angularVelocity=p.body.getAngularVelocity()}}
export function createBike(world,spawnY=BIKE.startY){const x=u(BIKE.startX),y=u(spawnY),h=u(BIKE.wheelBase/2),wy=y+u(48),group=-1
const cb=world.createDynamicBody({position:Vec2(x,y),linearDamping:BIKE.chassisLinearDamping,angularDamping:BIKE.chassisAngularDamping,allowSleep:false});cb.createFixture(Box(u(BIKE.chassisWidth/2),u(BIKE.chassisHeight/2)),{density:BIKE.chassisDensity,friction:.45,filterGroupIndex:group})
const wheel=o=>{const b=world.createDynamicBody({position:Vec2(x+o,wy),linearDamping:BIKE.wheelLinearDamping,angularDamping:BIKE.wheelAngularDamping,allowSleep:false});b.createFixture(Circle(u(BIKE.wheelRadius)),{density:BIKE.wheelDensity,friction:BIKE.wheelFriction,restitution:BIKE.wheelRestitution,filterGroupIndex:group});return b}
const rb=wheel(-h),fb=wheel(h),opt={frequencyHz:BIKE.suspensionFrequency,dampingRatio:BIKE.suspensionDamping,enableMotor:false,maxMotorTorque:0,collideConnected:false}
const rearJoint=world.createJoint(new WheelJoint(opt,cb,rb,rb.getPosition(),Vec2(0,1))),frontJoint=world.createJoint(new WheelJoint(opt,cb,fb,fb.getPosition(),Vec2(0,1)))
const bike={chassis:view(cb),rear:view(rb,BIKE.wheelRadius),front:view(fb,BIKE.wheelRadius),rearJoint,frontJoint,spawnY};syncBike(bike);return bike}