# 🔒 Private Google Sheets Setup Guide

This guide shows you how to set up a **truly private** Google Sheet for your game that only you can access and edit.

## 🛡️ Security Levels

### ❌ **NOT Private (Avoid)**
- Google Apps Script with "Anyone" access
- Public Google Sheets
- Sheets shared with "Anyone with the link"

### ✅ **Truly Private (Recommended)**
- Private Google Sheet + Google API Key
- Private Google Sheet + Service Account
- Private Google Sheet + Server-side proxy

## 🚀 **Method 1: Google API Key (Easiest)**

### Step 1: Create Your Private Sheet

1. **Go to Google Sheets**: https://sheets.google.com
2. **Create a new sheet** with this structure:

| A (Context) | B (Correct) | C (Incorrect) | D (Difficulty) |
|-------------|-------------|---------------|----------------|
| ສະບາຍດີ | ສະບາຍດີ | ສະບາຍດີີ | 1 |
| ຂອບໃຈ | ຂອບໃຈ | ຂອບຈັຍ | 1 |
| ລາວ | ລາວ | ລາຍ | 1 |

3. **Keep it private** (don't share with anyone)
4. **Copy the Sheet ID** from URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`

### Step 2: Get Google API Key

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Create a new project** or select existing
3. **Enable Google Sheets API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click "Enable"
4. **Create API Key**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key
5. **Restrict the API Key** (Optional but recommended):
   - Click on your API key
   - Under "API restrictions", select "Google Sheets API"
   - Under "Application restrictions", add your domain

### Step 3: Update Your Game

1. **Open `play.html`** in your code editor
2. **Find these lines**:
   ```javascript
   const GOOGLE_SHEET_ID = 'YOUR_PRIVATE_SHEET_ID_HERE';
   const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY_HERE';
   ```
3. **Replace with your actual values**:
   ```javascript
   const GOOGLE_SHEET_ID = '1jhdIOg9aqy7Jb28pqnz9I5F23uQ8HYyABvvMxqSzGr0';
   const GOOGLE_API_KEY = 'AIzaSyC6JCvbw_sipB5xiZtijndIXz9koAPQHXs';
   ```
4. **Save the file**

### Step 4: Test Your Setup

1. **Open your game** in the browser
2. **Check the console** (F12) for any errors
3. **The game should load words from your private sheet!**

## 🔐 **Method 2: Service Account (Most Secure)**

### Step 1: Create Service Account

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Go to "IAM & Admin" → "Service Accounts"**
3. **Click "Create Service Account"**
4. **Fill in details**:
   - Name: "LaoTypo Game Service"
   - Description: "Service account for LaoTypo game"
5. **Click "Create and Continue"**
6. **Skip roles for now, click "Done"**

### Step 2: Create Service Account Key

1. **Click on your service account**
2. **Go to "Keys" tab**
3. **Click "Add Key" → "Create new key"**
4. **Choose "JSON" format**
5. **Download the JSON file** (keep it secure!)

### Step 3: Share Sheet with Service Account

1. **Open your Google Sheet**
2. **Click "Share" button**
3. **Add the service account email** (from the JSON file)
4. **Give "Viewer" permission**
5. **Click "Send"**

### Step 4: Use Server-Side Proxy

1. **Download the proxy server**: `private-sheets-proxy.js`
2. **Install dependencies**:
   ```bash
   npm install express googleapis cors
   ```
3. **Update the credentials** in the proxy file
4. **Run the server**:
   ```bash
   node private-sheets-proxy.js
   ```
5. **Update your game** to use the proxy URL

## 🛡️ **Security Benefits**

### ✅ **What's Private:**
- Your Google Sheet is completely private
- Only you can edit the words
- API calls are authenticated
- No public access to your data

### ✅ **What's Secure:**
- API keys can be restricted to specific domains
- Service accounts have minimal permissions
- Server-side proxy adds extra security layer
- No data exposure through public URLs

## 📊 **Sheet Structure**

Your Google Sheet should have exactly this structure:

| Column A | Column B | Column C | Column D |
|----------|----------|----------|----------|
| Context  | Correct  | Incorrect| Difficulty|
| ສະບາຍດີ | ສະບາຍດີ | ສະບາຍດີີ | 1 |
| ຂອບໃຈ | ຂອບໃຈ | ຂອບຈັຍ | 1 |

- **Context**: What to display to the player
- **Correct**: The correct answer
- **Incorrect**: The incorrect answer
- **Difficulty**: 1=Easy, 2=Medium, 3=Hard

## 🔧 **Troubleshooting**

### **"Please configure your Google Sheet ID and API key"**
- Make sure you replaced the placeholder values in `play.html`

### **"HTTP error! status: 403"**
- Check that Google Sheets API is enabled
- Verify your API key is correct
- Make sure the sheet is not restricted

### **"No data found in Google Sheets"**
- Check that your sheet has data in columns A-D
- Verify the sheet ID is correct
- Make sure the sheet is accessible

### **"No valid words found"**
- Check that your sheet has the correct column headers
- Make sure all rows have data in columns A, B, and C

## 🎯 **Recommended Approach**

For maximum security and simplicity, I recommend **Method 1 (Google API Key)** because:

- ✅ Easy to set up
- ✅ Completely private
- ✅ No server required
- ✅ Direct integration
- ✅ Easy to manage

Your Google Sheet will be completely private, and only your game (with the API key) can access it!