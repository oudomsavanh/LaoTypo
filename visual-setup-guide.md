# 📸 Visual Step-by-Step Google Sheets Setup Guide

## 🎯 What You'll Accomplish
Connect your word game to Google Sheets in **5 minutes** with this visual guide.

---

## 📋 Step 1: Create Your Google Sheet

### 1.1 Go to Google Sheets
- **Open your browser** and navigate to: `sheets.google.com`
- **Click the "+" button** or "Blank" to create a new spreadsheet

**What you'll see:**
- A clean, empty spreadsheet with columns A, B, C, D, E...
- Row 1 is highlighted and ready for your headers

### 1.2 Set Up Column Headers
**In Row 1, type these exact headers:**

| Cell A1 | Cell B1 | Cell C1 | Cell D1 | Cell E1 |
|---------|---------|---------|---------|---------|
| context | true | false | level | remark |

**Important:** 
- Type exactly as shown (lowercase)
- No extra spaces
- Press Tab to move between cells

### 1.3 Add Your Data
**Starting from Row 2, add your word data:**

**Row 2 Example:**
- A2: `The capital of France`
- B2: `Paris`
- C2: `London`
- D2: `1`
- E2: `Basic geography`

**What you'll see:**
- Each row represents one question for your game
- Column A = the question/context
- Column B = correct answer
- Column C = incorrect answer
- Column D = difficulty level (1-10)
- Column E = notes/hints

---

## 🌐 Step 2: Make Your Sheet Public

### 2.1 Find the Share Button
**Look for the blue "Share" button** in the top-right corner of your screen
- It's next to your profile picture
- Click it to open the sharing dialog

**What you'll see:**
- A popup window titled "Share with people and groups"
- Various sharing options and settings

### 2.2 Change Access Settings
**Click "Restricted" dropdown** (it might say "Anyone with the link")
- Select "Anyone with the link"
- Make sure "Viewer" is selected (not "Editor")
- Click "Done"

**What you'll see:**
- The sharing settings change to show "Anyone with the link can view"
- A green checkmark indicating the settings are saved

### 2.3 Copy Your Sheet ID
**Look at your browser's address bar**
- The URL looks like: `https://docs.google.com/spreadsheets/d/LONG_STRING_HERE/edit`
- **Copy the LONG_STRING_HERE part** (between `/d/` and `/edit`)

**Example:**
- Full URL: `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit`
- Sheet ID: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

**Save this ID** - you'll need it in the next step!

---

## 🔧 Step 3: Test Your Connection

### 3.1 Use the Connection Tester
**Open the file `test-connection.html`** in your browser
- You'll see a clean testing interface
- Instructions and a text input field

### 3.2 Enter Your Sheet ID
**Paste your Sheet ID** into the text field
- The one you copied from Step 2.3
- Click "Test Connection"

**What you'll see:**
- Loading message: "🔄 Testing connection..."
- Then either success or error message

### 3.3 Success! 
**If successful, you'll see:**
- ✅ Green success message: "Connection Successful!"
- Number of rows found
- Preview of your data in a table
- Configuration code to copy

### 3.4 If There's an Error
**Common error messages and solutions:**

**❌ "Sheet not accessible"**
- **Solution:** Make sure your sheet is public (Step 2.2)
- Go back and check sharing settings

**❌ "No data found"**
- **Solution:** Check that your data starts from Row 2
- Verify column headers are correct

**❌ "Invalid Sheet ID"**
- **Solution:** Copy the Sheet ID again from your browser URL
- Make sure there are no extra spaces

---

## 🎮 Step 4: Update Your Game

### 4.1 Open word-game.html
**Open the file in a text editor** (Notepad, VS Code, etc.)
- Look for the configuration section around line 250

### 4.2 Find the Configuration
**Look for this code block:**
```javascript
const GOOGLE_SHEETS_CONFIG = {
    spreadsheetId: 'YOUR_SPREADSHEET_ID',
    apiKey: 'YOUR_API_KEY',
    range: 'Sheet1!A2:E',
    enabled: false
};
```

### 4.3 Update the Configuration
**Replace with your actual values:**
```javascript
const GOOGLE_SHEETS_CONFIG = {
    spreadsheetId: 'YOUR_ACTUAL_SHEET_ID_HERE', // Paste your Sheet ID
    apiKey: 'YOUR_API_KEY', // Leave as is
    range: 'Sheet1!A2:E', // Leave as is
    enabled: true // Change to true!
};
```

### 4.4 Save the File
**Save your changes** (Ctrl+S or Cmd+S)

---

## 🚀 Step 5: Test Your Game

### 5.1 Open Your Game
**Open `word-game.html`** in your web browser
- You should see the game interface

### 5.2 Check Connection Status
**Look at the bottom of the page**
- ✅ **"Connected to Google Sheets"** (green) = Success!
- ❌ **"Demo Mode"** (orange) = Not connected yet
- ❌ **"Error"** (red) = Something went wrong

### 5.3 Play Your Game!
**Enter your name and start playing**
- The questions should come from your Google Sheet
- You should see your custom content

---

## 🎉 Success Checklist

✅ **Google Sheet created** with correct column headers  
✅ **Sheet is public** ("Anyone with the link can view")  
✅ **Sheet ID copied** from browser URL  
✅ **Connection tested** using test-connection.html  
✅ **Game configuration updated** with your Sheet ID  
✅ **Game shows "Connected to Google Sheets"** status  
✅ **Your custom questions appear** in the game  

---

## 🔍 Visual Troubleshooting

### What Success Looks Like:
- **Google Sheet:** Clean table with your data, public sharing enabled
- **Connection Test:** Green success message with data preview
- **Game:** "Connected to Google Sheets" status at bottom
- **Gameplay:** Your custom questions appear when playing

### What Failure Looks Like:
- **Google Sheet:** "Request access" message when opening
- **Connection Test:** Red error messages
- **Game:** "Demo Mode" or "Error" status
- **Gameplay:** Only sample questions appear

### Quick Fixes:
1. **Double-check sharing settings** - must be public
2. **Verify Sheet ID** - copy again from URL
3. **Check data format** - headers must match exactly
4. **Test connection first** - use test-connection.html

---

## 🎯 Pro Tips

### 💡 **Tip 1: Keep It Simple**
- Start with just 5-10 questions
- Test the connection before adding more data
- Use simple, clear questions

### 💡 **Tip 2: Use the Tester**
- Always test your connection first
- The tester shows exactly what your game will see
- Copy the generated configuration code

### 💡 **Tip 3: Real-time Updates**
- Once connected, changes to your sheet appear immediately
- No need to refresh the game
- Perfect for collaborative content creation

### 💡 **Tip 4: Backup Your Data**
- Make a copy of your Google Sheet
- Keep the original safe
- Easy to restore if something goes wrong

---

## 🆘 Need Help?

**If you get stuck:**
1. **Use test-connection.html** - it shows exactly what's wrong
2. **Check the browser console** - press F12 to see error messages
3. **Start over** - sometimes it's faster to create a new sheet
4. **Try the sample data** - copy from sample-data.csv

**Common mistakes:**
- Forgetting to make the sheet public
- Wrong column headers (case-sensitive)
- Copying the wrong part of the URL
- Not changing `enabled: false` to `enabled: true`

---

**🎉 You're all set! Your word game is now powered by Google Sheets!**