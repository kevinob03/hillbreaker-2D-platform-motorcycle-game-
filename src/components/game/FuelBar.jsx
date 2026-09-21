export default function FuelBar({value=100,critical=false}){
  return <div className={`fuel${critical?' critical':''}`} aria-label={`Combustible: ${value}%`}><small>Combustible</small><div>{Array.from({length:10},(_,i)=><span className={i<Math.ceil(value/10)?'active':''} key={i}/>)}</div><em>{value}%</em></div>
}