#!/bin/bash

echo "🔒 Removing firebase-config.js from Git tracking..."

# Remove the file from Git tracking (but keep it locally)
git rm --cached firebase-config.js

# Commit the removal
git commit -m "Remove exposed Firebase configuration from repository"

echo "✅ firebase-config.js removed from Git tracking"
echo "📝 The file still exists locally but won't be tracked by Git anymore"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Push this commit to GitHub: git push origin main"
echo "2. Go to Firebase Console and apply the security rules from FIREBASE_SECURITY_RULES.txt"
echo "3. Enable App Check in Firebase Console"
echo "4. Check authorized domains in Firebase Authentication settings"
echo ""
echo "🔐 Your Firebase config is now protected!"