# 🔐 Secure Google Sheets Setup Guide

## 🎯 Why This Method is Better

**Public Sheet Method:**
- ❌ Anyone with the link can view your data
- ❌ Not secure for sensitive information
- ❌ No control over who accesses your data

**API Permission Method:**
- ✅ Sheet stays private
- ✅ Only your game can access the data
- ✅ Full control over permissions
- ✅ Professional and secure

---

## 📋 Step-by-Step Setup

### Step 1: Create Google Cloud Project (3 minutes)

#### 1.1 Go to Google Cloud Console
- Open: [console.cloud.google.com](https://console.cloud.google.com)
- Sign in with your Google account

#### 1.2 Create New Project
- Click **"Select a project"** dropdown (top of page)
- Click **"New Project"**
- Project name: `Word Game Project` (or any name you like)
- Click **"Create"**
- Wait for project to be created (30 seconds)

#### 1.3 Select Your Project
- Make sure your new project is selected in the dropdown

---

### Step 2: Enable Google Sheets API (2 minutes)

#### 2.1 Go to API Library
- In the left menu, click **"APIs & Services"** > **"Library"**
- Search for: `Google Sheets API`
- Click on **"Google Sheets API"**
- Click **"Enable"** button
- Wait for it to enable (30 seconds)

---

### Step 3: Create API Key (2 minutes)

#### 3.1 Go to Credentials
- In the left menu, click **"APIs & Services"** > **"Credentials"**
- Click **"Create Credentials"** > **"API Key"**
- Copy the generated API key immediately!
- **Save this key** - you'll need it for your game

#### 3.2 Restrict API Key (Recommended)
- Click **"Restrict Key"** (or the pencil icon next to your key)
- Under **"API restrictions"**, select **"Restrict key"**
- Check **"Google Sheets API"**
- Under **"Website restrictions"** (optional):
  - Select **"HTTP referrers"**
  - Add your website domain (e.g., `yourdomain.com/*`)
- Click **"Save"**

---

### Step 4: Update Your Game Configuration (1 minute)

#### 4.1 Open word-game.html
Find this section in your game file:

```javascript
const GOOGLE_SHEETS_CONFIG = {
    spreadsheetId: '1jhdIOg9aqy7Jb28pqnz9I5F23uQ8HYyABvvMxqSzGr0',
    apiKey: 'YOUR_API_KEY', // Replace this!
    range: 'Sheet1!A2:E',
    enabled: true
};
```

#### 4.2 Replace with Your API Key
```javascript
const GOOGLE_SHEETS_CONFIG = {
    spreadsheetId: '1jhdIOg9aqy7Jb28pqnz9I5F23uQ8HYyABvvMxqSzGr0',
    apiKey: 'AIzaSyABC123...your-actual-api-key-here', // Your real API key
    range: 'Sheet1!A2:E',
    enabled: true
};
```

---

### Step 5: Set Up Sheet Permissions (1 minute)

#### 5.1 Keep Your Sheet Private
- Your Google Sheet can stay private
- Don't change any sharing settings
- Only you can edit it

#### 5.2 API Access
- The API key allows your game to read the sheet
- No one else can access your data
- Sheet remains completely private

---

## 🧪 Test Your Secure Setup

### Method 1: Use the Test Page
1. Update the test page with your API key
2. Open `test-your-sheet.html`
3. Should show "Connection Successful!"

### Method 2: Test Your Game
1. Open `word-game.html`
2. Check status: should show "Connected to Google Sheets"
3. Play the game with your private data!

---

## 🔧 Update Test Page for API Key

Let me create a secure version of the test page:

```html
<!-- In test-your-sheet.html, update the script section -->
<script>
    const SHEET_ID = '1jhdIOg9aqy7Jb28pqnz9I5F23uQ8HYyABvvMxqSzGr0';
    const API_KEY = 'YOUR_API_KEY_HERE'; // Add your API key here
    
    async function testConnection() {
        // Test with API key instead of public access
        const range = 'Sheet1!A2:E';
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }
            
            // Show success and data preview
            // ... rest of the code
        } catch (error) {
            // Show error message
        }
    }
</script>
```

---

## 🔒 Security Best Practices

### ✅ **Do This:**
- Keep your API key secure
- Don't share your API key publicly
- Use domain restrictions on your API key
- Keep your Google Sheet private
- Regularly rotate your API keys

### ❌ **Don't Do This:**
- Don't put API keys in public repositories
- Don't share your API key with others
- Don't use unrestricted API keys
- Don't make your sheet public

---

## 💰 Cost Information

### **Google Sheets API Pricing:**
- **Free tier:** 100 requests per 100 seconds per user
- **Free tier:** 1,000 requests per day
- **Cost:** $0.00 for typical game usage

### **Your Game Usage:**
- Each game loads data once
- Very low API usage
- Well within free limits
- No cost for personal use

---

## 🆘 Troubleshooting

### **"API key not valid" Error:**
- Double-check you copied the API key correctly
- Make sure Google Sheets API is enabled
- Check API key restrictions

### **"Permission denied" Error:**
- API key might be restricted incorrectly
- Try removing restrictions temporarily
- Make sure you're using the right project

### **"Quota exceeded" Error:**
- You've hit the free tier limits
- Wait for limits to reset (usually 24 hours)
- Consider upgrading if needed (unlikely for personal use)

### **Game shows "Connection Failed":**
- Check your API key is correct
- Verify your Sheet ID is right
- Make sure your sheet has data in the correct format

---

## 🔧 Advanced Security Options

### Option 1: Service Account (Most Secure)
- Create a service account instead of API key
- Share your sheet with the service account email
- Use service account credentials in your game
- Best for production applications

### Option 2: OAuth 2.0 (User Authentication)
- Users sign in with their Google account
- Access their own sheets
- Most secure for multi-user applications
- More complex to implement

### Option 3: Domain Restrictions
- Restrict API key to your domain only
- Prevents unauthorized use
- Good for hosted applications

---

## 📊 Your Setup Summary

**What You'll Have:**
- ✅ Private Google Sheet (only you can access)
- ✅ Secure API key with restrictions
- ✅ Game that works with private data
- ✅ Full control over permissions
- ✅ Professional, secure setup

**What You Won't Have:**
- ❌ Public sheet that anyone can view
- ❌ Security concerns about data exposure
- ❌ Unrestricted access to your data

---

## 🎯 Quick Setup Checklist

1. ☐ Create Google Cloud project
2. ☐ Enable Google Sheets API
3. ☐ Create and restrict API key
4. ☐ Update game configuration with API key
5. ☐ Test connection
6. ☐ Play game with secure data!

---

## 🎉 Benefits of This Setup

- **🔒 Security:** Your data stays private
- **🎮 Functionality:** Game works perfectly
- **💰 Cost:** Free for personal use
- **🔧 Control:** Full control over access
- **📈 Scalable:** Can handle more users if needed
- **🏢 Professional:** Industry-standard approach

This is the same method used by professional applications and websites!

---

**Ready to set up your secure Google Sheets integration?** Follow the steps above and your game will work with private, secure data!