<script setup lang="ts">
import { ref, computed } from 'vue';

const emit = defineEmits(['scoreChange']);

const gameState = ref('initial'); // initial, countdown, flying, input, result
const countdownValue = ref(3);
const flyingText = ref('Ca nyou read me'); // This can be replaced with a random text generator
const playerGuess = ref('');
const score = ref(0);

// Function to calculate similarity between two strings (0-100)
const calculateSimilarity = (a: string, b: string): number => {
    if (a.length === 0 && b.length === 0) return 100;
    if (a.length === 0 || b.length === 0) return 0;

    // Case insensitive comparison and remove extra spaces
    const normalizedA = a.toLowerCase().trim().replace(/\s+/g, ' ');
    const normalizedB = b.toLowerCase().trim().replace(/\s+/g, ' ');

    if (normalizedA === normalizedB) return 100;

    // Simple scoring based on character matching
    let matches = 0;
    const maxLength = Math.max(normalizedA.length, normalizedB.length);
    const minLength = Math.min(normalizedA.length, normalizedB.length);

    for (let i = 0; i < minLength; i++) {
        if (normalizedA[i] === normalizedB[i]) {
            matches++;
        }
    }

    return Math.round((matches / maxLength) * 100);
};

const startGame = () => {
    gameState.value = 'countdown';
    countdownValue.value = 3;
    playerGuess.value = '';

    const countdownInterval = setInterval(() => {
        countdownValue.value -= 1;

        if (countdownValue.value === 0) {
            clearInterval(countdownInterval);
            gameState.value = 'flying';

            // After text flies for a set duration, show input
            setTimeout(() => {
                gameState.value = 'input';
            }, 2000); // Text flies for 2 seconds
        }
    }, 1000);
};

const submitGuess = () => {
    score.value = calculateSimilarity(flyingText.value, playerGuess.value);
    gameState.value = 'result';
    emit('scoreChange', score.value); // Emit the score to the parent
};

const playAgain = () => {
    gameState.value = 'initial';
};

// Computed properties for animation classes
const flyingTextClass = computed(() => {
    return gameState.value === 'flying' ? 'flying-animation' : '';
});
</script>

<template>
    <div class="game-container">
        <!-- Initial state -->
        <div v-if="gameState === 'initial'" class="start-screen">
            <h2>Text Catching Game</h2>
            <p>Try to remember the text as it flies across the screen!</p>
            <button @click="startGame" class="start-button">Start Game</button>
        </div>

        <!-- Countdown state -->
        <div v-else-if="gameState === 'countdown'" class="countdown-screen">
            <div class="countdown-number">{{ countdownValue }}</div>
        </div>

        <!-- Flying text state -->
        <div v-else-if="gameState === 'flying'" class="flying-text-container">
            <div :class="flyingTextClass" class="flying-text">{{ flyingText }}</div>
        </div>

        <!-- Input state -->
        <div v-else-if="gameState === 'input'" class="input-screen">
            <h3>What did the text say?</h3>
            <input v-model="playerGuess" class="guess-input" type="text" placeholder="Type what you saw...">
            <button @click="submitGuess" class="submit-button">Submit</button>
        </div>

        <!-- Result state -->
        <div v-else-if="gameState === 'result'" class="result-screen">
            <h3>Your score: {{ score }}/100</h3>
            <p>The text was: "{{ flyingText }}"</p>
            <p>Your guess: "{{ playerGuess }}"</p>
            <button @click="playAgain" class="play-again-button">Play Again</button>
        </div>
    </div>
</template>

<style scoped>
.game-container {
    max-width: 600px;
    height: 400px;
    margin: 0 auto;
    text-align: center;
    position: relative;
    border: 1px solid #ccc;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.start-button,
.submit-button,
.play-again-button {
    background-color: #4CAF50;
    border: none;
    color: white;
    padding: 15px 32px;
    text-align: center;
    font-size: 16px;
    margin: 10px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.start-button:hover,
.submit-button:hover,
.play-again-button:hover {
    background-color: #45a049;
}

.countdown-number {
    font-size: 5rem;
    font-weight: bold;
    color: #333;
    animation: pulse 1s infinite;
}

.flying-text-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
}

.flying-text {
    font-size: 2rem;
    white-space: nowrap;
    position: absolute;
    color: #333;
}

.flying-animation {
    animation: fly 2s linear forwards;
}

.guess-input {
    padding: 10px;
    font-size: 16px;
    border: 2px solid #ccc;
    border-radius: 4px;
    width: 80%;
    margin: 20px 0;
}

@keyframes fly {
    0% {
        left: -100%;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0;
    }

    10% {
        opacity: 1;
    }

    90% {
        opacity: 1;
    }

    100% {
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0;
    }
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.1);
    }

    100% {
        transform: scale(1);
    }
}
</style>
