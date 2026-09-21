const WEBHOOK_URL=/^\s*$/.test(import.meta.env.VITE_N8N_GAME_WEBHOOK||'')?'':import.meta.env.VITE_N8N_GAME_WEBHOOK
export async function sendGameResultToN8n(payload){
  if(!WEBHOOK_URL)return null
  const response=await fetch(WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
  if(!response.ok){throw new Error(`n8n respondió con el estado ${response.status}.`)}
  return response.json()
}