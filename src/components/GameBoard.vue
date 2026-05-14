<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({ game: { type: Object, required: true } })

const LADDERS = computed(() => props.game.ladders.value)
const SNAKES = computed(() => props.game.snakes.value)

const particles = ref([])
const shake = ref(false)
let particleId = 0

watch(() => props.game.lastEvent.value, (ev) => {
  if (!ev) return
  const from = posToCoord(ev.from)
  const to = posToCoord(ev.to)
  const isLadder = ev.type === 'ladder'
  const count = isLadder ? 9 : 11
  const emojis = isLadder ? ['✨', '⭐', '💫', '✨'] : ['💨', '💨', '🟢', '💨']
  const dur = isLadder ? 1100 : 900

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const jitter = isLadder ? 3 : 5
    const x = from.left + (to.left - from.left) * t + (Math.random() - 0.5) * jitter
    const y = from.top  + (to.top  - from.top)  * t + (Math.random() - 0.5) * jitter
    const id = ++particleId
    particles.value.push({
      id,
      x, y,
      emoji: emojis[i % emojis.length],
      delay: i * (isLadder ? 70 : 50),
      kind: isLadder ? 'spark' : 'puff'
    })
    setTimeout(() => {
      particles.value = particles.value.filter((p) => p.id !== id)
    }, dur + i * (isLadder ? 70 : 50) + 200)
  }

  if (!isLadder) {
    shake.value = true
    setTimeout(() => { shake.value = false }, 450)
  }
})

const cells = computed(() => {
  const arr = []
  for (let displayRow = 0; displayRow < 10; displayRow++) {
    const boardRow = 10 - displayRow                  // 10..1
    for (let col = 0; col < 10; col++) {
      let n
      if (boardRow % 2 === 1) n = (boardRow - 1) * 10 + col + 1
      else                    n = (boardRow - 1) * 10 + (10 - col)
      arr.push({ n, displayRow, col })
    }
  }
  return arr
})

function posToCoord(pos) {
  if (pos < 1) return { left: 50, top: 105, off: true }
  const boardRow = Math.ceil(pos / 10)
  const displayRow = 10 - boardRow
  const offsetInRow = pos - (boardRow - 1) * 10
  const col = (boardRow % 2 === 1) ? (offsetInRow - 1) : (10 - offsetInRow)
  return { left: (col + 0.5) * 10, top: (displayRow + 0.5) * 10, off: false }
}

const playerVisuals = computed(() => {
  const byCell = {}
  for (const p of props.game.players) {
    if (!byCell[p.position]) byCell[p.position] = []
    byCell[p.position].push(p)
  }
  return props.game.players.map((p) => {
    const group = byCell[p.position]
    const idx = group.indexOf(p)
    const total = group.length
    const c = posToCoord(p.position)
    const angle = total === 1 ? 0 : (idx / total) * Math.PI * 2
    const radius = total === 1 ? 0 : 2.0
    return {
      ...p,
      left: c.left + Math.cos(angle) * radius,
      top:  c.top  + Math.sin(angle) * radius,
      off:  c.off,
      phase: p.animPhase
    }
  })
})

function ladderGeom(from, to) {
  const a = posToCoord(from)
  const b = posToCoord(to)
  const dx = b.left - a.left, dy = b.top - a.top
  const L = Math.sqrt(dx * dx + dy * dy)
  if (L === 0) return null
  const ux = dx / L, uy = dy / L
  const px = -uy, py = ux
  const w = 1.6     // half-width of ladder
  const rails = [
    { x1: a.left + w * px, y1: a.top + w * py, x2: b.left + w * px, y2: b.top + w * py },
    { x1: a.left - w * px, y1: a.top - w * py, x2: b.left - w * px, y2: b.top - w * py }
  ]
  const rungCount = Math.max(3, Math.round(L / 3.2))
  const rungs = []
  for (let i = 0; i < rungCount; i++) {
    const t = (i + 0.5) / rungCount
    const cx = a.left + t * dx
    const cy = a.top + t * dy
    rungs.push({
      x1: cx + w * px, y1: cy + w * py,
      x2: cx - w * px, y2: cy - w * py
    })
  }
  return { rails, rungs }
}

function snakeGeom(from, to) {
  const head = posToCoord(from)  // head at higher cell (where you land)
  const tail = posToCoord(to)
  const dx = tail.left - head.left, dy = tail.top - head.top
  const L = Math.sqrt(dx * dx + dy * dy)
  if (L === 0) return null
  const ux = dx / L, uy = dy / L
  const px = -uy, py = ux
  const wave = Math.min(7, L * 0.22)
  const c1 = { x: head.left + dx * 0.3 + px * wave,  y: head.top + dy * 0.3 + py * wave }
  const c2 = { x: head.left + dx * 0.7 - px * wave,  y: head.top + dy * 0.7 - py * wave }
  const path = `M ${head.left} ${head.top} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${tail.left} ${tail.top}`
  // Head faces AWAY from body — direction from c1 to head
  const hAngle = Math.atan2(head.top - c1.y, head.left - c1.x) * 180 / Math.PI
  return { path, head, tail, hAngle }
}

const ladders = computed(() =>
  Object.entries(LADDERS.value).map(([f, t]) => ({ from: +f, to: +t, g: ladderGeom(+f, +t) }))
)
const snakes = computed(() =>
  Object.entries(SNAKES.value).map(([f, t]) => ({ from: +f, to: +t, g: snakeGeom(+f, +t) }))
)

const ladderEndSet = computed(() => new Set(Object.values(LADDERS.value)))
const snakeEndSet  = computed(() => new Set(Object.values(SNAKES.value)))

function cellClass(n) {
  if (LADDERS.value[n]) return 'ladder-start'
  if (ladderEndSet.value.has(n)) return 'ladder-end'
  if (SNAKES.value[n]) return 'snake-start'
  if (snakeEndSet.value.has(n)) return 'snake-end'
  return ''
}
</script>

<template>
  <div class="board-wrap">
    <div class="board" :class="{ shake: shake }">
      <div
        v-for="cell in cells"
        :key="cell.n"
        :class="['cell', cellClass(cell.n), { dark: (cell.displayRow + cell.col) % 2 === 0 }]">
        <span class="cell-num">{{ cell.n }}</span>
        <span v-if="LADDERS[cell.n]" class="cell-arrow up" aria-label="climb">
          <svg viewBox="0 0 24 24" width="100%" height="100%">
            <path d="M12 4 L12 20 M12 4 L6 10 M12 4 L18 10"
              stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
          <span class="arrow-target">{{ LADDERS[cell.n] }}</span>
        </span>
        <span v-else-if="SNAKES[cell.n]" class="cell-arrow down" aria-label="fall">
          <svg viewBox="0 0 24 24" width="100%" height="100%">
            <path d="M12 20 L12 4 M12 20 L6 14 M12 20 L18 14"
              stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
          <span class="arrow-target">{{ SNAKES[cell.n] }}</span>
        </span>

      </div>

      <svg class="overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="snake-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0"   stop-color="#16a34a"/>
            <stop offset="0.5" stop-color="#22c55e"/>
            <stop offset="1"   stop-color="#15803d"/>
          </linearGradient>
          <linearGradient id="snake-belly" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#fde68a"/>
            <stop offset="1" stop-color="#facc15"/>
          </linearGradient>

          <filter id="drop" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="0.4"/>
            <feOffset dx="0.3" dy="0.5" result="off"/>
            <feFlood flood-color="#000" flood-opacity="0.45"/>
            <feComposite in2="off" operator="in"/>
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <!-- Ladders -->
        <g v-for="l in ladders" :key="'l' + l.from">
          <template v-if="l.g">
            <!-- center guide trail (faint dashed) -->
            <line
              :x1="(l.g.rails[0].x1 + l.g.rails[1].x1)/2"
              :y1="(l.g.rails[0].y1 + l.g.rails[1].y1)/2"
              :x2="(l.g.rails[0].x2 + l.g.rails[1].x2)/2"
              :y2="(l.g.rails[0].y2 + l.g.rails[1].y2)/2"
              stroke="#fbbf24" stroke-width="0.35" stroke-dasharray="1 0.7" opacity="0.55"/>
            <g filter="url(#drop)">
              <!-- rail outline (darker) -->
              <line v-for="(r, i) in l.g.rails" :key="'rlo' + i"
                :x1="r.x1" :y1="r.y1" :x2="r.x2" :y2="r.y2"
                stroke="#451a03" stroke-width="1.45" stroke-linecap="round"/>
              <!-- rail body -->
              <line v-for="(r, i) in l.g.rails" :key="'rl' + i"
                :x1="r.x1" :y1="r.y1" :x2="r.x2" :y2="r.y2"
                stroke="#b45309" stroke-width="1.15" stroke-linecap="round"/>
              <!-- rungs -->
              <line v-for="(rg, i) in l.g.rungs" :key="'rg' + i"
                :x1="rg.x1" :y1="rg.y1" :x2="rg.x2" :y2="rg.y2"
                stroke="#f59e0b" stroke-width="0.85" stroke-linecap="round"/>
              <!-- rail highlight (thin bright stripe) -->
              <line v-for="(r, i) in l.g.rails" :key="'hl' + i"
                :x1="r.x1" :y1="r.y1" :x2="r.x2" :y2="r.y2"
                stroke="#fde68a" stroke-width="0.3" stroke-linecap="round" opacity="0.7"/>
            </g>
          </template>
        </g>

        <!-- Snakes -->
        <g v-for="s in snakes" :key="'s' + s.from">
          <template v-if="s.g">
            <!-- route trail under body (dashed red) -->
            <path :d="s.g.path" stroke="#fca5a5" stroke-width="0.5" fill="none"
              stroke-linecap="round" stroke-dasharray="1.4 0.9" opacity="0.65"/>
            <!-- shadow underbody -->
            <path :d="s.g.path" stroke="#052e16" stroke-width="4.6" fill="none"
              stroke-linecap="round" opacity="0.75"/>
            <!-- main body (thicker) -->
            <path :d="s.g.path" stroke="url(#snake-grad)" stroke-width="3.4" fill="none"
              stroke-linecap="round"/>
            <!-- scale stripes -->
            <path :d="s.g.path" stroke="#052e16" stroke-width="3.2" fill="none"
              stroke-linecap="round" stroke-dasharray="0.5 1.6" opacity="0.5"/>
            <!-- belly highlight -->
            <path :d="s.g.path" stroke="#bbf7d0" stroke-width="1.0" fill="none"
              stroke-linecap="round" opacity="0.55"/>

            <!-- Head (faces outward, away from body) -->
            <g :transform="`translate(${s.g.head.left} ${s.g.head.top}) rotate(${s.g.hAngle})`" filter="url(#drop)">
              <path d="M -0.8 -2.2 Q 3.2 -2.6 3.6 0 Q 3.2 2.6 -0.8 2.2 Z"
                fill="url(#snake-grad)" stroke="#052e16" stroke-width="0.3"/>
              <path d="M 0 -1.8 Q 2.2 -2.1 3.0 -0.6" stroke="#052e16" stroke-width="0.25" fill="none" opacity="0.55"/>
              <circle cx="1.2" cy="-1.05" r="0.55" fill="#fde047"/>
              <circle cx="1.2" cy="1.05"  r="0.55" fill="#fde047"/>
              <ellipse cx="1.3" cy="-1.05" rx="0.22" ry="0.4" fill="#000"/>
              <ellipse cx="1.3" cy="1.05"  rx="0.22" ry="0.4" fill="#000"/>
              <circle cx="1.4" cy="-1.18" r="0.1" fill="#fff"/>
              <circle cx="1.4" cy="0.92"  r="0.1" fill="#fff"/>
              <path d="M 1.4 0 Q 2.8 0 3.4 0" stroke="#7f1d1d" stroke-width="0.28" fill="none" stroke-linecap="round"/>
              <path d="M 3.4 0 L 4.8 0 M 4.8 0 L 5.6 -0.5 M 4.8 0 L 5.6 0.5"
                stroke="#dc2626" stroke-width="0.28" fill="none" stroke-linecap="round"/>
            </g>

            <!-- Tail tip -->
            <circle :cx="s.g.tail.left" :cy="s.g.tail.top" r="0.9" fill="#15803d" stroke="#052e16" stroke-width="0.25"/>
          </template>
        </g>
      </svg>

      <!-- Particle layer (sparkles / smoke) -->
      <span
        v-for="part in particles"
        :key="part.id"
        :class="['particle', part.kind]"
        :style="{
          left: part.x + '%',
          top: part.y + '%',
          animationDelay: part.delay + 'ms'
        }">{{ part.emoji }}</span>

      <div
        v-for="p in playerVisuals"
        :key="p.id"
        class="token"
        :class="{
          off: p.off,
          active: game.currentTurn.value === p.id,
          climbing: p.phase === 'climbing',
          falling: p.phase === 'falling'
        }"
        :style="{
          left: p.left + '%',
          top: p.top + '%',
          '--c': p.color.token,
          '--g': p.color.glow,
          zIndex: p.phase ? 80 + p.id : 50 + p.id
        }">
        <span class="token-inner">{{ p.id + 1 }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  padding: 4px;
  background: linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.08));
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: 0 20px 50px -20px rgba(0,0,0,0.5);
}
.board {
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(10, 1fr);
  gap: 1px;
  background: var(--border);
  border-radius: 16px;
  overflow: hidden;
}
.cell {
  position: relative;
  background: var(--surface);
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  font-size: clamp(8px, 1.8vw, 10px);
  color: var(--text-muted);
  padding: 2px 3px;
}
.cell.dark { background: color-mix(in srgb, var(--surface) 80%, var(--card)); }
.cell-num {
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  position: relative;
  z-index: 1;
}

.cell-arrow {
  position: absolute;
  bottom: 1px;
  right: 1px;
  display: flex;
  align-items: center;
  gap: 1px;
  padding: 1px 3px 1px 1px;
  border-radius: 6px;
  z-index: 20;
  pointer-events: none;
  line-height: 1;
  font-size: clamp(7px, 1.5vw, 9px);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.cell-arrow svg {
  width: clamp(8px, 2vw, 12px);
  height: clamp(8px, 2vw, 12px);
  flex-shrink: 0;
  filter: drop-shadow(0 0 2px rgba(0,0,0,0.4));
}
.cell-arrow.up {
  color: #fde047;
  background: rgba(146, 64, 14, 0.55);
  border: 1px solid rgba(253, 224, 71, 0.6);
}
.cell-arrow.down {
  color: #fecaca;
  background: rgba(127, 29, 29, 0.55);
  border: 1px solid rgba(254, 202, 202, 0.6);
}
.arrow-target {
  text-shadow: 0 1px 1px rgba(0,0,0,0.6);
}
.cell.ladder-start { background: color-mix(in srgb, #fbbf24 10%, var(--surface)); }
.cell.ladder-end   { background: color-mix(in srgb, #fbbf24 5%, var(--surface)); }
.cell.snake-start  { background: color-mix(in srgb, #ef4444 10%, var(--surface)); }
.cell.snake-end    { background: color-mix(in srgb, #10b981 6%, var(--surface)); }

.overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.token {
  position: absolute;
  width: 7%;
  height: 7%;
  border-radius: 50%;
  background: var(--c);
  transform: translate(-50%, -50%);
  transition: left .35s cubic-bezier(.34,1.56,.64,1), top .35s cubic-bezier(.34,1.56,.64,1);
  display: grid;
  place-items: center;
  color: white;
  font-size: clamp(8px, 1.8vw, 11px);
  font-weight: 800;
  box-shadow: 0 3px 10px var(--g), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.2);
  border: 1.5px solid rgba(255,255,255,0.9);
  z-index: 50;
}
.token.off { opacity: 0.4; }
.token.active { animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse {
  0%, 100% { box-shadow: 0 3px 10px var(--g), 0 0 0 0 var(--g), inset 0 2px 4px rgba(255,255,255,0.4); }
  50%      { box-shadow: 0 3px 10px var(--g), 0 0 0 8px transparent, inset 0 2px 4px rgba(255,255,255,0.4); }
}

/* ─── Climb animation (ladder) ─── */
.token.climbing {
  transition:
    left .85s cubic-bezier(.18, .89, .32, 1.18),
    top  .85s cubic-bezier(.18, .89, .32, 1.18);
  animation: climbing-wiggle .85s ease-in-out;
  filter: drop-shadow(0 0 12px #fde047);
}
@keyframes climbing-wiggle {
  0%   { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
  20%  { transform: translate(-50%, -50%) rotate(-12deg) scale(1.18); }
  40%  { transform: translate(-50%, -50%) rotate(8deg) scale(1.22); }
  60%  { transform: translate(-50%, -50%) rotate(-6deg) scale(1.18); }
  80%  { transform: translate(-50%, -50%) rotate(4deg) scale(1.1); }
  100% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
}

/* ─── Fall animation (snake) ─── */
.token.falling {
  transition:
    left .7s cubic-bezier(.55, 0, .85, .25),
    top  .7s cubic-bezier(.55, 0, .85, .25);
  animation: falling-spin .7s cubic-bezier(.5, 0, .9, .4);
  filter: drop-shadow(0 0 12px #34d399);
}
@keyframes falling-spin {
  0%   { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
  30%  { transform: translate(-50%, -50%) rotate(180deg) scale(0.78); }
  60%  { transform: translate(-50%, -50%) rotate(540deg) scale(0.72); }
  85%  { transform: translate(-50%, -50%) rotate(720deg) scale(1.18); }
  100% { transform: translate(-50%, -50%) rotate(720deg) scale(1); }
}

.token-inner {
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  line-height: 1;
}

/* ─── Particles ─── */
.particle {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
  user-select: none;
  z-index: 60;
  opacity: 0;
  will-change: transform, opacity;
}
.particle.spark {
  font-size: clamp(10px, 1.8vw, 14px);
  animation: spark-burst 1.1s ease-out forwards;
  filter: drop-shadow(0 0 4px #fde047);
}
@keyframes spark-burst {
  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.2) rotate(0deg); }
  20%  { opacity: 1; transform: translate(-50%, -50%) scale(1.3) rotate(40deg); }
  60%  { opacity: 0.9; transform: translate(-50%, -50%) scale(1.1) rotate(180deg); }
  100% { opacity: 0; transform: translate(-50%, -160%) scale(0.6) rotate(280deg); }
}
.particle.puff {
  font-size: clamp(10px, 2.2vw, 16px);
  animation: puff-fall .9s ease-out forwards;
  filter: blur(0.5px);
}
@keyframes puff-fall {
  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
  15%  { opacity: 0.95; transform: translate(-50%, -50%) scale(1.2); }
  100% { opacity: 0; transform: translate(-50%, 50%) scale(1.6); }
}

/* ─── Board shake (snake) ─── */
.board.shake {
  animation: board-shake .45s cubic-bezier(.36, .07, .19, .97);
}
@keyframes board-shake {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-4px, 1px); }
  25% { transform: translate(4px, -2px); }
  40% { transform: translate(-3px, 2px); }
  55% { transform: translate(3px, -1px); }
  70% { transform: translate(-2px, 1px); }
  85% { transform: translate(2px, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .token.climbing, .token.falling { animation: none; }
  .particle { animation: none; opacity: 0; }
  .board.shake { animation: none; }
}
</style>
