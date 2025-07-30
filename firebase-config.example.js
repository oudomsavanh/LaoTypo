// 🔥 Firebase Configuration Template for LaoTypo Game
// 
// ⚠️ IMPORTANT: 
// 1. Copy this file to 'firebase-config.js'
// 2. Replace the placeholder values with your actual Firebase config
// 3. NEVER commit firebase-config.js to Git!
// 4. Make sure firebase-config.js is in your .gitignore

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
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
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log('🔥 Firebase initialized successfully');

// 🗄️ DATABASE COLLECTIONS
const COLLECTIONS = {
  PLAYERS: 'players',
  WORDS: 'words', 
  LEADERBOARDS: 'leaderboards',
  GAME_RESULTS: 'gameResults'
};

// [Rest of your Firebase code remains the same...]
// Copy the rest from your original firebase-config.js file
// Just make sure to never include the actual API keys!