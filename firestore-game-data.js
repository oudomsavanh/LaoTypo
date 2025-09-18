// 📚 Firestore Game Data Manager
// Manages loading game words from Firestore

class FirestoreGameDataManager {
    constructor() {
        this.db = null;
        this.collection = 'gameWords';
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    // Initialize the manager
    async initialize() {
        if (window.firebaseDb) {
            this.db = window.firebaseDb;
            console.log('✅ FirestoreGameDataManager initialized with Firebase');
            return true;
        } else {
            console.warn('⚠️ Firebase not available, using fallback data');
            return false;
        }
    }

    // Load words from Firestore
    async loadWords(limit = 100) {
        try {
            // Check if we have a valid cache
            const cacheKey = `words_${limit}`;
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
                console.log('📚 Using cached words:', cached.data.length);
                return cached.data;
            }

            // Try to load from Firestore
            if (this.db) {
                console.log('📚 Loading words from Firestore...');
                const snapshot = await this.db.collection(this.collection)
                    .orderBy('createdAt', 'desc')
                    .limit(limit)
                    .get();

                if (!snapshot.empty) {
                    const words = snapshot.docs.map(doc => {
                        const data = doc.data() || {};

                        const rawDifficulty = data.difficulty;
                        const numericDifficulty = typeof rawDifficulty === 'number'
                            ? rawDifficulty
                            : parseInt(rawDifficulty, 10);

                        return {
                            context: data.context || '',
                            correct: data.correct || '',
                            incorrect: data.wrong ?? data.incorrect ?? '',
                            difficulty: Number.isFinite(numericDifficulty) ? numericDifficulty : 1
                        };
                    }).filter(word => word.context && word.correct && word.incorrect);

                    if (words.length > 0) {
                        // Cache the results
                        this.cache.set(cacheKey, {
                            data: words,
                            timestamp: Date.now()
                        });

                        console.log('✅ Loaded', words.length, 'words from Firestore');
                        return words;
                    }
                    console.warn('⚠️ No valid words found in Firestore response, falling back to defaults');
                }
            }

            // Fallback to default words if Firestore fails
            console.log('📚 Using fallback words');
            return this.getFallbackWords(limit);

        } catch (error) {
            console.error('❌ Error loading words from Firestore:', error);
            console.log('📚 Falling back to default words');
            return this.getFallbackWords(limit);
        }
    }

    // Get fallback words when Firestore is not available
    getFallbackWords(limit = 100) {
        const fallbackWords = [
            { context: 'ຄຳທັກທາຍ', correct: 'ສະບາຍດີ', incorrect: 'ສະບາຍດິ', difficulty: 1 },
            { context: 'ຄຳຂອບໃຈ', correct: 'ຂອບໃຈ', incorrect: 'ຂອບໃ່', difficulty: 1 },
            { context: 'ຄຳລາ', correct: 'ລາກ່ອນ', incorrect: 'ລາກ່ນ', difficulty: 1 },
            { context: 'ຄຳຂໍໂທດ', correct: 'ຂໍໂທດ', incorrect: 'ຂໍໂຖດ', difficulty: 1 },
            { context: 'ການແນະນຳຕົນ', correct: 'ຊື່', incorrect: 'ຊຶ່', difficulty: 1 },
            { context: 'ການແນະນຳຕົນ', correct: 'ອາຍຸ', incorrect: 'ອາຍູ', difficulty: 1 },
            { context: 'ສະມາຊິກຄອບຄົວ', correct: 'ຄອບຄົວ', incorrect: 'ຄອບຄົົວ', difficulty: 1 },
            { context: 'ສະຖານທີ່ຢູ່', correct: 'ບ້ານ', incorrect: 'ບ້ານນ', difficulty: 1 },
            { context: 'ອາຫານພື້ນຖານ', correct: 'ອາຫານ', incorrect: 'ອາຫານນ', difficulty: 1 },
            { context: 'ເຄື່ອງດື່ມຈຳເປັນ', correct: 'ນ້ຳ', incorrect: 'ນ້ຳຳ', difficulty: 1 },
            { context: 'ອາຫານພື້ນຖານ', correct: 'ເຂົ້າ', incorrect: 'ເຂົ້້າ', difficulty: 1 },
            { context: 'ອາຫານເພີ່ມສຸຂະພາບ', correct: 'ຜັກ', incorrect: 'ຜັັກ', difficulty: 2 },
            { context: 'ອາຫານເພີ່ມຄວາມຫວານ', correct: 'ໝາກໄມ້', incorrect: 'ໝາກໄໝ້', difficulty: 2 },
            { context: 'ການເດີນທາງ', correct: 'ລົດ', incorrect: 'ລົົດ', difficulty: 1 },
            { context: 'ພາຫະນະສ່ວນບຸກຄົນ', correct: 'ລົດຈັກ', incorrect: 'ລົດຈັັກ', difficulty: 2 },
            { context: 'ສະຖານສຶກສາ', correct: 'ໂຮງຮຽນ', incorrect: 'ໂຮງຮຽນນ', difficulty: 2 },
            { context: 'ການເຮັດວຽກ', correct: 'ວຽກ', incorrect: 'ວຽັກ', difficulty: 1 },
            { context: 'ອາຊີບຄູ', correct: 'ຄູ', incorrect: 'ຄົູ', difficulty: 1 },
            { context: 'ຜູ້ຮຽນ', correct: 'ນັກຮຽນ', incorrect: 'ນັກຮຽນນ', difficulty: 1 },
            { context: 'ເວລາເຊົ້າ', correct: 'ເຊົ້າ', incorrect: 'ເຊົ້າ້', difficulty: 1 },
            { context: 'ເວລາກາງຄືນ', correct: 'ຄືນ', incorrect: 'ຄືນນ', difficulty: 1 },
            { context: 'ອາກາດຝົນ', correct: 'ຝົນ', incorrect: 'ຝົນນ', difficulty: 1 },
            { context: 'ອາກາດຮ້ອນ', correct: 'ຮ້ອນ', incorrect: 'ຮ້ອນນ', difficulty: 1 },
            { context: 'ອາກາດເຢັນ', correct: 'ເຢັນ', incorrect: 'ເຢັນນ', difficulty: 1 },
            { context: 'ສີພື້ນຖານ', correct: 'ແດງ', incorrect: 'ແດງງ', difficulty: 1 },
            { context: 'ສີພື້ນຖານ', correct: 'ຂຽວ', incorrect: 'ຂຽວວ', difficulty: 1 },
            { context: 'ສີພື້ນຖານ', correct: 'ຟ້າ', incorrect: 'ຟ້າາ', difficulty: 1 },
            { context: 'ສີພື້ນຖານ', correct: 'ເຫຼືອງ', incorrect: 'ເຫຼືອງງ', difficulty: 1 },
            { context: 'ສີພື້ນຖານ', correct: 'ດຳ', incorrect: 'ດຳຳ', difficulty: 1 },
            { context: 'ສີພື້ນຖານ', correct: 'ຂາວ', incorrect: 'ຂາວວ', difficulty: 1 },
            { context: 'ຂໍ້ມູນປະເທດ', correct: 'ປະເທດລາວ', incorrect: 'ປະເທດລາວວ', difficulty: 2 },
            { context: 'ພາສາທ້ອງຖິ່ນ', correct: 'ພາສາລາວ', incorrect: 'ພາສາລາວວ', difficulty: 2 },
            { context: 'ຄວາມຮູ້ດ້ານເຕັກໂນໂລຊີ', correct: 'ເຕັກໂນໂລຊີ', incorrect: 'ເຕັກໂນໂລຊິ', difficulty: 3 },
            { context: 'ຄວາມຮູ້ດ້ານວິທະຍາສາດ', correct: 'ວິທະຍາສາດ', incorrect: 'ວິທະຍາສາດດ', difficulty: 3 },
            { context: 'ທຳມະຊາດ', correct: 'ສັດ', incorrect: 'ສັັດ', difficulty: 1 },
            { context: 'ທ້ອງຟ້າ', correct: 'ທ້ອງຟ້າ', incorrect: 'ທ້ອງຟ້າາ', difficulty: 1 },
            { context: 'ພື້ນດິນ', correct: 'ດິນ', incorrect: 'ດິນນ', difficulty: 1 },
            { context: 'ດອກໄມ້', correct: 'ດອກໄມ້', incorrect: 'ດອກໄໝ້', difficulty: 2 },
            { context: 'ຕົ້ນໄມ້', correct: 'ຕົ້ນໄມ້', incorrect: 'ຕົ້ນໄໝ້', difficulty: 1 },
            { context: 'ການຮຽນຮູ້', correct: 'ຮຽນ', incorrect: 'ຮຽນນ', difficulty: 1 },
            { context: 'ປຶ້ມຮຽນ', correct: 'ປຶ້ມ', incorrect: 'ປຶ້ມມ', difficulty: 1 },
            { context: 'ເວລາກາງວັນ', correct: 'ວັນ', incorrect: 'ວັນນ', difficulty: 1 },
            { context: 'ແສງສະຫວ່າງ', correct: 'ແສງ', incorrect: 'ແສງງ', difficulty: 2 },
            { context: 'ຄວາມມືດ', correct: 'ມືດ', incorrect: 'ມືດດ', difficulty: 1 },
            { context: 'ກະແສລົມ', correct: 'ລົມ', incorrect: 'ລົມມ', difficulty: 1 },
            { context: 'ແສງແດດ', correct: 'ແດດ', incorrect: 'ແດດດ', difficulty: 1 },
            { context: 'ປາຍຟ້າ', correct: 'ຟ້າຜ່າ', incorrect: 'ຟ້າຜ່າາ', difficulty: 3 }
        ];

        // Return limited number of words
        return fallbackWords.slice(0, limit);
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
        console.log('📚 Cache cleared');
    }

    // Get cache status
    getCacheStatus() {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys())
        };
    }
}

// Create global instance
console.log('📚 Creating GameDataManager instance...');

// Wait for Firebase to be ready before creating GameDataManager
function createGameDataManager() {
    if (window.firebaseConfig && window.firebaseDb) {
        window.GameDataManager = new FirestoreGameDataManager();
        // Initialize the manager
        window.GameDataManager.initialize().then(initialized => {
            if (initialized) {
                console.log('✅ GameDataManager created and initialized with Firebase');
            } else {
                console.log('✅ GameDataManager created with fallback mode');
            }
        });
    } else {
        console.log('⏳ Waiting for Firebase to be ready...');
        setTimeout(createGameDataManager, 100);
    }
}

createGameDataManager();