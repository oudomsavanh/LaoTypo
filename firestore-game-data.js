/**
 * Firestore Game Data Manager
 * 
 * This replaces the Google Sheets CSV loading with Firestore queries
 * Provides better security, performance, and real-time updates
 */

class FirestoreGameDataManager {
    constructor() {
        this.words = [];
        this.isLoaded = false;
        this.loadingPromise = null;
    }

    /**
     * Load game words from Firestore
     * @param {number} limit - Maximum number of words to load
     * @param {string} difficulty - Filter by difficulty (optional)
     * @returns {Promise<Array>} Array of word objects
     */
    async loadWords(limit = 100, difficulty = null) {
        // Return cached data if already loaded
        if (this.isLoaded && this.words.length > 0) {
            return this.getFilteredWords(limit, difficulty);
        }

        // Return existing promise if already loading
        if (this.loadingPromise) {
            await this.loadingPromise;
            return this.getFilteredWords(limit, difficulty);
        }

        // Start loading
        this.loadingPromise = this._loadFromFirestore(limit, difficulty);
        const result = await this.loadingPromise;
        this.isLoaded = true;
        return result;
    }

    /**
     * Load words from Firestore
     */
    async _loadFromFirestore(limit, difficulty) {
        try {
            console.log('🔥 Loading game words from Firestore...');
            
            let baseCollection = firebase.firestore().collection('gameWords');
            let query = baseCollection.orderBy('order', 'asc').limit(limit);

            // Add difficulty filter if specified
            if (difficulty) {
                query = query.where('difficulty', '==', difficulty);
            }

            let snapshot = await query.get();

            console.log(`📥 Firestore query returned ${snapshot.size} documents`);
            if (snapshot.size > 0) {
                try {
                    const firstDoc = snapshot.docs[0];
                    const firstData = firstDoc.data();
                    console.log('🧪 Sample doc:', {
                        id: firstDoc.id,
                        hasContext: typeof firstData.context === 'string' && firstData.context.length > 0,
                        hasCorrect: typeof firstData.correct === 'string' && firstData.correct.length > 0,
                        hasIncorrect: typeof (firstData.incorrect ?? firstData.wrong) === 'string' && (firstData.incorrect ?? firstData.wrong).length > 0,
                        difficulty: firstData.difficulty,
                        order: firstData.order
                    });
                } catch (e) {
                    console.warn('⚠️ Could not log sample doc:', e);
                }
            }

            if (snapshot.empty) {
                console.warn('⚠️ No words found with orderBy("order"). Retrying without orderBy...');
                // Retry without orderBy in case many docs are missing the field
                let alt = baseCollection;
                if (difficulty) {
                    alt = alt.where('difficulty', '==', difficulty);
                }
                snapshot = await alt.limit(limit).get();
                console.log(`📥 Retry (no orderBy) returned ${snapshot.size} documents`);
                if (snapshot.empty) {
                    console.warn('⚠️ Still no words found in Firestore');
                    return [];
                }
            }

            this.words = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log(`✅ Loaded ${this.words.length} words from Firestore`);
            return this.words;

        } catch (error) {
            console.error('❌ Error loading from Firestore:', error);
            
            // Fallback to local storage if available
            const fallbackWords = this._loadFromLocalStorage();
            if (fallbackWords.length > 0) {
                console.log('📱 Using cached words from local storage');
                this.words = fallbackWords;
                return this.words;
            }
            
            throw error;
        }
    }

    /**
     * Get filtered words based on limit and difficulty
     */
    getFilteredWords(limit, difficulty) {
        let filteredWords = [...this.words];
        
        if (difficulty) {
            filteredWords = filteredWords.filter(word => word.difficulty === difficulty);
        }
        
        return filteredWords.slice(0, limit);
    }

    /**
     * Get random words for gameplay
     * @param {number} count - Number of random words to get
     * @param {string} difficulty - Difficulty level (optional)
     * @returns {Array} Array of random word objects
     */
    getRandomWords(count = 10, difficulty = null) {
        const availableWords = this.getFilteredWords(1000, difficulty);
        
        if (availableWords.length === 0) {
            console.warn('⚠️ No words available');
            return [];
        }

        // Shuffle and take the requested count
        const shuffled = [...availableWords].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, availableWords.length));
    }

    /**
     * Get words by difficulty level
     * @param {string} difficulty - 'easy', 'medium', 'hard'
     * @returns {Array} Array of words for that difficulty
     */
    getWordsByDifficulty(difficulty) {
        return this.words.filter(word => word.difficulty === difficulty);
    }

    /**
     * Search words by context or answer
     * @param {string} searchTerm - Term to search for
     * @returns {Array} Array of matching words
     */
    searchWords(searchTerm) {
        if (!searchTerm) return this.words;
        
        const term = searchTerm.toLowerCase();
        return this.words.filter(word => 
            word.context.toLowerCase().includes(term) ||
            word.correct.toLowerCase().includes(term) ||
            word.wrong.toLowerCase().includes(term)
        );
    }

    /**
     * Cache words to local storage for offline use
     */
    cacheWords() {
        try {
            const cacheData = {
                words: this.words,
                timestamp: Date.now(),
                version: '1.0'
            };
            localStorage.setItem('gameWordsCache', JSON.stringify(cacheData));
            console.log('💾 Words cached to local storage');
        } catch (error) {
            console.warn('⚠️ Could not cache words:', error);
        }
    }

    /**
     * Load words from local storage cache
     */
    _loadFromLocalStorage() {
        try {
            const cached = localStorage.getItem('gameWordsCache');
            if (!cached) return [];

            const cacheData = JSON.parse(cached);
            
            // Check if cache is not too old (24 hours)
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            if (Date.now() - cacheData.timestamp > maxAge) {
                console.log('🗑️ Cache expired, clearing...');
                localStorage.removeItem('gameWordsCache');
                return [];
            }

            return cacheData.words || [];
        } catch (error) {
            console.warn('⚠️ Could not load from cache:', error);
            return [];
        }
    }

    /**
     * Get statistics about loaded words
     * @returns {Object} Statistics object
     */
    getStats() {
        const stats = {
            total: this.words.length,
            byDifficulty: {},
            lastUpdated: null
        };

        this.words.forEach(word => {
            const diff = word.difficulty || 'unknown';
            stats.byDifficulty[diff] = (stats.byDifficulty[diff] || 0) + 1;
            
            if (word.updatedAt) {
                const updated = new Date(word.updatedAt);
                if (!stats.lastUpdated || updated > stats.lastUpdated) {
                    stats.lastUpdated = updated;
                }
            }
        });

        return stats;
    }

    /**
     * Clear cache and reload from Firestore
     */
    async refresh() {
        console.log('🔄 Refreshing game words...');
        this.isLoaded = false;
        this.words = [];
        this.loadingPromise = null;
        localStorage.removeItem('gameWordsCache');
        
        return await this.loadWords();
    }
}

// Create global instance
window.GameDataManager = new FirestoreGameDataManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirestoreGameDataManager;
}