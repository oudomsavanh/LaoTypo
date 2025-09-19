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
                
                // Try with orderBy first, fallback to simple query if it fails
                let snapshot;
                try {
                    snapshot = await window.getDocs(
                        window.query(
                            window.collection(this.db, this.collection),
                            window.orderBy('createdAt', 'desc'),
                            window.limit(limit)
                        )
                    );
                } catch (orderByError) {
                    console.warn('⚠️ orderBy failed, trying simple query:', orderByError.message);
                    snapshot = await window.getDocs(
                        window.query(
                            window.collection(this.db, this.collection),
                            window.limit(limit)
                        )
                    );
                }

                if (!snapshot.empty) {
                    console.log('📥 Raw snapshot size:', snapshot.size);
                    const words = snapshot.docs.map(doc => {
                        const data = doc.data();
                        console.log('📄 Document data:', doc.id, data);
                        return {
                            id: doc.id,
                            lao: data.lao || '',
                            english: data.english || '',
                            difficulty: data.difficulty || 'easy',
                            category: data.category || 'general'
                        };
                    });

                    // Cache the results
                    this.cache.set(cacheKey, {
                        data: words,
                        timestamp: Date.now()
                    });

                    console.log('✅ Loaded', words.length, 'words from Firestore');
                    return words;
                } else {
                    console.warn('⚠️ Firestore query returned empty snapshot');
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
            { id: '1', lao: 'ສະບາຍດີ', english: 'Hello', difficulty: 'easy', category: 'greeting' },
            { id: '2', lao: 'ຂອບໃຈ', english: 'Thank you', difficulty: 'easy', category: 'greeting' },
            { id: '3', lao: 'ລາກ່ອນ', english: 'Goodbye', difficulty: 'easy', category: 'greeting' },
            { id: '4', lao: 'ຂໍໂທດ', english: 'Sorry', difficulty: 'easy', category: 'greeting' },
            { id: '5', lao: 'ຊື່', english: 'Name', difficulty: 'easy', category: 'basic' },
            { id: '6', lao: 'ອາຍຸ', english: 'Age', difficulty: 'easy', category: 'basic' },
            { id: '7', lao: 'ບ້ານ', english: 'House', difficulty: 'easy', category: 'basic' },
            { id: '8', lao: 'ຄອບຄົວ', english: 'Family', difficulty: 'easy', category: 'basic' },
            { id: '9', lao: 'ເດັກ', english: 'Child', difficulty: 'easy', category: 'basic' },
            { id: '10', lao: 'ຜູ້ໃຫຍ່', english: 'Adult', difficulty: 'easy', category: 'basic' },
            { id: '11', lao: 'ອາຫານ', english: 'Food', difficulty: 'medium', category: 'food' },
            { id: '12', lao: 'ນ້ຳ', english: 'Water', difficulty: 'easy', category: 'food' },
            { id: '13', lao: 'ເຂົ້າ', english: 'Rice', difficulty: 'easy', category: 'food' },
            { id: '14', lao: 'ຜັກ', english: 'Vegetable', difficulty: 'medium', category: 'food' },
            { id: '15', lao: 'ໝາກໄມ້', english: 'Fruit', difficulty: 'medium', category: 'food' },
            { id: '16', lao: 'ສັດ', english: 'Animal', difficulty: 'easy', category: 'nature' },
            { id: '17', lao: 'ຕົ້ນໄມ້', english: 'Tree', difficulty: 'easy', category: 'nature' },
            { id: '18', lao: 'ດອກໄມ້', english: 'Flower', difficulty: 'medium', category: 'nature' },
            { id: '19', lao: 'ທ້ອງຟ້າ', english: 'Sky', difficulty: 'easy', category: 'nature' },
            { id: '20', lao: 'ດິນ', english: 'Earth', difficulty: 'easy', category: 'nature' },
            { id: '21', lao: 'ຮຽນ', english: 'Study', difficulty: 'easy', category: 'education' },
            { id: '22', lao: 'ປຶ້ມ', english: 'Book', difficulty: 'easy', category: 'education' },
            { id: '23', lao: 'ຄູ', english: 'Teacher', difficulty: 'easy', category: 'education' },
            { id: '24', lao: 'ນັກຮຽນ', english: 'Student', difficulty: 'easy', category: 'education' },
            { id: '25', lao: 'ໂຮງຮຽນ', english: 'School', difficulty: 'medium', category: 'education' },
            { id: '26', lao: 'ວຽກ', english: 'Work', difficulty: 'easy', category: 'work' },
            { id: '27', lao: 'ອອບຟິດ', english: 'Office', difficulty: 'medium', category: 'work' },
            { id: '28', lao: 'ລົດ', english: 'Car', difficulty: 'easy', category: 'transport' },
            { id: '29', lao: 'ລົດຈັກ', english: 'Motorcycle', difficulty: 'medium', category: 'transport' },
            { id: '30', lao: 'ລົດເມ', english: 'Bus', difficulty: 'easy', category: 'transport' },
            { id: '31', lao: 'ສີ', english: 'Color', difficulty: 'easy', category: 'basic' },
            { id: '32', lao: 'ແດງ', english: 'Red', difficulty: 'easy', category: 'color' },
            { id: '33', lao: 'ຂຽວ', english: 'Green', difficulty: 'easy', category: 'color' },
            { id: '34', lao: 'ຟ້າ', english: 'Blue', difficulty: 'easy', category: 'color' },
            { id: '35', lao: 'ເຫຼືອງ', english: 'Yellow', difficulty: 'easy', category: 'color' },
            { id: '36', lao: 'ດຳ', english: 'Black', difficulty: 'easy', category: 'color' },
            { id: '37', lao: 'ຂາວ', english: 'White', difficulty: 'easy', category: 'color' },
            { id: '38', lao: 'ເວລາ', english: 'Time', difficulty: 'medium', category: 'basic' },
            { id: '39', lao: 'ວັນ', english: 'Day', difficulty: 'easy', category: 'time' },
            { id: '40', lao: 'ຄືນ', english: 'Night', difficulty: 'easy', category: 'time' },
            { id: '41', lao: 'ເຊົ້າ', english: 'Morning', difficulty: 'easy', category: 'time' },
            { id: '42', lao: 'ບ່າຍ', english: 'Afternoon', difficulty: 'medium', category: 'time' },
            { id: '43', lao: 'ແສງ', english: 'Light', difficulty: 'medium', category: 'basic' },
            { id: '44', lao: 'ມືດ', english: 'Dark', difficulty: 'easy', category: 'basic' },
            { id: '45', lao: 'ຮ້ອນ', english: 'Hot', difficulty: 'easy', category: 'weather' },
            { id: '46', lao: 'ເຢັນ', english: 'Cold', difficulty: 'easy', category: 'weather' },
            { id: '47', lao: 'ຝົນ', english: 'Rain', difficulty: 'easy', category: 'weather' },
            { id: '48', lao: 'ແດດ', english: 'Sun', difficulty: 'easy', category: 'weather' },
            { id: '49', lao: 'ລົມ', english: 'Wind', difficulty: 'easy', category: 'weather' },
            { id: '50', lao: 'ຟ້າຜ່າ', english: 'Lightning', difficulty: 'hard', category: 'weather' }
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

// Create global instance immediately
console.log('📚 Creating GameDataManager instance...');
window.GameDataManager = new FirestoreGameDataManager();

// Initialize the manager when Firebase is ready
function initializeGameDataManager() {
    if (window.firebaseConfig && window.firebaseDb) {
        window.GameDataManager.initialize().then(initialized => {
            if (initialized) {
                console.log('✅ GameDataManager initialized with Firebase');
            } else {
                console.log('✅ GameDataManager initialized with fallback mode');
            }
        });
    } else {
        console.log('⏳ Waiting for Firebase to be ready for GameDataManager...');
        setTimeout(initializeGameDataManager, 100);
    }
}

// Start initialization
initializeGameDataManager();