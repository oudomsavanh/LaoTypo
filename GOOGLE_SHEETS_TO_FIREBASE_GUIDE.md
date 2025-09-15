# 🔥 Google Sheets to Firebase Export Guide

## Why Export to Firebase?
- ✅ **Better Security**: No public URLs, proper authentication
- ✅ **Better Performance**: Faster loading, no CORS issues
- ✅ **Real-time Updates**: Can update data without redeploying
- ✅ **Scalability**: Handles more users and data
- ✅ **Offline Support**: Works with your PWA

## Step 1: Export Your Google Sheets Data

### Option A: Manual Export (Quick)
1. **Open your Google Sheet**: https://docs.google.com/spreadsheets/d/1jhdIOg9aqy7Jb28pqnz9I5F23uQ8HYyABvvMxqSzGr0/
2. **File → Download → CSV**
3. **Save as**: `game_words.csv`

### Option B: Automated Export (Recommended)
Use the script I'll create below to automatically fetch and export.

## Step 2: Firebase Setup

### 1. Install Firebase Admin SDK
```bash
npm install firebase-admin
```

### 2. Get Firebase Service Account Key
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Rename it to `firebase-service-account.json`

## Step 3: Export Script

I'll create a script that:
1. Fetches your Google Sheets data
2. Converts it to Firestore format
3. Uploads to your Firebase project

## Step 4: Update Your Game Code

After export, update your game to fetch from Firestore instead of Google Sheets.

## Benefits After Migration:
- 🔒 **Private Data**: No public URLs
- ⚡ **Faster Loading**: Direct database access
- 🔄 **Real-time Updates**: Change data without redeploying
- 📱 **Better PWA**: Works offline with cached data
- 🛡️ **Secure**: Proper authentication and rules