/**
 * Quick Secure Setup for LaoTypo Game
 * 
 * This creates a secure proxy server that hides your API key
 * Run this on a server (Heroku, Vercel, Railway, etc.)
 */

const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for your game domain
app.use(cors({
    origin: ['https://laotypo-phase1.web.app', 'http://localhost:3000'],
    credentials: true
}));

// SECRET: Replace with your actual values
const GOOGLE_SHEET_ID = 'YOUR_SHEET_ID_HERE'; // Replace with your sheet ID
const GOOGLE_API_KEY = 'YOUR_NEW_API_KEY_HERE'; // Replace with your NEW API key

// Initialize Google Sheets API
const sheets = google.sheets({ version: 'v4', auth: GOOGLE_API_KEY });

// Cache for better performance
let wordsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// SECURE endpoint - API key is hidden from clients
app.get('/api/words', async (req, res) => {
    try {
        // Check cache first
        if (wordsCache && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
            return res.json({
                success: true,
                words: wordsCache,
                count: wordsCache.length,
                cached: true
            });
        }

        console.log('📚 Fetching words from Google Sheets...');
        
        // Fetch from Google Sheets using server-side API key
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: 'Sheet1!A:D',
        });

        const rows = response.data.values || [];
        
        if (rows.length < 2) {
            return res.status(404).json({
                success: false,
                error: 'No data found in sheet'
            });
        }

        // Process the data
        const words = rows.slice(1).map((row, index) => ({
            context: row[0] || '',
            correct: row[1] || '',
            incorrect: row[2] || '',
            difficulty: parseInt(row[3]) || 1,
            order: index + 1
        })).filter(word => word.context && word.correct && word.incorrect);

        // Update cache
        wordsCache = words;
        cacheTimestamp = Date.now();

        console.log(`✅ Loaded ${words.length} words securely`);

        res.json({
            success: true,
            words: words,
            count: words.length,
            cached: false
        });

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        message: 'Secure proxy is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🔒 Secure proxy running on port ${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}/api/words`);
    console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    process.exit(0);
});