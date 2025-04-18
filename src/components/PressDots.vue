<template>
    <div class="press-dots-container">
        <div v-if="!isGameActive && bubblesPopped === 0" class="start-screen">
            <h2>Bubble Pop Challenge</h2>
            <p>Pop all 10 bubbles as fast as you can!</p>
            <button @click="startGame" class="start-button">Start Game</button>
        </div>

        <div v-if="isGameActive" class="game-area" ref="gameArea">
            <div class="game-info">
                <span>Bubbles: {{ bubblesPopped }}/10</span>
            </div>

            <div v-for="bubble in bubbles" :key="bubble.id" class="bubble" :style="{
                left: bubble.x + 'px',
                top: bubble.y + 'px',
                width: bubble.size + 'px',
                height: bubble.size + 'px',
                backgroundColor: bubble.color
            }" @click="popBubble(bubble.id)"></div>
        </div>

        <div v-if="!isGameActive && bubblesPopped === 10" class="result-screen">
            <h2>Great job!</h2>
            <p>You popped all bubbles in:</p>
            <div class="score">{{ finalScore }} / 100 points</div>
            <button @click="resetGame" class="start-button">Play Again</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'PressDots',
    emits: ['scoreChange'], // Add emits option
    data() {
        return {
            isGameActive: false,
            bubblesPopped: 0,
            bubbles: [],
            startTime: 0,
            endTime: 0,
            finalScore: 0,
            bubbleCount: 0,
            maxActiveBubbles: 3,
            colors: ['#FF5252', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0']
        }
    },
    methods: {
        startGame() {
            this.isGameActive = true
            this.bubblesPopped = 0
            this.bubbles = []
            this.startTime = Date.now()
            this.spawnBubbles()
        },

        resetGame() {
            this.isGameActive = false
            this.bubblesPopped = 0
            this.bubbles = []
            this.finalScore = 0
        },

        endGame() {
            this.isGameActive = false
            this.endTime = Date.now()
            const timeTaken = (this.endTime - this.startTime) / 1000

            // Calculate score out of 100 - faster times get higher scores
            // Maximum 100 points at 1 second (very fast), minimum 10 points at 30+ seconds
            const maxTime = 30 // 30 seconds for minimum score
            const minScore = 10 // minimum score

            if (timeTaken <= 1) {
                this.finalScore = 100; // Perfect score for super fast completion
            } else {
                this.finalScore = Math.max(
                    minScore,
                    Math.floor(100 - ((timeTaken - 1) / maxTime) * (100 - minScore))
                );
            }

            // Emit the final score to the parent component
            this.$emit('scoreChange', this.finalScore);
        },

        createBubble() {
            if (this.bubbles.length >= this.maxActiveBubbles) return

            const gameArea = this.$refs.gameArea
            const areaWidth = gameArea.clientWidth
            const areaHeight = gameArea.clientHeight

            const size = Math.floor(Math.random() * 30) + 40 // Size between 40-70px
            const x = Math.floor(Math.random() * (areaWidth - size))
            const y = Math.floor(Math.random() * (areaHeight - size))
            const color = this.colors[Math.floor(Math.random() * this.colors.length)]

            this.bubbles.push({
                id: this.bubbleCount++,
                x,
                y,
                size,
                color
            })
        },

        popBubble(id) {
            const index = this.bubbles.findIndex(bubble => bubble.id === id)
            if (index !== -1) {
                this.bubbles.splice(index, 1)
                this.bubblesPopped++

                if (this.bubblesPopped >= 10) {
                    this.endGame()
                } else {
                    this.spawnBubbles()
                }
            }
        },

        spawnBubbles() {
            // Make sure we have enough bubbles
            const remaining = 10 - this.bubblesPopped
            const toCreate = Math.min(this.maxActiveBubbles, remaining) - this.bubbles.length

            for (let i = 0; i < toCreate; i++) {
                setTimeout(() => {
                    if (this.isGameActive && this.bubblesPopped < 10) {
                        this.createBubble()
                    }
                }, Math.random() * 500)
            }
        }
    }
}
</script>

<style scoped>
.press-dots-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #f5f5f5;
    color: black;
    touch-action: manipulation;
    user-select: none;
    overflow: hidden;
    position: relative;
}

.start-screen,
.result-screen {
    text-align: center;
    padding: 20px;
}

.game-area {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
}

.game-info {
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    /* This needs to be white to be visible against dark background */
    padding: 5px 10px;
    border-radius: 10px;
    font-size: 18px;
    z-index: 10;
}

.bubble {
    position: absolute;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: bubbleAppear 0.3s ease-out;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.start-button {
    background-color: #4CAF50;
    color: white;
    /* This should be white for better contrast on green button */
    border: none;
    padding: 15px 30px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 18px;
    margin: 20px 2px;
    cursor: pointer;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.score {
    font-size: 28px;
    font-weight: bold;
    margin: 20px 0;
    color: black;
}

@keyframes bubbleAppear {
    from {
        transform: scale(0);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

@media (max-width: 768px) {
    .bubble {
        transform: scale(0.9);
    }
}
</style>
