import { Trophy } from 'lucide-react'; import { useCallback,useEffect,useMemo,useState } from 'react'; import LeaderboardRow from '../components/ui/LeaderboardRow'; import { getScores } from '../services/gameService'
const FILTERS=[['all','TODOS'],['Green Hills','GREEN HILLS'],['Rocky Canyon','ROCKY CANYON'],['Death Mountain','DEATH MOUNTAIN']]
export default function Scores(){
  const[scores,setScores]=useState([]),[status,setStatus]=useState('loading'),[error,setError]=useState(''),[filter,setFilter]=useState('all')
  const fetchData=useCallback(()=>{getScores().then(d=>{setScores(d);setStatus('success')}).catch(e=>{setError(e.message);setStatus('error')})},[])
  useEffect(()=>{let active=true;getScores().then(d=>{if(active){setScores(d);setStatus('success')}}).catch(e=>{if(active){setError(e.message);setStatus('error')}});return()=>{active=false}},[])
  const retry=()=>{setStatus('loading');setError('');fetchData()}
  const visible=useMemo(()=>scores.filter(s=>filter==='all'||s.level===filter).sort((a,b)=>b.score-a.score),[scores,filter])
  return <section className="standard-page"><div className="page-container"><header className="page-heading heading-row"><div><span className="eyebrow">Salón de la fama</span><h1>Leaderboard</h1><p>Los pilotos que llevaron cada pista hasta el límite.</p></div><Trophy/></header>
    <div className="filter-bar"><label htmlFor="level-filter">Filtrar por pista</label><select id="level-filter" value={filter} onChange={e=>setFilter(e.target.value)}>{FILTERS.map(([v,label])=><option value={v} key={v}>{label}</option>)}</select></div>
    {status==='loading'&&<div className="status-panel"><i/>Cargando puntajes...</div>}
    {status==='error'&&<div className="status-panel error"><b>No pudimos cargar el leaderboard.</b><span>{error}</span><button className="arcade-button" onClick={retry}>Reintentar</button></div>}
    {status==='success'&&visible.length===0&&<div className="status-panel">No hay puntuaciones para esta pista todavía.</div>}
    {status==='success'&&visible.length>0&&<div className="leaderboard" role="table"><div className="leaderboard-head" role="row"><span>Posición</span><span>Jugador</span><span>Nivel</span><span>Distancia</span><span>Puntaje</span></div>{visible.map((s,i)=><LeaderboardRow key={s.id} score={s} position={i+1}/>)}</div>}
  </div></section>
}