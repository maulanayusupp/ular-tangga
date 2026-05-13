// Web Audio API sound effects — no binary assets, all synthesized.
// Must be triggered from a user gesture on first call (browser policy).

let ctx = null
let masterGain = null
let muted = false

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    masterGain = ctx.createGain()
    masterGain.gain.value = 0.7
    masterGain.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function setMuted(v) {
  muted = !!v
  if (masterGain) masterGain.gain.value = muted ? 0 : 0.7
}
export function isMuted() { return muted }

function noiseBuffer(c, duration, fadeShape = 2) {
  const len = Math.floor(c.sampleRate * duration)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) {
    const env = Math.pow(1 - i / len, fadeShape)
    data[i] = (Math.random() * 2 - 1) * env
  }
  return buf
}

export function playDice() {
  const c = getCtx(); if (!c || muted) return
  const now = c.currentTime
  // 7 short clatter clicks
  for (let i = 0; i < 7; i++) {
    const t = now + i * 0.075 + Math.random() * 0.02
    const dur = 0.05
    const src = c.createBufferSource()
    src.buffer = noiseBuffer(c, dur, 3)
    const filt = c.createBiquadFilter()
    filt.type = 'bandpass'
    filt.frequency.value = 1200 + Math.random() * 2200
    filt.Q.value = 1.5
    const g = c.createGain()
    g.gain.value = 0.35
    src.connect(filt).connect(g).connect(masterGain)
    src.start(t)
    src.stop(t + dur)
  }
  // final thunk when dice lands
  const t = now + 0.62
  const osc = c.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(180, t)
  osc.frequency.exponentialRampToValueAtTime(80, t + 0.15)
  const g = c.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.3, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
  osc.connect(g).connect(masterGain)
  osc.start(t)
  osc.stop(t + 0.2)
}

export function playLadder() {
  const c = getCtx(); if (!c || muted) return
  const now = c.currentTime
  // ascending arpeggio: C5, E5, G5, C6, E6
  const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]
  notes.forEach((f, i) => {
    const t = now + i * 0.08
    const osc = c.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = f
    const g = c.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.22, t + 0.015)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
    osc.connect(g).connect(masterGain)
    osc.start(t)
    osc.stop(t + 0.2)
  })
  // sparkle layer
  const src = c.createBufferSource()
  src.buffer = noiseBuffer(c, 0.35, 1.5)
  const hp = c.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 4000
  const g = c.createGain()
  g.gain.value = 0.08
  src.connect(hp).connect(g).connect(masterGain)
  src.start(now)
}

export function playSnake() {
  const c = getCtx(); if (!c || muted) return
  const now = c.currentTime
  // descending slide whistle
  const osc = c.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(900, now)
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.65)
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.setValueAtTime(2400, now)
  lp.frequency.exponentialRampToValueAtTime(400, now + 0.65)
  const g = c.createGain()
  g.gain.setValueAtTime(0, now)
  g.gain.linearRampToValueAtTime(0.18, now + 0.04)
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.75)
  osc.connect(lp).connect(g).connect(masterGain)
  osc.start(now)
  osc.stop(now + 0.8)

  // hiss layer (snake-like)
  const src = c.createBufferSource()
  src.buffer = noiseBuffer(c, 0.7, 1.2)
  const bp = c.createBiquadFilter()
  bp.type = 'highpass'
  bp.frequency.value = 3500
  const hg = c.createGain()
  hg.gain.setValueAtTime(0.12, now)
  hg.gain.exponentialRampToValueAtTime(0.001, now + 0.7)
  src.connect(bp).connect(hg).connect(masterGain)
  src.start(now)
}

// Step/walking sound — soft tap on each cell advance. Alternates pitch
// slightly to feel like alternating footsteps.
let stepFlip = 0
export function playStep() {
  const c = getCtx(); if (!c || muted) return
  const now = c.currentTime
  stepFlip ^= 1
  const dur = 0.07
  // body: filtered noise burst (the "thud")
  const src = c.createBufferSource()
  src.buffer = noiseBuffer(c, dur, 4)
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = stepFlip ? 320 : 380
  bp.Q.value = 2.5
  const g = c.createGain()
  g.gain.value = 0.22
  src.connect(bp).connect(g).connect(masterGain)
  src.start(now)
  src.stop(now + dur)
  // pitch tap: short pluck
  const osc = c.createOscillator()
  osc.type = 'sine'
  const base = stepFlip ? 260 : 320
  osc.frequency.setValueAtTime(base, now)
  osc.frequency.exponentialRampToValueAtTime(base * 0.6, now + 0.05)
  const og = c.createGain()
  og.gain.setValueAtTime(0, now)
  og.gain.linearRampToValueAtTime(0.12, now + 0.004)
  og.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
  osc.connect(og).connect(masterGain)
  osc.start(now)
  osc.stop(now + 0.08)
}

export function playWin() {
  const c = getCtx(); if (!c || muted) return
  const now = c.currentTime
  const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]
  notes.forEach((f, i) => {
    const t = now + i * 0.11
    const osc = c.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = f
    const g = c.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.22, t + 0.02)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.45)
    osc.connect(g).connect(masterGain)
    osc.start(t)
    osc.stop(t + 0.5)
  })
}
