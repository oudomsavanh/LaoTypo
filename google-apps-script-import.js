/**
 * Google Apps Script to Import Data to Firebase Firestore
 * 
 * Instructions:
 * 1. Go to https://script.google.com/
 * 2. Create a new project
 * 3. Replace the default code with this script
 * 4. Update the Firebase config below
 * 5. Run the importData() function
 */

// Firebase configuration - UPDATE THESE VALUES
const FIREBASE_CONFIG = {
  projectId: 'laotypo-a8e80',
  // You'll need to get this from Firebase Console → Project Settings → Service Accounts
  serviceAccountKey: {
    // Copy the entire service account JSON here
    "type": "service_account",
    "project_id": "laotypo-a8e80",
    "private_key_id": "YOUR_PRIVATE_KEY_ID",
    "private_key": "YOUR_PRIVATE_KEY",
    "client_email": "YOUR_CLIENT_EMAIL",
    "client_id": "YOUR_CLIENT_ID",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token"
  }
};

// Your game words data (first 10 entries as example)
const GAME_WORDS_DATA = [
  {
    context: "ເຈົ້າ___ແທ້",
    correct: "ໜ້າຮັກ", 
    wrong: "ນ່າຮັກ",
    difficulty: "1",
    order: 1
  },
  {
    context: "ໂຈດນີ້___ໂພດ",
    correct: "ຍາກ",
    wrong: "ຢາກ", 
    difficulty: "2",
    order: 2
  },
  {
    context: "ຍ່າງຂຶ້ນ___",
    correct: "ຂັ້ນໄດ",
    wrong: "ບັນໄດ",
    difficulty: "2", 
    order: 3
  }
  // Add more entries here...
];

/**
 * Main function to import data to Firebase
 */
function importData() {
  try {
    console.log('🔥 Starting Firebase import...');
    
    // Get Firebase access token
    const accessToken = getFirebaseAccessToken();
    
    // Import each word
    GAME_WORDS_DATA.forEach((word, index) => {
      const docId = `word_${String(index + 1).padStart(4, '0')}`;
      importWordToFirestore(docId, word, accessToken);
      
      // Add delay to avoid rate limiting
      Utilities.sleep(100);
    });
    
    console.log('✅ Import completed successfully!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

/**
 * Get Firebase access token using service account
 */
function getFirebaseAccessToken() {
  const jwt = createJWT();
  
  const response = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    payload: {
      'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      'assertion': jwt
    }
  });
  
  const data = JSON.parse(response.getContentText());
  return data.access_token;
}

/**
 * Create JWT token for Firebase authentication
 */
function createJWT() {
  const header = {
    "alg": "RS256",
    "typ": "JWT"
  };
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    "iss": FIREBASE_CONFIG.serviceAccountKey.client_email,
    "scope": "https://www.googleapis.com/auth/cloud-platform",
    "aud": "https://oauth2.googleapis.com/token",
    "exp": now + 3600,
    "iat": now
  };
  
  const encodedHeader = Utilities.base64EncodeWebSafe(JSON.stringify(header)).replace(/=+$/, '');
  const encodedPayload = Utilities.base64EncodeWebSafe(JSON.stringify(payload)).replace(/=+$/, '');
  
  const signatureInput = encodedHeader + '.' + encodedPayload;
  const signature = Utilities.computeRsaSha256Signature(signatureInput, FIREBASE_CONFIG.serviceAccountKey.private_key);
  const encodedSignature = Utilities.base64EncodeWebSafe(signature).replace(/=+$/, '');
  
  return signatureInput + '.' + encodedSignature;
}

/**
 * Import a single word to Firestore
 */
function importWordToFirestore(docId, wordData, accessToken) {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/gameWords/${docId}`;
  
  const document = {
    fields: {
      context: { stringValue: wordData.context },
      correct: { stringValue: wordData.correct },
      wrong: { stringValue: wordData.wrong },
      difficulty: { stringValue: wordData.difficulty },
      order: { integerValue: wordData.order },
      createdAt: { timestampValue: new Date().toISOString() },
      updatedAt: { timestampValue: new Date().toISOString() }
    }
  };
  
  const response = UrlFetchApp.fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(document)
  });
  
  if (response.getResponseCode() === 200) {
    console.log(`✅ Imported: ${docId}`);
  } else {
    console.error(`❌ Failed to import ${docId}:`, response.getContentText());
  }
}

/**
 * Test function to verify Firebase connection
 */
function testConnection() {
  try {
    const accessToken = getFirebaseAccessToken();
    console.log('✅ Firebase connection successful!');
    console.log('Access token:', accessToken.substring(0, 20) + '...');
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
  }
}