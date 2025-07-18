# Google Sheets Word Game Setup Guide

## Overview

This guide will help you connect your word game to Google Sheets as a database. The game uses Google Sheets API to fetch word data with the following columns:

- **context**: The word or phrase to display
- **true**: True option text  
- **false**: False option text
- **level**: Difficulty level (1-10)
- **remark**: Additional notes or hints

## Prerequisites

- Google account
- Google Sheets spreadsheet with your word data
- Basic understanding of web development

## Step 1: Create Your Google Sheets Database

### 1.1 Create a New Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Word Game Database" or similar

### 1.2 Set Up Your Data Structure
Create columns with these exact headers in row 1:

| A | B | C | D | E |
|---|---|---|---|---|
| context | true | false | level | remark |

### 1.3 Add Sample Data
Here's some example data you can use:

```
context                        | true        | false      | level | remark
The capital of France         | Paris       | London     | 1     | Basic geography
Largest planet in solar system| Jupiter     | Saturn     | 2     | Space knowledge
Author of Romeo and Juliet    | Shakespeare | Dickens    | 3     | Classic literature
Chemical symbol for gold      | Au          | Ag         | 4     | Chemistry basics
Year World War II ended       | 1945        | 1944       | 5     | Historical events
```

### 1.4 Make Your Sheet Public (Option 1 - Simpler)
1. Click "Share" in the top right
2. Change access to "Anyone with the link can view"
3. Copy the sheet ID from the URL (the long string between `/d/` and `/edit`)

### 1.5 Use Google Sheets API (Option 2 - More Secure)
For production use, set up proper API access:

## Step 2: Set Up Google Cloud Project (For API Access)

### 2.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### 2.2 Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Optional) Restrict the key to Google Sheets API only

### 2.3 Configure OAuth (If needed for private sheets)
1. Go to "APIs & Services" > "OAuth consent screen"
2. Fill out the required information
3. Create OAuth 2.0 credentials if accessing private sheets

## Step 3: Configure Your Game

### 3.1 Update Configuration
In your `word-game.html` file, find the `GOOGLE_SHEETS_CONFIG` object and update it:

```javascript
const GOOGLE_SHEETS_CONFIG = {
    spreadsheetId: 'YOUR_SPREADSHEET_ID', // From Step 1.4
    apiKey: 'YOUR_API_KEY', // From Step 2.2
    range: 'Sheet1!A2:E', // Adjust if your data is in different range
    enabled: true // Set to true to enable Google Sheets
};
```

### 3.2 For Public Sheets (No API Key Required)
If you made your sheet public, you can use this simpler approach:

```javascript
// Alternative method for public sheets
async function fetchFromGoogleSheets() {
    const spreadsheetId = 'YOUR_SPREADSHEET_ID';
    const range = 'Sheet1!A2:E';
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&range=${range}`;
    
    const response = await fetch(url);
    const text = await response.text();
    
    // Parse Google Sheets JSON response
    const jsonData = JSON.parse(text.substr(47).slice(0, -2));
    
    return jsonData.table.rows.map(row => ({
        context: row.c[0]?.v || '',
        true: row.c[1]?.v || '',
        false: row.c[2]?.v || '',
        level: parseInt(row.c[3]?.v) || 1,
        remark: row.c[4]?.v || ''
    }));
}
```

## Step 4: Test Your Integration

### 4.1 Test the Connection
1. Open your `word-game.html` in a web browser
2. Check the connection status at the bottom of the page
3. If successful, you should see "Connected to Google Sheets"

### 4.2 Troubleshooting Common Issues

**Issue: "No data found in Google Sheets"**
- Check that your sheet has data starting from row 2
- Verify the range in your configuration matches your data

**Issue: "API key not valid"**
- Ensure your API key is correct
- Check that Google Sheets API is enabled in your project

**Issue: "Access denied"**
- Make sure your sheet is public or properly configured for API access
- Check sharing permissions

## Step 5: Advanced Features

### 5.1 Adding More Columns
To add more data columns, modify the `fetchFromGoogleSheets()` function:

```javascript
return data.values.map(row => ({
    context: row[0] || '',
    true: row[1] || '',
    false: row[2] || '',
    level: parseInt(row[3]) || 1,
    remark: row[4] || '',
    category: row[5] || '', // New column
    difficulty: row[6] || '' // Another new column
}));
```

### 5.2 Filtering by Level
Add level filtering to show appropriate difficulty:

```javascript
function getWordsByLevel(targetLevel) {
    return gameState.words.filter(word => word.level === targetLevel);
}
```

### 5.3 Real-time Updates
For real-time updates, you can set up periodic data refreshes:

```javascript
// Refresh data every 5 minutes
setInterval(async () => {
    await loadWords();
    console.log('Word data refreshed');
}, 300000);
```

## Step 6: Security Considerations

### 6.1 API Key Security
- Never commit API keys to public repositories
- Use environment variables for production
- Restrict API key usage to specific domains

### 6.2 Rate Limiting
- Google Sheets API has rate limits
- Implement caching to reduce API calls
- Consider using service accounts for higher limits

### 6.3 Data Validation
- Validate data from Google Sheets before using
- Handle missing or malformed data gracefully
- Implement error handling for API failures

## Step 7: Deployment

### 7.1 Local Testing
1. Use a local web server (not file:// protocol)
2. Test with sample data first
3. Verify all game mechanics work correctly

### 7.2 Production Deployment
1. Upload files to your web hosting service
2. Configure proper domain restrictions for API key
3. Test thoroughly in production environment

## Troubleshooting Guide

### Common Error Messages

**"Failed to fetch"**
- Check CORS settings
- Verify API key is valid
- Ensure sheet is accessible

**"Quota exceeded"**
- You've hit API rate limits
- Implement caching or reduce request frequency

**"Invalid range"**
- Check your range specification (e.g., 'Sheet1!A2:E')
- Verify sheet name matches exactly

### Debug Mode
Enable debug mode by adding this to your console:

```javascript
// Enable debug logging
GOOGLE_SHEETS_CONFIG.debug = true;
```

## Sample Google Sheets Template

Here's a complete template you can copy:

| context | true | false | level | remark |
|---------|------|-------|-------|--------|
| The capital of Japan | Tokyo | Osaka | 1 | Basic geography |
| Largest ocean on Earth | Pacific | Atlantic | 2 | Geography |
| Inventor of the telephone | Bell | Edison | 3 | History |
| Chemical formula for water | H2O | CO2 | 1 | Basic chemistry |
| Author of "1984" | Orwell | Huxley | 4 | Literature |
| Speed of light | 299,792,458 m/s | 300,000 km/s | 5 | Physics |

## Conclusion

Your word game is now connected to Google Sheets! You can:

✅ **Add new words** by simply updating your Google Sheet  
✅ **Modify existing content** without touching the code  
✅ **Collaborate** with others to build your word database  
✅ **Scale easily** by adding more rows to your sheet  
✅ **Track usage** through Google Sheets analytics  

The game will automatically fetch the latest data from your sheet, making it easy to maintain and update your word database.

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Google Sheets setup matches this guide
3. Test with the sample data provided
4. Ensure your API key has the correct permissions

Happy gaming! 🎮