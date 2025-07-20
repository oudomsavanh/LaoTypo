// 📊 Word Migration Script: Google Sheets → Firebase
// Run this script once to migrate your existing words

// 🔗 Your current Google Sheets URL (replace with actual)
const GOOGLE_SHEETS_URL = 'YOUR_GOOGLE_SHEETS_CSV_URL_HERE';

// 🚀 Migration Function
async function migrateWordsToFirebase() {
  console.log('🚀 Starting word migration from Google Sheets to Firebase...');
  
  try {
    // 1. Check Firebase connection
    const isConnected = await FirebaseSyncManager.checkConnection();
    if (!isConnected) {
      console.error('❌ Firebase connection failed. Please check your config.');
      return;
    }
    
    // 2. Fetch current Google Sheets data
    console.log('📥 Fetching words from Google Sheets...');
    const response = await fetch(GOOGLE_SHEETS_URL);
    const csvText = await response.text();
    
    // 3. Parse CSV data
    const words = parseCSVToWords(csvText);
    console.log(`📊 Parsed ${words.length} words from CSV`);
    
    // 4. Show preview
    console.log('👀 Sample words to migrate:');
    words.slice(0, 3).forEach((word, index) => {
      console.log(`${index + 1}. ${word.lao} → ${word.romanized} → ${word.english} (${word.difficulty})`);
    });
    
    // 5. Confirm migration
    const confirm = window.confirm(`Ready to migrate ${words.length} words to Firebase?`);
    if (!confirm) {
      console.log('❌ Migration cancelled by user');
      return;
    }
    
    // 6. Migrate to Firebase
    console.log('🔄 Migrating words to Firebase...');
    const success = await FirebaseWordManager.addWords(words);
    
    if (success) {
      console.log('✅ Word migration completed successfully!');
      
      // 7. Verify migration
      const stats = await FirebaseWordManager.getWordStats();
      console.log('📊 Firebase word statistics:', stats);
      
      alert(`✅ Migration Complete!\n\nWords added to Firebase:\n• Easy: ${stats.easy}\n• Medium: ${stats.medium}\n• Hard: ${stats.hard}\n\nTotal: ${stats.easy + stats.medium + stats.hard} words`);
      
    } else {
      console.error('❌ Word migration failed');
      alert('❌ Migration failed. Check console for details.');
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    alert('❌ Migration error: ' + error.message);
  }
}

// 📊 Parse CSV to word objects
function parseCSVToWords(csvText) {
  const lines = csvText.trim().split('\n');
  const words = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV line (handle quotes and commas)
    const columns = parseCSVLine(line);
    
    if (columns.length >= 3) {
      const word = {
        lao: columns[0]?.trim() || '',
        romanized: columns[1]?.trim() || '',
        english: columns[2]?.trim() || '',
        difficulty: determineDifficulty(columns[0], columns[1], columns[2]),
        category: columns[3]?.trim() || 'general',
        usage_frequency: Math.floor(Math.random() * 100) + 1, // Random for now
      };
      
      // Only add if all required fields are present
      if (word.lao && word.romanized && word.english) {
        words.push(word);
      }
    }
  }
  
  return words;
}

// 📝 Parse a single CSV line (handles quotes and commas)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current); // Add the last column
  return result;
}

// 🎯 Determine difficulty based on word complexity
function determineDifficulty(lao, romanized, english) {
  // Simple difficulty assignment (you can customize this logic)
  const laoLength = lao.length;
  const englishLength = english.length;
  
  // Count syllables in romanized form
  const syllables = romanized.split(' ').length;
  
  if (laoLength <= 3 && syllables <= 2 && englishLength <= 6) {
    return 'easy';
  } else if (laoLength <= 6 && syllables <= 3 && englishLength <= 10) {
    return 'medium';
  } else {
    return 'hard';
  }
}

// 🧪 Test Firebase word loading
async function testFirebaseWords() {
  console.log('🧪 Testing Firebase word loading...');
  
  try {
    // Test loading words by difficulty
    const easyWords = await FirebaseWordManager.loadWordsByDifficulty('easy');
    const mediumWords = await FirebaseWordManager.loadWordsByDifficulty('medium');
    const hardWords = await FirebaseWordManager.loadWordsByDifficulty('hard');
    const allWords = await FirebaseWordManager.loadWordsByDifficulty('all');
    
    console.log('📊 Word counts by difficulty:');
    console.log(`• Easy: ${easyWords.length}`);
    console.log(`• Medium: ${mediumWords.length}`);
    console.log(`• Hard: ${hardWords.length}`);
    console.log(`• Total: ${allWords.length}`);
    
    // Show sample words
    if (allWords.length > 0) {
      console.log('👀 Sample words from Firebase:');
      allWords.slice(0, 5).forEach((word, index) => {
        console.log(`${index + 1}. ${word.lao} → ${word.romanized} → ${word.english} (${word.difficulty})`);
      });
    }
    
    return allWords;
  } catch (error) {
    console.error('❌ Error testing Firebase words:', error);
    return [];
  }
}

// 🎮 Export functions for use in console
window.migrateWordsToFirebase = migrateWordsToFirebase;
window.testFirebaseWords = testFirebaseWords;

console.log('📊 Word migration script loaded!');
console.log('📝 To migrate words: migrateWordsToFirebase()');
console.log('🧪 To test words: testFirebaseWords()');

// 📋 Migration Instructions
console.log(`
🔥 WORD MIGRATION INSTRUCTIONS:

1. Update your Google Sheets URL in this script
2. Make sure Firebase is configured and connected
3. Run: migrateWordsToFirebase()
4. Confirm the migration when prompted
5. Test with: testFirebaseWords()

Expected CSV format:
Lao Word, Romanized, English, Category
ເຄື່ອງບິນ, khuang bin, airplane, transportation
ນ້ອງ, nong, younger sibling, family
`);