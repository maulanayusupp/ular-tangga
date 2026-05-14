<script setup>
import { ref, computed, onMounted } from 'vue'
import { LAYOUTS } from '../composables/useGameState.js'
import { useStats } from '../composables/useStats.js'

const props = defineProps({ game: { type: Object, required: true } })

const step = ref(1)                 // 1 = board, 2 = mode
const layoutId = ref(props.game.layoutId.value || 'classic')
const mode = ref('ai')              // 'ai' | 'pvp'
const playerCount = ref(2)
const pendingSeed = ref(null)        // from URL ?seed=

const { stats } = useStats()

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const urlSeed = params.get('seed')
  const urlLayout = params.get('layout')
  if (urlSeed) {
    layoutId.value = urlLayout === 'random' || !urlLayout ? 'random' : layoutId.value
    pendingSeed.value = urlSeed
    // Strip seed from address bar so it doesn't replay on refresh
    if (window.history && window.history.replaceState) {
      const clean = new URL(window.location.href)
      clean.search = ''
      window.history.replaceState({}, '', clean.toString())
    }
  }
})

const selectedLayout = computed(() =>
  LAYOUTS.find((l) => l.id === layoutId.value) || LAYOUTS[0]
)

const hasStats = computed(() => stats.gamesPlayed > 0)

function counts(layout) {
  return {
    ladders: Object.keys(layout.ladders).length,
    snakes: Object.keys(layout.snakes).length
  }
}

function play() {
  props.game.startGame({
    players: mode.value === 'ai' ? 2 : playerCount.value,
    vsAI: mode.value === 'ai',
    layout: layoutId.value,
    seed: layoutId.value === 'random' ? pendingSeed.value : null
  })
  pendingSeed.value = null
}

// When user switches away from Random, clear pending seed (no longer relevant)
function selectLayout(id) {
  if (id !== 'random') pendingSeed.value = null
  layoutId.value = id
}
</script>

<template>
  <main class="menu">
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

    <header class="menu-header">
      <div class="logo">
        <span class="logo-emoji ladder">🪜</span>
        <span class="logo-emoji snake">🐍</span>
      </div>
      <h1>Snakes &amp; Ladders</h1>
      <p class="tagline">Climb ladders, dodge snakes.<br/>First to 100 wins!</p>
    </header>

    <!-- Step indicator -->
    <div class="steps" role="progressbar" :aria-valuenow="step" aria-valuemin="1" aria-valuemax="2">
      <button class="step-dot" :class="{ active: step >= 1, current: step === 1 }" @click="step = 1">
        <span class="dot-num">1</span>
        <span class="dot-label">Board</span>
      </button>
      <span class="step-line" :class="{ filled: step >= 2 }"></span>
      <div class="step-dot" :class="{ active: step >= 2, current: step === 2 }">
        <span class="dot-num">2</span>
        <span class="dot-label">Mode</span>
      </div>
    </div>

    <Transition :name="step === 2 ? 'slide-fwd' : 'slide-back'" mode="out-in">
      <!-- ─────────── STEP 1: BOARD ─────────── -->
      <div v-if="step === 1" key="s1" class="wizard-step">
        <section class="card">
          <h2>Choose Board</h2>
          <div class="layout-grid">
            <button
              v-for="L in LAYOUTS"
              :key="L.id"
              :class="['layout-card', { active: layoutId === L.id, random: L.isRandom }]"
              @click="selectLayout(L.id)">
              <span v-if="layoutId === L.id" class="check">✓</span>
              <span class="layout-emoji">{{ L.emoji }}</span>
              <span class="layout-name">{{ L.name }}</span>
              <span class="layout-desc">{{ L.desc }}</span>
              <span class="layout-counts">
                <template v-if="L.isRandom">
                  <span class="badge ladder">🪜 9–12</span>
                  <span class="badge snake">🐍 9–12</span>
                </template>
                <template v-else>
                  <span class="badge ladder">🪜 {{ counts(L).ladders }}</span>
                  <span class="badge snake">🐍 {{ counts(L).snakes }}</span>
                </template>
              </span>
              <span v-if="L.isRandom && pendingSeed && layoutId === L.id" class="seed-pill">
                seed: {{ pendingSeed }}
              </span>
            </button>
          </div>
        </section>

        <button class="play-btn" @click="step = 2">
          <span class="play-shine"></span>
          <span class="play-text">Next</span>
          <span class="arrow">→</span>
        </button>
      </div>

      <!-- ─────────── STEP 2: MODE ─────────── -->
      <div v-else key="s2" class="wizard-step">
        <button class="back-pill" @click="step = 1">
          <span class="back-arrow">←</span>
          <span class="back-emoji">{{ selectedLayout.emoji }}</span>
          <span class="back-name">{{ selectedLayout.name }}</span>
          <span class="back-edit">Change</span>
        </button>

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

        <div v-if="hasStats" class="stats-card">
          <div class="stats-head">
            <span class="stats-title">📊 Your stats</span>
            <span v-if="stats.streak > 0" class="streak-badge">
              🔥 {{ stats.streak }}-day streak
            </span>
          </div>
          <div class="stats-grid">
            <div class="stat">
              <span class="stat-num">{{ stats.botWins }}</span>
              <span class="stat-label">vs Bot wins</span>
            </div>
            <div class="stat">
              <span class="stat-num">{{ stats.fastestWinTurns ?? '—' }}</span>
              <span class="stat-label">Fastest (turns)</span>
            </div>
            <div class="stat">
              <span class="stat-num">{{ stats.longestSnakeFall || '—' }}</span>
              <span class="stat-label">Longest fall</span>
            </div>
            <div class="stat">
              <span class="stat-num">{{ stats.gamesPlayed }}</span>
              <span class="stat-label">Games played</span>
            </div>
          </div>
        </div>

        <div v-else class="stats-grid">
          <div class="stat">
            <span class="stat-num">{{ selectedLayout.isRandom ? '~10' : counts(selectedLayout).ladders }}</span>
            <span class="stat-label">Ladders</span>
          </div>
          <div class="stat">
            <span class="stat-num">{{ selectedLayout.isRandom ? '~10' : counts(selectedLayout).snakes }}</span>
            <span class="stat-label">Snakes</span>
          </div>
          <div class="stat">
            <span class="stat-num">{{ mode === 'ai' ? 2 : playerCount }}</span>
            <span class="stat-label">Players</span>
          </div>
        </div>

        <button class="play-btn" @click="play">
          <span class="play-shine"></span>
          <span class="play-text">Play Now</span>
          <span class="arrow">→</span>
        </button>
      </div>
    </Transition>

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
  gap: 16px;
  max-width: 520px;
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
  padding: 16px 0 0;
}
.logo {
  display: inline-flex;
  gap: 14px;
  font-size: 56px;
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
  margin: 12px 0 6px;
  font-size: clamp(30px, 8vw, 42px);
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
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

/* ═══════════════════ Step indicator ═══════════════════ */
.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 4px 0 2px;
}
.step-dot {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--text-muted);
  transition: color .2s ease;
}
.step-dot:disabled { cursor: default; }
.dot-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: rgba(255,255,255,0.03);
  font-size: 12px;
  font-weight: 800;
  display: grid;
  place-items: center;
  color: var(--text-muted);
  transition: all .25s ease;
}
.dot-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.step-dot.active .dot-num {
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 12px -2px rgba(139,92,246,0.5);
}
.step-dot.current { color: var(--text); }
.step-line {
  width: 40px;
  height: 2px;
  background: var(--border);
  border-radius: 2px;
  transition: background .35s ease;
}
.step-line.filled {
  background: linear-gradient(90deg, #8b5cf6, #06b6d4);
}

/* ═══════════════════ Wizard step transitions ═══════════════════ */
.wizard-step {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
}
.slide-fwd-enter-active, .slide-back-enter-active,
.slide-fwd-leave-active, .slide-back-leave-active {
  transition: opacity .3s ease, transform .35s cubic-bezier(.4,0,.2,1);
}
.slide-fwd-enter-from   { opacity: 0; transform: translateX(40px); }
.slide-fwd-leave-to     { opacity: 0; transform: translateX(-40px); }
.slide-back-enter-from  { opacity: 0; transform: translateX(-40px); }
.slide-back-leave-to    { opacity: 0; transform: translateX(40px); }

/* ═══════════════════ Card ═══════════════════ */
.card {
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 20px;
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

/* ═══════════════════ Layout grid (Step 1) ═══════════════════ */
.layout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.layout-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  text-align: left;
  background: rgba(255,255,255,0.02);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  color: var(--text);
  transition: all .25s ease;
  min-height: 160px;
}
.layout-card:hover { border-color: rgba(139,92,246,0.4); }
.layout-card:active { transform: scale(0.97); }
.layout-card.active {
  border-color: transparent;
  background:
    linear-gradient(135deg, rgba(139,92,246,0.18), rgba(6,182,212,0.12)) padding-box,
    linear-gradient(135deg, #8b5cf6, #06b6d4) border-box;
  box-shadow: 0 8px 20px -8px rgba(139,92,246,0.5);
}
.layout-emoji {
  font-size: 32px;
  line-height: 1;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
  margin-bottom: 4px;
}
.layout-name {
  font-weight: 700;
  font-size: 14px;
  line-height: 1.2;
}
.layout-desc {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.layout-counts {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: auto;
  padding-top: 6px;
}
.badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.badge.ladder { background: rgba(245,158,11,0.18); color: #fde68a; border: 1px solid rgba(245,158,11,0.35); }
.badge.snake  { background: rgba(16,185,129,0.18); color: #bbf7d0; border: 1px solid rgba(16,185,129,0.35); }

.layout-card.random .layout-emoji {
  animation: shuffle-spin 4s cubic-bezier(.4,0,.2,1) infinite;
}
@keyframes shuffle-spin {
  0%, 70% { transform: rotate(0deg); }
  85%     { transform: rotate(-12deg); }
  92%     { transform: rotate(12deg); }
  100%    { transform: rotate(0deg); }
}
.check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  color: white;
  font-size: 12px;
  font-weight: 900;
  display: grid;
  place-items: center;
  box-shadow: 0 4px 10px -2px rgba(139,92,246,0.5);
  z-index: 2;
}

/* ═══════════════════ Back-to-step-1 pill (Step 2) ═══════════════════ */
.back-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 6px 14px 6px 10px;
  color: var(--text);
  cursor: pointer;
  transition: all .2s ease;
  font-size: 13px;
  font-weight: 600;
}
.back-pill:hover { border-color: rgba(139,92,246,0.4); transform: translateX(-2px); }
.back-pill:active { transform: scale(0.97); }
.back-arrow { font-size: 16px; color: var(--text-muted); }
.back-emoji { font-size: 18px; line-height: 1; }
.back-name { font-weight: 700; }
.back-edit {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-left: 4px;
  padding: 2px 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 999px;
}

/* ═══════════════════ Mode grid ═══════════════════ */
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
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.stats-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 14px 14px 12px;
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
}
.stats-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.stats-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  font-weight: 700;
}
.streak-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(245,158,11,0.25), rgba(239,68,68,0.25));
  border: 1px solid rgba(245,158,11,0.4);
  color: #fde68a;
}
.stats-card .stats-grid {
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}
.stat {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 4px;
  text-align: center;
  transition: transform .25s ease, border-color .25s ease;
}
.stat:hover {
  transform: translateY(-2px);
  border-color: rgba(139,92,246,0.3);
}
.stat-num {
  display: block;
  font-size: 22px;
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
  font-size: 9.5px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-top: 4px;
  font-weight: 700;
}

.seed-pill {
  margin-top: 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  font-weight: 700;
  color: #fbcfe8;
  background: rgba(236,72,153,0.18);
  border: 1px solid rgba(236,72,153,0.4);
  padding: 2px 7px;
  border-radius: 6px;
  letter-spacing: 0.05em;
}

/* ═══════════════════ Play / Next button ═══════════════════ */
.play-btn {
  position: relative;
  margin-top: auto;
  padding: 18px;
  border-radius: 18px;
  border: none;
  background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
  color: white;
  font-size: 17px;
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
.play-text, .arrow { position: relative; z-index: 1; }
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
  .logo-emoji, h1, .play-shine, .play-btn::before,
  .layout-card.random .layout-emoji {
    animation: none !important;
  }
  .slide-fwd-enter-active, .slide-back-enter-active,
  .slide-fwd-leave-active, .slide-back-leave-active {
    transition: opacity .2s ease;
    transform: none;
  }
}
</style>
