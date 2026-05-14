<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import GameBoard from './GameBoard.vue'
import DiceRoller from './DiceRoller.vue'
import { useMute, toggleMute } from '../composables/useSound.js'

const props = defineProps({ game: { type: Object, required: true } })
const muted = useMute()

const turnHint = computed(() => {
  if (props.game.winner.value) return ''
  if (props.game.isRolling.value) return 'Rolling dice…'
  if (props.game.isMoving.value) return 'Token moving…'
  if (props.game.isAITurn.value) return 'Bot is thinking…'
  return 'Your turn — tap dice or press Space'
})

function handleKeydown(e) {
  if (e.code !== 'Space' && e.key !== ' ') return
  if (e.repeat) return
  if (props.game.mode.value !== 'playing') return
  const t = e.target
  if (!t) return
  // Skip when typing in inputs/contenteditable
  if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return
  // Skip when another focused button should handle Space natively (e.g., Back button, modal actions)
  if (t.tagName === 'BUTTON' && !t.closest('.dice-btn')) return
  e.preventDefault()
  props.game.rollDice()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <main class="game">
    <header class="game-header">
      <button class="icon-btn" @click="game.goToMenu()" aria-label="Back to menu">
        ←
      </button>
      <div class="layout-pill" :title="game.currentLayout.value.desc">
        <span>{{ game.currentLayout.value.emoji }}</span>
        <span>{{ game.currentLayout.value.name }}</span>
      </div>
      <div class="turn-info">
        <div class="players-row">
          <div
            v-for="p in game.players"
            :key="p.id"
            :class="['player-chip', { active: game.currentTurn.value === p.id }]"
            :style="{ '--c': p.color.token, '--g': p.color.glow }">
            <span class="dot"></span>
            <span class="pname">{{ p.name }}</span>
            <span class="ppos">{{ p.position }}</span>
          </div>
        </div>
      </div>
      <button
        class="icon-btn mute-btn"
        @click="toggleMute"
        :aria-label="muted ? 'Unmute sound' : 'Mute sound'"
        :title="muted ? 'Unmute' : 'Mute'">
        {{ muted ? '🔇' : '🔊' }}
      </button>
    </header>

    <GameBoard :game="game" />

    <div class="bottom-bar">
      <DiceRoller :game="game" />
      <div class="info">
        <Transition name="msg">
          <p v-if="game.message.value" class="status-msg" :key="game.message.value">
            {{ game.message.value }}
          </p>
        </Transition>
        <p class="turn-hint">{{ turnHint }}</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.game {
  min-height: 100dvh;
  padding: max(env(safe-area-inset-top), 10px) 6px max(env(safe-area-inset-bottom), 10px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 620px;
  margin: 0 auto;
}

.game-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--text);
  font-size: 18px;
  cursor: pointer;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.icon-btn:active { transform: scale(0.95); }

.layout-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--card);
  border: 1px solid var(--border);
  font-size: 12px;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  flex-shrink: 0;
}

.mute-btn { flex-shrink: 0; font-size: 16px; }

.turn-info { flex: 1; min-width: 0; }
.players-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 2px;
  scrollbar-width: none;
}
.players-row::-webkit-scrollbar { display: none; }

.player-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--card);
  border: 1.5px solid var(--border);
  font-size: 12px;
  white-space: nowrap;
  transition: all .3s ease;
}
.player-chip.active {
  border-color: var(--c);
  background: color-mix(in srgb, var(--c) 15%, var(--card));
  box-shadow: 0 0 0 3px var(--g);
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--c);
  box-shadow: 0 0 8px var(--c);
}
.pname { font-weight: 600; color: var(--text); }
.ppos { color: var(--text-muted); font-variant-numeric: tabular-nums; }

.bottom-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 4px 6px 0;
}
.info {
  min-width: 0;
  max-width: 280px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}
.status-msg {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--card);
  border: 1px solid var(--border);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.turn-hint {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
  text-align: left;
}

.msg-enter-active, .msg-leave-active { transition: all .3s ease; }
.msg-enter-from { opacity: 0; transform: translateY(6px); }
.msg-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
