#!/usr/bin/env node

/**
 * Import gameWords into Firestore from a JSON file.
 *
 * Usage:
 *   1) Install deps:   npm i firebase-admin
 *   2) Set creds:      export GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json
 *   3) Run:            node import-gamewords.js [path/to/firebase-manual-import.json]
 *
 * Input JSON shape (object):
 * {
 *   "word_0001": {
 *     "context": "...",
 *     "correct": "...",
 *     "wrong"|"incorrect": "...",
 *     "difficulty": 1|2|3|"1"|"2"|"3",
 *     "order": 1
 *   },
 *   ...
 * }
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

function exitWith(message, code = 1) {
  console.error(message);
  process.exit(code);
}

// Resolve input file
const inputPath = process.argv[2] || 'firebase-manual-import.json';
const resolvedPath = path.resolve(process.cwd(), inputPath);

if (!fs.existsSync(resolvedPath)) {
  exitWith(`Input file not found: ${resolvedPath}\nPass a path like: node import-gamewords.js path/to/firebase-manual-import.json`);
}

// Initialize Firebase Admin using Application Default Credentials
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
} catch (err) {
  exitWith(`Failed to initialize Firebase Admin.\nSet GOOGLE_APPLICATION_CREDENTIALS to your service account JSON.\nError: ${err.message}`);
}

const db = admin.firestore();

async function importGameWords() {
  console.log(`Reading input from: ${resolvedPath}`);
  const raw = fs.readFileSync(resolvedPath, 'utf8');
  /** @type {Record<string, any>} */
  const data = JSON.parse(raw);

  const collectionRef = db.collection('gameWords');
  const BATCH_LIMIT = 400; // Leave headroom under 500

  let batch = db.batch();
  let opCount = 0;
  let docCount = 0;

  const entries = Object.entries(data);
  if (entries.length === 0) {
    exitWith('Input JSON has no documents.');
  }

  // Optional: clean collection before import when env var set
  if (process.env.CLEAN_FIRST === 'true') {
    console.log('CLEAN_FIRST=true -> Deleting existing docs in gameWords (shallow)...');
    const snap = await collectionRef.get();
    let delBatch = db.batch();
    let delCount = 0;
    for (const doc of snap.docs) {
      delBatch.delete(doc.ref);
      delCount++;
      if (delCount % BATCH_LIMIT === 0) {
        await delBatch.commit();
        delBatch = db.batch();
        console.log(`Deleted ${delCount} docs...`);
      }
    }
    if (delCount % BATCH_LIMIT !== 0) await delBatch.commit();
    console.log(`Deleted ${delCount} docs from gameWords.`);
  }

  const nowTs = admin.firestore.FieldValue.serverTimestamp();

  for (const [docId, docData] of entries) {
    // Normalize fields
    const difficultyNum = typeof docData.difficulty === 'number'
      ? docData.difficulty
      : parseInt(String(docData.difficulty ?? '1'), 10);

    const normalized = {
      context: String(docData.context || '').trim(),
      correct: String(docData.correct || '').trim(),
      incorrect: String((docData.incorrect ?? docData.wrong ?? '')).trim(),
      difficulty: Number.isFinite(difficultyNum) && [1,2,3].includes(difficultyNum) ? difficultyNum : 1,
      order: typeof docData.order === 'number' ? docData.order : null,
      createdAt: nowTs,
      updatedAt: nowTs,
    };

    if (!normalized.context || !normalized.correct || !normalized.incorrect) {
      console.warn(`Skipping ${docId}: missing required fields (context/correct/incorrect)`);
      continue;
    }

    const ref = collectionRef.doc(docId);
    batch.set(ref, normalized, { merge: true });
    opCount++;
    docCount++;

    if (opCount >= BATCH_LIMIT) {
      await batch.commit();
      console.log(`Committed ${docCount} documents so far...`);
      batch = db.batch();
      opCount = 0;
    }
  }

  if (opCount > 0) {
    await batch.commit();
  }

  console.log(`Import complete: ${docCount} documents written to gameWords.`);
}

importGameWords().then(() => process.exit(0)).catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});

