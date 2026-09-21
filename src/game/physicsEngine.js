import { Vec2,World } from 'planck'
import { BIKE,CONTROL,RUN,TERRAIN,WORLD } from './constants'
import { createBike,syncBike } from './createBike'
import { advanceWorld,createTerrain,terrainYAt } from './createTerrain'
import { spawnChunkPickups } from './pickups'
import { updateDanger } from './collisionUtils'
const u=v=>v/WORLD.scale

function baseSeed(theme){return TERRAIN.seed+(theme==='canyon'?17:theme==='volcano'?31:0)}
function createRun(level){
  return {state:'running',reason:null,fuel:RUN.fuelStart,coins:0,score:0,distance:0,air:0,airBonus:0,grounded:true,time:0,danger:0,fuelConsumption:level.fuelConsumption||1,pickups:[],feedbacks:[],particles:[],particleTimer:0}
}
export function createPhysics(level,seedInput){
  const theme=level.theme||'forest'
  const seed=(seedInput!=null?seedInput:baseSeed(theme))>>>0
  const world=new World({gravity:Vec2(0,WORLD.gravity)})
  const terrain=createTerrain(world,theme,seed)
  const run=createRun(level)
  for(const ci of advanceWorld(world,terrain,BIKE.startX))spawnChunkPickups(run,terrain,ci)
  const spawnY=terrainYAt(terrain.points,BIKE.startX)-BIKE.wheelRadius-52
  const bike=createBike(world,spawnY)
  return {world,engine:world,terrain,bike,level,run,seed}
}
export function destroyPhysics(s){s.world=null}
export function restartPhysics(s){
  s.seed=(s.seed+1013904223)>>>0
  const fresh=createPhysics(s.level,s.seed)
  s.world=fresh.world;s.engine=fresh.engine;s.terrain=fresh.terrain;s.bike=fresh.bike;s.run=fresh.run
}

function applyBikeControls(s,k){
  const b=s.bike,pts=s.terrain.points
  const rearGround=terrainYAt(pts,b.rear.position.x)-b.rear.position.y-b.rear.circleRadius<8
  const frontGround=terrainYAt(pts,b.front.position.x)-b.front.position.y-b.front.circleRadius<8
  const grounded=rearGround||frontGround
  const speed=Math.abs(b.chassis.velocity.x)
  let target=null,torque=0
  if(k.brake){
    if(b.chassis.velocity.x>CONTROL.reverseThreshold){target=0;torque=CONTROL.brakeTorque}
    else if(b.chassis.velocity.x<=CONTROL.reverseThreshold){target=-CONTROL.reverseSpeed;torque=CONTROL.revTorque}
  }else if(k.accelerate){
    target=CONTROL.motorSpeed
    const f=Math.min(1,(speed/CONTROL.maxSpeed)*(speed/CONTROL.maxSpeed))
    torque=CONTROL.motorTorque*(1-CONTROL.torqueFalloff*f)
  }
  b.rearJoint.enableMotor(target!==null)
  b.rearJoint.setMaxMotorTorque(torque)
  if(target!==null)b.rearJoint.setMotorSpeed(target)
  const tilt=(k.tiltForward?1:0)-(k.tiltBack?1:0)
  if(tilt){
    const rate=grounded?(rearGround&&frontGround?CONTROL.groundWheelRate:rearGround?CONTROL.rearWheelRate:CONTROL.frontWheelRate):CONTROL.airWheelRate
    const err=tilt*rate-b.chassis.angularVelocity
    const impulse=Math.max(-2.8,Math.min(2.8,err*CONTROL.leanGain))
    b.chassis.body.applyAngularImpulse(impulse,true)
  }else{
    b.chassis.body.applyAngularImpulse(Math.max(-2.8,Math.min(2.8,-b.chassis.angularVelocity*CONTROL.stabilizeGain)),true)
  }
  if(k.tiltBack&&rearGround&&k.accelerate&&speed>CONTROL.wheelieMinSpeed){
    b.chassis.body.applyLinearImpulse(Vec2(0,-CONTROL.wheelieImpulse),b.chassis.body.getWorldPoint(Vec2(u(52),0)),true)
  }
  const spin=b.chassis.body.getAngularVelocity()
  if(Math.abs(spin)>CONTROL.maxChassisSpin)b.chassis.body.setAngularVelocity(Math.sign(spin)*CONTROL.maxChassisSpin)
  s.run.grounded=grounded
}

function emitFeedback(run,x,y,text,color){run.feedbacks.push({x,y,text,color,age:0})}
function collectPickup(run,p){
  if(p.type==='fuel'){run.fuel=Math.min(100,run.fuel+RUN.fuelGain);emitFeedback(run,p.x,p.y-42,`+${RUN.fuelGain}`,'#a3e635')}
  else{run.coins+=1;emitFeedback(run,p.x,p.y-36,'+100','#facc15')}
  p.collected=true
}
function checkPickups(run,b){
  const probes=[b.chassis.position,b.rear.position,b.front.position]
  for(const p of run.pickups){
    if(p.collected)continue
    const maxD=p.type==='fuel'?RUN.fuelRange:RUN.coinRange
    for(const probe of probes){
      const dx=p.x-probe.x,dy=p.y-probe.y
      if(dx*dx+dy*dy<=maxD*maxD){collectPickup(run,p);break}
    }
  }
}
function updateParticles(run,d,grounded,accelerating,rear){
  if(accelerating&&grounded){
    run.particleTimer-=d
    if(run.particleTimer<=0&&run.particles.length<40){
      run.particleTimer=70
      run.particles.push({x:rear.position.x-40,y:rear.position.y+12,vx:-50+Math.random()*40,vy:-15-Math.random()*30,t:0,life:.5,r:4+Math.random()*4})
    }
  }
  for(let i=run.particles.length-1;i>=0;i--){
    const p=run.particles[i]
    p.t+=d/1000;p.x+=p.vx*(d/1000);p.y+=p.vy*(d/1000);p.vy+=30*(d/1000)
    if(p.t>=p.life)run.particles.splice(i,1)
  }
}
function updateFeedbacks(run,d){
  for(let i=run.feedbacks.length-1;i>=0;i--){const f=run.feedbacks[i];f.age+=d;if(f.age>950)run.feedbacks.splice(i,1)}
}
export function advanceRun(s,k,d){
  const run=s.run,b=s.bike
  if(run.state!=='running')return
  const sec=d/1000;run.time+=d
  checkPickups(run,b)
  if(!run.grounded)run.air+=sec
  else{
    if(run.air>0.4){
      const bonus=Math.min(RUN.airBonusCap,Math.round(run.air*RUN.airBonusRate))
      if(bonus>0){run.airBonus+=bonus;emitFeedback(run,b.chassis.position.x,b.chassis.position.y-74,`+${bonus}`,'#a3e635')}
    }
    run.air=0
  }
  const burn=(RUN.fuelBase+(k.accelerate?RUN.fuelAccel:0)+(k.brake?RUN.fuelBrake:0))*run.fuelConsumption
  run.fuel=Math.max(0,run.fuel-burn*sec)
  run.distance=Math.max(run.distance,Math.max(0,(b.chassis.position.x-BIKE.startX)/10))
  run.score=Math.floor(run.distance)+run.coins*RUN.coinValue+run.airBonus
  run.danger=updateDanger(s,sec,run.danger)
  if(run.fuel<=0){run.state='gameOver';run.reason='fuel'}
  else if(run.danger>RUN.wreckDanger){run.state='gameOver';run.reason='crash'}
  const keepX=b.chassis.position.x-2400
  if(run.pickups.length>32&&run.pickups[0].x<keepX)run.pickups=run.pickups.filter(p=>p.collected||p.x>keepX)
  updateParticles(run,d,run.grounded,k.accelerate,b.rear)
  updateFeedbacks(run,d)
}
export function stepPhysics(s,k,d){
  syncBike(s.bike)
  applyBikeControls(s,k)
  s.world.step(Math.min(d,33.34)/1000,8,3)
  syncBike(s.bike)
  for(const ci of advanceWorld(s.world,s.terrain,s.bike.chassis.position.x))spawnChunkPickups(s.run,s.terrain,ci)
  advanceRun(s,k,d)
}
export function getTelemetry(s){const b=s.bike,run=s.run;return {distance:Math.round(run.distance),speed:Math.max(0,Math.round(Math.abs(b.chassis.velocity.x)*.23)),fuel:Math.round(run.fuel),coins:run.coins,score:Math.round(run.score)}}