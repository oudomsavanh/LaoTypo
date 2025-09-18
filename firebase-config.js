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

// Export Firebase config immediately to global scope
window.firebaseConfig = firebaseConfig;
console.log('🔥 Firebase config exported to global scope');

// Initialize Firebase immediately
(function() {
  console.log('🔥 Starting Firebase initialization...');
  
  // Check if Firebase is already loaded
  if (typeof firebase !== 'undefined') {
    console.log('✅ Firebase already loaded, initializing...');
    initializeFirebase();
    return;
  }
  
  // Wait for Firebase to load from CDN
  let attempts = 0;
  const maxAttempts = 50; // 5 seconds max wait
  
  const checkFirebase = () => {
    attempts++;
    if (typeof firebase !== 'undefined') {
      console.log('✅ Firebase loaded from CDN, initializing...');
      initializeFirebase();
    } else if (attempts < maxAttempts) {
      console.log(`⏳ Waiting for Firebase... (${attempts}/${maxAttempts})`);
      setTimeout(checkFirebase, 100);
    } else {
      console.warn('⚠️ Firebase CDN timeout, using fallback');
      initializeFallback();
    }
  };
  
  checkFirebase();
})();

// Initialize Firebase
function initializeFirebase() {
  try {
    console.log('🔥 Initializing Firebase...');
    
    if (typeof firebase === 'undefined') {
      throw new Error('Firebase not loaded');
    }
    
    // Initialize Firebase app
    const app = firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized');
    
    // Initialize services
    const db = firebase.firestore();
    const auth = firebase.auth();
    let analytics = null;
    
    try {
      analytics = firebase.analytics();
      console.log('✅ Firebase Analytics initialized');
    } catch (analyticsError) {
      console.warn('⚠️ Firebase Analytics not available:', analyticsError.message);
    }
    
    console.log('✅ Firebase services initialized');
    
    // Export everything to global scope
    window.firebase = firebase;
    window.firebaseApp = app;
    window.firebaseDb = db;
    window.firebaseAuth = auth;
    window.firebaseAnalytics = analytics;
    
    // Export Firestore functions
    window.collection = firebase.firestore().collection.bind(firebase.firestore());
    window.doc = firebase.firestore().doc.bind(firebase.firestore());
    window.setDoc = firebase.firestore().setDoc;
    window.getDoc = firebase.firestore().getDoc;
    window.getDocs = firebase.firestore().getDocs;
    window.addDoc = firebase.firestore().addDoc;
    window.updateDoc = firebase.firestore().updateDoc;
    window.query = firebase.firestore().query;
    window.orderBy = firebase.firestore().orderBy;
    window.limit = firebase.firestore().limit;
    window.where = firebase.firestore().where;
    window.serverTimestamp = firebase.firestore().serverTimestamp;
    
    // Export Auth functions
    window.GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
    window.signInWithPopup = firebase.auth().signInWithPopup;
    window.signOut = firebase.auth().signOut;
    window.onAuthStateChanged = firebase.auth().onAuthStateChanged;
    
    console.log('🔥 Firebase fully initialized and exported to global scope');
    console.log('📊 Available Firebase objects:', {
      firebaseConfig: !!window.firebaseConfig,
      firebaseDb: !!window.firebaseDb,
      firebaseAuth: !!window.firebaseAuth,
      firebaseAnalytics: !!window.firebaseAnalytics,
      collection: !!window.collection,
      getDocs: !!window.getDocs
    });
    
    // Initialize managers
    initializeManagers();
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    console.log('🔄 Attempting fallback initialization...');
    initializeFallback();
  }
}

// Fallback initialization when Firebase CDN fails
function initializeFallback() {
  console.log('🔄 Initializing fallback mode...');
  
  // Create mock Firebase objects
  window.firebaseDb = {
    collection: function(name) {
      return {
        orderBy: function() { return this; },
        limit: function() { return this; },
        get: function() { 
          return Promise.reject(new Error('Firebase not available - using fallback mode'));
        }
      };
    }
  };
  
  window.collection = function(db, name) {
    return {
      orderBy: function() { return this; },
      limit: function() { return this; },
      get: function() { 
        return Promise.reject(new Error('Firebase not available - using fallback mode'));
      }
    };
  };
  
  window.getDocs = function() {
    return Promise.reject(new Error('Firebase not available - using fallback mode'));
  };
  
  window.firebaseAuth = {
    currentUser: null,
    signInWithPopup: function() { return Promise.reject(new Error('Firebase not available')); },
    signOut: function() { return Promise.reject(new Error('Firebase not available')); }
  };
  
  window.firebaseAnalytics = null;
  
  console.log('✅ Fallback mode initialized');
  
  // Initialize managers with fallback
  initializeManagers();
}

// Initialize Firebase managers
function initializeManagers() {
  try {
    console.log('🏗️ Initializing Firebase managers...');
    
    // Firebase Player Manager
    class FirebasePlayerManager {
      constructor() {
        this.db = window.firebaseDb;
        this.collection = 'players';
      }
      
      async createPlayer(playerData) {
        try {
          const docRef = await this.db.collection(this.collection).add({
            ...playerData,
            createdAt: firebase.firestore().serverTimestamp(),
            updatedAt: firebase.firestore().serverTimestamp()
          });
          return docRef.id;
        } catch (error) {
          console.error('Error creating player:', error);
          throw error;
        }
      }
      
      async updatePlayer(playerId, updateData) {
        try {
          await this.db.collection(this.collection).doc(playerId).update({
            ...updateData,
            updatedAt: firebase.firestore().serverTimestamp()
          });
        } catch (error) {
          console.error('Error updating player:', error);
          throw error;
        }
      }
      
      async getPlayer(playerId) {
        try {
          const doc = await this.db.collection(this.collection).doc(playerId).get();
          return doc.exists ? doc.data() : null;
        } catch (error) {
          console.error('Error getting player:', error);
          throw error;
        }
      }
    }
    
    // Firebase Word Manager
    class FirebaseWordManager {
      constructor() {
        this.db = window.firebaseDb;
        this.collection = 'gameWords';
      }
      
      async getWords(limit = 100) {
        try {
          const snapshot = await this.db.collection(this.collection)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();
          
          return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        } catch (error) {
          console.error('Error getting words:', error);
          throw error;
        }
      }
      
      async addWord(wordData) {
        try {
          const docRef = await this.db.collection(this.collection).add({
            ...wordData,
            createdAt: firebase.firestore().serverTimestamp(),
            updatedAt: firebase.firestore().serverTimestamp()
          });
          return docRef.id;
        } catch (error) {
          console.error('Error adding word:', error);
          throw error;
        }
      }
    }
    
    // Firebase Leaderboard Manager
    class FirebaseLeaderboardManager {
      constructor() {
        this.db = window.firebaseDb;
        this.collection = 'leaderboard';
      }
      
      async getLeaderboard(limit = 10) {
        try {
          const snapshot = await this.db.collection(this.collection)
            .orderBy('score', 'desc')
            .limit(limit)
            .get();
          
          return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        } catch (error) {
          console.error('Error getting leaderboard:', error);
          throw error;
        }
      }
      
      async addScore(scoreData) {
        try {
          const docRef = await this.db.collection(this.collection).add({
            ...scoreData,
            createdAt: firebase.firestore().serverTimestamp()
          });
          return docRef.id;
        } catch (error) {
          console.error('Error adding score:', error);
          throw error;
        }
      }
    }
    
    // Firebase Sync Manager
    class FirebaseSyncManager {
      constructor() {
        this.db = window.firebaseDb;
        this.auth = window.firebaseAuth;
      }
      
      async checkConnection() {
        try {
          await this.db.collection('test').limit(1).get();
          return true;
        } catch (error) {
          console.error('Connection check failed:', error);
          return false;
        }
      }
      
      async syncLocalDataToFirebase(localData) {
        try {
          const user = this.auth.currentUser;
          if (!user) return false;
          
          await this.db.collection('userData').doc(user.uid).set({
            ...localData,
            lastSync: firebase.firestore().serverTimestamp()
          });
          return true;
        } catch (error) {
          console.error('Sync to Firebase failed:', error);
          return false;
        }
      }
      
      async syncCloudDataToLocal() {
        try {
          const user = this.auth.currentUser;
          if (!user) return null;
          
          const doc = await this.db.collection('userData').doc(user.uid).get();
          return doc.exists ? doc.data() : null;
        } catch (error) {
          console.error('Sync from Firebase failed:', error);
          return null;
        }
      }
    }
    
    // Firebase Auth Manager
    class FirebaseAuthManager {
      constructor() {
        this.auth = window.firebaseAuth;
        this.provider = new window.GoogleAuthProvider();
      }
      
      async signInWithGoogle() {
        try {
          const result = await window.signInWithPopup(this.auth, this.provider);
          return result.user;
        } catch (error) {
          console.error('Google sign-in failed:', error);
          throw error;
        }
      }
      
      async signOut() {
        try {
          await window.signOut(this.auth);
        } catch (error) {
          console.error('Sign-out failed:', error);
          throw error;
        }
      }
      
      getCurrentUser() {
        return this.auth.currentUser;
      }
      
      onAuthStateChanged(callback) {
        return window.onAuthStateChanged(this.auth, callback);
      }
    }
    
    // Security Utils
    class SecurityUtils {
      static sanitizeInput(input, maxLength = 100) {
        if (!input) return '';
        return input.toString()
          .substring(0, maxLength)
          .replace(/[<>\"'&]/g, '')
          .trim();
      }
      
      static safeGetLocalStorage(key, defaultValue = null) {
        try {
          const value = localStorage.getItem(key);
          return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
          console.warn('localStorage get error:', error);
          return defaultValue;
        }
      }
      
      static safeSetLocalStorage(key, value) {
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (error) {
          console.warn('localStorage set error:', error);
          return false;
        }
      }
      
      static safeSetHTML(element, html) {
        if (!element) return false;
        try {
          // Basic sanitization
          const sanitized = html.replace(/<script[^>]*>.*?<\/script>/gi, '');
          element.innerHTML = sanitized;
          return true;
        } catch (error) {
          console.warn('HTML set error:', error);
          return false;
        }
      }
    }
    
    // Export managers to global scope
    window.FirebasePlayerManager = FirebasePlayerManager;
    window.FirebaseWordManager = FirebaseWordManager;
    window.FirebaseLeaderboardManager = FirebaseLeaderboardManager;
    window.FirebaseSyncManager = FirebaseSyncManager;
    window.FirebaseAuthManager = FirebaseAuthManager;
    window.SecurityUtils = SecurityUtils;
    
    console.log('✅ Firebase managers initialized and exported');
    
  } catch (error) {
    console.error('❌ Manager initialization failed:', error);
  }
}

// Export the config for immediate use
window.firebaseConfig = firebaseConfig;