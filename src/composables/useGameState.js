import { ref, computed, reactive } from 'vue'
import { playDice, playLadder, playSnake, playStep, playWin } from './useSound.js'

export const LADDERS = {
  2: 38, 7: 14, 8: 31, 15: 26, 21: 42,
  28: 84, 36: 44, 51: 67, 71: 91, 78: 98, 87: 94
}

export const SNAKES = {
  16: 6, 46: 25, 49: 11, 62: 19, 64: 60,
  74: 53, 89: 68, 92: 88, 95: 75, 99: 80
}

export const PLAYER_COLORS = [
  { name: 'Merah', token: '#ef4444', glow: 'rgba(239,68,68,0.6)' },
  { name: 'Biru',  token: '#3b82f6', glow: 'rgba(59,130,246,0.6)' },
  { name: 'Hijau', token: '#10b981', glow: 'rgba(16,185,129,0.6)' },
  { name: 'Kuning', token: '#f59e0b', glow: 'rgba(245,158,11,0.6)' }
]

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

export function useGameState() {
  const mode = ref('menu')          // 'menu' | 'playing' | 'won'
  const playerCount = ref(2)
  const vsAI = ref(true)
  const players = reactive([])
  const currentTurn = ref(0)
  const dice = ref(null)
  const isRolling = ref(false)
  const isMoving = ref(false)
  const winner = ref(null)
  const message = ref('')
  const lastEvent = ref(null)       // { type: 'ladder'|'snake', from, to }

  const currentPlayer = computed(() => players[currentTurn.value])
  const isAITurn = computed(() => vsAI.value && currentTurn.value !== 0 && mode.value === 'playing')

  function startGame({ players: count, vsAI: ai }) {
    playerCount.value = count
    vsAI.value = ai
    players.splice(0, players.length)
    for (let i = 0; i < count; i++) {
      players.push({
        id: i,
        name: ai && i > 0 ? `Bot ${i}` : `Pemain ${i + 1}`,
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

    // visual roll: flicker for a moment
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
      // bounce back rule: jika lewat 100, mundur
      target = 100 - (target - 100)
      message.value = `${player.name} terlalu jauh, mundur ke ${target}`
    } else {
      message.value = `${player.name} jalan ke ${target}`
    }

    // step-by-step animation
    for (let pos = start + 1; pos <= start + steps && pos <= 100; pos++) {
      player.position = pos
      playStep()
      await wait(180)
    }
    // if bounced back, slide back
    if (start + steps > 100) {
      for (let pos = 100 - 1; pos >= target; pos--) {
        player.position = pos
        playStep()
        await wait(180)
      }
    }

    await wait(250)

    // check win
    if (player.position === 100) {
      winner.value = player
      mode.value = 'won'
      playWin()
      isMoving.value = false
      return
    }

    // check ladder/snake
    if (LADDERS[player.position]) {
      const from = player.position
      const to = LADDERS[from]
      lastEvent.value = { type: 'ladder', from, to }
      message.value = `🪜 Tangga! ${from} → ${to}`
      await wait(400)
      playLadder()
      player.position = to
      await wait(600)
    } else if (SNAKES[player.position]) {
      const from = player.position
      const to = SNAKES[from]
      lastEvent.value = { type: 'snake', from, to }
      message.value = `🐍 Ular! ${from} → ${to}`
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

    // next turn
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
    LADDERS, SNAKES,
    startGame, rollDice, goToMenu
  }
}
