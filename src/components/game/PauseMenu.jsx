import { LogOut,Play,RotateCcw } from 'lucide-react'; import { Link } from 'react-router-dom'
import { playUiClick } from '../../audio/audioManager'
export default function PauseMenu({onContinue,onRestart}){
  const click=(fn)=>()=>{playUiClick();fn?.()}
  return <div className="pause-overlay" role="dialog" aria-modal="true" aria-label="Juego pausado">
    <div className="pause-panel">
      <span>Motor detenido</span>
      <h2>Pausa</h2>
      <button className="arcade-button" onClick={click(onContinue)}><Play/>Continuar</button>
      <button className="arcade-button secondary" onClick={click(onRestart)}><RotateCcw/>Reiniciar</button>
      <Link className="arcade-button ghost" to="/game" onClick={()=>playUiClick()}><LogOut/>Salir a pistas</Link>
    </div>
  </div>
}
