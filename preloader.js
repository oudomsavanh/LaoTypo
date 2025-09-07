/**
 * Preloader Module for Lao Typo Game
 * Handles asset loading with progress tracking
 */

class GamePreloader {
    constructor() {
        this.assets = [];
        this.loadedCount = 0;
        this.totalCount = 0;
        this.onProgress = null;
        this.onComplete = null;
        this.onError = null;
        this.startTime = Date.now();
    }

    /**
     * Register assets to preload
     */
    registerAssets() {
        // Critical assets (load first)
        this.addAsset('firebase-config', () => this.loadScript('/firebase-config.js'), 'critical', 'ກຳລັງເຊື່ອມຕໍ່ Firebase...');
        
        // Images
        this.addAsset('logo', () => this.loadImage('/images/LaoTypo-logo-04.png'), 'high', 'ກຳລັງໂຫຼດຮູບພາບ...');
        this.addAsset('mascot', () => this.loadImage('/images/Gecko.png'), 'medium', 'ກຳລັງໂຫຼດຕົວການ໌ຕູນ...');
        
        // External dependencies
        this.addAsset('tailwind', () => this.loadScript('https://cdn.tailwindcss.com'), 'high', 'ກຳລັງໂຫຼດ CSS...');
        this.addAsset('tone', () => this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js'), 'low', 'ກຳລັງໂຫຼດລະບົບສຽງ...');
        this.addAsset('fonts', () => this.loadFont(), 'medium', 'ກຳລັງໂຫຼດຟອນລາວ...');
        
        // Game data
        this.addAsset('wordData', () => this.loadWordData(), 'critical', 'ກຳລັງໂຫຼດຄຳສັບ...');
        this.addAsset('userData', () => this.loadUserData(), 'high', 'ກຳລັງໂຫຼດຂໍ້ມູນຜູ້ໃຊ້...');
        
        this.totalCount = this.assets.length;
    }

    addAsset(id, loader, priority, message) {
        this.assets.push({ id, loader, priority, message, loaded: false });
    }

    /**
     * Start loading all assets
     */
    async load() {
        // Sort by priority
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        this.assets.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        // Load critical assets first, then others in parallel
        const critical = this.assets.filter(a => a.priority === 'critical');
        const others = this.assets.filter(a => a.priority !== 'critical');

        try {
            // Load critical assets sequentially
            for (const asset of critical) {
                await this.loadAsset(asset);
            }

            // Load other assets in parallel
            await Promise.all(others.map(asset => this.loadAsset(asset)));

            this.handleComplete();
        } catch (error) {
            this.handleError(error);
        }
    }

    async loadAsset(asset) {
        try {
            this.updateProgress(asset.message);
            await asset.loader();
            asset.loaded = true;
            this.loadedCount++;
            this.updateProgress(asset.message, this.getProgress());
        } catch (error) {
            console.warn(`Failed to load ${asset.id}:`, error);
            // Continue loading other assets
            asset.loaded = false;
            this.loadedCount++;
        }
    }

    /**
     * Asset loaders
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = src;
        });
    }

    loadFont() {
        return new Promise((resolve) => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = 'https://fonts.googleapis.com';
            document.head.appendChild(link);

            const link2 = document.createElement('link');
            link2.rel = 'preconnect';
            link2.href = 'https://fonts.gstatic.com';
            link2.crossOrigin = 'anonymous';
            document.head.appendChild(link2);

            const fontLink = document.createElement('link');
            fontLink.rel = 'stylesheet';
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Lao+Looped:wght@400;500;700&display=swap';
            fontLink.onload = resolve;
            fontLink.onerror = resolve; // Don't fail if fonts don't load
            document.head.appendChild(fontLink);
        });
    }

    async loadWordData() {
        // Simulate loading word data from Google Sheets
        const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1VdEB4q4j5LnpZp-CSsUDKJX_J5Q4E3Tz5Fvzqw_fKmI/export?format=csv&gid=0';
        
        try {
            const response = await fetch(SHEETS_URL);
            if (!response.ok) throw new Error('Failed to load word data');
            const data = await response.text();
            // Store in memory or process as needed
            window.wordData = data;
        } catch (error) {
            console.warn('Could not load word data, will retry later');
        }
    }

    loadUserData() {
        return new Promise((resolve) => {
            // Load user data from localStorage
            try {
                const userData = localStorage.getItem('userStats');
                if (userData) {
                    window.userStats = JSON.parse(userData);
                }
            } catch (error) {
                console.warn('Could not load user data');
            }
            resolve();
        });
    }

    /**
     * Progress tracking
     */
    getProgress() {
        return Math.round((this.loadedCount / this.totalCount) * 100);
    }

    updateProgress(message, percentage) {
        if (this.onProgress) {
            this.onProgress({
                message,
                percentage: percentage || this.getProgress(),
                loaded: this.loadedCount,
                total: this.totalCount,
                elapsed: Date.now() - this.startTime
            });
        }
    }

    handleComplete() {
        const loadTime = Date.now() - this.startTime;
        console.log(`✅ All assets loaded in ${loadTime}ms`);
        
        if (this.onComplete) {
            this.onComplete({ loadTime, assets: this.assets });
        }
    }

    handleError(error) {
        console.error('❌ Preloader error:', error);
        
        if (this.onError) {
            this.onError(error);
        }
    }

    /**
     * Check if minimum loading time has passed (for UX)
     */
    async ensureMinimumLoadTime(minTime = 1500) {
        const elapsed = Date.now() - this.startTime;
        if (elapsed < minTime) {
            await new Promise(resolve => setTimeout(resolve, minTime - elapsed));
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GamePreloader;
}