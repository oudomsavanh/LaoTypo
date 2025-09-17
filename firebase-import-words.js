/**
 * Firebase Words Import Script
 * 
 * This script helps you import game words into your Firebase Firestore database.
 * Run this script in your browser console or as a Node.js script.
 */

// Sample game words data - replace with your actual words
const gameWords = [
    // Easy words (difficulty: 1)
    { context: 'ສະບາຍດີ', correct: 'ສະບາຍດີ', incorrect: 'ສະບາຍດີີ', difficulty: 1, order: 1 },
    { context: 'ຂອບໃຈ', correct: 'ຂອບໃຈ', incorrect: 'ຂອບຈັຍ', difficulty: 1, order: 2 },
    { context: 'ລາວ', correct: 'ລາວ', incorrect: 'ລາຍ', difficulty: 1, order: 3 },
    { context: 'ສວຍງາມ', correct: 'ສວຍງາມ', incorrect: 'ສວຍງາມມ', difficulty: 1, order: 4 },
    { context: 'ດີ', correct: 'ດີ', incorrect: 'ດີີ', difficulty: 1, order: 5 },
    { context: 'ບໍ່ດີ', correct: 'ບໍ່ດີ', incorrect: 'ບໍດີ', difficulty: 1, order: 6 },
    { context: 'ຂໍອະໄພ', correct: 'ຂໍອະໄພ', incorrect: 'ຂໍອະໄພພ', difficulty: 1, order: 7 },
    { context: 'ຍິນດີ', correct: 'ຍິນດີ', incorrect: 'ຍິນດີີ', difficulty: 1, order: 8 },
    { context: 'ຄອບຄົວ', correct: 'ຄອບຄົວ', incorrect: 'ຄອບຄົວວ', difficulty: 1, order: 9 },
    { context: 'ເຮືອນ', correct: 'ເຮືອນ', incorrect: 'ເຮືອນນ', difficulty: 1, order: 10 },
    { context: 'ອາຫານ', correct: 'ອາຫານ', incorrect: 'ອາຫານນ', difficulty: 1, order: 11 },
    { context: 'ນ້ຳ', correct: 'ນ້ຳ', incorrect: 'ນຳ', difficulty: 1, order: 12 },
    { context: 'ອາກາດ', correct: 'ອາກາດ', incorrect: 'ອາກາດດ', difficulty: 1, order: 13 },
    { context: 'ດອກໄມ້', correct: 'ດອກໄມ້', incorrect: 'ດອກໄມ້້', difficulty: 1, order: 14 },
    { context: 'ສັດ', correct: 'ສັດ', incorrect: 'ສັດດ', difficulty: 1, order: 15 },
    
    // Medium words (difficulty: 2)
    { context: "ຄົນທີ່ຂັບລົດ", correct: "ຄົນຂັບ", incorrect: "ຄົນຂັບຣ໌", difficulty: 2, order: 16 },
    { context: "ຜູ້ທີ່ມັກເວົ້າ", correct: "ຄົນຂີ້ຄຸຍ", incorrect: "ຄົນຂີຄຸ້ຍ", difficulty: 2, order: 17 },
    { context: "ຜູ້ທີ່ມັກຫຼອກລວງ", correct: "ຄົນຂີ້ຕົວະ", incorrect: "ຄົນຂີຕົ້ວະ", difficulty: 2, order: 18 },
    { context: 'ພາສາລາວ', correct: 'ພາສາລາວ', incorrect: 'ພາສາລາຍ', difficulty: 2, order: 19 },
    { context: 'ໂຮງຮຽນ', correct: 'ໂຮງຮຽນ', incorrect: 'ໂຮງຮິຽນ', difficulty: 2, order: 20 },
    { context: 'ປະເທດລາວ', correct: 'ປະເທດລາວ', incorrect: 'ປະເທດລາຍ', difficulty: 2, order: 21 },
    { context: 'ວັດທະນະທຳ', correct: 'ວັດທະນະທຳ', incorrect: 'ວັດທະນະທຳຳ', difficulty: 2, order: 22 },
    { context: 'ປະຫວັດສາດ', correct: 'ປະຫວັດສາດ', incorrect: 'ປະຫວັດສາດດ', difficulty: 2, order: 23 },
    { context: 'ການສຶກສາ', correct: 'ການສຶກສາ', incorrect: 'ການສຶກສາະ', difficulty: 2, order: 24 },
    { context: 'ການແພດ', correct: 'ການແພດ', incorrect: 'ການແພດດ', difficulty: 2, order: 25 },
    { context: 'ການທ່ອງທ່ຽວ', correct: 'ການທ່ອງທ່ຽວ', incorrect: 'ການທ່ອງທ່ຽວວ', difficulty: 2, order: 26 },
    { context: 'ການຄ້າ', correct: 'ການຄ້າ', incorrect: 'ການຄ້າະ', difficulty: 2, order: 27 },
    { context: 'ການກະສິກຳ', correct: 'ການກະສິກຳ', incorrect: 'ການກະສິກຳຳ', difficulty: 2, order: 28 },
    { context: 'ການອຸດສາຫະກຳ', correct: 'ການອຸດສາຫະກຳ', incorrect: 'ການອຸດສາຫະກຳຳ', difficulty: 2, order: 29 },
    
    // Hard words (difficulty: 3)
    { context: 'ຄອມພິວເຕີ', correct: 'ຄອມພິວເຕີ', incorrect: 'ຄອມພິຍເຕີ', difficulty: 3, order: 30 },
    { context: 'ວິທະຍາສາດ', correct: 'ວິທະຍາສາດ', incorrect: 'ວິທະຍາສາຍ', difficulty: 3, order: 31 },
    { context: 'ເຕັກໂນໂລຊີ', correct: 'ເຕັກໂນໂລຊີ', incorrect: 'ເຕັກໂນໂລຊິ', difficulty: 3, order: 32 },
    { context: 'ການພັດທະນາ', correct: 'ການພັດທະນາ', incorrect: 'ການພັດທະນາະ', difficulty: 3, order: 33 },
    { context: 'ການວິໄຈ', correct: 'ການວິໄຈ', incorrect: 'ການວິໄຈຈ', difficulty: 3, order: 34 },
    { context: 'ການປະດິດສ້າງ', correct: 'ການປະດິດສ້າງ', incorrect: 'ການປະດິດສ້າງງ', difficulty: 3, order: 35 },
    { context: 'ການປະຕິບັດ', correct: 'ການປະຕິບັດ', incorrect: 'ການປະຕິບັດດ', difficulty: 3, order: 36 },
    { context: 'ການປະສົບຜົນສຳເລັດ', correct: 'ການປະສົບຜົນສຳເລັດ', incorrect: 'ການປະສົບຜົນສຳເລັດດ', difficulty: 3, order: 37 },
    { context: 'ການປະສົມປະສານ', correct: 'ການປະສົມປະສານ', incorrect: 'ການປະສົມປະສານນ', difficulty: 3, order: 38 },
    { context: 'ການປະຕິບັດຕາມ', correct: 'ການປະຕິບັດຕາມ', incorrect: 'ການປະຕິບັດຕາມມ', difficulty: 3, order: 39 }
];

// Function to import words to Firebase
async function importWordsToFirebase() {
    try {
        console.log('🔥 Starting Firebase import...');
        
        // Check if Firebase is available
        if (typeof FirebaseWordManager === 'undefined') {
            throw new Error('Firebase not loaded. Make sure firebase-config.js is loaded first.');
        }
        
        // Import words using the existing FirebaseWordManager
        const success = await FirebaseWordManager.addWords(gameWords);
        
        if (success) {
            console.log('✅ Successfully imported', gameWords.length, 'words to Firebase!');
            console.log('🎮 Your game should now load words from Firebase.');
        } else {
            console.error('❌ Failed to import words to Firebase');
        }
        
    } catch (error) {
        console.error('❌ Error importing words:', error);
    }
}

// Function to check current Firebase data
async function checkFirebaseData() {
    try {
        console.log('🔍 Checking Firebase data...');
        
        if (typeof FirebaseWordManager === 'undefined') {
            throw new Error('Firebase not loaded. Make sure firebase-config.js is loaded first.');
        }
        
        const stats = await FirebaseWordManager.getWordStats();
        console.log('📊 Current Firebase word statistics:', stats);
        
        const words = await FirebaseWordManager.loadWordsByDifficulty('all');
        console.log('📚 Total words in Firebase:', words.length);
        
    } catch (error) {
        console.error('❌ Error checking Firebase data:', error);
    }
}

// Export functions for use
window.importWordsToFirebase = importWordsToFirebase;
window.checkFirebaseData = checkFirebaseData;

console.log('🔥 Firebase Import Script Loaded!');
console.log('📝 Available functions:');
console.log('  - importWordsToFirebase() - Import words to Firebase');
console.log('  - checkFirebaseData() - Check current Firebase data');