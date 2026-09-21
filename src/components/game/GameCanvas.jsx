import { useCallback,useEffect,useRef,useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CAMERA,CONTROL,WORLD } from '../../game/constants'
import { createPhysics,destroyPhysics,getTelemetry,restartPhysics,stepPhysics } from '../../game/physicsEngine'
import { renderGame } from '../../game/gameRenderer'
import useGameLoop from '../../hooks/useGameLoop'; import useKeyboard from '../../hooks/useKeyboard'
import { createScore } from '../../services/gameService'
import { sendGameResultToN8n } from '../../services/n8nService'
import ControlsHelp from './ControlsHelp'; import GameOverModal from './GameOverModal'; import HUD from './HUD'; import PauseMenu from './PauseMenu'
import {
  destroyAudio, initAudio, isMuted, playCoin, playCrash, playFuel,
  playFuelOut, playGameOver, playJump, playLanding, playPause,
  readMutedPref, restartAudio, setEnginePaused, setEngineRpm, setMuted, unlockAudio,
} from '../../audio/audioManager'

export default function GameCanvas({level}){
  const navigate=useNavigate()
  const canvasRef=useRef(null)
  const simulationRef=useRef(null)
  const runtimeRef=useRef({cameraX:0,lastHud:0,accumulator:0})
  const gameOverRef=useRef(false),savedRef=useRef(false)
  const [paused,setPaused]=useState(false)
  const [gameOver,setGameOver]=useState(false)
  const [result,setResult]=useState(null)
  const [saveState,setSaveState]=useState('idle')
  const [telemetry,setTelemetry]=useState({distance:0,speed:0,fuel:100,coins:0,score:0,fuelCritical:false})
  const [muted,setMutedState]=useState(readMutedPref)

  // Audio state refs — seguimiento de estado previo para detectar eventos
  const prevCoinsRef=useRef(0)
  const prevFuelRef=useRef(100)
  const prevGroundedRef=useRef(true)
  const audioReadyRef=useRef(false)
  const gameOverSoundRef=useRef(false) // guard one-shot

  // ── Mute toggle ──────────────────────────────────────────────────────────────
  const handleMuteToggle=useCallback(()=>{
    const next=!isMuted()
    setMuted(next)
    setMutedState(next)
  },[])

  // ── Unlock AudioContext en primera interacción ────────────────────────────────
  useEffect(()=>{
    const unlock=()=>{
      if(audioReadyRef.current)return
      unlockAudio()
      if(!audioReadyRef.current){
        audioReadyRef.current=true
        initAudio()
      }
    }
    window.addEventListener('click',unlock,{once:true,passive:true})
    window.addEventListener('keydown',unlock,{once:true,passive:true})
    window.addEventListener('touchstart',unlock,{once:true,passive:true})
    return()=>{
      window.removeEventListener('click',unlock)
      window.removeEventListener('keydown',unlock)
      window.removeEventListener('touchstart',unlock)
    }
  },[])

  // ── Init/destroy audio junto con el canvas ────────────────────────────────────
  useEffect(()=>{
    return()=>{
      destroyAudio()
      audioReadyRef.current=false
    }
  },[])

  const togglePause=useCallback(()=>{
    if(gameOverRef.current)return
    setPaused(v=>{
      const next=!v
      if(audioReadyRef.current){
        setEnginePaused(next)
        if(next)playPause()
      }
      return next
    })
  },[])

  const restart=useCallback(()=>{
    const simulation=simulationRef.current;if(!simulation)return
    restartPhysics(simulation)
    runtimeRef.current={cameraX:0,lastHud:0,accumulator:0}
    gameOverRef.current=false;savedRef.current=false
    gameOverSoundRef.current=false
    prevCoinsRef.current=0;prevFuelRef.current=100;prevGroundedRef.current=true
    setSaveState('idle');setGameOver(false);setResult(null);setPaused(false)
    setTelemetry({distance:0,speed:0,fuel:100,coins:0,score:0,fuelCritical:false})
    if(audioReadyRef.current)restartAudio()
  },[])

  const keysRef=useKeyboard({onPause:togglePause,onRestart:restart,disabled:paused||gameOver})

  useEffect(()=>{
    const canvas=canvasRef.current
    const resize=()=>{const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=WORLD.width*dpr;canvas.height=WORLD.height*dpr;canvas.getContext('2d').setTransform(dpr,0,0,dpr,0,0)}
    resize();window.addEventListener('resize',resize)
    return()=>window.removeEventListener('resize',resize)
  },[])

  useEffect(()=>{
    const simulation=createPhysics(level)
    simulationRef.current=simulation
    runtimeRef.current={cameraX:0,lastHud:0,accumulator:0}
    prevCoinsRef.current=0;prevFuelRef.current=100;prevGroundedRef.current=true
    gameOverSoundRef.current=false
    return()=>{destroyPhysics(simulation);simulationRef.current=null}
  },[level])

  useEffect(()=>{
    if(!gameOver||savedRef.current)return
    const simulation=simulationRef.current;if(!simulation)return
    savedRef.current=true
    setSaveState('saving')
    const payload={player:'Player',levelId:level.id,level:level.name,distance:Math.round(simulation.run.distance),score:Math.round(simulation.run.score),coins:simulation.run.coins,date:new Date().toISOString()}
    Promise.allSettled([createScore(payload),sendGameResultToN8n(payload)])
      .then(([db])=>setSaveState(db.status==='fulfilled'?'saved':'error'))
  },[gameOver,level])

  useGameLoop((delta,now)=>{
    const simulation=simulationRef.current,canvas=canvasRef.current
    if(!simulation||!canvas)return
    const run=simulation.run
    if(!paused){
      runtimeRef.current.accumulator=Math.min(runtimeRef.current.accumulator+delta,WORLD.step*3)
      if(!gameOver){
        // ── Snapshot pre-step para detectar pickups ──────────────────────────
        const coinsBefore=run.coins
        const fuelBefore=run.fuel

        while(runtimeRef.current.accumulator>=WORLD.step&&run.state==='running'){
          stepPhysics(simulation,keysRef.current,WORLD.step)
          runtimeRef.current.accumulator-=WORLD.step
        }

        // ── Detección de eventos de audio ────────────────────────────────────
        if(audioReadyRef.current && run.state==='running'){
          const keys=keysRef.current
          const bike=simulation.bike

          // Monedas
          if(run.coins>coinsBefore)playCoin()

          // Combustible
          if(run.fuel>fuelBefore)playFuel()

          // Salto / aterrizaje
          const groundedNow=run.grounded
          if(prevGroundedRef.current&&!groundedNow)playJump()
          if(!prevGroundedRef.current&&groundedNow){
            const vy=Math.abs(bike.chassis.velocity.y)
            playLanding(vy)
          }
          prevGroundedRef.current=groundedNow

          // Guardar prev tras detectar
          prevCoinsRef.current=run.coins
          prevFuelRef.current=run.fuel

          // Motor dinámico — calcular rpmNorm
          const vx=Math.abs(bike.chassis.velocity.x)
          const throttle=keys.accelerate?0.58:0
          const speedContrib=Math.min(1,vx/CONTROL.maxSpeed)*0.42
          const airBoost=(!groundedNow&&keys.accelerate)?0.12:0
          const rpmRaw=Math.min(1,throttle+speedContrib+airBoost)
          setEngineRpm(rpmRaw)
        }

        // ── Game Over ────────────────────────────────────────────────────────
        if(run.state==='gameOver'&&!gameOverRef.current){
          gameOverRef.current=true
          const reason=run.reason

          if(audioReadyRef.current&&!gameOverSoundRef.current){
            gameOverSoundRef.current=true
            if(reason==='crash'){
              playCrash()
              setTimeout(()=>{ if(!destroyAudio._destroyed)playGameOver() },520)
            } else {
              // fuel=0: motor se apaga dramáticamente
              playFuelOut()
              setTimeout(()=>{ if(!destroyAudio._destroyed)playGameOver() },900)
            }
          }

          setResult({distance:Math.round(run.distance),score:Math.round(run.score),coins:run.coins,reason})
          setGameOver(true)
          runtimeRef.current.accumulator=0
        }
      }
      const desired=Math.max(0,simulation.bike.chassis.position.x-CAMERA.lead)
      const current=runtimeRef.current.cameraX
      const target=Math.max(current-CAMERA.maxBacktrack,desired)
      runtimeRef.current.cameraX=current+(target-current)*CAMERA.smoothing
      if(run.state==='running'&&now-runtimeRef.current.lastHud>100){
        const t=getTelemetry(simulation);setTelemetry({...t,fuelCritical:t.fuel<=25});runtimeRef.current.lastHud=now
      }
    }
    renderGame(canvas.getContext('2d'),simulation,runtimeRef.current.cameraX,level.theme)
  },true)

  return <div className="game-stage">
    <canvas ref={canvasRef} className="game-canvas" aria-label={`Partida de ${level.name}`}/>
    <HUD {...telemetry} paused={paused} onPause={togglePause} muted={muted} onMuteToggle={handleMuteToggle}/>
    <ControlsHelp/>
    {paused&&<PauseMenu onContinue={togglePause} onRestart={restart}/>}
    {gameOver&&<GameOverModal result={result} level={level} saveState={saveState} onRetry={restart} onScores={()=>navigate('/scores')} onHome={()=>navigate('/')}/>}
  </div>
}