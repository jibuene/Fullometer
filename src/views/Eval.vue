<script setup lang="ts">
import Game1 from '../components/Game1.vue';
import PressDots from '../components/PressDots.vue';
import AreYouWater from '../components/AreYouWater.vue';
import { ref, computed } from 'vue';

const score = ref(0);
const currentGame = ref(0); // 0 = Game1, 1 = PressDots, 2 = AreYouWater, 3 = Completed all

const updateScore = (newScore: number) => {
  score.value += newScore;
  nextGame();
};

const nextGame = () => {
  currentGame.value += 1;
};

// Calculate fill percentage based on score (0-300)
const fillPercentage = computed(() => {
  const percent = (score.value / 300) * 100;
  return Math.min(100, Math.max(0, percent)); // Ensure between 0-100%
});
</script>

<template>
  <div class="card">
    <Game1 v-if="currentGame === 0" @scoreChange="updateScore" />
    <PressDots v-if="currentGame === 1" @scoreChange="updateScore" />
    <AreYouWater v-if="currentGame === 2" @scoreChange="updateScore" />
    <div v-if="currentGame === 3" class="completion-container">
      <h2>All games completed!</h2>
      <div>Final Score: {{ score }}</div>

      <div class="beer-glass-container">
        <div class="beer-glass">
          <div class="beer-foam"></div>
          <div class="beer-liquid" :style="{ height: `${fillPercentage}%` }"></div>
        </div>
        <div class="beer-handle"></div>
      </div>
      <div class="score-scale">
        <div>0</div>
        <div>300</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.completion-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.beer-glass-container {
  position: relative;
  margin: 40px 0;
  height: 300px;
  display: flex;
  align-items: center;
}

.beer-glass {
  position: relative;
  width: 150px;
  height: 250px;
  background-color: rgba(255, 255, 255, 0.3);
  border: 4px solid #ddd;
  border-radius: 5px 5px 40px 40px;
  overflow: hidden;
}

.beer-foam {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20px;
  background-color: white;
  border-radius: 5px 5px 10px 10px;
  z-index: 2;
}

.beer-liquid {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #f5cb42;
  background-image: linear-gradient(to bottom, #f5cb42, #e8a618);
  transition: height 1s ease-in-out;
  z-index: 1;
}

.beer-handle {
  width: 40px;
  height: 80px;
  border: 4px solid #ddd;
  border-left: none;
  border-radius: 0 15px 15px 0;
  margin-left: -2px;
}

.score-scale {
  display: flex;
  justify-content: space-between;
  width: 150px;
  margin-top: 10px;
  font-weight: bold;
}
</style>
