// 🔥 Firebase Configuration for LaoTypo Game
// ✅ CONFIGURED WITH REAL FIREBASE PROJECT - MODULAR API

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {
  getFirestore, collection, doc, setDoc, getDoc, getDocs,
  addDoc, updateDoc, query, orderBy, limit, where, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js';

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

// Initialize Firebase with modular API
try {
  console.log('🔥 Initializing Firebase with modular API...');
  
  // Initialize Firebase app
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');
  
  // Initialize services
  const db = getFirestore(app);
  const auth = getAuth(app);
  let analytics = null;
  
  try {
    analytics = getAnalytics(app);
    console.log('✅ Firebase Analytics initialized');
  } catch (analyticsError) {
    console.warn('⚠️ Firebase Analytics not available:', analyticsError.message);
  }
  
  console.log('✅ Firebase services initialized');
  
  // Export everything to global scope for compatibility
  window.firebaseApp = app;
  window.firebaseDb = db;
  window.firebaseAuth = auth;
  window.firebaseAnalytics = analytics;
  
  // Export Firestore functions
  window.collection = collection;
  window.doc = doc;
  window.setDoc = setDoc;
  window.getDoc = getDoc;
  window.getDocs = getDocs;
  window.addDoc = addDoc;
  window.updateDoc = updateDoc;
  window.query = query;
  window.orderBy = orderBy;
  window.limit = limit;
  window.where = where;
  window.serverTimestamp = serverTimestamp;
  
  // Export Auth functions
  window.GoogleAuthProvider = GoogleAuthProvider;
  window.signInWithPopup = (provider) => signInWithPopup(auth, provider);
  window.signOut = () => signOut(auth);
  window.onAuthStateChanged = (callback) => onAuthStateChanged(auth, callback);
  
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

// Fallback initialization when Firebase fails
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
          const docRef = await window.addDoc(window.collection(this.db, this.collection), {
            ...playerData,
            createdAt: window.serverTimestamp(),
            updatedAt: window.serverTimestamp()
          });
          return docRef.id;
        } catch (error) {
          console.error('Error creating player:', error);
          throw error;
        }
      }
      
      async updatePlayer(playerId, updateData) {
        try {
          await window.updateDoc(window.doc(this.db, this.collection, playerId), {
            ...updateData,
            updatedAt: window.serverTimestamp()
          });
        } catch (error) {
          console.error('Error updating player:', error);
          throw error;
        }
      }
      
      async getPlayer(playerId) {
        try {
          const doc = await window.getDoc(window.doc(this.db, this.collection, playerId));
          return doc.exists() ? doc.data() : null;
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
          const snapshot = await window.getDocs(
            window.query(
              window.collection(this.db, this.collection),
              window.orderBy('createdAt', 'desc'),
              window.limit(limit)
            )
          );
          
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
          const docRef = await window.addDoc(window.collection(this.db, this.collection), {
            ...wordData,
            createdAt: window.serverTimestamp(),
            updatedAt: window.serverTimestamp()
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
          const snapshot = await window.getDocs(
            window.query(
              window.collection(this.db, this.collection),
              window.orderBy('score', 'desc'),
              window.limit(limit)
            )
          );
          
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
          const docRef = await window.addDoc(window.collection(this.db, this.collection), {
            ...scoreData,
            createdAt: window.serverTimestamp()
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
          await window.getDocs(window.query(window.collection(this.db, 'test'), window.limit(1)));
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
          
          await window.setDoc(window.doc(this.db, 'userData', user.uid), {
            ...localData,
            lastSync: window.serverTimestamp()
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
          
          const doc = await window.getDoc(window.doc(this.db, 'userData', user.uid));
          return doc.exists() ? doc.data() : null;
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
          const result = await window.signInWithPopup(this.provider);
          return result.user;
        } catch (error) {
          console.error('Google sign-in failed:', error);
          throw error;
        }
      }
      
      async signOut() {
        try {
          await window.signOut();
        } catch (error) {
          console.error('Sign-out failed:', error);
          throw error;
        }
      }
      
      getCurrentUser() {
        return this.auth.currentUser;
      }
      
      onAuthStateChanged(callback) {
        return window.onAuthStateChanged(callback);
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