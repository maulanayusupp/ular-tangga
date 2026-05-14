<script setup>
import { computed, ref } from 'vue'

const props = defineProps({ game: { type: Object, required: true } })
const w = computed(() => props.game.winner.value)
const seed = computed(() => props.game.activeSeed.value)

const copyState = ref('idle')  // 'idle' | 'copied' | 'error'

function shareUrl() {
  const url = new URL(window.location.href)
  url.search = ''
  url.searchParams.set('layout', 'random')
  url.searchParams.set('seed', seed.value)
  return url.toString()
}

async function shareBoard() {
  const url = shareUrl()
  try {
    if (navigator.share) {
      await navigator.share({
        title: 'Snakes & Ladders',
        text: `Try this random board (seed ${seed.value})`,
        url
      })
      return
    }
    await navigator.clipboard.writeText(url)
    copyState.value = 'copied'
    setTimeout(() => (copyState.value = 'idle'), 2000)
  } catch {
    copyState.value = 'error'
    setTimeout(() => (copyState.value = 'idle'), 2000)
  }
}

const confetti = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 0.6,
  duration: 1.5 + Math.random() * 1.5,
  color: ['#8b5cf6','#06b6d4','#f59e0b','#ef4444','#10b981','#ec4899'][i % 6],
  rotate: Math.random() * 360
}))

function playAgain() {
  props.game.startGame({
    players: props.game.players.length,
    vsAI: props.game.vsAI.value
  })
}
</script>

<template>
  <div class="modal-backdrop">
    <div class="confetti-wrap" aria-hidden="true">
      <span
        v-for="c in confetti"
        :key="c.id"
        class="confetti"
        :style="{
          left: c.left + '%',
          background: c.color,
          animationDelay: c.delay + 's',
          animationDuration: c.duration + 's',
          '--r': c.rotate + 'deg'
        }" />
    </div>

    <div class="modal">
      <div class="trophy">🏆</div>
      <h2>Congratulations!</h2>
      <p class="winner-name" :style="{ color: w.color.token }">
        {{ w.name }} wins!
      </p>

      <div v-if="seed" class="seed-row">
        <span class="seed-label">Random seed</span>
        <code class="seed-code">{{ seed }}</code>
        <button class="seed-share" @click="shareBoard" :class="copyState">
          <span v-if="copyState === 'idle'">📤 Share</span>
          <span v-else-if="copyState === 'copied'">✓ Copied!</span>
          <span v-else>⚠ Failed</span>
        </button>
      </div>

      <div class="actions">
        <button class="btn primary" @click="playAgain">Play Again</button>
        <button class="btn ghost" @click="game.goToMenu()">Menu</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  z-index: 100;
  padding: 20px;
}
.modal {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 32px 24px;
  text-align: center;
  max-width: 360px;
  width: 100%;
  box-shadow: 0 30px 60px -10px rgba(0,0,0,0.6);
  animation: pop .4s cubic-bezier(.34,1.56,.64,1);
}
@keyframes pop {
  from { transform: scale(0.8); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
.trophy {
  font-size: 64px;
  animation: bounce 1s ease-in-out infinite;
}
@keyframes bounce {
  0%,100% { transform: translateY(0) rotate(-3deg); }
  50%     { transform: translateY(-8px) rotate(3deg); }
}
h2 {
  margin: 6px 0 4px;
  font-size: 28px;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.winner-name {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 20px;
}

.seed-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 20px;
}
.seed-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  font-weight: 700;
}
.seed-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  background: rgba(139,92,246,0.18);
  border: 1px solid rgba(139,92,246,0.35);
  padding: 3px 9px;
  border-radius: 6px;
  letter-spacing: 0.05em;
}
.seed-share {
  background: rgba(255,255,255,0.06);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all .2s ease;
}
.seed-share:hover { border-color: rgba(139,92,246,0.5); }
.seed-share:active { transform: scale(0.96); }
.seed-share.copied {
  background: rgba(16,185,129,0.2);
  border-color: rgba(16,185,129,0.5);
  color: #bbf7d0;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.btn {
  padding: 14px;
  border-radius: 14px;
  border: none;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: transform .15s ease;
}
.btn:active { transform: scale(0.97); }
.btn.primary {
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  color: white;
  box-shadow: 0 8px 20px -4px rgba(139,92,246,0.5);
}
.btn.ghost {
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
}

.confetti-wrap {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.confetti {
  position: absolute;
  top: -10px;
  width: 8px;
  height: 14px;
  border-radius: 2px;
  animation: fall linear forwards;
  transform: rotate(var(--r));
}
@keyframes fall {
  to { transform: translateY(120vh) rotate(calc(var(--r) + 720deg)); opacity: 0.4; }
}
</style>
