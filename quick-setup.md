# Quick Setup Guide - Connect Your Word Game to Google Sheets

## 🚀 Let's Get You Connected in 5 Minutes!

### Step 1: Create Your Google Sheet (2 minutes)

1. **Go to Google Sheets**: [sheets.google.com](https://sheets.google.com)
2. **Create a new spreadsheet**
3. **Set up your columns** exactly like this in Row 1:

| A | B | C | D | E |
|---|---|---|---|---|
| context | true | false | level | remark |

4. **Add your word data** starting from Row 2. Here's a template you can copy:

```
Row 2: The capital of France | Paris | London | 1 | Basic geography
Row 3: Largest planet in our solar system | Jupiter | Saturn | 2 | Space knowledge  
Row 4: Author of Romeo and Juliet | Shakespeare | Dickens | 3 | Classic literature
Row 5: Chemical symbol for gold | Au | Ag | 4 | Chemistry basics
Row 6: Year World War II ended | 1945 | 1944 | 5 | Historical events
```

### Step 2: Make Your Sheet Public (1 minute)

1. **Click "Share"** (top right corner)
2. **Change access** to "Anyone with the link can view"
3. **Copy the Sheet ID** from the URL
   - URL looks like: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Copy the long string between `/d/` and `/edit`

### Step 3: Update Your Game (2 minutes)

1. **Open** `word-game.html` in a text editor
2. **Find this section** (around line 250):

```javascript
const GOOGLE_SHEETS_CONFIG = {
    spreadsheetId: 'YOUR_SPREADSHEET_ID',
    apiKey: 'YOUR_API_KEY',
    range: 'Sheet1!A2:E',
    enabled: false
};
```

3. **Replace with your Sheet ID**:

```javascript
const GOOGLE_SHEETS_CONFIG = {
    spreadsheetId: 'PASTE_YOUR_SHEET_ID_HERE',
    apiKey: 'YOUR_API_KEY',
    range: 'Sheet1!A2:E',
    enabled: true  // Change this to true
};
```

4. **Find the `fetchFromGoogleSheets` function** and replace it with this public sheet version:

```javascript
async function fetchFromGoogleSheets() {
    const spreadsheetId = GOOGLE_SHEETS_CONFIG.spreadsheetId;
    const range = GOOGLE_SHEETS_CONFIG.range;
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&range=${range}`;
    
    try {
        const response = await fetch(url);
        const text = await response.text();
        
        // Parse Google Sheets JSON response
        const jsonData = JSON.parse(text.substr(47).slice(0, -2));
        
        if (!jsonData.table || !jsonData.table.rows) {
            throw new Error('No data found in Google Sheets');
        }
        
        return jsonData.table.rows.map(row => ({
            context: row.c[0]?.v || '',
            true: row.c[1]?.v || '',
            false: row.c[2]?.v || '',
            level: parseInt(row.c[3]?.v) || 1,
            remark: row.c[4]?.v || ''
        }));
    } catch (error) {
        console.error('Error fetching from Google Sheets:', error);
        throw error;
    }
}
```

### Step 4: Test Your Connection

1. **Save** your `word-game.html` file
2. **Open** it in your web browser
3. **Check the status** at the bottom - it should say "Connected to Google Sheets"
4. **Play the game** - your words should appear!

---

## 🎯 Example Google Sheet Template

Here's a complete example you can copy into your sheet:

| context | true | false | level | remark |
|---------|------|-------|-------|--------|
| The capital of Japan | Tokyo | Osaka | 1 | Basic geography |
| Largest ocean on Earth | Pacific | Atlantic | 2 | Geography |
| Inventor of the telephone | Bell | Edison | 3 | History |
| Chemical formula for water | H2O | CO2 | 1 | Basic chemistry |
| Author of "1984" | Orwell | Huxley | 4 | Literature |
| Planet closest to the Sun | Mercury | Venus | 2 | Astronomy |
| Longest river in the world | Nile | Amazon | 3 | Geography |
| Symbol for iron | Fe | Ir | 4 | Chemistry |
| Year of first moon landing | 1969 | 1968 | 5 | History |
| Fastest land animal | Cheetah | Lion | 2 | Biology |

---

## 🔧 Troubleshooting

**If you see "Demo Mode":**
- Check that `enabled: true` in your config
- Verify your Sheet ID is correct
- Make sure your sheet is public

**If you get "No data found":**
- Check that your data starts from Row 2
- Verify column headers match exactly
- Make sure your sheet name is "Sheet1"

**If the game doesn't load:**
- Open browser console (F12) to see error messages
- Check that your sheet is accessible
- Try the demo mode first to ensure the game works

---

## 🎉 You're Done!

Your word game is now connected to Google Sheets! You can:

✅ **Add new words** by editing your spreadsheet  
✅ **Change existing content** without touching the code  
✅ **Share the sheet** with others to collaborate  
✅ **See updates** immediately in your game  

**Need help?** Check the full setup guide or ask for assistance!

---

**Pro Tip:** Keep your Google Sheet open while playing to see how changes update in real-time!