/**
 * Server-Side Validation Client
 * Sends game data to Firebase Cloud Functions for validation
 */

class ServerValidation {
    constructor() {
        this.functions = null;
        this.answerHistory = [];
        this.wordData = [];
        this.gameStartTime = null;
    }

    /**
     * Initialize Firebase Functions
     */
    async initialize() {
        try {
            // Import Firebase Functions
            const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/12.2.1/firebase-functions.js');
            
            this.functions = getFunctions();
            
            console.log('✅ Server validation initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize server validation:', error);
            return false;
        }
    }

    /**
     * Start tracking a new game
     */
    startGame(words) {
        this.answerHistory = [];
        this.wordData = words;
        this.gameStartTime = Date.now();
        console.log('🎮 Game tracking started');
    }

    /**
     * Record an answer
     */
    recordAnswer(wordIndex, userAnswer, isCorrect, timeSpent = 0) {
        if (wordIndex >= this.wordData.length) return;

        const answer = {
            wordIndex: wordIndex,
            userAnswer: userAnswer,
            correctAnswer: this.wordData[wordIndex].correct,
            isCorrect: isCorrect,
            timeSpent: timeSpent,
            timestamp: Date.now(),
            context: this.wordData[wordIndex].context,
            difficulty: this.wordData[wordIndex].difficulty
        };

        this.answerHistory.push(answer);
        console.log(`📝 Answer recorded: ${isCorrect ? 'Correct' : 'Wrong'}`);
    }

    /**
     * Submit game for server validation
     */
    async submitGame(gameData) {
        try {
            if (!this.functions) {
                throw new Error('Server validation not initialized');
            }

            const { httpsCallable } = await import('https://www.gstatic.com/firebasejs/12.2.1/firebase-functions.js');
            
            // Prepare data for server validation
            const validationData = {
                gameData: {
                    ...gameData,
                    gameDuration: Date.now() - this.gameStartTime,
                    playerName: gameData.playerName || 'Anonymous'
                },
                answerHistory: this.answerHistory,
                wordData: this.wordData
            };

            console.log('🔄 Submitting game for server validation...');
            console.log('📊 Answer history:', this.answerHistory.length, 'answers');
            console.log('📊 Word data:', this.wordData.length, 'words');

            // Call Cloud Function
            const validateGameScore = httpsCallable(this.functions, 'validateGameScore');
            const result = await validateGameScore(validationData);

            if (result.data.success) {
                console.log('✅ Game validated and saved to server');
                console.log('🏆 Server-validated score:', result.data.validatedScore);
                
                // Update local display with server-validated score
                this.updateLocalScore(result.data.validatedScore);
                
                return {
                    success: true,
                    validatedScore: result.data.validatedScore,
                    message: result.data.message
                };
            } else {
                throw new Error('Server validation failed');
            }

        } catch (error) {
            console.error('❌ Server validation failed:', error);
            
            // Fallback: Show warning but don't save to leaderboard
            this.showValidationWarning();
            
            return {
                success: false,
                error: error.message,
                fallback: true
            };
        }
    }

    /**
     * Update local score display with server-validated score
     */
    updateLocalScore(validatedScore) {
        // Update score display
        const scoreElement = document.getElementById('final-score');
        if (scoreElement) {
            scoreElement.textContent = validatedScore;
        }

        // Update any other score displays
        const scoreDisplays = document.querySelectorAll('.score-display');
        scoreDisplays.forEach(element => {
            element.textContent = validatedScore;
        });

        console.log('📊 Local score updated to server-validated score:', validatedScore);
    }

    /**
     * Show validation warning
     */
    showValidationWarning() {
        // Create warning message
        const warning = document.createElement('div');
        warning.className = 'validation-warning';
        warning.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff6b6b;
                color: white;
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 300px;
            ">
                <strong>⚠️ Validation Warning</strong><br>
                Score could not be validated. This game will not be saved to leaderboard.
            </div>
        `;

        document.body.appendChild(warning);

        // Remove warning after 5 seconds
        setTimeout(() => {
            if (warning.parentNode) {
                warning.parentNode.removeChild(warning);
            }
        }, 5000);
    }

    /**
     * Get leaderboard from server
     */
    async getLeaderboard(limit = 10) {
        try {
            if (!this.functions) {
                throw new Error('Server validation not initialized');
            }

            const { httpsCallable } = await import('https://www.gstatic.com/firebasejs/12.2.1/firebase-functions.js');
            
            const getLeaderboard = httpsCallable(this.functions, 'getLeaderboard');
            const result = await getLeaderboard({ limit });

            if (result.data.success) {
                return result.data.leaderboard;
            } else {
                throw new Error('Failed to get leaderboard');
            }

        } catch (error) {
            console.error('❌ Failed to get leaderboard:', error);
            return [];
        }
    }

    /**
     * Get user's game history from server
     */
    async getUserHistory(limit = 10) {
        try {
            if (!this.functions) {
                throw new Error('Server validation not initialized');
            }

            const { httpsCallable } = await import('https://www.gstatic.com/firebasejs/12.2.1/firebase-functions.js');
            
            const getUserGameHistory = httpsCallable(this.functions, 'getUserGameHistory');
            const result = await getUserGameHistory({ limit });

            if (result.data.success) {
                return result.data.history;
            } else {
                throw new Error('Failed to get user history');
            }

        } catch (error) {
            console.error('❌ Failed to get user history:', error);
            return [];
        }
    }

    /**
     * Clear game data
     */
    clearGame() {
        this.answerHistory = [];
        this.wordData = [];
        this.gameStartTime = null;
        console.log('🧹 Game data cleared');
    }
}

// Create global instance
window.ServerValidation = new ServerValidation();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServerValidation;
}