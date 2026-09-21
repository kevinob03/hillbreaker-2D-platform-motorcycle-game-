import { useEffect,useRef } from 'react'

const mapping={KeyW:'accelerate',ArrowUp:'accelerate',KeyS:'brake',ArrowDown:'brake',KeyA:'tiltBack',ArrowLeft:'tiltBack',KeyD:'tiltForward',ArrowRight:'tiltForward'}
const isTyping=(target)=>['INPUT','TEXTAREA','SELECT'].includes(target.tagName)||target.isContentEditable

export default function useKeyboard({onPause,onRestart,disabled=false}){
  const keysRef=useRef({accelerate:false,brake:false,tiltBack:false,tiltForward:false})
  const callbacksRef=useRef({onPause,onRestart})
  useEffect(()=>{callbacksRef.current={onPause,onRestart}},[onPause,onRestart])
  useEffect(()=>{
    const keydown=(event)=>{if(isTyping(event.target))return;const action=mapping[event.code];if(action){event.preventDefault();if(!disabled)keysRef.current[action]=true}if(!event.repeat&&event.code==='Escape'){event.preventDefault();callbacksRef.current.onPause()}if(!event.repeat&&event.code==='KeyR'){event.preventDefault();callbacksRef.current.onRestart()}}
    const keyup=(event)=>{const action=mapping[event.code];if(action){event.preventDefault();keysRef.current[action]=false}}
    const blur=()=>Object.keys(keysRef.current).forEach(key=>{keysRef.current[key]=false})
    window.addEventListener('keydown',keydown,{passive:false});window.addEventListener('keyup',keyup,{passive:false});window.addEventListener('blur',blur)
    return()=>{window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',blur)}
  },[disabled])
  return keysRef
}
