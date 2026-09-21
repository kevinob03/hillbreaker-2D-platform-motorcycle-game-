import { Link } from 'react-router-dom'
export default function ArcadeButton({to,children,variant='primary',icon:Icon}){return <Link className={`arcade-button ${variant}`} to={to}>{Icon&&<Icon size={20}/>}<span>{children}</span></Link>}
