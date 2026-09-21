import { RouteOff } from 'lucide-react'; import ArcadeButton from '../components/ui/ArcadeButton'
export default function NotFound(){return <section className="not-found"><RouteOff/><span>404</span><h1>Pista no encontrada</h1><p>Este camino termina aquí. Regresa al campamento base.</p><ArcadeButton to="/">Volver al inicio</ArcadeButton></section>}
