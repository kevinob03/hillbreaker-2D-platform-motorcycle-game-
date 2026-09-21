import { Coins,Pause,Route,Volume2,VolumeOff } from 'lucide-react'; import FuelBar from './FuelBar'
export default function HUD({distance=0,coins=0,score=0,fuel=100,fuelCritical=false,speed=0,paused=false,onPause,muted=false,onMuteToggle}){
  const compact=Math.abs(score)>99999||Math.abs(distance)>99999
  return <div className={compact?'hud compact':'hud'}>
    <FuelBar value={fuel} critical={fuelCritical}/>
    <div className="hud-stat distance"><Route/><small>Distancia</small><b>{distance.toLocaleString('es-ES')} m</b></div>
    <div className="hud-right">
      <div className="hud-stat"><Coins/><small>Monedas</small><b>{String(coins).padStart(3,'0')}</b></div>
      <div className="hud-stat"><small>Puntaje</small><b>{score.toLocaleString('es-ES')}</b></div>
      <div className="hud-stat speed-stat"><small>Velocidad</small><b>{speed}</b><em>km/h</em></div>
      <button type="button" aria-label={muted?'Activar sonido':'Silenciar'} onClick={onMuteToggle} className="hud-mute-btn">{muted?<VolumeOff/>:<Volume2/>}</button>
      <button type="button" aria-label={paused?'Continuar':'Pausar'} onClick={onPause}><Pause/></button>
    </div>
  </div>
}