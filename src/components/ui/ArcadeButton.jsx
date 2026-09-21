import { Link } from 'react-router-dom'
import { playUiClick } from '../../audio/audioManager'

export default function ArcadeButton({to,children,variant='primary',icon:Icon,onClick}){
  const handleClick=()=>{
    playUiClick()
    onClick?.()
  }
  return <Link className={`arcade-button ${variant}`} to={to} onClick={handleClick}>
    {Icon&&<Icon size={20}/>}
    <span>{children}</span>
  </Link>
}
