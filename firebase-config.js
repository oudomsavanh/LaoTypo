// 🔥 Firebase Configuration for LaoTypo Game
// ✅ CONFIGURED WITH REAL FIREBASE PROJECT
const firebaseConfig = {
  apiKey: "AIzaSyC6JCvbw_sipB5xiZtijndIXz9koAPQHXs",
  authDomain: "laotypo-phase1.firebaseapp.com",
  projectId: "laotypo-phase1",
  storageBucket: "laotypo-phase1.firebasestorage.app",
  messagingSenderId: "359413130623",
  appId: "1:359413130623:web:96dd1c437d4a3971ec264a",
  measurementId: "G-7CH5217ZYG"
};

// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit, 
  where,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

console.log('🔥 Firebase initialized successfully');

// Unified initializer for pages that expect initializeFirebase()
export async function initializeFirebase() {
  try {
    console.log('🧩 initializeFirebase(): starting');
    // Basic sanity checks
    const checks = {
      hasConfig: !!firebaseConfig && !!firebaseConfig.projectId,
      appInitialized: !!app,
      dbReady: !!db,
      authReady: !!auth,
      analyticsReady: !!analytics
    };
    console.log('🧩 initializeFirebase(): checks', checks);
    return checks.hasConfig && checks.appInitialized && checks.dbReady && checks.authReady;
  } catch (e) {
    console.error('🧩 initializeFirebase(): failed', e);
    return false;
  }
}

// 🗄️ DATABASE COLLECTIONS
const COLLECTIONS = {
  PLAYERS: 'players',
  WORDS: 'gameWords',  // Updated to match our export
  LEADERBOARDS: 'leaderboards',
  GAME_RESULTS: 'gameResults'
};

// 👤 PLAYER DATA FUNCTIONS
class FirebasePlayerManager {
  
  // Save player data to Firebase
  static async savePlayerData(userId, playerData) {
    try {
      const playerRef = doc(db, COLLECTIONS.PLAYERS, userId);
      await setDoc(playerRef, {
        ...playerData,
        lastUpdated: serverTimestamp()
      }, { merge: true });
      
      console.log('✅ Player data saved to Firebase:', userId);
      return true;
    } catch (error) {
      console.error('❌ Error saving player data:', error);
      return false;
    }
  }
  
  // Load player data from Firebase
  static async loadPlayerData(userId) {
    try {
      const playerRef = doc(db, COLLECTIONS.PLAYERS, userId);
      const playerSnap = await getDoc(playerRef);
      
      if (playerSnap.exists()) {
        const data = playerSnap.data();
        console.log('✅ Player data loaded from Firebase:', userId);
        return data;
      } else {
        console.log('📝 No player data found, creating new profile');
        return null;
      }
    } catch (error) {
      console.error('❌ Error loading player data:', error);
      return null;
    }
  }
  
  // Update player stats
  static async updatePlayerStats(userId, stats) {
    try {
      const playerRef = doc(db, COLLECTIONS.PLAYERS, userId);
      await updateDoc(playerRef, {
        stats: stats,
        lastUpdated: serverTimestamp()
      });
      
      console.log('📊 Player stats updated:', userId);
      return true;
    } catch (error) {
      console.error('❌ Error updating stats:', error);
      return false;
    }
  }
  
  // Update player achievements  
  static async updatePlayerAchievements(userId, achievements) {
    try {
      const playerRef = doc(db, COLLECTIONS.PLAYERS, userId);
      await updateDoc(playerRef, {
        achievements: achievements,
        lastUpdated: serverTimestamp()
      });
      
      console.log('🏆 Player achievements updated:', userId);
      return true;
    } catch (error) {
      console.error('❌ Error updating achievements:', error);
      return false;
    }
  }
}

// 📊 WORD DATA FUNCTIONS
class FirebaseWordManager {
  
  // Load words by difficulty
  static async loadWordsByDifficulty(difficulty = 'all') {
    try {
      const wordsRef = collection(db, COLLECTIONS.WORDS);
      let wordsQuery;
      
      if (difficulty === 'all') {
        wordsQuery = query(wordsRef, orderBy('difficulty'), orderBy('order'));
      } else {
        wordsQuery = query(
          wordsRef,
          where('difficulty', '==', difficulty),
          orderBy('order')
        );
      }
      
      const querySnapshot = await getDocs(wordsQuery);
      const words = [];
      
      querySnapshot.forEach((doc) => {
        words.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`📚 Loaded ${words.length} words (difficulty: ${difficulty})`);
      return words;
    } catch (error) {
      console.error('❌ Error loading words:', error);
      return [];
    }
  }
  
  // Add new words to Firebase (for admin use)
  static async addWords(wordsArray) {
    try {
      const wordsRef = collection(db, COLLECTIONS.WORDS);
      const promises = wordsArray.map(word => addDoc(wordsRef, {
        ...word,
        addedDate: serverTimestamp()
      }));
      
      await Promise.all(promises);
      console.log(`✅ Added ${wordsArray.length} words to Firebase`);
      return true;
    } catch (error) {
      console.error('❌ Error adding words:', error);
      return false;
    }
  }
  
  // Get word count by difficulty
  static async getWordStats() {
    try {
      const difficulties = ['easy', 'medium', 'hard'];
      const stats = {};
      
      for (const diff of difficulties) {
        const wordsQuery = query(
          collection(db, COLLECTIONS.WORDS),
          where('difficulty', '==', diff)
        );
        const snapshot = await getDocs(wordsQuery);
        stats[diff] = snapshot.size;
      }
      
      console.log('📊 Word statistics:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error getting word stats:', error);
      return { easy: 0, medium: 0, hard: 0 };
    }
  }
}

// 🏆 LEADERBOARD FUNCTIONS
class FirebaseLeaderboardManager {
  
  // Save game result
  static async saveGameResult(userId, gameData) {
    try {
      const resultRef = collection(db, COLLECTIONS.GAME_RESULTS);
      await addDoc(resultRef, {
        userId: userId,
        ...gameData,
        timestamp: serverTimestamp()
      });
      
      console.log('🎮 Game result saved:', gameData.score);
      return true;
    } catch (error) {
      console.error('❌ Error saving game result:', error);
      return false;
    }
  }
  
  // Get global leaderboard
  static async getGlobalLeaderboard(limitCount = 10) {
    try {
      const leaderboardQuery = query(
        collection(db, COLLECTIONS.GAME_RESULTS),
        orderBy('score', 'desc'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(leaderboardQuery);
      const leaderboard = [];
      
      for (const doc of querySnapshot.docs) {
        const gameData = doc.data();
        // Get player name
        const playerData = await FirebasePlayerManager.loadPlayerData(gameData.userId);
        
        leaderboard.push({
          id: doc.id,
          ...gameData,
          playerName: playerData?.profile?.displayName || 'Anonymous'
        });
      }
      
      console.log(`🏆 Loaded global leaderboard (${leaderboard.length} entries)`);
      return leaderboard;
    } catch (error) {
      console.error('❌ Error loading leaderboard:', error);
      return [];
    }
  }
  
  // Get player's best scores
  static async getPlayerBestScores(userId, limitCount = 5) {
    try {
      const scoresQuery = query(
        collection(db, COLLECTIONS.GAME_RESULTS),
        where('userId', '==', userId),
        orderBy('score', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(scoresQuery);
      const scores = [];
      
      querySnapshot.forEach((doc) => {
        scores.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`📈 Loaded ${scores.length} best scores for player:`, userId);
      return scores;
    } catch (error) {
      console.error('❌ Error loading player scores:', error);
      return [];
    }
  }
}

// 🔄 SYNC FUNCTIONS
class FirebaseSyncManager {
  
  // Sync local data to Firebase
  static async syncToCloud(userId, localData) {
    try {
      console.log('🔄 Syncing local data to Firebase...');
      
      // Save player profile and settings
      await FirebasePlayerManager.savePlayerData(userId, {
        profile: {
          displayName: localData.displayName,
          joinDate: new Date().toISOString()
        },
        settings: localData.settings,
        stats: localData.stats,
        achievements: localData.personalRecords || {}
      });
      
      console.log('✅ Local data synced to Firebase');
      return true;
    } catch (error) {
      console.error('❌ Error syncing to cloud:', error);
      return false;
    }
  }
  
  // Sync Firebase data to local
  static async syncFromCloud(userId) {
    try {
      console.log('🔄 Syncing Firebase data to local...');
      
      const playerData = await FirebasePlayerManager.loadPlayerData(userId);
      if (playerData) {
        return {
          displayName: playerData.profile?.displayName || '',
          settings: playerData.settings || {},
          stats: playerData.stats || {},
          personalRecords: playerData.achievements || {}
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error syncing from cloud:', error);
      return null;
    }
  }
  
  // Check connection status
  static async checkConnection() {
    try {
      // Try to read a small document
      const testQuery = query(collection(db, COLLECTIONS.WORDS), limit(1));
      await getDocs(testQuery);
      return true;
    } catch (error) {
      console.warn('🔌 Firebase connection failed:', error);
      return false;
    }
  }
}

// 🔐 AUTHENTICATION MANAGER
class FirebaseAuthManager {
  
  // Login with Gmail
  static async loginWithGmail() {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log('✅ Gmail login successful:', user.email);
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }
      };
    } catch (error) {
      console.error('❌ Gmail login failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Login anonymously
  static async loginAnonymously() {
    try {
      const { signInAnonymously } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
      const result = await signInAnonymously(auth);
      const user = result.user;
      
      console.log('✅ Anonymous login successful:', user.uid);
      return {
        success: true,
        user: {
          uid: user.uid,
          email: null,
          displayName: 'Guest User',
          photoURL: null,
          isAnonymous: true
        }
      };
    } catch (error) {
      console.error('❌ Anonymous login failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Logout
  static async logout() {
    try {
      await signOut(auth);
      console.log('✅ User logged out');
      return true;
    } catch (error) {
      console.error('❌ Logout failed:', error);
      return false;
    }
  }
  
  // Get current user
  static getCurrentUser() {
    return auth.currentUser;
  }
  
  // Listen to auth state changes
  static onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
  
  // Create user profile in Firestore
  static async createUserProfile(uid, profileData) {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        ...profileData,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp()
      });
      
      console.log('✅ User profile created:', uid);
      return true;
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
      return false;
    }
  }
  
  // Get user profile from Firestore
  static async getUserProfile(uid) {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      return null;
    }
  }
}

// 🚀 EXPORT ALL MANAGERS
window.FirebasePlayerManager = FirebasePlayerManager;
window.FirebaseWordManager = FirebaseWordManager; 
window.FirebaseLeaderboardManager = FirebaseLeaderboardManager;
window.FirebaseSyncManager = FirebaseSyncManager;
window.FirebaseAuthManager = FirebaseAuthManager;
window.firebaseDb = db;
window.firebaseAuth = auth;

// 🛡️ SECURITY UTILITIES
class SecurityUtils {
  
  // Sanitize user input
  static sanitizeInput(input, maxLength = 100) {
    if (typeof input !== 'string') return '';
    
    // Remove HTML tags and limit length
    const sanitized = input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>\"'&]/g, '') // Remove dangerous characters
      .trim()
      .substring(0, maxLength);
    
    return sanitized;
  }
  
  // Validate display name
  static validateDisplayName(name) {
    const sanitized = this.sanitizeInput(name, 50);
    return sanitized.length >= 2 && sanitized.length <= 50;
  }
  
  // Validate session name
  static validateSessionName(name) {
    const sanitized = this.sanitizeInput(name, 100);
    return sanitized.length >= 3 && sanitized.length <= 100;
  }
  
  // Validate session code
  static validateSessionCode(code) {
    return /^[A-Z0-9]{6}$/.test(code);
  }
  
  // Safe DOM insertion
  static safeSetTextContent(element, text) {
    if (element && typeof text === 'string') {
      element.textContent = this.sanitizeInput(text);
    }
  }
  
  // Safe innerHTML (avoid this, use textContent instead)
  static safeSetHTML(element, html) {
    if (element && typeof html === 'string') {
      // Only allow safe HTML patterns
      const safeHTML = html.replace(/<script[^>]*>.*?<\/script>/gi, '');
      element.innerHTML = safeHTML;
    }
  }
  
  // Safe JSON parsing with fallback
  static safeJSONParse(jsonString, fallback = null) {
    try {
      if (typeof jsonString !== 'string') return fallback;
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('JSON parse error:', error);
      return fallback;
    }
  }
  
  // Safe localStorage getter
  static safeGetLocalStorage(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? this.safeJSONParse(value, fallback) : fallback;
    } catch (error) {
      console.warn('localStorage get error:', error);
      return fallback;
    }
  }
  
  // Safe sessionStorage getter
  static safeGetSessionStorage(key, fallback = null) {
    try {
      const value = sessionStorage.getItem(key);
      return value ? this.safeJSONParse(value, fallback) : fallback;
    } catch (error) {
      console.warn('sessionStorage get error:', error);
      return fallback;
    }
  }
}

// 🚀 EXPORT ALL MANAGERS AND UTILITIES
window.FirebasePlayerManager = FirebasePlayerManager;
window.FirebaseWordManager = FirebaseWordManager; 
window.FirebaseLeaderboardManager = FirebaseLeaderboardManager;
window.FirebaseSyncManager = FirebaseSyncManager;
window.FirebaseAuthManager = FirebaseAuthManager;
window.SecurityUtils = SecurityUtils;
window.firebaseDb = db;
window.firebaseAuth = auth;
window.firebaseAnalytics = analytics;

console.log('🔥 Firebase modules loaded and ready!');
console.log('🛡️ Security utilities loaded');
console.log('🔑 Available Firebase functions:');
console.log('  - FirebaseAuthManager.loginWithGmail()');
console.log('  - FirebaseAuthManager.getUserProfile(uid)');
console.log('  - FirebasePlayerManager.savePlayerData()');
console.log('  - FirebaseSyncManager.syncToCloud()');
console.log('  - SecurityUtils.sanitizeInput()');
console.log('  - SecurityUtils.validateDisplayName()');