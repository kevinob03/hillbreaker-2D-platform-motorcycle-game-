import { Route, Routes } from 'react-router-dom'
import GameHeader from './components/layout/GameHeader'
import Game from './pages/Game'; import Home from './pages/Home'; import HowToPlay from './pages/HowToPlay'; import LevelSelect from './pages/LevelSelect'; import NotFound from './pages/NotFound'; import Scores from './pages/Scores'
export default function App(){return <div className="app-shell"><GameHeader/><main><Routes><Route path="/" element={<Home/>}/><Route path="/game" element={<LevelSelect/>}/><Route path="/game/:levelId" element={<Game/>}/><Route path="/scores" element={<Scores/>}/><Route path="/how-to-play" element={<HowToPlay/>}/><Route path="*" element={<NotFound/>}/></Routes></main></div>}
