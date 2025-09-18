// Simple Firebase test script
// Run this in the browser console to test Firebase connection

console.log('🔥 Starting Firebase connection test...');

// Test 1: Check if Firebase is loaded
console.log('1. Checking Firebase availability...');
if (typeof window.firebaseDb !== 'undefined') {
    console.log('✅ Firebase database instance found');
} else {
    console.log('❌ Firebase database instance NOT found');
}

// Test 2: Check Firebase functions
console.log('2. Checking Firebase functions...');
const requiredFunctions = ['collection', 'query', 'getDocs', 'orderBy', 'limit', 'where'];
let functionsAvailable = true;

requiredFunctions.forEach(func => {
    if (typeof window[func] !== 'undefined') {
        console.log(`✅ ${func} function available`);
    } else {
        console.log(`❌ ${func} function NOT available`);
        functionsAvailable = false;
    }
});

// Test 3: Test GameDataManager
console.log('3. Checking GameDataManager...');
if (typeof window.GameDataManager !== 'undefined') {
    console.log('✅ GameDataManager found');
} else {
    console.log('❌ GameDataManager NOT found');
}

// Test 4: Try to connect to Firestore
async function testFirestoreConnection() {
    console.log('4. Testing Firestore connection...');
    
    try {
        if (!window.firebaseDb || !functionsAvailable) {
            throw new Error('Firebase not properly initialized');
        }

        // Try to query the gameWords collection
        const wordsCollection = window.collection(window.firebaseDb, 'gameWords');
        const wordsQuery = window.query(wordsCollection, window.limit(1));
        const snapshot = await window.getDocs(wordsQuery);

        console.log(`✅ Firestore connection successful! Found ${snapshot.size} documents`);
        
        if (snapshot.size > 0) {
            const firstDoc = snapshot.docs[0];
            console.log('📝 Sample document:', firstDoc.data());
        }

        return true;
    } catch (error) {
        console.error('❌ Firestore connection failed:', error);
        return false;
    }
}

// Test 5: Test GameDataManager loading
async function testGameDataManagerLoading() {
    console.log('5. Testing GameDataManager word loading...');
    
    try {
        if (!window.GameDataManager) {
            throw new Error('GameDataManager not available');
        }

        const words = await window.GameDataManager.loadWords(5);
        console.log(`✅ GameDataManager loaded ${words.length} words`);
        
        if (words.length > 0) {
            console.log('📝 Sample words:', words.slice(0, 2));
        }

        return true;
    } catch (error) {
        console.error('❌ GameDataManager loading failed:', error);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Running all Firebase tests...');
    
    const firestoreTest = await testFirestoreConnection();
    const gameDataTest = await testGameDataManagerLoading();
    
    if (firestoreTest && gameDataTest) {
        console.log('🎉 All Firebase tests PASSED!');
    } else {
        console.log('❌ Some Firebase tests FAILED!');
    }
}

// Export functions for manual testing
window.testFirebase = {
    testFirestoreConnection,
    testGameDataManagerLoading,
    runAllTests
};

console.log('🔧 Test functions available: window.testFirebase.runAllTests()');