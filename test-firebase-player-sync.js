// 🧪 Firebase Player Data Sync Test Script
// Run this to test Firebase player data synchronization

// 🔍 Test Firebase Configuration Status
async function testFirebaseConfig() {
    console.log('🔍 Testing Firebase Configuration...');
    
    try {
        // Check if Firebase modules are loaded
        if (typeof FirebasePlayerManager === 'undefined') {
            console.error('❌ Firebase modules not loaded');
            console.log('💡 Make sure firebase-config.js is loaded and configured');
            return false;
        }
        
        // Check if Firebase connection works
        if (typeof FirebaseSyncManager !== 'undefined') {
            const isConnected = await FirebaseSyncManager.checkConnection();
            if (isConnected) {
                console.log('✅ Firebase connection successful');
                return true;
            } else {
                console.error('❌ Firebase connection failed');
                console.log('💡 Check your Firebase config keys in firebase-config.js');
                return false;
            }
        } else {
            console.error('❌ FirebaseSyncManager not available');
            return false;
        }
    } catch (error) {
        console.error('❌ Firebase config test failed:', error);
        console.log('💡 Steps to fix:');
        console.log('1. Create Firebase project at console.firebase.google.com');
        console.log('2. Get your config keys');  
        console.log('3. Update firebase-config.js with your actual keys');
        return false;
    }
}

// 🧪 Test Player Data Operations
async function testPlayerDataOperations() {
    console.log('🧪 Testing Player Data Operations...');
    
    // Test data
    const testUserId = 'test_user_' + Date.now();
    const testPlayerData = {
        profile: {
            displayName: 'Test Player ' + Date.now(),
            joinDate: new Date().toISOString()
        },
        settings: {
            difficulty: 'medium',
            timer: true,
            sound: true,
            music: false
        },
        stats: {
            gamesPlayed: 5,
            bestStreak: 12,
            totalScore: 750,
            averageAccuracy: 85.5
        },
        achievements: {
            firstWin: true,
            streak10: true,
            perfectGame: false
        }
    };
    
    try {
        // Test 1: Save player data
        console.log('📤 Test 1: Saving player data...');
        const saveResult = await FirebasePlayerManager.savePlayerData(testUserId, testPlayerData);
        if (saveResult) {
            console.log('✅ Save successful');
        } else {
            console.error('❌ Save failed');
            return false;
        }
        
        // Test 2: Load player data
        console.log('📥 Test 2: Loading player data...');
        const loadedData = await FirebasePlayerManager.loadPlayerData(testUserId);
        if (loadedData) {
            console.log('✅ Load successful');
            console.log('📊 Loaded data:', {
                displayName: loadedData.profile?.displayName,
                gamesPlayed: loadedData.stats?.gamesPlayed,
                difficulty: loadedData.settings?.difficulty
            });
        } else {
            console.error('❌ Load failed');
            return false;
        }
        
        // Test 3: Update stats
        console.log('📈 Test 3: Updating player stats...');
        const newStats = {
            gamesPlayed: 10,
            bestStreak: 15,
            totalScore: 1200,
            averageAccuracy: 88.0
        };
        const updateResult = await FirebasePlayerManager.updatePlayerStats(testUserId, newStats);
        if (updateResult) {
            console.log('✅ Stats update successful');
        } else {
            console.error('❌ Stats update failed');
            return false;
        }
        
        // Test 4: Verify updated data
        console.log('🔍 Test 4: Verifying updated data...');
        const updatedData = await FirebasePlayerManager.loadPlayerData(testUserId);
        if (updatedData && updatedData.stats.gamesPlayed === 10) {
            console.log('✅ Data verification successful');
            console.log('📊 Updated stats:', updatedData.stats);
        } else {
            console.error('❌ Data verification failed');
            return false;
        }
        
        console.log('🎉 All player data tests passed!');
        return true;
        
    } catch (error) {
        console.error('❌ Player data test error:', error);
        return false;
    }
}

// 🔄 Test Current User Sync
async function testCurrentUserSync() {
    console.log('🔄 Testing Current User Data Sync...');
    
    try {
        // Get current user data from the game
        const currentUserId = window.userId || 'test_fallback';
        const currentDisplayName = window.displayName || 'Test User';
        const currentSettings = window.settings || {};
        const currentStats = window.stats || {};
        
        console.log('👤 Current user data:', {
            userId: currentUserId,
            displayName: currentDisplayName,
            settings: currentSettings,
            stats: currentStats
        });
        
        // Test sync to cloud
        console.log('☁️ Testing sync to cloud...');
        const localData = {
            displayName: currentDisplayName,
            settings: currentSettings,
            stats: currentStats,
            personalRecords: window.personalRecords || {}
        };
        
        const syncToCloudResult = await FirebaseSyncManager.syncToCloud(currentUserId, localData);
        if (syncToCloudResult) {
            console.log('✅ Sync to cloud successful');
        } else {
            console.error('❌ Sync to cloud failed');
            return false;
        }
        
        // Test sync from cloud
        console.log('📥 Testing sync from cloud...');
        const cloudData = await FirebaseSyncManager.syncFromCloud(currentUserId);
        if (cloudData) {
            console.log('✅ Sync from cloud successful');
            console.log('☁️ Cloud data:', cloudData);
        } else {
            console.log('ℹ️ No cloud data found (this is normal for first sync)');
        }
        
        console.log('🎉 Current user sync test completed!');
        return true;
        
    } catch (error) {
        console.error('❌ Current user sync test error:', error);
        return false;
    }
}

// 🎮 Complete Firebase Test Suite
async function runCompleteFirebaseTest() {
    console.log('🚀 Starting Complete Firebase Player Data Test...');
    console.log('=' .repeat(50));
    
    // Step 1: Test configuration
    const configOk = await testFirebaseConfig();
    if (!configOk) {
        console.log('🛑 Firebase not configured. Please set up Firebase first.');
        showFirebaseSetupInstructions();
        return;
    }
    
    // Step 2: Test player data operations
    const playerOpsOk = await testPlayerDataOperations();
    if (!playerOpsOk) {
        console.log('🛑 Player data operations failed.');
        return;
    }
    
    // Step 3: Test current user sync
    const syncOk = await testCurrentUserSync();
    if (!syncOk) {
        console.log('🛑 Current user sync failed.');
        return;
    }
    
    // All tests passed
    console.log('=' .repeat(50));
    console.log('🎉 ALL FIREBASE TESTS PASSED!');
    console.log('✅ Your Firebase player data sync is working perfectly!');
    console.log('📱 You can now:');
    console.log('  • Play on multiple devices');
    console.log('  • Never lose your progress');
    console.log('  • Access global leaderboards');
    console.log('  • Sync achievements across devices');
    console.log('=' .repeat(50));
}

// 📋 Show setup instructions if Firebase not configured
function showFirebaseSetupInstructions() {
    console.log('');
    console.log('🔥 FIREBASE SETUP REQUIRED');
    console.log('=' .repeat(40));
    console.log('Follow these steps to enable Firebase:');
    console.log('');
    console.log('1. 🌐 Go to: https://console.firebase.google.com/');
    console.log('2. 📝 Create new project: "LaoTypo"');
    console.log('3. 🗄️ Enable Firestore Database (test mode)');
    console.log('4. 🔧 Get web app config keys');
    console.log('5. 📄 Update firebase-config.js with your keys');
    console.log('');
    console.log('📖 See FIREBASE_SETUP.md for detailed instructions');
    console.log('=' .repeat(40));
}

// 🎯 Quick Test Functions (for console use)
async function quickPlayerTest() {
    console.log('⚡ Quick Player Data Test...');
    const configured = await testFirebaseConfig();
    if (configured) {
        await testCurrentUserSync();
    }
}

async function quickConnectionTest() {
    console.log('⚡ Quick Connection Test...');
    await testFirebaseConfig();
}

// 🚀 Export test functions
window.runCompleteFirebaseTest = runCompleteFirebaseTest;
window.testFirebaseConfig = testFirebaseConfig;
window.testPlayerDataOperations = testPlayerDataOperations;
window.testCurrentUserSync = testCurrentUserSync;
window.quickPlayerTest = quickPlayerTest;
window.quickConnectionTest = quickConnectionTest;

console.log('🧪 Firebase Player Data Test Script Loaded!');
console.log('');
console.log('🎯 Available test commands:');
console.log('  runCompleteFirebaseTest()     - Full test suite');
console.log('  quickPlayerTest()             - Quick player sync test');
console.log('  quickConnectionTest()         - Test Firebase connection');
console.log('  testFirebaseConfig()          - Test configuration only');
console.log('');

// Auto-run quick test if Firebase is available
setTimeout(async () => {
    if (typeof FirebasePlayerManager !== 'undefined') {
        console.log('🚀 Auto-running quick connection test...');
        await quickConnectionTest();
    } else {
        console.log('⏳ Firebase modules not yet loaded. Run tests manually when ready.');
        console.log('💡 Use: runCompleteFirebaseTest()');
    }
}, 2000);