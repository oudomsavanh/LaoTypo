#!/usr/bin/env node

/**
 * Google Sheets to Firebase Firestore Export Script
 * 
 * This script:
 * 1. Fetches data from your Google Sheets CSV
 * 2. Converts it to Firestore format
 * 3. Uploads to your Firebase project
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    // Your Google Sheets CSV URL
    GOOGLE_SHEETS_URL: 'https://docs.google.com/spreadsheets/d/1jhdIOg9aqy7Jb28pqnz9I5F23uQ8HYyABvvMxqSzGr0/export?format=csv&gid=0',
    
    // Firebase project and collection
    FIREBASE_PROJECT_ID: 'laotypo-phase1',
    FIRESTORE_COLLECTION: 'gameWords',
    
    // CSV column mapping
    COLUMNS: {
        CONTEXT: 0,    // Column A - Context/Question
        CORRECT: 1,    // Column B - Correct answer
        WRONG: 2,      // Column C - Wrong answer
        DIFFICULTY: 3  // Column D - Difficulty level (optional)
    }
};

console.log('🔥 Starting Google Sheets to Firebase export...');

// Step 1: Fetch CSV data
async function fetchCSVData() {
    console.log('📥 Fetching data from Google Sheets...');
    
    try {
        // Try direct fetch first
        let response = await fetch(CONFIG.GOOGLE_SHEETS_URL);
        
        if (!response.ok) {
            // Try with CORS proxy
            const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(CONFIG.GOOGLE_SHEETS_URL)}`;
            console.log('🔄 Trying with CORS proxy...');
            response = await fetch(corsProxyUrl);
        }
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const csvText = await response.text();
        console.log('✅ CSV data fetched successfully');
        return csvText;
        
    } catch (error) {
        console.error('❌ Error fetching CSV data:', error.message);
        console.log('\n💡 Manual fallback:');
        console.log('1. Open your Google Sheet');
        console.log('2. File → Download → CSV');
        console.log('3. Save as "game_words.csv" in this directory');
        console.log('4. Run: node export-to-firebase.js --use-local-csv');
        process.exit(1);
    }
}

// Step 2: Parse CSV data
function parseCSV(csvText) {
    console.log('📊 Parsing CSV data...');
    
    const lines = csvText.trim().split('\n');
    const words = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple CSV parsing (handles basic cases)
        const columns = line.split(',').map(col => col.replace(/^"|"$/g, '').trim());
        
        if (columns.length < 3) {
            console.warn(`⚠️  Skipping line ${i + 1}: insufficient columns`);
            continue;
        }
        
        const wordData = {
            context: columns[CONFIG.COLUMNS.CONTEXT] || '',
            correct: columns[CONFIG.COLUMNS.CORRECT] || '',
            wrong: columns[CONFIG.COLUMNS.WRONG] || '',
            difficulty: columns[CONFIG.COLUMNS.DIFFICULTY] || 'medium',
            order: i + 1
        };
        
        // Validate required fields
        if (wordData.context && wordData.correct && wordData.wrong) {
            words.push(wordData);
        } else {
            console.warn(`⚠️  Skipping line ${i + 1}: missing required fields`);
        }
    }
    
    console.log(`✅ Parsed ${words.length} valid word entries`);
    return words;
}

// Step 3: Generate Firebase import data
function generateFirebaseData(words) {
    console.log('🔥 Generating Firebase import data...');
    
    const firebaseData = {
        gameWords: {}
    };
    
    words.forEach((word, index) => {
        const docId = `word_${String(index + 1).padStart(4, '0')}`;
        firebaseData.gameWords[docId] = {
            context: word.context,
            correct: word.correct,
            wrong: word.wrong,
            difficulty: word.difficulty,
            order: word.order,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    });
    
    console.log(`✅ Generated Firebase data for ${Object.keys(firebaseData.gameWords).length} documents`);
    return firebaseData;
}

// Step 4: Save Firebase import files
function saveFirebaseFiles(firebaseData) {
    console.log('💾 Saving Firebase import files...');
    
    // Save as JSON for Firebase CLI import
    fs.writeFileSync('firebase-import.json', JSON.stringify(firebaseData, null, 2));
    
    // Save as individual documents for manual import
    const individualDocs = {};
    Object.entries(firebaseData.gameWords).forEach(([docId, data]) => {
        individualDocs[docId] = data;
    });
    
    fs.writeFileSync('firebase-individual-docs.json', JSON.stringify(individualDocs, null, 2));
    
    // Save as CSV for backup
    const csvLines = ['context,correct,wrong,difficulty,order'];
    Object.values(firebaseData.gameWords).forEach(word => {
        csvLines.push(`"${word.context}","${word.correct}","${word.wrong}","${word.difficulty}",${word.order}`);
    });
    fs.writeFileSync('firebase-export.csv', csvLines.join('\n'));
    
    console.log('✅ Files saved:');
    console.log('  - firebase-import.json (for Firebase CLI)');
    console.log('  - firebase-individual-docs.json (for manual import)');
    console.log('  - firebase-export.csv (backup)');
}

// Step 5: Generate Firebase CLI commands
function generateFirebaseCommands() {
    console.log('📋 Generating Firebase CLI commands...');
    
    const commands = `
# Firebase CLI Commands to Import Data

## 1. Install Firebase CLI (if not already installed)
npm install -g firebase-tools

## 2. Login to Firebase
firebase login

## 3. Initialize Firebase project (if not already done)
firebase init firestore

## 4. Import the data
firebase firestore:import firebase-import.json

## 5. Verify the import
firebase firestore:get gameWords --limit 5

## Alternative: Manual import via Firebase Console
1. Go to Firebase Console → Firestore Database
2. Click "Start collection"
3. Collection ID: "gameWords"
4. Import the firebase-individual-docs.json file
`;

    fs.writeFileSync('firebase-import-commands.txt', commands);
    console.log('✅ Firebase commands saved to firebase-import-commands.txt');
}

// Main execution
async function main() {
    try {
        // Check for local CSV file
        const useLocalCSV = process.argv.includes('--use-local-csv');
        
        let csvText;
        if (useLocalCSV && fs.existsSync('game_words.csv')) {
            console.log('📁 Using local CSV file...');
            csvText = fs.readFileSync('game_words.csv', 'utf8');
        } else {
            csvText = await fetchCSVData();
        }
        
        const words = parseCSV(csvText);
        const firebaseData = generateFirebaseData(words);
        saveFirebaseFiles(firebaseData);
        generateFirebaseCommands();
        
        console.log('\n🎉 Export completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Review the generated files');
        console.log('2. Run the Firebase CLI commands');
        console.log('3. Update your game code to use Firestore');
        
    } catch (error) {
        console.error('❌ Export failed:', error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { fetchCSVData, parseCSV, generateFirebaseData };