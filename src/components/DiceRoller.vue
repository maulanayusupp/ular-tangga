<script setup>
import { computed } from 'vue'

const props = defineProps({ game: { type: Object, required: true } })

const value = computed(() => props.game.dice.value ?? 1)
const disabled = computed(() =>
  props.game.isRolling.value ||
  props.game.isMoving.value ||
  props.game.isAITurn.value ||
  props.game.mode.value !== 'playing'
)

const pips = {
  1: [[1,1]],
  2: [[0,0],[2,2]],
  3: [[0,0],[1,1],[2,2]],
  4: [[0,0],[0,2],[2,0],[2,2]],
  5: [[0,0],[0,2],[1,1],[2,0],[2,2]],
  6: [[0,0],[0,2],[1,0],[1,2],[2,0],[2,2]]
}
</script>

<template>
  <button
    class="dice-btn"
    :disabled="disabled"
    @click="game.rollDice()"
    :aria-label="`Lempar dadu, hasil ${value}`">
    <div class="dice" :class="{ rolling: game.isRolling.value }">
      <div class="face">
        <span
          v-for="(p, i) in pips[value]"
          :key="i"
          class="pip"
          :style="{ gridRow: p[0] + 1, gridColumn: p[1] + 1 }" />
      </div>
    </div>
    <span class="dice-label">{{ disabled ? '…' : 'TAP' }}</span>
  </button>
</template>

<style scoped>
.dice-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  padding: 8px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.dice-btn:disabled { cursor: not-allowed; opacity: 0.7; }
.dice-btn:not(:disabled):active .dice { transform: scale(0.92); }

.dice {
  width: 72px;
  height: 72px;
  background: linear-gradient(145deg, #ffffff, #e2e8f0);
  border-radius: 16px;
  box-shadow:
    0 8px 24px -4px rgba(139,92,246,0.4),
    inset 0 2px 4px rgba(255,255,255,0.9),
    inset 0 -4px 8px rgba(0,0,0,0.08);
  display: grid;
  place-items: center;
  transition: transform .2s ease;
  position: relative;
}
.dice.rolling {
  animation: roll 0.6s linear infinite;
}
@keyframes roll {
  0%   { transform: rotate(0deg) scale(1); }
  25%  { transform: rotate(90deg) scale(0.95); }
  50%  { transform: rotate(180deg) scale(1.05); }
  75%  { transform: rotate(270deg) scale(0.95); }
  100% { transform: rotate(360deg) scale(1); }
}

.face {
  width: 56px;
  height: 56px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 2px;
  padding: 6px;
}
.pip {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #475569, #1e293b);
  align-self: center;
  justify-self: center;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.2);
}

.dice-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--text-muted);
}
</style>
