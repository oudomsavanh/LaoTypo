# 📍 How to Find Firestore Rules in Firebase Console

## Step-by-Step Guide:

### 1. **Go to Firebase Console**
   - Open: https://console.firebase.google.com/project/laotypo-a8e80/overview
   - Or go to https://console.firebase.google.com and select your "laotypo-a8e80" project

### 2. **Find Firestore Database**
   
   Look in the LEFT SIDEBAR for one of these options:

   **Option A - If you see "Firestore Database":**
   ```
   📁 Build
      └── 🗄️ Firestore Database  <-- Click this
      └── 💾 Realtime Database
      └── 📦 Storage
      └── 🔧 Functions
   ```

   **Option B - If you see "Cloud Firestore":**
   ```
   📁 Build
      └── 🗄️ Cloud Firestore  <-- Click this
      └── 💾 Realtime Database
      └── 📦 Storage
   ```

### 3. **Navigate to Rules Tab**
   
   Once you're in Firestore Database:
   - You'll see tabs at the top: `Data | Rules | Indexes | Usage`
   - Click on **"Rules"** tab

### 4. **You Should See Something Like This:**
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if false;
       }
     }
   }
   ```

### 5. **Replace with Secure Rules**
   
   Delete everything in the editor and paste this:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Players collection - authenticated users can read/write their own data
       match /players/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Words collection - authenticated users can read, no writes from client
       match /words/{document=**} {
         allow read: if request.auth != null;
         allow write: if false;
       }
       
       // Game results - authenticated users can create, read all
       match /gameResults/{document=**} {
         allow read: if request.auth != null;
         allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
         allow update, delete: if false;
       }
       
       // Leaderboards - read only for authenticated users
       match /leaderboards/{document=**} {
         allow read: if request.auth != null;
         allow write: if false;
       }
       
       // User profiles
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

### 6. **Publish the Rules**
   - Click the **"Publish"** button
   - Wait for "Rules published successfully" message

## 🚨 Troubleshooting

### If you DON'T see Firestore Database:
1. You might not have set it up yet
2. Go to the main Firebase Console page
3. Look for "Cloud Firestore" or "Firestore Database" 
4. Click "Create database" if needed
5. Choose "Start in production mode"
6. Select your region (choose closest to your users)

### If Rules tab is not visible:
1. Make sure you're in Firestore Database, not Realtime Database
2. The URL should contain `/firestore/` not `/database/`

### Common Mistakes:
- ❌ Don't confuse "Realtime Database" with "Firestore Database" - they're different!
- ❌ Don't forget to click "Publish" after changing rules
- ❌ Don't leave test rules that allow read/write to everyone

## 📱 Mobile View
If you're on mobile, you might need to:
1. Click the hamburger menu (☰) to see the sidebar
2. Scroll down to find "Firestore Database"
3. The interface might look different but the steps are the same

## Need More Help?
- Firebase Firestore Rules Documentation: https://firebase.google.com/docs/firestore/security/get-started
- Video Tutorial: https://www.youtube.com/watch?v=eW5MdE3ZcAw

---

**Remember**: These rules are CRITICAL for security. Without them, anyone can read/write your entire database!