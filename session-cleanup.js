// 🧹 Session Cleanup Utility for LaoTypo Phase 1
// Handles guest user data lifecycle and cleanup

class SessionManager {
    constructor() {
        this.GUEST_USER_KEY = 'guestUser';
        this.USER_TYPE_KEY = 'userType';
        this.SESSION_START_KEY = 'sessionStartTime';
        
        this.init();
    }
    
    init() {
        // Mark session start time
        if (!sessionStorage.getItem(this.SESSION_START_KEY)) {
            sessionStorage.setItem(this.SESSION_START_KEY, Date.now());
        }
        
        // Add cleanup listeners
        this.addCleanupListeners();
    }
    
    // Check if current user is guest
    isGuestUser() {
        return sessionStorage.getItem(this.USER_TYPE_KEY) === 'guest';
    }
    
    // Get guest user data
    getGuestData() {
        if (!this.isGuestUser()) return null;
        
        const userData = sessionStorage.getItem(this.GUEST_USER_KEY);
        return userData ? JSON.parse(userData) : null;
    }
    
    // Save guest data
    saveGuestData(userData) {
        if (this.isGuestUser()) {
            sessionStorage.setItem(this.GUEST_USER_KEY, JSON.stringify(userData));
        }
    }
    
    // Clear all guest data
    clearGuestData() {
        sessionStorage.removeItem(this.GUEST_USER_KEY);
        sessionStorage.removeItem(this.USER_TYPE_KEY);
        sessionStorage.removeItem(this.SESSION_START_KEY);
        
        // Clear any game-specific session data
        const keys = Object.keys(sessionStorage);
        keys.forEach(key => {
            if (key.startsWith('guest_') || key.includes('temp_')) {
                sessionStorage.removeItem(key);
            }
        });
    }
    
    // Add cleanup event listeners
    addCleanupListeners() {
        // Clear guest data when tab/window is closed
        window.addEventListener('beforeunload', () => {
            if (this.isGuestUser()) {
                console.log('👤 Guest session ending - cleaning up data');
                this.clearGuestData();
            }
        });
        
        // Clear guest data when navigating away from the domain
        window.addEventListener('pagehide', () => {
            if (this.isGuestUser()) {
                console.log('👤 Page hidden - cleaning up guest data');
                this.clearGuestData();
            }
        });
    }
    
    // Get session duration in minutes
    getSessionDuration() {
        const startTime = sessionStorage.getItem(this.SESSION_START_KEY);
        if (!startTime) return 0;
        
        return Math.floor((Date.now() - parseInt(startTime)) / (1000 * 60));
    }
    
    // Show guest data warning
    showGuestWarning() {
        if (this.isGuestUser()) {
            console.warn('⚠️ Guest Mode: Data will be lost when tab is closed');
            return true;
        }
        return false;
    }
    
    // Migrate guest to Gmail (for future implementation)
    prepareGuestMigration() {
        const guestData = this.getGuestData();
        if (!guestData) return null;
        
        return {
            tempName: guestData.name,
            tempAge: guestData.age,
            sessionDuration: this.getSessionDuration(),
            tempStats: this.getGuestGameStats()
        };
    }
    
    // Get guest game statistics
    getGuestGameStats() {
        const stats = {
            gamesPlayed: 0,
            bestScore: 0,
            totalTime: this.getSessionDuration()
        };
        
        // Try to get stats from localStorage (fallback)
        try {
            const localData = localStorage.getItem('laoTypoGame_userData');
            if (localData) {
                const parsed = JSON.parse(localData);
                if (parsed.stats) {
                    stats.gamesPlayed = parsed.stats.totalGames || 0;
                    stats.bestScore = parsed.stats.bestStreak || 0;
                }
            }
        } catch (error) {
            console.warn('Could not retrieve guest stats:', error);
        }
        
        return stats;
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SessionManager;
} else {
    window.SessionManager = SessionManager;
}

console.log('🧹 Session cleanup utility loaded');