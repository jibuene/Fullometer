<template>
    <div class="level-game">

        <div v-if="!gameStarted" class="start-screen">
            <h1>Phone Stability Challenge</h1>
            <p>Hold your phone steady!</p>
            <p class="instructions">Hold your phone in front of you and try to keep it as still as possible for as long
                as possible. The game tracks all movements!</p>
            <button @click="requestPermissionAndStart">Start Game</button>
        </div>

        <div v-else class="game-container">
            <div class="level-container">
                <div class="bubble" :style="bubbleStyle"></div>
                <div class="level-line horizontal"></div>
                <div class="level-line vertical"></div>
            </div>

            <div class="stats">
                <div class="timer">Time: {{ timer }}s</div>
                <div class="score">Stability: {{ stabilityScore.toFixed(0) }}%</div>
            </div>

            <div v-if="gameEnded" class="end-screen">
                <h2>Game Over!</h2>
                <p>Your stability score: {{ finalScore.toFixed(0) }}%</p>
                <button @click="restartGame">Play Again</button>
            </div>
        </div>
    </div>
</template>

<script>
import { useDeviceMotion } from '@vueuse/core'
const {
    acceleration,
    accelerationIncludingGravity,
    rotationRate,
    interval,
    isSupported,
    ensurePermissions,
    permissionGranted,
} = useDeviceMotion()
export default {
    name: 'AreYouWater',
    // Add emits option to declare the scoreChange event
    emits: ['scoreChange'],
    data() {
        return {
            gameStarted: false,
            gameEnded: false,
            timer: 20,
            stabilityScore: 100,
            finalScore: 0,
            tiltX: 0,
            tiltY: 0,
            tiltZ: 0,
            rotX: 0,
            rotY: 0,
            rotZ: 0,
            lastAccelX: 0,
            lastAccelY: 0,
            lastAccelZ: 0,
            lastRotX: 0,
            lastRotY: 0,
            lastRotZ: 0,
            motionTracker: null,
            gameTimer: null,
            movementPenalty: 0.25, // Increased from 0.15 for more sensitivity
            motion: null,
            gameDelay: 1, // Countdown before scoring starts
        };
    },
    computed: {
        bubbleStyle() {
            // Calculate bubble position based on phone orientation
            const clampedX = Math.max(-25, Math.min(25, this.tiltX * 10));
            const clampedY = Math.max(-25, Math.min(25, this.tiltY * 10));

            // Scale the bubble based on Z-axis movement
            const scale = 1 + Math.min(0.5, Math.abs(this.tiltZ) * 0.3);

            return {
                transform: `translate(${clampedX}px, ${clampedY}px) scale(${scale})`,
                backgroundColor: this.getBubbleColor(),
            };
        }
    },
    methods: {
        requestPermissionAndStart() {
            this.motion = useDeviceMotion();
            this.motion.ensurePermissions().then(() => {
                this.permissionGranted = true;
                this.startGame();
            }).catch(() => {
                this.permissionGranted = false;
            });
        },

        startGame() {
            this.gameStarted = true;
            this.gameEnded = false;
            this.timer = 5;
            this.stabilityScore = 100;
            this.gameDelay = 1;

            // Countdown before game actually starts scoring
            const countdownTimer = setInterval(() => {
                this.gameDelay -= 1;
                if (this.gameDelay <= 0) {
                    clearInterval(countdownTimer);

                    // Initialize last values with current values
                    if (this.motion) {
                        this.lastAccelX = this.motion.accelerationIncludingGravity.x || 0;
                        this.lastAccelY = this.motion.accelerationIncludingGravity.y || 0;
                        this.lastAccelZ = this.motion.accelerationIncludingGravity.z || 0;
                        this.lastRotX = this.motion.rotationRate.alpha || 0;
                        this.lastRotY = this.motion.rotationRate.beta || 0;
                        this.lastRotZ = this.motion.rotationRate.gamma || 0;
                    }
                }
            }, 1000);

            // Start motion tracking using VueUse
            this.startMotionTracking();

            // Start timer
            this.gameTimer = setInterval(() => {
                this.timer -= 1;
                if (this.timer <= 0) {
                    this.endGame();
                }
            }, 1000);
        },

        startMotionTracking() {
            // Use interval to regularly check motion values from VueUse
            this.motionTracker = setInterval(() => {
                if (this.motion) {
                    // Get acceleration data from VueUse - all three axes
                    const accelerationX = this.motion.accelerationIncludingGravity.x || 0;
                    const accelerationY = this.motion.accelerationIncludingGravity.y || 0;
                    const accelerationZ = this.motion.accelerationIncludingGravity.z || 0;

                    // Get rotation data
                    const rotationX = this.motion.rotationRate.alpha || 0;
                    const rotationY = this.motion.rotationRate.beta || 0;
                    const rotationZ = this.motion.rotationRate.gamma || 0;

                    // Calculate changes from last measurement (jerk/stability)
                    const accelChangeX = Math.abs(accelerationX - this.lastAccelX);
                    const accelChangeY = Math.abs(accelerationY - this.lastAccelY);
                    const accelChangeZ = Math.abs(accelerationZ - this.lastAccelZ);
                    const rotChangeX = Math.abs(rotationX - this.lastRotX);
                    const rotChangeY = Math.abs(rotationY - this.lastRotY);
                    const rotChangeZ = Math.abs(rotationZ - this.lastRotZ);

                    // Update tilt values for visual bubble (just for visualization)
                    this.tiltX = accelChangeX / 2;
                    this.tiltY = accelChangeY / 2;
                    this.tiltZ = accelChangeZ / 2;

                    // Store current values for next comparison
                    this.lastAccelX = accelerationX;
                    this.lastAccelY = accelerationY;
                    this.lastAccelZ = accelerationZ;
                    this.lastRotX = rotationX;
                    this.lastRotY = rotationY;
                    this.lastRotZ = rotationZ;

                    // Calculate stability based on moment-to-moment changes
                    const accelChangeMagnitude = Math.sqrt(
                        Math.pow(accelChangeX, 2) +
                        Math.pow(accelChangeY, 2) +
                        Math.pow(accelChangeZ, 2)
                    );

                    const rotChangeFactor = 0.02; // Increased from 0.01 for more sensitivity
                    const rotChangeMagnitude = Math.sqrt(
                        Math.pow(rotChangeX, 2) +
                        Math.pow(rotChangeY, 2) +
                        Math.pow(rotChangeZ, 2)
                    ) * rotChangeFactor;

                    // Combined movement score - focus on changes between frames
                    const movementMagnitude = accelChangeMagnitude + rotChangeMagnitude;

                    // Reduce stability score based on instant movement
                    const threshold = 0.15; // Reduced from 0.25 for more sensitivity
                    if (movementMagnitude > threshold) {
                        this.stabilityScore = Math.max(0, this.stabilityScore -
                            this.movementPenalty * (movementMagnitude - threshold) * 10);
                    }
                    // Removed the else clause completely so score doesn't regenerate
                }
            }, 100); // Check 10 times per second
        },

        endGame() {
            // Clean up
            clearInterval(this.gameTimer);
            clearInterval(this.motionTracker);

            this.finalScore = this.stabilityScore;
            this.gameEnded = true;

            // Emit the final score to the parent component
            this.$emit('scoreChange', Math.round(this.finalScore));
        },

        restartGame() {
            this.gameEnded = false;
            this.gameStarted = false;
        },

        getBubbleColor() {
            // Color changes based on stability score
            if (this.stabilityScore > 75) {
                return '#4caf50'; // Green
            } else if (this.stabilityScore > 50) {
                return '#ffc107'; // Yellow
            } else if (this.stabilityScore > 25) {
                return '#ff9800'; // Orange
            } else {
                return '#f44336'; // Red
            }
        }
    },
    beforeUnmount() {
        // Clean up event listeners when component is destroyed
        if (this.motionTracker) {
            clearInterval(this.motionTracker);
        }
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
    }
};
</script>

<style scoped>
.level-game {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: black;
    font-family: Arial, sans-serif;
}

.start-screen,
.end-screen {
    text-align: center;
    padding: 20px;
    background-color: black;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 80%;
}

.instructions {
    font-size: 0.9rem;
    color: #666;
    margin: 20px 0;
}

button {
    padding: 12px 24px;
    background-color: #2196f3;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 20px;
}

.game-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    position: relative;
}

.level-container {
    width: 280px;
    height: 280px;
    border: 8px solid #78909c;
    border-radius: 50%;
    position: relative;
    margin-top: 50px;
    background-color: #efefef;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bubble {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #4caf50;
    position: absolute;
    transition: transform 0.1s ease-out, background-color 0.5s;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

/* Removed .bubble-target class since we removed that element */

.level-line {
    background-color: #78909c;
    position: absolute;
}

.horizontal {
    width: 90%;
    height: 1px;
}

.vertical {
    height: 90%;
    width: 1px;
}

.stats {
    margin-top: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 24px;
}

.timer,
.score {
    margin: 10px 0;
    font-weight: bold;
}

.end-screen {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    min-width: 280px;
}
</style>
