import { useEffect,useRef } from 'react'

export default function useGameLoop(callback,active=true){
  const callbackRef=useRef(callback)
  useEffect(()=>{callbackRef.current=callback},[callback])
  const frameRef=useRef(0)
  useEffect(()=>{if(!active)return undefined;let previous=performance.now(),mounted=true
    const frame=(now)=>{if(!mounted)return;const delta=Math.min(now-previous,33.34);previous=now;callbackRef.current(delta,now);frameRef.current=requestAnimationFrame(frame)}
    frameRef.current=requestAnimationFrame(frame)
    return()=>{mounted=false;cancelAnimationFrame(frameRef.current)}
  },[active])
  return frameRef
}
