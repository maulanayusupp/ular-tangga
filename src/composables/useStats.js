// Local stats stored in localStorage. Module-level singleton so all components
// share the same reactive state.
import { reactive, watch } from 'vue'

const STORAGE_KEY = 'snakes-ladders-stats-v1'

function defaults() {
  return {
    gamesPlayed: 0,
    botWins: 0,
    botLosses: 0,
    fastestWinTurns: null,   // human win count in turns (vs bot only)
    longestSnakeFall: 0,     // max (from - to)
    streak: 0,               // consecutive days played
    bestStreak: 0,
    lastPlayDate: null       // 'YYYY-MM-DD'
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaults()
    return { ...defaults(), ...JSON.parse(raw) }
  } catch {
    return defaults()
  }
}

const stats = reactive(load())

watch(stats, (s) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch {}
}, { deep: true })

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dayDiff(aIso, bIso) {
  const a = new Date(aIso + 'T00:00:00')
  const b = new Date(bIso + 'T00:00:00')
  return Math.round((b - a) / 86400000)
}

function bumpStreak() {
  const today = todayKey()
  if (stats.lastPlayDate === today) return
  if (stats.lastPlayDate) {
    const diff = dayDiff(stats.lastPlayDate, today)
    if (diff === 1) stats.streak += 1
    else stats.streak = 1
  } else {
    stats.streak = 1
  }
  if (stats.streak > stats.bestStreak) stats.bestStreak = stats.streak
  stats.lastPlayDate = today
}

export function useStats() {
  return {
    stats,
    recordGameEnd({ humanWon, vsBot, turns }) {
      stats.gamesPlayed += 1
      if (vsBot) {
        if (humanWon) {
          stats.botWins += 1
          if (turns != null && (stats.fastestWinTurns == null || turns < stats.fastestWinTurns)) {
            stats.fastestWinTurns = turns
          }
        } else {
          stats.botLosses += 1
        }
      }
      bumpStreak()
    },
    recordSnakeFall(distance) {
      if (distance > stats.longestSnakeFall) stats.longestSnakeFall = distance
    },
    reset() { Object.assign(stats, defaults()) }
  }
}
