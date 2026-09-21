import { Edge,Vec2 } from 'planck'
import { TERRAIN,WORLD } from './constants'
const u=v=>v/WORLD.scale
const CL=TERRAIN.chunkLength
const SAMPLE=TERRAIN.sample
const PPC=CL/SAMPLE
const TRAITS={forest:{base:505,amp:125,depth:10},canyon:{base:502,amp:180,depth:15},volcano:{base:500,amp:235,depth:19}}
const chunkRand=(seed,ci,salt)=>{let s=(seed^((ci+1)*(2654435761|0))^(salt*40503))>>>0;s=(s*1664525+1013904223)>>>0;return s/4294967296}
const ease=t=>.5-.5*Math.cos(t*Math.PI*2)
function heightAt(t,ci,frac){
  const tr=TRAITS[t.theme]||TRAITS.forest
  const x=ci*CL+frac*CL
  const diff=Math.min(1,ci/24)
  const amp=tr.amp*(.3+.7*diff)
  const flat=chunkRand(t.seed,ci,3)<.14
  let h=tr.base
  const bumpA=chunkRand(t.seed,ci,1)
  const climb=chunkRand(t.seed,ci,2)
  if(!flat)h-=amp*bumpA*Math.pow(ease(frac),.7)*(climb>.72?1.35:1)
  const double=chunkRand(t.seed,ci,4)
  if(double>.62&&!flat)h-=amp*.5*double*Math.pow(ease((frac-.5+1)%1),.95)
  h+=Math.sin(x*.05+t.seed)*tr.depth*.4+Math.sin(x*.013*(t.seed%13+1))*tr.depth*.28
  if(ci===0){
    if(x<430)h=tr.base
    else if(x<640)h=tr.base+(h-tr.base)*(x-430)/210
  }
  return Math.max(tr.base-300,Math.min(tr.base+50,h))
}
function materializeChunk(world,t,ci){
  if(t.chunks.has(ci))return false
  const pts=[]
  for(let i=0;i<=PPC;i++)pts.push({x:ci*CL+i*SAMPLE,y:heightAt(t,ci,i/PPC)})
  const shared=t.points.length>0&&t.points[t.points.length-1].x===pts[0].x
  const start=shared?1:0
  const firstIdx=t.points.length-start
  const body=world.createBody()
  for(let i=start;i<pts.length;i++)t.points.push(pts[i])
  for(let k=firstIdx;k<t.points.length-1;k++){const a=t.points[k],b=t.points[k+1];body.createFixture(Edge(Vec2(u(a.x),u(a.y)),Vec2(u(b.x),u(b.y))),{friction:1.12,restitution:0})}
  t.chunks.set(ci,true)
  t.maxX=pts[pts.length-1].x
  return true
}
function trimWorld(world,t,minKeepX){
  const keep=minKeepX-TERRAIN.trimBehind
  let ci=t.minChunk
  while(ci>0&&t.chunks.has(ci)&&(ci+1)*CL<keep){
    world.destroyBody(t.chunkBodies.get(ci))
    t.chunkBodies.delete(ci)
    t.chunks.delete(ci)
    t.startIndex=(ci+1)*PPC
    ci++
  }
  t.minChunk=ci
  if(t.startIndex>0){t.points.splice(0,t.startIndex);t.startIndex=0}
}
export function advanceWorld(world,t,minX){
  const created=[]
  while(t.maxX<minX+TERRAIN.lookahead){materializeChunk(world,t,t.cursor);created.push(t.cursor);t.cursor++}
  trimWorld(world,t,minX)
  return created
}
export function createTerrain(world,theme,seed){
  const t={theme,seed:seed>>>0,pickupSeed:(seed^0x9e3779b9)>>>0,chunks:new Map(),chunkBodies:new Map(),points:[],maxX:0,minChunk:0,startIndex:0,cursor:0}
  materializeChunk(world,t,0)
  t.cursor=1
  return t
}
export function terrainYAt(p,x){if(x<=p[0].x)return p[0].y;const z=p.at(-1);if(x>=z.x)return z.y;const d=p[1].x-p[0].x,i=Math.min(p.length-2,Math.floor((x-p[0].x)/d)),a=p[i],b=p[i+1];return a.y+(b.y-a.y)*(x-a.x)/(b.x-a.x)}