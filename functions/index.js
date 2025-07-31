const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();
const rtdb = admin.database();

// Helper function to generate session codes
function generateSessionCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Create a new game session
exports.createSession = functions.https.onCall(async (data, context) => {
    // Verify user is authenticated and is a host
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { name, passageId, level, maxLives, timerPerWord } = data;

    // Validate inputs
    if (!passageId || !level || !maxLives) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    try {
        // Generate unique session code
        let code;
        let codeExists = true;
        while (codeExists) {
            code = generateSessionCode();
            const existing = await db.collection('sessions_meta')
                .where('code', '==', code)
                .where('status', 'in', ['waiting', 'active'])
                .get();
            codeExists = !existing.empty;
        }

        // Create session metadata in Firestore
        const sessionId = db.collection('sessions_meta').doc().id;
        const sessionData = {
            sessionId,
            code,
            name: name || `Session ${code}`,
            hostId: context.auth.uid,
            passageId,
            level,
            maxLives: maxLives || 3,
            timerPerWord: timerPerWord || 0,
            status: 'waiting',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            playerCount: 0
        };

        await db.collection('sessions_meta').doc(sessionId).set(sessionData);

        // Initialize Realtime Database structure
        await rtdb.ref(`sessions/${sessionId}`).set({
            status: 'waiting',
            nextWordIndex: 0,
            players: {},
            leaderboard: {},
            messages: {},
            createdAt: admin.database.ServerValue.TIMESTAMP
        });

        return {
            success: true,
            sessionId,
            code
        };

    } catch (error) {
        console.error('Error creating session:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create session');
    }
});

// Join a game session
exports.joinSession = functions.https.onCall(async (data, context) => {
    const { code, displayName } = data;

    if (!code || !displayName) {
        throw new functions.https.HttpsError('invalid-argument', 'Code and display name required');
    }

    try {
        // Find session by code
        const sessionsQuery = await db.collection('sessions_meta')
            .where('code', '==', code.toUpperCase())
            .where('status', 'in', ['waiting', 'active'])
            .limit(1)
            .get();

        if (sessionsQuery.empty) {
            throw new functions.https.HttpsError('not-found', 'Session not found or already completed');
        }

        const sessionDoc = sessionsQuery.docs[0];
        const sessionData = sessionDoc.data();
        const sessionId = sessionDoc.id;

        // Check if session is full (optional max player limit)
        const maxPlayers = sessionData.maxPlayers || 50;
        if (sessionData.playerCount >= maxPlayers) {
            throw new functions.https.HttpsError('resource-exhausted', 'Session is full');
        }

        // Generate player ID
        const playerId = context.auth?.uid || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Add player to Realtime Database
        await rtdb.ref(`sessions/${sessionId}/players/${playerId}`).set({
            name: displayName,
            currentIndex: 0,
            remainingLives: sessionData.maxLives || 3,
            joinedAt: admin.database.ServerValue.TIMESTAMP
        });

        // Update player count
        await db.collection('sessions_meta').doc(sessionId).update({
            playerCount: admin.firestore.FieldValue.increment(1)
        });

        return {
            success: true,
            sessionId,
            playerId
        };

    } catch (error) {
        console.error('Error joining session:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to join session');
    }
});

// Compute score when a word is clicked
exports.computeScore = functions.database
    .ref('/sessions/{sessionId}/gameEvents/{eventId}')
    .onCreate(async (snapshot, context) => {
        const { sessionId } = context.params;
        const event = snapshot.val();
        const { playerId, wordIndex, correct } = event;

        if (!playerId || wordIndex === undefined) return;

        try {
            // Get session metadata
            const sessionDoc = await db.collection('sessions_meta').doc(sessionId).get();
            if (!sessionDoc.exists) return;

            const sessionData = sessionDoc.data();
            const level = sessionData.level;

            // Calculate points based on difficulty
            let points = 0;
            if (correct) {
                switch (level) {
                    case 'Easy': points = 1; break;
                    case 'Medium': points = 2; break;
                    case 'Hard': points = 3; break;
                    default: points = 1;
                }
            }

            // Update leaderboard
            const leaderboardRef = rtdb.ref(`sessions/${sessionId}/leaderboard/${playerId}`);
            const currentData = (await leaderboardRef.once('value')).val() || { rawScore: 0 };
            
            await leaderboardRef.update({
                rawScore: currentData.rawScore + points,
                lastClickTs: admin.database.ServerValue.TIMESTAMP
            });

            // Check if all words completed
            const playersSnapshot = await rtdb.ref(`sessions/${sessionId}/players`).once('value');
            const players = playersSnapshot.val() || {};
            
            let allCompleted = true;
            let maxIndex = 0;
            
            Object.values(players).forEach(player => {
                if (player.currentIndex > maxIndex) {
                    maxIndex = player.currentIndex;
                }
                // Check if player has remaining lives and hasn't completed
                if (player.remainingLives > 0 && player.currentIndex < sessionData.totalWords) {
                    allCompleted = false;
                }
            });

            // Update next word index
            await rtdb.ref(`sessions/${sessionId}/nextWordIndex`).set(maxIndex);

            // If all players completed or out of lives, finalize the game
            if (allCompleted) {
                await rtdb.ref(`sessions/${sessionId}/status`).set('completed');
            }

        } catch (error) {
            console.error('Error computing score:', error);
        }
    });

// Finalize results when game completes
exports.finalizeResults = functions.database
    .ref('/sessions/{sessionId}/status')
    .onUpdate(async (change, context) => {
        const { sessionId } = context.params;
        const newStatus = change.after.val();
        const oldStatus = change.before.val();

        if (oldStatus !== 'completed' && newStatus === 'completed') {
            try {
                // Get all game data
                const sessionSnapshot = await rtdb.ref(`sessions/${sessionId}`).once('value');
                const sessionData = sessionSnapshot.val();

                const players = sessionData.players || {};
                const leaderboard = sessionData.leaderboard || {};
                const gameEvents = sessionData.gameEvents || {};

                // Get session metadata
                const sessionDoc = await db.collection('sessions_meta').doc(sessionId).get();
                const metadata = sessionDoc.data();

                // Calculate results for each player
                const results = [];
                
                for (const [playerId, playerData] of Object.entries(players)) {
                    const playerScore = leaderboard[playerId] || { rawScore: 0 };
                    
                    // Calculate accuracy
                    let correctCount = 0;
                    let totalClicks = 0;
                    
                    Object.values(gameEvents).forEach(event => {
                        if (event.playerId === playerId) {
                            totalClicks++;
                            if (event.correct) correctCount++;
                        }
                    });

                    const accuracy = totalClicks > 0 ? (correctCount / totalClicks) * 100 : 0;

                    // Calculate completion time (last event - join time)
                    const joinTime = playerData.joinedAt;
                    const lastEventTime = playerScore.lastClickTs || joinTime;
                    const completionTime = Math.floor((lastEventTime - joinTime) / 1000);

                    // Determine tier
                    let tier = 'Beginner';
                    if (accuracy >= 90) tier = 'Master';
                    else if (accuracy >= 70) tier = 'Advanced';
                    else if (accuracy >= 40) tier = 'Intermediate';

                    // Save to Firestore results collection
                    await db.collection('results').add({
                        sessionId,
                        playerId,
                        playerName: playerData.name,
                        rawScore: playerScore.rawScore,
                        percentage: accuracy,
                        tier,
                        completionTime,
                        completedAt: admin.firestore.FieldValue.serverTimestamp()
                    });

                    results.push({
                        playerId,
                        playerName: playerData.name,
                        rawScore: playerScore.rawScore,
                        percentage: accuracy
                    });
                }

                // Create leaderboard snapshot
                await db.collection('sessions_meta').doc(sessionId)
                    .collection('leaderboardSnapshots').add({
                        snapshotTime: admin.firestore.FieldValue.serverTimestamp(),
                        rankings: results.sort((a, b) => b.rawScore - a.rawScore)
                    });

                // Update session status in Firestore
                await db.collection('sessions_meta').doc(sessionId).update({
                    status: 'completed',
                    completedAt: admin.firestore.FieldValue.serverTimestamp()
                });

                // Calculate and save analytics
                const avgScore = results.reduce((sum, r) => sum + r.rawScore, 0) / results.length;
                const avgPercentage = results.reduce((sum, r) => sum + r.percentage, 0) / results.length;

                await db.collection('analytics').doc('sessionMetrics').collection('sessions').add({
                    sessionId,
                    avgRawScore: avgScore,
                    avgPercentage,
                    maxPlayers: results.length,
                    duration: metadata.completedAt - metadata.createdAt,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });

            } catch (error) {
                console.error('Error finalizing results:', error);
            }
        }
    });

// Clean up old sessions (scheduled function)
exports.cleanupTTL = functions.pubsub
    .schedule('every 24 hours')
    .onRun(async (context) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 7); // 7 days TTL

        try {
            // Clean up completed sessions older than 7 days
            const oldSessions = await db.collection('sessions_meta')
                .where('status', '==', 'completed')
                .where('completedAt', '<', cutoffDate)
                .get();

            const batch = db.batch();
            const deletePromises = [];

            oldSessions.forEach(doc => {
                // Delete from Firestore
                batch.delete(doc.ref);
                
                // Delete from Realtime Database
                const sessionId = doc.id;
                deletePromises.push(
                    rtdb.ref(`sessions/${sessionId}`).remove()
                );
            });

            await batch.commit();
            await Promise.all(deletePromises);

            console.log(`Cleaned up ${oldSessions.size} old sessions`);

        } catch (error) {
            console.error('Error in cleanup:', error);
        }
    });

// Assign custom claims for user roles
exports.assignCustomClaims = functions.auth.user().onCreate(async (user) => {
    try {
        // Check if user email matches host pattern (e.g., @gmail.com)
        const isHost = user.email && user.email.endsWith('@gmail.com');
        
        // Set custom claims
        await admin.auth().setCustomUserClaims(user.uid, {
            role: isHost ? 'host' : 'player'
        });

        // Create user profile in Firestore
        await db.collection('users').doc(user.uid).set({
            email: user.email,
            displayName: user.displayName,
            role: isHost ? 'host' : 'player',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

    } catch (error) {
        console.error('Error setting custom claims:', error);
    }
});