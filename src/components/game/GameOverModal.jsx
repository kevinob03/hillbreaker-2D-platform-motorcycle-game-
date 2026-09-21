import { Home,RefreshCw,Trophy } from 'lucide-react'
import { playUiClick } from '../../audio/audioManager'
export default function GameOverModal({result,level,saveState,onRetry,onScores,onHome}){
  const record=result?.score>=5000
  const click=(fn)=>()=>{playUiClick();fn()}
  return <div className="gameover-overlay" role="dialog" aria-modal="true" aria-label="Fin de la partida">
    <div className="gameover-panel">
      <span className="gameover-eyebrow">La pista ganó esta vez</span>
      <h2>Game Over</h2>
      {record&&<span className="record-badge">Nuevo récord</span>}
      <span className={`gameover-reason ${result?.reason==='fuel'?'fuel':'crash'}`}>{result?.reason==='fuel'?'Sin combustible':'Accidente'}</span>
      <div className="gameover-stats">
        <div><span>Puntuación</span><b>{result?.score.toLocaleString('es-ES')}</b></div>
        <div><span>Distancia</span><b>{result?.distance.toLocaleString('es-ES')} m</b></div>
        <div><span>Monedas</span><b>{result?.coins}</b></div>
        <div><span>Nivel</span><b>{level.name}</b></div>
      </div>
      <div className="save-status">{saveState==='saving'?'Guardando resultado...':saveState==='saved'?'Resultado guardado en la clasificación.':saveState==='error'?'No se pudo guardar el resultado.':''}</div>
      <button className="arcade-button" onClick={click(onRetry)}><RefreshCw/>Reintentar</button>
      <div className="gameover-actions"><button className="arcade-button secondary" onClick={click(onScores)}><Trophy/>Puntajes</button><button className="arcade-button ghost" onClick={click(onHome)}><Home/>Menú principal</button></div>
    </div>
  </div>
}