# Firebase Setup Instructions for Lao Typo Game

## 🔥 Firebase Configuration

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `lao-typo-game` (or your preferred name)
4. Enable Google Analytics (optional)
5. Create project

### Step 2: Enable Realtime Database
1. In Firebase Console, go to "Realtime Database"
2. Click "Create Database"
3. Choose location (closest to your users)
4. Start in **test mode** for development
5. Security rules for production:
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "leaderboard": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

### Step 3: Get Configuration
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click "Web" icon to add web app
4. Register app with nickname: "Lao Typo Game"
5. Copy the firebaseConfig object

### Step 4: Update Configuration File
Replace the placeholder config in `firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:your-app-id"
};
```

## 📱 PWA Setup

### Icons Required
1. Create icons using `create-icons.html`
2. Save as `icon-192x192.png` and `icon-512x512.png`
3. Upload to your web server root

### Testing PWA
1. Serve files over HTTPS (required for PWA)
2. Open Chrome DevTools > Application > Service Workers
3. Check for PWA installability in DevTools > Application > Manifest

## 🚀 Deployment Options

### GitHub Pages (Free)
1. Repository is already configured
2. Enable GitHub Pages in repository settings
3. Access via: `https://yourusername.github.io/LaoTypo/testing.html`

### Netlify (Free)
1. Connect GitHub repository to Netlify
2. Auto-deploy on git push
3. Custom domain support

### Firebase Hosting (Free)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Run: `firebase login`
3. Run: `firebase init hosting`
4. Deploy: `firebase deploy`

## ⚡ Features Ready to Use

### Without Firebase
- ✅ Full game functionality
- ✅ Local personal records
- ✅ PWA offline capability
- ✅ Local leaderboard

### With Firebase
- ✅ Global leaderboard sync
- ✅ Cloud personal records backup
- ✅ Cross-device synchronization
- ✅ Real-time rankings

## 🧪 Testing

### Local Testing
```bash
# Serve locally with HTTPS (required for PWA)
npx serve -s . --ssl-cert
```

### Firebase Emulator
```bash
firebase emulators:start --only database
```

## 🔒 Security Notes

1. **API Key**: Firebase API keys for web are public by default
2. **Database Rules**: Always configure proper security rules before production
3. **User Privacy**: Game generates anonymous user IDs
4. **Data Validation**: Implement server-side validation for production

## 📊 Database Structure

```
lao-typo-game/
├── users/
│   └── {userId}/
│       ├── personalRecords/
│       │   ├── easy: { bestScore, bestAccuracy, gamesPlayed }
│       │   ├── medium: { bestScore, bestAccuracy, gamesPlayed }
│       │   └── hard: { bestScore, bestAccuracy, gamesPlayed }
│       └── gameHistory/
│           └── {gameId}: { score, accuracy, timestamp, difficulty }
└── leaderboard/
    ├── easy/
    ├── medium/
    └── hard/
        └── {entryId}: { userId, playerName, score, accuracy, timestamp }
```

## 🎯 Next Steps

1. **Configure Firebase** (replace placeholder config)
2. **Upload PWA icons** (use create-icons.html)
3. **Test on mobile** (install as PWA)
4. **Monitor analytics** (Firebase Analytics)
5. **Scale security rules** (production deployment)

## 🆘 Troubleshooting

### Common Issues
- **Service Worker not registering**: Check HTTPS requirement
- **Firebase not connecting**: Verify config and internet connection
- **PWA not installable**: Check manifest.json and icons
- **Offline not working**: Check service worker cache

### Debug Tools
- Chrome DevTools > Application tab
- Firebase Console > Database > Data
- Network tab for request monitoring
- Console for error messages

---

**Need Help?** Check Firebase documentation or create an issue in the repository.