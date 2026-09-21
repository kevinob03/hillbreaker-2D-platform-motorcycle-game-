import { WORLD } from './constants'
import { terrainYAt } from './createTerrain'
const normAngle=a=>{a%=Math.PI*2;if(a>Math.PI)a-=Math.PI*2;if(a<-Math.PI)a+=Math.PI*2;return a}
export function updateDanger(simulation,sec,current){
  const {chassis}=simulation.bike
  let dangerous=false
  if(chassis.position.y>WORLD.height+420)dangerous=true
  else{
    const below=chassis.position.y-terrainYAt(simulation.terrain.points,chassis.position.x)
    if(below>175)dangerous=true
    else if(Math.abs(normAngle(chassis.angle))>2.5&&below>-30)dangerous=true
  }
  return dangerous?(current||0)+sec:Math.max(0,current-sec*3)
}