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
    <header class="menu-header">
      <div class="logo">
        <span class="logo-emoji">🪜</span>
        <span class="logo-emoji snake">🐍</span>
      </div>
      <h1>Snakes &amp; Ladders</h1>
      <p class="tagline">Climb ladders, dodge snakes. First to 100 wins!</p>
    </header>

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
    </section>

    <button class="play-btn" @click="play">
      Play Now
      <span class="arrow">→</span>
    </button>

    <footer class="menu-footer">
      <p>Made with Vue · v0.1</p>
    </footer>
  </main>
</template>

<style scoped>
.menu {
  min-height: 100dvh;
  padding: max(env(safe-area-inset-top), 24px) 20px max(env(safe-area-inset-bottom), 24px);
  display: flex;
  flex-direction: column;
  gap: 22px;
  max-width: 480px;
  margin: 0 auto;
}

.menu-header {
  text-align: center;
  padding: 20px 0 4px;
}
.logo {
  display: inline-flex;
  gap: 10px;
  font-size: 56px;
  filter: drop-shadow(0 4px 18px rgba(139,92,246,0.4));
}
.logo-emoji {
  animation: float 3s ease-in-out infinite;
  display: inline-block;
}
.logo-emoji.snake { animation-delay: 1.5s; }
@keyframes float {
  0%,100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(-4deg); }
}

h1 {
  margin: 14px 0 6px;
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.tagline {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
}

.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 20px;
  backdrop-filter: blur(20px);
}
.card h2 {
  margin: 0 0 14px;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  font-weight: 600;
}

.mode-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.mode-btn {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 18px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all .25s ease;
  color: var(--text);
}
.mode-btn:active { transform: scale(0.97); }
.mode-btn.active {
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.1));
  box-shadow: 0 0 0 4px rgba(139,92,246,0.12);
}
.mode-icon { font-size: 28px; }
.mode-title { font-weight: 600; font-size: 14px; }
.mode-desc { font-size: 12px; color: var(--text-muted); }

.player-count { margin-top: 18px; }
.player-count label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--text-muted);
}
.count-pills { display: flex; gap: 8px; }
.pill {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: 1.5px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-weight: 600;
  cursor: pointer;
  transition: all .2s ease;
}
.pill.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.play-btn {
  margin-top: auto;
  padding: 18px;
  border-radius: 18px;
  border: none;
  background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
  color: white;
  font-size: 17px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 10px 30px -5px rgba(139,92,246,0.5);
  transition: transform .2s ease, box-shadow .2s ease;
}
.play-btn:active {
  transform: scale(0.98);
  box-shadow: 0 6px 20px -4px rgba(139,92,246,0.4);
}
.arrow { transition: transform .2s ease; }
.play-btn:hover .arrow { transform: translateX(4px); }

.menu-footer {
  text-align: center;
  color: var(--text-muted);
  font-size: 12px;
}
.menu-footer p { margin: 0; }
</style>
