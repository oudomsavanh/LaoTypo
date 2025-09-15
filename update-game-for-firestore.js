#!/usr/bin/env node

/**
 * Script to update game files to use Firestore instead of Google Sheets
 */

const fs = require('fs');

const filesToUpdate = [
    'gameplay.html',
    'gameplay_v2.html'
];

console.log('🔄 Updating game files to use Firestore...');

filesToUpdate.forEach(file => {
    if (!fs.existsSync(file)) {
        console.log(`⚠️  File not found: ${file}`);
        return;
    }

    console.log(`📝 Updating ${file}...`);
    let content = fs.readFileSync(file, 'utf8');

    // 1. Add Firestore script include
    content = content.replace(
        '<script src="firebase-config.js"></script>',
        `<script src="firebase-config.js"></script>
    <script src="firestore-game-data.js"></script>`
    );

    // 2. Replace the loadGameContent function
    const oldLoadFunction = `        // Load game content data
        async function loadGameContent() {
            try {
                wordLoadingStatus.textContent = 'Loading game content...';
                wordLoadingStatus.style.color = 'var(--main-color)';
                
                console.log("Attempting to fetch from:", GAME_DATA_URL);
                
                let response;
                try {
                    // Try CORS proxy first
                    const corsProxyUrl = \`https://api.allorigins.win/raw?url=\${encodeURIComponent(GAME_DATA_URL)}\`;
                    console.log("Trying CORS proxy:", corsProxyUrl);
                    response = await fetch(corsProxyUrl);
                } catch (proxyError) {
                    console.log("CORS proxy failed, trying alternative...");
                    try {
                        const corsProxyUrl2 = \`https://cors-anywhere.herokuapp.com/\${GAME_DATA_URL}\`;
                        response = await fetch(corsProxyUrl2);
                    } catch (proxyError2) {
                        console.log("Alternative CORS proxy failed, trying direct fetch...");
                        console.log("Trying direct fetch:", GAME_DATA_URL);
                        response = await fetch(GAME_DATA_URL, {
                            mode: 'cors',
                            headers: {
                                'Accept': 'text/csv',
                                'Content-Type': 'text/csv'
                            }
                        });
                    }
                }
                
                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
                }
                
                const csvText = await response.text();
                console.log("CSV data received, length:", csvText.length);
                
                // Parse CSV data: A=context, B=correct, C=wrong, D=difficulty (optional)
                const lines = csvText.trim().split('\\n');
                wordPairs = [];
                
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;
                    
                    // Simple CSV parsing - split by comma and clean quotes
                    const columns = line.split(',').map(col => col.replace(/^"|"$/g, '').trim());
                    
                    if (columns.length >= 3) {
                        const context = columns[0] || '';
                        const correct = columns[1] || '';
                        const wrong = columns[2] || '';
                        const difficulty = columns[3] || 'medium';
                        
                        if (context && correct && wrong) {
                            wordPairs.push({ context, correct, wrong, difficulty });
                        }
                    }
                }
                
                if (wordPairs.length === 0) {
                    throw new Error('No valid word pairs found in CSV data');
                }
                
                console.log("Game content loaded:", wordPairs.length, "entries");
                
                wordLoadingStatus.textContent = \`Loaded \${wordPairs.length} words\`;
                wordLoadingStatus.style.color = 'var(--success-color)';
                
                // Hide loading status after 2 seconds
                setTimeout(() => {
                    if (wordLoadingStatus) {
                        wordLoadingStatus.style.display = 'none';
                    }
                }, 2000);
                
            } catch (error) {
                console.error("Error loading game content:", error);
                wordLoadingStatus.textContent = 'Error loading game content. Please try again.';
                wordLoadingStatus.style.color = 'var(--error-color)';
                
                // Show retry button
                const retryButton = document.createElement('button');
                retryButton.textContent = 'Retry';
                retryButton.className = 'retry-button';
                retryButton.onclick = () => {
                    wordLoadingStatus.innerHTML = 'Loading game content...';
                    wordLoadingStatus.style.color = 'var(--main-color)';
                    loadGameContent();
                };
                wordLoadingStatus.appendChild(retryButton);
            }
        }`;

    const newLoadFunction = `        // Load game content from Firestore
        async function loadGameContent() {
            try {
                wordLoadingStatus.textContent = 'Loading game content...';
                wordLoadingStatus.style.color = 'var(--main-color)';
                
                console.log("Loading words from Firestore...");
                
                // Load words from Firestore
                const words = await GameDataManager.loadWords(200); // Load up to 200 words
                
                if (words.length === 0) {
                    throw new Error('No words found in database');
                }
                
                // Convert to wordPairs format
                wordPairs = words.map(word => ({
                    context: word.context,
                    correct: word.correct,
                    wrong: word.wrong,
                    difficulty: word.difficulty || 'medium'
                }));
                
                console.log("Game content loaded:", wordPairs.length, "entries");
                
                wordLoadingStatus.textContent = \`Loaded \${wordPairs.length} words\`;
                wordLoadingStatus.style.color = 'var(--success-color)';
                
                // Cache words for offline use
                GameDataManager.cacheWords();
                
                // Hide loading status after 2 seconds
                setTimeout(() => {
                    if (wordLoadingStatus) {
                        wordLoadingStatus.style.display = 'none';
                    }
                }, 2000);
                
            } catch (error) {
                console.error("Error loading game content:", error);
                wordLoadingStatus.textContent = 'Error loading game content. Please try again.';
                wordLoadingStatus.style.color = 'var(--error-color)';
                
                // Show retry button
                const retryButton = document.createElement('button');
                retryButton.textContent = 'Retry';
                retryButton.className = 'retry-button';
                retryButton.onclick = () => {
                    wordLoadingStatus.innerHTML = 'Loading game content...';
                    wordLoadingStatus.style.color = 'var(--main-color)';
                    loadGameContent();
                };
                wordLoadingStatus.appendChild(retryButton);
            }
        }`;

    content = content.replace(oldLoadFunction, newLoadFunction);

    // 3. Remove the old GAME_DATA_URL constant
    content = content.replace(
        /        \/\/ Game content data source\n        const GAME_DATA_URL = '[^']+';/g,
        '        // Game content loaded from Firestore'
    );

    // 4. Update the test function
    content = content.replace(
        /        \/\/ Test game data connection \(for debugging\)\n        async function testGameDataConnection\(\) \{\n            console\.log\("Testing game data connection\.\.\."\);\n            console\.log\("URL:", GAME_DATA_URL\);\n            \n            try \{\n                const response = await fetch\(GAME_DATA_URL\);\n                console\.log\("Response status:", response\.status\);\n                console\.log\("Response headers:", response\.headers\);\n                \n                if \(response\.ok\) \{\n                    const text = await response\.text\(\);\n                    console\.log\("Response preview:", text\.substring\(0, 200\)\);\n                    console\.log\("✅ Connection successful!"\);\n                } else \{\n                    console\.log\("❌ Connection failed:", response\.statusText\);\n                }\n            } catch \(error\) \{\n                console\.log\("❌ Connection error:", error\);\n            }\n        \}/g,
        `        // Test Firestore connection (for debugging)
        async function testFirestoreConnection() {
            console.log("Testing Firestore connection...");
            
            try {
                const stats = GameDataManager.getStats();
                console.log("Firestore stats:", stats);
                console.log("✅ Firestore connection successful!");
            } catch (error) {
                console.log("❌ Firestore connection error:", error);
            }
        }`
    );

    // 5. Update function calls
    content = content.replace(/testGameDataConnection/g, 'testFirestoreConnection');

    // Save the updated file
    fs.writeFileSync(file, content);
    console.log(`✅ Updated ${file}`);
});

console.log('🎉 All files updated successfully!');
console.log('\n📋 Next steps:');
console.log('1. Run: node export-to-firebase.js');
console.log('2. Follow the Firebase import commands');
console.log('3. Test your game with Firestore data');