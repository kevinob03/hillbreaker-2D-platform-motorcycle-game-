import { TERRAIN } from './constants'
import { isTerrainGap,terrainYAt } from './createTerrain'
const chunkRand=(seed,ci,salt)=>{let s=(seed^((ci+1)*(2654435761|0))^(salt*40503))>>>0;s=(s*1664525+1013904223)>>>0;return s/4294967296}
export function spawnChunkPickups(run,terrain,ci){
  const points=terrain.points
  const yAt=x=>terrainYAt(points,x,terrain)
  for(let a=0;a<2;a++){
    if(chunkRand(terrain.pickupSeed,ci,a+1)<.4){
      let x=ci*TERRAIN.chunkLength+200+chunkRand(terrain.pickupSeed,ci,a+3)*800
      if(isTerrainGap(terrain,x))x=ci*TERRAIN.chunkLength+150;run.pickups.push({x,y:yAt(x)-26,type:'fuel',collected:false,spin:chunkRand(terrain.pickupSeed,ci,a+5)*6.28})
    }
  }
  for(let c=0;c<2;c++){
    if(chunkRand(terrain.pickupSeed,ci,c+7)<.6){
      const x=ci*TERRAIN.chunkLength+180+chunkRand(terrain.pickupSeed,ci,c+9)*840
      run.pickups.push({x,y:yAt(x)-30,type:'coin',collected:false,spin:chunkRand(terrain.pickupSeed,ci,c+11)*6.28})
    }
  }
  if(chunkRand(terrain.pickupSeed,ci,13)<.4){
    const x=ci*TERRAIN.chunkLength+220+chunkRand(terrain.pickupSeed,ci,14)*760
    const y=yAt(x)
    for(let k=0;k<3;k++)run.pickups.push({x:x+k*56,y:y-46-k*52,type:'coin',collected:false,spin:chunkRand(terrain.pickupSeed,ci,15+k)*6.28})
  }
}
