/**
 * Private Google Sheets Proxy Server
 * 
 * This Node.js server acts as a secure proxy between your game and Google Sheets.
 * Only this server can access your private sheet, and it serves data to your game.
 * 
 * Setup:
 * 1. Install Node.js
 * 2. Install dependencies: npm install express googleapis cors
 * 3. Get Google Service Account credentials
 * 4. Run: node private-sheets-proxy.js
 */

const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS for your game domain
app.use(cors({
    origin: ['https://laotypo-phase1.web.app', 'http://localhost:3000', 'http://127.0.0.1:5500'],
    credentials: true
}));

// Your private Google Sheet ID
const SHEET_ID = 'YOUR_PRIVATE_SHEET_ID_HERE';

// Google Service Account credentials
// Download this from Google Cloud Console > Service Accounts > Create Key
const credentials = {
    "type": "service_account",
    "project_id": "your-project-id",
    "private_key_id": "your-private-key-id",
    "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
    "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
    "client_id": "your-client-id",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs/your-service-account%40your-project.iam.gserviceaccount.com"
};

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

const sheets = google.sheets({ version: 'v4', auth });

// API endpoint to get game words
app.get('/api/words', async (req, res) => {
    try {
        console.log('📚 Fetching words from private Google Sheet...');
        
        // Read data from your private sheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: 'Sheet1!A:D', // Adjust range as needed
        });

        const rows = response.data.values;
        
        if (!rows || rows.length < 2) {
            return res.status(404).json({
                success: false,
                error: 'No data found in sheet'
            });
        }

        // Skip header row and convert to game format
        const words = rows.slice(1).map((row, index) => ({
            context: row[0] || '',
            correct: row[1] || '',
            incorrect: row[2] || '',
            difficulty: parseInt(row[3]) || 1,
            order: index + 1
        })).filter(word => word.context && word.correct && word.incorrect);

        console.log(`✅ Loaded ${words.length} words from private sheet`);

        res.json({
            success: true,
            words: words,
            count: words.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error fetching words:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: 'Private Sheets Proxy is running'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🔒 Private Sheets Proxy running on port ${PORT}`);
    console.log(`📊 API endpoint: http://localhost:${PORT}/api/words`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Private Sheets Proxy...');
    process.exit(0);
});