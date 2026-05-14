// Web Audio API sound effects + haptic vibration.
// Reactive muted state persisted to localStorage.
import { ref, watch } from 'vue'

const STORAGE_KEY = 'snakes-ladders-muted-v1'

let ctx = null
let masterGain = null

function loadMuted() {
  try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
}
const muted = ref(loadMuted())
watch(muted, (v) => {
  try { localStorage.setItem(STORAGE_KEY, v ? '1' : '0') } catch {}
  if (masterGain) masterGain.gain.value = v ? 0 : 0.7
})

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    masterGain = ctx.createGain()
    masterGain.gain.value = muted.value ? 0 : 0.7
    masterGain.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function setMuted(v) { muted.value = !!v }
export function isMuted() { return muted.value }
export function toggleMute() { muted.value = !muted.value }
export function useMute() { return muted }

// ─── Haptics ────────────────────────────────────────────────
// Vibration honours the mute state (mute = silence + no buzz).
function vibrate(pattern) {
  if (muted.value) return
  if (typeof navigator === 'undefined' || !navigator.vibrate) return
  try { navigator.vibrate(pattern) } catch {}
}

// ─── Internal helpers ───────────────────────────────────────
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

// ─── SFX ────────────────────────────────────────────────────
export function playDice() {
  vibrate([20, 30, 20, 30, 20, 30, 40])
  const c = getCtx(); if (!c || muted.value) return
  const now = c.currentTime
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

let stepFlip = 0
export function playStep() {
  const c = getCtx(); if (!c || muted.value) return
  const now = c.currentTime
  stepFlip ^= 1
  const dur = 0.07
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

export function playLadder() {
  vibrate([25, 20, 25, 20, 25, 20, 30])
  const c = getCtx(); if (!c || muted.value) return
  const now = c.currentTime
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
  vibrate(120)
  const c = getCtx(); if (!c || muted.value) return
  const now = c.currentTime
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

export function playWin() {
  vibrate([40, 40, 40, 40, 40, 40, 120])
  const c = getCtx(); if (!c || muted.value) return
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
