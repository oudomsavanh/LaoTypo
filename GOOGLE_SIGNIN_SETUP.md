# 🔧 Google Sign-In Setup for Firebase Authentication

## 🚨 **Error: `auth/operation-not-allowed`**

This error means Google Sign-In is not enabled in your Firebase project.

## 🛠️ **Step-by-Step Fix**

### **Step 1: Enable Google Sign-In Provider**

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `laotypo-phase1`
3. **Navigate to Authentication**:
   - Click "Authentication" in the left sidebar
   - Click "Sign-in method" tab
4. **Enable Google Provider**:
   - Find "Google" in the providers list
   - Click on the "Google" row
   - Toggle "Enable" switch to **ON**
   - Enter your project support email: `crews@laotypo.com`
   - Click "Save"

### **Step 2: Configure OAuth Consent Screen**

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Select your project**: `laotypo-phase1`
3. **Navigate to OAuth Consent Screen**:
   - Go to "APIs & Services" → "OAuth consent screen"
4. **Configure the consent screen**:
   - Choose "External" user type
   - Fill in required fields:
     - **App name**: `LaoTypo Game Admin`
     - **User support email**: `crews@laotypo.com`
     - **Developer contact information**: `crews@laotypo.com`
   - Click "Save and Continue"
5. **Add Scopes** (if prompted):
   - Click "Add or Remove Scopes"
   - Add these scopes:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
   - Click "Update" → "Save and Continue"
6. **Add Test Users** (if needed):
   - Add `crews@laotypo.com` as a test user
   - Click "Save and Continue"

### **Step 3: Add Authorized Domains**

1. **In Firebase Console** → **Authentication** → **Settings** → **Authorized domains**
2. **Add these domains**:
   - `game.laotypo.com`
   - `laotypo-phase1.web.app`
   - `laotypo-phase1.firebaseapp.com`
   - `localhost` (for local testing)

### **Step 4: Configure OAuth 2.0 Client IDs**

1. **In Google Cloud Console** → **APIs & Services** → **Credentials**
2. **Find your OAuth 2.0 Client ID**
3. **Add authorized JavaScript origins**:
   - `https://game.laotypo.com`
   - `https://laotypo-phase1.web.app`
   - `https://laotypo-phase1.firebaseapp.com`
   - `http://localhost:5000` (for local testing)
4. **Add authorized redirect URIs**:
   - `https://laotypo-phase1.firebaseapp.com/__/auth/handler`
   - `https://laotypo-phase1.web.app/__/auth/handler`
5. **Save the changes**

## 🧪 **Testing the Fix**

### **Test Steps:**

1. **Go to**: https://game.laotypo.com/admin-import
2. **Click "Sign in with Google"**
3. **Check the console logs** for any remaining errors
4. **The Google popup should open** and allow sign-in

### **Expected Result:**

- ✅ Google Sign-In popup opens
- ✅ Authentication completes successfully
- ✅ User email appears in the interface
- ✅ Import functionality becomes available

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **"This app isn't verified"**:
   - This is normal for development
   - Click "Advanced" → "Go to [app name] (unsafe)"
   - Or add your domain to Google's verified domains

2. **"Access blocked"**:
   - Check OAuth consent screen configuration
   - Ensure your email is in test users list
   - Verify authorized domains are correct

3. **"Invalid client"**:
   - Check OAuth 2.0 Client ID configuration
   - Verify authorized origins and redirect URIs

### **Debug Information:**

The updated admin page now shows:
- ✅ Current domain information
- ✅ Firebase configuration details
- ✅ Specific error solutions
- ✅ Step-by-step troubleshooting

## 🔒 **Security Notes**

- Only enable Google Sign-In if you need it
- Use the minimum required scopes
- Regularly review authorized domains
- Monitor authentication logs for suspicious activity

## 📞 **Still Having Issues?**

If problems persist:

1. **Check Firebase project settings**
2. **Verify Google Cloud Console configuration**
3. **Clear browser cache and cookies**
4. **Try incognito/private browsing mode**
5. **Check browser console for detailed errors**

The updated admin page will provide specific guidance based on the error you encounter.