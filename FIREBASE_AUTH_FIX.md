# 🔧 Firebase Authentication Fix for game.laotypo.com

## 🚨 **Error: `auth/configuration-not-found`**

This error occurs because Firebase Authentication doesn't recognize your custom domain `game.laotypo.com` as an authorized domain.

## 🛠️ **Step-by-Step Fix**

### **Step 1: Add Domain to Firebase Auth**

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `laotypo-phase1`
3. **Navigate to Authentication**:
   - Click "Authentication" in the left sidebar
   - Click "Settings" tab
   - Click "Authorized domains" section
4. **Add your domain**:
   - Click "Add domain"
   - Enter: `game.laotypo.com`
   - Click "Add"
5. **Verify the domain is added** to the list

### **Step 2: Check Current Authorized Domains**

Your authorized domains should include:
- `localhost` (for local development)
- `laotypo-phase1.firebaseapp.com` (default Firebase domain)
- `game.laotypo.com` (your custom domain) ← **This is what you need to add**

### **Step 3: Test the Fix**

1. **Go to**: https://game.laotypo.com/admin-import
2. **Click "Sign in with Google"**
3. **Check the console logs** for detailed error information
4. **The sign-in should work** after adding the domain

## 🔍 **Alternative Solutions**

### **Option 1: Use Firebase Hosting Domain**

If you're using Firebase Hosting, you can also add:
- `laotypo-phase1.web.app`
- `laotypo-phase1.firebaseapp.com`

### **Option 2: Check Domain Configuration**

Make sure your custom domain is properly configured:
1. **DNS settings** point to Firebase Hosting
2. **SSL certificate** is properly configured
3. **Domain verification** is complete

### **Option 3: Temporary Workaround**

If you need immediate access, you can temporarily use the Firebase domain:
- Go to: `https://laotypo-phase1.web.app/admin-import`
- This should work without additional configuration

## 🐛 **Debugging Steps**

### **Check Browser Console**

1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Look for Firebase errors**
4. **Check Network tab** for failed requests

### **Common Error Codes**

- `auth/configuration-not-found`: Domain not authorized
- `auth/unauthorized-domain`: Domain not in authorized list
- `auth/operation-not-allowed`: Sign-in method disabled
- `auth/popup-blocked`: Popup blocked by browser

### **Test with Updated Admin Page**

The updated `admin-import.html` now includes:
- ✅ Better error logging
- ✅ Domain information display
- ✅ Specific error solutions
- ✅ Detailed debugging information

## 🎯 **Expected Result**

After adding `game.laotypo.com` to authorized domains:

1. **Sign-in button works** without errors
2. **Google popup opens** successfully
3. **Authentication completes** properly
4. **Admin import functionality** becomes available

## 🔒 **Security Note**

Only add domains you own and trust to the authorized domains list. This prevents unauthorized access to your Firebase project.

## 📞 **Still Having Issues?**

If the problem persists:

1. **Check Firebase project settings**
2. **Verify domain ownership**
3. **Clear browser cache and cookies**
4. **Try incognito/private browsing mode**
5. **Check for browser extensions blocking popups**

The updated admin page will provide detailed error information to help diagnose any remaining issues.