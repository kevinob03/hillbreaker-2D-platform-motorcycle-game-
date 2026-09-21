import { DEBUG_PHYSICS,THEMES,WORLD } from './constants'
const wrap=(v,len)=>{const r=v%len;return r<0?r+len:r}

function mountainLayer(ctx,cameraX,color,baseY,height,parallax,step){
  const offset=-(cameraX*parallax)%step;ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,WORLD.height)
  for(let x=offset-step;x<=WORLD.width+step;x+=step){ctx.lineTo(x,baseY);ctx.lineTo(x+step*.45,baseY-height);ctx.lineTo(x+step,baseY)}
  ctx.lineTo(WORLD.width,WORLD.height);ctx.closePath();ctx.fill()
}
function drawSky(ctx,cameraX,theme){
  const gradient=ctx.createLinearGradient(0,0,0,WORLD.height);gradient.addColorStop(0,theme.skyTop);gradient.addColorStop(1,theme.skyBottom);ctx.fillStyle=gradient;ctx.fillRect(0,0,WORLD.width,WORLD.height)
  ctx.fillStyle=theme.sun;ctx.globalAlpha=.78;ctx.beginPath();ctx.arc(wrap(1030-cameraX*.018,WORLD.width+240)-120,135,72,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1
  mountainLayer(ctx,cameraX,theme.far,420,155,.12,330);mountainLayer(ctx,cameraX,theme.mid,505,125,.28,260)
  ctx.fillStyle=`${theme.mid}aa`;for(let x=-(cameraX*.5)%180;x<WORLD.width+180;x+=180){ctx.beginPath();ctx.moveTo(x,525);ctx.lineTo(x+18,470);ctx.lineTo(x+36,525);ctx.fill()}
}
function drawTerrain(ctx,points,cameraX,theme){
  ctx.save();ctx.translate(-cameraX,0);ctx.fillStyle=theme.soil;ctx.beginPath();ctx.moveTo(points[0].x,WORLD.height+100);points.forEach(p=>ctx.lineTo(p.x,p.y));ctx.lineTo(points.at(-1).x,WORLD.height+100);ctx.closePath();ctx.fill()
  ctx.strokeStyle=theme.edge;ctx.lineWidth=9;ctx.lineJoin='round';ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke()
  ctx.fillStyle=theme.deep;ctx.globalAlpha=.42;for(let i=0;i<points.length;i++){const p=points[i];if(p.x<cameraX-60)continue;if(p.x>cameraX+WORLD.width+60)break;if(p.x%185<32){ctx.beginPath();ctx.ellipse(p.x,p.y+63+(p.x%4)*9,17+(p.x%3)*4,9,0,0,Math.PI*2);ctx.fill()}}ctx.globalAlpha=1;ctx.restore()
}
function drawCoin(ctx,coin,cameraX,time){
  ctx.save();ctx.translate(coin.x-cameraX,coin.y);ctx.scale(Math.abs(Math.cos(time*.004+coin.spin))*.85+.15,1)
  ctx.fillStyle='#ffd34d';ctx.beginPath();ctx.arc(0,0,16,0,Math.PI*2);ctx.fill()
  ctx.strokeStyle='#a16207';ctx.lineWidth=3;ctx.stroke()
  ctx.fillStyle='#facc15';ctx.beginPath();ctx.arc(0,0,11,0,Math.PI*2);ctx.fill()
  ctx.fillStyle='#a16207';ctx.font='900 14px Chivo, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('H',0,1)
  ctx.strokeStyle='#fff4';ctx.lineWidth=2;ctx.beginPath();ctx.arc(-4,-5,4,0,Math.PI*2);ctx.stroke()
  ctx.restore()
}
function drawFuelCans(ctx,can,cameraX){
  ctx.save();ctx.translate(can.x-cameraX,can.y)
  ctx.fillStyle='#0b0f19';ctx.beginPath();ctx.roundRect(-15,-24,30,34,5);ctx.fill()
  ctx.strokeStyle='#ff5500';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(-15,-24,30,34,5);ctx.stroke()
  ctx.fillStyle='#ff5500';ctx.fillRect(-9,-13,18,16)
  ctx.fillStyle='#1e293b';ctx.fillRect(-13,-24,8,7);ctx.beginPath();ctx.arc(6,-19,5,0,Math.PI*2);ctx.fill()
  ctx.strokeStyle='#7fffa3';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-5,-23);ctx.lineTo(5,-23);ctx.stroke()
  ctx.strokeStyle='#ffb199';ctx.lineWidth=2;ctx.beginPath();ctx.arc(5,-18,2.4,0,Math.PI*2);ctx.stroke()
  ctx.restore()
}
function drawPickups(ctx,run,cameraX){
  for(const p of run.pickups){if(p.collected)continue;p.type==='fuel'?drawFuelCans(ctx,p,cameraX):drawCoin(ctx,p,cameraX,run.time)}
}
function drawParticles(ctx,run,cameraX){
  for(const p of run.particles){
    const a=Math.max(0,1-p.t/p.life)*.55
    ctx.fillStyle=`rgba(203,213,225,${a})`
    ctx.beginPath();ctx.arc(p.x-cameraX,p.y,p.r*(1-p.t/p.life*.5),0,Math.PI*2);ctx.fill()
  }
}
function drawFeedbacks(ctx,run,cameraX){
  ctx.textAlign='center';ctx.textBaseline='middle'
  for(const f of run.feedbacks){
    const k=f.age/950
    ctx.globalAlpha=Math.max(0,1-k)
    ctx.font='900 30px Chivo, sans-serif'
    ctx.lineWidth=6;ctx.strokeStyle='#05070b';ctx.strokeText(f.text,f.x-cameraX,f.y-40*k)
    ctx.fillStyle=f.color;ctx.fillText(f.text,f.x-cameraX,f.y-40*k)
  }
  ctx.globalAlpha=1
}
function wheel(ctx,wheel,cameraX){
  ctx.save();ctx.translate(wheel.position.x-cameraX,wheel.position.y);ctx.rotate(wheel.angle)
  ctx.fillStyle='#0a0e14';ctx.beginPath();ctx.arc(0,0,wheel.circleRadius,0,Math.PI*2);ctx.fill()
  ctx.strokeStyle='#273446';ctx.lineWidth=8;ctx.stroke()
  ctx.fillStyle='#94a3b8';ctx.beginPath();ctx.arc(0,0,13,0,Math.PI*2);ctx.fill()
  ctx.strokeStyle='#cbd5e1';ctx.lineWidth=3;for(let i=0;i<6;i+=1){ctx.rotate(Math.PI/3);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(wheel.circleRadius-9,0);ctx.stroke()}
  ctx.fillStyle='#1e293b';ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill()
  ctx.restore()
}
function worldAnchor(body,point){const cos=Math.cos(body.angle),sin=Math.sin(body.angle);return{x:body.position.x+point.x*cos-point.y*sin,y:body.position.y+point.x*sin+point.y*cos}}
function suspensionLink(ctx,bike,wheel,point,cameraX,color){
  const anchor=worldAnchor(bike.chassis,point)
  ctx.strokeStyle='#101827';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(anchor.x-cameraX,anchor.y);ctx.lineTo(wheel.position.x-cameraX,wheel.position.y);ctx.stroke()
  ctx.strokeStyle=color;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(anchor.x-cameraX,anchor.y);ctx.lineTo(wheel.position.x-cameraX,wheel.position.y);ctx.stroke()
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=3;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(anchor.x-cameraX,anchor.y);ctx.lineTo(wheel.position.x-cameraX,wheel.position.y);ctx.stroke();ctx.setLineDash([])
}
function drawRider(ctx){
  ctx.lineCap='round';ctx.lineJoin='round'
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(12,-58);ctx.lineTo(46,-26);ctx.stroke()
  ctx.strokeStyle='#334155';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(-6,-52);ctx.lineTo(34,-40);ctx.lineTo(52,-24);ctx.stroke()
  ctx.strokeStyle='#475569';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(-10,-26);ctx.lineTo(-34,-4);ctx.stroke()
  ctx.fillStyle='#1e293b';ctx.beginPath();ctx.roundRect(-22,-58,34,30,10);ctx.fill()
  ctx.strokeStyle='#a3e635';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-20,-52);ctx.lineTo(10,-52);ctx.stroke()
  ctx.fillStyle='#ff5500';ctx.beginPath();ctx.arc(30,-74,17,0,Math.PI*2);ctx.fill()
  ctx.fillStyle='#facc15';ctx.beginPath();ctx.roundRect(38,-78,18,9,[4,4,0,0]);ctx.fill()
  ctx.strokeStyle='#05070b';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(24,-86);ctx.lineTo(36,-86);ctx.stroke()
}
function drawBike(ctx,bike,cameraX){
  suspensionLink(ctx,bike,bike.rear,{x:-48,y:8},cameraX,'#ff5500');suspensionLink(ctx,bike,bike.front,{x:48,y:8},cameraX,'#cbd5e1')
  wheel(ctx,bike.rear,cameraX);wheel(ctx,bike.front,cameraX)
  const c=bike.chassis.position,a=bike.chassis.angle
  ctx.save();ctx.translate(c.x-cameraX,c.y);ctx.rotate(a)
  ctx.strokeStyle='#ff5500';ctx.lineWidth=12;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(-46,12);ctx.lineTo(-16,-8);ctx.lineTo(40,8);ctx.lineTo(0,20);ctx.closePath();ctx.stroke()
  ctx.strokeStyle='#334155';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-46,12);ctx.lineTo(-56,18);ctx.lineTo(-60,36);ctx.moveTo(40,8);ctx.lineTo(52,0);ctx.lineTo(50,22);ctx.stroke()
  ctx.fillStyle='#ff6b00';ctx.beginPath();ctx.roundRect(-42,-20,80,30,7);ctx.fill()
  ctx.fillStyle='#ffd9bf';ctx.globalAlpha=.35;ctx.fillRect(-40,-19,28,6);ctx.globalAlpha=1
  ctx.fillStyle='#0d1117';ctx.fillRect(-32,-27,62,10)
  ctx.strokeStyle='#cbd5e1';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(34,-9);ctx.lineTo(60,-28);ctx.lineTo(75,-26);ctx.stroke()
  ctx.fillStyle='#0a0e14';ctx.beginPath();ctx.arc(76,-26,5,0,Math.PI*2);ctx.fill()
  ctx.strokeStyle='#1d2939';ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(-5,-28);ctx.lineTo(10,-66);ctx.lineTo(39,-45);ctx.stroke()
  drawRider(ctx)
  ctx.strokeStyle='#dbe4ee';ctx.lineWidth=4;ctx.beginPath();ctx.arc(-34,-6,18,0,Math.PI*2);ctx.stroke()
  ctx.fillStyle='#dbe4ee';ctx.font='900 14px Chivo, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('HB',-34,-5)
  ctx.restore()
}
function debug(ctx,simulation,cameraX){if(!DEBUG_PHYSICS)return;const b=simulation.bike;ctx.save();ctx.translate(-cameraX,0);ctx.strokeStyle='#00ffff';ctx.lineWidth=2;const c=b.chassis.position;ctx.strokeRect(c.x-59,c.y-12,118,24);for(const w of [b.rear,b.front]){ctx.beginPath();ctx.arc(w.position.x,w.position.y,w.circleRadius,0,Math.PI*2);ctx.stroke()}ctx.restore()}
export function renderGame(ctx,simulation,cameraX,themeName){
  const theme=THEMES[themeName]||THEMES.forest
  ctx.clearRect(0,0,WORLD.width,WORLD.height)
  drawSky(ctx,cameraX,theme)
  drawTerrain(ctx,simulation.terrain.points,cameraX,theme)
  drawPickups(ctx,simulation.run,cameraX)
  drawParticles(ctx,simulation.run,cameraX)
  drawBike(ctx,simulation.bike,cameraX)
  drawFeedbacks(ctx,simulation.run,cameraX)
  debug(ctx,simulation,cameraX)
}