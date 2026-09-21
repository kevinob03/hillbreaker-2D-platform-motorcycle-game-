const API_URL='http://localhost:3001'
async function request(path,options={}){const response=await fetch(`${API_URL}${path}`,{headers:{'Content-Type':'application/json',...options.headers},...options});if(!response.ok)throw new Error(`La API respondió con el estado ${response.status}.`);return response.json()}
export const getLevels=()=>request('/levels')
export const getLevelById=(id)=>request(`/levels/${encodeURIComponent(id)}`)
export const getScores=()=>request('/scores')
export const createScore=(score)=>request('/scores',{method:'POST',body:JSON.stringify(score)})
