<script setup>
import { ref } from 'vue'

const props = defineProps({ game: { type: Object, required: true } })

const mode = ref('ai')           // 'ai' | 'pvp'
const playerCount = ref(2)

function play() {
  props.game.startGame({
    players: mode.value === 'ai' ? 2 : playerCount.value,
    vsAI: mode.value === 'ai'
  })
}
</script>

<template>
  <main class="menu">
    <!-- Animated background layer -->
    <div class="bg-fx" aria-hidden="true">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
      <div class="grid"></div>

      <span class="float-emoji" style="--x:6%;--y:14%;--d:0s;--s:32px">🎲</span>
      <span class="float-emoji" style="--x:90%;--y:18%;--d:2.5s;--s:38px">🪜</span>
      <span class="float-emoji" style="--x:8%;--y:74%;--d:5s;--s:34px">🐍</span>
      <span class="float-emoji" style="--x:90%;--y:78%;--d:1.5s;--s:30px">🎲</span>
      <span class="float-emoji" style="--x:50%;--y:92%;--d:4s;--s:26px">🎯</span>

      <span class="float-num" style="--x:12%;--y:38%;--d:0s">100</span>
      <span class="float-num" style="--x:78%;--y:52%;--d:3s">7</span>
      <span class="float-num" style="--x:28%;--y:66%;--d:6s">42</span>
      <span class="float-num" style="--x:70%;--y:30%;--d:1.5s">25</span>

      <svg class="float-ladder" viewBox="0 0 100 200" style="--x:80%;--y:55%;--d:0s" aria-hidden="true">
        <line x1="20" y1="0" x2="20" y2="200" stroke="rgba(245,158,11,0.25)" stroke-width="6" stroke-linecap="round"/>
        <line x1="80" y1="0" x2="80" y2="200" stroke="rgba(245,158,11,0.25)" stroke-width="6" stroke-linecap="round"/>
        <line v-for="i in 7" :key="i" x1="10" :y1="i * 25" x2="90" :y2="i * 25" stroke="rgba(245,158,11,0.25)" stroke-width="4" stroke-linecap="round"/>
      </svg>
    </div>

    <!-- Hero -->
    <header class="menu-header">
      <div class="logo">
        <span class="logo-emoji ladder">🪜</span>
        <span class="logo-emoji snake">🐍</span>
      </div>
      <h1>Snakes &amp; Ladders</h1>
      <p class="tagline">Climb ladders, dodge snakes.<br/>First to 100 wins!</p>
    </header>

    <!-- Mode select -->
    <section class="card">
      <h2>Choose Mode</h2>
      <div class="mode-grid">
        <button
          :class="['mode-btn', { active: mode === 'ai' }]"
          @click="mode = 'ai'">
          <span class="mode-icon">🤖</span>
          <span class="mode-title">vs Bot</span>
          <span class="mode-desc">1 vs AI</span>
        </button>
        <button
          :class="['mode-btn', { active: mode === 'pvp' }]"
          @click="mode = 'pvp'">
          <span class="mode-icon">👥</span>
          <span class="mode-title">Pass &amp; Play</span>
          <span class="mode-desc">2–4 players</span>
        </button>
      </div>

      <Transition name="count">
        <div v-if="mode === 'pvp'" class="player-count">
          <label>Players</label>
          <div class="count-pills">
            <button
              v-for="n in [2, 3, 4]"
              :key="n"
              :class="['pill', { active: playerCount === n }]"
              @click="playerCount = n">{{ n }}</button>
          </div>
        </div>
      </Transition>
    </section>

    <!-- Stats -->
    <div class="stats">
      <div class="stat">
        <span class="stat-num">11</span>
        <span class="stat-label">Ladders</span>
      </div>
      <div class="stat">
        <span class="stat-num">10</span>
        <span class="stat-label">Snakes</span>
      </div>
      <div class="stat">
        <span class="stat-num">1–4</span>
        <span class="stat-label">Players</span>
      </div>
    </div>

    <!-- Play button -->
    <button class="play-btn" @click="play">
      <span class="play-shine"></span>
      <span class="play-text">Play Now</span>
      <span class="arrow">→</span>
    </button>

    <footer class="menu-footer">
      <p>Made with Vue · v0.1 · Press <kbd>Space</kbd> in-game to roll</p>
    </footer>
  </main>
</template>

<style scoped>
.menu {
  position: relative;
  min-height: 100dvh;
  padding: max(env(safe-area-inset-top), 24px) 20px max(env(safe-area-inset-bottom), 24px);
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 480px;
  margin: 0 auto;
}

/* ═══════════════════ Animated background ═══════════════════ */
.bg-fx {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: -1;
}
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform;
}
.blob-1 {
  width: 50vmax; height: 50vmax;
  background: #8b5cf6;
  top: -15%; left: -15%;
  opacity: 0.45;
  animation: blob-a 24s ease-in-out infinite;
}
.blob-2 {
  width: 45vmax; height: 45vmax;
  background: #06b6d4;
  bottom: -20%; right: -15%;
  opacity: 0.4;
  animation: blob-b 22s ease-in-out infinite;
}
.blob-3 {
  width: 35vmax; height: 35vmax;
  background: #ec4899;
  top: 35%; left: 45%;
  opacity: 0.28;
  animation: blob-c 26s ease-in-out infinite;
}
@keyframes blob-a {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(60px, 80px) scale(1.15); }
  66%      { transform: translate(120px, -40px) scale(0.92); }
}
@keyframes blob-b {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(-80px, -50px) scale(0.88); }
  66%      { transform: translate(-40px, 70px) scale(1.18); }
}
@keyframes blob-c {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  50%      { transform: translate(-80px, 100px) scale(1.25) rotate(180deg); }
}

.grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(139,92,246,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139,92,246,0.07) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, #000 20%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, #000 20%, transparent 80%);
}

.float-emoji {
  position: absolute;
  left: var(--x);
  top: var(--y);
  font-size: var(--s);
  opacity: 0.55;
  filter: drop-shadow(0 0 20px rgba(139,92,246,0.4));
  animation: drift 12s ease-in-out infinite;
  animation-delay: var(--d);
  will-change: transform;
}
@keyframes drift {
  0%, 100% { transform: translate(0, 0) rotate(-5deg); }
  50%      { transform: translate(18px, -32px) rotate(12deg); }
}

.float-num {
  position: absolute;
  left: var(--x);
  top: var(--y);
  font-family: system-ui, -apple-system, sans-serif;
  font-size: clamp(70px, 9vw, 130px);
  font-weight: 900;
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(139, 92, 246, 0.28);
  letter-spacing: -3px;
  user-select: none;
  animation: drift 18s ease-in-out infinite;
  animation-delay: var(--d);
  will-change: transform;
}

.float-ladder {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: 60px;
  height: 120px;
  opacity: 0.35;
  transform: rotate(-12deg);
  animation: sway 9s ease-in-out infinite;
  animation-delay: var(--d);
}
@keyframes sway {
  0%, 100% { transform: rotate(-12deg) translateY(0); }
  50%      { transform: rotate(-8deg) translateY(-12px); }
}

/* ═══════════════════ Hero ═══════════════════ */
.menu-header {
  text-align: center;
  padding: 24px 0 4px;
}
.logo {
  display: inline-flex;
  gap: 14px;
  font-size: 64px;
  filter: drop-shadow(0 8px 28px rgba(139,92,246,0.5));
}
.logo-emoji {
  display: inline-block;
  animation: float-y 3s ease-in-out infinite;
}
.logo-emoji.snake { animation-delay: 1.5s; }
@keyframes float-y {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(-10px) rotate(-6deg); }
}

h1 {
  margin: 16px 0 10px;
  font-size: clamp(36px, 9vw, 48px);
  font-weight: 900;
  letter-spacing: -0.025em;
  background: linear-gradient(90deg, #a78bfa 0%, #22d3ee 25%, #f0abfc 50%, #a78bfa 75%, #22d3ee 100%);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: shimmer 8s linear infinite;
}
@keyframes shimmer {
  to { background-position: -300% 0; }
}
.tagline {
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.5;
  margin: 0;
}

/* ═══════════════════ Card ═══════════════════ */
.card {
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 22px;
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  box-shadow: 0 20px 50px -20px rgba(0,0,0,0.5);
}
.card h2 {
  margin: 0 0 14px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  font-weight: 700;
}

.mode-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.mode-btn {
  position: relative;
  background: rgba(255,255,255,0.02);
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all .25s ease;
  color: var(--text);
  overflow: hidden;
}
.mode-btn:hover { border-color: rgba(139,92,246,0.4); }
.mode-btn:active { transform: scale(0.97); }
.mode-btn.active {
  border-color: transparent;
  background:
    linear-gradient(135deg, rgba(139,92,246,0.18), rgba(6,182,212,0.12)) padding-box,
    linear-gradient(135deg, #8b5cf6, #06b6d4) border-box;
  box-shadow:
    0 0 0 1px rgba(139,92,246,0.3),
    0 8px 25px -8px rgba(139,92,246,0.5);
}
.mode-icon { font-size: 32px; line-height: 1; }
.mode-title { font-weight: 700; font-size: 15px; }
.mode-desc { font-size: 12px; color: var(--text-muted); }

.player-count {
  margin-top: 18px;
  overflow: hidden;
}
.player-count label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 600;
}
.count-pills { display: flex; gap: 8px; }
.pill {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  border: 1.5px solid var(--border);
  background: rgba(255,255,255,0.02);
  color: var(--text);
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all .2s ease;
}
.pill:hover { border-color: rgba(139,92,246,0.4); }
.pill.active {
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  border-color: var(--primary);
  color: white;
  box-shadow: 0 6px 16px -4px rgba(139,92,246,0.5);
}

.count-enter-active, .count-leave-active {
  transition: opacity .25s ease, transform .25s ease, max-height .3s ease, margin-top .25s ease;
}
.count-enter-from, .count-leave-to {
  opacity: 0;
  transform: translateY(-6px);
  max-height: 0;
  margin-top: 0;
}
.count-enter-to, .count-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 120px;
  margin-top: 18px;
}

/* ═══════════════════ Stats ═══════════════════ */
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.stat {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 6px;
  text-align: center;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: transform .25s ease, border-color .25s ease;
}
.stat:hover {
  transform: translateY(-2px);
  border-color: rgba(139,92,246,0.3);
}
.stat-num {
  display: block;
  font-size: 26px;
  font-weight: 900;
  background: linear-gradient(135deg, #a78bfa, #22d3ee);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.stat-label {
  display: block;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin-top: 4px;
  font-weight: 700;
}

/* ═══════════════════ Play Button ═══════════════════ */
.play-btn {
  position: relative;
  margin-top: auto;
  padding: 20px;
  border-radius: 18px;
  border: none;
  background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
  color: white;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  box-shadow:
    0 10px 30px -5px rgba(139,92,246,0.55),
    0 0 0 1px rgba(139,92,246,0.2),
    inset 0 1px 0 rgba(255,255,255,0.25);
  transition: transform .15s ease, box-shadow .2s ease;
  overflow: hidden;
}
.play-btn::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 20px;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4, #ec4899, #8b5cf6);
  background-size: 200% 100%;
  z-index: -1;
  filter: blur(8px);
  opacity: 0.6;
  animation: btn-glow 6s linear infinite;
}
@keyframes btn-glow {
  to { background-position: 200% 0; }
}
.play-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%);
  transform: translateX(-100%);
  animation: shine 3.5s ease-in-out infinite;
}
@keyframes shine {
  0%       { transform: translateX(-100%); }
  60%, 100% { transform: translateX(100%); }
}
.play-text, .arrow {
  position: relative;
  z-index: 1;
}
.play-btn:active {
  transform: scale(0.98);
  box-shadow: 0 6px 20px -4px rgba(139,92,246,0.45);
}
.arrow { transition: transform .25s ease; }
.play-btn:hover .arrow { transform: translateX(5px); }

.menu-footer {
  text-align: center;
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.5;
}
.menu-footer p { margin: 0; }
kbd {
  display: inline-block;
  padding: 1px 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  background: rgba(255,255,255,0.08);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text);
}

/* ═══════════════════ Reduced motion ═══════════════════ */
@media (prefers-reduced-motion: reduce) {
  .blob, .float-emoji, .float-num, .float-ladder,
  .logo-emoji, h1, .play-shine, .play-btn::before {
    animation: none !important;
  }
}
</style>
