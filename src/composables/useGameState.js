import { ref, computed, reactive } from 'vue'
import { playDice, playLadder, playSnake, playStep, playWin } from './useSound.js'

// ─── Board layouts ────────────────────────────────────────────
// Each layout: ladders map (from < to, climb up) + snakes map (from > to, slide down).
// Constraint: no cell may be both a ladder-start and snake-head (or end).

export const LAYOUTS = [
  {
    id: 'classic',
    name: 'Classic',
    emoji: '🎲',
    desc: 'Balanced. 11 ladders, 10 snakes — the original layout.',
    ladders: {
      2: 38, 7: 14, 8: 31, 15: 26, 21: 42,
      28: 84, 36: 44, 51: 67, 71: 91, 78: 98, 87: 94
    },
    snakes: {
      16: 6, 46: 25, 49: 11, 62: 19, 64: 60,
      74: 53, 89: 68, 92: 88, 95: 75, 99: 80
    }
  },
  {
    id: 'chaos',
    name: 'Chaos',
    emoji: '🌪️',
    desc: 'Mayhem. 10 ladders, 11 snakes — short hops, action everywhere.',
    ladders: {
      3: 22, 5: 8, 11: 26, 20: 29, 27: 56,
      33: 49, 40: 59, 51: 68, 63: 81, 79: 97
    },
    snakes: {
      17: 4, 24: 7, 32: 10, 44: 14, 50: 18,
      60: 30, 67: 35, 73: 41, 86: 55, 92: 61, 98: 64
    }
  },
  {
    id: 'long-climb',
    name: 'Long Climb',
    emoji: '🏔️',
    desc: 'Dramatic. 6 ladders, 6 snakes — fewer pieces but huge swings.',
    ladders: {
      4: 56, 12: 48, 28: 84, 36: 77, 50: 91, 71: 92
    },
    snakes: {
      47: 26, 62: 18, 87: 24, 93: 73, 95: 55, 98: 79
    }
  },
  {
    id: 'random',
    name: 'Random',
    emoji: '🔀',
    desc: 'A fresh board every game — generated on the fly.',
    isRandom: true,
    ladders: {},
    snakes: {}
  }
]

// ─── Random layout generator ──────────────────────────────────
// Procedurally builds ladders + snakes with no cell collisions.
// Constraints: ladders climb (from < to), snakes fall (from > to),
// min length 8 cells, both endpoints in [2..99] (cell 1 and 100 reserved).
export function generateRandomLayout() {
  const used = new Set()
  const ladders = {}
  const snakes = {}

  const ladderCount = 9 + Math.floor(Math.random() * 4)   // 9–12
  const snakeCount  = 9 + Math.floor(Math.random() * 4)   // 9–12

  function pickFree(min, max) {
    for (let tries = 0; tries < 60; tries++) {
      const c = min + Math.floor(Math.random() * (max - min + 1))
      if (!used.has(c)) return c
    }
    return null
  }

  for (let i = 0; i < ladderCount; i++) {
    const from = pickFree(2, 80)
    if (from == null) break
    const minTo = Math.min(from + 8, 99)
    const maxTo = Math.min(from + 55, 99)
    if (maxTo < minTo) continue
    const to = pickFree(minTo, maxTo)
    if (to == null) continue
    ladders[from] = to
    used.add(from)
    used.add(to)
  }

  for (let i = 0; i < snakeCount; i++) {
    const from = pickFree(20, 99)
    if (from == null) break
    const maxTo = Math.max(from - 8, 2)
    const minTo = Math.max(from - 55, 2)
    if (maxTo < minTo) continue
    const to = pickFree(minTo, maxTo)
    if (to == null) continue
    snakes[from] = to
    used.add(from)
    used.add(to)
  }

  return {
    id: 'random',
    name: 'Random',
    emoji: '🔀',
    desc: 'A fresh board every game — generated on the fly.',
    isRandom: true,
    ladders,
    snakes
  }
}

export const PLAYER_COLORS = [
  { name: 'Red',    token: '#ef4444', glow: 'rgba(239,68,68,0.6)' },
  { name: 'Blue',   token: '#3b82f6', glow: 'rgba(59,130,246,0.6)' },
  { name: 'Green',  token: '#10b981', glow: 'rgba(16,185,129,0.6)' },
  { name: 'Yellow', token: '#f59e0b', glow: 'rgba(245,158,11,0.6)' }
]

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

export function useGameState() {
  const mode = ref('menu')          // 'menu' | 'playing' | 'won'
  const playerCount = ref(2)
  const vsAI = ref(true)
  const layoutId = ref('classic')
  const generatedLayout = ref(null)
  const players = reactive([])
  const currentTurn = ref(0)
  const dice = ref(null)
  const isRolling = ref(false)
  const isMoving = ref(false)
  const winner = ref(null)
  const message = ref('')
  const lastEvent = ref(null)

  const currentLayout = computed(() => {
    if (layoutId.value === 'random' && generatedLayout.value) return generatedLayout.value
    return LAYOUTS.find((l) => l.id === layoutId.value) || LAYOUTS[0]
  })
  const ladders = computed(() => currentLayout.value.ladders)
  const snakes = computed(() => currentLayout.value.snakes)

  const currentPlayer = computed(() => players[currentTurn.value])
  const isAITurn = computed(() => vsAI.value && currentTurn.value !== 0 && mode.value === 'playing')

  function startGame({ players: count, vsAI: ai, layout }) {
    playerCount.value = count
    vsAI.value = ai
    if (layout) layoutId.value = layout
    // Generate a fresh random board on each Play if Random is selected
    if (layoutId.value === 'random') {
      generatedLayout.value = generateRandomLayout()
    }
    players.splice(0, players.length)
    for (let i = 0; i < count; i++) {
      players.push({
        id: i,
        name: ai && i > 0 ? `Bot ${i}` : `Player ${i + 1}`,
        position: 0,
        color: PLAYER_COLORS[i],
        isAI: ai && i > 0
      })
    }
    currentTurn.value = 0
    dice.value = null
    winner.value = null
    lastEvent.value = null
    message.value = ''
    mode.value = 'playing'
  }

  function goToMenu() {
    mode.value = 'menu'
    winner.value = null
  }

  async function rollDice() {
    if (isRolling.value || isMoving.value || mode.value !== 'playing') return
    playDice()
    isRolling.value = true
    message.value = ''
    lastEvent.value = null

    const flickerSteps = 10
    for (let i = 0; i < flickerSteps; i++) {
      dice.value = 1 + Math.floor(Math.random() * 6)
      await wait(60)
    }
    const finalValue = 1 + Math.floor(Math.random() * 6)
    dice.value = finalValue
    isRolling.value = false

    await wait(350)
    await movePlayer(finalValue)
  }

  async function movePlayer(steps) {
    isMoving.value = true
    const player = players[currentTurn.value]
    const start = player.position
    let target = start + steps

    if (target > 100) {
      target = 100 - (target - 100)
      message.value = `${player.name} overshot — bouncing back to ${target}`
    } else {
      message.value = `${player.name} moves to ${target}`
    }

    for (let pos = start + 1; pos <= start + steps && pos <= 100; pos++) {
      player.position = pos
      playStep()
      await wait(180)
    }
    if (start + steps > 100) {
      for (let pos = 100 - 1; pos >= target; pos--) {
        player.position = pos
        playStep()
        await wait(180)
      }
    }

    await wait(250)

    if (player.position === 100) {
      winner.value = player
      mode.value = 'won'
      playWin()
      isMoving.value = false
      return
    }

    const L = ladders.value
    const S = snakes.value
    if (L[player.position]) {
      const from = player.position
      const to = L[from]
      lastEvent.value = { type: 'ladder', from, to }
      message.value = `🪜 Ladder! ${from} → ${to}`
      await wait(400)
      playLadder()
      player.position = to
      await wait(600)
    } else if (S[player.position]) {
      const from = player.position
      const to = S[from]
      lastEvent.value = { type: 'snake', from, to }
      message.value = `🐍 Snake! ${from} → ${to}`
      await wait(400)
      playSnake()
      player.position = to
      await wait(600)
    }

    if (player.position === 100) {
      winner.value = player
      mode.value = 'won'
      playWin()
      isMoving.value = false
      return
    }

    currentTurn.value = (currentTurn.value + 1) % players.length
    isMoving.value = false

    if (isAITurn.value) {
      await wait(700)
      rollDice()
    }
  }

  return {
    mode, players, currentTurn, currentPlayer,
    dice, isRolling, isMoving, winner, message,
    lastEvent, vsAI, isAITurn,
    layoutId, currentLayout, ladders, snakes,
    startGame, rollDice, goToMenu
  }
}
