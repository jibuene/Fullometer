<script setup lang="ts">
import Game1 from '../components/Game1.vue';
import PressDots from '../components/PressDots.vue';
import AreYouWater from '../components/AreYouWater.vue';
import { ref } from 'vue';

const score = ref(0);

const updateScore = (newScore: number) => {
  score.value += newScore;
};
</script>

<template>
  <div class="card">
    Game 1
    <Game1 @scoreChange="updateScore" />
    <PressDots @scoreChange="updateScore" />
    <AreYouWater @scoreChange="updateScore" />
    <div>Score: {{ score }}</div>
  </div>
</template>

<style scoped></style>
