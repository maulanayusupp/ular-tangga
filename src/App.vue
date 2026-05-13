<script setup>
import { useGameState } from './composables/useGameState.js'
import MainMenu from './components/MainMenu.vue'
import GameView from './components/GameView.vue'
import WinModal from './components/WinModal.vue'

const game = useGameState()
</script>

<template>
  <div class="app-shell">
    <Transition name="fade" mode="out-in">
      <MainMenu v-if="game.mode.value === 'menu'" :game="game" key="menu" />
      <GameView v-else :game="game" key="game" />
    </Transition>

    <Transition name="modal">
      <WinModal v-if="game.mode.value === 'won' && game.winner.value" :game="game" />
    </Transition>
  </div>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity .35s ease, transform .35s ease;
}
.fade-enter-from { opacity: 0; transform: translateY(8px); }
.fade-leave-to   { opacity: 0; transform: translateY(-8px); }

.modal-enter-active, .modal-leave-active { transition: opacity .3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
