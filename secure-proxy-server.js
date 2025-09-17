/**
 * SECURE Google Sheets Proxy Server
 * 
 * This server acts as a secure middleman between your game and Google Sheets.
 * The API key is kept secret on the server, never exposed to clients.
 * 
 * Security Benefits:
 * - API key is hidden from clients
 * - Can add rate limiting
 * - Can add authentication
 * - Can cache responses
 * - Can monitor usage
 */

const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);
app.use(cors({
    origin: ['https://laotypo-phase1.web.app', 'https://yourdomain.com'],
    credentials: true
}));

// SECRET: Keep these in environment variables or secure config
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID || 'your-sheet-id';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'your-api-key';

// Initialize Google Sheets API
const sheets = google.sheets({ version: 'v4', auth: GOOGLE_API_KEY });

// Cache for better performance and reduced API calls
let wordsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// SECURE endpoint - API key is hidden from clients
app.get('/api/words', async (req, res) => {
    try {
        // Check cache first
        if (wordsCache && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
            console.log('📦 Serving cached words');
            return res.json({
                success: true,
                words: wordsCache,
                count: wordsCache.length,
                cached: true,
                timestamp: new Date(cacheTimestamp).toISOString()
            });
        }

        console.log('📚 Fetching fresh words from Google Sheets...');
        
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

        // Process and cache the data
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

        console.log(`✅ Loaded ${words.length} words from private sheet`);

        res.json({
            success: true,
            words: words,
            count: words.length,
            cached: false,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error fetching words:', error);
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
        timestamp: new Date().toISOString(),
        message: 'Secure Sheets Proxy is running'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🔒 Secure Sheets Proxy running on port ${PORT}`);
    console.log(`📊 API endpoint: http://localhost:${PORT}/api/words`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Secure Sheets Proxy...');
    process.exit(0);
});