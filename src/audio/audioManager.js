// ─────────────────────────────────────────────────────────────────────────────
// audioManager.js — Singleton centralizado de audio para Hillbreaker
//
// Tecnología: Web Audio API nativa (sin librerías externas).
// Todos los efectos son procedurales — no requiere archivos de audio.
// Compatible con autoplay policies: AudioContext se crea diferido.
// ─────────────────────────────────────────────────────────────────────────────

import { AUDIO_CONFIG as C } from './audioConfig'

// ── Singleton interno ─────────────────────────────────────────────────────────
let _ctx = null          // AudioContext (creado en primera interacción)
let _masterGain = null   // Nodo raíz de ganancia
let _muted = false
let _destroyed = false

// Motor dinámico
const _engine = {
  osc1: null, osc2: null, osc3: null,
  gainNode: null,
  filter: null,
  masterGain: null,
  currentRpm: 0,   // valor suavizado actual (0..1)
  running: false,
  paused: false,
}

// Cooldown stamps
const _lastPlayed = {}

// Flags one-shot
let _gameOverPlayed = false
let _crashPlayed = false

// ── Helpers internos ──────────────────────────────────────────────────────────

/** Crea (o reanuda) el AudioContext en respuesta a interacción del usuario */
function _ensureContext() {
  if (_destroyed) return false
  if (!_ctx) {
    try {
      _ctx = new (window.AudioContext || window.webkitAudioContext)()
      // Nodo maestro
      _masterGain = _ctx.createGain()
      _masterGain.gain.value = _muted ? 0 : C.volume.master
      _masterGain.connect(_ctx.destination)
    } catch {
      return false
    }
  }
  if (_ctx.state === 'suspended') {
    _ctx.resume().catch(() => {})
  }
  return _ctx.state !== 'closed'
}

/** Ganancia real aplicada a un nodo, respetando mute global */
function _vol(v) {
  return _muted ? 0 : v
}

/** Comprueba cooldown; devuelve true si se puede reproducir */
function _canPlay(key) {
  const ms = C.cooldown[key] ?? 0
  if (!ms) return true
  const now = performance.now()
  if ((now - (_lastPlayed[key] ?? 0)) < ms) return false
  _lastPlayed[key] = now
  return true
}

/** Crea un GainNode con gain inicial y lo conecta al masterGain */
function _createGain(value) {
  const g = _ctx.createGain()
  g.gain.value = _vol(value)
  g.connect(_masterGain)
  return g
}

/** Fade lineal de un GainNode */
function _fade(gainNode, from, to, durationMs) {
  const now = _ctx.currentTime
  gainNode.gain.cancelScheduledValues(now)
  gainNode.gain.setValueAtTime(from, now)
  gainNode.gain.linearRampToValueAtTime(to, now + durationMs / 1000)
}

/** Crea un oscilador one-shot (se desconecta solo al terminar) */
function _oneShot({ type = 'sine', freq, gain, duration, freqEnd, gainEnd, dest }) {
  if (!_ensureContext()) return
  const t = _ctx.currentTime
  const d = duration / 1000

  const osc = _ctx.createOscillator()
  const g = _ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (freqEnd !== undefined) osc.frequency.linearRampToValueAtTime(freqEnd, t + d)
  g.gain.setValueAtTime(_vol(gain), t)
  if (gainEnd !== undefined) g.gain.linearRampToValueAtTime(_vol(gainEnd), t + d * 0.9)
  else g.gain.linearRampToValueAtTime(0, t + d)

  const target = dest ?? _masterGain
  osc.connect(g)
  g.connect(target)
  osc.start(t)
  osc.stop(t + d + 0.01)
  osc.addEventListener('ended', () => { try { osc.disconnect(); g.disconnect() } catch { /* ignore */ } })
}

/** Genera ruido blanco en un AudioBuffer reutilizable */
function _makeNoiseBuffer(ctx, seconds = 0.5) {
  const sr = ctx.sampleRate
  const buf = ctx.createBuffer(1, Math.ceil(sr * seconds), sr)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buf
}

/** Ruido filtrado one-shot */
function _noiseShot({ gainVal, filterFreq, filterQ = 1, duration, filterFreqEnd, gainEnd }) {
  if (!_ensureContext()) return
  const t = _ctx.currentTime
  const d = duration / 1000

  const src = _ctx.createBufferSource()
  src.buffer = _makeNoiseBuffer(_ctx, d + 0.05)
  src.loop = false

  const filter = _ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(filterFreq, t)
  if (filterFreqEnd !== undefined) filter.frequency.linearRampToValueAtTime(filterFreqEnd, t + d)
  filter.Q.value = filterQ

  const g = _ctx.createGain()
  g.gain.setValueAtTime(_vol(gainVal), t)
  const gEnd = gainEnd !== undefined ? gainEnd : 0
  g.gain.linearRampToValueAtTime(_vol(gEnd), t + d)

  src.connect(filter)
  filter.connect(g)
  g.connect(_masterGain)
  src.start(t)
  src.stop(t + d + 0.05)
  src.addEventListener('ended', () => { try { src.disconnect(); filter.disconnect(); g.disconnect() } catch { /* ignore */ } })
}

// ── Motor dinámico ────────────────────────────────────────────────────────────

function _startEngine() {
  if (!_ensureContext()) return
  if (_engine.running) return

  const cfg = C.engine
  const t = _ctx.currentTime

  // Nodo de gain del motor (se conecta al master)
  _engine.masterGain = _ctx.createGain()
  _engine.masterGain.gain.setValueAtTime(_vol(cfg.gainIdle), t)
  _engine.masterGain.connect(_masterGain)

  // Filter lowpass
  _engine.filter = _ctx.createBiquadFilter()
  _engine.filter.type = 'lowpass'
  _engine.filter.frequency.setValueAtTime(cfg.filterFreqIdle, t)
  _engine.filter.Q.value = cfg.filterQ
  _engine.filter.connect(_engine.masterGain)

  // Oscilador 1 — sawtooth (fundamental)
  _engine.osc1 = _ctx.createOscillator()
  _engine.osc1.type = 'sawtooth'
  _engine.osc1.frequency.setValueAtTime(cfg.osc1.idle, t)
  const g1 = _ctx.createGain(); g1.gain.value = cfg.osc1gain
  _engine.osc1.connect(g1); g1.connect(_engine.filter)

  // Oscilador 2 — square (armónico)
  _engine.osc2 = _ctx.createOscillator()
  _engine.osc2.type = 'square'
  _engine.osc2.frequency.setValueAtTime(cfg.osc2.idle, t)
  const g2 = _ctx.createGain(); g2.gain.value = cfg.osc2gain
  _engine.osc2.connect(g2); g2.connect(_engine.filter)

  // Oscilador 3 — sine sub-grave
  _engine.osc3 = _ctx.createOscillator()
  _engine.osc3.type = 'sine'
  _engine.osc3.frequency.setValueAtTime(cfg.osc3.idle, t)
  const g3 = _ctx.createGain(); g3.gain.value = cfg.osc3gain
  _engine.osc3.connect(g3); g3.connect(_engine.filter)

  _engine._g1 = g1; _engine._g2 = g2; _engine._g3 = g3

  _engine.osc1.start(t)
  _engine.osc2.start(t)
  _engine.osc3.start(t)

  _engine.running = true
  _engine.currentRpm = 0
}

function _stopEngine(fadeMs = 200) {
  if (!_engine.running) return
  if (_engine.masterGain && _ctx) {
    const t = _ctx.currentTime
    _engine.masterGain.gain.cancelScheduledValues(t)
    _engine.masterGain.gain.setValueAtTime(_engine.masterGain.gain.value, t)
    _engine.masterGain.gain.linearRampToValueAtTime(0, t + fadeMs / 1000)
    const stop = t + fadeMs / 1000 + 0.05
    try { _engine.osc1?.stop(stop) } catch { /* ignore */ }
    try { _engine.osc2?.stop(stop) } catch { /* ignore */ }
    try { _engine.osc3?.stop(stop) } catch { /* ignore */ }
  }
  _engine.running = false
}

function _destroyEngineNodes() {
  try { _engine.osc1?.disconnect() } catch { /* ignore */ }
  try { _engine.osc2?.disconnect() } catch { /* ignore */ }
  try { _engine.osc3?.disconnect() } catch { /* ignore */ }
  try { _engine._g1?.disconnect() } catch { /* ignore */ }
  try { _engine._g2?.disconnect() } catch { /* ignore */ }
  try { _engine._g3?.disconnect() } catch { /* ignore */ }
  try { _engine.filter?.disconnect() } catch { /* ignore */ }
  try { _engine.masterGain?.disconnect() } catch { /* ignore */ }
  _engine.osc1 = null; _engine.osc2 = null; _engine.osc3 = null
  _engine._g1 = null; _engine._g2 = null; _engine._g3 = null
  _engine.filter = null; _engine.masterGain = null
  _engine.running = false
}

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Desbloquea el AudioContext tras la primera interacción del usuario.
 * Llamar en el primer click/keydown del juego.
 */
export function unlockAudio() {
  _ensureContext()
}

/**
 * Inicializa el sistema de audio (motor en idle).
 * Llamar al montar GameCanvas, después de primer unlock.
 */
export function initAudio() {
  _destroyed = false
  _gameOverPlayed = false
  _crashPlayed = false
  _engine.currentRpm = 0
  _engine.paused = false

  // Leer preferencia de mute persistida
  try {
    _muted = localStorage.getItem(C.muteKey) === 'true'
  } catch { /* ignore */ }

  if (_ensureContext()) {
    if (_masterGain) _masterGain.gain.value = _muted ? 0 : C.volume.master
    _startEngine()
  }
}

/**
 * Limpieza completa al desmontar GameCanvas (evita memory leaks).
 */
export function destroyAudio() {
  _destroyed = true
  _stopEngine(0)
  _destroyEngineNodes()
  // Cerrar contexto solo si existe
  if (_ctx && _ctx.state !== 'closed') {
    _ctx.close().catch(() => {})
  }
  _ctx = null
  _masterGain = null
}

/**
 * Llama cada frame con el RPM normalizado (0=idle, 1=máximo).
 * Aplica suavizado interno (lerp).
 */
export function setEngineRpm(rpmRaw) {
  if (!_engine.running || !_ctx || _ctx.state === 'closed') return
  if (_engine.paused) return

  const cfg = C.engine
  // Lerp suavizado
  _engine.currentRpm += (rpmRaw - _engine.currentRpm) * cfg.lerpSpeed
  const rpm = _engine.currentRpm

  const t = _ctx.currentTime
  const eps = 0.016 // ~1 frame a 60fps

  // Pitch de los osciladores
  const f1 = cfg.osc1.idle + (cfg.osc1.full - cfg.osc1.idle) * rpm
  const f2 = cfg.osc2.idle + (cfg.osc2.full - cfg.osc2.idle) * rpm
  const f3 = cfg.osc3.idle + (cfg.osc3.full - cfg.osc3.idle) * rpm
  _engine.osc1?.frequency.setTargetAtTime(f1, t, eps)
  _engine.osc2?.frequency.setTargetAtTime(f2, t, eps)
  _engine.osc3?.frequency.setTargetAtTime(f3, t, eps)

  // Gain del motor
  const gain = cfg.gainIdle + (cfg.gainFull - cfg.gainIdle) * rpm
  _engine.masterGain?.gain.setTargetAtTime(_vol(gain), t, eps)

  // Filter cutoff
  const fq = cfg.filterFreqIdle + (cfg.filterFreqFull - cfg.filterFreqIdle) * rpm
  _engine.filter?.frequency.setTargetAtTime(fq, t, eps)
}

/**
 * Pausa/reanuda el motor (llamar cuando el juego pausa/continúa).
 */
export function setEnginePaused(isPaused) {
  if (!_engine.running || !_ctx) return
  _engine.paused = isPaused
  const cfg = C.engine
  if (isPaused) {
    _fade(_engine.masterGain, _engine.masterGain.gain.value, 0, cfg.fadePauseMs)
  } else {
    const gain = cfg.gainIdle + (cfg.gainFull - cfg.gainIdle) * _engine.currentRpm
    _fade(_engine.masterGain, 0, _vol(gain), cfg.fadeResumeMs)
  }
}

/**
 * Reinicia el estado del audio al pulsar Retry.
 */
export function restartAudio() {
  _gameOverPlayed = false
  _crashPlayed = false
  _engine.currentRpm = 0
  _engine.paused = false

  if (!_ensureContext()) return

  if (!_engine.running) {
    _startEngine()
  } else {
    // Motor ya corriendo: solo resetear rpm
    const cfg = C.engine
    const t = _ctx.currentTime
    _engine.osc1?.frequency.setValueAtTime(cfg.osc1.idle, t)
    _engine.osc2?.frequency.setValueAtTime(cfg.osc2.idle, t)
    _engine.osc3?.frequency.setValueAtTime(cfg.osc3.idle, t)
    _engine.masterGain?.gain.cancelScheduledValues(t)
    _engine.masterGain?.gain.setValueAtTime(_vol(cfg.gainIdle), t)
    _engine.filter?.frequency.setValueAtTime(cfg.filterFreqIdle, t)
  }
}

// ── Efectos procedurales ──────────────────────────────────────────────────────

/** Moneda recogida — chime corto ascendente */
export function playCoin() {
  if (!_canPlay('coin') || !_ensureContext()) return
  _oneShot({ type: 'sine', freq: 880, freqEnd: 1760, gain: C.volume.coin, duration: 90 })
  // Segundo tono para darle brillo
  setTimeout(() => {
    if (_ctx && !_destroyed) {
      _oneShot({ type: 'sine', freq: 1320, freqEnd: 2200, gain: C.volume.coin * 0.5, duration: 70 })
    }
  }, 40)
}

/** Combustible recogido — power-up con vibrato */
export function playFuel() {
  if (!_canPlay('fuel') || !_ensureContext()) return
  // Tono principal con sweep
  _oneShot({ type: 'sine', freq: 440, freqEnd: 660, gain: C.volume.fuel, duration: 160 })
  // Armónico para textura
  _oneShot({ type: 'triangle', freq: 550, freqEnd: 880, gain: C.volume.fuel * 0.4, duration: 120 })
}

/** Salto — sweep descendente muy sutil */
export function playJump() {
  if (!_canPlay('jump') || !_ensureContext()) return
  _oneShot({ type: 'sine', freq: 310, freqEnd: 180, gain: C.volume.jump, gainEnd: 0, duration: 130 })
}

/** Aterrizaje — ruido filtrado; intensidad ∝ velocidad vertical */
export function playLanding(verticalVelocity = 5) {
  if (!_canPlay('landing') || !_ensureContext()) return
  // vy normalizado 0..1 (cap en 20 unidades de física)
  const intensity = Math.min(1, Math.abs(verticalVelocity) / 20)
  const vol = C.volume.landing * (0.3 + 0.7 * intensity)
  const filterEnd = 200 + 600 * intensity
  _noiseShot({ gainVal: vol, filterFreq: 1200 + 1000 * intensity, filterFreqEnd: filterEnd, filterQ: 1.5, duration: 120 + 80 * intensity })
}

/** Choque — ruido burst + sweep filtrado */
export function playCrash() {
  if (_crashPlayed) return
  _crashPlayed = true
  if (!_ensureContext()) return

  // Bajar motor rápido
  if (_engine.running && _engine.masterGain) {
    _fade(_engine.masterGain, _engine.masterGain.gain.value, 0, 400)
  }

  // Ruido de impacto
  _noiseShot({ gainVal: C.volume.crash, filterFreq: 2000, filterFreqEnd: 150, filterQ: 0.8, duration: 420 })

  // Tono grave de impacto
  setTimeout(() => {
    if (_ctx && !_destroyed) {
      _oneShot({ type: 'sine', freq: 120, freqEnd: 55, gain: C.volume.crash * 0.6, duration: 250 })
    }
  }, 20)
}

/** Game Over — arpeggio descendente arcade */
export function playGameOver() {
  if (_gameOverPlayed) return
  _gameOverPlayed = true
  if (!_ensureContext()) return

  const notes = [523.25, 392, 329.63] // C5 → G4 → E4
  const gVol = C.volume.gameOver
  notes.forEach((freq, i) => {
    setTimeout(() => {
      if (_ctx && !_destroyed) {
        _oneShot({ type: 'square', freq, freqEnd: freq * 0.95, gain: gVol * (1 - i * 0.15), gainEnd: 0, duration: 280 })
        _oneShot({ type: 'sine', freq: freq * 0.5, gain: gVol * 0.3, duration: 300 })
      }
    }, i * 230)
  })
}

/** Motor se apaga por fuel=0 — pitch baja antes del game over */
export function playFuelOut() {
  if (!_engine.running || !_ctx) return
  const cfg = C.engine
  const t = _ctx.currentTime
  const d = cfg.fadeGameOverMs / 1000

  // Pitch baja dramáticamente
  _engine.osc1?.frequency.linearRampToValueAtTime(30, t + d * 0.7)
  _engine.osc2?.frequency.linearRampToValueAtTime(42, t + d * 0.7)
  _engine.osc3?.frequency.linearRampToValueAtTime(15, t + d * 0.7)
  _fade(_engine.masterGain, _engine.masterGain.gain.value, 0, cfg.fadeGameOverMs)
  _engine.running = false
}

/** UI click — tono discreto */
export function playUiClick() {
  if (!_ensureContext()) return
  _oneShot({ type: 'sine', freq: 1200, gain: C.volume.ui, gainEnd: 0, duration: 35 })
}

/** Pausa activada */
export function playPause() {
  if (!_ensureContext()) return
  _oneShot({ type: 'sine', freq: 600, freqEnd: 400, gain: C.volume.pause, gainEnd: 0, duration: 90 })
}

/** Mute global on/off — persiste en localStorage */
export function setMuted(isMuted) {
  _muted = isMuted
  try { localStorage.setItem(C.muteKey, String(isMuted)) } catch { /* ignore */ }
  if (!_masterGain) return
  const t = _ctx?.currentTime ?? 0
  _masterGain.gain.setTargetAtTime(isMuted ? 0 : C.volume.master, t, 0.05)
}

/** Lee el estado mute actual */
export function isMuted() {
  return _muted
}

/** Lee el estado mute desde localStorage (para inicializar UI) */
export function readMutedPref() {
  try { return localStorage.getItem(C.muteKey) === 'true' } catch { /* ignore */ }
}
