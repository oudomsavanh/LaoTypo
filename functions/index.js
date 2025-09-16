/**
 * Firebase Cloud Functions for LaoTypo Game
 * Server-side validation to prevent cheating
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

/**
 * Validate and calculate game score server-side
 * This prevents client-side manipulation
 */
exports.validateGameScore = functions.https.onCall(async (data, context) => {
    try {
        // Verify user is authenticated
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }

        const { gameData, answerHistory, wordData } = data;
        const userId = context.auth.uid;

        // Validate input data
        if (!gameData || !answerHistory || !wordData) {
            throw new functions.https.HttpsError('invalid-argument', 'Missing required game data');
        }

        // Server-side score calculation
        const serverScore = calculateServerScore(answerHistory, wordData);
        
        // Validate client score matches server calculation
        const clientScore = gameData.finalScore || 0;
        const scoreDifference = Math.abs(serverScore.finalScore - clientScore);
        
        // Allow small difference for rounding errors (max 5 points)
        if (scoreDifference > 5) {
            console.warn(`Score mismatch for user ${userId}: Client=${clientScore}, Server=${serverScore.finalScore}`);
            // Use server score instead of client score
        }

        // Create game result with server-validated data
        const gameResult = {
            userId: userId,
            playerName: gameData.playerName || 'Anonymous',
            finalScore: serverScore.finalScore,
            accuracy: serverScore.accuracy,
            totalWords: serverScore.totalWords,
            correctAnswers: serverScore.correctAnswers,
            wrongAnswers: serverScore.wrongAnswers,
            streak: serverScore.maxStreak,
            levelsCompleted: serverScore.levelsCompleted,
            difficulty: gameData.difficulty || 'medium',
            gameDuration: gameData.gameDuration || 0,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            validated: true, // Mark as server-validated
            answerHistory: answerHistory // Store for audit
        };

        // Save to leaderboard
        await db.collection('leaderboard').add(gameResult);

        // Update user stats
        await updateUserStats(userId, gameResult);

        return {
            success: true,
            validatedScore: serverScore.finalScore,
            message: 'Game score validated and saved'
        };

    } catch (error) {
        console.error('Error validating game score:', error);
        throw new functions.https.HttpsError('internal', 'Failed to validate game score');
    }
});

/**
 * Server-side score calculation
 * This is the authoritative score calculation
 */
function calculateServerScore(answerHistory, wordData) {
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    let totalScore = 0;
    let levelsCompleted = 0;

    // Process each answer
    answerHistory.forEach((answer, index) => {
        const word = wordData[index];
        if (!word) return;

        const isCorrect = answer.answer === word.correct;
        
        if (isCorrect) {
            correctAnswers++;
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
            
            // Calculate score based on streak and difficulty
            const baseScore = getBaseScore(word.difficulty);
            const streakMultiplier = Math.min(1 + (currentStreak - 1) * 0.1, 3); // Max 3x multiplier
            const wordScore = Math.floor(baseScore * streakMultiplier);
            totalScore += wordScore;
            
            // Check if level completed
            if (currentStreak % 15 === 0) {
                levelsCompleted++;
            }
        } else {
            wrongAnswers++;
            currentStreak = 0;
        }
    });

    const totalWords = correctAnswers + wrongAnswers;
    const accuracy = totalWords > 0 ? (correctAnswers / totalWords) * 100 : 0;

    return {
        finalScore: totalScore,
        accuracy: Math.round(accuracy * 100) / 100,
        totalWords,
        correctAnswers,
        wrongAnswers,
        maxStreak,
        levelsCompleted
    };
}

/**
 * Get base score for difficulty level
 */
function getBaseScore(difficulty) {
    const scores = {
        '1': 10,      // Easy
        '2': 15,      // Medium
        '3': 20,      // Hard
        'easy': 10,
        'medium': 15,
        'hard': 20
    };
    return scores[difficulty] || 10;
}

/**
 * Update user statistics
 */
async function updateUserStats(userId, gameResult) {
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            const stats = userData.stats || {};
            
            // Update stats
            stats.totalGames = (stats.totalGames || 0) + 1;
            stats.totalScore = (stats.totalScore || 0) + gameResult.finalScore;
            stats.bestScore = Math.max(stats.bestScore || 0, gameResult.finalScore);
            stats.bestAccuracy = Math.max(stats.bestAccuracy || 0, gameResult.accuracy);
            stats.bestStreak = Math.max(stats.bestStreak || 0, gameResult.streak);
            stats.totalWords = (stats.totalWords || 0) + gameResult.totalWords;
            stats.correctWords = (stats.correctWords || 0) + gameResult.correctAnswers;
            
            // Calculate average accuracy
            stats.averageAccuracy = stats.totalWords > 0 ? 
                (stats.correctWords / stats.totalWords) * 100 : 0;
            
            await userRef.update({
                stats: stats,
                lastGame: gameResult.timestamp,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Create new user stats
            await userRef.set({
                stats: {
                    totalGames: 1,
                    totalScore: gameResult.finalScore,
                    bestScore: gameResult.finalScore,
                    bestAccuracy: gameResult.accuracy,
                    bestStreak: gameResult.streak,
                    totalWords: gameResult.totalWords,
                    correctWords: gameResult.correctAnswers,
                    averageAccuracy: gameResult.accuracy
                },
                lastGame: gameResult.timestamp,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Error updating user stats:', error);
    }
}

/**
 * Get leaderboard with server-validated scores only
 */
exports.getLeaderboard = functions.https.onCall(async (data, context) => {
    try {
        const { limit = 10 } = data;
        
        const leaderboardRef = db.collection('leaderboard')
            .where('validated', '==', true)
            .orderBy('finalScore', 'desc')
            .limit(limit);
        
        const snapshot = await leaderboardRef.get();
        const leaderboard = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            leaderboard.push({
                id: doc.id,
                playerName: data.playerName,
                finalScore: data.finalScore,
                accuracy: data.accuracy,
                streak: data.streak,
                difficulty: data.difficulty,
                timestamp: data.timestamp
            });
        });
        
        return {
            success: true,
            leaderboard: leaderboard
        };
        
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get leaderboard');
    }
});

/**
 * Get user's game history
 */
exports.getUserGameHistory = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }
        
        const userId = context.auth.uid;
        const { limit = 10 } = data;
        
        const historyRef = db.collection('leaderboard')
            .where('userId', '==', userId)
            .where('validated', '==', true)
            .orderBy('timestamp', 'desc')
            .limit(limit);
        
        const snapshot = await historyRef.get();
        const history = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            history.push({
                id: doc.id,
                finalScore: data.finalScore,
                accuracy: data.accuracy,
                streak: data.streak,
                difficulty: data.difficulty,
                timestamp: data.timestamp
            });
        });
        
        return {
            success: true,
            history: history
        };
        
    } catch (error) {
        console.error('Error getting user history:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get user history');
    }
});