// ─────────────────────────────────────────────────────────────────────────────
// audioConfig.js — Valores centralizados de audio para Hillbreaker
// NO modificar directamente desde componentes; usar AudioManager.
// ─────────────────────────────────────────────────────────────────────────────

export const AUDIO_CONFIG = {
  // ── Volúmenes master por categoría (0..1) ──────────────────────────────────
  volume: {
    master: 0.75,
    engine: 0.22,   // motor: no debe tapar efectos
    coin:   0.45,
    fuel:   0.45,
    jump:   0.18,
    landing:0.40,
    crash:  0.70,
    gameOver:0.55,
    ui:     0.20,
    pause:  0.22,
  },

  // ── Motor procedural ────────────────────────────────────────────────────────
  engine: {
    // Frecuencias base (Hz) a rpm=0 (idle) y rpm=1 (full)
    osc1: { idle: 55,  full: 185 }, // sawtooth — fundamental
    osc2: { idle: 82,  full: 270 }, // square   — armónico
    osc3: { idle: 28,  full: 92  }, // sine     — sub-grave
    // Gains relativos de cada oscilador (sobre el gain del engine)
    osc1gain: 1.0,
    osc2gain: 0.32,
    osc3gain: 0.55,
    // Filter lowpass
    filterFreqIdle: 420,
    filterFreqFull: 1450,
    filterQ: 4.2,
    // Gain total del motor: idle → full
    gainIdle: 0.06,
    gainFull: 0.18,
    // Lerp de suavizado por frame
    lerpSpeed: 0.035,
    // Fade en pausa/game-over (ms)
    fadePauseMs: 200,
    fadeResumeMs: 300,
    fadeGameOverMs: 850,
  },

  // ── Cooldowns de efectos (ms) para evitar spam ─────────────────────────────
  cooldown: {
    coin:    80,
    fuel:    200,
    jump:    400,
    landing: 150,
    crash:   0,     // una sola vez, controlado por flag
    gameOver:0,
  },

  // ── localStorage key ────────────────────────────────────────────────────────
  muteKey: 'hillbreaker_audio_muted',
}
