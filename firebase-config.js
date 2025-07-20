// Firebase Configuration for Lao Typo Game
// Instructions: Replace with your actual Firebase project configuration
const firebaseConfig = {
    // Replace these with your actual Firebase project credentials
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com", 
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
let app, database, auth;
let firebaseInitialized = false;

async function initializeFirebase() {
    try {
        // Load Firebase SDK
        if (typeof firebase === 'undefined') {
            // Dynamically load Firebase scripts
            await loadScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
            await loadScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js');
            await loadScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js');
        }
        
        // Initialize Firebase
        app = firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        auth = firebase.auth();
        
        console.log('🔥 Firebase initialized successfully');
        firebaseInitialized = true;
        
        // Enable offline persistence
        database.goOffline();
        database.goOnline();
        
        return true;
    } catch (error) {
        console.warn('⚠️ Firebase initialization failed:', error);
        console.log('📱 App will work in offline mode');
        return false;
    }
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Firebase Database Functions
class FirebaseSync {
    constructor() {
        this.userId = localStorage.getItem('laoTypo_userId') || this.generateUserId();
        this.enabled = true; // Will be controlled by settings
    }
    
    generateUserId() {
        const id = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        localStorage.setItem('laoTypo_userId', id);
        return id;
    }
    
    async syncPersonalRecords(personalRecords) {
        if (!firebaseInitialized || !this.enabled) return;
        
        try {
            await database.ref(`users/${this.userId}/personalRecords`).set({
                ...personalRecords,
                lastUpdated: firebase.database.ServerValue.TIMESTAMP
            });
            console.log('✅ Personal records synced to Firebase');
        } catch (error) {
            console.warn('⚠️ Failed to sync personal records:', error);
        }
    }
    
    async loadPersonalRecords() {
        if (!firebaseInitialized || !this.enabled) return null;
        
        try {
            const snapshot = await database.ref(`users/${this.userId}/personalRecords`).once('value');
            const data = snapshot.val();
            if (data) {
                console.log('📥 Personal records loaded from Firebase');
                return data;
            }
        } catch (error) {
            console.warn('⚠️ Failed to load personal records:', error);
        }
        return null;
    }
    
    async submitToLeaderboard(difficulty, score, accuracy, playerName) {
        if (!firebaseInitialized || !this.enabled) return;
        
        try {
            const entry = {
                userId: this.userId,
                playerName: playerName || 'Anonymous',
                score: score,
                accuracy: accuracy,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                version: '1.0.0-beta'
            };
            
            // Add to global leaderboard
            await database.ref(`leaderboard/${difficulty}`).push(entry);
            
            // Add to user's history
            await database.ref(`users/${this.userId}/gameHistory`).push(entry);
            
            console.log('🏆 Score submitted to global leaderboard');
        } catch (error) {
            console.warn('⚠️ Failed to submit to leaderboard:', error);
        }
    }
    
    async getLeaderboard(difficulty, limit = 100) {
        if (!firebaseInitialized || !this.enabled) return [];
        
        try {
            const snapshot = await database.ref(`leaderboard/${difficulty}`)
                .orderByChild('score')
                .limitToLast(limit)
                .once('value');
            
            const data = snapshot.val();
            if (data) {
                // Convert to array and sort by score descending, then accuracy
                const leaderboard = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...value
                })).sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score;
                    return b.accuracy - a.accuracy;
                });
                
                console.log('📊 Leaderboard loaded from Firebase:', leaderboard.length, 'entries');
                return leaderboard;
            }
        } catch (error) {
            console.warn('⚠️ Failed to load leaderboard:', error);
        }
        return [];
    }
    
    async getUserRank(difficulty, userScore) {
        if (!firebaseInitialized || !this.enabled) return null;
        
        try {
            const snapshot = await database.ref(`leaderboard/${difficulty}`)
                .orderByChild('score')
                .startAt(userScore)
                .once('value');
            
            const data = snapshot.val();
            if (data) {
                const betterScores = Object.values(data).filter(entry => 
                    entry.score > userScore || 
                    (entry.score === userScore && entry.accuracy > userScore)
                );
                return betterScores.length + 1; // User's rank
            }
        } catch (error) {
            console.warn('⚠️ Failed to get user rank:', error);
        }
        return null;
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
        console.log(`🔄 Firebase sync ${enabled ? 'enabled' : 'disabled'}`);
    }
}

// Export for use in other files
window.FirebaseSync = FirebaseSync;
window.initializeFirebase = initializeFirebase;